import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../config/database';

type AuditAction = 'create' | 'update' | 'delete' | 'access';

interface AuditOptions {
  organizationId: string;
  userId?: string;
  patientId?: string;
  table: string;
  recordId?: string;
  action: AuditAction;
  changes?: any;
  ip?: string;
  userAgent?: string;
}

const db = getDatabase();

export async function writeAuditLog(opts: AuditOptions) {
  const id = uuidv4();
  const now = new Date().toISOString();

  await db.execute(
    `INSERT INTO audit_logs (
      id, organization_id, user_id, patient_id, action,
      table_name, record_id, changes, ip_address, user_agent, timestamp
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      opts.organizationId,
      opts.userId || null,
      opts.patientId || null,
      opts.action,
      opts.table,
      opts.recordId || null,
      JSON.stringify(opts.changes || {}),
      opts.ip || null,
      opts.userAgent || null,
      now,
    ]
  );
}
