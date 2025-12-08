import { offlineStorage } from './offlineStorage';
import { demoPatients, demoProblems, demoHypotheses, demoTimelineEvents, demoUser } from './demoData';
import type { Patient, Problem, Hypothesis, Trial, TimelineEvent, DiaryEntry } from '../types/medical';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * ApiService
 *
 * Client-side service that centralizes all backend API calls and handles
 * token management, offline fallbacks (IndexedDB via offlineStorage) and a
 * simple sync queue for write operations while offline. The class is used as
 * a singleton (`apiService`) across the frontend app.
 */
class ApiService {
  private token: string | null = null;
  private isOnline: boolean = navigator.onLine;

  constructor() {
    this.token = localStorage.getItem('auth_token');
    this.refreshToken = localStorage.getItem('refresh_token');
    
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

  setRefreshToken(refresh: string | null) {
    this.refreshToken = refresh;
    if (refresh) localStorage.setItem('refresh_token', refresh);
    else localStorage.removeItem('refresh_token');
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
    this.setRefreshToken(null);
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;

      // Enrich outgoing requests with tracing + session context when available
      try {
        // decode JWT payload without verifying to extract sessionId and organizationId
        const parts = this.token.split('.');
        const base64UrlDecode = (s: string) => {
          const base64 = s.replace(/-/g, '+').replace(/_/g, '/');
          if (typeof (globalThis as any).atob === 'function') return (globalThis as any).atob(base64);
          return Buffer.from(base64, 'base64').toString('utf8');
        };

        if (parts.length === 3) {
          const payload = JSON.parse(base64UrlDecode(parts[1]));
          if (payload?.sessionId) headers['X-Session-Id'] = payload.sessionId;
          if (payload?.organizationId) headers['X-Org-Id'] = payload.organizationId;
        }

        // try to get active span context and add traceparent header
        try {
          // dynamic import to avoid bundling when not used
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const api = await import('@opentelemetry/api');
          const span = api.trace.getSpan(api.context.active());
          const sc = span?.spanContext();
          if (sc && sc.traceId && sc.spanId) {
            headers['traceparent'] = `00-${sc.traceId}-${sc.spanId}-01`;
          }
        } catch (_) {
          // tracing not available — do nothing
        }
      } catch (err) {
        // ignore token parse/tracing enrich failures
      }
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Try a single automatic refresh + retry when a refresh token is present
          if (this.refreshToken) {
            const didRefresh = await this.tryRefresh();
            if (didRefresh) {
              // retry original request with new token
              if (this.token) headers['Authorization'] = `Bearer ${this.token}`;
              const retry = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
              if (retry.ok) return retry.json();
            }
          }

          // fall back to clearing tokens and redirecting to login
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

  /**
   * Try to refresh the access token using the stored refresh token.
   * Returns true when refresh succeeded and new token is set.
   */
  private async tryRefresh(): Promise<boolean> {
    if (!this.refreshToken) return false;

    try {
      const res = await fetch(`${API_BASE_URL}/auth/token/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      if (!res.ok) return false;

      const data = await res.json();
      if (data?.token) {
        this.setToken(data.token);
      }
      if (data?.refreshToken) {
        this.setRefreshToken(data.refreshToken);
      }

      return true;
    } catch (err) {
      return false;
    }
  }

  // Auth
  async login(email: string, password: string) {
    try {
      const data = await this.request<{ user: any; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      this.setToken(data.token);
      if ((data as any).refreshToken) {
        this.setRefreshToken((data as any).refreshToken);
      }
      return data;
    } catch (error) {
      // Fallback to demo mode for production when backend is unavailable
      console.warn('Backend unavailable, using demo mode');
      const demoToken = 'demo-token-' + Date.now();
      this.setToken(demoToken);
      return { user: demoUser, token: demoToken };
    }
  }

  // PKCE client helpers (internal demo flow)
  async pkceStart(clientId: string, redirectUri: string, codeChallenge: string, state?: string) {
    const data = await this.request<{ code: string; redirect_uri: string; state?: string }>(`/auth/oidc/pkce/start`, {
      method: 'POST',
      body: JSON.stringify({ client_id: clientId, redirect_uri: redirectUri, code_challenge: codeChallenge, state }),
    });
    return data;
  }

  async pkceComplete(code: string, codeVerifier: string, username?: string) {
    const data = await this.request<{ token?: string; sessionId?: string; refreshToken?: string }>(`/auth/oidc/pkce/complete`, {
      method: 'POST',
      body: JSON.stringify({ code, code_verifier: codeVerifier, username }),
    });

    if ((data as any).token) {
      this.setToken((data as any).token);
    }
    if ((data as any).refreshToken) {
      this.setRefreshToken((data as any).refreshToken);
    }

    return data;
  }

  async register(email: string, password: string, fullName: string, organizationId: string) {
    const data = await this.request<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName, organizationId }),
    });
    
    this.setToken(data.token);
    if ((data as any).refreshToken) {
      this.setRefreshToken((data as any).refreshToken);
    }
    return data;
  }

  /**
   * Public wrapper around internal request for UI usage. Returns JSON typed T.
   */
  async requestPublic<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, options);
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
