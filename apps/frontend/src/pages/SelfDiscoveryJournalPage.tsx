import { FormEvent, useState } from 'react';
import { NotebookPen, PlusCircle } from 'lucide-react';
import SelfDiscoveryNav from '../components/SelfDiscoveryNav';
import { selfDiscoveryStorage } from '../services/selfDiscoveryStorage';

export default function SelfDiscoveryJournalPage() {
  const [entries, setEntries] = useState(selfDiscoveryStorage.getJournalEntries());
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [mood, setMood] = useState(5);
  const [reflection, setReflection] = useState('');
  const [signals, setSignals] = useState('');
  const [questions, setQuestions] = useState('');
  const [nextAction, setNextAction] = useState('');

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!reflection.trim()) return;

    selfDiscoveryStorage.addJournalEntry({
      date,
      mood,
      reflection: reflection.trim(),
      signals: signals
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      questions: questions.trim(),
      nextAction: nextAction.trim(),
    });

    setEntries(selfDiscoveryStorage.getJournalEntries());
    setReflection('');
    setSignals('');
    setQuestions('');
    setNextAction('');
    setMood(5);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-slate-50 to-emerald-50">
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <SelfDiscoveryNav />

        <section className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <PlusCircle className="h-5 w-5 text-cyan-700" />
            <h1 className="text-xl font-bold text-gray-900">New Reflection</h1>
          </div>
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="glass-input px-3 py-2"
              required
            />
            <div>
              <label className="text-sm text-gray-700 block mb-1">Mood: {mood}/10</label>
              <input
                type="range"
                min={0}
                max={10}
                value={mood}
                onChange={(e) => setMood(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              rows={4}
              className="glass-input px-3 py-2 md:col-span-2"
              placeholder="What did you learn about your current reality today?"
              required
            />
            <input
              value={signals}
              onChange={(e) => setSignals(e.target.value)}
              className="glass-input px-3 py-2 md:col-span-2"
              placeholder="Signals noticed (comma separated)"
            />
            <input
              value={questions}
              onChange={(e) => setQuestions(e.target.value)}
              className="glass-input px-3 py-2 md:col-span-2"
              placeholder="Open questions"
            />
            <input
              value={nextAction}
              onChange={(e) => setNextAction(e.target.value)}
              className="glass-input px-3 py-2 md:col-span-2"
              placeholder="Next action"
            />
            <button className="glass-button-primary px-4 py-2 w-fit inline-flex items-center gap-2">
              <NotebookPen className="h-4 w-4" />
              Save reflection
            </button>
          </form>
        </section>

        <section className="space-y-3">
          {entries.map((entry) => (
            <article key={entry.id} className="glass-card p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{entry.date}</p>
                  <p className="text-sm text-gray-700 mt-2">{entry.reflection}</p>
                  {entry.signals.length > 0 && (
                    <p className="text-xs text-gray-500 mt-2">Signals: {entry.signals.join(', ')}</p>
                  )}
                  {entry.questions && (
                    <p className="text-sm text-gray-700 mt-2">Question: {entry.questions}</p>
                  )}
                  {entry.nextAction && (
                    <p className="text-sm text-cyan-700 mt-1">Next: {entry.nextAction}</p>
                  )}
                </div>
                <div className="bg-cyan-100 text-cyan-800 rounded-full px-3 py-1 text-xs font-semibold">
                  mood {entry.mood}/10
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}

