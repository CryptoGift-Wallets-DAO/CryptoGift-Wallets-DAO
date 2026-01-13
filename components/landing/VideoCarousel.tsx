'use client';

/**
 * VideoCarousel - Glass crystal video carousel for landing page
 * Features:
 * - One video at a time with left/right arrows
 * - Click to play/pause
 * - Double-click to fullscreen
 * - Glass crystal styling
 * - i18n support (ES/EN videos)
 * - AMBIENT MODE: YouTube-style glow effect from video colors
 * - Auto-play when >50% visible (mobile: auto, PC: on click)
 * - STICKY MODE: Floats below navbar when scrolled out of view
 * - Swipe gestures for mobile dismiss with directional animations
 * - Auto-advance to next video when current ends
 *
 * CRITICAL: Video always in portal to prevent DOM unmount issues
 *
 * Made by mbxarts.com The Moon in a Box property
 * Co-Author: Godez22
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocale } from 'next-intl';
import dynamic from 'next/dynamic';
import { ChevronLeft, ChevronRight, Play, Maximize2, Volume2, VolumeX, Minimize2 } from 'lucide-react';
import { VideoExperienceHint } from '@/components/ui/RotatePhoneHint';

// Ambient Mode configuration
const AMBIENT_CONFIG = {
  blur: 60,
  opacity: 0.45,
  brightness: 1.15,
  saturate: 1.3,
  scale: 1.12,
  updateInterval: 100
};

const AUTO_PLAY_VOLUME = 0.15;

// Sticky mode configuration
const STICKY_THRESHOLD = 0.50; // Go sticky when <50% visible
const RETURN_THRESHOLD = 0.70; // Return when >70% visible
const NAVBAR_HEIGHT = 72;
const MIN_SCROLL_FOR_STICKY = 150; // Don't go sticky if scroll < 150px (video near top)

// CSS Keyframes for sticky mode animations
const stickyAnimationStyles = `
  @keyframes dismissUp {
    0% { opacity: 1; transform: translateY(0) scale(1); }
    100% { opacity: 0; transform: translateY(-150px) scale(0.8); }
  }
  @keyframes dismissLeft {
    0% { opacity: 1; transform: translateX(0) scale(1); }
    100% { opacity: 0; transform: translateX(-120%) scale(0.9); }
  }
  @keyframes dismissRight {
    0% { opacity: 1; transform: translateX(0) scale(1); }
    100% { opacity: 0; transform: translateX(120%) scale(0.9); }
  }
  @keyframes floatVideoSticky {
    0%, 100% { margin-top: 0px; }
    50% { margin-top: -8px; }
  }
`;

/**
 * Custom hook to handle horizontal scroll behavior
 * - Prevents real horizontal scroll (which would stay in place when released)
 * - Simulates iOS-like rubber band overscroll effect for BOTH directions
 * - Works on MOBILE (touch) and PC (mouse drag + trackpad)
 */
