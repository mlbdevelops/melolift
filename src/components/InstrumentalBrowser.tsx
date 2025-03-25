
import { useState } from "react";
import { Music, Search, ArrowUp, ArrowDown } from "lucide-react";
import Button from "./Button";
import AudioVisualizer from "./AudioVisualizer";

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
    audioUrl: ""
  },
  {
    id: "2",
    title: "Epic Orchestral",
    genre: "Cinematic",
    bpm: 110,
    key: "E Minor",
    duration: "4:12",
    audioUrl: ""
  },
  {
    id: "3",
    title: "Hip Hop Groove",
    genre: "Hip Hop",
    bpm: 95,
    key: "G Major",
    duration: "2:58",
    audioUrl: ""
  },
  {
    id: "4",
    title: "Funky Jazz",
    genre: "Jazz",
    bpm: 120,
    key: "D Minor",
    duration: "3:45",
    audioUrl: ""
  },
  {
    id: "5",
    title: "Electronic Dance",
    genre: "EDM",
    bpm: 128,
    key: "A Minor",
    duration: "4:30",
    audioUrl: ""
  }
];

interface InstrumentalBrowserProps {
  onSelect?: (instrumental: Instrumental) => void;
  className?: string;
}

const InstrumentalBrowser = ({ onSelect, className = "" }: InstrumentalBrowserProps) => {
  const [instrumentals] = useState<Instrumental[]>(dummyInstrumentals);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInstrumental, setSelectedInstrumental] = useState<Instrumental | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sortBy, setSortBy] = useState<"title" | "bpm" | "genre">("title");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleInstrumentalSelect = (instrumental: Instrumental) => {
    setSelectedInstrumental(instrumental);
    setIsPlaying(true);
    onSelect?.(instrumental);
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
    <div className={`glass-card p-6 ${className}`}>
      <h3 className="text-xl font-semibold mb-4">Instrumental Browser</h3>
      
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
      <div className="max-h-60 overflow-y-auto scrollbar-none">
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
                <div className="text-sm text-light-100/60 flex items-center gap-4">
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
            <h4 className="font-medium">{selectedInstrumental.title}</h4>
            <div className="text-sm text-light-100/60">{selectedInstrumental.duration}</div>
          </div>
          
          <div className="h-20 bg-dark-300 rounded-lg overflow-hidden mb-3">
            <AudioVisualizer isPlaying={isPlaying} />
          </div>
          
          <div className="flex justify-between">
            <div className="text-sm text-light-100/60">
              {selectedInstrumental.genre} • {selectedInstrumental.bpm} BPM • {selectedInstrumental.key}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? "Pause" : "Play"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstrumentalBrowser;
