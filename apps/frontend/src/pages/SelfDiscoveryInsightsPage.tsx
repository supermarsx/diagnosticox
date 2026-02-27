import { FormEvent, useMemo, useState } from 'react';
import { Brain, BellRing, CheckCircle2, AlertCircle } from 'lucide-react';
import SelfDiscoveryNav from '../components/SelfDiscoveryNav';
import { DiscoveryReminderType, selfDiscoveryStorage } from '../services/selfDiscoveryStorage';

const REMINDER_TYPES: DiscoveryReminderType[] = ['journal', 'protocol', 'evidence', 'timeline'];

export default function SelfDiscoveryInsightsPage() {
  const [reminders, setReminders] = useState(selfDiscoveryStorage.getReminders());
  const insights = useMemo(() => selfDiscoveryStorage.getInsights(), [reminders]);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [type, setType] = useState<DiscoveryReminderType>('journal');

  const refresh = () => setReminders(selfDiscoveryStorage.getReminders());

  const addReminder = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    selfDiscoveryStorage.addReminder({
      title: title.trim(),
      dueDate,
      type,
      completed: false,
    });
    setTitle('');
    refresh();
  };

  const toggleReminder = (id: string, completed: boolean) => {
    selfDiscoveryStorage.setReminderCompleted(id, completed);
    refresh();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-slate-50 to-emerald-50">
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <SelfDiscoveryNav />

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-card p-4">
            <p className="text-sm text-gray-600">Consistency Score</p>
            <p className="text-3xl font-bold text-cyan-700">{insights.consistencyScore}/100</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-sm text-gray-600">Average Mood</p>
            <p className="text-3xl font-bold text-cyan-700">{insights.averageMood}/10</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-sm text-gray-600">Top Signals</p>
            <p className="text-sm font-semibold text-cyan-700 mt-2">
              {insights.topSignals.join(', ') || 'none yet'}
            </p>
          </div>
        </section>

        <section className="glass-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="h-5 w-5 text-cyan-700" />
            <h1 className="text-xl font-bold text-gray-900">Pattern Insights</h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(insights.domainAverages).map(([domain, value]) => (
              <div key={domain} className="glass-card-subtle p-3 rounded-xl flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-800 capitalize">{domain}</span>
                <span className="text-sm text-cyan-700 font-bold">{value}/10 intensity</span>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-card p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Protocol Trends</h2>
          <div className="space-y-2">
            {insights.protocolProgress.length === 0 && (
              <p className="text-sm text-gray-600">No protocols yet.</p>
            )}
            {insights.protocolProgress.map((protocol) => (
              <div key={protocol.protocolId} className="glass-card-subtle p-3 rounded-xl">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-800">{protocol.title}</p>
                  <span className="text-xs text-gray-600">{protocol.status}</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Check-ins: {protocol.checkinCount} | Trend: {protocol.trend}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <BellRing className="h-5 w-5 text-cyan-700" />
            <h2 className="text-lg font-semibold text-gray-900">Reminder Engine</h2>
          </div>
          <form onSubmit={addReminder} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="glass-input px-3 py-2 md:col-span-2"
              placeholder="Reminder title"
              required
            />
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="glass-input px-3 py-2"
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value as DiscoveryReminderType)}
              className="glass-input px-3 py-2"
            >
              {REMINDER_TYPES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <button className="glass-button-primary px-4 py-2 w-fit">Add reminder</button>
          </form>
          <div className="space-y-2">
            {reminders.map((reminder) => (
              <div key={reminder.id} className="glass-card-subtle p-3 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{reminder.title}</p>
                  <p className="text-xs text-gray-600">
                    {reminder.dueDate} | {reminder.type}
                  </p>
                </div>
                <button
                  onClick={() => toggleReminder(reminder.id, !reminder.completed)}
                  className="glass-button px-3 py-1 text-xs inline-flex items-center gap-1"
                >
                  {reminder.completed ? (
                    <>
                      <CheckCircle2 className="h-3 w-3 text-emerald-700" />
                      completed
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3 w-3 text-amber-700" />
                      pending
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

