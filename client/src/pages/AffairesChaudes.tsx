import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Search, 
  ArrowLeft,
  AlertTriangle,
  Clock,
  Phone,
  Calendar,
  Euro,
  TrendingUp,
  Building2,
  User,
  Zap,
  Flame,
  ShieldCheck,
  Video,
  Lock,
  Heart,
  Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { NavigationBar } from "@/components/NavigationBar";
import type { Prospect } from "@shared/schema";
import { differenceInDays, format } from "date-fns";
import { fr } from "date-fns/locale";

interface AffaireChaude {
  id: string;
  titre: string;
  prospectId: string | null;
  nombreContrats: number;
  abonnementMensuelHt: string;
  dureeEngagementMois: number;
  dateR1: Date | null;
  joursDepuisR1: number;
  urgence: "critique" | "elevee" | "normale";
  statutTransfert: string | null;
  typePrestation: string | null;
  description: string | null;
}

export default function AffairesChaudes() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterUrgence, setFilterUrgence] = useState<"all" | "critique" | "elevee" | "normale">("all");
  const { toast } = useToast();

  const { data: affaires = [], isLoading } = useQuery<AffaireChaude[]>({
    queryKey: ["/api/crm/affaires-chaudes"],
  });

  const { data: prospects = [] } = useQuery<Prospect[]>({
    queryKey: ["/api/crm/prospects"],
  });

  const relancerMutation = useMutation({
    mutationFn: async (opportunityId: string) => {
      return await apiRequest("POST", `/api/crm/affaires-chaudes/${opportunityId}/relancer`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/affaires-chaudes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/opportunities"] });
      toast({
        title: "Relance programmée",
        description: "R2 positionné avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de relancer l'affaire",
        variant: "destructive",
      });
    },
  });

  // Filtrer affaires
  const filteredAffaires = affaires.filter((affaire) => {
    const prospect = prospects.find(p => p.id === affaire.prospectId);
    const matchesSearch = !searchQuery || 
      affaire.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prospect?.entreprise?.toLowerCase() ?? '').includes(searchQuery.toLowerCase());
    
    const matchesUrgence = filterUrgence === "all" || affaire.urgence === filterUrgence;
    
    return matchesSearch && matchesUrgence;
  });

  // Statistiques
  const stats = {
    total: affaires.length,
    critique: affaires.filter(a => a.urgence === "critique").length,
    elevee: affaires.filter(a => a.urgence === "elevee").length,
    mrrPotentiel: affaires.reduce((sum, a) => 
      sum + (Number(a.nombreContrats) || 0) * (Number(a.abonnementMensuelHt) || 0), 0
    ),
  };

  const formatEuro = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getUrgenceBadge = (urgence: string, joursDepuisR1: number) => {
    if (urgence === "critique") {
      return <Badge variant="destructive" data-testid={`badge-urgence-critique`}>
        <AlertTriangle className="h-3 w-3 mr-1" />
        Critique ({joursDepuisR1}j)
      </Badge>;
    } else if (urgence === "elevee") {
      return <Badge className="bg-orange-500 hover:bg-orange-600" data-testid={`badge-urgence-elevee`}>
        <Clock className="h-3 w-3 mr-1" />
        Élevée ({joursDepuisR1}j)
      </Badge>;
    } else {
      return <Badge variant="secondary" data-testid={`badge-urgence-normale`}>
        <Clock className="h-3 w-3 mr-1" />
        Normale ({joursDepuisR1}j)
      </Badge>;
    }
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

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <Link href="/crm">
          <Button
            variant="ghost"
            className="mb-4"
            data-testid="button-back-crm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au CRM
          </Button>
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Flame className="h-8 w-8 text-orange-600" />
              <h1 className="text-3xl font-bold tracking-tight">Affaires Chaudes</h1>
            </div>
            <p className="text-muted-foreground mt-1">
              Deals nécessitant un R2 après R1 non signé
            </p>
          </div>
          <NavigationBar showHomeButton={true} />
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="border-2 border-orange-200 dark:border-orange-800" data-testid="card-total-affaires">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Affaires Chaudes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.total}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              À relancer
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-200 dark:border-red-800" data-testid="card-critiques">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Urgence Critique
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.critique}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              &gt; 7 jours
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-200 dark:border-orange-800" data-testid="card-elevees">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Urgence Élevée
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.elevee}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              4-7 jours
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200 dark:border-blue-800" data-testid="card-mrr-potentiel">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              MRR Potentiel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatEuro(stats.mrrPotentiel)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Si signés
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une affaire ou entreprise..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>
        <Select value={filterUrgence} onValueChange={(v) => setFilterUrgence(v as any)}>
          <SelectTrigger className="w-full sm:w-48" data-testid="select-urgence">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes urgences</SelectItem>
            <SelectItem value="critique">Critique uniquement</SelectItem>
            <SelectItem value="elevee">Élevée uniquement</SelectItem>
            <SelectItem value="normale">Normale uniquement</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Liste des affaires */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      ) : filteredAffaires.length === 0 ? (
        <Card data-testid="card-empty-state">
          <CardContent className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune affaire chaude</h3>
            <p className="text-muted-foreground">
              {searchQuery || filterUrgence !== "all" 
                ? "Aucune affaire ne correspond à vos filtres"
                : "Toutes les affaires sont à jour !"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAffaires.map((affaire) => {
            const prospect = prospects.find(p => p.id === affaire.prospectId);
            const mrr = (Number(affaire.nombreContrats) || 0) * (Number(affaire.abonnementMensuelHt) || 0);
            const arr = mrr * 12;

            return (
              <Card
                key={affaire.id}
                className="hover-elevate"
                data-testid={`card-affaire-${affaire.id}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <CardTitle className="text-base">{affaire.titre}</CardTitle>
                    <span className="text-lg">{getPrestationIcon(affaire.typePrestation)}</span>
                  </div>
                  {prospect && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building2 className="h-3 w-3" />
                      {prospect.entreprise}
                    </div>
                  )}
                  {prospect && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      {prospect.prenom} {prospect.nom}
                    </div>
                  )}
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Urgence */}
                  <div>
                    {getUrgenceBadge(affaire.urgence, affaire.joursDepuisR1)}
                  </div>

                  {/* Date R1 */}
                  {affaire.dateR1 && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      R1: {format(new Date(affaire.dateR1), "dd MMM yyyy", { locale: fr })}
                    </div>
                  )}

                  {/* Métriques */}
                  <div className="space-y-1 pt-2 border-t">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Contrats:</span>
                      <span className="font-medium">{affaire.nombreContrats}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Abo/mois HT:</span>
                      <span className="font-medium">{formatEuro(Number(affaire.abonnementMensuelHt))}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Durée:</span>
                      <span className="font-medium">{affaire.dureeEngagementMois} mois</span>
                    </div>
                  </div>

                  {/* MRR/ARR */}
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

                  {/* Action de relance */}
                  <Button
                    onClick={() => relancerMutation.mutate(affaire.id)}
                    disabled={relancerMutation.isPending}
                    className="w-full"
                    variant={affaire.urgence === "critique" ? "destructive" : "default"}
                    data-testid={`button-relancer-${affaire.id}`}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    {relancerMutation.isPending ? "Relance..." : "Positionner R2"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
