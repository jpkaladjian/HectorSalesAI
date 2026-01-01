/**
 * Orchestrateur d'enrichissement multi-pays
 * 
 * Route automatiquement vers le bon provider (Pappers, OpenCorporates, WebSearch)
 * selon la configuration du pays dans countries-registry.ts
 */

import { getCountryConfig } from '../../config/countries-registry';
import { 
  CompanyEnrichmentData, 
  EnrichmentProvider 
} from './base-enrichment.interface';
import { PappersProvider } from './pappers-provider';
import { INSEEProvider } from './insee-provider';
import { OpenCorporatesProvider } from './opencorporates-provider';
import { WebSearchProvider } from './websearch-provider';
import { PhoneLookupProvider, type PhoneLookupResult } from './phone-lookup-provider';
import { validateSiret } from '../../utils/siret-validation';

export interface EnrichmentOptions {
  /** Activer le fallback vers WebSearch si le provider principal échoue */
  enableFallback?: boolean;
  
  /** Nom de l'entreprise (optionnel, améliore la qualité de la recherche) */
  companyName?: string;
}

export interface EnrichmentResult {
  /** Données enrichies (null si non trouvé) */
  data: CompanyEnrichmentData | null;
  
  /** Provider utilisé pour l'enrichissement */
  provider: 'insee' | 'pappers' | 'opencorporates' | 'web_search';
  
  /** Indique si un fallback a été utilisé */
  fallbackUsed: boolean;
  
  /** Message d'erreur si échec */
  error?: string;
}

/**
 * Résultat enrichissement avec tracking CASCADE (Phase 2.5)
 */
export interface CascadeEnrichmentResult extends EnrichmentResult {
  /** Coût de l'enrichissement (0€ pour INSEE, 0.10€ pour Pappers) */
  cost: number;
  
  /** Durée de l'enrichissement en ms */
  duration: number;
  
  /** Source utilisée pour l'enrichissement */
  source: 'insee' | 'pappers' | 'not_found';
}

/**
 * Orchestrateur d'enrichissement multi-pays
 * 
 * Usage:
 * ```typescript
 * const orchestrator = new EnrichmentOrchestrator();
 * 
 * // Enrichir une entreprise belge
 * const result = await orchestrator.enrichCompany('BE0123456789', 'BE');
 * 
 * // Enrichir avec fallback activé
 * const result = await orchestrator.enrichCompany(
 *   'CHE-123.456.789', 
 *   'CH',
 *   { enableFallback: true, companyName: 'Nestlé SA' }
 * );
 * ```
 */
export class EnrichmentOrchestrator {
  private providers: Map<string, EnrichmentProvider>;
  private inseeProvider: INSEEProvider;
  private pappersProvider: PappersProvider;
  private phoneLookupProvider: PhoneLookupProvider;
  
  constructor() {
    this.providers = new Map();
    this.inseeProvider = new INSEEProvider();
    this.pappersProvider = new PappersProvider();
    this.phoneLookupProvider = new PhoneLookupProvider();
    this.providers.set('insee', this.inseeProvider);
    this.providers.set('pappers', this.pappersProvider);
    this.providers.set('opencorporates', new OpenCorporatesProvider());
    this.providers.set('web_search', new WebSearchProvider());
  }
  
