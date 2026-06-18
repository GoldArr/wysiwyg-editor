import { useState, useEffect, useCallback } from 'react';
import CodePane from './components/CodePane';
import VisualPane from './components/VisualPane';
import MenuBar from './components/MenuBar';
import AppHeader from './components/AppHeader';
import StatusBar from './components/StatusBar';
import { useTheme } from './hooks/useTheme';
import { useScrollSync } from './hooks/useScrollSync';
import { useFileSystem } from './hooks/useFileSystem';
import { getFormattedHtml, getMarkdown } from './utils/editorUtils';
import type { Editor } from './types/editor';
import { FileCode2, FileType2, Minimize } from 'lucide-react';

const STORAGE_KEY = 'wysiwyg_content';
type CodeMode = 'markdown' | 'html';

const App = () => {
  const [content, setContent] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || '# Привет!\nЭто двусторонний редактор.\n\n- Редактируй **здесь**\n- Или редактируй **справа**\n\nВсе синхронизируется в реальном времени!';
  });
  const [codeMode, setCodeMode] = useState<CodeMode>('markdown');
  const [isZenMode, setIsZenMode] = useState(false);
  const [editorInstance, setEditorInstance] = useState<Editor | null>(null);
  
  // Custom Hooks
  const { isDark, toggleTheme } = useTheme();
  const { leftPaneRef, rightPaneRef, handleScroll } = useScrollSync();
  const { saveFile, openFile } = useFileSystem(editorInstance, codeMode, (newContent, newMode) => {
    setContent(newContent);
    setCodeMode(newMode);
  });

  // LocalStorage Auto-save
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, content);
  }, [content]);

  const handleVisualChange = useCallback(() => {
    if (!editorInstance) return;
    const newContent = codeMode === 'markdown' 
      ? getMarkdown(editorInstance) 
      : getFormattedHtml(editorInstance);
    setContent(newContent);
  }, [editorInstance, codeMode]);

  const toggleCodeMode = () => {
    if (!editorInstance) return;
    const newContent = codeMode === 'markdown' 
      ? getFormattedHtml(editorInstance) 
      : getMarkdown(editorInstance);
    
    setContent(newContent);
    setCodeMode(prev => prev === 'markdown' ? 'html' : 'markdown');
  };

  return (
    <div className="h-screen flex flex-col bg-[#fdfdfd] dark:bg-[#121212] overflow-hidden font-sans transition-colors duration-200">
      
      {isZenMode && (
        <button 
          onClick={() => setIsZenMode(false)}
          className="absolute top-4 right-4 z-50 p-3 bg-gray-800/50 hover:bg-gray-800 text-white rounded-full shadow-lg backdrop-blur-sm transition-all"
          title="Выйти из Zen Mode"
        >
          <Minimize size={20} />
        </button>
      )}

      {!isZenMode && (
        <AppHeader 
          isDark={isDark}
          onToggleTheme={toggleTheme}
          onToggleZen={() => setIsZenMode(true)}
          onOpenFile={openFile}
          onSaveFile={saveFile}
          editorInstance={editorInstance}
        />
      )}

      {/* Панель инструментов (Tiptap) */}
      <div className={`shrink-0 mb-4 ${isZenMode ? 'mt-4 opacity-30 hover:opacity-100 transition-opacity' : 'mt-2'}`}>
        <MenuBar editor={editorInstance} />
      </div>

      {/* Основной контент */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden px-4 pb-4 gap-4">
        {/* Левая панель - Код */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#f3f3f3] dark:bg-[#1e1e1e] rounded-[32px] p-2 transition-colors duration-200">
          <div className="mb-2 px-4 pt-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
              <span className={`w-2 h-2 rounded-full ${codeMode === 'markdown' ? 'bg-orange-400' : 'bg-green-400'}`}></span>
              {codeMode === 'markdown' ? 'Markdown' : 'HTML'}
            </div>
            <button 
              onClick={toggleCodeMode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300 text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-sm"
            >
              {codeMode === 'markdown' ? <FileCode2 size={14} /> : <FileType2 size={14} />}
              {codeMode === 'markdown' ? 'Перейти в HTML' : 'Перейти в MD'}
            </button>
          </div>
          <div className="flex-1 overflow-hidden relative">
            <CodePane 
              value={content} 
              language={codeMode}
              onChange={setContent} 
              scrollRef={leftPaneRef}
              onScroll={() => handleScroll('left')}
            />
          </div>
        </div>

        {/* Правая панель - Visual */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#f3f3f3] dark:bg-[#1e1e1e] rounded-[32px] p-2 transition-colors duration-200">
          <div className="mb-2 px-4 pt-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              Визуальный редактор
            </div>
          </div>
          <div className="flex-1 overflow-hidden relative">
            <VisualPane 
              content={content} 
              onUpdate={handleVisualChange} 
              onEditorReady={setEditorInstance}
              scrollRef={rightPaneRef}
              onScroll={() => handleScroll('right')}
            />
          </div>
        </div>
      </main>

      {!isZenMode && <StatusBar contentLength={content.length} codeMode={codeMode} />}
    </div>
  );
};

export default App;
