/**
 * Service Worker - Hector CRM PWA
 * Gère le cache offline et les notifications push
 * 
 * @author Jean-Pierre Kaladjian
 * @date 31 Octobre 2025
 */

const CACHE_NAME = 'hector-crm-v1.0.0';
const OFFLINE_URL = '/offline.html';

// Assets critiques à mettre en cache immédiatement
const CRITICAL_ASSETS = [
  '/',
  '/offline.html',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Assets à mettre en cache progressivement
const CACHE_URLS = [
  '/crm/prospects',
  '/crm/opportunities',
  '/crm/workflow',
  '/crm/dashboard'
];

// API endpoints à mettre en cache (avec stratégie stale-while-revalidate)
const API_CACHE_PATTERNS = [
  /\/api\/crm\/prospects/,
  /\/api\/crm\/opportunities/,
  /\/api\/auth\/user/
];

/**
 * Installation du Service Worker
 * Cache les assets critiques et routes CRM
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installation...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('[SW] Cache des assets critiques');
      await cache.addAll(CRITICAL_ASSETS);
      
      // Pré-cache des routes CRM (en mode background)
      console.log('[SW] Pré-cache des routes CRM');
      try {
        await cache.addAll(CACHE_URLS);
      } catch (error) {
        console.warn('[SW] Impossible de pré-cacher certaines routes:', error);
      }
    })
  );
  
  // Force activation immédiate
  self.skipWaiting();
});

/**
 * Activation du Service Worker
 * Nettoie les anciens caches
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activation...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Suppression ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Prend contrôle immédiatement
  self.clients.claim();
});

/**
 * Interception des requêtes
 * Stratégie : Network First, Fallback Cache, puis Offline
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorer requêtes Chrome extensions
  if (url.protocol === 'chrome-extension:') return;
  
  // Stratégie pour les API calls
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }
  
  // Stratégie pour les assets statiques
  event.respondWith(cacheFirstStrategy(request));
});

/**
 * Stratégie Network First
 * Pour les données dynamiques (API)
 */
async function networkFirstStrategy(request) {
  try {
    // Essayer network d'abord
    const networkResponse = await fetch(request);
    
    // Si succès, mettre en cache pour usage offline
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
    
  } catch (error) {
    // Si network fail, fallback sur cache
    console.log('[SW] Network error, fallback cache:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Si pas de cache, retourner erreur JSON
    return new Response(
      JSON.stringify({ 
        error: 'Offline - données non disponibles',
        offline: true 
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * Stratégie Cache First
 * Pour les assets statiques
 */
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // Mettre à jour cache en arrière-plan
    fetch(request).then((networkResponse) => {
      if (networkResponse.ok) {
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, networkResponse);
        });
      }
    }).catch(() => {
      // Ignorer erreurs background update
    });
    
    return cachedResponse;
  }
  
  // Si pas en cache, fetch network
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
    
  } catch (error) {
    // Si offline et HTML, retourner page offline
    if (request.headers.get('accept').includes('text/html')) {
      return caches.match(OFFLINE_URL);
    }
    
    throw error;
  }
}

/**
 * Gestion des notifications push
 */
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification reçue');
  
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Hector CRM';
  const options = {
    body: data.body || 'Nouvelle notification',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: data.url || '/',
    vibrate: [200, 100, 200],
    tag: data.tag || 'general',
    requireInteraction: data.important || false,
    actions: [
      { action: 'open', title: 'Ouvrir' },
      { action: 'close', title: 'Fermer' }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

/**
 * Gestion des clics sur notifications
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification cliquée:', event.action);
  
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    const urlToOpen = event.notification.data || '/';
    
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // Si une fenêtre existe déjà, la focus
          for (const client of clientList) {
            if (client.url === urlToOpen && 'focus' in client) {
              return client.focus();
            }
          }
          
          // Sinon, ouvrir nouvelle fenêtre
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        })
    );
  }
});

/**
 * Background Sync pour actions offline
 */
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-prospects') {
    event.waitUntil(syncProspects());
  }
  
  if (event.tag === 'sync-rdvs') {
    event.waitUntil(syncRDVs());
  }
});

async function syncProspects() {
  // Récupérer prospects en attente de sync depuis IndexedDB
  // Envoyer à l'API
  // Marquer comme synced
  console.log('[SW] Sync prospects...');
}

async function syncRDVs() {
  console.log('[SW] Sync RDVs...');
}
