/**
 * Utilitaires de validation SIREN/SIRET
 * 
 * Algorithme de Luhn pour vérifier la validité d'un SIREN/SIRET
 * Utilisé par :
 * - INSEEProvider (enrichissement)
 * - EnrichmentOrchestrator (phone lookup → CASCADE)
 */

/**
 * Valider un SIREN ou SIRET avec algorithme de Luhn
 * 
 * @param identifier SIREN (9 chiffres) ou SIRET (14 chiffres)
 * @returns true si valide, false sinon
 */
export function isValidSirenSiret(identifier: string): boolean {
  // SIREN: 9 chiffres - utiliser algorithme Luhn adapté
  if (identifier.length === 9) {
    if (!/^\d{9}$/.test(identifier)) return false;
    
    // Pour SIREN, appliquer Luhn sur 9 chiffres avec positions IMPAIRES doublées
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      let digit = parseInt(identifier[i]);
      if (i % 2 === 1) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
    }
    return sum % 10 === 0;
  }
  
  // SIRET: 14 chiffres - validation Luhn sur les 14 chiffres complets
  if (identifier.length === 14) {
    return /^\d{14}$/.test(identifier) && luhnCheck(identifier);
  }
  
  return false;
}

/**
 * Algorithme de Luhn pour valider un SIRET (14 chiffres complets)
 * 
 * Note : Pour un SIRET, l'algorithme de Luhn s'applique sur les 14 chiffres,
 * pas seulement le SIREN. Les chiffres en position PAIRE (0, 2, 4...) sont doublés.
 * 
 * @param siret SIRET à valider (14 chiffres)
 * @returns true si checksum valide, false sinon
 */
export function luhnCheck(siret: string): boolean {
  let sum = 0;
  
  for (let i = 0; i < siret.length; i++) {
    let digit = parseInt(siret[i]);
    
    // Multiplier les chiffres en position paire (0, 2, 4, 6...) par 2
    if (i % 2 === 0) {
      digit *= 2;
      // Si résultat > 9, soustraire 9
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
  }
  
  // Le SIRET est valide si la somme est multiple de 10
  return sum % 10 === 0;
}

/**
 * Vérifier si un SIRET est valide (format + Luhn)
 * 
 * @param siret SIRET à valider (14 chiffres)
 * @returns Object avec statut et raison si invalide
 */
export function validateSiret(siret: string): { valid: boolean; reason?: string } {
  // Vérifier format 14 chiffres
  if (!/^\d{14}$/.test(siret)) {
    return {
      valid: false,
      reason: `Format invalide (attendu: 14 chiffres, reçu: ${siret.length})`
    };
  }
  
  // Vérifier algorithme de Luhn sur le SIREN (9 premiers chiffres)
  const siren = siret.substring(0, 9);
  if (!luhnCheck(siren)) {
    return {
      valid: false,
      reason: 'Algorithme de Luhn échoué (SIREN invalide)'
    };
  }
  
  return { valid: true };
}
