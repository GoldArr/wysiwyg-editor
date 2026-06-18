import { useState, useRef, useEffect, useCallback } from 'react';
import CodePane from './components/CodePane';
import VisualPane from './components/VisualPane';
import MenuBar from './components/MenuBar';
import { Editor } from '@tiptap/react';
import { Copy, Check, Layout, Columns, Moon, Sun, FileCode2, FileType2 } from 'lucide-react';
import beautify from 'js-beautify';

/**
 * Основной компонент приложения "WYSIWYG Sync Editor".
 * MD3 Стилизация, Dark Mode, Markdown/HTML переключение, js-beautify.
 */
const App = () => {
  const [content, setContent] = useState('# Привет!\nЭто двусторонний редактор.\n\n- Редактируй **здесь**\n- Или редактируй **справа**\n\nВсе синхронизируется в реальном времени!');
  const [copied, setCopied] = useState(false);
  
  // Режимы и темы
  const [codeMode, setCodeMode] = useState<'markdown' | 'html'>('markdown');
  const [isDark, setIsDark] = useState(false);
  
  // Состояние редактора (вместо useRef), чтобы MenuBar обновлялся сразу
  const [editorInstance, setEditorInstance] = useState<Editor | null>(null);
  
  const leftPaneRef = useRef<HTMLDivElement>(null);
  const rightPaneRef = useRef<HTMLDivElement>(null);
  const isSyncingScroll = useRef(false);

  // Переключение темной темы через добавление класса .dark к <html>
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Обработчик изменения из панели кода (Слева)
  const handleCodeChange = (newCode: string) => {
    setContent(newCode); // VisualPane перехватит это и обновит Tiptap, если не в фокусе
  };

  // Обработчик изменения из визуальной панели (Справа)
  const handleVisualChange = useCallback(() => {
    if (!editorInstance) return;
    
    if (codeMode === 'markdown') {
      const md = (editorInstance as any).storage.markdown.getMarkdown();
      setContent(md);
    } else {
      // Форматируем сырой HTML перед вставкой в левую панель
      const rawHtml = editorInstance.getHTML();
      const formattedHtml = beautify.html(rawHtml, { indent_size: 2, wrap_line_length: 80 });
      setContent(formattedHtml);
    }
  }, [editorInstance, codeMode]);

  // Переключение режима кода (MD <-> HTML)
  const toggleCodeMode = () => {
    if (!editorInstance) return;
    
    if (codeMode === 'markdown') {
      // При переходе в HTML: берем HTML, форматируем и устанавливаем
      const rawHtml = editorInstance.getHTML();
      const formattedHtml = beautify.html(rawHtml, { indent_size: 2, wrap_line_length: 80 });
      setContent(formattedHtml);
      setCodeMode('html');
    } else {
      // При переходе в MD: берем MD и устанавливаем
      const md = (editorInstance as any).storage.markdown.getMarkdown();
      setContent(md);
      setCodeMode('markdown');
    }
  };

  // Синхронизация прокрутки
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyHtmlFromTiptap = () => {
    if (editorInstance) {
      const rawHtml = editorInstance.getHTML();
      copyToClipboard(beautify.html(rawHtml, { indent_size: 2 }));
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#fdfdfd] dark:bg-[#121212] overflow-hidden font-sans transition-colors duration-200">
      {/* Шапка в стиле MD3 (Floating App Bar) */}
      <header className="m-4 mb-2 bg-[#f3f3f3] dark:bg-[#2a2a2a] rounded-full px-6 py-3 flex items-center justify-between shadow-sm shrink-0 transition-colors duration-200">
        <div className="flex items-center gap-3">
          <div className="bg-[#0061a4] dark:bg-[#9ecafe] p-2 rounded-full text-white dark:text-[#003258]">
            <Layout size={20} />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">Editor Studio</h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Переключатель темы */}
          <button 
            onClick={() => setIsDark(!isDark)}
            className="p-2.5 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="Переключить тему"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          <button 
            onClick={() => copyToClipboard(content)}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-[#0061a4] dark:bg-[#9ecafe] text-white dark:text-[#003258] hover:opacity-90 rounded-full transition-all shadow-md hover:shadow-lg"
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            <span className="hidden md:inline">{copied ? 'Скопировано!' : 'Скопировать код'}</span>
          </button>

          <button 
            onClick={copyHtmlFromTiptap}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all shadow-sm hover:shadow-md"
            title="Скопировать готовый HTML"
          >
            <Columns size={18} />
          </button>
        </div>
      </header>

      {/* Панель инструментов (Tiptap) */}
      <div className="shrink-0 mb-4 mt-2">
        <MenuBar editor={editorInstance} />
      </div>

      {/* Основной контент */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden px-4 pb-4 gap-4">
        {/* Левая панель - Код (Markdown или HTML) */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#f3f3f3] dark:bg-[#1e1e1e] rounded-[32px] p-2 transition-colors duration-200">
          <div className="mb-2 px-4 pt-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
              <span className={`w-2 h-2 rounded-full ${codeMode === 'markdown' ? 'bg-orange-400' : 'bg-green-400'}`}></span>
              {codeMode === 'markdown' ? 'Markdown' : 'HTML'} Код
            </div>
            {/* Переключатель MD/HTML */}
            <button 
              onClick={toggleCodeMode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300 text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-sm"
            >
              {codeMode === 'markdown' ? <FileCode2 size={14} /> : <FileType2 size={14} />}
              {codeMode === 'markdown' ? 'Показать HTML' : 'Показать Markdown'}
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
      <footer className="px-6 py-3 text-[11px] font-medium text-gray-500 dark:text-gray-400 flex justify-between shrink-0 bg-[#f3f3f3] dark:bg-[#1a1a1a] transition-colors duration-200">
        <div className="flex gap-6 uppercase tracking-wider">
          <span>Символов: {content.length}</span>
          <span>Режим: {codeMode}</span>
          <span className="text-green-600 dark:text-green-400">Sync: OK</span>
        </div>
        <div className="flex gap-2 items-center uppercase tracking-wider">
          <Columns size={12} />
          <span>MD3 Workspace</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
