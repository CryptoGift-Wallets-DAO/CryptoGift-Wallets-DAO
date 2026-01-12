'use client';

/**
 * EMBEDDED VIDEO DEVICE - Premium Video Player with Sticky Mode
 *
 * BEHAVIOR:
 * - PC: Click to play → Video stays in place → When >15% hidden by scroll → Floats to TOP
 *       → When >70% visible again → Returns to original position
 * - MOBILE: Auto-play → Elegant banner appears when playing → Click banner = Sticky mode
 *
 * Made by mbxarts.com The Moon in a Box property
 * Co-Author: Godez22
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Play, Volume2, VolumeX, X, ArrowUp, Minimize2 } from 'lucide-react';
import { VideoExperienceHint } from '@/components/ui/RotatePhoneHint';

// Lazy load Mux Player for optimization
const MuxPlayer = dynamic(
  () => import('@mux/mux-player-react').then(mod => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="relative aspect-video w-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-black rounded-3xl">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-white/70 text-sm">Loading...</p>
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

// Auto-play volume (0.0 to 1.0) - 30% as requested
const AUTO_PLAY_VOLUME = 0.30;

// Visibility thresholds for sticky behavior
const STICKY_THRESHOLD = 0.85; // Go sticky when <85% visible (>15% hidden)
const RETURN_THRESHOLD = 0.70; // Return to normal when >70% visible

// CSS Keyframes
const animationStyles = `
  @keyframes ambientPulse {
    0%, 100% { opacity: 0.5; transform: scale(1.12); }
    50% { opacity: 0.65; transform: scale(1.18); }
  }
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
`;

export function EmbeddedVideoDevice({
  muxPlaybackId,
  lessonId,
  title,
  description,
  onVideoComplete,
  className = '',
}: EmbeddedVideoDeviceProps) {
  // Core state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(AUTO_PLAY_VOLUME);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // STICKY MODE: Video floats to top when scrolled out of view
  const [isSticky, setIsSticky] = useState(false);
  const [showMobileBanner, setShowMobileBanner] = useState(false);

  // Ambient Mode state
  const [ambientColors, setAmbientColors] = useState({
    dominant: 'rgba(139, 92, 246, 0.4)',
    secondary: 'rgba(6, 182, 212, 0.3)',
    accent: 'rgba(168, 85, 247, 0.35)'
  });

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const placeholderRef = useRef<HTMLDivElement>(null);
  const ambientIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasAutoPlayed = useRef(false);
  const stickyLocked = useRef(false); // Prevents rapid toggle

  // CRITICAL: Unique DOM ID for MuxPlayer
  const muxPlayerId = `mux-player-${lessonId}`;

  // Detect Mobile device
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkMobile = () => {
        const isSmallScreen = window.innerWidth < 768;
        const mobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        return isSmallScreen || mobileUA;
      };

      setIsMobile(checkMobile());

      const handleResize = () => setIsMobile(checkMobile());
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Get MuxPlayer via DOM
  const getMuxPlayer = useCallback((): any => {
    if (typeof document === 'undefined') return null;
    const wrapper = document.getElementById(muxPlayerId);
    if (!wrapper) return null;
    return wrapper.querySelector('mux-player');
  }, [muxPlayerId]);

  // Audio unlock on first interaction
  useEffect(() => {
    if (audioUnlocked) return;

    const unlockAudio = () => {
      setAudioUnlocked(true);
      const player = getMuxPlayer();
      if (player && isPlaying && isMuted) {
        try {
          player.muted = false;
          player.volume = AUTO_PLAY_VOLUME;
          setIsMuted(false);
        } catch (e) {
          console.log('[Video] Could not unmute:', e);
        }
      }
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
    };

    document.addEventListener('click', unlockAudio, { once: true, passive: true });
    document.addEventListener('touchstart', unlockAudio, { once: true, passive: true });

    return () => {
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
    };
  }, [audioUnlocked, isPlaying, isMuted, getMuxPlayer]);

  // Attempt auto-play (for mobile)
  const attemptAutoPlay = useCallback(() => {
    if (hasAutoPlayed.current) return;

    const player = getMuxPlayer();
    if (!player) return;

    player.volume = AUTO_PLAY_VOLUME;
    player.muted = false;
    setVolume(AUTO_PLAY_VOLUME);
    setIsMuted(false);

    const playPromise = player.play();
    if (playPromise?.then) {
      playPromise.then(() => {
        hasAutoPlayed.current = true;
        setIsPlaying(true);
        setIsMuted(false);
      }).catch(() => {
        // Fallback: muted play
        player.muted = true;
        setIsMuted(true);
        player.play()?.then(() => {
          hasAutoPlayed.current = true;
          setIsPlaying(true);
        }).catch(() => {});
      });
    }
  }, [getMuxPlayer]);

  // Extract colors from video for ambient effect
  const extractVideoColors = useCallback(() => {
    if (!isPlaying) return;
    const time = Date.now() / 5000;
    setAmbientColors({
      dominant: `rgba(${139 + Math.sin(time) * 30}, ${92 + Math.sin(time + 1) * 30}, ${246 + Math.sin(time + 2) * 9}, 0.5)`,
      secondary: `rgba(${6 + Math.sin(time + 2) * 6}, ${182 + Math.sin(time) * 30}, ${212 + Math.sin(time + 1) * 30}, 0.4)`,
      accent: `rgba(${168 + Math.sin(time + 1) * 30}, ${85 + Math.sin(time + 2) * 30}, ${247 + Math.sin(time) * 8}, 0.45)`
    });
  }, [isPlaying]);

  // Start/stop ambient color extraction
  useEffect(() => {
    if (isPlaying) {
      ambientIntervalRef.current = setInterval(extractVideoColors, 100);
      return () => {
        if (ambientIntervalRef.current) clearInterval(ambientIntervalRef.current);
      };
    }
  }, [isPlaying, extractVideoColors]);

  // =============================================================================
  // STICKY MODE LOGIC - IntersectionObserver
  // =============================================================================
  useEffect(() => {
    // Always observe the placeholder (original position marker)
    const elementToObserve = placeholderRef.current || containerRef.current;
    if (!elementToObserve) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const visibilityRatio = entry.intersectionRatio;

          console.log(`[Sticky] Visibility: ${(visibilityRatio * 100).toFixed(0)}%, Playing: ${isPlaying}, Sticky: ${isSticky}`);

          // MOBILE: Show banner when playing and starts scrolling
          if (isMobile && isPlaying && !isSticky) {
            if (visibilityRatio < 0.95 && visibilityRatio > 0.3) {
              setShowMobileBanner(true);
            } else if (visibilityRatio > 0.95) {
              setShowMobileBanner(false);
            }
          }

          // Prevent rapid toggles
          if (stickyLocked.current) return;

          // GO STICKY: When <85% visible (>15% hidden) AND video is playing
          if (!isSticky && isPlaying && visibilityRatio < STICKY_THRESHOLD) {
            console.log('[Sticky] Going STICKY - video >15% hidden');
            stickyLocked.current = true;
            setIsSticky(true);
            setShowMobileBanner(false);
            setTimeout(() => { stickyLocked.current = false; }, 500);
          }

          // RETURN TO NORMAL: When >70% visible
          if (isSticky && visibilityRatio > RETURN_THRESHOLD) {
            console.log('[Sticky] Returning to NORMAL - video >70% visible');
            stickyLocked.current = true;
            setIsSticky(false);
            setTimeout(() => { stickyLocked.current = false; }, 500);
          }
        });
      },
      {
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.85, 0.9, 0.95, 1.0],
        rootMargin: '0px'
      }
    );

    observer.observe(elementToObserve);
    return () => observer.disconnect();
  }, [isPlaying, isSticky, isMobile]);

  // Handle click to play/pause
  const handleVideoClick = useCallback(() => {
    const player = getMuxPlayer();
    if (!player) return;

    const isPaused = player.paused;

    if (isPaused) {
      player.volume = AUTO_PLAY_VOLUME;
      player.muted = false;
      setVolume(AUTO_PLAY_VOLUME);
      setIsMuted(false);
      setAudioUnlocked(true);

      player.play()?.then(() => {
        setIsPlaying(true);
        hasAutoPlayed.current = true;
      }).catch(() => {
        player.muted = true;
        setIsMuted(true);
        player.play()?.then(() => {
          setIsPlaying(true);
          hasAutoPlayed.current = true;
        });
      });
    } else {
      player.pause();
      setIsPlaying(false);
    }
  }, [getMuxPlayer]);

  // Fullscreen on double-click
  const handleDoubleClick = useCallback(() => {
    const player = getMuxPlayer();
    if (!player) return;

    const isFullscreen = !!(document.fullscreenElement || (document as any).webkitFullscreenElement);

    if (isFullscreen) {
      document.exitFullscreen?.() || (document as any).webkitExitFullscreen?.();
    } else {
      const el = containerRef.current || player;
      el?.requestFullscreen?.() || (el as any)?.webkitRequestFullscreen?.();
    }
  }, [getMuxPlayer]);

  // Mobile banner click - enter sticky mode
  const handleMobileBannerClick = useCallback(() => {
    setShowMobileBanner(false);
    setIsSticky(true);
  }, []);

  // Close sticky mode
  const closeSticky = useCallback(() => {
    setIsSticky(false);
    // Scroll back to video
    placeholderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  // Close and pause
  const closeStickyAndPause = useCallback(() => {
    const player = getMuxPlayer();
    if (player) player.pause();
    setIsPlaying(false);
    setIsSticky(false);
  }, [getMuxPlayer]);

  // Video ready handler
  const handleVideoLoaded = useCallback(() => {
    setTimeout(() => setIsVideoReady(true), 300);
  }, []);

  // Auto-play when ready (mobile only)
  useEffect(() => {
    if (!isVideoReady || hasAutoPlayed.current || !isMobile) return;

    const checkAndPlay = () => {
      const player = getMuxPlayer();
      if (!player) {
        setTimeout(checkAndPlay, 300);
        return;
      }

      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const visibleHeight = Math.min(window.innerHeight, rect.bottom) - Math.max(0, rect.top);
        const visibility = visibleHeight / rect.height;
        if (visibility > 0.5) {
          attemptAutoPlay();
        }
      }
    };

    setTimeout(checkAndPlay, 600);
  }, [isVideoReady, isMobile, attemptAutoPlay, getMuxPlayer]);

  const handleVideoEnd = useCallback(() => {
    localStorage.setItem(`video_seen:${lessonId}`, 'completed');
    setIsPlaying(false);
    setIsSticky(false);
    onVideoComplete?.();
  }, [lessonId, onVideoComplete]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    const player = getMuxPlayer();
    if (player) {
      const newMuted = !player.muted;
      player.muted = newMuted;
      setIsMuted(newMuted);
      if (!newMuted) player.volume = volume;
    }
  }, [volume, getMuxPlayer]);

  // Ambient gradient
  const ambientGradient = `
    radial-gradient(ellipse 120% 100% at 50% 50%, ${ambientColors.dominant} 0%, transparent 50%),
    radial-gradient(ellipse 80% 60% at 20% 30%, ${ambientColors.secondary} 0%, transparent 45%),
    radial-gradient(ellipse 80% 60% at 80% 70%, ${ambientColors.accent} 0%, transparent 45%)
  `;

  // =============================================================================
  // RENDER
  // =============================================================================
  return (
    <>
      <style jsx global>{animationStyles}</style>

      {/* PLACEHOLDER - Reserves space when video is sticky */}
      <div
        ref={placeholderRef}
        className={`relative ${className}`}
        style={{ minHeight: isSticky ? '300px' : 'auto' }}
      >
        {/* When sticky, show placeholder message */}
        {isSticky && (
          <div className="relative aspect-video bg-gradient-to-br from-slate-900/30 to-black/30 rounded-3xl border border-white/5 flex items-center justify-center">
            <div className="text-center opacity-50">
              <ArrowUp className="w-6 h-6 text-white/30 mx-auto mb-2 animate-bounce" />
              <p className="text-white/30 text-sm">Video arriba</p>
            </div>
          </div>
        )}

        {/* MAIN VIDEO CONTAINER - Either in place or sticky at top */}
        <div
          ref={containerRef}
          className={`${isSticky ? 'fixed top-0 left-0 right-0 z-[9999]' : 'relative'}`}
          style={isSticky ? {
            padding: '8px 16px',
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.9) 100%)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 4px 30px rgba(0,0,0,0.5)',
          } : undefined}
        >
          {/* Sticky mode header bar */}
          {isSticky && (
            <div className="flex items-center justify-between mb-2 px-2">
              <span className="text-white/60 text-xs font-medium truncate max-w-[200px]">
                {title || 'Now Playing'}
              </span>
              <div className="flex items-center gap-2">
                {/* Return to position button */}
                <button
                  onClick={closeSticky}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all"
                  title="Return to video position"
                >
                  <ArrowUp className="w-4 h-4 rotate-180" />
                </button>
                {/* Close button */}
                <button
                  onClick={closeStickyAndPause}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-red-500/50 text-white/70 hover:text-white transition-all"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Video wrapper with max-width in sticky mode */}
          <div className={isSticky ? 'max-w-2xl mx-auto' : ''}>
            {/* Title Panel - Hidden in sticky mode */}
            {title && !isSticky && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 text-center"
              >
                <div className="inline-block px-4 py-2 rounded-full bg-black/30 backdrop-blur-md border border-white/10">
                  <span className="text-white/90 text-sm font-medium">{title}</span>
                </div>
              </motion.div>
            )}

            {/* AMBIENT GLOW - Hidden in sticky */}
            {!isSticky && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: isPlaying ? 1 : 0.4, scale: 1.05 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-4 -z-10 pointer-events-none mx-auto max-w-2xl"
                style={{
                  background: ambientGradient,
                  filter: 'blur(50px)',
                  opacity: 0.4,
                  borderRadius: '40px',
                  animation: isPlaying ? 'ambientPulse 4s ease-in-out infinite' : 'none',
                }}
              />
            )}

            {/* Video Container */}
            <div className={`relative mx-auto ${isSticky ? '' : 'max-w-2xl'}`}>
              <motion.div
                initial={!isSticky ? { opacity: 0, y: 30, scale: 0.95 } : false}
                animate={!isSticky ? { opacity: 1, y: [0, -8, 0], scale: 1 } : { opacity: 1, y: 0, scale: 1 }}
                transition={!isSticky ? {
                  opacity: { duration: 0.6 },
                  y: { duration: 6, repeat: Infinity },
                  scale: { duration: 0.6 }
                } : { duration: 0.3 }}
                className={`relative overflow-hidden ${isSticky ? 'rounded-xl' : 'rounded-3xl'}`}
                style={!isSticky ? {
                  boxShadow: '0 0 15px rgba(0,0,0,0.4), 0 0 25px rgba(0,0,0,0.3), 0 0 40px rgba(0,0,0,0.2)',
                } : {
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                }}
              >
                {/* Video Frame */}
                <div
                  className={`relative cursor-pointer ${isSticky ? 'rounded-xl' : 'rounded-3xl'} overflow-hidden`}
                  onClick={handleVideoClick}
                  onDoubleClick={handleDoubleClick}
                >
                  <div className={`relative ${isSticky ? 'aspect-video max-h-[200px]' : 'aspect-video'} bg-black overflow-hidden`}>
                    {/* MuxPlayer */}
                    <div id={muxPlayerId} className="absolute inset-0">
                      <MuxPlayer
                        playbackId={muxPlaybackId}
                        streamType="on-demand"
                        autoPlay={false}
                        muted={isMuted}
                        playsInline
                        onLoadedData={handleVideoLoaded}
                        onCanPlay={handleVideoLoaded}
                        onEnded={handleVideoEnd}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        style={{
                          width: '100%',
                          height: '100%',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          borderRadius: isSticky ? '0.75rem' : '1.5rem',
                          overflow: 'hidden',
                          '--controls': 'none',
                          '--media-object-fit': 'cover',
                          '--media-object-position': 'center',
                        } as any}
                        metadata={{
                          video_title: title || 'CryptoGift Video',
                          video_series: 'CryptoGift Educational'
                        }}
                      />
                    </div>

                    {/* Play Overlay - When paused */}
                    {!isPlaying && isVideoReady && !isSticky && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
                      >
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center border border-white/20"
                        >
                          <Play className="w-8 h-8 md:w-10 md:h-10 text-white ml-1" fill="white" />
                        </motion.div>
                        <motion.div
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="mt-4 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/20"
                        >
                          <span className="text-white text-sm font-medium">Click to play</span>
                        </motion.div>
                      </motion.div>
                    )}

                    {/* Minimal play icon in sticky mode when paused */}
                    {!isPlaying && isSticky && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center">
                          <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Shimmer effect */}
                  {isPlaying && !isSticky && (
                    <div
                      className="absolute inset-0 pointer-events-none rounded-3xl"
                      style={{
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.03) 50%, transparent 100%)',
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 3s linear infinite',
                      }}
                    />
                  )}
                </div>

                {/* Volume control */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`absolute ${isSticky ? 'top-2 right-2' : 'top-3 right-3'} z-30`}
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                    className={`${isSticky ? 'p-1.5' : 'p-2.5'} rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 hover:scale-110 transition-all shadow-lg border border-white/10`}
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? (
                      <VolumeX className={isSticky ? 'w-4 h-4' : 'w-5 h-5'} />
                    ) : (
                      <Volume2 className={isSticky ? 'w-4 h-4' : 'w-5 h-5'} />
                    )}
                  </button>
                </motion.div>
              </motion.div>
            </div>

            {/* Video Experience Hint - Hidden in sticky */}
            {!isSticky && (
              <div className="mt-3 relative z-10">
                <VideoExperienceHint />
              </div>
            )}

            {/* Description - Hidden in sticky */}
            {description && !isSticky && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center text-sm text-cyan-300/80 mt-3 max-w-md mx-auto relative z-10"
                style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
              >
                {description}
              </motion.p>
            )}
          </div>
        </div>
      </div>

      {/* === MOBILE STICKY BANNER === */}
      {/* Elegant banner that appears when video is playing on mobile */}
      <AnimatePresence>
        {showMobileBanner && isMobile && isPlaying && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50"
          >
            <button
              onClick={handleMobileBannerClick}
              className="group flex items-center gap-3 px-5 py-3 rounded-full
                         bg-gradient-to-r from-purple-600/95 via-violet-600/95 to-indigo-600/95
                         backdrop-blur-xl border border-white/20
                         shadow-[0_8px_32px_rgba(139,92,246,0.5)]
                         hover:shadow-[0_12px_40px_rgba(139,92,246,0.6)]
                         active:scale-95
                         transition-all duration-300"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="p-1.5 rounded-full bg-white/20"
              >
                <Minimize2 className="w-5 h-5 text-white" />
              </motion.div>

              <div className="flex flex-col items-start">
                <span className="text-white font-semibold text-sm">Keep watching</span>
                <span className="text-white/70 text-xs">Tap for sticky player</span>
              </div>

              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-white/60"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </motion.div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default EmbeddedVideoDevice;
