
import { useState } from "react";
import { Sliders, BarChart, Save, RefreshCw } from "lucide-react";
import Button from "./Button";

// Define MixSettings interface to be used across components
export interface MixSettings {
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
}

interface MixingConsoleProps {
  className?: string;
  settings: MixSettings;
  onSettingsChange: (settings: Partial<MixSettings>) => void;
  isPlaying?: boolean;
  onSaveMix?: () => void;
}

const MixingConsole = ({ 
  className = "", 
  settings, 
  onSettingsChange,
  isPlaying,
  onSaveMix 
}: MixingConsoleProps) => {
  const [isPending, setIsPending] = useState(false);

  const handleSettingChange = (
    setting: keyof MixSettings,
    value: number,
    category?: string,
    subcategory?: string
  ) => {
    if (category === "eq" && subcategory) {
      onSettingsChange({
        eq: {
          ...settings.eq,
          [subcategory]: value,
        }
      });
    } else {
      onSettingsChange({
        [setting]: value
      });
    }
  };

  const handleSaveMix = () => {
    setIsPending(true);
    
    // Simulate processing delay
    setTimeout(() => {
      onSaveMix?.();
      setIsPending(false);
    }, 1500);
  };

  const handleAIOptimize = () => {
    setIsPending(true);
    
    // Simulate AI optimization
    setTimeout(() => {
      onSettingsChange({
        reverb: 0.35,
        delay: 0.18,
        compression: 0.55,
        vocalVolume: 0.78,
        instrumentalVolume: 0.62,
        eq: {
          low: 2,
          mid: -2,
          high: 3,
        }
      });
      setIsPending(false);
    }, 2000);
  };

  return (
    <div className={`glass-card p-6 ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Sliders className="h-5 w-5" />
          Mixing Console
        </h3>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAIOptimize}
            isLoading={isPending}
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">AI Optimize</span>
          </Button>
          
          <Button
            variant="gradient"
            size="sm"
            onClick={handleSaveMix}
            isLoading={isPending}
            className="flex items-center gap-1"
          >
            <Save className="h-4 w-4" />
            <span className="hidden sm:inline">Save Mix</span>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Volume Controls */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-light-100/70 mb-2">Levels</h4>
          
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <label>Vocal Volume</label>
              <span>{Math.round(settings.vocalVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={settings.vocalVolume}
              onChange={(e) => handleSettingChange("vocalVolume", parseFloat(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <label>Instrumental Volume</label>
              <span>{Math.round(settings.instrumentalVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={settings.instrumentalVolume}
              onChange={(e) => handleSettingChange("instrumentalVolume", parseFloat(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
        </div>
        
        {/* Effects Controls */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-light-100/70 mb-2">Vocal Effects</h4>
          
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <label>Reverb</label>
              <span>{Math.round(settings.reverb * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={settings.reverb}
              onChange={(e) => handleSettingChange("reverb", parseFloat(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <label>Delay</label>
              <span>{Math.round(settings.delay * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={settings.delay}
              onChange={(e) => handleSettingChange("delay", parseFloat(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <label>Compression</label>
              <span>{Math.round(settings.compression * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={settings.compression}
              onChange={(e) => handleSettingChange("compression", parseFloat(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
        </div>
        
        {/* EQ Controls */}
        <div className="col-span-1 md:col-span-2">
          <h4 className="text-sm font-medium text-light-100/70 mb-3">Vocal EQ</h4>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <label>Low</label>
                <span>{settings.eq.low > 0 ? `+${settings.eq.low}` : settings.eq.low} dB</span>
              </div>
              <input
                type="range"
                min="-12"
                max="12"
                value={settings.eq.low}
                onChange={(e) => handleSettingChange("eq", parseInt(e.target.value), "eq", "low")}
                className="w-full accent-primary"
              />
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <label>Mid</label>
                <span>{settings.eq.mid > 0 ? `+${settings.eq.mid}` : settings.eq.mid} dB</span>
              </div>
              <input
                type="range"
                min="-12"
                max="12"
                value={settings.eq.mid}
                onChange={(e) => handleSettingChange("eq", parseInt(e.target.value), "eq", "mid")}
                className="w-full accent-primary"
              />
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <label>High</label>
                <span>{settings.eq.high > 0 ? `+${settings.eq.high}` : settings.eq.high} dB</span>
              </div>
              <input
                type="range"
                min="-12"
                max="12"
                value={settings.eq.high}
                onChange={(e) => handleSettingChange("eq", parseInt(e.target.value), "eq", "high")}
                className="w-full accent-primary"
              />
            </div>
          </div>
          
          {/* Simplified EQ visualization */}
          <div className="mt-2 h-16 bg-dark-300 rounded-lg p-2 flex items-end justify-between">
            {[...Array(15)].map((_, i) => {
              // Calculate bar height based on EQ settings
              let height = 50; // Default middle height
              
              if (i < 5) {
                // Low range
                height = 50 + settings.eq.low * 2;
              } else if (i < 10) {
                // Mid range
                height = 50 + settings.eq.mid * 2;
              } else {
                // High range
                height = 50 + settings.eq.high * 2;
              }
              
              return (
                <div 
                  key={i}
                  className="bg-primary rounded-t w-[4%]"
                  style={{ height: `${height}%` }}
                ></div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MixingConsole;
