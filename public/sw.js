const CACHE_NAME = "katalizapp-v2";
const urlsToCache = [
  "/",
  "/login",
  "/kayit",
  "/ogretmen-login",
  "/ogretmen-kayit",
  "/veli-login",
  "/ogrenci",
  "/ogretmen",
  "/veli",
  "/style.css",
  "/app.js"
];

self.addEventListener("install", event => {
  self.skipWaiting(); // Yeni versiyonu hemen devreye al
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener("activate", event => {
  // Eski cache'leri temizle ki yeni sayfalar yüklensin
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  // Sadece GET isteklerini cache'le, API veya soketleri atla
  if (event.request.method !== 'GET' || event.request.url.includes('/api/')) {
      return fetch(event.request);
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache varsa döndür, yoksa sunucudan çek (Network falling back to cache stratejisi de eklenebilir ama şu an için standart cache-first)
        return response || fetch(event.request).then(fetchRes => {
            return caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, fetchRes.clone());
                return fetchRes;
            });
        });
      })
  );
});
