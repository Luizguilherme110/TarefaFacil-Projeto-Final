const CACHE_NAME = 'tarefafacil-cache-v1';
const ASSET_URLS = [
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
  '/manifest.json'
];

// Precache only static assets (icons, manifest). Don't precache index.html to avoid serving stale app shell.
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSET_URLS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

// Network-first for navigation (HTML) requests so we always try to load latest app shell.
// Cache-first for other GET requests (assets).
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const acceptHeader = event.request.headers.get('accept') || '';
  const isNavigation = acceptHeader.includes('text/html');

  if (isNavigation) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // do not cache the HTML response here; just return it
          return response;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // For other assets: cache-first strategy
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200) return response;
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => {
          // fallback to a cached asset if available
          return caches.match('/icons/icon-192.svg');
        });
    })
  );
});
