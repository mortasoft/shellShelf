import React, { useState, useEffect } from 'react';
import { Plus, Save, Trash2, FileText, Copy, Search, Tag } from 'lucide-react';
import Modal from '../components/Modal';
import { useDialog } from '../context/DialogContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';

import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/scripts`;

interface Script {
    filename: string;
    tags: string[];
    lastModified?: string;
}

const ScriptsPage = () => {
    const { theme } = useTheme();
    const { showToast } = useToast();
    const { showConfirm } = useDialog();
    const [scripts, setScripts] = useState<Script[]>([]);
    const [selectedScript, setSelectedScript] = useState<string | null>(null);
    const [currentTags, setCurrentTags] = useState<string[]>([]); // Tags for the currently selected/edited script
    const [tagsInput, setTagsInput] = useState(''); // Text input for tags editing
    const [content, setContent] = useState('');

    // Search & Filter
    const [search, setSearch] = useState('');

    // Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newFilename, setNewFilename] = useState('');
    const [newTags, setNewTags] = useState(''); // Tags input for new script

    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    useEffect(() => {
        fetchScripts();
    }, []);

    useEffect(() => {
        if (selectedScript) {
            loadScriptContent(selectedScript);
        } else {
            setContent('');
            setCurrentTags([]);
            setTagsInput('');
        }
    }, [selectedScript]);

    const fetchScripts = async () => {
        try {
            const res = await fetch(API_URL);
            const data = await res.json();
            setScripts(data); // data is now Script[]
        } catch (error) {
            console.error('Error fetching scripts:', error);
        }
    };

    const loadScriptContent = async (filename: string) => {
        try {
            const res = await fetch(`${API_URL}/${filename}`);
            const data = await res.json();
            setContent(data.content);
            const tags = data.tags || [];
            setCurrentTags(tags);
            setTagsInput(tags.join(', '));
            setHasUnsavedChanges(false);
        } catch (error) {
            console.error('Error loading script:', error);
        }
    };

    // ... inside return ...
    <input
        type="text"
        value={tagsInput}
        onChange={(e) => {
            setTagsInput(e.target.value);
            const newTags = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
            setCurrentTags(newTags);
            setHasUnsavedChanges(true);
        }}
        placeholder="Add tags (comma separated)..."
        className="text-sm bg-transparent border-none text-gray-400 focus:text-white focus:outline-none w-full border-b border-transparent focus:border-white/10 transition-colors pb-0.5 font-mono"
    />

    const handleSave = async (filename: string = selectedScript!) => {
        if (!filename) return;
        try {
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    filename,
                    content,
                    tags: currentTags
                })
            });
            setHasUnsavedChanges(false);
            fetchScripts(); // Refresh list to update tags
            showToast('Script saved successfully!', 'success');

            // If we are just saving changes to current script, no UI reset needed beyond unsaved flag
        } catch (error) {
            console.error('Error saving script:', error);
        }
    };

    // Create new script
    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newFilename) return;

        const tagsArray = newTags.split(',').map(t => t.trim()).filter(Boolean);
        const initialContent = '# New Script\n';

        try {
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    filename: newFilename,
                    content: initialContent,
                    tags: tagsArray
                })
            });

            await fetchScripts();
            setIsModalOpen(false);
            setNewFilename('');
            setNewTags('');
            setSelectedScript(newFilename);
            setContent(initialContent);
            setCurrentTags(tagsArray);
        } catch (error) {
            console.error('Error creating script:', error);
        }
    };

    // Hooks moved to top

    const handleDelete = async (e: React.MouseEvent, filename: string) => {
        e.stopPropagation();
        const confirmed = await showConfirm(`Are you sure you want to delete ${filename}?`, {
            confirmText: 'Delete',
            title: 'Delete Script'
        });
        if (!confirmed) return;

        try {
            await fetch(`${API_URL}/${filename}`, { method: 'DELETE' });
            if (selectedScript === filename) {
                setSelectedScript(null);
                setContent('');
                setCurrentTags([]);
            }
            fetchScripts();
        } catch (error) {
            console.error('Error deleting script:', error);
        }
    };

    // Filtering logic
    const filteredScripts = scripts.filter(script =>
        script.filename.toLowerCase().includes(search.toLowerCase()) ||
        script.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
    );

    // Get all unique tags for filter suggestions
    const allTags = Array.from(new Set(scripts.flatMap(s => s.tags))).sort();

    return (
        <div className="flex h-[calc(100vh-8rem)]">
            {/* Sidebar List */}
            <div className="w-80 border-r border-white/10 pr-4 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Scripts</h2>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className={`
                            p-2 rounded-lg transition-all duration-200 ease-out
                            active:scale-95 hover:scale-105 hover:shadow-lg
                            ${theme === 'matrix'
                                ? 'bg-green-500/20 text-green-500 border border-green-500/50 hover:bg-green-500/30 hover:shadow-[0_0_15px_rgba(34,197,94,0.5)]'
                                : 'bg-primary/20 hover:bg-primary/30 text-primary shadow-primary/20'
                            }
                        `}
                    >
                        <Plus size={20} />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="mb-4 space-y-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search scripts..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-surface border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
                        />
                    </div>
                    {/* Tags Filter */}
                    <div className="flex flex-wrap gap-2">
                        {allTags.map(tag => (
                            <button
                                key={tag}
                                onClick={() => setSearch(search === tag ? '' : tag)}
                                className={`
                                    px-2 py-0.5 rounded-full text-[10px] font-medium border transition-colors whitespace-nowrap
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

                <div className="flex-1 overflow-y-auto space-y-2">
                    {filteredScripts.map(script => (
                        <div
                            key={script.filename}
                            onClick={() => setSelectedScript(script.filename)}
                            className={`p-3 rounded-lg flex justify-between items-start cursor-pointer group transition-all ${selectedScript === script.filename
                                ? 'bg-primary/20 text-primary font-medium'
                                : 'bg-surface hover:bg-white/5 text-gray-400 hover:text-white'
                                }`}
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <FileText size={16} className="shrink-0" />
                                    <span className="truncate text-sm font-medium">{script.filename}</span>
                                </div>
                                {script.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 ml-6">
                                        {script.tags.map(tag => (
                                            <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-black/20 text-current opacity-70">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={(e) => handleDelete(e, script.filename)}
                                className={`p-1.5 rounded-md transition-colors shrink-0 ml-2 ${selectedScript === script.filename
                                    ? 'hover:bg-primary/20 text-primary/70 hover:text-primary'
                                    : 'hover:bg-red-500/20 text-transparent group-hover:text-gray-400 hover:text-red-400'
                                    }`}
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}

                    {filteredScripts.length === 0 && (
                        <div className="text-center text-gray-500 py-8 text-sm">
                            {scripts.length === 0 ? "No scripts found. Create one!" : "No matches found."}
                        </div>
                    )}
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 pl-6 flex flex-col">
                {selectedScript ? (
                    <>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex-1 mr-4">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-lg font-mono font-bold text-primary">{selectedScript}</h3>
                                        {hasUnsavedChanges && (
                                            <span className="text-xs text-yellow-500 font-medium px-2 py-0.5 rounded-full bg-yellow-500/10">
                                                Unsaved changes
                                            </span>
                                        )}
                                    </div>
                                    {(() => {
                                        const currentScript = scripts.find(s => s.filename === selectedScript);
                                        if (currentScript?.lastModified) {
                                            return (
                                                <span className="text-[10px] text-gray-500 font-mono">
                                                    Last updated: {new Date(currentScript.lastModified).toLocaleDateString()} {new Date(currentScript.lastModified).toLocaleTimeString()}
                                                </span>
                                            );
                                        }
                                        return null;
                                    })()}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Tag size={14} className="text-gray-500" />
                                    <input
                                        type="text"
                                        value={tagsInput}
                                        onChange={(e) => {
                                            setTagsInput(e.target.value);
                                            const newTags = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
                                            setCurrentTags(newTags);
                                            setHasUnsavedChanges(true);
                                        }}
                                        placeholder="Add tags (comma separated)..."
                                        className="text-sm bg-transparent border-none text-gray-400 focus:text-white focus:outline-none w-full border-b border-transparent focus:border-white/10 transition-colors pb-0.5 font-mono"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        const command = `curl -sL ${API_BASE_URL}/raw/${selectedScript} | bash`;
                                        navigator.clipboard.writeText(command);
                                        showToast('Execution command copied to clipboard!', 'success');
                                    }}
                                    className={`
                                        flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
                                        border
                                        ${theme === 'matrix'
                                            ? 'bg-black/40 border-green-500/30 text-green-400 hover:bg-green-500/10 hover:border-green-500/60'
                                            : 'bg-surface border-white/10 hover:bg-white/5 text-gray-300'
                                        }
                                    `}
                                    title="Copy execution command"
                                >
                                    <Copy size={18} />
                                    Copy Exec Command
                                </button>
                                <button
                                    onClick={() => handleSave()}
                                    disabled={!hasUnsavedChanges}
                                    className={`
                                        flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
                                        active:scale-95 hover:shadow-lg
                                        ${!hasUnsavedChanges
                                            ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                                            : theme === 'matrix'
                                                ? 'bg-green-500/20 text-green-500 border border-green-500/50 hover:bg-green-500/30 hover:shadow-[0_0_15px_rgba(34,197,94,0.5)]'
                                                : 'bg-primary text-white hover:brightness-110 shadow-primary/20'
                                        }
                                    `}
                                >
                                    <Save size={18} />
                                    Save Changes
                                </button>
                            </div>
                        </div>

                        <textarea
                            value={content}
                            onChange={(e) => {
                                setContent(e.target.value);
                                setHasUnsavedChanges(true);
                            }}
                            className="flex-1 w-full bg-surface border border-white/10 rounded-xl p-6 font-mono text-sm leading-relaxed focus:outline-none focus:border-primary/50 resize-none text-gray-300"
                            spellCheck={false}
                        />
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500 border border-white/5 border-dashed rounded-xl bg-white/[0.02]">
                        <FileText size={48} className="mb-4 opacity-20" />
                        <p>Select a script to view or edit</p>
                    </div>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Create New Script"
            >
                <form onSubmit={handleCreate}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-400 mb-1">Filename</label>
                        <input
                            required
                            autoFocus
                            type="text"
                            value={newFilename}
                            onChange={e => setNewFilename(e.target.value)}
                            className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-primary font-mono text-sm"
                            placeholder="myscript.sh"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-400 mb-1">Tags (comma separated)</label>
                        <input
                            type="text"
                            value={newTags}
                            onChange={e => setNewTags(e.target.value)}
                            className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-primary font-mono text-sm"
                            placeholder="util, bash, deploy"
                        />
                    </div>
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
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
                            Create
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default ScriptsPage;
