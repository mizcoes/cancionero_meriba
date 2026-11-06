/* Service worker: la app funciona sin conexión tras la primera visita.
   Si cambias canciones o diseño, sube el número de VERSION para forzar la actualización. */
const VERSION = 'cancionero-v2';
const FONTS = 'cancionero-fuentes';
const CORE = ['./', 'index.html', 'css/styles.css', 'js/app.js', 'js/songs.js',
  'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png',
  'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((ks) => Promise.all(ks.filter((k) => k !== VERSION && k !== FONTS).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});
// Responde desde la caché y la actualiza en segundo plano.
function staleWhileRevalidate(req, cacheName, fallback) {
  return caches.open(cacheName).then((cache) =>
    cache.match(req, { ignoreSearch: true }).then((hit) => {
      const net = fetch(req).then((res) => {
        if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
        return res;
      }).catch(() => hit || (fallback ? cache.match(fallback) : undefined));
      return hit || net;
    }));
}
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    e.respondWith(staleWhileRevalidate(req, VERSION, 'index.html'));
  } else if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(staleWhileRevalidate(req, FONTS));
  }
});
