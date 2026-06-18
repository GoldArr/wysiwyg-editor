import { Editor } from '@tiptap/react';

declare module '@tiptap/core' {
  interface EditorStorage {
    markdown: {
      getMarkdown: () => string;
    };
  }
}
