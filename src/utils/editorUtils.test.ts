import { describe, it, expect, vi } from 'vitest';
import { getFormattedHtml, getMarkdown } from './editorUtils';
import type { Editor } from '../types/editor';

describe('editorUtils', () => {
  it('getFormattedHtml formats raw HTML correctly', () => {
    const rawHtml = '<div><p>Hello <b>World</b></p></div>';
    
    // Мокируем Editor
    const mockEditor = {
      getHTML: vi.fn().mockReturnValue(rawHtml)
    } as unknown as Editor;

    const formatted = getFormattedHtml(mockEditor);
    
    // beautify.html добавляет отступы
    expect(formatted).toContain('<div>');
    expect(formatted).toContain('  <p>Hello <b>World</b>');
    expect(formatted).toContain('</div>');
  });

  it('getMarkdown returns markdown from tiptap-markdown storage', () => {
    const expectedMd = '# Hello World\n\nThis is **markdown**';
    
    // Мокируем сложную структуру Tiptap
    const mockEditor = {
      storage: {
        markdown: {
          getMarkdown: vi.fn().mockReturnValue(expectedMd)
        }
      }
    } as unknown as Editor;

    const md = getMarkdown(mockEditor);
    
    expect(md).toBe(expectedMd);
  });
});
