/**
 * DiagnosticoX Cache Integration Layer
 * 
 * Automatic caching wrapper for all medical API services
 * Integrates multi-layer cache and pre-emptive crawling
 * 
 * Features:
 * - Transparent caching for all API calls
 * - Automatic cache key generation
 * - Search pattern recording for predictive fetching
 * - Performance metrics tracking
 */

import cacheService, { CacheCategory } from './cacheService';
import crawlerService, { CrawlPriority, SearchPattern } from './crawlerService';

/**
 * Cache-enabled API call wrapper
 */
export async function cachedAPICall<T>(
  key: string,
  category: CacheCategory,
  fetchFunction: () => Promise<T>,
  options?: {
    forceRefresh?: boolean;
    recordPattern?: boolean;
  }
): Promise<T> {
  const { forceRefresh = false, recordPattern = true } = options || {};
  
  // Generate cache key
  const cacheKey = `${category}:${key}`;
  
  // Check cache unless force refresh
  if (!forceRefresh) {
    const cached = await cacheService.get<T>(cacheKey, category);
    if (cached !== null) {
      console.log(`[CacheIntegration] Cache HIT: ${cacheKey}`);
      
      // Record successful cache hit as search pattern
      if (recordPattern) {
        const pattern: SearchPattern = {
          query: key,
          timestamp: Date.now(),
          category,
          resultCount: Array.isArray(cached) ? cached.length : 1
        };
        crawlerService.recordSearch(pattern);
      }
      
      return cached;
    }
    
    console.log(`[CacheIntegration] Cache MISS: ${cacheKey}`);
  }
  
  // Fetch fresh data
  try {
    const startTime = Date.now();
    const data = await fetchFunction();
    const fetchTime = Date.now() - startTime;
    
    console.log(`[CacheIntegration] Fetched in ${fetchTime}ms: ${cacheKey}`);
    
    // Cache the result
    await cacheService.set(cacheKey, data, category);
    
    // Record search pattern
    if (recordPattern) {
      const pattern: SearchPattern = {
        query: key,
        timestamp: Date.now(),
        category,
        resultCount: Array.isArray(data) ? data.length : 1
      };
      crawlerService.recordSearch(pattern);
    }
    
    return data;
  } catch (error) {
    console.error(`[CacheIntegration] Fetch error for ${cacheKey}:`, error);
    throw error;
  }
}

/**
 * Cached ICD Service Wrapper
 */
export const cachedICDService = {
  async searchEntities(query: string, forceRefresh = false) {
    const icdService = (await import('./icdService')).default;
    return cachedAPICall(
      `search:${query}`,
      CacheCategory.ICD,
      () => icdService.searchEntities(query),
      { forceRefresh }
    );
  },
  
  async getEntityDetails(foundationUri: string, forceRefresh = false) {
    const icdService = (await import('./icdService')).default;
    return cachedAPICall(
      `entity:${foundationUri}`,
      CacheCategory.ICD,
      () => icdService.getEntityDetails(foundationUri),
      { forceRefresh }
    );
  },
  
  async lookup(code: string, forceRefresh = false) {
    const icdService = (await import('./icdService')).default;
    return cachedAPICall(
      `lookup:${code}`,
      CacheCategory.ICD,
      () => icdService.lookup(code),
      { forceRefresh }
    );
  }
};

/**
 * Cached Symptom Service Wrapper
 */
export const cachedSymptomService = {
  searchSymptoms(query: string) {
    const symptomService = require('./symptomService').default;
    // Symptom search is local, no API call needed
    // But we still cache for consistency
    return cachedAPICall(
      `search:${query}`,
      CacheCategory.SYMPTOMS,
      () => Promise.resolve(symptomService.searchSymptoms(query)),
      { recordPattern: true }
    );
  },
  
  async generateDifferentialDiagnosis(symptomIds: string[], forceRefresh = false) {
    const symptomService = (await import('./symptomService')).default;
    const key = `differential:${symptomIds.sort().join(',')}`;
    return cachedAPICall(
      key,
      CacheCategory.SYMPTOMS,
      () => Promise.resolve(symptomService.generateDifferentialDiagnosis(symptomIds)),
      { forceRefresh }
    );
  },
  
  async checkRedFlags(symptomIds: string[], forceRefresh = false) {
    const symptomService = (await import('./symptomService')).default;
    const key = `redflags:${symptomIds.sort().join(',')}`;
    return cachedAPICall(
      key,
      CacheCategory.SYMPTOMS,
      () => Promise.resolve(symptomService.checkRedFlags(symptomIds)),
      { forceRefresh }
    );
  }
};

/**
 * Cached PubMed Service Wrapper
 */
export const cachedPubMedService = {
  async searchArticles(query: string, maxResults = 10, forceRefresh = false) {
    const pubmedService = (await import('./pubmedService')).default;
    return cachedAPICall(
      `search:${query}:${maxResults}`,
      CacheCategory.PUBMED,
      () => pubmedService.searchArticles(query, maxResults),
      { forceRefresh }
    );
  },
  
  async getArticleDetails(pmid: string, forceRefresh = false) {
    const pubmedService = (await import('./pubmedService')).default;
    return cachedAPICall(
      `article:${pmid}`,
      CacheCategory.PUBMED,
      () => pubmedService.getArticleDetails(pmid),
      { forceRefresh }
    );
  }
};

