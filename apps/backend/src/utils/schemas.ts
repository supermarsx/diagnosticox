import { z } from 'zod';

export const patientSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  mrn: z.string().optional(),
  gender: z.enum(['Male', 'Female', 'Other', 'Unknown']).optional(),
  contact_phone: z.string().optional(),
  contact_email: z.string().email().optional().or(z.literal('')),
});

export const problemSchema = z.object({
  patient_id: z.string().uuid(),
  problem_name: z.string().min(1, 'Problem name is required'),
  problem_type: z.enum(['symptom', 'diagnosis', 'condition']).default('symptom'),
  status: z.enum(['active', 'resolved', 'inactive']).default('active'),
  priority: z.number().int().min(0).max(5).default(0),
  onset_date: z.string().optional(),
  clinical_context: z.string().optional(),
});

export const factSchema = z.object({
  patient_id: z.string().uuid(),
  problem_id: z.string().uuid().optional().nullable(),
  fact_type: z.string().min(1),
  measurement_name: z.string().min(1),
  measurement_value: z.number().optional().nullable(),
  measurement_unit: z.string().optional().nullable(),
  value_text: z.string().optional().nullable(),
  measured_at: z.string().datetime(),
  source: z.string().optional(),
});

export const testOrderSchema = z.object({
  patient_id: z.string().uuid(),
  problem_id: z.string().uuid(),
  hypothesis_id: z.string().uuid(),
  test_name: z.string().min(1),
  tier: z.number().int().min(1).max(3).default(1),
  clinical_rationale: z.string().optional(),
});
