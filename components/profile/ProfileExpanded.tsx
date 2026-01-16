'use client';

/**
 * ProfileExpanded - Level 2 of ProfileCard system
 *
 * SIMPLIFIED: Shows ONLY a large Apple Watch squircle avatar
 * with network indicator. Click anywhere to go to Level 3.
 *
 * Made by mbxarts.com The Moon in a Box property
 * Co-Author: Godez22
 */

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useProfileCard } from './ProfileCardProvider';
import { VideoAvatar } from '@/components/apex/VideoAvatar';
import { useNetwork } from '@/lib/thirdweb';

// Base Network Logo SVG
const BaseNetworkLogo = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 111 111"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="55.5" cy="55.5" r="55.5" fill="#0052FF" />
    <path
      d="M55.3872 93.1875C76.2278 93.1875 93.1247 76.2906 93.1247 55.45C93.1247 34.6094 76.2278 17.7125 55.3872 17.7125C35.5765 17.7125 19.3158 33.0728 17.7122 52.4375H68.3247V58.4625H17.7122C19.3158 77.8272 35.5765 93.1875 55.3872 93.1875Z"
      fill="white"
    />
  </svg>
);

// Ethereum Network Logo SVG
const EthereumLogo = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 256 417"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path fill="#343434" d="m127.961 0-2.795 9.5v275.668l2.795 2.79 127.962-75.638z"/>
    <path fill="#8C8C8C" d="M127.962 0 0 212.32l127.962 75.639V154.158z"/>
    <path fill="#3C3C3B" d="m127.961 312.187-1.575 1.92v98.199l1.575 4.6L256 236.587z"/>
    <path fill="#8C8C8C" d="M127.962 416.905v-104.72L0 236.585z"/>
    <path fill="#141414" d="m127.961 287.958 127.96-75.637-127.96-58.162z"/>
    <path fill="#393939" d="m.001 212.321 127.96 75.637V154.159z"/>
  </svg>
);

// Generic network indicator when network is unknown
const UnknownNetworkIndicator = ({ size = 20 }: { size?: number }) => (
  <div
    className="rounded-full bg-gray-500 flex items-center justify-center"
    style={{ width: size, height: size }}
  >
    <span className="text-white text-xs font-bold">?</span>
  </div>
);

export function ProfileExpanded() {
  const { profile, currentLevel, closeLevel, goToLevel } = useProfileCard();
  const { chainId } = useNetwork();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle escape key
  useEffect(() => {
    if (currentLevel !== 2) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeLevel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [currentLevel, closeLevel]);

  if (!mounted || currentLevel !== 2 || !profile) return null;

  // Get network indicator based on chainId
  const getNetworkIndicator = () => {
    switch (chainId) {
      case 8453: // Base Mainnet
        return <BaseNetworkLogo size={24} />;
      case 1: // Ethereum Mainnet
        return <EthereumLogo size={24} />;
      case 84532: // Base Sepolia
        return <BaseNetworkLogo size={24} />;
      default:
        return <UnknownNetworkIndicator size={24} />;
    }
  };

  const expandedContent = (
    <>
      {/* Backdrop - click to close */}
      <div
        className="fixed inset-0 z-[60] bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={closeLevel}
      />

      {/* Large Avatar Container - click to go to Level 3 */}
      <div
        className="fixed z-[70] animate-scaleIn cursor-pointer"
        style={{ top: '88px', right: '16px' }}
        onClick={() => goToLevel(3)}
        role="button"
        aria-label="View full profile"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            goToLevel(3);
          }
        }}
      >
        {/* Large VideoAvatar - Apple Watch squircle */}
        <div className="relative">
          <VideoAvatar
            imageSrc={profile.avatar_url || undefined}
            alt={profile.display_name || 'Profile'}
            size="xl"
            className="!w-[160px] !h-[160px]"
          />

          {/* Network Indicator - bottom right corner */}
          <div
            className="absolute -bottom-1 -right-1 p-1 rounded-full bg-white dark:bg-slate-900 shadow-lg border-2 border-white dark:border-slate-800"
            title={chainId === 8453 ? 'Base' : chainId === 1 ? 'Ethereum' : 'Network'}
          >
            {getNetworkIndicator()}
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(expandedContent, document.body);
}

export default ProfileExpanded;
