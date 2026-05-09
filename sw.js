const CACHE_NAME = "katalizapp-v1";
const urlsToCache = [
  "/",
  "/login.html",
  "/index.html",
  "/ogretmen-login.html",
  "/ogretmen.html",
  "/veli-login.html",
  "/veli.html"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});