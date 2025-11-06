import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Brain, Network, BarChart3 } from 'lucide-react';
import { KnowledgeGraphVisualization } from '../components/KnowledgeGraphVisualization';
import { DiagnosticAccuracyDashboard } from '../components/DiagnosticAccuracyDashboard';

interface AIInsightsPageProps {
  user: any;
}

export default function AIInsightsPage({ user }: AIInsightsPageProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'knowledge-graph' | 'accuracy-tracking'>('knowledge-graph');

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
      </main>
    </div>
  );
}