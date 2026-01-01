// ============================================
// ANALYTICS API SERVICE
// ============================================

import type { AnalyticsKPIs, EntityKPIs } from '@/types/admin';

const API_BASE = '/api/analytics';

export const analyticsApi = {
  // Get global KPIs across all entities
  async getKPIs(): Promise<AnalyticsKPIs> {
    const response = await fetch(`${API_BASE}/kpis`, {
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('Failed to fetch KPIs');
    }
    return response.json();
  },

  // Get KPIs for specific entity
  async getEntityKPIs(entityCode: string): Promise<EntityKPIs> {
    const response = await fetch(`${API_BASE}/entity/${entityCode}`, {
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch KPIs for entity ${entityCode}`);
    }
    return response.json();
  },
};
