import { useState } from 'react';
import { Phone, PhoneOff, Loader2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export interface PhoneDialerProps {
  prospectId: string;
  prospectName?: string;
  prospectPhone?: string;
  onCallStarted?: (callId: string) => void;
}

export function PhoneDialer({ 
  prospectId, 
  prospectName, 
  prospectPhone,
  onCallStarted 
}: PhoneDialerProps) {
  const [isInitiating, setIsInitiating] = useState(false);
  const [currentCall, setCurrentCall] = useState<{ id: string; status: string } | null>(null);
  const { toast } = useToast();

  const normalizePhoneNumber = (phone: string): string => {
    const cleaned = phone.replace(/\s/g, '');
    
    if (cleaned.startsWith('+')) {
      return cleaned;
    }
    
    if (cleaned.startsWith('0')) {
      return '+33' + cleaned.substring(1);
    }
    
    if (cleaned.startsWith('33')) {
      return '+' + cleaned;
    }
    
    return '+33' + cleaned;
  };

  const handleInitiateCall = async () => {
    try {
      setIsInitiating(true);
      
      if (!prospectPhone) {
        throw new Error('Numéro de téléphone requis');
      }

      const normalizedPhone = normalizePhoneNumber(prospectPhone);

      const response = await apiRequest('POST', '/api/phone/initiate', { 
        prospectId,
        phoneNumber: normalizedPhone
      });

      if (response.success && response.data) {
        setCurrentCall({ 
          id: response.data.callId, 
          status: response.data.status 
        });
        onCallStarted?.(response.data.callId);
        
        toast({
          title: 'Appel initié',
          description: `Appel en cours vers ${prospectName || 'le prospect'}`,
        });
      }
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible d\'initier l\'appel',
        variant: 'destructive',
      });
    } finally {
      setIsInitiating(false);
    }
  };

  const handleEndCall = async () => {
    if (!currentCall) return;

    try {
      await apiRequest('POST', `/api/phone/calls/${currentCall.id}/end`);

      setCurrentCall(null);
      toast({
        title: 'Appel terminé',
        description: 'L\'appel a été terminé avec succès',
      });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de terminer l\'appel',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card data-testid="card-phone-dialer">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="w-5 h-5 text-primary" />
          Téléphonie
        </CardTitle>
        <CardDescription>
          Initier un appel assisté par IA
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {prospectName && (
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg" data-testid="prospect-info">
            <User className="w-4 h-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="font-medium text-sm">{prospectName}</p>
              {prospectPhone && (
                <p className="text-xs text-muted-foreground">{prospectPhone}</p>
              )}
            </div>
          </div>
        )}

        {currentCall ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">Appel en cours</span>
              </div>
              <Badge variant="secondary" data-testid="badge-call-status">
                {currentCall.status}
              </Badge>
            </div>

            <Button
              onClick={handleEndCall}
              variant="destructive"
              className="w-full"
              data-testid="button-end-call"
            >
              <PhoneOff className="w-4 h-4 mr-2" />
              Terminer l'appel
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleInitiateCall}
            disabled={isInitiating || !prospectPhone}
            className="w-full"
            data-testid="button-initiate-call"
          >
            {isInitiating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Connexion...
              </>
            ) : (
              <>
                <Phone className="w-4 h-4 mr-2" />
                Démarrer l'appel
              </>
            )}
          </Button>
        )}

        {!prospectPhone && (
          <p className="text-xs text-muted-foreground text-center">
            Numéro de téléphone requis pour initier un appel
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function PhoneDialerSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
}
