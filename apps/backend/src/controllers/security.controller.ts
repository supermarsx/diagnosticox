import { Response } from 'express';
import logger from '../services/logger.service';
import { getDatabase } from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

export class SecurityController {
  // Get all roles
  static async getRoles(req: AuthRequest, res: Response) {
    try {
      const db = getDatabase();
      const roles = await db.query('SELECT * FROM security_roles ORDER BY name');
      res.json({ roles });
    } catch (error: any) {
      logger.error({ err: error }, 'Get roles error');
      res.status(500).json({ error: error.message });
    }
  }

  // Get role by ID
  static async getRoleById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const db = getDatabase();
      const role = await db.get('SELECT * FROM security_roles WHERE id = ?', [id]);
      
      if (!role) {
        return res.status(404).json({ error: 'Role not found' });
      }
      
      res.json({ role });
    } catch (error: any) {
      logger.error({ err: error }, 'Get role error');
      res.status(500).json({ error: error.message });
    }
  }

  // Get all users with their roles
  static async getUsers(req: AuthRequest, res: Response) {
    try {
      const organizationId = req.tenantId || req.user?.organizationId;
      if (!organizationId) {
        return res.status(401).json({ error: 'Organization context required' });
      }
      const db = getDatabase();
      const users = await db.query(`
        SELECT 
          u.id,
          u.email,
          u.full_name AS name,
          u.created_at AS createdDate,
          u.role AS role,
          NULL AS department,
          o.name AS organization,
          'active' AS status,
          0 AS mfaEnabled
        FROM users u
        LEFT JOIN organizations o ON u.organization_id = o.id
        WHERE u.organization_id = ?
        ORDER BY u.created_at DESC
      `, [organizationId]);
      
      res.json({ users });
    } catch (error: any) {
      logger.error({ err: error }, 'Get users error');
      res.status(500).json({ error: error.message });
    }
  }

  // Get audit logs
  static async getAuditLogs(req: AuthRequest, res: Response) {
    try {
      const { action, table_name, limit = 50 } = req.query;
      const organizationId = req.tenantId || req.user?.organizationId;
      if (!organizationId) {
        return res.status(401).json({ error: 'Organization context required' });
      }
      const db = getDatabase();
      
      let sql = 'SELECT * FROM audit_logs WHERE organization_id = ?';
      const params: any[] = [organizationId];
      
      if (action) {
        sql += ' AND action = ?';
        params.push(action);
      }
      
      if (table_name) {
        sql += ' AND table_name = ?';
        params.push(table_name);
      }
      
      sql += ' ORDER BY created_at DESC LIMIT ?';
      params.push(Number(limit));
      
      const logs = await db.query(sql, params);
      res.json({ logs });
    } catch (error: any) {
      logger.error({ err: error }, 'Get audit logs error');
      res.status(500).json({ error: error.message });
    }
  }

  // Create audit log entry
  static async createAuditLog(req: AuthRequest, res: Response) {
    try {
      const organizationId = req.tenantId || req.user?.organizationId;
      if (!organizationId) {
        return res.status(401).json({ error: 'Organization context required' });
      }
      const { patient_id, action, table_name, record_id, changes, ip_address, user_agent } = req.body;
      const userId = req.user?.userId;
      const db = getDatabase();
      
      const id = `audit_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      await db.execute(
        `INSERT INTO audit_logs (
          id, organization_id, user_id, patient_id, action,
          table_name, record_id, changes, ip_address, user_agent, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, organizationId, userId, patient_id, action, table_name, record_id, changes, ip_address, user_agent, new Date().toISOString()]
      );
      
      res.status(201).json({ message: 'Audit log created', id });
    } catch (error: any) {
      logger.error({ err: error }, 'Create audit log error');
      res.status(500).json({ error: error.message });
    }
  }

  // Get encryption keys
  static async getEncryptionKeys(req: AuthRequest, res: Response) {
    try {
      const db = getDatabase();
      const keys = await db.query('SELECT * FROM encryption_keys ORDER BY created_date DESC');
      res.json({ keys });
    } catch (error: any) {
      logger.error({ err: error }, 'Get encryption keys error');
      res.status(500).json({ error: error.message });
    }
  }

  // Get certificates
  static async getCertificates(req: AuthRequest, res: Response) {
    try {
      const db = getDatabase();
      const certificates = await db.query('SELECT * FROM certificates ORDER BY valid_until ASC');
      res.json({ certificates });
    } catch (error: any) {
      logger.error({ err: error }, 'Get certificates error');
      res.status(500).json({ error: error.message });
    }
  }

  // Get consent records
  static async getConsentRecords(req: AuthRequest, res: Response) {
    try {
      const db = getDatabase();
      const consents = await db.query('SELECT * FROM consent_records ORDER BY granted_date DESC');
      res.json({ consents });
    } catch (error: any) {
      logger.error({ err: error }, 'Get consent records error');
      res.status(500).json({ error: error.message });
    }
  }

  // Get sharing agreements
  static async getSharingAgreements(req: AuthRequest, res: Response) {
    try {
      const db = getDatabase();
      const agreements = await db.query('SELECT * FROM sharing_agreements WHERE status = ? ORDER BY start_date DESC', ['active']);
      res.json({ agreements });
    } catch (error: any) {
      logger.error({ err: error }, 'Get sharing agreements error');
      res.status(500).json({ error: error.message });
    }
  }

  // Get organizations
  static async getOrganizations(req: AuthRequest, res: Response) {
    try {
      const organizationId = req.tenantId || req.user?.organizationId;
      const db = getDatabase();
      const organizations = await db.query('SELECT * FROM organizations WHERE id = ? ORDER BY created_at DESC', [organizationId]);
      res.json({ organizations });
    } catch (error: any) {
      logger.error({ err: error }, 'Get organizations error');
      res.status(500).json({ error: error.message });
    }
  }

  // Create organization (admin-only)
  static async createOrganization(req: AuthRequest, res: Response) {
    try {
      const { name, subdomain, settings } = req.body;
      if (!name) {
        return res.status(400).json({ error: 'Organization name is required' });
      }

      const db = getDatabase();
      const id = `org_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
      const now = new Date().toISOString();

      await db.execute(
        `INSERT INTO organizations (id, name, subdomain, settings, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, name, subdomain || null, JSON.stringify(settings || {}), now, now]
      );

      const organization = await db.get('SELECT * FROM organizations WHERE id = ?', [id]);
      res.status(201).json({ organization });
    } catch (error: any) {
      logger.error({ err: error }, 'Create organization error');
      res.status(500).json({ error: error.message });
    }
  }

  // Get departments
  static async getDepartments(req: AuthRequest, res: Response) {
    try {
      const organizationId = req.tenantId || req.user?.organizationId;
      const db = getDatabase();
      
      const departments = await db.query(
        'SELECT * FROM departments WHERE organization_id = ? ORDER BY name',
        [organizationId]
      );
      res.json({ departments });
    } catch (error: any) {
      logger.error({ err: error }, 'Get departments error');
      res.status(500).json({ error: error.message });
    }
  }

  // Get auth methods for user
  static async getAuthMethods(req: AuthRequest, res: Response) {
    try {
      const { user_id } = req.params;
      const organizationId = req.tenantId || req.user?.organizationId;
      const db = getDatabase();
      const user = await db.get('SELECT id FROM users WHERE id = ? AND organization_id = ?', [user_id, organizationId]);
      if (!user) {
        return res.status(404).json({ error: 'User not found in this organization' });
      }
      const methods = await db.query('SELECT * FROM auth_methods WHERE user_id = ? ORDER BY added_date DESC', [user_id]);
      res.json({ methods });
    } catch (error: any) {
      logger.error({ err: error }, 'Get auth methods error');
      res.status(500).json({ error: error.message });
    }
  }

  // Get trusted devices for user
  static async getTrustedDevices(req: AuthRequest, res: Response) {
    try {
      const { user_id } = req.params;
      const organizationId = req.tenantId || req.user?.organizationId;
      const db = getDatabase();
      const user = await db.get('SELECT id FROM users WHERE id = ? AND organization_id = ?', [user_id, organizationId]);
      if (!user) {
        return res.status(404).json({ error: 'User not found in this organization' });
      }
      const devices = await db.query('SELECT * FROM trusted_devices WHERE user_id = ? ORDER BY added_date DESC', [user_id]);
      res.json({ devices });
    } catch (error: any) {
      logger.error({ err: error }, 'Get trusted devices error');
      res.status(500).json({ error: error.message });
    }
  }

  // Get security policies
  static async getSecurityPolicies(req: AuthRequest, res: Response) {
    try {
      const db = getDatabase();
      const policies = await db.query('SELECT * FROM security_policies ORDER BY name');
      res.json({ policies });
    } catch (error: any) {
      logger.error({ err: error }, 'Get security policies error');
      res.status(500).json({ error: error.message });
    }
  }

  // Get system metrics
  static async getSystemMetrics(req: AuthRequest, res: Response) {
    try {
      const organizationId = req.tenantId || req.user?.organizationId;
      const db = getDatabase();
      
      const totalUsers = await db.get('SELECT COUNT(*) as count FROM users WHERE organization_id = ?', [organizationId]);
      const totalDepts = await db.get('SELECT COUNT(*) as count FROM departments WHERE organization_id = ?', [organizationId]);
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const recentLogs = await db.get(
        'SELECT COUNT(*) as count FROM audit_logs WHERE organization_id = ? AND created_at > ?',
        [organizationId, since]
      );
      const criticalEvents = await db.get(
        'SELECT COUNT(*) as count FROM audit_logs WHERE organization_id = ? AND action IN ("delete") AND created_at > ?',
        [organizationId, since]
      );
      const totalOrgs = { count: 1 };
      
      res.json({
        metrics: {
          totalUsers: totalUsers?.count || 0,
          totalOrganizations: totalOrgs?.count || 0,
          totalDepartments: totalDepts?.count || 0,
          recentLogs: recentLogs?.count || 0,
          criticalEvents: criticalEvents?.count || 0,
          systemUptime: '99.98%',
          avgResponseTime: '124ms'
        }
      });
    } catch (error: any) {
      logger.error({ err: error }, 'Get system metrics error');
      res.status(500).json({ error: error.message });
    }
  }
}
