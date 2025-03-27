
import { useState, useEffect } from "react";
import { Bell, Volume2, Moon, Sun, Globe, Shield, Sliders, Save } from "lucide-react";
import { toast } from "sonner";
import Layout from "../components/Layout";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "../contexts/AuthContext";

interface UserSettings {
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    marketingEmails: boolean;
  };
  audioSettings: {
    masterVolume: number;
    autoPlay: boolean;
    highQualityStreaming: boolean;
  };
  appearance: {
    darkMode: boolean;
    compactView: boolean;
  };
  privacy: {
    profileVisibility: string;
    activityTracking: boolean;
  };
}

const defaultSettings: UserSettings = {
  notifications: {
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
  },
  audioSettings: {
    masterVolume: 80,
    autoPlay: true,
    highQualityStreaming: false,
  },
  appearance: {
    darkMode: true,
    compactView: false,
  },
  privacy: {
    profileVisibility: "public",
    activityTracking: true,
  },
};

const Settings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      if (user) {
        try {
          setLoading(true);
          
          const { data, error } = await supabase
            .from('user_preferences')
            .select('settings')
            .eq('user_id', user.id)
            .maybeSingle();
            
          if (data && !error) {
            // Safely convert the data.settings to UserSettings
            const savedSettings = data.settings as Record<string, any>;
            
            if (savedSettings) {
              // Merge saved settings with default settings to ensure all properties exist
              const mergedSettings: UserSettings = {
                notifications: {
                  ...defaultSettings.notifications,
                  ...(savedSettings.notifications || {})
                },
                audioSettings: {
                  ...defaultSettings.audioSettings,
                  ...(savedSettings.audioSettings || {})
                },
                appearance: {
                  ...defaultSettings.appearance,
                  ...(savedSettings.appearance || {})
                },
                privacy: {
                  ...defaultSettings.privacy,
                  ...(savedSettings.privacy || {})
                }
              };
              
              setSettings(mergedSettings);
            }
          }
        } catch (error) {
          console.error("Error loading settings:", error);
          toast.error("Failed to load settings");
        } finally {
          setLoading(false);
          setInitialLoad(false);
        }
      }
    };
    
    loadSettings();
  }, [user]);

  const saveSettings = async () => {
    if (!user) {
      toast.error("You must be logged in to save settings");
      return;
    }
    
    setLoading(true);
    try {
      // Check if user already has settings
      const { data: existingSettings, error: checkError } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (checkError) {
        throw checkError;
      }
      
      let result;
      
      if (existingSettings) {
        // Update existing settings
        result = await supabase
          .from('user_preferences')
          .update({ settings, updated_at: new Date().toISOString() })
          .eq('user_id', user.id);
      } else {
        // Insert new settings
        result = await supabase
          .from('user_preferences')
          .insert({ user_id: user.id, settings });
      }
      
      if (result.error) {
        throw result.error;
      }
      
      toast.success("Settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (category, name, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [name]: value
      }
    }));
  };

  return (
    <Layout>
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>
        
        {/* Notifications Section */}
        <div className="glass-card mb-8 p-6 rounded-xl">
          <div className="flex items-center mb-4">
            <Bell className="h-6 w-6 mr-2 text-primary" />
            <h2 className="text-xl font-semibold">Notifications</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Email Notifications</h3>
                <p className="text-sm text-light-100/60">Receive email updates about your account</p>
              </div>
              <Switch 
                checked={settings.notifications.emailNotifications}
                onCheckedChange={(checked) => updateSetting('notifications', 'emailNotifications', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Push Notifications</h3>
                <p className="text-sm text-light-100/60">Get notified when someone interacts with your music</p>
              </div>
              <Switch 
                checked={settings.notifications.pushNotifications}
                onCheckedChange={(checked) => updateSetting('notifications', 'pushNotifications', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Marketing Emails</h3>
                <p className="text-sm text-light-100/60">Receive updates about new features and offers</p>
              </div>
              <Switch 
                checked={settings.notifications.marketingEmails}
                onCheckedChange={(checked) => updateSetting('notifications', 'marketingEmails', checked)}
              />
            </div>
          </div>
        </div>
        
        {/* Audio Settings Section */}
        <div className="glass-card mb-8 p-6 rounded-xl">
          <div className="flex items-center mb-4">
            <Volume2 className="h-6 w-6 mr-2 text-primary" />
            <h2 className="text-xl font-semibold">Audio Settings</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Master Volume</h3>
                <span>{settings.audioSettings.masterVolume}%</span>
              </div>
              <Slider 
                value={[settings.audioSettings.masterVolume]} 
                onValueChange={([value]) => updateSetting('audioSettings', 'masterVolume', value)}
                max={100}
                step={1}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Auto-play</h3>
                <p className="text-sm text-light-100/60">Automatically play music when available</p>
              </div>
              <Switch 
                checked={settings.audioSettings.autoPlay}
                onCheckedChange={(checked) => updateSetting('audioSettings', 'autoPlay', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">High Quality Streaming</h3>
                <p className="text-sm text-light-100/60">Stream music at higher bitrates (uses more data)</p>
              </div>
              <Switch 
                checked={settings.audioSettings.highQualityStreaming}
                onCheckedChange={(checked) => updateSetting('audioSettings', 'highQualityStreaming', checked)}
              />
            </div>
          </div>
        </div>
        
        {/* Appearance Section */}
        <div className="glass-card mb-8 p-6 rounded-xl">
          <div className="flex items-center mb-4">
            {settings.appearance.darkMode ? 
              <Moon className="h-6 w-6 mr-2 text-primary" /> : 
              <Sun className="h-6 w-6 mr-2 text-primary" />
            }
            <h2 className="text-xl font-semibold">Appearance</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Dark Mode</h3>
                <p className="text-sm text-light-100/60">Toggle between dark and light theme</p>
              </div>
              <Switch 
                checked={settings.appearance.darkMode}
                onCheckedChange={(checked) => updateSetting('appearance', 'darkMode', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Compact View</h3>
                <p className="text-sm text-light-100/60">Display more items with less spacing</p>
              </div>
              <Switch 
                checked={settings.appearance.compactView}
                onCheckedChange={(checked) => updateSetting('appearance', 'compactView', checked)}
              />
            </div>
          </div>
        </div>
        
        {/* Privacy Section */}
        <div className="glass-card mb-8 p-6 rounded-xl">
          <div className="flex items-center mb-4">
            <Shield className="h-6 w-6 mr-2 text-primary" />
            <h2 className="text-xl font-semibold">Privacy</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Profile Visibility</h3>
                <p className="text-sm text-light-100/60">Control who can see your profile</p>
              </div>
              <select 
                className="bg-dark-200 border border-dark-100 rounded px-3 py-2"
                value={settings.privacy.profileVisibility}
                onChange={(e) => updateSetting('privacy', 'profileVisibility', e.target.value)}
              >
                <option value="public">Public</option>
                <option value="friends">Friends Only</option>
                <option value="private">Private</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Activity Tracking</h3>
                <p className="text-sm text-light-100/60">Allow us to track how you use the app</p>
              </div>
              <Switch 
                checked={settings.privacy.activityTracking}
                onCheckedChange={(checked) => updateSetting('privacy', 'activityTracking', checked)}
              />
            </div>
          </div>
        </div>
        
        {/* Advanced Section */}
        <div className="glass-card mb-8 p-6 rounded-xl">
          <div className="flex items-center mb-4">
            <Sliders className="h-6 w-6 mr-2 text-primary" />
            <h2 className="text-xl font-semibold">Advanced</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Clear Cache</h3>
                <p className="text-sm text-light-100/60">Remove downloaded content and temporary files</p>
              </div>
              <button 
                onClick={() => {
                  localStorage.clear();
                  toast.success("Cache cleared successfully");
                }}
                className="bg-dark-100 hover:bg-dark-50 text-white px-4 py-2 rounded transition-colors"
              >
                Clear
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Reset Settings</h3>
                <p className="text-sm text-light-100/60">Restore all settings to default values</p>
              </div>
              <button 
                onClick={() => {
                  setSettings(defaultSettings);
                  toast.success("Settings reset to defaults");
                }}
                className="bg-dark-100 hover:bg-dark-50 text-white px-4 py-2 rounded transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
        
        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={saveSettings}
            disabled={loading}
            className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary-light px-6 py-3 rounded-lg text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-t-transparent border-white rounded-full"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
