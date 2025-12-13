'use client';

/**
 * ============================================================================
 * 🚀 CRYPTOGIFT WALLETS DAO - LANDING PAGE
 * ============================================================================
 *
 * Enterprise-level landing page with sales psychology and stunning visuals.
 * Uses theme-gradient-bg for consistency with rest of the site.
 *
 * i18n: Full bilingual support (EN/ES)
 * ============================================================================
 */

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { VideoCarousel } from '@/components/landing/VideoCarousel';
import { useDashboardStats } from '@/lib/web3/hooks';
import { useAccount } from '@/lib/thirdweb';
import {
  Wallet,
  Gift,
  GraduationCap,
  Users,
  Vote,
  Zap,
  Shield,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Target,
  Globe,
  Star,
  Rocket,
  Award,
  BookOpen
} from 'lucide-react';

// Permanent invite link for new users
const INVITE_LINK = '/permanent-invite/PI-MJ3CJ0IF-D313F4D99755F78F';

// Animations: float + holographic shimmer
const animations = `
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }

  @keyframes holographic {
    0% {
      background-position: 0% 50%;
      filter: hue-rotate(0deg);
    }
    50% {
      background-position: 100% 50%;
      filter: hue-rotate(30deg);
    }
    100% {
      background-position: 0% 50%;
      filter: hue-rotate(0deg);
    }
  }

  @keyframes shimmer {
    0% { transform: translateX(-100%) rotate(45deg); }
    100% { transform: translateX(100%) rotate(45deg); }
  }

  @keyframes pulse-glow {
    0%, 100% {
      box-shadow: 0 0 20px rgba(59, 130, 246, 0.5),
                  0 0 40px rgba(147, 51, 234, 0.3),
                  0 0 60px rgba(59, 130, 246, 0.2);
    }
    50% {
      box-shadow: 0 0 30px rgba(147, 51, 234, 0.6),
                  0 0 50px rgba(59, 130, 246, 0.4),
                  0 0 80px rgba(147, 51, 234, 0.3);
    }
  }
`;

