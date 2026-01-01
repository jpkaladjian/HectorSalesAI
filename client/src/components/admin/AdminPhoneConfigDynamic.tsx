import { useState, useMemo } from 'react';
import { 
  Plus, 
  Power, 
  PowerOff, 
  Trash2, 
  BarChart3,
  AlertCircle,
  CheckCircle,
  Phone,
  MapPin,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AddConfigModal } from './AddConfigModal';
import StatsModal from './StatsModal';

interface PhoneConfig {
  id: string;
  entity: 'france' | 'luxembourg' | 'belgique';
  agencyLocation: string;
  agencyName: string;
  displayName: string | null;
  twilioPhoneNumber: string;
  isActive: boolean;
  isBackup: boolean;
  isPrimary: boolean;
  rotationPriority: number;
  reputationScore: number | null;
  spamReports: number;
  createdAt: string;
  lastActivatedAt: string | null;
  lastDeactivatedAt: string | null;
  deactivationReason: string | null;
}

interface GroupedConfigs {
  entity: string;
  agencies: {
    location: string;
    name: string;
    configs: PhoneConfig[];
  }[];
}

const AdminPhoneConfigDynamic = () => {
  const [selectedEntity, setSelectedEntity] = useState<string>('france');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<PhoneConfig | null>(null);
  
  const queryClient = useQueryClient();
  
  // Fetch all configurations
  const { data: configs, isLoading } = useQuery<PhoneConfig[]>({
    queryKey: ['/api/admin/phone/configurations'],
    queryFn: async () => {
      const res = await fetch('/api/admin/phone/configurations');
      const json = await res.json();
      return json.data as PhoneConfig[];
    },
  });
  
  // Mutation: Activate
  const activateMutation = useMutation({
    mutationFn: async ({ id, deactivateOthers }: { id: string; deactivateOthers: boolean }) => {
      return await apiRequest('PATCH', `/api/admin/phone/configurations/${id}/activate`, {
        deactivateOthers,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/phone/configurations'] });
      toast({
        title: 'Succès',
        description: 'Configuration activée avec succès',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Erreur lors de l\'activation',
        variant: 'destructive',
      });
    },
  });
  
  // Mutation: Deactivate
  const deactivateMutation = useMutation({
    mutationFn: async ({ id, reason, activateBackup }: { 
      id: string; 
      reason: string; 
      activateBackup: boolean;
    }) => {
      return await apiRequest('PATCH', `/api/admin/phone/configurations/${id}/deactivate`, {
        reason,
        activateBackup,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/phone/configurations'] });
      toast({
        title: 'Succès',
        description: 'Configuration désactivée avec succès',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Erreur lors de la désactivation',
        variant: 'destructive',
      });
    },
  });
  
  // Mutation: Delete
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/admin/phone/configurations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/phone/configurations'] });
      toast({
        title: 'Succès',
        description: 'Configuration supprimée avec succès',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Erreur lors de la suppression',
        variant: 'destructive',
      });
    },
  });

  // Group configurations by entity and agency
  const groupedConfigs: GroupedConfigs[] = useMemo(() => {
    if (!configs) return [];
    
    const entities = ['france', 'luxembourg', 'belgique'];
    
    return entities.map(entity => {
      const entityConfigs = configs.filter(c => c.entity === entity);
      
      // Group by agency
      const agencies = Array.from(
        new Set(entityConfigs.map(c => c.agencyLocation))
      ).map(location => {
        const agencyConfigs = entityConfigs.filter(c => c.agencyLocation === location);
        return {
          location,
          name: agencyConfigs[0]?.agencyName || location,
          configs: agencyConfigs.sort((a, b) => a.rotationPriority - b.rotationPriority),
        };
      });
      
      return {
        entity,
        agencies,
      };
    });
  }, [configs]);

  // Handler: Activate config
  const handleActivate = (config: PhoneConfig) => {
    if (confirm(`Activer ${config.twilioPhoneNumber} ?\n\nCela désactivera automatiquement les autres numéros de l'agence ${config.agencyName}.`)) {
      activateMutation.mutate({
        id: config.id,
        deactivateOthers: true,
      });
    }
  };
  
  // Handler: Deactivate config
  const handleDeactivate = (config: PhoneConfig) => {
    const reason = prompt('Raison de la désactivation (minimum 3 caractères):');
    if (!reason || reason.length < 3) return;
    
    const activateBackup = confirm(
      'Activer automatiquement le numéro backup de cette agence ?'
    );
    
    deactivateMutation.mutate({
      id: config.id,
      reason,
      activateBackup,
    });
  };
  
  // Handler: Delete config
  const handleDelete = (config: PhoneConfig) => {
    if (confirm(
      `⚠️ SUPPRIMER ${config.twilioPhoneNumber} ?\n\n` +
      `L'historique des appels sera conservé mais le numéro ne sera plus utilisable.\n\n` +
      `Cette action est IRRÉVERSIBLE.`
    )) {
      deleteMutation.mutate(config.id);
    }
  };
  
  // Handler: View stats
  const handleViewStats = (config: PhoneConfig) => {
    setSelectedConfig(config);
    setShowStatsModal(true);
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-lg text-muted-foreground">Chargement des configurations...</div>
      </div>
    );
  }
  
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">📞 Gestion Numéros Twilio</h1>
          <p className="text-muted-foreground mt-2">
            Gérer les numéros Twilio par agence avec rotation intelligente
          </p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          data-testid="button-add-config"
        >
          <Plus className="mr-2 h-4 w-4" />
          Ajouter numéro
        </Button>
      </div>
      
      {/* Tabs entities */}
      <div className="flex gap-2 mb-6">
        {['france', 'luxembourg', 'belgique'].map(entity => (
          <Button
            key={entity}
            onClick={() => setSelectedEntity(entity)}
            variant={selectedEntity === entity ? 'default' : 'outline'}
            data-testid={`button-entity-${entity}`}
          >
            {entity === 'france' && '🇫🇷 France'}
            {entity === 'luxembourg' && '🇱🇺 Luxembourg'}
            {entity === 'belgique' && '🇧🇪 Belgique'}
          </Button>
        ))}
      </div>
      
      {/* Configurations par agence */}
      {groupedConfigs
        .filter(g => g.entity === selectedEntity)
        .map(group => (
          <div key={group.entity} className="space-y-6">
            {group.agencies.length === 0 && (
              <Card className="p-12">
                <div className="text-center text-muted-foreground">
                  <Phone className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">
                    Aucun numéro configuré pour {group.entity}
                  </p>
                  <p className="text-sm mb-4">
                    Ajoutez votre premier numéro Twilio pour cette entité
                  </p>
                  <Button onClick={() => setShowAddModal(true)} variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter le premier numéro
                  </Button>
                </div>
              </Card>
            )}
            
            {group.agencies.map(agency => (
              <Card key={agency.location} className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="text-primary" size={24} />
                  <h2 className="text-xl font-semibold">{agency.name}</h2>
                  <Badge variant="secondary">
                    {agency.configs.length} numéro{agency.configs.length > 1 ? 's' : ''}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  {agency.configs.map(config => (
                    <ConfigCard
                      key={config.id}
                      config={config}
                      onActivate={() => handleActivate(config)}
                      onDeactivate={() => handleDeactivate(config)}
                      onDelete={() => handleDelete(config)}
                      onViewStats={() => handleViewStats(config)}
                    />
                  ))}
                </div>
                
                <Button
                  onClick={() => setShowAddModal(true)}
                  variant="ghost"
                  size="sm"
                  className="mt-4"
                  data-testid={`button-add-backup-${agency.location}`}
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Ajouter numéro backup pour {agency.name}
                </Button>
              </Card>
            ))}
          </div>
        ))}
      
      {/* Modals */}
      <AddConfigModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false);
          queryClient.invalidateQueries({ queryKey: ['/api/admin/phone/configurations'] });
        }}
      />
      
      {showStatsModal && selectedConfig && (
        <StatsModal
          config={selectedConfig}
          onClose={() => {
            setShowStatsModal(false);
            setSelectedConfig(null);
          }}
        />
      )}
    </div>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ConfigCard Component
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface ConfigCardProps {
  config: PhoneConfig;
  onActivate: () => void;
  onDeactivate: () => void;
  onDelete: () => void;
  onViewStats: () => void;
}

