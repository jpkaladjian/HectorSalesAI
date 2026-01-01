import { z } from "zod";

export const workflowSchema = z.object({
  // Options de création
  createProspect: z.boolean().default(true),
  createOpportunity: z.boolean().default(true),
  createRdv: z.boolean().default(true),
  createAction: z.boolean().default(true),
  sendEmail: z.boolean().default(false),
  
  // Mode "Prospect à qualifier"
  prospectAQualifier: z.boolean().default(false),

  // Données prospect
  prospectNom: z.string().min(1, "Le nom est requis"),
  prospectPrenom: z.string().optional(),
  prospectFonction: z.string().optional(),
  prospectEntreprise: z.string().optional(),
  prospectSiret: z.string().optional(),
  prospectSiren: z.string().optional(),
  prospectEmail: z.string().email("Email invalide").optional().or(z.literal("")),
  prospectTelephone: z.string().optional(),
  prospectAdresse1: z.string().optional(),
  prospectAdresse2: z.string().optional(),
  prospectCodePostal: z.string().optional(),
  prospectVille: z.string().optional(),
  prospectPays: z.string().default("France"),
  prospectEntity: z.enum(["france", "luxembourg", "belgique"]).optional(),
  prospectSecteur: z.string().optional(),
  prospectNotes: z.string().optional(),

  // Données échéance concurrent (optionnel)
  competitorConcurrentId: z.string().optional(),
  competitorContractEndDate: z.string().optional(),
  competitorMonthlyAmount: z.coerce.number().optional(),
  competitorNotes: z.string().optional(),
  competitorSolutionsInstalled: z.array(z.string()).optional(),
  competitorSubscriptionType: z.string().optional(),
  competitorNumberOfSites: z.coerce.number().optional(),
  competitorAvgContractDurationMonths: z.coerce.number().optional(),
  competitorSatisfactionLevel: z.string().optional(),
  competitorSatisfactionNotes: z.string().optional(),

  // Données opportunité
  opportunityNom: z.string().optional(),
  opportunityMontant: z.number().min(0, "Le montant doit être positif").default(0),
  opportunityEtape: z.enum(["nouveau", "proposition", "negociation", "gagne", "perdu"]).default("nouveau"),
  opportunityProbabilite: z.number().min(0).max(100).default(50),

  // Données RDV
  rdvTitre: z.string().optional(),
  rdvDate: z.string().optional(),
  rdvDuree: z.string().default("1h"),
  rdvLieu: z.string().optional(),
  rdvType: z.string().default("Rendez-vous commercial"),
  rdvObjectif: z.string().optional(),
  rdvParticipants: z.string().optional(),

  // Données action
  actionTitre: z.string().optional(),
  actionType: z.enum(["appel", "email", "reunion", "autre"]).default("appel"),
  actionPriorite: z.enum(["basse", "moyenne", "haute"]).default("moyenne"),
  actionDateEcheance: z.string().optional(),
  actionDescription: z.string().optional(),
})
.refine((data) => {
  if (data.createAction && (!data.actionDateEcheance || data.actionDateEcheance.trim() === '')) {
    return false;
  }
  return true;
}, {
  message: "La date d'échéance est requise",
  path: ["actionDateEcheance"],
})
.refine((data) => {
  if (data.createOpportunity && (!data.opportunityNom || data.opportunityNom.trim() === '')) {
    return false;
  }
  return true;
}, {
  message: "Le nom de l'opportunité est requis",
  path: ["opportunityNom"],
})
.refine((data) => {
  if (data.createRdv) {
    if (!data.rdvTitre || data.rdvTitre.trim() === '') return false;
    if (!data.rdvDate || data.rdvDate.trim() === '') return false;
    if (!data.rdvLieu || data.rdvLieu.trim() === '') return false;
  }
  return true;
}, {
  message: "Tous les champs du RDV sont requis",
  path: ["rdvDate"],
})
.refine((data) => {
  if (data.createAction && (!data.actionTitre || data.actionTitre.trim() === '')) {
    return false;
  }
  return true;
}, {
  message: "Le titre de l'action est requis",
  path: ["actionTitre"],
});

export type WorkflowFormData = z.infer<typeof workflowSchema>;
