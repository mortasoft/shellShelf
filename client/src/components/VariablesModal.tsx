import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useTheme } from '../context/ThemeContext';

interface VariablesModalProps {
    isOpen: boolean;
    onClose: () => void;
    variables: string[];
    onConfirm: (values: Record<string, string>) => void;
    onCopyRaw?: () => void;
}

const VariablesModal: React.FC<VariablesModalProps> = ({ isOpen, onClose, variables, onConfirm, onCopyRaw }) => {
    const { theme } = useTheme();
    const [values, setValues] = useState<Record<string, string>>({});

    // Reset values when modal opens with new variables
    useEffect(() => {
        if (isOpen) {
            const initialValues: Record<string, string> = {};
            variables.forEach(v => initialValues[v] = '');
            setValues(initialValues);
        }
    }, [isOpen, variables]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm(values);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Configure Script Variables">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-blue-500/10 border border-blue-500/20 text-blue-200 p-3 rounded-lg text-sm mb-4">
                    This script contains variables. Please provide values for them before copying the command.
                </div>

                {variables.map(variable => (
                    <div key={variable} className="space-y-1">
                        <label className="block text-sm font-medium text-gray-400 font-mono">
                            {variable}
                        </label>
                        <input
                            required
                            type="text"
                            value={values[variable] || ''}
                            onChange={(e) => setValues(prev => ({ ...prev, [variable]: e.target.value }))}
                            className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-primary font-mono text-sm"
                            placeholder={`Value for ${variable}`}
                        />
                    </div>
                ))}

                <div className="flex justify-end gap-3 mt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg hover:bg-white/5 text-gray-300 transition-colors"
                    >
                        Cancel
                    </button>
                    {onCopyRaw && (
                        <button
                            type="button"
                            onClick={() => {
                                onCopyRaw();
                                onClose();
                            }}
                            className="px-4 py-2 rounded-lg hover:bg-white/5 text-gray-300 transition-colors border border-white/10"
                            title="Copy command without replacing variables"
                        >
                            Copy Raw
                        </button>
                    )}
                    <button
                        type="submit"
                        className={`
                            px-6 py-2 rounded-lg font-medium transition-all duration-200
                            ${theme === 'matrix'
                                ? 'bg-green-500/20 text-green-500 border border-green-500/50 hover:bg-green-500/30 hover:shadow-[0_0_15px_rgba(34,197,94,0.5)]'
                                : 'bg-primary text-white hover:brightness-110 shadow-primary/20'
                            }
                        `}
                    >
                        Generate Command
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default VariablesModal;
