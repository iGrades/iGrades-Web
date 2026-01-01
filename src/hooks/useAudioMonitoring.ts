import { useEffect, useRef } from "react";

export const useAudioMonitoring = (
  reportInfraction: (type: "audio_anomaly", customMessage?: string) => void,
  audioStream: MediaStream | null, disabled: boolean
) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  const noiseSustainedCounter = useRef(0);
  const lastInfractionTime = useRef(0);

  useEffect(() => {
    // If the quiz is finished or in results mode, don't attach listeners
    if (disabled) return;
    
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      return; 
    }
    if (!audioStream) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    try {
      const source = audioContext.createMediaStreamSource(audioStream);
      const analyser = audioContext.createAnalyser();
      
      // Use a larger fftSize for better frequency resolution
      analyser.fftSize = 2048; 
      analyser.smoothingTimeConstant = 0.4; // Faster response to capture speech syllables
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      sourceRef.current = source;
      
      // TUNED FOR VOICES
      const VOICE_THRESHOLD = 40; // Decibel-based check (0-255 scale)
      const SUSTAINED_SPEECH_FRAMES = 45; // ~750ms of talking
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const detectNoise = () => {
        if (!analyserRef.current || audioContext.state === 'closed') return;

        analyserRef.current.getByteFrequencyData(dataArray); 
        
        /*  Only look at frequency bins 20 to 100 (Speech Range)
        This ignores low-end hums (AC/Fans) and high-end static. */
        let speechSum = 0;
        let speechSampleCount = 0;
        for (let i = 20; i < 100; i++) {
          speechSum += dataArray[i];
          speechSampleCount++;
        }
        const averageVoiceVolume = speechSum / speechSampleCount;

        if (averageVoiceVolume > VOICE_THRESHOLD) {
          noiseSustainedCounter.current++;

          if (noiseSustainedCounter.current > SUSTAINED_SPEECH_FRAMES) {
            const now = Date.now();
            if (now - lastInfractionTime.current > 10000) { // 10s cooldown
              setTimeout(() => {
                reportInfraction("audio_anomaly", "Sustained vocal activity or talking detected.");
              }, 0);
              lastInfractionTime.current = now;
              noiseSustainedCounter.current = 0;
            }
          }
        } else {
          // Decay slower so we don't reset between syllables in a sentence
          noiseSustainedCounter.current = Math.max(0, noiseSustainedCounter.current - 0.5);
        }

        animationFrameRef.current = requestAnimationFrame(detectNoise);
      };

      detectNoise();
    } catch (e) {
      console.error("Audio setup error:", e);
    }
    return () => {
       if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [audioStream, reportInfraction, disabled]); 
};