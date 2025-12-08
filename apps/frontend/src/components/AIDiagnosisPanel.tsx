import { useState, useEffect } from 'react';
import { Sparkles, Brain, TrendingUp, AlertTriangle, CheckCircle, Lightbulb, Clock, Target } from 'lucide-react';
import { aiService, AIDiagnosisSuggestion, AIAnalysisResult } from '../services/aiService';

interface AIDiagnosisPanelProps {
  patientId: string;
  symptoms: string[];
  onAnalysisComplete?: (result: AIAnalysisResult) => void;
}

export function AIDiagnosisPanel({ patientId, symptoms, onAnalysisComplete }: AIDiagnosisPanelProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [showDetails, setShowDetails] = useState<string | null>(null);

  const runAnalysis = async () => {
    setAnalyzing(true);
    try {
      const result = await aiService.analyzePatient(
        patientId,
        symptoms,
        {},
        { age: 35, gender: 'Female' }
      );
      setAnalysis(result);
      if (onAnalysisComplete) {
        onAnalysisComplete(result);
      }
    } catch (error) {
      console.error('AI analysis failed:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.85) return 'from-green-600 to-emerald-600';
    if (confidence >= 0.75) return 'from-blue-600 to-indigo-600';
    if (confidence >= 0.65) return 'from-yellow-600 to-orange-600';
    return 'from-red-600 to-pink-600';
  };

  const getUrgencyBadge = (urgency: string) => {
    const badges = {
      critical: 'glass-badge-critical',
      high: 'glass-badge-warning',
      medium: 'glass-badge-info',
      low: 'glass-badge-stable',
    };
    return badges[urgency as keyof typeof badges] || 'glass-badge';
  };

  return (
    <div className="space-y-6">
      {/* AI Analysis Header */}
      <div className="glass-card p-6 gradient-overlay-primary">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="glass-card-strong p-3 rounded-2xl">
              <Brain className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                AI Diagnosis Assistant
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Advanced clinical decision support powered by machine learning
              </p>
            </div>
          </div>
          <button
            onClick={runAnalysis}
            disabled={analyzing}
            className="glass-button-primary flex items-center gap-2 disabled:opacity-50"
          >
            {analyzing ? (
              <>
                <div className="relative w-5 h-5">
                  <div className="absolute inset-0 rounded-full border-2 border-white/30"></div>
                  <div className="absolute inset-0 rounded-full border-2 border-t-white animate-spin"></div>
                </div>
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Run AI Analysis
              </>
            )}
          </button>
        </div>

        {analyzing && (
          <div className="glass-card-subtle p-4 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="glass-badge-info p-2 rounded-lg">
                <Brain className="h-5 w-5 animate-pulse" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900">Processing clinical data...</p>
                <p className="text-xs text-gray-600 mt-1">
                  Analyzing patient symptoms, lab results, and medical history
                </p>
              </div>
            </div>
            <div className="glass-card-subtle rounded-full h-2 overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        )}
      </div>

      {/* AI Analysis Results */}
      {analysis && !analyzing && (
        <div className="space-y-6">
          {/* Top Suggestions */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-6 w-6 text-purple-600" />
              <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Differential Diagnosis Ranking
              </h3>
            </div>

            <div className="space-y-4">
              {analysis.suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="glass-card-subtle p-5 rounded-xl hover:glass-card transition-all cursor-pointer"
                  onClick={() => setShowDetails(showDetails === suggestion.diagnosis ? null : suggestion.diagnosis)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="glass-button-primary w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold">
                        #{index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-gray-900">{suggestion.diagnosis}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="glass-badge text-xs">{suggestion.icd10Code}</span>
                          <span className={`glass-badge text-xs ${getUrgencyBadge(suggestion.urgency)}`}>
                            {suggestion.urgency} urgency
                          </span>
                          <span className="glass-badge text-xs">
                            Evidence Level {suggestion.evidenceLevel}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Confidence Score */}
                    <div className="text-right flex-shrink-0 ml-4">
                      <div className="text-4xl font-bold bg-gradient-to-r {getConfidenceColor(suggestion.confidence)} bg-clip-text text-transparent">
                        {(suggestion.confidence * 100).toFixed(1)}%
                      </div>
                      <p className="text-xs text-gray-600 font-medium mt-1">Confidence</p>
                    </div>
                  </div>

                  {/* Confidence Bar */}
                  <div className="glass-card-subtle rounded-full h-3 overflow-hidden mb-3">
                    <div
                      className={`h-3 rounded-full bg-gradient-to-r ${getConfidenceColor(suggestion.confidence)} transition-all`}
                      style={{ width: `${suggestion.confidence * 100}%` }}
                    />
                  </div>

                  {/* Expanded Details */}
                  {showDetails === suggestion.diagnosis && (
                    <div className="mt-4 space-y-4 pt-4 border-t border-white/20">
                      {/* AI Reasoning */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb className="h-4 w-4 text-purple-600" />
                          <h5 className="text-sm font-bold text-gray-900">AI Reasoning</h5>
                        </div>
                        <ul className="space-y-2">
                          {suggestion.reasoning.map((reason, idx) => (
                            <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Supporting Evidence */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <h5 className="text-sm font-bold text-gray-900">Supporting Evidence</h5>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {suggestion.supportingEvidence.map((evidence, idx) => (
                            <div key={idx} className="glass-card-subtle p-2 rounded-lg text-sm text-gray-700">
                              {evidence}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Recommended Tests */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <h5 className="text-sm font-bold text-gray-900">Recommended Tests</h5>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {suggestion.recommendedTests.map((test, idx) => (
                            <span key={idx} className="glass-badge-info text-xs px-3 py-1">
                              {test}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Contradicting Evidence */}
                      {suggestion.contradictingEvidence && suggestion.contradictingEvidence.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="h-4 w-4 text-orange-600" />
                            <h5 className="text-sm font-bold text-gray-900">Considerations</h5>
                          </div>
                          <div className="glass-badge-warning p-3 rounded-lg">
                            <ul className="space-y-1">
                              {suggestion.contradictingEvidence.map((evidence, idx) => (
                                <li key={idx} className="text-sm">{evidence}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Risk Factors & Prognostic Indicators */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk Factors */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <h3 className="text-lg font-bold text-gray-900">Risk Factors</h3>
              </div>
              <div className="space-y-2">
                {analysis.riskFactors.map((factor, idx) => (
                  <div key={idx} className="glass-card-subtle p-3 rounded-lg text-sm text-gray-700">
                    {factor}
                  </div>
                ))}
              </div>
            </div>

            {/* Prognostic Indicators */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-bold text-gray-900">Prognostic Indicators</h3>
              </div>
              <div className="space-y-3">
                {analysis.prognosticIndicators.map((indicator, idx) => (
                  <div key={idx} className="glass-card-subtle p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-gray-900">{indicator.factor}</span>
                      <span className={`glass-badge text-xs ${
                        indicator.impact === 'positive' ? 'glass-badge-stable' :
                        indicator.impact === 'negative' ? 'glass-badge-critical' :
                        'glass-badge'
                      }`}>
                        {indicator.impact}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">{indicator.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Clinical Pearls */}
          <div className="glass-card p-6 gradient-overlay-accent">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="h-6 w-6 text-amber-600" />
              <h3 className="text-lg font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Clinical Pearls
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {analysis.clinicalPearls.map((pearl, idx) => (
                <div key={idx} className="glass-card-subtle p-4 rounded-xl">
                  <p className="text-sm text-gray-700 leading-relaxed">{pearl}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Monitoring Plan */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">Monitoring Plan</h3>
            </div>
            <div className="space-y-2">
              {analysis.monitoringPlan.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 glass-card-subtle p-3 rounded-lg">
                  <div className="glass-badge-info p-1 rounded flex-shrink-0 mt-0.5">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <span className="text-sm text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!analysis && !analyzing && (
        <div className="glass-card p-16 text-center">
          <div className="glass-card-subtle p-8 rounded-3xl inline-block mb-4">
            <Brain className="h-16 w-16 text-gray-400 mx-auto" />
          </div>
          <p className="text-gray-700 text-lg font-medium">No AI analysis yet</p>
          <p className="text-sm text-gray-500 mt-2">
            Click "Run AI Analysis" to get intelligent diagnosis suggestions
          </p>
        </div>
      )}
    </div>
  );
}
