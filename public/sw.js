// Aura Community Act & Aura Music Studio Service Worker
const CACHE_NAME = 'aura-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// Pass media requests directly to network to support HTTP range requests / audio streaming
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Audio streams, range requests, API calls, and Supabase storage: let network handle directly
  if (
    event.request.headers.get('range') ||
    url.pathname.endsWith('.mp3') ||
    url.pathname.endsWith('.wav') ||
    url.pathname.endsWith('.flac') ||
    url.pathname.endsWith('.m4a') ||
    url.pathname.includes('/storage/v1/object/') ||
    url.pathname.startsWith('/api/')
  ) {
    return;
  }

  // Navigation requests: network first with fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
  }
});
