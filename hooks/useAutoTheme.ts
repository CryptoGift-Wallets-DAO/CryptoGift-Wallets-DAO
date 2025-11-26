'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';

/**
 * Auto theme hook that switches between light and dark based on time of day
 * Dark mode: 19:00 - 07:00 (Mexico City timezone)
 * Light mode: 07:00 - 19:00
 *
 * Only activates when theme is set to 'system'
 */
export function useAutoTheme() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    // Only auto-switch when theme is 'system'
    if (theme !== 'system') return;

    const checkAndSetTheme = () => {
      const now = new Date();
      // Get current hour in Mexico City timezone
      const mexicoTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Mexico_City' }));
      const hour = mexicoTime.getHours();

      // Dark mode from 19:00 to 07:00
      const shouldBeDark = hour >= 19 || hour < 7;
      const currentTheme = resolvedTheme;

      // Only update if there's a mismatch
      if (shouldBeDark && currentTheme !== 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else if (!shouldBeDark && currentTheme !== 'light') {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      }
    };

    // Check immediately
    checkAndSetTheme();

    // Check every minute
    const interval = setInterval(checkAndSetTheme, 60000);

    return () => clearInterval(interval);
  }, [theme, resolvedTheme]);
}
