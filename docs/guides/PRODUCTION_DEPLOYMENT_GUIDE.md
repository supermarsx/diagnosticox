# Production Deployment Guide - Medical Diagnosis Platform

## 🚀 Current Deployment Status

**Production URL:** https://04fp8gyyco80.space.minimax.io

**Build Status:** ✅ Clean - All TypeScript errors resolved  
**Bundle Size:** 4.4 MB (optimized with code splitting)  
**Build Time:** 15.01s  
**Modules:** 2,541 transformed

---

## 📋 Overview

This comprehensive medical diagnosis platform includes 14 enhancement categories with advanced clinical decision support, medical research integration, and FHIR R4 compliance. This guide covers complete production deployment including API key setup and backend configuration.

---

## 🔑 STEP 1: API Keys & Credentials Setup

### Required API Keys

#### 1. **WHO ICD-API (ICD-10/ICD-11 Integration)**
- **Purpose:** Medical coding, diagnosis lookup, ICD-10↔ICD-11 mapping
- **Registration:** https://icd.who.int/icdapi
- **Required Credentials:**
  - `VITE_WHO_ICD_CLIENT_ID`
  - `VITE_WHO_ICD_CLIENT_SECRET`
- **Setup:**
  ```bash
  # Add to .env file
  VITE_WHO_ICD_CLIENT_ID=your_client_id
  VITE_WHO_ICD_CLIENT_SECRET=your_client_secret
  ```

#### 2. **PubMed E-utilities API (Medical Literature)**
- **Purpose:** Medical literature search, evidence-based research
- **Registration:** https://www.ncbi.nlm.nih.gov/account/
- **Required Credentials:**
  - `VITE_PUBMED_API_KEY` (optional but recommended for higher rate limits)
- **Setup:**
  ```bash
  VITE_PUBMED_API_KEY=your_api_key
  ```

#### 3. **DrugBank Clinical API (Drug Interactions)**
- **Purpose:** Drug information, drug-drug interaction checking
- **Registration:** https://go.drugbank.com/
- **Required Credentials:**
  - `VITE_DRUGBANK_API_KEY`
- **Setup:**
  ```bash
  VITE_DRUGBANK_API_KEY=your_api_key
  ```

#### 4. **AI Provider APIs (Multi-Provider Support)**

**OpenAI (GPT-4):**
- **Registration:** https://platform.openai.com/
- **Credential:** `VITE_OPENAI_API_KEY`
- **Setup:**
  ```bash
  VITE_OPENAI_API_KEY=sk-...
  ```

**Anthropic (Claude):**
- **Registration:** https://console.anthropic.com/
- **Credential:** `VITE_ANTHROPIC_API_KEY`
- **Setup:**
  ```bash
  VITE_ANTHROPIC_API_KEY=sk-ant-...
  ```

**Google AI (Gemini):**
- **Registration:** https://makersuite.google.com/
- **Credential:** `VITE_GOOGLE_API_KEY`
- **Setup:**
  ```bash
  VITE_GOOGLE_API_KEY=your_api_key
  ```

**Local LLM (Ollama - Optional):**
- **Installation:** https://ollama.ai/
- **No API key required** - runs locally
- **Setup:**
  ```bash
  VITE_OLLAMA_BASE_URL=http://localhost:11434
  ```

#### 5. **Infermedica Symptom Checker (Optional Enhanced Features)**
- **Purpose:** Advanced symptom analysis and triage
- **Registration:** https://developer.infermedica.com/
- **Credential:** `VITE_INFERMEDICA_API_KEY`
- **Setup:**
  ```bash
  VITE_INFERMEDICA_API_KEY=your_api_key
  VITE_INFERMEDICA_APP_ID=your_app_id
  ```

---

## 🗄️ STEP 2: Backend Deployment (Optional but Recommended)

### Backend Architecture

The platform can run in two modes:

#### Mode 1: Frontend-Only (Current Deployment)
- Uses demo data and client-side processing
- Suitable for: Testing, demonstrations, proof-of-concept
- **Limitations:** No persistent data, no real patient records

#### Mode 2: Full-Stack (Production Recommended)
- Complete backend with database persistence
- User authentication and authorization
- HIPAA-compliant data storage
- Real-time data synchronization

### Backend Setup Instructions

1. **Choose Backend Technology:**
   - **Option A:** Node.js + Express + SQLite (included in previous work)
   - **Option B:** Supabase (recommended for production)
   - **Option C:** Custom backend with your preferred stack

2. **For Supabase Backend:**

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize Supabase project
supabase init

# Start local development
supabase start

# Deploy to Supabase cloud
supabase db push
```

3. **Configure Environment Variables:**

```bash
# Supabase credentials
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

