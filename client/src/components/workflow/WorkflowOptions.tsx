import { Mail } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import type { WorkflowOptionsProps } from "./types";

export function WorkflowOptions({ form }: WorkflowOptionsProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Éléments à créer</h3>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="createProspect"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2 space-y-0">
              <FormControl>
                <Checkbox
                  data-testid="checkbox-create-prospect"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="text-sm font-normal">
                Créer le prospect
              </FormLabel>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="createOpportunity"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2 space-y-0">
              <FormControl>
                <Checkbox
                  data-testid="checkbox-create-opportunity"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="text-sm font-normal">
                Créer l'opportunité
              </FormLabel>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="createRdv"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2 space-y-0">
              <FormControl>
                <Checkbox
                  data-testid="checkbox-create-rdv"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="text-sm font-normal">
                Créer le RDV
              </FormLabel>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="createAction"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2 space-y-0">
              <FormControl>
                <Checkbox
                  data-testid="checkbox-create-action"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="text-sm font-normal">
                Créer l'action de suivi
              </FormLabel>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sendEmail"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2 space-y-0">
              <FormControl>
                <Checkbox
                  data-testid="checkbox-send-email"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="text-sm font-normal flex items-center gap-1">
                <Mail className="h-3 w-3" />
                Envoyer l'email
              </FormLabel>
            </FormItem>
          )}
        />
      </div>

      {/* Case "Prospect à qualifier" */}
      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md">
        <FormField
          control={form.control}
          name="prospectAQualifier"
          render={({ field }) => (
            <FormItem className="flex items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  data-testid="checkbox-prospect-a-qualifier"
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                    if (checked) {
                      form.setValue("createOpportunity", false);
                      form.setValue("createRdv", false);
                      form.setValue("createAction", false);
                    } else {
                      form.setValue("createOpportunity", true);
                      form.setValue("createRdv", true);
                      form.setValue("createAction", true);
                    }
                  }}
                />
              </FormControl>
              <div className="space-y-1">
                <FormLabel className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                  📋 Prospect à qualifier
                </FormLabel>
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  Si coché : création simplifiée sans workflows. Le prospect ira directement dans le module "Prospects à qualifier" pour compléter les informations au bureau.
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                  Par défaut (décoché) : workflow RDV complet avec opportunité, RDV et actions.
                </p>
              </div>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
