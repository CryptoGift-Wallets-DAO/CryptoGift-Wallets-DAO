import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/ui/toast';
import { Web3Provider } from '@/lib/thirdweb/provider';

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className={inter.className}>
        <Web3Provider>
          <ToastProvider>
            <main className="min-h-screen min-h-[100dvh] bg-gradient-to-br from-gray-900 to-gray-800">
              {children}
            </main>
          </ToastProvider>
        </Web3Provider>
      </body>
    </html>
  );
}