
import { useState, useEffect, useRef } from "react";
import { Music, Search, ArrowUp, ArrowDown, Play, Pause, Upload } from "lucide-react";
import { toast } from "sonner";
import Button from "./Button";
import AudioVisualizer from "./AudioVisualizer";
import { useAudio } from "../contexts/AudioContext";
import { useAudioPlayer } from "../hooks/useAudioPlayer";
import { blobToAudioBuffer } from "../services/audioService";
import { useIsMobile } from "../hooks/use-mobile";

interface Instrumental {
  id: string;
  title: string;
  genre: string;
  bpm: number;
  key: string;
  duration: string;
  audioUrl: string;
}

// Placeholder instrumentals data
const dummyInstrumentals: Instrumental[] = [
  {
    id: "1",
    title: "Chill Lofi Beat",
    genre: "Lofi",
    bpm: 85,
    key: "C Minor",
    duration: "3:24",
    audioUrl: "https://storage.googleapis.com/aivalab-samples/lofi-beat.mp3"
  },
  {
    id: "2",
    title: "Epic Orchestral",
    genre: "Cinematic",
    bpm: 110,
    key: "E Minor",
    duration: "4:12",
    audioUrl: "https://storage.googleapis.com/aivalab-samples/orchestral.mp3"
  },
  {
    id: "3",
    title: "Hip Hop Groove",
    genre: "Hip Hop",
    bpm: 95,
    key: "G Major",
    duration: "2:58",
    audioUrl: "https://storage.googleapis.com/aivalab-samples/hiphop.mp3"
  },
  {
    id: "4",
    title: "Funky Jazz",
    genre: "Jazz",
    bpm: 120,
    key: "D Minor",
    duration: "3:45",
    audioUrl: "https://storage.googleapis.com/aivalab-samples/jazz.mp3"
  },
  {
    id: "5",
    title: "Electronic Dance",
    genre: "EDM",
    bpm: 128,
    key: "A Minor",
    duration: "4:30",
    audioUrl: "https://storage.googleapis.com/aivalab-samples/edm.mp3"
  }
];

