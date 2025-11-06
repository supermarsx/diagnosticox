import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Building, Users, MapPin, Plus, Edit,
  Trash2, Mail, Phone, Globe, Calendar, TrendingUp,
  Activity, DollarSign, UserPlus, Settings, Loader
} from 'lucide-react';
import securityAPI from '../services/securityAPI';

interface Organization {
  id: string;
  name: string;
  type: string;
  location: string;
  userCount: number;
  departmentCount: number;
  status: 'active' | 'inactive';
  createdDate: string;
}

interface Department {
  id: string;
  name: string;
  organizationId: string;
  manager: string;
  userCount: number;
  location: string;
  budget: number;
}

interface OrganizationManagementProps {
  user: any;
}

const OrganizationManagement = ({ user }: OrganizationManagementProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'organizations' | 'departments' | 'onboarding'>('organizations');
  const [selectedOrg, setSelectedOrg] = useState<string | null>('1');
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch organizations and departments
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch organizations
        const orgsResponse = await securityAPI.getOrganizations();
        const mappedOrgs: Organization[] = (orgsResponse.organizations || []).map((org: any) => ({
          id: org.id?.toString() || '',
          name: org.name || '',
          type: org.type || 'Medical Center',
          location: org.location || '',
          userCount: org.user_count || 0,
          departmentCount: org.department_count || 0,
          status: org.status || 'active',
          createdDate: org.created_at?.split('T')[0] || ''
        }));
        setOrganizations(mappedOrgs);
        
        // Fetch departments
        const deptsResponse = await securityAPI.getDepartments();
        const mappedDepts: Department[] = (deptsResponse.departments || []).map((dept: any) => ({
          id: dept.id?.toString() || '',
          name: dept.name || '',
          organizationId: dept.organization_id?.toString() || '',
          manager: dept.manager_name || 'Not Assigned',
          userCount: dept.user_count || 0,
          location: dept.location || '',
          budget: dept.budget || 0
        }));
        setDepartments(mappedDepts);
        
        setError(null);
      } catch (err: any) {
        console.error('Error fetching organization data:', err);
        setError(err.message || 'Failed to load organization data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const pendingInvitations = [
    {
      id: '1',
      email: 'newdoctor@hospital.com',
      role: 'Physician',
      department: 'Cardiology',
      sentDate: '2025-11-03',
      status: 'pending'
    },
    {
      id: '2',
      email: 'nurse.new@hospital.com',
      role: 'Nurse',
      department: 'Emergency Department',
      sentDate: '2025-11-04',
      status: 'pending'
    },
    {
      id: '3',
      email: 'admin@hospital.com',
      role: 'Department Manager',
      department: 'Radiology',
      sentDate: '2025-11-05',
      status: 'accepted'
    }
  ];

  const selectedOrgData = organizations.find(o => o.id === selectedOrg);
  const orgDepartments = departments.filter(d => d.organizationId === selectedOrg);

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
              <Building className="w-8 h-8 text-green-600" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                  Organization Management
                </h1>
                <p className="text-sm text-gray-600">Multi-tenant organization and department administration</p>
              </div>
            </div>
          </div>
          <button className="glass-button-primary flex items-center space-x-2 px-6 py-3">
            <Plus className="w-5 h-5" />
            <span>Add Organization</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-8">
        {/* Loading State */}
        {loading && (
          <div className="glass-card p-12 text-center">
            <Loader className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading organization data...</p>
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
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Organizations</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
              <Building className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">370</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Departments</p>
                <p className="text-2xl font-bold text-gray-900">22</p>
              </div>
              <MapPin className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Locations</p>
                <p className="text-2xl font-bold text-gray-900">15</p>
              </div>
              <Globe className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="glass-card mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('organizations')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'organizations'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Organizations
            </button>
            <button
              onClick={() => setActiveTab('departments')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'departments'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Departments
            </button>
            <button
              onClick={() => setActiveTab('onboarding')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'onboarding'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              User Onboarding
            </button>
          </div>
        </div>

        {/* Organizations Tab */}
        {activeTab === 'organizations' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {organizations.map((org) => (
              <div
                key={org.id}
                className={`glass-card p-6 hover-lift cursor-pointer ${
                  selectedOrg === org.id ? 'ring-2 ring-green-600' : ''
                }`}
                onClick={() => setSelectedOrg(org.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl text-white">
                      <Building className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{org.name}</h3>
                      <p className="text-sm text-gray-600">{org.type}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{org.location}</span>
                      </div>
                    </div>
                  </div>
                  <span className="glass-badge-success">Active</span>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-xs text-gray-600">Users</p>
                    <p className="text-lg font-bold text-gray-900">{org.userCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Departments</p>
                    <p className="text-lg font-bold text-gray-900">{org.departmentCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Since</p>
                    <p className="text-lg font-bold text-gray-900">
                      {new Date(org.createdDate).getFullYear()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-2 mt-4">
                  <button className="glass-button p-2">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="glass-button p-2">
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Departments Tab */}
        {activeTab === 'departments' && (
          <div className="space-y-6">
            {selectedOrgData && (
              <div className="glass-card-strong p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedOrgData.name}</h2>
                    <p className="text-sm text-gray-600 mt-1">{orgDepartments.length} Departments</p>
                  </div>
                  <button className="glass-button-primary flex items-center space-x-2 px-6 py-3">
                    <Plus className="w-5 h-5" />
                    <span>Add Department</span>
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {orgDepartments.map((dept) => (
                <div key={dept.id} className="glass-card p-6 hover-lift">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{dept.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">Manager: {dept.manager}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{dept.location}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="glass-button p-2">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="glass-button p-2 text-red-600 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="glass-card-subtle p-3">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="text-xs text-gray-600">Staff</p>
                          <p className="text-lg font-bold text-gray-900">{dept.userCount}</p>
                        </div>
                      </div>
                    </div>
                    <div className="glass-card-subtle p-3">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <div>
                          <p className="text-xs text-gray-600">Budget</p>
                          <p className="text-lg font-bold text-gray-900">
                            ${(dept.budget / 1000000).toFixed(1)}M
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User Onboarding Tab */}
        {activeTab === 'onboarding' && (
          <div className="space-y-6">
            {/* Send Invitation */}
            <div className="glass-card-strong p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Send User Invitation</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    placeholder="user@example.com"
                    className="glass-input w-full px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select className="glass-input w-full px-4 py-2">
                    <option>Physician</option>
                    <option>Nurse</option>
                    <option>Medical Assistant</option>
                    <option>Department Manager</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Organization</label>
                  <select className="glass-input w-full px-4 py-2">
                    {organizations.map(org => (
                      <option key={org.id}>{org.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  <select className="glass-input w-full px-4 py-2">
                    {orgDepartments.map(dept => (
                      <option key={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button className="glass-button-primary flex items-center space-x-2 px-6 py-3">
                <UserPlus className="w-5 h-5" />
                <span>Send Invitation</span>
              </button>
            </div>

            {/* Pending Invitations */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Pending Invitations</h2>
              <div className="space-y-3">
                {pendingInvitations.map((invitation) => (
                  <div key={invitation.id} className="glass-card-subtle p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Mail className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">{invitation.email}</p>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="text-sm text-gray-600">{invitation.role}</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-sm text-gray-600">{invitation.department}</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-xs text-gray-500">
                            Sent {new Date(invitation.sentDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {invitation.status === 'accepted' ? (
                        <span className="glass-badge-success">Accepted</span>
                      ) : (
                        <>
                          <span className="glass-badge-warning">Pending</span>
                          <button className="glass-button text-sm px-3 py-1">Resend</button>
                          <button className="glass-button text-sm px-3 py-1 text-red-600 hover:bg-red-50">
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
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

export default OrganizationManagement;
