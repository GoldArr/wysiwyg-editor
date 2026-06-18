import { Editor } from '@tiptap/react';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Undo, 
  Redo, 
  Code,
  Heading1,
  Heading2,
  Table as TableIcon,
  BetweenHorizontalEnd,
  BetweenVerticalEnd,
  Trash2
} from 'lucide-react';

interface MenuBarProps {
  editor: Editor | null;
}

const MenuBar = ({ editor }: MenuBarProps) => {
  if (!editor) {
    return (
      <div className="flex flex-wrap gap-2 p-2 bg-[#f3f3f3] dark:bg-[#2a2a2a] h-[53px] items-center px-6 rounded-full mx-4 shadow-sm text-gray-400 dark:text-gray-500 text-xs italic transition-colors duration-200">
        Загрузка панели инструментов...
      </div>
    );
  }

  const items = [
    {
      icon: Bold,
      title: 'Жирный',
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: () => editor.isActive('bold'),
    },
    {
      icon: Italic,
      title: 'Курсив',
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: () => editor.isActive('italic'),
    },
    {
      icon: Heading1,
      title: 'Заголовок 1',
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: () => editor.isActive('heading', { level: 1 }),
    },
    {
      icon: Heading2,
      title: 'Заголовок 2',
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: () => editor.isActive('heading', { level: 2 }),
    },
    {
      icon: List,
      title: 'Маркированный список',
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: () => editor.isActive('bulletList'),
    },
    {
      icon: ListOrdered,
      title: 'Нумерованный список',
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: () => editor.isActive('orderedList'),
    },
    {
      icon: Quote,
      title: 'Цитата',
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: () => editor.isActive('blockquote'),
    },
    {
      icon: Code,
      title: 'Код',
      action: () => editor.chain().focus().toggleCodeBlock().run(),
      isActive: () => editor.isActive('codeBlock'),
    },
  ];

  const tableItems = [
    {
      icon: TableIcon,
      title: 'Вставить таблицу',
      action: () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
    },
    {
      icon: BetweenHorizontalEnd,
      title: 'Добавить строку',
      action: () => editor.chain().focus().addRowAfter().run(),
      disabled: !editor.can().addRowAfter(),
    },
    {
      icon: BetweenVerticalEnd,
      title: 'Добавить колонку',
      action: () => editor.chain().focus().addColumnAfter().run(),
      disabled: !editor.can().addColumnAfter(),
    },
    {
      icon: Trash2,
      title: 'Удалить таблицу',
      action: () => editor.chain().focus().deleteTable().run(),
      disabled: !editor.can().deleteTable(),
    },
  ];

  const historyItems = [
    {
      icon: Undo,
      title: 'Отменить',
      action: () => editor.chain().focus().undo().run(),
    },
    {
      icon: Redo,
      title: 'Повторить',
      action: () => editor.chain().focus().redo().run(),
    },
  ];

  const renderButtons = (btnGroup: any[]) => (
    <div className="flex gap-1 items-center">
      {btnGroup.map((item, index) => (
        <button
          key={index}
          onClick={(e) => {
            e.preventDefault();
            item.action();
          }}
          disabled={item.disabled}
          className={`p-2.5 rounded-full transition-all duration-200 ${
            item.disabled 
              ? 'opacity-30 cursor-not-allowed'
              : item.isActive?.() 
                ? 'bg-[#c2e7ff] dark:bg-[#004d40] text-[#001d35] dark:text-[#80cbc4]' 
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
          title={item.title}
        >
          <item.icon size={18} strokeWidth={item.isActive?.() ? 2.5 : 2} />
        </button>
      ))}
    </div>
  );

  return (
    <div className="flex flex-wrap gap-4 p-2 bg-[#f3f3f3] dark:bg-[#2a2a2a] rounded-full mx-4 shadow-sm transition-colors duration-200 overflow-x-auto">
      {renderButtons(items)}
      <div className="w-px bg-gray-300 dark:bg-gray-600 my-2"></div>
      {renderButtons(tableItems)}
      <div className="w-px bg-gray-300 dark:bg-gray-600 my-2"></div>
      {renderButtons(historyItems)}
    </div>
  );
};

export default MenuBar;
