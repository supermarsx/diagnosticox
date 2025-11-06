import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useMobile } from './hooks/use-mobile';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { PatientDetailPage } from './pages/PatientDetailPage';
import { ICDLookupPage } from './pages/ICDLookupPage';
import { SymptomCheckerPage } from './pages/SymptomCheckerPage';
import { DSM5AssessmentsPage } from './pages/DSM5AssessmentsPage';
import { VindicatemDiagnosisPage } from './pages/VindicatemDiagnosisPage';
import { FHIRInteroperabilityPage } from './pages/FHIRInteroperabilityPage';
import { AnalyticsDashboard } from './pages/AnalyticsDashboard';
import { PatientOutcomesTracker } from './pages/PatientOutcomesTracker';
import { TreatmentEfficacyCenter } from './pages/TreatmentEfficacyCenter';
import { PopulationHealthMonitor } from './pages/PopulationHealthMonitor';
import { SecurityCenterHub } from './pages/SecurityCenterHub';
import { MultiFactorAuth } from './pages/MultiFactorAuth';
import { RolePermissionsManager } from './pages/RolePermissionsManager';
import { AdminPanel } from './pages/AdminPanel';
import { FeatureManagementPage } from './pages/FeatureManagementPage';
import { AIProviderSettings } from './pages/AIProviderSettings';
import { AdaptiveManagementPage } from './pages/AdaptiveManagementPage';
import { CacheMetricsDashboard } from './pages/CacheMetricsDashboard';
import { NotificationsCenter } from './pages/NotificationsCenter';
import { RealtimeMonitoringPage } from './pages/RealtimeMonitoringPage';
import { VoiceAssistantPage } from './pages/VoiceAssistantPage';
import { AIInsightsPage } from './pages/AIInsightsPage';
import { CustomDashboardBuilder } from './pages/CustomDashboardBuilder';
import { MedicalResearchHub } from './pages/MedicalResearchHub';
import { BayesianCalculatorPage } from './pages/BayesianCalculatorPage';
import { ReportingSystem } from './pages/ReportingSystem';
import { VisualizationsHub } from './pages/VisualizationsHub';
import { SymptomHeatmaps } from './pages/SymptomHeatmaps';
import { MedicalTimeline } from './pages/MedicalTimeline';
import { MedicalImaging } from './pages/MedicalImaging';
import { CameraIntegration } from './pages/CameraIntegration';
import { AnatomicalModels } from './pages/AnatomicalModels';
import { PatientDiaryPage } from './pages/PatientDiaryPage';
import { EncryptionManagement } from './pages/EncryptionManagement';
import { SecurityAuditLogs } from './pages/SecurityAuditLogs';
import { OrganizationManagement } from './pages/OrganizationManagement';
import { PrivacyControls } from './pages/PrivacyControls';
import { LoginPage } from './pages/LoginPage';
import { getCurrentUser } from './services/api';
import './App.css';

