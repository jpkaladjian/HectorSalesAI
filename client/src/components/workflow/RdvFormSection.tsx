import { Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { FormSectionProps } from "./types";

export function RdvFormSection({ form }: FormSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Rendez-vous
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="rdvTitre"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Titre *</FormLabel>
                <FormControl>
                  <Input {...field} data-testid="input-rdv-titre" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rdvDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date et heure *</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} data-testid="input-rdv-date" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rdvDuree"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Durée</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-rdv-duree">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="30min">30 minutes</SelectItem>
                    <SelectItem value="1h">1 heure</SelectItem>
                    <SelectItem value="1h30">1h30</SelectItem>
                    <SelectItem value="2h">2 heures</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rdvLieu"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lieu *</FormLabel>
                <FormControl>
                  <Input {...field} data-testid="input-rdv-lieu" placeholder="Adresse ou Visio" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rdvType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <FormControl>
                  <Input {...field} data-testid="input-rdv-type" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="rdvObjectif"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Objectif du RDV</FormLabel>
              <FormControl>
                <Textarea {...field} data-testid="textarea-rdv-objectif" rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="rdvParticipants"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Participants (séparés par des virgules)</FormLabel>
              <FormControl>
                <Input {...field} data-testid="input-rdv-participants" placeholder="nom1@email.com, nom2@email.com" />
              </FormControl>
              <FormDescription className="text-xs">
                Entrez les emails ou noms des participants, séparés par des virgules
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
