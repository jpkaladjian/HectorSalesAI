/**
 * SiretSirenInputs - Champs séparés SIRET et SIREN
 * 
 * Solution au bug de boucle infinie: 2 champs distincts avec validation stricte
 * - SIRET: déclenche uniquement à 14 chiffres
 * - SIREN: déclenche uniquement à 9 chiffres
 */

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Building2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { enrichCompany } from '@/lib/api/companies-api';
import type { Company } from '../../../../shared/schema';
import { cn } from '@/lib/utils';

interface SiretSirenInputsProps {
  siretValue: string;
  sirenValue: string;
  onSiretChange: (value: string) => void;
  onSirenChange: (value: string) => void;
  onCompanyEnriched?: (company: Company) => void;
  className?: string;
  disabled?: boolean;
}

export function SiretSirenInputs({
  siretValue,
  sirenValue,
  onSiretChange,
  onSirenChange,
  onCompanyEnriched,
  className,
  disabled = false,
}: SiretSirenInputsProps) {
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichmentStatus, setEnrichmentStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [enrichedCompany, setEnrichedCompany] = useState<Company | null>(null);
  const [activeField, setActiveField] = useState<'siret' | 'siren' | null>(null);
  const { toast } = useToast();

  // Enrichissement automatique UNIQUEMENT si 14 chiffres (SIRET) ou 9 chiffres (SIREN)
  useEffect(() => {
    // Reset si les deux champs sont vides
    if (!siretValue && !sirenValue) {
      setEnrichmentStatus('idle');
      setEnrichedCompany(null);
      setActiveField(null);
      return;
    }

    // Nettoyer les valeurs
    const cleanSiret = siretValue.replace(/[\s\-\.]/g, '');
    const cleanSiren = sirenValue.replace(/[\s\-\.]/g, '');

    let identifier = '';
    let fieldType: 'siret' | 'siren' | null = null;

    // Détecter quel champ est complet
    if (cleanSiret.length === 14 && /^\d{14}$/.test(cleanSiret)) {
      identifier = cleanSiret;
      fieldType = 'siret';
    } else if (cleanSiren.length === 9 && /^\d{9}$/.test(cleanSiren)) {
      identifier = cleanSiren;
      fieldType = 'siren';
    }

    // Ne rien faire si aucun champ n'est complet
    if (!identifier || !fieldType) {
      setEnrichmentStatus('idle');
      setEnrichedCompany(null);
      return;
    }

    // Debounce pour éviter les appels multiples
    const timeoutId = setTimeout(async () => {
      setIsEnriching(true);
      setEnrichmentStatus('idle');
      setActiveField(fieldType);

      try {
        const result = await enrichCompany({
          identifier,
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
        }
      } catch (error: any) {
        console.error('Erreur enrichissement:', error);
        setEnrichmentStatus('error');
        setEnrichedCompany(null);
      } finally {
        setIsEnriching(false);
      }
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [siretValue, sirenValue]); // Retirer onCompanyEnriched et toast pour éviter re-triggers inutiles

  // Gérer le changement SIRET
  const handleSiretChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onSiretChange(value);
    // Vider le SIREN si on saisit un SIRET
    if (value && sirenValue) {
      onSirenChange('');
    }
  };

  // Gérer le changement SIREN
  const handleSirenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onSirenChange(value);
    // Vider le SIRET si on saisit un SIREN
    if (value && siretValue) {
      onSiretChange('');
    }
  };

  // Déterminer l'icône de statut pour chaque champ
  const StatusIcon = ({ field }: { field: 'siret' | 'siren' }) => {
    const isActiveField = activeField === field;
    
    if (isEnriching && isActiveField) {
      return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
    }
    if (enrichmentStatus === 'success' && isActiveField) {
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    }
    if (enrichmentStatus === 'error' && isActiveField) {
      return <AlertCircle className="h-4 w-4 text-orange-500" />;
    }
    return <Building2 className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Champ SIRET */}
      <div className="space-y-2">
        <Label htmlFor="siret-input">
          SIRET (14 chiffres)
        </Label>
        <div className="relative">
          <Input
            id="siret-input"
            type="text"
            placeholder="Ex: 84450210400019"
            value={siretValue}
            onChange={handleSiretChange}
            disabled={disabled || isEnriching}
            maxLength={14}
            className="pr-10"
            data-testid="input-siret"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <StatusIcon field="siret" />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Enrichissement automatique à 14 chiffres
        </p>
      </div>

      {/* OU séparateur */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">ou</span>
        </div>
      </div>

      {/* Champ SIREN */}
      <div className="space-y-2">
        <Label htmlFor="siren-input">
          SIREN (9 chiffres)
        </Label>
        <div className="relative">
          <Input
            id="siren-input"
            type="text"
            placeholder="Ex: 844502104"
            value={sirenValue}
            onChange={handleSirenChange}
            disabled={disabled || isEnriching}
            maxLength={9}
            className="pr-10"
            data-testid="input-siren"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <StatusIcon field="siren" />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Enrichissement automatique à 9 chiffres
        </p>
      </div>

      {/* Info enrichie */}
      {enrichedCompany && enrichmentStatus === 'success' && (
        <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md space-y-1" data-testid="enrichment-info">
          <p className="font-medium text-foreground text-sm">
            ✅ {enrichedCompany.legalName}
          </p>
          {enrichedCompany.addressLine1 && (
            <p className="text-xs text-muted-foreground">
              📍 {enrichedCompany.addressLine1}
              {enrichedCompany.postalCode && enrichedCompany.city && 
                `, ${enrichedCompany.postalCode} ${enrichedCompany.city}`
              }
            </p>
          )}
          {enrichedCompany.nafCode && (
            <p className="text-xs text-muted-foreground">
              🏢 NAF: {enrichedCompany.nafCode}
              {enrichedCompany.nafLabel && ` - ${enrichedCompany.nafLabel}`}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
