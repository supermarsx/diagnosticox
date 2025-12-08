import { Request, Response, NextFunction } from 'express';
import { getDatabase } from '../config/database';

export interface AuthRequest extends Request {
  user?: any;
}

// Check if user has a specific permission
export async function hasPermission(userId: string, permission: string): Promise<boolean> {
  try {
    const db = getDatabase();
    
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
  } catch (error) {
    console.error('Permission check error:', error);
    return false;
  }
}

// Check if user has a specific role
export async function hasRole(userId: string, roleName: string): Promise<boolean> {
  try {
    const db = getDatabase();
    
    const userRole = await db.get(`
      SELECT r.name 
      FROM user_roles ur
      JOIN security_roles r ON ur.role_id = r.id
      WHERE ur.user_id = ?
      LIMIT 1
    `, [userId]);
    
    return userRole?.name === roleName;
  } catch (error) {
    console.error('Role check error:', error);
    return false;
  }
}

// Middleware to require specific permission
export function requirePermission(permission: string) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const hasAccess = await hasPermission(req.user.id, permission);
      
      if (!hasAccess) {
        return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
      }
      
      next();
    } catch (error: any) {
      console.error('Permission middleware error:', error);
      res.status(500).json({ error: error.message });
    }
  };
}

// Middleware to require specific role
export function requireRole(roleName: string) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const hasRequiredRole = await hasRole(req.user.id, roleName);
      
      if (!hasRequiredRole) {
        return res.status(403).json({ error: 'Forbidden: Insufficient role' });
      }
      
      next();
    } catch (error: any) {
      console.error('Role middleware error:', error);
      res.status(500).json({ error: error.message });
    }
  };
}

// Middleware to require admin access
export async function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const isAdmin = await hasRole(req.user.id, 'Super Administrator');
    
    if (!isAdmin) {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    
    next();
  } catch (error: any) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ error: error.message });
  }
}
