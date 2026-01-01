import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  Building2,
  Mail,
  Phone as PhoneIcon,
  MapPin,
  User,
  Calendar,
  Loader2,
  CheckCircle2,
  MessageSquare,
  Briefcase,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { NavigationBar } from "@/components/NavigationBar";
import type { Prospect, InsertProspect } from "@shared/schema";
import PhoneScriptGenerator from "./PhoneScriptGenerator";

export default function Prospects() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProspect, setEditingProspect] = useState<Prospect | null>(null);
  const [scriptGeneratorProspect, setScriptGeneratorProspect] = useState<Prospect | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: prospects = [], isLoading } = useQuery<Prospect[]>({
    queryKey: ["/api/crm/prospects"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<InsertProspect>) => {
      return await apiRequest("POST", "/api/crm/prospects", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/prospects"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Prospect créé",
        description: "Le prospect a été ajouté avec succès",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de créer le prospect",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertProspect> }) => {
      return await apiRequest("PATCH", `/api/crm/prospects/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/prospects"] });
      setEditingProspect(null);
      toast({
        title: "Prospect modifié",
        description: "Les modifications ont été enregistrées",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le prospect",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/crm/prospects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/prospects"] });
      toast({
        title: "Prospect supprimé",
        description: "Le prospect a été supprimé avec succès",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le prospect",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: any = {
      nom: formData.get("nom") as string,
      prenom: formData.get("prenom") as string,
      entreprise: formData.get("entreprise") as string,
      enseigneCommerciale: formData.get("enseigneCommerciale") as string,
      raisonSociale: formData.get("raisonSociale") as string,
      siret: formData.get("siret") as string,
      email: formData.get("email") as string,
      telephone: formData.get("telephone") as string,
      adresse1: formData.get("adresse") as string,
      ville: formData.get("ville") as string,
      codePostal: formData.get("codePostal") as string,
      secteur: formData.get("secteur") as string,
      statut: formData.get("statut") as string,
      source: formData.get("source") as string,
      notes: formData.get("notes") as string,
      entity: formData.get("entity") as string || undefined,
    };

    // Ajouter données échéance concurrent si renseignées
    const competitorConcurrentId = formData.get("competitorConcurrentId") as string;
    const competitorContractEndDate = formData.get("competitorContractEndDate") as string;
    if (competitorConcurrentId && competitorContractEndDate) {
      const solutionsInstalledRaw = formData.get("competitorSolutionsInstalled") as string;
      data.competitorSituation = {
        concurrentId: competitorConcurrentId,
        contractEndDate: competitorContractEndDate,
        monthlyAmount: formData.get("competitorMonthlyAmount") ? parseFloat(formData.get("competitorMonthlyAmount") as string) : undefined,
        notes: formData.get("competitorNotes") as string || undefined,
        solutionsInstalled: solutionsInstalledRaw ? JSON.parse(solutionsInstalledRaw) : undefined,
        subscriptionType: formData.get("competitorSubscriptionType") as string || undefined,
        numberOfSites: formData.get("competitorNumberOfSites") ? parseInt(formData.get("competitorNumberOfSites") as string) : undefined,
        avgContractDurationMonths: formData.get("competitorAvgContractDurationMonths") ? parseInt(formData.get("competitorAvgContractDurationMonths") as string) : undefined,
        satisfactionLevel: formData.get("competitorSatisfactionLevel") as string || undefined,
        satisfactionNotes: formData.get("competitorSatisfactionNotes") as string || undefined,
      };
    }

    if (editingProspect) {
      updateMutation.mutate({ id: editingProspect.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const filteredProspects = prospects.filter(prospect => {
    const query = searchQuery.toLowerCase();
    return (
      prospect.nom.toLowerCase().includes(query) ||
      prospect.entreprise.toLowerCase().includes(query) ||
      prospect.email?.toLowerCase().includes(query) ||
      prospect.telephone?.toLowerCase().includes(query)
    );
  });

  const getStatutBadgeVariant = (statut: string) => {
    switch (statut) {
      case 'actif':
        return 'default';
      case 'qualifie':
        return 'secondary';
      case 'en_attente':
        return 'outline';
      case 'perdu':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatutLabel = (statut: string) => {
    switch (statut) {
      case 'actif':
        return 'Actif';
      case 'qualifie':
        return 'Qualifié';
      case 'en_attente':
        return 'En attente';
      case 'perdu':
        return 'Perdu';
      default:
        return statut;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <h1 className="text-lg font-semibold">Prospects</h1>
          <NavigationBar showHomeButton={true} />
        </div>
      </header>

      <main className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1 max-w-sm">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un prospect..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-prospects"
              />
            </div>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-prospect">
                <Plus className="mr-2 h-4 w-4" />
                Nouveau Prospect
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nouveau Prospect</DialogTitle>
              </DialogHeader>
              <ProspectForm
                onSubmit={handleSubmit}
                isLoading={createMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            Chargement...
          </div>
        ) : filteredProspects.length === 0 ? (
          <Card className="p-12">
            <div className="text-center text-muted-foreground">
              {searchQuery ? "Aucun prospect trouvé" : "Aucun prospect pour le moment"}
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredProspects.map((prospect) => (
              <Card
                key={prospect.id}
                className="hover-elevate"
                data-testid={`card-prospect-${prospect.id}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base truncate">
                          {prospect.prenom} {prospect.nom}
                        </CardTitle>
                        {/* Badge Entity temporaire pour vérifier RLS */}
                        <Badge 
                          variant="outline" 
                          className="shrink-0 text-xs font-mono"
                          data-testid={`badge-entity-${prospect.id}`}
                        >
                          {prospect.entity === 'france' && '🇫🇷 FR'}
                          {prospect.entity === 'luxembourg' && '🇱🇺 LU'}
                          {prospect.entity === 'belgique' && '🇧🇪 BE'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <Building2 className="h-3 w-3 shrink-0" />
                        <span className="truncate">{prospect.entreprise}</span>
                      </div>
                      {prospect.fonction && (
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <Briefcase className="h-3 w-3 shrink-0" />
                          <span className="truncate">{prospect.fonction}</span>
                        </div>
                      )}
                    </div>
                    <Badge variant={getStatutBadgeVariant(prospect.statut)}>
                      {getStatutLabel(prospect.statut)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {prospect.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span className="truncate">{prospect.email}</span>
                    </div>
                  )}
                  {prospect.telephone && (
                    <div className="flex items-center gap-2 text-sm">
                      <PhoneIcon className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span className="truncate">{prospect.telephone}</span>
                    </div>
                  )}
                  {prospect.ville && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span className="truncate">{prospect.ville}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <User className="h-3 w-3 shrink-0" />
                    <span>Source: {prospect.source}</span>
                  </div>

                  {/* Section Données Enrichies */}
                  {prospect.isFullyEnriched === 'true' && (
                    <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <h3 className="text-xs font-semibold text-green-800 dark:text-green-300">Données enrichies</h3>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                        {prospect.capitalSocial && (
                          <div className="truncate">
                            <span className="font-medium text-gray-700 dark:text-gray-300">Capital:</span>
                            <span className="ml-1 text-gray-600 dark:text-gray-400">{prospect.capitalSocial}</span>
                          </div>
                        )}
                        
                        {prospect.formeJuridique && (
                          <div className="truncate">
                            <span className="font-medium text-gray-700 dark:text-gray-300">Forme:</span>
                            <span className="ml-1 text-gray-600 dark:text-gray-400">{prospect.formeJuridique}</span>
                          </div>
                        )}
                        
                        {prospect.effectifEntreprise && (
                          <div className="truncate">
                            <span className="font-medium text-gray-700 dark:text-gray-300">Effectif:</span>
                            <span className="ml-1 text-gray-600 dark:text-gray-400">{prospect.effectifEntreprise}</span>
                          </div>
                        )}
                        
                        {prospect.dateCreationEntreprise && (
                          <div className="truncate">
                            <span className="font-medium text-gray-700 dark:text-gray-300">Création:</span>
                            <span className="ml-1 text-gray-600 dark:text-gray-400">
                              {new Date(prospect.dateCreationEntreprise).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        )}
                        
                        {prospect.chiffreAffaires && (
                          <div className="truncate col-span-2">
                            <span className="font-medium text-gray-700 dark:text-gray-300">CA:</span>
                            <span className="ml-1 text-gray-600 dark:text-gray-400">
                              {parseFloat(prospect.chiffreAffaires.toString()).toLocaleString('fr-FR')} €
                            </span>
                          </div>
                        )}
                        
                        {prospect.dirigeantPrincipal && (
                          <div className="truncate col-span-2">
                            <span className="font-medium text-gray-700 dark:text-gray-300">Dirigeant:</span>
                            <span className="ml-1 text-gray-600 dark:text-gray-400">{prospect.dirigeantPrincipal}</span>
                          </div>
                        )}
                      </div>
                      
                      {prospect.enrichedAt && (
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          Enrichi le {new Date(prospect.enrichedAt).toLocaleString('fr-FR')}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex flex-col gap-2 pt-2">
                    {/* Bouton Génération Script IA - MODULE PHONING */}
                    <Dialog
                      open={scriptGeneratorProspect?.id === prospect.id}
                      onOpenChange={(open) => {
                        if (!open) setScriptGeneratorProspect(null);
                        else setScriptGeneratorProspect(prospect);
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="default"
                          size="sm"
                          data-testid={`button-generate-script-${prospect.id}`}
                        >
                          <MessageSquare className="mr-2 h-3 w-3" />
                          Générer Script IA
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Script d'Appel IA - Module Phoning</DialogTitle>
                        </DialogHeader>
                        <PhoneScriptGenerator 
                          prospect={prospect}
                          onClose={() => setScriptGeneratorProspect(null)}
                        />
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Build query string with prospect data
                        const params = new URLSearchParams({
                          nom: prospect.nom,
                          ...(prospect.prenom && { prenom: prospect.prenom }),
                          entreprise: prospect.entreprise,
                          ...(prospect.email && { email: prospect.email }),
                          ...(prospect.telephone && { telephone: prospect.telephone }),
                          ...(prospect.adresse1 && { adresse1: prospect.adresse1 }),
                          ...(prospect.ville && { ville: prospect.ville }),
                          ...(prospect.codePostal && { codePostal: prospect.codePostal }),
                        });
                        setLocation(`/crm/workflow?${params.toString()}`);
                      }}
                      data-testid={`button-prepare-rdv-${prospect.id}`}
                    >
                      <Calendar className="mr-2 h-3 w-3" />
                      Préparer RDV
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setLocation(`/crm/rdvs?prospectId=${prospect.id}`);
                      }}
                      data-testid={`button-nouveau-rdv-${prospect.id}`}
                    >
                      <Calendar className="mr-2 h-3 w-3" />
                      Nouveau RDV
                    </Button>
                    
                    <div className="flex gap-2">
                      <Dialog
                        open={editingProspect?.id === prospect.id}
                        onOpenChange={(open) => {
                          if (!open) setEditingProspect(null);
                          else setEditingProspect(prospect);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            data-testid={`button-edit-prospect-${prospect.id}`}
                          >
                            <Edit className="mr-2 h-3 w-3" />
                            Modifier
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Modifier le Prospect</DialogTitle>
                          </DialogHeader>
                          <ProspectForm
                            onSubmit={handleSubmit}
                            initialData={prospect}
                            isLoading={updateMutation.isPending}
                          />
                        </DialogContent>
                      </Dialog>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (confirm("Êtes-vous sûr de vouloir supprimer ce prospect ?")) {
                            deleteMutation.mutate(prospect.id);
                          }
                        }}
                        data-testid={`button-delete-prospect-${prospect.id}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function ProspectForm({
  onSubmit,
  initialData,
  isLoading,
}: {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  initialData?: Prospect;
  isLoading: boolean;
}) {
  const { user } = useAuth();
  const [secteur, setSecteur] = useState(initialData?.secteur || "");
  const [statut, setStatut] = useState(initialData?.statut || "actif");
  const [source, setSource] = useState(initialData?.source || "direct");
  const [entity, setEntity] = useState(initialData?.entity || "");
  
  // États pour l'auto-enrichissement
  const [siret, setSiret] = useState(initialData?.siret || "");
  const [entreprise, setEntreprise] = useState(initialData?.entreprise || "");
  const [raisonSociale, setRaisonSociale] = useState(initialData?.raisonSociale || "");
  const [enseigneCommerciale, setEnseigneCommerciale] = useState(initialData?.enseigneCommerciale || "");
  const [adresse, setAdresse] = useState(initialData?.adresse1 || "");
  const [ville, setVille] = useState(initialData?.ville || "");
  const [codePostal, setCodePostal] = useState(initialData?.codePostal || "");
  const [isEnriching, setIsEnriching] = useState(false);
  const { toast } = useToast();

  // États pour échéance concurrent
  const [captureCompetitor, setCaptureCompetitor] = useState(false);
  const [concurrentId, setConcurrentId] = useState("");
  const [contractEndDate, setContractEndDate] = useState("");
  const [monthlyAmount, setMonthlyAmount] = useState("");
  const [competitorNotes, setCompetitorNotes] = useState("");
  const [solutionsInstalled, setSolutionsInstalled] = useState<string[]>([]);
  const [subscriptionType, setSubscriptionType] = useState("");
  const [numberOfSites, setNumberOfSites] = useState("");
  const [avgContractDurationMonths, setAvgContractDurationMonths] = useState("");
  const [satisfactionLevel, setSatisfactionLevel] = useState("");
  const [satisfactionNotes, setSatisfactionNotes] = useState("");

  // Fetch concurrents actifs
  const { data: concurrentsData } = useQuery({
    queryKey: ['/api/competitor/concurrents'],
    enabled: captureCompetitor,
  });

  // Fonction d'enrichissement SIRET
  const handleSiretChange = useCallback(async (value: string) => {
    setSiret(value);
    
    // Vérifier si 14 chiffres
    if (value.length !== 14 || !/^\d{14}$/.test(value)) {
      return;
    }
    
    setIsEnriching(true);
    
    try {
      const response = await apiRequest("POST", "/api/prospects/enrich-siret-quick", { siret: value });
      
      if (response.success && response.data) {
        // Pré-remplir les champs automatiquement
        const raisonSocialeValue = response.data.raison_sociale || "";
        setRaisonSociale(raisonSocialeValue);
        setEnseigneCommerciale(response.data.enseigne_commerciale || "");
        setEntreprise(raisonSocialeValue); // Le champ Entreprise = Raison Sociale
        setAdresse(response.data.adresse || "");
        setVille(response.data.ville || "");
        setCodePostal(response.data.code_postal || "");
        
        // Mapper le secteur retourné vers les options du select
        const secteurMapping: Record<string, string> = {
          "pharmacie": "Santé",
          "commerce_alimentaire": "Commerce",
          "restaurant_traditionnel": "Restauration",
          "autres_secteurs_structure": "Autre"
        };
        
        const secteurValue = secteurMapping[response.data.secteur] || "Autre";
        setSecteur(secteurValue);
        
        toast({
          title: "✅ Données enrichies",
          description: `${response.data.raison_sociale} - ${response.data.ville}`,
        });
      }
    } catch (error: any) {
      console.error("Erreur enrichissement:", error);
      
      // Ne pas afficher d'erreur si SIRET non trouvé (silencieux)
      if (error.message && !error.message.includes("404")) {
        toast({
          title: "⚠️ Enrichissement indisponible",
          description: "Vous pouvez continuer à saisir manuellement",
          variant: "default",
        });
      }
    } finally {
      setIsEnriching(false);
    }
  }, [toast]);

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="prenom">Prénom</Label>
          <Input
            id="prenom"
            name="prenom"
            defaultValue={initialData?.prenom || ""}
            data-testid="input-prenom"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nom">Nom *</Label>
          <Input
            id="nom"
            name="nom"
            required
            defaultValue={initialData?.nom}
            data-testid="input-nom"
          />
        </div>
      </div>

      {/* Champ Entity - Visible uniquement pour Admin Groupe */}
      {user?.role === 'admin_groupe' && (
        <div className="space-y-2">
          <Label htmlFor="entity">
            Entité *
            <span className="text-xs text-muted-foreground ml-2">
              (Visible uniquement pour Admin Groupe)
            </span>
          </Label>
          <Select value={entity} onValueChange={setEntity} required>
            <SelectTrigger id="entity" data-testid="select-entity">
              <SelectValue placeholder="Choisir l'entité..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="france">🇫🇷 France</SelectItem>
              <SelectItem value="luxembourg">🇱🇺 Luxembourg</SelectItem>
              <SelectItem value="belgique">🇧🇪 Belgique (2026)</SelectItem>
            </SelectContent>
          </Select>
          <input type="hidden" name="entity" value={entity} />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="entreprise">Entreprise *</Label>
        <Input
          id="entreprise"
          name="entreprise"
          required
          value={entreprise}
          onChange={(e) => setEntreprise(e.target.value)}
          data-testid="input-entreprise"
          placeholder="Raison sociale de l'entreprise"
        />
        <p className="text-xs text-muted-foreground">
          Raison sociale juridique (sera remplie automatiquement via SIRET)
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="siret">SIRET</Label>
        <div className="relative">
          <Input
            id="siret"
            name="siret"
            placeholder="14 chiffres - Ex: 80382008300019"
            maxLength={14}
            pattern="[0-9]{14}"
            value={siret}
            onChange={(e) => handleSiretChange(e.target.value)}
            data-testid="input-siret"
            className={isEnriching ? "pr-10" : ""}
          />
          {isEnriching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {isEnriching ? "⏳ Enrichissement en cours..." : "📋 Auto-enrichissement activé via API Pappers"}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="enseigneCommerciale">Enseigne Commerciale (auto-enrichi)</Label>
          <Input
            id="enseigneCommerciale"
            name="enseigneCommerciale"
            placeholder="Ex: GRANDE PHARMACIE DE LA VERPILLIERE"
            value={enseigneCommerciale}
            onChange={(e) => setEnseigneCommerciale(e.target.value)}
            data-testid="input-enseigne-commerciale"
          />
          <p className="text-xs text-muted-foreground">
            Nom visible du commerce (si différent du nom juridique)
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="raisonSociale">Raison Sociale (auto-enrichi)</Label>
          <Input
            id="raisonSociale"
            name="raisonSociale"
            placeholder="Ex: SARL PHARMACIE MARTIN"
            value={raisonSociale}
            onChange={(e) => setRaisonSociale(e.target.value)}
            data-testid="input-raison-sociale"
          />
          <p className="text-xs text-muted-foreground">
            Nom juridique officiel (sera récupéré automatiquement via SIRET)
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={initialData?.email || ""}
            data-testid="input-email"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="telephone">Téléphone</Label>
          <Input
            id="telephone"
            name="telephone"
            defaultValue={initialData?.telephone || ""}
            data-testid="input-telephone"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="adresse">Adresse (auto-enrichi)</Label>
        <Input
          id="adresse"
          name="adresse"
          value={adresse}
          onChange={(e) => setAdresse(e.target.value)}
          placeholder="Sera complété automatiquement via SIRET"
          data-testid="input-adresse"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="ville">Ville (auto-enrichi)</Label>
          <Input
            id="ville"
            name="ville"
            value={ville}
            onChange={(e) => setVille(e.target.value)}
            placeholder="Sera complété automatiquement"
            data-testid="input-ville"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="codePostal">Code Postal (auto-enrichi)</Label>
          <Input
            id="codePostal"
            name="codePostal"
            value={codePostal}
            onChange={(e) => setCodePostal(e.target.value)}
            placeholder="Auto-enrichi"
            data-testid="input-code-postal"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="secteur">Secteur d'activité (auto-enrichi)</Label>
        <Select value={secteur} onValueChange={setSecteur}>
          <SelectTrigger id="secteur" data-testid="select-secteur">
            <SelectValue placeholder="Sera complété automatiquement via SIRET" />
          </SelectTrigger>
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
        <input type="hidden" name="secteur" value={secteur} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="statut">Statut *</Label>
          <Select value={statut} onValueChange={setStatut}>
            <SelectTrigger id="statut" data-testid="select-statut">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="actif">Actif</SelectItem>
              <SelectItem value="qualifie">Qualifié</SelectItem>
              <SelectItem value="en_attente">En attente</SelectItem>
              <SelectItem value="perdu">Perdu</SelectItem>
            </SelectContent>
          </Select>
          <input type="hidden" name="statut" value={statut} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="source">Source *</Label>
          <Select value={source} onValueChange={setSource}>
            <SelectTrigger id="source" data-testid="select-source">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="direct">Direct</SelectItem>
              <SelectItem value="referral">Recommandation</SelectItem>
              <SelectItem value="website">Site Web</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
              <SelectItem value="salon">Salon</SelectItem>
              <SelectItem value="carte_visite">Carte de visite</SelectItem>
              <SelectItem value="autre">Autre</SelectItem>
            </SelectContent>
          </Select>
          <input type="hidden" name="source" value={source} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={4}
          defaultValue={initialData?.notes || ""}
          data-testid="textarea-notes"
        />
      </div>

      {/* Section Échéance Concurrent (optionnel) */}
      <Card className="border-2 border-dashed">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Checkbox
              id="capture-competitor"
              checked={captureCompetitor}
              onCheckedChange={(checked) => setCaptureCompetitor(checked as boolean)}
              data-testid="checkbox-capture-competitor"
            />
            <div className="flex-1">
              <Label htmlFor="capture-competitor" className="text-base font-semibold flex items-center gap-2 cursor-pointer">
                <Shield className="w-5 h-5 text-orange-500" />
                Échéance Concurrent (optionnel)
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Cocher si le prospect a déjà un fournisseur de sécurité avec échéance connue
              </p>
            </div>
          </div>
        </CardHeader>
        {captureCompetitor && (
          <CardContent className="space-y-4 pt-0">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="concurrent-id">Concurrent actuel *</Label>
                <Select value={concurrentId} onValueChange={setConcurrentId} required={captureCompetitor}>
                  <SelectTrigger id="concurrent-id" data-testid="select-concurrent">
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    {((concurrentsData as any)?.concurrents || []).map((c: any) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contract-end-date">Date échéance contrat *</Label>
                <Input
                  id="contract-end-date"
                  type="date"
                  value={contractEndDate}
                  onChange={(e) => setContractEndDate(e.target.value)}
                  required={captureCompetitor}
                  data-testid="input-contract-end-date"
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="monthly-amount">Montant mensuel (€/mois)</Label>
                <Input
                  id="monthly-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={monthlyAmount}
                  onChange={(e) => setMonthlyAmount(e.target.value)}
                  placeholder="Ex: 650"
                  data-testid="input-monthly-amount"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subscription-type">Type d'abonnement</Label>
                <Select value={subscriptionType} onValueChange={setSubscriptionType}>
                  <SelectTrigger id="subscription-type" data-testid="select-subscription-type">
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mensuel">Mensuel</SelectItem>
                    <SelectItem value="trimestriel">Trimestriel</SelectItem>
                    <SelectItem value="annuel">Annuel</SelectItem>
                    <SelectItem value="pluriannuel">Pluriannuel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="number-of-sites">Nombre de sites</Label>
                <Input
                  id="number-of-sites"
                  type="number"
                  min="1"
                  value={numberOfSites}
                  onChange={(e) => setNumberOfSites(e.target.value)}
                  placeholder="Ex: 3"
                  data-testid="input-number-of-sites"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="avg-contract-duration">Durée moy. contrat (mois)</Label>
                <Input
                  id="avg-contract-duration"
                  type="number"
                  min="1"
                  value={avgContractDurationMonths}
                  onChange={(e) => setAvgContractDurationMonths(e.target.value)}
                  placeholder="Ex: 36"
                  data-testid="input-avg-contract-duration"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="solutions-installed">Solutions installées (multi-sélection)</Label>
              <div className="grid grid-cols-2 gap-2">
                {['Gardiennage', 'Télésurveillance', 'Contrôle d\'accès', 'Vidéosurveillance', 'Alarme', 'Autre'].map((solution) => (
                  <div key={solution} className="flex items-center gap-2">
                    <Checkbox
                      id={`solution-${solution}`}
                      checked={solutionsInstalled.includes(solution)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSolutionsInstalled([...solutionsInstalled, solution]);
                        } else {
                          setSolutionsInstalled(solutionsInstalled.filter(s => s !== solution));
                        }
                      }}
                      data-testid={`checkbox-solution-${solution.toLowerCase().replace(/\s+/g, '-').replace(/'/g, '')}`}
                    />
                    <Label htmlFor={`solution-${solution}`} className="text-sm cursor-pointer">
                      {solution}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="satisfaction-level">Niveau de satisfaction</Label>
              <Select value={satisfactionLevel} onValueChange={setSatisfactionLevel}>
                <SelectTrigger id="satisfaction-level" data-testid="select-satisfaction-level">
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">⭐ Très insatisfait</SelectItem>
                  <SelectItem value="2">⭐⭐ Insatisfait</SelectItem>
                  <SelectItem value="3">⭐⭐⭐ Neutre</SelectItem>
                  <SelectItem value="4">⭐⭐⭐⭐ Satisfait</SelectItem>
                  <SelectItem value="5">⭐⭐⭐⭐⭐ Très satisfait</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="satisfaction-notes">Notes satisfaction</Label>
              <Textarea
                id="satisfaction-notes"
                rows={2}
                value={satisfactionNotes}
                onChange={(e) => setSatisfactionNotes(e.target.value)}
                placeholder="Points de douleur, insatisfactions, attentes..."
                data-testid="textarea-satisfaction-notes"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="competitor-notes">Notes générales</Label>
              <Textarea
                id="competitor-notes"
                rows={2}
                value={competitorNotes}
                onChange={(e) => setCompetitorNotes(e.target.value)}
                placeholder="Informations complémentaires..."
                data-testid="textarea-competitor-notes"
              />
            </div>
            <input type="hidden" name="competitorConcurrentId" value={concurrentId} />
            <input type="hidden" name="competitorContractEndDate" value={contractEndDate} />
            <input type="hidden" name="competitorMonthlyAmount" value={monthlyAmount} />
            <input type="hidden" name="competitorNotes" value={competitorNotes} />
            <input type="hidden" name="competitorSolutionsInstalled" value={JSON.stringify(solutionsInstalled)} />
            <input type="hidden" name="competitorSubscriptionType" value={subscriptionType} />
            <input type="hidden" name="competitorNumberOfSites" value={numberOfSites} />
            <input type="hidden" name="competitorAvgContractDurationMonths" value={avgContractDurationMonths} />
            <input type="hidden" name="competitorSatisfactionLevel" value={satisfactionLevel} />
            <input type="hidden" name="competitorSatisfactionNotes" value={satisfactionNotes} />
          </CardContent>
        )}
      </Card>

      <div className="flex gap-2 justify-end">
        <Button
          type="submit"
          disabled={isLoading}
          data-testid="button-submit-prospect"
        >
          {isLoading ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}
