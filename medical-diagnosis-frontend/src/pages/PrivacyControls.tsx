import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Shield, Eye, EyeOff, Download, Share2,
  CheckCircle, XCircle, FileText, Users, Globe, Lock,
  AlertTriangle, Settings, Calendar, Database, Loader
} from 'lucide-react';
import securityAPI from '../services/securityAPI';

interface PrivacyControlsProps {
  user: any;
}

const PrivacyControls = ({ user }: PrivacyControlsProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'consent' | 'settings' | 'sharing' | 'compliance'>('consent');
  const [consentRecords, setConsentRecords] = useState<any[]>([]);
  const [sharingAgreements, setSharingAgreements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch consent records and sharing agreements
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [consents, agreements] = await Promise.all([
          securityAPI.getConsentRecords(),
          securityAPI.getSharingAgreements()
        ]);
        setConsentRecords(consents || []);
        setSharingAgreements(agreements || []);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching privacy data:', err);
        setError(err.message || 'Failed to load privacy data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);



  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    dataRetention: {
      enabled: true,
      period: 7,
      autoDelete: true
    },
    accessLogging: {
      enabled: true,
      detailLevel: 'comprehensive'
    },
    anonymization: {
      enabled: true,
      method: 'k-anonymity'
    },
    rightToForgotten: {
      enabled: true,
      processingTime: 30
    },
    dataPortability: {
      enabled: true,
      formats: ['JSON', 'CSV', 'PDF']
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="glass-nav sticky top-0 z-10 px-4 py-4 mb-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/security')}
              className="glass-button p-2 hover:scale-105 transition-transform"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-indigo-600" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Privacy Controls
                </h1>
                <p className="text-sm text-gray-600">Patient consent management and data sharing controls</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="glass-badge-success flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>HIPAA Compliant</span>
            </span>
            <span className="glass-badge-info flex items-center space-x-2">
              <Globe className="w-4 h-4" />
              <span>GDPR Ready</span>
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-8">
        {/* Loading State */}
        {loading && (
          <div className="glass-card p-12 text-center">
            <Loader className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading privacy data...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="glass-card p-8 text-center border border-red-200 bg-red-50">
            <div className="text-red-600 mb-2">Warning: Error</div>
            <p className="text-gray-700">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="glass-button-primary mt-4"
            >
              Retry
            </button>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
        {/* Privacy Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Consents</p>
                <p className="text-2xl font-bold text-green-600">3,456</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sharing Agreements</p>
                <p className="text-2xl font-bold text-blue-600">3</p>
              </div>
              <Share2 className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Access Requests</p>
                <p className="text-2xl font-bold text-purple-600">42</p>
              </div>
              <Eye className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Compliance Score</p>
                <p className="text-2xl font-bold text-green-600">100%</p>
              </div>
              <Shield className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="glass-card mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('consent')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'consent'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Patient Consent
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'settings'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Privacy Settings
            </button>
            <button
              onClick={() => setActiveTab('sharing')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'sharing'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Data Sharing
            </button>
            <button
              onClick={() => setActiveTab('compliance')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'compliance'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Compliance
            </button>
          </div>
        </div>

        {/* Patient Consent Tab */}
        {activeTab === 'consent' && (
          <div className="space-y-4">
            {consentRecords.map((consent) => (
              <div key={consent.id} className="glass-card p-6 hover-lift">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-xl text-white ${
                      consent.status === 'granted'
                        ? 'bg-gradient-to-br from-green-500 to-green-600'
                        : 'bg-gradient-to-br from-red-500 to-red-600'
                    }`}>
                      {consent.status === 'granted' ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <XCircle className="w-6 h-6" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{consent.patientName}</h3>
                        <span className="text-sm text-gray-600">({consent.patientId})</span>
                        {consent.status === 'granted' ? (
                          <span className="glass-badge-success">Granted</span>
                        ) : (
                          <span className="glass-badge-danger">Denied</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mb-3">{consent.consentType}</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Granted Date</p>
                          <p className="font-medium text-gray-900">
                            {new Date(consent.grantedDate).toLocaleDateString()}
                          </p>
                        </div>
                        {consent.expiryDate && (
                          <div>
                            <p className="text-gray-600">Expiry Date</p>
                            <p className="font-medium text-gray-900">
                              {new Date(consent.expiryDate).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                        {consent.scope.length > 0 && (
                          <div className="md:col-span-2">
                            <p className="text-gray-600 mb-2">Scope</p>
                            <div className="flex flex-wrap gap-2">
                              {consent.scope.map((item, idx) => (
                                <span key={idx} className="glass-badge-info text-xs">{item}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="glass-button p-2">
                      <Eye className="w-5 h-5" />
                    </button>
                    <button className="glass-button p-2">
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Privacy Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="glass-card-strong p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Data Retention Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 glass-card">
                  <div>
                    <h3 className="font-bold text-gray-900">Automatic Data Retention</h3>
                    <p className="text-sm text-gray-600">Automatically manage data lifecycle</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacySettings.dataRetention.enabled}
                      onChange={() => setPrivacySettings({
                        ...privacySettings,
                        dataRetention: {
                          ...privacySettings.dataRetention,
                          enabled: !privacySettings.dataRetention.enabled
                        }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 glass-card">
                  <div>
                    <h3 className="font-bold text-gray-900">Comprehensive Access Logging</h3>
                    <p className="text-sm text-gray-600">Log all data access events</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacySettings.accessLogging.enabled}
                      onChange={() => {}}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 glass-card">
                  <div>
                    <h3 className="font-bold text-gray-900">Data Anonymization</h3>
                    <p className="text-sm text-gray-600">Apply k-anonymity for research data</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacySettings.anonymization.enabled}
                      onChange={() => {}}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 glass-card">
                  <div>
                    <h3 className="font-bold text-gray-900">Right to be Forgotten</h3>
                    <p className="text-sm text-gray-600">Support GDPR data deletion requests</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacySettings.rightToForgotten.enabled}
                      onChange={() => {}}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 glass-card">
                  <div>
                    <h3 className="font-bold text-gray-900">Data Portability</h3>
                    <p className="text-sm text-gray-600">Enable patient data export</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacySettings.dataPortability.enabled}
                      onChange={() => {}}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Data Sharing Tab */}
        {activeTab === 'sharing' && (
          <div className="space-y-4">
            {sharingAgreements.map((agreement) => (
              <div key={agreement.id} className="glass-card p-6 hover-lift">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white">
                      <Share2 className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{agreement.partner}</h3>
                        <span className="glass-badge-success">Active</span>
                      </div>
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="glass-badge-info text-xs">{agreement.type}</span>
                        <span className="text-sm text-gray-600">{agreement.purpose}</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                        <div>
                          <p className="text-gray-600">Start Date</p>
                          <p className="font-medium text-gray-900">
                            {new Date(agreement.startDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Review Date</p>
                          <p className="font-medium text-gray-900">
                            {new Date(agreement.reviewDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Patients Covered</p>
                          <p className="font-medium text-gray-900">{agreement.patientCount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Data Types</p>
                          <p className="font-medium text-gray-900">{agreement.dataTypes.length}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Shared Data Types:</p>
                        <div className="flex flex-wrap gap-2">
                          {agreement.dataTypes.map((type, idx) => (
                            <span key={idx} className="glass-badge text-xs">{type}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <button className="glass-button p-2">
                    <Settings className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Compliance Tab */}
        {activeTab === 'compliance' && (
          <div className="space-y-6">
            <div className="glass-card-strong p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">HIPAA Compliance Dashboard</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-card p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <h3 className="font-bold text-gray-900">Privacy Rule Compliance</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    PHI is protected with appropriate safeguards
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
                <div className="glass-card p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <h3 className="font-bold text-gray-900">Security Rule Compliance</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    ePHI security measures implemented
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
                <div className="glass-card p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <h3 className="font-bold text-gray-900">Breach Notification Rule</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Breach notification procedures in place
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
                <div className="glass-card p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <h3 className="font-bold text-gray-900">Business Associate Agreements</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    All BAAs signed and compliant
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card-strong p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">GDPR Compliance Dashboard</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-card p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <h3 className="font-bold text-gray-900">Data Subject Rights</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Access, rectification, erasure, and portability supported
                  </p>
                </div>
                <div className="glass-card p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <h3 className="font-bold text-gray-900">Lawful Basis for Processing</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Consent and legitimate interest documented
                  </p>
                </div>
                <div className="glass-card p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <h3 className="font-bold text-gray-900">Data Protection Impact Assessment</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    DPIAs conducted for high-risk processing
                  </p>
                </div>
                <div className="glass-card p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <h3 className="font-bold text-gray-900">Data Protection Officer</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    DPO appointed and contact details published
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        </>
        )}
      </div>
    </div>
  );
};

export default PrivacyControls;