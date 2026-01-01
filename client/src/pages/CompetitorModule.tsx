import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Trophy, Target, AlertTriangle, Calendar, TrendingUp, Users, Filter, Plus, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NavigationBar } from "@/components/NavigationBar";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SituationConcurrentForm } from "@/components/competitor/SituationConcurrentForm";
import { SituationDetailDialog } from "@/components/competitor/SituationDetailDialog";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface CompetitorDashboard {
  success: boolean;
  byStatus: Array<{
    status: string;
    count: number;
    totalValue: number;
  }>;
  prioritySituations: Array<{
    id: string;
    prospectName: string;
    concurrentName: string;
    contractEndDate: string;
    wakeupDate: string;
    estimatedTotalContract: string | null;
    status: string;
    attemptNumber: number;
    daysUntilEnd: number;
  }>;
  recentAlerts: Array<{
    id: string;
    situationId: string;
    alertType: string;
    alertDate: string;
    daysBeforeEnd: number;
    message: string | null;
    read: boolean;
  }>;
  stats: {
    total: number;
    active: number;
    won: number;
    lost: number;
    conversionRate: number;
  };
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'won': return 'text-green-600 bg-green-50 dark:bg-green-950';
    case 'active': return 'text-blue-600 bg-blue-50 dark:bg-blue-950';
    case 'lost': return 'text-red-600 bg-red-50 dark:bg-red-950';
    case 'archived': return 'text-gray-600 bg-gray-50 dark:bg-gray-950';
    case 'future': return 'text-purple-600 bg-purple-50 dark:bg-purple-950';
    case 'a_qualifier': return 'text-orange-600 bg-orange-50 dark:bg-orange-950';
    default: return 'text-gray-600 bg-gray-50 dark:bg-gray-950';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'won': return 'Gagné';
    case 'active': return 'Actif';
    case 'lost': return 'Perdu';
    case 'archived': return 'Archivé';
    case 'future': return 'Futur';
    case 'a_qualifier': return 'À qualifier';
    default: return status;
  }
};

