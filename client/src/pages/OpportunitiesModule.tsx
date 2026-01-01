import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Flame, Snowflake, Thermometer, TrendingUp, Users, Target, Calendar, AlertTriangle, List, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NavigationBar } from "@/components/NavigationBar";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import type { Opportunity } from "@shared/schema";

interface OpportunityDashboard {
  success: boolean;
  byTemperature: Array<{
    temperature: string;
    count: number;
    totalValue: number;
  }>;
  byStage: Array<{
    stage: string;
    count: number;
  }>;
  hotOpportunities: Opportunity[];
  toRequalify: Opportunity[];
  stats: {
    total: number;
    avgScore: number;
    avgDaysInHector: number;
    totalPipeline: number;
  };
}

const getTemperatureColor = (temp: string) => {
  switch (temp) {
    case 'HOT': return 'text-red-600 bg-red-50 dark:bg-red-950';
    case 'WARM': return 'text-orange-600 bg-orange-50 dark:bg-orange-950';
    case 'COLD': return 'text-blue-600 bg-blue-50 dark:bg-blue-950';
    default: return 'text-gray-600 bg-gray-50 dark:bg-gray-950';
  }
};

const getTemperatureIcon = (temp: string) => {
  switch (temp) {
    case 'HOT': return <Flame className="w-4 h-4" />;
    case 'WARM': return <Thermometer className="w-4 h-4" />;
    case 'COLD': return <Snowflake className="w-4 h-4" />;
    default: return <Thermometer className="w-4 h-4" />;
  }
};

interface ManagerDashboard {
  success: boolean;
  byUser: Array<{
    userId: string;
    userEmail: string;
    userFirstName: string | null;
    userLastName: string | null;
    count: number;
    hotCount: number;
    warmCount: number;
    coldCount: number;
    avgScore: number;
    totalPipeline: number;
  }>;
  temperatureDistribution: Array<{
    temperature: string;
    count: number;
  }>;
  criticalOpportunities: Opportunity[];
}

