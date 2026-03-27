import re

with open('src/App.tsx', 'r') as f:
    text = f.read()

# 1. Add showToast state and replace handleSaveConfig
toast_state = """  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  // Save config explicitly
  const handleSaveConfig = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    showToast('配置已保存到浏览器缓存！');
  };"""

text = re.sub(r'  // Save config explicitly\n  const handleSaveConfig = \(\) => \{\n    localStorage\.setItem\(STORAGE_KEY, JSON\.stringify\(config\)\);\n    alert\(\'配置已保存到浏览器缓存！\'\);\n  \};', toast_state, text)

# 2. Fix the scroll effect
scroll_effect = """  // Auto-scroll log (Only scroll to active subtitle in the chat view)
  useEffect(() => {
    if (scrollRef.current) {
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      });
    }
  }, [currentTime]);"""

text = re.sub(r'  // Auto-scroll log \(Only scroll to active subtitle in the chat view\)\n  useEffect\(\(\) => \{\n    if \(scrollRef\.current && isPlaying\) \{\n      const el = scrollRef\.current;\n      el\.scrollTop = el\.scrollHeight;\n    \}\n  \}, \[currentTime, isPlaying\]\);', scroll_effect, text)

# 3. Add Toast UI to workspace
toast_ui = """        {/* Canvas Area (Preview) */}
        {toastMessage && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded shadow-xl z-50 animate-fade-in text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            {toastMessage}
          </div>
        )}
        <div ref={containerRef}"""

text = text.replace("        {/* Canvas Area (Preview) */}\n        <div ref={containerRef}", toast_ui)

# 4. Pass showToast to SettingsPanel
text = text.replace("onSave={handleSaveConfig}", "onSave={handleSaveConfig}\n                showToast={showToast}")

# 5. Fix bubble scaling to use zoom for full layout effect including margins
bubble_render_old = """                    return (
                      <div
                        key={item.id}
                        className={`flex w-full ${isLeft ? "justify-start" : "justify-end"} animate-fade-in`}
                        style={{ marginBottom: `${margin}px` }}
                      >
                        <div 
                          className={`flex max-w-[70%] gap-4 ${isLeft ? "flex-row" : "flex-row-reverse"}`}
                          style={{
                            transform: `scale(${bubbleScale})`,
                            transformOrigin: isLeft ? "left top" : "right top"
                          }}
                        >"""

bubble_render_new = """                    return (
                      <div
                        key={item.id}
                        className={`flex w-full ${isLeft ? "justify-start" : "justify-end"} animate-fade-in`}
                        style={{ 
                          marginBottom: `${margin}px`,
                          zoom: bubbleScale
                        } as React.CSSProperties}
                      >
                        <div 
                          className={`flex max-w-[70%] gap-4 ${isLeft ? "flex-row" : "flex-row-reverse"}`}
                        >"""

text = text.replace(bubble_render_old, bubble_render_new)

with open('src/App.tsx', 'w') as f:
    f.write(text)

print("Patched App.tsx successfully.")
