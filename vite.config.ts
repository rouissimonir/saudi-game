import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

// On GitHub the run number is also the TestFlight build number, so the menu can say which build a tester is on.
const buildLabel = process.env.GITHUB_RUN_NUMBER ? `build ${process.env.GITHUB_RUN_NUMBER} · ${(process.env.GITHUB_SHA ?? '').slice(0, 7)}` : 'dev build';

export default defineConfig(() => {
  return {
    define: { 'import.meta.env.VITE_BUILD_LABEL': JSON.stringify(buildLabel) },
    // Relative base: the same build runs from a domain root, a subpath (GitHub Pages) or a Capacitor shell.
    base: './',
    plugins: [react(), tailwindcss()],
    resolve: {
      // Preact's React-compatible layer replaces react/react-dom at build time (~4 KB instead of ~60 KB gzipped).
      // Source code and types stay React; only the shipped runtime changes.
      alias: [
        { find: '@', replacement: path.resolve(import.meta.dirname, '.') },
        { find: /^react-dom\/client$/, replacement: 'preact/compat/client' },
        { find: /^react\/jsx-runtime$/, replacement: 'preact/compat/jsx-runtime' },
        { find: /^react\/jsx-dev-runtime$/, replacement: 'preact/compat/jsx-dev-runtime' },
        { find: /^react-dom$/, replacement: 'preact/compat' },
        { find: /^react$/, replacement: 'preact/compat' },
      ],
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(import.meta.dirname, 'index.html'),
          fasih: path.resolve(import.meta.dirname, 'fasih.html'),
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
