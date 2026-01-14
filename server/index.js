import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import SessionManager from './session-manager.js';
import Database from './database.js';
import ComplianceEngine from './compliance-engine.js';
import LeadQualifier from './lead-qualifier.js';
import RouterEngine from './router-engine.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.VITE_API_URL || 'http://145.223.30.23:5173',
        methods: ['GET', 'POST'],
    },
});

// Middleware
app.use(cors());
app.use(express.json());

// Inicializa serviços
const db = new Database();
const sessionManager = new SessionManager(io, db);
const complianceEngine = new ComplianceEngine(db);
const leadQualifier = new LeadQualifier(db);
const routerEngine = new RouterEngine(db);

// Cleanup de roteamentos antigos a cada hora
setInterval(() => routerEngine.cleanup(), 60 * 60 * 1000);

// ==================== API ROUTES ====================

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ==================== VENDORS ====================

// Listar todos os vendedores
app.get('/api/vendors', async (req, res) => {
    try {
        const vendors = await db.getAllVendors();
        const activeSessions = sessionManager.getAllSessions();

        // Merge com sessões ativas
        const vendorsWithStatus = vendors.map(vendor => {
            const session = activeSessions.find(s => s.vendorId === vendor.id);
            return {
                ...vendor,
                status: session?.status || vendor.status,
            };
        });

        res.json(vendorsWithStatus);
    } catch (error) {
        console.error('[API] Error fetching vendors:', error);
        res.status(500).json({ error: 'Failed to fetch vendors' });
    }
});

// Criar novo vendedor
app.post('/api/vendors', async (req, res) => {
    try {
        const { name, phone, email } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        const vendorId = `vendor_${Date.now()}`;

        // Cria no banco
        await db.createVendor(vendorId, name, phone, email);

        // Inicia sessão
        await sessionManager.createSession(vendorId, name);

        res.json({ id: vendorId, name, status: 'connecting' });
    } catch (error) {
        console.error('[API] Error creating vendor:', error);
        res.status(500).json({ error: 'Failed to create vendor' });
    }
});

// Deletar vendedor
app.delete('/api/vendors/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Destrói sessão
        await sessionManager.destroySession(id);

        // Remove do banco
        await db.deleteVendor(id);

        res.json({ success: true });
    } catch (error) {
        console.error('[API] Error deleting vendor:', error);
        res.status(500).json({ error: 'Failed to delete vendor' });
    }
});

// ==================== LEADS ====================

app.get('/api/leads', async (req, res) => {
    try {
        const leads = await db.getAllLeads();
        res.json(leads);
    } catch (error) {
        console.error('[API] Error fetching leads:', error);
        res.status(500).json({ error: 'Failed to fetch leads' });
    }
});

app.patch('/api/leads/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Atualiza lead no banco
        const fields = [];
        const values = [];

        if (updates.name !== undefined) {
            fields.push('name = ?');
            values.push(updates.name);
        }
        if (updates.email !== undefined) {
            fields.push('email = ?');
            values.push(updates.email);
        }
        if (updates.company !== undefined) {
            fields.push('company = ?');
            values.push(updates.company);
        }
        if (updates.tags !== undefined) {
            fields.push('tags = ?');
            values.push(updates.tags);
        }

        if (fields.length > 0) {
            fields.push('updated_at = CURRENT_TIMESTAMP');
            values.push(id);

            await db.query(
                `UPDATE leads SET ${fields.join(', ')} WHERE id = ?`,
                values
            );
        }

        res.json({ success: true });
    } catch (error) {
        console.error('[API] Error updating lead:', error);
        res.status(500).json({ error: 'Failed to update lead' });
    }
});

// ==================== MESSAGES ====================

