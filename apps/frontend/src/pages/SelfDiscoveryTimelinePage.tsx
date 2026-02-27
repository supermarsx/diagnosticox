import { FormEvent, useMemo, useState } from 'react';
import { Activity, Plus, Sparkles } from 'lucide-react';
import SelfDiscoveryNav from '../components/SelfDiscoveryNav';
import { DiscoveryDomain, selfDiscoveryStorage } from '../services/selfDiscoveryStorage';

const DOMAINS: DiscoveryDomain[] = [
  'physical',
  'mental',
  'sleep',
  'nutrition',
  'environment',
  'social',
];

export default function SelfDiscoveryTimelinePage() {
  const [events, setEvents] = useState(selfDiscoveryStorage.getTimeline());
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [domain, setDomain] = useState<DiscoveryDomain>('physical');
  const [intensity, setIntensity] = useState(5);
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('');

  const avgIntensity = useMemo(() => {
    if (!events.length) return 0;
    const total = events.reduce((sum, item) => sum + item.intensity, 0);
    return Math.round((total / events.length) * 10) / 10;
  }, [events]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !notes.trim()) return;

    selfDiscoveryStorage.addTimelineEvent({
      title: title.trim(),
      date,
      domain,
      intensity,
      notes: notes.trim(),
      tags: tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    });

    setEvents(selfDiscoveryStorage.getTimeline());
    setTitle('');
    setNotes('');
    setTags('');
    setIntensity(5);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-slate-50 to-emerald-50">
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <SelfDiscoveryNav />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-card p-4">
            <p className="text-sm text-gray-600">Entries</p>
            <p className="text-3xl font-bold text-cyan-700">{events.length}</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-sm text-gray-600">Average Intensity</p>
            <p className="text-3xl font-bold text-cyan-700">{avgIntensity}/10</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-sm text-gray-600">Latest Date</p>
            <p className="text-3xl font-bold text-cyan-700">{events[0]?.date || '-'}</p>
          </div>
        </div>

        <section className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Plus className="h-5 w-5 text-cyan-700" />
            <h1 className="text-xl font-bold text-gray-900">Log Signal</h1>
          </div>

          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="glass-input px-3 py-2"
              placeholder="Signal title"
              required
            />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="glass-input px-3 py-2"
              required
            />
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value as DiscoveryDomain)}
              className="glass-input px-3 py-2"
            >
              {DOMAINS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <div>
              <label className="text-sm text-gray-700 mb-1 block">Intensity: {intensity}/10</label>
              <input
                type="range"
                min={0}
                max={10}
                value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="glass-input px-3 py-2 md:col-span-2"
              rows={3}
              placeholder="What happened and what context matters?"
              required
            />
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="glass-input px-3 py-2 md:col-span-2"
              placeholder="tags, separated, by comma"
            />
            <button className="glass-button-primary px-4 py-2 inline-flex items-center gap-2 w-fit">
              <Sparkles className="h-4 w-4" />
              Save entry
            </button>
          </form>
        </section>

        <section className="space-y-3">
          {events.map((event) => (
            <article key={event.id} className="glass-card p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-900">{event.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{event.notes}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {event.date} | {event.domain}
                  </p>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center gap-1 bg-cyan-100 text-cyan-800 rounded-full px-3 py-1 text-xs font-semibold">
                    <Activity className="h-3 w-3" />
                    {event.intensity}/10
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{event.tags.join(', ') || 'no tags'}</p>
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}

