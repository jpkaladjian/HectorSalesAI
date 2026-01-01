/**
 * CompanyCard - Phase 2 SIREN/SIRET
 * 
 * Card pour afficher une company dans une liste
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, Calendar, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Company } from '../../../../shared/schema';
import { cn } from '@/lib/utils';

interface CompanyCardProps {
  company: Company;
  onClick?: () => void;
  className?: string;
}

export function CompanyCard({ company, onClick, className }: CompanyCardProps) {
  const isSiren = company.identifierType === 'SIREN';
  const isEnriched = company.enriched === 'true';

  return (
    <Card 
      className={cn(
        "hover-elevate transition-all",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
      data-testid={`company-card-${company.id}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg flex items-center gap-2 truncate">
              <Building2 className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">{company.legalName}</span>
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Badge variant={isSiren ? "default" : "secondary"} className="text-xs">
                {isSiren ? 'SIREN' : 'SIRET'}
              </Badge>
              <span className="text-xs">{company.identifierValue}</span>
            </CardDescription>
          </div>
          <div className="flex flex-col gap-1 items-end">
            {isEnriched && (
              <Badge variant="outline" className="text-xs gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Enrichie
              </Badge>
            )}
            <Badge 
              variant={company.status === 'active' ? 'default' : 'secondary'}
              className="text-xs"
            >
              {company.status}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {/* Adresse */}
        {company.addressLine1 && (
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span className="truncate">
              {company.addressLine1}
              {company.postalCode && company.city && 
                `, ${company.postalCode} ${company.city}`
              }
            </span>
          </div>
        )}

        {/* NAF */}
        {company.nafCode && (
          <div className="text-xs text-muted-foreground">
            NAF: {company.nafCode}
            {company.nafLabel && ` - ${company.nafLabel}`}
          </div>
        )}

        {/* Date enrichissement */}
        {isEnriched && company.enrichmentDate && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
            <Calendar className="h-3 w-3" />
            Enrichie le {format(new Date(company.enrichmentDate), 'dd/MM/yyyy', { locale: fr })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
