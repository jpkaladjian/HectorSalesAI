import { useQuery } from '@tanstack/react-query';
import { BarChart3, Users, Building2, Activity } from 'lucide-react';
import { adminApi } from '@/services/admin/adminApi';
import { KPICard } from '@/components/admin/dashboard/KPICard';
import { ActivityChart } from '@/components/admin/dashboard/ActivityChart';
import { UsersChart } from '@/components/admin/dashboard/UsersChart';
import { RecentActivities } from '@/components/admin/dashboard/RecentActivities';
import { LoadingSpinner } from '@/components/admin/common/LoadingSpinner';
import { ErrorAlert } from '@/components/admin/common/ErrorAlert';
import { Link } from 'wouter';

export function AdminDashboard() {
  // Fetch analytics data
  const { data: analytics, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => adminApi.getAnalytics(),
    refetchInterval: 30000, // Refresh every 30s
  });

  // Fetch recent audit logs
  const { data: recentLogs } = useQuery({
    queryKey: ['admin-recent-logs'],
    queryFn: () => adminApi.getRecentAuditLogs(10),
    refetchInterval: 10000, // Refresh every 10s
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <ErrorAlert
          title="Erreur de chargement"
          message="Impossible de charger les analytics du dashboard."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const kpis = [
    {
      title: 'Organisations',
      value: analytics?.totalOrganizations || 0,
      icon: Building2,
      color: 'blue' as const,
      trend: '+12%',
      trendUp: true,
    },
    {
      title: 'Équipes',
      value: analytics?.totalTeams || 0,
      icon: Users,
      color: 'green' as const,
      trend: '+8%',
      trendUp: true,
    },
    {
      title: 'Utilisateurs Actifs',
      value: analytics?.activeUsers || 0,
      icon: Activity,
      color: 'purple' as const,
      trend: '+15%',
      trendUp: true,
    },
    {
      title: 'Actions (7j)',
      value: analytics?.actionsLast7Days || 0,
      icon: BarChart3,
      color: 'orange' as const,
      trend: '-5%',
      trendUp: false,
    },
  ];

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900" data-testid="text-dashboard-title">
          Tableau de bord Admin
        </h1>
        <p className="text-gray-600 mt-2" data-testid="text-dashboard-subtitle">
          Vue d'ensemble de votre plateforme HectorSalesAI
        </p>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <KPICard key={kpi.title} {...kpi} />
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Activité sur 30 jours
          </h2>
          <ActivityChart data={analytics?.activityChart || []} />
        </div>

        {/* Users Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Utilisateurs par entité
          </h2>
          <UsersChart data={analytics?.usersByEntity || []} />
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Activités récentes
          </h2>
          <Link
            href="/admin/audit-logs"
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            data-testid="link-view-all-activities"
          >
            Voir tout →
          </Link>
        </div>
        <RecentActivities logs={recentLogs || []} />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/admin/organizations"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow block"
          data-testid="link-quick-organizations"
        >
          <Building2 className="w-8 h-8 text-blue-600 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900">
            Gérer les Organisations
          </h3>
          <p className="text-gray-600 text-sm mt-2">
            Créer, modifier et gérer vos organisations
          </p>
        </Link>

        <Link
          href="/admin/teams"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow block"
          data-testid="link-quick-teams"
        >
          <Users className="w-8 h-8 text-green-600 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900">
            Gérer les Équipes
          </h3>
          <p className="text-gray-600 text-sm mt-2">
            Créer et gérer les équipes commerciales
          </p>
        </Link>

        <Link
          href="/admin/audit-logs"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow block"
          data-testid="link-quick-audit"
        >
          <Activity className="w-8 h-8 text-purple-600 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900">
            Historique d'Audit
          </h3>
          <p className="text-gray-600 text-sm mt-2">
            Consulter toutes les actions effectuées
          </p>
        </Link>
      </div>
    </div>
  );
}
