const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  }

  // Auth
  async login(email: string, password: string) {
    const data = await this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  async register(email: string, password: string, fullName: string, organizationId: string) {
    return this.request<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name: fullName, organization_id: organizationId }),
    });
  }

  // Patients
  async getPatients(search?: string) {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.request<{ patients: any[] }>(`/patients${query}`);
  }

  async getPatient(id: string) {
    return this.request<any>(`/patients/${id}`);
  }

  async createPatient(patient: any) {
    return this.request<any>('/patients', {
      method: 'POST',
      body: JSON.stringify(patient),
    });
  }

  // Problems
  async getProblemsForPatient(patientId: string) {
    return this.request<any[]>(`/problems/patient/${patientId}`);
  }

  async getProblem(id: string) {
    return this.request<any>(`/problems/${id}`);
  }

  async createProblem(problem: any) {
    return this.request<any>('/problems', {
      method: 'POST',
      body: JSON.stringify(problem),
    });
  }

  async updateProblem(id: string, updates: any) {
    return this.request<any>(`/problems/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Bayesian Calculator
  async calculateBayesian(pretestProbability: number, likelihoodRatio: number) {
    return this.request<any>('/bayesian/calculate', {
      method: 'POST',
      body: JSON.stringify({ pretest_probability: pretestProbability, likelihood_ratio: likelihoodRatio }),
    });
  }

  async calculateBayesianBoth(pretestProbability: number, lrPositive: number, lrNegative: number) {
    return this.request<any>('/bayesian/calculate-both', {
      method: 'POST',
      body: JSON.stringify({
        pretest_probability: pretestProbability,
        lr_positive: lrPositive,
        lr_negative: lrNegative,
      }),
    });
  }

  async calculateFromSensSpec(sensitivity: number, specificity: number, pretestProbability: number) {
    return this.request<any>('/bayesian/from-sens-spec', {
      method: 'POST',
      body: JSON.stringify({
        sensitivity,
        specificity,
        pretest_probability: pretestProbability,
      }),
    });
  }

  async recommendTier(currentProbability: number) {
    return this.request<any>('/bayesian/recommend-tier', {
      method: 'POST',
      body: JSON.stringify({ current_probability: currentProbability }),
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);