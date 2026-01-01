import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  Globe, 
  MapPin,
  Briefcase,
  X,
  UserPlus,
  Users,
  Euro,
  FileText,
  AlertTriangle,
  Calendar,
  MapPinned,
  ExternalLink,
  TrendingUp,
  Shield
} from "lucide-react";

interface PatronResult {
  // Basique
  siret: string;
  siren: string;
  raison_sociale: string;
  enseigne_commerciale: string;
  secteur: string;
  
  // Dirigeant
  dirigeant: {
    nom: string;
    prenom: string;
    fonction: string;
    photo_url: string | null;
  } | null;
  
  // Adresse complète Phase 2.8
  adresse: string;
  adresse_ligne_2?: string;
  complement_adresse?: string;
  code_postal: string;
  ville: string;
  commune?: string;
  departement?: string;
  region?: string;
  pays?: string;
  
  // GPS Phase 2.8
  latitude?: number;
  longitude?: number;
  
  // Coordonnées Phase 2.8
  email: string | null;
  telephone: string | null;
  site_web: string | null;
  
  // Données métier Phase 2.8
  effectif?: number;
  effectif_min?: number;
  effectif_max?: number;
  effectif_texte?: string;
  capital_social?: number;
  tva_intracommunautaire?: string;
  forme_juridique?: string;
  forme_juridique_libelle?: string;
  
  // Alertes juridiques Phase 2.8
  alerte_juridique?: boolean;
  procedure_collective?: boolean;
  procedure_type?: string;
  procedure_collective_libelle?: string;
  procedure_collective_date?: string;
  tribunal_commerce?: string;
  
  // Statut administratif Phase 2.8
  etat_administratif?: string;
  date_creation?: string;
  date_cessation?: string;
  
  // Métadonnées
  pappers_raw_data?: any;
}

interface PatronResultCardProps {
  result: PatronResult;
  onClose?: () => void;
  onAddToCrm: () => void;
}

