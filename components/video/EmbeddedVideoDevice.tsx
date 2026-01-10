'use client';

/**
 * EMBEDDED VIDEO DEVICE - Premium Video Player with Ambient Mode
 *
 * Features:
 * - AMBIENT MODE: YouTube-style glow effect that extracts colors from video
 * - Auto-play when >50% visible with 15% volume
 * - Picture-in-Picture when <30% visible while playing
 * - Exit PiP when >50% visible again
 * - Sophisticated floating effect with dynamic shadows
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

// Ambient Mode settings
const AMBIENT_CONFIG = {
  blur: 80,           // Blur radius for ambient glow
  opacity: 0.55,      // Opacity of the glow
  brightness: 1.15,   // Brightness multiplier
  saturate: 1.3,      // Saturation boost
  scale: 1.15,        // Scale of glow behind video
  updateInterval: 100 // How often to sample colors (ms)
};

// Auto-play volume (0.0 to 1.0)
const AUTO_PLAY_VOLUME = 0.15;

// CSS Keyframes for premium animations
const animationStyles = `
  @keyframes ambientPulse {
    0%, 100% {
      opacity: 0.5;
      transform: scale(1.12);
    }
    50% {
      opacity: 0.65;
      transform: scale(1.18);
    }
  }

  @keyframes videoFloat {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-6px);
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
  locale
}: EmbeddedVideoDeviceProps) {
  const t = useTranslations('video');

  // State
  const [showVideo, setShowVideo] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(AUTO_PLAY_VOLUME);
  const [isInPiP, setIsInPiP] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [currentLocale, setCurrentLocale] = useState<'es' | 'en'>(locale || 'es');

  // Ambient Mode state
  const [ambientColors, setAmbientColors] = useState({
    dominant: 'rgba(139, 92, 246, 0.4)',
    secondary: 'rgba(6, 182, 212, 0.3)',
    accent: 'rgba(168, 85, 247, 0.35)'
  });

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const muxPlayerRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ambientIntervalRef = useRef<NodeJS.Timeout | null>(null);
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

  // Create canvas for color extraction
  useEffect(() => {
    if (typeof document !== 'undefined' && !canvasRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = 16;  // Small for performance
      canvas.height = 9;  // 16:9 ratio
      canvasRef.current = canvas;
    }
  }, []);

  // Get video element from MuxPlayer with retry logic
  const getVideoElement = useCallback((): HTMLVideoElement | null => {
    if (videoRef.current) return videoRef.current;

    if (muxPlayerRef.current) {
      const muxElement = muxPlayerRef.current;

      // Method 1: Direct media.nativeEl access
      if (muxElement?.media?.nativeEl) {
        videoRef.current = muxElement.media.nativeEl;
        return videoRef.current;
      }

      // Method 2: Query from shadowRoot
      if (muxElement?.shadowRoot) {
        const videoEl = muxElement.shadowRoot.querySelector('video');
        if (videoEl) {
          videoRef.current = videoEl;
          return videoRef.current;
        }
      }

      // Method 3: Query directly
      if (typeof muxElement.querySelector === 'function') {
        const videoEl = muxElement.querySelector('video');
        if (videoEl) {
          videoRef.current = videoEl;
          return videoRef.current;
        }
      }

      // Method 4: Search in DOM subtree
      if (containerRef.current) {
        const videoEl = containerRef.current.querySelector('video');
        if (videoEl) {
          videoRef.current = videoEl;
          return videoRef.current;
        }
      }
    }
    return null;
  }, []);

  // Extract colors from video frame for Ambient Mode
  const extractVideoColors = useCallback(() => {
    const video = getVideoElement();
    const canvas = canvasRef.current;

    if (!video || !canvas || video.paused || video.ended) return;

    try {
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      // Draw video frame to small canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Sample colors from different regions
      const topLeft = ctx.getImageData(0, 0, 4, 4).data;
      const topRight = ctx.getImageData(canvas.width - 4, 0, 4, 4).data;
      const bottomCenter = ctx.getImageData(canvas.width / 2 - 2, canvas.height - 4, 4, 4).data;
      const center = ctx.getImageData(canvas.width / 2 - 2, canvas.height / 2 - 2, 4, 4).data;

      // Calculate average colors
      const avgColor = (data: Uint8ClampedArray) => {
        let r = 0, g = 0, b = 0, count = 0;
        for (let i = 0; i < data.length; i += 4) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count++;
        }
        return {
          r: Math.round(r / count),
          g: Math.round(g / count),
          b: Math.round(b / count)
        };
      };

      const dominant = avgColor(center);
      const secondary = avgColor(topLeft);
      const accent = avgColor(bottomCenter);

      // Apply brightness and saturation adjustments
      const adjust = (color: { r: number; g: number; b: number }) => {
        const brightness = AMBIENT_CONFIG.brightness;
        const saturate = AMBIENT_CONFIG.saturate;

        let r = Math.min(255, color.r * brightness);
        let g = Math.min(255, color.g * brightness);
        let b = Math.min(255, color.b * brightness);

        // Simple saturation boost
        const gray = (r + g + b) / 3;
        r = Math.min(255, r + (r - gray) * (saturate - 1));
        g = Math.min(255, g + (g - gray) * (saturate - 1));
        b = Math.min(255, b + (b - gray) * (saturate - 1));

        return { r: Math.round(r), g: Math.round(g), b: Math.round(b) };
      };

      const d = adjust(dominant);
      const s = adjust(secondary);
      const a = adjust(accent);

      setAmbientColors({
        dominant: `rgba(${d.r}, ${d.g}, ${d.b}, 0.5)`,
        secondary: `rgba(${s.r}, ${s.g}, ${s.b}, 0.4)`,
        accent: `rgba(${a.r}, ${a.g}, ${a.b}, 0.45)`
      });
    } catch (err) {
      // CORS or other error - use fallback colors
      console.log('[Ambient] Color extraction unavailable, using fallback');
    }
  }, [getVideoElement]);

  // Start/stop ambient color extraction
  useEffect(() => {
    if (isPlaying && showVideo) {
      // Start extracting colors
      ambientIntervalRef.current = setInterval(extractVideoColors, AMBIENT_CONFIG.updateInterval);

      return () => {
        if (ambientIntervalRef.current) {
          clearInterval(ambientIntervalRef.current);
          ambientIntervalRef.current = null;
        }
      };
    }
  }, [isPlaying, showVideo, extractVideoColors]);

  // Enter Picture-in-Picture mode
  const enterPiP = useCallback(async () => {
    const video = getVideoElement();
    if (!video || isInPiP) return;

    try {
      if (document.pictureInPictureEnabled && !document.pictureInPictureElement) {
        await video.requestPictureInPicture();
        setIsInPiP(true);
        console.log('[Video] Entered PiP mode');
      }
    } catch (err) {
      console.log('[Video] PiP not available:', err);
    }
  }, [getVideoElement, isInPiP]);

  // Exit Picture-in-Picture mode
  const exitPiP = useCallback(async () => {
    if (!isInPiP) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsInPiP(false);
        console.log('[Video] Exited PiP mode');
      }
    } catch (err) {
      console.log('[Video] Error exiting PiP:', err);
    }
  }, [isInPiP]);

  // Handle PiP events from video element
  useEffect(() => {
    const video = getVideoElement();
    if (!video) return;

    const handlePiPEnter = () => setIsInPiP(true);
    const handlePiPLeave = () => setIsInPiP(false);

    video.addEventListener('enterpictureinpicture', handlePiPEnter);
    video.addEventListener('leavepictureinpicture', handlePiPLeave);

    return () => {
      video.removeEventListener('enterpictureinpicture', handlePiPEnter);
      video.removeEventListener('leavepictureinpicture', handlePiPLeave);
    };
  }, [getVideoElement, isVideoReady]);

  // IntersectionObserver for auto-play and PiP
  useEffect(() => {
    if (!showVideo || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const visibilityRatio = entry.intersectionRatio;
          const video = getVideoElement();

          // Auto-play when >50% visible
          if (visibilityRatio > 0.5 && !hasAutoPlayed.current && video && isVideoReady) {
            if (video.paused) {
              video.volume = AUTO_PLAY_VOLUME;
              video.muted = false;
              video.play().then(() => {
                hasAutoPlayed.current = true;
                setIsPlaying(true);
                setVolume(AUTO_PLAY_VOLUME);
                console.log('[Video] Auto-playing with volume:', AUTO_PLAY_VOLUME);
              }).catch(err => {
                console.log('[Video] Auto-play blocked, trying muted:', err);
                video.muted = true;
                setIsMuted(true);
                video.play().then(() => {
                  hasAutoPlayed.current = true;
                  setIsPlaying(true);
                }).catch(e => console.log('[Video] Muted auto-play also blocked:', e));
              });
            }
          }

          // Enter PiP when <30% visible and video is playing
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
  }, [showVideo, isPlaying, isInPiP, isVideoReady, getVideoElement, enterPiP, exitPiP]);

  // Handle play click - Show video and wait for it to be ready
  const handlePlayClick = useCallback(() => {
    console.log('[Video] Play clicked');
    setShowVideo(true);
  }, []);

  // Play video when ready
  const playVideo = useCallback(() => {
    const video = getVideoElement();
    if (!video) {
      console.log('[Video] Video element not found, retrying...');
      setTimeout(playVideo, 200);
      return;
    }

    console.log('[Video] Playing video...');
    video.volume = AUTO_PLAY_VOLUME;
    video.muted = false;

    video.play().then(() => {
      setIsPlaying(true);
      hasAutoPlayed.current = true;
      console.log('[Video] Playing successfully');
    }).catch(err => {
      console.log('[Video] Play failed, trying muted:', err);
      video.muted = true;
      setIsMuted(true);
      video.play().then(() => {
        setIsPlaying(true);
        hasAutoPlayed.current = true;
      }).catch(e => console.log('[Video] Muted play also failed:', e));
    });
  }, [getVideoElement]);

  // Handle MuxPlayer loaded event
  const handleVideoLoaded = useCallback(() => {
    console.log('[Video] MuxPlayer loaded');
    setIsVideoReady(true);

    // Clear cached video ref to force re-query
    videoRef.current = null;

    // Small delay then play
    setTimeout(() => {
      playVideo();
    }, 300);
  }, [playVideo]);

  const handleVideoEnd = useCallback(() => {
    console.log('[Video] Video completed');
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

  // Dynamic ambient gradient based on extracted colors
  const ambientGradient = `
    radial-gradient(ellipse 120% 100% at 50% 50%, ${ambientColors.dominant} 0%, transparent 50%),
    radial-gradient(ellipse 80% 60% at 20% 30%, ${ambientColors.secondary} 0%, transparent 45%),
    radial-gradient(ellipse 80% 60% at 80% 70%, ${ambientColors.accent} 0%, transparent 45%)
  `;

  return (
    <>
      <style jsx global>{animationStyles}</style>

      {/* Main container with Ambient Mode */}
      <div ref={containerRef} className={`relative ${className}`}>

        {/* AMBIENT GLOW LAYER - Behind the video */}
        {showVideo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
              opacity: isPlaying ? 1 : 0.5,
              scale: AMBIENT_CONFIG.scale
            }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute inset-0 -z-10 pointer-events-none mx-auto max-w-2xl"
            style={{
              background: ambientGradient,
              filter: `blur(${AMBIENT_CONFIG.blur}px)`,
              opacity: AMBIENT_CONFIG.opacity,
              transform: `scale(${AMBIENT_CONFIG.scale})`,
              borderRadius: '60px',
              animation: isPlaying ? 'ambientPulse 4s ease-in-out infinite' : 'none',
            }}
          />
        )}

        {/* Video Container */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative mx-auto max-w-2xl"
        >
          {/* Video Frame with sophisticated shadow */}
          <div
            className="relative rounded-3xl overflow-hidden"
            style={{
              boxShadow: showVideo && isPlaying
                ? `
                    0 30px 60px -15px rgba(0, 0, 0, 0.5),
                    0 0 0 1px rgba(255, 255, 255, 0.08),
                    0 0 100px -20px ${ambientColors.dominant},
                    0 0 60px -10px ${ambientColors.secondary},
                    inset 0 1px 0 rgba(255, 255, 255, 0.15)
                  `
                : `
                    0 25px 50px -12px rgba(0, 0, 0, 0.4),
                    0 0 0 1px rgba(255, 255, 255, 0.05),
                    0 0 60px -15px rgba(139, 92, 246, 0.25),
                    inset 0 1px 0 rgba(255, 255, 255, 0.1)
                  `,
              animation: !showVideo ? 'videoFloat 6s ease-in-out infinite' : 'none',
              transition: 'box-shadow 0.5s ease-out',
            }}
          >
            {/* Aspect ratio container */}
            <div className="relative aspect-video bg-black">
              <AnimatePresence mode="wait">
                {!showVideo ? (
                  /* Play Overlay */
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
                  /* Video Player */
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
                      onLoadedData={handleVideoLoaded}
                      onCanPlay={handleVideoLoaded}
                      onEnded={handleVideoEnd}
                      onPlay={() => {
                        setIsPlaying(true);
                        console.log('[Video] onPlay event');
                      }}
                      onPause={() => {
                        setIsPlaying(false);
                        console.log('[Video] onPause event');
                      }}
                      style={{
                        width: '100%',
                        height: '100%',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        '--media-object-fit': 'cover',
                        '--media-object-position': 'center',
                      } as any}
                      metadata={{
                        video_title: title || 'CryptoGift Video',
                        video_series: 'CryptoGift Educational'
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Shimmer effect on frame edge when playing */}
            {showVideo && isPlaying && (
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

          {/* Volume control - Always visible when video is showing */}
          {showVideo && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute top-3 right-3 z-30"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMute();
                }}
                className="p-2.5 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 hover:scale-110 transition-all shadow-lg border border-white/10"
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
