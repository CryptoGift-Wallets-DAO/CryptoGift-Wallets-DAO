/**
 * Mini App Layout
 *
 * Specialized layout for Farcaster Mini App context.
 * Provides Farcaster SDK context, optimized mobile styling,
 * and safe area handling.
 *
 * Made by mbxarts.com The Moon in a Box property
 * Co-Author: Godez22
 */

import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { MiniAppProvider } from './components/MiniAppProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CryptoGift DAO',
  description: 'Complete tasks, earn CGC tokens, and grow your network.',
  // Farcaster Mini App meta tags
  other: {
    'fc:frame': 'vNext',
    'fc:frame:image': 'https://mbxarts.com/splash-200.png',
    'fc:frame:button:1': 'Open Mini App',
    'fc:frame:button:1:action': 'launch_frame',
    'fc:frame:button:1:target': 'https://mbxarts.com/miniapp',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a2e' },
  ],
};

export default async function MiniAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className="dark" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="icon" href="/cgc-icon.png" />
        <link rel="apple-touch-icon" href="/cgc-icon-1024.png" />
      </head>
      <body className={`${inter.className} overscroll-none`}>
        <ThemeProvider>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <MiniAppProvider>
              <main className="min-h-screen min-h-[100dvh] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 overflow-x-hidden">
                {children}
              </main>
            </MiniAppProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
