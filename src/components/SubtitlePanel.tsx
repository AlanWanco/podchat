import { FileText, Clock, MousePointer2, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { SubtitleItem } from '../hooks/useAssSubtitle';

interface SubtitlePanelProps {
  subtitles: SubtitleItem[];
  currentTime: number;
  isDarkMode: boolean;
  onSeek: (time: number) => void;
  onUpdateSubtitle: (id: string, updates: Partial<SubtitleItem>) => void;
  editingSub?: { id: string, start: number, end: number, text: string } | null;
  setEditingSub?: (sub: { id: string, start: number, end: number, text: string } | null) => void;
}

export function SubtitlePanel({ subtitles, currentTime, isDarkMode, onSeek, onUpdateSubtitle, editingSub, setEditingSub }: SubtitlePanelProps) {
  const [inlineEditingId, setInlineEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ start: string; end: string; text: string }>({ start: '', end: '', text: '' });
  
  // Find current or most recently active subtitle
  let activeSubId: string | undefined;
  for (let i = subtitles.length - 1; i >= 0; i--) {
    if (currentTime >= subtitles[i].start) {
      activeSubId = subtitles[i].id;
      break;
    }
  }

  useEffect(() => {
    if (activeSubId && !inlineEditingId) {
      const el = document.getElementById(`sub-${activeSubId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeSubId, inlineEditingId]);

  const bgClass = isDarkMode ? "bg-gray-900 border-gray-800 text-gray-300" : "bg-white border-gray-200 text-gray-700";
  const headerClass = isDarkMode ? "bg-gray-950 border-gray-800 text-white" : "bg-gray-50 border-gray-200 text-gray-900";
  const activeClass = isDarkMode ? "bg-blue-900/40 border-blue-500/50" : "bg-blue-50 border-blue-300";
  const hoverClass = isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100";
  const cardBg = isDarkMode ? "bg-gray-800/50 border-gray-800/50" : "bg-white border-gray-200";

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const startInlineEdit = (sub: SubtitleItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setInlineEditingId(sub.id);
    setEditForm({ start: sub.start.toString(), end: sub.end.toString(), text: sub.text });
  };

  const toggleRegionEdit = (sub: SubtitleItem, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (editingSub?.id === sub.id) {
      if (setEditingSub) setEditingSub(null); // toggle off
    } else {
      if (setEditingSub) setEditingSub({ id: sub.id, start: sub.start, end: sub.end, text: sub.text });
    }
  };

  // const cancelInlineEdit = (e: React.MouseEvent) => {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   setInlineEditingId(null);
  // };

  // const saveInlineEdit = (e: React.MouseEvent, id: string) => {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   
  //   if (inlineEditValue.trim()) {
  //     onUpdateSubtitle(id, { text: inlineEditValue });
  //   }
  //   setInlineEditingId(null);
  // };

  const saveInlineEdit = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const newStart = parseFloat(editForm.start);
    const newEnd = parseFloat(editForm.end);
    
    if (isNaN(newStart) || isNaN(newEnd)) {
      return;
    }

    onUpdateSubtitle(id, {
      start: newStart,
      end: newEnd,
      duration: Number((newEnd - newStart).toFixed(2)),
      text: editForm.text
    });
    
    setInlineEditingId(null);
  };

  // Global shortcut to finish Region Edit with Enter
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && editingSub && !inlineEditingId) {
        e.preventDefault();
        if (setEditingSub) setEditingSub(null);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [editingSub, inlineEditingId, setEditingSub]);

  return (
    <div className={`h-full flex flex-col overflow-hidden ${bgClass}`}>
      <div className={`p-4 border-b flex items-center justify-between shrink-0 ${headerClass}`}>
        <h2 className="font-bold flex items-center gap-2 text-sm">
          <FileText size={16} /> 实时字幕序列
        </h2>
        <div className="text-xs opacity-60">共 {subtitles.length} 条</div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar space-y-2">
        {subtitles.length === 0 ? (
          <div className="p-8 text-center text-xs opacity-50">加载中或无数据...</div>
        ) : (
          subtitles.map((sub) => {
            const isActive = currentTime >= sub.start && currentTime <= sub.end;
            const isInlineEditing = inlineEditingId === sub.id;
            const isRegionEditing = editingSub?.id === sub.id;

            return (
              <div 
                key={sub.id}
                id={`sub-${sub.id}`}
                onClick={() => !isInlineEditing && onSeek(sub.start)}
                onDoubleClick={(e) => {
                  if (!isInlineEditing) startInlineEdit(sub, e);
                }}
                className={`p-3 rounded-lg border text-xs transition-all duration-200 relative group
                  ${isInlineEditing ? (isDarkMode ? 'bg-gray-800 border-blue-500' : 'bg-gray-50 border-blue-400') : 
                   isRegionEditing ? (isDarkMode ? 'bg-gray-800 border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.2)]' : 'bg-green-50 border-green-400 shadow-sm') :
                   (isActive ? activeClass : `${cardBg} ${hoverClass} cursor-pointer`)}
                `}
              >
                {!isInlineEditing && (
                  <>
                    <div className="flex justify-between items-center mb-2 opacity-70 relative">
                      <div className="flex items-center gap-1 font-mono text-[10px]">
                        <Clock size={10} />
                        <span>{formatTime(sub.start)} - {formatTime(sub.end)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="bg-gray-500/20 px-1.5 py-0.5 rounded text-[10px]">
                          {sub.duration}s
                        </span>
                        
                        <button 
                          onClick={(e) => toggleRegionEdit(sub, e)}
                          onDoubleClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                          className={`z-20 px-2 py-0.5 rounded text-[10px] flex items-center gap-1 transition-all cursor-pointer
                            ${isRegionEditing 
                              ? 'opacity-100 bg-green-500 hover:bg-green-600 text-white shadow-md' 
                              : `opacity-0 group-hover:opacity-100 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-white hover:bg-gray-100 text-gray-600 shadow-sm border border-gray-200'}`
                            }
                          `}
                          title={isRegionEditing ? "完成调整 (按 Enter 键完成)" : "在时间轴调整时长"}
                        >
                          {isRegionEditing ? <Check size={10} /> : <MousePointer2 size={10} />}
                          {isRegionEditing ? "完成 (Enter)" : "调整时长"}
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] self-start shrink-0 font-bold ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'}`}>
                        {sub.actor || sub.style}
                      </span>
                      <p className="leading-relaxed line-clamp-3 whitespace-pre-wrap">{sub.text}</p>
                    </div>
                  </>
                )}
                
                {isInlineEditing && (
                  <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 font-mono text-[10px]">
                        <Clock size={10} />
                        <input
                          type="number"
                          step="0.1"
                          value={editForm.start}
                          onChange={(e) => setEditForm({...editForm, start: e.target.value})}
                          className={`w-16 px-1 py-0.5 rounded border text-xs focus:outline-none focus:border-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                        />
                        <span>-</span>
                        <input
                          type="number"
                          step="0.1"
                          value={editForm.end}
                          onChange={(e) => setEditForm({...editForm, end: e.target.value})}
                          className={`w-16 px-1 py-0.5 rounded border text-xs focus:outline-none focus:border-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                        />
                      </div>
                    </div>
                    
                    <textarea
                      value={editForm.text}
                      onChange={(e) => setEditForm({...editForm, text: e.target.value})}
                      className={`w-full p-2 rounded border text-xs min-h-[60px] resize-y focus:outline-none focus:border-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                          saveInlineEdit(sub.id, e as unknown as React.MouseEvent);
                        } else if (e.key === 'Escape') {
                          setInlineEditingId(null);
                        }
                      }}
                    />
                    
                    <div className="flex justify-end gap-2 mt-1">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setInlineEditingId(null);
                        }}
                        className={`px-3 py-1 rounded text-[10px] transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
                      >
                        取消 (Esc)
                      </button>
                      <button
                        onClick={(e) => saveInlineEdit(sub.id, e)}
                        className="px-3 py-1 rounded text-[10px] bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                      >
                        保存 (Ctrl+Enter)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
