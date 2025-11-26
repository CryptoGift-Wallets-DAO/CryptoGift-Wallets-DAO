'use client';

import * as React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAutoTheme } from '@/hooks/useAutoTheme';

export function ThemeToggle() {
  const [mounted, setMounted] = React.useState(false);
  const { theme, setTheme } = useTheme();

  // Auto theme hook for time-based switching
  useAutoTheme();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center space-x-1 bg-gray-100 dark:bg-slate-700 rounded-lg p-1">
        <div className="w-8 h-8 rounded-md" />
        <div className="w-8 h-8 rounded-md" />
        <div className="w-8 h-8 rounded-md" />
      </div>
    );
  }

  const options = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'Auto' },
  ];

  return (
    <div className="flex items-center space-x-1 bg-gray-100 dark:bg-slate-700 rounded-lg p-1">
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`
            w-8 h-8 rounded-md flex items-center justify-center transition-all duration-200
            ${theme === value
              ? 'bg-white dark:bg-slate-600 text-amber-500 dark:text-amber-400 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }
          `}
          title={label}
          aria-label={`Switch to ${label} theme`}
        >
          <Icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  );
}
