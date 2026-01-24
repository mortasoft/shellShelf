import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import Modal from '../components/Modal';

interface DialogOptions {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'alert' | 'confirm';
    variant?: 'primary' | 'danger';
}

interface DialogContextType {
    showAlert: (message: string, options?: Omit<DialogOptions, 'message' | 'type'>) => Promise<void>;
    showConfirm: (message: string, options?: Omit<DialogOptions, 'message' | 'type'>) => Promise<boolean>;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const useDialog = () => {
    const context = useContext(DialogContext);
    if (!context) {
        throw new Error('useDialog must be used within a DialogProvider');
    }
    return context;
};

export const DialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [options, setOptions] = useState<DialogOptions>({ message: '' });
    const resolveRef = useRef<(value: boolean) => void>(() => { });

    const showAlert = useCallback((message: string, opts?: Omit<DialogOptions, 'message' | 'type'>) => {
        return new Promise<void>((resolve) => {
            setOptions({
                message,
                title: 'Alert',
                confirmText: 'OK',
                type: 'alert',
                variant: 'primary',
                ...opts,
            });
            resolveRef.current = () => resolve();
            setIsOpen(true);
        });
    }, []);

    const showConfirm = useCallback((message: string, opts?: Omit<DialogOptions, 'message' | 'type'>) => {
        return new Promise<boolean>((resolve) => {
            setOptions({
                message,
                title: 'Confirm',
                confirmText: 'Yes',
                cancelText: 'Cancel',
                type: 'confirm',
                variant: 'primary',
                ...opts,
            });
            resolveRef.current = resolve;
            setIsOpen(true);
        });
    }, []);

    const handleConfirm = () => {
        setIsOpen(false);
        resolveRef.current(true);
    };

    const handleCancel = () => {
        setIsOpen(false);
        resolveRef.current(false);
    };

    const getButtonClass = () => {
        if (options.variant === 'danger') {
            return "px-6 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-medium text-white transition-colors shadow-lg shadow-red-500/20";
        }
        return "px-6 py-2 bg-primary hover:brightness-110 rounded-lg font-medium text-white transition-all shadow-lg shadow-primary/20";
    };

    return (
        <DialogContext.Provider value={{ showAlert, showConfirm }}>
            {children}
            <Modal
                isOpen={isOpen}
                onClose={options.type === 'alert' ? handleConfirm : handleCancel}
                title={options.title || 'Dialog'}
            >
                <div className="space-y-6">
                    <p className="text-gray-300">{options.message}</p>
                    <div className="flex justify-end gap-3">
                        {options.type === 'confirm' && (
                            <button
                                onClick={handleCancel}
                                className="px-4 py-2 rounded-lg hover:bg-white/5 text-gray-300 transition-colors"
                            >
                                {options.cancelText || 'Cancel'}
                            </button>
                        )}
                        <button
                            onClick={handleConfirm}
                            className={getButtonClass()}
                        >
                            {options.confirmText || 'OK'}
                        </button>
                    </div>
                </div>
            </Modal>
        </DialogContext.Provider>
    );
};
