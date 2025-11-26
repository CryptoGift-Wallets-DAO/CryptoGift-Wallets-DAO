'use client';

import * as React from 'react';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';

export function LanguageToggle() {
  const [mounted, setMounted] = React.useState(false);
  const [isChanging, setIsChanging] = React.useState(false);
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleLocaleChange = async (newLocale: string) => {
    if (newLocale === locale || isChanging) return;

    setIsChanging(true);

    try {
      // Set locale via API
      await fetch('/api/locale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale: newLocale }),
      });

      // Also set cookie directly for immediate effect
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=lax`;

      // Refresh the page to apply the new locale
      router.refresh();

      // Small delay then reload for full effect
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (error) {
      console.error('Error changing locale:', error);
      setIsChanging(false);
    }
  };

  if (!mounted) {
    return (
      <div className="flex items-center space-x-1 bg-gray-100 dark:bg-slate-700 rounded-lg p-1">
        <div className="w-8 h-8 rounded-md" />
        <div className="w-8 h-8 rounded-md" />
      </div>
    );
  }

  const languages = [
    { code: 'en', label: 'EN', flag: '🇺🇸' },
    { code: 'es', label: 'ES', flag: '🇪🇸' },
  ];

  return (
    <div className="flex items-center space-x-1 bg-gray-100 dark:bg-slate-700 rounded-lg p-1">
      {languages.map(({ code, label, flag }) => (
        <button
          key={code}
          onClick={() => handleLocaleChange(code)}
          disabled={isChanging}
          className={`
            px-2 h-8 rounded-md flex items-center justify-center transition-all duration-200 text-sm font-medium
            ${locale === code
              ? 'bg-white dark:bg-slate-600 text-amber-500 dark:text-amber-400 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }
            ${isChanging ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          title={code === 'en' ? 'English' : 'Español'}
          aria-label={`Switch to ${code === 'en' ? 'English' : 'Spanish'}`}
        >
          <span className="mr-1">{flag}</span>
          {label}
        </button>
      ))}
    </div>
  );
}
