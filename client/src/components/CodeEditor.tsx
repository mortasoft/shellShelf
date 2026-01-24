import React, { useEffect } from 'react';
import Editor, { useMonaco } from '@monaco-editor/react';
import { useTheme } from '../context/ThemeContext';

interface CodeEditorProps {
    value: string;
    onChange: (value: string | undefined) => void;
    language?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ value, onChange, language = 'shell' }) => {
    const { theme } = useTheme();
    const monaco = useMonaco();

    const handleEditorDidMount = (_editor: any, monaco: any) => {
        // Force theme update when editor mounts
        monaco.editor.setTheme(theme === 'matrix' ? 'matrix' : 'vs-dark');
    };

    const handleBeforeMount = (monaco: any) => {
        // Define Matrix Theme
        monaco.editor.defineTheme('matrix', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: '', foreground: '00ff41' },
                { token: 'keyword', foreground: 'ffffff', fontStyle: 'bold' },
                { token: 'comment', foreground: '008f11', fontStyle: 'italic' },
                { token: 'string', foreground: 'ccffcc' },
                { token: 'number', foreground: 'ffffff' },
                { token: 'variable', foreground: '00ff41', fontStyle: 'bold' },
                { token: 'operator', foreground: '66ff66' },
                { token: 'type', foreground: 'ccffcc' },
                { token: 'function', foreground: 'ffffff', fontStyle: 'bold' },
            ],
            colors: {
                'editor.background': '#000800', // Deep black-green
                'editor.foreground': '#00ff41',
                'editorCursor.foreground': '#00ff41',
                'editor.lineHighlightBackground': '#001a00',
                'editorLineNumber.foreground': '#006400',
                'editorLineNumber.activeForeground': '#00ff41',
                'editor.selectionBackground': '#003300',
                'editor.inactiveSelectionBackground': '#002200'
            }
        });
    };

    useEffect(() => {
        // Keep theme in sync if it changes externally
        if (monaco) {
            monaco.editor.setTheme(theme === 'matrix' ? 'matrix' : 'vs-dark');
        }
    }, [theme, monaco]);

    return (
        <div className={`h-full w-full rounded-xl overflow-hidden border transition-colors duration-300 ${theme === 'matrix' ? 'border-green-900/50' : 'border-white/10'
            }`}>
            <Editor
                height="100%"
                defaultLanguage={language}
                language={language}
                value={value}
                theme={theme === 'matrix' ? 'matrix' : 'vs-dark'}
                beforeMount={handleBeforeMount}
                onMount={handleEditorDidMount}
                onChange={onChange}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    padding: { top: 16, bottom: 16 },
                    fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                    contextmenu: true,
                    smoothScrolling: true,
                    cursorBlinking: 'smooth',
                    renderLineHighlight: 'all',
                }}
            />
        </div>
    );
};

export default CodeEditor;
