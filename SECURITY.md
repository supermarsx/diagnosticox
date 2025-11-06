# Security Policy

## Supported Versions

We actively support the following versions of DiagnosticoX with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

**IMPORTANT: Please do NOT report security vulnerabilities through public GitHub issues.**

If you discover a security vulnerability in DiagnosticoX, please report it responsibly:

### Reporting Process

1. **Email Security Team**: Send details to [security@diagnosticox.com] (or repository maintainer)
2. **Include Details**:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)
   - Your contact information

3. **Wait for Response**: We will acknowledge receipt within 48 hours
4. **Coordinated Disclosure**: We will work with you on a coordinated disclosure timeline

### What to Expect

- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 7 days
- **Status Updates**: Every 7 days until resolved
- **Fix Timeline**: Critical issues within 14 days, others within 30 days
- **Public Disclosure**: After fix is deployed and coordinated with reporter

## Security Best Practices

### For Users

1. **Environment Variables**
   - Never commit `.env` files to version control
   - Use strong, unique API keys
   - Rotate credentials regularly
   - Store secrets securely (e.g., password managers, secret management services)

2. **API Keys**
   - Restrict API key permissions to minimum required
   - Use different keys for development and production
   - Monitor API usage for anomalies
   - Revoke compromised keys immediately

3. **Patient Data (PHI/PII)**
   - **NEVER** use real patient data in development or testing
   - Always use synthetic or anonymized data
   - Comply with HIPAA, GDPR, and local regulations
   - Implement proper access controls
   - Encrypt sensitive data at rest and in transit

4. **Authentication**
   - Use strong passwords (minimum 12 characters)
   - Enable multi-factor authentication (MFA)
   - Implement session timeout
   - Use secure session storage

5. **Updates**
   - Keep DiagnosticoX updated to latest version
   - Update dependencies regularly
   - Monitor security advisories

### For Developers

1. **Code Security**
   - Follow secure coding practices
   - Avoid SQL injection, XSS, CSRF vulnerabilities
   - Sanitize all user inputs
   - Use prepared statements for database queries
   - Implement rate limiting

2. **Dependency Management**
   - Run `pnpm audit` regularly
   - Update dependencies with known vulnerabilities
   - Review dependency licenses
   - Minimize dependency count

3. **Authentication & Authorization**
   - Implement proper RBAC (Role-Based Access Control)
   - Use JWT with short expiration times
   - Validate tokens on every request
   - Implement refresh token rotation

4. **Data Encryption**
   - Use HTTPS/TLS for all communications
   - Encrypt sensitive data at rest (AES-256)
   - Use secure key management
   - Implement proper certificate validation

5. **Logging & Monitoring**
   - Log security events
   - Monitor for suspicious activity
   - Implement alerting for security incidents
   - **Never log sensitive information** (passwords, API keys, PHI)

## Known Security Considerations

### IndexedDB Storage
- Data stored in IndexedDB is not encrypted by default
- Consider implementing client-side encryption for sensitive data
- IndexedDB data accessible to JavaScript in the same origin
- Clear IndexedDB when handling real patient data

### Cache System
- Cached data stored in browser storage (memory + IndexedDB)
- Cache may persist sensitive medical information
- Implement cache clearing on logout
- Consider TTL for sensitive data

### API Integration
- WHO ICD-API requires OAuth 2.0 authentication
- Store OAuth tokens securely
- Implement token refresh mechanism
- Never expose API keys in client-side code

### Medical Data
- Application handles medical terminology and codes
- Does NOT process actual patient PHI by default
- Users responsible for HIPAA/GDPR compliance
- Implement proper consent management

## Vulnerability Disclosure Policy

We follow coordinated vulnerability disclosure:

1. **Private Disclosure**: Report privately to security team
2. **Assessment**: We assess and develop fix
3. **Coordinated Release**: Agree on disclosure timeline with reporter
4. **Public Disclosure**: After fix is available and deployed

## Security Updates

Security updates are released as:
- **Critical**: Immediate patch release
- **High**: Within 7 days
- **Medium**: Within 30 days
- **Low**: Next regular release

## Compliance

DiagnosticoX aims to support compliance with:

### Healthcare Regulations
- **HIPAA** (Health Insurance Portability and Accountability Act)
- **HITECH** (Health Information Technology for Economic and Clinical Health)
- **GDPR** (General Data Protection Regulation)
- **PIPEDA** (Personal Information Protection and Electronic Documents Act)

### Security Standards
- **OWASP Top 10**: Address common web application vulnerabilities
- **NIST Cybersecurity Framework**: Follow NIST guidelines
- **SOC 2**: Security, availability, processing integrity
- **ISO 27001**: Information security management

**Note**: DiagnosticoX provides tools to support compliance but users are
responsible for implementing proper controls and procedures for their
specific regulatory requirements.

## Third-Party Dependencies

We actively monitor dependencies for security vulnerabilities:

- Automated security scans via GitHub Dependabot
- Regular manual audits
- Prompt updates for security patches
- Alternative packages evaluated when needed

## Incident Response

In case of a security incident:

1. **Containment**: Immediately contain the issue
2. **Assessment**: Assess scope and impact
3. **Notification**: Notify affected users
4. **Remediation**: Deploy fix
5. **Post-Incident**: Review and improve processes

## Security Contact

For security concerns:
- **Email**: [security@diagnosticox.com] (preferred)
- **GitHub**: Create a private security advisory
- **Response Time**: Within 48 hours

## Acknowledgments

We appreciate responsible disclosure and may publicly acknowledge security
researchers who report valid vulnerabilities (with their permission).

## Medical Disclaimer

Security vulnerabilities that could affect patient safety are treated with
highest priority. However, DiagnosticoX is NOT a certified medical device
and should not be used for clinical decision-making without proper validation
and professional oversight.

---

**Last Updated**: 2025-11-06

For general questions not related to security, please use GitHub Issues or Discussions.
