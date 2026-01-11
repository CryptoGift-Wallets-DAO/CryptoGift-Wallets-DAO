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
 * - Auto-play when >50% visible with 15% volume
 * - Picture-in-Picture when <30% visible
 *
 * Made by mbxarts.com The Moon in a Box property
 * Co-Author: Godez22
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { useLocale } from 'next-intl';
import dynamic from 'next/dynamic';
import { ChevronLeft, ChevronRight, Play, Maximize2, Volume2, VolumeX } from 'lucide-react';
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
  const [isInPiP, setIsInPiP] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ambientIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasAutoPlayed = useRef(false);

  // Ambient Mode state
  const [ambientColors, setAmbientColors] = useState({
    dominant: 'rgba(139, 92, 246, 0.35)',
    secondary: 'rgba(6, 182, 212, 0.25)',
    accent: 'rgba(168, 85, 247, 0.3)'
  });

  // Use custom overscroll hook for rubber band effect on mobile
  const translateX = useHorizontalOverscroll();

  const currentVideo = videos[currentIndex];

  // Create canvas for color extraction
  useEffect(() => {
    if (typeof document !== 'undefined' && !canvasRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = 16;
      canvas.height = 9;
      canvasRef.current = canvas;
    }
  }, []);

  // Get video element from MuxPlayer
  const getVideoElement = useCallback((): HTMLVideoElement | null => {
    if (videoRef.current) return videoRef.current;
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
      const video = containerRef.current.querySelector('video');
      if (video) {
        videoRef.current = video;
        return video;
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

  // Enter Picture-in-Picture
  const enterPiP = useCallback(async () => {
    const video = getVideoElement();
    if (!video || isInPiP) return;
    try {
      if (document.pictureInPictureEnabled && !document.pictureInPictureElement) {
        await video.requestPictureInPicture();
        setIsInPiP(true);
      }
    } catch {}
  }, [getVideoElement, isInPiP]);

  // Exit Picture-in-Picture
  const exitPiP = useCallback(async () => {
    if (!isInPiP) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsInPiP(false);
      }
    } catch {}
  }, [isInPiP]);

  // IntersectionObserver for auto-play and PiP
  useEffect(() => {
    if (!containerRef.current) return;

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

          // PiP when <30% visible
          if (ratio < 0.3 && isPlaying && !isInPiP) enterPiP();
          if (ratio > 0.5 && isInPiP) exitPiP();
        });
      },
      { threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0] }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [isPlaying, isInPiP, getVideoElement, enterPiP, exitPiP]);

  // Reset hasAutoPlayed when video changes
  useEffect(() => {
    hasAutoPlayed.current = false;
    videoRef.current = null;
  }, [currentIndex]);

  // Toggle mute
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

  const togglePlayPause = useCallback(() => {
    const player = containerRef.current?.querySelector('mux-player') as HTMLVideoElement | null;
    if (player) {
      if (isPlaying) {
        player.pause();
      } else {
        player.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const handleDoubleClick = useCallback(() => {
    const player = containerRef.current?.querySelector('mux-player') as HTMLVideoElement | null;
    if (player) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        player.requestFullscreen?.();
      }
    }
  }, []);

  return (
    <div
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
      {isPlaying && (
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

      {/* Glass crystal container */}
      <div
        ref={containerRef}
        className="glass-crystal rounded-2xl overflow-hidden relative z-10"
        style={{ animation: 'float 6s ease-in-out infinite' }}
      >
        {/* Video header */}
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

        {/* Video player area */}
        <div
          className="relative aspect-video bg-black cursor-pointer"
          onClick={togglePlayPause}
          onDoubleClick={handleDoubleClick}
        >
          <MuxPlayer
            key={currentVideo.id}
            playbackId={currentVideo.muxPlaybackId}
            streamType="on-demand"
            autoPlay={false}
            muted={false}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            style={{
              width: '100%',
              height: '100%',
              '--controls': 'none',
            } as any}
            className="w-full h-full"
          />

          {/* Play/Pause overlay (shows when paused) */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
              <div className="p-4 rounded-full bg-white/20 backdrop-blur-sm">
                <Play className="w-8 h-8 text-white fill-white" />
              </div>
            </div>
          )}

          {/* Fullscreen hint */}
          <div className="absolute bottom-2 right-2 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
            <div className="px-2 py-1 rounded bg-black/50 text-white text-xs flex items-center gap-1">
              <Maximize2 className="w-3 h-3" />
              <span>Double-click</span>
            </div>
          </div>
        </div>

        {/* Navigation arrows + Volume control */}
        <div className="flex items-center justify-between p-3 border-t border-white/10">
          <button
            onClick={goToPrevious}
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
                  onClick={() => {
                    setCurrentIndex(index);
                    setIsPlaying(false);
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
              onClick={toggleMute}
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
            onClick={goToNext}
            className="p-2 rounded-full glass-crystal hover:scale-110 transition-transform"
            aria-label="Next video"
          >
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-white" />
          </button>
        </div>
      </div>

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
  );
}

export default VideoCarousel;
