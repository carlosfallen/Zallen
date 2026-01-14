import { useState, useEffect } from 'react';
import { Plus, Wifi, WifiOff, QrCode, Trash2 } from 'lucide-react';
import QRCodeModal from '../components/QRCodeModal';

interface Vendor {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    status: 'online' | 'offline' | 'connecting' | 'disconnected';
    total_messages?: number;
    total_conversions?: number;
    performance_score?: number;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://145.223.30.23:3512';

export default function Vendors() {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [showQRModal, setShowQRModal] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchVendors = async () => {
        try {
            const response = await fetch(`${API_URL}/api/vendors`);
            if (!response.ok) throw new Error('Failed to fetch vendors');
            const data = await response.json();
            setVendors(data);
        } catch (error) {
            console.error('[Vendors] Error fetching vendors:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVendors();

        // Atualiza a cada 5 segundos
        const interval = setInterval(fetchVendors, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleDelete = async (vendorId: string) => {
        if (!confirm('Tem certeza que deseja remover este vendedor?')) return;

        try {
            const response = await fetch(`${API_URL}/api/vendors/${vendorId}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete vendor');

            // Atualiza lista
            fetchVendors();
        } catch (error) {
            console.error('[Vendors] Error deleting vendor:', error);
            alert('Erro ao remover vendedor');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'online':
                return 'bg-green-500';
            case 'connecting':
                return 'bg-yellow-500';
            default:
                return 'bg-gray-400';
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-green-600';
        if (score >= 70) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <div className="p-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Vendedores</h1>
                    <p className="text-gray-600 mt-1">Gerencie os WhatsApps monitorados</p>
                </div>
                <button
                    onClick={() => setShowQRModal(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Adicionar Vendedor
                </button>
            </div>

            {/* Vendors Grid */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando vendedores...</p>
                </div>
            ) : vendors.length === 0 ? (
                <div className="text-center py-12 col-span-full">
                    <QrCode className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum vendedor cadastrado</h3>
                    <p className="text-gray-600 mb-4">Adicione seu primeiro vendedor para começar</p>
                    <button
                        onClick={() => setShowQRModal(true)}
                        className="btn-primary inline-flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Adicionar Vendedor
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {vendors.map((vendor) => (
                        <div key={vendor.id} className="card hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                                        <span className="text-primary-600 font-bold text-lg">
                                            {vendor.name.charAt(0)}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{vendor.name}</h3>
                                        <p className="text-xs text-gray-500">{vendor.phone || 'Sem telefone'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${getStatusColor(vendor.status)}`}></div>
                                    <span className="text-xs text-gray-600 capitalize">{vendor.status}</span>
                                </div>
                            </div>

                            <div className="space-y-3 mb-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Mensagens</span>
                                    <span className="text-sm font-semibold">{vendor.total_messages || 0}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Conversões</span>
                                    <span className="text-sm font-semibold">{vendor.total_conversions || 0}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Performance</span>
                                    <span className={`text-sm font-bold ${getScoreColor(vendor.performance_score || 0)}`}>
                                        {vendor.performance_score || 0}/100
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-3 border-t">
                                <button className="flex-1 btn-secondary text-sm py-2 flex items-center justify-center gap-2">
                                    {vendor.status === 'online' ? (
                                        <>
                                            <WifiOff className="w-4 h-4" />
                                            Desconectar
                                        </>
                                    ) : (
                                        <>
                                            <Wifi className="w-4 h-4" />
                                            Conectar
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => handleDelete(vendor.id)}
                                    className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* QR Code Modal */}
            {showQRModal && <QRCodeModal onClose={() => setShowQRModal(false)} />}
        </div>
    );
}
