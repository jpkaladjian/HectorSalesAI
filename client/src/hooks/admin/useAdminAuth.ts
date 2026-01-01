// ============================================
// useAdminAuth HOOK
// ============================================

import { useQuery } from '@tanstack/react-query';
import type { AdminAuthState, AdminUser, UserRole } from '@/types/admin';

export function useAdminAuth(): AdminAuthState {
  const { data: user } = useQuery<AdminUser>({
    queryKey: ['current-user'],
    queryFn: async () => {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Not authenticated');
      }
      return response.json();
    },
  });

  const isAdmin = user?.role === 'admin' || user?.role === 'admin_groupe';
  const isAdminGroupe = user?.role === 'admin_groupe';

  const canManageEntity = (entity: string): boolean => {
    if (!user) return false;
    if (isAdminGroupe) return true; // Admin groupe can manage all entities
    if (user.role === 'admin') return user.entity === entity; // Admin can only manage their own entity
    return false;
  };

  return {
    user: user || null,
    isAdmin,
    isAdminGroupe,
    canManageEntity,
  };
}
