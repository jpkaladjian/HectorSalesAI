import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Calendar, TrendingUp, Building2, Shield, X, Edit } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const formSchema = z.object({
  contractEndDate: z.string().min(1, "Date d'échéance requise"),
  contactFirstName: z.string().optional(),
  contactLastName: z.string().optional(),
  raisonSociale: z.string().optional(),
  enseigne: z.string().optional(),
  siren: z.string().optional(),
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
  numberOfSites: z.coerce.number().optional(),
  avgContractDurationMonths: z.coerce.number().optional(),
  satisfactionLevel: z.enum(['satisfied', 'neutral', 'unsatisfied', 'unknown']).optional(),
  satisfactionNotes: z.string().optional(),
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface SituationDetailDialogProps {
  situationId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SituationDetailDialog({ situationId, open, onOpenChange }: SituationDetailDialogProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contractEndDate: "",
      contactFirstName: "",
      contactLastName: "",
      raisonSociale: "",
      enseigne: "",
      siren: "",
      monthlyAmount: undefined,
      solutionsInstalled: [],
      subscriptionType: undefined,
      numberOfSites: 1,
      avgContractDurationMonths: 60,
      satisfactionLevel: "unknown",
      satisfactionNotes: "",
      notes: "",
      internalNotes: "",
    },
  });

  // Fetch situation details
  const { data: situationData, isLoading } = useQuery({
    queryKey: [`/api/competitor/situations/${situationId}`],
    enabled: !!situationId && open,
  });

  const situation = (situationData as any)?.situation;
  const prospect = (situationData as any)?.prospect;
  const concurrent = (situationData as any)?.concurrent;

  // Update form when situation data loads
  useEffect(() => {
    if (situation) {
      form.reset({
        contractEndDate: situation.contractEndDate || "",
        contactFirstName: situation.contactFirstName || "",
        contactLastName: situation.contactLastName || "",
        raisonSociale: situation.raisonSociale || "",
        enseigne: situation.enseigne || "",
        siren: situation.siren || "",
        monthlyAmount: situation.monthlyAmount,
        solutionsInstalled: situation.solutionsInstalled || [],
        subscriptionType: situation.subscriptionType,
        numberOfSites: situation.numberOfSites || 1,
        avgContractDurationMonths: situation.avgContractDurationMonths || 60,
        satisfactionLevel: situation.satisfactionLevel || "unknown",
        satisfactionNotes: situation.satisfactionNotes || "",
        notes: situation.notes || "",
        internalNotes: situation.internalNotes || "",
      });
    }
  }, [situation, form]);

  // Update situation mutation
  const updateSituation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest('PATCH', `/api/competitor/situations/${situationId}`, data);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "✅ Échéance mise à jour",
        description: "Les modifications ont été enregistrées avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/competitor/situations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/competitor/dashboards/bd'] });
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast({
        title: "❌ Erreur",
        description: error.message || "Impossible de mettre à jour l'échéance",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    updateSituation.mutate(data);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      a_qualifier: { label: "À qualifier", variant: "outline" },
      future: { label: "Futur", variant: "secondary" },
      active: { label: "Actif", variant: "default" },
      won: { label: "Gagné", variant: "default" },
      lost: { label: "Perdu", variant: "destructive" },
      archived: { label: "Archivé", variant: "outline" },
    };
    const config = variants[status] || variants.future;
    return <Badge variant={config.variant} data-testid={`badge-status-${status}`}>{config.label}</Badge>;
  };

  if (!situation || isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chargement...</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8 text-muted-foreground">
            Chargement des détails...
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl">
                {prospect?.entreprise || 'N/A'} - {concurrent?.name || 'N/A'}
              </DialogTitle>
              <DialogDescription className="mt-2">
                Échéance: {new Date(situation.contractEndDate).toLocaleDateString('fr-FR')} • 
                Réveil: {new Date(situation.wakeupDate).toLocaleDateString('fr-FR')}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(situation.status)}
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsEditing(!isEditing)}
                data-testid="button-edit-situation"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" data-testid="tab-overview">
              <Building2 className="w-4 h-4 mr-2" />
              Aperçu
            </TabsTrigger>
            <TabsTrigger value="edit" data-testid="tab-edit">
              <Shield className="w-4 h-4 mr-2" />
              Informations
            </TabsTrigger>
            <TabsTrigger value="history" data-testid="tab-history">
              <Calendar className="w-4 h-4 mr-2" />
              Historique
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium">Prospect</CardTitle>
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold">{prospect?.entreprise || 'N/A'}</p>
                  {prospect?.siren && (
                    <p className="text-sm text-muted-foreground mt-1">SIREN: {prospect.siren}</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium">Concurrent</CardTitle>
                  <Shield className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold">{concurrent?.name || 'N/A'}</p>
                  <p className="text-sm text-muted-foreground mt-1">{concurrent?.type || 'N/A'}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium">Contact</CardTitle>
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold">
                    {situation.contactFirstName && situation.contactLastName 
                      ? `${situation.contactFirstName} ${situation.contactLastName}`
                      : 'N/A'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium">Enseigne</CardTitle>
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold">
                    {situation.enseigne || 'N/A'}
                  </p>
                  {situation.raisonSociale && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Raison sociale: {situation.raisonSociale}
                    </p>
                  )}
                </CardContent>
              </Card>

              {situation.monthlyAmount && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
                    <CardTitle className="text-sm font-medium">Abonnement mensuel</CardTitle>
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-semibold">{situation.monthlyAmount}€/mois</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Solutions Installées */}
            {situation.solutionsInstalled && situation.solutionsInstalled.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Solutions installées</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {situation.solutionsInstalled.map((sol: string) => (
                      <Badge key={sol} variant="outline">{sol.replace(/_/g, ' ')}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Satisfaction */}
            {situation.satisfactionLevel && situation.satisfactionLevel !== 'unknown' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Satisfaction client</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-medium">
                      Niveau: {
                        situation.satisfactionLevel === 'satisfied' ? '✅ Satisfait' :
                        situation.satisfactionLevel === 'neutral' ? '😐 Neutre' :
                        situation.satisfactionLevel === 'unsatisfied' ? '❌ Insatisfait' : '❓ Inconnu'
                      }
                    </p>
                    {situation.satisfactionNotes && (
                      <p className="text-sm text-muted-foreground">{situation.satisfactionNotes}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {situation.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{situation.notes}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Edit Tab */}
          <TabsContent value="edit" className="space-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Contract End Date */}
                <FormField
                  control={form.control}
                  name="contractEndDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date d'échéance contrat</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          disabled={!isEditing}
                          data-testid="input-contract-end-date"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Contact & Entreprise */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm">Informations contact et entreprise</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                              disabled={!isEditing}
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
                              disabled={!isEditing}
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
                            disabled={!isEditing}
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
                            disabled={!isEditing}
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
                            disabled={!isEditing}
                            data-testid="input-siren"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Monthly Amount */}
                <FormField
                  control={form.control}
                  name="monthlyAmount"
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
                          disabled={!isEditing}
                          data-testid="input-monthly-amount-edit"
                        />
                      </FormControl>
                      <FormDescription>
                        Montant de l'abonnement mensuel actuel
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Solutions Installées */}
                <FormField
                  control={form.control}
                  name="solutionsInstalled"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Solutions installées</FormLabel>
                        <FormDescription>
                          Sélectionnez toutes les solutions actuellement en place
                        </FormDescription>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                          { value: 'alarme_intrusion', label: 'Alarme intrusion' },
                          { value: 'telesurveillance_classique', label: 'Télésurveillance classique' },
                          { value: 'intervention_gardien', label: 'Intervention gardien' },
                          { value: 'videosurveillance', label: 'Vidéosurveillance' },
                          { value: 'controle_acces', label: 'Contrôle d\'accès' },
                          { value: 'detection_incendie', label: 'Détection incendie' },
                          { value: 'autre', label: 'Autre' },
                        ].map((solution) => (
                          <FormField
                            key={solution.value}
                            control={form.control}
                            name="solutionsInstalled"
                            render={({ field }) => {
                              const values = field.value || [];
                              return (
                                <FormItem
                                  key={solution.value}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={values.includes(solution.value)}
                                      onCheckedChange={(checked) => {
                                        const newValues = checked
                                          ? [...values, solution.value]
                                          : values.filter((v) => v !== solution.value);
                                        field.onChange(newValues);
                                      }}
                                      disabled={!isEditing}
                                      data-testid={`checkbox-solution-${solution.value}`}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {solution.label}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Type d'abonnement */}
                <FormField
                  control={form.control}
                  name="subscriptionType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type d'abonnement</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={!isEditing}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-subscription-type">
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
                      <FormDescription>
                        Type de facturation du contrat concurrent
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                            disabled={!isEditing}
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
                          disabled={!isEditing}
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
                        disabled={!isEditing}
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
                      <FormLabel>Notes sur la satisfaction</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Détails sur la satisfaction, points de friction, opportunités..."
                          className="resize-none"
                          rows={2}
                          {...field}
                          disabled={!isEditing}
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
                      <FormLabel>Notes générales</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Informations complémentaires..."
                          className="resize-none"
                          rows={3}
                          {...field}
                          disabled={!isEditing}
                          data-testid="textarea-notes"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Internal Notes */}
                <FormField
                  control={form.control}
                  name="internalNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes internes (privées)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Notes internes non visibles par le client..."
                          className="resize-none"
                          rows={2}
                          {...field}
                          disabled={!isEditing}
                          data-testid="textarea-internal-notes"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Action Buttons */}
                <div className="flex gap-2 justify-end">
                  {!isEditing ? (
                    <Button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      data-testid="button-start-edit"
                    >
                      Modifier
                    </Button>
                  ) : (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false);
                          form.reset();
                        }}
                        data-testid="button-cancel-edit"
                      >
                        Annuler
                      </Button>
                      <Button
                        type="submit"
                        disabled={updateSituation.isPending}
                        data-testid="button-save-edit"
                      >
                        {updateSituation.isPending ? "Enregistrement..." : "Enregistrer"}
                      </Button>
                    </>
                  )}
                </div>
              </form>
            </Form>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Historique des tentatives</CardTitle>
                <CardDescription>Suivi des actions de reconquête</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center py-4">
                  Historique à venir (Tentative #{situation.attemptNumber || 1})
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
