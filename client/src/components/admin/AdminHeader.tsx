import { useQuery } from '@tanstack/react-query';
import { Bell, User, LogOut } from 'lucide-react';
import { useLocation } from 'wouter';
import { NavigationBar } from '@/components/NavigationBar';

export function AdminHeader() {
  const [, setLocation] = useLocation();

  // Get current user from /api/auth/me
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch user');
      return response.json();
    },
  });

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      setLocation('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-gray-900" data-testid="text-page-title">
          Administration
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <NavigationBar showHomeButton={true} />
        {/* Notifications */}
        <button 
          className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          data-testid="button-notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User Menu */}
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="text-sm">
              <p className="font-medium text-gray-900" data-testid="text-user-name">
                {user?.name || user?.email?.split('@')[0] || 'Admin'}
              </p>
              <p className="text-gray-500 text-xs" data-testid="text-user-role">
                {user?.role || 'admin'}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            data-testid="button-logout"
            title="Déconnexion"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
