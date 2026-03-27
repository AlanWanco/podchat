import { useState, useEffect, useRef, useCallback } from 'react';
import { demoConfig as initialConfig } from './projects/demo/config';
import { SettingsPanel } from './components/SettingsPanel';
import { PlayerControls } from './components/PlayerControls';
import { SubtitlePanel } from './components/SubtitlePanel';
import { MenuBar } from './components/MenuBar';
import { WelcomeScreen } from './components/WelcomeScreen';
import { useAssSubtitle } from './hooks/useAssSubtitle';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import './App.css';

// Local Storage Keys
const STORAGE_KEY = 'podchat_demo_config';
const SETTINGS_POS_KEY = 'podchat_settings_pos';
const THEME_KEY = 'podchat_theme';
const RECENT_PROJECT_KEY = 'podchat_recent_project';

function App() {
  const [projectPath, setProjectPath] = useState<string | null>(null);
  const [recentProject, setRecentProject] = useState<string | null>(() => localStorage.getItem(RECENT_PROJECT_KEY));

  // Load initial from localStorage if available
  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialConfig;
  });

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loop, setLoop] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem(THEME_KEY) !== 'light');
  const [showSettings, setShowSettings] = useState(true);
  const [showSubtitlePanel, setShowSubtitlePanel] = useState(true);
  
  const [settingsPosition, setSettingsPosition] = useState<'left'|'right'>(() => {
    return (localStorage.getItem(SETTINGS_POS_KEY) as 'left'|'right') || 'right';
  });

  // Panel Widths
  const [subtitleWidth, setSubtitleWidth] = useState(320);
  const [settingsWidth, setSettingsWidth] = useState(320);
  const [activeTab, setActiveTab] = useState<'global' | 'project'>('project');
  const [editingSub, setEditingSub] = useState<{ id: string, start: number, end: number, text: string } | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // Responsive scale based on container size
  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        const scaleX = width / config.dimensions.width;
        const scaleY = height / config.dimensions.height;
        // The container has p-8, so contentRect is already padded.
        setScale(Math.min(scaleX, scaleY));
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    return () => resizeObserver.disconnect();
  }, [config.dimensions.width, config.dimensions.height]);

  const { subtitles, setSubtitles, loading: subtitlesLoading } = useAssSubtitle(config.assPath, config.speakers);

  const handleUpdateSubtitle = (id: string, updates: Partial<any>) => {
    setSubtitles((prev: any[]) => prev.map((s: any) => s.id === id ? { ...s, ...updates } : s));
  };

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  // Save config explicitly
  const handleSaveConfig = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    showToast('配置已保存到浏览器缓存！');
  };

  useEffect(() => {
    localStorage.setItem(THEME_KEY, isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_POS_KEY, settingsPosition);
  }, [settingsPosition]);

  // Update window title with project path
  useEffect(() => {
    if (projectPath) {
      document.title = projectPath === 'web-demo' 
        ? 'PodChat Studio - Web Demo'
        : `PodChat Studio - ${projectPath}`;
    } else {
      document.title = 'PodChat Studio';
    }
  }, [projectPath]);

  // Audio Sync
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
    if (audioRef.current) audioRef.current.playbackRate = playbackRate;
  }, [playbackRate]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.loop = loop;
  }, [loop]);

  const handleTimeUpdate = () => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };

  const handleSeek = useCallback((time: number) => {
    if (audioRef.current) audioRef.current.currentTime = time;
    setCurrentTime(time);
  }, []);

  // Auto-scroll log (Only scroll to active subtitle in the chat view)
  useEffect(() => {
    if (scrollRef.current) {
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      });
    }
  }, [currentTime]);

  const getExportConfig = () => {
    return {
      ...config,
      content: subtitles.map(s => ({
        start: s.start,
        end: s.end,
        speaker: s.speakerId,
        type: 'text',
        text: s.text
      }))
    };
  };

  const exportConfig = () => {
    const finalConfig = getExportConfig();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(finalConfig, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "podchat_project.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // Drag Resizing Logic
  const startResizing = (e: React.MouseEvent, type: 'subtitle' | 'settings') => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = type === 'subtitle' ? subtitleWidth : settingsWidth;

    const onMouseMove = (moveEvent: MouseEvent) => {
      let delta = moveEvent.clientX - startX;
      
      // Determine direction based on position
      if (type === 'subtitle') {
        // Subtitle is ALWAYS on the left
        const newWidth = Math.max(200, Math.min(600, startWidth + delta));
        setSubtitleWidth(newWidth);
      } else {
        // Settings could be left or right
        if (settingsPosition === 'left') {
           // It's on the left, but after Subtitle if both are left
           // Actually, if settings is left, it's on the left side of the main workspace
           const newWidth = Math.max(250, Math.min(600, startWidth + delta));
           setSettingsWidth(newWidth);
        } else {
           // Settings on the right
           const newWidth = Math.max(250, Math.min(600, startWidth - delta));
           setSettingsWidth(newWidth);
        }
      }
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = 'default';
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.body.style.cursor = 'col-resize';
  };

  const resolvePath = (path: string) => {
    if (!path) return '';
    // Catch http, https, // protocol-relative, data URI, blob URI
    if (/^(https?:)?\/\//i.test(path) || path.startsWith('data:') || path.startsWith('blob:')) return path;
    
    // Convert local absolute paths to Vite's /@fs/ endpoint for local dev loading
    if (path.startsWith('file://')) return `/@fs${path.replace(/^file:\/\/?/, '/')}`;
    if (/^[a-zA-Z]:[\\/]/.test(path)) return `/@fs/${path.replace(/\\/g, '/')}`;
    
    // For Unix-like absolute paths that are clearly not project relative paths
    if (path.startsWith('/') && !path.startsWith('/projects/') && !path.startsWith('/assets/')) {
       return `/@fs${path}`;
    }

    return path.startsWith('/') ? path : `/${path}`;
  };

  const formatTimestamp = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const validateProjectConfig = (parsed: any) => {
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('无效的配置文件：不是一个有效的 JSON 对象');
    }
    
    const requiredKeys = ['fps', 'dimensions', 'audioPath', 'assPath', 'speakers'];
    for (const key of requiredKeys) {
      if (parsed[key] === undefined) {
        throw new Error(`无效的配置文件：缺少必要字段 "${key}"`);
      }
    }
    
    if (typeof parsed.dimensions !== 'object' || !parsed.dimensions.width || !parsed.dimensions.height) {
      throw new Error('无效的配置文件：dimensions 尺寸格式错误');
    }

    if (typeof parsed.speakers !== 'object') {
      throw new Error('无效的配置文件：speakers 格式错误');
    }

    // 默认值合并（兼容旧版本或缺失非必填字段的配置）
    return {
      ...initialConfig, // 先用默认配置垫底
      ...parsed,        // 覆盖已有配置
      dimensions: {
        ...initialConfig.dimensions,
        ...parsed.dimensions
      },
      chatLayout: {
        ...initialConfig.chatLayout,
        ...(parsed.chatLayout || {})
      },
      background: {
        ...initialConfig.background,
        ...(parsed.background || {})
      }
    };
  };

  const handleNewProject = async () => {
    if (!window.electron) {
      // Web mode fallback
      setProjectPath('web-demo');
      const cleanConfig = { ...initialConfig, projectTitle: '新项目', audioPath: '', assPath: '', content: [] };
      setConfig(cleanConfig);
      return;
    }
    
    try {
      const result = await window.electron.showSaveDialog({
        title: '新建项目并保存配置文件',
        defaultPath: 'podchat_project.json',
        filters: [{ name: 'JSON Config', extensions: ['json'] }]
      });
      
      if (!result.canceled && result.filePath) {
        const newConfig = { 
          ...initialConfig, 
          projectTitle: '新项目',
          audioPath: '',
          assPath: '',
          content: []
        };
        await window.electron.writeFile(result.filePath, JSON.stringify(newConfig, null, 2));
        setProjectPath(result.filePath);
        setRecentProject(result.filePath);
        localStorage.setItem(RECENT_PROJECT_KEY, result.filePath);
        setConfig(newConfig);
        showToast('项目创建成功，请导入音频和字幕文件');
      }
    } catch (e: any) {
      alert('创建失败: ' + e.message);
    }
  };

  const handleCloseProject = () => {
    setProjectPath(null);
    document.title = 'PodChat Studio';
  };

  const handleSetAudio = async () => {
    if (!window.electron) return;
    try {
      const res = await window.electron.showOpenDialog({
        title: '选择音频文件',
        filters: [{ name: 'Audio Files', extensions: ['mp3', 'wav', 'aac', 'm4a', 'flac'] }],
        properties: ['openFile']
      });
      if (!res.canceled && res.filePaths.length > 0) {
        setConfig((prev: any) => ({ ...prev, audioPath: res.filePaths[0] }));
        showToast('音频已更新');
      }
    } catch (e: any) {
      alert('选择音频失败: ' + e.message);
    }
  };

  const handleSetSubtitle = async () => {
    if (!window.electron) return;
    try {
      const res = await window.electron.showOpenDialog({
        title: '选择字幕文件',
        filters: [{ name: 'Subtitle Files', extensions: ['ass', 'srt', 'vtt'] }],
        properties: ['openFile']
      });
      if (!res.canceled && res.filePaths.length > 0) {
        setConfig((prev: any) => ({ ...prev, assPath: res.filePaths[0] }));
        showToast('字幕已更新');
      }
    } catch (e: any) {
      alert('选择字幕失败: ' + e.message);
    }
  };

  const handleSelectImage = async (): Promise<string | null> => {
    if (!window.electron) {
      alert('网页版不支持此功能，请手动输入网络图片链接');
      return null;
    }
    try {
      const res = await window.electron.showOpenDialog({
        title: '选择图片文件',
        filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'webp', 'gif'] }],
        properties: ['openFile']
      });
      if (!res.canceled && res.filePaths.length > 0) {
        return res.filePaths[0];
      }
    } catch (e: any) {
      alert('选择图片失败: ' + e.message);
    }
    return null;
  };

  const loadProjectFromPath = async (filePath: string) => {
    try {
      const content = await window.electron.readFile(filePath);
      const parsed = JSON.parse(content);
      const validatedConfig = validateProjectConfig(parsed);
      
      setProjectPath(filePath);
      setRecentProject(filePath);
      localStorage.setItem(RECENT_PROJECT_KEY, filePath);
      setConfig(validatedConfig);
      showToast('项目已加载');
    } catch (e: any) {
      alert('加载失败: ' + e.message);
      if (filePath === recentProject) {
        setRecentProject(null);
        localStorage.removeItem(RECENT_PROJECT_KEY);
      }
    }
  };

  const handleOpenProject = async () => {
    if (!window.electron) {
      // Web mode fallback
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          const validatedConfig = validateProjectConfig(parsed);
          setConfig(validatedConfig);
        } else {
          setConfig(initialConfig);
        }
        setProjectPath('web-demo');
      } catch (e: any) {
        alert('读取网页缓存失败: ' + e.message);
        setConfig(initialConfig);
        setProjectPath('web-demo');
      }
      return;
    }

    try {
      const result = await window.electron.showOpenDialog({
        title: '打开项目配置文件',
        filters: [{ name: 'JSON Config', extensions: ['json'] }],
        properties: ['openFile']
      });

      if (!result.canceled && result.filePaths.length > 0) {
        await loadProjectFromPath(result.filePaths[0]);
      }
    } catch (e: any) {
      alert('选择文件失败: ' + e.message);
    }
  };

  const handleSaveProject = async () => {
    if (!window.electron || !projectPath || projectPath === 'web-demo') {
      handleSaveConfig(); // Web mode fallback to localStorage
      return;
    }

    try {
      const finalConfig = getExportConfig();
      await window.electron.writeFile(projectPath, JSON.stringify(finalConfig, null, 2));
      showToast('项目已保存');
    } catch (e: any) {
      alert('保存失败: ' + e.message);
    }
  };

  const appBg = isDarkMode ? "bg-[#0a0a0a]" : "bg-gray-100";
  const textClass = isDarkMode ? "text-white" : "text-gray-900";
  const toolbarBg = isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200";
  const canvasBg = isDarkMode ? "bg-[#111]" : "bg-gray-200/50";
  const mockupBg = isDarkMode ? "bg-gray-950 border-gray-800" : "bg-white border-gray-300";
  const dividerClass = isDarkMode ? "bg-gray-800 hover:bg-blue-500" : "bg-gray-300 hover:bg-blue-400";

  if (!projectPath) {
    return (
      <WelcomeScreen 
        onNewProject={handleNewProject} 
        onOpenProject={handleOpenProject} 
        onOpenRecent={() => recentProject && loadProjectFromPath(recentProject)}
        recentProject={recentProject}
        isDarkMode={isDarkMode} 
      />
    );
  }

  return (
    <div className={`w-full h-screen ${appBg} flex flex-col font-sans ${textClass} overflow-hidden transition-colors duration-300`}>
      
      <MenuBar 
        isDarkMode={isDarkMode}
        projectPath={projectPath}
        projectName={config.projectTitle || '未命名项目'}
        onNewProject={handleNewProject}
        onOpenProject={handleOpenProject}
        onSaveProject={handleSaveProject}
        onSetAudio={handleSetAudio}
        onSetSubtitle={handleSetSubtitle}
        onCloseProject={handleCloseProject}
        onExportVideo={async () => {
          if (window.electron) {
            const finalConfig = getExportConfig();
            try {
              const res = await window.electron.exportVideo(finalConfig);
              if (res.success) {
                alert('导出成功（这只是测试弹窗，之后会加进度条）');
              }
            } catch (e: any) {
              alert('导出失败: ' + e.message);
            }
          } else {
            alert('需要在客户端中运行才能导出视频');
          }
        }}
        onExportConfig={exportConfig}
        showSettings={showSettings}
        setShowSettings={setShowSettings}
      />

      <audio 
        ref={audioRef}
        src={resolvePath(config.audioPath)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => !loop && setIsPlaying(false)}
        preload="metadata"
      />

      {/* TOP SECTION: Panels + Workspace */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        
        {/* LEFT PANELS */}
        <div className="flex h-full shrink-0 z-20">
          {showSubtitlePanel && (
            <div style={{ width: subtitleWidth }} className="h-full border-r border-gray-800 shrink-0">
              <SubtitlePanel 
                subtitles={subtitles} 
                currentTime={currentTime} 
                isDarkMode={isDarkMode} 
                onSeek={handleSeek} 
                onUpdateSubtitle={handleUpdateSubtitle}
                editingSub={editingSub}
                setEditingSub={setEditingSub}
              />
            </div>
          )}
          {showSubtitlePanel && (
            <div 
              className={`w-1 cursor-col-resize shrink-0 transition-colors ${dividerClass}`}
              onMouseDown={(e) => startResizing(e, 'subtitle')}
            />
          )}
          
          {settingsPosition === 'left' && showSettings && (
            <div style={{ width: settingsWidth }} className="h-full shrink-0">
              <SettingsPanel 
                config={config} 
                onConfigChange={setConfig} 
                isDarkMode={isDarkMode}
                onThemeChange={setIsDarkMode}
                settingsPosition={settingsPosition}
                onPositionChange={setSettingsPosition}
                onClose={() => setShowSettings(false)}
                onSave={handleSaveProject}
                showToast={showToast}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onSelectImage={handleSelectImage}
              />
            </div>
          )}
          {settingsPosition === 'left' && showSettings && (
            <div 
              className={`w-1 cursor-col-resize shrink-0 transition-colors ${dividerClass}`}
              onMouseDown={(e) => startResizing(e, 'settings')}
            />
          )}
        </div>

        {/* Main Workspace */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 relative">
          
          {/* Top Toolbar */}
          <div className={`h-12 ${toolbarBg} border-b flex items-center px-4 justify-between shrink-0 z-30 shadow-sm`}>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowSubtitlePanel(!showSubtitlePanel)}
                className={`p-1.5 rounded transition-colors mr-2 ${isDarkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
                title="切换字幕列表"
              >
                {showSubtitlePanel ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
              </button>
            </div>
            <div className="flex items-center gap-4">
              <div className={`text-xs px-2 py-1 rounded ${isDarkMode ? 'text-gray-500 bg-gray-800' : 'text-gray-600 bg-gray-100'}`}>
                1920x1080 (16:9) @ {config.fps}FPS
              </div>
            </div>
          </div>

          {/* Canvas Area (Preview) */}
          {toastMessage && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded shadow-xl z-50 animate-fade-in text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              {toastMessage}
            </div>
          )}
          <div ref={containerRef} className={`flex-1 overflow-hidden min-w-0 min-h-0 relative z-10 p-8 ${canvasBg}`}>
            
            {/* Actual Canvas Content with absolute positioning to prevent ResizeObserver loop */}
            <div 
              className={`absolute left-1/2 top-1/2 pointer-events-auto bg-transparent shadow-2xl rounded-lg overflow-hidden flex flex-col border`}
              style={{
                width: config.dimensions.width,
                height: config.dimensions.height,
                borderColor: isDarkMode ? '#1f2937' : '#d1d5db',
                isolation: 'isolate',
                transform: `translate(-50%, -50%) scale(${scale})`,
                transformOrigin: 'center center',
              }}
            >
              
              {/* Fallback color layer if no background image */}
              <div className={`absolute inset-0 -z-20 ${mockupBg}`} />

              {/* Background Image Wrapper */}
              {config.background?.image && (
                <div className="absolute inset-0 -z-10 overflow-hidden">
                  <img 
                    src={resolvePath(config.background.image)}
                    alt="Background"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    style={{ 
                      filter: `blur(${config.background.blur || 0}px) brightness(${config.background.brightness ?? 1.0})`,
                      transform: 'scale(1.05)', // prevent white edges when blurred
                      transformOrigin: 'center center'
                    }}
                  />
                </div>
              )}

              {/* Chat Stream */}
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto flex flex-col scroll-smooth custom-scrollbar"
                style={{
                  paddingTop: `${config.chatLayout?.paddingTop ?? 48}px`,
                  paddingBottom: `${config.chatLayout?.paddingBottom ?? 120}px`,
                  paddingLeft: `${config.chatLayout?.paddingX ?? 48}px`,
                  paddingRight: `${config.chatLayout?.paddingX ?? 48}px`
                }}
              >
                {subtitlesLoading ? (
                  <div className="text-center opacity-50 my-auto">正在加载字幕文件...</div>
                ) : (
                  subtitles.map((item) => {
                    const speaker = config.speakers[item.speakerId];
                    if (!speaker) return null;

                    const isVisible = currentTime >= item.start;
                    const isLeft = speaker.side === "left";

                    if (!isVisible) return null;

                    const fallbackBg = speaker.theme === 'dark' ? '#2563eb' : '#ffffff';
                    const fallbackText = speaker.theme === 'dark' ? '#ffffff' : '#111827';
                    
                    const bgColor = speaker.style?.bgColor || fallbackBg;
                    const textColor = speaker.style?.textColor || fallbackText;
                    const radius = speaker.style?.borderRadius ?? 32;
                    const opacity = speaker.style?.opacity ?? 0.9;
                    const blur = speaker.style?.blur ?? 4;
                    const borderWidth = speaker.style?.borderWidth ?? 0;
                    const borderColor = speaker.style?.borderColor || "#ffffff";
                    const borderOpacity = speaker.style?.borderOpacity ?? 1.0;
                    const margin = speaker.style?.margin ?? 16;
                    const paddingX = speaker.style?.paddingX ?? 24;
                    const paddingY = speaker.style?.paddingY ?? 16;
                    
                    const fontFamily = speaker.style?.fontFamily || "system-ui";
                    const fontSize = speaker.style?.fontSize ?? 20;
                    const fontWeight = speaker.style?.fontWeight || "normal";
                    const bubbleScale = speaker.style?.scale ?? 1.0;
                    
                    // Convert hex color to rgba using opacity
                    const hexBg = bgColor.startsWith('#') ? bgColor : '#ffffff';
                    const opacityHex = Math.floor(opacity * 255).toString(16).padStart(2, '0');
                    const finalBgColor = `${hexBg}${opacityHex}`;

                    // Convert border hex color to rgba
                    const hexBorder = borderColor.startsWith('#') ? borderColor : '#ffffff';
                    const borderOpacityHex = Math.floor(borderOpacity * 255).toString(16).padStart(2, '0');
                    const finalBorderColor = `${hexBorder}${borderOpacityHex}`;

                    return (
                      <div
                        key={item.id}
                        className={`flex w-full ${isLeft ? "justify-start" : "justify-end"}`}
                        style={{ 
                          marginBottom: `${margin}px`,
                          ...(bubbleScale !== 1.0 ? { zoom: bubbleScale } : {})
                        } as React.CSSProperties}
                      >
                        <div 
                          className={`flex max-w-[70%] gap-4 ${isLeft ? "flex-row" : "flex-row-reverse"}`}
                        >
                          <img
                            src={resolvePath(speaker.avatar)}
                            alt={speaker.name}
                            referrerPolicy="no-referrer"
                            className={`w-16 h-16 rounded-full border-4 shrink-0 shadow-lg object-cover ${isDarkMode ? 'border-gray-800 bg-gray-900' : 'border-white bg-gray-200'}`}
                          />
                          <div className={`flex flex-col ${isLeft ? "items-start" : "items-end"}`}>
                            <div className={`flex items-baseline gap-2 mb-1 drop-shadow-md mix-blend-difference ${isLeft ? "flex-row" : "flex-row-reverse"}`}>
                              <span className="text-sm font-bold text-white/90">
                                {speaker.name}
                              </span>
                              <span className="text-[10px] font-mono text-white/60">
                                {formatTimestamp(item.start)}
                              </span>
                            </div>
                            <div 
                              className="shadow-xl break-words"
                              style={{
                                fontFamily,
                                fontSize: `${fontSize}px`,
                                fontWeight,
                                padding: `${paddingY}px ${paddingX}px`,
                                backgroundColor: finalBgColor, 
                                color: textColor,
                                borderRadius: `${radius}px`,
                                borderTopLeftRadius: isLeft ? '4px' : `${radius}px`,
                                borderTopRightRadius: !isLeft ? '4px' : `${radius}px`,
                                backdropFilter: `blur(${blur}px)`,
                                WebkitBackdropFilter: `blur(${blur}px)`,
                                border: borderWidth > 0 ? `${borderWidth}px solid ${finalBorderColor}` : 'none'
                              }}
                            >
                              <p className="leading-relaxed whitespace-pre-wrap">{item.text}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANELS */}
        {settingsPosition === 'right' && showSettings && (
          <div className="flex h-full shrink-0 z-20">
            <div 
              className={`w-1 cursor-col-resize shrink-0 transition-colors ${dividerClass}`}
              onMouseDown={(e) => startResizing(e, 'settings')}
            />
            <div style={{ width: settingsWidth }} className="h-full shrink-0">
              <SettingsPanel 
                config={config} 
                onConfigChange={setConfig} 
                isDarkMode={isDarkMode}
                onThemeChange={setIsDarkMode}
                settingsPosition={settingsPosition}
                onPositionChange={setSettingsPosition}
                onClose={() => setShowSettings(false)}
                onSave={handleSaveProject}
                showToast={showToast}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onSelectImage={handleSelectImage}
              />
            </div>
          </div>
        )}
      </div>

      <PlayerControls 
        audioPath={resolvePath(config.audioPath)}
        audioRef={audioRef}
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
        isDarkMode={isDarkMode}
        editingSub={editingSub}
        onEditingSubChange={(start, end) => {
          if (editingSub) {
            setEditingSub({ ...editingSub, start, end });
            handleUpdateSubtitle(editingSub.id, { start, end, duration: Number((end - start).toFixed(2)) });
          }
        }}
      />

    </div>
  );
}

export default App;