4. **Database Schema:**

Create required tables:
- `users` - User accounts and authentication
- `patients` - Patient demographics and records
- `diagnoses` - Differential diagnoses and clinical notes
- `treatments` - Treatment plans and trials
- `audit_logs` - HIPAA audit trail
- `fhir_resources` - FHIR R4 resource storage

5. **API Endpoints Required:**

```
POST   /api/auth/login          - User authentication
GET    /api/patients            - List patients
GET    /api/patients/:id        - Get patient details
POST   /api/patients            - Create patient
PUT    /api/patients/:id        - Update patient
POST   /api/diagnoses           - Create diagnosis
GET    /api/fhir/resources      - FHIR resource query
POST   /api/fhir/resources      - FHIR resource creation
GET    /api/security/audit-logs - Security audit logs
```

---

## 🌍 STEP 3: Environment Configuration

### Complete .env File Template

Create `.env` file in project root:

```bash
# ==============================================
# MEDICAL DIAGNOSIS PLATFORM - ENVIRONMENT CONFIG
# ==============================================

# WHO ICD-API Configuration
VITE_WHO_ICD_CLIENT_ID=your_client_id
VITE_WHO_ICD_CLIENT_SECRET=your_client_secret
VITE_WHO_ICD_TOKEN_ENDPOINT=https://icdaccessmanagement.who.int/connect/token
VITE_WHO_ICD_API_BASE_URL=https://id.who.int

# NCBI PubMed E-utilities
VITE_PUBMED_API_KEY=your_api_key
VITE_PUBMED_EMAIL=your_email@example.com

# DrugBank Clinical API
VITE_DRUGBANK_API_KEY=your_api_key

# AI Provider APIs
VITE_OPENAI_API_KEY=sk-...
VITE_ANTHROPIC_API_KEY=sk-ant-...
VITE_GOOGLE_API_KEY=your_google_api_key

# Local LLM (Optional)
VITE_OLLAMA_BASE_URL=http://localhost:11434

# Infermedica Symptom Checker (Optional)
VITE_INFERMEDICA_API_KEY=your_api_key
VITE_INFERMEDICA_APP_ID=your_app_id

# Supabase Backend (if using)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Application Configuration
VITE_APP_NAME=Medical Diagnosis Platform
VITE_USAGE_MODE=clinical_setting
VITE_ENABLE_ANALYTICS=true
VITE_HIPAA_MODE=true

# ClinicalTrials.gov
VITE_CLINICALTRIALS_BASE_URL=https://clinicaltrials.gov/api/v2
```

---

## 🏗️ STEP 4: Build & Deploy

### Development Build

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Access at http://localhost:5173
```

### Production Build

```bash
# Production build with optimizations
pnpm run build

# Preview production build locally
pnpm run preview

# Output: dist/ folder ready for deployment
```

### Deploy to Production

**Option 1: Static Hosting (Current)**
- Vercel: `vercel deploy`
- Netlify: `netlify deploy`
- AWS S3 + CloudFront
- Current deployment: MiniMax Space

**Option 2: Full-Stack Hosting**
- AWS EC2 + RDS
- Google Cloud Platform
- Azure App Service
- Heroku

---

## ✅ STEP 5: Post-Deployment Checklist

### Functional Testing

- [ ] **Authentication:** Test login/logout flow
- [ ] **ICD Lookup:** Verify WHO ICD-API connection
- [ ] **DSM-5 Assessments:** Test PHQ-9, GAD-7, PC-PTSD-5
- [ ] **Symptom Checker:** Validate symptom search and differential diagnosis
- [ ] **Medical Research:** Test PubMed, ClinicalTrials, DrugBank APIs
- [ ] **AI Diagnosis:** Verify AI provider connections
- [ ] **VINDICATE-M:** Test diagnostic framework and Bayesian calculator
- [ ] **FHIR R4:** Validate resource creation and export
- [ ] **Adaptive Management:** Check cost tracking and monitoring
- [ ] **Feature Management:** Test usage mode switching
- [ ] **Analytics:** Verify dashboards and visualizations
- [ ] **Security:** Test RBAC, audit logs, encryption

### Performance Testing

- [ ] **Load Time:** < 3 seconds on 3G
- [ ] **Bundle Size:** Optimized chunks loaded on demand
- [ ] **API Response:** < 500ms for cached queries
- [ ] **Database Queries:** Indexed and optimized

### Security Verification

- [ ] **HTTPS:** SSL certificate valid
- [ ] **API Keys:** Stored securely (environment variables only)
- [ ] **CORS:** Configured for production domain
- [ ] **CSP Headers:** Content Security Policy enabled
- [ ] **HIPAA Compliance:** Audit logs, encryption, access controls
- [ ] **Authentication:** JWT tokens, session management
- [ ] **Authorization:** Role-based access control (RBAC)

### Monitoring Setup

- [ ] **Error Tracking:** Sentry or similar
- [ ] **Performance Monitoring:** Web vitals, Lighthouse scores
- [ ] **API Monitoring:** Uptime checks, rate limit tracking
- [ ] **User Analytics:** Privacy-compliant analytics
- [ ] **Audit Logs:** HIPAA-compliant logging system

---

## 📊 Production Metrics

### Current Build Statistics

```
Total Bundle Size: 4.4 MB
  - react-vendor.js:      957.91 kB (React core)
  - pages.js:           1,799.02 kB (Application pages)
  - vendor.js:            527.68 kB (Third-party libs)
  - security-pages.js:    351.02 kB (Security modules)
  - analytics-pages.js:   225.25 kB (Analytics)
  - clinical-pages.js:    187.45 kB (Clinical tools)
  - services.js:          134.58 kB (Core services)

