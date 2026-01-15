'use client';

/**
 * TeamMemberApex - apeX profile card for team members
 *
 * Features:
 * - VideoAvatar with squircle shape (supports video + image)
 * - Click to open profile panel
 * - Holographic glow effect
 * - Social links (LinkedIn, X/Twitter)
 *
 * Made by mbxarts.com The Moon in a Box property
 * Co-Author: Godez22
 */

import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { VideoAvatar } from './VideoAvatar';
import {
  X,
  Linkedin,
  ExternalLink,
  Wallet,
  Copy,
  Check,
} from 'lucide-react';

// Twitter/X Icon
const TwitterXIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

interface TeamMember {
  name: string;
  role: string;
  description: string;
  wallet: string;
  imageSrc: string;
  videoSrc?: string;
  linkedIn: string;
  twitter: string;
}

interface TeamMemberApexProps {
  member: TeamMember;
}

export function TeamMemberApex({ member }: TeamMemberApexProps) {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(member.wallet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shortWallet = `${member.wallet.slice(0, 6)}...${member.wallet.slice(-4)}`;

  return (
    <>
      {/* Card */}
      <div
        ref={cardRef}
        className="text-center p-6 rounded-2xl glass-crystal hover:scale-[1.02] transition-all duration-300 cursor-pointer group"
        onClick={() => setIsPanelOpen(true)}
      >
        {/* Avatar with Holographic Effect */}
        <div className="relative mx-auto mb-4 w-28 h-28">
          {/* Outer Glow */}
          <div
            className="absolute -inset-2 rounded-[22%] opacity-60 group-hover:opacity-100 transition-opacity"
            style={{
              background: 'linear-gradient(135deg, #f59e0b, #ea580c, #ec4899, #8b5cf6)',
              backgroundSize: '200% 200%',
              animation: 'holographic 4s ease infinite',
              filter: 'blur(12px)',
            }}
          />
          {/* VideoAvatar */}
          <VideoAvatar
            imageSrc={member.imageSrc}
            videoSrc={member.videoSrc}
            alt={member.name}
            size="xl"
            className="relative z-10"
          />
        </div>

        {/* Name */}
        <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
          {member.name}
        </h4>

        {/* Role */}
        <p className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-2">
          {member.role}
        </p>

        {/* Description */}
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          {member.description}
        </p>

        {/* Social Links */}
        <div className="flex items-center justify-center gap-4">
          <a
            href={member.linkedIn}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-2 rounded-lg glass-crystal hover:bg-blue-500/20 transition-colors"
          >
            <Linkedin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </a>
          <a
            href={member.twitter}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-2 rounded-lg glass-crystal hover:bg-gray-500/20 transition-colors"
          >
            <TwitterXIcon className="w-4 h-4 text-gray-700 dark:text-gray-300" />
          </a>
        </div>

        {/* Click hint */}
        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
          Click to view full profile
        </p>
      </div>

      {/* Profile Panel (Portal) */}
      {isPanelOpen && typeof document !== 'undefined' && createPortal(
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-fadeIn"
            onClick={() => setIsPanelOpen(false)}
          />

          {/* Panel */}
          <div
            className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-64px)] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-slate-700/50 animate-scaleIn"
          >
            {/* Header */}
            <div className="relative p-6 border-b border-gray-200/50 dark:border-slate-700/50">
              {/* Close Button */}
              <button
                onClick={() => setIsPanelOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>

              {/* Avatar Large */}
              <div className="relative mx-auto mb-4 w-32 h-32">
                <div
                  className="absolute -inset-3 rounded-[22%] opacity-75"
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b, #ea580c, #ec4899, #8b5cf6)',
                    backgroundSize: '200% 200%',
                    animation: 'holographic 4s ease infinite',
                    filter: 'blur(15px)',
                  }}
                />
                <VideoAvatar
                  imageSrc={member.imageSrc}
                  videoSrc={member.videoSrc}
                  alt={member.name}
                  size="xl"
                  className="relative z-10 !w-32 !h-32"
                  enableSound
                />
              </div>

              {/* Name & Role */}
              <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white">
                {member.name}
              </h3>
              <p className="text-sm text-center text-purple-600 dark:text-purple-400 font-medium">
                {member.role}
              </p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Wallet */}
              <div className="glass-crystal rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Wallet className="w-3 h-3" />
                    Wallet Address
                  </span>
                  <button
                    onClick={handleCopyWallet}
                    className="text-xs text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p className="font-mono text-sm text-gray-900 dark:text-white">
                  {shortWallet}
                </p>
              </div>

              {/* Bio */}
              <div className="glass-crystal rounded-xl p-4">
                <span className="text-xs text-gray-500 dark:text-gray-400 block mb-2">
                  About
                </span>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {member.description}
                </p>
              </div>

              {/* Social Links */}
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={member.linkedIn}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 p-3 rounded-xl glass-crystal hover:bg-blue-500/10 transition-colors"
                >
                  <Linkedin className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">LinkedIn</span>
                  <ExternalLink className="w-3 h-3 text-gray-400" />
                </a>
                <a
                  href={member.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 p-3 rounded-xl glass-crystal hover:bg-gray-500/10 transition-colors"
                >
                  <TwitterXIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">X/Twitter</span>
                  <ExternalLink className="w-3 h-3 text-gray-400" />
                </a>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200/50 dark:border-slate-700/50 text-center">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                apeX Profile System • CryptoGift DAO
              </p>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}

// Team data with wallets
export const TEAM_MEMBERS: TeamMember[] = [
  {
    name: 'Rafael Gonzalez',
    role: 'Founder & Product / Engineering Lead',
    description: 'Web3 dev, youth educator, built CryptoGift Wallets end-to-end on Base.',
    wallet: '0xc655BF2Bd9AfA997c757Bef290A9Bb6ca41c5dE6',
    imageSrc: '/team/C3C8D6AE-5738-4BF9-873C-39EE8847C3F2.png',
    linkedIn: 'http://www.linkedin.com/in/rafael-gonzalez-cgc-mbxarts',
    twitter: 'https://x.com/godezr10894?s=21',
  },
  {
    name: 'Roberto Legrá',
    role: 'Head of Community & Growth / Marketing Advisor',
    description: '6 years Community strategy designer & Crypto community builder. Management of moderators, ambassadors, and content creators.',
    wallet: '0xB5a639149dF81c673131F9082b9429ad00842420',
    imageSrc: '/team/IMG_6757.PNG',
    linkedIn: 'https://www.linkedin.com/in/roberto-legra-7746993a1',
    twitter: 'https://x.com/doctortips_5?s=21',
  },
  {
    name: 'Leodanni Avila',
    role: 'Business Development & Operations / Marketing Advisor',
    description: '3+ years in sales & digital marketing. Experienced Head of Strategy & Business Operations. 5+ years in Web3.',
    wallet: '0x3514433534c281D546B3c3b913c908Bd90689D29',
    imageSrc: '/team/IMG_6773.PNG',
    linkedIn: 'https://www.linkedin.com/in/leodanni-avila-a85199146',
    twitter: 'https://x.com/0xdr_leo?s=21',
  },
];

export default TeamMemberApex;
