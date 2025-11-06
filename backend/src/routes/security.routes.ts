import { Router } from 'express';
import { SecurityController } from '../controllers/security.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All security routes require authentication
router.use(authenticate);

// Roles
router.get('/roles', SecurityController.getRoles);
router.get('/roles/:id', SecurityController.getRoleById);

// Users
router.get('/users', SecurityController.getUsers);

// Audit Logs
router.get('/audit-logs', SecurityController.getAuditLogs);
router.post('/audit-logs', SecurityController.createAuditLog);

// Encryption
router.get('/encryption/keys', SecurityController.getEncryptionKeys);
router.get('/encryption/certificates', SecurityController.getCertificates);

// Privacy
router.get('/privacy/consents', SecurityController.getConsentRecords);
router.get('/privacy/agreements', SecurityController.getSharingAgreements);

// Organizations & Departments
router.get('/organizations', SecurityController.getOrganizations);
router.get('/departments', SecurityController.getDepartments);

// Auth Methods
router.get('/auth-methods/:user_id', SecurityController.getAuthMethods);
router.get('/trusted-devices/:user_id', SecurityController.getTrustedDevices);

// Security Policies
router.get('/policies', SecurityController.getSecurityPolicies);

// System Metrics
router.get('/metrics', SecurityController.getSystemMetrics);

export default router;
