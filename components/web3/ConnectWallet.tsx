/**
 * Wallet connection component with Web3 integration
 */

'use client'

import React from 'react'
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Wallet, ChevronDown, AlertCircle, ExternalLink } from 'lucide-react'
import { getNetworkInfo, defaultChain } from '@/lib/web3/config'
import { cn } from '@/lib/utils'

export function ConnectWallet() {
  const { address, isConnected, isConnecting } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const { switchChain, isPending: isSwitching } = useSwitchChain()

  const { chain, explorer, isSupported, isMainnet } = getNetworkInfo(chainId)

  // Format address for display
  const displayAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''

  // Handle wallet connection
  const handleConnect = (connectorId: string) => {
    const connector = connectors.find(c => c.id === connectorId)
    if (connector) {
      connect({ connector })
    }
  }

  // Handle network switch
  const handleSwitchNetwork = () => {
    switchChain({ chainId: defaultChain.id })
  }

  if (isConnected && address) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <Wallet className="h-5 w-5" />
              <span>Wallet Connected</span>
            </span>
            {!isSupported && (
              <Badge variant="destructive">
                Wrong Network
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Address */}
          <div>
            <p className="text-sm text-gray-600 mb-1">Address</p>
            <div className="flex items-center space-x-2">
              <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                {displayAddress}
              </code>
              <a
                href={`${explorer}/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Network */}
          <div>
            <p className="text-sm text-gray-600 mb-1">Network</p>
            <div className="flex items-center space-x-2">
              <Badge variant={isSupported ? "default" : "destructive"}>
                {chain.name}
              </Badge>
              {isMainnet && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Mainnet
                </Badge>
              )}
            </div>
          </div>

          {/* Network Switch */}
          {!isSupported && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-yellow-800 font-medium">
                    Unsupported Network
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Please switch to Base Network to use this app
                  </p>
                </div>
              </div>
              <Button
                onClick={handleSwitchNetwork}
                disabled={isSwitching}
                size="sm"
                className="mt-2 w-full"
              >
                {isSwitching ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Switching...
                  </>
                ) : (
                  `Switch to ${defaultChain.name}`
                )}
              </Button>
            </div>
          )}

          {/* Disconnect */}
          <Button
            onClick={() => disconnect()}
            variant="outline"
            className="w-full"
          >
            Disconnect
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Wallet className="h-5 w-5" />
          <span>Connect Wallet</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {connectors
          .filter(connector => connector.id !== 'injected') // Filter out generic injected
          .map((connector) => {
            const isLoading = isPending || (isConnecting && connector.id === connectors[0]?.id)
            
            return (
              <Button
                key={connector.id}
                onClick={() => handleConnect(connector.id)}
                disabled={isLoading}
                variant="outline"
                className="w-full justify-start"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <div className="h-4 w-4 mr-2" />
                )}
                <span className="flex-1 text-left">
                  {connector.name}
                </span>
                {connector.id === 'coinbaseWalletSDK' && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    Recommended
                  </Badge>
                )}
              </Button>
            )
          })}
        
        <div className="text-center pt-2">
          <p className="text-xs text-gray-500">
            Connect to interact with CryptoGift DAO
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Supports Base Network • Secure & Decentralized
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

// Compact version for navbar/header
export function ConnectWalletButton({ className }: { className?: string }) {
  const { address, isConnected, isConnecting } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()

  const { isSupported } = getNetworkInfo(chainId)
  const displayAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''

  if (isConnected && address) {
    return (
      <div className={cn("flex items-center space-x-2", className)}>
        <Badge variant={isSupported ? "default" : "destructive"}>
          {displayAddress}
        </Badge>
        <Button
          onClick={() => disconnect()}
          size="sm"
          variant="outline"
        >
          Disconnect
        </Button>
      </div>
    )
  }

  return (
    <Button
      onClick={() => connect({ connector: connectors[0] })}
      disabled={isConnecting}
      className={className}
      size="sm"
    >
      {isConnecting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Connecting...
        </>
      ) : (
        <>
          <Wallet className="h-4 w-4 mr-2" />
          Connect
        </>
      )}
    </Button>
  )
}