/**
 * Role: Senior Architect
 * Logic: Offline-First Sovereign Routing for AegisVault
 */

const CACHE_NAME = 'aegis-vault-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/icon-192.svg',
  '/icon-512.svg',
  // Conceptual font files for offline binary integrity.
  // These paths assume corresponding .ttf files exist at the root level if they were to be dynamically fetched.
  // For jspdf's VFS, the base64 content embedded in FontLoader.ts is used directly.
  '/Inter-Regular.ttf',
  '/JetBrainsMono-Regular.ttf'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
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
      // Return cached asset or fetch from network
      return response || fetch(event.request).catch(() => {
        // If both fail and it's a navigation request, return index.html shell
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
        return new Response('', { status: 408, statusText: 'Offline' });
      });
    })
  );
});