import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Search, AlertTriangle, CheckCircle2, Plus, X } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Schema for individual contract
const contractSchema = z.object({
  concurrentId: z.string().min(1, "Concurrent requis"),
  contractEndDate: z.string().min(1, "Date d'échéance requise"),
  monthlyAmount: z.preprocess(
    (val) => {
      if (val === "" || val === null || val === undefined) return undefined;
      const num = Number(val);
      return isNaN(num) ? undefined : num;
    },
    z.number().nonnegative().optional()
  ),
  solutionsInstalled: z.array(z.string()).optional(),
  subscriptionType: z.enum(['mensuel', 'trimestriel', 'annuel', 'pluriannuel']).optional(),
});

// Main form schema with multiple contracts support
const formSchema = z.object({
  prospectId: z.string().min(1, "Prospect requis"),
  
  // NOUVEAUX CHAMPS P3.6 : Contact & Entreprise (communs à tous les contrats)
  contactFirstName: z.string().optional(),
  contactLastName: z.string().optional(),
  raisonSociale: z.string().optional(),
  enseigne: z.string().optional(),
  siren: z.string().optional(), // SIRET optionnel - Si absent → statut "a_qualifier"
  
  // Multiple contracts (1 à 4)
  contracts: z.array(contractSchema).min(1, "Au moins un contrat requis").max(4, "Maximum 4 contrats"),
  
  // Champs communs
  numberOfSites: z.coerce.number().optional(),
  avgContractDurationMonths: z.coerce.number().optional(),
  satisfactionLevel: z.enum(['satisfied', 'neutral', 'unsatisfied', 'unknown']).optional(),
  satisfactionNotes: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;
type ContractData = z.infer<typeof contractSchema>;

interface SituationConcurrentFormProps {
  onSuccess?: () => void;
}

export function SituationConcurrentForm({ onSuccess }: SituationConcurrentFormProps) {
  const { toast } = useToast();
  const [prospectSearch, setProspectSearch] = useState("");
  const [selectedProspect, setSelectedProspect] = useState<any>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prospectId: "",
      contactFirstName: "",
      contactLastName: "",
      raisonSociale: "",
      enseigne: "",
      siren: "",
      contracts: [
        {
          concurrentId: "",
          contractEndDate: "",
          monthlyAmount: undefined,
          solutionsInstalled: [],
          subscriptionType: undefined,
        }
      ],
      numberOfSites: 1,
      avgContractDurationMonths: 60,
      satisfactionLevel: "unknown",
      satisfactionNotes: "",
      notes: "",
    },
  });

  // Fetch prospects
  const { data: prospectsData } = useQuery({
    queryKey: ['/api/crm/prospects'],
  });

  // Fetch concurrents
  const { data: concurrentsData } = useQuery({
    queryKey: ['/api/competitor/concurrents'],
  });

  // Create situation mutation (with multiple contracts support)
  const createSituation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest('POST', '/api/competitor/situations/batch', data);
      return response;
    },
    onSuccess: (data: any) => {
      const count = data.created || data.contracts?.length || form.getValues('contracts').length;
      toast({
        title: "✅ Échéances créées",
        description: `${count} contrat(s) enregistré(s) avec succès`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/competitor/situations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/competitor/dashboards/bd'] });
      form.reset();
      setSelectedProspect(null);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "❌ Erreur",
        description: error.message || "Impossible de créer les échéances",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createSituation.mutate(data);
  };

  const prospects = (prospectsData as any)?.prospects || [];
  const concurrents = (concurrentsData as any)?.concurrents || [];

  // Group concurrents by type
  const concurrentsByType = {
    national: concurrents.filter((c: any) => c.type === 'national'),
    regional: concurrents.filter((c: any) => c.type === 'regional'),
    local: concurrents.filter((c: any) => c.type === 'local'),
  };

  // Filter prospects based on search
  const filteredProspects = prospects.filter((p: any) =>
    (p.entreprise && p.entreprise.toLowerCase().includes(prospectSearch.toLowerCase())) ||
    (p.siret && p.siret.includes(prospectSearch))
  );

  // Handle prospect selection
  const handleProspectSelect = (prospectId: string) => {
    const prospect = prospects.find((p: any) => p.id === prospectId);
    setSelectedProspect(prospect);
    form.setValue('prospectId', prospectId);
    
    // Auto-fill prospect data if available
    if (prospect) {
      if (prospect.raisonSociale) form.setValue('raisonSociale', prospect.raisonSociale);
      if (prospect.enseigneCommerciale) form.setValue('enseigne', prospect.enseigneCommerciale);
      if (prospect.siret) form.setValue('siren', prospect.siret);
    }
  };

  // Add new contract slot
  const addContract = () => {
    const currentContracts = form.getValues('contracts');
    if (currentContracts.length < 4) {
      form.setValue('contracts', [
        ...currentContracts,
        {
          concurrentId: "",
          contractEndDate: "",
          monthlyAmount: undefined,
          solutionsInstalled: [],
          subscriptionType: undefined,
        }
      ]);
    }
  };

  // Remove contract slot
  const removeContract = (index: number) => {
    const currentContracts = form.getValues('contracts');
    if (currentContracts.length > 1) {
      form.setValue('contracts', currentContracts.filter((_, i) => i !== index));
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Prospect Selection */}
        <div className="space-y-2">
          <Label>Prospect</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Rechercher par nom ou SIRET..."
              value={prospectSearch}
              onChange={(e) => setProspectSearch(e.target.value)}
              data-testid="input-prospect-search"
            />
            <Button type="button" variant="outline" size="icon">
              <Search className="w-4 h-4" />
            </Button>
          </div>
          
          {prospectSearch && prospectSearch.length >= 3 && (
            <Card className="mt-2">
              <CardContent className="p-2 max-h-[200px] overflow-y-auto">
                {filteredProspects.length > 0 ? (
                  <div className="space-y-1">
                    {filteredProspects.slice(0, 10).map((prospect: any) => (
                      <Button
                        key={prospect.id}
                        type="button"
                        variant="ghost"
                        className="w-full justify-start text-left"
                        onClick={() => {
                          handleProspectSelect(prospect.id);
                          setProspectSearch("");
                        }}
                        data-testid={`prospect-option-${prospect.id}`}
                      >
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{prospect.companyName}</span>
                          {prospect.siret && (
                            <span className="text-xs text-muted-foreground">SIRET: {prospect.siret}</span>
                          )}
                        </div>
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-sm text-muted-foreground" data-testid="no-results-message">
                    Aucun prospect trouvé pour "{prospectSearch}"
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {selectedProspect && (
            <Card className="bg-muted">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{selectedProspect.companyName}</p>
                    {selectedProspect.siret && (
                      <p className="text-sm text-muted-foreground">SIRET: {selectedProspect.siret}</p>
                    )}
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
              </CardContent>
            </Card>
          )}

          <FormField
            control={form.control}
            name="prospectId"
            render={({ field }) => (
              <FormItem className="hidden">
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* CONTRATS SECTION - Support multi-contrats */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Contrats concurrent ({form.watch('contracts')?.length || 0}/4)</h3>
              <p className="text-sm text-muted-foreground">Ajoutez jusqu'à 4 contrats pour ce prospect</p>
            </div>
            {form.watch('contracts')?.length < 4 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addContract}
                data-testid="button-add-contract"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un contrat
              </Button>
            )}
          </div>

          {form.watch('contracts')?.map((_, index) => (
            <Card key={index} className="relative">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">Contrat {index + 1}</Badge>
                  {form.watch('contracts').length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeContract(index)}
                      data-testid={`button-remove-contract-${index}`}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <FormField
                  control={form.control}
                  name={`contracts.${index}.concurrentId`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Concurrent</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger data-testid={`select-concurrent-${index}`}>
                            <SelectValue placeholder="Sélectionner concurrent..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {concurrentsByType.national.length > 0 && (
                            <SelectGroup>
                              <SelectLabel>🇫🇷 Concurrents Nationaux</SelectLabel>
                              {concurrentsByType.national.map((c: any) => (
                                <SelectItem key={c.id} value={c.id}>
                                  {c.name}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          )}
                          {concurrentsByType.regional.length > 0 && (
                            <SelectGroup>
                              <SelectLabel>📍 Concurrents Régionaux</SelectLabel>
                              {concurrentsByType.regional.map((c: any) => (
                                <SelectItem key={c.id} value={c.id}>
                                  {c.name}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          )}
                          {concurrentsByType.local.length > 0 && (
                            <SelectGroup>
                              <SelectLabel>🏘️ Concurrents Locaux</SelectLabel>
                              {concurrentsByType.local.map((c: any) => (
                                <SelectItem key={c.id} value={c.id}>
                                  {c.name}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`contracts.${index}.contractEndDate`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date d'échéance contrat</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          data-testid={`input-contract-end-date-${index}`}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Le réveil J-240 sera calculé automatiquement
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`contracts.${index}.monthlyAmount`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Abonnement mensuel (€)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="150.00"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          value={field.value || ""}
                          data-testid={`input-monthly-amount-${index}`}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Montant de l'abonnement mensuel actuel
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`contracts.${index}.subscriptionType`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type d'abonnement</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger data-testid={`select-subscription-type-${index}`}>
                            <SelectValue placeholder="Sélectionner..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="mensuel">Mensuel</SelectItem>
                          <SelectItem value="trimestriel">Trimestriel</SelectItem>
                          <SelectItem value="annuel">Annuel</SelectItem>
                          <SelectItem value="pluriannuel">Pluriannuel</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Informations Contact & Entreprise */}
        <Card className="bg-muted/30">
          <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold text-sm">Informations contact et entreprise</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="contactFirstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prénom contact</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Jean"
                        {...field}
                        data-testid="input-contact-first-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactLastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom contact</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Dupont"
                        {...field}
                        data-testid="input-contact-last-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="raisonSociale"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Raison sociale (nom légal)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="SARL ENTREPRISE DUPONT"
                      {...field}
                      data-testid="input-raison-sociale"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="enseigne"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Enseigne (nom commercial)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Boutique Dupont"
                      {...field}
                      data-testid="input-enseigne"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="siren"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SIRET (optionnel)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="12345678901234"
                      maxLength={14}
                      {...field}
                      data-testid="input-siren"
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Si SIRET absent → échéance envoyée dans "À qualifier"
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Nombre de sites et Durée contrat */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="numberOfSites"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre de sites</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    {...field}
                    data-testid="input-number-of-sites"
                  />
                </FormControl>
                <FormDescription>
                  Nombre de sites couverts par le contrat
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="avgContractDurationMonths"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Durée contrat (mois)</FormLabel>
                <Select
                  value={field.value?.toString()}
                  onValueChange={(value) => field.onChange(parseInt(value))}
                >
                  <FormControl>
                    <SelectTrigger data-testid="select-contract-duration">
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="12">1 an (12 mois)</SelectItem>
                    <SelectItem value="24">2 ans (24 mois)</SelectItem>
                    <SelectItem value="36">3 ans (36 mois)</SelectItem>
                    <SelectItem value="48">4 ans (48 mois)</SelectItem>
                    <SelectItem value="60">5 ans (60 mois)</SelectItem>
                    <SelectItem value="72">6 ans (72 mois)</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Durée habituelle des contrats
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Satisfaction */}
        <FormField
          control={form.control}
          name="satisfactionLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Niveau de satisfaction client</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger data-testid="select-satisfaction-level">
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="satisfied">✅ Satisfait</SelectItem>
                  <SelectItem value="neutral">😐 Neutre</SelectItem>
                  <SelectItem value="unsatisfied">❌ Insatisfait</SelectItem>
                  <SelectItem value="unknown">❓ Inconnu</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Niveau de satisfaction du prospect avec son prestataire actuel
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Notes Satisfaction */}
        <FormField
          control={form.control}
          name="satisfactionNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes sur la satisfaction (optionnel)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Détails sur la satisfaction, points de friction, opportunités..."
                  className="resize-none"
                  rows={2}
                  {...field}
                  data-testid="textarea-satisfaction-notes"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes générales (optionnel)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Informations complémentaires..."
                  className="resize-none"
                  rows={3}
                  {...field}
                  data-testid="textarea-notes"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <div className="flex gap-2">
          <Button
            type="submit"
            className="flex-1"
            disabled={createSituation.isPending}
            data-testid="button-submit-situation"
          >
            {createSituation.isPending ? "Enregistrement..." : "Créer Échéance"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
