import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, TrendingUp, TrendingDown, Users, Target } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AnalyticsOverview {
  kpis: {
    totalProspects: number;
    totalOpportunities: number;
    newProspects: number;
    newOpportunities: number;
    wonDeals: number;
    conversionRate: number;
    winRate: number;
  };
  trends: Array<{
    date: string;
    prospects: number;
  }>;
  period: number;
  generatedAt: string;
}

interface PipelineData {
  distribution: Array<{
    status: string;
    count: number;
    totalValue: number;
  }>;
  summary: {
    totalOpportunities: number;
    totalValue: number;
  };
  generatedAt: string;
}

interface TeamPerformance {
  topPerformers: Array<{
    userId: number;
    email: string;
    prenom: string;
    nom: string;
    entity: string;
    opportunitiesCount: number;
    wonCount: number;
    winRate: string;
  }>;
  period: number;
  generatedAt: string;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function AdminAnalyticsPage() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [pipeline, setPipeline] = useState<PipelineData | null>(null);
  const [team, setTeam] = useState<TeamPerformance | null>(null);
  const [period, setPeriod] = useState<7 | 30 | 90 | 365>(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllAnalytics();
  }, [period]);

  const fetchAllAnalytics = async () => {
    setLoading(true);
    setError(null);

    try {
      const [overviewRes, pipelineRes, teamRes] = await Promise.all([
        fetch(`/api/analytics/overview?period=${period}`),
        fetch(`/api/analytics/pipeline`),
        fetch(`/api/analytics/team?period=${period}`),
      ]);

      if (!overviewRes.ok || !pipelineRes.ok || !teamRes.ok) {
        throw new Error('Erreur lors du chargement des analytics');
      }

      const [overviewData, pipelineData, teamData] = await Promise.all([
        overviewRes.json(),
        pipelineRes.json(),
        teamRes.json(),
      ]);

      setOverview(overviewData);
      setPipeline(pipelineData);
      setTeam(teamData);
    } catch (err) {
      console.error('[AdminAnalyticsPage] Erreur fetch:', err);
      setError('Erreur réseau. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-muted-foreground">Chargement des analytics...</div>
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
        <Button onClick={fetchAllAnalytics} data-testid="button-retry">
          Réessayer
        </Button>
      </div>
    );
  }

  if (!overview || !pipeline || !team) {
    return (
      <div className="p-6">
        <div className="text-muted-foreground">Aucune donnée disponible</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" data-testid="admin-analytics-page">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Analytics Commercial</h1>
        </div>
      </div>

      {/* Filtres période */}
      <div className="flex gap-2">
        <Button
          onClick={() => setPeriod(7)}
          variant={period === 7 ? 'default' : 'outline'}
          data-testid="period-7"
        >
          7 jours
        </Button>
        <Button
          onClick={() => setPeriod(30)}
          variant={period === 30 ? 'default' : 'outline'}
          data-testid="period-30"
        >
          30 jours
        </Button>
        <Button
          onClick={() => setPeriod(90)}
          variant={period === 90 ? 'default' : 'outline'}
          data-testid="period-90"
        >
          90 jours
        </Button>
        <Button
          onClick={() => setPeriod(365)}
          variant={period === 365 ? 'default' : 'outline'}
          data-testid="period-365"
        >
          1 an
        </Button>
      </div>

      {/* KPIs principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="card-prospects">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Prospects
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="total-prospects">
              {overview.kpis.totalProspects}
            </div>
            <p className="text-xs text-muted-foreground">
              +{overview.kpis.newProspects} sur {period}j
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-opportunities">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Opportunités
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="total-opportunities">
              {overview.kpis.totalOpportunities}
            </div>
            <p className="text-xs text-muted-foreground">
              +{overview.kpis.newOpportunities} sur {period}j
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-conversion">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taux Conversion
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600" data-testid="conversion-rate">
              {overview.kpis.conversionRate.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Prospects → Opportunités
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-win-rate">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taux Victoire
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="win-rate">
              {overview.kpis.winRate.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {overview.kpis.wonDeals} affaires gagnées
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tendances temporelles */}
      <Card data-testid="card-trends">
        <CardHeader>
          <CardTitle>Tendances Prospects (7 derniers jours)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={overview.trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="prospects"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Nouveaux Prospects"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Distribution Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card data-testid="card-pipeline-chart">
          <CardHeader>
            <CardTitle>Distribution Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pipeline.distribution}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {pipeline.distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card data-testid="card-pipeline-details">
          <CardHeader>
            <CardTitle>Détails Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="font-medium">Total Opportunités</span>
                <span className="text-2xl font-bold">{pipeline.summary.totalOpportunities}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="font-medium">Valeur Totale</span>
                <span className="text-2xl font-bold">
                  {pipeline.summary.totalValue.toLocaleString('fr-FR')}€
                </span>
              </div>
              <div className="space-y-2 mt-4">
                {pipeline.distribution.map((item, index) => (
                  <div
                    key={item.status}
                    className="flex justify-between items-center"
                    data-testid={`pipeline-item-${index}`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm">{item.status}</span>
                    </div>
                    <span className="font-bold">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card data-testid="card-top-performers">
        <CardHeader>
          <CardTitle>Top Performers ({period}j)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={team.topPerformers.slice(0, 5)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="nom"
                tickFormatter={(value, index) => {
                  const performer = team.topPerformers[index];
                  return `${performer.prenom} ${performer.nom}`;
                }}
              />
              <YAxis />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-background border rounded-md p-3 shadow-lg">
                        <p className="font-bold">
                          {data.prenom} {data.nom}
                        </p>
                        <p className="text-sm text-muted-foreground">{data.email}</p>
                        <p className="text-sm">Opportunités: {data.opportunitiesCount}</p>
                        <p className="text-sm">Gagnées: {data.wonCount}</p>
                        <p className="text-sm">Taux victoire: {data.winRate}%</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Bar dataKey="opportunitiesCount" fill="#3b82f6" name="Opportunités créées" />
              <Bar dataKey="wonCount" fill="#10b981" name="Affaires gagnées" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
