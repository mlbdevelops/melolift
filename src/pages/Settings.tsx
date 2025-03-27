import { useState, useEffect } from "react";
import { Save, Moon, Sun, Volume2, VolumeX, Check } from "lucide-react";
import { toast } from "sonner";
import Layout from "../components/Layout";
import Button from "../components/Button";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface UserSettings {
  theme: 'dark' | 'light' | 'system';
  audioQuality: 'low' | 'medium' | 'high';
  notifications: boolean;
  exportFormat: 'mp3' | 'wav' | 'flac';
  autoSave: boolean;
}

const Settings = () => {
  const { user, isPremiumFeature } = useAuth();
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'dark',
    audioQuality: 'medium',
    notifications: true,
    exportFormat: 'mp3', // Default export format is MP3
    autoSave: true
  });
  
  useEffect(() => {
    if (user) {
      fetchUserSettings();
    }
  }, [user]);
  
  const fetchUserSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('settings')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (error) throw error;
      
      if (data && data.settings) {
        // Parse settings from JSON if needed
        const userSettings = typeof data.settings === 'string' 
          ? JSON.parse(data.settings)
          : data.settings;
          
        setSettings({
          ...settings,
          ...userSettings
        });
      }
    } catch (error) {
      console.error("Error fetching user settings:", error);
    }
  };
  
  const saveSettings = async () => {
    if (!user) {
      toast.error("You must be logged in to save settings");
      return;
    }
    
    setSaving(true);
    
    try {
      // Check if user has settings
      const { data: existingData, error: fetchError } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (fetchError) throw fetchError;
      
      let result;
      
      if (existingData) {
        // Update existing settings
        result = await supabase
          .from('user_preferences')
          .update({ 
            settings: settings as any,
            updated_at: new Date().toISOString() 
          })
          .eq('id', existingData.id);
      } else {
        // Insert new settings
        result = await supabase
          .from('user_preferences')
          .insert({ 
            user_id: user.id,
            settings: settings as any 
          });
      }
      
      if (result.error) throw result.error;
      
      toast.success("Settings saved successfully");
      
      // Apply settings in real-time
      applySettings();
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };
  
  const applySettings = () => {
    // Apply theme
    document.documentElement.classList.remove('dark', 'light');
    if (settings.theme !== 'system') {
      document.documentElement.classList.add(settings.theme);
    } else {
      // Check system preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.add('light');
      }
    }
    
    // Other settings would be applied through context or localStorage
    localStorage.setItem('userSettings', JSON.stringify(settings));
    
    // Apply audio settings (in a real app this would hook into audio contexts)
    console.log("Applied settings:", settings);
  };
  
  const handleChangeSetting = (
    settingName: keyof UserSettings, 
    value: string | boolean
  ) => {
    setSettings(prev => ({
      ...prev,
      [settingName]: value
    }));
  };
  
  const renderPremiumFeature = (
    feature: JSX.Element, 
    featureName: string
  ) => {
    const hasPremiumAccess = isPremiumFeature(featureName);
    
    if (hasPremiumAccess) {
      return feature;
    }
    
    return (
      <div className="relative">
        <div className="opacity-50 pointer-events-none">
          {feature}
        </div>
        <div 
          className="absolute inset-0 flex items-center justify-center bg-dark-300/80 cursor-pointer"
          onClick={() => {
            toast.info(
              <div>
                <p className="font-bold mb-2">Premium Feature</p>
                <p>Upgrade to access premium audio quality settings.</p>
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
      </div>
    );
  };
  
  return (
    <Layout>
      <div className="container mx-auto p-4 md:p-8 max-w-4xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
            <p className="text-light-100/60">Customize your MeloLift experience</p>
          </div>
          
          <Button
            variant="gradient"
            className="mt-4 md:mt-0 flex items-center"
            onClick={saveSettings}
            isLoading={saving}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
        
        <div className="space-y-8">
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4">Appearance</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Theme</h3>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    className={`flex flex-col items-center justify-center p-4 rounded-lg border ${
                      settings.theme === 'dark' 
                        ? 'border-primary bg-primary/10' 
                        : 'border-white/10 hover:border-white/30'
                    }`}
                    onClick={() => handleChangeSetting('theme', 'dark')}
                  >
                    <Moon className="h-6 w-6 mb-2" />
                    <span>Dark</span>
                    {settings.theme === 'dark' && (
                      <div className="absolute top-2 right-2 text-primary">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                  </button>
                  
                  <button
                    className={`flex flex-col items-center justify-center p-4 rounded-lg border ${
                      settings.theme === 'light' 
                        ? 'border-primary bg-primary/10' 
                        : 'border-white/10 hover:border-white/30'
                    }`}
                    onClick={() => handleChangeSetting('theme', 'light')}
                  >
                    <Sun className="h-6 w-6 mb-2" />
                    <span>Light</span>
                    {settings.theme === 'light' && (
                      <div className="absolute top-2 right-2 text-primary">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                  </button>
                  
                  <button
                    className={`flex flex-col items-center justify-center p-4 rounded-lg border ${
                      settings.theme === 'system' 
                        ? 'border-primary bg-primary/10' 
                        : 'border-white/10 hover:border-white/30'
                    }`}
                    onClick={() => handleChangeSetting('theme', 'system')}
                  >
                    <div className="flex mb-2">
                      <Sun className="h-6 w-6" />
                      <Moon className="h-6 w-6 ml-1" />
                    </div>
                    <span>System</span>
                    {settings.theme === 'system' && (
                      <div className="absolute top-2 right-2 text-primary">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4">Audio Settings</h2>
            
            <div className="space-y-6">
              {renderPremiumFeature(
                <div>
                  <h3 className="text-sm font-medium mb-2">Audio Quality</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <button
                      className={`flex flex-col items-center justify-center p-4 rounded-lg border ${
                        settings.audioQuality === 'low' 
                          ? 'border-primary bg-primary/10' 
                          : 'border-white/10 hover:border-white/30'
                      }`}
                      onClick={() => handleChangeSetting('audioQuality', 'low')}
                    >
                      <Volume2 className="h-6 w-6 mb-2 opacity-50" />
                      <span>Low</span>
                      {settings.audioQuality === 'low' && (
                        <div className="absolute top-2 right-2 text-primary">
                          <Check className="h-4 w-4" />
                        </div>
                      )}
                    </button>
                    
                    <button
                      className={`flex flex-col items-center justify-center p-4 rounded-lg border ${
                        settings.audioQuality === 'medium' 
                          ? 'border-primary bg-primary/10' 
                          : 'border-white/10 hover:border-white/30'
                      }`}
                      onClick={() => handleChangeSetting('audioQuality', 'medium')}
                    >
                      <Volume2 className="h-6 w-6 mb-2 opacity-75" />
                      <span>Medium</span>
                      {settings.audioQuality === 'medium' && (
                        <div className="absolute top-2 right-2 text-primary">
                          <Check className="h-4 w-4" />
                        </div>
                      )}
                    </button>
                    
                    <button
                      className={`flex flex-col items-center justify-center p-4 rounded-lg border ${
                        settings.audioQuality === 'high' 
                          ? 'border-primary bg-primary/10' 
                          : 'border-white/10 hover:border-white/30'
                      }`}
                      onClick={() => handleChangeSetting('audioQuality', 'high')}
                    >
                      <Volume2 className="h-6 w-6 mb-2" />
                      <span>High</span>
                      {settings.audioQuality === 'high' && (
                        <div className="absolute top-2 right-2 text-primary">
                          <Check className="h-4 w-4" />
                        </div>
                      )}
                    </button>
                  </div>
                </div>,
                'high-quality-audio'
              )}
              
              <div>
                <h3 className="text-sm font-medium mb-2">Export Format</h3>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    className={`flex flex-col items-center justify-center p-4 rounded-lg border ${
                      settings.exportFormat === 'mp3' 
                        ? 'border-primary bg-primary/10' 
                        : 'border-white/10 hover:border-white/30'
                    }`}
                    onClick={() => handleChangeSetting('exportFormat', 'mp3')}
                  >
                    <span className="text-lg font-mono mb-2">MP3</span>
                    <span className="text-xs">Compressed</span>
                    {settings.exportFormat === 'mp3' && (
                      <div className="absolute top-2 right-2 text-primary">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                  </button>
                  
                  {renderPremiumFeature(
                    <button
                      className={`flex flex-col items-center justify-center p-4 rounded-lg border ${
                        settings.exportFormat === 'wav' 
                          ? 'border-primary bg-primary/10' 
                          : 'border-white/10 hover:border-white/30'
                      }`}
                      onClick={() => handleChangeSetting('exportFormat', 'wav')}
                    >
                      <span className="text-lg font-mono mb-2">WAV</span>
                      <span className="text-xs">Lossless</span>
                      {settings.exportFormat === 'wav' && (
                        <div className="absolute top-2 right-2 text-primary">
                          <Check className="h-4 w-4" />
                        </div>
                      )}
                    </button>,
                    'wav-export'
                  )}
                  
                  {renderPremiumFeature(
                    <button
                      className={`flex flex-col items-center justify-center p-4 rounded-lg border ${
                        settings.exportFormat === 'flac' 
                          ? 'border-primary bg-primary/10' 
                          : 'border-white/10 hover:border-white/30'
                      }`}
                      onClick={() => handleChangeSetting('exportFormat', 'flac')}
                    >
                      <span className="text-lg font-mono mb-2">FLAC</span>
                      <span className="text-xs">Audiophile</span>
                      {settings.exportFormat === 'flac' && (
                        <div className="absolute top-2 right-2 text-primary">
                          <Check className="h-4 w-4" />
                        </div>
                      )}
                    </button>,
                    'flac-export'
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4">Application Settings</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Notifications</h3>
                  <p className="text-xs text-light-100/60">
                    Receive notifications about project updates
                  </p>
                </div>
                <div 
                  className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${
                    settings.notifications ? 'bg-primary' : 'bg-dark-300'
                  }`}
                  onClick={() => handleChangeSetting('notifications', !settings.notifications)}
                >
                  <div 
                    className={`w-4 h-4 rounded-full bg-white transform transition-transform ${
                      settings.notifications ? 'translate-x-6' : 'translate-x-0'
                    }`} 
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Auto-Save</h3>
                  <p className="text-xs text-light-100/60">
                    Automatically save projects while working
                  </p>
                </div>
                <div 
                  className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${
                    settings.autoSave ? 'bg-primary' : 'bg-dark-300'
                  }`}
                  onClick={() => handleChangeSetting('autoSave', !settings.autoSave)}
                >
                  <div 
                    className={`w-4 h-4 rounded-full bg-white transform transition-transform ${
                      settings.autoSave ? 'translate-x-6' : 'translate-x-0'
                    }`} 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
