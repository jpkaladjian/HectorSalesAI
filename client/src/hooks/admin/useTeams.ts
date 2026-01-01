import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { teamsApi, type TeamWithMembers, type TeamStats } from '@/services/admin/teamsApi';
import type { InsertTeam, InsertTeamMember } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

const TEAMS_KEY = '/api/admin/teams';

export function useTeams() {
  const { toast } = useToast();

  const teamsQuery = useQuery<TeamWithMembers[]>({
    queryKey: [TEAMS_KEY],
    queryFn: teamsApi.getAll,
  });

  const statsQuery = useQuery<TeamStats>({
    queryKey: [TEAMS_KEY, 'stats'],
    queryFn: teamsApi.getStats,
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertTeam) => teamsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEAMS_KEY] });
      toast({
        title: 'Succès',
        description: 'Équipe créée avec succès',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertTeam> }) =>
      teamsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEAMS_KEY] });
      toast({
        title: 'Succès',
        description: 'Équipe mise à jour avec succès',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => teamsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEAMS_KEY] });
      toast({
        title: 'Succès',
        description: 'Équipe supprimée avec succès',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const addMemberMutation = useMutation({
    mutationFn: ({ teamId, data }: { teamId: string; data: Omit<InsertTeamMember, 'teamId'> }) =>
      teamsApi.addMember(teamId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEAMS_KEY] });
      toast({
        title: 'Succès',
        description: 'Membre ajouté avec succès',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: ({ teamId, memberId }: { teamId: string; memberId: string }) =>
      teamsApi.removeMember(teamId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEAMS_KEY] });
      toast({
        title: 'Succès',
        description: 'Membre retiré avec succès',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateMemberRoleMutation = useMutation({
    mutationFn: ({ teamId, memberId, role }: { teamId: string; memberId: string; role: string }) =>
      teamsApi.updateMemberRole(teamId, memberId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEAMS_KEY] });
      toast({
        title: 'Succès',
        description: 'Rôle mis à jour avec succès',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    teams: teamsQuery.data ?? [],
    stats: statsQuery.data,
    isLoading: teamsQuery.isLoading,
    isStatsLoading: statsQuery.isLoading,
    createTeam: createMutation.mutateAsync,
    updateTeam: updateMutation.mutateAsync,
    deleteTeam: deleteMutation.mutateAsync,
    addMember: addMemberMutation.mutateAsync,
    removeMember: removeMemberMutation.mutateAsync,
    updateMemberRole: updateMemberRoleMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isAddingMember: addMemberMutation.isPending,
    isRemovingMember: removeMemberMutation.isPending,
    isUpdatingRole: updateMemberRoleMutation.isPending,
  };
}

export function useTeam(id: string | undefined) {
  return useQuery<TeamWithMembers>({
    queryKey: [TEAMS_KEY, id],
    queryFn: () => teamsApi.getById(id!),
    enabled: !!id,
  });
}
