'use client';

/**
 * ProfileExpanded - Level 2 of ProfileCard system
 *
 * Expanded panel showing:
 * - Avatar (larger)
 * - Wallet address
 * - CGC Balance
 * - Bio preview (first 100 chars)
 * - Social links preview (3 max)
 * - "View full profile" button → Level 3
 *
 * Made by mbxarts.com The Moon in a Box property
 * Co-Author: Godez22
 */

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { useProfileCard } from './ProfileCardProvider';
import { VideoAvatar } from '@/components/apex/VideoAvatar';
import { useCGCBalance } from '@/lib/thirdweb';
import {
  X,
  Wallet,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

// Social icons for preview
const SocialIcons = {
  twitter: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ),
  telegram: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  ),
  discord: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/>
    </svg>
  ),
  website: (
    <ExternalLink className="w-4 h-4" />
  ),
};

type SocialKey = keyof typeof SocialIcons;

export function ProfileExpanded() {
  const { profile, currentLevel, closeLevel, goToLevel } = useProfileCard();
  const { formatted: cgcBalance } = useCGCBalance();
  const t = useTranslations('profile');

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

  // Lock body scroll when open
  useEffect(() => {
    if (currentLevel === 2) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [currentLevel]);

  if (!mounted || currentLevel !== 2 || !profile) return null;

  const displayAddress = profile.wallet_address
    ? `${profile.wallet_address.slice(0, 6)}...${profile.wallet_address.slice(-4)}`
    : '';

  // Collect linked socials for preview
  const linkedSocials: { key: SocialKey; url: string }[] = [];
  if (profile.twitter_handle) {
    linkedSocials.push({ key: 'twitter', url: `https://x.com/${profile.twitter_handle}` });
  }
  if (profile.telegram_handle) {
    linkedSocials.push({ key: 'telegram', url: `https://t.me/${profile.telegram_handle}` });
  }
  if (profile.discord_handle) {
    linkedSocials.push({ key: 'discord', url: '#' }); // Discord doesn't have profile URLs
  }
  if (profile.website_url) {
    linkedSocials.push({ key: 'website', url: profile.website_url });
  }

  // Bio preview (first 100 chars)
  const bioPreview = profile.bio
    ? profile.bio.length > 100
      ? `${profile.bio.slice(0, 100)}...`
      : profile.bio
    : null;

  const panelContent = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={closeLevel}
      />

      {/* Panel */}
      <div
        className="fixed z-[70] w-[340px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-120px)] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-slate-700/50 animate-scaleIn"
        style={{ top: '88px', right: '16px' }}
        role="dialog"
        aria-modal="true"
        aria-label="Profile Panel"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-gray-200/50 dark:border-slate-700/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <VideoAvatar
                imageSrc={profile.avatar_url || undefined}
                alt={profile.display_name || 'Profile'}
                size="md"
              />
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {profile.display_name || profile.username || displayAddress}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  {displayAddress}
                </div>
              </div>
            </div>
            <button
              onClick={closeLevel}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close panel"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Balance Section */}
        <div className="p-4 border-b border-gray-200/50 dark:border-slate-700/50">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">CGC Balance</span>
              <Wallet className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {cgcBalance || '0.00'}
              <span className="text-lg font-normal text-gray-500 ml-1">CGC</span>
            </div>
          </div>
        </div>

        {/* Bio Preview */}
        {bioPreview && (
          <div className="px-4 py-3 border-b border-gray-200/50 dark:border-slate-700/50">
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {bioPreview}
            </p>
          </div>
        )}

        {/* Social Links Preview */}
        {linkedSocials.length > 0 && (
          <div className="px-4 py-3 border-b border-gray-200/50 dark:border-slate-700/50">
            <div className="flex items-center gap-2">
              {linkedSocials.slice(0, 3).map(({ key, url }) => (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors text-gray-600 dark:text-gray-400"
                  onClick={(e) => e.stopPropagation()}
                >
                  {SocialIcons[key]}
                </a>
              ))}
              {linkedSocials.length > 3 && (
                <span className="text-xs text-gray-400">+{linkedSocials.length - 3}</span>
              )}
            </div>
          </div>
        )}

        {/* Tier Badge */}
        <div className="px-4 py-3 border-b border-gray-200/50 dark:border-slate-700/50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">{t('tier')}</span>
            <span
              className="px-3 py-1 rounded-full text-sm font-semibold text-white"
              style={{ backgroundColor: profile.tier_color }}
            >
              {profile.tier}
            </span>
          </div>
        </div>

        {/* View Full Profile Button */}
        <div className="p-4">
          <button
            onClick={() => goToLevel(3)}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium transition-all hover:shadow-lg hover:shadow-purple-500/25"
          >
            <span>{t('viewFullProfile')}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );

  return createPortal(panelContent, document.body);
}

export default ProfileExpanded;
