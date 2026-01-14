import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageSquare, Phone, Clock, TrendingUp, AlertCircle } from 'lucide-react';

interface Lead {
    id: number;
    name: string;
    phone: string;
    intent: string;
    service: string;
    urgency: string;
    budget: string | null;
    keyInfo: string;
    nextStep: string;
    timestamp: string;
}

export default function VendorDashboard() {
    const { vendorId } = useParams();
    const navigate = useNavigate();
    const [vendor, setVendor] = useState<any>(null);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [stats, setStats] = useState({
        totalLeads: 0,
        todayLeads: 0,
        pendingLeads: 0,
        avgResponseTime: '0min'
    });

    useEffect(() => {
        // Busca informações do vendedor
        fetch(`/api/vendors/${vendorId}`)
            .then(res => res.json())
            .then(data => setVendor(data))
            .catch(err => console.error('Erro ao buscar vendedor:', err));

        // Busca leads atribuídos
        fetch(`/api/leads?vendorId=${vendorId}`)
            .then(res => res.json())
            .then(data => setLeads(data))
            .catch(err => console.error('Erro ao buscar leads:', err));

        // WebSocket para receber novos leads em tempo real
        // TODO: Implementar conexão WebSocket

    }, [vendorId]);

    const getUrgencyColor = (urgency: string) => {
        switch (urgency) {
            case 'alta': return 'text-red-600 bg-red-50';
            case 'média': return 'text-yellow-600 bg-yellow-50';
            case 'baixa': return 'text-blue-600 bg-blue-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const openWhatsApp = (phone: string) => {
        const cleanPhone = phone.replace(/\D/g, '');
        window.open(`https://wa.me/${cleanPhone}`, '_blank');
    };

    if (!vendor) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Carregando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Olá, {vendor.name}! 👋
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Status: <span className={`font-medium ${vendor.status === 'online' ? 'text-green-600' : 'text-gray-600'}`}>
                                    {vendor.status === 'online' ? '🟢 Online' : '⚫ Offline'}
                                </span>
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/')}
                            className="text-sm text-gray-600 hover:text-gray-900"
                        >
                            ← Voltar ao Dashboard Principal
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total de Leads</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalLeads}</p>
                            </div>
                            <MessageSquare className="h-12 w-12 text-primary-500 opacity-20" />
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Leads Hoje</p>
                                <p className="text-3xl font-bold text-green-600 mt-1">{stats.todayLeads}</p>
                            </div>
                            <TrendingUp className="h-12 w-12 text-green-500 opacity-20" />
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Pendentes</p>
                                <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.pendingLeads}</p>
                            </div>
                            <Clock className="h-12 w-12 text-yellow-500 opacity-20" />
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Tempo Médio</p>
                                <p className="text-3xl font-bold text-blue-600 mt-1">{stats.avgResponseTime}</p>
                            </div>
                            <Clock className="h-12 w-12 text-blue-500 opacity-20" />
                        </div>
                    </div>
                </div>

                {/* Leads List */}
                <div className="card">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Seus Leads</h2>
                        <span className="badge bg-primary-100 text-primary-700">
                            {leads.length} leads
                        </span>
                    </div>

                    {leads.length === 0 ? (
                        <div className="text-center py-12">
                            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">Nenhum lead atribuído ainda</p>
                            <p className="text-sm text-gray-500 mt-2">
                                Você receberá uma notificação quando um novo lead for atribuído
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {leads.map((lead) => (
                                <div
                                    key={lead.id}
                                    className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-semibold text-gray-900">{lead.name}</h3>
                                                <span className={`badge ${getUrgencyColor(lead.urgency)}`}>
                                                    {lead.urgency}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                                                <div>
                                                    <p className="text-gray-600">📞 Telefone</p>
                                                    <p className="font-medium text-gray-900">{lead.phone}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-600">🎯 Intenção</p>
                                                    <p className="font-medium text-gray-900">{lead.intent}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-600">📋 Serviço</p>
                                                    <p className="font-medium text-gray-900">{lead.service}</p>
                                                </div>
                                                {lead.budget && (
                                                    <div>
                                                        <p className="text-gray-600">💰 Orçamento</p>
                                                        <p className="font-medium text-gray-900">{lead.budget}</p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3">
                                                <p className="text-sm font-medium text-blue-900 mb-1">📌 Info Importante:</p>
                                                <p className="text-sm text-blue-800">{lead.keyInfo}</p>
                                            </div>

                                            <div className="bg-green-50 border border-green-200 rounded p-3">
                                                <p className="text-sm font-medium text-green-900 mb-1">💡 Próximo Passo:</p>
                                                <p className="text-sm text-green-800">{lead.nextStep}</p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => openWhatsApp(lead.phone)}
                                            className="btn-primary ml-4 flex items-center gap-2 whitespace-nowrap"
                                        >
                                            <Phone className="h-4 w-4" />
                                            Abrir WhatsApp
                                        </button>
                                    </div>

                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                        <p className="text-xs text-gray-500">
                                            Recebido em {new Date(lead.timestamp).toLocaleString('pt-BR')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
