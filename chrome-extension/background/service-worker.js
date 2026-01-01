/**
 * Service Worker pour Hector LinkedIn Assistant
 * Gère les événements en arrière-plan
 */

console.log('🚀 Hector Service Worker started');

// Installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('✅ Extension installée:', details.reason);
  
  if (details.reason === 'install') {
    // Première installation
    chrome.tabs.create({
      url: 'https://your-replit-app.replit.app'
    });
  }
});

// Écoute des messages depuis les content scripts ou popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('📩 Message reçu dans service worker:', request);

  if (request.action === 'openPopup') {
    // Ouvrir le popup programmatically (non supporté dans MV3)
    // Utiliser plutôt une notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: '../icons/icon48.png',
      title: 'Hector Assistant',
      message: 'Cliquez sur l\'icône de l\'extension dans la barre d\'outils',
    });
  }

  if (request.action === 'saveProspect') {
    // Sauvegarder temporairement le prospect
    chrome.storage.local.set({
      lastProspect: request.prospect,
      lastProspectTime: Date.now(),
    }, () => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (request.action === 'getLastProspect') {
    chrome.storage.local.get(['lastProspect', 'lastProspectTime'], (result) => {
      const isRecent = result.lastProspectTime && (Date.now() - result.lastProspectTime < 3600000); // 1h
      sendResponse({
        prospect: isRecent ? result.lastProspect : null,
      });
    });
    return true;
  }

  return true;
});

// Gestion des notifications
chrome.notifications.onClicked.addListener((notificationId) => {
  console.log('🔔 Notification cliquée:', notificationId);
  chrome.notifications.clear(notificationId);
});

// Synchronisation périodique (optionnel)
chrome.alarms.create('syncData', { periodInMinutes: 30 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'syncData') {
    console.log('🔄 Synchronisation périodique');
    // Nettoyer les données anciennes
    chrome.storage.local.get(['lastProspectTime'], (result) => {
      if (result.lastProspectTime && (Date.now() - result.lastProspectTime > 86400000)) {
        // Supprimer si > 24h
        chrome.storage.local.remove(['lastProspect', 'lastProspectTime']);
      }
    });
  }
});

// Gestion des erreurs
self.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Promise rejection non gérée:', event.reason);
});
