/**
 * Tests unitaires - Companies API Client
 * Phase 2 SIREN/SIRET
 */

import { describe, it, expect } from 'vitest';
import { companiesKeys } from '../../client/src/lib/api/companies-api';

describe('Companies API Client', () => {
  describe('companiesKeys', () => {
    it('should generate correct query keys for lists', () => {
      expect(companiesKeys.lists()).toEqual(['companies', 'list']);
      expect(companiesKeys.list(50)).toEqual(['companies', 'list', { limit: 50 }]);
    });

    it('should generate correct query keys for details', () => {
      expect(companiesKeys.details()).toEqual(['companies', 'detail']);
      expect(companiesKeys.detail('test-id')).toEqual(['companies', 'detail', 'test-id']);
    });

    it('should generate correct query keys for establishments', () => {
      expect(companiesKeys.establishments('test-id')).toEqual([
        'companies',
        'detail',
        'test-id',
        'establishments',
      ]);
    });

    it('should generate correct query keys for enrichment logs', () => {
      expect(companiesKeys.enrichmentLogs('test-id')).toEqual([
        'companies',
        'detail',
        'test-id',
        'enrichment-logs',
      ]);
    });
  });
});
