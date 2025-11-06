"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const database_1 = require("../config/database");
const config_1 = require("../config");
class AuthService {
    constructor() {
        this.db = (0, database_1.getDatabase)();
    }
    async register(email, password, fullName, organizationId, role = 'clinician') {
        // Check if user exists
        const existing = await this.db.get('SELECT id FROM users WHERE email = ?', [email]);
        if (existing) {
            throw new Error('User already exists');
        }
        // Hash password with bcryptjs (production-ready)
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        // Create user
        const userId = (0, uuid_1.v4)();
        const now = new Date().toISOString();
        await this.db.execute(`INSERT INTO users (id, organization_id, email, password_hash, full_name, role, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [userId, organizationId, email, passwordHash, fullName, role, now, now]);
        // Get user without password
        const user = await this.db.get('SELECT id, organization_id, email, full_name, role, specialty, credentials, preferences, created_at, updated_at FROM users WHERE id = ?', [userId]);
        // Generate token
        const token = this.generateToken(userId, organizationId, role);
        return { user, token };
    }
    async login(email, password) {
        // Get user with password
        const user = await this.db.get('SELECT * FROM users WHERE email = ?', [email]);
        if (!user) {
            throw new Error('Invalid credentials');
        }
        // Verify password with bcryptjs (production-ready)
        const validPassword = await bcryptjs_1.default.compare(password, user.password_hash);
        if (!validPassword) {
            throw new Error('Invalid credentials');
        }
        // Generate token
        const token = this.generateToken(user.id, user.organization_id, user.role);
        // Remove password from response
        const { password_hash, ...userWithoutPassword } = user;
        return { user: userWithoutPassword, token };
    }
    generateToken(userId, organizationId, role) {
        const payload = { userId, organizationId, role };
        const options = { expiresIn: config_1.config.auth.jwtExpiresIn };
        return jsonwebtoken_1.default.sign(payload, config_1.config.auth.jwtSecret, options);
    }
    verifyToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, config_1.config.auth.jwtSecret);
        }
        catch (error) {
            throw new Error('Invalid token');
        }
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
