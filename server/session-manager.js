import { default as makeWASocket, DisconnectReason, useMultiFileAuthState, makeCacheableSignalKeyStore, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import P from 'pino';
import QRCode from 'qrcode';

class SessionManager {
    constructor(io, database) {
        this.io = io; // Socket.io instance
        this.db = database;
        this.sessions = new Map(); // vendorId -> { sock, status, name }
        this.messageHandlers = [];
    }

    /**
     * Registra um handler para processar mensagens
     */
    onMessage(handler) {
        this.messageHandlers.push(handler);
    }

    /**
     * Cria uma nova sessão para um vendedor
     */
    async createSession(vendorId, vendorName) {
        try {
            console.log(`[SessionManager] Criando sessão para ${vendorName} (${vendorId})`);

            // Carrega ou cria credenciais
            const { state, saveCreds } = await useMultiFileAuthState(`./auth/session-${vendorId}`);
            const { version } = await fetchLatestBaileysVersion();

            // Cria socket Baileys
            const sock = makeWASocket({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, P({ level: 'silent' })),
                },
                version,
                printQRInTerminal: false,
                logger: P({ level: 'silent' }),
                browser: ['Zapper Monitor', 'Chrome', '1.0.0'],
                markOnlineOnConnect: false, // Modo stealth
            });

            // Evento: Salvar credenciais
            sock.ev.on('creds.update', saveCreds);

            // Evento: Atualização de conexão
            sock.ev.on('connection.update', async (update) => {
                const { connection, lastDisconnect, qr } = update;

                // QR Code gerado
                if (qr) {
                    console.log(`[SessionManager] QR Code gerado para ${vendorName}`);
                    const qrBase64 = await QRCode.toDataURL(qr);
                    this.io.emit(`qr-${vendorId}`, { qr: qrBase64 });

                    // Atualiza status no banco
                    await this.db.updateVendorStatus(vendorId, 'connecting');
                }

                // Conectado
                if (connection === 'open') {
                    console.log(`[SessionManager] ${vendorName} conectado!`);
                    this.sessions.set(vendorId, { sock, status: 'online', name: vendorName });

                    // Atualiza status
                    await this.db.updateVendorStatus(vendorId, 'online');
                    this.io.emit(`status-${vendorId}`, { status: 'online' });
                    this.io.emit('vendor-update', { vendorId, status: 'online' });
                }

                // Desconectado
                if (connection === 'close') {
                    const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
                    console.log(`[SessionManager] ${vendorName} desconectado. Reconectar: ${shouldReconnect}`);

                    await this.db.updateVendorStatus(vendorId, 'offline');
                    this.io.emit(`status-${vendorId}`, { status: 'offline' });
                    this.io.emit('vendor-update', { vendorId, status: 'offline' });

                    this.sessions.delete(vendorId);

                    if (shouldReconnect) {
                        setTimeout(() => this.createSession(vendorId, vendorName), 5000);
                    }
                }
            });

            // Evento: Mensagens recebidas
            sock.ev.on('messages.upsert', async ({ messages }) => {
                for (const msg of messages) {
                    await this.handleMessage(vendorId, vendorName, msg);
                }
            });

            return sock;
        } catch (error) {
            console.error(`[SessionManager] Erro ao criar sessão para ${vendorName}:`, error);
            throw error;
        }
    }

    /**
     * Processa uma mensagem recebida
     */
    async handleMessage(vendorId, vendorName, msg) {
        try {
            const isFromMe = msg.key.fromMe;
            const remoteJid = msg.key.remoteJid;
            const text = msg.message?.conversation ||
                msg.message?.extendedTextMessage?.text ||
                '';

            if (!text) return;

            const direction = isFromMe ? 'outbound' : 'inbound';
            const timestamp = new Date(msg.messageTimestamp * 1000);

            console.log(`[${vendorName}] ${direction}: ${text.substring(0, 50)}...`);

            // Salva no banco de dados
            await this.db.saveMessage({
                vendorId,
                remoteJid,
                messageId: msg.key.id,
                direction,
                text,
                timestamp,
            });

            // Emite para o frontend via WebSocket
            this.io.emit('new-message', {
                vendorId,
                vendorName,
                remoteJid,
                direction,
                text,
                timestamp: timestamp.toISOString(),
            });

            // Chama handlers registrados (compliance, lead qualifier, etc)
            for (const handler of this.messageHandlers) {
                await handler({
                    vendorId,
                    vendorName,
                    remoteJid,
                    direction,
                    text,
                    timestamp,
                    msg,
                });
            }
        } catch (error) {
            console.error('[SessionManager] Erro ao processar mensagem:', error);
        }
    }

    /**
     * Destrói uma sessão
     */
    async destroySession(vendorId) {
        const session = this.sessions.get(vendorId);
        if (session) {
            await session.sock.logout();
            this.sessions.delete(vendorId);
            await this.db.updateVendorStatus(vendorId, 'disconnected');
            console.log(`[SessionManager] Sessão ${vendorId} destruída`);
        }
    }

    /**
     * Retorna uma sessão ativa
     */
    getSession(vendorId) {
        return this.sessions.get(vendorId);
    }

    /**
     * Retorna todas as sessões ativas
     */
    getAllSessions() {
        return Array.from(this.sessions.entries()).map(([vendorId, session]) => ({
            vendorId,
            name: session.name,
            status: session.status,
        }));
    }
}

export default SessionManager;
