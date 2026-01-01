import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Calendar, CheckCircle2, Loader2, Mail, MapPin, User, Building2, Target, Clock, AlertCircle, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { SiretSirenInputs } from "@/components/companies/SiretSirenInputs";
import type { Company } from "@shared/schema";
import { detectEntityFromAddress } from "@shared/utils";

const workflowSchema = z.object({
  // Options de création
  createProspect: z.boolean().default(true),
  createOpportunity: z.boolean().default(true),
  createRdv: z.boolean().default(true),
  createAction: z.boolean().default(true),
  sendEmail: z.boolean().default(false),
  
  // NOUVEAU: Mode "Prospect à qualifier"
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
  // Validation conditionnelle : si createAction est true, actionDateEcheance est requise
  if (data.createAction && (!data.actionDateEcheance || data.actionDateEcheance.trim() === '')) {
    return false;
  }
  return true;
}, {
  message: "La date d'échéance est requise",
  path: ["actionDateEcheance"],
})
.refine((data) => {
  // Validation conditionnelle : si createOpportunity est true, opportunityNom est requis
  if (data.createOpportunity && (!data.opportunityNom || data.opportunityNom.trim() === '')) {
    return false;
  }
  return true;
}, {
  message: "Le nom de l'opportunité est requis",
  path: ["opportunityNom"],
})
.refine((data) => {
  // Validation conditionnelle : si createRdv est true, les champs RDV sont requis
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
  // Validation conditionnelle : si createAction est true, actionTitre est requis
  if (data.createAction && (!data.actionTitre || data.actionTitre.trim() === '')) {
    return false;
  }
  return true;
}, {
  message: "Le titre de l'action est requis",
  path: ["actionTitre"],
});

type WorkflowFormData = z.infer<typeof workflowSchema>;

