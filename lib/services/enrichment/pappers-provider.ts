/**
 * Pappers Provider - Enrichissement entreprises françaises (SIREN/SIRET)
 * 
 * Fonctionnalités :
 * - Enrichissement via API Pappers pour la France (SIREN/SIRET)
 * - Cache intelligent 30 jours pour réduire coûts API
 * - Support SIREN (siège social) et SIRET (établissements)
 * - Gestion automatique des établissements multiples
 */

import axios, { AxiosError } from 'axios';
import { storage } from '../../../server/storage';
import type {
  EnrichmentProvider,
  CompanyEnrichmentData,
  CompanyAddress,
  CompanyDirigeant,
} from './base-enrichment.interface';
import {
  extractProcedureType,
  extractProcedureLibelle,
  extractProcedureDate,
  extractTribunal,
  formatFrenchPhone,
  extractEffectifMin,
  extractEffectifMax,
  formatEffectifFromNumber,
  getDepartmentFromPostalCode,
  getRegionFromPostalCode,
} from '../../utils/pappers-utils';
import { calculateFrenchTVA, getLegalFormLabel } from '../../utils/insee-utils';

// ============================================
// TYPES PAPPERS API
// ============================================

interface PappersApiResponse {
  // Champs racine (entrepreneur individuel)
  nom?: string; // Nom patronyme dirigeant
  prenom?: string; // Prénom dirigeant
  nom_entreprise?: string; // Nom complet entreprise (ex: "BRULE CHRISTOPHE")
  
  siege?: {
    siret: string;
    siren: string;
    nic?: string;
    denomination?: string;
    nom_entreprise?: string;
    nom_commercial?: string; // Phase 2.8
    enseigne?: string; // Phase 2.8 : Enseigne commerciale
    forme_juridique?: string;
    forme_juridique_code?: string;
    capital?: number;
    date_creation?: string;
    code_naf?: string;
    libelle_code_naf?: string;
    domaine_activite?: string;
    adresse?: string;
    adresse_ligne_1?: string;
    adresse_ligne_2?: string;
    complement_adresse?: string; // Phase 2.8
    code_postal?: string;
    ville?: string;
    commune?: string; // Phase 2.8
    pays?: string;
    latitude?: number; // Phase 2.8 : GPS
    longitude?: number; // Phase 2.8 : GPS
    telephone?: string;
    email?: string;
    site_internet?: string; // Phase 2.8
    effectif?: number;
    tranche_effectif_entreprise?: string; // Phase 2.8 : "50-99", "100-199"
    chiffre_affaires?: number;
    resultat?: number;
    numero_tva_intracommunautaire?: string; // Phase 2.8
    statut_rcs?: string; // Phase 2.8 : "Actif", "Radié"
    date_radiation?: string; // Phase 2.8
    date_cessation?: string; // Phase 2.8
    procedure_collective?: boolean; // Phase 2.8
  };
  representants?: Array<{
    nom?: string;
    nom_complet?: string;
    prenom?: string;
    qualite?: string;
    date_naissance?: string;
  }>;
  entreprise?: {
    siren: string;
    denomination?: string;
    nom_entreprise?: string;
    forme_juridique?: string;
    capital?: number;
    date_creation?: string;
  };
  etablissements?: Array<{
    siret: string;
    nic: string;
    adresse?: string;
    code_postal?: string;
    ville?: string;
    actif?: boolean;
  }>;
  // Phase 2.8 : Alertes juridiques (RJ/LJ)
  procedures_collectives?: Array<{
    type: string; // "redressement_judiciaire", "liquidation_judiciaire", "sauvegarde", "plan_continuation"
    date_debut?: string;
    date_fin?: string;
    tribunal?: string;
  }>;
}

// ============================================
// PAPPERS PROVIDER
// ============================================

export class PappersProvider implements EnrichmentProvider {
  readonly name = 'pappers';
  private apiKey: string;
  private baseUrl = 'https://api.pappers.fr/v2';
  private cacheExpirationDays = 30;

  constructor() {
    this.apiKey = process.env.PAPPERS_API_KEY || '';
    if (!this.apiKey) {
      console.warn('[PappersProvider] ⚠️ PAPPERS_API_KEY non configurée');
    }
  }

