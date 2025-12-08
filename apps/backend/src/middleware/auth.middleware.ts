import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    organizationId: string;
    role: string;
  };
  tenantId?: string;
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = authService.verifyToken(token);
    
    if (!decoded.organizationId) {
      return res.status(401).json({ error: 'Organization context missing in token' });
    }

    req.user = decoded;
    req.tenantId = decoded.organizationId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function authorize(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}

export function validateOrganization(req: AuthRequest, res: Response, next: NextFunction) {
  const resourceOrgId = req.params.organizationId || req.body.organization_id;
  
  if (resourceOrgId && resourceOrgId !== req.user?.organizationId) {
    return res.status(403).json({ error: 'Access denied to this organization' });
  }

  next();
}

/**
 * Enforces tenant isolation by ensuring any explicit org identifier on the request
 * (header, param, or body) matches the organization in the JWT. Sets `req.tenantId`
 * for downstream handlers to use in queries.
 */
export function enforceTenant(req: AuthRequest, res: Response, next: NextFunction) {
  const tokenOrg = req.user?.organizationId;
  const headerOrg = (req.headers['x-org-id'] as string | undefined)?.trim();
  const paramOrg = (req.params as Record<string, string | undefined>).organizationId;
  const bodyOrg = (req.body as Record<string, string | undefined>).organization_id;

  const claimedOrgs = [headerOrg, paramOrg, bodyOrg].filter(Boolean) as string[];
  const uniqueClaims = Array.from(new Set(claimedOrgs));

  if (!tokenOrg) {
    return res.status(401).json({ error: 'Organization context missing from token' });
  }

  if (uniqueClaims.length > 0 && uniqueClaims.some((org) => org !== tokenOrg)) {
    return res.status(403).json({ error: 'Organization mismatch for this request' });
  }

  req.tenantId = tokenOrg;

  // Normalize body org so downstream inserts/updates stay scoped
  if (req.body && typeof req.body === 'object') {
    (req.body as any).organization_id = tokenOrg;
  }

  next();
}
