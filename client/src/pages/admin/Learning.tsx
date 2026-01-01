import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Brain, 
  CheckCircle2, 
  XCircle, 
  PlayCircle, 
  Loader2,
  TrendingUp,
  FileText,
  Lightbulb,
  Sparkles
} from 'lucide-react';

interface LearningStats {
  insights: {
    total: number;
    validated: number;
    applied: number;
    pending: number;
  };
  prompts: {
    total: number;
    active: number;
  };
}

interface LearningInsight {
  id: string;
  pattern: string;
  description: string;
  successRate: number;
  sampleSize: number;
  sector: string | null;
  discProfile: string | null;
  canal: string | null;
  validated: string;
  appliedToPrompts: string;
  detectedAt: string;
  validatedAt: string | null;
}

interface PromptVersion {
  id: string;
  promptType: string;
  version: number;
  content: string;
  performanceScore: number | null;
  basedOnInsights: any | null;
  isActive: string;
  createdAt: string;
}

export default function Learning() {
  const { toast } = useToast();
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null);
  const [filterValidated, setFilterValidated] = useState<'all' | 'validated' | 'pending'>('all');

  // Fetch stats
  const { data: stats, isLoading: statsLoading } = useQuery<LearningStats>({
    queryKey: ['/api/learning/stats'],
  });

  // Fetch insights
  const insightsQuery = filterValidated === 'all' ? '' : `?validated=${filterValidated === 'validated' ? 'true' : 'false'}`;
  const { data: insights, isLoading: insightsLoading } = useQuery<LearningInsight[]>({
    queryKey: ['/api/learning/insights', filterValidated],
    queryFn: () => fetch(`/api/learning/insights${insightsQuery}`).then(r => r.json()),
  });

  // Fetch prompts
  const { data: prompts, isLoading: promptsLoading } = useQuery<PromptVersion[]>({
    queryKey: ['/api/learning/prompts'],
  });

  // Mutation: Run learning loop
  const runLoopMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/learning/run-async', {});
    },
    onSuccess: () => {
      toast({
        title: "Learning Loop lancé",
        description: "L'analyse IA a été lancée en arrière-plan. Les résultats seront disponibles dans quelques minutes.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/learning/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/learning/insights'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de lancer le learning loop",
        variant: "destructive",
      });
    },
  });

  // Mutation: Validate insight
  const validateMutation = useMutation({
    mutationFn: async ({ id, validated }: { id: string; validated: boolean }) => {
      return await apiRequest('POST', `/api/learning/insights/${id}/validate`, { validated });
    },
    onSuccess: () => {
      toast({
        title: "Insight mis à jour",
        description: "Le statut de validation a été modifié avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/learning/insights'] });
      queryClient.invalidateQueries({ queryKey: ['/api/learning/stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour l'insight",
        variant: "destructive",
      });
    },
  });

  const handleValidate = (id: string, validated: boolean) => {
    validateMutation.mutate({ id, validated });
  };

  const selectedInsightData = insights?.find(i => i.id === selectedInsight);

  return (
    <div className="h-screen overflow-hidden bg-background">
      <div className="flex h-full flex-col">
        {/* Header */}
        <header className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <Brain className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-2xl font-bold" data-testid="text-page-title">
                Learning Loop IA
              </h1>
              <p className="text-sm text-muted-foreground">
                Amélioration continue par analyse des performances
              </p>
            </div>
          </div>
          <Button
            onClick={() => runLoopMutation.mutate()}
            disabled={runLoopMutation.isPending}
            data-testid="button-run-learning"
          >
            {runLoopMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyse en cours...
              </>
            ) : (
              <>
                <PlayCircle className="mr-2 h-4 w-4" />
                Lancer Learning Loop
              </>
            )}
          </Button>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 p-6">
          <Card data-testid="card-insights-total">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? '...' : stats?.insights.total || 0}
              </div>
              <p className="text-xs text-muted-foreground">patterns détectés</p>
            </CardContent>
          </Card>

          <Card data-testid="card-insights-validated">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Insights Validés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {statsLoading ? '...' : stats?.insights.validated || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.insights.total ? 
                  `${Math.round((stats.insights.validated / stats.insights.total) * 100)}% du total` 
                  : '0%'}
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-insights-applied">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Insights Appliqués</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {statsLoading ? '...' : stats?.insights.applied || 0}
              </div>
              <p className="text-xs text-muted-foreground">utilisés dans prompts</p>
            </CardContent>
          </Card>

          <Card data-testid="card-prompts-active">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Versions Prompts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? '...' : stats?.prompts.active || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                actives sur {stats?.prompts.total || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden px-6 pb-6">
          <Tabs defaultValue="insights" className="h-full flex flex-col">
            <TabsList data-testid="tabs-learning">
              <TabsTrigger value="insights" data-testid="tab-insights">
                <Lightbulb className="mr-2 h-4 w-4" />
                Insights
              </TabsTrigger>
              <TabsTrigger value="prompts" data-testid="tab-prompts">
                <FileText className="mr-2 h-4 w-4" />
                Versions Prompts
              </TabsTrigger>
              <TabsTrigger value="recommendations" data-testid="tab-recommendations">
                <Sparkles className="mr-2 h-4 w-4" />
                Recommandations
              </TabsTrigger>
            </TabsList>

            {/* INSIGHTS TAB */}
            <TabsContent value="insights" className="flex-1 overflow-hidden">
              <div className="flex h-full gap-4">
                {/* Insights List */}
                <Card className="flex-1 overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Patterns Détectés</CardTitle>
                      <CardDescription>
                        Structures de messages performantes
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={filterValidated === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterValidated('all')}
                        data-testid="filter-all"
                      >
                        Tous
                      </Button>
                      <Button
                        variant={filterValidated === 'validated' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterValidated('validated')}
                        data-testid="filter-validated"
                      >
                        Validés
                      </Button>
                      <Button
                        variant={filterValidated === 'pending' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterValidated('pending')}
                        data-testid="filter-pending"
                      >
                        En attente
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="h-[calc(100%-80px)] p-0">
                    <ScrollArea className="h-full">
                      {insightsLoading ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                      ) : insights && insights.length > 0 ? (
                        <div className="space-y-2 p-4">
                          {insights.map((insight) => (
                            <div
                              key={insight.id}
                              className={`cursor-pointer rounded-lg border p-3 transition-colors hover-elevate ${
                                selectedInsight === insight.id ? 'border-primary bg-accent' : ''
                              }`}
                              onClick={() => setSelectedInsight(insight.id)}
                              data-testid={`insight-card-${insight.id}`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold">
                                      {insight.pattern}
                                    </span>
                                    {insight.validated === 'true' ? (
                                      <Badge variant="default" data-testid="badge-validated">
                                        <CheckCircle2 className="mr-1 h-3 w-3" />
                                        Validé
                                      </Badge>
                                    ) : (
                                      <Badge variant="secondary" data-testid="badge-pending">
                                        En attente
                                      </Badge>
                                    )}
                                    {insight.appliedToPrompts === 'true' && (
                                      <Badge variant="outline" data-testid="badge-applied">
                                        Appliqué
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                                    {insight.description}
                                  </p>
                                  <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                                    <span>
                                      <TrendingUp className="inline h-3 w-3 mr-1" />
                                      {(insight.successRate * 100).toFixed(1)}% succès
                                    </span>
                                    <span>
                                      {insight.sampleSize} messages
                                    </span>
                                    {insight.canal && (
                                      <Badge variant="outline" className="text-xs">
                                        {insight.canal}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <Lightbulb className="h-12 w-12 text-muted-foreground/50" />
                          <p className="mt-4 text-sm text-muted-foreground">
                            Aucun insight détecté
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Lancez le learning loop pour analyser les performances
                          </p>
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Insight Details */}
                {selectedInsightData && (
                  <Card className="w-96 overflow-hidden">
                    <CardHeader>
                      <CardTitle>Détails de l'Insight</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[calc(100vh-300px)]">
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Pattern</h3>
                            <p className="mt-1 font-semibold" data-testid="detail-pattern">
                              {selectedInsightData.pattern}
                            </p>
                          </div>

                          <Separator />

                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                            <p className="mt-1 text-sm" data-testid="detail-description">
                              {selectedInsightData.description}
                            </p>
                          </div>

                          <Separator />

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h3 className="text-sm font-medium text-muted-foreground">Taux de succès</h3>
                              <p className="mt-1 text-2xl font-bold text-green-600" data-testid="detail-success-rate">
                                {(selectedInsightData.successRate * 100).toFixed(1)}%
                              </p>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-muted-foreground">Échantillon</h3>
                              <p className="mt-1 text-2xl font-bold" data-testid="detail-sample-size">
                                {selectedInsightData.sampleSize}
                              </p>
                            </div>
                          </div>

                          <Separator />

                          {(selectedInsightData.sector || selectedInsightData.discProfile || selectedInsightData.canal) && (
                            <>
                              <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-2">Contexte</h3>
                                <div className="flex flex-wrap gap-2">
                                  {selectedInsightData.sector && (
                                    <Badge variant="secondary">{selectedInsightData.sector}</Badge>
                                  )}
                                  {selectedInsightData.discProfile && (
                                    <Badge variant="secondary">DISC: {selectedInsightData.discProfile}</Badge>
                                  )}
                                  {selectedInsightData.canal && (
                                    <Badge variant="secondary">{selectedInsightData.canal}</Badge>
                                  )}
                                </div>
                              </div>
                              <Separator />
                            </>
                          )}

                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-2">Actions</h3>
                            <div className="flex gap-2">
                              {selectedInsightData.validated === 'true' ? (
                                <Button
                                  variant="outline"
                                  className="flex-1"
                                  onClick={() => handleValidate(selectedInsightData.id, false)}
                                  disabled={validateMutation.isPending}
                                  data-testid="button-invalidate"
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Invalider
                                </Button>
                              ) : (
                                <Button
                                  variant="default"
                                  className="flex-1"
                                  onClick={() => handleValidate(selectedInsightData.id, true)}
                                  disabled={validateMutation.isPending}
                                  data-testid="button-validate"
                                >
                                  <CheckCircle2 className="mr-2 h-4 w-4" />
                                  Valider
                                </Button>
                              )}
                            </div>
                          </div>

                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Métadonnées</h3>
                            <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                              <p>Détecté le : {new Date(selectedInsightData.detectedAt).toLocaleDateString('fr-FR')}</p>
                              {selectedInsightData.validatedAt && (
                                <p>Validé le : {new Date(selectedInsightData.validatedAt).toLocaleDateString('fr-FR')}</p>
                              )}
                              <p>ID : {selectedInsightData.id.slice(0, 8)}...</p>
                            </div>
                          </div>
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* PROMPTS TAB */}
            <TabsContent value="prompts" className="flex-1 overflow-hidden">
              <Card className="h-full overflow-hidden">
                <CardHeader>
                  <CardTitle>Historique des Versions de Prompts</CardTitle>
                  <CardDescription>
                    Évolution des prompts IA basée sur les insights
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[calc(100%-80px)] p-0">
                  <ScrollArea className="h-full">
                    {promptsLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : prompts && prompts.length > 0 ? (
                      <div className="space-y-3 p-4">
                        {prompts.map((prompt) => (
                          <div
                            key={prompt.id}
                            className="rounded-lg border p-4"
                            data-testid={`prompt-card-${prompt.id}`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold">
                                    {prompt.promptType} v{prompt.version}
                                  </span>
                                  {prompt.isActive === 'true' && (
                                    <Badge variant="default" data-testid="badge-active-prompt">
                                      Actif
                                    </Badge>
                                  )}
                                  {prompt.performanceScore !== null && (
                                    <Badge variant="outline">
                                      Score: {prompt.performanceScore.toFixed(2)}
                                    </Badge>
                                  )}
                                </div>
                                <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                                  {prompt.content.substring(0, 200)}...
                                </p>
                                <div className="mt-2 text-xs text-muted-foreground">
                                  Créé le : {new Date(prompt.createdAt).toLocaleDateString('fr-FR')}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <FileText className="h-12 w-12 text-muted-foreground/50" />
                        <p className="mt-4 text-sm text-muted-foreground">
                          Aucune version de prompt
                        </p>
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* RECOMMENDATIONS TAB */}
            <TabsContent value="recommendations" className="flex-1 overflow-hidden">
              <Card className="h-full overflow-hidden">
                <CardHeader>
                  <CardTitle>Recommandations IA</CardTitle>
                  <CardDescription>
                    Suggestions d'améliorations basées sur les insights validés
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[calc(100%-80px)]">
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <Sparkles className="h-16 w-16 text-muted-foreground/50" />
                    <p className="mt-4 text-lg font-medium">Fonctionnalité en développement</p>
                    <p className="mt-2 text-sm text-muted-foreground max-w-md">
                      Les recommandations automatiques seront disponibles après validation de plusieurs insights.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
