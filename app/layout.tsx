import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/ui/toast';
import { Web3Provider } from '@/lib/thirdweb/provider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CryptoGift DAO - Governance Dashboard',
  description: 'Manage and participate in CryptoGift DAO governance',
  keywords: 'DAO, governance, CryptoGift, Base, Aragon',
  authors: [{ name: 'CryptoGift Team' }],
  openGraph: {
    title: 'CryptoGift DAO',
    description: 'Decentralized governance for CryptoGift ecosystem',
    url: 'https://dao.cryptogift.com',
    siteName: 'CryptoGift DAO',
    type: 'website',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <NextIntlClientProvider messages={messages}>
            <Web3Provider>
              <ToastProvider>
                <main className="min-h-screen min-h-[100dvh] bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
                  {children}
                </main>
              </ToastProvider>
            </Web3Provider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}