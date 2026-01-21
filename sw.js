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
  // External CDN assets crucial for offline functionality
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
      console.log('SW: Pre-caching core assets...');
      return cache.addAll(ASSETS_TO_CACHE).catch(err => console.warn('SW: Cache incomplete, some assets failed to pre-cache.', err));
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
              console.log('SW: Deleting old cache:', key);
              return caches.delete(key);
            }
          })
        );
      })
    ])
  );
  console.log('SW: Activated and cleaning up old caches.');
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  // Strategy for Google Fonts: Cache First, then Network, then Cache and Return
  if (event.request.url.startsWith('https://fonts.googleapis.com/') || event.request.url.startsWith('https://fonts.gstatic.com/')) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).then((res) => {
          return caches.open(CACHE_NAME).then((cache) => {
            console.log('SW: Caching Google Font:', event.request.url);
            cache.put(event.request, res.clone());
            return res;
          });
        }).catch((err) => {
          console.warn('SW: Failed to fetch and cache Google Font:', event.request.url, err);
          return new Response('', { status: 503, statusText: 'Google Font Offline' }); // Indicate font failure
        });
      })
    );
    return; // Crucial to return here to prevent fall-through to default handler
  }

  // Default strategy for other assets: Cache First, then Network
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached asset or fetch from network
      return response || fetch(event.request).catch(() => {
        // If both fail and it's a navigation request, return index.html shell
        if (event.request.mode === 'navigate') {
          console.warn('SW: Offline navigation, serving /index.html shell.');
          return caches.match('/');
        }
        console.warn('SW: Offline request failed for:', event.request.url);
        return new Response('', { status: 408, statusText: 'Offline' });
      });
    })
  );
});