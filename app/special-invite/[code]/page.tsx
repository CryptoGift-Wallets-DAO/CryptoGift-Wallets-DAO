/**
 * SPECIAL INVITE PAGE
 *
 * Simplified preclaim flow for special referral invites.
 * Steps: Password (optional) -> Sales Masterclass -> Wallet Connection -> Success
 *
 * @route /special-invite/[code]
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ConnectButton } from 'thirdweb/react';
import { useAccount, client } from '@/lib/thirdweb';
import {
  GraduationCap,
  Lock,
  Wallet,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Loader2,
  Sparkles,
  Gift,
  Shield,
  Users,
  BookOpen,
  Trophy,
  ChevronRight,
  ChevronLeft,
  Check,
  X,
  Play,
  Star,
} from 'lucide-react';

// Steps in the flow
type Step = 'loading' | 'password' | 'education' | 'wallet' | 'success' | 'error';

// Education slide content (simplified from Sales Masterclass)
const EDUCATION_SLIDES = [
  {
    id: 'intro',
    title: 'Welcome to CryptoGift DAO',
    content: 'You have been invited to join a revolutionary decentralized community that combines education, governance, and rewards.',
    icon: Gift,
    color: 'from-purple-500 to-indigo-600',
  },
  {
    id: 'what-is-dao',
    title: 'What is a DAO?',
    content: 'A DAO (Decentralized Autonomous Organization) is a community-led organization with no central authority. Members vote on decisions and share in the rewards.',
    icon: Users,
    color: 'from-blue-500 to-cyan-600',
  },
  {
    id: 'cgc-token',
    title: 'CGC Governance Token',
    content: 'CGC tokens give you voting power in the DAO. Complete tasks, invite friends, and participate to earn more tokens and increase your influence.',
    icon: Star,
    color: 'from-amber-500 to-orange-600',
  },
  {
    id: 'tasks',
    title: 'Earn by Contributing',
    content: 'Complete development tasks, create content, or help with community growth. Every contribution is rewarded with CGC tokens.',
    icon: Trophy,
    color: 'from-green-500 to-emerald-600',
  },
  {
    id: 'security',
    title: 'Security & Control',
    content: 'Your wallet, your keys, your tokens. We never have access to your funds. Everything is transparent and on-chain.',
    icon: Shield,
    color: 'from-red-500 to-pink-600',
  },
  {
    id: 'ready',
    title: 'Ready to Join?',
    content: 'Connect your wallet to complete your membership and start earning CGC tokens right away!',
    icon: Sparkles,
    color: 'from-violet-500 to-purple-600',
  },
];

interface InviteData {
  code: string;
  referrerCode?: string;
  customMessage?: string;
  hasPassword: boolean;
}

export default function SpecialInvitePage() {
  const params = useParams();
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const t = useTranslations('referrals.special');

  const inviteCode = params.code as string;

  // State
  const [step, setStep] = useState<Step>('loading');
  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load invite data
  useEffect(() => {
    async function loadInvite() {
      try {
        const response = await fetch(`/api/referrals/special-invite?code=${inviteCode}`);
        const data = await response.json();

        if (!data.success) {
          setError(data.error || 'Invalid invite link');
          setStep('error');
          return;
        }

        setInviteData(data.invite);
        setStep(data.invite.hasPassword ? 'password' : 'education');
      } catch (err) {
        console.error('Error loading invite:', err);
        setError('Failed to load invite');
        setStep('error');
      }
    }

    if (inviteCode) {
      loadInvite();
    }
  }, [inviteCode]);

  // Handle password verification
  const handlePasswordSubmit = useCallback(async () => {
    if (!password.trim()) {
      setPasswordError('Password is required');
      return;
    }

    setIsProcessing(true);
    setPasswordError(null);

    try {
      const response = await fetch('/api/referrals/special-invite/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: inviteCode, password }),
      });

      const data = await response.json();

      if (!data.success) {
        setPasswordError(data.error || 'Incorrect password');
        return;
      }

      setStep('education');
    } catch (err) {
      setPasswordError('Failed to verify password');
    } finally {
      setIsProcessing(false);
    }
  }, [inviteCode, password]);

  // Handle education completion
  const handleEducationComplete = useCallback(() => {
    setStep('wallet');
  }, []);

  // Handle wallet connection and profile creation
  useEffect(() => {
    if (step === 'wallet' && isConnected && address) {
      completeOnboarding();
    }
  }, [step, isConnected, address]);

  const completeOnboarding = async () => {
    if (!address || !inviteData) return;

    setIsProcessing(true);

    try {
      // Create or update user profile with referrer
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: address.toLowerCase(),
          referred_by_code: inviteData.referrerCode,
          special_invite_code: inviteCode,
          education_completed: true,
          onboarding_completed: true,
        }),
      });

      if (!response.ok) {
        console.error('Failed to create profile');
      }

      // Mark invite as claimed
      await fetch('/api/referrals/special-invite/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: inviteCode,
          claimedBy: address.toLowerCase(),
        }),
      });

      setStep('success');
    } catch (err) {
      console.error('Error completing onboarding:', err);
      // Still show success - profile will be created on first login
      setStep('success');
    } finally {
      setIsProcessing(false);
    }
  };

  // Navigation
  const nextSlide = () => {
    if (currentSlide < EDUCATION_SLIDES.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      handleEducationComplete();
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  // Render steps
  const renderStep = () => {
    switch (step) {
      case 'loading':
        return (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="h-12 w-12 text-amber-500 animate-spin mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading your invitation...</p>
          </div>
        );

      case 'error':
        return (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
              <AlertCircle className="h-12 w-12 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Invalid Invitation
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
              {error || 'This invitation link is invalid or has expired.'}
            </p>
            <Button onClick={() => router.push('/')}>
              Go to Homepage
            </Button>
          </div>
        );

      case 'password':
        return (
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="p-4 rounded-full bg-amber-100 dark:bg-amber-900/30 w-fit mx-auto mb-4">
                <Lock className="h-12 w-12 text-amber-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Password Protected
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                This invitation requires a password to access.
              </p>
            </div>

            {inviteData?.customMessage && (
              <div className="p-4 mb-6 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800">
                <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                  &ldquo;{inviteData.customMessage}&rdquo;
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                  className={passwordError ? 'border-red-500' : ''}
                />
                {passwordError && (
                  <p className="text-sm text-red-500 mt-1">{passwordError}</p>
                )}
              </div>

              <Button
                onClick={handlePasswordSubmit}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <ArrowRight className="h-4 w-4 mr-2" />
                )}
                Continue
              </Button>
            </div>
          </div>
        );

      case 'education':
        const slide = EDUCATION_SLIDES[currentSlide];
        const SlideIcon = slide.icon;
        const progress = ((currentSlide + 1) / EDUCATION_SLIDES.length) * 100;

        return (
          <div className="max-w-2xl mx-auto">
            {/* Progress bar */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
                <span>Sales Masterclass</span>
                <span>{currentSlide + 1} / {EDUCATION_SLIDES.length}</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Slide content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <div className={`p-6 rounded-full bg-gradient-to-r ${slide.color} w-fit mx-auto mb-6 shadow-lg`}>
                  <SlideIcon className="h-16 w-16 text-white" />
                </div>

                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {slide.title}
                </h2>

                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-lg mx-auto mb-8">
                  {slide.content}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={prevSlide}
                disabled={currentSlide === 0}
                className="opacity-0 disabled:opacity-0"
                style={{ opacity: currentSlide > 0 ? 1 : 0 }}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              <div className="flex space-x-2">
                {EDUCATION_SLIDES.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentSlide
                        ? 'bg-amber-500'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                ))}
              </div>

              <Button
                onClick={nextSlide}
                className="bg-gradient-to-r from-amber-500 to-orange-600"
              >
                {currentSlide === EDUCATION_SLIDES.length - 1 ? (
                  <>
                    Connect Wallet
                    <Wallet className="h-4 w-4 ml-2" />
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        );

      case 'wallet':
        return (
          <div className="max-w-md mx-auto text-center">
            <div className="p-4 rounded-full bg-blue-100 dark:bg-blue-900/30 w-fit mx-auto mb-6">
              <Wallet className="h-12 w-12 text-blue-500" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Connect Your Wallet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Connect your wallet to complete your membership and start earning CGC tokens.
            </p>

            <div className="flex justify-center">
              <ConnectButton client={client} />
            </div>

            {isProcessing && (
              <div className="mt-6 flex items-center justify-center text-amber-500">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span>Creating your profile...</span>
              </div>
            )}
          </div>
        );

      case 'success':
        return (
          <div className="max-w-md mx-auto text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="p-4 rounded-full bg-green-100 dark:bg-green-900/30 w-fit mx-auto mb-6"
            >
              <CheckCircle className="h-16 w-16 text-green-500" />
            </motion.div>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome to CryptoGift DAO!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your membership is now active. Start exploring tasks and earning CGC tokens!
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <Trophy className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Browse Tasks</p>
              </div>
              <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                <Users className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Invite Friends</p>
              </div>
            </div>

            <Button
              onClick={() => router.push('/tasks')}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600"
            >
              Start Exploring
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50 dark:from-slate-900 dark:to-amber-950">
      {/* Background effects */}
      <div className="fixed inset-0 opacity-30 dark:opacity-20 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-amber-400 dark:bg-amber-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl animate-pulse" />
        <div className="absolute top-40 right-20 w-72 h-72 bg-orange-400 dark:bg-orange-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl animate-pulse" />
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-purple-400 dark:bg-purple-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl animate-pulse" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-gray-200/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  CryptoGift DAO
                </h1>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Special Invitation
                </span>
              </div>
            </div>

            <Badge variant="secondary" className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
              <Star className="h-3 w-3 mr-1" />
              Premium Invite
            </Badge>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 container mx-auto px-4 py-12">
        <Card className="max-w-3xl mx-auto bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-xl">
          <CardContent className="p-8">
            {renderStep()}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
