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
 * Patient data access control
 */
export interface DataAccessControl {
  mode: UsageMode;
  permissions: DataPermission[];
  encryption: EncryptionConfig;
  auditLog: AuditEntry[];
  retentionPolicy: RetentionPolicy;
}

/**
 * Data permission levels
 */
export interface DataPermission {
  resource: string;
  read: boolean;
  write: boolean;
  delete: boolean;
  share: boolean;
  export: boolean;
}

/**
 * Encryption configuration
 */
export interface EncryptionConfig {
  enabled: boolean;
  algorithm: 'AES-256-GCM' | 'RSA-2048';
  keyRotationDays: number;
  lastRotation: string;
}

/**
 * Audit log entry
 */
export interface AuditEntry {
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  result: 'success' | 'failure';
  ipAddress?: string;
}

/**
 * Data retention policy
 */
export interface RetentionPolicy {
  duration: number;
  unit: 'days' | 'months' | 'years';
  autoDelete: boolean;
  archiveEnabled: boolean;
}

/**
 * Server monitoring metrics
 */
export interface ServerMetrics {
  mode: UsageMode;
  timestamp: string;
  cpu: MetricValue;
  memory: MetricValue;
  storage: MetricValue;
  network: NetworkMetrics;
  requests: RequestMetrics;
  health: HealthStatus;
}

/**
 * Metric value with threshold
 */
export interface MetricValue {
  current: number;
  max: number;
  percentage: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
}

/**
 * Network metrics
 */
export interface NetworkMetrics {
  inbound: number;
  outbound: number;
  latency: number;
  errors: number;
}

/**
 * Request metrics
 */
export interface RequestMetrics {
  total: number;
  success: number;
  failed: number;
  avgResponseTime: number;
}

/**
 * Server health status
 */
export interface HealthStatus {
  overall: 'healthy' | 'degraded' | 'critical';
  services: ServiceHealth[];
  uptime: number;
  lastCheck: string;
}

/**
 * Individual service health
 */
export interface ServiceHealth {
  name: string;
  status: 'up' | 'down' | 'degraded';
  latency: number;
  errorRate: number;
}

/**
 * Adaptive Feature Management Service
 */
class AdaptiveFeatureService {
  private costTrackers: Map<UsageMode, CostTracker> = new Map();
  private dataControls: Map<UsageMode, DataAccessControl> = new Map();
  private serverMetrics: Map<UsageMode, ServerMetrics> = new Map();

  /**
   * Initialize cost tracking for a usage mode
   */
  initializeCostTracking(mode: UsageMode, budget: number, period: 'daily' | 'weekly' | 'monthly'): CostTracker {
    const tracker: CostTracker = {
      mode,
      period,
      budget,
      spent: 0,
      breakdown: [],
      alerts: [
        { threshold: 0.5, triggered: false, message: '50% of budget consumed' },
        { threshold: 0.75, triggered: false, message: '75% of budget consumed' },
        { threshold: 0.9, triggered: false, message: '90% of budget consumed - critical' }
      ]
    };

    this.costTrackers.set(mode, tracker);
    return tracker;
  }

  /**
   * Track service cost
   */
  trackCost(mode: UsageMode, service: string, cost: number, usage: number, unit: string): void {
    const tracker = this.costTrackers.get(mode);
    if (!tracker) {
      throw new Error(`Cost tracker not initialized for mode: ${mode}`);
    }

    // Update spent amount
    tracker.spent += cost;

    // Update breakdown
    const existingBreakdown = tracker.breakdown.find(b => b.service === service);
    if (existingBreakdown) {
      existingBreakdown.cost += cost;
      existingBreakdown.usage += usage;
    } else {
      tracker.breakdown.push({ service, cost, usage, unit });
    }

    // Check alerts
    const percentage = tracker.spent / tracker.budget;
    tracker.alerts.forEach(alert => {
      if (!alert.triggered && percentage >= alert.threshold) {
        alert.triggered = true;
        alert.timestamp = new Date().toISOString();
        console.warn(`[Cost Alert] ${alert.message} for ${mode} mode`);
      }
    });
  }

  /**
   * Get cost tracking data
   */
  getCostTracking(mode: UsageMode): CostTracker | null {
    return this.costTrackers.get(mode) || null;
  }

  /**
   * Reset cost tracking for new period
   */
  resetCostTracking(mode: UsageMode): void {
    const tracker = this.costTrackers.get(mode);
    if (tracker) {
      tracker.spent = 0;
      tracker.breakdown = [];
      tracker.alerts.forEach(alert => {
        alert.triggered = false;
        delete alert.timestamp;
      });
    }
  }

