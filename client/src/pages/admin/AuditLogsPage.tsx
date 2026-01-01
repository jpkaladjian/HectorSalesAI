import { useState } from 'react';
import { useAuditLogs, useAuditLogsStats } from '@/hooks/admin/useAuditLogs';
import { auditLogsApi } from '@/services/admin/auditLogsApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download, Filter, RefreshCw, Activity, Users, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function AuditLogsPage() {
  const [filters, setFilters] = useState<{
    action?: string;
    entityType?: string;
    limit: number;
  }>({
    limit: 50,
  });

  const { data: logs, isLoading, refetch } = useAuditLogs(filters);
  const { data: stats } = useAuditLogsStats();
  const { toast } = useToast();

  const handleExport = async () => {
    try {
      await auditLogsApi.exportCSV(filters);
      toast({
        title: 'Export réussi',
        description: 'Les logs ont été exportés en CSV',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'exporter les logs',
        variant: 'destructive',
      });
    }
  };

  const getActionBadge = (action: string) => {
    const colors: Record<string, string> = {
      CREATE: 'bg-green-500',
      UPDATE: 'bg-blue-500',
      DELETE: 'bg-red-500',
      LOGIN: 'bg-purple-500',
      LOGOUT: 'bg-gray-500',
    };
    return colors[action] || 'bg-gray-500';
  };

  const getStatusBadge = (status: string | null) => {
    if (status === 'success') return 'default';
    if (status === 'error') return 'destructive';
    return 'secondary';
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="title-audit-logs">Audit Logs</h1>
        <p className="text-muted-foreground">
          Traçabilité complète de toutes les actions administratives
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-total">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Actions</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-actions">
                {Object.keys(stats.byAction).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-users">
                {Object.keys(stats.byUser).length}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres
          </CardTitle>
          <CardDescription>
            Filtrer les logs par action, type d'entité
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Action</Label>
              <Select
                value={filters.action || '__all__'}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    action: value === '__all__' ? undefined : value,
                  })
                }
                data-testid="select-filter-action"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Toutes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Toutes</SelectItem>
                  <SelectItem value="CREATE">CREATE</SelectItem>
                  <SelectItem value="UPDATE">UPDATE</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                  <SelectItem value="LOGIN">LOGIN</SelectItem>
                  <SelectItem value="LOGOUT">LOGOUT</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Type d'entité</Label>
              <Select
                value={filters.entityType || '__all__'}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    entityType: value === '__all__' ? undefined : value,
                  })
                }
                data-testid="select-filter-entity-type"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Tous</SelectItem>
                  <SelectItem value="organization">Organization</SelectItem>
                  <SelectItem value="team">Team</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="prospect">Prospect</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Limite</Label>
              <Select
                value={filters.limit.toString()}
                onValueChange={(value) =>
                  setFilters({ ...filters, limit: parseInt(value) })
                }
                data-testid="select-filter-limit"
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25 logs</SelectItem>
                  <SelectItem value="50">50 logs</SelectItem>
                  <SelectItem value="100">100 logs</SelectItem>
                  <SelectItem value="200">200 logs</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              onClick={() => refetch()}
              variant="outline"
              size="sm"
              data-testid="button-refresh"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
            <Button
              onClick={handleExport}
              variant="outline"
              size="sm"
              data-testid="button-export-csv"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Logs d'audit</CardTitle>
          <CardDescription>
            {logs?.length || 0} logs affichés
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : logs && logs.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Entité</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>IP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id} data-testid={`row-log-${log.id}`}>
                      <TableCell className="text-sm">
                        {new Date(log.createdAt).toLocaleString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{log.userName || 'N/A'}</span>
                          <span className="text-xs text-muted-foreground">
                            {log.userEmail}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={getActionBadge(log.action)}
                          data-testid={`badge-action-${log.action}`}
                        >
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {log.entityType || 'N/A'}
                      </TableCell>
                      <TableCell className="text-sm max-w-xs truncate">
                        {log.entityName || log.entityId || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadge(log.status)}>
                          {log.status || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {log.ipAddress || 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Aucun log trouvé
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
