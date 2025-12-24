'use client';

/**
 * SPECIAL INVITE FLOW COMPONENT
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
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ConnectButton, useActiveAccount } from 'thirdweb/react';
import { client } from '@/lib/thirdweb/client';
import { InviteImageCard } from './InviteImageCard';
import { DelegationStep } from './DelegationStep';
import { EmailVerificationModal } from '@/components/email/EmailVerificationModal';
import { CalendarBookingModal } from '@/components/calendar/CalendarBookingModal';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { GraduationCap, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';
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
  updateWalletConnected,
  updateClaimAttempted,
  markCompleted,
  getResumeStep,
  isFlowComplete,
  type InviteFlowProgress,
  type EducationBlockState,
} from '@/lib/invites/invite-flow-persistence';

// Dynamic imports for SalesMasterclass (Spanish and English versions) to avoid SSR issues
const SalesMasterclassES = dynamic(() => import('../learn/SalesMasterclass'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
    </div>
  )
});

const SalesMasterclassEN = dynamic(() => import('@/components-en/learn/SalesMasterclassEN'), {
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
  isPermanent?: boolean; // Flag to use permanent invite APIs instead of special invite APIs
  className?: string;
}

type FlowStep = 'welcome' | 'password' | 'education' | 'connect' | 'delegate' | 'complete';

export function SpecialInviteFlow({
  inviteData,
  onClaimComplete,
  isPermanent = false,
  className = ''
}: SpecialInviteFlowProps) {
  const account = useActiveAccount();
  const t = useTranslations('specialInvite');

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

  // Language/Locale State for bilingual support
  const [currentLocale, setCurrentLocale] = useState<'es' | 'en'>('en'); // Default to 'en' to match system default

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
      console.log('[SpecialInviteFlow] 🔄 Resuming progress from:', savedProgress.currentStep);

      // Determine the correct step to resume from
      const resumeStep = getResumeStep(savedProgress, inviteData.hasPassword);

      // Restore all state
      setCurrentStep(resumeStep);
      setEducationCompleted(savedProgress.educationCompleted);
      setQuestionsScore(savedProgress.questionsScore);
      setVerifiedEmail(savedProgress.verifiedEmail);
      setCalendarBooked(savedProgress.calendarBooked);

      // Store the progress ref
      progressRef.current = savedProgress;

      console.log('[SpecialInviteFlow] ✅ State restored:', {
        step: resumeStep,
        educationCompleted: savedProgress.educationCompleted,
        verifiedEmail: savedProgress.verifiedEmail,
        calendarBooked: savedProgress.calendarBooked
      });
    } else {
      // Initialize new progress
      console.log('[SpecialInviteFlow] 🆕 Starting new progress for:', inviteData.code);
      progressRef.current = initializeInviteProgress(inviteData.code, isPermanent);
    }
  }, [inviteData.code, inviteData.hasPassword, isPermanent]);

  // Trigger confetti on welcome (only if not resuming from later step)
  useEffect(() => {
    if (currentStep === 'welcome' && !progressRef.current?.educationCompleted) {
      setTimeout(() => {
        triggerConfetti();
      }, 500);
    }
  }, [currentStep]);

  // Read locale from cookie on mount
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const cookies = document.cookie.split(';');
      const localeCookie = cookies.find(c => c.trim().startsWith('NEXT_LOCALE='));
      if (localeCookie) {
        const locale = localeCookie.split('=')[1] as 'es' | 'en';
        if (locale === 'en' || locale === 'es') {
          setCurrentLocale(locale);
        }
      }
    }
  }, []);

  // Auto-advance when wallet connects after education
  useEffect(() => {
    if (currentStep === 'connect' && account?.address) {
      handleWalletConnected();
    }
  }, [account?.address, currentStep]);

  // Handle password validation
  const handlePasswordValidation = async () => {
    if (!password) {
      setValidationError('Por favor, ingresa la contrasena');
      return;
    }

    setIsValidating(true);
    setValidationError(null);

    try {
      // Use appropriate API endpoint based on invite type
      const endpoint = isPermanent
        ? '/api/referrals/permanent-invite/verify-password'
        : '/api/referrals/special-invite/verify-password';

      const response = await fetch(endpoint, {
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

        // 🔒 PERSISTENCE: Save password validated state
        if (progressRef.current) {
          progressRef.current = updatePasswordValidated(progressRef.current);
          console.log('[SpecialInviteFlow] 💾 Password validated, progress saved');
        }
      } else {
        setValidationError(data.error || 'Contrasena incorrecta');
      }
    } catch (error) {
      console.error('Error validating password:', error);
      setValidationError('Error al validar. Intenta de nuevo.');
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
      console.log('[SpecialInviteFlow] 💾 Education completed, progress saved');
    }
  }, []);

  // Handle wallet connection
  const handleWalletConnected = useCallback(async () => {
    if (!account?.address) return;

    // 🔒 PERSISTENCE: Save wallet connected state
    if (progressRef.current) {
      progressRef.current = updateWalletConnected(progressRef.current, account.address);
      console.log('[SpecialInviteFlow] 💾 Wallet connected, progress saved');
    }

    try {
      // Use appropriate API endpoint based on invite type
      const endpoint = isPermanent
        ? '/api/referrals/permanent-invite/claim'
        : '/api/referrals/special-invite/claim';

      // Claim the invite
      const response = await fetch(endpoint, {
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
          console.log('[SpecialInviteFlow] 💾 Claim successful, progress saved');
        }

        // 🔄 Sync any social verifications that were completed during education step
        // (Twitter/Discord verification happens BEFORE wallet connection)
        try {
          console.log('[SpecialInviteFlow] Syncing social verifications to DB...');
          const syncResponse = await fetch('/api/social/sync-verified', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ walletAddress: account.address })
          });
          const syncData = await syncResponse.json();
          if (syncData.synced) {
            console.log('[SpecialInviteFlow] ✅ Social verifications synced:', syncData.results);
          } else {
            console.log('[SpecialInviteFlow] No social verifications to sync (user may not have verified)');
          }
        } catch (syncError) {
          // Non-blocking - don't fail the flow if sync fails
          console.error('[SpecialInviteFlow] Social sync error (non-blocking):', syncError);
        }

        // Go to delegation step instead of complete
        setCurrentStep('delegate');
        triggerConfetti();
        onClaimComplete(account.address);
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
  }, [account?.address, inviteData.code, onClaimComplete, isPermanent]);

  // Handle delegation completion
  const handleDelegationComplete = useCallback(() => {
    setCurrentStep('complete');
    triggerConfetti();

    // 🔒 PERSISTENCE: Mark flow as completed
    if (progressRef.current) {
      progressRef.current = markCompleted(progressRef.current);
      console.log('[SpecialInviteFlow] 🎉 Flow completed, progress saved');
    }
  }, []);

  // Start flow
  const handleStartFlow = () => {
    if (inviteData.hasPassword) {
      setCurrentStep('password');
      // 🔒 PERSISTENCE: Save step change
      if (progressRef.current) {
        progressRef.current = updateStep(progressRef.current, 'password');
        console.log('[SpecialInviteFlow] 💾 Started flow, moving to password');
      }
    } else {
      setCurrentStep('education');
      // 🔒 PERSISTENCE: Save step change (skip password)
      if (progressRef.current) {
        progressRef.current = updateStep(progressRef.current, 'education');
        console.log('[SpecialInviteFlow] 💾 Started flow, moving to education');
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
      console.log('[SpecialInviteFlow] 💾 Email verified, progress saved');
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
      console.log('[SpecialInviteFlow] 💾 Calendar booked, progress saved');
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
      console.warn('[SpecialInviteFlow] No progress ref, cannot save education state');
      return;
    }

    console.log('[SpecialInviteFlow] 🔒 Education state change:', state);

    // Initialize education state if not already present
    if (!progressRef.current.educationState) {
      progressRef.current = initializeEducationState(progressRef.current);
    }

    // Handle intro video completion
    if (state.introVideoCompleted) {
      progressRef.current = updateIntroVideoCompleted(progressRef.current);
      console.log('[SpecialInviteFlow] 💾 Intro video completed, saved');
    }

    // Handle block navigation
    if (state.blockIndex !== undefined) {
      progressRef.current = updateEducationBlock(
        progressRef.current,
        state.blockIndex,
        state.blockId
      );
      console.log('[SpecialInviteFlow] 💾 Block index saved:', state.blockIndex);
    }

    // Handle question answered
    if (state.questionAnswered) {
      progressRef.current = updateEducationQuestionAnswered(
        progressRef.current,
        state.questionAnswered
      );
      console.log('[SpecialInviteFlow] 💾 Question answer saved:', state.questionAnswered.blockId);
    }
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
                {t('welcome.title')}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {t('welcome.subtitle')}
              </p>
            </div>

            {/* Trust Indicators */}
            <div className="flex justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {t('welcome.trustSecure')}
              </span>
              <span className="flex items-center gap-1">
                <span className="text-yellow-500">⭐</span>
                {t('welcome.trustMembers')}
              </span>
              <span className="flex items-center gap-1">
                <span className="text-blue-500">🔒</span>
                {t('welcome.trustVerified')}
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
                    {t('welcome.bannerTitle')}
                  </h3>
                  <p className="text-sm text-purple-700 dark:text-purple-400">
                    {t('welcome.bannerDescription')}
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
                {t('welcome.startButton')}
              </span>
            </button>

            {/* Benefits Preview */}
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <span className="text-green-500 mr-2">✓</span>
                <span>{t('welcome.benefit1')}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <span className="text-green-500 mr-2">✓</span>
                <span>{t('welcome.benefit2')}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <span className="text-green-500 mr-2">✓</span>
                <span>{t('welcome.benefit3')}</span>
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
                {t('password.title')}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('password.subtitle')}
              </p>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                🔑 {t('password.label')}
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
                  placeholder={t('password.placeholder')}
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
                {t('password.hint')}
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
                  {t('password.validating')}
                </div>
              ) : (
                <span className="flex items-center justify-center">
                  <span className="mr-2">🎯</span>
                  {t('password.validateButton')}
                </span>
              )}
            </button>
          </motion.div>
        );

      case 'education':
        // Select the correct language component based on current locale
        const SalesMasterclass = currentLocale === 'en' ? SalesMasterclassEN : SalesMasterclassES;
        return (
          <div className="fixed top-16 inset-x-0 bottom-0 z-50 bg-slate-900 overflow-hidden overscroll-none">
            {/* Inner scrollable container with strict overflow control - prevents scrolling beyond content */}
            <div
              className="h-full overflow-y-auto overflow-x-hidden overscroll-contain bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900"
              style={{
                maxHeight: 'calc(100vh - 64px)', // 64px = top-16 header height
                overscrollBehavior: 'contain' // Prevents bounce/overscroll
              }}
            >
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
                // 🔙 NAVIGATION: Allow going back to Welcome step from video
                onBackToWelcome={() => {
                  console.log('[SpecialInviteFlow] 🔙 Going back to Welcome step from video');
                  setCurrentStep('welcome');
                }}
              />
            </div>
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
                {t('connect.title')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t('connect.score', { correct: questionsScore.correct, total: questionsScore.total })}
              </p>
            </div>

            {/* Success Badge */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-4">
              <div className="flex items-start">
                <span className="text-green-500 text-2xl mr-3">✅</span>
                <div>
                  <h3 className="font-semibold text-green-800 dark:text-green-300">
                    {t('connect.readyTitle')}
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                    {t('connect.readyDescription')}
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
                    🎁 ¡Bono de Bienvenida!
                  </h4>
                  <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-2">
                    Al conectar tu wallet recibirás automáticamente:
                  </p>
                  <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3 border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">200 CGC</span>
                      <span className="text-sm text-yellow-600 dark:text-yellow-500">+ Comisiones multinivel</span>
                    </div>
                  </div>
                  <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-2">
                    Los tokens se depositarán automáticamente en tu wallet
                  </p>
                </div>
              </div>
            </div>

            {/* Connect Wallet */}
            <div className="text-center space-y-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                🔗 {t('connect.connectPrompt')}
              </p>

              <div className="flex justify-center">
                {client && (
                  <ConnectButton
                    client={client}
                    connectButton={{
                      label: `🔗 ${t('connect.connectButton')}`,
                      className: 'bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-medium px-8 py-3 rounded-xl shadow-lg'
                    }}
                  />
                )}
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('connect.walletSupport')}
              </p>
            </div>

            {/* What you get */}
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 space-y-2">
              <h4 className="font-medium text-purple-800 dark:text-purple-300">
                {t('connect.benefitsTitle')}
              </h4>
              <ul className="text-sm text-purple-700 dark:text-purple-400 space-y-1">
                <li>✨ {t('connect.benefit1')}</li>
                <li>✨ {t('connect.benefit2')}</li>
                <li>✨ {t('connect.benefit3')}</li>
                <li>✨ {t('connect.benefit4')}</li>
              </ul>
            </div>
          </motion.div>
        );

      case 'delegate':
        return (
          <DelegationStep
            onComplete={handleDelegationComplete}
            allowSkip={true}
          />
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
                {t('complete.title')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t('complete.subtitle')}
              </p>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-700">
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 text-green-800 dark:text-green-300">
                  <span>✅</span>
                  <span>{t('complete.walletConnected')}</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-green-800 dark:text-green-300">
                  <span>✅</span>
                  <span>{t('complete.educationCompleted')}</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-green-800 dark:text-green-300">
                  <span>✅</span>
                  <span>{t('complete.inviteClaimed')}</span>
                </div>
              </div>
            </div>

            {/* Token Import Instructions Card */}
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-5 border-2 border-amber-300 dark:border-amber-600 text-left">
              <h3 className="font-bold text-amber-800 dark:text-amber-300 mb-3">
                {t('complete.importToken.title')}
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-400 mb-4">
                {t('complete.importToken.description')}
              </p>

              {/* What you already have */}
              <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-3 mb-4">
                <p className="font-medium text-green-800 dark:text-green-300 text-sm mb-2">
                  {t('complete.importToken.alreadyHave')}
                </p>
                <div className="space-y-1 text-xs text-green-700 dark:text-green-400">
                  <p>{t('complete.importToken.votingPower')}</p>
                  <p>{t('complete.importToken.communityAccess')}</p>
                  <p>{t('complete.importToken.daoMember')}</p>
                </div>
              </div>

              {/* Import steps */}
              <p className="font-medium text-amber-800 dark:text-amber-300 text-sm mb-2">
                {t('complete.importToken.howToImport')}
              </p>
              <ol className="text-xs text-amber-700 dark:text-amber-400 space-y-2 mb-4">
                <li>1. {t('complete.importToken.step1')}</li>
                <li>2. {t('complete.importToken.step2')}</li>
                <li className="flex flex-col gap-1">
                  <span>3. {t('complete.importToken.step3')}</span>
                  <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded p-2 font-mono text-xs">
                    <span className="truncate flex-1">0x5e3a61b550328f3D8C44f60b3e10a49D3d806175</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('0x5e3a61b550328f3D8C44f60b3e10a49D3d806175');
                        // Simple visual feedback
                        const btn = document.getElementById('copy-cgc-btn');
                        if (btn) {
                          btn.textContent = t('complete.importToken.copied');
                          setTimeout(() => {
                            btn.textContent = t('complete.importToken.copyAddress');
                          }, 2000);
                        }
                      }}
                      id="copy-cgc-btn"
                      className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded text-xs whitespace-nowrap"
                    >
                      {t('complete.importToken.copyAddress')}
                    </button>
                  </div>
                </li>
                <li>4. {t('complete.importToken.step4')}</li>
              </ol>

              <p className="text-xs text-amber-600 dark:text-amber-500 italic">
                {t('complete.importToken.checkHistory')}
              </p>
            </div>

            <div className="pt-4">
              <a
                href="/"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white px-8 py-3 rounded-xl font-medium hover:from-purple-700 hover:to-cyan-700 transition-all"
              >
                <span>🚀</span>
                {t('complete.dashboardButton')}
              </a>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  // Header component for reuse (defined here for education step)
  const HeaderBar = () => (
    <header className="fixed top-0 left-0 right-0 z-[60] border-b border-gray-200/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-600">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                {t('header.title')}
              </h1>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {t('header.subtitle')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <LanguageToggle />
            <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hidden sm:flex">
              <Star className="h-3 w-3 mr-1" />
              Premium
            </Badge>
          </div>
        </div>
      </div>
    </header>
  );

  // If we're in education step, render fullscreen with modals
  if (currentStep === 'education') {
    return (
      <>
        <HeaderBar />

        {/* Education container already has top-16 offset */}
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
          inviteCode={inviteData.code}
          source="special-invite"
        />
      </>
    );
  }

  return (
    <>
      <HeaderBar />
      <div className={`pt-16 grid grid-cols-1 md:grid-cols-2 gap-8 ${className}`}>
        {/* Left Panel - Image Card */}
        <div>
          <InviteImageCard
          image={inviteData.image || '/special-referral.jpg'}
          name={t('card.name')}
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
            🎟️ {t('helpSection.title')}
          </h3>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-white font-bold text-xs">💰</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{t('card.tokensTitle')}</p>
                <p className="text-xs mt-1">{t('card.tokensDesc')}</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-white font-bold text-xs">🚀</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{t('card.tasksTitle')}</p>
                <p className="text-xs mt-1">{t('card.tasksDesc')}</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-white font-bold text-xs">🎓</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{t('card.communityTitle')}</p>
                <p className="text-xs mt-1">{t('card.communityDesc')}</p>
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
            {['welcome', 'password', 'education', 'connect', 'delegate', 'complete'].map((step, idx) => {
              const stepOrder = ['welcome', 'password', 'education', 'connect', 'delegate', 'complete'];
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
                  🏆 {t('helpSection.whyTitle')}
                </h4>
                <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
                  <li>• {t('helpSection.decentralized')}</li>
                  <li>• {t('helpSection.transparent')}</li>
                  <li>• {t('helpSection.community')}</li>
                  <li>• {t('helpSection.rewarded')}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
