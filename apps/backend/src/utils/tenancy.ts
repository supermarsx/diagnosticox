import { getDatabase } from '../config/database';

const db = getDatabase();

export async function ensureOrganizationExists(organizationId: string) {
  const org = await db.get('SELECT id FROM organizations WHERE id = ?', [organizationId]);
  if (!org) {
    throw new Error('Organization not found');
  }
}

export async function ensurePatientAccessible(patientId: string, organizationId: string) {
  const patient = await db.get(
    'SELECT id FROM patients WHERE id = ? AND organization_id = ?',
    [patientId, organizationId]
  );
  if (!patient) {
    const error: any = new Error('Patient not found for this organization');
    error.status = 404;
    throw error;
  }
}
