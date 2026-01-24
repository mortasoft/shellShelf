import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Plus, Trash2, Edit2, Book } from 'lucide-react';
import Modal from '../components/Modal';
import { useDialog } from '../context/DialogContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';

interface Instruction {
    id: string;
    title: string;
    content: string;
}

import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/instructions`;

const InstructionsPage = () => {
    const { theme } = useTheme();
    const { showToast } = useToast();
    const { showConfirm } = useDialog();
    const [searchParams] = useSearchParams();

    const [instructions, setInstructions] = useState<Instruction[]>([]);
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingInstruction, setEditingInstruction] = useState<Instruction | null>(null);
    const [formData, setFormData] = useState({ title: '', content: '' });

    useEffect(() => {
        fetchInstructions();
        const searchParam = searchParams.get('search');
        if (searchParam) {
            setSearch(searchParam);
        }
    }, [searchParams]);

    const fetchInstructions = async () => {
        try {
            const res = await fetch(API_URL);
            const data = await res.json();
            setInstructions(data);
        } catch (error) {
            console.error('Error fetching instructions:', error);
            showToast('Failed to fetch instructions', 'error');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const method = editingInstruction ? 'PUT' : 'POST';
            const url = editingInstruction ? `${API_URL}/${editingInstruction.id}` : API_URL;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                showToast(
                    `Instruction ${editingInstruction ? 'updated' : 'created'} successfully`,
                    'success'
                );
                closeModal();
                fetchInstructions();
            }
        } catch (error) {
            console.error('Error saving instruction:', error);
            showToast('Failed to save instruction', 'error');
        }
    };

    const handleDelete = async (id: string) => {
        const confirmed = await showConfirm('Are you sure you want to delete this instruction?', {
            title: 'Delete Instruction',
            confirmText: 'Delete'
        });

        if (!confirmed) return;

        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            showToast('Instruction deleted successfully', 'success');
            fetchInstructions();
        } catch (error) {
            console.error('Error deleting instruction:', error);
            showToast('Failed to delete instruction', 'error');
        }
    };

    const openModal = (instruction?: Instruction) => {
        if (instruction) {
            setEditingInstruction(instruction);
            setFormData({
                title: instruction.title,
                content: instruction.content
            });
        } else {
            setEditingInstruction(null);
            setFormData({ title: '', content: '' });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingInstruction(null);
    };

    const filteredInstructions = instructions.filter(inst =>
        inst.title.toLowerCase().includes(search.toLowerCase()) ||
        inst.content.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Instructions</h1>
                    <p className="text-gray-400 mt-1">Documentation and general guides</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className={`
                        flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ease-out
                        active:scale-95 hover:scale-105 hover:shadow-lg
                        ${theme === 'matrix'
                            ? 'bg-green-500/20 text-green-500 border border-green-500/50 hover:bg-green-500/30 hover:shadow-[0_0_15px_rgba(34,197,94,0.5)]'
                            : 'bg-primary text-white hover:brightness-110 shadow-primary/20'
                        }
                    `}
                >
                    <Plus size={20} />
                    Add Instruction
                </button>
            </div>

            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md py-4">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    <input
                        type="text"
                        placeholder="Search instructions..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-surface border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {filteredInstructions.map(inst => (
                    <div key={inst.id} className="bg-surface border border-white/10 rounded-xl p-6 hover:border-primary/50 transition-colors group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    <Book size={20} />
                                </div>
                                <h3 className="font-bold text-lg">{inst.title}</h3>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => openModal(inst)}
                                    className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(inst.id)}
                                    className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="bg-black/20 rounded-lg p-6 font-mono text-sm whitespace-pre-wrap text-gray-300">
                            {inst.content}
                        </div>
                    </div>
                ))}

                {filteredInstructions.length === 0 && (
                    <div className="text-center text-gray-500 py-12">
                        No instructions found.
                    </div>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingInstruction ? 'Edit Instruction' : 'New Instruction'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                        <input
                            required
                            type="text"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                            placeholder="e.g. How to deploy"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Content</label>
                        <textarea
                            required
                            rows={10}
                            value={formData.content}
                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                            className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-primary font-mono text-sm"
                            placeholder="Detailed instructions..."
                        />
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="px-4 py-2 rounded-lg hover:bg-white/5 text-gray-300 transition-colors"
                        >
                            Cancel
                        </button>
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
                            Save Instruction
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default InstructionsPage;
