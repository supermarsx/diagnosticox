import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Activity, AlertCircle, Plus, LogOut, RefreshCw, TrendingUp, Brain, BarChart3, Bell, Mic, Activity as MonitorIcon, Eye, Shield } from 'lucide-react';
import { apiService } from '../services/apiService';
import type { Patient } from '../types/medical';

interface DashboardPageProps {
  user: any;
  onLogout: () => void;
}

export default function DashboardPage({ user, onLogout }: DashboardPageProps) {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    loadPatients();
    
    // Monitor online/offline status
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadPatients = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await apiService.getPatients();
      setPatients(data.patients || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load patients');
      console.error('Failed to load patients:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dob: string): number => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-indigo-600 animate-spin"></div>
          </div>
          <p className="text-gray-700 font-medium">Loading patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Glassmorphism Header */}
      <header className="glass-nav sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Medical Diagnosis System
              </h1>
              <p className="text-sm text-gray-600 mt-1">Welcome, {user?.full_name || user?.email}</p>
            </div>
            <div className="flex items-center gap-3">
              {isOffline && (
                <div className="glass-badge-warning flex items-center gap-2 px-3 py-2">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Offline Mode</span>
                </div>
              )}
              <Link
                to="/calculator"
                className="glass-button-primary inline-flex items-center gap-2"
              >
                <TrendingUp className="h-4 w-4" />
                Bayesian Calculator
              </Link>
              <Link
                to="/analytics"
                className="glass-button-primary inline-flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Analytics
              </Link>
              <Link
                to="/ai-insights"
                className="glass-button-primary inline-flex items-center gap-2"
              >
                <Brain className="h-4 w-4" />
                AI Insights
              </Link>
              <Link
                to="/monitoring"
                className="glass-button-primary inline-flex items-center gap-2"
              >
                <MonitorIcon className="h-4 w-4" />
                Monitoring
              </Link>
              <Link
                to="/notifications"
                className="glass-button-primary inline-flex items-center gap-2"
              >
                <Bell className="h-4 w-4" />
                Alerts
              </Link>
              <Link
                to="/voice-assistant"
                className="glass-button-primary inline-flex items-center gap-2"
              >
                <Mic className="h-4 w-4" />
                Voice
              </Link>
              <Link
                to="/visualizations"
                className="glass-button-primary inline-flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Visualizations
              </Link>
              <Link
                to="/security"
                className="glass-button-primary inline-flex items-center gap-2"
              >
                <Shield className="h-4 w-4" />
                Security
              </Link>
              <button
                onClick={onLogout}
                className="glass-button flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Glassmorphism Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card hover-lift p-6 gradient-overlay-primary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-2">Total Patients</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {patients.length}
                </p>
              </div>
              <div className="glass-card-subtle p-4 rounded-2xl">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="glass-card hover-lift p-6 gradient-overlay-secondary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-2">Active Problems</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                  -
                </p>
              </div>
              <div className="glass-card-subtle p-4 rounded-2xl">
                <Activity className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="glass-card hover-lift p-6 gradient-overlay-accent">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-2">Pending Reviews</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-red-600 to-purple-600 bg-clip-text text-transparent">
                  -
                </p>
              </div>
              <div className="glass-card-subtle p-4 rounded-2xl">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Error Message with Glassmorphism */}
        {error && (
          <div className="glass-card mb-6 p-4 border-2 border-red-300/50">
            <div className="flex items-center gap-3">
              <div className="glass-badge-critical p-2 rounded-lg">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-red-800 font-medium">{error}</p>
              </div>
              <button
                onClick={loadPatients}
                className="glass-button text-sm flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Glassmorphism Patients List */}
        <div className="glass-card overflow-hidden">
          <div className="glass-header p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Patients
                </h2>
                <p className="text-sm text-gray-600 mt-1">Manage and monitor patient records</p>
              </div>
              <button className="glass-button-primary flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add Patient
              </button>
            </div>
          </div>

          <div className="glass-divider"></div>

          <div className="divide-y divide-white/20">
            {patients.length === 0 ? (
              <div className="p-16 text-center">
                <div className="glass-card-subtle p-8 rounded-3xl inline-block mb-4">
                  <Users className="h-16 w-16 text-gray-400 mx-auto" />
                </div>
                <p className="text-gray-700 text-lg font-medium">No patients found</p>
                <p className="text-sm text-gray-500 mt-2">Add a new patient to get started with diagnosis tracking</p>
              </div>
            ) : (
              patients.map((patient) => (
                <div
                  key={patient.id}
                  onClick={() => navigate(`/patients/${patient.id}`)}
                  className="p-6 hover:bg-white/10 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="glass-card-subtle p-3 rounded-xl group-hover:scale-110 transition-transform">
                          <Users className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {patient.first_name} {patient.last_name}
                          </h3>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-sm text-gray-600 font-medium">
                              MRN: {patient.mrn || 'N/A'}
                            </span>
                            <span className="text-sm text-gray-600">
                              Age: {calculateAge(patient.date_of_birth)} years
                            </span>
                            <span className="glass-badge text-xs">
                              {patient.gender}
                            </span>
                          </div>
                          {patient.contact_email && (
                            <p className="text-sm text-gray-500 mt-1">{patient.contact_email}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="glass-badge-stable px-4 py-2">
                        Active
                      </span>
                      <div className="glass-card-subtle p-2 rounded-lg group-hover:translate-x-1 transition-transform">
                        <svg
                          className="h-5 w-5 text-gray-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Offline Sync Status */}
        {isOffline && (
          <div className="mt-6 glass-card border-2 border-yellow-300/50 p-4">
            <div className="flex items-center gap-3">
              <div className="glass-badge-warning p-2 rounded-lg">
                <AlertCircle className="h-5 w-5" />
              </div>
              <p className="text-sm text-yellow-800 font-medium">
                You are currently offline. Changes will be synchronized when connection is restored.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
