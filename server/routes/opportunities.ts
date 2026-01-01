import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { isAuthenticated, isAdmin } from "../auth";
import {
  insertOpportunitySchema,
  insertSalesObjectiveSchema,
  insertOpportunityActivitySchema,
  insertOpportunityNoteSchema,
  type Opportunity,
  type InsertOpportunity,
} from "@shared/schema";
import { db } from "../db";
import { 
  opportunities, 
  opportunityScoringHistory,
  opportunityActivities,
  opportunityNotes,
  salesObjectives,
  opportunityPredictions,
  opportunityExports,
  users,
} from "@shared/schema";
import { eq, and, sql, desc, gte, lte, inArray } from "drizzle-orm";
import { prospectionQueue } from "../services/queue/prospection-queue";
import PhoneOpportunityService from "../services/modules/PhoneOpportunityService";

const router = Router();

// ============================================
// CRUD OPPORTUNITÉS
// ============================================

// POST /api/opportunities - Créer opportunité
router.post("/", isAuthenticated, async (req, res) => {
  try {
    const validatedData = insertOpportunitySchema.parse({
      ...req.body,
      entity: req.session.entity,
      userId: req.session.userId,
      createdBy: req.session.userId,
    });

    const [newOpportunity] = await db
      .insert(opportunities)
      .values(validatedData)
      .returning();

    // Log création
    await db.insert(opportunityActivities).values({
      opportunityId: newOpportunity.id,
      userId: req.session.userId!,
      activityType: "created",
      activityTitle: "Opportunité créée",
      activityDescription: `Création de l'opportunité ${newOpportunity.title}`,
    });

    res.json({
      success: true,
      opportunity: newOpportunity,
    });
  } catch (error: any) {
    console.error("Error creating opportunity:", error);
    res.status(400).json({
      error: "Erreur lors de la création de l'opportunité",
      details: error.message,
    });
  }
});

// GET /api/opportunities - Liste opportunités (avec filtres)
router.get("/", isAuthenticated, async (req, res) => {
  try {
    const {
      status,
      stage,
      temperature,
      userId,
      requalificationRequired,
      limit = "50",
      offset = "0",
    } = req.query;

    const conditions = [
      eq(opportunities.entity, req.session.entity!),
      sql`${opportunities.deletedAt} IS NULL`,
    ];

    if (status) {
      conditions.push(eq(opportunities.status, status as string));
    }
    if (stage) {
      conditions.push(eq(opportunities.stage, stage as string));
    }
    if (temperature) {
      conditions.push(eq(opportunities.temperature, temperature as string));
    }
    if (userId) {
      conditions.push(eq(opportunities.userId, userId as string));
    }
    if (requalificationRequired === "true") {
      conditions.push(eq(opportunities.requalificationRequired, true));
    }

    const results = await db
      .select()
      .from(opportunities)
      .where(and(...conditions))
      .orderBy(desc(opportunities.score), desc(opportunities.createdAt))
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));

    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(opportunities)
      .where(and(...conditions));

    res.json({
      success: true,
      opportunities: results,
      total: totalCount[0]?.count || 0,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error: any) {
    console.error("Error fetching opportunities:", error);
    res.status(500).json({
      error: "Erreur lors de la récupération des opportunités",
      details: error.message,
    });
  }
});

// ============================================
// DASHBOARDS (MUST be before /:id routes)
// ============================================

