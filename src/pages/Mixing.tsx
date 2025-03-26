
import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Activity, Play, Pause, Save, Download, Upload, Trash2, Settings as SettingsIcon } from "lucide-react";
import { toast } from "sonner";
import Layout from "../components/Layout";
import Button from "../components/Button";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

// Define the MixSettings interface
interface MixSettings {
  vocalVolume: number;
  instrumentalVolume: number;
  vocalReverb: number;
  vocalEQ: {
    low: number;
    mid: number;
    high: number;
  };
  // Add other properties as needed
}

interface Project {
  id: string;
  title: string;
  description: string;
  vocal_url: string;
  instrumental_url: string;
  mixed_url: string;
  settings: MixSettings;
  status: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

// Default settings value
const defaultSettings: MixSettings = {
  vocalVolume: 100,
  instrumentalVolume: 100,
  vocalReverb: 20,
  vocalEQ: {
    low: 0,
    mid: 0,
    high: 0
  }
};

const Mixing = () => {
  const { user, isPremiumFeature } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const projectId = searchParams.get("project");
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [savingProject, setSavingProject] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const [settings, setSettings] = useState<MixSettings>(defaultSettings);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    if (projectId && user) {
      fetchProject();
    } else {
      navigate("/studio");
    }
  }, [projectId, user, navigate]);
  
  const fetchProject = async () => {
    try {
      const { data, error } = await supabase
        .from("audio_projects")
        .select("*")
        .eq("id", projectId!)
        .eq("user_id", user!.id)
        .single();
        
      if (error) {
        throw error;
      }
      
      // Parse settings if they exist
      let parsedSettings: MixSettings = defaultSettings;
      
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
      
      // Create complete project object with parsed settings
      const projectWithSettings: Project = {
        ...data,
        settings: parsedSettings
      };
      
      setProject(projectWithSettings);
      setSettings(parsedSettings);
    } catch (error) {
      console.error("Error fetching project:", error);
      toast.error("Failed to load project");
      navigate("/studio");
    } finally {
      setLoading(false);
    }
  };
  
  const handleSettingsChange = (
    key: keyof MixSettings, 
    value: number | { low: number; mid: number; high: number }
  ) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const handleEQChange = (key: keyof typeof settings.vocalEQ, value: number) => {
    setSettings(prev => ({
      ...prev,
      vocalEQ: {
        ...prev.vocalEQ,
        [key]: value
      }
    }));
  };
  
  const handleSaveProject = async () => {
    if (!project) return;
    
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
  
  const handlePlayPause = () => {
    if (audioRef.current) {
      if (playing) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setPlaying(!playing);
    }
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Activity className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }
  
  if (!project) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <p className="text-light-100/70">Project not found.</p>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{project.title}</h1>
            <p className="text-light-100/70">{project.description}</p>
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Audio Player Section */}
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4">Audio Mixer</h2>
            
            <audio 
              ref={audioRef} 
              src={project.mixed_url} 
              controls 
              className="w-full" 
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
            />
            
            <div className="mt-4 flex justify-center">
              <Button onClick={handlePlayPause}>
                {playing ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Play
                  </>
                )}
              </Button>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Volume Controls</h3>
              
              <div className="flex items-center justify-between mb-2">
                <span>Vocal Volume</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.vocalVolume}
                  onChange={(e) => handleSettingsChange("vocalVolume", parseInt(e.target.value))}
                  className="w-3/4"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span>Instrumental Volume</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.instrumentalVolume}
                  onChange={(e) => handleSettingsChange("instrumentalVolume", parseInt(e.target.value))}
                  className="w-3/4"
                />
              </div>
            </div>
          </div>
          
          {/* Settings Panel */}
          {showSettings && (
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-4">Mix Settings</h2>
              
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Reverb</h3>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.vocalReverb}
                  onChange={(e) => handleSettingsChange("vocalReverb", parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Vocal EQ</h3>
                
                <div className="flex items-center justify-between mb-2">
                  <span>Low</span>
                  <input
                    type="range"
                    min="-12"
                    max="12"
                    value={settings.vocalEQ.low}
                    onChange={(e) => handleEQChange("low", parseInt(e.target.value))}
                    className="w-3/4"
                  />
                </div>
                
                <div className="flex items-center justify-between mb-2">
                  <span>Mid</span>
                  <input
                    type="range"
                    min="-12"
                    max="12"
                    value={settings.vocalEQ.mid}
                    onChange={(e) => handleEQChange("mid", parseInt(e.target.value))}
                    className="w-3/4"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span>High</span>
                  <input
                    type="range"
                    min="-12"
                    max="12"
                    value={settings.vocalEQ.high}
                    onChange={(e) => handleEQChange("high", parseInt(e.target.value))}
                    className="w-3/4"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Mixing;
