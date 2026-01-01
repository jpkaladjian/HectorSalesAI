import { Badge } from "@/components/ui/badge";
import { Play, Pause, CheckCircle2, Clock } from "lucide-react";

interface CampaignStatusBadgeProps {
  status: string;
  testId?: string;
}

export function CampaignStatusBadge({ status, testId }: CampaignStatusBadgeProps) {
  const getStatusConfig = (statut: string) => {
    switch (statut) {
      case 'active':
        return {
          label: 'Active',
          variant: 'default' as const,
          icon: <Play className="h-3 w-3" />,
          color: 'bg-green-500'
        };
      case 'paused':
        return {
          label: 'En pause',
          variant: 'secondary' as const,
          icon: <Pause className="h-3 w-3" />,
          color: 'bg-yellow-500'
        };
      case 'completed':
        return {
          label: 'Terminée',
          variant: 'outline' as const,
          icon: <CheckCircle2 className="h-3 w-3" />,
          color: 'bg-blue-500'
        };
      default:
        return {
          label: 'En attente',
          variant: 'secondary' as const,
          icon: <Clock className="h-3 w-3" />,
          color: 'bg-gray-500'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge 
      variant={config.variant}
      className="gap-1"
      data-testid={testId}
    >
      {config.icon}
      {config.label}
    </Badge>
  );
}
