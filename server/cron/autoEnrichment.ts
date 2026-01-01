import cron from 'node-cron';
import { db } from '../db';
import { sql } from 'drizzle-orm';
import { enrichmentOrchestrator } from '../../lib/services/enrichment/enrichment-orchestrator';
import { 
  getEnrichmentCandidates, 
  calculateDataQualityScore,
  shouldEnrich 
} from '../services/dataQualityService';

/**
 * P3.3 - AUTO-ENRICHISSEMENT NOCTURNE
 * 
 * Job CRON enrichissement automatique prospects
 * Exécution : chaque nuit à 3h du matin (Europe/Paris)
 * Limite : 100 prospects par nuit
 * Stratégie : CASCADE INSEE (gratuit) → Pappers (payant)
 * 
 * @author Jean-Pierre Kaladjian
 * @date 31 Octobre 2025
 */

/**
 * Interface résultat enrichissement prospect
 */
interface ProspectEnrichmentResult {
  prospectId: string;
  entreprise: string;
  success: boolean;
  source?: 'insee' | 'pappers' | 'not_found';
  cost?: number;
  duration?: number;
  error?: string;
}

/**
 * Enrichir un prospect via CASCADE (INSEE → Pappers)
 */
async function enrichProspect(prospect: any): Promise<ProspectEnrichmentResult> {
  const startTime = Date.now();
  
  try {
    // Extraire SIREN (priorité legacy_siren, sinon premiers 9 chiffres du SIRET)
    // Note: raw SQL retourne snake_case
    const siren = prospect.legacy_siren || prospect.siret?.substring(0, 9);
    
    if (!siren) {
      return {
        prospectId: prospect.id,
        entreprise: prospect.entreprise,
        success: false,
        error: 'Pas de SIREN/SIRET',
      };
    }
    
    // Enrichissement CASCADE
    const result = await enrichmentOrchestrator.enrichWithCascade(
      siren,
      'FR', // Pour l'instant, CASCADE = France uniquement
      prospect.entreprise // Nom entreprise pour améliorer la recherche
    );
    
    if (!result.data) {
      return {
        prospectId: prospect.id,
        entreprise: prospect.entreprise,
        success: false,
        source: result.source,
        cost: result.cost,
        duration: Date.now() - startTime,
        error: result.error || 'Données non trouvées',
      };
    }
    
    // Extraire données adresse
    const adresseTexte = result.data.adresse?.adresse || null;
    const codePostal = result.data.adresse?.codePostal || null;
    const ville = result.data.adresse?.ville || null;
    
    // Extraire dirigeant principal
    const dirigeantPrincipal = result.data.dirigeants && result.data.dirigeants.length > 0
      ? `${result.data.dirigeants[0].prenom || ''} ${result.data.dirigeants[0].nom}`.trim()
      : null;
    
    // Extraire effectif (prendre effectif ou effectifMin)
    const effectif = result.data.effectif || result.data.effectifMin || null;
    const effectifTexte = result.data.effectifTexte || (effectif ? `${effectif} salariés` : null);
    
    // Mise à jour prospect avec données enrichies
    await db.execute(sql`
      UPDATE prospects
      SET 
        raison_sociale = COALESCE(${result.data.nom}, raison_sociale),
        enseigne_commerciale = COALESCE(${result.data.nomCommercial}, enseigne_commerciale),
        effectif_entreprise = COALESCE(${effectifTexte}, effectif_entreprise),
        capital_social = COALESCE(${result.data.capital?.toString()}, capital_social),
        forme_juridique = COALESCE(${result.data.formeJuridique}, forme_juridique),
        secteur = COALESCE(${result.data.secteurActivite}, secteur),
        adresse_1 = COALESCE(${adresseTexte}, adresse_1),
        code_postal = COALESCE(${codePostal}, code_postal),
        ville = COALESCE(${ville}, ville),
        chiffre_affaires = COALESCE(${result.data.chiffreAffaires}, chiffre_affaires),
        dirigeant_principal = COALESCE(${dirigeantPrincipal}, dirigeant_principal),
        date_creation_entreprise = COALESCE(${result.data.dateCreation}, date_creation_entreprise),
        statut_entreprise = COALESCE(${result.data.etatAdministratif}, statut_entreprise),
        is_fully_enriched = 'true',
        enriched_at = NOW(),
        enrichment_status = 'enriched',
        last_enrichment_date = NOW()
      WHERE id = ${prospect.id}
    `);
    
    // Recalculer et mettre à jour le score qualité
    // Note: on doit récupérer le prospect mis à jour pour calculer le nouveau score
    const updatedProspect = await db.execute(sql`
      SELECT * FROM prospects WHERE id = ${prospect.id}
    `);
    
    const newScore = calculateDataQualityScore(updatedProspect.rows[0]);
    
    await db.execute(sql`
      UPDATE prospects
      SET data_quality_score = ${newScore}
      WHERE id = ${prospect.id}
    `);
    
    return {
      prospectId: prospect.id,
      entreprise: prospect.entreprise,
      success: true,
      source: result.source,
      cost: result.cost,
      duration: Date.now() - startTime,
    };
    
  } catch (error) {
    return {
      prospectId: prospect.id,
      entreprise: prospect.entreprise,
      success: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}

/**
 * Job CRON principal
 */
export function initAutoEnrichmentCron() {
  
  // CRON : chaque nuit à 3h00 (Europe/Paris)
  cron.schedule('0 3 * * *', async () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('[Auto-Enrichment] 🌙 Job démarré à 3h00...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const startTime = Date.now();
    
    try {
      // Récupérer candidats (max 100 par nuit)
      const candidates = await getEnrichmentCandidates(100);
      
      console.log(`[Auto-Enrichment] 📊 ${candidates.length} candidats trouvés`);
      
      if (candidates.length === 0) {
        console.log('[Auto-Enrichment] ✅ Aucun candidat, job terminé');
        return;
      }
      
      const results: ProspectEnrichmentResult[] = [];
      let successCount = 0;
      let failedCount = 0;
      let skippedCount = 0;
      let totalCost = 0;
      
      // Traiter chaque candidat
      for (let i = 0; i < candidates.length; i++) {
        const prospect = candidates[i];
        
        try {
          // Double vérification avec shouldEnrich()
          const { should, reason, priority } = shouldEnrich(prospect);
          
          if (!should) {
            skippedCount++;
            console.log(`[Auto-Enrichment] ⏭️  Skip ${prospect.entreprise}: ${reason}`);
            continue;
          }
          
          console.log(`[Auto-Enrichment] [${i + 1}/${candidates.length}] Enrichissement ${prospect.entreprise} (P${priority})...`);
          
          // Enrichir prospect
          const result = await enrichProspect(prospect);
          results.push(result);
          
          if (result.success) {
            successCount++;
            totalCost += result.cost || 0;
            console.log(`[Auto-Enrichment] ✅ Succès ${prospect.entreprise} via ${result.source} (${result.duration}ms, ${result.cost}€)`);
          } else {
            failedCount++;
            await db.execute(sql`
              UPDATE prospects
              SET enrichment_status = 'failed'
              WHERE id = ${prospect.id}
            `);
            console.log(`[Auto-Enrichment] ❌ Échec ${prospect.entreprise}: ${result.error}`);
          }
          
          // Pause 500ms entre chaque pour éviter rate limits
          if (i < candidates.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
          
        } catch (error) {
          failedCount++;
          console.error(`[Auto-Enrichment] 💥 Erreur critique prospect ${prospect.id}:`, error);
        }
      }
      
      const durationSeconds = Math.round((Date.now() - startTime) / 1000);
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`[Auto-Enrichment] 🏁 Job terminé en ${durationSeconds}s`);
      console.log(`[Auto-Enrichment] 📈 Résultats:`);
      console.log(`  ✅ Succès: ${successCount}`);
      console.log(`  ❌ Échecs: ${failedCount}`);
      console.log(`  ⏭️  Skipped: ${skippedCount}`);
      console.log(`  💰 Coût total: ${totalCost.toFixed(2)}€`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
    } catch (error) {
      console.error('[Auto-Enrichment] 💥 Erreur fatale job:', error);
    }
  }, {
    timezone: 'Europe/Paris'
  });
  
  console.log('[CRON] ✅ Auto-enrichment configuré @ 3h00 (Europe/Paris)');
}

/**
 * Fonction pour trigger manuel (dev/test)
 * Utiliser : ENABLE_MANUAL_ENRICHMENT=true npm run dev
 */
export async function manualEnrichmentTrigger(): Promise<void> {
  console.log('[Auto-Enrichment] 🔧 TRIGGER MANUEL');
  
  const candidates = await getEnrichmentCandidates(10); // Limiter à 10 pour test
  
  console.log(`[Auto-Enrichment] ${candidates.length} candidats pour test manuel`);
  
  for (const prospect of candidates) {
    const result = await enrichProspect(prospect);
    console.log(`[Auto-Enrichment] ${result.success ? '✅' : '❌'} ${prospect.entreprise}`, result);
  }
}
