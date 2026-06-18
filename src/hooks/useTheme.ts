import { useState, useEffect } from 'react';

const THEME_KEY = 'wysiwyg_theme';

export const useTheme = () => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem(THEME_KEY) === 'dark';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(THEME_KEY, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(THEME_KEY, 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

  return { isDark, toggleTheme };
};
