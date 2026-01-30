'use client';

/**
 * ============================================================================
 * 🌐 I18N PATTERN - INSTRUCCIONES PARA TRADUCCIONES
 * ============================================================================
 *
 * Para agregar traducciones a cualquier componente:
 *
 * 1. Importar useTranslations:
 *    import { useTranslations } from 'next-intl';
 *
 * 2. En el componente, usar el hook con el namespace:
 *    const t = useTranslations('navigation');  // usa src/locales/{locale}.json -> navigation
 *
 * 3. Usar t() para obtener traducciones:
 *    <span>{t('dashboard')}</span>  // "Dashboard" en EN, "Panel" en ES
 *
 * 4. Para textos anidados:
 *    t('stats.totalSupply')  // accede a dashboard.stats.totalSupply
 *
 * 5. Las traducciones están en:
 *    - src/locales/en.json (English - default)
 *    - src/locales/es.json (Spanish)
 *
 * 6. Agregar nuevas traducciones: editar AMBOS archivos json
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useAccount, useNetwork, useCGCBalance } from '@/lib/thirdweb';
import { useDisconnect, useActiveWallet } from 'thirdweb/react';
import { ConnectButtonDAO } from '@/components/thirdweb/ConnectButtonDAO';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import {
  Wallet,
  ChevronDown,
  ExternalLink,
  Copy,
  Check,
  LogOut,
  Settings,
  Lock,
  Users,
  User
} from 'lucide-react';
import { ProfileCard } from '@/components/profile';

export const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const { chainId } = useNetwork();

  // 🌐 I18N: Hook para traducciones del namespace 'navigation'
  const t = useTranslations('navigation');

  // Network is supported if it's Base Mainnet (8453)
  const isSupported = chainId === 8453;

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-lg fixed top-0 left-0 right-0 z-[10000] transition-colors duration-300 border-b border-gray-200/50 dark:border-slate-700/50">
      <div className="container mx-auto px-2">
        <div className="flex justify-between items-center py-3">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center space-x-2">
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
          <div className="hidden md:flex items-center space-x-2">
            <Link
              href="/dashboard"
              className="text-gray-600 dark:text-gray-300 hover:text-amber-500 dark:hover:text-slate-300 transition-colors text-sm font-bold px-2"
            >
              {t('dashboard')}
            </Link>

            <Link
              href="/tasks"
              className="text-gray-600 dark:text-gray-300 hover:text-amber-500 dark:hover:text-slate-300 transition-colors text-sm font-bold px-2"
            >
              {t('tasks')}
            </Link>

            <Link
              href="/referrals"
              className="text-gray-600 dark:text-gray-300 hover:text-amber-500 dark:hover:text-slate-300 transition-colors text-sm font-bold flex items-center gap-1 px-2"
            >
              {t('referrals')}
              <Users className="w-3 h-3" />
            </Link>

            <Link
              href="/funding"
              className="text-gray-600 dark:text-gray-300 hover:text-amber-500 dark:hover:text-slate-300 transition-colors text-sm font-bold flex items-center gap-1 px-2"
            >
              {t('funding')}
              <Lock className="w-3 h-3" />
            </Link>

            <Link
              href="/docs"
              className="text-gray-600 dark:text-gray-300 hover:text-amber-500 dark:hover:text-slate-300 transition-colors text-sm font-bold px-2"
            >
              {t('aboutUs')}
            </Link>

            {/* Separator */}
            <div className="w-px h-6 bg-gradient-to-b from-transparent via-gray-300 dark:via-slate-600 to-transparent opacity-40 mx-2"></div>

            {/* Language Toggle */}
            <LanguageToggle />

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Wallet Section */}
            {mounted && (
              isConnected && address ? (
                <WalletDropdown />
              ) : (
                <ConnectButtonDAO />
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
          <div className="md:hidden border-t border-gray-200 dark:border-slate-700 py-4 bg-white dark:bg-slate-900 relative z-[10001] max-h-[calc(100vh-73px)] overflow-y-auto">
            <div className="space-y-4">
              <Link
                href="/dashboard"
                className="block text-gray-600 dark:text-gray-300 hover:text-amber-500 dark:hover:text-slate-300 transition-colors px-4 py-3 font-bold text-base"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('dashboard')}
              </Link>

              {/* Mobile Separator */}
              <div className="mx-4 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-slate-600 to-transparent opacity-30"></div>

              <Link
                href="/tasks"
                className="block text-gray-600 dark:text-gray-300 hover:text-amber-500 dark:hover:text-slate-300 transition-colors px-4 py-3 font-bold text-base"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('tasksRewards')}
              </Link>

              {/* Mobile Separator */}
              <div className="mx-4 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-slate-600 to-transparent opacity-30"></div>

              <Link
                href="/referrals"
                className="block text-gray-600 dark:text-gray-300 hover:text-amber-500 dark:hover:text-slate-300 transition-colors px-4 py-3 font-bold text-base flex items-center gap-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('referralsNetwork')} <Users className="w-4 h-4" />
              </Link>

              {/* Mobile Separator */}
              <div className="mx-4 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-slate-600 to-transparent opacity-30"></div>

              <Link
                href="/funding"
                className="block text-gray-600 dark:text-gray-300 hover:text-amber-500 dark:hover:text-slate-300 transition-colors px-4 py-3 font-bold text-base flex items-center gap-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('funding')} <Lock className="w-4 h-4" />
              </Link>

              {/* Mobile Separator */}
              <div className="mx-4 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-slate-600 to-transparent opacity-30"></div>

              <Link
                href="/docs"
                className="block text-gray-600 dark:text-gray-300 hover:text-amber-500 dark:hover:text-slate-300 transition-colors px-4 py-3 font-bold text-base"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('aboutUs')}
              </Link>

              {/* Mobile Separator */}
              <div className="mx-4 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-slate-600 to-transparent opacity-30"></div>

              {/* Mobile Language and Theme Toggles */}
              <div className="px-4 py-3 flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">{t('settings')}</span>
                <div className="flex items-center gap-2">
                  <LanguageToggle />
                  <ThemeToggle />
                </div>
              </div>

              {/* Mobile Connect */}
              <div className="pt-4 px-4">
                {isConnected && address ? (
                  <WalletDropdown fullWidth />
                ) : (
                  <ConnectButtonDAO fullWidth />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

// Spacer component to compensate for fixed navbar height
// Use this after <Navbar /> in pages to prevent content from being hidden
//
// NAVBAR HEIGHT CALCULATION:
// - Logo: h-12 = 48px
// - Inner padding: py-3 = 24px (12px top + 12px bottom)
// - Border: 1px
// - TOTAL: 73px
//
// When wallet connected, add extra breathing room for visual density
export const NavbarSpacer: React.FC = () => {
  const { isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Base height: 74px (matches navbar: 48px logo + 24px padding + 1px border + 1px safety)
  // When wallet connected: add extra padding for visual breathing room
  // - Mobile: +20px (MobileWalletBadge adds visual density inline)
  // - Desktop: +12px (WalletDropdown with avatar/balance is visually denser)
  const heightClass = mounted && isConnected
    ? 'h-[94px] md:h-[86px]' // 74 + 20 mobile, 74 + 12 desktop
    : 'h-[74px]';

  return (
    <div
      className={heightClass}
      aria-hidden="true"
    />
  );
};

// Compact wallet badge for mobile
function MobileWalletBadge({ address }: { address: string }) {
  const { formatted } = useCGCBalance();

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
  const wallet = useActiveWallet();
  const { chainId } = useNetwork();
  const { formatted } = useCGCBalance();

  // 🌐 I18N: Hooks para traducciones
  const tCommon = useTranslations('common');
  const tWallet = useTranslations('wallet');

  // Network is supported if it's Base Mainnet (8453)
  const isSupported = chainId === 8453;
  const chainName = chainId === 8453 ? tWallet('base') : tWallet('unsupportedNetwork');
  const explorer = 'https://basescan.org';

  if (!isConnected || !address) return null;

  const displayAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
  const formattedBalance = formatted || '0.00';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`relative ${fullWidth ? 'w-full' : ''}`}>
      {/* Main Wallet Button */}
      <div
        className={`flex items-center space-x-2 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-600 px-3 py-2
                 hover:border-amber-400 dark:hover:border-slate-500 transition-all duration-300 ${fullWidth ? 'w-full' : ''}`}
      >
        {/* ProfileCard - 4-level profile system (click avatar for full profile) */}
        <div onClick={(e) => e.stopPropagation()} className="flex-shrink-0">
          <ProfileCard size="sm" />
        </div>

        {/* Wallet Info - Address is clickable to copy */}
        <div className="flex items-center space-x-2 flex-1">
          <div className="flex-1 text-left">
            {/* Clickable address with copy feedback */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCopy();
              }}
              className="font-medium text-gray-900 dark:text-white text-xs hover:text-amber-500 dark:hover:text-amber-400 transition-colors flex items-center gap-1"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-500" />
                  <span className="text-emerald-500">{tCommon('copied')}</span>
                </>
              ) : (
                displayAddress
              )}
            </button>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {formattedBalance} CGC
            </div>
          </div>

          {/* Dropdown toggle button */}
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors"
          >
            <ChevronDown
              className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Dropdown Menu */}
      {showDropdown && (
        <>
          {/* Backdrop - z-index below navbar to not block it */}
          <div
            className="fixed inset-0 z-[9999]"
            onClick={() => setShowDropdown(false)}
          />

          {/* Dropdown Content */}
          <div className={`absolute top-full ${fullWidth ? 'left-0 right-0' : 'right-0 min-w-[280px]'} mt-2 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-200 dark:border-slate-600 z-[10001] max-h-[calc(100vh-150px)] overflow-y-auto`}>
            <div className="p-4">
              {/* Wallet Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  {/* ProfileCard - Click to open full profile system */}
                  <ProfileCard size="md" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{displayAddress}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${isSupported ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      {chainName}
                    </div>
                  </div>
                </div>
              </div>

              {/* Balance */}
              <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3 mb-4">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{tWallet('cgcBalance')}</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formattedBalance} <span className="text-sm font-normal text-gray-500">CGC</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                {/* Profile Link */}
                <Link
                  href="/profile"
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors text-left"
                  onClick={() => setShowDropdown(false)}
                >
                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                    <User className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{tWallet('profile')}</span>
                </Link>

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
                    {copied ? tCommon('copied') : tCommon('copyAddress')}
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
                  <span className="text-sm text-gray-700 dark:text-gray-300">{tCommon('viewOnExplorer')}</span>
                </a>

                <div className="border-t border-gray-200 dark:border-slate-600 my-2"></div>

                <button
                  onClick={() => {
                    if (wallet) disconnect(wallet);
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left text-red-600 dark:text-red-400"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">{tCommon('disconnect')}</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
