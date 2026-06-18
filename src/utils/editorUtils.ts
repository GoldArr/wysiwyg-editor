import beautify from 'js-beautify';
import type { Editor } from '../types/editor';

/**
 * Получает HTML из редактора и красиво его форматирует.
 */
export const getFormattedHtml = (editor: Editor): string => {
  const rawHtml = editor.getHTML();
  return beautify.html(rawHtml, { indent_size: 2, wrap_line_length: 80 });
};

/**
 * Получает Markdown из редактора.
 */
export const getMarkdown = (editor: Editor): string => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (editor as any).storage.markdown.getMarkdown();
};
