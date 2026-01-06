import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/ui/toast';
import { Web3Provider } from '@/lib/thirdweb/provider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { ReferralTracker } from '@/components/providers/ReferralTracker';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { GlobalWidgets } from '@/components/layout/GlobalWidgets';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CryptoGift DAO - Decentralized Governance on Base Blockchain',
  description: 'Earn CGC tokens by completing tasks, participate in DAO governance, and grow your network. Join CryptoGift on Base today!',
  keywords: 'CryptoGift, CGC, DAO, governance, Base, blockchain, Aragon, crypto, token, decentralized, Web3, DeFi, referral, tasks, rewards, educational',
  authors: [{ name: 'CryptoGift Wallets DAO Team' }],
  creator: 'CryptoGift Wallets DAO',
  publisher: 'CryptoGift Wallets DAO',
  metadataBase: new URL('https://mbxarts.com'),
  alternates: {
    canonical: 'https://mbxarts.com',
  },
  openGraph: {
    title: 'CryptoGift DAO - Decentralized Governance on Base Blockchain',
    description: 'Earn CGC tokens by completing tasks, participate in DAO governance, and grow your network. Join CryptoGift on Base today!',
    url: 'https://mbxarts.com',
    siteName: 'CryptoGift Wallets DAO',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: 'https://mbxarts.com/og-main-1200x630.png',
        width: 1200,
        height: 630,
        alt: 'CryptoGift Wallets DAO - Decentralized Governance on Base',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CryptoGift DAO - Decentralized Governance on Base Blockchain',
    description: 'Earn CGC tokens by completing tasks, participate in DAO governance, and grow your network. Join CryptoGift on Base today!',
    site: '@cryptogiftdao',
    creator: '@cryptogiftdao',
    images: ['https://mbxarts.com/og-main-1200x630.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: '6v93BMu7tsjwRsGR5W4oOt0A3VLrZ0YjgAV0UwtwF0E',
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
    <html lang={locale} className="dark" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="base:app_id" content="6953a3ea4d3a403912ed8620" />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <Web3Provider>
              <ReferralTracker>
                <ToastProvider>
                  <main className="min-h-screen min-h-[100dvh] bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
                    {children}
                  </main>
                  <GlobalWidgets />
                </ToastProvider>
              </ReferralTracker>
            </Web3Provider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}