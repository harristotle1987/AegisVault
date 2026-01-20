
/**
 * Role: Security Lead / Senior Architect
 * Logic: Offline-First Service Worker for AegisVault
 */

const CACHE_NAME = 'aegis-vault-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './favicon.svg'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Best effort caching
      return cache.addAll(ASSETS_TO_CACHE).catch(err => console.warn('Cache incomplete', err));
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((keyList) => {
        return Promise.all(
          keyList.map((key) => {
            if (key !== CACHE_NAME) return caches.delete(key);
          })
        );
      })
    ])
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch(() => {
        // Fallback or just fail gracefully
        return new Response('', { status: 408, statusText: 'Offline' });
      });
    })
  );
});
