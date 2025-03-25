
import { useEffect, useRef } from "react";

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
  const animationRef = useRef<number>(0);

  useEffect(() => {
    // Create audio element if it doesn't exist
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    // Set up audio context and analyser on mount
    const setupAudio = () => {
      if (!audioContextRef.current) {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContext();
      }

      if (!analyserRef.current) {
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
      }

      if (audioRef.current && audioUrl) {
        audioRef.current.src = audioUrl;
        audioRef.current.crossOrigin = "anonymous";
        
        const source = audioContextRef.current.createMediaElementSource(audioRef.current);
        source.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);
      }
    };

    if (audioUrl) {
      setupAudio();
    }

    return () => {
      cancelAnimationFrame(animationRef.current);
      if (audioContextRef.current) {
        // audioContextRef.current.close();
      }
    };
  }, [audioUrl]);

  useEffect(() => {
    if (!audioRef.current || !audioUrl) return;

    if (isPlaying) {
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
      <div className={`waveform-container ${className}`}>
        {Array.from({ length: 50 }).map((_, index) => (
          <div 
            key={index}
            className="waveform-line animate-wave"
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
