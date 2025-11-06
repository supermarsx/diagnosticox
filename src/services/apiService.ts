import axios, { AxiosInstance, AxiosError } from 'axios';
import { Patient, Problem, Diagnosis, Treatment, User } from '@/types/medical';
import { offlineService } from './offlineService';

class ApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for auth
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Demo data for offline usage
  private getDemoData<T>(key: string): T[] {
    const demoData: Record<string, any[]> = {
      patients: [
        {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: '1980-05-15',
          gender: 'male',
          email: 'john.doe@example.com',
          phone: '+1234567890',
          address: '123 Main St, Anytown, USA',
          insuranceInfo: 'Insurance ID: 123456789',
          emergencyContact: 'Jane Doe (Spouse): +1234567891',
          medicalRecordNumber: 'MRN001',
          createdAt: '2023-01-15T10:00:00Z',
          updatedAt: '2023-12-01T14:30:00Z'
        },
        {
          id: '2',
          firstName: 'Jane',
          lastName: 'Smith',
          dateOfBirth: '1975-03-22',
          gender: 'female',
          email: 'jane.smith@example.com',
          phone: '+1234567892',
          address: '456 Oak Ave, Somewhere, USA',
          insuranceInfo: 'Insurance ID: 987654321',
          emergencyContact: 'Bob Smith (Husband): +1234567893',
          medicalRecordNumber: 'MRN002',
          createdAt: '2023-02-20T09:15:00Z',
          updatedAt: '2023-11-28T16:45:00Z'
        }
      ],
      problems: [
        {
          id: '1',
          patientId: '1',
          title: 'Hypertension',
          description: 'High blood pressure readings over 140/90',
          status: 'active',
          priority: 'medium',
          category: 'cardiovascular',
          icd10Code: 'I10',
          createdAt: '2023-03-10T10:00:00Z',
          updatedAt: '2023-12-01T14:30:00Z'
        },
        {
          id: '2',
          patientId: '2',
          title: 'Type 2 Diabetes',
          description: 'Elevated blood glucose levels, HbA1c 7.8%',
          status: 'active',
          priority: 'high',
          category: 'endocrine',
          icd10Code: 'E11.9',
          createdAt: '2023-04-15T11:00:00Z',
          updatedAt: '2023-11-28T16:45:00Z'
        }
      ],
      diagnoses: [
        {
          id: '1',
          problemId: '1',
          title: 'Essential Hypertension',
          description: 'Primary hypertension without identifiable cause',
          icd10Code: 'I10',
          confidence: 0.95,
          status: 'confirmed',
          createdAt: '2023-03-10T10:30:00Z',
          updatedAt: '2023-03-10T10:30:00Z'
        }
      ],
      treatments: [
        {
          id: '1',
          problemId: '1',
          title: 'Lisinopril 10mg daily',
          description: 'ACE inhibitor for blood pressure control',
          status: 'active',
          dosage: '10mg',
          frequency: 'once daily',
          startDate: '2023-03-11',
          endDate: null,
          prescriber: 'Dr. Smith',
          createdAt: '2023-03-11T09:00:00Z',
          updatedAt: '2023-12-01T14:30:00Z'
        }
      ]
    };

    return demoData[key] || [];
  }

  // Check if we're offline
  private isOffline(): boolean {
    return !navigator.onLine || offlineService.isOfflineMode();
  }

  // Generic API method with offline support
  private async apiCall<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any,
    useDemoData: boolean = true
  ): Promise<T> {
    try {
      if (this.isOffline()) {
        console.log('Offline mode: Using cached/demo data for', endpoint);
        if (useDemoData) {
          const key = endpoint.split('/')[1]; // Extract resource type from endpoint
          const demoData = this.getDemoData<T>(key);
          
          // Store the request for later sync
          await offlineService.storeRequest({
            method,
            endpoint,
            data,
            timestamp: Date.now()
          });
          
          return demoData as T;
        }
        throw new Error('Offline mode: No demo data available');
      }

      const response = await this.api.request<T>({
        method,
        url: endpoint,
        data
      });

      return response.data;
    } catch (error) {
      console.warn(`API call failed for ${endpoint}, trying offline mode:`, error);
      
      if (useDemoData) {
        const key = endpoint.split('/')[1];
        const demoData = this.getDemoData<T>(key);
        return demoData as T;
      }
      
      throw error;
    }
  }

  // Patient methods
  async getPatients(): Promise<Patient[]> {
    return this.apiCall<Patient[]>('GET', '/patients');
  }

  async getPatient(id: string): Promise<Patient> {
    const patients = await this.getPatients();
    const patient = patients.find(p => p.id === id);
    if (!patient) {
      throw new Error('Patient not found');
    }
    return patient;
  }

  async createPatient(patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient> {
    return this.apiCall<Patient>('POST', '/patients', patient);
  }

  async updatePatient(id: string, patient: Partial<Patient>): Promise<Patient> {
    return this.apiCall<Patient>('PUT', `/patients/${id}`, patient);
  }

  async deletePatient(id: string): Promise<void> {
    return this.apiCall<void>('DELETE', `/patients/${id}`);
  }

  // Problem methods
  async getProblems(patientId?: string): Promise<Problem[]> {
    const endpoint = patientId ? `/problems?patientId=${patientId}` : '/problems';
    return this.apiCall<Problem[]>('GET', endpoint);
  }

  async getProblem(id: string): Promise<Problem> {
    const problems = await this.getProblems();
    const problem = problems.find(p => p.id === id);
    if (!problem) {
      throw new Error('Problem not found');
    }
    return problem;
  }

  async createProblem(problem: Omit<Problem, 'id' | 'createdAt' | 'updatedAt'>): Promise<Problem> {
    return this.apiCall<Problem>('POST', '/problems', problem);
  }

  async updateProblem(id: string, problem: Partial<Problem>): Promise<Problem> {
    return this.apiCall<Problem>('PUT', `/problems/${id}`, problem);
  }

  async deleteProblem(id: string): Promise<void> {
    return this.apiCall<void>('DELETE', `/problems/${id}`);
  }

  // Diagnosis methods
  async getDiagnoses(problemId?: string): Promise<Diagnosis[]> {
    const endpoint = problemId ? `/diagnoses?problemId=${problemId}` : '/diagnoses';
    return this.apiCall<Diagnosis[]>('GET', endpoint);
  }

  async getDiagnosis(id: string): Promise<Diagnosis> {
    const diagnoses = await this.getDiagnoses();
    const diagnosis = diagnoses.find(d => d.id === id);
    if (!diagnosis) {
      throw new Error('Diagnosis not found');
    }
    return diagnosis;
  }

  async createDiagnosis(diagnosis: Omit<Diagnosis, 'id' | 'createdAt' | 'updatedAt'>): Promise<Diagnosis> {
    return this.apiCall<Diagnosis>('POST', '/diagnoses', diagnosis);
  }

  async updateDiagnosis(id: string, diagnosis: Partial<Diagnosis>): Promise<Diagnosis> {
    return this.apiCall<Diagnosis>('PUT', `/diagnoses/${id}`, diagnosis);
  }

  async deleteDiagnosis(id: string): Promise<void> {
    return this.apiCall<void>('DELETE', `/diagnoses/${id}`);
  }

  // Treatment methods
  async getTreatments(problemId?: string): Promise<Treatment[]> {
    const endpoint = problemId ? `/treatments?problemId=${problemId}` : '/treatments';
    return this.apiCall<Treatment[]>('GET', endpoint);
  }

  async getTreatment(id: string): Promise<Treatment> {
    const treatments = await this.getTreatments();
    const treatment = treatments.find(t => t.id === id);
    if (!treatment) {
      throw new Error('Treatment not found');
    }
    return treatment;
  }

  async createTreatment(treatment: Omit<Treatment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Treatment> {
    return this.apiCall<Treatment>('POST', '/treatments', treatment);
  }

  async updateTreatment(id: string, treatment: Partial<Treatment>): Promise<Treatment> {
    return this.apiCall<Treatment>('PUT', `/treatments/${id}`, treatment);
  }

  async deleteTreatment(id: string): Promise<void> {
    return this.apiCall<void>('DELETE', `/treatments/${id}`);
  }

  // User methods
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    return this.apiCall<{ user: User; token: string }>('POST', '/auth/login', { email, password });
  }

  async logout(): Promise<void> {
    localStorage.removeItem('auth_token');
    await this.apiCall<void>('POST', '/auth/logout');
  }

  async getCurrentUser(): Promise<User> {
    return this.apiCall<User>('GET', '/auth/me');
  }

  // Sync methods for offline functionality
  async syncOfflineData(): Promise<void> {
    try {
      const requests = await offlineService.getPendingRequests();
      
      for (const request of requests) {
        try {
          await this.api.request({
            method: request.method,
            url: request.endpoint,
            data: request.data
          });
          
          // Mark request as synced
          await offlineService.markRequestAsSynced(request.id);
        } catch (error) {
          console.error('Failed to sync request:', request, error);
        }
      }
    } catch (error) {
      console.error('Failed to sync offline data:', error);
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await this.api.get('/health');
      return response.data;
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString()
      };
    }
  }
}

export const apiService = new ApiService();

// Initialize online/offline event listeners
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('Connection restored, syncing offline data...');
    apiService.syncOfflineData();
  });

  window.addEventListener('offline', () => {
    console.log('Connection lost, switching to offline mode');
  });
}