// GET /api/opportunities/dashboard/commercial - Vue commercial
router.get("/dashboard/commercial", isAuthenticated, async (req, res) => {
  try {
    const userId = req.query.userId || req.session.userId;

    // Opportunités par température
    const byTemperature = await db
      .select({
        temperature: opportunities.temperature,
        count: sql<number>`count(*)`,
        totalValue: sql<number>`SUM(COALESCE(${opportunities.monthlySubscription}, 0))`,
      })
      .from(opportunities)
      .where(
        and(
          eq(opportunities.userId, userId as string),
          eq(opportunities.entity, req.session.entity!),
          eq(opportunities.status, "active"),
          sql`${opportunities.deletedAt} IS NULL`
        )
      )
      .groupBy(opportunities.temperature);

    // Opportunités par stage
    const byStage = await db
      .select({
        stage: opportunities.stage,
        count: sql<number>`count(*)`,
      })
      .from(opportunities)
      .where(
        and(
          eq(opportunities.userId, userId as string),
          eq(opportunities.entity, req.session.entity!),
          eq(opportunities.status, "active"),
          sql`${opportunities.deletedAt} IS NULL`
        )
      )
      .groupBy(opportunities.stage);

    // Top opportunités HOT
    const hotOpportunities = await db
      .select()
      .from(opportunities)
      .where(
        and(
          eq(opportunities.userId, userId as string),
          eq(opportunities.entity, req.session.entity!),
          eq(opportunities.temperature, "HOT"),
          eq(opportunities.status, "active"),
          sql`${opportunities.deletedAt} IS NULL`
        )
      )
      .orderBy(desc(opportunities.score))
      .limit(10);

    // Opportunités à requalifier
    const toRequalify = await db
      .select()
      .from(opportunities)
      .where(
        and(
          eq(opportunities.userId, userId as string),
          eq(opportunities.entity, req.session.entity!),
          eq(opportunities.requalificationRequired, true),
          eq(opportunities.status, "active"),
          sql`${opportunities.deletedAt} IS NULL`
        )
      )
      .orderBy(desc(opportunities.daysInHector))
      .limit(10);

    // Stats globales
    const stats = await db
      .select({
        total: sql<number>`count(*)`,
        avgScore: sql<number>`AVG(${opportunities.score})`,
        avgDaysInHector: sql<number>`AVG(${opportunities.daysInHector})`,
        totalPipeline: sql<number>`SUM(COALESCE(${opportunities.monthlySubscription}, 0))`,
      })
      .from(opportunities)
      .where(
        and(
          eq(opportunities.userId, userId as string),
          eq(opportunities.entity, req.session.entity!),
          eq(opportunities.status, "active"),
          sql`${opportunities.deletedAt} IS NULL`
        )
      );

    res.json({
      success: true,
      byTemperature,
      byStage,
      hotOpportunities,
      toRequalify,
      stats: stats[0] || {},
    });
  } catch (error: any) {
    console.error("Error fetching commercial dashboard:", error);
    res.status(500).json({
      error: "Erreur lors de la récupération du dashboard",
      details: error.message,
    });
  }
});

// GET /api/opportunities/dashboard/manager - Vue manager
router.get("/dashboard/manager", isAuthenticated, isAdmin, async (req, res) => {
  try {
    // Statistiques globales par commercial avec infos user
    const byUser = await db
      .select({
        userId: opportunities.userId,
        userEmail: users.email,
        userFirstName: users.firstName,
        userLastName: users.lastName,
        count: sql<number>`count(*)`,
        hotCount: sql<number>`SUM(CASE WHEN ${opportunities.temperature} = 'HOT' THEN 1 ELSE 0 END)`,
        warmCount: sql<number>`SUM(CASE WHEN ${opportunities.temperature} = 'WARM' THEN 1 ELSE 0 END)`,
        coldCount: sql<number>`SUM(CASE WHEN ${opportunities.temperature} = 'COLD' THEN 1 ELSE 0 END)`,
        avgScore: sql<number>`AVG(${opportunities.score})`,
        totalPipeline: sql<number>`SUM(COALESCE(${opportunities.monthlySubscription}, 0))`,
      })
      .from(opportunities)
      .leftJoin(users, eq(opportunities.userId, users.id))
      .where(
        and(
          eq(opportunities.entity, req.session.entity!),
          eq(opportunities.status, "active"),
          sql`${opportunities.deletedAt} IS NULL`
        )
      )
      .groupBy(opportunities.userId, users.email, users.firstName, users.lastName);

    // Distribution températures globale
    const temperatureDistribution = await db
      .select({
        temperature: opportunities.temperature,
        count: sql<number>`count(*)`,
      })
      .from(opportunities)
      .where(
        and(
          eq(opportunities.entity, req.session.entity!),
          eq(opportunities.status, "active"),
          sql`${opportunities.deletedAt} IS NULL`
        )
      )
      .groupBy(opportunities.temperature);

    // Opportunités critiques (score bas depuis longtemps)
    const criticalOpportunities = await db
      .select()
      .from(opportunities)
      .where(
        and(
          eq(opportunities.entity, req.session.entity!),
          eq(opportunities.status, "active"),
          sql`${opportunities.score} < 40`,
          sql`${opportunities.daysInHector} > 7`,
          sql`${opportunities.deletedAt} IS NULL`
        )
      )
      .orderBy(desc(opportunities.daysInHector))
      .limit(20);

    res.json({
      success: true,
      byUser,
      temperatureDistribution,
      criticalOpportunities,
    });
  } catch (error: any) {
    console.error("Error fetching manager dashboard:", error);
    res.status(500).json({
      error: "Erreur lors de la récupération du dashboard manager",
      details: error.message,
    });
  }
});

