import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Users, TrendingUp, Globe, Heart,
  AlertCircle, DollarSign, Activity
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line
} from 'recharts';
import { analyticsService } from '../services/analyticsService';

interface PopulationHealthMonitorProps {
  user: any;
}

export default function PopulationHealthMonitor({ user }: PopulationHealthMonitorProps) {
  const navigate = useNavigate();
  const [selectedMetric, setSelectedMetric] = useState<'prevalence' | 'incidence' | 'outcomes'>('prevalence');

  const populationMetrics = analyticsService.getPopulationMetrics();
  const complianceMetrics = analyticsService.getComplianceMetrics();

  const prevalenceData = populationMetrics.map(m => ({
    condition: m.condition,
    value: m.prevalence,
  }));

  const incidenceData = populationMetrics.map(m => ({
    condition: m.condition,
    value: m.incidence,
  }));

  const outcomeData = populationMetrics.map(m => ({
    condition: m.condition,
    treatment: m.treatmentCoverage,
    success: m.outcomeSuccess,
  }));

  const genderDistributionData = populationMetrics.map(m => ({
    condition: m.condition,
    male: m.genderRatio.male,
    female: m.genderRatio.female,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="glass-nav sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/analytics')}
                className="glass-card-subtle p-2 rounded-xl mr-4 hover:scale-110 transition-transform"
              >
                <ArrowLeft className="h-6 w-6 text-gray-700" />
              </button>
              <div className="flex items-center gap-3">
                <div className="glass-card-strong p-3 rounded-2xl">
                  <Globe className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    Population Health Monitor
                  </h1>
                  <p className="text-sm text-gray-600">
                    Epidemiological trends and community health analytics
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-card p-6 hover-lift">
            <div className="glass-card-subtle p-2.5 rounded-xl inline-block mb-3">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Conditions Tracked</p>
            <p className="text-3xl font-bold text-gray-900">{populationMetrics.length}</p>
          </div>

          <div className="glass-card p-6 hover-lift">
            <div className="glass-card-subtle p-2.5 rounded-xl inline-block mb-3">
              <Activity className="h-6 w-6 text-purple-600" />
            </div>
            <p className="text-sm text-gray-600 mb-1">Avg Treatment Coverage</p>
            <p className="text-3xl font-bold text-gray-900">
              {(populationMetrics.reduce((sum, m) => sum + m.treatmentCoverage, 0) / populationMetrics.length).toFixed(0)}%
            </p>
          </div>

          <div className="glass-card p-6 hover-lift">
            <div className="glass-card-subtle p-2.5 rounded-xl inline-block mb-3">
              <Heart className="h-6 w-6 text-pink-600" />
            </div>
            <p className="text-sm text-gray-600 mb-1">Avg Outcome Success</p>
            <p className="text-3xl font-bold text-gray-900">
              {(populationMetrics.reduce((sum, m) => sum + m.outcomeSuccess, 0) / populationMetrics.length).toFixed(0)}%
            </p>
          </div>

          <div className="glass-card p-6 hover-lift">
            <div className="glass-card-subtle p-2.5 rounded-xl inline-block mb-3">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-sm text-gray-600 mb-1">Population Growth</p>
            <p className="text-3xl font-bold text-gray-900">+2.4%</p>
          </div>
        </div>

        {/* Metric Selector */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Metric View</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedMetric('prevalence')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                selectedMetric === 'prevalence'
                  ? 'glass-card-strong text-indigo-600'
                  : 'glass-card-subtle text-gray-600 hover:glass-card'
              }`}
            >
              Prevalence (per 1000)
            </button>
            <button
              onClick={() => setSelectedMetric('incidence')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                selectedMetric === 'incidence'
                  ? 'glass-card-strong text-indigo-600'
                  : 'glass-card-subtle text-gray-600 hover:glass-card'
              }`}
            >
              Incidence (per 1000/year)
            </button>
            <button
              onClick={() => setSelectedMetric('outcomes')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                selectedMetric === 'outcomes'
                  ? 'glass-card-strong text-indigo-600'
                  : 'glass-card-subtle text-gray-600 hover:glass-card'
              }`}
            >
              Treatment Outcomes
            </button>
          </div>
        </div>

        {/* Main Chart */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {selectedMetric === 'prevalence' && 'Disease Prevalence'}
            {selectedMetric === 'incidence' && 'Disease Incidence Rates'}
            {selectedMetric === 'outcomes' && 'Treatment Coverage and Success Rates'}
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            {selectedMetric === 'prevalence' && (
              // @ts-ignore - Recharts React 18 compatibility
              <BarChart data={prevalenceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                {/* @ts-ignore */}
                <XAxis dataKey="condition" stroke="#6b7280" fontSize={12} />
                {/* @ts-ignore */}
                <YAxis stroke="#6b7280" fontSize={12} />
                {/* @ts-ignore */}
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(229, 231, 235, 0.8)',
                    borderRadius: '12px',
                  }}
                />
                <Bar dataKey="value" fill="#3b82f6" name="Cases per 1000" radius={[8, 8, 0, 0]} />
              </BarChart>
            )}
            {selectedMetric === 'incidence' && (
              <BarChart data={incidenceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="condition" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(229, 231, 235, 0.8)',
                    borderRadius: '12px',
                  }}
                />
                <Bar dataKey="value" fill="#8b5cf6" name="New Cases per 1000/year" radius={[8, 8, 0, 0]} />
              </BarChart>
            )}
            {selectedMetric === 'outcomes' && (
              <BarChart data={outcomeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="condition" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(229, 231, 235, 0.8)',
                    borderRadius: '12px',
                  }}
                />
                <Legend />
                <Bar dataKey="treatment" fill="#6366f1" name="Treatment Coverage (%)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="success" fill="#10b981" name="Outcome Success (%)" radius={[8, 8, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Gender Distribution */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-600" />
            Gender Distribution by Condition
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={genderDistributionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="condition" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(229, 231, 235, 0.8)',
                  borderRadius: '12px',
                }}
              />
              <Legend />
              <Bar dataKey="male" fill="#3b82f6" name="Male (%)" stackId="a" radius={[0, 0, 0, 0]} />
              <Bar dataKey="female" fill="#ec4899" name="Female (%)" stackId="a" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Condition Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {populationMetrics.map((metric) => (
            <div key={metric.condition} className="glass-card p-6 hover-lift">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">{metric.condition}</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card-subtle p-3 rounded-xl">
                  <p className="text-xs text-gray-600 mb-1">Prevalence</p>
                  <p className="text-lg font-bold text-blue-600">{metric.prevalence}/1000</p>
                </div>
                <div className="glass-card-subtle p-3 rounded-xl">
                  <p className="text-xs text-gray-600 mb-1">Incidence</p>
                  <p className="text-lg font-bold text-purple-600">{metric.incidence}/1000/yr</p>
                </div>
                <div className="glass-card-subtle p-3 rounded-xl">
                  <p className="text-xs text-gray-600 mb-1">Avg Age</p>
                  <p className="text-lg font-bold text-gray-900">{metric.averageAge} years</p>
                </div>
                <div className="glass-card-subtle p-3 rounded-xl">
                  <p className="text-xs text-gray-600 mb-1">Treatment Coverage</p>
                  <p className="text-lg font-bold text-green-600">{metric.treatmentCoverage}%</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Outcome Success</span>
                  <span className="text-sm font-semibold text-gray-900">{metric.outcomeSuccess}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                    style={{ width: `${metric.outcomeSuccess}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Compliance Dashboard */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            Quality Measure Compliance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {complianceMetrics.map((measure) => (
              <div key={measure.measure} className="glass-card-subtle p-4 rounded-xl">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">{measure.measure}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {measure.compliant} of {measure.eligible} eligible patients
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    measure.compliance >= measure.target
                      ? 'bg-green-100 text-green-700'
                      : 'bg-orange-100 text-orange-700'
                  }`}>
                    {measure.compliance}%
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Target: {measure.target}%</span>
                    <span>{measure.compliance >= measure.target ? 'Met' : 'Below Target'}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        measure.compliance >= measure.target
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                          : 'bg-gradient-to-r from-orange-500 to-amber-500'
                      }`}
                      style={{ width: `${(measure.compliance / 100) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}