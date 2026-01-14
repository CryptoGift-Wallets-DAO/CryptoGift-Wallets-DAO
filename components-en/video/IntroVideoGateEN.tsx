/**
 * INTRO VIDEO GATE EN - Reusable video system for lessons (English version)
 * STATIC component (no wobble) for SalesMasterclass
 *
 * FEATURES:
 * - GLOBAL AUDIO UNLOCK: Click anywhere on page unlocks audio playback
 * - Auto-play when visible with 15% volume
 * - Click to play/pause, double-click for fullscreen
 * - NO portal rendering, NO position tracking = ZERO wobble
 *
 * Made by mbxarts.com The Moon in a Box property
 * Co-Author: Godez22
 */

"use client";

import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { SkipForward, ArrowLeft, Play, Maximize2 } from 'lucide-react';

const AUTO_PLAY_VOLUME = 0.15;

// Lazy load MUX Player
const MuxPlayer = dynamic(
  () => import('@mux/mux-player-react').then(mod => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="relative aspect-video w-full flex items-center justify-center
        bg-gradient-to-br from-gray-900/95 to-black/95 rounded-3xl">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent
            rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/80 text-lg">Loading video...</p>
        </div>
      </div>
    )
  }
);

interface IntroVideoGateProps {
  lessonId: string;
  muxPlaybackId: string;
  poster?: string;
  captionsVtt?: string;
  title?: string;
  description?: string;
  onFinish: () => void;
  onBack?: () => void;
  autoSkip?: boolean;
  forceShow?: boolean;
}

