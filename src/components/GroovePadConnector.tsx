
import { useEffect } from 'react';
import { useAudio } from '../contexts/AudioContext';
import GroovePad from './GroovePad';

interface GroovePadConnectorProps {
  label?: string;
  className?: string;
}

const GroovePadConnector = ({ label, className }: GroovePadConnectorProps) => {
  const { mood, energy, setMood, setEnergy } = useAudio();
  
  const handleChange = (x: number, y: number) => {
    // Convert from the pad's 0-100 range to -1 to 1
    const moodValue = (x / 50) - 1; // 0 -> -1, 100 -> 1
    const energyValue = (y / 50) - 1; // 0 -> -1, 100 -> 1
    
    setMood(moodValue);
    setEnergy(energyValue);
  };
  
  useEffect(() => {
    // Initialize the pad with the current values from context
    const initialX = (mood + 1) * 50; // -1 -> 0, 1 -> 100
    const initialY = (energy + 1) * 50; // -1 -> 0, 1 -> 100
    
    handleChange(initialX, initialY);
  }, []);
  
  return (
    <GroovePad 
      label={label || "Adjust Mood & Energy"} 
      onChange={(x, y) => handleChange(x, y)}
      className={className}
    />
  );
};

export default GroovePadConnector;
