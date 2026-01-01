import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Plus, 
  Search, 
  CheckCircle2,
  Circle,
  Calendar,
  Trash2,
  Edit,
  Phone,
  Mail,
  MessageSquare,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { NavigationBar } from "@/components/NavigationBar";
import type { Action, Prospect } from "@shared/schema";
import { format, isPast, isFuture, isToday } from "date-fns";
import { fr } from "date-fns/locale";

const ACTION_TYPES = [
  { value: "appel", label: "Appel téléphonique", icon: Phone },
  { value: "email", label: "Email", icon: Mail },
  { value: "reunion", label: "Réunion", icon: User },
  { value: "suivi", label: "Suivi", icon: MessageSquare },
];

export default function Actions() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<Action | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "completed">("all");
  const { toast } = useToast();

  const { data: actions = [], isLoading } = useQuery<Action[]>({
    queryKey: ["/api/crm/actions"],
  });

  const { data: prospects = [] } = useQuery<Prospect[]>({
    queryKey: ["/api/crm/prospects"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<Action>) => {
      return await apiRequest("POST", "/api/crm/actions", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/actions"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Action créée",
        description: "L'action a été ajoutée avec succès",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Action> }) => {
      return await apiRequest("PATCH", `/api/crm/actions/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/actions"] });
      setEditingAction(null);
      toast({
        title: "Action mise à jour",
        description: "Les modifications ont été enregistrées",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/crm/actions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/actions"] });
      toast({
        title: "Action supprimée",
        description: "L'action a été supprimée avec succès",
      });
    },
  });

  const toggleComplete = (action: Action) => {
    updateMutation.mutate({
      id: action.id,
      data: { statut: action.statut === "terminee" ? "a_faire" : "terminee" }
    });
  };

  const filteredActions = actions
    .filter(action => {
      const matchesSearch = searchQuery === "" || 
        action.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        action.type.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = 
        filterStatus === "all" ||
        (filterStatus === "completed" && action.statut === "terminee") ||
        (filterStatus === "pending" && action.statut === "a_faire");
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (!a.datePrevue || !b.datePrevue) return 0;
      return new Date(a.datePrevue).getTime() - new Date(b.datePrevue).getTime();
    });

  const upcomingActions = filteredActions.filter(a => 
    a.datePrevue && (isToday(new Date(a.datePrevue)) || isFuture(new Date(a.datePrevue)))
  );
  const pastActions = filteredActions.filter(a => 
    a.datePrevue && isPast(new Date(a.datePrevue)) && !isToday(new Date(a.datePrevue))
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Actions & Tâches</h1>
              <p className="text-sm text-primary-foreground/80">Gère tes actions commerciales</p>
            </div>
            <div className="flex items-center gap-2">
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="secondary" data-testid="button-create-action">
                    <Plus className="h-4 w-4 mr-2" />
                    Nouvelle Action
                  </Button>
                </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Créer une action</DialogTitle>
                </DialogHeader>
                <ActionForm
                  onSubmit={(data) => createMutation.mutate(data)}
                  prospects={prospects}
                  isPending={createMutation.isPending}
                />
              </DialogContent>
            </Dialog>
            <NavigationBar showHomeButton={true} />
          </div>
        </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher une action..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-actions"
            />
          </div>
          <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
            <SelectTrigger className="w-full sm:w-48" data-testid="select-filter-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              <SelectItem value="pending">À faire</SelectItem>
              <SelectItem value="completed">Terminées</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            Chargement des actions...
          </div>
        ) : filteredActions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery || filterStatus !== "all" 
                  ? "Aucune action trouvée"
                  : "Aucune action planifiée"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Upcoming Actions */}
            {upcomingActions.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  À venir ({upcomingActions.length})
                </h2>
                <div className="grid gap-3">
                  {upcomingActions.map((action) => (
                    <ActionCard
                      key={action.id}
                      action={action}
                      prospects={prospects}
                      onToggleComplete={toggleComplete}
                      onEdit={setEditingAction}
                      onDelete={(id) => deleteMutation.mutate(id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Past Actions */}
            {pastActions.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-muted-foreground">
                  Passées ({pastActions.length})
                </h2>
                <div className="grid gap-3 opacity-60">
                  {pastActions.map((action) => (
                    <ActionCard
                      key={action.id}
                      action={action}
                      prospects={prospects}
                      onToggleComplete={toggleComplete}
                      onEdit={setEditingAction}
                      onDelete={(id) => deleteMutation.mutate(id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Edit Dialog */}
      {editingAction && (
        <Dialog open={!!editingAction} onOpenChange={(open) => !open && setEditingAction(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Modifier l'action</DialogTitle>
            </DialogHeader>
            <ActionForm
              initialData={editingAction}
              onSubmit={(data) => updateMutation.mutate({ id: editingAction.id, data })}
              prospects={prospects}
              isPending={updateMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function ActionCard({
  action,
  prospects,
  onToggleComplete,
  onEdit,
  onDelete,
}: {
  action: Action;
  prospects: Prospect[];
  onToggleComplete: (action: Action) => void;
  onEdit: (action: Action) => void;
  onDelete: (id: string) => void;
}) {
  const prospect = prospects.find(p => p.id === action.prospectId);
  const ActionIcon = ACTION_TYPES.find(t => t.value === action.type)?.icon || MessageSquare;
  const isCompleted = action.statut === "terminee";
  const isOverdue = action.datePrevue && isPast(new Date(action.datePrevue)) && !isCompleted;

  return (
    <Card className={isCompleted ? "opacity-50" : ""} data-testid={`card-action-${action.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleComplete(action)}
            className="mt-1 shrink-0"
            data-testid={`button-toggle-complete-${action.id}`}
          >
            {isCompleted ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground" />
            )}
          </Button>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <ActionIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                <Badge variant="outline" className="capitalize">
                  {action.type}
                </Badge>
                {action.datePrevue && (
                  <span className={`text-sm ${isOverdue ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>
                    {format(new Date(action.datePrevue), "dd MMM yyyy", { locale: fr })}
                  </span>
                )}
              </div>
              <div className="flex gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(action)}
                  data-testid={`button-edit-${action.id}`}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(action.id)}
                  data-testid={`button-delete-${action.id}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {action.description && (
              <p className="text-sm mb-2">{action.description}</p>
            )}

            {prospect && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
                <span>{prospect.nom}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ActionForm({
  initialData,
  onSubmit,
  prospects,
  isPending,
}: {
  initialData?: Action;
  onSubmit: (data: Partial<Action>) => void;
  prospects: Prospect[];
  isPending: boolean;
}) {
  const [formData, setFormData] = useState({
    type: initialData?.type || "appel",
    description: initialData?.description || "",
    datePrevue: initialData?.datePrevue 
      ? format(new Date(initialData.datePrevue), "yyyy-MM-dd'T'HH:mm")
      : "",
    prospectId: initialData?.prospectId || "",
    statut: initialData?.statut || "a_faire",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      datePrevue: formData.datePrevue ? new Date(formData.datePrevue) : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="type">Type d'action *</Label>
        <Select 
          value={formData.type} 
          onValueChange={(v) => setFormData({ ...formData, type: v })}
        >
          <SelectTrigger id="type" data-testid="select-action-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ACTION_TYPES.map(type => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="prospectId">Prospect *</Label>
        <Select 
          value={formData.prospectId} 
          onValueChange={(v) => setFormData({ ...formData, prospectId: v })}
        >
          <SelectTrigger id="prospectId" data-testid="select-prospect">
            <SelectValue placeholder="Sélectionne un prospect" />
          </SelectTrigger>
          <SelectContent>
            {prospects.map(prospect => (
              <SelectItem key={prospect.id} value={prospect.id}>
                {prospect.nom}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="datePrevue">Date prévue *</Label>
        <Input
          id="datePrevue"
          type="datetime-local"
          value={formData.datePrevue}
          onChange={(e) => setFormData({ ...formData, datePrevue: e.target.value })}
          required
          data-testid="input-date"
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Détails de l'action..."
          rows={3}
          data-testid="textarea-description"
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="submit"
          disabled={isPending || !formData.type || !formData.prospectId || !formData.datePrevue}
          data-testid="button-submit-action"
        >
          {isPending ? "Enregistrement..." : initialData ? "Mettre à jour" : "Créer"}
        </Button>
      </div>
    </form>
  );
}
