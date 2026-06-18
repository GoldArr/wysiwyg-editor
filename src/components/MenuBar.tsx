import type { Editor } from '../types/editor';
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
  Trash2,
  Image as ImageIcon,
  Link as LinkIcon,
  Unlink,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Highlighter,
  CheckSquare
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

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // Защита от XSS (запрет javascript: ссылок)
    if (!/^https?:\/\//i.test(url) && !url.startsWith('mailto:') && !url.startsWith('tel:')) {
      alert('В целях безопасности допускаются только ссылки начинающиеся с http://, https://, mailto: или tel:');
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = window.prompt('URL изображения');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const textItems = [
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
      icon: Highlighter,
      title: 'Выделение маркером',
      action: () => editor.chain().focus().toggleHighlight().run(),
      isActive: () => editor.isActive('highlight'),
    },
  ];

  const layoutItems = [
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
      icon: AlignLeft,
      title: 'По левому краю',
      action: () => editor.chain().focus().setTextAlign('left').run(),
      isActive: () => editor.isActive({ textAlign: 'left' }),
    },
    {
      icon: AlignCenter,
      title: 'По центру',
      action: () => editor.chain().focus().setTextAlign('center').run(),
      isActive: () => editor.isActive({ textAlign: 'center' }),
    },
    {
      icon: AlignRight,
      title: 'По правому краю',
      action: () => editor.chain().focus().setTextAlign('right').run(),
      isActive: () => editor.isActive({ textAlign: 'right' }),
    },
  ];

  const listItems = [
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
      icon: CheckSquare,
      title: 'Список задач',
      action: () => editor.chain().focus().toggleTaskList().run(),
      isActive: () => editor.isActive('taskList'),
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

  const mediaItems = [
    {
      icon: LinkIcon,
      title: 'Вставить ссылку',
      action: setLink,
      isActive: () => editor.isActive('link'),
    },
    {
      icon: Unlink,
      title: 'Удалить ссылку',
      action: () => editor.chain().focus().unsetLink().run(),
      disabled: !editor.isActive('link'),
    },
    {
      icon: ImageIcon,
      title: 'Вставить изображение по URL',
      action: addImage,
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

  interface MenuItem {
    icon: React.ElementType;
    title: string;
    action: () => void;
    isActive?: () => boolean;
    disabled?: boolean;
  }

  const renderButtons = (btnGroup: MenuItem[]) => (
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
              ? 'opacity-30 cursor-not-allowed text-gray-500'
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
    <div className="flex flex-wrap gap-2 p-1.5 bg-[#f3f3f3] dark:bg-[#2a2a2a] rounded-[24px] mx-4 shadow-sm transition-colors duration-200 overflow-x-auto">
      {renderButtons(textItems)}
      <div className="w-px bg-gray-300 dark:bg-gray-600 my-2 mx-1"></div>
      {renderButtons(layoutItems)}
      <div className="w-px bg-gray-300 dark:bg-gray-600 my-2 mx-1"></div>
      {renderButtons(listItems)}
      <div className="w-px bg-gray-300 dark:bg-gray-600 my-2 mx-1"></div>
      {renderButtons(mediaItems)}
      <div className="w-px bg-gray-300 dark:bg-gray-600 my-2 mx-1"></div>
      {renderButtons(tableItems)}
      <div className="w-px bg-gray-300 dark:bg-gray-600 my-2 mx-1"></div>
      {renderButtons(historyItems)}
    </div>
  );
};

export default MenuBar;
