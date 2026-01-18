import { useState, useEffect } from 'react';
import { 
  Activity, 
  TrendingUp, 
  Plus, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  Filter,
  ArrowRight
} from 'lucide-react';
import { apiService } from '../services/apiService';
import type { Problem, Hypothesis, Pivot } from '../types/medical';
import { GuardrailPanel } from './GuardrailPanel';
import { TestPlanner } from './TestPlanner';

interface ProblemWorkspaceProps {
  problem: Problem;
  onUpdate?: () => void;
}

export function ProblemWorkspace({ problem, onUpdate }: ProblemWorkspaceProps) {
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);
  const [pivots, setPivots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'differential' | 'guardrails' | 'testing'>('differential');
  const [closureValidation, setClosureValidation] = useState<{ can_close: boolean; message: string } | null>(null);

  useEffect(() => {
    loadData();
  }, [problem.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [hypData, pivotData, closureData] = await Promise.all([
        apiService.getHypotheses(problem.id),
        apiService.requestPublic<any>(`/patient-pivots/patient/${problem.patient_id}`),
        apiService.requestPublic<any>(`/problems/${problem.id}/validate-closure`)
      ]);
      setHypotheses(hypData.hypotheses || []);
      setClosureValidation(closureData);
      // Filter pivots related to this problem
      const filteredPivots = (pivotData.pivots || []).filter((p: any) => p.problem_id === problem.id);
      setPivots(filteredPivots);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveProblem = async () => {
    if (!closureValidation?.can_close) {
      alert(`Cannot resolve: ${closureValidation?.message}`);
      return;
    }

    if (window.confirm('Are you sure you want to resolve this problem? All criteria have been met.')) {
      try {
        await apiService.updateProblem(problem.id, { status: 'resolved' });
        if (onUpdate) onUpdate();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const getBucket = (prob: number) => {
    if (prob >= 0.7) return { label: 'High Probability', color: 'glass-badge-critical', bg: 'bg-red-50' };
    if (prob >= 0.3) return { label: 'Intermediate', color: 'glass-badge-warning', bg: 'bg-amber-50' };
    return { label: 'Low Probability', color: 'glass-badge-stable', bg: 'bg-emerald-50' };
  };

  if (loading) return <div className="p-8 text-center animate-pulse">Loading workspace...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Workspace Header */}
      <div className="glass-card p-6 border-l-4 border-l-indigo-500">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{problem.problem_name}</h3>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" /> Onset: {problem.onset_date || 'Unknown'}
              </span>
              <span className="flex items-center gap-1">
                <Filter className="h-4 w-4" /> Type: {problem.problem_type}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleResolveProblem}
              className={`glass-button py-2 flex items-center gap-2 ${
                closureValidation?.can_close ? 'text-emerald-600 border-emerald-200' : 'opacity-50 grayscale'
              }`}
              title={closureValidation?.message}
            >
              <CheckCircle2 className="h-4 w-4" /> Resolve Problem
            </button>
            <button className="glass-button-secondary py-2">Edit Problem</button>
            <button 
              onClick={() => setActiveTab('testing')}
              className="glass-button-primary py-2 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> New Test
            </button>
          </div>
        </div>
        {problem.clinical_context && (
          <p className="mt-4 p-4 bg-indigo-50/50 rounded-xl text-gray-700 italic border border-indigo-100/50">
            "{problem.clinical_context}"
          </p>
        )}

        {/* Sub-tabs */}
        <div className="mt-6 flex gap-4 border-t border-gray-100 pt-4">
          {[
            { id: 'differential', label: 'Differential Ranking' },
            { id: 'guardrails', label: 'Bias Guardrails' },
            { id: 'testing', label: 'Testing Plan' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`text-sm font-bold transition-all px-4 py-2 rounded-xl ${
                activeTab === tab.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                  : 'text-gray-500 hover:text-indigo-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'differential' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
          {/* Left Column: Differential Ranking (Bucketed) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-bold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-indigo-600" />
                Differential Diagnosis Ranking
              </h4>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last update: {new Date(problem.updated_at).toLocaleDateString()}
              </span>
            </div>

            {['High Probability', 'Intermediate', 'Low Probability'].map(bucketLabel => {
              const bucketHyps = hypotheses.filter(h => getBucket(h.current_probability).label === bucketLabel);
              if (bucketHyps.length === 0) return null;

              return (
                <div key={bucketLabel} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      bucketLabel === 'High Probability' ? 'bg-red-500' :
                      bucketLabel === 'Intermediate' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`} />
                    <h5 className="text-sm font-bold text-gray-700 uppercase tracking-wide">{bucketLabel}</h5>
                  </div>
                  
                  <div className="grid gap-3">
                    {bucketHyps.sort((a, b) => b.current_probability - a.current_probability).map((hyp, idx) => (
                      <div key={hyp.id} className="glass-card hover-lift p-4 group">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
                              #{idx + 1}
                            </div>
                            <div>
                              <h6 className="font-bold text-gray-900">{hyp.diagnosis_name}</h6>
                              <p className="text-xs text-gray-500">{hyp.diagnosis_code || 'No ICD code'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-black text-indigo-600">
                              {(hyp.current_probability * 100).toFixed(0)}%
                            </div>
                            <div className="text-[10px] text-gray-400 uppercase font-bold">Current Prob.</div>
                          </div>
                        </div>
                        
                        {/* Probability Bar */}
                        <div className="mt-4 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-1000 ease-out ${
                              bucketLabel === 'High Probability' ? 'bg-gradient-to-r from-red-500 to-orange-500' :
                              bucketLabel === 'Intermediate' ? 'bg-gradient-to-r from-amber-500 to-orange-400' : 
                              'bg-gradient-to-r from-emerald-500 to-teal-400'
                            }`}
                            style={{ width: `${hyp.current_probability * 100}%` }}
                          />
                        </div>

                        <div className="mt-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:underline">
                            View Evidence <ChevronRight className="h-3 w-3" />
                          </button>
                          <button className="text-xs font-bold text-gray-500 hover:text-red-600 transition-colors">
                            Rule Out
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Case Pivots */}
          <div className="space-y-8">
            <section>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold flex items-center gap-2">
                  <Activity className="h-5 w-5 text-indigo-600" />
                  Case Pivots
                </h4>
                <button className="glass-badge-info p-1 hover:scale-110 transition-transform">
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3">
                {pivots.length === 0 ? (
                  <div className="glass-card-subtle p-6 text-center border-dashed">
                    <p className="text-sm text-gray-500">No pivots recorded for this case</p>
                  </div>
                ) : (
                  pivots.map(pivot => (
                    <div key={pivot.id} className="glass-card p-4 border-l-2 border-indigo-400">
                      <div className="flex justify-between items-start">
                        <h6 className="font-bold text-gray-900 text-sm">{pivot.pivot_name}</h6>
                        {pivot.meets_threshold === 1 ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-amber-500" />
                        )}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                          {pivot.measured_value}
                        </span>
                        <span className="text-[10px] text-gray-400 uppercase font-bold">Measured</span>
                      </div>
                      {pivot.note && <p className="mt-2 text-xs text-gray-600 line-clamp-2">{pivot.note}</p>}
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      )}

      {activeTab === 'guardrails' && (
        <div className="animate-in fade-in duration-300">
          <GuardrailPanel patientId={problem.patient_id} problemId={problem.id} />
        </div>
      )}

      {activeTab === 'testing' && (
        <div className="animate-in fade-in duration-300">
          <TestPlanner 
            patientId={problem.patient_id} 
            problemId={problem.id} 
            hypotheses={hypotheses}
            onUpdate={loadData}
          />
        </div>
      )}
    </div>
  );
}
