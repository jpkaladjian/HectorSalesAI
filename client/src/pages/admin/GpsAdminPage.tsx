import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Settings, Key, BarChart3, Navigation } from 'lucide-react';
import AdminGpsConfig from '@/components/admin/AdminGpsConfig';
import AdminGpsDashboard from '@/components/admin/AdminGpsDashboard';
import AdminGpsCredentials from '@/components/admin/AdminGpsCredentials';
import AdminGpsGeocoding from '@/components/admin/AdminGpsGeocoding';

const GpsAdminPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="p-6 space-y-6" data-testid="page-gps-admin">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <MapPin className="h-8 w-8" />
            Module GPS Tracking V2
          </h1>
          <p className="text-muted-foreground mt-2">
            Tracking GPS commercial, opportunités à proximité, rapports automatiques
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="gap-2" data-testid="tab-dashboard">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="geocoding" className="gap-2" data-testid="tab-geocoding">
            <Navigation className="h-4 w-4" />
            Géocodage
          </TabsTrigger>
          <TabsTrigger value="config" className="gap-2" data-testid="tab-config">
            <Settings className="h-4 w-4" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="credentials" className="gap-2" data-testid="tab-credentials">
            <Key className="h-4 w-4" />
            Clés API
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <AdminGpsDashboard />
        </TabsContent>

        <TabsContent value="geocoding" className="space-y-4">
          <AdminGpsGeocoding />
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <AdminGpsConfig />
        </TabsContent>

        <TabsContent value="credentials" className="space-y-4">
          <AdminGpsCredentials />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GpsAdminPage;
