import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Brain, Network, BarChart3, Sparkles } from 'lucide-react';
import { KnowledgeGraphVisualization } from '../components/KnowledgeGraphVisualization';
import { DiagnosticAccuracyDashboard } from '../components/DiagnosticAccuracyDashboard';
import { useEffect, useState } from 'react';
import { analyzeSymptoms, listProviders, AIAnalyzeResponse } from '../services/aiProviderClient';

interface AIInsightsPageProps {
  user: any;
}

export default function AIInsightsPage({ user }: AIInsightsPageProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'knowledge-graph' | 'accuracy-tracking' | 'ai-assist'>('knowledge-graph');
  const [providers, setProviders] = useState<{ id: string; name: string }[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('local');
  const [symptoms, setSymptoms] = useState<string>('');
  const [result, setResult] = useState<AIAnalyzeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listProviders()
      .then((data) => setProviders(data.providers || []))
      .catch(() => setProviders([]));
  }, []);

  const handleAnalyze = async () => {
    const payload = {
      symptoms: symptoms.split(',').map((s) => s.trim()).filter(Boolean),
      provider: selectedProvider,
    };
    if (!payload.symptoms.length) {
      setError('Enter at least one symptom');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await analyzeSymptoms(payload);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'AI analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Glassmorphism Header */}
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
                  <Brain className="h-8 w-8 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    AI Insights & Analytics
                  </h1>
                  <p className="text-sm text-gray-600">
                    Advanced medical intelligence and performance monitoring
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Glass Tabs */}
          <div className="mt-4 flex gap-2">
            {[
              { key: 'knowledge-graph', label: 'Knowledge Graph', icon: Network },
              { key: 'accuracy-tracking', label: 'Accuracy Tracking', icon: BarChart3 },
              { key: 'ai-assist', label: 'AI Assist', icon: Sparkles },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-6 py-2.5 font-medium rounded-xl transition-all flex items-center gap-2 ${
                    activeTab === tab.key
                      ? 'glass-card-strong text-purple-600 shadow-lg'
                      : 'glass-card-subtle text-gray-600 hover:text-gray-900 hover:glass-card'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Knowledge Graph Tab */}
        {activeTab === 'knowledge-graph' && <KnowledgeGraphVisualization />}

        {/* Accuracy Tracking Tab */}
        {activeTab === 'accuracy-tracking' && <DiagnosticAccuracyDashboard />}

        {/* AI Assist Tab */}
        {activeTab === 'ai-assist' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 glass-card p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                AI Provider
              </h2>
              <select
                className="glass-input w-full"
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
              >
                {providers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
                {!providers.length && <option value="local">Local</option>}
              </select>
              <div>
                <label className="text-sm text-gray-600 block mb-1">Symptoms (comma-separated)</label>
                <textarea
                  rows={3}
                  className="glass-input w-full"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="e.g., chronic cough, nocturnal wheeze, fatigue"
                />
              </div>
              <button
                className="glass-button-primary w-full"
                onClick={handleAnalyze}
                disabled={loading}
              >
                {loading ? 'Analyzing...' : 'Analyze'}
              </button>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>

            <div className="lg:col-span-2 space-y-4">
              {result ? (
                <div className="glass-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Provider: {result.provider}</p>
                      <h3 className="text-lg font-semibold text-gray-800">Recommendations</h3>
                    </div>
                    <span className="glass-badge text-xs">Chief: {result.chiefComplaint}</span>
                  </div>
                  <div className="space-y-3">
                    {result.suggestions.map((sugg) => (
                      <div key={sugg.diagnosis} className="glass-card-subtle p-4 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-500">{sugg.icd10Code}</p>
                            <h4 className="font-semibold text-gray-800">{sugg.diagnosis}</h4>
                            <p className="text-xs text-gray-500">Urgency: {sugg.urgency}</p>
                          </div>
                          <span className="glass-badge text-xs">{Math.round(sugg.confidence * 100)}%</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">Recommended tests: {sugg.recommendedTests.join(', ')}</p>
                        <p className="text-xs text-gray-500">Reasoning: {sugg.reasoning.join('; ')}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Guardrails</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {result.guardrails.map((g) => (
                        <li key={g}>{g}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="glass-card p-6 text-gray-500">No AI output yet. Enter symptoms and analyze.</div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
