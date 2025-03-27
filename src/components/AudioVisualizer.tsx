
import { useEffect, useRef, useState } from "react";

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
  const [isSourceConnected, setIsSourceConnected] = useState(false);

  // Create or reset audio context when component mounts or audioUrl changes
  useEffect(() => {
    // Reset audio element if URL changes
    if (audioUrl) {
      // Disconnect previous source and clean up
      if (sourceNodeRef.current) {
        sourceNodeRef.current.disconnect();
        sourceNodeRef.current = null;
        setIsSourceConnected(false);
      }
      
      // Create new audio element to avoid connection issues
      audioRef.current = new Audio(audioUrl);
      audioRef.current.crossOrigin = "anonymous";
      audioRef.current.addEventListener('error', (e) => {
        console.error("Audio loading error:", e);
        // We'll show an error toast in the InstrumentalBrowser component
      });
    }

    // Clean up on unmount or URL change
    return () => {
      cancelAnimationFrame(animationRef.current);
      
      // Disconnect source if connected
      if (sourceNodeRef.current) {
        sourceNodeRef.current.disconnect();
        sourceNodeRef.current = null;
        setIsSourceConnected(false);
      }

      // Clean up audio element
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current.load();
      }
    };
  }, [audioUrl]);

  // Initialize audio context and analyzer
  useEffect(() => {
    if (!audioContextRef.current) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContext();
    }
    
    if (!analyserRef.current && audioContextRef.current) {
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
    }
    
    return () => {
      // On unmount, clean everything up
      if (sourceNodeRef.current) {
        sourceNodeRef.current.disconnect();
        sourceNodeRef.current = null;
      }
      
      if (analyserRef.current) {
        analyserRef.current.disconnect();
      }
      
      if (audioContextRef.current) {
        // We don't close the context to avoid issues with reuse
      }
    };
  }, []);

  // Connect source when audio and context are ready
  useEffect(() => {
    const connectSource = () => {
      // Only connect if we have audio, context, and analyzer but not connected yet
      if (
        audioRef.current && 
        audioContextRef.current && 
        analyserRef.current && 
        !isSourceConnected &&
        audioUrl
      ) {
        try {
          // Resume audio context if suspended (needed for mobile)
          if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
          }
          
          // Create and connect source
          sourceNodeRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
          sourceNodeRef.current.connect(analyserRef.current);
          analyserRef.current.connect(audioContextRef.current.destination);
          setIsSourceConnected(true);
        } catch (error) {
          console.error("Error connecting audio source:", error);
          // If connection fails, reset for retry
          if (sourceNodeRef.current) {
            sourceNodeRef.current.disconnect();
            sourceNodeRef.current = null;
          }
          setIsSourceConnected(false);
        }
      }
    };
    
    connectSource();
  }, [audioUrl, isSourceConnected]);

  // Handle play/pause
  useEffect(() => {
    if (!audioRef.current || !audioUrl) return;

    if (isPlaying) {
      // Ensure source is connected before playing
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }
      
      audioRef.current.play().catch(error => console.error("Audio play error:", error));
      drawVisualizer();
    } else {
      audioRef.current.pause();
      cancelAnimationFrame(animationRef.current);
    }
  }, [isPlaying, audioUrl]);

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
      analyser.getByteFrequencyData(dataArray);

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
