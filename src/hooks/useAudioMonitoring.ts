// useAudioMonitoring.ts 
import { useEffect, useRef } from "react";

export const useAudioMonitoring = (
  reportInfraction: (type: "audio_anomaly", customMessage?: string) => void,
  audioStream: MediaStream | null
) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!audioStream) {
      console.log('No audio stream provided');
      return;
    }

    if (audioStream.getAudioTracks().length === 0) {
      console.log('No audio tracks in stream - check mic permission/hardware');
      return;
    }

    const audioContext = new AudioContext();
    audioContext.resume().then(() => console.log('AudioContext resumed'));

    try {
      const source = audioContext.createMediaStreamSource(audioStream);
      const analyser = audioContext.createAnalyser();
      
      analyser.fftSize = 512;
      analyser.minDecibels = -90;
      analyser.maxDecibels = -10;
      analyser.smoothingTimeConstant = 0.8;

      // Connection setup
      source.connect(analyser);
      // we are not connecting analyser to audioContext.destination to prevent feedback.

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      sourceRef.current = source;
      
      let lastNoiseTime = 0;
      // low, easily-triggered threshold
      const DETECTION_THRESHOLD = 0.25; 
      const GRACE_PERIOD_MS = 1000; 
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const detectNoise = () => {
        const currentAnalyser = analyserRef.current;
        if (!currentAnalyser) return;

        currentAnalyser.getByteFrequencyData(dataArray); 
        
        // Find the peak value and normalize it to a 0-1 scale
        let maxAmplitude = 0;
        for (let i = 0; i < dataArray.length; i++) {
          if (dataArray[i] > maxAmplitude) {
            maxAmplitude = dataArray[i];
          }
        }
        const volume = maxAmplitude / 255; 

        if (volume > DETECTION_THRESHOLD) {
          if (!lastNoiseTime) lastNoiseTime = Date.now();
          
          if (Date.now() - lastNoiseTime > GRACE_PERIOD_MS) {
            // console.log("INFRACTION REPORTED!");
            reportInfraction("audio_anomaly", `Unusual audio detected (volume: ${volume.toFixed(2)}). Possible external noise or talking.`);

            lastNoiseTime = Date.now() + 10000; // Do not allow reporting for 10s
          }
        } else {
          // Only reset if noise time is in the past (not on cooldown)
          if (lastNoiseTime < Date.now()) {
              lastNoiseTime = 0; 
          }
        }

        animationFrameRef.current = requestAnimationFrame(detectNoise);
      };

      detectNoise();
    } catch (e) {
      console.error("Error setting up audio monitoring:", e);
      // Clean up if setup fails
      if (audioContext) audioContext.close();
      return;
    }

    return () => {
      // Cleanup all resources
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (sourceRef.current) sourceRef.current.disconnect();
      if (analyserRef.current) analyserRef.current.disconnect(); 
      if (audioContextRef.current) audioContextRef.current.close().then(() => console.log('AudioContext closed'));
    };
  }, [audioStream, reportInfraction]);
};