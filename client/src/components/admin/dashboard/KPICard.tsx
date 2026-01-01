import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  trend?: string;
  trendUp?: boolean;
}

const colorClasses = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  purple: 'bg-purple-100 text-purple-600',
  orange: 'bg-orange-100 text-orange-600',
  red: 'bg-red-100 text-red-600',
};

export function KPICard({ title, value, icon: Icon, color, trend, trendUp }: KPICardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow" data-testid={`kpi-card-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1" data-testid="kpi-title">{title}</p>
          <p className="text-3xl font-bold text-gray-900" data-testid="kpi-value">{value}</p>
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${trendUp ? 'text-green-600' : 'text-red-600'}`} data-testid="kpi-trend">
              {trendUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span className="font-medium">{trend}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
