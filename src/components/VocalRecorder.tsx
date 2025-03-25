
import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Square, Loader, Upload, Play, Pause } from "lucide-react";
import { toast } from "sonner";
import Button from "./Button";
import AudioVisualizer from "./AudioVisualizer";
import { useAudio } from "../contexts/AudioContext";
import { useAudioPlayer } from "../hooks/useAudioPlayer";
import { blobToAudioBuffer } from "../services/audioService";

interface VocalRecorderProps {
  onRecordingComplete?: (audioBlob: Blob) => void;
  onFileUpload?: (file: File) => void;
  className?: string;
}

const VocalRecorder = ({ 
  onRecordingComplete, 
  onFileUpload,
  className = "" 
}: VocalRecorderProps) => {
  const { setVocalAudioBlob, vocalAudioBlob } = useAudio();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  
  const { isPlaying, togglePlayback } = useAudioPlayer(audioBuffer);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Load audio buffer when blob changes
  useEffect(() => {
    const loadAudio = async () => {
      if (vocalAudioBlob && audioUrl) {
        try {
          const buffer = await blobToAudioBuffer(vocalAudioBlob);
          setAudioBuffer(buffer);
        } catch (error) {
          console.error("Error converting blob to audio buffer:", error);
        }
      } else {
        setAudioBuffer(null);
      }
    };
    
    loadAudio();
  }, [vocalAudioBlob, audioUrl]);

  const startRecording = async () => {
    try {
      setError(null);
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      // Set up event handlers
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        setVocalAudioBlob(audioBlob);
        onRecordingComplete?.(audioBlob);
        
        // Clear recording data
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        
        toast.success("Recording completed successfully!");
      };
      
      // Start recording
      audioChunksRef.current = [];
      mediaRecorder.start();
      setIsRecording(true);
      
      // Start timer
      let seconds = 0;
      timerRef.current = window.setInterval(() => {
        seconds++;
        setRecordingTime(seconds);
      }, 1000);
      
    } catch (err) {
      console.error("Error starting recording:", err);
      setError("Could not access microphone. Please ensure microphone permissions are granted.");
      toast.error("Microphone access denied. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    setIsRecording(false);
    
    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    
    // Check if file is audio
    if (!file.type.startsWith('audio/')) {
      setError("Please upload an audio file.");
      setIsUploading(false);
      toast.error("Invalid file type. Please upload an audio file.");
      return;
    }
    
    try {
      // Create URL for the uploaded file
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      
      // Convert to blob
      const buffer = await file.arrayBuffer();
      const blob = new Blob([buffer], { type: file.type });
      
      // Set the vocal audio blob
      setVocalAudioBlob(blob);
      
      // Pass the file to parent component
      onFileUpload?.(file);
      toast.success("Audio file uploaded successfully!");
    } catch (error) {
      console.error("Error processing uploaded file:", error);
      toast.error("Error processing the audio file");
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    // Clean up on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  return (
    <div className={`glass-card p-6 ${className}`}>
      <h3 className="text-xl font-semibold mb-4">Record or Upload Vocals</h3>
      
      {/* Visualizer */}
      <div className="mb-6 h-32 bg-dark-300 rounded-lg overflow-hidden">
        <AudioVisualizer 
          audioUrl={audioUrl || undefined} 
          isPlaying={isRecording || isPlaying} 
          className="w-full h-full" 
        />
      </div>
      
      {/* Recording time */}
      {isRecording && (
        <div className="text-center mb-4">
          <div className="text-2xl font-bold text-primary animate-pulse">
            {formatTime(recordingTime)}
          </div>
          <div className="text-sm text-light-100/60">Recording...</div>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="text-destructive text-sm mb-4 p-2 bg-destructive/10 rounded">
          {error}
        </div>
      )}
      
      {/* Controls */}
      <div className="flex flex-wrap gap-3 justify-center">
        {isRecording ? (
          <Button 
            onClick={stopRecording}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Square className="h-4 w-4" />
            Stop Recording
          </Button>
        ) : (
          <Button 
            onClick={startRecording}
            variant="gradient"
            className="flex items-center gap-2"
          >
            <Mic className="h-4 w-4" />
            Start Recording
          </Button>
        )}
        
        <Button 
          onClick={triggerFileUpload}
          variant="outline"
          className="flex items-center gap-2"
          isLoading={isUploading}
        >
          <Upload className="h-4 w-4" />
          Upload Audio
        </Button>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          accept="audio/*" 
          className="hidden" 
        />
      </div>
      
      {/* Audio playback controls (only show if audio is recorded/uploaded) */}
      {audioUrl && !isRecording && (
        <div className="mt-4 flex justify-center">
          <Button 
            onClick={togglePlayback}
            variant="ghost"
            size="sm"
            className="text-light-100/70 hover:text-light-100 flex items-center gap-2"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isPlaying ? "Pause" : "Play Recording"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default VocalRecorder;
