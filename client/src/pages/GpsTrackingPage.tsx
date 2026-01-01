import { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { NavigationBar } from '@/components/NavigationBar';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { 
  MapPin, 
  Activity, 
  Battery, 
  Signal, 
  Navigation, 
  AlertCircle,
  Target,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const GPS_QUEUE_DB = 'gps-queue';
const GPS_QUEUE_STORE = 'pending-positions';

interface GpsPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
  batteryLevel?: number;
}

interface Opportunity {
  id: number;
  prospectName: string;
  distance: number;
  address: string;
  priority: string;
}

export default function GpsTrackingPage() {
  const { toast } = useToast();
  const [isTracking, setIsTracking] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<GpsPosition | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [watchId, setWatchId] = useState<number | null>(null);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);

  const { data: opportunities = [] } = useQuery<Opportunity[]>({
    queryKey: ['/api/gps/opportunities'],
    refetchInterval: isTracking ? 60000 : false,
  });

  const trackMutation = useMutation({
    mutationFn: async (position: GpsPosition) => {
      return apiRequest('POST', '/api/gps/track', {
        latitude: position.latitude,
        longitude: position.longitude,
        accuracy: position.accuracy,
        batteryLevel: position.batteryLevel || batteryLevel,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gps/opportunities'] });
    },
    onError: async (error: Error, position: GpsPosition) => {
      console.error('[GPS Track] Error:', error);
      
      await savePositionToQueue({
        latitude: position.latitude,
        longitude: position.longitude,
        accuracy: position.accuracy,
        batteryLevel: position.batteryLevel || batteryLevel || null,
      });
      
      await triggerBackgroundSync();
      
      toast({
        title: 'Hors ligne',
        description: 'Position sauvegardée localement, sera synchronisée automatiquement',
        variant: 'default',
      });
    },
  });

  useEffect(() => {
    checkGeolocationPermission();
    checkBatteryLevel();
  }, []);

  const checkGeolocationPermission = async () => {
    if (!('geolocation' in navigator)) {
      toast({
        title: 'Géolocalisation indisponible',
        description: 'Votre navigateur ne supporte pas la géolocalisation',
        variant: 'destructive',
      });
      return;
    }

    if ('permissions' in navigator) {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        setPermissionStatus(result.state);
        result.addEventListener('change', () => setPermissionStatus(result.state));
      } catch (error) {
        console.error('[GPS] Permission query error:', error);
      }
    }
  };

  const checkBatteryLevel = async () => {
    if ('getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery();
        setBatteryLevel(Math.round(battery.level * 100));
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
      } catch (error) {
        console.error('[GPS] Battery API error:', error);
      }
    }
  };

  const startTracking = () => {
    if (!('geolocation' in navigator)) {
      toast({
        title: 'Erreur',
        description: 'Géolocalisation non disponible',
        variant: 'destructive',
      });
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const gpsPos: GpsPosition = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date(position.timestamp),
          batteryLevel: batteryLevel || undefined,
        };
        
        setCurrentPosition(gpsPos);
        trackMutation.mutate(gpsPos);
      },
      (error) => {
        console.error('[GPS] Geolocation error:', error);
        toast({
          title: 'Erreur géolocalisation',
          description: error.message,
          variant: 'destructive',
        });
        setIsTracking(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    setWatchId(id);
    setIsTracking(true);
    toast({
      title: 'Tracking activé',
      description: 'Votre position est maintenant suivie',
    });
  };

  const stopTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsTracking(false);
    toast({
      title: 'Tracking désactivé',
      description: 'Votre position n\'est plus suivie',
    });
  };

  const handleTrackingToggle = (checked: boolean) => {
    if (checked) {
      startTracking();
    } else {
      stopTracking();
    }
  };

  const getAccuracyColor = (accuracy?: number) => {
    if (!accuracy) return 'text-muted-foreground';
    if (accuracy < 10) return 'text-green-500';
    if (accuracy < 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'haute':
        return 'bg-red-500';
      case 'moyenne':
        return 'bg-yellow-500';
      case 'basse':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const savePositionToQueue = async (data: any) => {
    try {
      const db = await openDatabase();
      const tx = db.transaction(GPS_QUEUE_STORE, 'readwrite');
      const store = tx.objectStore(GPS_QUEUE_STORE);
      
      await store.add({
        data: data,
        timestamp: Date.now(),
      });
      
      console.log('[GPS Page] Position saved to IndexedDB queue');
    } catch (error) {
      console.error('[GPS Page] Failed to save to queue:', error);
    }
  };

  const triggerBackgroundSync = async () => {
    if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('sync-gps-positions');
        console.log('[GPS Page] Background sync triggered');
      } catch (error) {
        console.error('[GPS Page] Background sync failed:', error);
        
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({ type: 'SYNC_NOW' });
        }
      }
    }
  };

  const openDatabase = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(GPS_QUEUE_DB, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(GPS_QUEUE_STORE)) {
          db.createObjectStore(GPS_QUEUE_STORE, { 
            keyPath: 'id', 
            autoIncrement: true 
          });
        }
      };
    });
  };

  return (
    <div className="min-h-screen bg-background p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold" data-testid="text-page-title">GPS Tracking</h1>
          {isTracking && (
            <Badge variant="default" className="flex items-center gap-1" data-testid="badge-tracking-status">
              <Activity className="h-3 w-3 animate-pulse" />
              Actif
            </Badge>
          )}
        </div>
        <NavigationBar showHomeButton={true} />
      </div>

      <Card data-testid="card-tracking-control">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5" />
                Contrôle Tracking
              </CardTitle>
              <CardDescription>
                Activez le suivi de votre position
              </CardDescription>
            </div>
            <Switch
              checked={isTracking}
              onCheckedChange={handleTrackingToggle}
              disabled={permissionStatus === 'denied'}
              data-testid="switch-tracking-toggle"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {permissionStatus === 'denied' && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-md" data-testid="alert-permission-denied">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm text-destructive">
                Permission géolocalisation refusée. Veuillez l'activer dans les paramètres.
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Latitude</div>
              <div className="font-mono text-sm" data-testid="text-latitude">
                {currentPosition ? currentPosition.latitude.toFixed(6) : '---'}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Longitude</div>
              <div className="font-mono text-sm" data-testid="text-longitude">
                {currentPosition ? currentPosition.longitude.toFixed(6) : '---'}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <Signal className="h-3 w-3" />
                Précision
              </div>
              <div 
                className={`font-mono text-sm ${getAccuracyColor(currentPosition?.accuracy)}`}
                data-testid="text-accuracy"
              >
                {currentPosition ? `±${currentPosition.accuracy.toFixed(0)}m` : '---'}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <Battery className="h-3 w-3" />
                Batterie
              </div>
              <div className="font-mono text-sm" data-testid="text-battery">
                {batteryLevel !== null ? `${batteryLevel}%` : '---'}
              </div>
            </div>
          </div>

          {currentPosition && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground" data-testid="text-last-update">
              <Clock className="h-3 w-3" />
              Dernière mise à jour : {format(currentPosition.timestamp, 'HH:mm:ss', { locale: fr })}
            </div>
          )}
        </CardContent>
      </Card>

      {opportunities.length > 0 && (
        <Card data-testid="card-opportunities">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Opportunités à proximité
            </CardTitle>
            <CardDescription>
              {opportunities.length} prospect{opportunities.length > 1 ? 's' : ''} détecté{opportunities.length > 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {opportunities.map((opp) => (
                <div
                  key={opp.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover-elevate active-elevate-2"
                  data-testid={`opportunity-item-${opp.id}`}
                >
                  <div className="flex-1 space-y-1">
                    <div className="font-medium" data-testid={`text-prospect-name-${opp.id}`}>
                      {opp.prospectName}
                    </div>
                    <div className="text-sm text-muted-foreground" data-testid={`text-address-${opp.id}`}>
                      <MapPin className="h-3 w-3 inline mr-1" />
                      {opp.address}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={getPriorityColor(opp.priority)}
                      data-testid={`badge-priority-${opp.id}`}
                    >
                      {opp.priority}
                    </Badge>
                    <div className="text-sm font-medium" data-testid={`text-distance-${opp.id}`}>
                      {opp.distance.toFixed(1)} km
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!isTracking && opportunities.length === 0 && (
        <Card data-testid="card-no-opportunities">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Activez le tracking pour détecter les opportunités à proximité
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
