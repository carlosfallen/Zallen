import { io, Socket } from 'socket.io-client';

class WebSocketClient {
    private socket: Socket | null = null;
    private listeners: Map<string, Function[]> = new Map();

    connect() {
        if (this.socket?.connected) return;

        const wsUrl = import.meta.env.VITE_WS_URL || 'http://145.223.30.23:3000';

        this.socket = io(wsUrl, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
        });

        this.socket.on('connect', () => {
            console.log('[WebSocket] Conectado ao servidor');
        });

        this.socket.on('disconnect', () => {
            console.log('[WebSocket] Desconectado do servidor');
        });

        this.socket.on('connect_error', (error) => {
            console.error('[WebSocket] Erro de conexão:', error);
        });

        // Eventos do sistema
        this.socket.on('new-message', (data) => {
            this.emit('new-message', data);
        });

        this.socket.on('new-alert', (data) => {
            this.emit('new-alert', data);
        });

        this.socket.on('lead-updated', (data) => {
            this.emit('lead-updated', data);
        });

        this.socket.on('lead-routed', (data) => {
            this.emit('lead-routed', data);
        });

        this.socket.on('vendor-update', (data) => {
            this.emit('vendor-update', data);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    on(event: string, callback: Function) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)?.push(callback);
    }

    off(event: string, callback: Function) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    private emit(event: string, data: any) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            callbacks.forEach(callback => callback(data));
        }
    }

    isConnected() {
        return this.socket?.connected || false;
    }
}

// Singleton
const wsClient = new WebSocketClient();
export default wsClient;
