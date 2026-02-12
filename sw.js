/*  PHC Pediatric Dose – Service Worker
    Cache-first for offline support.
    Bump CACHE_VERSION when deploying updates. */

const CACHE_VERSION = 'phc-peds-v6';

const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

/* Install: cache core assets */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

/* Activate: clean old caches */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

/* Fetch: cache-first, fallback to network */
self.addEventListener('fetch', event => {
  /* Only handle GET requests */
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        /* Don't cache non-ok or opaque responses */
        if (!response || response.status !== 200) return response;

        /* Cache successful responses */
        const clone = response.clone();
        caches.open(CACHE_VERSION).then(cache => {
          cache.put(event.request, clone);
        });

        return response;
      }).catch(() => {
        /* Offline fallback for navigation */
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
