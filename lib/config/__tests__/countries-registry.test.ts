/**
 * Tests unitaires pour le registry des pays
 * Valide la configuration des 13 pays et les fonctions helper
 */

import { describe, it, expect } from 'vitest';
import {
  COUNTRIES_REGISTRY,
  getCountryConfig,
  validateIdentifier,
  getAvailableCountries,
  type CountryConfig,
} from '../countries-registry';

describe('Countries Registry', () => {
  /**
   * TEST 1: Vérifier que 13 pays sont configurés
   */
  it('should have exactly 13 countries configured', () => {
    const countryCodes = Object.keys(COUNTRIES_REGISTRY);
    expect(countryCodes).toHaveLength(13);
    
    // Vérifier les codes attendus
    const expectedCodes = ['FR', 'BE', 'CH', 'LU', 'GB', 'DE', 'ES', 'IT', 'GP', 'MQ', 'GF', 'RE', 'YT'];
    expect(countryCodes.sort()).toEqual(expectedCodes.sort());
  });

  /**
   * TEST 2: Valider format SIREN français (9 chiffres)
   */
  it('should validate French SIREN format (9 digits)', () => {
    // SIREN valides
    expect(validateIdentifier('FR', '123456789')).toBe(true);
    expect(validateIdentifier('FR', '987654321')).toBe(true);
    expect(validateIdentifier('fr', '442400878')).toBe(true); // Case insensitive
    
    // SIREN invalides
    expect(validateIdentifier('FR', '12345678')).toBe(false); // Trop court
    expect(validateIdentifier('FR', '1234567890')).toBe(false); // Trop long
    expect(validateIdentifier('FR', '12345678A')).toBe(false); // Contient lettre
    expect(validateIdentifier('FR', '123 456 789')).toBe(false); // Contient espaces
  });

  /**
   * TEST 3: Valider format TVA belge (BE + 10 chiffres)
   */
  it('should validate Belgian VAT format (BE + 10 digits)', () => {
    // TVA belges valides
    expect(validateIdentifier('BE', 'BE0123456789')).toBe(true);
    expect(validateIdentifier('BE', 'BE9876543210')).toBe(true);
    
    // TVA belges invalides
    expect(validateIdentifier('BE', '0123456789')).toBe(false); // Manque BE
    expect(validateIdentifier('BE', 'BE012345678')).toBe(false); // Trop court
    expect(validateIdentifier('BE', 'BE01234567890')).toBe(false); // Trop long
    expect(validateIdentifier('BE', 'FR0123456789')).toBe(false); // Mauvais préfixe
  });

  /**
   * TEST 4: Valider format IDE suisse (CHE-XXX.XXX.XXX)
   */
  it('should validate Swiss IDE format (CHE-XXX.XXX.XXX)', () => {
    // IDE suisses valides
    expect(validateIdentifier('CH', 'CHE-123.456.789')).toBe(true);
    expect(validateIdentifier('CH', 'CHE-987.654.321')).toBe(true);
    expect(validateIdentifier('CH', 'CHE-100.200.300')).toBe(true);
    
    // IDE suisses invalides
    expect(validateIdentifier('CH', 'CHE123456789')).toBe(false); // Manque points et tirets
    expect(validateIdentifier('CH', 'CHE-123.456')).toBe(false); // Incomplet
    expect(validateIdentifier('CH', '123.456.789')).toBe(false); // Manque CHE-
    expect(validateIdentifier('CH', 'CHE-12.456.789')).toBe(false); // Format incorrect
  });

  /**
   * TEST 5: Retourner null pour un pays inexistant
   */
  it('should return null for non-existent country', () => {
    expect(getCountryConfig('XX')).toBeNull();
    expect(getCountryConfig('US')).toBeNull(); // USA non supporté
    expect(getCountryConfig('CA')).toBeNull(); // Canada non supporté
    expect(getCountryConfig('')).toBeNull(); // Chaîne vide
    
    // Valider que ces pays n'existent pas dans le registry
    expect(COUNTRIES_REGISTRY['XX']).toBeUndefined();
    expect(COUNTRIES_REGISTRY['US']).toBeUndefined();
  });

  /**
   * TEST 6: Retourner la configuration correcte pour la France
   */
  it('should return correct config for France', () => {
    const frConfig = getCountryConfig('FR');
    
    expect(frConfig).not.toBeNull();
    expect(frConfig?.code).toBe('FR');
    expect(frConfig?.name).toBe('France');
    expect(frConfig?.identifierType).toBe('SIREN');
    expect(frConfig?.enrichmentProvider).toBe('pappers');
    expect(frConfig?.requiresApiKey).toBe(true);
    expect(frConfig?.fallbackToWeb).toBe(true);
    expect(frConfig?.apiEndpoint).toBe('https://api.pappers.fr/v2');
    
    // Vérifier le pattern SIREN
    expect(frConfig?.identifierPattern.test('123456789')).toBe(true);
    expect(frConfig?.identifierPattern.test('12345678')).toBe(false);
  });

  /**
   * TEST 7: Vérifier que les DOM-TOM utilisent Pappers
   */
  it('should verify DOM-TOM use Pappers provider', () => {
    const domTomCodes = ['GP', 'MQ', 'GF', 'RE', 'YT'];
    
    domTomCodes.forEach((code) => {
      const config = getCountryConfig(code);
      
      expect(config).not.toBeNull();
      expect(config?.enrichmentProvider).toBe('pappers');
      expect(config?.identifierType).toBe('SIREN');
      expect(config?.identifierPattern.test('123456789')).toBe(true);
      expect(config?.requiresApiKey).toBe(true);
      expect(config?.apiEndpoint).toBe('https://api.pappers.fr/v2');
    });
  });

  /**
   * BONUS: Vérifier la fonction getAvailableCountries
   */
  it('should return all countries sorted by name', () => {
    const countries = getAvailableCountries();
    
    expect(countries).toHaveLength(13);
    
    // Vérifier que la liste est triée par nom
    const countryNames = countries.map(c => c.name);
    const sortedNames = [...countryNames].sort((a, b) => a.localeCompare(b));
    expect(countryNames).toEqual(sortedNames);
    
    // Vérifier que tous les objets sont bien des CountryConfig
    countries.forEach((country) => {
      expect(country).toHaveProperty('code');
      expect(country).toHaveProperty('name');
      expect(country).toHaveProperty('identifierType');
      expect(country).toHaveProperty('enrichmentProvider');
    });
  });
});
