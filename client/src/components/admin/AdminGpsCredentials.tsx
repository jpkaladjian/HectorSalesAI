import { useState } from 'react';
import { Plus, Key, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ApiCredential {
  id: string;
  provider: 'google_maps' | 'openweather' | 'twilio';
  entityId: string;
  isActive: boolean;
  validationStatus: string | null;
  validationMessage: string | null;
  lastValidatedAt: string | null;
  monthlyQuota: number | null;
  currentUsage: number;
  createdAt: string;
}

const AdminGpsCredentials = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCred, setNewCred] = useState({
    provider: 'google_maps',
    entityId: 'global',
    apiKey: '',
    apiSecret: '',
    monthlyQuota: 10000,
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch credentials
  const { data: credentials, isLoading } = useQuery<ApiCredential[]>({
    queryKey: ['/api/admin/gps/credentials'],
    queryFn: async () => {
      const res = await fetch('/api/admin/gps/credentials');
      const json = await res.json();
      return json.data;
    },
  });

  // Create credential mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof newCred) => {
      return await apiRequest('POST', '/api/admin/gps/credentials', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/gps/credentials'] });
      setShowAddModal(false);
      setNewCred({
        provider: 'google_maps',
        entityId: 'global',
        apiKey: '',
        apiSecret: '',
        monthlyQuota: 10000,
      });
      toast({
        title: 'Succès',
        description: 'Credential API créé avec succès',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Erreur lors de la création',
        variant: 'destructive',
      });
    },
  });

  const handleCreate = () => {
    if (!newCred.apiKey) {
      toast({
        title: 'Erreur',
        description: 'Clé API requise',
        variant: 'destructive',
      });
      return;
    }
    createMutation.mutate(newCred);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const getProviderLabel = (provider: string) => {
    switch (provider) {
      case 'google_maps': return 'Google Maps Geocoding';
      case 'openweather': return 'OpenWeather';
      case 'twilio': return 'Twilio SMS';
      default: return provider;
    }
  };

  return (
    <div className="space-y-6" data-testid="admin-gps-credentials">
      {/* Header with Add button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Clés API Externes</h3>
          <p className="text-sm text-muted-foreground">
            Gérer les credentials pour géocodage, météo, notifications
          </p>
        </div>
        
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-credential">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter Credential
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouvelle Clé API</DialogTitle>
              <DialogDescription>
                Ajouter une clé API pour un service externe
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {/* Provider */}
              <div className="space-y-2">
                <Label>Service</Label>
                <Select
                  value={newCred.provider}
                  onValueChange={(value: any) => setNewCred({ ...newCred, provider: value })}
                >
                  <SelectTrigger data-testid="select-provider">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="google_maps">Google Maps Geocoding</SelectItem>
                    <SelectItem value="openweather">OpenWeather</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Entity */}
              <div className="space-y-2">
                <Label>Entité</Label>
                <Select
                  value={newCred.entityId}
                  onValueChange={(value) => setNewCred({ ...newCred, entityId: value })}
                >
                  <SelectTrigger data-testid="select-entity">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global">Global</SelectItem>
                    <SelectItem value="france">France</SelectItem>
                    <SelectItem value="luxembourg">Luxembourg</SelectItem>
                    <SelectItem value="belgique">Belgique</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* API Key */}
              <div className="space-y-2">
                <Label>Clé API</Label>
                <Input
                  type="password"
                  value={newCred.apiKey}
                  onChange={(e) => setNewCred({ ...newCred, apiKey: e.target.value })}
                  placeholder="Entrer la clé API..."
                  data-testid="input-api-key"
                />
              </div>

              {/* Monthly Quota */}
              <div className="space-y-2">
                <Label>Quota mensuel (optionnel)</Label>
                <Input
                  type="number"
                  value={newCred.monthlyQuota}
                  onChange={(e) => setNewCred({ ...newCred, monthlyQuota: parseInt(e.target.value) })}
                  data-testid="input-monthly-quota"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddModal(false)} data-testid="button-cancel-credential">
                Annuler
              </Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending} data-testid="button-create-credential">
                {createMutation.isPending ? 'Création...' : 'Créer'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Credentials List */}
      <div className="grid gap-4">
        {credentials && credentials.length > 0 ? (
          credentials.map(cred => (
            <Card key={cred.id} data-testid={`card-credential-${cred.id}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Key className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <CardTitle className="text-base">
                        {getProviderLabel(cred.provider)}
                      </CardTitle>
                      <CardDescription>
                        Entité: {cred.entityId}
                      </CardDescription>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {cred.isActive ? (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Actif
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <XCircle className="h-3 w-3" />
                        Inactif
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-2">
                {/* Validation Status */}
                {cred.validationStatus && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Validation:</span>
                    <Badge variant={cred.validationStatus === 'valid' ? 'default' : 'destructive'}>
                      {cred.validationStatus}
                    </Badge>
                  </div>
                )}

                {/* Usage */}
                {cred.monthlyQuota && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Utilisation:</span>
                    <span>
                      {cred.currentUsage.toLocaleString()} / {cred.monthlyQuota.toLocaleString()}
                      <span className="text-muted-foreground ml-1">
                        ({((cred.currentUsage / cred.monthlyQuota) * 100).toFixed(1)}%)
                      </span>
                    </span>
                  </div>
                )}

                {/* Last validated */}
                {cred.lastValidatedAt && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Dernière vérification:</span>
                    <span>{new Date(cred.lastValidatedAt).toLocaleString('fr-FR')}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Aucune clé API configurée
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminGpsCredentials;
