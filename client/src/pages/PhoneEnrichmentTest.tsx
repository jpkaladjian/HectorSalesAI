import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Phone, Building2, Hash, Database, Clock, Euro, CheckCircle2, Target } from "lucide-react";

interface EnrichmentResult {
  success: boolean;
  company?: {
    id: string;
    legalName: string;
    identifierValue: string;
    identifierType: string;
    addressLine1?: string;
    city?: string;
    postalCode?: string;
    phoneLookupSource?: string;
    phoneLookupConfidence?: number;
  };
  metadata?: {
    phone: string;
    phoneLookupSource?: string;
    siret?: string;
    enrichmentSource?: string;
    cost?: number;
    duration?: number;
    savingsRealized?: number;
  };
  message?: string;
  error?: string;
}

const SOURCE_CONFIG = {
  pagesjaunes: {
    name: "Pages Jaunes",
    icon: "📒",
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
  },
  "118712": {
    name: "118 712",
    icon: "📞",
    color: "bg-blue-100 text-blue-800 border-blue-300",
  },
  "118218": {
    name: "118 218",
    icon: "📱",
    color: "bg-purple-100 text-purple-800 border-purple-300",
  },
} as const;

export default function PhoneEnrichmentTest() {
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<EnrichmentResult | null>(null);
  const { toast } = useToast();

  const enrichMutation = useMutation({
    mutationFn: async (phoneNumber: string) => {
      return apiRequest(
        "POST",
        "/api/companies/enrich-by-phone",
        { phone: phoneNumber }
      ) as Promise<EnrichmentResult>;
    },
    onSuccess: (data) => {
      setResult(data);
      if (data.success) {
        toast({
          title: "✅ Enrichissement réussi",
          description: `Entreprise "${data.company?.legalName}" trouvée`,
        });
      } else {
        toast({
          title: "⚠️ Aucune entreprise trouvée",
          description: data.message || data.error,
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
    if (!phone.trim()) {
      toast({
        title: "⚠️ Téléphone requis",
        description: "Veuillez saisir un numéro de téléphone",
        variant: "destructive",
      });
      return;
    }
    setResult(null);
    enrichMutation.mutate(phone);
  };

  const getSourceBadge = (source?: string) => {
    if (!source) return null;
    const config = SOURCE_CONFIG[source as keyof typeof SOURCE_CONFIG];
    if (!config) return null;

    return (
      <Badge 
        data-testid="badge-phone-source"
        className={`gap-1.5 ${config.color}`}
      >
        <span>{config.icon}</span>
        <span>{config.name}</span>
      </Badge>
    );
  };

  const getConfidenceBadge = (confidence?: number) => {
    if (confidence === undefined) return null;

    let variant: "default" | "secondary" | "destructive" = "secondary";
    let label = "Moyenne";
    
    if (confidence >= 80) {
      variant = "default";
      label = "Élevée";
    } else if (confidence >= 50) {
      variant = "secondary";
      label = "Moyenne";
    } else {
      variant = "destructive";
      label = "Faible";
    }

    return (
      <Badge variant={variant} className="gap-1">
        <Target className="w-3 h-3" />
        Confiance : {label} ({confidence}%)
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Test Enrichissement Téléphone</h1>
          <p className="text-muted-foreground mt-2">
            Phase 2.7 CASCADE Multi-Sources : Téléphone → (Pages Jaunes → 118 712 → 118 218) → SIRET → INSEE/Pappers
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="outline" className="gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Taux succès : 65-70%
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Euro className="w-3 h-3" />
              100% gratuit
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Clock className="w-3 h-3" />
              2-7 secondes
            </Badge>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Recherche par téléphone
            </CardTitle>
            <CardDescription>
              Saisissez un numéro de téléphone français (ex: 01 23 45 67 89 ou 04 74 18 14 05)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2">
                <Input
                  data-testid="input-phone"
                  type="tel"
                  placeholder="04 74 18 14 05"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1"
                />
                <Button
                  data-testid="button-enrichir"
                  type="submit"
                  disabled={enrichMutation.isPending}
                >
                  {enrichMutation.isPending ? "Recherche..." : "Enrichir"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {enrichMutation.isPending && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
                  <span>Recherche en cours via fallback multi-sources...</span>
                </div>
                <div className="text-sm text-muted-foreground pl-8 space-y-1">
                  <div>📒 Tentative 1/3 : Pages Jaunes...</div>
                  <div>📞 Si échec → Tentative 2/3 : 118 712...</div>
                  <div>📱 Si échec → Tentative 3/3 : 118 218...</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {result && result.success && result.company && (
          <Card data-testid="card-result-success">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <Building2 className="w-5 h-5" />
                Entreprise trouvée
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Nom de l'entreprise</div>
                  <div data-testid="text-company-name" className="text-lg font-semibold">
                    {result.company.legalName}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                      <Hash className="w-4 h-4" />
                      SIRET
                    </div>
                    <div data-testid="text-siret" className="font-mono">
                      {result.company.identifierValue}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      Téléphone recherché
                    </div>
                    <div data-testid="text-phone">{result.metadata?.phone}</div>
                  </div>
                </div>

                {result.company.addressLine1 && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Adresse</div>
                    <div className="text-sm">
                      {result.company.addressLine1}
                      {result.company.postalCode && result.company.city && (
                        <span>, {result.company.postalCode} {result.company.city}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <div className="text-sm font-medium mb-3">📞 Source téléphone (Phase 2.7)</div>
                <div className="flex flex-wrap gap-2">
                  {getSourceBadge(result.metadata?.phoneLookupSource || result.company.phoneLookupSource)}
                  {getConfidenceBadge(result.company.phoneLookupConfidence)}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="text-sm font-medium mb-3">💾 Source enrichissement (CASCADE)</div>
                <div className="flex flex-wrap gap-2">
                  {result.metadata?.enrichmentSource && (
                    <Badge 
                      data-testid="badge-enrichment-source"
                      variant={result.metadata.enrichmentSource === 'insee' ? 'default' : 'secondary'}
                      className="gap-1"
                    >
                      <Database className="w-3 h-3" />
                      {result.metadata.enrichmentSource.toUpperCase()}
                      {result.metadata.enrichmentSource === 'insee' && ' (0€ - Gratuit !)'}
                      {result.metadata.enrichmentSource === 'pappers' && ' (0,10€)'}
                    </Badge>
                  )}
                </div>
              </div>

              {result.metadata && (
                <div className="border-t pt-4 grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground mb-1 flex items-center gap-1">
                      <Euro className="w-3 h-3" />
                      Coût total
                    </div>
                    <div data-testid="text-cost" className="font-semibold">
                      {result.metadata.cost !== undefined 
                        ? `${(result.metadata.cost / 100).toFixed(2)}€`
                        : 'N/A'}
                    </div>
                  </div>

                  <div>
                    <div className="text-muted-foreground mb-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Durée
                    </div>
                    <div data-testid="text-duration">
                      {result.metadata.duration 
                        ? `${(result.metadata.duration / 1000).toFixed(1)}s`
                        : 'N/A'}
                    </div>
                  </div>

                  <div>
                    <div className="text-muted-foreground mb-1">💰 Économie</div>
                    <div data-testid="text-savings" className="font-semibold text-green-600">
                      {result.metadata.savingsRealized !== undefined
                        ? `${result.metadata.savingsRealized.toFixed(2)}€`
                        : 'N/A'}
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-green-50 border border-green-200 rounded-md p-3 text-sm">
                <div className="font-semibold text-green-800 mb-1">✅ Workflow complet</div>
                <div className="text-green-700 space-y-0.5">
                  <div>1. Téléphone → {result.metadata?.phoneLookupSource || result.company.phoneLookupSource} (SIRET trouvé)</div>
                  <div>2. SIRET → CASCADE {result.metadata?.enrichmentSource?.toUpperCase()} (données enrichies)</div>
                  <div>3. Économies maintenues : {result.metadata?.cost === 0 ? '100%' : '0%'} via INSEE gratuit</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {result && !result.success && (
          <Card data-testid="card-result-error" className="border-destructive">
            <CardContent className="pt-6">
              <div className="text-destructive">
                <div className="font-semibold mb-1">❌ {result.message || "Erreur"}</div>
                {result.error && (
                  <div className="text-sm text-muted-foreground">{result.error}</div>
                )}
                <div className="mt-3 text-sm text-muted-foreground">
                  Les 3 sources ont été testées (Pages Jaunes → 118 712 → 118 218) sans succès.
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">ℹ️ Phase 2.7 : Fallback Multi-Sources (100% gratuit)</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <div className="flex items-start gap-2">
              <span className="font-semibold text-foreground">1.</span>
              <span>
                <strong className="text-foreground">Fallback intelligent</strong> : 
                Pages Jaunes → 118 712 → 118 218 (jusqu'à trouver le SIRET)
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold text-foreground">2.</span>
              <span>
                <strong className="text-foreground">CASCADE enrichissement</strong> : 
                INSEE (gratuit) en priorité, fallback Pappers (0,10€) si échec
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold text-foreground">3.</span>
              <span>
                <strong className="text-foreground">Tracking source</strong> : 
                Sauvegarde quelle source a trouvé le SIRET (pour analytics)
              </span>
            </div>
            <div className="mt-3 p-3 bg-muted rounded-md space-y-1">
              <div><strong>🎯 Objectif Phase 2.7 :</strong></div>
              <div className="pl-4 space-y-0.5">
                <div>• Taux succès : 65-70% (au lieu de 40% avec Pages Jaunes seul)</div>
                <div>• Coût : 100% gratuit (aucune API payante pour téléphone)</div>
                <div>• Temps moyen : 2-7 secondes (selon source trouvée)</div>
                <div>• Économies CASCADE maintenues : 80-90% via INSEE</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
