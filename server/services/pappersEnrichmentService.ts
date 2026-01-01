import axios from 'axios';

interface PappersBasicInfo {
  nom_entreprise: string;
  nom_commercial: string;
  siren: string;
  adresse_complete: string;
  ville: string;
  code_postal: string;
  code_naf: string;
  activite_principale: string;
}

interface EnrichedData {
  raison_sociale: string;
  enseigne_commerciale: string;
  secteur: string;
  adresse: string;
  ville: string;
  code_postal: string;
  siren: string;
}

// Mapping NAF → Secteur
function mapNafToSecteur(codeNaf: string, activitePrincipale: string = ""): string {
  if (!codeNaf) codeNaf = "";
  
  // Mapping par préfixe NAF
  const nafMapping: Record<string, string> = {
    "47.73": "pharmacie",
    "47.11": "commerce_alimentaire",
    "47.19": "commerce_alimentaire",
    "47.2": "commerce_alimentaire",
    "56.10": "restaurant_traditionnel",
    "56.21": "restaurant_traditionnel",
    "56.30": "restaurant_traditionnel",
    "55.": "restaurant_traditionnel",
  };
  
  // Vérifier mapping par préfixe
  for (const [nafPrefix, secteur] of Object.entries(nafMapping)) {
    if (codeNaf.startsWith(nafPrefix)) {
      return secteur;
    }
  }
  
  // Mapping par mots-clés
  if (activitePrincipale) {
    const activiteLower = activitePrincipale.toLowerCase();
    
    if (["pharmacie", "pharmaceutique", "santé", "officine", "médical"].some(w => activiteLower.includes(w))) {
      return "pharmacie";
    }
    if (["restaurant", "traiteur", "hôtel", "café", "bar", "brasserie"].some(w => activiteLower.includes(w))) {
      return "restaurant_traditionnel";
    }
    if (["commerce", "magasin", "supermarché", "alimentaire", "épicerie"].some(w => activiteLower.includes(w))) {
      return "commerce_alimentaire";
    }
  }
  
  return "autres_secteurs_structure";
}

// Récupérer infos basiques Pappers
async function getPappersBasicInfo(siret: string): Promise<PappersBasicInfo | null> {
  try {
    const apiToken = process.env.PAPPERS_API_KEY;
    
    if (!apiToken) {
      console.error("❌ PAPPERS_API_KEY non configurée");
      return null;
    }
    
    const response = await axios.get('https://api.pappers.fr/v2/entreprise', {
      params: {
        api_token: apiToken,
        siret: siret,
      },
      timeout: 3000 // 3 secondes max
    });
    
    if (response.status !== 200) {
      return null;
    }
    
    const data = response.data;
    const siege = data.siege || {};
    
    return {
      nom_entreprise: data.nom_entreprise || "",
      nom_commercial: data.nom_commercial || "",
      siren: data.siren || "",
      adresse_complete: siege.adresse_ligne_1 || "",
      ville: siege.ville || "",
      code_postal: siege.code_postal || "",
      code_naf: data.code_naf || "",
      activite_principale: data.libelle_code_naf || ""
    };
    
  } catch (error) {
    console.error("Erreur Pappers léger:", error);
    return null;
  }
}

// Fonction principale d'enrichissement
export async function enrichSiretQuick(siret: string): Promise<{ success: boolean; data?: EnrichedData; error?: string }> {
  try {
    // Valider SIRET
    if (!siret || siret.length !== 14 || !/^\d{14}$/.test(siret)) {
      return { success: false, error: 'SIRET invalide (14 chiffres requis)' };
    }
    
    console.log(`[ENRICH-NODE] 🔍 Enrichissement SIRET rapide : ${siret}`);
    
    // Appeler Pappers
    const pappersData = await getPappersBasicInfo(siret);
    
    if (!pappersData) {
      console.log(`[ENRICH-NODE] ❌ SIRET non trouvé`);
      return { success: false, error: 'SIRET non trouvé dans la base Pappers' };
    }
    
    // Mapper NAF → Secteur
    const secteur = mapNafToSecteur(pappersData.code_naf, pappersData.activite_principale);
    
    console.log(`[ENRICH-NODE] ✅ Données enrichies`);
    console.log(`[ENRICH-NODE]    - Raison sociale : ${pappersData.nom_entreprise}`);
    console.log(`[ENRICH-NODE]    - Secteur : ${secteur} (NAF: ${pappersData.code_naf})`);
    
    // Retourner données enrichies
    return {
      success: true,
      data: {
        raison_sociale: pappersData.nom_entreprise,
        enseigne_commerciale: pappersData.nom_commercial || pappersData.nom_entreprise,
        secteur: secteur,
        adresse: pappersData.adresse_complete,
        ville: pappersData.ville,
        code_postal: pappersData.code_postal,
        siren: pappersData.siren
      }
    };
    
  } catch (error) {
    console.error('[ENRICH-NODE] ❌ Erreur enrichissement SIRET:', error);
    return { success: false, error: 'Erreur serveur lors de l\'enrichissement' };
  }
}
