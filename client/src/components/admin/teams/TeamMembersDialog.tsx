import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { teamsApi } from '@/services/admin/teamsApi';
import { usersApi } from '@/services/admin/usersApi';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Users, UserPlus, Trash2, Shield, User } from 'lucide-react';
import type { TeamWithMembers } from '@/services/admin/teamsApi';

interface TeamMembersDialogProps {
  team: TeamWithMembers | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TeamMembersDialog({ team, open, onOpenChange }: TeamMembersDialogProps) {
  const { toast } = useToast();
  const [selectedUserId, setSelectedUserId] = useState('');

  // Fetch all users to select from
  const { data: allUsers = [] } = useQuery({
    queryKey: ['/api/admin/users'],
    queryFn: () => usersApi.getAll(),
    enabled: open,
  });

  // Fetch team details with members
  const { data: teamDetails, isLoading } = useQuery({
    queryKey: ['/api/admin/teams', team?.id],
    queryFn: () => teamsApi.getById(team!.id),
    enabled: open && !!team,
  });

  // Add member mutation
  const addMemberMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      teamsApi.addMember(team!.id, { userId, role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/teams'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/teams', team?.id] });
      setSelectedUserId('');
      toast({
        title: 'Membre ajouté',
        description: 'Le membre a été ajouté à l\'équipe avec succès',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.message || 'Impossible d\'ajouter le membre',
      });
    },
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: (memberId: string) => teamsApi.removeMember(team!.id, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/teams'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/teams', team?.id] });
      toast({
        title: 'Membre retiré',
        description: 'Le membre a été retiré de l\'équipe',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.message || 'Impossible de retirer le membre',
      });
    },
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: string }) =>
      teamsApi.updateMemberRole(team!.id, memberId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/teams'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/teams', team?.id] });
      toast({
        title: 'Rôle mis à jour',
        description: 'Le rôle du membre a été modifié',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.message || 'Impossible de modifier le rôle',
      });
    },
  });

  if (!team) return null;

  // Filter users who are not already members
  const memberUserIds = new Set(teamDetails?.members?.map(m => m.userId) || []);
  const availableUsers = allUsers.filter(u => !memberUserIds.has(u.id) && u.isActive === 'true');

  const handleAddMember = () => {
    if (!selectedUserId) return;
    addMemberMutation.mutate({ userId: selectedUserId, role: 'member' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Membres de l'équipe : {team.name}
          </DialogTitle>
          <DialogDescription>
            Gérez les membres de cette équipe commerciale
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add Member Section */}
          <div className="border rounded-lg p-4 bg-muted/30">
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Ajouter un membre
            </h3>
            <div className="flex gap-2">
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger className="flex-1" data-testid="select-add-member">
                  <SelectValue placeholder="Sélectionner un utilisateur..." />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.email} {user.firstName && `(${user.firstName} ${user.lastName})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleAddMember}
                disabled={!selectedUserId || addMemberMutation.isPending}
                data-testid="button-confirm-add-member"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </div>
          </div>

          {/* Members List */}
          <div>
            <h3 className="text-sm font-medium mb-3">
              Membres actuels ({teamDetails?.members?.length || 0})
            </h3>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Chargement...</div>
            ) : teamDetails?.members && teamDetails.members.length > 0 ? (
              <div className="space-y-2">
                {teamDetails.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                    data-testid={`member-item-${member.id}`}
                  >
                    <div className="flex-1">
                      <div className="font-medium">
                        {member.user?.email || 'Utilisateur inconnu'}
                      </div>
                      {member.user?.username && (
                        <div className="text-sm text-muted-foreground">
                          {member.user.username}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={member.role || 'member'}
                        onValueChange={(role) =>
                          updateRoleMutation.mutate({ memberId: member.id, role })
                        }
                        disabled={updateRoleMutation.isPending}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manager">
                            <div className="flex items-center gap-2">
                              <Shield className="h-3 w-3" />
                              Manager
                            </div>
                          </SelectItem>
                          <SelectItem value="member">
                            <div className="flex items-center gap-2">
                              <User className="h-3 w-3" />
                              Membre
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <Badge variant={member.role === 'manager' ? 'default' : 'secondary'}>
                        {member.role === 'manager' ? 'Manager' : 'Membre'}
                      </Badge>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeMemberMutation.mutate(member.id)}
                        disabled={removeMemberMutation.isPending}
                        data-testid={`button-remove-member-${member.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground border rounded-lg">
                Aucun membre dans cette équipe. Ajoutez votre premier membre ci-dessus.
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
