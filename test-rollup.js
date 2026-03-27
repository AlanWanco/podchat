import { build } from 'vite';
build({
  build: {
    lib: { entry: 'electron/preload.ts', formats: ['cjs'] },
    rollupOptions: { external: ['electron'] },
    outDir: 'dist-test'
  }
}).then(() => console.log('done'));
