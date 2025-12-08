import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../config/database';
import { config } from '../config';
import { User } from '../types';
import { ensureOrganizationExists } from '../utils/tenancy';

/**
 * AuthService
 *
 * Small authentication helper for the prototype backend. Responsibilities:
 *  - Bootstrap a first organization + admin user for fresh deployments
 *  - Register/login users using email+password (bcrypt)
 *  - Generate and verify JWT access tokens that include tenant (organization_id)
 *    and role claims used by the app's RBAC/tenant middleware.
 *
 * WARNING: This is not a complete production identity system. It demonstrates
 * typical auth flows for a monorepo prototype and should be replaced by a
 * hardened identity provider (OIDC/Keycloak/Auth0) for production.
 */
export class AuthService {
  private db = getDatabase();

  async bootstrapAdmin(
    orgName: string,
    adminEmail: string,
    adminPassword: string,
    adminFullName: string,
    orgId?: string
  ): Promise<{ organizationId: string; user: Omit<User, 'password_hash'>; token: string }> {
    const existingUser = await this.db.get('SELECT id FROM users LIMIT 1');
    if (existingUser) {
      throw new Error('Bootstrap allowed only on a fresh deployment with no users');
    }

    const organizationId = orgId || uuidv4();
    const now = new Date().toISOString();

    await this.db.execute(
      `INSERT INTO organizations (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)`,
      [organizationId, orgName, now, now]
    );

    const { user, token } = await this.register(
      adminEmail,
      adminPassword,
      adminFullName,
      organizationId,
      'admin'
    );

    return { organizationId, user, token };
  }

  async register(
    email: string,
    password: string,
    fullName: string,
    organizationId: string,
    role: 'clinician' | 'admin' | 'resident' = 'clinician'
  ): Promise<{ user: Omit<User, 'password_hash'>; token: string }> {
    await ensureOrganizationExists(organizationId);

    // Check if user exists
    const existing = await this.db.get(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existing) {
      throw new Error('User already exists');
    }

    // Hash password with bcryptjs (production-ready)
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const userId = uuidv4();
    const now = new Date().toISOString();

    await this.db.execute(
      `INSERT INTO users (id, organization_id, email, password_hash, full_name, role, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, organizationId, email, passwordHash, fullName, role, now, now]
    );

    // Get user without password
    const user = await this.db.get(
      'SELECT id, organization_id, email, full_name, role, specialty, credentials, preferences, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    );

    // Generate token
    const token = this.generateToken(userId, organizationId, role);

    return { user, token };
  }

  async login(
    email: string,
    password: string
  ): Promise<{ user: Omit<User, 'password_hash'>; token: string }> {
    // Get user with password
    const user = await this.db.get(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password with bcryptjs (production-ready)
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      throw new Error('Invalid credentials');
    }

    // Generate token
    const token = this.generateToken(user.id, user.organization_id, user.role);

    // Remove password from response
    const { password_hash, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }

  generateToken(userId: string, organizationId: string, role: string): string {
    const payload = { userId, organizationId, role };
    const options: SignOptions = { expiresIn: config.auth.jwtExpiresIn as any };
    return jwt.sign(payload, config.auth.jwtSecret, options);
  }

  verifyToken(token: string): { userId: string; organizationId: string; role: string } {
    try {
      return jwt.verify(token, config.auth.jwtSecret) as any;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}

export const authService = new AuthService();
