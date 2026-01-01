import { LayoutDashboard, Building2, Users, Activity, LogOut, Phone, Settings, BarChart3, MapPin, Compass, Eye, Target, TrendingUp, Shield } from 'lucide-react';
import { useLocation } from 'wouter';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const coreMenuItems = [
  {
    title: 'Dashboard',
    url: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Analytics Commercial',
    url: '/admin/analytics',
    icon: TrendingUp,
  },
  {
    title: 'Organisations',
    url: '/admin/organizations',
    icon: Building2,
  },
  {
    title: 'Équipes',
    url: '/admin/teams',
    icon: Users,
  },
  {
    title: 'Utilisateurs',
    url: '/admin/users',
    icon: Users,
  },
  {
    title: 'Concurrents',
    url: '/admin/concurrents',
    icon: Shield,
  },
  {
    title: 'Audit Logs',
    url: '/admin/audit-logs',
    icon: Activity,
  },
];

const phoningMenuItems = [
  {
    title: 'Configurations',
    url: '/admin/phone-config-dynamic',
    icon: Settings,
  },
  {
    title: 'Analytics',
    url: '/phoning/analytics',
    icon: BarChart3,
  },
];

const gpsMenuItems = [
  {
    title: 'Configuration GPS',
    url: '/admin/gps',
    icon: Settings,
  },
  {
    title: 'Tracking Terrain',
    url: '/gps/track',
    icon: MapPin,
  },
];

const prospectionMenuItems = [
  {
    title: 'Campagnes',
    url: '/prospection/campagnes',
    icon: Target,
  },
  {
    title: 'Analytics',
    url: '/prospection/analytics',
    icon: TrendingUp,
  },
];

export function AppAdminSidebar() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        // Clear auth state and redirect
        setLocation('/login');
        // Reload to clear all cached data
        setTimeout(() => window.location.reload(), 100);
      } else {
        console.error('Logout failed:', await response.text());
        // Still redirect on error to prevent stuck state
        setLocation('/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Redirect even on network error
      setLocation('/login');
    }
  };

  const getUserInitials = () => {
    if (!user?.email) return 'AD';
    return user.email.substring(0, 2).toUpperCase();
  };

  // Vérifier si l'utilisateur est Jean-Pierre (président) pour accès supervision
  const isPresident = user?.email === 'kaladjian@adsgroup-security.com';

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold">
            H
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Hector Admin</span>
            <span className="text-xs text-muted-foreground">ADS GROUP</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Navigation de base */}
        <SidebarGroup>
          <SidebarGroupLabel className="font-bold text-orange-600">Tableau de Bord</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {coreMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`link-sidebar-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <a href={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Module Phoning */}
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2 font-bold text-orange-600">
            <Phone className="w-3.5 h-3.5" />
            <span>Module Phoning</span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {phoningMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`link-sidebar-phoning-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <a href={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Module Gaming GPS */}
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2 font-bold text-orange-600">
            <Compass className="w-3.5 h-3.5" />
            <span>Gaming GPS</span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {gpsMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`link-sidebar-gps-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <a href={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {/* Supervision Équipe - uniquement pour Jean-Pierre */}
              {isPresident && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location === '/admin/supervision-equipe'}
                    data-testid="link-sidebar-gps-supervision-équipe"
                  >
                    <a href="/admin/supervision-equipe">
                      <Eye className="w-4 h-4" />
                      <span>Supervision Équipe</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Module Prospection LinkedIn */}
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2 font-bold text-orange-600">
            <Target className="w-3.5 h-3.5" />
            <span>Prospection LinkedIn</span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {prospectionMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`link-sidebar-prospection-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <a href={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3 px-3 py-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs font-semibold">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.email || 'Administrateur'}</p>
                <p className="text-xs text-muted-foreground">Admin</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 hover:bg-accent rounded-md transition-colors"
                title="Déconnexion"
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
