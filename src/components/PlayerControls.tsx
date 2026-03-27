
import { Play, Pause, SquareSquare, RotateCcw, Volume1, Repeat, Settings2 } from 'lucide-react';

interface PlayerControlsProps {
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
}

export function PlayerControls({ 
  currentTime, 
  duration, 
  isPlaying, 
  loop,
  playbackRate,
  onPlayPause, 
  onReset, 
  onSeek,
  onLoopChange,
  onRateChange
}: PlayerControlsProps) {
  
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || !isFinite(seconds)) return "00:00.0";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`;
  };

  const rates = [0.5, 1.0, 1.25, 1.5, 2.0];

  return (
    <div className="h-24 bg-gray-900 border-t border-gray-800 flex flex-col px-6 py-2 shrink-0 z-20 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
      
      {/* Timeline Track */}
      <div className="flex-1 flex items-center group relative cursor-pointer" onClick={(e) => {
        const bounds = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - bounds.left) / bounds.width;
        onSeek(Math.max(0, Math.min(percent * duration, duration)));
      }}>
        {/* Background Track */}
        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden flex relative">
          <div className="absolute inset-0 flex items-center justify-between px-1 opacity-20">
            {Array.from({length: 20}).map((_, i) => (
              <div key={i} className="h-full w-0.5 bg-gray-500"></div>
            ))}
          </div>

          {/* Progress Fill */}
          <div 
            className="h-full bg-blue-500 transition-all duration-75 ease-linear"
            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>
        
        {/* Playhead thumb */}
        <div 
          className="absolute h-4 w-1.5 bg-white rounded-sm shadow-md transition-all duration-75 ease-linear"
          style={{ left: `calc(${duration > 0 ? (currentTime / duration) * 100 : 0}% - 3px)` }}
        />
      </div>

      {/* Controls Row */}
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-4 w-1/3">
          <span className="text-xl font-mono font-medium text-white tracking-wider w-24">
            {formatTime(currentTime)}
          </span>
          <span className="text-xs text-gray-500 font-mono">/ {formatTime(duration)}</span>
        </div>

        <div className="flex items-center gap-3 w-1/3 justify-center">
          <button 
            onClick={onReset}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
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
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
            title="停止"
            onClick={() => {
              if (isPlaying) onPlayPause();
              onReset();
            }}
          >
            <SquareSquare size={18} />
          </button>
        </div>

        <div className="flex items-center justify-end gap-4 w-1/3 text-gray-400">
          
          {/* Loop Toggle */}
          <button 
            onClick={() => onLoopChange(!loop)}
            className={`p-1.5 rounded transition-colors ${loop ? 'text-blue-400 bg-blue-400/10' : 'hover:text-white hover:bg-gray-800'}`}
            title="循环播放"
          >
            <Repeat size={16} />
          </button>

          {/* Speed Control */}
          <div className="relative group flex items-center">
            <button className="flex items-center gap-1 p-1.5 text-xs font-mono font-bold hover:text-white rounded hover:bg-gray-800 transition-colors">
              <Settings2 size={14} />
              {playbackRate.toFixed(1)}x
            </button>
            <div className="absolute bottom-full right-0 mb-1 hidden group-hover:flex flex-col bg-gray-800 border border-gray-700 rounded shadow-xl overflow-hidden">
              {rates.map(r => (
                <button 
                  key={r}
                  onClick={() => onRateChange(r)}
                  className={`px-3 py-1.5 text-xs font-mono text-left hover:bg-gray-700 ${playbackRate === r ? 'text-blue-400 bg-gray-900' : 'text-gray-300'}`}
                >
                  {r.toFixed(1)}x
                </button>
              ))}
            </div>
          </div>

          {/* Volume Control - Mock for now */}
          <div className="flex items-center gap-2">
            <Volume1 size={16} />
            <input type="range" className="w-20 accent-gray-500 h-1" defaultValue={80} />
          </div>
        </div>
      </div>

    </div>
  );
}
