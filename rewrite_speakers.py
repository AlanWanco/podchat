import re

with open('src/components/SettingsPanel.tsx', 'r') as f:
    text = f.read()

start_marker = '<div className="space-y-3">\n                {Object.entries(config.speakers).map(([key, speaker]: [string, any]) => ('
end_marker = '                ))}\n              </div>\n            </div>\n\n          </div>'

idx_start = text.find(start_marker)
idx_end = text.find(end_marker) + len(end_marker)

if idx_start == -1 or idx_end == -1:
    print("Could not find markers")
    exit(1)

new_speakers_block = """<div className="space-y-3">
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
                          <input 
                            type="text" 
                            value={speaker.avatar}
                            onChange={(e) => {
                              const newSpeakers = { ...config.speakers };
                              newSpeakers[key].avatar = e.target.value;
                              updateConfig('speakers', newSpeakers);
                            }}
                            className={`w-full border rounded px-2 py-1 text-xs focus:outline-none ${inputClass}`}
                          />
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
                            className="w-6 h-6 rounded cursor-pointer border-0 p-0 bg-transparent shrink-0"
                          />
                          <span className="text-[10px] uppercase tracking-wider font-mono">背景 (Bg)</span>
                        </div>
                        <div className="flex items-center gap-2 bg-black/5 p-1.5 rounded">
                          <input 
                            type="color" 
                            value={speaker.style?.textColor || '#ffffff'}
                            onChange={(e) => updateSpeakerStyle(key, 'textColor', e.target.value)}
                            className="w-6 h-6 rounded cursor-pointer border-0 p-0 bg-transparent shrink-0"
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
                          className="w-6 h-6 rounded cursor-pointer border-0 p-0 bg-transparent shrink-0"
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
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-[10px] opacity-50">将当前样式配置保存为预设以复用</span>
                      <button 
                        onClick={() => {
                          const existingStr = localStorage.getItem('podchat_presets');
                          const existing = existingStr ? JSON.parse(existingStr) : {};
                          const presetName = prompt('请输入预设名称:', `${key} 的样式`);
                          if (presetName) {
                            existing[presetName] = speaker.style;
                            localStorage.setItem('podchat_presets', JSON.stringify(existing));
                            // Dispatch custom event to notify sibling components
                            window.dispatchEvent(new Event('podchat_presets_updated'));
                            alert(`预设 "${presetName}" 已保存`);
                          }
                        }}
                        className={`text-xs px-2 py-1 rounded transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                      >
                        保存为预设
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            </div>

          </div>"""

new_text = text[:idx_start] + new_speakers_block + text[idx_end:]

with open('src/components/SettingsPanel.tsx', 'w') as f:
    f.write(new_text)

print("Rewritten speaker panel successfully.")
