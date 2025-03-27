import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Save, Download, Volume, VolumeX, ArrowLeft, Loader, Share2, Play, Pause, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import Layout from "../components/Layout";
import Button from "../components/Button";
import AudioVisualizer from "../components/AudioVisualizer";
import VocalRecorder from "../components/VocalRecorder";
import InstrumentalBrowser from "../components/InstrumentalBrowser";
import { useAudio } from "../contexts/AudioContext";
import { useAudioPlayer } from "../hooks/useAudioPlayer";
import { audioBufferToWav } from "../services/audioService";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "../hooks/use-mobile";

interface ProjectData {
  id: string;
  title: string;
  vocal_url: string | null;
  instrumental_url: string | null;
  mixed_url: string | null;
  settings: any;
  status?: string;
}

const Studio = () => {
  const isMobile = useIsMobile();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project');
  const navigate = useNavigate();
  
  const { user } = useAuth();
  const { 
    vocalAudioBlob, 
    instrumentalAudioBlob, 
    processedAudioBuffer,
    isProcessing,
    mood,
    energy 
  } = useAudio();
  
  const { isPlaying, togglePlayback } = useAudioPlayer(processedAudioBuffer);
  
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(false);
  const [projectTitle, setProjectTitle] = useState("Untitled Project");
  const [isMuted, setIsMuted] = useState(false);
  const [activeStep, setActiveStep] = useState<'vocal' | 'instrumental'>('vocal');
  
  useEffect(() => {
    if (projectId && user) {
      setLoading(true);
      fetchProject(projectId);
    }
  }, [projectId, user]);
  
  useEffect(() => {
    // Move to instrumental step when vocal is uploaded
    if (vocalAudioBlob && activeStep === 'vocal') {
      setActiveStep('instrumental');
    }
  }, [vocalAudioBlob, activeStep]);
  
  const fetchProject = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('audio_projects')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      setProject(data);
      setProjectTitle(data.title);
    } catch (error) {
      console.error("Error loading project:", error);
      toast.error("Failed to load project");
    } finally {
      setLoading(false);
    }
  };
  
  const handleSaveProject = async () => {
    if (!user) {
      toast.error("You must be logged in to save projects");
      return;
    }
    
    try {
      const projectData = {
        title: projectTitle,
        status: 'draft',
        updated_at: new Date().toISOString()
      };
      
      if (project) {
        // Update existing project
        const { error } = await supabase
          .from('audio_projects')
          .update(projectData)
          .eq('id', project.id);
          
        if (error) throw error;
        
        toast.success("Project updated successfully");
      } else {
        // Create new project
        const { data, error } = await supabase
          .from('audio_projects')
          .insert({
            ...projectData,
            user_id: user.id,
            created_at: new Date().toISOString()
          })
          .select();
          
        if (error) throw error;
        
        setProject(data[0]);
        
        // Update URL with new project ID
        navigate(`/studio?project=${data[0].id}`, { replace: true });
        
        toast.success("Project created successfully");
      }
    } catch (error) {
      console.error("Error saving project:", error);
      toast.error("Failed to save project");
    }
  };
  
  const handleProceedToMixing = () => {
    if (!vocalAudioBlob || !instrumentalAudioBlob) {
      toast.error("Please upload both vocal and instrumental tracks");
      return;
    }
    
    if (project) {
      navigate(`/mixing?project=${project.id}`);
    } else {
      // Save project first then navigate
      handleSaveProject().then(() => {
        if (project) {
          navigate(`/mixing?project=${project.id}`);
        } else {
          navigate('/mixing');
        }
      });
    }
  };
  
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
  
  const handleShare = () => {
    if (!project) {
      toast.error("Save your project first to share it");
      return;
    }
    
    // In a real app, this would generate a share link
    navigator.clipboard.writeText(window.location.href)
      .then(() => toast.success("Share link copied to clipboard"))
      .catch(() => toast.error("Failed to copy link"));
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-full overflow-x-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Header - make more responsive for small screens */}
            <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                
                <div>
                  <input
                    type="text"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    className="bg-transparent border-b border-white/10 focus:border-primary focus:outline-none text-xl font-bold py-1 px-2 w-full"
                    style={{ maxWidth: isMobile ? '180px' : '300px' }}
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4 mr-1" />
                  ) : (
                    <Volume className="h-4 w-4 mr-1" />
                  )}
                  <span className="hidden sm:inline">{isMuted ? "Unmute" : "Mute"}</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Share</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportAudio}
                  disabled={!processedAudioBuffer}
                >
                  <Download className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
                
                <Button
                  variant="gradient"
                  size="sm"
                  onClick={handleSaveProject}
                >
                  <Save className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Save</span>
                </Button>
              </div>
            </div>
            
            {/* Progress Steps - simplify for mobile */}
            <div className="mb-6 overflow-x-auto pb-2">
              <div className={`flex ${isMobile ? 'w-max min-w-full' : ''} items-center`}>
                <div className={`flex items-center ${activeStep === 'vocal' ? 'text-primary' : 'text-light-100/60'}`}>
                  <div className={`w-8 h-8 rounded-full ${activeStep === 'vocal' ? 'bg-primary text-white' : 'bg-dark-300 text-light-100/60'} flex items-center justify-center mr-2`}>
                    1
                  </div>
                  <span className="font-medium whitespace-nowrap">Record Vocals</span>
                </div>
                
                <div className="w-8 h-px bg-light-100/20 mx-2 sm:mx-4"></div>
                
                <div className={`flex items-center ${activeStep === 'instrumental' ? 'text-primary' : 'text-light-100/20'}`}>
                  <div className={`w-8 h-8 rounded-full ${activeStep === 'instrumental' ? 'bg-primary text-white' : 'bg-dark-300 text-light-100/20'} flex items-center justify-center mr-2`}>
                    2
                  </div>
                  <span className="font-medium whitespace-nowrap">Select Instrumental</span>
                </div>
                
                <div className="w-8 h-px bg-light-100/20 mx-2 sm:mx-4"></div>
                
                <div className="flex items-center text-light-100/20">
                  <div className="w-8 h-8 rounded-full bg-dark-300 text-light-100/20 flex items-center justify-center mr-2">
                    3
                  </div>
                  <span className="font-medium whitespace-nowrap">Mix & Process</span>
                </div>
              </div>
            </div>
            
            {/* Main content - better responsive layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Left column */}
              <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                {/* Waveform visualization */}
                <div className="glass-card p-4 sm:p-6">
                  <h2 className="text-xl font-semibold mb-4">Audio Preview</h2>
                  
                  <div className="h-32 sm:h-40 bg-dark-300 rounded-lg overflow-hidden relative">
                    <AudioVisualizer isPlaying={isPlaying && !isProcessing} />
                    
                    {isProcessing && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-200/60 backdrop-blur-sm">
                        <Loader className="h-8 w-8 animate-spin text-primary mb-2" />
                        <span className="text-sm text-light-100/80">Processing audio...</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap justify-between items-center mt-4 gap-2">
                    <div className="text-sm text-light-100/60">
                      {vocalAudioBlob ? "Vocal track ready" : "Waiting for vocal track..."}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {vocalAudioBlob && processedAudioBuffer && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={togglePlayback}
                        >
                          {isPlaying ? (
                            <>
                              <Pause className="h-4 w-4 mr-1" />
                              <span>Pause</span>
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-1" />
                              <span>Play</span>
                            </>
                          )}
                        </Button>
                      )}
                      
                      {vocalAudioBlob && instrumentalAudioBlob && (
                        <Button
                          variant="gradient"
                          size="sm"
                          onClick={handleProceedToMixing}
                        >
                          Continue to Mixing
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Current step content */}
                {activeStep === 'vocal' ? (
                  // Vocal recorder
                  <VocalRecorder />
                ) : (
                  // Instrumental browser 
                  <InstrumentalBrowser />
                )}
              </div>
              
              {/* Right column */}
              <div className="space-y-4 sm:space-y-6">
                {/* Step Instructions */}
                <div className="glass-card p-4 sm:p-6">
                  <h3 className="text-xl font-semibold mb-4">
                    {activeStep === 'vocal' ? 'Record Your Vocals' : 'Choose an Instrumental'}
                  </h3>
                  
                  {activeStep === 'vocal' ? (
                    <div className="space-y-4">
                      <p className="text-light-100/70">
                        Record your vocals directly in the browser or upload an existing audio file.
                        For best results:
                      </p>
                      
                      <ul className="space-y-2 text-light-100/70">
                        <li className="flex items-start">
                          <span className="w-5 h-5 bg-primary/20 text-primary flex items-center justify-center rounded-full mr-2 shrink-0">1</span>
                          <span>Use a quiet environment with minimal background noise</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-5 h-5 bg-primary/20 text-primary flex items-center justify-center rounded-full mr-2 shrink-0">2</span>
                          <span>Maintain a consistent distance from your microphone</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-5 h-5 bg-primary/20 text-primary flex items-center justify-center rounded-full mr-2 shrink-0">3</span>
                          <span>Try to perform with the timing and style you want in the final mix</span>
                        </li>
                      </ul>
                      
                      {vocalAudioBlob && (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setActiveStep('instrumental')}
                        >
                          Continue to Instrumental Selection
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-light-100/70">
                        Select an instrumental from our library or upload your own backing track.
                        The AI will automatically match your vocals to the instrumental.
                      </p>
                      
                      <ul className="space-y-2 text-light-100/70">
                        <li className="flex items-start">
                          <span className="w-5 h-5 bg-primary/20 text-primary flex items-center justify-center rounded-full mr-2 shrink-0">1</span>
                          <span>Choose a track that complements your vocal style</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-5 h-5 bg-primary/20 text-primary flex items-center justify-center rounded-full mr-2 shrink-0">2</span>
                          <span>Our AI works best with instrumentals that have clear rhythm and structure</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-5 h-5 bg-primary/20 text-primary flex items-center justify-center rounded-full mr-2 shrink-0">3</span>
                          <span>WAV or high-quality MP3 files provide the best results</span>
                        </li>
                      </ul>
                      
                      {vocalAudioBlob && instrumentalAudioBlob && (
                        <Button
                          variant="gradient"
                          className="w-full"
                          onClick={handleProceedToMixing}
                        >
                          Continue to Mixing
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Project info */}
                <div className="glass-card p-4 sm:p-6">
                  <h3 className="text-xl font-semibold mb-4">Project Info</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-light-100/70">
                        Project Title
                      </label>
                      <input
                        type="text"
                        value={projectTitle}
                        onChange={(e) => setProjectTitle(e.target.value)}
                        className="w-full bg-dark-300 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-primary"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1 text-light-100/70">
                        Project Status
                      </label>
                      <div className="text-sm bg-primary/20 text-primary px-3 py-1.5 rounded-lg inline-block">
                        {project?.status === 'in_progress' ? 'In Progress' : 'Draft'}
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleSaveProject}
                    >
                      <Save className="h-4 w-4 mr-1" />
                      Save Project
                    </Button>
                  </div>
                </div>
                
                {/* Help section */}
                <div className="glass-card p-4 sm:p-6">
                  <h3 className="text-xl font-semibold mb-4">Need Help?</h3>
                  
                  <p className="text-light-100/70 text-sm mb-4">
                    Our AI will automatically align your vocals with the instrumental,
                    but you can enhance the results in the mixing stage.
                  </p>
                  
                  <div className="text-center mt-6">
                    <Button variant="outline" className="w-full" onClick={() => navigate('/groovepad')}>
                      Explore GroovePad
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

export default Studio;
