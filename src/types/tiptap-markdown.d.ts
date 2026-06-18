declare module '@tiptap/core' {
  interface EditorStorage {
    markdown: {
      getMarkdown: () => string;
    };
  }
}
