/**
 * DiagnosticoX Multi-Layer Caching System
 * 
 * Three-tier caching architecture for optimal performance:
 * - Memory Cache: Fast in-memory cache (limited size)
 * - IndexedDB Cache: Persistent browser storage (large capacity)
 * - Service Worker Cache: Offline-first capability
 * 
 * TTL Configuration:
 * - ICD codes: 30 days
 * - Symptoms: 7 days
 * - PubMed data: 24 hours
 * - Drug interactions: 48 hours
 * - Clinical trials: 12 hours
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Cache entry interface
interface CacheEntry<T> {
  key: string;
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  category: CacheCategory;
}

// Cache categories with specific TTLs
export enum CacheCategory {
  ICD = 'icd',
  SYMPTOMS = 'symptoms',
  PUBMED = 'pubmed',
  DRUGS = 'drugs',
  CLINICAL_TRIALS = 'clinical_trials',
  DSM5 = 'dsm5',
  FHIR = 'fhir',
  VINDICATE = 'vindicate',
  GENERAL = 'general'
}

// TTL configuration (in milliseconds)
const TTL_CONFIG: Record<CacheCategory, number> = {
  [CacheCategory.ICD]: 30 * 24 * 60 * 60 * 1000, // 30 days
  [CacheCategory.SYMPTOMS]: 7 * 24 * 60 * 60 * 1000, // 7 days
  [CacheCategory.PUBMED]: 24 * 60 * 60 * 1000, // 24 hours
  [CacheCategory.DRUGS]: 48 * 60 * 60 * 1000, // 48 hours
  [CacheCategory.CLINICAL_TRIALS]: 12 * 60 * 60 * 1000, // 12 hours
  [CacheCategory.DSM5]: 7 * 24 * 60 * 60 * 1000, // 7 days
  [CacheCategory.FHIR]: 24 * 60 * 60 * 1000, // 24 hours
  [CacheCategory.VINDICATE]: 7 * 24 * 60 * 60 * 1000, // 7 days
  [CacheCategory.GENERAL]: 6 * 60 * 60 * 1000 // 6 hours
};

// IndexedDB schema
interface CacheDB extends DBSchema {
  cache: {
    key: string;
    value: CacheEntry<any>;
    indexes: { 'by-category': string; 'by-timestamp': number };
  };
}

// Cache metrics
interface CacheMetrics {
  memoryHits: number;
  memoryMisses: number;
  persistentHits: number;
  persistentMisses: number;
  totalRequests: number;
  memorySize: number;
  persistentSize: number;
  evictions: number;
}

/**
 * Multi-layer cache service with memory and persistent storage
 */
class CacheService {
  private memoryCache: Map<string, CacheEntry<any>> = new Map();
  private maxMemorySize = 100; // Maximum entries in memory cache
  private db: IDBPDatabase<CacheDB> | null = null;
  private metrics: CacheMetrics = {
    memoryHits: 0,
    memoryMisses: 0,
    persistentHits: 0,
    persistentMisses: 0,
    totalRequests: 0,
    memorySize: 0,
    persistentSize: 0,
    evictions: 0
  };

  /**
   * Initialize IndexedDB
   */
  async init(): Promise<void> {
    try {
      this.db = await openDB<CacheDB>('diagnosticox-cache', 1, {
        upgrade(db) {
          const store = db.createObjectStore('cache', { keyPath: 'key' });
          store.createIndex('by-category', 'category');
          store.createIndex('by-timestamp', 'timestamp');
        }
      });
      
      // Clean expired entries on init
      await this.cleanExpiredEntries();
      
      console.log('[CacheService] Initialized successfully');
    } catch (error) {
      console.error('[CacheService] Initialization failed:', error);
    }
  }

  /**
   * Get data from cache (checks memory first, then persistent)
   */
  async get<T>(key: string, category: CacheCategory): Promise<T | null> {
    this.metrics.totalRequests++;
    
    // Check memory cache first
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry && !this.isExpired(memoryEntry)) {
      this.metrics.memoryHits++;
      return memoryEntry.data as T;
    }
    
    this.metrics.memoryMisses++;
    
    // Check persistent cache
    if (this.db) {
      try {
        const persistentEntry = await this.db.get('cache', key);
        if (persistentEntry && !this.isExpired(persistentEntry)) {
          this.metrics.persistentHits++;
          
          // Promote to memory cache
          this.setMemoryCache(key, persistentEntry);
          
          return persistentEntry.data as T;
        }
        
        // Clean up expired entry
        if (persistentEntry && this.isExpired(persistentEntry)) {
          await this.db.delete('cache', key);
        }
      } catch (error) {
        console.error('[CacheService] Persistent cache read error:', error);
      }
    }
    
