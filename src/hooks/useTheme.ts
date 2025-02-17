import { useState, useEffect } from 'react';
import { ThemeColors } from '../types';

const lightTheme: ThemeColors = {
  type: 'light',  // 添加这行
  background: '#ffffff',
  text: '#1a1a1a',
  border: '#e6e6e6',
  primary: '#1a73e8',
  secondary: '#757575',
};

const darkTheme: ThemeColors = {
  type: 'dark',  // 添加这行
  background: '#1a1a1a',
  text: '#ffffff',
  border: '#333333',
  primary: '#4285f4',
  secondary: '#9aa0a6',
};

export const useTheme = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'dark' : 'light');
    };

    setTheme(mediaQuery.matches ? 'dark' : 'light');
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    setTheme(current => current === 'light' ? 'dark' : 'light');
  };

  return {
    theme: theme === 'light' ? lightTheme : darkTheme,
    toggleTheme,
  };
};