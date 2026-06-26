const CACHE_NAME = 'itravel54-pass-through-v3';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
    } catch(e) {}
    try { await self.clients.claim(); } catch(e) {}
  })());
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  // Network only. No cache trap, no reload loop.
  event.respondWith(fetch(event.request, { cache: 'no-store' }).catch(() => fetch(event.request)));
});