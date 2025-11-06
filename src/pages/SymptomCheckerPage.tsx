/**
 * Symptom Checker Page
 * 
 * Comprehensive symptom search, assessment, and differential diagnosis interface
 * with red flag detection and organ system classification.
 * 
 * @component
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  symptomService, 
  Symptom, 
  SymptomReport, 
  OrganSystem,
  SymptomDiagnosisMapping 
} from '../services/symptomService';
import { 
  Search, 
  AlertTriangle, 
  Activity, 
  TrendingUp, 
  Clock,
  MapPin,
  Plus,
  X
} from 'lucide-react';

interface SymptomSearchState {
  query: string;
  results: Symptom[];
  selectedSymptom: Symptom | null;
  loading: boolean;
}

export const SymptomCheckerPage: React.FC = () => {
  const { t } = useTranslation();
  
  const [search, setSearch] = useState<SymptomSearchState>({
    query: '',
    results: [],
    selectedSymptom: null,
    loading: false,
  });

  const [organSystem, setOrganSystem] = useState<OrganSystem | 'all'>('all');
  const [reportedSymptoms, setReportedSymptoms] = useState<SymptomReport[]>([]);
  const [currentReport, setCurrentReport] = useState<Partial<SymptomReport>>({});
  const [showReportForm, setShowReportForm] = useState(false);
  const [differentials, setDifferentials] = useState<SymptomDiagnosisMapping[]>([]);

  /**
   * Handle symptom search
   */
  const handleSearch = (query: string) => {
    setSearch(prev => ({ ...prev, query, loading: true }));

    if (!query.trim()) {
      setSearch(prev => ({ ...prev, results: [], loading: false }));
      return;
    }

    try {
      const results = symptomService.searchSymptoms(query);
      setSearch(prev => ({ ...prev, results, loading: false }));
    } catch (error) {
      console.error('Search error:', error);
      setSearch(prev => ({ ...prev, results: [], loading: false }));
    }
  };

  /**
   * Filter symptoms by organ system
   */
  const filteredSymptoms = organSystem === 'all' 
    ? search.results 
    : search.results.filter(s => s.organSystem.includes(organSystem));

  /**
   * Add symptom to reported symptoms
   */
  const handleAddSymptom = (symptom: Symptom) => {
    setSearch(prev => ({ ...prev, selectedSymptom: symptom }));
    setCurrentReport({
      symptomId: symptom.id,
      severity: 5,
      onset: new Date(),
      duration: '1 day',
      frequency: 'intermittent',
      progression: 'stable',
    });
    setShowReportForm(true);
  };

  /**
   * Save symptom report
   */
  const handleSaveReport = () => {
    if (currentReport.symptomId) {
      const newReport: SymptomReport = {
        symptomId: currentReport.symptomId,
        severity: currentReport.severity || 5,
        onset: currentReport.onset || new Date(),
        duration: currentReport.duration || '1 day',
        frequency: currentReport.frequency || 'intermittent',
        progression: currentReport.progression || 'stable',
        location: currentReport.location,
        characterization: currentReport.characterization,
        aggravatingFactors: currentReport.aggravatingFactors,
        relievingFactors: currentReport.relievingFactors,
        associatedSymptoms: currentReport.associatedSymptoms,
        notes: currentReport.notes,
      };

      setReportedSymptoms(prev => [...prev, newReport]);
      setShowReportForm(false);
      setCurrentReport({});
      setSearch(prev => ({ ...prev, selectedSymptom: null }));
    }
  };

  /**
   * Remove symptom from reported list
   */
  const handleRemoveSymptom = (index: number) => {
    setReportedSymptoms(prev => prev.filter((_, i) => i !== index));
  };

  /**
   * Analyze differential diagnoses when symptoms change
   */
  useEffect(() => {
    if (reportedSymptoms.length > 0) {
      const analysis = symptomService.generateDifferentialDiagnosis(reportedSymptoms);
      setDifferentials(analysis);
    } else {
      setDifferentials([]);
    }
  }, [reportedSymptoms]);

  /**
   * Get all red flags from reported symptoms
   */
  const allRedFlags = symptomService.checkRedFlags(reportedSymptoms);

  /**
   * Get organ systems enum for filtering
   */
  const organSystems = Object.values(OrganSystem);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            {t('symptom.title', 'Symptom Checker')}
          </h1>
          <p className="text-gray-300">
            Search symptoms, track severity, and analyze potential diagnoses
          </p>
        </div>

        {/* Red Flags Alert */}
        {allRedFlags.length > 0 && (
          <div className="mb-6 glass-card-strong border-2 border-red-500/50 bg-red-500/10">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-8 h-8 text-red-400 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-red-300 mb-3">
                    ⚠️ WARNING: Red Flags Detected
                  </h3>
                  <p className="text-red-200 mb-4">
                    The following symptoms require immediate medical attention:
                  </p>
                  <ul className="space-y-2">
                    {allRedFlags.map((flag, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-red-100">
                        <span className="text-red-400 font-bold">•</span>
                        <span>{flag.redFlag} ({flag.symptom})</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 p-3 bg-red-600/30 rounded-lg">
                    <p className="text-red-100 font-semibold">
                      SEEK EMERGENCY CARE IMMEDIATELY
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Search & Reported Symptoms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search Box */}
            <div className="glass-card-strong p-6">
              <div className="flex items-center gap-2 mb-4">
                <Search className="w-5 h-5 text-blue-400" />
                <h2 className="text-xl font-semibold">
                  {t('symptom.searchSymptoms', 'Search Symptoms')}
                </h2>
              </div>

              {/* Organ System Filter */}
              <div className="mb-4">
                <label className="block text-sm text-gray-300 mb-2">Filter by System:</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setOrganSystem('all')}
                    className={`px-3 py-1 rounded-lg text-sm transition-all ${
                      organSystem === 'all'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    All Systems
                  </button>
                  {organSystems.map((system) => (
                    <button
                      key={system}
                      onClick={() => setOrganSystem(system)}
                      className={`px-3 py-1 rounded-lg text-sm transition-all capitalize ${
                        organSystem === system
                          ? 'bg-blue-500 text-white'
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}
                    >
                      {system.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Input */}
              <input
                type="text"
                value={search.query}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Type symptom (e.g., headache, chest pain, fever)..."
                className="glass-input w-full"
              />

              {/* Search Results */}
              {filteredSymptoms.length > 0 && (
                <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
                  {filteredSymptoms.map((symptom) => (
                    <div
                      key={symptom.id}
                      className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all cursor-pointer hover-lift"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-white mb-1">{symptom.name}</h4>
                          <p className="text-sm text-gray-400 mb-2">{symptom.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {symptom.organSystem.map((sys) => (
                              <span
                                key={sys}
                                className="px-2 py-1 text-xs bg-blue-500/20 text-blue-300 rounded capitalize"
                              >
                                {sys.replace(/_/g, ' ')}
                              </span>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={() => handleAddSymptom(symptom)}
                          className="ml-4 p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-300 transition-all"
                          title="Add to my symptoms"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reported Symptoms List */}
            {reportedSymptoms.length > 0 && (
              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-5 h-5 text-green-400" />
                  <h2 className="text-xl font-semibold">
                    My Symptoms ({reportedSymptoms.length})
                  </h2>
                </div>
                <div className="space-y-3">
                  {reportedSymptoms.map((report, idx) => {
                    const symptom = symptomService.getSymptomById(report.symptomId);
                    if (!symptom) return null;

                    return (
                      <div
                        key={idx}
                        className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-white">{symptom.name}</h4>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                              <span className="flex items-center gap-1">
                                <TrendingUp className="w-4 h-4" />
                                Severity: {report.severity}/10
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {report.duration}
                              </span>
                              {report.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {report.location}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveSymptom(idx)}
                            className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-all"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded capitalize">
                            {report.frequency}
                          </span>
                          <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-300 rounded capitalize">
                            {report.progression}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Differential Diagnosis */}
            {differentials.length > 0 && (
              <div className="glass-card-strong p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Differential Diagnosis ({differentials.length})
                </h2>
                <div className="space-y-3">
                  {differentials.map((diff, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-400/30"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-1 text-xs font-mono bg-blue-500/30 text-blue-300 rounded">
                              {diff.icd10Code}
                            </span>
                            <span className="px-2 py-1 text-xs bg-purple-500/30 text-purple-300 rounded">
                              {diff.confidence}% confidence
                            </span>
                          </div>
                          <h4 className="font-semibold text-white text-lg">
                            {diff.diagnosisName}
                          </h4>
                        </div>
                      </div>
                      <p className="text-sm text-gray-300 mt-2">{diff.clinicalNotes}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Symptom Report Form */}
          <div className="lg:col-span-1">
            {showReportForm && search.selectedSymptom ? (
              <div className="glass-card-strong p-6 sticky top-6">
                <h2 className="text-xl font-semibold mb-4">
                  Report: {search.selectedSymptom.name}
                </h2>
                
                <div className="space-y-4">
                  {/* Severity */}
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">
                      Severity (0-10):
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={currentReport.severity || 5}
                      onChange={(e) => setCurrentReport(prev => ({
                        ...prev,
                        severity: parseInt(e.target.value)
                      }))}
                      className="w-full"
                    />
                    <div className="text-center text-2xl font-bold text-blue-300 mt-2">
                      {currentReport.severity || 5}
                    </div>
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Duration:</label>
                    <input
                      type="text"
                      value={currentReport.duration || ''}
                      onChange={(e) => setCurrentReport(prev => ({
                        ...prev,
                        duration: e.target.value
                      }))}
                      placeholder="e.g., 2 days, 1 week"
                      className="glass-input w-full"
                    />
                  </div>

                  {/* Frequency */}
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Frequency:</label>
                    <select
                      value={currentReport.frequency || 'intermittent'}
                      onChange={(e) => setCurrentReport(prev => ({
                        ...prev,
                        frequency: e.target.value as 'constant' | 'intermittent' | 'occasional'
                      }))}
                      className="glass-input w-full"
                    >
                      <option value="constant">Constant</option>
                      <option value="intermittent">Intermittent</option>
                      <option value="occasional">Occasional</option>
                    </select>
                  </div>

                  {/* Progression */}
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Progression:</label>
                    <select
                      value={currentReport.progression || 'stable'}
                      onChange={(e) => setCurrentReport(prev => ({
                        ...prev,
                        progression: e.target.value as 'improving' | 'stable' | 'worsening'
                      }))}
                      className="glass-input w-full"
                    >
                      <option value="improving">Improving</option>
                      <option value="stable">Stable</option>
                      <option value="worsening">Worsening</option>
                    </select>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">
                      Location (optional):
                    </label>
                    <input
                      type="text"
                      value={currentReport.location || ''}
                      onChange={(e) => setCurrentReport(prev => ({
                        ...prev,
                        location: e.target.value
                      }))}
                      placeholder="e.g., left chest, upper abdomen"
                      className="glass-input w-full"
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">
                      Additional Notes:
                    </label>
                    <textarea
                      value={currentReport.notes || ''}
                      onChange={(e) => setCurrentReport(prev => ({
                        ...prev,
                        notes: e.target.value
                      }))}
                      placeholder="Any other details..."
                      className="glass-input w-full h-20 resize-none"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveReport}
                      className="glass-button-primary flex-1"
                    >
                      Add Symptom
                    </button>
                    <button
                      onClick={() => {
                        setShowReportForm(false);
                        setCurrentReport({});
                      }}
                      className="glass-button px-4"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-card-strong p-6 sticky top-6">
                <h2 className="text-xl font-semibold mb-4">Instructions</h2>
                <div className="space-y-3 text-sm text-gray-300">
                  <p>1. Search for symptoms using the search box</p>
                  <p>2. Filter by organ system if needed</p>
                  <p>3. Click the + button to add a symptom</p>
                  <p>4. Fill out the symptom details</p>
                  <p>5. Review the differential diagnosis</p>
                  <p className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-yellow-200">
                    ⚠️ This tool is for educational purposes only. Always consult a healthcare professional for medical advice.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SymptomCheckerPage;
