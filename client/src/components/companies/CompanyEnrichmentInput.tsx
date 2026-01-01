/**
 * CompanyEnrichmentInput - Phase 2 SIREN/SIRET
 * 
 * Input avec enrichissement automatique temps réel (debounce 500ms)
 * Compatible SIREN (9 chiffres) et SIRET (14 chiffres)
 */

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Building2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { enrichCompany } from '@/lib/api/companies-api';
import type { Company } from '../../../../shared/schema';
import { cn } from '@/lib/utils';

interface CompanyEnrichmentInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onCompanyEnriched?: (company: Company) => void;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  autoEnrich?: boolean;
  debounceMs?: number;
}

export function CompanyEnrichmentInput({
  label = "SIRET / SIREN",
  placeholder = "Saisir SIRET (14 chiffres) ou SIREN (9 chiffres)",
  value,
  onChange,
  onCompanyEnriched,
  className,
  disabled = false,
  required = false,
  autoEnrich = true,
  debounceMs = 500,
}: CompanyEnrichmentInputProps) {
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichmentStatus, setEnrichmentStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [enrichedCompany, setEnrichedCompany] = useState<Company | null>(null);
  const { toast } = useToast();

  // Debounced enrichment
  useEffect(() => {
    if (!autoEnrich || !value) {
      setEnrichmentStatus('idle');
      setEnrichedCompany(null);
      return;
    }

    // Nettoyer l'input (supprimer espaces, tirets)
    const cleanValue = value.replace(/[\s\-\.]/g, '');

    // Vérifier format SIREN (9) ou SIRET (14)
    const isSiren = /^\d{9}$/.test(cleanValue);
    const isSiret = /^\d{14}$/.test(cleanValue);

    if (!isSiren && !isSiret) {
      setEnrichmentStatus('idle');
      setEnrichedCompany(null);
      return;
    }

    // Debounce
    const timeoutId = setTimeout(async () => {
      setIsEnriching(true);
      setEnrichmentStatus('idle');

      try {
        const result = await enrichCompany({
          identifier: cleanValue,
          triggerType: 'automatic',
        });

        if (result.success && result.company) {
          setEnrichmentStatus('success');
          setEnrichedCompany(result.company);
          
          if (onCompanyEnriched) {
            onCompanyEnriched(result.company);
          }

          toast({
            title: "✅ Entreprise enrichie",
            description: `${result.company.legalName} - ${result.company.city || ''}`,
          });
        } else {
          setEnrichmentStatus('error');
          setEnrichedCompany(null);
          
          // Toast silencieux pour non trouvé
          if (!result.message?.includes('non trouvée')) {
            toast({
              title: "⚠️ Enrichissement indisponible",
              description: result.message || "Vous pouvez continuer à saisir manuellement",
              variant: "default",
            });
          }
        }
      } catch (error: any) {
        console.error('Erreur enrichissement:', error);
        setEnrichmentStatus('error');
        setEnrichedCompany(null);

        if (!error.message?.includes('404')) {
          toast({
            title: "❌ Erreur",
            description: error.message || "Erreur lors de l'enrichissement",
            variant: "destructive",
          });
        }
      } finally {
        setIsEnriching(false);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [value, autoEnrich, debounceMs, onCompanyEnriched, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  // Déterminer l'icône de statut
  const StatusIcon = () => {
    if (isEnriching) {
      return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" data-testid="icon-enriching" />;
    }
    if (enrichmentStatus === 'success') {
      return <CheckCircle2 className="h-4 w-4 text-green-600" data-testid="icon-success" />;
    }
    if (enrichmentStatus === 'error') {
      return <AlertCircle className="h-4 w-4 text-orange-500" data-testid="icon-error" />;
    }
    return <Building2 className="h-4 w-4 text-muted-foreground" data-testid="icon-default" />;
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor="company-identifier">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      
      <div className="relative">
        <Input
          id="company-identifier"
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          disabled={disabled || isEnriching}
          required={required}
          className="pr-10"
          data-testid="input-siret-siren"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <StatusIcon />
        </div>
      </div>

      {/* Info enrichie */}
      {enrichedCompany && enrichmentStatus === 'success' && (
        <div className="text-sm text-muted-foreground space-y-1" data-testid="enrichment-info">
          <p className="font-medium text-foreground">
            {enrichedCompany.legalName}
          </p>
          {enrichedCompany.addressLine1 && (
            <p className="text-xs">
              {enrichedCompany.addressLine1}
              {enrichedCompany.postalCode && enrichedCompany.city && 
                `, ${enrichedCompany.postalCode} ${enrichedCompany.city}`
              }
            </p>
          )}
          {enrichedCompany.nafCode && (
            <p className="text-xs">
              NAF: {enrichedCompany.nafCode}
              {enrichedCompany.nafLabel && ` - ${enrichedCompany.nafLabel}`}
            </p>
          )}
        </div>
      )}

      {/* Aide format */}
      {!value && (
        <p className="text-xs text-muted-foreground">
          Format : SIRET (14 chiffres) ou SIREN (9 chiffres)
        </p>
      )}
    </div>
  );
}
