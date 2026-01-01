import { useQuery, useMutation } from '@tanstack/react-query';
import { usersApi } from '@/services/admin/usersApi';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export function useUsers() {
  const { toast } = useToast();

  // Fetch users
  const { data: users = [], isLoading, error, refetch } = useQuery({
    queryKey: ['/api/admin/users'],
    queryFn: () => usersApi.getAll(),
  });

  // Fetch stats
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['/api/admin/users/stats'],
    queryFn: () => usersApi.getStats(),
  });

  // Toggle active mutation
  const toggleActiveMutation = useMutation({
    mutationFn: (userId: string) => usersApi.toggleActive(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users/stats'] });
      toast({
        title: 'Statut mis à jour',
        description: 'Le statut de l\'utilisateur a été modifié',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.message || 'Impossible de modifier le statut',
      });
    },
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      usersApi.updateRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users/stats'] });
      toast({
        title: 'Rôle mis à jour',
        description: 'Le rôle de l\'utilisateur a été modifié',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.message || 'Impossible de modifier le rôle',
      });
    },
  });

  return {
    users,
    stats,
    isLoading,
    isStatsLoading,
    error,
    refetch,
    toggleActive: toggleActiveMutation.mutate,
    updateRole: updateRoleMutation.mutate,
    isTogglingActive: toggleActiveMutation.isPending,
    isUpdatingRole: updateRoleMutation.isPending,
  };
}

export function useInvitations() {
  const { toast } = useToast();

  // Fetch invitations
  const { data: invitations = [], isLoading } = useQuery({
    queryKey: ['/api/admin/invitations'],
    queryFn: () => usersApi.getInvitations(),
  });

  // Send invitation mutation
  const sendMutation = useMutation({
    mutationFn: ({ email, role }: { email: string; role: string }) =>
      usersApi.sendInvitation(email, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/invitations'] });
      toast({
        title: 'Invitation envoyée',
        description: 'L\'invitation a été envoyée avec succès',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.message || 'Impossible d\'envoyer l\'invitation',
      });
    },
  });

  // Delete invitation mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.deleteInvitation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/invitations'] });
      toast({
        title: 'Invitation supprimée',
        description: 'L\'invitation a été supprimée',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.message || 'Impossible de supprimer l\'invitation',
      });
    },
  });

  return {
    invitations,
    isLoading,
    sendInvitation: sendMutation.mutate,
    deleteInvitation: deleteMutation.mutate,
    isSending: sendMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
