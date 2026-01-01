var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema-opportunities.ts
import { sql } from "drizzle-orm";
import { pgTable, varchar, timestamp, jsonb, index, integer, decimal, date, boolean, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var opportunities, opportunityScoringHistory, opportunityActivities, salesObjectives, opportunityPredictions, opportunityExports, opportunityNotes, insertOpportunitySchema, insertSalesObjectiveSchema, insertOpportunityActivitySchema, insertOpportunityNoteSchema;
var init_schema_opportunities = __esm({
  "shared/schema-opportunities.ts"() {
    "use strict";
    init_schema();
    opportunities = pgTable("opportunities", {
      // Identifiants
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      entity: varchar("entity", { length: 50 }).notNull(),
      userId: varchar("user_id").notNull().references(() => users.id),
      createdBy: varchar("created_by").notNull().references(() => users.id),
      // Entreprise
      companyName: varchar("company_name", { length: 255 }).notNull(),
      siren: varchar("siren", { length: 14 }),
      siret: varchar("siret", { length: 20 }),
      address: text("address"),
      city: varchar("city", { length: 100 }),
      postalCode: varchar("postal_code", { length: 20 }),
      country: varchar("country", { length: 2 }).default("FR"),
      // Contact principal
      contactName: varchar("contact_name", { length: 255 }).notNull(),
      contactTitle: varchar("contact_title", { length: 100 }),
      contactPhone: varchar("contact_phone", { length: 50 }),
      contactEmail: varchar("contact_email", { length: 255 }),
      contactLinkedinUrl: text("contact_linkedin_url"),
      // Business (VOCABULAIRE ADN STRICT)
      title: varchar("title", { length: 255 }).notNull(),
      description: text("description"),
      contractValue: decimal("contract_value", { precision: 12, scale: 2 }),
      monthlySubscription: decimal("monthly_subscription", { precision: 10, scale: 2 }),
      // ABONNEMENT (JAMAIS "MRR")
      isNewSiren: boolean("is_new_siren").default(true),
      // NEW SIREN vs RECO
      sector: varchar("sector", { length: 100 }),
      numberOfSites: integer("number_of_sites").default(1),
      // État opportunité
      status: varchar("status", { length: 50 }).default("active"),
      // active, on_hold, signed, lost, exported
      stage: varchar("stage", { length: 50 }).default("decouverte"),
      // decouverte, rdv_argu, negociation, closing
      probability: integer("probability").default(50),
      // 0-100
      // Dates
      expectedCloseDate: date("expected_close_date"),
      contractSignatureDate: date("contract_signature_date"),
      firstContactDate: date("first_contact_date").default(sql`CURRENT_DATE`),
      lastActivityDate: timestamp("last_activity_date").default(sql`NOW()`),
      // Scoring (calculé automatiquement par trigger)
      score: integer("score").default(0),
      // 0-100
      scoreDetails: jsonb("score_details"),
      // {reactivity: X, maturity: Y, enrichment: Z, disc: W, geography: V, network: U}
      temperature: varchar("temperature", { length: 10 }).default("cold"),
      // hot, warm, cold
      // Gestion cycle Hector (0-30 jours)
      daysInHector: integer("days_in_hector").default(0),
      requalificationRequired: boolean("requalification_required").default(false),
      requalificationNotes: text("requalification_notes"),
      requalificationDate: timestamp("requalification_date"),
      // Intégration CASCADE
      cascadeEnriched: boolean("cascade_enriched").default(false),
      cascadeData: jsonb("cascade_data"),
      cascadeLastUpdate: timestamp("cascade_last_update"),
      // Intégration DISC
      discProfiled: boolean("disc_profiled").default(false),
      discProfile: varchar("disc_profile", { length: 20 }),
      // D, I, S, C
      discData: jsonb("disc_data"),
      discLastUpdate: timestamp("disc_last_update"),
      // Intégration GPS
      gpsGeocoded: boolean("gps_geocoded").default(false),
      gpsLatitude: decimal("gps_latitude", { precision: 10, scale: 8 }),
      gpsLongitude: decimal("gps_longitude", { precision: 11, scale: 8 }),
      gpsData: jsonb("gps_data"),
      gpsLastUpdate: timestamp("gps_last_update"),
      // Intégration LinkedIn
      linkedinScraped: boolean("linkedin_scraped").default(false),
      linkedinData: jsonb("linkedin_data"),
      linkedinLastUpdate: timestamp("linkedin_last_update"),
      // Activités engagement
      activitiesCount: integer("activities_count").default(0),
      emailsSent: integer("emails_sent").default(0),
      emailsOpened: integer("emails_opened").default(0),
      callsMade: integer("calls_made").default(0),
      meetingsHeld: integer("meetings_held").default(0),
      documentsSent: integer("documents_sent").default(0),
      documentsViewed: integer("documents_viewed").default(0),
      lastEmailOpenDate: timestamp("last_email_open_date"),
      lastCallDate: timestamp("last_call_date"),
      lastMeetingDate: timestamp("last_meeting_date"),
      // Export CRM
      exportReady: boolean("export_ready").default(false),
      exportedToCrm: boolean("exported_to_crm").default(false),
      exportDate: timestamp("export_date"),
      exportCrmType: varchar("export_crm_type", { length: 50 }),
      // zoho ou odoo
      exportCrmId: varchar("export_crm_id", { length: 100 }),
      exportNotes: text("export_notes"),
      // Métadonnées
      createdAt: timestamp("created_at").default(sql`NOW()`),
      updatedAt: timestamp("updated_at").default(sql`NOW()`),
      deletedAt: timestamp("deleted_at"),
      // Soft delete
      notes: text("notes"),
      internalNotes: text("internal_notes"),
      // Visibles managers/admin uniquement
      lastModifiedBy: varchar("last_modified_by").references(() => users.id),
      modificationHistory: jsonb("modification_history")
    }, (table) => [
      // Indexes simples
      index("idx_opp_entity").on(table.entity),
      index("idx_opp_user").on(table.userId),
      index("idx_opp_status").on(table.status),
      index("idx_opp_stage").on(table.stage),
      index("idx_opp_score").on(table.score),
      index("idx_opp_temp").on(table.temperature),
      index("idx_opp_days").on(table.daysInHector),
      index("idx_opp_requalif").on(table.requalificationRequired),
      index("idx_opp_siren").on(table.siren),
      index("idx_opp_close_date").on(table.expectedCloseDate),
      index("idx_opp_created").on(table.createdAt),
      // Indexes composites
      index("idx_opp_entity_user").on(table.entity, table.userId),
      index("idx_opp_entity_status").on(table.entity, table.status)
    ]);
    opportunityScoringHistory = pgTable("opportunity_scoring_history", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      opportunityId: varchar("opportunity_id").notNull().references(() => opportunities.id, { onDelete: "cascade" }),
      // Score global
      score: integer("score").notNull(),
      scoreDetails: jsonb("score_details").notNull(),
      temperature: varchar("temperature", { length: 10 }).notNull(),
      // Détail 6 facteurs
      reactivityScore: integer("reactivity_score"),
      maturityScore: integer("maturity_score"),
      enrichmentScore: integer("enrichment_score"),
      discScore: integer("disc_score"),
      geographyScore: integer("geography_score"),
      networkScore: integer("network_score"),
      // Contexte
      stage: varchar("stage", { length: 50 }),
      daysInHector: integer("days_in_hector"),
      activitiesCount: integer("activities_count"),
      calculatedAt: timestamp("calculated_at").default(sql`NOW()`)
    }, (table) => [
      index("idx_scoring_hist_opp").on(table.opportunityId),
      index("idx_scoring_hist_date").on(table.calculatedAt)
    ]);
    opportunityActivities = pgTable("opportunity_activities", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      opportunityId: varchar("opportunity_id").notNull().references(() => opportunities.id, { onDelete: "cascade" }),
      userId: varchar("user_id").notNull().references(() => users.id),
      activityType: varchar("activity_type", { length: 50 }).notNull(),
      // Types: created, updated, stage_changed, email_sent, email_opened, call_made, 
      // meeting_scheduled, meeting_held, document_sent, document_viewed, note_added,
      // status_changed, score_changed, cascade_enriched, disc_profiled, gps_geocoded,
      // requalification_triggered, exported_crm, contract_signed
      activityTitle: varchar("activity_title", { length: 255 }),
      activityDescription: text("activity_description"),
      activityData: jsonb("activity_data"),
      scoreImpact: integer("score_impact"),
      // +/- points
      createdAt: timestamp("created_at").default(sql`NOW()`)
    }, (table) => [
      index("idx_act_opp").on(table.opportunityId),
      index("idx_act_user").on(table.userId),
      index("idx_act_type").on(table.activityType),
      index("idx_act_date").on(table.createdAt)
    ]);
    salesObjectives = pgTable("sales_objectives", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      entity: varchar("entity", { length: 50 }).notNull(),
      // Niveau objectif
      level: varchar("level", { length: 50 }).notNull(),
      // individual, team, role
      userId: varchar("user_id").references(() => users.id),
      // Si level='individual'
      role: varchar("role", { length: 50 }),
      // Si level='role': IC, BD, Resp Dev
      // OBJECTIFS MENSUELS (VOCABULAIRE ADN)
      monthlyContracts: integer("monthly_contracts").notNull(),
      // Nb CONTRATS/mois (JAMAIS "CA")
      newSirenPercentage: integer("new_siren_percentage").notNull().default(60),
      // % NEW SIREN min
      avgSubscriptionTarget: decimal("avg_subscription_target", { precision: 10, scale: 2 }),
      // ABONNEMENT moyen cible
      // Gestion cycle
      maxCycleDays: integer("max_cycle_days").default(30),
      minConversionRate: decimal("min_conversion_rate", { precision: 5, scale: 2 }).default("25.00"),
      // Alertes automatiques
      alertDaysThreshold: integer("alert_days_threshold").default(30),
      alertScoreThreshold: integer("alert_score_threshold").default(40),
      alertScoreDays: integer("alert_score_days").default(7),
      alertNoActivityDays: integer("alert_no_activity_days").default(5),
      // Périodes
      validFrom: date("valid_from").default(sql`CURRENT_DATE`),
      validTo: date("valid_to"),
      createdBy: varchar("created_by").references(() => users.id),
      createdAt: timestamp("created_at").default(sql`NOW()`),
      updatedAt: timestamp("updated_at").default(sql`NOW()`)
    }, (table) => [
      index("idx_obj_entity").on(table.entity),
      index("idx_obj_user").on(table.userId),
      index("idx_obj_level").on(table.level),
      index("idx_obj_valid").on(table.validFrom, table.validTo)
    ]);
    opportunityPredictions = pgTable("opportunity_predictions", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      opportunityId: varchar("opportunity_id").notNull().references(() => opportunities.id, { onDelete: "cascade" }),
      // Prédictions
      predictedCloseDate: date("predicted_close_date"),
      predictedProbability: decimal("predicted_probability", { precision: 5, scale: 2 }),
      predictedSubscription: decimal("predicted_subscription", { precision: 10, scale: 2 }),
      // ABONNEMENT prédit
      confidenceLevel: decimal("confidence_level", { precision: 5, scale: 2 }),
      // Facteurs
      predictionFactors: jsonb("prediction_factors"),
      similarOpportunitiesCount: integer("similar_opportunities_count"),
      // Recommandations
      recommendedActions: jsonb("recommended_actions"),
      // [{action, timing, reason, script}, ...]
      optimalClosingWindowStart: date("optimal_closing_window_start"),
      optimalClosingWindowEnd: date("optimal_closing_window_end"),
      // Risques
      risks: jsonb("risks"),
      // [{type, level, description, mitigation}, ...]
      riskLevel: varchar("risk_level", { length: 20 }),
      // low, medium, high
      predictedAt: timestamp("predicted_at").default(sql`NOW()`),
      modelVersion: varchar("model_version", { length: 50 }),
      // Résultat réel (ML feedback loop)
      actualClosedDate: date("actual_closed_date"),
      actualResult: varchar("actual_result", { length: 50 }),
      predictionAccuracy: decimal("prediction_accuracy", { precision: 5, scale: 2 })
    }, (table) => [
      index("idx_pred_opp").on(table.opportunityId),
      index("idx_pred_date").on(table.predictedAt)
    ]);
    opportunityExports = pgTable("opportunity_exports", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      entity: varchar("entity", { length: 50 }).notNull(),
      exportBatchId: varchar("export_batch_id").default(sql`gen_random_uuid()`),
      exportType: varchar("export_type", { length: 50 }).notNull(),
      // zoho ou odoo
      exportDate: timestamp("export_date").default(sql`NOW()`),
      exportedBy: varchar("exported_by").references(() => users.id),
      opportunitiesCount: integer("opportunities_count"),
      opportunitiesIds: jsonb("opportunities_ids"),
      // Array de UUIDs
      status: varchar("status", { length: 50 }),
      // pending, success, partial, failed
      successCount: integer("success_count").default(0),
      errorCount: integer("error_count").default(0),
      errors: jsonb("errors"),
      mappingConfig: jsonb("mapping_config"),
      exportFileUrl: text("export_file_url"),
      notes: text("notes")
    }, (table) => [
      index("idx_exp_entity").on(table.entity),
      index("idx_exp_batch").on(table.exportBatchId),
      index("idx_exp_date").on(table.exportDate)
    ]);
    opportunityNotes = pgTable("opportunity_notes", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      opportunityId: varchar("opportunity_id").notNull().references(() => opportunities.id, { onDelete: "cascade" }),
      userId: varchar("user_id").notNull().references(() => users.id),
      noteType: varchar("note_type", { length: 50 }),
      // Types: general, meeting, call, email, internal, objection, decision_maker, competitor, blocker
      title: varchar("title", { length: 255 }),
      content: text("content").notNull(),
      relatedActivityId: varchar("related_activity_id").references(() => opportunityActivities.id),
      isInternal: boolean("is_internal").default(false),
      createdAt: timestamp("created_at").default(sql`NOW()`),
      updatedAt: timestamp("updated_at").default(sql`NOW()`)
    }, (table) => [
      index("idx_notes_opp").on(table.opportunityId),
      index("idx_notes_user").on(table.userId),
      index("idx_notes_type").on(table.noteType)
    ]);
    insertOpportunitySchema = createInsertSchema(opportunities, {
      entity: z.enum(["france", "luxembourg"]),
      companyName: z.string().min(1, "Nom entreprise requis"),
      contactName: z.string().min(1, "Nom contact requis"),
      title: z.string().min(1, "Titre opportunit\xE9 requis"),
      status: z.enum(["active", "on_hold", "signed", "lost", "exported"]).optional(),
      stage: z.enum(["decouverte", "rdv_argu", "negociation", "closing"]).optional(),
      temperature: z.enum(["hot", "warm", "cold"]).optional(),
      probability: z.number().min(0).max(100).optional(),
      monthlySubscription: z.string().optional(),
      // Decimal en string
      isNewSiren: z.boolean().optional()
    }).omit({
      id: true,
      score: true,
      // Calculé automatiquement
      scoreDetails: true,
      temperature: true,
      // Calculé automatiquement
      daysInHector: true,
      createdAt: true,
      updatedAt: true
    });
    insertSalesObjectiveSchema = createInsertSchema(salesObjectives, {
      entity: z.enum(["france", "luxembourg"]),
      level: z.enum(["individual", "team", "role"]),
      monthlyContracts: z.number().min(1, "Objectif CONTRATS requis"),
      newSirenPercentage: z.number().min(0).max(100).default(60)
    }).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertOpportunityActivitySchema = createInsertSchema(opportunityActivities).omit({
      id: true,
      createdAt: true
    });
    insertOpportunityNoteSchema = createInsertSchema(opportunityNotes, {
      noteType: z.enum(["general", "meeting", "call", "email", "internal", "objection", "decision_maker", "competitor", "blocker"]).optional()
    }).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
  }
});

// shared/schema-phoning.ts
import { sql as sql2 } from "drizzle-orm";
import { pgTable as pgTable2, text as text2, varchar as varchar2, timestamp as timestamp2, integer as integer2, boolean as boolean2, jsonb as jsonb2, index as index2 } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema as createInsertSchema2 } from "drizzle-zod";
var phoneConfigurations, phoneCalls, phoneScripts, phoneAnalyticsDaily, phoneConsents, phoneConfigHistory, phoneConfigurationsRelations, phoneCallsRelations, phoneScriptsRelations, phoneAnalyticsDailyRelations, phoneConsentsRelations, phoneConfigHistoryRelations, insertPhoneConfigurationSchema, insertPhoneCallSchema, insertPhoneScriptSchema, insertPhoneAnalyticsDailySchema, insertPhoneConsentSchema, insertPhoneConfigHistorySchema;
var init_schema_phoning = __esm({
  "shared/schema-phoning.ts"() {
    "use strict";
    init_schema();
    phoneConfigurations = pgTable2("phone_configurations", {
      id: varchar2("id").primaryKey().default(sql2`gen_random_uuid()`),
      entity: varchar2("entity", { length: 50 }).notNull(),
      // 'france' | 'luxembourg' | 'belgique'
      // Credentials Twilio (CHIFFRÉS avec AES-256-CBC)
      twilioAccountSid: text2("twilio_account_sid").notNull(),
      twilioAuthTokenEncrypted: text2("twilio_auth_token_encrypted").notNull(),
      twilioPhoneNumber: varchar2("twilio_phone_number", { length: 20 }).notNull(),
      // +33... / +352... / +32...
      twilioTwimlAppSid: text2("twilio_twiml_app_sid"),
      // Optional - requis uniquement pour apps Twilio connectées
      // Features activées
      recordingEnabled: boolean2("recording_enabled").default(true).notNull(),
      transcriptionEnabled: boolean2("transcription_enabled").default(true).notNull(),
      aiAnalysisEnabled: boolean2("ai_analysis_enabled").default(true).notNull(),
      // Limites techniques
      maxConcurrentCalls: integer2("max_concurrent_calls").default(10).notNull(),
      maxCallDurationMinutes: integer2("max_call_duration_minutes").default(60).notNull(),
      // Budget mensuel (centimes €)
      monthlyBudgetCents: integer2("monthly_budget_cents").default(3e5).notNull(),
      // 3000€
      alertThresholdPercent: integer2("alert_threshold_percent").default(80).notNull(),
      // Status
      isActive: boolean2("is_active").default(true).notNull(),
      lastTestedAt: timestamp2("last_tested_at"),
      lastTestStatus: varchar2("last_test_status", { length: 20 }),
      // 'success' | 'failed'
      // Audit
      createdAt: timestamp2("created_at").defaultNow().notNull(),
      updatedAt: timestamp2("updated_at").defaultNow().notNull(),
      createdBy: varchar2("created_by").notNull().references(() => users.id),
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // NOUVELLES COLONNES - GESTION DYNAMIQUE NUMÉROS (v1.1)
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // Organisation géographique
      agencyLocation: varchar2("agency_location", { length: 50 }),
      // 'paris' | 'lyon' | 'marseille' | 'luxembourg' | etc.
      agencyName: varchar2("agency_name", { length: 100 }),
      // 'ADS GROUP Paris' | 'ADS GROUP Lyon'
      displayName: varchar2("display_name", { length: 150 }),
      // 'ADS GROUP Paris Principal' | 'ADS GROUP Lyon Backup'
      coverageArea: jsonb2("coverage_area"),
      // Array de départements: ['75', '92', '93', '94', '95']
      // Gestion backup et rotation
      isBackup: boolean2("is_backup").default(false).notNull(),
      // true = numéro de secours
      isPrimary: boolean2("is_primary").default(true).notNull(),
      // true = numéro principal de l'agence
      rotationPriority: integer2("rotation_priority").default(1).notNull(),
      // 1 = premier choix, 2 = second, etc.
      // Status activation (redéfini pour éviter duplication - déjà présent au-dessus)
      activatedAt: timestamp2("activated_at"),
      // Date/heure dernière activation
      deactivatedAt: timestamp2("deactivated_at"),
      // Date/heure dernière désactivation
      deactivationReason: text2("deactivation_reason"),
      // 'spam' | 'manual' | 'budget_exceeded' | etc.
      // Monitoring réputation
      reputationScore: integer2("reputation_score"),
      // Score 0-100, null si jamais vérifié
      spamReports: integer2("spam_reports").default(0).notNull(),
      // Nombre signalements spam
      lastReputationCheck: timestamp2("last_reputation_check"),
      // Date dernière vérification
      // Limites spécifiques
      dailyCallLimit: integer2("daily_call_limit").default(50),
      // Limite appels/jour pour CE numéro
      // Soft delete
      deletedAt: timestamp2("deleted_at"),
      // null = actif, date = supprimé (soft delete)
      // Audit étendu
      lastModifiedBy: varchar2("last_modified_by"),
      // UUID user admin qui a modifié
      changeHistory: jsonb2("change_history")
      // Array de {date, action, by, reason}
    }, (table) => [
      index2("phone_configurations_entity_idx").on(table.entity),
      index2("phone_config_agency_location_idx").on(table.agencyLocation),
      index2("phone_config_is_active_idx").on(table.isActive),
      index2("phone_config_deleted_at_idx").on(table.deletedAt),
      index2("phone_config_reputation_score_idx").on(table.reputationScore)
    ]);
    phoneCalls = pgTable2("phone_calls", {
      id: varchar2("id").primaryKey().default(sql2`gen_random_uuid()`),
      entity: varchar2("entity", { length: 50 }).notNull(),
      // RLS
      // Twilio
      twilioCallSid: varchar2("twilio_call_sid", { length: 100 }).notNull().unique(),
      // Participants
      callerUserId: varchar2("caller_user_id").notNull().references(() => users.id),
      prospectId: varchar2("prospect_id").references(() => prospects.id),
      phoneNumber: varchar2("phone_number", { length: 20 }).notNull(),
      // Numéro appelé
      // Timing
      startedAt: timestamp2("started_at").notNull(),
      answeredAt: timestamp2("answered_at"),
      endedAt: timestamp2("ended_at"),
      durationSeconds: integer2("duration_seconds"),
      // Status
      status: varchar2("status", { length: 20 }).notNull(),
      // 'initiated' | 'ringing' | 'in-progress' | 'completed' | 'failed' | 'busy' | 'no-answer'
      direction: varchar2("direction", { length: 20 }).notNull().default("outbound"),
      // 'outbound'
      // Recording
      recordingUrl: text2("recording_url"),
      recordingDurationSeconds: integer2("recording_duration_seconds"),
      // Analyse IA
      transcription: text2("transcription"),
      sentiment: varchar2("sentiment", { length: 20 }),
      // 'positive' | 'neutral' | 'negative'
      sentimentScore: integer2("sentiment_score"),
      // 0-100
      keyPoints: jsonb2("key_points").$type(),
      actionItems: jsonb2("action_items").$type(),
      summary: text2("summary"),
      // Métadonnées
      callPurpose: varchar2("call_purpose", { length: 50 }),
      // 'prospection' | 'suivi' | 'closing'
      outcome: varchar2("outcome", { length: 50 }),
      // 'rendez_vous' | 'interet' | 'pas_interet' | 'rappel'
      // Coût (centimes €)
      costCents: integer2("cost_cents"),
      // Audit
      createdAt: timestamp2("created_at").defaultNow().notNull(),
      updatedAt: timestamp2("updated_at").defaultNow().notNull()
    }, (table) => [
      index2("phone_calls_entity_idx").on(table.entity),
      index2("phone_calls_caller_idx").on(table.callerUserId),
      index2("phone_calls_prospect_idx").on(table.prospectId),
      index2("phone_calls_status_idx").on(table.status),
      index2("phone_calls_started_at_idx").on(table.startedAt),
      index2("phone_calls_twilio_sid_idx").on(table.twilioCallSid)
    ]);
    phoneScripts = pgTable2("phone_scripts", {
      id: varchar2("id").primaryKey().default(sql2`gen_random_uuid()`),
      entity: varchar2("entity", { length: 50 }).notNull(),
      // RLS
      // Relations
      prospectId: varchar2("prospect_id").notNull().references(() => prospects.id),
      userId: varchar2("user_id").notNull().references(() => users.id),
      // Script IA
      scriptContent: text2("script_content").notNull(),
      callObjective: text2("call_objective").notNull(),
      discProfile: varchar2("disc_profile", { length: 1 }),
      // 'D' | 'I' | 'S' | 'C'
      // Personnalisation
      companyContext: jsonb2("company_context"),
      painPoints: jsonb2("pain_points").$type(),
      // Status
      usedInCallId: varchar2("used_in_call_id").references(() => phoneCalls.id),
      // Audit
      createdAt: timestamp2("created_at").defaultNow().notNull()
    }, (table) => [
      index2("phone_scripts_entity_idx").on(table.entity),
      index2("phone_scripts_prospect_idx").on(table.prospectId),
      index2("phone_scripts_user_idx").on(table.userId)
    ]);
    phoneAnalyticsDaily = pgTable2("phone_analytics_daily", {
      id: varchar2("id").primaryKey().default(sql2`gen_random_uuid()`),
      entity: varchar2("entity", { length: 50 }).notNull(),
      // RLS
      date: timestamp2("date").notNull(),
      userId: varchar2("user_id").notNull().references(() => users.id),
      // Volumes
      totalCalls: integer2("total_calls").default(0).notNull(),
      answeredCalls: integer2("answered_calls").default(0).notNull(),
      missedCalls: integer2("missed_calls").default(0).notNull(),
      // Durées (secondes)
      totalDurationSeconds: integer2("total_duration_seconds").default(0).notNull(),
      avgDurationSeconds: integer2("avg_duration_seconds").default(0).notNull(),
      // Outcomes
      appointmentsScheduled: integer2("appointments_scheduled").default(0).notNull(),
      interestedProspects: integer2("interested_prospects").default(0).notNull(),
      // Coûts (centimes €)
      totalCostCents: integer2("total_cost_cents").default(0).notNull(),
      // Qualité
      avgSentimentScore: integer2("avg_sentiment_score"),
      // Audit
      createdAt: timestamp2("created_at").defaultNow().notNull(),
      updatedAt: timestamp2("updated_at").defaultNow().notNull()
    }, (table) => [
      index2("phone_analytics_daily_entity_idx").on(table.entity),
      index2("phone_analytics_daily_date_idx").on(table.date),
      index2("phone_analytics_daily_user_idx").on(table.userId),
      index2("phone_analytics_daily_composite_idx").on(table.entity, table.userId, table.date)
    ]);
    phoneConsents = pgTable2("phone_consents", {
      id: varchar2("id").primaryKey().default(sql2`gen_random_uuid()`),
      entity: varchar2("entity", { length: 50 }).notNull(),
      // RLS
      prospectId: varchar2("prospect_id").notNull().references(() => prospects.id),
      phoneNumber: varchar2("phone_number", { length: 20 }).notNull(),
      // Consentement
      consentGiven: boolean2("consent_given").notNull(),
      consentDate: timestamp2("consent_date").notNull(),
      consentMethod: varchar2("consent_method", { length: 20 }),
      // 'verbal' | 'email' | 'form' - nullable pour tests E2E
      // Révocation
      revokedAt: timestamp2("revoked_at"),
      revokedBy: varchar2("revoked_by").references(() => users.id),
      // Audit
      createdAt: timestamp2("created_at").defaultNow().notNull()
    }, (table) => [
      index2("phone_consents_entity_idx").on(table.entity),
      index2("phone_consents_prospect_idx").on(table.prospectId),
      index2("phone_consents_phone_idx").on(table.phoneNumber)
    ]);
    phoneConfigHistory = pgTable2("phone_config_history", {
      id: varchar2("id").primaryKey().default(sql2`gen_random_uuid()`),
      // Référence à la config modifiée
      configId: varchar2("config_id").notNull().references(() => phoneConfigurations.id),
      // Type d'action
      action: text2("action").notNull(),
      // 'created' | 'updated' | 'activated' | 'deactivated' | 'deleted' | 'reputation_updated'
      // Raison de l'action
      reason: text2("reason"),
      // 'spam_detected' | 'manual_admin' | 'budget_exceeded' | 'test_failed'
      // Description textuelle
      description: text2("description"),
      // "Désactivé car score réputation < 30" | "Activé manuellement par admin"
      // Qui a fait l'action
      performedBy: varchar2("performed_by"),
      // UUID user admin, null si action automatique (CRON)
      performedAt: timestamp2("performed_at").defaultNow().notNull(),
      // État avant/après
      oldValues: jsonb2("old_values"),
      // Snapshot valeurs avant modification
      newValues: jsonb2("new_values"),
      // Snapshot valeurs après modification
      // Audit réseau
      ipAddress: varchar2("ip_address", { length: 45 }),
      // IP de l'admin
      userAgent: text2("user_agent")
      // User agent navigateur
    }, (table) => [
      index2("phone_config_history_config_id_idx").on(table.configId),
      index2("phone_config_history_performed_at_idx").on(table.performedAt),
      index2("phone_config_history_action_idx").on(table.action)
    ]);
    phoneConfigurationsRelations = relations(phoneConfigurations, ({ one }) => ({
      createdByUser: one(users, {
        fields: [phoneConfigurations.createdBy],
        references: [users.id]
      })
    }));
    phoneCallsRelations = relations(phoneCalls, ({ one }) => ({
      caller: one(users, {
        fields: [phoneCalls.callerUserId],
        references: [users.id]
      }),
      prospect: one(prospects, {
        fields: [phoneCalls.prospectId],
        references: [prospects.id]
      })
    }));
    phoneScriptsRelations = relations(phoneScripts, ({ one }) => ({
      prospect: one(prospects, {
        fields: [phoneScripts.prospectId],
        references: [prospects.id]
      }),
      user: one(users, {
        fields: [phoneScripts.userId],
        references: [users.id]
      }),
      usedInCall: one(phoneCalls, {
        fields: [phoneScripts.usedInCallId],
        references: [phoneCalls.id]
      })
    }));
    phoneAnalyticsDailyRelations = relations(phoneAnalyticsDaily, ({ one }) => ({
      user: one(users, {
        fields: [phoneAnalyticsDaily.userId],
        references: [users.id]
      })
    }));
    phoneConsentsRelations = relations(phoneConsents, ({ one }) => ({
      prospect: one(prospects, {
        fields: [phoneConsents.prospectId],
        references: [prospects.id]
      }),
      revokedByUser: one(users, {
        fields: [phoneConsents.revokedBy],
        references: [users.id]
      })
    }));
    phoneConfigHistoryRelations = relations(phoneConfigHistory, ({ one }) => ({
      config: one(phoneConfigurations, {
        fields: [phoneConfigHistory.configId],
        references: [phoneConfigurations.id]
      }),
      performedByUser: one(users, {
        fields: [phoneConfigHistory.performedBy],
        references: [users.id]
      })
    }));
    insertPhoneConfigurationSchema = createInsertSchema2(phoneConfigurations);
    insertPhoneCallSchema = createInsertSchema2(phoneCalls);
    insertPhoneScriptSchema = createInsertSchema2(phoneScripts);
    insertPhoneAnalyticsDailySchema = createInsertSchema2(phoneAnalyticsDaily);
    insertPhoneConsentSchema = createInsertSchema2(phoneConsents);
    insertPhoneConfigHistorySchema = createInsertSchema2(phoneConfigHistory);
  }
});

// shared/schema-gps.ts
import { sql as sql3 } from "drizzle-orm";
import { pgTable as pgTable3, text as text3, varchar as varchar3, timestamp as timestamp3, jsonb as jsonb3, index as index3, integer as integer3, decimal as decimal2, date as date2, boolean as boolean3, time } from "drizzle-orm/pg-core";
import { createInsertSchema as createInsertSchema3 } from "drizzle-zod";
import { z as z2 } from "zod";
var gpsPositions, gpsActivities, gpsDailyStats, gpsWeeklyReports, gpsOpportunities, gpsSystemConfig, apiCredentials, apiUsageLogs, supervisionLogs, insertGpsPositionSchema, insertGpsSystemConfigSchema, updateGpsSystemConfigSchema, insertApiCredentialSchema, insertGpsOpportunitySchema, insertGpsActivitySchema, insertSupervisionLogSchema;
var init_schema_gps = __esm({
  "shared/schema-gps.ts"() {
    "use strict";
    init_schema();
    gpsPositions = pgTable3("gps_positions", {
      id: varchar3("id").primaryKey().default(sql3`gen_random_uuid()`),
      // Relations
      userId: varchar3("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      entity: varchar3("entity", { length: 50 }).notNull(),
      // 'france' ou 'luxembourg'
      // Données GPS
      latitude: decimal2("latitude", { precision: 10, scale: 8 }).notNull(),
      longitude: decimal2("longitude", { precision: 11, scale: 8 }).notNull(),
      accuracy: decimal2("accuracy", { precision: 6, scale: 2 }),
      // précision en mètres
      altitude: decimal2("altitude", { precision: 8, scale: 2 }),
      // optionnel
      heading: decimal2("heading", { precision: 5, scale: 2 }),
      // direction 0-360°
      speed: decimal2("speed", { precision: 6, scale: 2 }),
      // vitesse km/h
      // Reverse Geocoding
      address: text3("address"),
      city: varchar3("city", { length: 100 }),
      postalCode: varchar3("postal_code", { length: 20 }),
      country: varchar3("country", { length: 2 }),
      // ISO code
      // Contexte
      batteryLevel: integer3("battery_level"),
      // 0-100%
      isCharging: boolean3("is_charging").default(false),
      networkType: varchar3("network_type", { length: 10 }),
      // '4G', '5G', 'WIFI'
      // Métadonnées
      capturedAt: timestamp3("captured_at").notNull(),
      // heure capture mobile
      receivedAt: timestamp3("received_at").defaultNow(),
      // heure serveur
      isManual: boolean3("is_manual").default(false),
      // position manuelle vs auto
      createdAt: timestamp3("created_at").defaultNow()
    }, (table) => [
      index3("idx_gps_user_date").on(table.userId, table.capturedAt),
      index3("idx_gps_entity").on(table.entity, table.capturedAt),
      index3("idx_gps_city").on(table.city, table.capturedAt)
    ]);
    gpsActivities = pgTable3("gps_activities", {
      id: varchar3("id").primaryKey().default(sql3`gen_random_uuid()`),
      // Relations
      userId: varchar3("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      entity: varchar3("entity", { length: 50 }).notNull(),
      // Activité
      activityType: varchar3("activity_type", { length: 50 }).notNull(),
      // 'visit', 'travel', 'pause', 'meeting'
      status: varchar3("status", { length: 20 }).default("active"),
      // 'active', 'completed', 'cancelled'
      // Localisation
      startLatitude: decimal2("start_latitude", { precision: 10, scale: 8 }),
      startLongitude: decimal2("start_longitude", { precision: 11, scale: 8 }),
      endLatitude: decimal2("end_latitude", { precision: 10, scale: 8 }),
      endLongitude: decimal2("end_longitude", { precision: 11, scale: 8 }),
      address: text3("address"),
      city: varchar3("city", { length: 100 }),
      // Temporalité
      startedAt: timestamp3("started_at").notNull(),
      endedAt: timestamp3("ended_at"),
      durationMinutes: integer3("duration_minutes"),
      // calculé par trigger
      // Contexte
      distanceKm: decimal2("distance_km", { precision: 8, scale: 2 }),
      // si travel
      prospectId: varchar3("prospect_id").references(() => prospects.id),
      // si visite
      notes: text3("notes"),
      weatherConditions: jsonb3("weather_conditions"),
      // température, conditions
      createdAt: timestamp3("created_at").defaultNow(),
      updatedAt: timestamp3("updated_at").defaultNow()
    }, (table) => [
      index3("idx_activity_user_date").on(table.userId, table.startedAt),
      index3("idx_activity_type").on(table.activityType, table.status),
      index3("idx_activity_prospect").on(table.prospectId)
    ]);
    gpsDailyStats = pgTable3("gps_daily_stats", {
      id: varchar3("id").primaryKey().default(sql3`gen_random_uuid()`),
      // Relations
      userId: varchar3("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      entity: varchar3("entity", { length: 50 }).notNull(),
      statDate: date2("stat_date").notNull(),
      // Statistiques déplacement
      totalDistanceKm: decimal2("total_distance_km", { precision: 8, scale: 2 }).default(sql3`0`),
      totalDurationMinutes: integer3("total_duration_minutes").default(0),
      activeTimeMinutes: integer3("active_time_minutes").default(0),
      // hors pauses
      // Statistiques activités
      visitsCount: integer3("visits_count").default(0),
      meetingsCount: integer3("meetings_count").default(0),
      callsCount: integer3("calls_count").default(0),
      // Villes visitées
      citiesVisited: text3("cities_visited").array(),
      // array de villes
      uniqueCitiesCount: integer3("unique_cities_count").default(0),
      // Performance
      firstActivityTime: time("first_activity_time"),
      lastActivityTime: time("last_activity_time"),
      workingHours: decimal2("working_hours", { precision: 4, scale: 2 }),
      // calculé
      // Opportunités
      opportunitiesDetected: integer3("opportunities_detected").default(0),
      opportunitiesConverted: integer3("opportunities_converted").default(0),
      createdAt: timestamp3("created_at").defaultNow(),
      updatedAt: timestamp3("updated_at").defaultNow()
    }, (table) => [
      index3("idx_daily_user_date").on(table.userId, table.statDate),
      index3("idx_daily_entity_date").on(table.entity, table.statDate)
    ]);
    gpsWeeklyReports = pgTable3("gps_weekly_reports", {
      id: varchar3("id").primaryKey().default(sql3`gen_random_uuid()`),
      // Relations
      userId: varchar3("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      entity: varchar3("entity", { length: 50 }).notNull(),
      // Période
      weekStart: date2("week_start").notNull(),
      // lundi
      weekEnd: date2("week_end").notNull(),
      // dimanche
      weekNumber: integer3("week_number").notNull(),
      // semaine année
      year: integer3("year").notNull(),
      // Agrégations
      totalDistanceKm: decimal2("total_distance_km", { precision: 9, scale: 2 }),
      totalVisits: integer3("total_visits"),
      totalMeetings: integer3("total_meetings"),
      citiesVisited: text3("cities_visited").array(),
      // Performance
      avgDailyDistance: decimal2("avg_daily_distance", { precision: 7, scale: 2 }),
      avgDailyVisits: decimal2("avg_daily_visits", { precision: 4, scale: 2 }),
      bestDay: date2("best_day"),
      bestDayVisits: integer3("best_day_visits"),
      // Opportunités
      opportunitiesDetected: integer3("opportunities_detected"),
      opportunitiesConverted: integer3("opportunities_converted"),
      conversionRate: decimal2("conversion_rate", { precision: 5, scale: 2 }),
      // Fichier généré
      pdfFilePath: varchar3("pdf_file_path", { length: 500 }),
      pdfGeneratedAt: timestamp3("pdf_generated_at"),
      // Distribution
      sentAt: timestamp3("sent_at"),
      sentTo: text3("sent_to").array(),
      // emails destinataires
      createdAt: timestamp3("created_at").defaultNow()
    }, (table) => [
      index3("idx_weekly_user").on(table.userId, table.year, table.weekNumber),
      index3("idx_weekly_entity").on(table.entity, table.weekStart)
    ]);
    gpsOpportunities = pgTable3("gps_opportunities", {
      id: varchar3("id").primaryKey().default(sql3`gen_random_uuid()`),
      // Relations
      userId: varchar3("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      entity: varchar3("entity", { length: 50 }).notNull(),
      prospectId: varchar3("prospect_id").notNull().references(() => prospects.id, { onDelete: "cascade" }),
      positionId: varchar3("position_id").references(() => gpsPositions.id),
      // Détection
      detectedAt: timestamp3("detected_at").notNull(),
      distanceMeters: integer3("distance_meters").notNull(),
      // distance prospect
      // Position commercial
      userLatitude: decimal2("user_latitude", { precision: 10, scale: 8 }).notNull(),
      userLongitude: decimal2("user_longitude", { precision: 11, scale: 8 }).notNull(),
      userAddress: text3("user_address"),
      // Position prospect
      prospectLatitude: decimal2("prospect_latitude", { precision: 10, scale: 8 }).notNull(),
      prospectLongitude: decimal2("prospect_longitude", { precision: 11, scale: 8 }).notNull(),
      prospectAddress: text3("prospect_address"),
      prospectCompanyName: varchar3("prospect_company_name", { length: 200 }),
      // Qualification
      priorityScore: integer3("priority_score").default(50),
      // 0-100
      lastContactDaysAgo: integer3("last_contact_days_ago"),
      prospectStatus: varchar3("prospect_status", { length: 50 }),
      // Actions
      status: varchar3("status", { length: 20 }).default("pending"),
      // 'pending', 'accepted', 'declined', 'expired'
      notifiedAt: timestamp3("notified_at"),
      notificationType: varchar3("notification_type", { length: 20 }),
      // 'push', 'sms', 'email'
      // Résultat
      actionTaken: varchar3("action_taken", { length: 50 }),
      // 'visited', 'called', 'ignored'
      actionTakenAt: timestamp3("action_taken_at"),
      actionNotes: text3("action_notes"),
      // Métadonnées
      expiresAt: timestamp3("expires_at"),
      // 24h par défaut
      createdAt: timestamp3("created_at").defaultNow(),
      updatedAt: timestamp3("updated_at").defaultNow()
    }, (table) => [
      index3("idx_opp_user_status").on(table.userId, table.status, table.detectedAt),
      index3("idx_opp_prospect").on(table.prospectId),
      index3("idx_opp_detection").on(table.detectedAt)
    ]);
    gpsSystemConfig = pgTable3("gps_system_config", {
      id: varchar3("id").primaryKey().default(sql3`gen_random_uuid()`),
      // Identification
      entityId: varchar3("entity_id", { length: 50 }).notNull().unique(),
      // 'france', 'luxembourg', 'global'
      // Tracking
      trackingEnabled: boolean3("tracking_enabled").default(true),
      trackingFrequencyMinutes: integer3("tracking_frequency_minutes").default(5),
      trackingHoursStart: time("tracking_hours_start").default(sql3`'08:00:00'`),
      trackingHoursEnd: time("tracking_hours_end").default(sql3`'19:00:00'`),
      trackingDays: integer3("tracking_days").array().default(sql3`ARRAY[1,2,3,4,5]`),
      // 1=lundi...5=vendredi
      // Opportunités
      opportunitiesEnabled: boolean3("opportunities_enabled").default(true),
      opportunitiesRadiusKm: decimal2("opportunities_radius_km", { precision: 5, scale: 2 }).default(sql3`5.0`),
      opportunitiesMinPriority: integer3("opportunities_min_priority").default(30),
      // Rétention données
      dataRetentionDays: integer3("data_retention_days").default(90),
      autoCleanupEnabled: boolean3("auto_cleanup_enabled").default(true),
      // Rapports
      weeklyReportsEnabled: boolean3("weekly_reports_enabled").default(true),
      weeklyReportsDay: integer3("weekly_reports_day").default(1),
      // 1=lundi
      weeklyReportsHour: time("weekly_reports_hour").default(sql3`'08:00:00'`),
      weeklyReportsRecipients: text3("weekly_reports_recipients").array(),
      // emails
      // Features
      geocodingEnabled: boolean3("geocoding_enabled").default(true),
      routeOptimizationEnabled: boolean3("route_optimization_enabled").default(true),
      weatherIntegrationEnabled: boolean3("weather_integration_enabled").default(false),
      createdAt: timestamp3("created_at").defaultNow(),
      updatedAt: timestamp3("updated_at").defaultNow(),
      createdBy: varchar3("created_by").references(() => users.id),
      updatedBy: varchar3("updated_by").references(() => users.id)
    }, (table) => [
      index3("idx_gps_config_entity").on(table.entityId)
    ]);
    apiCredentials = pgTable3("api_credentials", {
      id: varchar3("id").primaryKey().default(sql3`gen_random_uuid()`),
      // Identification
      provider: varchar3("provider", { length: 50 }).notNull(),
      // 'twilio', 'google_maps', 'openweather'
      entityId: varchar3("entity_id", { length: 50 }).notNull(),
      // 'global', 'france', 'luxembourg'
      // Credentials (CHIFFRÉES)
      apiKeyEncrypted: text3("api_key_encrypted"),
      // AES-256 encrypted
      apiSecretEncrypted: text3("api_secret_encrypted"),
      // pour providers nécessitant secret
      additionalConfig: jsonb3("additional_config"),
      // config spécifique provider
      // Status
      isActive: boolean3("is_active").default(false),
      lastValidatedAt: timestamp3("last_validated_at"),
      validationStatus: varchar3("validation_status", { length: 20 }),
      // 'valid', 'invalid', 'pending', 'error'
      validationMessage: text3("validation_message"),
      // Quotas & Usage
      monthlyQuota: integer3("monthly_quota"),
      // si applicable
      currentUsage: integer3("current_usage").default(0),
      quotaResetAt: timestamp3("quota_reset_at"),
      createdAt: timestamp3("created_at").defaultNow(),
      updatedAt: timestamp3("updated_at").defaultNow(),
      createdBy: varchar3("created_by").references(() => users.id),
      updatedBy: varchar3("updated_by").references(() => users.id)
    }, (table) => [
      index3("idx_api_creds_provider").on(table.provider, table.isActive),
      index3("idx_api_creds_entity").on(table.entityId)
    ]);
    apiUsageLogs = pgTable3("api_usage_logs", {
      id: varchar3("id").primaryKey().default(sql3`gen_random_uuid()`),
      // Identification
      credentialId: varchar3("credential_id").references(() => apiCredentials.id),
      provider: varchar3("provider", { length: 50 }).notNull(),
      entityId: varchar3("entity_id", { length: 50 }).notNull(),
      // Requête
      endpoint: varchar3("endpoint", { length: 200 }),
      method: varchar3("method", { length: 10 }),
      requestParams: jsonb3("request_params"),
      // Réponse
      statusCode: integer3("status_code"),
      responseTimeMs: integer3("response_time_ms"),
      success: boolean3("success"),
      errorMessage: text3("error_message"),
      // Coûts
      estimatedCost: decimal2("estimated_cost", { precision: 10, scale: 4 }),
      // en euros
      createdAt: timestamp3("created_at").defaultNow(),
      userId: varchar3("user_id").references(() => users.id)
    }, (table) => [
      index3("idx_api_logs_date").on(table.createdAt),
      index3("idx_api_logs_provider").on(table.provider, table.createdAt),
      index3("idx_api_logs_cred").on(table.credentialId, table.createdAt)
    ]);
    supervisionLogs = pgTable3("supervision_logs", {
      id: varchar3("id").primaryKey().default(sql3`gen_random_uuid()`),
      // Superviseur
      supervisorId: varchar3("supervisor_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      supervisorEmail: varchar3("supervisor_email", { length: 255 }).notNull(),
      // Action
      action: varchar3("action", { length: 50 }).notNull(),
      // 'view_all_positions', 'view_user_detail'
      targetUserId: varchar3("target_user_id").references(() => users.id, { onDelete: "set null" }),
      // NULL si vue globale
      // Contexte requête
      ipAddress: varchar3("ip_address", { length: 45 }),
      userAgent: text3("user_agent"),
      filtersApplied: jsonb3("filters_applied"),
      // {"entity": "france", "activeOnly": true}
      positionsCount: integer3("positions_count"),
      // Nombre positions consultées
      // Métadonnées
      accessedAt: timestamp3("accessed_at").defaultNow()
    }, (table) => [
      index3("idx_supervision_logs_supervisor").on(table.supervisorId),
      index3("idx_supervision_logs_accessed_at").on(table.accessedAt),
      index3("idx_supervision_logs_target").on(table.targetUserId)
    ]);
    insertGpsPositionSchema = createInsertSchema3(gpsPositions).omit({
      id: true,
      receivedAt: true,
      createdAt: true
    });
    insertGpsSystemConfigSchema = createInsertSchema3(gpsSystemConfig).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    updateGpsSystemConfigSchema = insertGpsSystemConfigSchema.partial().omit({ entityId: true });
    insertApiCredentialSchema = createInsertSchema3(apiCredentials, {
      provider: z2.enum(["twilio", "google_maps", "openweather"]),
      entityId: z2.string().min(1),
      apiKeyEncrypted: z2.string().optional()
    }).omit({ id: true, createdAt: true, updatedAt: true });
    insertGpsOpportunitySchema = createInsertSchema3(gpsOpportunities).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertGpsActivitySchema = createInsertSchema3(gpsActivities).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertSupervisionLogSchema = createInsertSchema3(supervisionLogs).omit({
      id: true,
      accessedAt: true
    });
  }
});

// shared/schema-competitor.ts
import { sql as sql4 } from "drizzle-orm";
import { pgTable as pgTable4, varchar as varchar4, timestamp as timestamp4, decimal as decimal3, date as date3, boolean as boolean4, integer as integer4, text as text4, index as index4 } from "drizzle-orm/pg-core";
import { relations as relations2 } from "drizzle-orm";
import { createInsertSchema as createInsertSchema4 } from "drizzle-zod";
var concurrents, concurrentSituations, concurrentAttemptsHistory, prospectEvents, competitorAlerts, systemConfig, concurrentsRelations, concurrentSituationsRelations, concurrentAttemptsHistoryRelations, prospectEventsRelations, competitorAlertsRelations, insertConcurrentSchema, insertConcurrentSituationSchema, insertConcurrentAttemptSchema, insertProspectEventSchema, insertCompetitorAlertSchema, insertSystemConfigSchema;
var init_schema_competitor = __esm({
  "shared/schema-competitor.ts"() {
    "use strict";
    init_schema();
    concurrents = pgTable4("concurrents", {
      id: varchar4("id").primaryKey().default(sql4`gen_random_uuid()`),
      // IDENTITÉ
      name: varchar4("name", { length: 100 }).notNull().unique(),
      type: varchar4("type", { length: 20 }).notNull(),
      // 'national' | 'regional' | 'local'
      isActive: boolean4("is_active").notNull().default(true),
      // COUVERTURE GÉOGRAPHIQUE
      coverageType: varchar4("coverage_type", { length: 20 }),
      // 'france' | 'regional' | 'departement'
      coverageRegions: text4("coverage_regions").array(),
      // ['provence-alpes-cote-dazur', 'occitanie']
      coverageDepartments: varchar4("coverage_departments", { length: 3 }).array(),
      // ['13', '83', '84']
      // SOLUTIONS PROPOSÉES (ordre prioritaire 1-7)
      solutionsOffered: varchar4("solutions_offered", { length: 50 }).array(),
      /* Valeurs :
        1. 'alarme_intrusion'
        2. 'telesurveillance_classique'
        3. 'intervention_gardien'
        4. 'videosurveillance'
        5. 'controle_acces'
        6. 'detection_incendie'
        7. 'autre'
      */
      // BUSINESS INTELLIGENCE
      estimatedMarketSharePercent: decimal3("estimated_market_share_percent", { precision: 5, scale: 2 }),
      avgContractDurationMonths: integer4("avg_contract_duration_months").default(60),
      typicalPricingTier: varchar4("typical_pricing_tier", { length: 20 }),
      // 'low' | 'medium' | 'high' | 'premium'
      strengths: text4("strengths"),
      // Points forts identifiés
      weaknesses: text4("weaknesses"),
      // Points faibles identifiés
      // CONTACT
      websiteUrl: text4("website_url"),
      linkedinUrl: text4("linkedin_url"),
      // MÉTADONNÉES
      createdAt: timestamp4("created_at").defaultNow(),
      updatedAt: timestamp4("updated_at").defaultNow(),
      deletedAt: timestamp4("deleted_at")
    }, (table) => [
      index4("idx_concurrents_type").on(table.type),
      index4("idx_concurrents_active").on(table.isActive)
    ]);
    concurrentSituations = pgTable4("concurrent_situations", {
      id: varchar4("id").primaryKey().default(sql4`gen_random_uuid()`),
      // RLS (Row Level Security)
      entity: varchar4("entity", { length: 50 }).notNull(),
      // 'france' | 'luxembourg' | 'belgique'
      // RÉFÉRENCE PROSPECT
      prospectId: varchar4("prospect_id").notNull().references(() => prospects.id, { onDelete: "cascade" }),
      siren: varchar4("siren", { length: 14 }),
      // OPTIONNEL - Si absent → statut 'a_qualifier'
      // CONTACT & ENTREPRISE (Nouveaux champs P3.6)
      contactFirstName: varchar4("contact_first_name", { length: 100 }),
      contactLastName: varchar4("contact_last_name", { length: 100 }),
      raisonSociale: varchar4("raison_sociale", { length: 255 }),
      // Nom légal entreprise
      enseigne: varchar4("enseigne", { length: 255 }),
      // Nom commercial / Marque
      // CONCURRENT
      concurrentId: varchar4("concurrent_id").notNull().references(() => concurrents.id),
      // ÉCHÉANCE
      contractEndDate: date3("contract_end_date").notNull(),
      // Date FIN contrat concurrent
      wakeupDate: date3("wakeup_date").notNull(),
      // Date réveil automatique (J-240)
      // MONTANT
      monthlyAmount: decimal3("monthly_amount", { precision: 10, scale: 2 }),
      // Abonnement mensuel (essentiel)
      estimatedTotalContract: decimal3("estimated_total_contract", { precision: 12, scale: 2 }),
      // Valeur totale contrat
      avgContractDurationMonths: integer4("avg_contract_duration_months").default(60),
      // Durée moyenne contrat en mois (défaut 60 = 5 ans)
      amountKnown: boolean4("amount_known").notNull().default(true),
      // SOLUTIONS INSTALLÉES (ordre prioritaire 1-7)
      solutionsInstalled: varchar4("solutions_installed", { length: 50 }).array(),
      numberOfSites: integer4("number_of_sites").default(1),
      subscriptionType: varchar4("subscription_type", { length: 30 }),
      // 'mensuel' | 'trimestriel' | 'annuel' | 'pluriannuel'
      // SATISFACTION CLIENT
      satisfactionLevel: varchar4("satisfaction_level", { length: 20 }),
      // 'satisfied' | 'neutral' | 'unsatisfied' | 'unknown'
      satisfactionNotes: text4("satisfaction_notes"),
      // CONTEXTE CAPTURE
      detectionSource: varchar4("detection_source", { length: 50 }).notNull(),
      // 'phoning' | 'gps_terrain' | 'qualification' | 'manual' | 'import'
      detectedBy: varchar4("detected_by").notNull().references(() => users.id),
      detectedAt: timestamp4("detected_at").defaultNow(),
      // GÉOLOCALISATION
      regionCode: varchar4("region_code", { length: 50 }),
      departmentCode: varchar4("department_code", { length: 3 }),
      // STATUS & WORKFLOW
      status: varchar4("status", { length: 30 }).notNull().default("future"),
      /* Valeurs :
        'a_qualifier' : Échéance captée sans SIRET (qualification bureau requise)
        'future'      : Échéance lointaine (> 8 mois), en sommeil
        'active'      : Réveil effectué, opportunité CRM créée
        'won'         : Contrat signé, reconquête réussie
        'lost'        : Perdu, rebouclage programmé
        'archived'    : Procédure collective ou abandon définitif
      */
      // OPPORTUNITÉ CRM (si créée)
      opportunityCreated: boolean4("opportunity_created").default(false),
      opportunityId: varchar4("opportunity_id"),
      // Référence opportunities(id)
      opportunityCreatedAt: timestamp4("opportunity_created_at"),
      // REBOUCLAGE
      attemptNumber: integer4("attempt_number").default(1),
      // Tentative 1, 2, 3...
      nextAttemptDate: date3("next_attempt_date"),
      nextWakeupDate: date3("next_wakeup_date"),
      // RÉSULTAT WON
      wonAt: timestamp4("won_at"),
      wonBy: varchar4("won_by").references(() => users.id),
      wonContractValue: decimal3("won_contract_value", { precision: 12, scale: 2 }),
      // RÉSULTAT LOST
      lostAt: timestamp4("lost_at"),
      lostBy: varchar4("lost_by").references(() => users.id),
      lostReason: text4("lost_reason"),
      lostCompetitor: varchar4("lost_competitor", { length: 100 }),
      // ARCHIVAGE
      archivedAt: timestamp4("archived_at"),
      archivedReason: text4("archived_reason"),
      // NOTES
      notes: text4("notes"),
      internalNotes: text4("internal_notes"),
      // MÉTADONNÉES
      createdAt: timestamp4("created_at").defaultNow(),
      updatedAt: timestamp4("updated_at").defaultNow()
    }, (table) => [
      index4("idx_concurrent_situations_entity").on(table.entity),
      index4("idx_concurrent_situations_prospect").on(table.prospectId),
      index4("idx_concurrent_situations_status").on(table.status),
      index4("idx_concurrent_situations_wakeup_date").on(table.wakeupDate),
      index4("idx_concurrent_situations_contract_end").on(table.contractEndDate),
      index4("idx_concurrent_situations_next_attempt").on(table.nextAttemptDate)
    ]);
    concurrentAttemptsHistory = pgTable4("concurrent_attempts_history", {
      id: varchar4("id").primaryKey().default(sql4`gen_random_uuid()`),
      // RLS
      entity: varchar4("entity", { length: 50 }).notNull(),
      // RÉFÉRENCE
      situationId: varchar4("situation_id").notNull().references(() => concurrentSituations.id, { onDelete: "cascade" }),
      // TENTATIVE
      attemptNumber: integer4("attempt_number").notNull(),
      // 1, 2, 3...
      attemptDate: date3("attempt_date").notNull(),
      attemptBy: varchar4("attempt_by").notNull().references(() => users.id),
      // CONTEXTE
      contactMethod: varchar4("contact_method", { length: 50 }),
      // 'phone' | 'email' | 'terrain' | 'rdv'
      contactDuration: integer4("contact_duration"),
      // Secondes (si appel)
      // RÉSULTAT
      outcome: varchar4("outcome", { length: 20 }).notNull(),
      // 'won' | 'lost' | 'in_progress'
      outcomeDate: date3("outcome_date"),
      // DÉTAILS
      notes: text4("notes"),
      lostReason: text4("lost_reason"),
      lostCompetitor: varchar4("lost_competitor", { length: 100 }),
      wonContractValue: decimal3("won_contract_value", { precision: 12, scale: 2 }),
      // REBOUCLAGE
      nextAttemptScheduled: boolean4("next_attempt_scheduled").default(false),
      nextAttemptDate: date3("next_attempt_date"),
      // MÉTADONNÉES
      createdAt: timestamp4("created_at").defaultNow()
    }, (table) => [
      index4("idx_attempts_history_entity").on(table.entity),
      index4("idx_attempts_history_situation").on(table.situationId),
      index4("idx_attempts_history_outcome").on(table.outcome)
    ]);
    prospectEvents = pgTable4("prospect_events", {
      id: varchar4("id").primaryKey().default(sql4`gen_random_uuid()`),
      // RLS
      entity: varchar4("entity", { length: 50 }).notNull(),
      // RÉFÉRENCE
      prospectId: varchar4("prospect_id").notNull().references(() => prospects.id, { onDelete: "cascade" }),
      siren: varchar4("siren", { length: 14 }).notNull(),
      // ÉVÉNEMENT
      eventType: varchar4("event_type", { length: 50 }).notNull(),
      /* Valeurs :
        'demenagement'
        'changement_gerant'
        'cession'
        'augmentation_capital'
        'fusion'
        'changement_activite'
        'procedure_collective'
        'modification_statuts'
      */
      eventDate: date3("event_date").notNull(),
      // Date réelle événement
      detectedDate: date3("detected_date").notNull(),
      // Date détection par système
      // SOURCE
      source: varchar4("source", { length: 30 }).notNull(),
      // 'bodacc' | 'insee' | 'pappers' | 'manual'
      sourceReference: varchar4("source_reference", { length: 100 }),
      // ID annonce BODACC, etc.
      // DÉTAILS
      eventDetails: text4("event_details"),
      // JSON stringifié avec détails complets
      oldValue: text4("old_value"),
      // Ancienne valeur (ex: ancienne adresse)
      newValue: text4("new_value"),
      // Nouvelle valeur (ex: nouvelle adresse)
      // QUALIFICATION
      criticality: varchar4("criticality", { length: 20 }).notNull(),
      // 'urgent' | 'important' | 'monitor' | 'archive'
      impactScore: integer4("impact_score"),
      // 0-100
      // TRAITEMENT
      treated: boolean4("treated").default(false),
      treatedAt: timestamp4("treated_at"),
      treatedBy: varchar4("treated_by").references(() => users.id),
      treatmentAction: text4("treatment_action"),
      // Action prise
      // OPPORTUNITÉ ANTICIPÉE (si créée)
      opportunityCreated: boolean4("opportunity_created").default(false),
      opportunityId: varchar4("opportunity_id"),
      // NOTES
      notes: text4("notes"),
      // MÉTADONNÉES
      createdAt: timestamp4("created_at").defaultNow(),
      updatedAt: timestamp4("updated_at").defaultNow()
    }, (table) => [
      index4("idx_prospect_events_entity").on(table.entity),
      index4("idx_prospect_events_prospect").on(table.prospectId),
      index4("idx_prospect_events_type").on(table.eventType),
      index4("idx_prospect_events_criticality").on(table.criticality),
      index4("idx_prospect_events_treated").on(table.treated),
      index4("idx_prospect_events_detected_date").on(table.detectedDate)
    ]);
    competitorAlerts = pgTable4("competitor_alerts", {
      id: varchar4("id").primaryKey().default(sql4`gen_random_uuid()`),
      // RLS
      entity: varchar4("entity", { length: 50 }).notNull(),
      // RÉFÉRENCE
      situationId: varchar4("situation_id").notNull().references(() => concurrentSituations.id, { onDelete: "cascade" }),
      // ALERTE
      alertType: varchar4("alert_type", { length: 20 }).notNull(),
      // 'wakeup' | 'j180' | 'j90' | 'j60' | 'j30' | 'j15' | 'j7'
      alertDate: date3("alert_date").notNull(),
      // Date déclenchement alerte
      daysBeforeEnd: integer4("days_before_end").notNull(),
      // Jours restants avant échéance
      // DESTINATAIRES
      targetUserId: varchar4("target_user_id").notNull().references(() => users.id),
      // BD assigné
      escalatedToManager: boolean4("escalated_to_manager").default(false),
      escalatedToJP: boolean4("escalated_to_jp").default(false),
      // ENVOI
      sent: boolean4("sent").default(false),
      sentAt: timestamp4("sent_at"),
      sentChannels: varchar4("sent_channels", { length: 50 }).array(),
      // ['email', 'in_app', 'sms']
      // LECTURE
      read: boolean4("read").default(false),
      readAt: timestamp4("read_at"),
      // ACTION
      actionTaken: boolean4("action_taken").default(false),
      actionTakenAt: timestamp4("action_taken_at"),
      actionNotes: text4("action_notes"),
      // MÉTADONNÉES
      createdAt: timestamp4("created_at").defaultNow()
    }, (table) => [
      index4("idx_competitor_alerts_entity").on(table.entity),
      index4("idx_competitor_alerts_situation").on(table.situationId),
      index4("idx_competitor_alerts_user").on(table.targetUserId),
      index4("idx_competitor_alerts_read").on(table.read),
      index4("idx_competitor_alerts_alert_date").on(table.alertDate)
    ]);
    systemConfig = pgTable4("system_config", {
      id: varchar4("id").primaryKey().default(sql4`gen_random_uuid()`),
      key: varchar4("key", { length: 100 }).notNull().unique(),
      value: text4("value").notNull(),
      // JSON stringifié
      description: text4("description"),
      category: varchar4("category", { length: 50 }),
      // 'wakeup' | 'alerts' | 'rebouclage' | 'amounts' | 'events'
      updatedAt: timestamp4("updated_at").defaultNow(),
      updatedBy: varchar4("updated_by").references(() => users.id)
    });
    concurrentsRelations = relations2(concurrents, ({ many }) => ({
      situations: many(concurrentSituations)
    }));
    concurrentSituationsRelations = relations2(concurrentSituations, ({ one, many }) => ({
      prospect: one(prospects, {
        fields: [concurrentSituations.prospectId],
        references: [prospects.id]
      }),
      concurrent: one(concurrents, {
        fields: [concurrentSituations.concurrentId],
        references: [concurrents.id]
      }),
      detectedByUser: one(users, {
        fields: [concurrentSituations.detectedBy],
        references: [users.id]
      }),
      attempts: many(concurrentAttemptsHistory),
      alerts: many(competitorAlerts)
    }));
    concurrentAttemptsHistoryRelations = relations2(concurrentAttemptsHistory, ({ one }) => ({
      situation: one(concurrentSituations, {
        fields: [concurrentAttemptsHistory.situationId],
        references: [concurrentSituations.id]
      }),
      attemptByUser: one(users, {
        fields: [concurrentAttemptsHistory.attemptBy],
        references: [users.id]
      })
    }));
    prospectEventsRelations = relations2(prospectEvents, ({ one }) => ({
      prospect: one(prospects, {
        fields: [prospectEvents.prospectId],
        references: [prospects.id]
      }),
      treatedByUser: one(users, {
        fields: [prospectEvents.treatedBy],
        references: [users.id]
      })
    }));
    competitorAlertsRelations = relations2(competitorAlerts, ({ one }) => ({
      situation: one(concurrentSituations, {
        fields: [competitorAlerts.situationId],
        references: [concurrentSituations.id]
      }),
      targetUser: one(users, {
        fields: [competitorAlerts.targetUserId],
        references: [users.id]
      })
    }));
    insertConcurrentSchema = createInsertSchema4(concurrents).omit({
      id: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true
    });
    insertConcurrentSituationSchema = createInsertSchema4(concurrentSituations).omit({
      id: true,
      createdAt: true,
      updatedAt: true,
      opportunityCreatedAt: true,
      wonAt: true,
      lostAt: true,
      archivedAt: true,
      detectedAt: true
    });
    insertConcurrentAttemptSchema = createInsertSchema4(concurrentAttemptsHistory).omit({
      id: true,
      createdAt: true
    });
    insertProspectEventSchema = createInsertSchema4(prospectEvents).omit({
      id: true,
      createdAt: true,
      updatedAt: true,
      treatedAt: true
    });
    insertCompetitorAlertSchema = createInsertSchema4(competitorAlerts).omit({
      id: true,
      createdAt: true,
      sentAt: true,
      readAt: true,
      actionTakenAt: true
    });
    insertSystemConfigSchema = createInsertSchema4(systemConfig).omit({
      id: true,
      updatedAt: true
    });
  }
});

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  actions: () => actions,
  actionsRelations: () => actionsRelations,
  apiCredentials: () => apiCredentials,
  apiUsageLogs: () => apiUsageLogs,
  appointments: () => appointments,
  appointmentsRelations: () => appointmentsRelations,
  auditLogs: () => auditLogs,
  batchImportProspects: () => batchImportProspects,
  batchImports: () => batchImports,
  blacklistProspection: () => blacklistProspection,
  callNotes: () => callNotes,
  callNotesRelations: () => callNotesRelations,
  callScripts: () => callScripts,
  callScriptsRelations: () => callScriptsRelations,
  calls: () => calls,
  callsRelations: () => callsRelations,
  campagnesProspection: () => campagnesProspection,
  companies: () => companies,
  companyRelationships: () => companyRelationships,
  competitorAlerts: () => competitorAlerts,
  competitorAlertsRelations: () => competitorAlertsRelations,
  concurrentAttemptsHistory: () => concurrentAttemptsHistory,
  concurrentAttemptsHistoryRelations: () => concurrentAttemptsHistoryRelations,
  concurrentSituations: () => concurrentSituations,
  concurrentSituationsRelations: () => concurrentSituationsRelations,
  concurrents: () => concurrents,
  concurrentsRelations: () => concurrentsRelations,
  conversations: () => conversations,
  conversationsRelations: () => conversationsRelations,
  enrichmentLogs: () => enrichmentLogs,
  entityTypeSchema: () => entityTypeSchema,
  gpsActivities: () => gpsActivities,
  gpsDailyStats: () => gpsDailyStats,
  gpsOpportunities: () => gpsOpportunities,
  gpsPositions: () => gpsPositions,
  gpsSystemConfig: () => gpsSystemConfig,
  gpsWeeklyReports: () => gpsWeeklyReports,
  insertActionSchema: () => insertActionSchema,
  insertApiCredentialSchema: () => insertApiCredentialSchema,
  insertAppointmentSchema: () => insertAppointmentSchema,
  insertAuditLogSchema: () => insertAuditLogSchema,
  insertBatchImportProspectSchema: () => insertBatchImportProspectSchema,
  insertBatchImportSchema: () => insertBatchImportSchema,
  insertBlacklistProspectionSchema: () => insertBlacklistProspectionSchema,
  insertCallNoteSchema: () => insertCallNoteSchema,
  insertCallSchema: () => insertCallSchema,
  insertCallScriptSchema: () => insertCallScriptSchema,
  insertCampagneProspectionSchema: () => insertCampagneProspectionSchema,
  insertCompanyRelationshipSchema: () => insertCompanyRelationshipSchema,
  insertCompanySchema: () => insertCompanySchema,
  insertCompetitorAlertSchema: () => insertCompetitorAlertSchema,
  insertConcurrentAttemptSchema: () => insertConcurrentAttemptSchema,
  insertConcurrentSchema: () => insertConcurrentSchema,
  insertConcurrentSituationSchema: () => insertConcurrentSituationSchema,
  insertConversationSchema: () => insertConversationSchema,
  insertEnrichmentLogSchema: () => insertEnrichmentLogSchema,
  insertGpsActivitySchema: () => insertGpsActivitySchema,
  insertGpsOpportunitySchema: () => insertGpsOpportunitySchema,
  insertGpsPositionSchema: () => insertGpsPositionSchema,
  insertGpsSystemConfigSchema: () => insertGpsSystemConfigSchema,
  insertInteractionProspectionSchema: () => insertInteractionProspectionSchema,
  insertInvitationSchema: () => insertInvitationSchema,
  insertLearningInsightSchema: () => insertLearningInsightSchema,
  insertLoginAttemptSchema: () => insertLoginAttemptSchema,
  insertMediaFileSchema: () => insertMediaFileSchema,
  insertMessageSchema: () => insertMessageSchema,
  insertMessageVariantSchema: () => insertMessageVariantSchema,
  insertNotificationTransfertSchema: () => insertNotificationTransfertSchema,
  insertObjectionSchema: () => insertObjectionSchema,
  insertOpportunityActivitySchema: () => insertOpportunityActivitySchema,
  insertOpportunityNoteSchema: () => insertOpportunityNoteSchema,
  insertOpportunitySchema: () => insertOpportunitySchema,
  insertOrganizationEntitySchema: () => insertOrganizationEntitySchema,
  insertPappersCacheSchema: () => insertPappersCacheSchema,
  insertPasswordResetTokenSchema: () => insertPasswordResetTokenSchema,
  insertPatronContactSchema: () => insertPatronContactSchema,
  insertPhoneAnalyticsDailySchema: () => insertPhoneAnalyticsDailySchema,
  insertPhoneCallSchema: () => insertPhoneCallSchema,
  insertPhoneConfigHistorySchema: () => insertPhoneConfigHistorySchema,
  insertPhoneConfigurationSchema: () => insertPhoneConfigurationSchema,
  insertPhoneConsentSchema: () => insertPhoneConsentSchema,
  insertPhoneScriptSchema: () => insertPhoneScriptSchema,
  insertPromptVersionSchema: () => insertPromptVersionSchema,
  insertProspectEnProspectionSchema: () => insertProspectEnProspectionSchema,
  insertProspectEventSchema: () => insertProspectEventSchema,
  insertProspectSchema: () => insertProspectSchema,
  insertRdvPreparationSchema: () => insertRdvPreparationSchema,
  insertRdvSchema: () => insertRdvSchema,
  insertSalesObjectiveSchema: () => insertSalesObjectiveSchema,
  insertScenarioEtapeSchema: () => insertScenarioEtapeSchema,
  insertScenarioSchema: () => insertScenarioSchema,
  insertSupervisionLogSchema: () => insertSupervisionLogSchema,
  insertSystemConfigSchema: () => insertSystemConfigSchema,
  insertTeamMemberSchema: () => insertTeamMemberSchema,
  insertTeamSchema: () => insertTeamSchema,
  insertTypePrestationSchema: () => insertTypePrestationSchema,
  insertVariantMetricSchema: () => insertVariantMetricSchema,
  interactionsProspection: () => interactionsProspection,
  invitations: () => invitations,
  invitationsRelations: () => invitationsRelations,
  learningInsights: () => learningInsights,
  loginAttempts: () => loginAttempts,
  mediaFiles: () => mediaFiles,
  mediaFilesRelations: () => mediaFilesRelations,
  messageVariants: () => messageVariants2,
  messages: () => messages,
  messagesRelations: () => messagesRelations,
  notificationsTransfert: () => notificationsTransfert,
  notificationsTransfertRelations: () => notificationsTransfertRelations,
  objections: () => objections,
  opportunities: () => opportunities,
  opportunityActivities: () => opportunityActivities,
  opportunityExports: () => opportunityExports,
  opportunityNotes: () => opportunityNotes,
  opportunityPredictions: () => opportunityPredictions,
  opportunityScoringHistory: () => opportunityScoringHistory,
  organizationEntities: () => organizationEntities,
  pappersCache: () => pappersCache,
  passwordResetTokens: () => passwordResetTokens,
  patronContacts: () => patronContacts,
  phoneAnalyticsDaily: () => phoneAnalyticsDaily,
  phoneAnalyticsDailyRelations: () => phoneAnalyticsDailyRelations,
  phoneCalls: () => phoneCalls,
  phoneCallsRelations: () => phoneCallsRelations,
  phoneConfigHistory: () => phoneConfigHistory,
  phoneConfigHistoryRelations: () => phoneConfigHistoryRelations,
  phoneConfigurations: () => phoneConfigurations,
  phoneConfigurationsRelations: () => phoneConfigurationsRelations,
  phoneConsents: () => phoneConsents,
  phoneConsentsRelations: () => phoneConsentsRelations,
  phoneScripts: () => phoneScripts,
  phoneScriptsRelations: () => phoneScriptsRelations,
  promptVersions: () => promptVersions,
  prospectEvents: () => prospectEvents,
  prospectEventsRelations: () => prospectEventsRelations,
  prospects: () => prospects,
  prospectsEnProspection: () => prospectsEnProspection,
  prospectsRelations: () => prospectsRelations,
  rdvPreparations: () => rdvPreparations,
  rdvPreparationsRelations: () => rdvPreparationsRelations,
  rdvs: () => rdvs,
  rdvsRelations: () => rdvsRelations,
  salesObjectives: () => salesObjectives,
  scenarioEtapes: () => scenarioEtapes,
  scenarios: () => scenarios,
  sessions: () => sessions,
  supervisionLogs: () => supervisionLogs,
  systemConfig: () => systemConfig,
  teamMembers: () => teamMembers,
  teams: () => teams,
  typesPrestations: () => typesPrestations,
  updateGpsSystemConfigSchema: () => updateGpsSystemConfigSchema,
  upsertUserSchema: () => upsertUserSchema,
  users: () => users,
  usersRelations: () => usersRelations,
  variantMetrics: () => variantMetrics
});
import { sql as sql5 } from "drizzle-orm";
import { pgTable as pgTable5, text as text5, varchar as varchar5, timestamp as timestamp5, jsonb as jsonb4, index as index5, integer as integer5, decimal as decimal4, date as date4, uuid as uuid4, boolean as boolean5 } from "drizzle-orm/pg-core";
import { relations as relations3 } from "drizzle-orm";
import { createInsertSchema as createInsertSchema5 } from "drizzle-zod";
import { z as z3 } from "zod";
var entityTypeSchema, sessions, users, conversations, messages, passwordResetTokens, loginAttempts, invitations, organizationEntities, teams, teamMembers, auditLogs, appointments, mediaFiles, prospects, typesPrestations, actions, rdvs, notificationsTransfert, rdvPreparations, calls, callScripts, objections, callNotes, usersRelations, invitationsRelations, prospectsRelations, actionsRelations, rdvsRelations, notificationsTransfertRelations, rdvPreparationsRelations, conversationsRelations, messagesRelations, appointmentsRelations, mediaFilesRelations, callsRelations, callScriptsRelations, callNotesRelations, upsertUserSchema, insertConversationSchema, insertMessageSchema, insertPasswordResetTokenSchema, insertLoginAttemptSchema, insertInvitationSchema, insertAppointmentSchema, insertMediaFileSchema, insertProspectSchema, insertTypePrestationSchema, insertActionSchema, insertRdvSchema, insertNotificationTransfertSchema, insertRdvPreparationSchema, insertCallSchema, insertCallScriptSchema, insertObjectionSchema, insertCallNoteSchema, patronContacts, insertPatronContactSchema, scenarios, scenarioEtapes, campagnesProspection, prospectsEnProspection, messageVariants2, variantMetrics, interactionsProspection, blacklistProspection, learningInsights, promptVersions, companies, enrichmentLogs, companyRelationships, pappersCache, insertScenarioSchema, insertScenarioEtapeSchema, insertCampagneProspectionSchema, insertProspectEnProspectionSchema, insertInteractionProspectionSchema, insertBlacklistProspectionSchema, insertMessageVariantSchema, insertVariantMetricSchema, insertLearningInsightSchema, insertPromptVersionSchema, insertCompanySchema, insertEnrichmentLogSchema, insertCompanyRelationshipSchema, insertPappersCacheSchema, batchImports, batchImportProspects, insertBatchImportSchema, insertBatchImportProspectSchema, insertOrganizationEntitySchema, insertTeamSchema, insertTeamMemberSchema, insertAuditLogSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    init_schema_opportunities();
    init_schema_phoning();
    init_schema_gps();
    init_schema_opportunities();
    init_schema_competitor();
    entityTypeSchema = z3.enum(["france", "luxembourg", "belgique"]);
    sessions = pgTable5(
      "sessions",
      {
        sid: varchar5("sid").primaryKey(),
        sess: jsonb4("sess").notNull(),
        expire: timestamp5("expire").notNull()
      },
      (table) => [index5("IDX_session_expire").on(table.expire)]
    );
    users = pgTable5("users", {
      id: varchar5("id").primaryKey().default(sql5`gen_random_uuid()`),
      email: varchar5("email").unique().notNull(),
      password: text5("password").notNull(),
      firstName: varchar5("first_name"),
      lastName: varchar5("last_name"),
      profileImageUrl: varchar5("profile_image_url"),
      // ARCHITECTURE UNIFIÉE - Entité de rattachement
      entity: varchar5("entity", { length: 50 }).notNull().default("luxembourg"),
      // 'france', 'luxembourg', 'belgique'
      role: varchar5("role", { length: 50 }).notNull().default("business_developer"),
      // president, dg, responsable_developpement, chef_ventes, ic, business_developer, sdr, admin, admin_groupe, manager_france, manager_luxembourg
      poste: varchar5("poste", { length: 100 }),
      equipe: varchar5("equipe", { length: 100 }),
      managerId: varchar5("manager_id").references(() => users.id, { onDelete: "set null" }),
      agence: varchar5("agence", { length: 100 }),
      agencyLocation: varchar5("agency_location", { length: 50 }),
      // 'paris' | 'lyon' | 'marseille' | 'luxembourg' | etc. - Pour rotation numéros Twilio
      canalVente: varchar5("canal_vente", { length: 50 }),
      // visio (SDR) ou terrain (BD)
      objectifMensuelContrats: integer5("objectif_mensuel_contrats"),
      objectifMensuelMrr: decimal4("objectif_mensuel_mrr", { precision: 10, scale: 2 }),
      isActive: text5("is_active").notNull().default("true"),
      isAdmin: text5("is_admin").notNull().default("false"),
      // Kept for backward compatibility
      lastLoginAt: timestamp5("last_login_at"),
      // MODULE PHONING DYNAMIQUE - Statistiques commerciales
      phoningStats: jsonb4("phoning_stats").default(sql5`'{"total_calls": 0, "rdv_pris": 0, "taux_rdv": 0, "duree_moyenne_secondes": 0}'::jsonb`),
      createdAt: timestamp5("created_at").defaultNow(),
      updatedAt: timestamp5("updated_at").defaultNow()
    }, (table) => [
      index5("idx_users_entity").on(table.entity),
      index5("users_agency_location_idx").on(table.agencyLocation)
    ]);
    conversations = pgTable5("conversations", {
      id: varchar5("id").primaryKey().default(sql5`gen_random_uuid()`),
      userId: varchar5("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      // ARCHITECTURE UNIFIÉE - Entité de rattachement
      entity: varchar5("entity", { length: 50 }).notNull().default("luxembourg"),
      title: text5("title").notNull(),
      createdAt: timestamp5("created_at").notNull().defaultNow()
    }, (table) => [
      index5("idx_conversations_entity").on(table.entity)
    ]);
    messages = pgTable5("messages", {
      id: varchar5("id").primaryKey().default(sql5`gen_random_uuid()`),
      conversationId: varchar5("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
      userId: varchar5("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      // ARCHITECTURE UNIFIÉE - Entité de rattachement
      entity: varchar5("entity", { length: 50 }).notNull().default("luxembourg"),
      role: text5("role").notNull(),
      // 'user' or 'assistant'
      content: text5("content").notNull(),
      featureType: text5("feature_type"),
      // 'commercial', 'meeting', 'training', 'arguments'
      createdAt: timestamp5("created_at").notNull().defaultNow()
    }, (table) => [
      index5("idx_messages_entity").on(table.entity)
    ]);
    passwordResetTokens = pgTable5("password_reset_tokens", {
      id: varchar5("id").primaryKey().default(sql5`gen_random_uuid()`),
      userId: varchar5("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      token: varchar5("token").notNull().unique(),
      expiresAt: timestamp5("expires_at").notNull(),
      createdAt: timestamp5("created_at").notNull().defaultNow()
    });
    loginAttempts = pgTable5("login_attempts", {
      id: varchar5("id").primaryKey().default(sql5`gen_random_uuid()`),
      email: varchar5("email").notNull(),
      attemptedAt: timestamp5("attempted_at").notNull().defaultNow(),
      ipAddress: varchar5("ip_address")
    });
    invitations = pgTable5("invitations", {
      id: varchar5("id").primaryKey().default(sql5`gen_random_uuid()`),
      email: varchar5("email", { length: 255 }).notNull(),
      role: varchar5("role", { length: 50 }).notNull().default("commercial"),
      // admin, commercial
      token: varchar5("token", { length: 255 }).notNull().unique(),
      invitedBy: varchar5("invited_by").notNull().references(() => users.id, { onDelete: "cascade" }),
      status: varchar5("status", { length: 50 }).notNull().default("pending"),
      // pending, accepted, expired
      expiresAt: timestamp5("expires_at").notNull(),
      acceptedAt: timestamp5("accepted_at"),
      createdAt: timestamp5("created_at").notNull().defaultNow()
    }, (table) => [
      index5("idx_invitations_email").on(table.email),
      index5("idx_invitations_token").on(table.token),
      index5("idx_invitations_status").on(table.status)
    ]);
    organizationEntities = pgTable5("organization_entities", {
      id: uuid4("id").primaryKey().default(sql5`gen_random_uuid()`),
      entityCode: varchar5("entity_code", { length: 50 }).unique().notNull(),
      entityName: varchar5("entity_name", { length: 255 }).notNull(),
      entityNameFull: varchar5("entity_name_full", { length: 255 }),
      level: integer5("level").notNull(),
      // 0=Holding, 1=Filiale, 2=Sous-filiale
      parentEntityCode: varchar5("parent_entity_code", { length: 50 }),
      sortOrder: integer5("sort_order").default(0),
      countryCode: varchar5("country_code", { length: 2 }),
      countryName: varchar5("country_name", { length: 100 }),
      flagEmoji: varchar5("flag_emoji", { length: 10 }),
      logoUrl: varchar5("logo_url", { length: 500 }),
      primaryColor: varchar5("primary_color", { length: 7 }).default("#1E40AF"),
      secondaryColor: varchar5("secondary_color", { length: 7 }).default("#3B82F6"),
      legalName: varchar5("legal_name", { length: 255 }),
      siret: varchar5("siret", { length: 50 }),
      address: text5("address"),
      phone: varchar5("phone", { length: 50 }),
      email: varchar5("email", { length: 255 }),
      isActive: boolean5("is_active").default(true),
      canHaveUsers: boolean5("can_have_users").default(true),
      canHaveProspects: boolean5("can_have_prospects").default(true),
      createdAt: timestamp5("created_at").defaultNow(),
      updatedAt: timestamp5("updated_at").defaultNow(),
      updatedBy: uuid4("updated_by")
    }, (table) => [
      index5("idx_entities_code").on(table.entityCode),
      index5("idx_entities_level").on(table.level),
      index5("idx_entities_active").on(table.isActive)
    ]);
    teams = pgTable5("teams", {
      id: uuid4("id").primaryKey().default(sql5`gen_random_uuid()`),
      name: varchar5("name", { length: 255 }).notNull(),
      description: text5("description"),
      entity: varchar5("entity", { length: 50 }).notNull(),
      managerId: varchar5("manager_id").references(() => users.id, { onDelete: "set null" }),
      parentTeamId: uuid4("parent_team_id"),
      monthlyTargetCa: decimal4("monthly_target_ca", { precision: 15, scale: 2 }),
      monthlyTargetMeetings: integer5("monthly_target_meetings"),
      monthlyTargetSignatures: integer5("monthly_target_signatures"),
      isActive: boolean5("is_active").default(true),
      color: varchar5("color", { length: 7 }).default("#3B82F6"),
      createdAt: timestamp5("created_at").defaultNow(),
      updatedAt: timestamp5("updated_at").defaultNow(),
      createdBy: varchar5("created_by"),
      updatedBy: varchar5("updated_by")
    }, (table) => [
      index5("idx_teams_entity").on(table.entity),
      index5("idx_teams_manager").on(table.managerId),
      index5("idx_teams_active").on(table.isActive)
    ]);
    teamMembers = pgTable5("team_members", {
      id: uuid4("id").primaryKey().default(sql5`gen_random_uuid()`),
      teamId: uuid4("team_id").notNull(),
      userId: varchar5("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      role: varchar5("role", { length: 50 }).default("member"),
      joinedAt: timestamp5("joined_at").defaultNow(),
      leftAt: timestamp5("left_at")
    }, (table) => [
      index5("idx_team_members_team").on(table.teamId),
      index5("idx_team_members_user").on(table.userId)
    ]);
    auditLogs = pgTable5("audit_logs", {
      id: uuid4("id").primaryKey().default(sql5`gen_random_uuid()`),
      // ARCHITECTURE UNIFIÉE - Entité de rattachement pour RLS
      entity: varchar5("entity", { length: 50 }).notNull().default("luxembourg"),
      userId: varchar5("user_id").references(() => users.id, { onDelete: "set null" }),
      userEmail: varchar5("user_email", { length: 255 }),
      userName: varchar5("user_name", { length: 255 }),
      userRole: varchar5("user_role", { length: 50 }),
      action: varchar5("action", { length: 100 }).notNull(),
      entityType: varchar5("entity_type", { length: 100 }),
      entityId: uuid4("entity_id"),
      entityName: varchar5("entity_name", { length: 255 }),
      changes: jsonb4("changes"),
      oldValues: jsonb4("old_values"),
      newValues: jsonb4("new_values"),
      ipAddress: varchar5("ip_address", { length: 50 }),
      userAgent: text5("user_agent"),
      endpoint: varchar5("endpoint", { length: 500 }),
      method: varchar5("method", { length: 10 }),
      status: varchar5("status", { length: 20 }).default("success"),
      errorMessage: text5("error_message"),
      createdAt: timestamp5("created_at").defaultNow()
    }, (table) => [
      index5("idx_audit_entity_rls").on(table.entity),
      index5("idx_audit_user").on(table.userId, table.createdAt),
      index5("idx_audit_action").on(table.action, table.createdAt),
      index5("idx_audit_entity").on(table.entityType, table.entityId),
      index5("idx_audit_created").on(table.createdAt),
      index5("idx_audit_status").on(table.status)
    ]);
    appointments = pgTable5("appointments", {
      id: varchar5("id").primaryKey().default(sql5`gen_random_uuid()`),
      userId: varchar5("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      contactName: varchar5("contact_name").notNull(),
      contactEmail: varchar5("contact_email"),
      contactPhone: varchar5("contact_phone"),
      company: varchar5("company"),
      appointmentDate: timestamp5("appointment_date"),
      notes: text5("notes"),
      businessCardImageUrl: varchar5("business_card_image_url"),
      status: varchar5("status").notNull().default("pending"),
      // pending, confirmed, cancelled, completed
      createdAt: timestamp5("created_at").notNull().defaultNow(),
      updatedAt: timestamp5("updated_at").notNull().defaultNow()
    });
    mediaFiles = pgTable5("media_files", {
      id: varchar5("id").primaryKey().default(sql5`gen_random_uuid()`),
      userId: varchar5("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      type: varchar5("type").notNull(),
      // 'photo' or 'video'
      fileUrl: text5("file_url").notNull(),
      fileName: varchar5("file_name").notNull(),
      fileSize: varchar5("file_size"),
      mimeType: varchar5("mime_type"),
      purpose: varchar5("purpose"),
      // 'business_card', 'prospection', 'training', 'other'
      appointmentId: varchar5("appointment_id").references(() => appointments.id, { onDelete: "set null" }),
      createdAt: timestamp5("created_at").notNull().defaultNow()
    });
    prospects = pgTable5("prospects", {
      id: varchar5("id").primaryKey().default(sql5`gen_random_uuid()`),
      userId: varchar5("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      // ARCHITECTURE UNIFIÉE - Entité de rattachement (PAS DE DEFAULT - Admin Groupe doit choisir)
      entity: varchar5("entity", { length: 50 }).notNull(),
      // PHASE 2 SIREN/SIRET: Lien vers table companies
      companyId: varchar5("company_id").references(() => companies.id),
      legacySiret: varchar5("legacy_siret", { length: 14 }),
      // Conservation données existantes
      legacySiren: varchar5("legacy_siren", { length: 9 }),
      nom: varchar5("nom", { length: 255 }),
      // Nullable pour imports batch B2B (entreprise sans contact)
      prenom: varchar5("prenom", { length: 255 }),
      fonction: varchar5("fonction", { length: 255 }),
      // Fonction du contact (ex: Directeur, Responsable Achats)
      entreprise: varchar5("entreprise", { length: 255 }).notNull(),
      // Conservé pour compatibilité - devient l'enseigne par défaut
      // NOUVEAUX CHAMPS: Séparation enseigne commerciale / raison sociale juridique
      enseigneCommerciale: varchar5("enseigne_commerciale", { length: 255 }),
      // Nom visible (ex: "GRANDE PHARMACIE DE LA VERPILLIERE")
      raisonSociale: varchar5("raison_sociale", { length: 255 }),
      // Nom juridique Pappers (ex: "SARL PHARMACIE MARTIN")
      siret: varchar5("siret", { length: 14 }),
      // SIRET pour enrichissement Pappers
      email: varchar5("email", { length: 255 }),
      telephone: varchar5("telephone", { length: 50 }),
      adresse1: text5("adresse_1"),
      adresse2: text5("adresse_2"),
      ville: varchar5("ville", { length: 100 }),
      codePostal: varchar5("code_postal", { length: 20 }),
      pays: varchar5("pays", { length: 100 }).default("France"),
      // MODULE P3.5 - GÉOCODAGE BATCH - Coordonnées GPS pour détection proximité
      latitude: decimal4("latitude", { precision: 10, scale: 7 }),
      // Ex: 48.8566 (Paris)
      longitude: decimal4("longitude", { precision: 10, scale: 7 }),
      // Ex: 2.3522 (Paris)
      geocodedAt: timestamp5("geocoded_at"),
      // Date du géocodage
      geocodingSource: varchar5("geocoding_source", { length: 50 }),
      // 'pappers', 'nominatim', 'manual'
      secteur: varchar5("secteur", { length: 100 }),
      profilDisc: varchar5("profil_disc", { length: 50 }),
      statut: varchar5("statut", { length: 50 }).notNull().default("nouveau"),
      source: varchar5("source", { length: 100 }).notNull().default("carte_visite"),
      notes: text5("notes"),
      // ENRICHISSEMENT COMPLET PAPPERS (Phase 3 - Asynchrone)
      capitalSocial: varchar5("capital_social", { length: 100 }),
      formeJuridique: varchar5("forme_juridique", { length: 100 }),
      dateCreationEntreprise: date4("date_creation_entreprise"),
      effectifEntreprise: varchar5("effectif_entreprise", { length: 50 }),
      chiffreAffaires: decimal4("chiffre_affaires", { precision: 15, scale: 2 }),
      dirigeantPrincipal: varchar5("dirigeant_principal", { length: 255 }),
      nombreEtablissements: integer5("nombre_etablissements"),
      statutEntreprise: varchar5("statut_entreprise", { length: 50 }),
      isFullyEnriched: text5("is_fully_enriched").default("false"),
      enrichedAt: timestamp5("enriched_at"),
      pappersRawData: jsonb4("pappers_raw_data"),
      // MODULE PHONING DYNAMIQUE - Stats appels
      lastCallDate: timestamp5("last_call_date"),
      lastCallResult: varchar5("last_call_result", { length: 50 }),
      totalCallsCount: integer5("total_calls_count").default(0),
      rdvConversionRate: decimal4("rdv_conversion_rate", { precision: 5, scale: 2 }),
      // MODULE PROSPECTS À QUALIFIER - Qualification workflow
      qualificationNeeded: text5("qualification_needed").default("false"),
      // boolean stocké en text (convention existante)
      qualifiedAt: timestamp5("qualified_at"),
      qualifiedBy: varchar5("qualified_by").references(() => users.id, { onDelete: "set null" }),
      // MODULE P3.3 - AUTO-ENRICHISSEMENT NOCTURNE
      dataQualityScore: integer5("data_quality_score").default(0),
      // Score 0-100 basé sur complétude données
      lastEnrichmentDate: timestamp5("last_enrichment_date"),
      // Date du dernier enrichissement réussi
      enrichmentStatus: varchar5("enrichment_status", { length: 20 }).default("pending"),
      // pending, enriched, failed
      createdAt: timestamp5("created_at").notNull().defaultNow(),
      updatedAt: timestamp5("updated_at").notNull().defaultNow()
    }, (table) => [
      index5("idx_prospects_user_id").on(table.userId),
      index5("idx_prospects_company_id").on(table.companyId),
      // PHASE 2
      index5("idx_prospects_entity").on(table.entity),
      // ARCHITECTURE UNIFIÉE
      index5("idx_prospects_entity_created").on(table.entity, table.createdAt),
      // ARCHITECTURE UNIFIÉE - Performance requêtes liste
      index5("idx_prospects_enrichment_status").on(table.enrichmentStatus, table.lastEnrichmentDate),
      // P3.3 - Performance CRON
      index5("idx_prospects_quality_score").on(table.dataQualityScore),
      // P3.3 - Tri par qualité
      index5("idx_prospects_geocoded").on(table.latitude, table.longitude)
      // P3.5 - Performance détection proximité GPS
    ]);
    typesPrestations = pgTable5("types_prestations", {
      id: varchar5("id").primaryKey().default(sql5`gen_random_uuid()`),
      nom: varchar5("nom", { length: 255 }).notNull().unique(),
      description: text5("description"),
      icone: varchar5("icone", { length: 10 }),
      tarifMensuelMin: decimal4("tarif_mensuel_min", { precision: 10, scale: 2 }),
      tarifMensuelMax: decimal4("tarif_mensuel_max", { precision: 10, scale: 2 }),
      createdAt: timestamp5("created_at").notNull().defaultNow()
    });
    actions = pgTable5("actions", {
      id: varchar5("id").primaryKey().default(sql5`gen_random_uuid()`),
      userId: varchar5("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      prospectId: varchar5("prospect_id").references(() => prospects.id, { onDelete: "cascade" }),
      opportunityId: varchar5("opportunity_id").references(() => opportunities.id, { onDelete: "set null" }),
      // ARCHITECTURE UNIFIÉE - Entité de rattachement
      entity: varchar5("entity", { length: 50 }).notNull().default("luxembourg"),
      type: varchar5("type", { length: 50 }).notNull(),
      titre: varchar5("titre", { length: 255 }).notNull(),
      description: text5("description"),
      datePrevue: timestamp5("date_prevue").notNull(),
      statut: varchar5("statut", { length: 50 }).notNull().default("a_faire"),
      priorite: varchar5("priorite", { length: 20 }).notNull().default("normale"),
      resultat: text5("resultat"),
      createdAt: timestamp5("created_at").notNull().defaultNow(),
      completedAt: timestamp5("completed_at")
    }, (table) => [
      index5("idx_actions_user_id").on(table.userId),
      index5("idx_actions_date").on(table.datePrevue),
      index5("idx_actions_entity").on(table.entity)
      // ARCHITECTURE UNIFIÉE
    ]);
    rdvs = pgTable5("rdvs", {
      id: varchar5("id").primaryKey().default(sql5`gen_random_uuid()`),
      userId: varchar5("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      prospectId: varchar5("prospect_id").references(() => prospects.id, { onDelete: "cascade" }),
      opportunityId: varchar5("opportunity_id").references(() => opportunities.id, { onDelete: "set null" }),
      // ARCHITECTURE UNIFIÉE - Entité de rattachement
      entity: varchar5("entity", { length: 50 }).notNull().default("luxembourg"),
      titre: varchar5("titre", { length: 255 }).notNull(),
      type: varchar5("type", { length: 50 }),
      dateRdv: timestamp5("date_rdv").notNull(),
      lieu: varchar5("lieu", { length: 255 }),
      objectif: text5("objectif"),
      dossierPreparation: jsonb4("dossier_preparation"),
      pdfPath: varchar5("pdf_path", { length: 500 }),
      pdfUrl: varchar5("pdf_url", { length: 500 }),
      pdfGeneratedAt: timestamp5("pdf_generated_at"),
      icalPath: varchar5("ical_path", { length: 500 }),
      compteRendu: text5("compte_rendu"),
      prochainesEtapes: text5("prochaines_etapes"),
      statut: varchar5("statut", { length: 50 }).notNull().default("planifie"),
      createdAt: timestamp5("created_at").notNull().defaultNow()
    }, (table) => [
      index5("idx_rdvs_user_id").on(table.userId),
      index5("idx_rdvs_date").on(table.dateRdv),
      index5("idx_rdvs_entity").on(table.entity)
      // ARCHITECTURE UNIFIÉE
    ]);
    notificationsTransfert = pgTable5("notifications_transfert", {
      id: varchar5("id").primaryKey().default(sql5`gen_random_uuid()`),
      opportunityId: varchar5("opportunity_id").references(() => opportunities.id, { onDelete: "cascade" }),
      sdrId: varchar5("sdr_id").references(() => users.id, { onDelete: "cascade" }),
      repreneurId: varchar5("repreneur_id").references(() => users.id, { onDelete: "cascade" }),
      // ARCHITECTURE UNIFIÉE - Entité de rattachement
      entity: varchar5("entity", { length: 50 }).notNull().default("luxembourg"),
      type: varchar5("type", { length: 50 }).notNull(),
      // 'demande_envoyee', 'accepte', 'refuse', 'signe'
      message: text5("message"),
      lu: text5("lu").default("false"),
      // boolean stocké en text
      createdAt: timestamp5("created_at").notNull().defaultNow()
    }, (table) => [
      index5("idx_notif_sdr").on(table.sdrId, table.lu),
      index5("idx_notif_repreneur").on(table.repreneurId, table.lu),
      index5("idx_notif_entity").on(table.entity)
      // ARCHITECTURE UNIFIÉE
    ]);
    rdvPreparations = pgTable5("rdv_preparations", {
      id: varchar5("id").primaryKey().default(sql5`gen_random_uuid()`),
      rdvId: varchar5("rdv_id").notNull().references(() => rdvs.id, { onDelete: "cascade" }),
      userId: varchar5("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      // ARCHITECTURE UNIFIÉE - Entité de rattachement
      entity: varchar5("entity", { length: 50 }).notNull().default("luxembourg"),
      statut: varchar5("statut", { length: 50 }).notNull().default("en_cours"),
      // en_cours, complete, erreur
      donnesPappers: jsonb4("donnees_pappers"),
      donnesBraveSearch: jsonb4("donnees_brave_search"),
      analyseDisc: jsonb4("analyse_disc"),
      pdfPath: varchar5("pdf_path", { length: 500 }),
      pdfUrl: varchar5("pdf_url", { length: 500 }),
      erreurPappers: text5("erreur_pappers"),
      erreurBraveSearch: text5("erreur_brave_search"),
      erreurClaudeDisc: text5("erreur_claude_disc"),
      erreurPdfGeneration: text5("erreur_pdf_generation"),
      dureeTotale: integer5("duree_totale"),
      // en millisecondes
      createdAt: timestamp5("created_at").notNull().defaultNow(),
      completedAt: timestamp5("completed_at")
    }, (table) => [
      index5("idx_rdv_prep_rdv_id").on(table.rdvId),
      index5("idx_rdv_prep_user_id").on(table.userId),
      index5("idx_rdv_prep_statut").on(table.statut),
      index5("idx_rdv_prep_entity").on(table.entity)
      // ARCHITECTURE UNIFIÉE
    ]);
    calls = pgTable5("calls", {
      id: varchar5("id").primaryKey().default(sql5`gen_random_uuid()`),
      prospectId: varchar5("prospect_id").notNull().references(() => prospects.id, { onDelete: "cascade" }),
      userId: varchar5("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      // ARCHITECTURE UNIFIÉE - Entité de rattachement
      entity: varchar5("entity", { length: 50 }).notNull().default("luxembourg"),
      // Timing
      startedAt: timestamp5("started_at").notNull().defaultNow(),
      endedAt: timestamp5("ended_at"),
      durationSeconds: integer5("duration_seconds"),
      // Résultat appel
      result: varchar5("result", { length: 50 }).notNull(),
      // 'rdv_pris', 'rappel_planifie', 'refus', 'pas_joignable'
      rdvDate: timestamp5("rdv_date"),
      rappelDate: timestamp5("rappel_date"),
      rappelRaison: text5("rappel_raison"),
      // Données appel
      scriptId: varchar5("script_id"),
      notes: text5("notes"),
      tags: varchar5("tags", { length: 50 }).array(),
      // Objections
      objectionsCount: integer5("objections_count").default(0),
      objectionsTraitees: jsonb4("objections_traitees"),
      // Résumé IA (généré post-appel)
      summaryAi: jsonb4("summary_ai"),
      probabiliteClosing: integer5("probabilite_closing"),
      // ============ OPTION 3 (Colonnes préparées, NULL pour Option 2) ============
      audioFilePath: varchar5("audio_file_path", { length: 500 }),
      transcriptionText: text5("transcription_text"),
      sentimentScore: decimal4("sentiment_score", { precision: 3, scale: 2 }),
      qualityScoreAi: integer5("quality_score_ai"),
      createdAt: timestamp5("created_at").notNull().defaultNow(),
      updatedAt: timestamp5("updated_at").notNull().defaultNow()
    }, (table) => [
      index5("idx_calls_prospect").on(table.prospectId),
      index5("idx_calls_user").on(table.userId),
      index5("idx_calls_result").on(table.result),
      index5("idx_calls_started_at").on(table.startedAt),
      index5("idx_calls_entity").on(table.entity)
      // ARCHITECTURE UNIFIÉE
    ]);
    callScripts = pgTable5("call_scripts", {
      id: varchar5("id").primaryKey().default(sql5`gen_random_uuid()`),
      prospectId: varchar5("prospect_id").notNull().references(() => prospects.id, { onDelete: "cascade" }),
      generatedByUserId: varchar5("generated_by_user_id").references(() => users.id),
      // ARCHITECTURE UNIFIÉE - Entité de rattachement
      entity: varchar5("entity", { length: 50 }).notNull().default("luxembourg"),
      // Contenu script (JSON structuré)
      scriptContent: jsonb4("script_content").notNull(),
      discProfileUsed: jsonb4("disc_profile_used"),
      secteur: varchar5("secteur", { length: 100 }),
      generationSource: varchar5("generation_source", { length: 50 }),
      // 'ai_generated' | 'template' | 'manual'
      // Usage
      usedInCallId: varchar5("used_in_call_id"),
      isTemplate: text5("is_template").default("false"),
      templateName: varchar5("template_name", { length: 200 }),
      createdAt: timestamp5("created_at").notNull().defaultNow(),
      expiresAt: timestamp5("expires_at").default(sql5`NOW() + INTERVAL '1 hour'`)
    }, (table) => [
      index5("idx_scripts_prospect").on(table.prospectId),
      index5("idx_scripts_entity").on(table.entity)
      // ARCHITECTURE UNIFIÉE
    ]);
    objections = pgTable5("objections", {
      id: varchar5("id").primaryKey().default(sql5`gen_random_uuid()`),
      objectionText: varchar5("objection_text", { length: 500 }).notNull().unique(),
      objectionCategory: varchar5("objection_category", { length: 100 }),
      // 'prix', 'concurrence', 'timing', 'conviction', 'autre'
      // Statistiques usage
      timesEncountered: integer5("times_encountered").default(0),
      timesSuccessfullyHandled: integer5("times_successfully_handled").default(0),
      // Réponses types
      defaultResponses: jsonb4("default_responses"),
      createdAt: timestamp5("created_at").notNull().defaultNow(),
      updatedAt: timestamp5("updated_at").notNull().defaultNow()
    }, (table) => [
      index5("idx_objections_category").on(table.objectionCategory)
    ]);
    callNotes = pgTable5("call_notes", {
      id: varchar5("id").primaryKey().default(sql5`gen_random_uuid()`),
      callId: varchar5("call_id").notNull().references(() => calls.id, { onDelete: "cascade" }),
      noteText: text5("note_text").notNull(),
      noteTimestamp: timestamp5("note_timestamp").notNull().defaultNow(),
      noteType: varchar5("note_type", { length: 50 }),
      // 'general', 'objection', 'insight', 'action'
      createdAt: timestamp5("created_at").notNull().defaultNow()
    }, (table) => [
      index5("idx_notes_call").on(table.callId)
    ]);
    usersRelations = relations3(users, ({ many }) => ({
      conversations: many(conversations),
      messages: many(messages),
      appointments: many(appointments),
      mediaFiles: many(mediaFiles),
      prospects: many(prospects),
      actions: many(actions),
      rdvs: many(rdvs),
      invitations: many(invitations),
      notificationsTransfertSdr: many(notificationsTransfert, { relationName: "sdr" }),
      notificationsTransfertRepreneur: many(notificationsTransfert, { relationName: "repreneur" }),
      calls: many(calls),
      callScripts: many(callScripts)
    }));
    invitationsRelations = relations3(invitations, ({ one }) => ({
      invitedByUser: one(users, {
        fields: [invitations.invitedBy],
        references: [users.id]
      })
    }));
    prospectsRelations = relations3(prospects, ({ one, many }) => ({
      user: one(users, {
        fields: [prospects.userId],
        references: [users.id]
      }),
      actions: many(actions),
      rdvs: many(rdvs),
      calls: many(calls),
      callScripts: many(callScripts)
    }));
    actionsRelations = relations3(actions, ({ one }) => ({
      user: one(users, {
        fields: [actions.userId],
        references: [users.id]
      }),
      prospect: one(prospects, {
        fields: [actions.prospectId],
        references: [prospects.id]
      })
    }));
    rdvsRelations = relations3(rdvs, ({ one }) => ({
      user: one(users, {
        fields: [rdvs.userId],
        references: [users.id]
      }),
      prospect: one(prospects, {
        fields: [rdvs.prospectId],
        references: [prospects.id]
      })
    }));
    notificationsTransfertRelations = relations3(notificationsTransfert, ({ one }) => ({
      sdr: one(users, {
        fields: [notificationsTransfert.sdrId],
        references: [users.id],
        relationName: "sdr"
      }),
      repreneur: one(users, {
        fields: [notificationsTransfert.repreneurId],
        references: [users.id],
        relationName: "repreneur"
      })
    }));
    rdvPreparationsRelations = relations3(rdvPreparations, ({ one }) => ({
      rdv: one(rdvs, {
        fields: [rdvPreparations.rdvId],
        references: [rdvs.id]
      }),
      user: one(users, {
        fields: [rdvPreparations.userId],
        references: [users.id]
      })
    }));
    conversationsRelations = relations3(conversations, ({ one, many }) => ({
      user: one(users, {
        fields: [conversations.userId],
        references: [users.id]
      }),
      messages: many(messages)
    }));
    messagesRelations = relations3(messages, ({ one }) => ({
      conversation: one(conversations, {
        fields: [messages.conversationId],
        references: [conversations.id]
      }),
      user: one(users, {
        fields: [messages.userId],
        references: [users.id]
      })
    }));
    appointmentsRelations = relations3(appointments, ({ one, many }) => ({
      user: one(users, {
        fields: [appointments.userId],
        references: [users.id]
      }),
      mediaFiles: many(mediaFiles)
    }));
    mediaFilesRelations = relations3(mediaFiles, ({ one }) => ({
      user: one(users, {
        fields: [mediaFiles.userId],
        references: [users.id]
      }),
      appointment: one(appointments, {
        fields: [mediaFiles.appointmentId],
        references: [appointments.id]
      })
    }));
    callsRelations = relations3(calls, ({ one, many }) => ({
      prospect: one(prospects, {
        fields: [calls.prospectId],
        references: [prospects.id]
      }),
      user: one(users, {
        fields: [calls.userId],
        references: [users.id]
      }),
      script: one(callScripts, {
        fields: [calls.scriptId],
        references: [callScripts.id]
      }),
      notes: many(callNotes)
    }));
    callScriptsRelations = relations3(callScripts, ({ one }) => ({
      prospect: one(prospects, {
        fields: [callScripts.prospectId],
        references: [prospects.id]
      }),
      generatedByUser: one(users, {
        fields: [callScripts.generatedByUserId],
        references: [users.id]
      }),
      usedInCall: one(calls, {
        fields: [callScripts.usedInCallId],
        references: [calls.id]
      })
    }));
    callNotesRelations = relations3(callNotes, ({ one }) => ({
      call: one(calls, {
        fields: [callNotes.callId],
        references: [calls.id]
      })
    }));
    upsertUserSchema = createInsertSchema5(users);
    insertConversationSchema = createInsertSchema5(conversations).omit({
      id: true,
      createdAt: true
    });
    insertMessageSchema = createInsertSchema5(messages).omit({
      id: true,
      createdAt: true
    });
    insertPasswordResetTokenSchema = createInsertSchema5(passwordResetTokens).omit({
      id: true,
      createdAt: true
    });
    insertLoginAttemptSchema = createInsertSchema5(loginAttempts).omit({
      id: true,
      attemptedAt: true
    });
    insertInvitationSchema = createInsertSchema5(invitations).omit({
      id: true,
      createdAt: true
    });
    insertAppointmentSchema = createInsertSchema5(appointments).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertMediaFileSchema = createInsertSchema5(mediaFiles).omit({
      id: true,
      createdAt: true
    });
    insertProspectSchema = createInsertSchema5(prospects).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertTypePrestationSchema = createInsertSchema5(typesPrestations).omit({
      id: true,
      createdAt: true
    });
    insertActionSchema = createInsertSchema5(actions).omit({
      id: true,
      createdAt: true
    });
    insertRdvSchema = createInsertSchema5(rdvs).omit({
      id: true,
      createdAt: true
    });
    insertNotificationTransfertSchema = createInsertSchema5(notificationsTransfert).omit({
      id: true,
      createdAt: true
    });
    insertRdvPreparationSchema = createInsertSchema5(rdvPreparations).omit({
      id: true,
      createdAt: true
    });
    insertCallSchema = createInsertSchema5(calls).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertCallScriptSchema = createInsertSchema5(callScripts).omit({
      id: true,
      createdAt: true
    });
    insertObjectionSchema = createInsertSchema5(objections).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertCallNoteSchema = createInsertSchema5(callNotes).omit({
      id: true,
      createdAt: true
    });
    patronContacts = pgTable5("patron_contacts", {
      id: varchar5("id").primaryKey().default(sql5`gen_random_uuid()`),
      userId: varchar5("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      // Données entreprise (source Pappers)
      siret: varchar5("siret", { length: 14 }).notNull(),
      // Clé de déduplication
      raisonSociale: varchar5("raison_sociale", { length: 255 }).notNull(),
      enseigneCommerciale: varchar5("enseigne_commerciale", { length: 255 }),
      secteur: varchar5("secteur", { length: 100 }),
      ville: varchar5("ville", { length: 100 }),
      codePostal: varchar5("code_postal", { length: 20 }),
      // Données dirigeant principal
      dirigeantNom: varchar5("dirigeant_nom", { length: 100 }),
      dirigeantPrenom: varchar5("dirigeant_prenom", { length: 100 }),
      dirigeantFonction: varchar5("dirigeant_fonction", { length: 100 }),
      // Président, Gérant, etc.
      dirigeantPhotoUrl: text5("dirigeant_photo_url"),
      // Si disponible via Pappers
      // Coordonnées (quand disponibles)
      email: varchar5("email", { length: 255 }),
      telephone: varchar5("telephone", { length: 50 }),
      siteWeb: varchar5("site_web", { length: 255 }),
      // Métadonnées recherche
      searchMode: varchar5("search_mode", { length: 20 }).notNull(),
      // 'nom' ou 'siret'
      searchQuery: text5("search_query"),
      // Requête utilisateur originale
      addedToCrm: text5("added_to_crm").notNull().default("false"),
      // Si ajouté aux prospects
      crmProspectId: varchar5("crm_prospect_id").references(() => prospects.id, { onDelete: "set null" }),
      // WILDIX PHASE 3 - Champs préparatoires (NULL en V2)
      wildixEnabled: text5("wildix_enabled").default("false"),
      // Activation intégration téléphonie
      wildixCallId: varchar5("wildix_call_id", { length: 100 }),
      // ID appel WILDIX si clic-to-call
      callContext: jsonb4("call_context"),
      // Contexte appel pour popup automatique
      lastCallTimestamp: timestamp5("last_call_timestamp"),
      callRecordingUrl: text5("call_recording_url"),
      // URL enregistrement appel
      callTranscript: text5("call_transcript"),
      // Transcription texte appel
      // Raw data Pappers
      pappersRawData: jsonb4("pappers_raw_data"),
      // Données complètes API Pappers
      createdAt: timestamp5("created_at").notNull().defaultNow(),
      updatedAt: timestamp5("updated_at").notNull().defaultNow()
    }, (table) => [
      index5("idx_patron_contacts_user_id").on(table.userId),
      index5("idx_patron_contacts_siret").on(table.siret)
    ]);
    insertPatronContactSchema = createInsertSchema5(patronContacts).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    scenarios = pgTable5("scenarios", {
      id: varchar5("id").primaryKey().default(sql5`gen_random_uuid()`),
      // ARCHITECTURE UNIFIÉE - Entité de rattachement
      entity: varchar5("entity", { length: 50 }).notNull().default("luxembourg"),
      nom: varchar5("nom", { length: 255 }).notNull(),
      description: text5("description"),
      dureeJours: integer5("duree_jours").notNull(),
      // Durée totale du scénario
      nombreEtapes: integer5("nombre_etapes").notNull(),
      typeCible: varchar5("type_cible", { length: 100 }),
      // c-level, middle-management, bdr
      tauxSuccesAttendu: decimal4("taux_succes_attendu", { precision: 5, scale: 2 }),
      // Ex: 0.35 = 35%
      isActive: text5("is_active").notNull().default("true"),
      createdAt: timestamp5("created_at").notNull().defaultNow(),
      updatedAt: timestamp5("updated_at").notNull().defaultNow()
    }, (table) => [
      index5("idx_scenarios_entity").on(table.entity)
      // ARCHITECTURE UNIFIÉE
    ]);
    scenarioEtapes = pgTable5("scenario_etapes", {
      id: varchar5("id").primaryKey().default(sql5`gen_random_uuid()`),
      scenarioId: varchar5("scenario_id").notNull().references(() => scenarios.id, { onDelete: "cascade" }),
      // ARCHITECTURE UNIFIÉE - Entité de rattachement
      entity: varchar5("entity", { length: 50 }).notNull().default("luxembourg"),
      ordre: integer5("ordre").notNull(),
      // 1, 2, 3...
      delaiJours: integer5("delai_jours").notNull(),
      // Délai depuis étape précédente
      canal: varchar5("canal", { length: 50 }).notNull(),
      // linkedin_connect, linkedin_message, email, sms
      objectif: text5("objectif"),
      // Ex: "Établir contact initial"
      templatePrompt: text5("template_prompt"),
      // Prompt pour génération IA
      longueurCible: varchar5("longueur_cible", { length: 50 }),
      // court, moyen, long
      ctaSuggere: text5("cta_suggere"),
      // Call-to-action suggéré
      createdAt: timestamp5("created_at").notNull().defaultNow()
    }, (table) => [
      index5("idx_scenario_etapes_scenario_id").on(table.scenarioId),
      index5("idx_scenario_etapes_entity").on(table.entity)
      // ARCHITECTURE UNIFIÉE
    ]);
    campagnesProspection = pgTable5("campagnes_prospection", {
      id: varchar5("id").primaryKey().default(sql5`gen_random_uuid()`),
      userId: varchar5("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      // ARCHITECTURE UNIFIÉE - Entité de rattachement
      entity: varchar5("entity", { length: 50 }).notNull().default("luxembourg"),
      nom: varchar5("nom", { length: 255 }).notNull(),
      scenarioId: varchar5("scenario_id").notNull().references(() => scenarios.id),
      statut: varchar5("statut", { length: 50 }).notNull().default("active"),
      // active, paused, completed
      objectif: varchar5("objectif", { length: 100 }),
      // rdv, qualification, nurturing
      dateDebut: timestamp5("date_debut").defaultNow(),
      dateFin: timestamp5("date_fin"),
      // Configuration timing
      joursEnvoi: text5("jours_envoi").array().default(sql5`ARRAY['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi']::text[]`),
      // Jours actifs
      heuresEnvoi: jsonb4("heures_envoi").default(sql5`'{"debut": "09:00", "fin": "18:00"}'::jsonb`),
      // Plage horaire
      timezone: varchar5("timezone", { length: 50 }).default("Europe/Paris"),
      // Stats (mises à jour en temps réel)
      stats: jsonb4("stats").default(sql5`'{"contactes": 0, "acceptes": 0, "reponses": 0, "rdv": 0}'::jsonb`),
      createdAt: timestamp5("created_at").notNull().defaultNow(),
      updatedAt: timestamp5("updated_at").notNull().defaultNow()
    }, (table) => [
      index5("idx_campagnes_user_id").on(table.userId),
      index5("idx_campagnes_statut").on(table.statut),
      index5("idx_campagnes_entity").on(table.entity)
      // ARCHITECTURE UNIFIÉE
    ]);
    prospectsEnProspection = pgTable5("prospects_en_prospection", {
      id: varchar5("id").primaryKey().default(sql5`gen_random_uuid()`),
      campagneId: varchar5("campagne_id").notNull().references(() => campagnesProspection.id, { onDelete: "cascade" }),
      prospectId: varchar5("prospect_id").notNull().references(() => prospects.id, { onDelete: "cascade" }),
      // ARCHITECTURE UNIFIÉE - Entité de rattachement
      entity: varchar5("entity", { length: 50 }).notNull().default("luxembourg"),
      statut: varchar5("statut", { length: 50 }).notNull().default("active"),
      // active, paused, completed, opted_out
      etapeActuelle: integer5("etape_actuelle").notNull().default(0),
      // Ordre de l'étape actuelle
      prochaineActionDate: timestamp5("prochaine_action_date"),
      // Date programmée pour prochaine action
      scoreEngagement: integer5("score_engagement").default(0),
      // 0-100, calculé selon interactions
      // Données générées pour personnalisation
      messagesGeneres: jsonb4("messages_generes").default(sql5`'{}'::jsonb`),
      // Cache messages générés par étape
      contextRecherche: jsonb4("context_recherche").default(sql5`'{}'::jsonb`),
      // Données enrichissement (LinkedIn, Pappers, etc.)
      // Historique interactions (array)
      interactions: jsonb4("interactions").default(sql5`'[]'::jsonb`),
      // Log simplifié des interactions
      createdAt: timestamp5("created_at").notNull().defaultNow(),
      updatedAt: timestamp5("updated_at").notNull().defaultNow()
    }, (table) => [
      index5("idx_prospects_prospection_campagne_id").on(table.campagneId),
      index5("idx_prospects_prospection_prospect_id").on(table.prospectId),
      index5("idx_prospects_prospection_prochaine_action").on(table.prochaineActionDate),
      index5("idx_prospects_prospection_entity").on(table.entity)
      // ARCHITECTURE UNIFIÉE
    ]);
    messageVariants2 = pgTable5("message_variants", {
      id: varchar5("id").primaryKey().default(sql5`gen_random_uuid()`),
      campagneId: varchar5("campagne_id").notNull().references(() => campagnesProspection.id, { onDelete: "cascade" }),
      etapeId: varchar5("etape_id").notNull().references(() => scenarioEtapes.id, { onDelete: "cascade" }),
      // ARCHITECTURE UNIFIÉE - Entité de rattachement
      entity: varchar5("entity", { length: 50 }).notNull().default("luxembourg"),
      canal: varchar5("canal", { length: 50 }).notNull(),
      // linkedin_connect, linkedin_message, email, sms
      variantName: varchar5("variant_name", { length: 10 }).notNull(),
      // "A", "B", "C", etc.
      messageTemplate: text5("message_template").notNull(),
      // Template du message avec variables {{prenom}}, {{entreprise}}, etc.
      sujetEmail: varchar5("sujet_email", { length: 255 }),
      // Sujet pour emails (nullable car pas utilisé pour LinkedIn/SMS)
      isActive: text5("is_active").notNull().default("true"),
      // Active ou désactivée
      createdAt: timestamp5("created_at").notNull().defaultNow(),
      updatedAt: timestamp5("updated_at").notNull().defaultNow()
    }, (table) => [
      index5("idx_variants_campagne_id").on(table.campagneId),
      index5("idx_variants_etape_id").on(table.etapeId),
      index5("idx_variants_active").on(table.isActive),
      index5("idx_variants_entity").on(table.entity)
      // ARCHITECTURE UNIFIÉE
    ]);
    variantMetrics = pgTable5("variant_metrics", {
      id: varchar5("id").primaryKey().default(sql5`gen_random_uuid()`),
      variantId: varchar5("variant_id").notNull().references(() => messageVariants2.id, { onDelete: "cascade" }),
      sent: integer5("sent").notNull().default(0),
      opened: integer5("opened").notNull().default(0),
      clicked: integer5("clicked").notNull().default(0),
      replied: integer5("replied").notNull().default(0),
      accepted: integer5("accepted").notNull().default(0),
      rejected: integer5("rejected").notNull().default(0),
      bounced: integer5("bounced").notNull().default(0),
      updatedAt: timestamp5("updated_at").notNull().defaultNow()
    }, (table) => [
      index5("idx_metrics_variant_id").on(table.variantId)
    ]);
    interactionsProspection = pgTable5("interactions_prospection", {
      id: varchar5("id").primaryKey().default(sql5`gen_random_uuid()`),
      prospectEnProspectionId: varchar5("prospect_en_prospection_id").notNull().references(() => prospectsEnProspection.id, { onDelete: "cascade" }),
      etapeId: varchar5("etape_id").references(() => scenarioEtapes.id),
      variantId: varchar5("variant_id").references(() => messageVariants2.id, { onDelete: "set null" }),
      // A/B Testing: quel variant utilisé
      canal: varchar5("canal", { length: 50 }).notNull(),
      // linkedin_connect, linkedin_message, email, sms
      typeInteraction: varchar5("type_interaction", { length: 50 }).notNull(),
      // sent, opened, clicked, replied, bounced, accepted, rejected
      messageEnvoye: text5("message_envoye"),
      reponseRecue: text5("reponse_recue"),
      metadata: jsonb4("metadata").default(sql5`'{}'::jsonb`),
      // Données complémentaires (URL cliquée, sujet email, etc.)
      createdAt: timestamp5("created_at").notNull().defaultNow()
    }, (table) => [
      index5("idx_interactions_prospect_prospection_id").on(table.prospectEnProspectionId),
      index5("idx_interactions_variant_id").on(table.variantId)
    ]);
    blacklistProspection = pgTable5("blacklist_prospection", {
      id: varchar5("id").primaryKey().default(sql5`gen_random_uuid()`),
      email: varchar5("email", { length: 255 }).unique().notNull(),
      telephone: varchar5("telephone", { length: 50 }),
      raison: varchar5("raison", { length: 100 }).notNull(),
      // opt_out, bounce, spam_complaint, manual
      source: varchar5("source", { length: 100 }),
      // campagne_id ou 'manual'
      createdAt: timestamp5("created_at").notNull().defaultNow()
    }, (table) => [
      index5("idx_blacklist_email").on(table.email)
    ]);
    learningInsights = pgTable5("learning_insights", {
      id: varchar5("id").primaryKey().default(sql5`gen_random_uuid()`),
      type: varchar5("type", { length: 100 }).notNull(),
      // 'message_pattern', 'objection_response', 'sector_insight'
      // Pattern détecté
      pattern: text5("pattern").notNull(),
      description: text5("description"),
      // Métriques de performance
      successRate: decimal4("success_rate", { precision: 5, scale: 2 }).notNull(),
      sampleSize: integer5("sample_size").notNull(),
      // Contexte
      sector: varchar5("sector", { length: 100 }),
      discProfile: varchar5("disc_profile", { length: 10 }),
      canal: varchar5("canal", { length: 50 }),
      // Statut
      validated: text5("validated").notNull().default("false"),
      appliedToPrompts: text5("applied_to_prompts").notNull().default("false"),
      // Dates
      detectedAt: timestamp5("detected_at").notNull().defaultNow(),
      validatedAt: timestamp5("validated_at"),
      // Métadonnées
      metadata: jsonb4("metadata").default(sql5`'{}'::jsonb`)
    }, (table) => [
      index5("idx_learning_insights_type").on(table.type),
      index5("idx_learning_insights_validated").on(table.validated)
    ]);
    promptVersions = pgTable5("prompt_versions", {
      id: varchar5("id").primaryKey().default(sql5`gen_random_uuid()`),
      promptType: varchar5("prompt_type", { length: 100 }).notNull(),
      // 'message_generation', 'objection_handling', etc.
      version: integer5("version").notNull(),
      content: text5("content").notNull(),
      // Performance
      avgResponseRate: decimal4("avg_response_rate", { precision: 5, scale: 2 }),
      avgOpenRate: decimal4("avg_open_rate", { precision: 5, scale: 2 }),
      usageCount: integer5("usage_count").notNull().default(0),
      // Insights appliqués
      basedOnInsights: jsonb4("based_on_insights").default(sql5`'[]'::jsonb`),
      // Array d'IDs d'insights
      // Statut
      isActive: text5("is_active").notNull().default("true"),
      // Dates
      createdAt: timestamp5("created_at").notNull().defaultNow(),
      activatedAt: timestamp5("activated_at"),
      deactivatedAt: timestamp5("deactivated_at")
    }, (table) => [
      index5("idx_prompt_versions_type").on(table.promptType),
      index5("idx_prompt_versions_active").on(table.isActive)
    ]);
    companies = pgTable5("companies", {
      id: varchar5("id").primaryKey().default(sql5`gen_random_uuid()`),
      // ARCHITECTURE UNIFIÉE - Entité de rattachement
      entity: varchar5("entity", { length: 50 }).notNull().default("luxembourg"),
      // Identification (architecture multi-pays)
      countryCode: varchar5("country_code", { length: 2 }).notNull().default("FR"),
      identifierType: varchar5("identifier_type", { length: 20 }).notNull().default("SIRET"),
      // SIRET, SIREN, BCE, RCS, etc.
      identifierValue: varchar5("identifier_value", { length: 50 }),
      // Le numéro lui-même
      parentIdentifier: varchar5("parent_identifier", { length: 50 }),
      // SIREN pour un SIRET, null pour un SIREN
      // Données légales
      legalName: varchar5("legal_name", { length: 255 }),
      tradeName: varchar5("trade_name", { length: 255 }),
      legalForm: varchar5("legal_form", { length: 100 }),
      legalFormLabel: varchar5("legal_form_label", { length: 255 }),
      // Phase 2.8 : "Société par actions simplifiée"
      nafCode: varchar5("naf_code", { length: 10 }),
      nafLabel: varchar5("naf_label", { length: 255 }),
      creationDate: date4("creation_date"),
      status: varchar5("status", { length: 50 }),
      // active, radiee, cessation, etc.
      // Phase 2.8 : Données métier essentielles
      effectif: varchar5("effectif", { length: 50 }),
      // "50-99 salariés"
      effectifMin: integer5("effectif_min"),
      // 50
      effectifMax: integer5("effectif_max"),
      // 99
      capitalSocial: integer5("capital_social"),
      // En euros
      numeroTVA: varchar5("numero_tva", { length: 20 }),
      // FR12345678901
      // Phase 2.8 : État administratif
      etatAdministratif: varchar5("etat_administratif", { length: 20 }),
      // "Actif", "Cessé"
      dateCessation: date4("date_cessation"),
      // Phase 2.8 : Alertes juridiques (RJ/LJ)
      procedureCollective: text5("procedure_collective").notNull().default("false"),
      procedureType: varchar5("procedure_type", { length: 20 }),
      // "RJ", "LJ", "Sauvegarde", "Plan"
      procedureTypeLibelle: varchar5("procedure_type_libelle", { length: 100 }),
      // "Redressement judiciaire"
      procedureDate: date4("procedure_date"),
      tribunalCommerce: varchar5("tribunal_commerce", { length: 100 }),
      // Adresse complète (Phase 2.8)
      addressLine1: varchar5("address_line1", { length: 255 }),
      addressLine2: varchar5("address_line2", { length: 255 }),
      postalCode: varchar5("postal_code", { length: 20 }),
      city: varchar5("city", { length: 100 }),
      commune: varchar5("commune", { length: 100 }),
      department: varchar5("department", { length: 100 }),
      // ex: "Paris (75)", "Rhône (69)"
      region: varchar5("region", { length: 100 }),
      // ex: "Île-de-France"
      country: varchar5("country", { length: 100 }).default("France"),
      latitude: decimal4("latitude", { precision: 10, scale: 7 }),
      // GPS
      longitude: decimal4("longitude", { precision: 10, scale: 7 }),
      // GPS
      complementAddress: varchar5("complement_address", { length: 255 }),
      // "Chez M. Dupont", "Bâtiment A"
      // Coordonnées (Phase 2.8 : téléphone formaté international, email, site web)
      phone: varchar5("phone", { length: 50 }),
      email: varchar5("email", { length: 255 }),
      website: varchar5("website", { length: 255 }),
      // Enrichissement
      enriched: text5("enriched").notNull().default("false"),
      enrichmentSource: varchar5("enrichment_source", { length: 50 }),
      // pappers, manual, import, etc.
      enrichmentDate: timestamp5("enrichment_date"),
      lastUpdate: timestamp5("last_update").defaultNow(),
      // Phase 2.7 - Tracking lookup téléphone multi-sources
      phoneLookupSource: varchar5("phone_lookup_source", { length: 20 }),
      // pagesjaunes, 118712, 118218, none
      phoneLookupConfidence: integer5("phone_lookup_confidence"),
      // 0-100
      // Métadonnées
      createdBy: varchar5("created_by").references(() => users.id),
      createdAt: timestamp5("created_at").notNull().defaultNow(),
      updatedAt: timestamp5("updated_at").notNull().defaultNow()
    }, (table) => [
      index5("idx_companies_identifier").on(table.identifierValue),
      index5("idx_companies_parent").on(table.parentIdentifier),
      index5("idx_companies_legal_name").on(table.legalName),
      index5("idx_companies_country_type").on(table.countryCode, table.identifierType),
      index5("idx_companies_entity").on(table.entity),
      // ARCHITECTURE UNIFIÉE
      index5("idx_companies_entity_created").on(table.entity, table.createdAt)
      // ARCHITECTURE UNIFIÉE - Performance
    ]);
    enrichmentLogs = pgTable5("enrichment_logs", {
      id: varchar5("id").primaryKey().default(sql5`gen_random_uuid()`),
      companyId: varchar5("company_id").references(() => companies.id, { onDelete: "cascade" }),
      triggerType: varchar5("trigger_type", { length: 50 }),
      // manual, auto_siret, auto_analysis, import
      triggerUserId: varchar5("trigger_user_id").references(() => users.id),
      source: varchar5("source", { length: 50 }),
      // pappers, insee, manual
      apiResponse: jsonb4("api_response"),
      // Stockage complet de la réponse API
      fieldsUpdated: text5("fields_updated").array(),
      // Liste des champs modifiés
      status: varchar5("status", { length: 20 }),
      // success, partial, failed
      errorMessage: text5("error_message"),
      // PHASE 2.5 CASCADE: Tracking économies
      cost: integer5("cost").default(0),
      // Coût en centimes (0 pour INSEE, 10 pour Pappers = 0,10€)
      fallbackUsed: text5("fallback_used").default("false"),
      // true si Pappers utilisé en fallback
      duration: integer5("duration"),
      // Durée enrichissement en ms
      // PHASE 2.6: Tracking téléphone  
      phoneNumber: varchar5("phone_number", { length: 50 }),
      phoneLookupSource: varchar5("phone_lookup_source", { length: 50 }),
      createdAt: timestamp5("created_at").notNull().defaultNow()
    }, (table) => [
      index5("idx_enrichment_logs_company").on(table.companyId),
      index5("idx_enrichment_logs_created").on(table.createdAt),
      index5("idx_enrichment_logs_source").on(table.source)
      // Index pour métriques CASCADE
    ]);
    companyRelationships = pgTable5("company_relationships", {
      id: varchar5("id").primaryKey().default(sql5`gen_random_uuid()`),
      parentCompanyId: varchar5("parent_company_id").references(() => companies.id),
      // Le SIREN
      childCompanyId: varchar5("child_company_id").references(() => companies.id),
      // Le SIRET
      relationshipType: varchar5("relationship_type", { length: 50 }).default("establishment"),
      // establishment, subsidiary, branch
      isActive: text5("is_active").notNull().default("true"),
      createdAt: timestamp5("created_at").notNull().defaultNow()
    }, (table) => [
      index5("idx_company_rel_parent").on(table.parentCompanyId),
      index5("idx_company_rel_child").on(table.childCompanyId)
    ]);
    pappersCache = pgTable5("pappers_cache", {
      id: varchar5("id").primaryKey().default(sql5`gen_random_uuid()`),
      identifier: varchar5("identifier", { length: 50 }).notNull(),
      // SIREN ou SIRET
      identifierType: varchar5("identifier_type", { length: 10 }).notNull(),
      // siren ou siret
      apiResponse: jsonb4("api_response").notNull(),
      createdAt: timestamp5("created_at").notNull().defaultNow(),
      expiresAt: timestamp5("expires_at").notNull()
      // Durée de validité : 30 jours
    }, (table) => [
      index5("idx_pappers_cache_identifier").on(table.identifier),
      index5("idx_pappers_cache_expires").on(table.expiresAt)
    ]);
    insertScenarioSchema = createInsertSchema5(scenarios).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertScenarioEtapeSchema = createInsertSchema5(scenarioEtapes).omit({
      id: true,
      createdAt: true
    });
    insertCampagneProspectionSchema = createInsertSchema5(campagnesProspection).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertProspectEnProspectionSchema = createInsertSchema5(prospectsEnProspection).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertInteractionProspectionSchema = createInsertSchema5(interactionsProspection).omit({
      id: true,
      createdAt: true
    });
    insertBlacklistProspectionSchema = createInsertSchema5(blacklistProspection).omit({
      id: true,
      createdAt: true
    });
    insertMessageVariantSchema = createInsertSchema5(messageVariants2).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertVariantMetricSchema = createInsertSchema5(variantMetrics).omit({
      id: true,
      updatedAt: true
    });
    insertLearningInsightSchema = createInsertSchema5(learningInsights).omit({
      id: true,
      detectedAt: true
    });
    insertPromptVersionSchema = createInsertSchema5(promptVersions).omit({
      id: true,
      createdAt: true
    });
    insertCompanySchema = createInsertSchema5(companies).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertEnrichmentLogSchema = createInsertSchema5(enrichmentLogs).omit({
      id: true,
      createdAt: true
    });
    insertCompanyRelationshipSchema = createInsertSchema5(companyRelationships).omit({
      id: true,
      createdAt: true
    });
    insertPappersCacheSchema = createInsertSchema5(pappersCache).omit({
      id: true,
      createdAt: true
    });
    batchImports = pgTable5("batch_imports", {
      id: varchar5("id").primaryKey().default(sql5`gen_random_uuid()`),
      // Métadonnées
      userId: varchar5("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      entity: varchar5("entity", { length: 50 }).notNull(),
      // Auto-détecté depuis user
      filename: varchar5("filename", { length: 255 }).notNull(),
      // Configuration import
      mapping: jsonb4("mapping").notNull(),
      // { "Entreprise": "entreprise", "Email": "email", ... }
      options: jsonb4("options").default(sql5`'{"auto_enrich": true, "deduplicate": true, "skip_duplicates": true}'::jsonb`),
      // Statut
      status: varchar5("status", { length: 20 }).notNull().default("pending"),
      // pending | processing | completed | failed
      progress: integer5("progress").notNull().default(0),
      // 0-100
      // Résultats
      totalRows: integer5("total_rows").notNull().default(0),
      processedRows: integer5("processed_rows").notNull().default(0),
      successCount: integer5("success_count").notNull().default(0),
      errorCount: integer5("error_count").notNull().default(0),
      duplicateCount: integer5("duplicate_count").notNull().default(0),
      // Détails erreurs
      errors: jsonb4("errors").default(sql5`'[]'::jsonb`),
      // [{ row: 5, error: "Email invalide", data: {...} }]
      // Audit
      startedAt: timestamp5("started_at"),
      completedAt: timestamp5("completed_at"),
      createdAt: timestamp5("created_at").notNull().defaultNow(),
      updatedAt: timestamp5("updated_at").notNull().defaultNow()
    }, (table) => [
      index5("idx_batch_imports_user").on(table.userId, table.createdAt),
      index5("idx_batch_imports_status").on(table.status, table.createdAt),
      index5("idx_batch_imports_entity").on(table.entity)
    ]);
    batchImportProspects = pgTable5("batch_import_prospects", {
      id: varchar5("id").primaryKey().default(sql5`gen_random_uuid()`),
      batchImportId: varchar5("batch_import_id").notNull().references(() => batchImports.id, { onDelete: "cascade" }),
      prospectId: varchar5("prospect_id").references(() => prospects.id, { onDelete: "set null" }),
      // Données row original
      rowNumber: integer5("row_number").notNull(),
      rawData: jsonb4("raw_data").notNull(),
      // Statut processing
      status: varchar5("status", { length: 20 }).notNull().default("pending"),
      // pending | success | error | duplicate
      errorMessage: text5("error_message"),
      createdAt: timestamp5("created_at").notNull().defaultNow()
    }, (table) => [
      index5("idx_batch_import_prospects_batch").on(table.batchImportId),
      index5("idx_batch_import_prospects_status").on(table.status)
    ]);
    insertBatchImportSchema = createInsertSchema5(batchImports).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertBatchImportProspectSchema = createInsertSchema5(batchImportProspects).omit({
      id: true,
      createdAt: true
    });
    insertOrganizationEntitySchema = createInsertSchema5(organizationEntities).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertTeamSchema = createInsertSchema5(teams).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertTeamMemberSchema = createInsertSchema5(teamMembers).omit({
      id: true,
      joinedAt: true
    });
    insertAuditLogSchema = createInsertSchema5(auditLogs).omit({
      id: true,
      createdAt: true
    });
  }
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
var pool, db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    neonConfig.webSocketConstructor = ws;
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?"
      );
    }
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle({ client: pool, schema: schema_exports });
  }
});

// server/storage.ts
import { eq as eq2, and, desc, gte, sql as sql6, count, inArray, lte } from "drizzle-orm";
var DatabaseStorage, storage;
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    init_schema();
    init_db();
    DatabaseStorage = class {
      // User operations
      async getUser(id) {
        const [user] = await db.select().from(users).where(eq2(users.id, id));
        return user;
      }
      async getUserByEmail(email) {
        const [user] = await db.select().from(users).where(eq2(users.email, email));
        return user;
      }
      async createUser(userData) {
        const [user] = await db.insert(users).values(userData).returning();
        return user;
      }
      async updateUser(id, data) {
        const [user] = await db.update(users).set({
          ...data,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq2(users.id, id)).returning();
        return user;
      }
      async getAllUsers() {
        return await db.select().from(users).orderBy(desc(users.createdAt));
      }
      // Conversation methods
      async createConversation(insertConversation) {
        const [conversation] = await db.insert(conversations).values(insertConversation).returning();
        return conversation;
      }
      async getConversation(id) {
        const [conversation] = await db.select().from(conversations).where(eq2(conversations.id, id));
        return conversation;
      }
      async getUserConversations(userId) {
        return await db.select().from(conversations).orderBy(desc(conversations.createdAt));
      }
      // Message methods
      async createMessage(insertMessage) {
        const [message] = await db.insert(messages).values(insertMessage).returning();
        return message;
      }
      async getMessagesByConversation(conversationId) {
        return await db.select().from(messages).where(eq2(messages.conversationId, conversationId)).orderBy(messages.createdAt);
      }
      async getUserMessages(userId) {
        return await db.select().from(messages).orderBy(messages.createdAt);
      }
      // Password reset tokens
      async createPasswordResetToken(tokenData) {
        const [token] = await db.insert(passwordResetTokens).values(tokenData).returning();
        return token;
      }
      async getPasswordResetToken(token) {
        const [resetToken] = await db.select().from(passwordResetTokens).where(eq2(passwordResetTokens.token, token));
        return resetToken;
      }
      async deletePasswordResetToken(token) {
        await db.delete(passwordResetTokens).where(eq2(passwordResetTokens.token, token));
      }
      // Login attempts (rate limiting)
      async recordLoginAttempt(attemptData) {
        await db.insert(loginAttempts).values(attemptData);
      }
      async getRecentLoginAttempts(email, minutesAgo) {
        const cutoffTime = new Date(Date.now() - minutesAgo * 60 * 1e3);
        return await db.select().from(loginAttempts).where(
          and(
            eq2(loginAttempts.email, email),
            gte(loginAttempts.attemptedAt, cutoffTime)
          )
        );
      }
      async clearLoginAttempts(email) {
        await db.delete(loginAttempts).where(eq2(loginAttempts.email, email));
      }
      // Appointment methods
      async createAppointment(appointmentData) {
        const [appointment] = await db.insert(appointments).values(appointmentData).returning();
        return appointment;
      }
      async getAppointment(id) {
        const [appointment] = await db.select().from(appointments).where(eq2(appointments.id, id));
        return appointment;
      }
      async getUserAppointments(userId) {
        return await db.select().from(appointments).where(eq2(appointments.userId, userId)).orderBy(desc(appointments.createdAt));
      }
      async updateAppointment(id, data) {
        const [appointment] = await db.update(appointments).set({
          ...data,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq2(appointments.id, id)).returning();
        return appointment;
      }
      async deleteAppointment(id) {
        await db.delete(appointments).where(eq2(appointments.id, id));
      }
      // Media file methods
      async createMediaFile(mediaFileData) {
        const [mediaFile] = await db.insert(mediaFiles).values(mediaFileData).returning();
        return mediaFile;
      }
      async getMediaFile(id) {
        const [mediaFile] = await db.select().from(mediaFiles).where(eq2(mediaFiles.id, id));
        return mediaFile;
      }
      async getUserMediaFiles(userId) {
        return await db.select().from(mediaFiles).where(eq2(mediaFiles.userId, userId)).orderBy(desc(mediaFiles.createdAt));
      }
      async deleteMediaFile(id) {
        await db.delete(mediaFiles).where(eq2(mediaFiles.id, id));
      }
      // CRM: Prospect methods
      async createProspect(prospectData) {
        const [prospect] = await db.insert(prospects).values(prospectData).returning();
        return prospect;
      }
      async getProspect(id, userId) {
        const [prospect] = await db.select().from(prospects).where(eq2(prospects.id, id));
        return prospect;
      }
      async getUserProspects(userId) {
        return await db.select().from(prospects).orderBy(desc(prospects.createdAt));
      }
      async getProspectsAQualifier(userId) {
        return await db.select().from(prospects).where(eq2(prospects.qualificationNeeded, "true")).orderBy(desc(prospects.createdAt));
      }
      async updateProspect(id, userId, data) {
        const [prospect] = await db.update(prospects).set({
          ...data,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq2(prospects.id, id)).returning();
        return prospect;
      }
      async deleteProspect(id, userId) {
        await db.delete(prospects).where(eq2(prospects.id, id));
      }
      // CRM: Opportunity methods
      async createOpportunity(opportunityData) {
        const [opportunity] = await db.insert(opportunities).values(opportunityData).returning();
        return opportunity;
      }
      async getOpportunity(id, userId) {
        const [opportunity] = await db.select().from(opportunities).where(eq2(opportunities.id, id));
        return opportunity;
      }
      async getUserOpportunities(userId) {
        return await db.select().from(opportunities).orderBy(desc(opportunities.createdAt));
      }
      async getProspectOpportunities(prospectId, userId) {
        return await db.select().from(opportunities).where(eq2(opportunities.prospectId, prospectId)).orderBy(desc(opportunities.createdAt));
      }
      async updateOpportunity(id, userId, data) {
        const [opportunity] = await db.update(opportunities).set({
          ...data,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq2(opportunities.id, id)).returning();
        return opportunity;
      }
      async deleteOpportunity(id, userId) {
        await db.delete(opportunities).where(eq2(opportunities.id, id));
      }
      // CRM: Action methods
      async createAction(actionData) {
        const [action] = await db.insert(actions).values(actionData).returning();
        return action;
      }
      async getAction(id, userId) {
        const [action] = await db.select().from(actions).where(eq2(actions.id, id));
        return action;
      }
      async getUserActions(userId) {
        return await db.select().from(actions).orderBy(actions.datePrevue);
      }
      async getProspectActions(prospectId, userId) {
        return await db.select().from(actions).where(eq2(actions.prospectId, prospectId)).orderBy(actions.datePrevue);
      }
      async updateAction(id, userId, data) {
        const [action] = await db.update(actions).set(data).where(eq2(actions.id, id)).returning();
        return action;
      }
      async deleteAction(id, userId) {
        await db.delete(actions).where(eq2(actions.id, id));
      }
      // CRM: RDV methods
      async createRdv(rdvData) {
        const [rdv] = await db.insert(rdvs).values(rdvData).returning();
        return rdv;
      }
      async getRdv(id, userId) {
        const [rdv] = await db.select().from(rdvs).where(eq2(rdvs.id, id));
        return rdv;
      }
      async getUserRdvs(userId) {
        return await db.select().from(rdvs).orderBy(rdvs.dateRdv);
      }
      async getProspectRdvs(prospectId, userId) {
        return await db.select().from(rdvs).where(eq2(rdvs.prospectId, prospectId)).orderBy(rdvs.dateRdv);
      }
      async updateRdv(id, userId, data) {
        const [rdv] = await db.update(rdvs).set(data).where(eq2(rdvs.id, id)).returning();
        return rdv;
      }
      async deleteRdv(id, userId) {
        await db.delete(rdvs).where(eq2(rdvs.id, id));
      }
      // Invitation methods
      async createInvitation(invitationData) {
        const [invitation] = await db.insert(invitations).values(invitationData).returning();
        return invitation;
      }
      async getInvitation(id) {
        const [invitation] = await db.select().from(invitations).where(eq2(invitations.id, id));
        return invitation;
      }
      async getInvitationByToken(token) {
        const [invitation] = await db.select().from(invitations).where(eq2(invitations.token, token));
        return invitation;
      }
      async getAllInvitations() {
        return await db.select().from(invitations).orderBy(desc(invitations.createdAt));
      }
      async getPendingInvitations() {
        return await db.select().from(invitations).where(eq2(invitations.status, "pending")).orderBy(desc(invitations.createdAt));
      }
      async updateInvitation(id, data) {
        const [invitation] = await db.update(invitations).set(data).where(eq2(invitations.id, id)).returning();
        return invitation;
      }
      async deleteInvitation(id) {
        await db.delete(invitations).where(eq2(invitations.id, id));
      }
      // Types Prestations methods
      async getAllTypesPrestations() {
        return await db.select().from(typesPrestations).orderBy(typesPrestations.nom);
      }
      async getTypePrestation(id) {
        const [prestation] = await db.select().from(typesPrestations).where(eq2(typesPrestations.id, id));
        return prestation;
      }
      // Stats One-Shot methods
      async getOneShotPerformance(userId) {
        const userOpportunities = await db.select().from(opportunities);
        const totalOpportunites = userOpportunities.length;
        const contratsSignes = userOpportunities.filter((o) => o.statut === "signe").length;
        const opportunitiesSignees = userOpportunities.filter((o) => o.statut === "signe");
        const pipelineEnCours = userOpportunities.filter(
          (o) => ["contact", "qualification", "proposition"].includes(o.statut || "")
        ).length;
        const opportunitiesPerdues = userOpportunities.filter((o) => o.statut === "perdu").length;
        const mrrGenere = opportunitiesSignees.reduce((sum3, opp) => {
          const mrr = (Number(opp.nombreContrats) || 0) * (Number(opp.abonnementMensuelHt) || 0);
          return sum3 + mrr;
        }, 0);
        const arrGenere = mrrGenere * 12;
        const caTotal = opportunitiesSignees.reduce((sum3, opp) => {
          const ca = (Number(opp.nombreContrats) || 0) * (Number(opp.abonnementMensuelHt) || 0) * (Number(opp.dureeEngagementMois) || 12);
          return sum3 + ca;
        }, 0);
        const panierMoyen = opportunitiesSignees.length > 0 ? opportunitiesSignees.reduce((sum3, opp) => sum3 + (Number(opp.abonnementMensuelHt) || 0), 0) / opportunitiesSignees.length : 0;
        const opportunitiesAvecDelai = opportunitiesSignees.filter((o) => o.datePremierContact && o.dateSignature);
        const delaiMoyenSignature = opportunitiesAvecDelai.length > 0 ? opportunitiesAvecDelai.reduce((sum3, opp) => {
          const delai = Math.floor((new Date(opp.dateSignature).getTime() - new Date(opp.datePremierContact).getTime()) / (1e3 * 60 * 60 * 24));
          return sum3 + delai;
        }, 0) / opportunitiesAvecDelai.length : 0;
        const mrrPipeline = userOpportunities.filter((o) => ["contact", "qualification", "proposition"].includes(o.statut || "")).reduce((sum3, opp) => {
          const mrr = (Number(opp.nombreContrats) || 0) * (Number(opp.abonnementMensuelHt) || 0);
          return sum3 + mrr;
        }, 0);
        const totalClotures = contratsSignes + opportunitiesPerdues;
        const tauxTransformation = totalClotures > 0 ? Math.round(contratsSignes / totalClotures * 100) : 0;
        return {
          totalOpportunites,
          contratsSignes,
          totalContrats: opportunitiesSignees.reduce((sum3, opp) => sum3 + (Number(opp.nombreContrats) || 0), 0),
          mrrGenere: Math.round(mrrGenere * 100) / 100,
          arrGenere: Math.round(arrGenere * 100) / 100,
          caTotalEngage: Math.round(caTotal * 100) / 100,
          panierMoyen: Math.round(panierMoyen * 100) / 100,
          delaiMoyenSignature: Math.round(delaiMoyenSignature),
          pipelineEnCours,
          mrrPipeline: Math.round(mrrPipeline * 100) / 100,
          tauxTransformation
        };
      }
      async getTeamOneShotPerformance(userId, teamMemberIds) {
        const allIds = [...teamMemberIds, userId];
        const teamStats = await Promise.all(
          allIds.map((id) => this.getOneShotPerformance(id))
        );
        return {
          contratsSignes: teamStats.reduce((sum3, s) => sum3 + s.contratsSignes, 0),
          totalContrats: teamStats.reduce((sum3, s) => sum3 + s.totalContrats, 0),
          mrrGenere: Math.round(teamStats.reduce((sum3, s) => sum3 + s.mrrGenere, 0) * 100) / 100,
          arrGenere: Math.round(teamStats.reduce((sum3, s) => sum3 + s.arrGenere, 0) * 100) / 100,
          caTotalEngage: Math.round(teamStats.reduce((sum3, s) => sum3 + s.caTotalEngage, 0) * 100) / 100,
          panierMoyen: Math.round(teamStats.reduce((sum3, s) => sum3 + s.panierMoyen, 0) / teamStats.length * 100) / 100,
          delaiMoyenSignature: Math.round(teamStats.reduce((sum3, s) => sum3 + s.delaiMoyenSignature, 0) / teamStats.length),
          pipelineEnCours: teamStats.reduce((sum3, s) => sum3 + s.pipelineEnCours, 0),
          mrrPipeline: Math.round(teamStats.reduce((sum3, s) => sum3 + s.mrrPipeline, 0) * 100) / 100,
          tauxTransformationMoyen: Math.round(teamStats.reduce((sum3, s) => sum3 + s.tauxTransformation, 0) / teamStats.length),
          nombreCommerciaux: allIds.length
        };
      }
      // Notifications transferts methods
      async getNotificationsTransfert(userId, role) {
        if (role === "sdr") {
          return await db.select().from(notificationsTransfert).where(eq2(notificationsTransfert.sdrId, userId)).orderBy(desc(notificationsTransfert.createdAt));
        } else {
          return await db.select().from(notificationsTransfert).where(eq2(notificationsTransfert.repreneurId, userId)).orderBy(desc(notificationsTransfert.createdAt));
        }
      }
      async markNotificationRead(notificationId, userId) {
        await db.update(notificationsTransfert).set({ lu: "true" }).where(
          and(
            eq2(notificationsTransfert.id, notificationId),
            sql6`(${notificationsTransfert.sdrId} = ${userId} OR ${notificationsTransfert.repreneurId} = ${userId})`
          )
        );
      }
      async createNotificationTransfert(notificationData) {
        const [notification] = await db.insert(notificationsTransfert).values(notificationData).returning();
        return notification;
      }
      // Transferts SDR → BD/IC methods
      async demanderTransfertBd(opportunityId, userId, repreneurId, raison) {
        const [opportunity] = await db.update(opportunities).set({
          statut: "appui_bd_demande",
          bdRepreneurId: repreneurId,
          dateTransfertBd: /* @__PURE__ */ new Date(),
          raisonTransfert: raison,
          statutTransfert: "en_attente",
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq2(opportunities.id, opportunityId)).returning();
        if (!opportunity) {
          throw new Error("Opportunit\xE9 non trouv\xE9e ou non autoris\xE9e");
        }
        return opportunity;
      }
      async accepterTransfert(opportunityId, repreneurId) {
        const [opportunity] = await db.update(opportunities).set({
          statut: "transfert_accepte",
          statutTransfert: "accepte",
          userId: repreneurId,
          canalActuel: "terrain",
          updatedAt: /* @__PURE__ */ new Date()
        }).where(and(
          eq2(opportunities.id, opportunityId),
          eq2(opportunities.bdRepreneurId, repreneurId)
        )).returning();
        if (!opportunity) {
          throw new Error("Transfert non trouv\xE9 ou non autoris\xE9");
        }
        return opportunity;
      }
      async refuserTransfert(opportunityId, repreneurId, raison) {
        const [opportunity] = await db.update(opportunities).set({
          statut: "transfert_refuse",
          statutTransfert: "refuse",
          raisonTransfert: raison,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(and(
          eq2(opportunities.id, opportunityId),
          eq2(opportunities.bdRepreneurId, repreneurId)
        )).returning();
        if (!opportunity) {
          throw new Error("Transfert non trouv\xE9 ou non autoris\xE9");
        }
        return opportunity;
      }
      // Affaires chaudes methods
      async getAffairesChaudes(userId, role) {
        let query;
        if (role === "chef_ventes") {
          const managedUsers = await db.select({ id: users.id }).from(users).where(and(eq2(users.managerId, userId), eq2(users.role, "business_developer")));
          const managedUserIds = managedUsers.map((u) => u.id);
          const allUserIds = [...managedUserIds, userId];
          query = await db.execute(sql6`
        SELECT * FROM v_affaires_chaudes 
        WHERE user_id = ANY(${allUserIds})
      `);
        } else {
          query = await db.execute(sql6`
        SELECT * FROM v_affaires_chaudes 
        WHERE user_id = ${userId}
      `);
        }
        return query.rows;
      }
      async relancerAffaireChaude(opportunityId, userId) {
        const [opportunity] = await db.update(opportunities).set({
          derniereRelance: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq2(opportunities.id, opportunityId)).returning();
        return opportunity;
      }
      // Cycle R1/R2 methods
      async cloturerR1(opportunityId, userId, signee, raison) {
        const updateData = {
          dateR1: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        };
        if (signee) {
          updateData.statut = "signe";
          updateData.dateSignature = /* @__PURE__ */ new Date();
          updateData.signataireId = userId;
        } else {
          updateData.statut = "r1_fait_r2_requis";
          updateData.raisonNonSignatureR1 = raison;
        }
        const [opportunity] = await db.update(opportunities).set(updateData).where(eq2(opportunities.id, opportunityId)).returning();
        return opportunity;
      }
      async positionnerR2(opportunityId, userId, dateR2) {
        const [opportunity] = await db.update(opportunities).set({
          dateR2,
          statut: "r2_planifie",
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq2(opportunities.id, opportunityId)).returning();
        return opportunity;
      }
      // Stats par rôle methods (utilise vues SQL)
      async getStatsSdr(userId) {
        const result = await db.execute(sql6`
      SELECT * FROM v_stats_sdr WHERE user_id = ${userId}
    `);
        return result.rows[0] || {};
      }
      async getStatsBd(userId) {
        const result = await db.execute(sql6`
      SELECT * FROM v_stats_bd WHERE user_id = ${userId}
    `);
        return result.rows[0] || {};
      }
      async getStatsIc(userId) {
        const result = await db.execute(sql6`
      SELECT * FROM v_stats_ic WHERE user_id = ${userId}
    `);
        return result.rows[0] || {};
      }
      async getStatsChef(userId) {
        const result = await db.execute(sql6`
      SELECT * FROM v_stats_chef_ventes WHERE user_id = ${userId}
    `);
        return result.rows[0] || {};
      }
      // ============================================
      // MODULE PHONING DYNAMIQUE - METHODS
      // ============================================
      // Call methods
      async startCall(callData) {
        const [call] = await db.insert(calls).values(callData).returning();
        return call;
      }
      async endCall(id, userId, endData) {
        const [call] = await db.update(calls).set({
          ...endData,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq2(calls.id, id)).returning();
        return call;
      }
      async getCall(id, userId) {
        const [call] = await db.select().from(calls).where(eq2(calls.id, id));
        return call;
      }
      async getUserCalls(userId, limit = 50) {
        return db.select().from(calls).orderBy(desc(calls.startedAt)).limit(limit);
      }
      async getProspectCalls(prospectId, userId) {
        return db.select().from(calls).where(eq2(calls.prospectId, prospectId)).orderBy(desc(calls.startedAt));
      }
      // Call Script methods
      async createCallScript(scriptData) {
        const [script] = await db.insert(callScripts).values(scriptData).returning();
        return script;
      }
      async getCallScript(id) {
        const [script] = await db.select().from(callScripts).where(eq2(callScripts.id, id));
        return script;
      }
      // Objection methods
      async getObjections() {
        return db.select().from(objections).orderBy(desc(objections.timesEncountered));
      }
      async createObjection(objectionData) {
        const [objection] = await db.insert(objections).values(objectionData).returning();
        return objection;
      }
      async updateObjectionStats(objectionId, handled) {
        await db.update(objections).set({
          timesEncountered: sql6`${objections.timesEncountered} + 1`,
          timesSuccessfullyHandled: handled ? sql6`${objections.timesSuccessfullyHandled} + 1` : objections.timesSuccessfullyHandled,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq2(objections.id, objectionId));
      }
      // Call Note methods
      async createCallNote(noteData) {
        const [note] = await db.insert(callNotes).values(noteData).returning();
        return note;
      }
      async getCallNotes(callId) {
        return db.select().from(callNotes).where(eq2(callNotes.callId, callId)).orderBy(callNotes.noteTimestamp);
      }
      // MODULE TROUVE-MOI LE PATRON - Patron Contact methods
      async createPatronContact(contactData) {
        const [contact] = await db.insert(patronContacts).values({
          ...contactData,
          updatedAt: /* @__PURE__ */ new Date()
        }).returning();
        return contact;
      }
      async getPatronContact(id, userId) {
        const [contact] = await db.select().from(patronContacts).where(and(eq2(patronContacts.id, id), eq2(patronContacts.userId, userId)));
        return contact;
      }
      async getUserPatronContacts(userId) {
        return db.select().from(patronContacts).where(eq2(patronContacts.userId, userId)).orderBy(desc(patronContacts.createdAt));
      }
      async checkPatronContactDuplicate(siret, userId) {
        const [contact] = await db.select().from(patronContacts).where(and(eq2(patronContacts.siret, siret), eq2(patronContacts.userId, userId)));
        return contact;
      }
      async updatePatronContact(id, userId, data) {
        const [contact] = await db.update(patronContacts).set({
          ...data,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(and(eq2(patronContacts.id, id), eq2(patronContacts.userId, userId))).returning();
        return contact;
      }
      async deletePatronContact(id, userId) {
        await db.delete(patronContacts).where(and(eq2(patronContacts.id, id), eq2(patronContacts.userId, userId)));
      }
      // MODULE PROSPECTION LINKEDIN - Scenario methods
      async getAllScenarios() {
        return db.select().from(scenarios).where(eq2(scenarios.isActive, "true")).orderBy(scenarios.nom);
      }
      async getScenario(id) {
        const [scenario] = await db.select().from(scenarios).where(eq2(scenarios.id, id));
        return scenario;
      }
      async getScenarioEtapes(scenarioId) {
        return db.select().from(scenarioEtapes).where(eq2(scenarioEtapes.scenarioId, scenarioId)).orderBy(scenarioEtapes.ordre);
      }
      // MODULE PROSPECTION LINKEDIN - Campagne methods
      async createCampagne(campagneData) {
        const [campagne] = await db.insert(campagnesProspection).values({
          ...campagneData,
          updatedAt: /* @__PURE__ */ new Date()
        }).returning();
        return campagne;
      }
      async getCampagne(id, userId) {
        const [campagne] = await db.select().from(campagnesProspection).where(eq2(campagnesProspection.id, id));
        return campagne;
      }
      async getUserCampagnes(userId) {
        const result = await db.select().from(campagnesProspection).orderBy(desc(campagnesProspection.createdAt));
        return result;
      }
      async updateCampagne(id, userId, data) {
        const [campagne] = await db.update(campagnesProspection).set({
          ...data,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq2(campagnesProspection.id, id)).returning();
        return campagne;
      }
      async deleteCampagne(id, userId) {
        await db.delete(campagnesProspection).where(eq2(campagnesProspection.id, id));
      }
      // MODULE PROSPECTION LINKEDIN - Prospect en prospection methods
      async addProspectToCampagne(prospectData) {
        const [prospect] = await db.insert(prospectsEnProspection).values(prospectData).returning();
        return prospect;
      }
      async addProspectsToCampagne(campagneId, prospectIds) {
        if (prospectIds.length === 0) return;
        const values = prospectIds.map((prospectId) => ({
          campagneId,
          prospectId,
          statut: "active",
          etapeActuelle: 0,
          updatedAt: /* @__PURE__ */ new Date()
        }));
        await db.insert(prospectsEnProspection).values(values);
      }
      async getCampagneProspects(campagneId, userId) {
        return db.select().from(prospectsEnProspection).where(eq2(prospectsEnProspection.campagneId, campagneId)).orderBy(desc(prospectsEnProspection.createdAt));
      }
      async getPendingProspects() {
        const now = /* @__PURE__ */ new Date();
        const pendingProspects = await db.select({
          prospect: prospectsEnProspection,
          campagne: campagnesProspection,
          prospectDetails: prospects
        }).from(prospectsEnProspection).innerJoin(campagnesProspection, eq2(prospectsEnProspection.campagneId, campagnesProspection.id)).innerJoin(prospects, eq2(prospectsEnProspection.prospectId, prospects.id)).where(
          and(
            eq2(prospectsEnProspection.statut, "active"),
            sql6`${prospectsEnProspection.prochaineActionDate} <= ${now}`
          )
        );
        return pendingProspects;
      }
      async updateProspectEnProspection(id, userId, data) {
        const [prospect] = await db.update(prospectsEnProspection).set(data).where(eq2(prospectsEnProspection.id, id)).returning();
        return prospect;
      }
      async removeProspectFromCampagne(id, userId) {
        await db.delete(prospectsEnProspection).where(eq2(prospectsEnProspection.id, id));
      }
      // MODULE PROSPECTION LINKEDIN - Interaction methods
      async createInteraction(interactionData) {
        const [interaction] = await db.insert(interactionsProspection).values(interactionData).returning();
        return interaction;
      }
      async getProspectInteractions(prospectEnProspectionId) {
        return db.select().from(interactionsProspection).where(eq2(interactionsProspection.prospectEnProspectionId, prospectEnProspectionId)).orderBy(desc(interactionsProspection.createdAt));
      }
      async getCampagneInteractions(campagneId, userId) {
        const campagneProspects = await db.select({ id: prospectsEnProspection.id }).from(prospectsEnProspection).where(eq2(prospectsEnProspection.campagneId, campagneId));
        const prospectIds = campagneProspects.map((p) => p.id);
        if (prospectIds.length === 0) {
          return [];
        }
        return db.select().from(interactionsProspection).where(sql6`${interactionsProspection.prospectEnProspectionId} = ANY(${prospectIds})`).orderBy(desc(interactionsProspection.createdAt));
      }
      async updateInteraction(interactionId, updates) {
        const [updated] = await db.update(interactionsProspection).set(updates).where(eq2(interactionsProspection.id, interactionId)).returning();
        if (!updated) {
          throw new Error(`Interaction not found: ${interactionId}`);
        }
        return updated;
      }
      // MODULE PROSPECTION LINKEDIN - Blacklist methods
      async addToBlacklist(entryData) {
        const [entry] = await db.insert(blacklistProspection).values(entryData).returning();
        return entry;
      }
      async checkBlacklist(email, userId) {
        const [entry] = await db.select().from(blacklistProspection).where(eq2(blacklistProspection.email, email));
        return entry;
      }
      async removeFromBlacklist(id, userId) {
        await db.delete(blacklistProspection).where(eq2(blacklistProspection.id, id));
      }
      // MODULE PROSPECTION LINKEDIN - Analytics methods
      async getAnalyticsGlobalStats(userId) {
        const userCampagnes = await db.select().from(campagnesProspection);
        const campagneIds = userCampagnes.map((c) => c.id);
        if (campagneIds.length === 0) {
          return {
            totalProspects: 0,
            prospectsActifs: 0,
            prospectsCompleted: 0,
            totalInteractions: 0,
            totalReponses: 0,
            tauxReponse: 0,
            campagnesActives: 0,
            campagnesTotales: 0
          };
        }
        const prospectsStats = await db.select({
          statut: prospectsEnProspection.statut,
          count: count()
        }).from(prospectsEnProspection).where(inArray(prospectsEnProspection.campagneId, campagneIds)).groupBy(prospectsEnProspection.statut);
        const totalProspects = prospectsStats.reduce((sum3, s) => sum3 + Number(s.count), 0);
        const prospectsActifs = prospectsStats.find((s) => s.statut === "active")?.count || 0;
        const prospectsCompleted = prospectsStats.find((s) => s.statut === "completed")?.count || 0;
        const interactionsStats = await db.select({
          typeInteraction: interactionsProspection.typeInteraction,
          count: count()
        }).from(interactionsProspection).innerJoin(prospectsEnProspection, eq2(interactionsProspection.prospectEnProspectionId, prospectsEnProspection.id)).where(inArray(prospectsEnProspection.campagneId, campagneIds)).groupBy(interactionsProspection.typeInteraction);
        const totalInteractions = interactionsStats.reduce((sum3, s) => sum3 + Number(s.count), 0);
        const totalReponses = interactionsStats.find((s) => s.typeInteraction === "received")?.count || 0;
        const tauxReponse = totalInteractions > 0 ? Math.round(Number(totalReponses) / totalInteractions * 100) : 0;
        const campagnesActives = userCampagnes.filter((c) => c.statut === "active").length;
        return {
          totalProspects,
          prospectsActifs: Number(prospectsActifs),
          prospectsCompleted: Number(prospectsCompleted),
          totalInteractions,
          totalReponses: Number(totalReponses),
          tauxReponse,
          campagnesActives,
          campagnesTotales: userCampagnes.length
        };
      }
      async getAnalyticsConversionFunnel(userId) {
        const userCampagnes = await db.select().from(campagnesProspection);
        const campagneIds = userCampagnes.map((c) => c.id);
        if (campagneIds.length === 0) {
          return [];
        }
        const funnelData = await db.select({
          etapeActuelle: prospectsEnProspection.etapeActuelle,
          count: count()
        }).from(prospectsEnProspection).where(inArray(prospectsEnProspection.campagneId, campagneIds)).groupBy(prospectsEnProspection.etapeActuelle).orderBy(prospectsEnProspection.etapeActuelle);
        return funnelData.map((f) => ({
          etape: f.etapeActuelle,
          count: Number(f.count)
        }));
      }
      async getAnalyticsTopMessages(userId) {
        const userCampagnes = await db.select().from(campagnesProspection);
        const campagneIds = userCampagnes.map((c) => c.id);
        if (campagneIds.length === 0) {
          return [];
        }
        const topMessages = await db.select({
          messageEnvoye: interactionsProspection.messageEnvoye,
          canal: interactionsProspection.canal,
          count: count()
        }).from(interactionsProspection).innerJoin(prospectsEnProspection, eq2(interactionsProspection.prospectEnProspectionId, prospectsEnProspection.id)).where(
          and(
            inArray(prospectsEnProspection.campagneId, campagneIds),
            eq2(interactionsProspection.typeInteraction, "sent"),
            sql6`${interactionsProspection.messageEnvoye} IS NOT NULL`
          )
        ).groupBy(interactionsProspection.messageEnvoye, interactionsProspection.canal).orderBy(desc(count())).limit(10);
        return topMessages.map((m) => ({
          message: m.messageEnvoye,
          canal: m.canal,
          envois: Number(m.count)
        }));
      }
      // MODULE A/B TESTING - Variant methods
      async createVariant(variant) {
        const [created] = await db.insert(messageVariants2).values(variant).returning();
        await db.insert(variantMetrics).values({
          variantId: created.id,
          sent: 0,
          opened: 0,
          clicked: 0,
          replied: 0,
          accepted: 0,
          rejected: 0,
          bounced: 0
        });
        return created;
      }
      async getVariantsByEtape(campagneId, etapeId, canal) {
        const conditions = [
          eq2(messageVariants2.campagneId, campagneId),
          eq2(messageVariants2.etapeId, etapeId),
          eq2(messageVariants2.isActive, "true")
        ];
        if (canal) {
          conditions.push(eq2(messageVariants2.canal, canal));
        }
        return await db.select().from(messageVariants2).where(and(...conditions)).orderBy(messageVariants2.variantName);
      }
      async selectBestVariant(campagneId, etapeId, canal) {
        const variants = await this.getVariantsByEtape(campagneId, etapeId, canal);
        if (variants.length === 0) {
          return null;
        }
        if (variants.length === 1) {
          return variants[0];
        }
        const variantsWithMetrics = await Promise.all(
          variants.map(async (variant) => {
            const metrics = await this.getVariantMetrics(variant.id);
            return { variant, metrics };
          })
        );
        const variantsWithData = variantsWithMetrics.filter((v) => v.metrics && v.metrics.sent >= 10);
        if (variantsWithData.length === 0) {
          const minSent = Math.min(...variantsWithMetrics.map((v) => v.metrics?.sent || 0));
          const leastUsed = variantsWithMetrics.filter((v) => (v.metrics?.sent || 0) === minSent);
          return leastUsed[Math.floor(Math.random() * leastUsed.length)].variant;
        }
        const scored = variantsWithData.map(({ variant, metrics }) => {
          const m = metrics;
          const positiveScore = (m.replied + m.accepted * 2) / m.sent;
          const negativeScore = (m.rejected + m.bounced) / m.sent;
          const score = positiveScore - negativeScore;
          return { variant, score, metrics: m };
        });
        scored.sort((a, b) => b.score - a.score);
        if (Math.random() < 0.8) {
          return scored[0].variant;
        } else {
          const others = scored.slice(1);
          return others[Math.floor(Math.random() * others.length)].variant;
        }
      }
      async updateVariantMetrics(variantId, metricType) {
        await db.update(variantMetrics).set({
          [metricType]: sql6`${variantMetrics[metricType]} + 1`,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq2(variantMetrics.variantId, variantId));
      }
      async getVariantMetrics(variantId) {
        const [metrics] = await db.select().from(variantMetrics).where(eq2(variantMetrics.variantId, variantId));
        return metrics || null;
      }
      async getVariantWithMetrics(variantId) {
        const [result] = await db.select({
          variant: messageVariants2,
          metrics: variantMetrics
        }).from(messageVariants2).leftJoin(variantMetrics, eq2(messageVariants2.id, variantMetrics.variantId)).where(eq2(messageVariants2.id, variantId));
        if (!result || !result.metrics) {
          return null;
        }
        return {
          variant: result.variant,
          metrics: result.metrics
        };
      }
      // ============================================
      // PHASE 2 SIREN/SIRET - Company methods
      // ============================================
      async createCompany(companyData) {
        const [company] = await db.insert(companies).values({
          ...companyData,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        }).returning();
        return company;
      }
      async getCompany(id, userId) {
        const conditions = userId ? and(eq2(companies.id, id), eq2(companies.createdBy, userId)) : eq2(companies.id, id);
        const [company] = await db.select().from(companies).where(conditions);
        return company;
      }
      async getCompanyByIdentifier(identifierValue, countryCode = "FR", userId) {
        const conditions = userId ? and(
          eq2(companies.identifierValue, identifierValue),
          eq2(companies.countryCode, countryCode),
          eq2(companies.createdBy, userId)
        ) : and(
          eq2(companies.identifierValue, identifierValue),
          eq2(companies.countryCode, countryCode)
        );
        const [company] = await db.select().from(companies).where(conditions);
        return company;
      }
      async getCompaniesByParentIdentifier(parentIdentifier, userId) {
        const conditions = userId ? and(
          eq2(companies.parentIdentifier, parentIdentifier),
          eq2(companies.createdBy, userId)
        ) : eq2(companies.parentIdentifier, parentIdentifier);
        return await db.select().from(companies).where(conditions).orderBy(desc(companies.createdAt));
      }
      async getUserCompanies(userId, limit = 100) {
        return await db.select().from(companies).where(eq2(companies.createdBy, userId)).orderBy(desc(companies.createdAt)).limit(limit);
      }
      async getAllCompanies(limit = 100) {
        return await db.select().from(companies).orderBy(desc(companies.createdAt)).limit(limit);
      }
      async updateCompany(id, userId, data) {
        const [company] = await db.update(companies).set({
          ...data,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(and(eq2(companies.id, id), eq2(companies.createdBy, userId))).returning();
        if (!company) {
          throw new Error("Entreprise non trouv\xE9e ou non autoris\xE9e");
        }
        return company;
      }
      async deleteCompany(id, userId) {
        const result = await db.delete(companies).where(and(eq2(companies.id, id), eq2(companies.createdBy, userId))).returning();
        if (result.length === 0) {
          throw new Error("Entreprise non trouv\xE9e ou non autoris\xE9e");
        }
      }
      // ============================================
      // PHASE 2 SIREN/SIRET - Enrichment Log methods
      // ============================================
      async createEnrichmentLog(logData) {
        const [log2] = await db.insert(enrichmentLogs).values({
          ...logData,
          createdAt: /* @__PURE__ */ new Date()
        }).returning();
        return log2;
      }
      async getCompanyEnrichmentLogs(companyId, limit = 50) {
        return await db.select().from(enrichmentLogs).where(eq2(enrichmentLogs.companyId, companyId)).orderBy(desc(enrichmentLogs.createdAt)).limit(limit);
      }
      async getLatestEnrichmentLog(companyId) {
        const [log2] = await db.select().from(enrichmentLogs).where(eq2(enrichmentLogs.companyId, companyId)).orderBy(desc(enrichmentLogs.createdAt)).limit(1);
        return log2;
      }
      async getEnrichmentLogsByUserId(userId, limit = 500) {
        return await db.select({
          id: enrichmentLogs.id,
          createdAt: enrichmentLogs.createdAt,
          status: enrichmentLogs.status,
          companyId: enrichmentLogs.companyId,
          source: enrichmentLogs.source,
          phoneLookupSource: enrichmentLogs.phoneLookupSource,
          triggerType: enrichmentLogs.triggerType,
          triggerUserId: enrichmentLogs.triggerUserId,
          apiResponse: enrichmentLogs.apiResponse,
          fieldsUpdated: enrichmentLogs.fieldsUpdated,
          errorMessage: enrichmentLogs.errorMessage,
          cost: enrichmentLogs.cost,
          fallbackUsed: enrichmentLogs.fallbackUsed,
          duration: enrichmentLogs.duration,
          phoneNumber: enrichmentLogs.phoneNumber
        }).from(enrichmentLogs).innerJoin(companies, eq2(enrichmentLogs.companyId, companies.id)).where(eq2(companies.createdBy, userId)).orderBy(desc(enrichmentLogs.createdAt)).limit(limit);
      }
      // ============================================
      // PHASE 2 SIREN/SIRET - Company Relationship methods
      // ============================================
      async createCompanyRelationship(relationshipData) {
        const [relationship] = await db.insert(companyRelationships).values({
          ...relationshipData,
          createdAt: /* @__PURE__ */ new Date()
        }).returning();
        return relationship;
      }
      async getCompanyRelationships(parentCompanyId) {
        return await db.select().from(companyRelationships).where(
          and(
            eq2(companyRelationships.parentCompanyId, parentCompanyId),
            eq2(companyRelationships.isActive, "true")
          )
        ).orderBy(desc(companyRelationships.createdAt));
      }
      async deleteCompanyRelationship(id) {
        await db.delete(companyRelationships).where(eq2(companyRelationships.id, id));
      }
      // ============================================
      // PHASE 2 SIREN/SIRET - Pappers Cache methods
      // ============================================
      async getPappersCache(identifier, identifierType) {
        const [cache] = await db.select().from(pappersCache).where(
          and(
            eq2(pappersCache.identifier, identifier),
            eq2(pappersCache.identifierType, identifierType),
            gte(pappersCache.expiresAt, /* @__PURE__ */ new Date())
            // Vérifier que le cache n'est pas expiré
          )
        );
        return cache;
      }
      async createPappersCache(cacheData) {
        const [cache] = await db.insert(pappersCache).values({
          ...cacheData,
          createdAt: /* @__PURE__ */ new Date()
        }).returning();
        return cache;
      }
      async cleanExpiredCache() {
        await db.delete(pappersCache).where(lte(pappersCache.expiresAt, /* @__PURE__ */ new Date()));
      }
      // ============================================
      // ADMIN MODULE - Teams methods
      // ============================================
      async createTeam(teamData) {
        const [team] = await db.insert(teams).values(teamData).returning();
        return team;
      }
      async getTeam(id) {
        const [team] = await db.select().from(teams).where(eq2(teams.id, id));
        return team;
      }
      async getAllTeams(entityCode) {
        if (entityCode) {
          return await db.select().from(teams).where(eq2(teams.entity, entityCode)).orderBy(teams.name);
        }
        return await db.select().from(teams).orderBy(teams.name);
      }
      async updateTeam(id, data) {
        const [team] = await db.update(teams).set({
          ...data,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq2(teams.id, id)).returning();
        return team;
      }
      async deleteTeam(id) {
        await db.delete(teamMembers).where(eq2(teamMembers.teamId, id));
        await db.delete(teams).where(eq2(teams.id, id));
      }
      async getUserTeams(userId) {
        const userTeamsList = await db.select({ team: teams }).from(teamMembers).innerJoin(teams, eq2(teamMembers.teamId, teams.id)).where(eq2(teamMembers.userId, userId));
        return userTeamsList.map((row) => row.team);
      }
      // ============================================
      // ADMIN MODULE - Team Members methods
      // ============================================
      async addTeamMember(memberData) {
        const [member] = await db.insert(teamMembers).values(memberData).returning();
        return member;
      }
      async removeTeamMember(teamId, userId) {
        await db.delete(teamMembers).where(and(
          eq2(teamMembers.teamId, teamId),
          eq2(teamMembers.userId, userId)
        ));
      }
      async removeTeamMemberById(memberId) {
        await db.delete(teamMembers).where(eq2(teamMembers.id, memberId));
      }
      async getTeamMembers(teamId) {
        return await db.select().from(teamMembers).where(eq2(teamMembers.teamId, teamId));
      }
      async isUserInTeam(teamId, userId) {
        const [member] = await db.select().from(teamMembers).where(and(
          eq2(teamMembers.teamId, teamId),
          eq2(teamMembers.userId, userId)
        ));
        return !!member;
      }
      // ============================================
      // ADMIN MODULE - Organization Entities methods
      // ============================================
      async getAllOrganizationEntities() {
        return await db.select().from(organizationEntities).orderBy(organizationEntities.level, organizationEntities.sortOrder);
      }
      async getOrganizationEntity(entityCode) {
        const [entity] = await db.select().from(organizationEntities).where(eq2(organizationEntities.entityCode, entityCode));
        return entity;
      }
      async getOrganizationEntityById(id) {
        const [entity] = await db.select().from(organizationEntities).where(eq2(organizationEntities.id, id));
        return entity;
      }
      async createOrganizationEntity(data) {
        const [entity] = await db.insert(organizationEntities).values(data).returning();
        return entity;
      }
      async updateOrganizationEntity(entityCode, data) {
        const [entity] = await db.update(organizationEntities).set({
          ...data,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq2(organizationEntities.entityCode, entityCode)).returning();
        return entity;
      }
      async updateOrganizationEntityById(id, data) {
        const [entity] = await db.update(organizationEntities).set({
          ...data,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq2(organizationEntities.id, id)).returning();
        return entity;
      }
      async deleteOrganizationEntity(id) {
        await db.delete(organizationEntities).where(eq2(organizationEntities.id, id));
      }
      // ============================================
      // ADMIN MODULE - Audit Log methods
      // ============================================
      async createAuditLog(logData) {
        const [log2] = await db.insert(auditLogs).values(logData).returning();
        return log2;
      }
      async getAuditLogs(filters) {
        let query = db.select().from(auditLogs);
        const conditions = [];
        if (filters?.userId) {
          conditions.push(eq2(auditLogs.userId, filters.userId));
        }
        if (filters?.action) {
          conditions.push(eq2(auditLogs.action, filters.action));
        }
        if (filters?.entityType) {
          conditions.push(eq2(auditLogs.entityType, filters.entityType));
        }
        if (conditions.length > 0) {
          query = query.where(and(...conditions));
        }
        query = query.orderBy(desc(auditLogs.createdAt));
        if (filters?.limit) {
          query = query.limit(filters.limit);
        }
        if (filters?.offset) {
          query = query.offset(filters.offset);
        }
        return await query;
      }
    };
    storage = new DatabaseStorage();
  }
});

// server/services/ai/canal-scoring.ts
var canal_scoring_exports = {};
__export(canal_scoring_exports, {
  calculateCanalScores: () => calculateCanalScores,
  checkFallbackTrigger: () => checkFallbackTrigger,
  executeFallbackForUser: () => executeFallbackForUser,
  recommendCanalForProspect: () => recommendCanalForProspect
});
import { eq as eq5, and as and4, sql as sql12, gte as gte3, inArray as inArray2 } from "drizzle-orm";
async function calculateCanalScores(userId, lookbackDays = 30) {
  const lookbackDate = /* @__PURE__ */ new Date();
  lookbackDate.setDate(lookbackDate.getDate() - lookbackDays);
  const userCampaigns = await db.select({ id: campagnesProspection.id }).from(campagnesProspection).where(eq5(campagnesProspection.userId, userId));
  if (userCampaigns.length === 0) {
    return getDefaultScores();
  }
  const campaignIds = userCampaigns.map((c) => c.id);
  const prospectsInCampaigns = await db.select({ id: prospectsEnProspection.id }).from(prospectsEnProspection).where(inArray2(prospectsEnProspection.campagneId, campaignIds));
  if (prospectsInCampaigns.length === 0) {
    return getDefaultScores();
  }
  const prospectEnProspectionIds = prospectsInCampaigns.map((p) => p.id);
  const interactions = await db.select().from(interactionsProspection).where(
    and4(
      inArray2(interactionsProspection.prospectEnProspectionId, prospectEnProspectionIds),
      gte3(interactionsProspection.createdAt, lookbackDate)
    )
  );
  const canals = [
    "email",
    "linkedin_message",
    "linkedin_invitation",
    "sms"
  ];
  const scores = [];
  for (const canal of canals) {
    const canalInteractions = interactions.filter((i) => i.canal === canal);
    if (canalInteractions.length === 0) {
      scores.push({
        canal,
        score: 50,
        // Score neutre
        confidence: 0,
        metrics: {
          sent: 0,
          opened: 0,
          clicked: 0,
          replied: 0,
          accepted: 0,
          rejected: 0,
          bounced: 0,
          openRate: 0,
          clickRate: 0,
          replyRate: 0,
          acceptanceRate: 0,
          bounceRate: 0
        },
        recommendation: "acceptable",
        reasoning: "Aucune donn\xE9e disponible pour ce canal"
      });
      continue;
    }
    const metrics = {
      sent: canalInteractions.filter((i) => i.typeInteraction === "sent").length,
      opened: canalInteractions.filter((i) => i.typeInteraction === "opened").length,
      clicked: canalInteractions.filter((i) => i.typeInteraction === "clicked").length,
      replied: canalInteractions.filter((i) => i.typeInteraction === "replied").length,
      accepted: canalInteractions.filter((i) => i.typeInteraction === "accepted").length,
      rejected: canalInteractions.filter((i) => i.typeInteraction === "rejected").length,
      bounced: canalInteractions.filter((i) => i.typeInteraction === "bounced").length,
      openRate: 0,
      clickRate: 0,
      replyRate: 0,
      acceptanceRate: 0,
      bounceRate: 0
    };
    const totalSent = metrics.sent;
    if (totalSent > 0) {
      metrics.openRate = metrics.opened / totalSent * 100;
      metrics.clickRate = metrics.clicked / totalSent * 100;
      metrics.replyRate = metrics.replied / totalSent * 100;
      metrics.acceptanceRate = metrics.accepted / totalSent * 100;
      metrics.bounceRate = metrics.bounced / totalSent * 100;
    }
    const positiveScore = (metrics.replied + metrics.accepted * 2 + metrics.clicked * 0.5) / (totalSent || 1);
    const negativeScore = (metrics.rejected + metrics.bounced) / (totalSent || 1);
    const rawScore = (positiveScore - negativeScore) * 100;
    const normalizedScore = Math.max(0, Math.min(100, rawScore + 50));
    const confidence = Math.min(100, totalSent / 50 * 100);
    let recommendation;
    let reasoning;
    if (normalizedScore >= 70 && confidence >= 60) {
      recommendation = "optimal";
      reasoning = `Performance excellente avec ${metrics.replyRate.toFixed(1)}% de r\xE9ponses`;
    } else if (normalizedScore >= 55 && confidence >= 40) {
      recommendation = "good";
      reasoning = `Bonne performance avec ${metrics.replyRate.toFixed(1)}% de r\xE9ponses`;
    } else if (normalizedScore >= 40) {
      recommendation = "acceptable";
      reasoning = `Performance acceptable, peut \xEAtre am\xE9lior\xE9e`;
    } else {
      recommendation = "avoid";
      reasoning = `Performance faible (${metrics.replyRate.toFixed(1)}% r\xE9ponses, ${metrics.bounceRate.toFixed(1)}% bounces)`;
    }
    scores.push({
      canal,
      score: parseFloat(normalizedScore.toFixed(2)),
      confidence: parseFloat(confidence.toFixed(2)),
      metrics,
      recommendation,
      reasoning
    });
  }
  return scores;
}
function getDefaultScores() {
  const canals = [
    "email",
    "linkedin_message",
    "linkedin_invitation",
    "sms"
  ];
  return canals.map((canal) => ({
    canal,
    score: 50,
    confidence: 0,
    metrics: {
      sent: 0,
      opened: 0,
      clicked: 0,
      replied: 0,
      accepted: 0,
      rejected: 0,
      bounced: 0,
      openRate: 0,
      clickRate: 0,
      replyRate: 0,
      acceptanceRate: 0,
      bounceRate: 0
    },
    recommendation: "acceptable",
    reasoning: "Aucune donn\xE9e disponible"
  }));
}
async function recommendCanalForProspect(userId, prospectId) {
  const canalScores = await calculateCanalScores(userId);
  const [prospect] = await db.select().from(prospects).where(
    and4(
      eq5(prospects.userId, userId),
      eq5(prospects.id, prospectId)
    )
  ).limit(1);
  if (!prospect) {
    throw new Error("Prospect non trouv\xE9");
  }
  const sortedCanals = [...canalScores].sort((a, b) => b.score - a.score);
  const discProfile = prospect.profilDisc?.toUpperCase();
  let discBonus = /* @__PURE__ */ new Map();
  if (discProfile === "D") {
    discBonus.set("linkedin_message", 10);
    discBonus.set("linkedin_invitation", 5);
  } else if (discProfile === "I") {
    discBonus.set("email", 10);
    discBonus.set("sms", 5);
  } else if (discProfile === "S") {
    discBonus.set("email", 15);
  } else if (discProfile === "C") {
    discBonus.set("linkedin_message", 15);
  }
  const adjustedCanals = sortedCanals.map((c) => ({
    ...c,
    score: c.score + (discBonus.get(c.canal) || 0)
  }));
  adjustedCanals.sort((a, b) => b.score - a.score);
  const recommended = adjustedCanals[0];
  const alternatives = adjustedCanals.slice(1, 3).map((c) => ({
    canal: c.canal,
    score: c.score
  }));
  const fallbackCanal = alternatives[0]?.canal || "email";
  return {
    prospectId,
    recommendedCanal: recommended.canal,
    alternativeCanals: alternatives,
    reasoning: `${recommended.reasoning}. Profil DISC ${discProfile || "non d\xE9fini"}.`,
    confidence: recommended.confidence,
    fallbackStrategy: {
      enabled: true,
      nextCanal: fallbackCanal,
      triggerAfterDays: 7
    }
  };
}
async function checkFallbackTrigger(prospectId) {
  const sevenDaysAgo = /* @__PURE__ */ new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const [prospectInProspection] = await db.select().from(prospectsEnProspection).where(eq5(prospectsEnProspection.prospectId, prospectId)).limit(1);
  if (!prospectInProspection) {
    return false;
  }
  const lastInteractions = await db.select().from(interactionsProspection).where(
    and4(
      eq5(interactionsProspection.prospectEnProspectionId, prospectInProspection.id),
      inArray2(interactionsProspection.typeInteraction, ["sent"])
    )
  ).orderBy(sql12`${interactionsProspection.createdAt} DESC`).limit(1);
  if (lastInteractions.length === 0) {
    return false;
  }
  const lastSent = lastInteractions[0].createdAt;
  const responses = await db.select().from(interactionsProspection).where(
    and4(
      eq5(interactionsProspection.prospectEnProspectionId, prospectInProspection.id),
      inArray2(interactionsProspection.typeInteraction, ["replied", "accepted"]),
      gte3(interactionsProspection.createdAt, lastSent)
    )
  );
  return responses.length === 0 && lastSent < sevenDaysAgo;
}
async function executeFallbackForUser(userId) {
  const userCampaigns = await db.select({ id: campagnesProspection.id }).from(campagnesProspection).where(eq5(campagnesProspection.userId, userId));
  if (userCampaigns.length === 0) {
    return 0;
  }
  const campaignIds = userCampaigns.map((c) => c.id);
  const prospectsInCampaigns = await db.select().from(prospectsEnProspection).where(
    and4(
      inArray2(prospectsEnProspection.campagneId, campaignIds),
      eq5(prospectsEnProspection.statut, "active")
    )
  );
  let fallbackCount = 0;
  for (const prospectInProspection of prospectsInCampaigns) {
    const shouldFallback = await checkFallbackTrigger(prospectInProspection.prospectId);
    if (shouldFallback) {
      await db.update(prospectsEnProspection).set({
        etapeActuelle: prospectInProspection.etapeActuelle + 1,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq5(prospectsEnProspection.id, prospectInProspection.id));
      fallbackCount++;
    }
  }
  return fallbackCount;
}
var init_canal_scoring = __esm({
  "server/services/ai/canal-scoring.ts"() {
    "use strict";
    init_db();
    init_schema();
  }
});

// server/services/phone/encryption-service.ts
import crypto from "crypto";
var ALGORITHM, ENCODING, EncryptionService, encryptionService;
var init_encryption_service = __esm({
  "server/services/phone/encryption-service.ts"() {
    "use strict";
    ALGORITHM = "aes-256-cbc";
    ENCODING = "hex";
    EncryptionService = class {
      key;
      iv;
      constructor() {
        const encryptionKey = process.env.ENCRYPTION_KEY;
        const encryptionIV = process.env.ENCRYPTION_IV;
        if (!encryptionKey || !encryptionIV) {
          console.warn("\u26A0\uFE0F ENCRYPTION_KEY ou ENCRYPTION_IV manquant - g\xE9n\xE9ration automatique");
          this.key = crypto.randomBytes(32);
          this.iv = crypto.randomBytes(16);
        } else {
          const keyEncoding = encryptionKey.includes("/") || encryptionKey.includes("+") || encryptionKey.includes("=") ? "base64" : "hex";
          const ivEncoding = encryptionIV.includes("/") || encryptionIV.includes("+") || encryptionIV.includes("=") ? "base64" : "hex";
          this.key = Buffer.from(encryptionKey, keyEncoding);
          this.iv = Buffer.from(encryptionIV, ivEncoding);
        }
        if (this.key.length !== 32) {
          throw new Error(`ENCRYPTION_KEY doit \xEAtre 32 bytes (re\xE7u ${this.key.length} bytes)`);
        }
        if (this.iv.length !== 16) {
          throw new Error(`ENCRYPTION_IV doit \xEAtre 16 bytes (re\xE7u ${this.iv.length} bytes)`);
        }
      }
      /**
       * Chiffre un texte avec AES-256-CBC
       * @param text - Texte à chiffrer (ex: Auth Token Twilio)
       * @returns Texte chiffré en hexadécimal
       */
      encrypt(text6) {
        if (!text6) {
          throw new Error("Texte vide impossible \xE0 chiffrer");
        }
        try {
          const cipher = crypto.createCipheriv(ALGORITHM, this.key, this.iv);
          let encrypted = cipher.update(text6, "utf8", ENCODING);
          encrypted += cipher.final(ENCODING);
          return encrypted;
        } catch (error) {
          console.error("\u274C Erreur chiffrement:", error);
          throw new Error("\xC9chec du chiffrement");
        }
      }
      /**
       * Déchiffre un texte chiffré avec AES-256-CBC
       * @param encryptedText - Texte chiffré en hexadécimal
       * @returns Texte déchiffré
       */
      decrypt(encryptedText) {
        if (!encryptedText) {
          throw new Error("Texte chiffr\xE9 vide impossible \xE0 d\xE9chiffrer");
        }
        try {
          const decipher = crypto.createDecipheriv(ALGORITHM, this.key, this.iv);
          let decrypted = decipher.update(encryptedText, ENCODING, "utf8");
          decrypted += decipher.final("utf8");
          return decrypted;
        } catch (error) {
          console.error("\u274C Erreur d\xE9chiffrement:", error);
          throw new Error("\xC9chec du d\xE9chiffrement - Token invalide ou corrompu");
        }
      }
      /**
       * Génère de nouvelles clés de chiffrement (utile pour setup initial)
       * @returns Objet avec key et iv en hexadécimal
       */
      static generateKeys() {
        const key = crypto.randomBytes(32).toString("hex");
        const iv = crypto.randomBytes(16).toString("hex");
        return { key, iv };
      }
    };
    encryptionService = new EncryptionService();
  }
});

// server/services/phone/twilio-service.ts
var twilio_service_exports = {};
__export(twilio_service_exports, {
  TwilioService: () => TwilioService,
  twilioService: () => twilioService
});
import twilio2 from "twilio";
import { eq as eq7 } from "drizzle-orm";
var TwilioService, twilioService;
var init_twilio_service = __esm({
  "server/services/phone/twilio-service.ts"() {
    "use strict";
    init_db();
    init_schema();
    init_encryption_service();
    TwilioService = class {
      clients = /* @__PURE__ */ new Map();
      /**
       * Invalider cache client Twilio
       * @param entity - Entity spécifique (optionnel) ou tous si non fourni
       */
      clearCache(entity) {
        if (entity) {
          this.clients.delete(entity);
          console.log(`\u{1F5D1}\uFE0F Cache Twilio invalid\xE9 pour ${entity}`);
        } else {
          this.clients.clear();
          console.log(`\u{1F5D1}\uFE0F Cache Twilio complet invalid\xE9`);
        }
      }
      /**
       * Récupère client Twilio pour une entity (avec cache)
       * @param entity - 'france' | 'luxembourg' | 'belgique'
       * @returns Client Twilio configuré
       */
      async getClient(entity) {
        if (this.clients.has(entity)) {
          return this.clients.get(entity);
        }
        const { and: and22, isNull: isNull3 } = await import("drizzle-orm");
        const config = await db.query.phoneConfigurations.findFirst({
          where: and22(
            eq7(phoneConfigurations.entity, entity),
            eq7(phoneConfigurations.isActive, true),
            isNull3(phoneConfigurations.deletedAt)
          ),
          orderBy: (table, { desc: desc13, asc }) => [
            desc13(table.isPrimary),
            // Prioriser numéros primaires
            asc(table.rotationPriority)
            // Puis par priorité
          ]
        });
        if (!config) {
          throw new Error(`\u274C Aucune configuration Twilio active pour entity: ${entity}`);
        }
        let authToken;
        try {
          authToken = encryptionService.decrypt(config.twilioAuthTokenEncrypted);
        } catch (error) {
          console.error(`\u274C Erreur d\xE9chiffrement token Twilio ${entity}:`, error);
          throw new Error(`Token Twilio invalide pour ${entity} - v\xE9rifier ENCRYPTION_KEY/IV`);
        }
        const client = twilio2(config.twilioAccountSid, authToken);
        this.clients.set(entity, client);
        console.log(`\u2705 Client Twilio cr\xE9\xE9 et mis en cache pour ${entity}`);
        return client;
      }
      /**
       * Démarrer un appel sortant
       * @param entity - Entity (france/luxembourg/belgique)
       * @param options - Options appel
       * @returns Call object Twilio
       */
      async initiateCall(entity, options) {
        const client = await this.getClient(entity);
        try {
          const call = await client.calls.create({
            to: options.to,
            from: options.from,
            url: `${process.env.REPLIT_DOMAINS?.split(",")[0] || "https://hector-sales-ai-adsgroup.replit.app"}/api/phone/twiml/connect`,
            statusCallback: options.statusCallback,
            statusCallbackEvent: options.statusCallbackEvent,
            record: options.record,
            recordingStatusCallback: options.recordingStatusCallback,
            recordingStatusCallbackEvent: ["completed"],
            timeout: 60
            // 60 secondes avant timeout
          });
          console.log(`\u{1F4DE} Appel Twilio initi\xE9: ${call.sid} (${entity})`);
          return call;
        } catch (error) {
          console.error(`\u274C Erreur initiation appel Twilio ${entity}:`, error);
          throw error;
        }
      }
      /**
       * Terminer un appel en cours
       * @param entity - Entity
       * @param callSid - SID Twilio de l'appel
       */
      async endCall(entity, callSid) {
        const client = await this.getClient(entity);
        try {
          await client.calls(callSid).update({ status: "completed" });
          console.log(`\u2705 Appel termin\xE9: ${callSid} (${entity})`);
        } catch (error) {
          console.error(`\u274C Erreur fin appel ${callSid}:`, error);
          throw error;
        }
      }
      /**
       * Récupérer le numéro Twilio intelligent basé sur l'agence du commercial
       * 
       * Sélection intelligente basée sur :
       * 1. Agence du commercial (si définie)
       * 2. Département du prospect (optionnel)
       * 3. Rotation stable sur numéros actifs
       * 
       * @param entity - Entity (france/luxembourg/belgique)
       * @param userId - ID du commercial
       * @param prospectDepartment - Code département prospect (optionnel)
       * @returns Numéro de téléphone Twilio (+33...)
       */
      async getPhoneNumber(entity, userId, prospectDepartment) {
        const { users: users4 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        const { and: and22, isNull: isNull3 } = await import("drizzle-orm");
        let user = null;
        if (userId) {
          user = await db.query.users.findFirst({
            where: eq7(users4.id, userId)
          });
        }
        let configs = [];
        if (user?.agencyLocation) {
          configs = await db.query.phoneConfigurations.findMany({
            where: and22(
              eq7(phoneConfigurations.entity, entity),
              eq7(phoneConfigurations.agencyLocation, user.agencyLocation),
              eq7(phoneConfigurations.isActive, true),
              isNull3(phoneConfigurations.deletedAt)
            ),
            orderBy: (table, { asc }) => [asc(table.rotationPriority)]
          });
        }
        if (configs.length === 0) {
          configs = await db.query.phoneConfigurations.findMany({
            where: and22(
              eq7(phoneConfigurations.entity, entity),
              eq7(phoneConfigurations.isActive, true),
              isNull3(phoneConfigurations.deletedAt)
            ),
            orderBy: (table, { asc }) => [asc(table.rotationPriority)]
          });
        }
        if (configs.length === 0) {
          throw new Error(
            `\u274C Aucun num\xE9ro actif pour ${user?.agencyLocation || entity}. Contactez l'administrateur pour activer un num\xE9ro.`
          );
        }
        if (prospectDepartment) {
          const configWithCoverage = configs.find(
            (c) => c.coverageArea && Array.isArray(c.coverageArea) && c.coverageArea.includes(prospectDepartment)
          );
          if (configWithCoverage) {
            return configWithCoverage.twilioPhoneNumber;
          }
        }
        if (userId) {
          const crypto2 = __require("crypto");
          const hash = crypto2.createHash("md5").update(userId).digest("hex");
          const index6 = parseInt(hash.substring(0, 8), 16) % configs.length;
          return configs[index6].twilioPhoneNumber;
        }
        return configs[0].twilioPhoneNumber;
      }
      /**
       * Tester la connexion Twilio d'une entity
       * @param entity - Entity à tester
       * @returns Résultat du test
       */
      async testConnection(entity) {
        try {
          const client = await this.getClient(entity);
          const config = await db.query.phoneConfigurations.findFirst({
            where: eq7(phoneConfigurations.entity, entity)
          });
          if (!config) {
            return { success: false, message: "Configuration non trouv\xE9e" };
          }
          const account = await client.api.accounts(config.twilioAccountSid).fetch();
          const phoneNumbers = await client.incomingPhoneNumbers.list({
            phoneNumber: config.twilioPhoneNumber,
            limit: 1
          });
          if (phoneNumbers.length === 0) {
            return {
              success: false,
              message: `Num\xE9ro ${config.twilioPhoneNumber} non trouv\xE9 dans compte Twilio`
            };
          }
          let appDetails = null;
          if (config.twilioTwimlAppSid) {
            try {
              const app2 = await client.applications(config.twilioTwimlAppSid).fetch();
              appDetails = {
                name: app2.friendlyName,
                sid: app2.sid
              };
            } catch (error) {
              console.warn(`\u26A0\uFE0F TwiML App non trouv\xE9: ${config.twilioTwimlAppSid}`);
            }
          }
          console.log(`\u2705 Test connexion Twilio OK pour ${entity}`);
          return {
            success: true,
            message: "Connexion Twilio valid\xE9e avec succ\xE8s",
            details: {
              accountStatus: account.status,
              accountSid: config.twilioAccountSid,
              phoneNumber: phoneNumbers[0].phoneNumber,
              phoneNumberCapabilities: phoneNumbers[0].capabilities,
              twimlApp: appDetails,
              entity
            }
          };
        } catch (error) {
          console.error(`\u274C Test connexion Twilio \xE9chou\xE9 ${entity}:`, error);
          return {
            success: false,
            message: error.message || "Erreur inconnue lors du test",
            details: {
              code: error.code,
              status: error.status,
              moreInfo: error.moreInfo
            }
          };
        }
      }
      /**
       * Récupérer les features activées pour une entity
       * @param entity - Entity
       * @returns Features config
       */
      async getFeatures(entity) {
        const config = await db.query.phoneConfigurations.findFirst({
          where: eq7(phoneConfigurations.entity, entity)
        });
        if (!config) {
          throw new Error(`\u274C Configuration manquante pour ${entity}`);
        }
        return {
          recordingEnabled: config.recordingEnabled,
          transcriptionEnabled: config.transcriptionEnabled,
          aiAnalysisEnabled: config.aiAnalysisEnabled
        };
      }
    };
    twilioService = new TwilioService();
  }
});

// lib/config/countries-registry.ts
function getCountryConfig(countryCode) {
  const upperCode = countryCode.toUpperCase();
  return COUNTRIES_REGISTRY[upperCode] || null;
}
var COUNTRIES_REGISTRY;
var init_countries_registry = __esm({
  "lib/config/countries-registry.ts"() {
    "use strict";
    COUNTRIES_REGISTRY = {
      // FRANCE - Identifiant SIREN (9 chiffres) ou SIRET (14 chiffres)
      FR: {
        code: "FR",
        name: "France",
        identifierType: "SIREN/SIRET",
        identifierPattern: /^(\d{9}|\d{14})$/,
        identifierLabel: "N\xB0 SIREN (9 chiffres) ou SIRET (14 chiffres)",
        enrichmentProvider: "pappers",
        apiEndpoint: "https://api.pappers.fr/v2",
        requiresApiKey: true,
        fallbackToWeb: true
      },
      // BELGIQUE - Identifiant TVA (BE + 10 chiffres)
      BE: {
        code: "BE",
        name: "Belgique",
        identifierType: "VAT",
        identifierPattern: /^BE\d{10}$/,
        identifierLabel: "N\xB0 TVA belge (BE + 10 chiffres)",
        enrichmentProvider: "opencorporates",
        requiresApiKey: false,
        fallbackToWeb: true
      },
      // SUISSE - Identifiant IDE/CHE (CHE-XXX.XXX.XXX)
      CH: {
        code: "CH",
        name: "Suisse",
        identifierType: "CHE",
        identifierPattern: /^CHE-\d{3}\.\d{3}\.\d{3}$/,
        identifierLabel: "N\xB0 IDE suisse (CHE-XXX.XXX.XXX)",
        enrichmentProvider: "web_search",
        requiresApiKey: false,
        fallbackToWeb: false
      },
      // LUXEMBOURG - Identifiant RCS (1 lettre + 6 chiffres)
      LU: {
        code: "LU",
        name: "Luxembourg",
        identifierType: "RCS",
        identifierPattern: /^[A-Z]\d{6}$/,
        identifierLabel: "N\xB0 RCS luxembourgeois (1 lettre + 6 chiffres)",
        enrichmentProvider: "opencorporates",
        requiresApiKey: false,
        fallbackToWeb: true
      },
      // ROYAUME-UNI - Company Registration Number (8 chiffres)
      GB: {
        code: "GB",
        name: "Royaume-Uni",
        identifierType: "CRN",
        identifierPattern: /^\d{8}$/,
        identifierLabel: "Company Number UK (8 chiffres)",
        enrichmentProvider: "opencorporates",
        requiresApiKey: false,
        fallbackToWeb: true
      },
      // ALLEMAGNE - Handelsregister (HRB/HRA + nombre)
      DE: {
        code: "DE",
        name: "Allemagne",
        identifierType: "HRB",
        identifierPattern: /^HR[AB]\s?\d+$/,
        identifierLabel: "N\xB0 Handelsregister (HRB ou HRA)",
        enrichmentProvider: "opencorporates",
        requiresApiKey: false,
        fallbackToWeb: true
      },
      // ESPAGNE - CIF (1 lettre + 8 chiffres)
      ES: {
        code: "ES",
        name: "Espagne",
        identifierType: "CIF",
        identifierPattern: /^[A-Z]\d{8}$/,
        identifierLabel: "N\xB0 CIF espagnol (1 lettre + 8 chiffres)",
        enrichmentProvider: "opencorporates",
        requiresApiKey: false,
        fallbackToWeb: true
      },
      // ITALIE - Partita IVA (11 chiffres)
      IT: {
        code: "IT",
        name: "Italie",
        identifierType: "VAT",
        identifierPattern: /^\d{11}$/,
        identifierLabel: "Partita IVA (11 chiffres)",
        enrichmentProvider: "opencorporates",
        requiresApiKey: false,
        fallbackToWeb: true
      },
      // DOM-TOM - Guadeloupe (SIREN via Pappers)
      GP: {
        code: "GP",
        name: "Guadeloupe",
        identifierType: "SIREN",
        identifierPattern: /^\d{9}$/,
        identifierLabel: "N\xB0 SIREN (9 chiffres)",
        enrichmentProvider: "pappers",
        apiEndpoint: "https://api.pappers.fr/v2",
        requiresApiKey: true,
        fallbackToWeb: true
      },
      // DOM-TOM - Martinique (SIREN via Pappers)
      MQ: {
        code: "MQ",
        name: "Martinique",
        identifierType: "SIREN",
        identifierPattern: /^\d{9}$/,
        identifierLabel: "N\xB0 SIREN (9 chiffres)",
        enrichmentProvider: "pappers",
        apiEndpoint: "https://api.pappers.fr/v2",
        requiresApiKey: true,
        fallbackToWeb: true
      },
      // DOM-TOM - Guyane française (SIREN via Pappers)
      GF: {
        code: "GF",
        name: "Guyane",
        identifierType: "SIREN",
        identifierPattern: /^\d{9}$/,
        identifierLabel: "N\xB0 SIREN (9 chiffres)",
        enrichmentProvider: "pappers",
        apiEndpoint: "https://api.pappers.fr/v2",
        requiresApiKey: true,
        fallbackToWeb: true
      },
      // DOM-TOM - Réunion (SIREN via Pappers)
      RE: {
        code: "RE",
        name: "La R\xE9union",
        identifierType: "SIREN",
        identifierPattern: /^\d{9}$/,
        identifierLabel: "N\xB0 SIREN (9 chiffres)",
        enrichmentProvider: "pappers",
        apiEndpoint: "https://api.pappers.fr/v2",
        requiresApiKey: true,
        fallbackToWeb: true
      },
      // DOM-TOM - Mayotte (SIREN via Pappers)
      YT: {
        code: "YT",
        name: "Mayotte",
        identifierType: "SIREN",
        identifierPattern: /^\d{9}$/,
        identifierLabel: "N\xB0 SIREN (9 chiffres)",
        enrichmentProvider: "pappers",
        apiEndpoint: "https://api.pappers.fr/v2",
        requiresApiKey: true,
        fallbackToWeb: true
      }
    };
  }
});

// lib/utils/pappers-utils.ts
function extractProcedureType(procedures) {
  if (!procedures || procedures.length === 0) return void 0;
  const latest = procedures[procedures.length - 1];
  const typeMap = {
    "redressement_judiciaire": "RJ",
    "liquidation_judiciaire": "LJ",
    "sauvegarde": "Sauvegarde",
    "plan_continuation": "Plan",
    "plan_cession": "Plan"
  };
  return typeMap[latest.type] || "Autre";
}
function extractProcedureLibelle(procedures) {
  if (!procedures || procedures.length === 0) return void 0;
  const latest = procedures[procedures.length - 1];
  const libelleMap = {
    "redressement_judiciaire": "Redressement judiciaire",
    "liquidation_judiciaire": "Liquidation judiciaire",
    "sauvegarde": "Proc\xE9dure de sauvegarde",
    "plan_continuation": "Plan de continuation",
    "plan_cession": "Plan de cession"
  };
  return libelleMap[latest.type] || latest.type;
}
function extractProcedureDate(procedures) {
  if (!procedures || procedures.length === 0) return void 0;
  const latest = procedures[procedures.length - 1];
  return latest.date_debut;
}
function extractTribunal(procedures) {
  if (!procedures || procedures.length === 0) return void 0;
  const latest = procedures[procedures.length - 1];
  return latest.tribunal;
}
function formatFrenchPhone(phone) {
  if (!phone) return void 0;
  const cleaned = phone.replace(/[\s\-\.]/g, "");
  if (cleaned.startsWith("+33") && cleaned.length === 12) {
    return `+33 ${cleaned[3]} ${cleaned.substring(4, 6)} ${cleaned.substring(6, 8)} ${cleaned.substring(8, 10)} ${cleaned.substring(10, 12)}`;
  }
  if (cleaned.startsWith("0") && cleaned.length === 10) {
    return `+33 ${cleaned[1]} ${cleaned.substring(2, 4)} ${cleaned.substring(4, 6)} ${cleaned.substring(6, 8)} ${cleaned.substring(8, 10)}`;
  }
  return phone;
}
function extractEffectifMin(tranche) {
  if (!tranche) return void 0;
  const match = tranche.match(/^(\d+)-/);
  if (match) {
    return parseInt(match[1], 10);
  }
  const plusMatch = tranche.match(/^(\d+)\+/);
  if (plusMatch) {
    return parseInt(plusMatch[1], 10);
  }
  const numMatch = tranche.match(/^(\d+)/);
  if (numMatch) {
    return parseInt(numMatch[1], 10);
  }
  return void 0;
}
function extractEffectifMax(tranche) {
  if (!tranche) return void 0;
  const match = tranche.match(/-(\d+)/);
  if (match) {
    return parseInt(match[1], 10);
  }
  if (tranche.includes("+")) {
    return 999999;
  }
  return extractEffectifMin(tranche);
}
function formatEffectifFromNumber(effectif) {
  if (effectif === void 0 || effectif === null) return void 0;
  if (effectif === 0) return "0 salari\xE9";
  if (effectif === 1) return "1 salari\xE9";
  if (effectif < 3) return "1-2 salari\xE9s";
  if (effectif < 6) return "3-5 salari\xE9s";
  if (effectif < 10) return "6-9 salari\xE9s";
  if (effectif < 20) return "10-19 salari\xE9s";
  if (effectif < 50) return "20-49 salari\xE9s";
  if (effectif < 100) return "50-99 salari\xE9s";
  if (effectif < 200) return "100-199 salari\xE9s";
  if (effectif < 250) return "200-249 salari\xE9s";
  if (effectif < 500) return "250-499 salari\xE9s";
  if (effectif < 1e3) return "500-999 salari\xE9s";
  if (effectif < 2e3) return "1000-1999 salari\xE9s";
  if (effectif < 5e3) return "2000-4999 salari\xE9s";
  if (effectif < 1e4) return "5000-9999 salari\xE9s";
  return "10000+ salari\xE9s";
}
function getDepartmentFromPostalCode(postalCode) {
  if (!postalCode) return void 0;
  if (postalCode.startsWith("20")) {
    const thirdDigit = postalCode[2];
    if (thirdDigit <= "1") return "Corse-du-Sud (2A)";
    return "Haute-Corse (2B)";
  }
  if (postalCode.length === 5 && postalCode.startsWith("97")) {
    const code2 = postalCode.substring(0, 3);
    const deptMap2 = {
      "971": "Guadeloupe (971)",
      "972": "Martinique (972)",
      "973": "Guyane (973)",
      "974": "La R\xE9union (974)",
      "976": "Mayotte (976)"
    };
    return deptMap2[code2];
  }
  const code = postalCode.substring(0, 2);
  const deptMap = {
    "01": "Ain (01)",
    "13": "Bouches-du-Rh\xF4ne (13)",
    "33": "Gironde (33)",
    "59": "Nord (59)",
    "69": "Rh\xF4ne (69)",
    "75": "Paris (75)",
    "92": "Hauts-de-Seine (92)"
  };
  return deptMap[code] || `D\xE9partement ${code}`;
}
function getRegionFromPostalCode(postalCode) {
  if (!postalCode) return void 0;
  if (postalCode.startsWith("20")) {
    return "Corse";
  }
  if (postalCode.length === 5 && postalCode.startsWith("97")) {
    const code2 = postalCode.substring(0, 3);
    const regionMap2 = {
      "971": "Guadeloupe",
      "972": "Martinique",
      "973": "Guyane",
      "974": "La R\xE9union",
      "976": "Mayotte"
    };
    return regionMap2[code2];
  }
  const code = postalCode.substring(0, 2);
  const regionMap = {
    "01": "Auvergne-Rh\xF4ne-Alpes",
    "13": "Provence-Alpes-C\xF4te d'Azur",
    "33": "Nouvelle-Aquitaine",
    "59": "Hauts-de-France",
    "69": "Auvergne-Rh\xF4ne-Alpes",
    "75": "\xCEle-de-France",
    "92": "\xCEle-de-France"
  };
  return regionMap[code];
}
var init_pappers_utils = __esm({
  "lib/utils/pappers-utils.ts"() {
    "use strict";
  }
});

// lib/utils/insee-utils.ts
function calculateFrenchTVA(siren) {
  const sirenNum = parseInt(siren, 10);
  const key = (12 + 3 * (sirenNum % 97)) % 97;
  return `FR${key.toString().padStart(2, "0")}${siren}`;
}
function getDepartmentName(postalCode) {
  if (!postalCode) return void 0;
  if (postalCode.startsWith("20")) {
    const thirdDigit = postalCode[2];
    if (thirdDigit <= "1") return DEPARTMENTS["2A"];
    return DEPARTMENTS["2B"];
  }
  if (postalCode.length === 5 && postalCode.startsWith("97")) {
    const code2 = postalCode.substring(0, 3);
    return DEPARTMENTS[code2];
  }
  const code = postalCode.substring(0, 2);
  return DEPARTMENTS[code] || `D\xE9partement ${code}`;
}
function getRegionFromPostalCode2(postalCode) {
  if (!postalCode) return void 0;
  if (postalCode.startsWith("20")) {
    return "Corse";
  }
  if (postalCode.length === 5 && postalCode.startsWith("97")) {
    const code2 = postalCode.substring(0, 3);
    return DEPARTMENT_TO_REGION[code2];
  }
  const code = postalCode.substring(0, 2);
  return DEPARTMENT_TO_REGION[code];
}
function getLegalFormLabel(code) {
  if (!code) return void 0;
  return LEGAL_FORMS[code] || `Forme juridique ${code}`;
}
function getEffectifMin(tranche) {
  if (!tranche) return void 0;
  const mapping = {
    "00": 0,
    "01": 1,
    "02": 3,
    "03": 6,
    "11": 10,
    "12": 20,
    "21": 50,
    "22": 100,
    "31": 200,
    "32": 250,
    "41": 500,
    "42": 1e3,
    "51": 2e3,
    "52": 5e3,
    "53": 1e4
  };
  return mapping[tranche];
}
function getEffectifMax(tranche) {
  if (!tranche) return void 0;
  const mapping = {
    "00": 0,
    "01": 2,
    "02": 5,
    "03": 9,
    "11": 19,
    "12": 49,
    "21": 99,
    "22": 199,
    "31": 249,
    "32": 499,
    "41": 999,
    "42": 1999,
    "51": 4999,
    "52": 9999,
    "53": 999999
    // Infini
  };
  return mapping[tranche];
}
function formatEffectif(tranche) {
  if (!tranche) return void 0;
  const mapping = {
    "00": "0 salari\xE9",
    "01": "1-2 salari\xE9s",
    "02": "3-5 salari\xE9s",
    "03": "6-9 salari\xE9s",
    "11": "10-19 salari\xE9s",
    "12": "20-49 salari\xE9s",
    "21": "50-99 salari\xE9s",
    "22": "100-199 salari\xE9s",
    "31": "200-249 salari\xE9s",
    "32": "250-499 salari\xE9s",
    "41": "500-999 salari\xE9s",
    "42": "1000-1999 salari\xE9s",
    "51": "2000-4999 salari\xE9s",
    "52": "5000-9999 salari\xE9s",
    "53": "10000+ salari\xE9s"
  };
  return mapping[tranche];
}
var DEPARTMENTS, DEPARTMENT_TO_REGION, LEGAL_FORMS;
var init_insee_utils = __esm({
  "lib/utils/insee-utils.ts"() {
    "use strict";
    DEPARTMENTS = {
      "01": "Ain (01)",
      "02": "Aisne (02)",
      "03": "Allier (03)",
      "04": "Alpes-de-Haute-Provence (04)",
      "05": "Hautes-Alpes (05)",
      "06": "Alpes-Maritimes (06)",
      "07": "Ard\xE8che (07)",
      "08": "Ardennes (08)",
      "09": "Ari\xE8ge (09)",
      "10": "Aube (10)",
      "11": "Aude (11)",
      "12": "Aveyron (12)",
      "13": "Bouches-du-Rh\xF4ne (13)",
      "14": "Calvados (14)",
      "15": "Cantal (15)",
      "16": "Charente (16)",
      "17": "Charente-Maritime (17)",
      "18": "Cher (18)",
      "19": "Corr\xE8ze (19)",
      "21": "C\xF4te-d'Or (21)",
      "22": "C\xF4tes-d'Armor (22)",
      "23": "Creuse (23)",
      "24": "Dordogne (24)",
      "25": "Doubs (25)",
      "26": "Dr\xF4me (26)",
      "27": "Eure (27)",
      "28": "Eure-et-Loir (28)",
      "29": "Finist\xE8re (29)",
      "2A": "Corse-du-Sud (2A)",
      "2B": "Haute-Corse (2B)",
      "30": "Gard (30)",
      "31": "Haute-Garonne (31)",
      "32": "Gers (32)",
      "33": "Gironde (33)",
      "34": "H\xE9rault (34)",
      "35": "Ille-et-Vilaine (35)",
      "36": "Indre (36)",
      "37": "Indre-et-Loire (37)",
      "38": "Is\xE8re (38)",
      "39": "Jura (39)",
      "40": "Landes (40)",
      "41": "Loir-et-Cher (41)",
      "42": "Loire (42)",
      "43": "Haute-Loire (43)",
      "44": "Loire-Atlantique (44)",
      "45": "Loiret (45)",
      "46": "Lot (46)",
      "47": "Lot-et-Garonne (47)",
      "48": "Loz\xE8re (48)",
      "49": "Maine-et-Loire (49)",
      "50": "Manche (50)",
      "51": "Marne (51)",
      "52": "Haute-Marne (52)",
      "53": "Mayenne (53)",
      "54": "Meurthe-et-Moselle (54)",
      "55": "Meuse (55)",
      "56": "Morbihan (56)",
      "57": "Moselle (57)",
      "58": "Ni\xE8vre (58)",
      "59": "Nord (59)",
      "60": "Oise (60)",
      "61": "Orne (61)",
      "62": "Pas-de-Calais (62)",
      "63": "Puy-de-D\xF4me (63)",
      "64": "Pyr\xE9n\xE9es-Atlantiques (64)",
      "65": "Hautes-Pyr\xE9n\xE9es (65)",
      "66": "Pyr\xE9n\xE9es-Orientales (66)",
      "67": "Bas-Rhin (67)",
      "68": "Haut-Rhin (68)",
      "69": "Rh\xF4ne (69)",
      "70": "Haute-Sa\xF4ne (70)",
      "71": "Sa\xF4ne-et-Loire (71)",
      "72": "Sarthe (72)",
      "73": "Savoie (73)",
      "74": "Haute-Savoie (74)",
      "75": "Paris (75)",
      "76": "Seine-Maritime (76)",
      "77": "Seine-et-Marne (77)",
      "78": "Yvelines (78)",
      "79": "Deux-S\xE8vres (79)",
      "80": "Somme (80)",
      "81": "Tarn (81)",
      "82": "Tarn-et-Garonne (82)",
      "83": "Var (83)",
      "84": "Vaucluse (84)",
      "85": "Vend\xE9e (85)",
      "86": "Vienne (86)",
      "87": "Haute-Vienne (87)",
      "88": "Vosges (88)",
      "89": "Yonne (89)",
      "90": "Territoire de Belfort (90)",
      "91": "Essonne (91)",
      "92": "Hauts-de-Seine (92)",
      "93": "Seine-Saint-Denis (93)",
      "94": "Val-de-Marne (94)",
      "95": "Val-d'Oise (95)",
      "971": "Guadeloupe (971)",
      "972": "Martinique (972)",
      "973": "Guyane (973)",
      "974": "La R\xE9union (974)",
      "976": "Mayotte (976)"
    };
    DEPARTMENT_TO_REGION = {
      "01": "Auvergne-Rh\xF4ne-Alpes",
      "03": "Auvergne-Rh\xF4ne-Alpes",
      "07": "Auvergne-Rh\xF4ne-Alpes",
      "15": "Auvergne-Rh\xF4ne-Alpes",
      "26": "Auvergne-Rh\xF4ne-Alpes",
      "38": "Auvergne-Rh\xF4ne-Alpes",
      "42": "Auvergne-Rh\xF4ne-Alpes",
      "43": "Auvergne-Rh\xF4ne-Alpes",
      "63": "Auvergne-Rh\xF4ne-Alpes",
      "69": "Auvergne-Rh\xF4ne-Alpes",
      "73": "Auvergne-Rh\xF4ne-Alpes",
      "74": "Auvergne-Rh\xF4ne-Alpes",
      "21": "Bourgogne-Franche-Comt\xE9",
      "25": "Bourgogne-Franche-Comt\xE9",
      "39": "Bourgogne-Franche-Comt\xE9",
      "58": "Bourgogne-Franche-Comt\xE9",
      "70": "Bourgogne-Franche-Comt\xE9",
      "71": "Bourgogne-Franche-Comt\xE9",
      "89": "Bourgogne-Franche-Comt\xE9",
      "90": "Bourgogne-Franche-Comt\xE9",
      "22": "Bretagne",
      "29": "Bretagne",
      "35": "Bretagne",
      "56": "Bretagne",
      "18": "Centre-Val de Loire",
      "28": "Centre-Val de Loire",
      "36": "Centre-Val de Loire",
      "37": "Centre-Val de Loire",
      "41": "Centre-Val de Loire",
      "45": "Centre-Val de Loire",
      "2A": "Corse",
      "2B": "Corse",
      "08": "Grand Est",
      "10": "Grand Est",
      "51": "Grand Est",
      "52": "Grand Est",
      "54": "Grand Est",
      "55": "Grand Est",
      "57": "Grand Est",
      "67": "Grand Est",
      "68": "Grand Est",
      "88": "Grand Est",
      "02": "Hauts-de-France",
      "59": "Hauts-de-France",
      "60": "Hauts-de-France",
      "62": "Hauts-de-France",
      "80": "Hauts-de-France",
      "75": "\xCEle-de-France",
      "77": "\xCEle-de-France",
      "78": "\xCEle-de-France",
      "91": "\xCEle-de-France",
      "92": "\xCEle-de-France",
      "93": "\xCEle-de-France",
      "94": "\xCEle-de-France",
      "95": "\xCEle-de-France",
      "14": "Normandie",
      "27": "Normandie",
      "50": "Normandie",
      "61": "Normandie",
      "76": "Normandie",
      "16": "Nouvelle-Aquitaine",
      "17": "Nouvelle-Aquitaine",
      "19": "Nouvelle-Aquitaine",
      "23": "Nouvelle-Aquitaine",
      "24": "Nouvelle-Aquitaine",
      "33": "Nouvelle-Aquitaine",
      "40": "Nouvelle-Aquitaine",
      "47": "Nouvelle-Aquitaine",
      "64": "Nouvelle-Aquitaine",
      "79": "Nouvelle-Aquitaine",
      "86": "Nouvelle-Aquitaine",
      "87": "Nouvelle-Aquitaine",
      "09": "Occitanie",
      "11": "Occitanie",
      "12": "Occitanie",
      "30": "Occitanie",
      "31": "Occitanie",
      "32": "Occitanie",
      "34": "Occitanie",
      "46": "Occitanie",
      "48": "Occitanie",
      "65": "Occitanie",
      "66": "Occitanie",
      "81": "Occitanie",
      "82": "Occitanie",
      "44": "Pays de la Loire",
      "49": "Pays de la Loire",
      "53": "Pays de la Loire",
      "72": "Pays de la Loire",
      "85": "Pays de la Loire",
      "04": "Provence-Alpes-C\xF4te d'Azur",
      "05": "Provence-Alpes-C\xF4te d'Azur",
      "06": "Provence-Alpes-C\xF4te d'Azur",
      "13": "Provence-Alpes-C\xF4te d'Azur",
      "83": "Provence-Alpes-C\xF4te d'Azur",
      "84": "Provence-Alpes-C\xF4te d'Azur",
      "971": "Guadeloupe",
      "972": "Martinique",
      "973": "Guyane",
      "974": "La R\xE9union",
      "976": "Mayotte"
    };
    LEGAL_FORMS = {
      "1000": "Entrepreneur individuel",
      "2110": "Indivision",
      "2120": "Soci\xE9t\xE9 cr\xE9\xE9e de fait",
      "2210": "Soci\xE9t\xE9 en participation",
      "2220": "Soci\xE9t\xE9 en participation de professions lib\xE9rales",
      "2310": "Soci\xE9t\xE9 civile",
      "2320": "Soci\xE9t\xE9 civile de construction-vente",
      "2385": "Soci\xE9t\xE9 civile coop\xE9rative de construction",
      "2900": "Autre soci\xE9t\xE9 civile",
      "3110": "Soci\xE9t\xE9 en nom collectif",
      "3120": "Soci\xE9t\xE9 en nom collectif coop\xE9rative",
      "3205": "Soci\xE9t\xE9 en commandite simple",
      "3210": "Soci\xE9t\xE9 en commandite simple coop\xE9rative",
      "3220": "Soci\xE9t\xE9 en commandite par actions",
      "3290": "Autre soci\xE9t\xE9 en commandite",
      "4110": "Soci\xE9t\xE9 \xE0 responsabilit\xE9 limit\xE9e (SARL)",
      "4120": "SARL coop\xE9rative",
      "5202": "Soci\xE9t\xE9 par actions \xE0 responsabilit\xE9 limit\xE9e (SARL)",
      "5203": "SARL d'\xE9conomie mixte",
      "5306": "Soci\xE9t\xE9 par actions simplifi\xE9e (SAS)",
      "5307": "SAS coop\xE9rative",
      "5308": "Soci\xE9t\xE9 par actions simplifi\xE9e unipersonnelle (SASU)",
      "5410": "Soci\xE9t\xE9 anonyme (SA)",
      "5415": "SA coop\xE9rative",
      "5422": "SA d'\xE9conomie mixte",
      "5426": "SA d'HLM",
      "5498": "SA de cr\xE9dit immobilier",
      "5499": "Autre SA",
      "5505": "Soci\xE9t\xE9 d'exercice lib\xE9ral \xE0 responsabilit\xE9 limit\xE9e (SELARL)",
      "5510": "Soci\xE9t\xE9 d'exercice lib\xE9ral par actions simplifi\xE9e (SELAS)",
      "5515": "Soci\xE9t\xE9 d'exercice lib\xE9ral \xE0 forme anonyme (SELAFA)",
      "5520": "Soci\xE9t\xE9 d'exercice lib\xE9ral en commandite par actions (SELCA)",
      "5599": "Autre soci\xE9t\xE9 d'exercice lib\xE9ral",
      "5642": "SA de HLM pour personnes \xE2g\xE9es",
      "5643": "SA de HLM pour personnes handicap\xE9es",
      "5647": "SA coop\xE9rative de production HLM",
      "5710": "SAS europ\xE9enne",
      "5720": "Soci\xE9t\xE9 europ\xE9enne",
      "6100": "Caisse d'\xE9pargne et de pr\xE9voyance",
      "6210": "Groupement europ\xE9en d'int\xE9r\xEAt \xE9conomique (GEIE)",
      "6220": "Groupement d'int\xE9r\xEAt \xE9conomique (GIE)",
      "6316": "Coop\xE9rative d'utilisation de mat\xE9riel agricole",
      "6317": "Coop\xE9rative agricole",
      "6318": "Union de coop\xE9ratives agricoles",
      "6540": "Soci\xE9t\xE9 coop\xE9rative de production (SCOP)",
      "7111": "Autorit\xE9 administrative ou publique",
      "7112": "Collectivit\xE9 territoriale",
      "7113": "\xC9tablissement public administratif",
      "7120": "\xC9tablissement public industriel et commercial",
      "7160": "\xC9tablissement public",
      "7210": "Syndicat de communes",
      "7220": "District",
      "7225": "Communaut\xE9 urbaine",
      "7229": "Autre \xE9tablissement public de coop\xE9ration intercommunale",
      "7230": "Institution interd\xE9partementale",
      "7312": "Chambre de commerce et d'industrie",
      "7313": "Chambre d'agriculture",
      "7314": "Chambre de m\xE9tiers",
      "9150": "Autre association d\xE9clar\xE9e",
      "9210": "Association non d\xE9clar\xE9e",
      "9220": "Congr\xE9gation",
      "9230": "Association d\xE9clar\xE9e d'insertion par l'\xE9conomique",
      "9240": "Association interm\xE9diaire",
      "9260": "Association d\xE9clar\xE9e entreprise d'insertion",
      "9900": "Autre personne morale de droit priv\xE9"
    };
  }
});

// lib/services/enrichment/pappers-provider.ts
var pappers_provider_exports = {};
__export(pappers_provider_exports, {
  PappersProvider: () => PappersProvider
});
import axios from "axios";
var PappersProvider;
var init_pappers_provider = __esm({
  "lib/services/enrichment/pappers-provider.ts"() {
    "use strict";
    init_storage();
    init_pappers_utils();
    init_insee_utils();
    PappersProvider = class {
      name = "pappers";
      apiKey;
      baseUrl = "https://api.pappers.fr/v2";
      cacheExpirationDays = 30;
      constructor() {
        this.apiKey = process.env.PAPPERS_API_KEY || "";
        if (!this.apiKey) {
          console.warn("[PappersProvider] \u26A0\uFE0F PAPPERS_API_KEY non configur\xE9e");
        }
      }
      /**
       * Enrichir une entreprise française via SIREN ou SIRET
       */
      async enrichCompany(identifier, countryCode, companyName) {
        if (countryCode !== "FR") {
          console.warn(`[PappersProvider] \u26A0\uFE0F Pappers ne supporte que la France, re\xE7u: ${countryCode}`);
          return null;
        }
        const cleanIdentifier = identifier.replace(/[\s-]/g, "");
        const isSiren = cleanIdentifier.length === 9;
        const isSiret = cleanIdentifier.length === 14;
        if (!isSiren && !isSiret) {
          console.warn(`[PappersProvider] \u26A0\uFE0F Format invalide: ${cleanIdentifier} (attendu: 9 ou 14 chiffres)`);
          return null;
        }
        const identifierType = isSiren ? "siren" : "siret";
        console.log(`[PappersProvider] \u{1F50D} Enrichissement ${identifierType.toUpperCase()}: ${cleanIdentifier}`);
        try {
          const cachedData = await this.getFromCache(cleanIdentifier, identifierType);
          if (cachedData) {
            console.log(`[PappersProvider] \u2705 Cache HIT pour ${cleanIdentifier}`);
            return cachedData;
          }
          console.log(`[PappersProvider] \u274C Cache MISS pour ${cleanIdentifier} - Appel API`);
          const apiData = await this.callPappersApi(cleanIdentifier, identifierType);
          if (!apiData) {
            return null;
          }
          const enrichedData = this.transformPappersData(apiData, cleanIdentifier, identifierType);
          await this.saveToCache(cleanIdentifier, identifierType, apiData);
          return enrichedData;
        } catch (error) {
          console.error(`[PappersProvider] \u274C Erreur enrichissement ${cleanIdentifier}:`, error);
          if (axios.isAxiosError(error)) {
            const axiosError = error;
            if (axiosError.response?.status === 404) {
              console.log(`[PappersProvider] \u2139\uFE0F Entreprise ${cleanIdentifier} non trouv\xE9e`);
              return null;
            }
            if (axiosError.response?.status === 401) {
              console.error("[PappersProvider] \u274C API Key invalide ou expir\xE9e");
            }
          }
          throw error;
        }
      }
      /**
       * Appeler l'API Pappers
       * Note: L'API Pappers utilise TOUJOURS /v2/entreprise (pas /v2/etablissement)
       * On peut passer soit siren=XXX soit siret=XXX sur ce même endpoint
       */
      async callPappersApi(identifier, identifierType) {
        if (!this.apiKey) {
          throw new Error("PAPPERS_API_KEY non configur\xE9e");
        }
        const endpoint = "/entreprise";
        const paramName = identifierType === "siren" ? "siren" : "siret";
        try {
          const response = await axios.get(
            `${this.baseUrl}${endpoint}`,
            {
              params: {
                api_token: this.apiKey,
                [paramName]: identifier
              },
              timeout: 1e4
              // 10 secondes
            }
          );
          return response.data;
        } catch (error) {
          if (axios.isAxiosError(error) && error.response?.status === 404) {
            return null;
          }
          throw error;
        }
      }
      /**
       * Transformer les données Pappers en format CompanyEnrichmentData (Phase 2.8 : enrichissement complet)
       */
      transformPappersData(apiData, identifier, identifierType) {
        const siege = apiData.siege;
        const entreprise = apiData.entreprise;
        const procedures = apiData.procedures_collectives;
        let adresse;
        if (siege?.adresse || siege?.adresse_ligne_1) {
          const codePostal = siege.code_postal || "";
          adresse = {
            adresse: siege.adresse_ligne_1 || siege.adresse || "",
            adresseLigne2: siege.adresse_ligne_2,
            codePostal,
            ville: siege.ville || "",
            commune: siege.commune || siege.ville,
            department: getDepartmentFromPostalCode(codePostal),
            region: getRegionFromPostalCode(codePostal),
            pays: siege.pays || "France",
            complementAddress: siege.complement_adresse,
            latitude: siege.latitude,
            longitude: siege.longitude
          };
        }
        const dirigeants = (apiData.representants || []).filter((r) => r.nom || r.nom_complet).map((r) => ({
          nom: r.nom || r.nom_complet || "",
          prenom: r.prenom,
          fonction: r.qualite || "Dirigeant",
          dateNaissance: r.date_naissance
        }));
        const trancheEffectif = siege?.tranche_effectif_entreprise;
        const effectifNumber = siege?.effectif;
        const siren = identifierType === "siren" ? identifier : identifier.substring(0, 9);
        const hasProcedure = procedures && procedures.length > 0;
        const procedureActive = siege?.procedure_collective === true || hasProcedure;
        let qualityScore = 50;
        if (siege?.denomination || siege?.nom_entreprise) qualityScore += 10;
        if (adresse) qualityScore += 10;
        if (dirigeants.length > 0) qualityScore += 15;
        if (siege?.forme_juridique) qualityScore += 5;
        if (siege?.code_naf) qualityScore += 5;
        if (effectifNumber !== void 0) qualityScore += 5;
        if (siege?.telephone || siege?.email || siege?.site_internet) qualityScore += 10;
        return {
          // Données de base
          // Fallback: siege.* > entreprise.* > champs racines (entrepreneur individuel)
          nom: siege?.denomination || siege?.nom_entreprise || entreprise?.denomination || entreprise?.nom_entreprise || apiData.nom_entreprise || "",
          nomCommercial: siege?.nom_commercial || siege?.enseigne,
          // Phase 2.8
          formeJuridique: siege?.forme_juridique_code || siege?.forme_juridique || entreprise?.forme_juridique,
          formeJuridiqueLibelle: getLegalFormLabel(siege?.forme_juridique_code) || siege?.forme_juridique,
          // Phase 2.8
          capital: siege?.capital || entreprise?.capital,
          dateCreation: siege?.date_creation || entreprise?.date_creation,
          // Identifiants
          identifiantNational: identifierType === "siren" ? siege?.siren || entreprise?.siren || identifier : siege?.siret || identifier,
          identifiantNationalType: identifierType === "siren" ? "SIREN" : "SIRET",
          numeroTVA: siege?.numero_tva_intracommunautaire || calculateFrenchTVA(siren),
          // Phase 2.8
          // Adresse complète Phase 2.8
          adresse,
          // Phase 2.8 : Coordonnées complètes
          telephone: formatFrenchPhone(siege?.telephone),
          email: siege?.email,
          siteWeb: siege?.site_internet,
          // Dirigeants
          dirigeants: dirigeants.length > 0 ? dirigeants : void 0,
          // Données financières Phase 2.8
          effectif: effectifNumber,
          effectifMin: extractEffectifMin(trancheEffectif),
          effectifMax: extractEffectifMax(trancheEffectif),
          effectifTexte: trancheEffectif || formatEffectifFromNumber(effectifNumber),
          chiffreAffaires: siege?.chiffre_affaires,
          resultatNet: siege?.resultat,
          // Activité
          codeNAF: siege?.code_naf,
          libelleNAF: siege?.libelle_code_naf,
          secteurActivite: siege?.domaine_activite,
          // Phase 2.8 : État administratif
          etatAdministratif: siege?.statut_rcs === "Radi\xE9" ? "Cess\xE9" : "Actif",
          dateCessation: siege?.date_cessation || siege?.date_radiation,
          // Phase 2.8 : Alertes juridiques (RJ/LJ)
          procedureCollective: procedureActive,
          procedureType: procedureActive ? extractProcedureType(procedures) : void 0,
          procedureTypeLibelle: procedureActive ? extractProcedureLibelle(procedures) : void 0,
          procedureDate: procedureActive ? extractProcedureDate(procedures) : void 0,
          tribunalCommerce: procedureActive ? extractTribunal(procedures) : void 0,
          // Métadonnées
          source: "pappers",
          dateEnrichissement: (/* @__PURE__ */ new Date()).toISOString(),
          qualityScore
        };
      }
      /**
       * Récupérer depuis le cache (30 jours)
       */
      async getFromCache(identifier, identifierType) {
        try {
          const cached = await storage.getPappersCache(identifier, identifierType);
          if (!cached) {
            return null;
          }
          const apiData = cached.apiResponse;
          return this.transformPappersData(apiData, identifier, identifierType);
        } catch (error) {
          console.error("[PappersProvider] \u274C Erreur lecture cache:", error);
          return null;
        }
      }
      /**
       * Sauvegarder dans le cache (30 jours)
       */
      async saveToCache(identifier, identifierType, apiData) {
        try {
          const expiresAt = /* @__PURE__ */ new Date();
          expiresAt.setDate(expiresAt.getDate() + this.cacheExpirationDays);
          await storage.createPappersCache({
            identifier,
            identifierType,
            apiResponse: apiData,
            // JSONB
            expiresAt
          });
          console.log(`[PappersProvider] \u{1F4BE} Cache sauvegard\xE9 pour ${identifier} (expire: ${expiresAt.toISOString()})`);
        } catch (error) {
          console.error("[PappersProvider] \u274C Erreur sauvegarde cache:", error);
        }
      }
      /**
       * Nettoyer le cache expiré (à appeler périodiquement)
       */
      async cleanExpiredCache() {
        try {
          await storage.cleanExpiredCache();
          console.log("[PappersProvider] \u{1F9F9} Cache expir\xE9 nettoy\xE9");
        } catch (error) {
          console.error("[PappersProvider] \u274C Erreur nettoyage cache:", error);
        }
      }
    };
  }
});

// lib/services/enrichment/insee-provider.ts
import axios2 from "axios";
var INSEEProvider;
var init_insee_provider = __esm({
  "lib/services/enrichment/insee-provider.ts"() {
    "use strict";
    init_insee_utils();
    INSEEProvider = class {
      name = "insee";
      apiKey;
      baseUrl = "https://api.insee.fr/entreprises/sirene/V3";
      constructor() {
        this.apiKey = process.env.INSEE_API_KEY || "";
        if (!this.apiKey) {
          console.warn("[INSEEProvider] \u26A0\uFE0F INSEE_API_KEY non configur\xE9e - provider d\xE9sactiv\xE9");
        }
      }
      /**
       * Enrichir une entreprise française via SIREN ou SIRET (GRATUIT)
       */
      async enrichCompany(identifier, countryCode, companyName) {
        if (countryCode !== "FR") {
          console.warn(`[INSEEProvider] \u26A0\uFE0F INSEE ne supporte que la France, re\xE7u: ${countryCode}`);
          return null;
        }
        if (!this.apiKey) {
          console.warn("[INSEEProvider] \u26A0\uFE0F Pas d'API key INSEE, skip provider");
          return null;
        }
        if (!this.isValidSirenSiret(identifier)) {
          console.warn(`[INSEEProvider] \u26A0\uFE0F SIREN/SIRET invalide (Luhn check failed): ${identifier}`);
          return null;
        }
        const isSiren = identifier.length === 9;
        const endpoint = isSiren ? "siren" : "siret";
        console.log(`[INSEEProvider] \u{1F50D} Enrichissement ${endpoint.toUpperCase()} via INSEE (GRATUIT): ${identifier}`);
        try {
          const response = await axios2.get(
            `${this.baseUrl}/${endpoint}/${identifier}`,
            {
              headers: {
                "Authorization": `Bearer ${this.apiKey}`,
                "Accept": "application/json"
              },
              timeout: 5e3
            }
          );
          if (response.data.header.statut !== 200) {
            console.warn(`[INSEEProvider] \u26A0\uFE0F INSEE statut ${response.data.header.statut}: ${response.data.header.message}`);
            return null;
          }
          const mapped = isSiren ? this.mapSirenToCompanyData(response.data, identifier) : this.mapSiretToCompanyData(response.data, identifier);
          console.log(`[INSEEProvider] \u2705 Enrichissement INSEE r\xE9ussi: ${mapped.nom}`);
          return mapped;
        } catch (error) {
          if (axios2.isAxiosError(error)) {
            const axiosError = error;
            if (axiosError.response?.status === 404) {
              console.log(`[INSEEProvider] \u{1F504} 404 INSEE pour ${identifier} \u2192 Fallback Pappers`);
              return null;
            }
            console.error(`[INSEEProvider] \u274C Erreur API INSEE ${axiosError.response?.status}:`, axiosError.message);
            return null;
          }
          console.error("[INSEEProvider] \u274C Erreur inattendue:", error);
          return null;
        }
      }
      /**
       * Validation SIREN/SIRET avec algorithme de Luhn
       * SIREN : 9 chiffres
       * SIRET : 14 chiffres (SIREN + NIC)
       */
      isValidSirenSiret(identifier) {
        if (identifier.length === 9) {
          return /^\d{9}$/.test(identifier) && this.luhnCheck(identifier);
        }
        if (identifier.length === 14) {
          const siren = identifier.substring(0, 9);
          return /^\d{14}$/.test(identifier) && this.luhnCheck(siren);
        }
        return false;
      }
      /**
       * Algorithme de Luhn pour valider un SIREN
       */
      luhnCheck(siren) {
        let sum3 = 0;
        for (let i = 0; i < siren.length; i++) {
          let digit = parseInt(siren[i]);
          if (i % 2 === 1) {
            digit *= 2;
            if (digit > 9) {
              digit -= 9;
            }
          }
          sum3 += digit;
        }
        return sum3 % 10 === 0;
      }
      /**
       * Mapper données INSEE SIREN → format CompanyEnrichmentData (Phase 2.8)
       */
      mapSirenToCompanyData(data, siren) {
        const unite = data.uniteLegale;
        const trancheEffectif = unite.trancheEffectifsUniteLegale;
        return {
          // Données de base
          nom: this.getNomEntreprise(unite),
          nomCommercial: void 0,
          formeJuridique: unite.categorieJuridiqueUniteLegale,
          formeJuridiqueLibelle: getLegalFormLabel(unite.categorieJuridiqueUniteLegale),
          // Phase 2.8
          capital: void 0,
          dateCreation: unite.dateCreationUniteLegale,
          // Identifiants
          identifiantNational: siren,
          identifiantNationalType: "SIREN",
          numeroTVA: calculateFrenchTVA(siren),
          // Phase 2.8
          // Adresse (vide pour SIREN car pas d'établissement spécifique)
          adresse: void 0,
          // Coordonnées Phase 2.8 (INSEE ne fournit pas)
          telephone: void 0,
          email: void 0,
          siteWeb: void 0,
          // Dirigeants (INSEE ne fournit pas)
          dirigeants: [],
          // Données financières Phase 2.8
          effectif: this.mapEffectif(trancheEffectif),
          effectifMin: getEffectifMin(trancheEffectif),
          effectifMax: getEffectifMax(trancheEffectif),
          effectifTexte: formatEffectif(trancheEffectif),
          chiffreAffaires: void 0,
          resultatNet: void 0,
          // Activité
          codeNAF: unite.activitePrincipaleUniteLegale,
          libelleNAF: void 0,
          secteurActivite: unite.activitePrincipaleUniteLegale,
          // État administratif Phase 2.8
          etatAdministratif: unite.etatAdministratifUniteLegale === "C" ? "Cess\xE9" : "Actif",
          dateCessation: unite.dateFin,
          // Alertes juridiques Phase 2.8 (INSEE ne fournit pas)
          procedureCollective: false,
          procedureType: void 0,
          procedureTypeLibelle: void 0,
          procedureDate: void 0,
          tribunalCommerce: void 0,
          // Métadonnées
          source: "insee",
          dateEnrichissement: (/* @__PURE__ */ new Date()).toISOString(),
          qualityScore: 70
          // INSEE = données officielles mais limitées
        };
      }
      /**
       * Mapper données INSEE SIRET → format CompanyEnrichmentData (Phase 2.8 : enrichissement complet)
       */
      mapSiretToCompanyData(data, siret) {
        const etab = data.etablissement;
        const unite = etab.uniteLegale;
        const trancheEffectif = etab.trancheEffectifsEtablissement || unite.trancheEffectifsUniteLegale;
        let adresse;
        if (etab.adresseEtablissement) {
          const codePostal = etab.adresseEtablissement.codePostalEtablissement || "";
          adresse = {
            adresse: this.formatAdresse(etab.adresseEtablissement),
            codePostal,
            ville: etab.adresseEtablissement.libelleCommuneEtablissement || "",
            commune: etab.adresseEtablissement.libelleCommuneEtablissement,
            department: getDepartmentName(codePostal),
            region: getRegionFromPostalCode2(codePostal),
            pays: "France",
            complementAddress: etab.adresseEtablissement.complementAdresseEtablissement,
            latitude: etab.adresseEtablissement.latitude,
            longitude: etab.adresseEtablissement.longitude
          };
        }
        const siren = siret.substring(0, 9);
        return {
          // Données de base
          nom: this.getNomEntreprise(unite),
          nomCommercial: void 0,
          // INSEE ne fournit pas
          formeJuridique: unite.categorieJuridiqueUniteLegale,
          formeJuridiqueLibelle: getLegalFormLabel(unite.categorieJuridiqueUniteLegale),
          // Phase 2.8
          capital: void 0,
          // INSEE ne fournit pas
          dateCreation: etab.dateCreationEtablissement || unite.dateCreationUniteLegale,
          // Identifiants
          identifiantNational: siret,
          identifiantNationalType: "SIRET",
          numeroTVA: calculateFrenchTVA(siren),
          // Phase 2.8
          // Adresse complète Phase 2.8
          adresse,
          // Coordonnées Phase 2.8 (INSEE ne fournit pas)
          telephone: void 0,
          email: void 0,
          siteWeb: void 0,
          // Dirigeants (INSEE ne fournit pas)
          dirigeants: [],
          // Données financières Phase 2.8
          effectif: this.mapEffectif(trancheEffectif),
          effectifMin: getEffectifMin(trancheEffectif),
          effectifMax: getEffectifMax(trancheEffectif),
          effectifTexte: formatEffectif(trancheEffectif),
          chiffreAffaires: void 0,
          resultatNet: void 0,
          // Activité
          codeNAF: etab.activitePrincipaleEtablissement || unite.activitePrincipaleUniteLegale,
          libelleNAF: void 0,
          // INSEE ne fournit que le code
          secteurActivite: etab.activitePrincipaleEtablissement || unite.activitePrincipaleUniteLegale,
          // État administratif Phase 2.8
          etatAdministratif: etab.etatAdministratifEtablissement === "F" ? "Cess\xE9" : "Actif",
          dateCessation: unite.dateFin,
          // Alertes juridiques Phase 2.8 (INSEE ne fournit pas de détails)
          procedureCollective: false,
          procedureType: void 0,
          procedureTypeLibelle: void 0,
          procedureDate: void 0,
          tribunalCommerce: void 0,
          // Métadonnées
          source: "insee",
          dateEnrichissement: (/* @__PURE__ */ new Date()).toISOString(),
          qualityScore: 75
          // INSEE SIRET = plus complet que SIREN
        };
      }
      /**
       * Extraire le nom de l'entreprise
       */
      getNomEntreprise(unite) {
        if (unite.denominationUniteLegale) {
          return unite.denominationUniteLegale;
        }
        if (unite.prenom1UniteLegale && unite.nomUniteLegale) {
          return `${unite.prenom1UniteLegale} ${unite.nomUniteLegale}`.trim();
        }
        if (unite.nomUniteLegale) {
          return unite.nomUniteLegale;
        }
        return `Entreprise ${unite.siren}`;
      }
      /**
       * Formatter l'adresse
       */
      formatAdresse(adresse) {
        if (!adresse) return "";
        const parts = [
          adresse.numeroVoieEtablissement,
          adresse.typeVoieEtablissement,
          adresse.libelleVoieEtablissement
        ].filter(Boolean);
        return parts.join(" ");
      }
      /**
       * Mapper tranche effectif INSEE → nombre estimé
       */
      mapEffectif(tranche) {
        if (!tranche) return void 0;
        const mapping = {
          "00": 0,
          // 0 salarié
          "01": 1,
          // 1 ou 2 salariés
          "02": 3,
          // 3 à 5 salariés
          "03": 8,
          // 6 à 9 salariés
          "11": 12,
          // 10 à 19 salariés
          "12": 35,
          // 20 à 49 salariés
          "21": 75,
          // 50 à 99 salariés
          "22": 150,
          // 100 à 199 salariés
          "31": 300,
          // 200 à 249 salariés
          "32": 375,
          // 250 à 499 salariés
          "41": 750,
          // 500 à 999 salariés
          "42": 1500,
          // 1000 à 1999 salariés
          "51": 3e3,
          // 2000 à 4999 salariés
          "52": 7500,
          // 5000 à 9999 salariés
          "53": 1e4
          // 10000 salariés et plus
        };
        return mapping[tranche] || void 0;
      }
    };
  }
});

// lib/services/enrichment/opencorporates-provider.ts
var OpenCorporatesProvider;
var init_opencorporates_provider = __esm({
  "lib/services/enrichment/opencorporates-provider.ts"() {
    "use strict";
    init_countries_registry();
    OpenCorporatesProvider = class {
      name = "opencorporates";
      baseUrl = "https://api.opencorporates.com/v0.4";
      /**
       * Enrichir les données d'une entreprise via OpenCorporates
       */
      async enrichCompany(identifier, countryCode, companyName) {
        try {
          const config = getCountryConfig(countryCode);
          if (!config || config.enrichmentProvider !== "opencorporates") {
            console.error(`[OpenCorporates] Pays ${countryCode} non support\xE9 par OpenCorporates`);
            return null;
          }
          console.log(`[OpenCorporates] Enrichissement pour ${identifier} (${countryCode})`);
          const searchUrl = new URL(`${this.baseUrl}/companies/search`);
          searchUrl.searchParams.set("q", identifier);
          searchUrl.searchParams.set("jurisdiction_code", countryCode.toLowerCase());
          searchUrl.searchParams.set("per_page", "1");
          const searchResponse = await fetch(searchUrl.toString(), {
            headers: {
              "User-Agent": "HectorSalesAI/1.0"
            }
          });
          if (!searchResponse.ok) {
            console.error(`[OpenCorporates] Erreur API search: ${searchResponse.status}`);
            return null;
          }
          const searchData = await searchResponse.json();
          const companies2 = searchData?.results?.companies || [];
          if (companies2.length === 0) {
            console.log(`[OpenCorporates] Aucun r\xE9sultat trouv\xE9 pour ${identifier}`);
            return null;
          }
          const company = companies2[0].company;
          console.log(`[OpenCorporates] Entreprise trouv\xE9e: ${company.name}`);
          if (company.opencorporates_url) {
            try {
              const detailsUrl = `${this.baseUrl}${new URL(company.opencorporates_url).pathname}`;
              const detailsResponse = await fetch(detailsUrl, {
                headers: {
                  "User-Agent": "HectorSalesAI/1.0"
                }
              });
              if (detailsResponse.ok) {
                const detailsData = await detailsResponse.json();
                const detailedCompany = detailsData?.results?.company;
                if (detailedCompany) {
                  console.log(`[OpenCorporates] D\xE9tails complets r\xE9cup\xE9r\xE9s`);
                  return this.mapDetailedData(detailedCompany, countryCode);
                }
              }
            } catch (error) {
              console.error(`[OpenCorporates] Erreur lors de la r\xE9cup\xE9ration des d\xE9tails:`, error);
            }
          }
          console.log(`[OpenCorporates] Utilisation des donn\xE9es basiques`);
          return this.mapBasicData(company, countryCode);
        } catch (error) {
          console.error(`[OpenCorporates] Erreur enrichissement:`, error.message);
          return null;
        }
      }
      /**
       * Mapper les données minimales de la recherche
       */
      mapBasicData(company, countryCode) {
        const config = getCountryConfig(countryCode);
        const data = {
          nom: company.name || "",
          identifiantNational: company.company_number || "",
          identifiantNationalType: config?.identifierType || "UNKNOWN",
          source: "opencorporates",
          dateEnrichissement: (/* @__PURE__ */ new Date()).toISOString(),
          qualityScore: 40
          // Score bas pour données minimales
        };
        if (company.company_type) {
          data.formeJuridique = company.company_type;
        }
        if (company.registered_address_in_full) {
          data.adresse = {
            adresse: company.registered_address_in_full,
            codePostal: "",
            ville: "",
            pays: config?.name || countryCode
          };
        }
        return data;
      }
      /**
       * Mapper toutes les données disponibles depuis les détails complets
       */
      mapDetailedData(company, countryCode) {
        const config = getCountryConfig(countryCode);
        let adresse;
        if (company.registered_address) {
          const addr = company.registered_address;
          adresse = {
            adresse: [addr.street_address, addr.locality].filter(Boolean).join(", "),
            codePostal: addr.postal_code || "",
            ville: addr.locality || "",
            pays: config?.name || countryCode
          };
        } else if (company.registered_address_in_full) {
          adresse = {
            adresse: company.registered_address_in_full,
            codePostal: "",
            ville: "",
            pays: config?.name || countryCode
          };
        }
        let dirigeants;
        if (company.officers && Array.isArray(company.officers)) {
          dirigeants = company.officers.slice(0, 5).map((officer) => {
            const fullName = officer.officer?.name || "";
            const nameParts = fullName.split(" ");
            return {
              nom: nameParts.length > 0 ? nameParts[nameParts.length - 1] : fullName,
              prenom: nameParts.length > 1 ? nameParts.slice(0, -1).join(" ") : void 0,
              fonction: officer.officer?.position || "Dirigeant"
            };
          });
        }
        const data = {
          nom: company.name || "",
          formeJuridique: company.company_type,
          dateCreation: company.incorporation_date,
          identifiantNational: company.company_number || "",
          identifiantNationalType: config?.identifierType || "UNKNOWN",
          adresse,
          dirigeants,
          secteurActivite: company.industry_codes?.[0]?.description,
          source: "opencorporates",
          dateEnrichissement: (/* @__PURE__ */ new Date()).toISOString(),
          qualityScore: 0
          // Calculé après
        };
        if (company.industry_codes && company.industry_codes.length > 0) {
          data.codeNAF = company.industry_codes[0].code;
          data.libelleNAF = company.industry_codes[0].description;
        }
        data.qualityScore = this.calculateQualityScore(data);
        return data;
      }
      /**
       * Calculer le score de qualité des données
       */
      calculateQualityScore(data) {
        let score = 50;
        if (data.nom) score += 10;
        if (data.adresse) score += 15;
        if (data.dirigeants && data.dirigeants.length > 0) score += 15;
        if (data.dateCreation) score += 10;
        return Math.min(score, 100);
      }
    };
  }
});

// lib/services/enrichment/websearch-provider.ts
var WebSearchProvider;
var init_websearch_provider = __esm({
  "lib/services/enrichment/websearch-provider.ts"() {
    "use strict";
    init_countries_registry();
    WebSearchProvider = class {
      name = "websearch";
      /**
       * Langues par pays pour optimiser les recherches
       */
      languageMap = {
        "CH": ["de", "fr", "it"],
        "FR": ["fr"],
        "BE": ["fr", "nl"],
        "LU": ["fr", "de"],
        "GB": ["en"],
        "DE": ["de"],
        "ES": ["es"],
        "IT": ["it"]
      };
      /**
       * Enrichir les données d'une entreprise via recherche web
       */
      async enrichCompany(identifier, countryCode, companyName) {
        try {
          const config = getCountryConfig(countryCode);
          if (!config || config.enrichmentProvider !== "web_search") {
            console.error(`[WebSearch] Pays ${countryCode} non configur\xE9 pour WebSearch`);
            return null;
          }
          console.log(`[WebSearch] Enrichissement pour ${companyName || identifier} (${countryCode})`);
          const searchQuery = this.buildSearchQuery(identifier, countryCode, companyName);
          const searchResults = await this.performWebSearch(searchQuery);
          if (!searchResults || searchResults.length === 0) {
            console.log(`[WebSearch] Aucun r\xE9sultat trouv\xE9`);
            return null;
          }
          const companyData = await this.extractCompanyData(
            searchResults,
            identifier,
            countryCode,
            companyName
          );
          if (!companyData.nom) {
            console.log(`[WebSearch] Impossible d'extraire les donn\xE9es de l'entreprise`);
            return null;
          }
          console.log(`[WebSearch] Donn\xE9es extraites avec qualityScore=${companyData.qualityScore}`);
          return companyData;
        } catch (error) {
          console.error(`[WebSearch] Erreur enrichissement:`, error.message);
          return null;
        }
      }
      /**
       * Construit une requête de recherche optimisée
       */
      buildSearchQuery(identifier, countryCode, companyName) {
        const parts = [];
        if (companyName) {
          parts.push(`"${companyName}"`);
        }
        parts.push(`"${identifier}"`);
        const countryTerms = this.getCountrySpecificTerms(countryCode);
        parts.push(...countryTerms);
        return parts.join(" ");
      }
      /**
       * Termes spécifiques à rechercher selon le pays
       */
      getCountrySpecificTerms(country) {
        const terms = {
          "CH": ["registre commerce", "handelsregister", "CHE"],
          "FR": ["SIREN", "soci\xE9t\xE9"],
          "BE": ["entreprise", "onderneming"],
          "LU": ["RCS", "soci\xE9t\xE9"],
          "DE": ["Handelsregister", "GmbH"],
          "GB": ["Companies House"],
          "ES": ["empresa", "CIF"],
          "IT": ["azienda", "societ\xE0"]
        };
        return terms[country] || ["company", "business"];
      }
      /**
       * Effectue la recherche web
       * NOTE: Implémentation simplifiée - à remplacer par vraie API (Google, Bing, etc.)
       */
      async performWebSearch(query) {
        return [
          {
            title: "Example Company - Official Website",
            url: "https://example.com",
            snippet: "Example Company description with address and contact info"
          }
        ];
      }
      /**
       * Extrait les données d'entreprise depuis les résultats de recherche
       */
      async extractCompanyData(results, identifier, countryCode, companyName) {
        const config = getCountryConfig(countryCode);
        const allText = results.map((r) => `${r.title} ${r.snippet}`).join(" ");
        const data = {
          nom: companyName || "",
          identifiantNational: identifier,
          identifiantNationalType: config?.identifierType || "UNKNOWN",
          source: "web_search",
          dateEnrichissement: (/* @__PURE__ */ new Date()).toISOString(),
          qualityScore: 0
          // Calculé après
        };
        data.adresse = this.extractAddress(allText, countryCode);
        data.dirigeants = this.extractExecutives(allText);
        data.secteurActivite = this.extractActivitySector(allText);
        data.dateCreation = this.extractCreationDate(allText);
        data.qualityScore = this.calculateQualityScore(data);
        return data;
      }
      /**
       * Extrait l'adresse depuis le texte
       */
      extractAddress(text6, country) {
        const config = getCountryConfig(country);
        const patterns = {
          "CH": /\d{4}\s+[A-ZÉÈÊÀ][a-zéèêàâäöü]+/g,
          "FR": /\d{5}\s+[A-ZÉÈÊÀ][a-zéèêàâäöü]+/g,
          "BE": /\d{4}\s+[A-ZÉÈÊÀ][a-zéèêàâäöü]+/g,
          "LU": /L-\d{4}\s+[A-Za-z]+/g
        };
        const pattern = patterns[country] || /\d{4,5}\s+[A-Za-z]+/g;
        const matches = text6.match(pattern);
        if (matches && matches.length > 0) {
          const fullAddress = matches[0];
          const parts = fullAddress.split(/\s+/);
          return {
            adresse: fullAddress,
            codePostal: parts[0] || "",
            ville: parts.slice(1).join(" ") || "",
            pays: config?.name || country
          };
        }
        return void 0;
      }
      /**
       * Extrait les dirigeants depuis le texte
       */
      extractExecutives(text6) {
        const dirigeants = [];
        const namePattern = "[A-Z\xC9\xC8\xCA\xC0][a-z\xE9\xE8\xEA\xE0\xE2\xE4\xF6\xFC]+(?:-[A-Z\xC9\xC8\xCA\xC0][a-z\xE9\xE8\xEA\xE0\xE2\xE4\xF6\xFC]+)*";
        const patterns = [
          new RegExp(`(?:CEO|Director|Pr\xE9sident|Directeur|Gesch\xE4ftsf\xFChrer)[:\\s]+(${namePattern}(?:\\s+${namePattern})+)`, "g"),
          new RegExp(`(?:M\\.|Mme|Mr\\.|Mrs\\.)\\s+(${namePattern}(?:\\s+${namePattern})+)`, "g")
        ];
        const foundNames = /* @__PURE__ */ new Set();
        for (const pattern of patterns) {
          let match;
          while ((match = pattern.exec(text6)) !== null) {
            const fullName = match[1].trim();
            if (!foundNames.has(fullName) && fullName.split(" ").length >= 2) {
              foundNames.add(fullName);
              const nameParts = fullName.split(" ");
              dirigeants.push({
                nom: nameParts[nameParts.length - 1],
                prenom: nameParts.slice(0, -1).join(" "),
                fonction: "Dirigeant"
              });
            }
          }
        }
        return dirigeants;
      }
      /**
       * Extrait le secteur d'activité
       */
      extractActivitySector(text6) {
        const sectorKeywords = [
          { keywords: ["technology", "technologie"], label: "Technology" },
          { keywords: ["consulting", "conseil"], label: "Consulting" },
          { keywords: ["finance", "financial"], label: "Finance" },
          { keywords: ["insurance", "assurance"], label: "Insurance" },
          { keywords: ["immobilier", "real estate"], label: "Immobilier" },
          { keywords: ["construction"], label: "Construction" },
          { keywords: ["industrie", "industry"], label: "Industrie" },
          { keywords: ["commerce", "retail"], label: "Commerce" },
          { keywords: ["services"], label: "Services" }
        ];
        for (const sector of sectorKeywords) {
          for (const keyword of sector.keywords) {
            const regex = new RegExp(`\\b${keyword}\\b`, "i");
            if (regex.test(text6)) {
              return sector.label;
            }
          }
        }
        return void 0;
      }
      /**
       * Extrait la date de création
       */
      extractCreationDate(text6) {
        const datePatterns = [
          /founded\s+in\s+(\d{4})/i,
          /créée?\s+en\s+(\d{4})/i,
          /gegründet\s+(\d{4})/i,
          /since\s+(\d{4})/i,
          /depuis\s+(\d{4})/i
        ];
        for (const pattern of datePatterns) {
          const match = text6.match(pattern);
          if (match) {
            return match[1];
          }
        }
        return void 0;
      }
      /**
       * Calculer le score de qualité des données
       */
      calculateQualityScore(data) {
        let score = 30;
        if (data.nom) score += 10;
        if (data.adresse) score += 15;
        if (data.dirigeants && data.dirigeants.length > 0) score += 15;
        if (data.dateCreation) score += 10;
        if (data.secteurActivite) score += 10;
        return Math.min(score, 100);
      }
    };
  }
});

// lib/services/enrichment/phone-lookup-provider.ts
var CompanyNotFoundError, ValidationError, PhoneLookupProvider;
var init_phone_lookup_provider = __esm({
  "lib/services/enrichment/phone-lookup-provider.ts"() {
    "use strict";
    CompanyNotFoundError = class extends Error {
      constructor(message) {
        super(message);
        this.name = "CompanyNotFoundError";
      }
    };
    ValidationError = class extends Error {
      constructor(message) {
        super(message);
        this.name = "ValidationError";
      }
    };
    PhoneLookupProvider = class {
      timeout = parseInt(process.env.PHONE_LOOKUP_TIMEOUT_MS || "10000");
      debug = process.env.PHONE_LOOKUP_DEBUG === "true";
      /**
       * Configuration des 3 sources avec fallback cascade
       */
      sources = [
        {
          name: "pagesjaunes",
          displayName: "Pages Jaunes",
          baseUrl: "https://www.pagesjaunes.fr",
          timeout: 3e4,
          buildSearchUrl: (phone) => {
            const formatted = this.formatPhoneForPagesJaunes(phone);
            return `https://www.pagesjaunes.fr/annuaireinverse/recherche?quoiqui=${encodeURIComponent(formatted)}`;
          },
          extractData: (html, phone) => this.extractPagesJaunesData(html, phone)
        },
        {
          name: "118712",
          displayName: "118 712",
          baseUrl: "https://www.118712.fr",
          timeout: 3e4,
          buildSearchUrl: (phone) => {
            const cleaned = this.cleanPhoneNumber(phone);
            return `https://www.118712.fr/recherche?quoi=${encodeURIComponent(cleaned)}`;
          },
          extractData: (html, phone) => this.extract118712Data(html, phone)
        },
        {
          name: "118218",
          displayName: "118 218",
          baseUrl: "https://www.118218.fr",
          timeout: 3e4,
          buildSearchUrl: (phone) => {
            const cleaned = this.cleanPhoneNumber(phone);
            return `https://www.118218.fr/?telephone=${encodeURIComponent(cleaned)}`;
          },
          extractData: (html, phone) => this.extract118218Data(html, phone)
        }
      ];
      /**
       * Trouve le SIRET d'une entreprise à partir de son téléphone
       * Essaie les 3 sources dans l'ordre jusqu'à trouver un résultat
       */
      async phoneToSiret(phone) {
        const cleanPhone = this.cleanPhoneNumber(phone);
        if (!this.isValidFrenchPhone(cleanPhone)) {
          throw new ValidationError(`Num\xE9ro de t\xE9l\xE9phone fran\xE7ais invalide: ${phone}`);
        }
        if (this.debug) {
          console.log(`
\u{1F50D} [PhoneLookup] Recherche SIRET pour: ${phone}`);
          console.log(`   Cascade: ${this.sources.map((s) => s.displayName).join(" \u2192 ")}`);
        }
        const globalStartTime = Date.now();
        for (let i = 0; i < this.sources.length; i++) {
          const source = this.sources[i];
          const attemptNumber = i + 1;
          if (this.debug) {
            console.log(`
   \u{1F4DE} Tentative ${attemptNumber}/${this.sources.length}: ${source.displayName}`);
          }
          try {
            const result = await this.trySource(source, cleanPhone, phone);
            if (result) {
              const totalDuration2 = Date.now() - globalStartTime;
              if (this.debug) {
                console.log(`   \u2705 TROUV\xC9 via ${source.displayName} !`);
                console.log(`      SIRET: ${result.siret}`);
                console.log(`      Entreprise: ${result.companyName}`);
                console.log(`      Confiance: ${result.confidence}%`);
                console.log(`      Temps total: ${totalDuration2}ms`);
              }
              return {
                ...result,
                duration: totalDuration2
              };
            }
            if (this.debug) {
              console.log(`   \u274C Non trouv\xE9 via ${source.displayName}`);
            }
          } catch (error) {
            if (this.debug) {
              console.log(`   \u26A0\uFE0F Erreur ${source.displayName}: ${error.message}`);
            }
          }
        }
        const totalDuration = Date.now() - globalStartTime;
        if (this.debug) {
          console.log(`
   \u274C \xC9CHEC: SIRET non trouv\xE9 dans les ${this.sources.length} sources`);
          console.log(`      Temps total: ${totalDuration}ms`);
        }
        throw new CompanyNotFoundError(
          `Aucun SIRET trouv\xE9 pour le t\xE9l\xE9phone ${phone} (test\xE9: ${this.sources.map((s) => s.displayName).join(", ")})`
        );
      }
      /**
       * Essaie une source spécifique
       */
      async trySource(source, cleanPhone, originalPhone) {
        let browser = null;
        const startTime = Date.now();
        try {
          const { connect } = await import("puppeteer-real-browser");
          const { browser: realBrowser, page } = await connect({
            headless: true,
            turnstile: true,
            args: [
              "--no-sandbox",
              "--disable-setuid-sandbox",
              "--disable-dev-shm-usage"
            ],
            customConfig: {},
            skipTarget: [],
            fingerprint: false,
            proxy: void 0
          });
          browser = realBrowser;
          const searchUrl = source.buildSearchUrl(cleanPhone);
          if (this.debug) {
            console.log(`      URL: ${searchUrl}`);
          }
          await page.goto(searchUrl, {
            waitUntil: "networkidle2",
            timeout: source.timeout
          });
          await new Promise((resolve) => setTimeout(resolve, 3e3));
          const html = await page.content();
          if (html.includes("Aucun r\xE9sultat") || html.includes("Pas de r\xE9sultat") || html.includes("Aucune correspondance")) {
            return null;
          }
          const extractedData = source.extractData(html, originalPhone);
          if (!extractedData || !extractedData.siret) {
            return null;
          }
          const duration = Date.now() - startTime;
          return {
            phone: originalPhone,
            companyName: extractedData.companyName || "Entreprise inconnue",
            siret: extractedData.siret,
            siren: extractedData.siret.substring(0, 9),
            address: extractedData.address,
            source: source.name,
            confidence: extractedData.confidence || 50,
            duration,
            codeNAF: extractedData.codeNAF,
            formeJuridique: extractedData.formeJuridique,
            dateCreation: extractedData.dateCreation
          };
        } catch (error) {
          const duration = Date.now() - startTime;
          if (this.debug) {
            console.log(`      Dur\xE9e: ${duration}ms (erreur)`);
          }
          throw error;
        } finally {
          if (browser) {
            await browser.close();
          }
        }
      }
      /**
       * EXTRACTEUR 1 : Pages Jaunes
       */
      extractPagesJaunesData(html, phone) {
        const siretPatterns = [
          /SIRET[:\s]*(\d{14})/i,
          /<[^>]*SIRET[^>]*>.*?(\d{14}).*?</i,
          /Sur l'établissement[\s\S]*?(\d{14})/i,
          /Informations financières[\s\S]*?SIRET[\s\S]*?(\d{14})/i,
          /(\d{14})/
          // Fallback: tout nombre de 14 chiffres
        ];
        let siret = null;
        for (const pattern of siretPatterns) {
          const match = html.match(pattern);
          if (match) {
            siret = match[1];
            break;
          }
        }
        if (!siret) {
          return null;
        }
        const namePatterns = [
          /<h1[^>]*>([^<]+)<\/h1>/i,
          /<title>([^|<]+)/i,
          /class="[^"]*company[^"]*"[^>]*>([^<]+)</i,
          /class="[^"]*denomination[^"]*"[^>]*>([^<]+)</i
        ];
        let companyName = "Entreprise inconnue";
        for (const pattern of namePatterns) {
          const match = html.match(pattern);
          if (match) {
            companyName = this.cleanCompanyName(match[1]);
            break;
          }
        }
        const addressPatterns = [
          /class="[^"]*address[^"]*"[^>]*>([^<]+)</i,
          /(\d+[^,]*,\s*\d{5}[^,]*)/i,
          /<address[^>]*>([^<]+)</i
        ];
        let address;
        for (const pattern of addressPatterns) {
          const match = html.match(pattern);
          if (match) {
            address = match[1].trim();
            break;
          }
        }
        const nafMatch = html.match(/Code NAF[:\s]*(\d{4}[A-Z]?)/i);
        const formeJuridiqueMatch = html.match(/Forme juridique[:\s]*([^<]+)</i);
        const dateCreationMatch = html.match(/Création[^:]*:[^>]*(\d{1,2}[^>]*\d{4})/i);
        const confidence = this.calculateConfidence(true, companyName !== "Entreprise inconnue", !!address);
        return {
          siret,
          companyName,
          address,
          confidence,
          codeNAF: nafMatch?.[1],
          formeJuridique: formeJuridiqueMatch?.[1]?.trim(),
          dateCreation: dateCreationMatch?.[1]
        };
      }
      /**
       * EXTRACTEUR 2 : 118 712
       */
      extract118712Data(html, phone) {
        const siretPatterns = [
          /SIRET[:\s]+(\d{14})/i,
          /N°\s*SIRET[:\s]+(\d{14})/i,
          /data-siret=["'](\d{14})["']/i,
          /siret["':\s]+(\d{14})/i,
          /(\d{14})/
          // Fallback
        ];
        let siret = null;
        let patternUsed = "";
        for (let i = 0; i < siretPatterns.length; i++) {
          const match = html.match(siretPatterns[i]);
          if (match) {
            siret = match[1];
            patternUsed = i < 3 ? "explicit" : "fallback";
            break;
          }
        }
        if (!siret) {
          return null;
        }
        const namePatterns = [
          /<h1[^>]*>([^<]+)<\/h1>/i,
          /class="[^"]*name[^"]*"[^>]*>([^<]+)</i,
          /Raison sociale[:\s]+([^<]+)</i,
          /<title>([^-<]+)/i
        ];
        let companyName = "Entreprise inconnue";
        for (const pattern of namePatterns) {
          const match = html.match(pattern);
          if (match) {
            companyName = this.cleanCompanyName(match[1]);
            break;
          }
        }
        const addressPatterns = [
          /class="[^"]*address[^"]*"[^>]*>([^<]+)</i,
          /Adresse[:\s]+([^<]+)/i,
          /(\d+[^,]*,\s*\d{5}[^,]*)/i
        ];
        let address;
        for (const pattern of addressPatterns) {
          const match = html.match(pattern);
          if (match) {
            address = match[1].trim();
            break;
          }
        }
        let baseConfidence = patternUsed === "explicit" ? 70 : 50;
        const confidence = this.calculateConfidence(true, companyName !== "Entreprise inconnue", !!address, baseConfidence);
        return {
          siret,
          companyName,
          address,
          confidence
        };
      }
      /**
       * EXTRACTEUR 3 : 118 218
       */
      extract118218Data(html, phone) {
        let siret = null;
        let companyName = null;
        let address = null;
        const jsonLdMatch = html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/);
        if (jsonLdMatch) {
          try {
            const jsonData = JSON.parse(jsonLdMatch[1]);
            siret = jsonData.identifier || jsonData.siret || null;
            companyName = jsonData.name || null;
            if (jsonData.address) {
              address = jsonData.address.streetAddress || `${jsonData.address.addressLocality || ""} ${jsonData.address.postalCode || ""}`.trim();
            }
          } catch (e) {
          }
        }
        if (!siret) {
          const siretPatterns = [
            /SIRET[:\s]+(\d{14})/i,
            /siret["':\s]+(\d{14})/i,
            /(\d{14})/
          ];
          for (const pattern of siretPatterns) {
            const match = html.match(pattern);
            if (match) {
              siret = match[1];
              break;
            }
          }
        }
        if (!siret) {
          return null;
        }
        if (!companyName) {
          const namePatterns = [
            /<h1[^>]*>([^<]+)<\/h1>/i,
            /class="[^"]*company[^"]*"[^>]*>([^<]+)</i,
            /<title>([^-<]+)/i
          ];
          for (const pattern of namePatterns) {
            const match = html.match(pattern);
            if (match) {
              companyName = this.cleanCompanyName(match[1]);
              break;
            }
          }
        }
        if (!address) {
          const addressPatterns = [
            /class="[^"]*address[^"]*"[^>]*>([^<]+)</i,
            /(\d+[^,]*,\s*\d{5}[^,]*)/i
          ];
          for (const pattern of addressPatterns) {
            const match = html.match(pattern);
            if (match) {
              address = match[1].trim();
              break;
            }
          }
        }
        const confidence = this.calculateConfidence(
          true,
          !!companyName && companyName !== "Entreprise inconnue",
          !!address
        );
        return {
          siret,
          companyName: companyName || "Entreprise inconnue",
          address: address || void 0,
          confidence
        };
      }
      /**
       * Nettoyer le numéro de téléphone
       */
      cleanPhoneNumber(phone) {
        return phone.replace(/[^\d+]/g, "");
      }
      /**
       * Valider téléphone français
       */
      isValidFrenchPhone(phone) {
        const patterns = [
          /^0[1-9]\d{8}$/,
          /^\+33[1-9]\d{8}$/,
          /^33[1-9]\d{8}$/
        ];
        return patterns.some((pattern) => pattern.test(phone));
      }
      /**
       * Formater pour Pages Jaunes (01 23 45 67 89)
       */
      formatPhoneForPagesJaunes(phone) {
        let cleaned = phone.replace(/[^\d]/g, "");
        if (cleaned.startsWith("33")) {
          cleaned = "0" + cleaned.substring(2);
        }
        if (cleaned.length === 10) {
          return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, "$1 $2 $3 $4 $5");
        }
        return cleaned;
      }
      /**
       * Nettoyer nom d'entreprise
       */
      cleanCompanyName(name) {
        return name.trim().replace(/\s+/g, " ").replace(/Pages Jaunes.*$/i, "").replace(/118.*$/i, "").replace(/\|.*$/i, "").replace(/-.*$/i, "").trim();
      }
      /**
       * Calculer score de confiance
       */
      calculateConfidence(hasSiret, hasName, hasAddress, baseScore = 0) {
        let score = baseScore;
        if (hasSiret) score += 50;
        if (hasName) score += 30;
        if (hasAddress) score += 20;
        return Math.min(score, 100);
      }
    };
  }
});

// lib/utils/siret-validation.ts
function luhnCheck(siret) {
  let sum3 = 0;
  for (let i = 0; i < siret.length; i++) {
    let digit = parseInt(siret[i]);
    if (i % 2 === 0) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum3 += digit;
  }
  return sum3 % 10 === 0;
}
function validateSiret(siret) {
  if (!/^\d{14}$/.test(siret)) {
    return {
      valid: false,
      reason: `Format invalide (attendu: 14 chiffres, re\xE7u: ${siret.length})`
    };
  }
  const siren = siret.substring(0, 9);
  if (!luhnCheck(siren)) {
    return {
      valid: false,
      reason: "Algorithme de Luhn \xE9chou\xE9 (SIREN invalide)"
    };
  }
  return { valid: true };
}
var init_siret_validation = __esm({
  "lib/utils/siret-validation.ts"() {
    "use strict";
  }
});

// lib/services/enrichment/enrichment-orchestrator.ts
var EnrichmentOrchestrator, enrichmentOrchestrator;
var init_enrichment_orchestrator = __esm({
  "lib/services/enrichment/enrichment-orchestrator.ts"() {
    "use strict";
    init_countries_registry();
    init_pappers_provider();
    init_insee_provider();
    init_opencorporates_provider();
    init_websearch_provider();
    init_phone_lookup_provider();
    init_siret_validation();
    EnrichmentOrchestrator = class {
      providers;
      inseeProvider;
      pappersProvider;
      phoneLookupProvider;
      constructor() {
        this.providers = /* @__PURE__ */ new Map();
        this.inseeProvider = new INSEEProvider();
        this.pappersProvider = new PappersProvider();
        this.phoneLookupProvider = new PhoneLookupProvider();
        this.providers.set("insee", this.inseeProvider);
        this.providers.set("pappers", this.pappersProvider);
        this.providers.set("opencorporates", new OpenCorporatesProvider());
        this.providers.set("web_search", new WebSearchProvider());
      }
      /**
       * Enrichir une entreprise selon son pays
       * 
       * @param identifier Identifiant national (SIREN, VAT, CHE, etc.)
       * @param countryCode Code pays ISO 3166-1 alpha-2 (ex: 'FR', 'BE', 'CH')
       * @param options Options d'enrichissement
       * @returns Résultat enrichissement avec données et métadonnées
       */
      async enrichCompany(identifier, countryCode, options = {}) {
        const { enableFallback = false, companyName } = options;
        try {
          const config = getCountryConfig(countryCode);
          if (!config) {
            return {
              data: null,
              provider: "web_search",
              fallbackUsed: false,
              error: `Pays ${countryCode} non configur\xE9 dans le registry`
            };
          }
          if (!config.identifierPattern.test(identifier)) {
            return {
              data: null,
              provider: config.enrichmentProvider,
              fallbackUsed: false,
              error: `Format d'identifiant invalide pour ${config.name}. Attendu: ${config.identifierLabel}`
            };
          }
          const provider = this.providers.get(config.enrichmentProvider);
          if (!provider) {
            return {
              data: null,
              provider: config.enrichmentProvider,
              fallbackUsed: false,
              error: `Provider ${config.enrichmentProvider} non disponible`
            };
          }
          console.log(`[Orchestrator] \u{1F30D} Enrichissement ${countryCode} via ${config.enrichmentProvider}`);
          const data = await provider.enrichCompany(identifier, countryCode, companyName);
          if (!data && enableFallback && config.fallbackToWeb) {
            console.log(`[Orchestrator] \u{1F504} Fallback vers WebSearch pour ${countryCode}`);
            return await this.tryFallback(identifier, countryCode, companyName);
          }
          return {
            data,
            provider: config.enrichmentProvider,
            fallbackUsed: false
          };
        } catch (error) {
          const config = getCountryConfig(countryCode);
          if (enableFallback && config?.fallbackToWeb) {
            console.log(`[Orchestrator] \u274C Erreur ${config?.enrichmentProvider}: ${error}`);
            console.log(`[Orchestrator] \u{1F504} Fallback vers WebSearch pour ${countryCode}`);
            return await this.tryFallback(identifier, countryCode, companyName);
          }
          return {
            data: null,
            provider: config?.enrichmentProvider || "web_search",
            fallbackUsed: false,
            error: error instanceof Error ? error.message : String(error)
          };
        }
      }
      /**
       * PHASE 2.5 CASCADE : Enrichissement intelligent INSEE (gratuit) → Pappers (payant)
       * 
       * Flow :
       * 1. Essayer INSEE (0€) - API Sirene V3
       * 2. Si 404 → Fallback Pappers (0,10€)
       * 3. Tracking complet : cost, duration, source
       * 
       * Économies attendues : 80-90% (la majorité des entreprises sont dans INSEE)
       * 
       * @param identifier SIREN (9) ou SIRET (14)
       * @param countryCode Doit être 'FR' (France uniquement)
       * @param companyName Nom optionnel pour améliorer recherche
       * @returns Résultat avec métadonnées CASCADE (cost, duration, source)
       */
      async enrichWithCascade(identifier, countryCode, companyName) {
        const startTime = Date.now();
        if (countryCode !== "FR") {
          throw new Error("CASCADE ne supporte que la France (countryCode: FR)");
        }
        try {
          console.log(`[CASCADE] 1\uFE0F\u20E3 Trying INSEE for ${identifier}...`);
          const inseeData = await this.inseeProvider.enrichCompany(identifier, countryCode, companyName);
          if (inseeData) {
            const duration2 = Date.now() - startTime;
            console.log(`[CASCADE] \u2705 INSEE success for ${identifier} (${duration2}ms, 0\u20AC)`);
            return {
              data: inseeData,
              provider: "insee",
              fallbackUsed: false,
              cost: 0,
              // INSEE est GRATUIT
              duration: duration2,
              source: "insee"
            };
          }
          console.log(`[CASCADE] 2\uFE0F\u20E3 INSEE failed, trying Pappers fallback for ${identifier}...`);
          const pappersData = await this.pappersProvider.enrichCompany(identifier, countryCode, companyName);
          if (pappersData) {
            const duration2 = Date.now() - startTime;
            console.log(`[CASCADE] \u2705 Pappers fallback success for ${identifier} (${duration2}ms, 0.10\u20AC)`);
            return {
              data: pappersData,
              provider: "pappers",
              fallbackUsed: true,
              cost: 0.1,
              // Coût unitaire Pappers
              duration: duration2,
              source: "pappers"
            };
          }
          const duration = Date.now() - startTime;
          console.log(`[CASCADE] \u274C Complete failure for ${identifier} (${duration}ms, 0.10\u20AC)`);
          return {
            data: null,
            provider: "pappers",
            fallbackUsed: true,
            cost: 0.1,
            // On a quand même appelé Pappers
            duration,
            source: "not_found",
            error: `Company ${identifier} not found in any provider (INSEE + Pappers)`
          };
        } catch (error) {
          const duration = Date.now() - startTime;
          console.error(`[CASCADE] \u274C Technical error: ${error}`);
          return {
            data: null,
            provider: "pappers",
            fallbackUsed: false,
            cost: 0,
            duration,
            source: "not_found",
            error: error instanceof Error ? error.message : String(error)
          };
        }
      }
      /**
       * Tenter un fallback vers WebSearch
       */
      async tryFallback(identifier, countryCode, companyName) {
        try {
          const webProvider = this.providers.get("web_search");
          if (!webProvider) {
            return {
              data: null,
              provider: "web_search",
              fallbackUsed: true,
              error: "Provider WebSearch non disponible"
            };
          }
          const data = await webProvider.enrichCompany(identifier, countryCode, companyName);
          return {
            data,
            provider: "web_search",
            fallbackUsed: true
          };
        } catch (error) {
          return {
            data: null,
            provider: "web_search",
            fallbackUsed: true,
            error: error instanceof Error ? error.message : String(error)
          };
        }
      }
      /**
       * Vérifier si un pays est supporté
       */
      isCountrySupported(countryCode) {
        const config = getCountryConfig(countryCode);
        return config !== null;
      }
      /**
       * Obtenir le provider configuré pour un pays
       */
      getProviderForCountry(countryCode) {
        const config = getCountryConfig(countryCode);
        return config?.enrichmentProvider || null;
      }
      /**
       * Obtenir la liste de tous les pays supportés
       */
      getSupportedCountries() {
        return [
          "FR",
          "BE",
          "CH",
          "LU",
          "GB",
          "DE",
          "ES",
          "IT",
          "GP",
          "MQ",
          "GF",
          "RE",
          "YT"
        ];
      }
      /**
       * PHASE 2.6 : Enrichir par téléphone avec CASCADE
       * 
       * Flow : Téléphone → Pages Jaunes → SIRET → CASCADE INSEE → Pappers
       * Économies maintenues : 80-90% même via téléphone !
       * 
       * @param phone Numéro de téléphone français
       * @returns Résultat enrichissement avec métadonnées téléphone + CASCADE
       */
      async enrichByPhone(phone) {
        const startTime = Date.now();
        try {
          console.log(`[Orchestrator] \u{1F4DE} Recherche SIRET pour t\xE9l\xE9phone: ${phone}`);
          const phoneLookup = await this.phoneLookupProvider.phoneToSiret(phone);
          console.log(`[Orchestrator] \u2705 SIRET trouv\xE9 via ${phoneLookup.source}: ${phoneLookup.siret}`);
          const validation = validateSiret(phoneLookup.siret);
          if (!validation.valid) {
            const duration = Date.now() - startTime;
            console.warn(`[Orchestrator] \u26A0\uFE0F SIRET invalide (${validation.reason}): ${phoneLookup.siret}`);
            return {
              data: null,
              provider: "insee",
              fallbackUsed: false,
              cost: 0,
              duration,
              source: "not_found",
              phoneLookup,
              // Métadonnées phone lookup présentes
              error: `T\xE9l\xE9phone trouv\xE9 via ${phoneLookup.source}, mais SIRET invalide (${validation.reason}). Entreprise possiblement non inscrite au RCS.`
            };
          }
          const cascadeResult = await this.enrichWithCascade(
            phoneLookup.siret,
            "FR",
            // countryCode
            phoneLookup.companyName
            // companyName (optionnel)
          );
          return {
            ...cascadeResult,
            phoneLookup,
            // Métadonnées phone lookup
            duration: Date.now() - startTime
          };
        } catch (error) {
          const duration = Date.now() - startTime;
          if (error instanceof Error && error.name === "CompanyNotFoundError") {
            console.log(`[Orchestrator] \u274C Aucune entreprise trouv\xE9e pour t\xE9l\xE9phone: ${phone}`);
            return {
              data: null,
              provider: "insee",
              fallbackUsed: false,
              cost: 0,
              duration,
              source: "not_found",
              error: `Aucune entreprise trouv\xE9e pour le t\xE9l\xE9phone ${phone}`
            };
          }
          console.error(`[Orchestrator] \u274C Erreur enrichissement t\xE9l\xE9phone ${phone}:`, error);
          return {
            data: null,
            provider: "insee",
            fallbackUsed: false,
            cost: 0,
            duration,
            source: "not_found",
            error: error instanceof Error ? error.message : String(error)
          };
        }
      }
    };
    enrichmentOrchestrator = new EnrichmentOrchestrator();
  }
});

// lib/services/enrichment-service.ts
var enrichment_service_exports = {};
__export(enrichment_service_exports, {
  EnrichmentService: () => EnrichmentService,
  enrichCompanyByPhone: () => enrichCompanyByPhone,
  enrichmentService: () => enrichmentService
});
async function enrichCompanyByPhone(phone, userId) {
  return enrichmentService.enrichCompanyByPhone(phone, userId);
}
var EnrichmentService, enrichmentService;
var init_enrichment_service = __esm({
  "lib/services/enrichment-service.ts"() {
    "use strict";
    init_storage();
    init_enrichment_orchestrator();
    EnrichmentService = class {
      orchestrator;
      constructor() {
        this.orchestrator = new EnrichmentOrchestrator();
      }
      /**
       * Enrichir une entreprise à partir d'un SIREN ou SIRET
       * 
       * Process :
       * 1. Valider et nettoyer l'identifiant
       * 2. Vérifier si company existe déjà en DB
       * 3. Enrichir via Pappers (avec cache 30j)
       * 4. Créer/Update company en DB
       * 5. Logger l'enrichissement
       * 6. Gérer relations SIREN/SIRET
       */
      async enrichCompany(input) {
        const {
          identifier,
          countryCode = "FR",
          companyName,
          userId,
          triggerType = "manual"
        } = input;
        console.log(`[EnrichmentService] \u{1F680} D\xE9but enrichissement: ${identifier}`);
        try {
          if (!userId) {
            console.error("[EnrichmentService] \u274C Tentative d'enrichissement sans userId");
            return {
              company: null,
              enrichmentLog: null,
              success: false,
              message: "Authentification requise",
              error: "userId manquant"
            };
          }
          const cleanIdentifier = this.cleanIdentifier(identifier);
          if (!cleanIdentifier) {
            return {
              company: null,
              enrichmentLog: null,
              success: false,
              message: "Identifiant invalide",
              error: "Format SIREN/SIRET incorrect"
            };
          }
          const identifierType = cleanIdentifier.length === 9 ? "SIREN" : "SIRET";
          console.log(`[EnrichmentService] \u2713 Identifiant valide: ${identifierType} ${cleanIdentifier}`);
          let existingCompany = await storage.getCompanyByIdentifier(cleanIdentifier, countryCode, userId);
          if (existingCompany && existingCompany.enriched === "true" && existingCompany.enrichmentDate) {
            const daysSinceEnrichment = this.daysSince(new Date(existingCompany.enrichmentDate));
            if (daysSinceEnrichment < 7) {
              console.log(`[EnrichmentService] \u2139\uFE0F Company d\xE9j\xE0 enrichie il y a ${daysSinceEnrichment}j - Skip`);
              return {
                company: existingCompany,
                enrichmentLog: null,
                success: true,
                message: `Entreprise d\xE9j\xE0 enrichie il y a ${daysSinceEnrichment} jours`
              };
            }
          }
          console.log(`[EnrichmentService] \u{1F4E1} Appel Pappers pour ${cleanIdentifier}...`);
          const enrichmentResult = await this.orchestrator.enrichCompany(
            cleanIdentifier,
            countryCode,
            { enableFallback: true, companyName }
          );
          if (!enrichmentResult.data) {
            const logData2 = {
              companyId: existingCompany?.id,
              triggerType,
              triggerUserId: userId,
              source: enrichmentResult.provider,
              status: "error",
              errorMessage: enrichmentResult.error || "Aucune donn\xE9e retourn\xE9e"
            };
            const log3 = await storage.createEnrichmentLog(logData2);
            return {
              company: existingCompany || null,
              enrichmentLog: log3,
              success: false,
              message: "Enrichissement \xE9chou\xE9",
              error: enrichmentResult.error
            };
          }
          console.log(`[EnrichmentService] \u2705 Donn\xE9es r\xE9cup\xE9r\xE9es via ${enrichmentResult.provider}`);
          const companyData = this.buildCompanyData(enrichmentResult.data, cleanIdentifier, identifierType, countryCode, userId);
          let company;
          let fieldsUpdated = [];
          if (existingCompany) {
            company = await storage.updateCompany(existingCompany.id, userId, companyData);
            fieldsUpdated = Object.keys(companyData);
            console.log(`[EnrichmentService] \u{1F504} Company mise \xE0 jour: ${company.id}`);
          } else {
            company = await storage.createCompany(companyData);
            fieldsUpdated = ["all"];
            console.log(`[EnrichmentService] \u2728 Company cr\xE9\xE9e: ${company.id}`);
          }
          const logData = {
            companyId: company.id,
            triggerType,
            triggerUserId: userId,
            source: enrichmentResult.provider,
            apiResponse: enrichmentResult.data,
            // JSONB
            fieldsUpdated,
            status: "success"
          };
          const log2 = await storage.createEnrichmentLog(logData);
          let relationships = [];
          if (identifierType === "SIRET" && enrichmentResult.data.identifiantNational) {
            const sirenParent = cleanIdentifier.substring(0, 9);
            let parentCompany = await storage.getCompanyByIdentifier(sirenParent, countryCode, userId);
            if (!parentCompany) {
              const parentData = {
                countryCode,
                identifierType: "SIREN",
                identifierValue: sirenParent,
                legalName: enrichmentResult.data.nom,
                legalForm: enrichmentResult.data.formeJuridique,
                creationDate: enrichmentResult.data.dateCreation,
                enriched: "false",
                // Sera enrichi lors du prochain appel SIREN
                createdBy: userId
              };
              parentCompany = await storage.createCompany(parentData);
              console.log(`[EnrichmentService] \u{1F468}\u200D\u{1F466} SIREN parent cr\xE9\xE9: ${sirenParent}`);
            }
            const relationshipData = {
              parentCompanyId: parentCompany.id,
              childCompanyId: company.id,
              relationshipType: "establishment",
              isActive: "true"
            };
            const relationship = await storage.createCompanyRelationship(relationshipData);
            relationships.push(relationship);
            await storage.updateCompany(company.id, userId, {
              parentIdentifier: sirenParent
            });
            console.log(`[EnrichmentService] \u{1F517} Relation SIREN/SIRET cr\xE9\xE9e`);
          }
          return {
            company,
            enrichmentLog: log2,
            relationships: relationships.length > 0 ? relationships : void 0,
            success: true,
            message: `Entreprise enrichie avec succ\xE8s via ${enrichmentResult.provider}`
          };
        } catch (error) {
          console.error("[EnrichmentService] \u274C Erreur:", error);
          return {
            company: null,
            enrichmentLog: null,
            success: false,
            message: "Erreur lors de l'enrichissement",
            error: error instanceof Error ? error.message : String(error)
          };
        }
      }
      /**
       * PHASE 2.5 : Enrichir avec CASCADE INSEE → Pappers (France uniquement)
       * 
       * Optimisation coûts : 
       * - 1er essai : INSEE (GRATUIT)
       * - Fallback : Pappers (0,10€) si INSEE échoue
       * - Économies attendues : 80-90%
       */
      async enrichCompanyWithCascade(input) {
        const {
          identifier,
          countryCode = "FR",
          companyName,
          userId,
          triggerType = "manual"
        } = input;
        console.log(`[EnrichmentService CASCADE] \u{1F680} D\xE9but enrichissement CASCADE: ${identifier}`);
        try {
          if (!userId) {
            return {
              company: null,
              enrichmentLog: null,
              success: false,
              message: "Authentification requise",
              error: "userId manquant"
            };
          }
          if (countryCode !== "FR") {
            return {
              company: null,
              enrichmentLog: null,
              success: false,
              message: "CASCADE ne supporte que la France",
              error: "countryCode doit \xEAtre FR"
            };
          }
          const cleanIdentifier = this.cleanIdentifier(identifier);
          if (!cleanIdentifier) {
            return {
              company: null,
              enrichmentLog: null,
              success: false,
              message: "Identifiant invalide",
              error: "Format SIREN/SIRET incorrect"
            };
          }
          const identifierType = cleanIdentifier.length === 9 ? "SIREN" : "SIRET";
          let existingCompany = await storage.getCompanyByIdentifier(cleanIdentifier, countryCode, userId);
          const cascadeResult = await this.orchestrator.enrichWithCascade(
            cleanIdentifier,
            countryCode,
            companyName
          );
          if (!cascadeResult.data) {
            const logData2 = {
              companyId: existingCompany?.id,
              triggerType,
              triggerUserId: userId,
              source: cascadeResult.source,
              status: "error",
              errorMessage: cascadeResult.error || "Aucune donn\xE9e retourn\xE9e",
              cost: Math.round(cascadeResult.cost * 100),
              // Convertir en centimes
              fallbackUsed: cascadeResult.fallbackUsed ? "true" : "false",
              duration: cascadeResult.duration
            };
            const log3 = await storage.createEnrichmentLog(logData2);
            return {
              company: existingCompany || null,
              enrichmentLog: log3,
              success: false,
              message: `Enrichissement CASCADE \xE9chou\xE9 (${cascadeResult.source})`,
              error: cascadeResult.error
            };
          }
          console.log(`[EnrichmentService CASCADE] \u2705 Donn\xE9es r\xE9cup\xE9r\xE9es via ${cascadeResult.provider} (${cascadeResult.cost}\u20AC)`);
          const companyData = this.buildCompanyDataFromCascade(cascadeResult.data, cleanIdentifier, identifierType, countryCode, userId);
          let company;
          let fieldsUpdated = [];
          if (existingCompany) {
            company = await storage.updateCompany(existingCompany.id, userId, companyData);
            fieldsUpdated = Object.keys(companyData);
            console.log(`[EnrichmentService CASCADE] \u{1F504} Company mise \xE0 jour`);
          } else {
            company = await storage.createCompany(companyData);
            fieldsUpdated = ["all"];
            console.log(`[EnrichmentService CASCADE] \u2728 Company cr\xE9\xE9e`);
          }
          const logData = {
            companyId: company.id,
            triggerType,
            triggerUserId: userId,
            source: cascadeResult.source,
            apiResponse: cascadeResult.data,
            fieldsUpdated,
            status: "success",
            cost: Math.round(cascadeResult.cost * 100),
            // Centimes
            fallbackUsed: cascadeResult.fallbackUsed ? "true" : "false",
            duration: cascadeResult.duration
          };
          const log2 = await storage.createEnrichmentLog(logData);
          console.log(`[EnrichmentService CASCADE] \u{1F4CA} Co\xFBt: ${cascadeResult.cost}\u20AC, Source: ${cascadeResult.source}, Fallback: ${cascadeResult.fallbackUsed}`);
          return {
            company,
            enrichmentLog: log2,
            success: true,
            message: `Enrichissement CASCADE via ${cascadeResult.source} (${cascadeResult.cost}\u20AC)`
          };
        } catch (error) {
          console.error("[EnrichmentService CASCADE] \u274C Erreur:", error);
          return {
            company: null,
            enrichmentLog: null,
            success: false,
            message: "Erreur lors de l'enrichissement CASCADE",
            error: error instanceof Error ? error.message : String(error)
          };
        }
      }
      /**
       * Nettoyer et valider un identifiant SIREN/SIRET
       */
      cleanIdentifier(identifier) {
        if (!identifier) return null;
        const clean = identifier.replace(/[\s\-\.]/g, "");
        if (!/^\d{9}$|^\d{14}$/.test(clean)) {
          return null;
        }
        return clean;
      }
      /**
       * Construire les données company à partir de l'enrichissement (Phase 2.8 : enrichissement complet)
       */
      buildCompanyData(enrichedData, identifier, identifierType, countryCode, userId) {
        const adresse = enrichedData.adresse;
        return {
          countryCode,
          identifierType,
          identifierValue: identifier,
          parentIdentifier: identifierType === "SIRET" ? identifier.substring(0, 9) : void 0,
          // Données légales
          legalName: enrichedData.nom,
          tradeName: enrichedData.nomCommercial,
          // Phase 2.8
          legalForm: enrichedData.formeJuridique,
          legalFormLabel: enrichedData.formeJuridiqueLibelle,
          // Phase 2.8
          nafCode: enrichedData.codeNAF,
          nafLabel: enrichedData.libelleNAF,
          creationDate: enrichedData.dateCreation,
          status: enrichedData.etatAdministratif === "Cess\xE9" ? "cessation" : "active",
          // Phase 2.8
          // Phase 2.8 : Données métier
          effectif: enrichedData.effectifTexte,
          effectifMin: enrichedData.effectifMin,
          effectifMax: enrichedData.effectifMax,
          capitalSocial: enrichedData.capital,
          numeroTVA: enrichedData.numeroTVA,
          // Phase 2.8 : État administratif
          etatAdministratif: enrichedData.etatAdministratif,
          dateCessation: enrichedData.dateCessation,
          // Phase 2.8 : Alertes juridiques
          procedureCollective: enrichedData.procedureCollective ? "true" : "false",
          procedureType: enrichedData.procedureType,
          procedureTypeLibelle: enrichedData.procedureTypeLibelle,
          procedureDate: enrichedData.procedureDate,
          tribunalCommerce: enrichedData.tribunalCommerce,
          // Phase 2.8 : Adresse complète
          addressLine1: adresse?.adresse,
          addressLine2: adresse?.adresseLigne2,
          postalCode: adresse?.codePostal,
          city: adresse?.ville,
          commune: adresse?.commune,
          department: adresse?.department,
          region: adresse?.region,
          country: adresse?.pays || "France",
          latitude: adresse?.latitude ? String(adresse.latitude) : void 0,
          longitude: adresse?.longitude ? String(adresse.longitude) : void 0,
          complementAddress: adresse?.complementAddress,
          // Phase 2.8 : Coordonnées
          phone: enrichedData.telephone,
          email: enrichedData.email,
          website: enrichedData.siteWeb,
          // Enrichissement
          enriched: "true",
          enrichmentSource: enrichedData.source,
          enrichmentDate: /* @__PURE__ */ new Date(),
          lastUpdate: /* @__PURE__ */ new Date(),
          createdBy: userId
        };
      }
      /**
       * PHASE 2.5/2.6 : Construire les données company à partir d'un enrichissement CASCADE
       * (utilisé par enrichByPhone et enrichWithCascade)
       */
      buildCompanyDataFromCascade(enrichedData, identifier, identifierType, countryCode, userId) {
        return this.buildCompanyData(
          enrichedData,
          identifier,
          identifierType,
          countryCode,
          userId
        );
      }
      /**
       * Calculer nombre de jours depuis une date
       */
      daysSince(date5) {
        const now = /* @__PURE__ */ new Date();
        const diffMs = now.getTime() - date5.getTime();
        return Math.floor(diffMs / (1e3 * 60 * 60 * 24));
      }
      /**
       * Obtenir les établissements d'un SIREN
       */
      async getCompanyEstablishments(siren) {
        return await storage.getCompaniesByParentIdentifier(siren);
      }
      /**
       * Obtenir l'historique d'enrichissement d'une company
       */
      async getEnrichmentHistory(companyId, limit = 10) {
        return await storage.getCompanyEnrichmentLogs(companyId, limit);
      }
      /**
       * PHASE 2.6 : Enrichir une entreprise par téléphone avec CASCADE
       * 
       * Flow : Téléphone → Pages Jaunes → SIRET → CASCADE INSEE → Pappers
       * Économies maintenues : 80-90% même via téléphone !
       */
      async enrichCompanyByPhone(phone, userId) {
        console.log(`[EnrichmentService] \u{1F4DE} D\xE9but enrichissement par t\xE9l\xE9phone: ${phone}`);
        try {
          if (!userId) {
            return {
              success: false,
              message: "Authentification requise",
              error: "userId manquant"
            };
          }
          const result = await this.orchestrator.enrichByPhone(phone);
          if (!result.data) {
            return {
              success: false,
              message: result.error || "Aucune entreprise trouv\xE9e",
              error: result.error,
              metadata: {
                entryPoint: "phone",
                phone,
                source: result.source,
                cost: result.cost,
                duration: result.duration
              }
            };
          }
          const companyData = this.buildCompanyDataFromCascade(
            result.data,
            result.phoneLookup?.siret || "",
            result.phoneLookup?.siret?.length === 14 ? "SIRET" : "SIREN",
            "FR",
            userId
          );
          if (result.phoneLookup) {
            companyData.phoneLookupSource = result.phoneLookup.source;
            companyData.phoneLookupConfidence = result.phoneLookup.confidence;
            companyData.phone = result.phoneLookup.phone;
          }
          const company = await storage.createCompany(companyData);
          const log2 = {
            companyId: company.id,
            triggerType: "manual",
            triggerUserId: userId,
            source: result.source,
            status: "success",
            cost: result.cost,
            fallbackUsed: result.fallbackUsed ? "true" : "false",
            duration: result.duration,
            phoneNumber: phone,
            phoneLookupSource: result.phoneLookup?.source
          };
          const enrichmentLog = await storage.createEnrichmentLog(log2);
          return {
            success: true,
            company,
            enrichmentLog,
            message: `Entreprise "${company.legalName}" trouv\xE9e et enrichie via ${result.source}`,
            metadata: {
              entryPoint: "phone",
              phone,
              phoneLookupSource: result.phoneLookup?.source,
              siret: result.phoneLookup?.siret,
              enrichmentSource: result.source,
              cost: result.cost,
              duration: result.duration,
              savingsRealized: result.cost === 0 ? 0.1 : 0
            }
          };
        } catch (error) {
          console.error(`[EnrichmentService] \u274C Erreur enrichissement t\xE9l\xE9phone ${phone}:`, error);
          return {
            success: false,
            message: "Erreur lors de l'enrichissement par t\xE9l\xE9phone",
            error: error instanceof Error ? error.message : String(error)
          };
        }
      }
    };
    enrichmentService = new EnrichmentService();
  }
});

// server/services/dataQualityService.ts
var dataQualityService_exports = {};
__export(dataQualityService_exports, {
  calculateDataQualityScore: () => calculateDataQualityScore,
  getEnrichmentCandidates: () => getEnrichmentCandidates,
  getQualityStats: () => getQualityStats,
  shouldEnrich: () => shouldEnrich,
  updateProspectQualityMetrics: () => updateProspectQualityMetrics
});
import { sql as sql24 } from "drizzle-orm";
function calculateDataQualityScore(prospect) {
  let score = 0;
  const legacySiren = prospect.legacy_siren || prospect.legacySiren;
  const siret = prospect.siret;
  if (legacySiren && /^\d{9}$/.test(legacySiren)) {
    score += 25;
  }
  if (siret && /^\d{14}$/.test(siret)) {
    score += 5;
  }
  const email = prospect.email;
  const telephone = prospect.telephone;
  const mobile = prospect.mobile;
  if (email) score += 10;
  if (telephone || mobile) score += 10;
  const nom = prospect.nom;
  const prenom = prospect.prenom;
  const fonction = prospect.fonction;
  if (nom && prenom) score += 10;
  if (fonction) score += 5;
  const adresse1 = prospect.adresse_1 || prospect.adresse1;
  const codePostal = prospect.code_postal || prospect.codePostal;
  const ville = prospect.ville;
  if (adresse1) score += 5;
  if (codePostal) score += 5;
  if (ville) score += 5;
  const effectifEntreprise = prospect.effectif_entreprise || prospect.effectifEntreprise;
  const chiffreAffaires = prospect.chiffre_affaires || prospect.chiffreAffaires;
  const secteur = prospect.secteur;
  if (effectifEntreprise) score += 7;
  if (chiffreAffaires) score += 7;
  if (secteur) score += 6;
  return Math.min(score, 100);
}
function shouldEnrich(prospect) {
  const legacySiren = prospect.legacy_siren || prospect.legacySiren;
  const siret = prospect.siret;
  const lastEnrichmentDate = prospect.last_enrichment_date || prospect.lastEnrichmentDate;
  if (!legacySiren && !siret) {
    return { should: false, reason: "Pas de SIREN", priority: 0 };
  }
  if (!lastEnrichmentDate) {
    return { should: true, reason: "Jamais enrichi", priority: 1 };
  }
  const score = calculateDataQualityScore(prospect);
  if (score < 30) {
    return { should: true, reason: `Score faible (${score}/100)`, priority: 1 };
  }
  const daysSince = (Date.now() - new Date(lastEnrichmentDate).getTime()) / (1e3 * 60 * 60 * 24);
  if (daysSince > 365) {
    return { should: true, reason: `Donn\xE9es >1 an`, priority: 2 };
  }
  if (score < 70 && daysSince > 180) {
    return { should: true, reason: `Score moyen (${score}/100)`, priority: 3 };
  }
  return { should: false, reason: "Donn\xE9es \xE0 jour", priority: 0 };
}
async function getEnrichmentCandidates(limit = 100) {
  try {
    const result = await db.execute(sql24`
      SELECT * FROM prospects
      WHERE (legacy_siren IS NOT NULL OR siret IS NOT NULL)
      AND (last_enrichment_date IS NULL OR data_quality_score < 70)
      ORDER BY data_quality_score ASC NULLS FIRST
      LIMIT ${limit}
    `);
    const candidates = result.rows;
    return candidates.filter((p) => shouldEnrich(p).should).sort((a, b) => shouldEnrich(a).priority - shouldEnrich(b).priority);
  } catch (error) {
    console.error("[Data Quality] Erreur r\xE9cup\xE9ration candidates:", error);
    return [];
  }
}
async function updateProspectQualityMetrics(prospectId) {
  try {
    const result = await db.execute(sql24`
      SELECT * FROM prospects WHERE id = ${prospectId}
    `);
    const prospect = result.rows[0];
    if (!prospect) return;
    const score = calculateDataQualityScore(prospect);
    await db.execute(sql24`
      UPDATE prospects
      SET data_quality_score = ${score}
      WHERE id = ${prospectId}
    `);
  } catch (error) {
    console.error("[Data Quality] Erreur update metrics:", error);
  }
}
async function getQualityStats() {
  try {
    const result = await db.execute(sql24`
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
    const row = result.rows[0];
    return {
      totalProspects: parseInt(row.total) || 0,
      avgQualityScore: parseFloat(row.avg_score) || 0,
      lowQuality: parseInt(row.low) || 0,
      mediumQuality: parseInt(row.medium) || 0,
      highQuality: parseInt(row.high) || 0,
      neverEnriched: parseInt(row.never_enriched) || 0,
      enrichmentNeeded: parseInt(row.low) + parseInt(row.never_enriched)
    };
  } catch (error) {
    console.error("[Data Quality] Erreur r\xE9cup\xE9ration stats:", error);
    return {
      totalProspects: 0,
      avgQualityScore: 0,
      lowQuality: 0,
      mediumQuality: 0,
      highQuality: 0,
      neverEnriched: 0,
      enrichmentNeeded: 0
    };
  }
}
var init_dataQualityService = __esm({
  "server/services/dataQualityService.ts"() {
    "use strict";
    init_db();
  }
});

// server/services/pappersFullEnrichmentService.ts
var pappersFullEnrichmentService_exports = {};
__export(pappersFullEnrichmentService_exports, {
  enrichProspectFull: () => enrichProspectFull
});
import axios3 from "axios";
import { eq as eq22 } from "drizzle-orm";
async function getPappersFullInfo(siret) {
  try {
    const apiToken = process.env.PAPPERS_API_KEY;
    if (!apiToken) {
      console.error("[ENRICH-FULL] \u274C PAPPERS_API_KEY non configur\xE9e");
      return null;
    }
    console.log(`[ENRICH-FULL] \u{1F504} Enrichissement complet pour SIRET: ${siret}`);
    const response = await axios3.get("https://api.pappers.fr/v2/entreprise", {
      params: {
        api_token: apiToken,
        siret
      },
      timeout: 1e4
    });
    if (response.status !== 200 || !response.data) {
      console.log(`[ENRICH-FULL] \u26A0\uFE0F Donn\xE9es non trouv\xE9es pour SIRET ${siret}`);
      return null;
    }
    return response.data;
  } catch (error) {
    if (error.code === "ECONNABORTED") {
      console.error(`[ENRICH-FULL] \u23F1\uFE0F Timeout pour SIRET ${siret}`);
    } else if (error.response) {
      console.error(`[ENRICH-FULL] \u274C Erreur API Pappers (${error.response.status}) pour ${siret}`);
    } else {
      console.error(`[ENRICH-FULL] \u274C Erreur r\xE9seau pour ${siret}:`, error.message);
    }
    return null;
  }
}
async function enrichProspectFull(prospectId, siret) {
  try {
    console.log(`[ENRICH-FULL] \u{1F680} D\xE9marrage enrichissement complet prospect ${prospectId}...`);
    const fullData = await getPappersFullInfo(siret);
    if (!fullData) {
      console.error(`[ENRICH-FULL] \u274C Donn\xE9es Pappers non disponibles pour SIRET ${siret}`);
      return false;
    }
    let dirigeantPrincipal = null;
    if (fullData.representant_legal) {
      const rep = fullData.representant_legal;
      dirigeantPrincipal = `${rep.prenoms || ""} ${rep.nom || ""} (${rep.qualite || "Dirigeant"})`.trim();
    } else if (fullData.representants && fullData.representants.length > 0) {
      const rep = fullData.representants[0];
      dirigeantPrincipal = `${rep.prenoms || ""} ${rep.nom || ""} (${rep.qualite || "Dirigeant"})`.trim();
    }
    const dateCreation = fullData.date_creation || fullData.date_creation_entreprise;
    const dateCreationEntreprise = dateCreation || null;
    const capitalSocial = fullData.capital ? `${fullData.capital.toLocaleString("fr-FR")} \u20AC` : null;
    const effectifEntreprise = fullData.tranche_effectif || fullData.effectif || null;
    const nombreEtablissements = fullData.nombre_etablissements_actifs || fullData.nombre_etablissements || null;
    const statutEntreprise = fullData.statut_rcs || fullData.statut || null;
    const formeJuridique = fullData.forme_juridique || null;
    const chiffreAffaires = fullData.chiffre_affaires ? fullData.chiffre_affaires.toString() : null;
    await db.update(prospects).set({
      capitalSocial,
      formeJuridique,
      dateCreationEntreprise,
      effectifEntreprise,
      chiffreAffaires,
      dirigeantPrincipal,
      nombreEtablissements,
      statutEntreprise,
      isFullyEnriched: "true",
      enrichedAt: /* @__PURE__ */ new Date(),
      pappersRawData: fullData
    }).where(eq22(prospects.id, prospectId));
    console.log(`[ENRICH-FULL] \u2705 Prospect ${prospectId} enrichi avec succ\xE8s`);
    console.log(`[ENRICH-FULL]    - Capital: ${capitalSocial || "N/A"}`);
    console.log(`[ENRICH-FULL]    - Forme: ${formeJuridique || "N/A"}`);
    console.log(`[ENRICH-FULL]    - Effectif: ${effectifEntreprise || "N/A"}`);
    console.log(`[ENRICH-FULL]    - Dirigeant: ${dirigeantPrincipal || "N/A"}`);
    console.log(`[ENRICH-FULL]    - CA: ${chiffreAffaires ? `${chiffreAffaires} \u20AC` : "N/A"}`);
    return true;
  } catch (error) {
    console.error(`[ENRICH-FULL] \u274C Erreur enrichissement complet prospect ${prospectId}:`, error);
    return false;
  }
}
var init_pappersFullEnrichmentService = __esm({
  "server/services/pappersFullEnrichmentService.ts"() {
    "use strict";
    init_db();
    init_schema();
  }
});

// server/services/pappersEnrichmentService.ts
var pappersEnrichmentService_exports = {};
__export(pappersEnrichmentService_exports, {
  enrichSiretQuick: () => enrichSiretQuick
});
import axios4 from "axios";
function mapNafToSecteur(codeNaf, activitePrincipale = "") {
  if (!codeNaf) codeNaf = "";
  const nafMapping = {
    "47.73": "pharmacie",
    "47.11": "commerce_alimentaire",
    "47.19": "commerce_alimentaire",
    "47.2": "commerce_alimentaire",
    "56.10": "restaurant_traditionnel",
    "56.21": "restaurant_traditionnel",
    "56.30": "restaurant_traditionnel",
    "55.": "restaurant_traditionnel"
  };
  for (const [nafPrefix, secteur] of Object.entries(nafMapping)) {
    if (codeNaf.startsWith(nafPrefix)) {
      return secteur;
    }
  }
  if (activitePrincipale) {
    const activiteLower = activitePrincipale.toLowerCase();
    if (["pharmacie", "pharmaceutique", "sant\xE9", "officine", "m\xE9dical"].some((w) => activiteLower.includes(w))) {
      return "pharmacie";
    }
    if (["restaurant", "traiteur", "h\xF4tel", "caf\xE9", "bar", "brasserie"].some((w) => activiteLower.includes(w))) {
      return "restaurant_traditionnel";
    }
    if (["commerce", "magasin", "supermarch\xE9", "alimentaire", "\xE9picerie"].some((w) => activiteLower.includes(w))) {
      return "commerce_alimentaire";
    }
  }
  return "autres_secteurs_structure";
}
async function getPappersBasicInfo(siret) {
  try {
    const apiToken = process.env.PAPPERS_API_KEY;
    if (!apiToken) {
      console.error("\u274C PAPPERS_API_KEY non configur\xE9e");
      return null;
    }
    const response = await axios4.get("https://api.pappers.fr/v2/entreprise", {
      params: {
        api_token: apiToken,
        siret
      },
      timeout: 3e3
      // 3 secondes max
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
    console.error("Erreur Pappers l\xE9ger:", error);
    return null;
  }
}
async function enrichSiretQuick(siret) {
  try {
    if (!siret || siret.length !== 14 || !/^\d{14}$/.test(siret)) {
      return { success: false, error: "SIRET invalide (14 chiffres requis)" };
    }
    console.log(`[ENRICH-NODE] \u{1F50D} Enrichissement SIRET rapide : ${siret}`);
    const pappersData = await getPappersBasicInfo(siret);
    if (!pappersData) {
      console.log(`[ENRICH-NODE] \u274C SIRET non trouv\xE9`);
      return { success: false, error: "SIRET non trouv\xE9 dans la base Pappers" };
    }
    const secteur = mapNafToSecteur(pappersData.code_naf, pappersData.activite_principale);
    console.log(`[ENRICH-NODE] \u2705 Donn\xE9es enrichies`);
    console.log(`[ENRICH-NODE]    - Raison sociale : ${pappersData.nom_entreprise}`);
    console.log(`[ENRICH-NODE]    - Secteur : ${secteur} (NAF: ${pappersData.code_naf})`);
    return {
      success: true,
      data: {
        raison_sociale: pappersData.nom_entreprise,
        enseigne_commerciale: pappersData.nom_commercial || pappersData.nom_entreprise,
        secteur,
        adresse: pappersData.adresse_complete,
        ville: pappersData.ville,
        code_postal: pappersData.code_postal,
        siren: pappersData.siren
      }
    };
  } catch (error) {
    console.error("[ENRICH-NODE] \u274C Erreur enrichissement SIRET:", error);
    return { success: false, error: "Erreur serveur lors de l'enrichissement" };
  }
}
var init_pappersEnrichmentService = __esm({
  "server/services/pappersEnrichmentService.ts"() {
    "use strict";
  }
});

// server/services/rdvPreparationService.ts
var rdvPreparationService_exports = {};
__export(rdvPreparationService_exports, {
  RdvPreparationError: () => RdvPreparationError,
  getPreparation: () => getPreparation,
  listPreparations: () => listPreparations,
  prepareRdv: () => prepareRdv
});
import { eq as eq23 } from "drizzle-orm";
import axios5 from "axios";
import { format } from "date-fns";
async function prepareRdv(rdvId, userId) {
  const startTime = Date.now();
  try {
    const rdv = await db.query.rdvs.findFirst({
      where: eq23(rdvs.id, rdvId),
      with: {
        prospect: true,
        opportunity: true
      }
    });
    if (!rdv) {
      throw new RdvPreparationError("RDV introuvable", "RDV_NOT_FOUND");
    }
    if (rdv.userId !== userId) {
      throw new RdvPreparationError("Acc\xE8s non autoris\xE9", "UNAUTHORIZED");
    }
    const newPreparation = await db.insert(rdvPreparations).values({
      rdvId: rdv.id,
      userId,
      statut: "en_cours"
    }).returning();
    const preparationId = newPreparation[0].id;
    const entreprise = rdv.prospect?.entreprise || "";
    const ville = rdv.prospect?.ville || "";
    const codePostal = rdv.prospect?.codePostal || "";
    const contactNom = rdv.prospect?.nom || "";
    const contactPrenom = rdv.prospect?.prenom || "";
    const secteur = rdv.prospect?.secteur || "";
    console.log("[RDV PREP] \u{1F4CB} Informations RDV extraites:");
    console.log(`   Entreprise: ${entreprise}`);
    console.log(`   Contact: ${contactPrenom} ${contactNom}`);
    console.log(`   Secteur: ${secteur}`);
    let pdfUrl = null;
    let pdfPath = null;
    let pdfBase64 = null;
    try {
      const rdvData = {
        entreprise: entreprise || "Entreprise inconnue",
        contact_nom: contactNom || "Nom inconnu",
        contact_prenom: contactPrenom || "Pr\xE9nom inconnu",
        date_rdv: rdv.dateRdv ? format(new Date(rdv.dateRdv), "dd/MM/yyyy") : format(/* @__PURE__ */ new Date(), "dd/MM/yyyy"),
        heure_rdv: rdv.dateRdv ? format(new Date(rdv.dateRdv), "HH:mm") : "10:00",
        lieu: rdv.lieu || "\xC0 d\xE9finir",
        secteur: secteur || "",
        ville: ville || "",
        code_postal: codePostal || "",
        rdv_id: rdv.id
      };
      console.log("[RDV PREP] \u{1F4E4} Envoi requ\xEAte vers orchestrateur Python:", rdvData);
      const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || "http://localhost:5001";
      const pdfResponse = await axios5.post(
        `${pythonServiceUrl}/api/generate-rdv-preparation`,
        rdvData,
        {
          timeout: 18e4
          // 180s (3 min) pour le workflow complet (Pappers + Brave + Claude DISC + PDF)
        }
      );
      console.log("[RDV PREP] \u{1F4E5} R\xE9ponse re\xE7ue de l'orchestrateur");
      const responseData = pdfResponse.data;
      if (!responseData.success || !responseData.pdf_base64) {
        throw new Error("Le service Python n'a pas retourn\xE9 de PDF valide");
      }
      const cleanEntreprise = entreprise.toUpperCase().replace(/[^A-Z0-9]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "").substring(0, 50);
      const dateRdv = new Date(rdv.dateRdv);
      const dateStr = dateRdv.toISOString().split("T")[0];
      const fileName = `preparation_rdv_${cleanEntreprise}_${dateStr}.pdf`;
      pdfPath = `/uploads/rdv-preparations/${fileName}`;
      pdfUrl = pdfPath;
      console.log("[RDV PREP] \u{1F4C4} Nom fichier PDF g\xE9n\xE9r\xE9 :", fileName);
      const pdfBuffer = Buffer.from(responseData.pdf_base64, "base64");
      const pdfSize = pdfBuffer.length;
      const fs3 = await import("fs/promises");
      const path4 = await import("path");
      const uploadDir = path4.join(process.cwd(), "uploads", "rdv-preparations");
      await fs3.mkdir(uploadDir, { recursive: true });
      await fs3.writeFile(path4.join(process.cwd(), pdfPath), pdfBuffer);
      console.log("[RDV PREP] \u{1F4BE} PDF sauvegard\xE9:");
      console.log(`   Chemin: ${pdfPath}`);
      console.log(`   Taille: ${(pdfSize / 1024).toFixed(2)} KB`);
      pdfBase64 = responseData.pdf_base64;
      await db.update(rdvs).set({
        pdfPath,
        pdfUrl,
        pdfGeneratedAt: /* @__PURE__ */ new Date(),
        dossierPreparation: {
          preparationId,
          datePreparation: (/* @__PURE__ */ new Date()).toISOString(),
          pdfSize,
          fileName,
          // TODO: Remove pdfBase64 in production - serve from filesystem instead
          pdfBase64
        }
      }).where(eq23(rdvs.id, rdvId));
      const orchestratorSteps = responseData.steps || {};
      await db.update(rdvPreparations).set({
        donnesPappers: orchestratorSteps.collecte?.pappers || null,
        donnesBraveSearch: orchestratorSteps.collecte?.brave || null,
        analyseDisc: orchestratorSteps.disc_analysis || null,
        erreurPappers: orchestratorSteps.collecte?.status === "error" ? "Erreur collecte Pappers" : null,
        erreurBraveSearch: orchestratorSteps.collecte?.status === "error" ? "Erreur recherche web" : null,
        erreurClaudeDisc: orchestratorSteps.disc_analysis?.status === "error" ? "Erreur analyse DISC" : null
      }).where(eq23(rdvPreparations.id, preparationId));
    } catch (error) {
      console.error("\u274C [RDV PREP] Erreur g\xE9n\xE9ration PDF:", error);
      const errorMessage = error.message || "Erreur lors de la g\xE9n\xE9ration du PDF";
      await db.update(rdvPreparations).set({
        statut: "erreur",
        erreurPdfGeneration: errorMessage,
        completedAt: /* @__PURE__ */ new Date(),
        dureeTotale: Date.now() - startTime
      }).where(eq23(rdvPreparations.id, preparationId));
      throw new RdvPreparationError(errorMessage, "PDF_GENERATION_ERROR");
    }
    const dureeTotale = Date.now() - startTime;
    await db.update(rdvPreparations).set({
      statut: "complete",
      pdfPath,
      pdfUrl,
      dureeTotale,
      completedAt: /* @__PURE__ */ new Date()
    }).where(eq23(rdvPreparations.id, preparationId));
    console.log(`\u2705 [RDV PREP] Pr\xE9paration termin\xE9e en ${(dureeTotale / 1e3).toFixed(1)}s`);
    return {
      success: true,
      preparationId,
      pdfUrl,
      pdfPath,
      pdfBuffer: pdfBase64,
      // Base64-encoded PDF for frontend download
      dureeTotale
    };
  } catch (error) {
    console.error("Erreur pr\xE9paration RDV:", error);
    throw new RdvPreparationError(
      error.message || "Erreur lors de la pr\xE9paration du RDV",
      error.code
    );
  }
}
async function getPreparation(preparationId, userId) {
  try {
    const preparation = await db.query.rdvPreparations.findFirst({
      where: eq23(rdvPreparations.id, preparationId),
      with: {
        rdv: true
      }
    });
    if (!preparation) {
      throw new RdvPreparationError("Pr\xE9paration introuvable", "PREPARATION_NOT_FOUND");
    }
    if (preparation.userId !== userId) {
      throw new RdvPreparationError("Acc\xE8s non autoris\xE9", "UNAUTHORIZED");
    }
    return preparation;
  } catch (error) {
    throw new RdvPreparationError(
      error.message || "Erreur lors de la r\xE9cup\xE9ration de la pr\xE9paration",
      error.code
    );
  }
}
async function listPreparations(userId) {
  try {
    const preparations = await db.query.rdvPreparations.findMany({
      where: eq23(rdvPreparations.userId, userId),
      with: {
        rdv: true
      },
      orderBy: (rdvPreparations2, { desc: desc13 }) => [desc13(rdvPreparations2.createdAt)]
    });
    return preparations;
  } catch (error) {
    throw new RdvPreparationError(
      error.message || "Erreur lors de la r\xE9cup\xE9ration des pr\xE9parations",
      error.code
    );
  }
}
var RdvPreparationError;
var init_rdvPreparationService = __esm({
  "server/services/rdvPreparationService.ts"() {
    "use strict";
    init_db();
    init_schema();
    RdvPreparationError = class extends Error {
      constructor(message, code) {
        super(message);
        this.code = code;
        this.name = "RdvPreparationError";
      }
    };
  }
});

// server/services/batchImportService.ts
var batchImportService_exports = {};
__export(batchImportService_exports, {
  getBatchImportHistory: () => getBatchImportHistory,
  getBatchImportStatus: () => getBatchImportStatus,
  startBatchImport: () => startBatchImport
});
import Papa from "papaparse";
import { eq as eq24, and as and18 } from "drizzle-orm";
async function startBatchImport(userId, entity, filename, csvContent, mapping, options = {}) {
  try {
    const parsed = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim()
    });
    if (parsed.errors.length > 0) {
      throw new Error(`Erreur parsing CSV: ${parsed.errors[0].message}`);
    }
    const rows = parsed.data;
    const totalRows = rows.length;
    if (totalRows === 0) {
      throw new Error("Fichier CSV vide");
    }
    if (totalRows > 1e3) {
      throw new Error(`Maximum 1000 lignes par import (fichier: ${totalRows})`);
    }
    const effectiveOptions = {
      autoEnrich: options.autoEnrich ?? true,
      deduplicate: options.deduplicate ?? true,
      skipDuplicates: options.skipDuplicates ?? true
    };
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
      status: "pending"
    }).returning();
    const importProspects = rows.map((row, index6) => ({
      batchImportId: batchImport.id,
      rowNumber: index6 + 1,
      rawData: row,
      status: "pending"
    }));
    await db.insert(batchImportProspects).values(importProspects);
    processBatchImportAsync(batchImport.id, userId, entity, mapping, effectiveOptions).catch((err) => console.error("[Batch Import] Erreur async:", err));
    return {
      batchId: batchImport.id,
      status: "processing",
      message: `Import de ${totalRows} prospects d\xE9marr\xE9`
    };
  } catch (error) {
    console.error("[Batch Import] Erreur d\xE9marrage:", error);
    throw error;
  }
}
async function processBatchImportAsync(batchId, userId, entity, mapping, options) {
  try {
    await db.update(batchImports).set({
      status: "processing",
      startedAt: /* @__PURE__ */ new Date()
    }).where(eq24(batchImports.id, batchId));
    const importProspectsList = await db.query.batchImportProspects.findMany({
      where: and18(
        eq24(batchImportProspects.batchImportId, batchId),
        eq24(batchImportProspects.status, "pending")
      ),
      orderBy: (bip, { asc }) => [asc(bip.rowNumber)]
    });
    let successCount = 0;
    let errorCount = 0;
    let duplicateCount = 0;
    const errors = [];
    for (let i = 0; i < importProspectsList.length; i++) {
      const importProspect = importProspectsList[i];
      try {
        const prospectData = mapCSVRowToProspect(
          importProspect.rawData,
          mapping,
          entity,
          userId
        );
        if (options.deduplicate) {
          const isDuplicate = await checkDuplicate(prospectData, entity);
          if (isDuplicate) {
            duplicateCount++;
            await db.update(batchImportProspects).set({
              status: "duplicate",
              errorMessage: "Prospect d\xE9j\xE0 existant"
            }).where(eq24(batchImportProspects.id, importProspect.id));
            if (options.skipDuplicates) {
              continue;
            }
          }
        }
        const [newProspect] = await db.insert(prospects).values(prospectData).returning();
        if (options.autoEnrich && prospectData.legacySiren) {
          import("./enrichmentCascadeService").then(({ enrichProspectCascade }) => {
            enrichProspectCascade(newProspect.id, prospectData.legacySiren, userId).catch((err) => console.error("[Batch] Erreur enrichissement:", err));
          }).catch(() => {
            console.warn("[Batch] Service enrichissement non disponible");
          });
        }
        successCount++;
        await db.update(batchImportProspects).set({
          status: "success",
          prospectId: newProspect.id
        }).where(eq24(batchImportProspects.id, importProspect.id));
      } catch (error) {
        errorCount++;
        const errorMsg = error instanceof Error ? error.message : "Erreur inconnue";
        errors.push({
          row: importProspect.rowNumber,
          error: errorMsg,
          data: importProspect.rawData
        });
        await db.update(batchImportProspects).set({
          status: "error",
          errorMessage: errorMsg
        }).where(eq24(batchImportProspects.id, importProspect.id));
      }
      const progress = Math.round((i + 1) / importProspectsList.length * 100);
      await db.update(batchImports).set({
        progress,
        processedRows: i + 1,
        successCount,
        errorCount,
        duplicateCount
      }).where(eq24(batchImports.id, batchId));
    }
    await db.update(batchImports).set({
      status: "completed",
      completedAt: /* @__PURE__ */ new Date(),
      errors: errors.slice(0, 100)
      // Garder max 100 erreurs
    }).where(eq24(batchImports.id, batchId));
    console.log(`[Batch Import] Termin\xE9: ${successCount} succ\xE8s, ${errorCount} erreurs, ${duplicateCount} doublons`);
  } catch (error) {
    console.error("[Batch Import] Erreur traitement:", error);
    await db.update(batchImports).set({
      status: "failed",
      completedAt: /* @__PURE__ */ new Date()
    }).where(eq24(batchImports.id, batchId));
  }
}
function mapCSVRowToProspect(row, mapping, entity, userId) {
  const prospect = {
    entity,
    userId,
    statut: "nouveau",
    origine: "import_csv",
    dateCreation: /* @__PURE__ */ new Date()
  };
  for (const [csvColumn, dbField] of Object.entries(mapping)) {
    const value = row[csvColumn];
    if (value && String(value).trim() !== "") {
      if (dbField === "siren") {
        prospect.legacySiren = String(value).trim();
      } else {
        prospect[dbField] = String(value).trim();
      }
    }
  }
  if (!prospect.entreprise && !prospect.nom) {
    throw new Error("Entreprise ou Nom requis");
  }
  if (!prospect.entreprise && prospect.nom) {
    prospect.entreprise = prospect.nom;
  }
  if (prospect.telephone) {
    prospect.telephone = normalizePhone(prospect.telephone);
  }
  if (prospect.mobile) {
    prospect.mobile = normalizePhone(prospect.mobile);
  }
  if (prospect.email) {
    prospect.email = prospect.email.toLowerCase();
    if (!isValidEmail(prospect.email)) {
      throw new Error(`Email invalide: ${prospect.email}`);
    }
  }
  if (prospect.legacySiren) {
    prospect.legacySiren = normalizeSiren(prospect.legacySiren);
  }
  if (prospect.siret) {
    prospect.siret = normalizeSiret(prospect.siret);
  }
  return prospect;
}
async function checkDuplicate(prospectData, entity) {
  if (prospectData.legacySiren) {
    const existing = await db.query.prospects.findFirst({
      where: and18(
        eq24(prospects.legacySiren, prospectData.legacySiren),
        eq24(prospects.entity, entity)
      )
    });
    if (existing) return true;
  }
  if (prospectData.siret) {
    const existing = await db.query.prospects.findFirst({
      where: and18(
        eq24(prospects.siret, prospectData.siret),
        eq24(prospects.entity, entity)
      )
    });
    if (existing) return true;
  }
  if (prospectData.email) {
    const existing = await db.query.prospects.findFirst({
      where: and18(
        eq24(prospects.email, prospectData.email),
        eq24(prospects.entity, entity)
      )
    });
    if (existing) return true;
  }
  if (prospectData.telephone) {
    const existing = await db.query.prospects.findFirst({
      where: and18(
        eq24(prospects.telephone, prospectData.telephone),
        eq24(prospects.entity, entity)
      )
    });
    if (existing) return true;
  }
  return false;
}
function normalizePhone(phone) {
  let normalized = phone.replace(/[\s\.\-\(\)]/g, "");
  if (normalized.startsWith("0") && normalized.length === 10) {
    normalized = "+33" + normalized.substring(1);
  }
  return normalized;
}
function normalizeSiren(siren) {
  const cleaned = siren.replace(/[\s\.\-]/g, "");
  if (!/^\d{9}$/.test(cleaned)) {
    throw new Error(`SIREN invalide: ${siren} (doit \xEAtre 9 chiffres)`);
  }
  return cleaned;
}
function normalizeSiret(siret) {
  const cleaned = siret.replace(/[\s\.\-]/g, "");
  if (!/^\d{14}$/.test(cleaned)) {
    throw new Error(`SIRET invalide: ${siret} (doit \xEAtre 14 chiffres)`);
  }
  return cleaned;
}
function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}
async function getBatchImportStatus(batchId) {
  const batchImport = await db.query.batchImports.findFirst({
    where: eq24(batchImports.id, batchId),
    with: {
      // Relations si définies dans schema
    }
  });
  if (!batchImport) {
    throw new Error("Import non trouv\xE9");
  }
  return batchImport;
}
async function getBatchImportHistory(userId, limit = 20) {
  const imports = await db.query.batchImports.findMany({
    where: eq24(batchImports.userId, userId),
    orderBy: (bi, { desc: desc13 }) => [desc13(bi.createdAt)],
    limit
  });
  return imports;
}
var init_batchImportService = __esm({
  "server/services/batchImportService.ts"() {
    "use strict";
    init_db();
    init_schema();
  }
});

// server/index.ts
import express10 from "express";
import session2 from "express-session";

// server/routes.ts
init_storage();
import { createServer } from "http";

// server/services/claudeService.ts
import Anthropic from "@anthropic-ai/sdk";

// server/knowledge-base/adn-hector-content.ts
var ADN_HECTOR_CONTENT = `\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
                    ADN HECTOR READY v6.2 - MODULES 1 \xC0 15
\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

Version : 6.2
Date : 25 octobre 2025
Syst\xE8me : 15 Modules Autonomes pour Intelligence Commerciale Augment\xE9e
Entreprise : ADS GROUP Security

\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
                        TABLE DES MATI\xC8RES - MODULES 1-15
\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

MODULE 1 : IDENTIT\xC9 & MISSION HECTOR READY
MODULE 2 : M\xC9THODE MOODSHOW
MODULE 3 : ARCHITECTURE IA QUAD-CORE
MODULE 4 : ARGUMENTAIRE 12 PHASES
MODULE 5 : MODULES \xC9MOTIONNELS STRAT\xC9GIQUES
MODULE 6 : INTELLIGENCE COMPORTEMENTALE DISC + PNL
MODULE 7 : FORMATION ADSCHOOL NEXT GEN
MODULE 8 : PILOTAGE & MANAGEMENT COMMERCIAL
MODULE 9 : PROSPECTION INTELLIGENTE
MODULE 10 : OBJECTIONS MASTERY
MODULE 11 : FICHES M\xC9TIERS 50+ SECTEURS
MODULE 12 : AUTOMATISATIONS HECTOR
MODULE 13 : ORGANISATION & R\xD4LES ADS GROUP SECURITY
MODULE 14 : WORKFLOWS COLLABORATIFS
MODULE 15 : S\xC9CURIT\xC9 & SURVEILLANCE API

\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
                MODULE 1 : IDENTIT\xC9 & MISSION HECTOR READY
\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

R\xC9SUM\xC9 MODULE 1:
Hector Ready est le CRM intelligent nouvelle g\xE9n\xE9ration d'ADS GROUP SECURITY.
Mission: Transformer chaque commercial en expert augment\xE9 par l'IA.
Architecture Quad-Core: SmartDetect + LISA + HazeFlow 2 + DualTone.
Philosophie MOODSHOW: Comprendre l'humain pour mieux accompagner.

\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
                MODULE 2 : M\xC9THODE MOODSHOW
\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

R\xC9SUM\xC9 MODULE 2:
M - Meet: Prise de contact
O - Observe: Observation comportementale  
O - Open: Ouverture relationnelle
D - Discover: D\xE9couverte besoins
S - Show: D\xE9monstration valeur
H - Handle: Traitement objections
O - Offer: Proposition commerciale
W - Win: Closing et signature
Approche centr\xE9e client avec adaptation DISC.

\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
                MODULE 3 : ARCHITECTURE IA QUAD-CORE
\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

R\xC9SUM\xC9 MODULE 3:
4 Technologies IA compl\xE9mentaires:

1. SmartDetect: Vision IA (analyse vid\xE9o comportementale)
2. LISA: Audio IA (d\xE9tection menaces sonores)
3. HazeFlow 2: Vision nocturne (clart\xE9 parfaite nuit/brouillard)
4. DualTone: Confirmation bi-modale (visuel + audio)

Avantages: R\xE9duction 99% fausses alarmes, d\xE9tection proactive, fiabilit\xE9 maximale.

\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
                MODULE 4 : ARGUMENTAIRE 12 PHASES
\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

R\xC9SUM\xC9 MODULE 4:
Les 12 phases du RDV commercial structur\xE9:

Phase 1: Pr\xE9paration
Phase 2: Prise de contact
Phase 3: Mise en confiance
Phase 4: D\xE9couverte situation
Phase 5: Identification besoins
Phase 6: Coup de Casse (\xE9lectrochoc)
Phase 7: Pr\xE9sentation solution
Phase 8: D\xE9monstration valeur
Phase 9: Traitement objections
Phase 10: Pr\xE9sentation conditions
Phase 11: Closing
Phase 12: Prise de RDV2 ou signature

Dur\xE9e totale: 60-90 minutes optimis\xE9es.

\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
                MODULE 5 : MODULES \xC9MOTIONNELS STRAT\xC9GIQUES
\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

R\xC9SUM\xC9 MODULE 5:
3 modules \xE9motionnels puissants:

1. COUP DE CASSE: Cr\xE9er \xE9lectrochoc pour d\xE9clencher urgence
   - Statistiques choc sectorielles
   - Co\xFBt d'un sinistre visualis\xE9
   - Sc\xE9nario catastrophe personnalis\xE9

2. PRISE DE CONSCIENCE IMM\xC9DIATE (PDM): Faire r\xE9aliser vuln\xE9rabilit\xE9 actuelle
   - Questions miroir
   - Visualisation risques
   - Quantification impact

3. EFFET WAOUH: D\xE9monstration spectaculaire technologie
   - D\xE9mo live impressionnante
   - Comparaison avant/apr\xE8s
   - T\xE9moignages clients transform\xE9s

D\xE9clenchent \xE9motion \u2192 d\xE9cision rapide.

\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
                MODULE 6 : INTELLIGENCE COMPORTEMENTALE DISC + PNL
\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

R\xC9SUM\xC9 MODULE 6:
Profils DISC pour adaptation commerciale:

D - DOMINANT (Rouge): Direct, orient\xE9 r\xE9sultats, impatient
\u2192 Adaptation: \xCAtre concis, parler ROI, aller droit au but

I - INFLUENT (Jaune): Social, enthousiaste, relationnel  
\u2192 Adaptation: Storytelling, \xE9motion, preuve sociale

S - STABLE (Vert): Patient, loyal, s\xE9curitaire
\u2192 Adaptation: Rassurer, t\xE9moignages, garanties

C - CONFORME (Bleu): Analytique, pr\xE9cis, m\xE9thodique
\u2192 Adaptation: Donn\xE9es chiffr\xE9es, documentation, d\xE9tails techniques

Indicateurs de d\xE9tection: Langage verbal + non-verbal + comportement.
Adaptation en temps r\xE9el pour maximiser closing.

\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
                MODULE 7 : FORMATION ADSCHOOL NEXT GEN
\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

R\xC9SUM\xC9 MODULE 7:
ADSchool = Centre de formation augment\xE9 par IA

4 NIVEAUX DE CERTIFICATION:
- Bronze (1-2 mois): Fondations Hector Ready
- Argent (3-4 mois): Techniques avanc\xE9es  
- Or (6-8 mois): Expertise compl\xE8te
- Platine (12+ mois): Formateur agr\xE9\xE9

FORMAT:
- Micro-learning quotidien (10 min/jour)
- Parcours personnalis\xE9 adapt\xE9 aux gaps
- Sparring Partner IA pour simulations
- Validation par RDV r\xE9els supervis\xE9s

BIBLIOTH\xC8QUE:
- 200+ vid\xE9os
- 12 modules documentaires
- 500+ sc\xE9narios simulation
- Tableaux de bord progression

Objectif: Former ne suffit plus, il faut augmenter.

\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
                MODULE 8 : PILOTAGE & MANAGEMENT COMMERCIAL
\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

R\xC9SUM\xC9 MODULE 8:
Pilotage commercial structur\xE9 par r\xF4le:

DASHBOARDS PAR R\xD4LE:
- SDR (Visio): Contrats visio, MRR, transferts BD/IC
- BD (Terrain): Contrats terrain, taux signature R1, affaires chaudes
- IC (Reconduction): Taux reconduction, nouveau business
- Chef des Ventes: Performance \xE9quipe BD + perso
- DG/Pr\xE9sident: Vue consolid\xE9e groupe

AFFAIRES CHAUDES:
- D\xE9finition: R1 sans signature \u2192 R2 obligatoire sous 7j
- Alertes ROUGE/ORANGE selon urgence
- Suivi conjoint commercial + manager
- Taux transformation R2: objectif 60-70%

RITUELS MANAGEMENT:
- Daily: Check dashboard (matin 15min, soir 10min)
- Weekly: R\xE9union \xE9quipe lundi + 1-on-1 vendredi
- Monthly: Bilan mois + formation th\xE9matique
- Quarterly: S\xE9minaire commercial

KPIs GLOBAUX:
- ARR objectif: 6M\u20AC
- Taux signature R1: >70%
- MRR growth: +8%/mois
- Satisfaction \xE9quipe: 4.3/5

Philosophie: Ce qui ne se mesure pas ne s'am\xE9liore pas.

\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
                MODULE 9 : PROSPECTION INTELLIGENTE
\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

R\xC9SUM\xC9 MODULE 9:
Prospection optimis\xE9e data-driven

SYST\xC8ME SCORING PR\xC9DICTIF (0-100):
- Fit Profil (40 pts): Secteur, taille, zone, d\xE9cideur
- Engagement (30 pts): Visites site, t\xE9l\xE9chargements, r\xE9ponses
- Timing (20 pts): \xC9v\xE9nement d\xE9clencheur, renouvellement
- Budget (10 pts): Budget confirm\xE9/probable

Cat\xE9gories: HOT (80-100) | WARM (60-79) | COLD (40-59) | FREEZER (0-39)

7 CANAUX OPTIMIS\xC9S (par ROI d\xE9croissant):
1. Referral/Apporteurs: ROI 450%, Taux conv. 55%
2. Inbound (site web): ROI 380%, Taux conv. 42%
3. LinkedIn Outreach: ROI 220%, Taux conv. 28%
4. Email Cold: ROI 180%, Taux conv. 18%
5. Phoning Qualifi\xE9: ROI 160%, Taux conv. 22%
6. \xC9v\xE9nements Locaux: ROI 140%, Taux conv. 32%
7. Partenariats: ROI 200%, Taux conv. 35%

QUALIFICATION BANT+:
- Budget: Enveloppe allou\xE9e ou co\xFBt sinistre
- Authority: D\xE9cideur final identifi\xE9
- Need: Besoin explicite/latent/\xE0 cr\xE9er
- Timing: <1 mois = HOT, >6 mois = COLD
- Pain: Douleur \xE9motionnelle + financi\xE8re + op\xE9rationnelle

NURTURING AUTOMATIS\xC9:
- S\xE9quence COLD\u2192WARM: 30 jours, 8 touchpoints
- S\xE9quence WARM\u2192HOT: 15 jours, 7 touchpoints

Objectif: +35% taux conversion via ciblage pr\xE9cis.

\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
                MODULE 10 : OBJECTIONS MASTERY
\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

R\xC9SUM\xC9 MODULE 10:
Transformer les objections en opportunit\xE9s

M\xC9THODE 4A UNIVERSELLE:
1. ACCUEILLIR: Valider sans juger ("Je comprends votre pr\xE9occupation")
2. ANALYSER: Creuser la vraie raison ("Qu'est-ce qui vous fait dire \xE7a?")
3. ARGUMENTER: R\xE9pondre pr\xE9cis\xE9ment avec preuves
4. AVANCER: Faire progresser ("Est-ce que cela r\xE9pond \xE0 votre pr\xE9occupation?")

3 TYPES D'OBJECTIONS:
- R\xC9ELLE (30%): Probl\xE8me concret \u2192 Traiter avec 4A complet
- R\xC9FLEXE (50%): D\xE9fense automatique \u2192 Rassurer rapidement  
- MASQU\xC9E (20%): Cache vraie raison \u2192 Investiguer en profondeur

47 OBJECTIONS CATALOGU\xC9ES:
- Prix (12): "C'est trop cher", "Pas de budget", "Moins cher ailleurs"
- Timing (8): "Je vais r\xE9fl\xE9chir", "On verra plus tard"
- Concurrence (7): "Je dois comparer", "Concurrent moins cher"
- Confiance (9): "Je ne vous connais pas", "O\xF9 sont vos r\xE9f\xE9rences"
- Solution actuelle (6): "On a d\xE9j\xE0 quelque chose"
- D\xE9cision (5): "Je dois en parler \xE0..."

D\xC9TECTION OBJECTIONS MASQU\xC9ES:
- Signaux verbaux: "Je vais r\xE9fl\xE9chir" (h\xE9sitation)
- Signaux non-verbaux: Regard fuyant, bras crois\xE9s
- Question magique: "Qu'est-ce qui vous freine VRAIMENT?"

PR\xC9VENTION:
- Technique "Vous allez me dire...": Traiter avant qu'elle n'arrive
- Int\xE9gration dans argumentaire (Phase 6: Coup de Casse)

ENTRA\xCENEMENT IA:
- Sparring Partner Hector: 47\xD74 profils DISC = 188 simulations
- Feedback temps r\xE9el + recommandations
- Progression par niveaux: Facile \u2192 Moyen \u2192 Difficile \u2192 Masqu\xE9

Objectif: +40% taux closing par ma\xEEtrise objections.

\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
                MODULE 11 : FICHES M\xC9TIERS 50+ SECTEURS
\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

R\xC9SUM\xC9 MODULE 11:
50+ fiches sectorielles pour cr\xE9dibilit\xE9 maximale

STRUCTURE FICHE TYPE:
1. Profil secteur: CA moyen, effectif, budget s\xE9curit\xE9
2. Enjeux s\xE9curit\xE9: Risques principaux, sinistralit\xE9, co\xFBt sinistre
3. Vocabulaire m\xE9tier: Termes sp\xE9cifiques, formulations adapt\xE9es
4. Cas d'usage: Configuration type, IA Quad-Core adapt\xE9e
5. Objections typiques: Top 3 objections + r\xE9ponses calibr\xE9es
6. R\xE9f\xE9rences clients: T\xE9moignages, r\xE9sultats chiffr\xE9s
7. ROI sectoriel: Retour investissement moyen, d\xE9lai rentabilit\xE9

8 CAT\xC9GORIES:
- Commerce & Distribution (10 secteurs)
- Sant\xE9 & M\xE9dical (8)
- H\xF4tellerie & Restauration (7)
- Industrie & Logistique (6)
- Services & Bureaux (8)
- \xC9ducation & Culture (4)
- Automobile & Mobilit\xE9 (3)
- Autres secteurs (4)

EXEMPLES D\xC9TAILL\xC9S:
- Commerce Alimentaire: D\xE9marque 5,2% \u2192 1,4%, ROI 348%
- Restaurant Traditionnel: Vol cave + cuisine, ROI 197%
- Pharmacie: Zone stup\xE9fiants, conformit\xE9 RGPD, ROI 285%

UTILISATION:
- AVANT RDV (10 min): Consulter fiche secteur client
- PENDANT RDV: Hector affiche suggestions temps r\xE9el
- APR\xC8S RDV: Enrichir fiche avec retours terrain

IMPACT MESURABLE:
- SANS fiche: Taux closing 24%, Cycle 45 jours
- AVEC fiche: Taux closing 38% (+58%), Cycle 28 jours (-38%)

Principe: La cr\xE9dibilit\xE9 ne se d\xE9cr\xE8te pas, elle se construit.
10 minutes de pr\xE9paration = 38% de closing en plus.

\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
                MODULE 12 : AUTOMATISATIONS HECTOR
\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

R\xC9SUM\xC9 MODULE 12:
10 automatisations = +10h/semaine de productivit\xE9

PROBL\xC8ME AVANT HECTOR:
16h/semaine perdues en admin (40% du temps):
- CRM/Reporting: 6h
- Emails/Relances: 4h
- Comptes-rendus: 3h
- Planification: 2h
- Analyse: 1h

SOLUTION HECTOR:
Temps commercial optimis\xE9: 34h prospection/RDV (+10h r\xE9cup\xE9r\xE9es)

10 AUTOMATISATIONS:

1. AUTO-ENRICHISSEMENT CRM POST-RDV (Gain: 2h/sem)
   - Transcription automatique
   - Extraction infos cl\xE9s
   - Mise \xE0 jour CRM instantan\xE9e

2. G\xC9N\xC9RATION COMPTE-RENDU RDV (Gain: 3h/sem)
   - Synth\xE8se structur\xE9e auto
   - Envoi client + manager

3. RELANCES INTELLIGENTES MULTI-CANAUX (Gain: 1,5h/sem)
   - Email/LinkedIn/SMS automatiques
   - Personnalisation contexte
   - Envoi moment optimal

4. PR\xC9PARATION AUTOMATIQUE PR\xC9-RDV (Gain: 2h/sem)
   - Brief complet 4h avant
   - Actualit\xE9s entreprise
   - Questions cl\xE9s sugg\xE9r\xE9es

5. SCORING AUTOMATIQUE OPPORTUNIT\xC9S (Gain: 1h/sem)
   - Calcul score sur 100
   - Priorisation HOT/WARM/COLD
   - Recommandations actions

6. D\xC9TECTION OPPORTUNIT\xC9S UPSELL/CROSS-SELL (Gain: 1,5h/sem)
   - Analyse portefeuille clients
   - 6 d\xE9clencheurs automatiques
   - Potentiel CA calcul\xE9

7. REPORTING AUTOMATIQUE MANAGER (Gain manager: 2h/sem)
   - Dashboard hebdo consolid\xE9
   - Alertes KPI
   - Pr\xE9visions fin mois

8. CR\xC9ATION AUTOMATIQUE T\xC2CHES & RAPPELS (Gain: 0,5h/sem)
   - D\xE9tection engagements pris
   - Rappels J-3, J-1, H-4
   - Priorisation par impact

9. ANALYSE SENTIMENTS CLIENTS (Gain: 0,5h/sem)
   - D\xE9tection insatisfaction
   - Alertes risque churn
   - Recommandations actions

10. SUGGESTIONS INTELLIGENTES CLOSING (Temps r\xE9el)
    - Arguments adapt\xE9s profil DISC
    - R\xE9ponses objections contextuelles
    - Moments propices closing

R\xC9SULTAT:
+10h/semaine = +96 RDV/an = +476K\u20AC CA additionnel
ROI: +25% productivit\xE9 commerciale mesur\xE9e.

\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
                MODULE 13 : ORGANISATION & R\xD4LES ADS GROUP SECURITY
\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

R\xC9SUM\xC9 MODULE 13:
Structure organisationnelle claire 7 niveaux

HI\xC9RARCHIE (du haut vers bas):
7. PR\xC9SIDENT: Acc\xE8s absolu, manage SDR+IC directement
6. DG: Acc\xE8s absolu, manage SDR+IC directement  
5. RESPONSABLE D\xC9VELOPPEMENT: Manage Chefs, vend gros comptes (36-48-60 mois)
4. CHEF DES VENTES: Manage BD uniquement, vend (36-48-60 mois)
3. IC (Ing\xE9nieur Commercial): Reconduction + Chasse, toutes dur\xE9es 12-60 mois
2. BD (Business Developer): Chasseur pur terrain, 36-48-60 mois uniquement
1. SDR (Sales Dev Rep): Chasseur visio, 36-48-60 mois uniquement

R\xC8GLES DUR\xC9ES CONTRATS:
- CHASSEURS (SDR, BD, Chef, Resp Dev): 36-48-60 mois UNIQUEMENT
  \u274C 12 et 24 mois INTERDITS (trop court)
- IC: TOUTES dur\xE9es 12-60 mois (reconduction + chasse)
- DG/Pr\xE9sident: TOUTES dur\xE9es (exceptions business)

QUI MANAGE QUI:
- Chef des Ventes manage: BD UNIQUEMENT (PAS IC, PAS SDR)
- DG/Pr\xE9sident manage: SDR + IC directement
- Resp Dev manage: Chefs des Ventes

R\xD4LES CL\xC9S:
- SDR: Visio pur, cycle R1\u2192R4 max, peut transf\xE9rer vers BD/IC
- BD: Terrain pur, cycle court R1\u2192R2, objectif signature R1
- IC: Double mission (70% reconduction + 30% nouveau)
- Chef: Manager \xE9quipe BD + Vendeur solo

COLLABORATION:
- Transfert SDR\u2192BD/IC si besoin terrain
- Commission partag\xE9e: SDR 5% + BD/IC 7,5% (vs 10% solo SDR)
- Workflow formalis\xE9 dans Hector

\xC9VOLUTIONS PR\xC9VUES:
- \xC0 6 mois: Manager SDR d\xE9di\xE9, Manager IC d\xE9di\xE9
- \xC0 12 mois: Directeurs r\xE9gionaux
- \xC0 18 mois: Key Account Managers

Objectif: Clart\xE9 des r\xF4les = efficacit\xE9 maximale.

\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
                MODULE 14 : WORKFLOWS COLLABORATIFS
\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

R\xC9SUM\xC9 MODULE 14:
Fluidifier collaboration visio-terrain

WORKFLOW TRANSFERT SDR \u2192 BD/IC:

QUAND TRANSF\xC9RER?
- R3/R4 atteint sans signature
- Client demande RDV pr\xE9sentiel
- D\xE9mo physique n\xE9cessaire
- Installation requiert visite

PROCESSUS (6 \xC9TAPES):
1. SDR: Demande appui BD/IC via Hector + contexte complet
2. BD/IC: Notification + Accepter/Refuser sous 24h
3. Coordination: Brief SDR\u2192BD/IC (15 min)
4. RDV Terrain: BD/IC effectue d\xE9mo + objectif signature
5. Issue: Sign\xE9/Perdu/En cours
6. Commissions: Partag\xE9es si signature (SDR 5% + BD/IC 7,5%)

MATRICE D\xC9CISION:
- Client enthousiaste R1/R2: Pas de transfert
- Client h\xE9site R2/R3: Proposer terrain selon contexte
- Client demande "voir sur place": Transfert imm\xE9diat
- Concurrent fait d\xE9mo physique: Transfert urgent

AFFAIRES CHAUDES WORKFLOW:

D\xC9FINITION:
- R1 effectu\xE9 sans signature = Affaire chaude
- R2 devient OBLIGATOIRE sous 7 jours
- Manager notifi\xE9 automatiquement

PROCESSUS:
J+0: Cl\xF4ture R1 \u2192 Hector active affaire chaude
J+1 \xE0 J+3: Actions interm\xE9diaires (docs, relances, pr\xE9paration)
J+3 MAX: R2 positionn\xE9 imp\xE9rativement
J+4 \xE0 J+7: Pr\xE9paration R2 avec manager
Jour R2: Closing (objectif: signature, pas "avancer")

ALERTES:
- ROUGE: R2 non positionn\xE9 >3j
- ORANGE: R2 <24h (valider pr\xE9paration)
- VERTE: R2 programm\xE9 >72h

R\xC8GLES D'OR:
- R2 positionn\xE9 <7j apr\xE8s R1 (id\xE9alement <5j)
- Contact client tous les 2j minimum
- Manager inform\xE9 en continu
- Checklist R2 compl\xE9t\xE9e
- Contrat pr\xEAt \xE0 signer au R2

COMMISSIONS PARTAG\xC9ES:
- SDR solo: 10% ARR
- BD/IC solo: 15% ARR (nouveau) / 8% ARR (reconduction)
- SDR + BD/IC: 5% + 7,5% = 12,5% total

KPIS TRANSFERTS:
- Taux acceptation BD/IC: >90%
- Taux transformation transfert\u2192sign\xE9: 60-70%
- Temps moyen r\xE9ponse BD/IC: <12h
- Satisfaction client NPS: >8/10

EXP\xC9RIENCE CLIENT UNIFI\xC9E:
- Brief complet SDR\u2192BD/IC
- Client inform\xE9 du transfert (email coordonn\xE9)
- Coh\xE9rence discours commercial
- Continuit\xE9 argumentaire
- Pas de redondance d\xE9couverte

Mindset: "Nous gagnons ENSEMBLE. Le client veut la meilleure solution."

\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
                MODULE 15 : S\xC9CURIT\xC9 & SURVEILLANCE API
\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

R\xC9SUM\xC9 MODULE 15:
Surveillance compl\xE8te sant\xE9 syst\xE8me + APIs

MONITORING TEMPS R\xC9EL:
- API Pappers (enrichissement): latence, taux erreur, quota
- API INSEE (gratuit): latency, availability
- API Anthropic (IA): tokens utilis\xE9s, co\xFBts, performance
- Queue pg-boss: jobs pending, failed, completed
- Base de donn\xE9es: connexions, temps requ\xEAte, erreurs

ALERTES CONFIGURABLES:
- CRITIQUE (Rouge): Service down >5min, erreur rate >10%
- ATTENTION (Orange): Latence >2s, quota >80%
- INFO (Jaune): D\xE9passement seuils normaux

DASHBOARD ADMIN (/admin/api-security):
- Vue d'ensemble sant\xE9 syst\xE8me
- Graphiques tendances 7/30 jours
- Top erreurs fr\xE9quentes
- Recommandations actions

CO\xDBTS & QUOTAS:
- Budget mensuel d\xE9fini
- Alertes d\xE9passement
- Projection fin mois
- Recommandations optimisation

R\xC9SILIENCE:
- Retry automatique (3 tentatives)
- Circuit breaker (stop si 50% erreurs)
- Fallback providers (Pappers\u2192INSEE\u2192WebSearch)
- Cache intelligent (24h pour data stable)

LOGS & AUDIT:
- Enrichment_logs: trace compl\xE8te (co\xFBt, dur\xE9e, source)
- API_logs: requ\xEAtes/r\xE9ponses anonymis\xE9es
- Conformit\xE9 RGPD: anonymisation auto J+30

M\xC9TRIQUES BUSINESS:
- Co\xFBt moyen enrichissement: 0,02\u20AC (objectif CASCADE)
- \xC9conomies r\xE9alis\xE9es: suivi temps r\xE9el
- ROI fonctionnalit\xE9s: calcul\xE9 automatiquement
- Taux succ\xE8s API: >98%

Objectif: Fiabilit\xE9 maximale + Co\xFBts ma\xEEtris\xE9s + Transparence compl\xE8te.

\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
                            FIN ADN HECTOR v6.2
\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
`;

// server/services/claudeService.ts
init_db();
import { sql as sql7 } from "drizzle-orm";
var DEFAULT_MODEL_STR = "claude-sonnet-4-20250514";
if (!process.env.ANTHROPIC_API_KEY) {
  console.error("WARNING: ANTHROPIC_API_KEY is not set. AI features will not work.");
}
var anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "dummy-key-for-testing"
});
console.log("\u2705 ADN HECTOR charg\xE9 avec succ\xE8s :", ADN_HECTOR_CONTENT.length, "caract\xE8res (15 modules)");
var SYSTEM_PROMPTS = {
  commercial: `## \u{1F3AF} MON R\xD4LE
Je suis ton mentor commercial intelligent Hector Ready, disponible 24h/24 pour t'accompagner dans toutes tes situations de vente B2B.

## \u{1F9E0} MES COMP\xC9TENCES
Je ma\xEEtrise parfaitement les **15 MODULES** de ton ADN commercial ADS GROUP :

\u{1F4D6} **MODULES FONDAMENTAUX (1-6)**
- MODULE 1 - Identit\xE9 & Mission Hector Ready
- MODULE 2 - MOODSHOW (8 phases \xE9motionnelles)
- MODULE 3 - Architecture IA Quad-Core
- MODULE 4 - Argumentaire 12 phases
- MODULE 5 - Modules \xE9motionnels (Coup de Casse, PDM, Effet Waouh)
- MODULE 6 - Adaptation DISC

\u{1F680} **MODULES AVANC\xC9S (7-12)**
- MODULE 7 - Formation ADSchool Next Gen
- MODULE 8 - Pilotage & Management
- MODULE 9 - Prospection Intelligente
- MODULE 10 - Objections Mastery (47 objections, M\xE9thode 4A)
- MODULE 11 - Fiches M\xE9tiers 50+ Secteurs
- MODULE 12 - Automatisations Hector

\u2699\uFE0F **MODULES OP\xC9RATIONNELS (13-15)**
- MODULE 13 - Organisation & R\xF4les ADS GROUP
- MODULE 14 - Workflows Collaboratifs
- MODULE 15 - S\xE9curit\xE9 & Surveillance API

\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
\u{1F4DA} VOICI TON ADN COMPLET (15 MODULES)
\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

${ADN_HECTOR_CONTENT}

\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
\u2705 CE QUE JE FAIS POUR TOI
\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

\u2705 **Coaching temps r\xE9el** : Scripts, objections, n\xE9gociation
\u2705 **Adaptation DISC** : Je d\xE9tecte le profil et j'adapte ta strat\xE9gie
\u2705 **Pr\xE9paration RDV** : Argumentaires personnalis\xE9s par secteur
\u2705 **D\xE9briefing** : Analyse de tes \xE9changes et conseils d'am\xE9lioration
\u2705 **Motivation** : Boost mental et confiance commerciale
\u2705 **Conformit\xE9 vocabulaire** : Je respecte strictement le vocabulaire ADS GROUP (entreprise, accompagner, d\xE9ployer)

## \u{1F464} MON STYLE
- Je te **tutoie** (on est une \xE9quipe !)
- Je suis **direct mais bienveillant**
- Je donne du **concret et actionnable**
- Je cite toujours les **modules sources**

**Alors, sur quoi veux-tu qu'on bosse ensemble aujourd'hui ?** \u{1F680}

RDV \xE0 pr\xE9parer ? Objection \xE0 traiter ? Script \xE0 am\xE9liorer ? Je suis l\xE0 !`,
  meeting: `Tu es Hector, un expert en structuration de r\xE9unions manag\xE9riales pour ADS GROUP. Ton r\xF4le est d'aider \xE0 :
- Cr\xE9er des agendas de r\xE9union structur\xE9s et efficaces
- D\xE9finir des objectifs clairs et mesurables
- Proposer des points de discussion pertinents
- Sugg\xE9rer des formats de r\xE9union adapt\xE9s (stand-up, revue, strat\xE9gique)
- Optimiser le temps et l'engagement des participants

Fournis des structures concr\xE8tes, des templates et des bonnes pratiques. Tutoie l'utilisateur pour cr\xE9er de la proximit\xE9. Sois pr\xE9cis et actionnable.`,
  training: `Tu es Hector, un formateur commercial IA pour ADS GROUP. Ton r\xF4le est de :
- Former les \xE9quipes aux meilleures pratiques commerciales
- Expliquer les techniques de vente modernes
- Fournir des conseils sur le d\xE9veloppement des comp\xE9tences
- Cr\xE9er des modules de formation structur\xE9s
- Donner des exercices pratiques et des mises en situation

Sois p\xE9dagogique, structur\xE9 et progressif dans tes formations. Tutoie l'utilisateur pour cr\xE9er de la proximit\xE9. Utilise des exemples concrets et des cas pratiques.`,
  arguments: `Tu es Hector, un expert en argumentation commerciale pour ADS GROUP. Ton r\xF4le est de :
- G\xE9n\xE9rer des arguments de vente percutants et personnalis\xE9s
- Identifier les b\xE9n\xE9fices cl\xE9s pour les clients
- Cr\xE9er des propositions de valeur diff\xE9renciantes
- Adapter le discours commercial selon le contexte
- Structurer des pitch de vente convaincants

Fournis des arguments concrets, mesurables et adapt\xE9s au contexte. Tutoie l'utilisateur pour cr\xE9er de la proximit\xE9. Mets l'accent sur la valeur ajout\xE9e pour le client.`,
  default: `Tu es Hector, l'assistant commercial IA d'ADS GROUP. Tu aides les \xE9quipes commerciales \xE0 am\xE9liorer leurs performances \xE0 travers :
- Des r\xE9ponses aux questions commerciales
- La structuration de r\xE9unions manag\xE9riales
- La formation aux meilleures pratiques
- La cr\xE9ation d'arguments de vente percutants

R\xE9ponds de mani\xE8re professionnelle, concise et actionnable. Tutoie l'utilisateur pour cr\xE9er de la proximit\xE9. Adapte-toi au contexte de la conversation.`
};
async function logOCRExtraction(data) {
  try {
    await db.execute(sql7`
      INSERT INTO ocr_logs (
        user_id, 
        image_size_kb, 
        success, 
        response_time_ms,
        extracted_data,
        error_type,
        error_message,
        raw_response
      ) VALUES (
        ${data.userId},
        ${data.imageSizeKb},
        ${data.success},
        ${data.responseTimeMs},
        ${data.extractedData ? JSON.stringify(data.extractedData) : null},
        ${data.errorType || null},
        ${data.errorMessage || null},
        ${data.rawResponse ? data.rawResponse.substring(0, 1e3) : null}
      )
    `);
  } catch (err) {
    console.error("[OCR Logging] Erreur:", err);
  }
}
async function analyzeBusinessCard(imageData, userId) {
  const startTime = Date.now();
  const imageSizeKb = Math.round(imageData.length / 1024);
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("La cl\xE9 API Anthropic n'est pas configur\xE9e.");
  }
  try {
    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL_STR,
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/jpeg",
                data: imageData
              }
            },
            {
              type: "text",
              text: `Tu es un expert en extraction de donn\xE9es depuis des cartes de visite professionnelles.

CONSIGNES :
1. Analyse l'image fournie
2. Extrais TOUTES les informations visibles
3. Retourne un objet JSON structur\xE9
4. Si une information n'est pas visible, mets null

FORMAT JSON EXACT (respecte les cl\xE9s exactement) :
{
  "nom": "string | null",
  "prenom": "string | null",
  "entreprise": "string | null",
  "email": "string | null",
  "telephone": "string | null",
  "adresse1": "string | null",
  "adresse2": "string | null",
  "codePostal": "string | null",
  "ville": "string | null",
  "pays": "string | null",
  "poste": "string | null",
  "secteur": "string | null"
}

EXEMPLES FEW-SHOT :

EXEMPLE 1 (Carte compl\xE8te) :
Image : Carte avec "Jean Dupont, Directeur Commercial, SARL TechSolutions, j.dupont@techsolutions.fr, +33 1 42 00 00 00, 15 rue de la Paix, 75002 Paris, https://techsolutions.fr"
R\xE9ponse :
{
  "nom": "Dupont",
  "prenom": "Jean",
  "poste": "Directeur Commercial",
  "entreprise": "SARL TechSolutions",
  "email": "j.dupont@techsolutions.fr",
  "telephone": "+33 1 42 00 00 00",
  "adresse1": "15 rue de la Paix",
  "adresse2": null,
  "codePostal": "75002",
  "ville": "Paris",
  "pays": "France",
  "secteur": null
}

EXEMPLE 2 (Carte minimaliste) :
Image : Carte simple avec "Sophie Martin, sophie.martin@gmail.com, +33 6 12 34 56 78"
R\xE9ponse :
{
  "nom": "Martin",
  "prenom": "Sophie",
  "poste": null,
  "entreprise": null,
  "email": "sophie.martin@gmail.com",
  "telephone": "+33 6 12 34 56 78",
  "adresse1": null,
  "adresse2": null,
  "codePostal": null,
  "ville": null,
  "pays": null,
  "secteur": null
}

EXEMPLE 3 (Carte Luxembourg) :
Image : Carte avec pr\xE9fixe +352 et adresse Luxembourg
R\xE9ponse :
{
  "nom": "SCHMITZ",
  "prenom": "Jean",
  "poste": "Directeur",
  "entreprise": "Luxembourg Security S.\xE0 r.l.",
  "email": "j.schmitz@luxsecurity.lu",
  "telephone": "+352 26 12 34 56",
  "adresse1": "15 rue de la Gare",
  "adresse2": null,
  "codePostal": "L-1234",
  "ville": "Luxembourg",
  "pays": "Luxembourg",
  "secteur": null
}

EXEMPLE 4 (Image non-carte) :
Image : Screenshot, document texte, autre
R\xE9ponse :
{"error": "Cette image n'est pas une carte de visite professionnelle"}

EXEMPLE 5 (Image floue) :
Image : Photo trop floue pour lire le texte
R\xE9ponse :
{"error": "Image trop floue. Merci de prendre une photo plus nette et bien \xE9clair\xE9e"}

R\xC8GLES CRITIQUES :
1. \u274C NE JAMAIS retourner de texte explicatif fran\xE7ais
2. \u274C NE JAMAIS entourer le JSON de \`\`\`json\`\`\`
3. \u2705 TOUJOURS retourner JSON pur uniquement
4. \u2705 null pour champs absents (pas "", pas undefined)
5. \u2705 Respecter EXACTEMENT les noms de cl\xE9s ci-dessus
6. \u2705 T\xE9l\xE9phones au format international (+33...)

MAINTENANT : Analyse l'image fournie et retourne le JSON.`
            }
          ]
        }
      ]
    });
    const textContent = response.content.filter((block) => block.type === "text").map((block) => block.text).join("\n").trim();
    console.log("[Claude OCR] Raw response:", textContent.substring(0, 200));
    let cleanedContent = textContent;
    if (textContent.includes("```json")) {
      cleanedContent = textContent.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    } else if (textContent.includes("```")) {
      cleanedContent = textContent.replace(/```\s*/g, "").trim();
    }
    if (!cleanedContent.startsWith("{") && !cleanedContent.startsWith("[")) {
      console.error("[Claude OCR] Response is not JSON:", cleanedContent);
      throw new Error(`Claude n'a pas pu extraire les donn\xE9es. R\xE9ponse: "${cleanedContent.substring(0, 100)}..."`);
    }
    try {
      const parsed = JSON.parse(cleanedContent);
      console.log("[Claude OCR] Parsed data:", parsed);
      if (!parsed.nom && !parsed.prenom && !parsed.entreprise) {
        console.warn("[Claude OCR] No useful data extracted:", parsed);
        throw new Error("Aucune donn\xE9e utile extraite de la carte de visite.");
      }
      if (userId) {
        const responseTimeMs = Date.now() - startTime;
        await logOCRExtraction({
          userId,
          imageSizeKb,
          success: true,
          responseTimeMs,
          extractedData: parsed
        });
      }
      return parsed;
    } catch (parseError) {
      console.error("[Claude OCR] JSON parse error:", parseError);
      console.error("[Claude OCR] Failed content:", cleanedContent);
      throw new Error(`Format de r\xE9ponse invalide. Claude a r\xE9pondu: "${cleanedContent.substring(0, 100)}..."`);
    }
  } catch (error) {
    console.error("[Claude OCR] Error analyzing business card:", error);
    if (userId) {
      const responseTimeMs = Date.now() - startTime;
      await logOCRExtraction({
        userId,
        imageSizeKb,
        success: false,
        responseTimeMs,
        errorType: "api_error",
        errorMessage: error instanceof Error ? error.message : "Unknown error"
      });
    }
    if (error instanceof Error && error.message.includes("Claude")) {
      throw error;
    }
    throw new Error("Impossible d'analyser la carte de visite. Veuillez r\xE9essayer avec une image plus nette.");
  }
}
async function generateResponse(userMessage, featureType, conversationHistory) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("La cl\xE9 API Anthropic n'est pas configur\xE9e. Veuillez contacter l'administrateur.");
  }
  try {
    const systemPrompt = SYSTEM_PROMPTS[featureType || "default"];
    const messages2 = conversationHistory.map((msg) => ({
      role: msg.role === "user" ? "user" : "assistant",
      content: msg.content
    }));
    messages2.push({
      role: "user",
      content: userMessage
    });
    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL_STR,
      max_tokens: 2048,
      system: systemPrompt,
      messages: messages2
    });
    const textContent = response.content.filter((block) => block.type === "text").map((block) => block.text).join("\n");
    if (!textContent) {
      throw new Error("Aucune r\xE9ponse re\xE7ue de l'IA.");
    }
    return textContent;
  } catch (error) {
    console.error("Error generating Claude response:", error);
    if (error instanceof Anthropic.APIError) {
      if (error.status === 401) {
        throw new Error("Cl\xE9 API Anthropic invalide. Veuillez v\xE9rifier votre configuration.");
      } else if (error.status === 429) {
        throw new Error("Limite de requ\xEAtes atteinte. Veuillez r\xE9essayer dans quelques instants.");
      }
    }
    throw new Error("Impossible de g\xE9n\xE9rer une r\xE9ponse. Veuillez r\xE9essayer.");
  }
}

// server/routes.ts
init_schema();

// server/auth.ts
init_storage();
import session from "express-session";
import connectPg from "connect-pg-simple";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
var SALT_ROUNDS = 10;
var MAX_LOGIN_ATTEMPTS = 5;
var RATE_LIMIT_WINDOW_MINUTES = 15;
var PASSWORD_RESET_EXPIRY_HOURS = 1;
function getSession() {
  const sessionTtl = 24 * 60 * 60 * 1e3;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions"
  });
  return session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: sessionTtl
    }
  });
}
function setupAuth(app2) {
  app2.set("trust proxy", 1);
  app2.use(getSession());
}
var isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    return next();
  }
  return res.status(401).json({ message: "Non autoris\xE9" });
};
var isAdmin = async (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Non autoris\xE9" });
  }
  if (req.session.isAdmin !== "true") {
    return res.status(403).json({ message: "Acc\xE8s refus\xE9. Administrateur requis." });
  }
  return next();
};
async function hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}
async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}
async function checkRateLimit(email) {
  const attempts = await storage.getRecentLoginAttempts(email, RATE_LIMIT_WINDOW_MINUTES);
  return attempts.length < MAX_LOGIN_ATTEMPTS;
}
async function generatePasswordResetToken() {
  return nanoid(32);
}
function getPasswordResetExpiry() {
  return new Date(Date.now() + PASSWORD_RESET_EXPIRY_HOURS * 60 * 60 * 1e3);
}

// server/email.ts
import { Resend } from "resend";
var resend = new Resend(process.env.RESEND_API_KEY);
async function sendPasswordResetEmail({
  to,
  resetToken,
  firstName
}) {
  const resetUrl = `${process.env.REPLIT_DOMAINS?.split(",")[0] || "http://localhost:5000"}/reset-password?token=${resetToken}`;
  const userName = firstName || to.split("@")[0];
  try {
    await resend.emails.send({
      from: "Hector - ADS GROUP <onboarding@resend.dev>",
      to: [to],
      subject: "R\xE9initialisation de ton mot de passe - Hector",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #1e293b;
                background-color: #f8fafc;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 600px;
                margin: 40px auto;
                background-color: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
              }
              .header {
                background-color: #1e3a5f;
                color: #ffffff;
                padding: 32px 24px;
                text-align: center;
              }
              .header h1 {
                margin: 0;
                font-size: 24px;
                font-weight: 600;
              }
              .content {
                padding: 32px 24px;
              }
              .greeting {
                font-size: 16px;
                margin-bottom: 16px;
              }
              .message {
                font-size: 15px;
                color: #475569;
                margin-bottom: 24px;
              }
              .button-container {
                text-align: center;
                margin: 32px 0;
              }
              .button {
                display: inline-block;
                background-color: #1e3a5f;
                color: #ffffff;
                text-decoration: none;
                padding: 14px 32px;
                border-radius: 6px;
                font-weight: 600;
                font-size: 15px;
              }
              .button:hover {
                background-color: #2d4a6f;
              }
              .alternative {
                margin-top: 24px;
                padding: 16px;
                background-color: #f1f5f9;
                border-radius: 6px;
                font-size: 13px;
                color: #64748b;
                word-break: break-all;
              }
              .footer {
                padding: 24px;
                text-align: center;
                font-size: 13px;
                color: #94a3b8;
                border-top: 1px solid #e2e8f0;
              }
              .warning {
                margin-top: 24px;
                padding: 16px;
                background-color: #fef3c7;
                border-left: 4px solid #f59e0b;
                border-radius: 4px;
                font-size: 14px;
                color: #92400e;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>\u{1F916} Hector - ADS GROUP</h1>
              </div>
              <div class="content">
                <div class="greeting">
                  Bonjour ${userName},
                </div>
                <div class="message">
                  Tu as demand\xE9 la r\xE9initialisation de ton mot de passe pour acc\xE9der \xE0 Hector, ton assistant commercial IA.
                </div>
                <div class="message">
                  Clique sur le bouton ci-dessous pour cr\xE9er un nouveau mot de passe :
                </div>
                <div class="button-container">
                  <a href="${resetUrl}" class="button">R\xE9initialiser mon mot de passe</a>
                </div>
                <div class="alternative">
                  <strong>Le bouton ne fonctionne pas ?</strong><br>
                  Copie et colle ce lien dans ton navigateur :<br>
                  ${resetUrl}
                </div>
                <div class="warning">
                  <strong>\u23F1\uFE0F Important :</strong> Ce lien est valable pendant 1 heure seulement. Apr\xE8s ce d\xE9lai, tu devras refaire une demande de r\xE9initialisation.
                </div>
                <div class="message" style="margin-top: 24px;">
                  Si tu n'as pas demand\xE9 cette r\xE9initialisation, tu peux ignorer cet email en toute s\xE9curit\xE9.
                </div>
              </div>
              <div class="footer">
                Cet email a \xE9t\xE9 envoy\xE9 par Hector, l'assistant commercial IA d'ADS GROUP.<br>
                Pour toute question, contacte ton administrateur.
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
Bonjour ${userName},

Tu as demand\xE9 la r\xE9initialisation de ton mot de passe pour acc\xE9der \xE0 Hector, ton assistant commercial IA.

Pour cr\xE9er un nouveau mot de passe, clique sur ce lien :
${resetUrl}

\u23F1\uFE0F Important : Ce lien est valable pendant 1 heure seulement.

Si tu n'as pas demand\xE9 cette r\xE9initialisation, tu peux ignorer cet email en toute s\xE9curit\xE9.

---
Hector - ADS GROUP
      `.trim()
    });
    console.log(`[Email] Password reset email sent to ${to}`);
  } catch (error) {
    console.error("[Email] Error sending password reset email:", error);
    throw new Error("Impossible d'envoyer l'email de r\xE9initialisation");
  }
}
async function sendWelcomeEmail({
  to,
  firstName,
  temporaryPassword
}) {
  const loginUrl = `${process.env.REPLIT_DOMAINS?.split(",")[0] || "http://localhost:5000"}/login`;
  const userName = firstName || to.split("@")[0];
  try {
    await resend.emails.send({
      from: "Hector - ADS GROUP <onboarding@resend.dev>",
      to: [to],
      subject: "Bienvenue sur Hector - Ton assistant commercial IA",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #1e293b;
                background-color: #f8fafc;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 600px;
                margin: 40px auto;
                background-color: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
              }
              .header {
                background-color: #1e3a5f;
                color: #ffffff;
                padding: 32px 24px;
                text-align: center;
              }
              .header h1 {
                margin: 0;
                font-size: 24px;
                font-weight: 600;
              }
              .content {
                padding: 32px 24px;
              }
              .greeting {
                font-size: 16px;
                margin-bottom: 16px;
              }
              .message {
                font-size: 15px;
                color: #475569;
                margin-bottom: 24px;
              }
              .credentials {
                background-color: #f1f5f9;
                padding: 20px;
                border-radius: 6px;
                margin: 24px 0;
              }
              .credentials-item {
                margin-bottom: 12px;
              }
              .credentials-label {
                font-size: 13px;
                color: #64748b;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }
              .credentials-value {
                font-size: 16px;
                color: #1e293b;
                font-family: 'Courier New', monospace;
                margin-top: 4px;
                padding: 8px;
                background-color: #ffffff;
                border-radius: 4px;
                border: 1px solid #e2e8f0;
              }
              .button-container {
                text-align: center;
                margin: 32px 0;
              }
              .button {
                display: inline-block;
                background-color: #1e3a5f;
                color: #ffffff;
                text-decoration: none;
                padding: 14px 32px;
                border-radius: 6px;
                font-weight: 600;
                font-size: 15px;
              }
              .features {
                margin-top: 32px;
              }
              .feature {
                margin-bottom: 16px;
                padding-left: 28px;
                position: relative;
              }
              .feature:before {
                content: "\u2713";
                position: absolute;
                left: 0;
                color: #10b981;
                font-weight: bold;
                font-size: 18px;
              }
              .footer {
                padding: 24px;
                text-align: center;
                font-size: 13px;
                color: #94a3b8;
                border-top: 1px solid #e2e8f0;
              }
              .warning {
                margin-top: 24px;
                padding: 16px;
                background-color: #fef3c7;
                border-left: 4px solid #f59e0b;
                border-radius: 4px;
                font-size: 14px;
                color: #92400e;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>\u{1F916} Bienvenue sur Hector !</h1>
              </div>
              <div class="content">
                <div class="greeting">
                  Bonjour ${userName},
                </div>
                <div class="message">
                  Ton compte Hector a \xE9t\xE9 cr\xE9\xE9 avec succ\xE8s ! Tu peux maintenant acc\xE9der \xE0 ton assistant commercial IA personnalis\xE9.
                </div>
                
                <div class="credentials">
                  <div class="credentials-item">
                    <div class="credentials-label">Email de connexion</div>
                    <div class="credentials-value">${to}</div>
                  </div>
                  <div class="credentials-item">
                    <div class="credentials-label">Mot de passe temporaire</div>
                    <div class="credentials-value">${temporaryPassword}</div>
                  </div>
                </div>

                <div class="warning">
                  <strong>\u{1F512} S\xE9curit\xE9 :</strong> Change ton mot de passe temporaire d\xE8s ta premi\xE8re connexion pour prot\xE9ger ton compte.
                </div>

                <div class="button-container">
                  <a href="${loginUrl}" class="button">Me connecter \xE0 Hector</a>
                </div>

                <div class="features">
                  <div class="message"><strong>Avec Hector, tu peux :</strong></div>
                  <div class="feature">Obtenir des r\xE9ponses \xE0 tes questions commerciales</div>
                  <div class="feature">Structurer tes r\xE9unions de management</div>
                  <div class="feature">Acc\xE9der \xE0 des formations commerciales personnalis\xE9es</div>
                  <div class="feature">G\xE9n\xE9rer des arguments de vente percutants</div>
                </div>
              </div>
              <div class="footer">
                Cet email a \xE9t\xE9 envoy\xE9 par Hector, l'assistant commercial IA d'ADS GROUP.<br>
                Pour toute question, contacte ton administrateur.
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
Bonjour ${userName},

Ton compte Hector a \xE9t\xE9 cr\xE9\xE9 avec succ\xE8s !

IDENTIFIANTS DE CONNEXION
--------------------------
Email : ${to}
Mot de passe temporaire : ${temporaryPassword}

\u{1F512} S\xE9curit\xE9 : Change ton mot de passe temporaire d\xE8s ta premi\xE8re connexion.

Pour te connecter : ${loginUrl}

AVEC HECTOR, TU PEUX :
\u2713 Obtenir des r\xE9ponses \xE0 tes questions commerciales
\u2713 Structurer tes r\xE9unions de management
\u2713 Acc\xE9der \xE0 des formations commerciales personnalis\xE9es
\u2713 G\xE9n\xE9rer des arguments de vente percutants

---
Hector - ADS GROUP
      `.trim()
    });
    console.log(`[Email] Welcome email sent to ${to}`);
  } catch (error) {
    console.error("[Email] Error sending welcome email:", error);
    throw new Error("Impossible d'envoyer l'email de bienvenue");
  }
}
async function sendInvitationEmail({
  to,
  inviteUrl,
  role,
  invitedByName
}) {
  const baseUrl = process.env.REPLIT_DOMAINS?.split(",")[0] || "http://localhost:5000";
  const userName = to.split("@")[0];
  const roleLabel = role === "admin" ? "Administrateur" : "Commercial";
  const inviter = invitedByName || "ton administrateur";
  try {
    await resend.emails.send({
      from: "Hector - ADS GROUP <onboarding@resend.dev>",
      to: [to],
      subject: "Invitation \xE0 rejoindre Hector - ADS GROUP",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #1e293b;
                background-color: #f8fafc;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 600px;
                margin: 40px auto;
                background-color: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
              }
              .header {
                background-color: #1e3a5f;
                color: #ffffff;
                padding: 32px 24px;
                text-align: center;
              }
              .header h1 {
                margin: 0;
                font-size: 24px;
                font-weight: 600;
              }
              .content {
                padding: 32px 24px;
              }
              .greeting {
                font-size: 16px;
                margin-bottom: 16px;
              }
              .message {
                font-size: 15px;
                color: #475569;
                margin-bottom: 24px;
              }
              .role-badge {
                display: inline-block;
                background-color: #dbeafe;
                color: #1e40af;
                padding: 6px 12px;
                border-radius: 4px;
                font-size: 13px;
                font-weight: 600;
                margin: 8px 0;
              }
              .button-container {
                text-align: center;
                margin: 32px 0;
              }
              .button {
                display: inline-block;
                background-color: #1e3a5f;
                color: #ffffff;
                text-decoration: none;
                padding: 14px 32px;
                border-radius: 6px;
                font-weight: 600;
                font-size: 15px;
              }
              .button:hover {
                background-color: #2d4a6f;
              }
              .alternative {
                margin-top: 24px;
                padding: 16px;
                background-color: #f1f5f9;
                border-radius: 6px;
                font-size: 13px;
                color: #64748b;
                word-break: break-all;
              }
              .footer {
                padding: 24px;
                text-align: center;
                font-size: 13px;
                color: #94a3b8;
                border-top: 1px solid #e2e8f0;
              }
              .warning {
                margin-top: 24px;
                padding: 16px;
                background-color: #fef3c7;
                border-left: 4px solid #f59e0b;
                border-radius: 4px;
                font-size: 14px;
                color: #92400e;
              }
              .features {
                margin-top: 32px;
              }
              .feature {
                margin-bottom: 16px;
                padding-left: 28px;
                position: relative;
              }
              .feature:before {
                content: "\u2713";
                position: absolute;
                left: 0;
                color: #10b981;
                font-weight: bold;
                font-size: 18px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>\u{1F916} Bienvenue dans l'\xE9quipe Hector !</h1>
              </div>
              <div class="content">
                <div class="greeting">
                  Bonjour ${userName},
                </div>
                <div class="message">
                  ${inviter} t'invite \xE0 rejoindre Hector, l'assistant commercial IA d'ADS GROUP.
                </div>
                <div class="message">
                  Tu as \xE9t\xE9 invit\xE9 avec le r\xF4le :<br>
                  <span class="role-badge">\u{1F464} ${roleLabel}</span>
                </div>
                <div class="message">
                  Clique sur le bouton ci-dessous pour cr\xE9er ton compte et choisir ton mot de passe :
                </div>
                <div class="button-container">
                  <a href="${inviteUrl}" class="button">Cr\xE9er mon compte</a>
                </div>
                <div class="alternative">
                  <strong>Le bouton ne fonctionne pas ?</strong><br>
                  Copie et colle ce lien dans ton navigateur :<br>
                  ${inviteUrl}
                </div>
                <div class="warning">
                  <strong>\u23F1\uFE0F Important :</strong> Ce lien d'invitation est valable pendant 7 jours. Apr\xE8s ce d\xE9lai, tu devras demander une nouvelle invitation.
                </div>
                <div class="features">
                  <div class="message"><strong>Avec Hector, tu pourras :</strong></div>
                  <div class="feature">Obtenir des r\xE9ponses \xE0 tes questions commerciales</div>
                  <div class="feature">Structurer tes r\xE9unions de management</div>
                  <div class="feature">Acc\xE9der \xE0 des formations commerciales personnalis\xE9es</div>
                  <div class="feature">G\xE9n\xE9rer des arguments de vente percutants</div>
                  <div class="feature">G\xE9rer tes prospects et opportunit\xE9s avec un CRM int\xE9gr\xE9</div>
                </div>
              </div>
              <div class="footer">
                Cet email a \xE9t\xE9 envoy\xE9 par Hector, l'assistant commercial IA d'ADS GROUP.<br>
                Pour toute question, contacte ton administrateur.
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
Bonjour ${userName},

${inviter} t'invite \xE0 rejoindre Hector, l'assistant commercial IA d'ADS GROUP.

R\xF4le : ${roleLabel}

Pour cr\xE9er ton compte et choisir ton mot de passe, clique sur ce lien :
${inviteUrl}

\u23F1\uFE0F Important : Ce lien d'invitation est valable pendant 7 jours.

AVEC HECTOR, TU POURRAS :
\u2713 Obtenir des r\xE9ponses \xE0 tes questions commerciales
\u2713 Structurer tes r\xE9unions de management
\u2713 Acc\xE9der \xE0 des formations commerciales personnalis\xE9es
\u2713 G\xE9n\xE9rer des arguments de vente percutants
\u2713 G\xE9rer tes prospects et opportunit\xE9s avec un CRM int\xE9gr\xE9

---
Hector - ADS GROUP
      `.trim()
    });
    console.log(`[Email] Invitation email sent to ${to}`);
  } catch (error) {
    console.error("[Email] Error sending invitation email:", error);
    throw new Error("Impossible d'envoyer l'email d'invitation");
  }
}

// server/routes.ts
import { z as z8 } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";

// server/api-security/quota-manager.ts
init_db();

// server/utils/email-alerts.ts
import { Resend as Resend2 } from "resend";
var resend2 = new Resend2(process.env.RESEND_API_KEY);
async function sendQuotaAlert(params) {
  const { apiSource, currentUsage, quota, usagePercent, severity } = params;
  const severityColors = {
    WARNING: { bg: "#fef3c7", border: "#f59e0b", text: "#92400e" },
    CRITICAL: { bg: "#fee2e2", border: "#dc2626", text: "#7f1d1d" },
    BLOCKED: { bg: "#fecaca", border: "#991b1b", text: "#450a0a" }
  };
  const severityLabels = {
    WARNING: "\u26A0\uFE0F Alerte",
    CRITICAL: "\u{1F6A8} Critique",
    BLOCKED: "\u{1F534} Bloqu\xE9"
  };
  const colors = severityColors[severity];
  const label = severityLabels[severity];
  const apiLabels = {
    claude_api: "Claude AI",
    brave_search: "Brave Search",
    pappers: "Pappers",
    google_search: "Google Search",
    linkedin: "LinkedIn",
    pagejaunes: "Pages Jaunes"
  };
  const apiLabel = apiLabels[apiSource] || apiSource;
  try {
    await resend2.emails.send({
      from: "Hector - Alerte API <onboarding@resend.dev>",
      to: ["kaladjian@adsgroup-security.com"],
      subject: `${label} - Quota API ${apiLabel} \xE0 ${usagePercent}%`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #1e293b;
                background-color: #f8fafc;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 600px;
                margin: 40px auto;
                background-color: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
              }
              .header {
                background-color: #1e3a5f;
                color: #ffffff;
                padding: 32px 24px;
                text-align: center;
              }
              .header h1 {
                margin: 0;
                font-size: 24px;
                font-weight: 600;
              }
              .content {
                padding: 32px 24px;
              }
              .alert-box {
                margin: 24px 0;
                padding: 20px;
                background-color: ${colors.bg};
                border-left: 4px solid ${colors.border};
                border-radius: 4px;
              }
              .alert-title {
                font-size: 18px;
                font-weight: 600;
                color: ${colors.text};
                margin: 0 0 12px 0;
              }
              .alert-message {
                font-size: 15px;
                color: ${colors.text};
                margin: 0;
              }
              .stats-container {
                margin: 24px 0;
                padding: 20px;
                background-color: #f1f5f9;
                border-radius: 6px;
              }
              .stat-row {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #e2e8f0;
              }
              .stat-row:last-child {
                border-bottom: none;
              }
              .stat-label {
                font-weight: 600;
                color: #475569;
              }
              .stat-value {
                color: #1e293b;
                font-weight: 700;
              }
              .progress-bar {
                width: 100%;
                height: 24px;
                background-color: #e2e8f0;
                border-radius: 12px;
                overflow: hidden;
                margin: 16px 0;
              }
              .progress-fill {
                height: 100%;
                background-color: ${colors.border};
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: 600;
                font-size: 12px;
              }
              .action-box {
                margin-top: 24px;
                padding: 16px;
                background-color: #eff6ff;
                border: 1px solid #3b82f6;
                border-radius: 6px;
              }
              .action-title {
                font-weight: 600;
                color: #1e40af;
                margin: 0 0 8px 0;
              }
              .action-list {
                margin: 8px 0;
                padding-left: 20px;
                color: #1e40af;
              }
              .button-container {
                text-align: center;
                margin: 32px 0;
              }
              .button {
                display: inline-block;
                background-color: #1e3a5f;
                color: #ffffff;
                text-decoration: none;
                padding: 14px 32px;
                border-radius: 6px;
                font-weight: 600;
                font-size: 15px;
              }
              .button:hover {
                background-color: #2d4a6f;
              }
              .footer {
                padding: 24px;
                text-align: center;
                font-size: 13px;
                color: #94a3b8;
                border-top: 1px solid #e2e8f0;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>\u{1F6E1}\uFE0F Hector - Surveillance API</h1>
              </div>
              <div class="content">
                <div class="alert-box">
                  <h2 class="alert-title">${label} - Quota API</h2>
                  <p class="alert-message">
                    Le quota de l'API <strong>${apiLabel}</strong> a atteint ${usagePercent}% de sa limite journali\xE8re.
                  </p>
                </div>

                <div class="stats-container">
                  <div class="stat-row">
                    <span class="stat-label">API Source:</span>
                    <span class="stat-value">${apiLabel}</span>
                  </div>
                  <div class="stat-row">
                    <span class="stat-label">Utilisation:</span>
                    <span class="stat-value">${currentUsage} / ${quota} requ\xEAtes</span>
                  </div>
                  <div class="stat-row">
                    <span class="stat-label">Pourcentage:</span>
                    <span class="stat-value">${usagePercent}%</span>
                  </div>
                  <div class="stat-row">
                    <span class="stat-label">Statut:</span>
                    <span class="stat-value">${severity}</span>
                  </div>
                </div>

                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${Math.min(usagePercent, 100)}%">
                    ${usagePercent}%
                  </div>
                </div>

                ${severity === "WARNING" ? `
                <div class="action-box">
                  <p class="action-title">\u26A0\uFE0F Actions recommand\xE9es:</p>
                  <ul class="action-list">
                    <li>Surveiller l'\xE9volution de la consommation</li>
                    <li>V\xE9rifier les logs d'utilisation</li>
                    <li>Pr\xE9parer une augmentation de quota si n\xE9cessaire</li>
                  </ul>
                </div>
                ` : ""}

                ${severity === "CRITICAL" ? `
                <div class="action-box">
                  <p class="action-title">\u{1F6A8} Actions urgentes:</p>
                  <ul class="action-list">
                    <li><strong>Augmenter imm\xE9diatement le quota</strong></li>
                    <li>Optimiser les appels API pour r\xE9duire la consommation</li>
                    <li>V\xE9rifier qu'il n'y a pas de boucle infinie</li>
                  </ul>
                </div>
                ` : ""}

                ${severity === "BLOCKED" ? `
                <div class="action-box">
                  <p class="action-title">\u{1F534} API BLOQU\xC9E:</p>
                  <ul class="action-list">
                    <li><strong>L'API est actuellement bloqu\xE9e</strong></li>
                    <li>Les nouvelles requ\xEAtes seront rejet\xE9es</li>
                    <li>D\xE9bloquer manuellement ou attendre le reset automatique</li>
                  </ul>
                </div>
                ` : ""}

                <div class="button-container">
                  <a href="${process.env.REPLIT_DOMAINS?.split(",")[0] || "http://localhost:5000"}/admin/api-security" class="button">
                    Acc\xE9der au dashboard
                  </a>
                </div>

                <p style="font-size: 14px; color: #64748b; text-align: center; margin-top: 24px;">
                  Cet email a \xE9t\xE9 envoy\xE9 automatiquement par le syst\xE8me de surveillance d'Hector.
                </p>
              </div>
              <div class="footer">
                \xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} ADS GROUP - Hector AI Assistant
                <br>
                <small>Email envoy\xE9 le ${(/* @__PURE__ */ new Date()).toLocaleString("fr-FR")}</small>
              </div>
            </div>
          </body>
        </html>
      `
    });
    console.log(`[EMAIL ALERT] Alerte envoy\xE9e pour ${apiSource} (${severity}) \xE0 kaladjian@adsgroup-security.com`);
  } catch (error) {
    console.error("[EMAIL ALERT] Erreur lors de l'envoi de l'alerte:", error);
  }
}

// server/api-security/quota-manager.ts
var QuotaManager = class _QuotaManager {
  static instance;
  alertsSent = /* @__PURE__ */ new Set();
  // Pour éviter les doublons
  constructor() {
  }
  static getInstance() {
    if (!_QuotaManager.instance) {
      _QuotaManager.instance = new _QuotaManager();
    }
    return _QuotaManager.instance;
  }
  async checkQuota(apiSource) {
    const quota = await this.getQuota(apiSource);
    if (!quota) {
      console.warn(`Quota non configur\xE9 pour ${apiSource}`);
      return { allowed: true };
    }
    await this.resetCountersIfNeeded(quota);
    if (quota.compteur_minute >= quota.quota_minute) {
      await this.updateStatus(apiSource, "blocked");
      await this.logIncident(apiSource, "minute_limit", "CRITICAL");
      return { allowed: false, reason: "Limite minute d\xE9pass\xE9e" };
    }
    if (quota.compteur_heure >= quota.quota_heure) {
      await this.updateStatus(apiSource, "blocked");
      await this.logIncident(apiSource, "hour_limit", "CRITICAL");
      return { allowed: false, reason: "Limite heure d\xE9pass\xE9e" };
    }
    if (quota.compteur_jour >= quota.quota_jour) {
      await this.updateStatus(apiSource, "critical");
      await this.logIncident(apiSource, "day_limit", "CRITICAL");
      return { allowed: false, reason: "Limite journali\xE8re d\xE9pass\xE9e" };
    }
    const usagePercent = quota.compteur_jour / quota.quota_jour * 100;
    if (usagePercent >= 95) {
      await this.updateStatus(apiSource, "critical");
      await this.logIncident(
        apiSource,
        "threshold_critical",
        "CRITICAL",
        `${usagePercent.toFixed(0)}% du quota journalier utilis\xE9`
      );
      await this.sendEmailAlertIfNeeded(apiSource, quota.compteur_jour, quota.quota_jour, Math.round(usagePercent), "CRITICAL");
    } else if (usagePercent >= quota.seuil_alerte) {
      await this.updateStatus(apiSource, "warning");
      await this.logIncident(
        apiSource,
        "threshold_warning",
        "WARNING",
        `${usagePercent.toFixed(0)}% du quota journalier utilis\xE9`
      );
      await this.sendEmailAlertIfNeeded(apiSource, quota.compteur_jour, quota.quota_jour, Math.round(usagePercent), "WARNING");
    } else if (quota.status !== "ok") {
      await this.updateStatus(apiSource, "ok");
      this.alertsSent.delete(`${apiSource}_WARNING`);
      this.alertsSent.delete(`${apiSource}_CRITICAL`);
      this.alertsSent.delete(`${apiSource}_BLOCKED`);
    }
    return { allowed: true };
  }
  async sendEmailAlertIfNeeded(apiSource, currentUsage, quota, usagePercent, severity) {
    const alertKey = `${apiSource}_${severity}`;
    if (this.alertsSent.has(alertKey)) {
      return;
    }
    try {
      await sendQuotaAlert({
        apiSource,
        currentUsage,
        quota,
        usagePercent,
        severity
      });
      this.alertsSent.add(alertKey);
      console.log(`[QUOTA MANAGER] Alerte ${severity} envoy\xE9e pour ${apiSource}`);
    } catch (error) {
      console.error(`[QUOTA MANAGER] Erreur envoi alerte ${severity} pour ${apiSource}:`, error);
    }
  }
  async incrementCounter(apiSource) {
    await pool.query(
      `UPDATE api_quotas 
       SET compteur_minute = compteur_minute + 1,
           compteur_heure = compteur_heure + 1,
           compteur_jour = compteur_jour + 1,
           updated_at = NOW()
       WHERE api_source = $1`,
      [apiSource]
    );
  }
  async getQuota(apiSource) {
    const result = await pool.query(
      "SELECT * FROM api_quotas WHERE api_source = $1",
      [apiSource]
    );
    return result.rows[0] || null;
  }
  async resetCountersIfNeeded(quota) {
    const now = /* @__PURE__ */ new Date();
    const updates = [];
    const lastResetMinute = new Date(quota.last_reset_minute);
    if (now.getTime() - lastResetMinute.getTime() >= 6e4) {
      updates.push("compteur_minute = 0, last_reset_minute = NOW()");
    }
    const lastResetHeure = new Date(quota.last_reset_heure);
    if (now.getTime() - lastResetHeure.getTime() >= 36e5) {
      updates.push("compteur_heure = 0, last_reset_heure = NOW()");
    }
    const lastResetJour = new Date(quota.last_reset_jour);
    if (now.getTime() - lastResetJour.getTime() >= 864e5) {
      updates.push("compteur_jour = 0, last_reset_jour = NOW(), status = 'ok'");
    }
    if (updates.length > 0) {
      await pool.query(
        `UPDATE api_quotas SET ${updates.join(", ")} WHERE api_source = $1`,
        [quota.api_source]
      );
    }
  }
  async updateStatus(apiSource, status) {
    await pool.query(
      "UPDATE api_quotas SET status = $1, updated_at = NOW() WHERE api_source = $2",
      [status, apiSource]
    );
  }
  async logIncident(apiSource, type, severity, message) {
    await pool.query(
      `INSERT INTO api_security_log (api_source, incident_type, severity, error_message, timestamp)
       VALUES ($1, $2, $3, $4, NOW())`,
      [apiSource, type, severity, message || `Incident ${type} d\xE9tect\xE9`]
    );
  }
  async getRetryAfter(apiSource) {
    const quota = await this.getQuota(apiSource);
    if (!quota) return 60;
    const now = (/* @__PURE__ */ new Date()).getTime();
    const lastResetMinute = new Date(quota.last_reset_minute).getTime();
    const nextReset = lastResetMinute + 6e4;
    return Math.max(0, Math.ceil((nextReset - now) / 1e3));
  }
  async getAllQuotas() {
    const result = await pool.query("SELECT * FROM api_quotas ORDER BY api_source");
    return result.rows;
  }
};
var quotaManager = QuotaManager.getInstance();

// server/api-security/rate-limiter.ts
var RateLimiter = class {
  lastRequestTime = /* @__PURE__ */ new Map();
  async waitRandomDelay(minMs, maxMs) {
    const delay = Math.random() * (maxMs - minMs) + minMs;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  async waitIfNeeded(apiSource) {
    const delays = {
      google_search: { min: 2e3, max: 5e3 },
      linkedin: { min: 3e3, max: 8e3 },
      pagejaunes: { min: 1e3, max: 3e3 },
      pappers: { min: 500, max: 2e3 },
      brave_search: { min: 300, max: 1e3 },
      claude_api: { min: 100, max: 500 },
      default: { min: 1e3, max: 3e3 }
    };
    const config = delays[apiSource] || delays.default;
    const lastTime = this.lastRequestTime.get(apiSource) || 0;
    const now = Date.now();
    const elapsed = now - lastTime;
    const minDelay = config.min;
    if (elapsed < minDelay) {
      await new Promise((resolve) => setTimeout(resolve, minDelay - elapsed));
    }
    await this.waitRandomDelay(config.min, config.max);
    this.lastRequestTime.set(apiSource, Date.now());
  }
  resetTimer(apiSource) {
    this.lastRequestTime.delete(apiSource);
  }
};
var rateLimiter = new RateLimiter();

// server/api-security/incident-manager.ts
init_db();
var IncidentManager = class {
  async handleApiError(error) {
    const severity = this.calculateSeverity(error.code);
    await pool.query(
      `INSERT INTO api_security_log 
       (api_source, incident_type, error_code, error_message, severity, timestamp, request_details)
       VALUES ($1, $2, $3, $4, $5, NOW(), $6)`,
      [
        error.source,
        this.getIncidentType(error.code),
        error.code,
        error.message,
        severity,
        JSON.stringify(error.details || {})
      ]
    );
    if (severity === "CRITICAL") {
      await pool.query(
        `UPDATE api_quotas SET status = 'blocked' WHERE api_source = $1`,
        [error.source]
      );
    }
    if (severity === "CRITICAL") {
      console.error(`[CRITICAL] API ${error.source} - Code ${error.code}: ${error.message}`);
    }
  }
  calculateSeverity(errorCode) {
    if ([429, 403, 401].includes(errorCode)) return "CRITICAL";
    if ([503, 502, 500].includes(errorCode)) return "WARNING";
    return "INFO";
  }
  getIncidentType(errorCode) {
    const types = {
      429: "rate_limit",
      403: "forbidden",
      401: "unauthorized",
      503: "service_unavailable",
      500: "server_error"
    };
    return types[errorCode] || "unknown_error";
  }
  async getRecentIncidents(limit = 50) {
    const result = await pool.query(
      `SELECT * FROM api_security_log 
       ORDER BY timestamp DESC 
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  }
  async resolveIncident(incidentId, notes) {
    await pool.query(
      `UPDATE api_security_log 
       SET resolved = true, resolved_at = NOW(), notes = $2
       WHERE id = $1`,
      [incidentId, notes || ""]
    );
  }
};
var incidentManager = new IncidentManager();

// server/routes.ts
init_db();
import { sql as sql25 } from "drizzle-orm";

// server/webhooks/resend.ts
init_storage();
import express from "express";
import { sql as sql8 } from "drizzle-orm";
var router = express.Router();
router.post("/", async (req, res) => {
  try {
    const event = req.body;
    console.log("\u{1F4E9} [WEBHOOK RESEND]:", event.type);
    const tags = event.data?.tags || [];
    const prospectIdTag = tags.find((t) => t.name === "prospect_id");
    const prospectId = prospectIdTag?.value;
    const etapeIdTag = tags.find((t) => t.name === "etape_id");
    const etapeId = etapeIdTag?.value;
    const messageId = event.data?.email_id || event.data?.message_id;
    if (!prospectId) {
      console.warn("\u26A0\uFE0F [WEBHOOK RESEND] Pas de prospect_id dans les tags");
      return res.status(200).json({ received: true });
    }
    switch (event.type) {
      case "email.delivered":
        await handleEmailDelivered(prospectId, messageId, event.data);
        break;
      case "email.opened":
        await handleEmailOpened(prospectId, messageId, etapeId, event.data);
        break;
      case "email.clicked":
        await handleEmailClicked(prospectId, messageId, etapeId, event.data);
        break;
      case "email.bounced":
      case "email.complained":
        await handleEmailFailed(prospectId, messageId, etapeId, event.type, event.data);
        break;
    }
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("\u274C [WEBHOOK RESEND] Erreur:", error);
    return res.status(500).json({ error: error.message });
  }
});
async function handleEmailDelivered(prospectId, messageId, data) {
  console.log(`\u2705 [WEBHOOK] Email d\xE9livr\xE9 \xE0 prospect ${prospectId} (messageId: ${messageId})`);
  await storage.createInteraction({
    prospectEnProspectionId: prospectId,
    canal: "email",
    typeInteraction: "delivered",
    metadata: {
      delivered_at: (/* @__PURE__ */ new Date()).toISOString(),
      resendMessageId: messageId
    }
  });
}
async function handleEmailOpened(prospectId, messageId, etapeId, data) {
  console.log(`\u{1F440} [WEBHOOK] Email ouvert par prospect ${prospectId} (messageId: ${messageId})`);
  const prospect = await storage.updateProspectEnProspection(prospectId, "", {
    scoreEngagement: sql8`score_engagement + 5`
  });
  await storage.createInteraction({
    prospectEnProspectionId: prospectId,
    canal: "email",
    typeInteraction: "opened",
    metadata: {
      opened_at: (/* @__PURE__ */ new Date()).toISOString(),
      resendMessageId: messageId
    }
  });
  try {
    const interactions = await storage.getProspectInteractions(prospectId);
    let sentEmail = messageId ? interactions.find(
      (i) => i.typeInteraction === "sent" && i.canal === "email" && i.metadata?.messageId === messageId
    ) : null;
    if (!sentEmail && etapeId) {
      const emailsForEtape = interactions.filter(
        (i) => i.typeInteraction === "sent" && i.canal === "email" && i.etapeId === etapeId
      ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      sentEmail = emailsForEtape[0];
    }
    if (sentEmail?.variantId) {
      await storage.updateVariantMetrics(sentEmail.variantId, "opened");
      console.log(`[A/B TESTING] \u{1F4CA} M\xE9triques variant ${sentEmail.variantId}: opened +1 (messageId: ${messageId})`);
    } else {
      console.warn(`[A/B TESTING] \u26A0\uFE0F Impossible de trouver l'email sent correspondant (messageId: ${messageId}, etapeId: ${etapeId})`);
    }
  } catch (metricsError) {
    console.error(`[A/B TESTING] \u274C Erreur mise \xE0 jour m\xE9triques opened: ${metricsError.message}`);
  }
}
async function handleEmailClicked(prospectId, messageId, etapeId, data) {
  console.log(`\u{1F5B1}\uFE0F [WEBHOOK] Lien cliqu\xE9 par prospect ${prospectId} (messageId: ${messageId})`);
  const prospect = await storage.updateProspectEnProspection(prospectId, "", {
    scoreEngagement: sql8`score_engagement + 10`
  });
  await storage.createInteraction({
    prospectEnProspectionId: prospectId,
    canal: "email",
    typeInteraction: "clicked",
    metadata: {
      clicked_at: (/* @__PURE__ */ new Date()).toISOString(),
      resendMessageId: messageId
    }
  });
  try {
    const interactions = await storage.getProspectInteractions(prospectId);
    let sentEmail = messageId ? interactions.find(
      (i) => i.typeInteraction === "sent" && i.canal === "email" && i.metadata?.messageId === messageId
    ) : null;
    if (!sentEmail && etapeId) {
      const emailsForEtape = interactions.filter(
        (i) => i.typeInteraction === "sent" && i.canal === "email" && i.etapeId === etapeId
      ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      sentEmail = emailsForEtape[0];
    }
    if (sentEmail?.variantId) {
      await storage.updateVariantMetrics(sentEmail.variantId, "clicked");
      console.log(`[A/B TESTING] \u{1F4CA} M\xE9triques variant ${sentEmail.variantId}: clicked +1 (messageId: ${messageId})`);
    } else {
      console.warn(`[A/B TESTING] \u26A0\uFE0F Impossible de trouver l'email sent correspondant (messageId: ${messageId}, etapeId: ${etapeId})`);
    }
  } catch (metricsError) {
    console.error(`[A/B TESTING] \u274C Erreur mise \xE0 jour m\xE9triques clicked: ${metricsError.message}`);
  }
}
async function handleEmailFailed(prospectId, messageId, etapeId, reason, data) {
  console.log(`\u274C [WEBHOOK] Email \xE9chou\xE9 pour prospect ${prospectId}: ${reason} (messageId: ${messageId})`);
  if (reason === "email.complained" || reason === "email.bounced") {
    await storage.addToBlacklist({
      email: data.to,
      raison: reason === "email.complained" ? "Plainte spam" : "Bounce",
      source: "resend_webhook"
    });
    await storage.updateProspectEnProspection(prospectId, "", {
      statut: "blacklisted"
    });
    try {
      const interactions = await storage.getProspectInteractions(prospectId);
      let sentEmail = messageId ? interactions.find(
        (i) => i.typeInteraction === "sent" && i.canal === "email" && i.metadata?.messageId === messageId
      ) : null;
      if (!sentEmail && etapeId) {
        const emailsForEtape = interactions.filter(
          (i) => i.typeInteraction === "sent" && i.canal === "email" && i.etapeId === etapeId
        ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        sentEmail = emailsForEtape[0];
      }
      if (sentEmail?.variantId) {
        await storage.updateVariantMetrics(sentEmail.variantId, "bounced");
        console.log(`[A/B TESTING] \u{1F4CA} M\xE9triques variant ${sentEmail.variantId}: bounced +1 (messageId: ${messageId})`);
      } else {
        console.warn(`[A/B TESTING] \u26A0\uFE0F Impossible de trouver l'email sent correspondant (messageId: ${messageId}, etapeId: ${etapeId})`);
      }
    } catch (metricsError) {
      console.error(`[A/B TESTING] \u274C Erreur mise \xE0 jour m\xE9triques bounced: ${metricsError.message}`);
    }
  }
}
var resend_default = router;

// server/webhooks/twilio.ts
init_storage();
import express2 from "express";
import { sql as sql9 } from "drizzle-orm";
var router2 = express2.Router();
router2.post("/", async (req, res) => {
  try {
    const event = req.body;
    console.log("\u{1F4F1} [WEBHOOK TWILIO]:", event.MessageStatus || event.SmsStatus);
    const prospectId = req.query.prospectId;
    if (!prospectId) {
      console.warn("\u26A0\uFE0F [WEBHOOK TWILIO] Pas de prospectId dans la query");
      return res.status(200).send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
    }
    const status = event.MessageStatus || event.SmsStatus;
    switch (status) {
      case "delivered":
        await handleSMSDelivered(prospectId, event);
        break;
      case "failed":
      case "undelivered":
        await handleSMSFailed(prospectId, event);
        break;
    }
    return res.status(200).send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
  } catch (error) {
    console.error("\u274C [WEBHOOK TWILIO] Erreur:", error);
    return res.status(500).json({ error: error.message });
  }
});
async function handleSMSDelivered(prospectId, data) {
  console.log(`\u2705 [WEBHOOK] SMS d\xE9livr\xE9 \xE0 prospect ${prospectId}`);
  await storage.createInteraction({
    prospectEnProspectionId: prospectId,
    canal: "sms",
    typeInteraction: "delivered",
    metadata: { delivered_at: (/* @__PURE__ */ new Date()).toISOString() }
  });
  await storage.updateProspectEnProspection(prospectId, "", {
    scoreEngagement: sql9`score_engagement + 3`
  });
}
async function handleSMSFailed(prospectId, data) {
  console.log(`\u274C [WEBHOOK] SMS \xE9chou\xE9 pour prospect ${prospectId}`);
  await storage.createInteraction({
    prospectEnProspectionId: prospectId,
    canal: "sms",
    typeInteraction: "error",
    metadata: {
      error: data.ErrorCode || "Unknown",
      error_message: data.ErrorMessage || "SMS delivery failed"
    }
  });
}
var twilio_default = router2;

// server/services/email/resend-client.ts
import { Resend as Resend3 } from "resend";

// server/services/rate-limiter.ts
var RateLimiter2 = class {
  limits = /* @__PURE__ */ new Map();
  config = /* @__PURE__ */ new Map();
  constructor() {
    this.config.set("claude", {
      maxRequests: 50,
      // 50 requêtes
      windowMs: 60 * 1e3,
      // par minute
      backoffMultiplier: 2,
      maxBackoffMs: 3e5
      // max 5 minutes
    });
    this.config.set("resend", {
      maxRequests: 100,
      // 100 emails
      windowMs: 60 * 1e3,
      // par minute
      backoffMultiplier: 1.5,
      maxBackoffMs: 18e4
      // max 3 minutes
    });
    this.config.set("twilio", {
      maxRequests: 30,
      // 30 SMS
      windowMs: 60 * 1e3,
      // par minute
      backoffMultiplier: 2,
      maxBackoffMs: 3e5
      // max 5 minutes
    });
    this.config.set("pappers", {
      maxRequests: 20,
      // 20 recherches
      windowMs: 60 * 1e3,
      // par minute
      backoffMultiplier: 1.5,
      maxBackoffMs: 18e4
      // max 3 minutes
    });
  }
  /**
   * Vérifie si une requête peut être effectuée
   * Retourne { allowed: boolean, retryAfterMs?: number }
   */
  async checkLimit(service) {
    const config = this.config.get(service);
    if (!config) {
      console.warn(`\u26A0\uFE0F [RATE LIMIT] Service inconnu: ${service}`);
      return { allowed: true };
    }
    const now = Date.now();
    let state = this.limits.get(service);
    if (state && state.backoffUntil > now) {
      const retryAfterMs = state.backoffUntil - now;
      console.warn(`\u{1F6AB} [RATE LIMIT] ${service} en backoff - retry dans ${Math.ceil(retryAfterMs / 1e3)}s`);
      return {
        allowed: false,
        retryAfterMs,
        reason: `Service ${service} temporairement ralenti - r\xE9essayer dans ${Math.ceil(retryAfterMs / 1e3)}s`
      };
    }
    if (!state || now > state.resetTime) {
      state = {
        count: 0,
        resetTime: now + config.windowMs,
        backoffUntil: 0
      };
      this.limits.set(service, state);
    }
    if (state.count >= config.maxRequests) {
      const retryAfterMs = state.resetTime - now;
      console.warn(`\u{1F6AB} [RATE LIMIT] ${service} limite atteinte (${config.maxRequests}/${config.windowMs}ms) - retry dans ${Math.ceil(retryAfterMs / 1e3)}s`);
      return {
        allowed: false,
        retryAfterMs,
        reason: `Limite ${service} atteinte - r\xE9essayer dans ${Math.ceil(retryAfterMs / 1e3)}s`
      };
    }
    state.count++;
    return { allowed: true };
  }
  /**
   * Enregistre une erreur et active le backoff si nécessaire
   */
  async recordError(service, errorCode) {
    const config = this.config.get(service);
    if (!config) return;
    const shouldBackoff = errorCode === 429 || errorCode === 503 || errorCode === 509;
    if (shouldBackoff) {
      const state = this.limits.get(service) || {
        count: 0,
        resetTime: Date.now() + config.windowMs,
        backoffUntil: 0
      };
      const currentBackoff = state.backoffUntil > Date.now() ? state.backoffUntil - Date.now() : config.windowMs;
      const newBackoff = Math.min(
        currentBackoff * (config.backoffMultiplier || 2),
        config.maxBackoffMs || 3e5
      );
      state.backoffUntil = Date.now() + newBackoff;
      this.limits.set(service, state);
      console.warn(`\u23F8\uFE0F [RATE LIMIT] ${service} backoff activ\xE9: ${Math.ceil(newBackoff / 1e3)}s (code ${errorCode})`);
    }
  }
  /**
   * Réinitialise le compteur d'un service (pour tests ou admin)
   */
  reset(service) {
    this.limits.delete(service);
    console.log(`\u{1F504} [RATE LIMIT] ${service} r\xE9initialis\xE9`);
  }
  /**
   * Obtenir les stats d'un service
   */
  getStats(service) {
    const config = this.config.get(service);
    const state = this.limits.get(service);
    if (!config) return null;
    const now = Date.now();
    return {
      count: state?.count || 0,
      maxRequests: config.maxRequests,
      resetIn: state ? Math.max(0, state.resetTime - now) : 0,
      backoffUntil: state?.backoffUntil && state.backoffUntil > now ? state.backoffUntil : void 0
    };
  }
  /**
   * Wrapper pour exécuter une fonction avec rate limiting automatique
   */
  async executeWithLimit(service, fn, options) {
    const maxRetries = options?.maxRetries || 3;
    const retryDelayMs = options?.retryDelayMs || 1e3;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const limitCheck = await this.checkLimit(service);
      if (!limitCheck.allowed) {
        if (attempt === maxRetries - 1) {
          throw new Error(`Rate limit ${service}: ${limitCheck.reason}`);
        }
        const waitTime = limitCheck.retryAfterMs || retryDelayMs;
        console.log(`\u23F3 [RATE LIMIT] Attente ${Math.ceil(waitTime / 1e3)}s avant retry (${attempt + 1}/${maxRetries})`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }
      try {
        return await fn();
      } catch (error) {
        const statusCode = error.status || error.statusCode || error.code;
        await this.recordError(service, statusCode);
        if (attempt === maxRetries - 1 || ![429, 503, 509].includes(statusCode)) {
          throw error;
        }
        console.warn(`\u26A0\uFE0F [RATE LIMIT] Erreur ${statusCode} sur ${service}, retry ${attempt + 1}/${maxRetries}`);
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs * (attempt + 1)));
      }
    }
    throw new Error(`Max retries atteint pour ${service}`);
  }
};
var rateLimiter2 = new RateLimiter2();

// server/services/email/resend-client.ts
var connectionSettings;
async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY ? "repl " + process.env.REPL_IDENTITY : process.env.WEB_REPL_RENEWAL ? "depl " + process.env.WEB_REPL_RENEWAL : null;
  if (!xReplitToken) {
    throw new Error("X_REPLIT_TOKEN not found for repl/depl");
  }
  connectionSettings = await fetch(
    "https://" + hostname + "/api/v2/connection?include_secrets=true&connector_names=resend",
    {
      headers: {
        "Accept": "application/json",
        "X_REPLIT_TOKEN": xReplitToken
      }
    }
  ).then((res) => res.json()).then((data) => data.items?.[0]);
  if (!connectionSettings || !connectionSettings.settings.api_key) {
    throw new Error("Resend not connected");
  }
  return {
    apiKey: connectionSettings.settings.api_key,
    fromEmail: connectionSettings.settings.from_email
  };
}
async function getUncachableResendClient() {
  const { apiKey, fromEmail } = await getCredentials();
  return {
    client: new Resend3(apiKey),
    fromEmail
  };
}
async function sendEmail({
  to,
  subject,
  html,
  text: text6,
  from,
  tags = []
}) {
  return rateLimiter2.executeWithLimit("resend", async () => {
    try {
      const { client, fromEmail } = await getUncachableResendClient();
      const fromAddress = from || "Hector - ADS GROUP <onboarding@resend.dev>";
      console.log(`\u{1F4E7} [RESEND] Envoi email:`);
      console.log(`   From: ${fromAddress}`);
      console.log(`   To: ${to}`);
      console.log(`   Subject: ${subject}`);
      const result = await client.emails.send({
        from: fromAddress,
        to: [to],
        subject,
        html,
        text: text6 || stripHtml(html),
        tags
      });
      console.log(`\u{1F4CA} [RESEND] R\xE9ponse compl\xE8te:`, JSON.stringify(result, null, 2));
      console.log(`\u2705 [RESEND] Email envoy\xE9 \xE0 ${to} - ID: ${result.data?.id || "N/A"}`);
      return {
        success: true,
        messageId: result.data?.id,
        provider: "resend"
      };
    } catch (error) {
      console.error(`\u274C [RESEND] Erreur envoi email \xE0 ${to}:`, error);
      return {
        success: false,
        error: error.message,
        provider: "resend"
      };
    }
  });
}
function stripHtml(html) {
  return html.replace(/<[^>]*>/g, "");
}

// server/services/email/templates.ts
function prospectionEmailTemplate({
  prenom,
  entreprise,
  message,
  signature,
  unsubscribeUrl
}) {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .email-container {
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #0052A5 0%, #003875 100%);
      color: white;
      padding: 30px 20px;
      text-align: center;
    }
    .header h2 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      padding: 30px;
    }
    .message {
      white-space: pre-line;
      margin: 20px 0;
      font-size: 15px;
    }
    .signature {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 2px solid #0052A5;
      white-space: pre-line;
    }
    .footer {
      background: #f5f5f5;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
    .footer a {
      color: #0052A5;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h2>\u{1F512} ADS GROUP - Solutions S\xE9curit\xE9</h2>
    </div>
    
    <div class="content">
      <p style="font-size: 16px; margin-bottom: 10px;">Bonjour ${prenom},</p>
      
      <div class="message">${message}</div>
      
      <div class="signature">${signature}</div>
    </div>
    
    <div class="footer">
      <p>Vous recevez cet email car nous pensons que nos solutions peuvent vous int\xE9resser.</p>
      <p><a href="${unsubscribeUrl}">Se d\xE9sabonner</a></p>
      <p>\xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} ADS GROUP Security - Tous droits r\xE9serv\xE9s</p>
    </div>
  </div>
</body>
</html>
  `;
}

// server/services/sms/twilio-client.ts
import twilio from "twilio";
var connectionSettings2;
async function getCredentials2() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY ? "repl " + process.env.REPL_IDENTITY : process.env.WEB_REPL_RENEWAL ? "depl " + process.env.WEB_REPL_RENEWAL : null;
  if (!xReplitToken) {
    throw new Error("X_REPLIT_TOKEN not found for repl/depl");
  }
  connectionSettings2 = await fetch(
    "https://" + hostname + "/api/v2/connection?include_secrets=true&connector_names=twilio",
    {
      headers: {
        "Accept": "application/json",
        "X_REPLIT_TOKEN": xReplitToken
      }
    }
  ).then((res) => res.json()).then((data) => data.items?.[0]);
  if (!connectionSettings2 || (!connectionSettings2.settings.account_sid || !connectionSettings2.settings.api_key || !connectionSettings2.settings.api_key_secret)) {
    throw new Error("Twilio not connected");
  }
  return {
    accountSid: connectionSettings2.settings.account_sid,
    apiKey: connectionSettings2.settings.api_key,
    apiKeySecret: connectionSettings2.settings.api_key_secret,
    phoneNumber: connectionSettings2.settings.phone_number
  };
}
async function getTwilioClient() {
  const { accountSid, apiKey, apiKeySecret } = await getCredentials2();
  return twilio(apiKey, apiKeySecret, {
    accountSid
  });
}
async function getTwilioFromPhoneNumber() {
  const { phoneNumber } = await getCredentials2();
  return phoneNumber;
}
async function sendSMS({ to, message, from, prospectId }) {
  return rateLimiter2.executeWithLimit("twilio", async () => {
    try {
      const client = await getTwilioClient();
      const fromNumber = from || await getTwilioFromPhoneNumber();
      let normalizedTo = to;
      if (!to.startsWith("+")) {
        if (to.startsWith("0")) {
          normalizedTo = "+33" + to.substring(1);
        } else if (to.match(/^[1-9]/)) {
          normalizedTo = "+33" + to;
        } else {
          throw new Error("Le num\xE9ro doit \xEAtre au format fran\xE7ais (0XXXXXXXXX) ou international (+33...)");
        }
        console.log(`\u{1F504} [TWILIO] Num\xE9ro normalis\xE9: ${to} \u2192 ${normalizedTo}`);
      }
      if (message.length > 160) {
        console.warn(`\u26A0\uFE0F [TWILIO] SMS tronqu\xE9 de ${message.length} \xE0 160 caract\xE8res`);
        message = message.substring(0, 157) + "...";
      }
      const baseUrl = process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : "http://localhost:5000";
      const statusCallback = prospectId ? `${baseUrl}/webhooks/twilio?prospectId=${prospectId}` : void 0;
      const result = await client.messages.create({
        body: message,
        from: fromNumber,
        to: normalizedTo,
        statusCallback
      });
      console.log(`\u2705 [TWILIO] SMS envoy\xE9 \xE0 ${normalizedTo} - SID: ${result.sid}`);
      return {
        success: true,
        messageId: result.sid,
        provider: "twilio"
      };
    } catch (error) {
      console.error(`\u274C [TWILIO] Erreur envoi SMS \xE0 ${to}:`, error);
      return {
        success: false,
        error: error.message,
        provider: "twilio"
      };
    }
  });
}
function generateShortSMS(fullMessage, prenom) {
  if (fullMessage.length <= 160) {
    return fullMessage;
  }
  const firstSentence = fullMessage.split(/[.!?]/)[0];
  if (firstSentence.length <= 140) {
    return `${firstSentence}. \xC9change? R\xE9pondez OUI \u{1F44D}`;
  }
  return `Bonjour ${prenom}, opportunit\xE9 s\xE9curit\xE9. \xC9change 10min? R\xE9pondez OUI \u{1F44D}`;
}

// server/services/enrichment/pappers-enrichment.ts
async function enrichProspectWithPappers(entreprise, siren) {
  try {
    console.log(`\u{1F50D} [PAPPERS] Enrichissement: ${entreprise}`);
    let result;
    if (siren && siren.length === 9) {
      const siret = siren + "00000";
      result = await searchPappersBySiret(siret);
    } else {
      result = await searchPappersByName(entreprise);
    }
    if (!result.success) {
      console.warn(`\u26A0\uFE0F [PAPPERS] Enrichissement \xE9chou\xE9: ${result.error}`);
      return { success: false, error: result.error };
    }
    console.log(`\u2705 [PAPPERS] Enrichissement r\xE9ussi: ${entreprise}`);
    return {
      success: true,
      enrichedData: result.data
    };
  } catch (error) {
    console.error(`\u274C [PAPPERS] Erreur enrichissement:`, error);
    return {
      success: false,
      error: error.message
    };
  }
}
async function searchPappersByName(nom) {
  return rateLimiter2.executeWithLimit("pappers", async () => {
    try {
      const response = await fetch("http://localhost:5001/api/patron/search-nom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom_entreprise: nom })
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      if (!data.success || !data.results || data.results.length === 0) {
        return { success: false, error: "Aucune entreprise trouv\xE9e" };
      }
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
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
}
async function searchPappersBySiret(siret) {
  return rateLimiter2.executeWithLimit("pappers", async () => {
    try {
      const response = await fetch("http://localhost:5001/api/patron/search-siret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siret })
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      if (!data.success || !data.result) {
        return { success: false, error: "Entreprise non trouv\xE9e" };
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
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
}

// server/routes/queue-dashboard.ts
import express3 from "express";

// server/services/queue/prospection-queue.ts
import PgBoss from "pg-boss";
var ProspectionQueue = class {
  boss = null;
  isInitialized = false;
  async initialize() {
    if (this.isInitialized) {
      return;
    }
    try {
      const connectionString = process.env.DATABASE_URL;
      if (!connectionString) {
        throw new Error("DATABASE_URL not found");
      }
      this.boss = new PgBoss({
        connectionString,
        max: 10,
        // Pool size
        retryLimit: 3,
        retryDelay: 60,
        // 1 minute
        retryBackoff: true,
        expireInHours: 12
        // Maximum 12 heures (pg-boss limitation)
      });
      this.boss.on("error", (error) => {
        console.error("\u274C pg-boss error:", error);
      });
      await this.boss.start();
      console.log("\u2705 pg-boss queue started successfully");
      this.isInitialized = true;
    } catch (error) {
      console.error("\u274C Failed to initialize pg-boss:", error);
      throw error;
    }
  }
  async addJob(queueName, data, options) {
    if (!this.boss) {
      throw new Error("Queue not initialized");
    }
    const jobId = await this.boss.send(queueName, data, {
      priority: options?.priority,
      retryLimit: options?.retryLimit || 3,
      retryDelay: options?.retryDelay || 60,
      retryBackoff: true
    });
    console.log(`\u{1F4E4} Job added to queue ${queueName}:`, jobId);
    return jobId;
  }
  async getJobCounts() {
    if (!this.boss) {
      return null;
    }
    try {
      const queues = await this.boss.getQueues();
      const stats = {};
      for (const queue of queues) {
        const queueStats = await this.boss.getQueueSize(queue.name);
        stats[queue.name] = queueStats;
      }
      return stats;
    } catch (error) {
      console.error("Error getting job counts:", error);
      return null;
    }
  }
  async getQueueStats() {
    if (!this.boss) {
      return null;
    }
    try {
      const queues = await this.boss.getQueues();
      const stats = await Promise.all(
        queues.map(async (queue) => {
          const size = await this.boss.getQueueSize(queue.name);
          return {
            name: queue.name,
            size,
            policy: queue.policy
          };
        })
      );
      return stats;
    } catch (error) {
      console.error("Error getting queue stats:", error);
      return [];
    }
  }
  // Méthode utilitaire pour le CRON : crée un job d'envoi avec toutes les données
  async addSendMessageJob(data) {
    const jobData = {
      prospectEnProspectionId: data.prospectData.id,
      prospectId: data.prospectDetails.id,
      campagneId: data.campagne.id,
      userId: data.campagne.userId,
      messageType: data.nextStep.canal,
      messageContent: data.messageGenere,
      etapeId: data.nextStep.id,
      // Données complètes pour le worker
      prospectDetails: data.prospectDetails,
      campagne: data.campagne,
      nextStep: data.nextStep,
      messageSource: data.messageSource
    };
    return this.addJob("send-message", jobData, {
      priority: 10,
      // Haute priorité pour les envois
      retryLimit: 5,
      retryDelay: 15
      // 15 secondes entre les tentatives
    });
  }
  getBoss() {
    return this.boss;
  }
  async shutdown() {
    if (this.boss) {
      await this.boss.stop();
      console.log("\u{1F6D1} pg-boss queue stopped");
    }
  }
};
var prospectionQueue = new ProspectionQueue();

// server/routes/queue-dashboard.ts
var router3 = express3.Router();
router3.get("/stats", isAdmin, async (req, res) => {
  try {
    const stats = await prospectionQueue.getQueueStats();
    res.json({
      success: true,
      stats: stats || []
    });
  } catch (error) {
    console.error("Error getting queue stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get queue stats"
    });
  }
});
router3.get("/counts", isAdmin, async (req, res) => {
  try {
    const counts = await prospectionQueue.getJobCounts();
    res.json({
      success: true,
      counts: counts || {}
    });
  } catch (error) {
    console.error("Error getting job counts:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get job counts"
    });
  }
});
router3.get("/dashboard", isAdmin, (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Queue Dashboard</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          background: #f5f5f5;
        }
        h1 {
          color: #333;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }
        .stat-card {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .stat-card h3 {
          margin: 0 0 10px 0;
          color: #666;
          font-size: 14px;
          text-transform: uppercase;
        }
        .stat-card .value {
          font-size: 32px;
          font-weight: bold;
          color: #2563eb;
        }
        .refresh-btn {
          background: #2563eb;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
        }
        .refresh-btn:hover {
          background: #1d4ed8;
        }
      </style>
    </head>
    <body>
      <h1>\u{1F4CA} Queue Dashboard</h1>
      <button class="refresh-btn" onclick="loadStats()">\u{1F504} Rafra\xEEchir</button>
      
      <div class="stats-grid" id="stats-container">
        <div class="stat-card">
          <h3>Chargement...</h3>
          <div class="value">-</div>
        </div>
      </div>

      <script>
        async function loadStats() {
          try {
            const response = await fetch('/admin/queues/stats');
            const data = await response.json();
            
            if (data.success) {
              const container = document.getElementById('stats-container');
              
              if (data.stats.length === 0) {
                container.innerHTML = '<div class="stat-card"><h3>Aucune queue</h3><div class="value">0</div></div>';
                return;
              }
              
              container.innerHTML = data.stats.map(queue => \`
                <div class="stat-card">
                  <h3>\${queue.name}</h3>
                  <div class="value">\${queue.size || 0}</div>
                  <p>jobs en attente</p>
                </div>
              \`).join('');
            }
          } catch (error) {
            console.error('Error loading stats:', error);
          }
        }
        
        // Load stats on page load
        loadStats();
        
        // Auto-refresh every 5 seconds
        setInterval(loadStats, 5000);
      </script>
    </body>
    </html>
  `);
});
var queue_dashboard_default = router3;

// server/routes/learning.ts
init_db();
init_schema();
import { Router } from "express";
import { eq as eq4, desc as desc3, and as and3, count as count2 } from "drizzle-orm";

// server/services/ai/learning-loop.ts
init_db();
init_schema();
import Anthropic2 from "@anthropic-ai/sdk";
import { eq as eq3, and as and2, gte as gte2, desc as desc2 } from "drizzle-orm";
var anthropic2 = new Anthropic2({
  apiKey: process.env.ANTHROPIC_API_KEY
});
async function analyzeMessagePatterns(minSampleSize = 10, minSuccessRate = 0.2) {
  console.log(`[Learning Loop] Analyse des patterns de messages (min ${minSampleSize} \xE9chantillons, ${minSuccessRate * 100}% succ\xE8s)`);
  const variants = await db.select({
    id: messageVariants2.id,
    etapeId: messageVariants2.etapeId,
    canal: messageVariants2.canal,
    messageTemplate: messageVariants2.messageTemplate,
    sent: variantMetrics.sent,
    opened: variantMetrics.opened,
    clicked: variantMetrics.clicked,
    replied: variantMetrics.replied,
    bounced: variantMetrics.bounced,
    accepted: variantMetrics.accepted,
    rejected: variantMetrics.rejected
  }).from(messageVariants2).leftJoin(variantMetrics, eq3(messageVariants2.id, variantMetrics.variantId)).where(gte2(variantMetrics.sent, minSampleSize));
  const patterns = [];
  for (const variant of variants) {
    if (!variant.sent || variant.sent === 0) continue;
    const successScore = ((variant.replied || 0) + (variant.accepted || 0) * 2) / variant.sent;
    const failureScore = ((variant.rejected || 0) + (variant.bounced || 0)) / variant.sent;
    const finalScore = successScore - failureScore;
    if (finalScore >= minSuccessRate) {
      const detectedPatterns = extractPatterns(variant.messageTemplate || "");
      for (const pattern of detectedPatterns) {
        patterns.push({
          pattern,
          description: `Pattern d\xE9tect\xE9 dans message performant (${variant.canal})`,
          successRate: parseFloat((finalScore * 100).toFixed(2)),
          sampleSize: variant.sent,
          canal: variant.canal
        });
      }
    }
  }
  console.log(`[Learning Loop] ${patterns.length} patterns d\xE9tect\xE9s`);
  return patterns;
}
function extractPatterns(template) {
  const patterns = [];
  if (/\?/.test(template)) {
    patterns.push("utilise_questions_ouvertes");
  }
  const hasPersonalization = /\{\{(prenom|nom|entreprise|secteur)\}\}/i.test(template);
  if (hasPersonalization) {
    patterns.push("personnalisation_forte");
  }
  if (/rendez-vous|appel|discuter|échanger|présentation/i.test(template)) {
    patterns.push("cta_direct");
  }
  if (/secteur|industrie|métier|domaine/i.test(template)) {
    patterns.push("contextualisation_sectorielle");
  }
  if (/\d+%|\d+ fois|économie|réduction|augmentation/i.test(template)) {
    patterns.push("benefices_chiffres");
  }
  if (/clients|entreprises comme|références|cas client/i.test(template)) {
    patterns.push("social_proof");
  }
  if (/limité|exclusif|dernière|opportunité|avant/i.test(template)) {
    patterns.push("urgence_scarcite");
  }
  return patterns;
}
async function generateInsightsWithAI(patterns) {
  console.log(`[Learning Loop] G\xE9n\xE9ration d'insights IA pour ${patterns.length} patterns`);
  if (patterns.length === 0) {
    console.log("[Learning Loop] Aucun pattern \xE0 analyser");
    return [];
  }
  const patternGroups = groupPatternsByType(patterns);
  const prompt = `Tu es un expert en analyse de donn\xE9es de prospection commerciale B2B.

Analyse les patterns suivants d\xE9tect\xE9s dans nos messages de prospection LinkedIn/Email performants :

${JSON.stringify(patternGroups, null, 2)}

Pour chaque type de pattern, g\xE9n\xE8re un insight actionnable :

1. **Type** : Cat\xE9gorie du pattern (ex: "message_pattern", "objection_response", "sector_insight")
2. **Pattern** : Description concise du pattern d\xE9tect\xE9
3. **Description** : Explication d\xE9taill\xE9e de pourquoi ce pattern fonctionne
4. **Recommandations** : Comment appliquer ce pattern dans nos futurs prompts IA

Format de r\xE9ponse JSON :
{
  "insights": [
    {
      "type": "message_pattern",
      "pattern": "...",
      "description": "...",
      "recommendations": "..."
    }
  ]
}

R\xE9ponds UNIQUEMENT en JSON valide.`;
  try {
    const response = await anthropic2.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2e3,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });
    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("R\xE9ponse IA invalide");
    }
    const aiResponse = JSON.parse(content.text);
    const insights = [];
    for (const insight of aiResponse.insights) {
      const relatedPatterns = patterns.filter(
        (p) => p.pattern.includes(insight.pattern.toLowerCase().replace(/\s+/g, "_"))
      );
      const avgSuccessRate = relatedPatterns.length > 0 ? relatedPatterns.reduce((sum3, p) => sum3 + p.successRate, 0) / relatedPatterns.length : 0;
      const totalSamples = relatedPatterns.reduce((sum3, p) => sum3 + p.sampleSize, 0);
      insights.push({
        type: insight.type,
        pattern: insight.pattern,
        description: insight.description + "\n\n" + insight.recommendations,
        successRate: avgSuccessRate.toString(),
        sampleSize: totalSamples,
        validated: "false",
        appliedToPrompts: "false",
        detectedAt: /* @__PURE__ */ new Date(),
        validatedAt: null,
        metadata: {
          aiGenerated: true,
          recommendations: insight.recommendations
        }
      });
    }
    console.log(`[Learning Loop] ${insights.length} insights g\xE9n\xE9r\xE9s par IA`);
    return insights;
  } catch (error) {
    console.error("[Learning Loop] Erreur g\xE9n\xE9ration insights IA:", error);
    return [];
  }
}
function groupPatternsByType(patterns) {
  const groups = {};
  for (const pattern of patterns) {
    const key = pattern.pattern;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(pattern);
  }
  return groups;
}
async function saveInsights(insights) {
  console.log(`[Learning Loop] Sauvegarde de ${insights.length} insights en BDD`);
  if (insights.length === 0) return;
  try {
    for (const insight of insights) {
      await db.insert(learningInsights).values({
        type: insight.type,
        pattern: insight.pattern,
        description: insight.description || null,
        successRate: insight.successRate,
        sampleSize: insight.sampleSize,
        sector: insight.sector || null,
        discProfile: insight.discProfile || null,
        canal: insight.canal || null,
        validated: insight.validated || "false",
        appliedToPrompts: insight.appliedToPrompts || "false",
        metadata: insight.metadata || {}
      });
    }
    console.log(`[Learning Loop] \u2705 ${insights.length} insights sauvegard\xE9s`);
  } catch (error) {
    console.error("[Learning Loop] Erreur sauvegarde insights:", error);
    throw error;
  }
}
async function recommendPromptImprovements() {
  console.log("[Learning Loop] G\xE9n\xE9ration de recommandations de prompts");
  const validatedInsights = await db.select().from(learningInsights).where(
    and2(
      eq3(learningInsights.validated, "true"),
      eq3(learningInsights.appliedToPrompts, "false")
    )
  ).orderBy(desc2(learningInsights.successRate)).limit(10);
  if (validatedInsights.length === 0) {
    console.log("[Learning Loop] Aucun insight valid\xE9 \xE0 appliquer");
    return [];
  }
  const activePrompt = await db.select().from(promptVersions).where(
    and2(
      eq3(promptVersions.promptType, "message_generation"),
      eq3(promptVersions.isActive, "true")
    )
  ).limit(1);
  const currentPrompt = activePrompt[0]?.content || getDefaultMessagePrompt();
  const analysisPrompt = `Tu es un expert en optimisation de prompts IA pour la g\xE9n\xE9ration de messages de prospection B2B.

Voici le prompt actuel utilis\xE9 pour g\xE9n\xE9rer des messages :

\`\`\`
${currentPrompt}
\`\`\`

Voici les insights d\xE9tect\xE9s dans nos donn\xE9es de prospection (valid\xE9s par un humain) :

${JSON.stringify(validatedInsights.map((i) => ({
    type: i.type,
    pattern: i.pattern,
    description: i.description,
    successRate: i.successRate,
    sampleSize: i.sampleSize
  })), null, 2)}

Am\xE9liore le prompt en int\xE9grant ces insights pour :
1. Augmenter le taux de r\xE9ponse
2. Personnaliser davantage les messages
3. Utiliser les patterns qui fonctionnent

R\xE9ponds en JSON :
{
  "improvedPrompt": "...",
  "reasoning": "Explication des changements",
  "appliedInsights": ["id1", "id2", ...]
}

R\xE9ponds UNIQUEMENT en JSON valide.`;
  try {
    const response = await anthropic2.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 3e3,
      messages: [
        {
          role: "user",
          content: analysisPrompt
        }
      ]
    });
    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("R\xE9ponse IA invalide");
    }
    const aiResponse = JSON.parse(content.text);
    console.log("[Learning Loop] \u2705 Recommandation de prompt g\xE9n\xE9r\xE9e");
    return [
      {
        promptType: "message_generation",
        currentContent: currentPrompt,
        improvedContent: aiResponse.improvedPrompt,
        reasoning: aiResponse.reasoning,
        basedOnInsights: validatedInsights.map((i) => i.id)
      }
    ];
  } catch (error) {
    console.error("[Learning Loop] Erreur g\xE9n\xE9ration recommandations:", error);
    return [];
  }
}
async function applyPromptImprovement(improvement) {
  console.log(`[Learning Loop] Application am\xE9lioration prompt ${improvement.promptType}`);
  await db.update(promptVersions).set({
    isActive: "false",
    deactivatedAt: /* @__PURE__ */ new Date()
  }).where(
    and2(
      eq3(promptVersions.promptType, improvement.promptType),
      eq3(promptVersions.isActive, "true")
    )
  );
  const lastVersion = await db.select({ version: promptVersions.version }).from(promptVersions).where(eq3(promptVersions.promptType, improvement.promptType)).orderBy(desc2(promptVersions.version)).limit(1);
  const nextVersion = (lastVersion[0]?.version || 0) + 1;
  const [newVersion] = await db.insert(promptVersions).values({
    promptType: improvement.promptType,
    version: nextVersion,
    content: improvement.improvedContent,
    usageCount: 0,
    basedOnInsights: improvement.basedOnInsights,
    isActive: "true",
    activatedAt: /* @__PURE__ */ new Date()
  }).returning();
  for (const insightId of improvement.basedOnInsights) {
    await db.update(learningInsights).set({ appliedToPrompts: "true" }).where(eq3(learningInsights.id, insightId));
  }
  console.log(`[Learning Loop] \u2705 Nouvelle version de prompt cr\xE9\xE9e : v${nextVersion}`);
  return newVersion;
}
function getDefaultMessagePrompt() {
  return `Tu es un expert en prospection commerciale B2B pour ADS GROUP.

G\xE9n\xE8re un message de prospection personnalis\xE9 en tenant compte :
- Du profil DISC du prospect
- De son secteur d'activit\xE9
- Du canal de communication (LinkedIn, Email, SMS)
- De l'\xE9tape de la s\xE9quence

Le message doit :
- \xCAtre concis et impactant
- Personnaliser avec les variables disponibles
- Inclure un CTA clair
- Respecter le ton ADS GROUP (professionnel, tutoiement)

Variables disponibles :
{{prenom}}, {{nom}}, {{entreprise}}, {{secteur}}, {{poste}}`;
}
async function runLearningLoop() {
  console.log("=== D\xC9MARRAGE LEARNING LOOP ===");
  try {
    const patterns = await analyzeMessagePatterns(10, 0.2);
    const insights = await generateInsightsWithAI(patterns);
    await saveInsights(insights);
    console.log("=== LEARNING LOOP TERMIN\xC9 ===");
    return {
      patternsDetected: patterns.length,
      insightsGenerated: insights.length,
      insightsSaved: insights.length
    };
  } catch (error) {
    console.error("=== ERREUR LEARNING LOOP ===", error);
    throw error;
  }
}

// server/routes/learning.ts
var learningRouter = Router();
learningRouter.get("/insights", async (req, res) => {
  try {
    const { validated, limit = "50" } = req.query;
    let query = db.select().from(learningInsights);
    if (validated !== void 0) {
      query = query.where(eq4(learningInsights.validated, validated === "true" ? "true" : "false"));
    }
    const insights = await query.orderBy(desc3(learningInsights.detectedAt)).limit(parseInt(limit));
    res.json(insights);
  } catch (error) {
    console.error("[API Learning] Error fetching insights:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
learningRouter.get("/insights/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const insight = await db.select().from(learningInsights).where(eq4(learningInsights.id, id)).limit(1);
    if (insight.length === 0) {
      return res.status(404).json({ error: "Insight non trouv\xE9" });
    }
    res.json(insight[0]);
  } catch (error) {
    console.error("[API Learning] Error fetching insight:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
learningRouter.post("/insights/:id/validate", async (req, res) => {
  try {
    const { id } = req.params;
    const { validated } = req.body;
    if (typeof validated !== "boolean") {
      return res.status(400).json({ error: 'Le champ "validated" doit \xEAtre un bool\xE9en' });
    }
    const [updated] = await db.update(learningInsights).set({
      validated: validated ? "true" : "false",
      validatedAt: validated ? /* @__PURE__ */ new Date() : null
    }).where(eq4(learningInsights.id, id)).returning();
    if (!updated) {
      return res.status(404).json({ error: "Insight non trouv\xE9" });
    }
    res.json(updated);
  } catch (error) {
    console.error("[API Learning] Error validating insight:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
learningRouter.get("/prompts", async (req, res) => {
  try {
    const { promptType, active, limit = "20" } = req.query;
    let query = db.select().from(promptVersions);
    const conditions = [];
    if (promptType) {
      conditions.push(eq4(promptVersions.promptType, promptType));
    }
    if (active !== void 0) {
      conditions.push(eq4(promptVersions.isActive, active === "true" ? "true" : "false"));
    }
    if (conditions.length > 0) {
      query = query.where(and3(...conditions));
    }
    const prompts = await query.orderBy(desc3(promptVersions.createdAt)).limit(parseInt(limit));
    res.json(prompts);
  } catch (error) {
    console.error("[API Learning] Error fetching prompts:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
learningRouter.get("/prompts/active/:promptType", async (req, res) => {
  try {
    const { promptType } = req.params;
    const prompt = await db.select().from(promptVersions).where(
      and3(
        eq4(promptVersions.promptType, promptType),
        eq4(promptVersions.isActive, "true")
      )
    ).limit(1);
    if (prompt.length === 0) {
      return res.status(404).json({ error: "Aucun prompt actif trouv\xE9 pour ce type" });
    }
    res.json(prompt[0]);
  } catch (error) {
    console.error("[API Learning] Error fetching active prompt:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
learningRouter.post("/run", async (req, res) => {
  try {
    console.log("[API Learning] Ex\xE9cution manuelle du learning loop");
    const results = await runLearningLoop();
    res.json({
      success: true,
      message: "Learning loop ex\xE9cut\xE9 avec succ\xE8s",
      results
    });
  } catch (error) {
    console.error("[API Learning] Error running learning loop:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de l'ex\xE9cution du learning loop",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
learningRouter.post("/run-async", async (req, res) => {
  try {
    console.log("[API Learning] Lancement du learning loop en arri\xE8re-plan");
    const jobId = await prospectionQueue.addJob("learning-loop", {
      triggeredBy: "manual",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
    res.json({
      success: true,
      message: "Learning loop lanc\xE9 en arri\xE8re-plan",
      jobId
    });
  } catch (error) {
    console.error("[API Learning] Error queuing learning loop:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors du lancement du learning loop"
    });
  }
});
learningRouter.get("/recommendations", async (req, res) => {
  try {
    console.log("[API Learning] G\xE9n\xE9ration de recommandations de prompts");
    const recommendations = await recommendPromptImprovements();
    res.json({
      success: true,
      count: recommendations.length,
      recommendations
    });
  } catch (error) {
    console.error("[API Learning] Error generating recommendations:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la g\xE9n\xE9ration de recommandations"
    });
  }
});
learningRouter.post("/apply", async (req, res) => {
  try {
    const { promptType, improvedContent, reasoning, basedOnInsights } = req.body;
    if (!promptType || !improvedContent) {
      return res.status(400).json({
        error: "Les champs promptType et improvedContent sont requis"
      });
    }
    console.log(`[API Learning] Application d'une am\xE9lioration de prompt : ${promptType}`);
    const improvement = {
      promptType,
      currentContent: "",
      // Will be fetched internally
      improvedContent,
      reasoning: reasoning || "Manuel",
      basedOnInsights: basedOnInsights || []
    };
    const newVersion = await applyPromptImprovement(improvement);
    res.json({
      success: true,
      message: "Am\xE9lioration appliqu\xE9e avec succ\xE8s",
      version: newVersion
    });
  } catch (error) {
    console.error("[API Learning] Error applying improvement:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de l'application de l'am\xE9lioration"
    });
  }
});
learningRouter.get("/stats", async (req, res) => {
  try {
    const [totalInsights] = await db.select({ count: count2() }).from(learningInsights);
    const [validatedInsights] = await db.select({ count: count2() }).from(learningInsights).where(eq4(learningInsights.validated, "true"));
    const [appliedInsights] = await db.select({ count: count2() }).from(learningInsights).where(eq4(learningInsights.appliedToPrompts, "true"));
    const [totalPrompts] = await db.select({ count: count2() }).from(promptVersions);
    const [activePrompts] = await db.select({ count: count2() }).from(promptVersions).where(eq4(promptVersions.isActive, "true"));
    res.json({
      insights: {
        total: Number(totalInsights?.count) || 0,
        validated: Number(validatedInsights?.count) || 0,
        applied: Number(appliedInsights?.count) || 0,
        pending: (Number(totalInsights?.count) || 0) - (Number(validatedInsights?.count) || 0)
      },
      prompts: {
        total: Number(totalPrompts?.count) || 0,
        active: Number(activePrompts?.count) || 0
      }
    });
  } catch (error) {
    console.error("[API Learning] Error fetching stats:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// server/routes/advanced.ts
init_canal_scoring();
import { Router as Router2 } from "express";

// server/services/ai/optimal-timing.ts
init_db();
init_schema();
import { eq as eq6, and as and5, inArray as inArray3, gte as gte4 } from "drizzle-orm";
var DAY_NAMES = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi"
];
async function analyzeTimingPatterns(userId, canal, lookbackDays = 60) {
  const lookbackDate = /* @__PURE__ */ new Date();
  lookbackDate.setDate(lookbackDate.getDate() - lookbackDays);
  const userCampaigns = await db.select({ id: campagnesProspection.id }).from(campagnesProspection).where(eq6(campagnesProspection.userId, userId));
  if (userCampaigns.length === 0) {
    return [];
  }
  const campaignIds = userCampaigns.map((c) => c.id);
  const prospectsInCampaigns = await db.select({ id: prospectsEnProspection.id }).from(prospectsEnProspection).where(inArray3(prospectsEnProspection.campagneId, campaignIds));
  if (prospectsInCampaigns.length === 0) {
    return [];
  }
  const prospectEnProspectionIds = prospectsInCampaigns.map((p) => p.id);
  const sentInteractions = await db.select().from(interactionsProspection).where(
    and5(
      inArray3(interactionsProspection.prospectEnProspectionId, prospectEnProspectionIds),
      eq6(interactionsProspection.canal, canal),
      eq6(interactionsProspection.typeInteraction, "sent"),
      gte4(interactionsProspection.createdAt, lookbackDate)
    )
  );
  const replyInteractions = await db.select().from(interactionsProspection).where(
    and5(
      inArray3(interactionsProspection.prospectEnProspectionId, prospectEnProspectionIds),
      eq6(interactionsProspection.canal, canal),
      inArray3(interactionsProspection.typeInteraction, ["replied", "accepted"]),
      gte4(interactionsProspection.createdAt, lookbackDate)
    )
  );
  const patterns = /* @__PURE__ */ new Map();
  for (const sent of sentInteractions) {
    const sentDate = new Date(sent.createdAt);
    const dayOfWeek = sentDate.getDay();
    const hour = sentDate.getHours();
    const key = `${dayOfWeek}-${hour}`;
    if (!patterns.has(key)) {
      patterns.set(key, {
        dayOfWeek,
        dayName: DAY_NAMES[dayOfWeek],
        hour,
        hourRange: `${hour.toString().padStart(2, "0")}:00-${(hour + 1).toString().padStart(2, "0")}:00`,
        totalSent: 0,
        totalReplies: 0,
        replyRate: 0,
        avgResponseTimeHours: 0,
        score: 0
      });
    }
    const pattern = patterns.get(key);
    pattern.totalSent++;
    const reply = replyInteractions.find(
      (r) => r.prospectEnProspectionId === sent.prospectEnProspectionId && r.createdAt > sent.createdAt
    );
    if (reply) {
      pattern.totalReplies++;
      const responseTime = (new Date(reply.createdAt).getTime() - sentDate.getTime()) / (1e3 * 60 * 60);
      pattern.avgResponseTimeHours = (pattern.avgResponseTimeHours * (pattern.totalReplies - 1) + responseTime) / pattern.totalReplies;
    }
  }
  const results = [];
  for (const pattern of Array.from(patterns.values())) {
    if (pattern.totalSent > 0) {
      pattern.replyRate = pattern.totalReplies / pattern.totalSent * 100;
      const replyScore = pattern.replyRate * 0.7;
      const speedScore = pattern.avgResponseTimeHours > 0 ? Math.max(0, 30 - pattern.avgResponseTimeHours / 24 * 10) : 0;
      pattern.score = Math.min(100, replyScore + speedScore);
    }
    results.push(pattern);
  }
  return results.sort((a, b) => b.score - a.score);
}
async function getOptimalTiming(userId, canal) {
  const patterns = await analyzeTimingPatterns(userId, canal);
  if (patterns.length === 0) {
    return getBestPracticesTiming(canal);
  }
  const dayScores = /* @__PURE__ */ new Map();
  for (const pattern of patterns) {
    if (!dayScores.has(pattern.dayOfWeek)) {
      dayScores.set(pattern.dayOfWeek, { totalScore: 0, count: 0 });
    }
    const day = dayScores.get(pattern.dayOfWeek);
    day.totalScore += pattern.score;
    day.count++;
  }
  const bestDays = Array.from(dayScores.entries()).map(([dayOfWeek, { totalScore, count: count4 }]) => ({
    dayOfWeek,
    dayName: DAY_NAMES[dayOfWeek],
    replyRate: patterns.filter((p) => p.dayOfWeek === dayOfWeek).reduce((sum3, p) => sum3 + p.replyRate, 0) / patterns.filter((p) => p.dayOfWeek === dayOfWeek).length,
    score: totalScore / count4
  })).sort((a, b) => b.score - a.score).slice(0, 3);
  const hourScores = /* @__PURE__ */ new Map();
  for (const pattern of patterns) {
    if (!hourScores.has(pattern.hour)) {
      hourScores.set(pattern.hour, { totalScore: 0, count: 0 });
    }
    const hour = hourScores.get(pattern.hour);
    hour.totalScore += pattern.score;
    hour.count++;
  }
  const bestHours = Array.from(hourScores.entries()).map(([hour, { totalScore, count: count4 }]) => ({
    hour,
    hourRange: `${hour.toString().padStart(2, "0")}:00-${(hour + 1).toString().padStart(2, "0")}:00`,
    replyRate: patterns.filter((p) => p.hour === hour).reduce((sum3, p) => sum3 + p.replyRate, 0) / patterns.filter((p) => p.hour === hour).length,
    score: totalScore / count4
  })).sort((a, b) => b.score - a.score).slice(0, 3);
  const totalSent = patterns.reduce((sum3, p) => sum3 + p.totalSent, 0);
  const confidence = Math.min(100, totalSent / 100 * 100);
  const nextOptimalTime = calculateNextOptimalTime(bestDays[0]?.dayOfWeek, bestHours[0]?.hour);
  return {
    canal,
    bestDays,
    bestHours,
    reasoning: `Bas\xE9 sur ${totalSent} envois. Meilleur taux de r\xE9ponse : ${bestDays[0]?.replyRate.toFixed(1)}% le ${bestDays[0]?.dayName} entre ${bestHours[0]?.hourRange}.`,
    confidence,
    nextOptimalTime
  };
}
function getBestPracticesTiming(canal) {
  let bestDays;
  let bestHours;
  if (canal === "email" || canal === "linkedin_message") {
    bestDays = [
      { dayOfWeek: 2, dayName: "Mardi", replyRate: 35, score: 85 },
      { dayOfWeek: 3, dayName: "Mercredi", replyRate: 33, score: 82 },
      { dayOfWeek: 4, dayName: "Jeudi", replyRate: 32, score: 80 }
    ];
    bestHours = [
      { hour: 9, hourRange: "09:00-10:00", replyRate: 38, score: 90 },
      { hour: 10, hourRange: "10:00-11:00", replyRate: 36, score: 88 },
      { hour: 14, hourRange: "14:00-15:00", replyRate: 34, score: 85 }
    ];
  } else if (canal === "linkedin_invitation") {
    bestDays = [
      { dayOfWeek: 1, dayName: "Lundi", replyRate: 28, score: 75 },
      { dayOfWeek: 2, dayName: "Mardi", replyRate: 30, score: 78 },
      { dayOfWeek: 3, dayName: "Mercredi", replyRate: 29, score: 76 }
    ];
    bestHours = [
      { hour: 8, hourRange: "08:00-09:00", replyRate: 32, score: 82 },
      { hour: 9, hourRange: "09:00-10:00", replyRate: 30, score: 80 },
      { hour: 17, hourRange: "17:00-18:00", replyRate: 28, score: 75 }
    ];
  } else {
    bestDays = [
      { dayOfWeek: 2, dayName: "Mardi", replyRate: 25, score: 70 },
      { dayOfWeek: 3, dayName: "Mercredi", replyRate: 26, score: 72 },
      { dayOfWeek: 4, dayName: "Jeudi", replyRate: 24, score: 68 }
    ];
    bestHours = [
      { hour: 10, hourRange: "10:00-11:00", replyRate: 28, score: 75 },
      { hour: 11, hourRange: "11:00-12:00", replyRate: 26, score: 72 },
      { hour: 15, hourRange: "15:00-16:00", replyRate: 25, score: 70 }
    ];
  }
  const nextOptimalTime = calculateNextOptimalTime(bestDays[0].dayOfWeek, bestHours[0].hour);
  return {
    canal,
    bestDays,
    bestHours,
    reasoning: "Best practices B2B (aucune donn\xE9e historique disponible)",
    confidence: 0,
    nextOptimalTime
  };
}
function calculateNextOptimalTime(targetDay, targetHour) {
  if (targetDay === void 0 || targetHour === void 0) {
    return null;
  }
  const now = /* @__PURE__ */ new Date();
  const result = new Date(now);
  const currentDay = now.getDay();
  let daysUntilTarget = targetDay - currentDay;
  if (daysUntilTarget < 0) {
    daysUntilTarget += 7;
  } else if (daysUntilTarget === 0) {
    if (now.getHours() >= targetHour) {
      daysUntilTarget = 7;
    }
  }
  result.setDate(now.getDate() + daysUntilTarget);
  result.setHours(targetHour, 0, 0, 0);
  return result;
}
async function getNextOptimalSendTime(userId, canal) {
  const timing = await getOptimalTiming(userId, canal);
  return timing.nextOptimalTime;
}

// server/routes/advanced.ts
var router4 = Router2();
router4.get("/canal-scores", async (req, res) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Non autoris\xE9" });
    }
    const lookbackDays = parseInt(req.query.lookbackDays) || 30;
    const scores = await calculateCanalScores(req.session.userId, lookbackDays);
    res.json({
      success: true,
      scores,
      lookbackDays
    });
  } catch (error) {
    console.error("Erreur r\xE9cup\xE9ration canal scores:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Erreur lors de la r\xE9cup\xE9ration des scores"
    });
  }
});
router4.get("/canal-recommendation/:prospectId", async (req, res) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Non autoris\xE9" });
    }
    const { prospectId } = req.params;
    const recommendation = await recommendCanalForProspect(
      req.session.userId,
      prospectId
    );
    res.json({
      success: true,
      recommendation
    });
  } catch (error) {
    console.error("Erreur recommandation canal:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Erreur lors de la recommandation"
    });
  }
});
router4.get("/fallback-check/:prospectId", async (req, res) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Non autoris\xE9" });
    }
    const { prospectId } = req.params;
    const fallbackCheck = await checkFallbackTrigger(
      req.session.userId,
      prospectId
    );
    res.json({
      success: true,
      ...fallbackCheck
    });
  } catch (error) {
    console.error("Erreur v\xE9rification fallback:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Erreur lors de la v\xE9rification fallback"
    });
  }
});
router4.post("/execute-fallback", async (req, res) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Non autoris\xE9" });
    }
    const results = await executeFallbackForUser(req.session.userId);
    res.json({
      success: true,
      ...results
    });
  } catch (error) {
    console.error("Erreur ex\xE9cution fallback:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Erreur lors de l'ex\xE9cution du fallback"
    });
  }
});
router4.get("/optimal-timing/:canal", async (req, res) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Non autoris\xE9" });
    }
    const { canal } = req.params;
    const validCanals = ["email", "linkedin_message", "linkedin_invitation", "sms"];
    if (!validCanals.includes(canal)) {
      return res.status(400).json({
        success: false,
        message: "Canal invalide"
      });
    }
    const timing = await getOptimalTiming(req.session.userId, canal);
    res.json({
      success: true,
      timing
    });
  } catch (error) {
    console.error("Erreur r\xE9cup\xE9ration timing optimal:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Erreur lors de la r\xE9cup\xE9ration du timing"
    });
  }
});
router4.get("/next-send-time/:canal", async (req, res) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Non autoris\xE9" });
    }
    const { canal } = req.params;
    const validCanals = ["email", "linkedin_message", "linkedin_invitation", "sms"];
    if (!validCanals.includes(canal)) {
      return res.status(400).json({
        success: false,
        message: "Canal invalide"
      });
    }
    const nextTime = await getNextOptimalSendTime(req.session.userId, canal);
    res.json({
      success: true,
      ...nextTime
    });
  } catch (error) {
    console.error("Erreur calcul prochaine heure:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Erreur lors du calcul de la prochaine heure"
    });
  }
});
router4.get("/timing-stats/:canal", async (req, res) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Non autoris\xE9" });
    }
    const { canal } = req.params;
    const validCanals = ["email", "linkedin_message", "linkedin_invitation", "sms"];
    if (!validCanals.includes(canal)) {
      return res.status(400).json({
        success: false,
        message: "Canal invalide"
      });
    }
    const lookbackDays = parseInt(req.query.lookbackDays) || 30;
    const stats = await analyzeTimingPatterns(
      req.session.userId,
      canal,
      lookbackDays
    );
    res.json({
      success: true,
      stats,
      canal,
      lookbackDays
    });
  } catch (error) {
    console.error("Erreur r\xE9cup\xE9ration timing stats:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Erreur lors de la r\xE9cup\xE9ration des stats"
    });
  }
});
var advanced_default = router4;

// server/routes/phone.ts
init_db();
init_schema();
init_twilio_service();
import express4 from "express";
import { eq as eq9, and as and6, desc as desc4, sql as sql14, gte as gte5 } from "drizzle-orm";

// server/services/phone/claude-service.ts
init_db();
init_schema();
import Anthropic3 from "@anthropic-ai/sdk";
import { eq as eq8 } from "drizzle-orm";
var anthropic3 = new Anthropic3({
  apiKey: process.env.ANTHROPIC_API_KEY
});
var MODEL = "claude-sonnet-4-20250514";
var ClaudeService = class {
  /**
   * Génère un script d'appel personnalisé avec Claude IA
   * @param params - Paramètres de génération
   * @returns Script formaté prêt à l'emploi
   */
  async generatePhoneScript(params) {
    const prompt = `Tu es un expert en prospection commerciale B2B pour ADS GROUP Security.

G\xE9n\xE8re un script d'appel t\xE9l\xE9phonique personnalis\xE9 et professionnel avec les informations suivantes :

**PROSPECT :**
- Nom : ${params.prospectName}
- Entreprise : ${params.companyName}
- Secteur : ${params.sector}
- Profil DISC : ${params.discProfile || "Non d\xE9termin\xE9"}

**OBJECTIF DE L'APPEL :**
${params.callObjective}

**PAIN POINTS IDENTIFI\xC9S :**
${params.painPoints.length > 0 ? params.painPoints.map((p, i) => `${i + 1}. ${p}`).join("\n") : "Aucun pain point connu - d\xE9couverte n\xE9cessaire"}

${params.companyContext ? `**CONTEXTE ENTREPRISE :**
- CA : ${params.companyContext.ca || "NC"}
- Effectifs : ${params.companyContext.effectifs || "NC"}
- Secteur d\xE9tail : ${params.companyContext.secteurDetail || "NC"}` : ""}

**FORMAT ATTENDU (structure obligatoire) :**

## 1. ACCROCHE (10-15 secondes)
- Phrase d'ouverture percutante
- Captation imm\xE9diate de l'attention

## 2. IDENTIFICATION (5 secondes)
"Bonjour [Pr\xE9nom], je suis [Nom] de chez ADS GROUP Security."

## 3. RAISON DE L'APPEL (20 secondes)
- Pourquoi j'appelle aujourd'hui
- Valeur apport\xE9e imm\xE9diate
- Lien avec son secteur

## 4. QUESTIONS DE D\xC9COUVERTE (3-4 questions)
Questions ouvertes adapt\xE9es au profil DISC pour :
- Identifier besoins r\xE9els
- Comprendre organisation actuelle
- D\xE9tecter opportunit\xE9s

## 5. PROPOSITION DE VALEUR (30 secondes)
- B\xE9n\xE9fices concrets ADS GROUP
- Diff\xE9renciation vs. concurrence
- ROI mesurable si possible

## 6. CLOSING (Prise de RDV)
- Proposition claire de rendez-vous
- 2 cr\xE9neaux concrets
- Alternative si refus

## 7. GESTION OBJECTIONS
Liste 3 objections probables + r\xE9ponses adapt\xE9es

**CONTRAINTES IMP\xC9RATIVES :**
- Ton adapt\xE9 au profil DISC (Direct pour D, Enthousiaste pour I, Rassurant pour S, Factuel pour C)
- Vocabulaire professionnel B2B s\xE9curit\xE9
- Dur\xE9e totale script : 3-5 minutes
- Phrases courtes et impactantes
- Tutoiement "tu" si prospect <40 ans, "vous" si >40 ans (adapter selon contexte)
- Mentionner ADN HECTOR si pertinent (m\xE9thode commerciale ADS GROUP)

**LIVRABLES :**
Un script structur\xE9, actionnable, pr\xEAt \xE0 \xEAtre utilis\xE9 en appel r\xE9el.`;
    try {
      const message = await anthropic3.messages.create({
        model: MODEL,
        max_tokens: 2500,
        temperature: 0.7,
        // Créativité modérée
        messages: [{ role: "user", content: prompt }]
      });
      const scriptContent = message.content[0].type === "text" ? message.content[0].text : "";
      if (!scriptContent || scriptContent.length < 200) {
        throw new Error("Script g\xE9n\xE9r\xE9 trop court ou vide");
      }
      console.log(`\u2705 Script g\xE9n\xE9r\xE9 pour ${params.prospectName} (${scriptContent.length} caract\xE8res)`);
      return scriptContent;
    } catch (error) {
      console.error("\u274C Erreur g\xE9n\xE9ration script Claude:", error);
      throw new Error(`\xC9chec g\xE9n\xE9ration script: ${error.message}`);
    }
  }
  /**
   * Analyse un enregistrement d'appel (transcription + sentiment + actions)
   * @param callId - ID appel dans BDD
   * @param recordingUrl - URL MP3 recording Twilio
   */
  async analyzeCallRecording(callId, recordingUrl) {
    try {
      console.log(`\u{1F399}\uFE0F Analyse appel ${callId} - T\xE9l\xE9chargement recording...`);
      const mockTranscription = `[Commercial] : Bonjour ${(/* @__PURE__ */ new Date()).toLocaleString("fr-FR")}, je suis de chez ADS GROUP Security.
[Prospect] : Oui bonjour.
[Commercial] : Je vous contacte car nous avons identifi\xE9 des opportunit\xE9s de renforcement de votre s\xE9curit\xE9.
[Prospect] : Int\xE9ressant, pouvez-vous m'en dire plus ?
[Commercial] : Bien s\xFBr. Nous proposons des solutions adapt\xE9es \xE0 votre secteur...
[Prospect] : D'accord, envoyez-moi une documentation.
[Commercial] : Parfait, je vous propose un rendez-vous la semaine prochaine pour approfondir ?
[Prospect] : Oui pourquoi pas, appelez-moi lundi.`;
      console.log(`\u{1F4DD} Transcription simul\xE9e g\xE9n\xE9r\xE9e (${mockTranscription.length} caract\xE8res)`);
      const analysisPrompt = `Tu es un expert en analyse de conversations commerciales B2B.

Analyse cette transcription d'appel commercial ADS GROUP Security et fournis une analyse structur\xE9e.

**TRANSCRIPTION :**
${mockTranscription}

**ANALYSE ATTENDUE (format JSON strict) :**

{
  "sentiment": "positive|neutral|negative",
  "sentimentScore": 0-100,
  "keyPoints": ["Point cl\xE9 1", "Point cl\xE9 2", "..."],
  "actionItems": ["Action 1", "Action 2", "..."],
  "summary": "R\xE9sum\xE9 ex\xE9cutif en 2-3 phrases max"
}

**CRIT\xC8RES SENTIMENT :**
- positive (60-100) : Prospect r\xE9ceptif, questions positives, ouverture RDV
- neutral (40-59) : Prospect poli mais r\xE9serv\xE9, besoin de relance
- negative (0-39) : Refus clair, objections non lev\xE9es, prospect ferm\xE9

**CRIT\xC8RES KEY POINTS :**
- Besoins exprim\xE9s par le prospect
- Objections soulev\xE9es
- Informations strat\xE9giques (budget, timing, d\xE9cideurs)
- Engagement pris

**CRIT\xC8RES ACTION ITEMS :**
- Actions concr\xE8tes \xE0 mener (envoyer doc, rappeler, RDV, etc.)
- Ordre de priorit\xE9 implicite

**IMPORTANT :** R\xE9ponds UNIQUEMENT avec le JSON, sans aucun texte avant ou apr\xE8s.`;
      const analysisMessage = await anthropic3.messages.create({
        model: MODEL,
        max_tokens: 1500,
        temperature: 0.3,
        // Précision maximale
        messages: [{ role: "user", content: analysisPrompt }]
      });
      const analysisText = analysisMessage.content[0].type === "text" ? analysisMessage.content[0].text : "{}";
      const cleanedJson = analysisText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const analysis = JSON.parse(cleanedJson);
      if (!analysis.sentiment || !analysis.summary) {
        throw new Error("Analyse Claude incompl\xE8te");
      }
      await db.update(phoneCalls).set({
        transcription: mockTranscription,
        sentiment: analysis.sentiment,
        sentimentScore: analysis.sentimentScore,
        keyPoints: analysis.keyPoints,
        actionItems: analysis.actionItems,
        summary: analysis.summary,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq8(phoneCalls.id, callId));
      console.log(`\u2705 Appel ${callId} analys\xE9 avec succ\xE8s - Sentiment: ${analysis.sentiment} (${analysis.sentimentScore}/100)`);
    } catch (error) {
      console.error(`\u274C Erreur analyse appel ${callId}:`, error);
      await db.update(phoneCalls).set({
        summary: `\xC9chec analyse IA: ${error.message}`,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq8(phoneCalls.id, callId));
      throw error;
    }
  }
  /**
   * Vérifie la santé du service Claude (test API Key)
   * @returns Status du service
   */
  async healthCheck() {
    try {
      const message = await anthropic3.messages.create({
        model: MODEL,
        max_tokens: 10,
        messages: [{ role: "user", content: 'R\xE9ponds juste "OK"' }]
      });
      const response = message.content[0].type === "text" ? message.content[0].text : "";
      if (response.includes("OK")) {
        return { success: true, message: "Service Claude IA op\xE9rationnel" };
      }
      return { success: false, message: "R\xE9ponse Claude inattendue" };
    } catch (error) {
      console.error("\u274C Health check Claude \xE9chou\xE9:", error);
      return {
        success: false,
        message: `Erreur Claude: ${error.message}`
      };
    }
  }
};
var claudeService = new ClaudeService();

// server/middleware/rate-limit-phone.ts
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
var phoneCallLimiter = rateLimit({
  windowMs: 60 * 60 * 1e3,
  // 1 heure
  max: 50,
  message: {
    success: false,
    error: "Trop d'appels initi\xE9s. Limite : 50 appels par heure.",
    limit: 50,
    window: "1 heure"
  },
  keyGenerator: (req, res) => {
    if (req.user?.id) return req.user.id;
    return ipKeyGenerator(req);
  },
  standardHeaders: true,
  // Inclure RateLimit-* headers
  legacyHeaders: false,
  // Désactiver X-RateLimit-* headers
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  handler: (req, res) => {
    console.warn(`\u26A0\uFE0F Rate limit appels d\xE9pass\xE9 pour user: ${req.user?.id || req.ip}`);
    res.status(429).json({
      success: false,
      error: "Trop d'appels initi\xE9s. Limite : 50 appels par heure.",
      retryAfter: res.getHeader("Retry-After")
    });
  }
});
var scriptGenerationLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1e3,
  // 24 heures
  max: 100,
  message: {
    success: false,
    error: "Limite de g\xE9n\xE9ration de scripts atteinte (100/jour).",
    limit: 100,
    window: "24 heures"
  },
  keyGenerator: (req, res) => {
    if (req.user?.id) return req.user.id;
    return ipKeyGenerator(req.ip || "unknown");
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  handler: (req, res) => {
    console.warn(`\u26A0\uFE0F Rate limit scripts IA d\xE9pass\xE9 pour user: ${req.user?.id || req.ip}`);
    res.status(429).json({
      success: false,
      error: "Limite de g\xE9n\xE9ration de scripts atteinte (100/jour).",
      retryAfter: res.getHeader("Retry-After")
    });
  }
});
var phoneReadLimiter = rateLimit({
  windowMs: 60 * 1e3,
  // 1 minute
  max: 200,
  message: {
    success: false,
    error: "Trop de requ\xEAtes. Limite : 200/minute."
  },
  keyGenerator: (req, res) => {
    if (req.user?.id) return req.user.id;
    return ipKeyGenerator(req.ip || "unknown");
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  // Ne compter que les erreurs
  handler: (req, res) => {
    console.warn(`\u26A0\uFE0F Rate limit lecture d\xE9pass\xE9 pour user: ${req.user?.id || req.ip}`);
    res.status(429).json({
      success: false,
      error: "Trop de requ\xEAtes. Attendez quelques secondes."
    });
  }
});
var twilioWebhookLimiter = rateLimit({
  windowMs: 60 * 1e3,
  // 1 minute
  max: 1e3,
  message: {
    success: false,
    error: "Trop de webhooks Twilio re\xE7us."
  },
  keyGenerator: (req, res) => {
    return ipKeyGenerator(req);
  },
  standardHeaders: false,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    console.error(`\u{1F6A8} Rate limit webhooks Twilio d\xE9pass\xE9: ${req.ip}`);
    res.status(429).json({
      success: false,
      error: "Webhook flood detected"
    });
  }
});

// server/middleware/twilio-error-handler.ts
var TWILIO_ERROR_MESSAGES = {
  // Auth & Account
  20003: "Authentification Twilio \xE9chou\xE9e - v\xE9rifier credentials",
  20404: "Ressource Twilio non trouv\xE9e",
  21215: "Compte Twilio suspendu ou inactif",
  21217: "Num\xE9ro de t\xE9l\xE9phone non v\xE9rifi\xE9",
  // Phone Numbers
  21211: "Num\xE9ro de t\xE9l\xE9phone invalide",
  21214: "Num\xE9ro appelant invalide ou non autoris\xE9",
  21216: "Num\xE9ro appel\xE9 invalide",
  21219: "Num\xE9ro appelant non v\xE9rifi\xE9",
  // Call Issues
  21608: "Num\xE9ro non joignable ou inexistant",
  21609: "Num\xE9ro de t\xE9l\xE9phone bloqu\xE9 par le destinataire",
  21610: "Num\xE9ro blacklist\xE9 par Twilio",
  // Network & Capacity
  30001: "File d'attente pleine - r\xE9essayer plus tard",
  30002: "Timeout r\xE9seau - connexion trop lente",
  30003: "Connexion Twilio impossible - v\xE9rifier r\xE9seau",
  30004: "Service Twilio temporairement indisponible",
  30005: "Num\xE9ro occup\xE9 - ligne en communication",
  30006: "Appel non r\xE9pondu par le destinataire",
  30007: "Connexion r\xE9seau instable",
  // Billing & Limits
  20429: "Limite d'appels atteinte - quota d\xE9pass\xE9",
  20500: "Erreur serveur Twilio - contacter support",
  21603: "Solde insuffisant sur compte Twilio",
  // Recording & Media
  52134: "Enregistrement audio impossible",
  52135: "Transcription audio \xE9chou\xE9e"
};
function twilioErrorHandler(error, req, res, next) {
  console.error("\u{1F534} Twilio Error:", {
    code: error.code,
    status: error.status,
    message: error.message,
    moreInfo: error.moreInfo,
    route: req.path,
    method: req.method,
    user: req.user?.id
  });
  if (!error.code && !error.status) {
    return next(error);
  }
  const twilioCode = error.code || error.status;
  const userMessage = TWILIO_ERROR_MESSAGES[twilioCode] || "Erreur syst\xE8me t\xE9l\xE9phonie";
  const httpStatus = error.status || (twilioCode >= 2e4 && twilioCode < 3e4 ? 400 : 500);
  res.status(httpStatus).json({
    success: false,
    error: userMessage,
    code: twilioCode,
    details: process.env.NODE_ENV === "development" ? {
      originalMessage: error.message,
      moreInfo: error.moreInfo
    } : void 0
  });
}
function wrapAsync(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// server/routes/phone.ts
import { z as z4 } from "zod";
var router5 = express4.Router();
var initiateCallSchema = z4.object({
  prospectId: z4.string().uuid("ID prospect invalide"),
  phoneNumber: z4.string().regex(/^\+\d{10,15}$/, "Format num\xE9ro invalide (+33...)"),
  callPurpose: z4.enum(["prospection", "suivi", "closing", "qualification"]).optional()
});
var generateScriptSchema = z4.object({
  prospectId: z4.string().uuid("ID prospect invalide"),
  callObjective: z4.string().min(10, "Objectif trop court (min 10 caract\xE8res)")
});
router5.post("/initiate", phoneCallLimiter, wrapAsync(async (req, res) => {
  const { prospectId, phoneNumber, callPurpose } = initiateCallSchema.parse(req.body);
  const userId = req.session.userId;
  const entity = req.session.entity || "france";
  if (!userId) {
    return res.status(401).json({ success: false, error: "Non authentifi\xE9" });
  }
  const consent = await db.query.phoneConsents.findFirst({
    where: and6(
      eq9(phoneConsents.prospectId, prospectId),
      eq9(phoneConsents.consentGiven, true),
      sql14`${phoneConsents.revokedAt} IS NULL`
    )
  });
  if (!consent) {
    return res.status(403).json({
      success: false,
      error: "Consentement RGPD manquant - enregistrement impossible"
    });
  }
  const features = await twilioService.getFeatures(entity);
  const script = await db.query.phoneScripts.findFirst({
    where: and6(
      eq9(phoneScripts.prospectId, prospectId),
      eq9(phoneScripts.userId, userId),
      sql14`${phoneScripts.usedInCallId} IS NULL`
    ),
    orderBy: [desc4(phoneScripts.createdAt)]
  });
  const appUrl = process.env.REPLIT_DOMAINS?.split(",")[0] || "https://hector-sales-ai-adsgroup.replit.app";
  const twilioCall = await twilioService.initiateCall(entity, {
    to: phoneNumber,
    from: await twilioService.getPhoneNumber(entity),
    statusCallback: `${appUrl}/api/phone/webhooks/status`,
    statusCallbackEvent: ["initiated", "ringing", "answered", "completed"],
    record: features.recordingEnabled,
    recordingStatusCallback: `${appUrl}/api/phone/webhooks/recording`
  });
  const [call] = await db.insert(phoneCalls).values({
    entity,
    twilioCallSid: twilioCall.sid,
    callerUserId: userId,
    prospectId,
    phoneNumber,
    startedAt: /* @__PURE__ */ new Date(),
    status: "initiated",
    direction: "outbound",
    callPurpose: callPurpose || "prospection"
  }).returning();
  if (script) {
    await db.update(phoneScripts).set({ usedInCallId: call.id }).where(eq9(phoneScripts.id, script.id));
  }
  console.log(`\u{1F4DE} Appel initi\xE9: ${call.id} \u2192 ${phoneNumber} (${entity})`);
  res.json({
    success: true,
    data: {
      callId: call.id,
      twilioCallSid: twilioCall.sid,
      status: call.status,
      script: script?.scriptContent,
      features: {
        recording: features.recordingEnabled,
        transcription: features.transcriptionEnabled,
        aiAnalysis: features.aiAnalysisEnabled
      }
    }
  });
}));
router5.post("/calls/:id/end", wrapAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({ success: false, error: "Non authentifi\xE9" });
  }
  const call = await db.query.phoneCalls.findFirst({
    where: and6(
      eq9(phoneCalls.id, id),
      eq9(phoneCalls.callerUserId, userId)
    )
  });
  if (!call) {
    return res.status(404).json({ success: false, error: "Appel non trouv\xE9" });
  }
  if (call.status === "completed" || call.status === "failed") {
    return res.status(400).json({
      success: false,
      error: `Appel d\xE9j\xE0 ${call.status === "completed" ? "termin\xE9" : "\xE9chou\xE9"}`
    });
  }
  await twilioService.endCall(call.entity, call.twilioCallSid);
  const [updatedCall] = await db.update(phoneCalls).set({
    status: "completed",
    endedAt: /* @__PURE__ */ new Date(),
    durationSeconds: call.answeredAt ? Math.floor((Date.now() - call.answeredAt.getTime()) / 1e3) : 0,
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq9(phoneCalls.id, id)).returning();
  console.log(`\u2705 Appel termin\xE9: ${id} (dur\xE9e: ${updatedCall.durationSeconds}s)`);
  res.json({ success: true, data: updatedCall });
}));
router5.get("/calls", phoneReadLimiter, wrapAsync(async (req, res) => {
  const userId = req.session.userId;
  const role = req.session.role || "business_developer";
  if (!userId) {
    return res.status(401).json({ success: false, error: "Non authentifi\xE9" });
  }
  const {
    page = "1",
    limit = "20",
    status,
    prospectId
  } = req.query;
  const offset = (Number(page) - 1) * Number(limit);
  const whereConditions = [];
  if (role !== "manager_france" && role !== "manager_luxembourg" && role !== "admin_groupe") {
    whereConditions.push(eq9(phoneCalls.callerUserId, userId));
  }
  if (status && typeof status === "string") {
    whereConditions.push(eq9(phoneCalls.status, status));
  }
  if (prospectId && typeof prospectId === "string") {
    whereConditions.push(eq9(phoneCalls.prospectId, prospectId));
  }
  const calls2 = await db.query.phoneCalls.findMany({
    where: whereConditions.length > 0 ? and6(...whereConditions) : void 0,
    orderBy: [desc4(phoneCalls.startedAt)],
    limit: Number(limit),
    offset,
    with: {
      caller: {
        columns: { id: true, firstName: true, lastName: true, email: true }
      },
      prospect: {
        columns: { id: true, nomEntreprise: true, secteurActivite: true, contactPrenom: true }
      }
    }
  });
  const [{ count: count4 }] = await db.select({ count: sql14`count(*)` }).from(phoneCalls).where(whereConditions.length > 0 ? and6(...whereConditions) : void 0);
  res.json({
    success: true,
    data: calls2,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: Number(count4),
      totalPages: Math.ceil(Number(count4) / Number(limit))
    }
  });
}));
router5.get("/calls/:id", phoneReadLimiter, wrapAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.session.userId;
  const role = req.session.role || "business_developer";
  if (!userId) {
    return res.status(401).json({ success: false, error: "Non authentifi\xE9" });
  }
  const call = await db.query.phoneCalls.findFirst({
    where: eq9(phoneCalls.id, id),
    with: {
      caller: {
        columns: { id: true, firstName: true, lastName: true, email: true, avatar: true }
      },
      prospect: true
    }
  });
  if (!call) {
    return res.status(404).json({ success: false, error: "Appel non trouv\xE9" });
  }
  const isManager = role === "manager_france" || role === "manager_luxembourg" || role === "admin_groupe";
  if (!isManager && call.callerUserId !== userId) {
    return res.status(403).json({ success: false, error: "Acc\xE8s refus\xE9" });
  }
  res.json({ success: true, data: call });
}));
router5.post("/scripts/generate", scriptGenerationLimiter, wrapAsync(async (req, res) => {
  const { prospectId, callObjective } = generateScriptSchema.parse(req.body);
  const userId = req.session.userId;
  const entity = req.session.entity || "france";
  if (!userId) {
    return res.status(401).json({ success: false, error: "Non authentifi\xE9" });
  }
  const prospect = await db.query.prospects.findFirst({
    where: eq9(prospects.id, prospectId)
  });
  if (!prospect) {
    return res.status(404).json({ success: false, error: "Prospect non trouv\xE9" });
  }
  const scriptContent = await claudeService.generatePhoneScript({
    prospectName: prospect.contactPrenom || "Madame/Monsieur",
    companyName: prospect.nomEntreprise,
    sector: prospect.secteurActivite,
    discProfile: prospect.discProfile || void 0,
    callObjective,
    painPoints: prospect.painPoints || [],
    companyContext: prospect.enrichmentData || void 0
  });
  const [script] = await db.insert(phoneScripts).values({
    entity,
    prospectId,
    userId,
    scriptContent,
    callObjective,
    discProfile: prospect.discProfile || null,
    companyContext: prospect.enrichmentData,
    painPoints: prospect.painPoints
  }).returning();
  console.log(`\u2705 Script IA g\xE9n\xE9r\xE9: ${script.id} pour prospect ${prospect.nomEntreprise}`);
  res.json({ success: true, data: script });
}));
router5.get("/scripts/:prospectId", phoneReadLimiter, wrapAsync(async (req, res) => {
  const { prospectId } = req.params;
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({ success: false, error: "Non authentifi\xE9" });
  }
  const script = await db.query.phoneScripts.findFirst({
    where: and6(
      eq9(phoneScripts.prospectId, prospectId),
      eq9(phoneScripts.userId, userId),
      sql14`${phoneScripts.usedInCallId} IS NULL`
    ),
    orderBy: [desc4(phoneScripts.createdAt)]
  });
  if (!script) {
    return res.status(404).json({
      success: false,
      error: "Aucun script disponible pour ce prospect"
    });
  }
  res.json({ success: true, data: script });
}));
router5.post("/webhooks/status", twilioWebhookLimiter, wrapAsync(async (req, res) => {
  const {
    CallSid,
    CallStatus,
    CallDuration,
    AnsweredBy
  } = req.body;
  console.log(`\u{1F4E1} Webhook status re\xE7u: ${CallSid} \u2192 ${CallStatus}`);
  const call = await db.query.phoneCalls.findFirst({
    where: eq9(phoneCalls.twilioCallSid, CallSid)
  });
  if (!call) {
    console.warn(`\u26A0\uFE0F Appel Twilio inconnu: ${CallSid}`);
    return res.status(200).send("OK");
  }
  const statusMap = {
    "initiated": "initiated",
    "ringing": "ringing",
    "in-progress": "answered",
    "answered": "answered",
    "completed": "completed",
    "busy": "failed",
    "failed": "failed",
    "no-answer": "failed",
    "canceled": "failed"
  };
  const mappedStatus = statusMap[CallStatus] || "failed";
  const updateData = {
    status: mappedStatus,
    updatedAt: /* @__PURE__ */ new Date()
  };
  if (CallStatus === "answered" || CallStatus === "in-progress") {
    updateData.answeredAt = /* @__PURE__ */ new Date();
  }
  if (CallStatus === "completed") {
    updateData.endedAt = /* @__PURE__ */ new Date();
    updateData.durationSeconds = parseInt(CallDuration) || 0;
  }
  await db.update(phoneCalls).set(updateData).where(eq9(phoneCalls.id, call.id));
  console.log(`\u2705 Appel ${call.id} mis \xE0 jour: ${mappedStatus}`);
  res.status(200).send("OK");
}));
router5.post("/webhooks/recording", twilioWebhookLimiter, wrapAsync(async (req, res) => {
  const {
    CallSid,
    RecordingUrl,
    RecordingDuration,
    RecordingSid
  } = req.body;
  console.log(`\u{1F399}\uFE0F Webhook recording re\xE7u: ${CallSid} \u2192 ${RecordingUrl}`);
  const call = await db.query.phoneCalls.findFirst({
    where: eq9(phoneCalls.twilioCallSid, CallSid)
  });
  if (!call) {
    console.warn(`\u26A0\uFE0F Appel Twilio inconnu: ${CallSid}`);
    return res.status(200).send("OK");
  }
  await db.update(phoneCalls).set({
    recordingUrl: RecordingUrl,
    recordingDurationSeconds: parseInt(RecordingDuration) || 0,
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq9(phoneCalls.id, call.id));
  console.log(`\u2705 Recording sauvegard\xE9 pour appel ${call.id}`);
  const features = await twilioService.getFeatures(call.entity);
  if (features.transcriptionEnabled || features.aiAnalysisEnabled) {
    claudeService.analyzeCallRecording(call.id, RecordingUrl).then(() => {
      console.log(`\u2705 Analyse IA termin\xE9e pour appel ${call.id}`);
    }).catch((error) => {
      console.error(`\u274C Erreur analyse IA appel ${call.id}:`, error);
    });
  }
  res.status(200).send("OK");
}));
router5.get("/analytics", phoneReadLimiter, wrapAsync(async (req, res) => {
  const userId = req.session.userId;
  const role = req.session.role || "business_developer";
  const { startDate, endDate, period = "daily" } = req.query;
  if (!userId) {
    return res.status(401).json({ success: false, error: "Non authentifi\xE9" });
  }
  const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3);
  const end = endDate ? new Date(endDate) : /* @__PURE__ */ new Date();
  const whereConditions = [
    gte5(phoneAnalyticsDaily.date, start)
  ];
  const isManager = role === "manager_france" || role === "manager_luxembourg" || role === "admin_groupe";
  if (!isManager) {
    whereConditions.push(eq9(phoneAnalyticsDaily.userId, userId));
  }
  const analytics = await db.query.phoneAnalyticsDaily.findMany({
    where: and6(...whereConditions),
    orderBy: [desc4(phoneAnalyticsDaily.date)]
  });
  const totals = analytics.reduce((acc, day) => ({
    totalCalls: acc.totalCalls + day.totalCalls,
    answeredCalls: acc.answeredCalls + day.answeredCalls,
    missedCalls: acc.missedCalls + day.missedCalls,
    totalDurationSeconds: acc.totalDurationSeconds + day.totalDurationSeconds,
    appointmentsScheduled: acc.appointmentsScheduled + day.appointmentsScheduled,
    interestedProspects: acc.interestedProspects + day.interestedProspects,
    totalCostCents: acc.totalCostCents + day.totalCostCents
  }), {
    totalCalls: 0,
    answeredCalls: 0,
    missedCalls: 0,
    totalDurationSeconds: 0,
    appointmentsScheduled: 0,
    interestedProspects: 0,
    totalCostCents: 0
  });
  res.json({
    success: true,
    data: {
      period: { start, end },
      analytics,
      totals: {
        ...totals,
        answerRate: totals.totalCalls > 0 ? Math.round(totals.answeredCalls / totals.totalCalls * 100) : 0,
        avgDurationSeconds: totals.answeredCalls > 0 ? Math.round(totals.totalDurationSeconds / totals.answeredCalls) : 0,
        conversionRate: totals.answeredCalls > 0 ? Math.round(totals.appointmentsScheduled / totals.answeredCalls * 100) : 0,
        totalCostEuros: (totals.totalCostCents / 100).toFixed(2)
      }
    }
  });
}));
router5.use(twilioErrorHandler);
var phone_default = router5;

// server/routes/phone-admin.ts
init_db();
init_schema();
init_encryption_service();
init_twilio_service();
import express5 from "express";
import { eq as eq11, and as and8, gte as gte6, desc as desc5, sum as sum2 } from "drizzle-orm";

// server/services/phone/phone-config-service.ts
init_db();
init_schema();
init_encryption_service();
import { eq as eq10, and as and7, sql as sql15, isNull } from "drizzle-orm";
var PhoneConfigService = class {
  /**
   * Créer une nouvelle configuration
   */
  async createConfig(data, performedBy) {
    const encryptedToken = encryptionService.encrypt(data.twilioAuthToken);
    const config = await db.insert(phoneConfigurations).values({
      entity: data.entity,
      createdBy: performedBy,
      agencyLocation: data.agencyLocation,
      agencyName: data.agencyName,
      displayName: data.displayName || `${data.agencyName} Principal`,
      twilioAccountSid: data.twilioAccountSid,
      twilioAuthTokenEncrypted: encryptedToken,
      twilioPhoneNumber: data.twilioPhoneNumber,
      twilioTwimlAppSid: data.twilioTwimlAppSid || null,
      coverageArea: data.coverageArea ? JSON.parse(JSON.stringify(data.coverageArea)) : null,
      isBackup: data.isBackup || false,
      isPrimary: data.isPrimary !== void 0 ? data.isPrimary : !data.isBackup,
      rotationPriority: data.rotationPriority || 1,
      isActive: data.isActive !== void 0 ? data.isActive : !data.isBackup,
      activatedAt: data.isActive !== false && !data.isBackup ? /* @__PURE__ */ new Date() : null,
      recordingEnabled: data.recordingEnabled !== void 0 ? data.recordingEnabled : true,
      transcriptionEnabled: data.transcriptionEnabled !== void 0 ? data.transcriptionEnabled : true,
      aiAnalysisEnabled: data.aiAnalysisEnabled !== void 0 ? data.aiAnalysisEnabled : true,
      dailyCallLimit: data.dailyCallLimit || 50,
      monthlyBudgetCents: data.monthlyBudgetCents || 1e5,
      lastModifiedBy: performedBy,
      changeHistory: JSON.parse(JSON.stringify([{
        date: (/* @__PURE__ */ new Date()).toISOString(),
        action: "created",
        by: performedBy,
        reason: "Initial configuration"
      }]))
    }).returning();
    await this.logHistory({
      configId: config[0].id,
      action: "created",
      reason: "Initial configuration",
      performedBy,
      newValues: config[0]
    });
    await this.invalidateTwilioCache(data.entity);
    return config[0];
  }
  /**
   * Mettre à jour une configuration
   */
  async updateConfig(configId, data, performedBy) {
    const currentConfig = await db.query.phoneConfigurations.findFirst({
      where: eq10(phoneConfigurations.id, configId)
    });
    if (!currentConfig) {
      throw new Error("Configuration not found");
    }
    const updateData = {
      ...data,
      lastModifiedBy: performedBy,
      updatedAt: /* @__PURE__ */ new Date()
    };
    if (data.twilioAuthToken) {
      updateData.twilioAuthTokenEncrypted = encryptionService.encrypt(data.twilioAuthToken);
      delete updateData.twilioAuthToken;
    }
    const currentHistory = currentConfig.changeHistory || [];
    const newHistory = [
      ...currentHistory,
      {
        date: (/* @__PURE__ */ new Date()).toISOString(),
        action: "updated",
        by: performedBy,
        reason: "Manual update"
      }
    ];
    updateData.changeHistory = JSON.parse(JSON.stringify(newHistory));
    const updated = await db.update(phoneConfigurations).set(updateData).where(eq10(phoneConfigurations.id, configId)).returning();
    await this.logHistory({
      configId,
      action: "updated",
      reason: "Manual update",
      performedBy,
      oldValues: currentConfig,
      newValues: updated[0]
    });
    await this.invalidateTwilioCache(currentConfig.entity);
    return updated[0];
  }
  /**
   * Activer une configuration
   */
  async activateConfig(configId, performedBy, options = {}) {
    const config = await db.query.phoneConfigurations.findFirst({
      where: eq10(phoneConfigurations.id, configId)
    });
    if (!config) {
      throw new Error("Configuration not found");
    }
    if (options.deactivateOthers && config.agencyLocation) {
      await db.update(phoneConfigurations).set({
        isActive: false,
        deactivatedAt: /* @__PURE__ */ new Date(),
        deactivationReason: "auto_switch"
      }).where(and7(
        eq10(phoneConfigurations.entity, config.entity),
        eq10(phoneConfigurations.agencyLocation, config.agencyLocation),
        eq10(phoneConfigurations.isActive, true),
        sql15`${phoneConfigurations.id} != ${configId}`
      ));
    }
    const configHistory = config.changeHistory || [];
    const updated = await db.update(phoneConfigurations).set({
      isActive: true,
      activatedAt: /* @__PURE__ */ new Date(),
      deactivatedAt: null,
      deactivationReason: null,
      lastModifiedBy: performedBy,
      changeHistory: JSON.parse(JSON.stringify([
        ...configHistory,
        {
          date: (/* @__PURE__ */ new Date()).toISOString(),
          action: "activated",
          by: performedBy,
          reason: options.reason || "Manual activation"
        }
      ]))
    }).where(eq10(phoneConfigurations.id, configId)).returning();
    await this.logHistory({
      configId,
      action: "activated",
      reason: options.reason || "Manual activation",
      performedBy,
      oldValues: config,
      newValues: updated[0]
    });
    await this.invalidateTwilioCache(config.entity);
    return updated[0];
  }
  /**
   * Désactiver une configuration
   */
  async deactivateConfig(configId, performedBy, options) {
    const config = await db.query.phoneConfigurations.findFirst({
      where: eq10(phoneConfigurations.id, configId)
    });
    if (!config) {
      throw new Error("Configuration not found");
    }
    const deactivateHistory = config.changeHistory || [];
    const updated = await db.update(phoneConfigurations).set({
      isActive: false,
      deactivatedAt: /* @__PURE__ */ new Date(),
      deactivationReason: options.reason,
      lastModifiedBy: performedBy,
      changeHistory: JSON.parse(JSON.stringify([
        ...deactivateHistory,
        {
          date: (/* @__PURE__ */ new Date()).toISOString(),
          action: "deactivated",
          by: performedBy,
          reason: options.reason
        }
      ]))
    }).where(eq10(phoneConfigurations.id, configId)).returning();
    await this.logHistory({
      configId,
      action: "deactivated",
      reason: options.reason,
      performedBy,
      oldValues: config,
      newValues: updated[0]
    });
    if (options.activateBackup && config.agencyLocation) {
      const backup = await db.query.phoneConfigurations.findFirst({
        where: and7(
          eq10(phoneConfigurations.entity, config.entity),
          eq10(phoneConfigurations.agencyLocation, config.agencyLocation),
          eq10(phoneConfigurations.isBackup, true),
          eq10(phoneConfigurations.isActive, false),
          isNull(phoneConfigurations.deletedAt)
        ),
        orderBy: (table, { asc }) => [asc(table.rotationPriority)]
      });
      if (backup) {
        await this.activateConfig(backup.id, performedBy, {
          deactivateOthers: false,
          // Déjà désactivé ci-dessus
          reason: "Auto-activation backup"
        });
      }
    }
    await this.invalidateTwilioCache(config.entity);
    return updated[0];
  }
  /**
   * Supprimer (soft delete) une configuration
   */
  async deleteConfig(configId, performedBy) {
    const config = await db.query.phoneConfigurations.findFirst({
      where: eq10(phoneConfigurations.id, configId)
    });
    if (!config) {
      throw new Error("Configuration not found");
    }
    const deleteHistory = config.changeHistory || [];
    await db.update(phoneConfigurations).set({
      deletedAt: /* @__PURE__ */ new Date(),
      isActive: false,
      lastModifiedBy: performedBy,
      changeHistory: JSON.parse(JSON.stringify([
        ...deleteHistory,
        {
          date: (/* @__PURE__ */ new Date()).toISOString(),
          action: "deleted",
          by: performedBy,
          reason: "Manual deletion"
        }
      ]))
    }).where(eq10(phoneConfigurations.id, configId));
    await this.logHistory({
      configId,
      action: "deleted",
      reason: "Manual deletion",
      performedBy,
      oldValues: config
    });
    await this.invalidateTwilioCache(config.entity);
  }
  /**
   * Obtenir statistiques d'un numéro
   */
  async getConfigStats(configId) {
    const config = await db.query.phoneConfigurations.findFirst({
      where: eq10(phoneConfigurations.id, configId)
    });
    if (!config) {
      throw new Error("Configuration not found");
    }
    const stats = await db.query.phoneCalls.findMany({
      where: and7(
        eq10(phoneCalls.entity, config.entity),
        sql15`${phoneCalls.createdAt} >= DATE_TRUNC('month', CURRENT_DATE)`
      )
    });
    const totalCalls = stats.length;
    const answeredCalls = stats.filter((c) => c.status === "completed").length;
    const answerRate = totalCalls > 0 ? answeredCalls / totalCalls * 100 : 0;
    const totalDuration = stats.reduce((sum3, c) => sum3 + (c.durationSeconds || 0), 0);
    const avgDuration = totalCalls > 0 ? totalDuration / totalCalls : 0;
    const rdvTaken = stats.filter((c) => c.outcome === "rendez_vous").length;
    const userIds = Array.from(new Set(stats.map((c) => c.callerUserId).filter(Boolean)));
    const usersData = userIds.length > 0 ? await db.query.users.findMany({
      where: sql15`${users.id} = ANY(${userIds})`
    }) : [];
    return {
      config,
      stats: {
        totalCalls,
        answeredCalls,
        answerRate: Math.round(answerRate),
        totalDuration,
        avgDuration: Math.round(avgDuration),
        rdvTaken
      },
      users: usersData.map((u) => ({
        id: u.id,
        name: `${u.firstName || ""} ${u.lastName || ""}`.trim(),
        callCount: stats.filter((c) => c.callerUserId === u.id).length
      }))
    };
  }
  /**
   * Obtenir historique d'une configuration
   */
  async getConfigHistory(configId) {
    return db.query.phoneConfigHistory.findMany({
      where: eq10(phoneConfigHistory.configId, configId),
      orderBy: (table, { desc: desc13 }) => [desc13(table.performedAt)],
      limit: 100
    });
  }
  /**
   * Logger dans historique
   */
  async logHistory(data) {
    await db.insert(phoneConfigHistory).values({
      configId: data.configId,
      action: data.action,
      reason: data.reason || null,
      description: data.description || null,
      performedBy: data.performedBy || null,
      oldValues: data.oldValues ? JSON.parse(JSON.stringify(data.oldValues)) : null,
      newValues: data.newValues ? JSON.parse(JSON.stringify(data.newValues)) : null,
      ipAddress: data.ipAddress || null,
      userAgent: data.userAgent || null
    });
  }
  /**
   * Invalider cache Twilio Service
   */
  async invalidateTwilioCache(entity) {
    const { twilioService: twilioService2 } = await Promise.resolve().then(() => (init_twilio_service(), twilio_service_exports));
    twilioService2.clearCache(entity);
  }
};
var phoneConfigService = new PhoneConfigService();

// server/routes/phone-admin.ts
import { z as z5 } from "zod";
var router6 = express5.Router();
var configSchema = z5.object({
  entity: z5.enum(["france", "luxembourg", "belgique"]),
  twilioAccountSid: z5.string().startsWith("AC", "Account SID invalide (doit commencer par AC)"),
  twilioAuthToken: z5.string().min(32, "Auth Token trop court (min 32 caract\xE8res)"),
  twilioPhoneNumber: z5.string().regex(/^\+\d{10,15}$/, "Format num\xE9ro invalide (+33...)"),
  twilioTwimlAppSid: z5.string().startsWith("AP", "TwiML App SID invalide (doit commencer par AP)").optional(),
  recordingEnabled: z5.boolean().optional(),
  transcriptionEnabled: z5.boolean().optional(),
  aiAnalysisEnabled: z5.boolean().optional(),
  maxConcurrentCalls: z5.number().int().min(1).max(50).optional(),
  maxCallDurationMinutes: z5.number().int().min(5).max(120).optional(),
  monthlyBudgetCents: z5.number().int().min(0).optional(),
  alertThresholdPercent: z5.number().int().min(0).max(100).optional()
});
var updateConfigSchema = configSchema.partial().omit({ entity: true });
var testConnectionSchema = z5.object({
  twilioAccountSid: z5.string().startsWith("AC"),
  twilioAuthToken: z5.string().min(32),
  twilioPhoneNumber: z5.string().regex(/^\+\d{10,15}$/)
});
router6.post("/test-connection", async (req, res) => {
  try {
    const validatedData = testConnectionSchema.parse(req.body);
    const Twilio2 = await import("twilio");
    const testClient = Twilio2.default(
      validatedData.twilioAccountSid,
      validatedData.twilioAuthToken
    );
    await testClient.api.v2010.accounts(validatedData.twilioAccountSid).fetch();
    const phoneNumbers = await testClient.incomingPhoneNumbers.list({
      phoneNumber: validatedData.twilioPhoneNumber,
      limit: 1
    });
    if (phoneNumbers.length === 0) {
      return res.status(400).json({
        success: false,
        message: `Num\xE9ro ${validatedData.twilioPhoneNumber} non trouv\xE9 dans ce compte Twilio`
      });
    }
    res.json({
      success: true,
      message: "Connexion Twilio valid\xE9e avec succ\xE8s"
    });
  } catch (error) {
    console.error("\u274C Test Twilio failed:", error);
    if (error.code === 20003) {
      return res.status(401).json({
        success: false,
        message: "Credentials Twilio invalides (Account SID ou Auth Token incorrect)"
      });
    }
    if (error instanceof z5.ZodError) {
      return res.status(400).json({
        success: false,
        message: error.errors.map((e) => e.message).join(", ")
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || "Erreur lors du test de connexion Twilio"
    });
  }
});
router6.get("/configurations", async (req, res) => {
  try {
    const configs = await db.query.phoneConfigurations.findMany({
      orderBy: [desc5(phoneConfigurations.createdAt)],
      with: {
        createdByUser: {
          columns: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });
    const sanitized = configs.map((config) => ({
      ...config,
      twilioAuthTokenEncrypted: "********"
    }));
    console.log(`\u{1F4CB} Liste configs phoning: ${configs.length} entities`);
    res.json({ success: true, data: sanitized });
  } catch (error) {
    console.error("\u274C Erreur liste configs phoning:", error);
    res.status(500).json({ success: false, error: "Erreur serveur" });
  }
});
router6.get("/configurations/:entity", async (req, res) => {
  try {
    const { entity } = req.params;
    if (!["france", "luxembourg", "belgique"].includes(entity)) {
      return res.status(400).json({
        success: false,
        error: "Entity invalide (france, luxembourg, belgique)"
      });
    }
    const config = await db.query.phoneConfigurations.findFirst({
      where: eq11(phoneConfigurations.entity, entity),
      with: {
        createdByUser: {
          columns: { id: true, firstName: true, lastName: true }
        }
      }
    });
    if (!config) {
      return res.status(404).json({
        success: false,
        error: `Configuration phoning non trouv\xE9e pour ${entity}`
      });
    }
    const sanitized = {
      ...config,
      twilioAuthTokenEncrypted: "********"
    };
    res.json({ success: true, data: sanitized });
  } catch (error) {
    console.error(`\u274C Erreur r\xE9cup\xE9ration config ${req.params.entity}:`, error);
    res.status(500).json({ success: false, error: "Erreur serveur" });
  }
});
router6.post("/configurations", async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Non authentifi\xE9" });
    }
    const data = configSchema.parse(req.body);
    const existing = await db.query.phoneConfigurations.findFirst({
      where: eq11(phoneConfigurations.entity, data.entity)
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: `Configuration Twilio pour ${data.entity} existe d\xE9j\xE0 - utilisez PUT pour modifier`
      });
    }
    const encryptedToken = encryptionService.encrypt(data.twilioAuthToken);
    const [config] = await db.insert(phoneConfigurations).values({
      entity: data.entity,
      twilioAccountSid: data.twilioAccountSid,
      twilioAuthTokenEncrypted: encryptedToken,
      twilioPhoneNumber: data.twilioPhoneNumber,
      twilioTwimlAppSid: data.twilioTwimlAppSid,
      recordingEnabled: data.recordingEnabled ?? true,
      transcriptionEnabled: data.transcriptionEnabled ?? true,
      aiAnalysisEnabled: data.aiAnalysisEnabled ?? true,
      maxConcurrentCalls: data.maxConcurrentCalls ?? 10,
      maxCallDurationMinutes: data.maxCallDurationMinutes ?? 60,
      monthlyBudgetCents: data.monthlyBudgetCents ?? 3e5,
      // 3000€ par défaut
      alertThresholdPercent: data.alertThresholdPercent ?? 80,
      isActive: true,
      createdBy: userId
    }).returning();
    console.log(`\u2705 Config Twilio cr\xE9\xE9e pour ${data.entity}`);
    res.json({
      success: true,
      data: { ...config, twilioAuthTokenEncrypted: "********" }
    });
  } catch (error) {
    console.error("\u274C Erreur cr\xE9ation config phoning:", error);
    if (error instanceof z5.ZodError) {
      return res.status(400).json({ success: false, error: error.errors });
    }
    res.status(500).json({ success: false, error: "Erreur cr\xE9ation configuration" });
  }
});
router6.put("/configurations/:entity", async (req, res) => {
  try {
    const { entity } = req.params;
    const data = updateConfigSchema.parse(req.body);
    if (!["france", "luxembourg", "belgique"].includes(entity)) {
      return res.status(400).json({
        success: false,
        error: "Entity invalide (france, luxembourg, belgique)"
      });
    }
    const config = await db.query.phoneConfigurations.findFirst({
      where: eq11(phoneConfigurations.entity, entity)
    });
    if (!config) {
      return res.status(404).json({
        success: false,
        error: `Configuration phoning non trouv\xE9e pour ${entity}`
      });
    }
    const updateData = { updatedAt: /* @__PURE__ */ new Date() };
    if (data.twilioAccountSid) updateData.twilioAccountSid = data.twilioAccountSid;
    if (data.twilioPhoneNumber) updateData.twilioPhoneNumber = data.twilioPhoneNumber;
    if (data.twilioTwimlAppSid) updateData.twilioTwimlAppSid = data.twilioTwimlAppSid;
    if (data.twilioAuthToken) {
      updateData.twilioAuthTokenEncrypted = encryptionService.encrypt(data.twilioAuthToken);
      twilioService.clearCache(entity);
    }
    if (data.recordingEnabled !== void 0) updateData.recordingEnabled = data.recordingEnabled;
    if (data.transcriptionEnabled !== void 0) updateData.transcriptionEnabled = data.transcriptionEnabled;
    if (data.aiAnalysisEnabled !== void 0) updateData.aiAnalysisEnabled = data.aiAnalysisEnabled;
    if (data.maxConcurrentCalls) updateData.maxConcurrentCalls = data.maxConcurrentCalls;
    if (data.maxCallDurationMinutes) updateData.maxCallDurationMinutes = data.maxCallDurationMinutes;
    if (data.monthlyBudgetCents !== void 0) updateData.monthlyBudgetCents = data.monthlyBudgetCents;
    if (data.alertThresholdPercent !== void 0) updateData.alertThresholdPercent = data.alertThresholdPercent;
    const [updated] = await db.update(phoneConfigurations).set(updateData).where(eq11(phoneConfigurations.entity, entity)).returning();
    console.log(`\u2705 Config Twilio mise \xE0 jour pour ${entity}`);
    res.json({
      success: true,
      data: { ...updated, twilioAuthTokenEncrypted: "********" }
    });
  } catch (error) {
    console.error(`\u274C Erreur mise \xE0 jour config ${req.params.entity}:`, error);
    if (error instanceof z5.ZodError) {
      return res.status(400).json({ success: false, error: error.errors });
    }
    res.status(500).json({ success: false, error: "Erreur mise \xE0 jour configuration" });
  }
});
router6.post("/test-connection/:entity", async (req, res) => {
  try {
    const { entity } = req.params;
    if (!["france", "luxembourg", "belgique"].includes(entity)) {
      return res.status(400).json({
        success: false,
        error: "Entity invalide (france, luxembourg, belgique)"
      });
    }
    console.log(`\u{1F9EA} Test connexion Twilio ${entity}...`);
    const testResult = await twilioService.testConnection(entity);
    await db.update(phoneConfigurations).set({
      lastTestedAt: /* @__PURE__ */ new Date(),
      lastTestStatus: testResult.success ? "success" : "failed",
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq11(phoneConfigurations.entity, entity));
    if (testResult.success) {
      console.log(`\u2705 Test Twilio ${entity} r\xE9ussi`);
    } else {
      console.warn(`\u26A0\uFE0F Test Twilio ${entity} \xE9chou\xE9:`, testResult.message);
    }
    res.json(testResult);
  } catch (error) {
    console.error(`\u274C Erreur test connexion ${req.params.entity}:`, error);
    res.status(500).json({
      success: false,
      error: "Erreur test connexion Twilio",
      details: error.message
    });
  }
});
router6.get("/budget-status", async (req, res) => {
  try {
    const configs = await db.query.phoneConfigurations.findMany();
    const budgetStatus = await Promise.all(configs.map(async (config) => {
      const startOfMonth = /* @__PURE__ */ new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      const [result] = await db.select({ totalCost: sum2(phoneCalls.costCents) }).from(phoneCalls).where(and8(
        eq11(phoneCalls.entity, config.entity),
        gte6(phoneCalls.startedAt, startOfMonth)
      ));
      const spentCents = Number(result?.totalCost || 0);
      const budgetCents = config.monthlyBudgetCents;
      const percentUsed = budgetCents > 0 ? Math.round(spentCents / budgetCents * 100) : 0;
      return {
        entity: config.entity,
        monthlyBudgetCents: budgetCents,
        monthlyBudgetEuros: (budgetCents / 100).toFixed(2),
        spentCents,
        spentEuros: (spentCents / 100).toFixed(2),
        remainingCents: Math.max(0, budgetCents - spentCents),
        remainingEuros: (Math.max(0, budgetCents - spentCents) / 100).toFixed(2),
        percentUsed,
        alertThresholdPercent: config.alertThresholdPercent,
        alertTriggered: percentUsed >= config.alertThresholdPercent
      };
    }));
    console.log(`\u{1F4B0} Status budgets: ${budgetStatus.length} entities`);
    res.json({ success: true, data: budgetStatus });
  } catch (error) {
    console.error("\u274C Erreur r\xE9cup\xE9ration budget status:", error);
    res.status(500).json({ success: false, error: "Erreur serveur" });
  }
});
router6.get("/error-logs", async (req, res) => {
  try {
    const { limit = "50" } = req.query;
    const failedCalls = await db.query.phoneCalls.findMany({
      where: eq11(phoneCalls.status, "failed"),
      orderBy: [desc5(phoneCalls.startedAt)],
      limit: Number(limit),
      with: {
        caller: {
          columns: { id: true, firstName: true, lastName: true, email: true }
        },
        prospect: {
          columns: { id: true, nomEntreprise: true, contactPrenom: true }
        }
      }
    });
    console.log(`\u{1F4CB} Logs erreurs phoning: ${failedCalls.length} appels failed`);
    res.json({ success: true, data: failedCalls });
  } catch (error) {
    console.error("\u274C Erreur r\xE9cup\xE9ration error logs:", error);
    res.status(500).json({ success: false, error: "Erreur serveur" });
  }
});
var createDynamicConfigSchema = z5.object({
  entity: z5.enum(["france", "luxembourg", "belgique"]),
  agencyLocation: z5.string().min(2).max(50),
  agencyName: z5.string().min(3).max(100),
  displayName: z5.string().max(150).optional(),
  twilioAccountSid: z5.string().startsWith("AC"),
  twilioAuthToken: z5.string().min(32),
  twilioPhoneNumber: z5.string().regex(/^\+\d{10,15}$/),
  twilioTwimlAppSid: z5.string().startsWith("AP").optional(),
  coverageArea: z5.array(z5.string()).optional(),
  isBackup: z5.boolean().optional(),
  isPrimary: z5.boolean().optional(),
  rotationPriority: z5.number().int().min(1).optional(),
  isActive: z5.boolean().optional(),
  recordingEnabled: z5.boolean().optional(),
  transcriptionEnabled: z5.boolean().optional(),
  aiAnalysisEnabled: z5.boolean().optional(),
  dailyCallLimit: z5.number().int().min(1).optional(),
  monthlyBudgetCents: z5.number().int().min(0).optional()
});
var updateDynamicConfigSchema = z5.object({
  agencyName: z5.string().min(3).max(100).optional(),
  displayName: z5.string().max(150).optional(),
  twilioAccountSid: z5.string().startsWith("AC").optional(),
  twilioAuthToken: z5.string().min(32).optional(),
  twilioPhoneNumber: z5.string().regex(/^\+\d{10,15}$/).optional(),
  twilioTwimlAppSid: z5.string().startsWith("AP").optional(),
  coverageArea: z5.array(z5.string()).optional(),
  rotationPriority: z5.number().int().min(1).optional(),
  recordingEnabled: z5.boolean().optional(),
  transcriptionEnabled: z5.boolean().optional(),
  aiAnalysisEnabled: z5.boolean().optional(),
  dailyCallLimit: z5.number().int().min(1).optional(),
  monthlyBudgetCents: z5.number().int().min(0).optional()
});
var activateSchema = z5.object({
  deactivateOthers: z5.boolean().optional(),
  reason: z5.string().optional()
});
var deactivateSchema = z5.object({
  reason: z5.string().min(3),
  activateBackup: z5.boolean().optional()
});
router6.post("/configurations/create-dynamic", async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Non authentifi\xE9" });
    }
    const data = createDynamicConfigSchema.parse(req.body);
    const config = await phoneConfigService.createConfig(data, userId);
    const response = {
      ...config,
      twilioAuthTokenEncrypted: "********"
    };
    console.log(`\u2705 Config dynamique cr\xE9\xE9e: ${data.agencyName}`);
    res.status(201).json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error("\u274C Erreur cr\xE9ation config dynamique:", error);
    if (error instanceof z5.ZodError) {
      return res.status(400).json({ success: false, error: error.errors });
    }
    res.status(400).json({
      success: false,
      error: error.message || "Erreur cr\xE9ation configuration"
    });
  }
});
router6.put("/configurations/:id", async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Non authentifi\xE9" });
    }
    const { id } = req.params;
    const data = updateDynamicConfigSchema.parse(req.body);
    const config = await phoneConfigService.updateConfig(id, data, userId);
    const response = {
      ...config,
      twilioAuthTokenEncrypted: "********"
    };
    console.log(`\u2705 Config ${id} mise \xE0 jour`);
    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error(`\u274C Erreur update config ${req.params.id}:`, error);
    if (error instanceof z5.ZodError) {
      return res.status(400).json({ success: false, error: error.errors });
    }
    res.status(400).json({
      success: false,
      error: error.message || "Erreur mise \xE0 jour"
    });
  }
});
router6.patch("/configurations/:id/activate", async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Non authentifi\xE9" });
    }
    const { id } = req.params;
    const data = activateSchema.parse(req.body);
    const config = await phoneConfigService.activateConfig(id, userId, data);
    console.log(`\u2705 Config ${id} activ\xE9e`);
    res.json({
      success: true,
      data: config,
      message: "Configuration activ\xE9e avec succ\xE8s"
    });
  } catch (error) {
    console.error(`\u274C Erreur activation config ${req.params.id}:`, error);
    res.status(400).json({
      success: false,
      error: error.message || "Erreur activation"
    });
  }
});
router6.patch("/configurations/:id/deactivate", async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Non authentifi\xE9" });
    }
    const { id } = req.params;
    const data = deactivateSchema.parse(req.body);
    const config = await phoneConfigService.deactivateConfig(id, userId, data);
    console.log(`\u2705 Config ${id} d\xE9sactiv\xE9e: ${data.reason}`);
    res.json({
      success: true,
      data: config,
      message: "Configuration d\xE9sactiv\xE9e avec succ\xE8s"
    });
  } catch (error) {
    console.error(`\u274C Erreur d\xE9sactivation config ${req.params.id}:`, error);
    if (error instanceof z5.ZodError) {
      return res.status(400).json({ success: false, error: error.errors });
    }
    res.status(400).json({
      success: false,
      error: error.message || "Erreur d\xE9sactivation"
    });
  }
});
router6.delete("/configurations/:id", async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Non authentifi\xE9" });
    }
    const { id } = req.params;
    await phoneConfigService.deleteConfig(id, userId);
    console.log(`\u2705 Config ${id} supprim\xE9e (soft delete)`);
    res.json({
      success: true,
      message: "Configuration supprim\xE9e avec succ\xE8s"
    });
  } catch (error) {
    console.error(`\u274C Erreur suppression config ${req.params.id}:`, error);
    res.status(400).json({
      success: false,
      error: error.message || "Erreur suppression"
    });
  }
});
router6.get("/configurations/:id/stats", async (req, res) => {
  try {
    const { id } = req.params;
    const stats = await phoneConfigService.getConfigStats(id);
    console.log(`\u{1F4CA} Stats config ${id} r\xE9cup\xE9r\xE9es`);
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error(`\u274C Erreur r\xE9cup\xE9ration stats ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: "Erreur r\xE9cup\xE9ration statistiques"
    });
  }
});
router6.get("/configurations/:id/history", async (req, res) => {
  try {
    const { id } = req.params;
    const history = await phoneConfigService.getConfigHistory(id);
    console.log(`\u{1F4DC} Historique config ${id} r\xE9cup\xE9r\xE9`);
    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error(`\u274C Erreur r\xE9cup\xE9ration historique ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: "Erreur r\xE9cup\xE9ration historique"
    });
  }
});
var phone_admin_default = router6;

// server/routes/gps-track.ts
init_db();
init_schema_gps();
import express6 from "express";
import { eq as eq15, and as and11 } from "drizzle-orm";

// server/services/gps/config-cache-service.ts
init_db();
init_schema_gps();
import { eq as eq12 } from "drizzle-orm";
var ConfigCacheService = class {
  cache = /* @__PURE__ */ new Map();
  cacheTimestamps = /* @__PURE__ */ new Map();
  CACHE_TTL_MS = 5 * 60 * 1e3;
  // 5 minutes
  /**
   * Récupérer config GPS pour une entité (avec cache)
   */
  async getConfig(entityId) {
    const cacheKey = `gps_config_${entityId}`;
    const now = Date.now();
    if (this.cache.has(cacheKey)) {
      const timestamp6 = this.cacheTimestamps.get(cacheKey) || 0;
      if (now - timestamp6 < this.CACHE_TTL_MS) {
        return this.cache.get(cacheKey);
      }
    }
    const config = await db.query.gpsSystemConfig.findFirst({
      where: eq12(gpsSystemConfig.entityId, entityId)
    });
    if (!config) {
      if (entityId !== "global") {
        return this.getConfig("global");
      }
      const [newConfig] = await db.insert(gpsSystemConfig).values({
        entityId: "global"
      }).returning();
      this.cache.set(cacheKey, newConfig);
      this.cacheTimestamps.set(cacheKey, now);
      return newConfig;
    }
    this.cache.set(cacheKey, config);
    this.cacheTimestamps.set(cacheKey, now);
    return config;
  }
  /**
   * Invalider cache pour une entité
   */
  invalidate(entityId) {
    const cacheKey = `gps_config_${entityId}`;
    this.cache.delete(cacheKey);
    this.cacheTimestamps.delete(cacheKey);
  }
  /**
   * Invalider tout le cache
   */
  invalidateAll() {
    this.cache.clear();
    this.cacheTimestamps.clear();
  }
  /**
   * Récupérer fréquence tracking (en minutes) pour une entité
   */
  async getTrackingFrequency(entityId) {
    const config = await this.getConfig(entityId);
    return config.trackingFrequencyMinutes || 5;
  }
  /**
   * Vérifier si tracking activé pour une entité
   */
  async isTrackingEnabled(entityId) {
    const config = await this.getConfig(entityId);
    return config.trackingEnabled ?? true;
  }
  /**
   * Récupérer rayon opportunités (en km) pour une entité
   */
  async getOpportunitiesRadius(entityId) {
    const config = await this.getConfig(entityId);
    return parseFloat(config.opportunitiesRadiusKm || "5");
  }
  /**
   * Vérifier si opportunités activées pour une entité
   */
  async areOpportunitiesEnabled(entityId) {
    const config = await this.getConfig(entityId);
    return config.opportunitiesEnabled ?? true;
  }
  /**
   * Récupérer destinataires rapports hebdo
   */
  async getWeeklyReportsRecipients(entityId) {
    const config = await this.getConfig(entityId);
    return config.weeklyReportsRecipients || [];
  }
};
var configCacheService = new ConfigCacheService();

// server/services/gps/geocoding-service.ts
init_db();
init_schema_gps();
init_encryption_service();
import { eq as eq13, and as and9 } from "drizzle-orm";
var GeocodingService = class {
  NOMINATIM_REVERSE_URL = "https://nominatim.openstreetmap.org/reverse";
  NOMINATIM_SEARCH_URL = "https://nominatim.openstreetmap.org/search";
  GOOGLE_GEOCODING_URL = "https://maps.googleapis.com/maps/api/geocode/json";
  /**
   * Forward geocoding : convertir adresse en lat/lng
   * CASCADE: Google Maps API → OpenStreetMap Nominatim
   */
  async geocode(address, entityId = "global", userId) {
    try {
      const googleResult = await this.tryGoogleForwardGeocoding(address, entityId, userId);
      if (googleResult) {
        return googleResult;
      }
      return await this.tryNominatimForwardGeocoding(address, userId);
    } catch (error) {
      console.error("Forward geocoding error:", error);
      return null;
    }
  }
  /**
   * Reverse geocoding : convertir lat/lng en adresse
   */
  async reverseGeocode(latitude, longitude, entityId = "global", userId) {
    try {
      const googleResult = await this.tryGoogleMapsGeocoding(latitude, longitude, entityId, userId);
      if (googleResult) {
        return googleResult;
      }
      return await this.tryNominatimGeocoding(latitude, longitude, userId);
    } catch (error) {
      console.error("Geocoding error:", error);
      return null;
    }
  }
  /**
   * Tenter reverse geocoding avec Google Maps API
   */
  async tryGoogleMapsGeocoding(latitude, longitude, entityId, userId) {
    try {
      const credential = await db.query.apiCredentials.findFirst({
        where: and9(
          eq13(apiCredentials.provider, "google_maps"),
          eq13(apiCredentials.entityId, entityId),
          eq13(apiCredentials.isActive, true)
        )
      });
      if (!credential || !credential.apiKeyEncrypted) {
        return null;
      }
      const apiKey = encryptionService.decrypt(credential.apiKeyEncrypted);
      const startTime = Date.now();
      const url = `${this.GOOGLE_GEOCODING_URL}?latlng=${latitude},${longitude}&key=${apiKey}&language=fr`;
      const response = await fetch(url);
      const responseTimeMs = Date.now() - startTime;
      const data = await response.json();
      await this.logApiUsage({
        credentialId: credential.id,
        provider: "google_maps",
        entityId,
        endpoint: "/geocode/json",
        method: "GET",
        statusCode: response.status,
        responseTimeMs,
        success: data.status === "OK",
        errorMessage: data.status !== "OK" ? data.error_message : void 0,
        estimatedCost: 5e-3,
        // 5$ par 1000 requêtes Google Maps Geocoding
        userId
      });
      if (data.status !== "OK" || !data.results || data.results.length === 0) {
        return null;
      }
      const result = data.results[0];
      return this.parseGoogleMapsResult(result);
    } catch (error) {
      console.error("Google Maps geocoding error:", error);
      return null;
    }
  }
  /**
   * Tenter forward geocoding avec Google Maps API
   */
  async tryGoogleForwardGeocoding(address, entityId, userId) {
    try {
      const credential = await db.query.apiCredentials.findFirst({
        where: and9(
          eq13(apiCredentials.provider, "google_maps"),
          eq13(apiCredentials.entityId, entityId),
          eq13(apiCredentials.isActive, true)
        )
      });
      if (!credential || !credential.apiKeyEncrypted) {
        return null;
      }
      const apiKey = encryptionService.decrypt(credential.apiKeyEncrypted);
      const startTime = Date.now();
      const url = `${this.GOOGLE_GEOCODING_URL}?address=${encodeURIComponent(address)}&key=${apiKey}&language=fr`;
      const response = await fetch(url);
      const responseTimeMs = Date.now() - startTime;
      const data = await response.json();
      await this.logApiUsage({
        credentialId: credential.id,
        provider: "google_maps",
        entityId,
        endpoint: "/geocode/json",
        method: "GET",
        statusCode: response.status,
        responseTimeMs,
        success: data.status === "OK",
        errorMessage: data.status !== "OK" ? data.error_message : void 0,
        estimatedCost: 5e-3,
        // 5$ par 1000 requêtes Google Maps Geocoding
        userId
      });
      if (data.status !== "OK" || !data.results || data.results.length === 0) {
        return null;
      }
      const result = data.results[0];
      const location = result.geometry?.location;
      if (!location || !location.lat || !location.lng) {
        return null;
      }
      const addressComponents = result.address_components || [];
      const getComponent = (type) => {
        const component = addressComponents.find((c) => c.types.includes(type));
        return component?.long_name || null;
      };
      return {
        latitude: location.lat,
        longitude: location.lng,
        address: result.formatted_address || address,
        city: getComponent("locality") || getComponent("administrative_area_level_2"),
        postalCode: getComponent("postal_code"),
        country: getComponent("country"),
        source: "google_maps"
      };
    } catch (error) {
      console.error("Google Maps forward geocoding error:", error);
      return null;
    }
  }
  /**
   * Tenter forward geocoding avec OpenStreetMap Nominatim (gratuit)
   */
  async tryNominatimForwardGeocoding(address, userId) {
    try {
      const startTime = Date.now();
      const url = `${this.NOMINATIM_SEARCH_URL}?q=${encodeURIComponent(address)}&format=json&limit=1&accept-language=fr`;
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Hector-GPS-Module/2.0 (ADS GROUP Security)"
        }
      });
      const responseTimeMs = Date.now() - startTime;
      const data = await response.json();
      await this.logApiUsage({
        credentialId: null,
        provider: "openstreetmap",
        entityId: "global",
        endpoint: "/search",
        method: "GET",
        statusCode: response.status,
        responseTimeMs,
        success: response.ok && data.length > 0,
        errorMessage: !response.ok || data.length === 0 ? "No results found" : void 0,
        estimatedCost: 0,
        userId
      });
      if (!response.ok || !data || data.length === 0) {
        return null;
      }
      const result = data[0];
      return {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        address: result.display_name || address,
        city: result.address?.city || result.address?.town || result.address?.village || null,
        postalCode: result.address?.postcode || null,
        country: result.address?.country_code?.toUpperCase() || null,
        source: "nominatim"
      };
    } catch (error) {
      console.error("Nominatim forward geocoding error:", error);
      return null;
    }
  }
  /**
   * Tenter reverse geocoding avec OpenStreetMap Nominatim (gratuit)
   */
  async tryNominatimGeocoding(latitude, longitude, userId) {
    try {
      const startTime = Date.now();
      const url = `${this.NOMINATIM_REVERSE_URL}?lat=${latitude}&lon=${longitude}&format=json&accept-language=fr`;
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Hector-GPS-Module/2.0 (ADS GROUP Security)"
        }
      });
      const responseTimeMs = Date.now() - startTime;
      const data = await response.json();
      await this.logApiUsage({
        credentialId: null,
        provider: "openstreetmap",
        entityId: "global",
        endpoint: "/reverse",
        method: "GET",
        statusCode: response.status,
        responseTimeMs,
        success: response.ok,
        errorMessage: !response.ok ? await response.text() : void 0,
        estimatedCost: 0,
        userId
      });
      if (!response.ok || !data.display_name) {
        return null;
      }
      return this.parseNominatimResult(data);
    } catch (error) {
      console.error("Nominatim geocoding error:", error);
      return null;
    }
  }
  /**
   * Parser résultat Google Maps Geocoding API
   */
  parseGoogleMapsResult(result) {
    const addressComponents = result.address_components || [];
    let city = null;
    let postalCode = null;
    let country = null;
    for (const component of addressComponents) {
      const types = component.types || [];
      if (types.includes("locality")) {
        city = component.long_name;
      }
      if (types.includes("postal_code")) {
        postalCode = component.long_name;
      }
      if (types.includes("country")) {
        country = component.short_name;
      }
    }
    return {
      address: result.formatted_address || "",
      city,
      postalCode,
      country
    };
  }
  /**
   * Parser résultat OpenStreetMap Nominatim
   */
  parseNominatimResult(data) {
    return {
      address: data.display_name || "",
      city: data.address?.city || data.address?.town || data.address?.village || null,
      postalCode: data.address?.postcode || null,
      country: data.address?.country_code?.toUpperCase() || null
    };
  }
  /**
   * Logger utilisation API dans base de données
   */
  async logApiUsage(data) {
    try {
      await db.insert(apiUsageLogs).values({
        credentialId: data.credentialId,
        provider: data.provider,
        entityId: data.entityId,
        endpoint: data.endpoint,
        method: data.method,
        statusCode: data.statusCode,
        responseTimeMs: data.responseTimeMs,
        success: data.success,
        errorMessage: data.errorMessage,
        estimatedCost: data.estimatedCost.toString(),
        userId: data.userId
      });
    } catch (error) {
      console.error("Failed to log API usage:", error);
    }
  }
};
var geocodingService = new GeocodingService();

// server/services/gps/gps-service.ts
init_db();
init_schema_gps();
init_schema();
import { eq as eq14, and as and10, gte as gte7, lte as lte2, desc as desc6, sql as sql16 } from "drizzle-orm";
var GpsService = class {
  /**
   * Enregistrer une nouvelle position GPS
   */
  async recordPosition(userId, entity, positionData) {
    const trackingEnabled = await configCacheService.isTrackingEnabled(entity);
    if (!trackingEnabled) {
      throw new Error("GPS tracking is disabled for this entity");
    }
    let geocodingResult = null;
    if (!positionData.address && positionData.latitude && positionData.longitude) {
      geocodingResult = await geocodingService.reverseGeocode(
        parseFloat(positionData.latitude),
        parseFloat(positionData.longitude),
        entity,
        userId
      );
    }
    const [position] = await db.insert(gpsPositions).values({
      userId,
      entity,
      latitude: positionData.latitude,
      longitude: positionData.longitude,
      accuracy: positionData.accuracy,
      altitude: positionData.altitude,
      heading: positionData.heading,
      speed: positionData.speed,
      batteryLevel: positionData.batteryLevel,
      isCharging: positionData.isCharging,
      networkType: positionData.networkType,
      capturedAt: positionData.capturedAt,
      isManual: positionData.isManual,
      address: geocodingResult?.address || positionData.address || void 0,
      city: geocodingResult?.city || positionData.city || void 0,
      postalCode: geocodingResult?.postalCode || positionData.postalCode || void 0,
      country: geocodingResult?.country || positionData.country || void 0
    }).returning();
    this.detectNearbyOpportunities(position).catch((err) => {
      console.error("Failed to detect opportunities:", err);
    });
    this.updateDailyStats(userId, entity, position).catch((err) => {
      console.error("Failed to update daily stats:", err);
    });
    return position;
  }
  /**
   * Détecter opportunités (prospects) à proximité
   */
  async detectNearbyOpportunities(position) {
    const oppEnabled = await configCacheService.areOpportunitiesEnabled(position.entity);
    if (!oppEnabled) {
      return;
    }
    const radiusKm = await configCacheService.getOpportunitiesRadius(position.entity);
    const radiusDegrees = radiusKm / 111;
    const nearbyProspects = await db.query.prospects.findMany({
      where: and10(
        eq14(prospects.entity, position.entity),
        sql16`${prospects.userId} = ${position.userId}`
        // Prospects du commercial
      )
    });
    for (const prospect of nearbyProspects) {
      if (!prospect.latitude || !prospect.longitude) {
        continue;
      }
      const prospectLat = parseFloat(prospect.latitude);
      const prospectLng = parseFloat(prospect.longitude);
      if (isNaN(prospectLat) || isNaN(prospectLng)) {
        console.warn(`[GPS Service] Invalid coordinates for prospect ${prospect.id}`);
        continue;
      }
      const distance = this.calculateDistance(
        parseFloat(position.latitude),
        parseFloat(position.longitude),
        prospectLat,
        prospectLng
      );
      if (distance <= radiusKm * 1e3) {
        const today = /* @__PURE__ */ new Date();
        today.setHours(0, 0, 0, 0);
        const existingOpp = await db.query.gpsOpportunities.findFirst({
          where: and10(
            eq14(gpsOpportunities.userId, position.userId),
            eq14(gpsOpportunities.prospectId, prospect.id),
            gte7(gpsOpportunities.detectedAt, today)
          )
        });
        if (!existingOpp) {
          await this.createOpportunity({
            userId: position.userId,
            entity: position.entity,
            prospectId: prospect.id,
            positionId: position.id,
            detectedAt: /* @__PURE__ */ new Date(),
            distanceMeters: Math.round(distance),
            userLatitude: position.latitude,
            userLongitude: position.longitude,
            userAddress: position.address || void 0,
            prospectLatitude: prospectLat.toString(),
            prospectLongitude: prospectLng.toString(),
            prospectAddress: `${prospect.adresse1 || ""}, ${prospect.ville || ""}`,
            prospectCompanyName: prospect.entreprise,
            prospectStatus: prospect.statut,
            priorityScore: this.calculatePriorityScore(prospect, distance)
          });
        }
      }
    }
  }
  /**
   * Créer une opportunité GPS
   */
  async createOpportunity(data) {
    const expiresAt = /* @__PURE__ */ new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    const [opportunity] = await db.insert(gpsOpportunities).values({
      ...data,
      expiresAt
    }).returning();
    return opportunity;
  }
  /**
   * Calculer distance Haversine entre 2 coordonnées (en mètres)
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const \u03C61 = lat1 * Math.PI / 180;
    const \u03C62 = lat2 * Math.PI / 180;
    const \u0394\u03C6 = (lat2 - lat1) * Math.PI / 180;
    const \u0394\u03BB = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(\u0394\u03C6 / 2) * Math.sin(\u0394\u03C6 / 2) + Math.cos(\u03C61) * Math.cos(\u03C62) * Math.sin(\u0394\u03BB / 2) * Math.sin(\u0394\u03BB / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  /**
   * Calculer score priorité opportunité (0-100)
   */
  calculatePriorityScore(prospect, distanceMeters) {
    let score = 50;
    if (distanceMeters < 1e3) score += 30;
    else if (distanceMeters < 3e3) score += 20;
    else if (distanceMeters < 5e3) score += 10;
    if (prospect.statut === "qualification" || prospect.statut === "nouveau") {
      score += 20;
    }
    return Math.min(100, score);
  }
  /**
   * Mettre à jour statistiques journalières
   */
  async updateDailyStats(userId, entity, position) {
    const statDate = new Date(position.capturedAt);
    statDate.setHours(0, 0, 0, 0);
    const [existing] = await db.select().from(gpsDailyStats).where(
      and10(
        eq14(gpsDailyStats.userId, userId),
        eq14(gpsDailyStats.statDate, statDate.toISOString().split("T")[0])
      )
    ).limit(1);
    if (existing) {
      const citiesSet = new Set(existing.citiesVisited || []);
      if (position.city) {
        citiesSet.add(position.city);
      }
      await db.update(gpsDailyStats).set({
        citiesVisited: Array.from(citiesSet),
        uniqueCitiesCount: citiesSet.size,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq14(gpsDailyStats.id, existing.id));
    } else {
      await db.insert(gpsDailyStats).values({
        userId,
        entity,
        statDate: statDate.toISOString().split("T")[0],
        citiesVisited: position.city ? [position.city] : [],
        uniqueCitiesCount: position.city ? 1 : 0
      });
    }
  }
  /**
   * Récupérer positions d'un utilisateur sur une période
   */
  async getUserPositions(userId, startDate, endDate) {
    return await db.select().from(gpsPositions).where(
      and10(
        eq14(gpsPositions.userId, userId),
        gte7(gpsPositions.capturedAt, startDate),
        lte2(gpsPositions.capturedAt, endDate)
      )
    ).orderBy(desc6(gpsPositions.capturedAt));
  }
  /**
   * Récupérer opportunités en attente pour un utilisateur
   */
  async getPendingOpportunities(userId) {
    return await db.query.gpsOpportunities.findMany({
      where: and10(
        eq14(gpsOpportunities.userId, userId),
        eq14(gpsOpportunities.status, "pending"),
        gte7(gpsOpportunities.expiresAt, /* @__PURE__ */ new Date())
      ),
      orderBy: [desc6(gpsOpportunities.priorityScore), desc6(gpsOpportunities.detectedAt)]
    });
  }
};
var gpsService = new GpsService();

// server/services/gps/index.ts
init_encryption_service();

// server/routes/gps-track.ts
import { z as z6 } from "zod";
var router7 = express6.Router();
var trackPositionSchema = z6.object({
  latitude: z6.string().or(z6.number()).transform((val) => String(val)),
  longitude: z6.string().or(z6.number()).transform((val) => String(val)),
  accuracy: z6.string().or(z6.number()).transform((val) => String(val)).optional(),
  altitude: z6.string().or(z6.number()).transform((val) => String(val)).optional(),
  heading: z6.string().or(z6.number()).transform((val) => String(val)).optional(),
  speed: z6.string().or(z6.number()).transform((val) => String(val)).optional(),
  batteryLevel: z6.number().int().min(0).max(100).optional(),
  isCharging: z6.boolean().optional(),
  networkType: z6.string().optional(),
  capturedAt: z6.string().transform((str) => new Date(str)),
  isManual: z6.boolean().optional()
}).refine(
  (data) => {
    const lat = parseFloat(data.latitude);
    const lng = parseFloat(data.longitude);
    return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  },
  {
    message: "Latitude must be between -90 and 90, longitude between -180 and 180"
  }
);
var opportunityActionSchema = z6.object({
  action: z6.enum(["visited", "called", "ignored"]),
  notes: z6.string().optional()
});
router7.post("/track", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Authentification requise"
      });
    }
    const validatedData = trackPositionSchema.parse(req.body);
    const userId = req.user.id;
    const entity = req.user.entity || "luxembourg";
    const trackingEnabled = await configCacheService.isTrackingEnabled(entity);
    if (!trackingEnabled) {
      return res.status(403).json({
        success: false,
        error: "Tracking GPS d\xE9sactiv\xE9 pour votre entit\xE9"
      });
    }
    const position = await gpsService.recordPosition(userId, entity, validatedData);
    res.json({
      success: true,
      data: position,
      message: "Position GPS enregistr\xE9e avec succ\xE8s"
    });
  } catch (error) {
    console.error("\u274C Erreur enregistrement position GPS:", error);
    if (error instanceof z6.ZodError) {
      return res.status(400).json({
        success: false,
        error: error.errors.map((e) => e.message).join(", ")
      });
    }
    res.status(500).json({
      success: false,
      error: error.message || "Erreur lors de l'enregistrement de la position"
    });
  }
});
router7.get("/opportunities", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Authentification requise"
      });
    }
    const userId = req.user.id;
    const opportunities4 = await gpsService.getPendingOpportunities(userId);
    res.json({
      success: true,
      data: opportunities4,
      count: opportunities4.length
    });
  } catch (error) {
    console.error("\u274C Erreur r\xE9cup\xE9ration opportunit\xE9s:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la r\xE9cup\xE9ration des opportunit\xE9s"
    });
  }
});
router7.post("/opportunities/:id/action", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Authentification requise"
      });
    }
    const { id } = req.params;
    const userId = req.user.id;
    const validatedData = opportunityActionSchema.parse(req.body);
    const opportunity = await db.query.gpsOpportunities.findFirst({
      where: and11(
        eq15(gpsOpportunities.id, id),
        eq15(gpsOpportunities.userId, userId)
      )
    });
    if (!opportunity) {
      return res.status(404).json({
        success: false,
        error: "Opportunit\xE9 non trouv\xE9e"
      });
    }
    const [updated] = await db.update(gpsOpportunities).set({
      status: validatedData.action === "ignored" ? "declined" : "accepted",
      actionTaken: validatedData.action,
      actionTakenAt: /* @__PURE__ */ new Date(),
      actionNotes: validatedData.notes || void 0,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq15(gpsOpportunities.id, id)).returning();
    res.json({
      success: true,
      data: updated,
      message: `Action "${validatedData.action}" enregistr\xE9e avec succ\xE8s`
    });
  } catch (error) {
    console.error("\u274C Erreur action opportunit\xE9:", error);
    if (error instanceof z6.ZodError) {
      return res.status(400).json({
        success: false,
        error: error.errors.map((e) => e.message).join(", ")
      });
    }
    res.status(500).json({
      success: false,
      error: "Erreur lors de l'enregistrement de l'action"
    });
  }
});
router7.get("/positions", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Authentification requise"
      });
    }
    const userId = req.user.id;
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 24 * 60 * 60 * 1e3);
    const end = endDate ? new Date(endDate) : /* @__PURE__ */ new Date();
    const positions = await gpsService.getUserPositions(userId, start, end);
    res.json({
      success: true,
      data: positions,
      count: positions.length,
      period: { start, end }
    });
  } catch (error) {
    console.error("\u274C Erreur r\xE9cup\xE9ration positions:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la r\xE9cup\xE9ration des positions"
    });
  }
});
router7.get("/config", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Authentification requise"
      });
    }
    const entity = req.user.entity || "luxembourg";
    const config = await configCacheService.getConfig(entity);
    res.json({
      success: true,
      data: {
        trackingEnabled: config.trackingEnabled,
        trackingFrequencyMinutes: config.trackingFrequencyMinutes,
        trackingHoursStart: config.trackingHoursStart,
        trackingHoursEnd: config.trackingHoursEnd,
        opportunitiesEnabled: config.opportunitiesEnabled,
        opportunitiesRadiusKm: config.opportunitiesRadiusKm
      }
    });
  } catch (error) {
    console.error("\u274C Erreur r\xE9cup\xE9ration config GPS:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la r\xE9cup\xE9ration de la configuration"
    });
  }
});
var gps_track_default = router7;

// server/routes/gps-admin.ts
init_db();
init_schema_gps();
import express7 from "express";
import { eq as eq17, and as and13, gte as gte9, desc as desc8, sql as sql18 } from "drizzle-orm";

// server/services/gps/batchGeocodingService.ts
init_db();
init_schema();
import { sql as sql17, isNull as isNull2, or, and as and12, eq as eq16 } from "drizzle-orm";
var BatchGeocodingService = class {
  isRunning = false;
  currentProgress = {
    total: 0,
    processed: 0,
    success: 0,
    failed: 0,
    skipped: 0,
    startTime: null,
    endTime: null,
    errors: []
  };
  /**
   * Obtenir les statistiques actuelles de géocodage
   */
  async getStats() {
    const total = await db.select({ count: sql17`count(*)` }).from(prospects).then((rows) => Number(rows[0]?.count || 0));
    const geocoded = await db.select({ count: sql17`count(*)` }).from(prospects).where(and12(
      sql17`${prospects.latitude} IS NOT NULL`,
      sql17`${prospects.longitude} IS NOT NULL`
    )).then((rows) => Number(rows[0]?.count || 0));
    const notGeocoded = await db.select({ count: sql17`count(*)` }).from(prospects).where(or(
      isNull2(prospects.latitude),
      isNull2(prospects.longitude)
    )).then((rows) => Number(rows[0]?.count || 0));
    const missingAddress = await db.select({ count: sql17`count(*)` }).from(prospects).where(and12(
      or(isNull2(prospects.ville), eq16(prospects.ville, "")),
      or(isNull2(prospects.latitude), isNull2(prospects.longitude))
    )).then((rows) => Number(rows[0]?.count || 0));
    return {
      total,
      geocoded,
      notGeocoded,
      missingAddress,
      geocodingRate: total > 0 ? (geocoded / total * 100).toFixed(2) : "0.00",
      isRunning: this.isRunning,
      currentProgress: this.currentProgress
    };
  }
  /**
   * Lancer le géocodage batch
   * @param entity - Optionnel : filtrer par entité
   * @param limit - Nombre max de prospects à géocoder
   * @param throttleMs - Délai entre chaque requête (ms)
   */
  async startBatchGeocoding(entity, limit = 100, throttleMs = 1e3) {
    if (this.isRunning) {
      throw new Error("Batch geocoding already running");
    }
    this.isRunning = true;
    this.currentProgress = {
      total: 0,
      processed: 0,
      success: 0,
      failed: 0,
      skipped: 0,
      startTime: /* @__PURE__ */ new Date(),
      endTime: null,
      errors: []
    };
    try {
      const conditions = [
        or(isNull2(prospects.latitude), isNull2(prospects.longitude)),
        sql17`${prospects.ville} IS NOT NULL AND ${prospects.ville} != ''`
      ];
      if (entity) {
        conditions.push(eq16(prospects.entity, entity));
      }
      const prospectsToGeocode = await db.query.prospects.findMany({
        where: and12(...conditions),
        limit,
        orderBy: (prospects3, { desc: desc13 }) => [desc13(prospects3.createdAt)]
      });
      this.currentProgress.total = prospectsToGeocode.length;
      console.log(`[BatchGeocoding] Starting batch geocoding for ${this.currentProgress.total} prospects`);
      for (const prospect of prospectsToGeocode) {
        try {
          const addressParts = [
            prospect.adresse1,
            prospect.codePostal,
            prospect.ville,
            prospect.pays || "France"
          ].filter(Boolean);
          if (addressParts.length < 2) {
            console.warn(`[BatchGeocoding] Skipping prospect ${prospect.id} - insufficient address data`);
            this.currentProgress.skipped++;
            this.currentProgress.processed++;
            continue;
          }
          const fullAddress = addressParts.join(", ");
          const result = await geocodingService.geocode(
            fullAddress,
            prospect.entity,
            prospect.userId
          );
          if (result && result.latitude && result.longitude) {
            await db.update(prospects).set({
              latitude: result.latitude.toString(),
              longitude: result.longitude.toString(),
              geocodedAt: /* @__PURE__ */ new Date(),
              geocodingSource: result.source,
              updatedAt: /* @__PURE__ */ new Date()
            }).where(eq16(prospects.id, prospect.id));
            this.currentProgress.success++;
            console.log(`[BatchGeocoding] \u2713 Geocoded prospect ${prospect.id} via ${result.source}: ${result.latitude}, ${result.longitude}`);
          } else {
            throw new Error("Geocoding returned no coordinates");
          }
        } catch (error) {
          console.error(`[BatchGeocoding] \u2717 Failed to geocode prospect ${prospect.id}:`, error.message);
          this.currentProgress.failed++;
          this.currentProgress.errors.push({
            prospectId: prospect.id,
            error: error.message || "Unknown error"
          });
        }
        this.currentProgress.processed++;
        if (this.currentProgress.processed < this.currentProgress.total) {
          await this.sleep(throttleMs);
        }
      }
      this.currentProgress.endTime = /* @__PURE__ */ new Date();
      console.log(`[BatchGeocoding] Completed: ${this.currentProgress.success} success, ${this.currentProgress.failed} failed, ${this.currentProgress.skipped} skipped`);
      return this.currentProgress;
    } catch (error) {
      console.error("[BatchGeocoding] Fatal error:", error);
      this.currentProgress.endTime = /* @__PURE__ */ new Date();
      throw error;
    } finally {
      this.isRunning = false;
    }
  }
  /**
   * Géocoder un prospect spécifique
   */
  async geocodeSingleProspect(prospectId) {
    const prospect = await db.query.prospects.findFirst({
      where: eq16(prospects.id, prospectId)
    });
    if (!prospect) {
      throw new Error("Prospect not found");
    }
    const addressParts = [
      prospect.adresse1,
      prospect.codePostal,
      prospect.ville,
      prospect.pays || "France"
    ].filter(Boolean);
    if (addressParts.length < 2) {
      throw new Error("Insufficient address data");
    }
    const fullAddress = addressParts.join(", ");
    const result = await geocodingService.geocode(
      fullAddress,
      prospect.entity,
      prospect.userId
    );
    if (!result || !result.latitude || !result.longitude) {
      throw new Error("Geocoding failed");
    }
    await db.update(prospects).set({
      latitude: result.latitude.toString(),
      longitude: result.longitude.toString(),
      geocodedAt: /* @__PURE__ */ new Date(),
      geocodingSource: result.source,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq16(prospects.id, prospectId));
    console.log(`[BatchGeocoding] \u2713 Single geocoded prospect ${prospectId} via ${result.source}: ${result.latitude}, ${result.longitude}`);
    return true;
  }
  /**
   * Annuler le géocodage en cours (soft cancel - attend la fin du prospect actuel)
   */
  cancelBatchGeocoding() {
    if (!this.isRunning) {
      throw new Error("No batch geocoding running");
    }
    console.log("[BatchGeocoding] Cancel requested (will stop after current prospect)");
    this.isRunning = false;
  }
  /**
   * Helper: Sleep
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
};
var batchGeocodingService = new BatchGeocodingService();

// server/routes/gps-admin.ts
import { z as z7 } from "zod";
var router8 = express7.Router();
var updateConfigSchema2 = z7.object({
  trackingEnabled: z7.boolean().optional(),
  trackingFrequencyMinutes: z7.number().int().min(1).max(60).optional(),
  trackingHoursStart: z7.string().regex(/^\d{2}:\d{2}:\d{2}$/).optional(),
  trackingHoursEnd: z7.string().regex(/^\d{2}:\d{2}:\d{2}$/).optional(),
  trackingDays: z7.array(z7.number().int().min(1).max(7)).optional(),
  opportunitiesEnabled: z7.boolean().optional(),
  opportunitiesRadiusKm: z7.string().optional(),
  opportunitiesMinPriority: z7.number().int().min(0).max(100).optional(),
  dataRetentionDays: z7.number().int().min(7).max(365).optional(),
  autoCleanupEnabled: z7.boolean().optional(),
  weeklyReportsEnabled: z7.boolean().optional(),
  weeklyReportsDay: z7.number().int().min(1).max(7).optional(),
  weeklyReportsHour: z7.string().regex(/^\d{2}:\d{2}:\d{2}$/).optional(),
  weeklyReportsRecipients: z7.array(z7.string().email()).optional(),
  geocodingEnabled: z7.boolean().optional(),
  routeOptimizationEnabled: z7.boolean().optional(),
  weatherIntegrationEnabled: z7.boolean().optional()
});
var apiCredentialSchema = z7.object({
  provider: z7.enum(["twilio", "google_maps", "openweather"]),
  entityId: z7.string(),
  apiKey: z7.string(),
  apiSecret: z7.string().optional(),
  additionalConfig: z7.any().optional(),
  isActive: z7.boolean().optional(),
  monthlyQuota: z7.number().int().optional()
});
router8.get("/config/:entity", async (req, res) => {
  try {
    const { entity } = req.params;
    if (!["global", "france", "luxembourg", "belgique"].includes(entity)) {
      return res.status(400).json({
        success: false,
        error: "Entity invalide (global, france, luxembourg, belgique)"
      });
    }
    const config = await configCacheService.getConfig(entity);
    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error(`\u274C Erreur r\xE9cup\xE9ration config GPS ${req.params.entity}:`, error);
    res.status(500).json({
      success: false,
      error: "Erreur serveur"
    });
  }
});
router8.put("/config/:entity", async (req, res) => {
  try {
    const { entity } = req.params;
    if (!["global", "france", "luxembourg", "belgique"].includes(entity)) {
      return res.status(400).json({
        success: false,
        error: "Entity invalide (global, france, luxembourg, belgique)"
      });
    }
    const validatedData = updateConfigSchema2.parse(req.body);
    const [updated] = await db.update(gpsSystemConfig).set({
      ...validatedData,
      updatedAt: /* @__PURE__ */ new Date(),
      updatedBy: req.session.userId
    }).where(eq17(gpsSystemConfig.entityId, entity)).returning();
    configCacheService.invalidate(entity);
    res.json({
      success: true,
      data: updated,
      message: `Configuration GPS ${entity} mise \xE0 jour avec succ\xE8s`
    });
  } catch (error) {
    console.error(`\u274C Erreur MAJ config GPS ${req.params.entity}:`, error);
    if (error instanceof z7.ZodError) {
      return res.status(400).json({
        success: false,
        error: error.errors.map((e) => e.message).join(", ")
      });
    }
    res.status(500).json({
      success: false,
      error: "Erreur lors de la mise \xE0 jour de la configuration"
    });
  }
});
router8.get("/dashboard", async (req, res) => {
  try {
    const { entity, startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3);
    const end = endDate ? new Date(endDate) : /* @__PURE__ */ new Date();
    const positionsQuery = db.select({
      count: sql18`COUNT(*)::int`,
      distinctUsers: sql18`COUNT(DISTINCT user_id)::int`,
      avgAccuracy: sql18`AVG(accuracy)::float`
    }).from(gpsPositions).where(
      and13(
        gte9(gpsPositions.capturedAt, start),
        entity ? eq17(gpsPositions.entity, entity) : void 0
      )
    );
    const opportunitiesQuery = db.select({
      total: sql18`COUNT(*)::int`,
      pending: sql18`COUNT(*) FILTER (WHERE status = 'pending')::int`,
      accepted: sql18`COUNT(*) FILTER (WHERE status = 'accepted')::int`,
      avgPriority: sql18`AVG(priority_score)::float`
    }).from(gpsOpportunities).where(
      and13(
        gte9(gpsOpportunities.detectedAt, start),
        entity ? eq17(gpsOpportunities.entity, entity) : void 0
      )
    );
    const dailyStatsQuery = db.select({
      totalDistance: sql18`SUM(total_distance_km)::float`,
      totalVisits: sql18`SUM(visits_count)::int`,
      avgWorkingHours: sql18`AVG(working_hours)::float`
    }).from(gpsDailyStats).where(
      and13(
        gte9(gpsDailyStats.statDate, start.toISOString().split("T")[0]),
        entity ? eq17(gpsDailyStats.entity, entity) : void 0
      )
    );
    const [positionsStats, opportunitiesStats, dailyStats] = await Promise.all([
      positionsQuery,
      opportunitiesQuery,
      dailyStatsQuery
    ]);
    res.json({
      success: true,
      data: {
        period: { start, end },
        positions: positionsStats[0] || {},
        opportunities: opportunitiesStats[0] || {},
        daily: dailyStats[0] || {}
      }
    });
  } catch (error) {
    console.error("\u274C Erreur dashboard GPS:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la r\xE9cup\xE9ration du dashboard"
    });
  }
});
router8.post("/credentials", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Authentification requise"
      });
    }
    const validatedData = apiCredentialSchema.parse(req.body);
    const encryptedKey = encryptionService.encrypt(validatedData.apiKey);
    const encryptedSecret = validatedData.apiSecret ? encryptionService.encrypt(validatedData.apiSecret) : void 0;
    const [credential] = await db.insert(apiCredentials).values({
      provider: validatedData.provider,
      entityId: validatedData.entityId,
      apiKeyEncrypted: encryptedKey,
      apiSecretEncrypted: encryptedSecret,
      additionalConfig: validatedData.additionalConfig || void 0,
      isActive: validatedData.isActive ?? false,
      monthlyQuota: validatedData.monthlyQuota || void 0,
      createdBy: req.user.id,
      updatedBy: req.user.id
    }).returning();
    const sanitized = {
      ...credential,
      apiKeyEncrypted: "********",
      apiSecretEncrypted: credential.apiSecretEncrypted ? "********" : null
    };
    res.json({
      success: true,
      data: sanitized,
      message: "Credential API cr\xE9\xE9 avec succ\xE8s"
    });
  } catch (error) {
    console.error("\u274C Erreur cr\xE9ation credential API:", error);
    if (error instanceof z7.ZodError) {
      return res.status(400).json({
        success: false,
        error: error.errors.map((e) => e.message).join(", ")
      });
    }
    res.status(500).json({
      success: false,
      error: "Erreur lors de la cr\xE9ation du credential"
    });
  }
});
router8.get("/credentials", async (req, res) => {
  try {
    const credentials = await db.query.apiCredentials.findMany({
      orderBy: [desc8(apiCredentials.createdAt)]
    });
    const sanitized = credentials.map((cred) => ({
      ...cred,
      apiKeyEncrypted: "********",
      apiSecretEncrypted: cred.apiSecretEncrypted ? "********" : null
    }));
    res.json({
      success: true,
      data: sanitized,
      count: credentials.length
    });
  } catch (error) {
    console.error("\u274C Erreur liste credentials:", error);
    res.status(500).json({
      success: false,
      error: "Erreur serveur"
    });
  }
});
router8.get("/geocoding/stats", async (req, res) => {
  try {
    const stats = await batchGeocodingService.getStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error("\u274C Erreur stats g\xE9ocodage:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la r\xE9cup\xE9ration des statistiques"
    });
  }
});
router8.post("/geocoding/batch", async (req, res) => {
  try {
    const { entity, limit = 100, throttleMs = 1e3 } = req.body;
    console.log(`[GPS Admin] Starting batch geocoding - Entity: ${entity || "all"}, Limit: ${limit}`);
    const result = await batchGeocodingService.startBatchGeocoding(
      entity,
      limit,
      throttleMs
    );
    res.json({
      success: true,
      data: result,
      message: `G\xE9ocodage batch termin\xE9: ${result.success} succ\xE8s, ${result.failed} \xE9checs`
    });
  } catch (error) {
    console.error("\u274C Erreur batch geocoding:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Erreur lors du g\xE9ocodage batch"
    });
  }
});
router8.post("/geocoding/:prospectId", async (req, res) => {
  try {
    const { prospectId } = req.params;
    console.log(`[GPS Admin] Geocoding single prospect: ${prospectId}`);
    const success = await batchGeocodingService.geocodeSingleProspect(prospectId);
    res.json({
      success: true,
      data: { prospectId, geocoded: success },
      message: "Prospect g\xE9ocod\xE9 avec succ\xE8s"
    });
  } catch (error) {
    console.error(`\u274C Erreur geocoding prospect ${req.params.prospectId}:`, error);
    res.status(400).json({
      success: false,
      error: error.message || "Erreur lors du g\xE9ocodage"
    });
  }
});
var gps_admin_default = router8;

// server/routes/gps-supervision.ts
init_db();
init_schema_gps();
init_schema();
import express8 from "express";
import { eq as eq18, and as and14, desc as desc9, gte as gte10, sql as sql19 } from "drizzle-orm";
init_storage();
var router9 = express8.Router();
var SUPERVISOR_EMAIL = "kaladjian@adsgroup-security.com";
console.log("[GPS-SUPERVISION] \u{1F4CD} Router supervision GPS charg\xE9 et pr\xEAt");
router9.get("/gps/all-positions", async (req, res) => {
  console.log("[GPS-SUPERVISION] \u{1F3AF} Route /gps/all-positions appel\xE9e");
  try {
    const currentUser = await storage.getUser(req.session.userId);
    if (!currentUser || currentUser.email !== SUPERVISOR_EMAIL) {
      console.warn(`[SUPERVISION] Acc\xE8s refus\xE9: ${currentUser?.email || "anonymous"}`);
      return res.status(403).json({
        error: "Acc\xE8s non autoris\xE9",
        message: "Cette fonctionnalit\xE9 est r\xE9serv\xE9e au pr\xE9sident"
      });
    }
    const { entityId, activeOnly } = req.query;
    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1e3);
    console.log(`[SUPERVISION] Requ\xEAte par ${currentUser.email} - Filtres: entity=${entityId}, activeOnly=${activeOnly}`);
    const lastPositionsSubquery = db.select({
      userId: gpsPositions.userId,
      maxCapturedAt: sql19`MAX(${gpsPositions.capturedAt})`.as("max_captured_at")
    }).from(gpsPositions).where(gte10(gpsPositions.capturedAt, fourHoursAgo)).groupBy(gpsPositions.userId).as("last_positions");
    const baseQuery = db.select({
      position: gpsPositions,
      user: users
    }).from(gpsPositions).innerJoin(
      lastPositionsSubquery,
      and14(
        eq18(gpsPositions.userId, lastPositionsSubquery.userId),
        eq18(gpsPositions.capturedAt, lastPositionsSubquery.maxCapturedAt)
      )
    ).innerJoin(users, eq18(gpsPositions.userId, users.id));
    const results = entityId && typeof entityId === "string" ? await baseQuery.where(eq18(users.entity, entityId)) : await baseQuery;
    console.log(`[SUPERVISION] ${results.length} positions trouv\xE9es`);
    const enrichedResults = await Promise.all(
      results.map(async ({ position, user }) => {
        let address = position.address || "";
        if (!address && position.latitude && position.longitude) {
          try {
            const geocodingResult = await geocodingService.reverseGeocode(
              parseFloat(position.latitude),
              parseFloat(position.longitude),
              user.entity || "global",
              user.id
            );
            address = geocodingResult?.address || `${position.latitude}, ${position.longitude}`;
          } catch (error) {
            console.error(`[SUPERVISION] Geocoding error for user ${user.id}:`, error);
            address = `${position.latitude}, ${position.longitude}`;
          }
        }
        const hoursSinceUpdate = (Date.now() - new Date(position.capturedAt).getTime()) / (1e3 * 60 * 60);
        let status;
        if (hoursSinceUpdate < 1) {
          status = {
            type: "active",
            color: "#10B981",
            label: "Actif",
            hoursSinceUpdate: parseFloat(hoursSinceUpdate.toFixed(1))
          };
        } else if (hoursSinceUpdate < 4) {
          status = {
            type: "inactive",
            color: "#F59E0B",
            label: "Inactif",
            hoursSinceUpdate: parseFloat(hoursSinceUpdate.toFixed(1))
          };
        } else {
          status = {
            type: "offline",
            color: "#6B7280",
            label: "Offline",
            hoursSinceUpdate: parseFloat(hoursSinceUpdate.toFixed(1))
          };
        }
        return {
          userId: user.id,
          email: user.email,
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
          role: user.role || "",
          phone: user.phone || "",
          entity: user.entity || "",
          position: {
            id: position.id,
            latitude: parseFloat(position.latitude),
            longitude: parseFloat(position.longitude),
            accuracy: position.accuracy ? parseFloat(position.accuracy) : null,
            address,
            city: position.city || "",
            batteryLevel: position.batteryLevel || null,
            isCharging: position.isCharging || false,
            capturedAt: position.capturedAt,
            receivedAt: position.receivedAt
          },
          status
        };
      })
    );
    const filteredResults = activeOnly === "true" ? enrichedResults.filter((r) => r.status.type === "active") : enrichedResults;
    try {
      await db.insert(supervisionLogs).values({
        supervisorId: currentUser.id,
        supervisorEmail: currentUser.email,
        action: "view_all_positions",
        targetUserId: null,
        // vue globale
        ipAddress: req.ip || req.socket.remoteAddress || null,
        userAgent: req.headers["user-agent"] || null,
        filtersApplied: {
          entityId: entityId || null,
          activeOnly: activeOnly === "true"
        },
        positionsCount: filteredResults.length
      });
    } catch (logError) {
      console.error("[SUPERVISION] Erreur log RGPD:", logError);
    }
    console.log(`[SUPERVISION] ${filteredResults.length} positions retourn\xE9es`);
    return res.json({
      success: true,
      data: filteredResults,
      meta: {
        total: filteredResults.length,
        activeCount: filteredResults.filter((r) => r.status.type === "active").length,
        inactiveCount: filteredResults.filter((r) => r.status.type === "inactive").length,
        offlineCount: filteredResults.filter((r) => r.status.type === "offline").length,
        filters: {
          entityId: entityId || null,
          activeOnly: activeOnly === "true"
        },
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }
    });
  } catch (error) {
    console.error("[SUPERVISION] Erreur:", error);
    return res.status(500).json({
      error: "Erreur serveur",
      message: error.message || "Impossible de r\xE9cup\xE9rer les positions"
    });
  }
});
router9.get("/gps/logs", async (req, res) => {
  try {
    const currentUser = await storage.getUser(req.session.userId);
    if (!currentUser || currentUser.email !== SUPERVISOR_EMAIL) {
      return res.status(403).json({
        error: "Acc\xE8s non autoris\xE9"
      });
    }
    const { limit = "50" } = req.query;
    const logs = await db.select().from(supervisionLogs).where(eq18(supervisionLogs.supervisorEmail, SUPERVISOR_EMAIL)).orderBy(desc9(supervisionLogs.accessedAt)).limit(parseInt(limit, 10));
    return res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    console.error("[SUPERVISION] Erreur logs:", error);
    return res.status(500).json({
      error: "Erreur serveur",
      message: error.message
    });
  }
});
var gps_supervision_default = router9;

// server/routes/admin-cron.ts
import { Router as Router3 } from "express";

// server/services/cron-service.ts
init_db();
init_schema_gps();
init_schema_competitor();
import * as cron from "node-cron";
import { sql as sql20, desc as desc10, and as and15, eq as eq19, gte as gte11, lte as lte3 } from "drizzle-orm";
async function generateWeeklyReports() {
  console.log("\u{1F4CA} [GPS Weekly Report] Starting...");
  try {
    const endDate = /* @__PURE__ */ new Date();
    endDate.setHours(0, 0, 0, 0);
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 7);
    const configs = await db.select().from(gpsSystemConfig).where(eq19(gpsSystemConfig.weeklyReportsEnabled, true));
    if (configs.length === 0) {
      console.log("\u{1F4CA} [GPS Weekly Report] No configs with weekly reports enabled");
      return;
    }
    let reportsGenerated = 0;
    for (const config of configs) {
      const entityId = config.entityId;
      const positions = await db.select({
        userId: gpsPositions.userId,
        count: sql20`count(*)::int`,
        avgAccuracy: sql20`avg(CAST(${gpsPositions.accuracy} AS DECIMAL))`
      }).from(gpsPositions).where(
        and15(
          eq19(gpsPositions.entity, entityId),
          // ISOLATION ENTITY
          gte11(gpsPositions.capturedAt, startDate),
          lte3(gpsPositions.capturedAt, endDate)
        )
      ).groupBy(gpsPositions.userId);
      for (const pos of positions) {
        const userPositions = await db.select().from(gpsPositions).where(
          and15(
            eq19(gpsPositions.entity, entityId),
            // ISOLATION ENTITY
            eq19(gpsPositions.userId, pos.userId),
            gte11(gpsPositions.capturedAt, startDate),
            lte3(gpsPositions.capturedAt, endDate)
          )
        ).orderBy(desc10(gpsPositions.capturedAt));
        if (userPositions.length === 0) continue;
        let totalDistanceKm = 0;
        for (let i = 1; i < userPositions.length; i++) {
          const prev = userPositions[i - 1];
          const curr = userPositions[i];
          const distance = calculateDistance(
            parseFloat(prev.latitude),
            parseFloat(prev.longitude),
            parseFloat(curr.latitude),
            parseFloat(curr.longitude)
          );
          totalDistanceKm += distance;
        }
        const weekNumber = getWeekNumber(startDate);
        await db.insert(gpsWeeklyReports).values({
          userId: pos.userId,
          entity: entityId,
          // ENTITY CORRECTE
          weekStart: startDate.toISOString().split("T")[0],
          weekEnd: endDate.toISOString().split("T")[0],
          weekNumber,
          year: startDate.getFullYear(),
          totalDistanceKm: totalDistanceKm.toFixed(2),
          totalVisits: userPositions.length
        });
        reportsGenerated++;
      }
    }
    console.log(`\u2705 [GPS Weekly Report] Generated ${reportsGenerated} reports`);
  } catch (error) {
    console.error("\u274C [GPS Weekly Report] Error:", error);
    throw error;
  }
}
async function calculateDailyStats() {
  console.log("\u{1F4C8} [GPS Daily Stats] Starting...");
  try {
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const configs = await db.select().from(gpsSystemConfig);
    let statsCreated = 0;
    for (const config of configs) {
      const entityId = config.entityId;
      const positions = await db.select({
        userId: gpsPositions.userId,
        count: sql20`count(*)::int`,
        avgAccuracy: sql20`avg(CAST(${gpsPositions.accuracy} AS DECIMAL))`
      }).from(gpsPositions).where(
        and15(
          eq19(gpsPositions.entity, entityId),
          // ISOLATION ENTITY
          gte11(gpsPositions.capturedAt, yesterday),
          lte3(gpsPositions.capturedAt, today)
        )
      ).groupBy(gpsPositions.userId);
      for (const pos of positions) {
        const userPositions = await db.select().from(gpsPositions).where(
          and15(
            eq19(gpsPositions.entity, entityId),
            // ISOLATION ENTITY
            eq19(gpsPositions.userId, pos.userId),
            gte11(gpsPositions.capturedAt, yesterday),
            lte3(gpsPositions.capturedAt, today)
          )
        ).orderBy(desc10(gpsPositions.capturedAt));
        if (userPositions.length === 0) continue;
        let distanceKm = 0;
        for (let i = 1; i < userPositions.length; i++) {
          const prev = userPositions[i - 1];
          const curr = userPositions[i];
          distanceKm += calculateDistance(
            parseFloat(prev.latitude),
            parseFloat(prev.longitude),
            parseFloat(curr.latitude),
            parseFloat(curr.longitude)
          );
        }
        const firstPos = userPositions[userPositions.length - 1];
        const lastPos = userPositions[0];
        const workingHours = (lastPos.capturedAt.getTime() - firstPos.capturedAt.getTime()) / (1e3 * 60 * 60);
        await db.insert(gpsDailyStats).values({
          userId: pos.userId,
          entity: entityId,
          // ENTITY CORRECTE
          statDate: yesterday.toISOString().split("T")[0],
          totalDistanceKm: distanceKm.toFixed(2),
          totalDurationMinutes: Math.round(workingHours * 60),
          visitsCount: userPositions.length
        });
        statsCreated++;
      }
    }
    console.log(`\u2705 [GPS Daily Stats] Created ${statsCreated} daily stats`);
  } catch (error) {
    console.error("\u274C [GPS Daily Stats] Error:", error);
    throw error;
  }
}
async function cleanupOldData() {
  console.log("\u{1F5D1}\uFE0F [GPS Cleanup] Starting...");
  try {
    const configs = await db.select().from(gpsSystemConfig).where(sql20`${gpsSystemConfig.dataRetentionDays} IS NOT NULL`);
    let totalDeleted = 0;
    for (const config of configs) {
      const entityId = config.entityId;
      const retentionDays = config.dataRetentionDays || 90;
      const cutoffDate = /* @__PURE__ */ new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
      const result = await db.delete(gpsPositions).where(
        and15(
          eq19(gpsPositions.entity, entityId),
          // ISOLATION ENTITY
          lte3(gpsPositions.capturedAt, cutoffDate)
        )
      );
      console.log(`\u{1F5D1}\uFE0F [GPS Cleanup] Deleted positions older than ${retentionDays} days for entity ${entityId}`);
      totalDeleted++;
    }
    console.log(`\u2705 [GPS Cleanup] Cleanup completed for ${totalDeleted} entities`);
  } catch (error) {
    console.error("\u274C [GPS Cleanup] Error:", error);
    throw error;
  }
}
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
function toRad(degrees) {
  return degrees * (Math.PI / 180);
}
function getWeekNumber(date5) {
  const d = new Date(Date.UTC(date5.getFullYear(), date5.getMonth(), date5.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 864e5 + 1) / 7);
}
async function wakeupFutureContracts() {
  console.log("\u23F0 [COMPETITOR WAKEUP] R\xE9veil \xE9ch\xE9ances du jour...");
  try {
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const situationsToWakeup = await db.select().from(concurrentSituations).where(
      and15(
        eq19(concurrentSituations.status, "future"),
        eq19(concurrentSituations.wakeupDate, today)
      )
    );
    if (situationsToWakeup.length === 0) {
      console.log("\u23F0 [COMPETITOR WAKEUP] Aucune \xE9ch\xE9ance \xE0 r\xE9veiller aujourd'hui");
      return;
    }
    let wokenUp = 0;
    for (const situation of situationsToWakeup) {
      await db.update(concurrentSituations).set({
        status: "active",
        attemptNumber: (situation.attemptNumber || 0) + 1
      }).where(eq19(concurrentSituations.id, situation.id));
      wokenUp++;
    }
    console.log(`\u2705 [COMPETITOR WAKEUP] ${wokenUp} \xE9ch\xE9ances r\xE9veill\xE9es (future \u2192 active)`);
  } catch (error) {
    console.error("\u274C [COMPETITOR WAKEUP] Erreur:", error);
    throw error;
  }
}
async function generateProgressiveAlerts() {
  console.log("\u{1F6A8} [COMPETITOR ALERTS] G\xE9n\xE9ration alertes progressives...");
  try {
    const alertThresholds = [180, 90, 60, 30, 15, 7];
    const today = /* @__PURE__ */ new Date();
    let alertsCreated = 0;
    for (const daysBeforeExpiry of alertThresholds) {
      const targetDate = new Date(today);
      targetDate.setDate(targetDate.getDate() + daysBeforeExpiry);
      const targetDateStr = targetDate.toISOString().split("T")[0];
      const situationsNeedingAlert = await db.select().from(concurrentSituations).where(
        and15(
          eq19(concurrentSituations.status, "active"),
          eq19(concurrentSituations.contractEndDate, targetDateStr)
        )
      );
      for (const situation of situationsNeedingAlert) {
        const existingAlert = await db.select().from(competitorAlerts).where(
          and15(
            eq19(competitorAlerts.situationId, situation.id),
            eq19(competitorAlerts.daysBeforeEnd, daysBeforeExpiry)
          )
        ).limit(1);
        if (existingAlert.length === 0) {
          await db.insert(competitorAlerts).values({
            entity: situation.entity,
            targetUserId: situation.detectedBy,
            situationId: situation.id,
            alertType: daysBeforeExpiry === 180 ? "j180" : daysBeforeExpiry === 90 ? "j90" : daysBeforeExpiry === 60 ? "j60" : daysBeforeExpiry === 30 ? "j30" : daysBeforeExpiry === 15 ? "j15" : "j7",
            alertDate: today.toISOString().split("T")[0],
            daysBeforeEnd: daysBeforeExpiry
          });
          alertsCreated++;
        }
      }
    }
    console.log(`\u2705 [COMPETITOR ALERTS] ${alertsCreated} alertes cr\xE9\xE9es`);
  } catch (error) {
    console.error("\u274C [COMPETITOR ALERTS] Erreur:", error);
    throw error;
  }
}
async function detectCompanyEvents() {
  console.log("\u{1F4F0} [COMPANY EVENTS] D\xE9tection \xE9v\xE9nements entreprise...");
  try {
    console.log("\u26A0\uFE0F [COMPANY EVENTS] Int\xE9gration BODACC/INSEE \xE0 venir");
    console.log("\u2139\uFE0F [COMPANY EVENTS] N\xE9cessite configuration APIs externes");
  } catch (error) {
    console.error("\u274C [COMPANY EVENTS] Erreur:", error);
    throw error;
  }
}
async function calculateRebouclageStats() {
  console.log("\u{1F4CA} [REBOUCLAGE STATS] Calcul statistiques...");
  try {
    const totalSituations = await db.select({ count: sql20`count(*)::int` }).from(concurrentSituations);
    const wonSituations = await db.select({ count: sql20`count(*)::int` }).from(concurrentSituations).where(eq19(concurrentSituations.status, "won"));
    const lostSituations = await db.select({ count: sql20`count(*)::int` }).from(concurrentSituations).where(eq19(concurrentSituations.status, "lost"));
    const activeSituations = await db.select({ count: sql20`count(*)::int` }).from(concurrentSituations).where(eq19(concurrentSituations.status, "active"));
    const total = totalSituations[0]?.count || 0;
    const won = wonSituations[0]?.count || 0;
    const lost = lostSituations[0]?.count || 0;
    const active = activeSituations[0]?.count || 0;
    const conversionRate = total > 0 ? (won / total * 100).toFixed(2) : "0.00";
    console.log(`\u{1F4CA} [REBOUCLAGE STATS] Total: ${total} | Won: ${won} | Lost: ${lost} | Active: ${active} | Taux: ${conversionRate}%`);
  } catch (error) {
    console.error("\u274C [REBOUCLAGE STATS] Erreur:", error);
    throw error;
  }
}
var CronService = class {
  static jobs = [];
  /**
   * Initialise tous les jobs CRON
   */
  static initialize() {
    console.log("\u{1F550} Initialisation CRON Service...");
    const weeklyReportJob = cron.schedule(
      "0 8 * * 1",
      async () => {
        console.log("\u{1F4CA} [CRON] G\xE9n\xE9ration rapports hebdomadaires...");
        try {
          await generateWeeklyReports();
          console.log("\u2705 [CRON] Rapports hebdomadaires g\xE9n\xE9r\xE9s");
        } catch (error) {
          console.error("\u274C [CRON] Erreur rapports hebdomadaires:", error);
        }
      },
      {
        timezone: "Europe/Paris"
      }
    );
    const dailyStatsJob = cron.schedule(
      "0 23 * * *",
      async () => {
        console.log("\u{1F4C8} [CRON] Calcul stats quotidiennes...");
        try {
          await calculateDailyStats();
          console.log("\u2705 [CRON] Stats quotidiennes calcul\xE9es");
        } catch (error) {
          console.error("\u274C [CRON] Erreur stats quotidiennes:", error);
        }
      },
      {
        timezone: "Europe/Paris"
      }
    );
    const cleanupJob = cron.schedule(
      "0 2 * * *",
      async () => {
        console.log("\u{1F5D1}\uFE0F [CRON] Nettoyage donn\xE9es anciennes...");
        try {
          await cleanupOldData();
          console.log("\u2705 [CRON] Nettoyage effectu\xE9");
        } catch (error) {
          console.error("\u274C [CRON] Erreur nettoyage:", error);
        }
      },
      {
        timezone: "Europe/Paris"
      }
    );
    const competitorWakeupJob = cron.schedule(
      "0 8 * * *",
      async () => {
        console.log("\u23F0 [CRON] R\xE9veil \xE9ch\xE9ances concurrent...");
        try {
          await wakeupFutureContracts();
          console.log("\u2705 [CRON] R\xE9veil \xE9ch\xE9ances effectu\xE9");
        } catch (error) {
          console.error("\u274C [CRON] Erreur r\xE9veil \xE9ch\xE9ances:", error);
        }
      },
      {
        timezone: "Europe/Paris"
      }
    );
    const competitorAlertsJob = cron.schedule(
      "0 9 * * *",
      async () => {
        console.log("\u{1F6A8} [CRON] G\xE9n\xE9ration alertes progressives...");
        try {
          await generateProgressiveAlerts();
          console.log("\u2705 [CRON] Alertes progressives g\xE9n\xE9r\xE9es");
        } catch (error) {
          console.error("\u274C [CRON] Erreur alertes progressives:", error);
        }
      },
      {
        timezone: "Europe/Paris"
      }
    );
    const companyEventsJob = cron.schedule(
      "0 6 * * *",
      async () => {
        console.log("\u{1F4F0} [CRON] D\xE9tection \xE9v\xE9nements entreprise...");
        try {
          await detectCompanyEvents();
          console.log("\u2705 [CRON] D\xE9tection \xE9v\xE9nements effectu\xE9e");
        } catch (error) {
          console.error("\u274C [CRON] Erreur d\xE9tection \xE9v\xE9nements:", error);
        }
      },
      {
        timezone: "Europe/Paris"
      }
    );
    const rebouclageStatsJob = cron.schedule(
      "0 22 * * *",
      async () => {
        console.log("\u{1F4CA} [CRON] Calcul stats rebouclage...");
        try {
          await calculateRebouclageStats();
          console.log("\u2705 [CRON] Stats rebouclage calcul\xE9es");
        } catch (error) {
          console.error("\u274C [CRON] Erreur stats rebouclage:", error);
        }
      },
      {
        timezone: "Europe/Paris"
      }
    );
    this.jobs.push(
      { task: weeklyReportJob, name: "weekly" },
      { task: dailyStatsJob, name: "daily" },
      { task: cleanupJob, name: "cleanup" },
      { task: competitorWakeupJob, name: "competitor_wakeup" },
      { task: competitorAlertsJob, name: "competitor_alerts" },
      { task: companyEventsJob, name: "company_events" },
      { task: rebouclageStatsJob, name: "rebouclage_stats" }
    );
    console.log("\u2705 CRON Service initialis\xE9 avec 7 jobs");
    console.log("  - Rapports hebdo GPS : Lundi 8h");
    console.log("  - Stats quotidiennes GPS : Tous les jours 23h");
    console.log("  - Nettoyage GPS : Tous les jours 2h");
    console.log("  - R\xE9veil \xE9ch\xE9ances : Tous les jours 8h");
    console.log("  - Alertes progressives : Tous les jours 9h");
    console.log("  - \xC9v\xE9nements entreprise : Tous les jours 6h");
    console.log("  - Stats rebouclage : Tous les jours 22h");
  }
  /**
   * Arrête tous les jobs CRON (pour tests ou shutdown graceful)
   */
  static stopAll() {
    console.log("\u{1F6D1} Arr\xEAt de tous les jobs CRON...");
    this.jobs.forEach((job) => job.task.stop());
    this.jobs = [];
    console.log("\u2705 Tous les jobs CRON arr\xEAt\xE9s");
  }
  /**
   * Redémarre tous les jobs CRON
   */
  static restartAll() {
    console.log("\u{1F504} Red\xE9marrage jobs CRON...");
    this.stopAll();
    this.initialize();
  }
  /**
   * Statut des jobs CRON
   */
  static getStatus() {
    return {
      totalJobs: this.jobs.length,
      runningJobs: this.jobs.length,
      jobs: [
        {
          name: "Rapports hebdomadaires GPS",
          schedule: "Lundi 8h Europe/Paris",
          cron: "0 8 * * 1",
          nextRun: "Calcul\xE9 par node-cron"
        },
        {
          name: "Stats quotidiennes GPS",
          schedule: "Tous les jours 23h Europe/Paris",
          cron: "0 23 * * *",
          nextRun: "Calcul\xE9 par node-cron"
        },
        {
          name: "Nettoyage donn\xE9es GPS",
          schedule: "Tous les jours 2h Europe/Paris",
          cron: "0 2 * * *",
          nextRun: "Calcul\xE9 par node-cron"
        },
        {
          name: "R\xE9veil \xE9ch\xE9ances concurrent",
          schedule: "Tous les jours 8h Europe/Paris",
          cron: "0 8 * * *",
          nextRun: "Calcul\xE9 par node-cron"
        },
        {
          name: "Alertes progressives concurrent",
          schedule: "Tous les jours 9h Europe/Paris",
          cron: "0 9 * * *",
          nextRun: "Calcul\xE9 par node-cron"
        },
        {
          name: "D\xE9tection \xE9v\xE9nements entreprise",
          schedule: "Tous les jours 6h Europe/Paris",
          cron: "0 6 * * *",
          nextRun: "Calcul\xE9 par node-cron"
        },
        {
          name: "Statistiques rebouclage",
          schedule: "Tous les jours 22h Europe/Paris",
          cron: "0 22 * * *",
          nextRun: "Calcul\xE9 par node-cron"
        }
      ]
    };
  }
  /**
   * Déclencher manuellement un job (pour tests)
   */
  static async triggerManually(jobName) {
    console.log(`\u{1F527} [CRON] D\xE9clenchement manuel : ${jobName}`);
    try {
      switch (jobName) {
        case "weekly":
          await generateWeeklyReports();
          break;
        case "daily":
          await calculateDailyStats();
          break;
        case "cleanup":
          await cleanupOldData();
          break;
        case "competitor_wakeup":
          await wakeupFutureContracts();
          break;
        case "competitor_alerts":
          await generateProgressiveAlerts();
          break;
        case "company_events":
          await detectCompanyEvents();
          break;
        case "rebouclage_stats":
          await calculateRebouclageStats();
          break;
      }
      console.log(`\u2705 [CRON] Job ${jobName} ex\xE9cut\xE9 manuellement`);
      return { success: true };
    } catch (error) {
      console.error(`\u274C [CRON] Erreur job ${jobName}:`, error);
      throw error;
    }
  }
};
var cron_service_default = CronService;

// server/routes/admin-cron.ts
var router10 = Router3();
router10.get("/status", (req, res) => {
  try {
    const status = cron_service_default.getStatus();
    res.json({
      success: true,
      data: status,
      message: "Statut CRON r\xE9cup\xE9r\xE9 avec succ\xE8s"
    });
  } catch (error) {
    console.error("\u274C Erreur r\xE9cup\xE9ration statut CRON:", error);
    res.status(500).json({
      success: false,
      error: "Erreur r\xE9cup\xE9ration statut CRON",
      details: error.message
    });
  }
});
router10.post("/trigger/:jobName", async (req, res) => {
  const { jobName } = req.params;
  if (!["weekly", "daily", "cleanup"].includes(jobName)) {
    return res.status(400).json({
      success: false,
      error: "Job invalide",
      allowedJobs: ["weekly", "daily", "cleanup"]
    });
  }
  try {
    await cron_service_default.triggerManually(jobName);
    res.json({
      success: true,
      message: `Job ${jobName} d\xE9clench\xE9 manuellement avec succ\xE8s`
    });
  } catch (error) {
    console.error(`\u274C Erreur d\xE9clenchement job ${jobName}:`, error);
    res.status(500).json({
      success: false,
      error: `Erreur d\xE9clenchement job ${jobName}`,
      details: error.message
    });
  }
});
router10.post("/restart", (req, res) => {
  try {
    cron_service_default.restartAll();
    res.json({
      success: true,
      message: "Tous les jobs CRON red\xE9marr\xE9s avec succ\xE8s"
    });
  } catch (error) {
    console.error("\u274C Erreur red\xE9marrage CRON:", error);
    res.status(500).json({
      success: false,
      error: "Erreur red\xE9marrage CRON",
      details: error.message
    });
  }
});
var admin_cron_default = router10;

// server/routes/opportunities.ts
import { Router as Router4 } from "express";
init_schema();
init_db();
init_schema();
import { eq as eq20, and as and16, sql as sql21, desc as desc11 } from "drizzle-orm";
var router11 = Router4();
router11.post("/", isAuthenticated, async (req, res) => {
  try {
    const validatedData = insertOpportunitySchema.parse({
      ...req.body,
      entity: req.session.entity,
      userId: req.session.userId,
      createdBy: req.session.userId
    });
    const [newOpportunity] = await db.insert(opportunities).values(validatedData).returning();
    await db.insert(opportunityActivities).values({
      opportunityId: newOpportunity.id,
      userId: req.session.userId,
      activityType: "created",
      activityTitle: "Opportunit\xE9 cr\xE9\xE9e",
      activityDescription: `Cr\xE9ation de l'opportunit\xE9 ${newOpportunity.title}`
    });
    res.json({
      success: true,
      opportunity: newOpportunity
    });
  } catch (error) {
    console.error("Error creating opportunity:", error);
    res.status(400).json({
      error: "Erreur lors de la cr\xE9ation de l'opportunit\xE9",
      details: error.message
    });
  }
});
router11.get("/", isAuthenticated, async (req, res) => {
  try {
    const {
      status,
      stage,
      temperature,
      userId,
      requalificationRequired,
      limit = "50",
      offset = "0"
    } = req.query;
    const conditions = [
      eq20(opportunities.entity, req.session.entity),
      sql21`${opportunities.deletedAt} IS NULL`
    ];
    if (status) {
      conditions.push(eq20(opportunities.status, status));
    }
    if (stage) {
      conditions.push(eq20(opportunities.stage, stage));
    }
    if (temperature) {
      conditions.push(eq20(opportunities.temperature, temperature));
    }
    if (userId) {
      conditions.push(eq20(opportunities.userId, userId));
    }
    if (requalificationRequired === "true") {
      conditions.push(eq20(opportunities.requalificationRequired, true));
    }
    const results = await db.select().from(opportunities).where(and16(...conditions)).orderBy(desc11(opportunities.score), desc11(opportunities.createdAt)).limit(parseInt(limit)).offset(parseInt(offset));
    const totalCount = await db.select({ count: sql21`count(*)` }).from(opportunities).where(and16(...conditions));
    res.json({
      success: true,
      opportunities: results,
      total: totalCount[0]?.count || 0,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error("Error fetching opportunities:", error);
    res.status(500).json({
      error: "Erreur lors de la r\xE9cup\xE9ration des opportunit\xE9s",
      details: error.message
    });
  }
});
router11.get("/dashboard/commercial", isAuthenticated, async (req, res) => {
  try {
    const userId = req.query.userId || req.session.userId;
    const byTemperature = await db.select({
      temperature: opportunities.temperature,
      count: sql21`count(*)`,
      totalValue: sql21`SUM(COALESCE(${opportunities.monthlySubscription}, 0))`
    }).from(opportunities).where(
      and16(
        eq20(opportunities.userId, userId),
        eq20(opportunities.entity, req.session.entity),
        eq20(opportunities.status, "active"),
        sql21`${opportunities.deletedAt} IS NULL`
      )
    ).groupBy(opportunities.temperature);
    const byStage = await db.select({
      stage: opportunities.stage,
      count: sql21`count(*)`
    }).from(opportunities).where(
      and16(
        eq20(opportunities.userId, userId),
        eq20(opportunities.entity, req.session.entity),
        eq20(opportunities.status, "active"),
        sql21`${opportunities.deletedAt} IS NULL`
      )
    ).groupBy(opportunities.stage);
    const hotOpportunities = await db.select().from(opportunities).where(
      and16(
        eq20(opportunities.userId, userId),
        eq20(opportunities.entity, req.session.entity),
        eq20(opportunities.temperature, "HOT"),
        eq20(opportunities.status, "active"),
        sql21`${opportunities.deletedAt} IS NULL`
      )
    ).orderBy(desc11(opportunities.score)).limit(10);
    const toRequalify = await db.select().from(opportunities).where(
      and16(
        eq20(opportunities.userId, userId),
        eq20(opportunities.entity, req.session.entity),
        eq20(opportunities.requalificationRequired, true),
        eq20(opportunities.status, "active"),
        sql21`${opportunities.deletedAt} IS NULL`
      )
    ).orderBy(desc11(opportunities.daysInHector)).limit(10);
    const stats = await db.select({
      total: sql21`count(*)`,
      avgScore: sql21`AVG(${opportunities.score})`,
      avgDaysInHector: sql21`AVG(${opportunities.daysInHector})`,
      totalPipeline: sql21`SUM(COALESCE(${opportunities.monthlySubscription}, 0))`
    }).from(opportunities).where(
      and16(
        eq20(opportunities.userId, userId),
        eq20(opportunities.entity, req.session.entity),
        eq20(opportunities.status, "active"),
        sql21`${opportunities.deletedAt} IS NULL`
      )
    );
    res.json({
      success: true,
      byTemperature,
      byStage,
      hotOpportunities,
      toRequalify,
      stats: stats[0] || {}
    });
  } catch (error) {
    console.error("Error fetching commercial dashboard:", error);
    res.status(500).json({
      error: "Erreur lors de la r\xE9cup\xE9ration du dashboard",
      details: error.message
    });
  }
});
router11.get("/dashboard/manager", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const byUser = await db.select({
      userId: opportunities.userId,
      userEmail: users.email,
      userFirstName: users.firstName,
      userLastName: users.lastName,
      count: sql21`count(*)`,
      hotCount: sql21`SUM(CASE WHEN ${opportunities.temperature} = 'HOT' THEN 1 ELSE 0 END)`,
      warmCount: sql21`SUM(CASE WHEN ${opportunities.temperature} = 'WARM' THEN 1 ELSE 0 END)`,
      coldCount: sql21`SUM(CASE WHEN ${opportunities.temperature} = 'COLD' THEN 1 ELSE 0 END)`,
      avgScore: sql21`AVG(${opportunities.score})`,
      totalPipeline: sql21`SUM(COALESCE(${opportunities.monthlySubscription}, 0))`
    }).from(opportunities).leftJoin(users, eq20(opportunities.userId, users.id)).where(
      and16(
        eq20(opportunities.entity, req.session.entity),
        eq20(opportunities.status, "active"),
        sql21`${opportunities.deletedAt} IS NULL`
      )
    ).groupBy(opportunities.userId, users.email, users.firstName, users.lastName);
    const temperatureDistribution = await db.select({
      temperature: opportunities.temperature,
      count: sql21`count(*)`
    }).from(opportunities).where(
      and16(
        eq20(opportunities.entity, req.session.entity),
        eq20(opportunities.status, "active"),
        sql21`${opportunities.deletedAt} IS NULL`
      )
    ).groupBy(opportunities.temperature);
    const criticalOpportunities = await db.select().from(opportunities).where(
      and16(
        eq20(opportunities.entity, req.session.entity),
        eq20(opportunities.status, "active"),
        sql21`${opportunities.score} < 40`,
        sql21`${opportunities.daysInHector} > 7`,
        sql21`${opportunities.deletedAt} IS NULL`
      )
    ).orderBy(desc11(opportunities.daysInHector)).limit(20);
    res.json({
      success: true,
      byUser,
      temperatureDistribution,
      criticalOpportunities
    });
  } catch (error) {
    console.error("Error fetching manager dashboard:", error);
    res.status(500).json({
      error: "Erreur lors de la r\xE9cup\xE9ration du dashboard manager",
      details: error.message
    });
  }
});
router11.get("/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const [opportunity] = await db.select().from(opportunities).where(
      and16(
        eq20(opportunities.id, id),
        eq20(opportunities.entity, req.session.entity),
        sql21`${opportunities.deletedAt} IS NULL`
      )
    );
    if (!opportunity) {
      return res.status(404).json({
        error: "Opportunit\xE9 non trouv\xE9e"
      });
    }
    const activities = await db.select().from(opportunityActivities).where(eq20(opportunityActivities.opportunityId, id)).orderBy(desc11(opportunityActivities.createdAt)).limit(20);
    const notes = await db.select().from(opportunityNotes).where(eq20(opportunityNotes.opportunityId, id)).orderBy(desc11(opportunityNotes.createdAt));
    const scoringHistory = await db.select().from(opportunityScoringHistory).where(eq20(opportunityScoringHistory.opportunityId, id)).orderBy(desc11(opportunityScoringHistory.calculatedAt)).limit(10);
    res.json({
      success: true,
      opportunity,
      activities,
      notes,
      scoringHistory
    });
  } catch (error) {
    console.error("Error fetching opportunity:", error);
    res.status(500).json({
      error: "Erreur lors de la r\xE9cup\xE9ration de l'opportunit\xE9",
      details: error.message
    });
  }
});
var updateOpportunitySchema = insertOpportunitySchema.partial().pick({
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
  lostReason: true
}).strict();
router11.patch("/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = updateOpportunitySchema.parse(req.body);
    const [existing] = await db.select().from(opportunities).where(
      and16(
        eq20(opportunities.id, id),
        eq20(opportunities.entity, req.session.entity)
      )
    );
    if (!existing) {
      return res.status(404).json({
        error: "Opportunit\xE9 non trouv\xE9e"
      });
    }
    const [updated] = await db.update(opportunities).set({
      ...validatedData,
      updatedAt: /* @__PURE__ */ new Date(),
      lastModifiedBy: req.session.userId
    }).where(eq20(opportunities.id, id)).returning();
    await db.insert(opportunityActivities).values({
      opportunityId: id,
      userId: req.session.userId,
      activityType: "updated",
      activityTitle: "Opportunit\xE9 modifi\xE9e",
      activityDescription: `Mise \xE0 jour de l'opportunit\xE9`,
      activityData: validatedData
    });
    res.json({
      success: true,
      opportunity: updated
    });
  } catch (error) {
    console.error("Error updating opportunity:", error);
    res.status(500).json({
      error: "Erreur lors de la mise \xE0 jour",
      details: error.message
    });
  }
});
router11.delete("/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const [deleted] = await db.update(opportunities).set({
      deletedAt: /* @__PURE__ */ new Date(),
      status: "lost"
    }).where(
      and16(
        eq20(opportunities.id, id),
        eq20(opportunities.entity, req.session.entity)
      )
    ).returning();
    if (!deleted) {
      return res.status(404).json({
        error: "Opportunit\xE9 non trouv\xE9e"
      });
    }
    await db.insert(opportunityActivities).values({
      opportunityId: id,
      userId: req.session.userId,
      activityType: "deleted",
      activityTitle: "Opportunit\xE9 supprim\xE9e"
    });
    res.json({
      success: true,
      message: "Opportunit\xE9 supprim\xE9e"
    });
  } catch (error) {
    console.error("Error deleting opportunity:", error);
    res.status(500).json({
      error: "Erreur lors de la suppression",
      details: error.message
    });
  }
});
router11.post("/:id/activities", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = insertOpportunityActivitySchema.parse({
      ...req.body,
      opportunityId: id,
      userId: req.session.userId
    });
    const [activity] = await db.insert(opportunityActivities).values(validatedData).returning();
    await db.update(opportunities).set({
      lastActivityDate: /* @__PURE__ */ new Date(),
      activitiesCount: sql21`${opportunities.activitiesCount} + 1`
    }).where(eq20(opportunities.id, id));
    res.json({
      success: true,
      activity
    });
  } catch (error) {
    console.error("Error creating activity:", error);
    res.status(400).json({
      error: "Erreur lors de la cr\xE9ation de l'activit\xE9",
      details: error.message
    });
  }
});
router11.get("/:id/activities", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const activities = await db.select().from(opportunityActivities).where(eq20(opportunityActivities.opportunityId, id)).orderBy(desc11(opportunityActivities.createdAt));
    res.json({
      success: true,
      activities
    });
  } catch (error) {
    console.error("Error fetching activities:", error);
    res.status(500).json({
      error: "Erreur lors de la r\xE9cup\xE9ration des activit\xE9s",
      details: error.message
    });
  }
});
router11.post("/:id/notes", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = insertOpportunityNoteSchema.parse({
      ...req.body,
      opportunityId: id,
      userId: req.session.userId
    });
    const [note] = await db.insert(opportunityNotes).values(validatedData).returning();
    res.json({
      success: true,
      note
    });
  } catch (error) {
    console.error("Error creating note:", error);
    res.status(400).json({
      error: "Erreur lors de la cr\xE9ation de la note",
      details: error.message
    });
  }
});
router11.get("/:id/notes", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const notes = await db.select().from(opportunityNotes).where(eq20(opportunityNotes.opportunityId, id)).orderBy(desc11(opportunityNotes.createdAt));
    res.json({
      success: true,
      notes
    });
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({
      error: "Erreur lors de la r\xE9cup\xE9ration des notes",
      details: error.message
    });
  }
});
router11.post("/objectives", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const validatedData = insertSalesObjectiveSchema.parse({
      ...req.body,
      entity: req.session.entity,
      createdBy: req.session.userId
    });
    const [objective] = await db.insert(salesObjectives).values(validatedData).returning();
    res.json({
      success: true,
      objective
    });
  } catch (error) {
    console.error("Error creating objective:", error);
    res.status(400).json({
      error: "Erreur lors de la cr\xE9ation de l'objectif",
      details: error.message
    });
  }
});
router11.get("/objectives", isAuthenticated, async (req, res) => {
  try {
    const { level, userId } = req.query;
    const conditions = [eq20(salesObjectives.entity, req.session.entity)];
    if (level) {
      conditions.push(eq20(salesObjectives.level, level));
    }
    if (userId) {
      conditions.push(eq20(salesObjectives.userId, userId));
    }
    const objectives = await db.select().from(salesObjectives).where(and16(...conditions)).orderBy(desc11(salesObjectives.createdAt));
    res.json({
      success: true,
      objectives
    });
  } catch (error) {
    console.error("Error fetching objectives:", error);
    res.status(500).json({
      error: "Erreur lors de la r\xE9cup\xE9ration des objectifs",
      details: error.message
    });
  }
});
router11.post("/trigger-worker", isAuthenticated, async (req, res) => {
  try {
    const { opportunityId, workerType } = req.body;
    if (!opportunityId || !workerType) {
      return res.status(400).json({
        error: "opportunityId et workerType sont requis"
      });
    }
    const validWorkerTypes = ["cascade", "disc", "gps"];
    if (!validWorkerTypes.includes(workerType)) {
      return res.status(400).json({
        error: "workerType invalide",
        allowedTypes: validWorkerTypes
      });
    }
    const [opportunity] = await db.select().from(opportunities).where(
      and16(
        eq20(opportunities.id, opportunityId),
        eq20(opportunities.entity, req.session.entity),
        sql21`${opportunities.deletedAt} IS NULL`
      )
    );
    if (!opportunity) {
      return res.status(404).json({
        error: "Opportunit\xE9 non trouv\xE9e"
      });
    }
    const boss = prospectionQueue.getBoss();
    console.log("[TRIGGER-WORKER] boss:", boss ? "OK" : "NULL");
    if (!boss) {
      return res.status(500).json({
        error: "Queue non disponible"
      });
    }
    const queueNames = {
      "cascade": "opp-cascade-enrichment",
      "disc": "opp-disc-profiling",
      "gps": "opp-gps-geocoding"
    };
    const queueName = queueNames[workerType];
    console.log("[TRIGGER-WORKER] queueName:", queueName);
    try {
      await boss.createQueue(queueName, {
        retryLimit: 3,
        retryDelay: 60,
        retryBackoff: true
      });
      console.log("[TRIGGER-WORKER] Queue created/verified:", queueName);
    } catch (createError) {
      console.log("[TRIGGER-WORKER] Queue may already exist:", queueName);
    }
    let jobId;
    try {
      jobId = await boss.send(queueName, {
        opportunityId,
        userId: req.session.userId
      }, {
        retryLimit: 3,
        retryDelay: 60,
        retryBackoff: true
      });
      console.log("[TRIGGER-WORKER] jobId:", jobId);
    } catch (sendError) {
      console.error("[TRIGGER-WORKER] ERROR calling boss.send():", sendError);
      console.error("[TRIGGER-WORKER] ERROR stack:", sendError.stack);
      return res.status(500).json({
        error: "Erreur lors de l'enqueue du worker",
        details: sendError.message
      });
    }
    res.status(202).json({
      success: true,
      jobId,
      message: `Worker ${workerType} enqueu\xE9 pour opportunit\xE9 ${opportunityId}`
    });
  } catch (error) {
    console.error("Error triggering worker:", error);
    res.status(500).json({
      error: "Erreur lors du d\xE9clenchement du worker",
      details: error.message
    });
  }
});
var opportunities_default = router11;

// server/routes/competitor.ts
import { Router as Router5 } from "express";
init_db();
init_schema();
import { eq as eq21, and as and17, sql as sql22, desc as desc12, inArray as inArray5, not, count as count3 } from "drizzle-orm";
var router12 = Router5();
router12.get("/concurrents", isAuthenticated, async (req, res) => {
  try {
    const { type, isActive } = req.query;
    const conditions = [];
    if (type) {
      conditions.push(eq21(concurrents.type, type));
    }
    if (isActive === "true") {
      conditions.push(eq21(concurrents.isActive, true));
    }
    const results = await db.select().from(concurrents).where(conditions.length > 0 ? and17(...conditions) : void 0).orderBy(desc12(concurrents.estimatedMarketSharePercent));
    res.json({
      success: true,
      concurrents: results,
      total: results.length
    });
  } catch (error) {
    console.error("Error fetching concurrents:", error);
    res.status(500).json({
      error: "Erreur lors de la r\xE9cup\xE9ration des concurrents",
      details: error.message
    });
  }
});
router12.get("/concurrents/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const [concurrent] = await db.select().from(concurrents).where(eq21(concurrents.id, id));
    if (!concurrent) {
      return res.status(404).json({
        error: "Concurrent non trouv\xE9"
      });
    }
    res.json({
      success: true,
      concurrent
    });
  } catch (error) {
    console.error("Error fetching concurrent:", error);
    res.status(500).json({
      error: "Erreur lors de la r\xE9cup\xE9ration du concurrent",
      details: error.message
    });
  }
});
router12.post("/concurrents", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const validatedData = insertConcurrentSchema.parse(req.body);
    const [newConcurrent] = await db.insert(concurrents).values(validatedData).returning();
    res.json({
      success: true,
      concurrent: newConcurrent
    });
  } catch (error) {
    console.error("Error creating concurrent:", error);
    res.status(400).json({
      error: "Erreur lors de la cr\xE9ation du concurrent",
      details: error.message
    });
  }
});
router12.patch("/concurrents/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = insertConcurrentSchema.partial().parse(req.body);
    const [updatedConcurrent] = await db.update(concurrents).set(validatedData).where(eq21(concurrents.id, id)).returning();
    if (!updatedConcurrent) {
      return res.status(404).json({
        error: "Concurrent non trouv\xE9"
      });
    }
    res.json({
      success: true,
      concurrent: updatedConcurrent
    });
  } catch (error) {
    console.error("Error updating concurrent:", error);
    res.status(400).json({
      error: "Erreur lors de la modification du concurrent",
      details: error.message
    });
  }
});
router12.delete("/concurrents/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const situationsCount = await db.select({ count: count3() }).from(concurrentSituations).where(eq21(concurrentSituations.concurrentId, id));
    if (situationsCount[0].count > 0) {
      return res.status(400).json({
        error: `Impossible de supprimer ce concurrent : ${situationsCount[0].count} situation(s) associ\xE9e(s)`,
        canDelete: false
      });
    }
    await db.delete(concurrents).where(eq21(concurrents.id, id));
    res.json({
      success: true,
      message: "Concurrent supprim\xE9 avec succ\xE8s"
    });
  } catch (error) {
    console.error("Error deleting concurrent:", error);
    res.status(500).json({
      error: "Erreur lors de la suppression du concurrent",
      details: error.message
    });
  }
});
router12.post("/situations", isAuthenticated, async (req, res) => {
  try {
    if (req.body.prospectId) {
      const existingCount = await db.select({ count: sql22`count(*)` }).from(concurrentSituations).where(
        and17(
          eq21(concurrentSituations.entity, req.session.entity),
          eq21(concurrentSituations.prospectId, req.body.prospectId),
          // Compter uniquement les situations non-terminées
          not(eq21(concurrentSituations.status, "won")),
          not(eq21(concurrentSituations.status, "lost")),
          not(eq21(concurrentSituations.status, "archived"))
        )
      );
      const count4 = Number(existingCount[0]?.count || 0);
      if (count4 >= 4) {
        return res.status(400).json({
          error: "Limite atteinte",
          details: "Un prospect ne peut avoir que 4 contrats actifs maximum. Veuillez archiver ou cl\xF4turer un contrat existant."
        });
      }
    }
    const autoStatus = req.body.siren ? "future" : "a_qualifier";
    const validatedData = insertConcurrentSituationSchema.parse({
      ...req.body,
      entity: req.session.entity,
      detectedBy: req.session.userId,
      status: req.body.status || autoStatus
      // Permet override manuel si besoin
    });
    const [newSituation] = await db.insert(concurrentSituations).values(validatedData).returning();
    console.log(`[\xC9CH\xC9ANCE] Nouvelle \xE9ch\xE9ance cr\xE9\xE9e - Statut: ${newSituation.status} - SIRET: ${newSituation.siren || "N/A"}`);
    res.json({
      success: true,
      situation: newSituation
    });
  } catch (error) {
    console.error("Error creating situation:", error);
    res.status(400).json({
      error: "Erreur lors de la cr\xE9ation de la situation",
      details: error.message
    });
  }
});
router12.post("/situations/batch", isAuthenticated, async (req, res) => {
  try {
    const { prospectId, contracts, ...commonData } = req.body;
    if (!prospectId || !contracts || !Array.isArray(contracts) || contracts.length === 0) {
      return res.status(400).json({
        error: "Donn\xE9es invalides",
        details: "prospectId et contracts (array) requis"
      });
    }
    if (contracts.length > 4) {
      return res.status(400).json({
        error: "Limite d\xE9pass\xE9e",
        details: "Maximum 4 contrats par prospect"
      });
    }
    const existingCount = await db.select({ count: sql22`count(*)` }).from(concurrentSituations).where(
      and17(
        eq21(concurrentSituations.entity, req.session.entity),
        eq21(concurrentSituations.prospectId, prospectId),
        not(eq21(concurrentSituations.status, "won")),
        not(eq21(concurrentSituations.status, "lost")),
        not(eq21(concurrentSituations.status, "archived"))
      )
    );
    const currentCount = Number(existingCount[0]?.count || 0);
    const newTotal = currentCount + contracts.length;
    if (newTotal > 4) {
      return res.status(400).json({
        error: "Limite atteinte",
        details: `Ce prospect a d\xE9j\xE0 ${currentCount} contrat(s) actif(s). Vous ne pouvez ajouter que ${4 - currentCount} contrat(s) suppl\xE9mentaire(s).`
      });
    }
    const autoStatus = commonData.siren ? "future" : "a_qualifier";
    const createdSituations = await db.transaction(async (tx) => {
      const situations = [];
      for (const contract of contracts) {
        const validatedData = insertConcurrentSituationSchema.parse({
          prospectId,
          concurrentId: contract.concurrentId,
          contractEndDate: contract.contractEndDate,
          monthlyAmount: contract.monthlyAmount,
          solutionsInstalled: contract.solutionsInstalled,
          subscriptionType: contract.subscriptionType,
          // Données communes
          contactFirstName: commonData.contactFirstName,
          contactLastName: commonData.contactLastName,
          raisonSociale: commonData.raisonSociale,
          enseigne: commonData.enseigne,
          siren: commonData.siren,
          numberOfSites: commonData.numberOfSites,
          avgContractDurationMonths: commonData.avgContractDurationMonths,
          satisfactionLevel: commonData.satisfactionLevel,
          satisfactionNotes: commonData.satisfactionNotes,
          notes: commonData.notes,
          entity: req.session.entity,
          detectedBy: req.session.userId,
          status: autoStatus
        });
        const [newSituation] = await tx.insert(concurrentSituations).values(validatedData).returning();
        situations.push(newSituation);
      }
      return situations;
    });
    console.log(`[\xC9CH\xC9ANCE BATCH] ${createdSituations.length} contrats cr\xE9\xE9s pour prospect ${prospectId} (transaction atomique)`);
    res.json({
      success: true,
      created: createdSituations.length,
      situations: createdSituations
    });
  } catch (error) {
    console.error("Error creating batch situations:", error);
    res.status(400).json({
      error: "Erreur lors de la cr\xE9ation des \xE9ch\xE9ances",
      details: error.message
    });
  }
});
router12.post("/situations/check-duplicate", isAuthenticated, async (req, res) => {
  try {
    const { prospectId, concurrentId } = req.body;
    if (!prospectId || !concurrentId) {
      return res.status(400).json({
        error: "prospectId et concurrentId requis"
      });
    }
    const existing = await db.select({
      situation: concurrentSituations,
      concurrent: concurrents,
      prospect: prospects
    }).from(concurrentSituations).leftJoin(concurrents, eq21(concurrentSituations.concurrentId, concurrents.id)).leftJoin(prospects, eq21(concurrentSituations.prospectId, prospects.id)).where(
      and17(
        eq21(concurrentSituations.entity, req.session.entity),
        eq21(concurrentSituations.prospectId, prospectId),
        eq21(concurrentSituations.concurrentId, concurrentId),
        // Exclude only completed statuses (won/lost/archived)
        not(eq21(concurrentSituations.status, "won")),
        not(eq21(concurrentSituations.status, "lost")),
        not(eq21(concurrentSituations.status, "archived"))
      )
    ).limit(1);
    res.json({
      success: true,
      hasDuplicate: existing.length > 0,
      existingSituation: existing[0] || null
    });
  } catch (error) {
    console.error("Error checking duplicate:", error);
    res.status(500).json({
      error: "Erreur lors de la v\xE9rification",
      details: error.message
    });
  }
});
router12.get("/situations", isAuthenticated, async (req, res) => {
  try {
    const {
      status,
      concurrentId,
      prospectId,
      detectionSource,
      limit = "50",
      offset = "0"
    } = req.query;
    const conditions = [
      eq21(concurrentSituations.entity, req.session.entity)
    ];
    if (status) {
      conditions.push(eq21(concurrentSituations.status, status));
    }
    if (concurrentId) {
      conditions.push(eq21(concurrentSituations.concurrentId, concurrentId));
    }
    if (prospectId) {
      conditions.push(eq21(concurrentSituations.prospectId, prospectId));
    }
    if (detectionSource) {
      conditions.push(eq21(concurrentSituations.detectionSource, detectionSource));
    }
    const results = await db.select({
      situation: concurrentSituations,
      concurrent: concurrents,
      prospect: prospects
    }).from(concurrentSituations).leftJoin(concurrents, eq21(concurrentSituations.concurrentId, concurrents.id)).leftJoin(prospects, eq21(concurrentSituations.prospectId, prospects.id)).where(and17(...conditions)).orderBy(concurrentSituations.wakeupDate).limit(parseInt(limit)).offset(parseInt(offset));
    const totalCount = await db.select({ count: sql22`count(*)` }).from(concurrentSituations).where(and17(...conditions));
    res.json({
      success: true,
      situations: results,
      total: totalCount[0]?.count || 0,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error("Error fetching situations:", error);
    res.status(500).json({
      error: "Erreur lors de la r\xE9cup\xE9ration des situations",
      details: error.message
    });
  }
});
router12.get("/situations/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.select({
      situation: concurrentSituations,
      concurrent: concurrents,
      prospect: prospects
    }).from(concurrentSituations).leftJoin(concurrents, eq21(concurrentSituations.concurrentId, concurrents.id)).leftJoin(prospects, eq21(concurrentSituations.prospectId, prospects.id)).where(
      and17(
        eq21(concurrentSituations.id, id),
        eq21(concurrentSituations.entity, req.session.entity)
      )
    );
    if (!result) {
      return res.status(404).json({
        error: "Situation non trouv\xE9e"
      });
    }
    const attemptsHistory = await db.select().from(concurrentAttemptsHistory).where(
      and17(
        eq21(concurrentAttemptsHistory.situationId, id),
        eq21(concurrentAttemptsHistory.entity, req.session.entity)
      )
    ).orderBy(desc12(concurrentAttemptsHistory.attemptDate));
    res.json({
      success: true,
      situation: result.situation,
      concurrent: result.concurrent,
      prospect: result.prospect,
      attemptsHistory
    });
  } catch (error) {
    console.error("Error fetching situation:", error);
    res.status(500).json({
      error: "Erreur lors de la r\xE9cup\xE9ration de la situation",
      details: error.message
    });
  }
});
router12.patch("/situations/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const updateSchema = insertConcurrentSituationSchema.partial().omit({
      entity: true,
      detectedBy: true
    });
    const validatedData = updateSchema.parse(req.body);
    const [updatedSituation] = await db.update(concurrentSituations).set(validatedData).where(
      and17(
        eq21(concurrentSituations.id, id),
        eq21(concurrentSituations.entity, req.session.entity)
      )
    ).returning();
    if (!updatedSituation) {
      return res.status(404).json({
        error: "Situation non trouv\xE9e"
      });
    }
    res.json({
      success: true,
      situation: updatedSituation
    });
  } catch (error) {
    console.error("Error updating situation:", error);
    res.status(400).json({
      error: "Erreur lors de la mise \xE0 jour de la situation",
      details: error.message
    });
  }
});
router12.delete("/situations/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const [deleted] = await db.delete(concurrentSituations).where(
      and17(
        eq21(concurrentSituations.id, id),
        eq21(concurrentSituations.entity, req.session.entity)
      )
    ).returning();
    if (!deleted) {
      return res.status(404).json({
        error: "Situation non trouv\xE9e"
      });
    }
    res.json({
      success: true,
      message: "Situation supprim\xE9e avec succ\xE8s"
    });
  } catch (error) {
    console.error("Error deleting situation:", error);
    res.status(500).json({
      error: "Erreur lors de la suppression de la situation",
      details: error.message
    });
  }
});
router12.patch("/situations/:id/status", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, wonContractValue, lostReason, lostCompetitor } = req.body;
    if (!["won", "lost"].includes(status)) {
      return res.status(400).json({
        error: "Status invalide. Valeurs accept\xE9es: won, lost"
      });
    }
    const updateData = {
      status
    };
    if (status === "won") {
      updateData.wonAt = /* @__PURE__ */ new Date();
      updateData.wonBy = req.session.userId;
      if (wonContractValue) {
        updateData.wonContractValue = wonContractValue;
      }
    } else if (status === "lost") {
      updateData.lostAt = /* @__PURE__ */ new Date();
      updateData.lostBy = req.session.userId;
      if (lostReason) {
        updateData.lostReason = lostReason;
      }
      if (lostCompetitor) {
        updateData.lostCompetitor = lostCompetitor;
      }
    }
    const [updatedSituation] = await db.update(concurrentSituations).set(updateData).where(
      and17(
        eq21(concurrentSituations.id, id),
        eq21(concurrentSituations.entity, req.session.entity)
      )
    ).returning();
    if (!updatedSituation) {
      return res.status(404).json({
        error: "Situation non trouv\xE9e"
      });
    }
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const historyEntry = {
      entity: req.session.entity,
      situationId: id,
      attemptNumber: updatedSituation.attemptNumber,
      attemptDate: today,
      attemptBy: req.session.userId,
      outcome: status,
      outcomeDate: today,
      notes: `Status chang\xE9 vers ${status.toUpperCase()} par ${req.session.userId}`
    };
    if (status === "won" && wonContractValue) {
      historyEntry.wonContractValue = wonContractValue;
    }
    if (status === "lost") {
      if (lostReason) historyEntry.lostReason = lostReason;
      if (lostCompetitor) historyEntry.lostCompetitor = lostCompetitor;
    }
    await db.insert(concurrentAttemptsHistory).values(historyEntry);
    res.json({
      success: true,
      situation: updatedSituation,
      message: `Situation marqu\xE9e comme ${status.toUpperCase()}`
    });
  } catch (error) {
    console.error("Error updating situation status:", error);
    res.status(500).json({
      error: "Erreur lors de la mise \xE0 jour du status",
      details: error.message
    });
  }
});
router12.get("/events", isAuthenticated, async (req, res) => {
  try {
    const { treated, criticality, eventType, limit = "50", offset = "0" } = req.query;
    const conditions = [
      eq21(prospectEvents.entity, req.session.entity)
    ];
    if (treated === "true") {
      conditions.push(eq21(prospectEvents.treated, true));
    } else if (treated === "false") {
      conditions.push(eq21(prospectEvents.treated, false));
    }
    if (criticality) {
      conditions.push(eq21(prospectEvents.criticality, criticality));
    }
    if (eventType) {
      conditions.push(eq21(prospectEvents.eventType, eventType));
    }
    const results = await db.select({
      event: prospectEvents,
      prospect: prospects
    }).from(prospectEvents).leftJoin(prospects, eq21(prospectEvents.prospectId, prospects.id)).where(and17(...conditions)).orderBy(desc12(prospectEvents.detectedDate), desc12(prospectEvents.eventDate)).limit(parseInt(limit)).offset(parseInt(offset));
    const totalCount = await db.select({ count: sql22`count(*)` }).from(prospectEvents).where(and17(...conditions));
    res.json({
      success: true,
      events: results,
      total: totalCount[0]?.count || 0,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({
      error: "Erreur lors de la r\xE9cup\xE9ration des \xE9v\xE9nements",
      details: error.message
    });
  }
});
router12.get("/events/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.select({
      event: prospectEvents,
      prospect: prospects
    }).from(prospectEvents).leftJoin(prospects, eq21(prospectEvents.prospectId, prospects.id)).where(
      and17(
        eq21(prospectEvents.id, id),
        eq21(prospectEvents.entity, req.session.entity)
      )
    );
    if (!result) {
      return res.status(404).json({
        error: "\xC9v\xE9nement non trouv\xE9"
      });
    }
    res.json({
      success: true,
      event: result.event,
      prospect: result.prospect
    });
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({
      error: "Erreur lors de la r\xE9cup\xE9ration de l'\xE9v\xE9nement",
      details: error.message
    });
  }
});
router12.patch("/events/:id/treat", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { treatmentAction, notes } = req.body;
    const [updatedEvent] = await db.update(prospectEvents).set({
      treated: true,
      treatedAt: /* @__PURE__ */ new Date(),
      treatedBy: req.session.userId,
      treatmentAction,
      notes
    }).where(
      and17(
        eq21(prospectEvents.id, id),
        eq21(prospectEvents.entity, req.session.entity)
      )
    ).returning();
    if (!updatedEvent) {
      return res.status(404).json({
        error: "\xC9v\xE9nement non trouv\xE9"
      });
    }
    res.json({
      success: true,
      event: updatedEvent,
      message: "\xC9v\xE9nement trait\xE9 avec succ\xE8s"
    });
  } catch (error) {
    console.error("Error treating event:", error);
    res.status(500).json({
      error: "Erreur lors du traitement de l'\xE9v\xE9nement",
      details: error.message
    });
  }
});
router12.get("/alerts", isAuthenticated, async (req, res) => {
  try {
    const { read, actionTaken, limit = "50", offset = "0" } = req.query;
    const conditions = [
      eq21(competitorAlerts.entity, req.session.entity),
      eq21(competitorAlerts.targetUserId, req.session.userId)
    ];
    if (read === "true") {
      conditions.push(eq21(competitorAlerts.read, true));
    } else if (read === "false") {
      conditions.push(eq21(competitorAlerts.read, false));
    }
    if (actionTaken === "true") {
      conditions.push(eq21(competitorAlerts.actionTaken, true));
    } else if (actionTaken === "false") {
      conditions.push(eq21(competitorAlerts.actionTaken, false));
    }
    const results = await db.select({
      alert: competitorAlerts,
      situation: concurrentSituations,
      concurrent: concurrents,
      prospect: prospects
    }).from(competitorAlerts).leftJoin(concurrentSituations, eq21(competitorAlerts.situationId, concurrentSituations.id)).leftJoin(concurrents, eq21(concurrentSituations.concurrentId, concurrents.id)).leftJoin(prospects, eq21(concurrentSituations.prospectId, prospects.id)).where(and17(...conditions)).orderBy(competitorAlerts.alertDate).limit(parseInt(limit)).offset(parseInt(offset));
    const totalCount = await db.select({ count: sql22`count(*)` }).from(competitorAlerts).where(and17(...conditions));
    res.json({
      success: true,
      alerts: results,
      total: totalCount[0]?.count || 0,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error("Error fetching alerts:", error);
    res.status(500).json({
      error: "Erreur lors de la r\xE9cup\xE9ration des alertes",
      details: error.message
    });
  }
});
router12.patch("/alerts/:id/read", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const [updatedAlert] = await db.update(competitorAlerts).set({
      read: true,
      readAt: /* @__PURE__ */ new Date()
    }).where(
      and17(
        eq21(competitorAlerts.id, id),
        eq21(competitorAlerts.entity, req.session.entity),
        eq21(competitorAlerts.targetUserId, req.session.userId)
      )
    ).returning();
    if (!updatedAlert) {
      return res.status(404).json({
        error: "Alerte non trouv\xE9e"
      });
    }
    res.json({
      success: true,
      alert: updatedAlert
    });
  } catch (error) {
    console.error("Error marking alert as read:", error);
    res.status(500).json({
      error: "Erreur lors du marquage de l'alerte",
      details: error.message
    });
  }
});
router12.patch("/alerts/:id/action", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { actionNotes } = req.body;
    const [updatedAlert] = await db.update(competitorAlerts).set({
      actionTaken: true,
      actionTakenAt: /* @__PURE__ */ new Date(),
      actionNotes
    }).where(
      and17(
        eq21(competitorAlerts.id, id),
        eq21(competitorAlerts.entity, req.session.entity),
        eq21(competitorAlerts.targetUserId, req.session.userId)
      )
    ).returning();
    if (!updatedAlert) {
      return res.status(404).json({
        error: "Alerte non trouv\xE9e"
      });
    }
    res.json({
      success: true,
      alert: updatedAlert
    });
  } catch (error) {
    console.error("Error marking action taken:", error);
    res.status(500).json({
      error: "Erreur lors du marquage de l'action",
      details: error.message
    });
  }
});
router12.get("/dashboards/bd", isAuthenticated, async (req, res) => {
  try {
    const entity = req.session.entity;
    const byStatus = await db.select({
      status: concurrentSituations.status,
      count: sql22`count(*)`,
      totalValue: sql22`coalesce(sum(${concurrentSituations.estimatedTotalContract}), 0)`
    }).from(concurrentSituations).where(eq21(concurrentSituations.entity, entity)).groupBy(concurrentSituations.status);
    const total = byStatus.reduce((sum3, s) => sum3 + Number(s.count), 0);
    const active = byStatus.find((s) => s.status === "active")?.count || 0;
    const won = byStatus.find((s) => s.status === "won")?.count || 0;
    const lost = byStatus.find((s) => s.status === "lost")?.count || 0;
    const conversionRate = total > 0 ? Number(won) / total * 100 : 0;
    const prioritySituationsRaw = await db.select({
      situation: concurrentSituations,
      concurrent: concurrents,
      prospect: prospects
    }).from(concurrentSituations).leftJoin(concurrents, eq21(concurrentSituations.concurrentId, concurrents.id)).leftJoin(prospects, eq21(concurrentSituations.prospectId, prospects.id)).where(
      and17(
        eq21(concurrentSituations.entity, entity),
        inArray5(concurrentSituations.status, ["future", "active", "awakened"])
      )
    ).orderBy(concurrentSituations.contractEndDate).limit(10);
    const prioritySituations = prioritySituationsRaw.map((item) => {
      const endDate = new Date(item.situation.contractEndDate);
      const today = /* @__PURE__ */ new Date();
      const daysUntilEnd = Math.ceil((endDate.getTime() - today.getTime()) / (1e3 * 60 * 60 * 24));
      return {
        id: item.situation.id,
        prospectName: item.prospect?.enseigneCommerciale || item.prospect?.entreprise || "N/A",
        concurrentName: item.concurrent?.name || "N/A",
        contractEndDate: item.situation.contractEndDate,
        wakeupDate: item.situation.wakeupDate,
        estimatedTotalContract: item.situation.estimatedTotalContract,
        status: item.situation.status,
        attemptNumber: item.situation.attemptNumber,
        daysUntilEnd
      };
    });
    const recentAlertsRaw = await db.select({
      alert: competitorAlerts,
      situation: concurrentSituations
    }).from(competitorAlerts).leftJoin(concurrentSituations, eq21(competitorAlerts.situationId, concurrentSituations.id)).where(
      and17(
        eq21(competitorAlerts.entity, entity),
        eq21(competitorAlerts.read, false)
      )
    ).orderBy(desc12(competitorAlerts.alertDate)).limit(10);
    const recentAlerts = recentAlertsRaw.map((item) => ({
      id: item.alert.id,
      situationId: item.alert.situationId,
      alertType: item.alert.alertType,
      alertDate: item.alert.alertDate,
      daysBeforeEnd: item.alert.daysBeforeEnd,
      read: item.alert.read
    }));
    res.json({
      success: true,
      byStatus: byStatus.map((s) => ({
        status: s.status,
        count: Number(s.count),
        totalValue: Number(s.totalValue)
      })),
      prioritySituations,
      recentAlerts,
      stats: {
        total: Number(total),
        active: Number(active),
        won: Number(won),
        lost: Number(lost),
        conversionRate: Number(conversionRate.toFixed(1))
      }
    });
  } catch (error) {
    console.error("Error fetching BD dashboard:", error);
    res.status(500).json({
      error: "Erreur lors de la r\xE9cup\xE9ration du dashboard BD",
      details: error.message
    });
  }
});
router12.get("/dashboards/manager", isAuthenticated, async (req, res) => {
  try {
    const entity = req.session.entity;
    const pipelineStats = await db.select({
      status: concurrentSituations.status,
      count: sql22`count(*)`,
      totalAmount: sql22`sum(${concurrentSituations.estimatedTotalContract})`
    }).from(concurrentSituations).where(eq21(concurrentSituations.entity, entity)).groupBy(concurrentSituations.status);
    const conversionStats = await db.select({
      status: concurrentSituations.status,
      count: sql22`count(*)`
    }).from(concurrentSituations).where(eq21(concurrentSituations.entity, entity)).groupBy(concurrentSituations.status);
    const totalSituations = conversionStats.reduce((sum3, s) => sum3 + Number(s.count), 0);
    const wonSituations = conversionStats.find((s) => s.status === "won")?.count || 0;
    const conversionRate = totalSituations > 0 ? Number(wonSituations) / totalSituations * 100 : 0;
    const topConcurrents = await db.select({
      concurrentId: concurrentSituations.concurrentId,
      concurrentName: concurrents.name,
      count: sql22`count(*)`
    }).from(concurrentSituations).leftJoin(concurrents, eq21(concurrentSituations.concurrentId, concurrents.id)).where(eq21(concurrentSituations.entity, entity)).groupBy(concurrentSituations.concurrentId, concurrents.name).orderBy(desc12(sql22`count(*)`)).limit(10);
    res.json({
      success: true,
      dashboard: {
        pipelineStats,
        conversionRate: conversionRate.toFixed(2),
        topConcurrents
      }
    });
  } catch (error) {
    console.error("Error fetching manager dashboard:", error);
    res.status(500).json({
      error: "Erreur lors de la r\xE9cup\xE9ration du dashboard manager",
      details: error.message
    });
  }
});
router12.get("/dashboards/jp", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const globalStats = await db.select({
      entity: concurrentSituations.entity,
      status: concurrentSituations.status,
      count: sql22`count(*)`,
      totalAmount: sql22`sum(${concurrentSituations.estimatedTotalContract})`
    }).from(concurrentSituations).groupBy(concurrentSituations.entity, concurrentSituations.status);
    const jpAlerts = await db.select().from(competitorAlerts).leftJoin(concurrentSituations, eq21(competitorAlerts.situationId, concurrentSituations.id)).leftJoin(concurrents, eq21(concurrentSituations.concurrentId, concurrents.id)).leftJoin(prospects, eq21(concurrentSituations.prospectId, prospects.id)).where(
      and17(
        eq21(competitorAlerts.escalatedToJP, true),
        eq21(competitorAlerts.actionTaken, false)
      )
    ).orderBy(competitorAlerts.alertDate).limit(20);
    res.json({
      success: true,
      dashboard: {
        globalStats,
        jpAlerts
      }
    });
  } catch (error) {
    console.error("Error fetching JP dashboard:", error);
    res.status(500).json({
      error: "Erreur lors de la r\xE9cup\xE9ration du dashboard JP",
      details: error.message
    });
  }
});
router12.get("/analytics/rebouclage", isAuthenticated, async (req, res) => {
  try {
    const entity = req.session.entity;
    const rebouclageByAttempt = await db.select({
      attemptNumber: concurrentSituations.attemptNumber,
      count: sql22`count(*)`,
      wonCount: sql22`sum(case when ${concurrentSituations.status} = 'won' then 1 else 0 end)`
    }).from(concurrentSituations).where(eq21(concurrentSituations.entity, entity)).groupBy(concurrentSituations.attemptNumber).orderBy(concurrentSituations.attemptNumber);
    const conversionDelays = await db.execute(sql22`
      SELECT 
        AVG(EXTRACT(EPOCH FROM (won_at - detected_at)) / 86400) as avg_days
      FROM concurrent_situations
      WHERE entity = ${entity}
        AND status = 'won'
        AND won_at IS NOT NULL
    `);
    res.json({
      success: true,
      analytics: {
        rebouclageByAttempt,
        avgConversionDays: conversionDelays.rows[0]?.avg_days || 0
      }
    });
  } catch (error) {
    console.error("Error fetching rebouclage analytics:", error);
    res.status(500).json({
      error: "Erreur lors de la r\xE9cup\xE9ration des analytics rebouclage",
      details: error.message
    });
  }
});
router12.get("/analytics/concurrents", isAuthenticated, async (req, res) => {
  try {
    const entity = req.session.entity;
    const concurrentStats = await db.select({
      concurrentId: concurrentSituations.concurrentId,
      concurrentName: concurrents.name,
      totalSituations: sql22`count(*)`,
      wonSituations: sql22`sum(case when ${concurrentSituations.status} = 'won' then 1 else 0 end)`,
      lostSituations: sql22`sum(case when ${concurrentSituations.status} = 'lost' then 1 else 0 end)`,
      totalAmount: sql22`sum(${concurrentSituations.estimatedTotalContract})`
    }).from(concurrentSituations).leftJoin(concurrents, eq21(concurrentSituations.concurrentId, concurrents.id)).where(eq21(concurrentSituations.entity, entity)).groupBy(concurrentSituations.concurrentId, concurrents.name).orderBy(desc12(sql22`count(*)`));
    res.json({
      success: true,
      analytics: {
        concurrentStats
      }
    });
  } catch (error) {
    console.error("Error fetching concurrent analytics:", error);
    res.status(500).json({
      error: "Erreur lors de la r\xE9cup\xE9ration des analytics concurrents",
      details: error.message
    });
  }
});
router12.get("/analytics/roi", isAuthenticated, async (req, res) => {
  try {
    const entity = req.session.entity;
    const wonAmount = await db.select({
      total: sql22`sum(${concurrentSituations.wonContractValue})`
    }).from(concurrentSituations).where(
      and17(
        eq21(concurrentSituations.entity, entity),
        eq21(concurrentSituations.status, "won")
      )
    );
    const wonContracts = await db.select({
      count: sql22`count(*)`
    }).from(concurrentSituations).where(
      and17(
        eq21(concurrentSituations.entity, entity),
        eq21(concurrentSituations.status, "won")
      )
    );
    res.json({
      success: true,
      roi: {
        totalWonAmount: wonAmount[0]?.total || 0,
        totalWonContracts: wonContracts[0]?.count || 0,
        targetContracts: 60,
        targetRevenue: 1e6
      }
    });
  } catch (error) {
    console.error("Error fetching ROI analytics:", error);
    res.status(500).json({
      error: "Erreur lors du calcul du ROI",
      details: error.message
    });
  }
});
router12.get("/config", isAuthenticated, async (req, res) => {
  try {
    const { category } = req.query;
    const conditions = [];
    if (category) {
      conditions.push(eq21(systemConfig.category, category));
    }
    const results = await db.select().from(systemConfig).where(conditions.length > 0 ? and17(...conditions) : void 0).orderBy(systemConfig.category, systemConfig.key);
    res.json({
      success: true,
      config: results
    });
  } catch (error) {
    console.error("Error fetching config:", error);
    res.status(500).json({
      error: "Erreur lors de la r\xE9cup\xE9ration de la configuration",
      details: error.message
    });
  }
});
router12.patch("/config/:key", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    if (!value) {
      return res.status(400).json({
        error: "La valeur est requise"
      });
    }
    const [updatedConfig] = await db.update(systemConfig).set({
      value: String(value),
      updatedBy: req.session.userId
    }).where(eq21(systemConfig.key, key)).returning();
    if (!updatedConfig) {
      return res.status(404).json({
        error: "Configuration non trouv\xE9e"
      });
    }
    res.json({
      success: true,
      config: updatedConfig
    });
  } catch (error) {
    console.error("Error updating config:", error);
    res.status(500).json({
      error: "Erreur lors de la mise \xE0 jour de la configuration",
      details: error.message
    });
  }
});
var competitor_default = router12;

// server/middleware/rls-session.ts
init_db();
import { sql as sql23 } from "drizzle-orm";
async function rlsSessionMiddleware(req, res, next) {
  try {
    if (!req.session.userId || !req.session.entity || !req.session.role) {
      return next();
    }
    await db.execute(sql23`
      SELECT 
        set_config('app.current_entity', ${req.session.entity}, false),
        set_config('app.user_role', ${req.session.role}, false),
        set_config('app.user_id', ${req.session.userId}, false)
    `);
    next();
  } catch (error) {
    console.error("[RLS Session Middleware] Error setting session variables:", error);
    next();
  }
}

// server/routes.ts
init_enrichment_orchestrator();
init_countries_registry();

// lib/services/enrichment/monitoring.ts
var EnrichmentMonitoring = class {
  metrics = [];
  maxMetrics = 1e4;
  // Garder les 10000 dernières métriques
  /**
   * Enregistre une métrique d'enrichissement
   */
  recordMetric(metric) {
    const fullMetric = {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      ...metric
    };
    this.metrics.push(fullMetric);
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
    this.logMetric(fullMetric);
  }
  /**
   * Logging structuré
   */
  logMetric(metric) {
    const level = metric.success ? "info" : "error";
    const emoji = metric.success ? "\u2705" : "\u274C";
    console.log(
      `[Enrichment ${level.toUpperCase()}] ${emoji} ${metric.countryCode}/${metric.provider} - ${metric.responseTime}ms`,
      {
        timestamp: metric.timestamp,
        identifier: metric.identifier,
        qualityScore: metric.qualityScore,
        fallbackUsed: metric.fallbackUsed,
        error: metric.error
      }
    );
  }
  /**
   * Obtenir les métriques agrégées
   */
  getAggregatedMetrics(since) {
    const filteredMetrics = since ? this.metrics.filter((m) => new Date(m.timestamp) >= since) : this.metrics;
    const total = filteredMetrics.length;
    const successful = filteredMetrics.filter((m) => m.success).length;
    const failed = total - successful;
    const fallbacks = filteredMetrics.filter((m) => m.fallbackUsed).length;
    const byProvider = {
      pappers: filteredMetrics.filter((m) => m.provider === "pappers").length,
      opencorporates: filteredMetrics.filter((m) => m.provider === "opencorporates").length,
      web_search: filteredMetrics.filter((m) => m.provider === "web_search").length
    };
    const byCountry = {};
    filteredMetrics.forEach((m) => {
      byCountry[m.countryCode] = (byCountry[m.countryCode] || 0) + 1;
    });
    const successfulWithScore = filteredMetrics.filter((m) => m.success && m.qualityScore !== void 0);
    const avgQualityScore = successfulWithScore.length > 0 ? successfulWithScore.reduce((sum3, m) => sum3 + (m.qualityScore || 0), 0) / successfulWithScore.length : 0;
    const avgResponseTime = total > 0 ? filteredMetrics.reduce((sum3, m) => sum3 + m.responseTime, 0) / total : 0;
    const qualityDistribution = {
      excellent: successfulWithScore.filter((m) => (m.qualityScore || 0) >= 80).length,
      good: successfulWithScore.filter((m) => (m.qualityScore || 0) >= 60 && (m.qualityScore || 0) < 80).length,
      fair: successfulWithScore.filter((m) => (m.qualityScore || 0) >= 40 && (m.qualityScore || 0) < 60).length,
      poor: successfulWithScore.filter((m) => (m.qualityScore || 0) < 40).length
    };
    return {
      total_requests: total,
      successful_enrichments: successful,
      failed_enrichments: failed,
      fallbacks_used: fallbacks,
      by_provider: byProvider,
      by_country: byCountry,
      avg_quality_score: Math.round(avgQualityScore * 10) / 10,
      avg_response_time: Math.round(avgResponseTime),
      success_rate: total > 0 ? Math.round(successful / total * 1e3) / 10 : 0,
      fallback_rate: total > 0 ? Math.round(fallbacks / total * 1e3) / 10 : 0,
      quality_distribution: qualityDistribution
    };
  }
  /**
   * Obtenir les métriques Prometheus
   */
  getPrometheusMetrics() {
    const metrics = this.getAggregatedMetrics();
    return `
# HELP enrichment_requests_total Total number of enrichment requests
# TYPE enrichment_requests_total counter
enrichment_requests_total ${metrics.total_requests}

# HELP enrichment_success_total Total number of successful enrichments
# TYPE enrichment_success_total counter
enrichment_success_total ${metrics.successful_enrichments}

# HELP enrichment_failures_total Total number of failed enrichments
# TYPE enrichment_failures_total counter
enrichment_failures_total ${metrics.failed_enrichments}

# HELP enrichment_fallbacks_total Total number of fallbacks used
# TYPE enrichment_fallbacks_total counter
enrichment_fallbacks_total ${metrics.fallbacks_used}

# HELP enrichment_duration_seconds Average enrichment duration in seconds
# TYPE enrichment_duration_seconds gauge
enrichment_duration_seconds ${(metrics.avg_response_time / 1e3).toFixed(3)}

# HELP enrichment_quality_score_avg Average quality score (0-100)
# TYPE enrichment_quality_score_avg gauge
enrichment_quality_score_avg ${metrics.avg_quality_score}

# HELP enrichment_success_rate Success rate percentage
# TYPE enrichment_success_rate gauge
enrichment_success_rate ${metrics.success_rate}

# HELP enrichment_fallback_rate Fallback usage rate percentage
# TYPE enrichment_fallback_rate gauge
enrichment_fallback_rate ${metrics.fallback_rate}

# HELP enrichment_by_provider_total Enrichments by provider
# TYPE enrichment_by_provider_total counter
enrichment_by_provider_total{provider="pappers"} ${metrics.by_provider.pappers}
enrichment_by_provider_total{provider="opencorporates"} ${metrics.by_provider.opencorporates}
enrichment_by_provider_total{provider="web_search"} ${metrics.by_provider.web_search}

# HELP enrichment_quality_distribution Distribution of quality scores
# TYPE enrichment_quality_distribution gauge
enrichment_quality_distribution{range="excellent"} ${metrics.quality_distribution.excellent}
enrichment_quality_distribution{range="good"} ${metrics.quality_distribution.good}
enrichment_quality_distribution{range="fair"} ${metrics.quality_distribution.fair}
enrichment_quality_distribution{range="poor"} ${metrics.quality_distribution.poor}
`.trim();
  }
  /**
   * Obtenir les dernières métriques brutes
   */
  getRecentMetrics(limit = 100) {
    return this.metrics.slice(-limit);
  }
  /**
   * Alertes automatiques
   */
  checkAlerts() {
    const metrics = this.getAggregatedMetrics();
    const alerts = [];
    let severity = "ok";
    if (metrics.success_rate < 90) {
      alerts.push(`Taux d'erreur \xE9lev\xE9: ${100 - metrics.success_rate}% d'\xE9checs`);
      severity = metrics.success_rate < 80 ? "critical" : "warning";
    }
    if (metrics.fallback_rate > 20) {
      alerts.push(`Taux de fallback \xE9lev\xE9: ${metrics.fallback_rate}%`);
      if (severity === "ok") severity = "warning";
    }
    if (metrics.avg_quality_score > 0 && metrics.avg_quality_score < 50) {
      alerts.push(`Quality score moyen faible: ${metrics.avg_quality_score}/100`);
      if (severity === "ok") severity = "warning";
    }
    if (metrics.avg_response_time > 5e3) {
      alerts.push(`Temps de r\xE9ponse \xE9lev\xE9: ${Math.round(metrics.avg_response_time)}ms`);
      if (severity === "ok") severity = "warning";
    }
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1e3);
    const recentMetrics = this.getAggregatedMetrics(oneHourAgo);
    if (recentMetrics.total_requests === 0 && this.metrics.length > 0) {
      alerts.push("Aucune requ\xEAte dans la derni\xE8re heure");
      if (severity === "ok") severity = "warning";
    }
    return { alerts, severity };
  }
  /**
   * Exporter les métriques au format JSON
   */
  exportMetrics() {
    const aggregated = this.getAggregatedMetrics();
    const alerts = this.checkAlerts();
    return JSON.stringify({
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      metrics: aggregated,
      alerts: alerts.alerts,
      severity: alerts.severity,
      recent_samples: this.getRecentMetrics(10)
    }, null, 2);
  }
  /**
   * Reset des métriques (pour tests)
   */
  reset() {
    this.metrics = [];
  }
};
var enrichmentMonitoring = new EnrichmentMonitoring();

// server/routes.ts
init_enrichment_service();

// server/auditLogger.ts
init_db();
init_schema();
async function logAudit(options) {
  try {
    const {
      req,
      action,
      entityType,
      entityId,
      entityName,
      oldValues,
      newValues,
      status = "success",
      errorMessage
    } = options;
    const userId = req.session?.userId || null;
    const userEmail = req.user?.email || null;
    const userName = req.user ? `${req.user.firstName || ""} ${req.user.lastName || ""}`.trim() : null;
    const userRole = req.user?.role || null;
    const entity = req.user?.entity || req.session?.entity || "luxembourg";
    const ipAddress = req.ip || req.socket.remoteAddress || null;
    const userAgent = req.headers["user-agent"] || null;
    const endpoint = req.originalUrl || req.url;
    const method = req.method;
    let changes = null;
    if (oldValues && newValues) {
      changes = {};
      for (const key in newValues) {
        if (JSON.stringify(oldValues[key]) !== JSON.stringify(newValues[key])) {
          changes[key] = {
            from: oldValues[key],
            to: newValues[key]
          };
        }
      }
    }
    await db.insert(auditLogs).values({
      entity,
      userId,
      userEmail,
      userName,
      userRole,
      action,
      entityType,
      entityId,
      entityName,
      changes,
      oldValues,
      newValues,
      ipAddress,
      userAgent,
      endpoint,
      method,
      status,
      errorMessage
    });
  } catch (error) {
    console.error("Error logging audit action:", error);
  }
}
async function logCreate(req, entityType, entityId, entityName, newValues) {
  await logAudit({
    req,
    action: "CREATE",
    entityType,
    entityId,
    entityName,
    newValues
  });
}
async function logUpdate(req, entityType, entityId, entityName, oldValues, newValues) {
  await logAudit({
    req,
    action: "UPDATE",
    entityType,
    entityId,
    entityName,
    oldValues,
    newValues
  });
}
async function logDelete(req, entityType, entityId, entityName, oldValues) {
  await logAudit({
    req,
    action: "DELETE",
    entityType,
    entityId,
    entityName,
    oldValues
  });
}

// server/routes.ts
init_dataQualityService();

// shared/utils.ts
function detectEntityFromAddress(codePostal, pays) {
  const normalizedCodePostal = codePostal?.trim().toUpperCase() || "";
  const normalizedPays = pays?.trim().toLowerCase() || "";
  if (normalizedCodePostal) {
    if (normalizedCodePostal.startsWith("L-") || /^\d{4}$/.test(normalizedCodePostal) && parseInt(normalizedCodePostal) >= 1e3 && parseInt(normalizedCodePostal) <= 9999 && normalizedPays.includes("luxemb")) {
      return "luxembourg";
    }
    if (normalizedCodePostal.startsWith("B-") || /^\d{4}$/.test(normalizedCodePostal) && normalizedPays.includes("belg")) {
      return "belgique";
    }
    if (/^\d{5}$/.test(normalizedCodePostal)) {
      return "france";
    }
  }
  if (normalizedPays) {
    if (normalizedPays.includes("france") || normalizedPays.includes("fran\xE7ais")) {
      return "france";
    }
    if (normalizedPays.includes("luxemb")) {
      return "luxembourg";
    }
    if (normalizedPays.includes("belg") || normalizedPays.includes("bruxelles")) {
      return "belgique";
    }
  }
  return null;
}

// server/routes.ts
var sendMessageSchema = z8.object({
  content: z8.string().min(1),
  conversationId: z8.string().optional().nullable(),
  featureType: z8.enum(["commercial", "meeting", "training", "arguments"]).optional().nullable()
});
var registerSchema = z8.object({
  email: z8.string().email(),
  password: z8.string().min(8),
  firstName: z8.string().optional(),
  lastName: z8.string().optional(),
  entity: z8.enum(["france", "luxembourg", "belgique"]).optional()
});
var loginSchema = z8.object({
  email: z8.string().email(),
  password: z8.string().min(1),
  rememberMe: z8.boolean().optional().default(false)
});
var forgotPasswordSchema = z8.object({
  email: z8.string().email()
});
var resetPasswordSchema = z8.object({
  token: z8.string(),
  password: z8.string().min(8)
});
var startCallSchema = z8.object({
  prospectId: z8.string().min(1),
  scriptId: z8.string().optional().nullable()
});
var endCallSchema = z8.object({
  result: z8.enum(["rdv_pris", "rappel_planifie", "refus", "pas_joignable"]),
  rdvDate: z8.string().optional().nullable(),
  rappelDate: z8.string().optional().nullable(),
  rappelRaison: z8.string().optional().nullable(),
  notes: z8.string().optional().nullable(),
  objectionsTraitees: z8.any().optional().nullable(),
  summaryAi: z8.any().optional().nullable(),
  probabiliteClosing: z8.number().min(0).max(100).optional().nullable()
});
var createCallScriptSchema = z8.object({
  prospectId: z8.string().min(1),
  scriptContent: z8.any(),
  discProfileUsed: z8.any().optional().nullable(),
  secteur: z8.string().optional().nullable(),
  generationSource: z8.enum(["ai_generated", "template", "manual"]).optional()
});
var createCallNoteSchema = z8.object({
  callId: z8.string().min(1),
  noteText: z8.string().min(1),
  noteType: z8.enum(["general", "objection", "insight", "action"]).optional()
});
var enrichCompanySchema = z8.object({
  identifier: z8.string().min(1, "L'identifiant est requis"),
  countryCode: z8.string().length(2, "Le code pays doit faire 2 caract\xE8res (ISO 3166-1 alpha-2)").toUpperCase(),
  companyName: z8.string().optional(),
  enableFallback: z8.boolean().optional().default(true)
});
async function apiProtection(apiSource, req, res, next) {
  try {
    const check2 = await quotaManager.checkQuota(apiSource);
    if (!check2.allowed) {
      return res.status(429).json({
        error: "Quota API d\xE9pass\xE9",
        reason: check2.reason,
        retryAfter: await quotaManager.getRetryAfter(apiSource)
      });
    }
    await rateLimiter.waitIfNeeded(apiSource);
    next();
  } catch (error) {
    console.error(`[API Protection] Erreur protection API ${apiSource}:`, error);
    res.status(500).json({ error: "Erreur syst\xE8me de protection API" });
  }
}
var uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
var storage_multer = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  }
});
var upload = multer({
  storage: storage_multer,
  limits: {
    fileSize: 50 * 1024 * 1024
    // 50MB limit
  }
});
async function registerRoutes(app2) {
  setupAuth(app2);
  app2.use("/webhooks/resend", resend_default);
  app2.use("/webhooks/twilio", twilio_default);
  app2.use("/admin/queues", queue_dashboard_default);
  app2.use("/api/learning", isAdmin, learningRouter);
  app2.use("/api/advanced", isAuthenticated, advanced_default);
  app2.use("/api/phone", isAuthenticated, rlsSessionMiddleware, phone_default);
  app2.use("/api/admin/phone", isAdmin, phone_admin_default);
  app2.use("/api/gps", isAuthenticated, rlsSessionMiddleware, gps_track_default);
  app2.use("/api/admin/gps", isAdmin, gps_admin_default);
  console.log("[ROUTES] \u{1F4CD} Montage GPS Supervision Router sur /api/supervision");
  app2.use("/api/supervision", isAuthenticated, rlsSessionMiddleware, gps_supervision_default);
  app2.use("/api/admin/cron", isAdmin, admin_cron_default);
  app2.use("/api/opportunities", isAuthenticated, rlsSessionMiddleware, opportunities_default);
  app2.use("/api/competitor", isAuthenticated, rlsSessionMiddleware, competitor_default);
  app2.post("/api/auth/register", isAdmin, async (req, res) => {
    try {
      const parsed = registerSchema.parse(req.body);
      const email = parsed.email.toLowerCase().trim();
      const password = parsed.password;
      const firstName = parsed.firstName;
      const lastName = parsed.lastName;
      const entity = parsed.entity;
      if (!email.endsWith("@adsgroup-security.com")) {
        return res.status(400).json({
          error: "Seuls les emails @adsgroup-security.com sont autoris\xE9s"
        });
      }
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "Cet email est d\xE9j\xE0 utilis\xE9" });
      }
      const admin = await storage.getUser(req.session.userId);
      if (!admin) {
        return res.status(500).json({ error: "Erreur: Admin introuvable" });
      }
      const passwordHash = await hashPassword(password);
      const user = await storage.createUser({
        email,
        password: passwordHash,
        firstName: firstName || null,
        lastName: lastName || null,
        isActive: "true",
        isAdmin: "false",
        entity: entity || admin.entity
        // Use specified entity or inherit from admin
      });
      try {
        await sendWelcomeEmail({
          to: email,
          firstName: firstName || void 0,
          temporaryPassword: password
        });
        console.log("[REGISTER] Welcome email sent to:", email);
      } catch (emailError) {
        console.error("[REGISTER] Failed to send welcome email:", emailError);
      }
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error in /api/auth/register:", error);
      if (error instanceof z8.ZodError) {
        return res.status(400).json({ error: "Donn\xE9es invalides", details: error.errors });
      }
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const parsed = loginSchema.parse(req.body);
      const email = parsed.email.toLowerCase().trim();
      const password = parsed.password;
      const rememberMe = parsed.rememberMe;
      const canAttempt = await checkRateLimit(email);
      if (!canAttempt) {
        return res.status(429).json({
          error: "Trop de tentatives. Veuillez r\xE9essayer dans 15 minutes."
        });
      }
      await storage.recordLoginAttempt({
        email,
        ipAddress: req.ip || null
      });
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Email ou mot de passe incorrect" });
      }
      if (!email.endsWith("@adsgroup-security.com")) {
        return res.status(403).json({
          error: "Acc\xE8s r\xE9serv\xE9 aux comptes @adsgroup-security.com"
        });
      }
      if (user.isActive !== "true") {
        return res.status(403).json({ error: "Votre compte a \xE9t\xE9 d\xE9sactiv\xE9" });
      }
      const isValidPassword = await verifyPassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Email ou mot de passe incorrect" });
      }
      await storage.clearLoginAttempts(email);
      await storage.updateUser(user.id, {
        lastLoginAt: /* @__PURE__ */ new Date()
      });
      await new Promise((resolve, reject) => {
        req.session.regenerate((err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
      req.session.userId = user.id;
      req.session.entity = user.entity;
      req.session.role = user.role;
      req.session.isAdmin = user.isAdmin;
      if (rememberMe) {
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1e3;
        console.log("[LOGIN] Remember me enabled - session set to 30 days");
      } else {
        req.session.cookie.maxAge = void 0;
        console.log("[LOGIN] Remember me disabled - session cookie (browser close)");
      }
      await new Promise((resolve, reject) => {
        req.session.save((err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error in /api/auth/login:", error);
      if (error instanceof z8.ZodError) {
        return res.status(400).json({ error: "Donn\xE9es invalides", details: error.errors });
      }
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).json({ error: "Erreur lors de la d\xE9connexion" });
      }
      res.json({ message: "D\xE9connect\xE9 avec succ\xE8s" });
    });
  });
  app2.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ error: "Utilisateur non trouv\xE9" });
      }
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const parsed = forgotPasswordSchema.parse(req.body);
      const email = parsed.email.toLowerCase().trim();
      if (!email.endsWith("@adsgroup-security.com")) {
        return res.status(403).json({
          error: "Acc\xE8s r\xE9serv\xE9 aux comptes @adsgroup-security.com"
        });
      }
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.json({
          message: "Si cet email existe, un lien de r\xE9initialisation a \xE9t\xE9 envoy\xE9"
        });
      }
      const token = await generatePasswordResetToken();
      const expiresAt = getPasswordResetExpiry();
      await storage.createPasswordResetToken({
        userId: user.id,
        token,
        expiresAt
      });
      try {
        await sendPasswordResetEmail({
          to: email,
          resetToken: token,
          firstName: user.firstName || void 0
        });
        console.log("[PASSWORD RESET] Email sent to:", email);
      } catch (emailError) {
        console.error("[PASSWORD RESET] Failed to send email:", emailError);
      }
      res.json({
        message: "Si cet email existe, un lien de r\xE9initialisation a \xE9t\xE9 envoy\xE9"
      });
    } catch (error) {
      console.error("Error in /api/auth/forgot-password:", error);
      if (error instanceof z8.ZodError) {
        return res.status(400).json({ error: "Donn\xE9es invalides" });
      }
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, password } = resetPasswordSchema.parse(req.body);
      const resetToken = await storage.getPasswordResetToken(token);
      if (!resetToken) {
        return res.status(400).json({ error: "Lien de r\xE9initialisation invalide ou expir\xE9" });
      }
      if (/* @__PURE__ */ new Date() > resetToken.expiresAt) {
        await storage.deletePasswordResetToken(token);
        return res.status(400).json({ error: "Lien de r\xE9initialisation expir\xE9" });
      }
      const passwordHash = await hashPassword(password);
      await storage.updateUser(resetToken.userId, {
        password: passwordHash
      });
      await storage.deletePasswordResetToken(token);
      res.json({ message: "Mot de passe r\xE9initialis\xE9 avec succ\xE8s" });
    } catch (error) {
      console.error("Error in /api/auth/reset-password:", error);
      if (error instanceof z8.ZodError) {
        return res.status(400).json({ error: "Donn\xE9es invalides" });
      }
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.post("/api/auth/accept-invite", async (req, res) => {
    try {
      const { token, password, firstName, lastName } = req.body;
      if (!token || !password) {
        return res.status(400).json({ error: "Token et mot de passe requis" });
      }
      if (password.length < 8) {
        return res.status(400).json({ error: "Le mot de passe doit contenir au moins 8 caract\xE8res" });
      }
      const invitation = await storage.getInvitationByToken(token);
      if (!invitation) {
        return res.status(400).json({ error: "Invitation invalide ou expir\xE9e" });
      }
      if (invitation.status !== "pending") {
        return res.status(400).json({ error: "Cette invitation a d\xE9j\xE0 \xE9t\xE9 utilis\xE9e" });
      }
      if (/* @__PURE__ */ new Date() > invitation.expiresAt) {
        await storage.updateInvitation(invitation.id, { status: "expired" });
        return res.status(400).json({ error: "Cette invitation a expir\xE9" });
      }
      const existingUser = await storage.getUserByEmail(invitation.email);
      if (existingUser) {
        return res.status(400).json({ error: "Un utilisateur avec cet email existe d\xE9j\xE0" });
      }
      const inviter = await storage.getUser(invitation.invitedBy);
      if (!inviter) {
        return res.status(500).json({ error: "Erreur: Invitateur introuvable" });
      }
      const passwordHash = await hashPassword(password);
      const user = await storage.createUser({
        email: invitation.email,
        password: passwordHash,
        firstName: firstName || null,
        lastName: lastName || null,
        role: invitation.role,
        isAdmin: invitation.role === "admin" ? "true" : "false",
        isActive: "true",
        profileImageUrl: null,
        poste: null,
        equipe: null,
        entity: inviter.entity
        // Inherit entity from inviter
      });
      await storage.updateInvitation(invitation.id, {
        status: "accepted",
        acceptedAt: /* @__PURE__ */ new Date()
      });
      req.session.regenerate((err) => {
        if (err) {
          console.error("Session regeneration error:", err);
        }
      });
      req.session.userId = user.id;
      req.session.entity = user.entity;
      req.session.role = user.role;
      req.session.isAdmin = user.isAdmin;
      await new Promise((resolve, reject) => {
        req.session.save((err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
      const { password: _, ...userWithoutPassword } = user;
      res.json({
        message: "Compte cr\xE9\xE9 avec succ\xE8s",
        user: userWithoutPassword
      });
    } catch (error) {
      console.error("Error in /api/auth/accept-invite:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const users4 = await storage.getAllUsers();
      const usersWithoutPasswords = users4.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      console.error("Error in /api/admin/users:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.patch("/api/admin/users/:userId", isAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const updates = req.body;
      delete updates.id;
      delete updates.createdAt;
      delete updates.updatedAt;
      if (updates.password) {
        updates.password = await hashPassword(updates.password);
      }
      const user = await storage.updateUser(userId, updates);
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error in /api/admin/users/:userId:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.patch("/api/admin/users/:userId/role", isAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const { role } = req.body;
      if (!role || !["admin", "commercial"].includes(role)) {
        return res.status(400).json({ error: 'R\xF4le invalide. Doit \xEAtre "admin" ou "commercial".' });
      }
      const user = await storage.updateUser(userId, {
        role,
        isAdmin: role === "admin" ? "true" : "false"
      });
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error in /api/admin/users/:userId/role:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.patch("/api/admin/users/:userId/toggle-active", isAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const currentUser = await storage.getUser(userId);
      if (!currentUser) {
        return res.status(404).json({ error: "Utilisateur non trouv\xE9" });
      }
      const newStatus = currentUser.isActive === "true" ? "false" : "true";
      const user = await storage.updateUser(userId, {
        isActive: newStatus
      });
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error in /api/admin/users/:userId/toggle-active:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.get("/api/admin/ocr/analytics", isAdmin, async (req, res) => {
    try {
      const { period = "week" } = req.query;
      const startDate = /* @__PURE__ */ new Date();
      if (period === "day") {
        startDate.setDate(startDate.getDate() - 1);
      } else if (period === "week") {
        startDate.setDate(startDate.getDate() - 7);
      } else {
        startDate.setDate(startDate.getDate() - 30);
      }
      const logs = await db.execute(sql25`
        SELECT * FROM ocr_logs
        WHERE created_at >= ${startDate.toISOString()}
        ORDER BY created_at DESC
      `);
      const rows = logs.rows;
      const totalExtractions = rows.length;
      const successfulExtractions = rows.filter((l) => l.success).length;
      const failedExtractions = totalExtractions - successfulExtractions;
      const successRate = totalExtractions > 0 ? Math.round(successfulExtractions / totalExtractions * 100) : 0;
      const avgResponseTime = rows.length > 0 ? Math.round(rows.reduce((sum3, l) => sum3 + (l.response_time_ms || 0), 0) / rows.length) : 0;
      const errorTypes = rows.filter((l) => !l.success).reduce((acc, l) => {
        const type = l.error_type || "unknown";
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});
      res.json({
        period,
        metrics: {
          totalExtractions,
          successfulExtractions,
          failedExtractions,
          successRate,
          avgResponseTime
        },
        errorTypes,
        recentLogs: rows.slice(0, 20)
      });
    } catch (error) {
      console.error("[OCR Analytics] Erreur:", error);
      res.status(500).json({ error: "Erreur r\xE9cup\xE9ration analytics" });
    }
  });
  app2.get("/api/admin/invitations", isAdmin, async (req, res) => {
    try {
      const invitations2 = await storage.getAllInvitations();
      res.json(invitations2);
    } catch (error) {
      console.error("Error in /api/admin/invitations:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.post("/api/admin/invitations", isAdmin, async (req, res) => {
    try {
      const { email, role = "commercial" } = req.body;
      const invitedBy = req.session.userId;
      if (!email) {
        return res.status(400).json({ error: "Email requis" });
      }
      if (!email.toLowerCase().endsWith("@adsgroup-security.com")) {
        return res.status(400).json({
          error: "Seuls les emails @adsgroup-security.com sont autoris\xE9s"
        });
      }
      const existingUser = await storage.getUserByEmail(email.toLowerCase());
      if (existingUser) {
        return res.status(400).json({ error: "Un utilisateur avec cet email existe d\xE9j\xE0" });
      }
      const pendingInvitations = await storage.getPendingInvitations();
      const existingInvitation = pendingInvitations.find(
        (inv) => inv.email.toLowerCase() === email.toLowerCase()
      );
      if (existingInvitation) {
        return res.status(400).json({ error: "Une invitation en attente existe d\xE9j\xE0 pour cet email" });
      }
      const token = await generatePasswordResetToken();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3);
      const invitation = await storage.createInvitation({
        email: email.toLowerCase(),
        role,
        token,
        invitedBy,
        status: "pending",
        expiresAt,
        acceptedAt: null
      });
      const inviteUrl = `${process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : "http://localhost:5000"}/accept-invite?token=${token}`;
      const inviter = await storage.getUser(invitedBy);
      const inviterName = inviter?.firstName ? `${inviter.firstName}${inviter.lastName ? " " + inviter.lastName : ""}` : void 0;
      try {
        await sendInvitationEmail({
          to: email.toLowerCase(),
          inviteUrl,
          role,
          invitedByName: inviterName
        });
        console.log("[ADMIN] Invitation email sent to:", email);
      } catch (emailError) {
        console.error("[ADMIN] Failed to send invitation email:", emailError);
      }
      console.log("[ADMIN] Invitation created:", {
        email,
        role,
        token,
        inviteUrl
      });
      res.json({
        invitation,
        inviteUrl
      });
    } catch (error) {
      console.error("Error in /api/admin/invitations:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.delete("/api/admin/invitations/:invitationId", isAdmin, async (req, res) => {
    try {
      const { invitationId } = req.params;
      await storage.deleteInvitation(invitationId);
      res.json({ message: "Invitation supprim\xE9e" });
    } catch (error) {
      console.error("Error in /api/admin/invitations/:invitationId:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.get("/api/admin/organizations", isAdmin, async (req, res) => {
    try {
      const organizations = await storage.getAllOrganizationEntities();
      res.json(organizations);
    } catch (error) {
      console.error("Error in /api/admin/organizations:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.get("/api/admin/organizations/:id", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const organization = await storage.getOrganizationEntityById(id);
      if (!organization) {
        return res.status(404).json({ error: "Organisation non trouv\xE9e" });
      }
      res.json(organization);
    } catch (error) {
      console.error("Error in /api/admin/organizations/:id:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.post("/api/admin/organizations", isAdmin, async (req, res) => {
    try {
      const validationResult = insertOrganizationEntitySchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          error: "Donn\xE9es invalides",
          details: validationResult.error.issues
        });
      }
      const data = validationResult.data;
      const existingOrg = await storage.getOrganizationEntity(data.entityCode);
      if (existingOrg) {
        return res.status(400).json({ error: "Une organisation avec ce code existe d\xE9j\xE0" });
      }
      const cleanedData = {
        ...data,
        parentEntityCode: data.parentEntityCode || null,
        entityNameFull: data.entityNameFull || null,
        countryCode: data.countryCode || null,
        countryName: data.countryName || null,
        flagEmoji: data.flagEmoji || null
      };
      const organization = await storage.createOrganizationEntity(cleanedData);
      await logCreate(
        req,
        "organization",
        organization.id,
        organization.entityCode,
        organization
      );
      res.json(organization);
    } catch (error) {
      console.error("Error in /api/admin/organizations (POST):", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.put("/api/admin/organizations/:id", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const existingOrg = await storage.getOrganizationEntityById(id);
      if (!existingOrg) {
        return res.status(404).json({ error: "Organisation non trouv\xE9e" });
      }
      const validationResult = insertOrganizationEntitySchema.partial().safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          error: "Donn\xE9es invalides",
          details: validationResult.error.issues
        });
      }
      const data = validationResult.data;
      delete data.id;
      const cleanedData = {
        ...data,
        parentEntityCode: data.parentEntityCode || null,
        entityNameFull: data.entityNameFull || null,
        countryCode: data.countryCode || null,
        countryName: data.countryName || null,
        flagEmoji: data.flagEmoji || null
      };
      const organization = await storage.updateOrganizationEntityById(id, cleanedData);
      await logUpdate(
        req,
        "organization",
        organization.id,
        organization.entityCode,
        existingOrg,
        organization
      );
      res.json(organization);
    } catch (error) {
      console.error("Error in /api/admin/organizations/:id (PUT):", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.delete("/api/admin/organizations/:id", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const existingOrg = await storage.getOrganizationEntityById(id);
      if (!existingOrg) {
        return res.status(404).json({ error: "Organisation non trouv\xE9e" });
      }
      await storage.deleteOrganizationEntity(id);
      await logDelete(
        req,
        "organization",
        id,
        existingOrg.entityCode,
        existingOrg
      );
      res.json({ message: "Organisation supprim\xE9e" });
    } catch (error) {
      console.error("Error in /api/admin/organizations/:id (DELETE):", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.get("/api/admin/teams", isAdmin, async (req, res) => {
    try {
      const teams2 = await storage.getAllTeams();
      const enrichedTeams = await Promise.all(
        teams2.map(async (team) => {
          const members = await storage.getTeamMembers(team.id);
          return {
            ...team,
            memberCount: members.length
          };
        })
      );
      res.json(enrichedTeams);
    } catch (error) {
      console.error("Error in /api/admin/teams (GET):", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.get("/api/admin/teams/stats", isAdmin, async (req, res) => {
    try {
      const teams2 = await storage.getAllTeams();
      const stats = {
        total: teams2.length,
        active: teams2.filter((t) => t.isActive).length,
        inactive: teams2.filter((t) => !t.isActive).length,
        byEntity: teams2.reduce((acc, team) => {
          acc[team.entity] = (acc[team.entity] || 0) + 1;
          return acc;
        }, {})
      };
      res.json(stats);
    } catch (error) {
      console.error("Error in /api/admin/teams/stats (GET):", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.get("/api/admin/teams/:id", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const team = await storage.getTeam(id);
      if (!team) {
        return res.status(404).json({ error: "\xC9quipe non trouv\xE9e" });
      }
      const members = await storage.getTeamMembers(id);
      const membersWithUserInfo = await Promise.all(
        members.map(async (member) => {
          const user = await storage.getUser(member.userId);
          return {
            ...member,
            user: user ? {
              email: user.email,
              username: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email
            } : null
          };
        })
      );
      res.json({
        ...team,
        members: membersWithUserInfo,
        memberCount: membersWithUserInfo.length
      });
    } catch (error) {
      console.error("Error in /api/admin/teams/:id (GET):", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.post("/api/admin/teams", isAdmin, async (req, res) => {
    try {
      const validationResult = insertTeamSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          error: "Donn\xE9es invalides",
          details: validationResult.error.issues
        });
      }
      const data = validationResult.data;
      const cleanedData = {
        ...data,
        description: data.description || null,
        managerId: data.managerId || null,
        parentTeamId: data.parentTeamId || null,
        monthlyTargetCa: data.monthlyTargetCa || null,
        monthlyTargetMeetings: data.monthlyTargetMeetings || null,
        monthlyTargetSignatures: data.monthlyTargetSignatures || null,
        createdBy: req.session.userId,
        updatedBy: req.session.userId
      };
      const team = await storage.createTeam(cleanedData);
      await logCreate(
        req,
        "team",
        team.id,
        team.name,
        team
      );
      res.json(team);
    } catch (error) {
      console.error("Error in /api/admin/teams (POST):", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.put("/api/admin/teams/:id", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const existingTeam = await storage.getTeam(id);
      if (!existingTeam) {
        return res.status(404).json({ error: "\xC9quipe non trouv\xE9e" });
      }
      const validationResult = insertTeamSchema.partial().safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          error: "Donn\xE9es invalides",
          details: validationResult.error.issues
        });
      }
      const data = validationResult.data;
      delete data.id;
      const cleanedData = {
        ...data,
        description: data.description || null,
        managerId: data.managerId || null,
        parentTeamId: data.parentTeamId || null,
        monthlyTargetCa: data.monthlyTargetCa || null,
        monthlyTargetMeetings: data.monthlyTargetMeetings || null,
        monthlyTargetSignatures: data.monthlyTargetSignatures || null,
        updatedBy: req.session.userId
      };
      const team = await storage.updateTeam(id, cleanedData);
      await logUpdate(
        req,
        "team",
        team.id,
        team.name,
        existingTeam,
        team
      );
      res.json(team);
    } catch (error) {
      console.error("Error in /api/admin/teams/:id (PUT):", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.delete("/api/admin/teams/:id", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const existingTeam = await storage.getTeam(id);
      if (!existingTeam) {
        return res.status(404).json({ error: "\xC9quipe non trouv\xE9e" });
      }
      await storage.deleteTeam(id);
      await logDelete(
        req,
        "team",
        id,
        existingTeam.name,
        existingTeam
      );
      res.json({ message: "\xC9quipe supprim\xE9e" });
    } catch (error) {
      console.error("Error in /api/admin/teams/:id (DELETE):", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.post("/api/admin/teams/:teamId/members", isAdmin, async (req, res) => {
    try {
      const { teamId } = req.params;
      const existingTeam = await storage.getTeam(teamId);
      if (!existingTeam) {
        return res.status(404).json({ error: "\xC9quipe non trouv\xE9e" });
      }
      const validationResult = insertTeamMemberSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          error: "Donn\xE9es invalides",
          details: validationResult.error.issues
        });
      }
      const data = validationResult.data;
      const isAlreadyMember = await storage.isUserInTeam(teamId, data.userId);
      if (isAlreadyMember) {
        return res.status(400).json({ error: "Utilisateur d\xE9j\xE0 membre de cette \xE9quipe" });
      }
      const member = await storage.addTeamMember(data);
      res.json(member);
    } catch (error) {
      console.error("Error in /api/admin/teams/:teamId/members (POST):", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.put("/api/admin/teams/:teamId/members/:memberId", isAdmin, async (req, res) => {
    try {
      const { role } = req.body;
      if (!role) {
        return res.status(400).json({ error: "Le r\xF4le est requis" });
      }
      res.json({ message: "Fonctionnalit\xE9 \xE0 impl\xE9menter" });
    } catch (error) {
      console.error("Error in /api/admin/teams/:teamId/members/:memberId (PUT):", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.delete("/api/admin/teams/:teamId/members/:memberId", isAdmin, async (req, res) => {
    try {
      const { teamId, memberId } = req.params;
      const existingTeam = await storage.getTeam(teamId);
      if (!existingTeam) {
        return res.status(404).json({ error: "\xC9quipe non trouv\xE9e" });
      }
      await storage.removeTeamMemberById(memberId);
      res.json({ message: "Membre retir\xE9 de l'\xE9quipe" });
    } catch (error) {
      console.error("Error in /api/admin/teams/:teamId/members/:memberId (DELETE):", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.get("/api/admin/audit-logs", isAdmin, async (req, res) => {
    try {
      const { userId, action, entityType, limit, offset, startDate, endDate } = req.query;
      const filters = {};
      if (userId) filters.userId = userId;
      if (action) filters.action = action;
      if (entityType) filters.entityType = entityType;
      if (limit) filters.limit = parseInt(limit);
      if (offset) filters.offset = parseInt(offset);
      const logs = await storage.getAuditLogs(filters);
      res.json(logs);
    } catch (error) {
      console.error("Error in /api/admin/audit-logs (GET):", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.get("/api/admin/audit-logs/stats", isAdmin, async (req, res) => {
    try {
      const allLogs = await storage.getAuditLogs({});
      const stats = {
        total: allLogs.length,
        byAction: {},
        byEntityType: {},
        byUser: {}
      };
      allLogs.forEach((log2) => {
        if (log2.action) {
          stats.byAction[log2.action] = (stats.byAction[log2.action] || 0) + 1;
        }
        if (log2.entityType) {
          stats.byEntityType[log2.entityType] = (stats.byEntityType[log2.entityType] || 0) + 1;
        }
        if (log2.userName) {
          stats.byUser[log2.userName] = (stats.byUser[log2.userName] || 0) + 1;
        }
      });
      res.json(stats);
    } catch (error) {
      console.error("Error in /api/admin/audit-logs/stats (GET):", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.get("/api/admin/stats", isAdmin, async (req, res) => {
    try {
      const users4 = await storage.getAllUsers();
      const invitations2 = await storage.getPendingInvitations();
      const prospects3 = await storage.getUserProspects(req.session.userId);
      const opportunities4 = await storage.getUserOpportunities(req.session.userId);
      const activeUsers = users4.filter((u) => u.isActive === "true").length;
      const adminCount = users4.filter((u) => u.role === "admin").length;
      const commercialCount = users4.filter((u) => u.role === "commercial").length;
      res.json({
        totalUsers: users4.length,
        activeUsers,
        adminCount,
        commercialCount,
        pendingInvitations: invitations2.length,
        totalProspects: prospects3.length,
        totalOpportunities: opportunities4.length
      });
    } catch (error) {
      console.error("Error in /api/admin/stats:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.get("/api/admin/api-security/stats", isAdmin, async (req, res) => {
    try {
      const quotas = await quotaManager.getAllQuotas();
      const incidents = await incidentManager.getRecentIncidents(50);
      res.json({
        quotas,
        incidents,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("Error in /api/admin/api-security/stats:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.get("/api/admin/auto-enrichment/stats", isAdmin, async (req, res) => {
    try {
      console.log("[P3.3] \u{1F4CA} R\xE9cup\xE9ration stats auto-enrichissement...");
      const qualityStats = await getQualityStats();
      const candidates = await getEnrichmentCandidates(10);
      const enrichmentStatusStats = await db.execute(sql25`
        SELECT 
          enrichment_status,
          COUNT(*) as count
        FROM prospects
        WHERE enrichment_status IS NOT NULL
        GROUP BY enrichment_status
      `);
      const statusCounts = enrichmentStatusStats.rows.reduce((acc, row) => {
        acc[row.enrichment_status] = parseInt(row.count);
        return acc;
      }, {});
      const last24hStats = await db.execute(sql25`
        SELECT 
          COUNT(*) as enriched_last_24h
        FROM prospects
        WHERE last_enrichment_date >= NOW() - INTERVAL '24 hours'
      `);
      const enrichedLast24h = last24hStats.rows[0] ? parseInt(last24hStats.rows[0].enriched_last_24h) : 0;
      res.json({
        qualityStats,
        enrichmentStatus: {
          enriched: statusCounts.enriched || 0,
          pending: statusCounts.pending || 0,
          failed: statusCounts.failed || 0
        },
        enrichedLast24h,
        nextCandidates: candidates.map((c) => ({
          id: c.id,
          entreprise: c.entreprise,
          score: c.data_quality_score || 0,
          lastEnriched: c.last_enrichment_date,
          status: c.enrichment_status
        })),
        cronSchedule: "3h00 du matin (Europe/Paris)",
        maxPerNight: 100
      });
    } catch (error) {
      console.error("[P3.3] \u274C Error in /api/admin/auto-enrichment/stats:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.post("/api/admin/auto-enrichment/backfill-scores", isAdmin, async (req, res) => {
    try {
      console.log("[P3.3] \u{1F504} Backfill data quality scores d\xE9marr\xE9...");
      const BATCH_SIZE = 100;
      let offset = 0;
      let totalUpdated = 0;
      const { calculateDataQualityScore: calculateDataQualityScore2 } = await Promise.resolve().then(() => (init_dataQualityService(), dataQualityService_exports));
      while (true) {
        const batch = await db.execute(sql25`
          SELECT * FROM prospects
          ORDER BY id
          LIMIT ${BATCH_SIZE}
          OFFSET ${offset}
        `);
        if (batch.rows.length === 0) break;
        for (const prospect of batch.rows) {
          const newScore = calculateDataQualityScore2(prospect);
          await db.execute(sql25`
            UPDATE prospects
            SET data_quality_score = ${newScore}
            WHERE id = ${prospect.id}
          `);
          totalUpdated++;
        }
        console.log(`[P3.3] \u{1F4E6} Batch ${offset / BATCH_SIZE + 1} trait\xE9: ${batch.rows.length} prospects`);
        offset += BATCH_SIZE;
        if (batch.rows.length < BATCH_SIZE) break;
      }
      console.log(`[P3.3] \u2705 Backfill termin\xE9: ${totalUpdated} prospects mis \xE0 jour`);
      res.json({
        success: true,
        message: `${totalUpdated} prospects mis \xE0 jour`,
        updated: totalUpdated
      });
    } catch (error) {
      console.error("[P3.3] \u274C Error in /api/admin/auto-enrichment/backfill-scores:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.post("/api/admin/api-security/reset-quotas", isAdmin, async (req, res) => {
    try {
      const { apiSource } = req.body;
      console.log("[API SECURITY] R\xE9initialisation des quotas demand\xE9e:", apiSource || "TOUS");
      if (apiSource) {
        await pool.query(
          `UPDATE api_quotas 
           SET compteur_jour = 0,
               compteur_heure = 0,
               compteur_minute = 0,
               status = 'ok',
               last_reset_jour = NOW(),
               last_reset_heure = NOW(),
               last_reset_minute = NOW(),
               updated_at = NOW()
           WHERE api_source = $1`,
          [apiSource]
        );
        console.log(`[API SECURITY] Quota r\xE9initialis\xE9 pour ${apiSource}`);
        res.json({ success: true, message: `Quota r\xE9initialis\xE9 pour ${apiSource}` });
      } else {
        const result = await pool.query(
          `UPDATE api_quotas 
           SET compteur_jour = 0,
               compteur_heure = 0,
               compteur_minute = 0,
               status = 'ok',
               last_reset_jour = NOW(),
               last_reset_heure = NOW(),
               last_reset_minute = NOW(),
               updated_at = NOW()`
        );
        console.log(`[API SECURITY] Tous les quotas r\xE9initialis\xE9s (${result.rowCount} APIs)`);
        res.json({ success: true, message: `${result.rowCount} quotas r\xE9initialis\xE9s` });
      }
    } catch (error) {
      console.error("[API SECURITY] Erreur lors de la r\xE9initialisation des quotas:", error);
      res.status(500).json({ error: "Erreur lors de la r\xE9initialisation" });
    }
  });
  app2.get("/api/organization/entities", isAuthenticated, async (req, res) => {
    try {
      const entities = await storage.getAllOrganizationEntities();
      res.json(entities);
    } catch (error) {
      console.error("Error in /api/organization/entities:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.get("/api/organization/stats", isAuthenticated, async (req, res) => {
    try {
      const entities = await storage.getAllOrganizationEntities();
      const users4 = await storage.getAllUsers();
      const totalUsers = users4.length;
      const activeUsers = users4.filter((u) => u.isActive === "true").length;
      const statsByEntity = entities.map((entity) => {
        const entityUsers = users4.filter((u) => u.entity === entity.entityCode);
        const activeEntityUsers = entityUsers.filter((u) => u.isActive === "true");
        return {
          entityCode: entity.entityCode,
          entityName: entity.entityName,
          flagEmoji: entity.flagEmoji,
          level: entity.level,
          totalUsers: entityUsers.length,
          activeUsers: activeEntityUsers.length,
          isActive: entity.isActive
        };
      });
      res.json({
        totalUsers,
        activeUsers,
        totalEntities: entities.length,
        activeEntities: entities.filter((e) => e.isActive).length,
        statsByEntity
      });
    } catch (error) {
      console.error("Error in /api/organization/stats:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.put("/api/organization/entities/:entityCode", isAdmin, async (req, res) => {
    try {
      const { entityCode } = req.params;
      const userRole = req.session.role;
      if (userRole !== "admin_groupe") {
        return res.status(403).json({ error: "Seuls les Admin Groupe peuvent modifier les entit\xE9s organisationnelles" });
      }
      const entity = await storage.getOrganizationEntity(entityCode);
      if (!entity) {
        return res.status(404).json({ error: "Entit\xE9 non trouv\xE9e" });
      }
      const updatedEntity = await storage.updateOrganizationEntity(entityCode, req.body);
      await storage.createAuditLog({
        userId: req.session.userId,
        userEmail: req.session.email,
        userName: `${req.session.firstName || ""} ${req.session.lastName || ""}`.trim(),
        userRole: req.session.role,
        action: "update_organization_entity",
        entityType: "organization_entity",
        entityId: entity.id,
        entityName: entity.entityName,
        changes: req.body,
        oldValues: entity,
        newValues: updatedEntity,
        ipAddress: req.ip || req.headers["x-forwarded-for"],
        userAgent: req.headers["user-agent"],
        endpoint: req.originalUrl,
        method: req.method,
        status: "success"
      });
      res.json(updatedEntity);
    } catch (error) {
      console.error("Error in /api/organization/entities/:entityCode:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.post("/api/teams", isAdmin, async (req, res) => {
    try {
      const team = await storage.createTeam(req.body);
      await storage.createAuditLog({
        userId: req.session.userId,
        userEmail: req.session.email,
        userName: `${req.session.firstName || ""} ${req.session.lastName || ""}`.trim(),
        userRole: req.session.role,
        action: "create_team",
        entityType: "team",
        entityId: team.id,
        entityName: team.name,
        changes: req.body,
        ipAddress: req.ip || req.headers["x-forwarded-for"],
        userAgent: req.headers["user-agent"],
        endpoint: req.originalUrl,
        method: req.method,
        status: "success"
      });
      res.status(201).json(team);
    } catch (error) {
      console.error("Error in POST /api/teams:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.get("/api/teams", isAuthenticated, async (req, res) => {
    try {
      const entityCode = req.query.entity;
      const teams2 = await storage.getAllTeams(entityCode);
      res.json(teams2);
    } catch (error) {
      console.error("Error in GET /api/teams:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.get("/api/teams/:id", isAuthenticated, async (req, res) => {
    try {
      const team = await storage.getTeam(req.params.id);
      if (!team) {
        return res.status(404).json({ error: "\xC9quipe non trouv\xE9e" });
      }
      res.json(team);
    } catch (error) {
      console.error("Error in GET /api/teams/:id:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.put("/api/teams/:id", isAdmin, async (req, res) => {
    try {
      const oldTeam = await storage.getTeam(req.params.id);
      if (!oldTeam) {
        return res.status(404).json({ error: "\xC9quipe non trouv\xE9e" });
      }
      const updatedTeam = await storage.updateTeam(req.params.id, req.body);
      await storage.createAuditLog({
        userId: req.session.userId,
        userEmail: req.session.email,
        userName: `${req.session.firstName || ""} ${req.session.lastName || ""}`.trim(),
        userRole: req.session.role,
        action: "update_team",
        entityType: "team",
        entityId: updatedTeam.id,
        entityName: updatedTeam.name,
        changes: req.body,
        oldValues: oldTeam,
        newValues: updatedTeam,
        ipAddress: req.ip || req.headers["x-forwarded-for"],
        userAgent: req.headers["user-agent"],
        endpoint: req.originalUrl,
        method: req.method,
        status: "success"
      });
      res.json(updatedTeam);
    } catch (error) {
      console.error("Error in PUT /api/teams/:id:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.delete("/api/teams/:id", isAdmin, async (req, res) => {
    try {
      const team = await storage.getTeam(req.params.id);
      if (!team) {
        return res.status(404).json({ error: "\xC9quipe non trouv\xE9e" });
      }
      await storage.deleteTeam(req.params.id);
      await storage.createAuditLog({
        userId: req.session.userId,
        userEmail: req.session.email,
        userName: `${req.session.firstName || ""} ${req.session.lastName || ""}`.trim(),
        userRole: req.session.role,
        action: "delete_team",
        entityType: "team",
        entityId: team.id,
        entityName: team.name,
        oldValues: team,
        ipAddress: req.ip || req.headers["x-forwarded-for"],
        userAgent: req.headers["user-agent"],
        endpoint: req.originalUrl,
        method: req.method,
        status: "success"
      });
      res.json({ success: true, message: "\xC9quipe supprim\xE9e" });
    } catch (error) {
      console.error("Error in DELETE /api/teams/:id:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.get("/api/teams/:id/members", isAuthenticated, async (req, res) => {
    try {
      const members = await storage.getTeamMembers(req.params.id);
      res.json(members);
    } catch (error) {
      console.error("Error in GET /api/teams/:id/members:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.post("/api/teams/:id/members", isAdmin, async (req, res) => {
    try {
      const { userId, role } = req.body;
      const member = await storage.addTeamMember({
        teamId: req.params.id,
        userId,
        role: role || "member"
      });
      const team = await storage.getTeam(req.params.id);
      await storage.createAuditLog({
        userId: req.session.userId,
        userEmail: req.session.email,
        userName: `${req.session.firstName || ""} ${req.session.lastName || ""}`.trim(),
        userRole: req.session.role,
        action: "add_team_member",
        entityType: "team",
        entityId: req.params.id,
        entityName: team?.name,
        changes: { userId, role },
        ipAddress: req.ip || req.headers["x-forwarded-for"],
        userAgent: req.headers["user-agent"],
        endpoint: req.originalUrl,
        method: req.method,
        status: "success"
      });
      res.status(201).json(member);
    } catch (error) {
      console.error("Error in POST /api/teams/:id/members:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.delete("/api/teams/:id/members/:userId", isAdmin, async (req, res) => {
    try {
      await storage.removeTeamMember(req.params.id, req.params.userId);
      const team = await storage.getTeam(req.params.id);
      await storage.createAuditLog({
        userId: req.session.userId,
        userEmail: req.session.email,
        userName: `${req.session.firstName || ""} ${req.session.lastName || ""}`.trim(),
        userRole: req.session.role,
        action: "remove_team_member",
        entityType: "team",
        entityId: req.params.id,
        entityName: team?.name,
        changes: { removedUserId: req.params.userId },
        ipAddress: req.ip || req.headers["x-forwarded-for"],
        userAgent: req.headers["user-agent"],
        endpoint: req.originalUrl,
        method: req.method,
        status: "success"
      });
      res.json({ success: true, message: "Membre retir\xE9 de l'\xE9quipe" });
    } catch (error) {
      console.error("Error in DELETE /api/teams/:id/members/:userId:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.get("/api/analytics/kpis", isAdmin, async (req, res) => {
    try {
      const entities = await storage.getAllOrganizationEntities();
      const users4 = await storage.getAllUsers();
      const totalUsers = users4.length;
      const activeUsers = users4.filter((u) => u.isActive === "true").length;
      const totalEntities = entities.length;
      const activeEntities = entities.filter((e) => e.isActive).length;
      const kpisByEntity = await Promise.all(
        entities.map(async (entity) => {
          const entityUsers = users4.filter((u) => u.entity === entity.entityCode);
          const activeEntityUsers = entityUsers.filter((u) => u.isActive === "true");
          const prospects3 = await storage.getUserProspects(req.session.userId);
          const opportunities4 = await storage.getUserOpportunities(req.session.userId);
          return {
            entityCode: entity.entityCode,
            entityName: entity.entityName,
            flagEmoji: entity.flagEmoji,
            totalUsers: entityUsers.length,
            activeUsers: activeEntityUsers.length,
            totalProspects: prospects3.length,
            totalOpportunities: opportunities4.length,
            conversionRate: prospects3.length > 0 ? (opportunities4.length / prospects3.length * 100).toFixed(2) : "0.00"
          };
        })
      );
      res.json({
        global: {
          totalUsers,
          activeUsers,
          totalEntities,
          activeEntities,
          inactiveUsers: totalUsers - activeUsers
        },
        byEntity: kpisByEntity,
        generatedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("Error in GET /api/analytics/kpis:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.get("/api/analytics/entity/:entityCode", isAdmin, async (req, res) => {
    try {
      const { entityCode } = req.params;
      const entity = await storage.getOrganizationEntity(entityCode);
      if (!entity) {
        return res.status(404).json({ error: "Entit\xE9 non trouv\xE9e" });
      }
      const users4 = await storage.getAllUsers();
      const entityUsers = users4.filter((u) => u.entity === entityCode);
      const activeEntityUsers = entityUsers.filter((u) => u.isActive === "true");
      const teams2 = await storage.getAllTeams(entityCode);
      const roleDistribution = {
        admin_groupe: entityUsers.filter((u) => u.role === "admin_groupe").length,
        admin: entityUsers.filter((u) => u.role === "admin").length,
        manager: entityUsers.filter((u) => u.role === "manager").length,
        commercial: entityUsers.filter((u) => u.role === "commercial").length
      };
      res.json({
        entity: {
          code: entity.entityCode,
          name: entity.entityName,
          fullName: entity.entityNameFull,
          level: entity.level,
          flagEmoji: entity.flagEmoji,
          isActive: entity.isActive
        },
        users: {
          total: entityUsers.length,
          active: activeEntityUsers.length,
          inactive: entityUsers.length - activeEntityUsers.length,
          byRole: roleDistribution
        },
        teams: {
          total: teams2.length,
          active: teams2.filter((t) => t.isActive).length
        },
        generatedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("Error in GET /api/analytics/entity/:entityCode:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.get("/api/analytics/overview", isAdmin, async (req, res) => {
    try {
      const { period = "30" } = req.query;
      const days = parseInt(period);
      const startDate = /* @__PURE__ */ new Date();
      startDate.setDate(startDate.getDate() - days);
      const prospectsResult = await db.execute(sql25`
        SELECT COUNT(*) as count
        FROM prospects
        WHERE created_at >= ${startDate.toISOString()}
      `);
      const newProspects = parseInt(prospectsResult.rows[0]?.count || "0");
      const opportunitiesResult = await db.execute(sql25`
        SELECT COUNT(*) as count
        FROM opportunities
        WHERE created_at >= ${startDate.toISOString()}
      `);
      const newOpportunities = parseInt(opportunitiesResult.rows[0]?.count || "0");
      const wonResult = await db.execute(sql25`
        SELECT COUNT(*) as count
        FROM opportunities
        WHERE statut = 'Gagné' AND created_at >= ${startDate.toISOString()}
      `);
      const wonDeals = parseInt(wonResult.rows[0]?.count || "0");
      const totalProspectsResult = await db.execute(sql25`SELECT COUNT(*) as count FROM prospects`);
      const totalProspects = parseInt(totalProspectsResult.rows[0]?.count || "0");
      const totalOppsResult = await db.execute(sql25`SELECT COUNT(*) as count FROM opportunities`);
      const totalOpportunities = parseInt(totalOppsResult.rows[0]?.count || "0");
      const conversionRate = totalProspects > 0 ? (totalOpportunities / totalProspects * 100).toFixed(2) : "0.00";
      const winRate = totalOpportunities > 0 ? (wonDeals / totalOpportunities * 100).toFixed(2) : "0.00";
      const trendsResult = await db.execute(sql25`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as prospects_count
        FROM prospects
        WHERE created_at >= NOW() - INTERVAL '7 days'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `);
      const trends = trendsResult.rows.map((row) => ({
        date: row.date,
        prospects: parseInt(row.prospects_count)
      }));
      res.json({
        kpis: {
          totalProspects,
          totalOpportunities,
          newProspects,
          newOpportunities,
          wonDeals,
          conversionRate: parseFloat(conversionRate),
          winRate: parseFloat(winRate)
        },
        trends,
        period: days,
        generatedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("[P3.4] Error in /api/analytics/overview:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.get("/api/analytics/pipeline", isAdmin, async (req, res) => {
    try {
      const pipelineResult = await db.execute(sql25`
        SELECT 
          statut,
          COUNT(*) as count,
          SUM(COALESCE(ca_total, 0)) as total_value
        FROM opportunities
        GROUP BY statut
        ORDER BY count DESC
      `);
      const distribution = pipelineResult.rows.map((row) => ({
        status: row.statut,
        count: parseInt(row.count),
        totalValue: parseFloat(row.total_value || "0")
      }));
      const totalOpps = distribution.reduce((sum3, item) => sum3 + item.count, 0);
      const totalValue = distribution.reduce((sum3, item) => sum3 + item.totalValue, 0);
      res.json({
        distribution,
        summary: {
          totalOpportunities: totalOpps,
          totalValue
        },
        generatedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("[P3.4] Error in /api/analytics/pipeline:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.get("/api/analytics/team", isAdmin, async (req, res) => {
    try {
      const { period = "30" } = req.query;
      const days = parseInt(period);
      const startDate = /* @__PURE__ */ new Date();
      startDate.setDate(startDate.getDate() - days);
      const topPerformersResult = await db.execute(sql25`
        SELECT 
          u.id,
          u.email,
          u.first_name,
          u.last_name,
          u.entity,
          COUNT(o.id) as opportunities_count,
          SUM(CASE WHEN o.statut = 'Gagné' THEN 1 ELSE 0 END) as won_count
        FROM users u
        LEFT JOIN opportunities o ON o.user_id = u.id 
          AND o.created_at >= ${startDate.toISOString()}
        WHERE u.role = 'commercial'
        GROUP BY u.id, u.email, u.first_name, u.last_name, u.entity
        ORDER BY opportunities_count DESC
        LIMIT 10
      `);
      const topPerformers = topPerformersResult.rows.map((row) => ({
        userId: row.id,
        email: row.email,
        prenom: row.first_name || "",
        nom: row.last_name || "",
        entity: row.entity,
        opportunitiesCount: parseInt(row.opportunities_count),
        wonCount: parseInt(row.won_count),
        winRate: parseInt(row.opportunities_count) > 0 ? (parseInt(row.won_count) / parseInt(row.opportunities_count) * 100).toFixed(2) : "0.00"
      }));
      res.json({
        topPerformers,
        period: days,
        generatedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("[P3.4] Error in /api/analytics/team:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.get("/api/audit/logs", isAdmin, async (req, res) => {
    try {
      const {
        userId,
        action,
        entityType,
        limit = "50",
        offset = "0",
        startDate,
        endDate
      } = req.query;
      const filters = {
        userId,
        action,
        entityType,
        limit: parseInt(limit),
        offset: parseInt(offset)
      };
      let logs = await storage.getAuditLogs(filters);
      if (startDate) {
        const start = new Date(startDate);
        logs = logs.filter((log2) => new Date(log2.createdAt) >= start);
      }
      if (endDate) {
        const end = new Date(endDate);
        logs = logs.filter((log2) => new Date(log2.createdAt) <= end);
      }
      const stats = {
        totalLogs: logs.length,
        successCount: logs.filter((l) => l.status === "success").length,
        failureCount: logs.filter((l) => l.status === "failure").length,
        uniqueUsers: [...new Set(logs.map((l) => l.userId))].length,
        uniqueActions: [...new Set(logs.map((l) => l.action))].length
      };
      res.json({
        logs,
        stats,
        filters: {
          userId,
          action,
          entityType,
          limit: parseInt(limit),
          offset: parseInt(offset),
          startDate,
          endDate
        }
      });
    } catch (error) {
      console.error("Error in GET /api/audit/logs:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.get("/api/audit/stats", isAdmin, async (req, res) => {
    try {
      const allLogs = await storage.getAuditLogs({ limit: 1e4 });
      const actionCounts = {};
      allLogs.forEach((log2) => {
        actionCounts[log2.action] = (actionCounts[log2.action] || 0) + 1;
      });
      const entityTypeCounts = {};
      allLogs.forEach((log2) => {
        if (log2.entityType) {
          entityTypeCounts[log2.entityType] = (entityTypeCounts[log2.entityType] || 0) + 1;
        }
      });
      const userCounts = {};
      allLogs.forEach((log2) => {
        if (log2.userId) {
          if (!userCounts[log2.userId]) {
            userCounts[log2.userId] = {
              count: 0,
              email: log2.userEmail || "N/A",
              name: log2.userName || "N/A"
            };
          }
          userCounts[log2.userId].count++;
        }
      });
      const topUsers = Object.entries(userCounts).map(([userId, data]) => ({ userId, ...data })).sort((a, b) => b.count - a.count).slice(0, 10);
      res.json({
        total: allLogs.length,
        successRate: (allLogs.filter((l) => l.status === "success").length / allLogs.length * 100).toFixed(2),
        actionCounts,
        entityTypeCounts,
        topUsers,
        generatedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("Error in GET /api/audit/stats:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.post("/api/media/upload", isAuthenticated, upload.single("file"), async (req, res) => {
    try {
      const userId = req.session.userId;
      const file = req.file;
      const purpose = req.body.purpose || "other";
      if (!file) {
        return res.status(400).json({ error: "Aucun fichier upload\xE9" });
      }
      console.log("[MEDIA UPLOAD] File received:", {
        filename: file.filename,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        purpose
      });
      const fileType = file.mimetype.startsWith("image/") ? "photo" : "video";
      const mediaFile = await storage.createMediaFile({
        userId,
        type: fileType,
        fileUrl: `/uploads/${file.filename}`,
        fileName: file.originalname,
        fileSize: file.size.toString(),
        mimeType: file.mimetype,
        purpose,
        appointmentId: null
      });
      console.log("[MEDIA UPLOAD] Media file saved to database:", mediaFile.id);
      res.json({
        id: mediaFile.id,
        fileUrl: mediaFile.fileUrl,
        fileName: mediaFile.fileName,
        type: fileType,
        message: "Fichier upload\xE9 avec succ\xE8s"
      });
    } catch (error) {
      console.error("Error in /api/media/upload:", error);
      res.status(500).json({ error: "Erreur lors de l'upload" });
    }
  });
  app2.post(
    "/api/analyze-business-card",
    isAuthenticated,
    (req, res, next) => apiProtection("claude_api", req, res, next),
    async (req, res) => {
      try {
        const userId = req.session.userId;
        console.log("[/api/analyze-business-card] Request received from user:", userId);
        console.log("[/api/analyze-business-card] Request body keys:", Object.keys(req.body));
        console.log("[/api/analyze-business-card] Content-Type:", req.headers["content-type"]);
        let imageData;
        if (req.body.imageData) {
          imageData = req.body.imageData.replace(/^data:image\/\w+;base64,/, "");
          console.log("[/api/analyze-business-card] Using base64 image from body, length:", imageData.length);
        } else {
          console.error("[/api/analyze-business-card] No imageData found in request body");
          return res.status(400).json({ error: "Aucune image fournie" });
        }
        console.log("[/api/analyze-business-card] Analyzing business card with Claude Vision...");
        const extractedData = await analyzeBusinessCard(imageData, userId);
        console.log("[/api/analyze-business-card] Analysis complete:", extractedData);
        await quotaManager.incrementCounter("claude_api");
        res.json({
          success: true,
          data: extractedData
        });
      } catch (error) {
        console.error("[/api/analyze-business-card] Error:", error);
        if (error instanceof Error && error.message.includes("API")) {
          await incidentManager.handleApiError({
            source: "claude_api",
            code: 500,
            message: error.message,
            details: { route: "/api/analyze-business-card" }
          });
        }
        res.status(500).json({
          error: error instanceof Error ? error.message : "Erreur lors de l'analyse de la carte de visite"
        });
      }
    }
  );
  app2.post(
    "/api/chat/send",
    isAuthenticated,
    (req, res, next) => apiProtection("claude_api", req, res, next),
    async (req, res) => {
      try {
        const userId = req.session.userId;
        console.log("[/api/chat/send] Request received:", {
          userId,
          content: req.body.content?.slice(0, 50),
          conversationId: req.body.conversationId,
          featureType: req.body.featureType
        });
        const { content, conversationId, featureType } = sendMessageSchema.parse(req.body);
        let actualConversationId = conversationId;
        if (actualConversationId) {
          const conversation = await storage.getConversation(actualConversationId);
          if (!conversation) {
            return res.status(404).json({ error: "Conversation not found" });
          }
          if (conversation.userId !== userId) {
            console.warn("[/api/chat/send] Unauthorized access attempt to conversation:", actualConversationId, "by user:", userId);
            return res.status(403).json({ error: "Access denied to this conversation" });
          }
        }
        if (!actualConversationId) {
          const conversation = await storage.createConversation({
            userId,
            title: content.slice(0, 50) + (content.length > 50 ? "..." : "")
          });
          actualConversationId = conversation.id;
          console.log("[/api/chat/send] New conversation created:", actualConversationId);
        }
        const userMessage = await storage.createMessage({
          conversationId: actualConversationId,
          userId,
          role: "user",
          content,
          featureType: featureType || null
        });
        console.log("[/api/chat/send] User message saved:", userMessage.id);
        const allMessages = await storage.getMessagesByConversation(actualConversationId);
        console.log("[/api/chat/send] Messages in conversation:", allMessages.length);
        const recentMessages = allMessages.slice(-10);
        const conversationHistory = recentMessages.map((msg) => ({
          role: msg.role,
          content: msg.content
        }));
        console.log("[/api/chat/send] Generating AI response...");
        const aiResponse = await generateResponse(content, featureType || null, conversationHistory);
        console.log("[/api/chat/send] AI response generated, length:", aiResponse.length);
        await quotaManager.incrementCounter("claude_api");
        const assistantMessage = await storage.createMessage({
          conversationId: actualConversationId,
          userId,
          role: "assistant",
          content: aiResponse,
          featureType: featureType || null
        });
        console.log("[/api/chat/send] Assistant message saved:", assistantMessage.id);
        const finalMessages = await storage.getMessagesByConversation(actualConversationId);
        console.log("[/api/chat/send] Final message count:", finalMessages.length);
        res.json({
          conversationId: actualConversationId,
          userMessage,
          assistantMessage
        });
      } catch (error) {
        console.error("Error in /api/chat/send:", error);
        if (error instanceof Error && error.message.includes("API")) {
          await incidentManager.handleApiError({
            source: "claude_api",
            code: 500,
            message: error.message,
            details: { route: "/api/chat/send" }
          });
        }
        if (error instanceof z8.ZodError) {
          return res.status(400).json({
            error: "Invalid request data",
            details: error.errors
          });
        }
        res.status(500).json({
          error: error instanceof Error ? error.message : "Internal server error"
        });
      }
    }
  );
  app2.get("/api/messages/:conversationId", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { conversationId } = req.params;
      console.log("[/api/messages/:id] Fetching messages for conversation:", conversationId, "userId:", userId);
      const conversation = await storage.getConversation(conversationId);
      if (!conversation || conversation.userId !== userId) {
        return res.status(403).json({ error: "Conversation not found or access denied" });
      }
      const messages2 = await storage.getMessagesByConversation(conversationId);
      console.log("[/api/messages/:id] Found messages:", messages2.length);
      res.json(messages2);
    } catch (error) {
      console.error("Error in /api/messages:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Internal server error"
      });
    }
  });
  app2.get("/api/conversations", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      console.log("[/api/conversations] Fetching conversations for userId:", userId);
      const conversations2 = await storage.getUserConversations(userId);
      console.log("[/api/conversations] Found conversations:", conversations2.length);
      res.json(conversations2);
    } catch (error) {
      console.error("Error in /api/conversations:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Internal server error"
      });
    }
  });
  app2.get("/api/crm/prospects", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const prospects3 = await storage.getUserProspects(userId);
      res.json({ prospects: prospects3 });
    } catch (error) {
      console.error("Error in /api/crm/prospects:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.get("/api/crm/prospects/a-qualifier", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const prospects3 = await storage.getProspectsAQualifier(userId);
      console.log("[PROSPECTS-A-QUALIFIER] R\xE9cup\xE9r\xE9s:", prospects3.length);
      res.json(prospects3);
    } catch (error) {
      console.error("Error in /api/crm/prospects/a-qualifier GET:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.get("/api/crm/prospects/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { id } = req.params;
      const prospect = await storage.getProspect(id, userId);
      if (!prospect) {
        return res.status(404).json({ error: "Prospect non trouv\xE9" });
      }
      res.json(prospect);
    } catch (error) {
      console.error("Error in /api/crm/prospects/:id:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.post("/api/crm/prospects", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const userEntity = req.session.entity;
      const userRole = req.session.role;
      let prospectEntity;
      if (userRole === "admin_groupe") {
        prospectEntity = req.body.entity;
        if (!prospectEntity) {
          return res.status(400).json({
            error: "Admin Groupe doit sp\xE9cifier une entit\xE9"
          });
        }
        if (!["france", "luxembourg", "belgique"].includes(prospectEntity)) {
          return res.status(400).json({
            error: "Entit\xE9 invalide. Valeurs autoris\xE9es : france, luxembourg, belgique"
          });
        }
      } else {
        if (req.body.entity && ["france", "luxembourg", "belgique"].includes(req.body.entity)) {
          prospectEntity = req.body.entity;
          console.log("[PROSPECT-CREATE] Entity fournie dans payload:", prospectEntity);
        } else {
          const detectedEntity = detectEntityFromAddress(req.body.codePostal, req.body.pays);
          if (detectedEntity) {
            prospectEntity = detectedEntity;
            console.log("[PROSPECT-CREATE] Entity auto-d\xE9tect\xE9e:", prospectEntity, "depuis code postal:", req.body.codePostal, "pays:", req.body.pays);
          } else {
            prospectEntity = userEntity;
            console.log("[PROSPECT-CREATE] Entity h\xE9rit\xE9e de l'utilisateur:", prospectEntity);
          }
        }
      }
      const prospect = await storage.createProspect({
        ...req.body,
        entity: prospectEntity,
        userId
      });
      if (req.body.competitorSituation) {
        const {
          concurrentId,
          contractEndDate,
          monthlyAmount,
          notes,
          solutionsInstalled,
          subscriptionType,
          numberOfSites,
          avgContractDurationMonths,
          satisfactionLevel,
          satisfactionNotes
        } = req.body.competitorSituation;
        if (concurrentId && contractEndDate) {
          try {
            const { concurrentSituations: concurrentSituations2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
            const endDate = new Date(contractEndDate);
            const wakeupDate = new Date(endDate);
            wakeupDate.setDate(wakeupDate.getDate() - 240);
            const wakeupDateStr = wakeupDate.toISOString().split("T")[0];
            await db.insert(concurrentSituations2).values({
              entity: prospectEntity,
              prospectId: prospect.id,
              concurrentId,
              contractEndDate,
              wakeupDate: wakeupDateStr,
              monthlyAmount: monthlyAmount ? monthlyAmount.toString() : null,
              detectionSource: "manual",
              detectedBy: userId,
              notes: notes || null,
              status: "future",
              solutionsInstalled: solutionsInstalled || null,
              subscriptionType: subscriptionType || null,
              numberOfSites: numberOfSites || null,
              avgContractDurationMonths: avgContractDurationMonths || null,
              satisfactionLevel: satisfactionLevel || null,
              satisfactionNotes: satisfactionNotes || null
            });
            console.log(`[COMPETITOR] \u2705 Situation concurrente cr\xE9\xE9e pour prospect ${prospect.id} - \xC9ch\xE9ance: ${contractEndDate}, Wakeup: ${wakeupDateStr}`);
          } catch (error) {
            console.error("[COMPETITOR] \u274C Erreur cr\xE9ation situation concurrente:", error);
            console.error("[COMPETITOR] \u274C D\xE9tails:", error.message);
          }
        }
      }
      res.json(prospect);
      const prospectId = prospect.id;
      const siret = prospect.siret;
      if (siret && siret.length === 14 && /^\d{14}$/.test(siret)) {
        if (prospect.isFullyEnriched === "true") {
          console.log(`[ENRICH-FULL] \u23ED\uFE0F Skip - Prospect ${prospectId} d\xE9j\xE0 enrichi`);
        } else {
          console.log(`[ENRICH-FULL] \u{1F680} Lancement enrichissement asynchrone pour prospect ${prospectId}`);
          Promise.resolve().then(() => (init_pappersFullEnrichmentService(), pappersFullEnrichmentService_exports)).then(({ enrichProspectFull: enrichProspectFull2 }) => {
            return enrichProspectFull2(prospectId, siret);
          }).then((success) => {
            if (success) {
              console.log(`[ENRICH-FULL] \u2705 Enrichissement termin\xE9 pour prospect ${prospectId}`);
            } else {
              console.log(`[ENRICH-FULL] \u26A0\uFE0F \xC9chec enrichissement pour prospect ${prospectId}`);
            }
          }).catch((error) => {
            console.error(`[ENRICH-FULL] \u274C Erreur enrichissement async pour ${prospectId}:`, error);
          });
        }
      }
    } catch (error) {
      console.error("Error in /api/crm/prospects POST:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.patch("/api/crm/prospects/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const userRole = req.session.role;
      const { id } = req.params;
      const updateData = { ...req.body };
      if (userRole === "admin_groupe" && req.body.entity) {
        if (!["france", "luxembourg", "belgique"].includes(req.body.entity)) {
          return res.status(400).json({
            error: "Entit\xE9 invalide. Valeurs autoris\xE9es : france, luxembourg, belgique"
          });
        }
        updateData.entity = req.body.entity;
      } else {
        delete updateData.entity;
      }
      const updated = await storage.updateProspect(id, userId, updateData);
      if (!updated) {
        return res.status(404).json({ error: "Prospect non trouv\xE9" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error in /api/crm/prospects/:id PATCH:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.delete("/api/crm/prospects/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { id } = req.params;
      await storage.deleteProspect(id, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error in /api/crm/prospects/:id DELETE:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.post("/api/crm/prospects/partial", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const userEntity = req.session.entity;
      const userRole = req.session.role;
      let prospectEntity;
      if (userRole === "admin_groupe") {
        prospectEntity = req.body.entity;
        if (!prospectEntity) {
          return res.status(400).json({
            error: "Admin Groupe doit sp\xE9cifier une entit\xE9"
          });
        }
        if (!["france", "luxembourg", "belgique"].includes(prospectEntity)) {
          return res.status(400).json({
            error: "Entit\xE9 invalide. Valeurs autoris\xE9es : france, luxembourg, belgique"
          });
        }
      } else {
        if (req.body.entity && ["france", "luxembourg", "belgique"].includes(req.body.entity)) {
          prospectEntity = req.body.entity;
          console.log("[PROSPECTS-A-QUALIFIER] Entity fournie dans payload:", prospectEntity);
        } else {
          const detectedEntity = detectEntityFromAddress(req.body.codePostal, req.body.pays);
          if (detectedEntity) {
            prospectEntity = detectedEntity;
            console.log("[PROSPECTS-A-QUALIFIER] Entity auto-d\xE9tect\xE9e:", prospectEntity, "depuis code postal:", req.body.codePostal, "pays:", req.body.pays);
          } else {
            prospectEntity = userEntity;
            console.log("[PROSPECTS-A-QUALIFIER] Entity h\xE9rit\xE9e de l'utilisateur:", prospectEntity);
          }
        }
      }
      const prospect = await storage.createProspect({
        ...req.body,
        entity: prospectEntity,
        userId,
        statut: "a_qualifier",
        qualificationNeeded: "true",
        source: req.body.source || "carte_visite_terrain"
      });
      console.log("[PROSPECTS-A-QUALIFIER] Prospect partiel cr\xE9\xE9:", prospect.id, "Entity:", prospectEntity);
      res.json(prospect);
    } catch (error) {
      console.error("Error in /api/crm/prospects/partial POST:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.post("/api/crm/prospects/:id/qualify", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { id } = req.params;
      const { siret } = req.body;
      console.log("[QUALIFICATION] Qualification prospect:", id, "SIRET:", siret);
      if (!siret) {
        return res.status(400).json({ error: "SIRET requis" });
      }
      const siretClean = siret.replace(/\s/g, "");
      if (siretClean.length !== 14 || !/^\d{14}$/.test(siretClean)) {
        return res.status(400).json({ error: "SIRET invalide (14 chiffres requis)" });
      }
      const enrichmentResult = await enrichmentOrchestrator.enrichWithCascade(siretClean, "FR");
      if (!enrichmentResult.data) {
        return res.status(404).json({
          error: "Entreprise non trouv\xE9e",
          message: "Aucune entreprise trouv\xE9e pour ce SIRET dans INSEE ou Pappers"
        });
      }
      const enrichedData = enrichmentResult.data;
      console.log("[QUALIFICATION] Enrichissement r\xE9ussi via", enrichmentResult.source, "(co\xFBt:", enrichmentResult.cost, "\u20AC)");
      const updated = await storage.updateProspect(id, userId, {
        siret: siretClean,
        raisonSociale: enrichedData.nom,
        enseigneCommerciale: enrichedData.enseigne || enrichedData.nom,
        adresse1: enrichedData.adresse?.ligne1,
        ville: enrichedData.adresse?.ville,
        codePostal: enrichedData.adresse?.codePostal,
        secteur: enrichedData.secteur,
        capitalSocial: enrichedData.capital,
        formeJuridique: enrichedData.formeJuridique,
        effectifEntreprise: enrichedData.effectif,
        dirigeantPrincipal: enrichedData.dirigeants?.[0]?.nom || null,
        statutEntreprise: enrichedData.statutEntreprise,
        statut: "qualifie",
        qualificationNeeded: "false",
        qualifiedAt: /* @__PURE__ */ new Date(),
        qualifiedBy: userId,
        isFullyEnriched: "true",
        enrichedAt: /* @__PURE__ */ new Date()
      });
      if (!updated) {
        return res.status(404).json({ error: "Prospect non trouv\xE9" });
      }
      console.log("[QUALIFICATION] Prospect qualifi\xE9 avec succ\xE8s:", id);
      res.json({
        success: true,
        prospect: updated,
        enrichmentSource: enrichmentResult.source,
        enrichmentCost: enrichmentResult.cost
      });
    } catch (error) {
      console.error("Error in /api/crm/prospects/:id/qualify POST:", error);
      res.status(500).json({ error: "Erreur lors de la qualification" });
    }
  });
  app2.get("/api/crm/prospects/qualification-stats", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const prospects3 = await storage.getProspectsAQualifier(userId);
      const now = /* @__PURE__ */ new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1e3);
      const stats = {
        total: prospects3.length,
        aujourdhui: prospects3.filter((p) => new Date(p.createdAt) >= today).length,
        cetteSemaine: prospects3.filter((p) => new Date(p.createdAt) >= weekAgo).length,
        plusDe7Jours: prospects3.filter((p) => new Date(p.createdAt) < weekAgo).length,
        delaiMoyenHeures: prospects3.length > 0 ? Math.round(
          prospects3.reduce((sum3, p) => {
            const hours = (now.getTime() - new Date(p.createdAt).getTime()) / (1e3 * 60 * 60);
            return sum3 + hours;
          }, 0) / prospects3.length
        ) : 0
      };
      console.log("[QUALIFICATION-STATS]", stats);
      res.json(stats);
    } catch (error) {
      console.error("Error in /api/crm/prospects/qualification-stats GET:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.get("/api/prospects/:id/for-rdv", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ error: "ID prospect manquant" });
      }
      const prospect = await storage.getProspect(id, userId);
      if (!prospect) {
        return res.status(404).json({ error: "Prospect non trouv\xE9" });
      }
      const rdvData = {
        // Données entreprise
        entreprise: prospect.raisonSociale || prospect.entreprise || prospect.nom,
        enseigne: prospect.enseigneCommerciale || prospect.entreprise,
        siret: prospect.siret,
        secteur: prospect.secteur,
        // Adresse complète
        adresse: prospect.adresse1,
        adresse2: prospect.adresse2,
        ville: prospect.ville,
        codePostal: prospect.codePostal,
        adresseComplete: [
          prospect.adresse1,
          prospect.adresse2,
          `${prospect.codePostal || ""} ${prospect.ville || ""}`.trim()
        ].filter(Boolean).join(", "),
        // Contact principal (le prospect lui-même)
        contactNom: prospect.nom,
        contactPrenom: prospect.prenom,
        contactComplet: prospect.prenom ? `${prospect.prenom} ${prospect.nom}`.trim() : prospect.nom,
        telephone: prospect.telephone,
        email: prospect.email,
        // Données enrichies (si disponibles)
        capitalSocial: prospect.capitalSocial,
        formeJuridique: prospect.formeJuridique,
        effectif: prospect.effectifEntreprise,
        dirigeant: prospect.dirigeantPrincipal,
        dateCreation: prospect.dateCreationEntreprise,
        // Métadonnées
        isFullyEnriched: prospect.isFullyEnriched === "true",
        enrichedAt: prospect.enrichedAt,
        prospectId: prospect.id
      };
      return res.json({
        success: true,
        data: rdvData
      });
    } catch (error) {
      console.error("Erreur r\xE9cup\xE9ration prospect pour RDV:", error);
      return res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.post("/api/prospects/enrich-siret-quick", isAuthenticated, async (req, res) => {
    try {
      const { siret } = req.body;
      if (!siret) {
        return res.status(400).json({
          success: false,
          error: "SIRET manquant"
        });
      }
      const { enrichSiretQuick: enrichSiretQuick2 } = await Promise.resolve().then(() => (init_pappersEnrichmentService(), pappersEnrichmentService_exports));
      const result = await enrichSiretQuick2(siret);
      if (!result.success) {
        return res.status(404).json(result);
      }
      return res.json(result);
    } catch (error) {
      console.error("Error in /api/prospects/enrich-siret-quick:", error);
      return res.status(500).json({
        success: false,
        error: "Erreur serveur"
      });
    }
  });
  app2.get("/api/crm/opportunities", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const opportunities4 = await storage.getUserOpportunities(userId);
      res.json(opportunities4);
    } catch (error) {
      console.error("Error in /api/crm/opportunities:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.get("/api/crm/prospects/:prospectId/opportunities", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { prospectId } = req.params;
      const opportunities4 = await storage.getProspectOpportunities(prospectId, userId);
      res.json(opportunities4);
    } catch (error) {
      console.error("Error in /api/crm/prospects/:prospectId/opportunities:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.post("/api/crm/opportunities", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ error: "Utilisateur non trouv\xE9" });
      const opportunityData = {
        ...req.body,
        userId
      };
      if (opportunityData.dureeEngagementMois) {
        const duree = Number(opportunityData.dureeEngagementMois);
        const rolesChasseurs = ["sdr", "business_developer", "chef_ventes", "responsable_developpement"];
        if (rolesChasseurs.includes(user.role)) {
          if (![36, 48, 60].includes(duree)) {
            return res.status(400).json({
              error: "Dur\xE9e invalide pour votre r\xF4le. Chasseurs: 36, 48 ou 60 mois uniquement"
            });
          }
        } else {
          if (duree < 12 || duree > 60) {
            return res.status(400).json({
              error: "Dur\xE9e invalide. Plage autoris\xE9e: 12-60 mois"
            });
          }
        }
      }
      if (opportunityData.datePremierContact) {
        opportunityData.datePremierContact = new Date(opportunityData.datePremierContact);
      } else {
        opportunityData.datePremierContact = /* @__PURE__ */ new Date();
      }
      if (!opportunityData.sdrCreateurId && user.role === "sdr") {
        opportunityData.sdrCreateurId = userId;
        opportunityData.origineCanal = "visio";
        opportunityData.canalActuel = "visio";
      } else if (!opportunityData.bdRepreneurId && user.role === "business_developer") {
        opportunityData.origineCanal = "terrain";
        opportunityData.canalActuel = "terrain";
      } else if (user.role === "ic") {
        opportunityData.icResponsableId = userId;
        opportunityData.origineCanal = "terrain";
        opportunityData.canalActuel = "terrain";
      }
      const opportunity = await storage.createOpportunity(opportunityData);
      res.json(opportunity);
    } catch (error) {
      console.error("Error in /api/crm/opportunities POST:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.patch("/api/crm/opportunities/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { id } = req.params;
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ error: "Utilisateur non trouv\xE9" });
      const updateData = { ...req.body };
      if (updateData.dureeEngagementMois !== void 0) {
        const duree = Number(updateData.dureeEngagementMois);
        const rolesChasseurs = ["sdr", "business_developer", "chef_ventes", "responsable_developpement"];
        if (rolesChasseurs.includes(user.role)) {
          if (![36, 48, 60].includes(duree)) {
            return res.status(400).json({
              error: "Dur\xE9e invalide pour votre r\xF4le. Chasseurs: 36, 48 ou 60 mois uniquement"
            });
          }
        } else {
          if (duree < 12 || duree > 60) {
            return res.status(400).json({
              error: "Dur\xE9e invalide. Plage autoris\xE9e: 12-60 mois"
            });
          }
        }
      }
      if (updateData.datePremierContact && typeof updateData.datePremierContact === "string") {
        updateData.datePremierContact = new Date(updateData.datePremierContact);
      }
      if (updateData.dateSignature && typeof updateData.dateSignature === "string") {
        updateData.dateSignature = new Date(updateData.dateSignature);
      }
      if (updateData.dateR1 && typeof updateData.dateR1 === "string") {
        updateData.dateR1 = new Date(updateData.dateR1);
      }
      if (updateData.dateR2 && typeof updateData.dateR2 === "string") {
        updateData.dateR2 = new Date(updateData.dateR2);
      }
      const updated = await storage.updateOpportunity(id, userId, updateData);
      if (!updated) {
        return res.status(404).json({ error: "Opportunit\xE9 non trouv\xE9e" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error in /api/crm/opportunities/:id PATCH:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.delete("/api/crm/opportunities/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { id } = req.params;
      await storage.deleteOpportunity(id, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error in /api/crm/opportunities/:id DELETE:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.get("/api/crm/actions", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const actions2 = await storage.getUserActions(userId);
      res.json(actions2);
    } catch (error) {
      console.error("Error in /api/crm/actions:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.get("/api/crm/prospects/:prospectId/actions", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { prospectId } = req.params;
      const actions2 = await storage.getProspectActions(prospectId, userId);
      res.json(actions2);
    } catch (error) {
      console.error("Error in /api/crm/prospects/:prospectId/actions:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.post("/api/crm/actions", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const action = await storage.createAction({
        ...req.body,
        userId
      });
      res.json(action);
    } catch (error) {
      console.error("Error in /api/crm/actions POST:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.patch("/api/crm/actions/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { id } = req.params;
      const updated = await storage.updateAction(id, userId, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Action non trouv\xE9e" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error in /api/crm/actions/:id PATCH:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.delete("/api/crm/actions/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { id } = req.params;
      await storage.deleteAction(id, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error in /api/crm/actions/:id DELETE:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.get("/api/crm/rdvs", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const rdvs2 = await storage.getUserRdvs(userId);
      res.json(rdvs2);
    } catch (error) {
      console.error("Error in /api/crm/rdvs:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.get("/api/crm/prospects/:prospectId/rdvs", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { prospectId } = req.params;
      const rdvs2 = await storage.getProspectRdvs(prospectId, userId);
      res.json(rdvs2);
    } catch (error) {
      console.error("Error in /api/crm/prospects/:prospectId/rdvs:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.post("/api/crm/rdvs", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      let titre = req.body.titre;
      if (!titre) {
        const prospect = req.body.prospectId ? await storage.getProspect(req.body.prospectId, userId) : null;
        const type = req.body.type || "RDV";
        const prospectName = prospect?.nom || "Prospect";
        titre = `${type.charAt(0).toUpperCase() + type.slice(1)} - ${prospectName}`;
      }
      const rdvData = {
        ...req.body,
        userId,
        titre,
        dateRdv: req.body.dateRdv ? new Date(req.body.dateRdv) : void 0
      };
      const rdv = await storage.createRdv(rdvData);
      res.json(rdv);
    } catch (error) {
      console.error("Error in /api/crm/rdvs POST:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.patch("/api/crm/rdvs/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { id } = req.params;
      const updates = {
        ...req.body,
        dateRdv: req.body.dateRdv ? new Date(req.body.dateRdv) : req.body.dateRdv
      };
      const updated = await storage.updateRdv(id, userId, updates);
      if (!updated) {
        return res.status(404).json({ error: "RDV non trouv\xE9" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error in /api/crm/rdvs/:id PATCH:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.delete("/api/crm/rdvs/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { id } = req.params;
      await storage.deleteRdv(id, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error in /api/crm/rdvs/:id DELETE:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.post("/api/workflow/prepare-rdv/:rdvId", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { rdvId } = req.params;
      const { prepareRdv: prepareRdv2 } = await Promise.resolve().then(() => (init_rdvPreparationService(), rdvPreparationService_exports));
      const result = await prepareRdv2(rdvId, userId);
      res.json(result);
    } catch (error) {
      console.error("Error in /api/workflow/prepare-rdv:", error);
      res.status(error.code === "UNAUTHORIZED" ? 403 : 500).json({
        error: error.message || "Erreur lors de la pr\xE9paration du RDV"
      });
    }
  });
  app2.get("/api/workflow/prepare-rdv/:preparationId", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { preparationId } = req.params;
      const { getPreparation: getPreparation2 } = await Promise.resolve().then(() => (init_rdvPreparationService(), rdvPreparationService_exports));
      const preparation = await getPreparation2(preparationId, userId);
      res.json(preparation);
    } catch (error) {
      console.error("Error in /api/workflow/prepare-rdv GET:", error);
      res.status(error.code === "UNAUTHORIZED" ? 403 : 404).json({
        error: error.message || "Pr\xE9paration non trouv\xE9e"
      });
    }
  });
  app2.get("/api/workflow/prepare-rdv", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { listPreparations: listPreparations2 } = await Promise.resolve().then(() => (init_rdvPreparationService(), rdvPreparationService_exports));
      const preparations = await listPreparations2(userId);
      res.json(preparations);
    } catch (error) {
      console.error("Error in /api/workflow/prepare-rdv LIST:", error);
      res.status(500).json({
        error: error.message || "Erreur lors de la r\xE9cup\xE9ration des pr\xE9parations"
      });
    }
  });
  app2.get("/api/prestations", isAuthenticated, async (req, res) => {
    try {
      const prestations = await storage.getAllTypesPrestations();
      res.json(prestations);
    } catch (error) {
      console.error("Error in /api/prestations:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.get("/api/stats/oneshot-performance", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const stats = await storage.getOneShotPerformance(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error in /api/stats/oneshot-performance:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.get("/api/stats/team-oneshot-performance", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "Utilisateur non trouv\xE9" });
      }
      if (!["chef_ventes", "responsable_developpement", "admin"].includes(user.role || "")) {
        return res.status(403).json({ error: "Acc\xE8s r\xE9serv\xE9 aux managers" });
      }
      const allUsers = await storage.getAllUsers();
      const teamMembers2 = allUsers.filter((u) => u.managerId === userId);
      const teamMemberIds = teamMembers2.map((u) => u.id);
      const stats = await storage.getTeamOneShotPerformance(userId, teamMemberIds);
      res.json(stats);
    } catch (error) {
      console.error("Error in /api/stats/team-oneshot-performance:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.patch("/api/crm/opportunities/:id/signer", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { id } = req.params;
      const updated = await storage.updateOpportunity(id, userId, {
        statut: "signe",
        dateSignature: /* @__PURE__ */ new Date()
      });
      if (!updated) {
        return res.status(404).json({ error: "Opportunit\xE9 non trouv\xE9e" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error in /api/crm/opportunities/:id/signer PATCH:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.post("/api/workflow/create-from-card", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ error: "Utilisateur non authentifi\xE9" });
      }
      const {
        createProspect,
        createOpportunity,
        createRdv,
        createAction,
        sendEmail: sendEmail2,
        prospectData,
        opportunityData,
        rdvData,
        actionData
      } = req.body;
      const result = {
        success: true,
        created: {
          prospect: null,
          opportunity: null,
          rdv: null,
          action: null
        },
        documents: {
          pdf_generated: false,
          ical_generated: false,
          email_sent: false
        },
        errors: []
      };
      let prospectId = null;
      let opportunityId = null;
      let rdvId = null;
      if (createProspect && prospectData) {
        try {
          const { competitorSituation, ...prospectDataClean } = prospectData;
          const prospect = await storage.createProspect({
            ...prospectDataClean,
            userId,
            entity: user.entity || "France"
            // Utiliser l'entité de l'utilisateur connecté
          });
          result.created.prospect = prospect;
          prospectId = prospect.id;
          console.log("[WORKFLOW] Prospect cr\xE9\xE9:", prospectId);
          if (competitorSituation && competitorSituation.concurrentId && competitorSituation.contractEndDate) {
            try {
              const { concurrentSituations: concurrentSituations2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
              const endDate = new Date(competitorSituation.contractEndDate);
              const wakeupDate = new Date(endDate);
              wakeupDate.setDate(wakeupDate.getDate() - 240);
              const wakeupDateStr = wakeupDate.toISOString().split("T")[0];
              await db.insert(concurrentSituations2).values({
                entity: user.entity || "france",
                prospectId: prospect.id,
                concurrentId: competitorSituation.concurrentId,
                contractEndDate: competitorSituation.contractEndDate,
                wakeupDate: wakeupDateStr,
                monthlyAmount: competitorSituation.monthlyAmount ? competitorSituation.monthlyAmount.toString() : null,
                detectionSource: "manual",
                detectedBy: userId,
                notes: competitorSituation.notes || null,
                status: "future",
                solutionsInstalled: competitorSituation.solutionsInstalled || null,
                subscriptionType: competitorSituation.subscriptionType || null,
                numberOfSites: competitorSituation.numberOfSites || null,
                avgContractDurationMonths: competitorSituation.avgContractDurationMonths || null,
                satisfactionLevel: competitorSituation.satisfactionLevel || null,
                satisfactionNotes: competitorSituation.satisfactionNotes || null
              });
              console.log(`[WORKFLOW-COMPETITOR] \u2705 Situation concurrente cr\xE9\xE9e pour prospect ${prospect.id} - \xC9ch\xE9ance: ${competitorSituation.contractEndDate}, Wakeup: ${wakeupDateStr}`);
            } catch (error) {
              console.error("[WORKFLOW-COMPETITOR] \u274C Erreur cr\xE9ation situation concurrente:", error);
              console.error("[WORKFLOW-COMPETITOR] \u274C D\xE9tails:", error.message);
            }
          }
        } catch (error) {
          result.errors.push(`Prospect: ${error.message}`);
          console.error("[WORKFLOW] Erreur cr\xE9ation prospect:", error);
        }
      }
      if (createOpportunity && opportunityData) {
        try {
          let defaultStatut = "r1_planifie";
          let defaultCanal = "terrain";
          if (user.role === "sdr") {
            defaultStatut = "r1_visio_planifie";
            defaultCanal = "visio";
          }
          const mappedOpportunityData = {
            titre: opportunityData.nom || opportunityData.titre,
            nombreContrats: opportunityData.nombreContrats || 1,
            abonnementMensuelHt: opportunityData.montant?.toString() || opportunityData.abonnementMensuelHt || "0",
            dureeEngagementMois: opportunityData.dureeEngagementMois || 12,
            typePrestation: opportunityData.typePrestation,
            statut: opportunityData.statut || defaultStatut,
            canalActuel: opportunityData.canalActuel || defaultCanal,
            origineCanal: opportunityData.origineCanal || defaultCanal,
            datePremierContact: opportunityData.datePremierContact || /* @__PURE__ */ new Date(),
            description: opportunityData.description,
            userId,
            entity: user.entity || "France",
            // CRITICAL: Utiliser l'entité de l'utilisateur
            prospectId: prospectId || opportunityData.prospectId || null
          };
          const opportunity = await storage.createOpportunity(mappedOpportunityData);
          result.created.opportunity = opportunity;
          opportunityId = opportunity.id;
          console.log("[WORKFLOW] Opportunit\xE9 cr\xE9\xE9e (one-shot):", opportunityId);
        } catch (error) {
          result.errors.push(`Opportunit\xE9: ${error.message}`);
          console.error("[WORKFLOW] Erreur cr\xE9ation opportunit\xE9:", error);
        }
      }
      if (createRdv && rdvData) {
        try {
          const dateValue = rdvData.date || rdvData.dateRdv;
          const mappedRdvData = {
            titre: rdvData.titre,
            type: rdvData.type,
            dateRdv: typeof dateValue === "string" ? new Date(dateValue) : dateValue,
            duree: rdvData.duree,
            lieu: rdvData.lieu,
            objectif: rdvData.objectif,
            participants: rdvData.participants,
            dossierPreparation: rdvData.dossierPreparation,
            userId,
            prospectId: prospectId || rdvData.prospectId || null,
            opportunityId: opportunityId || rdvData.opportunityId || null
          };
          const rdv = await storage.createRdv(mappedRdvData);
          result.created.rdv = rdv;
          rdvId = rdv.id;
          console.log("[WORKFLOW] RDV cr\xE9\xE9:", rdvId);
        } catch (error) {
          result.errors.push(`RDV: ${error.message}`);
          console.error("[WORKFLOW] Erreur cr\xE9ation RDV:", error);
        }
      }
      if (createAction && actionData) {
        try {
          const dateEcheanceValue = actionData.date_echeance || actionData.datePrevue;
          const mappedActionData = {
            titre: actionData.titre,
            type: actionData.type,
            description: actionData.description,
            datePrevue: typeof dateEcheanceValue === "string" ? new Date(dateEcheanceValue) : dateEcheanceValue,
            statut: actionData.statut,
            priorite: actionData.priorite,
            userId,
            prospectId: prospectId || actionData.prospectId || null,
            opportunityId: opportunityId || actionData.opportunityId || null
          };
          const action = await storage.createAction(mappedActionData);
          result.created.action = action;
          console.log("[WORKFLOW] Action cr\xE9\xE9e:", action.id);
        } catch (error) {
          result.errors.push(`Action: ${error.message}`);
          console.error("[WORKFLOW] Erreur cr\xE9ation action:", error);
        }
      }
      if (result.created.rdv) {
        try {
          const axios6 = (await import("axios")).default;
          const pythonPayload = {
            rdv: result.created.rdv,
            prospect: result.created.prospect,
            opportunity: result.created.opportunity,
            action: result.created.action,
            user_email: sendEmail2 ? user.email : null,
            send_email: sendEmail2 || false
          };
          console.log("[WORKFLOW] Appel service Python pour g\xE9n\xE9ration documents...");
          const pythonResponse = await axios6.post(
            "http://localhost:5001/api/workflow/generate-documents",
            pythonPayload,
            {
              timeout: 3e4,
              headers: { "Content-Type": "application/json" }
            }
          );
          console.log("[WORKFLOW] R\xE9ponse Python:", pythonResponse.data);
          result.documents = {
            pdf_generated: !!pythonResponse.data.pdf_path,
            ical_generated: !!pythonResponse.data.ical_path,
            email_sent: pythonResponse.data.email_sent || false,
            pdf_path: pythonResponse.data.pdf_path,
            ical_path: pythonResponse.data.ical_path,
            email_response: pythonResponse.data.email_response
          };
          if (pythonResponse.data.errors && pythonResponse.data.errors.length > 0) {
            result.errors.push(...pythonResponse.data.errors);
          }
        } catch (error) {
          result.errors.push(`Documents: ${error.message}`);
          console.error("[WORKFLOW] Erreur g\xE9n\xE9ration documents:", error);
        }
      }
      result.success = result.errors.length === 0;
      res.json(result);
    } catch (error) {
      console.error("[WORKFLOW] Erreur globale:", error);
      res.status(500).json({
        success: false,
        error: "Erreur lors de la cr\xE9ation du workflow",
        details: error.message
      });
    }
  });
  app2.post("/api/crm/transferts/demander", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ error: "Utilisateur non trouv\xE9" });
      if (user.role !== "sdr") {
        return res.status(403).json({ error: "Seuls les SDR peuvent demander un transfert BD" });
      }
      const { opportunityId, repreneurId, raison } = req.body;
      if (!opportunityId || !repreneurId || !raison) {
        return res.status(400).json({ error: "Donn\xE9es manquantes" });
      }
      const repreneur = await storage.getUser(repreneurId);
      if (!repreneur) {
        return res.status(400).json({ error: "Repreneur non trouv\xE9" });
      }
      if (!["business_developer", "ic"].includes(repreneur.role)) {
        return res.status(400).json({ error: "Le repreneur doit \xEAtre BD ou IC" });
      }
      const opportunity = await storage.demanderTransfertBd(opportunityId, userId, repreneurId, raison);
      await storage.createNotificationTransfert({
        opportunityId,
        sdrId: userId,
        repreneurId,
        type: "demande_envoyee",
        message: `Demande d'appui BD: ${raison}`,
        lu: "false"
      });
      res.json(opportunity);
    } catch (error) {
      console.error("[TRANSFERT] Erreur demande:", error);
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/crm/transferts/:opportunityId/accepter", isAuthenticated, async (req, res) => {
    try {
      const repreneurId = req.session.userId;
      const user = await storage.getUser(repreneurId);
      if (!user) return res.status(404).json({ error: "Utilisateur non trouv\xE9" });
      if (!["business_developer", "ic"].includes(user.role)) {
        return res.status(403).json({ error: "Seuls les BD et IC peuvent accepter un transfert" });
      }
      const { opportunityId } = req.params;
      const opportunity = await storage.accepterTransfert(opportunityId, repreneurId);
      await storage.createNotificationTransfert({
        opportunityId,
        sdrId: opportunity.sdrCreateurId || "",
        repreneurId,
        type: "accepte",
        message: "Transfert accept\xE9",
        lu: "false"
      });
      res.json(opportunity);
    } catch (error) {
      console.error("[TRANSFERT] Erreur acceptation:", error);
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/crm/transferts/:opportunityId/refuser", isAuthenticated, async (req, res) => {
    try {
      const repreneurId = req.session.userId;
      const user = await storage.getUser(repreneurId);
      if (!user) return res.status(404).json({ error: "Utilisateur non trouv\xE9" });
      if (!["business_developer", "ic"].includes(user.role)) {
        return res.status(403).json({ error: "Seuls les BD et IC peuvent refuser un transfert" });
      }
      const { opportunityId } = req.params;
      const { raison } = req.body;
      const opportunity = await storage.refuserTransfert(opportunityId, repreneurId, raison || "Non pr\xE9cis\xE9");
      await storage.createNotificationTransfert({
        opportunityId,
        sdrId: opportunity.sdrCreateurId || "",
        repreneurId,
        type: "refuse",
        message: `Transfert refus\xE9: ${raison}`,
        lu: "false"
      });
      res.json(opportunity);
    } catch (error) {
      console.error("[TRANSFERT] Erreur refus:", error);
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/crm/affaires-chaudes", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ error: "Utilisateur non trouv\xE9" });
      const affaires = await storage.getAffairesChaudes(userId, user.role);
      res.json(affaires);
    } catch (error) {
      console.error("[AFFAIRES CHAUDES] Erreur:", error);
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/crm/affaires-chaudes/:opportunityId/relancer", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { opportunityId } = req.params;
      const opportunity = await storage.relancerAffaireChaude(opportunityId, userId);
      res.json(opportunity);
    } catch (error) {
      console.error("[AFFAIRES CHAUDES] Erreur relance:", error);
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/opportunities/:opportunityId/cloturer-r1", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { opportunityId } = req.params;
      const { signee, raison } = req.body;
      const opportunity = await storage.cloturerR1(opportunityId, userId, signee === true, raison);
      res.json(opportunity);
    } catch (error) {
      console.error("[R1/R2] Erreur cl\xF4ture R1:", error);
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/opportunities/:opportunityId/positionner-r2", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { opportunityId } = req.params;
      const { dateR2 } = req.body;
      if (!dateR2) {
        return res.status(400).json({ error: "Date R2 requise" });
      }
      const opportunity = await storage.positionnerR2(opportunityId, userId, new Date(dateR2));
      res.json(opportunity);
    } catch (error) {
      console.error("[R1/R2] Erreur positionnement R2:", error);
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/stats/sdr", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const stats = await storage.getStatsSdr(userId);
      res.json(stats);
    } catch (error) {
      console.error("[STATS] Erreur SDR:", error);
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/stats/bd", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const stats = await storage.getStatsBd(userId);
      res.json(stats);
    } catch (error) {
      console.error("[STATS] Erreur BD:", error);
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/stats/ic", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const stats = await storage.getStatsIc(userId);
      res.json(stats);
    } catch (error) {
      console.error("[STATS] Erreur IC:", error);
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/stats/chef", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const stats = await storage.getStatsChef(userId);
      res.json(stats);
    } catch (error) {
      console.error("[STATS] Erreur Chef:", error);
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/notifications/transferts", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ error: "Utilisateur non trouv\xE9" });
      const notifications = await storage.getNotificationsTransfert(userId, user.role);
      res.json(notifications);
    } catch (error) {
      console.error("[NOTIFICATIONS] Erreur:", error);
      res.status(500).json({ error: error.message });
    }
  });
  app2.patch("/api/notifications/transferts/:notificationId/read", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { notificationId } = req.params;
      await storage.markNotificationRead(notificationId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("[NOTIFICATIONS] Erreur lecture:", error);
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/calls/start", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const parsed = startCallSchema.parse(req.body);
      const call = await storage.startCall({
        userId,
        prospectId: parsed.prospectId,
        scriptId: parsed.scriptId || null,
        result: "en_cours",
        // Temporaire jusqu'à fin appel
        startedAt: /* @__PURE__ */ new Date(),
        notes: ""
      });
      res.json(call);
    } catch (error) {
      console.error("[PHONING] Erreur d\xE9marrage appel:", error);
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/calls/:callId/end", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { callId } = req.params;
      const parsed = endCallSchema.parse(req.body);
      const endedAt = /* @__PURE__ */ new Date();
      const existingCall = await storage.getCall(callId, userId);
      if (!existingCall) {
        return res.status(404).json({ error: "Appel non trouv\xE9" });
      }
      const durationSeconds = Math.floor((endedAt.getTime() - new Date(existingCall.startedAt).getTime()) / 1e3);
      const call = await storage.endCall(callId, userId, {
        result: parsed.result,
        endedAt,
        durationSeconds,
        rdvDate: parsed.rdvDate ? new Date(parsed.rdvDate) : null,
        rappelDate: parsed.rappelDate ? new Date(parsed.rappelDate) : null,
        rappelRaison: parsed.rappelRaison || null,
        notes: parsed.notes || existingCall.notes,
        objectionsTraitees: parsed.objectionsTraitees || existingCall.objectionsTraitees,
        summaryAi: parsed.summaryAi || null,
        probabiliteClosing: parsed.probabiliteClosing || null
      });
      res.json(call);
    } catch (error) {
      console.error("[PHONING] Erreur fin appel:", error);
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/calls/:callId", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { callId } = req.params;
      const call = await storage.getCall(callId, userId);
      if (!call) {
        return res.status(404).json({ error: "Appel non trouv\xE9" });
      }
      res.json(call);
    } catch (error) {
      console.error("[PHONING] Erreur r\xE9cup\xE9ration appel:", error);
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/calls", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const limit = req.query.limit ? parseInt(req.query.limit) : 50;
      const calls2 = await storage.getUserCalls(userId, limit);
      res.json(calls2);
    } catch (error) {
      console.error("[PHONING] Erreur liste appels:", error);
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/calls/prospect/:prospectId", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { prospectId } = req.params;
      const calls2 = await storage.getProspectCalls(prospectId, userId);
      res.json(calls2);
    } catch (error) {
      console.error("[PHONING] Erreur appels prospect:", error);
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/call-scripts", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const parsed = createCallScriptSchema.parse(req.body);
      const script = await storage.createCallScript({
        prospectId: parsed.prospectId,
        generatedByUserId: userId,
        scriptContent: parsed.scriptContent,
        discProfileUsed: parsed.discProfileUsed || null,
        secteur: parsed.secteur || null,
        generationSource: parsed.generationSource || "ai_generated"
      });
      res.json(script);
    } catch (error) {
      console.error("[PHONING] Erreur cr\xE9ation script:", error);
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/call-scripts/:scriptId", isAuthenticated, async (req, res) => {
    try {
      const { scriptId } = req.params;
      const script = await storage.getCallScript(scriptId);
      if (!script) {
        return res.status(404).json({ error: "Script non trouv\xE9" });
      }
      res.json(script);
    } catch (error) {
      console.error("[PHONING] Erreur r\xE9cup\xE9ration script:", error);
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/objections", isAuthenticated, async (req, res) => {
    try {
      const objections2 = await storage.getObjections();
      res.json(objections2);
    } catch (error) {
      console.error("[PHONING] Erreur liste objections:", error);
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/call-notes", isAuthenticated, async (req, res) => {
    try {
      const parsed = createCallNoteSchema.parse(req.body);
      const note = await storage.createCallNote({
        callId: parsed.callId,
        noteText: parsed.noteText,
        noteType: parsed.noteType || "general",
        noteTimestamp: /* @__PURE__ */ new Date()
      });
      res.json(note);
    } catch (error) {
      console.error("[PHONING] Erreur cr\xE9ation note:", error);
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/call-notes/:callId", isAuthenticated, async (req, res) => {
    try {
      const { callId } = req.params;
      const notes = await storage.getCallNotes(callId);
      res.json(notes);
    } catch (error) {
      console.error("[PHONING] Erreur r\xE9cup\xE9ration notes:", error);
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/ai/generate-script", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { prospect, commercial } = req.body;
      if (!prospect || !prospect.nom) {
        return res.status(400).json({ error: "Donn\xE9es prospect manquantes (nom requis)" });
      }
      console.log(`[AI SCRIPT] G\xE9n\xE9ration pour prospect ${prospect.nom} (user ${userId})`);
      const pythonResponse = await fetch("http://localhost:5001/api/ai/generate-script", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prospect,
          commercial: commercial || { nom: "Commercial", experience: "senior" }
        })
      });
      if (!pythonResponse.ok) {
        const errorData = await pythonResponse.json().catch(() => ({}));
        console.error("[AI SCRIPT] Erreur service Python:", errorData);
        return res.status(pythonResponse.status).json({
          error: "Erreur g\xE9n\xE9ration script IA",
          details: errorData.detail || "Service Python indisponible"
        });
      }
      const scriptData = await pythonResponse.json();
      console.log(`[AI SCRIPT] Script g\xE9n\xE9r\xE9 en ${scriptData.duration_seconds?.toFixed(2)}s`);
      res.json(scriptData);
    } catch (error) {
      console.error("[AI SCRIPT] Erreur:", error);
      res.status(500).json({ error: "Erreur g\xE9n\xE9ration script IA", message: error.message });
    }
  });
  app2.get("/api/ai/cache-stats", isAuthenticated, async (req, res) => {
    try {
      console.log("[CACHE STATS] R\xE9cup\xE9ration statistiques cache");
      const pythonResponse = await fetch("http://localhost:5001/api/ai/cache-stats", {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });
      if (!pythonResponse.ok) {
        const errorData = await pythonResponse.json().catch(() => ({}));
        console.error("[CACHE STATS] Erreur service Python:", errorData);
        return res.status(pythonResponse.status).json({
          error: "Erreur r\xE9cup\xE9ration stats cache",
          details: errorData.detail || "Service Python indisponible"
        });
      }
      const statsData = await pythonResponse.json();
      console.log(`[CACHE STATS] Stats r\xE9cup\xE9r\xE9es: ${statsData.stats?.entries || 0} entr\xE9es, hit-rate ${statsData.stats?.hit_rate || 0}%`);
      res.json(statsData);
    } catch (error) {
      console.error("[CACHE STATS] Erreur:", error);
      res.status(500).json({ error: "Erreur r\xE9cup\xE9ration stats cache", message: error.message });
    }
  });
  app2.post("/api/patron/search-nom", isAuthenticated, async (req, res) => {
    try {
      console.log("[PATRON SEARCH] Recherche par nom:", req.body.nom_entreprise);
      const pythonResponse = await fetch("http://localhost:5001/api/patron/search-nom", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(req.body)
      });
      if (!pythonResponse.ok) {
        const errorData = await pythonResponse.json().catch(() => ({}));
        console.error("[PATRON SEARCH] Erreur service Python:", errorData);
        return res.status(pythonResponse.status).json({
          error: "Erreur recherche patron",
          details: errorData.detail || "Service Python indisponible"
        });
      }
      const searchData = await pythonResponse.json();
      console.log(`[PATRON SEARCH] ${searchData.count || 0} r\xE9sultat(s) trouv\xE9(s)`);
      res.json(searchData);
    } catch (error) {
      console.error("[PATRON SEARCH] Erreur:", error);
      res.status(500).json({ error: "Erreur recherche patron", message: error.message });
    }
  });
  app2.post("/api/patron/search-siret", isAuthenticated, async (req, res) => {
    try {
      const { siret } = req.body;
      console.log("[PATRON SEARCH] Recherche par SIRET:", siret);
      if (!siret) {
        return res.status(400).json({
          error: "SIRET requis",
          message: "Le SIRET est obligatoire pour la recherche"
        });
      }
      const siretClean = siret.replace(/\s/g, "");
      if (siretClean.length !== 14 || !/^\d{14}$/.test(siretClean)) {
        return res.status(400).json({
          error: "SIRET invalide",
          message: "Le SIRET doit contenir exactement 14 chiffres"
        });
      }
      const { PappersProvider: PappersProvider2 } = await Promise.resolve().then(() => (init_pappers_provider(), pappers_provider_exports));
      const pappersProvider = new PappersProvider2();
      const enrichedData = await pappersProvider.enrichCompany(siretClean, "FR");
      if (!enrichedData) {
        return res.status(404).json({
          error: "Entreprise non trouv\xE9e",
          message: "Aucune entreprise trouv\xE9e pour ce SIRET"
        });
      }
      console.log("[PATRON SEARCH] Donn\xE9es enrichies Phase 2.8:", {
        nom: enrichedData.nom,
        dirigeants: enrichedData.dirigeants?.length || 0,
        alertes: enrichedData.procedureCollective ? "OUI" : "NON",
        gps: enrichedData.adresse?.latitude ? "OUI" : "NON",
        tva: enrichedData.numeroTVA ? "OUI" : "NON"
      });
      const dirigeants = enrichedData.dirigeants || [];
      const principalDirigeant = dirigeants.find(
        (d) => d.fonction?.toLowerCase().includes("g\xE9rant") || d.fonction?.toLowerCase().includes("pr\xE9sident") || d.fonction?.toLowerCase().includes("directeur")
      ) || dirigeants[0];
      if (!principalDirigeant) {
        return res.json({
          success: false,
          result: null,
          count: 0,
          message: "Entreprise trouv\xE9e mais aucun dirigeant identifi\xE9",
          enrichedData
          // Retourner quand même les données enrichies
        });
      }
      const result = {
        // Dirigeant (objet pour compatibilité frontend)
        dirigeant: {
          nom: principalDirigeant.nom || "",
          prenom: principalDirigeant.prenom || "",
          fonction: principalDirigeant.fonction || "G\xE9rant",
          photo_url: null
        },
        // Entreprise basique (noms compatibles frontend)
        raison_sociale: enrichedData.nom || "",
        enseigne_commerciale: enrichedData.nomCommercial || enrichedData.nom || "",
        siret: siretClean,
        siren: siretClean.substring(0, 9),
        secteur: enrichedData.secteurActivite || enrichedData.libelleNAF || "",
        // Adresse complète Phase 2.8
        adresse: enrichedData.adresse?.adresse || "",
        adresse_ligne_2: enrichedData.adresse?.adresseLigne2,
        complement_adresse: enrichedData.adresse?.complementAddress,
        code_postal: enrichedData.adresse?.codePostal || "",
        ville: enrichedData.adresse?.ville || "",
        commune: enrichedData.adresse?.commune,
        departement: enrichedData.adresse?.department,
        region: enrichedData.adresse?.region,
        pays: enrichedData.adresse?.pays || "France",
        // GPS Phase 2.8
        latitude: enrichedData.adresse?.latitude,
        longitude: enrichedData.adresse?.longitude,
        // Coordonnées Phase 2.8
        email: enrichedData.email,
        telephone: enrichedData.telephone,
        site_web: enrichedData.siteWeb,
        // Données métier Phase 2.8
        effectif: enrichedData.effectif,
        effectif_min: enrichedData.effectifMin,
        effectif_max: enrichedData.effectifMax,
        effectif_texte: enrichedData.effectifTexte,
        capital_social: enrichedData.capital,
        tva_intracommunautaire: enrichedData.numeroTVA,
        forme_juridique: enrichedData.formeJuridique,
        forme_juridique_libelle: enrichedData.formeJuridiqueLibelle,
        // Alertes juridiques Phase 2.8
        alerte_juridique: enrichedData.procedureCollective || false,
        procedure_collective: enrichedData.procedureCollective,
        procedure_type: enrichedData.procedureType,
        procedure_collective_libelle: enrichedData.procedureTypeLibelle,
        procedure_collective_date: enrichedData.procedureDate,
        tribunal_commerce: enrichedData.tribunalCommerce,
        // Statut administratif Phase 2.8
        etat_administratif: enrichedData.etatAdministratif,
        date_creation: enrichedData.dateCreation,
        date_cessation: enrichedData.dateCessation
      };
      console.log(`[PATRON SEARCH] \u2705 Dirigeant enrichi Phase 2.8: ${result.dirigeant.prenom} ${result.dirigeant.nom} - ${result.dirigeant.fonction}`);
      console.log(`[PATRON SEARCH] \u2705 Donn\xE9es enrichies: GPS=${!!result.latitude}, TVA=${!!result.tva_intracommunautaire}, Alerte=${!!result.alerte_juridique}`);
      res.json({
        success: true,
        result,
        count: 1,
        message: `Dirigeant trouv\xE9: ${result.dirigeant.prenom} ${result.dirigeant.nom}`
      });
    } catch (error) {
      console.error("[PATRON SEARCH] Erreur:", error);
      res.status(500).json({ error: "Erreur recherche patron", message: error.message });
    }
  });
  app2.post("/api/patron/search-telephone", isAuthenticated, async (req, res) => {
    try {
      console.log("[PATRON SEARCH] Recherche par t\xE9l\xE9phone:", req.body.telephone);
      const pythonResponse = await fetch("http://localhost:5001/api/patron/search-telephone", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(req.body)
      });
      if (!pythonResponse.ok) {
        const errorData = await pythonResponse.json().catch(() => ({}));
        console.error("[PATRON SEARCH] Erreur service Python:", errorData);
        return res.status(pythonResponse.status).json({
          error: "Erreur recherche patron",
          details: errorData.detail || "Service Python indisponible"
        });
      }
      const searchData = await pythonResponse.json();
      console.log(`[PATRON SEARCH] ${searchData.count || 0} r\xE9sultat(s) trouv\xE9(s)`);
      res.json(searchData);
    } catch (error) {
      console.error("[PATRON SEARCH] Erreur:", error);
      res.status(500).json({ error: "Erreur recherche patron", message: error.message });
    }
  });
  app2.post("/api/patron/contacts", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const contactData = req.body;
      console.log("[PATRON CONTACT] Payload re\xE7u:", JSON.stringify(contactData, null, 2));
      console.log("[PATRON CONTACT] SIRET brut:", contactData.siret, "| type:", typeof contactData.siret, "| length:", contactData.siret?.length);
      const siretClean = contactData.siret?.replace(/\s/g, "") || "";
      console.log("[PATRON CONTACT] SIRET nettoy\xE9:", siretClean, "| length:", siretClean.length);
      if (!siretClean || siretClean.length !== 14 || !/^\d{14}$/.test(siretClean)) {
        console.error("[PATRON CONTACT] SIRET invalide:", { siretClean, length: siretClean.length, isNumeric: /^\d{14}$/.test(siretClean) });
        return res.status(400).json({
          error: "SIRET invalide",
          message: "Le SIRET doit contenir exactement 14 chiffres"
        });
      }
      contactData.siret = siretClean;
      const existingContact = await storage.checkPatronContactDuplicate(contactData.siret, userId);
      if (existingContact) {
        return res.status(409).json({
          error: "Doublon d\xE9tect\xE9",
          message: `Un contact existe d\xE9j\xE0 pour ce SIRET : ${existingContact.raisonSociale}`,
          existingContact
        });
      }
      const contact = await storage.createPatronContact({
        ...contactData,
        userId
      });
      console.log(`[PATRON CONTACT] Contact cr\xE9\xE9: ${contact.raisonSociale} (SIRET: ${contact.siret})`);
      const prospectData = {
        userId,
        entity: req.session.entity,
        nom: contactData.dirigeantNom || "",
        prenom: contactData.dirigeantPrenom || "",
        entreprise: contactData.enseigneCommerciale || contactData.raisonSociale,
        enseigneCommerciale: contactData.enseigneCommerciale,
        raisonSociale: contactData.raisonSociale,
        siret: contactData.siret,
        email: contactData.email || null,
        telephone: contactData.telephone || null,
        ville: contactData.ville,
        codePostal: contactData.codePostal,
        secteur: contactData.secteur,
        source: "trouve_moi_le_patron",
        // Source spécifique pour tracking
        statut: "nouveau",
        dirigeantPrincipal: contactData.dirigeantPrenom && contactData.dirigeantNom ? `${contactData.dirigeantPrenom} ${contactData.dirigeantNom}${contactData.dirigeantFonction ? ` - ${contactData.dirigeantFonction}` : ""}` : null,
        pappersRawData: contactData.pappersRawData
      };
      const prospect = await storage.createProspect(prospectData);
      console.log(`[PATRON CONTACT] \u2705 Prospect cr\xE9\xE9 dans CRM: ${prospect.id} - ${prospect.entreprise}`);
      await storage.updatePatronContact(contact.id, userId, {
        addedToCrm: "true",
        crmProspectId: prospect.id
      });
      console.log(`[PATRON CONTACT] \u2705 Lien CRM \xE9tabli: patron_contact ${contact.id} \u2192 prospect ${prospect.id}`);
      res.json({
        ...contact,
        addedToCrm: "true",
        crmProspectId: prospect.id,
        prospectCreated: true
      });
    } catch (error) {
      console.error("[PATRON CONTACT] Erreur cr\xE9ation:", error);
      res.status(500).json({ error: "Erreur cr\xE9ation contact patron", message: error.message });
    }
  });
  app2.get("/api/patron/contacts", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const contacts = await storage.getUserPatronContacts(userId);
      console.log(`[PATRON CONTACTS] ${contacts.length} contacts trouv\xE9s pour user ${userId}`);
      res.json(contacts);
    } catch (error) {
      console.error("[PATRON CONTACTS] Erreur r\xE9cup\xE9ration:", error);
      res.status(500).json({ error: "Erreur r\xE9cup\xE9ration contacts patron", message: error.message });
    }
  });
  app2.get("/api/patron/contacts/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { id } = req.params;
      const contact = await storage.getPatronContact(id, userId);
      if (!contact) {
        return res.status(404).json({ error: "Contact patron non trouv\xE9" });
      }
      res.json(contact);
    } catch (error) {
      console.error("[PATRON CONTACT] Erreur r\xE9cup\xE9ration:", error);
      res.status(500).json({ error: "Erreur r\xE9cup\xE9ration contact patron", message: error.message });
    }
  });
  app2.delete("/api/patron/contacts/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { id } = req.params;
      await storage.deletePatronContact(id, userId);
      console.log(`[PATRON CONTACT] Contact supprim\xE9: ${id}`);
      res.json({ success: true, message: "Contact supprim\xE9" });
    } catch (error) {
      console.error("[PATRON CONTACT] Erreur suppression:", error);
      res.status(500).json({ error: "Erreur suppression contact patron", message: error.message });
    }
  });
  app2.get("/api/prospection/scenarios", isAuthenticated, async (req, res) => {
    try {
      const scenarios2 = await storage.getAllScenarios();
      console.log(`[PROSPECTION] ${scenarios2.length} sc\xE9narios trouv\xE9s`);
      res.json(scenarios2);
    } catch (error) {
      console.error("[PROSPECTION] Erreur r\xE9cup\xE9ration sc\xE9narios:", error);
      res.status(500).json({ error: "Erreur r\xE9cup\xE9ration sc\xE9narios", message: error.message });
    }
  });
  app2.get("/api/prospection/scenarios/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const scenario = await storage.getScenario(id);
      if (!scenario) {
        return res.status(404).json({ error: "Sc\xE9nario non trouv\xE9" });
      }
      const etapes = await storage.getScenarioEtapes(id);
      res.json({
        ...scenario,
        etapes
      });
    } catch (error) {
      console.error("[PROSPECTION] Erreur r\xE9cup\xE9ration sc\xE9nario:", error);
      res.status(500).json({ error: "Erreur r\xE9cup\xE9ration sc\xE9nario", message: error.message });
    }
  });
  app2.get("/api/prospection/campagnes", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const campagnes = await storage.getUserCampagnes(userId);
      console.log(`[PROSPECTION] ${campagnes.length} campagnes trouv\xE9es pour user ${userId}`);
      res.json(campagnes);
    } catch (error) {
      console.error("[PROSPECTION] Erreur r\xE9cup\xE9ration campagnes:", error);
      res.status(500).json({ error: "Erreur r\xE9cup\xE9ration campagnes", message: error.message });
    }
  });
  app2.post("/api/prospection/campagnes", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const campagneSchema = z8.object({
        nom: z8.string().min(1),
        objectif: z8.string().optional().nullable(),
        scenarioId: z8.string().min(1),
        statut: z8.enum(["active", "paused", "completed"]).default("active"),
        dateDebut: z8.string().optional().nullable(),
        dateFin: z8.string().optional().nullable(),
        configEnvoi: z8.object({
          jours: z8.array(z8.string()).optional(),
          heureDebut: z8.string().optional(),
          heureFin: z8.string().optional()
        }).optional(),
        prospectIds: z8.array(z8.string()).optional()
      });
      const data = campagneSchema.parse(req.body);
      const campagne = await storage.createCampagne({
        nom: data.nom,
        objectif: data.objectif || null,
        scenarioId: data.scenarioId,
        userId,
        statut: data.statut,
        dateDebut: data.dateDebut ? new Date(data.dateDebut) : null,
        dateFin: data.dateFin ? new Date(data.dateFin) : null,
        joursEnvoi: data.configEnvoi?.jours || ["lundi", "mardi", "mercredi", "jeudi", "vendredi"],
        heuresEnvoi: {
          debut: data.configEnvoi?.heureDebut || "09:00",
          fin: data.configEnvoi?.heureFin || "18:00"
        }
      });
      if (data.prospectIds && data.prospectIds.length > 0) {
        await storage.addProspectsToCampagne(campagne.id, data.prospectIds);
        console.log(`[PROSPECTION] ${data.prospectIds.length} prospects ajout\xE9s \xE0 la campagne ${campagne.id}`);
      }
      console.log(`[PROSPECTION] Campagne cr\xE9\xE9e: ${campagne.id} par user ${userId}`);
      res.json(campagne);
    } catch (error) {
      console.error("[PROSPECTION] Erreur cr\xE9ation campagne:", error);
      res.status(400).json({ error: "Erreur cr\xE9ation campagne", message: error.message });
    }
  });
  app2.get("/api/prospection/campagnes/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { id } = req.params;
      const campagne = await storage.getCampagne(id, userId);
      if (!campagne) {
        return res.status(404).json({ error: "Campagne non trouv\xE9e" });
      }
      res.json(campagne);
    } catch (error) {
      console.error("[PROSPECTION] Erreur r\xE9cup\xE9ration campagne:", error);
      res.status(500).json({ error: "Erreur r\xE9cup\xE9ration campagne", message: error.message });
    }
  });
  app2.patch("/api/prospection/campagnes/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { id } = req.params;
      const updateSchema = z8.object({
        nom: z8.string().optional(),
        objectif: z8.string().optional().nullable(),
        description: z8.string().optional().nullable(),
        statut: z8.enum(["active", "paused", "completed"]).optional(),
        dateDebut: z8.string().optional().nullable(),
        dateFin: z8.string().optional().nullable(),
        joursEnvoi: z8.array(z8.string()).optional(),
        heuresEnvoi: z8.object({
          debut: z8.string(),
          fin: z8.string()
        }).optional(),
        objectifNombreProspects: z8.number().optional().nullable(),
        objectifTauxReponse: z8.number().optional().nullable()
      });
      const data = updateSchema.parse(req.body);
      const updatedData = { ...data };
      if (data.dateDebut !== void 0) {
        updatedData.dateDebut = data.dateDebut ? new Date(data.dateDebut) : null;
      }
      if (data.dateFin !== void 0) {
        updatedData.dateFin = data.dateFin ? new Date(data.dateFin) : null;
      }
      const campagne = await storage.updateCampagne(id, userId, updatedData);
      console.log(`[PROSPECTION] Campagne mise \xE0 jour: ${id}`);
      res.json(campagne);
    } catch (error) {
      console.error("[PROSPECTION] Erreur mise \xE0 jour campagne:", error);
      res.status(400).json({ error: "Erreur mise \xE0 jour campagne", message: error.message });
    }
  });
  app2.delete("/api/prospection/campagnes/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { id } = req.params;
      await storage.deleteCampagne(id, userId);
      console.log(`[PROSPECTION] Campagne supprim\xE9e: ${id}`);
      res.json({ success: true, message: "Campagne supprim\xE9e" });
    } catch (error) {
      console.error("[PROSPECTION] Erreur suppression campagne:", error);
      res.status(500).json({ error: "Erreur suppression campagne", message: error.message });
    }
  });
  app2.post("/api/prospection/campagnes/:id/prospects", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { id: campagneId } = req.params;
      const addProspectsSchema = z8.object({
        prospectIds: z8.array(z8.string()).min(1)
      });
      const { prospectIds } = addProspectsSchema.parse(req.body);
      const campagne = await storage.getCampagne(campagneId, userId);
      if (!campagne) {
        return res.status(404).json({ error: "Campagne non trouv\xE9e" });
      }
      const prospectsAjoutes = [];
      for (const prospectId of prospectIds) {
        const prospect = await storage.getProspect(prospectId);
        let enrichedData = {};
        if (prospect && prospect.entreprise) {
          console.log(`\u{1F50D} [PAPPERS] Auto-enrichissement: ${prospect.entreprise}`);
          const enrichmentResult = await enrichProspectWithPappers(
            prospect.entreprise,
            prospect.siren || void 0
          );
          if (enrichmentResult.success && enrichmentResult.enrichedData) {
            enrichedData = enrichmentResult.enrichedData;
            await storage.updateProspect(prospectId, {
              siren: enrichedData.siren || prospect.siren,
              secteur: enrichedData.secteur || prospect.secteur,
              ville: enrichedData.ville || prospect.ville,
              codePostal: enrichedData.code_postal || prospect.codePostal,
              telephone: enrichedData.telephone || prospect.telephone
            });
            console.log(`\u2705 [PAPPERS] Prospect ${prospectId} enrichi avec succ\xE8s`);
          } else {
            console.warn(`\u26A0\uFE0F [PAPPERS] Enrichissement \xE9chou\xE9 pour ${prospect.entreprise}: ${enrichmentResult.error}`);
          }
        }
        const prospectEnProspection = await storage.addProspectToCampagne({
          campagneId,
          prospectId,
          statut: "active",
          etapeActuelle: 0
        });
        prospectsAjoutes.push(prospectEnProspection);
      }
      console.log(`[PROSPECTION] ${prospectsAjoutes.length} prospects ajout\xE9s \xE0 campagne ${campagneId}`);
      res.json({ success: true, count: prospectsAjoutes.length, prospects: prospectsAjoutes });
    } catch (error) {
      console.error("[PROSPECTION] Erreur ajout prospects \xE0 campagne:", error);
      res.status(400).json({ error: "Erreur ajout prospects", message: error.message });
    }
  });
  app2.get("/api/prospection/campagnes/:id/prospects", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { id: campagneId } = req.params;
      const campagne = await storage.getCampagne(campagneId, userId);
      if (!campagne) {
        return res.status(404).json({ error: "Campagne non trouv\xE9e" });
      }
      const prospects3 = await storage.getCampagneProspects(campagneId, userId);
      console.log(`[PROSPECTION] ${prospects3.length} prospects trouv\xE9s pour campagne ${campagneId}`);
      res.json(prospects3);
    } catch (error) {
      console.error("[PROSPECTION] Erreur r\xE9cup\xE9ration prospects campagne:", error);
      res.status(500).json({ error: "Erreur r\xE9cup\xE9ration prospects", message: error.message });
    }
  });
  app2.get("/api/prospection/campagnes/:id/interactions", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { id: campagneId } = req.params;
      const campagne = await storage.getCampagne(campagneId, userId);
      if (!campagne) {
        return res.status(404).json({ error: "Campagne non trouv\xE9e" });
      }
      const interactions = await storage.getCampagneInteractions(campagneId, userId);
      console.log(`[PROSPECTION] ${interactions.length} interactions trouv\xE9es pour campagne ${campagneId}`);
      res.json(interactions);
    } catch (error) {
      console.error("[PROSPECTION] Erreur r\xE9cup\xE9ration interactions:", error);
      res.status(500).json({ error: "Erreur r\xE9cup\xE9ration interactions", message: error.message });
    }
  });
  app2.get("/api/prospection/analytics/global-stats", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const stats = await storage.getAnalyticsGlobalStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("[PROSPECTION] Erreur r\xE9cup\xE9ration stats globales:", error);
      res.status(500).json({ error: "Erreur r\xE9cup\xE9ration stats globales", message: error.message });
    }
  });
  app2.get("/api/prospection/analytics/conversion-funnel", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const funnel = await storage.getAnalyticsConversionFunnel(userId);
      res.json(funnel);
    } catch (error) {
      console.error("[PROSPECTION] Erreur r\xE9cup\xE9ration funnel:", error);
      res.status(500).json({ error: "Erreur r\xE9cup\xE9ration funnel", message: error.message });
    }
  });
  app2.get("/api/prospection/analytics/top-messages", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const topMessages = await storage.getAnalyticsTopMessages(userId);
      res.json(topMessages);
    } catch (error) {
      console.error("[PROSPECTION] Erreur r\xE9cup\xE9ration top messages:", error);
      res.status(500).json({ error: "Erreur r\xE9cup\xE9ration top messages", message: error.message });
    }
  });
  app2.get("/api/prospection/analytics/ab-variants", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const db2 = storage.getDb();
      const variants = await db2.select().from(messageVariants).where(eq(messageVariants.userId, userId));
      const variantsWithScore = await Promise.all(
        variants.map(async (variant) => {
          const metrics = await storage.getVariantMetrics(variant.id);
          const sent = metrics?.sent || 0;
          const positives = (metrics?.replied || 0) + (metrics?.accepted || 0) * 2;
          const negatives = (metrics?.rejected || 0) + (metrics?.bounced || 0);
          const score = sent > 0 ? (positives - negatives) / sent : 0;
          return {
            id: variant.id,
            variantName: variant.variantName,
            canal: variant.canal,
            metrics: {
              sent: metrics?.sent || 0,
              opened: metrics?.opened || 0,
              clicked: metrics?.clicked || 0,
              replied: metrics?.replied || 0,
              accepted: metrics?.accepted || 0,
              rejected: metrics?.rejected || 0,
              bounced: metrics?.bounced || 0
            },
            score: Math.round(score * 1e3) / 1e3,
            openRate: sent > 0 ? Math.round((metrics?.opened || 0) / sent * 100) : 0,
            clickRate: sent > 0 ? Math.round((metrics?.clicked || 0) / sent * 100) : 0,
            replyRate: sent > 0 ? Math.round((metrics?.replied || 0) / sent * 100) : 0
          };
        })
      );
      const topVariants = variantsWithScore.filter((v) => v.metrics.sent > 0).sort((a, b) => b.score - a.score).slice(0, 10);
      res.json(topVariants);
    } catch (error) {
      console.error("[A/B TESTING] Erreur r\xE9cup\xE9ration variants analytics:", error);
      res.status(500).json({ error: "Erreur r\xE9cup\xE9ration variants analytics", message: error.message });
    }
  });
  app2.post("/api/prospection/variants", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { campagneId, etapeId, canal, variantName, messageTemplate, sujetEmail } = req.body;
      if (!campagneId || !etapeId || !canal || !variantName || !messageTemplate) {
        return res.status(400).json({ error: "Donn\xE9es manquantes (campagneId, etapeId, canal, variantName, messageTemplate requis)" });
      }
      const campagne = await storage.getCampagne(campagneId, userId);
      if (!campagne) {
        return res.status(404).json({ error: "Campagne non trouv\xE9e" });
      }
      const variant = await storage.createVariant({
        campagneId,
        etapeId,
        canal,
        variantName,
        messageTemplate,
        sujetEmail: sujetEmail || null,
        isActive: "true"
      });
      res.json(variant);
    } catch (error) {
      console.error("[A/B TESTING] Erreur cr\xE9ation variant:", error);
      res.status(500).json({ error: "Erreur cr\xE9ation variant", message: error.message });
    }
  });
  app2.get("/api/prospection/variants/campagne/:campagneId/etape/:etapeId", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { campagneId, etapeId } = req.params;
      const { canal } = req.query;
      const campagne = await storage.getCampagne(campagneId, userId);
      if (!campagne) {
        return res.status(404).json({ error: "Campagne non trouv\xE9e" });
      }
      const variants = await storage.getVariantsByEtape(campagneId, etapeId, canal);
      const variantsWithMetrics = await Promise.all(
        variants.map(async (variant) => {
          const metrics = await storage.getVariantMetrics(variant.id);
          return {
            ...variant,
            metrics: metrics || {
              sent: 0,
              opened: 0,
              clicked: 0,
              replied: 0,
              accepted: 0,
              rejected: 0,
              bounced: 0
            }
          };
        })
      );
      res.json(variantsWithMetrics);
    } catch (error) {
      console.error("[A/B TESTING] Erreur r\xE9cup\xE9ration variants:", error);
      res.status(500).json({ error: "Erreur r\xE9cup\xE9ration variants", message: error.message });
    }
  });
  app2.get("/api/prospection/variants/:id/metrics", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const result = await storage.getVariantWithMetrics(id);
      if (!result) {
        return res.status(404).json({ error: "Variant non trouv\xE9" });
      }
      res.json(result);
    } catch (error) {
      console.error("[A/B TESTING] Erreur r\xE9cup\xE9ration m\xE9triques variant:", error);
      res.status(500).json({ error: "Erreur r\xE9cup\xE9ration m\xE9triques", message: error.message });
    }
  });
  app2.post("/api/prospection/generate-message", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { prospect, etape, scenario, historique } = req.body;
      if (!prospect || !prospect.nom) {
        return res.status(400).json({ error: "Donn\xE9es prospect manquantes (nom requis)" });
      }
      if (!etape || !etape.numero) {
        return res.status(400).json({ error: "Donn\xE9es \xE9tape manquantes (numero requis)" });
      }
      console.log(`[AI LINKEDIN] G\xE9n\xE9ration message pour prospect ${prospect.prenom} ${prospect.nom} (\xE9tape ${etape.numero})`);
      const pythonResponse = await fetch("http://localhost:5001/api/ai/generate-linkedin-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prospect,
          etape,
          scenario: scenario || {},
          historique: historique || []
        })
      });
      if (!pythonResponse.ok) {
        const errorData = await pythonResponse.json().catch(() => ({}));
        console.error("[AI LINKEDIN] Erreur service Python:", errorData);
        return res.status(pythonResponse.status).json({
          error: "Erreur g\xE9n\xE9ration message IA",
          details: errorData.detail || "Service indisponible"
        });
      }
      const result = await pythonResponse.json();
      console.log(`[AI LINKEDIN] Message g\xE9n\xE9r\xE9 avec succ\xE8s en ${result.duration_seconds.toFixed(2)}s`);
      res.json(result);
    } catch (error) {
      console.error("[AI LINKEDIN] Erreur g\xE9n\xE9ration message:", error);
      res.status(500).json({
        error: "Erreur g\xE9n\xE9ration message LinkedIn",
        message: error.message
      });
    }
  });
  app2.get("/api/prospection/execute-pending-actions", async (req, res) => {
    try {
      const apiKey = req.query.api_key || req.headers["x-api-key"];
      const expectedKey = process.env.SESSION_SECRET;
      if (!apiKey || apiKey !== expectedKey) {
        console.warn("[PROSPECTION CRON] Tentative d'acc\xE8s non autoris\xE9e");
        return res.status(401).json({ error: "Acc\xE8s non autoris\xE9 - API key invalide" });
      }
      console.log("[PROSPECTION CRON] D\xE9marrage de l'ex\xE9cution automatique...");
      const pendingProspects = await storage.getPendingProspects();
      console.log(`[PROSPECTION CRON] ${pendingProspects.length} actions en attente trouv\xE9es`);
      const results = [];
      for (const item of pendingProspects) {
        try {
          const prospectData = item.prospect;
          const campagne = item.campagne;
          const prospectDetails = item.prospectDetails;
          const etapes = await storage.getScenarioEtapes(campagne.scenarioId);
          const nextStep = etapes.find((e) => e.ordre === prospectData.etapeActuelle + 1);
          if (!nextStep) {
            await storage.updateProspectEnProspection(prospectData.id, campagne.userId, {
              statut: "completed"
            });
            console.log(`[PROSPECTION CRON] Sc\xE9nario termin\xE9 pour prospect ${prospectData.id}`);
            continue;
          }
          const historique = await storage.getProspectInteractions(prospectData.id);
          const scenario = await storage.getScenario(campagne.scenarioId);
          let messageGenere = "";
          let messageSource = "template";
          try {
            console.log(`[PROSPECTION CRON] Tentative g\xE9n\xE9ration AI pour ${prospectDetails.prenom} ${prospectDetails.nom} (\xE9tape ${nextStep.ordre})`);
            const pythonResponse = await fetch("http://localhost:5001/api/ai/generate-linkedin-message", {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                prospect: {
                  nom: prospectDetails.nom,
                  prenom: prospectDetails.prenom,
                  fonction: prospectDetails.fonction,
                  entreprise: prospectDetails.entreprise,
                  secteur: prospectDetails.secteur || "",
                  disc_profile: prospectDetails.discProfile || { D: 50, I: 50, S: 50, C: 50, dominant: "D" },
                  points_cles: prospectDetails.pointsCles || [],
                  linkedin_url: prospectDetails.linkedinUrl || ""
                },
                etape: {
                  numero: nextStep.ordre,
                  type: nextStep.canal,
                  titre: nextStep.objectif || `\xC9tape ${nextStep.ordre}`,
                  template: nextStep.templatePrompt || "",
                  delai_jours: nextStep.delaiJours || 0
                },
                scenario: {
                  nom: scenario?.nom || "Sc\xE9nario personnalis\xE9",
                  description: scenario?.description || ""
                },
                historique: historique.map((h) => ({
                  canal: h.canal,
                  message: h.messageEnvoye,
                  date: h.dateInteraction
                }))
              })
            });
            if (pythonResponse.ok) {
              const aiResult = await pythonResponse.json();
              if (aiResult.success && aiResult.message_data?.message) {
                messageGenere = aiResult.message_data.message;
                messageSource = "ai";
                console.log(`[PROSPECTION CRON] \u2705 Message AI g\xE9n\xE9r\xE9 avec succ\xE8s (${aiResult.duration_seconds?.toFixed(2)}s)`);
              } else {
                messageGenere = nextStep.templatePrompt || `Message ${nextStep.canal} pour ${prospectDetails.prenom} ${prospectDetails.nom}`;
                console.warn(`[PROSPECTION CRON] \u26A0\uFE0F AI n'a pas retourn\xE9 de message valide, fallback template`);
              }
            } else {
              const errorText = await pythonResponse.text().catch(() => "Unknown error");
              console.warn(`[PROSPECTION CRON] \u26A0\uFE0F Service AI erreur ${pythonResponse.status}: ${errorText.substring(0, 100)}`);
              console.warn(`[PROSPECTION CRON] \u2192 Fallback sur template par d\xE9faut`);
              messageGenere = nextStep.templatePrompt || `Message ${nextStep.canal} pour ${prospectDetails.prenom} ${prospectDetails.nom}`;
            }
          } catch (aiError) {
            console.warn(`[PROSPECTION CRON] \u26A0\uFE0F Exception g\xE9n\xE9ration AI: ${aiError.message}`);
            console.warn(`[PROSPECTION CRON] \u2192 Fallback sur template par d\xE9faut`);
            messageGenere = nextStep.templatePrompt || `Message ${nextStep.canal} pour ${prospectDetails.prenom} ${prospectDetails.nom}`;
          }
          if (!messageGenere || messageGenere.trim() === "") {
            messageGenere = `Message ${nextStep.canal} pour ${prospectDetails.prenom} ${prospectDetails.nom} - ${nextStep.objectif || ""}`;
            messageSource = "template";
            console.warn(`[PROSPECTION CRON] \u26A0\uFE0F Message vide d\xE9tect\xE9, utilisation message g\xE9n\xE9rique`);
          }
          console.log(`[PROSPECTION CRON] Message final (source: ${messageSource}) pour prospect ${prospectData.id}: ${messageGenere.substring(0, 100)}...`);
          let jobId = null;
          let sendResult = { success: false, canal: nextStep.canal, queued: false };
          try {
            jobId = await prospectionQueue.addSendMessageJob({
              prospectData,
              prospectDetails,
              campagne,
              nextStep,
              messageGenere,
              messageSource
            });
            console.log(`[PROSPECTION CRON] \u2705 Job queue cr\xE9\xE9: ${jobId} pour ${nextStep.canal} \u2192 ${prospectDetails.prenom} ${prospectDetails.nom}`);
            sendResult = { success: true, queued: true, jobId, canal: nextStep.canal };
          } catch (queueError) {
            console.error(`[PROSPECTION CRON] \u274C Erreur cr\xE9ation job queue:`, queueError);
            console.warn(`[PROSPECTION CRON] \u2192 FALLBACK: envoi direct sans queue`);
            try {
              if (nextStep.canal === "email" && prospectDetails.email) {
                const baseUrl = process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : "http://localhost:5000";
                const emailHtml = prospectionEmailTemplate({
                  prenom: prospectDetails.prenom || "Monsieur/Madame",
                  entreprise: prospectDetails.entreprise,
                  message: messageGenere,
                  signature: `Cordialement,

L'\xE9quipe ADS GROUP
contact@adsgroup-security.com`,
                  unsubscribeUrl: `${baseUrl}/unsubscribe?email=${encodeURIComponent(prospectDetails.email)}`
                });
                sendResult = await sendEmail({
                  to: prospectDetails.email,
                  subject: `${prospectDetails.entreprise} - Opportunit\xE9 S\xE9curit\xE9`,
                  html: emailHtml,
                  tags: [
                    { name: "campagne_id", value: campagne.id },
                    { name: "prospect_id", value: prospectData.id },
                    { name: "etape_id", value: nextStep.id }
                  ]
                });
                console.log(`[PROSPECTION CRON] \u2705 FALLBACK Email envoy\xE9 \xE0 ${prospectDetails.email}`);
              } else if (nextStep.canal === "sms" && prospectDetails.telephone) {
                let phoneNumber = prospectDetails.telephone;
                if (!phoneNumber.startsWith("+")) {
                  phoneNumber = phoneNumber.startsWith("0") ? "+33" + phoneNumber.substring(1) : "+33" + phoneNumber;
                }
                const smsText = generateShortSMS(messageGenere, prospectDetails.prenom || "Monsieur/Madame");
                sendResult = await sendSMS({
                  to: phoneNumber,
                  message: smsText,
                  prospectId: prospectData.id
                });
                console.log(`[PROSPECTION CRON] \u2705 FALLBACK SMS envoy\xE9 \xE0 ${phoneNumber}`);
              } else {
                sendResult = { success: false, error: "Canal non support\xE9 ou donn\xE9es manquantes", fallback: true };
              }
            } catch (fallbackError) {
              console.error(`[PROSPECTION CRON] \u274C FALLBACK envoi direct \xE9chou\xE9:`, fallbackError);
              sendResult = { success: false, error: fallbackError.message, fallback_failed: true };
            }
          }
          await storage.createInteraction({
            prospectEnProspectionId: prospectData.id,
            etapeId: nextStep.id,
            canal: nextStep.canal,
            typeInteraction: sendResult.queued ? "pending" : sendResult.success ? "sent" : "error",
            messageEnvoye: messageGenere,
            metadata: {
              messageSource,
              sendResult: sendResult.queued ? "queued" : sendResult.success ? "ok" : "failed",
              jobId: jobId || null,
              provider: sendResult.provider || (sendResult.queued ? "queue" : "fallback_direct"),
              messageId: sendResult.messageId || null,
              error: sendResult.error || null,
              fallback: sendResult.fallback || sendResult.fallback_failed || false
            }
          });
          const nextActionDate = /* @__PURE__ */ new Date();
          nextActionDate.setDate(nextActionDate.getDate() + (nextStep.delaiJours || 0));
          await storage.updateProspectEnProspection(prospectData.id, campagne.userId, {
            etapeActuelle: nextStep.ordre,
            prochaineActionDate: nextActionDate
          });
          results.push({
            prospectId: prospectData.id,
            prospectNom: `${prospectDetails.prenom} ${prospectDetails.nom}`,
            etape: nextStep.ordre,
            canal: nextStep.canal,
            messagePreview: messageGenere.substring(0, 100),
            prochaineAction: nextActionDate
          });
          console.log(`[PROSPECTION CRON] Action ex\xE9cut\xE9e avec succ\xE8s pour prospect ${prospectData.id}`);
        } catch (prospectError) {
          console.error(`[PROSPECTION CRON] Erreur pour prospect ${item.prospect?.id}:`, prospectError);
          results.push({
            prospectId: item.prospect?.id,
            error: prospectError.message
          });
        }
      }
      console.log(`[PROSPECTION CRON] Ex\xE9cution termin\xE9e: ${results.length} actions trait\xE9es`);
      res.json({
        success: true,
        processed: results.length,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        results
      });
    } catch (error) {
      console.error("[PROSPECTION CRON] Erreur globale:", error);
      res.status(500).json({
        error: "Erreur lors de l'ex\xE9cution automatique",
        message: error.message
      });
    }
  });
  app2.get("/api/advanced/execute-fallback-cron", async (req, res) => {
    try {
      const apiKey = req.query.api_key || req.headers["x-api-key"];
      const expectedKey = process.env.SESSION_SECRET;
      if (!apiKey || apiKey !== expectedKey) {
        console.warn("[FALLBACK CRON] Tentative d'acc\xE8s non autoris\xE9e");
        return res.status(401).json({ error: "Acc\xE8s non autoris\xE9 - API key invalide" });
      }
      console.log("[FALLBACK CRON] D\xE9marrage ex\xE9cution fallback automatique");
      const users4 = await storage.getAllUsers();
      const activeUsers = users4.filter((u) => u.isActive === "true");
      let totalProcessed = 0;
      let totalFallbacksTriggered = 0;
      let totalErrors = 0;
      for (const user of activeUsers) {
        try {
          const { executeFallbackForUser: executeFallbackForUser2 } = await Promise.resolve().then(() => (init_canal_scoring(), canal_scoring_exports));
          const results = await executeFallbackForUser2(user.id);
          totalProcessed += results.processed;
          totalFallbacksTriggered += results.fallbacksTriggered;
          totalErrors += results.errors;
          console.log(
            `[FALLBACK CRON] User ${user.email}: ${results.fallbacksTriggered}/${results.processed} fallbacks d\xE9clench\xE9s`
          );
        } catch (error) {
          console.error(`[FALLBACK CRON] Erreur pour user ${user.id}:`, error);
          totalErrors++;
        }
      }
      console.log(
        `[FALLBACK CRON] Termin\xE9: ${totalFallbacksTriggered}/${totalProcessed} fallbacks d\xE9clench\xE9s (${totalErrors} erreurs)`
      );
      res.json({
        success: true,
        usersProcessed: activeUsers.length,
        totalProcessed,
        totalFallbacksTriggered,
        totalErrors,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("[FALLBACK CRON] Erreur globale:", error);
      res.status(500).json({
        error: "Erreur lors de l'ex\xE9cution du fallback automatique",
        message: error.message
      });
    }
  });
  const enrichmentRateLimits = /* @__PURE__ */ new Map();
  function checkEnrichmentRateLimit(ip) {
    const now = Date.now();
    const limit = enrichmentRateLimits.get(ip);
    if (!limit || now > limit.resetAt) {
      enrichmentRateLimits.set(ip, { count: 1, resetAt: now + 6e4 });
      return { allowed: true };
    }
    if (limit.count >= 10) {
      return {
        allowed: false,
        retryAfter: Math.ceil((limit.resetAt - now) / 1e3)
      };
    }
    limit.count++;
    return { allowed: true };
  }
  app2.get("/api/enrichment/health", (req, res) => {
    res.json({
      status: "healthy",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      version: "1.0.0",
      providers: {
        pappers: "Python service (6 countries)",
        opencorporates: "TypeScript provider (6 countries)",
        webSearch: "TypeScript provider (1 country)"
      },
      supportedCountries: enrichmentOrchestrator.getSupportedCountries().length
    });
  });
  app2.get("/api/enrichment/countries", (req, res) => {
    try {
      const countries = enrichmentOrchestrator.getSupportedCountries();
      const countriesDetails = countries.map((code) => {
        const config = getCountryConfig(code);
        if (!config) return null;
        return {
          code,
          name: config.name,
          identifierLabel: config.identifierLabel,
          identifierType: config.identifierType,
          provider: enrichmentOrchestrator.getProviderForCountry(code)
        };
      }).filter(Boolean);
      res.json({
        success: true,
        count: countries.length,
        countries: countriesDetails
      });
    } catch (error) {
      console.error("[Enrichment API] Error listing countries:", error);
      res.status(500).json({
        success: false,
        error: "Erreur lors de la r\xE9cup\xE9ration de la liste des pays"
      });
    }
  });
  app2.post("/api/enrichment", async (req, res) => {
    const startTime = Date.now();
    const clientIp = req.ip || req.socket.remoteAddress || "unknown";
    try {
      const rateLimitCheck = checkEnrichmentRateLimit(clientIp);
      if (!rateLimitCheck.allowed) {
        return res.status(429).json({
          success: false,
          error: "Trop de requ\xEAtes",
          retryAfter: rateLimitCheck.retryAfter
        });
      }
      const validation = enrichCompanySchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: "Donn\xE9es invalides",
          details: validation.error.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message
          }))
        });
      }
      const { identifier, countryCode, companyName, enableFallback } = validation.data;
      if (!enrichmentOrchestrator.isCountrySupported(countryCode)) {
        return res.status(400).json({
          success: false,
          error: `Pays ${countryCode} non support\xE9`,
          supportedCountries: enrichmentOrchestrator.getSupportedCountries()
        });
      }
      const countryConfig = getCountryConfig(countryCode);
      if (countryConfig && !countryConfig.identifierPattern.test(identifier)) {
        return res.status(400).json({
          success: false,
          error: `Format d'identifiant invalide pour ${countryConfig.name}`,
          expected: countryConfig.identifierLabel
        });
      }
      console.log(`[Enrichment API] Enriching ${identifier} (${countryCode})`);
      const result = await enrichmentOrchestrator.enrichCompany(
        identifier,
        countryCode,
        { companyName, enableFallback }
      );
      const responseTime = Date.now() - startTime;
      if (result.data) {
        res.json({
          success: true,
          data: result.data,
          provider: result.provider,
          fallbackUsed: result.fallbackUsed,
          metadata: {
            timestamp: (/* @__PURE__ */ new Date()).toISOString(),
            responseTime,
            countryCode
          }
        });
      } else {
        res.status(404).json({
          success: false,
          error: result.error || "Entreprise non trouv\xE9e",
          provider: result.provider,
          fallbackUsed: result.fallbackUsed,
          metadata: {
            timestamp: (/* @__PURE__ */ new Date()).toISOString(),
            responseTime,
            countryCode
          }
        });
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.error("[Enrichment API] Error:", error);
      res.status(500).json({
        success: false,
        error: "Erreur lors de l'enrichissement",
        message: error.message,
        metadata: {
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          responseTime
        }
      });
    }
  });
  app2.get("/api/enrichment/docs", (req, res) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    const htmlPath = path.join(process.cwd(), "public", "api-docs.html");
    res.sendFile(htmlPath);
  });
  app2.get("/api/enrichment/metrics", (req, res) => {
    const format2 = req.query.format || "json";
    if (format2 === "prometheus") {
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.send(enrichmentMonitoring.getPrometheusMetrics());
    } else {
      res.json(enrichmentMonitoring.getAggregatedMetrics());
    }
  });
  app2.get("/api/enrichment/alerts", (req, res) => {
    const alerts = enrichmentMonitoring.checkAlerts();
    res.json(alerts);
  });
  console.log("\u2705 Enrichment API routes initialized");
  const enrichCompanyV2Schema = z8.object({
    identifier: z8.string().min(1, "L'identifiant SIREN/SIRET est requis"),
    companyName: z8.string().optional(),
    triggerType: z8.enum(["manual", "automatic", "import"]).optional().default("manual")
  });
  const updateCompanySchema = z8.object({
    legalName: z8.string().optional(),
    tradeName: z8.string().optional(),
    status: z8.string().optional(),
    addressLine1: z8.string().optional(),
    addressLine2: z8.string().optional(),
    postalCode: z8.string().optional(),
    city: z8.string().optional(),
    country: z8.string().optional(),
    phone: z8.string().optional(),
    email: z8.string().email().optional(),
    website: z8.string().url().optional()
  });
  app2.post("/api/companies/enrich", isAuthenticated, async (req, res) => {
    try {
      const parsed = enrichCompanyV2Schema.parse(req.body);
      const userId = String(req.session.userId);
      console.log(`[API] \u{1F3E2} Enrichissement entreprise: ${parsed.identifier}`);
      const result = await enrichmentService.enrichCompany({
        identifier: parsed.identifier,
        countryCode: "FR",
        companyName: parsed.companyName,
        userId,
        triggerType: parsed.triggerType
      });
      if (!result.success) {
        if (result.message.includes("invalide") || result.message.includes("Format")) {
          return res.status(400).json(result);
        }
        if (result.error?.includes("non trouv\xE9e")) {
          return res.status(404).json(result);
        }
        return res.status(502).json(result);
      }
      res.json(result);
    } catch (error) {
      console.error("[API] \u274C Erreur enrichissement company:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({
          error: "Donn\xE9es invalides",
          details: error.errors
        });
      }
      res.status(500).json({
        error: "Erreur lors de l'enrichissement",
        message: error.message
      });
    }
  });
  app2.post("/api/companies/enrich-cascade", isAuthenticated, async (req, res) => {
    try {
      const parsed = enrichCompanyV2Schema.parse(req.body);
      const userId = String(req.session.userId);
      console.log(`[API CASCADE] \u{1F3E2} Enrichissement CASCADE: ${parsed.identifier}`);
      const result = await enrichmentService.enrichCompanyWithCascade({
        identifier: parsed.identifier,
        countryCode: "FR",
        companyName: parsed.companyName,
        userId,
        triggerType: parsed.triggerType
      });
      if (!result.success) {
        if (result.message.includes("invalide") || result.message.includes("Format")) {
          return res.status(400).json(result);
        }
        if (result.error?.includes("non trouv\xE9e") || result.error?.includes("not found")) {
          return res.status(404).json(result);
        }
        return res.status(502).json(result);
      }
      res.json(result);
    } catch (error) {
      console.error("[API CASCADE] \u274C Erreur enrichissement CASCADE:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({
          error: "Donn\xE9es invalides",
          details: error.errors
        });
      }
      res.status(500).json({
        error: "Erreur lors de l'enrichissement CASCADE",
        message: error.message
      });
    }
  });
  app2.get("/api/companies/cascade-metrics", isAuthenticated, async (req, res) => {
    try {
      const userId = String(req.session.userId);
      const days = parseInt(req.query.days) || 30;
      console.log(`[API CASCADE] \u{1F4CA} R\xE9cup\xE9ration m\xE9triques CASCADE (${days}j)`);
      const logs = await storage.getEnrichmentLogsByUserId(userId);
      const cutoffDate = /* @__PURE__ */ new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      const recentLogs = logs.filter(
        (log2) => log2.createdAt && new Date(log2.createdAt) >= cutoffDate
      );
      const inseeCount = recentLogs.filter((l) => l.source === "insee" && l.status === "success").length;
      const pappersCount = recentLogs.filter((l) => l.source === "pappers" && l.status === "success").length;
      const fallbackCount = recentLogs.filter((l) => l.fallbackUsed === "true").length;
      const totalCost = recentLogs.reduce((sum3, l) => sum3 + (l.cost || 0), 0) / 100;
      const averageDuration = recentLogs.length > 0 ? recentLogs.reduce((sum3, l) => sum3 + (l.duration || 0), 0) / recentLogs.length : 0;
      const potentialCost = (inseeCount + pappersCount) * 0.1;
      const savings = potentialCost - totalCost;
      const savingsPercent = potentialCost > 0 ? savings / potentialCost * 100 : 0;
      res.json({
        period: {
          days,
          from: cutoffDate.toISOString(),
          to: (/* @__PURE__ */ new Date()).toISOString()
        },
        enrichments: {
          total: inseeCount + pappersCount,
          insee: inseeCount,
          pappers: pappersCount,
          fallbackUsed: fallbackCount
        },
        costs: {
          total: Number(totalCost.toFixed(2)),
          potential: Number(potentialCost.toFixed(2)),
          savings: Number(savings.toFixed(2)),
          savingsPercent: Number(savingsPercent.toFixed(1))
        },
        performance: {
          averageDuration: Math.round(averageDuration)
        },
        success: true
      });
    } catch (error) {
      console.error("[API CASCADE] \u274C Erreur m\xE9triques CASCADE:", error);
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/companies/enrich-by-phone", isAuthenticated, async (req, res) => {
    try {
      const userId = String(req.session.userId);
      const { phone } = req.body;
      if (!phone) {
        return res.status(400).json({
          success: false,
          error: "Num\xE9ro de t\xE9l\xE9phone requis"
        });
      }
      console.log(`[API PHONE CASCADE] \u{1F4DE} Enrichissement par t\xE9l\xE9phone: ${phone}`);
      const enrichmentService2 = await Promise.resolve().then(() => (init_enrichment_service(), enrichment_service_exports));
      const result = await enrichmentService2.enrichCompanyByPhone(phone, userId);
      if (!result.success) {
        if (result.message.includes("invalide") || result.message.includes("Format")) {
          return res.status(400).json(result);
        }
        if (result.error?.includes("non trouv\xE9e") || result.error?.includes("not found")) {
          return res.status(404).json(result);
        }
        return res.status(502).json(result);
      }
      console.log(`[API PHONE CASCADE] \u2705 Enrichissement r\xE9ussi via ${result.metadata?.enrichmentSource}`);
      res.json(result);
    } catch (error) {
      console.error("[API PHONE CASCADE] \u274C Erreur enrichissement t\xE9l\xE9phone:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({
          error: "Donn\xE9es invalides",
          details: error.errors
        });
      }
      res.status(500).json({
        error: "Erreur lors de l'enrichissement par t\xE9l\xE9phone",
        message: error.message
      });
    }
  });
  app2.get("/api/companies/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = String(req.session.userId);
      const company = await storage.getCompany(id, userId);
      if (!company) {
        return res.status(404).json({ error: "Entreprise non trouv\xE9e" });
      }
      res.json(company);
    } catch (error) {
      console.error("[API] \u274C Erreur r\xE9cup\xE9ration company:", error);
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/companies", isAuthenticated, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 100;
      const userId = String(req.session.userId);
      const companies2 = await storage.getUserCompanies(userId, limit);
      res.json({
        companies: companies2,
        total: companies2.length,
        limit
      });
    } catch (error) {
      console.error("[API] \u274C Erreur liste companies:", error);
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/companies/:id/establishments", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = String(req.session.userId);
      const company = await storage.getCompany(id, userId);
      if (!company) {
        return res.status(404).json({ error: "Entreprise non trouv\xE9e" });
      }
      if (company.identifierType !== "SIREN") {
        return res.status(400).json({
          error: "Cette entreprise n'est pas un SIREN (si\xE8ge social)"
        });
      }
      const establishments = await storage.getCompaniesByParentIdentifier(
        company.identifierValue,
        userId
      );
      res.json({
        siren: company.identifierValue,
        headquarters: company,
        establishments,
        total: establishments.length
      });
    } catch (error) {
      console.error("[API] \u274C Erreur r\xE9cup\xE9ration \xE9tablissements:", error);
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/companies/:id/enrichment-logs", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const limit = parseInt(req.query.limit) || 10;
      const userId = String(req.session.userId);
      const company = await storage.getCompany(id, userId);
      if (!company) {
        return res.status(404).json({ error: "Entreprise non trouv\xE9e" });
      }
      const logs = await storage.getCompanyEnrichmentLogs(id, limit);
      res.json({
        companyId: id,
        logs,
        total: logs.length
      });
    } catch (error) {
      console.error("[API] \u274C Erreur historique enrichissement:", error);
      res.status(500).json({ error: error.message });
    }
  });
  app2.put("/api/companies/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = String(req.session.userId);
      const parsed = updateCompanySchema.parse(req.body);
      const updated = await storage.updateCompany(id, userId, parsed);
      res.json({
        success: true,
        company: updated
      });
    } catch (error) {
      console.error("[API] \u274C Erreur mise \xE0 jour company:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({
          error: "Donn\xE9es invalides",
          details: error.errors
        });
      }
      if (error.message.includes("non trouv\xE9e") || error.message.includes("non autoris\xE9e")) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  });
  app2.delete("/api/companies/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = String(req.session.userId);
      await storage.deleteCompany(id, userId);
      res.json({
        success: true,
        message: "Entreprise supprim\xE9e avec succ\xE8s"
      });
    } catch (error) {
      console.error("[API] \u274C Erreur suppression company:", error);
      if (error.message.includes("non trouv\xE9e") || error.message.includes("non autoris\xE9e")) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  });
  console.log("\u2705 Companies API routes initialized (Phase 2 SIREN/SIRET)");
  const {
    startBatchImport: startBatchImport2,
    getBatchImportStatus: getBatchImportStatus2,
    getBatchImportHistory: getBatchImportHistory2
  } = await Promise.resolve().then(() => (init_batchImportService(), batchImportService_exports));
  const csvStorage = multer.memoryStorage();
  const csvUpload = multer({
    storage: csvStorage,
    limits: {
      fileSize: 5 * 1024 * 1024
      // 5 MB max
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = ["text/csv", "application/vnd.ms-excel", "text/plain"];
      if (allowedTypes.includes(file.mimetype) || file.originalname.endsWith(".csv")) {
        cb(null, true);
      } else {
        cb(new Error("Seuls les fichiers CSV sont accept\xE9s"));
      }
    }
  });
  app2.post("/api/batch-import/upload", isAuthenticated, csvUpload.single("file"), async (req, res) => {
    try {
      const userId = String(req.session.userId);
      const userEntity = String(req.session.entity || "luxembourg");
      if (!req.file) {
        return res.status(400).json({ error: "Aucun fichier fourni" });
      }
      const csvContent = req.file.buffer.toString("utf-8");
      const filename = req.file.originalname;
      const mapping = req.body.mapping ? JSON.parse(req.body.mapping) : {};
      const options = req.body.options ? JSON.parse(req.body.options) : {};
      if (Object.keys(mapping).length === 0) {
        return res.status(400).json({ error: "Mapping des colonnes requis" });
      }
      const result = await startBatchImport2(
        userId,
        userEntity,
        filename,
        csvContent,
        mapping,
        options
      );
      res.json(result);
    } catch (error) {
      console.error("[Batch Import API] Erreur upload:", error);
      if (error.message.includes("Maximum")) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/batch-import/:batchId/status", isAuthenticated, async (req, res) => {
    try {
      const { batchId } = req.params;
      const status = await getBatchImportStatus2(batchId);
      res.json(status);
    } catch (error) {
      console.error("[Batch Import API] Erreur status:", error);
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/batch-import/history", isAuthenticated, async (req, res) => {
    try {
      const userId = String(req.session.userId);
      const limit = req.query.limit ? parseInt(req.query.limit) : 20;
      const history = await getBatchImportHistory2(userId, limit);
      res.json({ history });
    } catch (error) {
      console.error("[Batch Import API] Erreur history:", error);
      res.status(500).json({ error: error.message });
    }
  });
  console.log("\u2705 Batch Import CSV API routes initialized (P3.2)");
  if (process.env.NODE_ENV === "development") {
    app2.post("/api/admin/test/queue/stress", isAdmin, async (req, res) => {
      try {
        console.log("\u{1F9EA} [TEST] Starting queue stress test...");
        const startTime = Date.now();
        const jobIds = [];
        const jobCount = req.body.count || 100;
        for (let i = 0; i < jobCount; i++) {
          try {
            const jobId = await prospectionQueue.addJob("send-message", {
              prospectEnProspectionId: String(1e3 + i),
              prospectId: String(500 + i),
              campagneId: "1",
              userId: String(req.session.userId),
              messageType: i % 4 === 0 ? "email" : i % 4 === 1 ? "sms" : i % 4 === 2 ? "invitation" : "message",
              messageContent: `Test message #${i} from queue stress test`,
              etapeId: "1"
            }, {
              priority: 10,
              retryLimit: 5,
              retryDelay: 15
            });
            jobIds.push(jobId);
          } catch (error) {
            console.error(`\u274C Failed to queue job ${i}:`, error.message);
            jobIds.push(null);
          }
        }
        const successCount = jobIds.filter((id) => id !== null).length;
        const elapsed = Date.now() - startTime;
        console.log(`\u{1F9EA} [TEST] Queued ${successCount}/${jobCount} jobs in ${elapsed}ms`);
        res.json({
          success: true,
          total: jobCount,
          queued: successCount,
          failed: jobCount - successCount,
          elapsedMs: elapsed,
          sampleJobIds: jobIds.filter((id) => id !== null).slice(0, 5)
        });
      } catch (error) {
        console.error("\u{1F9EA} [TEST] Stress test failed:", error);
        res.status(500).json({ error: error.message });
      }
    });
    app2.post("/api/admin/test/queue/single", isAdmin, async (req, res) => {
      try {
        const jobId = await prospectionQueue.addJob("send-message", {
          prospectEnProspectionId: "99999",
          prospectId: "99999",
          campagneId: "1",
          userId: String(req.session.userId),
          messageType: req.body.messageType || "message",
          messageContent: req.body.messageContent || "Test message",
          etapeId: "1"
        }, {
          priority: 10,
          retryLimit: 5,
          retryDelay: 15
        });
        res.json({
          success: true,
          jobId,
          message: "Job queued successfully"
        });
      } catch (error) {
        console.error("\u{1F9EA} [TEST] Single job test failed:", error);
        res.status(500).json({ error: error.message });
      }
    });
    console.log("\u{1F9EA} Test routes enabled (development mode)");
  }
  app2.get("/docs-hector", isAdmin, async (req, res) => {
    try {
      const docPath = path.join(process.cwd(), "docs", "HECTOR_DOCUMENTATION_COMPLETE_2025.html");
      if (fs.existsSync(docPath)) {
        res.sendFile(docPath);
      } else {
        res.status(404).send("Documentation non trouv\xE9e");
      }
    } catch (error) {
      console.error("\u274C Erreur chargement documentation:", error);
      res.status(500).send("Erreur serveur");
    }
  });
  console.log("\u{1F512} Documentation route initialized (/docs-hector) - ADMIN ONLY");
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express9 from "express";
import fs2 from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      ),
      await import("@replit/vite-plugin-dev-banner").then(
        (m) => m.devBanner()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(import.meta.dirname, "client", "src"),
      "@shared": path2.resolve(import.meta.dirname, "shared"),
      "@assets": path2.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path2.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path2.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid as nanoid2 } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid2()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express9.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/index.ts
import http from "http";

// server/python-server.ts
import { spawn } from "child_process";
var pythonProcess = null;
var isStarting = false;
function ensurePythonServer() {
  if (pythonProcess || isStarting) {
    return;
  }
  isStarting = true;
  log("\u{1F40D} D\xE9marrage de l'API Python (port 5001)...");
  pythonProcess = spawn("python", ["main.py"], {
    cwd: process.cwd(),
    stdio: ["ignore", "pipe", "pipe"]
  });
  pythonProcess.stdout?.on("data", (data) => {
    const lines = data.toString().split("\n");
    lines.forEach((line) => {
      if (line.trim()) {
        log(`[Python] ${line.trim()}`);
      }
    });
  });
  pythonProcess.stderr?.on("data", (data) => {
    const lines = data.toString().split("\n");
    lines.forEach((line) => {
      if (line.trim()) {
        log(`[Python ERROR] ${line.trim()}`);
      }
    });
  });
  pythonProcess.on("error", (error) => {
    log(`\u274C Erreur au d\xE9marrage de Python: ${error.message}`);
    pythonProcess = null;
    isStarting = false;
  });
  pythonProcess.on("exit", (code) => {
    if (code !== 0 && code !== null) {
      log(`\u274C Python s'est arr\xEAt\xE9 avec le code: ${code}`);
    }
    pythonProcess = null;
    isStarting = false;
  });
  const cleanup = () => {
    if (pythonProcess) {
      log("\u{1F6D1} Arr\xEAt de l'API Python...");
      pythonProcess.kill("SIGTERM");
      pythonProcess = null;
    }
  };
  process.on("exit", cleanup);
  process.on("SIGINT", () => {
    cleanup();
    process.exit(0);
  });
  process.on("SIGTERM", () => {
    cleanup();
    process.exit(0);
  });
  setTimeout(() => {
    isStarting = false;
    log("\u2705 API Python d\xE9marr\xE9e");
  }, 2e3);
}

// server/services/queue/worker.ts
var ProspectionWorker = class {
  storage;
  isRunning = false;
  constructor(deps) {
    this.storage = deps.storage;
  }
  async start() {
    if (this.isRunning) {
      console.log("\u26A0\uFE0F Worker already running");
      return;
    }
    const boss = prospectionQueue.getBoss();
    if (!boss) {
      throw new Error("Queue not initialized");
    }
    await boss.work("send-message", { teamSize: 5, teamConcurrency: 2 }, async (job) => {
      try {
        console.log("\u{1F4E8} [WORKER] Processing send-message job:", job.id);
        const {
          prospectEnProspectionId,
          prospectId,
          campagneId,
          userId,
          messageType,
          messageContent,
          etapeId,
          prospectDetails,
          campagne,
          nextStep,
          messageSource
        } = job.data;
        let selectedVariant = null;
        let finalMessageContent = messageContent;
        let finalSubject = prospectDetails?.entreprise ? `${prospectDetails.entreprise} - Opportunit\xE9 S\xE9curit\xE9` : "Opportunit\xE9 ADS GROUP";
        try {
          selectedVariant = await this.storage.selectBestVariant(campagneId, etapeId, messageType);
          if (selectedVariant) {
            console.log(`[A/B TESTING] \u{1F3AF} Variant s\xE9lectionn\xE9: ${selectedVariant.variantName} pour ${messageType}`);
            finalMessageContent = selectedVariant.messageTemplate.replace(/\{\{prenom\}\}/g, prospectDetails?.prenom || "Monsieur/Madame").replace(/\{\{nom\}\}/g, prospectDetails?.nom || "").replace(/\{\{entreprise\}\}/g, prospectDetails?.entreprise || "votre entreprise").replace(/\{\{poste\}\}/g, prospectDetails?.fonction || "").replace(/\{\{ville\}\}/g, prospectDetails?.ville || "");
            if (messageType === "email" && selectedVariant.sujetEmail) {
              finalSubject = selectedVariant.sujetEmail.replace(/\{\{prenom\}\}/g, prospectDetails?.prenom || "Monsieur/Madame").replace(/\{\{nom\}\}/g, prospectDetails?.nom || "").replace(/\{\{entreprise\}\}/g, prospectDetails?.entreprise || "votre entreprise");
            }
          } else {
            console.log(`[A/B TESTING] \u2139\uFE0F Pas de variant disponible pour ${messageType}, utilisation message g\xE9n\xE9r\xE9`);
          }
        } catch (variantError) {
          console.warn(`[A/B TESTING] \u26A0\uFE0F Erreur s\xE9lection variant: ${variantError.message}, fallback sur message g\xE9n\xE9r\xE9`);
        }
        const interactions = await this.storage.getProspectInteractions(prospectEnProspectionId);
        const pendingInteraction = interactions.find(
          (i) => i.typeInteraction === "pending" && i.etapeId === etapeId && i.metadata?.jobId === job.id
        );
        let sendResult = { success: false, canal: messageType, manual: true };
        try {
          if (messageType === "email") {
            if (!prospectDetails.email) {
              console.warn(`[WORKER] \u26A0\uFE0F Pas d'email pour prospect ${prospectId}`);
              sendResult = { success: false, error: "No email address" };
            } else {
              const baseUrl = process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : "http://localhost:5000";
              const emailHtml = prospectionEmailTemplate({
                prenom: prospectDetails.prenom || "Monsieur/Madame",
                entreprise: prospectDetails.entreprise,
                message: finalMessageContent,
                // Utiliser le message du variant ou généré
                signature: `Cordialement,

L'\xE9quipe ADS GROUP
contact@adsgroup-security.com`,
                unsubscribeUrl: `${baseUrl}/unsubscribe?email=${encodeURIComponent(prospectDetails.email)}`
              });
              sendResult = await sendEmail({
                to: prospectDetails.email,
                subject: finalSubject,
                // Utiliser le sujet du variant ou default
                html: emailHtml,
                tags: [
                  { name: "campagne_id", value: campagneId },
                  { name: "prospect_id", value: prospectEnProspectionId },
                  { name: "etape_id", value: etapeId }
                ]
              });
              if (sendResult.success) {
                console.log(`[WORKER] \u2705 Email envoy\xE9 \xE0 ${prospectDetails.email} (${sendResult.messageId})`);
              } else {
                console.error(`[WORKER] \u274C \xC9chec envoi email: ${sendResult.error}`);
              }
            }
          } else if (messageType === "sms") {
            if (!prospectDetails.telephone) {
              console.warn(`[WORKER] \u26A0\uFE0F Pas de t\xE9l\xE9phone pour prospect ${prospectId}`);
              sendResult = { success: false, error: "No phone number" };
            } else {
              let phoneNumber = prospectDetails.telephone;
              if (!phoneNumber.startsWith("+")) {
                if (phoneNumber.startsWith("0")) {
                  phoneNumber = "+33" + phoneNumber.substring(1);
                } else {
                  phoneNumber = "+33" + phoneNumber;
                }
              }
              const smsText = generateShortSMS(finalMessageContent, prospectDetails.prenom || "Monsieur/Madame");
              sendResult = await sendSMS({
                to: phoneNumber,
                message: smsText,
                prospectId: prospectEnProspectionId
              });
              if (sendResult.success) {
                console.log(`[WORKER] \u2705 SMS envoy\xE9 \xE0 ${phoneNumber} (${sendResult.messageId})`);
              } else {
                console.error(`[WORKER] \u274C \xC9chec envoi SMS: ${sendResult.error}`);
              }
            }
          } else {
            console.log(`[WORKER] \u23F3 Canal ${messageType} - envoi manuel requis pour prospect ${prospectId}`);
            sendResult = { success: false, manual: true };
          }
        } catch (sendError) {
          console.error(`[WORKER] \u274C Erreur envoi ${messageType}:`, sendError);
          sendResult = { success: false, error: sendError.message };
        }
        const attemptNumber = (job.data.attemptNumber || 0) + 1;
        if (sendResult.success) {
          if (pendingInteraction) {
            await this.storage.updateInteraction(pendingInteraction.id, {
              typeInteraction: "sent",
              variantId: selectedVariant?.id || void 0,
              // 🎯 Enregistrer le variant utilisé
              metadata: {
                ...pendingInteraction.metadata,
                sendResult: "ok",
                provider: sendResult.provider || "manual",
                messageId: sendResult.messageId || null,
                processedAt: (/* @__PURE__ */ new Date()).toISOString(),
                jobId: job.id,
                attemptNumber,
                variantId: selectedVariant?.id || null,
                // Backup dans metadata
                variantName: selectedVariant?.variantName || null
              }
            });
            console.log(`[WORKER] \u2705 Interaction mise \xE0 jour: ${pendingInteraction.id} \u2192 sent`);
            if (selectedVariant) {
              try {
                await this.storage.updateVariantMetrics(selectedVariant.id, "sent");
                console.log(`[A/B TESTING] \u{1F4CA} M\xE9triques mises \xE0 jour pour variant ${selectedVariant.variantName}: sent +1`);
              } catch (metricsError) {
                console.error(`[A/B TESTING] \u274C Erreur mise \xE0 jour m\xE9triques: ${metricsError.message}`);
              }
            }
          }
          console.log(`[WORKER] \u2705 Job ${job.id} trait\xE9 avec succ\xE8s`);
        } else if (sendResult.manual) {
          if (pendingInteraction) {
            await this.storage.updateInteraction(pendingInteraction.id, {
              typeInteraction: "pending",
              metadata: {
                ...pendingInteraction.metadata,
                sendResult: "manual",
                provider: "manual",
                processedAt: (/* @__PURE__ */ new Date()).toISOString(),
                jobId: job.id,
                attemptNumber,
                note: `Canal ${messageType} - envoi manuel requis`
              }
            });
          }
          console.log(`[WORKER] \u23F3 Job ${job.id} requiert envoi manuel (canal ${messageType})`);
        } else {
          if (pendingInteraction) {
            await this.storage.updateInteraction(pendingInteraction.id, {
              typeInteraction: "pending",
              // Reste pending durant les retries
              metadata: {
                ...pendingInteraction.metadata,
                sendResult: "retrying",
                error: sendResult.error || "Unknown error",
                lastAttemptAt: (/* @__PURE__ */ new Date()).toISOString(),
                jobId: job.id,
                attemptNumber
              }
            });
          }
          console.error(`[WORKER] \u274C \xC9chec envoi (tentative ${attemptNumber}), retry par pg-boss: ${sendResult.error}`);
          throw new Error(`Failed to send ${messageType}: ${sendResult.error || "Unknown error"}`);
        }
      } catch (error) {
        console.error("[WORKER] \u274C Error in send-message handler:", error);
        throw error;
      }
    });
    await boss.work("enrich_prospect", async (job) => {
      try {
        console.log("\u{1F50D} Processing enrich_prospect job:", job.id);
        const { prospectId, userId } = job.data;
        console.log(`\u{1F50D} Enriching prospect ${prospectId}`);
        console.log(`\u2705 Prospect enriched successfully for job ${job.id}`);
      } catch (error) {
        console.error("\u274C Error in enrich_prospect handler:", error);
        throw error;
      }
    });
    await boss.work("generate_message", async (job) => {
      try {
        console.log("\u{1F916} Processing generate_message job:", job.id);
        const { prospectEnProspectionId, prospectId, campagneId, userId, etapeId, messageType } = job.data;
        console.log(`\u{1F916} Generating ${messageType} for prospect ${prospectId}`);
        const generatedMessage = `Message g\xE9n\xE9r\xE9 par IA pour le prospect`;
        await prospectionQueue.addJob("send-message", {
          prospectEnProspectionId,
          prospectId,
          campagneId,
          userId,
          messageType,
          messageContent: generatedMessage,
          etapeId
        });
        console.log(`\u2705 Message generated and queued for job ${job.id}`);
      } catch (error) {
        console.error("\u274C Error in generate_message handler:", error);
        throw error;
      }
    });
    await boss.work("learning-loop", { teamSize: 1, teamConcurrency: 1 }, async (job) => {
      try {
        console.log("\u{1F9E0} [WORKER] Processing learning-loop job:", job.id);
        const results = await runLearningLoop();
        console.log(`\u2705 [WORKER] Learning loop termin\xE9:`, results);
        console.log(`   - ${results.patternsDetected} patterns d\xE9tect\xE9s`);
        console.log(`   - ${results.insightsGenerated} insights g\xE9n\xE9r\xE9s`);
        console.log(`   - ${results.insightsSaved} insights sauvegard\xE9s`);
      } catch (error) {
        console.error("\u274C [WORKER] Error in learning-loop handler:", error);
        throw error;
      }
    });
    this.isRunning = true;
    console.log("\u2705 Worker started with 4 handlers (send-message, enrich_prospect, generate_message, learning-loop)");
  }
  async stop() {
    if (!this.isRunning) {
      return;
    }
    const boss = prospectionQueue.getBoss();
    if (boss) {
      await boss.stop();
    }
    this.isRunning = false;
    console.log("\u{1F6D1} Worker stopped");
  }
};

// server/index.ts
init_storage();

// server/cron/autoEnrichment.ts
init_db();
init_enrichment_orchestrator();
init_dataQualityService();
import cron2 from "node-cron";
import { sql as sql26 } from "drizzle-orm";
async function enrichProspect(prospect) {
  const startTime = Date.now();
  try {
    const siren = prospect.legacy_siren || prospect.siret?.substring(0, 9);
    if (!siren) {
      return {
        prospectId: prospect.id,
        entreprise: prospect.entreprise,
        success: false,
        error: "Pas de SIREN/SIRET"
      };
    }
    const result = await enrichmentOrchestrator.enrichWithCascade(
      siren,
      "FR",
      // Pour l'instant, CASCADE = France uniquement
      prospect.entreprise
      // Nom entreprise pour améliorer la recherche
    );
    if (!result.data) {
      return {
        prospectId: prospect.id,
        entreprise: prospect.entreprise,
        success: false,
        source: result.source,
        cost: result.cost,
        duration: Date.now() - startTime,
        error: result.error || "Donn\xE9es non trouv\xE9es"
      };
    }
    const adresseTexte = result.data.adresse?.adresse || null;
    const codePostal = result.data.adresse?.codePostal || null;
    const ville = result.data.adresse?.ville || null;
    const dirigeantPrincipal = result.data.dirigeants && result.data.dirigeants.length > 0 ? `${result.data.dirigeants[0].prenom || ""} ${result.data.dirigeants[0].nom}`.trim() : null;
    const effectif = result.data.effectif || result.data.effectifMin || null;
    const effectifTexte = result.data.effectifTexte || (effectif ? `${effectif} salari\xE9s` : null);
    await db.execute(sql26`
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
    const updatedProspect = await db.execute(sql26`
      SELECT * FROM prospects WHERE id = ${prospect.id}
    `);
    const newScore = calculateDataQualityScore(updatedProspect.rows[0]);
    await db.execute(sql26`
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
      duration: Date.now() - startTime
    };
  } catch (error) {
    return {
      prospectId: prospect.id,
      entreprise: prospect.entreprise,
      success: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Erreur inconnue"
    };
  }
}
function initAutoEnrichmentCron() {
  cron2.schedule("0 3 * * *", async () => {
    console.log("\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501");
    console.log("[Auto-Enrichment] \u{1F319} Job d\xE9marr\xE9 \xE0 3h00...");
    console.log("\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501");
    const startTime = Date.now();
    try {
      const candidates = await getEnrichmentCandidates(100);
      console.log(`[Auto-Enrichment] \u{1F4CA} ${candidates.length} candidats trouv\xE9s`);
      if (candidates.length === 0) {
        console.log("[Auto-Enrichment] \u2705 Aucun candidat, job termin\xE9");
        return;
      }
      const results = [];
      let successCount = 0;
      let failedCount = 0;
      let skippedCount = 0;
      let totalCost = 0;
      for (let i = 0; i < candidates.length; i++) {
        const prospect = candidates[i];
        try {
          const { should, reason, priority } = shouldEnrich(prospect);
          if (!should) {
            skippedCount++;
            console.log(`[Auto-Enrichment] \u23ED\uFE0F  Skip ${prospect.entreprise}: ${reason}`);
            continue;
          }
          console.log(`[Auto-Enrichment] [${i + 1}/${candidates.length}] Enrichissement ${prospect.entreprise} (P${priority})...`);
          const result = await enrichProspect(prospect);
          results.push(result);
          if (result.success) {
            successCount++;
            totalCost += result.cost || 0;
            console.log(`[Auto-Enrichment] \u2705 Succ\xE8s ${prospect.entreprise} via ${result.source} (${result.duration}ms, ${result.cost}\u20AC)`);
          } else {
            failedCount++;
            await db.execute(sql26`
              UPDATE prospects
              SET enrichment_status = 'failed'
              WHERE id = ${prospect.id}
            `);
            console.log(`[Auto-Enrichment] \u274C \xC9chec ${prospect.entreprise}: ${result.error}`);
          }
          if (i < candidates.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        } catch (error) {
          failedCount++;
          console.error(`[Auto-Enrichment] \u{1F4A5} Erreur critique prospect ${prospect.id}:`, error);
        }
      }
      const durationSeconds = Math.round((Date.now() - startTime) / 1e3);
      console.log("\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501");
      console.log(`[Auto-Enrichment] \u{1F3C1} Job termin\xE9 en ${durationSeconds}s`);
      console.log(`[Auto-Enrichment] \u{1F4C8} R\xE9sultats:`);
      console.log(`  \u2705 Succ\xE8s: ${successCount}`);
      console.log(`  \u274C \xC9checs: ${failedCount}`);
      console.log(`  \u23ED\uFE0F  Skipped: ${skippedCount}`);
      console.log(`  \u{1F4B0} Co\xFBt total: ${totalCost.toFixed(2)}\u20AC`);
      console.log("\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501");
    } catch (error) {
      console.error("[Auto-Enrichment] \u{1F4A5} Erreur fatale job:", error);
    }
  }, {
    timezone: "Europe/Paris"
  });
  console.log("[CRON] \u2705 Auto-enrichment configur\xE9 @ 3h00 (Europe/Paris)");
}

// server/cron/autoGeocoding.ts
import cron3 from "node-cron";
function initAutoGeocodingCron() {
  const cronExpression = "0 4 * * *";
  const timezone = "Europe/Paris";
  console.log(`[CRON AUTO-GEOCODING] \u2713 Programm\xE9 : ${cronExpression} (${timezone})`);
  console.log(`[CRON AUTO-GEOCODING] \u2713 Limite : 100 prospects/nuit`);
  console.log(`[CRON AUTO-GEOCODING] \u2713 Throttle : 1000ms entre requ\xEAtes`);
  console.log(`[CRON AUTO-GEOCODING] \u2713 Strat\xE9gie : CASCADE Google Maps \u2192 Nominatim`);
  cron3.schedule(cronExpression, async () => {
    console.log("\n\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501");
    console.log(`[CRON AUTO-GEOCODING] \u{1F319} D\xE9marrage job nocturne`);
    console.log(`[CRON AUTO-GEOCODING] \u{1F4C5} ${(/* @__PURE__ */ new Date()).toLocaleString("fr-FR", { timeZone: timezone })}`);
    console.log("\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n");
    const startTime = Date.now();
    try {
      const result = await batchGeocodingService.startBatchGeocoding(
        void 0,
        // Toutes entités
        100,
        // Max 100 prospects
        1e3
        // 1s throttle
      );
      const durationSec = Math.round((Date.now() - startTime) / 1e3);
      console.log("\n\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501");
      console.log(`[CRON AUTO-GEOCODING] \u2713 Job termin\xE9 en ${durationSec}s`);
      console.log(`[CRON AUTO-GEOCODING] \u2713 Total trait\xE9 : ${result.total}`);
      console.log(`[CRON AUTO-GEOCODING] \u2713 Succ\xE8s : ${result.success}`);
      console.log(`[CRON AUTO-GEOCODING] \u2713 \xC9checs : ${result.failed}`);
      console.log(`[CRON AUTO-GEOCODING] \u2713 Skipped : ${result.skipped}`);
      if (result.errors.length > 0) {
        console.log(`[CRON AUTO-GEOCODING] \u26A0\uFE0F  ${result.errors.length} erreurs d\xE9tect\xE9es`);
        result.errors.forEach((err, i) => {
          console.log(`[CRON AUTO-GEOCODING]   ${i + 1}. ${err.prospectId}: ${err.error}`);
        });
      }
      console.log("\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n");
    } catch (error) {
      const durationSec = Math.round((Date.now() - startTime) / 1e3);
      console.error("\n\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501");
      console.error(`[CRON AUTO-GEOCODING] \u274C ERREUR apr\xE8s ${durationSec}s`);
      console.error(`[CRON AUTO-GEOCODING] \u274C ${error.message}`);
      console.error("\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n");
      console.error(error);
    }
  }, {
    timezone
  });
}

// server/services/queue/opportunity-workers.ts
init_db();
init_schema();
import { eq as eq25, sql as sql27 } from "drizzle-orm";

// server/services/enrichment-cascade.ts
init_insee_provider();
init_pappers_provider();
var EnrichmentCascadeService = class {
  inseeProvider;
  pappersProvider;
  qualityThreshold = 80;
  // Minimum quality score pour éviter fallback
  constructor() {
    this.inseeProvider = new INSEEProvider();
    this.pappersProvider = new PappersProvider();
  }
  /**
   * Enrichir entreprise avec CASCADE INSEE → Pappers
   */
  async enrichCompany(siren) {
    console.log(`[CASCADE] \u{1F50D} Starting enrichment for SIREN: ${siren}`);
    const cleanSiren = siren.replace(/[\s-]/g, "");
    if (!this.isValidSiren(cleanSiren)) {
      console.warn(`[CASCADE] \u26A0\uFE0F Invalid SIREN format: ${cleanSiren}`);
      return {
        success: false,
        error: "Invalid SIREN format"
      };
    }
    console.log(`[CASCADE] \u{1F4CA} Step 1/2: Trying INSEE (FREE)`);
    const inseeResult = await this.tryInsee(cleanSiren);
    if (inseeResult && inseeResult.qualityScore >= this.qualityThreshold) {
      console.log(`[CASCADE] \u2705 INSEE SUCCESS - Quality: ${inseeResult.qualityScore}/100`);
      return {
        success: true,
        source: "insee",
        data: inseeResult,
        usedFallback: false
      };
    }
    if (inseeResult) {
      console.log(
        `[CASCADE] \u26A0\uFE0F INSEE quality too low (${inseeResult.qualityScore}/100) \u2192 Fallback Pappers`
      );
    } else {
      console.log(`[CASCADE] \u26A0\uFE0F INSEE failed or 404 \u2192 Fallback Pappers`);
    }
    console.log(`[CASCADE] \u{1F4B0} Step 2/2: Trying Pappers (PAID)`);
    const pappersResult = await this.tryPappers(cleanSiren);
    if (pappersResult) {
      console.log(`[CASCADE] \u2705 PAPPERS SUCCESS - Quality: ${pappersResult.qualityScore}/100`);
      return {
        success: true,
        source: "pappers",
        data: pappersResult,
        usedFallback: true
      };
    }
    console.error(`[CASCADE] \u274C All providers failed for SIREN: ${cleanSiren}`);
    return {
      success: false,
      error: "All enrichment providers failed"
    };
  }
  /**
   * Essayer enrichissement INSEE
   */
  async tryInsee(siren) {
    try {
      const result = await this.inseeProvider.enrichCompany(siren, "FR");
      if (result) {
        console.log(`[CASCADE INSEE] \u2705 Data retrieved: ${result.nom}`);
      }
      return result;
    } catch (error) {
      console.error(`[CASCADE INSEE] \u274C Error:`, error.message);
      return null;
    }
  }
  /**
   * Essayer enrichissement Pappers
   */
  async tryPappers(siren) {
    try {
      const result = await this.pappersProvider.enrichCompany(siren, "FR");
      if (result) {
        console.log(`[CASCADE PAPPERS] \u2705 Data retrieved: ${result.nom}`);
      }
      return result;
    } catch (error) {
      console.error(`[CASCADE PAPPERS] \u274C Error:`, error.message);
      return null;
    }
  }
  /**
   * Validation SIREN basique
   */
  isValidSiren(siren) {
    return /^\d{9}$/.test(siren);
  }
};
var cascadeService = new EnrichmentCascadeService();

// server/services/disc-profiling.ts
import Anthropic4 from "@anthropic-ai/sdk";
var DISCProfilingService = class {
  client = null;
  /**
   * Lazy initialization du client Anthropic
   * Évite crash au module load si clé API manquante
   */
  getClient() {
    if (!this.client) {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        throw new Error("ANTHROPIC_API_KEY not configured - cannot perform DISC profiling");
      }
      this.client = new Anthropic4({ apiKey });
    }
    return this.client;
  }
  /**
   * Prédire le profil DISC d'un dirigeant basé sur les données CASCADE
   */
  async predictDISCProfile(cascadeData) {
    console.log(`[DISC AI] \u{1F9E0} Predicting DISC profile for: ${cascadeData.nom || "Unknown"}`);
    try {
      const client = this.getClient();
      const prompt = this.buildPrompt(cascadeData);
      const message = await client.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 500,
        temperature: 0.3,
        // Basse température pour prédictions cohérentes
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      });
      const responseText = message.content[0].type === "text" ? message.content[0].text : "";
      const result = this.parseAIResponse(responseText);
      console.log(
        `[DISC AI] \u2705 Profile predicted: ${result.profile} (confidence: ${result.confidence})`
      );
      return {
        success: true,
        ...result
      };
    } catch (error) {
      console.error(`[DISC AI] \u274C Error:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
  /**
   * Construire le prompt pour Claude
   */
  buildPrompt(data) {
    const effectifText = data.effectif ? `Effectif: ${data.effectif} salari\xE9s` : "Effectif inconnu";
    const caText = data.chiffreAffaires ? `Chiffre d'affaires: ${(data.chiffreAffaires / 1e6).toFixed(1)}M\u20AC` : "CA inconnu";
    const secteurText = data.secteurActivite || "Secteur inconnu";
    return `Tu es un expert en analyse comportementale DISC pour le B2B.

Analyse cette entreprise fran\xE7aise et pr\xE9dit le profil DISC dominant de son dirigeant :

**Entreprise :** ${data.nom || "Non sp\xE9cifi\xE9"}
**Secteur :** ${secteurText}
**${effectifText}**
**${caText}**
**Forme juridique :** ${data.formeJuridique || "Non sp\xE9cifi\xE9"}

**Contexte DISC :**
- **D (Dominant)** : D\xE9cideur rapide, orient\xE9 r\xE9sultats, direct, aime le challenge. Typique des dirigeants de PME/ETI en croissance, secteurs dynamiques (tech, BTP, industrie), CA > 5M\u20AC.
- **I (Influent)** : Sociable, persuasif, cr\xE9atif, relationnel. Fr\xE9quent dans services, marketing, conseil, startups innovantes.
- **S (Stable)** : Patient, m\xE9thodique, loyal, prudent. Secteurs traditionnels, artisans, associations, effectifs stables.
- **C (Conforme)** : Analytique, pr\xE9cis, perfectionniste, aime les processus. Secteurs r\xE9glement\xE9s (sant\xE9, finance, comptabilit\xE9).

R\xE9ponds UNIQUEMENT au format JSON structur\xE9 suivant (sans code block markdown) :
{
  "profile": "D|I|S|C",
  "confidence": 0.XX (entre 0 et 1),
  "reasoning": "Explication courte (max 100 mots)"
}`;
  }
  /**
   * Parser la réponse de Claude
   */
  parseAIResponse(response) {
    try {
      let cleanResponse = response.trim();
      if (cleanResponse.startsWith("```json")) {
        cleanResponse = cleanResponse.replace(/```json\s*/g, "").replace(/```\s*/g, "");
      }
      if (cleanResponse.startsWith("```")) {
        cleanResponse = cleanResponse.replace(/```\s*/g, "");
      }
      const parsed = JSON.parse(cleanResponse);
      const validProfiles = ["D", "I", "S", "C"];
      if (!validProfiles.includes(parsed.profile)) {
        throw new Error(`Invalid profile: ${parsed.profile}`);
      }
      return {
        profile: parsed.profile,
        confidence: Math.min(Math.max(parsed.confidence || 0.5, 0), 1),
        // Clamp entre 0-1
        reasoning: parsed.reasoning || "No reasoning provided"
      };
    } catch (error) {
      console.warn(`[DISC AI] \u26A0\uFE0F Parse error, using fallback: ${error.message}`);
      const profileMatch = response.match(/profil[:\s]*([DISC])/i);
      const profile = profileMatch?.[1]?.toUpperCase() || "S";
      return {
        profile,
        confidence: 0.6,
        // Confiance modérée pour fallback
        reasoning: "Profile detected from text (fallback parsing)"
      };
    }
  }
};
var discService = new DISCProfilingService();

// server/services/queue/opportunity-workers.ts
async function cascadeEnrichmentJob([job]) {
  console.log("[OPP CASCADE] Starting enrichment for opportunity:", job.id);
  try {
    const { opportunityId, userId } = job.data;
    const [opportunity] = await db.select().from(opportunities).where(eq25(opportunities.id, opportunityId));
    if (!opportunity) {
      console.error(`[OPP CASCADE] Opportunity ${opportunityId} not found`);
      return { success: false, error: "Opportunity not found" };
    }
    if (!opportunity.siren) {
      console.log(`[OPP CASCADE] No SIREN for opportunity ${opportunityId}, skipping enrichment`);
      return { success: true, skipped: true, reason: "No SIREN" };
    }
    console.log(`[OPP CASCADE] \u{1F50D} Enriching SIREN ${opportunity.siren}`);
    const cascadeResult = await cascadeService.enrichCompany(opportunity.siren);
    if (!cascadeResult.success || !cascadeResult.data) {
      console.error(`[OPP CASCADE] \u274C Enrichment failed: ${cascadeResult.error}`);
      await db.insert(opportunityActivities).values({
        opportunityId,
        userId: userId || opportunity.userId,
        activityType: "enrichment",
        activityTitle: "Enrichissement CASCADE \xE9chou\xE9",
        activityDescription: `Erreur: ${cascadeResult.error}`
      });
      throw new Error(`CASCADE enrichment failed: ${cascadeResult.error}`);
    }
    const companyData = cascadeResult.data;
    const enrichedData = {
      cascadeEnriched: true,
      cascadeData: {
        source: cascadeResult.source,
        usedFallback: cascadeResult.usedFallback,
        nom: companyData.nom,
        nomCommercial: companyData.nomCommercial,
        formeJuridique: companyData.formeJuridique,
        effectif: companyData.effectif,
        effectifMin: companyData.effectifMin,
        effectifMax: companyData.effectifMax,
        effectifTexte: companyData.effectifTexte,
        chiffreAffaires: companyData.chiffreAffaires,
        resultatNet: companyData.resultatNet,
        codeNAF: companyData.codeNAF,
        libelleNAF: companyData.libelleNAF,
        secteurActivite: companyData.secteurActivite,
        etatAdministratif: companyData.etatAdministratif,
        qualityScore: companyData.qualityScore,
        enrichedAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      cascadeLastUpdate: /* @__PURE__ */ new Date()
    };
    await db.update(opportunities).set(enrichedData).where(eq25(opportunities.id, opportunityId));
    await db.insert(opportunityActivities).values({
      opportunityId,
      userId: userId || opportunity.userId,
      activityType: "enrichment",
      activityTitle: "Enrichissement CASCADE compl\xE9t\xE9",
      activityDescription: `Source: ${cascadeResult.source} ${cascadeResult.usedFallback ? "(fallback Pappers)" : ""}`,
      activityData: enrichedData.cascadeData
    });
    console.log(`[OPP CASCADE] \u2705 Enrichment completed for opportunity ${opportunityId}`);
    const boss = global.pgBoss;
    if (boss) {
      await boss.send("opp-disc-profiling", { opportunityId, userId });
      console.log(`[OPP CASCADE] \u{1F4E8} Queued DISC profiling job`);
    }
    return {
      success: true,
      opportunityId,
      source: cascadeResult.source,
      usedFallback: cascadeResult.usedFallback
    };
  } catch (error) {
    console.error("[OPP CASCADE] Error:", error);
    throw error;
  }
}
async function discProfilingJob([job]) {
  console.log("[OPP DISC] Starting DISC profiling for opportunity:", job.id);
  try {
    const { opportunityId, userId } = job.data;
    const [opportunity] = await db.select().from(opportunities).where(eq25(opportunities.id, opportunityId));
    if (!opportunity) {
      console.error(`[OPP DISC] Opportunity ${opportunityId} not found`);
      return { success: false, error: "Opportunity not found" };
    }
    console.log(`[OPP DISC] \u{1F3AF} Profiling opportunity ${opportunityId}`);
    if (!opportunity.cascadeData) {
      console.warn(`[OPP DISC] No CASCADE data for opportunity ${opportunityId}, skipping DISC`);
      return { success: true, skipped: true, reason: "No CASCADE data" };
    }
    const cascadeData = opportunity.cascadeData;
    const aiResult = await discService.predictDISCProfile({
      nom: cascadeData.nom,
      secteurActivite: cascadeData.secteurActivite,
      effectif: cascadeData.effectif,
      chiffreAffaires: cascadeData.chiffreAffaires,
      formeJuridique: cascadeData.formeJuridique,
      codeNAF: cascadeData.codeNAF
    });
    if (!aiResult.success || !aiResult.profile) {
      console.error(`[OPP DISC] \u274C AI profiling failed: ${aiResult.error}`);
      await db.insert(opportunityActivities).values({
        opportunityId,
        userId: userId || opportunity.userId,
        activityType: "disc_profiling",
        activityTitle: "Profil DISC \xE9chou\xE9",
        activityDescription: `Erreur: ${aiResult.error}`
      });
      throw new Error(`DISC profiling failed: ${aiResult.error}`);
    }
    const discResult = {
      discProfiled: true,
      discProfile: aiResult.profile,
      discData: {
        confidence: aiResult.confidence,
        reasoning: aiResult.reasoning,
        profiledAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      discLastUpdate: /* @__PURE__ */ new Date()
    };
    await db.update(opportunities).set(discResult).where(eq25(opportunities.id, opportunityId));
    await db.insert(opportunityActivities).values({
      opportunityId,
      userId: userId || opportunity.userId,
      activityType: "disc_profiling",
      activityTitle: "Profil DISC d\xE9termin\xE9",
      activityDescription: `Profil: ${discResult.discProfile} (confiance: ${discResult.discData.confidence})`,
      activityData: discResult.discData
    });
    console.log(`[OPP DISC] \u2705 DISC profiling completed: ${discResult.discProfile}`);
    const boss = global.pgBoss;
    if (boss) {
      await boss.send("opp-gps-geocoding", { opportunityId, userId });
      console.log(`[OPP DISC] \u{1F4E8} Queued GPS geocoding job`);
    }
    return {
      success: true,
      opportunityId,
      discProfile: discResult.discProfile,
      confidence: discResult.discData.confidence
    };
  } catch (error) {
    console.error("[OPP DISC] Error:", error);
    throw error;
  }
}
async function gpsGeocodingJob([job]) {
  console.log("[OPP GPS] Starting GPS geocoding for opportunity:", job.id);
  try {
    const { opportunityId, userId } = job.data;
    const [opportunity] = await db.select().from(opportunities).where(eq25(opportunities.id, opportunityId));
    if (!opportunity) {
      console.error(`[OPP GPS] Opportunity ${opportunityId} not found`);
      return { success: false, error: "Opportunity not found" };
    }
    if (!opportunity.cascadeData) {
      console.log(`[OPP GPS] No CASCADE data for opportunity ${opportunityId}, skipping geocoding`);
      return { success: true, skipped: true, reason: "No CASCADE data" };
    }
    console.log(`[OPP GPS] \u{1F4CD} Geocoding opportunity ${opportunityId}`);
    const cascadeData = opportunity.cascadeData;
    const address = opportunity.address || "";
    if (!address || address.trim().length === 0) {
      console.warn(`[OPP GPS] No address for opportunity ${opportunityId}, skipping geocoding`);
      return { success: true, skipped: true, reason: "No address" };
    }
    const geocodeResult = await geocodingService.geocode(
      address,
      opportunity.entity || "global",
      userId || opportunity.userId
    );
    if (!geocodeResult || !geocodeResult.latitude || !geocodeResult.longitude) {
      console.error(`[OPP GPS] \u274C Geocoding failed for address: ${address}`);
      await db.insert(opportunityActivities).values({
        opportunityId,
        userId: userId || opportunity.userId,
        activityType: "gps_geocoding",
        activityTitle: "G\xE9ocodage \xE9chou\xE9",
        activityDescription: `Impossible de g\xE9ocoder: ${address}`
      });
      throw new Error(`GPS geocoding failed for address: ${address}`);
    }
    const gpsResult = {
      gpsGeocoded: true,
      gpsLatitude: geocodeResult.latitude.toString(),
      gpsLongitude: geocodeResult.longitude.toString(),
      gpsData: {
        address: geocodeResult.address,
        city: geocodeResult.city,
        postalCode: geocodeResult.postalCode,
        country: geocodeResult.country,
        source: geocodeResult.source,
        geocodedAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      gpsLastUpdate: /* @__PURE__ */ new Date()
    };
    await db.update(opportunities).set(gpsResult).where(eq25(opportunities.id, opportunityId));
    await db.insert(opportunityActivities).values({
      opportunityId,
      userId: userId || opportunity.userId,
      activityType: "gps_geocoding",
      activityTitle: "G\xE9olocalisation compl\xE9t\xE9e",
      activityDescription: `Coordonn\xE9es: ${gpsResult.gpsLatitude}, ${gpsResult.gpsLongitude}`,
      activityData: gpsResult.gpsData
    });
    console.log(`[OPP GPS] \u2705 GPS geocoding completed`);
    return {
      success: true,
      opportunityId,
      latitude: gpsResult.gpsLatitude,
      longitude: gpsResult.gpsLongitude
    };
  } catch (error) {
    console.error("[OPP GPS] Error:", error);
    throw error;
  }
}
async function scoringRecalculationJob([job]) {
  console.log("[OPP SCORING] Starting scoring recalculation for opportunity:", job.id);
  try {
    const { opportunityId } = job.data;
    const [opportunity] = await db.select().from(opportunities).where(eq25(opportunities.id, opportunityId));
    if (!opportunity) {
      console.error(`[OPP SCORING] Opportunity ${opportunityId} not found`);
      return { success: false, error: "Opportunity not found" };
    }
    await db.execute(sql27`SELECT calculate_opportunity_score(${opportunityId}::varchar)`);
    console.log(`[OPP SCORING] \u2705 Scoring recalculated for opportunity ${opportunityId}`);
    return { success: true, opportunityId };
  } catch (error) {
    console.error("[OPP SCORING] Error:", error);
    throw error;
  }
}
async function registerOpportunityWorkers(boss) {
  console.log("[OPP Workers] Registering opportunity workers...");
  try {
    await boss.work("opp-cascade-enrichment", cascadeEnrichmentJob);
    await boss.work("opp-disc-profiling", discProfilingJob);
    await boss.work("opp-gps-geocoding", gpsGeocodingJob);
    await boss.work("opp-scoring-recalc", scoringRecalculationJob);
    console.log("[OPP Workers] \u2705 4 opportunity workers registered successfully");
  } catch (error) {
    console.error("[OPP Workers] \u274C Error registering workers:", error);
    throw error;
  }
}

// server/cron/opportunityScoring.ts
init_db();
init_schema();
import cron4 from "node-cron";
import { eq as eq26, sql as sql28, and as and20 } from "drizzle-orm";
function initOpportunityScoringCron() {
  const schedule2 = "0 1 * * *";
  console.log("[CRON OPP SCORING] \u2713 Programm\xE9 :", schedule2, "(Europe/Paris)");
  console.log("[CRON OPP SCORING] \u2713 Recalcul quotidien scoring opportunit\xE9s");
  cron4.schedule(schedule2, async () => {
    console.log("[CRON OPP SCORING] \u{1F3AF} D\xE9marrage recalcul scoring quotidien...");
    try {
      const startTime = Date.now();
      const activeOpportunities = await db.select({ id: opportunities.id }).from(opportunities).where(
        and20(
          eq26(opportunities.status, "active"),
          sql28`${opportunities.deletedAt} IS NULL`
        )
      );
      console.log(`[CRON OPP SCORING] \u{1F4CA} ${activeOpportunities.length} opportunit\xE9s \xE0 recalculer`);
      let successCount = 0;
      let errorCount = 0;
      for (const opp of activeOpportunities) {
        try {
          await db.execute(
            sql28`SELECT calculate_opportunity_score(${opp.id}::varchar)`
          );
          successCount++;
        } catch (error) {
          console.error(`[CRON OPP SCORING] \u274C Erreur scoring ${opp.id}:`, error.message);
          errorCount++;
        }
      }
      const duration = Date.now() - startTime;
      console.log(`[CRON OPP SCORING] \u2705 Termin\xE9 en ${duration}ms`);
      console.log(`[CRON OPP SCORING]    - Succ\xE8s: ${successCount}`);
      console.log(`[CRON OPP SCORING]    - Erreurs: ${errorCount}`);
    } catch (error) {
      console.error("[CRON OPP SCORING] \u274C Erreur globale:", error);
    }
  }, {
    timezone: "Europe/Paris"
  });
}

// server/cron/opportunityStagnation.ts
init_db();
init_schema();
import cron5 from "node-cron";
import { eq as eq27, sql as sql29, and as and21 } from "drizzle-orm";
function initOpportunityStagnationCron() {
  const schedule2 = "0 9 * * *";
  console.log("[CRON OPP STAGNATION] \u2713 Programm\xE9 :", schedule2, "(Europe/Paris)");
  console.log("[CRON OPP STAGNATION] \u2713 D\xE9tection opportunit\xE9s stagnantes");
  console.log("[CRON OPP STAGNATION] \u2713 Crit\xE8res: daysInHector > 15 ET score < 50");
  cron5.schedule(schedule2, async () => {
    console.log("[CRON OPP STAGNATION] \u{1F50D} D\xE9marrage d\xE9tection stagnation...");
    try {
      const startTime = Date.now();
      const stagnantOpportunities = await db.select().from(opportunities).where(
        and21(
          eq27(opportunities.status, "active"),
          sql29`${opportunities.deletedAt} IS NULL`,
          sql29`${opportunities.daysInHector} > 15`,
          sql29`${opportunities.score} < 50`
        )
      );
      console.log(`[CRON OPP STAGNATION] \u26A0\uFE0F  ${stagnantOpportunities.length} opportunit\xE9s stagnantes d\xE9tect\xE9es`);
      let markedCount = 0;
      for (const opp of stagnantOpportunities) {
        try {
          if (!opp.requalificationRequired) {
            await db.update(opportunities).set({
              requalificationRequired: true,
              updatedAt: /* @__PURE__ */ new Date()
            }).where(eq27(opportunities.id, opp.id));
            await db.insert(opportunityActivities).values({
              opportunityId: opp.id,
              userId: opp.userId,
              activityType: "system_alert",
              activityTitle: "Opportunit\xE9 stagnante d\xE9tect\xE9e",
              activityDescription: `Jours dans Hector: ${opp.daysInHector}, Score: ${opp.score}. Requalification requise.`,
              activityData: {
                daysInHector: opp.daysInHector,
                score: opp.score,
                temperature: opp.temperature,
                detectedAt: (/* @__PURE__ */ new Date()).toISOString()
              }
            });
            markedCount++;
          }
        } catch (error) {
          console.error(`[CRON OPP STAGNATION] \u274C Erreur marquage ${opp.id}:`, error.message);
        }
      }
      const duration = Date.now() - startTime;
      console.log(`[CRON OPP STAGNATION] \u2705 Termin\xE9 en ${duration}ms`);
      console.log(`[CRON OPP STAGNATION]    - Stagnantes d\xE9tect\xE9es: ${stagnantOpportunities.length}`);
      console.log(`[CRON OPP STAGNATION]    - Nouvellement marqu\xE9es: ${markedCount}`);
      if (markedCount > 0) {
        console.log(`[CRON OPP STAGNATION] \u{1F4E7} TODO: Notifier managers (${markedCount} opportunit\xE9s)`);
      }
    } catch (error) {
      console.error("[CRON OPP STAGNATION] \u274C Erreur globale:", error);
    }
  }, {
    timezone: "Europe/Paris"
  });
}

// server/index.ts
process.env.TZ = "Europe/Paris";
if (!process.env.SESSION_SECRET) {
  console.error("\u274C ERREUR FATALE: SESSION_SECRET non d\xE9fini dans les variables d'environnement");
  console.error("   Cette variable est requise pour la s\xE9curit\xE9 des sessions et du CRON job de prospection");
  console.error("   D\xE9finissez SESSION_SECRET dans vos secrets avant de d\xE9marrer le serveur");
  process.exit(1);
}
var app = express10();
ensurePythonServer();
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}
var proxyToPython = (req, res, next) => {
  if (req.originalUrl.startsWith("/api/auth") || req.originalUrl.startsWith("/api/chat") || req.originalUrl.startsWith("/api/media") || req.originalUrl.startsWith("/api/admin") || req.originalUrl.startsWith("/api/organization") || req.originalUrl.startsWith("/api/teams") || req.originalUrl.startsWith("/api/analytics") || req.originalUrl.startsWith("/api/audit") || req.originalUrl.startsWith("/api/crm") || req.originalUrl.startsWith("/api/prospects") || req.originalUrl.startsWith("/api/prospection") || req.originalUrl.startsWith("/api/workflow") || req.originalUrl.startsWith("/api/analyze-business-card") || req.originalUrl.startsWith("/api/notifications") || req.originalUrl.startsWith("/api/stats") || req.originalUrl.startsWith("/api/learning") || req.originalUrl.startsWith("/api/advanced") || req.originalUrl.startsWith("/api/enrichment") || req.originalUrl.startsWith("/api/companies") || req.originalUrl.startsWith("/api/patron") || req.originalUrl.startsWith("/api/phone") || req.originalUrl.startsWith("/api/gps") || req.originalUrl.startsWith("/api/supervision") || req.originalUrl.startsWith("/api/batch-import") || req.originalUrl.startsWith("/api/opportunities") || req.originalUrl.startsWith("/api/competitor")) {
    return next();
  }
  const headers = { ...req.headers };
  delete headers["content-length"];
  delete headers.host;
  const options = {
    hostname: "localhost",
    port: 5001,
    path: req.originalUrl,
    method: req.method,
    headers
  };
  log(`[PROXY] ${req.method} ${req.originalUrl} -> Python:5001`);
  const proxyReq = http.request(options, (proxyRes) => {
    log(`[PROXY] Response from Python: ${proxyRes.statusCode}`);
    res.status(proxyRes.statusCode || 500);
    Object.keys(proxyRes.headers).forEach((key) => {
      const value = proxyRes.headers[key];
      if (value) {
        res.setHeader(key, value);
      }
    });
    proxyRes.pipe(res);
  });
  proxyReq.on("error", (error) => {
    log(`[PROXY ERROR] ${error.code}: ${error.message}`);
    if (error.code === "ECONNREFUSED") {
      next();
    } else {
      res.status(500).json({ error: "Erreur proxy vers API Python", details: error.message });
    }
  });
  req.pipe(proxyReq);
};
app.use("/api", proxyToPython);
app.use("/docs", proxyToPython);
app.use("/redoc", proxyToPython);
app.use("/openapi.json", proxyToPython);
app.use(express10.json({ limit: "10mb" }));
app.use(express10.urlencoded({ extended: false, limit: "10mb" }));
app.use("/uploads", express10.static("uploads"));
app.use(
  session2({
    secret: process.env.SESSION_SECRET || "hector-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1e3,
      sameSite: "lax"
    }
  })
);
app.use(rlsSessionMiddleware);
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  try {
    await prospectionQueue.initialize();
    log("\u2705 Queue initialized successfully");
    const worker = new ProspectionWorker({ storage });
    await worker.start();
    log("\u2705 Worker started successfully");
    const boss = prospectionQueue.getBoss();
    if (boss) {
      global.pgBoss = boss;
      await registerOpportunityWorkers(boss);
      log("\u2705 Opportunity workers registered successfully");
    }
    cron_service_default.initialize();
    log("\u2705 CRON Service initialized successfully");
    initAutoEnrichmentCron();
    log("\u2705 Auto-Enrichment CRON initialized successfully");
    initAutoGeocodingCron();
    log("\u2705 Auto-Geocoding CRON initialized successfully");
    initOpportunityScoringCron();
    log("\u2705 Opportunity Scoring CRON initialized successfully");
    initOpportunityStagnationCron();
    log("\u2705 Opportunity Stagnation CRON initialized successfully");
  } catch (error) {
    log(`\u274C Failed to initialize queue/worker: ${error}`);
  }
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
  process.on("SIGTERM", () => {
    log("\u{1F6D1} SIGTERM re\xE7u, arr\xEAt graceful...");
    cron_service_default.stopAll();
    process.exit(0);
  });
  process.on("SIGINT", () => {
    log("\u{1F6D1} SIGINT re\xE7u, arr\xEAt graceful...");
    cron_service_default.stopAll();
    process.exit(0);
  });
})();
