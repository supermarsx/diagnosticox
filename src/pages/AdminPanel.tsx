import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Settings, Users, Shield, Activity, TrendingUp,
  Search, Filter, Plus, Edit, Trash2, Lock, Unlock,
  Mail, Phone, MapPin, Calendar, Clock, AlertTriangle,
  CheckCircle, XCircle, Download, Upload, RefreshCw, Loader
} from 'lucide-react';
import securityAPI from '../services/securityAPI';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  organization: string;
  status: 'active' | 'inactive' | 'locked';
  lastLogin: string;
  createdDate: string;
  mfaEnabled: boolean;
}

interface AdminPanelProps {
  user: any;
}

const AdminPanel = ({ user }: AdminPanelProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'users' | 'security' | 'system' | 'logs'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [users, setUsers] = useState<User[]>([]);
  const [securityPolicies, setSecurityPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch users and security policies
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersData, policiesData] = await Promise.all([
          securityAPI.getUsers(),
          securityAPI.getSecurityPolicies()
        ]);
        
        // Map users data
        const mappedUsers: User[] = (usersData || []).map((u: any) => ({
          id: u.id?.toString() || '',
          name: u.full_name || u.email || 'Unknown',
          email: u.email || '',
          role: u.role || 'User',
          department: u.department || 'N/A',
          organization: u.organization || 'Default',
          status: u.status || 'active',
          lastLogin: u.last_login || new Date().toISOString(),
          createdDate: u.created_at?.split('T')[0] || '',
          mfaEnabled: u.mfa_enabled || false
        }));
        
        setUsers(mappedUsers);
        setSecurityPolicies(policiesData || []);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching admin data:', err);
        setError(err.message || 'Failed to load admin data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const systemMetrics = {
    totalUsers: 247,
    activeUsers: 234,
    inactiveUsers: 10,
    lockedUsers: 3,
    newUsersThisMonth: 15,
    activeNow: 42,
    systemUptime: '99.98%',
    avgResponseTime: '124ms'
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <span className="glass-badge-success">Active</span>;
      case 'inactive': return <span className="glass-badge-warning">Inactive</span>;
      case 'locked': return <span className="glass-badge-danger">Locked</span>;
      default: return <span className="glass-badge">Unknown</span>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'inactive': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'locked': return <XCircle className="w-5 h-5 text-red-600" />;
      default: return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  const filteredUsers = users.filter(u => {
    if (filterRole !== 'all' && u.role !== filterRole) return false;
    if (filterStatus !== 'all' && u.status !== filterStatus) return false;
    if (searchQuery && !u.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !u.email.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
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
              <Settings className="w-8 h-8 text-gray-700" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
                  Admin Panel
                </h1>
                <p className="text-sm text-gray-600">System administration and user management</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="glass-badge-success flex items-center space-x-2">
              <Activity className="w-4 h-4" />
              <span>System Healthy</span>
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-8">
        {/* Loading State */}
        {loading && (
          <div className="glass-card p-12 text-center">
            <Loader className="w-12 h-12 text-teal-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading admin data...</p>
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
        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{systemMetrics.totalUsers}</p>
                <p className="text-xs text-green-600 mt-1 flex items-center space-x-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>+{systemMetrics.newUsersThisMonth} this month</span>
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-green-600">{systemMetrics.activeUsers}</p>
                <p className="text-xs text-gray-500 mt-1">{systemMetrics.activeNow} online now</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">System Uptime</p>
                <p className="text-2xl font-bold text-purple-600">{systemMetrics.systemUptime}</p>
                <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Response Time</p>
                <p className="text-2xl font-bold text-orange-600">{systemMetrics.avgResponseTime}</p>
                <p className="text-xs text-gray-500 mt-1">System performance</p>
              </div>
              <Activity className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="glass-card mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'users'
                  ? 'text-gray-900 border-b-2 border-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              User Management
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'security'
                  ? 'text-gray-900 border-b-2 border-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Security Policies
            </button>
            <button
              onClick={() => setActiveTab('system')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'system'
                  ? 'text-gray-900 border-b-2 border-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              System Configuration
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'logs'
                  ? 'text-gray-900 border-b-2 border-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Activity Logs
            </button>
          </div>
        </div>

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="glass-card-strong p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search Users</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="glass-input w-full pl-10 pr-4 py-2"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="glass-input w-full px-4 py-2"
                  >
                    <option value="all">All Roles</option>
                    <option value="Super Administrator">Super Administrator</option>
                    <option value="Department Manager">Department Manager</option>
                    <option value="Physician">Physician</option>
                    <option value="Nurse Practitioner">Nurse Practitioner</option>
                    <option value="Nurse">Nurse</option>
                    <option value="Billing Specialist">Billing Specialist</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="glass-input w-full px-4 py-2"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="locked">Locked</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-600">
                    Showing {filteredUsers.length} of {users.length} users
                  </span>
                </div>
                <button className="glass-button-primary flex items-center space-x-2 px-6 py-3">
                  <Plus className="w-5 h-5" />
                  <span>Add User</span>
                </button>
              </div>
            </div>

            {/* Users List */}
            <div className="space-y-3">
              {filteredUsers.map((u) => (
                <div key={u.id} className="glass-card p-6 hover-lift">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="mt-1">{getStatusIcon(u.status)}</div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">{u.name}</h3>
                          {getStatusBadge(u.status)}
                          {u.mfaEnabled && (
                            <span className="glass-badge-info flex items-center space-x-1">
                              <Shield className="w-3 h-3" />
                              <span className="text-xs">2FA</span>
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-2">
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-600">{u.email}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-600">{u.role}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-600">{u.department}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-600">
                              Last login: {new Date(u.lastLogin).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          Created: {new Date(u.createdDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button className="glass-button p-2">
                        <Edit className="w-5 h-5" />
                      </button>
                      {u.status === 'locked' ? (
                        <button className="glass-button p-2 text-green-600 hover:bg-green-50">
                          <Unlock className="w-5 h-5" />
                        </button>
                      ) : (
                        <button className="glass-button p-2 text-yellow-600 hover:bg-yellow-50">
                          <Lock className="w-5 h-5" />
                        </button>
                      )}
                      <button className="glass-button p-2 text-red-600 hover:bg-red-50">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Security Policies Tab */}
        {activeTab === 'security' && (
          <div className="space-y-4">
            {securityPolicies.map((policy) => (
              <div key={policy.id} className="glass-card p-6 hover-lift">
                <div className="flex items-center justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white">
                      <Shield className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{policy.name}</h3>
                        <span className="glass-badge-success">Active</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{policy.description}</p>
                      <p className="text-xs text-gray-500">
                        Last updated: {new Date(policy.lastUpdated).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="glass-button p-2">
                      <Edit className="w-5 h-5" />
                    </button>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={policy.status === 'active'}
                        onChange={() => {}}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* System Configuration Tab */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <div className="glass-card-strong p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">System Settings</h2>
              <div className="space-y-4">
                <div className="glass-card p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900">Maintenance Mode</h3>
                      <p className="text-sm text-gray-600">Temporarily disable system access</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                  </div>
                </div>

                <div className="glass-card p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900">Automatic Backups</h3>
                      <p className="text-sm text-gray-600">Daily automated database backups</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked onChange={() => {}} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                  <button className="glass-button flex items-center space-x-2 px-4 py-2">
                    <RefreshCw className="w-4 h-4" />
                    <span>Backup Now</span>
                  </button>
                </div>

                <div className="glass-card p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900">Email Notifications</h3>
                      <p className="text-sm text-gray-600">System alerts and notifications</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked onChange={() => {}} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                <div className="glass-card p-4">
                  <h3 className="font-bold text-gray-900 mb-3">Data Management</h3>
                  <div className="flex flex-wrap gap-3">
                    <button className="glass-button flex items-center space-x-2 px-4 py-2">
                      <Download className="w-4 h-4" />
                      <span>Export Data</span>
                    </button>
                    <button className="glass-button flex items-center space-x-2 px-4 py-2">
                      <Upload className="w-4 h-4" />
                      <span>Import Data</span>
                    </button>
                    <button className="glass-button text-red-600 hover:bg-red-50 flex items-center space-x-2 px-4 py-2">
                      <Trash2 className="w-4 h-4" />
                      <span>Clear Cache</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Activity Logs Tab */}
        {activeTab === 'logs' && (
          <div className="glass-card-strong p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-3">
              <div className="glass-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      <strong>john.smith@hospital.com</strong> updated security policy
                    </p>
                    <p className="text-xs text-gray-500 mt-1">2 hours ago • IP: 192.168.1.100</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="glass-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      New user <strong>david.brown@hospital.com</strong> created
                    </p>
                    <p className="text-xs text-gray-500 mt-1">5 hours ago • By: admin@hospital.com</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="glass-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Account <strong>lisa.anderson@hospital.com</strong> locked due to failed login attempts
                    </p>
                    <p className="text-xs text-gray-500 mt-1">1 day ago • Automatic action</p>
                  </div>
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
              <div className="glass-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Database backup completed successfully
                    </p>
                    <p className="text-xs text-gray-500 mt-1">1 day ago • Automatic backup</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-600" />
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

export default AdminPanel;