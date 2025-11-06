import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, BarChart3, TrendingUp, TrendingDown, Activity, 
  DollarSign, Users, Target, AlertTriangle, Check, Layout, FileText 
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { analyticsService } from '../services/analyticsService';

interface AnalyticsDashboardProps {
  user: any;
}

export default function AnalyticsDashboard({ user }: AnalyticsDashboardProps) {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  const summary = analyticsService.getSummaryStatistics();
  const qualityMetrics = analyticsService.getClinicalQualityMetrics();
  const outcomeTrends = analyticsService.getOutcomeTrends();
  const costTrends = analyticsService.getCostTrends();
  const treatmentEfficacy = analyticsService.getTreatmentEfficacy();
  const riskStratification = analyticsService.getRiskStratification();

  const COLORS = {
    primary: '#6366f1',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
  };

  const riskPieData = [
    { name: 'Low Risk', value: riskStratification.lowRisk.count, color: COLORS.success },
    { name: 'Moderate Risk', value: riskStratification.moderateRisk.count, color: COLORS.warning },
    { name: 'High Risk', value: riskStratification.highRisk.count, color: COLORS.danger },
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-blue-600" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'quality':
        return 'text-purple-600';
      case 'safety':
        return 'text-red-600';
      case 'efficiency':
        return 'text-blue-600';
      case 'satisfaction':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="glass-nav sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="glass-card-subtle p-2 rounded-xl mr-4 hover:scale-110 transition-transform"
              >
                <ArrowLeft className="h-6 w-6 text-gray-700" />
              </button>
              <div className="flex items-center gap-3">
                <div className="glass-card-strong p-3 rounded-2xl">
                  <BarChart3 className="h-8 w-8 text-indigo-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Analytics Dashboard
                  </h1>
                  <p className="text-sm text-gray-600">
                    Clinical intelligence and performance metrics
                  </p>
                </div>
              </div>
            </div>

            {/* Time Range Selector */}
            <div className="flex gap-2">
              {(['7d', '30d', '90d', '1y'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    timeRange === range
                      ? 'glass-card-strong text-indigo-600'
                      : 'glass-card-subtle text-gray-600 hover:glass-card'
                  }`}
                >
                  {range === '7d' && '7 Days'}
                  {range === '30d' && '30 Days'}
                  {range === '90d' && '90 Days'}
                  {range === '1y' && '1 Year'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card p-6 hover-lift">
            <div className="flex items-center justify-between mb-3">
              <div className="glass-card-subtle p-2.5 rounded-xl">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
              <span className="text-sm font-medium text-green-600 flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                +12%
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Patients</p>
            <p className="text-3xl font-bold text-gray-900">{summary.totalPatients}</p>
            <p className="text-xs text-gray-500 mt-2">{summary.activePatients} active</p>
          </div>

          <div className="glass-card p-6 hover-lift">
            <div className="flex items-center justify-between mb-3">
              <div className="glass-card-subtle p-2.5 rounded-xl">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-sm font-medium text-green-600 flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                +5.2%
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-1">Success Rate</p>
            <p className="text-3xl font-bold text-gray-900">{summary.overallSuccessRate}%</p>
            <p className="text-xs text-gray-500 mt-2">Above benchmark</p>
          </div>

          <div className="glass-card p-6 hover-lift">
            <div className="flex items-center justify-between mb-3">
              <div className="glass-card-subtle p-2.5 rounded-xl">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-green-600 flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                +8.1%
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-1">Patient Satisfaction</p>
            <p className="text-3xl font-bold text-gray-900">{summary.patientSatisfaction}%</p>
            <p className="text-xs text-gray-500 mt-2">Quality of life +{summary.qualityOfLifeImprovement}%</p>
          </div>

          <div className="glass-card p-6 hover-lift">
            <div className="flex items-center justify-between mb-3">
              <div className="glass-card-subtle p-2.5 rounded-xl">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-green-600 flex items-center gap-1">
                <TrendingDown className="h-4 w-4" />
                -3.2%
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-1">Cost per Patient/Month</p>
            <p className="text-3xl font-bold text-gray-900">${summary.costPerPatientPerMonth.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-2">Below target</p>
          </div>
        </div>

        {/* Main Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Outcome Trends Chart */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
              Outcome Trends
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              {/* @ts-ignore - Recharts React 18 compatibility */}
              <LineChart data={outcomeTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                {/* @ts-ignore */}
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                {/* @ts-ignore */}
                <YAxis stroke="#6b7280" fontSize={12} />
                {/* @ts-ignore */}
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(229, 231, 235, 0.8)',
                    borderRadius: '12px',
                    padding: '12px',
                  }}
                />
                {/* @ts-ignore */}
                <Legend />
                {/* @ts-ignore */}
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#6366f1" 
                  strokeWidth={2}
                  dot={{ fill: '#6366f1', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Treatment Success"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Risk Stratification Pie Chart */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Risk Stratification
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              {/* @ts-ignore - Recharts React 18 compatibility */}
              <PieChart>
                {/* @ts-ignore */}
                <Pie
                  data={riskPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {riskPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                {/* @ts-ignore */}
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(229, 231, 235, 0.8)',
                    borderRadius: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-3 gap-4 mt-4">
              {Object.entries(riskStratification).map(([key, data]) => (
                <div key={key} className="glass-card-subtle p-3 rounded-xl text-center">
                  <p className="text-xs text-gray-600 mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                  <p className="text-lg font-bold text-gray-900">{data.count}</p>
                  <p className="text-xs text-gray-500">${data.avgCost.toLocaleString()}/mo</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Treatment Efficacy Comparison */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            Treatment Efficacy Comparison
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            {/* @ts-ignore - Recharts React 18 compatibility */}
            <BarChart data={treatmentEfficacy}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              {/* @ts-ignore */}
              <XAxis 
                dataKey="treatmentName" 
                stroke="#6b7280" 
                fontSize={11}
                angle={-15}
                textAnchor="end"
                height={80}
              />
              {/* @ts-ignore */}
              <YAxis stroke="#6b7280" fontSize={12} />
              {/* @ts-ignore */}
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(229, 231, 235, 0.8)',
                  borderRadius: '12px',
                  padding: '12px',
                }}
              />
              {/* @ts-ignore */}
              <Legend />
              {/* @ts-ignore */}
              <Bar dataKey="successRate" fill="#10b981" name="Success Rate (%)" radius={[8, 8, 0, 0]} />
              {/* @ts-ignore */}
              <Bar dataKey="qualityImprovement" fill="#6366f1" name="QoL Improvement (%)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Clinical Quality Metrics */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Check className="h-5 w-5 text-green-600" />
            Clinical Quality Metrics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {qualityMetrics.map((metric) => (
              <div key={metric.metric} className="glass-card-subtle p-4 rounded-xl hover-lift">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className={`text-sm font-medium ${getCategoryColor(metric.category)}`}>
                      {metric.category.toUpperCase()}
                    </p>
                    <p className="text-base font-semibold text-gray-900 mt-1">{metric.metric}</p>
                  </div>
                  {getTrendIcon(metric.trend)}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Current:</span>
                    <span className="font-semibold text-gray-900">
                      {metric.metric.includes('Cost') || metric.metric.includes('Time') 
                        ? metric.current.toFixed(1)
                        : `${metric.current.toFixed(1)}%`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Target:</span>
                    <span className="font-medium text-indigo-600">
                      {metric.metric.includes('Cost') || metric.metric.includes('Time')
                        ? metric.target.toFixed(1)
                        : `${metric.target.toFixed(1)}%`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Benchmark:</span>
                    <span className="font-medium text-gray-500">
                      {metric.metric.includes('Cost') || metric.metric.includes('Time')
                        ? metric.benchmark.toFixed(1)
                        : `${metric.benchmark.toFixed(1)}%`}
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        metric.current >= metric.target
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                          : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                      }`}
                      style={{ 
                        width: `${Math.min(100, (metric.current / metric.target) * 100)}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <button
            onClick={() => navigate('/analytics/patient-outcomes')}
            className="glass-card p-6 hover-lift text-left transition-all hover:scale-105"
          >
            <div className="glass-card-subtle p-3 rounded-xl inline-block mb-3">
              <Activity className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Patient Outcomes</h3>
            <p className="text-sm text-gray-600">
              Track individual patient progress and treatment responses
            </p>
          </button>

          <button
            onClick={() => navigate('/analytics/treatment-efficacy')}
            className="glass-card p-6 hover-lift text-left transition-all hover:scale-105"
          >
            <div className="glass-card-subtle p-3 rounded-xl inline-block mb-3">
              <Target className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Treatment Efficacy</h3>
            <p className="text-sm text-gray-600">
              Compare treatment protocols and analyze effectiveness
            </p>
          </button>

          <button
            onClick={() => navigate('/analytics/population-health')}
            className="glass-card p-6 hover-lift text-left transition-all hover:scale-105"
          >
            <div className="glass-card-subtle p-3 rounded-xl inline-block mb-3">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Population Health</h3>
            <p className="text-sm text-gray-600">
              Monitor community health trends and epidemiological data
            </p>
          </button>

          <button
            onClick={() => navigate('/analytics/dashboard-builder')}
            className="glass-card p-6 hover-lift text-left transition-all hover:scale-105"
          >
            <div className="glass-card-subtle p-3 rounded-xl inline-block mb-3">
              <Layout className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Dashboard Builder</h3>
            <p className="text-sm text-gray-600">
              Create custom analytics dashboards with drag-and-drop widgets
            </p>
          </button>

          <button
            onClick={() => navigate('/analytics/reports')}
            className="glass-card p-6 hover-lift text-left transition-all hover:scale-105"
          >
            <div className="glass-card-subtle p-3 rounded-xl inline-block mb-3">
              <FileText className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Reporting System</h3>
            <p className="text-sm text-gray-600">
              Generate comprehensive clinical and regulatory reports
            </p>
          </button>
        </div>
      </main>
    </div>
  );
}