  /**
   * Enrichir une entreprise française via SIREN ou SIRET
   */
  async enrichCompany(
    identifier: string,
    countryCode: string,
    companyName?: string
  ): Promise<CompanyEnrichmentData | null> {
    // Vérifier que c'est bien la France
    if (countryCode !== 'FR') {
      console.warn(`[PappersProvider] ⚠️ Pappers ne supporte que la France, reçu: ${countryCode}`);
      return null;
    }

    // Nettoyer l'identifiant (supprimer espaces, tirets)
    const cleanIdentifier = identifier.replace(/[\s-]/g, '');
    
    // Déterminer le type (SIREN = 9 chiffres, SIRET = 14 chiffres)
    const isSiren = cleanIdentifier.length === 9;
    const isSiret = cleanIdentifier.length === 14;

    if (!isSiren && !isSiret) {
      console.warn(`[PappersProvider] ⚠️ Format invalide: ${cleanIdentifier} (attendu: 9 ou 14 chiffres)`);
      return null;
    }

    const identifierType = isSiren ? 'siren' : 'siret';
    console.log(`[PappersProvider] 🔍 Enrichissement ${identifierType.toUpperCase()}: ${cleanIdentifier}`);

    try {
      // 1. Vérifier le cache
      const cachedData = await this.getFromCache(cleanIdentifier, identifierType);
      if (cachedData) {
        console.log(`[PappersProvider] ✅ Cache HIT pour ${cleanIdentifier}`);
        return cachedData;
      }

      console.log(`[PappersProvider] ❌ Cache MISS pour ${cleanIdentifier} - Appel API`);

      // 2. Appel API Pappers
      const apiData = await this.callPappersApi(cleanIdentifier, identifierType);
      if (!apiData) {
        return null;
      }

      // 3. Transformer en format CompanyEnrichmentData
      const enrichedData = this.transformPappersData(apiData, cleanIdentifier, identifierType);

      // 4. Mettre en cache (30 jours)
      await this.saveToCache(cleanIdentifier, identifierType, apiData);

      return enrichedData;

    } catch (error) {
      console.error(`[PappersProvider] ❌ Erreur enrichissement ${cleanIdentifier}:`, error);
      
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 404) {
          console.log(`[PappersProvider] ℹ️ Entreprise ${cleanIdentifier} non trouvée`);
          return null;
        }
        if (axiosError.response?.status === 401) {
          console.error('[PappersProvider] ❌ API Key invalide ou expirée');
        }
      }
      
