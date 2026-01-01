import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Plus, 
  Euro,
  TrendingUp,
  Clock,
  Target,
  Edit,
  Trash2,
  CheckCircle2,
  Video,
  MapPin,
  ShieldCheck,
  Lock,
  Heart,
  Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { NavigationBar } from "@/components/NavigationBar";
import type { Opportunity, InsertOpportunity, Prospect, TypePrestation } from "@shared/schema";

export default function Opportunities() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);
  const [activeTab, setActiveTab] = useState<"visio" | "terrain">("visio");
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: opportunities = [] } = useQuery<Opportunity[]>({
    queryKey: ["/api/crm/opportunities"],
  });

  const { data: prospects = [] } = useQuery<Prospect[]>({
    queryKey: ["/api/crm/prospects"],
  });

  const { data: prestations = [] } = useQuery<TypePrestation[]>({
    queryKey: ["/api/prestations"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<InsertOpportunity>) => {
      return await apiRequest("POST", "/api/crm/opportunities", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/opportunities"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Opportunité créée",
        description: "L'opportunité a été ajoutée avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer l'opportunité",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertOpportunity> }) => {
      return await apiRequest("PATCH", `/api/crm/opportunities/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/opportunities"] });
      setEditingOpportunity(null);
      toast({
        title: "Opportunité modifiée",
        description: "Les modifications ont été enregistrées",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de modifier l'opportunité",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/crm/opportunities/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/opportunities"] });
      toast({
        title: "Opportunité supprimée",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const prospectIdValue = formData.get("prospectId") as string;
    const data = {
      prospectId: prospectIdValue && prospectIdValue !== "none" ? prospectIdValue : null,
      titre: formData.get("titre") as string,
      nombreContrats: parseInt(formData.get("nombreContrats") as string || "1"),
      abonnementMensuelHt: formData.get("abonnementMensuelHt") as string,
      dureeEngagementMois: parseInt(formData.get("dureeEngagementMois") as string || "36"),
      typePrestation: formData.get("typePrestation") as string || null,
      statut: formData.get("statut") as string,
      description: formData.get("description") as string || null,
      datePremierContact: editingOpportunity ? editingOpportunity.datePremierContact : new Date(),
    };

    if (editingOpportunity) {
      updateMutation.mutate({ id: editingOpportunity.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  // Pipeline SDR Visio (R1→R2→R3→R4)
  const visioColumns = [
    { id: "r1_visio_planifie", label: "R1 Planifié", color: "bg-blue-50 dark:bg-blue-950" },
    { id: "r1_visio_fait", label: "R1 Fait", color: "bg-cyan-50 dark:bg-cyan-950" },
    { id: "r2_visio_planifie", label: "R2 Planifié", color: "bg-indigo-50 dark:bg-indigo-950" },
    { id: "r2_visio_fait", label: "R2 Fait", color: "bg-purple-50 dark:bg-purple-950" },
    { id: "r3_visio_planifie", label: "R3 Planifié", color: "bg-violet-50 dark:bg-violet-950" },
    { id: "r3_visio_fait", label: "R3 Fait", color: "bg-fuchsia-50 dark:bg-fuchsia-950" },
    { id: "r4_visio_planifie", label: "R4 Planifié", color: "bg-pink-50 dark:bg-pink-950" },
    { id: "r4_visio_fait", label: "R4 Fait", color: "bg-rose-50 dark:bg-rose-950" },
    { id: "signe", label: "Signé", color: "bg-green-50 dark:bg-green-950" },
    { id: "perdu", label: "Perdu", color: "bg-red-50 dark:bg-red-950" },
  ];

  // Pipeline BD/IC Terrain (R1→R2)
  const terrainColumns = [
    { id: "r1_planifie", label: "R1 Planifié", color: "bg-blue-50 dark:bg-blue-950" },
    { id: "r1_fait_signe", label: "R1 Fait - Signé", color: "bg-green-50 dark:bg-green-950" },
    { id: "r1_fait_r2_requis", label: "R1 Fait - R2 Requis", color: "bg-orange-50 dark:bg-orange-950" },
    { id: "r2_planifie", label: "R2 Planifié", color: "bg-purple-50 dark:bg-purple-950" },
    { id: "signe", label: "Signé", color: "bg-green-50 dark:bg-green-950" },
    { id: "perdu", label: "Perdu", color: "bg-red-50 dark:bg-red-950" },
  ];

  const formatEuro = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPrestationIcon = (type: string | null) => {
    const iconMap: Record<string, JSX.Element> = {
      'Télésurveillance avec IA embarquée': <ShieldCheck className="h-5 w-5 text-blue-600" />,
      'Vidéosurveillance intelligente': <Video className="h-5 w-5 text-purple-600" />,
      'Contrôle d\'accès connecté': <Lock className="h-5 w-5 text-orange-600" />,
      'Défibrillateurs connectés': <Heart className="h-5 w-5 text-red-600" />
    };
    return type && iconMap[type] ? iconMap[type] : <Package className="h-5 w-5 text-gray-600" />;
  };

  // Filtrer les opportunités par canal
  const visioOpportunities = opportunities.filter(opp => 
    opp.canalActuel === 'visio' || 
    [
      'r1_visio_planifie', 'r1_visio_fait', 
      'r2_visio_planifie', 'r2_visio_fait',
      'r3_visio_planifie', 'r3_visio_fait',
      'r4_visio_planifie', 'r4_visio_fait'
    ].includes(opp.statut)
  );

  const terrainOpportunities = opportunities.filter(opp => 
    opp.canalActuel === 'terrain' || 
    [
      'r1_planifie', 'r1_fait_signe', 
      'r1_fait_r2_requis', 'r2_planifie'
    ].includes(opp.statut)
  );

  // KPIs globaux
  const totalMRR = opportunities
    .filter(opp => opp.statut === 'signe')
    .reduce((sum, opp) => sum + (Number(opp.nombreContrats) || 0) * (Number(opp.abonnementMensuelHt) || 0), 0);
  
  const totalSigned = opportunities.filter(opp => opp.statut === 'signe').length;
  const totalActive = opportunities.filter(opp => !['signe', 'perdu'].includes(opp.statut)).length;

  const renderKanbanPipeline = (columns: any[], filteredOpportunities: Opportunity[]) => {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {columns.map((column) => {
          const columnOpps = filteredOpportunities.filter(opp => opp.statut === column.id);
          const columnMRR = columnOpps.reduce((sum, opp) => {
            const mrr = (Number(opp.nombreContrats) || 0) * (Number(opp.abonnementMensuelHt) || 0);
            return sum + mrr;
          }, 0);

          return (
            <div key={column.id} className="space-y-4">
              <div className={`rounded-lg p-3 ${column.color}`}>
                <h3 className="font-semibold text-sm">{column.label}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {columnOpps.length} • MRR {formatEuro(columnMRR)}
                </p>
              </div>

              <div className="space-y-3">
                {columnOpps.map((opp) => {
                  const prospect = prospects.find(p => p.id === opp.prospectId);
                  const mrr = (Number(opp.nombreContrats) || 0) * (Number(opp.abonnementMensuelHt) || 0);
                  const arr = mrr * 12;
                  
                  return (
                    <Card
                      key={opp.id}
                      className="hover-elevate cursor-pointer"
                      data-testid={`card-opportunity-${opp.id}`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-sm">{opp.titre}</CardTitle>
                          <span className="text-lg">{getPrestationIcon(opp.typePrestation)}</span>
                        </div>
                        {prospect && (
                          <p className="text-xs text-muted-foreground">
                            {prospect.entreprise}
                          </p>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Contrats:</span>
                            <span className="font-medium">{opp.nombreContrats}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Abo/mois HT:</span>
                            <span className="font-medium">{formatEuro(Number(opp.abonnementMensuelHt))}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Durée:</span>
                            <span className="font-medium">{opp.dureeEngagementMois} mois</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t space-y-1">
                          <div className="flex items-center gap-2 text-sm font-semibold text-blue-600">
                            <Euro className="h-3 w-3" />
                            MRR {formatEuro(mrr)}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <TrendingUp className="h-3 w-3" />
                            ARR {formatEuro(arr)}
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Dialog
                            open={editingOpportunity?.id === opp.id}
                            onOpenChange={(open) => {
                              if (!open) setEditingOpportunity(null);
                              else setEditingOpportunity(opp);
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                data-testid={`button-edit-opportunity-${opp.id}`}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Modifier l'Opportunité</DialogTitle>
                              </DialogHeader>
                              <OpportunityForm
                                onSubmit={handleSubmit}
                                initialData={opp}
                                prospects={prospects}
                                prestations={prestations}
                                isLoading={updateMutation.isPending}
                              />
                            </DialogContent>
                          </Dialog>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (confirm("Supprimer cette opportunité ?")) {
                                deleteMutation.mutate(opp.id);
                              }
                            }}
                            data-testid={`button-delete-opportunity-${opp.id}`}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Pipeline Dual</h1>
            <p className="text-xs text-muted-foreground italic">
              SDR Visio • BD Terrain
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" data-testid="button-create-opportunity">
                  <Plus className="mr-2 h-4 w-4" />
                  Nouvelle Opportunité
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Nouvelle Opportunité</DialogTitle>
                </DialogHeader>
                <OpportunityForm
                  onSubmit={handleSubmit}
                  prospects={prospects}
                  prestations={prestations}
                  isLoading={createMutation.isPending}
                />
              </DialogContent>
            </Dialog>

            <NavigationBar showHomeButton={true} />
          </div>
        </div>
      </header>

      <main className="container py-6 space-y-6">
        {/* KPIs Globaux */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-2 border-green-200 dark:border-green-800" data-testid="card-contrats-signes">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Contrats signés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalSigned}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Total actuel
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-200 dark:border-blue-800" data-testid="card-mrr">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                MRR généré
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatEuro(totalMRR)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Récurrent mensuel
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-200 dark:border-orange-800" data-testid="card-pipeline">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pipeline actif
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {totalActive}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                En cours
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Dual Pipeline avec Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "visio" | "terrain")} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="visio" data-testid="tab-visio">
              <Video className="h-4 w-4 mr-2" />
              SDR Visio ({visioOpportunities.length})
            </TabsTrigger>
            <TabsTrigger value="terrain" data-testid="tab-terrain">
              <MapPin className="h-4 w-4 mr-2" />
              BD Terrain ({terrainOpportunities.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="visio" className="mt-6">
            {renderKanbanPipeline(visioColumns, visioOpportunities)}
          </TabsContent>

          <TabsContent value="terrain" className="mt-6">
            {renderKanbanPipeline(terrainColumns, terrainOpportunities)}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function OpportunityForm({
  onSubmit,
  initialData,
  prospects,
  prestations,
  isLoading,
}: {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  initialData?: Opportunity;
  prospects: Prospect[];
  prestations: TypePrestation[];
  isLoading: boolean;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="titre">Titre *</Label>
        <Input
          id="titre"
          name="titre"
          required
          defaultValue={initialData?.titre}
          data-testid="input-titre"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="prospectId">Prospect</Label>
        <Select name="prospectId" defaultValue={initialData?.prospectId || "none"}>
          <SelectTrigger id="prospectId" data-testid="select-prospect">
            <SelectValue placeholder="Sélectionner un prospect" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Aucun prospect</SelectItem>
            {prospects.map((prospect) => (
              <SelectItem key={prospect.id} value={prospect.id}>
                {prospect.entreprise} - {prospect.prenom} {prospect.nom}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="typePrestation">Prestation ADS GROUP</Label>
        <Select name="typePrestation" defaultValue={initialData?.typePrestation || ""}>
          <SelectTrigger id="typePrestation" data-testid="select-prestation">
            <SelectValue placeholder="Sélectionner une prestation" />
          </SelectTrigger>
          <SelectContent>
            {prestations.map((prestation) => (
              <SelectItem key={prestation.id} value={prestation.nom}>
                {prestation.icone} {prestation.nom}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="nombreContrats">Nombre de contrats</Label>
          <Input
            id="nombreContrats"
            name="nombreContrats"
            type="number"
            min="1"
            defaultValue={initialData?.nombreContrats || 1}
            data-testid="input-nombre-contrats"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="abonnementMensuelHt">Abonnement mensuel HT (€) *</Label>
          <Input
            id="abonnementMensuelHt"
            name="abonnementMensuelHt"
            type="number"
            step="0.01"
            required
            defaultValue={initialData?.abonnementMensuelHt || ""}
            data-testid="input-abonnement-mensuel"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dureeEngagementMois">Durée engagement (mois)</Label>
          <Input
            id="dureeEngagementMois"
            name="dureeEngagementMois"
            type="number"
            min="12"
            max="60"
            defaultValue={initialData?.dureeEngagementMois || 36}
            data-testid="input-duree-engagement"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="statut">Statut *</Label>
        <Select name="statut" defaultValue={initialData?.statut || "r1_planifie"}>
          <SelectTrigger id="statut" data-testid="select-statut">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <optgroup label="SDR Visio">
              <SelectItem value="r1_visio_planifie">R1 Visio Planifié</SelectItem>
              <SelectItem value="r1_visio_fait">R1 Visio Fait</SelectItem>
              <SelectItem value="r2_visio_planifie">R2 Visio Planifié</SelectItem>
              <SelectItem value="r2_visio_fait">R2 Visio Fait</SelectItem>
              <SelectItem value="r3_visio_planifie">R3 Visio Planifié</SelectItem>
              <SelectItem value="r3_visio_fait">R3 Visio Fait</SelectItem>
              <SelectItem value="r4_visio_planifie">R4 Visio Planifié</SelectItem>
              <SelectItem value="r4_visio_fait">R4 Visio Fait</SelectItem>
            </optgroup>
            <optgroup label="BD Terrain">
              <SelectItem value="r1_planifie">R1 Planifié</SelectItem>
              <SelectItem value="r1_fait_signe">R1 Fait - Signé</SelectItem>
              <SelectItem value="r1_fait_r2_requis">R1 Fait - R2 Requis</SelectItem>
              <SelectItem value="r2_planifie">R2 Planifié</SelectItem>
            </optgroup>
            <optgroup label="Transferts">
              <SelectItem value="appui_bd_demande">Appui BD Demandé</SelectItem>
              <SelectItem value="transfert_accepte">Transfert Accepté</SelectItem>
              <SelectItem value="transfert_refuse">Transfert Refusé</SelectItem>
            </optgroup>
            <optgroup label="Final">
              <SelectItem value="signe">Signé</SelectItem>
              <SelectItem value="perdu">Perdu</SelectItem>
            </optgroup>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={initialData?.description || ""}
          data-testid="textarea-description"
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button
          type="submit"
          disabled={isLoading}
          data-testid="button-submit-opportunity"
        >
          {isLoading ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}
