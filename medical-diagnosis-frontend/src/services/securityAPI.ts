import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Get auth token from localStorage
const getAuthToken = () => {
  const token = localStorage.getItem('token');
  return token;
};

// Create axios instance with auth
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface SecurityRole {
  id: string;
  name: string;
  description: string;
  permissions: string;
  inherits_from: string | null;
  color: string;
  user_count: number;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  organization_id: string;
  name: string;
  manager_id: string | null;
  location: string | null;
  budget: number;
  user_count: number;
  created_at: string;
  updated_at: string;
}

export interface AuthMethod {
  id: string;
  user_id: string;
  method_type: string;
  identifier: string;
  enabled: number;
  verified: number;
  added_date: string;
  last_used: string | null;
  metadata: string;
}

export interface AuditLog {
  id: string;
  organization_id: string;
  user_id: string | null;
  patient_id: string | null;
  action: string;
  table_name: string;
  record_id: string | null;
  changes: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface EncryptionKey {
  id: string;
  name: string;
  algorithm: string;
  key_size: number;
  purpose: string;
  status: string;
  created_date: string;
  expiry_date: string | null;
  last_rotation: string | null;
  usage_count: number;
  metadata: string;
}

export interface ConsentRecord {
  id: string;
  patient_id: string;
  patient_name: string;
  consent_type: string;
  status: string;
  granted_date: string;
  expiry_date: string | null;
  scope: string;
  metadata: string;
}

export interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  status: string;
  last_updated: string;
  configuration: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  organization_id: string;
  specialty?: string;
  created_at: string;
  updated_at: string;
}

// Security API service
export const securityAPI = {
  // Roles
  async getRoles(): Promise<SecurityRole[]> {
    const response = await apiClient.get('/security/roles');
    return response.data.roles || [];
  },

  async getRoleById(id: string): Promise<SecurityRole> {
    const response = await apiClient.get(`/security/roles/${id}`);
    return response.data.role;
  },

  // Users
  async getUsers(): Promise<User[]> {
    const response = await apiClient.get('/security/users');
    return response.data.users || [];
  },

  // Audit Logs
  async getAuditLogs(): Promise<AuditLog[]> {
    const response = await apiClient.get('/security/audit-logs');
    return response.data.logs || [];
  },

  async createAuditLog(log: Partial<AuditLog>): Promise<void> {
    await apiClient.post('/security/audit-logs', log);
  },

  // Encryption
  async getEncryptionKeys(): Promise<{ keys: any[] }> {
    const response = await apiClient.get('/security/encryption/keys');
    return { keys: response.data.keys || [] };
  },

  async getCertificates(): Promise<{ certificates: any[] }> {
    const response = await apiClient.get('/security/encryption/certificates');
    return { certificates: response.data.certificates || [] };
  },

  // Auth Methods & MFA
  async getAuthMethods(userId: string): Promise<{ authMethods: any[] }> {
    const response = await apiClient.get(`/security/auth-methods/${userId}`);
    return { authMethods: response.data.authMethods || [] };
  },

  async getTrustedDevices(userId: string): Promise<{ devices: any[] }> {
    const response = await apiClient.get(`/security/trusted-devices/${userId}`);
    return { devices: response.data.devices || [] };
  },

  // Privacy & Consent
  async getConsentRecords(): Promise<ConsentRecord[]> {
    const response = await apiClient.get('/security/privacy/consents');
    return response.data.consents || [];
  },

  async getSharingAgreements(): Promise<any[]> {
    const response = await apiClient.get('/security/privacy/agreements');
    return response.data.agreements || [];
  },

  // Organizations
  async getOrganizations(): Promise<{ organizations: any[] }> {
    const response = await apiClient.get('/security/organizations');
    return { organizations: response.data.organizations || [] };
  },

  // Departments
  async getDepartments(): Promise<{ departments: Department[] }> {
    const response = await apiClient.get('/security/departments');
    return { departments: response.data.departments || [] };
  },

  // Policies
  async getSecurityPolicies(): Promise<SecurityPolicy[]> {
    const response = await apiClient.get('/security/policies');
    return response.data.policies || [];
  },

  // System Metrics
  async getSystemMetrics(): Promise<any> {
    const response = await apiClient.get('/security/metrics');
    return response.data;
  },
};

export default securityAPI;
