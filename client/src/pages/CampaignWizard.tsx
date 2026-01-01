import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Calendar,
  Target,
  Users,
  Clock,
  FileCheck,
  Upload,
  Linkedin,
  Mail,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Papa from "papaparse";
import type { CampagneProspection } from "@shared/schema";

interface Scenario {
  id: string;
  nom: string;
  description: string;
  dureeJours: number;
  nombreEtapes: number;
  typeCible: string;
  tauxSuccesAttendu: number;
}

interface ProspectBDD {
  id: string;
  nom: string;
  prenom: string;
  entreprise: string;
  email: string;
  telephone: string;
}

interface WizardData {
  nom: string;
  objectif: string;
  dateDebut: string;
  dateFin: string;
  scenarioId: string;
  importMethod: "csv" | "bdd";
  csvFile: File | null;
  selectedProspectIds: string[];
  sendDays: string[];
  sendHourStart: string;
  sendHourEnd: string;
}

const DAYS_OF_WEEK = [
  { id: "lundi", label: "Lundi" },
  { id: "mardi", label: "Mardi" },
  { id: "mercredi", label: "Mercredi" },
  { id: "jeudi", label: "Jeudi" },
  { id: "vendredi", label: "Vendredi" },
  { id: "samedi", label: "Samedi" },
  { id: "dimanche", label: "Dimanche" },
];

const STEPS = [
  { id: 1, title: "Informations", icon: Target },
  { id: 2, title: "Scénario", icon: FileCheck },
  { id: 3, title: "Prospects", icon: Users },
  { id: 4, title: "Configuration", icon: Clock },
  { id: 5, title: "Récapitulatif", icon: Check },
];

