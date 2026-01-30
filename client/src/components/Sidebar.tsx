import { NavLink } from 'react-router-dom';
import { Terminal, FileCode, Command, Monitor, Zap, Book, ChevronLeft, Box } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface SidebarProps {
    isCollapsed: boolean;
    toggle: () => void;
}

const Sidebar = ({ isCollapsed, toggle }: SidebarProps) => {
    const { theme, setTheme } = useTheme();

    return (
        <aside
            className={`
                bg-surface border-r border-white/10 flex flex-col h-screen fixed left-0 top-0 z-50
                transition-all duration-300 ease-in-out
                ${isCollapsed ? 'w-20' : 'w-64'}
            `}
        >
            <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} border-b border-white/10 relative`}>
                <Terminal className="w-8 h-8 text-primary shrink-0 transition-transform hover:scale-110 cursor-pointer" onClick={toggle} />

                <h1 className={`
                    text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent whitespace-nowrap overflow-hidden transition-all duration-300
                    ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}
                `}>
                    ShellShelf
                </h1>

                <button
                    onClick={toggle}
                    className={`
                        absolute -right-3 top-1/2 -translate-y-1/2 
                        bg-surface border border-white/10 rounded-full p-1 
                        text-gray-400 hover:text-white hover:border-primary/50
                        transition-colors shadow-lg
                        ${isCollapsed ? 'rotate-180' : ''}
                    `}
                >
                    <ChevronLeft size={14} />
                </button>
            </div>

            <nav className="flex-1 p-2 space-y-2 flex flex-col items-center">
                {[
                    { to: "/", icon: Command, label: "Commands" },
                    { to: "/scripts", icon: FileCode, label: "Scripts" },
                    { to: "/instructions", icon: Book, label: "Instructions" },
                    { to: "/compose", icon: Box, label: "Compose" }
                ].map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-3 rounded-xl transition-all w-full
                            ${isActive
                                ? 'bg-primary/20 text-primary font-medium'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }
                            ${isCollapsed ? 'justify-center' : ''}
                            `
                        }
                        title={isCollapsed ? item.label : ''}
                    >
                        <item.icon size={22} className="shrink-0" />
                        <span className={`
                            whitespace-nowrap overflow-hidden transition-all duration-300
                            ${isCollapsed ? 'w-0 opacity-0' : 'w-full opacity-100'}
                        `}>
                            {item.label}
                        </span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-white/10">
                {!isCollapsed && (
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2 animate-in fade-in">
                        Theme
                    </div>
                )}
                <div className={`flex ${isCollapsed ? 'flex-col gap-3' : 'gap-2'}`}>
                    <button
                        onClick={() => setTheme('default')}
                        className={`
                            flex items-center justify-center gap-2 py-2 rounded-lg text-sm transition-all
                            ${theme === 'default'
                                ? 'bg-primary text-white'
                                : 'bg-white/5 text-gray-400 hover:text-white'
                            }
                            ${isCollapsed ? 'w-full aspect-square p-0' : 'flex-1'}
                        `}
                        title="Default Dark Mode"
                    >
                        <Monitor size={18} />
                        <span className={`
                            whitespace-nowrap overflow-hidden transition-all duration-300
                            ${isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}
                        `}>
                            Default
                        </span>
                    </button>
                    <button
                        onClick={() => setTheme('matrix')}
                        className={`
                            flex items-center justify-center gap-2 py-2 rounded-lg text-sm transition-all
                            ${theme === 'matrix'
                                ? 'bg-green-500/20 text-green-500 border border-green-500/50'
                                : 'bg-white/5 text-gray-400 hover:text-green-400'
                            }
                            ${isCollapsed ? 'w-full aspect-square p-0' : 'flex-1'}
                        `}
                        title="Matrix Mode"
                    >
                        <Zap size={18} />
                        <span className={`
                            whitespace-nowrap overflow-hidden transition-all duration-300
                            ${isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}
                        `}>
                            Matrix
                        </span>
                    </button>
                </div>
            </div>

            <div className={`p-4 text-xs text-gray-500 text-center transition-all duration-300 overflow-hidden ${isCollapsed ? 'h-0 opacity-0 p-0' : 'h-auto opacity-100'}`}>
                v1.0.8 &copy; 2026
                <div className="text-xs text-gray-500 text-center">Developed by <a href="https://mortasoft.com" target="_blank" rel="noopener noreferrer">Mortasoft.com</a></div>
            </div>
        </aside>
    );
};

export default Sidebar;
