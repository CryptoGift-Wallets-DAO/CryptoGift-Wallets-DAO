/**
 * 🤝 REFERRAL TRACKER PROVIDER
 *
 * Automatic referral tracking for CryptoGift DAO.
 * Captures referral codes from URL parameters and registers conversions
 * when users connect their wallet.
 *
 * Features:
 * - Detects ?ref= parameter on page load
 * - Tracks click via API
 * - Stores referral code in cookie
 * - Automatically registers conversion when wallet connects
 *
 * @version 1.0.0
 */

'use client';

import { useEffect, useRef, useCallback, Suspense } from 'react';
import { useAccount } from '@/lib/thirdweb';
import { useSearchParams } from 'next/navigation';

// Cookie utilities
const REFERRAL_CODE_COOKIE = 'cgdao_ref_code';
const REFERRAL_TRACKED_COOKIE = 'cgdao_ref_tracked';
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

function setCookie(name: string, value: string, maxAge: number) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

function deleteCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; path=/; max-age=0`;
}

// Referral code validation
function isValidReferralCode(code: string): boolean {
  // CG-XXXXXX format or custom alphanumeric 4-20 chars
  return /^CG-[A-F0-9]{6}$/i.test(code) || /^[A-Za-z0-9]{4,20}$/.test(code);
}

interface ReferralTrackerProps {
  children: React.ReactNode;
}

/**
 * Internal tracker component that uses searchParams
 */
function ReferralTrackerInner() {
  const { address, isConnected } = useAccount();
  const searchParams = useSearchParams();
  const hasTrackedClick = useRef(false);
  const hasRegisteredConversion = useRef(false);
  const previousAddress = useRef<string | undefined>(undefined);

  // Track referral click when page loads with ?ref= parameter
  const trackReferralClick = useCallback(async (code: string) => {
    try {
      const response = await fetch('/api/referrals/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          source: searchParams.get('utm_source') || 'direct',
          medium: searchParams.get('utm_medium') || null,
          campaign: searchParams.get('utm_campaign') || null,
          referer: typeof document !== 'undefined' ? document.referrer : null,
          landingPage: typeof window !== 'undefined' ? window.location.pathname : null,
        }),
      });

      if (response.ok) {
        // Store referral code in cookie for conversion tracking
        setCookie(REFERRAL_CODE_COOKIE, code, COOKIE_MAX_AGE);
        setCookie(REFERRAL_TRACKED_COOKIE, 'true', COOKIE_MAX_AGE);
        console.log('[ReferralTracker] Click tracked for code:', code);
      }
    } catch (error) {
      console.error('[ReferralTracker] Failed to track click:', error);
    }
  }, [searchParams]);

  // Register conversion when wallet connects
  const registerConversion = useCallback(async (walletAddress: string) => {
    const storedCode = getCookie(REFERRAL_CODE_COOKIE);

    if (!storedCode) {
      console.log('[ReferralTracker] No referral code found in cookies');
      return;
    }

    try {
      const response = await fetch('/api/referrals/track', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet: walletAddress,
          code: storedCode,
          source: searchParams.get('utm_source') || 'direct',
          campaign: searchParams.get('utm_campaign') || null,
        }),
      });

      const data = await response.json();

      if (response.ok && data.data?.registered) {
        console.log('[ReferralTracker] Conversion registered! Referrer:', data.data.referrer);
        // Clear cookies after successful registration
        deleteCookie(REFERRAL_CODE_COOKIE);
        deleteCookie(REFERRAL_TRACKED_COOKIE);
      } else if (data.data?.message) {
        console.log('[ReferralTracker]', data.data.message);
      }
    } catch (error) {
      console.error('[ReferralTracker] Failed to register conversion:', error);
    }
  }, [searchParams]);

  // Effect 1: Track click on page load with ?ref= parameter
  useEffect(() => {
    if (hasTrackedClick.current) return;

    const refCode = searchParams.get('ref');
    if (!refCode) return;

    if (!isValidReferralCode(refCode)) {
      console.warn('[ReferralTracker] Invalid referral code format:', refCode);
      return;
    }

    // Check if we already tracked this code
    const alreadyTracked = getCookie(REFERRAL_TRACKED_COOKIE);
    const existingCode = getCookie(REFERRAL_CODE_COOKIE);

    if (alreadyTracked && existingCode === refCode) {
      console.log('[ReferralTracker] Already tracked this referral code');
      hasTrackedClick.current = true;
      return;
    }

    // Track the click
    hasTrackedClick.current = true;
    trackReferralClick(refCode);
  }, [searchParams, trackReferralClick]);

  // Effect 2: Register conversion when wallet connects
  useEffect(() => {
    // Skip if no address or already registered for this address
    if (!address || !isConnected) return;

    // Check if this is a new wallet connection (not just a re-render)
    if (previousAddress.current === address && hasRegisteredConversion.current) {
      return;
    }

    // Update previous address
    previousAddress.current = address;

    // Check if there's a referral code to convert
    const storedCode = getCookie(REFERRAL_CODE_COOKIE);
    if (!storedCode) return;

    // Prevent duplicate registration
    if (hasRegisteredConversion.current) return;
    hasRegisteredConversion.current = true;

    // Register the conversion
    registerConversion(address);
  }, [address, isConnected, registerConversion]);

  // This component doesn't render anything visible
  return null;
}

/**
 * Main ReferralTracker component with Suspense boundary
 * Safe to use in app layout
 */
export function ReferralTracker({ children }: ReferralTrackerProps) {
  return (
    <>
      <Suspense fallback={null}>
        <ReferralTrackerInner />
      </Suspense>
      {children}
    </>
  );
}

/**
 * Hook to manually check referral status
 * Use this if you need to know if user came from a referral link
 */
export function useReferralInfo() {
  const getReferralCode = useCallback(() => {
    return getCookie(REFERRAL_CODE_COOKIE);
  }, []);

  const wasReferred = useCallback(() => {
    return !!getCookie(REFERRAL_CODE_COOKIE);
  }, []);

  const clearReferralCode = useCallback(() => {
    deleteCookie(REFERRAL_CODE_COOKIE);
    deleteCookie(REFERRAL_TRACKED_COOKIE);
  }, []);

  return {
    getReferralCode,
    wasReferred,
    clearReferralCode,
  };
}