export default function LandingPage() {
  const t = useTranslations('landing');
  const { totalSupply, holdersCount, questsCompleted, milestonesReleased } = useDashboardStats();

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Format large numbers
  const formatNumber = (num: string | number | undefined) => {
    if (!num) return '0';
    const n = typeof num === 'string' ? parseFloat(num) : num;
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
    return n.toLocaleString();
  };

  return (
    <div className="min-h-screen theme-gradient-bg text-gray-900 dark:text-white overflow-hidden">
      <style jsx>{animations}</style>

      {/* Subtle animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-48 h-48 bg-cyan-500/10 dark:bg-cyan-500/20 rounded-full blur-3xl" />
        <div className="absolute top-60 right-20 w-64 h-64 bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-3xl" style={{ animation: 'float 8s ease-in-out infinite' }} />
        <div className="absolute bottom-40 left-1/4 w-40 h-40 bg-blue-500/10 dark:bg-blue-500/15 rounded-full blur-3xl" style={{ animation: 'float 10s ease-in-out infinite 2s' }} />
      </div>

      <Navbar />

      {/* HERO SECTION - Closer to navbar */}
      <section className="relative pt-8 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left: Text Content */}
            <div className={`space-y-5 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/50 dark:bg-white/10 backdrop-blur-sm rounded-full border border-gray-200 dark:border-white/20">
                <Sparkles className="w-3.5 h-3.5 text-yellow-500 dark:text-yellow-400" />
                <span className="text-xs font-medium text-gray-700 dark:text-white">{t('hero.badge')}</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                <span className="text-gray-900 dark:text-white">
                  {t('hero.title1')}
                </span>
                <br />
                <span className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                  {t('hero.title2')}
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-base lg:text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-lg">
                {t('hero.subtitle')}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  href={INVITE_LINK}
                  className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-semibold text-white text-sm hover:from-blue-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg hover:scale-105"
                >
                  <Rocket className="w-4 h-4" />
                  {t('hero.cta1')}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/docs"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/70 dark:bg-white/10 backdrop-blur-sm rounded-lg font-semibold text-sm text-gray-700 dark:text-white border border-gray-200 dark:border-white/20 hover:bg-white dark:hover:bg-white/20 transition-all hover:scale-105"
                >
                  <BookOpen className="w-4 h-4" />
                  {t('hero.cta2')}
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span className="text-xs">{t('hero.trust1')}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                  <Globe className="w-4 h-4 text-blue-500" />
                  <span className="text-xs">{t('hero.trust2')}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs">{t('hero.trust3')}</span>
                </div>
              </div>
            </div>

            {/* Right: Video Carousel */}
            <div className={`relative transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
              <VideoCarousel />
            </div>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="relative py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {[
              { icon: Users, label: t('stats.community'), value: '85.7%', color: 'blue' },
              { icon: GraduationCap, label: t('stats.tasksCompleted'), value: '674+', color: 'green' },
              { icon: Wallet, label: t('stats.distributed'), value: '2M CGC', color: 'purple' },
              { icon: Award, label: t('stats.milestones'), value: '104', color: 'yellow' },
            ].map((stat, i) => (
              <div
                key={i}
                className="p-4 rounded-xl glass-crystal hover:scale-105 transition-all"
              >
                <stat.icon className={`w-6 h-6 text-${stat.color}-500 mb-2`} />
                <div className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-0.5">{stat.value}</div>
                <div className="text-gray-500 dark:text-gray-400 text-xs">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEM/SOLUTION SECTION */}
      <section className="relative py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('problem.title')}
            </h2>
            <p className="text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t('problem.subtitle')}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Problem */}
            <div className="p-6 bg-red-50 dark:bg-red-500/10 rounded-2xl border border-red-200 dark:border-red-500/20">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-red-500/20 rounded-lg">
                  <Target className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-red-600 dark:text-red-400">{t('problem.problemTitle')}</h3>
              </div>
              <ul className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <li key={i} className="flex items-start gap-2">
                    <div className="mt-0.5 w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-red-500 text-xs">✕</span>
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{t(`problem.problem${i}`)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Solution */}
            <div className="p-6 bg-green-50 dark:bg-green-500/10 rounded-2xl border border-green-200 dark:border-green-500/20">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-green-500/20 rounded-lg">
                  <Sparkles className="w-5 h-5 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-green-600 dark:text-green-400">{t('problem.solutionTitle')}</h3>
              </div>
              <ul className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <li key={i} className="flex items-start gap-2">
                    <div className="mt-0.5 w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-2.5 h-2.5 text-green-500" />
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{t(`problem.solution${i}`)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="relative py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('howItWorks.title')}
            </h2>
            <p className="text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t('howItWorks.subtitle')}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {[
              { step: 1, icon: Wallet, color: 'blue', title: t('howItWorks.step1.title'), desc: t('howItWorks.step1.desc') },
              { step: 2, icon: GraduationCap, color: 'purple', title: t('howItWorks.step2.title'), desc: t('howItWorks.step2.desc') },
              { step: 3, icon: Vote, color: 'green', title: t('howItWorks.step3.title'), desc: t('howItWorks.step3.desc') },
            ].map((item, i) => (
              <div key={i} className="relative group">
                {/* Connector line */}
                {i < 2 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-gray-300 dark:from-white/20 to-transparent z-0" />
                )}

                <div className="relative z-10 p-6 rounded-2xl glass-crystal hover:scale-[1.02] transition-all">
                  {/* Step number - Glass effect badge */}
                  <div
                    className="absolute -top-3 -left-3 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-lg glass-crystal-badge"
                    style={{
                      boxShadow: `0 4px 15px ${item.color === 'blue' ? 'rgba(59, 130, 246, 0.5)' : item.color === 'purple' ? 'rgba(139, 92, 246, 0.5)' : 'rgba(34, 197, 94, 0.5)'}`,
                    }}
                  >
                    <span className={`bg-gradient-to-br ${item.color === 'blue' ? 'from-blue-400 to-blue-600' : item.color === 'purple' ? 'from-purple-400 to-purple-600' : 'from-green-400 to-green-600'} bg-clip-text text-transparent font-bold`}>
                      {item.step}
                    </span>
                  </div>

                  <div className={`p-3 bg-${item.color}-500/10 dark:bg-${item.color}-500/20 rounded-xl w-fit mb-4 mt-2`}>
                    <item.icon className={`w-6 h-6 text-${item.color}-500`} />
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="relative py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('features.title')}
            </h2>
            <p className="text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t('features.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Gift, title: t('features.nftWallet.title'), desc: t('features.nftWallet.desc'), color: 'purple' },
              { icon: Zap, title: t('features.gasless.title'), desc: t('features.gasless.desc'), color: 'yellow' },
              { icon: GraduationCap, title: t('features.learn.title'), desc: t('features.learn.desc'), color: 'blue' },
              { icon: Users, title: t('features.referrals.title'), desc: t('features.referrals.desc'), color: 'green' },
              { icon: Vote, title: t('features.governance.title'), desc: t('features.governance.desc'), color: 'pink' },
              { icon: Shield, title: t('features.security.title'), desc: t('features.security.desc'), color: 'cyan' },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-5 rounded-xl glass-crystal hover:scale-105 transition-all"
              >
                <div className={`p-2 bg-${feature.color}-500/10 dark:bg-${feature.color}-500/20 rounded-lg w-fit mb-3`}>
                  <feature.icon className={`w-5 h-5 text-${feature.color}-500`} />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">{feature.title}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TOKEN INFO SECTION */}
      <section className="relative py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-2xl p-6 lg:p-8 glass-crystal">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 rounded-full mb-4">
                  <Wallet className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400">{t('token.badge')}</span>
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  {t('token.title')}
                </h2>
                <p className="text-base text-gray-600 dark:text-gray-400 mb-6">
                  {t('token.desc')}
                </p>
                <div className="space-y-3">
                  {[
                    { label: t('token.initial'), value: '2,000,000 CGC' },
                    { label: t('token.max'), value: '22,000,000 CGC' },
                    { label: t('token.emission'), value: t('token.emissionValue') },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-100 dark:bg-white/5 rounded-lg">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="aspect-square max-w-xs mx-auto flex items-center justify-center">
                  {/* Holographic token display */}
                  <div className="relative">
                    {/* Outer glow ring */}
                    <div
                      className="absolute -inset-6 rounded-full opacity-60"
                      style={{
                        background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899, #3b82f6)',
                        backgroundSize: '300% 100%',
                        animation: 'holographic 4s ease infinite, pulse-glow 3s ease-in-out infinite',
                        filter: 'blur(25px)',
                      }}
                    />

                    {/* Glass CIRCLE with holographic border */}
                    <div
                      className="relative w-44 h-44 lg:w-52 lg:h-52 rounded-full p-1.5"
                      style={{
                        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899, #06b6d4, #3b82f6)',
                        backgroundSize: '400% 400%',
                        animation: 'holographic 6s ease infinite',
                      }}
                    >
                      {/* Inner GLASS CIRCLE - transparent with blur */}
                      <div
                        className="w-full h-full rounded-full flex items-center justify-center overflow-hidden relative p-1"
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          backdropFilter: 'blur(20px)',
                          WebkitBackdropFilter: 'blur(20px)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                        }}
                      >
                        {/* Shimmer effect */}
                        <div
                          className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
                          style={{ animation: 'shimmer 3s infinite' }}
                        />

                        {/* CGC Logo - MAXIMUM SIZE, minimal border */}
                        <img
                          src="/cgc-logo-512x512.png"
                          alt="CGC Token"
                          className="relative z-10 w-[95%] h-[95%] object-contain"
                          style={{ filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.8))' }}
                        />
                      </div>
                    </div>

                    {/* Floating particles */}
                    <div className="absolute -top-3 -right-3 w-4 h-4 rounded-full bg-blue-400/80 backdrop-blur-sm" style={{ animation: 'float 2s ease-in-out infinite' }} />
                    <div className="absolute -bottom-2 -left-4 w-3 h-3 rounded-full bg-purple-400/80 backdrop-blur-sm" style={{ animation: 'float 2.5s ease-in-out infinite 0.5s' }} />
                    <div className="absolute top-1/2 -right-5 w-3 h-3 rounded-full bg-pink-400/80 backdrop-blur-sm" style={{ animation: 'float 3s ease-in-out infinite 1s' }} />
                  </div>
                </div>

                {/* Token info below - VERY CLOSE to circle */}
                <div className="text-center mt-1">
                  <div className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent mb-1">
                    CGC Token
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">{t('token.governance')}</div>
                  <div className="flex items-center justify-center gap-4">
                    <a
                      href="https://basescan.org/address/0x5e3a61b550328f3D8C44f60b3e10a49D3d806175#code"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-crystal hover:scale-105 transition-transform cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-xs font-medium text-green-600 dark:text-green-400">{t('token.verified')}</span>
                    </a>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-crystal">
                      <Shield className="w-4 h-4 text-blue-500" />
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400">{t('token.secure')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="relative py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('cta.title')}
          </h2>
          <p className="text-base text-gray-600 dark:text-gray-400 mb-8 max-w-xl mx-auto">
            {t('cta.subtitle')}
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href={INVITE_LINK}
              className="group inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-semibold text-white hover:from-blue-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg hover:scale-105"
            >
              <Rocket className="w-5 h-5" />
              {t('cta.button1')}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/referrals"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white/70 dark:bg-white/10 backdrop-blur-sm rounded-lg font-semibold text-gray-700 dark:text-white border border-gray-200 dark:border-white/20 hover:bg-white dark:hover:bg-white/20 transition-all hover:scale-105"
            >
              <Users className="w-5 h-5" />
              {t('cta.button2')}
            </Link>
          </div>

          {/* Social proof */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1.5">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 border-2 border-white dark:border-slate-900" />
                ))}
              </div>
              <span className="text-xs">{t('cta.joined')}</span>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              ))}
              <span className="text-xs ml-1">{t('cta.rating')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* TEAM SECTION */}
      <section className="relative py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-2xl p-6 lg:p-8 glass-crystal border-l-4 border-l-purple-500">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 rounded-full mb-4">
                <Users className="w-3.5 h-3.5 text-purple-500" />
                <span className="text-xs font-medium text-purple-600 dark:text-purple-400">{t('team.badge')}</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {t('team.title')}
              </h2>
              <p className="text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                {t('team.subtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Rafael Gonzalez */}
              <div className="text-center p-4 rounded-xl glass-crystal">
                <div className="w-24 h-24 mx-auto mb-3 rounded-xl overflow-hidden border-2 border-purple-300 dark:border-purple-700">
                  <img
                    src="/team/rafael-gonzalez.jpg"
                    alt="Rafael Gonzalez"
                    className="object-cover w-full h-full"
                  />
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white">Rafael Gonzalez</h4>
                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-2">
                  Founder & Product / Engineering Lead
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  Web3 dev, youth educator, built CryptoGift Wallets end-to-end on Base.
                </p>
                <a
                  href="http://www.linkedin.com/in/rafael-gonzalez-cgc-mbxarts"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <span>LinkedIn</span>
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>

              {/* Roberto Legrá */}
              <div className="text-center p-4 rounded-xl glass-crystal">
                <div className="w-24 h-24 mx-auto mb-3 rounded-xl overflow-hidden border-2 border-purple-300 dark:border-purple-700">
                  <img
                    src="/team/roberto-legra.jpg"
                    alt="Roberto Legrá"
                    className="object-cover w-full h-full"
                  />
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white">Roberto Legrá</h4>
                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-2">
                  Head of Community & Growth / Marketing Advisor
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  6 years Community strategy designer & Crypto community builder. Management of moderators, ambassadors, and content creators.
                </p>
              </div>

              {/* Leodanni Avila */}
              <div className="text-center p-4 rounded-xl glass-crystal">
                <div className="w-24 h-24 mx-auto mb-3 rounded-xl overflow-hidden border-2 border-purple-300 dark:border-purple-700">
                  <img
                    src="/team/leodanni-avila.jpg"
                    alt="Leodanni Avila"
                    className="object-cover w-full h-full"
                  />
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white">Leodanni Avila</h4>
                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-2">
                  Business Development & Operations / Marketing Advisor
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  3+ years in sales & digital marketing; Experienced Head of Strategy & Business Operations. 5+ years in Web3.
                </p>
                <a
                  href="http://www.linkedin.com/in/leodanni-avila-dev-mbxarts"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <span>LinkedIn</span>
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Contact Email */}
            <div className="mt-6 p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                <span className="text-sm font-medium text-purple-600 dark:text-purple-400">Official Contact:</span>
                <a
                  href="mailto:admin@mbxarts.com"
                  className="text-sm text-purple-700 dark:text-purple-300 hover:underline font-mono"
                >
                  admin@mbxarts.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
