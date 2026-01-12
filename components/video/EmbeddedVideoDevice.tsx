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
import { Play, Volume2, VolumeX, Minimize2, X, Maximize2 } from 'lucide-react';
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

// Auto-play volume (0.0 to 1.0) - 30% as requested
const AUTO_PLAY_VOLUME = 0.30;

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
  const [isMobile, setIsMobile] = useState(false);
  const [showClickToPlay, setShowClickToPlay] = useState(false); // PC: Show click to play overlay
  const [showPiPBanner, setShowPiPBanner] = useState(false); // Mobile: Show PiP invitation banner
  const [bannerPosition, setBannerPosition] = useState<'top' | 'bottom'>('bottom'); // Where video is hiding

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

  // Detect Firefox browser and Mobile device
  useEffect(() => {
    if (typeof navigator !== 'undefined' && typeof window !== 'undefined') {
      // Firefox detection
      const isFF = navigator.userAgent.toLowerCase().includes('firefox');
      setIsFirefox(isFF);

      // Mobile detection - comprehensive check including DevTools responsive mode
      const checkMobile = () => {
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const isSmallScreen = window.innerWidth < 768;
        const mobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        // DevTools responsive mode detection: small screen OR mobile UA
        // This catches when developer is testing mobile view in browser
        const isMobileView = isSmallScreen || mobileUA;

        // For actual mobile devices, both touch AND (small screen OR mobile UA) are true
        // For DevTools: usually just small screen is true
        const result = (isTouchDevice && isMobileView) || mobileUA || isSmallScreen;

        console.log('[SmartDetection] Mobile check:', {
          isTouchDevice,
          isSmallScreen,
          mobileUA,
          screenWidth: window.innerWidth,
          result
        });

        return result;
      };

      const mobile = checkMobile();
      setIsMobile(mobile);
      console.log('[SmartDetection] Device type:', mobile ? 'MOBILE' : 'PC');

      // Listen for window resize (DevTools responsive mode changes)
      const handleResize = () => {
        const newMobile = checkMobile();
        if (newMobile !== mobile) {
          setIsMobile(newMobile);
          console.log('[SmartDetection] Device type changed to:', newMobile ? 'MOBILE' : 'PC');
        }
      };

      window.addEventListener('resize', handleResize);

      // PC: Show "Click to Play" overlay (video starts paused)
      // Mobile: Auto-play works with audio
      if (!mobile) {
        setShowClickToPlay(true);
        console.log('[SmartDetection] PC mode: Video will start PAUSED, click to play with audio');
      }

      return () => {
        window.removeEventListener('resize', handleResize);
      };
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
  // MuxPlayer uses Shadow DOM - we search recursively through all shadow roots
  const getVideoElement = useCallback((): HTMLVideoElement | null => {
    const player = getMuxPlayer();
    if (!player) return null;

    // Recursive function to search for video in shadow DOMs
    const findVideoRecursive = (root: Element | ShadowRoot | Document): HTMLVideoElement | null => {
      // Direct search in this root
      const video = root.querySelector('video');
      if (video && video instanceof HTMLVideoElement) {
        return video;
      }

      // Search in all elements that might have shadowRoot
      const elements = root.querySelectorAll('*');
      for (const el of elements) {
        if (el.shadowRoot) {
          const found = findVideoRecursive(el.shadowRoot);
          if (found) return found;
        }
      }

      return null;
    };

    // Method 1: Search recursively in player's shadowRoot
    if (player.shadowRoot) {
      const video = findVideoRecursive(player.shadowRoot);
      if (video) {
        console.log('[SmartDetection] Found video via recursive shadowRoot search');
        console.log('[SmartDetection] Video has PiP:', typeof video.requestPictureInPicture);
        return video;
      }
    }

    // Method 2: MuxPlayer's media property (don't filter by PiP - just return the video)
    if (player.media) {
      const mediaEl = player.media.nativeEl || player.media;
      if (mediaEl && mediaEl.tagName === 'VIDEO') {
        console.log('[SmartDetection] Found video via player.media');
        console.log('[SmartDetection] Video has PiP:', typeof mediaEl.requestPictureInPicture);
        return mediaEl as HTMLVideoElement;
      }
    }

    // Method 3: Direct querySelector on player
    const directVideo = player.querySelector('video');
    if (directVideo && directVideo instanceof HTMLVideoElement) {
      console.log('[SmartDetection] Found video via direct querySelector');
      return directVideo;
    }

    // Method 4: Search entire document as fallback
    const allVideos = document.querySelectorAll('video');
    for (const v of allVideos) {
      if (v instanceof HTMLVideoElement && !v.paused) {
        console.log('[SmartDetection] Found playing video in document');
        return v;
      }
    }

    console.log('[SmartDetection] Could not find video element');
    return null;
  }, [getMuxPlayer]);

  // ============================================================================
  // CSS MINI PLAYER - Universal PiP alternative (works on ALL browsers)
  // ============================================================================
  // Native PiP API doesn't work with MuxPlayer (video element doesn't expose it)
  // Instead, we use CSS position:fixed to create a floating mini player
  // ============================================================================

  // Enter CSS Mini Player mode (NOT native PiP)
  const enterPiP = useCallback(() => {
    if (pipAttempted.current || isInPiP) return;

    pipAttempted.current = true;
    setIsInPiP(true);
    console.log('[SmartDetection] ✅ Entered CSS Mini Player mode (universal fallback)');
  }, [isInPiP]);

  // Exit CSS Mini Player mode
  const exitPiP = useCallback(() => {
    if (!isInPiP) return;
    setIsInPiP(false);
    console.log('[SmartDetection] Exited CSS Mini Player mode');
  }, [isInPiP]);

  // Placeholder ref - this is what we observe, NOT the floating video
  const placeholderRef = useRef<HTMLDivElement>(null);

  // IntersectionObserver for auto-play and PiP trigger
  // IMPORTANT: We observe the PLACEHOLDER, not the video container
  // The video floats away but the placeholder stays in place
  useEffect(() => {
    // Use placeholder if in PiP mode, otherwise use container
    const elementToObserve = isInPiP ? placeholderRef.current : containerRef.current;
    if (!elementToObserve) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const visibilityRatio = entry.intersectionRatio;

          // WHEN IN PIP MODE: Only track placeholder visibility for potential auto-close
          // But we DON'T auto-close - user must use mini player controls
          if (isInPiP) {
            // Just log, don't auto-exit (that caused the infinite loop!)
            // User must click Expand or Close buttons
            if (visibilityRatio > 0.7) {
              console.log('[SmartDetection] Placeholder >70% visible - user can click Expand to return');
            }
            return; // Don't process anything else when in PiP mode
          }

          // === NORMAL MODE (not in PiP) ===

          // Auto-play when >50% visible - MOBILE ONLY (PC stays paused until click)
          if (visibilityRatio > 0.5 && !hasAutoPlayed.current && isVideoReady && isMobile) {
            console.log(`[SmartDetection] MOBILE Observer: ${(visibilityRatio * 100).toFixed(0)}% visible, triggering auto-play`);
            attemptAutoPlay();
          }

          // Mobile: Show PiP banner when <50% visible and playing
          if (isMobile && isPlaying && visibilityRatio < 0.5) {
            const rect = entry.boundingClientRect;
            const windowHeight = window.innerHeight;
            const isHidingTop = rect.top < 0;

            setBannerPosition(isHidingTop ? 'top' : 'bottom');
            setShowPiPBanner(true);
            console.log('[SmartDetection] MOBILE: Video <50% visible, showing PiP banner at', isHidingTop ? 'TOP' : 'BOTTOM');
          }

          // PC: Auto-enter PiP at <30% visible and playing
          if (!isMobile && visibilityRatio < 0.3 && isPlaying) {
            console.log('[SmartDetection] PC: Video <30% visible, entering mini player mode');
            enterPiP();
          }

          // Hide PiP banner when >50% visible again (mobile)
          if (visibilityRatio > 0.5) {
            setShowPiPBanner(false);
            pipAttempted.current = false;
          }
        });
      },
      {
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
        rootMargin: '0px'
      }
    );

    observer.observe(elementToObserve);
    return () => observer.disconnect();
  }, [isPlaying, isInPiP, isVideoReady, isMobile, attemptAutoPlay, enterPiP]);

  // Handle click to play/pause
  // PC MODE: Click = Play + Unmute + PiP (triple action)
  // MOBILE MODE: Click = Play + Unmute (PiP via banner)
  const handleVideoClick = useCallback(() => {
    console.log('[SmartDetection] Click detected');

    const player = getMuxPlayer();
    if (!player) {
      console.log('[SmartDetection] ❌ Click: MuxPlayer not found in DOM');
      return;
    }

    console.log('[SmartDetection] ✅ Click: MuxPlayer found via DOM ID');

    // Hide "Click to Play" overlay on PC
    if (showClickToPlay) {
      setShowClickToPlay(false);
    }

    // Check if paused using MuxPlayer API
    const isPaused = player.paused;
    console.log('[SmartDetection] Click: MuxPlayer paused:', isPaused);

    if (isPaused) {
      // Set volume and unmute
      player.volume = AUTO_PLAY_VOLUME;
      player.muted = false;
      setVolume(AUTO_PLAY_VOLUME);
      setIsMuted(false);
      setAudioUnlocked(true); // Mark audio as unlocked

      const playPromise = player.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.then(() => {
          console.log('[SmartDetection] ✅ Manual play SUCCESS with audio');
          setIsPlaying(true);
          setIsMuted(false);
          hasAutoPlayed.current = true;

          // PC MODE: Also enter PiP immediately after play (triple action)
          if (!isMobile) {
            console.log('[SmartDetection] PC MODE: Entering PiP after play (triple action)');
            // Small delay to ensure video is playing before PiP
            setTimeout(() => {
              enterPiP();
            }, 300);
          }
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

              // PC MODE: Also enter PiP (muted version)
              if (!isMobile) {
                setTimeout(() => {
                  enterPiP();
                }, 300);
              }
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
  }, [getMuxPlayer, showClickToPlay, isMobile, enterPiP]);

  // FULLSCREEN - Double-click to enter/exit fullscreen
  // Supports: Chrome, Firefox, Safari, iOS Safari, Android
  const handleDoubleClick = useCallback(() => {
    console.log('[SmartDetection] Double-click detected, toggling fullscreen');

    const player = getMuxPlayer();
    if (!player) {
      console.log('[SmartDetection] Fullscreen: No player found');
      return;
    }

    // Use global getVideoElement function (recursive search)
    const video = getVideoElement();
    console.log('[SmartDetection] Fullscreen: Video found:', !!video);

    // Check if currently in fullscreen (various browser prefixes)
    const isCurrentlyFullscreen = !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    );

    if (isCurrentlyFullscreen) {
      // Exit fullscreen - try all methods
      console.log('[SmartDetection] Exiting fullscreen');
      if (document.exitFullscreen) {
        document.exitFullscreen().catch((e) => {
          console.log('[SmartDetection] Exit fullscreen error:', e);
        });
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    } else {
      // Enter fullscreen - try multiple methods for cross-browser support
      console.log('[SmartDetection] Entering fullscreen');

      // iOS Safari: Use webkitEnterFullscreen on the video element directly
      if (video && (video as any).webkitEnterFullscreen) {
        console.log('[SmartDetection] Using iOS webkitEnterFullscreen');
        try {
          (video as any).webkitEnterFullscreen();
          return;
        } catch (e) {
          console.log('[SmartDetection] iOS fullscreen error:', e);
        }
      }

      // Standard fullscreen API - try container first (includes controls), then video
      const elementToFullscreen = containerRef.current || player || video;

      if (elementToFullscreen) {
        if (elementToFullscreen.requestFullscreen) {
          elementToFullscreen.requestFullscreen().catch((e: Error) => {
            console.log('[SmartDetection] Fullscreen error:', e.message);
          });
        } else if ((elementToFullscreen as any).webkitRequestFullscreen) {
          (elementToFullscreen as any).webkitRequestFullscreen();
        } else if ((elementToFullscreen as any).mozRequestFullScreen) {
          (elementToFullscreen as any).mozRequestFullScreen();
        } else if ((elementToFullscreen as any).msRequestFullscreen) {
          (elementToFullscreen as any).msRequestFullscreen();
        } else {
          console.log('[SmartDetection] No fullscreen API available');
        }
      }
    }
  }, [getMuxPlayer, getVideoElement]);

  // MOBILE PiP Banner - Click to enter PiP mode
  const handlePiPBannerClick = useCallback(() => {
    console.log('[SmartDetection] MOBILE: PiP banner clicked, entering mini player mode');
    setShowPiPBanner(false);
    enterPiP();
  }, [enterPiP]);

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
  // PC: Video stays PAUSED, user must click to play (with audio)
  // Mobile: Auto-play with audio works normally
  useEffect(() => {
    if (!isVideoReady || hasAutoPlayed.current) return;

    // PC MODE: Don't auto-play, wait for user click
    if (!isMobile) {
      console.log('[SmartDetection] PC MODE: Video ready but staying PAUSED. User must click to play.');
      return;
    }

    // MOBILE MODE: Auto-play with audio
    console.log('[SmartDetection] MOBILE MODE: Video ready, starting auto-play sequence...');

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
  }, [isVideoReady, isMobile, getVisibilityRatio, attemptAutoPlay, getMuxPlayer]);

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

      {/* === PLACEHOLDER === */}
      {/* When video is in mini player mode, this placeholder reserves the space */}
      {/* The IntersectionObserver watches THIS element to know when user scrolls back */}
      {isInPiP && (
        <div
          ref={placeholderRef}
          className={`relative ${className}`}
        >
          {/* Placeholder content - shows a subtle indicator */}
          <div className="relative aspect-video bg-gradient-to-br from-slate-900/50 to-black/50 rounded-3xl border border-white/10 flex items-center justify-center">
            <div className="text-center">
              <Minimize2 className="w-8 h-8 text-white/30 mx-auto mb-2" />
              <p className="text-white/40 text-sm">Video playing in mini player</p>
              <button
                onClick={() => {
                  exitPiP();
                  placeholderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                className="mt-3 px-4 py-2 rounded-full bg-purple-600/80 hover:bg-purple-500 text-white text-sm font-medium transition-all"
              >
                Return video here
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main container with Ambient Mode - CSS Mini Player when isInPiP */}
      <div
        ref={!isInPiP ? containerRef : undefined}
        className={`relative ${className} ${
          isInPiP
            ? 'fixed bottom-4 right-4 w-72 md:w-80 z-[9999] shadow-2xl rounded-2xl'
            : ''
        }`}
        style={isInPiP ? {
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          maxWidth: '320px',
        } : undefined}
      >

        {/* Title Panel - Above video (glass effect) - Hidden in mini player */}
        {title && !isInPiP && (
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
        {/* Hidden in mini player mode for performance */}
        {!isInPiP && (
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
        )}

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
          {/* Double-click for FULLSCREEN (PC + Mobile) */}
          <div
            className="relative rounded-3xl overflow-hidden cursor-pointer"
            onClick={handleVideoClick}
            onDoubleClick={handleDoubleClick}
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

              {/* Play Overlay - Elegant small banner at BOTTOM CENTER (like captura 004012.png) */}
              {/* Shows when video is paused and ready - BOTH PC and Mobile */}
              {!isPlaying && isVideoReady && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-end pb-4 pointer-events-none rounded-3xl"
                >
                  {/* Center play button */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center border border-white/20"
                    >
                      <Play className="w-8 h-8 md:w-10 md:h-10 text-white ml-1" fill="white" />
                    </motion.div>
                  </motion.div>

                  {/* Elegant bottom banner - small, clean, non-intrusive */}
                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/20 shadow-lg"
                  >
                    <VolumeX className="w-4 h-4 text-amber-400" />
                    <span className="text-white text-sm font-medium">
                      Click anywhere to play
                    </span>
                  </motion.div>
                </motion.div>
              )}

              {/* AUDIO UNLOCK HINT - Small elegant banner when video plays muted */}
              {/* Same style as play banner - bottom center, non-intrusive */}
              {showUnmuteHint && isPlaying && isMuted && (
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 10, opacity: 0 }}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 pointer-events-none"
                >
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/20 shadow-lg">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    >
                      <VolumeX className="w-4 h-4 text-amber-400" />
                    </motion.div>
                    <span className="text-white text-sm font-medium">
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
            className="absolute top-3 right-3 z-30 flex gap-2"
          >
            {/* Mini Player Controls - Only show when in PiP mode */}
            {isInPiP && (
              <>
                {/* Expand button - Exit mini player and scroll to placeholder */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    exitPiP();
                    // Scroll to placeholder (where video will return)
                    setTimeout(() => {
                      placeholderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 50);
                  }}
                  className="p-2 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 hover:scale-110 transition-all shadow-lg border border-white/10"
                  title="Expand video"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
                {/* Close button - Close mini player and pause */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const player = getMuxPlayer();
                    if (player) player.pause();
                    setIsPlaying(false);
                    exitPiP();
                  }}
                  className="p-2 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-red-600/70 hover:scale-110 transition-all shadow-lg border border-white/10"
                  title="Close mini player"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            )}
            {/* Mute/Unmute button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleMute();
              }}
              className={`p-2.5 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 hover:scale-110 transition-all shadow-lg border border-white/10 ${isInPiP ? 'p-2' : 'p-2.5'}`}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <VolumeX className={isInPiP ? 'w-4 h-4' : 'w-5 h-5'} />
              ) : (
                <Volume2 className={isInPiP ? 'w-4 h-4' : 'w-5 h-5'} />
              )}
            </button>
          </motion.div>
        </motion.div>

        </div>
        {/* End of GRAVITATIONAL DISTORTION LAYERS container */}

        {/* Video Experience Hint - EXACT same component as Home VideoCarousel */}
        {/* Shows animated mouse + 2× for Desktop, Rotate phone for Mobile */}
        {/* Hidden in mini player mode */}
        {!isInPiP && (
          <div className="mt-3 relative z-10">
            <VideoExperienceHint />
          </div>
        )}

        {/* Description Below - Normal text with subtle shadow only, no glow */}
        {/* Hidden in mini player mode */}
        {description && !isInPiP && (
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

      {/* === MOBILE PiP BANNER === */}
      {/* Elegant banner that appears when video is >50% hidden on mobile */}
      {/* Positioned at the edge where video is disappearing */}
      {showPiPBanner && isMobile && (
        <motion.div
          initial={{
            opacity: 0,
            y: bannerPosition === 'top' ? -20 : 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            y: bannerPosition === 'top' ? -20 : 20,
          }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`fixed left-1/2 -translate-x-1/2 z-50 ${
            bannerPosition === 'top' ? 'top-4' : 'bottom-20'
          }`}
          style={{ maxWidth: 'calc(100vw - 2rem)' }}
        >
          <button
            onClick={handlePiPBannerClick}
            className="group flex items-center gap-3 px-5 py-3 rounded-full
                       bg-gradient-to-r from-purple-600/90 via-violet-600/90 to-indigo-600/90
                       backdrop-blur-xl border border-white/20
                       shadow-[0_8px_32px_rgba(139,92,246,0.4),0_0_0_1px_rgba(255,255,255,0.1)_inset]
                       hover:shadow-[0_12px_40px_rgba(139,92,246,0.5),0_0_0_1px_rgba(255,255,255,0.15)_inset]
                       hover:scale-105 active:scale-95
                       transition-all duration-300 ease-out"
          >
            {/* Animated play/minimize icon */}
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="relative"
            >
              <div className="absolute inset-0 bg-white/20 rounded-full blur-md" />
              <div className="relative p-1.5 rounded-full bg-white/20">
                <Minimize2 className="w-5 h-5 text-white" />
              </div>
            </motion.div>

            {/* Text with gradient shine effect */}
            <div className="flex flex-col items-start">
              <span className="text-white font-semibold text-sm leading-tight">
                Continue watching
              </span>
              <span className="text-white/70 text-xs leading-tight">
                Tap for mini player
              </span>
            </div>

            {/* Subtle arrow indicator */}
            <motion.div
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="text-white/60 group-hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.div>

            {/* Pulse ring effect */}
            <motion.div
              className="absolute inset-0 rounded-full border border-purple-400/50"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </button>
        </motion.div>
      )}
    </>
  );
}

export default EmbeddedVideoDevice;
