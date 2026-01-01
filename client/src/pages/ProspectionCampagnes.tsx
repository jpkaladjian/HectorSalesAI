import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Plus, 
  Search, 
  Users,
  Target,
  TrendingUp,
  CheckCircle2,
  BarChart3,
  Target as TargetIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { NavigationBar } from "@/components/NavigationBar";
import type { CampagneProspection } from "@shared/schema";

// Composants de prospection
import { StatsWidget } from "@/components/prospection/StatsWidget";
import { CampaignCard } from "@/components/prospection/CampaignCard";
import { EmptyState } from "@/components/prospection/EmptyState";

export default function ProspectionCampagnes() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Récupérer les campagnes
  const { data: campagnes = [], isLoading } = useQuery<CampagneProspection[]>({
    queryKey: ["/api/prospection/campagnes"],
  });

  // Mutation pour mettre à jour une campagne (pause/reprendre)
  const updateCampagneMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CampagneProspection> }) => {
      return await apiRequest('PATCH', `/api/prospection/campagnes/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prospection/campagnes"] });
      toast({
        title: "Campagne mise à jour",
        description: "Les modifications ont été enregistrées",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la campagne",
        variant: "destructive",
      });
    },
  });

  // Mutation pour supprimer une campagne
  const deleteCampagneMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/prospection/campagnes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prospection/campagnes"] });
      toast({
        title: "Campagne supprimée",
        description: "La campagne a été supprimée avec succès",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la campagne",
        variant: "destructive",
      });
    },
  });

  // Filtrer les campagnes selon la recherche
  const filteredCampagnes = campagnes.filter(campagne => {
    const query = searchQuery.toLowerCase();
    return (
      campagne.nom.toLowerCase().includes(query) ||
      campagne.objectif?.toLowerCase().includes(query)
    );
  });

  // Calculer les statistiques globales
  const stats = {
    totalCampagnes: campagnes.length,
    campagnesActives: campagnes.filter(c => c.statut === 'active').length,
    totalProspects: campagnes.reduce((sum, c) => sum + (c.stats?.contactes || 0), 0),
    tauxReponseGlobal: campagnes.length > 0 
      ? Math.round(campagnes.reduce((sum, c) => sum + (c.stats?.reponses || 0), 0) / 
          Math.max(campagnes.reduce((sum, c) => sum + (c.stats?.contactes || 0), 0), 1) * 100)
      : 0,
    totalRdv: campagnes.reduce((sum, c) => sum + (c.stats?.rdv || 0), 0),
  };

  // Handlers
  const handleCreateCampaign = () => {
    setLocation("/prospection/campagnes/nouvelle");
  };

  const handleTogglePause = (id: string) => {
    const campaign = campagnes.find(c => c.id === id);
    if (!campaign) return;

    const newStatus = campaign.statut === 'active' ? 'paused' : 'active';
    updateCampagneMutation.mutate({ 
      id, 
      data: { statut: newStatus } 
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette campagne ?')) {
      deleteCampagneMutation.mutate(id);
    }
  };

  const handleEdit = (id: string) => {
    setLocation(`/prospection/campagnes/nouvelle?edit=${id}`);
  };

  const handleViewAnalytics = (id: string) => {
    setLocation(`/prospection/analytics?campaign=${id}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des campagnes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-title">📱 Prospection LinkedIn</h1>
            <p className="text-muted-foreground">Gérez vos campagnes de prospection multi-canal</p>
          </div>
          <div className="flex items-center gap-2">
            <NavigationBar showHomeButton={true} />
            <Button 
              variant="outline"
              onClick={() => setLocation('/prospection/analytics')}
              data-testid="button-analytics"
              className="gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Analytics
            </Button>
            <Button 
              onClick={handleCreateCampaign}
              data-testid="button-create-campaign"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Nouvelle campagne
            </Button>
          </div>
        </div>

        {/* Statistiques globales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsWidget
            title="Prospects en cours"
            value={stats.totalProspects}
            subtitle={`${stats.campagnesActives} campagnes actives`}
            icon={Users}
            iconColor="text-blue-500"
            testId="stat-total-prospects"
          />
          
          <StatsWidget
            title="Taux acceptation"
            value={`${stats.tauxReponseGlobal}%`}
            subtitle="Connexions acceptées"
            icon={Target}
            iconColor="text-green-500"
            testId="stat-acceptance-rate"
          />
          
          <StatsWidget
            title="Réponses"
            value={campagnes.reduce((sum, c) => sum + (c.stats?.reponses || 0), 0)}
            subtitle="Messages reçus"
            icon={TrendingUp}
            iconColor="text-purple-500"
            testId="stat-responses"
          />
          
          <StatsWidget
            title="RDV obtenus"
            value={stats.totalRdv}
            subtitle="Objectifs atteints"
            icon={CheckCircle2}
            iconColor="text-orange-500"
            testId="stat-total-rdv"
          />
        </div>

        {/* Barre de recherche */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une campagne..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-campagnes"
            />
          </div>
        </div>

        {/* Liste des campagnes */}
        <div>
          <h2 className="text-xl font-semibold mb-4">🎯 Mes Campagnes</h2>
          <div className="space-y-4">
            {filteredCampagnes.length === 0 ? (
              searchQuery ? (
                <EmptyState
                  icon={Search}
                  title="Aucune campagne trouvée"
                  description="Essayez une autre recherche ou créez une nouvelle campagne"
                  testId="empty-search"
                />
              ) : (
                <EmptyState
                  icon={TargetIcon}
                  title="Aucune campagne pour le moment"
                  description="Créez votre première campagne de prospection LinkedIn pour automatiser vos prises de contact et maximiser vos opportunités"
                  actionLabel="+ Nouvelle campagne"
                  onAction={handleCreateCampaign}
                  testId="button-create-campaign-empty"
                />
              )
            ) : (
              filteredCampagnes.map((campagne) => (
                <CampaignCard
                  key={campagne.id}
                  campaign={campagne}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onTogglePause={handleTogglePause}
                  onViewAnalytics={handleViewAnalytics}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