// ============================================
// CRUD OPPORTUNITÉS
// ============================================

// GET /api/opportunities/:id - Détail opportunité
router.get("/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    const [opportunity] = await db
      .select()
      .from(opportunities)
      .where(
        and(
          eq(opportunities.id, id),
          eq(opportunities.entity, req.session.entity!),
          sql`${opportunities.deletedAt} IS NULL`
        )
      );

    if (!opportunity) {
      return res.status(404).json({
        error: "Opportunité non trouvée",
      });
    }

    // Récupérer activités récentes
    const activities = await db
      .select()
      .from(opportunityActivities)
      .where(eq(opportunityActivities.opportunityId, id))
      .orderBy(desc(opportunityActivities.createdAt))
      .limit(20);

    // Récupérer notes
    const notes = await db
      .select()
      .from(opportunityNotes)
      .where(eq(opportunityNotes.opportunityId, id))
      .orderBy(desc(opportunityNotes.createdAt));

    // Récupérer historique scoring
    const scoringHistory = await db
      .select()
      .from(opportunityScoringHistory)
      .where(eq(opportunityScoringHistory.opportunityId, id))
      .orderBy(desc(opportunityScoringHistory.calculatedAt))
      .limit(10);

    res.json({
      success: true,
      opportunity,
      activities,
      notes,
      scoringHistory,
    });
  } catch (error: any) {
    console.error("Error fetching opportunity:", error);
    res.status(500).json({
      error: "Erreur lors de la récupération de l'opportunité",
      details: error.message,
    });
  }
});

// Whitelist schema for PATCH updates (security: strict type checking, no coercion)
const updateOpportunitySchema = insertOpportunitySchema
  .partial()
  .pick({
    title: true,
    description: true,
    prospectId: true,
    monthlySubscription: true,
    commitmentMonths: true,
    totalValue: true,
    contractsCount: true,
    serviceType: true,
    businessType: true,
    stage: true,
    status: true,
    nextFollowUpDate: true,
    lostReason: true,
  })
  .strict(); // Reject unknown fields

// PATCH /api/opportunities/:id - Update opportunité
router.patch("/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    
    // SECURITY: Strict validation - whitelist only safe fields
    const validatedData = updateOpportunitySchema.parse(req.body);

    // Vérifier existence et droits
    const [existing] = await db
      .select()
      .from(opportunities)
      .where(
        and(
          eq(opportunities.id, id),
          eq(opportunities.entity, req.session.entity!)
        )
      );

    if (!existing) {
      return res.status(404).json({
        error: "Opportunité non trouvée",
      });
    }

    // Update with validated data only
    const [updated] = await db
      .update(opportunities)
      .set({
        ...validatedData,
        updatedAt: new Date(),
        lastModifiedBy: req.session.userId,
      })
      .where(eq(opportunities.id, id))
      .returning();

    // Log modification
    await db.insert(opportunityActivities).values({
      opportunityId: id,
      userId: req.session.userId!,
      activityType: "updated",
      activityTitle: "Opportunité modifiée",
      activityDescription: `Mise à jour de l'opportunité`,
      activityData: validatedData,
    });

    res.json({
      success: true,
      opportunity: updated,
    });
  } catch (error: any) {
    console.error("Error updating opportunity:", error);
    res.status(500).json({
      error: "Erreur lors de la mise à jour",
      details: error.message,
    });
  }
});

