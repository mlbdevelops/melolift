
import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Activity, Play, Pause, Save, Download, Upload, Trash2, Settings as SettingsIcon } from "lucide-react";
import { toast } from "sonner";
import Layout from "../components/Layout";
import Button from "../components/Button";
import MixingConsole from "../components/MixingConsole";
import { useAudio } from "../contexts/AudioContext";
import VocalRecorder from "../components/VocalRecorder";
import InstrumentalBrowser from "../components/InstrumentalBrowser";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

// Define MixSettings interface
interface MixSettings {
  reverb: number;
  delay: number;
  eq: {
    low: number;
    mid: number;
    high: number;
  };
  compression: number;
  vocalVolume: number;
  instrumentalVolume: number;
  // Add any other settings as needed
}

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

const Mixing = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("id");
  const navigate = useNavigate();
  
  const { vocalAudioBlob, instrumentalAudioBlob } = useAudio();
  const [isPlaying, setIsPlaying] = useState(false);
  const [settings, setSettings] = useState<MixSettings>(defaultSettings);
  const [showSettings, setShowSettings] = useState(false);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingProject, setSavingProject] = useState(false);
  
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
    // Demo playback implementation
    // This would be connected to Web Audio API in a real app
    setIsPlaying(true);
  };
  
  const stopPlayback = () => {
    setIsPlaying(false);
  };
  
  const handleSettingsChange = (newSettings: Partial<MixSettings>) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      ...newSettings
    }));
  };
  
  const handleSaveProject = async () => {
    if (!projectId) {
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
    // This would create a final mix and download it
    toast.info("Mix download will be available in the full version");
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
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">
              {project ? project.title : "New Mix"}
            </h1>
            <p className="text-light-100/60">
              {project ? project.description || "No description" : "Create a new mix"}
            </p>
          </div>
          
          <div className="space-x-2">
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
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Mixing Console</h2>
                <div className="flex space-x-2">
                  <Button 
                    variant={isPlaying ? "destructive" : "gradient"}
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
                  
                  <Button variant="outline" size="sm" onClick={handleDownloadMix}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
              
              <div className="h-48 bg-dark-300 rounded-lg mb-4 overflow-hidden relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Activity className="h-16 w-16 text-primary/30" />
                </div>
                
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
              />
            </div>
          </div>
          
          <div className="space-y-6">
            <VocalRecorder />
            
            <InstrumentalBrowser />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Mixing;
