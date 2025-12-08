import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { writeAuditLog } from '../utils/audit';

export class PivotController {
  private db = getDatabase();

  async list(req: AuthRequest, res: Response) {
    try {
      const organizationId = req.tenantId || req.user!.organizationId;
      const { type, category, is_public } = req.query;

      const params: any[] = [];
      let sql = `
        SELECT * FROM pivots
        WHERE (is_public = 1 OR organization_id = ?)
      `;
      params.push(organizationId);

      if (type) {
        sql += ' AND pivot_type = ?';
        params.push(type);
      }

      if (category) {
        sql += ' AND category = ?';
        params.push(category);
      }

      if (typeof is_public === 'string') {
        sql += ' AND is_public = ?';
        params.push(is_public === 'true' ? 1 : 0);
      }

      sql += ' ORDER BY is_public DESC, category, pivot_name';

      const pivots = await this.db.query(sql, params);
      res.json({ pivots });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const organizationId = req.tenantId || req.user!.organizationId;
      const { userId } = req.user!;
      const {
        pivot_name,
        pivot_type,
        category,
        description,
        measurement_method,
        threshold_value,
        threshold_unit,
        threshold_operator,
        discriminates_between,
        sensitivity,
        specificity,
        likelihood_ratio_positive,
        likelihood_ratio_negative,
        clinical_context,
        citations,
        is_public,
      } = req.body;

      if (!pivot_name || !pivot_type) {
        return res.status(400).json({ error: 'pivot_name and pivot_type are required' });
      }

      const id = uuidv4();
      const now = new Date().toISOString();

      await this.db.execute(
        `INSERT INTO pivots (
          id, organization_id, pivot_name, pivot_type, category, description,
          measurement_method, threshold_value, threshold_unit, threshold_operator,
          discriminates_between, sensitivity, specificity, likelihood_ratio_positive,
          likelihood_ratio_negative, clinical_context, citations, is_public,
          created_by, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          organizationId,
          pivot_name,
          pivot_type,
          category || null,
          description || null,
          measurement_method || null,
          threshold_value ?? null,
          threshold_unit || null,
          threshold_operator || null,
          JSON.stringify(discriminates_between || []),
          sensitivity ?? null,
          specificity ?? null,
          likelihood_ratio_positive ?? null,
          likelihood_ratio_negative ?? null,
          clinical_context || null,
          JSON.stringify(citations || []),
          is_public ? 1 : 0,
          userId,
          now,
          now,
        ]
      );

      const pivot = await this.db.get('SELECT * FROM pivots WHERE id = ?', [id]);

      await writeAuditLog({
        organizationId,
        userId,
        table: 'pivots',
        recordId: id,
        action: 'create',
        changes: { pivot_name, pivot_type, category },
        ip: req.ip,
        userAgent: req.get('user-agent') || undefined,
      });

      res.status(201).json({ pivot });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export const pivotController = new PivotController();