// DELETE /api/opportunities/:id - Soft delete
router.delete("/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    const [deleted] = await db
      .update(opportunities)
      .set({
        deletedAt: new Date(),
        status: "lost",
      })
      .where(
        and(
          eq(opportunities.id, id),
          eq(opportunities.entity, req.session.entity!)
        )
      )
      .returning();

    if (!deleted) {
      return res.status(404).json({
        error: "Opportunité non trouvée",
      });
    }

    await db.insert(opportunityActivities).values({
      opportunityId: id,
      userId: req.session.userId!,
      activityType: "deleted",
      activityTitle: "Opportunité supprimée",
    });

    res.json({
      success: true,
      message: "Opportunité supprimée",
    });
  } catch (error: any) {
    console.error("Error deleting opportunity:", error);
    res.status(500).json({
      error: "Erreur lors de la suppression",
      details: error.message,
    });
  }
});

// ============================================
// ACTIVITÉS & NOTES
// ============================================

// POST /api/opportunities/:id/activities - Log activité
router.post("/:id/activities", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = insertOpportunityActivitySchema.parse({
      ...req.body,
      opportunityId: id,
      userId: req.session.userId,
    });

    const [activity] = await db
      .insert(opportunityActivities)
      .values(validatedData)
      .returning();

    // Update last_activity_date + activities_count
    await db
      .update(opportunities)
      .set({
        lastActivityDate: new Date(),
        activitiesCount: sql`${opportunities.activitiesCount} + 1`,
      })
      .where(eq(opportunities.id, id));

    res.json({
      success: true,
      activity,
    });
  } catch (error: any) {
    console.error("Error creating activity:", error);
    res.status(400).json({
      error: "Erreur lors de la création de l'activité",
      details: error.message,
    });
  }
});

// GET /api/opportunities/:id/activities - Liste activités
router.get("/:id/activities", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    const activities = await db
      .select()
      .from(opportunityActivities)
      .where(eq(opportunityActivities.opportunityId, id))
      .orderBy(desc(opportunityActivities.createdAt));

    res.json({
      success: true,
      activities,
    });
  } catch (error: any) {
    console.error("Error fetching activities:", error);
    res.status(500).json({
      error: "Erreur lors de la récupération des activités",
      details: error.message,
    });
  }
});

// POST /api/opportunities/:id/notes - Ajouter note
router.post("/:id/notes", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = insertOpportunityNoteSchema.parse({
      ...req.body,
      opportunityId: id,
      userId: req.session.userId,
    });

    const [note] = await db
      .insert(opportunityNotes)
      .values(validatedData)
      .returning();

    res.json({
      success: true,
      note,
    });
  } catch (error: any) {
    console.error("Error creating note:", error);
    res.status(400).json({
      error: "Erreur lors de la création de la note",
      details: error.message,
    });
  }
});

// GET /api/opportunities/:id/notes - Liste notes
router.get("/:id/notes", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    const notes = await db
      .select()
      .from(opportunityNotes)
      .where(eq(opportunityNotes.opportunityId, id))
      .orderBy(desc(opportunityNotes.createdAt));

    res.json({
      success: true,
      notes,
    });
  } catch (error: any) {
    console.error("Error fetching notes:", error);
    res.status(500).json({
      error: "Erreur lors de la récupération des notes",
      details: error.message,
    });
  }
});

// GET /api/opportunities/:id/calls - Historique appels téléphoniques (INTERCONNEXION EVENT BUS)
router.get("/:id/calls", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    const calls = await PhoneOpportunityService.getCallHistory(
      id,
      req.session.entity!
    );

    res.json({
      success: true,
      calls,
      count: calls.length,
    });
  } catch (error: any) {
    console.error("Error fetching call history:", error);
    res.status(500).json({
      error: "Erreur lors de la récupération de l'historique des appels",
      details: error.message,
    });
  }
});

// ============================================
// OBJECTIFS COMMERCIAUX
// ============================================

// POST /api/opportunities/objectives - Créer objectif
router.post("/objectives", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const validatedData = insertSalesObjectiveSchema.parse({
      ...req.body,
      entity: req.session.entity,
      createdBy: req.session.userId,
    });

    const [objective] = await db
      .insert(salesObjectives)
      .values(validatedData)
      .returning();

    res.json({
      success: true,
      objective,
    });
  } catch (error: any) {
    console.error("Error creating objective:", error);
    res.status(400).json({
      error: "Erreur lors de la création de l'objectif",
      details: error.message,
    });
  }
});