      throw error;
    }
  }

  /**
   * Appeler l'API Pappers
   * Note: L'API Pappers utilise TOUJOURS /v2/entreprise (pas /v2/etablissement)
   * On peut passer soit siren=XXX soit siret=XXX sur ce même endpoint
   */
  private async callPappersApi(
    identifier: string,
    identifierType: 'siren' | 'siret'
  ): Promise<PappersApiResponse | null> {
    if (!this.apiKey) {
      throw new Error('PAPPERS_API_KEY non configurée');
    }

    // L'API Pappers utilise /v2/entreprise pour SIREN et SIRET
    const endpoint = '/entreprise';
    const paramName = identifierType === 'siren' ? 'siren' : 'siret';

    try {
      const response = await axios.get<PappersApiResponse>(
        `${this.baseUrl}${endpoint}`,
        {
          params: {
            api_token: this.apiKey,
            [paramName]: identifier,
          },
          timeout: 10000, // 10 secondes
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Transformer les données Pappers en format CompanyEnrichmentData (Phase 2.8 : enrichissement complet)
   */
  private transformPappersData(
    apiData: PappersApiResponse,
    identifier: string,
    identifierType: 'siren' | 'siret'
  ): CompanyEnrichmentData {
    const siege = apiData.siege;
    const entreprise = apiData.entreprise;
    const procedures = apiData.procedures_collectives;
    
    // Phase 2.8 : Adresse complète structurée
    let adresse: CompanyAddress | undefined;
    if (siege?.adresse || siege?.adresse_ligne_1) {
      const codePostal = siege.code_postal || '';
      
      adresse = {
        adresse: siege.adresse_ligne_1 || siege.adresse || '',
        adresseLigne2: siege.adresse_ligne_2,
        codePostal,
        ville: siege.ville || '',
        commune: siege.commune || siege.ville,
        department: getDepartmentFromPostalCode(codePostal),
        region: getRegionFromPostalCode(codePostal),
        pays: siege.pays || 'France',
        complementAddress: siege.complement_adresse,
        latitude: siege.latitude,
        longitude: siege.longitude,
      };
    }

    // Extraire les dirigeants
    const dirigeants: CompanyDirigeant[] = (apiData.representants || [])
      .filter(r => r.nom || r.nom_complet)
      .map(r => ({
        nom: r.nom || r.nom_complet || '',
        prenom: r.prenom,
        fonction: r.qualite || 'Dirigeant',
        dateNaissance: r.date_naissance,
      }));

    // Phase 2.8 : Effectif depuis tranche ou nombre
    const trancheEffectif = siege?.tranche_effectif_entreprise;
    const effectifNumber = siege?.effectif;

    // Extraire SIREN pour calculer TVA
    const siren = identifierType === 'siren' ? identifier : identifier.substring(0, 9);

    // Phase 2.8 : Alertes juridiques
    const hasProcedure = procedures && procedures.length > 0;
    const procedureActive = siege?.procedure_collective === true || hasProcedure;

    // Score de qualité basé sur la complétude des données
    let qualityScore = 50; // Base
    if (siege?.denomination || siege?.nom_entreprise) qualityScore += 10;
    if (adresse) qualityScore += 10;
    if (dirigeants.length > 0) qualityScore += 15;
    if (siege?.forme_juridique) qualityScore += 5;
    if (siege?.code_naf) qualityScore += 5;
    if (effectifNumber !== undefined) qualityScore += 5;
    if (siege?.telephone || siege?.email || siege?.site_internet) qualityScore += 10; // Phase 2.8

    return {
      // Données de base
      // Fallback: siege.* > entreprise.* > champs racines (entrepreneur individuel)
      nom: siege?.denomination || siege?.nom_entreprise || entreprise?.denomination || entreprise?.nom_entreprise || apiData.nom_entreprise || '',
      nomCommercial: siege?.nom_commercial || siege?.enseigne, // Phase 2.8
      formeJuridique: siege?.forme_juridique_code || siege?.forme_juridique || entreprise?.forme_juridique,
      formeJuridiqueLibelle: getLegalFormLabel(siege?.forme_juridique_code) || siege?.forme_juridique, // Phase 2.8
      capital: siege?.capital || entreprise?.capital,
      dateCreation: siege?.date_creation || entreprise?.date_creation,

      // Identifiants
      identifiantNational: identifierType === 'siren' 
        ? (siege?.siren || entreprise?.siren || identifier)
        : (siege?.siret || identifier),
      identifiantNationalType: identifierType === 'siren' ? 'SIREN' : 'SIRET',
      numeroTVA: siege?.numero_tva_intracommunautaire || calculateFrenchTVA(siren), // Phase 2.8

      // Adresse complète Phase 2.8
      adresse,

      // Phase 2.8 : Coordonnées complètes
      telephone: formatFrenchPhone(siege?.telephone),
      email: siege?.email,
      siteWeb: siege?.site_internet,

      // Dirigeants
      dirigeants: dirigeants.length > 0 ? dirigeants : undefined,

      // Données financières Phase 2.8
      effectif: effectifNumber,
      effectifMin: extractEffectifMin(trancheEffectif),
      effectifMax: extractEffectifMax(trancheEffectif),
      effectifTexte: trancheEffectif || formatEffectifFromNumber(effectifNumber),
      chiffreAffaires: siege?.chiffre_affaires,
      resultatNet: siege?.resultat,

      // Activité
      codeNAF: siege?.code_naf,
      libelleNAF: siege?.libelle_code_naf,
      secteurActivite: siege?.domaine_activite,

      // Phase 2.8 : État administratif
      etatAdministratif: siege?.statut_rcs === 'Radié' ? 'Cessé' : 'Actif',
      dateCessation: siege?.date_cessation || siege?.date_radiation,

      // Phase 2.8 : Alertes juridiques (RJ/LJ)
      procedureCollective: procedureActive,
      procedureType: procedureActive ? extractProcedureType(procedures) : undefined,
      procedureTypeLibelle: procedureActive ? extractProcedureLibelle(procedures) : undefined,
      procedureDate: procedureActive ? extractProcedureDate(procedures) : undefined,
      tribunalCommerce: procedureActive ? extractTribunal(procedures) : undefined,

      // Métadonnées
      source: 'pappers',
      dateEnrichissement: new Date().toISOString(),
      qualityScore,
    };
  }

  /**
   * Récupérer depuis le cache (30 jours)
   */
  private async getFromCache(
    identifier: string,
    identifierType: 'siren' | 'siret'
  ): Promise<CompanyEnrichmentData | null> {
    try {
      const cached = await storage.getPappersCache(identifier, identifierType);
      
      if (!cached) {
        return null;
      }

      // Le cache existe et n'est pas expiré (vérifié dans storage.getPappersCache)
      const apiData = cached.apiResponse as PappersApiResponse;
      return this.transformPappersData(apiData, identifier, identifierType);
      
    } catch (error) {
      console.error('[PappersProvider] ❌ Erreur lecture cache:', error);
      return null;
    }
  }

  /**
   * Sauvegarder dans le cache (30 jours)
   */
  private async saveToCache(
    identifier: string,
    identifierType: 'siren' | 'siret',
    apiData: PappersApiResponse
  ): Promise<void> {
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + this.cacheExpirationDays);

      await storage.createPappersCache({
        identifier,
        identifierType,
        apiResponse: apiData as any, // JSONB
        expiresAt,
      });

      console.log(`[PappersProvider] 💾 Cache sauvegardé pour ${identifier} (expire: ${expiresAt.toISOString()})`);
    } catch (error) {
      console.error('[PappersProvider] ❌ Erreur sauvegarde cache:', error);
      // Ne pas bloquer si le cache échoue
    }
  }

  /**
   * Nettoyer le cache expiré (à appeler périodiquement)
   */
  async cleanExpiredCache(): Promise<void> {
    try {
      await storage.cleanExpiredCache();
      console.log('[PappersProvider] 🧹 Cache expiré nettoyé');
    } catch (error) {
      console.error('[PappersProvider] ❌ Erreur nettoyage cache:', error);
    }
  }
}
