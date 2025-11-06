"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasPermission = hasPermission;
exports.hasRole = hasRole;
exports.requirePermission = requirePermission;
exports.requireRole = requireRole;
exports.requireAdmin = requireAdmin;
const database_1 = require("../config/database");
// Check if user has a specific permission
async function hasPermission(userId, permission) {
    try {
        const db = (0, database_1.getDatabase)();
        // Get user's role
        const userRole = await db.get(`
      SELECT r.permissions 
      FROM user_roles ur
      JOIN security_roles r ON ur.role_id = r.id
      WHERE ur.user_id = ?
      LIMIT 1
    `, [userId]);
        if (!userRole) {
            return false;
        }
        const permissions = JSON.parse(userRole.permissions || '[]');
        // Check if user has 'all' permissions
        if (permissions.includes('all')) {
            return true;
        }
        // Check if user has the specific permission
        return permissions.includes(permission);
    }
    catch (error) {
        console.error('Permission check error:', error);
        return false;
    }
}
// Check if user has a specific role
async function hasRole(userId, roleName) {
    try {
        const db = (0, database_1.getDatabase)();
        const userRole = await db.get(`
      SELECT r.name 
      FROM user_roles ur
      JOIN security_roles r ON ur.role_id = r.id
      WHERE ur.user_id = ?
      LIMIT 1
    `, [userId]);
        return userRole?.name === roleName;
    }
    catch (error) {
        console.error('Role check error:', error);
        return false;
    }
}
// Middleware to require specific permission
function requirePermission(permission) {
    return async (req, res, next) => {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const hasAccess = await hasPermission(req.user.id, permission);
            if (!hasAccess) {
                return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
            }
            next();
        }
        catch (error) {
            console.error('Permission middleware error:', error);
            res.status(500).json({ error: error.message });
        }
    };
}
// Middleware to require specific role
function requireRole(roleName) {
    return async (req, res, next) => {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const hasRequiredRole = await hasRole(req.user.id, roleName);
            if (!hasRequiredRole) {
                return res.status(403).json({ error: 'Forbidden: Insufficient role' });
            }
            next();
        }
        catch (error) {
            console.error('Role middleware error:', error);
            res.status(500).json({ error: error.message });
        }
    };
}
// Middleware to require admin access
async function requireAdmin(req, res, next) {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const isAdmin = await hasRole(req.user.id, 'Super Administrator');
        if (!isAdmin) {
            return res.status(403).json({ error: 'Forbidden: Admin access required' });
        }
        next();
    }
    catch (error) {
        console.error('Admin middleware error:', error);
        res.status(500).json({ error: error.message });
    }
}
