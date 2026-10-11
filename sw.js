/* ================================================================
   Silver Fox Dynamics — Service Worker v5
   Strategy:
     HTML pages   → Network-first  (always fresh content)
     CSS / JS     → Network-first  (style/behaviour changes show up
                                     immediately, no hard refresh needed)
     Other assets → Cache-first    (fast repeat loads for images/icons)
   Splash / install uses the updated branded icons.
================================================================ */

const CACHE_VERSION = "sfd-cache-v5";
const DYNAMIC_MAX_ENTRIES = 80;
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

  // Only intercept same-origin GET requests. Form POSTs and the /api/
  // endpoints go straight to the network (a POST can't be cached, and
  // trying to put one in the cache throws).
  if (url.origin !== location.origin) return;
  if (request.method !== 'GET') return;
  if (url.pathname.startsWith('/api/')) return;

  // HTML pages → Network-first (keeps content fresh)
  if (request.headers.get('Accept')?.includes('text/html')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // CSS / JS → Network-first (so style/behaviour edits show up
  // immediately on next load, without needing a hard refresh)
  if (request.destination === 'style' || request.destination === 'script') {
    event.respondWith(networkFirst(request));
    return;
  }

  // Everything else (images, fonts, icons) → Cache-first (fast assets)
  event.respondWith(cacheFirst(request));
});

// ── Keep the dynamic cache from growing without bound ────────────
async function trimCache(cache) {
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - DYNAMIC_MAX_ENTRIES; i++) {
    await cache.delete(keys[i]);
  }
}

async function remember(request, response) {
  try {
    const cache = await caches.open(CACHE_DYNAMIC);
    await cache.put(request, response);
    await trimCache(cache);
  } catch { /* caching is best-effort */ }
}

// ── Network-first strategy ───────────────────────────────────────
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) remember(request, networkResponse.clone());
    return networkResponse;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    // Offline fallback to the home page only makes sense for page
    // navigations, never for a stylesheet or script.
    if (request.mode === 'navigate') {
      const home = await caches.match('/index.html');
      if (home) return home;
    }
    return Response.error();
  }
}

// ── Cache-first strategy ─────────────────────────────────────────
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) remember(request, networkResponse.clone());
    return networkResponse;
  } catch {
    // Return empty 404 response if both fail
    return new Response('', { status: 404, statusText: 'Not Found' });
  }
}
