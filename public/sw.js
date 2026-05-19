const VERSION = '1.0.1';
const CACHE_NAME = `spotify-cache-v${VERSION}`;

const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/album_cover_1.png',
  '/album_cover_2.png',
  '/album_cover_3.png'
];

// Install Event
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force the waiting service worker to become the active service worker
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(err => console.log('Cache addAll failed:', err));
    })
  );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName.startsWith('spotify-cache-') && cacheName !== CACHE_NAME) {
            console.log(`Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control of all clients immediately
  );
});

// Fetch Event - Stale-while-revalidate for assets, Network-first for JSON/Data
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip caching for audio streams and non-GET requests
  if (request.method !== 'GET' || url.pathname.match(/\.(mp3|wav|mp4)$/i)) {
    return;
  }

  // Network-first strategy for JSON / API endpoints
  if (url.pathname.endsWith('.json') || url.hostname.includes('cloudinary')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Default Network-First for JS/CSS bundles to ensure we get updates
  event.respondWith(
    fetch(request)
      .then((response) => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
        return response;
      })
      .catch(() => caches.match(request))
  );
});

// Listen for message to skip waiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
