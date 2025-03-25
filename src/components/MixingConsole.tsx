
import { useState } from "react";
import { Sliders, BarChart, Save, RefreshCw } from "lucide-react";
import Button from "./Button";

interface MixingConsoleProps {
  className?: string;
  onSaveMix?: (settings: MixSettings) => void;
}

interface MixSettings {
  vocalVolume: number;
  instrumentalVolume: number;
  vocalReverb: number;
  vocalDelay: number;
  vocalCompression: number;
  vocalEQ: {
    low: number;
    mid: number;
    high: number;
  };
  harmonies: number;
}

const MixingConsole = ({ className = "", onSaveMix }: MixingConsoleProps) => {
  const [settings, setSettings] = useState<MixSettings>({
    vocalVolume: 75,
    instrumentalVolume: 65,
    vocalReverb: 30,
    vocalDelay: 15,
    vocalCompression: 50,
    vocalEQ: {
      low: 0,
      mid: 0,
      high: 5,
    },
    harmonies: 40,
  });

  const [isPending, setIsPending] = useState(false);

  const handleSettingChange = (
    setting: string,
    value: number,
    category?: string,
    subcategory?: string
  ) => {
    if (category === "vocalEQ") {
      setSettings({
        ...settings,
        vocalEQ: {
          ...settings.vocalEQ,
          [subcategory as string]: value,
        },
      });
    } else {
      setSettings({
        ...settings,
        [setting]: value,
      });
    }
  };

  const handleSaveMix = () => {
    setIsPending(true);
    
    // Simulate processing delay
    setTimeout(() => {
      onSaveMix?.(settings);
      setIsPending(false);
    }, 1500);
  };

  const handleAIOptimize = () => {
    setIsPending(true);
    
    // Simulate AI optimization
    setTimeout(() => {
      setSettings({
        vocalVolume: 78,
        instrumentalVolume: 62,
        vocalReverb: 35,
        vocalDelay: 18,
        vocalCompression: 55,
        vocalEQ: {
          low: 2,
          mid: -2,
          high: 3,
        },
        harmonies: 45,
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
              <span>{settings.vocalVolume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.vocalVolume}
              onChange={(e) => handleSettingChange("vocalVolume", parseInt(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <label>Instrumental Volume</label>
              <span>{settings.instrumentalVolume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.instrumentalVolume}
              onChange={(e) => handleSettingChange("instrumentalVolume", parseInt(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <label>Harmonies</label>
              <span>{settings.harmonies}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.harmonies}
              onChange={(e) => handleSettingChange("harmonies", parseInt(e.target.value))}
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
              <span>{settings.vocalReverb}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.vocalReverb}
              onChange={(e) => handleSettingChange("vocalReverb", parseInt(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <label>Delay</label>
              <span>{settings.vocalDelay}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.vocalDelay}
              onChange={(e) => handleSettingChange("vocalDelay", parseInt(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <label>Compression</label>
              <span>{settings.vocalCompression}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.vocalCompression}
              onChange={(e) => handleSettingChange("vocalCompression", parseInt(e.target.value))}
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
                <span>{settings.vocalEQ.low > 0 ? `+${settings.vocalEQ.low}` : settings.vocalEQ.low} dB</span>
              </div>
              <input
                type="range"
                min="-12"
                max="12"
                value={settings.vocalEQ.low}
                onChange={(e) => handleSettingChange("vocalEQ", parseInt(e.target.value), "vocalEQ", "low")}
                className="w-full accent-primary"
              />
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <label>Mid</label>
                <span>{settings.vocalEQ.mid > 0 ? `+${settings.vocalEQ.mid}` : settings.vocalEQ.mid} dB</span>
              </div>
              <input
                type="range"
                min="-12"
                max="12"
                value={settings.vocalEQ.mid}
                onChange={(e) => handleSettingChange("vocalEQ", parseInt(e.target.value), "vocalEQ", "mid")}
                className="w-full accent-primary"
              />
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <label>High</label>
                <span>{settings.vocalEQ.high > 0 ? `+${settings.vocalEQ.high}` : settings.vocalEQ.high} dB</span>
              </div>
              <input
                type="range"
                min="-12"
                max="12"
                value={settings.vocalEQ.high}
                onChange={(e) => handleSettingChange("vocalEQ", parseInt(e.target.value), "vocalEQ", "high")}
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
                height = 50 + settings.vocalEQ.low * 2;
              } else if (i < 10) {
                // Mid range
                height = 50 + settings.vocalEQ.mid * 2;
              } else {
                // High range
                height = 50 + settings.vocalEQ.high * 2;
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
