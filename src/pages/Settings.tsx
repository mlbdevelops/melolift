
import { useState } from "react";
import { Bell, Volume2, Moon, Sun, Globe, Shield, Sliders } from "lucide-react";
import Layout from "../components/Layout";
import Button from "../components/Button";

const Settings = () => {
  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    projectReminders: false,
    marketingEmails: false,
  });

  const [audioSettings, setAudioSettings] = useState({
    sampleRate: "44.1kHz",
    bitDepth: "24-bit",
    autoNormalize: true,
    defaultFormat: "WAV",
  });

  const [appearance, setAppearance] = useState({
    theme: "dark",
    reducedMotion: false,
    highContrast: false,
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: "public",
    dataCollection: true,
    thirdPartySharing: false,
  });

  const handleNotificationChange = (setting: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleAudioSettingChange = (setting: string, value: string | boolean) => {
    setAudioSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleAppearanceChange = (setting: keyof typeof appearance, value: string | boolean) => {
    setAppearance(prev => ({
      ...prev,
      [setting]: typeof value === 'boolean' ? value : value
    }));
  };

  const handlePrivacyChange = (setting: keyof typeof privacy, value: string | boolean) => {
    setPrivacy(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left sidebar - menu */}
          <div className="glass-card p-6">
            <nav className="space-y-1">
              <a href="#notifications" className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 text-primary">
                <Bell className="h-5 w-5" />
                <span>Notifications</span>
              </a>
              <a href="#audio" className="flex items-center gap-2 p-3 rounded-lg hover:bg-white/5 text-light-100/70 hover:text-light-100 transition-colors">
                <Volume2 className="h-5 w-5" />
                <span>Audio Settings</span>
              </a>
              <a href="#appearance" className="flex items-center gap-2 p-3 rounded-lg hover:bg-white/5 text-light-100/70 hover:text-light-100 transition-colors">
                <Moon className="h-5 w-5" />
                <span>Appearance</span>
              </a>
              <a href="#privacy" className="flex items-center gap-2 p-3 rounded-lg hover:bg-white/5 text-light-100/70 hover:text-light-100 transition-colors">
                <Shield className="h-5 w-5" />
                <span>Privacy</span>
              </a>
              <a href="#advanced" className="flex items-center gap-2 p-3 rounded-lg hover:bg-white/5 text-light-100/70 hover:text-light-100 transition-colors">
                <Sliders className="h-5 w-5" />
                <span>Advanced</span>
              </a>
            </nav>
          </div>
          
          {/* Main content area */}
          <div className="md:col-span-2 space-y-8">
            {/* Notifications */}
            <section id="notifications" className="glass-card p-6">
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
                      checked={notifications.emailUpdates}
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
                      checked={notifications.projectReminders}
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
                      checked={notifications.marketingEmails}
                      onChange={() => handleNotificationChange('marketingEmails')}
                    />
                    <div className="w-11 h-6 bg-dark-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </section>
            
            {/* Audio Settings */}
            <section id="audio" className="glass-card p-6">
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
                          audioSettings.sampleRate === rate
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
                          audioSettings.bitDepth === depth
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
                          audioSettings.defaultFormat === format
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
                      checked={audioSettings.autoNormalize}
                      onChange={() => handleAudioSettingChange("autoNormalize", !audioSettings.autoNormalize)}
                    />
                    <div className="w-11 h-6 bg-dark-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </section>
            
            {/* Appearance */}
            <section id="appearance" className="glass-card p-6">
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
                        appearance.theme === "light"
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
                        appearance.theme === "dark"
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
                        appearance.theme === "system"
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
                      checked={appearance.reducedMotion}
                      onChange={() => handleAppearanceChange("reducedMotion", !appearance.reducedMotion)}
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
                      checked={appearance.highContrast}
                      onChange={() => handleAppearanceChange("highContrast", !appearance.highContrast)}
                    />
                    <div className="w-11 h-6 bg-dark-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </section>
            
            {/* Privacy */}
            <section id="privacy" className="glass-card p-6">
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
                          privacy.profileVisibility === visibility
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
                      checked={privacy.dataCollection}
                      onChange={() => handlePrivacyChange("dataCollection", !privacy.dataCollection)}
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
                      checked={privacy.thirdPartySharing}
                      onChange={() => handlePrivacyChange("thirdPartySharing", !privacy.thirdPartySharing)}
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
            
            {/* Save Button */}
            <div className="flex justify-end">
              <Button variant="gradient" size="lg">
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
