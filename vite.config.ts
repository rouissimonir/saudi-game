import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    // Relative base: the same build runs from a domain root, a subpath (GitHub Pages) or a Capacitor shell.
    base: './',
    plugins: [react(), tailwindcss()],
    resolve: {
      // Preact's React-compatible layer replaces react/react-dom at build time (~4 KB instead of ~60 KB gzipped).
      // Source code and types stay React; only the shipped runtime changes.
      alias: [
        { find: '@', replacement: path.resolve(__dirname, '.') },
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
          main: path.resolve(__dirname, 'index.html'),
          fasih: path.resolve(__dirname, 'fasih.html'),
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
