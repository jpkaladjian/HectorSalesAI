import { apiRequest } from '@/lib/queryClient';
import type { User, Invitation } from '@shared/schema';

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  byRole: Record<string, number>;
}

export const usersApi = {
  /**
   * Get all users
   */
  async getAll(): Promise<User[]> {
    const response = await fetch('/api/admin/users', {
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    return response.json();
  },

  /**
   * Toggle user active status
   */
  async toggleActive(userId: string): Promise<User> {
    return apiRequest('PATCH', `/api/admin/users/${userId}/toggle-active`, {});
  },

  /**
   * Update user role
   */
  async updateRole(userId: string, role: string): Promise<User> {
    return apiRequest('PATCH', `/api/admin/users/${userId}/role`, { role });
  },

  /**
   * Get user statistics
   */
  async getStats(): Promise<UserStats> {
    const users = await this.getAll();
    
    const stats: UserStats = {
      total: users.length,
      active: users.filter(u => u.isActive === 'true').length,
      inactive: users.filter(u => u.isActive !== 'true').length,
      byRole: {},
    };
    
    users.forEach(user => {
      if (user.role) {
        stats.byRole[user.role] = (stats.byRole[user.role] || 0) + 1;
      }
    });
    
    return stats;
  },

  // ============================================
  // INVITATIONS
  // ============================================

  /**
   * Get all invitations
   */
  async getInvitations(): Promise<Invitation[]> {
    const response = await fetch('/api/admin/invitations', {
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('Failed to fetch invitations');
    }
    return response.json();
  },

  /**
   * Send invitation
   */
  async sendInvitation(email: string, role: string): Promise<Invitation> {
    return apiRequest('POST', '/api/auth/invite', { email, role });
  },

  /**
   * Delete invitation
   */
  async deleteInvitation(id: string): Promise<void> {
    return apiRequest('DELETE', `/api/admin/invitations/${id}`, {});
  },
};
