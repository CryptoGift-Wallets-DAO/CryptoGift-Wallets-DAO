/**
 * INTRO VIDEO GATE - Sistema reutilizable de video para lecciones
 * Componente simplificado con controles nativos de MuxPlayer (mobile-optimized)
 * Soporta Mux Player con persistencia de progreso
 *
 * FEATURES:
 * - AMBIENT MODE: YouTube-style glow effect from video colors
 * - Auto-play when >50% visible with 15% volume
 * - Picture-in-Picture when <30% visible
 *
 * Made by mbxarts.com The Moon in a Box property
 * Co-Author: Godez22
 */

"use client";

import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { SkipForward, ArrowLeft, Volume2, VolumeX } from 'lucide-react';

// Ambient Mode configuration
const AMBIENT_CONFIG = {
  blur: 80,
  opacity: 0.5,
  brightness: 1.15,
  saturate: 1.3,
  scale: 1.18,
  updateInterval: 100
};

const AUTO_PLAY_VOLUME = 0.15;

// Carga perezosa del Mux Player para optimización
// @ts-ignore - Mux player types may not be available
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
          <p className="text-white/80 text-lg">Cargando video...</p>
        </div>
      </div>
    )
  }
);

interface IntroVideoGateProps {
  lessonId: string;           // ID único de la lección (para persistencia)
  muxPlaybackId: string;      // Playback ID de Mux
  poster?: string;            // Imagen de portada opcional
  captionsVtt?: string;       // Subtítulos opcionales
  title?: string;             // Título del video
  description?: string;       // Descripción opcional
  onFinish: () => void;       // Callback al terminar/saltar
  onBack?: () => void;        // Callback para volver atrás (al Welcome)
  autoSkip?: boolean;         // Si debe saltarse automáticamente si ya se vio
  forceShow?: boolean;        // Forzar mostrar aunque ya se haya visto
}

export default function IntroVideoGate({
  lessonId,
  muxPlaybackId,
  poster,
  captionsVtt,
  title = "Video Introductorio",
  description,
  onFinish,
  onBack,
  autoSkip = true,
  forceShow = false,
}: IntroVideoGateProps) {
  // Key para localStorage - permite resetear fácilmente cambiando el lessonId
  const storageKey = useMemo(() => `intro_video_seen:${lessonId}`, [lessonId]);

  // Estados simplificados
  const [show, setShow] = useState(true);
  const [showSkipButton, setShowSkipButton] = useState(true);

  // Ambient Mode state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isInPiP, setIsInPiP] = useState(false);
  const [ambientColors, setAmbientColors] = useState({
    dominant: 'rgba(139, 92, 246, 0.35)',
    secondary: 'rgba(6, 182, 212, 0.25)',
    accent: 'rgba(168, 85, 247, 0.3)'
  });

  // Refs for video element and canvas
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
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

  // Get video element from MuxPlayer
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
    } catch { /* PiP not supported or denied */ }
  }, [getVideoElement, isInPiP]);

  // Exit Picture-in-Picture
  const exitPiP = useCallback(async () => {
    if (!isInPiP) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsInPiP(false);
      }
    } catch { /* Already exited */ }
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
                }).catch(() => { /* Autoplay blocked */ });
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

  // Toggle mute
  const toggleMute = useCallback(() => {
    const video = getVideoElement();
    if (video) {
      video.muted = !video.muted;
      setIsMuted(video.muted);
      if (!video.muted) video.volume = AUTO_PLAY_VOLUME;
    }
  }, [getVideoElement]);

  // Check si ya se vio antes (solo si autoSkip está habilitado)
  // En módulo educacional, siempre mostrar video
  useEffect(() => {
    // Comentado para siempre mostrar el video en educacional
    // if (!forceShow && autoSkip && typeof window !== "undefined") {
    //   const seen = localStorage.getItem(storageKey);
    //   if (seen === "completed") {
    //     setShow(false);
    //     onFinish();
    //   }
    // }
  }, [storageKey, onFinish, autoSkip, forceShow]);

  // Handlers
  const handleFinish = useCallback(() => {
    console.log('📹 Video finished naturally');
    localStorage.setItem(storageKey, "completed");
    setShow(false);
    onFinish();
  }, [storageKey, onFinish]);

  const handleSkip = useCallback(() => {
    console.log('⏭️ Video skipped by user');
    // Marcar como visto pero con flag de "skipped"
    localStorage.setItem(storageKey, "skipped");
    setShow(false);
    onFinish();
  }, [storageKey, onFinish]);

  if (!show) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        ref={containerRef}
        className="relative w-full max-w-6xl mx-auto"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
      >
        {/* AMBIENT MODE: Glow layer behind video */}
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

        {/* Glass container with premium aesthetic */}
        <div className="relative aspect-video w-full z-10
          bg-gradient-to-br from-gray-900/95 to-black/95
          backdrop-blur-xl backdrop-saturate-150
          rounded-3xl overflow-hidden
          border border-white/10 dark:border-gray-800/50
          shadow-2xl shadow-purple-500/20">

          {/* Mux Player with NATIVE CONTROLS ONLY */}
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
              width: "100%",
              height: "100%",
              position: "absolute",
              top: 0,
              left: 0
            }}
            metadata={{
              video_title: title,
              video_series: "CryptoGift Educational"
            }}
          >
            {captionsVtt && (
              <track
                kind="subtitles"
                srcLang="es"
                src={captionsVtt}
                default
                label="Español"
              />
            )}
          </MuxPlayer>

        </div>

        {/* Title, description and skip button - OUTSIDE video player for clean viewing */}
        <div className="mt-6 space-y-4">
          {/* Title and description card */}
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

          {/* Navigation buttons */}
          <div className="flex justify-center items-center gap-4">
            {/* Back button */}
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
                aria-label="Volver"
              >
                <ArrowLeft className="w-6 h-6" />
                <span>Volver</span>
              </button>
            )}

            {/* Volume toggle */}
            <button
              onClick={toggleMute}
              className="p-3 rounded-xl
                bg-white/10 dark:bg-black/30
                hover:bg-white/20 dark:hover:bg-black/40
                backdrop-blur-xl border border-gray-300/30 dark:border-gray-700/30
                transition-all hover:scale-105
                shadow-lg"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <VolumeX className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              ) : (
                <Volume2 className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              )}
            </button>

            {/* Skip intro button */}
            {showSkipButton && (
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
                aria-label="Saltar introducción"
              >
                <SkipForward className="w-6 h-6" />
                <span>Saltar intro</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
