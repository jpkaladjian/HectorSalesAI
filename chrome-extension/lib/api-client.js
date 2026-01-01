/**
 * Client API pour communiquer avec Hector backend
 */

// Configuration API (auto-détection environnement)
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000'
  : 'https://your-replit-app.replit.app'; // À remplacer par l'URL de production

/**
 * Requête authentifiée vers l'API Hector
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    credentials: 'include', // Envoyer les cookies de session
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const response = await fetch(url, {
    ...defaultOptions,
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Récupère les informations d'un prospect via nom/entreprise
 */
async function searchProspect(nom, entreprise) {
  return apiRequest(`/api/crm/prospects/search?nom=${encodeURIComponent(nom)}&entreprise=${encodeURIComponent(entreprise)}`);
}

/**
 * Génère un message personnalisé via IA
 */
async function generateMessage(prospectData, canal, etape) {
  return apiRequest('/api/prospection/generate-message', {
    method: 'POST',
    body: JSON.stringify({
      prospectData,
      canal,
      etape,
    }),
  });
}

/**
 * Récupère les recommandations de canal optimal
 */
async function getCanalRecommendation(prospectId) {
  return apiRequest(`/api/advanced/canal-recommendation/${prospectId}`);
}

/**
 * Récupère le timing optimal d'envoi
 */
async function getOptimalTiming(canal) {
  return apiRequest(`/api/advanced/optimal-timing/${canal}`);
}

/**
 * Crée un nouveau prospect dans le CRM
 */
async function createProspect(prospectData) {
  return apiRequest('/api/crm/prospects', {
    method: 'POST',
    body: JSON.stringify(prospectData),
  });
}

/**
 * Vérifie l'état de connexion utilisateur
 */
async function checkAuth() {
  try {
    const user = await apiRequest('/api/auth/user');
    return { authenticated: true, user };
  } catch (error) {
    return { authenticated: false, user: null };
  }
}

// Export pour utilisation dans extension
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    apiRequest,
    searchProspect,
    generateMessage,
    getCanalRecommendation,
    getOptimalTiming,
    createProspect,
    checkAuth,
  };
}
