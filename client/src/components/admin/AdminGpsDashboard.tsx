import { useState } from 'react';
import { MapPin, Users, Target, TrendingUp, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

interface DashboardData {
  period: {
    start: Date;
    end: Date;
  };
  positions: {
    count: number;
    distinctUsers: number;
    avgAccuracy: number;
  };
  opportunities: {
    total: number;
    pending: number;
    accepted: number;
    avgPriority: number;
  };
  daily: {
    totalDistance: number;
    totalVisits: number;
    avgWorkingHours: number;
  };
}

const AdminGpsDashboard = () => {
  const [selectedEntity, setSelectedEntity] = useState<string>('');

  // Fetch dashboard data
  const { data: dashboard, isLoading } = useQuery<DashboardData>({
    queryKey: ['/api/admin/gps/dashboard', selectedEntity],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedEntity) params.append('entity', selectedEntity);
      
      const res = await fetch(`/api/admin/gps/dashboard?${params}`);
      const json = await res.json();
      return json.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!dashboard) {
    return <div className="p-8 text-center">Pas de données disponibles</div>;
  }

  return (
    <div className="space-y-6" data-testid="admin-gps-dashboard">
      {/* Entity filter */}
      <div className="flex items-center gap-4">
        <Label>Filtrer par entité :</Label>
        <div className="flex gap-2">
          <Badge
            variant={selectedEntity === '' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setSelectedEntity('')}
            data-testid="badge-entity-all"
          >
            Toutes
          </Badge>
          {['france', 'luxembourg', 'belgique'].map(entity => (
            <Badge
              key={entity}
              variant={selectedEntity === entity ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSelectedEntity(entity)}
              data-testid={`badge-entity-${entity}`}
            >
              {entity.charAt(0).toUpperCase() + entity.slice(1)}
            </Badge>
          ))}
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Positions */}
        <Card data-testid="card-positions">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Positions GPS
            </CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.positions.count.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Précision moyenne: {dashboard.positions.avgAccuracy?.toFixed(1)}m
            </p>
          </CardContent>
        </Card>

        {/* Active Users */}
        <Card data-testid="card-users">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Commerciaux Actifs
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.positions.distinctUsers}</div>
            <p className="text-xs text-muted-foreground">
              Avec tracking GPS activé
            </p>
          </CardContent>
        </Card>

        {/* Total Opportunities */}
        <Card data-testid="card-opportunities">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Opportunités Détectées
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.opportunities.total}</div>
            <p className="text-xs text-muted-foreground">
              {dashboard.opportunities.pending} en attente, {dashboard.opportunities.accepted} converties
            </p>
          </CardContent>
        </Card>

        {/* Total Distance */}
        <Card data-testid="card-distance">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Distance Totale
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboard.daily.totalDistance?.toFixed(0)} km
            </div>
            <p className="text-xs text-muted-foreground">
              Sur les 30 derniers jours
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Activity Stats */}
        <Card data-testid="card-activity">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Activité Terrain
            </CardTitle>
            <CardDescription>Statistiques journalières moyennes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Visites</span>
              <span className="font-medium">{dashboard.daily.totalVisits || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Heures travaillées (moy.)</span>
              <span className="font-medium">{dashboard.daily.avgWorkingHours?.toFixed(1) || 0}h</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Distance moyenne</span>
              <span className="font-medium">
                {dashboard.daily.totalDistance ? (dashboard.daily.totalDistance / dashboard.positions.distinctUsers).toFixed(1) : 0} km/personne
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Opportunities Stats */}
        <Card data-testid="card-opp-stats">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Performance Opportunités
            </CardTitle>
            <CardDescription>Taux de conversion et qualité</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Taux conversion</span>
              <span className="font-medium">
                {dashboard.opportunities.total > 0 
                  ? ((dashboard.opportunities.accepted / dashboard.opportunities.total) * 100).toFixed(1)
                  : 0}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Score priorité moyen</span>
              <span className="font-medium">{dashboard.opportunities.avgPriority?.toFixed(0) || 0}/100</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">En attente</span>
              <Badge variant={dashboard.opportunities.pending > 0 ? 'default' : 'secondary'}>
                {dashboard.opportunities.pending}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminGpsDashboard;
