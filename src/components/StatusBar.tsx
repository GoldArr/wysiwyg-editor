interface StatusBarProps {
  contentLength: number;
  codeMode: 'markdown' | 'html';
}

const StatusBar = ({ contentLength, codeMode }: StatusBarProps) => {
  return (
    <footer className="px-6 py-3 text-[11px] font-medium text-gray-500 dark:text-gray-400 flex justify-between shrink-0 bg-[#f3f3f3] dark:bg-[#1a1a1a] transition-colors duration-200">
      <div className="flex gap-6 uppercase tracking-wider">
        <span>Символов: {contentLength}</span>
        <span>Режим: {codeMode}</span>
        <span className="text-green-600 dark:text-green-400 hidden sm:inline">Autosaved</span>
      </div>
      <div className="flex gap-2 items-center uppercase tracking-wider">
        <span>Editor Studio v1.0</span>
      </div>
    </footer>
  );
};

export default StatusBar;
