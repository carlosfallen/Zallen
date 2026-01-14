import { useEffect, useState } from 'react';
import { Users, MessageSquare, UserCheck, AlertTriangle, TrendingUp } from 'lucide-react';

interface Stats {
    totalVendors: number;
    activeVendors: number;
    totalLeads: number;
    totalMessages: number;
    pendingAlerts: number;
    conversionRate: number;
}

export default function Dashboard() {
    const [stats, setStats] = useState<Stats>({
        totalVendors: 0,
        activeVendors: 0,
        totalLeads: 0,
        totalMessages: 0,
        pendingAlerts: 0,
        conversionRate: 0,
    });

    useEffect(() => {
        // TODO: Fetch stats from API
        setStats({
            totalVendors: 5,
            activeVendors: 3,
            totalLeads: 127,
            totalMessages: 1543,
            pendingAlerts: 7,
            conversionRate: 23.5,
        });
    }, []);

    const statCards = [
        {
            title: 'Vendedores Ativos',
            value: `${stats.activeVendors}/${stats.totalVendors}`,
            icon: Users,
            color: 'bg-blue-500',
            textColor: 'text-blue-600',
            bgColor: 'bg-blue-50',
        },
        {
            title: 'Total de Leads',
            value: stats.totalLeads,
            icon: UserCheck,
            color: 'bg-green-500',
            textColor: 'text-green-600',
            bgColor: 'bg-green-50',
        },
        {
            title: 'Mensagens Hoje',
            value: stats.totalMessages,
            icon: MessageSquare,
            color: 'bg-purple-500',
            textColor: 'text-purple-600',
            bgColor: 'bg-purple-50',
        },
        {
            title: 'Alertas Pendentes',
            value: stats.pendingAlerts,
            icon: AlertTriangle,
            color: 'bg-red-500',
            textColor: 'text-red-600',
            bgColor: 'bg-red-50',
        },
        {
            title: 'Taxa de Conversão',
            value: `${stats.conversionRate}%`,
            icon: TrendingUp,
            color: 'bg-primary-500',
            textColor: 'text-primary-600',
            bgColor: 'bg-primary-50',
        },
    ];

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">Visão geral do monitoramento WhatsApp</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
                {statCards.map((stat) => (
                    <div key={stat.title} className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                                <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                    <h2 className="text-lg font-semibold mb-4">Atividade Recente</h2>
                    <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                            <div className="flex-1">
                                <p className="text-sm font-medium">Novo lead qualificado</p>
                                <p className="text-xs text-gray-600">João Silva - Score: 85/100</p>
                                <p className="text-xs text-gray-400 mt-1">Há 5 minutos</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                            <div className="flex-1">
                                <p className="text-sm font-medium">Alerta de compliance</p>
                                <p className="text-xs text-gray-600">Vendedor: Maria - Palavra proibida detectada</p>
                                <p className="text-xs text-gray-400 mt-1">Há 12 minutos</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                            <div className="flex-1">
                                <p className="text-sm font-medium">Vendedor conectado</p>
                                <p className="text-xs text-gray-600">Pedro Santos está online</p>
                                <p className="text-xs text-gray-400 mt-1">Há 1 hora</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h2 className="text-lg font-semibold mb-4">Top Vendedores</h2>
                    <div className="space-y-3">
                        {[
                            { name: 'João Silva', score: 95, messages: 234 },
                            { name: 'Maria Santos', score: 88, messages: 198 },
                            { name: 'Pedro Costa', score: 82, messages: 176 },
                        ].map((vendor, index) => (
                            <div key={vendor.name} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <div className="flex-shrink-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold">
                                    {index + 1}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{vendor.name}</p>
                                    <p className="text-xs text-gray-600">{vendor.messages} mensagens</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-primary-600">{vendor.score}</p>
                                    <p className="text-xs text-gray-500">score</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
