const CACHE_NAME = 'itravel-location-panel-bg-v40';
const CORE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './assets/itravel-store-pin-base.png',
  './assets/ui-from-you-distance-panel.webp',
  './assets/ui-weather-now-panel.webp',
  './assets/location-panel-background.webp',
  './assets/route-preview-panel-scene-ui.png',
  './assets/forecast-panel-fit-clean.webp'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const req = event.request;
  const accept = req.headers.get('accept') || '';
  const isPage = req.mode === 'navigate' || accept.includes('text/html');
  event.respondWith(
    fetch(req).then(response => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(req, copy)).catch(() => {});
      return response;
    }).catch(() => caches.match(req).then(cached => cached || (isPage ? caches.match('./index.html') : caches.match('./'))))
  );
});
