import re

with open('src/components/PlayerControls.tsx', 'r') as f:
    text = f.read()

# 1. Add imports and Update Props
imports_old = "import WaveSurfer from 'wavesurfer.js';"
imports_new = """import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js';
import { ZoomIn, ZoomOut } from 'lucide-react';"""
text = text.replace(imports_old, imports_new)

props_old = """  onRateChange: (rate: number) => void;
  isDarkMode: boolean;
}"""
props_new = """  onRateChange: (rate: number) => void;
  isDarkMode: boolean;
  editingSub?: { id: string, start: number, end: number, text: string } | null;
  onEditingSubChange?: (start: number, end: number) => void;
}"""
text = text.replace(props_old, props_new)

sig_old = """  onRateChange,
  isDarkMode
}: PlayerControlsProps) {"""
sig_new = """  onRateChange,
  isDarkMode,
  editingSub,
  onEditingSubChange
}: PlayerControlsProps) {"""
text = text.replace(sig_old, sig_new)

# 2. Add state
state_old = """  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const speedMenuRef = useRef<HTMLDivElement>(null);
  
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);"""
state_new = """  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const speedMenuRef = useRef<HTMLDivElement>(null);
  
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const wsRegions = useRef<any>(null);
  
  const [volume, setVolume] = useState(0.8);
  const [zoomLevel, setZoomLevel] = useState(50);"""
text = text.replace(state_old, state_new)

# 3. WaveSurfer Initialization - add regions and update zoom
ws_init_old = """    wavesurfer.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: isDarkMode ? '#4b5563' : '#cbd5e1',
      progressColor: '#3b82f6',
      cursorColor: isDarkMode ? '#ffffff' : '#111827',
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      height: 48,
      normalize: true,
      media: audioRef.current, // Use the existing audio element
    });"""

ws_init_new = """    wavesurfer.current = WaveSurfer.create({
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
    
    wsRegions.current = wavesurfer.current.registerPlugin(RegionsPlugin.create());"""
text = text.replace(ws_init_old, ws_init_new)

# 4. Handle Zoom UI
wheel_old = """    const handleWheel = (e: WheelEvent) => {
      if (!wavesurfer.current) return;
      e.preventDefault();
      
      const currentZoom = wavesurfer.current.options.minPxPerSec || 50;
      // Scroll up (negative delta) = zoom in, scroll down = zoom out
      const zoomFactor = e.deltaY < 0 ? 1.2 : 0.8;
      const newZoom = Math.max(10, Math.min(1000, currentZoom * zoomFactor));
      
      wavesurfer.current.zoom(newZoom);
    };"""
wheel_new = """    const handleWheel = (e: WheelEvent) => {
      if (!wavesurfer.current) return;
      e.preventDefault();
      
      const currentZoom = wavesurfer.current.options.minPxPerSec || 50;
      const zoomFactor = e.deltaY < 0 ? 1.2 : 0.8;
      const newZoom = Math.max(10, Math.min(1000, currentZoom * zoomFactor));
      
      wavesurfer.current.zoom(newZoom);
      setZoomLevel(newZoom);
    };"""
text = text.replace(wheel_old, wheel_new)

# 5. Volume Effect
effects_old = """  // Update WaveSurfer playback rate
  useEffect(() => {
    if (wavesurfer.current) {
      wavesurfer.current.setPlaybackRate(playbackRate);
    }
  }, [playbackRate]);"""
effects_new = """  // Update WaveSurfer playback rate
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
  }, [editingSub?.id]); // Re-run when editing target changes"""
text = text.replace(effects_old, effects_new)

# 6. UI Updates
ui_controls_old = """          <div className="flex items-center gap-2">
            <Volume1 size={16} />
            <input type="range" className={`w-20 h-1 ${isDarkMode ? 'accent-gray-400' : 'accent-gray-600'}`} defaultValue={80} />
          </div>"""
ui_controls_new = """          <div className="flex items-center gap-1.5 bg-black/5 p-1 rounded-full">
            <ZoomOut size={14} className="opacity-50 cursor-pointer hover:opacity-100" onClick={() => {
              const z = Math.max(10, zoomLevel * 0.8);
              setZoomLevel(z);
              wavesurfer.current?.zoom(z);
            }} />
            <input 
              type="range" min="10" max="1000" 
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
          </div>"""
text = text.replace(ui_controls_old, ui_controls_new)

with open('src/components/PlayerControls.tsx', 'w') as f:
    f.write(text)

print("Patched PlayerControls for Zoom, Volume, and Regions.")
