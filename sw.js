/* ================================================================
   Silver Fox Dynamics — Service Worker v3
   Strategy:
     HTML pages   → Network-first  (always fresh content)
     Assets       → Cache-first    (fast repeat loads)
   Splash / install uses the updated branded icons.
================================================================ */

const CACHE_VERSION = 'sfd-v5';
const CACHE_STATIC  = `${CACHE_VERSION}-static`;
const CACHE_DYNAMIC = `${CACHE_VERSION}-dynamic`;

// Core shell — cached on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  '/images/icon-192.png',
  '/images/icon-512.png',
  '/images/icon-192-maskable.png',
  '/images/icon-512-maskable.png',
  '/images/apple-touch-icon.png',
  '/images/favicon-32x32.png',
  '/images/logo.png',
  '/images/logo1.png'
];

// ── Install: cache the core shell ────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_STATIC).then(cache => {
      // addAll fails entirely if one URL 404s; use individual adds
      return Promise.allSettled(
        STATIC_ASSETS.map(url =>
          cache.add(url).catch(err =>
            console.warn(`[SW] Failed to cache ${url}:`, err)
          )
        )
      );
    }).then(() => self.skipWaiting())
  );
});

// ── Activate: remove all old caches ──────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_STATIC && key !== CACHE_DYNAMIC)
          .map(key => {
            console.log(`[SW] Deleting old cache: ${key}`);
            return caches.delete(key);
          })
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: strategy by request type ─────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Only intercept same-origin requests
  if (url.origin !== location.origin) return;

  // HTML pages → Network-first (keeps content fresh)
  if (request.headers.get('Accept')?.includes('text/html')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Everything else → Cache-first (fast assets)
  event.respondWith(cacheFirst(request));
});

// ── Network-first strategy ───────────────────────────────────────
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_DYNAMIC);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    const cached = await caches.match(request);
    return cached || caches.match('/index.html');
  }
}

// ── Cache-first strategy ─────────────────────────────────────────
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_DYNAMIC);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    // Return empty 404 response if both fail
    return new Response('', { status: 404, statusText: 'Not Found' });
  }
}