export default function CompetitorModule() {
  const [activeView, setActiveView] = useState<"dashboard" | "list" | "alerts">("dashboard");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [selectedSituationId, setSelectedSituationId] = useState<string | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery<CompetitorDashboard>({
    queryKey: ['/api/competitor/dashboards/bd'],
  });

  const { data: situationsResponse, isLoading: isSituationsLoading } = useQuery({
    queryKey: ['/api/competitor/situations'],
    enabled: activeView === 'list',
  });

  // Map API response (nested structure) to flat structure for UI
  type SituationItem = {
    id: string;
    prospectId: string;
    prospectName: string;
    siren: string | null;
    contactFirstName: string | null;
    contactLastName: string | null;
    raisonSociale: string | null;
    enseigne: string | null;
    monthlyAmount: number | null;
    concurrentId: string;
    concurrentName: string;
    contractEndDate: string;
    wakeupDate: string;
    status: string;
    attemptNumber: number;
    daysUntilEnd: number;
  };

  const allSituations: SituationItem[] = ((situationsResponse as any)?.situations || []).map((item: any) => ({
    id: item.situation?.id || '',
    prospectId: item.situation?.prospectId || '',
    prospectName: item.prospect?.entreprise || 'N/A',
    siren: item.situation?.siren || null,
    contactFirstName: item.situation?.contactFirstName || null,
    contactLastName: item.situation?.contactLastName || null,
    raisonSociale: item.situation?.raisonSociale || null,
    enseigne: item.situation?.enseigne || null,
    monthlyAmount: item.situation?.monthlyAmount || null,
    concurrentId: item.situation?.concurrentId || '',
    concurrentName: item.concurrent?.name || 'N/A',
    contractEndDate: item.situation?.contractEndDate || '',
    wakeupDate: item.situation?.wakeupDate || '',
    status: item.situation?.status || 'active',
    attemptNumber: item.situation?.attemptNumber || 0,
    daysUntilEnd: item.situation?.daysBeforeEnd || 0,
  }));

  // Filtrer situations
  const filteredSituations = allSituations.filter((sit: SituationItem) => {
    if (statusFilter !== 'all' && sit.status !== statusFilter) return false;
    if (searchQuery && !sit.prospectName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !sit.concurrentName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Compter le nombre de contrats par prospect
  const contractCountByProspect = allSituations.reduce((acc, sit) => {
    acc[sit.prospectId] = (acc[sit.prospectId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />
      
      <div className="container mx-auto p-4 space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Trophy className="w-8 h-8 text-primary" />
              Module Échéances Concurrent
            </h1>
            <p className="text-muted-foreground mt-1">
              Reconquête contrats concurrents • ROI cible : +1M€/an
            </p>
          </div>
          
          <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
            <DialogTrigger asChild>
              <Button size="default" data-testid="button-add-situation">
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle Échéance
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Capturer Échéance Concurrent</DialogTitle>
                <DialogDescription>
                  Saisie rapide en 30-60 secondes • Système anti-doublon automatique
                </DialogDescription>
              </DialogHeader>
              <SituationConcurrentForm onSuccess={() => setFormDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)}>
          <TabsList>
            <TabsTrigger value="dashboard" data-testid="tab-dashboard">
              <Target className="w-4 h-4 mr-2" />
              Dashboard BD
            </TabsTrigger>
            <TabsTrigger value="list" data-testid="tab-list">
              <Calendar className="w-4 h-4 mr-2" />
              Situations
            </TabsTrigger>
            <TabsTrigger value="alerts" data-testid="tab-alerts">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Alertes
            </TabsTrigger>
          </TabsList>

          {/* Dashboard BD */}
          <TabsContent value="dashboard" className="space-y-4">
            {isDashboardLoading ? (
              <div className="text-center py-8 text-muted-foreground">Chargement...</div>
            ) : dashboardData ? (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Situations</CardTitle>
                      <Target className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{dashboardData.stats.total}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Actives: {dashboardData.stats.active}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Taux Conversion</CardTitle>
                      <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{dashboardData.stats.conversionRate.toFixed(1)}%</div>
                      <Progress value={dashboardData.stats.conversionRate} className="mt-2" />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Contrats Gagnés</CardTitle>
                      <Trophy className="w-4 h-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">{dashboardData.stats.won}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {dashboardData.stats.total > 0 ? ((dashboardData.stats.won / dashboardData.stats.total) * 100).toFixed(1) : 0}% du total
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Contrats Perdus</CardTitle>
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">{dashboardData.stats.lost}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {dashboardData.stats.total > 0 ? ((dashboardData.stats.lost / dashboardData.stats.total) * 100).toFixed(1) : 0}% du total
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Distribution par Statut</CardTitle>
                      <CardDescription>Vue d'ensemble du pipeline reconquête</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {dashboardData.byStatus.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={dashboardData.byStatus.map(s => ({
                            name: getStatusLabel(s.status),
                            count: s.count,
                            value: s.totalValue
                          }))}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                            <YAxis />
                            <Tooltip 
                              formatter={(value, name) => [
                                name === 'count' ? value : `${Number(value).toLocaleString('fr-FR')} €`,
                                name === 'count' ? 'Nombre' : 'Valeur'
                              ]}
                            />
                            <Legend />
                            <Bar dataKey="count" fill="hsl(var(--primary))" name="Nombre" />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <p className="text-muted-foreground text-center py-8">Aucune donnée</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Indicateurs Clés</CardTitle>
                      <CardDescription>Performance reconquête</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Taux de Conversion</span>
                          <span className="text-sm font-bold">{dashboardData.stats.conversionRate}%</span>
                        </div>
                        <Progress value={dashboardData.stats.conversionRate} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Situations Actives</span>
                          <span className="text-sm font-bold">{dashboardData.stats.active}/{dashboardData.stats.total}</span>
                        </div>
                        <Progress 
                          value={dashboardData.stats.total > 0 ? (dashboardData.stats.active / dashboardData.stats.total) * 100 : 0} 
                          className="h-2" 
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Objectif ROI</span>
                          <span className="text-sm font-bold">+1M€/an</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          60 contrats cibles • {dashboardData.stats.won} reconquis
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Priority Situations */}
                <Card>
                  <CardHeader>
                    <CardTitle>Situations Prioritaires</CardTitle>
                    <CardDescription>Échéances à traiter en priorité</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {dashboardData.prioritySituations.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">Aucune situation prioritaire</p>
                      ) : (
                        dashboardData.prioritySituations.map((sit) => (
                          <div
                            key={sit.id}
                            className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg border bg-card hover-elevate cursor-pointer"
                            data-testid={`situation-${sit.id}`}
                            onClick={() => {
                              setSelectedSituationId(sit.id);
                              setDetailDialogOpen(true);
                            }}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-medium">{sit.prospectName}</p>
                                <Badge variant="outline" className="text-xs">
                                  vs {sit.concurrentName}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
                                <span>Échéance: {new Date(sit.contractEndDate).toLocaleDateString('fr-FR')}</span>
                                <span>Réveil: {new Date(sit.wakeupDate).toLocaleDateString('fr-FR')}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(sit.status)}>
                                {getStatusLabel(sit.status)}
                              </Badge>
                              {sit.daysUntilEnd <= 30 && (
                                <Badge variant="destructive" className="text-xs">
                                  J-{sit.daysUntilEnd}
                                </Badge>
                              )}
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedSituationId(sit.id);
                                  setDetailDialogOpen(true);
                                }}
                                data-testid={`button-edit-${sit.id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">Aucune donnée disponible</div>
            )}
          </TabsContent>

          {/* List Situations */}
          <TabsContent value="list" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Filtres</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <Input
                    placeholder="Rechercher prospect ou concurrent..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    data-testid="input-search"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[200px]" data-testid="select-status">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="a_qualifier">À qualifier</SelectItem>
                    <SelectItem value="future">Futur</SelectItem>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="won">Gagné</SelectItem>
                    <SelectItem value="lost">Perdu</SelectItem>
                    <SelectItem value="archived">Archivé</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Situations List */}
            {isSituationsLoading ? (
              <div className="text-center py-8 text-muted-foreground">Chargement...</div>
            ) : (
              <div className="space-y-3">
                {filteredSituations.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      Aucune situation trouvée
                    </CardContent>
                  </Card>
                ) : (
                  filteredSituations.map((sit) => (
                    <Card 
                      key={sit.id} 
                      className="hover-elevate cursor-pointer" 
                      data-testid={`situation-card-${sit.id}`}
                      onClick={() => {
                        setSelectedSituationId(sit.id);
                        setDetailDialogOpen(true);
                      }}
                    >
                      <CardContent className="pt-6">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-lg font-semibold">{sit.prospectName}</h3>
                              {contractCountByProspect[sit.prospectId] > 1 && (
                                <Badge variant="secondary" className="text-xs">
                                  {contractCountByProspect[sit.prospectId]} contrats
                                </Badge>
                              )}
                              <Badge variant="outline">vs {sit.concurrentName}</Badge>
                              <Badge className={getStatusColor(sit.status)}>
                                {getStatusLabel(sit.status)}
                              </Badge>
                            </div>
                            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">Échéance: </span>
                                <span className="font-medium">
                                  {new Date(sit.contractEndDate).toLocaleDateString('fr-FR')}
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Réveil: </span>
                                <span className="font-medium">
                                  {new Date(sit.wakeupDate).toLocaleDateString('fr-FR')}
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Contact: </span>
                                <span className="font-medium">
                                  {sit.contactFirstName && sit.contactLastName 
                                    ? `${sit.contactFirstName} ${sit.contactLastName}`
                                    : 'N/A'}
                                </span>
                              </div>
                              {sit.enseigne && (
                                <div>
                                  <span className="text-muted-foreground">Enseigne: </span>
                                  <span className="font-medium">{sit.enseigne}</span>
                                </div>
                              )}
                              {sit.monthlyAmount && (
                                <div>
                                  <span className="text-muted-foreground">Abonnement: </span>
                                  <span className="font-medium">{sit.monthlyAmount}€/mois</span>
                                </div>
                              )}
                              <div>
                                <span className="text-muted-foreground">Tentatives: </span>
                                <span className="font-medium">{sit.attemptNumber}</span>
                              </div>
                            </div>
                          </div>
                          {sit.daysUntilEnd <= 60 && sit.status === 'active' && (
                            <Badge variant="destructive">
                              J-{sit.daysUntilEnd}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Alertes Progressives</CardTitle>
                <CardDescription>
                  Jalons automatiques : J-180, J-90, J-60, J-30, J-15, J-7
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!dashboardData || dashboardData.recentAlerts.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Aucune alerte non lue
                  </p>
                ) : (
                  <div className="space-y-3">
                    {dashboardData.recentAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className="flex items-start gap-3 p-3 rounded-lg border bg-card hover-elevate"
                        data-testid={`alert-${alert.id}`}
                      >
                        <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              {alert.alertType}
                            </Badge>
                            <Badge variant="destructive" className="text-xs">
                              J-{alert.daysBeforeEnd}
                            </Badge>
                          </div>
                          <p className="text-sm mt-1">
                            {alert.message || "Échéance proche - Action requise"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(alert.alertDate).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Detail Dialog */}
      <SituationDetailDialog
        situationId={selectedSituationId}
        open={detailDialogOpen}
        onOpenChange={(open) => {
          setDetailDialogOpen(open);
          if (!open) {
            setSelectedSituationId(null);
          }
        }}
      />
    </div>
  );
}
