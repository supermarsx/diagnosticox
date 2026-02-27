import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, Database, Server, UserRound, CheckCircle2 } from 'lucide-react';
import { apiService } from '../services/apiService';
import { UsageMode } from '../services/featureManager';

interface OnboardingPageProps {
  onCompleted?: () => void;
}

const ONBOARDING_DONE_KEY = 'app_onboarding_completed';

export default function OnboardingPage({ onCompleted }: OnboardingPageProps) {
  const navigate = useNavigate();
  const [apiUrl, setApiUrl] = useState(apiService.getApiBaseUrl());
  const [dbType, setDbType] = useState<'sqlite' | 'json' | 'postgresql'>('sqlite');
  const [dbPath, setDbPath] = useState('./research/medical_diagnosis.db');
  const [mode, setMode] = useState<UsageMode>(UsageMode.SELF_DISCOVERY);
  const [orgName, setOrgName] = useState('My Personal Lab');
  const [adminName, setAdminName] = useState('Local Admin');
  const [adminEmail, setAdminEmail] = useState('admin@local.dev');
  const [adminPassword, setAdminPassword] = useState('demo123');
  const [bootstrapNow, setBootstrapNow] = useState(true);
  const [needsBootstrap, setNeedsBootstrap] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const detectBootstrap = async () => {
      try {
        apiService.setApiBaseUrl(apiUrl);
        const status = await apiService.getBootstrapStatus();
        setNeedsBootstrap(status.needsBootstrap);
      } catch {
        setNeedsBootstrap(null);
      }
    };
    detectBootstrap();
  }, [apiUrl]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      apiService.setApiBaseUrl(apiUrl);

      localStorage.setItem(
        'app_onboarding_profile',
        JSON.stringify({
          db_type: dbType,
          db_path: dbPath,
          usage_mode: mode,
          api_url: apiUrl,
          updated_at: new Date().toISOString(),
        })
      );
      localStorage.setItem('app_usage_mode', mode);

      if (bootstrapNow && needsBootstrap) {
        const bootstrap = await apiService.bootstrapAdmin({
          org_name: orgName,
          admin_email: adminEmail,
          admin_password: adminPassword,
          admin_full_name: adminName,
        });
        localStorage.setItem('auth_token', bootstrap.token);
        if ((bootstrap as any).refreshToken) {
          localStorage.setItem('refresh_token', (bootstrap as any).refreshToken);
        }
        localStorage.setItem('user', JSON.stringify(bootstrap.user));
      }

      localStorage.setItem(ONBOARDING_DONE_KEY, 'true');
      onCompleted?.();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to complete onboarding');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-slate-100 p-4">
      <div className="max-w-4xl mx-auto py-8 space-y-6">
        <header className="glass-card p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-700 to-cyan-700 bg-clip-text text-transparent">
                First-Time Setup
              </h1>
              <p className="text-sm text-gray-600 mt-2">
                Configure your single-user local instance before entering the app.
              </p>
            </div>
            <Compass className="h-10 w-10 text-emerald-700" />
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="glass-card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Server className="h-5 w-5 text-cyan-700" />
              <h2 className="text-lg font-semibold text-gray-900">Backend Connection</h2>
            </div>
            <label className="block">
              <span className="text-sm text-gray-700">API base URL</span>
              <input
                className="glass-input w-full mt-1"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="http://localhost:3000/api"
                required
              />
            </label>
            <p className="text-xs text-gray-500">
              Bootstrap status:{' '}
              {needsBootstrap === null ? 'unknown (backend unavailable?)' : needsBootstrap ? 'needs setup' : 'already initialized'}
            </p>
          </section>

          <section className="glass-card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-cyan-700" />
              <h2 className="text-lg font-semibold text-gray-900">Storage Profile</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm text-gray-700">DB adapter</span>
                <select
                  className="glass-input w-full mt-1"
                  value={dbType}
                  onChange={(e) => {
                    const next = e.target.value as 'sqlite' | 'json' | 'postgresql';
                    setDbType(next);
                    setDbPath(
                      next === 'json'
                        ? './research/medical_diagnosis.json'
                        : next === 'sqlite'
                        ? './research/medical_diagnosis.db'
                        : ''
                    );
                  }}
                >
                  <option value="sqlite">sqlite</option>
                  <option value="json">json</option>
                  <option value="postgresql">postgresql</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm text-gray-700">
                  {dbType === 'postgresql' ? 'Connection managed in backend .env' : 'Local DB path'}
                </span>
                <input
                  className="glass-input w-full mt-1"
                  value={dbPath}
                  onChange={(e) => setDbPath(e.target.value)}
                  disabled={dbType === 'postgresql'}
                />
              </label>
            </div>
            <label className="block">
              <span className="text-sm text-gray-700">Default usage mode</span>
              <select
                className="glass-input w-full mt-1"
                value={mode}
                onChange={(e) => setMode(e.target.value as UsageMode)}
              >
                {Object.values(UsageMode).map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
          </section>

          <section className="glass-card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <UserRound className="h-5 w-5 text-cyan-700" />
              <h2 className="text-lg font-semibold text-gray-900">Initial Account</h2>
            </div>
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={bootstrapNow}
                onChange={(e) => setBootstrapNow(e.target.checked)}
                disabled={needsBootstrap === false}
              />
              Create first admin account now
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                className="glass-input"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="Organization"
              />
              <input
                className="glass-input"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                placeholder="Admin full name"
              />
              <input
                className="glass-input"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="Admin email"
                type="email"
              />
              <input
                className="glass-input"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Admin password"
                type="password"
              />
            </div>
          </section>

          {error && <div className="glass-card p-3 text-sm text-red-700 border border-red-300/70">{error}</div>}

          <footer className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="glass-button-primary px-4 py-2 inline-flex items-center gap-2 disabled:opacity-60"
            >
              <CheckCircle2 className="h-4 w-4" />
              {loading ? 'Applying setup...' : 'Complete setup'}
            </button>
            <Link to="/login" className="glass-button px-4 py-2">
              Skip to login
            </Link>
          </footer>
        </form>

        <section className="glass-card p-4 text-sm text-gray-700">
          <p className="font-semibold mb-1">Backend .env hint for selected adapter:</p>
          <pre className="text-xs overflow-auto bg-white/50 rounded p-3">{`DB_TYPE=${dbType}
${dbType === 'sqlite' ? `SQLITE_DB_PATH=${dbPath}` : ''}
${dbType === 'json' ? `JSON_DB_PATH=${dbPath}` : ''}`}</pre>
        </section>
      </div>
    </div>
  );
}

