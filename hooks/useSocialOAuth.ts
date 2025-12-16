/**
 * 🔐 Social OAuth Hook
 *
 * Provides easy-to-use OAuth popup flow for Twitter and Discord verification
 * Automatically checks if user completed the required action (follow/join)
 */

import { useState, useCallback, useEffect, useRef } from 'react';

export type SocialPlatform = 'twitter' | 'discord';

export interface OAuthResult {
  success: boolean;
  platform: SocialPlatform;
  verified: boolean;
  userId?: string;
  username?: string;
  error?: string;
}

export interface UseSocialOAuthOptions {
  walletAddress: string;
  onVerified?: (platform: SocialPlatform, username: string) => void;
  onError?: (error: string) => void;
}

export function useSocialOAuth(options: UseSocialOAuthOptions) {
  const { walletAddress, onVerified, onError } = options;

  const [twitterVerified, setTwitterVerified] = useState(false);
  const [discordVerified, setDiscordVerified] = useState(false);
  const [twitterUsername, setTwitterUsername] = useState<string | null>(null);
  const [discordUsername, setDiscordUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<SocialPlatform | null>(null);
  const [error, setError] = useState<string | null>(null);

  const popupRef = useRef<Window | null>(null);

  // Listen for OAuth callback messages from popup
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Verify origin if needed
      if (event.data?.type !== 'SOCIAL_OAUTH_CALLBACK') return;

      const result: OAuthResult = event.data;
      setIsLoading(null);

      if (result.success && result.verified) {
        if (result.platform === 'twitter') {
          setTwitterVerified(true);
          setTwitterUsername(result.username || null);
          onVerified?.('twitter', result.username || '');
        } else if (result.platform === 'discord') {
          setDiscordVerified(true);
          setDiscordUsername(result.username || null);
          onVerified?.('discord', result.username || '');
        }
        setError(null);
      } else if (result.success && !result.verified) {
        // User authenticated but didn't complete the action
        setError(result.error || `Please ${result.platform === 'twitter' ? 'follow @cryptogiftdao' : 'join our Discord'} first`);
        onError?.(result.error || 'Action not completed');
      } else {
        setError(result.error || 'Verification failed');
        onError?.(result.error || 'Verification failed');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onVerified, onError]);

  // Open OAuth popup for a platform
  const startVerification = useCallback(async (platform: SocialPlatform) => {
    if (!walletAddress) {
      setError('Wallet not connected');
      return;
    }

    setIsLoading(platform);
    setError(null);

    try {
      // Get OAuth URL from API
      const response = await fetch('/api/social/oauth-init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, walletAddress }),
      });

      const data = await response.json();

      if (!response.ok || !data.authUrl) {
        throw new Error(data.error || 'Failed to get OAuth URL');
      }

      // Close any existing popup
      if (popupRef.current && !popupRef.current.closed) {
        popupRef.current.close();
      }

      // Calculate popup position (center of screen)
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      // Open popup
      popupRef.current = window.open(
        data.authUrl,
        `${platform}OAuth`,
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
      );

      // Monitor popup closure
      const checkClosed = setInterval(() => {
        if (popupRef.current?.closed) {
          clearInterval(checkClosed);
          // If still loading when popup closes, user cancelled
          setIsLoading((current) => {
            if (current === platform) {
              setError('Verification cancelled');
              return null;
            }
            return current;
          });
        }
      }, 500);
    } catch (err) {
      console.error('[SocialOAuth] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to start verification');
      setIsLoading(null);
    }
  }, [walletAddress]);

  // Convenience methods
  const verifyTwitter = useCallback(() => startVerification('twitter'), [startVerification]);
  const verifyDiscord = useCallback(() => startVerification('discord'), [startVerification]);

  // Reset state
  const reset = useCallback(() => {
    setTwitterVerified(false);
    setDiscordVerified(false);
    setTwitterUsername(null);
    setDiscordUsername(null);
    setError(null);
    setIsLoading(null);
  }, []);

  return {
    // State
    twitterVerified,
    discordVerified,
    twitterUsername,
    discordUsername,
    isLoading,
    error,

    // Actions
    startVerification,
    verifyTwitter,
    verifyDiscord,
    reset,

    // Computed
    isTwitterLoading: isLoading === 'twitter',
    isDiscordLoading: isLoading === 'discord',
  };
}