// GET /api/opportunities/objectives - Liste objectifs
router.get("/objectives", isAuthenticated, async (req, res) => {
  try {
    const { level, userId } = req.query;

    const conditions = [eq(salesObjectives.entity, req.session.entity!)];

    if (level) {
      conditions.push(eq(salesObjectives.level, level as string));
    }
    if (userId) {
      conditions.push(eq(salesObjectives.userId, userId as string));
    }

    const objectives = await db
      .select()
      .from(salesObjectives)
      .where(and(...conditions))
      .orderBy(desc(salesObjectives.createdAt));

    res.json({
      success: true,
      objectives,
    });
  } catch (error: any) {
    console.error("Error fetching objectives:", error);
    res.status(500).json({
      error: "Erreur lors de la récupération des objectifs",
      details: error.message,
    });
  }
});

// POST /api/opportunities/trigger-worker - Déclencher manuellement un worker d'enrichissement
router.post("/trigger-worker", isAuthenticated, async (req, res) => {
  try {
    const { opportunityId, workerType } = req.body;

    if (!opportunityId || !workerType) {
      return res.status(400).json({
        error: "opportunityId et workerType sont requis",
      });
    }

    // Validation workerType
    const validWorkerTypes = ['cascade', 'disc', 'gps'];
    if (!validWorkerTypes.includes(workerType)) {
      return res.status(400).json({
        error: "workerType invalide",
        allowedTypes: validWorkerTypes,
      });
    }

    // Vérifier que l'opportunité existe et appartient à l'entity
    const [opportunity] = await db
      .select()
      .from(opportunities)
      .where(
        and(
          eq(opportunities.id, opportunityId),
          eq(opportunities.entity, req.session.entity!),
          sql`${opportunities.deletedAt} IS NULL`
        )
      );

    if (!opportunity) {
      return res.status(404).json({
        error: "Opportunité non trouvée",
      });
    }

    // Récupérer la queue boss via prospectionQueue
    const boss = prospectionQueue.getBoss();
    console.log('[TRIGGER-WORKER] boss:', boss ? 'OK' : 'NULL');
    if (!boss) {
      return res.status(500).json({
        error: "Queue non disponible",
      });
    }

    // Mapper workerType vers le nom de la queue
    const queueNames: Record<string, string> = {
      'cascade': 'opp-cascade-enrichment',
      'disc': 'opp-disc-profiling',
      'gps': 'opp-gps-geocoding',
    };

    const queueName = queueNames[workerType];
    console.log('[TRIGGER-WORKER] queueName:', queueName);

    // Créer la queue si elle n'existe pas (pg-boss v10+ requirement)
    try {
      await boss.createQueue(queueName, {
        retryLimit: 3,
        retryDelay: 60,
        retryBackoff: true,
      });
      console.log('[TRIGGER-WORKER] Queue created/verified:', queueName);
    } catch (createError: any) {
      // Queue may already exist, that's OK
      console.log('[TRIGGER-WORKER] Queue may already exist:', queueName);
    }

    // Enqueuer le worker
    let jobId;
    try {
      jobId = await boss.send(queueName, {
        opportunityId,
        userId: req.session.userId,
      }, {
        retryLimit: 3,
        retryDelay: 60,
        retryBackoff: true,
      });
      console.log('[TRIGGER-WORKER] jobId:', jobId);
    } catch (sendError: any) {
      console.error('[TRIGGER-WORKER] ERROR calling boss.send():', sendError);
      console.error('[TRIGGER-WORKER] ERROR stack:', sendError.stack);
      return res.status(500).json({
        error: "Erreur lors de l'enqueue du worker",
        details: sendError.message,
      });
    }

    res.status(202).json({
      success: true,
      jobId,
      message: `Worker ${workerType} enqueué pour opportunité ${opportunityId}`,
    });
  } catch (error: any) {
    console.error("Error triggering worker:", error);
    res.status(500).json({
      error: "Erreur lors du déclenchement du worker",
      details: error.message,
    });
  }
});

export default router;
