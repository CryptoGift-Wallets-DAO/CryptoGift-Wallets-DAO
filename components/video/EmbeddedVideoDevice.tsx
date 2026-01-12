'use client';

/**
 * EMBEDDED VIDEO DEVICE - Premium Video Player with Ambient Mode
 *
 * Features:
 * - AMBIENT MODE: YouTube-style glow effect that extracts colors from video
 * - Auto-play when >50% visible with 15% volume (NO CLICK REQUIRED)
 * - Picture-in-Picture when <30% visible while playing
 * - Exit PiP when >50% visible again
 * - Clean minimal UI - NO ugly overlays
 * - Smooth animations and premium aesthetics
 *
 * Made by mbxarts.com The Moon in a Box property
 * Co-Author: Godez22
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Play, Volume2, VolumeX } from 'lucide-react';
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

// Ambient Mode settings
const AMBIENT_CONFIG = {
  blur: 80,
  opacity: 0.55,
  brightness: 1.15,
  saturate: 1.3,
  scale: 1.15,
  updateInterval: 100
};

// Auto-play volume (0.0 to 1.0)
const AUTO_PLAY_VOLUME = 0.15;

// CSS Keyframes for premium animations - GRAVITATIONAL DISTORTION EFFECT
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

  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  /* === GRAVITATIONAL DISTORTION - Space Pressure Effect === */

  /* Primary ripple - innermost wave */
  @keyframes gravitationalRipple1 {
    0%, 100% {
      transform: scale(1);
      opacity: 0.8;
    }
    50% {
      transform: scale(1.02);
      opacity: 0.6;
    }
  }

  /* Secondary ripple - middle wave */
  @keyframes gravitationalRipple2 {
    0%, 100% {
      transform: scale(1);
      opacity: 0.5;
    }
    33% {
      transform: scale(1.04);
      opacity: 0.35;
    }
    66% {
      transform: scale(1.02);
      opacity: 0.45;
    }
  }

  /* Tertiary ripple - outer wave */
  @keyframes gravitationalRipple3 {
    0%, 100% {
      transform: scale(1);
      opacity: 0.3;
    }
    25% {
      transform: scale(1.03);
      opacity: 0.2;
    }
    50% {
      transform: scale(1.06);
      opacity: 0.15;
    }
    75% {
      transform: scale(1.04);
      opacity: 0.25;
    }
  }

  /* Deep space warp - slowest, most distant */
  @keyframes spaceWarp {
    0%, 100% {
      transform: scale(1) rotate(0deg);
      opacity: 0.15;
    }
    50% {
      transform: scale(1.08) rotate(0.5deg);
      opacity: 0.1;
    }
  }

  /* Event horizon pulse - the darkest core shadow */
  @keyframes eventHorizon {
    0%, 100% {
      box-shadow:
        0 0 60px 20px rgba(0, 0, 0, 0.9),
        0 0 120px 40px rgba(0, 0, 0, 0.6);
    }
    50% {
      box-shadow:
        0 0 80px 30px rgba(0, 0, 0, 0.85),
        0 0 150px 50px rgba(0, 0, 0, 0.5);
    }
  }

  /* Chromatic aberration effect at edges */
  @keyframes chromaticShift {
    0%, 100% {
      filter: blur(0px);
    }
    50% {
      filter: blur(0.3px);
    }
  }

  /* Nebula texture breathing - mystical depth */
  @keyframes nebulaBreath {
    0%, 100% {
      opacity: 0.15;
      transform: scale(1) rotate(0deg);
    }
    25% {
      opacity: 0.12;
      transform: scale(1.02) rotate(0.2deg);
    }
    50% {
      opacity: 0.18;
      transform: scale(0.98) rotate(-0.2deg);
    }
    75% {
      opacity: 0.14;
      transform: scale(1.01) rotate(0.1deg);
    }
  }

  /* Dark matter shimmer - adds depth perception */
  @keyframes darkMatterShimmer {
    0%, 100% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
  }

  /* Gravity well pulsation - core pressure effect */
  @keyframes gravityWellPulse {
    0%, 100% {
      box-shadow:
        inset 0 0 80px 20px rgba(0, 0, 0, 0.6),
        0 0 30px 5px rgba(0, 0, 0, 0.8);
    }
    33% {
      box-shadow:
        inset 0 0 90px 25px rgba(0, 0, 0, 0.55),
        0 0 35px 8px rgba(0, 0, 0, 0.75);
    }
    66% {
      box-shadow:
        inset 0 0 70px 18px rgba(0, 0, 0, 0.65),
        0 0 28px 4px rgba(0, 0, 0, 0.82);
    }
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
  // State - Video always rendered, auto-play on visibility
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(AUTO_PLAY_VOLUME);
  const [isInPiP, setIsInPiP] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);

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

  // Create canvas for color extraction
  useEffect(() => {
    if (typeof document !== 'undefined' && !canvasRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = 16;
      canvas.height = 9;
      canvasRef.current = canvas;
    }
  }, []);

  // PROACTIVE VIDEO DETECTION: Watch for video element to be added to DOM
  // MuxPlayer dynamically injects <video> after loading, so we need to watch for it
  useEffect(() => {
    if (!containerRef.current) return;

    // If we already have a video ref, no need to watch
    if (videoRef.current && document.body.contains(videoRef.current)) return;

    console.log('[SmartDetection] Setting up MutationObserver to detect video element...');

    const observer = new MutationObserver((mutations) => {
      // Check if a video element was added
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node instanceof HTMLVideoElement) {
            console.log('[SmartDetection] 🎬 MutationObserver: Video element detected!');
            videoRef.current = node;
            return;
          }
          if (node instanceof Element) {
            const video = node.querySelector('video');
            if (video) {
              console.log('[SmartDetection] 🎬 MutationObserver: Video found in added element!');
              videoRef.current = video;
              return;
            }
          }
        }
      }
    });

    observer.observe(containerRef.current, {
      childList: true,
      subtree: true,
    });

    // Also check shadow DOM of mux-player if it exists
    const checkMuxShadow = () => {
      if (muxPlayerRef.current?.shadowRoot) {
        const shadowObserver = new MutationObserver(() => {
          const video = muxPlayerRef.current?.shadowRoot?.querySelector('video');
          if (video && !videoRef.current) {
            console.log('[SmartDetection] 🎬 ShadowRoot: Video element detected!');
            videoRef.current = video;
          }
        });
        shadowObserver.observe(muxPlayerRef.current.shadowRoot, {
          childList: true,
          subtree: true,
        });
        return () => shadowObserver.disconnect();
      }
    };

    // Delayed check for shadow DOM (MuxPlayer may not be ready immediately)
    const shadowTimeout = setTimeout(checkMuxShadow, 500);

    return () => {
      observer.disconnect();
      clearTimeout(shadowTimeout);
    };
  }, []);

  // Get video element from MuxPlayer - MUST be declared before attemptAutoPlay
  // MuxPlayer is a Web Component with Shadow DOM, so we need multiple strategies
  const getVideoElement = useCallback((): HTMLVideoElement | null => {
    // Return cached ref if valid
    if (videoRef.current && document.body.contains(videoRef.current)) {
      return videoRef.current;
    }

    // Reset cache
    videoRef.current = null;

    // Strategy 1: Search in container DOM (most reliable for MuxPlayer)
    if (containerRef.current) {
      const videoEl = containerRef.current.querySelector('video');
      if (videoEl) {
        console.log('[SmartDetection] Found video via container querySelector');
        videoRef.current = videoEl;
        return videoRef.current;
      }
    }

    // Strategy 2: Search in muxPlayer's shadow DOM
    if (muxPlayerRef.current) {
      const muxElement = muxPlayerRef.current;

      // Try shadowRoot first (MuxPlayer uses Shadow DOM)
      if (muxElement?.shadowRoot) {
        const videoEl = muxElement.shadowRoot.querySelector('video');
        if (videoEl) {
          console.log('[SmartDetection] Found video via shadowRoot');
          videoRef.current = videoEl;
          return videoRef.current;
        }
      }

      // Try media-controller pattern
      const mediaController = muxElement?.shadowRoot?.querySelector('media-controller');
      if (mediaController?.shadowRoot) {
        const videoEl = mediaController.shadowRoot.querySelector('video');
        if (videoEl) {
          console.log('[SmartDetection] Found video via media-controller');
          videoRef.current = videoEl;
          return videoRef.current;
        }
      }

      // Try direct media property
      if (muxElement?.media?.nativeEl) {
        console.log('[SmartDetection] Found video via media.nativeEl');
        videoRef.current = muxElement.media.nativeEl;
        return videoRef.current;
      }
    }

    // Strategy 3: Global document search as last resort
    const allVideos = document.querySelectorAll('video');
    if (allVideos.length > 0) {
      // Find video that's inside our container
      for (const video of allVideos) {
        if (containerRef.current?.contains(video) ||
            video.closest('[data-mux-player]')) {
          console.log('[SmartDetection] Found video via document search');
          videoRef.current = video;
          return videoRef.current;
        }
      }
    }

    console.log('[SmartDetection] ❌ No video element found after all strategies');
    return null;
  }, []);

  // Calculate visibility ratio manually (for initial check)
  const getVisibilityRatio = useCallback((): number => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // Completely off screen
    if (rect.bottom < 0 || rect.top > windowHeight) return 0;

    // Calculate visible portion
    const visibleTop = Math.max(0, rect.top);
    const visibleBottom = Math.min(windowHeight, rect.bottom);
    const visibleHeight = visibleBottom - visibleTop;

    return visibleHeight / rect.height;
  }, []);

  // Attempt auto-play with fallback to muted
  const attemptAutoPlay = useCallback(() => {
    if (hasAutoPlayed.current) {
      console.log('[SmartDetection] Already auto-played, skipping');
      return;
    }

    const video = getVideoElement();
    if (!video) {
      console.log('[SmartDetection] ❌ No video element for auto-play');
      return;
    }

    console.log('[SmartDetection] Attempting auto-play on video element:', video.tagName);
    console.log('[SmartDetection] Video readyState:', video.readyState);
    console.log('[SmartDetection] Video src:', video.src ? 'has src' : 'no src');

    // Set volume first
    try {
      video.volume = AUTO_PLAY_VOLUME;
      video.muted = false;
    } catch (e) {
      console.log('[SmartDetection] Error setting volume:', e);
    }

    video.play().then(() => {
      console.log('[SmartDetection] ✅ Auto-play SUCCESS with audio at 15% volume');
      hasAutoPlayed.current = true;
      setIsPlaying(true);
      setIsMuted(false);
      setVolume(AUTO_PLAY_VOLUME);
    }).catch((err) => {
      console.log('[SmartDetection] ⚠️ Auto-play with audio blocked:', err.name, err.message);
      // Fallback: try muted (browsers often require muted for auto-play)
      video.muted = true;

      video.play().then(() => {
        console.log('[SmartDetection] ✅ Auto-play SUCCESS (muted fallback)');
        hasAutoPlayed.current = true;
        setIsPlaying(true);
        setIsMuted(true);
      }).catch((err2) => {
        console.log('[SmartDetection] ❌ Auto-play completely blocked:', err2.name, err2.message);
        // Show play button to user - auto-play not allowed
      });
    });
  }, [getVideoElement]);

  // Extract colors from video frame for Ambient Mode
  const extractVideoColors = useCallback(() => {
    const video = getVideoElement();
    const canvas = canvasRef.current;

    if (!video || !canvas || video.paused || video.ended) return;

    try {
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const topLeft = ctx.getImageData(0, 0, 4, 4).data;
      const bottomCenter = ctx.getImageData(canvas.width / 2 - 2, canvas.height - 4, 4, 4).data;
      const center = ctx.getImageData(canvas.width / 2 - 2, canvas.height / 2 - 2, 4, 4).data;

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

      const adjust = (color: { r: number; g: number; b: number }) => {
        const brightness = AMBIENT_CONFIG.brightness;
        const saturate = AMBIENT_CONFIG.saturate;

        let r = Math.min(255, color.r * brightness);
        let g = Math.min(255, color.g * brightness);
        let b = Math.min(255, color.b * brightness);

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
    } catch {
      // CORS or other error - use fallback colors
    }
  }, [getVideoElement]);

  // Start/stop ambient color extraction
  useEffect(() => {
    if (isPlaying) {
      ambientIntervalRef.current = setInterval(extractVideoColors, AMBIENT_CONFIG.updateInterval);

      return () => {
        if (ambientIntervalRef.current) {
          clearInterval(ambientIntervalRef.current);
          ambientIntervalRef.current = null;
        }
      };
    }
  }, [isPlaying, extractVideoColors]);

  // Enter Picture-in-Picture mode
  const enterPiP = useCallback(async () => {
    const video = getVideoElement();
    if (!video || isInPiP) return;

    try {
      if (document.pictureInPictureEnabled && !document.pictureInPictureElement) {
        await video.requestPictureInPicture();
        setIsInPiP(true);
      }
    } catch {
      // PiP not available
    }
  }, [getVideoElement, isInPiP]);

  // Exit Picture-in-Picture mode
  const exitPiP = useCallback(async () => {
    if (!isInPiP) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsInPiP(false);
      }
    } catch {
      // Error exiting PiP
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

  // IntersectionObserver for auto-play and PiP - ALWAYS ACTIVE
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const visibilityRatio = entry.intersectionRatio;

          // Auto-play when >50% visible (NO CLICK REQUIRED)
          // This handles the case where user scrolls down to reveal video
          if (visibilityRatio > 0.5 && !hasAutoPlayed.current && isVideoReady) {
            console.log(`[SmartDetection] Observer: ${(visibilityRatio * 100).toFixed(0)}% visible, triggering auto-play`);
            attemptAutoPlay();
          }

          // Enter PiP when <30% visible and video is playing
          if (visibilityRatio < 0.3 && isPlaying && !isInPiP) {
            console.log('[SmartDetection] Video <30% visible, entering PiP mode');
            enterPiP();
          }

          // Exit PiP when >50% visible again
          if (visibilityRatio > 0.5 && isInPiP) {
            console.log('[SmartDetection] Video >50% visible again, exiting PiP mode');
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
  }, [isPlaying, isInPiP, isVideoReady, attemptAutoPlay, enterPiP, exitPiP]);

  // Handle click to play/pause
  const handleVideoClick = useCallback(() => {
    console.log('[SmartDetection] Click detected, searching for video...');

    const video = getVideoElement();
    if (!video) {
      console.log('[SmartDetection] ❌ Click: No video element found');
      // Try one more time with a small delay
      setTimeout(() => {
        const retryVideo = getVideoElement();
        if (retryVideo) {
          console.log('[SmartDetection] ✅ Found video on retry');
          if (retryVideo.paused) {
            retryVideo.volume = AUTO_PLAY_VOLUME;
            retryVideo.muted = false;
            retryVideo.play().catch(() => {
              retryVideo.muted = true;
              retryVideo.play().catch(() => {});
            });
            setIsPlaying(true);
          }
        }
      }, 100);
      return;
    }

    console.log('[SmartDetection] Click: Video found, paused:', video.paused);

    if (video.paused) {
      video.volume = AUTO_PLAY_VOLUME;
      video.muted = false;
      video.play().then(() => {
        console.log('[SmartDetection] ✅ Manual play SUCCESS');
        setIsPlaying(true);
        setIsMuted(false);
        hasAutoPlayed.current = true;
      }).catch((err) => {
        console.log('[SmartDetection] Manual play blocked, trying muted:', err.message);
        video.muted = true;
        setIsMuted(true);
        video.play().then(() => {
          console.log('[SmartDetection] ✅ Manual play SUCCESS (muted)');
          setIsPlaying(true);
          hasAutoPlayed.current = true;
        }).catch((err2) => {
          console.log('[SmartDetection] ❌ Manual play completely blocked:', err2.message);
        });
      });
    } else {
      console.log('[SmartDetection] Pausing video');
      video.pause();
      setIsPlaying(false);
    }
  }, [getVideoElement]);

  // Handle MuxPlayer loaded event
  const handleVideoLoaded = useCallback(() => {
    console.log('[SmartDetection] MuxPlayer fired loaded event');
    // Don't set ready immediately - give MuxPlayer time to fully render
    // MuxPlayer needs extra time to inject video element into DOM
    setTimeout(() => {
      console.log('[SmartDetection] Setting video ready after delay');
      setIsVideoReady(true);
    }, 300);
  }, []);

  // CRITICAL: When video becomes ready, check visibility and auto-play
  // This is needed because IntersectionObserver only fires on CHANGES,
  // not on initial state. If video loads while already visible, we need
  // to manually trigger auto-play.
  useEffect(() => {
    if (!isVideoReady || hasAutoPlayed.current) return;

    console.log('[SmartDetection] Video ready, starting auto-play sequence...');

    let attempts = 0;
    const maxAttempts = 10;

    // Retry function - MuxPlayer may need multiple attempts to find video element
    const checkAndPlay = () => {
      attempts++;
      console.log(`[SmartDetection] Auto-play attempt ${attempts}/${maxAttempts}`);

      const video = getVideoElement();

      if (!video) {
        if (attempts < maxAttempts) {
          console.log('[SmartDetection] Video element not ready, retrying in 200ms...');
          setTimeout(checkAndPlay, 200);
          return;
        } else {
          console.log('[SmartDetection] ❌ Failed to find video element after max attempts');
          return;
        }
      }

      console.log('[SmartDetection] ✅ Video element found!');

      const visibility = getVisibilityRatio();
      console.log(`[SmartDetection] Current visibility: ${(visibility * 100).toFixed(0)}%`);

      if (visibility > 0.5) {
        console.log('[SmartDetection] Video >50% visible, triggering auto-play');
        attemptAutoPlay();
      } else {
        console.log('[SmartDetection] Video not visible enough yet, waiting for scroll');
      }
    };

    // Start checking after initial delay for MuxPlayer to fully render
    const timeoutId = setTimeout(checkAndPlay, 500);
    return () => clearTimeout(timeoutId);
  }, [isVideoReady, getVisibilityRatio, attemptAutoPlay, getVideoElement]);

  const handleVideoEnd = useCallback(() => {
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

  // Dynamic ambient gradient
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

        {/* Title Panel - Above video (glass effect) */}
        {title && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 text-center"
          >
            <div className="inline-block px-4 py-2 rounded-full bg-black/30 dark:bg-white/10 backdrop-blur-md border border-white/10">
              <span className="text-white/90 text-sm font-medium">{title}</span>
            </div>
          </motion.div>
        )}

        {/* AMBIENT GLOW LAYER - Behind the video (concentrated, half size) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{
            opacity: isPlaying ? 1 : 0.4,
            scale: 1.05
          }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute inset-4 -z-10 pointer-events-none mx-auto max-w-2xl"
          style={{
            background: ambientGradient,
            filter: 'blur(50px)',
            opacity: 0.4,
            borderRadius: '40px',
            animation: isPlaying ? 'ambientPulse 4s ease-in-out infinite' : 'none',
          }}
        />

        {/* === GRAVITATIONAL DISTORTION - Symmetric Radial Shadow === */}
        {/* Shadow emanates uniformly from video edges in all directions */}
        <div className="relative mx-auto max-w-2xl">

        {/* Video Container with Floating Animation */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{
            opacity: 1,
            y: [0, -8, 0],
            scale: 1
          }}
          transition={{
            opacity: { duration: 0.6, ease: 'easeOut' },
            y: { duration: 6, ease: 'easeInOut', repeat: Infinity },
            scale: { duration: 0.6, ease: 'easeOut' }
          }}
          className="relative rounded-3xl overflow-hidden"
          style={{
            /* Concentrated box-shadow - half distance for tighter effect */
            boxShadow: `
              0 4px 15px rgba(0, 0, 0, 0.4),
              0 8px 25px rgba(0, 0, 0, 0.3),
              0 15px 40px rgba(0, 0, 0, 0.2)
            `,
            /* Hardware acceleration to prevent mobile repaint glitches */
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          {/* Video Frame - Clean edges with border-radius on ALL layers */}
          <div
            className="relative rounded-3xl overflow-hidden cursor-pointer"
            onClick={handleVideoClick}
            style={{
              /* Ensure this layer also has hardware acceleration */
              transform: 'translateZ(0)',
            }}
          >
            {/* Aspect ratio container - CRITICAL: Must have border-radius to prevent ghost corners */}
            <div
              className="relative aspect-video bg-black rounded-3xl overflow-hidden"
              style={{
                /* Hardware acceleration prevents repaint glitches on mobile scroll/touch */
                transform: 'translateZ(0)',
                backfaceVisibility: 'hidden',
              }}
            >
              {/* MuxPlayer - ALWAYS RENDERED, NO OVERLAY */}
              {/* CRITICAL: MuxPlayer is a Web Component with Shadow DOM - must have explicit border-radius */}
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
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                style={{
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  /* CRITICAL: border-radius on MuxPlayer itself to prevent ghost corners */
                  borderRadius: '1.5rem',
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

              {/* Simple Play Overlay - Only when paused and ready */}
              {/* CRITICAL: Must have rounded-3xl to prevent ghost corners */}
              {!isPlaying && isVideoReady && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none rounded-3xl"
                >
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
                  >
                    <Play className="w-8 h-8 text-white ml-1" fill="white" />
                  </motion.div>
                </motion.div>
              )}
            </div>

            {/* Shimmer effect on frame edge when playing */}
            {isPlaying && (
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

          {/* Volume control - Always visible */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-3 right-3 z-30"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleMute();
              }}
              className="p-2.5 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 hover:scale-110 transition-all shadow-lg border border-white/10"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
          </motion.div>
        </motion.div>

        </div>
        {/* End of GRAVITATIONAL DISTORTION LAYERS container */}

        {/* Video Experience Hint - EXACT same component as Home VideoCarousel */}
        {/* Shows animated mouse + 2× for Desktop, Rotate phone for Mobile */}
        <div className="mt-3 relative z-10">
          <VideoExperienceHint />
        </div>

        {/* Description Below - Normal text with subtle shadow only, no glow */}
        {description && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-sm text-cyan-300/80 mt-3 max-w-md mx-auto relative z-10"
            style={{
              textShadow: '0 1px 3px rgba(0,0,0,0.5)',
            }}
          >
            {description}
          </motion.p>
        )}
      </div>
    </>
  );
}

export default EmbeddedVideoDevice;
