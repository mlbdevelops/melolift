
import { useState, useEffect } from "react";
import { Bell, Volume2, Moon, Sun, Globe, Shield, Sliders, Save } from "lucide-react";
import { toast } from "sonner";
import Layout from "../components/Layout";
import Button from "../components/Button";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface UserSettings {
  notifications: {
    emailUpdates: boolean;
    projectReminders: boolean;
    marketingEmails: boolean;
  };
  audioSettings: {
    sampleRate: string;
    bitDepth: string;
    autoNormalize: boolean;
    defaultFormat: string;
  };
  appearance: {
    theme: string;
    reducedMotion: boolean;
    highContrast: boolean;
  };
  privacy: {
    profileVisibility: string;
    dataCollection: boolean;
    thirdPartySharing: boolean;
  };
}

// Default settings
const defaultSettings: UserSettings = {
  notifications: {
    emailUpdates: true,
    projectReminders: false,
    marketingEmails: false,
  },
  audioSettings: {
    sampleRate: "44.1kHz",
    bitDepth: "24-bit",
    autoNormalize: true,
    defaultFormat: "WAV",
  },
  appearance: {
    theme: "dark",
    reducedMotion: false,
    highContrast: false,
  },
  privacy: {
    profileVisibility: "public",
    dataCollection: true,
    thirdPartySharing: false,
  }
};

