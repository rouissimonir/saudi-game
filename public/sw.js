// Keep each deployment's public app assets in its own cache. Never cache API responses.
const scope = new URL(self.registration.scope);
const prefix = `qahwa:${encodeURIComponent(scope.pathname)}:`;
const cacheName = `${prefix}v1`;
const shell = new URL('index.html', scope).href;

function isPublicAsset(url) {
  if (url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname)) return false;
  const path = url.pathname.slice(scope.pathname.length);
  return /^(assets|fonts|icons)\//.test(path) || path === 'manifest.webmanifest';
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(cacheName).then((cache) => cache.addAll([
      shell, new URL('manifest.webmanifest', scope).href,
      new URL('icons/icon-192.png', scope).href,
      new URL('fonts/cairo-arabic.woff2', scope).href,
      new URL('fonts/cairo-latin.woff2', scope).href,
    ])).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key.startsWith(prefix) && key !== cacheName).map((key) => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

async function fetchAndStore(request) {
  const response = await fetch(request);
  if (response.ok) {
    try {
      const cache = await caches.open(cacheName);
      await cache.put(request, response.clone());
    } catch {
      // Storage can be unavailable or full; a successful network response still works.
    }
  }
  return response;
}

async function fetchAndStoreShell(request) {
  const response = await fetch(request);
  if (response.ok) {
    try {
      const cache = await caches.open(cacheName);
      await cache.put(shell, response.clone());
    } catch {
      // Preserve the online response even if offline storage fails.
    }
  }
  return response;
}

// Assets loaded before the worker took control are handed to it after the first launch.
self.addEventListener('message', (event) => {
  if (event.data?.type !== 'cache-urls' || !Array.isArray(event.data.urls)) return;
  const urls = event.data.urls.flatMap((value) => {
    if (typeof value !== 'string') return [];
    try {
      const url = new URL(value, scope);
      return isPublicAsset(url) ? [url.href] : [];
    } catch {
      return [];
    }
  });
  event.waitUntil(Promise.allSettled(urls.map(fetchAndStore)));
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== scope.origin) return;

  // Only the game's own entry point uses the app-shell fallback.
  if (request.mode === 'navigate' && (url.pathname === scope.pathname || url.pathname === new URL(shell).pathname)) {
    event.respondWith(fetchAndStoreShell(request).catch(async () => {
      const cache = await caches.open(cacheName);
      return cache.match(shell);
    }));
    return;
  }

  if (!isPublicAsset(url)) return;
  const network = fetchAndStore(request);
  // Register background work synchronously, even when a cached response is available.
  event.waitUntil(network.then(() => undefined, () => undefined));
  event.respondWith(caches.open(cacheName)
    // These are public, same-origin build assets; differing Origin headers must not break offline modules.
    .then((cache) => cache.match(request, { ignoreVary: true }))
    .catch(() => undefined)
    .then((cached) => cached || network));
});
