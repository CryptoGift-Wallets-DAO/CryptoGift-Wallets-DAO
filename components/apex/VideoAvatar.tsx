'use client';

/**
 * VideoAvatar - Video profile avatar component
 *
 * Features:
 * - Autoplay video in loop (muted)
 * - Fallback to static image
 * - Apple Watch squircle shape
 * - Hover to unmute indicator
 *
 * Made by mbxarts.com The Moon in a Box property
 * Co-Author: Godez22
 */

import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Play } from 'lucide-react';

interface VideoAvatarProps {
  videoSrc?: string;
  imageSrc?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  enableSound?: boolean;
  onClick?: () => void;
}

const sizeClasses = {
  sm: 'w-10 h-10',
  md: 'w-14 h-14',
  lg: 'w-20 h-20',
  xl: 'w-32 h-32',
};

export function VideoAvatar({
  videoSrc,
  imageSrc = '/apeX22.PNG',
  alt = 'Profile avatar',
  size = 'md',
  className = '',
  enableSound = false,
  onClick,
}: VideoAvatarProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [hasVideo, setHasVideo] = useState(!!videoSrc);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (videoRef.current && videoSrc) {
      videoRef.current.play().catch(() => {
        // Autoplay blocked, show play button
        setIsPlaying(false);
      });
    }
  }, [videoSrc]);

  const handleVideoPlay = () => setIsPlaying(true);
  const handleVideoPause = () => setIsPlaying(false);
  const handleVideoError = () => setHasVideo(false);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const handleClick = () => {
    if (!isPlaying && videoRef.current) {
      videoRef.current.play();
    }
    onClick?.();
  };

  return (
    <div
      className={`
        relative overflow-hidden
        ${sizeClasses[size]}
        rounded-[22%]
        bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600
        p-[2px]
        cursor-pointer
        transition-transform duration-300
        hover:scale-105
        ${className}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <div className="w-full h-full rounded-[22%] overflow-hidden bg-slate-900">
        {hasVideo && videoSrc ? (
          <>
            <video
              ref={videoRef}
              src={videoSrc}
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted={isMuted}
              playsInline
              onPlay={handleVideoPlay}
              onPause={handleVideoPause}
              onError={handleVideoError}
            />

            {/* Sound toggle indicator */}
            {enableSound && isHovered && (
              <button
                onClick={toggleMute}
                className="
                  absolute bottom-1 right-1
                  p-1 rounded-full
                  bg-black/60 backdrop-blur-sm
                  text-white
                  transition-opacity duration-200
                "
              >
                {isMuted ? (
                  <VolumeX className="w-3 h-3" />
                ) : (
                  <Volume2 className="w-3 h-3" />
                )}
              </button>
            )}

            {/* Play indicator if paused */}
            {!isPlaying && (
              <div className="
                absolute inset-0
                flex items-center justify-center
                bg-black/40
              ">
                <Play className="w-6 h-6 text-white" />
              </div>
            )}
          </>
        ) : (
          <img
            src={imageSrc}
            alt={alt}
            className="w-full h-full object-cover"
          />
        )}
      </div>
    </div>
  );
}

export default VideoAvatar;