const Settings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [activeTab, setActiveTab] = useState("notifications");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  
  useEffect(() => {
    if (user) {
      fetchUserSettings();
    } else {
      setLoading(false);
    }
  }, [user]);
  
  const fetchUserSettings = async () => {
    try {
      // In a real app, this would fetch from the database
      // For now, we'll simulate a delay and use default settings
      await new Promise(resolve => setTimeout(resolve, 500));
      setSettings(defaultSettings);
    } catch (error) {
      console.error("Error fetching user settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };
  
  const handleNotificationChange = (setting: keyof typeof settings.notifications) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [setting]: !prev.notifications[setting]
      }
    }));
    setUnsavedChanges(true);
  };
  
  const handleAudioSettingChange = (setting: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      audioSettings: {
        ...prev.audioSettings,
        [setting]: value
      }
    }));
    setUnsavedChanges(true);
  };
  
  const handleAppearanceChange = (setting: keyof typeof settings.appearance, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        [setting]: typeof value === 'boolean' ? value : value
      }
    }));
    setUnsavedChanges(true);
  };
  
  const handlePrivacyChange = (setting: keyof typeof settings.privacy, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [setting]: value
      }
    }));
    setUnsavedChanges(true);
  };
  
  const saveSettings = async () => {
    if (!user) {
      toast.error("You must be logged in to save settings");
      return;
    }
    
    setSaving(true);
    
    try {
      // In a real app, this would save to the database
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // In a real app, you would update user settings in your database
      // For example:
      /*
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          settings: settings,
          updated_at: new Date().toISOString()
        });
        
      if (error) throw error;
      */
      
      toast.success("Settings saved successfully");
      setUnsavedChanges(false);
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-t-2 border-primary rounded-full"></div>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
          
          {unsavedChanges && (
            <Button 
              variant="gradient" 
              onClick={saveSettings}
              isLoading={saving}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left sidebar - menu */}
          <div className="glass-card p-6">
            <nav className="space-y-1">
              <button 
                onClick={() => setActiveTab("notifications")}
                className={`flex w-full items-center gap-2 p-3 rounded-lg ${
                  activeTab === "notifications" 
                    ? "bg-primary/10 text-primary" 
                    : "hover:bg-white/5 text-light-100/70 hover:text-light-100 transition-colors"
                }`}
              >
                <Bell className="h-5 w-5" />
                <span>Notifications</span>
              </button>
              
              <button 
                onClick={() => setActiveTab("audio")}
                className={`flex w-full items-center gap-2 p-3 rounded-lg ${
                  activeTab === "audio" 
                    ? "bg-primary/10 text-primary" 
                    : "hover:bg-white/5 text-light-100/70 hover:text-light-100 transition-colors"
                }`}
              >
                <Volume2 className="h-5 w-5" />
                <span>Audio Settings</span>
              </button>
              
              <button 
                onClick={() => setActiveTab("appearance")}
                className={`flex w-full items-center gap-2 p-3 rounded-lg ${
                  activeTab === "appearance" 
                    ? "bg-primary/10 text-primary" 
                    : "hover:bg-white/5 text-light-100/70 hover:text-light-100 transition-colors"
                }`}
              >
                <Moon className="h-5 w-5" />
                <span>Appearance</span>
              </button>
              
              <button 
                onClick={() => setActiveTab("privacy")}
                className={`flex w-full items-center gap-2 p-3 rounded-lg ${
                  activeTab === "privacy" 
                    ? "bg-primary/10 text-primary" 
                    : "hover:bg-white/5 text-light-100/70 hover:text-light-100 transition-colors"
                }`}
              >
                <Shield className="h-5 w-5" />
                <span>Privacy</span>
              </button>
              
              <button 
                onClick={() => setActiveTab("advanced")}
                className={`flex w-full items-center gap-2 p-3 rounded-lg ${
                  activeTab === "advanced" 
                    ? "bg-primary/10 text-primary" 
                    : "hover:bg-white/5 text-light-100/70 hover:text-light-100 transition-colors"
                }`}
              >
                <Sliders className="h-5 w-5" />
                <span>Advanced</span>
              </button>
            </nav>
          </div>
          
          {/* Main content area */}
          <div className="md:col-span-2 space-y-8">
            {/* Notifications */}
            {activeTab === "notifications" && (
              <section className="glass-card p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Bell className="h-6 w-6 text-primary" />
                  <h2 className="text-xl font-semibold">Notifications</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Email Updates</h3>
                      <p className="text-sm text-light-100/60">Receive updates about your projects</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={settings.notifications.emailUpdates}
                        onChange={() => handleNotificationChange('emailUpdates')}
                      />
                      <div className="w-11 h-6 bg-dark-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Project Reminders</h3>
                      <p className="text-sm text-light-100/60">Get reminded about unfinished projects</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={settings.notifications.projectReminders}
                        onChange={() => handleNotificationChange('projectReminders')}
                      />
                      <div className="w-11 h-6 bg-dark-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Marketing Emails</h3>
                      <p className="text-sm text-light-100/60">Receive promotional content and offers</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={settings.notifications.marketingEmails}
                        onChange={() => handleNotificationChange('marketingEmails')}
                      />
                      <div className="w-11 h-6 bg-dark-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </section>
            )}
            
            {/* Audio Settings */}
            {activeTab === "audio" && (
              <section className="glass-card p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Volume2 className="h-6 w-6 text-primary" />
                  <h2 className="text-xl font-semibold">Audio Settings</h2>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-2">Sample Rate</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {["44.1kHz", "48kHz", "96kHz"].map(rate => (
                        <button
                          key={rate}
                          className={`py-2 px-4 border rounded-md text-sm transition-colors ${
                            settings.audioSettings.sampleRate === rate
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-white/10 bg-dark-300 text-light-100/70 hover:bg-dark-400"
                          }`}
                          onClick={() => handleAudioSettingChange("sampleRate", rate)}
                        >
                          {rate}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Bit Depth</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {["16-bit", "24-bit", "32-bit"].map(depth => (
                        <button
                          key={depth}
                          className={`py-2 px-4 border rounded-md text-sm transition-colors ${
                            settings.audioSettings.bitDepth === depth
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-white/10 bg-dark-300 text-light-100/70 hover:bg-dark-400"
                          }`}
                          onClick={() => handleAudioSettingChange("bitDepth", depth)}
                        >
                          {depth}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Export Format</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {["WAV", "MP3", "FLAC"].map(format => (
                        <button
                          key={format}
                          className={`py-2 px-4 border rounded-md text-sm transition-colors ${
                            settings.audioSettings.defaultFormat === format
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-white/10 bg-dark-300 text-light-100/70 hover:bg-dark-400"
                          }`}
                          onClick={() => handleAudioSettingChange("defaultFormat", format)}
                        >
                          {format}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Auto-Normalize Audio</h3>
                      <p className="text-sm text-light-100/60">Automatically adjust volume levels when exporting</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={settings.audioSettings.autoNormalize}
                        onChange={() => handleAudioSettingChange("autoNormalize", !settings.audioSettings.autoNormalize)}
                      />
                      <div className="w-11 h-6 bg-dark-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </section>
            )}
            
            {/* Appearance */}
            {activeTab === "appearance" && (
              <section className="glass-card p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Moon className="h-6 w-6 text-primary" />
                  <h2 className="text-xl font-semibold">Appearance</h2>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-3">Theme</h3>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        className={`flex flex-col items-center p-4 border rounded-md transition-colors ${
                          settings.appearance.theme === "light"
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-white/10 bg-dark-300 text-light-100/70 hover:bg-dark-400"
                        }`}
                        onClick={() => handleAppearanceChange("theme", "light")}
                      >
                        <Sun className="h-6 w-6 mb-2" />
                        <span className="text-sm">Light</span>
                      </button>
                      
                      <button
                        className={`flex flex-col items-center p-4 border rounded-md transition-colors ${
                          settings.appearance.theme === "dark"
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-white/10 bg-dark-300 text-light-100/70 hover:bg-dark-400"
                        }`}
                        onClick={() => handleAppearanceChange("theme", "dark")}
                      >
                        <Moon className="h-6 w-6 mb-2" />
                        <span className="text-sm">Dark</span>
                      </button>
                      
                      <button
                        className={`flex flex-col items-center p-4 border rounded-md transition-colors ${
                          settings.appearance.theme === "system"
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-white/10 bg-dark-300 text-light-100/70 hover:bg-dark-400"
                        }`}
                        onClick={() => handleAppearanceChange("theme", "system")}
                      >
                        <Globe className="h-6 w-6 mb-2" />
                        <span className="text-sm">System</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Reduced Motion</h3>
                      <p className="text-sm text-light-100/60">Minimize animations throughout the app</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={settings.appearance.reducedMotion}
                        onChange={() => handleAppearanceChange("reducedMotion", !settings.appearance.reducedMotion)}
                      />
                      <div className="w-11 h-6 bg-dark-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">High Contrast</h3>
                      <p className="text-sm text-light-100/60">Increase contrast for better visibility</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={settings.appearance.highContrast}
                        onChange={() => handleAppearanceChange("highContrast", !settings.appearance.highContrast)}
                      />
                      <div className="w-11 h-6 bg-dark-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </section>
            )}
            
            {/* Privacy */}
            {activeTab === "privacy" && (
              <section className="glass-card p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Shield className="h-6 w-6 text-primary" />
                  <h2 className="text-xl font-semibold">Privacy</h2>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-2">Profile Visibility</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {["public", "friends", "private"].map(visibility => (
                        <button
                          key={visibility}
                          className={`py-2 px-4 border rounded-md text-sm capitalize transition-colors ${
                            settings.privacy.profileVisibility === visibility
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-white/10 bg-dark-300 text-light-100/70 hover:bg-dark-400"
                          }`}
                          onClick={() => handlePrivacyChange("profileVisibility", visibility)}
                        >
                          {visibility}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Data Collection</h3>
                      <p className="text-sm text-light-100/60">Allow app to collect usage data to improve features</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={settings.privacy.dataCollection}
                        onChange={() => handlePrivacyChange("dataCollection", !settings.privacy.dataCollection)}
                      />
                      <div className="w-11 h-6 bg-dark-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Third-Party Sharing</h3>
                      <p className="text-sm text-light-100/60">Allow sharing anonymized data with partners</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={settings.privacy.thirdPartySharing}
                        onChange={() => handlePrivacyChange("thirdPartySharing", !settings.privacy.thirdPartySharing)}
                      />
                      <div className="w-11 h-6 bg-dark-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  
                  <div className="pt-4">
                    <Button variant="outline" className="text-destructive border-destructive/20 hover:bg-destructive/10">
                      Delete All My Data
                    </Button>
                  </div>
                </div>
              </section>
            )}
            
            {/* Advanced Settings */}
            {activeTab === "advanced" && (
              <section className="glass-card p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Sliders className="h-6 w-6 text-primary" />
                  <h2 className="text-xl font-semibold">Advanced Settings</h2>
                </div>
                
                <div className="space-y-4">
                  <p className="text-light-100/70">
                    Advanced settings are for experienced users who need finer control over the application.
                    Changes to these settings may affect application performance.
                  </p>
                  
                  <div className="p-4 bg-dark-300 rounded-lg">
                    <h3 className="font-medium mb-2">Processing Settings</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-light-100/70">Processing Threads</label>
                        <select className="w-full mt-1 bg-dark-400 border border-white/10 rounded-lg px-3 py-2">
                          <option value="auto">Auto (Recommended)</option>
                          <option value="1">1 Thread</option>
                          <option value="2">2 Threads</option>
                          <option value="4">4 Threads</option>
                          <option value="8">8 Threads</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="text-sm text-light-100/70">Buffer Size</label>
                        <select className="w-full mt-1 bg-dark-400 border border-white/10 rounded-lg px-3 py-2">
                          <option value="256">256 (Low Latency)</option>
                          <option value="512">512</option>
                          <option value="1024" selected>1024 (Default)</option>
                          <option value="2048">2048 (Better Performance)</option>
                          <option value="4096">4096 (Best Performance)</option>
                        </select>
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div>
                          <h3 className="font-medium">Use GPU Acceleration</h3>
                          <p className="text-xs text-light-100/60">Use GPU for audio processing when available</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            defaultChecked={true}
                          />
                          <div className="w-11 h-6 bg-dark-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-dark-300 rounded-lg">
                    <h3 className="font-medium mb-2">Data Management</h3>
                    
                    <div className="space-y-4">
                      <Button variant="outline" className="w-full sm:w-auto">
                        Clear Cache
                      </Button>
                      
                      <div>
                        <p className="text-sm text-light-100/70 mb-2">Storage Usage</p>
                        <div className="w-full bg-dark-400 rounded-full h-2.5">
                          <div className="bg-primary h-2.5 rounded-full" style={{ width: '25%' }}></div>
                        </div>
                        <p className="text-xs text-light-100/60 mt-1">250MB of 1GB used</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}
            
            {/* Save Button */}
            <div className="flex justify-end">
              <Button 
                variant="gradient" 
                size="lg"
                onClick={saveSettings}
                isLoading={saving}
                disabled={!unsavedChanges}
              >
                Save Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
