
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Save, Download, Volume, VolumeX, ArrowLeft, Loader, Share2 } from "lucide-react";
import { toast } from "sonner";
import Layout from "../components/Layout";
import Button from "../components/Button";
import AudioVisualizer from "../components/AudioVisualizer";
import VocalRecorder from "../components/VocalRecorder";
import InstrumentalBrowser from "../components/InstrumentalBrowser";
import MixingConsole from "../components/MixingConsole";
import GroovePad from "../components/GroovePad";

interface ProjectData {
  id: string;
  title: string;
  // Add more fields as needed
}

// Mock function to simulate loading a project
const loadProject = async (id: string): Promise<ProjectData> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    id,
    title: `Project ${id}`,
  };
};

const Studio = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project');
  
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [projectTitle, setProjectTitle] = useState("Untitled Project");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  const [vocalRecorded, setVocalRecorded] = useState(false);
  const [instrumentalSelected, setInstrumentalSelected] = useState(false);
  const [processed, setProcessed] = useState(false);
  
  useEffect(() => {
    if (projectId) {
      setLoading(true);
      loadProject(projectId)
        .then(data => {
          setProject(data);
          setProjectTitle(data.title);
          // Simulate having data in this project
          setVocalRecorded(true);
          setInstrumentalSelected(true);
          setProcessed(true);
        })
        .catch(error => {
          console.error("Error loading project:", error);
          toast.error("Failed to load project");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [projectId]);

  const handleVocalRecorded = () => {
    setVocalRecorded(true);
    toast.success("Vocal recorded successfully");
  };

  const handleInstrumentalSelected = () => {
    setInstrumentalSelected(true);
    toast.success("Instrumental selected");
  };

  const handleGroovePadChange = (energy: number, mood: number) => {
    console.log("Energy:", energy, "Mood:", mood);
    // In a real app, this would update the audio processing parameters
  };

  const handleProcessAudio = () => {
    if (!vocalRecorded || !instrumentalSelected) {
      toast.error("Please record vocals and select an instrumental first");
      return;
    }
    
    setProcessing(true);
    
    // Simulate AI processing
    setTimeout(() => {
      setProcessed(true);
      setProcessing(false);
      setIsPlaying(true);
      toast.success("Audio processing complete");
    }, 3000);
  };

  const handleSaveProject = () => {
    toast.success("Project saved successfully");
  };

  const handleExportAudio = () => {
    toast.success("Audio exported successfully");
  };

  const handleShare = () => {
    toast.success("Share link copied to clipboard");
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                
                <div>
                  <input
                    type="text"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    className="bg-transparent border-b border-white/10 focus:border-primary focus:outline-none text-xl font-bold py-1 px-2"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">{isMuted ? "Unmute" : "Mute"}</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Share</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={handleExportAudio}
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
                
                <Button
                  variant="gradient"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={handleSaveProject}
                >
                  <Save className="h-4 w-4" />
                  <span className="hidden sm:inline">Save</span>
                </Button>
              </div>
            </div>
            
            {/* Main content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Waveform visualization */}
                <div className="glass-card p-6">
                  <h2 className="text-xl font-semibold mb-4">Audio Preview</h2>
                  
                  <div className="h-40 bg-dark-300 rounded-lg overflow-hidden relative">
                    <AudioVisualizer isPlaying={isPlaying && !processing} />
                    
                    {processing && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-200/60 backdrop-blur-sm">
                        <Loader className="h-8 w-8 animate-spin text-primary mb-2" />
                        <span className="text-sm text-light-100/80">Processing audio...</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center mt-4">
                    <div className="text-sm text-light-100/60">
                      {processed ? "Ready to play" : "Waiting for processing..."}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant={processed ? "gradient" : "outline"}
                        size="sm"
                        className="flex items-center gap-1"
                        disabled={processing || !vocalRecorded || !instrumentalSelected}
                        onClick={processed ? () => setIsPlaying(!isPlaying) : handleProcessAudio}
                        isLoading={processing}
                      >
                        {processed ? (isPlaying ? "Pause" : "Play") : "Process Audio"}
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Mixing console */}
                <MixingConsole />
              </div>
              
              {/* Right column */}
              <div className="space-y-6">
                {/* Vocal recorder */}
                <VocalRecorder onRecordingComplete={handleVocalRecorded} />
                
                {/* Instrumental browser */}
                <InstrumentalBrowser onSelect={handleInstrumentalSelected} />
                
                {/* Groove pad */}
                <div className="glass-card p-6">
                  <h3 className="text-xl font-semibold mb-4">Mood & Energy</h3>
                  <div className="flex justify-center">
                    <GroovePad 
                      label="Adjust Mood & Energy" 
                      onChange={handleGroovePadChange} 
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Studio;
