/**
 * DiagnosticoX Pre-emptive Crawling System
 * 
 * Background crawler for speculative data fetching:
 * - Analyzes user search patterns
 * - Predicts next likely searches
 * - Pre-fetches common medical queries
 * - Optimizes API usage and response times
 * 
 * Priority levels:
 * - HIGH: ICD lookups, DSM assessments, common symptoms
 * - MEDIUM: PubMed articles, drug interactions
 * - LOW: Historical searches, rare conditions
 */

import cacheService, { CacheCategory } from './cacheService';
import icdService from './icdService';
import symptomService from './symptomService';
import dsm5Service from './dsm5Service';
import pubmedService from './pubmedService';
import drugBankService from './drugBankService';
import clinicalTrialsService from './clinicalTrialsService';

// Priority levels for crawl tasks
export enum CrawlPriority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

// Crawl task interface
interface CrawlTask {
  id: string;
  query: string;
  category: CacheCategory;
  priority: CrawlPriority;
  timestamp: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  retryCount: number;
}

// User search pattern for analysis
export interface SearchPattern {
  query: string;
  timestamp: number;
  category: CacheCategory;
  resultCount: number;
}

/**
 * Pre-emptive crawler service for background data fetching
 */
class CrawlerService {
  private taskQueue: CrawlTask[] = [];
  private maxConcurrent = 2;
  private activeTasks = 0;
  private isRunning = false;
  private searchHistory: SearchPattern[] = [];
  private maxHistorySize = 100;
  
  // Common medical queries to pre-fetch
  private commonQueries = {
    symptoms: [
      'chest pain', 'headache', 'fever', 'fatigue', 'cough',
      'abdominal pain', 'nausea', 'dizziness', 'shortness of breath',
      'back pain', 'joint pain', 'muscle pain', 'sore throat',
      'diarrhea', 'constipation', 'rash', 'anxiety', 'depression'
    ],
    icd: [
      'I21', 'J18', 'K80', 'M79', 'R50', // Common ICD-10 codes
      'E11', 'I10', 'J44', 'F41', 'M54'
    ],
    conditions: [
      'hypertension', 'diabetes', 'asthma', 'depression',
      'anxiety', 'COPD', 'arthritis', 'heart disease'
    ]
  };

  /**
   * Start the crawler service
   */
  start(): void {
    if (this.isRunning) {
      console.log('[CrawlerService] Already running');
      return;
    }
    
    this.isRunning = true;
    console.log('[CrawlerService] Started');
    
    // Initial cache warming with common queries
    this.warmCacheWithCommonQueries();
    
    // Start processing queue
    this.processQueue();
  }

  /**
   * Stop the crawler service
   */
  stop(): void {
    this.isRunning = false;
    console.log('[CrawlerService] Stopped');
  }

  /**
   * Schedule a crawl task
   */
  scheduleCrawl(query: string, category: CacheCategory, priority: CrawlPriority = CrawlPriority.MEDIUM): void {
    const task: CrawlTask = {
      id: `${category}-${query}-${Date.now()}`,
      query,
      category,
      priority,
      timestamp: Date.now(),
      status: 'pending',
      retryCount: 0
    };
    
    // Add to queue based on priority
    if (priority === CrawlPriority.HIGH) {
      this.taskQueue.unshift(task);
    } else {
      this.taskQueue.push(task);
    }
    
    // Process if not at capacity
    if (this.isRunning && this.activeTasks < this.maxConcurrent) {
      this.processQueue();
    }
  }

  /**
   * Record user search for pattern analysis
   */
  recordSearch(pattern: SearchPattern): void {
    this.searchHistory.push(pattern);
    
    // Keep history size manageable
    if (this.searchHistory.length > this.maxHistorySize) {
      this.searchHistory.shift();
    }
    
    // Analyze patterns after recording
    this.analyzePatterns();
  }

  /**
   * Analyze search patterns to predict next queries
   */
  private analyzePatterns(): void {
    if (this.searchHistory.length < 5) return;
    
    // Get recent searches (last 10)
    const recentSearches = this.searchHistory.slice(-10);
    
    // Find frequently searched terms
    const queryFrequency: Record<string, number> = {};
    recentSearches.forEach(search => {
      queryFrequency[search.query] = (queryFrequency[search.query] || 0) + 1;
    });
    
    // Pre-fetch related queries for frequent searches
    Object.entries(queryFrequency).forEach(([query, count]) => {
      if (count >= 2) {
        // Schedule related searches
        this.scheduleRelatedSearches(query, recentSearches[0].category);
      }
    });
  }

  /**
   * Schedule related searches based on medical knowledge
   */
  private scheduleRelatedSearches(query: string, category: CacheCategory): void {
    const relatedQueries = this.getRelatedQueries(query);
    
    relatedQueries.forEach(relatedQuery => {
      // Check if not already in queue
      const exists = this.taskQueue.some(task => 
        task.query === relatedQuery && task.category === category
      );
      
      if (!exists) {
        this.scheduleCrawl(relatedQuery, category, CrawlPriority.LOW);
      }
    });
  }

