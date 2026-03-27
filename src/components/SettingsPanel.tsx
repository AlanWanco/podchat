import { useState, useEffect } from 'react';
import { Settings, Image as ImageIcon, Users, Save, Moon, Sun, Trash2, Plus, X, ArrowLeftRight, LayoutTemplate, Type, Box, Layout, FolderOpen } from 'lucide-react';

interface SettingsPanelProps {
  config: any;
  onConfigChange: (newConfig: any) => void;
  isDarkMode: boolean;
  onThemeChange: (isDark: boolean) => void;
  settingsPosition: 'left' | 'right';
  onPositionChange: (pos: 'left' | 'right') => void;
  onClose: () => void;
  onSave: () => void;
  showToast: (msg: string) => void;
  activeTab: 'global' | 'project';
  setActiveTab: (tab: 'global' | 'project') => void;
  onSelectImage?: () => Promise<string | null>;
}

export function SettingsPanel({ 
  config, onConfigChange, 
  isDarkMode, onThemeChange, 
  settingsPosition, onPositionChange,
  onClose, onSave, showToast, activeTab, setActiveTab,
  onSelectImage
}: SettingsPanelProps) {
  const [presets, setPresets] = useState<Record<string, any>>(() => {
    const saved = localStorage.getItem('podchat_presets');
    return saved ? JSON.parse(saved) : {};
  });
  const [presetPromptKey, setPresetPromptKey] = useState<string | null>(null);
  const [presetNameInput, setPresetNameInput] = useState("");

  useEffect(() => {
    const handlePresetsUpdate = () => {
      const saved = localStorage.getItem('podchat_presets');
      if (saved) setPresets(JSON.parse(saved));
    };
    window.addEventListener('podchat_presets_updated', handlePresetsUpdate);
    return () => window.removeEventListener('podchat_presets_updated', handlePresetsUpdate);
  }, []);


  const updateConfig = (key: string, value: any) => {
    onConfigChange({ ...config, [key]: value });
  };

  const updateBackground = (key: string, value: any) => {
    onConfigChange({
      ...config,
      background: { ...config.background, [key]: value }
    });
  };

  const updateChatLayout = (key: string, value: any) => {
    onConfigChange({
      ...config,
      chatLayout: { ...config.chatLayout, [key]: value }
    });
  };

  const updateSpeakerStyle = (speakerKey: string, styleKey: string, value: any) => {
    const newSpeakers = { ...config.speakers };
    if (!newSpeakers[speakerKey].style) newSpeakers[speakerKey].style = {};
    newSpeakers[speakerKey].style[styleKey] = value;
    // Clear preset tag when customized
    newSpeakers[speakerKey].preset = "";
    updateConfig('speakers', newSpeakers);
  };

  const handleAddSpeaker = () => {
    const keys = Object.keys(config.speakers);
    const nextId = String.fromCharCode(65 + keys.length);
    let newId = nextId;
    let counter = 1;
    while(config.speakers[newId]) {
      newId = `${nextId}${counter}`;
      counter++;
    }
    const newSpeakers = { 
      ...config.speakers, 
      [newId]: { 
        name: `新角色 ${newId}`, 
        avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${newId}`, 
        side: "left", 
        style: { bgColor: "#6b7280", textColor: "#ffffff", borderRadius: 32, opacity: 0.9, blur: 4, borderWidth: 0, borderColor: "#ffffff", borderOpacity: 1.0, margin: 16, paddingX: 24, paddingY: 16 }
      } 
    };
    updateConfig('speakers', newSpeakers);
  };

  const handleRemoveSpeaker = (key: string) => {
    if (Object.keys(config.speakers).length <= 1) return;
    const newSpeakers = { ...config.speakers };
    delete newSpeakers[key];
    updateConfig('speakers', newSpeakers);
  };

  const handleRemovePreset = (presetName: string) => {
    if (!presetName) return;
    const existingStr = localStorage.getItem('podchat_presets');
    if (!existingStr) return;
    
    const existing = JSON.parse(existingStr);
    delete existing[presetName];
    localStorage.setItem('podchat_presets', JSON.stringify(existing));
    
    // Auto unbind from speakers using this preset
    const newSpeakers = { ...config.speakers };
    let changed = false;
    Object.keys(newSpeakers).forEach(k => {
      if (newSpeakers[k].preset === presetName) {
        newSpeakers[k].preset = "";
        changed = true;
      }
    });
    if (changed) updateConfig('speakers', newSpeakers);
    
    window.dispatchEvent(new Event('podchat_presets_updated'));
    showToast(`预设 "${presetName}" 已删除`);
  };

  const bgClass = isDarkMode ? "bg-gray-900 border-gray-800 text-gray-300" : "bg-white border-gray-200 text-gray-700";
  const headerClass = isDarkMode ? "bg-gray-950 border-gray-800 text-white" : "bg-gray-50 border-gray-200 text-gray-900";
  const inputClass = isDarkMode ? "bg-gray-800 border-gray-700 text-white focus:border-blue-500" : "bg-white border-gray-300 text-gray-900 focus:border-blue-500";
  const cardBgClass = isDarkMode ? "bg-gray-800/50 border-gray-800" : "bg-gray-50 border-gray-200";

  return (
    <div className={`h-full flex flex-col overflow-hidden ${bgClass}`}>
      <div className={`p-4 border-b flex items-center justify-between shrink-0 ${headerClass}`}>
        <h2 className="font-bold flex items-center gap-2 text-sm">
          <Settings size={16} /> 设置面板
        </h2>
        <div className="flex items-center gap-2">
          <button onClick={onSave} className={`p-1.5 rounded-md transition-colors ${isDarkMode ? 'hover:bg-gray-800 text-blue-400' : 'hover:bg-gray-200 text-blue-600'}`} title="保存到本地">
            <Save size={16} />
          </button>
          <button onClick={onClose} className={`p-1.5 rounded-md transition-colors ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}`} title="关闭面板">
            <X size={16} />
          </button>
        </div>
      </div>

      <div className={`flex border-b shrink-0 ${isDarkMode ? 'bg-gray-950/50 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
        <button
          className={`flex-1 py-2 font-medium transition-colors text-sm ${activeTab === 'global' ? (isDarkMode ? 'text-white border-b-2 border-blue-500' : 'text-gray-900 border-b-2 border-blue-500') : (isDarkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700')}`}
          onClick={() => setActiveTab('global')}
        >
          全局设置
        </button>
        <button
          className={`flex-1 py-2 font-medium transition-colors text-sm ${activeTab === 'project' ? (isDarkMode ? 'text-white border-b-2 border-blue-500' : 'text-gray-900 border-b-2 border-blue-500') : (isDarkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700')}`}
          onClick={() => setActiveTab('project')}
        >
          项目设置
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {activeTab === 'global' ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-medium uppercase tracking-wider opacity-70">界面主题</label>
              <div className={`flex rounded-lg p-1 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <button 
                  onClick={() => onThemeChange(false)}
                  className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-sm transition-colors ${!isDarkMode ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Sun size={14} /> 日间
                </button>
                <button 
                  onClick={() => onThemeChange(true)}
                  className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-sm transition-colors ${isDarkMode ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  <Moon size={14} /> 夜间
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-xs font-medium uppercase tracking-wider opacity-70">设置面板位置</label>
              <div className={`flex rounded-lg p-1 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <button 
                  onClick={() => onPositionChange('left')}
                  className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-sm transition-colors ${settingsPosition === 'left' ? (isDarkMode ? 'bg-gray-700 text-white shadow-sm' : 'bg-white text-blue-600 shadow-sm') : 'text-gray-500'}`}
                >
                  <ArrowLeftRight size={14} /> 居左
                </button>
                <button 
                  onClick={() => onPositionChange('right')}
                  className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-sm transition-colors ${settingsPosition === 'right' ? (isDarkMode ? 'bg-gray-700 text-white shadow-sm' : 'bg-white text-blue-600 shadow-sm') : 'text-gray-500'}`}
                >
                  <ArrowLeftRight size={14} /> 居右
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Resolution/Layout */}
            <div className="space-y-3">
              <label className={`flex items-center gap-2 text-sm font-medium border-b pb-1 ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                <LayoutTemplate size={14} /> 画面与布局
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5 col-span-2">
                  <span className="text-xs opacity-70">帧率 (FPS)</span>
                  <input 
                    type="number" 
                    value={config.fps || 60}
                    onChange={(e) => updateConfig('fps', parseInt(e.target.value))}
                    className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none ${inputClass}`} 
                  />
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs opacity-70">宽度 (W)</span>
                  <input 
                    type="number" 
                    value={config.dimensions?.width || 1920}
                    onChange={(e) => updateConfig('dimensions', { ...config.dimensions, width: parseInt(e.target.value) })}
                    className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none ${inputClass}`} 
                  />
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs opacity-70">高度 (H)</span>
                  <input 
                    type="number" 
                    value={config.dimensions?.height || 1080}
                    onChange={(e) => updateConfig('dimensions', { ...config.dimensions, height: parseInt(e.target.value) })}
                    className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none ${inputClass}`} 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <span className="text-xs opacity-70">顶部范围限制</span>
                  <input 
                    type="number" 
                    value={config.chatLayout?.paddingTop || 48}
                    onChange={(e) => updateChatLayout('paddingTop', parseInt(e.target.value))}
                    className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none ${inputClass}`} 
                    title="气泡向上滚动的最高范围"
                  />
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs opacity-70">底部气泡位置</span>
                  <input 
                    type="number" 
                    value={config.chatLayout?.paddingBottom || 120}
                    onChange={(e) => updateChatLayout('paddingBottom', parseInt(e.target.value))}
                    className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none ${inputClass}`} 
                    title="新气泡出现的高度范围，越大越靠上"
                  />
                </div>
              </div>
            </div>

            {/* Background */}
            <div className="space-y-3">
              <label className={`flex items-center gap-2 text-sm font-medium border-b pb-1 ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                <ImageIcon size={14} /> 背景设置
              </label>
              <div className="space-y-1.5">
                <span className="text-xs opacity-70">背景图 URL / 本地路径</span>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={config.background?.image || ''}
                    onChange={(e) => updateBackground('image', e.target.value)}
                    className={`flex-1 w-full border rounded-md px-3 py-2 text-xs focus:outline-none ${inputClass}`} 
                  />
                  {onSelectImage && (
                    <button 
                      onClick={async () => {
                        const path = await onSelectImage();
                        if (path) updateBackground('image', path);
                      }}
                      className={`px-3 border rounded-md flex items-center justify-center transition-colors ${isDarkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-300 hover:bg-gray-100'}`}
                      title="选择本地图片"
                    >
                      <FolderOpen size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
                    </button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs opacity-70">模糊程度</span>
                    <span className="text-xs text-blue-500 font-mono bg-blue-500/10 px-1.5 py-0.5 rounded">{config.background?.blur || 0}px</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" max="50" 
                    value={config.background?.blur || 0}
                    onChange={(e) => updateBackground('blur', parseInt(e.target.value))}
                    className="w-full accent-blue-500" 
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs opacity-70">亮度滤镜</span>
                    <span className="text-xs text-blue-500 font-mono bg-blue-500/10 px-1.5 py-0.5 rounded">{Math.round((config.background?.brightness ?? 1) * 100)}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.1" max="2.0" step="0.1"
                    value={config.background?.brightness ?? 1.0}
                    onChange={(e) => updateBackground('brightness', parseFloat(e.target.value))}
                    className="w-full accent-blue-500" 
                  />
                </div>
              </div>
            </div>

            {/* Speakers */}
            <div className="space-y-3">
              <div className={`flex items-center justify-between border-b pb-1 ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                <label className="flex items-center gap-2 text-sm font-medium">
                  <Users size={14} /> 说话人配置
                </label>
                <button 
                  onClick={handleAddSpeaker}
                  className="text-xs text-blue-500 hover:text-blue-400 flex items-center gap-1"
                >
                  <Plus size={12} /> 添加
                </button>
              </div>
              
              <div className="space-y-3">
                {Object.entries(config.speakers).map(([key, speaker]: [string, any]) => (
                  <div key={key} className={`p-4 rounded-xl border space-y-4 shadow-sm ${cardBgClass}`}>
                    
                    {/* Header & Base Settings */}
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <span className={`font-bold px-2 py-0.5 rounded text-xs ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'}`}>{key} (角色)</span>
                        <div className="flex items-center gap-2">
                          <input 
                            type="text" 
                            value={speaker.name}
                            className={`bg-transparent border-b focus:border-blue-500 focus:outline-none w-20 text-right text-sm ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}
                            onChange={(e) => {
                              const newSpeakers = { ...config.speakers };
                              newSpeakers[key].name = e.target.value;
                              updateConfig('speakers', newSpeakers);
                            }}
                          />
                          <button 
                            onClick={() => handleRemoveSpeaker(key)}
                            disabled={Object.keys(config.speakers).length <= 1}
                            className={`p-1 rounded ${Object.keys(config.speakers).length <= 1 ? 'opacity-30 cursor-not-allowed' : 'text-red-500 hover:bg-red-500/10'}`}
                            title="删除角色"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 items-center">
                        <img 
                          src={speaker.avatar} 
                          alt="avatar" 
                          referrerPolicy="no-referrer"
                          className={`w-8 h-8 rounded-full border shadow-sm object-cover shrink-0 ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'}`}
                          onError={(e) => {
                            e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${speaker.name}`;
                          }}
                        />
                        <div className="flex-1 space-y-1">
                          <span className="text-[10px] uppercase tracking-wider opacity-70 block">头像 (Avatar URL/Path)</span>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              value={speaker.avatar}
                              onChange={(e) => {
                                const newSpeakers = { ...config.speakers };
                                newSpeakers[key].avatar = e.target.value;
                                updateConfig('speakers', newSpeakers);
                              }}
                              className={`flex-1 w-full border rounded px-2 py-1 text-xs focus:outline-none ${inputClass}`}
                            />
                            {onSelectImage && (
                              <button 
                                onClick={async () => {
                                  const path = await onSelectImage();
                                  if (path) {
                                    const newSpeakers = { ...config.speakers };
                                    newSpeakers[key].avatar = path;
                                    updateConfig('speakers', newSpeakers);
                                  }
                                }}
                                className={`px-2 border rounded flex items-center justify-center transition-colors ${isDarkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-300 hover:bg-gray-100'}`}
                                title="选择本地图片"
                              >
                                <FolderOpen size={14} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <hr className={isDarkMode ? 'border-gray-700' : 'border-gray-200'} />

                    {/* Font Settings */}
                    <div className="space-y-2">
                      <span className="text-xs font-semibold flex items-center gap-1 opacity-80"><Type size={12} /> 字体与排版</span>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase tracking-wider opacity-70">字体 (Font)</span>
                          <input 
                            type="text" 
                            placeholder="system-ui"
                            value={speaker.style?.fontFamily || ''}
                            onChange={(e) => updateSpeakerStyle(key, 'fontFamily', e.target.value)}
                            className={`w-full border rounded px-2 py-1.5 text-xs focus:outline-none ${inputClass}`}
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase tracking-wider opacity-70">字号 (Size)</span>
                          <input 
                            type="number" 
                            value={speaker.style?.fontSize ?? 20}
                            onChange={(e) => updateSpeakerStyle(key, 'fontSize', parseInt(e.target.value))}
                            className={`w-full border rounded px-2 py-1.5 text-xs focus:outline-none ${inputClass}`}
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase tracking-wider opacity-70">粗细 (Weight)</span>
                          <select 
                            value={speaker.style?.fontWeight || 'normal'}
                            onChange={(e) => updateSpeakerStyle(key, 'fontWeight', e.target.value)}
                            className={`w-full border rounded px-2 py-1.5 text-xs focus:outline-none ${inputClass}`}
                          >
                            <option value="normal">常规 (Normal)</option>
                            <option value="bold">加粗 (Bold)</option>
                            <option value="bolder">更粗 (Bolder)</option>
                            <option value="lighter">较细 (Lighter)</option>
                            <option value="100">100</option>
                            <option value="300">300</option>
                            <option value="500">500</option>
                            <option value="700">700</option>
                            <option value="900">900</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase tracking-wider opacity-70">气泡位置 (Side)</span>
                          <select 
                            value={speaker.side}
                            onChange={(e) => {
                              const newSpeakers = { ...config.speakers };
                              newSpeakers[key].side = e.target.value;
                              updateConfig('speakers', newSpeakers);
                            }}
                            className={`w-full border rounded px-2 py-1.5 text-xs focus:outline-none ${inputClass}`}
                          >
                            <option value="left">左侧 (Left)</option>
                            <option value="right">右侧 (Right)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <hr className={isDarkMode ? 'border-gray-700' : 'border-gray-200'} />

                    {/* Colors & Background */}
                    <div className="space-y-2">
                      <span className="text-xs font-semibold flex items-center gap-1 opacity-80"><div className="w-3 h-3 rounded-full bg-blue-500 flex items-center justify-center border shadow-sm"></div> 色彩与背景</span>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 bg-black/5 p-1.5 rounded">
                          <input 
                            type="color" 
                            value={speaker.style?.bgColor || '#3b82f6'}
                            onChange={(e) => updateSpeakerStyle(key, 'bgColor', e.target.value)}
                            className="w-6 h-6 rounded cursor-pointer border-0 p-0 bg-transparent shrink-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded shadow-sm"
                          />
                          <span className="text-[10px] uppercase tracking-wider font-mono">背景 (Bg)</span>
                        </div>
                        <div className="flex items-center gap-2 bg-black/5 p-1.5 rounded">
                          <input 
                            type="color" 
                            value={speaker.style?.textColor || '#ffffff'}
                            onChange={(e) => updateSpeakerStyle(key, 'textColor', e.target.value)}
                            className="w-6 h-6 rounded cursor-pointer border-0 p-0 bg-transparent shrink-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded shadow-sm"
                          />
                          <span className="text-[10px] uppercase tracking-wider font-mono">文字 (Text)</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-2 pt-1">
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase tracking-wider opacity-70">透明度 (Bg Opacity)</span>
                          <div className="flex items-center gap-2">
                            <input 
                              type="range" min="0" max="1" step="0.05"
                              value={speaker.style?.opacity ?? 0.9}
                              onChange={(e) => updateSpeakerStyle(key, 'opacity', parseFloat(e.target.value))}
                              className="w-full accent-blue-500"
                            />
                            <span className="text-[10px] w-6 text-right font-mono">{speaker.style?.opacity ?? 0.9}</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase tracking-wider opacity-70">高斯模糊 (Bg Blur)</span>
                          <div className="flex items-center gap-2">
                            <input 
                              type="range" min="0" max="20" step="1"
                              value={speaker.style?.blur ?? 4}
                              onChange={(e) => updateSpeakerStyle(key, 'blur', parseInt(e.target.value))}
                              className="w-full accent-blue-500"
                            />
                            <span className="text-[10px] w-6 text-right font-mono">{speaker.style?.blur ?? 4}px</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <hr className={isDarkMode ? 'border-gray-700' : 'border-gray-200'} />

                    {/* Borders */}
                    <div className="space-y-2">
                      <span className="text-xs font-semibold flex items-center gap-1 opacity-80"><Box size={12} /> 边框效果</span>
                      
                      <div className="flex items-center gap-2 bg-black/5 p-1.5 rounded mb-2">
                        <input 
                          type="color" 
                          value={speaker.style?.borderColor || '#ffffff'}
                          onChange={(e) => updateSpeakerStyle(key, 'borderColor', e.target.value)}
                          className="w-6 h-6 rounded cursor-pointer border-0 p-0 bg-transparent shrink-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded shadow-sm"
                        />
                        <span className="text-[10px] uppercase tracking-wider font-mono">边框颜色 (Border Color)</span>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase tracking-wider opacity-70">粗细 (Border Width)</span>
                          <input 
                            type="number" min="0" max="10"
                            value={speaker.style?.borderWidth ?? 0}
                            onChange={(e) => updateSpeakerStyle(key, 'borderWidth', parseInt(e.target.value))}
                            className={`w-full border rounded px-2 py-1.5 text-xs focus:outline-none ${inputClass}`}
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase tracking-wider opacity-70">圆角 (Border Radius)</span>
                          <input 
                            type="number" min="0" max="64"
                            value={speaker.style?.borderRadius ?? 32}
                            onChange={(e) => updateSpeakerStyle(key, 'borderRadius', parseInt(e.target.value))}
                            className={`w-full border rounded px-2 py-1.5 text-xs focus:outline-none ${inputClass}`}
                          />
                        </div>
                        <div className="space-y-1 col-span-2">
                          <span className="text-[10px] uppercase tracking-wider opacity-70">边框透明度 (Border Opacity)</span>
                          <div className="flex items-center gap-2">
                            <input 
                              type="range" min="0" max="1" step="0.05"
                              value={speaker.style?.borderOpacity ?? 1.0}
                              onChange={(e) => updateSpeakerStyle(key, 'borderOpacity', parseFloat(e.target.value))}
                              className="w-full accent-blue-500"
                            />
                            <span className="text-[10px] w-6 text-right font-mono">{speaker.style?.borderOpacity ?? 1.0}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <hr className={isDarkMode ? 'border-gray-700' : 'border-gray-200'} />

                    {/* Layout */}
                    <div className="space-y-2">
                      <span className="text-xs font-semibold flex items-center gap-1 opacity-80"><Layout size={12} /> 布局与缩放</span>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase tracking-wider opacity-70">左右内距 (Padding X)</span>
                          <input 
                            type="number" 
                            value={speaker.style?.paddingX ?? 24}
                            onChange={(e) => updateSpeakerStyle(key, 'paddingX', parseInt(e.target.value))}
                            className={`w-full border rounded px-2 py-1 text-xs focus:outline-none ${inputClass}`}
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase tracking-wider opacity-70">上下内距 (Padding Y)</span>
                          <input 
                            type="number" 
                            value={speaker.style?.paddingY ?? 16}
                            onChange={(e) => updateSpeakerStyle(key, 'paddingY', parseInt(e.target.value))}
                            className={`w-full border rounded px-2 py-1 text-xs focus:outline-none ${inputClass}`}
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase tracking-wider opacity-70">底部外边距 (Margin)</span>
                          <input 
                            type="number" 
                            value={speaker.style?.margin ?? 16}
                            onChange={(e) => updateSpeakerStyle(key, 'margin', parseInt(e.target.value))}
                            className={`w-full border rounded px-2 py-1 text-xs focus:outline-none ${inputClass}`}
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase tracking-wider opacity-70">整体缩放 (Scale)</span>
                          <input 
                            type="number" step="0.1" min="0.1" max="5.0"
                            value={speaker.style?.scale ?? 1.0}
                            onChange={(e) => updateSpeakerStyle(key, 'scale', parseFloat(e.target.value))}
                            className={`w-full border rounded px-2 py-1 text-xs focus:outline-none ${inputClass}`}
                          />
                        </div>
                      </div>
                    </div>

                    <hr className={isDarkMode ? 'border-gray-700' : 'border-gray-200'} />
                    
                                        {/* Presets Action */}
                    <div className="flex justify-between items-center pt-1 gap-2">
                      <div className="flex-1 flex items-center gap-1">
                        <select 
                          value={speaker.preset || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            const newSpeakers = { ...config.speakers };
                            if (val) {
                              const presetStyle = presets[val];
                              if (presetStyle) {
                                newSpeakers[key].style = { ...newSpeakers[key].style, ...presetStyle };
                              }
                            }
                            newSpeakers[key].preset = val;
                            updateConfig('speakers', newSpeakers);
                          }}
                          className={`flex-1 border rounded px-1 py-1 text-xs focus:outline-none w-full ${inputClass}`}
                        >
                          <option value="">{speaker.preset ? "自定义..." : "应用预设样式..."}</option>
                          {Object.keys(presets).map(p => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                        {speaker.preset && presets[speaker.preset] && (
                          <button
                            onClick={() => {
                              if (window.confirm(`确定要删除预设 "${speaker.preset}" 吗？这不会影响已经应用该预设的角色，但预设列表里将不再有它。`)) {
                                handleRemovePreset(speaker.preset);
                              }
                            }}
                            className={`p-1 rounded text-red-500 hover:bg-red-500/10 transition-colors shrink-0`}
                            title="删除此预设"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                      <button 
                        onClick={() => {
                          setPresetPromptKey(key);
                          setPresetNameInput(`${key} 的样式`);
                        }}
                        className={`text-xs px-2 py-1 rounded transition-colors shrink-0 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                      >
                        保存为预设
                      </button>
                    </div>
                    {presetPromptKey === key && (
                      <div className={`mt-2 p-2 rounded border flex gap-2 items-center ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'}`}>
                        <input 
                          type="text" 
                          value={presetNameInput}
                          onChange={(e) => setPresetNameInput(e.target.value)}
                          placeholder="输入预设名称"
                          className={`flex-1 text-xs px-2 py-1 rounded focus:outline-none ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'}`}
                          autoFocus
                        />
                        <button 
                          onClick={() => {
                            if (!presetNameInput.trim()) return;
                            const existingStr = localStorage.getItem('podchat_presets');
                            const existing = existingStr ? JSON.parse(existingStr) : {};
                            existing[presetNameInput.trim()] = speaker.style;
                            localStorage.setItem('podchat_presets', JSON.stringify(existing));
                            window.dispatchEvent(new Event('podchat_presets_updated'));
                            showToast(`预设 "${presetNameInput.trim()}" 已保存`);
                            setPresetPromptKey(null);
                          }}
                          className="text-xs px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-500"
                        >
                          确认
                        </button>
                        <button 
                          onClick={() => setPresetPromptKey(null)}
                          className={`text-xs px-2 py-1 rounded ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                        >
                          取消
                        </button>
                      </div>
                    )}

                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