function useHorizontalOverscroll() {
  const [translateX, setTranslateX] = useState(0);
  const startX = useRef(0);
  const startY = useRef(0);
  const isHorizontalGesture = useRef<boolean | null>(null);
  const isDragging = useRef(false);

  // For trackpad: smooth position tracking
  const targetPosition = useRef(0);
  const currentPosition = useRef(0);
  const animationFrame = useRef<number | null>(null);
  const lastWheelTime = useRef(0);
  const isWheelActive = useRef(false);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const resistance = 0.5;
    const maxTranslate = 140;

    // ============ SMOOTH ANIMATION LOOP (PC only) ============
    const animate = () => {
      const now = Date.now();
      const timeSinceLastWheel = now - lastWheelTime.current;

      // If no wheel input for 100ms, start returning to center
      if (timeSinceLastWheel > 100 && isWheelActive.current) {
        targetPosition.current *= 0.92; // Smooth decay toward 0
        if (Math.abs(targetPosition.current) < 0.5) {
          targetPosition.current = 0;
          isWheelActive.current = false;
        }
      }

      // Smoothly interpolate current toward target
      const diff = targetPosition.current - currentPosition.current;
      currentPosition.current += diff * 0.15; // Smooth interpolation

      // Apply to state
      if (Math.abs(currentPosition.current) > 0.1 || isWheelActive.current) {
        const translateAmount = Math.min(Math.abs(currentPosition.current), maxTranslate);
        const direction = currentPosition.current > 0 ? 1 : -1;
        setTranslateX(translateAmount * direction);
        animationFrame.current = requestAnimationFrame(animate);
      } else {
        currentPosition.current = 0;
        setTranslateX(0);
        animationFrame.current = null;
      }
    };

    const startAnimation = () => {
      if (!animationFrame.current) {
        animationFrame.current = requestAnimationFrame(animate);
      }
    };

    // ============ MOBILE: Touch Events ============
    const handleTouchStart = (e: TouchEvent) => {
      startX.current = e.touches[0].clientX;
      startY.current = e.touches[0].clientY;
      isHorizontalGesture.current = null;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touchX = e.touches[0].clientX;
      const touchY = e.touches[0].clientY;
      const deltaX = startX.current - touchX;
      const deltaY = startY.current - touchY;

      if (isHorizontalGesture.current === null && (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10)) {
        isHorizontalGesture.current = Math.abs(deltaX) > Math.abs(deltaY);
      }

      if (isHorizontalGesture.current === true) {
        e.preventDefault();
        const translateAmount = Math.min(Math.abs(deltaX) * resistance, maxTranslate);
        setTranslateX(deltaX > 0 ? -translateAmount : translateAmount);
      }
    };

    const handleTouchEnd = () => {
      setTranslateX(0);
      isHorizontalGesture.current = null;
    };

    // ============ PC: Mouse Drag Events ============
    const handleMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      startX.current = e.clientX;
      startY.current = e.clientY;
      isHorizontalGesture.current = null;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;

      const deltaX = startX.current - e.clientX;
      const deltaY = startY.current - e.clientY;

      if (isHorizontalGesture.current === null && (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10)) {
        isHorizontalGesture.current = Math.abs(deltaX) > Math.abs(deltaY);
      }

      if (isHorizontalGesture.current === true) {
        e.preventDefault();
        const translateAmount = Math.min(Math.abs(deltaX) * resistance, maxTranslate);
        setTranslateX(deltaX > 0 ? -translateAmount : translateAmount);
      }
    };

    const handleMouseUp = () => {
      if (isDragging.current) {
        setTranslateX(0);
        isDragging.current = false;
        isHorizontalGesture.current = null;
      }
    };

    // ============ PC: Trackpad/Wheel - Natural Feel ============
    const handleWheel = (e: WheelEvent) => {
      // Only handle horizontal scroll (trackpad gesture)
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 1) {
        e.preventDefault();

        lastWheelTime.current = Date.now();
        isWheelActive.current = true;

        // Accumulate position naturally like dragging
        targetPosition.current -= e.deltaX * 0.8;

        // Clamp to max range
        targetPosition.current = Math.max(-maxTranslate, Math.min(maxTranslate, targetPosition.current));

        startAnimation();
      }
    };

    // Add event listeners based on device
    if (isMobile) {
      document.addEventListener('touchstart', handleTouchStart, { passive: true });
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd, { passive: true });
    } else {
      document.addEventListener('mousedown', handleMouseDown);
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (isMobile) {
        document.removeEventListener('touchstart', handleTouchStart);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      } else {
        document.removeEventListener('mousedown', handleMouseDown);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('wheel', handleWheel);
      }
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, []);

  return translateX;
}

// Lazy load MUX Player
const MuxPlayer = dynamic(
  () => import('@mux/mux-player-react').then(mod => mod.default),
  { ssr: false, loading: () => <div className="w-full h-full bg-black/50 animate-pulse rounded-xl" /> }
);