  /**
   * Get cost recommendations
   */
  getCostRecommendations(mode: UsageMode): string[] {
    const tracker = this.costTrackers.get(mode);
    if (!tracker) return [];

    const recommendations: string[] = [];
    const percentage = tracker.spent / tracker.budget;

    if (percentage > 0.9) {
      recommendations.push('Critical: Budget nearly exhausted. Consider upgrading or reducing usage.');
    } else if (percentage > 0.75) {
      recommendations.push('Warning: 75% of budget consumed. Monitor usage closely.');
    }

    // Analyze breakdown for optimization
    const sortedBreakdown = [...tracker.breakdown].sort((a, b) => b.cost - a.cost);
    if (sortedBreakdown.length > 0) {
      const topCost = sortedBreakdown[0];
      recommendations.push(`Top cost driver: ${topCost.service} ($${topCost.cost.toFixed(2)}). Consider optimization.`);
    }

    return recommendations;
  }

  /**
   * Initialize data access controls
   */
  initializeDataControls(mode: UsageMode): DataAccessControl {
    const permissions = this.getDefaultPermissions(mode);
    const controls: DataAccessControl = {
      mode,
      permissions,
      encryption: {
        enabled: mode === 'clinical' || mode === 'hospital',
        algorithm: 'AES-256-GCM',
        keyRotationDays: 90,
        lastRotation: new Date().toISOString()
      },
      auditLog: [],
      retentionPolicy: this.getRetentionPolicy(mode)
    };

    this.dataControls.set(mode, controls);
    return controls;
  }

  /**
   * Get default permissions for usage mode
   */
  private getDefaultPermissions(mode: UsageMode): DataPermission[] {
    const basePermissions: DataPermission[] = [
      { resource: 'patient_records', read: false, write: false, delete: false, share: false, export: false },
      { resource: 'diagnostic_results', read: false, write: false, delete: false, share: false, export: false },
      { resource: 'medical_history', read: false, write: false, delete: false, share: false, export: false },
      { resource: 'prescriptions', read: false, write: false, delete: false, share: false, export: false },
      { resource: 'research_data', read: false, write: false, delete: false, share: false, export: false }
    ];

    // Apply mode-specific permissions
    switch (mode) {
      case 'clinical':
        return basePermissions.map(p => ({ ...p, read: true, write: true, delete: true, share: true, export: true }));
      
      case 'hospital':
        return basePermissions.map(p => ({ 
          ...p, 
          read: true, 
          write: p.resource !== 'patient_records', 
          delete: false, 
          share: true, 
          export: true 
        }));
      
      case 'study':
        return basePermissions.map(p => ({ 
          ...p, 
          read: p.resource === 'research_data' || p.resource === 'diagnostic_results', 
          write: p.resource === 'research_data',
          export: p.resource === 'research_data'
        }));
      
      case 'student':
        return basePermissions.map(p => ({ 
          ...p, 
          read: p.resource === 'research_data' || p.resource === 'diagnostic_results'
        }));
      
      case 'self_exploration':
        return basePermissions.map(p => ({ ...p, read: true }));
      
      default:
        return basePermissions;
    }
  }

  /**
   * Get retention policy for mode
   */
  private getRetentionPolicy(mode: UsageMode): RetentionPolicy {
    const policies: Record<UsageMode, RetentionPolicy> = {
      clinical: { duration: 7, unit: 'years', autoDelete: false, archiveEnabled: true },
      hospital: { duration: 10, unit: 'years', autoDelete: false, archiveEnabled: true },
      study: { duration: 5, unit: 'years', autoDelete: true, archiveEnabled: true },
      student: { duration: 90, unit: 'days', autoDelete: true, archiveEnabled: false },
      self_exploration: { duration: 30, unit: 'days', autoDelete: true, archiveEnabled: false }
    };

    return policies[mode];
  }

  /**
   * Log data access
   */
  logDataAccess(mode: UsageMode, user: string, action: string, resource: string, result: 'success' | 'failure'): void {
    const controls = this.dataControls.get(mode);
    if (!controls) return;

    const entry: AuditEntry = {
      timestamp: new Date().toISOString(),
      user,
      action,
      resource,
      result
    };

    controls.auditLog.push(entry);

    // Keep only last 1000 entries
    if (controls.auditLog.length > 1000) {
      controls.auditLog.shift();
    }
  }

