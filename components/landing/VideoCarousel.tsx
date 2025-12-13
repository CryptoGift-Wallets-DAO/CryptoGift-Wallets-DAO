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

import { useState, useRef, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import dynamic from 'next/dynamic';
import { ChevronLeft, ChevronRight, Play, Pause, Maximize2 } from 'lucide-react';

// Lazy load MUX Player
const MuxPlayer = dynamic(
  () => import('@mux/mux-player-react').then(mod => mod.default),
  { ssr: false, loading: () => <div className="w-full h-full bg-black/50 animate-pulse rounded-xl" /> }
);

// Video configurations per language
const VIDEOS = {
  es: [
    {
      id: 'intro-es',
      muxPlaybackId: '3W6iaGGBJN2AyMh37o5Qg3kdNDEFi2JP4UIBRK00QJhE',
      title: 'Presentación Completa',
      description: 'Descubre cómo regalar activos digitales de valor real',
      duration: '10 min',
    },
    {
      id: 'outro-es',
      muxPlaybackId: 'PBqn7kacf00PoAczsHLk02TyU01OAx4VdUNYJaYdbbasQw',
      title: 'CryptoGift Club',
      description: 'Oportunidades exclusivas como miembro del club',
      duration: '3 min',
    },
  ],
  en: [
    {
      id: 'intro-en',
      muxPlaybackId: '3lWAgyukmAHnff02tpTAzYD00DeftIi005YWLmk5AYFs00Y',
      title: 'Full Presentation',
      description: 'Learn how to gift real digital assets',
      duration: '10 min',
    },
    {
      id: 'outro-en',
      muxPlaybackId: 'dsEZYVMpcrkuNvn0200p8C7nz9qEqY3dr7Mx9OiauZSro',
      title: 'CryptoGift Club',
      description: 'Exclusive opportunities as a club member',
      duration: '3 min',
    },
  ],
};

export function VideoCarousel() {
  const t = useTranslations('landing');
  const locale = useLocale() as 'es' | 'en';
  const videos = VIDEOS[locale] || VIDEOS.en;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
    <div className="relative w-full max-w-md mx-auto">
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

      {/* Floating elements similar to hero card */}
      <div className="absolute -top-4 -right-12 lg:-right-16 p-2 rounded-lg text-xs glass-crystal" style={{ animation: 'float 4s ease-in-out infinite 1s' }}>
        <div className="flex items-center gap-1.5">
          <Play className="w-3.5 h-3.5 text-purple-500 fill-purple-500" />
          <span className="font-medium text-gray-700 dark:text-white">{t('videoCarousel.watch')}</span>
        </div>
      </div>

      <div className="absolute -bottom-4 -left-12 lg:-left-16 p-2 rounded-lg text-xs glass-crystal" style={{ animation: 'float 5s ease-in-out infinite 0.5s' }}>
        <div className="flex items-center gap-1.5">
          <span className="text-green-500 font-bold">HD</span>
          <span className="font-medium text-gray-700 dark:text-white">{t('videoCarousel.quality')}</span>
        </div>
      </div>
    </div>
  );
}

export default VideoCarousel;
