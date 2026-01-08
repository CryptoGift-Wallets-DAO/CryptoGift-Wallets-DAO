'use client';

/**
 * EMBEDDED VIDEO DEVICE - Premium iPad/Tablet Style Video Player
 *
 * Gorgeous embedded video component with:
 * - Realistic iPad/tablet frame with bezel
 * - Floating words animation around the device
 * - Device rotation hint animation
 * - Holographic glow effects
 * - Premium glass morphism aesthetics
 *
 * Made by mbxarts.com The Moon in a Box property
 * Co-Author: Godez22
 */

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Play, Smartphone, Maximize2, RotateCcw, X, Volume2, VolumeX } from 'lucide-react';
import { useTranslations } from 'next-intl';

// Lazy load Mux Player for optimization
const MuxPlayer = dynamic(
  () => import('@mux/mux-player-react').then(mod => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="relative aspect-video w-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-black rounded-2xl">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-white/70 text-sm">Cargando...</p>
        </div>
      </div>
    )
  }
);

interface EmbeddedVideoDeviceProps {
  muxPlaybackId: string;
  lessonId: string;
  title?: string;
  description?: string;
  onVideoComplete?: () => void;
  className?: string;
  locale?: 'en' | 'es';
}

// Floating words configuration
const FLOATING_WORDS_ES = [
  { text: 'Web3', delay: 0, position: 'top-left' },
  { text: 'Regalo', delay: 0.5, position: 'top-right' },
  { text: 'Futuro', delay: 1, position: 'bottom-left' },
  { text: 'Confianza', delay: 1.5, position: 'bottom-right' },
  { text: 'DAO', delay: 2, position: 'left' },
  { text: 'Tokens', delay: 2.5, position: 'right' },
];

const FLOATING_WORDS_EN = [
  { text: 'Web3', delay: 0, position: 'top-left' },
  { text: 'Gift', delay: 0.5, position: 'top-right' },
  { text: 'Future', delay: 1, position: 'bottom-left' },
  { text: 'Trust', delay: 1.5, position: 'bottom-right' },
  { text: 'DAO', delay: 2, position: 'left' },
  { text: 'Tokens', delay: 2.5, position: 'right' },
];

// CSS Keyframes for animations
const animationStyles = `
  @keyframes deviceFloat {
    0%, 100% { transform: translateY(0px) rotateX(2deg); }
    50% { transform: translateY(-8px) rotateX(-1deg); }
  }

  @keyframes wordFloat {
    0%, 100% {
      transform: translateY(0px) scale(1);
      opacity: 0.7;
    }
    50% {
      transform: translateY(-12px) scale(1.05);
      opacity: 1;
    }
  }

  @keyframes holographicGlow {
    0% {
      box-shadow: 0 0 30px rgba(139, 92, 246, 0.4),
                  0 0 60px rgba(6, 182, 212, 0.2),
                  inset 0 0 30px rgba(139, 92, 246, 0.1);
    }
    50% {
      box-shadow: 0 0 40px rgba(6, 182, 212, 0.5),
                  0 0 80px rgba(139, 92, 246, 0.3),
                  inset 0 0 40px rgba(6, 182, 212, 0.1);
    }
    100% {
      box-shadow: 0 0 30px rgba(139, 92, 246, 0.4),
                  0 0 60px rgba(6, 182, 212, 0.2),
                  inset 0 0 30px rgba(139, 92, 246, 0.1);
    }
  }

  @keyframes screenGlare {
    0% { transform: translateX(-150%) rotate(45deg); opacity: 0; }
    50% { opacity: 0.3; }
    100% { transform: translateX(150%) rotate(45deg); opacity: 0; }
  }

  @keyframes rotateHint {
    0%, 40%, 100% { transform: rotate(0deg); }
    50%, 90% { transform: rotate(90deg); }
  }

  @keyframes pulseRing {
    0% { transform: scale(1); opacity: 0.5; }
    100% { transform: scale(1.4); opacity: 0; }
  }
`;

