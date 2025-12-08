export interface PatientBase {
  id: string;
  organizationId: string;
  displayName: string;
  dateOfBirth?: string; // ISO date
}

export interface ProblemBase {
  id: string;
  patientId: string;
  title: string;
  description?: string;
  createdAt: string; // ISO timestamp
  updatedAt?: string; // ISO timestamp
}
