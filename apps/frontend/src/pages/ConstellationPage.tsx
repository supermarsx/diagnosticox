import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader, Info } from 'lucide-react';
import MedicalConstellation from '../components/visualizations/constellation/MedicalConstellation';
import { apiService } from '../services/apiService';

export default function ConstellationPage() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [nodes, setNodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<any>(null);

  useEffect(() => {
    if (patientId) {
      loadData();
    }
  }, [patientId]);

  const loadData = async () => {
    if (!patientId) return;
    setLoading(true);
    
    if (patientId === 'demo') {
      // Mock data for demo visualization
      setTimeout(() => {
        setNodes([
          { id: 'p1', type: 'problem', label: 'Chronic Cough', details: 'Persistent for 3 months' },
          { id: 'h1', type: 'hypothesis', label: 'Asthma', probability: 0.65, parentId: 'p1', details: 'Supported by nocturnal symptoms' },
          { id: 'h2', type: 'hypothesis', label: 'GERD', probability: 0.25, parentId: 'p1', details: 'Reflux symptoms present' },
          { id: 'h3', type: 'hypothesis', label: 'Post-viral', probability: 0.10, parentId: 'p1', details: 'Recent URI history' },
          { id: 'f1', type: 'fact', label: 'Wheezing', parentId: 'h1' },
          { id: 'f2', type: 'fact', label: 'Nocturnal Cough', parentId: 'h1' },
          { id: 'f3', type: 'fact', label: 'Heartburn', parentId: 'h2' },
          { id: 't1', type: 'test', label: 'Spirometry', parentId: 'h1' },
          { id: 't2', type: 'test', label: 'PPI Trial', parentId: 'h2' },
        ]);
        setLoading(false);
      }, 1000);
      return;
    }

    try {
      // Parallel fetch for rich graph data
      const [problemsData, factsData, timelineData] = await Promise.all([
        apiService.getProblems(patientId),
        apiService.requestPublic<any[]>(`/facts?patientId=${patientId}`), // Assuming this endpoint exists or similar
        apiService.getTimelineEvents(patientId)
      ]);

      const problems = problemsData.problems || [];
      const facts = (factsData as any).facts || []; // Adjust based on actual API response structure
      
      const graphNodes: any[] = [];

      // 1. Problems (Stars)
      for (const p of problems) {
        graphNodes.push({
          id: p.id,
          type: 'problem',
          label: p.problem_name,
          details: p.clinical_context,
          parentId: null
        });

        // Fetch hypotheses for each problem to create planets
        try {
          const hypData = await apiService.getHypotheses(p.id);
          const hypotheses = hypData.hypotheses || [];
          
          hypotheses.forEach(h => {
            graphNodes.push({
              id: h.id,
              type: 'hypothesis',
              label: h.diagnosis_name,
              probability: h.current_probability,
              details: h.clinical_reasoning,
              parentId: p.id
            });
          });
        } catch (e) {
          console.warn(`Failed to load hypotheses for problem ${p.id}`, e);
        }
      }

      // 2. Facts (Satellites) - link to problems if possible, else float
      facts.forEach((f: any) => {
        // If fact is linked to a problem, orbit that problem
        // Ideally, we'd link to specific hypotheses, but that data might be sparse
        if (f.problem_id) {
          graphNodes.push({
            id: f.id,
            type: 'fact',
            label: `${f.measurement_name}: ${f.measurement_value || f.value_text} ${f.measurement_unit || ''}`,
            details: `Source: ${f.source}`,
            parentId: f.problem_id // Orbit the problem star
          });
        }
      });

      // 3. Add Timeline Events as 'Context' nodes if needed, or map tests
      // (Simplified for this MVP to just problems/hypotheses/facts)

      setNodes(graphNodes);
    } catch (err) {
      console.error('Failed to load constellation data', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-slate-900 relative overflow-hidden">
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 flex justify-between items-start pointer-events-none">
        <div className="pointer-events-auto">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 backdrop-blur-md px-4 py-2 rounded-full transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Patient</span>
          </button>
        </div>
        <div className="text-right pointer-events-none">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
            Diagnostic Constellation
          </h1>
          <p className="text-slate-400 text-sm">3D Relationship Visualizer</p>
        </div>
      </div>

      {/* Main 3D Canvas */}
      {loading ? (
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <Loader className="h-12 w-12 text-indigo-500 animate-spin mx-auto mb-4" />
            <p className="text-slate-400 animate-pulse">Computing celestial mechanics...</p>
          </div>
        </div>
      ) : (
        <MedicalConstellation nodes={nodes} onNodeClick={setSelectedNode} />
      )}

      {/* Detail Overlay */}
      {selectedNode && (
        <div className="absolute bottom-8 right-8 z-10 w-80 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-white animate-in slide-in-from-right-8 fade-in duration-300">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-3 h-3 rounded-full ${
              selectedNode.type === 'problem' ? 'bg-red-500' :
              selectedNode.type === 'hypothesis' ? 'bg-indigo-500' :
              'bg-emerald-500'
            }`} />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{selectedNode.type}</span>
          </div>
          <h3 className="text-xl font-bold mb-2">{selectedNode.label}</h3>
          
          {selectedNode.probability !== undefined && (
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-300">Probability</span>
                <span className="font-bold text-indigo-300">{(selectedNode.probability * 100).toFixed(1)}%</span>
              </div>
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400" 
                  style={{ width: `${selectedNode.probability * 100}%` }}
                />
              </div>
            </div>
          )}

          {selectedNode.details && (
            <div className="bg-white/5 rounded-xl p-3 text-sm text-slate-300 leading-relaxed mb-4">
              {selectedNode.details}
            </div>
          )}

          <button 
            onClick={() => setSelectedNode(null)}
            className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
          >
            Close Details
          </button>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-8 left-8 z-10 bg-black/40 backdrop-blur-md rounded-xl p-4 border border-white/5">
        <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
          <Info className="h-3 w-3" /> Legend
        </h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></span>
            Problem (Star)
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></span>
            Hypothesis (Planet)
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Test / Fact (Satellite)
          </div>
        </div>
      </div>
    </div>
  );
}