export function EmbeddedVideoDevice({
  muxPlaybackId,
  lessonId,
  title,
  description,
  onVideoComplete,
  className = '',
  locale
}: EmbeddedVideoDeviceProps) {
  const t = useTranslations('video');
  const [isPlaying, setIsPlaying] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showRotateHint, setShowRotateHint] = useState(true);
  const [currentLocale, setCurrentLocale] = useState<'es' | 'en'>(locale || 'es');

  // Detect locale from cookie
  useEffect(() => {
    if (typeof document !== 'undefined' && !locale) {
      const cookies = document.cookie.split(';');
      const localeCookie = cookies.find(c => c.trim().startsWith('NEXT_LOCALE='));
      if (localeCookie) {
        const detectedLocale = localeCookie.split('=')[1] as 'es' | 'en';
        if (detectedLocale === 'en' || detectedLocale === 'es') {
          setCurrentLocale(detectedLocale);
        }
      }
    }
  }, [locale]);

  // Hide rotate hint after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowRotateHint(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const floatingWords = currentLocale === 'en' ? FLOATING_WORDS_EN : FLOATING_WORDS_ES;

  const handlePlayClick = useCallback(() => {
    setShowVideo(true);
    setIsPlaying(true);
  }, []);

  const handleVideoEnd = useCallback(() => {
    console.log('[EmbeddedVideoDevice] Video completed');
    localStorage.setItem(`video_seen:${lessonId}`, 'completed');
    onVideoComplete?.();
  }, [lessonId, onVideoComplete]);

  const getWordPosition = (position: string) => {
    switch (position) {
      case 'top-left': return 'top-0 left-0 -translate-x-1/2 -translate-y-full';
      case 'top-right': return 'top-0 right-0 translate-x-1/2 -translate-y-full';
      case 'bottom-left': return 'bottom-0 left-0 -translate-x-1/2 translate-y-full';
      case 'bottom-right': return 'bottom-0 right-0 translate-x-1/2 translate-y-full';
      case 'left': return 'top-1/2 left-0 -translate-x-full -translate-y-1/2';
      case 'right': return 'top-1/2 right-0 translate-x-full -translate-y-1/2';
      default: return '';
    }
  };

  // Get translated text with fallback
  const getText = (key: string, fallbackEs: string, fallbackEn: string) => {
    try {
      return t(key);
    } catch {
      return currentLocale === 'en' ? fallbackEn : fallbackEs;
    }
  };

  return (
    <>
      <style jsx global>{animationStyles}</style>

      <div className={`relative ${className}`}>
        {/* Floating Words Around Device */}
        <div className="absolute inset-0 pointer-events-none z-10">
          {floatingWords.map((word, index) => (
            <motion.div
              key={word.text}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: word.delay, duration: 0.5 }}
              className={`absolute ${getWordPosition(word.position)} px-3 py-1.5 hidden sm:block`}
              style={{
                animation: `wordFloat 3s ease-in-out ${word.delay}s infinite`
              }}
            >
              <span className="text-sm font-bold bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent whitespace-nowrap drop-shadow-lg">
                {word.text}
              </span>
            </motion.div>
          ))}
        </div>

        {/* iPad/Tablet Device Frame */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative mx-auto max-w-2xl"
          style={{
            animation: 'deviceFloat 6s ease-in-out infinite',
            perspective: '1000px'
          }}
        >
          {/* Device Outer Frame (Bezel) */}
          <div
            className="relative bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 rounded-[2rem] p-3 sm:p-4"
            style={{
              animation: 'holographicGlow 4s ease-in-out infinite',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 100px rgba(139, 92, 246, 0.2)'
            }}
          >
            {/* Metallic Edge Highlight */}
            <div className="absolute inset-0 rounded-[2rem] border border-white/10 pointer-events-none" />
            <div className="absolute inset-[1px] rounded-[2rem] border border-black/50 pointer-events-none" />

            {/* Camera Notch (Top) */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-slate-700 border border-slate-600" />
              <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
            </div>

            {/* Screen Container */}
            <div className="relative aspect-video bg-black rounded-2xl overflow-hidden">
              {/* Screen Glare Effect */}
              <div
                className="absolute inset-0 pointer-events-none z-20"
                style={{
                  background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 45%, transparent 50%)',
                  animation: 'screenGlare 8s ease-in-out infinite'
                }}
              />

              {/* Video or Play Overlay */}
              <AnimatePresence mode="wait">
                {!showVideo ? (
                  <motion.div
                    key="poster"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-gradient-to-br from-purple-900/90 via-slate-900 to-cyan-900/90 flex items-center justify-center cursor-pointer group"
                    onClick={handlePlayClick}
                  >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute inset-0" style={{
                        backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                        backgroundSize: '32px 32px'
                      }} />
                    </div>

                    {/* Play Button */}
                    <div className="relative z-10 text-center">
                      {/* Pulse Rings */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-24 h-24 rounded-full border-2 border-purple-400/50" style={{ animation: 'pulseRing 2s ease-out infinite' }} />
                        <div className="absolute w-24 h-24 rounded-full border-2 border-cyan-400/50" style={{ animation: 'pulseRing 2s ease-out 0.5s infinite' }} />
                      </div>

                      {/* Play Icon */}
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-purple-500/50 group-hover:shadow-purple-500/70 transition-shadow"
                      >
                        <Play className="w-8 h-8 sm:w-10 sm:h-10 text-white ml-1" fill="white" />
                      </motion.div>

                      {/* Title Below */}
                      {title && (
                        <motion.p
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="mt-4 text-white font-bold text-lg sm:text-xl"
                        >
                          {title}
                        </motion.p>
                      )}

                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-2 text-white/70 text-sm"
                      >
                        {getText('tapToPlay', 'Toca para reproducir', 'Tap to play')}
                      </motion.p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="video"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0"
                  >
                    <MuxPlayer
                      playbackId={muxPlaybackId}
                      streamType="on-demand"
                      autoPlay={true}
                      muted={isMuted}
                      playsInline
                      onEnded={handleVideoEnd}
                      style={{
                        width: '100%',
                        height: '100%',
                        '--media-object-fit': 'cover'
                      } as React.CSSProperties}
                      metadata={{
                        video_title: title || 'CryptoGift Video',
                        video_series: 'CryptoGift Educational'
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Home Button / Touch Bar (Bottom) */}
            <div className="flex justify-center mt-2">
              <div className="w-24 h-1 rounded-full bg-slate-700" />
            </div>
          </div>
        </motion.div>

        {/* Rotate/Expand Hint - Below Device */}
        <AnimatePresence>
          {showRotateHint && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-center gap-3 mt-4 text-sm text-gray-500 dark:text-gray-400"
            >
              {/* Animated Phone Icon */}
              <motion.div
                style={{ animation: 'rotateHint 3s ease-in-out infinite' }}
              >
                <Smartphone className="w-5 h-5 text-purple-500" />
              </motion.div>

              <span>
                {getText('rotateHintShort',
                  'Gira tu dispositivo para mejor experiencia',
                  'Rotate your device for better experience'
                )}
              </span>

              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Maximize2 className="w-4 h-4 text-cyan-500" />
              </motion.div>

              {/* Dismiss button */}
              <button
                onClick={() => setShowRotateHint(false)}
                className="ml-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-3 h-3 text-gray-400" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Description Below */}
        {description && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center text-sm text-gray-600 dark:text-gray-400 mt-3 max-w-md mx-auto"
          >
            {description}
          </motion.p>
        )}
      </div>
    </>
  );
}

export default EmbeddedVideoDevice;