export default function IntroVideoGate({
  lessonId,
  muxPlaybackId,
  poster,
  captionsVtt,
  title = "Introductory Video",
  description,
  onFinish,
  onBack,
}: IntroVideoGateProps) {
  const storageKey = useMemo(() => `intro_video_seen:${lessonId}`, [lessonId]);

  const [show, setShow] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hasAutoPlayed = useRef(false);
  const audioUnlocked = useRef(false);

  // Get video element from MuxPlayer shadow DOM
  const getVideoElement = useCallback((): HTMLVideoElement | null => {
    if (videoRef.current) return videoRef.current;
    if (containerRef.current) {
      const muxPlayer = containerRef.current.querySelector('mux-player');
      if (muxPlayer) {
        const shadowRoot = (muxPlayer as HTMLElement & { shadowRoot: ShadowRoot | null }).shadowRoot;
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

  // GLOBAL AUDIO UNLOCK: Detect ANY user interaction
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleUserInteraction = () => {
      if (!audioUnlocked.current) {
        audioUnlocked.current = true;

        const video = getVideoElement();
        if (video && video.paused && !hasAutoPlayed.current) {
          video.muted = false;
          video.volume = AUTO_PLAY_VOLUME;
          video.play().then(() => {
            hasAutoPlayed.current = true;
            setIsPlaying(true);
          }).catch(() => {});
        }
      }
    };

    document.addEventListener('click', handleUserInteraction, { capture: true, passive: true });
    document.addEventListener('touchstart', handleUserInteraction, { capture: true, passive: true });
    document.addEventListener('keydown', handleUserInteraction, { capture: true, passive: true });

    return () => {
      document.removeEventListener('click', handleUserInteraction, { capture: true });
      document.removeEventListener('touchstart', handleUserInteraction, { capture: true });
      document.removeEventListener('keydown', handleUserInteraction, { capture: true });
    };
  }, [getVideoElement]);

  // Auto-play when visible (single threshold - no wobble)
  useEffect(() => {
    if (!containerRef.current || hasAutoPlayed.current) return;

    const attemptAutoplay = () => {
      if (hasAutoPlayed.current) return;
      const video = getVideoElement();
      if (!video) return;

      video.volume = AUTO_PLAY_VOLUME;
      video.muted = !audioUnlocked.current;

      video.play().then(() => {
        hasAutoPlayed.current = true;
        setIsPlaying(true);
      }).catch(() => {
        // Try muted as fallback
        video.muted = true;
        video.play().then(() => {
          hasAutoPlayed.current = true;
          setIsPlaying(true);
        }).catch(() => {});
      });
    };

    // Simple observer - single threshold = no excessive callbacks
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAutoPlayed.current) {
          attemptAutoplay();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [getVideoElement]);

  // Handlers
  const handleFinish = useCallback(() => {
    localStorage.setItem(storageKey, "completed");
    setShow(false);
    onFinish();
  }, [storageKey, onFinish]);

  const handleSkip = useCallback(() => {
    localStorage.setItem(storageKey, "skipped");
    setShow(false);
    onFinish();
  }, [storageKey, onFinish]);

  const handleVideoClick = useCallback(() => {
    audioUnlocked.current = true;
    const video = getVideoElement();
    if (video) {
      if (video.paused) {
        video.volume = AUTO_PLAY_VOLUME;
        video.muted = false;
        video.play().then(() => setIsPlaying(true)).catch(() => {
          video.muted = true;
          video.play().then(() => setIsPlaying(true)).catch(() => {});
        });
      } else {
        video.pause();
        setIsPlaying(false);
      }
    }
  }, [getVideoElement]);

  const handleDoubleClick = useCallback(() => {
    const player = containerRef.current?.querySelector('mux-player') as HTMLElement | null;
    if (player) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        player.requestFullscreen?.();
      }
    }
  }, []);

  if (!show) return null;

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-4xl mx-auto"
    >
      {/* Static glow - CSS only, no JavaScript updates */}
      <div
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 120% 100% at 50% 0%, rgba(6, 182, 212, 0.25) 0%, transparent 60%),
            radial-gradient(ellipse 100% 120% at 0% 50%, rgba(139, 92, 246, 0.35) 0%, transparent 55%),
            radial-gradient(ellipse 100% 120% at 100% 50%, rgba(168, 85, 247, 0.3) 0%, transparent 55%),
            radial-gradient(ellipse 120% 100% at 50% 100%, rgba(139, 92, 246, 0.35) 0%, transparent 60%)
          `,
          filter: 'blur(80px)',
          opacity: 0.5,
          transform: 'scale(1.18)',
        }}
      />

      {/* Video container - STATIC position, no transforms */}
      <div
        className="relative aspect-video w-full
          bg-gradient-to-br from-gray-900/95 to-black/95
          backdrop-blur-xl backdrop-saturate-150
          rounded-3xl overflow-hidden
          border border-white/10 dark:border-gray-800/50
          shadow-2xl shadow-purple-500/20 z-10
          cursor-pointer"
        onClick={handleVideoClick}
        onDoubleClick={handleDoubleClick}
      >
        <MuxPlayer
          playbackId={muxPlaybackId}
          streamType="on-demand"
          autoPlay={false}
          muted={false}
          playsInline
          poster={poster}
          onEnded={handleFinish}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            '--controls': 'none',
          } as React.CSSProperties}
          className="w-full h-full"
          metadata={{
            video_title: title,
            video_series: "CryptoGift Educational"
          }}
        >
          {captionsVtt && (
            <track
              kind="subtitles"
              srcLang="en"
              src={captionsVtt}
              default
              label="English"
            />
          )}
        </MuxPlayer>

        {/* Play overlay */}
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
            <span>Double click</span>
          </div>
        </div>
      </div>

      {/* Title, description and buttons */}
      <div className="mt-6 space-y-4">
        <div className="bg-white/10 dark:bg-black/30
          backdrop-blur-xl backdrop-saturate-150
          rounded-2xl px-6 py-4
          border border-white/20 dark:border-gray-700/50
          shadow-xl">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {description}
            </p>
          )}
        </div>

        <div className="flex justify-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="px-6 py-4 rounded-xl
                bg-white/10 dark:bg-black/30
                hover:bg-white/20 dark:hover:bg-black/40
                text-gray-700 dark:text-gray-300 font-bold text-lg
                backdrop-blur-xl border border-gray-300/30 dark:border-gray-700/30
                transition-all hover:scale-105
                shadow-lg
                flex items-center gap-3"
            >
              <ArrowLeft className="w-6 h-6" />
              <span>Back</span>
            </button>
          )}

          <button
            onClick={handleSkip}
            className="px-8 py-4 rounded-xl
              bg-gradient-to-r from-purple-500 to-pink-500
              hover:from-purple-600 hover:to-pink-600
              text-white font-bold text-lg
              backdrop-blur-xl border border-purple-400/30
              transition-all hover:scale-105
              shadow-lg shadow-purple-500/30
              flex items-center gap-3"
          >
            <SkipForward className="w-6 h-6" />
            <span>Skip intro</span>
          </button>
        </div>
      </div>
    </div>
  );
}
