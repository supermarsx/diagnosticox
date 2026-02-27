import { Link, useLocation } from 'react-router-dom';
import { Compass, Timeline, FlaskConical, Database, NotebookPen, Beaker, Brain, FileText } from 'lucide-react';

const ITEMS = [
  { to: '/self-discovery', label: 'Hub', icon: Compass },
  { to: '/self-discovery/timeline', label: 'Timeline', icon: Timeline },
  { to: '/self-discovery/hypotheses', label: 'Hypotheses', icon: FlaskConical },
  { to: '/self-discovery/protocols', label: 'Protocols', icon: Beaker },
  { to: '/self-discovery/evidence', label: 'Evidence', icon: Database },
  { to: '/self-discovery/insights', label: 'Insights', icon: Brain },
  { to: '/self-discovery/journal', label: 'Journal', icon: NotebookPen },
  { to: '/self-discovery/report', label: 'Report', icon: FileText },
];

export default function SelfDiscoveryNav() {
  const location = useLocation();

  return (
    <nav className="glass-card p-2 flex flex-wrap gap-2">
      {ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive =
          location.pathname === item.to ||
          (item.to !== '/self-discovery' && location.pathname.startsWith(item.to));

        return (
          <Link
            key={item.to}
            to={item.to}
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all inline-flex items-center gap-2 ${
              isActive
                ? 'bg-indigo-600 text-white'
                : 'bg-white/50 text-gray-700 hover:bg-indigo-100'
            }`}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
