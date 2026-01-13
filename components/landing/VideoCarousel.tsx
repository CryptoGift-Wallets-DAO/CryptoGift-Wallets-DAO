'use client';

/**
 * VideoCarousel - Glass crystal video carousel for landing page
 *
 * ARCHITECTURE:
 * - NORMAL MODE: Video in DOM (no portal) - moves perfectly with scroll, no delay
 * - STICKY MODE: Video in portal with position:fixed - floats below navbar
 * - Floating words attached to video, move together with rubber band effect
 * - Transition saves/restores video currentTime for continuity
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
const STICKY_THRESHOLD = 0.50;
const RETURN_THRESHOLD = 0.70;
const NAVBAR_HEIGHT = 72;

// CSS Keyframes
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
  @keyframes floatWord {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-6px); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-4px); }
  }
`;

/**
 * Custom hook for horizontal rubber band overscroll effect
 * - Simulates iOS-like rubber band for BOTH directions
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

    // Smooth animation loop (PC only)
    const animate = () => {
      const now = Date.now();
      const timeSinceLastWheel = now - lastWheelTime.current;

      // If no wheel input for 100ms, return to center
      if (timeSinceLastWheel > 100 && isWheelActive.current) {
        targetPosition.current *= 0.92;
        if (Math.abs(targetPosition.current) < 0.5) {
          targetPosition.current = 0;
          isWheelActive.current = false;
        }
      }

      // Smoothly interpolate current toward target
      const diff = targetPosition.current - currentPosition.current;
      currentPosition.current += diff * 0.15;

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

    // MOBILE: Touch Events
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

    // PC: Mouse Drag Events
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

    // PC: Trackpad/Wheel - Natural Feel
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 1) {
        e.preventDefault();
        lastWheelTime.current = Date.now();
        isWheelActive.current = true;
        targetPosition.current -= e.deltaX * 0.8;
        targetPosition.current = Math.max(-maxTranslate, Math.min(maxTranslate, targetPosition.current));
        startAnimation();
      }
    };

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

// Video configurations per language
const VIDEOS = {
  es: [
    { id: 'the-gift', muxPlaybackId: '02Sx72OAZtSl1ai3NTVTT3Cnd1LN6Xo2QpwNlRCQBAYI', title: '01. El Regalo', description: 'El primer paso hacia la confianza real', duration: '1 min' },
    { id: 'the-solution', muxPlaybackId: 'TRT85U1Ll3Us78KQIOuhC01AQk1LE74UWg023AwWKioeg', title: '02. La Solución', description: '5 contratos verificados. 717+ transacciones on-chain', duration: '2 min' },
    { id: 'the-opportunity', muxPlaybackId: 'rF61CMLJ02io018xlko25uhCQsBZ4Eiyn015ImObGGt01qM', title: '03. La Oportunidad', description: 'Tu invitación al futuro de Web3', duration: '3 min' },
    { id: 'gallery-es', muxPlaybackId: 'lsT00V7M302d9EIrKr9vUaVTnxvee3q15yF1OUKZYFpMc', title: 'Gallery', description: 'Oportunidades exclusivas del CryptoGift Club', duration: '2 min' },
    { id: 'demo', muxPlaybackId: 'FCb1PkEnWapDI01wHXObphFgQPa4PY8zK5akxw2o7DcE', title: 'Demo: Crear y Reclamar', description: 'Demo del proceso de creación y reclamación', duration: '1 min' },
  ],
  en: [
    { id: 'the-gift', muxPlaybackId: 'Y02PN1hp8Wu2bq7MOBR3YZlyQ7uoF02Bm01lnFVE5y018i4', title: '01. The Gift', description: 'The first step toward real trust', duration: '1 min' },
    { id: 'the-solution', muxPlaybackId: 'jaqNcipaSjC8Dsk1L3P0202K02Eleo01oQmknS2zbqTN1hc', title: '02. The Solution', description: '5 verified contracts. 717+ on-chain transactions', duration: '2 min' },
    { id: 'the-opportunity', muxPlaybackId: 'papdpJAYPT8r01ql01pQAu4025VJRMECe7tFM24Oy4T01gU', title: '03. The Opportunity', description: 'Your invitation to the future of Web3', duration: '3 min' },
    { id: 'gallery-en', muxPlaybackId: 'ntscvAUpAGeSDLi00Yc383JpC028dAT5o5OqeBohx01sMI', title: 'Gallery', description: 'Exclusive CryptoGift Club opportunities', duration: '2 min' },
    { id: 'demo', muxPlaybackId: 'FCb1PkEnWapDI01wHXObphFgQPa4PY8zK5akxw2o7DcE', title: 'Demo: Create & Claim', description: 'Demo of the creation and claiming process', duration: '1 min' },
  ],
};

// Floating words configuration
const FLOATING_WORDS = {
  right: [
    { text: 'Open', color: 'purple', top: -24, offset: -80, delay: 0.5, duration: 4 },
    { text: 'Secure', color: 'blue', top: 16, offset: -112, delay: 1, duration: 5 },
    { text: 'Human', color: 'rose', top: 80, offset: -96, delay: 0.2, duration: 4.5 },
    { text: 'Gift in 5 min', color: 'cyan', top: 144, offset: -128, delay: 1.5, duration: 5.5 },
    { text: 'Easy claim', color: 'teal', bottom: 48, offset: -80, delay: 0.7, duration: 4.3 },
    { text: 'Base L2', color: 'sky', bottom: 112, offset: -144, delay: 1.8, duration: 5.8 },
  ],
  left: [
    { text: 'No gas', color: 'emerald', top: -32, offset: -96, delay: 0.8, duration: 5 },
    { text: 'No complications', color: 'amber', top: 24, offset: -128, delay: 0.3, duration: 4.2 },
    { text: 'No fear', color: 'green', top: 96, offset: -112, delay: 1.2, duration: 5.2 },
    { text: '100% yours', color: 'indigo', top: 160, offset: -144, delay: 0.6, duration: 4.8 },
    { text: 'Web3 simple', color: 'fuchsia', bottom: 80, offset: -96, delay: 1.4, duration: 4.6 },
    { text: 'Intuitive UX', color: 'orange', bottom: 16, offset: -128, delay: 0.9, duration: 5.4 },
  ],
};

export function VideoCarousel() {
  const locale = useLocale() as 'es' | 'en';
  const videos = VIDEOS[locale] || VIDEOS.en;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [dismissDirection, setDismissDirection] = useState<'none' | 'up' | 'left' | 'right'>('none');
  const [isTouching, setIsTouching] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [portalReady, setPortalReady] = useState(false);

  // Transition state for smooth crossfade
  const [isTransitioning, setIsTransitioning] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ambientIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasAutoPlayed = useRef(false);
  const stickyLocked = useRef(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const lastTapRef = useRef<number>(0);

  // Video state preservation for transitions
  const savedVideoState = useRef<{ currentTime: number; wasPlaying: boolean } | null>(null);

  const [ambientColors, setAmbientColors] = useState({
    dominant: 'rgba(139, 92, 246, 0.35)',
    secondary: 'rgba(6, 182, 212, 0.25)',
    accent: 'rgba(168, 85, 247, 0.3)'
  });

  // Rubber band effect - applies to floating words container
  const translateX = useHorizontalOverscroll();

  const currentVideo = videos[currentIndex];

  // Portal ready check
  useEffect(() => {
    setPortalReady(true);
  }, []);

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

  // Get video element from MuxPlayer (works for both normal and sticky modes)
  const getVideoElement = useCallback((): HTMLVideoElement | null => {
    // Try cached ref first
    if (videoRef.current && videoRef.current.isConnected) {
      return videoRef.current;
    }

    // Search in container (normal mode)
    if (containerRef.current) {
      const muxPlayer = containerRef.current.querySelector('mux-player');
      if (muxPlayer) {
        const shadowRoot = (muxPlayer as any).shadowRoot;
        if (shadowRoot) {
          const video = shadowRoot.querySelector('video');
          if (video) {
            videoRef.current = video;
            return video;
          }
        }
      }
    }

    // Search in portal (sticky mode)
    const portal = document.getElementById('sticky-video-portal');
    if (portal) {
      const muxPlayer = portal.querySelector('mux-player');
      if (muxPlayer) {
        const shadowRoot = (muxPlayer as any).shadowRoot;
        if (shadowRoot) {
          const video = shadowRoot.querySelector('video');
          if (video) {
            videoRef.current = video;
            return video;
          }
        }
      }
    }

    return null;
  }, []);

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

  // =============================================================================
  // SAVE VIDEO STATE before transition
  // =============================================================================
  const saveVideoState = useCallback(() => {
    const video = getVideoElement();
    if (video) {
      savedVideoState.current = {
        currentTime: video.currentTime,
        wasPlaying: !video.paused
      };
      console.log('[VideoCarousel] Saved state:', savedVideoState.current);
    }
  }, [getVideoElement]);

  // =============================================================================
  // RESTORE VIDEO STATE after transition
  // =============================================================================
  const restoreVideoState = useCallback(() => {
    if (!savedVideoState.current) return;

    // Wait for new MuxPlayer to mount
    const attemptRestore = (attempts = 0) => {
      if (attempts > 20) {
        console.log('[VideoCarousel] Gave up restoring state');
        return;
      }

      const video = getVideoElement();
      if (video && video.readyState >= 1) {
        video.currentTime = savedVideoState.current!.currentTime;
        if (savedVideoState.current!.wasPlaying) {
          video.volume = AUTO_PLAY_VOLUME;
          video.muted = isMuted;
          video.play().catch(() => {});
        }
        console.log('[VideoCarousel] Restored state at', savedVideoState.current!.currentTime);
        savedVideoState.current = null;
        setIsTransitioning(false);
      } else {
        setTimeout(() => attemptRestore(attempts + 1), 50);
      }
    };

    setTimeout(() => attemptRestore(), 100);
  }, [getVideoElement, isMuted]);

  // =============================================================================
  // STICKY MODE LOGIC - IntersectionObserver
  // =============================================================================
  useEffect(() => {
    const elementToObserve = containerRef.current;
    if (!elementToObserve) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const ratio = entry.intersectionRatio;
          const video = getVideoElement();

          // Auto-play when >50% visible
          if (ratio > 0.5 && !hasAutoPlayed.current && video) {
            if (video.paused) {
              video.volume = AUTO_PLAY_VOLUME;
              video.muted = false;
              video.play().then(() => {
                hasAutoPlayed.current = true;
                setIsPlaying(true);
              }).catch(() => {
                video.muted = true;
                setIsMuted(true);
                video.play().then(() => {
                  hasAutoPlayed.current = true;
                  setIsPlaying(true);
                }).catch(() => {});
              });
            }
          }

          if (stickyLocked.current || isTransitioning) return;

          // GO STICKY
          if (!isSticky && isPlaying && ratio < STICKY_THRESHOLD) {
            console.log('[VideoCarousel] Going STICKY');
            stickyLocked.current = true;
            setIsTransitioning(true);
            saveVideoState();
            setIsSticky(true);
            restoreVideoState();
            setTimeout(() => { stickyLocked.current = false; }, 600);
          }

          // RETURN TO NORMAL
          if (isSticky && ratio > RETURN_THRESHOLD) {
            console.log('[VideoCarousel] Returning to NORMAL');
            stickyLocked.current = true;
            setIsTransitioning(true);
            saveVideoState();
            setIsSticky(false);
            restoreVideoState();
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
  }, [isPlaying, isSticky, isTransitioning, getVideoElement, saveVideoState, restoreVideoState]);

  // Minimize handler
  const handleMinimize = useCallback(() => {
    if (!isSticky) return;
    stickyLocked.current = true;
    setIsTransitioning(true);
    saveVideoState();
    setIsSticky(false);
    restoreVideoState();
    setTimeout(() => { stickyLocked.current = false; }, 1500);
  }, [isSticky, saveVideoState, restoreVideoState]);

  // Fullscreen toggle
  const handleFullscreen = useCallback(() => {
    const container = isSticky
      ? document.getElementById('sticky-video-portal')
      : containerRef.current;
    const player = container?.querySelector('mux-player') as HTMLVideoElement | null;
    if (!player) return;

    const isFullscreen = !!document.fullscreenElement;
    if (isFullscreen) {
      document.exitFullscreen();
    } else {
      const videoEl = player.querySelector('video') || player;
      if ((videoEl as any).webkitEnterFullscreen) {
        (videoEl as any).webkitEnterFullscreen();
      } else if (videoEl.requestFullscreen) {
        videoEl.requestFullscreen();
      } else if (player.requestFullscreen) {
        player.requestFullscreen();
      }
    }
  }, [isSticky]);

  // Mobile touch gestures for sticky dismiss
  const handleStickyTouchStart = useCallback((e: React.TouchEvent) => {
    if (!isMobile || !isSticky) return;
    setIsTouching(true);
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, [isMobile, isSticky]);

  const handleStickyTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!isMobile) return;
    setIsTouching(false);

    const touch = e.changedTouches[0];
    const now = Date.now();

    // Double-tap for fullscreen
    if (now - lastTapRef.current < 300) {
      handleFullscreen();
      lastTapRef.current = 0;
      return;
    }
    lastTapRef.current = now;

    // Swipe to dismiss
    if (isSticky && touchStartRef.current) {
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      let direction: 'up' | 'left' | 'right' | null = null;
      if (absY > 50 && deltaY < 0 && absY > absX) direction = 'up';
      else if (absX > 80 && deltaX < 0) direction = 'left';
      else if (absX > 80 && deltaX > 0) direction = 'right';

      if (direction) {
        setDismissDirection(direction);
        stickyLocked.current = true;
        setTimeout(() => {
          setIsTransitioning(true);
          saveVideoState();
          setIsSticky(false);
          restoreVideoState();
          setDismissDirection('none');
          setTimeout(() => { stickyLocked.current = false; }, 1500);
        }, 300);
      }
    }
    touchStartRef.current = null;
  }, [isMobile, isSticky, handleFullscreen, saveVideoState, restoreVideoState]);

  const handleStickyTouchCancel = useCallback(() => {
    setIsTouching(false);
    touchStartRef.current = null;
  }, []);

  const getStickyAnimation = useCallback(() => {
    if (dismissDirection !== 'none') {
      const animationMap = { up: 'dismissUp 0.3s ease-out forwards', left: 'dismissLeft 0.3s ease-out forwards', right: 'dismissRight 0.3s ease-out forwards' };
      return animationMap[dismissDirection];
    }
    if (isTouching) return 'none';
    return 'floatVideoSticky 4s ease-in-out infinite';
  }, [dismissDirection, isTouching]);

  // Reset on video change
  useEffect(() => {
    hasAutoPlayed.current = false;
    videoRef.current = null;
  }, [currentIndex]);

  const toggleMute = useCallback(() => {
    const video = getVideoElement();
    if (video) {
      video.muted = !video.muted;
      setIsMuted(video.muted);
      if (!video.muted) video.volume = AUTO_PLAY_VOLUME;
    }
  }, [getVideoElement]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? videos.length - 1 : prev - 1));
    setIsPlaying(false);
  }, [videos.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === videos.length - 1 ? 0 : prev + 1));
    setIsPlaying(false);
  }, [videos.length]);

  // TAP TO UNMUTE: If video is playing but muted, tap unmutes it
  // Otherwise normal play/pause toggle
  const togglePlayPause = useCallback(() => {
    const video = getVideoElement();
    if (!video) return;

    // If playing but muted → unmute (tap to play with volume)
    if (isPlaying && isMuted) {
      video.muted = false;
      video.volume = AUTO_PLAY_VOLUME;
      setIsMuted(false);
      return;
    }

    // Normal play/pause toggle
    if (isPlaying) {
      video.pause();
    } else {
      video.volume = AUTO_PLAY_VOLUME;
      video.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, isMuted, getVideoElement]);

  const handleDoubleClick = useCallback(() => {
    handleFullscreen();
  }, [handleFullscreen]);

  // Calculate sticky width
  const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 500;
  const stickyWidth = Math.min(400, windowWidth - 32);

  // =============================================================================
  // VIDEO PANEL COMPONENT - Used in both normal and sticky modes
  // =============================================================================
  const VideoPanel = ({ inSticky = false }: { inSticky?: boolean }) => (
    <div
      className="glass-crystal rounded-2xl overflow-hidden relative"
      style={inSticky ? {
        animation: getStickyAnimation(),
        boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 16px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1)',
      } : {
        animation: 'float 6s ease-in-out infinite',
      }}
    >
      {/* Video header - ONLY when NOT sticky */}
      {!inSticky && (
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
        className={`relative cursor-pointer overflow-hidden ${inSticky ? 'aspect-video' : 'aspect-video bg-black'}`}
        onClick={togglePlayPause}
        onDoubleClick={handleDoubleClick}
      >
        <MuxPlayer
          key={`${currentVideo.id}-${inSticky ? 'sticky' : 'normal'}`}
          playbackId={currentVideo.muxPlaybackId}
          streamType="on-demand"
          autoPlay={false}
          muted={false}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => {
            const nextIndex = currentIndex === videos.length - 1 ? 0 : currentIndex + 1;
            setCurrentIndex(nextIndex);
            hasAutoPlayed.current = false;
            setTimeout(() => {
              const video = getVideoElement();
              if (video) {
                video.volume = AUTO_PLAY_VOLUME;
                video.muted = isMuted;
                video.play().then(() => {
                  setIsPlaying(true);
                  hasAutoPlayed.current = true;
                }).catch(() => {});
              }
            }, 300);
          }}
          style={{
            width: '100%',
            height: '100%',
            '--controls': 'none',
            objectFit: 'cover',
            '--media-object-fit': 'cover',
            '--video-object-fit': 'cover',
          } as any}
          className="w-full h-full object-cover [&_video]:object-cover [&_video]:w-full [&_video]:h-full"
        />

        {/* Play/Pause overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
            <div className="p-4 rounded-full bg-white/20 backdrop-blur-sm">
              <Play className="w-8 h-8 text-white fill-white" />
            </div>
          </div>
        )}

        {/* TAP FOR VOLUME indicator - shows when playing muted */}
        {isPlaying && isMuted && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="px-4 py-2 rounded-full bg-black/60 backdrop-blur-sm animate-pulse">
              <div className="flex items-center gap-2 text-white text-sm font-medium">
                <Volume2 className="w-5 h-5" />
                <span>Tap for volume</span>
              </div>
            </div>
          </div>
        )}

        {/* STICKY: Minimize button */}
        {inSticky && (
          <button
            onClick={(e) => { e.stopPropagation(); handleMinimize(); }}
            className="absolute top-3 left-3 z-30 p-2 rounded-full bg-black/40 backdrop-blur-sm text-white/70 hover:bg-black/60 hover:text-white transition-all shadow-lg border border-white/10"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        )}

        {/* STICKY: Control buttons */}
        {inSticky && (
          <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); handleFullscreen(); }}
              className="p-2.5 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-all shadow-lg border border-white/10"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); toggleMute(); }}
              className="p-2.5 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-all shadow-lg border border-white/10"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>
        )}

        {/* NORMAL: Fullscreen hint */}
        {!inSticky && (
          <div className="absolute bottom-2 right-2 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
            <div className="px-2 py-1 rounded bg-black/50 text-white text-xs flex items-center gap-1">
              <Maximize2 className="w-3 h-3" />
              <span>Double-click</span>
            </div>
          </div>
        )}

        {/* STICKY: Navigation arrows inside video */}
        {inSticky && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
              className="absolute bottom-3 left-3 z-30 p-2 rounded-full bg-black/30 backdrop-blur-sm text-white/60 hover:bg-black/50 hover:text-white transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goToNext(); }}
              className="absolute bottom-3 right-3 z-30 p-2 rounded-full bg-black/30 backdrop-blur-sm text-white/60 hover:bg-black/50 hover:text-white transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 px-2 py-1 rounded-full bg-black/30 backdrop-blur-sm text-white/60 text-xs">
              {currentIndex + 1} / {videos.length}
            </div>
          </>
        )}
      </div>

      {/* Navigation arrows + Volume - only when NOT sticky */}
      {!inSticky && (
        <div className="flex items-center justify-between p-3 border-t border-white/10">
          <button
            onClick={goToPrevious}
            className="p-2 rounded-full glass-crystal hover:scale-110 transition-transform"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-white" />
          </button>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {videos.map((_, index) => (
                <button
                  key={index}
                  onClick={() => { setCurrentIndex(index); setIsPlaying(false); }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex ? 'bg-blue-500 w-4' : 'bg-gray-400 dark:bg-gray-600 hover:bg-gray-500'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={toggleMute}
              className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              )}
            </button>
          </div>

          <button
            onClick={goToNext}
            className="p-2 rounded-full glass-crystal hover:scale-110 transition-transform"
          >
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-white" />
          </button>
        </div>
      )}
    </div>
  );

  // =============================================================================
  // RENDER
  // =============================================================================
  return (
    <>
      <style jsx global>{stickyAnimationStyles}</style>

      {/* MAIN CONTAINER with rubber band effect */}
      <div
        ref={containerRef}
        className="relative w-full max-w-md mx-auto"
        style={{
          transform: `translateX(${translateX}px)`,
          transition: translateX === 0 ? 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
        }}
      >
        {/* PERMANENT GRADIENT SHADOW */}
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

        {/* AMBIENT MODE: Dynamic glow layer - only when playing and NOT sticky */}
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

        {/* FLOATING WORDS - attached to container, move with rubber band */}
        {!isSticky && (
          <>
            {/* Right side words */}
            {FLOATING_WORDS.right.map((word, i) => (
              <div
                key={`right-${i}`}
                className="absolute p-2 rounded-lg text-xs glass-crystal pointer-events-none"
                style={{
                  right: word.offset,
                  ...(word.top !== undefined ? { top: word.top } : { bottom: word.bottom }),
                  animation: `floatWord ${word.duration}s ease-in-out infinite ${word.delay}s`,
                }}
              >
                <span className={`font-medium text-${word.color}-600 dark:text-${word.color}-400`}>
                  {word.text}
                </span>
              </div>
            ))}
            {/* Left side words */}
            {FLOATING_WORDS.left.map((word, i) => (
              <div
                key={`left-${i}`}
                className="absolute p-2 rounded-lg text-xs glass-crystal pointer-events-none"
                style={{
                  left: word.offset,
                  ...(word.top !== undefined ? { top: word.top } : { bottom: word.bottom }),
                  animation: `floatWord ${word.duration}s ease-in-out infinite ${word.delay}s`,
                }}
              >
                <span className={`font-medium text-${word.color}-600 dark:text-${word.color}-400`}>
                  {word.text}
                </span>
              </div>
            ))}
          </>
        )}

        {/* =============================================================================
            NORMAL MODE: Video directly in DOM (no portal = no delay)
            ============================================================================= */}
        {!isSticky && (
          <VideoPanel inSticky={false} />
        )}

        {/* Placeholder when sticky - maintains layout space */}
        {isSticky && (
          <div
            className="rounded-2xl border border-white/5 flex items-center justify-center"
            style={{
              aspectRatio: '4/3.5',
              background: 'linear-gradient(135deg, rgba(15,15,25,0.3) 0%, rgba(5,5,15,0.3) 100%)',
            }}
          >
            <div className="text-center opacity-40">
              <svg className="w-8 h-8 text-white/30 mx-auto mb-2 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              <p className="text-white/30 text-sm">Video playing above</p>
            </div>
          </div>
        )}

        {/* Video experience hint */}
        <div className="mt-4">
          <VideoExperienceHint />
        </div>
      </div>

      {/* =============================================================================
          STICKY MODE PORTAL: Video floats to top
          ============================================================================= */}
      {isSticky && portalReady && createPortal(
        <div
          id="sticky-video-portal"
          className="fixed z-[9999]"
          style={{
            top: NAVBAR_HEIGHT,
            left: `calc(50% - ${stickyWidth / 2}px)`,
            width: stickyWidth,
          }}
          onTouchStart={handleStickyTouchStart}
          onTouchEnd={handleStickyTouchEnd}
          onTouchCancel={handleStickyTouchCancel}
        >
          <VideoPanel inSticky={true} />
        </div>,
        document.body
      )}
    </>
  );
}

export default VideoCarousel;
