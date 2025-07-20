// Service Worker for Cloud Deployment Platform
// Implements offline functionality, caching, and background sync

const CACHE_NAME = 'cloud-deploy-v1';
const STATIC_CACHE_NAME = 'cloud-deploy-static-v1';
const DYNAMIC_CACHE_NAME = 'cloud-deploy-dynamic-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  // Add critical CSS and JS files here when generated
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /\/api\/projects/,
  /\/api\/deployments/,
  /\/api\/metrics/,
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests with network-first strategy
  if (API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Handle static assets with cache-first strategy
  if (request.destination === 'image' || request.destination === 'style' || request.destination === 'script') {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // Handle navigation requests with network-first, fallback to cache
  if (request.mode === 'navigate') {
    event.respondWith(navigationStrategy(request));
    return;
  }

  // Default strategy for other requests
  event.respondWith(networkFirstStrategy(request));
});

// Network-first strategy for dynamic content
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Offline - Content not available', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Cache-first strategy for static assets
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    return new Response('Asset not available', { status: 404 });
  }
}

// Navigation strategy for page requests
async function navigationStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match('/index.html');
    return cachedResponse || new Response('App offline', {
      status: 503,
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// Background sync for deployment actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'deploy-project') {
    event.waitUntil(syncDeployment());
  }
});

async function syncDeployment() {
  // Get pending deployment requests from IndexedDB
  const pendingDeployments = await getPendingDeployments();
  
  for (const deployment of pendingDeployments) {
    try {
      await fetch('/api/deployments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deployment)
      });
      
      // Remove from pending queue
      await removePendingDeployment(deployment.id);
      
      // Notify client of successful sync
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'DEPLOYMENT_SYNCED',
            deployment: deployment
          });
        });
      });
    } catch (error) {
      console.error('Failed to sync deployment:', error);
    }
  }
}

// Push notification handler
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  
  const options = {
    body: data.body || 'Deployment update available',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    data: data,
    actions: [
      {
        action: 'view',
        title: 'View Details',
        icon: '/action-view.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/action-dismiss.png'
      }
    ],
    tag: data.tag || 'deployment-update',
    requireInteraction: data.priority === 'high'
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Cloud Deploy', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(`/projects/${event.notification.data.projectId}`)
    );
  }
});

// Helper functions for IndexedDB operations
async function getPendingDeployments() {
  // Implement IndexedDB operations for offline queue
  return [];
}

async function removePendingDeployment(id) {
  // Implement IndexedDB removal
  return true;
}