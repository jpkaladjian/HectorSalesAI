import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, TrendingUp, TrendingDown, Clock, Info, CheckCircle2 } from "lucide-react";

interface CacheStats {
  entries: number;
  hits: number;
  misses: number;
  hit_rate: number;
  ttl_seconds: number;
}

export function CacheStatsCard() {
  const { data, isLoading, error } = useQuery<{ success: boolean; stats: CacheStats }>({
    queryKey: ['/api/ai/cache-stats'],
    refetchInterval: 10000,
  });

  if (isLoading) {
    return (
      <Card data-testid="card-cache-stats">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Cache IA - Chargement...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (error || !data?.success) {
    return (
      <Card data-testid="card-cache-stats-error" className="border-orange-200 dark:border-orange-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-600">
            <Database className="h-5 w-5" />
            Cache IA - Indisponible
          </CardTitle>
          <CardDescription>
            Impossible de récupérer les statistiques cache
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Les statistiques de performance ne sont pas disponibles actuellement. Le système fonctionne normalement.
          </p>
        </CardContent>
      </Card>
    );
  }

  const stats = data.stats;
  const hitRate = Math.round(stats.hit_rate * 100);
  const ttlMinutes = Math.round(stats.ttl_seconds / 60);

  return (
    <Card data-testid="card-cache-stats" className="hover-elevate">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Cache Scripts IA
        </CardTitle>
        <CardDescription>
          Performance système génération scripts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Entrées cache</p>
            <p className="text-2xl font-bold" data-testid="text-cache-entries">
              {stats.entries}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Temps conservation</p>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <p className="text-2xl font-bold" data-testid="text-cache-ttl">
                {ttlMinutes}min
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Taux de succès cache</span>
            <Badge 
              variant={hitRate >= 70 ? "default" : hitRate >= 40 ? "secondary" : "outline"}
              data-testid="badge-hit-rate"
            >
              {hitRate}%
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-xs text-muted-foreground">Hits</p>
                <p className="text-lg font-semibold" data-testid="text-cache-hits">
                  {stats.hits}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-xs text-muted-foreground">Misses</p>
                <p className="text-lg font-semibold" data-testid="text-cache-misses">
                  {stats.misses}
                </p>
              </div>
            </div>
          </div>
        </div>

        {hitRate < 40 && stats.entries > 5 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground border-t pt-3">
            <Info className="h-3 w-3" />
            <span>Taux faible : Les prospects ont des profils très variés</span>
          </div>
        )}
        {hitRate >= 70 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground border-t pt-3">
            <CheckCircle2 className="h-3 w-3 text-green-600" />
            <span>Excellent : Le cache optimise bien les performances</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
