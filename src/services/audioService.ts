// Audio context singleton to ensure we use the same audio context throughout the app
let audioContext: AudioContext | null = null;

export const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

// Convert audio buffer to wav format for export
export const audioBufferToWav = (buffer: AudioBuffer): Blob => {
  // This is a simplified version - a real implementation would be more complex
  const numOfChannels = buffer.numberOfChannels;
  const length = buffer.length * numOfChannels * 2;
  const sampleRate = buffer.sampleRate;
  const data = new DataView(new ArrayBuffer(44 + length));

  // Write WAV header
  writeString(data, 0, 'RIFF');
  data.setUint32(4, 36 + length, true);
  writeString(data, 8, 'WAVE');
  writeString(data, 12, 'fmt ');
  data.setUint32(16, 16, true);
  data.setUint16(20, 1, true);
  data.setUint16(22, numOfChannels, true);
  data.setUint32(24, sampleRate, true);
  data.setUint32(28, sampleRate * numOfChannels * 2, true);
  data.setUint16(32, numOfChannels * 2, true);
  data.setUint16(34, 16, true);
  writeString(data, 36, 'data');
  data.setUint32(40, length, true);

  // Write interleaved audio data
  const offset = 44;
  const channelData = [];
  
  for (let i = 0; i < numOfChannels; i++) {
    channelData.push(buffer.getChannelData(i));
  }

  let pos = 0;
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numOfChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, channelData[ch][i]));
      data.setInt16(offset + pos, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      pos += 2;
    }
  }

  return new Blob([data], { type: 'audio/wav' });
};

// Helper function to write strings to a DataView
const writeString = (view: DataView, offset: number, string: string): void => {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
};

// Process audio based on mood and energy levels
export const processAudio = (
  vocalBuffer: AudioBuffer,
  instrumentalBuffer: AudioBuffer,
  mood: number, // -1 to 1: sad to happy
  energy: number // -1 to 1: chill to energetic
): Promise<AudioBuffer> => {
  return new Promise((resolve) => {
    const context = getAudioContext();
    
    // Create a new buffer for the output
    const outputBuffer = context.createBuffer(
      2,
      Math.max(vocalBuffer.length, instrumentalBuffer.length),
      context.sampleRate
    );
    
    // Mix the vocal and instrumental
    const vocalGain = 0.8 + (energy * 0.1); // Higher energy gives slightly louder vocals
    const instrumentalGain = 0.7 - (energy * 0.1); // Lower energy gives slightly louder instrumental
    
    // Apply basic processing - in a real app, this would be more sophisticated
    for (let channel = 0; channel < 2; channel++) {
      const outputData = outputBuffer.getChannelData(channel);
      const vocalData = channel < vocalBuffer.numberOfChannels ? vocalBuffer.getChannelData(channel) : vocalBuffer.getChannelData(0);
      const instrumentalData = channel < instrumentalBuffer.numberOfChannels ? instrumentalBuffer.getChannelData(channel) : instrumentalBuffer.getChannelData(0);
      
      for (let i = 0; i < outputData.length; i++) {
        // Mix vocal and instrumental
        if (i < vocalData.length) {
          outputData[i] += vocalData[i] * vocalGain;
        }
        
        if (i < instrumentalData.length) {
          outputData[i] += instrumentalData[i] * instrumentalGain;
        }
        
        // Apply some basic "effects" based on mood
        // Negative mood (sad) adds subtle echo by mixing in delayed samples
        if (mood < 0 && i > 5000) {
          const delayAmount = Math.abs(mood) * 0.2;
          outputData[i] += outputData[i - 5000] * delayAmount;
        }
      }
    }
    
    // Simulate processing time
    setTimeout(() => resolve(outputBuffer), 1000);
  });
};

// Convert Blob to AudioBuffer
export const blobToAudioBuffer = async (blob: Blob): Promise<AudioBuffer> => {
  const arrayBuffer = await blob.arrayBuffer();
  const context = getAudioContext();
  return await context.decodeAudioData(arrayBuffer);
};

// Play an AudioBuffer through the audio context
export const playAudioBuffer = (
  buffer: AudioBuffer, 
  onEnded?: () => void
): { 
  start: () => void; 
  stop: () => void;
  setPlaybackRate: (rate: number) => void;
  seek: (time: number) => void;
} => {
  const context = getAudioContext();
  const source = context.createBufferSource();
  source.buffer = buffer;
  source.connect(context.destination);
  
  let startedAt = 0;
  let pausedAt = 0;
  let isPlaying = false;
  
  if (onEnded) {
    source.onended = onEnded;
  }
  
  return {
    start: () => {
      try {
        if (pausedAt) {
          startedAt = context.currentTime - pausedAt;
          source.start(0, pausedAt);
        } else {
          startedAt = context.currentTime;
          source.start(0);
        }
        isPlaying = true;
      } catch (error) {
        console.error("Error starting audio playback:", error);
      }
    },
    stop: () => {
      try {
        source.stop();
        if (isPlaying) {
          pausedAt = context.currentTime - startedAt;
          isPlaying = false;
        }
      } catch (error) {
        console.error("Error stopping audio playback:", error);
      }
    },
    setPlaybackRate: (rate: number) => {
      try {
        source.playbackRate.value = rate;
      } catch (error) {
        console.error("Error setting playback rate:", error);
      }
    },
    seek: (time: number) => {
      try {
        pausedAt = time;
      } catch (error) {
        console.error("Error seeking:", error);
      }
    }
  };
};