export function PatronResultCard({ 
  result, 
  onClose,
  onAddToCrm 
}: PatronResultCardProps) {
  
  const dirigeant = result.dirigeant;
  const dirigeantInitials = dirigeant 
    ? `${dirigeant.prenom?.[0] || ''}${dirigeant.nom?.[0] || ''}`
    : 'N/A';
  
  // Construire URL Google Maps si GPS disponible
  const googleMapsUrl = result.latitude && result.longitude
    ? `https://www.google.com/maps?q=${result.latitude},${result.longitude}`
    : null;
  
  return (
    <Card data-testid="card-patron-result" className="border-primary/20">
      {/* En-tête : Dirigeant + Alertes critiques */}
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
        <div className="flex items-start gap-4 flex-1">
          <Avatar className="h-16 w-16">
            <AvatarImage src={dirigeant?.photo_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary text-lg">
              {dirigeantInitials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 flex-wrap">
              <User className="h-5 w-5" />
              {dirigeant ? (
                <span>{dirigeant.prenom} {dirigeant.nom}</span>
              ) : (
                <span>Dirigeant non disponible</span>
              )}
              
              {/* Badges d'alerte critiques */}
              {result.alerte_juridique && (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  ALERTE RJ/LJ
                </Badge>
              )}
              
              {result.etat_administratif === 'Cessé' && (
                <Badge variant="destructive">
                  Cessé
                </Badge>
              )}
            </CardTitle>
            
            <p className="text-sm text-muted-foreground mt-1">
              {dirigeant?.fonction || "Fonction inconnue"}
            </p>
          </div>
        </div>
        
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            data-testid="button-close-result"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Informations entreprise principales (toujours visibles) */}
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <Building2 className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium">
                {result.enseigne_commerciale || result.raison_sociale}
              </p>
              {result.enseigne_commerciale && result.raison_sociale !== result.enseigne_commerciale && (
                <p className="text-sm text-muted-foreground">
                  {result.raison_sociale}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
            <Badge variant="secondary" data-testid="badge-secteur">
              {result.secteur || "Secteur non spécifié"}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">SIRET :</span>{" "}
              <span className="font-mono">{formatSiretDisplay(result.siret)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">SIREN :</span>{" "}
              <span className="font-mono">{formatSirenDisplay(result.siren)}</span>
            </div>
          </div>
          
          {/* Indicateurs clés visibles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
            {result.effectif_texte && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm font-medium">{result.effectif_texte}</span>
              </div>
            )}
            
            {result.capital_social !== undefined && result.capital_social !== null && (
              <div className="flex items-center gap-2">
                <Euro className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm font-medium">
                  Capital : {formatCapital(result.capital_social)}
                </span>
              </div>
            )}
            
            {result.tva_intracommunautaire && (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm font-mono">{result.tva_intracommunautaire}</span>
              </div>
            )}
          </div>
          
          {/* Alerte RJ/LJ - Visible immédiatement */}
          {result.procedure_collective && (
            <div className="flex items-start gap-2 pt-3 border-t border-destructive/30">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-destructive">Procédure collective :</span>
                  <Badge variant="destructive" className="font-semibold" data-testid="badge-alerte-rj">
                    {result.procedure_type || 'RJ/LJ'}
                  </Badge>
                </div>
                {result.procedure_collective_libelle && (
                  <p className="text-sm text-destructive">
                    {result.procedure_collective_libelle}
                  </p>
                )}
                {result.procedure_collective_date && (
                  <p className="text-xs text-muted-foreground">
                    Date : {formatDate(result.procedure_collective_date)}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Sections pliables pour détails */}
        <Accordion type="multiple" className="w-full">
          {/* Coordonnées */}
          <AccordionItem value="coordonnees">
            <AccordionTrigger className="text-sm font-medium" data-testid="accordion-coordonnees">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Coordonnées
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-2 pt-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <p className="text-sm" data-testid="text-email">
                  {result.email || (
                    <span className="text-muted-foreground italic">Non disponible</span>
                  )}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                <p className="text-sm" data-testid="text-telephone">
                  {result.telephone || (
                    <span className="text-muted-foreground italic">Non disponible</span>
                  )}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                <p className="text-sm" data-testid="text-siteweb">
                  {result.site_web ? (
                    <a 
                      href={result.site_web} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      {result.site_web}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span className="text-muted-foreground italic">Non disponible</span>
                  )}
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          {/* Adresse & GPS */}
          <AccordionItem value="adresse">
            <AccordionTrigger className="text-sm font-medium" data-testid="accordion-adresse">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Adresse & Localisation
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-2 pt-2">
              <div className="text-sm space-y-1">
                {result.adresse && <p>{result.adresse}</p>}
                {result.adresse_ligne_2 && <p>{result.adresse_ligne_2}</p>}
                {result.complement_adresse && (
                  <p className="text-muted-foreground">{result.complement_adresse}</p>
                )}
                <p>{result.code_postal} {result.ville}</p>
                {result.commune && result.commune !== result.ville && (
                  <p className="text-muted-foreground">Commune : {result.commune}</p>
                )}
                {result.departement && (
                  <p className="text-muted-foreground">Département : {result.departement}</p>
                )}
                {result.region && (
                  <p className="text-muted-foreground">Région : {result.region}</p>
                )}
              </div>
              
              {googleMapsUrl && (
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="gap-2"
                    data-testid="button-google-maps"
                  >
                    <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                      <MapPinned className="h-4 w-4" />
                      Ouvrir dans Google Maps
                    </a>
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    GPS : {result.latitude?.toFixed(6)}, {result.longitude?.toFixed(6)}
                  </p>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
          
          {/* Indicateurs Business */}
          <AccordionItem value="business">
            <AccordionTrigger className="text-sm font-medium" data-testid="accordion-business">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Indicateurs Business
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pt-2">
              {/* Effectif détaillé */}
              {(result.effectif_texte || result.effectif !== undefined) && (
                <div>
                  <p className="text-sm font-medium mb-1">Effectif</p>
                  <p className="text-sm">{result.effectif_texte}</p>
                  {result.effectif_min !== undefined && result.effectif_max !== undefined && (
                    <p className="text-xs text-muted-foreground">
                      Fourchette : {result.effectif_min} - {result.effectif_max} salariés
                    </p>
                  )}
                </div>
              )}
              
              {/* Capital social */}
              {result.capital_social !== undefined && result.capital_social !== null && (
                <div>
                  <p className="text-sm font-medium mb-1">Capital Social</p>
                  <p className="text-sm">{formatCapital(result.capital_social)}</p>
                </div>
              )}
              
              {/* TVA */}
              {result.tva_intracommunautaire && (
                <div>
                  <p className="text-sm font-medium mb-1">TVA Intracommunautaire</p>
                  <p className="text-sm font-mono">{result.tva_intracommunautaire}</p>
                </div>
              )}
              
              {/* Forme juridique */}
              {result.forme_juridique_libelle && (
                <div>
                  <p className="text-sm font-medium mb-1">Forme Juridique</p>
                  <p className="text-sm">{result.forme_juridique_libelle}</p>
                  {result.forme_juridique && result.forme_juridique !== result.forme_juridique_libelle && (
                    <p className="text-xs text-muted-foreground">Code : {result.forme_juridique}</p>
                  )}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
          
          {/* Alertes Juridiques (section conditionnelle, rouge si alerte) */}
          {result.procedure_collective && (
            <AccordionItem value="alertes" className="border-destructive/50">
              <AccordionTrigger className="text-sm font-medium text-destructive" data-testid="accordion-alertes">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Alertes Juridiques
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-2 pt-2">
                <div className="bg-destructive/10 rounded-lg p-3 space-y-2">
                  {result.procedure_collective_libelle && (
                    <div>
                      <p className="text-sm font-medium text-destructive">
                        {result.procedure_collective_libelle}
                      </p>
                      {result.procedure_type && (
                        <p className="text-xs text-muted-foreground">
                          Type : {result.procedure_type}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {result.procedure_collective_date && (
                    <p className="text-sm">
                      <span className="text-muted-foreground">Date :</span>{" "}
                      {formatDate(result.procedure_collective_date)}
                    </p>
                  )}
                  
                  {result.tribunal_commerce && (
                    <p className="text-sm">
                      <span className="text-muted-foreground">Tribunal :</span>{" "}
                      {result.tribunal_commerce}
                    </p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
          
          {/* Informations Administratives */}
          <AccordionItem value="admin">
            <AccordionTrigger className="text-sm font-medium" data-testid="accordion-admin">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Informations Administratives
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-2 pt-2">
              {result.etat_administratif && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">État :</span>
                  <Badge variant={result.etat_administratif === 'Actif' ? 'default' : 'destructive'}>
                    {result.etat_administratif}
                  </Badge>
                </div>
              )}
              
              {result.date_creation && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                  <p className="text-sm">
                    <span className="text-muted-foreground">Créée le :</span>{" "}
                    {formatDate(result.date_creation)}
                  </p>
                </div>
              )}
              
              {result.date_cessation && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-destructive shrink-0" />
                  <p className="text-sm">
                    <span className="text-destructive">Cessation :</span>{" "}
                    {formatDate(result.date_cessation)}
                  </p>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
      
      <CardFooter className="flex gap-2">
        <Button
          onClick={onAddToCrm}
          className="flex-1"
          data-testid="button-add-to-crm"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Ajouter au CRM
        </Button>
        
        {onClose && (
          <Button
            variant="outline"
            onClick={onClose}
            data-testid="button-cancel-result"
          >
            Annuler
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}


/**
 * Formate SIRET pour affichage
 * 12345678901234 → 123 456 789 01234
 */
function formatSiretDisplay(siret: string): string {
  if (!siret || siret.length !== 14) return siret;
  return `${siret.slice(0, 3)} ${siret.slice(3, 6)} ${siret.slice(6, 9)} ${siret.slice(9)}`;
}

/**
 * Formate SIREN pour affichage
 * 123456789 → 123 456 789
 */
function formatSirenDisplay(siren: string): string {
  if (!siren || siren.length !== 9) return siren;
  return `${siren.slice(0, 3)} ${siren.slice(3, 6)} ${siren.slice(6)}`;
}

/**
 * Formate capital social
 * 50000 → 50 000 €
 */
function formatCapital(capital: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(capital);
}

/**
 * Formate date
 * 2020-01-15 → 15/01/2020
 */
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateFormat('fr-FR').format(date);
  } catch {
    return dateString;
  }
}
