import { useState } from 'react';
import { Activity, AlertCircle, Lock, Mail } from 'lucide-react';
import { apiService } from '../services/apiService';

interface LoginPageProps {
  onLogin: (user: any, token: string) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('dr.smith@clinic.com');
  const [password, setPassword] = useState('demo123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.login(email, password);
      onLogin(response.user, response.token);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="glass-card p-10 w-full max-w-md relative z-10 animate-in">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="glass-card-strong p-4 rounded-2xl inline-block mb-4">
            <Activity className="h-12 w-12 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Medical Diagnosis System
          </h1>
          <p className="text-gray-600 mt-2 text-sm">Intelligent Clinical Decision Support</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="glass-card border-2 border-red-300/50 p-4">
              <div className="flex items-center gap-3">
                <div className="glass-badge-critical p-2 rounded-lg">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                </div>
                <p className="text-sm text-red-800 font-medium">{error}</p>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="glass-input w-full pl-10 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="dr.smith@clinic.com"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="glass-input w-full pl-10 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Enter password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full glass-button-primary py-3.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold text-white"
          >
            {loading ? (
              <>
                <div className="relative w-5 h-5">
                  <div className="absolute inset-0 rounded-full border-2 border-white/30"></div>
                  <div className="absolute inset-0 rounded-full border-2 border-t-white animate-spin"></div>
                </div>
                Signing In...
              </>
            ) : (
              <>
                <Lock className="h-5 w-5" />
                Sign In
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials Card */}
        <div className="mt-6 glass-card-subtle p-4 border border-indigo-200/50">
          <div className="flex items-center gap-2 mb-2">
            <div className="glass-badge-info p-1 rounded">
              <Activity className="h-4 w-4" />
            </div>
            <p className="text-sm font-bold text-indigo-900">Demo Credentials</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-700">
              <span className="font-medium">Email:</span> dr.smith@clinic.com
            </p>
            <p className="text-xs text-gray-700">
              <span className="font-medium">Password:</span> demo123
            </p>
          </div>
        </div>

        {/* Footer Text */}
        <p className="text-center text-xs text-gray-500 mt-6">
          Secure authentication • HIPAA compliant • Protected by encryption
        </p>
      </div>
    </div>
  );
}
