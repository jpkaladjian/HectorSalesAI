/**
 * Service d'enrichissement automatique Pappers
 * Appelle le service Python PatronService pour enrichir les prospects
 */

import { rateLimiter } from '../rate-limiter';

interface EnrichmentResult {
  success: boolean;
  enrichedData?: {
    siren?: string;
    siret?: string;
    raison_sociale?: string;
    secteur?: string;
    ville?: string;
    code_postal?: string;
    dirigeant?: {
      nom: string;
      prenom: string;
      fonction: string;
    };
    telephone?: string;
    effectif?: number;
    chiffre_affaires?: number;
  };
  error?: string;
}

export async function enrichProspectWithPappers(
  entreprise: string,
  siren?: string
): Promise<EnrichmentResult> {
  try {
    console.log(`🔍 [PAPPERS] Enrichissement: ${entreprise}`);
    
    // Appel au service Python Pappers via l'API PatronService
    let result;
    
    if (siren && siren.length === 9) {
      // Recherche par SIRET (ajouter des zéros si SIREN)
      const siret = siren + '00000'; // Conversion SIREN → SIRET approximatif
      result = await searchPappersBySiret(siret);
    } else {
      // Recherche par nom
      result = await searchPappersByName(entreprise);
    }
    
    if (!result.success) {
      console.warn(`⚠️ [PAPPERS] Enrichissement échoué: ${result.error}`);
      return { success: false, error: result.error };
    }
    
    console.log(`✅ [PAPPERS] Enrichissement réussi: ${entreprise}`);
    return {
      success: true,
      enrichedData: result.data
    };
    
  } catch (error: any) {
    console.error(`❌ [PAPPERS] Erreur enrichissement:`, error);
    return {
      success: false,
      error: error.message
    };
  }
}

async function searchPappersByName(nom: string): Promise<any> {
  return rateLimiter.executeWithLimit('pappers', async () => {
    try {
      const response = await fetch('http://localhost:5001/api/patron/search-nom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom_entreprise: nom })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
    
    if (!data.success || !data.results || data.results.length === 0) {
      return { success: false, error: 'Aucune entreprise trouvée' };
    }
    
      // Prendre le premier résultat (le plus pertinent)
      const firstResult = data.results[0];
      
      return {
        success: true,
        data: {
          siren: firstResult.siret?.substring(0, 9),
          siret: firstResult.siret,
          raison_sociale: firstResult.raison_sociale,
          secteur: firstResult.secteur,
          ville: firstResult.ville,
          code_postal: firstResult.code_postal,
          dirigeant: firstResult.dirigeant,
          telephone: firstResult.telephone
        }
      };
      
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });
}

async function searchPappersBySiret(siret: string): Promise<any> {
  return rateLimiter.executeWithLimit('pappers', async () => {
    try {
      const response = await fetch('http://localhost:5001/api/patron/search-siret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siret })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
    
      if (!data.success || !data.result) {
        return { success: false, error: 'Entreprise non trouvée' };
      }
      
      return {
        success: true,
        data: {
          siren: data.result.siret?.substring(0, 9),
          siret: data.result.siret,
          raison_sociale: data.result.raison_sociale,
          secteur: data.result.secteur,
          ville: data.result.ville,
          code_postal: data.result.code_postal,
          dirigeant: data.result.dirigeant,
          telephone: data.result.telephone
        }
      };
      
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });
}

export default { enrichProspectWithPappers };