interface WorkflowCreationProps {
  cardData?: {
    nom?: string;
    prenom?: string;
    entreprise?: string;
    email?: string;
    telephone?: string;
    secteur?: string;
    poste?: string;
    adresse1?: string;
    adresse2?: string;
    codePostal?: string;
    ville?: string;
    pays?: string;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function WorkflowCreation({ cardData, onSuccess, onCancel }: WorkflowCreationProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [cardImage, setCardImage] = useState<string | null>(null);
  const { toast} = useToast();
  const [, setLocation] = useLocation();

  // Récupérer la liste des concurrents
  const { data: concurrents = [] } = useQuery<any[]>({
    queryKey: ['/api/concurrents'],
  });

  // Load business card image from sessionStorage
  useEffect(() => {
    const image = sessionStorage.getItem('businessCardImage');
    if (image) {
      setCardImage(image);
      // Clear after loading
      sessionStorage.removeItem('businessCardImage');
    }
  }, []);

  // Combine prenom + nom if both are available
  const fullName = cardData?.prenom && cardData?.nom 
    ? `${cardData.prenom} ${cardData.nom}` 
    : cardData?.nom || "";

  // Add poste to notes if available
  const initialNotes = cardData?.poste ? `Poste: ${cardData.poste}` : "";

  // Build full address from components
  const fullAddress = [cardData?.adresse1, cardData?.ville].filter(Boolean).join(", ");
  
  // Détecter automatiquement l'entity depuis les données de la carte de visite
  const detectedEntity = detectEntityFromAddress(cardData?.codePostal, cardData?.pays);

  const form = useForm<WorkflowFormData>({
    resolver: zodResolver(workflowSchema),
    defaultValues: {
      createProspect: true,
      createOpportunity: true,
      createRdv: true,
      createAction: true,
      sendEmail: false,
      prospectAQualifier: false,
      prospectNom: cardData?.nom || "",
      prospectPrenom: cardData?.prenom || "",
      prospectFonction: cardData?.poste || "",
      prospectEntreprise: cardData?.entreprise || "",
      prospectSiret: "",
      prospectSiren: "",
      prospectEmail: cardData?.email || "",
      prospectTelephone: cardData?.telephone || "",
      prospectAdresse1: cardData?.adresse1 || "",
      prospectAdresse2: cardData?.adresse2 || "",
      prospectCodePostal: cardData?.codePostal || "",
      prospectVille: cardData?.ville || "",
      prospectPays: cardData?.pays || "France",
      prospectEntity: detectedEntity,
      prospectSecteur: cardData?.secteur || "",
      prospectNotes: initialNotes,
      competitorConcurrentId: "",
      competitorContractEndDate: "",
      competitorMonthlyAmount: undefined,
      competitorNotes: "",
      competitorSolutionsInstalled: [],
      competitorSubscriptionType: "",
      competitorNumberOfSites: undefined,
      competitorAvgContractDurationMonths: undefined,
      competitorSatisfactionLevel: "",
      competitorSatisfactionNotes: "",
      opportunityNom: cardData?.entreprise ? `Opportunité ${cardData.entreprise}` : "Nouvelle opportunité",
      opportunityMontant: 10000,
      opportunityEtape: "nouveau",
      opportunityProbabilite: 50,
      rdvTitre: fullName ? `RDV avec ${fullName}` : "Rendez-vous commercial",
      rdvDate: "",
      rdvDuree: "1h",
      rdvLieu: fullAddress || "",
      rdvType: "Rendez-vous commercial",
      rdvObjectif: "",
      rdvParticipants: cardData?.email || "",
      actionTitre: "Relance post-RDV",
      actionType: "appel",
      actionPriorite: "moyenne",
      actionDateEcheance: "",
      actionDescription: "",
    },
  });

  // Reset form when cardData changes (after business card scan/OCR)
  useEffect(() => {
    if (cardData && Object.keys(cardData).some(key => cardData[key as keyof typeof cardData])) {
      console.log('[WorkflowCreation] CardData detected, updating form:', cardData);
      
      const newFullName = cardData.prenom && cardData.nom 
        ? `${cardData.prenom} ${cardData.nom}` 
        : cardData.nom || "";
      
      const newInitialNotes = cardData.poste ? `Poste: ${cardData.poste}` : "";
      const newFullAddress = [cardData.adresse1, cardData.ville].filter(Boolean).join(", ");

      form.reset({
        createProspect: true,
        createOpportunity: true,
        createRdv: true,
        createAction: true,
        sendEmail: false,
        prospectAQualifier: false,
        prospectNom: cardData.nom || "",
        prospectPrenom: cardData.prenom || "",
        prospectFonction: cardData.poste || "",
        prospectEntreprise: cardData.entreprise || "",
        prospectSiret: "",
        prospectSiren: "",
        prospectEmail: cardData.email || "",
        prospectTelephone: cardData.telephone || "",
        prospectAdresse1: cardData.adresse1 || "",
        prospectAdresse2: cardData.adresse2 || "",
        prospectCodePostal: cardData.codePostal || "",
        prospectVille: cardData.ville || "",
        prospectPays: cardData.pays || "France",
        prospectEntity: detectEntityFromAddress(cardData.codePostal, cardData.pays),
        prospectSecteur: cardData.secteur || "",
        prospectNotes: newInitialNotes,
        competitorConcurrentId: "",
        competitorContractEndDate: "",
        competitorMonthlyAmount: undefined,
        competitorNotes: "",
        opportunityNom: cardData.entreprise ? `Opportunité ${cardData.entreprise}` : "Nouvelle opportunité",
        opportunityMontant: 10000,
        opportunityEtape: "nouveau",
        opportunityProbabilite: 50,
        rdvTitre: newFullName ? `RDV avec ${newFullName}` : "Rendez-vous commercial",
        rdvDate: "",
        rdvDuree: "1h",
        rdvLieu: newFullAddress || "",
        rdvType: "Rendez-vous commercial",
        rdvObjectif: "",
        rdvParticipants: cardData.email || "",
        actionTitre: "Relance post-RDV",
        actionType: "appel",
        actionPriorite: "moyenne",
        actionDateEcheance: "",
        actionDescription: "",
      });
    }
  }, [cardData, form]);

  // Auto-remplir les champs basés sur les données du prospect
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "prospectEntreprise" && value.prospectEntreprise) {
        form.setValue("opportunityNom", `Opportunité ${value.prospectEntreprise}`);
      }
      if (name === "prospectNom" && value.prospectNom) {
        const currentRdvTitre = form.getValues("rdvTitre");
        if (!currentRdvTitre || currentRdvTitre === "Rendez-vous commercial" || currentRdvTitre.startsWith("RDV")) {
          form.setValue("rdvTitre", `RDV avec ${value.prospectNom}`);
        }
      }
      // Auto-détection entity quand code postal ou pays changent
      if ((name === "prospectCodePostal" || name === "prospectPays") && (value.prospectCodePostal || value.prospectPays)) {
        const detectedEntity = detectEntityFromAddress(value.prospectCodePostal, value.prospectPays);
        if (detectedEntity) {
          form.setValue("prospectEntity", detectedEntity);
          console.log('[WorkflowCreation] Auto-detected entity:', detectedEntity, 'from postal code:', value.prospectCodePostal, 'and country:', value.prospectPays);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Callback pour l'enrichissement CASCADE automatique
  const handleCompanyEnriched = (company: Company) => {
    console.log('[WorkflowCreation] Enrichissement CASCADE reçu:', company);
    
    // Pré-remplir automatiquement tous les champs d'entreprise
    if (company.legalName) {
      form.setValue("prospectEntreprise", company.legalName);
    }
    if (company.addressLine1) {
      form.setValue("prospectAdresse1", company.addressLine1);
    }
    if (company.postalCode) {
      form.setValue("prospectCodePostal", company.postalCode);
    }
    if (company.city) {
      form.setValue("prospectVille", company.city);
    }
    
    // Mapper le code NAF vers le secteur d'activité
    if (company.nafCode || company.nafLabel) {
      const nafLabel = company.nafLabel || '';
      let secteur = "Autre";
      
      // Mapping intelligent NAF → Secteur
      if (nafLabel.toLowerCase().includes('restaur')) secteur = "Restauration";
      else if (nafLabel.toLowerCase().includes('commerc')) secteur = "Commerce";
      else if (nafLabel.toLowerCase().includes('hôtel')) secteur = "Hôtellerie";
      else if (nafLabel.toLowerCase().includes('construct') || nafLabel.toLowerCase().includes('bâti')) secteur = "BTP";
      else if (nafLabel.toLowerCase().includes('santé') || nafLabel.toLowerCase().includes('médic')) secteur = "Santé";
      else if (nafLabel.toLowerCase().includes('transport')) secteur = "Transport";
      else if (nafLabel.toLowerCase().includes('immobil')) secteur = "Immobilier";
      else if (nafLabel.toLowerCase().includes('industr') || nafLabel.toLowerCase().includes('fabricat')) secteur = "Industrie";
      else if (nafLabel.toLowerCase().includes('agricul')) secteur = "Agriculture";
      else if (nafLabel.toLowerCase().includes('service')) secteur = "Services";
      
      form.setValue("prospectSecteur", secteur);
    }
    
    // NOTE: NE PAS mettre à jour SIRET/SIREN ici car cela déclenche une boucle infinie
    // Les champs sont déjà corrects puisque l'enrichissement a été déclenché par leur saisie
    
    toast({
      title: "✅ Enrichissement CASCADE réussi",
      description: `${company.legalName} - ${company.city || ''}`,
    });
  };

  const onSubmit = async (data: WorkflowFormData) => {
    setIsSubmitting(true);
    setResult(null);

    try {
      // Détecter le mode de qualification
      const prospectAQualifier = data.prospectAQualifier === true;
      const hasSiretOrSiren = (data.prospectSiret && data.prospectSiret.trim() !== '') || 
                              (data.prospectSiren && data.prospectSiren.trim() !== '');
      
      // Si "prospect à qualifier" est coché OU si aucun SIRET/SIREN, marquer comme à qualifier
      const qualificationNeeded = prospectAQualifier || !hasSiretOrSiren;
      
      const payload = {
        createProspect: data.createProspect,
        // Si mode "prospect à qualifier", bypass les workflows
        createOpportunity: prospectAQualifier ? false : data.createOpportunity,
        createRdv: prospectAQualifier ? false : data.createRdv,
        createAction: prospectAQualifier ? false : data.createAction,
        sendEmail: data.sendEmail,

        prospectData: data.createProspect ? {
          nom: data.prospectNom,
          prenom: data.prospectPrenom || undefined,
          fonction: data.prospectFonction || undefined,
          entreprise: data.prospectEntreprise || "À qualifier",
          siret: data.prospectSiret || data.prospectSiren || undefined,
          email: data.prospectEmail || undefined,
          telephone: data.prospectTelephone || undefined,
          adresse1: data.prospectAdresse1 || undefined,
          adresse2: data.prospectAdresse2 || undefined,
          codePostal: data.prospectCodePostal || undefined,
          ville: data.prospectVille || undefined,
          pays: data.prospectPays || "France",
          entity: data.prospectEntity || undefined,
          secteur: data.prospectSecteur || undefined,
          notes: data.prospectNotes || undefined,
          statut: "actif",
          qualificationNeeded: qualificationNeeded ? "true" : "false",
          source: "scan_carte_visite",
          // Ajouter les données de situation concurrente si présentes
          competitorSituation: (data.competitorConcurrentId && data.competitorContractEndDate) ? {
            concurrentId: data.competitorConcurrentId,
            contractEndDate: data.competitorContractEndDate,
            monthlyAmount: data.competitorMonthlyAmount,
            notes: data.competitorNotes,
            solutionsInstalled: data.competitorSolutionsInstalled,
            subscriptionType: data.competitorSubscriptionType,
            numberOfSites: data.competitorNumberOfSites,
            avgContractDurationMonths: data.competitorAvgContractDurationMonths,
            satisfactionLevel: data.competitorSatisfactionLevel,
            satisfactionNotes: data.competitorSatisfactionNotes,
          } : undefined,
        } : null,

        opportunityData: data.createOpportunity ? {
          nom: data.opportunityNom!,
          montant: data.opportunityMontant,
          etape: data.opportunityEtape,
          probabilite: data.opportunityProbabilite,
        } : null,

        rdvData: data.createRdv ? {
          titre: data.rdvTitre!,
          date: new Date(data.rdvDate!).toISOString(),
          duree: data.rdvDuree,
          lieu: data.rdvLieu!,
          type: data.rdvType,
          objectif: data.rdvObjectif || undefined,
          participants: data.rdvParticipants ? data.rdvParticipants.split(',').map(p => p.trim()) : undefined,
        } : null,

        actionData: (data.createAction && data.actionDateEcheance) ? {
          titre: data.actionTitre!,
          type: data.actionType,
          priorite: data.actionPriorite,
          date_echeance: new Date(data.actionDateEcheance).toISOString(),
          description: data.actionDescription || undefined,
          statut: "a_faire",
        } : null,
      };

      console.log('[WORKFLOW] Payload:', payload);

      const response = await apiRequest("POST", "/api/workflow/create-from-card", payload);

      setResult(response);

      // Invalider les caches pour les entités créées (même en cas d'erreur partielle)
      if (response.created?.prospect) {
        queryClient.invalidateQueries({ queryKey: ["/api/crm/prospects"] });
        queryClient.invalidateQueries({ queryKey: ["/api/crm/prospects/a-qualifier"] });
      }
      if (response.created?.opportunity) queryClient.invalidateQueries({ queryKey: ["/api/crm/opportunities"] });
      if (response.created?.rdv) queryClient.invalidateQueries({ queryKey: ["/api/crm/rdvs"] });
      if (response.created?.action) queryClient.invalidateQueries({ queryKey: ["/api/crm/actions"] });

      if (response.success && response.created?.prospect) {
        // Redirection et message adaptés selon le mode
        if (qualificationNeeded) {
          // Cas 1 : Prospect à qualifier (checkbox cochée ou pas de SIRET/SIREN)
          toast({
            title: "📋 Prospect créé !",
            description: "Ce prospect nécessite une qualification. Rendez-vous sur 'Prospects à qualifier' pour compléter.",
            duration: 6000,
          });
          
          // Rediriger vers la page de qualification SEULEMENT si création réussie
          setTimeout(() => {
            setLocation("/crm/prospects-a-qualifier");
          }, 1500);
        } else {
          // Cas 2 : SIRET/SIREN présent → Prospect qualifié avec workflow complet
          toast({
            title: "✅ Workflow créé avec succès !",
            description: `${Object.values(response.created).filter(Boolean).length} élément(s) créé(s)`,
          });

          if (onSuccess) {
            onSuccess();
          }
        }
      } else if (response.success && !response.created?.prospect) {
        // Workflow partiel sans prospect
        toast({
          title: "⚠️ Workflow partiellement créé",
          description: "Le prospect n'a pas pu être créé",
          variant: "destructive",
        });
      } else {
        // Échec complet
        toast({
          title: "❌ Erreur de création",
          description: response.errors?.length ? `${response.errors.length} erreur(s) rencontrée(s)` : "Une erreur est survenue",
          variant: "destructive",
        });
      }

    } catch (error: any) {
      console.error('[WORKFLOW] Erreur:', error);
      toast({
        title: "❌ Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const createProspect = form.watch("createProspect");
  const createOpportunity = form.watch("createOpportunity");
  const createRdv = form.watch("createRdv");
  const createAction = form.watch("createAction");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Créer un Workflow Complet
          </CardTitle>
          <CardDescription>
            Créez simultanément un prospect, une opportunité, un RDV et une action de suivi
          </CardDescription>
          
          {/* Business Card Preview */}
          {cardImage && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">📸 Carte de visite analysée</p>
              <img 
                src={cardImage} 
                alt="Carte de visite" 
                className="max-w-xs rounded-md border"
                data-testid="img-business-card-preview"
              />
            </div>
          )}
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Options de création */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Éléments à créer</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="createProspect"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            data-testid="checkbox-create-prospect"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          Créer le prospect
                        </FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="createOpportunity"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            data-testid="checkbox-create-opportunity"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          Créer l'opportunité
                        </FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="createRdv"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            data-testid="checkbox-create-rdv"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          Créer le RDV
                        </FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="createAction"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            data-testid="checkbox-create-action"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          Créer l'action de suivi
                        </FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sendEmail"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            data-testid="checkbox-send-email"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          Envoyer l'email
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>

                {/* NOUVEAU: Case "Prospect à qualifier" */}
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md">
                  <FormField
                    control={form.control}
                    name="prospectAQualifier"
                    render={({ field }) => (
                      <FormItem className="flex items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            data-testid="checkbox-prospect-a-qualifier"
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              field.onChange(checked);
                              // Si coché, désactiver les workflows RDV
                              if (checked) {
                                form.setValue("createOpportunity", false);
                                form.setValue("createRdv", false);
                                form.setValue("createAction", false);
                              } else {
                                // Si décoché, réactiver les workflows
                                form.setValue("createOpportunity", true);
                                form.setValue("createRdv", true);
                                form.setValue("createAction", true);
                              }
                            }}
                          />
                        </FormControl>
                        <div className="space-y-1">
                          <FormLabel className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                            📋 Prospect à qualifier
                          </FormLabel>
                          <p className="text-xs text-blue-800 dark:text-blue-200">
                            Si coché : création simplifiée sans workflows. Le prospect ira directement dans le module "Prospects à qualifier" pour compléter les informations au bureau.
                          </p>
                          <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                            Par défaut (décoché) : workflow RDV complet avec opportunité, RDV et actions.
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Section Prospect */}
              {createProspect && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Prospect
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="prospectNom"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom *</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-prospect-nom" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="prospectPrenom"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Prénom</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-prospect-prenom" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="prospectFonction"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fonction</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Ex: Directeur, Responsable Achats" data-testid="input-prospect-fonction" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="prospectEntreprise"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Entreprise</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-prospect-entreprise" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* SIRET et SIREN - Champs séparés pour éviter les conflits */}
                      <div className="col-span-2">
                        <SiretSirenInputs
                          siretValue={form.watch("prospectSiret") || ""}
                          sirenValue={form.watch("prospectSiren") || ""}
                          onSiretChange={(value) => form.setValue("prospectSiret", value)}
                          onSirenChange={(value) => form.setValue("prospectSiren", value)}
                          onCompanyEnriched={handleCompanyEnriched}
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                          🎯 Enrichissement automatique CASCADE (INSEE→Pappers) - pré-remplit adresse, ville, secteur
                        </p>
                      </div>

                      <FormField
                        control={form.control}
                        name="prospectSecteur"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Secteur d'activité</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-prospect-secteur">
                                  <SelectValue placeholder="Sélectionner un secteur" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Restauration">Restauration</SelectItem>
                                <SelectItem value="Commerce">Commerce</SelectItem>
                                <SelectItem value="Services">Services</SelectItem>
                                <SelectItem value="Industrie">Industrie</SelectItem>
                                <SelectItem value="BTP">BTP</SelectItem>
                                <SelectItem value="Santé">Santé</SelectItem>
                                <SelectItem value="Transport">Transport</SelectItem>
                                <SelectItem value="Immobilier">Immobilier</SelectItem>
                                <SelectItem value="Hôtellerie">Hôtellerie</SelectItem>
                                <SelectItem value="Agriculture">Agriculture</SelectItem>
                                <SelectItem value="Autre">Autre</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="prospectEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} data-testid="input-prospect-email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="prospectTelephone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Téléphone</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-prospect-telephone" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="prospectAdresse1"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Adresse 1</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Numéro et nom de rue" data-testid="input-prospect-adresse1" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="prospectAdresse2"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Adresse 2</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Complément (bâtiment, étage...)" data-testid="input-prospect-adresse2" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="prospectCodePostal"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Code Postal</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="75008" data-testid="input-prospect-code-postal" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="prospectVille"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ville</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Paris" data-testid="input-prospect-ville" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="prospectPays"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pays</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-prospect-pays">
                                  <SelectValue placeholder="Sélectionner un pays" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="France">France</SelectItem>
                                <SelectItem value="Luxembourg">Luxembourg</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="prospectEntity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Entité / Pays CRM</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-prospect-entity">
                                  <SelectValue placeholder="Détection auto..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="france">🇫🇷 France</SelectItem>
                                <SelectItem value="luxembourg">🇱🇺 Luxembourg</SelectItem>
                                <SelectItem value="belgique">🇧🇪 Belgique</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription className="text-xs">
                              Détecté automatiquement depuis le code postal. Modifiable si incorrect.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="prospectNotes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea {...field} data-testid="textarea-prospect-notes" rows={3} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Section Échéance Concurrent (Optionnelle) */}
                    <div className="border-t pt-4 mt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Award className="h-4 w-4 text-orange-600" />
                        <h3 className="text-sm font-semibold">Échéance Concurrent (Optionnel)</h3>
                      </div>
                      <p className="text-xs text-muted-foreground mb-4">
                        📌 Capture l'échéance de contrat concurrent pour programmation automatique reconquête J-240
                      </p>

                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="competitorConcurrentId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Concurrent actuel</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-competitor-concurrent">
                                      <SelectValue placeholder="Sélectionner..." />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {concurrents.map((concurrent: any) => (
                                      <SelectItem key={concurrent.id} value={concurrent.id}>
                                        {concurrent.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="competitorContractEndDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Date échéance contrat</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} data-testid="input-competitor-end-date" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="competitorMonthlyAmount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Montant mensuel (€)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="Ex: 500"
                                    {...field}
                                    value={field.value ?? ""}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      field.onChange(val === "" ? undefined : parseFloat(val));
                                    }}
                                    data-testid="input-competitor-monthly-amount"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="competitorSubscriptionType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Type d'abonnement</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-competitor-subscription-type">
                                      <SelectValue placeholder="Sélectionner..." />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="mensuel">Mensuel</SelectItem>
                                    <SelectItem value="trimestriel">Trimestriel</SelectItem>
                                    <SelectItem value="annuel">Annuel</SelectItem>
                                    <SelectItem value="pluriannuel">Pluriannuel</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="competitorNumberOfSites"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nombre de sites</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="1"
                                    placeholder="Ex: 3"
                                    {...field}
                                    value={field.value ?? ""}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      field.onChange(val === "" ? undefined : parseInt(val));
                                    }}
                                    data-testid="input-competitor-number-of-sites"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="competitorAvgContractDurationMonths"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Durée moy. contrat (mois)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="1"
                                    placeholder="Ex: 36"
                                    {...field}
                                    value={field.value ?? ""}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      field.onChange(val === "" ? undefined : parseInt(val));
                                    }}
                                    data-testid="input-competitor-avg-contract-duration"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="competitorSolutionsInstalled"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Solutions installées (multi-sélection)</FormLabel>
                              <div className="grid grid-cols-2 gap-2">
                                {['Gardiennage', 'Télésurveillance', 'Contrôle d\'accès', 'Vidéosurveillance', 'Alarme', 'Autre'].map((solution) => (
                                  <div key={solution} className="flex items-center gap-2">
                                    <Checkbox
                                      id={`solution-wf-${solution}`}
                                      checked={(field.value || []).includes(solution)}
                                      onCheckedChange={(checked) => {
                                        const current = field.value || [];
                                        if (checked) {
                                          field.onChange([...current, solution]);
                                        } else {
                                          field.onChange(current.filter((s: string) => s !== solution));
                                        }
                                      }}
                                      data-testid={`checkbox-solution-wf-${solution.toLowerCase().replace(/\s+/g, '-').replace(/'/g, '')}`}
                                    />
                                    <Label htmlFor={`solution-wf-${solution}`} className="text-sm cursor-pointer">
                                      {solution}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="competitorSatisfactionLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Niveau de satisfaction</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-competitor-satisfaction-level">
                                    <SelectValue placeholder="Sélectionner..." />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="1">⭐ Très insatisfait</SelectItem>
                                  <SelectItem value="2">⭐⭐ Insatisfait</SelectItem>
                                  <SelectItem value="3">⭐⭐⭐ Neutre</SelectItem>
                                  <SelectItem value="4">⭐⭐⭐⭐ Satisfait</SelectItem>
                                  <SelectItem value="5">⭐⭐⭐⭐⭐ Très satisfait</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="competitorSatisfactionNotes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Notes satisfaction</FormLabel>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  rows={2}
                                  placeholder="Points de douleur, insatisfactions, attentes..."
                                  data-testid="textarea-competitor-satisfaction-notes"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="competitorNotes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Notes générales</FormLabel>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  rows={2}
                                  placeholder="Informations complémentaires..."
                                  data-testid="textarea-competitor-notes"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Section Opportunité */}
              {createOpportunity && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Opportunité
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="opportunityNom"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom *</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-opportunity-nom" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="opportunityMontant"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Montant (€) *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                data-testid="input-opportunity-montant"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="opportunityEtape"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Étape *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-opportunity-etape">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="nouveau">Nouveau</SelectItem>
                                <SelectItem value="proposition">Proposition</SelectItem>
                                <SelectItem value="negociation">Négociation</SelectItem>
                                <SelectItem value="gagne">Gagné</SelectItem>
                                <SelectItem value="perdu">Perdu</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="opportunityProbabilite"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Probabilité (%) *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                max={100}
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                data-testid="input-opportunity-probabilite"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Section RDV */}
              {createRdv && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Rendez-vous
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="rdvTitre"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>Titre *</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-rdv-titre" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="rdvDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date et heure *</FormLabel>
                            <FormControl>
                              <Input type="datetime-local" {...field} data-testid="input-rdv-date" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="rdvDuree"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Durée</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-rdv-duree">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="30min">30 minutes</SelectItem>
                                <SelectItem value="1h">1 heure</SelectItem>
                                <SelectItem value="1h30">1h30</SelectItem>
                                <SelectItem value="2h">2 heures</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="rdvLieu"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Lieu *</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-rdv-lieu" placeholder="Adresse ou Visio" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="rdvType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-rdv-type" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="rdvObjectif"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Objectif du RDV</FormLabel>
                          <FormControl>
                            <Textarea {...field} data-testid="textarea-rdv-objectif" rows={3} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="rdvParticipants"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Participants (séparés par des virgules)</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-rdv-participants" placeholder="nom1@email.com, nom2@email.com" />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Entrez les emails ou noms des participants, séparés par des virgules
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Section Action */}
              {createAction && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Action de suivi
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="actionTitre"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>Titre *</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-action-titre" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="actionType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-action-type">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="appel">Appel</SelectItem>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="reunion">Réunion</SelectItem>
                                <SelectItem value="autre">Autre</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="actionPriorite"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Priorité *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-action-priorite">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="basse">Basse</SelectItem>
                                <SelectItem value="moyenne">Moyenne</SelectItem>
                                <SelectItem value="haute">Haute</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="actionDateEcheance"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>Date d'échéance *</FormLabel>
                            <FormControl>
                              <Input type="datetime-local" {...field} data-testid="input-action-date" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="actionDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} data-testid="textarea-action-description" rows={3} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Boutons d'action */}
              <div className="flex justify-end gap-3">
                {onCancel && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    data-testid="button-cancel-workflow"
                  >
                    Annuler
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  data-testid="button-create-workflow"
                  className="min-w-[200px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Création en cours...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Tout créer
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Résultat du workflow */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className={result.success ? "text-green-600" : "text-orange-600"}>
              {result.success ? "✅ Workflow créé avec succès !" : "⚠️ Workflow partiellement créé"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Éléments créés */}
            <div>
              <h4 className="font-semibold mb-2">Éléments créés :</h4>
              <div className="space-y-2">
                {result.created.prospect && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>Prospect : {result.created.prospect.nom}</span>
                  </div>
                )}
                {result.created.opportunity && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>Opportunité : {result.created.opportunity.nom}</span>
                  </div>
                )}
                {result.created.rdv && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>RDV : {result.created.rdv.titre}</span>
                  </div>
                )}
                {result.created.action && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>Action : {result.created.action.titre}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Documents générés */}
            {result.documents && (
              <div>
                <h4 className="font-semibold mb-2">Documents :</h4>
                <div className="space-y-2">
                  {result.documents.pdf_generated && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>PDF généré</span>
                    </div>
                  )}
                  {result.documents.ical_generated && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>Calendrier (.ics) généré</span>
                    </div>
                  )}
                  {result.documents.email_sent && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>Email envoyé</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Erreurs */}
            {result.errors && result.errors.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 text-orange-600">Erreurs :</h4>
                <div className="space-y-1">
                  {result.errors.map((error: string, index: number) => (
                    <div key={index} className="flex items-start gap-2 text-sm text-orange-600">
                      <AlertCircle className="h-4 w-4 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
