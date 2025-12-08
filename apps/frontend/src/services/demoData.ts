// Demo data for offline/fallback mode
export const demoOrganization = {
  id: 'org-1',
  name: 'General Medical Clinic',
  subdomain: 'general-medical',
};

export const demoUser = {
  id: 'user-1',
  organization_id: 'org-1',
  email: 'dr.smith@clinic.com',
  full_name: 'Dr. Jane Smith',
  role: 'clinician',
  specialty: 'Internal Medicine',
};

export const demoPatients = [
  {
    id: 'patient-1',
    organization_id: 'org-1',
    mrn: 'MRN001',
    first_name: 'John',
    last_name: 'Doe',
    date_of_birth: '1975-03-15',
    gender: 'Male',
    contact_phone: '555-0101',
    contact_email: 'john.doe@email.com',
    created_at: '2025-01-15T10:00:00Z',
  },
  {
    id: 'patient-2',
    organization_id: 'org-1',
    mrn: 'MRN002',
    first_name: 'Sarah',
    last_name: 'Johnson',
    date_of_birth: '1982-07-22',
    gender: 'Female',
    contact_phone: '555-0102',
    contact_email: 'sarah.j@email.com',
    created_at: '2025-02-01T14:30:00Z',
  },
];

export const demoProblems = [
  {
    id: 'problem-1',
    patient_id: 'patient-1',
    organization_id: 'org-1',
    problem_name: 'Chronic fatigue and weakness',
    problem_type: 'symptom',
    onset_date: '2025-09-01',
    status: 'active',
    priority: 1,
    clinical_context: 'Patient reports progressive fatigue over 3 months, associated with weight loss of 10 lbs',
    created_by: 'user-1',
    created_at: '2025-10-01T09:00:00Z',
  },
];

export const demoHypotheses = [
  {
    id: 'hyp-1',
    problem_id: 'problem-1',
    organization_id: 'org-1',
    diagnosis_code: 'E03.9',
    diagnosis_name: 'Hypothyroidism',
    pretest_probability: 0.25,
    current_probability: 0.35,
    evidence_strength: 'moderate',
    clinical_reasoning: 'Common cause of fatigue in middle-aged adults. TSH pending.',
    supporting_facts: ['Fatigue', 'Weight loss', 'Age group'],
    refuting_facts: [],
    rank: 1,
    status: 'active',
  },
  {
    id: 'hyp-2',
    problem_id: 'problem-1',
    organization_id: 'org-1',
    diagnosis_code: 'D50.9',
    diagnosis_name: 'Anemia',
    pretest_probability: 0.20,
    current_probability: 0.25,
    evidence_strength: 'moderate',
    clinical_reasoning: 'Weight loss and fatigue suggest possible iron deficiency. CBC pending.',
    supporting_facts: ['Fatigue', 'Weight loss'],
    refuting_facts: [],
    rank: 2,
    status: 'active',
  },
  {
    id: 'hyp-3',
    problem_id: 'problem-1',
    organization_id: 'org-1',
    diagnosis_code: 'F32.9',
    diagnosis_name: 'Depression',
    pretest_probability: 0.15,
    current_probability: 0.15,
    evidence_strength: 'weak',
    clinical_reasoning: 'Fatigue can be presenting symptom. PHQ-9 score needed.',
    supporting_facts: ['Fatigue'],
    refuting_facts: [],
    rank: 3,
    status: 'active',
  },
];

export const demoPivots = [
  {
    id: 'pivot-1',
    organization_id: 'org-1',
    pivot_name: 'Elevated TSH',
    pivot_type: 'lab_test',
    category: 'Endocrine',
    description: 'Thyroid stimulating hormone elevation indicates hypothyroidism',
    sensitivity: 0.95,
    specificity: 0.88,
    likelihood_ratio_positive: 7.92,
    likelihood_ratio_negative: 0.06,
    clinical_context: 'Primary screening test for thyroid dysfunction',
    is_public: true,
  },
  {
    id: 'pivot-2',
    organization_id: 'org-1',
    pivot_name: 'Low Hemoglobin',
    pivot_type: 'lab_test',
    category: 'Hematology',
    description: 'Hemoglobin below normal range indicates anemia',
    sensitivity: 0.92,
    specificity: 0.85,
    likelihood_ratio_positive: 6.13,
    likelihood_ratio_negative: 0.09,
    clinical_context: 'Definitive test for anemia diagnosis',
    is_public: true,
  },
];

export const demoTimelineEvents = [
  {
    id: 'event-1',
    patient_id: 'patient-1',
    organization_id: 'org-1',
    problem_id: 'problem-1',
    event_type: 'step_change',
    event_date: '2025-09-01',
    event_name: 'Symptom onset',
    description: 'Patient noticed increased fatigue and decreased exercise tolerance',
    clinical_significance: 'Marks beginning of current illness',
    created_by: 'user-1',
  },
];
