import re

with open('src/components/SettingsPanel.tsx', 'r') as f:
    text = f.read()

# I need to add state for presets to load them 
# and a dropdown to apply them

hook_state = """  const [activeTab, setActiveTab] = useState<'global' | 'project'>('project');
  const [presets, setPresets] = useState<Record<string, any>>(() => {
    const saved = localStorage.getItem('podchat_presets');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    const handlePresetsUpdate = () => {
      const saved = localStorage.getItem('podchat_presets');
      if (saved) setPresets(JSON.parse(saved));
    };
    window.addEventListener('podchat_presets_updated', handlePresetsUpdate);
    return () => window.removeEventListener('podchat_presets_updated', handlePresetsUpdate);
  }, []);
"""

text = text.replace("  const [activeTab, setActiveTab] = useState<'global' | 'project'>('project');", hook_state)

preset_ui = """                    {/* Presets Action */}
                    <div className="flex justify-between items-center pt-1 gap-2">
                      <select 
                        onChange={(e) => {
                          if (e.target.value) {
                            const presetStyle = presets[e.target.value];
                            if (presetStyle) {
                              const newSpeakers = { ...config.speakers };
                              newSpeakers[key].style = { ...newSpeakers[key].style, ...presetStyle };
                              updateConfig('speakers', newSpeakers);
                            }
                            e.target.value = '';
                          }
                        }}
                        className={`flex-1 border rounded px-1 py-1 text-xs focus:outline-none ${inputClass}`}
                      >
                        <option value="">应用预设样式...</option>
                        {Object.keys(presets).map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                      <button 
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

text = re.sub(r'\{\/\* Presets Action \*\/\}.*?保存为预设\n                      </button>\n                    </div>', preset_ui, text, flags=re.DOTALL)

with open('src/components/SettingsPanel.tsx', 'w') as f:
    f.write(text)

