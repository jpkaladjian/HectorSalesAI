import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Flame, Thermometer, Snowflake, Clock, Calendar, TrendingUp, Target, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import type { Opportunity } from "@shared/schema";

interface OpportunityActivity {
  id: string;
  opportunityId: string;
  userId: string;
  activityType: string;
  activityTitle: string;
  activityDescription: string | null;
  createdAt: string;
}

interface OpportunityNote {
  id: string;
  opportunityId: string;
  userId: string;
  noteContent: string;
  createdAt: string;
}

interface ScoringHistory {
  id: string;
  opportunityId: string;
  score: number;
  reactivityScore: number;
  maturityScore: number;
  enrichmentScore: number;
  discScore: number;
  geographyScore: number;
  networkScore: number;
  scoringReason: string | null;
  createdAt: string;
}

interface OpportunityDetail extends Opportunity {
  scoringHistory: ScoringHistory[];
}

const getTemperatureIcon = (temp: string | null) => {
  switch (temp) {
    case 'HOT': return <Flame className="w-5 h-5 text-red-600" />;
    case 'WARM': return <Thermometer className="w-5 h-5 text-orange-600" />;
    case 'COLD': return <Snowflake className="w-5 h-5 text-blue-600" />;
    default: return <Snowflake className="w-5 h-5 text-gray-600" />;
  }
};

const getTemperatureColor = (temp: string | null) => {
  switch (temp) {
    case 'HOT': return 'text-red-600 bg-red-50 dark:bg-red-950';
    case 'WARM': return 'text-orange-600 bg-orange-50 dark:bg-orange-950';
    case 'COLD': return 'text-blue-600 bg-blue-50 dark:bg-blue-950';
    default: return 'text-gray-600 bg-gray-50 dark:bg-gray-950';
  }
};

const getStageLabel = (stage: string | null) => {
  const stages: Record<string, string> = {
    'discovery': 'Découverte',
    'qualification': 'Qualification',
    'proposal': 'Proposition',
    'negotiation': 'Négociation',
    'closing': 'Signature',
  };
  return stages[stage || 'discovery'] || stage;
};

