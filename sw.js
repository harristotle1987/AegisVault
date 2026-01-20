
/**
 * Role: Security Lead / Senior Architect
 * Logic: Offline-First Service Worker for AegisVault
 */

const CACHE_NAME = 'aegis-vault-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/icon-192.svg',
  '/icon-512.svg',
  '/icon-maskable.svg'
];

// Install Event: Hydrating the local cache
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Vault Hardened: Assets Cached Locally');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate Event: Claim clients and clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((keyList) => {
        return Promise.all(
          keyList.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          })
        );
      })
    ])
  );
});

// Fetch Event: Serving from Cache to ensure zero-latency
self.addEventListener('fetch', (event) => {
  // Handle Google Fonts
  if (event.request.url.includes('fonts.googleapis.com') || event.request.url.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          return response || fetch(event.request).then((networkResponse) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // Default Cache-First Strategy
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached asset or fetch from network
      return response || fetch(event.request).then((response) => {
         // Optionally cache new requests dynamically if needed, 
         // but strict cache-first relies on install/activate or specific dynamic caching logic.
         // For now, we fallback to network for non-pre-cached items (like ES modules).
         return response;
      });
    })
  );
});