app.get('/api/messages', async (req, res) => {
    try {
        const { conversationId, limit = 50 } = req.query;

        if (!conversationId) {
            return res.status(400).json({ error: 'conversationId is required' });
        }

        const messages = await db.getMessagesByConversation(conversationId, parseInt(limit));
        res.json(messages);
    } catch (error) {
        console.error('[API] Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// ==================== ALERTS ====================

app.get('/api/alerts', async (req, res) => {
    try {
        const { vendorId, severity, status, limit = 100 } = req.query;

        const alerts = await db.getAlerts({
            vendorId,
            severity,
            status,
            limit: parseInt(limit),
        });

        res.json(alerts);
    } catch (error) {
        console.error('[API] Error fetching alerts:', error);
        res.status(500).json({ error: 'Failed to fetch alerts' });
    }
});

app.patch('/api/alerts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;

        await db.updateAlert(id, status, notes);

        res.json({ success: true });
    } catch (error) {
        console.error('[API] Error updating alert:', error);
        res.status(500).json({ error: 'Failed to update alert' });
    }
});

// ==================== DASHBOARD STATS ====================

app.get('/api/stats', async (req, res) => {
    try {
        const vendors = await db.getAllVendors();
        const leads = await db.getAllLeads();
        const alerts = await db.getAlerts({ status: 'pending' });
        const activeSessions = sessionManager.getAllSessions();

        const stats = {
            totalVendors: vendors.length,
            activeVendors: activeSessions.filter(s => s.status === 'online').length,
            totalLeads: leads.length,
            hotLeads: leads.filter(l => l.temperature === 'hot').length,
            pendingAlerts: alerts.length,
            totalMessages: 0, // TODO: Implementar contagem de mensagens
        };

        res.json(stats);
    } catch (error) {
        console.error('[API] Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// ==================== MESSAGE HANDLERS ====================

// Registra handler de compliance
sessionManager.onMessage(async (messageData) => {
    const { vendorId, direction, text, remoteJid } = messageData;

    // Só analisa mensagens enviadas pelos vendedores
    if (direction === 'outbound') {
        const violations = await complianceEngine.analyze(text, vendorId);

        if (violations.length > 0) {
            // Busca lead
            const lead = await db.getLeadByPhone(remoteJid);

            for (const violation of violations) {
                // Cria alerta
                const alertId = await db.createAlert({
                    vendorId,
                    leadId: lead?.id,
                    messageId: messageData.msg.key.id,
                    type: violation.type,
                    severity: violation.severity,
                    title: violation.title,
                    description: violation.description,
                    context: { message: text },
                });

                // Emite alerta para o frontend
                io.emit('new-alert', {
                    id: alertId,
                    vendorId,
                    vendorName: messageData.vendorName,
                    type: violation.type,
                    severity: violation.severity,
                    title: violation.title,
                    description: violation.description,
                    timestamp: new Date().toISOString(),
                });
            }
        }
    }

    // Qualifica leads de mensagens recebidas (inbound)
    if (direction === 'inbound') {
        try {
            // Busca lead
            const lead = await db.getLeadByPhone(remoteJid);

            if (lead) {
                // Busca histórico de mensagens
                const conversation = await db.getConversationByChatId(remoteJid);

                if (conversation) {
                    const messages = await db.getMessagesByConversation(conversation.id, 20);

                    // Qualifica lead a cada 3 mensagens
                    if (messages.length % 3 === 0) {
                        console.log(`[AI] Qualificando lead ${lead.id}...`);

                        const qualification = await leadQualifier.qualify(lead.id, messages);

                        console.log(`[AI] Lead ${lead.id}: ${qualification.score}/100 (${qualification.temperature}) - ${qualification.intent}`);

                        // Emite atualização para o frontend
                        io.emit('lead-updated', {
                            leadId: lead.id,
                            score: qualification.score,
                            temperature: qualification.temperature,
                            intent: qualification.intent,
                            urgency: qualification.urgency
                        });

                        // Se lead está quente e não foi roteado ainda, roteia automaticamente
                        if (qualification.shouldRoute && !routerEngine.isRouted(lead.id)) {
                            const routing = await routerEngine.routeToVendor(lead.id, qualification);

                            if (routing) {
                                console.log(`[AI] 🔥 Lead roteado para ${routing.vendorName}`);

                                // Notifica vendedor via WhatsApp
                                await routerEngine.notifyVendor(sessionManager, routing.vendorId, lead, qualification);

                                // Notifica frontend
                                io.emit('lead-routed', {
                                    leadId: lead.id,
                                    vendorId: routing.vendorId,
                                    vendorName: routing.vendorName,
                                    intent: qualification.intent,
                                    reason: routing.reason
                                });
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error('[AI] Erro ao qualificar lead:', error);
        }
    }
});

// ==================== WEBSOCKET ====================

io.on('connection', (socket) => {
    console.log('[WebSocket] Client connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('[WebSocket] Client disconnected:', socket.id);
    });
});

// ==================== START SERVER ====================

const PORT = process.env.PORT || 5173;

httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Zapper Monitor Server`);
    console.log(`📡 API: http://145.223.30.23:${PORT}`);
    console.log(`🔌 WebSocket: ws://145.223.30.23:${PORT}`);
    console.log(`\n✅ Server is running!\n`);
});

// Carrega vendedores existentes e reconecta
(async () => {
    try {
        const vendors = await db.getAllVendors();
        console.log(`[Startup] Found ${vendors.length} vendors in database`);

        for (const vendor of vendors) {
            if (vendor.is_active) {
                console.log(`[Startup] Reconnecting ${vendor.name}...`);
                await sessionManager.createSession(vendor.id, vendor.name);
            }
        }
    } catch (error) {
        console.error('[Startup] Error loading vendors:', error);
    }
})();
