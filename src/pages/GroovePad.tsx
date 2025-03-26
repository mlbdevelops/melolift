
import { useState, useEffect } from "react";
import { ArrowLeft, Save, Play, Pause, RefreshCw, Download, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Layout from "../components/Layout";
import Button from "../components/Button";
import { useAudio } from "../contexts/AudioContext";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const GroovePad = () => {
  const { mood, energy, setMood, setEnergy, processedAudioBuffer } = useAudio();
  const { user, isPremiumFeature } = useAuth();
  const navigate = useNavigate();
  
  const [presets, setPresets] = useState([
    { name: "Chill Lo-Fi", mood: -0.5, energy: -0.7 },
    { name: "Happy Pop", mood: 0.8, energy: 0.6 },
    { name: "Epic Orchestral", mood: 0.3, energy: 0.9 },
    { name: "Sad Ballad", mood: -0.8, energy: -0.4 },
    { name: "Upbeat Dance", mood: 0.6, energy: 0.8 },
    { name: "Dreamy Ambient", mood: 0.2, energy: -0.6 },
  ]);
  
  const [customPresets, setCustomPresets] = useState<Array<{ name: string; mood: number; energy: number }>>([]);
  const [newPresetName, setNewPresetName] = useState("");
  const [creating, setCreating] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [audioSource, setAudioSource] = useState<AudioBufferSourceNode | null>(null);
  
  useEffect(() => {
    if (user) {
      fetchCustomPresets();
    }
    
    return () => {
      if (audioSource) {
        audioSource.stop();
      }
    };
  }, [user]);
  
  const fetchCustomPresets = async () => {
    // In a real app, this would fetch from the database
    // For now, we'll just simulate it
    setCustomPresets([
      { name: "My Favorite", mood: 0.4, energy: 0.2 },
      { name: "Night Vibes", mood: -0.3, energy: -0.5 },
    ]);
  };
  
  const applyPreset = (preset: { mood: number; energy: number }) => {
    setMood(preset.mood);
    setEnergy(preset.energy);
    toast.success("Preset applied");
  };
  
  const saveCustomPreset = () => {
    if (!isPremiumFeature("Extended groove pad")) {
      toast.error("Custom presets require a Pro or Premium subscription");
      return;
    }
    
    if (!newPresetName.trim()) {
      toast.error("Please enter a preset name");
      return;
    }
    
    setCreating(true);
    
    // Simulate API call
    setTimeout(() => {
      setCustomPresets([
        ...customPresets,
        { name: newPresetName, mood, energy }
      ]);
      setNewPresetName("");
      setCreating(false);
      toast.success("Custom preset saved");
    }, 800);
  };
  
  const deleteCustomPreset = (index: number) => {
    const updatedPresets = [...customPresets];
    updatedPresets.splice(index, 1);
    setCustomPresets(updatedPresets);
    toast.success("Custom preset deleted");
  };
  
  const togglePlayback = () => {
    if (playing && audioSource) {
      audioSource.stop();
      setAudioSource(null);
      setPlaying(false);
      return;
    }
    
    if (!processedAudioBuffer) {
      toast.error("No audio to play");
      return;
    }
    
    // Play the audio
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = audioContext.createBufferSource();
    source.buffer = processedAudioBuffer;
    source.connect(audioContext.destination);
    source.start(0);
    source.onended = () => {
      setPlaying(false);
      setAudioSource(null);
    };
    
    setAudioSource(source);
    setPlaying(true);
  };
  
  const getMoodDescription = (value: number): string => {
    if (value < -0.6) return "Very Sad";
    if (value < -0.2) return "Melancholic";
    if (value < 0.2) return "Neutral";
    if (value < 0.6) return "Happy";
    return "Very Uplifting";
  };
  
  const getEnergyDescription = (value: number): string => {
    if (value < -0.6) return "Very Calm";
    if (value < -0.2) return "Relaxed";
    if (value < 0.2) return "Balanced";
    if (value < 0.6) return "Energetic";
    return "Very Intense";
  };
  
  const getColorForMood = (value: number): string => {
    if (value < -0.5) return "rgb(59, 130, 246)"; // Blue for sad
    if (value < 0) return "rgb(99, 102, 241)";    // Indigo for slightly sad
    if (value < 0.5) return "rgb(139, 92, 246)";  // Purple for neutral to happy
    return "rgb(236, 72, 153)";                   // Pink for very happy
  };
  
  const getColorForEnergy = (value: number): string => {
    if (value < -0.5) return "rgb(16, 185, 129)"; // Green for calm
    if (value < 0) return "rgb(245, 158, 11)";    // Amber for relaxed
    if (value < 0.5) return "rgb(249, 115, 22)";  // Orange for moderate
    return "rgb(239, 68, 68)";                    // Red for high energy
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-2xl font-bold ml-2">GroovePad</h1>
          </div>
          
          <div className="flex gap-2">
            {processedAudioBuffer && (
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={togglePlayback}
              >
                {playing ? (
                  <>
                    <Pause className="h-4 w-4" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    <span>Play</span>
                  </>
                )}
              </Button>
            )}
            
            <Button
              variant="gradient"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => navigate("/mixing")}
              disabled={!processedAudioBuffer}
            >
              <Save className="h-4 w-4" />
              <span>Apply to Mix</span>
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main GroovePad */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-6">GroovePad Controller</h2>
              
              <div className="relative h-80 sm:h-96 bg-dark-300 rounded-lg mb-4 overflow-hidden">
                <div 
                  className="absolute w-6 h-6 rounded-full bg-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
                  style={{ 
                    left: `${((mood + 1) / 2) * 100}%`, 
                    top: `${(1 - ((energy + 1) / 2)) * 100}%`,
                    boxShadow: `0 0 15px ${getColorForMood(mood)}, 0 0 30px ${getColorForEnergy(energy)}`
                  }}
                />
                
                {/* Horizontal gradient for mood */}
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-20"
                />
                
                {/* Vertical gradient for energy */}
                <div 
                  className="absolute inset-0 bg-gradient-to-b from-red-500 via-orange-500 to-green-500 opacity-20"
                />
                
                {/* Grid lines */}
                <div className="absolute inset-0 grid grid-cols-4 grid-rows-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div 
                      key={`v-${i}`} 
                      className="h-full w-px bg-white/10 col-start-auto"
                      style={{ left: `${((i + 1) / 4) * 100}%` }}
                    />
                  ))}
                  
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div 
                      key={`h-${i}`} 
                      className="w-full h-px bg-white/10 row-start-auto"
                      style={{ top: `${((i + 1) / 4) * 100}%` }}
                    />
                  ))}
                </div>
                
                {/* Text labels */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute left-4 top-4 text-xs text-light-100/60">Energetic</div>
                  <div className="absolute right-4 top-4 text-xs text-light-100/60">Uplifting</div>
                  <div className="absolute left-4 bottom-4 text-xs text-light-100/60">Calm</div>
                  <div className="absolute right-4 bottom-4 text-xs text-light-100/60">Melancholic</div>
                </div>
                
                {/* Interactive area */}
                <div 
                  className="absolute inset-0 cursor-pointer"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = (e.clientX - rect.left) / rect.width;
                    const y = (e.clientY - rect.top) / rect.height;
                    
                    setMood(x * 2 - 1);
                    setEnergy((1 - y) * 2 - 1);
                  }}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h3 className="text-light-100/70 mb-1">Mood</h3>
                  <div className="flex items-center">
                    <input
                      type="range"
                      min="-1"
                      max="1"
                      step="0.01"
                      value={mood}
                      onChange={(e) => setMood(parseFloat(e.target.value))}
                      className="w-full h-2 bg-dark-300 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="ml-2 text-light-100/70 font-medium w-32">
                      {getMoodDescription(mood)}
                    </span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-light-100/70 mb-1">Energy</h3>
                  <div className="flex items-center">
                    <input
                      type="range"
                      min="-1"
                      max="1"
                      step="0.01"
                      value={energy}
                      onChange={(e) => setEnergy(parseFloat(e.target.value))}
                      className="w-full h-2 bg-dark-300 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="ml-2 text-light-100/70 font-medium w-32">
                      {getEnergyDescription(energy)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-white/10">
                <h3 className="font-medium mb-4">Custom Preset</h3>
                
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Save current settings as preset..."
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    className="flex-1 bg-dark-300 border border-white/10 rounded-lg px-4 py-2 focus:border-primary focus:outline-none"
                    disabled={!isPremiumFeature("Extended groove pad")}
                  />
                  
                  <Button
                    variant="gradient"
                    onClick={saveCustomPreset}
                    isLoading={creating}
                    disabled={!isPremiumFeature("Extended groove pad")}
                  >
                    Save
                  </Button>
                </div>
                
                {!isPremiumFeature("Extended groove pad") && (
                  <div className="mt-3 text-sm text-light-100/60 flex items-center">
                    <Lock className="h-4 w-4 mr-1" />
                    Custom presets require a Pro or Premium subscription
                  </div>
                )}
              </div>
            </div>
            
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-4">Audio Processing</h2>
              
              <p className="text-light-100/70 mb-4">
                The GroovePad settings affect how our AI processes your vocal and instrumental tracks.
                Different mood and energy settings create unique effects tailored to your desired sound.
              </p>
              
              <div className="space-y-4">
                <div className="p-4 bg-dark-300 rounded-lg">
                  <h3 className="font-medium mb-2 flex items-center">
                    <span 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: getColorForMood(mood) }}
                    />
                    Mood: {getMoodDescription(mood)}
                  </h3>
                  <p className="text-sm text-light-100/70">
                    {mood < -0.3 
                      ? "Enhances melancholic elements with subtle reverb and emotional processing."
                      : mood > 0.3
                      ? "Brightens the mix with enhanced clarity and harmonic excitement."
                      : "Balanced processing that maintains the natural emotion of your vocals."
                    }
                  </p>
                </div>
                
                <div className="p-4 bg-dark-300 rounded-lg">
                  <h3 className="font-medium mb-2 flex items-center">
                    <span 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: getColorForEnergy(energy) }}
                    />
                    Energy: {getEnergyDescription(energy)}
                  </h3>
                  <p className="text-sm text-light-100/70">
                    {energy < -0.3 
                      ? "Softens transients and creates a smoother, more relaxed sound."
                      : energy > 0.3
                      ? "Enhances dynamics and adds punch to make your mix more energetic."
                      : "Maintains a balanced energy level with moderate dynamic processing."
                    }
                  </p>
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => navigate("/mixing")}
                  className="w-full"
                  disabled={!processedAudioBuffer}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Apply to Current Mix
                </Button>
              </div>
            </div>
          </div>
          
          {/* Presets sidebar */}
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-4">Genre Presets</h2>
              
              <div className="space-y-2">
                {presets.map((preset, index) => (
                  <button
                    key={index}
                    className="w-full p-3 text-left bg-dark-300 hover:bg-dark-400 rounded-lg transition-colors flex justify-between items-center"
                    onClick={() => applyPreset(preset)}
                  >
                    <span>{preset.name}</span>
                    <div className="flex items-center space-x-2 text-xs text-light-100/50">
                      <span className="flex items-center">
                        <span 
                          className="w-2 h-2 rounded-full mr-1" 
                          style={{ backgroundColor: getColorForMood(preset.mood) }}
                        />
                        {getMoodDescription(preset.mood)}
                      </span>
                      <span>•</span>
                      <span className="flex items-center">
                        <span 
                          className="w-2 h-2 rounded-full mr-1" 
                          style={{ backgroundColor: getColorForEnergy(preset.energy) }}
                        />
                        {getEnergyDescription(preset.energy)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-4">Your Presets</h2>
              
              {customPresets.length > 0 ? (
                <div className="space-y-2">
                  {customPresets.map((preset, index) => (
                    <div
                      key={index}
                      className="p-3 bg-dark-300 rounded-lg flex justify-between items-center"
                    >
                      <div className="flex-1 mr-3">
                        <div className="flex justify-between">
                          <span>{preset.name}</span>
                          <button
                            className="text-red-500 hover:text-red-400 text-sm"
                            onClick={() => deleteCustomPreset(index)}
                          >
                            Delete
                          </button>
                        </div>
                        <div className="text-xs text-light-100/50 mt-1 flex items-center space-x-2">
                          <span className="flex items-center">
                            <span 
                              className="w-2 h-2 rounded-full mr-1" 
                              style={{ backgroundColor: getColorForMood(preset.mood) }}
                            />
                            {getMoodDescription(preset.mood)}
                          </span>
                          <span>•</span>
                          <span className="flex items-center">
                            <span 
                              className="w-2 h-2 rounded-full mr-1" 
                              style={{ backgroundColor: getColorForEnergy(preset.energy) }}
                            />
                            {getEnergyDescription(preset.energy)}
                          </span>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => applyPreset(preset)}
                      >
                        Apply
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-light-100/50">
                  {isPremiumFeature("Extended groove pad") ? (
                    <p>You haven't saved any custom presets yet.</p>
                  ) : (
                    <div>
                      <Lock className="h-8 w-8 mx-auto mb-2 text-light-100/30" />
                      <p>Custom presets are available with Pro or Premium plans.</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => navigate("/subscription")}
                      >
                        Upgrade Now
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default GroovePad;
