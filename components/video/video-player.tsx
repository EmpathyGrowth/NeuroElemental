'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  SkipBack,
  SkipForward,
  Loader2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type VideoSource = 'youtube' | 'vimeo' | 'direct' | 'unknown';

/** Time in milliseconds before video controls auto-hide */
const CONTROLS_AUTO_HIDE_DELAY = 3000;

interface VideoPlayerProps {
  url: string;
  title?: string;
  poster?: string;
  autoPlay?: boolean;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  className?: string;
}

/**
 * Detect video source type from URL
 */
function detectVideoSource(url: string): VideoSource {
  if (!url) return 'unknown';

  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'youtube';
  }
  if (url.includes('vimeo.com')) {
    return 'vimeo';
  }
  if (url.match(/\.(mp4|webm|ogg|mov)($|\?)/i)) {
    return 'direct';
  }
  // Check if it's an embed URL
  if (url.includes('embed')) {
    if (url.includes('youtube')) return 'youtube';
    if (url.includes('vimeo')) return 'vimeo';
  }
  return 'unknown';
}

/**
 * Convert YouTube URL to embed URL
 */
function getYouTubeEmbedUrl(url: string): string {
  let videoId = '';

  // Handle various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      videoId = match[1];
      break;
    }
  }

  if (!videoId) return url;
  return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`;
}

/**
 * Convert Vimeo URL to embed URL
 */
function getVimeoEmbedUrl(url: string): string {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (match && match[1]) {
    return `https://player.vimeo.com/video/${match[1]}`;
  }
  return url;
}

/**
 * Video Player Component
 * Supports YouTube, Vimeo, and direct video URLs with custom controls for direct videos
 */
export function VideoPlayer({
  url,
  title,
  poster,
  autoPlay = false,
  onProgress,
  onComplete,
  className,
}: VideoPlayerProps) {
  const videoSource = detectVideoSource(url);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [videoError, setVideoError] = useState<string | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Auto-hide controls
  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), CONTROLS_AUTO_HIDE_DELAY);
    }
  }, [isPlaying]);

  // Video event handlers
  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);
      const progress = duration > 0 ? (time / duration) * 100 : 0;
      onProgress?.(progress);
    }
  }, [duration, onProgress]);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsLoading(false);
    }
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    onComplete?.();
  }, [onComplete]);

  const handleVideoError = useCallback(() => {
    setIsLoading(false);
    setVideoError('Failed to load video. Please check the URL and try again.');
  }, []);

  // Control handlers
  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const handleVolumeChange = useCallback((value: number[]) => {
    const newVolume = value[0];
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  }, []);

  const handleSeek = useCallback((value: number[]) => {
    const newTime = value[0];
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  }, []);

  const skip = useCallback((seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(duration, currentTime + seconds));
    }
  }, [currentTime, duration]);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (isFullscreen) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  }, [isFullscreen]);

  const changePlaybackRate = useCallback((rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    }
  }, []);

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Render embedded player for YouTube/Vimeo
  if (videoSource === 'youtube' || videoSource === 'vimeo') {
    const embedUrl = videoSource === 'youtube'
      ? getYouTubeEmbedUrl(url)
      : getVimeoEmbedUrl(url);

    return (
      <div
        ref={containerRef}
        className={cn(
          'relative aspect-video bg-black rounded-lg overflow-hidden',
          className
        )}
      >
        <iframe
          src={embedUrl}
          title={title || 'Video player'}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // Render native video player for direct URLs
  if (videoSource === 'direct') {
    return (
      <div
        ref={containerRef}
        className={cn(
          'relative aspect-video bg-black rounded-lg overflow-hidden group',
          className
        )}
        onMouseMove={resetControlsTimeout}
        onMouseLeave={() => isPlaying && setShowControls(false)}
      >
        {/* Video Element */}
        <video
          ref={videoRef}
          src={url}
          poster={poster}
          className="w-full h-full object-contain"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          onError={handleVideoError}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onWaiting={() => setIsLoading(true)}
          onCanPlay={() => setIsLoading(false)}
          onClick={togglePlay}
          autoPlay={autoPlay}
        />

        {/* Loading Spinner */}
        {isLoading && !videoError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Loader2 className="w-12 h-12 text-white animate-spin" />
          </div>
        )}

        {/* Error Display */}
        {videoError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white p-4">
            <p className="text-lg font-medium mb-2">Video Error</p>
            <p className="text-sm text-gray-300 text-center">{videoError}</p>
          </div>
        )}

        {/* Play Button Overlay (when paused) */}
        {!isPlaying && !isLoading && !videoError && (
          <button
            onClick={togglePlay}
            aria-label="Play video"
            className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity"
          >
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Play className="w-10 h-10 text-white ml-1" />
            </div>
          </button>
        )}

        {/* Controls */}
        <div
          className={cn(
            'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300',
            showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
          )}
        >
          {/* Progress Bar */}
          <div className="mb-3">
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={0.1}
              onValueChange={handleSeek}
              className="cursor-pointer"
            />
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pause video' : 'Play video'}
                className="text-white hover:bg-white/20"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => skip(-10)}
                aria-label="Skip back 10 seconds"
                className="text-white hover:bg-white/20"
              >
                <SkipBack className="w-5 h-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => skip(10)}
                aria-label="Skip forward 10 seconds"
                className="text-white hover:bg-white/20"
              >
                <SkipForward className="w-5 h-5" />
              </Button>

              <div className="flex items-center gap-2 ml-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                  className="text-white hover:bg-white/20"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={1}
                  step={0.01}
                  onValueChange={handleVolumeChange}
                  className="w-20"
                />
              </div>

              <span className="text-white text-sm ml-3">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Playback settings"
                    className="text-white hover:bg-white/20"
                  >
                    <Settings className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                    <DropdownMenuItem
                      key={rate}
                      onClick={() => changePlaybackRate(rate)}
                      className={playbackRate === rate ? 'bg-accent' : ''}
                    >
                      {rate}x
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                className="text-white hover:bg-white/20"
              >
                {isFullscreen ? (
                  <Minimize className="w-5 h-5" />
                ) : (
                  <Maximize className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback for unknown video sources - try iframe
  return (
    <div
      ref={containerRef}
      className={cn(
        'relative aspect-video bg-black rounded-lg overflow-hidden',
        className
      )}
    >
      <iframe
        src={url}
        title={title || 'Video player'}
        className="w-full h-full"
        allowFullScreen
      />
    </div>
  );
}

export default VideoPlayer;
