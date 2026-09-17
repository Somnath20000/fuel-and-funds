// Offline support: the app shell is cached so Fuel & Funds opens without internet.
// Bump VERSION whenever you upload changed files, so phones pick up the update.
const VERSION = "ff-v1";
const SHELL = ["./", "./index.html", "./app.js", "./firebase-config.js", "./firebase.bundle.js",
  "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/maskable-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const fonts = url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
  if (!sameOrigin && !fonts) return; // Firebase sync traffic goes straight to the network

  // Page and config: network first (fresh when online), cache when offline.
  if (sameOrigin && (req.mode === "navigate" || url.pathname.endsWith("/firebase-config.js"))) {
    e.respondWith(fetch(req).then(res => {
      const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); return res;
    }).catch(() => caches.match(req).then(r => r || caches.match("./index.html"))));
    return;
  }
  // Everything else: cached copy immediately, refreshed in the background.
  e.respondWith(caches.open(VERSION).then(async c => {
    const cached = await c.match(req);
    const network = fetch(req).then(res => { if (res.ok || res.type === "opaque") c.put(req, res.clone()); return res; }).catch(() => cached);
    return cached || network;
  }));
});
