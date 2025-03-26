
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Save, Download, Volume, VolumeX, Sliders, Activity, Mic, Music, BarChart2, Loader, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import Layout from "../components/Layout";
import Button from "../components/Button";
import AudioVisualizer from "../components/AudioVisualizer";
import GroovePadConnector from "../components/GroovePadConnector";
import { useAudio } from "../contexts/AudioContext";
import { useAudioPlayer } from "../hooks/useAudioPlayer";
import { audioBufferToWav } from "../services/audioService";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Project {
  id: string;
  title: string;
  vocal_url: string | null;
  instrumental_url: string | null;
  mixed_url: string | null;
  settings: {
    vocalVolume?: number;
    instrumentalVolume?: number;
    reverb?: number;
    delay?: number;
    compression?: number;
    highPass?: number;
    lowPass?: number;
    pitchCorrection?: number;
    noiseReduction?: number;
    harmonizer?: number;
    stereoWidth?: number;
    mood?: number;
    energy?: number;
    [key: string]: any;
  } | null;
}

const Mixing = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project');
  const navigate = useNavigate();
  
  const { user, isPremiumFeature } = useAuth();
  const { 
    vocalAudioBlob, 
    instrumentalAudioBlob, 
    processedAudioBuffer,
    isProcessing, 
    processAudioFiles,
    mood,
    energy,
    setMood,
    setEnergy 
  } = useAudio();
  
  const { isPlaying, togglePlayback } = useAudioPlayer(processedAudioBuffer);
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [projectTitle, setProjectTitle] = useState("Untitled Project");
  const [isMuted, setIsMuted] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [showAiSuggestion, setShowAiSuggestion] = useState(false);
  
  // Extended mixing parameters
  const [mixParams, setMixParams] = useState({
    vocalVolume: 80,
    instrumentalVolume: 70,
    reverb: 20,
    delay: 10,
    compression: 30,
    highPass: 20,
    lowPass: 20,
    pitchCorrection: isPremiumFeature("Advanced vocal alignment") ? 30 : 0,
    noiseReduction: isPremiumFeature("Noise reduction") ? 50 : 0,
    harmonizer: isPremiumFeature("Advanced mixing tools") ? 15 : 0,
    stereoWidth: isPremiumFeature("Advanced mixing tools") ? 40 : 0,
  });
  
  useEffect(() => {
    if (projectId && user) {
      setLoading(true);
      fetchProject(projectId);
    }
  }, [projectId, user]);
  
  const fetchProject = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("audio_projects")
        .select("*")
        .eq("id", id)
        .single();
        
      if (error) throw error;
      
      setProject(data);
      setProjectTitle(data.title);
      
      if (data.settings) {
        // Parse settings properly
        const settings = typeof data.settings === 'string' 
          ? JSON.parse(data.settings) 
          : data.settings;
          
        // Update mix parameters
        setMixParams(prev => ({
          ...prev,
          ...(settings as any)
        }));
        
        // Check if mood and energy exist in settings
        if (settings && 'mood' in settings) {
          setMood(settings.mood);
        }
        
        if (settings && 'energy' in settings) {
          setEnergy(settings.energy);
        }
      }
    } catch (error) {
      console.error("Error loading project:", error);
      toast.error("Failed to load project");
    } finally {
      setLoading(false);
    }
  };
  
  const handleMixParamChange = (param: keyof typeof mixParams, value: number) => {
    if (!isPremiumFeature("Advanced mixing tools") && 
        ["pitchCorrection", "noiseReduction", "harmonizer", "stereoWidth"].includes(param)) {
      toast.error("This feature requires a Pro or Premium subscription");
      return;
    }
    
    setMixParams(prev => ({
      ...prev,
      [param]: value
    }));
  };
  
  const generateAiSuggestion = () => {
    if (!isPremiumFeature("AI suggestions")) {
      toast.error("AI suggestions require a Pro or Premium subscription");
      return;
    }
    
    // Simulate AI suggestion generation
    setShowAiSuggestion(true);
    
    setTimeout(() => {
      const suggestions = [
        "Try increasing the vocal volume and adding more reverb for a spacious sound.",
        "The vocals could use a bit more compression to even out the dynamics.",
        "Consider reducing the low-end on the instrumental to make room for the vocals.",
        "Adding a subtle delay to the vocals would enhance the rhythm.",
        "The track would benefit from wider stereo imaging on the instrumental."
      ];
      
      setAiSuggestion(suggestions[Math.floor(Math.random() * suggestions.length)]);
    }, 1500);
  };
  
  const applyAiSuggestion = () => {
    // Simulate applying AI suggestion
    toast.success("AI suggestion applied!");
    
    setMixParams(prev => ({
      ...prev,
      reverb: 40,
      compression: 50,
      vocalVolume: 85
    }));
    
    setShowAiSuggestion(false);
  };
  
  const saveProject = async () => {
    if (!user) {
      toast.error("You must be logged in to save projects");
      return;
    }
    
    setSaving(true);
    
    try {
      const projectData = {
        title: projectTitle,
        settings: {
          ...mixParams,
          mood,
          energy
        },
        status: "in_progress"
      };
      
      if (project) {
        // Update existing project
        const { error } = await supabase
          .from("audio_projects")
          .update(projectData)
          .eq("id", project.id);
          
        if (error) throw error;
        
        toast.success("Project updated successfully");
      } else {
        // Create new project
        const { data, error } = await supabase
          .from("audio_projects")
          .insert({
            ...projectData,
            user_id: user.id
          })
          .select();
          
        if (error) throw error;
        
        setProject(data[0]);
        
        // Update URL with new project ID
        navigate(`/mixing?project=${data[0].id}`, { replace: true });
        
        toast.success("Project created successfully");
      }
    } catch (error) {
      console.error("Error saving project:", error);
      toast.error("Failed to save project");
    } finally {
      setSaving(false);
    }
  };
  
  const handleExportAudio = () => {
    if (!processedAudioBuffer) {
      toast.error("No processed audio to export");
      return;
    }
    
    if (!isPremiumFeature("Mix exporting in multiple formats") && !isPremiumFeature("Advanced mixing tools")) {
      toast.error("Exporting requires a Pro or Premium subscription");
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
                  onClick={handleExportAudio}
                  disabled={!processedAudioBuffer || (!isPremiumFeature("Mix exporting in multiple formats") && !isPremiumFeature("Advanced mixing tools"))}
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
                
                <Button
                  variant="gradient"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={saveProject}
                  isLoading={saving}
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
                          isPlaying ? "Pause" : "Play"
                        ) : (
                          "Process Audio"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Mixing console - Extended */}
                <div className="glass-card p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Mixing Console</h2>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={generateAiSuggestion}
                      disabled={!isPremiumFeature("AI suggestions") || showAiSuggestion}
                    >
                      <BarChart2 className="h-4 w-4" />
                      <span>AI Suggestions</span>
                    </Button>
                  </div>
                  
                  {showAiSuggestion && (
                    <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                      <h3 className="font-medium text-primary mb-2">AI Suggestion</h3>
                      
                      {aiSuggestion ? (
                        <div className="space-y-3">
                          <p>{aiSuggestion}</p>
                          <div className="flex justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              className="mr-2"
                              onClick={() => setShowAiSuggestion(false)}
                            >
                              Ignore
                            </Button>
                            <Button
                              variant="gradient"
                              size="sm"
                              onClick={applyAiSuggestion}
                            >
                              Apply
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center py-2">
                          <RefreshCw className="h-5 w-5 animate-spin text-primary mr-2" />
                          <span>Generating suggestions...</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    {/* Volumes */}
                    <div>
                      <h3 className="font-medium mb-3 flex items-center">
                        <Mic className="h-4 w-4 mr-2" />
                        Vocal Volume
                      </h3>
                      <div className="flex items-center">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={mixParams.vocalVolume}
                          onChange={(e) => handleMixParamChange("vocalVolume", parseInt(e.target.value))}
                          className="w-full h-2 bg-dark-300 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="ml-2 w-8 text-sm text-light-100/70">{mixParams.vocalVolume}%</span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-3 flex items-center">
                        <Music className="h-4 w-4 mr-2" />
                        Instrumental Volume
                      </h3>
                      <div className="flex items-center">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={mixParams.instrumentalVolume}
                          onChange={(e) => handleMixParamChange("instrumentalVolume", parseInt(e.target.value))}
                          className="w-full h-2 bg-dark-300 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="ml-2 w-8 text-sm text-light-100/70">{mixParams.instrumentalVolume}%</span>
                      </div>
                    </div>
                    
                    {/* Effects */}
                    <div>
                      <h3 className="font-medium mb-3">Reverb</h3>
                      <div className="flex items-center">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={mixParams.reverb}
                          onChange={(e) => handleMixParamChange("reverb", parseInt(e.target.value))}
                          className="w-full h-2 bg-dark-300 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="ml-2 w-8 text-sm text-light-100/70">{mixParams.reverb}%</span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-3">Delay</h3>
                      <div className="flex items-center">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={mixParams.delay}
                          onChange={(e) => handleMixParamChange("delay", parseInt(e.target.value))}
                          className="w-full h-2 bg-dark-300 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="ml-2 w-8 text-sm text-light-100/70">{mixParams.delay}%</span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-3">Compression</h3>
                      <div className="flex items-center">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={mixParams.compression}
                          onChange={(e) => handleMixParamChange("compression", parseInt(e.target.value))}
                          className="w-full h-2 bg-dark-300 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="ml-2 w-8 text-sm text-light-100/70">{mixParams.compression}%</span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-3">High Pass Filter</h3>
                      <div className="flex items-center">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={mixParams.highPass}
                          onChange={(e) => handleMixParamChange("highPass", parseInt(e.target.value))}
                          className="w-full h-2 bg-dark-300 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="ml-2 w-8 text-sm text-light-100/70">{mixParams.highPass}%</span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-3">Low Pass Filter</h3>
                      <div className="flex items-center">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={mixParams.lowPass}
                          onChange={(e) => handleMixParamChange("lowPass", parseInt(e.target.value))}
                          className="w-full h-2 bg-dark-300 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="ml-2 w-8 text-sm text-light-100/70">{mixParams.lowPass}%</span>
                      </div>
                    </div>
                    
                    {/* Premium features */}
                    <div className={!isPremiumFeature("Advanced vocal alignment") ? "opacity-50" : ""}>
                      <h3 className="font-medium mb-3 flex items-center">
                        <Activity className="h-4 w-4 mr-2" />
                        Pitch Correction
                        {!isPremiumFeature("Advanced vocal alignment") && (
                          <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                            PRO
                          </span>
                        )}
                      </h3>
                      <div className="flex items-center">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={mixParams.pitchCorrection}
                          onChange={(e) => handleMixParamChange("pitchCorrection", parseInt(e.target.value))}
                          className="w-full h-2 bg-dark-300 rounded-lg appearance-none cursor-pointer"
                          disabled={!isPremiumFeature("Advanced vocal alignment")}
                        />
                        <span className="ml-2 w-8 text-sm text-light-100/70">{mixParams.pitchCorrection}%</span>
                      </div>
                    </div>
                    
                    <div className={!isPremiumFeature("Noise reduction") ? "opacity-50" : ""}>
                      <h3 className="font-medium mb-3 flex items-center">
                        Noise Reduction
                        {!isPremiumFeature("Noise reduction") && (
                          <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                            PRO
                          </span>
                        )}
                      </h3>
                      <div className="flex items-center">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={mixParams.noiseReduction}
                          onChange={(e) => handleMixParamChange("noiseReduction", parseInt(e.target.value))}
                          className="w-full h-2 bg-dark-300 rounded-lg appearance-none cursor-pointer"
                          disabled={!isPremiumFeature("Noise reduction")}
                        />
                        <span className="ml-2 w-8 text-sm text-light-100/70">{mixParams.noiseReduction}%</span>
                      </div>
                    </div>
                    
                    <div className={!isPremiumFeature("Advanced mixing tools") ? "opacity-50" : ""}>
                      <h3 className="font-medium mb-3 flex items-center">
                        Harmonizer
                        {!isPremiumFeature("Advanced mixing tools") && (
                          <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                            PRO
                          </span>
                        )}
                      </h3>
                      <div className="flex items-center">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={mixParams.harmonizer}
                          onChange={(e) => handleMixParamChange("harmonizer", parseInt(e.target.value))}
                          className="w-full h-2 bg-dark-300 rounded-lg appearance-none cursor-pointer"
                          disabled={!isPremiumFeature("Advanced mixing tools")}
                        />
                        <span className="ml-2 w-8 text-sm text-light-100/70">{mixParams.harmonizer}%</span>
                      </div>
                    </div>
                    
                    <div className={!isPremiumFeature("Advanced mixing tools") ? "opacity-50" : ""}>
                      <h3 className="font-medium mb-3 flex items-center">
                        Stereo Width
                        {!isPremiumFeature("Advanced mixing tools") && (
                          <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                            PRO
                          </span>
                        )}
                      </h3>
                      <div className="flex items-center">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={mixParams.stereoWidth}
                          onChange={(e) => handleMixParamChange("stereoWidth", parseInt(e.target.value))}
                          className="w-full h-2 bg-dark-300 rounded-lg appearance-none cursor-pointer"
                          disabled={!isPremiumFeature("Advanced mixing tools")}
                        />
                        <span className="ml-2 w-8 text-sm text-light-100/70">{mixParams.stereoWidth}%</span>
                      </div>
                    </div>
                  </div>
                  
                  {!isPremiumFeature("Advanced mixing tools") && (
                    <div className="mt-6 p-4 bg-dark-300 rounded-lg text-center">
                      <p className="text-light-100/70 mb-3">
                        Upgrade to Pro or Premium to unlock advanced mixing tools and features
                      </p>
                      <Button
                        variant="gradient"
                        size="sm"
                        onClick={() => navigate("/subscription")}
                      >
                        Upgrade Now
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Right column */}
              <div className="space-y-6">
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
                  
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <h4 className="font-medium mb-3">AI Processing</h4>
                    <p className="text-sm text-light-100/70 mb-3">
                      Our AI will analyze your vocals and instrumental to create the perfect match.
                    </p>
                    
                    <Button
                      variant="outline" 
                      className="w-full"
                      onClick={processAudioFiles}
                      disabled={isProcessing || !vocalAudioBlob || !instrumentalAudioBlob}
                      isLoading={isProcessing}
                    >
                      Reprocess Audio
                    </Button>
                  </div>
                </div>
                
                <div className="glass-card p-6">
                  <h3 className="text-xl font-semibold mb-4">Project Actions</h3>
                  
                  <div className="space-y-3">
                    <Button 
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => navigate("/studio")}
                    >
                      <Sliders className="h-5 w-5 mr-2" />
                      Back to Studio
                    </Button>
                    
                    <Button 
                      variant="outline"
                      className="w-full justify-start"
                      onClick={saveProject}
                      isLoading={saving}
                    >
                      <Save className="h-5 w-5 mr-2" />
                      Save Project
                    </Button>
                    
                    <Button 
                      variant="outline"
                      className="w-full justify-start"
                      onClick={handleExportAudio}
                      disabled={!processedAudioBuffer || (!isPremiumFeature("Mix exporting in multiple formats") && !isPremiumFeature("Advanced mixing tools"))}
                    >
                      <Download className="h-5 w-5 mr-2" />
                      Export Audio
                      {!isPremiumFeature("Mix exporting in multiple formats") && !isPremiumFeature("Advanced mixing tools") && (
                        <span className="ml-auto text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                          PRO
                        </span>
                      )}
                    </Button>
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

export default Mixing;
