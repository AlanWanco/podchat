import re

with open('src/App.tsx', 'r') as f:
    text = f.read()

# Replace the specific Canvas Area target to inject the toast
target = "{/* Canvas Area (Preview) */}"
replacement = """{/* Canvas Area (Preview) */}
          {toastMessage && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded shadow-xl z-50 animate-fade-in text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              {toastMessage}
            </div>
          )}"""

text = text.replace(target, replacement)

with open('src/App.tsx', 'w') as f:
    f.write(text)

