import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PatientDetailPage from './pages/PatientDetailPage';
import BayesianCalculatorPage from './pages/BayesianCalculatorPage';
import AIInsightsPage from './pages/AIInsightsPage';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import PatientOutcomesTracker from './pages/PatientOutcomesTracker';
import TreatmentEfficacyCenter from './pages/TreatmentEfficacyCenter';
import PopulationHealthMonitor from './pages/PopulationHealthMonitor';
import CustomDashboardBuilder from './pages/CustomDashboardBuilder';
import ReportingSystem from './pages/ReportingSystem';
import NotificationsCenter from './pages/NotificationsCenter';
import RealtimeMonitoringPage from './pages/RealtimeMonitoringPage';
import VoiceAssistantPage from './pages/VoiceAssistantPage';
import VisualizationsHub from './pages/VisualizationsHub';
import MedicalTimeline from './pages/MedicalTimeline';
import SymptomHeatmaps from './pages/SymptomHeatmaps';
import AnatomicalModels from './pages/AnatomicalModels';
import MedicalImaging from './pages/MedicalImaging';
import CameraIntegration from './pages/CameraIntegration';
import SecurityCenterHub from './pages/SecurityCenterHub';
import MultiFactorAuth from './pages/MultiFactorAuth';
import RolePermissionsManager from './pages/RolePermissionsManager';
import OrganizationManagement from './pages/OrganizationManagement';
import SecurityAuditLogs from './pages/SecurityAuditLogs';
import EncryptionManagement from './pages/EncryptionManagement';
import PrivacyControls from './pages/PrivacyControls';
import AdminPanel from './pages/AdminPanel';
import ICDLookupPage from './pages/ICDLookupPage';
import DSM5AssessmentsPage from './pages/DSM5AssessmentsPage';
import SymptomCheckerPage from './pages/SymptomCheckerPage';
import FeatureManagementPage from './pages/FeatureManagementPage';
import MedicalResearchHub from './pages/MedicalResearchHub';
import AIProviderSettings from './pages/AIProviderSettings';
import VindicatemDiagnosisPage from './pages/VindicatemDiagnosisPage';
import FHIRInteroperabilityPage from './pages/FHIRInteroperabilityPage';
import AdaptiveManagementPage from './pages/AdaptiveManagementPage';
import CacheMetricsDashboard from './pages/CacheMetricsDashboard';
import { apiService } from './services/apiService';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
      }
    }
    
    setLoading(false);
  }, []);

  const handleLogin = (userData: any, token: string) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    apiService.setToken(token);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
    apiService.clearToken();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/login" 
          element={
            !user ? (
              <LoginPage onLogin={handleLogin} />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          } 
        />
        <Route
          path="/dashboard"
          element={
            user ? (
              <DashboardPage user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/patients/:patientId"
          element={
            user ? (
              <PatientDetailPage user={user} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/calculator"
          element={
            user ? (
              <BayesianCalculatorPage user={user} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/ai-insights"
          element={
            user ? (
              <AIInsightsPage user={user} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/analytics"
          element={
            user ? (
              <AnalyticsDashboard user={user} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/analytics/patient-outcomes"
          element={
            user ? (
              <PatientOutcomesTracker user={user} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/analytics/treatment-efficacy"
          element={
            user ? (
              <TreatmentEfficacyCenter user={user} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/analytics/population-health"
          element={
            user ? (
              <PopulationHealthMonitor user={user} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/analytics/dashboard-builder"
          element={
            user ? (
              <CustomDashboardBuilder user={user} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/analytics/reports"
          element={
            user ? (
              <ReportingSystem user={user} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/notifications"
          element={
            user ? (
              <NotificationsCenter user={user} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/monitoring"
          element={
            user ? (
              <RealtimeMonitoringPage user={user} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/voice-assistant"
          element={
            user ? (
              <VoiceAssistantPage user={user} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/visualizations"
          element={
            user ? (
              <VisualizationsHub user={user} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/visualizations/timeline"
          element={
            user ? (
              <MedicalTimeline user={user} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/visualizations/heatmaps"
          element={
            user ? (
              <SymptomHeatmaps user={user} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/visualizations/anatomical"
          element={
            user ? (
              <AnatomicalModels user={user} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/visualizations/imaging"
          element={
            user ? (
              <MedicalImaging user={user} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/visualizations/camera"
          element={
            user ? (
              <CameraIntegration user={user} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/security"
          element={
            user ? (
              <SecurityCenterHub user={user} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/security/mfa"
          element={
            user ? (
              <MultiFactorAuth user={user} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/security/permissions"
          element={
            user ? (
              <RolePermissionsManager user={user} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/security/organizations"
          element={
            user ? (
              <OrganizationManagement user={user} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/security/audit-logs"
          element={
            user ? (
              <SecurityAuditLogs user={user} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/security/encryption"
          element={
            user ? (
              <EncryptionManagement user={user} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/security/privacy"
          element={
            user ? (
              <PrivacyControls user={user} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/security/admin"
          element={
            user ? (
              <AdminPanel user={user} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/clinical/icd-lookup"
          element={
            user ? (
              <ICDLookupPage />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/clinical/dsm5-assessments"
          element={
            user ? (
              <DSM5AssessmentsPage />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/clinical/symptom-checker"
          element={
            user ? (
              <SymptomCheckerPage />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/settings/features"
          element={
            user ? (
              <FeatureManagementPage />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/research"
          element={
            user ? (
              <MedicalResearchHub />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/settings/ai-providers"
          element={
            user ? (
              <AIProviderSettings />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/clinical/vindicate-m"
          element={
            user ? (
              <VindicatemDiagnosisPage />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/clinical/fhir"
          element={
            user ? (
              <FHIRInteroperabilityPage />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/settings/adaptive-management"
          element={
            user ? (
              <AdaptiveManagementPage />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/settings/cache-metrics"
          element={
            user ? (
              <CacheMetricsDashboard />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
