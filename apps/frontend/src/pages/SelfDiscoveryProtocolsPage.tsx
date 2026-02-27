import { FormEvent, useState } from 'react';
import { FlaskConical, Plus, PlayCircle, PauseCircle, CheckCircle2 } from 'lucide-react';
import SelfDiscoveryNav from '../components/SelfDiscoveryNav';
import {
  DiscoveryProtocol,
  ProtocolStatus,
  selfDiscoveryStorage,
} from '../services/selfDiscoveryStorage';

const STATUS_VALUES: ProtocolStatus[] = ['planned', 'active', 'paused', 'completed'];

const statusStyles: Record<ProtocolStatus, string> = {
  planned: 'bg-slate-100 text-slate-700',
  active: 'bg-emerald-100 text-emerald-700',
  paused: 'bg-amber-100 text-amber-700',
  completed: 'bg-cyan-100 text-cyan-700',
};

export default function SelfDiscoveryProtocolsPage() {
  const [protocols, setProtocols] = useState(selfDiscoveryStorage.getProtocols());
  const [hypotheses] = useState(selfDiscoveryStorage.getHypotheses());
  const [title, setTitle] = useState('');
  const [objective, setObjective] = useState('');
  const [hypothesisId, setHypothesisId] = useState('');
  const [metric, setMetric] = useState('');
  const [baseline, setBaseline] = useState('');
  const [intervention, setIntervention] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10));
  const [checkinValue, setCheckinValue] = useState(5);
  const [checkinNotes, setCheckinNotes] = useState('');
  const [checkinProtocolId, setCheckinProtocolId] = useState('');

  const refresh = () => setProtocols(selfDiscoveryStorage.getProtocols());

  const createProtocol = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !objective.trim() || !metric.trim() || !intervention.trim()) return;

    selfDiscoveryStorage.addProtocol({
      title: title.trim(),
      objective: objective.trim(),
      hypothesisId: hypothesisId || undefined,
      metric: metric.trim(),
      baseline: baseline.trim(),
      intervention: intervention.trim(),
      startDate,
      endDate,
      status: 'planned',
    });

    setTitle('');
    setObjective('');
    setMetric('');
    setBaseline('');
    setIntervention('');
    setHypothesisId('');
    refresh();
  };

  const updateProtocol = (
    id: string,
    updates: Partial<Omit<DiscoveryProtocol, 'id' | 'checkins' | 'createdAt'>>
  ) => {
    selfDiscoveryStorage.updateProtocol(id, updates);
    refresh();
  };

  const addCheckin = (e: FormEvent) => {
    e.preventDefault();
    if (!checkinProtocolId) return;
    selfDiscoveryStorage.addProtocolCheckin(checkinProtocolId, {
      date: new Date().toISOString().slice(0, 10),
      value: checkinValue,
      notes: checkinNotes.trim(),
    });
    setCheckinProtocolId('');
    setCheckinValue(5);
    setCheckinNotes('');
    refresh();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-slate-50 to-emerald-50">
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <SelfDiscoveryNav />

        <section className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Plus className="h-5 w-5 text-cyan-700" />
            <h1 className="text-xl font-bold text-gray-900">Protocol Lab</h1>
          </div>
          <form onSubmit={createProtocol} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="glass-input px-3 py-2"
              placeholder="Protocol title"
              required
            />
            <select
              value={hypothesisId}
              onChange={(e) => setHypothesisId(e.target.value)}
              className="glass-input px-3 py-2"
            >
              <option value="">Link to hypothesis (optional)</option>
              {hypotheses.map((hyp) => (
                <option key={hyp.id} value={hyp.id}>
                  {hyp.title}
                </option>
              ))}
            </select>
            <input
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              className="glass-input px-3 py-2 md:col-span-2"
              placeholder="Objective"
              required
            />
            <input
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
              className="glass-input px-3 py-2"
              placeholder="Metric (e.g., energy score)"
              required
            />
            <input
              value={baseline}
              onChange={(e) => setBaseline(e.target.value)}
              className="glass-input px-3 py-2"
              placeholder="Baseline"
            />
            <input
              value={intervention}
              onChange={(e) => setIntervention(e.target.value)}
              className="glass-input px-3 py-2 md:col-span-2"
              placeholder="Intervention plan"
              required
            />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="glass-input px-3 py-2"
              required
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="glass-input px-3 py-2"
              required
            />
            <button className="glass-button-primary px-4 py-2 w-fit inline-flex items-center gap-2">
              <FlaskConical className="h-4 w-4" />
              Create protocol
            </button>
          </form>
        </section>

        <section className="glass-card p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Quick Check-in</h2>
          <form onSubmit={addCheckin} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <select
              value={checkinProtocolId}
              onChange={(e) => setCheckinProtocolId(e.target.value)}
              className="glass-input px-3 py-2 md:col-span-2"
              required
            >
              <option value="">Select protocol</option>
              {protocols.map((protocol) => (
                <option key={protocol.id} value={protocol.id}>
                  {protocol.title}
                </option>
              ))}
            </select>
            <div>
              <label className="text-xs text-gray-700 block mb-1">Value: {checkinValue}</label>
              <input
                type="range"
                min={0}
                max={10}
                value={checkinValue}
                onChange={(e) => setCheckinValue(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <input
              value={checkinNotes}
              onChange={(e) => setCheckinNotes(e.target.value)}
              className="glass-input px-3 py-2"
              placeholder="Notes"
            />
            <button className="glass-button-primary px-4 py-2 w-fit">Add check-in</button>
          </form>
        </section>

        <section className="space-y-3">
          {protocols.map((protocol) => (
            <article key={protocol.id} className="glass-card p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{protocol.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{protocol.objective}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {protocol.startDate} to {protocol.endDate} | metric: {protocol.metric}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Intervention: {protocol.intervention}</p>
                  <p className="text-xs text-cyan-700 mt-2">
                    Check-ins: {protocol.checkins.length}
                    {protocol.checkins.length > 0 && (
                      <> | latest value: {protocol.checkins[protocol.checkins.length - 1].value}</>
                    )}
                  </p>
                </div>
                <div className="w-56 space-y-2">
                  <select
                    value={protocol.status}
                    onChange={(e) => updateProtocol(protocol.id, { status: e.target.value as ProtocolStatus })}
                    className={`w-full rounded-lg px-2 py-2 text-sm font-semibold ${statusStyles[protocol.status]}`}
                  >
                    {STATUS_VALUES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => updateProtocol(protocol.id, { status: 'active' })}
                      className="glass-button text-xs px-2 py-1 inline-flex items-center gap-1"
                    >
                      <PlayCircle className="h-3 w-3" />
                      start
                    </button>
                    <button
                      type="button"
                      onClick={() => updateProtocol(protocol.id, { status: 'paused' })}
                      className="glass-button text-xs px-2 py-1 inline-flex items-center gap-1"
                    >
                      <PauseCircle className="h-3 w-3" />
                      pause
                    </button>
                    <button
                      type="button"
                      onClick={() => updateProtocol(protocol.id, { status: 'completed' })}
                      className="glass-button text-xs px-2 py-1 inline-flex items-center gap-1"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      complete
                    </button>
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

