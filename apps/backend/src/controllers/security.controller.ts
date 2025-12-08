import { Request, Response } from 'express';
import { getDatabase } from '../config/database';

export class SecurityController {
  // Get all roles
  static async getRoles(req: Request, res: Response) {
    try {
      const db = getDatabase();
      const roles = await db.query('SELECT * FROM security_roles ORDER BY name');
      res.json({ roles });
    } catch (error: any) {
      console.error('Get roles error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Get role by ID
  static async getRoleById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const db = getDatabase();
      const role = await db.get('SELECT * FROM security_roles WHERE id = ?', [id]);
      
      if (!role) {
        return res.status(404).json({ error: 'Role not found' });
      }
      
      res.json({ role });
    } catch (error: any) {
      console.error('Get role error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Get all users with their roles
  static async getUsers(req: Request, res: Response) {
    try {
      const db = getDatabase();
      const users = await db.query(`
        SELECT 
          u.id,
          u.email,
          u.full_name AS name,
          u.created_at AS createdDate,
          r.name AS role,
          'd.name AS department,
          o.name AS organization,
          'active' AS status,
          0 AS mfaEnabled
        FROM users u
        LEFT JOIN user_roles ur ON u.id = ur.user_id
        LEFT JOIN security_roles r ON ur.role_id = r.id
        LEFT JOIN departments d ON u.id = d.manager_id
        LEFT JOIN organizations o ON u.organization_id = o.id
        ORDER BY u.created_at DESC
      `);
      
      res.json({ users });
    } catch (error: any) {
      console.error('Get users error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Get audit logs
  static async getAuditLogs(req: Request, res: Response) {
    try {
      const { action, table_name, limit = 50 } = req.query;
      const db = getDatabase();
      
      let sql = 'SELECT * FROM audit_logs WHERE 1=1';
      const params: any[] = [];
      
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
      console.error('Get audit logs error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Create audit log entry
  static async createAuditLog(req: Request, res: Response) {
    try {
      const { organization_id, user_id, patient_id, action, table_name, record_id, changes, ip_address, user_agent } = req.body;
      const db = getDatabase();
      
      const id = `audit_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      await db.execute(`
        INSERT INTO audit_logs (id, organization_id, user_id, patient_id, action, table_name, record_id, changes, ip_address, user_agent)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [id, organization_id, user_id, patient_id, action, table_name, record_id, changes, ip_address, user_agent]);
      
      res.status(201).json({ message: 'Audit log created', id });
    } catch (error: any) {
      console.error('Create audit log error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Get encryption keys
  static async getEncryptionKeys(req: Request, res: Response) {
    try {
      const db = getDatabase();
      const keys = await db.query('SELECT * FROM encryption_keys ORDER BY created_date DESC');
      res.json({ keys });
    } catch (error: any) {
      console.error('Get encryption keys error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Get certificates
  static async getCertificates(req: Request, res: Response) {
    try {
      const db = getDatabase();
      const certificates = await db.query('SELECT * FROM certificates ORDER BY valid_until ASC');
      res.json({ certificates });
    } catch (error: any) {
      console.error('Get certificates error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Get consent records
  static async getConsentRecords(req: Request, res: Response) {
    try {
      const db = getDatabase();
      const consents = await db.query('SELECT * FROM consent_records ORDER BY granted_date DESC');
      res.json({ consents });
    } catch (error: any) {
      console.error('Get consent records error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Get sharing agreements
  static async getSharingAgreements(req: Request, res: Response) {
    try {
      const db = getDatabase();
      const agreements = await db.query('SELECT * FROM sharing_agreements WHERE status = ? ORDER BY start_date DESC', ['active']);
      res.json({ agreements });
    } catch (error: any) {
      console.error('Get sharing agreements error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Get organizations
  static async getOrganizations(req: Request, res: Response) {
    try {
      const db = getDatabase();
      const organizations = await db.query('SELECT * FROM organizations ORDER BY created_at DESC');
      res.json({ organizations });
    } catch (error: any) {
      console.error('Get organizations error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Get departments
  static async getDepartments(req: Request, res: Response) {
    try {
      const { organization_id } = req.query;
      const db = getDatabase();
      
      let sql = 'SELECT * FROM departments';
      const params: any[] = [];
      
      if (organization_id) {
        sql += ' WHERE organization_id = ?';
        params.push(organization_id);
      }
      
      sql += ' ORDER BY name';
      
      const departments = await db.query(sql, params);
      res.json({ departments });
    } catch (error: any) {
      console.error('Get departments error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Get auth methods for user
  static async getAuthMethods(req: Request, res: Response) {
    try {
      const { user_id } = req.params;
      const db = getDatabase();
      const methods = await db.query('SELECT * FROM auth_methods WHERE user_id = ? ORDER BY added_date DESC', [user_id]);
      res.json({ methods });
    } catch (error: any) {
      console.error('Get auth methods error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Get trusted devices for user
  static async getTrustedDevices(req: Request, res: Response) {
    try {
      const { user_id } = req.params;
      const db = getDatabase();
      const devices = await db.query('SELECT * FROM trusted_devices WHERE user_id = ? ORDER BY added_date DESC', [user_id]);
      res.json({ devices });
    } catch (error: any) {
      console.error('Get trusted devices error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Get security policies
  static async getSecurityPolicies(req: Request, res: Response) {
    try {
      const db = getDatabase();
      const policies = await db.query('SELECT * FROM security_policies ORDER BY name');
      res.json({ policies });
    } catch (error: any) {
      console.error('Get security policies error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Get system metrics
  static async getSystemMetrics(req: Request, res: Response) {
    try {
      const db = getDatabase();
      
      const totalUsers = await db.get('SELECT COUNT(*) as count FROM users');
      const totalOrgs = await db.get('SELECT COUNT(*) as count FROM organizations');
      const totalDepts = await db.get('SELECT COUNT(*) as count FROM departments');
      const recentLogs = await db.get('SELECT COUNT(*) as count FROM audit_logs WHERE timestamp > datetime("now", "-24 hours")');
      const criticalEvents = await db.get('SELECT COUNT(*) as count FROM audit_logs WHERE severity = "critical" AND timestamp > datetime("now", "-24 hours")');
      
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
      console.error('Get system metrics error:', error);
      res.status(500).json({ error: error.message });
    }
  }
}
