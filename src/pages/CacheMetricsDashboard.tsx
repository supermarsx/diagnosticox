/**
 * DiagnosticoX Cache Metrics Dashboard
 * 
 * Real-time monitoring of caching system performance
 * Displays cache hit rates, storage usage, and crawler status
 */

import React, { useState, useEffect } from 'react';
import { Activity, Database, TrendingUp, Zap, RefreshCw, Trash2, Download } from 'lucide-react';
import cacheService, { CacheCategory } from '../services/cacheService';
import crawlerService from '../services/crawlerService';
import { getCacheStatistics } from '../services/cacheIntegration';

interface CacheStats {
  cache: {
    memoryHits: number;
    memoryMisses: number;
    persistentHits: number;
    persistentMisses: number;
    totalRequests: number;
    memorySize: number;
    persistentSize: number;
    evictions: number;
    hitRate: number;
    memoryHitRate: number;
  };
  crawler: {
    isRunning: boolean;
    queueSize: number;
    activeTasks: number;
    historySize: number;
  };
  performance: {
    apiReductionRate: number;
    averageResponseTime: string;
    totalCachedEntries: number;
  };
}

const CacheMetricsDashboard: React.FC = () => {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [storageEstimate, setStorageEstimate] = useState<{
    usage: number;
    quota: number;
    percentage: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const cacheStats = getCacheStatistics();
      setStats(cacheStats);

      const storage = await cacheService.getStorageEstimate();
      setStorageEstimate(storage);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching cache stats:', error);
      setLoading(false);
    }
  };

  // Auto-refresh every 5 seconds
  useEffect(() => {
    fetchStats();

    if (autoRefresh) {
      const interval = setInterval(fetchStats, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Clear category cache
  const handleClearCategory = async (category: CacheCategory) => {
    if (confirm(`Clear all ${category} cache entries?`)) {
      await cacheService.clearCategory(category);
      fetchStats();
    }
  };

  // Clear all caches
  const handleClearAll = async () => {
    if (confirm('Clear ALL cache entries? This cannot be undone.')) {
      await cacheService.clearAll();
      fetchStats();
    }
  };

  // Clean expired entries
  const handleCleanExpired = async () => {
    const count = await cacheService.cleanExpiredEntries();
    alert(`Cleaned ${count} expired entries`);
    fetchStats();
  };

  // Toggle crawler
  const handleToggleCrawler = () => {
    if (stats?.crawler.isRunning) {
      crawlerService.stop();
    } else {
      crawlerService.start();
    }
    setTimeout(fetchStats, 500);
  };

  // Format bytes
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading || !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="glass-card p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading cache metrics...</p>
          </div>
        </div>
      </div>
    );
  }

  const { cache, crawler, performance } = stats;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Cache Metrics Dashboard</h1>
              <p className="text-gray-600 mt-1">Real-time performance monitoring</p>
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Auto-refresh</span>
              </label>
              <button
                onClick={fetchStats}
                className="glass-button flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <span className="text-2xl font-bold text-green-600">
                {performance.apiReductionRate.toFixed(1)}%
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Cache Hit Rate</h3>
            <p className="text-xs text-gray-500 mt-1">API calls reduced</p>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <Database className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-blue-600">
                {performance.totalCachedEntries}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Cached Entries</h3>
            <p className="text-xs text-gray-500 mt-1">Total stored items</p>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <Zap className="w-8 h-8 text-yellow-600" />
              <span className="text-2xl font-bold text-yellow-600">
                {cache.totalRequests}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Total Requests</h3>
            <p className="text-xs text-gray-500 mt-1">Since initialization</p>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-8 h-8 text-purple-600" />
              <span className="text-2xl font-bold text-purple-600">
                {crawler.queueSize}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Crawler Queue</h3>
            <p className="text-xs text-gray-500 mt-1">Pending tasks</p>
          </div>
        </div>

        {/* Cache Performance Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Memory Cache</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Hit Rate</span>
                <span className="text-lg font-semibold text-green-600">
                  {cache.memoryHitRate.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Hits</span>
                <span className="text-lg font-semibold">{cache.memoryHits}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Misses</span>
                <span className="text-lg font-semibold">{cache.memoryMisses}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Current Size</span>
                <span className="text-lg font-semibold">{cache.memorySize} entries</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Evictions</span>
                <span className="text-lg font-semibold">{cache.evictions}</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Persistent Cache</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Hits</span>
                <span className="text-lg font-semibold text-blue-600">
                  {cache.persistentHits}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Misses</span>
                <span className="text-lg font-semibold">{cache.persistentMisses}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Stored Entries</span>
                <span className="text-lg font-semibold">{cache.persistentSize}</span>
              </div>
              {storageEstimate && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Storage Used</span>
                    <span className="text-lg font-semibold">
                      {formatBytes(storageEstimate.usage)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Storage Quota</span>
                    <span className="text-lg font-semibold">
                      {formatBytes(storageEstimate.quota)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(storageEstimate.percentage, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 text-right">
                    {storageEstimate.percentage.toFixed(2)}% used
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Crawler Status */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Pre-emptive Crawler</h2>
            <button
              onClick={handleToggleCrawler}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                crawler.isRunning
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {crawler.isRunning ? 'Stop Crawler' : 'Start Crawler'}
            </button>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="text-lg font-semibold">
                <span className={crawler.isRunning ? 'text-green-600' : 'text-red-600'}>
                  {crawler.isRunning ? 'Running' : 'Stopped'}
                </span>
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Queue Size</p>
              <p className="text-lg font-semibold">{crawler.queueSize} tasks</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Tasks</p>
              <p className="text-lg font-semibold">{crawler.activeTasks}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Search History</p>
              <p className="text-lg font-semibold">{crawler.historySize} patterns</p>
            </div>
          </div>
        </div>

        {/* Cache Management */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Cache Management</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.values(CacheCategory).map((category) => (
              <button
                key={category}
                onClick={() => handleClearCategory(category)}
                className="glass-button-subtle flex items-center justify-center space-x-2 py-3"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm">Clear {category}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center space-x-4 mt-6">
            <button
              onClick={handleCleanExpired}
              className="glass-button flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Clean Expired</span>
            </button>
            <button
              onClick={handleClearAll}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All Caches</span>
            </button>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Performance Insights</h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-gray-900">
                  {performance.apiReductionRate >= 70 ? 'Excellent' : performance.apiReductionRate >= 50 ? 'Good' : 'Needs Improvement'} cache performance
                </p>
                <p className="text-sm text-gray-600">
                  {performance.apiReductionRate.toFixed(1)}% of requests served from cache, reducing API load
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-gray-900">Memory cache efficiency</p>
                <p className="text-sm text-gray-600">
                  {cache.memoryHitRate.toFixed(1)}% hit rate with {cache.memorySize} entries
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-gray-900">Background crawler active</p>
                <p className="text-sm text-gray-600">
                  {crawler.queueSize} tasks queued, {crawler.historySize} search patterns analyzed
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CacheMetricsDashboard;
