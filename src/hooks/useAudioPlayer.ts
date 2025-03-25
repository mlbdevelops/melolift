
import { useState, useEffect, useRef } from 'react';
import { playAudioBuffer } from '../services/audioService';

export const useAudioPlayer = (audioBuffer: AudioBuffer | null) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef<{ start: () => void; stop: () => void } | null>(null);

  useEffect(() => {
    // Stop any current playback when buffer changes
    if (playerRef.current) {
      playerRef.current.stop();
      setIsPlaying(false);
      playerRef.current = null;
    }
  }, [audioBuffer]);

  const togglePlayback = () => {
    if (!audioBuffer) return;

    if (isPlaying && playerRef.current) {
      playerRef.current.stop();
      playerRef.current = null;
      setIsPlaying(false);
    } else {
      playerRef.current = playAudioBuffer(audioBuffer, () => {
        setIsPlaying(false);
        playerRef.current = null;
      });
      playerRef.current.start();
      setIsPlaying(true);
    }
  };

  return {
    isPlaying,
    togglePlayback
  };
};
