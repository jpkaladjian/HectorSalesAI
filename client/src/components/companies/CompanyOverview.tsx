/**
 * CompanyOverview - Phase 2 SIREN/SIRET
 * 
 * Vue consolidée d'une company au niveau SIREN
 * avec liste des établissements (SIRET)
 */

import { useQuery } from '@tanstack/react-query';
import { getCompany, getEstablishments, companiesKeys } from '@/lib/api/companies-api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  XCircle,
  Building,
  Phone,
  Mail,
  Globe,
  Hash,
  AlertTriangle,
  Users,
  Banknote,
  FileText,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CompanyOverviewProps {
  companyId: string;
  showEstablishments?: boolean;
}

export function CompanyOverview({ companyId, showEstablishments = true }: CompanyOverviewProps) {
  // Query company
  const { 
    data: company, 
    isLoading: isLoadingCompany,
    error: companyError,
  } = useQuery({
    queryKey: companiesKeys.detail(companyId),
    queryFn: () => getCompany(companyId),
  });

  // Query establishments (seulement si SIREN)
  const {
    data: establishmentsData,
    isLoading: isLoadingEstablishments,
  } = useQuery({
    queryKey: companiesKeys.establishments(companyId),
    queryFn: () => getEstablishments(companyId),
    enabled: !!(company && company.identifierType === 'SIREN' && showEstablishments),
  });

  if (isLoadingCompany) {
    return <CompanyOverviewSkeleton />;
  }

  if (companyError || !company) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <XCircle className="h-5 w-5" />
            Entreprise non trouvée
          </CardTitle>
          <CardDescription>
            L'entreprise demandée n'existe pas ou vous n'y avez pas accès.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const isSiren = company.identifierType === 'SIREN';
  const establishments = establishmentsData?.establishments || [];

  return (
    <div className="space-y-6" data-testid="company-overview">
      {/* Card principale */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Building2 className="h-6 w-6" />
                {company.legalName}
              </CardTitle>
              <CardDescription>
                {isSiren ? (
                  <span className="flex items-center gap-2">
                    <Badge variant="default">SIREN</Badge>
                    {company.identifierValue}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Badge variant="secondary">SIRET</Badge>
                    {company.identifierValue}
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {company.procedureCollective === 'true' && (
                <Badge variant="destructive" className="gap-1" data-testid="badge-juridical-alert">
                  <AlertTriangle className="h-3 w-3" />
                  {company.procedureType || 'Procédure collective'}
                </Badge>
              )}
              {company.enriched === 'true' ? (
                <Badge variant="outline" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Enrichie
                </Badge>
              ) : (
                <Badge variant="outline" className="gap-1">
                  <XCircle className="h-3 w-3" />
                  Non enrichie
                </Badge>
              )}
              <Badge variant={company.status === 'active' ? 'default' : 'secondary'}>
                {company.status === 'active' ? 'Active' : company.etatAdministratif || company.status}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Informations générales */}
          <div className="grid gap-4 md:grid-cols-2">
            {company.tradeName && company.tradeName !== company.legalName && (
              <InfoItem
                icon={<Building className="h-4 w-4" />}
                label="Nom commercial"
                value={company.tradeName}
              />
            )}
            
            {(company.legalFormLabel || company.legalForm) && (
              <InfoItem
                icon={<Hash className="h-4 w-4" />}
                label="Forme juridique"
                value={company.legalFormLabel || company.legalForm}
              />
            )}

            {company.nafCode && (
              <InfoItem
                icon={<Hash className="h-4 w-4" />}
                label="Code NAF"
                value={`${company.nafCode}${company.nafLabel ? ` - ${company.nafLabel}` : ''}`}
              />
            )}

            {company.creationDate && (
              <InfoItem
                icon={<Calendar className="h-4 w-4" />}
                label="Date de création"
                value={format(new Date(company.creationDate), 'dd MMMM yyyy', { locale: fr })}
              />
            )}

            {company.effectif && (
              <InfoItem
                icon={<Users className="h-4 w-4" />}
                label="Effectif"
                value={company.effectif}
                data-testid="info-effectif"
              />
            )}

            {company.capitalSocial && (
              <InfoItem
                icon={<Banknote className="h-4 w-4" />}
                label="Capital social"
                value={`${company.capitalSocial.toLocaleString('fr-FR')} €`}
                data-testid="info-capital"
              />
            )}

            {company.numeroTVA && (
              <InfoItem
                icon={<FileText className="h-4 w-4" />}
                label="Numéro TVA"
                value={company.numeroTVA}
                data-testid="info-tva"
              />
            )}
          </div>

          {/* Phase 2.8 : Alerte juridique détaillée */}
          {company.procedureCollective === 'true' && (
            <>
              <Separator />
              <div className="space-y-2 p-4 bg-destructive/10 rounded-lg border border-destructive/20" data-testid="juridical-alert-details">
                <h3 className="font-semibold flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  Alerte Juridique
                </h3>
                <div className="text-sm space-y-1">
                  {company.procedureTypeLibelle && (
                    <p className="font-medium">{company.procedureTypeLibelle}</p>
                  )}
                  {company.procedureDate && (
                    <p className="text-muted-foreground">
                      Date : {format(new Date(company.procedureDate), 'dd MMMM yyyy', { locale: fr })}
                    </p>
                  )}
                  {company.tribunalCommerce && (
                    <p className="text-muted-foreground">
                      Tribunal : {company.tribunalCommerce}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
          
          {/* Phase 2.8 : État administratif cessation */}
          {company.etatAdministratif === 'Cessé' && company.dateCessation && (
            <>
              <Separator />
              <div className="space-y-2 p-4 bg-muted/50 rounded-lg border" data-testid="cessation-notice">
                <h3 className="font-semibold flex items-center gap-2 text-muted-foreground">
                  <XCircle className="h-4 w-4" />
                  Entreprise Cessée
                </h3>
                <p className="text-sm text-muted-foreground">
                  Date de cessation : {format(new Date(company.dateCessation), 'dd MMMM yyyy', { locale: fr })}
                </p>
              </div>
            </>
          )}

          {/* Adresse Phase 2.8 : Complète avec département/région/GPS */}
          {company.addressLine1 && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Adresse
                </h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  {company.complementAddress && <p className="italic">{company.complementAddress}</p>}
                  <p>{company.addressLine1}</p>
                  {company.addressLine2 && <p>{company.addressLine2}</p>}
                  <p>
                    {company.postalCode} {company.city}
                    {company.commune && company.commune !== company.city && ` (${company.commune})`}
                  </p>
                  {company.department && <p>{company.department}</p>}
                  {company.region && <p className="font-medium">{company.region}</p>}
                  {company.country && company.country !== 'France' && (
                    <p>{company.country}</p>
                  )}
                  {company.latitude && company.longitude && (
                    <p className="text-xs">
                      <a
                        href={`https://www.google.com/maps?q=${company.latitude},${company.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                        data-testid="link-google-maps"
                      >
                        Voir sur Google Maps
                      </a>
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Contact */}
          {(company.phone || company.email || company.website) && (
            <>
              <Separator />
              <div className="grid gap-4 md:grid-cols-2">
                {company.phone && (
                  <InfoItem
                    icon={<Phone className="h-4 w-4" />}
                    label="Téléphone"
                    value={company.phone}
                  />
                )}
                {company.email && (
                  <InfoItem
                    icon={<Mail className="h-4 w-4" />}
                    label="Email"
                    value={company.email}
                  />
                )}
                {company.website && (
                  <InfoItem
                    icon={<Globe className="h-4 w-4" />}
                    label="Site web"
                    value={
                      <a 
                        href={company.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {company.website}
                      </a>
                    }
                  />
                )}
              </div>
            </>
          )}

          {/* Enrichissement */}
          {company.enriched === 'true' && company.enrichmentDate && (
            <>
              <Separator />
              <div className="text-xs text-muted-foreground">
                Enrichie le {format(new Date(company.enrichmentDate), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                {company.enrichmentSource && ` via ${company.enrichmentSource}`}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Liste des établissements (si SIREN) */}
      {isSiren && showEstablishments && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Établissements ({establishments.length})
            </CardTitle>
            <CardDescription>
              Liste des établissements (SIRET) de cette entreprise
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingEstablishments ? (
              <div className="space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : establishments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Aucun établissement trouvé
              </p>
            ) : (
              <div className="space-y-3">
                {establishments.map((establishment) => (
                  <Card key={establishment.id} className="border-muted">
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{establishment.legalName}</p>
                            <p className="text-sm text-muted-foreground">
                              SIRET: {establishment.identifierValue}
                            </p>
                          </div>
                          <Badge variant={establishment.status === 'active' ? 'default' : 'secondary'}>
                            {establishment.status}
                          </Badge>
                        </div>
                        {establishment.addressLine1 && (
                          <p className="text-sm text-muted-foreground">
                            {establishment.addressLine1}, {establishment.postalCode} {establishment.city}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Composant helper pour les infos
function InfoItem({ 
  icon, 
  label, 
  value,
  ...props
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: React.ReactNode;
  [key: string]: any;
}) {
  return (
    <div className="space-y-1" {...props}>
      <p className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className="text-sm">{value}</p>
    </div>
  );
}

// Skeleton loading
function CompanyOverviewSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/3 mt-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
        <Separator />
        <Skeleton className="h-24 w-full" />
      </CardContent>
    </Card>
  );
}
