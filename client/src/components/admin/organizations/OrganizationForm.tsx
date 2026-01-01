import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { Organization } from '@/types/admin';

const organizationFormSchema = z.object({
  entityCode: z.string().min(2, 'Le code doit contenir au moins 2 caractères'),
  entityName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  entityNameFull: z.string().optional(),
  level: z.number().min(0).max(2), // 0=Holding, 1=Filiale, 2=Sous-filiale
  parentEntityCode: z.string().optional(),
  countryCode: z.string().length(2).optional(),
  countryName: z.string().optional(),
  flagEmoji: z.string().optional(),
  isActive: z.boolean().default(true),
});

type OrganizationFormValues = z.infer<typeof organizationFormSchema>;

interface OrganizationFormProps {
  organization?: Organization;
  onSubmit: (data: OrganizationFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function OrganizationForm({
  organization,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: OrganizationFormProps) {
  const form = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationFormSchema),
    defaultValues: {
      entityCode: organization?.entityCode || '',
      entityName: organization?.entityName || '',
      entityNameFull: organization?.entityNameFull || '',
      level: organization?.level ?? 1,
      parentEntityCode: organization?.parentEntityCode || '',
      countryCode: organization?.countryCode || 'FR',
      countryName: organization?.countryName || 'France',
      flagEmoji: organization?.flagEmoji || '🇫🇷',
      isActive: organization?.isActive ?? true,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="entityCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Code Entité</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: FR_PARIS"
                    {...field}
                    data-testid="input-entity-code"
                  />
                </FormControl>
                <FormDescription>Code unique de l'entité</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="entityName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom de l'entité</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: ADS France"
                    {...field}
                    data-testid="input-entity-name"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="entityNameFull"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom complet (optionnel)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: ADS Group Security France"
                  {...field}
                  data-testid="input-entity-name-full"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Niveau hiérarchique</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  defaultValue={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger data-testid="select-level">
                      <SelectValue placeholder="Sélectionner le niveau" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="0">Holding</SelectItem>
                    <SelectItem value="1">Filiale</SelectItem>
                    <SelectItem value="2">Sous-filiale</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="countryCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Code pays</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: FR"
                    maxLength={2}
                    {...field}
                    data-testid="input-country-code"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="countryName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom du pays</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: France"
                    {...field}
                    data-testid="input-country-name"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="flagEmoji"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Emoji drapeau</FormLabel>
                <FormControl>
                  <Input
                    placeholder="🇫🇷"
                    {...field}
                    data-testid="input-flag-emoji"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Organisation active</FormLabel>
                <FormDescription>
                  Activer ou désactiver cette organisation
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  data-testid="switch-active"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            data-testid="button-cancel"
          >
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting} data-testid="button-submit">
            {isSubmitting ? 'Enregistrement...' : organization ? 'Modifier' : 'Créer'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