  /**
   * Get related medical queries
   */
  private getRelatedQueries(query: string): string[] {
    const lowerQuery = query.toLowerCase();
    
    // Symptom relationships
    const symptomRelations: Record<string, string[]> = {
      'chest pain': ['myocardial infarction', 'angina', 'coronary artery disease'],
      'headache': ['migraine', 'tension headache', 'cluster headache'],
      'fever': ['infection', 'inflammation', 'sepsis'],
      'fatigue': ['anemia', 'hypothyroidism', 'chronic fatigue syndrome'],
      'cough': ['bronchitis', 'pneumonia', 'asthma'],
      'abdominal pain': ['appendicitis', 'gastritis', 'cholecystitis']
    };
    
    return symptomRelations[lowerQuery] || [];
  }

  /**
   * Process the crawl queue
   */
  private async processQueue(): Promise<void> {
    while (this.isRunning && this.activeTasks < this.maxConcurrent && this.taskQueue.length > 0) {
      const task = this.taskQueue.shift();
      if (!task) continue;
      
      this.activeTasks++;
      task.status = 'processing';
      
      // Process task asynchronously
      this.processCrawlTask(task)
        .then(() => {
          task.status = 'completed';
          console.log(`[CrawlerService] Completed: ${task.category}:${task.query}`);
        })
        .catch((error) => {
          task.status = 'failed';
          console.error(`[CrawlerService] Failed: ${task.category}:${task.query}`, error);
          
          // Retry logic
          if (task.retryCount < 3) {
            task.retryCount++;
            task.status = 'pending';
            this.taskQueue.push(task);
          }
        })
        .finally(() => {
          this.activeTasks--;
          // Continue processing
          if (this.isRunning && this.taskQueue.length > 0) {
            this.processQueue();
          }
        });
    }
  }

  /**
   * Process individual crawl task
   */
  private async processCrawlTask(task: CrawlTask): Promise<void> {
    const cacheKey = `${task.category}:${task.query}`;
    
    // Check if already cached
    const cached = await cacheService.get(cacheKey, task.category);
    if (cached) {
      console.log(`[CrawlerService] Already cached: ${cacheKey}`);
      return;
    }
    
    // Fetch data based on category
    let data: any = null;
    
    try {
      switch (task.category) {
        case CacheCategory.ICD:
          data = await icdService.searchEntities(task.query);
          break;
        
        case CacheCategory.SYMPTOMS:
          data = symptomService.searchSymptoms(task.query);
          break;
        
        case CacheCategory.DSM5:
          // DSM5 assessments don't need pre-fetching
          return;
        
        case CacheCategory.PUBMED:
          data = await pubmedService.searchArticles(task.query, 10);
          break;
        
        case CacheCategory.DRUGS:
          data = await drugBankService.searchDrugs(task.query);
          break;
        
        case CacheCategory.CLINICAL_TRIALS:
          data = await clinicalTrialsService.searchTrials({ query: task.query, pageSize: 10 });
          break;
        
        default:
          console.warn(`[CrawlerService] Unknown category: ${task.category}`);
          return;
      }
      
      // Cache the fetched data
      if (data) {
        await cacheService.set(cacheKey, data, task.category);
        console.log(`[CrawlerService] Cached: ${cacheKey}`);
      }
      
      // Small delay to avoid overwhelming APIs
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`[CrawlerService] Fetch error for ${cacheKey}:`, error);
      throw error;
    }
  }

  /**
   * Warm cache with common medical queries
   */
  private async warmCacheWithCommonQueries(): Promise<void> {
    console.log('[CrawlerService] Warming cache with common queries...');
    
    // Schedule common symptoms (HIGH priority)
    this.commonQueries.symptoms.forEach(symptom => {
      this.scheduleCrawl(symptom, CacheCategory.SYMPTOMS, CrawlPriority.HIGH);
    });
    
    // Schedule common ICD codes (HIGH priority)
    this.commonQueries.icd.forEach(code => {
      this.scheduleCrawl(code, CacheCategory.ICD, CrawlPriority.HIGH);
    });
    
    // Schedule common conditions for PubMed (MEDIUM priority)
    this.commonQueries.conditions.slice(0, 5).forEach(condition => {
      this.scheduleCrawl(condition, CacheCategory.PUBMED, CrawlPriority.MEDIUM);
    });
  }

  /**
   * Get queue status
   */
  getStatus(): {
    isRunning: boolean;
    queueSize: number;
    activeTasks: number;
    historySize: number;
  } {
    return {
      isRunning: this.isRunning,
      queueSize: this.taskQueue.length,
      activeTasks: this.activeTasks,
      historySize: this.searchHistory.length
    };
  }

  /**
   * Get task queue for monitoring
   */
  getQueue(): CrawlTask[] {
    return [...this.taskQueue];
  }

  /**
   * Clear search history
   */
  clearHistory(): void {
    this.searchHistory = [];
  }
}

// Singleton instance
const crawlerService = new CrawlerService();

// Auto-start crawler after a delay
setTimeout(() => {
  crawlerService.start();
}, 2000);

export default crawlerService;