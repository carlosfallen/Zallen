import dotenv from 'dotenv';
import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class DatabaseManager {
    constructor() {
        this.accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
        this.databaseId = process.env.CLOUDFLARE_DATABASE_ID;
        this.apiToken = process.env.CLOUDFLARE_API_TOKEN;
        this.baseUrl = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/d1/database/${this.databaseId}`;

        // Flags de controle
        this.useCloudflare = !!(this.accountId && this.databaseId && this.apiToken);
        this.localDb = null;
        this.initialized = false;

        if (this.useCloudflare) {
            console.log('🌐 [Database] Configurado para usar Cloudflare D1');
        } else {
            console.log('💾 [Database] Credenciais do Cloudflare não encontradas, usando SQLite local');
            this._initLocalDb();
        }
    }

    _initLocalDb() {
        try {
            const dbPath = join(__dirname, 'database.sqlite');
            this.localDb = new Database(dbPath);
            console.log(`💾 [Database] SQLite local inicializado: ${dbPath}`);
        } catch (error) {
            console.error('❌ [Database] Erro ao inicializar SQLite local:', error);
            throw error;
        }
    }

    async query(sql, params = []) {
        // Se está usando Cloudflare D1
        if (this.useCloudflare && !this.localDb) {
            try {
                const response = await fetch(`${this.baseUrl}/query`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.apiToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ sql, params }),
                });

                const data = await response.json();

                if (!data.success) {
                    const errorMsg = data.errors?.[0]?.message || 'Database query failed';

                    // Se erro de tabela não existente, tenta fallback
                    if (errorMsg.includes('no such table') || errorMsg.includes('SQLITE_ERROR')) {
                        console.warn('⚠️  [Database] Cloudflare D1 não inicializado. Execute: npm run init-d1');
                        console.warn('⚠️  [Database] Alternando para SQLite local como fallback...');
                        this._initLocalDb();
                        return this.query(sql, params); // Retry com SQLite local
                    }

                    throw new Error(errorMsg);
                }

                return data.result[0];
            } catch (error) {
                // Se erro de rede ou API, usa fallback
                if (error.message.includes('fetch') || error.message.includes('network')) {
                    console.warn('⚠️  [Database] Erro de conexão com Cloudflare D1, usando SQLite local');
                    if (!this.localDb) {
                        this._initLocalDb();
                    }
                    return this.query(sql, params); // Retry com SQLite local
                }

                console.error('[Database] Query error:', error);
                throw error;
            }
        }

        // Usa SQLite local
        if (this.localDb) {
            try {
                // Determina se é SELECT ou outro tipo de query
                const isSelect = sql.trim().toUpperCase().startsWith('SELECT');

                if (isSelect) {
                    const stmt = this.localDb.prepare(sql);
                    const results = stmt.all(...params);
                    return { results };
                } else {
                    const stmt = this.localDb.prepare(sql);
                    const info = stmt.run(...params);
                    return {
                        results: [],
                        meta: {
                            changes: info.changes,
                            last_row_id: info.lastInsertRowid
                        }
                    };
                }
            } catch (error) {
                console.error('[Database] SQLite query error:', error);
                throw error;
            }
        }

        throw new Error('No database available');
    }

    // ==================== VENDORS ====================

    async createVendor(id, name, phone = null, email = null) {
        await this.query(
            `INSERT INTO vendors (id, name, phone, email, status) VALUES (?, ?, ?, ?, 'disconnected')`,
            [id, name, phone, email]
        );
    }

    async getVendor(id) {
        const result = await this.query('SELECT * FROM vendors WHERE id = ?', [id]);
        return result.results[0];
    }

    async getAllVendors() {
        const result = await this.query('SELECT * FROM vendors ORDER BY created_at DESC');
        return result.results || [];
    }

    async updateVendorStatus(id, status) {
        await this.query(
            'UPDATE vendors SET status = ?, last_seen = CURRENT_TIMESTAMP WHERE id = ?',
            [status, id]
        );
    }

    async deleteVendor(id) {
        await this.query('DELETE FROM vendors WHERE id = ?', [id]);
    }

    // ==================== MESSAGES ====================

    async saveMessage({ vendorId, remoteJid, messageId, direction, text, timestamp }) {
        // Busca ou cria lead
        let lead = await this.getLeadByPhone(remoteJid);
        if (!lead) {
            await this.createLead(remoteJid, null, null);
            lead = await this.getLeadByPhone(remoteJid);
        }

        // Busca ou cria conversa
        let conversation = await this.getConversationByChatId(remoteJid);
        if (!conversation) {
            await this.createConversation(lead.id, remoteJid);
            conversation = await this.getConversationByChatId(remoteJid);
        }

        // Salva mensagem
        await this.query(
            `INSERT INTO messages (conversation_id, message_id, direction, message_text, vendor_id, created_at) 
       VALUES (?, ?, ?, ?, ?, ?)`,
            [conversation.id, messageId, direction, text, vendorId, timestamp.toISOString()]
        );

        // Atualiza conversa
        await this.query(
            'UPDATE conversations SET last_message_at = ?, message_count = message_count + 1 WHERE id = ?',
            [timestamp.toISOString(), conversation.id]
        );
    }

    async getMessagesByConversation(conversationId, limit = 50) {
        const result = await this.query(
            'SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at DESC LIMIT ?',
            [conversationId, limit]
        );
        return result.results || [];
    }

    // ==================== LEADS ====================

    async createLead(phone, name = null, email = null) {
        await this.query(
            'INSERT INTO leads (phone, name, email) VALUES (?, ?, ?)',
            [phone, name, email]
        );
    }

    async getLeadByPhone(phone) {
        const result = await this.query('SELECT * FROM leads WHERE phone = ?', [phone]);
        return result.results[0];
    }

    async getAllLeads() {
        const result = await this.query('SELECT * FROM leads ORDER BY created_at DESC');
        return result.results || [];
    }

    async updateLeadScore(leadId, score, temperature, intent) {
        await this.query(
            'UPDATE leads SET score = ?, temperature = ?, intent = ? WHERE id = ?',
            [score, temperature, intent, leadId]
        );
    }

    async assignLeadToVendor(leadId, vendorId) {
        await this.query(
            'UPDATE leads SET assigned_vendor_id = ?, routed_at = CURRENT_TIMESTAMP WHERE id = ?',
            [vendorId, leadId]
        );
    }

    // ==================== CONVERSATIONS ====================

    async createConversation(leadId, chatId) {
        await this.query(
            'INSERT INTO conversations (lead_id, chat_id) VALUES (?, ?)',
            [leadId, chatId]
        );
    }

    async getConversationByChatId(chatId) {
        const result = await this.query('SELECT * FROM conversations WHERE chat_id = ?', [chatId]);
        return result.results[0];
    }

    // ==================== ALERTS ====================

    async createAlert({ vendorId, leadId, messageId, type, severity, title, description, context }) {
        await this.query(
            `INSERT INTO alerts (vendor_id, lead_id, message_id, type, severity, title, description, context) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [vendorId, leadId, messageId, type, severity, title, description, JSON.stringify(context)]
        );

        // Retorna o ID do alerta criado
        const result = await this.query('SELECT last_insert_rowid() as id');
        return result.results[0].id;
    }

    async getAlerts(filters = {}) {
        let sql = 'SELECT a.*, v.name as vendor_name FROM alerts a LEFT JOIN vendors v ON a.vendor_id = v.id WHERE 1=1';
        const params = [];

        if (filters.vendorId) {
            sql += ' AND a.vendor_id = ?';
            params.push(filters.vendorId);
        }

        if (filters.severity) {
            sql += ' AND a.severity = ?';
            params.push(filters.severity);
        }

        if (filters.status) {
            sql += ' AND a.status = ?';
            params.push(filters.status);
        }

        sql += ' ORDER BY a.created_at DESC';

        if (filters.limit) {
            sql += ' LIMIT ?';
            params.push(filters.limit);
        }

        const result = await this.query(sql, params);
        return result.results || [];
    }

    async updateAlert(id, status, notes = null) {
        await this.query(
            'UPDATE alerts SET status = ?, notes = ?, resolved_at = CURRENT_TIMESTAMP WHERE id = ?',
            [status, notes, id]
        );
    }

    // ==================== ROUTING ====================

    async logRouting(leadId, fromVendorId, toVendorId, reason, leadScore) {
        await this.query(
            'INSERT INTO routing_logs (lead_id, from_vendor_id, to_vendor_id, reason, lead_score) VALUES (?, ?, ?, ?, ?)',
            [leadId, fromVendorId, toVendorId, reason, leadScore]
        );
    }

    async getRoutingHistory(leadId) {
        const result = await this.query(
            'SELECT * FROM routing_logs WHERE lead_id = ? ORDER BY created_at DESC',
            [leadId]
        );
        return result.results || [];
    }
}

export default DatabaseManager;
