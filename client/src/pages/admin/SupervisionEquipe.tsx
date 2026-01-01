import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, Clock, RefreshCw, AlertCircle } from 'lucide-react';
import { SupervisionMap } from '@/components/gps/SupervisionMap';
import { NavigationBar } from '@/components/NavigationBar';
import { useToast } from '@/hooks/use-toast';

interface UserPosition {
  id: string;
  userId: string;
  latitude: string;
  longitude: string;
  accuracy: number;
  capturedAt: string;
  address: string | null;
  batteryLevel: number | null;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
    phone: string | null;
    entity: string | null;
  };
  timeAgo: string;
  isRecent: boolean;
}

export default function SupervisionEquipe() {
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [activeOnly, setActiveOnly] = useState(false);
  const { toast } = useToast();

  const { data: positions = [], isLoading, error, refetch, isFetching } = useQuery<UserPosition[]>({
    queryKey: ['/api/supervision/gps/all-positions', entityFilter, activeOnly],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (entityFilter !== 'all') params.set('entityId', entityFilter);
      if (activeOnly) params.set('activeOnly', 'true');
      
      const response = await fetch(`/api/supervision/gps/all-positions?${params}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la récupération des positions');
      }
      const result = await response.json();
      return result.data || [];
    },
    refetchInterval: 60000,
  });

  const handleRefresh = async () => {
    await refetch();
    toast({
      title: 'Positions actualisées',
      description: `${positions.length} positions récupérées`,
    });
  };

  const recentCount = positions.filter(p => p.isRecent).length;
  const entities = Array.from(new Set(positions.map(p => p.user.entity).filter(Boolean)));

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />
      
      <div className="container mx-auto p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Supervision Équipe GPS</h1>
            <p className="text-sm text-muted-foreground">
              Positions terrain en temps réel (dernières 4h)
            </p>
          </div>
          
          <Button
            onClick={handleRefresh}
            disabled={isFetching}
            size="sm"
            variant="outline"
            data-testid="button-refresh"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-md">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Commerciaux</p>
                <p className="text-2xl font-bold" data-testid="stat-total">
                  {positions.length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-md">
                <MapPin className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Actifs (&lt; 15min)</p>
                <p className="text-2xl font-bold text-green-600" data-testid="stat-recent">
                  {recentCount}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-md">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Entités</p>
                <p className="text-2xl font-bold text-blue-600" data-testid="stat-entities">
                  {entities.length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-md">
                <AlertCircle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Inactifs (&gt; 15min)</p>
                <p className="text-2xl font-bold text-orange-600" data-testid="stat-inactive">
                  {positions.length - recentCount}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Entité:</label>
              <Select value={entityFilter} onValueChange={setEntityFilter}>
                <SelectTrigger className="w-[180px]" data-testid="select-entity">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="france">France</SelectItem>
                  <SelectItem value="luxembourg">Luxembourg</SelectItem>
                  <SelectItem value="belgique">Belgique</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={activeOnly ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveOnly(!activeOnly)}
                data-testid="button-active-only"
              >
                <Clock className="h-4 w-4 mr-2" />
                Actifs uniquement
              </Button>
            </div>

            <div className="ml-auto">
              <Badge variant="outline" data-testid="badge-update-time">
                Dernière màj: {new Date().toLocaleTimeString('fr-FR')}
              </Badge>
            </div>
          </div>

          {error ? (
            <div className="flex items-center justify-center h-[600px] bg-muted/20 rounded-lg">
              <div className="text-center space-y-2">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
                <p className="text-lg font-medium">Erreur de chargement</p>
                <p className="text-sm text-muted-foreground">
                  {error instanceof Error ? error.message : 'Impossible de charger les positions'}
                </p>
                <Button onClick={() => refetch()} size="sm" data-testid="button-retry">
                  Réessayer
                </Button>
              </div>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center h-[600px] bg-muted/20 rounded-lg">
              <div className="text-center space-y-2">
                <RefreshCw className="h-12 w-12 text-muted-foreground animate-spin mx-auto" />
                <p className="text-lg font-medium">Chargement des positions...</p>
              </div>
            </div>
          ) : positions.length === 0 ? (
            <div className="flex items-center justify-center h-[600px] bg-muted/20 rounded-lg">
              <div className="text-center space-y-2">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto" />
                <p className="text-lg font-medium">Aucune position disponible</p>
                <p className="text-sm text-muted-foreground">
                  Aucun commercial n'a partagé sa position dans les 4 dernières heures
                </p>
              </div>
            </div>
          ) : (
            <SupervisionMap positions={positions} />
          )}
        </Card>
      </div>
    </div>
  );
}
