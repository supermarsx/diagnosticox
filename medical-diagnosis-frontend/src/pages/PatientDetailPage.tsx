import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, Plus, AlertCircle, TrendingUp, Calendar, Users, Brain, Shield } from 'lucide-react';
import { apiService } from '../services/apiService';
import { TimelineVisualization } from '../components/TimelineVisualization';
import { AIDiagnosisPanel } from '../components/AIDiagnosisPanel';
import { ClinicalDecisionSupport } from '../components/ClinicalDecisionSupport';
import type { Patient, Problem, Hypothesis, Trial, TimelineEvent } from '../types/medical';

interface PatientDetailPageProps {
  user: any;
}

export default function PatientDetailPage({ user }: PatientDetailPageProps) {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);
  const [trials, setTrials] = useState<Trial[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'problems' | 'trials' | 'ai-analysis' | 'treatment' | 'timeline'>('overview');

  useEffect(() => {
    if (patientId) {
      loadPatientData();
    }
  }, [patientId]);

  const loadPatientData = async () => {
    if (!patientId) return;
    
    setLoading(true);
    setError(null);

    try {
      // Load patient
      const patientData = await apiService.getPatient(patientId);
      setPatient(patientData);

      // Load problems
      const problemsData = await apiService.getProblems(patientId);
      setProblems(problemsData.problems || []);

      // Load hypotheses for first problem
      if (problemsData.problems && problemsData.problems.length > 0) {
        const hypothesesData = await apiService.getHypotheses(problemsData.problems[0].id);
        setHypotheses(hypothesesData.hypotheses || []);
      }

      // Load trials
      const trialsData = await apiService.getTrials(patientId);
      setTrials(trialsData.trials || []);

      // Load timeline
      const timelineData = await apiService.getTimelineEvents(patientId);
      setTimelineEvents(timelineData.events || []);

    } catch (err: any) {
      setError(err.message || 'Failed to load patient data');
      console.error('Failed to load patient data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-indigo-600 animate-spin"></div>
          </div>
          <p className="text-gray-700 font-medium">Loading patient data...</p>
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="glass-card p-8 text-center max-w-md">
          <div className="glass-badge-critical p-4 rounded-2xl inline-block mb-4">
            <AlertCircle className="h-12 w-12" />
          </div>
          <p className="text-gray-900 text-lg font-semibold mb-4">
            {error || 'Patient not found'}
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="glass-button-primary"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

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
                <div className="glass-card-subtle p-3 rounded-xl">
                  <Users className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {patient.first_name} {patient.last_name}
                  </h1>
                  <p className="text-sm text-gray-600">
                    MRN: {patient.mrn} | DOB: {patient.date_of_birth}
                  </p>
                </div>
              </div>
            </div>
            <Link
              to="/calculator"
              className="glass-button-primary inline-flex items-center gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              Bayesian Calculator
            </Link>
          </div>

          {/* Glass Tabs */}
          <div className="mt-4 flex gap-2 flex-wrap">
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'problems', label: 'Problems' },
              { key: 'ai-analysis', label: 'AI Analysis' },
              { key: 'treatment', label: 'Treatment' },
              { key: 'trials', label: 'Trials' },
              { key: 'timeline', label: 'Timeline' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-6 py-2.5 font-medium rounded-xl transition-all ${
                  activeTab === tab.key
                    ? 'glass-card-strong text-indigo-600 shadow-lg'
                    : 'glass-card-subtle text-gray-600 hover:text-gray-900 hover:glass-card'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Patient Info */}
            <div className="glass-card p-6 gradient-overlay-primary">
              <h3 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                Patient Information
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-card-subtle p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Gender</p>
                  <p className="text-base font-bold text-gray-900">{patient.gender}</p>
                </div>
                <div className="glass-card-subtle p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Phone</p>
                  <p className="text-base font-bold text-gray-900">{patient.contact_phone || 'N/A'}</p>
                </div>
                <div className="glass-card-subtle p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <p className="text-base font-bold text-gray-900 truncate">{patient.contact_email || 'N/A'}</p>
                </div>
                <div className="glass-card-subtle p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <span className="glass-badge-stable inline-block">
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-card hover-lift p-6 gradient-overlay-secondary">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium mb-2">Active Problems</p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                      {problems.length}
                    </p>
                  </div>
                  <div className="glass-card-subtle p-4 rounded-2xl">
                    <Activity className="h-8 w-8 text-orange-600" />
                  </div>
                </div>
              </div>
              <div className="glass-card hover-lift p-6 gradient-overlay-primary">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium mb-2">Active Trials</p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {trials.filter(t => t.status === 'active').length}
                    </p>
                  </div>
                  <div className="glass-card-subtle p-4 rounded-2xl">
                    <Activity className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="glass-card hover-lift p-6 gradient-overlay-accent">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium mb-2">Timeline Events</p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                      {timelineEvents.length}
                    </p>
                  </div>
                  <div className="glass-card-subtle p-4 rounded-2xl">
                    <Calendar className="h-8 w-8 text-green-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Problems Tab */}
        {activeTab === 'problems' && (
          <div className="space-y-6">
            <div className="glass-card p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Problems & Differential Diagnoses
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">Ranked by probability</p>
                </div>
                <button className="glass-button-primary flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add Problem
                </button>
              </div>
            </div>

            {problems.length === 0 ? (
              <div className="glass-card p-16 text-center">
                <div className="glass-card-subtle p-8 rounded-3xl inline-block mb-4">
                  <Activity className="h-16 w-16 text-gray-400 mx-auto" />
                </div>
                <p className="text-gray-700 text-lg font-medium">No active problems</p>
              </div>
            ) : (
              problems.map((problem) => (
                <div key={problem.id} className="glass-card p-6 hover-lift">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{problem.problem_name}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Type: {problem.problem_type} | Onset: {problem.onset_date || 'Unknown'}
                      </p>
                    </div>
                    <span className={`glass-badge ${
                      problem.status === 'active' ? 'glass-badge-warning' :
                      problem.status === 'resolved' ? 'glass-badge-stable' :
                      'glass-badge'
                    } px-4 py-2`}>
                      {problem.status}
                    </span>
                  </div>

                  {problem.clinical_context && (
                    <p className="text-gray-700 mb-4 glass-card-subtle p-3 rounded-xl">{problem.clinical_context}</p>
                  )}

                  {/* Hypotheses */}
                  <div className="mt-4">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-indigo-600" />
                      Differential Diagnoses
                    </h4>
                    <div className="space-y-3">
                      {hypotheses
                        .filter(h => h.problem_id === problem.id)
                        .sort((a, b) => b.current_probability - a.current_probability)
                        .map((hypothesis, index) => (
                          <div
                            key={hypothesis.id}
                            className="glass-card-subtle p-4 rounded-xl hover:glass-card transition-all"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-start gap-3 flex-1">
                                <div className="glass-button-primary w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0">
                                  <span className="text-sm font-bold">#{index + 1}</span>
                                </div>
                                <div className="flex-1">
                                  <h5 className="font-bold text-gray-900">{hypothesis.diagnosis_name}</h5>
                                  {hypothesis.diagnosis_code && (
                                    <span className="glass-badge text-xs mt-1 inline-block">
                                      ICD-10: {hypothesis.diagnosis_code}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                  {(hypothesis.current_probability * 100).toFixed(1)}%
                                </p>
                              </div>
                            </div>

                            <div className="glass-card-subtle rounded-full h-3 overflow-hidden">
                              <div
                                className="h-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
                                style={{ width: `${hypothesis.current_probability * 100}%` }}
                              />
                            </div>

                            {hypothesis.supporting_evidence && (
                              <p className="text-sm text-gray-700 mt-3 glass-card-subtle p-2 rounded-lg">
                                {hypothesis.supporting_evidence}
                              </p>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Trials Tab */}
        {activeTab === 'trials' && (
          <div className="space-y-6">
            <div className="glass-card p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Treatment Trials
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">Monitor therapeutic interventions</p>
                </div>
                <button className="glass-button-primary flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add Trial
                </button>
              </div>
            </div>

            {trials.length === 0 ? (
              <div className="glass-card p-16 text-center">
                <div className="glass-card-subtle p-8 rounded-3xl inline-block mb-4">
                  <Activity className="h-16 w-16 text-gray-400 mx-auto" />
                </div>
                <p className="text-gray-700 text-lg font-medium">No treatment trials</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {trials.map((trial) => (
                  <div key={trial.id} className="glass-card p-6 hover-lift">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{trial.trial_name}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Started: {new Date(trial.start_date).toLocaleDateString()} | 
                          Duration: {trial.planned_duration_days} days
                        </p>
                      </div>
                      <span className={`glass-badge px-4 py-2 ${
                        trial.status === 'active' ? 'glass-badge-stable' :
                        trial.status === 'completed' ? 'glass-badge-info' :
                        trial.status === 'stopped' ? 'glass-badge-critical' :
                        'glass-badge'
                      }`}>
                        {trial.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="glass-card-subtle p-4 rounded-xl">
                        <p className="text-sm text-gray-600 mb-1">Intervention</p>
                        <p className="font-bold text-gray-900">{trial.intervention}</p>
                      </div>
                      <div className="glass-card-subtle p-4 rounded-xl">
                        <p className="text-sm text-gray-600 mb-1">Primary Metric</p>
                        <p className="font-bold text-gray-900">{trial.primary_metric}</p>
                      </div>
                    </div>

                    {trial.target_improvement && (
                      <div className="glass-card-subtle p-4 rounded-xl mb-4">
                        <p className="text-sm text-gray-600 mb-1">Target Improvement</p>
                        <p className="text-gray-900 font-medium">{trial.target_improvement}</p>
                      </div>
                    )}

                    {trial.stop_rule && (
                      <div className="glass-badge-warning p-4 rounded-xl">
                        <p className="text-sm font-bold mb-1">Stop Rule</p>
                        <p className="text-sm">{trial.stop_rule}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* AI Analysis Tab */}
        {activeTab === 'ai-analysis' && (
          <AIDiagnosisPanel
            patientId={patientId!}
            symptoms={problems.map(p => p.problem_name)}
          />
        )}

        {/* Treatment Tab */}
        {activeTab === 'treatment' && (
          <ClinicalDecisionSupport
            diagnosis={hypotheses.length > 0 ? hypotheses[0].diagnosis_name : 'Rheumatoid Arthritis'}
            currentMedications={['methotrexate', 'nsaid']}
          />
        )}

        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <div className="space-y-6">
            <div className="glass-card p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Patient Timeline
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">Chronological medical events</p>
                </div>
                <button className="glass-button-primary flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add Event
                </button>
              </div>
            </div>

            <div className="glass-card p-6">
              <TimelineVisualization events={timelineEvents} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}