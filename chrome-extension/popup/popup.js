// État global
let currentProspect = null;
let userInfo = null;

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', async () => {
  await checkAuthentication();
  await detectCurrentPage();
  setupEventListeners();
});

/**
 * Vérification de l'authentification
 */
async function checkAuthentication() {
  try {
    const result = await checkAuth();
    if (result.authenticated) {
      userInfo = result.user;
      document.getElementById('user-info').textContent = `👤 ${userInfo.firstName || userInfo.email}`;
      document.getElementById('logout-btn').style.display = 'inline-block';
    } else {
      document.getElementById('user-info').textContent = '❌ Non connecté';
      document.getElementById('user-info').style.color = '#d32f2f';
    }
  } catch (error) {
    console.error('Auth check failed:', error);
    document.getElementById('user-info').textContent = '⚠️ Erreur connexion';
  }
}

/**
 * Détection de la page active
 */
async function detectCurrentPage() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (tab.url && tab.url.includes('linkedin.com')) {
      // Page LinkedIn détectée
      document.getElementById('not-linkedin').style.display = 'none';
      document.getElementById('linkedin-active').style.display = 'block';
      
      // Injecter le content script si besoin
      await injectContentScript(tab.id);
      
      // Récupérer les infos du prospect
      await fetchProspectInfo(tab.id);
    } else {
      // Pas sur LinkedIn
      document.getElementById('not-linkedin').style.display = 'block';
      document.getElementById('linkedin-active').style.display = 'none';
    }
  } catch (error) {
    console.error('Page detection failed:', error);
  }
}

/**
 * Injection du content script
 */
async function injectContentScript(tabId) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['content/linkedin-inject.js']
    });
  } catch (error) {
    // Déjà injecté ou erreur
    console.log('Content script injection skipped:', error.message);
  }
}

/**
 * Récupération des infos prospect depuis la page
 */
async function fetchProspectInfo(tabId) {
  try {
    const response = await chrome.tabs.sendMessage(tabId, { action: 'getProspectInfo' });
    
    if (response && response.prospect) {
      currentProspect = response.prospect;
      document.getElementById('prospect-nom').textContent = currentProspect.nom || '-';
      document.getElementById('prospect-entreprise').textContent = currentProspect.entreprise || '-';
      document.getElementById('prospect-poste').textContent = currentProspect.poste || '-';
      
      // Charger les recommandations
      await loadRecommendations();
    }
  } catch (error) {
    console.error('Failed to fetch prospect info:', error);
  }
}

/**
 * Chargement des recommandations
 */
async function loadRecommendations() {
  const container = document.getElementById('recommendations');
  
  try {
    container.innerHTML = '<p class="loading">Chargement...</p>';
    
    // Récupérer timing optimal
    const timing = await getOptimalTiming('linkedin_message');
    
    container.innerHTML = `
      <p><strong>📅 Meilleur jour:</strong> ${timing.bestDays[0].dayName}</p>
      <p><strong>⏰ Meilleure heure:</strong> ${timing.bestHours[0].hourRange}</p>
      <p class="text-muted">${timing.reasoning}</p>
    `;
  } catch (error) {
    container.innerHTML = '<p class="text-muted">Erreur chargement recommandations</p>';
    console.error('Failed to load recommendations:', error);
  }
}

/**
 * Configuration des event listeners
 */
function setupEventListeners() {
  // Ajouter prospect au CRM
  document.getElementById('add-prospect-btn').addEventListener('click', async () => {
    if (!currentProspect) return;
    
    try {
      await createProspect({
        nom: currentProspect.nom,
        prenom: currentProspect.prenom || '',
        entreprise: currentProspect.entreprise,
        poste: currentProspect.poste,
        linkedinUrl: currentProspect.linkedinUrl,
      });
      
      alert('✅ Prospect ajouté au CRM !');
    } catch (error) {
      alert(`❌ Erreur: ${error.message}`);
    }
  });

  // Générer message IA
  document.getElementById('generate-msg-btn').addEventListener('click', async () => {
    if (!currentProspect) return;
    
    const canal = document.getElementById('canal-select').value;
    const btn = document.getElementById('generate-msg-btn');
    
    try {
      btn.textContent = '⏳ Génération...';
      btn.disabled = true;
      
      const result = await generateMessage(currentProspect, canal, 1);
      
      document.getElementById('message-content').value = result.message;
      document.getElementById('generated-message').style.display = 'block';
      
      btn.textContent = '✨ Générer Message IA';
      btn.disabled = false;
    } catch (error) {
      alert(`❌ Erreur: ${error.message}`);
      btn.textContent = '✨ Générer Message IA';
      btn.disabled = false;
    }
  });

  // Copier message
  document.getElementById('copy-msg-btn').addEventListener('click', () => {
    const message = document.getElementById('message-content').value;
    navigator.clipboard.writeText(message);
    
    const btn = document.getElementById('copy-msg-btn');
    const originalText = btn.textContent;
    btn.textContent = '✅ Copié !';
    setTimeout(() => {
      btn.textContent = originalText;
    }, 2000);
  });

  // Déconnexion
  document.getElementById('logout-btn').addEventListener('click', () => {
    // Ouvrir la page de déconnexion dans un nouvel onglet
    chrome.tabs.create({ url: `${API_BASE_URL}/api/auth/logout` });
  });
}