// Video configurations per language - Sales Funnel Structure
// 01. The Gift (TOFU) → 02. The Solution (MOFU) → 03. The Opportunity (BOFU) → Gallery → Demo
const VIDEOS = {
  es: [
    {
      id: 'the-gift',
      muxPlaybackId: '02Sx72OAZtSl1ai3NTVTT3Cnd1LN6Xo2QpwNlRCQBAYI',
      title: '01. El Regalo',
      description: 'El primer paso hacia la confianza real',
      duration: '1 min',
    },
    {
      id: 'the-solution',
      muxPlaybackId: 'TRT85U1Ll3Us78KQIOuhC01AQk1LE74UWg023AwWKioeg',
      title: '02. La Solución',
      description: '5 contratos verificados. 717+ transacciones on-chain',
      duration: '2 min',
    },
    {
      id: 'the-opportunity',
      muxPlaybackId: 'rF61CMLJ02io018xlko25uhCQsBZ4Eiyn015ImObGGt01qM',
      title: '03. La Oportunidad',
      description: 'Tu invitación al futuro de Web3',
      duration: '3 min',
    },
    {
      id: 'gallery-es',
      muxPlaybackId: 'lsT00V7M302d9EIrKr9vUaVTnxvee3q15yF1OUKZYFpMc',
      title: 'Gallery',
      description: 'Oportunidades exclusivas del CryptoGift Club',
      duration: '2 min',
    },
    {
      id: 'demo',
      muxPlaybackId: 'FCb1PkEnWapDI01wHXObphFgQPa4PY8zK5akxw2o7DcE',
      title: 'Demo: Crear y Reclamar',
      description: 'Demo del proceso de creación y reclamación',
      duration: '1 min',
    },
  ],
  en: [
    {
      id: 'the-gift',
      muxPlaybackId: 'Y02PN1hp8Wu2bq7MOBR3YZlyQ7uoF02Bm01lnFVE5y018i4',
      title: '01. The Gift',
      description: 'The first step toward real trust',
      duration: '1 min',
    },
    {
      id: 'the-solution',
      muxPlaybackId: 'jaqNcipaSjC8Dsk1L3P0202K02Eleo01oQmknS2zbqTN1hc',
      title: '02. The Solution',
      description: '5 verified contracts. 717+ on-chain transactions',
      duration: '2 min',
    },
    {
      id: 'the-opportunity',
      muxPlaybackId: 'papdpJAYPT8r01ql01pQAu4025VJRMECe7tFM24Oy4T01gU',
      title: '03. The Opportunity',
      description: 'Your invitation to the future of Web3',
      duration: '3 min',
    },
    {
      id: 'gallery-en',
      muxPlaybackId: 'ntscvAUpAGeSDLi00Yc383JpC028dAT5o5OqeBohx01sMI',
      title: 'Gallery',
      description: 'Exclusive CryptoGift Club opportunities',
      duration: '2 min',
    },
    {
      id: 'demo',
      muxPlaybackId: 'FCb1PkEnWapDI01wHXObphFgQPa4PY8zK5akxw2o7DcE',
      title: 'Demo: Create & Claim',
      description: 'Demo of the creation and claiming process',
      duration: '1 min',
    },
  ],
};

