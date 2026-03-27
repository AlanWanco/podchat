import { Play, Pause, SquareSquare, RotateCcw, Volume1, Repeat, Settings2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js';
import { ZoomIn, ZoomOut } from 'lucide-react';

interface PlayerControlsProps {
  audioPath: string;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  loop: boolean;
  playbackRate: number;
  onPlayPause: () => void;
  onReset: () => void;
  onSeek: (time: number) => void;
  onLoopChange: (loop: boolean) => void;
  onRateChange: (rate: number) => void;
  isDarkMode: boolean;
  editingSub?: { id: string, start: number, end: number, text: string } | null;
  onEditingSubChange?: (start: number, end: number) => void;
}

export function PlayerControls({ 
  audioPath,
  audioRef,
  currentTime, 
  duration, 
  isPlaying, 
  loop,
  playbackRate,
  onPlayPause, 
  onReset, 
  onSeek,
  onLoopChange,
  onRateChange,
  isDarkMode,
  editingSub,
  onEditingSubChange
}: PlayerControlsProps) {
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const speedMenuRef = useRef<HTMLDivElement>(null);
  
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const wsRegions = useRef<any>(null);
  
  const [volume, setVolume] = useState(0.8);
  const [zoomLevel, setZoomLevel] = useState(50);
  const [minZoom, setMinZoom] = useState(10);

  // Initialize WaveSurfer
  useEffect(() => {
    if (!waveformRef.current) return;
    if (!audioRef?.current) return;

    wavesurfer.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: isDarkMode ? '#4b5563' : '#cbd5e1',
      progressColor: '#3b82f6',
      cursorColor: isDarkMode ? '#ffffff' : '#111827',
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      height: 48,
      normalize: true,
      media: audioRef.current,
      minPxPerSec: zoomLevel,
    });

    // Inject custom scrollbar styles into WaveSurfer's shadow wrapper
    const injectScrollbarStyle = () => {
      if (!waveformRef.current) return;
      const host = waveformRef.current.firstElementChild;
      if (host && host.shadowRoot) {
        if (host.shadowRoot.querySelector('#ws-custom-scrollbar')) return;
        const style = document.createElement('style');
        style.id = 'ws-custom-scrollbar';
        style.textContent = `
          ::-webkit-scrollbar { height: 6px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: rgba(150, 150, 150, 0.4); border-radius: 10px; }
          ::-webkit-scrollbar-thumb:hover { background: rgba(150, 150, 150, 0.6); }
        `;
        host.shadowRoot.appendChild(style);
      }
    };

    wavesurfer.current.on('ready', injectScrollbarStyle);
    // Fallback if ready fired too fast
    setTimeout(injectScrollbarStyle, 100);
    setTimeout(injectScrollbarStyle, 500);

    // Calculate minimum zoom to fit the entire audio
    wavesurfer.current.on('decode', () => {
      if (waveformRef.current && wavesurfer.current) {
        const dur = wavesurfer.current.getDuration();
        if (dur > 0) {
          const containerWidth = waveformRef.current.clientWidth;
          const calculatedMin = containerWidth / dur;
          setMinZoom(calculatedMin);
          // If current zoom is less than minimum, bump it up, else keep it.
          // Or if we want default to fit:
          // setZoomLevel(calculatedMin);
          // wavesurfer.current.zoom(calculatedMin);
        }
      }
    });
    
    wsRegions.current = wavesurfer.current.registerPlugin(RegionsPlugin.create());

    if (audioPath) {
      // With media element passed, load just fetches peaks without creating another audio element
      wavesurfer.current.load(audioPath);
    }

    wavesurfer.current.on('interaction', (newTime) => {
      onSeek(newTime);
    });

    return () => {
      wavesurfer.current?.destroy();
    };
  }, [audioPath, isDarkMode, onSeek, audioRef]);

  // Handle Waveform Zoom via scroll
  useEffect(() => {
    const container = waveformRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (!wavesurfer.current) return;
      e.preventDefault();
      
      const currentZoom = wavesurfer.current.options.minPxPerSec || 50;
      const zoomFactor = e.deltaY < 0 ? 1.2 : 0.8;
      const newZoom = Math.max(minZoom, Math.min(1000, currentZoom * zoomFactor));
      
      wavesurfer.current.zoom(newZoom);
      setZoomLevel(newZoom);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [minZoom]);

  // Update WaveSurfer playback rate
  useEffect(() => {
    if (wavesurfer.current) {
      wavesurfer.current.setPlaybackRate(playbackRate);
    }
  }, [playbackRate]);

  // Volume Sync
  useEffect(() => {
    if (audioRef?.current) {
      audioRef.current.volume = volume;
    }
  }, [volume, audioRef]);

  // Handle Editing Subtitle Regions
  useEffect(() => {
    if (!wsRegions.current || !wavesurfer.current) return;
    wsRegions.current.clearRegions();

    if (editingSub) {
      const region = wsRegions.current.addRegion({
        start: editingSub.start,
        end: editingSub.end,
        color: 'rgba(59, 130, 246, 0.3)', // blue-500 with opacity
        drag: true,
        resize: true,
      });

      const handleUpdate = () => {
        if (onEditingSubChange) {
          onEditingSubChange(region.start, region.end);
        }
      };

      region.on('update-end', handleUpdate);
      return () => {
        region.un('update-end', handleUpdate);
      };
    }
  }, [editingSub?.id]); // Re-run when editing target changes

  // Removed manual Sync effect since WaveSurfer syncs via the media element automatically.
  // We still format time based on App's currentTime state for the UI string.

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || !isFinite(seconds)) return "00:00.0";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`;
  };

  const rates = [0.5, 1.0, 1.25, 1.5, 2.0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (speedMenuRef.current && !speedMenuRef.current.contains(event.target as Node)) {
        setShowSpeedMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const bgClass = isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200";
  const textClass = isDarkMode ? "text-gray-400" : "text-gray-600";

  return (
    <div className={`h-32 ${bgClass} border-t flex flex-col px-6 py-2 shrink-0 z-20 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] transition-colors duration-300`}>
      
      {/* Waveform Track */}
      <div className="w-full mb-2 cursor-pointer" ref={waveformRef} title="点击波形跳转进度" />

      {/* Controls Row */}
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-4 w-1/3">
          <span className={`text-xl font-mono font-medium tracking-wider w-24 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {formatTime(currentTime)}
          </span>
          <span className={`text-xs font-mono ${textClass}`}>/ {formatTime(duration)}</span>
        </div>

        <div className="flex items-center gap-3 w-1/3 justify-center">
          <button 
            onClick={onReset}
            className={`p-2 rounded-full transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
            title="重新开始"
          >
            <RotateCcw size={18} />
          </button>
          <button 
            onClick={onPlayPause}
            className={`w-12 h-12 flex items-center justify-center rounded-full transition-transform hover:scale-105 ${isPlaying ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'}`}
          >
            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
          </button>
          <button 
            className={`p-2 rounded-full transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
            title="停止"
            onClick={() => {
              if (isPlaying) onPlayPause();
              onReset();
            }}
          >
            <SquareSquare size={18} />
          </button>
        </div>

        <div className={`flex items-center justify-end gap-4 w-1/3 ${textClass}`}>
          
          <button 
            onClick={() => onLoopChange(!loop)}
            className={`p-1.5 rounded transition-colors ${loop ? 'text-blue-500 bg-blue-500/10' : (isDarkMode ? 'hover:text-white hover:bg-gray-800' : 'hover:text-gray-900 hover:bg-gray-100')}`}
            title="循环播放"
          >
            <Repeat size={16} />
          </button>

          <div className="relative flex items-center" ref={speedMenuRef}>
            <button 
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              className={`flex items-center gap-1 p-1.5 text-xs font-mono font-bold rounded transition-colors ${isDarkMode ? 'hover:text-white hover:bg-gray-800' : 'hover:text-gray-900 hover:bg-gray-100'} ${showSpeedMenu ? (isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900') : ''}`}
            >
              <Settings2 size={14} />
              {playbackRate.toFixed(1)}x
            </button>
            
            {showSpeedMenu && (
              <div className={`absolute bottom-full right-0 mb-2 flex flex-col border rounded shadow-xl overflow-hidden z-50 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                {rates.map(r => (
                  <button 
                    key={r}
                    onClick={() => {
                      onRateChange(r);
                      setShowSpeedMenu(false);
                    }}
                    className={`px-4 py-2 text-xs font-mono text-left transition-colors ${
                      playbackRate === r 
                        ? (isDarkMode ? 'text-blue-400 bg-gray-900' : 'text-blue-600 bg-gray-50') 
                        : (isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100')
                    }`}
                  >
                    {r.toFixed(1)}x
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 bg-black/5 p-1 rounded-full">
            <ZoomOut size={14} className="opacity-50 cursor-pointer hover:opacity-100" onClick={() => {
              const z = Math.max(minZoom, zoomLevel * 0.8);
              setZoomLevel(z);
              wavesurfer.current?.zoom(z);
            }} />
            <input 
              type="range" min={minZoom} max="1000" 
              value={zoomLevel} 
              onChange={e => {
                const z = Number(e.target.value);
                setZoomLevel(z);
                wavesurfer.current?.zoom(z);
              }}
              className={`w-16 h-1 ${isDarkMode ? 'accent-gray-400' : 'accent-gray-600'}`} 
            />
            <ZoomIn size={14} className="opacity-50 cursor-pointer hover:opacity-100" onClick={() => {
              const z = Math.min(1000, zoomLevel * 1.2);
              setZoomLevel(z);
              wavesurfer.current?.zoom(z);
            }} />
          </div>

          <div className="flex items-center gap-2">
            <Volume1 size={16} />
            <input 
              type="range" 
              min="0" max="1" step="0.01" 
              value={volume}
              onChange={e => setVolume(parseFloat(e.target.value))}
              className={`w-16 h-1 ${isDarkMode ? 'accent-gray-400' : 'accent-gray-600'}`} 
            />
          </div>
        </div>
      </div>

    </div>
  );
}
