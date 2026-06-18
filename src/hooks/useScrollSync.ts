import { useRef } from 'react';

export const useScrollSync = () => {
  const leftPaneRef = useRef<HTMLDivElement>(null);
  const rightPaneRef = useRef<HTMLDivElement>(null);
  const isSyncingScroll = useRef(false);

  const handleScroll = (source: 'left' | 'right') => {
    if (isSyncingScroll.current) {
      isSyncingScroll.current = false;
      return;
    }
    
    const sourceEl = source === 'left' ? leftPaneRef.current : rightPaneRef.current;
    const targetEl = source === 'left' ? rightPaneRef.current : leftPaneRef.current;

    if (sourceEl && targetEl) {
      isSyncingScroll.current = true;
      const percentage = sourceEl.scrollTop / (sourceEl.scrollHeight - sourceEl.clientHeight);
      // Защита от деления на ноль, если контент не скроллится
      if (!isNaN(percentage)) {
          targetEl.scrollTop = percentage * (targetEl.scrollHeight - targetEl.clientHeight);
      }
    }
  };

  return { leftPaneRef, rightPaneRef, handleScroll };
};
