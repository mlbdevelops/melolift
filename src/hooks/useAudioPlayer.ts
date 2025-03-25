
import { useState, useEffect, useRef } from 'react';
import { playAudioBuffer } from '../services/audioService';

export interface AudioPlayerControls {
  isPlaying: boolean;
  playbackRate: number;
  currentTime: number;
  duration: number;
  togglePlayback: () => void;
  setPlaybackRate: (rate: number) => void;
  seek: (time: number) => void;
}

export const useAudioPlayer = (audioBuffer: AudioBuffer | null): AudioPlayerControls => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const playerRef = useRef<{ 
    start: () => void; 
    stop: () => void;
    setPlaybackRate: (rate: number) => void;
    seek: (time: number) => void;
  } | null>(null);
  
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);

  useEffect(() => {
    // Set duration when buffer changes
    if (audioBuffer) {
      setDuration(audioBuffer.duration);
    } else {
      setDuration(0);
    }
    
    // Stop any current playback when buffer changes
    if (playerRef.current) {
      playerRef.current.stop();
      setIsPlaying(false);
      playerRef.current = null;
    }
    
    setCurrentTime(0);
  }, [audioBuffer]);

  // Animation frame callback to update current time
  const updateTime = () => {
    if (isPlaying && audioBuffer) {
      const now = performance.now();
      const elapsed = (now - startTimeRef.current) / 1000 * playbackRate;
      const newTime = Math.min(pausedTimeRef.current + elapsed, audioBuffer.duration);
      
      setCurrentTime(newTime);
      
      if (newTime >= audioBuffer.duration) {
        // Stop at the end
        if (playerRef.current) {
          playerRef.current.stop();
          playerRef.current = null;
        }
        setIsPlaying(false);
        pausedTimeRef.current = 0;
        setCurrentTime(0);
      } else {
        animationRef.current = requestAnimationFrame(updateTime);
      }
    }
  };

  const togglePlayback = () => {
    if (!audioBuffer) return;

    if (isPlaying && playerRef.current) {
      // Pause playback
      playerRef.current.stop();
      pausedTimeRef.current = currentTime;
      playerRef.current = null;
      setIsPlaying(false);
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    } else {
      // Start playback
      playerRef.current = playAudioBuffer(audioBuffer, () => {
        setIsPlaying(false);
        playerRef.current = null;
        pausedTimeRef.current = 0;
        setCurrentTime(0);
      });
      
      // Set playback rate
      playerRef.current.setPlaybackRate(playbackRate);
      
      // If we're seeking, tell the player where to start
      if (currentTime > 0) {
        playerRef.current.seek(currentTime);
      }
      
      startTimeRef.current = performance.now();
      playerRef.current.start();
      setIsPlaying(true);
      
      animationRef.current = requestAnimationFrame(updateTime);
    }
  };

  const handleSetPlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    if (playerRef.current && isPlaying) {
      playerRef.current.setPlaybackRate(rate);
    }
  };

  const seek = (time: number) => {
    if (!audioBuffer) return;
    
    const clampedTime = Math.max(0, Math.min(time, audioBuffer.duration));
    setCurrentTime(clampedTime);
    pausedTimeRef.current = clampedTime;
    
    if (isPlaying && playerRef.current) {
      playerRef.current.stop();
      playerRef.current = playAudioBuffer(audioBuffer, () => {
        setIsPlaying(false);
        playerRef.current = null;
        pausedTimeRef.current = 0;
        setCurrentTime(0);
      });
      
      playerRef.current.setPlaybackRate(playbackRate);
      playerRef.current.seek(clampedTime);
      startTimeRef.current = performance.now();
      playerRef.current.start();
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      animationRef.current = requestAnimationFrame(updateTime);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (playerRef.current) {
        playerRef.current.stop();
      }
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return {
    isPlaying,
    playbackRate,
    currentTime,
    duration,
    togglePlayback,
    setPlaybackRate: handleSetPlaybackRate,
    seek
  };
};