  /**
   * Check data access permission
   */
  checkPermission(mode: UsageMode, resource: string, action: 'read' | 'write' | 'delete' | 'share' | 'export'): boolean {
    const controls = this.dataControls.get(mode);
    if (!controls) return false;

    const permission = controls.permissions.find(p => p.resource === resource);
    if (!permission) return false;

    return permission[action];
  }

  /**
   * Get data access controls
   */
  getDataControls(mode: UsageMode): DataAccessControl | null {
    return this.dataControls.get(mode) || null;
  }

  /**
   * Update server metrics
   */
  updateServerMetrics(mode: UsageMode): ServerMetrics {
    // Simulate metrics (in production, these would come from actual monitoring)
    const metrics: ServerMetrics = {
      mode,
      timestamp: new Date().toISOString(),
      cpu: this.generateMetric(45, 100, '%'),
      memory: this.generateMetric(3.2, 8, 'GB'),
      storage: this.generateMetric(120, 500, 'GB'),
      network: {
        inbound: Math.random() * 1000,
        outbound: Math.random() * 800,
        latency: Math.random() * 50,
        errors: Math.floor(Math.random() * 5)
      },
      requests: {
        total: Math.floor(Math.random() * 10000),
        success: Math.floor(Math.random() * 9500),
        failed: Math.floor(Math.random() * 500),
        avgResponseTime: Math.random() * 200
      },
      health: this.generateHealthStatus(mode)
    };

    this.serverMetrics.set(mode, metrics);
    return metrics;
  }

  /**
   * Generate metric with status
   */
  private generateMetric(current: number, max: number, unit: string): MetricValue {
    const percentage = (current / max) * 100;
    let status: 'normal' | 'warning' | 'critical' = 'normal';
    
    if (percentage > 90) status = 'critical';
    else if (percentage > 75) status = 'warning';

    return { current, max, percentage, unit, status };
  }

  /**
   * Generate health status
   */
  private generateHealthStatus(mode: UsageMode): HealthStatus {
    const services: ServiceHealth[] = [
      { name: 'API Gateway', status: 'up', latency: Math.random() * 50, errorRate: 0.1 },
      { name: 'Database', status: 'up', latency: Math.random() * 20, errorRate: 0.05 },
      { name: 'Cache', status: 'up', latency: Math.random() * 5, errorRate: 0 },
      { name: 'AI Services', status: 'up', latency: Math.random() * 200, errorRate: 0.2 }
    ];

    const anyDown = services.some(s => s.status === 'down');
    const anyDegraded = services.some(s => s.status === 'degraded');

    return {
      overall: anyDown ? 'critical' : anyDegraded ? 'degraded' : 'healthy',
      services,
      uptime: 99.9,
      lastCheck: new Date().toISOString()
    };
  }

  /**
   * Get server metrics
   */
  getServerMetrics(mode: UsageMode): ServerMetrics | null {
    return this.serverMetrics.get(mode) || null;
  }

  /**
   * Get resource allocation recommendations
   */
  getResourceRecommendations(mode: UsageMode): string[] {
    const metrics = this.serverMetrics.get(mode);
    if (!metrics) return [];

    const recommendations: string[] = [];

    if (metrics.cpu.status === 'critical') {
      recommendations.push('Critical: CPU usage at ' + metrics.cpu.percentage.toFixed(1) + '%. Consider horizontal scaling.');
    } else if (metrics.cpu.status === 'warning') {
      recommendations.push('Warning: CPU usage elevated. Monitor for continued growth.');
    }

    if (metrics.memory.status === 'critical') {
      recommendations.push('Critical: Memory usage at ' + metrics.memory.percentage.toFixed(1) + '%. Increase memory allocation.');
    }

    if (metrics.storage.status === 'warning') {
      recommendations.push('Storage approaching capacity. Plan for expansion or data archival.');
    }

    if (metrics.requests.failed / metrics.requests.total > 0.05) {
      recommendations.push('Error rate above 5%. Investigate application logs for issues.');
    }

    return recommendations;
  }

  /**
   * Get comprehensive dashboard data
   */
  getDashboardData(mode: UsageMode): {
    costs: CostTracker | null;
    dataControls: DataAccessControl | null;
    serverMetrics: ServerMetrics | null;
    recommendations: {
      cost: string[];
      resources: string[];
    };
  } {
    return {
      costs: this.getCostTracking(mode),
      dataControls: this.getDataControls(mode),
      serverMetrics: this.getServerMetrics(mode),
      recommendations: {
        cost: this.getCostRecommendations(mode),
        resources: this.getResourceRecommendations(mode)
      }
    };
  }
}

// Export singleton instance
export const adaptiveFeatureService = new AdaptiveFeatureService();
