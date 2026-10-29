import {createRoot} from 'react-dom/client';
import {Capacitor} from '@capacitor/core';
import App from './App.tsx';
import { initializeRevenueCatTestStore } from './utils/revenueCatTestStore';
import { initializeRevenueCatAppStore } from './utils/revenueCatAppStore';
import { probeRevenueCatTestStore } from './utils/revenueCatTestProbe';
import './index.css';

void initializeRevenueCatTestStore().catch(() => console.warn('RevenueCat Test Store initialization failed.'));
void initializeRevenueCatAppStore().catch(() => console.warn('RevenueCat App Store initialization failed.'));
void probeRevenueCatTestStore();
createRoot(document.getElementById('root')!).render(<App />);

if (import.meta.env.PROD && !Capacitor.isNativePlatform() && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`)
      .then(() => navigator.serviceWorker.ready)
      .then((reg) => {
        // Files fetched before the worker took control (the JS bundle, CSS, art) are handed to it for caching,
        // so the next launch works offline. The worker owns the cache name.
        const urls = [location.href, ...performance.getEntriesByType('resource').map((e) => e.name)];
        reg.active?.postMessage({ type: 'cache-urls', urls });
      })
      .catch(() => {});
  });
}
