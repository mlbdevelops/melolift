
import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Activity, Play, Pause, Save, Download, Upload, Trash2, Settings as SettingsIcon } from "lucide-react";
import { toast } from "sonner";
import Layout from "../components/Layout";
import Button from "../components/Button";
import MixingConsole, { MixSettings } from "../components/MixingConsole";
import { useAudio } from "../contexts/AudioContext";
import VocalRecorder from "../components/VocalRecorder";
import InstrumentalBrowser from "../components/InstrumentalBrowser";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import { useAuth } from "../contexts/AuthContext";

const defaultSettings: MixSettings = {
  reverb: 0.3,
  delay: 0.2,
  eq: {
    low: 0,
    mid: 0,
    high: 0
  },
  compression: 0.4,
  vocalVolume: 0.8,
  instrumentalVolume: 0.6
};

interface Project {
  id: string;
  title: string;
  description?: string;
  settings?: Json;
  [key: string]: any;
}

const Mixing = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("project") || searchParams.get("id");
  const navigate = useNavigate();
  const { isPremiumFeature } = useAuth();
  
  const { vocalAudioBlob, instrumentalAudioBlob } = useAudio();
  const [isPlaying, setIsPlaying] = useState(false);
  const [settings, setSettings] = useState<MixSettings>(defaultSettings);
  const [showSettings, setShowSettings] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingProject, setSavingProject] = useState(false);
  const [exporting, setExporting] = useState(false);
  
  // Audio processing references
  const audioContextRef = useRef<AudioContext | null>(null);
  const vocalSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const instrumentalSourceRef = useRef<AudioBufferSourceNode | null>(null);
  
  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) {
        setLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from("audio_projects")
          .select("*")
          .eq("id", projectId)
          .single();
          
        if (error) throw error;
        
        // Parse settings from project
        let parsedSettings = defaultSettings;
        
        if (data.settings) {
          try {
            // If settings is a string, parse it
            if (typeof data.settings === 'string') {
              parsedSettings = JSON.parse(data.settings);
            } 
            // If settings is already an object
            else if (typeof data.settings === 'object') {
              // Cast to unknown first, then to MixSettings for safety
              parsedSettings = data.settings as unknown as MixSettings;
            }
          } catch (e) {
            console.error("Error parsing settings:", e);
          }
        }
        
        setSettings(parsedSettings);
        setProject(data);
      } catch (error) {
        console.error("Error fetching project:", error);
        toast.error("Failed to load project");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProject();
  }, [projectId]);
  
  const togglePlayback = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback();
    }
  };
  
  const startPlayback = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      // In a real implementation, this would apply all the mixing settings
      // and process the audio accordingly
      setIsPlaying(true);
      toast.success("Playback started");
    } catch (error) {
      console.error("Error starting playback:", error);
      toast.error("Failed to start playback");
    }
  };
  
  const stopPlayback = () => {
    setIsPlaying(false);
    
    // Stop any active sources
    if (vocalSourceRef.current) {
      vocalSourceRef.current.stop();
      vocalSourceRef.current = null;
    }
    
    if (instrumentalSourceRef.current) {
      instrumentalSourceRef.current.stop();
      instrumentalSourceRef.current = null;
    }
  };
  
  const handleSettingsChange = (newSettings: Partial<MixSettings>) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      ...newSettings
    }));
  };
  
  const handleSaveProject = async () => {
    if (!projectId || !project) {
      // Create new project
      navigate("/studio"); // Redirect to studio to create a new project
      return;
    }
    
    setSavingProject(true);
    
    try {
      const { error } = await supabase
        .from("audio_projects")
        .update({
          settings: settings as unknown as Json,
          updated_at: new Date().toISOString()
        })
        .eq("id", project.id);
        
      if (error) throw error;
      
      toast.success("Project saved successfully");
    } catch (error) {
      console.error("Error saving project:", error);
      toast.error("Failed to save project");
    } finally {
      setSavingProject(false);
    }
  };
  
  const handleDownloadMix = () => {
    // This would be a more complete implementation in a real app
    setExporting(true);
    
    setTimeout(() => {
      try {
        // In a real app, this would create a mixed audio file
        // and provide it for download at different qualities
        const isPremium = isPremiumFeature('high-quality-export');
        const quality = isPremium ? 'high' : 'low';
        
        // Create a dummy file for demonstration
        const dummyBlob = new Blob(['Placeholder for mixed audio'], { type: 'audio/mpeg' });
        const url = URL.createObjectURL(dummyBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${project?.title || 'MeloLift-mix'}-${quality}.mp3`;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        toast.success(`Mix exported at ${isPremium ? 'high' : 'standard'} quality`);
      } catch (error) {
        console.error("Error exporting mix:", error);
        toast.error("Failed to export mix");
      } finally {
        setExporting(false);
      }
    }, 1500); // Simulate processing time
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin h-12 w-12 border-t-2 border-primary rounded-full"></div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              {project ? project.title : "New Mix"}
            </h1>
            <p className="text-light-100/60">
              {project ? project.description || "No description" : "Create a new mix"}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setShowSettings(!showSettings)}>
              <SettingsIcon className="h-4 w-4 mr-2" />
              Settings
            </Button>
            
            <Button variant="default" onClick={handleSaveProject} isLoading={savingProject}>
              <Save className="h-4 w-4 mr-2" />
              Save Project
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="glass-card p-6 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                <h2 className="text-xl font-semibold">Mixing Console</h2>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="gradient"
                    size="sm"
                    onClick={togglePlayback}
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="h-4 w-4 mr-2" />
                        Stop
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Play Mix
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleDownloadMix}
                    isLoading={exporting}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
              
              <div className="h-48 bg-dark-300 rounded-lg mb-4 overflow-hidden relative flex items-center justify-center">
                <Activity className="h-16 w-16 text-primary/30" />
                
                {isPlaying && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent-purple/20 animate-pulse">
                    {/* Waveform visualization would go here */}
                  </div>
                )}
              </div>
              
              <MixingConsole 
                settings={settings} 
                onSettingsChange={handleSettingsChange}
                isPlaying={isPlaying}
                onSaveMix={handleSaveProject}
              />
            </div>
          </div>
          
          <div className="space-y-6">
            <VocalRecorder />
            
            <InstrumentalBrowser />
            
            {/* Add a download section */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-semibold mb-4">Export Your Mix</h3>
              
              <p className="text-light-100/70 mb-4">
                Ready to share your creation with the world? Export your mix in various formats.
              </p>
              
              <div className="space-y-3">
                <Button 
                  variant="default" 
                  className="w-full flex items-center justify-center"
                  onClick={handleDownloadMix}
                  isLoading={exporting}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export as MP3
                </Button>
                
                <div className="relative">
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center justify-center opacity-60"
                    disabled={!isPremiumFeature('wav-export')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export as WAV
                  </Button>
                  
                  {!isPremiumFeature('wav-export') && (
                    <div 
                      className="absolute inset-0 flex items-center justify-end pr-3 cursor-pointer"
                      onClick={() => {
                        toast.info(
                          <div>
                            <p className="font-bold mb-2">Premium Feature</p>
                            <p>Upgrade to export in high-quality WAV format.</p>
                            <Button 
                              variant="gradient" 
                              size="sm" 
                              className="mt-2"
                              onClick={() => window.location.href = '/subscription'}
                            >
                              Upgrade Now
                            </Button>
                          </div>
                        );
                      }}
                    >
                      <div className="bg-accent-purple text-white text-xs px-2 py-1 rounded-full">
                        PREMIUM
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Mixing;
