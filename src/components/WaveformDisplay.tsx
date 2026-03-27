import { useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';

interface WaveformDisplayProps {
  audioPath: string;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  isDarkMode: boolean;
}

export function WaveformDisplay({ audioPath, currentTime, duration, onSeek, isDarkMode }: WaveformDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: isDarkMode ? '#4b5563' : '#cbd5e1', // gray-600 / gray-300
      progressColor: '#3b82f6', // blue-500
      cursorColor: isDarkMode ? '#ffffff' : '#111827',
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      height: 48,
      normalize: true,
      interact: true,
    });

    ws.load(audioPath);

    ws.on('interaction', (newTime) => {
      onSeek(newTime);
    });

    wavesurferRef.current = ws;

    return () => {
      ws.destroy();
    };
  }, [audioPath, isDarkMode, onSeek]);

  // Sync external currentTime to wavesurfer (but avoid loopback issues)
  useEffect(() => {
    if (wavesurferRef.current && duration > 0) {
      // Only seek if the difference is more than a tiny threshold to prevent stuttering
      const wsTime = wavesurferRef.current.getCurrentTime();
      if (Math.abs(wsTime - currentTime) > 0.1) {
        wavesurferRef.current.seekTo(currentTime / duration);
      }
    }
  }, [currentTime, duration]);

  return (
    <div className={`w-full border-t px-6 py-2 shrink-0 z-20 shadow-[0_-5px_15px_rgba(0,0,0,0.05)] ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
      <div ref={containerRef} className="w-full h-12" />
    </div>
  );
}
