
/**
 * Role: Senior Architect
 * Logic: Offline-First Sovereign Routing for AegisVault
 * Version: 1.1.0 - Absolute Offline Sovereignty Finalized
 */

const CACHE_NAME = 'aegis-vault-v1.1.0';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/hooks/useVault.ts',
  '/hooks/usePWAInstall.ts',
  '/services/storageService.ts',
  '/services/exportService.ts',
  '/services/VaultRefiner.ts',
  '/services/FontLoader.ts',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&family=Playfair+Display:ital,wght@0,700;0,800;1,700;1,800&display=swap',
  'https://esm.sh/react@18.2.0',
  'https://esm.sh/react-dom@18.2.0',
  'https://esm.sh/marked@9.1.6',
  'https://esm.sh/lucide-react@0.344.0',
  'https://esm.sh/jspdf@2.5.1',
  'https://esm.sh/html2canvas@1.4.1',
  'https://esm.sh/docx@8.5.0',
  'https://esm.sh/file-saver@2.0.5',
  'https://esm.sh/dexie@3.2.4'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('SW: Pre-caching core assets for absolute offline sovereignty...');
      return cache.addAll(ASSETS_TO_CACHE);
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
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
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
      // Return cached response if found, else fetch from network and cache
      return response || fetch(event.request).then(networkResponse => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        return new Response('Offline: Sovereign state active, resource unavailable.');
      });
    })
  );
});
