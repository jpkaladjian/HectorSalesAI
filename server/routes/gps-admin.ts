import express, { Request, Response } from 'express';
import { db } from '../db';
import {
  gpsSystemConfig,
  gpsPositions,
  gpsOpportunities,
  gpsDailyStats,
  apiCredentials,
  type UpdateGpsSystemConfig,
} from '../../shared/schema-gps';
import { eq, and, gte, desc, sql } from 'drizzle-orm';
import { configCacheService, encryptionService } from '../services/gps';
import { batchGeocodingService } from '../services/gps/batchGeocodingService';
import { z } from 'zod';
// Bug Fix #2: Import auth middleware
import { isAuthenticated, isAdmin } from '../auth';

const router = express.Router();

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ROUTES API ADMIN - MODULE GPS TRACKING
// Accès: admin_groupe uniquement
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SCHEMAS ZOD VALIDATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const updateConfigSchema = z.object({
  trackingEnabled: z.boolean().optional(),
  trackingFrequencyMinutes: z.number().int().min(1).max(60).optional(),
  trackingHoursStart: z.string().regex(/^\d{2}:\d{2}:\d{2}$/).optional(),
  trackingHoursEnd: z.string().regex(/^\d{2}:\d{2}:\d{2}$/).optional(),
  trackingDays: z.array(z.number().int().min(1).max(7)).optional(),
  opportunitiesEnabled: z.boolean().optional(),
  opportunitiesRadiusKm: z.string().optional(),
  opportunitiesMinPriority: z.number().int().min(0).max(100).optional(),
  dataRetentionDays: z.number().int().min(7).max(365).optional(),
  autoCleanupEnabled: z.boolean().optional(),
  weeklyReportsEnabled: z.boolean().optional(),
  weeklyReportsDay: z.number().int().min(1).max(7).optional(),
  weeklyReportsHour: z.string().regex(/^\d{2}:\d{2}:\d{2}$/).optional(),
  weeklyReportsRecipients: z.array(z.string().email()).optional(),
  geocodingEnabled: z.boolean().optional(),
  routeOptimizationEnabled: z.boolean().optional(),
  weatherIntegrationEnabled: z.boolean().optional(),
});

const apiCredentialSchema = z.object({
  provider: z.enum(['twilio', 'google_maps', 'openweather']),
  entityId: z.string(),
  apiKey: z.string(),
  apiSecret: z.string().optional(),
  additionalConfig: z.any().optional(),
  isActive: z.boolean().optional(),
  monthlyQuota: z.number().int().optional(),
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Bug Fix #3: Helper function for building WHERE conditions
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function buildConditions(conditions: (ReturnType<typeof eq> | undefined)[]) {
  const validConditions = conditions.filter((c): c is ReturnType<typeof eq> => c !== undefined);
  return validConditions.length > 0 ? and(...validConditions) : undefined;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GET /api/admin/gps/config/:entity - Récupérer config GPS
// Bug Fix #2: Added isAuthenticated, isAdmin middleware
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

router.get('/config/:entity', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const { entity } = req.params;

    if (!['global', 'france', 'luxembourg', 'belgique'].includes(entity)) {
      return res.status(400).json({
        success: false,
        error: 'Entity invalide (global, france, luxembourg, belgique)',
      });
    }

    const config = await configCacheService.getConfig(entity);

    res.json({
      success: true,
      data: config,
    });
  } catch (error: any) {
    console.error(`❌ Erreur récupération config GPS ${req.params.entity}:`, error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur',
    });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PUT /api/admin/gps/config/:entity - Mettre à jour config GPS
// Bug Fix #2: Added isAuthenticated, isAdmin middleware
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

router.put('/config/:entity', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const { entity } = req.params;

    if (!['global', 'france', 'luxembourg', 'belgique'].includes(entity)) {
      return res.status(400).json({
        success: false,
        error: 'Entity invalide (global, france, luxembourg, belgique)',
      });
    }

    const validatedData = updateConfigSchema.parse(req.body);

    // Mettre à jour config
    const [updated] = await db
      .update(gpsSystemConfig)
      .set({
        ...validatedData,
        updatedAt: new Date(),
        updatedBy: req.session.userId,
      } as any)
      .where(eq(gpsSystemConfig.entityId, entity))
      .returning();

    // Invalider cache
    configCacheService.invalidate(entity);

    res.json({
      success: true,
      data: updated,
      message: `Configuration GPS ${entity} mise à jour avec succès`,
    });
  } catch (error: any) {
    console.error(`❌ Erreur MAJ config GPS ${req.params.entity}:`, error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: error.errors.map(e => e.message).join(', '),
      });
    }

    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour de la configuration',
    });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GET /api/admin/gps/dashboard - Dashboard stats GPS
