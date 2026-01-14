import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
}

let toasts: Toast[] = [];
let listeners: ((toasts: Toast[]) => void)[] = [];

const notify = () => {
    listeners.forEach(listener => listener([...toasts]));
};

export const toast = {
    success: (message: string, duration = 3000) => {
        const id = Math.random().toString(36).substr(2, 9);
        toasts.push({ id, type: 'success', message, duration });
        notify();
        if (duration > 0) {
            setTimeout(() => toast.dismiss(id), duration);
        }
    },
    error: (message: string, duration = 5000) => {
        const id = Math.random().toString(36).substr(2, 9);
        toasts.push({ id, type: 'error', message, duration });
        notify();
        if (duration > 0) {
            setTimeout(() => toast.dismiss(id), duration);
        }
    },
    warning: (message: string, duration = 4000) => {
        const id = Math.random().toString(36).substr(2, 9);
        toasts.push({ id, type: 'warning', message, duration });
        notify();
        if (duration > 0) {
            setTimeout(() => toast.dismiss(id), duration);
        }
    },
    info: (message: string, duration = 3000) => {
        const id = Math.random().toString(36).substr(2, 9);
        toasts.push({ id, type: 'info', message, duration });
        notify();
        if (duration > 0) {
            setTimeout(() => toast.dismiss(id), duration);
        }
    },
    dismiss: (id: string) => {
        toasts = toasts.filter(t => t.id !== id);
        notify();
    },
    subscribe: (listener: (toasts: Toast[]) => void) => {
        listeners.push(listener);
        return () => {
            listeners = listeners.filter(l => l !== listener);
        };
    }
};

export default function ToastContainer() {
    const [toastList, setToastList] = useState<Toast[]>([]);

    useEffect(() => {
        return toast.subscribe(setToastList);
    }, []);

    const getIcon = (type: ToastType) => {
        switch (type) {
            case 'success': return <CheckCircle className="h-5 w-5" />;
            case 'error': return <XCircle className="h-5 w-5" />;
            case 'warning': return <AlertTriangle className="h-5 w-5" />;
            case 'info': return <Info className="h-5 w-5" />;
        }
    };

    const getStyles = (type: ToastType) => {
        switch (type) {
            case 'success': return 'bg-green-50 border-green-500 text-green-900';
            case 'error': return 'bg-red-50 border-red-500 text-red-900';
            case 'warning': return 'bg-yellow-50 border-yellow-500 text-yellow-900';
            case 'info': return 'bg-blue-50 border-blue-500 text-blue-900';
        }
    };

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            {toastList.map((t) => (
                <div
                    key={t.id}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border-l-4 shadow-lg min-w-[300px] max-w-md animate-slide-in ${getStyles(t.type)}`}
                >
                    {getIcon(t.type)}
                    <p className="flex-1 text-sm font-medium">{t.message}</p>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            ))}
        </div>
    );
}

// Hook para usar em componentes
export function useToast() {
    return toast;
}
