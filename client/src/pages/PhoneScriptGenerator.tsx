import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { 
  Phone, 
  Loader2, 
  MessageSquare, 
  Target, 
  Lightbulb,
  CheckCircle,
  Clock,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Prospect } from "@shared/schema";

interface PhoneScriptGeneratorProps {
  prospect: Prospect;
  onClose?: () => void;
}

interface CallScript {
  accroche: string;
  questions_decouverte: string[];
  proposition_valeur: string;
  closing_rdv: string;
  objections_probables: Array<{
    objection: string;
    reponse: string;
  }>;
  conseils_commerciaux: string[];
  duree_estimee_secondes: number;
}

export default function PhoneScriptGenerator({ prospect, onClose }: PhoneScriptGeneratorProps) {
  const [script, setScript] = useState<CallScript | null>(null);
  const { toast } = useToast();

  const generateMutation = useMutation({
    mutationFn: async () => {
      // Construire l'objet prospect pour l'IA
      const prospectData = {
        nom: prospect.nom,
        fonction: prospect.fonction || "Décideur",
        entreprise: prospect.entreprise,
        secteur: prospect.secteur || "Autre",
        effectif: prospect.effectifEntreprise ? parseInt(prospect.effectifEntreprise) : 10,
        ca_estime: prospect.chiffreAffaires ? parseInt(prospect.chiffreAffaires.toString()) : 100000,
        disc_profile: {
          D: 50, // Valeurs par défaut - TODO: intégrer vraies données DISC
          I: 50,
          S: 50,
          C: 50,
          dominant: "D"
        },
        points_cles: [
          prospect.enseigneCommerciale ? `Enseigne: ${prospect.enseigneCommerciale}` : "",
          prospect.ville ? `Localisation: ${prospect.ville}` : "",
          prospect.notes || ""
        ].filter(Boolean),
        historique_interactions: [],
        veille_web: []
      };

      const response = await apiRequest("POST", "/api/ai/generate-script", {
        prospect: prospectData,
        commercial: { nom: "Commercial", experience: "senior" }
      });

      return response;
    },
    onSuccess: (data) => {
      if (data.success && data.script) {
        setScript(data.script);
        toast({
          title: "✅ Script généré",
          description: `Généré en ${data.duration_seconds?.toFixed(1)}s`,
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de générer le script",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    generateMutation.mutate();
  };

  return (
    <div className="space-y-6">
      {/* En-tête Prospect */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">
                {prospect.prenom} {prospect.nom}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {prospect.fonction || "Décideur"} • {prospect.entreprise}
              </p>
            </div>
            <Badge variant="outline">{prospect.secteur || "Autre"}</Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Bouton Génération */}
      {!script && (
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">
            Génère un script d'appel personnalisé adapté au profil du prospect
          </p>
          <Button 
            onClick={handleGenerate} 
            disabled={generateMutation.isPending}
            size="lg"
            data-testid="button-generate-script"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <Phone className="mr-2 h-4 w-4" />
                Générer le script IA
              </>
            )}
          </Button>
        </div>
      )}

      {/* Affichage du Script */}
      {script && (
        <div className="space-y-4">
          {/* Durée estimée */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-primary" />
                <span className="font-medium">Durée estimée:</span>
                <Badge variant="secondary">
                  {Math.floor(script.duree_estimee_secondes / 60)} min {script.duree_estimee_secondes % 60} sec
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Accroche */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">1. Accroche</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{script.accroche}</p>
            </CardContent>
          </Card>

          {/* Questions Découverte */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">2. Questions Découverte</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {script.questions_decouverte.map((question, idx) => (
                  <li key={idx} className="flex gap-2 text-sm">
                    <span className="font-semibold text-primary shrink-0">Q{idx + 1}:</span>
                    <span>{question}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Proposition Valeur */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">3. Proposition de Valeur</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{script.proposition_valeur}</p>
            </CardContent>
          </Card>

          {/* Closing RDV */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">4. Closing RDV</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{script.closing_rdv}</p>
            </CardContent>
          </Card>

          {/* Objections */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <CardTitle className="text-base">5. Objections Probables</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {script.objections_probables.map((obj, idx) => (
                  <div key={idx} className="border-l-2 border-amber-500 pl-3">
                    <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                      "{obj.objection}"
                    </p>
                    <p className="text-sm mt-1 text-muted-foreground">
                      → {obj.reponse}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Conseils */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-blue-500" />
                <CardTitle className="text-base">6. Conseils Commerciaux</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {script.conseils_commerciaux.map((conseil, idx) => (
                  <li key={idx} className="flex gap-2 text-sm">
                    <span className="text-blue-500 shrink-0">💡</span>
                    <span>{conseil}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setScript(null)}
              data-testid="button-regenerate"
            >
              Regénérer
            </Button>
            {onClose && (
              <Button 
                variant="default"
                onClick={onClose}
                data-testid="button-close-script"
              >
                Fermer
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
