import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Users, TrendingUp, Calendar, Target } from "lucide-react";
import type { TeamWithMembers } from "@/services/admin/teamsApi";

interface TeamCardProps {
  team: TeamWithMembers;
  onEdit: () => void;
  onDelete: () => void;
  onClick?: () => void;
}

const ENTITY_LABELS: Record<string, string> = {
  france: '🇫🇷 France',
  luxembourg: '🇱🇺 Luxembourg',
  belgique: '🇧🇪 Belgique',
};

export function TeamCard({ team, onEdit, onDelete, onClick }: TeamCardProps) {
  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    onClick?.();
  };

  return (
    <Card
      className="hover-elevate cursor-pointer"
      onClick={handleCardClick}
      data-testid={`card-team-${team.id}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: team.color || '#3B82F6' }}
              />
              <h3 className="font-semibold text-base" data-testid={`text-team-name-${team.id}`}>
                {team.name}
              </h3>
            </div>
            {team.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {team.description}
              </p>
            )}
          </div>
          <div className="flex gap-1 ml-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              data-testid={`button-edit-team-${team.id}`}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              data-testid={`button-delete-team-${team.id}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="secondary" data-testid={`badge-entity-${team.id}`}>
            {ENTITY_LABELS[team.entity] || team.entity}
          </Badge>
          <Badge variant={team.isActive ? 'default' : 'outline'}>
            {team.isActive ? 'Active' : 'Inactive'}
          </Badge>
          {team.memberCount !== undefined && (
            <Badge variant="outline" className="gap-1">
              <Users className="h-3 w-3" />
              {team.memberCount} membre{team.memberCount !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        {(team.monthlyTargetCa || team.monthlyTargetMeetings || team.monthlyTargetSignatures) && (
          <div className="border-t pt-3 mt-3 space-y-1.5">
            <div className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Target className="h-3 w-3" />
              Objectifs mensuels
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {team.monthlyTargetCa && (
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-muted-foreground" />
                  <span className="font-medium">
                    {parseFloat(team.monthlyTargetCa).toLocaleString('fr-FR')}€
                  </span>
                </div>
              )}
              {team.monthlyTargetMeetings && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <span className="font-medium">{team.monthlyTargetMeetings} RDV</span>
                </div>
              )}
              {team.monthlyTargetSignatures && (
                <div className="flex items-center gap-1">
                  <Target className="h-3 w-3 text-muted-foreground" />
                  <span className="font-medium">{team.monthlyTargetSignatures} signatures</span>
                </div>
              )}
            </div>
          </div>
        )}

        {team.manager && (
          <div className="border-t pt-3 mt-3 text-xs">
            <span className="text-muted-foreground">Manager : </span>
            <span className="font-medium">{team.manager.username}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
