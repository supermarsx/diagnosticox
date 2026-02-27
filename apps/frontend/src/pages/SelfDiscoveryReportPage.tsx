import { useState } from 'react';
import { Download, Upload, FileText, Copy, CheckCircle2 } from 'lucide-react';
import SelfDiscoveryNav from '../components/SelfDiscoveryNav';
import { selfDiscoveryStorage } from '../services/selfDiscoveryStorage';

export default function SelfDiscoveryReportPage() {
  const [copied, setCopied] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [importPayload, setImportPayload] = useState('');

  const [refreshTick, setRefreshTick] = useState(0);
  const data = selfDiscoveryStorage.getAll();
  const insights = selfDiscoveryStorage.getInsights();
  const exportText = selfDiscoveryStorage.exportStore();

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(exportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const downloadJson = () => {
    const blob = new Blob([exportText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `self-discovery-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = () => {
    setImportError(null);
    setImportSuccess(false);
    const result = selfDiscoveryStorage.importStore(importPayload);
    if (!result.ok) {
      setImportError(result.error || 'Import failed');
      return;
    }
    setImportSuccess(true);
    setImportPayload('');
    setRefreshTick((tick) => tick + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-slate-50 to-emerald-50" data-refresh={refreshTick}>
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <SelfDiscoveryNav />

        <section className="glass-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-5 w-5 text-cyan-700" />
            <h1 className="text-xl font-bold text-gray-900">Narrative Report</h1>
          </div>
          <div className="text-sm text-gray-700 space-y-2">
            <p>
              You have logged <strong>{data.timeline.length}</strong> timeline signals,{' '}
              <strong>{data.hypotheses.length}</strong> hypotheses, and{' '}
              <strong>{data.evidence.length}</strong> evidence items.
            </p>
            <p>
              Current consistency score is <strong>{insights.consistencyScore}/100</strong> with average mood{' '}
              <strong>{insights.averageMood}/10</strong>.
            </p>
            <p>
              Top recurring signals: <strong>{insights.topSignals.join(', ') || 'none yet'}</strong>.
            </p>
          </div>
        </section>

        <section className="glass-card p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Export Bundle</h2>
          <div className="flex flex-wrap gap-2 mb-3">
            <button onClick={downloadJson} className="glass-button-primary px-3 py-2 inline-flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download JSON
            </button>
            <button onClick={copyToClipboard} className="glass-button px-3 py-2 inline-flex items-center gap-2">
              {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-700" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied' : 'Copy JSON'}
            </button>
          </div>
          <textarea value={exportText} readOnly className="glass-input w-full h-56 text-xs font-mono" />
        </section>

        <section className="glass-card p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Import Bundle</h2>
          <textarea
            value={importPayload}
            onChange={(e) => setImportPayload(e.target.value)}
            className="glass-input w-full h-40 text-xs font-mono"
            placeholder="Paste exported JSON here"
          />
          <div className="mt-3 flex items-center gap-3">
            <button onClick={importJson} className="glass-button-primary px-3 py-2 inline-flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Import JSON
            </button>
            {importError && <span className="text-xs text-red-700">{importError}</span>}
            {importSuccess && <span className="text-xs text-emerald-700">Import successful</span>}
          </div>
        </section>
      </main>
    </div>
  );
}
