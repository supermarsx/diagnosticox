import { useState, useEffect } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Brain, 
  History,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Target
} from 'lucide-react';
import { apiService } from '../services/apiService';

interface GuardrailPanelProps {
  patientId: string;
  problemId: string;
}

export function GuardrailPanel({ patientId, problemId }: GuardrailPanelProps) {
  const [guardrails, setGuardrails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [formData, setFormData] = useState({
    guardrail_type: 'cognitive_bias',
    checkpoint_question: 'Confirmation Bias: Have I actively looked for evidence that refutes my top hypothesis?',
    precommit_prediction: '',
    alternative_hypotheses: '',
    disconfirming_evidence: '',
    checkpoint_passed: true,
    notes: ''
  });

  useEffect(() => {
    loadGuardrails();
  }, [problemId]);

  const loadGuardrails = async () => {
    setLoading(true);
    try {
      const data = await apiService.requestPublic<any>(`/bias/patient/${patientId}`);
      setGuardrails(data.guardrails?.filter((g: any) => g.problem_id === problemId) || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.requestPublic('/bias', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          patient_id: patientId,
          problem_id: problemId,
          alternative_hypotheses: formData.alternative_hypotheses.split(',').map(s => s.trim()).filter(Boolean),
          disconfirming_evidence: formData.disconfirming_evidence.split(',').map(s => s.trim()).filter(Boolean),
        })
      });
      setShowNewForm(false);
      loadGuardrails();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const biasQuestions = [
    { type: 'cognitive_bias', q: 'Confirmation Bias: Have I actively looked for evidence that refutes my top hypothesis?' },
    { type: 'cognitive_bias', q: 'Anchoring Bias: Am I over-relying on the first piece of information I received?' },
    { type: 'cognitive_bias', q: 'Availability Bias: Is this diagnosis top-of-mind just because I saw a similar case recently?' },
    { type: 'cognitive_bias', q: 'Premature Closure: Am I stopping the diagnostic process too early?' }
  ];

  if (loading) return <div className="p-8 text-center animate-pulse">Loading guardrails...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 gradient-overlay-accent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="glass-card-strong p-3 rounded-2xl">
              <Shield className="h-8 w-8 text-amber-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Bias Guardrails
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Cognitive debiasing and structured checkpointing
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowNewForm(!showNewForm)}
            className="glass-button-primary flex items-center gap-2"
          >
            {showNewForm ? 'Cancel' : (
              <>
                <Brain className="h-5 w-5" />
                New Checkpoint
              </>
            )}
          </button>
        </div>
      </div>

      {/* New Checkpoint Form */}
      {showNewForm && (
        <div className="glass-card p-6 animate-in slide-in-from-top-4">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Structured Debiasing Checkpoint</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Select Checkpoint Type</label>
              <select 
                className="glass-input w-full"
                value={formData.checkpoint_question}
                onChange={e => setFormData({ ...formData, checkpoint_question: e.target.value })}
              >
                {biasQuestions.map(bq => (
                  <option key={bq.q} value={bq.q}>{bq.q}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Pre-test Prediction</label>
                <textarea 
                  className="glass-input w-full h-24" 
                  placeholder="What do you expect the next test to show?"
                  value={formData.precommit_prediction}
                  onChange={e => setFormData({ ...formData, precommit_prediction: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Alternative Hypotheses</label>
                <textarea 
                  className="glass-input w-full h-24" 
                  placeholder="List at least 2 plausible alternatives (comma separated)"
                  value={formData.alternative_hypotheses}
                  onChange={e => setFormData({ ...formData, alternative_hypotheses: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Disconfirming Evidence</label>
              <input 
                className="glass-input w-full" 
                placeholder="What evidence would prove your primary diagnosis wrong?"
                value={formData.disconfirming_evidence}
                onChange={e => setFormData({ ...formData, disconfirming_evidence: e.target.value })}
              />
            </div>

            <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
              <input 
                type="checkbox" 
                id="passed" 
                className="w-5 h-5 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                checked={formData.checkpoint_passed}
                onChange={e => setFormData({ ...formData, checkpoint_passed: e.target.checked })}
              />
              <label htmlFor="passed" className="text-sm font-medium text-amber-900">
                I have reviewed my reasoning for potential cognitive biases
              </label>
            </div>

            <div className="flex justify-end pt-4">
              <button type="submit" className="glass-button-primary px-8">
                Commit Checkpoint
              </button>
            </div>
          </form>
        </div>
      )}

      {/* History of Guardrails */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
          <History className="h-4 w-4" />
          Checkpoint History
        </h3>
        
        {guardrails.length === 0 ? (
          <div className="glass-card-subtle p-12 text-center border-dashed">
            <Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No bias guardrails recorded for this problem.</p>
          </div>
        ) : (
          guardrails.map((g, idx) => (
            <div key={g.id} className="glass-card p-5 hover-lift">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3">
                  <div className={`p-2 rounded-lg ${g.checkpoint_passed ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 leading-tight">{g.checkpoint_question}</h4>
                    <p className="text-xs text-gray-500 mt-1">{new Date(g.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <div className="glass-badge-info text-[10px]">{g.guardrail_type}</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pre-commitment</p>
                  <p className="text-xs text-gray-700 italic">"{g.precommit_prediction || 'N/A'}"</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Alternatives Considered</p>
                  <div className="flex flex-wrap gap-1">
                    {JSON.parse(g.alternative_hypotheses || '[]').map((h: string) => (
                      <span key={h} className="glass-badge text-[9px] px-1.5 py-0.5">{h}</span>
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Disconfirming evidence</p>
                  <div className="flex flex-wrap gap-1">
                    {JSON.parse(g.disconfirming_evidence || '[]').map((e: string) => (
                      <span key={e} className="glass-badge-warning text-[9px] px-1.5 py-0.5">{e}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
