import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Battery, Target, Phone, Mail } from 'lucide-react';

interface UserPosition {
  id: string;
  userId: string;
  latitude: string;
  longitude: string;
  accuracy: number;
  capturedAt: string;
  address: string | null;
  batteryLevel: number | null;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
    phone: string | null;
    entity: string | null;
  };
  timeAgo: string;
  isRecent: boolean;
}

interface SupervisionMapProps {
  positions: UserPosition[];
}

function MapBoundsUpdater({ positions }: { positions: UserPosition[] }) {
  const map = useMap();

  useEffect(() => {
    if (positions.length === 0) return;

    const bounds = L.latLngBounds(
      positions.map(p => [parseFloat(p.latitude), parseFloat(p.longitude)])
    );
    
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
  }, [positions, map]);

  return null;
}

const getMarkerIcon = (isRecent: boolean, entity: string | null) => {
  let color = '#6b7280';
  if (isRecent) {
    switch(entity) {
      case 'france': color = '#3b82f6'; break;
      case 'luxembourg': color = '#10b981'; break;
      case 'belgique': color = '#f59e0b'; break;
      default: color = '#8b5cf6';
    }
  }

  const svgIcon = `
    <svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 0C7.2 0 0 7.2 0 16c0 12 16 26 16 26s16-14 16-26C32 7.2 24.8 0 16 0z" 
            fill="${color}" stroke="white" stroke-width="2"/>
      <circle cx="16" cy="16" r="6" fill="white"/>
    </svg>
  `;

  return L.divIcon({
    html: svgIcon,
    className: 'custom-marker',
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -42],
  });
};

const getEntityBadgeVariant = (entity: string | null): "default" | "secondary" | "destructive" | "outline" => {
  switch(entity) {
    case 'france': return 'default';
    case 'luxembourg': return 'secondary';
    case 'belgique': return 'outline';
    default: return 'outline';
  }
};

export function SupervisionMap({ positions }: SupervisionMapProps) {
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef<L.Map | null>(null);

  const defaultCenter: [number, number] = positions.length > 0 
    ? [parseFloat(positions[0].latitude), parseFloat(positions[0].longitude)]
    : [48.8566, 2.3522];

  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  }, []);

  return (
    <div className="h-[600px] w-full rounded-lg overflow-hidden border">
      <MapContainer
        center={defaultCenter}
        zoom={6}
        style={{ height: '100%', width: '100%' }}
        whenReady={() => setMapReady(true)}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {mapReady && <MapBoundsUpdater positions={positions} />}
        
        {positions.map((pos) => {
          const lat = parseFloat(pos.latitude);
          const lng = parseFloat(pos.longitude);
          
          if (isNaN(lat) || isNaN(lng)) return null;

          const userName = pos.user.firstName && pos.user.lastName
            ? `${pos.user.firstName} ${pos.user.lastName}`
            : pos.user.email.split('@')[0];

          return (
            <Marker
              key={pos.id}
              position={[lat, lng]}
              icon={getMarkerIcon(pos.isRecent, pos.user.entity)}
            >
              <Popup maxWidth={300}>
                <div className="space-y-3 p-2">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-base">{userName}</h3>
                      <p className="text-xs text-muted-foreground">{pos.user.role}</p>
                    </div>
                    <Badge variant={getEntityBadgeVariant(pos.user.entity)}>
                      {pos.user.entity?.toUpperCase() || 'N/A'}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span className="text-xs">
                        {pos.address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-xs">
                        {pos.timeAgo}
                        {pos.isRecent && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            ACTIF
                          </Badge>
                        )}
                      </span>
                    </div>

                    {pos.accuracy && (
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs">
                          Précision: ±{pos.accuracy}m
                        </span>
                      </div>
                    )}

                    {pos.batteryLevel !== null && (
                      <div className="flex items-center gap-2">
                        <Battery className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs">
                          Batterie: {pos.batteryLevel}%
                        </span>
                      </div>
                    )}

                    {pos.user.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <a 
                          href={`tel:${pos.user.phone}`}
                          className="text-xs text-primary hover:underline"
                        >
                          {pos.user.phone}
                        </a>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <a 
                        href={`mailto:${pos.user.email}`}
                        className="text-xs text-primary hover:underline"
                      >
                        {pos.user.email}
                      </a>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
