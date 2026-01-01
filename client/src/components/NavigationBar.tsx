import { LayoutDashboard, Shield, LogOut, Home, MapPin, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface NavigationBarProps {
  className?: string;
  showHomeButton?: boolean;
}

export function NavigationBar({ className = "", showHomeButton = false }: NavigationBarProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      queryClient.clear();
      window.location.href = "/auth";
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showHomeButton && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation('/home')}
          data-testid="button-nav-home"
          title="Accueil"
        >
          <Home className="w-4 h-4 mr-2" />
          <span className="hidden md:inline">Accueil</span>
        </Button>
      )}
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setLocation('/crm')}
        data-testid="button-nav-crm"
        title="Pré-CRM"
      >
        <LayoutDashboard className="w-4 h-4 mr-2" />
        <span className="hidden md:inline">Pré-CRM</span>
      </Button>
      
      {(user?.role === "admin" || user?.role === "admin_groupe") && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation('/admin')}
          data-testid="button-nav-admin"
          title="Administration"
        >
          <Shield className="w-4 h-4 mr-2" />
          <span className="hidden md:inline">Admin</span>
        </Button>
      )}

      {user?.email === 'kaladjian@adsgroup-security.com' && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation('/crm/competitor-module')}
            data-testid="button-nav-competitor"
            title="Échéances Concurrent - Reconquête"
          >
            <Trophy className="w-4 h-4 mr-2" />
            <span className="hidden md:inline">Échéances</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation('/admin/supervision-equipe')}
            data-testid="button-nav-supervision"
            title="Supervision Équipe GPS"
          >
            <MapPin className="w-4 h-4 mr-2" />
            <span className="hidden md:inline">Supervision</span>
          </Button>
        </>
      )}

      <Button
        variant="ghost"
        size="icon"
        onClick={handleLogout}
        title={user?.email || 'Déconnexion'}
        data-testid="button-logout"
      >
        <LogOut className="w-5 h-5" />
      </Button>
    </div>
  );
}
