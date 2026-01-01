import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Loader2, Mail, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Company } from "@shared/schema";
import { detectEntityFromAddress } from "@shared/utils";

import { workflowSchema, type WorkflowFormData, type WorkflowCreationProps } from "./types";
import { ProspectFormSection } from "./ProspectFormSection";
import { OpportunityFormSection } from "./OpportunityFormSection";
import { RdvFormSection } from "./RdvFormSection";
import { ActionFormSection } from "./ActionFormSection";
import { WorkflowResultCard } from "./WorkflowResultCard";

export function WorkflowCreation({ cardData, onSuccess, onCancel }: WorkflowCreationProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [cardImage, setCardImage] = useState<string | null>(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: concurrents = [] } = useQuery<any[]>({
    queryKey: ['/api/concurrents'],
  });

  useEffect(() => {
    const image = sessionStorage.getItem('businessCardImage');
    if (image) {
      setCardImage(image);
      sessionStorage.removeItem('businessCardImage');
    }
  }, []);

  const fullName = cardData?.prenom && cardData?.nom 
    ? `${cardData.prenom} ${cardData.nom}` 
    : cardData?.nom || "";

  const initialNotes = cardData?.poste ? `Poste: ${cardData.poste}` : "";
  const fullAddress = [cardData?.adresse1, cardData?.ville].filter(Boolean).join(", ");
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

  useEffect(() => {
    if (cardData && Object.keys(cardData).some(key => cardData[key as keyof typeof cardData])) {
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
      if ((name === "prospectCodePostal" || name === "prospectPays") && (value.prospectCodePostal || value.prospectPays)) {
        const detectedEntity = detectEntityFromAddress(value.prospectCodePostal, value.prospectPays);
        if (detectedEntity) {
          form.setValue("prospectEntity", detectedEntity);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const handleCompanyEnriched = (company: Company) => {
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
    
    if (company.nafCode || company.nafLabel) {
      const nafLabel = company.nafLabel || '';
      let secteur = "Autre";
      
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
    
    toast({
      title: "Enrichissement CASCADE réussi",
      description: `${company.legalName} - ${company.city || ''}`,
    });
  };

  const onSubmit = async (data: WorkflowFormData) => {
    setIsSubmitting(true);
    setResult(null);

    try {
      const prospectAQualifier = data.prospectAQualifier === true;
      const hasSiretOrSiren = (data.prospectSiret && data.prospectSiret.trim() !== '') || 
                              (data.prospectSiren && data.prospectSiren.trim() !== '');
      
      const qualificationNeeded = prospectAQualifier || !hasSiretOrSiren;
      
      const payload = {
        createProspect: data.createProspect,
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

      const response = await apiRequest("POST", "/api/workflow/create-from-card", payload);

      setResult(response);

      if (response.created?.prospect) {
        queryClient.invalidateQueries({ queryKey: ["/api/crm/prospects"] });
        queryClient.invalidateQueries({ queryKey: ["/api/crm/prospects/a-qualifier"] });
      }
      if (response.created?.opportunity) queryClient.invalidateQueries({ queryKey: ["/api/crm/opportunities"] });
      if (response.created?.rdv) queryClient.invalidateQueries({ queryKey: ["/api/crm/rdvs"] });
      if (response.created?.action) queryClient.invalidateQueries({ queryKey: ["/api/crm/actions"] });

      if (response.success && response.created?.prospect) {
        if (qualificationNeeded) {
          toast({
            title: "Prospect créé !",
            description: "Ce prospect nécessite une qualification. Rendez-vous sur 'Prospects à qualifier' pour compléter.",
            duration: 6000,
          });
          
          setTimeout(() => {
            setLocation("/crm/prospects-a-qualifier");
          }, 1500);
        } else {
          toast({
            title: "Workflow créé avec succès !",
            description: `${Object.values(response.created).filter(Boolean).length} élément(s) créé(s)`,
          });

          if (onSuccess) {
            onSuccess();
          }
        }
      } else if (response.success && !response.created?.prospect) {
        toast({
          title: "Workflow partiellement créé",
          description: "Le prospect n'a pas pu être créé",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erreur de création",
          description: response.errors?.length ? `${response.errors.length} erreur(s) rencontrée(s)` : "Une erreur est survenue",
          variant: "destructive",
        });
      }

    } catch (error: any) {
      toast({
        title: "Erreur",
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
          
          {cardImage && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Carte de visite analysée</p>
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
                              if (checked) {
                                form.setValue("createOpportunity", false);
                                form.setValue("createRdv", false);
                                form.setValue("createAction", false);
                              } else {
                                form.setValue("createOpportunity", true);
                                form.setValue("createRdv", true);
                                form.setValue("createAction", true);
                              }
                            }}
                          />
                        </FormControl>
                        <div className="space-y-1">
                          <FormLabel className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                            Prospect à qualifier
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

              {createProspect && (
                <ProspectFormSection 
                  form={form} 
                  concurrents={concurrents}
                  onCompanyEnriched={handleCompanyEnriched}
                />
              )}

              {createOpportunity && <OpportunityFormSection form={form} />}
              {createRdv && <RdvFormSection form={form} />}
              {createAction && <ActionFormSection form={form} />}

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

      {result && <WorkflowResultCard result={result} />}
    </div>
  );
}
