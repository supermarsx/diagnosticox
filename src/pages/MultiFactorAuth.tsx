import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Shield, Smartphone, Mail, Key, Fingerprint,
  CheckCircle, XCircle, Plus, Trash2, RefreshCw, Download,
  AlertCircle, Clock, Globe, Loader
} from 'lucide-react';
import securityAPI from '../services/securityAPI';

interface MultiFactorAuthProps {
  user: any;
}

interface AuthMethod {
  id: string;
  type: 'sms' | 'email' | 'totp' | 'biometric';
  identifier: string;
  enabled: boolean;
  verified: boolean;
  addedDate: string;
  lastUsed?: string;
}

const MultiFactorAuth = ({ user }: MultiFactorAuthProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'methods' | 'backup' | 'trusted' | 'recovery'>('methods');
  const [showAddMethod, setShowAddMethod] = useState(false);
  const [selectedMethodType, setSelectedMethodType] = useState<'sms' | 'email' | 'totp' | 'biometric'>('sms');
  const [authMethods, setAuthMethods] = useState<AuthMethod[]>([]);
  const [trustedDevices, setTrustedDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch authentication methods and trusted devices
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userId = user?.id || '1'; // Default to user ID 1 if not available
        
        // Fetch auth methods
        const authResponse = await securityAPI.getAuthMethods(userId);
        const mappedMethods: AuthMethod[] = (authResponse.authMethods || []).map((method: any) => ({
          id: method.id?.toString() || '',
          type: method.method_type || 'sms',
          identifier: method.identifier || '',
          enabled: method.enabled || false,
          verified: method.verified || false,
          addedDate: method.added_date?.split('T')[0] || '',
          lastUsed: method.last_used?.split('T')[0]
        }));
        setAuthMethods(mappedMethods);
        
        // Fetch trusted devices
        const devicesResponse = await securityAPI.getTrustedDevices(userId);
        setTrustedDevices(devicesResponse.devices || []);
        
        setError(null);
      } catch (err: any) {
        console.error('Error fetching MFA data:', err);
        setError(err.message || 'Failed to load authentication data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  // Backup codes
  const [backupCodes] = useState([
    'A1B2-C3D4-E5F6',
    'G7H8-I9J0-K1L2',
    'M3N4-O5P6-Q7R8',
    'S9T0-U1V2-W3X4',
    'Y5Z6-A7B8-C9D0'
  ]);



  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'sms': return <Smartphone className="w-5 h-5" />;
      case 'email': return <Mail className="w-5 h-5" />;
      case 'totp': return <Key className="w-5 h-5" />;
      case 'biometric': return <Fingerprint className="w-5 h-5" />;
      default: return <Shield className="w-5 h-5" />;
    }
  };

  const getMethodName = (type: string) => {
    switch (type) {
      case 'sms': return 'SMS Authentication';
      case 'email': return 'Email Authentication';
      case 'totp': return 'Authenticator App (TOTP)';
      case 'biometric': return 'Biometric Authentication';
      default: return 'Unknown';
    }
  };

  const handleToggleMethod = (id: string) => {
    setAuthMethods(prev =>
      prev.map(method =>
        method.id === id ? { ...method, enabled: !method.enabled } : method
      )
    );
  };

  const handleRemoveMethod = (id: string) => {
    if (confirm('Are you sure you want to remove this authentication method?')) {
      setAuthMethods(prev => prev.filter(method => method.id !== id));
    }
  };

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
              <Key className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Multi-Factor Authentication
                </h1>
                <p className="text-sm text-gray-600">Secure your account with multiple verification methods</p>
              </div>
            </div>
          </div>
          <span className="glass-badge-success flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span>2FA Enabled</span>
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-8">
        {/* Loading State */}
        {loading && (
          <div className="glass-card p-12 text-center">
            <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading authentication settings...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="glass-card p-8 text-center border border-red-200 bg-red-50">
            <div className="text-red-600 mb-2">⚠️ Error</div>
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
        {/* Security Status Banner */}
        <div className="glass-card-strong p-6 mb-6">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl text-white">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Your Account is Secure</h3>
              <p className="text-sm text-gray-600">
                You have 3 active authentication methods enabled. Multi-factor authentication adds an extra layer of security to your account.
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="glass-card mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('methods')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'methods'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Authentication Methods
            </button>
            <button
              onClick={() => setActiveTab('backup')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'backup'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Backup Codes
            </button>
            <button
              onClick={() => setActiveTab('trusted')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'trusted'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Trusted Devices
            </button>
            <button
              onClick={() => setActiveTab('recovery')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'recovery'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Recovery Options
            </button>
          </div>
        </div>

        {/* Authentication Methods Tab */}
        {activeTab === 'methods' && (
          <div className="space-y-6">
            {/* Add Method Button */}
            <div className="flex justify-end">
              <button
                onClick={() => setShowAddMethod(!showAddMethod)}
                className="glass-button-primary flex items-center space-x-2 px-6 py-3"
              >
                <Plus className="w-5 h-5" />
                <span>Add Authentication Method</span>
              </button>
            </div>

            {/* Add Method Form */}
            {showAddMethod && (
              <div className="glass-card-strong p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Add New Authentication Method</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <button
                    onClick={() => setSelectedMethodType('sms')}
                    className={`glass-card p-4 hover-lift ${
                      selectedMethodType === 'sms' ? 'ring-2 ring-blue-600' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Smartphone className="w-6 h-6 text-blue-600" />
                      <div className="text-left">
                        <p className="font-medium text-gray-900">SMS</p>
                        <p className="text-sm text-gray-600">Receive codes via text</p>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => setSelectedMethodType('email')}
                    className={`glass-card p-4 hover-lift ${
                      selectedMethodType === 'email' ? 'ring-2 ring-blue-600' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Mail className="w-6 h-6 text-purple-600" />
                      <div className="text-left">
                        <p className="font-medium text-gray-900">Email</p>
                        <p className="text-sm text-gray-600">Receive codes via email</p>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => setSelectedMethodType('totp')}
                    className={`glass-card p-4 hover-lift ${
                      selectedMethodType === 'totp' ? 'ring-2 ring-blue-600' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Key className="w-6 h-6 text-green-600" />
                      <div className="text-left">
                        <p className="font-medium text-gray-900">Authenticator App</p>
                        <p className="text-sm text-gray-600">Use TOTP apps</p>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => setSelectedMethodType('biometric')}
                    className={`glass-card p-4 hover-lift ${
                      selectedMethodType === 'biometric' ? 'ring-2 ring-blue-600' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Fingerprint className="w-6 h-6 text-red-600" />
                      <div className="text-left">
                        <p className="font-medium text-gray-900">Biometric</p>
                        <p className="text-sm text-gray-600">Fingerprint or face ID</p>
                      </div>
                    </div>
                  </button>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowAddMethod(false)}
                    className="glass-button px-4 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      alert(`Adding ${getMethodName(selectedMethodType)}...`);
                      setShowAddMethod(false);
                    }}
                    className="glass-button-primary px-6 py-2"
                  >
                    Continue Setup
                  </button>
                </div>
              </div>
            )}

            {/* Methods List */}
            <div className="space-y-4">
              {authMethods.map((method) => (
                <div key={method.id} className="glass-card p-6 hover-lift">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-xl text-white ${
                        method.type === 'sms' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                        method.type === 'email' ? 'bg-gradient-to-br from-purple-500 to-purple-600' :
                        method.type === 'totp' ? 'bg-gradient-to-br from-green-500 to-green-600' :
                        'bg-gradient-to-br from-red-500 to-red-600'
                      }`}>
                        {getMethodIcon(method.type)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-bold text-gray-900">{getMethodName(method.type)}</h3>
                          {method.verified && (
                            <span className="glass-badge-success flex items-center space-x-1">
                              <CheckCircle className="w-3 h-3" />
                              <span className="text-xs">Verified</span>
                            </span>
                          )}
                          {method.enabled && (
                            <span className="glass-badge-info flex items-center space-x-1">
                              <Shield className="w-3 h-3" />
                              <span className="text-xs">Active</span>
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{method.identifier}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>Added: {new Date(method.addedDate).toLocaleDateString()}</span>
                          {method.lastUsed && (
                            <span>Last used: {new Date(method.lastUsed).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={method.enabled}
                          onChange={() => handleToggleMethod(method.id)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                      <button
                        onClick={() => handleRemoveMethod(method.id)}
                        className="glass-button p-2 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Backup Codes Tab */}
        {activeTab === 'backup' && (
          <div className="space-y-6">
            <div className="glass-card-strong p-6">
              <div className="flex items-start space-x-4 mb-6">
                <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Important: Save Your Backup Codes</h3>
                  <p className="text-sm text-gray-600">
                    Each backup code can only be used once. Store these codes in a safe place. If you lose access to your authentication methods, you can use these codes to regain access to your account.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {backupCodes.map((code, index) => (
                  <div key={index} className="glass-card p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-lg font-bold text-gray-900">{code}</span>
                      <span className="glass-badge-success text-xs">Unused</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between">
                <button className="glass-button flex items-center space-x-2 px-6 py-3">
                  <RefreshCw className="w-5 h-5" />
                  <span>Generate New Codes</span>
                </button>
                <button className="glass-button-primary flex items-center space-x-2 px-6 py-3">
                  <Download className="w-5 h-5" />
                  <span>Download Codes</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Trusted Devices Tab */}
        {activeTab === 'trusted' && (
          <div className="space-y-4">
            <div className="glass-card-strong p-6 mb-4">
              <p className="text-sm text-gray-600">
                Devices you've marked as trusted won't require two-factor authentication for 30 days. You can remove any device at any time.
              </p>
            </div>

            {trustedDevices.map((device) => (
              <div key={device.id} className="glass-card p-6 hover-lift">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white">
                      <Globe className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{device.name}</h3>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                        <span>{device.location}</span>
                        <span>IP: {device.ip}</span>
                      </div>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                        <span>Added: {new Date(device.addedDate).toLocaleDateString()}</span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>Last active: {device.lastActive}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="glass-button p-2 text-red-600 hover:bg-red-50">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recovery Options Tab */}
        {activeTab === 'recovery' && (
          <div className="space-y-6">
            <div className="glass-card-strong p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Account Recovery Options</h3>
              <p className="text-sm text-gray-600 mb-6">
                Set up recovery options to regain access to your account if you lose your authentication methods.
              </p>

              <div className="space-y-4">
                <div className="glass-card p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Mail className="w-6 h-6 text-blue-600" />
                      <div>
                        <h4 className="font-bold text-gray-900">Recovery Email</h4>
                        <p className="text-sm text-gray-600">recovery@example.com</p>
                      </div>
                    </div>
                    <span className="glass-badge-success">Verified</span>
                  </div>
                </div>

                <div className="glass-card p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Smartphone className="w-6 h-6 text-green-600" />
                      <div>
                        <h4 className="font-bold text-gray-900">Recovery Phone</h4>
                        <p className="text-sm text-gray-600">+1 (555) 987-6543</p>
                      </div>
                    </div>
                    <span className="glass-badge-success">Verified</span>
                  </div>
                </div>

                <div className="glass-card p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Key className="w-6 h-6 text-purple-600" />
                      <div>
                        <h4 className="font-bold text-gray-900">Security Questions</h4>
                        <p className="text-sm text-gray-600">3 questions configured</p>
                      </div>
                    </div>
                    <button className="glass-button px-4 py-2">Update</button>
                  </div>
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

export default MultiFactorAuth;
