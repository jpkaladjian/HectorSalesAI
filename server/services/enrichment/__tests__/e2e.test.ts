/**
 * Tests E2E (End-to-End) - Système d'Enrichissement Multi-Pays
 * 
 * Ces tests valident les scénarios complets d'utilisation réelle :
 * - Enrichissement complet avec tous les providers
 * - Scénarios de fallback
 * - Gestion des erreurs
 * - Performance
 * - Concurrence
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { enrichmentOrchestrator, EnrichmentOrchestrator } from '../enrichment-orchestrator';
import { OpenCorporatesProvider } from '../opencorporates-provider';
import { WebSearchProvider } from '../websearch-provider';

// Mock des providers
vi.mock('../opencorporates-provider');
vi.mock('../websearch-provider');

describe('Tests E2E - Enrichissement Multi-Pays', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Scénario 1 : France → Pappers → Succès', () => {
    it('devrait retourner une erreur car Pappers est un service Python', async () => {
      const result = await enrichmentOrchestrator.enrichCompany(
        '123456789',
        'FR',
        { companyName: 'Société Française', enableFallback: false }
      );

      expect(result.data).toBeNull();
      expect(result.error).toContain('Python');
      expect(result.provider).toBe('pappers');
      expect(result.fallbackUsed).toBe(false);
    });

    it('devrait fallback vers WebSearch si activé', async () => {
      const mockWebSearchData = {
        nom: 'Société Française',
        identifiantNational: '123456789',
        identifiantNationalType: 'SIREN',
        source: 'web_search' as const,
        dateEnrichissement: new Date().toISOString(),
        qualityScore: 50,
      };

      vi.mocked(WebSearchProvider.prototype.enrichCompany).mockResolvedValue(mockWebSearchData);

      const result = await enrichmentOrchestrator.enrichCompany(
        '123456789',
        'FR',
        { companyName: 'Société Française', enableFallback: true }
      );

      expect(result.data).toBeDefined();
      expect(result.provider).toBe('web_search');
      expect(result.fallbackUsed).toBe(true);
      expect(result.data?.nom).toBe('Société Française');
      expect(result.data?.qualityScore).toBe(50);
    });
  });

  describe('Scénario 2 : Belgique → OpenCorporates → Succès', () => {
    it('devrait enrichir une entreprise belge avec OpenCorporates', async () => {
      const mockData = {
        nom: 'Example SPRL',
        identifiantNational: 'BE0123456789',
        identifiantNationalType: 'VAT',
        adresse: {
          adresse: '123 Rue de la Loi',
          codePostal: '1000',
          ville: 'Brussels',
          pays: 'Belgique',
        },
        dirigeants: [
          { nom: 'Dupont', prenom: 'Jean', fonction: 'CEO' },
        ],
        secteurActivite: 'Technology',
        qualityScore: 85,
        source: 'opencorporates' as const,
        dateEnrichissement: new Date().toISOString(),
      };

      vi.mocked(OpenCorporatesProvider.prototype.enrichCompany).mockResolvedValue(mockData);

      const result = await enrichmentOrchestrator.enrichCompany(
        'BE0123456789',
        'BE',
        { companyName: 'Example SPRL' }
      );

      expect(result.data).toBeDefined();
      expect(result.provider).toBe('opencorporates');
      expect(result.fallbackUsed).toBe(false);
      expect(result.data?.nom).toBe('Example SPRL');
      expect(result.data?.qualityScore).toBe(85);
      expect(result.data?.adresse).toBeDefined();
      expect(result.data?.dirigeants).toHaveLength(1);
      expect(result.data?.dirigeants?.[0].nom).toBe('Dupont');
    });

    it('devrait mesurer le temps de réponse', async () => {
      const mockData = {
        nom: 'Test SPRL',
        identifiantNational: 'BE0987654321',
        identifiantNationalType: 'VAT',
        source: 'opencorporates' as const,
        dateEnrichissement: new Date().toISOString(),
        qualityScore: 75,
      };

      vi.mocked(OpenCorporatesProvider.prototype.enrichCompany).mockResolvedValue(mockData);

      const startTime = Date.now();
      const result = await enrichmentOrchestrator.enrichCompany('BE0987654321', 'BE');
      const duration = Date.now() - startTime;

      expect(result.data).toBeDefined();
      expect(duration).toBeLessThan(3000); // Moins de 3 secondes
    });
  });

  describe('Scénario 3 : Suisse → WebSearch → Succès', () => {
    it('devrait enrichir une entreprise suisse avec WebSearch', async () => {
      const mockData = {
        nom: 'Nestlé SA',
        identifiantNational: 'CHE-123.456.789',
        identifiantNationalType: 'CHE',
        adresse: {
          adresse: 'Avenue Nestlé 55',
          codePostal: '1800',
          ville: 'Vevey',
          pays: 'Suisse',
        },
        dirigeants: [
          { nom: 'Schneider', prenom: 'Mark', fonction: 'CEO' },
        ],
        secteurActivite: 'Food & Beverage',
        dateCreation: '1866',
        qualityScore: 90,
        source: 'web_search' as const,
        dateEnrichissement: new Date().toISOString(),
      };

      vi.mocked(WebSearchProvider.prototype.enrichCompany).mockResolvedValue(mockData);

      const result = await enrichmentOrchestrator.enrichCompany(
        'CHE-123.456.789',
        'CH',
        { companyName: 'Nestlé SA' }
      );

      expect(result.data).toBeDefined();
      expect(result.provider).toBe('web_search');
      expect(result.fallbackUsed).toBe(false);
      expect(result.data?.nom).toBe('Nestlé SA');
      expect(result.data?.qualityScore).toBe(90);
      expect(result.data?.adresse?.ville).toBe('Vevey');
      expect(result.data?.dateCreation).toBe('1866');
    });
  });

  describe('Scénario 4 : Fallback Automatique - Luxembourg échoue → WebSearch réussit', () => {
    it('devrait fallback vers WebSearch si OpenCorporates échoue', async () => {
      // OpenCorporates échoue
      vi.mocked(OpenCorporatesProvider.prototype.enrichCompany).mockRejectedValue(
        new Error('API timeout')
      );

      // WebSearch réussit
      const mockWebSearchData = {
        nom: 'Luxembourg Company SA',
        identifiantNational: 'B123456',
        identifiantNationalType: 'RCS',
        adresse: {
          adresse: '1 Boulevard Royal',
          codePostal: 'L-2449',
          ville: 'Luxembourg',
          pays: 'Luxembourg',
        },
        qualityScore: 60,
        source: 'web_search' as const,
        dateEnrichissement: new Date().toISOString(),
      };

      vi.mocked(WebSearchProvider.prototype.enrichCompany).mockResolvedValue(mockWebSearchData);

      const result = await enrichmentOrchestrator.enrichCompany(
        'B123456',
        'LU',
        { companyName: 'Luxembourg Company SA', enableFallback: true }
      );

      expect(result.data).toBeDefined();
      expect(result.provider).toBe('web_search'); // Provider final après fallback
      expect(result.fallbackUsed).toBe(true);
      expect(result.data?.nom).toBe('Luxembourg Company SA');
      expect(result.data?.qualityScore).toBe(60);
    });

    it('ne devrait PAS fallback si désactivé', async () => {
      vi.mocked(OpenCorporatesProvider.prototype.enrichCompany).mockRejectedValue(
        new Error('API timeout')
      );

      const result = await enrichmentOrchestrator.enrichCompany(
        'B123456',
        'LU',
        { enableFallback: false }
      );

      expect(result.data).toBeNull();
      expect(result.fallbackUsed).toBe(false);
      expect(result.error).toContain('API timeout');
    });
  });

  describe('Scénario 5 : Identifiant Invalide', () => {
    it('devrait rejeter un identifiant SIREN invalide (France)', async () => {
      const result = await enrichmentOrchestrator.enrichCompany('123', 'FR');

      expect(result.data).toBeNull();
      expect(result.error).toContain('invalide');
      expect(result.error).toContain('9 chiffres');
    });

    it('devrait rejeter un VAT belge invalide', async () => {
      const result = await enrichmentOrchestrator.enrichCompany('BE123', 'BE');

      expect(result.data).toBeNull();
      expect(result.error).toContain('invalide');
      expect(result.error).toContain('BE + 10 chiffres');
    });

    it('devrait rejeter un IDE suisse invalide', async () => {
      const result = await enrichmentOrchestrator.enrichCompany('CHE-ABC', 'CH');

      expect(result.data).toBeNull();
      expect(result.error).toContain('invalide');
    });
  });

  describe('Scénario 6 : Pays Non Supporté', () => {
    it('devrait rejeter un pays non configuré', async () => {
      const result = await enrichmentOrchestrator.enrichCompany('12345', 'US');

      expect(result.data).toBeNull();
      expect(result.error).toContain('non configuré');
      expect(result.error).toContain('US');
    });

    it('devrait retourner null pour un code pays invalide', async () => {
      const result = await enrichmentOrchestrator.enrichCompany('12345', 'XX');

      expect(result.data).toBeNull();
      expect(result.error).toContain('non configuré');
    });
  });

  describe('Scénario 7 : Performance - < 3 secondes', () => {
    it('devrait enrichir en moins de 3 secondes (OpenCorporates)', async () => {
      const mockData = {
        nom: 'Fast Company',
        identifiantNational: 'BE0111222333',
        identifiantNationalType: 'VAT',
        source: 'opencorporates' as const,
        dateEnrichissement: new Date().toISOString(),
        qualityScore: 70,
      };

      vi.mocked(OpenCorporatesProvider.prototype.enrichCompany).mockResolvedValue(mockData);

      const startTime = Date.now();
      const result = await enrichmentOrchestrator.enrichCompany('BE0111222333', 'BE');
      const duration = Date.now() - startTime;

      expect(result.data).toBeDefined();
      expect(duration).toBeLessThan(3000);
    });

    it('devrait enrichir en moins de 3 secondes (WebSearch)', async () => {
      const mockData = {
        nom: 'Swiss Company',
        identifiantNational: 'CHE-111.222.333',
        identifiantNationalType: 'CHE',
        source: 'web_search' as const,
        dateEnrichissement: new Date().toISOString(),
        qualityScore: 55,
      };

      vi.mocked(WebSearchProvider.prototype.enrichCompany).mockResolvedValue(mockData);

      const startTime = Date.now();
      const result = await enrichmentOrchestrator.enrichCompany('CHE-111.222.333', 'CH');
      const duration = Date.now() - startTime;

      expect(result.data).toBeDefined();
      expect(duration).toBeLessThan(3000);
    });
  });

  describe('Scénario 8 : Concurrence - 5 enrichissements parallèles', () => {
    it('devrait gérer 5 enrichissements en parallèle', async () => {
      // Mock des données pour chaque pays
      const mockDataBE = {
        nom: 'Belgian Company',
        identifiantNational: 'BE0123456789',
        identifiantNationalType: 'VAT',
        source: 'opencorporates' as const,
        dateEnrichissement: new Date().toISOString(),
        qualityScore: 75,
      };

      const mockDataCH = {
        nom: 'Swiss Company',
        identifiantNational: 'CHE-123.456.789',
        identifiantNationalType: 'CHE',
        source: 'web_search' as const,
        dateEnrichissement: new Date().toISOString(),
        qualityScore: 60,
      };

      vi.mocked(OpenCorporatesProvider.prototype.enrichCompany).mockResolvedValue(mockDataBE);
      vi.mocked(WebSearchProvider.prototype.enrichCompany).mockResolvedValue(mockDataCH);

      // 5 enrichissements en parallèle
      const companies = [
        { identifier: 'BE0123456789', countryCode: 'BE', name: 'Company BE 1' },
        { identifier: 'BE0987654321', countryCode: 'BE', name: 'Company BE 2' },
        { identifier: 'CHE-123.456.789', countryCode: 'CH', name: 'Company CH 1' },
        { identifier: 'BE0555555555', countryCode: 'BE', name: 'Company BE 3' },
        { identifier: 'CHE-999.888.777', countryCode: 'CH', name: 'Company CH 2' },
      ];

      const startTime = Date.now();
      
      const results = await Promise.all(
        companies.map(company =>
          enrichmentOrchestrator.enrichCompany(
            company.identifier,
            company.countryCode,
            { companyName: company.name }
          )
        )
      );

      const duration = Date.now() - startTime;

      // Vérifications
      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result.data).toBeDefined();
        expect(['opencorporates', 'web_search']).toContain(result.provider);
      });

      // Performance : devrait être < 5s en parallèle (vs ~15s en séquentiel)
      expect(duration).toBeLessThan(5000);
    });
  });

  describe('Scénario 9 : Quality Score Distribution', () => {
    it('devrait avoir des quality scores cohérents par provider', async () => {
      // OpenCorporates : scores 60-90
      const mockOC = {
        nom: 'Company OC',
        identifiantNational: 'BE0123456789',
        identifiantNationalType: 'VAT',
        source: 'opencorporates' as const,
        dateEnrichissement: new Date().toISOString(),
        qualityScore: 85,
      };

      // WebSearch : scores 30-100 (plus variable)
      const mockWS = {
        nom: 'Company WS',
        identifiantNational: 'CHE-123.456.789',
        identifiantNationalType: 'CHE',
        source: 'web_search' as const,
        dateEnrichissement: new Date().toISOString(),
        qualityScore: 50,
      };

      vi.mocked(OpenCorporatesProvider.prototype.enrichCompany).mockResolvedValue(mockOC);
      vi.mocked(WebSearchProvider.prototype.enrichCompany).mockResolvedValue(mockWS);

      const resultOC = await enrichmentOrchestrator.enrichCompany('BE0123456789', 'BE');
      const resultWS = await enrichmentOrchestrator.enrichCompany('CHE-123.456.789', 'CH');

      // OpenCorporates : qualité généralement élevée
      expect(resultOC.data?.qualityScore).toBeGreaterThanOrEqual(60);
      expect(resultOC.data?.qualityScore).toBeLessThanOrEqual(100);

      // WebSearch : qualité variable
      expect(resultWS.data?.qualityScore).toBeGreaterThanOrEqual(0);
      expect(resultWS.data?.qualityScore).toBeLessThanOrEqual(100);
    });
  });

  describe('Scénario 10 : Métadonnées et Traçabilité', () => {
    it('devrait inclure toutes les métadonnées nécessaires', async () => {
      const mockData = {
        nom: 'Traceable Company',
        identifiantNational: 'BE0123456789',
        identifiantNationalType: 'VAT',
        source: 'opencorporates' as const,
        dateEnrichissement: new Date().toISOString(),
        qualityScore: 80,
      };

      vi.mocked(OpenCorporatesProvider.prototype.enrichCompany).mockResolvedValue(mockData);

      const result = await enrichmentOrchestrator.enrichCompany('BE0123456789', 'BE');

      // Métadonnées obligatoires
      expect(result.provider).toBeDefined();
      expect(result.fallbackUsed).toBeDefined();
      expect(result.data?.source).toBeDefined();
      expect(result.data?.dateEnrichissement).toBeDefined();
      expect(result.data?.qualityScore).toBeDefined();

      // Vérifier le format ISO de la date
      expect(result.data?.dateEnrichissement).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });

  describe('Scénario 11 : Tous les 13 Pays', () => {
    it('devrait supporter tous les pays configurés', () => {
      const countries = enrichmentOrchestrator.getSupportedCountries();
      
      expect(countries).toHaveLength(13);
      expect(countries).toContain('FR'); // France
      expect(countries).toContain('BE'); // Belgique
      expect(countries).toContain('CH'); // Suisse
      expect(countries).toContain('LU'); // Luxembourg
      expect(countries).toContain('GB'); // Royaume-Uni
      expect(countries).toContain('DE'); // Allemagne
      expect(countries).toContain('ES'); // Espagne
      expect(countries).toContain('IT'); // Italie
      expect(countries).toContain('GP'); // Guadeloupe
      expect(countries).toContain('MQ'); // Martinique
      expect(countries).toContain('GF'); // Guyane
      expect(countries).toContain('RE'); // Réunion
      expect(countries).toContain('YT'); // Mayotte
    });

    it('devrait router chaque pays vers le bon provider', () => {
      // Pappers
      expect(enrichmentOrchestrator.getProviderForCountry('FR')).toBe('pappers');
      expect(enrichmentOrchestrator.getProviderForCountry('GP')).toBe('pappers');

      // OpenCorporates
      expect(enrichmentOrchestrator.getProviderForCountry('BE')).toBe('opencorporates');
      expect(enrichmentOrchestrator.getProviderForCountry('LU')).toBe('opencorporates');
      expect(enrichmentOrchestrator.getProviderForCountry('GB')).toBe('opencorporates');

      // WebSearch
      expect(enrichmentOrchestrator.getProviderForCountry('CH')).toBe('web_search');
    });
  });
});
