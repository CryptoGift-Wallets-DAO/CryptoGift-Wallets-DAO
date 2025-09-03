/**
 * Web3 Provider wrapper for Wagmi v2 and React Query
 */

'use client'

import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { wagmiConfig } from './config'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Disable retries for blockchain queries that might be expensive
      retry: false,
      // Cache blockchain data for 5 minutes
      staleTime: 5 * 60 * 1000,
    },
  },
})

interface Web3ProviderProps {
  children: React.ReactNode
}

export function Web3Provider({ children }: Web3ProviderProps) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}