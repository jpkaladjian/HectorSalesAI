import { useQuery } from '@tanstack/react-query';
import { auditLogsApi, type AuditLogFilters } from '@/services/admin/auditLogsApi';

/**
 * Hook pour récupérer les logs d'audit avec filtres
 */
export function useAuditLogs(filters?: AuditLogFilters) {
  return useQuery({
    queryKey: ['/api/admin/audit-logs', filters],
    queryFn: () => auditLogsApi.getAll(filters),
  });
}

/**
 * Hook pour récupérer les statistiques des logs d'audit
 */
export function useAuditLogsStats() {
  return useQuery({
    queryKey: ['/api/admin/audit-logs/stats'],
    queryFn: () => auditLogsApi.getStats(),
  });
}
