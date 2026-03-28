# AGENT Notes

## GitHub Pages Direction

PomChat can support a GitHub Pages version, but it should be treated as a web preview edition rather than a full desktop replacement.

### Goal

Split the product into two layers:

- Electron desktop app: full feature set
- GitHub Pages web app: preview-focused subset

The web version should support subtitle and audio import, style adjustment, and live preview, while keeping export and system-level features desktop-only.

### Web Version Scope

Features that are good candidates for GitHub Pages:

- Import subtitle files
- Import audio files
- Basic chat preview
- Subtitle browsing and light editing
- Speaker style editing
- Layout and theme adjustment
- Animation preview
- Local browser storage

Features that should remain desktop-only for now:

- Video export
- Electron file system integration
- Native open/save dialogs
- Local config directory support
- Main-process remote asset caching
- Platform packaging features

### Recommended Architecture

1. Define a clear web support boundary

- Web version should focus on preview and lightweight editing
- Desktop version keeps full local-file and export workflow

2. Abstract platform capabilities

Create a platform layer instead of scattering `window.electron` checks throughout the app.

Examples of platform APIs:

- `openProjectFile()`
- `saveProjectFile()`
- `readTextFile()`
- `pickImage()`
- `pickAudio()`
- `exportVideo()`
- `cacheRemoteAsset()`

Implement at least:

- `electronPlatform`
- `webPlatform`

3. Move from file paths to resource references

Web mode should not depend on absolute file paths.

Use a more generic media reference model, such as:

```ts
type MediaRef = {
  kind: 'local-file' | 'remote-url' | 'blob-url';
  src: string;
  originalName?: string;
};
```

4. Keep project config web-compatible

Web mode should avoid assuming desktop file paths are reusable.

Initial recommended approach:

- Use session/local preview data in the browser
- Save lightweight project JSON
- Re-request media files when needed in web mode

5. Keep preview logic purely front-end

Preview should work with:

- React
- browser audio elements
- object URLs
- remote URLs

It should not require Electron APIs.

6. Desktop-only export fallback

On GitHub Pages:

- either hide export controls
- or show them in a disabled state with a note that export is desktop-only

### Suggested Rollout Order

1. Extract a platform API layer
2. Make audio / subtitle / image import work in web mode
3. Ensure preview runs without Electron
4. Add GitHub Pages deployment workflow
5. Keep export desktop-only until a separate web export strategy is designed

### Product Framing

Recommended positioning:

- Electron app: full production editor
- GitHub Pages app: lightweight preview edition

This keeps the web version useful without overcommitting to unsupported desktop-only features.
