/**
 * Sample test suite for ICD Service
 * Demonstrates Jest + React Testing Library setup
 * 
 * @jest-environment jsdom
 */

import ICDService, { icdService } from '../icdService';

describe('ICDService', () => {
  describe('Constructor and Configuration', () => {
    it('should create an instance with default configuration', () => {
      const service = new ICDService({
        clientId: 'test-client',
        clientSecret: 'test-secret',
        tokenEndpoint: 'https://test.example.com/token',
        apiBaseUrl: 'https://test.example.com',
        language: 'en',
      });

      expect(service).toBeInstanceOf(ICDService);
    });
  });

  describe('ICD-11 Search', () => {
    it('should search ICD-11 concepts with query', async () => {
      // Mock fetch for this test
      global.fetch = jest.fn().mockImplementation((url) => {
        if (url.includes('/token')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              access_token: 'mock-token',
              token_type: 'Bearer',
              expires_in: 3600,
            }),
          });
        }
        
        if (url.includes('/search')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              destinationEntities: [
                {
                  id: 'http://id.who.int/icd/entity/123456789',
                  title: 'Diabetes mellitus',
                  theCode: 'E11',
                  score: 0.95,
                  titleIsASearchResult: true,
                  titleIsTopScore: true,
                },
              ],
              error: false,
              resultChopped: false,
              wordSuggestionsChopped: false,
              guessType: 0,
              uniqueSearchId: 'test-search-id',
            }),
          });
        }

        return Promise.reject(new Error('Unexpected URL'));
      }) as jest.Mock;

      const results = await icdService.searchICD11('diabetes');
      
      expect(results).toBeDefined();
      expect(results.destinationEntities).toHaveLength(1);
      expect(results.destinationEntities[0].title).toBe('Diabetes mellitus');
      expect(results.destinationEntities[0].theCode).toBe('E11');
    });

    it('should handle search with flatResults option', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          destinationEntities: [],
          error: false,
          resultChopped: false,
          wordSuggestionsChopped: false,
          guessType: 0,
          uniqueSearchId: 'test-id',
        }),
      }) as jest.Mock;

      await icdService.searchICD11('test', { flatResults: true });
      
      const calls = (global.fetch as jest.Mock).mock.calls;
      const searchCall = calls.find((call) => call[0].includes('/search'));
      
      expect(searchCall[0]).toContain('flatResults=true');
    });
  });

  describe('Authentication', () => {
    it('should handle authentication errors gracefully', async () => {
      const service = new ICDService({
        clientId: 'invalid',
        clientSecret: 'invalid',
        tokenEndpoint: 'https://test.example.com/token',
        apiBaseUrl: 'https://test.example.com',
        language: 'en',
      });

      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        statusText: 'Unauthorized',
      }) as jest.Mock;

      await expect(service.searchICD11('test')).rejects.toThrow(
        'ICD API authentication failed: Unauthorized'
      );
    });

    it('should cache and reuse valid tokens', async () => {
      const mockFetch = jest.fn().mockImplementation((url) => {
        if (url.includes('/token')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              access_token: 'cached-token',
              token_type: 'Bearer',
              expires_in: 3600,
            }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({
            destinationEntities: [],
            error: false,
            resultChopped: false,
            wordSuggestionsChopped: false,
            guessType: 0,
            uniqueSearchId: 'id',
          }),
        });
      });

      global.fetch = mockFetch as jest.Mock;

      const service = new ICDService({
        clientId: 'test',
        clientSecret: 'test',
        tokenEndpoint: 'https://test.example.com/token',
        apiBaseUrl: 'https://test.example.com',
        language: 'en',
      });

      // Make two requests
      await service.searchICD11('test1');
      await service.searchICD11('test2');

      // Token endpoint should only be called once
      const tokenCalls = mockFetch.mock.calls.filter((call) =>
        call[0].includes('/token')
      );
      expect(tokenCalls.length).toBe(1);
    });
  });

  describe('Post-coordination Validation', () => {
    it('should validate post-coordination clusters', async () => {
      const result = await icdService.validatePostCoordination(
        'http://id.who.int/icd/entity/123456789',
        ['http://id.who.int/icd/entity/extension/severity/severe']
      );

      expect(result).toBeDefined();
      expect(result.valid).toBe(true);
    });
  });
});

// Clean up after tests
afterEach(() => {
  jest.restoreAllMocks();
});
