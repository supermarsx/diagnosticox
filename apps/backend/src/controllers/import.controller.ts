import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Readable } from 'stream';
import csv from 'csv-parser';
import ExcelJS from 'exceljs';
import { getDatabase } from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { ensurePatientAccessible } from '../utils/tenancy';
import { writeAuditLog } from '../utils/audit';

export class ImportController {
  private db = getDatabase();

  /**
   * Import facts from CSV or Excel.
   * Required columns: patient_id, fact_type, measurement_name, measured_at
   */
  async importFacts(req: AuthRequest, res: Response) {
    try {
      const organizationId = req.tenantId || req.user!.organizationId;
      const { userId } = req.user!;
      const contentType = req.headers['content-type'] || '';

      let rows: any[] = [];

      if (contentType.includes('text/csv')) {
        rows = await this.parseCsv(req.body);
      } else if (contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
        rows = await this.parseExcel(req.body);
      } else {
        return res.status(400).json({ error: 'Unsupported Content-Type. Use text/csv or .xlsx' });
      }

      if (!rows.length) {
        return res.status(400).json({ error: 'No data found in import' });
      }

      const errors: string[] = [];
      const inserted: string[] = [];

      // Start transaction or batch (if supported)
      // For this prototype we'll do sequential with error collection
      for (const [index, row] of rows.entries()) {
        try {
          const { 
            patient_id, 
            fact_type, 
            measurement_name, 
            measured_at,
            measurement_value,
            measurement_unit,
            value_text,
            problem_id,
            source 
          } = row;

          if (!patient_id || !fact_type || !measurement_name || !measured_at) {
            errors.push(`Row ${index + 1}: Missing required fields`);
            continue;
          }

          await ensurePatientAccessible(patient_id, organizationId);

          const id = uuidv4();
          await this.db.execute(
            `INSERT INTO facts (
              id, patient_id, organization_id, problem_id, fact_type,
              measurement_name, measurement_value, measurement_unit, value_text,
              measured_at, source, recorded_by, context, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              id,
              patient_id,
              organizationId,
              problem_id || null,
              fact_type,
              measurement_name,
              measurement_value ? Number(measurement_value) : null,
              measurement_unit || null,
              value_text || null,
              measured_at,
              source || 'import',
              userId,
              JSON.stringify({}),
              new Date().toISOString(),
            ]
          );
          inserted.push(id);
        } catch (err: any) {
          errors.push(`Row ${index + 1}: ${err.message}`);
        }
      }

      await writeAuditLog({
        organizationId,
        userId,
        table: 'facts',
        action: 'import',
        recordId: inserted[0] || 'bulk',
        changes: { inserted: inserted.length, errors: errors.length },
        ip: req.ip,
        userAgent: req.get('user-agent') || undefined,
      });

      if (errors.length > 0 && inserted.length === 0) {
        return res.status(400).json({ error: 'Import failed', details: errors });
      }

      res.status(201).json({ 
        message: 'Import completed',
        inserted: inserted.length, 
        errors: errors.length > 0 ? errors : undefined 
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  private parseCsv(body: any): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      const stream = typeof body === 'string' ? Readable.from(body) : Readable.from(body.toString());
      
      stream
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (err) => reject(err));
    });
  }

  private async parseExcel(body: Buffer): Promise<any[]> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(body);
    const worksheet = workbook.worksheets[0];
    const results: any[] = [];
    
    const headers: string[] = [];
    worksheet.getRow(1).eachCell((cell, colNumber) => {
      headers[colNumber] = cell.value?.toString() || `col${colNumber}`;
    });

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // skip header
      const data: any = {};
      row.eachCell((cell, colNumber) => {
        data[headers[colNumber]] = cell.value;
      });
      results.push(data);
    });

    return results;
  }
}

export const importController = new ImportController();
