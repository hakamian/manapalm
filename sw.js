
// FIX: Update cache name to ensure service worker updates
const CACHE_NAME = 'nakhlestan-mana-cache-v4';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  // Add core assets that should always be cached
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700&display=swap',
  'https://picsum.photos/seed/nakhlestan-logo/192/192',
  'https://picsum.photos/seed/nakhlestan-logo/512/512',
];

// Install a service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // FIX: Add a catch block to handle potential failures in addAll
        return cache.addAll(urlsToCache).catch(error => {
          console.error('Failed to cache during install:', error);
        });
      })
      .catch(error => {
          console.error('Failed to open cache during install:', error);
      })
  );
});

// Cache and return requests
self.addEventListener('fetch', event => {
    // For navigation requests (HTML pages), use a network-first strategy.
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(() => {
                // If the network fails, serve the main page from the cache.
                // FIX: Correctly match the root path '/' instead of a file that might not be in the cache.
                return caches.match('/');
            })
        );
        return;
    }

    // For other requests (CSS, JS, images, etc.), use a cache-first strategy.
    event.respondWith(
        caches.match(event.request)
        .then(response => {
            // Cache hit - return response
            if (response) {
                return response;
            }

            // Not in cache, fetch from network, then cache it for next time.
            const fetchRequest = event.request.clone();

            return fetch(fetchRequest).then(
                response => {
                    // Check if we received a valid response
                    if (!response || response.status !== 200 || (response.type !== 'basic' && response.type !== 'cors')) {
                        return response;
                    }

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


// Update a service worker
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
