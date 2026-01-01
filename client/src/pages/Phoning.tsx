import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Phone, TrendingUp } from 'lucide-react';
import { PhoneDialer } from '@/components/phoning/PhoneDialer';
import { CallHistory } from '@/components/phoning/CallHistory';
import { ScriptViewer } from '@/components/phoning/ScriptViewer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { NavigationBar } from '@/components/NavigationBar';

interface Prospect {
  id: string;
  nom: string;
  prenom?: string;
  telephone?: string;
  raisonSociale?: string;
  enseigneCommerciale?: string;
}

export default function Phoning() {
  const [selectedProspectId, setSelectedProspectId] = useState<string | null>(null);

  const { data: prospects } = useQuery<Prospect[]>({
    queryKey: ['/api/crm/prospects'],
  });

  const prospectsList = prospects || [];
  const selectedProspect = prospectsList.find(p => p.id === selectedProspectId);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Phone className="w-8 h-8 text-primary" />
                Module Phoning
              </h1>
              <p className="text-muted-foreground mt-2">
                Appels assistés par intelligence artificielle
              </p>
            </div>
            <div className="flex items-center gap-2">
              <NavigationBar showHomeButton={true} />
              <Badge variant="secondary" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                {prospectsList.filter(p => p.telephone).length} prospects contactables
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Prospect Selection */}
        <Card className="mb-6" data-testid="card-prospect-selector">
          <CardHeader>
            <CardTitle>Sélectionner un prospect</CardTitle>
            <CardDescription>
              Choisissez le prospect à contacter pour générer un script personnalisé
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              value={selectedProspectId || ''}
              onValueChange={(value) => setSelectedProspectId(value)}
            >
              <SelectTrigger data-testid="select-prospect">
                <SelectValue placeholder="Choisir un prospect..." />
              </SelectTrigger>
              <SelectContent>
                {prospectsList
                  .filter(p => p.telephone)
                  .map((prospect) => (
                    <SelectItem 
                      key={prospect.id} 
                      value={prospect.id}
                      data-testid={`prospect-option-${prospect.id}`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-medium">
                          {prospect.prenom} {prospect.nom}
                        </span>
                        {(prospect.raisonSociale || prospect.enseigneCommerciale) && (
                          <span className="text-xs text-muted-foreground">
                            {prospect.raisonSociale || prospect.enseigneCommerciale}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {prospect.telephone}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedProspectId ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <PhoneDialer
                prospectId={selectedProspectId}
                prospectName={
                  selectedProspect
                    ? `${selectedProspect.prenom || ''} ${selectedProspect.nom}`.trim()
                    : undefined
                }
                prospectPhone={selectedProspect?.telephone}
              />
              <CallHistory prospectId={selectedProspectId} />
            </div>

            {/* Right Column */}
            <div>
              <ScriptViewer prospectId={selectedProspectId} />
            </div>
          </div>
        ) : (
          <div className="text-center py-20" data-testid="empty-state-no-selection">
            <Phone className="w-20 h-20 mx-auto mb-6 text-muted-foreground/20" />
            <h2 className="text-2xl font-semibold mb-2">
              Aucun prospect sélectionné
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Sélectionnez un prospect dans la liste ci-dessus pour démarrer un appel
              et accéder au script personnalisé généré par IA.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
