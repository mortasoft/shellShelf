import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        new Audio('/notification.mp3').play().catch(() => { });
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    const getIcon = (type: ToastType) => {
        switch (type) {
            case 'success': return <CheckCircle size={20} className="text-green-500" />;
            case 'error': return <AlertCircle size={20} className="text-red-500" />;
            default: return <Info size={20} className="text-primary" />;
        }
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className="flex items-center gap-3 bg-surface border border-white/10 text-white px-4 py-3 rounded-xl shadow-xl min-w-[300px] animate-in slide-in-from-right fade-in duration-300"
                    >
                        {getIcon(toast.type)}
                        <p className="flex-1 text-sm font-medium">{toast.message}</p>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
