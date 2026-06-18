import React from 'react';
import EditorImport from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-markup'; // Для поддержки HTML
import 'prismjs/themes/prism.css';

// Обработка проблемы с ESM/CJS экспортами в Vite
// @ts-expect-error - react-simple-code-editor ESM mismatch
const Editor = EditorImport.default || EditorImport;

interface CodePaneProps {
  value: string;
  language: 'markdown' | 'html';
  onChange: (value: string) => void;
  onScroll?: (e: React.UIEvent<HTMLElement>) => void;
  scrollRef?: React.RefObject<HTMLDivElement | null>;
}

const CodePane = ({ value, language, onChange, onScroll, scrollRef }: CodePaneProps) => {
  // Выбираем грамматику в зависимости от языка
  const grammar = language === 'html' ? Prism.languages.markup : Prism.languages.markdown;

  return (
    <div 
      ref={scrollRef}
      onScroll={onScroll}
      className="h-full border border-gray-200 dark:border-gray-700 rounded-3xl bg-[#f5f2f0] dark:bg-[#1e1e1e] overflow-y-auto shadow-sm transition-colors duration-200"
    >
      <div className="min-h-full font-mono text-sm dark:text-gray-200">
        <Editor
          value={value}
          onValueChange={onChange}
          highlight={(code: string) => Prism.highlight(code, grammar, language === 'html' ? 'markup' : 'markdown')}
          padding={24}
          className="min-h-full"
          style={{
            fontFamily: '"Fira Code", "Fira Mono", monospace',
            fontSize: 14,
            outline: 'none',
          }}
        />
      </div>
    </div>
  );
};

export default CodePane;
