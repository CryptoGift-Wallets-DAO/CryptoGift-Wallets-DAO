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
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [showUnmuteHint, setShowUnmuteHint] = useState(false);
  const [isFirefox, setIsFirefox] = useState(false);

  // Ambient Mode state
  const [ambientColors, setAmbientColors] = useState({
    dominant: 'rgba(139, 92, 246, 0.4)',
    secondary: 'rgba(6, 182, 212, 0.3)',
    accent: 'rgba(168, 85, 247, 0.35)'
  });

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const ambientIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasAutoPlayed = useRef(false);

  // CRITICAL: Unique DOM ID for MuxPlayer - dynamic() doesn't forward refs!
  const muxPlayerId = `mux-player-${lessonId}`;

  // Detect Firefox browser (doesn't support standard PiP API)
  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      const isFF = navigator.userAgent.toLowerCase().includes('firefox');
      setIsFirefox(isFF);
      if (isFF) {
        console.log('[SmartDetection] Firefox detected - standard PiP API not supported');
        console.log('[SmartDetection] Users can use Firefox native PiP (right-click video or use toolbar icon)');
      }
    }
  }, []);

  // Get MuxPlayer via DOM - find mux-player element inside wrapper div
  // (React ref doesn't work with dynamic imports)
  const getMuxPlayer = useCallback((): any => {
    if (typeof document === 'undefined') return null;
    const wrapper = document.getElementById(muxPlayerId);
    if (!wrapper) return null;
    // MuxPlayer renders as <mux-player> web component
    return wrapper.querySelector('mux-player');
  }, [muxPlayerId]);

  // AUDIO UNLOCK SYSTEM - Unlocks audio on first user interaction
  // Browsers block unmuted autoplay until user interacts with the page
  // This effect adds a one-time listener that tries to unmute after any click/touch
  useEffect(() => {
    if (audioUnlocked) return; // Already unlocked

    const unlockAudio = () => {
      console.log('[AudioUnlock] User interaction detected, attempting to unlock audio...');
      setAudioUnlocked(true);

      // If video is playing muted, try to unmute it now
      const player = getMuxPlayer();
      if (player && isPlaying && isMuted) {
        try {
          player.muted = false;
          player.volume = AUTO_PLAY_VOLUME;
          setIsMuted(false);
          setShowUnmuteHint(false);
          console.log('[AudioUnlock] ✅ Audio unlocked and video unmuted!');
        } catch (e) {
          console.log('[AudioUnlock] Could not unmute:', e);
        }
      }

      // Remove listeners after first interaction
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };

    // Add listeners for any user interaction
    document.addEventListener('click', unlockAudio, { once: true, passive: true });
    document.addEventListener('touchstart', unlockAudio, { once: true, passive: true });
    document.addEventListener('keydown', unlockAudio, { once: true, passive: true });

    return () => {
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };
  }, [audioUnlocked, isPlaying, isMuted, getMuxPlayer]);

  // Show unmute hint when video is playing muted
  useEffect(() => {
    if (isPlaying && isMuted && !audioUnlocked) {
      // Show hint after a short delay (give browser time to potentially allow audio)
      const timer = setTimeout(() => {
        if (isMuted) {
          setShowUnmuteHint(true);
          console.log('[AudioUnlock] Showing unmute hint - click anywhere to enable audio');
        }
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setShowUnmuteHint(false);
    }
  }, [isPlaying, isMuted, audioUnlocked]);

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
  // USES MuxPlayer API via DOM ID - dynamic() doesn't forward refs!
  const attemptAutoPlay = useCallback(() => {
    if (hasAutoPlayed.current) {
      console.log('[SmartDetection] Already auto-played, skipping');
      return;
    }

    const player = getMuxPlayer();
    if (!player) {
      console.log('[SmartDetection] ❌ MuxPlayer not found in DOM');
      return;
    }

    console.log('[SmartDetection] ✅ MuxPlayer found via DOM ID!');

    console.log('[SmartDetection] Attempting auto-play via MuxPlayer API...');

    // Set volume first using MuxPlayer API
    try {
      player.volume = AUTO_PLAY_VOLUME;
      player.muted = false;
      setVolume(AUTO_PLAY_VOLUME);
      setIsMuted(false);
    } catch (e) {
      console.log('[SmartDetection] Error setting volume:', e);
    }

    // MuxPlayer exposes play() method directly
    const playPromise = player.play();

    if (playPromise && typeof playPromise.then === 'function') {
      playPromise.then(() => {
        console.log('[SmartDetection] ✅ Auto-play SUCCESS with audio at 15% volume');
        hasAutoPlayed.current = true;
        setIsPlaying(true);
        setIsMuted(false);
        setVolume(AUTO_PLAY_VOLUME);
      }).catch((err: Error) => {
        console.log('[SmartDetection] ⚠️ Auto-play with audio blocked:', err.name, err.message);
        // Fallback: try muted (browsers often require muted for auto-play)
        player.muted = true;
        setIsMuted(true);

        const mutedPlayPromise = player.play();
        if (mutedPlayPromise && typeof mutedPlayPromise.then === 'function') {
          mutedPlayPromise.then(() => {
            console.log('[SmartDetection] ✅ Auto-play SUCCESS (muted fallback)');
            hasAutoPlayed.current = true;
            setIsPlaying(true);
            setIsMuted(true);
          }).catch((err2: Error) => {
            console.log('[SmartDetection] ❌ Auto-play completely blocked:', err2.name, err2.message);
          });
        }
      });
    }
  }, [getMuxPlayer]);

  // Extract colors from video frame for Ambient Mode
  // NOTE: MuxPlayer uses closed Shadow DOM, so we use animated fallback colors
  // The colors cycle smoothly to create a dynamic ambient effect
  const extractVideoColors = useCallback(() => {
    if (!isPlaying) return;

    // Create subtle color animation based on time
    const time = Date.now() / 5000; // Slow cycle
    const r1 = Math.round(139 + Math.sin(time) * 30);
    const g1 = Math.round(92 + Math.sin(time + 1) * 30);
    const b1 = Math.round(246 + Math.sin(time + 2) * 9);

    const r2 = Math.round(6 + Math.sin(time + 2) * 6);
    const g2 = Math.round(182 + Math.sin(time) * 30);
    const b2 = Math.round(212 + Math.sin(time + 1) * 30);

    const r3 = Math.round(168 + Math.sin(time + 1) * 30);
    const g3 = Math.round(85 + Math.sin(time + 2) * 30);
    const b3 = Math.round(247 + Math.sin(time) * 8);

    setAmbientColors({
      dominant: `rgba(${r1}, ${g1}, ${b1}, 0.5)`,
      secondary: `rgba(${r2}, ${g2}, ${b2}, 0.4)`,
      accent: `rgba(${r3}, ${g3}, ${b3}, 0.45)`
    });
  }, [isPlaying]);

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

  // Track if we've already tried PiP (to prevent spam)
  const pipAttempted = useRef(false);

  // Get underlying video element from MuxPlayer
  // MuxPlayer uses Shadow DOM, so we need to try multiple access methods
  const getVideoElement = useCallback((): HTMLVideoElement | null => {
    const player = getMuxPlayer();
    if (!player) return null;

    // Method 1: Try Shadow DOM first (most reliable for actual video element)
    if (player.shadowRoot) {
      // Try direct video query in shadowRoot
      let video = player.shadowRoot.querySelector('video');
      if (video && video instanceof HTMLVideoElement) {
        console.log('[SmartDetection] Found video via shadowRoot.querySelector');
        return video;
      }

      // Try via media-controller (MuxPlayer v2+ structure)
      const mediaController = player.shadowRoot.querySelector('media-controller');
      if (mediaController) {
        // media-controller might have its own shadowRoot
        if (mediaController.shadowRoot) {
          video = mediaController.shadowRoot.querySelector('video');
          if (video && video instanceof HTMLVideoElement) {
            console.log('[SmartDetection] Found video via media-controller shadowRoot');
            return video;
          }
        }
        // Or video might be slotted/direct child
        video = mediaController.querySelector('video');
        if (video && video instanceof HTMLVideoElement) {
          console.log('[SmartDetection] Found video via media-controller querySelector');
          return video;
        }
      }

      // Try via media-theme container (older MuxPlayer structure)
      const mediaTheme = player.shadowRoot.querySelector('media-theme');
      if (mediaTheme) {
        if (mediaTheme.shadowRoot) {
          video = mediaTheme.shadowRoot.querySelector('video');
          if (video && video instanceof HTMLVideoElement) {
            console.log('[SmartDetection] Found video via media-theme shadowRoot');
            return video;
          }
        }
        video = mediaTheme.querySelector('video');
        if (video && video instanceof HTMLVideoElement) {
          console.log('[SmartDetection] Found video via media-theme querySelector');
          return video;
        }
      }
    }

    // Method 2: MuxPlayer's media property
    if (player.media) {
      const mediaEl = player.media.nativeEl || player.media;
      // Check if it's a real HTMLVideoElement with PiP support
      if (mediaEl && mediaEl.tagName === 'VIDEO' && typeof mediaEl.requestPictureInPicture === 'function') {
        console.log('[SmartDetection] Found video via player.media (with PiP support)');
        return mediaEl as HTMLVideoElement;
      }
      console.log('[SmartDetection] player.media exists but no PiP:', {
        tagName: mediaEl?.tagName,
        hasPiP: typeof mediaEl?.requestPictureInPicture
      });
    }

    // Method 3: Fallback - direct querySelector (unlikely but try)
    const directVideo = player.querySelector('video');
    if (directVideo && directVideo instanceof HTMLVideoElement) {
      console.log('[SmartDetection] Found video via direct querySelector');
      return directVideo;
    }

    console.log('[SmartDetection] Could not find video element with PiP support');
    console.log('[SmartDetection] shadowRoot:', player.shadowRoot ? 'accessible' : 'closed/null');
    console.log('[SmartDetection] PiP enabled in browser:', document.pictureInPictureEnabled);
    return null;
  }, [getMuxPlayer]);

  // Enter Picture-in-Picture mode
  // MuxPlayer uses Shadow DOM - we try multiple methods to find the video element
  // NOTE: Firefox does NOT support the standard PiP API (document.pictureInPictureEnabled)
  // Firefox users must use the native PiP button (right-click video or toolbar icon)
  const enterPiP = useCallback(async () => {
    // Prevent spam attempts
    if (pipAttempted.current || isInPiP) return;

    const player = getMuxPlayer();
    if (!player) return;

    // Mark that we've attempted PiP (will be reset when video becomes visible again)
    pipAttempted.current = true;

    // Firefox doesn't support standard PiP API - skip silently
    // Users can use Firefox's native PiP (right-click → Watch in Picture-in-Picture)
    if (isFirefox) {
      console.log('[SmartDetection] Firefox: Standard PiP API not supported');
      console.log('[SmartDetection] Firefox users: Right-click video → "Watch in Picture-in-Picture"');
      return;
    }

    // Check browser support first (Chrome, Edge, Safari)
    if (typeof document.pictureInPictureEnabled === 'undefined' || !document.pictureInPictureEnabled) {
      console.log('[SmartDetection] PiP not supported by this browser');
      return;
    }

    try {
      const video = getVideoElement();

      if (!video) {
        console.log('[SmartDetection] PiP: No video element found');
        return;
      }

      if (typeof video.requestPictureInPicture !== 'function') {
        console.log('[SmartDetection] PiP: requestPictureInPicture not available on video');
        return;
      }

      if (document.pictureInPictureElement) {
        console.log('[SmartDetection] PiP: Already in PiP mode');
        return;
      }

      await video.requestPictureInPicture();
      setIsInPiP(true);
      console.log('[SmartDetection] ✅ Entered PiP mode');
    } catch (e: any) {
      console.log('[SmartDetection] PiP error:', e.name, e.message);
    }
  }, [isInPiP, isFirefox, getMuxPlayer, getVideoElement]);

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
    if (!isVideoReady) return;

    // Get the underlying video element using our multi-method approach
    const video = getVideoElement();
    if (!video) return;

    const handlePiPEnter = () => {
      setIsInPiP(true);
      console.log('[SmartDetection] PiP event: entered');
    };
    const handlePiPLeave = () => {
      setIsInPiP(false);
      console.log('[SmartDetection] PiP event: left');
    };

    video.addEventListener('enterpictureinpicture', handlePiPEnter);
    video.addEventListener('leavepictureinpicture', handlePiPLeave);

    return () => {
      video.removeEventListener('enterpictureinpicture', handlePiPEnter);
      video.removeEventListener('leavepictureinpicture', handlePiPLeave);
    };
  }, [isVideoReady, getVideoElement]);

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

          // Reset PiP attempt flag when video is visible (so we can try again next time)
          if (visibilityRatio > 0.5) {
            pipAttempted.current = false;
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
  // USES MuxPlayer API via DOM ID
  const handleVideoClick = useCallback(() => {
    console.log('[SmartDetection] Click detected');

    const player = getMuxPlayer();
    if (!player) {
      console.log('[SmartDetection] ❌ Click: MuxPlayer not found in DOM');
      return;
    }

    console.log('[SmartDetection] ✅ Click: MuxPlayer found via DOM ID');

    // Check if paused using MuxPlayer API
    const isPaused = player.paused;
    console.log('[SmartDetection] Click: MuxPlayer paused:', isPaused);

    if (isPaused) {
      // Set volume and unmute
      player.volume = AUTO_PLAY_VOLUME;
      player.muted = false;
      setVolume(AUTO_PLAY_VOLUME);
      setIsMuted(false);

      const playPromise = player.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.then(() => {
          console.log('[SmartDetection] ✅ Manual play SUCCESS');
          setIsPlaying(true);
          setIsMuted(false);
          hasAutoPlayed.current = true;
        }).catch((err: Error) => {
          console.log('[SmartDetection] Manual play blocked, trying muted:', err.message);
          player.muted = true;
          setIsMuted(true);

          const mutedPlayPromise = player.play();
          if (mutedPlayPromise && typeof mutedPlayPromise.then === 'function') {
            mutedPlayPromise.then(() => {
              console.log('[SmartDetection] ✅ Manual play SUCCESS (muted)');
              setIsPlaying(true);
              hasAutoPlayed.current = true;
            }).catch((err2: Error) => {
              console.log('[SmartDetection] ❌ Manual play completely blocked:', err2.message);
            });
          }
        });
      }
    } else {
      console.log('[SmartDetection] Pausing video');
      player.pause();
      setIsPlaying(false);
    }
  }, [getMuxPlayer]);

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

    let retryCount = 0;
    const maxRetries = 10;

    // Check visibility and attempt auto-play
    const checkAndPlay = () => {
      const player = getMuxPlayer();

      if (!player) {
        retryCount++;
        if (retryCount < maxRetries) {
          console.log(`[SmartDetection] MuxPlayer not in DOM yet, retry ${retryCount}/${maxRetries}...`);
          setTimeout(checkAndPlay, 300);
        } else {
          console.log('[SmartDetection] ❌ MuxPlayer never appeared in DOM after max retries');
        }
        return;
      }

      console.log('[SmartDetection] ✅ MuxPlayer found in DOM via getElementById!');

      const visibility = getVisibilityRatio();
      console.log(`[SmartDetection] Current visibility: ${(visibility * 100).toFixed(0)}%`);

      if (visibility > 0.5) {
        console.log('[SmartDetection] Video >50% visible, triggering auto-play');
        attemptAutoPlay();
      } else {
        console.log('[SmartDetection] Video not visible enough yet, waiting for scroll');
      }
    };

    // Start checking after delay for MuxPlayer to fully initialize in DOM
    const timeoutId = setTimeout(checkAndPlay, 600);
    return () => clearTimeout(timeoutId);
  }, [isVideoReady, getVisibilityRatio, attemptAutoPlay, getMuxPlayer]);

  const handleVideoEnd = useCallback(() => {
    localStorage.setItem(`video_seen:${lessonId}`, 'completed');
    setIsPlaying(false);
    exitPiP();
    onVideoComplete?.();
  }, [lessonId, onVideoComplete, exitPiP]);

  // Toggle mute using MuxPlayer API via DOM ID
  const toggleMute = useCallback(() => {
    const player = getMuxPlayer();
    if (player) {
      const newMuted = !player.muted;
      player.muted = newMuted;
      setIsMuted(newMuted);
      if (!newMuted) {
        player.volume = volume;
      }
      console.log('[SmartDetection] Mute toggled:', newMuted ? 'muted' : 'unmuted');
    }
  }, [volume, getMuxPlayer]);

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
            /* Symmetric box-shadow - equal in ALL directions (no vertical offset) */
            boxShadow: `
              0 0 15px rgba(0, 0, 0, 0.4),
              0 0 25px rgba(0, 0, 0, 0.3),
              0 0 40px rgba(0, 0, 0, 0.2)
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
              {/* CRITICAL: Wrapper div with ID - dynamic() doesn't forward refs to MuxPlayer! */}
              <div id={muxPlayerId} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
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
              </div>

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

              {/* AUDIO UNLOCK HINT - Shows when video plays muted due to browser policy */}
              {/* Clicking anywhere on the page will unlock audio */}
              {showUnmuteHint && isPlaying && isMuted && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 pointer-events-none"
                >
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-black/70 backdrop-blur-md border border-white/20 shadow-xl">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <VolumeX className="w-4 h-4 text-amber-400" />
                    </motion.div>
                    <span className="text-white text-sm font-medium whitespace-nowrap">
                      Click anywhere to enable audio
                    </span>
                  </div>
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
