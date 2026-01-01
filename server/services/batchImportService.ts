/**
 * Service d'import batch CSV avec enrichissement automatique
 * Hector CRM - ADS GROUP
 * 
 * Fonctionnalités:
 * - Upload CSV jusqu'à 1000 lignes
 * - Mapping automatique colonnes
 * - Déduplication intelligente (SIREN, email, téléphone)
 * - Enrichissement CASCADE en background
 * - Progression temps réel
 */

import Papa from 'papaparse';
import { db } from '../db';
import { batchImports, batchImportProspects, prospects } from '@shared/schema';
import { eq, and, or } from 'drizzle-orm';

interface ImportOptions {
  autoEnrich?: boolean;
  deduplicate?: boolean;
  skipDuplicates?: boolean;
}

interface ImportMapping {
  [csvColumn: string]: string; // "Entreprise" → "entreprise"
}

interface ImportResult {
  batchId: string;
  status: 'processing' | 'failed';
  message: string;
}

/**
 * Démarrer un import batch CSV
 */
export async function startBatchImport(
  userId: string,
  entity: string,
  filename: string,
  csvContent: string,
  mapping: ImportMapping,
  options: ImportOptions = {}
): Promise<ImportResult> {
  
  try {
    // Parser CSV
    const parsed = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim()
    });
    
    if (parsed.errors.length > 0) {
      throw new Error(`Erreur parsing CSV: ${parsed.errors[0].message}`);
    }
    
    const rows = parsed.data as any[];
    const totalRows = rows.length;
    
    if (totalRows === 0) {
      throw new Error('Fichier CSV vide');
    }
    
    if (totalRows > 1000) {
      throw new Error(`Maximum 1000 lignes par import (fichier: ${totalRows})`);
    }
    
    // Normaliser les options avec defaults
    const effectiveOptions: ImportOptions = {
      autoEnrich: options.autoEnrich ?? true,
      deduplicate: options.deduplicate ?? true,
      skipDuplicates: options.skipDuplicates ?? true
    };
    
    // Créer batch import
    const [batchImport] = await db.insert(batchImports).values({
      userId,
      entity,
      filename,
      mapping,
      options: {
        auto_enrich: effectiveOptions.autoEnrich,
        deduplicate: effectiveOptions.deduplicate,
        skip_duplicates: effectiveOptions.skipDuplicates
      },
      totalRows,
      status: 'pending'
    }).returning();
    
    // Créer les lignes prospects à traiter
    const importProspects = rows.map((row, index) => ({
      batchImportId: batchImport.id,
      rowNumber: index + 1,
      rawData: row,
      status: 'pending' as const
    }));
    
    await db.insert(batchImportProspects).values(importProspects);
    
    // Lancer le traitement asynchrone avec options normalisées
    processBatchImportAsync(batchImport.id, userId, entity, mapping, effectiveOptions)
      .catch(err => console.error('[Batch Import] Erreur async:', err));
    
    return {
      batchId: batchImport.id,
      status: 'processing',
      message: `Import de ${totalRows} prospects démarré`
    };
    
  } catch (error) {
    console.error('[Batch Import] Erreur démarrage:', error);
    throw error;
  }
}

/**
 * Traiter un batch import (async)
 */
