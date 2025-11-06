import { useState } from 'react';
import { BarChart3, CheckCircle, XCircle, TrendingUp, AlertTriangle, Award, Target, Zap } from 'lucide-react';

interface DiagnosticAccuracyMetric {
  diagnosis: string;
  totalCases: number;
  aiSuggested: number;
  physicianAccepted: number;
  accuracy: number;
  trend: 'improving' | 'stable' | 'declining';
}

interface PhysicianFeedback {
  id: string;
  patientId: string;
  aiDiagnosis: string;
  physicianDiagnosis: string;
  agreement: boolean;
  confidence: number;
  feedbackNotes: string;
  timestamp: string;
}

export function DiagnosticAccuracyDashboard() {
  const [selectedMetric, setSelectedMetric] = useState<DiagnosticAccuracyMetric | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // Mock accuracy data
  const accuracyMetrics: DiagnosticAccuracyMetric[] = [
    {
      diagnosis: 'Rheumatoid Arthritis',
      totalCases: 45,
      aiSuggested: 42,
      physicianAccepted: 39,
      accuracy: 0.929,
      trend: 'improving',
    },
    {
      diagnosis: 'Inflammatory Bowel Disease',
      totalCases: 38,
      aiSuggested: 35,
      physicianAccepted: 29,
      accuracy: 0.829,
      trend: 'stable',
    },
    {
      diagnosis: 'Systemic Lupus Erythematosus',
      totalCases: 22,
      aiSuggested: 20,
      physicianAccepted: 17,
      accuracy: 0.850,
      trend: 'improving',
    },
    {
      diagnosis: 'Psoriatic Arthritis',
      totalCases: 28,
      aiSuggested: 25,
      physicianAccepted: 21,
      accuracy: 0.840,
      trend: 'stable',
    },
    {
      diagnosis: 'Celiac Disease',
      totalCases: 15,
      aiSuggested: 14,
      physicianAccepted: 11,
      accuracy: 0.786,
      trend: 'declining',
    },
  ];

  const recentFeedback: PhysicianFeedback[] = [
    {
      id: 'fb-001',
      patientId: 'P001',
      aiDiagnosis: 'Rheumatoid Arthritis',
      physicianDiagnosis: 'Rheumatoid Arthritis',
      agreement: true,
      confidence: 0.92,
      feedbackNotes: 'Excellent differential diagnosis. AI correctly identified key clinical features.',
      timestamp: '2025-11-05T14:30:00Z',
    },
    {
      id: 'fb-002',
      patientId: 'P002',
      aiDiagnosis: 'Inflammatory Bowel Disease',
      physicianDiagnosis: 'Celiac Disease',
      agreement: false,
      confidence: 0.76,
      feedbackNotes: 'AI missed gluten sensitivity indicators. Need to improve GI disorder differentiation.',
      timestamp: '2025-11-05T12:15:00Z',
    },
    {
      id: 'fb-003',
      patientId: 'P003',
      aiDiagnosis: 'Systemic Lupus Erythematosus',
      physicianDiagnosis: 'Systemic Lupus Erythematosus',
      agreement: true,
      confidence: 0.88,
      feedbackNotes: 'Good pattern recognition for autoimmune markers.',
      timestamp: '2025-11-04T16:45:00Z',
    },
  ];

  // Calculate overall metrics
  const overallAccuracy = accuracyMetrics.reduce((sum, m) => sum + m.accuracy, 0) / accuracyMetrics.length;
  const totalCases = accuracyMetrics.reduce((sum, m) => sum + m.totalCases, 0);
  const totalAgreed = accuracyMetrics.reduce((sum, m) => sum + m.physicianAccepted, 0);
  const disagreementRate = ((totalCases - totalAgreed) / totalCases) * 100;

  const getTrendIcon = (trend: string) => {
    if (trend === 'improving') return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend === 'declining') return <AlertTriangle className="h-4 w-4 text-red-600" />;
    return <div className="h-4 w-4" />;
  };

  const getTrendBadge = (trend: string) => {
    if (trend === 'improving') return 'glass-badge-stable';
    if (trend === 'declining') return 'glass-badge-critical';
    return 'glass-badge-info';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 gradient-overlay-primary">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="glass-card-strong p-3 rounded-2xl">
              <BarChart3 className="h-8 w-8 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                AI Diagnostic Accuracy Dashboard
              </h2>
              <p className="text-sm text-gray-600 mt-1">Performance metrics and continuous learning insights</p>
            </div>
          </div>
          <div className="flex gap-2">
            {['7d', '30d', '90d', '1y'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range as any)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  timeRange === range
                    ? 'glass-card-strong text-indigo-600'
                    : 'glass-card-subtle text-gray-600 hover:glass-card'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6 gradient-overlay-accent hover-lift">
          <div className="flex items-center justify-between mb-3">
            <div className="glass-badge-stable p-3 rounded-xl">
              <Award className="h-6 w-6" />
            </div>
            <span className="glass-badge text-xs">Overall</span>
          </div>
          <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            {(overallAccuracy * 100).toFixed(1)}%
          </p>
          <p className="text-sm text-gray-600 font-medium">AI Accuracy Rate</p>
          <div className="mt-3 glass-card-subtle rounded-full h-2 overflow-hidden">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
              style={{ width: `${overallAccuracy * 100}%` }}
            />
          </div>
        </div>

        <div className="glass-card p-6 hover-lift">
          <div className="flex items-center justify-between mb-3">
            <div className="glass-badge-info p-3 rounded-xl">
              <Target className="h-6 w-6" />
            </div>
            <span className="glass-badge text-xs">30 days</span>
          </div>
          <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            {totalCases}
          </p>
          <p className="text-sm text-gray-600 font-medium">Cases Analyzed</p>
        </div>

        <div className="glass-card p-6 hover-lift">
          <div className="flex items-center justify-between mb-3">
            <div className="glass-badge-stable p-3 rounded-xl">
              <CheckCircle className="h-6 w-6" />
            </div>
            <span className="glass-badge text-xs">Agreement</span>
          </div>
          <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent mb-2">
            {totalAgreed}
          </p>
          <p className="text-sm text-gray-600 font-medium">Physician Accepted</p>
        </div>

        <div className="glass-card p-6 hover-lift">
          <div className="flex items-center justify-between mb-3">
            <div className="glass-badge-warning p-3 rounded-xl">
              <XCircle className="h-6 w-6" />
            </div>
            <span className="glass-badge text-xs">Learning</span>
          </div>
          <p className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
            {disagreementRate.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-600 font-medium">Disagreement Rate</p>
        </div>
      </div>

      {/* Accuracy by Diagnosis */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-6 w-6 text-purple-600" />
          <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Accuracy by Diagnosis
          </h3>
        </div>

        <div className="space-y-4">
          {accuracyMetrics.map((metric, idx) => (
            <div
              key={idx}
              className="glass-card-subtle p-5 rounded-xl hover:glass-card transition-all cursor-pointer"
              onClick={() => setSelectedMetric(selectedMetric?.diagnosis === metric.diagnosis ? null : metric)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className="glass-button-primary w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold">
                    #{idx + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-gray-900">{metric.diagnosis}</h4>
                    <p className="text-sm text-gray-600">
                      {metric.totalCases} cases • {metric.physicianAccepted} accepted
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className={`${getTrendBadge(metric.trend)} px-3 py-1 flex items-center gap-1`}>
                    {getTrendIcon(metric.trend)}
                    <span className="text-xs font-medium">{metric.trend}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {(metric.accuracy * 100).toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-600 font-medium">Accuracy</p>
                  </div>
                </div>
              </div>

              {/* Accuracy Bar */}
              <div className="glass-card-subtle rounded-full h-3 overflow-hidden">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
                  style={{ width: `${metric.accuracy * 100}%` }}
                />
              </div>

              {/* Expanded Details */}
              {selectedMetric?.diagnosis === metric.diagnosis && (
                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="glass-card-subtle p-4 rounded-xl text-center">
                      <p className="text-2xl font-bold text-gray-900">{metric.aiSuggested}</p>
                      <p className="text-xs text-gray-600 mt-1">AI Suggested</p>
                    </div>
                    <div className="glass-card-subtle p-4 rounded-xl text-center">
                      <p className="text-2xl font-bold text-green-600">{metric.physicianAccepted}</p>
                      <p className="text-xs text-gray-600 mt-1">Accepted</p>
                    </div>
                    <div className="glass-card-subtle p-4 rounded-xl text-center">
                      <p className="text-2xl font-bold text-red-600">{metric.aiSuggested - metric.physicianAccepted}</p>
                      <p className="text-xs text-gray-600 mt-1">Disagreed</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Physician Feedback */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-6 w-6 text-amber-600" />
          <h3 className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            Recent Physician Feedback
          </h3>
        </div>

        <div className="space-y-4">
          {recentFeedback.map((feedback) => (
            <div
              key={feedback.id}
              className={`glass-card-subtle p-5 rounded-xl border-2 ${
                feedback.agreement ? 'border-green-300/50' : 'border-red-300/50'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`${feedback.agreement ? 'glass-badge-stable' : 'glass-badge-critical'} p-3 rounded-xl flex-shrink-0`}>
                  {feedback.agreement ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : (
                    <XCircle className="h-6 w-6" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-bold text-gray-900">Patient: {feedback.patientId}</p>
                      <p className="text-xs text-gray-600">
                        {new Date(feedback.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <span className="glass-badge text-xs">
                      {(feedback.confidence * 100).toFixed(0)}% confidence
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="glass-card-subtle p-3 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">AI Diagnosis:</p>
                      <p className="text-sm font-bold text-gray-900">{feedback.aiDiagnosis}</p>
                    </div>
                    <div className="glass-card-subtle p-3 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Physician Diagnosis:</p>
                      <p className="text-sm font-bold text-gray-900">{feedback.physicianDiagnosis}</p>
                    </div>
                  </div>

                  <div className={`${feedback.agreement ? 'glass-badge-stable' : 'glass-badge-warning'} p-3 rounded-lg`}>
                    <p className="text-sm">{feedback.feedbackNotes}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Learning Insights */}
      <div className="glass-card p-6 gradient-overlay-secondary">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-6 w-6 text-green-600" />
          <h3 className="text-xl font-bold text-gray-900">Continuous Learning Insights</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-card-subtle p-4 rounded-xl">
            <h4 className="text-sm font-bold text-gray-900 mb-2">Strengths</h4>
            <ul className="space-y-2">
              <li className="text-sm text-gray-700 flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>High accuracy in autoimmune disorder identification (92.9%)</span>
              </li>
              <li className="text-sm text-gray-700 flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Excellent pattern recognition for inflammatory markers</span>
              </li>
              <li className="text-sm text-gray-700 flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Strong differential diagnosis ranking capabilities</span>
              </li>
            </ul>
          </div>

          <div className="glass-card-subtle p-4 rounded-xl">
            <h4 className="text-sm font-bold text-gray-900 mb-2">Areas for Improvement</h4>
            <ul className="space-y-2">
              <li className="text-sm text-gray-700 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
                <span>Celiac disease detection needs refinement (78.6% accuracy)</span>
              </li>
              <li className="text-sm text-gray-700 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
                <span>Improve GI disorder differentiation algorithms</span>
              </li>
              <li className="text-sm text-gray-700 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
                <span>Enhance sensitivity for atypical presentations</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}