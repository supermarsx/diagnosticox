/**
 * Adaptive Feature Management Service
 * 
 * Manages usage mode-specific features including:
 * - Cost tracking and budget management
 * - Patient data access controls
 * - Server resource monitoring
 * - Feature usage analytics
 * - Dynamic resource allocation
 * 
 * @module adaptiveFeatureService
 */

/**
 * Usage mode types
 */
export type UsageMode = 'clinical' | 'study' | 'student' | 'hospital' | 'self_exploration';

/**
 * Cost tracking interface
 */
export interface CostTracker {
  mode: UsageMode;
  period: 'daily' | 'weekly' | 'monthly';
  budget: number;
  spent: number;
  breakdown: CostBreakdown[];
  alerts: CostAlert[];
}

/**
 * Cost breakdown by service
 */
export interface CostBreakdown {
  service: string;
  cost: number;
  usage: number;
  unit: string;
}

/**
 * Cost alert configuration
 */
export interface CostAlert {
  threshold: number;
  triggered: boolean;
  message: string;
  timestamp?: string;
}

/**
 * Resource monitoring interface
 */
export interface ResourceMonitor {
  cpu: number;
  memory: number;
  storage: number;
  network: number;
  timestamp: number;
}

/**
 * Feature usage analytics
 */
export interface FeatureUsage {
  feature: string;
  usageCount: number;
  lastUsed: number;
  averageResponseTime: number;
  userSatisfaction: number;
}

/**
 * Adaptive feature management service
 */
class AdaptiveFeatureService {
  private currentMode: UsageMode = 'clinical';
  private costTrackers = new Map<UsageMode, CostTracker>();
  private resourceMonitor: ResourceMonitor | null = null;
  private featureUsage = new Map<string, FeatureUsage>();
  
  // Usage mode configurations
  private modeConfigs = {
    clinical: {
      maxConcurrentUsers: 100,
      apiRateLimit: 1000,
      dataRetentionDays: 7,
      features: ['full_access', 'offline_mode', 'caching']
    },
    study: {
      maxConcurrentUsers: 50,
      apiRateLimit: 500,
      dataRetentionDays: 30,
      features: ['research_tools', 'analytics', 'export']
    },
    student: {
      maxConcurrentUsers: 200,
      apiRateLimit: 200,
      dataRetentionDays: 1,
      features: ['basic_tools', 'tutorials', 'guided_mode']
    },
    hospital: {
      maxConcurrentUsers: 1000,
      apiRateLimit: 5000,
      dataRetentionDays: 90,
      features: ['full_access', 'integration', 'compliance']
    },
    self_exploration: {
      maxConcurrentUsers: 500,
      apiRateLimit: 100,
      dataRetentionDays: 7,
      features: ['personal_health', 'education', 'limited_tools']
    }
  };

  /**
   * Set usage mode
   */
  setMode(mode: UsageMode): void {
    this.currentMode = mode;
    console.log(`[AdaptiveFeatureService] Mode set to: ${mode}`);
  }

  /**
   * Get current usage mode
   */
  getMode(): UsageMode {
    return this.currentMode;
  }

  /**
   * Get mode configuration
   */
  getModeConfig(): any {
    return this.modeConfigs[this.currentMode];
  }

  /**
   * Track cost for current mode
   */
  trackCost(service: string, amount: number, unit: string = 'requests'): void {
    if (!this.costTrackers.has(this.currentMode)) {
      this.costTrackers.set(this.currentMode, {
        mode: this.currentMode,
        period: 'monthly',
        budget: this.getModeConfig().maxBudget || 1000,
        spent: 0,
        breakdown: [],
        alerts: []
      });
    }

    const tracker = this.costTrackers.get(this.currentMode)!;
    tracker.spent += amount;
    
    // Update breakdown
    const existingBreakdown = tracker.breakdown.find(b => b.service === service);
    if (existingBreakdown) {
      existingBreakdown.cost += amount;
      existingBreakdown.usage += 1;
    } else {
      tracker.breakdown.push({
        service,
        cost: amount,
        usage: 1,
        unit
      });
    }

    // Check alerts
    this.checkCostAlerts(tracker);
  }

