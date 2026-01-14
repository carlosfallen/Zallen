import { useState, useEffect } from 'react';
import { Search, Filter, TrendingUp, Eye, Edit2, Tag, X } from 'lucide-react';
import wsClient from '../services/websocket';

interface Lead {
    id: number;
    name: string;
    phone: string;
    email?: string;
    company?: string;
    intent: string;
    service?: string;
    urgency?: string;
    temperature?: string;
    assigned_vendor_id?: string;
    assigned_vendor_name?: string;
    created_at: string;
    tags?: string;
}

export default function Leads() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [temperatureFilter, setTemperatureFilter] = useState('all');
    const [serviceFilter, setServiceFilter] = useState('all');
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);

    useEffect(() => {
        // Conecta ao WebSocket
        wsClient.connect();

        // Busca leads
        fetchLeads();

        // Listener para atualizações de leads
        const handleLeadUpdated = (data: any) => {
            console.log('[Leads] Lead atualizado:', data);

            setLeads(prev => prev.map(lead => {
                if (lead.id === data.leadId) {
                    return {
                        ...lead,
                        intent: data.intent || lead.intent,
                        temperature: data.temperature || lead.temperature,
                        urgency: data.urgency || lead.urgency,
                    };
                }
                return lead;
            }));
        };

        // Listener para leads roteados
        const handleLeadRouted = (data: any) => {
            console.log('[Leads] Lead roteado:', data);

            setLeads(prev => prev.map(lead => {
                if (lead.id === data.leadId) {
                    return {
                        ...lead,
                        assigned_vendor_id: data.vendorId,
                        assigned_vendor_name: data.vendorName,
                    };
                }
                return lead;
            }));
        };

        wsClient.on('lead-updated', handleLeadUpdated);
        wsClient.on('lead-routed', handleLeadRouted);

        return () => {
            wsClient.off('lead-updated', handleLeadUpdated);
            wsClient.off('lead-routed', handleLeadRouted);
        };
    }, []);

    const fetchLeads = async () => {
        try {
            const res = await fetch('/api/leads');
            const data = await res.json();
            setLeads(data);
        } catch (err) {
            console.error('Erro ao buscar leads:', err);
        }
    };

    const filteredLeads = leads.filter(lead => {
        const matchesSearch =
            lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.phone?.includes(searchTerm) ||
            lead.intent?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesTemperature = temperatureFilter === 'all' || lead.temperature === temperatureFilter;
        const matchesService = serviceFilter === 'all' || lead.service === serviceFilter;

        return matchesSearch && matchesTemperature && matchesService;
    });

    const getTemperatureColor = (temp?: string) => {
        switch (temp) {
            case 'hot': return 'bg-red-100 text-red-700';
            case 'warm': return 'bg-yellow-100 text-yellow-700';
            case 'cold': return 'bg-blue-100 text-blue-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getTemperatureIcon = (temp?: string) => {
        switch (temp) {
            case 'hot': return '🔥';
            case 'warm': return '💧';
            case 'cold': return '❄️';
            default: return '⚪';
        }
    };

    const updateLead = async (leadId: number, updates: Partial<Lead>) => {
        try {
            await fetch(`/api/leads/${leadId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });

            setLeads(prev => prev.map(lead =>
                lead.id === leadId ? { ...lead, ...updates } : lead
            ));

            setShowEditModal(false);
            setSelectedLead(null);
        } catch (err) {
            console.error('Erro ao atualizar lead:', err);
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestão de Leads</h1>
                    <p className="text-sm text-gray-600 mt-1">{filteredLeads.length} leads encontrados</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="badge bg-red-100 text-red-700">
                        🔥 {leads.filter(l => l.temperature === 'hot').length} Quentes
                    </span>
                    <span className="badge bg-yellow-100 text-yellow-700">
                        💧 {leads.filter(l => l.temperature === 'warm').length} Mornos
                    </span>
                    <span className="badge bg-blue-100 text-blue-700">
                        ❄️ {leads.filter(l => l.temperature === 'cold').length} Frios
                    </span>
                </div>
            </div>

            {/* Filtros */}
            <div className="card mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar leads..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>

                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <select
                            value={temperatureFilter}
                            onChange={(e) => setTemperatureFilter(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
                        >
                            <option value="all">Todas as temperaturas</option>
                            <option value="hot">🔥 Quente</option>
                            <option value="warm">💧 Morno</option>
                            <option value="cold">❄️ Frio</option>
                        </select>
                    </div>

                    <div className="relative">
                        <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <select
                            value={serviceFilter}
                            onChange={(e) => setServiceFilter(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
                        >
                            <option value="all">Todos os serviços</option>
                            <option value="site">Site</option>
                            <option value="ecommerce">E-commerce</option>
                            <option value="landing">Landing Page</option>
                            <option value="traffic">Tráfego Pago</option>
                            <option value="social_media">Redes Sociais</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Tabela de Leads */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Lead
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Intenção
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Temperatura
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Urgência
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Vendedor
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredLeads.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        Nenhum lead encontrado
                                    </td>
                                </tr>
                            ) : (
                                filteredLeads.map((lead) => (
                                    <tr key={lead.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="font-medium text-gray-900">{lead.name || 'Sem nome'}</div>
                                                <div className="text-sm text-gray-500">{lead.phone}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{lead.intent || 'Não detectado'}</div>
                                            {lead.service && (
                                                <div className="text-xs text-gray-500 mt-1">{lead.service}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`badge ${getTemperatureColor(lead.temperature)}`}>
                                                {getTemperatureIcon(lead.temperature)} {lead.temperature || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`badge ${lead.urgency === 'alta' ? 'bg-red-100 text-red-700' :
                                                    lead.urgency === 'média' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-blue-100 text-blue-700'
                                                }`}>
                                                {lead.urgency || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {lead.assigned_vendor_name || 'Não atribuído'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => {
                                                    setSelectedLead(lead);
                                                    setShowEditModal(true);
                                                }}
                                                className="text-primary-600 hover:text-primary-900 mr-3"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => setSelectedLead(lead)}
                                                className="text-gray-600 hover:text-gray-900"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de Edição */}
            {showEditModal && selectedLead && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Editar Lead</h3>
                            <button
                                onClick={() => {
                                    setShowEditModal(false);
                                    setSelectedLead(null);
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                                <input
                                    type="text"
                                    value={selectedLead.name || ''}
                                    onChange={(e) => setSelectedLead({ ...selectedLead, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={selectedLead.email || ''}
                                    onChange={(e) => setSelectedLead({ ...selectedLead, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
                                <input
                                    type="text"
                                    value={selectedLead.company || ''}
                                    onChange={(e) => setSelectedLead({ ...selectedLead, company: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                                <input
                                    type="text"
                                    value={selectedLead.tags || ''}
                                    onChange={(e) => setSelectedLead({ ...selectedLead, tags: e.target.value })}
                                    placeholder="Ex: urgente, vip, retornar"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => updateLead(selectedLead.id, selectedLead)}
                                    className="btn-primary flex-1"
                                >
                                    Salvar
                                </button>
                                <button
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setSelectedLead(null);
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex-1"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
