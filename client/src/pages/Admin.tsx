import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { User, Invitation } from "@shared/schema";
import { Shield, UserPlus, Mail, Users, TrendingUp, Clock, UserCheck, UserX, Trash2, Copy, CheckCircle2, Lock, Brain } from "lucide-react";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  adminCount: number;
  commercialCount: number;
  pendingInvitations: number;
  totalProspects: number;
  totalOpportunities: number;
}

export default function Admin() {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"sdr" | "bd" | "ic" | "chef" | "resp_dev" | "dg" | "president" | "admin">("bd");
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Fetch statistics
  const { data: stats } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
  });

  // Fetch users
  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  // Fetch invitations
  const { data: invitations, isLoading: invitationsLoading } = useQuery<Invitation[]>({
    queryKey: ["/api/admin/invitations"],
  });

  // Toggle user active status
  const toggleActiveMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest('PATCH', `/api/admin/users/${userId}/toggle-active`, {});
    },
    onSuccess: () => {
      toast({
        title: "Statut mis à jour",
        description: "Le statut de l'utilisateur a été modifié",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de modifier le statut",
      });
    },
  });

  // Update user role
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      return await apiRequest('PATCH', `/api/admin/users/${userId}/role`, { role });
    },
    onSuccess: () => {
      toast({
        title: "Rôle mis à jour",
        description: "Le rôle de l'utilisateur a été modifié",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de modifier le rôle",
      });
    },
  });

  // Send invitation
  const inviteMutation = useMutation({
    mutationFn: async (data: { email: string; role: string }) => {
      return await apiRequest('POST', '/api/admin/invitations', data);
    },
    onSuccess: (data: any) => {
      toast({
        title: "Invitation envoyée",
        description: `Une invitation a été envoyée à ${inviteEmail}`,
      });
      setInviteEmail("");
      setInviteRole("bd");
      queryClient.invalidateQueries({ queryKey: ["/api/admin/invitations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible d'envoyer l'invitation",
      });
    },
  });

  // Delete invitation
  const deleteInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      return await apiRequest('DELETE', `/api/admin/invitations/${invitationId}`, {});
    },
    onSuccess: () => {
      toast({
        title: "Invitation supprimée",
        description: "L'invitation a été supprimée",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/invitations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de supprimer l'invitation",
      });
    },
  });

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    inviteMutation.mutate({ email: inviteEmail, role: inviteRole });
  };

  const copyInviteLink = (token: string) => {
    const inviteUrl = `${window.location.origin}/accept-invite?token=${token}`;
    navigator.clipboard.writeText(inviteUrl);
    toast({
      title: "Lien copié",
      description: "Le lien d'invitation a été copié dans le presse-papiers",
    });
  };

  // Normalize legacy roles to new codes
  const normalizeRole = (role: string | null | undefined): string => {
    if (!role) return "bd";
    const normalized: Record<string, string> = {
      "business_developer": "bd",
      "chef_ventes": "chef",
      "responsable_developpement": "resp_dev",
      "commercial": "bd"
    };
    return normalized[role] || role;
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      "president": "Président",
      "dg": "Directeur Général",
      "resp_dev": "Responsable Développement",
      "chef": "Chef des Ventes",
      "ic": "Indépendant Commercial (IC)",
      "bd": "Business Developer (BD)",
      "sdr": "SDR - Sales Development Representative",
      "admin": "Administrateur Système",
      // Backward compatibility
      "business_developer": "Business Developer (BD)",
      "chef_ventes": "Chef des Ventes",
      "responsable_developpement": "Responsable Développement",
      "commercial": "Business Developer (BD)"
    };
    return labels[role] || role;
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: <Badge variant="secondary" data-testid="badge-pending">En attente</Badge>,
      accepted: <Badge variant="default" data-testid="badge-accepted">Acceptée</Badge>,
      expired: <Badge variant="destructive" data-testid="badge-expired">Expirée</Badge>,
    };
    return badges[status as keyof typeof badges] || <Badge>{status}</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Administration</h1>
      </div>

      {/* Statistics Dashboard */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total utilisateurs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-total-users">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeUsers} actifs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Administrateurs</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-admins">{stats.adminCount}</div>
              <p className="text-xs text-muted-foreground">
                {stats.commercialCount} commerciaux
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Invitations</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-invitations">{stats.pendingInvitations}</div>
              <p className="text-xs text-muted-foreground">
                En attente
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prospects CRM</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-prospects">{stats.totalProspects}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalOpportunities} opportunités
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <Card data-testid="card-quick-actions">
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
          <CardDescription>Accès aux fonctionnalités d'administration</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button
            onClick={() => setLocation('/admin/api-security')}
            variant="outline"
            className="flex items-center gap-2"
            data-testid="button-api-security"
          >
            <Lock className="w-4 h-4" />
            Sécurité API
          </Button>
          <Button
            onClick={() => setLocation('/admin/learning')}
            variant="outline"
            className="flex items-center gap-2"
            data-testid="button-learning"
          >
            <Brain className="w-4 h-4" />
            Learning Loop
          </Button>
        </CardContent>
      </Card>

      {/* Tabs: Users / Invitations */}
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users" data-testid="tab-users">
            <Users className="h-4 w-4 mr-2" />
            Utilisateurs
          </TabsTrigger>
          <TabsTrigger value="invitations" data-testid="tab-invitations">
            <Mail className="h-4 w-4 mr-2" />
            Invitations
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Liste des utilisateurs</CardTitle>
              <CardDescription>
                Gérer les utilisateurs et leurs rôles
              </CardDescription>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="text-center text-muted-foreground">Chargement...</div>
              ) : users && users.length > 0 ? (
                <div className="space-y-3">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                      data-testid={`user-item-${user.id}`}
                    >
                      <div className="flex-1">
                        <div className="font-medium">
                          {user.firstName && user.lastName 
                            ? `${user.firstName} ${user.lastName}`
                            : user.email}
                        </div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                        {user.poste && (
                          <div className="text-xs text-muted-foreground">{user.poste}</div>
                        )}
                        {user.lastLoginAt && (
                          <div className="text-xs text-muted-foreground">
                            Dernière connexion : {new Date(user.lastLoginAt).toLocaleDateString('fr-FR')}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Role Selector */}
                        <Select
                          value={normalizeRole(user.role)}
                          onValueChange={(value) => updateRoleMutation.mutate({ userId: user.id, role: value })}
                          disabled={updateRoleMutation.isPending}
                        >
                          <SelectTrigger className="w-[200px]" data-testid={`select-role-${user.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Hiérarchie Commerciale</SelectLabel>
                              <SelectItem value="president">Président</SelectItem>
                              <SelectItem value="dg">Directeur Général</SelectItem>
                              <SelectItem value="resp_dev">Responsable Développement</SelectItem>
                              <SelectItem value="chef">Chef des Ventes</SelectItem>
                              <SelectItem value="ic">Indépendant Commercial (IC)</SelectItem>
                              <SelectItem value="bd">Business Developer (BD)</SelectItem>
                              <SelectItem value="sdr">SDR</SelectItem>
                            </SelectGroup>
                            <SelectGroup>
                              <SelectLabel>Système</SelectLabel>
                              <SelectItem value="admin">Administrateur</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>

                        {/* Status Badge */}
                        <Badge 
                          variant={user.isActive === "true" ? "default" : "secondary"}
                          data-testid={`badge-status-${user.id}`}
                        >
                          {user.isActive === "true" ? "Actif" : "Inactif"}
                        </Badge>

                        {/* Toggle Active Button */}
                        <Button
                          size="sm"
                          variant={user.isActive === "true" ? "destructive" : "default"}
                          onClick={() => toggleActiveMutation.mutate(user.id)}
                          disabled={toggleActiveMutation.isPending}
                          data-testid={`button-toggle-${user.id}`}
                        >
                          {user.isActive === "true" ? (
                            <>
                              <UserX className="h-4 w-4 mr-1" />
                              Désactiver
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-4 w-4 mr-1" />
                              Activer
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground">Aucun utilisateur trouvé</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invitations Tab */}
        <TabsContent value="invitations" className="space-y-4">
          {/* Send Invitation Form */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                <CardTitle>Inviter un utilisateur</CardTitle>
              </div>
              <CardDescription>
                Envoyer une invitation par email
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleInvite} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="inviteEmail">Email professionnel *</Label>
                  <Input
                    id="inviteEmail"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="collaborateur@adsgroup-security.com"
                    required
                    data-testid="input-invite-email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inviteRole">Rôle *</Label>
                  <Select value={inviteRole} onValueChange={(value: any) => setInviteRole(value)}>
                    <SelectTrigger data-testid="select-invite-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Hiérarchie Commerciale</SelectLabel>
                        <SelectItem value="president">Président</SelectItem>
                        <SelectItem value="dg">Directeur Général</SelectItem>
                        <SelectItem value="resp_dev">Responsable Développement</SelectItem>
                        <SelectItem value="chef">Chef des Ventes</SelectItem>
                        <SelectItem value="ic">Indépendant Commercial (IC)</SelectItem>
                        <SelectItem value="bd">Business Developer (BD)</SelectItem>
                        <SelectItem value="sdr">SDR</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Système</SelectLabel>
                        <SelectItem value="admin">Administrateur</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={inviteMutation.isPending}
                  data-testid="button-send-invitation"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  {inviteMutation.isPending ? "Envoi..." : "Envoyer l'invitation"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Invitations List */}
          <Card>
            <CardHeader>
              <CardTitle>Invitations envoyées</CardTitle>
              <CardDescription>
                {invitations?.length || 0} invitation(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {invitationsLoading ? (
                <div className="text-center text-muted-foreground">Chargement...</div>
              ) : invitations && invitations.length > 0 ? (
                <div className="space-y-3">
                  {invitations.map((invitation) => (
                    <div
                      key={invitation.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                      data-testid={`invitation-item-${invitation.id}`}
                    >
                      <div className="flex-1">
                        <div className="font-medium">{invitation.email}</div>
                        <div className="text-sm text-muted-foreground">
                          Rôle : {getRoleLabel(invitation.role)}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Expire le : {new Date(invitation.expiresAt).toLocaleDateString('fr-FR')}
                        </div>
                        {invitation.acceptedAt && (
                          <div className="text-xs text-green-600 flex items-center gap-1 mt-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Acceptée le : {new Date(invitation.acceptedAt).toLocaleDateString('fr-FR')}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        {getStatusBadge(invitation.status)}

                        {invitation.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyInviteLink(invitation.token)}
                              data-testid={`button-copy-${invitation.id}`}
                            >
                              <Copy className="h-4 w-4 mr-1" />
                              Copier
                            </Button>

                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteInvitationMutation.mutate(invitation.id)}
                              disabled={deleteInvitationMutation.isPending}
                              data-testid={`button-delete-${invitation.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  Aucune invitation trouvée
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
