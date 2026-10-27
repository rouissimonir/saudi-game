// Offline support. Pages: network-first. Other files: served from cache and refreshed in the background
// (stale-while-revalidate), so replaced art or audio at the same URL reaches players on their next launch.
const CACHE = 'qahwa-v7';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './fonts/cairo-arabic.woff2', './fonts/cairo-latin.woff2']))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

// The page sends the files it loaded before this worker took control; cache each one separately so a single
// missing file cannot stop the rest (and the JS bundle) from being stored.
self.addEventListener('message', (event) => {
  if (event.data?.type !== 'cache-urls' || !Array.isArray(event.data.urls)) return;
  event.waitUntil(
    caches.open(CACHE).then((c) =>
      Promise.allSettled(
        event.data.urls
          .filter((u) => typeof u === 'string' && new URL(u).origin === self.location.origin)
          .map((u) => fetch(u).then((res) => (res.ok ? c.put(u, res) : undefined)))
      )
    )
  );
});

function putIfOk(req, res) {
  if (res.ok) {
    const copy = res.clone();
    caches.open(CACHE).then((c) => c.put(req, copy));
  }
  return res;
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return putIfOk(req, res);
        })
        .catch(() => caches.match(req).then((hit) => hit || caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((hit) => {
      const network = fetch(req).then((res) => putIfOk(req, res));
      if (hit) {
        event.waitUntil(network.catch(() => {}));
        return hit;
      }
      return network;
    })
  );
});
