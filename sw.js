// При каждом обновлении приложения увеличивайте номер версии,
// чтобы телефоны скачали новые файлы.
const CACHE = "sortirovka-v1";
const FILES = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./fonts/onest-cyrillic-wght-normal.woff2",
  "./fonts/onest-latin-wght-normal.woff2",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png",
  "./icons/favicon-32.png"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Сначала берём из кэша (работает без интернета), в фоне обновляем.
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request, {ignoreSearch: true}).then(cached => {
      const net = fetch(e.request).then(res => {
        if (res && res.ok && new URL(e.request.url).origin === location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      }).catch(() => cached || caches.match("./index.html"));
      return cached || net;
    })
  );
});
