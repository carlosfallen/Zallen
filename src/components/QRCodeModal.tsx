import { useState } from 'react';
import { X, QrCode as QrCodeIcon } from 'lucide-react';

interface QRCodeModalProps {
    onClose: () => void;
}

export default function QRCodeModal({ onClose }: QRCodeModalProps) {
    const [vendorName, setVendorName] = useState('');
    const [qrCode, setQrCode] = useState('');
    const [status, setStatus] = useState<'input' | 'generating' | 'scanning' | 'connected'>('input');

    const handleGenerate = () => {
        if (!vendorName.trim()) return;

        setStatus('generating');

        // TODO: Call API to generate QR Code
        setTimeout(() => {
            // Simula QR Code gerado
            setQrCode('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
            setStatus('scanning');
        }, 1000);
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
                            Nome do Vendedor
                        </label>
                        <input
                            type="text"
                            value={vendorName}
                            onChange={(e) => setVendorName(e.target.value)}
                            placeholder="Ex: João Silva"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent mb-4"
                            autoFocus
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
