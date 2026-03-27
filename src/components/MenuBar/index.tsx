import React, { useState } from 'react';
import { Save, FolderOpen, Plus, Download, Settings, ChevronDown, Music, Subtitles, XCircle } from 'lucide-react';

interface MenuBarProps {
  isDarkMode: boolean;
  projectPath: string | null;
  projectName: string;
  onNewProject: () => void;
  onOpenProject: () => void;
  onSaveProject: () => void;
  onSetAudio: () => void;
  onSetSubtitle: () => void;
  onCloseProject: () => void;
  onExportVideo: () => void;
  onExportConfig: () => void;
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
}

export function MenuBar({
  isDarkMode,
  projectPath,
  onNewProject,
  onOpenProject,
  onSaveProject,
  onSetAudio,
  onSetSubtitle,
  onCloseProject,
  onExportVideo,
  onExportConfig,
  showSettings,
  setShowSettings
}: MenuBarProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const bgClass = isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200';
  const textClass = isDarkMode ? 'text-gray-300' : 'text-gray-600';
  const hoverClass = isDarkMode ? 'hover:bg-gray-800 hover:text-white' : 'hover:bg-gray-100 hover:text-gray-900';
  const activeClass = isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900';
  const menuDropdownBg = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';

  // Handle click outside to close menus
  React.useEffect(() => {
    const handleClickOutside = () => setActiveMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const toggleMenu = (e: React.MouseEvent, menu: string) => {
    e.stopPropagation();
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  const executeAction = (action: () => void) => {
    setActiveMenu(null);
    action();
  };

  return (
    <div className={`h-10 border-b flex items-center justify-between px-2 shrink-0 z-50 relative ${bgClass} ${textClass}`}>
      <div className="flex items-center gap-1">
        {/* App Title */}
        <div className="font-bold px-3 py-1 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-500"></span>
          PodChat Studio
        </div>

        {/* File Menu */}
        <div className="relative">
          <button 
            onClick={(e) => toggleMenu(e, 'file')}
            className={`px-3 py-1 text-sm rounded transition-colors ${activeMenu === 'file' ? activeClass : hoverClass}`}
          >
            文件
          </button>
          
          {activeMenu === 'file' && (
            <div className={`absolute top-full left-0 mt-1 w-48 rounded shadow-xl border py-1 z-50 ${menuDropdownBg}`}>
              <button onClick={() => executeAction(onNewProject)} className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${hoverClass}`}>
                <Plus size={14} /> 新建项目...
              </button>
              <button onClick={() => executeAction(onOpenProject)} className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${hoverClass}`}>
                <FolderOpen size={14} /> 打开项目...
              </button>
              <div className={`my-1 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}></div>
              <button 
                onClick={() => executeAction(onSetAudio)} 
                disabled={!projectPath}
                className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${hoverClass} ${!projectPath && 'opacity-50 cursor-not-allowed'}`}
              >
                <Music size={14} /> 导入音频文件...
              </button>
              <button 
                onClick={() => executeAction(onSetSubtitle)} 
                disabled={!projectPath}
                className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${hoverClass} ${!projectPath && 'opacity-50 cursor-not-allowed'}`}
              >
                <Subtitles size={14} /> 导入字幕文件...
              </button>
              <div className={`my-1 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}></div>
              <button 
                onClick={() => executeAction(onSaveProject)} 
                disabled={!projectPath}
                className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${hoverClass} ${!projectPath && 'opacity-50 cursor-not-allowed'}`}
              >
                <Save size={14} /> 保存项目 (Ctrl+S)
              </button>
              <button 
                onClick={() => executeAction(onCloseProject)} 
                disabled={!projectPath}
                className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 text-red-500 hover:bg-red-500/10 ${!projectPath && 'opacity-50 cursor-not-allowed'}`}
              >
                <XCircle size={14} /> 关闭项目
              </button>
            </div>
          )}
        </div>

        {/* Export Menu */}
        <div className="relative">
          <button 
            onClick={(e) => toggleMenu(e, 'export')}
            className={`px-3 py-1 text-sm rounded transition-colors flex items-center gap-1 ${activeMenu === 'export' ? activeClass : hoverClass}`}
          >
            导出 <ChevronDown size={12} />
          </button>
          
          {activeMenu === 'export' && (
            <div className={`absolute top-full left-0 mt-1 w-48 rounded shadow-xl border py-1 z-50 ${menuDropdownBg}`}>
              <button onClick={() => executeAction(onExportConfig)} className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${hoverClass}`}>
                <Download size={14} /> 导出配置文件
              </button>
              <button onClick={() => executeAction(onExportVideo)} className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 text-blue-500 hover:text-blue-400 ${hoverClass}`}>
                <Download size={14} /> 渲染并导出视频...
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className={`flex items-center gap-1.5 px-3 py-1 text-sm rounded transition-colors ${showSettings ? activeClass : hoverClass}`}
        >
          <Settings size={14} />
          设置
        </button>
      </div>

      {/* Center Display - Project Path */}
      {projectPath && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-[40%] px-4 pointer-events-none">
          <div 
            className={`text-xs truncate text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} 
            title={projectPath}
          >
            {projectPath}
          </div>
        </div>
      )}
    </div>
  );
}
