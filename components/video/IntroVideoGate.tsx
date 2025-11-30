'use client';

/**
 * INTRO VIDEO GATE
 *
 * Video component that plays before the SalesMasterclass.
 * Users must watch the video before proceeding.
 *
 * Made by mbxarts.com The Moon in a Box property
 * Co-Author: Godez22
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, Volume2, VolumeX, Loader2 } from 'lucide-react';

interface IntroVideoGateProps {
  onVideoComplete: () => void;
  videoUrl?: string;
  title?: string;
  subtitle?: string;
  allowSkip?: boolean;
  skipAfterSeconds?: number;
}

const IntroVideoGate: React.FC<IntroVideoGateProps> = ({
  onVideoComplete,
  videoUrl,
  title = 'Bienvenido a CryptoGift',
  subtitle = 'Una breve introduccion antes de comenzar',
  allowSkip = true,
  skipAfterSeconds = 5
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [canSkip, setCanSkip] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    // Allow skip after specified seconds
    if (allowSkip && skipAfterSeconds > 0) {
      const timer = setTimeout(() => {
        setCanSkip(true);
      }, skipAfterSeconds * 1000);

      return () => clearTimeout(timer);
    }
  }, [allowSkip, skipAfterSeconds]);

  // If no video URL provided, show a placeholder and allow skip
  if (!videoUrl) {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-lg mx-4"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <Play className="w-12 h-12 text-white" />
          </div>

          <h2 className="text-3xl font-bold text-white mb-4">{title}</h2>
          <p className="text-gray-300 mb-8">{subtitle}</p>

          <button
            onClick={onVideoComplete}
            className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-cyan-700 transition-all shadow-lg"
          >
            Comenzar Masterclass
          </button>
        </motion.div>
      </div>
    );
  }

  const handleVideoEnd = () => {
    onVideoComplete();
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(progress);
      setCurrentTime(videoRef.current.currentTime);

      // Allow skip after watching for skipAfterSeconds
      if (allowSkip && videoRef.current.currentTime >= skipAfterSeconds) {
        setCanSkip(true);
      }
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Video Container */}
      <div className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
          </div>
        )}

        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-contain"
          onEnded={handleVideoEnd}
          onTimeUpdate={handleTimeUpdate}
          onLoadedData={() => setIsLoading(false)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          playsInline
          autoPlay
        />

        {/* Controls Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          {/* Progress Bar */}
          <div className="w-full h-1 bg-gray-600 rounded-full mb-4">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={togglePlay}
                className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 text-white" />
                ) : (
                  <Play className="w-6 h-6 text-white" />
                )}
              </button>

              <button
                onClick={toggleMute}
                className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 text-white" />
                ) : (
                  <Volume2 className="w-5 h-5 text-white" />
                )}
              </button>
            </div>

            {/* Skip Button */}
            <AnimatePresence>
              {canSkip && (
                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onClick={onVideoComplete}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-white"
                >
                  <span>Continuar</span>
                  <SkipForward className="w-4 h-4" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntroVideoGate;
