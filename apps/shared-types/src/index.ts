export interface PatientBase {
  id: string;
  organizationId: string;
  displayName: string;
  dateOfBirth?: string; // ISO date
}

export interface PatientSummary extends PatientBase {
  first_name?: string;
  last_name?: string;
  mrn?: string;
  gender?: string;
  problem_count?: number;
  facts_count?: number;
  last_activity?: string | null; // ISO timestamp or null when none
}
export interface ProblemBase {
  id: string;
  patientId: string;
  title: string;
  description?: string;
  createdAt: string; // ISO timestamp
  updatedAt?: string; // ISO timestamp
}
