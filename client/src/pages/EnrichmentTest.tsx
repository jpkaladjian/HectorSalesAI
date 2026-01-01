/**
 * Page de test enrichissement SIRET - Phase 2.8
 * Test complet de l'enrichissement CASCADE avec toutes les nouvelles données
 */

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CompanyOverview } from '@/components/companies/CompanyOverview';
import { apiRequest } from '@/lib/queryClient';
import { Search, Loader2 } from 'lucide-react';
import type { Company } from '@shared/schema';

interface EnrichmentResult {
  success: boolean;
  company: Company | null;
  message?: string;
  error?: string;
}

export default function EnrichmentTest() {
  const [siret, setSiret] = useState("");
  const [enrichedCompany, setEnrichedCompany] = useState<Company | null>(null);
  const { toast } = useToast();

  const enrichMutation = useMutation({
    mutationFn: async (identifier: string) => {
      return apiRequest(
        "POST",
        "/api/companies/enrich",
        { identifier, triggerType: "manual" }
      ) as Promise<EnrichmentResult>;
    },
    onSuccess: (data) => {
      if (data.success && data.company) {
        setEnrichedCompany(data.company);
        toast({
          title: "✅ Enrichissement réussi",
          description: `Entreprise "${data.company.legalName}" enrichie avec succès`,
        });
      } else {
        toast({
          title: "⚠️ Échec enrichissement",
          description: data.message || data.error || "Entreprise non trouvée",
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSiret = siret.replace(/[\s\-\.]/g, '');
    
    if (!/^\d{9}$|^\d{14}$/.test(cleanSiret)) {
      toast({
        title: "⚠️ Format invalide",
        description: "Veuillez saisir un SIREN (9 chiffres) ou SIRET (14 chiffres)",
        variant: "destructive",
      });
      return;
    }
    
    setEnrichedCompany(null);
    enrichMutation.mutate(cleanSiret);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Test Enrichissement CASCADE - Phase 2.8</CardTitle>
          <CardDescription>
            Testez l'enrichissement complet avec alertes juridiques, coordonnées, adresse GPS, effectif, capital, TVA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siret">SIRET ou SIREN</Label>
              <div className="flex gap-2">
                <Input
                  id="siret"
                  type="text"
                  placeholder="552032534 (SIREN) ou 55203253400120 (SIRET)"
                  value={siret}
                  onChange={(e) => setSiret(e.target.value)}
                  disabled={enrichMutation.isPending}
                  data-testid="input-siret"
                  className="flex-1"
                />
                <Button 
                  type="submit" 
                  disabled={enrichMutation.isPending}
                  data-testid="button-enrich"
                >
                  {enrichMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enrichissement...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Enrichir
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Format : SIREN (9 chiffres) ou SIRET (14 chiffres)
              </p>
            </div>

            <div className="rounded-lg bg-muted/50 p-4 space-y-2 text-sm">
              <p className="font-medium">Exemples de test :</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li><code>552032534</code> - Carrefour France (SIREN)</li>
                <li><code>55203253400120</code> - Carrefour France (SIRET siège)</li>
                <li><code>732829320</code> - Tesla France (SIREN)</li>
              </ul>
            </div>
          </form>
        </CardContent>
      </Card>

      {enrichedCompany && (
        <CompanyOverview 
          companyId={enrichedCompany.id} 
          showEstablishments={true}
        />
      )}
    </div>
  );
}
