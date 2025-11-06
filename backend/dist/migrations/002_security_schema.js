"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
const database_1 = require("../config/database");
async function up() {
    const db = (0, database_1.getDatabase)();
    // Create security_roles table
    await db.execute(`
    CREATE TABLE IF NOT EXISTS security_roles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      permissions TEXT NOT NULL DEFAULT '[]',
      inherits_from TEXT,
      color TEXT DEFAULT 'from-blue-500 to-blue-600',
      user_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);
    // Create user_roles table  
    await db.execute(`
    CREATE TABLE IF NOT EXISTS user_roles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      role_id TEXT NOT NULL,
      assigned_by TEXT,
      assigned_at TEXT DEFAULT (datetime('now')),
      expires_at TEXT
    )
  `);
    // Create departments table
    await db.execute(`
    CREATE TABLE IF NOT EXISTS departments (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL,
      name TEXT NOT NULL,
      manager_id TEXT,
      location TEXT,
      budget REAL DEFAULT 0,
      user_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);
    // Create auth_methods table
    await db.execute(`
    CREATE TABLE IF NOT EXISTS auth_methods (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      method_type TEXT NOT NULL,
      identifier TEXT NOT NULL,
      enabled INTEGER DEFAULT 1,
      verified INTEGER DEFAULT 0,
      added_date TEXT DEFAULT (datetime('now')),
      last_used TEXT,
      metadata TEXT DEFAULT '{}'
    )
  `);
    // Create trusted_devices table
    await db.execute(`
    CREATE TABLE IF NOT EXISTS trusted_devices (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      device_name TEXT NOT NULL,
      ip_address TEXT,
      location TEXT,
      added_date TEXT DEFAULT (datetime('now')),
      last_active TEXT,
      expires_at TEXT
    )
  `);
    // Create audit_logs table
    await db.execute(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      timestamp TEXT DEFAULT (datetime('now')),
      user_email TEXT NOT NULL,
      action TEXT NOT NULL,
      resource TEXT,
      status TEXT NOT NULL,
      severity TEXT NOT NULL,
      ip_address TEXT,
      location TEXT,
      details TEXT,
      metadata TEXT DEFAULT '{}'
    )
  `);
    // Create encryption_keys table
    await db.execute(`
    CREATE TABLE IF NOT EXISTS encryption_keys (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      algorithm TEXT NOT NULL,
      key_size INTEGER NOT NULL,
      purpose TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      created_date TEXT DEFAULT (datetime('now')),
      expiry_date TEXT,
      last_rotation TEXT,
      usage_count INTEGER DEFAULT 0,
      metadata TEXT DEFAULT '{}'
    )
  `);
    // Create certificates table
    await db.execute(`
    CREATE TABLE IF NOT EXISTS certificates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      cert_type TEXT NOT NULL,
      issuer TEXT NOT NULL,
      valid_from TEXT NOT NULL,
      valid_until TEXT NOT NULL,
      status TEXT DEFAULT 'valid',
      domains TEXT DEFAULT '[]',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);
    // Create consent_records table
    await db.execute(`
    CREATE TABLE IF NOT EXISTS consent_records (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      patient_name TEXT NOT NULL,
      consent_type TEXT NOT NULL,
      status TEXT DEFAULT 'granted',
      granted_date TEXT DEFAULT (datetime('now')),
      expiry_date TEXT,
      scope TEXT DEFAULT '[]',
      metadata TEXT DEFAULT '{}'
    )
  `);
    // Create sharing_agreements table
    await db.execute(`
    CREATE TABLE IF NOT EXISTS sharing_agreements (
      id TEXT PRIMARY KEY,
      partner_name TEXT NOT NULL,
      partner_type TEXT NOT NULL,
      purpose TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      start_date TEXT NOT NULL,
      review_date TEXT NOT NULL,
      data_types TEXT DEFAULT '[]',
      patient_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);
    // Create security_policies table
    await db.execute(`
    CREATE TABLE IF NOT EXISTS security_policies (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      last_updated TEXT DEFAULT (datetime('now')),
      configuration TEXT DEFAULT '{}'
    )
  `);
    // Insert default roles
    await db.execute(`
    INSERT OR IGNORE INTO security_roles (id, name, description, permissions, color, user_count)
    VALUES 
      ('1', 'Super Administrator', 'Full system access with all permissions', '["all"]', 'from-red-500 to-red-600', 5),
      ('2', 'Organization Admin', 'Manage organization settings and users', '["org:manage","users:manage","roles:assign","billing:view"]', 'from-purple-500 to-purple-600', 12),
      ('3', 'Department Manager', 'Manage department and team members', '["dept:manage","users:view","patients:manage","reports:generate"]', 'from-blue-500 to-blue-600', 24),
      ('4', 'Physician', 'Full clinical access with patient management', '["patients:full","diagnoses:create","treatments:prescribe","records:access"]', 'from-green-500 to-green-600', 87),
      ('5', 'Nurse Practitioner', 'Clinical access with limited prescribing', '["patients:view","records:update","treatments:limited","vitals:record"]', 'from-teal-500 to-teal-600', 45),
      ('6', 'Nurse', 'Patient care and basic documentation', '["patients:view","vitals:record","notes:create","medications:administer"]', 'from-cyan-500 to-cyan-600', 63),
      ('7', 'Medical Assistant', 'Support clinical staff with basic tasks', '["patients:view","vitals:record","appointments:manage"]', 'from-indigo-500 to-indigo-600', 38),
      ('8', 'Billing Specialist', 'Financial and billing operations', '["billing:full","insurance:manage","reports:financial"]', 'from-yellow-500 to-yellow-600', 15)
  `);
    // Insert default security policies
    await db.execute(`
    INSERT OR IGNORE INTO security_policies (id, name, description, status)
    VALUES
      ('1', 'Password Policy', 'Minimum 12 characters, complexity requirements', 'active'),
      ('2', 'Session Timeout', 'Auto-logout after 30 minutes of inactivity', 'active'),
      ('3', 'IP Whitelist', 'Restrict access to approved IP ranges', 'active'),
      ('4', 'Failed Login Attempts', 'Lock account after 5 failed attempts', 'active')
  `);
    console.log('Security schema migration completed');
}
async function down() {
    const db = (0, database_1.getDatabase)();
    await db.execute('DROP TABLE IF EXISTS sharing_agreements');
    await db.execute('DROP TABLE IF EXISTS consent_records');
    await db.execute('DROP TABLE IF EXISTS certificates');
    await db.execute('DROP TABLE IF EXISTS encryption_keys');
    await db.execute('DROP TABLE IF EXISTS audit_logs');
    await db.execute('DROP TABLE IF EXISTS trusted_devices');
    await db.execute('DROP TABLE IF EXISTS auth_methods');
    await db.execute('DROP TABLE IF EXISTS departments');
    await db.execute('DROP TABLE IF EXISTS user_roles');
    await db.execute('DROP TABLE IF EXISTS security_roles');
    await db.execute('DROP TABLE IF EXISTS security_policies');
    console.log('Security schema migration rolled back');
}
