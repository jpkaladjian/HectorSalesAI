import { useQuery } from '@tanstack/react-query';
import { History, Phone, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Call {
  id: string;
  prospectId: string;
  prospectName?: string;
  prospectPhone?: string;
  status: 'queued' | 'ringing' | 'in-progress' | 'completed' | 'failed' | 'busy' | 'no-answer';
  duration: number | null;
  recordingUrl: string | null;
  transcription: string | null;
  createdAt: string;
}

export function CallHistory({ prospectId }: { prospectId?: string }) {
  const { data, isLoading } = useQuery<{ calls: Call[] }>({
    queryKey: prospectId ? ['/api/phone/calls', { prospectId }] : ['/api/phone/calls'],
  });

  const getStatusIcon = (status: Call['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
      case 'busy':
      case 'no-answer': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'in-progress':
      case 'ringing': return <Phone className="w-4 h-4 text-blue-600 animate-pulse" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusLabel = (status: Call['status']) => {
    const labels = {
      'queued': 'En attente',
      'ringing': 'Sonnerie',
      'in-progress': 'En cours',
      'completed': 'Terminé',
      'failed': 'Échoué',
      'busy': 'Occupé',
      'no-answer': 'Pas de réponse',
    };
    return labels[status] || status;
  };

  const getStatusVariant = (status: Call['status']): "default" | "secondary" | "destructive" | "outline" => {
    if (status === 'completed') return 'default';
    if (['failed', 'busy', 'no-answer'].includes(status)) return 'destructive';
    return 'secondary';
  };

  if (isLoading) {
    return <CallHistorySkeleton />;
  }

  const calls = data?.calls || [];

  return (
    <Card data-testid="card-call-history">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          Historique d'appels
        </CardTitle>
        <CardDescription>
          {calls.length} appel{calls.length > 1 ? 's' : ''} enregistré{calls.length > 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {calls.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground" data-testid="empty-state">
            <Phone className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>Aucun appel enregistré</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {calls.map((call) => (
                <div
                  key={call.id}
                  className="flex items-start gap-3 p-3 rounded-lg border hover-elevate active-elevate-2 transition-colors"
                  data-testid={`call-item-${call.id}`}
                >
                  <div className="mt-1">
                    {getStatusIcon(call.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="font-medium text-sm truncate">
                        {call.prospectName || call.prospectPhone || 'Prospect inconnu'}
                      </p>
                      <Badge variant={getStatusVariant(call.status)} className="text-xs">
                        {getStatusLabel(call.status)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>
                        {formatDistanceToNow(new Date(call.createdAt), { 
                          addSuffix: true, 
                          locale: fr 
                        })}
                      </span>
                      {call.duration !== null && call.duration > 0 && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {Math.floor(call.duration / 60)}:{(call.duration % 60).toString().padStart(2, '0')}
                        </span>
                      )}
                    </div>
                    {call.transcription && (
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                        {call.transcription}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

export function CallHistorySkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-32" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-3 p-3">
              <Skeleton className="w-4 h-4 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
