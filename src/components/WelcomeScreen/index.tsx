import { FolderOpen, Plus, FileVideo, Clock } from 'lucide-react';

interface WelcomeScreenProps {
  onNewProject: () => void;
  onOpenProject: () => void;
  onOpenRecent?: () => void;
  recentProject?: string | null;
  isDarkMode: boolean;
}

export function WelcomeScreen({ onNewProject, onOpenProject, onOpenRecent, recentProject, isDarkMode }: WelcomeScreenProps) {
  const bgClass = isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900';
  const cardBg = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const hoverCardBg = isDarkMode ? 'hover:bg-gray-700 hover:border-gray-600' : 'hover:bg-gray-50 hover:border-blue-400';
  const iconBg = isDarkMode ? 'bg-gray-700 text-blue-400' : 'bg-blue-50 text-blue-600';

  return (
    <div className={`w-full h-screen flex flex-col items-center justify-center ${bgClass}`}>
      <div className="mb-12 flex flex-col items-center">
        <div className="w-20 h-20 rounded-2xl bg-blue-600 flex items-center justify-center mb-6 shadow-xl shadow-blue-500/20">
          <FileVideo size={40} className="text-white" />
        </div>
        <h1 className="text-4xl font-bold mb-3 tracking-tight">PodChat Studio</h1>
        <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          播客/对话转视频可视化编辑器
        </p>
      </div>

      <div className="flex flex-col gap-6 max-w-2xl w-full px-8">
        <div className="flex gap-6 w-full">
          <button 
            onClick={onNewProject}
            className={`flex-1 flex flex-col items-center p-8 rounded-2xl border-2 border-transparent transition-all duration-300 group shadow-lg ${cardBg} ${hoverCardBg}`}
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${iconBg}`}>
              <Plus size={28} />
            </div>
            <h2 className="text-xl font-semibold mb-2">新建项目</h2>
            <p className={`text-sm text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              从零开始创建一个新的对话视频项目，配置音频和字幕文件
            </p>
          </button>

          <button 
            onClick={onOpenProject}
            className={`flex-1 flex flex-col items-center p-8 rounded-2xl border-2 border-transparent transition-all duration-300 group shadow-lg ${cardBg} ${hoverCardBg}`}
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${iconBg}`}>
              <FolderOpen size={28} />
            </div>
            <h2 className="text-xl font-semibold mb-2">打开项目</h2>
            <p className={`text-sm text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              读取之前保存的 .json 配置文件继续编辑
            </p>
          </button>
        </div>

        {recentProject && onOpenRecent && (
          <div className="mt-4">
            <h3 className={`text-sm font-medium mb-3 ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>最近打开</h3>
            <button 
              onClick={onOpenRecent}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 group shadow-sm ${cardBg} ${hoverCardBg}`}
            >
              <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <Clock size={20} className={isDarkMode ? 'text-gray-300' : 'text-gray-600'} />
              </div>
              <div className="flex flex-col items-start overflow-hidden flex-1">
                <span className="font-medium text-sm">继续上次编辑</span>
                <span className={`text-xs truncate w-full text-left mt-0.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} title={recentProject}>
                  {recentProject}
                </span>
              </div>
            </button>
          </div>
        )}
      </div>
      
      {!window.electron && (
        <div className="mt-12 px-4 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-lg text-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          当前运行在网页模式，项目管理功能受限。推荐使用 Electron 客户端。
        </div>
      )}
    </div>
  );
}
