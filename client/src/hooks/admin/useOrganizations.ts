// ============================================
// ORGANIZATIONS HOOK (React Query)
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { organizationsApi, type CreateOrganizationDto, type UpdateOrganizationDto } from '@/services/admin/organizationsApi';
import { useToast } from '@/hooks/use-toast';

export function useOrganizations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get all organizations
  const { data: organizations, isLoading, error } = useQuery({
    queryKey: ['admin-organizations'],
    queryFn: () => organizationsApi.getAll(),
  });

  // Create organization
  const createMutation = useMutation({
    mutationFn: (data: CreateOrganizationDto) => organizationsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-organizations'] });
      queryClient.invalidateQueries({ queryKey: ['admin-analytics'] });
      toast({
        title: 'Organisation créée',
        description: 'L\'organisation a été créée avec succès.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de créer l\'organisation.',
        variant: 'destructive',
      });
    },
  });

  // Update organization
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrganizationDto }) =>
      organizationsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-organizations'] });
      queryClient.invalidateQueries({ queryKey: ['admin-analytics'] });
      toast({
        title: 'Organisation modifiée',
        description: 'L\'organisation a été modifiée avec succès.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de modifier l\'organisation.',
        variant: 'destructive',
      });
    },
  });

  // Delete organization
  const deleteMutation = useMutation({
    mutationFn: (id: string) => organizationsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-organizations'] });
      queryClient.invalidateQueries({ queryKey: ['admin-analytics'] });
      toast({
        title: 'Organisation supprimée',
        description: 'L\'organisation a été supprimée avec succès.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de supprimer l\'organisation.',
        variant: 'destructive',
      });
    },
  });

  return {
    organizations: organizations || [],
    isLoading,
    error,
    createOrganization: createMutation.mutate,
    updateOrganization: updateMutation.mutate,
    deleteOrganization: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