    this.metrics.persistentMisses++;
    return null;
  }

  /**
   * Set data in cache (both memory and persistent)
   */
  async set<T>(key: string, data: T, category: CacheCategory): Promise<void> {
    const entry: CacheEntry<T> = {
      key,
      data,
      timestamp: Date.now(),
      ttl: TTL_CONFIG[category],
      category
    };
    
    // Set in memory cache
    this.setMemoryCache(key, entry);
    
    // Set in persistent cache
    if (this.db) {
      try {
        await this.db.put('cache', entry);
        this.metrics.persistentSize++;
      } catch (error) {
        console.error('[CacheService] Persistent cache write error:', error);
      }
    }
  }

  /**
   * Set data in memory cache with LRU eviction
   */
  private setMemoryCache(key: string, entry: CacheEntry<any>): void {
    // Evict oldest entry if at capacity
    if (this.memoryCache.size >= this.maxMemorySize) {
      const oldestKey = this.memoryCache.keys().next().value;
      this.memoryCache.delete(oldestKey);
      this.metrics.evictions++;
    }
    
    this.memoryCache.set(key, entry);
    this.metrics.memorySize = this.memoryCache.size;
  }

  /**
   * Check if cache entry is expired
   */
  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  /**
   * Remove specific key from cache
   */
  async remove(key: string): Promise<void> {
    this.memoryCache.delete(key);
    
    if (this.db) {
      try {
        await this.db.delete('cache', key);
      } catch (error) {
        console.error('[CacheService] Cache removal error:', error);
      }
    }
  }

  /**
   * Clear all cache entries for a category
   */
  async clearCategory(category: CacheCategory): Promise<void> {
    // Clear from memory
    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.category === category) {
        this.memoryCache.delete(key);
      }
    }
    
    // Clear from persistent storage
    if (this.db) {
      try {
        const tx = this.db.transaction('cache', 'readwrite');
        const index = tx.store.index('by-category');
        
        for await (const cursor of index.iterate(category)) {
          cursor.delete();
        }
        
        await tx.done;
      } catch (error) {
        console.error('[CacheService] Category clear error:', error);
      }
    }
    
    this.metrics.memorySize = this.memoryCache.size;
  }

  /**
   * Clear all cache entries
   */
  async clearAll(): Promise<void> {
    this.memoryCache.clear();
    
    if (this.db) {
      try {
        await this.db.clear('cache');
      } catch (error) {
        console.error('[CacheService] Clear all error:', error);
      }
    }
    
    this.metrics = {
      memoryHits: 0,
      memoryMisses: 0,
      persistentHits: 0,
      persistentMisses: 0,
      totalRequests: 0,
      memorySize: 0,
      persistentSize: 0,
      evictions: 0
    };
  }

  /**
   * Clean expired entries from persistent storage
   */
  async cleanExpiredEntries(): Promise<number> {
    if (!this.db) return 0;
    
    let cleanedCount = 0;
    
    try {
      const tx = this.db.transaction('cache', 'readwrite');
      const store = tx.store;
      
      for await (const cursor of store) {
        if (this.isExpired(cursor.value)) {
          await cursor.delete();
          cleanedCount++;
        }
      }
      
      await tx.done;
      
      console.log(`[CacheService] Cleaned ${cleanedCount} expired entries`);
    } catch (error) {
      console.error('[CacheService] Clean expired error:', error);
    }
    
    return cleanedCount;
  }

  /**
   * Get cache metrics
   */
  getMetrics(): CacheMetrics & { hitRate: number; memoryHitRate: number } {
    const hitRate = this.metrics.totalRequests > 0
      ? ((this.metrics.memoryHits + this.metrics.persistentHits) / this.metrics.totalRequests) * 100
      : 0;
    
    const memoryHitRate = (this.metrics.memoryHits + this.metrics.memoryMisses) > 0
      ? (this.metrics.memoryHits / (this.metrics.memoryHits + this.metrics.memoryMisses)) * 100
      : 0;
    
    return {
      ...this.metrics,
      hitRate: Math.round(hitRate * 100) / 100,
      memoryHitRate: Math.round(memoryHitRate * 100) / 100
    };
  }

  /**
   * Warm cache with common queries
   */
  async warmCache(entries: Array<{ key: string; data: any; category: CacheCategory }>): Promise<void> {
    console.log(`[CacheService] Warming cache with ${entries.length} entries`);
    
    for (const entry of entries) {
      await this.set(entry.key, entry.data, entry.category);
    }
  }

  /**
   * Get storage size estimate
   */
  async getStorageEstimate(): Promise<{ usage: number; quota: number; percentage: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      const usage = estimate.usage || 0;
      const quota = estimate.quota || 0;
      const percentage = quota > 0 ? (usage / quota) * 100 : 0;
      
      return {
        usage,
        quota,
        percentage: Math.round(percentage * 100) / 100
      };
    }
    
    return { usage: 0, quota: 0, percentage: 0 };
  }
}

// Singleton instance
const cacheService = new CacheService();

// Initialize on module load
cacheService.init();

export default cacheService;
