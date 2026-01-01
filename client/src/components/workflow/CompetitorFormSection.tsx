import { Award } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { FormSectionProps } from "./types";

interface CompetitorFormSectionProps extends FormSectionProps {
  concurrents: any[];
}

export function CompetitorFormSection({ form, concurrents }: CompetitorFormSectionProps) {
  return (
    <div className="border-t pt-4 mt-4">
      <div className="flex items-center gap-2 mb-3">
        <Award className="h-4 w-4 text-orange-600" />
        <h3 className="text-sm font-semibold">Échéance Concurrent (Optionnel)</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Capture l'échéance de contrat concurrent pour programmation automatique reconquête J-240
      </p>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="competitorConcurrentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Concurrent actuel</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-competitor-concurrent">
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {concurrents.map((concurrent: any) => (
                      <SelectItem key={concurrent.id} value={concurrent.id}>
                        {concurrent.name}
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
            name="competitorContractEndDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date échéance contrat</FormLabel>
                <FormControl>
                  <Input type="date" {...field} data-testid="input-competitor-end-date" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="competitorMonthlyAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Montant mensuel (EUR)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Ex: 500"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      field.onChange(val === "" ? undefined : parseFloat(val));
                    }}
                    data-testid="input-competitor-monthly-amount"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="competitorSubscriptionType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type d'abonnement</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-competitor-subscription-type">
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

          <FormField
            control={form.control}
            name="competitorNumberOfSites"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre de sites</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    placeholder="Ex: 3"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      field.onChange(val === "" ? undefined : parseInt(val));
                    }}
                    data-testid="input-competitor-number-of-sites"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="competitorAvgContractDurationMonths"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Durée moy. contrat (mois)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    placeholder="Ex: 36"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      field.onChange(val === "" ? undefined : parseInt(val));
                    }}
                    data-testid="input-competitor-avg-contract-duration"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="competitorSolutionsInstalled"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Solutions installées (multi-sélection)</FormLabel>
              <div className="grid grid-cols-2 gap-2">
                {['Gardiennage', 'Télésurveillance', 'Contrôle d\'accès', 'Vidéosurveillance', 'Alarme', 'Autre'].map((solution) => (
                  <div key={solution} className="flex items-center gap-2">
                    <Checkbox
                      id={`solution-wf-${solution}`}
                      checked={(field.value || []).includes(solution)}
                      onCheckedChange={(checked) => {
                        const current = field.value || [];
                        if (checked) {
                          field.onChange([...current, solution]);
                        } else {
                          field.onChange(current.filter((s: string) => s !== solution));
                        }
                      }}
                      data-testid={`checkbox-solution-wf-${solution.toLowerCase().replace(/\s+/g, '-').replace(/'/g, '')}`}
                    />
                    <Label htmlFor={`solution-wf-${solution}`} className="text-sm cursor-pointer">
                      {solution}
                    </Label>
                  </div>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="competitorSatisfactionLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Niveau de satisfaction</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="select-competitor-satisfaction-level">
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="1">Très insatisfait</SelectItem>
                  <SelectItem value="2">Insatisfait</SelectItem>
                  <SelectItem value="3">Neutre</SelectItem>
                  <SelectItem value="4">Satisfait</SelectItem>
                  <SelectItem value="5">Très satisfait</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="competitorSatisfactionNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes satisfaction</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={2}
                  placeholder="Points de douleur, insatisfactions, attentes..."
                  data-testid="textarea-competitor-satisfaction-notes"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="competitorNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes générales</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={2}
                  placeholder="Informations complémentaires..."
                  data-testid="textarea-competitor-notes"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
