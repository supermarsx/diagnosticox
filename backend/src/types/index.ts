export interface Organization {
  id: string;
  name: string;
  subdomain: string | null;
  settings: any;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  organization_id: string;
  email: string;
  password_hash?: string;
  full_name: string;
  role: 'clinician' | 'admin' | 'resident';
  specialty: string | null;
  credentials: string | null;
  preferences: any;
  created_at: string;
  updated_at: string;
}

export interface Patient {
  id: string;
  organization_id: string;
  mrn: string | null;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  emergency_contact: any;
  primary_provider_id: string | null;
  insurance_info: any;
  preferences: any;
  created_at: string;
  updated_at: string;
}

export interface Problem {
  id: string;
  patient_id: string;
  organization_id: string;
  encounter_id: string | null;
  problem_name: string;
  problem_type: 'symptom' | 'sign' | 'syndrome' | 'diagnosis';
  onset_date: string | null;
  status: 'active' | 'resolved' | 'ruled_out';
  priority: number;
  clinical_context: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Hypothesis {
  id: string;
  problem_id: string;
  organization_id: string;
  diagnosis_code: string | null;
  diagnosis_name: string;
  pretest_probability: number;
  current_probability: number;
  evidence_strength: 'definitive' | 'strong' | 'moderate' | 'weak' | 'against';
  clinical_reasoning: string | null;
  supporting_facts: string[];
  refuting_facts: string[];
  rank: number;
  status: 'active' | 'confirmed' | 'ruled_out';
  created_at: string;
  updated_at: string;
}

export interface Fact {
  id: string;
  patient_id: string;
  organization_id: string;
  problem_id: string | null;
  fact_type: 'vital_sign' | 'lab_result' | 'symptom' | 'physical_exam' | 'history';
  measurement_name: string;
  measurement_value: number | null;
  measurement_unit: string | null;
  value_text: string | null;
  measured_at: string;
  source: 'patient_diary' | 'clinical_exam' | 'lab' | 'device';
  recorded_by: string | null;
  context: any;
  created_at: string;
}

export interface TimelineEvent {
  id: string;
  patient_id: string;
  organization_id: string;
  problem_id: string | null;
  event_type: 'step_change' | 'sentinel_event' | 'trial_start' | 'trial_end' | 'test_ordered' | 'test_result';
  event_date: string;
  event_name: string;
  description: string | null;
  clinical_significance: string | null;
  related_facts: string[];
  created_by: string;
  created_at: string;
}

export interface Pivot {
  id: string;
  organization_id: string;
  pivot_name: string;
  pivot_type: 'symptom' | 'sign' | 'lab_test' | 'imaging' | 'procedure';
  category: string | null;
  description: string | null;
  measurement_method: string | null;
  threshold_value: number | null;
  threshold_unit: string | null;
  threshold_operator: 'greater_than' | 'less_than' | 'equal_to' | 'between' | null;
  discriminates_between: string[];
  sensitivity: number | null;
  specificity: number | null;
  likelihood_ratio_positive: number | null;
  likelihood_ratio_negative: number | null;
  clinical_context: string | null;
  references: string[];
  created_by: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface TreatmentTrial {
  id: string;
  patient_id: string;
  organization_id: string;
  problem_id: string;
  hypothesis_id: string | null;
  trial_name: string;
  intervention: string;
  intervention_type: 'medication' | 'therapy' | 'procedure' | 'lifestyle';
  dose_schedule: string | null;
  start_date: string;
  planned_end_date: string | null;
  actual_end_date: string | null;
  status: 'planned' | 'active' | 'completed' | 'stopped';
  stop_reason: string | null;
  pretreatment_baseline: any;
  target_metrics: string[];
  success_criteria: string | null;
  stop_rules: string | null;
  side_effects_to_monitor: string[];
  decision_point_reached: boolean;
  decision_outcome: string | null;
  clinical_notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface PatientDiary {
  id: string;
  patient_id: string;
  organization_id: string;
  entry_date: string;
  entry_type: 'symptom' | 'medication' | 'vital_sign' | 'pain_scale' | 'mood' | 'activity';
  symptom_name: string | null;
  severity: number | null;
  measurement_value: number | null;
  measurement_unit: string | null;
  notes: string | null;
  triggers: string[];
  mood_rating: number | null;
  activity_level: string | null;
  created_at: string;
}

export interface BayesianCalculation {
  pretest_probability: number;
  likelihood_ratio: number;
  posttest_probability: number;
  pretest_odds: number;
  posttest_odds: number;
}
