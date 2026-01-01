import { db } from '../db';
import { sql } from 'drizzle-orm';

/**
 * P3.3 - DATA QUALITY SERVICE
 * Service de calcul et gestion de la qualité des données prospects
 * 
 * @author Jean-Pierre Kaladjian
 * @date 31 Octobre 2025
 */

/**
 * Calculer le score qualité d'un prospect (0-100)
 * 
 * Répartition des points :
 * - SIREN/SIRET (30 points - critique pour enrichissement)
 * - Contact (20 points - email + téléphone)
 * - Identité (15 points - nom, prénom, fonction)
 * - Localisation (15 points - adresse, CP, ville)
 * - Données business (20 points - effectif, CA, secteur)
 * 
 * Note: Lit les propriétés en snake_case (depuis raw SQL)
 */
export function calculateDataQualityScore(prospect: any): number {
  let score = 0;
  
  // SIREN/SIRET (30 points - critique)
  const legacySiren = prospect.legacy_siren || prospect.legacySiren;
  const siret = prospect.siret;
  
  if (legacySiren && /^\d{9}$/.test(legacySiren)) {
    score += 25;
  }
  if (siret && /^\d{14}$/.test(siret)) {
    score += 5;
  }
  
  // Contact (20 points)
  const email = prospect.email;
  const telephone = prospect.telephone;
  const mobile = prospect.mobile;
  
  if (email) score += 10;
  if (telephone || mobile) score += 10;
  
  // Identité (15 points)
  const nom = prospect.nom;
  const prenom = prospect.prenom;
  const fonction = prospect.fonction;
  
  if (nom && prenom) score += 10;
  if (fonction) score += 5;
  
  // Localisation (15 points)
  const adresse1 = prospect.adresse_1 || prospect.adresse1;
  const codePostal = prospect.code_postal || prospect.codePostal;
  const ville = prospect.ville;
  
  if (adresse1) score += 5;
  if (codePostal) score += 5;
  if (ville) score += 5;
  
  // Données business (20 points)
  const effectifEntreprise = prospect.effectif_entreprise || prospect.effectifEntreprise;
  const chiffreAffaires = prospect.chiffre_affaires || prospect.chiffreAffaires;
  const secteur = prospect.secteur;
  
  if (effectifEntreprise) score += 7;
  if (chiffreAffaires) score += 7;
  if (secteur) score += 6;
  
  return Math.min(score, 100);
}

/**
 * Déterminer si un prospect doit être enrichi
 * 
 * Logique de priorisation :
 * - Priorité 1 : Jamais enrichi OU score < 30
 * - Priorité 2 : Données > 1 an
 * - Priorité 3 : Score < 70 ET données > 6 mois
 * 
 * Note: Lit les propriétés en snake_case (depuis raw SQL)
 */
export function shouldEnrich(prospect: any): { 
  should: boolean; 
  reason: string; 
  priority: number; 
} {
  const legacySiren = prospect.legacy_siren || prospect.legacySiren;
  const siret = prospect.siret;
  const lastEnrichmentDate = prospect.last_enrichment_date || prospect.lastEnrichmentDate;
  
  // Pas de SIREN = impossible d'enrichir
  if (!legacySiren && !siret) {
    return { should: false, reason: 'Pas de SIREN', priority: 0 };
  }
  
  // Jamais enrichi = priorité haute
  if (!lastEnrichmentDate) {
    return { should: true, reason: 'Jamais enrichi', priority: 1 };
  }
  
  // Score qualité très faible (<30) = priorité haute
  const score = calculateDataQualityScore(prospect);
  if (score < 30) {
    return { should: true, reason: `Score faible (${score}/100)`, priority: 1 };
  }
  
  // Données obsolètes (>365 jours) = priorité moyenne
  const daysSince = (Date.now() - new Date(lastEnrichmentDate).getTime()) 
    / (1000 * 60 * 60 * 24);
  
  if (daysSince > 365) {
    return { should: true, reason: `Données >1 an`, priority: 2 };
  }
  
  // Données partielles (score <70) + >6 mois = priorité basse
  if (score < 70 && daysSince > 180) {
    return { should: true, reason: `Score moyen (${score}/100)`, priority: 3 };
  }
  
  return { should: false, reason: 'Données à jour', priority: 0 };
}

