import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { ActivityChartData } from '@/types/admin';

interface ActivityChartProps {
  data: ActivityChartData[];
}

export function ActivityChart({ data }: ActivityChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Aucune donnée disponible
      </div>
    );
  }

  return (
    <div className="h-64" data-testid="activity-chart">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis 
            dataKey="date" 
            stroke="#6B7280"
            fontSize={12}
          />
          <YAxis stroke="#6B7280" fontSize={12} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Bar 
            dataKey="actions" 
            fill="#4F46E5" 
            radius={[4, 4, 0, 0]}
            name="Actions"
          />
          <Bar 
            dataKey="users" 
            fill="#10B981" 
            radius={[4, 4, 0, 0]}
            name="Utilisateurs actifs"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
