import { useState, useEffect } from 'react';
import { X, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface StatsModalProps {
  config: any;
  onClose: () => void;
}

interface ConfigStats {
  stats: {
    totalCalls: number;
    answerRate: number;
    totalDuration: number;
    avgDuration: number;
    rdvTaken: number;
  };
  users: Array<{
    id: string;
    name: string;
    callCount: number;
  }>;
}

const StatsModal = ({ config, onClose }: StatsModalProps) => {
  const { data: stats, isLoading } = useQuery<ConfigStats>({
    queryKey: ['/api/admin/phone/configurations', config.id, 'stats'],
    queryFn: async () => {
      const res = await fetch(`/api/admin/phone/configurations/${config.id}/stats`);
      const json = await res.json();
      return json.data;
    },
  });
  
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="p-8">
          <div className="text-center">Chargement des statistiques...</div>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" data-testid="stats-modal">
      <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border">
        <div className="sticky top-0 bg-background border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            📊 Statistiques - {config.twilioPhoneNumber}
          </h2>
          <Button onClick={onClose} variant="ghost" size="icon" data-testid="button-close-stats">
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Métriques principales */}
          <div>
            <h3 className="font-semibold mb-3">📅 Mois en cours</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="text-2xl font-bold" data-testid="stat-total-calls">
                  {stats?.stats.totalCalls || 0}
                </div>
                <div className="text-sm text-muted-foreground">Appels totaux</div>
              </Card>
              
              <Card className="p-4">
                <div className="text-2xl font-bold text-green-600" data-testid="stat-answer-rate">
                  {stats?.stats.answerRate || 0}%
                </div>
                <div className="text-sm text-muted-foreground">Taux de réponse</div>
              </Card>
              
              <Card className="p-4">
                <div className="text-2xl font-bold" data-testid="stat-total-duration">
                  {Math.floor((stats?.stats.totalDuration || 0) / 60)}min
                </div>
                <div className="text-sm text-muted-foreground">Durée totale</div>
              </Card>
              
              <Card className="p-4">
                <div className="text-2xl font-bold text-blue-600" data-testid="stat-rdv-taken">
                  {stats?.stats.rdvTaken || 0}
                </div>
                <div className="text-sm text-muted-foreground">RDV pris</div>
              </Card>
            </div>
          </div>
          
          {/* Qualité */}
          <div>
            <h3 className="font-semibold mb-3">🎯 Qualité</h3>
            <Card className="p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Score réputation</span>
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${
                    (config.reputationScore || 0) >= 70 ? 'text-green-600' :
                    (config.reputationScore || 0) >= 50 ? 'text-yellow-600' :
                    'text-red-600'
                  }`} data-testid="reputation-score">
                    {config.reputationScore || '-'}/100
                  </span>
                  {config.reputationScore && (
                    config.reputationScore >= 70 ? <TrendingUp className="text-green-600 h-5 w-5" /> :
                    config.reputationScore >= 50 ? <Minus className="text-yellow-600 h-5 w-5" /> :
                    <TrendingDown className="text-red-600 h-5 w-5" />
                  )}
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Signalements spam</span>
                <span className="font-semibold" data-testid="spam-reports">
                  {config.spamReports || 0}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Durée moyenne</span>
                <span className="font-semibold" data-testid="avg-duration">
                  {Math.floor(stats?.stats.avgDuration || 0)}s
                </span>
              </div>
            </Card>
          </div>
          
          {/* Commerciaux utilisateurs */}
          <div>
            <h3 className="font-semibold mb-3">👥 Commerciaux utilisateurs</h3>
            <Card className="divide-y">
              {stats?.users && stats.users.length > 0 ? (
                stats.users.map((user: any) => (
                  <div key={user.id} className="p-3 flex justify-between items-center">
                    <span>{user.name}</span>
                    <span className="text-muted-foreground">{user.callCount} appels</span>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  Aucun appel ce mois
                </div>
              )}
            </Card>
          </div>
          
          {/* Recommandation */}
          {config.reputationScore && config.reputationScore < 50 && (
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">💡 Recommandation</h3>
              <p className="text-sm text-red-700 dark:text-red-300">
                ⚠️ Score réputation critique. Actions recommandées :
              </p>
              <ul className="text-sm text-red-700 dark:text-red-300 mt-2 space-y-1">
                <li>• Activer numéro backup immédiatement</li>
                <li>• Former commerciaux : durée minimum 30s</li>
                <li>• Contacter opérateurs pour whitelisting</li>
              </ul>
            </div>
          )}
        </div>
        
        <div className="border-t p-4 flex justify-end">
          <Button onClick={onClose} variant="secondary" data-testid="button-close">
            Fermer
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StatsModal;
