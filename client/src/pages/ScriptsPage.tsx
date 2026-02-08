import React, { useState, useEffect } from 'react';
import { Plus, Save, Trash2, FileText, Copy, Search, Tag, Pencil, HelpCircle } from 'lucide-react';
import CodeEditor from '../components/CodeEditor';
import Modal from '../components/Modal';
import VariablesModal from '../components/VariablesModal';
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

    // Variables Modal
    const [isVariablesModalOpen, setIsVariablesModalOpen] = useState(false);
    const [detectedVariables, setDetectedVariables] = useState<string[]>([]);

    // Rename Modal
    const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
    const [renameFilename, setRenameFilename] = useState('');

    // Help ModalState
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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

    const handleDelete = async (e: React.MouseEvent, filename: string) => {
        e.stopPropagation();
        const confirmed = await showConfirm(`Are you sure you want to delete ${filename}?`, {
            confirmText: 'Delete',
            title: 'Delete Script',
            variant: 'danger'
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
        <div className="flex flex-col h-[calc(100vh-6rem)] space-y-4">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Scripts</h1>
                    <p className="text-gray-400 mt-1">Manage, edit and serve your shell scripts</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsHelpModalOpen(true)}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                        title="Help & Documentation"
                    >
                        <HelpCircle size={20} />
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
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
                        Create Script
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden rounded-xl border border-white/10 bg-surface/50 backdrop-blur-sm">
                {/* Sidebar List */}
                <div className="w-80 border-r border-white/10 flex flex-col bg-surface/30">
                    <div className="p-4 border-b border-white/5 space-y-4">
                        {/* Search Bar */}
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

                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
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
                <div className="flex-1 pl-6 flex flex-col p-4">
                    {selectedScript ? (
                        <>
                            <div className="flex flex-col xl:flex-row xl:items-start justify-between mb-4 gap-4">
                                <div className="flex-1 w-full xl:mr-4">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-3 group/title">
                                            <h3 className="text-lg font-mono font-bold text-primary truncate max-w-[200px] sm:max-w-md" title={selectedScript}>{selectedScript}</h3>
                                            <button
                                                onClick={() => {
                                                    setRenameFilename(selectedScript);
                                                    setIsRenameModalOpen(true);
                                                }}
                                                className="opacity-0 group-hover/title:opacity-100 p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-all"
                                                title="Rename script"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            {hasUnsavedChanges && (
                                                <span className="text-xs text-yellow-500 font-medium px-2 py-0.5 rounded-full bg-yellow-500/10 whitespace-nowrap">
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
                                    <div className="flex items-center gap-2 mt-2">
                                        <Tag size={14} className="text-gray-500 shrink-0" />
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

                                <div className="flex gap-2 w-full xl:w-auto xl:justify-end">
                                    <button
                                        onClick={() => {
                                            // Detect variables like {{MY_VAR}}
                                            const matches = content.match(/{{([^}]+)}}/g);
                                            if (matches) {
                                                const vars = [...new Set(matches.map(m => m.replace(/{{|}}/g, '').trim()))];
                                                if (vars.length > 0) {
                                                    setDetectedVariables(vars);
                                                    setIsVariablesModalOpen(true);
                                                    return;
                                                }
                                            }

                                            // No variables, copy directly
                                            const baseUrl = API_BASE_URL.startsWith('http')
                                                ? API_BASE_URL
                                                : `${window.location.origin}${API_BASE_URL}`;
                                            const command = `curl -sL ${baseUrl}/raw/${selectedScript} | bash`;
                                            navigator.clipboard.writeText(command);
                                            showToast('Execution command copied to clipboard!', 'success');
                                        }}
                                        className={`
                                            flex-1 xl:flex-none justify-center
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
                                        <span className="whitespace-nowrap">Copy Exec</span>
                                    </button>
                                    <button
                                        onClick={() => handleSave()}
                                        disabled={!hasUnsavedChanges}
                                        className={`
                                            flex-1 xl:flex-none justify-center
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
                                        <span className="whitespace-nowrap">Save</span>
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 min-h-0">
                                <CodeEditor
                                    value={content}
                                    onChange={(val) => {
                                        setContent(val || '');
                                        setHasUnsavedChanges(true);
                                    }}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-500 border border-white/5 border-dashed rounded-xl bg-white/[0.02]">
                            <FileText size={48} className="mb-4 opacity-20" />
                            <p>Select a script to view or edit</p>
                        </div>
                    )}
                </div>

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

            <VariablesModal
                isOpen={isVariablesModalOpen}
                onClose={() => setIsVariablesModalOpen(false)}
                variables={detectedVariables}
                onConfirm={(values) => {
                    const baseUrl = API_BASE_URL.startsWith('http')
                        ? API_BASE_URL
                        : `${window.location.origin}${API_BASE_URL}`;

                    // Build query string
                    const params = new URLSearchParams(values).toString();
                    const command = `curl -sL "${baseUrl}/raw/${selectedScript}?${params}" | bash`;

                    navigator.clipboard.writeText(command);
                    showToast('Command with variables copied!', 'success');
                }}
                onCopyRaw={() => {
                    const baseUrl = API_BASE_URL.startsWith('http')
                        ? API_BASE_URL
                        : `${window.location.origin}${API_BASE_URL}`;
                    const command = `curl -sL "${baseUrl}/raw/${selectedScript}" | bash`;
                    navigator.clipboard.writeText(command);
                    showToast('Raw execution command copied!', 'success');
                }}
            />

            <Modal
                isOpen={isRenameModalOpen}
                onClose={() => setIsRenameModalOpen(false)}
                title="Rename Script"
            >
                <form onSubmit={async (e) => {
                    e.preventDefault();
                    if (!renameFilename) return;
                    try {
                        const res = await fetch(`${API_URL}/${selectedScript}/rename`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ newFilename: renameFilename })
                        });
                        if (res.ok) {
                            showToast('Script renamed successfully', 'success');
                            setSelectedScript(renameFilename);
                            fetchScripts();
                            setIsRenameModalOpen(false);
                        } else {
                            const data = await res.json();
                            showToast(data.error || 'Failed to rename', 'error');
                        }
                    } catch (error) {
                        console.error(error);
                        showToast('Failed to rename script', 'error');
                    }
                }}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-400 mb-1">New Filename</label>
                        <input
                            required
                            autoFocus
                            type="text"
                            value={renameFilename}
                            onChange={e => setRenameFilename(e.target.value)}
                            className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-primary font-mono text-sm"
                            placeholder="myscript.sh"
                        />
                    </div>
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setIsRenameModalOpen(false)}
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
                            Rename
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal
                isOpen={isHelpModalOpen}
                onClose={() => setIsHelpModalOpen(false)}
                title="Script Variables Guide"
            >
                <div className="space-y-4 text-gray-300">
                    <p>
                        You can use variables in your scripts to make them dynamic.
                        When you copy the execution command, ShellShelf will detect these variables and prompt you for values.
                    </p>

                    <div className="bg-black/30 p-4 rounded-lg border border-white/10">
                        <h4 className="font-bold text-white mb-2">Syntax</h4>
                        <code className="text-primary font-mono block mb-2">
                            echo "Hello, {"{{NAME}}"}!"
                        </code>
                        <p className="text-sm text-gray-400">
                            Wrap your variable names in double curly braces.
                        </p>
                    </div>

                    <div className="bg-black/30 p-4 rounded-lg border border-white/10">
                        <h4 className="font-bold text-white mb-2">How it works</h4>
                        <ol className="list-decimal list-inside space-y-2 text-sm">
                            <li>Add placeholders like <code className="text-primary">{"{{IP_ADDRESS}}"}</code> or <code className="text-primary">{"{{PORT}}"}</code> in your script.</li>
                            <li>Click the <strong>Copy Exec</strong> button.</li>
                            <li>A popup will ask you to enter values for each detected variable.</li>
                            <li>The generated curl command will include these values as query parameters.</li>
                        </ol>
                    </div>
                </div>
                <div className="flex justify-end mt-6">
                    <button
                        onClick={() => setIsHelpModalOpen(false)}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                    >
                        Close
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default ScriptsPage;