  /**
   * Enrichir une entreprise selon son pays
   * 
   * @param identifier Identifiant national (SIREN, VAT, CHE, etc.)
   * @param countryCode Code pays ISO 3166-1 alpha-2 (ex: 'FR', 'BE', 'CH')
   * @param options Options d'enrichissement
   * @returns Résultat enrichissement avec données et métadonnées
   */
  async enrichCompany(
    identifier: string,
    countryCode: string,
    options: EnrichmentOptions = {}
  ): Promise<EnrichmentResult> {
    const { enableFallback = false, companyName } = options;
    
    try {
      // 1. Vérifier que le pays est configuré
      const config = getCountryConfig(countryCode);
      if (!config) {
        return {
          data: null,
          provider: 'web_search',
          fallbackUsed: false,
          error: `Pays ${countryCode} non configuré dans le registry`,
        };
      }
      
      // 2. Vérifier que l'identifiant est valide
      if (!config.identifierPattern.test(identifier)) {
        return {
          data: null,
          provider: config.enrichmentProvider,
          fallbackUsed: false,
          error: `Format d'identifiant invalide pour ${config.name}. Attendu: ${config.identifierLabel}`,
        };
      }
      
      // 3. Obtenir le provider configuré
      const provider = this.providers.get(config.enrichmentProvider);
      if (!provider) {
        return {
          data: null,
          provider: config.enrichmentProvider,
          fallbackUsed: false,
          error: `Provider ${config.enrichmentProvider} non disponible`,
        };
      }
      
      // 5. Enrichir avec le provider principal
      console.log(`[Orchestrator] 🌍 Enrichissement ${countryCode} via ${config.enrichmentProvider}`);
      const data = await provider.enrichCompany(identifier, countryCode, companyName);
      
      // 6. Fallback si échec et activé
      if (!data && enableFallback && config.fallbackToWeb) {
        console.log(`[Orchestrator] 🔄 Fallback vers WebSearch pour ${countryCode}`);
        return await this.tryFallback(identifier, countryCode, companyName);
      }
      
      return {
        data,
        provider: config.enrichmentProvider,
        fallbackUsed: false,
      };
      
    } catch (error) {
      const config = getCountryConfig(countryCode);
      
      // Fallback en cas d'erreur si activé
      if (enableFallback && config?.fallbackToWeb) {
        console.log(`[Orchestrator] ❌ Erreur ${config?.enrichmentProvider}: ${error}`);
        console.log(`[Orchestrator] 🔄 Fallback vers WebSearch pour ${countryCode}`);
        return await this.tryFallback(identifier, countryCode, companyName);
      }
      
      return {
        data: null,
        provider: config?.enrichmentProvider || 'web_search',
        fallbackUsed: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
  
  /**
   * PHASE 2.5 CASCADE : Enrichissement intelligent INSEE (gratuit) → Pappers (payant)
   * 
   * Flow :
   * 1. Essayer INSEE (0€) - API Sirene V3
   * 2. Si 404 → Fallback Pappers (0,10€)
   * 3. Tracking complet : cost, duration, source
   * 
   * Économies attendues : 80-90% (la majorité des entreprises sont dans INSEE)
   * 
   * @param identifier SIREN (9) ou SIRET (14)
   * @param countryCode Doit être 'FR' (France uniquement)
   * @param companyName Nom optionnel pour améliorer recherche
   * @returns Résultat avec métadonnées CASCADE (cost, duration, source)
   */
  async enrichWithCascade(
    identifier: string,
    countryCode: string,
    companyName?: string
  ): Promise<CascadeEnrichmentResult> {
    const startTime = Date.now();
    
    // CASCADE uniquement pour la France
    if (countryCode !== 'FR') {
      throw new Error('CASCADE ne supporte que la France (countryCode: FR)');
    }

    try {
      // 🥇 ÉTAPE 1: Essayer INSEE (GRATUIT)
      console.log(`[CASCADE] 1️⃣ Trying INSEE for ${identifier}...`);
      
      const inseeData = await this.inseeProvider.enrichCompany(identifier, countryCode, companyName);
      
      if (inseeData) {
        // ✅ Succès INSEE
        const duration = Date.now() - startTime;
        console.log(`[CASCADE] ✅ INSEE success for ${identifier} (${duration}ms, 0€)`);
        
        return {
          data: inseeData,
          provider: 'insee',
          fallbackUsed: false,
          cost: 0, // INSEE est GRATUIT
          duration,
          source: 'insee',
        };
      }
      
      // 🥈 ÉTAPE 2: Fallback Pappers (PAYANT)
      console.log(`[CASCADE] 2️⃣ INSEE failed, trying Pappers fallback for ${identifier}...`);
      
      const pappersData = await this.pappersProvider.enrichCompany(identifier, countryCode, companyName);
      
      if (pappersData) {
        // ✅ Succès Pappers
        const duration = Date.now() - startTime;
        console.log(`[CASCADE] ✅ Pappers fallback success for ${identifier} (${duration}ms, 0.10€)`);
        
        return {
          data: pappersData,
          provider: 'pappers',
          fallbackUsed: true,
          cost: 0.10, // Coût unitaire Pappers
          duration,
          source: 'pappers',
        };
      }
      
      // ❌ Échec total (ni INSEE ni Pappers)
      const duration = Date.now() - startTime;
      console.log(`[CASCADE] ❌ Complete failure for ${identifier} (${duration}ms, 0.10€)`);
      
      return {
        data: null,
        provider: 'pappers',
        fallbackUsed: true,
        cost: 0.10, // On a quand même appelé Pappers
        duration,
        source: 'not_found',
        error: `Company ${identifier} not found in any provider (INSEE + Pappers)`,
      };
      
    } catch (error) {
      // Erreur technique
      const duration = Date.now() - startTime;
      console.error(`[CASCADE] ❌ Technical error: ${error}`);
      
      return {
        data: null,
        provider: 'pappers',
        fallbackUsed: false,
        cost: 0,
        duration,
        source: 'not_found',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Tenter un fallback vers WebSearch
   */
  private async tryFallback(
    identifier: string,
    countryCode: string,
    companyName?: string
  ): Promise<EnrichmentResult> {
    try {
      const webProvider = this.providers.get('web_search');
      if (!webProvider) {
        return {
          data: null,
          provider: 'web_search',
          fallbackUsed: true,
          error: 'Provider WebSearch non disponible',
        };
      }
      
      const data = await webProvider.enrichCompany(identifier, countryCode, companyName);
      
      return {
        data,
        provider: 'web_search',
        fallbackUsed: true,
      };
    } catch (error) {
      return {
        data: null,
        provider: 'web_search',
        fallbackUsed: true,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
  
  /**
   * Vérifier si un pays est supporté
   */
  isCountrySupported(countryCode: string): boolean {
    const config = getCountryConfig(countryCode);
    return config !== null;
  }
  
  /**
   * Obtenir le provider configuré pour un pays
   */
  getProviderForCountry(countryCode: string): 'pappers' | 'opencorporates' | 'web_search' | null {
    const config = getCountryConfig(countryCode);
    return config?.enrichmentProvider || null;
  }
  
  /**
   * Obtenir la liste de tous les pays supportés
   */
  getSupportedCountries(): string[] {
    return [
      'FR', 'BE', 'CH', 'LU', 'GB', 'DE', 'ES', 'IT', 
      'GP', 'MQ', 'GF', 'RE', 'YT'
    ];
  }

  /**
   * PHASE 2.6 : Enrichir par téléphone avec CASCADE
   * 
   * Flow : Téléphone → Pages Jaunes → SIRET → CASCADE INSEE → Pappers
   * Économies maintenues : 80-90% même via téléphone !
   * 
   * @param phone Numéro de téléphone français
   * @returns Résultat enrichissement avec métadonnées téléphone + CASCADE
   */
  async enrichByPhone(phone: string): Promise<CascadeEnrichmentResult & { phoneLookup?: PhoneLookupResult }> {
    const startTime = Date.now();

    try {
      // Étape 1 : Phone Lookup (Téléphone → SIRET via Pages Jaunes)
      console.log(`[Orchestrator] 📞 Recherche SIRET pour téléphone: ${phone}`);
      
      const phoneLookup = await this.phoneLookupProvider.phoneToSiret(phone);
      
      console.log(`[Orchestrator] ✅ SIRET trouvé via ${phoneLookup.source}: ${phoneLookup.siret}`);

      // Étape 1.5 : Valider le SIRET avec algorithme de Luhn
      const validation = validateSiret(phoneLookup.siret);
      
      if (!validation.valid) {
        const duration = Date.now() - startTime;
        console.warn(`[Orchestrator] ⚠️ SIRET invalide (${validation.reason}): ${phoneLookup.siret}`);
        
        // Retourner succès partiel : téléphone trouvé mais SIRET invalide
        return {
          data: null,
          provider: 'insee',
          fallbackUsed: false,
          cost: 0,
          duration,
          source: 'not_found',
          phoneLookup, // Métadonnées phone lookup présentes
          error: `Téléphone trouvé via ${phoneLookup.source}, mais SIRET invalide (${validation.reason}). Entreprise possiblement non inscrite au RCS.`
        };
      }

      // Étape 2 : CASCADE enrichissement (SIRET → INSEE → Pappers)
      // Réutilise le système CASCADE existant (Phase 2.5)
      const cascadeResult = await this.enrichWithCascade(
        phoneLookup.siret,
        'FR',  // countryCode
        phoneLookup.companyName  // companyName (optionnel)
      );

      // Fusion des résultats
      return {
        ...cascadeResult,
        phoneLookup, // Métadonnées phone lookup
        duration: Date.now() - startTime
      };

    } catch (error) {
      const duration = Date.now() - startTime;

      // Si erreur lors du phone lookup
      if (error instanceof Error && error.name === 'CompanyNotFoundError') {
        console.log(`[Orchestrator] ❌ Aucune entreprise trouvée pour téléphone: ${phone}`);
        
        return {
          data: null,
          provider: 'insee',
          fallbackUsed: false,
          cost: 0,
          duration,
          source: 'not_found',
          error: `Aucune entreprise trouvée pour le téléphone ${phone}`
        };
      }

      // Autres erreurs
      console.error(`[Orchestrator] ❌ Erreur enrichissement téléphone ${phone}:`, error);
      
      return {
        data: null,
        provider: 'insee',
        fallbackUsed: false,
        cost: 0,
        duration,
        source: 'not_found',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}

// Export singleton pour usage simple
export const enrichmentOrchestrator = new EnrichmentOrchestrator();