function App() {
  const { i18n } = useTranslation();
  const [user, setUser] = useState(getCurrentUser());
  const isMobile = useMobile();

  // Handle authentication
  const handleLogin = (userData: any) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  // If not authenticated, show login
  if (!user) {
    return (
      <ErrorBoundary>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
            <Routes>
              <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        </Router>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
          <Routes>
            {/* Main Dashboard */}
            <Route path="/" element={<DashboardPage user={user} onLogout={handleLogout} />} />
            <Route path="/dashboard" element={<DashboardPage user={user} onLogout={handleLogout} />} />
            
            {/* Clinical Tools */}
            <Route path="/clinical/icd-lookup" element={<ICDLookupPage user={user} onLogout={handleLogout} />} />
            <Route path="/clinical/symptom-checker" element={<SymptomCheckerPage user={user} onLogout={handleLogout} />} />
            <Route path="/clinical/dsm5-assessments" element={<DSM5AssessmentsPage user={user} onLogout={handleLogout} />} />
            <Route path="/clinical/vindicate-m" element={<VindicatemDiagnosisPage user={user} onLogout={handleLogout} />} />
            <Route path="/clinical/fhir" element={<FHIRInteroperabilityPage user={user} onLogout={handleLogout} />} />
            <Route path="/clinical/patient/:id" element={<PatientDetailPage user={user} onLogout={handleLogout} />} />
            
            {/* Analytics & Insights */}
            <Route path="/analytics/dashboard" element={<AnalyticsDashboard user={user} onLogout={handleLogout} />} />
            <Route path="/analytics/outcomes" element={<PatientOutcomesTracker user={user} onLogout={handleLogout} />} />
            <Route path="/analytics/efficacy" element={<TreatmentEfficacyCenter user={user} onLogout={handleLogout} />} />
            <Route path="/analytics/population" element={<PopulationHealthMonitor user={user} onLogout={handleLogout} />} />
            <Route path="/analytics/ai-insights" element={<AIInsightsPage user={user} onLogout={handleLogout} />} />
            <Route path="/analytics/custom-dashboard" element={<CustomDashboardBuilder user={user} onLogout={handleLogout} />} />
            <Route path="/analytics/reporting" element={<ReportingSystem user={user} onLogout={handleLogout} />} />
            <Route path="/analytics/visualizations" element={<VisualizationsHub user={user} onLogout={handleLogout} />} />
            <Route path="/analytics/heatmaps" element={<SymptomHeatmaps user={user} onLogout={handleLogout} />} />
            
            {/* Security & Admin */}
            <Route path="/security/hub" element={<SecurityCenterHub user={user} onLogout={handleLogout} />} />
            <Route path="/security/mfa" element={<MultiFactorAuth user={user} onLogout={handleLogout} />} />
            <Route path="/security/permissions" element={<RolePermissionsManager user={user} onLogout={handleLogout} />} />
            <Route path="/security/audit-logs" element={<SecurityAuditLogs user={user} onLogout={handleLogout} />} />
            <Route path="/security/encryption" element={<EncryptionManagement user={user} onLogout={handleLogout} />} />
            <Route path="/admin" element={<AdminPanel user={user} onLogout={handleLogout} />} />
            <Route path="/admin/organization" element={<OrganizationManagement user={user} onLogout={handleLogout} />} />
            <Route path="/privacy" element={<PrivacyControls user={user} onLogout={handleLogout} />} />
            
            {/* Settings */}
            <Route path="/settings/features" element={<FeatureManagementPage user={user} onLogout={handleLogout} />} />
            <Route path="/settings/ai-providers" element={<AIProviderSettings user={user} onLogout={handleLogout} />} />
            <Route path="/settings/adaptive-management" element={<AdaptiveManagementPage user={user} onLogout={handleLogout} />} />
            <Route path="/settings/cache-metrics" element={<CacheMetricsDashboard user={user} onLogout={handleLogout} />} />
            
            {/* PWA Features */}
            <Route path="/notifications" element={<NotificationsCenter user={user} onLogout={handleLogout} />} />
            <Route path="/monitoring" element={<RealtimeMonitoringPage user={user} onLogout={handleLogout} />} />
            <Route path="/voice-assistant" element={<VoiceAssistantPage user={user} onLogout={handleLogout} />} />
            
            {/* Research & Research */}
            <Route path="/research/hub" element={<MedicalResearchHub user={user} onLogout={handleLogout} />} />
            <Route path="/research/bayesian-calculator" element={<BayesianCalculatorPage user={user} onLogout={handleLogout} />} />
            
            {/* Visualization Tools */}
            <Route path="/timeline" element={<MedicalTimeline user={user} onLogout={handleLogout} />} />
            <Route path="/imaging" element={<MedicalImaging user={user} onLogout={handleLogout} />} />
            <Route path="/camera" element={<CameraIntegration user={user} onLogout={handleLogout} />} />
            <Route path="/anatomical-models" element={<AnatomicalModels user={user} onLogout={handleLogout} />} />
            
            {/* Patient Tools */}
            <Route path="/patient/diary" element={<PatientDiaryPage user={user} onLogout={handleLogout} />} />
            
            {/* Redirect root to dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
