import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Activity, User, Building2, Users, Trash2, Edit, Plus } from 'lucide-react';
import type { AuditLog } from '@/types/admin';

interface RecentActivitiesProps {
  logs: { logs: AuditLog[] } | AuditLog[];
}

const actionIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  create_team: Plus,
  update_team: Edit,
  delete_team: Trash2,
  create_organization: Plus,
  update_organization: Edit,
  delete_organization: Trash2,
  add_team_member: Users,
  remove_team_member: Trash2,
};

const actionLabels: Record<string, string> = {
  create_team: 'a créé l\'équipe',
  update_team: 'a modifié l\'équipe',
  delete_team: 'a supprimé l\'équipe',
  create_organization: 'a créé l\'organisation',
  update_organization: 'a modifié l\'organisation',
  delete_organization: 'a supprimé l\'organisation',
  add_team_member: 'a ajouté un membre à',
  remove_team_member: 'a retiré un membre de',
  update_organization_entity: 'a mis à jour l\'entité',
};

export function RecentActivities({ logs }: RecentActivitiesProps) {
  // Handle both formats: { logs: AuditLog[] } or AuditLog[]
  const auditLogs = Array.isArray(logs) ? logs : logs?.logs || [];

  if (auditLogs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500" data-testid="no-activities">
        Aucune activité récente
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="recent-activities-list">
      {auditLogs.map((log: AuditLog) => {
        const Icon = actionIcons[log.action] || Activity;
        const actionLabel = actionLabels[log.action] || log.action;
        
        return (
          <div 
            key={log.id} 
            className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            data-testid={`activity-log-${log.id}`}
          >
            <div className="flex-shrink-0 p-2 bg-white rounded-lg border border-gray-200">
              <Icon className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">
                <span className="font-medium">{log.userEmail || log.userName || 'Utilisateur'}</span>
                {' '}{actionLabel}{' '}
                <span className="font-medium">{log.entityName || log.entityType}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {log.createdAt ? formatDistanceToNow(new Date(log.createdAt), { addSuffix: true, locale: fr }) : 'Date inconnue'}
              </p>
            </div>
            <div className="flex-shrink-0">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                log.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {log.status === 'success' ? 'Réussi' : 'Échoué'}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
