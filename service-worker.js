
// FIX: Updated cache name to ensure new service worker activates
const CACHE_NAME = 'nakhlestan-ma-na-v4'; 
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/service-worker.js',
  '/icon-192x192.png',
  '/icon-512x512.png',
  // Key pages for offline access
  '/our-story',
  '/heritage',
  '/courses',
  '/community-projects',
  '/community',
  // Core assets
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700&display=swap'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Use addAll for atomic operation
        // FIX: Added a catch block to handle errors during caching.
        return cache.addAll(urlsToCache).catch(error => {
          console.error('Failed to cache during install:', error);
        });
      })
  );
});

self.addEventListener('fetch', event => {
    // For navigation requests, use a network-first strategy to ensure fresh content.
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(() => {
                // If network fails, fall back to the main cached page.
                // FIX: Correctly match the root path '/' instead of a file that might not be in the cache.
                return caches.match('/');
            })
        );
        return;
    }

    // For other requests (CSS, JS, images), use a cache-first strategy.
    event.respondWith(
        caches.match(event.request)
        .then(response => {
            // Cache hit - return response
            if (response) {
                return response;
            }

            // Clone the request because it's a stream and can only be consumed once.
            const fetchRequest = event.request.clone();

            return fetch(fetchRequest).then(
                response => {
                    // Check if we received a valid response
                    if (!response || response.status !== 200 || (response.type !== 'basic' && response.type !== 'cors')) {
                        return response;
                    }

                    // Clone the response because it's a stream and can only be consumed once.
                    const responseToCache = response.clone();

                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                }
            );
        })
    );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
