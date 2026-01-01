/**
 * Utilitaires partagés entre frontend et backend
 */

export type Entity = 'france' | 'luxembourg' | 'belgique';

/**
 * Détecte automatiquement l'entité (pays) en fonction du code postal ou du pays
 * 
 * @param codePostal - Code postal (ex: "75118", "L-1234", "B-1000")
 * @param pays - Nom du pays (ex: "France", "Luxembourg", "Belgique")
 * @returns Entity détectée ou null si impossible à déterminer
 * 
 * @example
 * detectEntityFromAddress("75118", "France") // => "france"
 * detectEntityFromAddress("L-1234") // => "luxembourg"
 * detectEntityFromAddress("1000", "Belgique") // => "belgique"
 */
export function detectEntityFromAddress(
  codePostal?: string | null,
  pays?: string | null
): Entity | null {
  // Normaliser les inputs
  const normalizedCodePostal = codePostal?.trim().toUpperCase() || '';
  const normalizedPays = pays?.trim().toLowerCase() || '';

  // 1. Détection par code postal (préféré car plus précis)
  if (normalizedCodePostal) {
    // Luxembourg: Commence par "L-" ou est un nombre entre 1000-9999
    if (normalizedCodePostal.startsWith('L-') || 
        (/^\d{4}$/.test(normalizedCodePostal) && 
         parseInt(normalizedCodePostal) >= 1000 && 
         parseInt(normalizedCodePostal) <= 9999 &&
         normalizedPays.includes('luxemb'))) {
      return 'luxembourg';
    }

    // Belgique: Commence par "B-" ou est un nombre entre 1000-9999 avec mention Belgique
    if (normalizedCodePostal.startsWith('B-') || 
        (/^\d{4}$/.test(normalizedCodePostal) && 
         normalizedPays.includes('belg'))) {
      return 'belgique';
    }

    // France: 5 chiffres (ex: 75018, 13001, 69003)
    if (/^\d{5}$/.test(normalizedCodePostal)) {
      return 'france';
    }
  }

  // 2. Détection par nom du pays (fallback)
  if (normalizedPays) {
    if (normalizedPays.includes('france') || normalizedPays.includes('français')) {
      return 'france';
    }
    if (normalizedPays.includes('luxemb')) {
      return 'luxembourg';
    }
    if (normalizedPays.includes('belg') || normalizedPays.includes('bruxelles')) {
      return 'belgique';
    }
  }

  // 3. Impossible à déterminer
  return null;
}

/**
 * Obtient le drapeau emoji pour une entity
 */
export function getEntityFlag(entity: Entity): string {
  const flags: Record<Entity, string> = {
    france: '🇫🇷',
    luxembourg: '🇱🇺',
    belgique: '🇧🇪',
  };
  return flags[entity];
}

/**
 * Obtient le nom complet du pays pour une entity
 */
export function getEntityCountryName(entity: Entity): string {
  const names: Record<Entity, string> = {
    france: 'France',
    luxembourg: 'Luxembourg',
    belgique: 'Belgique',
  };
  return names[entity];
}

/**
 * Valide si une chaîne est une entity valide
 */
export function isValidEntity(value: string): value is Entity {
  return ['france', 'luxembourg', 'belgique'].includes(value);
}
