// ============================================
// useAnalytics HOOK
// ============================================

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/services/admin/adminApi';
import { analyticsApi } from '@/services/admin/analyticsApi';

export function useAnalytics() {
  const dashboardQuery = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => adminApi.getAnalytics(),
    refetchInterval: 30000, // Refresh every 30s
  });

  const kpisQuery = useQuery({
    queryKey: ['analytics-kpis'],
    queryFn: () => analyticsApi.getKPIs(),
    refetchInterval: 30000,
  });

  return {
    // Dashboard analytics
    dashboardData: dashboardQuery.data,
    isDashboardLoading: dashboardQuery.isLoading,
    dashboardError: dashboardQuery.error,
    
    // Global KPIs
    kpisData: kpisQuery.data,
    isKPIsLoading: kpisQuery.isLoading,
    kpisError: kpisQuery.error,
  };
}

export function useEntityAnalytics(entityCode: string) {
  const query = useQuery({
    queryKey: ['analytics-entity', entityCode],
    queryFn: () => analyticsApi.getEntityKPIs(entityCode),
    enabled: !!entityCode,
    refetchInterval: 30000,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
}
