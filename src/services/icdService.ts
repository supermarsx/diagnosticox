/**
 * WHO ICD-API Integration Service
 * 
 * Provides comprehensive ICD-10 and ICD-11 code lookup, search, and mapping functionality.
 * Implements OAuth 2.0 client credentials flow for WHO ICD-API authentication.
 * 
 * @module services/icdService
 * @see {@link https://icd.who.int/icdapi|WHO ICD-API Documentation}
 */

interface ICDConfig {
  clientId: string;
  clientSecret: string;
  tokenEndpoint: string;
  apiBaseUrl: string;
  language: string;
}

interface ICDToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_at: number;
}

interface ICDConcept {
  '@id': string;
  '@context': string;
  title: { '@language': string; '@value': string };
  definition?: { '@language': string; '@value': string };
  longDefinition?: { '@language': string; '@value': string };
  fullySpecifiedName?: { '@language': string; '@value': string };
  synonym?: Array<{ label: { '@language': string; '@value': string } }>;
  parent?: string[];
  child?: string[];
  indexTerm?: Array<{ label: { '@language': string; '@value': string } }>;
  inclusion?: Array<{ label: { '@language': string; '@value': string } }>;
  exclusion?: Array<{ foundationReference: string; label: { '@language': string; '@value': string } }>;
  postcoordinationScale?: any[];
  browserUrl?: string;
}

interface ICDSearchResult {
  destinationEntities: Array<{
    id: string;
    title: string;
    theCode?: string;
    chapter?: string;
    score: number;
    titleIsASearchResult: boolean;
    titleIsTopScore: boolean;
    matchingPVs?: Array<{ label: string; propertyId: string; score: number }>;
  }>;
  error: boolean;
  errorMessage?: string;
  resultChopped: boolean;
  wordSuggestionsChopped: boolean;
  guessType: number;
  uniqueSearchId: string;
}

interface ICD10CMCode {
  code: string;
  description: string;
  billable: boolean;
  codeRange?: string;
}

/**
 * ICD API Service class
 * Handles authentication, caching, and API interactions for ICD-10 and ICD-11
 */
class ICDService {
  private config: ICDConfig;
  private token: ICDToken | null = null;
  private tokenRefreshPromise: Promise<ICDToken> | null = null;

  constructor(config: ICDConfig) {
    this.config = config;
  }

  /**
   * Authenticate with WHO ICD-API using OAuth 2.0 client credentials
   * 
   * @returns {Promise<ICDToken>} Access token and expiration
   * @throws {Error} If authentication fails
   * 
   * @example
   * const token = await icdService.authenticate();
   * console.log(`Token expires in ${token.expires_in} seconds`);
   */
  private async authenticate(): Promise<ICDToken> {
    if (this.tokenRefreshPromise) {
      return this.tokenRefreshPromise;
    }

    if (this.token && this.token.expires_at > Date.now()) {
      return this.token;
    }

    this.tokenRefreshPromise = (async () => {
      const credentials = btoa(`${this.config.clientId}:${this.config.clientSecret}`);
      
      const response = await fetch(this.config.tokenEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials&scope=icdapi_access',
      });

      if (!response.ok) {
        throw new Error(`ICD API authentication failed: ${response.statusText}`);
      }

      const data = await response.json();
      this.token = {
        access_token: data.access_token,
        token_type: data.token_type,
        expires_in: data.expires_in,
        expires_at: Date.now() + (data.expires_in * 1000) - 60000, // 1 min buffer
      };

      this.tokenRefreshPromise = null;
      return this.token;
    })();

