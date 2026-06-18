import { Layout, FolderOpen, Save, Maximize, Sun, Moon, Check, Copy, Columns } from 'lucide-react';
import { useState } from 'react';
import type { Editor } from '../types/editor';
import { getFormattedHtml, getMarkdown } from '../utils/editorUtils';

interface AppHeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onToggleZen: () => void;
  onOpenFile: () => void;
  onSaveFile: () => void;
  editorInstance: Editor | null;
}

const AppHeader = ({ 
  isDark, 
  onToggleTheme, 
  onToggleZen, 
  onOpenFile, 
  onSaveFile,
  editorInstance
}: AppHeaderProps) => {
  const [copied, setCopied] = useState<'md' | 'html' | null>(null);

  const copyToClipboard = (text: string, type: 'md' | 'html') => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleCopy = (type: 'md' | 'html') => {
    if (!editorInstance) return;
    if (type === 'html') {
      copyToClipboard(getFormattedHtml(editorInstance), 'html');
    } else {
      copyToClipboard(getMarkdown(editorInstance), 'md');
    }
  };

  return (
    <header className="m-4 mb-2 bg-[#f3f3f3] dark:bg-[#2a2a2a] rounded-full px-6 py-3 flex items-center justify-between shadow-sm shrink-0 transition-colors duration-200 overflow-x-auto">
      <div className="flex items-center gap-3 shrink-0">
        <div className="bg-[#0061a4] dark:bg-[#9ecafe] p-2 rounded-full text-white dark:text-[#003258]">
          <Layout size={20} />
        </div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white hidden lg:block">Editor Studio</h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Файловые операции */}
        <div className="flex items-center gap-1 bg-white dark:bg-[#1e1e1e] p-1 rounded-full shadow-sm border border-gray-200 dark:border-gray-700">
          <button 
            onClick={onOpenFile}
            className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Открыть файл с компьютера"
          >
            <FolderOpen size={18} />
          </button>
          <button 
            onClick={onSaveFile}
            className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Сохранить как файл"
          >
            <Save size={18} />
          </button>
        </div>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>

        <button 
          onClick={onToggleZen}
          className="p-2.5 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title="Zen Mode (Скрыть лишнее)"
        >
          <Maximize size={20} />
        </button>

        <button 
          onClick={onToggleTheme}
          className="p-2.5 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title="Переключить тему"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        {/* Копирование */}
        <div className="flex bg-[#0061a4] dark:bg-[#9ecafe] text-white dark:text-[#003258] rounded-full shadow-md overflow-hidden">
          <button 
            onClick={() => handleCopy('md')}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium hover:bg-white/20 dark:hover:bg-black/10 transition-all border-r border-white/20 dark:border-black/10"
            title="Скопировать как Markdown"
          >
            {copied === 'md' ? <Check size={18} /> : <Copy size={18} />}
            <span className="hidden sm:inline">MD</span>
          </button>
          <button 
            onClick={() => handleCopy('html')}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium hover:bg-white/20 dark:hover:bg-black/10 transition-all"
            title="Скопировать как HTML"
          >
            {copied === 'html' ? <Check size={18} /> : <Columns size={18} />}
            <span className="hidden sm:inline">HTML</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
