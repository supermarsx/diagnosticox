import { FormEvent, useState } from 'react';
import { FlaskConical, Plus, CheckCircle2 } from 'lucide-react';
import SelfDiscoveryNav from '../components/SelfDiscoveryNav';
import {
  DiscoveryHypothesis,
  HypothesisStatus,
  selfDiscoveryStorage,
} from '../services/selfDiscoveryStorage';

const STATUS_OPTIONS: HypothesisStatus[] = ['exploring', 'supported', 'challenged', 'parked'];

const statusClass: Record<HypothesisStatus, string> = {
  exploring: 'bg-blue-100 text-blue-700',
  supported: 'bg-emerald-100 text-emerald-700',
  challenged: 'bg-amber-100 text-amber-700',
  parked: 'bg-slate-100 text-slate-700',
};

export default function SelfDiscoveryHypothesesPage() {
  const [items, setItems] = useState(selfDiscoveryStorage.getHypotheses());
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [nextStep, setNextStep] = useState('');
  const [confidence, setConfidence] = useState(50);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    selfDiscoveryStorage.addHypothesis({
      title: title.trim(),
      description: description.trim(),
      status: 'exploring',
      confidence,
      linkedEvidenceIds: [],
      nextStep: nextStep.trim(),
    });

    setItems(selfDiscoveryStorage.getHypotheses());
    setTitle('');
    setDescription('');
    setNextStep('');
    setConfidence(50);
  };

  const update = (id: string, updates: Partial<Omit<DiscoveryHypothesis, 'id'>>) => {
    selfDiscoveryStorage.updateHypothesis(id, updates);
    setItems(selfDiscoveryStorage.getHypotheses());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-slate-50 to-emerald-50">
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <SelfDiscoveryNav />

        <section className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Plus className="h-5 w-5 text-cyan-700" />
            <h1 className="text-xl font-bold text-gray-900">Create Hypothesis</h1>
          </div>
          <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="glass-input px-3 py-2"
              placeholder="Hypothesis title"
              required
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="glass-input px-3 py-2"
              rows={3}
              placeholder="Why this might explain your pattern"
              required
            />
            <input
              value={nextStep}
              onChange={(e) => setNextStep(e.target.value)}
              className="glass-input px-3 py-2"
              placeholder="Next experiment or action"
            />
            <div>
              <label className="text-sm text-gray-700 mb-1 block">Confidence: {confidence}%</label>
              <input
                type="range"
                min={0}
                max={100}
                value={confidence}
                onChange={(e) => setConfidence(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <button className="glass-button-primary px-4 py-2 w-fit inline-flex items-center gap-2">
              <FlaskConical className="h-4 w-4" />
              Save hypothesis
            </button>
          </form>
        </section>

        <section className="space-y-3">
          {items.map((item) => (
            <article key={item.id} className="glass-card p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{item.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  <p className="text-xs text-gray-500 mt-2">Updated {item.updatedAt}</p>
                  {item.nextStep && <p className="text-sm text-gray-700 mt-2">Next: {item.nextStep}</p>}
                </div>
                <div className="w-56 space-y-2">
                  <select
                    value={item.status}
                    onChange={(e) => update(item.id, { status: e.target.value as HypothesisStatus })}
                    className={`w-full rounded-lg px-2 py-2 text-sm font-semibold ${statusClass[item.status]}`}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <label className="text-xs text-gray-700 block">
                    Confidence: {item.confidence}%
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={item.confidence}
                      onChange={(e) => update(item.id, { confidence: Number(e.target.value) })}
                      className="w-full mt-1"
                    />
                  </label>
                  <div className="text-xs text-gray-600 inline-flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Linked evidence: {item.linkedEvidenceIds.length}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}

