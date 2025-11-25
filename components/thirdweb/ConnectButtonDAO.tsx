/**
 * 🔌 Connect Button Component
 *
 * Enterprise-grade wallet connection with 150+ wallet support
 * Uses Thirdweb v5 ConnectButton with custom branding for CryptoGift DAO
 */

'use client'

import React from 'react'
import { ConnectButton } from 'thirdweb/react'
import { getClient } from '@/lib/thirdweb/client'
import { base } from 'thirdweb/chains'
import { createWallet, inAppWallet } from 'thirdweb/wallets'

/**
 * Supported wallets configuration
 * Full list: 150+ wallets supported by Thirdweb v5
 */
const wallets = [
  createWallet('io.metamask'),
  createWallet('com.coinbase.wallet'),
  createWallet('me.rainbow'),
  createWallet('io.rabby'),
  createWallet('app.phantom'),
  inAppWallet({
    auth: {
      options: ['google', 'discord', 'telegram', 'email', 'passkey'],
    },
  }),
]

interface ConnectButtonDAOProps {
  /**
   * Show full width button (mobile-friendly)
   */
  fullWidth?: boolean

  /**
   * Custom button text
   */
  label?: string

  /**
   * Additional className for styling
   */
  className?: string
}

/**
 * CryptoGift DAO Professional Connect Button
 *
 * Features:
 * - 150+ wallet support via Thirdweb v5
 * - Auto-network switching to Base Mainnet
 * - Professional UI matching DAO branding
 * - Mobile-responsive design
 */
export function ConnectButtonDAO({
  fullWidth = false,
  label = 'Connect Wallet',
  className = '',
}: ConnectButtonDAOProps) {
  const client = getClient()

  if (!client) {
    return (
      <button
        disabled
        className={`flex items-center justify-center space-x-2 bg-gray-400 text-white px-4 py-2.5 rounded-lg
                   font-medium text-sm shadow-md cursor-not-allowed ${fullWidth ? 'w-full' : ''} ${className}`}
      >
        <span>Client Not Initialized</span>
      </button>
    )
  }

  return (
    <ConnectButton
      client={client}
      wallets={wallets}
      chain={base}
      connectButton={{
        label: label,
        className: `flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600
                   hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2.5 rounded-lg
                   transition-all duration-300 font-medium text-sm shadow-md hover:shadow-lg
                   disabled:opacity-50 disabled:cursor-not-allowed ${fullWidth ? 'w-full' : ''} ${className}`,
      }}
      connectModal={{
        size: 'compact',
        title: 'Connect to CryptoGift DAO',
        titleIcon: '/apeX.png',
        welcomeScreen: {
          title: 'Welcome to CryptoGift DAO',
          subtitle: 'Connect your wallet to access tasks, rewards, and governance',
          img: {
            src: '/apeX.png',
            width: 150,
            height: 150,
          },
        },
        showThirdwebBranding: false,
      }}
      detailsButton={{
        displayBalanceToken: {
          [base.id]: '0x5e3a61b550328f3D8C44f60b3e10a49D3d806175', // CGC Token
        },
      }}
      switchButton={{
        label: 'Wrong Network',
        className:
          'bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors',
      }}
      theme="dark"
      supportedTokens={{
        [base.id]: [
          {
            address: '0x5e3a61b550328f3D8C44f60b3e10a49D3d806175',
            name: 'CryptoGift Coin',
            symbol: 'CGC',
            icon: '/apeX.png',
          },
        ],
      }}
    />
  )
}
