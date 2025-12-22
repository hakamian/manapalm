self.addEventListener('install', (event) => {
    console.log('👷 Service Worker Installing...');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('👷 Service Worker Activated.');
    return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    // Pass through all requests
});
