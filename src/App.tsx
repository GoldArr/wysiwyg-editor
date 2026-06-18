import { useState, useRef, useEffect, useCallback } from 'react';
import CodePane from './components/CodePane';
import VisualPane from './components/VisualPane';
import MenuBar from './components/MenuBar';
import { Editor } from '@tiptap/react';
import { Copy, Check, Layout, Columns, Moon, Sun, FileCode2, FileType2, Maximize, Minimize, Save, FolderOpen } from 'lucide-react';
import beautify from 'js-beautify';

const STORAGE_KEY = 'wysiwyg_content';

const App = () => {
  const [content, setContent] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || '# Привет!\nЭто двусторонний редактор.\n\n- Редактируй **здесь**\n- Или редактируй **справа**\n\nВсе синхронизируется в реальном времени!';
  });
  const [copied, setCopied] = useState<'md' | 'html' | null>(null);
  
  const [codeMode, setCodeMode] = useState<'markdown' | 'html'>('markdown');
  const [isDark, setIsDark] = useState(() => localStorage.getItem('wysiwyg_theme') === 'dark');
  const [isZenMode, setIsZenMode] = useState(false);
  
  const [editorInstance, setEditorInstance] = useState<Editor | null>(null);
  
  const leftPaneRef = useRef<HTMLDivElement>(null);
  const rightPaneRef = useRef<HTMLDivElement>(null);
  const isSyncingScroll = useRef(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, content);
  }, [content]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('wysiwyg_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('wysiwyg_theme', 'light');
    }
  }, [isDark]);

  const handleCodeChange = (newCode: string) => {
    setContent(newCode); 
  };

  const handleVisualChange = useCallback(() => {
    if (!editorInstance) return;
    
    if (codeMode === 'markdown') {
      const md = (editorInstance as any).storage.markdown.getMarkdown();
      setContent(md);
    } else {
      const rawHtml = editorInstance.getHTML();
      const formattedHtml = beautify.html(rawHtml, { indent_size: 2, wrap_line_length: 80 });
      setContent(formattedHtml);
    }
  }, [editorInstance, codeMode]);

  const toggleCodeMode = () => {
    if (!editorInstance) return;
    
    if (codeMode === 'markdown') {
      const rawHtml = editorInstance.getHTML();
      const formattedHtml = beautify.html(rawHtml, { indent_size: 2, wrap_line_length: 80 });
      setContent(formattedHtml);
      setCodeMode('html');
    } else {
      const md = (editorInstance as any).storage.markdown.getMarkdown();
      setContent(md);
      setCodeMode('markdown');
    }
  };

  const handleScroll = (source: 'left' | 'right') => {
    if (isSyncingScroll.current) {
      isSyncingScroll.current = false;
      return;
    }
    const sourceEl = source === 'left' ? leftPaneRef.current : rightPaneRef.current;
    const targetEl = source === 'left' ? rightPaneRef.current : leftPaneRef.current;

    if (sourceEl && targetEl) {
      isSyncingScroll.current = true;
      const percentage = sourceEl.scrollTop / (sourceEl.scrollHeight - sourceEl.clientHeight);
      targetEl.scrollTop = percentage * (targetEl.scrollHeight - targetEl.clientHeight);
    }
  };

  const copyToClipboard = (text: string, type: 'md' | 'html') => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleCopy = (type: 'md' | 'html') => {
    if (!editorInstance) return;
    if (type === 'html') {
      const rawHtml = editorInstance.getHTML();
      copyToClipboard(beautify.html(rawHtml, { indent_size: 2 }), 'html');
    } else {
      const md = (editorInstance as any).storage.markdown.getMarkdown();
      copyToClipboard(md, 'md');
    }
  };

  // Local First: Сохранение файла
  const handleSaveFile = async () => {
    if (!editorInstance) return;
    const format = codeMode === 'markdown' ? 'md' : 'html';
    const textToSave = codeMode === 'markdown' 
      ? (editorInstance as any).storage.markdown.getMarkdown() 
      : beautify.html(editorInstance.getHTML(), { indent_size: 2 });
    
    try {
      if ('showSaveFilePicker' in window) {
        // Используем современный File System Access API
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: `document.${format}`,
          types: [{
            description: format === 'md' ? 'Markdown File' : 'HTML Document',
            accept: { [format === 'md' ? 'text/markdown' : 'text/html']: [`.${format}`] },
          }],
        });
        const writable = await handle.createWritable();
        await writable.write(textToSave);
        await writable.close();
      } else {
        // Фолбэк для старых браузеров (скачивание)
        const blob = new Blob([textToSave], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `document.${format}`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Save cancelled or failed', err);
    }
  };

  // Local First: Открытие файла
  const handleOpenFile = async () => {
    try {
      if ('showOpenFilePicker' in window) {
        const [handle] = await (window as any).showOpenFilePicker({
          types: [
            { description: 'Markdown Files', accept: { 'text/markdown': ['.md', '.markdown'] } },
            { description: 'HTML Files', accept: { 'text/html': ['.html', '.htm'] } }
          ],
        });
        const file = await handle.getFile();
        const text = await file.text();
        
        // Устанавливаем режим в зависимости от расширения
        if (file.name.endsWith('.html') || file.name.endsWith('.htm')) {
          setCodeMode('html');
          setContent(beautify.html(text, { indent_size: 2 }));
        } else {
          setCodeMode('markdown');
          setContent(text);
        }
      } else {
        // Фолбэк: классический input type="file"
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.md,.markdown,.html,.htm';
        input.onchange = async (e: any) => {
          const file = e.target.files[0];
          if (!file) return;
          const text = await file.text();
          if (file.name.endsWith('.html') || file.name.endsWith('.htm')) {
            setCodeMode('html');
            setContent(beautify.html(text, { indent_size: 2 }));
          } else {
            setCodeMode('markdown');
            setContent(text);
          }
        };
        input.click();
      }
    } catch (err) {
      console.error('Open cancelled or failed', err);
    }
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
                onClick={handleOpenFile}
                className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Открыть файл с компьютера"
              >
                <FolderOpen size={18} />
              </button>
              <button 
                onClick={handleSaveFile}
                className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Сохранить как файл"
              >
                <Save size={18} />
              </button>
            </div>

            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>

            <button 
              onClick={() => setIsZenMode(true)}
              className="p-2.5 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Zen Mode (Скрыть лишнее)"
            >
              <Maximize size={20} />
            </button>

            <button 
              onClick={() => setIsDark(!isDark)}
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
              onChange={handleCodeChange} 
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

      {/* Статус-бар */}
      {!isZenMode && (
        <footer className="px-6 py-3 text-[11px] font-medium text-gray-500 dark:text-gray-400 flex justify-between shrink-0 bg-[#f3f3f3] dark:bg-[#1a1a1a] transition-colors duration-200">
          <div className="flex gap-6 uppercase tracking-wider">
            <span>Символов: {content.length}</span>
            <span>Режим: {codeMode}</span>
            <span className="text-green-600 dark:text-green-400 hidden sm:inline">Autosaved</span>
          </div>
          <div className="flex gap-2 items-center uppercase tracking-wider">
            <span>Editor Studio v1.0</span>
          </div>
        </footer>
      )}
    </div>
  );
};

export default App;
