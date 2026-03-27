import re

with open('src/components/SubtitlePanel.tsx', 'r') as f:
    text = f.read()

# 1. Update Props
props_old = """  onUpdateSubtitle: (id: string, updates: Partial<SubtitleItem>) => void;
}"""
props_new = """  onUpdateSubtitle: (id: string, updates: Partial<SubtitleItem>) => void;
  editingSub?: { id: string, start: number, end: number, text: string } | null;
  setEditingSub?: (sub: { id: string, start: number, end: number, text: string } | null) => void;
}"""
text = text.replace(props_old, props_new)

sig_old = "export function SubtitlePanel({ subtitles, currentTime, isDarkMode, onSeek, onUpdateSubtitle }: SubtitlePanelProps) {"
sig_new = "export function SubtitlePanel({ subtitles, currentTime, isDarkMode, onSeek, onUpdateSubtitle, editingSub, setEditingSub }: SubtitlePanelProps) {"
text = text.replace(sig_old, sig_new)

# 2. Re-wire editing logic to use editingSub instead of local editingId/editForm
local_state_old = """  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ start: string; end: string; text: string }>({ start: '', end: '', text: '' });"""
local_state_new = """  // Fallback local state if props aren't provided (for safety)
  const [localEditingId, setLocalEditingId] = useState<string | null>(null);
  const [localEditForm, setLocalEditForm] = useState<{ start: string; end: string; text: string }>({ start: '', end: '', text: '' });
  
  const editingId = editingSub ? editingSub.id : localEditingId;
  const editForm = editingSub ? { start: editingSub.start.toFixed(2), end: editingSub.end.toFixed(2), text: editingSub.text } : localEditForm;
"""
text = text.replace(local_state_old, local_state_new)

handlers_old = """  const startEdit = (sub: SubtitleItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(sub.id);
    setEditForm({
      start: sub.start.toString(),
      end: sub.end.toString(),
      text: sub.text
    });
  };

  const cancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const saveEdit = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStart = parseFloat(editForm.start);
    const newEnd = parseFloat(editForm.end);
    
    if (isNaN(newStart) || isNaN(newEnd)) {
      alert('时间必须是有效数字');
      return;
    }

    onUpdateSubtitle(id, {
      start: newStart,
      end: newEnd,
      duration: Number((newEnd - newStart).toFixed(2)),
      text: editForm.text
    });
    setEditingId(null);
  };"""

handlers_new = """  const startEdit = (sub: SubtitleItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (setEditingSub) {
      setEditingSub({ id: sub.id, start: sub.start, end: sub.end, text: sub.text });
    } else {
      setLocalEditingId(sub.id);
      setLocalEditForm({ start: sub.start.toString(), end: sub.end.toString(), text: sub.text });
    }
  };

  const cancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (setEditingSub) setEditingSub(null);
    else setLocalEditingId(null);
  };

  const saveEdit = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
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
    
    if (setEditingSub) setEditingSub(null);
    else setLocalEditingId(null);
  };

  const updateEditForm = (updates: Partial<{ start: string; end: string; text: string }>) => {
    if (setEditingSub && editingSub) {
      setEditingSub({ 
        ...editingSub, 
        start: updates.start !== undefined ? parseFloat(updates.start) || 0 : editingSub.start,
        end: updates.end !== undefined ? parseFloat(updates.end) || 0 : editingSub.end,
        text: updates.text !== undefined ? updates.text : editingSub.text
      });
    } else {
      setLocalEditForm(prev => ({ ...prev, ...updates }));
    }
  };"""
text = text.replace(handlers_old, handlers_new)

# Update JSX inputs
ui_old = """                      <input 
                        type="number" 
                        step="0.1"
                        value={editForm.start}
                        onChange={(e) => setEditForm({...editForm, start: e.target.value})}
                        className={`w-16 px-1.5 py-0.5 rounded border focus:outline-none ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'}`}
                        title="开始时间"
                      />
                      <span className="opacity-50">-</span>
                      <input 
                        type="number" 
                        step="0.1"
                        value={editForm.end}
                        onChange={(e) => setEditForm({...editForm, end: e.target.value})}
                        className={`w-16 px-1.5 py-0.5 rounded border focus:outline-none ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'}`}
                        title="结束时间"
                      />
                    </div>
                    <textarea 
                      value={editForm.text}
                      onChange={(e) => setEditForm({...editForm, text: e.target.value})}"""
ui_new = """                      <input 
                        type="number" 
                        step="0.1"
                        value={editForm.start}
                        onChange={(e) => updateEditForm({start: e.target.value})}
                        className={`w-16 px-1.5 py-0.5 rounded border focus:outline-none ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'}`}
                        title="开始时间"
                      />
                      <span className="opacity-50">-</span>
                      <input 
                        type="number" 
                        step="0.1"
                        value={editForm.end}
                        onChange={(e) => updateEditForm({end: e.target.value})}
                        className={`w-16 px-1.5 py-0.5 rounded border focus:outline-none ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'}`}
                        title="结束时间"
                      />
                    </div>
                    <textarea 
                      value={editForm.text}
                      onChange={(e) => updateEditForm({text: e.target.value})}"""
text = text.replace(ui_old, ui_new)

with open('src/components/SubtitlePanel.tsx', 'w') as f:
    f.write(text)

print("Patched SubtitlePanel")
