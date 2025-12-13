'use client';

/**
 * ============================================================================
 * 🚀 CRYPTOGIFT WALLETS DAO - LANDING PAGE
 * ============================================================================
 *
 * Enterprise-level landing page with sales psychology and stunning visuals.
 * Designed to convert visitors into community members.
 *
 * Features:
 * - Hero section with compelling value proposition
 * - Problem/Solution narrative
 * - How it works (3 simple steps)
 * - Key benefits and features
 * - Live statistics from blockchain
 * - Team section
 * - Strong call-to-action
 *
 * i18n: Full bilingual support (EN/ES)
 * ============================================================================
 */

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
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
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Target,
  Heart,
  Globe,
  Play,
  Star,
  ChevronRight,
  Rocket,
  Award,
  BookOpen
} from 'lucide-react';

// Animation keyframes for floating elements
const floatAnimation = `
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
  }
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.5); }
    50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.8); }
  }
  @keyframes gradient-shift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;

export default function LandingPage() {
  const t = useTranslations('landing');
  const { address, isConnected } = useAccount();
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      <style jsx>{floatAnimation}</style>

      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" style={{ animation: 'float 6s ease-in-out infinite' }} />
        <div className="absolute bottom-40 left-1/4 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl" style={{ animation: 'float 8s ease-in-out infinite 2s' }} />
        <div className="absolute -bottom-20 right-1/3 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse" />
      </div>

      <Navbar />

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <div className={`space-y-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium">{t('hero.badge')}</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                  {t('hero.title1')}
                </span>
                <br />
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {t('hero.title2')}
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-xl lg:text-2xl text-gray-300 leading-relaxed max-w-xl">
                {t('hero.subtitle')}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/tasks"
                  className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105"
                >
                  <Rocket className="w-5 h-5" />
                  {t('hero.cta1')}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/docs"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm rounded-xl font-semibold text-lg border border-white/20 hover:bg-white/20 transition-all hover:scale-105"
                >
                  <BookOpen className="w-5 h-5" />
                  {t('hero.cta2')}
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center gap-6 pt-4">
                <div className="flex items-center gap-2 text-gray-400">
                  <Shield className="w-5 h-5 text-green-400" />
                  <span className="text-sm">{t('hero.trust1')}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Globe className="w-5 h-5 text-blue-400" />
                  <span className="text-sm">{t('hero.trust2')}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <span className="text-sm">{t('hero.trust3')}</span>
                </div>
              </div>
            </div>

            {/* Right: Visual Element */}
            <div className={`relative transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
              <div className="relative mx-auto w-full max-w-lg">
                {/* Main card */}
                <div className="relative z-10 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl" style={{ animation: 'float 6s ease-in-out infinite' }}>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl">
                      <Gift className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{t('hero.card.title')}</h3>
                      <p className="text-gray-400">{t('hero.card.subtitle')}</p>
                    </div>
                  </div>

                  {/* Progress bars */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">{t('hero.card.learn')}</span>
                        <span className="text-blue-400">+200 CGC</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full w-3/4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">{t('hero.card.earn')}</span>
                        <span className="text-green-400">+50 CGC</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full w-1/2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">{t('hero.card.govern')}</span>
                        <span className="text-purple-400">{t('hero.card.active')}</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full w-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating elements */}
                <div className="absolute -top-6 -right-6 p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl rounded-2xl border border-green-500/30" style={{ animation: 'float 4s ease-in-out infinite 1s' }}>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <span className="text-sm font-medium">{t('hero.floating.verified')}</span>
                  </div>
                </div>

                <div className="absolute -bottom-4 -left-4 p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-xl rounded-2xl border border-blue-500/30" style={{ animation: 'float 5s ease-in-out infinite 0.5s' }}>
                  <div className="flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-blue-400" />
                    <span className="text-sm font-medium">{t('hero.floating.gasless')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="relative py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
            {[
              { icon: Users, label: t('stats.community'), value: formatNumber(holdersCount) || '500+', color: 'blue' },
              { icon: GraduationCap, label: t('stats.tasksCompleted'), value: formatNumber(questsCompleted) || '1,200+', color: 'green' },
              { icon: Wallet, label: t('stats.distributed'), value: formatNumber(totalSupply) || '2M CGC', color: 'purple' },
              { icon: Award, label: t('stats.milestones'), value: formatNumber(milestonesReleased) || '25+', color: 'yellow' },
            ].map((stat, i) => (
              <div
                key={i}
                className={`relative group p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-${stat.color}-500/50 transition-all hover:scale-105`}
              >
                <stat.icon className={`w-8 h-8 text-${stat.color}-400 mb-3`} />
                <div className="text-3xl lg:text-4xl font-bold mb-1">{stat.value}</div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEM/SOLUTION SECTION */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              {t('problem.title')}
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              {t('problem.subtitle')}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Problem */}
            <div className="p-8 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-3xl border border-red-500/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-red-500/20 rounded-xl">
                  <Target className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-2xl font-bold text-red-300">{t('problem.problemTitle')}</h3>
              </div>
              <ul className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-1 w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-red-400 text-xs">✕</span>
                    </div>
                    <span className="text-gray-300">{t(`problem.problem${i}`)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Solution */}
            <div className="p-8 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-3xl border border-green-500/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-500/20 rounded-xl">
                  <Sparkles className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-green-300">{t('problem.solutionTitle')}</h3>
              </div>
              <ul className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-1 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-green-400" />
                    </div>
                    <span className="text-gray-300">{t(`problem.solution${i}`)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              {t('howItWorks.title')}
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              {t('howItWorks.subtitle')}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {[
              { step: 1, icon: Wallet, color: 'blue', title: t('howItWorks.step1.title'), desc: t('howItWorks.step1.desc') },
              { step: 2, icon: GraduationCap, color: 'purple', title: t('howItWorks.step2.title'), desc: t('howItWorks.step2.desc') },
              { step: 3, icon: Vote, color: 'green', title: t('howItWorks.step3.title'), desc: t('howItWorks.step3.desc') },
            ].map((item, i) => (
              <div
                key={i}
                className="relative group"
              >
                {/* Connector line */}
                {i < 2 && (
                  <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-white/20 to-transparent z-0" />
                )}

                <div className="relative z-10 p-8 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 hover:border-white/30 transition-all hover:scale-105">
                  {/* Step number */}
                  <div className={`absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-${item.color}-500 to-${item.color}-600 rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg`}>
                    {item.step}
                  </div>

                  <div className={`p-4 bg-${item.color}-500/20 rounded-2xl w-fit mb-6 mt-4`}>
                    <item.icon className={`w-8 h-8 text-${item.color}-400`} />
                  </div>

                  <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                  <p className="text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              {t('features.title')}
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              {t('features.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                className="group p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-white/30 transition-all hover:scale-105 hover:bg-white/10"
              >
                <div className={`p-3 bg-${feature.color}-500/20 rounded-xl w-fit mb-4`}>
                  <feature.icon className={`w-6 h-6 text-${feature.color}-400`} />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TOKEN INFO SECTION */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl border border-white/10 p-8 lg:p-12">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-6">
                  <Wallet className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium">{t('token.badge')}</span>
                </div>
                <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                  {t('token.title')}
                </h2>
                <p className="text-xl text-gray-400 mb-8">
                  {t('token.desc')}
                </p>
                <div className="space-y-4">
                  {[
                    { label: t('token.initial'), value: '2,000,000 CGC' },
                    { label: t('token.max'), value: '22,000,000 CGC' },
                    { label: t('token.emission'), value: t('token.emissionValue') },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <span className="text-gray-400">{item.label}</span>
                      <span className="font-bold text-blue-400">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="aspect-square bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl p-8 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl lg:text-8xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
                      CGC
                    </div>
                    <div className="text-xl text-gray-400">{t('token.governance')}</div>
                    <div className="mt-6 flex items-center justify-center gap-4">
                      <div className="flex items-center gap-2 text-green-400">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="text-sm">{t('token.verified')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-blue-400">
                        <Shield className="w-5 h-5" />
                        <span className="text-sm">{t('token.secure')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-6xl font-bold mb-6">
            {t('cta.title')}
          </h2>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            {t('cta.subtitle')}
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/tasks"
              className="group inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-semibold text-xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105"
            >
              <Rocket className="w-6 h-6" />
              {t('cta.button1')}
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/referrals"
              className="inline-flex items-center gap-2 px-10 py-5 bg-white/10 backdrop-blur-sm rounded-xl font-semibold text-xl border border-white/20 hover:bg-white/20 transition-all hover:scale-105"
            >
              <Users className="w-6 h-6" />
              {t('cta.button2')}
            </Link>
          </div>

          {/* Social proof */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-gray-400">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 border-2 border-slate-900" />
                ))}
              </div>
              <span className="text-sm">{t('cta.joined')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span className="text-sm ml-1">{t('cta.rating')}</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
