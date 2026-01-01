import { useState } from 'react';
import { Settings, Save, RefreshCw } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface GpsConfig {
  id: string;
  entityId: string;
  trackingEnabled: boolean;
  trackingFrequencyMinutes: number;
  trackingHoursStart: string;
  trackingHoursEnd: string;
  opportunitiesEnabled: boolean;
  opportunitiesRadiusKm: string;
  weeklyReportsEnabled: boolean;
  geocodingEnabled: boolean;
  dataRetentionDays: number;
}

const AdminGpsConfig = () => {
  const [selectedEntity, setSelectedEntity] = useState<string>('france');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch GPS config
  const { data: config, isLoading } = useQuery<GpsConfig>({
    queryKey: ['/api/admin/gps/config', selectedEntity],
    queryFn: async () => {
      const res = await fetch(`/api/admin/gps/config/${selectedEntity}`);
      const json = await res.json();
      return json.data;
    },
  });

  // Update config mutation
  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<GpsConfig>) => {
      return await apiRequest('PUT', `/api/admin/gps/config/${selectedEntity}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/gps/config', selectedEntity] });
      toast({
        title: 'Succès',
        description: 'Configuration GPS mise à jour',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Erreur lors de la mise à jour',
        variant: 'destructive',
      });
    },
  });

  const handleToggle = (field: keyof GpsConfig, value: boolean) => {
    updateMutation.mutate({ [field]: value });
  };

  const handleSave = (field: keyof GpsConfig, value: any) => {
    updateMutation.mutate({ [field]: value });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!config) {
    return <div className="p-8 text-center">Configuration GPS non trouvée</div>;
  }

  return (
    <div className="space-y-6" data-testid="admin-gps-config">
      {/* Entity selector */}
      <div className="flex items-center gap-4">
        <Label>Entité :</Label>
        <div className="flex gap-2">
          {['global', 'france', 'luxembourg', 'belgique'].map(entity => (
            <Badge
              key={entity}
              variant={selectedEntity === entity ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSelectedEntity(entity)}
              data-testid={`badge-entity-${entity}`}
            >
              {entity.charAt(0).toUpperCase() + entity.slice(1)}
            </Badge>
          ))}
        </div>
      </div>

      {/* Tracking Configuration */}
      <Card data-testid="card-tracking-config">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuration Tracking GPS
          </CardTitle>
          <CardDescription>
            Paramètres de suivi de position pour {selectedEntity}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tracking enabled */}
          <div className="flex items-center justify-between">
            <Label>Tracking GPS activé</Label>
            <Switch
              checked={config.trackingEnabled}
              onCheckedChange={(checked) => handleToggle('trackingEnabled', checked)}
              data-testid="switch-tracking-enabled"
            />
          </div>

          {/* Tracking frequency */}
          <div className="space-y-2">
            <Label>Fréquence tracking (minutes)</Label>
            <Input
              type="number"
              value={config.trackingFrequencyMinutes}
              onChange={(e) => handleSave('trackingFrequencyMinutes', parseInt(e.target.value))}
              min={1}
              max={60}
              data-testid="input-tracking-frequency"
            />
            <p className="text-sm text-muted-foreground">
              Capturer position toutes les {config.trackingFrequencyMinutes} minutes
            </p>
          </div>

          {/* Tracking hours */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Heure début</Label>
              <Input
                type="time"
                value={config.trackingHoursStart}
                onChange={(e) => handleSave('trackingHoursStart', e.target.value)}
                data-testid="input-hours-start"
              />
            </div>
            <div className="space-y-2">
              <Label>Heure fin</Label>
              <Input
                type="time"
                value={config.trackingHoursEnd}
                onChange={(e) => handleSave('trackingHoursEnd', e.target.value)}
                data-testid="input-hours-end"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Opportunities Configuration */}
      <Card data-testid="card-opportunities-config">
        <CardHeader>
          <CardTitle>Détection Opportunités</CardTitle>
          <CardDescription>
            Alertes automatiques quand un commercial est proche d'un prospect
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Opportunities enabled */}
          <div className="flex items-center justify-between">
            <Label>Opportunités activées</Label>
            <Switch
              checked={config.opportunitiesEnabled}
              onCheckedChange={(checked) => handleToggle('opportunitiesEnabled', checked)}
              data-testid="switch-opportunities-enabled"
            />
          </div>

          {/* Radius */}
          <div className="space-y-2">
            <Label>Rayon détection (km)</Label>
            <Input
              type="number"
              value={parseFloat(config.opportunitiesRadiusKm)}
              onChange={(e) => handleSave('opportunitiesRadiusKm', e.target.value)}
              min={1}
              max={50}
              step={0.5}
              data-testid="input-opportunities-radius"
            />
            <p className="text-sm text-muted-foreground">
              Alerter si prospect à moins de {config.opportunitiesRadiusKm} km
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Other Settings */}
      <Card data-testid="card-other-settings">
        <CardHeader>
          <CardTitle>Paramètres Avancés</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Weekly reports */}
          <div className="flex items-center justify-between">
            <Label>Rapports hebdomadaires automatiques</Label>
            <Switch
              checked={config.weeklyReportsEnabled}
              onCheckedChange={(checked) => handleToggle('weeklyReportsEnabled', checked)}
              data-testid="switch-weekly-reports"
            />
          </div>

          {/* Geocoding */}
          <div className="flex items-center justify-between">
            <Label>Géocodage automatique (adresse)</Label>
            <Switch
              checked={config.geocodingEnabled}
              onCheckedChange={(checked) => handleToggle('geocodingEnabled', checked)}
              data-testid="switch-geocoding"
            />
          </div>

          {/* Data retention */}
          <div className="space-y-2">
            <Label>Rétention données (jours)</Label>
            <Input
              type="number"
              value={config.dataRetentionDays}
              onChange={(e) => handleSave('dataRetentionDays', parseInt(e.target.value))}
              min={7}
              max={365}
              data-testid="input-data-retention"
            />
            <p className="text-sm text-muted-foreground">
              Supprimer positions GPS après {config.dataRetentionDays} jours
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminGpsConfig;