export function VideoCarousel() {
  const locale = useLocale() as 'es' | 'en';
  const videos = VIDEOS[locale] || VIDEOS.en;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // STICKY MODE: Video floats to fixed position when scrolled >50% out of view
  const [isSticky, setIsSticky] = useState(false);

  // Dismiss animation state - tracks swipe direction for visual feedback
  const [dismissDirection, setDismissDirection] = useState<'none' | 'up' | 'left' | 'right'>('none');

  // Touch active state - pauses float animation during touch to prevent vibration
  const [isTouching, setIsTouching] = useState(false);

  // Portal state - for escaping backdrop-filter containers
  const [portalReady, setPortalReady] = useState(false);

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const placeholderRef = useRef<HTMLDivElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ambientIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasAutoPlayed = useRef(false);

  // Sticky mode refs
  const stickyLocked = useRef(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const lastTapRef = useRef<number>(0);

  // Placeholder rect for positioning when not sticky
  const [placeholderRect, setPlaceholderRect] = useState<DOMRect | null>(null);

  // Unique ID for MuxPlayer DOM access
  const muxPlayerId = `mux-carousel-${currentIndex}`;

  // Ambient Mode state
  const [ambientColors, setAmbientColors] = useState({
    dominant: 'rgba(139, 92, 246, 0.35)',
    secondary: 'rgba(6, 182, 212, 0.25)',
    accent: 'rgba(168, 85, 247, 0.3)'
  });

  // Use custom overscroll hook for rubber band effect on mobile
  const translateX = useHorizontalOverscroll();

  const currentVideo = videos[currentIndex];

  // Portal ready check (client-side only)
  useEffect(() => {
    setPortalReady(true);
  }, []);

  // Update placeholder rect for positioning when NOT sticky
  useEffect(() => {
    if (!placeholderRef.current) return;

    const updateRect = () => {
      if (placeholderRef.current && !isSticky) {
        setPlaceholderRect(placeholderRef.current.getBoundingClientRect());
      }
    };

    // Initial update
    updateRect();

    // Update on scroll and resize when not sticky
    if (!isSticky) {
      window.addEventListener('scroll', updateRect, { passive: true });
      window.addEventListener('resize', updateRect, { passive: true });
      return () => {
        window.removeEventListener('scroll', updateRect);
        window.removeEventListener('resize', updateRect);
      };
    }
  }, [isSticky]);

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

  // Create canvas for color extraction
  useEffect(() => {
    if (typeof document !== 'undefined' && !canvasRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = 16;
      canvas.height = 9;
      canvasRef.current = canvas;
    }
  }, []);

  // Get MuxPlayer element via DOM ID
  const getMuxPlayer = useCallback((): any => {
    if (typeof document === 'undefined') return null;
    const wrapper = document.getElementById(muxPlayerId);
    if (!wrapper) return null;
    return wrapper.querySelector('mux-player');
  }, [muxPlayerId]);

  // Get video element from MuxPlayer
  const getVideoElement = useCallback((): HTMLVideoElement | null => {
    if (videoRef.current) return videoRef.current;
    const player = getMuxPlayer();
    if (player) {
      const shadowRoot = (player as any).shadowRoot;
      if (shadowRoot) {
        const video = shadowRoot.querySelector('video');
        if (video) {
          videoRef.current = video;
          return video;
        }
      }
    }
    return null;
  }, [getMuxPlayer]);

  // Extract colors from video for Ambient Mode
  const extractVideoColors = useCallback(() => {
    const video = getVideoElement();
    const canvas = canvasRef.current;
    if (!video || !canvas || video.paused || video.ended) return;

    try {
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const center = ctx.getImageData(canvas.width / 2 - 2, canvas.height / 2 - 2, 4, 4).data;
      const topLeft = ctx.getImageData(0, 0, 4, 4).data;
      const bottomRight = ctx.getImageData(canvas.width - 4, canvas.height - 4, 4, 4).data;

      const avgColor = (data: Uint8ClampedArray) => {
        let r = 0, g = 0, b = 0, count = 0;
        for (let i = 0; i < data.length; i += 4) {
          r += data[i]; g += data[i + 1]; b += data[i + 2]; count++;
        }
        return { r: Math.round(r / count), g: Math.round(g / count), b: Math.round(b / count) };
      };

      const adjust = (c: { r: number; g: number; b: number }) => {
        const br = AMBIENT_CONFIG.brightness;
        const sat = AMBIENT_CONFIG.saturate;
        let r = Math.min(255, c.r * br), g = Math.min(255, c.g * br), b = Math.min(255, c.b * br);
        const gray = (r + g + b) / 3;
        r = Math.min(255, r + (r - gray) * (sat - 1));
        g = Math.min(255, g + (g - gray) * (sat - 1));
        b = Math.min(255, b + (b - gray) * (sat - 1));
        return { r: Math.round(r), g: Math.round(g), b: Math.round(b) };
      };

      const d = adjust(avgColor(center));
      const s = adjust(avgColor(topLeft));
      const a = adjust(avgColor(bottomRight));

      setAmbientColors({
        dominant: `rgba(${d.r}, ${d.g}, ${d.b}, 0.4)`,
        secondary: `rgba(${s.r}, ${s.g}, ${s.b}, 0.3)`,
        accent: `rgba(${a.r}, ${a.g}, ${a.b}, 0.35)`
      });
    } catch {
      // CORS error - use fallback colors
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

  // Attempt auto-play (for mobile visibility trigger)
  const attemptAutoPlay = useCallback(() => {
    if (hasAutoPlayed.current) return;

    const player = getMuxPlayer();
    if (!player) return;

    player.volume = AUTO_PLAY_VOLUME;
    player.muted = false;
    setIsMuted(false);

    const playPromise = player.play?.();
    if (playPromise?.then) {
      playPromise.then(() => {
        hasAutoPlayed.current = true;
        setIsPlaying(true);
      }).catch(() => {
        // Fallback: muted play
        player.muted = true;
        setIsMuted(true);
        player.play?.().then(() => {
          hasAutoPlayed.current = true;
          setIsPlaying(true);
        }).catch(() => {});
      });
    }
  }, [getMuxPlayer]);

  // =============================================================================
  // STICKY MODE LOGIC - IntersectionObserver
  // =============================================================================
  useEffect(() => {
    const elementToObserve = placeholderRef.current;
    if (!elementToObserve) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const ratio = entry.intersectionRatio;
          const scrollY = window.scrollY;

          // Auto-play when >50% visible (mobile only)
          if (isMobile && ratio > 0.5 && !hasAutoPlayed.current) {
            attemptAutoPlay();
          }

          // Prevent rapid toggles
          if (stickyLocked.current) return;

          // GO STICKY: When <50% visible AND video is playing AND scrolled enough
          // CRITICAL: Don't go sticky if we're near the top of the page
          if (!isSticky && isPlaying && ratio < STICKY_THRESHOLD && scrollY > MIN_SCROLL_FOR_STICKY) {
            console.log('[VideoCarousel] Going STICKY - video >50% hidden, scrollY:', scrollY);
            stickyLocked.current = true;
            setIsSticky(true);
            setTimeout(() => { stickyLocked.current = false; }, 600);
          }

          // RETURN TO NORMAL: When >70% visible
          if (isSticky && ratio > RETURN_THRESHOLD) {
            console.log('[VideoCarousel] Returning to NORMAL - video >70% visible');
            stickyLocked.current = true;
            setIsSticky(false);
            setTimeout(() => { stickyLocked.current = false; }, 600);
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
  }, [isPlaying, isSticky, isMobile, attemptAutoPlay]);

  // =============================================================================
  // MINIMIZE & FULLSCREEN CONTROLS
  // =============================================================================

  // Minimize: Just HIDE the sticky panel - stay where you are
  const handleMinimize = useCallback(() => {
    if (!isSticky) return;
    console.log('[VideoCarousel] Minimizing - hiding sticky panel (no scroll)');
    stickyLocked.current = true;
    setIsSticky(false);
    setTimeout(() => { stickyLocked.current = false; }, 1500);
  }, [isSticky]);

  // Fullscreen toggle - with mobile-specific APIs
  const handleFullscreen = useCallback(() => {
    const player = getMuxPlayer();
    if (!player) return;

    const isFullscreen = !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    );

    if (isFullscreen) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    } else {
      const videoEl = player.querySelector('video') || player;

      if ((videoEl as any).webkitEnterFullscreen) {
        (videoEl as any).webkitEnterFullscreen();
        return;
      }
      if ((videoEl as any).webkitRequestFullscreen) {
        (videoEl as any).webkitRequestFullscreen();
        return;
      }
      if (videoEl.requestFullscreen) {
        videoEl.requestFullscreen();
        return;
      }
      if ((player as any).webkitRequestFullscreen) {
        (player as any).webkitRequestFullscreen();
      } else if (player.requestFullscreen) {
        player.requestFullscreen();
      }
    }
  }, [getMuxPlayer]);

  // =============================================================================
  // MOBILE TOUCH GESTURES: Swipe to minimize + Double tap for fullscreen
  // =============================================================================

  const handleStickyTouchStart = useCallback((e: React.TouchEvent) => {
    if (!isMobile) return;
    setIsTouching(true);
    if (!isSticky) return;
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, [isMobile, isSticky]);

  const handleStickyTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!isMobile) return;
    setIsTouching(false);

    const touch = e.changedTouches[0];
    const now = Date.now();

    // Double tap detection for fullscreen (300ms threshold)
    if (now - lastTapRef.current < 300) {
      handleFullscreen();
      lastTapRef.current = 0;
      return;
    }
    lastTapRef.current = now;

    // Swipe detection for minimize with visual animation (only when sticky)
    if (isSticky && touchStartRef.current) {
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      let direction: 'up' | 'left' | 'right' | null = null;

      if (absY > 50 && deltaY < 0 && absY > absX) {
        direction = 'up';
      } else if (absX > 80 && deltaX < 0) {
        direction = 'left';
      } else if (absX > 80 && deltaX > 0) {
        direction = 'right';
      }

      if (direction) {
        console.log(`[VideoCarousel] Swipe ${direction} detected - animating dismiss`);
        setDismissDirection(direction);
        stickyLocked.current = true;

        setTimeout(() => {
          setIsSticky(false);
          setDismissDirection('none');
          setTimeout(() => { stickyLocked.current = false; }, 1500);
        }, 300);
      }
    }

    touchStartRef.current = null;
  }, [isMobile, isSticky, handleFullscreen]);

  const handleStickyTouchCancel = useCallback(() => {
    setIsTouching(false);
    touchStartRef.current = null;
  }, []);

  // Determine which animation to use for sticky mode
  const getStickyAnimation = useCallback(() => {
    if (dismissDirection !== 'none') {
      const animationMap = {
        up: 'dismissUp 0.3s ease-out forwards',
        left: 'dismissLeft 0.3s ease-out forwards',
        right: 'dismissRight 0.3s ease-out forwards',
      };
      return animationMap[dismissDirection];
    }
    if (isTouching) {
      return 'none';
    }
    return 'floatVideoSticky 4s ease-in-out infinite';
  }, [dismissDirection, isTouching]);

  // Reset hasAutoPlayed when video changes
  useEffect(() => {
    hasAutoPlayed.current = false;
    videoRef.current = null;
  }, [currentIndex]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    const player = getMuxPlayer();
    if (player) {
      const newMuted = !player.muted;
      player.muted = newMuted;
      setIsMuted(newMuted);
      if (!newMuted) player.volume = AUTO_PLAY_VOLUME;
    }
  }, [getMuxPlayer]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? videos.length - 1 : prev - 1));
    hasAutoPlayed.current = false; // Allow auto-play for new video
    videoRef.current = null;
  }, [videos.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === videos.length - 1 ? 0 : prev + 1));
    hasAutoPlayed.current = false; // Allow auto-play for new video
    videoRef.current = null;
  }, [videos.length]);

  // Handle video end - auto-advance to next
  const handleVideoEnd = useCallback(() => {
    console.log('[VideoCarousel] Video ended, advancing to next');
    goToNext();
    // Auto-play next video after a short delay
    setTimeout(() => {
      const player = getMuxPlayer();
      if (player) {
        player.volume = AUTO_PLAY_VOLUME;
        player.muted = isMuted;
        player.play?.().then(() => {
          setIsPlaying(true);
          hasAutoPlayed.current = true;
        }).catch(() => {});
      }
    }, 500);
  }, [goToNext, getMuxPlayer, isMuted]);

  const togglePlayPause = useCallback(() => {
    const player = getMuxPlayer();
    if (player) {
      if (isPlaying) {
        player.pause();
        setIsPlaying(false);
      } else {
        player.volume = AUTO_PLAY_VOLUME;
        player.muted = isMuted;
        player.play?.().then(() => {
          setIsPlaying(true);
          hasAutoPlayed.current = true;
        }).catch(() => {
          // Try muted
          player.muted = true;
          setIsMuted(true);
          player.play?.().then(() => {
            setIsPlaying(true);
            hasAutoPlayed.current = true;
          });
        });
      }
    }
  }, [isPlaying, isMuted, getMuxPlayer]);

  const handleDoubleClick = useCallback(() => {
    handleFullscreen();
  }, [handleFullscreen]);

  // =============================================================================
  // RENDER - VIDEO ALWAYS IN PORTAL (like EmbeddedVideoDevice)
  // =============================================================================

  // Calculate widths for positioning
  const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 500;
  const stickyWidth = Math.min(400, windowWidth - 32);
  const placeholderWidth = placeholderRect?.width || 400;

  // Video container styles - ALWAYS fixed position via portal
  const videoStyles: React.CSSProperties = isSticky
    ? {
        // STICKY: Fixed below navbar - centered
        position: 'fixed',
        top: NAVBAR_HEIGHT + 8,
        left: `calc(50% - ${stickyWidth / 2}px)`,
        width: stickyWidth,
        zIndex: 9999,
        animation: getStickyAnimation(),
        boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 16px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1)',
      }
    : placeholderRect
    ? {
        // NORMAL: Fixed at placeholder position (simulates being in place)
        position: 'fixed',
        top: placeholderRect.top,
        left: placeholderRect.left,
        width: placeholderRect.width,
        height: placeholderRect.height,
        zIndex: 50,
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      }
    : {
        // FALLBACK before rect is calculated
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
      };

  // The video element - ALWAYS rendered via portal
  const videoElement = (
    <div
      ref={videoContainerRef}
      style={{
        ...videoStyles,
        borderRadius: '1rem',
        overflow: 'hidden',
      }}
      onTouchStart={handleStickyTouchStart}
      onTouchEnd={handleStickyTouchEnd}
      onTouchCancel={handleStickyTouchCancel}
    >
      <div className="glass-crystal rounded-2xl overflow-hidden relative">
        {/* Video header - HIDDEN when sticky (cleaner look) */}
        {!isSticky && (
          <div className="p-3 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                  {currentVideo.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {currentVideo.duration}
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <span>{currentIndex + 1}</span>
                <span>/</span>
                <span>{videos.length}</span>
              </div>
            </div>
          </div>
        )}

        {/* Video player area */}
        <div
          className="relative aspect-video bg-black cursor-pointer"
          onClick={togglePlayPause}
          onDoubleClick={handleDoubleClick}
        >
          <div id={muxPlayerId} className="absolute inset-0">
            <MuxPlayer
              key={currentVideo.muxPlaybackId}
              playbackId={currentVideo.muxPlaybackId}
              streamType="on-demand"
              autoPlay={false}
              muted={isMuted}
              playsInline
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={handleVideoEnd}
              style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                top: 0,
                left: 0,
                '--controls': 'none',
                '--media-object-fit': 'cover',
              } as any}
              className="w-full h-full"
            />
          </div>

          {/* Play/Pause overlay (shows when paused) */}
          {!isPlaying && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 pointer-events-none">
              <div className="p-4 rounded-full bg-white/20 backdrop-blur-sm animate-pulse">
                <Play className="w-8 h-8 text-white fill-white" />
              </div>
              <div className="mt-3 px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm">
                <span className="text-white text-xs">
                  {isMobile ? 'Tap to play' : 'Click to play'}
                </span>
              </div>
            </div>
          )}

          {/* MINIMIZE button - only visible when sticky (top-left) */}
          {isSticky && (
            <button
              onClick={(e) => { e.stopPropagation(); handleMinimize(); }}
              className="absolute top-3 left-3 z-30 p-2 rounded-full bg-black/40 backdrop-blur-sm text-white/70 hover:bg-black/60 hover:text-white transition-all shadow-lg border border-white/10"
              title="Return to original position"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          )}

          {/* Control buttons - top-right (visible when sticky OR on hover) */}
          <div className={`absolute top-3 right-3 z-30 flex items-center gap-2 ${isSticky ? '' : 'opacity-0 hover:opacity-100'} transition-opacity`}>
            <button
              onClick={(e) => { e.stopPropagation(); handleFullscreen(); }}
              className="p-2.5 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-all shadow-lg border border-white/10"
              title="Fullscreen"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); toggleMute(); }}
              className="p-2.5 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-all shadow-lg border border-white/10"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Navigation arrows + dots - visible when NOT sticky */}
        {!isSticky && (
          <div className="flex items-center justify-between p-3 border-t border-white/10">
            <button
              onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
              className="p-2 rounded-full glass-crystal hover:scale-110 transition-transform"
              aria-label="Previous video"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-white" />
            </button>

            {/* Dots indicator + Volume */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {videos.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex(index);
                      hasAutoPlayed.current = false;
                      videoRef.current = null;
                    }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentIndex
                        ? 'bg-blue-500 w-4'
                        : 'bg-gray-400 dark:bg-gray-600 hover:bg-gray-500'
                    }`}
                    aria-label={`Go to video ${index + 1}`}
                  />
                ))}
              </div>

              {/* Volume toggle */}
              <button
                onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                )}
              </button>
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); goToNext(); }}
              className="p-2 rounded-full glass-crystal hover:scale-110 transition-transform"
              aria-label="Next video"
            >
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-white" />
            </button>
          </div>
        )}

        {/* Sticky mode: Compact navigation */}
        {isSticky && (
          <div className="flex items-center justify-center gap-3 p-2 border-t border-white/10 bg-black/20">
            <button
              onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
              className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Previous video"
            >
              <ChevronLeft className="w-4 h-4 text-white/70" />
            </button>
            <div className="flex items-center gap-1.5">
              {videos.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(index);
                    hasAutoPlayed.current = false;
                    videoRef.current = null;
                  }}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    index === currentIndex
                      ? 'bg-blue-400 w-3'
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); goToNext(); }}
              className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Next video"
            >
              <ChevronRight className="w-4 h-4 text-white/70" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* CSS Keyframes for sticky animations */}
      <style jsx global>{stickyAnimationStyles}</style>

      <div
        ref={containerRef}
        className="relative w-full max-w-md mx-auto"
        style={{
          transform: translateX !== 0 ? `translateX(${translateX}px)` : undefined,
          transition: translateX === 0 ? 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
        }}
      >
        {/* PERMANENT GRADIENT SHADOW - Beautiful aura effect behind video panel */}
        <div
          className="absolute -inset-8 -z-20 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 50% 40%, rgba(139, 92, 246, 0.25) 0%, transparent 70%),
              radial-gradient(ellipse 60% 80% at 30% 60%, rgba(59, 130, 246, 0.20) 0%, transparent 60%),
              radial-gradient(ellipse 60% 80% at 70% 60%, rgba(6, 182, 212, 0.18) 0%, transparent 60%)
            `,
            filter: 'blur(40px)',
            opacity: 0.8,
            animation: 'pulse 8s ease-in-out infinite',
          }}
        />

        {/* AMBIENT MODE: Dynamic glow layer that reacts to video colors */}
        {isPlaying && !isSticky && (
          <div
            className="absolute inset-0 -z-10 pointer-events-none"
            style={{
              background: `
                radial-gradient(ellipse 120% 100% at 50% 0%, ${ambientColors.secondary} 0%, transparent 60%),
                radial-gradient(ellipse 100% 120% at 0% 50%, ${ambientColors.dominant} 0%, transparent 55%),
                radial-gradient(ellipse 100% 120% at 100% 50%, ${ambientColors.accent} 0%, transparent 55%),
                radial-gradient(ellipse 120% 100% at 50% 100%, ${ambientColors.dominant} 0%, transparent 60%)
              `,
              filter: `blur(${AMBIENT_CONFIG.blur}px)`,
              opacity: AMBIENT_CONFIG.opacity,
              transform: `scale(${AMBIENT_CONFIG.scale})`,
              transition: 'background 0.3s ease-out, opacity 0.5s ease-out',
            }}
          />
        )}

        {/* PLACEHOLDER: Reserves space with aspect ratio */}
        <div
          ref={placeholderRef}
          className="relative w-full"
          style={{ paddingBottom: '75%', height: 0 }} // 4:3 ratio (includes header+footer)
        >
          {/* Placeholder visual when video is floating */}
          {isSticky && (
            <div
              className="absolute inset-0 rounded-2xl border border-white/5 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(15,15,25,0.3) 0%, rgba(5,5,15,0.3) 100%)' }}
            >
              <div className="text-center opacity-40">
                <svg className="w-8 h-8 text-white/30 mx-auto mb-2 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                <p className="text-white/30 text-sm">Video playing above</p>
              </div>
            </div>
          )}
        </div>

        {/* VIDEO via PORTAL to body - escapes backdrop-filter containers */}
        {portalReady && typeof document !== 'undefined'
          ? createPortal(videoElement, document.body)
          : videoElement
        }

      {/* Floating elements - RIGHT SIDE - md: for medium screens to prevent overlap */}
      <div className="absolute -top-6 -right-20 md:-right-28 lg:-right-32 p-2 rounded-lg text-xs glass-crystal" style={{ animation: 'float 4s ease-in-out infinite 0.5s' }}>
        <span className="font-medium text-purple-600 dark:text-purple-400">Open</span>
      </div>

      <div className="absolute top-4 -right-28 md:-right-40 lg:-right-48 p-2 rounded-lg text-xs glass-crystal" style={{ animation: 'float 5s ease-in-out infinite 1s' }}>
        <span className="font-medium text-blue-600 dark:text-blue-400">Secure</span>
      </div>

      <div className="absolute top-20 -right-24 md:-right-32 lg:-right-40 p-2 rounded-lg text-xs glass-crystal" style={{ animation: 'float 4.5s ease-in-out infinite 0.2s' }}>
        <span className="font-medium text-rose-600 dark:text-rose-400">Human</span>
      </div>

      <div className="absolute top-36 -right-32 md:-right-44 lg:-right-56 p-2 rounded-lg text-xs glass-crystal" style={{ animation: 'float 5.5s ease-in-out infinite 1.5s' }}>
        <span className="font-medium text-cyan-600 dark:text-cyan-400">Gift in 5 min</span>
      </div>

      <div className="absolute bottom-12 -right-20 md:-right-28 lg:-right-36 p-2 rounded-lg text-xs glass-crystal" style={{ animation: 'float 4.3s ease-in-out infinite 0.7s' }}>
        <span className="font-medium text-teal-600 dark:text-teal-400">Easy claim</span>
      </div>

      <div className="absolute bottom-28 -right-36 md:-right-48 lg:-right-60 p-2 rounded-lg text-xs glass-crystal" style={{ animation: 'float 5.8s ease-in-out infinite 1.8s' }}>
        <span className="font-medium text-sky-600 dark:text-sky-400">Base L2</span>
      </div>

      {/* Video experience hint - Below video */}
      <div className="mt-4">
        <VideoExperienceHint />
      </div>

      {/* Floating elements - LEFT SIDE - md: for medium screens to prevent overlap */}
      <div className="absolute -top-8 -left-24 md:-left-32 lg:-left-40 p-2 rounded-lg text-xs glass-crystal" style={{ animation: 'float 5s ease-in-out infinite 0.8s' }}>
        <span className="font-medium text-emerald-600 dark:text-emerald-400">No gas</span>
      </div>

      <div className="absolute top-6 -left-32 md:-left-44 lg:-left-56 p-2 rounded-lg text-xs glass-crystal" style={{ animation: 'float 4.2s ease-in-out infinite 0.3s' }}>
        <span className="font-medium text-amber-600 dark:text-amber-400">No complications</span>
      </div>

      <div className="absolute top-24 -left-28 md:-left-36 lg:-left-44 p-2 rounded-lg text-xs glass-crystal" style={{ animation: 'float 5.2s ease-in-out infinite 1.2s' }}>
        <span className="font-medium text-green-600 dark:text-green-400">No fear</span>
      </div>

      <div className="absolute top-40 -left-36 md:-left-48 lg:-left-60 p-2 rounded-lg text-xs glass-crystal" style={{ animation: 'float 4.8s ease-in-out infinite 0.6s' }}>
        <span className="font-medium text-indigo-600 dark:text-indigo-400">100% yours</span>
      </div>

      <div className="absolute bottom-20 -left-24 md:-left-32 lg:-left-40 p-2 rounded-lg text-xs glass-crystal" style={{ animation: 'float 4.6s ease-in-out infinite 1.4s' }}>
        <span className="font-medium text-fuchsia-600 dark:text-fuchsia-400">Web3 simple</span>
      </div>

      <div className="absolute bottom-4 -left-32 md:-left-40 lg:-left-52 p-2 rounded-lg text-xs glass-crystal" style={{ animation: 'float 5.4s ease-in-out infinite 0.9s' }}>
        <span className="font-medium text-orange-600 dark:text-orange-400">Intuitive UX</span>
      </div>
    </div>
    </>
  );
}

export default VideoCarousel;
