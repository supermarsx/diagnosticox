import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Activity, TrendingUp, TrendingDown, Heart, 
  Pill, AlertTriangle, Check, Calendar
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { analyticsService } from '../services/analyticsService';

interface PatientOutcomesTrackerProps {
  user: any;
}

export default function PatientOutcomesTracker({ user }: PatientOutcomesTrackerProps) {
  const navigate = useNavigate();
  const [selectedPatient, setSelectedPatient] = useState<string>('patient-1');

  const outcomes = analyticsService.getPatientOutcomes();
  const currentPatient = outcomes.find(p => p.patientId === selectedPatient);

  const qualityMetrics = currentPatient ? [
    { metric: 'Quality of Life', value: currentPatient.qualityOfLife, fullMark: 100 },
    { metric: 'Treatment Adherence', value: currentPatient.adherenceRate, fullMark: 100 },
    { metric: 'Symptom Control', value: (10 - currentPatient.symptomSeverity) * 10, fullMark: 100 },
    { metric: 'Safety', value: 100 - (currentPatient.adverseEvents * 10), fullMark: 100 },
    { metric: 'Functionality', value: 75, fullMark: 100 },
  ] : [];

  const progressData = [
    { month: 'Month 1', qol: 45, symptoms: 7, adherence: 65 },
    { month: 'Month 2', qol: 52, symptoms: 6, adherence: 72 },
    { month: 'Month 3', qol: 61, symptoms: 5, adherence: 82 },
    { month: 'Month 4', qol: currentPatient?.qualityOfLife || 70, symptoms: 10 - (currentPatient?.symptomSeverity || 3) * 10, adherence: currentPatient?.adherenceRate || 88 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'improving':
        return 'text-green-600 bg-green-100';
      case 'stable':
        return 'text-blue-600 bg-blue-100';
      case 'declining':
        return 'text-red-600 bg-red-100';
      case 'resolved':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'improving':
        return <TrendingUp className="h-4 w-4" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4" />;
      case 'resolved':
        return <Check className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  if (!currentPatient) {
    return <div>Loading...</div>;
  }

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
                  <Activity className="h-8 w-8 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Patient Outcomes Tracker
                  </h1>
                  <p className="text-sm text-gray-600">
                    Longitudinal outcome monitoring and analysis
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Patient Selector */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Patient</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {outcomes.map((patient) => (
              <button
                key={patient.patientId}
                onClick={() => setSelectedPatient(patient.patientId)}
                className={`text-left p-4 rounded-xl transition-all ${
                  selectedPatient === patient.patientId
                    ? 'glass-card-strong border-2 border-indigo-500'
                    : 'glass-card-subtle hover:glass-card'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{patient.patientName}</h4>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${getStatusColor(patient.currentStatus)}`}>
                    {getStatusIcon(patient.currentStatus)}
                    {patient.currentStatus.charAt(0).toUpperCase() + patient.currentStatus.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">{patient.condition}</p>
                <div className="flex gap-4 text-xs text-gray-500 mt-2">
                  <span>QoL: {patient.qualityOfLife}%</span>
                  <span>Adherence: {patient.adherenceRate}%</span>
                  <span>Severity: {patient.symptomSeverity.toFixed(1)}/10</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Patient Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-card p-6 hover-lift">
            <div className="glass-card-subtle p-2.5 rounded-xl inline-block mb-3">
              <Heart className="h-6 w-6 text-pink-600" />
            </div>
            <p className="text-sm text-gray-600 mb-1">Quality of Life</p>
            <p className="text-3xl font-bold text-gray-900">{currentPatient.qualityOfLife}%</p>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full"
                style={{ width: `${currentPatient.qualityOfLife}%` }}
              />
            </div>
          </div>

          <div className="glass-card p-6 hover-lift">
            <div className="glass-card-subtle p-2.5 rounded-xl inline-block mb-3">
              <Activity className="h-6 w-6 text-orange-600" />
            </div>
            <p className="text-sm text-gray-600 mb-1">Symptom Severity</p>
            <p className="text-3xl font-bold text-gray-900">{currentPatient.symptomSeverity.toFixed(1)}/10</p>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                style={{ width: `${(currentPatient.symptomSeverity / 10) * 100}%` }}
              />
            </div>
          </div>

          <div className="glass-card p-6 hover-lift">
            <div className="glass-card-subtle p-2.5 rounded-xl inline-block mb-3">
              <Pill className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-sm text-gray-600 mb-1">Treatment Adherence</p>
            <p className="text-3xl font-bold text-gray-900">{currentPatient.adherenceRate}%</p>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                style={{ width: `${currentPatient.adherenceRate}%` }}
              />
            </div>
          </div>

          <div className="glass-card p-6 hover-lift">
            <div className="glass-card-subtle p-2.5 rounded-xl inline-block mb-3">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <p className="text-sm text-gray-600 mb-1">Adverse Events</p>
            <p className="text-3xl font-bold text-gray-900">{currentPatient.adverseEvents}</p>
            <p className="text-xs text-gray-500 mt-2">
              {currentPatient.adverseEvents === 0 ? 'No events recorded' : 'Requires attention'}
            </p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Progress Over Time */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Treatment Progress Over Time
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              {/* @ts-ignore - Recharts React 18 compatibility */}
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                {/* @ts-ignore */}
                <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
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
                  dataKey="qol"
                  stroke="#ec4899"
                  strokeWidth={2}
                  name="Quality of Life"
                  dot={{ fill: '#ec4899', r: 4 }}
                />
                {/* @ts-ignore */}
                <Line
                  type="monotone"
                  dataKey="symptoms"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="Symptom Control"
                  dot={{ fill: '#f59e0b', r: 4 }}
                />
                {/* @ts-ignore */}
                <Line
                  type="monotone"
                  dataKey="adherence"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Adherence"
                  dot={{ fill: '#3b82f6', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Multidimensional Quality Assessment */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-600" />
              Patient Health Profile
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              {/* @ts-ignore - Recharts React 18 compatibility */}
              <RadarChart data={qualityMetrics}>
                <PolarGrid stroke="#e5e7eb" />
                {/* @ts-ignore */}
                <PolarAngleAxis dataKey="metric" stroke="#6b7280" fontSize={11} />
                {/* @ts-ignore */}
                <PolarRadiusAxis stroke="#6b7280" fontSize={11} />
                {/* @ts-ignore */}
                <Radar
                  name="Current Status"
                  dataKey="value"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.6}
                />
                {/* @ts-ignore */}
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(229, 231, 235, 0.8)',
                    borderRadius: '12px',
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Treatment Details */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-600" />
            Treatment Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card-subtle p-4 rounded-xl">
              <p className="text-sm text-gray-600 mb-2">Primary Condition</p>
              <p className="text-lg font-semibold text-gray-900">{currentPatient.condition}</p>
            </div>
            <div className="glass-card-subtle p-4 rounded-xl">
              <p className="text-sm text-gray-600 mb-2">Treatment Start Date</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(currentPatient.treatmentStart).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div className="glass-card-subtle p-4 rounded-xl">
              <p className="text-sm text-gray-600 mb-2">Cost of Care (Total)</p>
              <p className="text-lg font-semibold text-gray-900">
                ${currentPatient.costOfCare.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Clinical Insights */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Clinical Insights</h3>
          <div className="space-y-3">
            {currentPatient.qualityOfLife >= 70 && (
              <div className="glass-card-subtle p-4 rounded-xl flex items-start gap-3 border-l-4 border-green-500">
                <Check className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Excellent Quality of Life</p>
                  <p className="text-sm text-gray-600">
                    Patient reports significant improvement in daily functioning and well-being.
                  </p>
                </div>
              </div>
            )}
            {currentPatient.adherenceRate >= 85 && (
              <div className="glass-card-subtle p-4 rounded-xl flex items-start gap-3 border-l-4 border-blue-500">
                <Check className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Strong Treatment Adherence</p>
                  <p className="text-sm text-gray-600">
                    Patient demonstrates excellent compliance with treatment protocol.
                  </p>
                </div>
              </div>
            )}
            {currentPatient.symptomSeverity <= 4 && (
              <div className="glass-card-subtle p-4 rounded-xl flex items-start gap-3 border-l-4 border-purple-500">
                <Check className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Good Symptom Control</p>
                  <p className="text-sm text-gray-600">
                    Symptoms are well-managed with current treatment regimen.
                  </p>
                </div>
              </div>
            )}
            {currentPatient.adverseEvents > 0 && (
              <div className="glass-card-subtle p-4 rounded-xl flex items-start gap-3 border-l-4 border-yellow-500">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Adverse Events Detected</p>
                  <p className="text-sm text-gray-600">
                    Monitor patient closely and consider treatment adjustments if needed.
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
