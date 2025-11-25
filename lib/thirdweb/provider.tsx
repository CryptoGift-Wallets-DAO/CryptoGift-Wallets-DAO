/**
 * 🌐 Thirdweb Provider Wrapper
 *
 * Enterprise-grade Web3 provider using Thirdweb v5
 * NOTE: Thirdweb v5 does NOT require a provider wrapper like Wagmi
 * This file maintains React Query integration for compatibility
 */

'use client'

import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThirdwebProvider } from 'thirdweb/react'

// Create a client with optimized settings for blockchain data
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Disable retries for blockchain queries that might be expensive
      retry: false,
      // Cache blockchain data for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Refetch on window focus for real-time updates
      refetchOnWindowFocus: true,
      // Keep data fresh for better UX
      refetchInterval: false,
    },
  },
})

interface Web3ProviderProps {
  children: React.ReactNode
}

/**
 * Web3 Provider Component
 *
 * Wraps the application with:
 * 1. ThirdwebProvider - For wallet connections and Web3 features
 * 2. QueryClientProvider - For efficient data fetching and caching
 *
 * @param children - React children to wrap
 */
export function Web3Provider({ children }: Web3ProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThirdwebProvider>{children}</ThirdwebProvider>
    </QueryClientProvider>
  )
}
