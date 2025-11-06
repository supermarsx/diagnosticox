import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, UserCheck, Shield, Eye, Edit, Trash2,
  Plus, ChevronRight, Lock, Unlock, Users, Settings, Loader
} from 'lucide-react';
import securityAPI from '../services/securityAPI';

interface Role {
  id: string;
  name: string;
  description: string;
  userCount: number;
  permissions: string[];
  inheritsFrom?: string;
  color: string;
}

interface Permission {
  id: string;
  name: string;
  category: string;
  description: string;
  critical: boolean;
}

interface RolePermissionsManagerProps {
  user: any;
}

const RolePermissionsManager = ({ user }: RolePermissionsManagerProps) => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [showAddRole, setShowAddRole] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch roles from API
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoading(true);
        const response = await securityAPI.getRoles();
        
        // Map API roles to component format with colors
        const roleColors = [
          'from-red-500 to-red-600',
          'from-purple-500 to-purple-600',
          'from-blue-500 to-blue-600',
          'from-green-500 to-green-600',
          'from-teal-500 to-teal-600',
          'from-cyan-500 to-cyan-600',
          'from-indigo-500 to-indigo-600',
          'from-yellow-500 to-yellow-600'
        ];
        
        const mappedRoles: Role[] = (Array.isArray(response) ? response : []).map((role: any, index: number) => ({
          id: role.id?.toString() || index.toString(),
          name: role.name || 'Unknown Role',
          description: role.description || 'No description available',
          userCount: role.user_count || 0,
          permissions: role.permissions ? role.permissions.split(',') : [],
          inheritsFrom: role.inherits_from || undefined,
          color: roleColors[index % roleColors.length]
        }));
        
        setRoles(mappedRoles);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching roles:', err);
        setError(err.message || 'Failed to load roles');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRoles();
  }, []);

  const permissionCategories = [
    {
      name: 'Patient Management',
      permissions: [
        { id: 'patients:full', name: 'Full Patient Access', description: 'Create, read, update, and delete patient records', critical: true },
        { id: 'patients:manage', name: 'Manage Patients', description: 'Create and update patient information', critical: false },
        { id: 'patients:view', name: 'View Patients', description: 'Read-only access to patient information', critical: false },
        { id: 'patients:delete', name: 'Delete Patients', description: 'Remove patient records (requires approval)', critical: true }
      ]
    },
    {
      name: 'Clinical Operations',
      permissions: [
        { id: 'diagnoses:create', name: 'Create Diagnoses', description: 'Add new diagnoses to patient records', critical: false },
        { id: 'treatments:prescribe', name: 'Prescribe Treatments', description: 'Order medications and treatments', critical: true },
        { id: 'treatments:limited', name: 'Limited Prescribing', description: 'Prescribe from approved medication list', critical: false },
        { id: 'records:access', name: 'Access Medical Records', description: 'View complete medical history', critical: false },
        { id: 'records:update', name: 'Update Records', description: 'Modify existing medical records', critical: false },
        { id: 'vitals:record', name: 'Record Vitals', description: 'Enter patient vital signs', critical: false }
      ]
    },
    {
      name: 'Administrative',
      permissions: [
        { id: 'org:manage', name: 'Manage Organization', description: 'Configure organization settings', critical: true },
        { id: 'dept:manage', name: 'Manage Departments', description: 'Create and configure departments', critical: false },
        { id: 'users:manage', name: 'Manage Users', description: 'Create, update, and remove user accounts', critical: true },
        { id: 'users:view', name: 'View Users', description: 'See user information', critical: false },
        { id: 'roles:assign', name: 'Assign Roles', description: 'Change user roles and permissions', critical: true }
      ]
    },
    {
      name: 'Financial',
      permissions: [
        { id: 'billing:full', name: 'Full Billing Access', description: 'Complete billing and payment management', critical: false },
        { id: 'billing:view', name: 'View Billing', description: 'See financial information', critical: false },
        { id: 'insurance:manage', name: 'Manage Insurance', description: 'Process insurance claims', critical: false },
        { id: 'reports:financial', name: 'Financial Reports', description: 'Generate financial reports', critical: false }
      ]
    },
    {
      name: 'Reporting & Analytics',
      permissions: [
        { id: 'reports:generate', name: 'Generate Reports', description: 'Create custom reports', critical: false },
        { id: 'analytics:view', name: 'View Analytics', description: 'Access analytics dashboards', critical: false },
        { id: 'export:data', name: 'Export Data', description: 'Download data exports', critical: true }
      ]
    }
  ];

  const selectedRoleData = roles.find(r => r.id === selectedRole);

  const hasPermission = (permissionId: string): boolean => {
    if (!selectedRoleData) return false;
    if (selectedRoleData.permissions.includes('all')) return true;
    return selectedRoleData.permissions.includes(permissionId);
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
              <UserCheck className="w-8 h-8 text-purple-600" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Role-Based Permissions
                </h1>
                <p className="text-sm text-gray-600">Manage roles and permission assignments</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowAddRole(true)}
            className="glass-button-primary flex items-center space-x-2 px-6 py-3"
          >
            <Plus className="w-5 h-5" />
            <span>Create Role</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-8">
        {/* Loading State */}
        {loading && (
          <div className="glass-card p-12 text-center">
            <Loader className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading roles and permissions...</p>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Roles List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="glass-card-strong p-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Roles ({roles.length})</h2>
              <div className="space-y-2">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`w-full glass-card p-4 text-left hover-lift transition-all ${
                      selectedRole === role.id ? 'ring-2 ring-purple-600' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-2 bg-gradient-to-br ${role.color} rounded-lg text-white`}>
                        <Shield className="w-5 h-5" />
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                    <h3 className="font-bold text-gray-900">{role.name}</h3>
                    <p className="text-xs text-gray-600 mt-1">{role.description}</p>
                    <div className="flex items-center space-x-2 mt-3">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{role.userCount} users</span>
                    </div>
                    {role.inheritsFrom && (
                      <div className="mt-2 text-xs text-purple-600 flex items-center space-x-1">
                        <ChevronRight className="w-3 h-3" />
                        <span>Inherits from {role.inheritsFrom}</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Permission Details */}
          <div className="lg:col-span-2">
            {selectedRoleData ? (
              <div className="space-y-6">
                {/* Role Header */}
                <div className="glass-card-strong p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 bg-gradient-to-br ${selectedRoleData.color} rounded-xl text-white`}>
                        <Shield className="w-8 h-8" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{selectedRoleData.name}</h2>
                        <p className="text-sm text-gray-600 mt-1">{selectedRoleData.description}</p>
                        <div className="flex items-center space-x-4 mt-3">
                          <span className="glass-badge-info">{selectedRoleData.userCount} users</span>
                          {selectedRoleData.permissions.includes('all') && (
                            <span className="glass-badge-warning">All Permissions</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="glass-button p-2">
                        <Edit className="w-5 h-5" />
                      </button>
                      <button className="glass-button p-2 text-red-600 hover:bg-red-50">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {selectedRoleData.inheritsFrom && (
                    <div className="glass-card p-4 bg-purple-50">
                      <div className="flex items-center space-x-2 text-sm">
                        <ChevronRight className="w-4 h-4 text-purple-600" />
                        <span className="text-purple-900">
                          This role inherits all permissions from <strong>{selectedRoleData.inheritsFrom}</strong>
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Permissions by Category */}
                <div className="space-y-4">
                  {permissionCategories.map((category) => (
                    <div key={category.name} className="glass-card p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">{category.name}</h3>
                      <div className="space-y-3">
                        {category.permissions.map((permission) => {
                          const isGranted = hasPermission(permission.id);
                          return (
                            <div
                              key={permission.id}
                              className={`glass-card-subtle p-4 flex items-center justify-between ${
                                isGranted ? 'bg-green-50' : ''
                              }`}
                            >
                              <div className="flex items-start space-x-3 flex-1">
                                {isGranted ? (
                                  <Unlock className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                ) : (
                                  <Lock className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                )}
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2">
                                    <h4 className="font-medium text-gray-900">{permission.name}</h4>
                                    {permission.critical && (
                                      <span className="glass-badge-warning text-xs">Critical</span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600 mt-1">{permission.description}</p>
                                </div>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer ml-4">
                                <input
                                  type="checkbox"
                                  checked={isGranted}
                                  disabled={selectedRoleData.permissions.includes('all')}
                                  onChange={() => {}}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600 peer-disabled:opacity-50"></div>
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Audit Trail */}
                <div className="glass-card p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Permission Changes</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <p className="text-gray-900"><strong>John Doe</strong> added permission <strong>patients:manage</strong></p>
                        <p className="text-gray-500 text-xs mt-1">2 hours ago</p>
                      </div>
                      <Eye className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <p className="text-gray-900"><strong>Jane Smith</strong> removed permission <strong>records:delete</strong></p>
                        <p className="text-gray-500 text-xs mt-1">1 day ago</p>
                      </div>
                      <Eye className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <p className="text-gray-900"><strong>Admin</strong> created role <strong>{selectedRoleData.name}</strong></p>
                        <p className="text-gray-500 text-xs mt-1">3 days ago</p>
                      </div>
                      <Eye className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-card-strong p-12 text-center">
                <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">Select a Role</h3>
                <p className="text-gray-600">Choose a role from the list to view and manage its permissions</p>
              </div>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default RolePermissionsManager;