async function processBatchImportAsync(
  batchId: string,
  userId: string,
  entity: string,
  mapping: ImportMapping,
  options: ImportOptions
): Promise<void> {
  
  try {
    // Mettre à jour statut
    await db.update(batchImports)
      .set({ 
        status: 'processing',
        startedAt: new Date()
      })
      .where(eq(batchImports.id, batchId));
    
    // Récupérer les lignes à traiter
    const importProspectsList = await db.query.batchImportProspects.findMany({
      where: and(
        eq(batchImportProspects.batchImportId, batchId),
        eq(batchImportProspects.status, 'pending')
      ),
      orderBy: (bip, { asc }) => [asc(bip.rowNumber)]
    });
    
    let successCount = 0;
    let errorCount = 0;
    let duplicateCount = 0;
    const errors: any[] = [];
    
    // Traiter chaque ligne
    for (let i = 0; i < importProspectsList.length; i++) {
      const importProspect = importProspectsList[i];
      
      try {
        // Mapper les données
        const prospectData = mapCSVRowToProspect(
          importProspect.rawData as any,
          mapping,
          entity,
          userId
        );
        
        // Vérifier doublons si activé
        if (options.deduplicate) {
          const isDuplicate = await checkDuplicate(prospectData, entity);
          
          if (isDuplicate) {
            duplicateCount++;
            
            await db.update(batchImportProspects)
              .set({ 
                status: 'duplicate',
                errorMessage: 'Prospect déjà existant'
              })
              .where(eq(batchImportProspects.id, importProspect.id));
            
            if (options.skipDuplicates) {
              continue; // Skip ce prospect
            }
          }
        }
        
        // Créer le prospect
        const [newProspect] = await db.insert(prospects)
          .values(prospectData)
          .returning();
        
        // Enrichir si activé et SIREN présent
        if (options.autoEnrich && prospectData.legacySiren) {
          // Import enrichissement CASCADE (fire & forget)
          import('./enrichmentCascadeService').then(({ enrichProspectCascade }) => {
            enrichProspectCascade(newProspect.id, prospectData.legacySiren!, userId)
              .catch(err => console.error('[Batch] Erreur enrichissement:', err));
          }).catch(() => {
            console.warn('[Batch] Service enrichissement non disponible');
          });
        }
        
        // Marquer succès
        successCount++;
        
        await db.update(batchImportProspects)
          .set({ 
            status: 'success',
            prospectId: newProspect.id
          })
          .where(eq(batchImportProspects.id, importProspect.id));
        
      } catch (error) {
        errorCount++;
        
        const errorMsg = error instanceof Error ? error.message : 'Erreur inconnue';
        
        errors.push({
          row: importProspect.rowNumber,
          error: errorMsg,
          data: importProspect.rawData
        });
        
        await db.update(batchImportProspects)
          .set({ 
            status: 'error',
            errorMessage: errorMsg
          })
          .where(eq(batchImportProspects.id, importProspect.id));
      }
      
      // Mettre à jour progression
      const progress = Math.round(((i + 1) / importProspectsList.length) * 100);
      
      await db.update(batchImports)
        .set({ 
          progress,
          processedRows: i + 1,
          successCount,
          errorCount,
          duplicateCount
        })
        .where(eq(batchImports.id, batchId));
    }
    
    // Marquer comme terminé
    await db.update(batchImports)
      .set({ 
        status: 'completed',
        completedAt: new Date(),
        errors: errors.slice(0, 100) // Garder max 100 erreurs
      })
      .where(eq(batchImports.id, batchId));
    
    console.log(`[Batch Import] Terminé: ${successCount} succès, ${errorCount} erreurs, ${duplicateCount} doublons`);
    
  } catch (error) {
    console.error('[Batch Import] Erreur traitement:', error);
    
    // Marquer comme failed
    await db.update(batchImports)
      .set({ 
        status: 'failed',
        completedAt: new Date()
      })
      .where(eq(batchImports.id, batchId));
  }
}

/**
 * Mapper une ligne CSV vers un objet prospect
 */
function mapCSVRowToProspect(
  row: any,
  mapping: ImportMapping,
  entity: string,
  userId: string
): any {
  
  const prospect: any = {
    entity,
    userId,
    statut: 'nouveau',
    origine: 'import_csv',
    dateCreation: new Date()
  };
  
  // Appliquer le mapping avec conversion des champs legacy
  for (const [csvColumn, dbField] of Object.entries(mapping)) {
    const value = row[csvColumn];
    
    if (value && String(value).trim() !== '') {
      // Convertir "siren" → "legacySiren" pour compatibilité schéma
      if (dbField === 'siren') {
        prospect.legacySiren = String(value).trim();
      } else {
        prospect[dbField] = String(value).trim();
      }
    }
  }
  
  // Validation et fallbacks
  if (!prospect.entreprise && !prospect.nom) {
    throw new Error('Entreprise ou Nom requis');
  }
  
  // Fallback: si entreprise manque mais nom présent, copier nom → entreprise
  if (!prospect.entreprise && prospect.nom) {
    prospect.entreprise = prospect.nom;
  }
  
  // Normalisation téléphone
  if (prospect.telephone) {
    prospect.telephone = normalizePhone(prospect.telephone);
  }
  
  if (prospect.mobile) {
    prospect.mobile = normalizePhone(prospect.mobile);
  }
  
  // Normalisation email
  if (prospect.email) {
    prospect.email = prospect.email.toLowerCase();
    
    if (!isValidEmail(prospect.email)) {
      throw new Error(`Email invalide: ${prospect.email}`);
    }
  }
  
  // Normalisation SIREN/SIRET avec conversion legacy
  if (prospect.legacySiren) {
    prospect.legacySiren = normalizeSiren(prospect.legacySiren);
  }
  
  if (prospect.siret) {
    prospect.siret = normalizeSiret(prospect.siret);
  }
  
  return prospect;
}

