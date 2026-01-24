import { NavLink } from 'react-router-dom';
import { Terminal, FileCode, Command, Monitor, Zap, Book } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Sidebar = () => {
    const { theme, setTheme } = useTheme();

    return (
        <aside className="w-64 bg-surface border-r border-white/10 flex flex-col h-screen fixed left-0 top-0 z-50">
            <div className="p-6 flex items-center gap-3 border-b border-white/10">
                <Terminal className="w-8 h-8 text-primary" />
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    ShellShelf
                </h1>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                <NavLink
                    to="/"
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                            ? 'bg-primary/20 text-primary font-medium'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                        }`
                    }
                >
                    <Command size={20} />
                    <span>Commands</span>
                </NavLink>

                <NavLink
                    to="/scripts"
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                            ? 'bg-primary/20 text-primary font-medium'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                        }`
                    }
                >
                    <FileCode size={20} />
                    <span>Scripts</span>
                </NavLink>

                <NavLink
                    to="/instructions"
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                            ? 'bg-primary/20 text-primary font-medium'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                        }`
                    }
                >
                    <Book size={20} />
                    <span>Instructions</span>
                </NavLink>
            </nav>

            <div className="p-4 border-t border-white/10">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Theme</div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setTheme('default')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm transition-all ${theme === 'default'
                            ? 'bg-primary text-white'
                            : 'bg-white/5 text-gray-400 hover:text-white'
                            }`}
                        title="Default Dark Mode"
                    >
                        <Monitor size={16} />
                        Default
                    </button>
                    <button
                        onClick={() => setTheme('matrix')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm transition-all ${theme === 'matrix'
                            ? 'bg-green-500/20 text-green-500 border border-green-500/50'
                            : 'bg-white/5 text-gray-400 hover:text-green-400'
                            }`}
                        title="Matrix Mode"
                    >
                        <Zap size={16} />
                        Matrix
                    </button>
                </div>
            </div>

            <div className="p-4 text-xs text-gray-500 text-center">
                v1.0.0 &copy; 2026
            </div>
        </aside>
    );
};

export default Sidebar;
