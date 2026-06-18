import { useEditor, EditorContent } from '@tiptap/react';
import type { Editor } from '../types/editor';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import React, { useEffect } from 'react';

interface VisualPaneProps {
  /** Текст в формате Markdown или HTML */
  content: string;
  /** Колбэк при обновлении содержимого */
  onUpdate: () => void;
  /** Обработчик прокрутки для синхронизации */
  onScroll?: (e: React.UIEvent<HTMLElement>) => void;
  /** Ссылка на DOM-элемент для управления прокруткой */
  scrollRef?: React.RefObject<HTMLDivElement | null>;
  /** Колбэк для передачи инстанса редактора родительскому компоненту */
  onEditorReady?: (editor: Editor) => void;
}

/**
 * Визуальный WYSIWYG редактор на базе Tiptap.
 * Поддерживает Drag-and-Drop изображений и расширенное форматирование.
 */
const VisualPane = ({ content, onUpdate, onScroll, scrollRef, onEditorReady }: VisualPaneProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // Отключаем стандартный, если захотим lowlight позже
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-2xl shadow-lg max-w-full h-auto my-4',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight.configure({ multicolor: true }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
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
      onUpdate();
    },
    editorProps: {
      attributes: {
        class: 'prose prose-blue dark:prose-invert focus:outline-none min-h-full p-8 max-w-none',
      },
      // @ts-expect-error - Tiptap handleDrop types are complex
      handleDrop: (view, event, _slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0];
          const type = file.type;

          if (type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (readerEvent) => {
              const base64 = readerEvent.target?.result as string;
              view.dispatch(view.state.tr.replaceSelectionWith(
                view.state.schema.nodes.image.create({ src: base64 })
              ));
            };
            reader.readAsDataURL(file);
            return true; // Обработано
          }
        }
        return false;
      },
    },
  });

  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  useEffect(() => {
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
