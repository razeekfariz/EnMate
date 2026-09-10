// EnMate Management Portal - Dedicated Scoped Service Worker
const CACHE_NAME = 'enmate-admin-v1';
const ADMIN_SHELL_ASSETS = [
  '/admin',
  '/logos/site-logo.png',
  '/admin-manifest.webmanifest',
  '/web-app-manifest-192x192.png',
  '/web-app-manifest-512x512.png'
];

// Install: Cache essential admin shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ADMIN_SHELL_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate: Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName.startsWith('enmate-admin')) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Network-first strategy for admin (guaranteeing fresh data while providing fast shell fallback)
self.addEventListener('fetch', (event) => {
  // Only handle requests inside /admin scope
  const url = new URL(event.request.url);
  if (!url.pathname.startsWith('/admin') && !ADMIN_SHELL_ASSETS.includes(url.pathname)) {
    return; // Pass through to standard network
  }

  // Never cache API or Supabase requests in service worker to guarantee live real-time accuracy
  if (event.request.method !== 'GET' || url.pathname.startsWith('/api') || url.hostname.includes('supabase.co')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Cache successful static responses
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Offline fallback to cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Default offline fallback for admin navigation
          if (event.request.mode === 'navigate') {
            return caches.match('/admin');
          }
          return new Response('Offline: EnMate Management Portal requires internet connection for live data modifications.', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({ 'Content-Type': 'text/plain' })
          });
        });
      })
  );
});
