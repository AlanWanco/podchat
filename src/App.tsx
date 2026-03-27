import { useState, useEffect, useRef } from 'react';
import { demoConfig as initialConfig } from './projects/demo/config';
import { SettingsPanel } from './components/SettingsPanel';
import { PlayerControls } from './components/PlayerControls';
import { Download } from 'lucide-react';
import './App.css';

interface Speaker {
  name: string;
  avatar: string;
  side: "left" | "right";
  theme: "light" | "dark";
}

interface ContentItem {
  start: number;
  end: number;
  speaker: string;
  type: "text" | "image";
  text?: string;
  url?: string;
}

function App() {
  const [config, setConfig] = useState(initialConfig);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loop, setLoop] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  
  // Ref for auto-scrolling
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Audio Playback Sync
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch((err) => {
        console.error("Audio playback failed:", err);
        setIsPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = loop;
    }
  }, [loop]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleAudioEnded = () => {
    if (!loop) {
      setIsPlaying(false);
    }
  };

  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
    setCurrentTime(time);
  };

  // Auto-scroll logic
  useEffect(() => {
    if (scrollRef.current && isPlaying) {
      const el = scrollRef.current;
      el.scrollTop = el.scrollHeight;
    }
  }, [currentTime, isPlaying]);

  const exportConfig = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(config, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "podchat_project.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    alert("已下载配置 JSON。\n\n提示：当前前端界面仅用于预览和编辑参数。真正的视频压制（MP4硬解导出）需要通过后端的 Remotion 引擎读取此 JSON 来执行！");
  };

  return (
    <div className="w-full h-screen bg-[#0a0a0a] flex font-sans text-white overflow-hidden">
      
      {/* Audio Element */}
      <audio 
        ref={audioRef}
        src={config.audioPath}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleAudioEnded}
        preload="metadata"
      />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Toolbar */}
        <div className="h-12 bg-gray-900 border-b border-gray-800 flex items-center px-4 justify-between shrink-0">
          <div className="font-bold text-gray-300">PodChat Studio <span className="text-gray-600 font-normal ml-2">| {config.projectTitle}</span></div>
          <div className="flex items-center gap-4">
            <div className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">1920x1080 (16:9) @ {config.fps}FPS</div>
            <button 
              onClick={exportConfig}
              className="flex items-center gap-2 text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded transition-colors shadow-lg"
            >
              <Download size={14} />
              导出配置 (渲染)
            </button>
          </div>
        </div>

        {/* Canvas Area (Preview) */}
        <div className="flex-1 overflow-hidden flex items-center justify-center bg-[#111] p-8 relative">
          {/* Desktop container mockup (1920x1080 scaled down via aspect-ratio container) */}
          <div 
            className="relative w-full max-w-[1280px] aspect-video bg-gray-950 rounded-lg shadow-2xl overflow-hidden flex flex-col border border-gray-800"
          >
            {/* Background Image */}
            {config.background?.image && (
              <div 
                className="absolute inset-0 bg-cover bg-center z-0 scale-105"
                style={{ 
                  backgroundImage: `url(${config.background.image})`,
                  filter: `blur(${config.background.blur || 0}px)`,
                  opacity: 0.5
                }}
              />
            )}
            
            {/* Safe Area overlay for debugging (optional) */}
            <div className="absolute inset-0 border-[40px] border-black/20 pointer-events-none z-10 hidden" />

            {/* Chat Stream */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-12 flex flex-col gap-6 pb-32 scroll-smooth z-10 custom-scrollbar relative"
            >
              {(config.content as ContentItem[]).map((item, index) => {
                const speaker = (config.speakers as Record<string, Speaker>)[item.speaker];
                const isVisible = currentTime >= item.start;
                const isLeft = speaker.side === "left";

                if (!isVisible) return null;

                return (
                  <div
                    key={index}
                    className={`flex w-full ${isLeft ? "justify-start" : "justify-end"} animate-fade-in`}
                  >
                    <div className={`flex max-w-[70%] gap-4 ${isLeft ? "flex-row" : "flex-row-reverse"}`}>
                      {/* Avatar */}
                      <img
                        src={speaker.avatar}
                        alt={speaker.name}
                        className="w-16 h-16 rounded-full border-4 border-gray-800 bg-gray-900 shrink-0 shadow-lg object-cover"
                      />
                      
                      {/* Bubble & Name */}
                      <div className={`flex flex-col ${isLeft ? "items-start" : "items-end"}`}>
                        <span className="text-sm font-bold text-white/80 mb-1 drop-shadow-md">{speaker.name}</span>
                        
                        {/* Content */}
                        <div 
                          className={`
                            px-6 py-4 rounded-[2rem] shadow-xl text-xl break-words
                            ${speaker.theme === "dark" 
                              ? "bg-blue-600/90 text-white backdrop-blur-sm" 
                              : "bg-white/90 text-gray-900 backdrop-blur-sm"}
                            ${isLeft 
                              ? "rounded-tl-md" 
                              : "rounded-tr-md"}
                          `}
                        >
                          {item.type === "text" ? (
                            <p className="leading-relaxed whitespace-pre-wrap">{item.text}</p>
                          ) : (
                            <img 
                              src={item.url} 
                              alt="media" 
                              className="w-full rounded-xl object-cover"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Timeline & Controls */}
        <PlayerControls 
          currentTime={currentTime} 
          duration={duration}
          isPlaying={isPlaying}
          loop={loop}
          playbackRate={playbackRate}
          onPlayPause={() => setIsPlaying(!isPlaying)}
          onReset={() => {
            handleSeek(0);
            setIsPlaying(false);
          }}
          onSeek={handleSeek}
          onLoopChange={setLoop}
          onRateChange={setPlaybackRate}
        />

      </div>

      {/* Right Sidebar - Settings */}
      <SettingsPanel config={config} onConfigChange={setConfig} />

    </div>
  );
}

export default App;
