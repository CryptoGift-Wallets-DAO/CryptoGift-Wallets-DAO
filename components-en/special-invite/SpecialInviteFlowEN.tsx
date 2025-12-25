'use client';

/**
 * SPECIAL INVITE FLOW COMPONENT - ENGLISH VERSION
 *
 * Main flow component for special invites with educational requirements.
 * Based on PreClaimFlow from cryptogift-wallets project.
 *
 * Features:
 * - Two-panel layout (left: image card, right: form/education)
 * - Password validation
 * - Educational module integration
 * - Wallet connection at the end
 *
 * Made by mbxarts.com The Moon in a Box property
 * Co-Author: Godez22
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ConnectButton, useActiveAccount } from 'thirdweb/react';
import { client } from '@/lib/thirdweb/client';
import { InviteImageCard } from '@/components/special-invite/InviteImageCard';
import { EmailVerificationModal } from '@/components/email/EmailVerificationModal';
import { CalendarBookingModal } from '@/components/calendar/CalendarBookingModal';
import dynamic from 'next/dynamic';

// Import persistence service for zero-friction state recovery
import {
  loadInviteProgress,
  initializeInviteProgress,
  initializeEducationState,
  updateStep,
  updatePasswordValidated,
  updateEducationCompleted,
  updateIntroVideoCompleted,
  updateEducationBlock,
  updateEducationQuestionAnswered,
  updateEmailVerified,
  updateCalendarBooked,
  updateSelectedPath,
  updateTwitterVerified,
  updateDiscordVerified,
  updateWalletConnected,
  updateClaimAttempted,
  markCompleted,
  getResumeStep,
  isFlowComplete,
  type InviteFlowProgress,
  type EducationBlockState,
} from '@/lib/invites/invite-flow-persistence';

// Dynamic import for SalesMasterclassEN to avoid SSR issues
const SalesMasterclass = dynamic(() => import('@/components-en/learn/SalesMasterclassEN'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
    </div>
  )
});

// Confetti effect for celebrations
function triggerConfetti() {
  const duration = 3000;
  const animationEnd = Date.now() + duration;

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    for (let i = 0; i < particleCount; i++) {
      const confettiEl = document.createElement('div');
      confettiEl.style.position = 'fixed';
      confettiEl.style.width = '10px';
      confettiEl.style.height = '10px';
      confettiEl.style.backgroundColor = ['#FFD700', '#FFA500', '#FF6347', '#FF69B4', '#00CED1'][Math.floor(Math.random() * 5)];
      confettiEl.style.left = Math.random() * 100 + '%';
      confettiEl.style.top = '-10px';
      confettiEl.style.opacity = '1';
      confettiEl.style.transform = `rotate(${Math.random() * 360}deg)`;
      confettiEl.style.zIndex = '10000';
      confettiEl.className = 'confetti-particle';

      document.body.appendChild(confettiEl);

      confettiEl.animate([
        { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
        { transform: `translateY(${window.innerHeight + 100}px) rotate(${Math.random() * 720}deg)`, opacity: 0 }
      ], {
        duration: randomInRange(2000, 4000),
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      }).onfinish = () => confettiEl.remove();
    }
  }, 250);
}

interface InviteData {
  code: string;
  referrerCode?: string;
  customMessage?: string;
  hasPassword: boolean;
  createdAt?: string;
  expiresAt?: string;
  image?: string;
}

interface SpecialInviteFlowProps {
  inviteData: InviteData;
  onClaimComplete: (walletAddress: string) => void;
  className?: string;
}

type FlowStep = 'welcome' | 'password' | 'education' | 'connect' | 'delegate' | 'complete';

export function SpecialInviteFlowEN({
  inviteData,
  onClaimComplete,
  className = ''
}: SpecialInviteFlowProps) {
  const account = useActiveAccount();

  // Persistence state ref (keeps current without triggering re-renders)
  const progressRef = useRef<InviteFlowProgress | null>(null);
  const isInitialized = useRef(false);

  // Flow State
  const [currentStep, setCurrentStep] = useState<FlowStep>('welcome');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [educationCompleted, setEducationCompleted] = useState(false);
  const [questionsScore, setQuestionsScore] = useState({ correct: 0, total: 0 });

  // Modal State for Email/Calendar verification
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [calendarBooked, setCalendarBooked] = useState(false);

  // 🆕 Social Verification State (useState to trigger re-render on restore)
  const [savedTwitterVerification, setSavedTwitterVerification] = useState<{
    verified: boolean;
    username: string | null;
    userId: string | null;
  } | null>(null);
  const [savedDiscordVerification, setSavedDiscordVerification] = useState<{
    verified: boolean;
    username: string | null;
    userId: string | null;
  } | null>(null);

  // 🆕 Selected Path State (useState to trigger re-render on restore)
  const [savedSelectedPath, setSavedSelectedPath] = useState<string | null>(null);

  // Promise resolvers for modal callbacks (both resolve and reject)
  const emailResolverRef = useRef<{ resolve: () => void; reject: (error: Error) => void } | null>(null);
  const calendarResolverRef = useRef<{ resolve: () => void; reject: (error: Error) => void } | null>(null);

  // 🔒 PERSISTENCE: Load saved progress on mount (Zero Friction)
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const savedProgress = loadInviteProgress(inviteData.code);

    if (savedProgress && !isFlowComplete(savedProgress)) {
      // Resume from saved progress
      console.log('[SpecialInviteFlowEN] 🔄 Resuming progress from:', savedProgress.currentStep);

      // Determine the correct step to resume from
      const resumeStep = getResumeStep(savedProgress, inviteData.hasPassword);

      // Restore all state
      setCurrentStep(resumeStep);
      setEducationCompleted(savedProgress.educationCompleted);
      setQuestionsScore(savedProgress.questionsScore);
      setVerifiedEmail(savedProgress.verifiedEmail);
      setCalendarBooked(savedProgress.calendarBooked);

      // 🆕 Restore social verification state (useState triggers re-render!)
      if (savedProgress.socialVerification?.twitter?.verified) {
        setSavedTwitterVerification({
          verified: true,
          username: savedProgress.socialVerification.twitter.username,
          userId: savedProgress.socialVerification.twitter.userId,
        });
        console.log('[SpecialInviteFlowEN] 🔄 Twitter verification restored:', savedProgress.socialVerification.twitter.username);
      }
      if (savedProgress.socialVerification?.discord?.verified) {
        setSavedDiscordVerification({
          verified: true,
          username: savedProgress.socialVerification.discord.username,
          userId: savedProgress.socialVerification.discord.userId,
        });
        console.log('[SpecialInviteFlowEN] 🔄 Discord verification restored:', savedProgress.socialVerification.discord.username);
      }

      // 🆕 Restore selected path (role)
      if (savedProgress.selectedPath) {
        setSavedSelectedPath(savedProgress.selectedPath);
        console.log('[SpecialInviteFlowEN] 🔄 Selected path restored:', savedProgress.selectedPath);
      }

      // Store the progress ref
      progressRef.current = savedProgress;

      console.log('[SpecialInviteFlowEN] ✅ State restored:', {
        step: resumeStep,
        educationCompleted: savedProgress.educationCompleted,
        verifiedEmail: savedProgress.verifiedEmail,
        calendarBooked: savedProgress.calendarBooked,
        twitterVerified: savedProgress.socialVerification?.twitter?.verified || false,
        discordVerified: savedProgress.socialVerification?.discord?.verified || false,
        selectedPath: savedProgress.selectedPath,
      });
    } else {
      // Initialize new progress
      console.log('[SpecialInviteFlowEN] 🆕 Starting new progress for:', inviteData.code);
      progressRef.current = initializeInviteProgress(inviteData.code, false);
    }
  }, [inviteData.code, inviteData.hasPassword]);

  // Trigger confetti on welcome (only if not resuming from later step)
  useEffect(() => {
    if (currentStep === 'welcome' && !progressRef.current?.educationCompleted) {
      setTimeout(() => {
        triggerConfetti();
      }, 500);
    }
  }, [currentStep]);

  // Auto-advance when wallet connects after education
  useEffect(() => {
    if (currentStep === 'connect' && account?.address) {
      handleWalletConnected();
    }
  }, [account?.address, currentStep]);

  // Handle password validation
  const handlePasswordValidation = async () => {
    if (!password) {
      setValidationError('Please enter the password');
      return;
    }

    setIsValidating(true);
    setValidationError(null);

    try {
      const response = await fetch('/api/referrals/special-invite/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: inviteData.code,
          password
        })
      });

      const data = await response.json();

      if (data.success) {
        // Password correct, move to education
        setCurrentStep('education');

        // 🔒 PERSISTENCE: Save password validated and step change
        if (progressRef.current) {
          progressRef.current = updatePasswordValidated(progressRef.current);
          console.log('[SpecialInviteFlowEN] 💾 Password validated, moving to education');
        }
      } else {
        setValidationError(data.error || 'Incorrect password');
      }
    } catch (error) {
      console.error('Error validating auth:', error);
      setValidationError('Validation error. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  // Handle education completion
  const handleEducationComplete = useCallback((data: {
    questionsScore: { correct: number; total: number };
  }) => {
    setEducationCompleted(true);
    setQuestionsScore(data.questionsScore);
    setCurrentStep('connect');
    triggerConfetti();

    // 🔒 PERSISTENCE: Save education completed state
    if (progressRef.current) {
      progressRef.current = updateEducationCompleted(progressRef.current, data.questionsScore);
      console.log('[SpecialInviteFlowEN] 💾 Education completed, progress saved');
    }
  }, []);

  // Handle wallet connection
  const handleWalletConnected = useCallback(async () => {
    if (!account?.address) return;

    // 🔒 PERSISTENCE: Save wallet connected state
    if (progressRef.current) {
      progressRef.current = updateWalletConnected(progressRef.current, account.address);
      console.log('[SpecialInviteFlowEN] 💾 Wallet connected, progress saved');
    }

    try {
      // Claim the invite
      const response = await fetch('/api/referrals/special-invite/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: inviteData.code,
          claimedBy: account.address
        })
      });

      const data = await response.json();

      if (data.success) {
        // 🔒 PERSISTENCE: Save claim successful state
        if (progressRef.current) {
          progressRef.current = updateClaimAttempted(progressRef.current, true);
          console.log('[SpecialInviteFlowEN] 💾 Claim successful, progress saved');
        }

        // 🔄 Sync any social verifications that were completed during education step
        // (Twitter/Discord verification happens BEFORE wallet connection)
        try {
          console.log('[SpecialInviteFlowEN] Syncing social verifications to DB...');
          const syncResponse = await fetch('/api/social/sync-verified', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ walletAddress: account.address })
          });
          const syncData = await syncResponse.json();
          if (syncData.synced) {
            console.log('[SpecialInviteFlowEN] ✅ Social verifications synced:', syncData.results);
          } else {
            console.log('[SpecialInviteFlowEN] No social verifications to sync (user may not have verified)');
          }
        } catch (syncError) {
          // Non-blocking - don't fail the flow if sync fails
          console.error('[SpecialInviteFlowEN] Social sync error (non-blocking):', syncError);
        }

        setCurrentStep('complete');
        triggerConfetti();
        onClaimComplete(account.address);

        // 🔒 PERSISTENCE: Mark flow as completed
        if (progressRef.current) {
          progressRef.current = markCompleted(progressRef.current);
          console.log('[SpecialInviteFlowEN] 🎉 Flow completed, progress saved');
        }
      } else {
        // 🔒 PERSISTENCE: Save claim failed state
        if (progressRef.current) {
          progressRef.current = updateClaimAttempted(progressRef.current, false);
        }
      }
    } catch (error) {
      console.error('Error claiming invite:', error);
      // 🔒 PERSISTENCE: Save claim error state
      if (progressRef.current) {
        progressRef.current = updateClaimAttempted(progressRef.current, false);
      }
    }
  }, [account?.address, inviteData.code, onClaimComplete]);

  // Start flow
  const handleStartFlow = () => {
    if (inviteData.hasPassword) {
      setCurrentStep('password');
      // 🔒 PERSISTENCE: Save step change
      if (progressRef.current) {
        progressRef.current = updateStep(progressRef.current, 'password');
        console.log('[SpecialInviteFlowEN] 💾 Started flow, moving to auth step');
      }
    } else {
      setCurrentStep('education');
      // 🔒 PERSISTENCE: Save step change (skip password)
      if (progressRef.current) {
        progressRef.current = updateStep(progressRef.current, 'education');
        console.log('[SpecialInviteFlowEN] 💾 Started flow, moving to education');
      }
    }
  };

  // Skip to connect (for testing)
  const handleSkipToConnect = () => {
    setCurrentStep('connect');
  };

  // Promise-based callback for showing email verification modal
  // Returns a Promise that resolves when the user completes email verification
  // or rejects when the user closes the modal without completing
  const handleShowEmailVerification = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      console.log('📧 Opening email verification modal');
      emailResolverRef.current = { resolve, reject };
      setShowEmailModal(true);
    });
  }, []);

  // Promise-based callback for showing calendar booking modal
  // Returns a Promise that resolves when the user completes calendar booking
  // or rejects when the user closes the modal without completing
  const handleShowCalendar = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      console.log('📅 Opening calendar booking modal');
      calendarResolverRef.current = { resolve, reject };
      setShowCalendarModal(true);
    });
  }, []);

  // Handle email verification completion
  const handleEmailVerified = useCallback((email: string) => {
    console.log('✅ Email verified:', email);
    setVerifiedEmail(email);
    setShowEmailModal(false);
    // Resolve the promise so SalesMasterclass can continue
    if (emailResolverRef.current) {
      emailResolverRef.current.resolve();
      emailResolverRef.current = null;
    }

    // 🔒 PERSISTENCE: Save email verified state
    if (progressRef.current) {
      progressRef.current = updateEmailVerified(progressRef.current, email);
      console.log('[SpecialInviteFlowEN] 💾 Email verified, progress saved');
    }
  }, []);

  // Handle calendar booking completion
  const handleCalendarBooked = useCallback(() => {
    console.log('✅ Calendar appointment booked');
    setCalendarBooked(true);
    setShowCalendarModal(false);
    // Resolve the promise so SalesMasterclass can continue
    if (calendarResolverRef.current) {
      calendarResolverRef.current.resolve();
      calendarResolverRef.current = null;
    }

    // 🔒 PERSISTENCE: Save calendar booked state
    if (progressRef.current) {
      progressRef.current = updateCalendarBooked(progressRef.current);
      console.log('[SpecialInviteFlowEN] 💾 Calendar booked, progress saved');
    }
  }, []);

  // Handle modal close without completion - REJECT the promise so checkbox resets
  const handleEmailModalClose = useCallback(() => {
    setShowEmailModal(false);
    // Reject the promise so the checkbox resets in CaptureBlock
    if (emailResolverRef.current) {
      emailResolverRef.current.reject(new Error('Modal closed without completing'));
      emailResolverRef.current = null;
    }
  }, []);

  const handleCalendarModalClose = useCallback(() => {
    setShowCalendarModal(false);
    // Reject the promise so the checkbox resets in CaptureBlock
    if (calendarResolverRef.current) {
      calendarResolverRef.current.reject(new Error('Modal closed without completing'));
      calendarResolverRef.current = null;
    }
  }, []);

  // 🔒 PERSISTENCE: Handle education state changes from SalesMasterclass
  // This enables GRANULAR persistence - each block, each video, each question
  const handleEducationStateChange = useCallback((state: {
    blockIndex: number;
    blockId: string;
    introVideoCompleted?: boolean;
    outroVideoCompleted?: boolean;
    questionAnswered?: {
      blockId: string;
      questionText: string;
      selectedAnswer: string;
      correctAnswer: string;
      isCorrect: boolean;
    };
  }) => {
    if (!progressRef.current) {
      console.warn('[SpecialInviteFlowEN] No progress ref, cannot save education state');
      return;
    }

    console.log('[SpecialInviteFlowEN] 🔒 Education state change:', state);

    // Initialize education state if not already present
    if (!progressRef.current.educationState) {
      progressRef.current = initializeEducationState(progressRef.current);
    }

    // Handle intro video completion
    if (state.introVideoCompleted) {
      progressRef.current = updateIntroVideoCompleted(progressRef.current);
      console.log('[SpecialInviteFlowEN] 💾 Intro video completed, saved');
    }

    // Handle block navigation
    if (state.blockIndex !== undefined) {
      progressRef.current = updateEducationBlock(
        progressRef.current,
        state.blockIndex,
        state.blockId
      );
      console.log('[SpecialInviteFlowEN] 💾 Block index saved:', state.blockIndex);
    }

    // Handle question answered
    if (state.questionAnswered) {
      progressRef.current = updateEducationQuestionAnswered(
        progressRef.current,
        state.questionAnswered
      );
      console.log('[SpecialInviteFlowEN] 💾 Question answer saved:', state.questionAnswered.blockId);
    }
  }, []);

  /**
   * 🆕 Handle social verification (Twitter/Discord)
   * Persists verification state to localStorage to survive page refresh and language changes
   */
  const handleSocialVerified = useCallback((
    platform: 'twitter' | 'discord',
    data: { username: string; userId: string }
  ) => {
    if (!progressRef.current) {
      console.warn('[SpecialInviteFlowEN] No progress ref, cannot save social verification');
      return;
    }

    console.log(`[SpecialInviteFlowEN] 🔒 ${platform} verification:`, data.username);

    if (platform === 'twitter') {
      progressRef.current = updateTwitterVerified(progressRef.current, data);
      // 🆕 Also update useState to trigger re-render
      setSavedTwitterVerification({
        verified: true,
        username: data.username,
        userId: data.userId,
      });
    } else if (platform === 'discord') {
      progressRef.current = updateDiscordVerified(progressRef.current, data);
      // 🆕 Also update useState to trigger re-render
      setSavedDiscordVerification({
        verified: true,
        username: data.username,
        userId: data.userId,
      });
    }

    console.log(`[SpecialInviteFlowEN] 💾 ${platform} verification saved`);
  }, []);

  /**
   * 🆕 Handle role/path selection
   * Persists selected role to localStorage to survive page refresh and language changes
   */
  const handlePathSelected = useCallback((path: string) => {
    if (!progressRef.current) {
      console.warn('[SpecialInviteFlowEN] No progress ref, cannot save selected path');
      return;
    }

    console.log(`[SpecialInviteFlowEN] 🎯 Selected path:`, path);
    progressRef.current = updateSelectedPath(progressRef.current, path);
    // 🆕 Also update useState to trigger re-render
    setSavedSelectedPath(path);
    console.log(`[SpecialInviteFlowEN] 💾 Selected path saved`);
  }, []);

  // Render content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center animate-bounce shadow-lg overflow-hidden">
                  <Image
                    src="/apeX.png"
                    alt="apeX"
                    width={72}
                    height={72}
                    className="object-cover"
                  />
                </div>
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                Congratulations! You Have Received a Special Invitation
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Someone special has selected you to join CryptoGift DAO
              </p>
              <p className="text-sm text-purple-600 dark:text-purple-400 mt-3 font-medium bg-purple-50 dark:bg-purple-900/20 rounded-lg px-3 py-2 border border-purple-200 dark:border-purple-700">
                ✨ By completing your community entry you&apos;ll receive 200 CGC as a reward, giving you access to all community tools and activating your voting power.
              </p>
            </div>

            {/* Trust Indicators */}
            <div className="flex justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                100% Secure
              </span>
              <span className="flex items-center gap-1">
                <span className="text-yellow-500">⭐</span>
                +10,000 members
              </span>
              <span className="flex items-center gap-1">
                <span className="text-blue-500">🔒</span>
                Blockchain verified
              </span>
            </div>

            {/* Sales Hook Banner */}
            <div className="p-4 bg-gradient-to-r from-purple-50 to-cyan-50 dark:from-purple-900/20 dark:to-cyan-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
              <div className="flex items-start">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center mr-3 flex-shrink-0 shadow-md">
                  <span className="text-2xl">🏛️</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-purple-800 dark:text-purple-300 mb-1">
                    Welcome to the future of organizations!
                  </h3>
                  <p className="text-sm text-purple-700 dark:text-purple-400">
                    CryptoGift DAO is a decentralized community where members
                    govern, contribute, and benefit together. Your invitation gives you
                    access to CGC tokens, paid tasks, and voting on decisions.
                  </p>
                </div>
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={handleStartFlow}
              className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white py-4 px-6 rounded-xl hover:from-purple-700 hover:to-cyan-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <span className="flex items-center justify-center gap-2">
                <span>🚀</span>
                Start My Journey
              </span>
            </button>

            {/* Benefits Preview */}
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <span className="text-green-500 mr-2">✓</span>
                <span>No costs - 100% free</span>
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <span className="text-green-500 mr-2">✓</span>
                <span>Welcome CGC tokens</span>
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <span className="text-green-500 mr-2">✓</span>
                <span>Access to paid tasks</span>
              </div>
            </div>
          </motion.div>
        );

      case 'password':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔐</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Access Validation
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Enter the password shared by your referrer
              </p>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                🔑 Referrer Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && password && !isValidating) {
                      handlePasswordValidation();
                    }
                  }}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter the password"
                  disabled={isValidating}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                The person who invited you should have shared a password with you
              </p>
            </div>

            {/* Error Display */}
            {validationError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3">
                <div className="flex items-start">
                  <span className="text-red-500 mr-2">⚠️</span>
                  <p className="text-sm text-red-800 dark:text-red-300">{validationError}</p>
                </div>
              </div>
            )}

            {/* Validate Button */}
            <button
              onClick={handlePasswordValidation}
              disabled={!password || isValidating}
              className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white py-3 px-4 rounded-xl hover:from-purple-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg"
            >
              {isValidating ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Validating...
                </div>
              ) : (
                <span className="flex items-center justify-center">
                  <span className="mr-2">🎯</span>
                  Validate and Continue
                </span>
              )}
            </button>
          </motion.div>
        );

      case 'education':
        return (
          <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 overflow-y-auto">
            <SalesMasterclass
              educationalMode={true}
              onEducationComplete={(data) => {
                handleEducationComplete({
                  questionsScore: data?.questionsScore || { correct: 0, total: 0 }
                });
              }}
              onShowEmailVerification={handleShowEmailVerification}
              onShowCalendar={handleShowCalendar}
              verifiedEmail={verifiedEmail || undefined}
              // 🔒 PERSISTENCE: Pass saved education state and change handler
              savedEducationState={progressRef.current?.educationState}
              onEducationStateChange={handleEducationStateChange}
              // 🆕 PERSISTENCE: Pass saved social verification state (from useState, triggers re-render!)
              savedSocialVerification={(savedTwitterVerification || savedDiscordVerification) ? {
                twitter: savedTwitterVerification,
                discord: savedDiscordVerification,
              } : null}
              onSocialVerified={handleSocialVerified}
              // 🆕 PERSISTENCE: Pass saved role/path state (from useState, triggers re-render!)
              savedSelectedPath={savedSelectedPath}
              onPathSelected={handlePathSelected}
            />
          </div>
        );

      case 'connect':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🎉</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Education Completed!
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Score: {questionsScore.correct}/{questionsScore.total} correct answers
              </p>
            </div>

            {/* Success Badge */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-4">
              <div className="flex items-start">
                <span className="text-green-500 text-2xl mr-3">✅</span>
                <div>
                  <h3 className="font-semibold text-green-800 dark:text-green-300">
                    You're ready to join
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                    Just connect your wallet to receive your initial 200 CGC and complete your entry to the DAO
                  </p>
                </div>
              </div>
            </div>

            {/* 200 CGC Bonus Banner */}
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-2 border-yellow-300 dark:border-yellow-700 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center">
                    <span className="text-2xl">💰</span>
                  </div>
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-bold text-yellow-900 dark:text-yellow-200 mb-1">
                    🎁 Welcome Bonus!
                  </h4>
                  <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-2">
                    Upon connecting your wallet you'll automatically receive:
                  </p>
                  <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3 border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">200 CGC</span>
                      <span className="text-sm text-yellow-600 dark:text-yellow-500">+ Referral bonuses</span>
                    </div>
                  </div>
                  <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-2">
                    Tokens will be deposited automatically to your wallet
                  </p>
                </div>
              </div>
            </div>

            {/* Connect Wallet */}
            <div className="text-center space-y-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                🔗 Connect your wallet to finish
              </p>

              <div className="flex justify-center">
                {client && (
                  <ConnectButton
                    client={client}
                    connectButton={{
                      label: '🔗 Connect Wallet',
                      className: 'bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-medium px-8 py-3 rounded-xl shadow-lg'
                    }}
                  />
                )}
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                We support MetaMask, WalletConnect, Coinbase Wallet and more
              </p>
            </div>

            {/* What you get */}
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 space-y-2">
              <h4 className="font-medium text-purple-800 dark:text-purple-300">
                Upon connecting you will receive:
              </h4>
              <ul className="text-sm text-purple-700 dark:text-purple-400 space-y-1">
                <li>✨ Welcome CGC tokens</li>
                <li>✨ Access to the task panel</li>
                <li>✨ Voting power in the DAO</li>
                <li>✨ Founding member badge</li>
              </ul>
            </div>
          </motion.div>
        );

      case 'complete':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6 text-center"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto">
              <span className="text-5xl">🎊</span>
            </div>

            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent mb-2">
                Welcome to the DAO!
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Your membership has been successfully registered
              </p>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-700">
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 text-green-800 dark:text-green-300">
                  <span>✅</span>
                  <span>Wallet connected</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-green-800 dark:text-green-300">
                  <span>✅</span>
                  <span>Education completed</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-green-800 dark:text-green-300">
                  <span>✅</span>
                  <span>Invitation claimed</span>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <a
                href="/"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white px-8 py-3 rounded-xl font-medium hover:from-purple-700 hover:to-cyan-700 transition-all"
              >
                <span>🚀</span>
                Go to Dashboard
              </a>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  // If we're in education step, render fullscreen with modals
  if (currentStep === 'education') {
    return (
      <>
        {renderStepContent()}

        {/* Email Verification Modal - Always available */}
        <EmailVerificationModal
          isOpen={showEmailModal}
          onClose={handleEmailModalClose}
          onVerified={handleEmailVerified}
          source="special-invite"
        />

        {/* Calendar Booking Modal - Always available */}
        <CalendarBookingModal
          isOpen={showCalendarModal}
          onClose={handleCalendarModalClose}
          onBooked={handleCalendarBooked}
          userEmail={verifiedEmail || undefined}
          source="special-invite"
        />
      </>
    );
  }

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 ${className}`}>
      {/* Left Panel - Image Card */}
      <div>
        <InviteImageCard
          image={inviteData.image || '/special-referral.jpg'}
          name="DAO Special Invitation"
          customMessage={inviteData.customMessage}
          referrerCode={inviteData.referrerCode}
          inviteCode={inviteData.code}
          expiresAt={inviteData.expiresAt}
          status="active"
          className="mb-6"
        />

        {/* Help Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            🎟️ Your Invitation Is Waiting!
          </h3>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-white font-bold text-xs">💰</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">CGC Tokens</p>
                <p className="text-xs mt-1">Receive governance tokens to participate in the DAO.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-white font-bold text-xs">🚀</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Paid Tasks</p>
                <p className="text-xs mt-1">Access paid tasks and earn more tokens.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-white font-bold text-xs">🎓</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Community</p>
                <p className="text-xs mt-1">Join thousands of pioneers in decentralized finance.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Flow Content */}
      <div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 relative">
          {/* Step Indicator */}
          <div className="flex justify-center gap-2 mb-6">
            {['welcome', 'password', 'education', 'connect', 'complete'].map((step, idx) => {
              const stepOrder = ['welcome', 'password', 'education', 'connect', 'complete'];
              const currentIdx = stepOrder.indexOf(currentStep);
              const stepIdx = stepOrder.indexOf(step);
              const isActive = stepIdx === currentIdx;
              const isCompleted = stepIdx < currentIdx;

              // Skip password step indicator if no password required
              if (step === 'password' && !inviteData.hasPassword) return null;

              return (
                <div
                  key={step}
                  className={`w-3 h-3 rounded-full transition-all ${
                    isCompleted
                      ? 'bg-green-500'
                      : isActive
                      ? 'bg-purple-500 scale-125'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              );
            })}
          </div>

          {renderStepContent()}
        </div>

        {/* Trust Footer - Always shown since education step returns early */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1">
                  🏆 Why CryptoGift DAO?
                </h4>
                <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
                  <li>• <strong>Decentralized:</strong> No intermediaries or bosses</li>
                  <li>• <strong>Transparent:</strong> Everything on public blockchain</li>
                  <li>• <strong>Community-driven:</strong> Governed by members</li>
                  <li>• <strong>Rewarding:</strong> Earn by contributing</li>
                </ul>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
}
