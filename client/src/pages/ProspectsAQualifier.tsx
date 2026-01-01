import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  ArrowLeft,
  Search,
  AlertCircle,
  CheckCircle2,
  Loader2,
  TrendingUp,
  Clock,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { NavigationBar } from "@/components/NavigationBar";
import type { Prospect } from "@shared/schema";
import { ProspectQualificationCard } from "@/components/prospects/ProspectQualificationCard";

interface QualificationStats {
  total: number;
  aujourdhui: number;
  cetteSemaine: number;
  plusDe7Jours: number;
  delaiMoyenHeures: number;
}

export default function ProspectsAQualifier() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const { data: prospects = [], isLoading } = useQuery<Prospect[]>({
    queryKey: ["/api/crm/prospects/a-qualifier"],
  });

  const { data: stats } = useQuery<QualificationStats>({
    queryKey: ["/api/crm/prospects/qualification-stats"],
  });

  const qualifyMutation = useMutation({
    mutationFn: async ({ prospectId, siret }: { prospectId: string; siret: string }) => {
      return await apiRequest("POST", `/api/crm/prospects/${prospectId}/qualify`, { siret });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/prospects/a-qualifier"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/prospects/qualification-stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/prospects"] });
      
      const source = data.enrichmentSource === 'insee' ? 'INSEE (gratuit)' : 'Pappers';
      const cost = data.enrichmentCost || 0;
      
      toast({
        title: "Prospect qualifié avec succès !",
        description: `Enrichissement via ${source} (${cost}€). Le prospect a été mis à jour.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur de qualification",
        description: error.message || "Impossible de qualifier ce prospect",
        variant: "destructive",
      });
    },
  });

  const handleQualify = async (prospectId: string, siret: string) => {
    await qualifyMutation.mutateAsync({ prospectId, siret });
  };

  const filteredProspects = prospects.filter((prospect) => {
    const query = searchQuery.toLowerCase();
    return (
      prospect.nom?.toLowerCase().includes(query) ||
      prospect.prenom?.toLowerCase().includes(query) ||
      prospect.entreprise?.toLowerCase().includes(query) ||
      prospect.telephone?.toLowerCase().includes(query) ||
      prospect.email?.toLowerCase().includes(query)
    );
  });

  const urgentProspects = filteredProspects.filter(p => {
    const daysAgo = Math.floor((Date.now() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    return daysAgo >= 7;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/crm/prospects">
                <Button variant="ghost" size="icon" data-testid="button-back">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Prospects à qualifier</h1>
                <p className="text-sm text-muted-foreground">
                  Cartes de visite terrain en attente de qualification
                </p>
              </div>
            </div>
            <NavigationBar showHomeButton={true} />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {stats && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-6">
            <Card data-testid="stats-total">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Total à qualifier
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>

            <Card data-testid="stats-today">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Aujourd'hui
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.aujourdhui}</div>
              </CardContent>
            </Card>

            <Card data-testid="stats-week">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Cette semaine
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.cetteSemaine}</div>
              </CardContent>
            </Card>

            <Card data-testid="stats-urgent">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  + de 7 jours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-500">{stats.plusDe7Jours}</div>
              </CardContent>
            </Card>

            <Card data-testid="stats-average">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Délai moyen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.delaiMoyenHeures}h</div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, entreprise, téléphone, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12" data-testid="loading-state">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredProspects.length === 0 ? (
          <Card data-testid="empty-state">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">
                {searchQuery ? "Aucun résultat" : "Aucun prospect à qualifier"}
              </p>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                {searchQuery 
                  ? "Aucun prospect ne correspond à votre recherche"
                  : "Tous les prospects terrain ont été qualifiés !"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div>
            {urgentProspects.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  <h2 className="text-lg font-semibold">
                    Urgents ({urgentProspects.length})
                  </h2>
                  <Badge variant="destructive" className="ml-2">
                    + de 7 jours
                  </Badge>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {urgentProspects.map((prospect) => (
                    <ProspectQualificationCard
                      key={prospect.id}
                      prospect={prospect}
                      onQualify={handleQualify}
                    />
                  ))}
                </div>
              </div>
            )}

            {filteredProspects.filter(p => {
              const daysAgo = Math.floor((Date.now() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24));
              return daysAgo < 7;
            }).length > 0 && (
              <div>
                {urgentProspects.length > 0 && (
                  <h2 className="text-lg font-semibold mb-4">Récents</h2>
                )}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" data-testid="prospects-list">
                  {filteredProspects
                    .filter(p => {
                      const daysAgo = Math.floor((Date.now() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24));
                      return daysAgo < 7;
                    })
                    .map((prospect) => (
                      <ProspectQualificationCard
                        key={prospect.id}
                        prospect={prospect}
                        onQualify={handleQualify}
                      />
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