/**
 * Cached Drug Bank Service Wrapper
 */
export const cachedDrugBankService = {
  async searchDrugs(query: string, forceRefresh = false) {
    const drugBankService = (await import('./drugBankService')).default;
    return cachedAPICall(
      `search:${query}`,
      CacheCategory.DRUGS,
      () => drugBankService.searchDrugs(query),
      { forceRefresh }
    );
  },
  
  async checkInteractions(drugIds: string[], forceRefresh = false) {
    const drugBankService = (await import('./drugBankService')).default;
    const key = `interactions:${drugIds.sort().join(',')}`;
    return cachedAPICall(
      key,
      CacheCategory.DRUGS,
      () => drugBankService.checkInteractions(drugIds),
      { forceRefresh }
    );
  },
  
  async getDrugDetails(drugId: string, forceRefresh = false) {
    const drugBankService = (await import('./drugBankService')).default;
    return cachedAPICall(
      `drug:${drugId}`,
      CacheCategory.DRUGS,
      () => drugBankService.getDrugDetails(drugId),
      { forceRefresh }
    );
  }
};

/**
 * Cached Clinical Trials Service Wrapper
 */
export const cachedClinicalTrialsService = {
  async searchTrials(params: any, forceRefresh = false) {
    const clinicalTrialsService = (await import('./clinicalTrialsService')).default;
    const key = `search:${JSON.stringify(params)}`;
    return cachedAPICall(
      key,
      CacheCategory.CLINICAL_TRIALS,
      () => clinicalTrialsService.searchTrials(params),
      { forceRefresh }
    );
  },
  
  async getStudyDetails(nctId: string, forceRefresh = false) {
    const clinicalTrialsService = (await import('./clinicalTrialsService')).default;
    return cachedAPICall(
      `study:${nctId}`,
      CacheCategory.CLINICAL_TRIALS,
      () => clinicalTrialsService.getStudyDetails(nctId),
      { forceRefresh }
    );
  }
};

/**
 * Cached DSM-5 Service Wrapper
 */
export const cachedDSM5Service = {
  async assessPHQ9(responses: number[], forceRefresh = false) {
    const dsm5Service = (await import('./dsm5Service')).default;
    const key = `phq9:${responses.join(',')}`;
    return cachedAPICall(
      key,
      CacheCategory.DSM5,
      () => Promise.resolve(dsm5Service.assessPHQ9(responses)),
      { forceRefresh }
    );
  },
  
  async assessGAD7(responses: number[], forceRefresh = false) {
    const dsm5Service = (await import('./dsm5Service')).default;
    const key = `gad7:${responses.join(',')}`;
    return cachedAPICall(
      key,
      CacheCategory.DSM5,
      () => Promise.resolve(dsm5Service.assessGAD7(responses)),
      { forceRefresh }
    );
  }
};

/**
 * Pre-fetch common queries on application start
 */
export async function initializeCacheWarming(): Promise<void> {
  console.log('[CacheIntegration] Initializing cache warming...');
  
  // High-priority queries
  const highPriorityQueries = [
    { query: 'chest pain', category: CacheCategory.SYMPTOMS, priority: CrawlPriority.HIGH },
    { query: 'headache', category: CacheCategory.SYMPTOMS, priority: CrawlPriority.HIGH },
    { query: 'fever', category: CacheCategory.SYMPTOMS, priority: CrawlPriority.HIGH },
    { query: 'I21', category: CacheCategory.ICD, priority: CrawlPriority.HIGH },
    { query: 'E11', category: CacheCategory.ICD, priority: CrawlPriority.HIGH }
  ];
  
  highPriorityQueries.forEach(({ query, category, priority }) => {
    crawlerService.scheduleCrawl(query, category, priority);
  });
  
  console.log('[CacheIntegration] Cache warming initiated');
}

/**
 * Get comprehensive cache statistics
 */
export function getCacheStatistics() {
  const cacheMetrics = cacheService.getMetrics();
  const crawlerStatus = crawlerService.getStatus();
  
  return {
    cache: cacheMetrics,
    crawler: crawlerStatus,
    performance: {
      apiReductionRate: cacheMetrics.hitRate,
      averageResponseTime: cacheMetrics.memoryHits > 0 ? '<10ms (cached)' : 'Variable (uncached)',
      totalCachedEntries: cacheMetrics.memorySize + cacheMetrics.persistentSize
    }
  };
}

/**
 * Clear specific category cache
 */
export async function clearCategoryCache(category: CacheCategory): Promise<void> {
  await cacheService.clearCategory(category);
  console.log(`[CacheIntegration] Cleared cache for category: ${category}`);
}

/**
 * Clear all caches
 */
export async function clearAllCaches(): Promise<void> {
  await cacheService.clearAll();
  console.log('[CacheIntegration] Cleared all caches');
}

// Auto-initialize cache warming on module load
setTimeout(() => {
  initializeCacheWarming();
}, 3000);

export default {
  cachedICDService,
  cachedSymptomService,
  cachedPubMedService,
  cachedDrugBankService,
  cachedClinicalTrialsService,
  cachedDSM5Service,
  getCacheStatistics,
  clearCategoryCache,
  clearAllCaches
};