'use client';

import React, { useState } from 'react';
import { useConnect, useAccount } from 'wagmi';
import { Wallet, Loader2, X } from 'lucide-react';

interface ConnectWalletCompactProps {
  fullWidth?: boolean;
}

export function ConnectWalletCompact({ fullWidth = false }: ConnectWalletCompactProps) {
  const [showModal, setShowModal] = useState(false);
  const { connect, connectors, isPending, error } = useConnect();
  const { isConnecting } = useAccount();

  const handleConnect = (connectorId: string) => {
    const connector = connectors.find(c => c.id === connectorId);
    if (connector) {
      connect({ connector });
      setShowModal(false);
    }
  };

  // Get connector icon/name
  const getConnectorInfo = (connector: any) => {
    const name = connector.name.toLowerCase();
    if (name.includes('coinbase')) {
      return { icon: '🔵', label: 'Coinbase Wallet', recommended: true };
    }
    if (name.includes('metamask')) {
      return { icon: '🦊', label: 'MetaMask', recommended: false };
    }
    if (name.includes('walletconnect')) {
      return { icon: '🔗', label: 'WalletConnect', recommended: false };
    }
    if (name.includes('injected')) {
      return { icon: '💼', label: 'Browser Wallet', recommended: false };
    }
    return { icon: '💼', label: connector.name, recommended: false };
  };

  return (
    <>
      {/* Connect Button */}
      <button
        onClick={() => setShowModal(true)}
        disabled={isConnecting || isPending}
        className={`flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600
                   hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2.5 rounded-lg
                   transition-all duration-300 font-medium text-sm shadow-md hover:shadow-lg
                   disabled:opacity-50 disabled:cursor-not-allowed ${fullWidth ? 'w-full' : ''}`}
      >
        {isConnecting || isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <Wallet className="w-4 h-4" />
            <span>Connect Wallet</span>
          </>
        )}
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />

          {/* Modal Content */}
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Connect Wallet</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Choose your wallet to connect
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Wallet Options */}
            <div className="p-6 space-y-3">
              {connectors
                .filter(connector => connector.id !== 'injected')
                .map((connector) => {
                  const info = getConnectorInfo(connector);
                  const isLoading = isPending && connector.id === connectors[0]?.id;

                  return (
                    <button
                      key={connector.id}
                      onClick={() => handleConnect(connector.id)}
                      disabled={isLoading}
                      className="w-full flex items-center space-x-4 p-4 rounded-xl border border-gray-200 dark:border-slate-600
                               hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20
                               transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-2xl">
                        {info.icon}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                          {info.label}
                          {info.recommended && (
                            <span className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                              Recommended
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {connector.id === 'coinbaseWalletSDK' && 'Easy setup, great for beginners'}
                          {connector.id === 'metaMask' && 'Popular browser extension'}
                          {connector.id === 'walletConnect' && 'Connect with mobile wallet'}
                        </div>
                      </div>
                      {isLoading && <Loader2 className="w-5 h-5 animate-spin text-blue-500" />}
                    </button>
                  );
                })}

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {error.message || 'Failed to connect. Please try again.'}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 pb-6">
              <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                By connecting, you agree to our Terms of Service.
                <br />
                Supports Base Network • Secure & Decentralized
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
