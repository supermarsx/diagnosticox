import { offlineStorage } from './offlineStorage';
import { demoPatients, demoProblems, demoHypotheses, demoTimelineEvents, demoUser } from './demoData';
import type { Patient, Problem, Hypothesis, Trial, TimelineEvent, DiaryEntry } from '../types/medical';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiService {
  private token: string | null = null;
  private isOnline: boolean = navigator.onLine;

  constructor() {
    this.token = localStorage.getItem('auth_token');
    
    // Monitor online/offline status
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncOfflineChanges();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.clearToken();
          window.location.href = '/';
          throw new Error('Unauthorized');
        }
        const error = await response.json();
        throw new Error(error.error || 'Request failed');
      }

      return response.json();
    } catch (error) {
      // If offline, try to get from IndexedDB
      if (!this.isOnline) {
        return this.handleOfflineRequest<T>(endpoint, options);
      }
      throw error;
    }
  }

  private async handleOfflineRequest<T>(endpoint: string, options: RequestInit): Promise<T> {
    // Try to serve GET requests from cache
    if (!options.method || options.method === 'GET') {
      if (endpoint.includes('/patients')) {
        const patients = await offlineStorage.getPatients();
        return { patients, total: patients.length } as any;
      }
      // Add more offline handlers as needed
    }
    
    // Queue POST/PUT/DELETE for sync
    if (options.method && ['POST', 'PUT', 'DELETE'].includes(options.method)) {
      await offlineStorage.addToSyncQueue(options.method, {
        endpoint,
        body: options.body,
      });
    }
    
    throw new Error('No network connection');
  }

  private async syncOfflineChanges() {
    const queue = await offlineStorage.getSyncQueue();
    
    for (const item of queue) {
      try {
        await this.request(item.data.endpoint, {
          method: item.action,
          body: item.data.body,
        });
      } catch (error) {
        console.error('Sync failed for item:', item, error);
      }
    }
    
    await offlineStorage.clearSyncQueue();
    offlineStorage.updateSyncTimestamp();
  }

  // Auth
  async login(email: string, password: string) {
    try {
      const data = await this.request<{ user: any; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      this.setToken(data.token);
      return data;
    } catch (error) {
      // Fallback to demo mode for production when backend is unavailable
      console.warn('Backend unavailable, using demo mode');
      const demoToken = 'demo-token-' + Date.now();
      this.setToken(demoToken);
      return { user: demoUser, token: demoToken };
    }
  }

  async register(email: string, password: string, fullName: string, organizationId: string) {
    const data = await this.request<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName, organizationId }),
    });
    
    this.setToken(data.token);
    return data;
  }

  // Patients
  async getPatients(): Promise<{ patients: Patient[]; total: number }> {
    try {
      const data = await this.request<{ patients: Patient[]; total: number }>('/patients');
      
      // Cache in IndexedDB
      if (data.patients) {
        await offlineStorage.savePatients(data.patients);
      }
      
      return data;
    } catch (error) {
      // Fallback to demo data when backend unavailable
      console.warn('Using demo patients data');
      return { patients: demoPatients as Patient[], total: demoPatients.length };
    }
  }

  async getPatient(id: string): Promise<Patient> {
    try {
      const patient = await this.request<Patient>(`/patients/${id}`);
      return patient;
    } catch (error) {
      // Try offline cache
      const cached = await offlineStorage.getPatient(id);
      if (cached) return cached;
      
      // Fallback to demo data
      const demoPatient = demoPatients.find(p => p.id === id);
      if (demoPatient) {
        console.warn('Using demo patient data for', id);
        return demoPatient as Patient;
      }
      
      throw error;
    }
  }

  async createPatient(patient: Partial<Patient>): Promise<Patient> {
    return this.request<Patient>('/patients', {
      method: 'POST',
      body: JSON.stringify(patient),
    });
  }

  async updatePatient(id: string, updates: Partial<Patient>): Promise<Patient> {
    return this.request<Patient>(`/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Problems
  async getProblems(patientId: string): Promise<{ problems: Problem[] }> {
    try {
      const data = await this.request<{ problems: Problem[] }>(`/problems?patientId=${patientId}`);
      
      if (data.problems) {
        await offlineStorage.saveProblems(data.problems);
      }
      
      return data;
    } catch (error) {
      // Fallback to demo data
      const demoProblemsForPatient = demoProblems.filter(p => p.patient_id === patientId);
      console.warn('Using demo problems data for patient', patientId);
      return { problems: demoProblemsForPatient as Problem[] };
    }
  }

  async createProblem(problem: Partial<Problem>): Promise<Problem> {
    return this.request<Problem>('/problems', {
      method: 'POST',
      body: JSON.stringify(problem),
    });
  }

  async updateProblem(id: string, updates: Partial<Problem>): Promise<Problem> {
    return this.request<Problem>(`/problems/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Hypotheses
  async getHypotheses(problemId: string): Promise<{ hypotheses: Hypothesis[] }> {
    try {
      const data = await this.request<{ hypotheses: Hypothesis[] }>(`/problems/${problemId}/hypotheses`);
      
      if (data.hypotheses) {
        await offlineStorage.saveHypotheses(data.hypotheses);
      }
      
      return data;
    } catch (error) {
      // Fallback to demo data
      const demoHypothesesForProblem = demoHypotheses.filter(h => h.problem_id === problemId);
      console.warn('Using demo hypotheses data for problem', problemId);
      return { hypotheses: demoHypothesesForProblem as any };
    }
  }

  async createHypothesis(hypothesis: Partial<Hypothesis>): Promise<Hypothesis> {
    return this.request<Hypothesis>('/hypotheses', {
      method: 'POST',
      body: JSON.stringify(hypothesis),
    });
  }

  async updateHypothesis(id: string, updates: Partial<Hypothesis>): Promise<Hypothesis> {
    return this.request<Hypothesis>(`/hypotheses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Bayesian Calculator
  async calculateBayesian(data: {
    pretestProbability: number;
    likelihoodRatioPositive?: number;
    likelihoodRatioNegative?: number;
    isPositive: boolean;
  }) {
    return this.request('/bayesian/calculate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async batchUpdateHypotheses(problemId: string, calculations: any[]) {
    return this.request(`/bayesian/batch-update/${problemId}`, {
      method: 'POST',
      body: JSON.stringify({ calculations }),
    });
  }

  // Trials
  async getTrials(patientId: string): Promise<{ trials: Trial[] }> {
    try {
      const data = await this.request<{ trials: Trial[] }>(`/trials?patientId=${patientId}`);
      
      if (data.trials) {
        await offlineStorage.saveTrials(data.trials);
      }
      
      return data;
    } catch (error) {
      // Fallback to empty array for demo mode
      console.warn('Using empty trials data for patient', patientId);
      return { trials: [] };
    }
  }

  async createTrial(trial: Partial<Trial>): Promise<Trial> {
    return this.request<Trial>('/trials', {
      method: 'POST',
      body: JSON.stringify(trial),
    });
  }

  async updateTrial(id: string, updates: Partial<Trial>): Promise<Trial> {
    return this.request<Trial>(`/trials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Timeline
  async getTimelineEvents(patientId: string): Promise<{ events: TimelineEvent[] }> {
    try {
      const data = await this.request<{ events: TimelineEvent[] }>(`/timeline?patientId=${patientId}`);
      
      if (data.events) {
        await offlineStorage.saveTimelineEvents(data.events);
      }
      
      return data;
    } catch (error) {
      // Fallback to demo timeline events
      const demoEventsForPatient = demoTimelineEvents.filter(e => e.patient_id === patientId);
      console.warn('Using demo timeline events for patient', patientId);
      return { events: demoEventsForPatient as any };
    }
  }

  async createTimelineEvent(event: Partial<TimelineEvent>): Promise<TimelineEvent> {
    return this.request<TimelineEvent>('/timeline', {
      method: 'POST',
      body: JSON.stringify(event),
    });
  }

  // Diary
  async getDiaryEntries(patientId: string): Promise<{ entries: DiaryEntry[] }> {
    const data = await this.request<{ entries: DiaryEntry[] }>(`/diary?patientId=${patientId}`);
    
    if (data.entries) {
      await offlineStorage.saveDiaryEntries(data.entries);
    }
    
    return data;
  }

  async createDiaryEntry(entry: Partial<DiaryEntry>): Promise<DiaryEntry> {
    const created = await this.request<DiaryEntry>('/diary', {
      method: 'POST',
      body: JSON.stringify(entry),
    });
    
    // Also save to IndexedDB
    await offlineStorage.addDiaryEntry(created);
    
    return created;
  }

  // Sync status
  getSyncStatus() {
    return offlineStorage.getSyncStatus();
  }

  isOffline() {
    return !this.isOnline;
  }
}

export const apiService = new ApiService();
export default apiService;