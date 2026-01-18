import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, Plus, AlertCircle, TrendingUp, Calendar, Users, Brain, Shield } from 'lucide-react';
import { apiService } from '../services/apiService';
import { TimelineVisualization } from '../components/TimelineVisualization';
import { AIDiagnosisPanel } from '../components/AIDiagnosisPanel';
import { ClinicalDecisionSupport } from '../components/ClinicalDecisionSupport';
import { ProblemWorkspace } from '../components/ProblemWorkspace';
import { TrialWorkspace } from '../components/TrialWorkspace';
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
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(null);
  const [selectedTrialId, setSelectedTrialId] = useState<string | null>(null);

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
      if (problemsData.problems && problemsData.problems.length > 0) {
        setSelectedProblemId(problemsData.problems[0].id);
      }

      // Load hypotheses for first problem
      if (problemsData.problems && problemsData.problems.length > 0) {
        const hypothesesData = await apiService.getHypotheses(problemsData.problems[0].id);
        setHypotheses(hypothesesData.hypotheses || []);
      }

      // Load trials
      const trialsData = await apiService.getTrials(patientId);
      setTrials(trialsData.trials || []);
      if (trialsData.trials && trialsData.trials.length > 0) {
        setSelectedTrialId(trialsData.trials[0].id);
      }

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
              { key: 'problems', label: 'Problem Workspace' },
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Side Sidebar: Problem List */}
            <div className="md:col-span-1 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Problems</h2>
                <button className="glass-badge-info p-1 hover:scale-110 transition-transform">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              
              {problems.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No active problems</p>
              ) : (
                problems.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProblemId(p.id)}
                    className={`w-full text-left p-4 rounded-2xl transition-all ${
                      selectedProblemId === p.id 
                        ? 'glass-card-strong border-l-4 border-l-indigo-600 shadow-md translate-x-1' 
                        : 'glass-card hover:bg-white/50'
                    }`}
                  >
                    <p className={`font-bold text-sm ${selectedProblemId === p.id ? 'text-indigo-600' : 'text-gray-900'}`}>
                      {p.problem_name}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-tighter">
                      {p.problem_type} • {p.status}
                    </p>
                  </button>
                ))
              )}
            </div>

            {/* Main Content: Problem Workspace */}
            <div className="md:col-span-3">
              {selectedProblemId ? (
                <ProblemWorkspace 
                  problem={problems.find(p => p.id === selectedProblemId)!} 
                  onUpdate={loadPatientData}
                />
              ) : (
                <div className="glass-card p-16 text-center">
                  <div className="glass-card-subtle p-8 rounded-3xl inline-block mb-4">
                    <Activity className="h-16 w-16 text-gray-400 mx-auto" />
                  </div>
                  <p className="text-gray-700 text-lg font-medium">Select a problem to view workspace</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Trials Tab */}
        {activeTab === 'trials' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Side Sidebar: Trial List */}
            <div className="md:col-span-1 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Treatment Trials</h2>
                <button className="glass-badge-info p-1 hover:scale-110 transition-transform">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              
              {trials.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No treatment trials</p>
              ) : (
                trials.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTrialId(t.id)}
                    className={`w-full text-left p-4 rounded-2xl transition-all ${
                      selectedTrialId === t.id 
                        ? 'glass-card-strong border-l-4 border-l-blue-600 shadow-md translate-x-1' 
                        : 'glass-card hover:bg-white/50'
                    }`}
                  >
                    <p className={`font-bold text-sm ${selectedTrialId === t.id ? 'text-blue-600' : 'text-gray-900'}`}>
                      {t.trial_name}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">
                        {t.status}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {new Date(t.start_date).toLocaleDateString()}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Main Content: Trial Workspace */}
            <div className="md:col-span-3">
              {selectedTrialId ? (
                <TrialWorkspace 
                  trialId={selectedTrialId} 
                  onUpdate={loadPatientData}
                />
              ) : (
                <div className="glass-card p-16 text-center">
                  <div className="glass-card-subtle p-8 rounded-3xl inline-block mb-4">
                    <Beaker className="h-16 w-16 text-gray-400 mx-auto" />
                  </div>
                  <p className="text-gray-700 text-lg font-medium">Select a trial to monitor response</p>
                </div>
              )}
            </div>
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
