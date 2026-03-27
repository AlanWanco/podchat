import re

with open('src/components/SettingsPanel.tsx', 'r') as f:
    text = f.read()

# 1. Update Props Interface
props_old = """  onSave: () => void;
  showToast: (msg: string) => void;
}"""
props_new = """  onSave: () => void;
  showToast: (msg: string) => void;
  activeTab: 'global' | 'project';
  setActiveTab: (tab: 'global' | 'project') => void;
}"""
text = text.replace(props_old, props_new)

# 2. Update Component Signature
sig_old = """  onClose, onSave, showToast
}: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<'global' | 'project'>('project');"""
sig_new = """  onClose, onSave, showToast, activeTab, setActiveTab
}: SettingsPanelProps) {"""
text = text.replace(sig_old, sig_new)

# 3. Add FPS to Layout Section
fps_old = """                <div className="space-y-1.5">
                  <span className="text-xs opacity-70">宽度 (W)</span>"""
fps_new = """                <div className="space-y-1.5 col-span-2">
                  <span className="text-xs opacity-70">帧率 (FPS)</span>
                  <input 
                    type="number" 
                    value={config.fps || 60}
                    onChange={(e) => updateConfig('fps', parseInt(e.target.value))}
                    className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none ${inputClass}`} 
                  />
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs opacity-70">宽度 (W)</span>"""
text = text.replace(fps_old, fps_new)

# 4. Improve Color Input CSS
color_old = """className="w-6 h-6 rounded cursor-pointer border-0 p-0 bg-transparent shrink-0\""""
color_new = """className="w-6 h-6 rounded cursor-pointer border-0 p-0 bg-transparent shrink-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded shadow-sm\""""
text = text.replace(color_old, color_new)

# Replace variants like w-8 h-6
color2_old = """className="w-8 h-6 rounded cursor-pointer border-0 p-0 bg-transparent shrink-0\""""
color2_new = """className="w-8 h-6 rounded cursor-pointer border-0 p-0 bg-transparent shrink-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded shadow-sm\""""
text = text.replace(color2_old, color2_new)

with open('src/components/SettingsPanel.tsx', 'w') as f:
    f.write(text)

print("Patched SettingsPanel")