export default function OpportunityDetail() {
  const [, params] = useRoute("/crm/opportunities-module/:id");
  const opportunityId = params?.id;

  const { data: opportunityResponse, isLoading: isOpportunityLoading } = useQuery<{
    success: boolean;
    opportunity: OpportunityDetail;
    activities: OpportunityActivity[];
    notes: OpportunityNote[];
    scoringHistory: any[];
  }>({
    queryKey: ['/api/opportunities', opportunityId],
    enabled: !!opportunityId,
  });

  const opportunity = opportunityResponse?.opportunity;
  const activities = opportunityResponse?.activities || [];
  const notes = opportunityResponse?.notes || [];

  // Parse scoreDetails from JSON
  const scoreDetails = opportunity?.scoreDetails as any || {};
  const reactivityScore = scoreDetails.reactivity || 0;
  const maturityScore = scoreDetails.maturity || 0;
  const enrichmentScore = scoreDetails.enrichment || 0;
  const discScore = scoreDetails.disc || 0;
  const geographyScore = scoreDetails.geography || 0;
  const networkScore = scoreDetails.network || 0;

  if (isOpportunityLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-muted-foreground">Opportunité introuvable</p>
        <Link href="/crm/opportunities-module">
          <Button variant="outline" data-testid="button-back-to-list">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à la liste
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-6 space-y-6 overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/crm/opportunities-module">
            <Button variant="outline" size="icon" data-testid="button-back">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-opportunity-title">{opportunity.title}</h1>
            <p className="text-sm text-muted-foreground">
              Opportunité #{opportunity.id.slice(0, 8)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getTemperatureColor(opportunity.temperature)} data-testid="badge-temperature">
            {getTemperatureIcon(opportunity.temperature)}
            <span className="ml-1">{opportunity.temperature}</span>
          </Badge>
          {opportunity.requalificationRequired && (
            <Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-500" data-testid="badge-requalif">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Requalification requise
            </Badge>
          )}
        </div>
      </div>

      {/* Statistiques clés */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Score Global</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-score">{opportunity.score}/100</div>
            <div className="w-full bg-secondary rounded-full h-2 mt-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${opportunity.score}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Jours dans Hector</CardTitle>
              <Clock className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-days">{opportunity.daysInHector} jours</div>
            <p className="text-xs text-muted-foreground mt-1">
              Créé le {opportunity.createdAt ? new Date(opportunity.createdAt).toLocaleDateString('fr-FR') : '-'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Stage</CardTitle>
              <Target className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold" data-testid="text-stage">{getStageLabel(opportunity.stage)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {opportunity.status === 'active' ? 'Active' : 'Terminée'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Abonnement mensuel</CardTitle>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-monthly-subscription">
              {opportunity.monthlySubscription ? `${Number(opportunity.monthlySubscription)}€` : '-'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Potentiel annuel: {opportunity.monthlySubscription ? `${Number(opportunity.monthlySubscription) * 12}€` : '-'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Onglets */}
      <Tabs defaultValue="overview" className="flex-1">
        <TabsList>
          <TabsTrigger value="overview" data-testid="tab-overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="activities" data-testid="tab-activities">
            Activités ({activities.length})
          </TabsTrigger>
          <TabsTrigger value="notes" data-testid="tab-notes">
            Notes ({notes.length})
          </TabsTrigger>
          <TabsTrigger value="scoring" data-testid="tab-scoring">
            Scoring ({opportunity.scoringHistory?.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* Vue d'ensemble */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Détails de l'opportunité</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Titre</p>
                <p className="text-base" data-testid="text-detail-title">{opportunity.title}</p>
              </div>
              {opportunity.description && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Description</p>
                  <p className="text-base" data-testid="text-description">{opportunity.description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Contact</p>
                  <p className="text-base" data-testid="text-contact-name">{opportunity.contactName || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Téléphone</p>
                  <p className="text-base" data-testid="text-phone">{opportunity.contactPhone || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-base" data-testid="text-email">{opportunity.contactEmail || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Entreprise</p>
                  <p className="text-base" data-testid="text-company">{opportunity.companyName || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statut des enrichissements automatiques */}
          <Card>
            <CardHeader>
              <CardTitle>Enrichissements automatiques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">CASCADE (données entreprise)</span>
                {opportunity.cascadeEnriched && opportunity.cascadeData ? (
                  <Badge variant="default" className="bg-green-600 flex items-center gap-1" data-testid="badge-cascade-success">
                    <CheckCircle2 className="h-3 w-3" />
                    Enrichi
                  </Badge>
                ) : opportunity.siren ? (
                  <Badge variant="destructive" className="flex items-center gap-1" data-testid="badge-cascade-failed">
                    <XCircle className="h-3 w-3" />
                    Échec enrichissement
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="flex items-center gap-1" data-testid="badge-cascade-pending">
                    <Clock className="h-3 w-3" />
                    Pas de SIREN
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">DISC (profil décideur AI)</span>
                {opportunity.discProfiled && opportunity.discProfile ? (
                  <Badge variant="default" className="bg-blue-600 flex items-center gap-1" data-testid="badge-disc-success">
                    <CheckCircle2 className="h-3 w-3" />
                    Profil {opportunity.discProfile}
                  </Badge>
                ) : opportunity.cascadeData ? (
                  <Badge variant="destructive" className="flex items-center gap-1" data-testid="badge-disc-failed">
                    <XCircle className="h-3 w-3" />
                    Échec profiling
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="flex items-center gap-1" data-testid="badge-disc-pending">
                    <Clock className="h-3 w-3" />
                    Attente CASCADE
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">GPS (géolocalisation)</span>
                {opportunity.gpsGeocoded && opportunity.gpsLatitude && opportunity.gpsLongitude ? (
                  <Badge variant="default" className="bg-purple-600 flex items-center gap-1" data-testid="badge-gps-success">
                    <CheckCircle2 className="h-3 w-3" />
                    Géolocalisé
                  </Badge>
                ) : opportunity.address ? (
                  <Badge variant="destructive" className="flex items-center gap-1" data-testid="badge-gps-failed">
                    <XCircle className="h-3 w-3" />
                    Échec géocodage
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="flex items-center gap-1" data-testid="badge-gps-pending">
                    <Clock className="h-3 w-3" />
                    Pas d'adresse
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Scoring détaillé</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Réactivité</span>
                  <span className="text-sm font-medium">{reactivityScore}/100</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${reactivityScore}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Maturité</span>
                  <span className="text-sm font-medium">{maturityScore}/100</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{ width: `${maturityScore}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Enrichissement</span>
                  <span className="text-sm font-medium">{enrichmentScore}/100</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all"
                    style={{ width: `${enrichmentScore}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">DISC</span>
                  <span className="text-sm font-medium">{discScore}/100</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-yellow-600 h-2 rounded-full transition-all"
                    style={{ width: `${discScore}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Géographie</span>
                  <span className="text-sm font-medium">{geographyScore}/100</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-orange-600 h-2 rounded-full transition-all"
                    style={{ width: `${geographyScore}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Réseau</span>
                  <span className="text-sm font-medium">{networkScore}/100</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-red-600 h-2 rounded-full transition-all"
                    style={{ width: `${networkScore}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activités */}
        <TabsContent value="activities" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Historique des activités</CardTitle>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Aucune activité enregistrée
                </p>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="border-l-2 border-primary pl-4 pb-4"
                      data-testid={`activity-${activity.id}`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{activity.activityTitle}</p>
                          {activity.activityDescription && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {activity.activityDescription}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {activity.activityType}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(activity.createdAt).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes */}
        <TabsContent value="notes" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              {notes.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Aucune note enregistrée
                </p>
              ) : (
                <div className="space-y-4">
                  {notes.map((note) => (
                    <Card key={note.id} data-testid={`note-${note.id}`}>
                      <CardContent className="pt-4">
                        <p className="text-sm">{note.noteContent}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(note.createdAt).toLocaleString('fr-FR')}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Historique scoring */}
        <TabsContent value="scoring" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Historique du scoring</CardTitle>
            </CardHeader>
            <CardContent>
              {!opportunity.scoringHistory || opportunity.scoringHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Aucun historique de scoring
                </p>
              ) : (
                <div className="space-y-4">
                  {opportunity.scoringHistory.map((history) => (
                    <Card key={history.id} data-testid={`scoring-${history.id}`}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-lg">Score: {history.score}/100</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(history.createdAt).toLocaleString('fr-FR')}
                          </span>
                        </div>
                        {history.scoringReason && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {history.scoringReason}
                          </p>
                        )}
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>Réactivité: {history.reactivityScore}</div>
                          <div>Maturité: {history.maturityScore}</div>
                          <div>Enrichissement: {history.enrichmentScore}</div>
                          <div>DISC: {history.discScore}</div>
                          <div>Géographie: {history.geographyScore}</div>
                          <div>Réseau: {history.networkScore}</div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
