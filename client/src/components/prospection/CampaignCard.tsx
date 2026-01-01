import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Send, 
  CheckCircle2, 
  Clock,
  BarChart3,
  Edit,
  Trash2,
  Pause,
  Play
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CampaignStatusBadge } from "./CampaignStatusBadge";
import { ProgressBar } from "./ProgressBar";
import type { CampagneProspection } from "@shared/schema";

interface CampaignCardProps {
  campaign: CampagneProspection & {
    scenario?: { nom: string; totalEtapes: number } | null;
  };
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onTogglePause?: (id: string) => void;
  onViewAnalytics?: (id: string) => void;
}

export function CampaignCard({ 
  campaign, 
  onEdit, 
  onDelete, 
  onTogglePause,
  onViewAnalytics 
}: CampaignCardProps) {
  // Calculer le pourcentage de progression
  const calculateProgress = () => {
    if (!campaign.stats?.contactes) return 0;
    // On peut améliorer ça en utilisant l'étape moyenne des prospects
    const totalSteps = campaign.scenario?.totalEtapes || 5;
    const avgStep = 2; // Valeur par défaut, à améliorer avec les vraies données
    return Math.round((avgStep / totalSteps) * 100);
  };

  const progress = calculateProgress();

  return (
    <Card className="hover-elevate transition-all duration-200" data-testid={`card-campaign-${campaign.id}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Titre et statut */}
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <CardTitle className="text-xl" data-testid={`text-campaign-name-${campaign.id}`}>
                {campaign.nom}
              </CardTitle>
              <CampaignStatusBadge 
                status={campaign.statut} 
                testId={`badge-status-${campaign.id}`}
              />
            </div>

            {/* Scénario info */}
            {campaign.scenario && (
              <p className="text-sm text-muted-foreground mb-3">
                Scénario: {campaign.scenario.nom} ({campaign.scenario.totalEtapes} étapes)
              </p>
            )}
            {campaign.objectif && !campaign.scenario && (
              <p className="text-sm text-muted-foreground mb-3">
                Objectif: {campaign.objectif}
              </p>
            )}

            {/* Barre de progression */}
            <div className="mb-4">
              <ProgressBar 
                percentage={progress} 
                testId={`progress-${campaign.id}`}
              />
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-4 text-sm mb-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                <span data-testid={`stat-contacted-${campaign.id}`}>
                  <strong>{campaign.stats?.contactes || 0}</strong> prospects
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Send className="h-4 w-4 text-purple-500" />
                <span data-testid={`stat-responses-${campaign.id}`}>
                  <strong>{campaign.stats?.reponses || 0}</strong> réponses
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span data-testid={`stat-rdv-${campaign.id}`}>
                  <strong>{campaign.stats?.rdv || 0}</strong> RDV
                </span>
              </div>
              {campaign.dateDebut && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span className="text-muted-foreground">
                    Début: {format(new Date(campaign.dateDebut), 'dd MMM yyyy', { locale: fr })}
                  </span>
                </div>
              )}
            </div>

            {/* Boutons d'action */}
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onViewAnalytics?.(campaign.id)}
                data-testid={`button-details-${campaign.id}`}
                className="gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Détails
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onTogglePause?.(campaign.id)}
                data-testid={`button-pause-${campaign.id}`}
                className="gap-2"
              >
                {campaign.statut === 'active' ? (
                  <>
                    <Pause className="h-4 w-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Reprendre
                  </>
                )}
              </Button>

              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onViewAnalytics?.(campaign.id)}
                data-testid={`button-analytics-${campaign.id}`}
                className="gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Analytics
              </Button>
            </div>
          </div>

          {/* Actions secondaires (Edit/Delete) */}
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => onEdit?.(campaign.id)}
              data-testid={`button-edit-${campaign.id}`}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => onDelete?.(campaign.id)}
              data-testid={`button-delete-${campaign.id}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
