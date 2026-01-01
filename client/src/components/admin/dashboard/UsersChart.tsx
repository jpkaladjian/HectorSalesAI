import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { UsersChartData } from '@/types/admin';

interface UsersChartProps {
  data: UsersChartData[];
}

export function UsersChart({ data }: UsersChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Aucune donnée disponible
      </div>
    );
  }

  return (
    <div className="h-64" data-testid="users-chart">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis 
            dataKey="entity" 
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
            dataKey="active" 
            fill="#10B981" 
            radius={[4, 4, 0, 0]}
            name="Utilisateurs actifs"
            stackId="a"
          />
          <Bar 
            dataKey="inactive" 
            fill="#EF4444" 
            radius={[4, 4, 0, 0]}
            name="Utilisateurs inactifs"
            stackId="a"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
