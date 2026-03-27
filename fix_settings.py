import re

with open('src/components/SettingsPanel.tsx', 'r') as f:
    text = f.read()

# 1. Update Props
props_old = """  onClose: () => void;
  onSave: () => void;
}"""
props_new = """  onClose: () => void;
  onSave: () => void;
  showToast: (msg: string) => void;
}"""
text = text.replace(props_old, props_new)

sig_old = """  onClose, onSave 
}: SettingsPanelProps) {"""
sig_new = """  onClose, onSave, showToast
}: SettingsPanelProps) {"""
text = text.replace(sig_old, sig_new)

# 2. Add Prompt State
state_hook = """  const [presets, setPresets] = useState<Record<string, any>>(() => {
    const saved = localStorage.getItem('podchat_presets');
    return saved ? JSON.parse(saved) : {};
  });
  const [presetPromptKey, setPresetPromptKey] = useState<string | null>(null);
  const [presetNameInput, setPresetNameInput] = useState("");"""
text = text.replace("  const [presets, setPresets] = useState<Record<string, any>>(() => {\n    const saved = localStorage.getItem('podchat_presets');\n    return saved ? JSON.parse(saved) : {};\n  });", state_hook)

# 3. Fix Preset Save Action
preset_old = """                      <button 
                        onClick={() => {
                          const existingStr = localStorage.getItem('podchat_presets');
                          const existing = existingStr ? JSON.parse(existingStr) : {};
                          const presetName = prompt('请输入预设名称:', `${key} 的样式`);
                          if (presetName) {
                            existing[presetName] = speaker.style;
                            localStorage.setItem('podchat_presets', JSON.stringify(existing));
                            window.dispatchEvent(new Event('podchat_presets_updated'));
                            alert(`预设 "${presetName}" 已保存`);
                          }
                        }}
                        className={`text-xs px-2 py-1 rounded transition-colors shrink-0 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                      >
                        保存为预设
                      </button>
                    </div>"""

preset_new = """                      <button 
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
                    )}"""

text = text.replace(preset_old, preset_new)

with open('src/components/SettingsPanel.tsx', 'w') as f:
    f.write(text)

print("Patched SettingsPanel.tsx successfully.")
