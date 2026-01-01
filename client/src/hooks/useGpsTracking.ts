import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface GpsPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
  batteryLevel?: number;
}

interface UseGpsTrackingOptions {
  onPositionUpdate?: (position: GpsPosition) => void;
  onError?: (error: GeolocationPositionError) => void;
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

export function useGpsTracking(options: UseGpsTrackingOptions = {}) {
  const { toast } = useToast();
  const [isTracking, setIsTracking] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<GpsPosition | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [error, setError] = useState<string | null>(null);

  const checkPermission = useCallback(async () => {
    if (!('geolocation' in navigator)) {
      setError('Géolocalisation non disponible');
      return false;
    }

    if ('permissions' in navigator) {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        setPermissionStatus(result.state);
        
        result.addEventListener('change', () => {
          setPermissionStatus(result.state);
        });

        return result.state === 'granted' || result.state === 'prompt';
      } catch (err) {
        console.error('[useGpsTracking] Permission query error:', err);
      }
    }
    return true;
  }, []);

  const startTracking = useCallback(async () => {
    const hasPermission = await checkPermission();
    if (!hasPermission) {
      toast({
        title: 'Permission refusée',
        description: 'Veuillez autoriser la géolocalisation',
        variant: 'destructive',
      });
      return false;
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const gpsPos: GpsPosition = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date(position.timestamp),
        };

        setCurrentPosition(gpsPos);
        setError(null);
        options.onPositionUpdate?.(gpsPos);
      },
      (err) => {
        console.error('[useGpsTracking] Error:', err);
        setError(err.message);
        options.onError?.(err);
        setIsTracking(false);
      },
      {
        enableHighAccuracy: options.enableHighAccuracy ?? true,
        timeout: options.timeout ?? 10000,
        maximumAge: options.maximumAge ?? 0,
      }
    );

    setWatchId(id);
    setIsTracking(true);
    return true;
  }, [checkPermission, options, toast]);

  const stopTracking = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsTracking(false);
  }, [watchId]);

  const getCurrentPosition = useCallback(async (): Promise<GpsPosition | null> => {
    const hasPermission = await checkPermission();
    if (!hasPermission) return null;

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const gpsPos: GpsPosition = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date(position.timestamp),
          };
          resolve(gpsPos);
        },
        (err) => {
          reject(err);
        },
        {
          enableHighAccuracy: options.enableHighAccuracy ?? true,
          timeout: options.timeout ?? 10000,
          maximumAge: options.maximumAge ?? 0,
        }
      );
    });
  }, [checkPermission, options]);

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return {
    isTracking,
    currentPosition,
    permissionStatus,
    error,
    startTracking,
    stopTracking,
    getCurrentPosition,
  };
}