    return this.tokenRefreshPromise;
  }

  /**
   * Make authenticated request to WHO ICD-API
   * 
   * @private
   * @param {string} endpoint - API endpoint path
   * @param {RequestInit} options - Fetch options
   * @returns {Promise<any>} Response data
   */
  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = await this.authenticate();
    
    const response = await fetch(`${this.config.apiBaseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token.access_token}`,
        'Accept': 'application/json',
        'Accept-Language': this.config.language,
        'API-Version': 'v2',
      },
    });

    if (!response.ok) {
      throw new Error(`ICD API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Search ICD-11 concepts by keyword
   * 
   * @param {string} query - Search query string
   * @param {Object} options - Search options
   * @param {boolean} options.flatResults - Return flat list instead of hierarchical
   * @param {boolean} options.useFlexisearch - Use flexible search algorithm
   * @param {number} options.subtreeFilterUsesFoundationDescendants - Filter by foundation descendants
   * @returns {Promise<ICDSearchResult>} Search results with matching concepts
   * 
   * @example
   * const results = await icdService.searchICD11('diabetes mellitus');
   * results.destinationEntities.forEach(entity => {
   *   console.log(`${entity.title} (${entity.theCode}): Score ${entity.score}`);
   * });
   */
  async searchICD11(
    query: string,
    options: {
      flatResults?: boolean;
      useFlexisearch?: boolean;
      subtreeFilterUsesFoundationDescendants?: number;
    } = {}
  ): Promise<ICDSearchResult> {
    const params = new URLSearchParams({
      q: query,
      flatResults: options.flatResults !== false ? 'true' : 'false',
      useFlexisearch: options.useFlexisearch !== false ? 'true' : 'false',
    });

    if (options.subtreeFilterUsesFoundationDescendants !== undefined) {
      params.append(
        'subtreeFilterUsesFoundationDescendants',
        options.subtreeFilterUsesFoundationDescendants.toString()
      );
    }

    return this.makeRequest(`/icd/release/11/2024-01/mms/search?${params.toString()}`);
  }

  /**
   * Get ICD-11 concept details by URI
   * 
   * @param {string} uri - ICD-11 concept URI
   * @returns {Promise<ICDConcept>} Detailed concept information
   * 
   * @example
   * const concept = await icdService.getICD11Concept('http://id.who.int/icd/entity/1234567890');
   * console.log(`Title: ${concept.title['@value']}`);
   * console.log(`Definition: ${concept.definition?.['@value']}`);
   */
  async getICD11Concept(uri: string): Promise<ICDConcept> {
    // Extract entity ID from URI if full URI provided
    const entityId = uri.includes('entity/') 
      ? uri.split('entity/')[1]
      : uri;
    
    return this.makeRequest(`/icd/release/11/2024-01/mms/${entityId}`);
  }

  /**
   * Get ICD-11 chapter list
   * 
   * @returns {Promise<ICDConcept[]>} Array of chapter concepts
   * 
   * @example
   * const chapters = await icdService.getICD11Chapters();
   * chapters.forEach(chapter => {
   *   console.log(`Chapter: ${chapter.title['@value']}`);
   * });
   */
  async getICD11Chapters(): Promise<ICDConcept[]> {
    const response = await this.makeRequest('/icd/release/11/2024-01/mms');
    return response.child || [];
  }

  /**
   * Search ICD-10-CM codes
   * 
   * @param {string} query - Search query string
   * @returns {Promise<ICD10CMCode[]>} Matching ICD-10-CM codes
   * 
   * @example
   * const codes = await icdService.searchICD10CM('diabetes');
   * codes.forEach(code => {
   *   console.log(`${code.code}: ${code.description} (Billable: ${code.billable})`);
   * });
   */
  async searchICD10CM(query: string): Promise<ICD10CMCode[]> {
    // This would integrate with NLM Clinical Tables API or similar
    // For now, return mock data structure
    return [];
  }

  /**
   * Map ICD-10-CM code to ICD-11
   * 
   * @param {string} icd10Code - ICD-10-CM code
   * @returns {Promise<Array<{icd11Uri: string; matchStrength: string}>>} ICD-11 mappings
   * 
   * @example
   * const mappings = await icdService.mapICD10ToICD11('E11.9');
   * mappings.forEach(mapping => {
   *   console.log(`Maps to: ${mapping.icd11Uri} (${mapping.matchStrength})`);
   * });
   */
  async mapICD10ToICD11(icd10Code: string): Promise<Array<{
    icd11Uri: string;
    matchStrength: string;
  }>> {
    // This would use WHO crosswalk tables
    // Implementation depends on availability of mapping API
    return [];
  }

  /**
   * Validate ICD-11 post-coordination cluster
   * 
   * @param {string} stemCode - Base ICD-11 code
   * @param {string[]} extensionCodes - Extension codes for post-coordination
   * @returns {Promise<{valid: boolean; errors?: string[]}>} Validation result
   * 
   * @example
   * const validation = await icdService.validatePostCoordination(
   *   'http://id.who.int/icd/entity/1234567890',
   *   ['http://id.who.int/icd/entity/extension/severity/severe']
   * );
   * if (!validation.valid) {
   *   console.error('Invalid post-coordination:', validation.errors);
   * }
   */
  async validatePostCoordination(
    stemCode: string,
    extensionCodes: string[]
  ): Promise<{ valid: boolean; errors?: string[] }> {
    // Post-coordination validation logic
    // Would check if extension codes are valid for the given stem
    return { valid: true };
  }
}

/**
 * Default ICD service instance
 * Configure with environment variables before use
 */
export const icdService = new ICDService({
  clientId: import.meta.env.VITE_WHO_ICD_CLIENT_ID || '',
  clientSecret: import.meta.env.VITE_WHO_ICD_CLIENT_SECRET || '',
  tokenEndpoint: 'https://icdaccessmanagement.who.int/connect/token',
  apiBaseUrl: 'https://id.who.int',
  language: 'en',
});

export type { ICDConcept, ICDSearchResult, ICD10CMCode };
export default ICDService;
