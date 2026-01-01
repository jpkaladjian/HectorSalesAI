import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface OCRMetrics {
  totalExtractions: number;
  successfulExtractions: number;
  failedExtractions: number;
  successRate: number;
  avgResponseTime: number;
}

interface OCRAnalytics {
  period: string;
  metrics: OCRMetrics;
  errorTypes: Record<string, number>;
}

export function AdminOCRAnalytics() {
  const [analytics, setAnalytics] = useState<OCRAnalytics | null>(null);
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('week');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchAnalytics();
  }, [period]);
  
  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`/api/admin/ocr/analytics?period=${period}`);
      
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          setError('Accès non autorisé. Vous devez être administrateur pour consulter cette page.');
        } else if (res.status === 404) {
          setError('Endpoint analytics introuvable. Vérifiez la configuration serveur.');
        } else {
          setError(`Erreur serveur (${res.status}). Réessayez plus tard.`);
        }
        setAnalytics(null);
        return;
      }
      
      const data = await res.json();
      
      if (!data.metrics || typeof data.metrics !== 'object') {
        setError('Réponse API invalide : structure metrics manquante');
        setAnalytics(null);
        return;
      }
      
      setAnalytics(data);
      
    } catch (err) {
      console.error('[AdminOCRAnalytics] Erreur fetch:', err);
      setError('Erreur réseau. Vérifiez votre connexion.');
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="p-6">
        <div className="text-muted-foreground">Chargement des analytics OCR...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6 space-y-4">
        <Alert variant="destructive" data-testid="error-alert">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={fetchAnalytics} data-testid="button-retry">
          Réessayer
        </Button>
      </div>
    );
  }
  
  if (!analytics) {
    return (
      <div className="p-6">
        <div className="text-muted-foreground">Aucune donnée disponible</div>
      </div>
    );
  }
  
  const { metrics, errorTypes } = analytics;
  
  return (
    <div className="p-6 space-y-6" data-testid="admin-ocr-analytics">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">📊 Analytics OCR Business Cards</h1>
      </div>
      
      {/* Filtres période */}
      <div className="flex gap-2">
        <Button 
          onClick={() => setPeriod('day')}
          variant={period === 'day' ? 'default' : 'outline'}
          data-testid="period-day"
        >
          24h
        </Button>
        <Button 
          onClick={() => setPeriod('week')}
          variant={period === 'week' ? 'default' : 'outline'}
          data-testid="period-week"
        >
          7j
        </Button>
        <Button 
          onClick={() => setPeriod('month')}
          variant={period === 'month' ? 'default' : 'outline'}
          data-testid="period-month"
        >
          30j
        </Button>
      </div>
      
      {/* Métriques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="card-total">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Total Extractions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold" data-testid="total-extractions">
              {metrics.totalExtractions}
            </p>
          </CardContent>
        </Card>
        
        <Card data-testid="card-success-rate">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Taux de Succès</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600" data-testid="success-rate">
              {metrics.successRate}%
            </p>
          </CardContent>
        </Card>
        
        <Card data-testid="card-failures">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Échecs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600" data-testid="failed-extractions">
              {metrics.failedExtractions}
            </p>
          </CardContent>
        </Card>
        
        <Card data-testid="card-avg-time">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Temps Moyen</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold" data-testid="avg-response-time">
              {metrics.avgResponseTime}ms
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Types d'erreurs */}
      {errorTypes && Object.keys(errorTypes).length > 0 && (
        <Card data-testid="card-error-types">
          <CardHeader>
            <CardTitle>Types d'Erreurs</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {Object.entries(errorTypes).map(([type, count]) => (
                <li key={type} className="flex justify-between items-center" data-testid={`error-type-${type}`}>
                  <span className="text-sm">{type}</span>
                  <span className="font-bold text-lg">{count}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      
      {(!errorTypes || Object.keys(errorTypes).length === 0) && (
        <Card>
          <CardContent className="py-6">
            <p className="text-center text-muted-foreground">
              ✅ Aucune erreur sur la période sélectionnée
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