export default function CampaignWizard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [csvParsing, setCsvParsing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [wizardData, setWizardData] = useState<WizardData>({
    nom: "",
    objectif: "",
    dateDebut: new Date().toISOString().split("T")[0],
    dateFin: "",
    scenarioId: "",
    importMethod: "bdd",
    csvFile: null,
    selectedProspectIds: [],
    sendDays: ["lundi", "mardi", "mercredi", "jeudi", "vendredi"],
    sendHourStart: "09:00",
    sendHourEnd: "18:00",
  });

  // Détecter le mode édition depuis l'URL (ex: ?edit=campaign_id)
  const urlParams = new URLSearchParams(window.location.search);
  const editCampaignId = urlParams.get('edit');
  const isEditMode = !!editCampaignId;

  const { data: scenarios = [] } = useQuery<Scenario[]>({
    queryKey: ["/api/prospection/scenarios"],
  });

  const { data: prospectsBDD = [] } = useQuery<ProspectBDD[]>({
    queryKey: ["/api/crm/prospects"],
    enabled: wizardData.importMethod === "bdd",
  });

  // Charger les données de la campagne en mode édition
  useEffect(() => {
    if (isEditMode && editCampaignId) {
      setIsLoading(true);
      Promise.all([
        apiRequest("GET", `/api/prospection/campagnes/${editCampaignId}`),
        apiRequest("GET", `/api/prospection/campagnes/${editCampaignId}/prospects`)
      ])
        .then(([campagne, prospects]: [CampagneProspection, any[]]) => {
          const heuresEnvoi = campagne.heuresEnvoi as any;
          
          // Convertir les dates en string
          const formatDate = (date: string | Date | undefined | null) => {
            if (!date) return "";
            const d = typeof date === "string" ? new Date(date) : date;
            return d.toISOString().split("T")[0];
          };
          
          setWizardData({
            nom: campagne.nom,
            objectif: campagne.objectif || "",
            dateDebut: formatDate(campagne.dateDebut) || new Date().toISOString().split("T")[0],
            dateFin: formatDate(campagne.dateFin),
            scenarioId: campagne.scenarioId,
            importMethod: "bdd",
            csvFile: null,
            selectedProspectIds: prospects.map((p: any) => p.prospectId),
            sendDays: campagne.joursEnvoi || ["lundi", "mardi", "mercredi", "jeudi", "vendredi"],
            sendHourStart: heuresEnvoi?.debut || "09:00",
            sendHourEnd: heuresEnvoi?.fin || "18:00",
          });
          setIsLoading(false);
        })
        .catch((error) => {
          toast({
            title: "❌ Erreur",
            description: "Impossible de charger la campagne",
            variant: "destructive",
          });
          setLocation("/prospection/campagnes");
        });
    }
  }, [isEditMode, editCampaignId]);

  const createCampaignMutation = useMutation({
    mutationFn: async (campaignData: any) => {
      if (isEditMode && editCampaignId) {
        return await apiRequest("PATCH", `/api/prospection/campagnes/${editCampaignId}`, campaignData);
      } else {
        return await apiRequest("POST", "/api/prospection/campagnes", campaignData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prospection/campagnes"] });
      toast({
        title: isEditMode ? "✅ Campagne modifiée !" : "🎉 Campagne créée !",
        description: isEditMode 
          ? "Les modifications ont été enregistrées avec succès."
          : "Ta campagne de prospection a été lancée avec succès.",
      });
      setLocation("/prospection/campagnes");
    },
    onError: () => {
      toast({
        title: "❌ Erreur",
        description: isEditMode ? "Impossible de modifier la campagne." : "Impossible de créer la campagne.",
        variant: "destructive",
      });
    },
  });

  const updateData = (updates: Partial<WizardData>) => {
    setWizardData((prev) => ({ ...prev, ...updates }));
  };

  const handleCsvUpload = async (file: File) => {
    setCsvParsing(true);
    updateData({ csvFile: file });

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const prospectIds: string[] = [];
          
          // Créer chaque prospect via API
          for (const row of results.data) {
            const rowData = row as any;
            
            if (!rowData.nom || !rowData.entreprise) continue;
            
            const prospectData = {
              nom: rowData.nom,
              prenom: rowData.prenom || "",
              entreprise: rowData.entreprise,
              email: rowData.email || "",
              telephone: rowData.telephone || "",
            };
            
            const prospect = await apiRequest("POST", "/api/crm/prospects", prospectData);
            prospectIds.push(prospect.id);
          }
          
          updateData({ selectedProspectIds: prospectIds });
          toast({
            title: "✅ CSV importé",
            description: `${prospectIds.length} prospect(s) créé(s) avec succès`,
          });
        } catch (error) {
          toast({
            title: "❌ Erreur import CSV",
            description: "Impossible de créer les prospects depuis le CSV",
            variant: "destructive",
          });
          updateData({ csvFile: null, selectedProspectIds: [] });
        } finally {
          setCsvParsing(false);
        }
      },
      error: () => {
        toast({
          title: "❌ Erreur parsing CSV",
          description: "Format CSV invalide. Vérifiez votre fichier.",
          variant: "destructive",
        });
        updateData({ csvFile: null });
        setCsvParsing(false);
      },
    });
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    const selectedScenario = scenarios.find((s) => s.id === wizardData.scenarioId);
    
    if (isEditMode) {
      // Mode édition : envoyer seulement les champs modifiables
      const campaignData = {
        nom: wizardData.nom,
        objectif: wizardData.objectif,
        dateDebut: wizardData.dateDebut,
        dateFin: wizardData.dateFin,
        joursEnvoi: wizardData.sendDays,
        heuresEnvoi: {
          debut: wizardData.sendHourStart,
          fin: wizardData.sendHourEnd,
        },
      };
      await createCampaignMutation.mutateAsync(campaignData);
    } else {
      // Mode création : envoyer tous les champs
      const campaignData = {
        nom: wizardData.nom,
        scenarioId: wizardData.scenarioId,
        objectif: wizardData.objectif,
        statut: "active",
        dateDebut: wizardData.dateDebut,
        dateFin: wizardData.dateFin,
        configEnvoi: {
          jours: wizardData.sendDays,
          heureDebut: wizardData.sendHourStart,
          heureFin: wizardData.sendHourEnd,
        },
        prospectIds: wizardData.selectedProspectIds,
      };
      await createCampaignMutation.mutateAsync(campaignData);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return wizardData.nom && wizardData.objectif && wizardData.dateDebut;
      case 2:
        return wizardData.scenarioId;
      case 3:
        // Bloquer pendant le parsing CSV ou si aucun prospect sélectionné
        if (csvParsing) return false;
        return wizardData.selectedProspectIds.length > 0;
      case 4:
        return wizardData.sendDays.length > 0 && wizardData.sendHourStart && wizardData.sendHourEnd;
      default:
        return true;
    }
  };

  const selectedScenario = scenarios.find((s) => s.id === wizardData.scenarioId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement de la campagne...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/prospection/campagnes">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-title">
              {isEditMode ? "Modifier la campagne" : "Nouvelle campagne de prospection"}
            </h1>
            <p className="text-muted-foreground">
              {isEditMode ? "Modifie les paramètres de ta campagne" : "Configure ta campagne en 5 étapes simples"}
            </p>
          </div>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                      isCompleted
                        ? "bg-primary border-primary text-primary-foreground"
                        : isActive
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground"
                    }`}
                    data-testid={`step-${step.id}`}
                  >
                    {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <span
                    className={`text-xs mt-2 font-medium ${
                      isActive ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 ${
                      isCompleted ? "bg-primary" : "bg-border"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {STEPS[currentStep - 1] && (
                <>
                  {(() => {
                    const Icon = STEPS[currentStep - 1].icon;
                    return <Icon className="h-5 w-5" />;
                  })()}
                  Étape {currentStep} : {STEPS[currentStep - 1].title}
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Étape 1 : Informations générales */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom de la campagne *</Label>
                  <Input
                    id="nom"
                    placeholder="Ex: Prospection Pharmacies IDF Q1 2025"
                    value={wizardData.nom}
                    onChange={(e) => updateData({ nom: e.target.value })}
                    data-testid="input-campaign-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="objectif">Objectif de la campagne *</Label>
                  <Textarea
                    id="objectif"
                    placeholder="Décris ton objectif : nombre de RDV, segment cible, KPIs attendus..."
                    value={wizardData.objectif}
                    onChange={(e) => updateData({ objectif: e.target.value })}
                    rows={4}
                    data-testid="input-campaign-objective"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateDebut">Date de début *</Label>
                    <Input
                      id="dateDebut"
                      type="date"
                      value={wizardData.dateDebut}
                      onChange={(e) => updateData({ dateDebut: e.target.value })}
                      data-testid="input-date-start"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateFin">Date de fin (optionnel)</Label>
                    <Input
                      id="dateFin"
                      type="date"
                      value={wizardData.dateFin}
                      onChange={(e) => updateData({ dateFin: e.target.value })}
                      data-testid="input-date-end"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Étape 2 : Choix du scénario */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Choisis le scénario adapté à ton type de prospection
                </p>
                <RadioGroup
                  value={wizardData.scenarioId}
                  onValueChange={(value) => updateData({ scenarioId: value })}
                >
                  <div className="space-y-3">
                    {scenarios.map((scenario) => (
                      <div
                        key={scenario.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-all hover-elevate ${
                          wizardData.scenarioId === scenario.id
                            ? "border-primary bg-primary/5"
                            : "border-border"
                        }`}
                        onClick={() => updateData({ scenarioId: scenario.id })}
                        data-testid={`card-scenario-${scenario.id}`}
                      >
                        <div className="flex items-start gap-3">
                          <RadioGroupItem
                            value={scenario.id}
                            id={scenario.id}
                            data-testid={`radio-scenario-${scenario.id}`}
                          />
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <Label
                                htmlFor={scenario.id}
                                className="font-semibold cursor-pointer"
                              >
                                {scenario.nom}
                              </Label>
                              <Badge variant="outline" className="gap-1">
                                <Calendar className="h-3 w-3" />
                                {scenario.dureeJours}j
                              </Badge>
                              <Badge variant="secondary" className="gap-1">
                                {scenario.nombreEtapes} étapes
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {scenario.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Cible : {scenario.typeCible}</span>
                              <span>Taux succès : {(scenario.tauxSuccesAttendu * 100).toFixed(0)}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Étape 3 : Import prospects */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <RadioGroup
                  value={wizardData.importMethod}
                  onValueChange={(value: "csv" | "bdd") => updateData({ importMethod: value })}
                >
                  <div className="flex gap-4">
                    <div
                      className={`flex-1 border rounded-lg p-4 cursor-pointer transition-all hover-elevate ${
                        wizardData.importMethod === "bdd"
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      }`}
                      onClick={() => updateData({ importMethod: "bdd" })}
                      data-testid="option-import-bdd"
                    >
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="bdd" id="bdd" />
                        <Label htmlFor="bdd" className="cursor-pointer font-semibold">
                          Sélectionner depuis la base
                        </Label>
                      </div>
                    </div>
                    <div
                      className={`flex-1 border rounded-lg p-4 cursor-pointer transition-all hover-elevate ${
                        wizardData.importMethod === "csv"
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      }`}
                      onClick={() => updateData({ importMethod: "csv" })}
                      data-testid="option-import-csv"
                    >
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="csv" id="csv" />
                        <Label htmlFor="csv" className="cursor-pointer font-semibold">
                          Importer un fichier CSV
                        </Label>
                      </div>
                    </div>
                  </div>
                </RadioGroup>

                {wizardData.importMethod === "csv" && (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                      {csvParsing ? (
                        <>
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                          <p className="text-sm font-medium">Parsing du CSV en cours...</p>
                        </>
                      ) : (
                        <>
                          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <Label
                            htmlFor="csv-upload"
                            className="cursor-pointer text-sm font-medium"
                          >
                            Clique pour importer un fichier CSV
                          </Label>
                          <Input
                            id="csv-upload"
                            type="file"
                            accept=".csv"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleCsvUpload(file);
                            }}
                            data-testid="input-csv-file"
                          />
                          {wizardData.csvFile && !csvParsing && (
                            <p className="mt-2 text-sm text-muted-foreground">
                              ✅ {wizardData.csvFile.name} - {wizardData.selectedProspectIds.length} prospects
                            </p>
                          )}
                        </>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Format CSV attendu : nom, prenom, email, entreprise, telephone
                    </p>
                  </div>
                )}

                {wizardData.importMethod === "bdd" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Sélectionne les prospects ({prospectsBDD.length} disponibles)</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (wizardData.selectedProspectIds.length === prospectsBDD.length) {
                            updateData({ selectedProspectIds: [] });
                          } else {
                            updateData({
                              selectedProspectIds: prospectsBDD.map((p) => p.id),
                            });
                          }
                        }}
                        data-testid="button-select-all-prospects"
                      >
                        {wizardData.selectedProspectIds.length === prospectsBDD.length
                          ? "Tout désélectionner"
                          : "Tout sélectionner"}
                      </Button>
                    </div>
                    <div className="border rounded-lg max-h-96 overflow-y-auto">
                      {prospectsBDD.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                          Aucun prospect dans ta base. Crée-en d'abord dans le CRM.
                        </div>
                      ) : (
                        <div className="divide-y">
                          {prospectsBDD.map((prospect) => (
                            <div
                              key={prospect.id}
                              className="flex items-center gap-3 p-3 hover-elevate cursor-pointer"
                              onClick={() => {
                                const newSelected = wizardData.selectedProspectIds.includes(
                                  prospect.id
                                )
                                  ? wizardData.selectedProspectIds.filter(
                                      (id) => id !== prospect.id
                                    )
                                  : [...wizardData.selectedProspectIds, prospect.id];
                                updateData({ selectedProspectIds: newSelected });
                              }}
                              data-testid={`prospect-${prospect.id}`}
                            >
                              <Checkbox
                                checked={wizardData.selectedProspectIds.includes(prospect.id)}
                                onCheckedChange={(checked) => {
                                  const newSelected = checked
                                    ? [...wizardData.selectedProspectIds, prospect.id]
                                    : wizardData.selectedProspectIds.filter(
                                        (id) => id !== prospect.id
                                      );
                                  updateData({ selectedProspectIds: newSelected });
                                }}
                                data-testid={`checkbox-prospect-${prospect.id}`}
                              />
                              <div className="flex-1">
                                <p className="font-medium">
                                  {prospect.prenom} {prospect.nom}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {prospect.entreprise} • {prospect.email}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {wizardData.selectedProspectIds.length} prospect(s) sélectionné(s)
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Étape 4 : Configuration envoi */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <Label>Jours d'envoi</Label>
                  <div className="grid grid-cols-4 gap-3">
                    {DAYS_OF_WEEK.map((day) => (
                      <div
                        key={day.id}
                        className={`border rounded-lg p-3 cursor-pointer text-center transition-all hover-elevate ${
                          wizardData.sendDays.includes(day.id)
                            ? "border-primary bg-primary/10"
                            : "border-border"
                        }`}
                        onClick={() => {
                          const newDays = wizardData.sendDays.includes(day.id)
                            ? wizardData.sendDays.filter((d) => d !== day.id)
                            : [...wizardData.sendDays, day.id];
                          updateData({ sendDays: newDays });
                        }}
                        data-testid={`day-${day.id}`}
                      >
                        <Checkbox
                          checked={wizardData.sendDays.includes(day.id)}
                          className="mb-2"
                          data-testid={`checkbox-day-${day.id}`}
                        />
                        <Label className="cursor-pointer block text-sm font-medium">
                          {day.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hourStart">Heure de début</Label>
                    <Input
                      id="hourStart"
                      type="time"
                      value={wizardData.sendHourStart}
                      onChange={(e) => updateData({ sendHourStart: e.target.value })}
                      data-testid="input-hour-start"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hourEnd">Heure de fin</Label>
                    <Input
                      id="hourEnd"
                      type="time"
                      value={wizardData.sendHourEnd}
                      onChange={(e) => updateData({ sendHourEnd: e.target.value })}
                      data-testid="input-hour-end"
                    />
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">
                    💡 Les messages seront envoyés automatiquement pendant les plages
                    horaires définies, uniquement les jours sélectionnés.
                  </p>
                </div>
              </div>
            )}

            {/* Étape 5 : Récapitulatif */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Target className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold">Informations générales</p>
                      <p className="text-sm text-muted-foreground">
                        Nom : {wizardData.nom}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Objectif : {wizardData.objectif}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Période : {wizardData.dateDebut}
                        {wizardData.dateFin && ` → ${wizardData.dateFin}`}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-start gap-3">
                    <FileCheck className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold">Scénario sélectionné</p>
                      {selectedScenario && (
                        <>
                          <p className="text-sm text-muted-foreground">
                            {selectedScenario.nom} • {selectedScenario.dureeJours} jours • {selectedScenario.nombreEtapes} étapes
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Taux de succès attendu : {(selectedScenario.tauxSuccesAttendu * 100).toFixed(0)}%
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold">Prospects</p>
                      <p className="text-sm text-muted-foreground">
                        {wizardData.importMethod === "csv"
                          ? `Import CSV : ${wizardData.csvFile?.name || "Non défini"}`
                          : `${wizardData.selectedProspectIds.length} prospect(s) sélectionné(s)`}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold">Configuration d'envoi</p>
                      <p className="text-sm text-muted-foreground">
                        Jours : {wizardData.sendDays.map((d) => DAYS_OF_WEEK.find((day) => day.id === d)?.label).join(", ")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Horaires : {wizardData.sendHourStart} - {wizardData.sendHourEnd}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-primary/10 border border-primary rounded-lg p-4">
                  <p className="text-sm font-medium text-primary">
                    🚀 Prêt à lancer ta campagne ?
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Les envois démarreront automatiquement selon le scénario choisi.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            data-testid="button-previous"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Précédent
          </Button>
          
          {currentStep < STEPS.length ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              data-testid="button-next"
            >
              Suivant
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || createCampaignMutation.isPending}
              data-testid="button-submit-campaign"
            >
              {createCampaignMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  {isEditMode ? "Enregistrement..." : "Lancement..."}
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  {isEditMode ? "Enregistrer les modifications" : "Lancer la campagne"}
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