  /**
   * Check cost alerts
   */
  private checkCostAlerts(tracker: CostTracker): void {
    const alertThresholds = [0.5, 0.8, 0.9, 1.0]; // 50%, 80%, 90%, 100%
    
    alertThresholds.forEach(threshold => {
      const shouldAlert = tracker.spent >= tracker.budget * threshold;
      const existingAlert = tracker.alerts.find(a => a.threshold === threshold);
      
      if (shouldAlert && !existingAlert) {
        tracker.alerts.push({
          threshold,
          triggered: true,
          message: `Cost alert: ${(threshold * 100).toFixed(0)}% of budget used`,
          timestamp: new Date().toISOString()
        });
        
        console.warn(`[AdaptiveFeatureService] ${tracker.mode}: ${(threshold * 100).toFixed(0)}% budget used`);
      }
    });
  }

  /**
   * Get cost tracker for current mode
   */
  getCostTracker(): CostTracker | null {
    return this.costTrackers.get(this.currentMode) || null;
  }

  /**
   * Monitor resource usage
   */
  monitorResources(): ResourceMonitor {
    this.resourceMonitor = {
      cpu: this.getCPULoad(),
      memory: this.getMemoryUsage(),
      storage: this.getStorageUsage(),
      network: this.getNetworkUsage(),
      timestamp: Date.now()
    };
    
    return this.resourceMonitor;
  }

  /**
   * Track feature usage
   */
  trackFeatureUsage(feature: string, responseTime: number): void {
    const existing = this.featureUsage.get(feature);
    
    if (existing) {
      existing.usageCount += 1;
      existing.lastUsed = Date.now();
      existing.averageResponseTime = 
        (existing.averageResponseTime * (existing.usageCount - 1) + responseTime) / existing.usageCount;
    } else {
      this.featureUsage.set(feature, {
        feature,
        usageCount: 1,
        lastUsed: Date.now(),
        averageResponseTime: responseTime,
        userSatisfaction: 0 // To be implemented with user feedback
      });
    }
  }

  /**
   * Get feature usage analytics
   */
  getFeatureUsage(): FeatureUsage[] {
    return Array.from(this.featureUsage.values())
      .sort((a, b) => b.usageCount - a.usageCount);
  }

  /**
   * Check if feature is available in current mode
   */
  isFeatureAvailable(feature: string): boolean {
    const config = this.getModeConfig();
    return config.features.includes(feature);
  }

  /**
   * Get recommended features based on usage
   */
  getRecommendedFeatures(): string[] {
    const usage = this.getFeatureUsage();
    return usage
      .filter(f => f.userSatisfaction > 0.7) // High satisfaction
      .map(f => f.feature)
      .slice(0, 3); // Top 3 recommendations
  }

  /**
   * Private helper methods for resource monitoring
   */
  private getCPULoad(): number {
    // Simulate CPU load - in real implementation, would use system APIs
    return Math.random() * 100;
  }

  private getMemoryUsage(): number {
    // Simulate memory usage - in real implementation, would use performance API
    return Math.random() * 80;
  }

  private getStorageUsage(): number {
    // Calculate IndexedDB storage usage
    return navigator.storage && navigator.storage.estimate
      ? 0 // Placeholder - would call actual API
      : Math.random() * 50;
  }

  private getNetworkUsage(): number {
    // Track network usage through API calls
    return Math.random() * 30;
  }

  /**
   * Generate usage report
   */
  generateUsageReport(): any {
    const costTracker = this.getCostTracker();
    const resourceMonitor = this.resourceMonitor || this.monitorResources();
    const featureUsage = this.getFeatureUsage();
    
    return {
      mode: this.currentMode,
      config: this.getModeConfig(),
      cost: costTracker,
      resources: resourceMonitor,
      features: featureUsage,
      recommendations: this.getRecommendedFeatures(),
      timestamp: new Date().toISOString()
    };
  }
}

// Export singleton instance
export default new AdaptiveFeatureService();
