'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAccount, useChainId, useDisconnect } from 'wagmi';
import { useCGCBalance } from '@/lib/web3/hooks';
import { getNetworkInfo } from '@/lib/web3/config';
import { base } from 'wagmi/chains';
import { ConnectWalletCompact } from '@/components/web3/ConnectWalletCompact';
import {
  Wallet,
  ChevronDown,
  ExternalLink,
  Copy,
  Check,
  LogOut,
  Settings,
  Lock
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { isSupported } = getNetworkInfo(chainId);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="bg-white dark:bg-slate-900 shadow-lg sticky top-0 z-40 transition-colors duration-300 border-b border-gray-200 dark:border-slate-700">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-3">
              <div className="relative w-12 h-12">
                <Image
                  src="/apeX.png"
                  alt="CryptoGift DAO Logo"
                  width={48}
                  height={48}
                  className="rounded-xl object-cover shadow-lg"
                  priority
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
              <div>
                <div className="font-bold text-xl text-gray-900 dark:text-white">CryptoGift</div>
                <div className="text-xs font-medium -mt-1 text-amber-500 dark:text-slate-400">DAO</div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/"
              className="text-gray-600 dark:text-gray-300 hover:text-amber-500 dark:hover:text-slate-300 transition-colors text-base font-bold"
            >
              Dashboard
            </Link>

            {/* Separator */}
            <div className="w-px h-6 bg-gradient-to-b from-transparent via-gray-300 dark:via-slate-600 to-transparent opacity-40"></div>

            <Link
              href="/tasks"
              className="text-gray-600 dark:text-gray-300 hover:text-amber-500 dark:hover:text-slate-300 transition-colors text-base font-bold"
            >
              Tasks
            </Link>

            {/* Separator */}
            <div className="w-px h-6 bg-gradient-to-b from-transparent via-gray-300 dark:via-slate-600 to-transparent opacity-40"></div>

            <Link
              href="/agent"
              className="text-gray-600 dark:text-gray-300 hover:text-amber-500 dark:hover:text-slate-300 transition-colors text-base font-bold flex items-center gap-1"
            >
              apeX
              <ExternalLink className="w-3 h-3" />
            </Link>

            {/* Separator */}
            <div className="w-px h-6 bg-gradient-to-b from-transparent via-gray-300 dark:via-slate-600 to-transparent opacity-40"></div>

            <Link
              href="/funding"
              className="text-gray-600 dark:text-gray-300 hover:text-amber-500 dark:hover:text-slate-300 transition-colors text-base font-bold flex items-center gap-1"
            >
              Funding
              <Lock className="w-3 h-3" />
            </Link>

            {/* Wallet Section */}
            {mounted && (
              isConnected && address ? (
                <WalletDropdown />
              ) : (
                <ConnectWalletCompact />
              )
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            {/* Mobile Wallet - Always visible */}
            {mounted && isConnected && address && (
              <MobileWalletBadge address={address} />
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-slate-700 py-4 bg-white dark:bg-slate-900">
            <div className="space-y-4">
              <Link
                href="/"
                className="block text-gray-600 dark:text-gray-300 hover:text-amber-500 dark:hover:text-slate-300 transition-colors px-4 py-3 font-bold text-base"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>

              {/* Mobile Separator */}
              <div className="mx-4 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-slate-600 to-transparent opacity-30"></div>

              <Link
                href="/tasks"
                className="block text-gray-600 dark:text-gray-300 hover:text-amber-500 dark:hover:text-slate-300 transition-colors px-4 py-3 font-bold text-base"
                onClick={() => setIsMenuOpen(false)}
              >
                Tasks & Rewards
              </Link>

              {/* Mobile Separator */}
              <div className="mx-4 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-slate-600 to-transparent opacity-30"></div>

              <Link
                href="/agent"
                className="block text-gray-600 dark:text-gray-300 hover:text-amber-500 dark:hover:text-slate-300 transition-colors px-4 py-3 font-bold text-base"
                onClick={() => setIsMenuOpen(false)}
              >
                apeX Assistant
              </Link>

              {/* Mobile Separator */}
              <div className="mx-4 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-slate-600 to-transparent opacity-30"></div>

              <Link
                href="/funding"
                className="block text-gray-600 dark:text-gray-300 hover:text-amber-500 dark:hover:text-slate-300 transition-colors px-4 py-3 font-bold text-base flex items-center gap-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Funding <Lock className="w-4 h-4" />
              </Link>

              {/* Mobile Connect */}
              <div className="pt-4 px-4">
                {isConnected && address ? (
                  <WalletDropdown fullWidth />
                ) : (
                  <ConnectWalletCompact fullWidth />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

// Compact wallet badge for mobile
function MobileWalletBadge({ address }: { address: string }) {
  const { balance } = useCGCBalance(address as `0x${string}`);

  return (
    <div className="flex items-center space-x-2 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg">
      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
      <span className="text-xs text-green-700 dark:text-green-400 font-medium">
        {address.slice(0, 4)}...{address.slice(-3)}
      </span>
    </div>
  );
}

// Full wallet dropdown component
function WalletDropdown({ fullWidth = false }: { fullWidth?: boolean }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { balance } = useCGCBalance(address);
  const { isSupported, chain, explorer } = getNetworkInfo(chainId);

  if (!isConnected || !address) return null;

  const displayAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
  const formattedBalance = parseFloat(balance || '0').toLocaleString(undefined, {
    maximumFractionDigits: 2
  });

  const handleCopy = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`relative ${fullWidth ? 'w-full' : ''}`}>
      {/* Main Wallet Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`flex items-center space-x-3 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-600 px-4 py-3
                 hover:border-amber-400 dark:hover:border-slate-500 transition-all duration-300 ${fullWidth ? 'w-full' : ''}`}
      >
        {/* Wallet Icon */}
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
          <Wallet className="w-4 h-4 text-white" />
        </div>

        {/* Wallet Info */}
        <div className="flex-1 text-left">
          <div className="font-medium text-gray-900 dark:text-white text-sm">
            {displayAddress}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {formattedBalance} CGC
          </div>
        </div>

        {/* Network indicator */}
        <div className={`w-2 h-2 rounded-full ${isSupported ? 'bg-green-500' : 'bg-red-500'}`}></div>

        {/* Dropdown Arrow */}
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />

          {/* Dropdown Content */}
          <div className={`absolute top-full ${fullWidth ? 'left-0 right-0' : 'right-0 min-w-[280px]'} mt-2 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-200 dark:border-slate-600 z-20`}>
            <div className="p-4">
              {/* Wallet Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{displayAddress}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${isSupported ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      {chain.name}
                    </div>
                  </div>
                </div>
              </div>

              {/* Balance */}
              <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3 mb-4">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">CGC Balance</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formattedBalance} <span className="text-sm font-normal text-gray-500">CGC</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <button
                  onClick={handleCopy}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors text-left"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {copied ? 'Copied!' : 'Copy Address'}
                  </span>
                </button>

                <a
                  href={`${explorer}/address/${address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors text-left"
                  onClick={() => setShowDropdown(false)}
                >
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">View on Explorer</span>
                </a>

                <div className="border-t border-gray-200 dark:border-slate-600 my-2"></div>

                <button
                  onClick={() => {
                    disconnect();
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left text-red-600 dark:text-red-400"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Disconnect</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
