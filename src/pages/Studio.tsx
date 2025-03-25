
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Save, Download, Volume, VolumeX, ArrowLeft, Loader, Share2, Play, Pause } from "lucide-react";
import { toast } from "sonner";
import Layout from "../components/Layout";
import Button from "../components/Button";
import AudioVisualizer from "../components/AudioVisualizer";
import VocalRecorder from "../components/VocalRecorder";
import InstrumentalBrowser from "../components/InstrumentalBrowser";
import MixingConsole from "../components/MixingConsole";
import GroovePadConnector from "../components/GroovePadConnector";
import { useAudio } from "../contexts/AudioContext";
import { useAudioPlayer } from "../hooks/useAudioPlayer";
import { audioBufferToWav } from "../services/audioService";

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
  
  const { 
    vocalAudioBlob, 
    instrumentalAudioBlob, 
    processedAudioBuffer,
    isProcessing, 
    processAudioFiles,
    mood,
    energy 
  } = useAudio();
  
  const { isPlaying, togglePlayback } = useAudioPlayer(processedAudioBuffer);
  
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(false);
  const [projectTitle, setProjectTitle] = useState("Untitled Project");
  const [isMuted, setIsMuted] = useState(false);
  
  const handleMixSettingsChange = (settings: any) => {
    // In a real app, this would apply mix settings
    toast.success("Mix settings applied");
  };
  
  useEffect(() => {
    if (projectId) {
      setLoading(true);
      loadProject(projectId)
        .then(data => {
          setProject(data);
          setProjectTitle(data.title);
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

  const handleExportAudio = () => {
    if (!processedAudioBuffer) {
      toast.error("No processed audio to export");
      return;
    }
    
    try {
      // Convert audio buffer to WAV blob
      const wavBlob = audioBufferToWav(processedAudioBuffer);
      
      // Create download link
      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `${projectTitle.replace(/\s+/g, '-').toLowerCase()}.wav`;
      
      // Add to document, click and cleanup
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success("Audio exported successfully");
    } catch (error) {
      console.error("Error exporting audio:", error);
      toast.error("Failed to export audio");
    }
  };

  const handleSaveProject = () => {
    // In a real app, this would save to a database
    toast.success("Project saved successfully");
  };

  const handleShare = () => {
    // In a real app, this would generate a share link
    navigator.clipboard.writeText(window.location.href)
      .then(() => toast.success("Share link copied to clipboard"))
      .catch(() => toast.error("Failed to copy link"));
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
                  disabled={!processedAudioBuffer}
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
                    <AudioVisualizer isPlaying={isPlaying && !isProcessing} />
                    
                    {isProcessing && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-200/60 backdrop-blur-sm">
                        <Loader className="h-8 w-8 animate-spin text-primary mb-2" />
                        <span className="text-sm text-light-100/80">Processing audio...</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center mt-4">
                    <div className="text-sm text-light-100/60">
                      {processedAudioBuffer ? "Ready to play" : "Waiting for processing..."}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant={processedAudioBuffer ? "gradient" : "outline"}
                        size="sm"
                        className="flex items-center gap-1"
                        disabled={isProcessing || !vocalAudioBlob || !instrumentalAudioBlob}
                        onClick={processedAudioBuffer ? togglePlayback : processAudioFiles}
                        isLoading={isProcessing}
                      >
                        {processedAudioBuffer ? (
                          <>
                            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            {isPlaying ? "Pause" : "Play"}
                          </>
                        ) : (
                          "Process Audio"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Mixing console */}
                <MixingConsole onSaveMix={handleMixSettingsChange} />
              </div>
              
              {/* Right column */}
              <div className="space-y-6">
                {/* Vocal recorder */}
                <VocalRecorder />
                
                {/* Instrumental browser */}
                <InstrumentalBrowser />
                
                {/* Groove pad */}
                <div className="glass-card p-6">
                  <h3 className="text-xl font-semibold mb-4">Mood & Energy</h3>
                  <div className="flex justify-center">
                    <GroovePadConnector />
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-light-100/70">
                    <div className="text-center">
                      <div className="mb-1">Mood</div>
                      <div className="font-semibold">
                        {mood < -0.33 ? "Melancholic" : mood > 0.33 ? "Uplifting" : "Neutral"}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="mb-1">Energy</div>
                      <div className="font-semibold">
                        {energy < -0.33 ? "Chill" : energy > 0.33 ? "Energetic" : "Balanced"}
                      </div>
                    </div>
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
