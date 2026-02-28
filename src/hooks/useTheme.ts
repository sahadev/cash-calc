import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'cashcalc-theme';

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(resolved: 'light' | 'dark') {
  document.documentElement.classList.toggle('dark', resolved === 'dark');
}

export function useTheme() {
  const [preference, setPreference] = useState<Theme>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return (stored as Theme) || 'system';
  });

  const resolved = preference === 'system' ? getSystemTheme() : preference;

  useEffect(() => {
    applyTheme(resolved);
  }, [resolved]);

  useEffect(() => {
    if (preference !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme(getSystemTheme());
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [preference]);

  const setTheme = useCallback((t: Theme) => {
    setPreference(t);
    localStorage.setItem(STORAGE_KEY, t);
  }, []);

  const toggle = useCallback(() => {
    const next = resolved === 'dark' ? 'light' : 'dark';
    setTheme(next);
  }, [resolved, setTheme]);

  return { preference, resolved, setTheme, toggle };
}
