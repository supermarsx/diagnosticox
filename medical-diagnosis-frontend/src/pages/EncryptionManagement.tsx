import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Lock, Key, Shield, RefreshCw, Download,
  Upload, CheckCircle, AlertTriangle, FileKey, Award,
  Clock, TrendingUp, Settings, Loader
} from 'lucide-react';
import securityAPI from '../services/securityAPI';

interface EncryptionKey {
  id: string;
  name: string;
  algorithm: string;
  keySize: number;
  purpose: string;
  status: 'active' | 'rotating' | 'retired';
  createdDate: string;
  expiryDate: string;
  lastRotation?: string;
  usageCount: number;
}

interface EncryptionManagementProps {
  user: any;
}

const EncryptionManagement = ({ user }: EncryptionManagementProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'keys' | 'certificates' | 'status' | 'compliance'>('keys');
  const [encryptionKeys, setEncryptionKeys] = useState<EncryptionKey[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch encryption keys and certificates
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch encryption keys
        const keysResponse = await securityAPI.getEncryptionKeys();
        const mappedKeys: EncryptionKey[] = (keysResponse.keys || []).map((key: any) => ({
          id: key.id?.toString() || '',
          name: key.key_name || '',
          algorithm: key.algorithm || 'AES-256-GCM',
          keySize: key.key_size || 256,
          purpose: key.purpose || '',
          status: key.status || 'active',
          createdDate: key.created_at?.split('T')[0] || '',
          expiryDate: key.expires_at?.split('T')[0] || '',
          lastRotation: key.last_rotated?.split('T')[0],
          usageCount: key.usage_count || 0
        }));
        setEncryptionKeys(mappedKeys);
        
        // Fetch certificates
        const certsResponse = await securityAPI.getCertificates();
        setCertificates(certsResponse.certificates || []);
        
        setError(null);
      } catch (err: any) {
        console.error('Error fetching encryption data:', err);
        setError(err.message || 'Failed to load encryption data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <span className="glass-badge-success">Active</span>;
      case 'rotating': return <span className="glass-badge-warning">Rotating</span>;
      case 'retired': return <span className="glass-badge">Retired</span>;
      case 'valid': return <span className="glass-badge-success">Valid</span>;
      case 'expiring': return <span className="glass-badge-warning">Expiring Soon</span>;
      default: return <span className="glass-badge">Unknown</span>;
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
              <Lock className="w-8 h-8 text-red-600" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                  Encryption Management
                </h1>
                <p className="text-sm text-gray-600">Cryptographic key management and data integrity</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="glass-badge-success flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>AES-256 Encrypted</span>
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-8">
        {/* Loading State */}
        {loading && (
          <div className="glass-card p-12 text-center">
            <Loader className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading encryption data...</p>
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
        {/* Security Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Keys</p>
                <p className="text-2xl font-bold text-green-600">5</p>
              </div>
              <Key className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Certificates</p>
                <p className="text-2xl font-bold text-blue-600">3</p>
              </div>
              <Award className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Encrypted Data</p>
                <p className="text-2xl font-bold text-purple-600">2.4 TB</p>
              </div>
              <Shield className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Operations/Day</p>
                <p className="text-2xl font-bold text-orange-600">1.2M</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="glass-card mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('keys')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'keys'
                  ? 'text-red-600 border-b-2 border-red-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Encryption Keys
            </button>
            <button
              onClick={() => setActiveTab('certificates')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'certificates'
                  ? 'text-red-600 border-b-2 border-red-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Certificates
            </button>
            <button
              onClick={() => setActiveTab('status')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'status'
                  ? 'text-red-600 border-b-2 border-red-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Encryption Status
            </button>
            <button
              onClick={() => setActiveTab('compliance')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'compliance'
                  ? 'text-red-600 border-b-2 border-red-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Compliance
            </button>
          </div>
        </div>

        {/* Encryption Keys Tab */}
        {activeTab === 'keys' && (
          <div className="space-y-4">
            <div className="flex justify-end mb-4">
              <button className="glass-button-primary flex items-center space-x-2 px-6 py-3">
                <Key className="w-5 h-5" />
                <span>Generate New Key</span>
              </button>
            </div>

            {encryptionKeys.map((key) => (
              <div key={key.id} className="glass-card p-6 hover-lift">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-xl text-white ${
                      key.status === 'active' ? 'bg-gradient-to-br from-green-500 to-green-600' :
                      key.status === 'rotating' ? 'bg-gradient-to-br from-yellow-500 to-yellow-600' :
                      'bg-gradient-to-br from-gray-500 to-gray-600'
                    }`}>
                      <Key className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{key.name}</h3>
                        {getStatusBadge(key.status)}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-3">
                        <div>
                          <p className="text-gray-600">Algorithm</p>
                          <p className="font-medium text-gray-900">{key.algorithm}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Key Size</p>
                          <p className="font-medium text-gray-900">{key.keySize} bits</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Purpose</p>
                          <p className="font-medium text-gray-900">{key.purpose}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Usage Count</p>
                          <p className="font-medium text-gray-900">{key.usageCount.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mt-3">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">
                            Created: {new Date(key.createdDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">
                            Expires: {new Date(key.expiryDate).toLocaleDateString()}
                          </span>
                        </div>
                        {key.lastRotation && (
                          <div className="flex items-center space-x-2">
                            <RefreshCw className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-600">
                              Last Rotation: {new Date(key.lastRotation).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {key.status === 'active' && (
                      <button className="glass-button flex items-center space-x-2 px-4 py-2">
                        <RefreshCw className="w-4 h-4" />
                        <span>Rotate</span>
                      </button>
                    )}
                    <button className="glass-button p-2">
                      <Settings className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Certificates Tab */}
        {activeTab === 'certificates' && (
          <div className="space-y-4">
            <div className="flex justify-end mb-4">
              <button className="glass-button-primary flex items-center space-x-2 px-6 py-3">
                <Upload className="w-5 h-5" />
                <span>Upload Certificate</span>
              </button>
            </div>

            {certificates.map((cert) => (
              <div key={cert.id} className="glass-card p-6 hover-lift">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{cert.name}</h3>
                        {getStatusBadge(cert.status)}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-3">
                        <div>
                          <p className="text-gray-600">Type</p>
                          <p className="font-medium text-gray-900">{cert.type}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Issuer</p>
                          <p className="font-medium text-gray-900">{cert.issuer}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Valid From</p>
                          <p className="font-medium text-gray-900">
                            {new Date(cert.validFrom).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Valid Until</p>
                          <p className="font-medium text-gray-900">
                            {new Date(cert.validUntil).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <p className="text-sm text-gray-600">Domains:</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {cert.domains.map((domain, idx) => (
                            <span key={idx} className="glass-badge-info text-xs">{domain}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="glass-button flex items-center space-x-2 px-4 py-2">
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Encryption Status Tab */}
        {activeTab === 'status' && (
          <div className="space-y-6">
            <div className="glass-card-strong p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Data Encryption Status</h2>
              <div className="space-y-4">
                <div className="glass-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-gray-900">Patient Records Database</span>
                    </div>
                    <span className="glass-badge-success">Encrypted</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">AES-256-GCM | 1.2 TB | Last verified: 2 hours ago</p>
                </div>

                <div className="glass-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-gray-900">Medical Imaging Storage</span>
                    </div>
                    <span className="glass-badge-success">Encrypted</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">AES-256-GCM | 0.8 TB | Last verified: 1 hour ago</p>
                </div>

                <div className="glass-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-gray-900">Backup Storage</span>
                    </div>
                    <span className="glass-badge-success">Encrypted</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">AES-256-GCM | 0.4 TB | Last verified: 30 minutes ago</p>
                </div>
              </div>
            </div>

            <div className="glass-card-strong p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Data Integrity Verification</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">Last Full Verification</span>
                  <span className="font-medium text-gray-900">2025-11-05 03:00 AM</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">Files Verified</span>
                  <span className="font-medium text-gray-900">1,234,567</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">Integrity Status</span>
                  <span className="glass-badge-success">100% Verified</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">Next Scheduled Verification</span>
                  <span className="font-medium text-gray-900">2025-11-07 03:00 AM</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Compliance Tab */}
        {activeTab === 'compliance' && (
          <div className="space-y-6">
            <div className="glass-card-strong p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Encryption Standards Compliance</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-card p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <h3 className="font-bold text-gray-900">FIPS 140-2 Level 3</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Cryptographic modules meet federal standards for encryption
                  </p>
                </div>
                <div className="glass-card p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <h3 className="font-bold text-gray-900">HIPAA Security Rule</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    PHI encryption meets HIPAA technical safeguards
                  </p>
                </div>
                <div className="glass-card p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <h3 className="font-bold text-gray-900">NIST SP 800-53</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Security controls align with NIST recommendations
                  </p>
                </div>
                <div className="glass-card p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <h3 className="font-bold text-gray-900">PCI DSS 3.2</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Payment data encryption meets industry standards
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

export default EncryptionManagement;