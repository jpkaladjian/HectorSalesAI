const CACHE_NAME = 'hector-gps-v1';
const GPS_QUEUE_DB = 'gps-queue';
const GPS_QUEUE_STORE = 'pending-positions';

self.addEventListener('install', (event) => {
  console.log('[SW GPS] Service Worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW GPS] Service Worker activating...');
  event.waitUntil(clients.claim());
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-gps-positions') {
    console.log('[SW GPS] Background sync triggered');
    event.waitUntil(syncPendingPositions());
  }
});

async function syncPendingPositions() {
  try {
    const db = await openDatabase();
    const tx = db.transaction(GPS_QUEUE_STORE, 'readonly');
    const store = tx.objectStore(GPS_QUEUE_STORE);
    const positions = await store.getAll();

    console.log(`[SW GPS] Syncing ${positions.length} pending positions`);

    if (positions.length === 0) {
      return;
    }

    for (const position of positions) {
      try {
        const response = await fetch('/api/gps/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(position.data),
          credentials: 'include',
        });

        if (response.ok) {
          const deleteTx = db.transaction(GPS_QUEUE_STORE, 'readwrite');
          const deleteStore = deleteTx.objectStore(GPS_QUEUE_STORE);
          await deleteStore.delete(position.id);
          console.log(`[SW GPS] Position ${position.id} synced successfully`);
        } else {
          console.warn(`[SW GPS] Failed to sync position ${position.id}: HTTP ${response.status}`);
        }
      } catch (error) {
        console.error(`[SW GPS] Failed to sync position ${position.id}:`, error);
      }
    }

    const finalTx = db.transaction(GPS_QUEUE_STORE, 'readonly');
    const finalStore = finalTx.objectStore(GPS_QUEUE_STORE);
    const remaining = await finalStore.getAll();
    console.log(`[SW GPS] Sync complete. ${remaining.length} positions remaining in queue`);
  } catch (error) {
    console.error('[SW GPS] Error in syncPendingPositions:', error);
    throw error;
  }
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(GPS_QUEUE_DB, 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(GPS_QUEUE_STORE)) {
        db.createObjectStore(GPS_QUEUE_STORE, { 
          keyPath: 'id', 
          autoIncrement: true 
        });
      }
    };
  });
}

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SYNC_NOW') {
    console.log('[SW GPS] Manual sync requested via postMessage');
    event.waitUntil(syncPendingPositions());
  }
});
