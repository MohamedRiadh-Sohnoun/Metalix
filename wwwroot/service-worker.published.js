// Cleanup worker: removes old Blazor offline caches, unregisters itself, and lets the network handle requests.
self.addEventListener('install', event => {
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
    event.waitUntil(cleanupAndReloadClients());
});

self.addEventListener('fetch', () => {
    // No respondWith call: every request falls through to the network.
});

async function cleanupAndReloadClients() {
    const cacheKeys = await caches.keys();
    await Promise.all(
        cacheKeys
            .filter(key => key.startsWith('offline-cache-'))
            .map(key => caches.delete(key))
    );

    await self.clients.claim();
    await self.registration.unregister();

    const clients = await self.clients.matchAll({ type: 'window' });
    await Promise.all(
        clients.map(client => client.navigate(client.url))
    );
}
