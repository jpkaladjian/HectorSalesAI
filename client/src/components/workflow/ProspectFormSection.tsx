import { User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SiretSirenInputs } from "@/components/companies/SiretSirenInputs";
import { CompetitorFormSection } from "./CompetitorFormSection";
import type { ProspectFormSectionProps } from "./types";

export function ProspectFormSection({ form, concurrents, onCompanyEnriched }: ProspectFormSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <User className="h-4 w-4" />
          Prospect
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="prospectNom"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom *</FormLabel>
                <FormControl>
                  <Input {...field} data-testid="input-prospect-nom" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="prospectPrenom"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prénom</FormLabel>
                <FormControl>
                  <Input {...field} data-testid="input-prospect-prenom" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="prospectFonction"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fonction</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ex: Directeur, Responsable Achats" data-testid="input-prospect-fonction" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="prospectEntreprise"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Entreprise</FormLabel>
                <FormControl>
                  <Input {...field} data-testid="input-prospect-entreprise" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="col-span-2">
            <SiretSirenInputs
              siretValue={form.watch("prospectSiret") || ""}
              sirenValue={form.watch("prospectSiren") || ""}
              onSiretChange={(value) => form.setValue("prospectSiret", value)}
              onSirenChange={(value) => form.setValue("prospectSiren", value)}
              onCompanyEnriched={onCompanyEnriched}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Enrichissement automatique CASCADE (INSEE-Pappers) - pré-remplit adresse, ville, secteur
            </p>
          </div>

          <FormField
            control={form.control}
            name="prospectSecteur"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Secteur d'activité</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-prospect-secteur">
                      <SelectValue placeholder="Sélectionner un secteur" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Restauration">Restauration</SelectItem>
                    <SelectItem value="Commerce">Commerce</SelectItem>
                    <SelectItem value="Services">Services</SelectItem>
                    <SelectItem value="Industrie">Industrie</SelectItem>
                    <SelectItem value="BTP">BTP</SelectItem>
                    <SelectItem value="Santé">Santé</SelectItem>
                    <SelectItem value="Transport">Transport</SelectItem>
                    <SelectItem value="Immobilier">Immobilier</SelectItem>
                    <SelectItem value="Hôtellerie">Hôtellerie</SelectItem>
                    <SelectItem value="Agriculture">Agriculture</SelectItem>
                    <SelectItem value="Autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="prospectEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} data-testid="input-prospect-email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="prospectTelephone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Téléphone</FormLabel>
                <FormControl>
                  <Input {...field} data-testid="input-prospect-telephone" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="prospectAdresse1"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adresse 1</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Numéro et nom de rue" data-testid="input-prospect-adresse1" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="prospectAdresse2"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adresse 2</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Complément (bâtiment, étage...)" data-testid="input-prospect-adresse2" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="prospectCodePostal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Code Postal</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="75008" data-testid="input-prospect-code-postal" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="prospectVille"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ville</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Paris" data-testid="input-prospect-ville" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="prospectPays"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pays</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-prospect-pays">
                      <SelectValue placeholder="Sélectionner un pays" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="France">France</SelectItem>
                    <SelectItem value="Luxembourg">Luxembourg</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="prospectEntity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Entité / Pays CRM</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-prospect-entity">
                      <SelectValue placeholder="Détection auto..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="france">France</SelectItem>
                    <SelectItem value="luxembourg">Luxembourg</SelectItem>
                    <SelectItem value="belgique">Belgique</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription className="text-xs">
                  Détecté automatiquement depuis le code postal. Modifiable si incorrect.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="prospectNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea {...field} data-testid="textarea-prospect-notes" rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <CompetitorFormSection form={form} concurrents={concurrents} />
      </CardContent>
    </Card>
  );
}
