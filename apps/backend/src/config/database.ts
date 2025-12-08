import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import { Pool } from 'pg';
import { config } from '../config';
import fs from 'fs';
import { logger } from '../services/logger.service';
import path from 'path';

export interface IDatabase {
  query(sql: string, params?: any[]): Promise<any[]>;
  execute(sql: string, params?: any[]): Promise<void>;
  get(sql: string, params?: any[]): Promise<any | null>;
  close(): Promise<void>;
}

class PostgreSQLDatabase implements IDatabase {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: config.database.postgres.host,
      port: config.database.postgres.port,
      database: config.database.postgres.database,
      user: config.database.postgres.user,
      password: config.database.postgres.password,
    });
  }

  async query(sql: string, params: any[] = []): Promise<any[]> {
    // Try to create a DB span when tracing is enabled
    try {
      const api = await import('@opentelemetry/api');
      const tracer = api.trace.getTracer('diagnosticox-db');
      return tracer.startActiveSpan('db.query', { attributes: { db_system: 'postgres', db_statement: sql } }, async (span: any) => {
        try {
          const result = await this.pool.query(sql, params);
          return result.rows;
        } catch (err) {
          span.recordException(err);
          throw err;
        } finally {
          span.end();
        }
      });
    } catch (_) {
      const result = await this.pool.query(sql, params);
      return result.rows;
    }
  }

  async execute(sql: string, params: any[] = []): Promise<void> {
    try {
      const api = await import('@opentelemetry/api');
      const tracer = api.trace.getTracer('diagnosticox-db');
      await tracer.startActiveSpan('db.execute', { attributes: { db_system: 'postgres', db_statement: sql } }, async (span: any) => {
        try {
          await this.pool.query(sql, params);
        } catch (err) {
          span.recordException(err);
          throw err;
        } finally {
          span.end();
        }
      });
    } catch (_) {
      await this.pool.query(sql, params);
    }
  }

  async get(sql: string, params: any[] = []): Promise<any | null> {
    try {
      const api = await import('@opentelemetry/api');
      const tracer = api.trace.getTracer('diagnosticox-db');
      return tracer.startActiveSpan('db.get', { attributes: { db_system: 'postgres', db_statement: sql } }, async (span: any) => {
        try {
          const result = await this.pool.query(sql, params);
          return result.rows[0] || null;
        } catch (err) {
          span.recordException(err);
          throw err;
        } finally {
          span.end();
        }
      });
    } catch (_) {
      const result = await this.pool.query(sql, params);
      return result.rows[0] || null;
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

class SQLiteDatabase implements IDatabase {
  private db: SqlJsDatabase | null = null;
  private dbPath: string;
  private SQL: any;
  private initialized: boolean = false;

  constructor(dbPath: string) {
    this.dbPath = dbPath;
  }

  private async init() {
    if (this.initialized) return;

    this.SQL = await initSqlJs();
    
    const dbDir = path.dirname(this.dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    if (fs.existsSync(this.dbPath)) {
      const buffer = fs.readFileSync(this.dbPath);
      this.db = new this.SQL.Database(buffer);
    } else {
      this.db = new this.SQL.Database();
    }

    this.initialized = true;
  }

  private async save() {
    if (!this.db) return;
    const data = this.db.export();
    fs.writeFileSync(this.dbPath, data);
  }

  async query(sql: string, params: any[] = []): Promise<any[]> {
    await this.init();
    if (!this.db) return [];

    try {
      // try adding a db span
      try {
        const api = await import('@opentelemetry/api');
        const tracer = api.trace.getTracer('diagnosticox-db');
        return await tracer.startActiveSpan('db.query', { attributes: { db_system: 'sqlite', db_statement: sql } }, async (span: any) => {
          try {
            const results = this.db!.exec(sql, params);
            if (results.length === 0) return [];

            const columns = results[0].columns;
            const values = results[0].values;

            return values.map((row: any[]) => {
              const obj: any = {};
              columns.forEach((col: string, idx: number) => {
                obj[col] = row[idx];
              });
              return obj;
            });
          } catch (err) {
            span.recordException(err);
            throw err;
          } finally {
            span.end();
          }
        });
      } catch (_) {
        const results = this.db!.exec(sql, params);
        if (results.length === 0) return [];

        const columns = results[0].columns;
        const values = results[0].values;

        return values.map((row: any[]) => {
          const obj: any = {};
          columns.forEach((col: string, idx: number) => {
            obj[col] = row[idx];
          });
          return obj;
        });
      }
      if (results.length === 0) return [];

      const columns = results[0].columns;
      const values = results[0].values;

      return values.map((row: any[]) => {
        const obj: any = {};
        columns.forEach((col: string, idx: number) => {
          obj[col] = row[idx];
        });
        return obj;
      });
    } catch (error) {
      logger.error({ error }, 'Query error');
      return [];
    }
  }

  async execute(sql: string, params: any[] = []): Promise<void> {
    await this.init();
    if (!this.db) return;

    try {
      // try span
      try {
        const api = await import('@opentelemetry/api');
        const tracer = api.trace.getTracer('diagnosticox-db');
        await tracer.startActiveSpan('db.execute', { attributes: { db_system: 'sqlite', db_statement: sql } }, async (span: any) => {
          try {
            this.db!.run(sql, params);
            await this.save();
          } catch (err) {
            span.recordException(err);
            throw err;
          } finally {
            span.end();
          }
        });
      } catch (_) {
        this.db.run(sql, params);
        await this.save();
      }
    } catch (error) {
      logger.error({ error }, 'Execute error');
      throw error;
    }
  }

  async get(sql: string, params: any[] = []): Promise<any | null> {
    const results = await this.query(sql, params);
    return results[0] || null;
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.save();
      this.db.close();
      this.db = null;
      this.initialized = false;
    }
  }
}

let dbInstance: IDatabase | null = null;

export function createDatabase(): IDatabase {
  if (config.database.type === 'postgresql') {
    return new PostgreSQLDatabase();
  } else {
    return new SQLiteDatabase(config.database.sqlite.path);
  }
}

export function getDatabase(): IDatabase {
  if (!dbInstance) {
    dbInstance = createDatabase();
  }
  return dbInstance;
}

export async function closeDatabase(): Promise<void> {
  if (dbInstance) {
    await dbInstance.close();
    dbInstance = null;
  }
}
