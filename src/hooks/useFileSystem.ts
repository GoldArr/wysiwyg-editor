import type { Editor } from '../types/editor';
import { getFormattedHtml, getMarkdown } from '../utils/editorUtils';
import beautify from 'js-beautify';
import DOMPurify from 'dompurify';

type CodeMode = 'markdown' | 'html';

export const useFileSystem = (
  editorInstance: Editor | null, 
  codeMode: CodeMode,
  onFileOpened: (content: string, newMode: CodeMode) => void
) => {
  const saveFile = async () => {
    if (!editorInstance) return;
    
    const format = codeMode === 'markdown' ? 'md' : 'html';
    const textToSave = codeMode === 'markdown' 
      ? getMarkdown(editorInstance)
      : getFormattedHtml(editorInstance);
    
    try {
      if ('showSaveFilePicker' in window) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  const openFile = async () => {
    try {
      if ('showOpenFilePicker' in window) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const [handle] = await (window as any).showOpenFilePicker({
          types: [
            { description: 'Markdown Files', accept: { 'text/markdown': ['.md', '.markdown'] } },
            { description: 'HTML Files', accept: { 'text/html': ['.html', '.htm'] } }
          ],
        });
        const file = await handle.getFile();
        const text = await file.text();
        const cleanText = DOMPurify.sanitize(text, { USE_PROFILES: { html: true } });
        
        if (file.name.endsWith('.html') || file.name.endsWith('.htm')) {
          onFileOpened(beautify.html(cleanText, { indent_size: 2 }), 'html');
        } else {
          onFileOpened(cleanText, 'markdown');
        }
      } else {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.md,.markdown,.html,.htm';
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        input.onchange = async (e: any) => {
          const file = e.target.files[0];
          if (!file) return;
          const text = await file.text();
          const cleanText = DOMPurify.sanitize(text, { USE_PROFILES: { html: true } });
          
          if (file.name.endsWith('.html') || file.name.endsWith('.htm')) {
            onFileOpened(beautify.html(cleanText, { indent_size: 2 }), 'html');
          } else {
            onFileOpened(cleanText, 'markdown');
          }
        };
        input.click();
      }
    } catch (err) {
      console.error('Open cancelled or failed', err);
    }
  };

  return { saveFile, openFile };
};
