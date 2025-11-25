/**
 * 🔐 CGC Access Gate
 *
 * Simple access control component that restricts access based on CGC token balance
 * Uses Thirdweb v5 hooks for wallet connection and balance checking
 */

'use client'

import React from 'react'
import { useAccount, useNetwork, useCGCBalance } from '@/lib/thirdweb'
import { ConnectButtonDAO } from '@/components/thirdweb/ConnectButtonDAO'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Lock, AlertCircle, ExternalLink, Coins } from 'lucide-react'

interface CGCAccessGateProps {
  children: React.ReactNode
  requiredBalance?: string // Minimum CGC balance required (default: "0.01")
  title?: string
  description?: string
}

/**
 * Minimum CGC balance required for access (0.01 CGC)
 */
const MIN_CGC_BALANCE = 0.01

export function CGCAccessGate({
  children,
  requiredBalance = "0.01",
  title = "CGC Token Required",
  description = "This feature is exclusive to CGC token holders. Connect your wallet and hold at least 0.01 CGC tokens to continue."
}: CGCAccessGateProps) {
  const { address, isConnected } = useAccount()
  const { chainId } = useNetwork()
  const { formatted, isLoading: isBalanceLoading } = useCGCBalance()

  const isCorrectNetwork = chainId === 8453 // Base Mainnet
  const cgcBalanceNum = parseFloat(formatted || '0')
  const requiredBalanceNum = parseFloat(requiredBalance)
  const hasRequiredBalance = cgcBalanceNum >= requiredBalanceNum
  const isConnecting = false // Thirdweb handles this internally

  // Loading state
  if (isConnecting || (isConnected && isBalanceLoading)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-500" />
              <p className="text-gray-600">
                {isConnecting ? 'Connecting wallet...' : 'Checking CGC balance...'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Not connected
  if (!isConnected || !address) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lock className="h-5 w-5" />
              <span>{title}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 text-sm">{description}</p>
            <ConnectButtonDAO fullWidth />
          </CardContent>
        </Card>
      </div>
    )
  }

  // Wrong network
  if (!isCorrectNetwork) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <span>Wrong Network</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please switch to Base Network to access CGC token features.
              </AlertDescription>
            </Alert>
            <ConnectButtonDAO fullWidth />
          </CardContent>
        </Card>
      </div>
    )
  }


  // Insufficient balance
  if (!hasRequiredBalance) {
    const cgcTokenUrl = `https://basescan.org/address/0x5e3a61b550328f3D8C44f60b3e10a49D3d806175`

    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Coins className="h-5 w-5 text-amber-500" />
              <span>Insufficient CGC Balance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-3">
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-800 mb-2">
                  <strong>Current Balance:</strong> {formatted} CGC
                </p>
                <p className="text-sm text-amber-800">
                  <strong>Required:</strong> {requiredBalance} CGC
                </p>
              </div>

              <p className="text-gray-600 text-sm">
                You need to hold at least {requiredBalance} CGC tokens to access this feature.
              </p>

              <div className="space-y-2">
                <a
                  href={cgcTokenUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm"
                >
                  <span>View CGC Token Contract</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
                <p className="text-xs text-gray-500">
                  Get CGC tokens through DAO participation or token swaps
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Access granted - show protected content
  return (
    <div>
      {/* Optional success indicator */}
      <div className="mb-4">
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <Coins className="h-3 w-3 mr-1" />
          CGC Access: {formatted} CGC
        </Badge>
      </div>

      {children}
    </div>
  )
}

/**
 * Higher-order component to protect routes/components
 */
export function withCGCAccess<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    requiredBalance?: string
    title?: string
    description?: string
  }
) {
  return function ProtectedComponent(props: P) {
    return (
      <CGCAccessGate {...options}>
        <Component {...props} />
      </CGCAccessGate>
    )
  }
}