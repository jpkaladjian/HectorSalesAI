import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Save, Loader2, Wifi } from 'lucide-react';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SCHEMA ZOD VALIDATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const formSchema = z.object({
  entity: z.enum(['france', 'luxembourg', 'belgique'], {
    required_error: 'Entité requise',
  }),
  agencyLocation: z
    .string()
    .min(2, 'Code agence trop court (min 2 caractères)')
    .max(50, 'Code agence trop long (max 50 caractères)'),
  agencyName: z
    .string()
    .min(3, 'Nom agence trop court (min 3 caractères)')
    .max(100, 'Nom agence trop long (max 100 caractères)'),
  displayName: z
    .string()
    .min(3, 'Nom affichage trop court (min 3 caractères)')
    .max(100, 'Nom affichage trop long (max 100 caractères)'),
  twilioAccountSid: z
    .string()
    .min(34, 'Account SID invalide (34 caractères attendus)')
    .startsWith('AC', 'Account SID doit commencer par AC'),
  twilioAuthToken: z
    .string()
    .min(32, 'Auth Token trop court (min 32 caractères)'),
  twilioPhoneNumber: z
    .string()
    .regex(/^\+\d{10,15}$/, 'Format numéro invalide (ex: +33612345678)'),
  twilioTwimlAppSid: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.startsWith('AP'),
      'TwiML App SID doit commencer par AP'
    ),
  coverageArea: z
    .string()
    .min(1, 'Zone de couverture requise (ex: 75, 92, 93)'),
  isBackup: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

type FormData = z.infer<typeof formSchema>;

interface AddConfigModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddConfigModal({ open, onClose, onSuccess }: AddConfigModalProps) {
  const [testing, setTesting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      entity: 'france',
      agencyLocation: '',
      agencyName: '',
      displayName: '',
      twilioAccountSid: '',
      twilioAuthToken: '',
      twilioPhoneNumber: '',
      twilioTwimlAppSid: '',
      coverageArea: '',
      isBackup: false,
      isActive: true,
    },
  });

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const values = form.getValues();
      
      // Validation partielle des champs Twilio
      const testResult = await formSchema
        .pick({
          twilioAccountSid: true,
          twilioAuthToken: true,
          twilioPhoneNumber: true,
        })
        .safeParseAsync({
          twilioAccountSid: values.twilioAccountSid,
          twilioAuthToken: values.twilioAuthToken,
          twilioPhoneNumber: values.twilioPhoneNumber,
        });
      
      if (!testResult.success) {
        toast({
          title: 'Erreur de validation',
          description: 'Vérifie les credentials Twilio avant de tester',
          variant: 'destructive',
        });
        return;
      }

      // Appel API backend pour test connexion réelle
      await apiRequest('POST', '/api/admin/phone/test-connection', {
        twilioAccountSid: values.twilioAccountSid,
        twilioAuthToken: values.twilioAuthToken,
        twilioPhoneNumber: values.twilioPhoneNumber,
      });

      toast({
        title: 'Succès',
        description: 'Connexion Twilio validée avec succès',
      });
    } catch (error: any) {
      console.error('Test connection failed:', error);
      toast({
        title: 'Échec du test',
        description: error.message || 'Impossible de valider les credentials Twilio',
        variant: 'destructive',
      });
    } finally {
      setTesting(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      const payload = {
        ...data,
        coverageArea: data.coverageArea
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      };

      await apiRequest('POST', '/api/admin/phone/configurations/create-dynamic', payload);

      toast({
        title: 'Succès',
        description: 'Configuration créée avec succès',
      });

      form.reset();
      onSuccess();
    } catch (error: any) {
      console.error('Error creating config:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Erreur lors de la création',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>➕ Ajouter numéro Twilio</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Entity */}
            <FormField
              control={form.control}
              name="entity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Entité *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    data-testid="select-entity"
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionne une entité" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="france">🇫🇷 France</SelectItem>
                      <SelectItem value="luxembourg">🇱🇺 Luxembourg</SelectItem>
                      <SelectItem value="belgique">🇧🇪 Belgique</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Agency Location */}
            <FormField
              control={form.control}
              name="agencyLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code Agence *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="ex: paris-75001"
                      data-testid="input-agency-location"
                    />
                  </FormControl>
                  <FormDescription>
                    Identifiant unique de l'agence
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Agency Name */}
            <FormField
              control={form.control}
              name="agencyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom Agence *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="ex: ADS GROUP Paris Opéra"
                      data-testid="input-agency-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Display Name */}
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom Affichage *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="ex: Config Principal Paris"
                      data-testid="input-display-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Twilio Credentials Section */}
            <div className="border-t pt-4 mt-4">
              <h3 className="text-sm font-semibold mb-3">Credentials Twilio</h3>

              <div className="space-y-4">
                {/* Account SID */}
                <FormField
                  control={form.control}
                  name="twilioAccountSid"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account SID *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                          data-testid="input-account-sid"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Auth Token */}
                <FormField
                  control={form.control}
                  name="twilioAuthToken"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Auth Token *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="••••••••••••••••••••••••••••••••"
                          data-testid="input-auth-token"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Phone Number */}
                <FormField
                  control={form.control}
                  name="twilioPhoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Numéro de téléphone *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="+33612345678"
                          data-testid="input-phone-number"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* TwiML App SID */}
                <FormField
                  control={form.control}
                  name="twilioTwimlAppSid"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>TwiML App SID (optionnel)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="APxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                          data-testid="input-twiml-app-sid"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Test Connection Button */}
              <Button
                type="button"
                variant="outline"
                onClick={handleTestConnection}
                disabled={testing}
                className="mt-4"
                data-testid="button-test-connection"
              >
                {testing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Test en cours...
                  </>
                ) : (
                  <>
                    <Wifi className="mr-2 h-4 w-4" />
                    Tester connexion
                  </>
                )}
              </Button>
            </div>

            {/* Coverage Area */}
            <FormField
              control={form.control}
              name="coverageArea"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zone de couverture (départements) *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="ex: 75, 92, 93"
                      data-testid="input-coverage-area"
                    />
                  </FormControl>
                  <FormDescription>
                    Séparés par des virgules
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Checkboxes */}
            <div className="space-y-3">
              <FormField
                control={form.control}
                name="isBackup"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-is-backup"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Numéro de backup (inactif par défaut)</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-is-active"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Activer immédiatement</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                data-testid="button-cancel"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                data-testid="button-submit"
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Enregistrer
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
