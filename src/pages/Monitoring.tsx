import { useState, useEffect } from 'react';
import { Search, Filter, AlertTriangle, Download } from 'lucide-react';
import wsClient from '../services/websocket';

interface Message {
    id: string;
    vendorId: string;
    vendorName: string;
    remoteJid: string;
    direction: 'inbound' | 'outbound';
    text: string;
    timestamp: string;
    hasAlert?: boolean;
}

export default function Monitoring() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedVendor, setSelectedVendor] = useState('all');
    const [vendors, setVendors] = useState<any[]>([]);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Conecta ao WebSocket
        wsClient.connect();
        setIsConnected(wsClient.isConnected());

        // Busca vendedores
        fetch('/api/vendors')
            .then(res => res.json())
            .then(data => setVendors(data))
            .catch(err => console.error('Erro ao buscar vendedores:', err));

        // Listener para novas mensagens
        const handleNewMessage = (data: any) => {
            console.log('[Monitoring] Nova mensagem:', data);

            const newMessage: Message = {
                id: `${data.vendorId}-${Date.now()}`,
                vendorId: data.vendorId,
                vendorName: data.vendorName,
                remoteJid: data.remoteJid,
                direction: data.direction,
                text: data.text,
                timestamp: data.timestamp,
                hasAlert: false,
            };

            setMessages(prev => [newMessage, ...prev].slice(0, 100)); // Mantém últimas 100
        };

        // Listener para novos alertas
        const handleNewAlert = (data: any) => {
            console.log('[Monitoring] Novo alerta:', data);

            // Marca mensagem com alerta
            setMessages(prev => prev.map(msg => {
                if (msg.vendorId === data.vendorId && msg.text.includes(data.description)) {
                    return { ...msg, hasAlert: true };
                }
                return msg;
            }));
        };

        wsClient.on('new-message', handleNewMessage);
        wsClient.on('new-alert', handleNewAlert);

        // Cleanup
        return () => {
            wsClient.off('new-message', handleNewMessage);
            wsClient.off('new-alert', handleNewAlert);
        };
    }, []);

    const filteredMessages = messages.filter(msg => {
        const matchesSearch = msg.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
            msg.vendorName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesVendor = selectedVendor === 'all' || msg.vendorId === selectedVendor;
        return matchesSearch && matchesVendor;
    });

    const exportMessages = () => {
        const csv = [
            ['Timestamp', 'Vendedor', 'Direção', 'Mensagem', 'Alerta'],
            ...filteredMessages.map(msg => [
                new Date(msg.timestamp).toLocaleString('pt-BR'),
                msg.vendorName,
                msg.direction === 'inbound' ? 'Recebida' : 'Enviada',
                msg.text,
                msg.hasAlert ? 'Sim' : 'Não'
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mensagens-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Monitoramento em Tempo Real</h1>
                    <p className="text-sm text-gray-600 mt-1">
                        {isConnected ? '🟢 Conectado' : '🔴 Desconectado'} • {filteredMessages.length} mensagens
                    </p>
                </div>
                <button
                    onClick={exportMessages}
                    className="btn-primary flex items-center gap-2"
                >
                    <Download className="h-4 w-4" />
                    Exportar CSV
                </button>
            </div>

            {/* Filtros */}
            <div className="card mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar mensagens..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>

                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <select
                            value={selectedVendor}
                            onChange={(e) => setSelectedVendor(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
                        >
                            <option value="all">Todos os vendedores</option>
                            {vendors.map(vendor => (
                                <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Feed de Mensagens */}
            <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Feed de Mensagens</h2>

                {filteredMessages.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600">Nenhuma mensagem ainda</p>
                        <p className="text-sm text-gray-500 mt-2">As mensagens aparecerão aqui em tempo real</p>
                    </div>
                ) : (
                    <div className="space-y-3 max-h-[600px] overflow-y-auto">
                        {filteredMessages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`p-4 rounded-lg border ${msg.hasAlert
                                        ? 'border-red-300 bg-red-50'
                                        : msg.direction === 'inbound'
                                            ? 'border-blue-200 bg-blue-50'
                                            : 'border-gray-200 bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-900">{msg.vendorName}</span>
                                        <span className={`badge ${msg.direction === 'inbound'
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {msg.direction === 'inbound' ? '📥 Recebida' : '📤 Enviada'}
                                        </span>
                                        {msg.hasAlert && (
                                            <span className="badge bg-red-100 text-red-700 flex items-center gap-1">
                                                <AlertTriangle className="h-3 w-3" />
                                                Alerta
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        {new Date(msg.timestamp).toLocaleTimeString('pt-BR')}
                                    </span>
                                </div>
                                <p className="text-gray-700">{msg.text}</p>
                                <p className="text-xs text-gray-500 mt-2">
                                    Cliente: {msg.remoteJid.split('@')[0]}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
