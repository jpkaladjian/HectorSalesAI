import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { MapPin, PlayCircle, CheckCircle2, XCircle, Loader2, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GeocodingStats {
  totalProspects: number;
  geocodedProspects: number;
  pendingProspects: number;
  geocodedPercentage: number;
  bySource: {
    google_maps: number;
    nominatim: number;
    none: number;
  };
}

export default function AdminGpsGeocoding() {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  
  // Fetch geocoding stats
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<{ success: boolean; data: GeocodingStats }>({
    queryKey: ['/api/admin/gps/geocoding/stats'],
  });

  // Batch geocoding mutation
  const batchGeocodingMutation = useMutation({
    mutationFn: async (params: { entity?: string; limit?: number; throttleMs?: number }) => {
      setIsRunning(true);
      const result = await apiRequest(
        'POST',
        '/api/admin/gps/geocoding/batch',
        params
      );
      return result;
    },
    onSuccess: (data) => {
      setIsRunning(false);
      toast({
        title: 'Géocodage terminé',
        description: data.message || 'Les prospects ont été géocodés avec succès',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/gps/geocoding/stats'] });
    },
    onError: (error: any) => {
      setIsRunning(false);
      toast({
        title: 'Erreur géocodage',
        description: error.message || 'Erreur lors du géocodage batch',
        variant: 'destructive',
      });
    },
  });

  const handleStartBatchGeocoding = () => {
    batchGeocodingMutation.mutate({
      entity: undefined, // All entities
      limit: 100,
      throttleMs: 1000,
    });
  };

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (statsError || !stats?.data) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertDescription>
          Impossible de charger les statistiques de géocodage
        </AlertDescription>
      </Alert>
    );
  }

  const geocodingStats = stats.data;
  const progressPercentage = geocodingStats.geocodedPercentage;

  return (
    <div className="space-y-6">
      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Le géocodage convertit les adresses prospects en coordonnées GPS (latitude/longitude) pour activer la détection de proximité.
          Stratégie CASCADE : Google Maps API (si disponible) → OpenStreetMap Nominatim (gratuit).
        </AlertDescription>
      </Alert>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Prospects</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-prospects">
              {geocodingStats.totalProspects}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Géocodés</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="stat-geocoded">
              {geocodingStats.geocodedProspects}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {progressPercentage.toFixed(1)}% du total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Attente</CardTitle>
            <XCircle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600" data-testid="stat-pending">
              {geocodingStats.pendingProspects}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Card */}
      <Card>
        <CardHeader>
          <CardTitle>Progression Géocodage</CardTitle>
          <CardDescription>
            État actuel du géocodage des prospects
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Géocodés</span>
              <span className="font-medium">
                {geocodingStats.geocodedProspects} / {geocodingStats.totalProspects}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {/* Sources Breakdown */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Google Maps</p>
              <p className="text-lg font-semibold" data-testid="stat-google-maps">
                {geocodingStats.bySource.google_maps}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Nominatim</p>
              <p className="text-lg font-semibold" data-testid="stat-nominatim">
                {geocodingStats.bySource.nominatim}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Sans coordonnées</p>
              <p className="text-lg font-semibold text-amber-600" data-testid="stat-none">
                {geocodingStats.bySource.none}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Batch Geocoding Control */}
      <Card>
        <CardHeader>
          <CardTitle>Géocodage Batch</CardTitle>
          <CardDescription>
            Lancer le géocodage manuel des prospects sans coordonnées (max 100/batch)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Le géocodage automatique s'exécute chaque nuit à 4h00. Utilisez cette fonction uniquement pour traiter manuellement les prospects urgents.
            </AlertDescription>
          </Alert>

          <div className="flex items-center gap-4">
            <Button
              onClick={handleStartBatchGeocoding}
              disabled={isRunning || batchGeocodingMutation.isPending || geocodingStats.pendingProspects === 0}
              className="gap-2"
              data-testid="button-start-batch"
            >
              {isRunning || batchGeocodingMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Géocodage en cours...
                </>
              ) : (
                <>
                  <PlayCircle className="h-4 w-4" />
                  Lancer Géocodage Batch
                </>
              )}
            </Button>

            {geocodingStats.pendingProspects === 0 && (
              <Badge variant="secondary" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Tous les prospects sont géocodés
              </Badge>
            )}
          </div>

          {batchGeocodingMutation.data && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                {batchGeocodingMutation.data.message}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* CRON Info */}
      <Card>
        <CardHeader>
          <CardTitle>Géocodage Automatique</CardTitle>
          <CardDescription>
            Configuration du CRON job nocturne
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-sm text-muted-foreground">Fréquence</span>
            <Badge variant="secondary">Quotidien à 4h00</Badge>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-sm text-muted-foreground">Limite par batch</span>
            <Badge variant="secondary">100 prospects/nuit</Badge>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-sm text-muted-foreground">Throttle</span>
            <Badge variant="secondary">1000ms/requête</Badge>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted-foreground">Stratégie</span>
            <Badge variant="secondary">CASCADE Google→Nominatim</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
