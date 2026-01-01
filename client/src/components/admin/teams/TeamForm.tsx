import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTeamSchema } from "@shared/schema";
import type { InsertTeam, Team } from "@shared/schema";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const formSchema = insertTeamSchema.extend({
  monthlyTargetCa: z.string().optional(),
  monthlyTargetMeetings: z.coerce.number().optional(),
  monthlyTargetSignatures: z.coerce.number().optional(),
  parentTeamId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface TeamFormProps {
  team?: Team;
  teams: Team[];
  onSubmit: (data: InsertTeam) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const ENTITIES = [
  { value: 'france', label: '🇫🇷 France' },
  { value: 'luxembourg', label: '🇱🇺 Luxembourg' },
  { value: 'belgique', label: '🇧🇪 Belgique' },
];

export function TeamForm({ team, teams, onSubmit, onCancel, isSubmitting }: TeamFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: team?.name || '',
      description: team?.description || '',
      entity: team?.entity || 'france',
      managerId: team?.managerId || '',
      parentTeamId: team?.parentTeamId || '',
      monthlyTargetCa: team?.monthlyTargetCa || '',
      monthlyTargetMeetings: team?.monthlyTargetMeetings || undefined,
      monthlyTargetSignatures: team?.monthlyTargetSignatures || undefined,
      isActive: team?.isActive ?? true,
      color: team?.color || '#3B82F6',
      createdBy: team?.createdBy || '',
      updatedBy: team?.updatedBy || '',
    },
  });

  const handleSubmit = async (values: FormValues) => {
    const data: InsertTeam = {
      ...values,
      monthlyTargetCa: values.monthlyTargetCa || null,
      monthlyTargetMeetings: values.monthlyTargetMeetings || null,
      monthlyTargetSignatures: values.monthlyTargetSignatures || null,
      managerId: values.managerId || null,
      parentTeamId: (values.parentTeamId && values.parentTeamId !== '__none__') ? values.parentTeamId : null,
      description: values.description || null,
    };
    await onSubmit(data);
  };

  const availableParentTeams = teams.filter(t => t.id !== team?.id);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom de l'équipe *</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="Équipe commerciale France"
                  data-testid="input-team-name"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value || ''}
                  placeholder="Description de l'équipe..."
                  rows={3}
                  data-testid="input-team-description"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="entity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Entité *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  data-testid="select-team-entity"
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une entité" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ENTITIES.map((entity) => (
                      <SelectItem key={entity.value} value={entity.value}>
                        {entity.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Couleur</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value || '#3B82F6'}
                    type="color"
                    className="h-10 w-full"
                    data-testid="input-team-color"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="managerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ID Manager</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value || ''}
                  placeholder="ID du manager (optionnel)"
                  data-testid="input-team-manager-id"
                />
              </FormControl>
              <FormDescription>
                L'ID utilisateur du manager de cette équipe
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="parentTeamId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Équipe parente</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value || '__none__'}
                data-testid="select-team-parent"
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Aucune (équipe racine)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="__none__">Aucune (équipe racine)</SelectItem>
                  {availableParentTeams.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="border-t pt-4 mt-4">
          <h4 className="text-sm font-medium mb-3">Objectifs mensuels</h4>
          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="monthlyTargetCa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CA (€)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="0.01"
                      placeholder="50000"
                      data-testid="input-team-target-ca"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="monthlyTargetMeetings"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RDV</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="20"
                      data-testid="input-team-target-meetings"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="monthlyTargetSignatures"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Signatures</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="10"
                      data-testid="input-team-target-signatures"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel>Équipe active</FormLabel>
                <FormDescription>
                  L'équipe est active et visible dans le système
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value ?? true}
                  onCheckedChange={field.onChange}
                  data-testid="switch-team-active"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            data-testid="button-cancel"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            data-testid="button-submit"
          >
            {isSubmitting ? 'Enregistrement...' : team ? 'Mettre à jour' : 'Créer'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
