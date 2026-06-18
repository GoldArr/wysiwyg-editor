import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';
import React, { useEffect } from 'react';

interface VisualPaneProps {
  /** Текст в формате Markdown или HTML */
  content: string;
  /** Колбэк при обновлении содержимого (вызывается без аргументов, родитель сам забирает нужный формат) */
  onUpdate: () => void;
  /** Обработчик прокрутки для синхронизации */
  onScroll?: (e: React.UIEvent<HTMLElement>) => void;
  /** Ссылка на DOM-элемент для управления прокруткой */
  scrollRef?: React.RefObject<HTMLDivElement | null>;
  /** Колбэк для передачи инстанса редактора родительскому компоненту (исправляет баг с появлением тулбара) */
  onEditorReady?: (editor: Editor) => void;
}

/**
 * Визуальный WYSIWYG редактор на базе Tiptap.
 */
const VisualPane = ({ content, onUpdate, onScroll, scrollRef, onEditorReady }: VisualPaneProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Markdown.configure({
        html: true,
        tightLists: true,
        bulletListMarker: '-',
        linkify: true,
        breaks: true,
      }),
    ],
    content: content,
    onUpdate: () => {
      // Уведомляем App о том, что визуальный редактор изменился
      onUpdate();
    },
    editorProps: {
      attributes: {
        class: 'prose prose-blue dark:prose-invert focus:outline-none min-h-full p-6 max-w-none',
      },
    },
  });

  // Экспортируем инстанс редактора во внешний мир для MenuBar и конвертации
  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  // Синхронизация контента: Markdown/HTML (из CodePane) -> VisualPane
  useEffect(() => {
    // Надежный способ избежать зацикливания:
    // Мы обновляем Tiptap только если он СЕЙЧАС НЕ в фокусе (т.е. пользователь печатает в CodePane).
    if (editor && !editor.isFocused) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content, editor]);

  return (
    <div 
      ref={scrollRef}
      onScroll={onScroll}
      className="h-full rounded-3xl bg-white dark:bg-[#1e1e1e] overflow-y-auto shadow-md dark:shadow-none transition-colors duration-200"
    >
      <EditorContent editor={editor} />
    </div>
  );
};

export default VisualPane;
