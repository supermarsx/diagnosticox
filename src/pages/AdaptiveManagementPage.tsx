/**
 * Adaptive Management Dashboard Page
 * 
 * Comprehensive dashboard for cost tracking, data access controls, and server monitoring
 * across different usage modes.
 * 
 * @module AdaptiveManagementPage
 */

import { useState, useEffect } from 'react';
import {
  DollarSign, Shield, Server, TrendingUp, AlertCircle,
  Cpu, HardDrive, Activity, Clock, CheckCircle, XCircle
} from 'lucide-react';
import { adaptiveFeatureService } from '../services/adaptiveFeatureService';
import type { UsageMode } from '../services/adaptiveFeatureService';

/**
 * Main adaptive management dashboard component
 */
export default function AdaptiveManagementPage() {
  const [selectedMode, setSelectedMode] = useState<UsageMode>('clinical');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'costs' | 'data' | 'server'>('costs');

  useEffect(() => {
    initializeMode(selectedMode);
  }, [selectedMode]);

  const initializeMode = (mode: UsageMode) => {
    // Initialize services if not already done
    if (!adaptiveFeatureService.getCostTracking(mode)) {
      adaptiveFeatureService.initializeCostTracking(mode, 1000, 'monthly');
      
      // Add some sample costs
      adaptiveFeatureService.trackCost(mode, 'AI API Calls', 145.32, 1523, 'requests');
      adaptiveFeatureService.trackCost(mode, 'Database Storage', 89.50, 245, 'GB');
      adaptiveFeatureService.trackCost(mode, 'External APIs', 67.89, 892, 'requests');
      adaptiveFeatureService.trackCost(mode, 'Compute Resources', 234.67, 1200, 'hours');
    }

    if (!adaptiveFeatureService.getDataControls(mode)) {
      adaptiveFeatureService.initializeDataControls(mode);
      
      // Add sample audit logs
      adaptiveFeatureService.logDataAccess(mode, 'Dr. Smith', 'read', 'patient_records', 'success');
      adaptiveFeatureService.logDataAccess(mode, 'Dr. Johnson', 'write', 'diagnostic_results', 'success');
      adaptiveFeatureService.logDataAccess(mode, 'Student1', 'read', 'research_data', 'success');
    }

    // Update server metrics
    adaptiveFeatureService.updateServerMetrics(mode);

    // Get all data
    const data = adaptiveFeatureService.getDashboardData(mode);
    setDashboardData(data);
  };

  const modes: { value: UsageMode; label: string; color: string }[] = [
    { value: 'clinical', label: 'Clinical Practice', color: 'blue' },
    { value: 'hospital', label: 'Hospital System', color: 'green' },
    { value: 'study', label: 'Research Study', color: 'purple' },
    { value: 'student', label: 'Medical Student', color: 'orange' },
    { value: 'self_exploration', label: 'Self-Exploration', color: 'pink' }
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      normal: 'text-green-600 bg-green-50 border-green-200',
      healthy: 'text-green-600 bg-green-50 border-green-200',
      warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      degraded: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      critical: 'text-red-600 bg-red-50 border-red-200',
      up: 'text-green-600 bg-green-50',
      down: 'text-red-600 bg-red-50'
    };
    return colors[status] || 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Adaptive Management</h1>
              <p className="text-sm text-gray-600 mt-1">
                Cost Tracking, Data Controls & Server Monitoring
              </p>
            </div>
          </div>

          {/* Mode Selector */}
          <div className="flex gap-2 mt-6 flex-wrap">
            {modes.map((mode) => (
              <button
                key={mode.value}
                onClick={() => setSelectedMode(mode.value)}
                className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                  selectedMode === mode.value
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveTab('costs')}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === 'costs'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Cost Management
              </div>
            </button>
            <button
              onClick={() => setActiveTab('data')}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === 'data'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Data Controls
              </div>
            </button>
            <button
              onClick={() => setActiveTab('server')}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === 'server'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4" />
                Server Monitoring
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cost Management Tab */}
        {activeTab === 'costs' && dashboardData?.costs && (
          <div className="space-y-6">
            {/* Budget Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  <div className="text-sm font-medium text-gray-600">Budget</div>
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  ${dashboardData.costs.budget.toFixed(2)}
                </div>
                <div className="text-xs text-gray-600 mt-1">{dashboardData.costs.period}</div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <div className="text-sm font-medium text-gray-600">Spent</div>
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  ${dashboardData.costs.spent.toFixed(2)}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {((dashboardData.costs.spent / dashboardData.costs.budget) * 100).toFixed(1)}% of budget
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Activity className="w-5 h-5 text-purple-600" />
                  <div className="text-sm font-medium text-gray-600">Remaining</div>
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  ${(dashboardData.costs.budget - dashboardData.costs.spent).toFixed(2)}
                </div>
                <div className="text-xs text-gray-600 mt-1">Available budget</div>
              </div>
            </div>

            {/* Budget Progress */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Budget Usage</h2>
              <div className="relative">
                <div className="w-full bg-gray-200 rounded-full h-8">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium transition-all"
                    style={{
                      width: `${Math.min((dashboardData.costs.spent / dashboardData.costs.budget) * 100, 100)}%`
                    }}
                  >
                    {((dashboardData.costs.spent / dashboardData.costs.budget) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Cost Breakdown by Service</h2>
              <div className="space-y-3">
                {dashboardData.costs.breakdown.map((item: any, idx: number) => (
                  <div key={idx} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-medium text-gray-900">{item.service}</div>
                      <div className="text-lg font-bold text-blue-600">${item.cost.toFixed(2)}</div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {item.usage} {item.unit}
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min((item.cost / dashboardData.costs.budget) * 100, 100)}%`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Alerts */}
            {dashboardData.costs.alerts.some((a: any) => a.triggered) && (
              <div className="bg-yellow-50 rounded-2xl shadow-xl border border-yellow-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  Cost Alerts
                </h2>
                <div className="space-y-2">
                  {dashboardData.costs.alerts
                    .filter((alert: any) => alert.triggered)
                    .map((alert: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-3 text-sm text-yellow-800">
                        <AlertCircle className="w-4 h-4" />
                        <span>{alert.message}</span>
                        {alert.timestamp && (
                          <span className="text-xs text-yellow-600">
                            {new Date(alert.timestamp).toLocaleString()}
                          </span>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {dashboardData.recommendations.cost.length > 0 && (
              <div className="bg-blue-50 rounded-2xl shadow-xl border border-blue-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Cost Recommendations</h2>
                <div className="space-y-2">
                  {dashboardData.recommendations.cost.map((rec: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 text-sm text-blue-800">
                      <CheckCircle className="w-4 h-4 mt-0.5" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Data Controls Tab */}
        {activeTab === 'data' && dashboardData?.dataControls && (
          <div className="space-y-6">
            {/* Encryption Status */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                Encryption Configuration
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Status</div>
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${
                    dashboardData.dataControls.encryption.enabled
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {dashboardData.dataControls.encryption.enabled ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    {dashboardData.dataControls.encryption.enabled ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Algorithm</div>
                  <div className="font-medium text-gray-900">{dashboardData.dataControls.encryption.algorithm}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Key Rotation</div>
                  <div className="font-medium text-gray-900">{dashboardData.dataControls.encryption.keyRotationDays} days</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Last Rotation</div>
                  <div className="font-medium text-gray-900">
                    {new Date(dashboardData.dataControls.encryption.lastRotation).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Permissions */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Data Access Permissions</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Resource</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Read</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Write</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Delete</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Share</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Export</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.dataControls.permissions.map((perm: any, idx: number) => (
                      <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm font-medium text-gray-900">
                          {perm.resource.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {perm.read ? (
                            <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-400 mx-auto" />
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {perm.write ? (
                            <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-400 mx-auto" />
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {perm.delete ? (
                            <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-400 mx-auto" />
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {perm.share ? (
                            <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-400 mx-auto" />
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {perm.export ? (
                            <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-400 mx-auto" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Retention Policy */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Data Retention Policy</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="text-sm text-gray-600 mb-1">Duration</div>
                  <div className="font-medium text-gray-900">
                    {dashboardData.dataControls.retentionPolicy.duration} {dashboardData.dataControls.retentionPolicy.unit}
                  </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <div className="text-sm text-gray-600 mb-1">Auto Delete</div>
                  <div className={`font-medium ${
                    dashboardData.dataControls.retentionPolicy.autoDelete ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {dashboardData.dataControls.retentionPolicy.autoDelete ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="text-sm text-gray-600 mb-1">Archive</div>
                  <div className={`font-medium ${
                    dashboardData.dataControls.retentionPolicy.archiveEnabled ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {dashboardData.dataControls.retentionPolicy.archiveEnabled ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Audit Log */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-3">
                {dashboardData.dataControls.auditLog.slice(-5).reverse().map((entry: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <Activity className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="font-medium text-gray-900">{entry.user}</div>
                        <div className="text-sm text-gray-600">
                          {entry.action} • {entry.resource.replace('_', ' ')}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        entry.result === 'success'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {entry.result === 'success' ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        {entry.result}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Server Monitoring Tab */}
        {activeTab === 'server' && dashboardData?.serverMetrics && (
          <div className="space-y-6">
            {/* Health Status */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Server className="w-5 h-5 text-blue-600" />
                System Health
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className={`rounded-lg p-4 border ${getStatusColor(dashboardData.serverMetrics.health.overall)}`}>
                  <div className="text-sm mb-1">Overall Status</div>
                  <div className="text-xl font-bold capitalize">{dashboardData.serverMetrics.health.overall}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">Uptime</div>
                  <div className="text-xl font-bold text-gray-900">{dashboardData.serverMetrics.health.uptime}%</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">Total Requests</div>
                  <div className="text-xl font-bold text-gray-900">
                    {dashboardData.serverMetrics.requests.total.toLocaleString()}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">Avg Response</div>
                  <div className="text-xl font-bold text-gray-900">
                    {dashboardData.serverMetrics.requests.avgResponseTime.toFixed(0)}ms
                  </div>
                </div>
              </div>
            </div>

            {/* Resource Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* CPU */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Cpu className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">CPU Usage</h3>
                </div>
                <div className="relative pt-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-700">
                      {dashboardData.serverMetrics.cpu.current} / {dashboardData.serverMetrics.cpu.max}{' '}
                      {dashboardData.serverMetrics.cpu.unit}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      getStatusColor(dashboardData.serverMetrics.cpu.status)
                    }`}>
                      {dashboardData.serverMetrics.cpu.status}
                    </span>
                  </div>
                  <div className="overflow-hidden h-4 text-xs flex rounded bg-gray-200">
                    <div
                      style={{ width: `${dashboardData.serverMetrics.cpu.percentage}%` }}
                      className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                        dashboardData.serverMetrics.cpu.status === 'critical'
                          ? 'bg-red-500'
                          : dashboardData.serverMetrics.cpu.status === 'warning'
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                    />
                  </div>
                  <div className="text-center mt-2 text-sm font-medium text-gray-900">
                    {dashboardData.serverMetrics.cpu.percentage.toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Memory */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Activity className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-900">Memory Usage</h3>
                </div>
                <div className="relative pt-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-700">
                      {dashboardData.serverMetrics.memory.current.toFixed(1)} / {dashboardData.serverMetrics.memory.max}{' '}
                      {dashboardData.serverMetrics.memory.unit}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      getStatusColor(dashboardData.serverMetrics.memory.status)
                    }`}>
                      {dashboardData.serverMetrics.memory.status}
                    </span>
                  </div>
                  <div className="overflow-hidden h-4 text-xs flex rounded bg-gray-200">
                    <div
                      style={{ width: `${dashboardData.serverMetrics.memory.percentage}%` }}
                      className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                        dashboardData.serverMetrics.memory.status === 'critical'
                          ? 'bg-red-500'
                          : dashboardData.serverMetrics.memory.status === 'warning'
                          ? 'bg-yellow-500'
                          : 'bg-purple-500'
                      }`}
                    />
                  </div>
                  <div className="text-center mt-2 text-sm font-medium text-gray-900">
                    {dashboardData.serverMetrics.memory.percentage.toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Storage */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <HardDrive className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-gray-900">Storage Usage</h3>
                </div>
                <div className="relative pt-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-700">
                      {dashboardData.serverMetrics.storage.current} / {dashboardData.serverMetrics.storage.max}{' '}
                      {dashboardData.serverMetrics.storage.unit}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      getStatusColor(dashboardData.serverMetrics.storage.status)
                    }`}>
                      {dashboardData.serverMetrics.storage.status}
                    </span>
                  </div>
                  <div className="overflow-hidden h-4 text-xs flex rounded bg-gray-200">
                    <div
                      style={{ width: `${dashboardData.serverMetrics.storage.percentage}%` }}
                      className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                        dashboardData.serverMetrics.storage.status === 'critical'
                          ? 'bg-red-500'
                          : dashboardData.serverMetrics.storage.status === 'warning'
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                    />
                  </div>
                  <div className="text-center mt-2 text-sm font-medium text-gray-900">
                    {dashboardData.serverMetrics.storage.percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Service Health */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Service Health</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dashboardData.serverMetrics.health.services.map((service: any, idx: number) => (
                  <div key={idx} className={`rounded-lg p-4 border ${getStatusColor(service.status)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-gray-900">{service.name}</div>
                      <div className="text-xs font-semibold px-2 py-1 rounded bg-white/50 capitalize">
                        {service.status}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <div className="text-xs text-gray-600">Latency</div>
                        <div className="font-medium">{service.latency.toFixed(0)}ms</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600">Error Rate</div>
                        <div className="font-medium">{(service.errorRate * 100).toFixed(2)}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            {dashboardData.recommendations.resources.length > 0 && (
              <div className="bg-blue-50 rounded-2xl shadow-xl border border-blue-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Resource Recommendations</h2>
                <div className="space-y-2">
                  {dashboardData.recommendations.resources.map((rec: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 text-sm text-blue-800">
                      <AlertCircle className="w-4 h-4 mt-0.5" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
