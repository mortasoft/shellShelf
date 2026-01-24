import React, { useState, useEffect } from 'react';
import { Search, Plus, Copy, Trash2, Edit2, Terminal, Book } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import Modal from '../components/Modal';
import { useDialog } from '../context/DialogContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

interface Command {
    id: string;
    name: string;
    description: string;
    command: string;
    tags: string[];
    lastModified?: string;
    linkedInstructionId?: string;
}

interface Instruction {
    id: string;
    title: string;
    content: string;
}

import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/commands`;
const INSTRUCTIONS_API_URL = `${API_BASE_URL}/instructions`;

const Commands = () => {
    const { theme } = useTheme();
    const { showToast } = useToast();
    const { showConfirm } = useDialog();
    const [commands, setCommands] = useState<Command[]>([]);
    const [instructions, setInstructions] = useState<Instruction[]>([]);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCommand, setEditingCommand] = useState<Command | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        command: '',
        tags: '',
        linkedInstructionId: ''
    });

    useEffect(() => {
        fetchCommands();
        fetchInstructions();
    }, []);

    const fetchCommands = async () => {
        try {
            const res = await fetch(API_URL);
            const data = await res.json();
            setCommands(data);
        } catch (error) {
            console.error('Error fetching commands:', error);
            showToast('Failed to fetch commands', 'error');
        }
    };

    const fetchInstructions = async () => {
        try {
            const res = await fetch(INSTRUCTIONS_API_URL);
            const data = await res.json();
            setInstructions(data);
        } catch (error) {
            console.error('Error fetching instructions:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...formData,
            tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
            linkedInstructionId: formData.linkedInstructionId || undefined
        };

        try {
            if (editingCommand) {
                await fetch(`${API_URL}/${editingCommand.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                showToast('Command updated successfully', 'success');
            } else {
                await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                showToast('Command created successfully', 'success');
            }
            fetchCommands();
            closeModal();
        } catch (error) {
            console.error('Error saving command:', error);
            showToast('Failed to save command', 'error');
        }
    };

    const handleDelete = async (id: string) => {
        const confirmed = await showConfirm('Are you sure you want to delete this command?', {
            confirmText: 'Delete',
            title: 'Delete Command'
        });
        if (!confirmed) return;

        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            fetchCommands();
            showToast('Command deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting command:', error);
            showToast('Failed to delete command', 'error');
        }
    };

    const openModal = (cmd?: Command) => {
        if (cmd) {
            setEditingCommand(cmd);
            setFormData({
                name: cmd.name,
                description: cmd.description,
                command: cmd.command,
                tags: cmd.tags.join(', '),
                linkedInstructionId: cmd.linkedInstructionId || ''
            });
        } else {
            setEditingCommand(null);
            setFormData({ name: '', description: '', command: '', tags: '', linkedInstructionId: '' });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCommand(null);
    };

    const filteredCommands = commands.filter(cmd =>
        cmd.name.toLowerCase().includes(search.toLowerCase()) ||
        cmd.description.toLowerCase().includes(search.toLowerCase()) ||
        cmd.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
    );

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        showToast('Command copied to clipboard!', 'success');
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Commands</h1>
                    <p className="text-gray-400 mt-1">Manage and organize your shell commands</p>
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
                    Add Command
                </button>
            </div>

            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md py-4">
                <div className="relative mb-3">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    <input
                        type="text"
                        placeholder="Search commands, descriptions, tags..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-surface border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                    {Array.from(new Set(commands.flatMap(cmd => cmd.tags))).sort().map(tag => (
                        <button
                            key={tag}
                            onClick={() => setSearch(search === tag ? '' : tag)}
                            className={`
                                px-3 py-1 rounded-full text-xs font-medium border transition-colors whitespace-nowrap
                                ${search === tag
                                    ? 'bg-primary border-primary text-white'
                                    : 'bg-surface border-white/10 text-gray-400 hover:border-primary/50 hover:text-white'
                                }
                            `}
                        >
                            #{tag}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCommands.map(cmd => (
                    <div key={cmd.id} className="bg-surface border border-white/10 rounded-xl p-6 hover:border-primary/50 transition-colors group relative">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    <Terminal size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-lg mr-8 leading-tight break-words">{cmd.name}</h3>
                                    <div className="flex gap-2 mt-1 flex-wrap">
                                        {cmd.tags.map(tag => (
                                            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-400">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity absolute top-6 right-6 bg-surface pl-2">
                                <button
                                    onClick={() => openModal(cmd)}
                                    className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(cmd.id)}
                                    className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{cmd.description}</p>

                        <div className="bg-black/30 rounded-lg p-4 font-mono text-sm break-all relative group/code mb-3">
                            <code className="text-green-400">{cmd.command}</code>
                            <button
                                onClick={() => copyToClipboard(cmd.command)}
                                className="absolute right-2 top-2 p-1.5 bg-white/10 rounded-md text-gray-400 hover:text-white hover:bg-white/20 opacity-0 group-hover/code:opacity-100 transition-all"
                                title="Copy to clipboard"
                            >
                                <Copy size={14} />
                            </button>
                        </div>

                        <div className="flex justify-between items-end">
                            {cmd.linkedInstructionId ? (
                                (() => {
                                    const linkedInstr = instructions.find(i => i.id === cmd.linkedInstructionId);
                                    if (linkedInstr) {
                                        return (
                                            <div className="flex-shrink-0">
                                                <NavLink
                                                    to={`/instructions?search=${encodeURIComponent(linkedInstr.title)}`}
                                                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                                                    title={`Go to instruction: ${linkedInstr.title}`}
                                                >
                                                    <Book size={12} />
                                                    View: {linkedInstr.title}
                                                </NavLink>
                                            </div>
                                        );
                                    }
                                    return <div />;
                                })()
                            ) : <div />}

                            {cmd.lastModified && (
                                <div className="text-[10px] text-gray-500 text-right font-mono flex-1 ml-4">
                                    Updated: {new Date(cmd.lastModified).toLocaleDateString()}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingCommand ? 'Edit Command' : 'New Command'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                        <input
                            required
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                            placeholder="e.g. Docker Compose Up"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Command</label>
                        <textarea
                            required
                            rows={3}
                            value={formData.command}
                            onChange={e => setFormData({ ...formData, command: e.target.value })}
                            className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-primary font-mono text-sm"
                            placeholder="docker-compose up -d"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                        <input
                            type="text"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                            placeholder="Starts the containers in detached mode"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Tags (comma separated)</label>
                        <input
                            type="text"
                            value={formData.tags}
                            onChange={e => setFormData({ ...formData, tags: e.target.value })}
                            className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                            placeholder="docker, dev, deploy"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Link Instruction (Optional)</label>
                        <select
                            value={formData.linkedInstructionId}
                            onChange={e => setFormData({ ...formData, linkedInstructionId: e.target.value })}
                            className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-primary text-sm"
                        >
                            <option value="">-- None --</option>
                            {instructions.map(inst => (
                                <option key={inst.id} value={inst.id}>
                                    {inst.title}
                                </option>
                            ))}
                        </select>
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
                            Save Command
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Commands;
