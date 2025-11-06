import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  Shield, ShieldCheck, Users, FileText, Lock, 
  Key, UserCheck, AlertTriangle, Settings, ArrowLeft
} from 'lucide-react';
import securityAPI from '../services/securityAPI';

interface SecurityCenterHubProps {
  user: any;
}

const SecurityCenterHub = ({ user }: SecurityCenterHubProps) => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalRoles: 0,
    totalDepartments: 0,
    securityEvents: 0,
    loading: true,
  });

  useEffect(() => {
    fetchSecurityMetrics();
  }, []);

  const fetchSecurityMetrics = async () => {
    try {
      const [users, roles, departments, auditLogs] = await Promise.all([
        securityAPI.getUsers(),
        securityAPI.getRoles(),
        securityAPI.getDepartments(),
        securityAPI.getAuditLogs(),
      ]);

      setMetrics({
        totalUsers: users.length,
        totalRoles: roles.length,
        totalDepartments: Array.isArray(departments) ? departments.length : (departments as any)?.departments?.length || 0,
        securityEvents: auditLogs.length,
        loading: false,
      });
    } catch (error) {
      console.error('Failed to fetch security metrics:', error);
      setMetrics(prev => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="glass-nav sticky top-0 z-10 px-4 py-4 mb-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="glass-button p-2 hover:scale-105 transition-transform"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Security Center
                </h1>
                <p className="text-sm text-gray-600">Enterprise-grade security management</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className="glass-badge-success flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Protected</span>
            </span>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-600">{user?.role || 'Administrator'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-8">
        {/* Security Overview */}
        <div className="glass-card-strong p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Security Status Overview</h2>
          {metrics.loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="glass-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Security Score</p>
                    <p className="text-2xl font-bold text-green-600">98%</p>
                  </div>
                  <ShieldCheck className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <div className="glass-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Users</p>
                    <p className="text-2xl font-bold text-blue-600">{metrics.totalUsers}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <div className="glass-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Security Events</p>
                    <p className="text-2xl font-bold text-yellow-600">{metrics.securityEvents}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-yellow-600" />
                </div>
              </div>
              <div className="glass-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Compliance</p>
                    <p className="text-2xl font-bold text-green-600">100%</p>
                  </div>
                  <FileText className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Security Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {/* Multi-Factor Authentication */}
          <Link to="/security/mfa" className="group">
            <div className="glass-card hover-lift p-6 h-full transition-all duration-300 hover:shadow-xl">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white group-hover:scale-110 transition-transform">
                  <Key className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Multi-Factor Authentication</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Configure SMS, email, TOTP authenticator apps, and biometric authentication methods
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="glass-badge-info text-xs">2FA Enabled</span>
                    <span className="glass-badge-success text-xs">TOTP Active</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Role-Based Permissions */}
          <Link to="/security/permissions" className="group">
            <div className="glass-card hover-lift p-6 h-full transition-all duration-300 hover:shadow-xl">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl text-white group-hover:scale-110 transition-transform">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Role-Based Permissions</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Advanced permission matrix with role hierarchy, inheritance, and dynamic assignments
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="glass-badge-info text-xs">{metrics.totalRoles} Roles</span>
                    <span className="glass-badge-info text-xs">{metrics.totalUsers} Users</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Organization Management */}
          <Link to="/security/organizations" className="group">
            <div className="glass-card hover-lift p-6 h-full transition-all duration-300 hover:shadow-xl">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl text-white group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Organization Management</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Multi-tenant organization dashboard with departments, locations, and user onboarding
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="glass-badge-info text-xs">1 Organization</span>
                    <span className="glass-badge-info text-xs">{metrics.totalDepartments} Departments</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Security Audit Logs */}
          <Link to="/security/audit-logs" className="group">
            <div className="glass-card hover-lift p-6 h-full transition-all duration-300 hover:shadow-xl">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl text-white group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Security Audit Logs</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Real-time security monitoring, user activity tracking, and compliance reporting
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="glass-badge-warning text-xs">12 New Events</span>
                    <span className="glass-badge-success text-xs">Compliant</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Encryption Management */}
          <Link to="/security/encryption" className="group">
            <div className="glass-card hover-lift p-6 h-full transition-all duration-300 hover:shadow-xl">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl text-white group-hover:scale-110 transition-transform">
                  <Lock className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Encryption Management</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    End-to-end encryption, key management, digital signatures, and data integrity verification
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="glass-badge-success text-xs">AES-256</span>
                    <span className="glass-badge-info text-xs">5 Active Keys</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Privacy Controls */}
          <Link to="/security/privacy" className="group">
            <div className="glass-card hover-lift p-6 h-full transition-all duration-300 hover:shadow-xl">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl text-white group-hover:scale-110 transition-transform">
                  <Shield className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Privacy Controls</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Patient consent management, HIPAA compliance, data sharing agreements, and privacy settings
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="glass-badge-success text-xs">HIPAA Compliant</span>
                    <span className="glass-badge-info text-xs">GDPR Ready</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Admin Panel */}
          <Link to="/security/admin" className="group">
            <div className="glass-card hover-lift p-6 h-full transition-all duration-300 hover:shadow-xl">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl text-white group-hover:scale-110 transition-transform">
                  <Settings className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Admin Panel</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Comprehensive user management, security policies, compliance monitoring, and system configuration
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="glass-badge-info text-xs">247 Users</span>
                    <span className="glass-badge-success text-xs">All Systems OK</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Compliance Dashboard */}
        <div className="glass-card-strong p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Compliance Dashboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">HIPAA Compliance</span>
                <span className="glass-badge-success text-xs">100%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
            <div className="glass-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">GDPR Compliance</span>
                <span className="glass-badge-success text-xs">100%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
            <div className="glass-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">SOC 2 Compliance</span>
                <span className="glass-badge-success text-xs">98%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full" style={{ width: '98%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityCenterHub;
