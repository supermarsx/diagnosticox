import { FormEvent, useState } from 'react';
import { Database, Link2, Plus } from 'lucide-react';
import SelfDiscoveryNav from '../components/SelfDiscoveryNav';
import { DiscoveryEvidence, EvidenceType, selfDiscoveryStorage } from '../services/selfDiscoveryStorage';

const TYPES: EvidenceType[] = ['observation', 'lab', 'article', 'conversation', 'experiment'];

export default function SelfDiscoveryEvidencePage() {
  const [items, setItems] = useState(selfDiscoveryStorage.getEvidence());
  const [hypotheses, setHypotheses] = useState(selfDiscoveryStorage.getHypotheses());

  const [title, setTitle] = useState('');
  const [type, setType] = useState<EvidenceType>('observation');
  const [source, setSource] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [summary, setSummary] = useState('');
  const [reliability, setReliability] = useState(3);
  const [hypothesisIds, setHypothesisIds] = useState<string[]>([]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim()) return;

    const created = selfDiscoveryStorage.addEvidence({
      title: title.trim(),
      type,
      source: source.trim() || 'Personal note',
      date,
      summary: summary.trim(),
      reliability,
      hypothesisIds,
    });

    hypothesisIds.forEach((id) => {
      const target = hypotheses.find((h) => h.id === id);
      if (!target) return;
      selfDiscoveryStorage.updateHypothesis(id, {
        linkedEvidenceIds: Array.from(new Set([...target.linkedEvidenceIds, created.id])),
      });
    });

    setItems(selfDiscoveryStorage.getEvidence());
    setHypotheses(selfDiscoveryStorage.getHypotheses());
    setTitle('');
    setSource('');
    setSummary('');
    setReliability(3);
    setHypothesisIds([]);
  };

  const toggleHypothesis = (id: string) => {
    setHypothesisIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const getEvidenceTag = (item: DiscoveryEvidence) => {
    const linked = hypotheses.filter((h) => item.hypothesisIds.includes(h.id)).map((h) => h.title);
    if (!linked.length) return 'unlinked';
    return linked.join(', ');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-slate-50 to-emerald-50">
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <SelfDiscoveryNav />

        <section className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Plus className="h-5 w-5 text-cyan-700" />
            <h1 className="text-xl font-bold text-gray-900">Add Evidence</h1>
          </div>
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="glass-input px-3 py-2"
              placeholder="Evidence title"
              required
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value as EvidenceType)}
              className="glass-input px-3 py-2"
            >
              {TYPES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <input
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="glass-input px-3 py-2"
              placeholder="Source (journal, lab, paper...)"
            />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="glass-input px-3 py-2"
              required
            />
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="glass-input px-3 py-2 md:col-span-2"
              rows={3}
              placeholder="What does this evidence suggest?"
              required
            />
            <div className="md:col-span-2">
              <label className="text-sm text-gray-700 block mb-1">
                Reliability: {reliability}/5
              </label>
              <input
                type="range"
                min={1}
                max={5}
                value={reliability}
                onChange={(e) => setReliability(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="md:col-span-2">
              <p className="text-sm font-semibold text-gray-800 mb-2">Link to hypotheses</p>
              <div className="flex flex-wrap gap-2">
                {hypotheses.map((hypothesis) => {
                  const active = hypothesisIds.includes(hypothesis.id);
                  return (
                    <button
                      type="button"
                      key={hypothesis.id}
                      onClick={() => toggleHypothesis(hypothesis.id)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                        active
                          ? 'bg-cyan-700 text-white'
                          : 'bg-white/70 text-gray-700 hover:bg-cyan-100'
                      }`}
                    >
                      {hypothesis.title}
                    </button>
                  );
                })}
              </div>
            </div>
            <button className="glass-button-primary px-4 py-2 w-fit inline-flex items-center gap-2">
              <Database className="h-4 w-4" />
              Save evidence
            </button>
          </form>
        </section>

        <section className="space-y-3">
          {items.map((item) => (
            <article key={item.id} className="glass-card p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{item.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{item.summary}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {item.date} | {item.type} | source: {item.source}
                  </p>
                  <p className="text-xs text-cyan-700 mt-2 inline-flex items-center gap-1">
                    <Link2 className="h-3 w-3" />
                    {getEvidenceTag(item)}
                  </p>
                </div>
                <div className="bg-cyan-100 text-cyan-800 rounded-full px-3 py-1 text-xs font-semibold">
                  reliability {item.reliability}/5
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}

