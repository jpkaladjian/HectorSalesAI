/**
 * Companies API Client - Phase 2 SIREN/SIRET
 * 
 * Service frontend pour interagir avec les endpoints /api/companies/*
 */

import type { 
  Company, 
  EnrichmentLog,
  InsertCompany,
} from '../../../../shared/schema';

// ============================================
// TYPES
// ============================================

export interface EnrichCompanyRequest {
  identifier: string;
  companyName?: string;
  triggerType?: 'manual' | 'automatic' | 'import';
}

export interface EnrichCompanyResponse {
  company: Company | null;
  enrichmentLog: EnrichmentLog | null;
  success: boolean;
  message: string;
  error?: string;
}

export interface CompaniesListResponse {
  companies: Company[];
  total: number;
  limit: number;
}

export interface EstablishmentsResponse {
  siren: string;
  headquarters: Company;
  establishments: Company[];
  total: number;
}

export interface EnrichmentLogsResponse {
  companyId: string;
  logs: EnrichmentLog[];
  total: number;
}

export interface UpdateCompanyRequest {
  legalName?: string;
  tradeName?: string;
  status?: string;
  addressLine1?: string;
  addressLine2?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Enrichir une entreprise (SIREN/SIRET)
 */
export async function enrichCompany(data: EnrichCompanyRequest): Promise<EnrichCompanyResponse> {
  const response = await fetch('/api/companies/enrich', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de l\'enrichissement');
  }

  return response.json();
}

/**
 * Récupérer une company par ID
 */
export async function getCompany(id: string): Promise<Company> {
  const response = await fetch(`/api/companies/${id}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Entreprise non trouvée');
  }

  return response.json();
}

/**
 * Lister les companies
 */
export async function getCompanies(limit: number = 100): Promise<CompaniesListResponse> {
  const response = await fetch(`/api/companies?limit=${limit}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération des entreprises');
  }

  return response.json();
}

/**
 * Récupérer les établissements d'un SIREN
 */
export async function getEstablishments(companyId: string): Promise<EstablishmentsResponse> {
  const response = await fetch(`/api/companies/${companyId}/establishments`, {
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération des établissements');
  }

  return response.json();
}

/**
 * Récupérer l'historique d'enrichissement
 */
export async function getEnrichmentHistory(
  companyId: string,
  limit: number = 10
): Promise<EnrichmentLogsResponse> {
  const response = await fetch(`/api/companies/${companyId}/enrichment-logs?limit=${limit}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération de l\'historique');
  }

  return response.json();
}

/**
 * Mettre à jour une company
 */
export async function updateCompany(id: string, data: UpdateCompanyRequest): Promise<Company> {
  const response = await fetch(`/api/companies/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la mise à jour');
  }

  const result = await response.json();
  return result.company;
}

/**
 * Supprimer une company
 */
export async function deleteCompany(id: string): Promise<void> {
  const response = await fetch(`/api/companies/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la suppression');
  }
}

// ============================================
// REACT QUERY HOOKS HELPERS
// ============================================

/**
 * Query keys pour TanStack Query
 */
export const companiesKeys = {
  all: ['companies'] as const,
  lists: () => [...companiesKeys.all, 'list'] as const,
  list: (limit?: number) => [...companiesKeys.lists(), { limit }] as const,
  details: () => [...companiesKeys.all, 'detail'] as const,
  detail: (id: string) => [...companiesKeys.details(), id] as const,
  establishments: (id: string) => [...companiesKeys.detail(id), 'establishments'] as const,
  enrichmentLogs: (id: string) => [...companiesKeys.detail(id), 'enrichment-logs'] as const,
};