/**
 * Vérifier si un prospect existe déjà
 */
async function checkDuplicate(prospectData: any, entity: string): Promise<boolean> {
  
  // Vérifier par SIREN (prioritaire) - utiliser legacySiren
  if (prospectData.legacySiren) {
    const existing = await db.query.prospects.findFirst({
      where: and(
        eq(prospects.legacySiren, prospectData.legacySiren),
        eq(prospects.entity, entity)
      )
    });
    
    if (existing) return true;
  }
  
  // Vérifier par SIRET
  if (prospectData.siret) {
    const existing = await db.query.prospects.findFirst({
      where: and(
        eq(prospects.siret, prospectData.siret),
        eq(prospects.entity, entity)
      )
    });
    
    if (existing) return true;
  }
  
  // Vérifier par email
  if (prospectData.email) {
    const existing = await db.query.prospects.findFirst({
      where: and(
        eq(prospects.email, prospectData.email),
        eq(prospects.entity, entity)
      )
    });
    
    if (existing) return true;
  }
  
  // Vérifier par téléphone
  if (prospectData.telephone) {
    const existing = await db.query.prospects.findFirst({
      where: and(
        eq(prospects.telephone, prospectData.telephone),
        eq(prospects.entity, entity)
      )
    });
    
    if (existing) return true;
  }
  
  return false;
}

/**
 * Normaliser numéro de téléphone
 */
function normalizePhone(phone: string): string {
  // Supprimer espaces, points, tirets
  let normalized = phone.replace(/[\s\.\-\(\)]/g, '');
  
  // Ajouter +33 si numéro français sans préfixe
  if (normalized.startsWith('0') && normalized.length === 10) {
    normalized = '+33' + normalized.substring(1);
  }
  
  return normalized;
}

/**
 * Normaliser SIREN
 */
function normalizeSiren(siren: string): string {
  const cleaned = siren.replace(/[\s\.\-]/g, '');
  
  if (!/^\d{9}$/.test(cleaned)) {
    throw new Error(`SIREN invalide: ${siren} (doit être 9 chiffres)`);
  }
  
  return cleaned;
}

/**
 * Normaliser SIRET
 */
function normalizeSiret(siret: string): string {
  const cleaned = siret.replace(/[\s\.\-]/g, '');
  
  if (!/^\d{14}$/.test(cleaned)) {
    throw new Error(`SIRET invalide: ${siret} (doit être 14 chiffres)`);
  }
  
  return cleaned;
}

/**
 * Valider email
 */
function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Récupérer le statut d'un import
 */
export async function getBatchImportStatus(batchId: string) {
  const batchImport = await db.query.batchImports.findFirst({
    where: eq(batchImports.id, batchId),
    with: {
      // Relations si définies dans schema
    }
  });
  
  if (!batchImport) {
    throw new Error('Import non trouvé');
  }
  
  return batchImport;
}

/**
 * Récupérer l'historique des imports
 */
export async function getBatchImportHistory(userId: string, limit: number = 20) {
  const imports = await db.query.batchImports.findMany({
    where: eq(batchImports.userId, userId),
    orderBy: (bi, { desc }) => [desc(bi.createdAt)],
    limit
  });
  
  return imports;
}
