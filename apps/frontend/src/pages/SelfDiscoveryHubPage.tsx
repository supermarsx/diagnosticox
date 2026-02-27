import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Compass,
  FlaskConical,
  Database,
  NotebookPen,
  Timeline,
  Target,
  Beaker,
  Brain,
  FileText,
} from 'lucide-react';
import SelfDiscoveryNav from '../components/SelfDiscoveryNav';
import { selfDiscoveryStorage } from '../services/selfDiscoveryStorage';

export default function SelfDiscoveryHubPage() {
  const data = useMemo(() => selfDiscoveryStorage.getAll(), []);
  const stats = useMemo(() => selfDiscoveryStorage.getStats(), []);
  const latestHypothesis = data.hypotheses[0];
  const latestEvent = data.timeline[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-slate-50 to-emerald-50">
      <header className="glass-nav sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="glass-button inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-700 to-emerald-600 bg-clip-text text-transparent">
                Self Discovery Journey
              </h1>
              <p className="text-sm text-gray-600">
                Investigate, test, and connect your own reality puzzle.
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <SelfDiscoveryNav />

        <section className="grid grid-cols-1 md:grid-cols-4 xl:grid-cols-7 gap-4">
          <div className="glass-card p-4">
            <p className="text-sm text-gray-600">Timeline</p>
            <p className="text-3xl font-bold text-cyan-700">{stats.timelineEvents}</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-sm text-gray-600">Hypotheses</p>
            <p className="text-3xl font-bold text-cyan-700">{stats.hypotheses}</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-sm text-gray-600">Evidence Items</p>
            <p className="text-3xl font-bold text-cyan-700">{stats.evidenceItems}</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-sm text-gray-600">Journal Notes</p>
            <p className="text-3xl font-bold text-cyan-700">{stats.journalEntries}</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-sm text-gray-600">Active Leads</p>
            <p className="text-3xl font-bold text-cyan-700">{stats.activeHypotheses}</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-sm text-gray-600">Active Protocols</p>
            <p className="text-3xl font-bold text-cyan-700">{stats.activeProtocols}</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-sm text-gray-600">Pending Reminders</p>
            <p className="text-3xl font-bold text-cyan-700">{stats.pendingReminders}</p>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <Link to="/self-discovery/timeline" className="glass-card p-5 hover-lift block">
            <Timeline className="h-6 w-6 text-cyan-700 mb-3" />
            <h2 className="font-bold text-gray-900 mb-1">Pattern Timeline</h2>
            <p className="text-sm text-gray-600">Track what happened, when, and how strong it felt.</p>
          </Link>
          <Link to="/self-discovery/hypotheses" className="glass-card p-5 hover-lift block">
            <FlaskConical className="h-6 w-6 text-cyan-700 mb-3" />
            <h2 className="font-bold text-gray-900 mb-1">Hypothesis Lab</h2>
            <p className="text-sm text-gray-600">Turn guesses into testable explanations and next steps.</p>
          </Link>
          <Link to="/self-discovery/evidence" className="glass-card p-5 hover-lift block">
            <Database className="h-6 w-6 text-cyan-700 mb-3" />
            <h2 className="font-bold text-gray-900 mb-1">Evidence Board</h2>
            <p className="text-sm text-gray-600">Store logs, labs, research notes, and source quality.</p>
          </Link>
          <Link to="/self-discovery/journal" className="glass-card p-5 hover-lift block">
            <NotebookPen className="h-6 w-6 text-cyan-700 mb-3" />
            <h2 className="font-bold text-gray-900 mb-1">Reflection Journal</h2>
            <p className="text-sm text-gray-600">Capture shifts in mindset, questions, and course corrections.</p>
          </Link>
          <Link to="/self-discovery/protocols" className="glass-card p-5 hover-lift block">
            <Beaker className="h-6 w-6 text-cyan-700 mb-3" />
            <h2 className="font-bold text-gray-900 mb-1">Protocol Lab</h2>
            <p className="text-sm text-gray-600">Design and run N=1 experiments against your hypotheses.</p>
          </Link>
          <Link to="/self-discovery/insights" className="glass-card p-5 hover-lift block">
            <Brain className="h-6 w-6 text-cyan-700 mb-3" />
            <h2 className="font-bold text-gray-900 mb-1">Insights Center</h2>
            <p className="text-sm text-gray-600">Turn your logs into trends, consistency scores, and reminders.</p>
          </Link>
          <Link to="/self-discovery/report" className="glass-card p-5 hover-lift block">
            <FileText className="h-6 w-6 text-cyan-700 mb-3" />
            <h2 className="font-bold text-gray-900 mb-1">Report & Export</h2>
            <p className="text-sm text-gray-600">Generate a handoff summary and import/export your full bundle.</p>
          </Link>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-5 w-5 text-emerald-700" />
              <h3 className="font-semibold text-gray-900">Current Lead</h3>
            </div>
            {latestHypothesis ? (
              <>
                <p className="font-semibold text-gray-800">{latestHypothesis.title}</p>
                <p className="text-sm text-gray-600 mt-1">{latestHypothesis.nextStep}</p>
                <p className="text-xs text-gray-500 mt-3">Confidence: {latestHypothesis.confidence}%</p>
              </>
            ) : (
              <p className="text-sm text-gray-600">No hypotheses yet. Start in the Hypothesis Lab.</p>
            )}
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-2">
              <Compass className="h-5 w-5 text-emerald-700" />
              <h3 className="font-semibold text-gray-900">Latest Signal</h3>
            </div>
            {latestEvent ? (
              <>
                <p className="font-semibold text-gray-800">{latestEvent.title}</p>
                <p className="text-sm text-gray-600 mt-1">{latestEvent.notes}</p>
                <p className="text-xs text-gray-500 mt-3">
                  {latestEvent.date} | intensity {latestEvent.intensity}/10
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-600">No timeline entries yet. Log your first signal.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
