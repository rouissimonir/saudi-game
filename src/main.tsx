import {createRoot} from 'react-dom/client';
import {Capacitor} from '@capacitor/core';
import App from './App.tsx';
import { initializeRevenueCatTestStore } from './utils/revenueCatTestStore';
import { initializeRevenueCatAppStore } from './utils/revenueCatAppStore';
import { probeRevenueCatTestStore } from './utils/revenueCatTestProbe';
import './index.css';

// The installed iPhone app is a game, not a web page: an accidental pinch (or an auto-zoom) used to leave it magnified a few
// percent, which pushed the right edge off screen and scrolled the top bar away. Lock the scale there; the website keeps zoom.
if (Capacitor.isNativePlatform()) {
  document.querySelector('meta[name="viewport"]')?.setAttribute('content', 'width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover');
}

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