/**
 * Récupérer candidats enrichissement avec filtrage intelligent
 * 
 * Critères :
 * - Possède SIREN ou SIRET
 * - Jamais enrichi OU score < 70
 * - Tri par score (plus faible d'abord)
 * - Filtrage supplémentaire par shouldEnrich()
 * - Tri final par priorité
 */
export async function getEnrichmentCandidates(limit: number = 100): Promise<any[]> {
  try {
    const result = await db.execute(sql`
      SELECT * FROM prospects
      WHERE (legacy_siren IS NOT NULL OR siret IS NOT NULL)
      AND (last_enrichment_date IS NULL OR data_quality_score < 70)
      ORDER BY data_quality_score ASC NULLS FIRST
      LIMIT ${limit}
    `);
    
    const candidates = result.rows as any[];
    
    // Filtrer avec logique métier
    return candidates
      .filter(p => shouldEnrich(p).should)
      .sort((a, b) => shouldEnrich(a).priority - shouldEnrich(b).priority);
    
  } catch (error) {
    console.error('[Data Quality] Erreur récupération candidates:', error);
    return [];
  }
}

/**
 * Mettre à jour métriques qualité d'un prospect
 * 
 * Recalcule le score et le stocke dans la BDD
 */
export async function updateProspectQualityMetrics(prospectId: string): Promise<void> {
  try {
    const result = await db.execute(sql`
      SELECT * FROM prospects WHERE id = ${prospectId}
    `);
    
    const prospect = result.rows[0];
    if (!prospect) return;
    
    const score = calculateDataQualityScore(prospect);
    
    await db.execute(sql`
      UPDATE prospects
      SET data_quality_score = ${score}
      WHERE id = ${prospectId}
    `);
    
  } catch (error) {
    console.error('[Data Quality] Erreur update metrics:', error);
  }
}

/**
 * Obtenir statistiques globales de qualité des données
 */
export async function getQualityStats(): Promise<{
  totalProspects: number;
  avgQualityScore: number;
  lowQuality: number; // score < 30
  mediumQuality: number; // score 30-70
  highQuality: number; // score > 70
  neverEnriched: number;
  enrichmentNeeded: number;
}> {
  try {
    const result = await db.execute(sql`
      SELECT 
        COUNT(*) as total,
        AVG(data_quality_score) as avg_score,
        COUNT(CASE WHEN data_quality_score < 30 THEN 1 END) as low,
        COUNT(CASE WHEN data_quality_score >= 30 AND data_quality_score <= 70 THEN 1 END) as medium,
        COUNT(CASE WHEN data_quality_score > 70 THEN 1 END) as high,
        COUNT(CASE WHEN last_enrichment_date IS NULL THEN 1 END) as never_enriched
      FROM prospects
      WHERE legacy_siren IS NOT NULL OR siret IS NOT NULL
    `);
    
    const row = result.rows[0] as any;
    
    return {
      totalProspects: parseInt(row.total) || 0,
      avgQualityScore: parseFloat(row.avg_score) || 0,
      lowQuality: parseInt(row.low) || 0,
      mediumQuality: parseInt(row.medium) || 0,
      highQuality: parseInt(row.high) || 0,
      neverEnriched: parseInt(row.never_enriched) || 0,
      enrichmentNeeded: parseInt(row.low) + parseInt(row.never_enriched),
    };
  } catch (error) {
    console.error('[Data Quality] Erreur récupération stats:', error);
    return {
      totalProspects: 0,
      avgQualityScore: 0,
      lowQuality: 0,
      mediumQuality: 0,
      highQuality: 0,
      neverEnriched: 0,
      enrichmentNeeded: 0,
    };
  }
}
