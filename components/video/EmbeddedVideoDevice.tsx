'use client';

/**
 * EMBEDDED VIDEO DEVICE - Premium 3D Video Player
 *
 * Features:
 * - 3D depth effect - video appears to come out of the screen
 * - Auto-play when >50% visible with 15% volume
 * - Picture-in-Picture when <30% visible while playing
 * - Exit PiP when >50% visible again
 * - Glassmorphism badges below video
 * - Smooth animations and premium aesthetics
 *
 * Made by mbxarts.com The Moon in a Box property
 * Co-Author: Godez22
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Play, Smartphone, Maximize2, Volume2, VolumeX } from 'lucide-react';
import { useTranslations } from 'next-intl';

// Lazy load Mux Player for optimization
const MuxPlayer = dynamic(
  () => import('@mux/mux-player-react').then(mod => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="relative aspect-video w-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-black rounded-3xl">
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


// CSS Keyframes for premium 3D animations
const animationStyles = `
  @keyframes video3DFloat {
    0%, 100% {
      transform: perspective(1000px) rotateX(2deg) translateY(0px) translateZ(0px);
    }
    50% {
      transform: perspective(1000px) rotateX(1deg) translateY(-8px) translateZ(10px);
    }
  }

  @keyframes videoGlow {
    0%, 100% {
      box-shadow:
        0 25px 50px -12px rgba(0, 0, 0, 0.35),
        0 0 0 1px rgba(255, 255, 255, 0.1),
        0 0 60px -15px rgba(139, 92, 246, 0.3);
    }
    50% {
      box-shadow:
        0 30px 60px -15px rgba(0, 0, 0, 0.4),
        0 0 0 1px rgba(255, 255, 255, 0.15),
        0 0 80px -10px rgba(139, 92, 246, 0.4);
    }
  }

  @keyframes pulseRing {
    0% { transform: scale(1); opacity: 0.6; }
    100% { transform: scale(1.5); opacity: 0; }
  }

  @keyframes rotateHint {
    0%, 40%, 100% { transform: rotate(0deg); }
    50%, 90% { transform: rotate(90deg); }
  }

  @keyframes badgeFloat {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-4px); }
  }
`;

// Initial low volume for auto-play (0.0 to 1.0)
const AUTO_PLAY_VOLUME = 0.15;

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
  const [showVideo, setShowVideo] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(AUTO_PLAY_VOLUME);
  const [isInPiP, setIsInPiP] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [currentLocale, setCurrentLocale] = useState<'es' | 'en'>(locale || 'es');

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const muxPlayerRef = useRef<any>(null);
  const hasAutoPlayed = useRef(false);

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

  // Get video element from MuxPlayer
  const getVideoElement = useCallback((): HTMLVideoElement | null => {
    if (videoRef.current) return videoRef.current;

    if (muxPlayerRef.current) {
      // MuxPlayer stores the video element internally
      const muxElement = muxPlayerRef.current;
      if (muxElement?.media?.nativeEl) {
        videoRef.current = muxElement.media.nativeEl;
        return videoRef.current;
      }
      // Fallback: try to find video element in shadow DOM or children
      const videoEl = muxElement?.querySelector?.('video') ||
                      muxElement?.shadowRoot?.querySelector?.('video');
      if (videoEl) {
        videoRef.current = videoEl;
        return videoRef.current;
      }
    }
    return null;
  }, []);

  // Enter Picture-in-Picture mode
  const enterPiP = useCallback(async () => {
    const video = getVideoElement();
    if (!video || isInPiP) return;

    try {
      if (document.pictureInPictureEnabled && !document.pictureInPictureElement) {
        await video.requestPictureInPicture();
        setIsInPiP(true);
        console.log('[EmbeddedVideoDevice] Entered PiP mode');
      }
    } catch (err) {
      console.log('[EmbeddedVideoDevice] PiP not available:', err);
    }
  }, [getVideoElement, isInPiP]);

  // Exit Picture-in-Picture mode
  const exitPiP = useCallback(async () => {
    if (!isInPiP) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsInPiP(false);
        console.log('[EmbeddedVideoDevice] Exited PiP mode');
      }
    } catch (err) {
      console.log('[EmbeddedVideoDevice] Error exiting PiP:', err);
    }
  }, [isInPiP]);

  // Handle PiP events
  useEffect(() => {
    const handlePiPEnter = () => setIsInPiP(true);
    const handlePiPLeave = () => setIsInPiP(false);

    const video = getVideoElement();
    if (video) {
      video.addEventListener('enterpictureinpicture', handlePiPEnter);
      video.addEventListener('leavepictureinpicture', handlePiPLeave);

      return () => {
        video.removeEventListener('enterpictureinpicture', handlePiPEnter);
        video.removeEventListener('leavepictureinpicture', handlePiPLeave);
      };
    }
  }, [getVideoElement, showVideo]);

  // IntersectionObserver for auto-play and PiP
  useEffect(() => {
    if (!showVideo || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const visibilityRatio = entry.intersectionRatio;
          const video = getVideoElement();

          // Auto-play when >50% visible
          if (visibilityRatio > 0.5 && !hasAutoPlayed.current && video) {
            if (video.paused) {
              video.volume = AUTO_PLAY_VOLUME;
              video.muted = false;
              video.play().then(() => {
                hasAutoPlayed.current = true;
                setIsPlaying(true);
                setVolume(AUTO_PLAY_VOLUME);
                console.log('[EmbeddedVideoDevice] Auto-playing with volume:', AUTO_PLAY_VOLUME);
              }).catch(err => {
                // Auto-play blocked by browser, try muted as fallback
                console.log('[EmbeddedVideoDevice] Auto-play blocked, trying muted:', err);
                video.muted = true;
                setIsMuted(true);
                video.play().then(() => {
                  hasAutoPlayed.current = true;
                  setIsPlaying(true);
                }).catch(e => console.log('[EmbeddedVideoDevice] Muted auto-play also blocked:', e));
              });
            }
          }

          // Enter PiP when <30% visible and video is playing (no user interaction required)
          if (visibilityRatio < 0.3 && isPlaying && !isInPiP) {
            enterPiP();
          }

          // Exit PiP when >50% visible again
          if (visibilityRatio > 0.5 && isInPiP) {
            exitPiP();
          }
        });
      },
      {
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
        rootMargin: '0px'
      }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [showVideo, isPlaying, isInPiP, getVideoElement, enterPiP, exitPiP]);

  const handlePlayClick = useCallback(() => {
    setShowVideo(true);
    setHasUserInteracted(true);

    // Small delay to ensure MuxPlayer is mounted
    setTimeout(() => {
      const video = getVideoElement();
      if (video) {
        video.volume = AUTO_PLAY_VOLUME;
        video.muted = false;
        video.play().then(() => {
          setIsPlaying(true);
          hasAutoPlayed.current = true;
        }).catch(console.error);
      }
    }, 500);
  }, [getVideoElement]);

  const handleVideoEnd = useCallback(() => {
    console.log('[EmbeddedVideoDevice] Video completed');
    localStorage.setItem(`video_seen:${lessonId}`, 'completed');
    setIsPlaying(false);
    exitPiP();
    onVideoComplete?.();
  }, [lessonId, onVideoComplete, exitPiP]);

  const toggleMute = useCallback(() => {
    const video = getVideoElement();
    if (video) {
      video.muted = !video.muted;
      setIsMuted(video.muted);
      if (!video.muted) {
        video.volume = volume;
      }
    }
  }, [getVideoElement, volume]);

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

      {/* Main container */}
      <div ref={containerRef} className={`relative ${className}`}>
        {/* 3D Video Container - Appears to come out of the screen */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative mx-auto max-w-2xl"
          style={{
            perspective: '1000px',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Video Frame - 3D depth effect with premium shadow */}
          <div
            className="relative rounded-3xl overflow-hidden"
            style={{
              transform: 'perspective(1000px) rotateX(2deg)',
              transformOrigin: 'center bottom',
              boxShadow: `
                0 25px 50px -12px rgba(0, 0, 0, 0.4),
                0 0 0 1px rgba(255, 255, 255, 0.05),
                0 0 60px -15px rgba(139, 92, 246, 0.25),
                inset 0 1px 0 rgba(255, 255, 255, 0.1)
              `,
              animation: showVideo ? 'none' : 'video3DFloat 6s ease-in-out infinite, videoGlow 4s ease-in-out infinite',
            }}
          >
            {/* Aspect ratio container */}
            <div className="relative aspect-video bg-black">
              {/* Video or Play Overlay */}
              <AnimatePresence mode="wait">
                {!showVideo ? (
                  <motion.div
                    key="poster"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-gradient-to-br from-purple-900/80 via-slate-900 to-cyan-900/80 flex items-center justify-center cursor-pointer group"
                    onClick={handlePlayClick}
                  >
                    {/* Subtle background pattern */}
                    <div className="absolute inset-0 opacity-5">
                      <div className="absolute inset-0" style={{
                        backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                        backgroundSize: '24px 24px'
                      }} />
                    </div>

                    {/* Play Button */}
                    <div className="relative z-10 text-center">
                      {/* Pulse Rings */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 rounded-full border-2 border-purple-400/40" style={{ animation: 'pulseRing 2s ease-out infinite' }} />
                        <div className="absolute w-20 h-20 rounded-full border-2 border-cyan-400/40" style={{ animation: 'pulseRing 2s ease-out 0.5s infinite' }} />
                      </div>

                      {/* Play Icon */}
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-purple-500/40 group-hover:shadow-purple-500/60 transition-shadow"
                      >
                        <Play className="w-7 h-7 sm:w-9 sm:h-9 text-white ml-1" fill="white" />
                      </motion.div>

                      {/* Title Below Play */}
                      {title && (
                        <motion.p
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="mt-4 text-white font-bold text-base sm:text-lg"
                        >
                          {title}
                        </motion.p>
                      )}

                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="mt-2 text-white/60 text-xs sm:text-sm"
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
                      ref={muxPlayerRef}
                      playbackId={muxPlaybackId}
                      streamType="on-demand"
                      autoPlay={false}
                      muted={isMuted}
                      playsInline
                      onEnded={handleVideoEnd}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      style={{
                        width: '100%',
                        height: '100%',
                        position: 'absolute',
                        top: 0,
                        left: 0
                      }}
                      metadata={{
                        video_title: title || 'CryptoGift Video',
                        video_series: 'CryptoGift Educational'
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Volume control - Always visible when video is playing */}
          {showVideo && isPlaying && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute top-3 right-3 z-30"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setHasUserInteracted(true);
                  toggleMute();
                }}
                className="p-2.5 rounded-full glass-crystal text-white hover:scale-110 transition-all shadow-lg"
                title={isMuted ? 'Activar sonido' : 'Silenciar'}
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* Rotate Device Hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-500 dark:text-gray-400"
        >
          <motion.div style={{ animation: 'rotateHint 3s ease-in-out infinite' }}>
            <Smartphone className="w-4 h-4 text-purple-400" />
          </motion.div>
          <span>{getText('rotateHintShort', 'Gira tu dispositivo para mejor experiencia', 'Rotate your device for better experience')}</span>
          <Maximize2 className="w-3 h-3 text-cyan-400" />
        </motion.div>


        {/* Description Below */}
        {description && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4 max-w-md mx-auto"
          >
            {description}
          </motion.p>
        )}
      </div>
    </>
  );
}

export default EmbeddedVideoDevice;