// Bug Fix #2: Added isAuthenticated, isAdmin middleware
// Bug Fix #3: Fixed undefined in and() conditions
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

router.get('/dashboard', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const { entity, startDate, endDate } = req.query;

    // Dates par défaut : 30 derniers jours
    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    // Bug Fix #3: Build conditions properly without undefined
    const positionsConditions = buildConditions([
      gte(gpsPositions.capturedAt, start),
      entity ? eq(gpsPositions.entity, entity as string) : undefined
    ]);

    const opportunitiesConditions = buildConditions([
      gte(gpsOpportunities.detectedAt, start),
      entity ? eq(gpsOpportunities.entity, entity as string) : undefined
    ]);

    const dailyStatsConditions = buildConditions([
      gte(gpsDailyStats.statDate, start.toISOString().split('T')[0] as any),
      entity ? eq(gpsDailyStats.entity, entity as string) : undefined
    ]);

    // Statistiques positions GPS
    const positionsQuery = db
      .select({
        count: sql<number>`COUNT(*)::int`,
        distinctUsers: sql<number>`COUNT(DISTINCT user_id)::int`,
        avgAccuracy: sql<number>`AVG(accuracy)::float`,
      })
      .from(gpsPositions);
    
    if (positionsConditions) {
      positionsQuery.where(positionsConditions);
    }

    // Statistiques opportunités
    const opportunitiesQuery = db
      .select({
        total: sql<number>`COUNT(*)::int`,
        pending: sql<number>`COUNT(*) FILTER (WHERE status = 'pending')::int`,
        accepted: sql<number>`COUNT(*) FILTER (WHERE status = 'accepted')::int`,
        avgPriority: sql<number>`AVG(priority_score)::float`,
      })
      .from(gpsOpportunities);

    if (opportunitiesConditions) {
      opportunitiesQuery.where(opportunitiesConditions);
    }

    // Statistiques journalières
    const dailyStatsQuery = db
      .select({
        totalDistance: sql<number>`SUM(total_distance_km)::float`,
        totalVisits: sql<number>`SUM(visits_count)::int`,
        avgWorkingHours: sql<number>`AVG(working_hours)::float`,
      })
      .from(gpsDailyStats);

    if (dailyStatsConditions) {
      dailyStatsQuery.where(dailyStatsConditions);
    }

    // Exécuter requêtes en parallèle
    const [positionsStats, opportunitiesStats, dailyStats] = await Promise.all([
      positionsQuery,
      opportunitiesQuery,
      dailyStatsQuery,
    ]);

    res.json({
      success: true,
      data: {
        period: { start, end },
        positions: positionsStats[0] || {},
        opportunities: opportunitiesStats[0] || {},
        daily: dailyStats[0] || {},
      },
    });
  } catch (error: any) {
    console.error('❌ Erreur dashboard GPS:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération du dashboard',
    });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POST /api/admin/gps/credentials - Créer credential API
// Bug Fix #1: Changed req.user.id to req.session.userId
// Bug Fix #2: Added isAuthenticated, isAdmin middleware
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

