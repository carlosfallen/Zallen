import { useState, useEffect } from 'react';
import { X, QrCode as QrCodeIcon } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

interface QRCodeModalProps {
    onClose: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://145.223.30.23:3512';

export default function QRCodeModal({ onClose }: QRCodeModalProps) {
    const [vendorName, setVendorName] = useState('');
    const [vendorPhone, setVendorPhone] = useState('');
    const [vendorEmail, setVendorEmail] = useState('');
    const [vendorId, setVendorId] = useState('');
    const [qrCode, setQrCode] = useState('');
    const [status, setStatus] = useState<'input' | 'generating' | 'scanning' | 'connected'>('input');
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        // Conecta ao WebSocket
        const newSocket = io(API_URL);
        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, []);

    useEffect(() => {
        if (!socket || !vendorId) return;

        // Escuta QR Code para este vendor
        socket.on(`qr-${vendorId}`, (data: { qr: string }) => {
            console.log('[QRCodeModal] QR Code recebido:', data.qr.substring(0, 50));
            setQrCode(data.qr);
            setStatus('scanning');
        });

        // Escuta status de conexão
        socket.on(`status-${vendorId}`, (data: { status: string }) => {
            console.log('[QRCodeModal] Status atualizado:', data.status);
            if (data.status === 'online') {
                setStatus('connected');
                setTimeout(() => {
                    onClose();
                }, 2000);
            }
        });

        return () => {
            socket.off(`qr-${vendorId}`);
            socket.off(`status-${vendorId}`);
        };
    }, [socket, vendorId, onClose]);

    const handleGenerate = async () => {
        if (!vendorName.trim()) return;

        setStatus('generating');

        try {
            // Chama API para criar vendor
            const response = await fetch(`${API_URL}/api/vendors`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: vendorName,
                    phone: vendorPhone || null,
                    email: vendorEmail || null,
                }),
            });

            if (!response.ok) {
                throw new Error('Erro ao criar vendor');
            }

            const data = await response.json();
            console.log('[QRCodeModal] Vendor criado:', data);
            setVendorId(data.id);

            // O QR Code será recebido via WebSocket
        } catch (error) {
            console.error('[QRCodeModal] Erro:', error);
            alert('Erro ao criar vendedor. Tente novamente.');
            setStatus('input');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Adicionar Vendedor</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {status === 'input' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nome do Vendedor *
                        </label>
                        <input
                            type="text"
                            value={vendorName}
                            onChange={(e) => setVendorName(e.target.value)}
                            placeholder="Ex: João Silva"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent mb-3"
                            autoFocus
                        />

                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Telefone (opcional)
                        </label>
                        <input
                            type="text"
                            value={vendorPhone}
                            onChange={(e) => setVendorPhone(e.target.value)}
                            placeholder="Ex: 5511999999999"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent mb-3"
                        />

                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email (opcional)
                        </label>
                        <input
                            type="email"
                            value={vendorEmail}
                            onChange={(e) => setVendorEmail(e.target.value)}
                            placeholder="Ex: joao@empresa.com"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent mb-4"
                        />

                        <button
                            onClick={handleGenerate}
                            disabled={!vendorName.trim()}
                            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Gerar QR Code
                        </button>
                    </div>
                )}

                {status === 'generating' && (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                        <p className="text-gray-600">Gerando QR Code...</p>
                    </div>
                )}

                {status === 'scanning' && (
                    <div className="text-center">
                        <div className="bg-white p-4 rounded-lg border-2 border-gray-200 mb-4">
                            {qrCode ? (
                                <img src={qrCode} alt="QR Code" className="w-64 h-64 mx-auto" />
                            ) : (
                                <div className="w-64 h-64 bg-gray-100 flex items-center justify-center mx-auto">
                                    <QrCodeIcon className="w-24 h-24 text-gray-300" />
                                </div>
                            )}
                        </div>
                        <div className="mb-4">
                            <h3 className="font-semibold text-gray-900 mb-2">Instruções:</h3>
                            <ol className="text-sm text-gray-600 text-left space-y-1">
                                <li>1. Abra o WhatsApp no celular do vendedor</li>
                                <li>2. Vá em <strong>Configurações → Aparelhos conectados</strong></li>
                                <li>3. Toque em <strong>Conectar um aparelho</strong></li>
                                <li>4. Escaneie o QR Code acima</li>
                            </ol>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                            Aguardando escaneamento...
                        </div>
                    </div>
                )}

                {status === 'connected' && (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Conectado com sucesso!</h3>
                        <p className="text-gray-600 mb-4">{vendorName} está online</p>
                        <button onClick={onClose} className="btn-primary">
                            Fechar
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
