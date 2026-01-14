import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Filter, Download } from 'lucide-react';
import wsClient from '../services/websocket';

interface Alert {
    id: number;
    vendor_id: string;
    vendor_name: string;
    type: string;
    severity: 'low' | 'medium' | 'high';
    title: string;
    description: string;
    status: 'pending' | 'resolved' | 'dismissed';
    created_at: string;
    resolved_at?: string;
}

export default function Alerts() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [severityFilter, setSeverityFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [stats, setStats] = useState({
        pending: 0,
        resolved: 0,
        dismissed: 0,
        high: 0,
    });

    useEffect(() => {
        // Conecta ao WebSocket
        wsClient.connect();

        // Busca alertas
        fetchAlerts();

        // Listener para novos alertas
        const handleNewAlert = (data: any) => {
            console.log('[Alerts] Novo alerta:', data);

            const newAlert: Alert = {
                id: data.id,
                vendor_id: data.vendorId,
                vendor_name: data.vendorName,
                type: data.type,
                severity: data.severity,
                title: data.title,
                description: data.description,
                status: 'pending',
                created_at: data.timestamp,
            };

            setAlerts(prev => [newAlert, ...prev]);
            updateStats([newAlert, ...alerts]);
        };

        wsClient.on('new-alert', handleNewAlert);

        return () => {
            wsClient.off('new-alert', handleNewAlert);
        };
    }, [alerts]);

    const fetchAlerts = async () => {
        try {
            const res = await fetch('/api/alerts');
            const data = await res.json();
            setAlerts(data);
            updateStats(data);
        } catch (err) {
            console.error('Erro ao buscar alertas:', err);
        }
    };

    const updateStats = (alertsList: Alert[]) => {
        setStats({
            pending: alertsList.filter(a => a.status === 'pending').length,
            resolved: alertsList.filter(a => a.status === 'resolved').length,
            dismissed: alertsList.filter(a => a.status === 'dismissed').length,
            high: alertsList.filter(a => a.severity === 'high' && a.status === 'pending').length,
        });
    };

    const updateAlertStatus = async (alertId: number, status: 'resolved' | 'dismissed') => {
        try {
            await fetch(`/api/alerts/${alertId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });

            setAlerts(prev => prev.map(alert =>
                alert.id === alertId ? { ...alert, status, resolved_at: new Date().toISOString() } : alert
            ));

            updateStats(alerts.map(alert =>
                alert.id === alertId ? { ...alert, status } : alert
            ));
        } catch (err) {
            console.error('Erro ao atualizar alerta:', err);
        }
    };

    const filteredAlerts = alerts.filter(alert => {
        const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
        const matchesStatus = statusFilter === 'all' || alert.status === statusFilter;
        return matchesSeverity && matchesStatus;
    });

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'high': return 'bg-red-100 text-red-700 border-red-300';
            case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
            case 'low': return 'bg-blue-100 text-blue-700 border-blue-300';
            default: return 'bg-gray-100 text-gray-700 border-gray-300';
        }
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'high': return '🔴';
            case 'medium': return '🟡';
            case 'low': return '🔵';
            default: return '⚪';
        }
    };

    const exportAlerts = () => {
        const csv = [
            ['Timestamp', 'Vendedor', 'Tipo', 'Severidade', 'Título', 'Descrição', 'Status'],
            ...filteredAlerts.map(alert => [
                new Date(alert.created_at).toLocaleString('pt-BR'),
                alert.vendor_name,
                alert.type,
                alert.severity,
                alert.title,
                alert.description,
                alert.status
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `alertas-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Alertas de Compliance</h1>
                    <p className="text-sm text-gray-600 mt-1">{filteredAlerts.length} alertas encontrados</p>
                </div>
                <button
                    onClick={exportAlerts}
                    className="btn-primary flex items-center gap-2"
                >
                    <Download className="h-4 w-4" />
                    Exportar CSV
                </button>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Pendentes</p>
                            <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
                        </div>
                        <AlertTriangle className="h-12 w-12 text-yellow-500 opacity-20" />
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Resolvidos</p>
                            <p className="text-3xl font-bold text-green-600 mt-1">{stats.resolved}</p>
                        </div>
                        <CheckCircle className="h-12 w-12 text-green-500 opacity-20" />
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Descartados</p>
                            <p className="text-3xl font-bold text-gray-600 mt-1">{stats.dismissed}</p>
                        </div>
                        <XCircle className="h-12 w-12 text-gray-500 opacity-20" />
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Alta Prioridade</p>
                            <p className="text-3xl font-bold text-red-600 mt-1">{stats.high}</p>
                        </div>
                        <AlertTriangle className="h-12 w-12 text-red-500 opacity-20" />
                    </div>
                </div>
            </div>

            {/* Filtros */}
            <div className="card mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <select
                            value={severityFilter}
                            onChange={(e) => setSeverityFilter(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
                        >
                            <option value="all">Todas as severidades</option>
                            <option value="high">🔴 Alta</option>
                            <option value="medium">🟡 Média</option>
                            <option value="low">🔵 Baixa</option>
                        </select>
                    </div>

                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
                        >
                            <option value="all">Todos os status</option>
                            <option value="pending">⏳ Pendente</option>
                            <option value="resolved">✅ Resolvido</option>
                            <option value="dismissed">❌ Descartado</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Lista de Alertas */}
            <div className="space-y-4">
                {filteredAlerts.length === 0 ? (
                    <div className="card text-center py-12">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                        <p className="text-gray-600">Nenhum alerta encontrado</p>
                        <p className="text-sm text-gray-500 mt-2">
                            {statusFilter === 'pending'
                                ? 'Tudo certo! Não há alertas pendentes.'
                                : 'Ajuste os filtros para ver mais alertas.'}
                        </p>
                    </div>
                ) : (
                    filteredAlerts.map((alert) => (
                        <div
                            key={alert.id}
                            className={`card border-l-4 ${getSeverityColor(alert.severity)}`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-2xl">{getSeverityIcon(alert.severity)}</span>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                                            <p className="text-sm text-gray-600">
                                                {alert.vendor_name} • {new Date(alert.created_at).toLocaleString('pt-BR')}
                                            </p>
                                        </div>
                                    </div>

                                    <p className="text-gray-700 mb-3">{alert.description}</p>

                                    <div className="flex items-center gap-2">
                                        <span className={`badge ${getSeverityColor(alert.severity)}`}>
                                            {alert.severity}
                                        </span>
                                        <span className="badge bg-gray-100 text-gray-700">
                                            {alert.type}
                                        </span>
                                        <span className={`badge ${alert.status === 'resolved' ? 'bg-green-100 text-green-700' :
                                                alert.status === 'dismissed' ? 'bg-gray-100 text-gray-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {alert.status === 'resolved' ? '✅ Resolvido' :
                                                alert.status === 'dismissed' ? '❌ Descartado' :
                                                    '⏳ Pendente'}
                                        </span>
                                    </div>
                                </div>

                                {alert.status === 'pending' && (
                                    <div className="flex gap-2 ml-4">
                                        <button
                                            onClick={() => updateAlertStatus(alert.id, 'resolved')}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                                        >
                                            ✅ Resolver
                                        </button>
                                        <button
                                            onClick={() => updateAlertStatus(alert.id, 'dismissed')}
                                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                                        >
                                            ❌ Descartar
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
