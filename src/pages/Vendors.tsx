import { useState, useEffect } from 'react';
import { Plus, Wifi, WifiOff, QrCode, Trash2 } from 'lucide-react';
import QRCodeModal from '../components/QRCodeModal';

interface Vendor {
    id: string;
    name: string;
    phone?: string;
    status: 'online' | 'offline' | 'connecting';
    messagesCount: number;
    conversionRate: number;
    complianceScore: number;
}

export default function Vendors() {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [showQRModal, setShowQRModal] = useState(false);

    useEffect(() => {
        // TODO: Fetch vendors from API
        setVendors([
            {
                id: '1',
                name: 'João Silva',
                phone: '5511999999999',
                status: 'online',
                messagesCount: 234,
                conversionRate: 28.5,
                complianceScore: 95,
            },
            {
                id: '2',
                name: 'Maria Santos',
                phone: '5511888888888',
                status: 'online',
                messagesCount: 198,
                conversionRate: 22.1,
                complianceScore: 78,
            },
            {
                id: '3',
                name: 'Pedro Costa',
                phone: '5511777777777',
                status: 'offline',
                messagesCount: 176,
                conversionRate: 31.2,
                complianceScore: 92,
            },
        ]);
    }, []);

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
                                    <p className="text-xs text-gray-500">{vendor.phone}</p>
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
                                <span className="text-sm font-semibold">{vendor.messagesCount}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Conversão</span>
                                <span className="text-sm font-semibold">{vendor.conversionRate}%</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Compliance</span>
                                <span className={`text-sm font-bold ${getScoreColor(vendor.complianceScore)}`}>
                                    {vendor.complianceScore}/100
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
                            <button className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* QR Code Modal */}
            {showQRModal && <QRCodeModal onClose={() => setShowQRModal(false)} />}
        </div>
    );
}
