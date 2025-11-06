"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const security_controller_1 = require("../controllers/security.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// All security routes require authentication
router.use(auth_middleware_1.authenticate);
// Roles
router.get('/roles', security_controller_1.SecurityController.getRoles);
router.get('/roles/:id', security_controller_1.SecurityController.getRoleById);
// Users
router.get('/users', security_controller_1.SecurityController.getUsers);
// Audit Logs
router.get('/audit-logs', security_controller_1.SecurityController.getAuditLogs);
router.post('/audit-logs', security_controller_1.SecurityController.createAuditLog);
// Encryption
router.get('/encryption/keys', security_controller_1.SecurityController.getEncryptionKeys);
router.get('/encryption/certificates', security_controller_1.SecurityController.getCertificates);
// Privacy
router.get('/privacy/consents', security_controller_1.SecurityController.getConsentRecords);
router.get('/privacy/agreements', security_controller_1.SecurityController.getSharingAgreements);
// Organizations & Departments
router.get('/organizations', security_controller_1.SecurityController.getOrganizations);
router.get('/departments', security_controller_1.SecurityController.getDepartments);
// Auth Methods
router.get('/auth-methods/:user_id', security_controller_1.SecurityController.getAuthMethods);
router.get('/trusted-devices/:user_id', security_controller_1.SecurityController.getTrustedDevices);
// Security Policies
router.get('/policies', security_controller_1.SecurityController.getSecurityPolicies);
// System Metrics
router.get('/metrics', security_controller_1.SecurityController.getSystemMetrics);
exports.default = router;
