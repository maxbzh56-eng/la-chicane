self.addEventListener('install', (e) => {
  e.waitUntil(caches.open('chicane-v1').then((c) => c.addAll(['/','/manifest.json'])));
});
self.addEventListener('fetch', (e) => {
  e.respondWith((async () => {
    try { return await fetch(e.request); } catch { return caches.match(e.request) || caches.match('/'); }
  })());
});
