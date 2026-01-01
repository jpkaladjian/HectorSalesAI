/**
 * Content script injecté dans les pages LinkedIn
 * Détecte les prospects et aide à l'auto-remplissage
 */

console.log('🤖 Hector LinkedIn Assistant chargé');

// État global
let currentProspectData = null;

/**
 * Extraction des informations du profil LinkedIn
 */
function extractProspectInfo() {
  const prospect = {
    nom: null,
    prenom: null,
    entreprise: null,
    poste: null,
    linkedinUrl: window.location.href,
    secteur: null,
  };

  try {
    // Nom complet (profil ou messagerie)
    const nameElement = document.querySelector('.text-heading-xlarge, .msg-entity-lockup__entity-title, h1');
    if (nameElement) {
      const fullName = nameElement.textContent.trim();
      const parts = fullName.split(' ');
      prospect.prenom = parts[0] || '';
      prospect.nom = parts.slice(1).join(' ') || parts[0];
    }

    // Poste actuel
    const titleElement = document.querySelector('.text-body-medium, .msg-entity-lockup__entity-subtitle, .text-body-small');
    if (titleElement) {
      prospect.poste = titleElement.textContent.trim();
    }

    // Entreprise (extraire depuis le poste si format "Poste chez Entreprise")
    if (prospect.poste && prospect.poste.includes(' chez ')) {
      const parts = prospect.poste.split(' chez ');
      prospect.entreprise = parts[1] || null;
      prospect.poste = parts[0] || prospect.poste;
    } else if (prospect.poste && prospect.poste.includes(' at ')) {
      const parts = prospect.poste.split(' at ');
      prospect.entreprise = parts[1] || null;
      prospect.poste = parts[0] || prospect.poste;
    }

    // Secteur (si disponible)
    const industryElement = document.querySelector('[data-field="industry_name"]');
    if (industryElement) {
      prospect.secteur = industryElement.textContent.trim();
    }

    currentProspectData = prospect;
    console.log('✅ Prospect détecté:', prospect);
    
    return prospect;

  } catch (error) {
    console.error('❌ Erreur extraction prospect:', error);
    return prospect;
  }
}

/**
 * Auto-remplissage d'un champ de message
 */
function autofillMessage(message) {
  try {
    // Sélecteurs pour la boîte de message LinkedIn
    const selectors = [
      '.msg-form__contenteditable',
      '.msg-form__msg-content-container--scrollable',
      '[contenteditable="true"]',
      'div[role="textbox"]',
    ];

    for (const selector of selectors) {
      const messageBox = document.querySelector(selector);
      if (messageBox) {
        // Simuler un clic pour focus
        messageBox.click();
        
        // Insérer le message
        messageBox.innerHTML = message.replace(/\n/g, '<br>');
        
        // Déclencher les événements pour que LinkedIn détecte le changement
        messageBox.dispatchEvent(new Event('input', { bubbles: true }));
        messageBox.dispatchEvent(new Event('change', { bubbles: true }));
        
        console.log('✅ Message auto-rempli');
        return true;
      }
    }

    console.warn('⚠️ Boîte de message non trouvée');
    return false;
  } catch (error) {
    console.error('❌ Erreur auto-remplissage:', error);
    return false;
  }
}

/**
 * Ajout d'un bouton d'action Hector sur le profil
 */
function injectHectorButton() {
  if (document.getElementById('hector-action-btn')) {
    return; // Déjà injecté
  }

  try {
    // Trouver la zone des boutons d'action
    const actionBar = document.querySelector('.pvs-profile-actions, .ph5');
    if (!actionBar) return;

    // Créer le bouton Hector
    const hectorBtn = document.createElement('button');
    hectorBtn.id = 'hector-action-btn';
    hectorBtn.className = 'hector-quick-action';
    hectorBtn.innerHTML = '🤖 Hector Assistant';
    hectorBtn.title = 'Ouvrir Hector pour ce prospect';
    
    hectorBtn.addEventListener('click', () => {
      // Ouvrir le popup de l'extension
      chrome.runtime.sendMessage({ action: 'openPopup' });
    });

    actionBar.appendChild(hectorBtn);
    console.log('✅ Bouton Hector injecté');
  } catch (error) {
    console.error('❌ Erreur injection bouton:', error);
  }
}

/**
 * Écoute des messages depuis le popup ou le background
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('📩 Message reçu:', request);

  if (request.action === 'getProspectInfo') {
    const prospect = extractProspectInfo();
    sendResponse({ prospect });
  }

  if (request.action === 'autofillMessage') {
    const success = autofillMessage(request.message);
    sendResponse({ success });
  }

  if (request.action === 'extractProspect') {
    const prospect = extractProspectInfo();
    sendResponse({ prospect });
  }

  return true; // Garder le canal ouvert pour sendResponse asynchrone
});

// Initialisation au chargement
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      extractProspectInfo();
      injectHectorButton();
    }, 1000);
  });
} else {
  setTimeout(() => {
    extractProspectInfo();
    injectHectorButton();
  }, 1000);
}

// Observer les changements de page (navigation SPA)
let lastUrl = window.location.href;
new MutationObserver(() => {
  const currentUrl = window.location.href;
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    console.log('📍 Navigation détectée');
    setTimeout(() => {
      extractProspectInfo();
      injectHectorButton();
    }, 1500);
  }
}).observe(document.body, { subtree: true, childList: true });
