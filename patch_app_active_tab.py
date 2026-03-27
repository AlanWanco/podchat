import re

with open('src/App.tsx', 'r') as f:
    text = f.read()

# 1. Add activeTab and editingSub state to App
states = """  const [subtitleWidth, setSubtitleWidth] = useState(320);
  const [settingsWidth, setSettingsWidth] = useState(320);
  const [activeTab, setActiveTab] = useState<'global' | 'project'>('project');
  const [editingSub, setEditingSub] = useState<{ id: string, start: number, end: number, text: string } | null>(null);"""

text = re.sub(r'  const \[subtitleWidth, setSubtitleWidth\] = useState\(320\);\n  const \[settingsWidth, setSettingsWidth\] = useState\(320\);', states, text)

# 2. Update SubtitlePanel props
sub_old = """            <SubtitlePanel 
              subtitles={subtitles} 
              currentTime={currentTime} 
              isDarkMode={isDarkMode} 
              onSeek={handleSeek} 
              onUpdateSubtitle={handleUpdateSubtitle}
            />"""
sub_new = """            <SubtitlePanel 
              subtitles={subtitles} 
              currentTime={currentTime} 
              isDarkMode={isDarkMode} 
              onSeek={handleSeek} 
              onUpdateSubtitle={handleUpdateSubtitle}
              editingSub={editingSub}
              setEditingSub={setEditingSub}
            />"""
text = text.replace(sub_old, sub_new)

# 3. Update PlayerControls props
player_old = """      <PlayerControls 
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
      />"""

player_new = """      <PlayerControls 
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
        onEditingSubChange={(start, end) => setEditingSub(prev => prev ? { ...prev, start, end } : null)}
      />"""
text = text.replace(player_old, player_new)

# 4. Update SettingsPanel props
for i in range(2):
    sp_old = """              <SettingsPanel 
                config={config} 
                onConfigChange={setConfig} 
                isDarkMode={isDarkMode}
                onThemeChange={setIsDarkMode}
                settingsPosition={settingsPosition}
                onPositionChange={setSettingsPosition}
                onClose={() => setShowSettings(false)}
                onSave={handleSaveConfig}
                showToast={showToast}
              />"""
    sp_new = """              <SettingsPanel 
                config={config} 
                onConfigChange={setConfig} 
                isDarkMode={isDarkMode}
                onThemeChange={setIsDarkMode}
                settingsPosition={settingsPosition}
                onPositionChange={setSettingsPosition}
                onClose={() => setShowSettings(false)}
                onSave={handleSaveConfig}
                showToast={showToast}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />"""
    text = text.replace(sp_old, sp_new, 1)

with open('src/App.tsx', 'w') as f:
    f.write(text)

print("Patched App.tsx activeTab and editingSub")