Build Time: 15.01 seconds
Modules Transformed: 2,541
Code Splitting: 12 optimized chunks
```

### Performance Targets

- **Lighthouse Score:** > 90
- **First Contentful Paint:** < 1.5s
- **Time to Interactive:** < 3.5s
- **Cumulative Layout Shift:** < 0.1

---

## 🔒 HIPAA Compliance Considerations

### Required for Healthcare Production

1. **Business Associate Agreements (BAAs):**
   - Supabase: Enterprise plan required for BAA
   - OpenAI: Healthcare-specific terms
   - All third-party services must sign BAAs

2. **Data Encryption:**
   - At rest: AES-256 encryption
   - In transit: TLS 1.3
   - Backup encryption: Enabled

3. **Access Controls:**
   - Multi-factor authentication (MFA)
   - Role-based access control (RBAC)
   - Audit logging (all CRUD operations)
   - Session timeout: 30 minutes

4. **Audit Trail:**
   - All patient data access logged
   - User authentication events tracked
   - Data modifications recorded
   - Export capabilities for compliance reports

---

## 🆘 Troubleshooting

### Common Issues

**Issue: API Keys Not Working**
```bash
# Solution: Verify .env file is loaded
echo $VITE_OPENAI_API_KEY

# Rebuild after adding new keys
pnpm run build
```

**Issue: WHO ICD-API OAuth Errors**
```bash
# Solution: Token endpoint requires client_credentials grant
# Verify clientId and clientSecret are correct
# Check token expiration (tokens expire after 3600 seconds)
```

**Issue: CORS Errors**
```bash
# Solution: Configure backend CORS headers
Access-Control-Allow-Origin: https://yourdomain.com
Access-Control-Allow-Credentials: true
```

**Issue: Bundle Size Too Large**
```bash
# Solution: Analyze bundle
pnpm run build:analyze

# Implement dynamic imports for large modules
# Enable compression on server (gzip/brotli)
```

---

## 📞 Support & Resources

### Documentation
- **User Guide:** See `docs/USER_GUIDE.md`
- **API Documentation:** See `docs/API_REFERENCE.md`
- **Developer Docs:** See `docs/DEVELOPMENT.md`

### External Resources
- WHO ICD-API: https://icd.who.int/icdapi/docs2
- PubMed API: https://www.ncbi.nlm.nih.gov/books/NBK25501/
- FHIR R4: https://www.hl7.org/fhir/
- OpenAI API: https://platform.openai.com/docs

---

## 🎯 Production Readiness Summary

**✅ Completed:**
- Clean TypeScript compilation (0 errors in production code)
- Optimized production build
- Code splitting and lazy loading
- Professional UI/UX with glassmorphism design
- Comprehensive error handling
- HIPAA compliance features
- Multi-provider AI integration
- FHIR R4 interoperability
- VINDICATE-M diagnostic framework
- Adaptive cost management

**⚠️ Required for Full Production:**
- API keys for external services (WHO, PubMed, DrugBank, AI providers)
- Backend deployment with persistent database
- HIPAA BAAs with third-party services
- Production SSL certificate
- Monitoring and logging infrastructure
- Load balancing and scalability setup
- Disaster recovery plan

**🔄 Recommended Enhancements:**
- Real-time collaboration features
- Mobile native apps (iOS/Android)
- Integration with EHR systems
- Telemedicine capabilities
- Advanced ML models for diagnosis
- Clinical decision support algorithms

---

**Last Updated:** 2025-11-06  
**Version:** 1.0.0  
**Deployment URL:** https://04fp8gyyco80.space.minimax.io
