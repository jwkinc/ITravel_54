self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
    } catch(e) {}

    try {
      await self.registration.unregister();
    } catch(e) {}

    try {
      const clientsList = await self.clients.matchAll({type:'window', includeUncontrolled:true});
      for (const client of clientsList) {
        const url = new URL(client.url);
        url.searchParams.set('sw_nuked', Date.now().toString());
        client.navigate(url.toString());
      }
    } catch(e) {}
  })());
});

self.addEventListener('fetch', event => {
  // Intentionally do not call respondWith.
  // This lets the browser go straight to the network.
});