const ConfigCard = ({
  config,
  onActivate,
  onDeactivate,
  onDelete,
  onViewStats,
}: ConfigCardProps) => {
  // Badge réputation
  const reputationBadge = () => {
    if (config.reputationScore === null) {
      return <span className="text-sm text-muted-foreground">Score non vérifié</span>;
    }
    
    const score = config.reputationScore;
    let variant: "default" | "secondary" | "destructive" | "outline" = "default";
    let icon = <CheckCircle className="h-4 w-4" />;
    
    if (score < 50) {
      variant = "destructive";
      icon = <AlertCircle className="h-4 w-4" />;
    } else if (score < 70) {
      variant = "secondary";
      icon = <AlertCircle className="h-4 w-4" />;
    }
    
    return (
      <Badge variant={variant} className="gap-1">
        {icon}
        <span>{score}/100</span>
      </Badge>
    );
  };
  
  return (
    <div 
      className={`border rounded-lg p-4 ${
        config.isActive 
          ? 'border-green-500 bg-green-50 dark:bg-green-950' 
          : 'border-border bg-muted/50'
      }`}
      data-testid={`config-card-${config.id}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          {/* Status indicator */}
          <div className="flex items-center gap-2">
            {config.isActive ? (
              <Power className="text-green-600" size={20} data-testid={`status-active-${config.id}`} />
            ) : (
              <PowerOff className="text-muted-foreground" size={20} data-testid={`status-inactive-${config.id}`} />
            )}
            <Phone className="text-muted-foreground" size={20} />
          </div>
          
          {/* Number info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-lg font-semibold" data-testid={`phone-number-${config.id}`}>
                {config.twilioPhoneNumber}
              </span>
              <Badge variant={config.isActive ? "default" : "secondary"}>
                {config.isActive ? 'ACTIF' : config.isBackup ? 'BACKUP' : 'INACTIF'}
              </Badge>
              {config.isPrimary && (
                <Badge variant="outline">PRINCIPAL</Badge>
              )}
            </div>
            {config.displayName && (
              <div className="text-sm text-muted-foreground mt-1">
                {config.displayName}
              </div>
            )}
          </div>
        </div>
        
        {/* Reputation & Actions */}
        <div className="flex items-center gap-4">
          {reputationBadge()}
          
          <div className="flex gap-2">
            {config.isActive ? (
              <Button
                onClick={onDeactivate}
                variant="ghost"
                size="icon"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                title="Désactiver"
                data-testid={`button-deactivate-${config.id}`}
              >
                <PowerOff className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={onActivate}
                variant="ghost"
                size="icon"
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                title="Activer"
                data-testid={`button-activate-${config.id}`}
              >
                <Power className="h-4 w-4" />
              </Button>
            )}
            
            <Button
              onClick={onViewStats}
              variant="ghost"
              size="icon"
              title="Statistiques"
              data-testid={`button-stats-${config.id}`}
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
            
            <Button
              onClick={onDelete}
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive"
              title="Supprimer"
              data-testid={`button-delete-${config.id}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Additional info */}
      {!config.isActive && config.lastDeactivatedAt && (
        <div className="mt-3 text-sm text-muted-foreground bg-background p-2 rounded">
          Désactivé le {new Date(config.lastDeactivatedAt).toLocaleDateString('fr-FR')}
          {config.deactivationReason && ` • Raison: ${config.deactivationReason}`}
        </div>
      )}
      
      {config.spamReports > 0 && (
        <div className="mt-2 text-sm text-red-600 flex items-center gap-1">
          <AlertCircle size={16} />
          {config.spamReports} signalement{config.spamReports > 1 ? 's' : ''} spam
        </div>
      )}
    </div>
  );
};

export default AdminPhoneConfigDynamic;
