import { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  Plus, 
  Beaker, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FileText,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { apiService } from '../services/apiService';

interface TestPlannerProps {
  patientId: string;
  problemId: string;
  hypotheses: any[];
  onUpdate?: () => void;
}

export function TestPlanner({ patientId, problemId, hypotheses, onUpdate }: TestPlannerProps) {
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showResultForm, setShowResultForm] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    test_name: '',
    test_type: 'lab_test',
    tier: 1,
    hypothesis_id: '',
    clinical_rationale: '',
    pretest_probability: 0.5
  });
  const [resultData, setResultData] = useState({
    result_value: '',
    result_interpretation: 'normal',
    actual_posttest_probability: 0.5
  });

  useEffect(() => {
    loadTests();
  }, [problemId]);

  const loadTests = async () => {
    setLoading(true);
    try {
      const data = await apiService.requestPublic<any>(`/tests/problem/${problemId}`);
      setTests(data.tests || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.requestPublic('/tests/orders', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          patient_id: patientId,
          problem_id: problemId
        })
      });
      setShowOrderForm(false);
      loadTests();
      if (onUpdate) onUpdate();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRecordResult = async (e: React.FormEvent, orderId: string) => {
    e.preventDefault();
    try {
      await apiService.requestPublic(`/tests/orders/${orderId}/results`, {
        method: 'POST',
        body: JSON.stringify(resultData)
      });
      setShowResultForm(null);
      loadTests();
      if (onUpdate) onUpdate();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div className="p-8 text-center animate-pulse">Loading testing plan...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-bold flex items-center gap-2 text-gray-900">
          <ClipboardList className="h-5 w-5 text-indigo-600" />
          Diagnostic Testing Strategy
        </h4>
        <button 
          onClick={() => setShowOrderForm(!showOrderForm)}
          className="glass-button-primary py-2 flex items-center gap-2"
        >
          {showOrderForm ? 'Cancel' : (
            <>
              <Plus className="h-4 w-4" /> Order New Test
            </>
          )}
        </button>
      </div>

      {/* Order Form */}
      {showOrderForm && (
        <div className="glass-card p-6 animate-in slide-in-from-top-4 border-2 border-indigo-100">
          <h5 className="font-bold text-gray-900 mb-4">Plan New Diagnostic Test</h5>
          <form onSubmit={handleCreateOrder} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Test Name</label>
                <input 
                  className="glass-input w-full" 
                  placeholder="e.g. TSH, Chest X-Ray"
                  value={formData.test_name}
                  onChange={e => setFormData({ ...formData, test_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Target Hypothesis</label>
                <select 
                  className="glass-input w-full"
                  value={formData.hypothesis_id}
                  onChange={e => setFormData({ ...formData, hypothesis_id: e.target.value })}
                  required
                >
                  <option value="">Select a hypothesis...</option>
                  {hypotheses.map(h => (
                    <option key={h.id} value={h.id}>{h.diagnosis_name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Tier</label>
                <select 
                  className="glass-input w-full"
                  value={formData.tier}
                  onChange={e => setFormData({ ...formData, tier: parseInt(e.target.value) })}
                >
                  <option value={1}>Tier 1: Screening / Basic</option>
                  <option value={2}>Tier 2: Specialized</option>
                  <option value={3}>Tier 3: Invasive / High Cost</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Test Type</label>
                <select 
                  className="glass-input w-full"
                  value={formData.test_type}
                  onChange={e => setFormData({ ...formData, test_type: e.target.value })}
                >
                  <option value="lab_test">Laboratory</option>
                  <option value="imaging">Imaging</option>
                  <option value="biopsy">Biopsy</option>
                  <option value="functional">Functional</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Pre-test Prob.</label>
                <input 
                  type="number" step="0.01" min="0" max="1"
                  className="glass-input w-full"
                  value={formData.pretest_probability}
                  onChange={e => setFormData({ ...formData, pretest_probability: parseFloat(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Clinical Rationale</label>
              <textarea 
                className="glass-input w-full h-20" 
                placeholder="Why is this test indicated now?"
                value={formData.clinical_rationale}
                onChange={e => setFormData({ ...formData, clinical_rationale: e.target.value })}
              />
            </div>

            <div className="flex justify-end pt-2">
              <button type="submit" className="glass-button-primary px-8">
                Confirm Order
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Test List */}
      <div className="space-y-4">
        {[1, 2, 3].map(tier => {
          const tierTests = tests.filter(t => t.tier === tier);
          if (tierTests.length === 0 && tier > 1) return null;

          return (
            <div key={tier} className="space-y-3">
              <h5 className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Tier {tier} Tests</h5>
              
              {tierTests.length === 0 ? (
                <div className="glass-card-subtle p-4 text-center border-dashed">
                  <p className="text-xs text-gray-400 italic">No tests planned for Tier {tier}</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {tierTests.map(test => (
                    <div key={test.id} className="glass-card p-5 hover-lift border-l-4 border-l-indigo-400">
                      <div className="flex justify-between items-start">
                        <div className="flex gap-4">
                          <div className={`p-3 rounded-2xl ${test.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                            <Beaker className="h-6 w-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-3">
                              <h6 className="font-bold text-gray-900">{test.test_name}</h6>
                              <span className={`glass-badge text-[10px] ${
                                test.status === 'completed' ? 'glass-badge-stable' : 'glass-badge-warning'
                              }`}>
                                {test.status}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Ordered: {new Date(test.ordered_at).toLocaleDateString()} • Type: {test.test_type}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Impact</p>
                          <div className="flex items-center gap-1 text-indigo-600 font-bold">
                            <TrendingUp className="h-3 w-3" />
                            <span className="text-sm">{(test.pretest_probability * 100).toFixed(0)}% → {(test.actual_posttest_probability ? test.actual_posttest_probability * 100 : '?').toFixed(0)}%</span>
                          </div>
                        </div>
                      </div>

                      {test.clinical_rationale && (
                        <div className="mt-4 flex items-start gap-2 p-3 bg-gray-50 rounded-xl">
                          <FileText className="h-3 w-3 text-gray-400 mt-0.5" />
                          <p className="text-xs text-gray-600 italic">"{test.clinical_rationale}"</p>
                        </div>
                      )}

                      {test.status === 'completed' ? (
                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            <span className="text-xs font-bold text-gray-900">Result: {test.result_value}</span>
                            <span className={`glass-badge text-[9px] ${
                              test.result_interpretation === 'abnormal' ? 'glass-badge-critical' : 'glass-badge-stable'
                            }`}>
                              {test.result_interpretation}
                            </span>
                          </div>
                          <span className="text-[10px] text-gray-400 font-medium">Received: {new Date(test.resulted_at).toLocaleString()}</span>
                        </div>
                      ) : (
                        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                          <button 
                            onClick={() => setShowResultForm(test.id)}
                            className="glass-button text-xs flex items-center gap-2"
                          >
                            <FileText className="h-3 w-3" /> Record Results
                          </button>
                        </div>
                      )}

                      {/* Result Record Modal/Overlay */}
                      {showResultForm === test.id && (
                        <div className="mt-4 p-4 bg-indigo-50 rounded-2xl border border-indigo-100 animate-in zoom-in-95">
                          <h6 className="text-xs font-black text-indigo-900 uppercase mb-3">Log Test Result</h6>
                          <form onSubmit={(e) => handleRecordResult(e, test.id)} className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <input 
                                className="glass-input bg-white w-full text-sm" 
                                placeholder="Value (e.g. 12.5, Positive)"
                                value={resultData.result_value}
                                onChange={e => setResultData({ ...resultData, result_value: e.target.value })}
                                required
                              />
                              <select 
                                className="glass-input bg-white w-full text-sm"
                                value={resultData.result_interpretation}
                                onChange={e => setResultData({ ...resultData, result_interpretation: e.target.value })}
                              >
                                <option value="normal">Normal</option>
                                <option value="abnormal">Abnormal</option>
                                <option value="inconclusive">Inconclusive</option>
                              </select>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex-1">
                                <label className="block text-[10px] font-bold text-indigo-600 uppercase mb-1">Actual Post-test Prob.</label>
                                <input 
                                  type="number" step="0.01" min="0" max="1"
                                  className="glass-input bg-white w-full text-sm"
                                  value={resultData.actual_posttest_probability}
                                  onChange={e => setResultData({ ...resultData, actual_posttest_probability: parseFloat(e.target.value) })}
                                />
                              </div>
                              <div className="flex items-end gap-2 pt-5">
                                <button type="button" onClick={() => setShowResultForm(null)} className="glass-button text-[10px] py-2">Cancel</button>
                                <button type="submit" className="glass-button-primary text-[10px] py-2 px-4">Save Result</button>
                              </div>
                            </div>
                          </form>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
