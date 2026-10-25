import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`)
      .then(() => {
        // Files fetched before the worker took control (the JS bundle, CSS, art) are cached here so the next launch works offline.
        const loaded = performance
          .getEntriesByType('resource')
          .map((e) => e.name)
          .filter((u) => u.startsWith(location.origin));
        return caches.open('qahwa-v1').then((c) => c.addAll([location.href, ...loaded]));
      })
      .catch(() => {});
  });
}