router.post('/credentials', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    // Bug Fix #1: Use req.session.userId instead of req.user
    if (!req.session.userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentification requise',
      });
    }

    const validatedData = apiCredentialSchema.parse(req.body);

    // Chiffrer clé API
    const encryptedKey = encryptionService.encrypt(validatedData.apiKey);
    const encryptedSecret = validatedData.apiSecret
      ? encryptionService.encrypt(validatedData.apiSecret)
      : undefined;

    // Créer credential - Bug Fix #1: Use req.session.userId
    const [credential] = await db
      .insert(apiCredentials)
      .values({
        provider: validatedData.provider,
        entityId: validatedData.entityId,
        apiKeyEncrypted: encryptedKey,
        apiSecretEncrypted: encryptedSecret,
        additionalConfig: validatedData.additionalConfig || undefined,
        isActive: validatedData.isActive ?? false,
        monthlyQuota: validatedData.monthlyQuota || undefined,
        createdBy: req.session.userId,
        updatedBy: req.session.userId,
      } as any)
      .returning();

    // Masquer credentials dans réponse
    const sanitized = {
      ...credential,
      apiKeyEncrypted: '********',
      apiSecretEncrypted: credential.apiSecretEncrypted ? '********' : null,
    };

    res.json({
      success: true,
      data: sanitized,
      message: 'Credential API créé avec succès',
    });
  } catch (error: any) {
    console.error('❌ Erreur création credential API:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: error.errors.map(e => e.message).join(', '),
      });
    }

    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création du credential',
    });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GET /api/admin/gps/credentials - Liste credentials API
// Bug Fix #2: Added isAuthenticated, isAdmin middleware
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

router.get('/credentials', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const credentials = await db.query.apiCredentials.findMany({
      orderBy: [desc(apiCredentials.createdAt)],
    });

    // Masquer clés dans réponse
    const sanitized = credentials.map(cred => ({
      ...cred,
      apiKeyEncrypted: '********',
      apiSecretEncrypted: cred.apiSecretEncrypted ? '********' : null,
    }));

    res.json({
      success: true,
      data: sanitized,
      count: credentials.length,
    });
  } catch (error: any) {
    console.error('❌ Erreur liste credentials:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur',
    });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MODULE P3.5 - BATCH GEOCODING PROSPECTS
// Bug Fix #2: Added isAuthenticated, isAdmin middleware
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// GET /api/admin/gps/geocoding/stats - Stats géocodage prospects
router.get('/geocoding/stats', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const stats = await batchGeocodingService.getStats();
    
    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error('❌ Erreur stats géocodage:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des statistiques',
    });
  }
});

// POST /api/admin/gps/geocoding/batch - Lancer géocodage batch
router.post('/geocoding/batch', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const { entity, limit = 100, throttleMs = 1000 } = req.body;

    console.log(`[GPS Admin] Starting batch geocoding - Entity: ${entity || 'all'}, Limit: ${limit}`);

    // Lancer géocodage asynchrone
    const result = await batchGeocodingService.startBatchGeocoding(
      entity,
      limit,
      throttleMs
    );

    res.json({
      success: true,
      data: result,
      message: `Géocodage batch terminé: ${result.success} succès, ${result.failed} échecs`,
    });
  } catch (error: any) {
    console.error('❌ Erreur batch geocoding:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors du géocodage batch',
    });
  }
});

// POST /api/admin/gps/geocoding/:prospectId - Géocoder un prospect
router.post('/geocoding/:prospectId', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const { prospectId } = req.params;

    console.log(`[GPS Admin] Geocoding single prospect: ${prospectId}`);

    const success = await batchGeocodingService.geocodeSingleProspect(prospectId);

    res.json({
      success: true,
      data: { prospectId, geocoded: success },
      message: 'Prospect géocodé avec succès',
    });
  } catch (error: any) {
    console.error(`❌ Erreur geocoding prospect ${req.params.prospectId}:`, error);
    res.status(400).json({
      success: false,
      error: error.message || 'Erreur lors du géocodage',
    });
  }
});

export default router;
