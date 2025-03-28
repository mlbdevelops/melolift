
import { useEffect, useRef, useState } from "react";
import { toast } from "@/hooks/use-toast";

interface AudioVisualizerProps {
  audioUrl?: string;
  isPlaying?: boolean;
  className?: string;
}

const AudioVisualizer = ({ audioUrl, isPlaying = false, className = "" }: AudioVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationRef = useRef<number>(0);
  const [isAudioSetup, setIsAudioSetup] = useState(false);

  // Create or reset audio setup when component mounts
  useEffect(() => {
    // Initialize audio context only once
    if (!audioContextRef.current) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
    }
    
    return () => {
      // On unmount, clean everything up
      if (sourceNodeRef.current) {
        sourceNodeRef.current.disconnect();
        sourceNodeRef.current = null;
      }
      
      cancelAnimationFrame(animationRef.current);
      
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      
      setIsAudioSetup(false);
    };
  }, []);

  // Handle URL changes by recreating audio element
  useEffect(() => {
    // Cleanup previous audio element and connections
    if (sourceNodeRef.current) {
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
    
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    setIsAudioSetup(false);
    
    // Create new audio element with new URL
    if (audioUrl) {
      const newAudio = new Audio();
      newAudio.crossOrigin = "anonymous";
      newAudio.src = audioUrl;
      newAudio.addEventListener('error', (e) => {
        console.error("Audio loading error:", e);
      });
      
      // Replace the current audio element
      audioRef.current = newAudio;
      
      // Set up audio once it's loaded enough
      newAudio.addEventListener('canplaythrough', setupAudioSource);
      
      // Attempt to load the audio
      newAudio.load();
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('canplaythrough', setupAudioSource);
      }
    };
  }, [audioUrl]);

  const setupAudioSource = () => {
    if (
      !audioRef.current || 
      !audioContextRef.current || 
      !analyserRef.current ||
      isAudioSetup
    ) {
      return;
    }
    
    try {
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
      
      // Create and connect source
      sourceNodeRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
      sourceNodeRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);
      
      setIsAudioSetup(true);
    } catch (error) {
      console.error("Error setting up audio source:", error);
      console.log("Current audio element:", audioRef.current);
      console.log("Audio context state:", audioContextRef.current.state);
      
      // Reset for retry
      if (sourceNodeRef.current) {
        sourceNodeRef.current.disconnect();
        sourceNodeRef.current = null;
      }
    }
  };

  // Handle play/pause
  useEffect(() => {
    if (!audioRef.current || !audioUrl) return;

    if (isPlaying) {
      // If audio context is suspended (e.g. on mobile), resume it
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }
      
      // Try to play the audio
      audioRef.current.play().catch(error => {
        console.error("Error playing audio:", error);
        toast.error("Failed to play audio. Try again or use a different browser.");
      });
      
      // Start visualizer
      if (isAudioSetup) {
        drawVisualizer();
      }
    } else {
      // Pause the audio
      audioRef.current.pause();
      cancelAnimationFrame(animationRef.current);
    }
  }, [isPlaying, audioUrl, isAudioSetup]);

  const drawVisualizer = () => {
    if (!canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      
      // Get frequency data
      analyser.getByteFrequencyData(dataArray);

      // Resize canvas to match container
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      
      const WIDTH = canvas.width;
      const HEIGHT = canvas.height;
      const barWidth = (WIDTH / bufferLength) * 2.5;
      let x = 0;

      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * HEIGHT;
        
        // Create gradient
        const gradient = ctx.createLinearGradient(0, HEIGHT, 0, HEIGHT - barHeight);
        gradient.addColorStop(0, "#4D7CFE");
        gradient.addColorStop(1, "#7C5DFA");
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);
        
        x += barWidth + 1;
      }
    };

    draw();
  };

  // If no audio, show default static "waveform"
  if (!audioUrl) {
    return (
      <div className={`waveform-container flex justify-center items-center h-full ${className}`}>
        {Array.from({ length: 50 }).map((_, index) => (
          <div 
            key={index}
            className="waveform-line mx-[1px] w-1 rounded-full animate-wave"
            style={{ 
              height: `${15 + Math.random() * 60}%`,
              animationDelay: `${Math.random() * 1000}ms`,
              opacity: isPlaying ? 1 : 0.4 
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <canvas 
      ref={canvasRef} 
      className={`w-full h-full rounded-lg ${className}`}
    />
  );
};

export default AudioVisualizer;
