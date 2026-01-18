import { useState, useEffect } from 'react';
import { 
  Activity, 
  TrendingUp, 
  Plus, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  ArrowRight,
  Beaker,
  History,
  MessageSquare
} from 'lucide-react';
import { apiService } from '../services/apiService';
import type { Trial } from '../types/medical';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface TrialWorkspaceProps {
  trialId: string;
  onUpdate?: () => void;
}

export function TrialWorkspace({ trialId, onUpdate }: TrialWorkspaceProps) {
  const [trial, setTrial] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMetric, setNewMetric] = useState({ name: '', value: '' });

  useEffect(() => {
    loadTrial();
  }, [trialId]);

  const loadTrial = async () => {
    setLoading(true);
    try {
      const data = await apiService.requestPublic<any>(`/trials/${trialId}`);
      setTrial(data);
      if (data.metrics?.length > 0) {
        setNewMetric(prev => ({ ...prev, name: data.metrics[0].metric_name }));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMetric = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMetric.name || !newMetric.value) return;

    try {
      await apiService.requestPublic(`/trials/${trialId}/metrics`, {
        method: 'POST',
        body: JSON.stringify({
          metric_name: newMetric.name,
          metric_value: parseFloat(newMetric.value),
          measured_at: new Date().toISOString()
        })
      });
      setNewMetric({ ...newMetric, value: '' });
      loadTrial();
      if (onUpdate) onUpdate();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div className="p-8 text-center animate-pulse">Loading trial...</div>;
  if (!trial) return <div className="p-8 text-center">Trial not found</div>;

  const chartData = trial.metrics?.map((m: any) => ({
    date: new Date(m.measured_at).toLocaleDateString(),
    value: m.metric_value,
    timestamp: new Date(m.measured_at).getTime()
  })).sort((a: any, b: any) => a.timestamp - b.timestamp);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Trial Header */}
      <div className="glass-card p-6 border-l-4 border-l-blue-500">
        <div className="flex justify-between items-start">
          <div className="flex gap-4">
            <div className="glass-card-subtle p-4 rounded-2xl bg-blue-50/50">
              <Beaker className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-bold text-gray-900">{trial.trial_name}</h3>
                <span className={`glass-badge ${
                  trial.status === 'active' ? 'glass-badge-stable' : 'glass-badge-info'
                } px-3 py-1`}>
                  {trial.status}
                </span>
              </div>
              <p className="text-gray-600 mt-1">
                Intervention: <span className="font-bold text-gray-900">{trial.intervention}</span> ({trial.intervention_type})
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Planned Duration</div>
            <div className="text-lg font-black text-gray-900">{trial.planned_duration_days || 30} Days</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Metrics Visualization */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-bold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Response Tracking
              </h4>
              <div className="flex gap-2">
                {Array.from(new Set(trial.metrics?.map((m: any) => m.metric_name))).map((m: any) => (
                  <span key={m} className="glass-badge text-[10px]">{m}</span>
                ))}
              </div>
            </div>

            <div className="h-[300px] w-full">
              {chartData?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: '#9ca3af' }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: '#9ca3af' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '16px', 
                        border: 'none', 
                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                        fontSize: '12px'
                      }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#4f46e5" 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200">
                  <p className="text-gray-400 text-sm">No metrics recorded yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Metrics Add */}
          <div className="glass-card p-6">
            <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-widest">Record New Observation</h4>
            <form onSubmit={handleAddMetric} className="flex gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Metric Name (e.g. Pain NRS)"
                  value={newMetric.name}
                  onChange={e => setNewMetric({ ...newMetric, name: e.target.value })}
                  className="glass-input w-full py-2"
                />
              </div>
              <div className="w-32">
                <input
                  type="number"
                  placeholder="Value"
                  value={newMetric.value}
                  onChange={e => setNewMetric({ ...newMetric, value: e.target.value })}
                  className="glass-input w-full py-2"
                />
              </div>
              <button type="submit" className="glass-button-primary px-6">
                Add
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Trial Configuration & Logic */}
        <div className="space-y-6">
          {/* Trial Logic Card */}
          <div className="glass-card overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-100">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Protocol & Success Criteria</h4>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-xs font-bold text-indigo-600 uppercase mb-1">Primary Metric</p>
                <p className="text-sm font-medium text-gray-900">{trial.primary_metric || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-600 uppercase mb-1">Target Improvement</p>
                <p className="text-sm font-medium text-gray-900">{trial.target_improvement || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-red-600 uppercase mb-1">Stop Rule</p>
                <p className="text-sm font-medium text-gray-900 italic">"{trial.stop_rule || 'Default safety protocols apply'}"</p>
              </div>
            </div>
          </div>

          {/* Side Effects Monitoring */}
          <div className="glass-card p-5">
            <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              Monitoring List
            </h4>
            <div className="flex flex-wrap gap-2">
              {JSON.parse(trial.side_effects_to_monitor || '[]').map((se: string) => (
                <span key={se} className="glass-badge-warning text-[10px] px-2 py-1">{se}</span>
              ))}
              {JSON.parse(trial.side_effects_to_monitor || '[]').length === 0 && (
                <p className="text-xs text-gray-400 italic">No specific side effects flagged</p>
              )}
            </div>
          </div>

          {/* Decision Snippet */}
          <div className="glass-card p-5 gradient-overlay-primary">
            <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-indigo-600" />
              Trial Decision
            </h4>
            {trial.decision_point_reached ? (
              <div className="space-y-3">
                <div className={`p-3 rounded-xl font-bold text-center text-sm ${
                  trial.decision_outcome === 'successful' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                }`}>
                  OUTCOME: {trial.decision_outcome?.toUpperCase()}
                </div>
                <p className="text-xs text-gray-700 leading-relaxed">
                  {trial.clinical_notes || 'No decision reasoning recorded.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-gray-600">Decision point not yet reached based on current data.</p>
                <button className="w-full glass-button-primary py-2 text-xs flex items-center justify-center gap-2">
                  Complete Trial & Log Decision <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
