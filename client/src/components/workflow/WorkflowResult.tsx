import { CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { WorkflowResultProps } from "./types";

export function WorkflowResult({ result }: WorkflowResultProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className={result.success ? "text-green-600" : "text-orange-600"}>
          {result.success ? "✅ Workflow créé avec succès !" : "⚠️ Workflow partiellement créé"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Éléments créés */}
        <div>
          <h4 className="font-semibold mb-2">Éléments créés :</h4>
          <div className="space-y-2">
            {result.created.prospect && (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Prospect : {result.created.prospect.nom}</span>
              </div>
            )}
            {result.created.opportunity && (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Opportunité : {result.created.opportunity.nom}</span>
              </div>
            )}
            {result.created.rdv && (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>RDV : {result.created.rdv.titre}</span>
              </div>
            )}
            {result.created.action && (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Action : {result.created.action.titre}</span>
              </div>
            )}
          </div>
        </div>

        {/* Documents générés */}
        {result.documents && (
          <div>
            <h4 className="font-semibold mb-2">Documents :</h4>
            <div className="space-y-2">
              {result.documents.pdf_generated && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>PDF généré</span>
                </div>
              )}
              {result.documents.ical_generated && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Calendrier (.ics) généré</span>
                </div>
              )}
              {result.documents.email_sent && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Email envoyé</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Erreurs */}
        {result.errors && result.errors.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2 text-orange-600">Erreurs :</h4>
            <div className="space-y-1">
              {result.errors.map((error: string, index: number) => (
                <div key={index} className="flex items-start gap-2 text-sm text-orange-600">
                  <AlertCircle className="h-4 w-4 mt-0.5" />
                  <span>{error}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
