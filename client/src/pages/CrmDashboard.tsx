import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Users, 
  Target, 
  CheckSquare, 
  Calendar,
  TrendingUp,
  Clock,
  Euro,
  Zap,
  Flame,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { CacheStatsCard } from "@/components/CacheStatsCard";
import { NavigationBar } from "@/components/NavigationBar";
import type { Prospect, Action, Rdv } from "@shared/schema";

export default function CrmDashboard() {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  // Fetch all CRM data for dashboard stats
  const { data: prospects = [] } = useQuery<Prospect[]>({
    queryKey: ["/api/crm/prospects"],
  });

  // Module Opportunités - nouvelle architecture
  const { data: opportunitiesModule = [] } = useQuery<any[]>({
    queryKey: ["/api/opportunities"],
  });

  const { data: actions = [] } = useQuery<Action[]>({
    queryKey: ["/api/crm/actions"],
  });

  const { data: rdvs = [] } = useQuery<Rdv[]>({
    queryKey: ["/api/crm/rdvs"],
  });

  const { data: prospectsAQualifier = [] } = useQuery<Prospect[]>({
    queryKey: ["/api/crm/prospects/a-qualifier"],
  });

  // Calculate stats
  const activeProspects = prospects.filter(p => p.statut === 'actif').length;
  const prospectsToQualify = prospectsAQualifier.length;
  
  // Opportunités - Module moderne
  const totalOpportunities = opportunitiesModule?.length || 0;
  const hotOpportunities = opportunitiesModule?.filter((o: any) => o.temperature === 'HOT')?.length || 0;
  
  const pendingActions = actions.filter(a => a.statut === 'a_faire').length;
  const upcomingRdvs = rdvs.filter(r => {
    const rdvDate = new Date(r.dateRdv);
    const now = new Date();
    return rdvDate >= now;
  }).length;

  const stats = [
    {
      title: "Prospects Actifs",
      value: activeProspects,
      total: prospects.length,
      icon: Users,
      link: "/crm/prospects",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "À Qualifier",
      value: prospectsToQualify,
      total: null,
      icon: AlertCircle,
      link: "/crm/prospects-a-qualifier",
      color: prospectsToQualify > 0 ? "text-orange-600" : "text-gray-600",
      bgColor: prospectsToQualify > 0 ? "bg-orange-50 dark:bg-orange-950" : "bg-gray-50 dark:bg-gray-950",
      badge: prospectsToQualify > 0,
      urgent: prospectsToQualify > 10,
    },
    {
      title: "Opportunités",
      value: totalOpportunities,
      total: hotOpportunities > 0 ? `${hotOpportunities} HOT` : null,
      icon: Target,
      link: "/crm/opportunities-module",
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
    {
      title: "Actions en Cours",
      value: pendingActions,
      total: actions.length,
      icon: CheckSquare,
      link: "/crm/actions",
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950",
    },
    {
      title: "RDVs à Venir",
      value: upcomingRdvs,
      total: rdvs.length,
      icon: Calendar,
      link: "/crm/rdvs",
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <h1 className="text-lg font-semibold">CRM Hector</h1>
          <NavigationBar showHomeButton={true} />
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Tableau de Bord CRM
          </h2>
          <p className="text-muted-foreground">
            Vue d'ensemble de ton activité commerciale
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat) => (
            <Link key={stat.title} href={stat.link}>
              <Card 
                className="hover-elevate active-elevate-2 cursor-pointer transition-all"
                data-testid={`card-stat-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-md ${stat.bgColor}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total: {stat.total}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Performance Système - Cache IA */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Performance Système</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <CacheStatsCard />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Accès Rapide</h3>
          
          {/* Workflow Complet - Bouton principal */}
          <div className="mb-4">
            <Link href="/crm/workflow">
              <Button
                className="w-full h-14 text-base font-semibold"
                data-testid="button-workflow-creation"
              >
                <Zap className="mr-2 h-5 w-5" />
                Créer un Workflow Complet (Prospect + Opp + RDV + Action)
              </Button>
            </Link>
          </div>

          {/* Affaires Chaudes - Bouton d'alerte */}
          <div className="mb-4">
            <Link href="/crm/affaires-chaudes">
              <Button
                variant="destructive"
                className="w-full h-12 text-base font-semibold"
                data-testid="button-affaires-chaudes"
              >
                <Flame className="mr-2 h-5 w-5" />
                Affaires Chaudes - À Relancer
              </Button>
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/crm/prospects">
              <Button
                className="w-full justify-start"
                variant="outline"
                data-testid="button-quick-prospects"
              >
                <Users className="mr-2 h-4 w-4" />
                Gérer les Prospects
              </Button>
            </Link>
            <Link href="/crm/opportunities">
              <Button
                className="w-full justify-start"
                variant="outline"
                data-testid="button-quick-opportunities"
              >
                <Target className="mr-2 h-4 w-4" />
                Pipeline Commercial
              </Button>
            </Link>
            <Link href="/crm/actions">
              <Button
                className="w-full justify-start"
                variant="outline"
                data-testid="button-quick-actions"
              >
                <CheckSquare className="mr-2 h-4 w-4" />
                Mes Actions
              </Button>
            </Link>
            <Link href="/crm/stats">
              <Button
                className="w-full justify-start"
                variant="outline"
                data-testid="button-quick-stats"
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Mes Statistiques
              </Button>
            </Link>
            <Link href="/crm/rdvs">
              <Button
                className="w-full justify-start"
                variant="outline"
                data-testid="button-quick-rdvs"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Mes Rendez-vous
              </Button>
            </Link>
          </div>
        </div>

        {/* Recent Activity Summary */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card data-testid="card-recent-prospects">
            <CardHeader>
              <CardTitle className="text-base">Prospects Récents</CardTitle>
            </CardHeader>
            <CardContent>
              {prospects.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Aucun prospect pour le moment
                </p>
              ) : (
                <div className="space-y-2">
                  {prospects.slice(0, 5).map((prospect) => (
                    <div
                      key={prospect.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="font-medium">{prospect.entreprise}</span>
                      <span className="text-muted-foreground text-xs">
                        {prospect.statut}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card data-testid="card-upcoming-rdvs">
            <CardHeader>
              <CardTitle className="text-base">Prochains RDVs</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingRdvs === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Aucun rendez-vous prévu
                </p>
              ) : (
                <div className="space-y-2">
                  {rdvs
                    .filter(r => new Date(r.dateRdv) >= new Date())
                    .sort((a, b) => new Date(a.dateRdv).getTime() - new Date(b.dateRdv).getTime())
                    .slice(0, 5)
                    .map((rdv) => (
                      <div
                        key={rdv.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="font-medium">{rdv.titre}</span>
                        <span className="text-muted-foreground text-xs">
                          {new Date(rdv.dateRdv).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
