
import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { blobToAudioBuffer, processAudio } from '../services/audioService';

interface AudioContextType {
  vocalAudioBlob: Blob | null;
  instrumentalAudioBlob: Blob | null;
  processedAudioBuffer: AudioBuffer | null;
  isProcessing: boolean;
  mood: number;
  energy: number;
  setVocalAudioBlob: (blob: Blob) => void;
  setInstrumentalAudioBlob: (blob: Blob) => void;
  setMood: (value: number) => void;
  setEnergy: (value: number) => void;
  processAudioFiles: () => Promise<void>;
  resetAudio: () => void;
}

const defaultContext: AudioContextType = {
  vocalAudioBlob: null,
  instrumentalAudioBlob: null,
  processedAudioBuffer: null,
  isProcessing: false,
  mood: 0,
  energy: 0,
  setVocalAudioBlob: () => {},
  setInstrumentalAudioBlob: () => {},
  setMood: () => {},
  setEnergy: () => {},
  processAudioFiles: async () => {},
  resetAudio: () => {},
};

const AudioContext = createContext<AudioContextType>(defaultContext);

export const useAudio = () => useContext(AudioContext);

export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [vocalAudioBlob, setVocalAudioBlob] = useState<Blob | null>(null);
  const [instrumentalAudioBlob, setInstrumentalAudioBlob] = useState<Blob | null>(null);
  const [processedAudioBuffer, setProcessedAudioBuffer] = useState<AudioBuffer | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mood, setMood] = useState(0);
  const [energy, setEnergy] = useState(0);
  
  const vocalBufferRef = useRef<AudioBuffer | null>(null);
  const instrumentalBufferRef = useRef<AudioBuffer | null>(null);

  // Convert blobs to audio buffers when they change
  useEffect(() => {
    const loadVocal = async () => {
      if (vocalAudioBlob) {
        try {
          const buffer = await blobToAudioBuffer(vocalAudioBlob);
          vocalBufferRef.current = buffer;
        } catch (error) {
          console.error("Error loading vocal audio:", error);
        }
      } else {
        vocalBufferRef.current = null;
      }
    };
    
    loadVocal();
  }, [vocalAudioBlob]);
  
  useEffect(() => {
    const loadInstrumental = async () => {
      if (instrumentalAudioBlob) {
        try {
          const buffer = await blobToAudioBuffer(instrumentalAudioBlob);
          instrumentalBufferRef.current = buffer;
        } catch (error) {
          console.error("Error loading instrumental audio:", error);
        }
      } else {
        instrumentalBufferRef.current = null;
      }
    };
    
    loadInstrumental();
  }, [instrumentalAudioBlob]);

  const processAudioFiles = async () => {
    if (!vocalBufferRef.current || !instrumentalBufferRef.current) {
      console.error("Missing vocal or instrumental audio for processing");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const result = await processAudio(
        vocalBufferRef.current,
        instrumentalBufferRef.current,
        mood,
        energy
      );
      
      setProcessedAudioBuffer(result);
    } catch (error) {
      console.error("Error processing audio:", error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const resetAudio = () => {
    setVocalAudioBlob(null);
    setInstrumentalAudioBlob(null);
    setProcessedAudioBuffer(null);
    vocalBufferRef.current = null;
    instrumentalBufferRef.current = null;
  };

  return (
    <AudioContext.Provider
      value={{
        vocalAudioBlob,
        instrumentalAudioBlob,
        processedAudioBuffer,
        isProcessing,
        mood,
        energy,
        setVocalAudioBlob,
        setInstrumentalAudioBlob,
        setMood,
        setEnergy,
        processAudioFiles,
        resetAudio,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};
