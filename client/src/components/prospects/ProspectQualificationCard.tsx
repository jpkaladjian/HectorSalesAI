import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  User,
  CheckCircle2,
  Loader2,
  Calendar,
  Briefcase,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Prospect } from "@shared/schema";
import { cn } from "@/lib/utils";

interface ProspectQualificationCardProps {
  prospect: Prospect;
  onQualify: (prospectId: string, siret: string) => Promise<void>;
  className?: string;
}

export function ProspectQualificationCard({ 
  prospect, 
  onQualify, 
  className 
}: ProspectQualificationCardProps) {
  const [isQualifyDialogOpen, setIsQualifyDialogOpen] = useState(false);
  const [siretInput, setSiretInput] = useState("");
  const [isQualifying, setIsQualifying] = useState(false);

  const handleQualify = async () => {
    if (!siretInput.trim()) return;

    setIsQualifying(true);
    try {
      await onQualify(prospect.id, siretInput.trim());
      setIsQualifyDialogOpen(false);
      setSiretInput("");
    } catch (error) {
      console.error('Erreur qualification:', error);
    } finally {
      setIsQualifying(false);
    }
  };

  const formatSiret = (siret: string) => {
    const cleaned = siret.replace(/\s/g, '');
    if (cleaned.length === 14) {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9, 14)}`;
    }
    return siret;
  };

  const handleSiretChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, '');
    if (/^\d*$/.test(value) && value.length <= 14) {
      setSiretInput(value);
    }
  };

  const daysAgo = Math.floor((Date.now() - new Date(prospect.createdAt).getTime()) / (1000 * 60 * 60 * 24));
  const isUrgent = daysAgo >= 7;

  return (
    <>
      <Card 
        className={cn(
          "hover-elevate transition-all",
          isUrgent && "border-l-4 border-l-orange-500",
          className
        )}
        data-testid={`prospect-card-${prospect.id}`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">
                  {prospect.prenom} {prospect.nom}
                </span>
                {/* Badge Entity temporaire pour vérifier RLS */}
                <Badge 
                  variant="outline" 
                  className="shrink-0 text-xs font-mono"
                  data-testid={`badge-entity-${prospect.id}`}
                >
                  {prospect.entity === 'france' && '🇫🇷 FR'}
                  {prospect.entity === 'luxembourg' && '🇱🇺 LU'}
                  {prospect.entity === 'belgique' && '🇧🇪 BE'}
                </Badge>
              </CardTitle>
              {prospect.entreprise && (
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span className="truncate">{prospect.entreprise}</span>
                </div>
              )}
              {prospect.fonction && (
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <Briefcase className="h-4 w-4" />
                  <span className="truncate">{prospect.fonction}</span>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1 items-end">
              <Badge 
                variant={isUrgent ? "destructive" : "secondary"}
                className="text-xs"
                data-testid={`badge-status-${prospect.id}`}
              >
                À qualifier
              </Badge>
              {daysAgo > 0 && (
                <span className="text-xs text-muted-foreground">
                  il y a {daysAgo}j
                </span>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-2">
          {prospect.telephone && (
            <div className="flex items-start gap-2 text-sm">
              <Phone className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
              <span data-testid={`text-phone-${prospect.id}`}>{prospect.telephone}</span>
            </div>
          )}

          {prospect.email && (
            <div className="flex items-start gap-2 text-sm">
              <Mail className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
              <span className="truncate" data-testid={`text-email-${prospect.id}`}>
                {prospect.email}
              </span>
            </div>
          )}

          {(prospect.ville || prospect.codePostal) && (
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>
                {prospect.codePostal && `${prospect.codePostal} `}
                {prospect.ville}
              </span>
            </div>
          )}

          {prospect.createdAt && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
              <Calendar className="h-3 w-3" />
              Créé le {format(new Date(prospect.createdAt), 'dd/MM/yyyy', { locale: fr })}
            </div>
          )}

          <div className="pt-2">
            <Button
              size="sm"
              className="w-full"
              onClick={() => setIsQualifyDialogOpen(true)}
              data-testid={`button-qualify-${prospect.id}`}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Qualifier avec SIRET
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isQualifyDialogOpen} onOpenChange={setIsQualifyDialogOpen}>
        <DialogContent data-testid="dialog-qualify">
          <DialogHeader>
            <DialogTitle>Qualifier le prospect</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Prospect : <strong>{prospect.prenom} {prospect.nom}</strong>
                {prospect.entreprise && <> - {prospect.entreprise}</>}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="siret">SIRET (14 chiffres)</Label>
              <Input
                id="siret"
                placeholder="123 456 789 01234"
                value={formatSiret(siretInput)}
                onChange={handleSiretChange}
                maxLength={17}
                data-testid="input-siret"
              />
              <p className="text-xs text-muted-foreground">
                L'enrichissement CASCADE (INSEE → Pappers) sera lancé automatiquement
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsQualifyDialogOpen(false);
                setSiretInput("");
              }}
              disabled={isQualifying}
              data-testid="button-cancel"
            >
              Annuler
            </Button>
            <Button
              onClick={handleQualify}
              disabled={siretInput.length !== 14 || isQualifying}
              data-testid="button-confirm-qualify"
            >
              {isQualifying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Qualification...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Qualifier
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