// Load audio from URL with better error handling
const loadAudioFromUrl = async (url: string): Promise<Blob> => {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch audio: ${response.status} ${response.statusText}`);
    }
    
    return await response.blob();
  } catch (error) {
    console.error("Error loading audio:", error);
    // Fallback to synthetic audio for demo purposes
    return createSyntheticAudio();
  }
};

// Create synthetic audio as fallback
const createSyntheticAudio = (): Blob => {
  const sampleRate = 44100;
  const lengthInSamples = sampleRate * 3; // 3 seconds
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const buffer = audioContext.createBuffer(2, lengthInSamples, sampleRate);
  
  // Create some basic waveform data
  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < lengthInSamples; i++) {
      // Create a simple sine wave
      data[i] = Math.sin(i * 0.01) * 0.5;
    }
  }
  
  // Convert to WAV blob
  const wavBlob = new Blob([buffer], { type: 'audio/wav' });
  return wavBlob;
};

interface InstrumentalBrowserProps {
  onSelect?: (instrumental: Instrumental) => void;
  className?: string;
}

const InstrumentalBrowser = ({ onSelect, className = "" }: InstrumentalBrowserProps) => {
  const { setInstrumentalAudioBlob } = useAudio();
  const [instrumentals] = useState<Instrumental[]>(dummyInstrumentals);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInstrumental, setSelectedInstrumental] = useState<Instrumental | null>(null);
  const [sortBy, setSortBy] = useState<"title" | "bpm" | "genre">("title");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [isLoading, setIsLoading] = useState(false);
  const [instrumentalBlob, setInstrumentalBlob] = useState<Blob | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  
  const { isPlaying, togglePlayback } = useAudioPlayer(audioBuffer);

  const handleInstrumentalSelect = async (instrumental: Instrumental) => {
    if (selectedInstrumental?.id === instrumental.id) {
      // If already selected, just toggle playback
      togglePlayback();
      return;
    }
    
    setSelectedInstrumental(instrumental);
    setIsLoading(true);
    
    try {
      // In a real app, we would load the actual audio from the URL
      const audioBlob = await loadAudioFromUrl(instrumental.audioUrl);
      setInstrumentalBlob(audioBlob);
      setInstrumentalAudioBlob(audioBlob);
      
      // Convert to audio buffer for playback
      const buffer = await blobToAudioBuffer(audioBlob);
      setAudioBuffer(buffer);
      
      onSelect?.(instrumental);
      toast.success(`Selected "${instrumental.title}"`);
    } catch (error) {
      console.error("Error loading instrumental:", error);
      toast.error("Failed to load instrumental");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsLoading(true);
    
    try {
      // Create custom instrumental object for the uploaded file
      const uploadedInstrumental: Instrumental = {
        id: `uploaded-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
        genre: "Custom Upload",
        bpm: 0, // Unknown
        key: "Unknown",
        duration: "Unknown",
        audioUrl: URL.createObjectURL(file)
      };
      
      setSelectedInstrumental(uploadedInstrumental);
      
      // Set the blob directly
      setInstrumentalBlob(file);
      setInstrumentalAudioBlob(file);
      
      // Convert to audio buffer for playback
      const buffer = await blobToAudioBuffer(file);
      setAudioBuffer(buffer);
      
      onSelect?.(uploadedInstrumental);
      toast.success(`Uploaded "${file.name}"`);
    } catch (error) {
      console.error("Error processing uploaded file:", error);
      toast.error("Failed to process uploaded file");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSort = (field: "title" | "bpm" | "genre") => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDirection("asc");
    }
  };

  const filteredInstrumentals = instrumentals
    .filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.genre.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "title") {
        return sortDirection === "asc" 
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      } else if (sortBy === "bpm") {
        return sortDirection === "asc" 
          ? a.bpm - b.bpm
          : b.bpm - a.bpm;
      } else {
        return sortDirection === "asc" 
          ? a.genre.localeCompare(b.genre)
          : b.genre.localeCompare(a.genre);
      }
    });

  return (
    <div className={`glass-card p-4 sm:p-6 ${className}`}>
      <h3 className="text-xl font-semibold mb-4">Instrumental Browser</h3>
      
      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <Button 
          variant="outline" 
          className="flex items-center justify-center gap-2 flex-1"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-4 w-4" />
          <span>Upload Instrumental</span>
        </Button>
        <input 
          type="file" 
          ref={fileInputRef}
          accept="audio/*" 
          className="hidden" 
          onChange={handleFileUpload}
        />
        
        <Button 
          variant="outline" 
          className="flex items-center justify-center gap-2 flex-1"
        >
          <Music className="h-4 w-4" />
          <span>Browse Library</span>
        </Button>
      </div>
      
      {/* Search bar */}
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-light-100/40" />
        <input
          type="text"
          placeholder="Search by title or genre..."
          className="w-full pl-10 pr-4 py-2 bg-dark-300 border border-white/10 rounded-lg text-light-100 focus:outline-none focus:ring-1 focus:ring-primary"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>
      
      {/* Table header */}
      <div className="hidden md:grid grid-cols-12 gap-4 mb-2 text-sm text-light-100/60 font-medium">
        <div 
          className="col-span-5 flex items-center gap-1 cursor-pointer" 
          onClick={() => toggleSort("title")}
        >
          Title
          {sortBy === "title" && (
            sortDirection === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
          )}
        </div>
        <div 
          className="col-span-3 flex items-center gap-1 cursor-pointer"
          onClick={() => toggleSort("genre")}
        >
          Genre
          {sortBy === "genre" && (
            sortDirection === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
          )}
        </div>
        <div 
          className="col-span-2 flex items-center gap-1 cursor-pointer"
          onClick={() => toggleSort("bpm")}
        >
          BPM
          {sortBy === "bpm" && (
            sortDirection === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
          )}
        </div>
        <div className="col-span-2">Key</div>
      </div>
      
      {/* Instrumentals list */}
      <div className={`${isMobile ? 'max-h-40' : 'max-h-60'} overflow-y-auto scrollbar-none`}>
        {filteredInstrumentals.length === 0 ? (
          <div className="text-center py-8 text-light-100/40">
            No instrumentals found
          </div>
        ) : (
          filteredInstrumentals.map(instrumental => (
            <div 
              key={instrumental.id}
              className={`grid grid-cols-12 gap-4 p-3 mb-2 rounded-lg transition-all cursor-pointer hover:bg-white/5 ${
                selectedInstrumental?.id === instrumental.id ? "bg-primary/10 border border-primary/20" : "border border-white/5"
              }`}
              onClick={() => handleInstrumentalSelect(instrumental)}
            >
              {/* Mobile view */}
              <div className="col-span-12 md:hidden flex flex-col gap-1">
                <div className="font-medium">{instrumental.title}</div>
                <div className="text-sm text-light-100/60 flex items-center gap-4 flex-wrap">
                  <span>{instrumental.genre}</span>
                  <span>{instrumental.bpm} BPM</span>
                  <span>{instrumental.key}</span>
                </div>
              </div>
              
              {/* Desktop view */}
              <div className="hidden md:block col-span-5">{instrumental.title}</div>
              <div className="hidden md:block col-span-3">{instrumental.genre}</div>
              <div className="hidden md:block col-span-2">{instrumental.bpm}</div>
              <div className="hidden md:block col-span-2">{instrumental.key}</div>
            </div>
          ))
        )}
      </div>
      
      {/* Selected instrumental preview */}
      {selectedInstrumental && (
        <div className="mt-4 border-t border-white/10 pt-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium truncate">{selectedInstrumental.title}</h4>
            <div className="text-sm text-light-100/60">{selectedInstrumental.duration}</div>
          </div>
          
          <div className="h-20 bg-dark-300 rounded-lg overflow-hidden mb-3 relative">
            <AudioVisualizer 
              isPlaying={isPlaying && !isLoading} 
              audioUrl={selectedInstrumental.audioUrl}
            />
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-dark-200/60 backdrop-blur-sm">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>
          
          <div className="flex justify-between flex-wrap gap-2">
            <div className="text-sm text-light-100/60">
              {selectedInstrumental.genre} • {selectedInstrumental.bpm} BPM • {selectedInstrumental.key}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                togglePlayback();
              }}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isPlaying ? "Pause" : "Play"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstrumentalBrowser;
