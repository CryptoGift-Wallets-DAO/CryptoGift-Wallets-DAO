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
  title: 'CryptoGift Wallets DAO - Decentralized Governance on Base',
  description: 'CryptoGift Wallets DAO is a decentralized autonomous organization on Base blockchain. Earn CGC tokens by completing educational tasks, participate in governance, and join our referral program. Built with Aragon OSx.',
  keywords: 'CryptoGift, CGC, DAO, governance, Base, blockchain, Aragon, crypto, token, decentralized, Web3, DeFi, referral, tasks, rewards, educational',
  authors: [{ name: 'CryptoGift Wallets DAO Team' }],
  creator: 'The Moon in a Box - mbxarts.com',
  publisher: 'CryptoGift Wallets DAO',
  metadataBase: new URL('https://mbxarts.com'),
  alternates: {
    canonical: 'https://mbxarts.com',
  },
  openGraph: {
    title: 'CryptoGift Wallets DAO - Governance Dashboard',
    description: 'Decentralized governance for the CryptoGift ecosystem on Base blockchain. Learn. Earn. Co-govern. Participate in DAO governance, complete tasks for CGC rewards, and grow your network with our referral program.',
    url: 'https://mbxarts.com',
    siteName: 'CryptoGift Wallets DAO',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: 'https://raw.githubusercontent.com/CryptoGift-Wallets-DAO/CryptoGift-Wallets-DAO/main/public/metadata/cgc-logo-512x512.png',
        width: 512,
        height: 512,
        alt: 'CryptoGift Wallets DAO - CGC Token Logo',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'CryptoGift Wallets DAO',
    description: 'Decentralized governance on Base blockchain. Earn CGC tokens, participate in governance, join referral program.',
    site: '@cryptogiftdao',
    creator: '@cryptogiftdao',
    images: ['https://raw.githubusercontent.com/CryptoGift-Wallets-DAO/CryptoGift-Wallets-DAO/main/public/metadata/cgc-logo-512x512.png'],
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
    <html lang={locale} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <NextIntlClientProvider messages={messages}>
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