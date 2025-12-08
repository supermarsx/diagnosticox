/**
 * VINDICATE-M Diagnostic Framework Page
 * 
 * Comprehensive clinical diagnostic tool using the VINDICATE-M mnemonic system
 * with Bayesian probability calculations, evidence-based scoring, and treatment protocols.
 * 
 * @module VindicatemDiagnosisPage
 */

import { useState } from 'react';
import { 
  Activity, Brain, AlertCircle, TrendingUp, FileText, 
  Calculator, Pill, TestTube, ChevronRight, CheckCircle
} from 'lucide-react';
import { vindicatemService, VindicateCategory } from '../services/vindicatemService';
import type { 
  BayesianCalculation, 
  TreatmentTrial 
} from '../services/vindicatemService';

/**
 * Main VINDICATE-M diagnosis page component
 */
export default function VindicatemDiagnosisPage() {
  const [activeTab, setActiveTab] = useState<'diagnosis' | 'bayesian' | 'treatment'>('diagnosis');
  const [selectedCategory, setSelectedCategory] = useState<VindicateCategory | null>(null);
  const [symptoms, setSymptoms] = useState('');
  const [age, setAge] = useState(45);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [diagnosticResults, setDiagnosticResults] = useState<any>(null);
  const [bayesianResult, setBayesianResult] = useState<BayesianCalculation | null>(null);
  const [treatmentTrial, setTreatmentTrial] = useState<TreatmentTrial | null>(null);
  const [loading, setLoading] = useState(false);

  // VINDICATE-M categories
  const categories = vindicatemService.getCategories();

  const handleDiagnosticAnalysis = async () => {
    if (!symptoms.trim()) {
      alert('Please enter symptoms');
      return;
    }

    setLoading(true);
    try {
      const result = vindicatemService.analyzeDifferentialDiagnosis({
        symptoms: symptoms.split(',').map(s => s.trim()),
        age,
        gender,
        duration: '2 weeks',
        severity: 'moderate'
      });
      setDiagnosticResults(result);
    } catch (error) {
      console.error('Diagnostic analysis failed:', error);
      alert('Failed to analyze diagnosis');
    } finally {
      setLoading(false);
    }
  };

  const handleBayesianCalculation = () => {
    if (!diagnosticResults?.differentials?.[0]) {
      alert('Please run diagnostic analysis first');
      return;
    }

    const topDiagnosis = diagnosticResults.differentials[0];
    const result = vindicatemService.calculateBayesianProbability({
      priorProbability: topDiagnosis.probability,
      sensitivity: 0.85,
      specificity: 0.90,
      testResult: true
    });

    setBayesianResult(result);
  };

  const handleTreatmentTrial = () => {
    if (!diagnosticResults?.differentials?.[0]) {
      alert('Please run diagnostic analysis first');
      return;
    }

    const topDiagnosis = diagnosticResults.differentials[0];
    const trial = vindicatemService.designTreatmentTrial({
      diagnosis: topDiagnosis.condition,
      confidence: topDiagnosis.probability,
      severity: 'moderate',
      contraindications: []
    });

    setTreatmentTrial(trial);
  };

  const getCategoryColor = (category: VindicateCategory) => {
    const colors: Record<VindicateCategory, string> = {
      vascular: 'text-red-600 bg-red-50',
      infectious: 'text-orange-600 bg-orange-50',
      neoplastic: 'text-purple-600 bg-purple-50',
      degenerative: 'text-blue-600 bg-blue-50',
      intoxication: 'text-yellow-600 bg-yellow-50',
      congenital: 'text-pink-600 bg-pink-50',
      autoimmune: 'text-indigo-600 bg-indigo-50',
      traumatic: 'text-gray-600 bg-gray-50',
      endocrine: 'text-green-600 bg-green-50',
      mechanical: 'text-teal-600 bg-teal-50'
    };
    return colors[category];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">VINDICATE-M Framework</h1>
              <p className="text-sm text-gray-600 mt-1">
                Clinical Diagnostic Mnemonic with Bayesian Analysis
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mt-6">
            <button
              onClick={() => setActiveTab('diagnosis')}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === 'diagnosis'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Diagnostic Analysis
              </div>
            </button>
            <button
              onClick={() => setActiveTab('bayesian')}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === 'bayesian'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                Bayesian Calculator
              </div>
            </button>
            <button
              onClick={() => setActiveTab('treatment')}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === 'treatment'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Pill className="w-4 h-4" />
                Treatment Trials
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Diagnostic Analysis Tab */}
        {activeTab === 'diagnosis' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Section */}
            <div className="lg:col-span-1">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Patient Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Symptoms (comma-separated)
                    </label>
                    <textarea
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., chest pain, shortness of breath, fatigue"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Age: {age} years
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={age}
                      onChange={(e) => setAge(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender
                    </label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setGender('male')}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                          gender === 'male'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Male
                      </button>
                      <button
                        onClick={() => setGender('female')}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                          gender === 'female'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Female
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleDiagnosticAnalysis}
                    disabled={loading}
                    className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {loading ? 'Analyzing...' : 'Analyze Diagnosis'}
                  </button>
                </div>

                {/* VINDICATE-M Categories */}
                <div className="mt-8">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Categories</h3>
                  <div className="space-y-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.category}
                        onClick={() => setSelectedCategory(cat.category)}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                          selectedCategory === cat.category
                            ? 'bg-blue-50 border-2 border-blue-600'
                            : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <div className="font-medium text-gray-900">{cat.name}</div>
                        <div className="text-xs text-gray-600 mt-1">{cat.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Results Section */}
            <div className="lg:col-span-2">
              {diagnosticResults ? (
                <div className="space-y-6">
                  {/* Differential Diagnoses */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      Differential Diagnoses
                    </h2>
                    <div className="space-y-3">
                      {diagnosticResults.differentials.map((diff: any, idx: number) => (
                        <div
                          key={idx}
                          className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="font-semibold text-gray-900">{diff.condition}</div>
                              <span className={`inline-block px-2 py-1 rounded-md text-xs font-medium mt-1 ${
                                getCategoryColor(diff.category)
                              }`}>
                                {diff.category.replace('_', ' ').toUpperCase()}
                              </span>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-blue-600">
                                {(diff.probability * 100).toFixed(1)}%
                              </div>
                              <div className="text-xs text-gray-600">Probability</div>
                            </div>
                          </div>
                          <div className="mt-3">
                            <div className="text-sm text-gray-700 mb-2">Supporting Evidence:</div>
                            <div className="flex flex-wrap gap-2">
                              {diff.supportingEvidence.map((ev: string, i: number) => (
                                <span key={i} className="px-2 py-1 bg-white rounded-md text-xs text-gray-700 border border-gray-200">
                                  {ev}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommended Tests */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <TestTube className="w-5 h-5 text-purple-600" />
                      Recommended Diagnostic Tests
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {diagnosticResults.recommendedTests.map((test: any, idx: number) => (
                        <div key={idx} className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                          <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5" />
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{test.test}</div>
                              <div className="text-sm text-gray-600 mt-1">{test.rationale}</div>
                              <div className="mt-2 flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-white rounded text-xs font-medium text-purple-600 border border-purple-200">
                                  Priority: {test.priority}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-12">
                  <div className="text-center">
                    <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">Enter patient information and click "Analyze Diagnosis" to begin</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bayesian Calculator Tab */}
        {activeTab === 'bayesian' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Bayesian Probability Calculator</h2>
              
              <div className="bg-blue-50 rounded-xl p-6 mb-6 border border-blue-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 mb-2">How it works:</div>
                    <p className="text-sm text-gray-700">
                      Updates diagnostic probability based on test sensitivity, specificity, and prior probability.
                      Uses Bayes' theorem to calculate post-test probability.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleBayesianCalculation}
                disabled={!diagnosticResults}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 mb-6"
              >
                Calculate Bayesian Probability
              </button>

              {bayesianResult && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                      <div className="text-sm text-gray-600 mb-1">Prior Probability</div>
                      <div className="text-3xl font-bold text-blue-600">
                        {(bayesianResult.priorProbability * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                      <div className="text-sm text-gray-600 mb-1">Posterior Probability</div>
                      <div className="text-3xl font-bold text-purple-600">
                        {(bayesianResult.posteriorProbability * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Likelihood Ratio</div>
                        <div className="text-xl font-bold text-gray-900">
                          {bayesianResult.likelihoodRatio.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Prior Odds</div>
                        <div className="text-xl font-bold text-gray-900">
                          {bayesianResult.priorOdds.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Posterior Odds</div>
                        <div className="text-xl font-bold text-gray-900">
                          {bayesianResult.posteriorOdds.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-gray-900 mb-1">Clinical Interpretation</div>
                        <p className="text-sm text-gray-700">{bayesianResult.interpretation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Treatment Trial Tab */}
        {activeTab === 'treatment' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Treatment Trial Protocol</h2>
              
              <button
                onClick={handleTreatmentTrial}
                disabled={!diagnosticResults}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 mb-6"
              >
                Design Treatment Trial
              </button>

              {treatmentTrial && (
                <div className="space-y-6">
                  <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                    <h3 className="font-semibold text-gray-900 mb-2">Trial Design: {treatmentTrial.approach}</h3>
                    <p className="text-sm text-gray-700">{treatmentTrial.rationale}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Treatment Phases</h3>
                    <div className="space-y-4">
                      {treatmentTrial.phases.map((phase, idx) => (
                        <div key={idx} className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
                          <div className="flex items-start gap-4">
                            <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                              {idx + 1}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 mb-2">Phase {idx + 1}</div>
                              <div className="text-sm text-gray-700 mb-3">{phase.intervention}</div>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white rounded-lg p-3 border border-gray-200">
                                  <div className="text-xs text-gray-600 mb-1">Duration</div>
                                  <div className="font-medium text-gray-900">{phase.duration}</div>
                                </div>
                                <div className="bg-white rounded-lg p-3 border border-gray-200">
                                  <div className="text-xs text-gray-600 mb-1">Success Criteria</div>
                                  <div className="font-medium text-gray-900">{phase.successCriteria}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                      Monitoring Parameters
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {treatmentTrial.monitoringParameters.map((param, idx) => (
                        <div key={idx} className="bg-white rounded-lg p-3 border border-yellow-200">
                          <div className="flex items-center gap-2">
                            <ChevronRight className="w-4 h-4 text-yellow-600" />
                            <span className="text-sm text-gray-700">{param}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
