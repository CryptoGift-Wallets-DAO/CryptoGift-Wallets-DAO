/**
 * Web3 Configuration with Wagmi v2 and Base Network
 */

import { http, createConfig } from 'wagmi'
import { base, baseSepolia, mainnet } from 'wagmi/chains'
import { coinbaseWallet, metaMask } from 'wagmi/connectors'
// walletConnect temporarily removed due to TypeScript compatibility issues

// Get environment variables with consistent fallbacks
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id'

// Log warning if using demo project ID
if (projectId === 'demo-project-id' && typeof window !== 'undefined') {
  console.warn('⚠️ WalletConnect using demo Project ID. Get a real one from https://cloud.walletconnect.com/');
}
const appName = process.env.NEXT_PUBLIC_APP_NAME || 'CryptoGift DAO'
const appDescription = process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Decentralized governance for CryptoGift ecosystem'

// Ensure consistent URL across environments
const appUrl = (() => {
  if (typeof window !== 'undefined') {
    // Client-side: use current origin
    return window.location.origin
  }
  // Server-side: use environment variable or fallback
  return process.env.NEXT_PUBLIC_DAO_URL || 'https://crypto-gift-wallets-dao.vercel.app'
})()

const appIcon = process.env.NEXT_PUBLIC_APP_ICON || `${appUrl}/logo.png`

// Configure supported chains
const chains = [base, baseSepolia] as const
type SupportedChains = typeof chains[number]

// Configure connectors with consistent SSR behavior
const createConnectors = () => {
  // Base connector that works in both SSR and CSR
  const baseConnector = coinbaseWallet({
    appName,
    appLogoUrl: appIcon,
    headlessMode: false,
  })

  // For SSR compatibility, return minimal set
  if (typeof window === 'undefined') {
    return [baseConnector]
  }

  // Basic connectors that always work
  const baseConnectors = [
    metaMask({
      dappMetadata: {
        name: appName,
        url: appUrl,
      },
    }),
    baseConnector,
  ]

  // WalletConnect temporarily disabled due to TypeScript compatibility issues
  // Will be re-enabled once compatible with Wagmi v2
  // MetaMask + Coinbase Wallet provide excellent coverage for now

  return baseConnectors
}

const connectors = createConnectors()

// Create Wagmi config
export const wagmiConfig = createConfig({
  chains,
  connectors,
  transports: {
    [base.id]: http(process.env.NEXT_PUBLIC_RPC_URL || 'https://mainnet.base.org'),
    [baseSepolia.id]: http('https://sepolia.base.org'),
  },
  ssr: true, // Enable SSR support
})

// Contract addresses (from environment)
export const contracts = {
  cgcToken: (process.env.NEXT_PUBLIC_CGC_TOKEN_ADDRESS || '0x5e3a61b550328f3D8C44f60b3e10a49D3d806175') as `0x${string}`,
  aragonDao: (process.env.NEXT_PUBLIC_ARAGON_DAO_ADDRESS || '0x3244DFBf9E5374DF2f106E89Cf7972E5D4C9ac31') as `0x${string}`,
  masterController: '0x67D9a01A3F7b5D38694Bb78dD39286Db75D7D869' as `0x${string}`,
  taskRules: '0xdDcfFF04eC6D8148CDdE3dBde42456fB32bcC5bb' as `0x${string}`,
  milestoneEscrow: '0x8346CFcaECc90d678d862319449E5a742c03f109' as `0x${string}`,
} as const

// Network configuration
export const defaultChain = base
export const targetChainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '8453')

// Block explorer URLs
export const blockExplorer = {
  [base.id]: 'https://basescan.org',
  [baseSepolia.id]: 'https://sepolia.basescan.org',
} as const

// Token configuration
export const CGC_TOKEN_CONFIG = {
  address: contracts.cgcToken,
  symbol: 'CGC',
  decimals: 18,
  name: 'CryptoGift DAO Token',
} as const

// Hook to get current network info
export function getNetworkInfo(chainId?: number) {
  const chain = chains.find(c => c.id === chainId) || defaultChain
  return {
    chain,
    explorer: blockExplorer[chain.id],
    isSupported: chains.some(c => c.id === chainId),
    isMainnet: chainId === base.id,
  }
}

// Utility to format contract address for explorer
export function getExplorerUrl(address: string, type: 'address' | 'tx' = 'address', chainId?: number) {
  const { explorer } = getNetworkInfo(chainId)
  return `${explorer}/${type}/${address}`
}

export type { SupportedChains }