export default function OpportunitiesModule() {
  const [activeView, setActiveView] = useState<"commercial" | "list" | "manager">("commercial");
  const [temperatureFilter, setTemperatureFilter] = useState<string>("all");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery<OpportunityDashboard>({
    queryKey: ['/api/opportunities/dashboard/commercial'],
  });

  const { data: opportunitiesResponse, isLoading: isOpportunitiesLoading } = useQuery<{
    success: boolean;
    opportunities: Opportunity[];
    total: number;
    limit: number;
    offset: number;
  }>({
    queryKey: ['/api/opportunities'],
    enabled: activeView === 'list',
  });

  const { data: managerData, isLoading: isManagerLoading } = useQuery<ManagerDashboard>({
    queryKey: ['/api/opportunities/dashboard/manager'],
    enabled: activeView === 'manager',
  });
  
  const allOpportunities = opportunitiesResponse?.opportunities || [];

  // Filtrer opportunités
  const filteredOpportunities = allOpportunities.filter(opp => {
    if (temperatureFilter !== 'all' && opp.temperature !== temperatureFilter) return false;
    if (stageFilter !== 'all' && opp.stage !== stageFilter) return false;
    if (searchQuery && !opp.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const isLoading = isDashboardLoading || (activeView === 'list' && isOpportunitiesLoading) || (activeView === 'manager' && isManagerLoading);

  if (isLoading && activeView === 'commercial') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Chargement du dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Module Opportunités</h1>
            <p className="text-xs text-muted-foreground italic">
              Pre-CRM Intelligent • Scoring Automatique
            </p>
          </div>

          <NavigationBar showHomeButton={true} />
        </div>
      </header>

      <main className="container py-6 space-y-6">
        {/* Tabs Commercial / Liste / Manager */}
        <Tabs value={activeView} onValueChange={(v) => setActiveView(v as "commercial" | "list" | "manager")}>
          <TabsList className="grid w-full max-w-3xl grid-cols-3">
            <TabsTrigger value="commercial" data-testid="tab-commercial">
              <Users className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="list" data-testid="tab-list">
              <List className="h-4 w-4 mr-2" />
              Liste Complète
            </TabsTrigger>
            <TabsTrigger value="manager" data-testid="tab-manager">
              <Target className="h-4 w-4 mr-2" />
              Vue Manager
            </TabsTrigger>
          </TabsList>

          {/* Vue Commerciale */}
          <TabsContent value="commercial" className="space-y-6 mt-6">
            {/* KPIs Température */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-2 border-red-200 dark:border-red-800" data-testid="card-hot">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Opportunités HOT
                    </CardTitle>
                    <Flame className="w-5 h-5 text-red-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">
                    {dashboardData?.byTemperature?.find(t => t.temperature === 'HOT')?.count || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Score 85-100 • Priorité max
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-orange-200 dark:border-orange-800" data-testid="card-warm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Opportunités WARM
                    </CardTitle>
                    <Thermometer className="w-5 h-5 text-orange-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">
                    {dashboardData?.byTemperature?.find(t => t.temperature === 'WARM')?.count || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Score 60-84 • Priorité moyenne
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-blue-200 dark:border-blue-800" data-testid="card-cold">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Opportunités COLD
                    </CardTitle>
                    <Snowflake className="w-5 h-5 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {dashboardData?.byTemperature?.find(t => t.temperature === 'COLD')?.count || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Score 0-59 • Priorité basse
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-green-200 dark:border-green-800" data-testid="card-total">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Actives
                    </CardTitle>
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {dashboardData?.stats?.total || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Score moyen: {Math.round(dashboardData?.stats?.avgScore || 0)}/100
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Top Opportunités HOT */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-red-600" />
                    Top Opportunités HOT
                  </CardTitle>
                  <Badge variant="outline" className="bg-red-50 dark:bg-red-950 text-red-600">
                    {dashboardData?.hotOpportunities?.length || 0} opportunités
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {!dashboardData?.hotOpportunities || dashboardData.hotOpportunities.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Aucune opportunité HOT pour le moment
                  </p>
                ) : (
                  <div className="space-y-4">
                    {dashboardData.hotOpportunities.slice(0, 5).map((opp) => (
                      <Link key={opp.id} href={`/crm/opportunities-module/${opp.id}`}>
                        <Card
                          className="hover-elevate cursor-pointer"
                          data-testid={`card-hot-opportunity-${opp.id}`}
                        >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-base">{opp.title}</h3>
                                <Badge className={getTemperatureColor(opp.temperature)}>
                                  {getTemperatureIcon(opp.temperature)}
                                  <span className="ml-1">{opp.temperature}</span>
                                </Badge>
                              </div>
                              
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Target className="w-3 h-3" />
                                  Stage: {opp.stage}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {opp.daysInHector}j dans Hector
                                </span>
                              </div>

                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-medium">Score Global</span>
                                  <span className="font-bold text-red-600">{opp.score}/100</span>
                                </div>
                                <Progress value={opp.score} className="h-2" />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Alertes Requalification */}
            {(dashboardData?.toRequalify?.length || 0) > 0 && (
              <Card className="border-2 border-yellow-200 dark:border-yellow-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-500">
                    <AlertTriangle className="w-5 h-5" />
                    Opportunités à Requalifier
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    <span className="font-bold text-yellow-700 dark:text-yellow-500">
                      {dashboardData?.toRequalify?.length || 0}
                    </span>{' '}
                    opportunités nécessitent une requalification urgente.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Vue Liste Complète */}
          <TabsContent value="list" className="space-y-6 mt-6">
            {/* Barre de filtres */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filtres
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Recherche</label>
                    <Input
                      placeholder="Rechercher..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      data-testid="input-search-opportunities"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Température</label>
                    <Select value={temperatureFilter} onValueChange={setTemperatureFilter}>
                      <SelectTrigger data-testid="select-temperature-filter">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes</SelectItem>
                        <SelectItem value="HOT">HOT (85-100)</SelectItem>
                        <SelectItem value="WARM">WARM (60-84)</SelectItem>
                        <SelectItem value="COLD">COLD (0-59)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Stage</label>
                    <Select value={stageFilter} onValueChange={setStageFilter}>
                      <SelectTrigger data-testid="select-stage-filter">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        <SelectItem value="discovery">Discovery</SelectItem>
                        <SelectItem value="qualification">Qualification</SelectItem>
                        <SelectItem value="proposal">Proposal</SelectItem>
                        <SelectItem value="negotiation">Negotiation</SelectItem>
                        <SelectItem value="closing">Closing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Liste opportunités */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {filteredOpportunities.length} opportunité{filteredOpportunities.length > 1 ? 's' : ''}
              </h2>
            </div>

            {isOpportunitiesLoading ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="text-muted-foreground">Chargement des opportunités...</div>
                </CardContent>
              </Card>
            ) : filteredOpportunities.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <List className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucune opportunité</h3>
                  <p className="text-sm text-muted-foreground">
                    {allOpportunities.length === 0 
                      ? "Créez votre première opportunité pour commencer"
                      : "Aucune opportunité ne correspond aux filtres"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredOpportunities.map((opp) => (
                  <Link key={opp.id} href={`/crm/opportunities-module/${opp.id}`}>
                    <Card
                      className="hover-elevate cursor-pointer"
                      data-testid={`card-opportunity-${opp.id}`}
                    >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-base line-clamp-2">{opp.title}</h3>
                        <Badge className={getTemperatureColor(opp.temperature || 'COLD')}>
                          {getTemperatureIcon(opp.temperature || 'COLD')}
                        </Badge>
                      </div>
                      {opp.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {opp.description}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium">Score Global</span>
                          <span className={`font-bold ${
                            (opp.score || 0) >= 85 ? 'text-red-600' :
                            (opp.score || 0) >= 60 ? 'text-orange-600' :
                            'text-blue-600'
                          }`}>
                            {opp.score || 0}/100
                          </span>
                        </div>
                        <Progress value={opp.score || 0} className="h-2" />
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="space-y-1">
                          <span className="text-muted-foreground block">Stage</span>
                          <Badge variant="outline" className="text-xs">
                            {opp.stage}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <span className="text-muted-foreground block">Jours</span>
                          <span className="font-medium">{opp.daysInHector || 0}j</span>
                        </div>
                      </div>

                      {opp.requalificationRequired && (
                        <Badge variant="destructive" className="w-full justify-center">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Requalification requise
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </Link>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Vue Manager */}
          <TabsContent value="manager" className="space-y-6 mt-6">
            {isManagerLoading ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">Chargement des stats manager...</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* KPIs Globaux */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Total Opportunités
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {managerData?.byUser?.reduce((acc, user) => acc + user.count, 0) || 0}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Toutes températures confondues
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-red-200 dark:border-red-800">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Opportunités HOT
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-red-600">
                        {managerData?.temperatureDistribution?.find(t => t.temperature === 'HOT')?.count || 0}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Score 85-100 • Priorité maximale
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-yellow-200 dark:border-yellow-800">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Opportunités Critiques
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-yellow-600">
                        {managerData?.criticalOpportunities?.length || 0}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Score &lt; 40 depuis +7 jours
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Performances par Commercial */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Performances par Commercial
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {managerData?.byUser
                        ?.slice()
                        .sort((a, b) => (b.avgScore || 0) - (a.avgScore || 0))
                        .map((user) => (
                          <Card key={user.userId} className="hover-elevate" data-testid={`card-user-${user.userId}`}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 space-y-3">
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-semibold">
                                      {user.userFirstName && user.userLastName
                                        ? `${user.userFirstName} ${user.userLastName}`
                                        : user.userEmail}
                                    </h3>
                                    <Badge variant="outline" className="text-xs">
                                      {user.count} opps
                                    </Badge>
                                  </div>

                                  <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div className="space-y-1">
                                      <span className="text-muted-foreground block text-xs">HOT</span>
                                      <Badge className={getTemperatureColor('HOT')}>
                                        {user.hotCount || 0}
                                      </Badge>
                                    </div>
                                    <div className="space-y-1">
                                      <span className="text-muted-foreground block text-xs">WARM</span>
                                      <Badge className={getTemperatureColor('WARM')}>
                                        {user.warmCount || 0}
                                      </Badge>
                                    </div>
                                    <div className="space-y-1">
                                      <span className="text-muted-foreground block text-xs">COLD</span>
                                      <Badge className={getTemperatureColor('COLD')}>
                                        {user.coldCount || 0}
                                      </Badge>
                                    </div>
                                  </div>

                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="font-medium">Score Moyen</span>
                                      <span className={`font-bold ${
                                        (user.avgScore || 0) >= 85 ? 'text-red-600' :
                                        (user.avgScore || 0) >= 60 ? 'text-orange-600' :
                                        'text-blue-600'
                                      }`}>
                                        {Math.round(user.avgScore || 0)}/100
                                      </span>
                                    </div>
                                    <Progress value={user.avgScore || 0} className="h-2" />
                                  </div>

                                  {user.totalPipeline > 0 && (
                                    <div className="text-xs text-muted-foreground">
                                      Pipeline total: <span className="font-semibold">{user.totalPipeline}€</span> MRR
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Opportunités Critiques */}
                {(managerData?.criticalOpportunities?.length || 0) > 0 && (
                  <Card className="border-2 border-yellow-200 dark:border-yellow-800">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-500">
                        <AlertTriangle className="w-5 h-5" />
                        Opportunités Critiques à Traiter
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {managerData?.criticalOpportunities?.slice(0, 10).map((opp) => (
                          <Link key={opp.id} href={`/crm/opportunities-module/${opp.id}`}>
                            <Card className="hover-elevate cursor-pointer" data-testid={`card-critical-${opp.id}`}>
                              <CardContent className="p-3">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 space-y-1">
                                    <h4 className="font-semibold text-sm line-clamp-1">{opp.title}</h4>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                      <span className="flex items-center gap-1">
                                        <Target className="w-3 h-3" />
                                        Stage: {opp.stage}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {opp.daysInHector}j dans Hector
                                      </span>
                                    </div>
                                  </div>
                                  <Badge variant="destructive" className="text-xs">
                                    Score: {opp.score}/100
                                  </Badge>
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
