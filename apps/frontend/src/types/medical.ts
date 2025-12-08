// Medical Diagnosis Application Types
// Matches backend TypeScript definitions

export interface Organization {
  id: string;
  name: string;
  subdomain?: string;
  settings?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  organization_id: string;
  email: string;
  full_name: string;
  role: 'clinician' | 'admin' | 'resident';
  specialty?: string;
  credentials?: string;
  preferences?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Patient {
  id: string;
  organization_id: string;
  mrn?: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender?: string;
  contact_phone?: string;
  contact_email?: string;
  emergency_contact?: string;
  primary_provider_id?: string;
  insurance_info?: string;
  preferences?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Problem {
  id: string;
  patient_id: string;
  organization_id: string;
  encounter_id?: string;
  problem_name: string;
  problem_type: 'symptom' | 'diagnosis' | 'condition';
  onset_date?: string;
  status: 'active' | 'resolved' | 'inactive';
  priority: number;
  clinical_context?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Hypothesis {
  id: string;
  problem_id: string;
  organization_id: string;
  diagnosis_code?: string;
  diagnosis_name: string;
  pretest_probability: number;
  current_probability: number;
  status: 'active' | 'ruled_out' | 'confirmed';
  supporting_evidence?: string;
  rank?: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface BayesianCalculation {
  pretest_probability: number;
  likelihood_ratio_positive?: number;
  likelihood_ratio_negative?: number;
  is_positive: boolean;
  post_test_probability?: number;
  post_test_odds?: number;
  pretest_odds?: number;
}

export interface Trial {
  id: string;
  patient_id: string;
  problem_id: string;
  organization_id: string;
  trial_name: string;
  intervention: string;
  start_date: string;
  planned_duration_days: number;
  status: 'planned' | 'active' | 'completed' | 'stopped';
  stop_rule?: string;
  primary_metric: string;
  target_improvement?: string;
  actual_outcome?: string;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface TimelineEvent {
  id: string;
  patient_id: string;
  organization_id: string;
  event_type: 'symptom_onset' | 'diagnosis' | 'treatment_start' | 'test_result' | 'milestone' | 'other';
  event_date: string;
  event_title: string;
  event_description?: string;
  severity?: 'low' | 'medium' | 'high';
  related_problem_id?: string;
  related_trial_id?: string;
  created_by: string;
  created_at: string;
}

export interface DiaryEntry {
  id: string;
  patient_id: string;
  entry_date: string;
  entry_type: 'symptom' | 'medication' | 'vitals' | 'activity' | 'mood' | 'sleep' | 'pain' | 'other';
  symptom_name?: string;
  severity?: number; // 0-10 scale
  measurement_value?: string;
  measurement_unit?: string;
  notes?: string;
  tags?: string[];
  created_at: string;
}

export interface Pivot {
  id: string;
  organization_id?: string;
  pivot_name: string;
  pivot_type: 'lab_test' | 'imaging' | 'clinical_sign' | 'symptom_pattern';
  measurement_method?: string;
  threshold_value?: number;
  threshold_unit?: string;
  threshold_operator?: string;
  discriminates_between?: string[];
  sensitivity?: number;
  specificity?: number;
  likelihood_ratio_positive?: number;
  likelihood_ratio_negative?: number;
  clinical_context?: string;
  citations?: string[];
  created_by?: string;
  is_public: boolean;
  created_at?: string;
  updated_at?: string;
}

// API Response types
export interface LoginResponse {
  user: Omit<User, 'password_hash'>;
  token: string;
}

export interface PatientsResponse {
  patients: Patient[];
  total: number;
}

export interface ProblemsResponse {
  problems: Problem[];
}

export interface HypothesesResponse {
  hypotheses: Hypothesis[];
}

export interface TrialsResponse {
  trials: Trial[];
}

export interface TimelineResponse {
  events: TimelineEvent[];
}

export interface DiaryResponse {
  entries: DiaryEntry[];
}

export interface PivotsResponse {
  pivots: Pivot[];
}

// Local storage types
export interface SyncStatus {
  last_sync: string;
  pending_changes: number;
  sync_errors: string[];
}

export interface OfflineData {
  patients: Patient[];
  problems: Problem[];
  hypotheses: Hypothesis[];
  trials: Trial[];
  timeline_events: TimelineEvent[];
  diary_entries: DiaryEntry[];
  sync_status: SyncStatus;
}
