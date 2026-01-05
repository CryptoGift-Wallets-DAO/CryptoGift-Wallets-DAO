'use client';

/**
 * VideoCarousel - Glass crystal video carousel for landing page
 * Features:
 * - One video at a time with left/right arrows
 * - Click to play/pause
 * - Double-click to fullscreen
 * - Glass crystal styling
 * - i18n support (ES/EN videos)
 *
 * Made by mbxarts.com The Moon in a Box property
 * Co-Author: Godez22
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { useLocale } from 'next-intl';
import dynamic from 'next/dynamic';
import { ChevronLeft, ChevronRight, Play, Maximize2 } from 'lucide-react';
import { VideoExperienceHint } from '@/components/ui/RotatePhoneHint';

/**
 * Custom hook to handle horizontal scroll behavior
 * - Prevents real horizontal scroll (which would stay in place when released)
 * - Simulates iOS-like rubber band overscroll effect for BOTH directions
 */
function useHorizontalOverscroll() {
  const [translateX, setTranslateX] = useState(0);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isHorizontalGesture = useRef<boolean | null>(null);

  useEffect(() => {
    // Only enable on mobile
    const isMobile = window.innerWidth < 768;
    if (!isMobile) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
      isHorizontalGesture.current = null;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touchX = e.touches[0].clientX;
      const touchY = e.touches[0].clientY;
      const deltaX = touchStartX.current - touchX;
      const deltaY = touchStartY.current - touchY;

      // Determine direction on first significant movement
      if (isHorizontalGesture.current === null && (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10)) {
        isHorizontalGesture.current = Math.abs(deltaX) > Math.abs(deltaY);
      }

      // Handle horizontal gestures - prevent native scroll and apply our effect
      if (isHorizontalGesture.current === true) {
        // Prevent native horizontal scroll to avoid vibration
        e.preventDefault();

        // Apply rubber band effect
        const resistance = 0.35;
        const maxTranslate = 60;
        const translateAmount = Math.min(Math.abs(deltaX) * resistance, maxTranslate);

        // Negative deltaX = pulling right (reveal left elements)
        // Positive deltaX = pulling left (reveal right elements)
        setTranslateX(deltaX > 0 ? -translateAmount : translateAmount);
      }
    };

    const handleTouchEnd = () => {
      // Animate back to center
      setTranslateX(0);
      isHorizontalGesture.current = null;
    };

    // Add event listeners - touchmove must be non-passive to allow preventDefault
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
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
      muxPlaybackId: 'Y02PN1hp8Wu2bq7MOBR3YZlyQ7uoF02Bm01lnFVE5y018i4',
      title: '01. El Regalo',
      description: 'El primer paso hacia la confianza real',
      duration: '1 min',
    },
    {
      id: 'the-solution',
      muxPlaybackId: 'jaqNcipaSjC8Dsk1L3P0202K02Eleo01oQmknS2zbqTN1hc',
      title: '02. La Solución',
      description: '5 contratos verificados. 717+ transacciones on-chain',
      duration: '2 min',
    },
    {
      id: 'the-opportunity',
      muxPlaybackId: 'papdpJAYPT8r01ql01pQAu4025VJRMECe7tFM24Oy4T01gU',
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
  const containerRef = useRef<HTMLDivElement>(null);

  // Use custom overscroll hook for rubber band effect on mobile
  const translateX = useHorizontalOverscroll();

  const currentVideo = videos[currentIndex];

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
      {/* Glass crystal container */}
      <div
        ref={containerRef}
        className="glass-crystal rounded-2xl overflow-hidden"
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

        {/* Navigation arrows */}
        <div className="flex items-center justify-between p-3 border-t border-white/10">
          <button
            onClick={goToPrevious}
            className="p-2 rounded-full glass-crystal hover:scale-110 transition-transform"
            aria-label="Previous video"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-white" />
          </button>

          {/* Dots indicator */}
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

          <button
            onClick={goToNext}
            className="p-2 rounded-full glass-crystal hover:scale-110 transition-transform"
            aria-label="Next video"
          >
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-white" />
          </button>
        </div>
      </div>

      {/* Floating elements - RIGHT SIDE */}
      <div className="absolute -top-6 -right-20 lg:-right-28 p-2 rounded-lg text-xs glass-crystal" style={{ animation: 'float 4s ease-in-out infinite 0.5s' }}>
        <span className="font-medium text-purple-600 dark:text-purple-400">Open</span>
      </div>

      <div className="absolute top-4 -right-28 lg:-right-40 p-2 rounded-lg text-xs glass-crystal" style={{ animation: 'float 5s ease-in-out infinite 1s' }}>
        <span className="font-medium text-blue-600 dark:text-blue-400">Secure</span>
      </div>

      <div className="absolute top-20 -right-24 lg:-right-32 p-2 rounded-lg text-xs glass-crystal" style={{ animation: 'float 4.5s ease-in-out infinite 0.2s' }}>
        <span className="font-medium text-green-600 dark:text-green-400">Human</span>
      </div>

      <div className="absolute top-36 -right-32 lg:-right-48 p-2 rounded-lg text-xs glass-crystal" style={{ animation: 'float 5.5s ease-in-out infinite 1.5s' }}>
        <span className="font-medium text-cyan-600 dark:text-cyan-400">Gift in 5 min</span>
      </div>

      <div className="absolute bottom-12 -right-20 lg:-right-28 p-2 rounded-lg text-xs glass-crystal" style={{ animation: 'float 4.3s ease-in-out infinite 0.7s' }}>
        <span className="font-medium text-teal-600 dark:text-teal-400">Easy claim</span>
      </div>

      <div className="absolute bottom-28 -right-36 lg:-right-52 p-2 rounded-lg text-xs glass-crystal" style={{ animation: 'float 5.8s ease-in-out infinite 1.8s' }}>
        <span className="font-medium text-sky-600 dark:text-sky-400">Base L2</span>
      </div>

      {/* Video experience hint - Below video */}
      <div className="mt-4">
        <VideoExperienceHint />
      </div>

      {/* Floating elements - LEFT SIDE (moved much further left) */}
      <div className="absolute -top-8 -left-24 lg:-left-36 p-2 rounded-lg text-xs glass-crystal" style={{ animation: 'float 5s ease-in-out infinite 0.8s' }}>
        <span className="font-medium text-emerald-600 dark:text-emerald-400">No gas</span>
      </div>

      <div className="absolute top-6 -left-32 lg:-left-48 p-2 rounded-lg text-xs glass-crystal" style={{ animation: 'float 4.2s ease-in-out infinite 0.3s' }}>
        <span className="font-medium text-amber-600 dark:text-amber-400">No complications</span>
      </div>

      <div className="absolute top-24 -left-28 lg:-left-40 p-2 rounded-lg text-xs glass-crystal" style={{ animation: 'float 5.2s ease-in-out infinite 1.2s' }}>
        <span className="font-medium text-rose-600 dark:text-rose-400">No fear</span>
      </div>

      <div className="absolute top-40 -left-36 lg:-left-52 p-2 rounded-lg text-xs glass-crystal" style={{ animation: 'float 4.8s ease-in-out infinite 0.6s' }}>
        <span className="font-medium text-indigo-600 dark:text-indigo-400">100% yours</span>
      </div>

      <div className="absolute bottom-20 -left-24 lg:-left-32 p-2 rounded-lg text-xs glass-crystal" style={{ animation: 'float 4.6s ease-in-out infinite 1.4s' }}>
        <span className="font-medium text-fuchsia-600 dark:text-fuchsia-400">Web3 simple</span>
      </div>

      <div className="absolute bottom-4 -left-32 lg:-left-44 p-2 rounded-lg text-xs glass-crystal" style={{ animation: 'float 5.4s ease-in-out infinite 0.9s' }}>
        <span className="font-medium text-orange-600 dark:text-orange-400">Intuitive UX</span>
      </div>
    </div>
  );
}

export default VideoCarousel;
