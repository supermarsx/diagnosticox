import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Target, DollarSign, Clock, AlertCircle,
  TrendingUp, Award, Users
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter,
  ZAxis
} from 'recharts';
import { analyticsService } from '../services/analyticsService';

interface TreatmentEfficacyCenterProps {
  user: any;
}

export default function TreatmentEfficacyCenter({ user }: TreatmentEfficacyCenterProps) {
  const navigate = useNavigate();
  const [selectedCondition, setSelectedCondition] = useState<string>('all');

  const treatments = analyticsService.getTreatmentEfficacy();
  const filteredTreatments = selectedCondition === 'all'
    ? treatments
    : treatments.filter(t => t.condition === selectedCondition);

  const conditions = Array.from(new Set(treatments.map(t => t.condition)));

  const costEffectivenessData = treatments.map(t => ({
    name: t.treatmentName.substring(0, 20),
    successRate: t.successRate,
    cost: t.costPerPatient / 1000,
    patients: t.patientsCount,
  }));

  const getEvidenceLevelColor = (level: string) => {
    switch (level) {
      case 'I': return 'bg-green-100 text-green-700';
      case 'II': return 'bg-blue-100 text-blue-700';
      case 'III': return 'bg-yellow-100 text-yellow-700';
      case 'IV': return 'bg-orange-100 text-orange-700';
      case 'V': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
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
                onClick={() => navigate('/analytics')}
                className="glass-card-subtle p-2 rounded-xl mr-4 hover:scale-110 transition-transform"
              >
                <ArrowLeft className="h-6 w-6 text-gray-700" />
              </button>
              <div className="flex items-center gap-3">
                <div className="glass-card-strong p-3 rounded-2xl">
                  <Target className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    Treatment Efficacy Center
                  </h1>
                  <p className="text-sm text-gray-600">
                    Comparative effectiveness analysis and optimization
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Condition Filter */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter by Condition</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCondition('all')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                selectedCondition === 'all'
                  ? 'glass-card-strong text-indigo-600'
                  : 'glass-card-subtle text-gray-600 hover:glass-card'
              }`}
            >
              All Conditions
            </button>
            {conditions.map((condition) => (
              <button
                key={condition}
                onClick={() => setSelectedCondition(condition)}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  selectedCondition === condition
                    ? 'glass-card-strong text-indigo-600'
                    : 'glass-card-subtle text-gray-600 hover:glass-card'
                }`}
              >
                {condition}
              </button>
            ))}
          </div>
        </div>

        {/* Treatment Comparison Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTreatments.map((treatment) => (
            <div key={treatment.treatmentName} className="glass-card p-6 hover-lift">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{treatment.treatmentName}</h3>
                  <p className="text-sm text-gray-600">{treatment.condition}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEvidenceLevelColor(treatment.evidenceLevel)}`}>
                  Level {treatment.evidenceLevel}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="glass-card-subtle p-3 rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="h-4 w-4 text-green-600" />
                    <p className="text-xs text-gray-600">Success Rate</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{treatment.successRate}%</p>
                </div>
                <div className="glass-card-subtle p-3 rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="h-4 w-4 text-blue-600" />
                    <p className="text-xs text-gray-600">Patients</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{treatment.patientsCount}</p>
                </div>
                <div className="glass-card-subtle p-3 rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4 text-purple-600" />
                    <p className="text-xs text-gray-600">Response Time</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{treatment.averageResponseTime}d</p>
                </div>
                <div className="glass-card-subtle p-3 rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="h-4 w-4 text-indigo-600" />
                    <p className="text-xs text-gray-600">Cost/Patient</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">${(treatment.costPerPatient / 1000).toFixed(1)}k</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">QoL Improvement:</span>
                  <span className="font-semibold text-green-600">+{treatment.qualityImprovement}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Adverse Event Rate:</span>
                  <span className="font-semibold text-orange-600">{treatment.adverseEventRate}%</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Overall Efficacy Score</span>
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-500" />
                    <span className="text-lg font-bold text-gray-900">
                      {((treatment.successRate * 0.4) + (treatment.qualityImprovement * 0.4) + ((100 - treatment.adverseEventRate) * 0.2)).toFixed(0)}/100
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Efficacy Comparison Chart */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            Treatment Success Rates Comparison
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={filteredTreatments}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="treatmentName"
                stroke="#6b7280"
                fontSize={11}
                angle={-15}
                textAnchor="end"
                height={100}
              />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(229, 231, 235, 0.8)',
                  borderRadius: '12px',
                  padding: '12px',
                }}
              />
              <Legend />
              <Bar dataKey="successRate" fill="#10b981" name="Success Rate (%)" radius={[8, 8, 0, 0]} />
              <Bar dataKey="qualityImprovement" fill="#6366f1" name="QoL Improvement (%)" radius={[8, 8, 0, 0]} />
              <Bar dataKey="adverseEventRate" fill="#f59e0b" name="Adverse Events (%)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cost-Effectiveness Analysis */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-blue-600" />
            Cost-Effectiveness Analysis
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                type="number" 
                dataKey="cost" 
                name="Cost" 
                unit="k"
                stroke="#6b7280"
                label={{ value: 'Cost per Patient ($k)', position: 'bottom', offset: 0 }}
              />
              <YAxis 
                type="number" 
                dataKey="successRate" 
                name="Success Rate"
                unit="%"
                stroke="#6b7280"
                label={{ value: 'Success Rate (%)', angle: -90, position: 'insideLeft' }}
              />
              {/* @ts-ignore - Recharts React 18 compatibility */}
              <ZAxis type="number" dataKey="patients" range={[100, 1000]} name="Patients" />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(229, 231, 235, 0.8)',
                  borderRadius: '12px',
                }}
                formatter={(value: any, name: string) => {
                  if (name === 'Cost') return [`$${value}k`, 'Cost per Patient'];
                  if (name === 'Success Rate') return [`${value}%`, 'Success Rate'];
                  return [value, name];
                }}
              />
              {/* @ts-ignore - Recharts React 18 compatibility */}
              <Scatter name="Treatments" data={costEffectivenessData} fill="#6366f1" />
            </ScatterChart>
          </ResponsiveContainer>
          <div className="mt-4 glass-card-subtle p-4 rounded-xl">
            <p className="text-sm text-gray-600">
              <AlertCircle className="h-4 w-4 inline mr-1 text-blue-600" />
              Bubble size represents number of patients treated. Treatments in the upper-left quadrant (high success, low cost) offer the best value.
            </p>
          </div>
        </div>

        {/* Key Insights */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Clinical Insights</h3>
          <div className="space-y-3">
            {filteredTreatments.sort((a, b) => b.successRate - a.successRate)[0] && (
              <div className="glass-card-subtle p-4 rounded-xl flex items-start gap-3 border-l-4 border-green-500">
                <Award className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Highest Success Rate</p>
                  <p className="text-sm text-gray-600">
                    {filteredTreatments.sort((a, b) => b.successRate - a.successRate)[0].treatmentName} achieves {filteredTreatments.sort((a, b) => b.successRate - a.successRate)[0].successRate}% success rate
                  </p>
                </div>
              </div>
            )}
            {filteredTreatments.sort((a, b) => a.costPerPatient - b.costPerPatient)[0] && (
              <div className="glass-card-subtle p-4 rounded-xl flex items-start gap-3 border-l-4 border-blue-500">
                <DollarSign className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Most Cost-Effective</p>
                  <p className="text-sm text-gray-600">
                    {filteredTreatments.sort((a, b) => a.costPerPatient - b.costPerPatient)[0].treatmentName} offers excellent value at ${filteredTreatments.sort((a, b) => a.costPerPatient - b.costPerPatient)[0].costPerPatient.toLocaleString()}/patient
                  </p>
                </div>
              </div>
            )}
            {filteredTreatments.sort((a, b) => a.averageResponseTime - b.averageResponseTime)[0] && (
              <div className="glass-card-subtle p-4 rounded-xl flex items-start gap-3 border-l-4 border-purple-500">
                <Clock className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Fastest Response Time</p>
                  <p className="text-sm text-gray-600">
                    {filteredTreatments.sort((a, b) => a.averageResponseTime - b.averageResponseTime)[0].treatmentName} shows response in {filteredTreatments.sort((a, b) => a.averageResponseTime - b.averageResponseTime)[0].averageResponseTime} days average
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
