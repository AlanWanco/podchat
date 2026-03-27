import re

with open('src/components/SettingsPanel.tsx', 'r') as f:
    content = f.read()

# Instead of using a giant string replacement, we'll write a Python script that uses regex or simple string finding
# Let's read the current contents, split by line and rewrite it
