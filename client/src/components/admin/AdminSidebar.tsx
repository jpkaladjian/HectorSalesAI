import { Link, useLocation } from 'wouter';
import { LayoutDashboard, Building2, Users, Activity, Settings } from 'lucide-react';

const navItems = [
  { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/admin/organizations', icon: Building2, label: 'Organisations' },
  { path: '/admin/teams', icon: Users, label: 'Équipes' },
  { path: '/admin/audit', icon: Activity, label: 'Audit Logs' },
];

export function AdminSidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold" data-testid="text-admin-title">HectorSalesAI</h1>
        <p className="text-sm text-gray-400 mt-1" data-testid="text-admin-subtitle">Admin Panel</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
              data-testid={`link-admin-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <button 
          className="flex items-center gap-3 px-4 py-3 w-full text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
          data-testid="button-admin-settings"
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium">Paramètres</span>
        </button>
      </div>
    </aside>
  );
}
