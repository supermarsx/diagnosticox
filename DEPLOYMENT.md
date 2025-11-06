# Medical Diagnosis Application - Deployment Guide

## Live Demo

**Application URL:** https://upep45l6x9je.space.minimax.io

The application is now live and ready to use in demo mode.

## Quick Start

1. **Access the Application**
   - Open https://upep45l6x9je.space.minimax.io in your browser
   - The application will load in demo mode with sample medical data

2. **Demo Mode**
   - Demo credentials: dr.smith@clinic.com / demo123
   - Click "Sign In" to access the dashboard
   - Sample data includes 2 patients with active medical problems

3. **Key Features to Explore**
   - **Patient Dashboard**: View all patients and their status
   - **Patient Details**: Click on a patient to see differential diagnoses
   - **Bayesian Calculator**: Click the calculator button to use the diagnostic tool
   - **Probability Calculations**: Adjust test parameters to see real-time updates

## Application Architecture

### Backend API (http://localhost:3000)

**Technology Stack:**
- Node.js 18+ with Express
- TypeScript for type safety
- In-memory database (SQLite-compatible for demo)
- JWT authentication

**API Endpoints:**
```
POST   /api/auth/login              - User authentication
POST   /api/auth/register           - User registration
GET    /api/patients                - List all patients
GET    /api/patients/:id            - Get patient details
POST   /api/patients                - Create new patient
GET    /api/problems/patient/:id    - Get patient problems
POST   /api/problems                - Create new problem
POST   /api/bayesian/calculate      - Calculate post-test probability
POST   /api/bayesian/calculate-both - Calculate both outcomes
POST   /api/bayesian/from-sens-spec - Calculate from sensitivity/specificity
POST   /api/bayesian/recommend-tier - Recommend testing tier
```

### Frontend Application (React/TypeScript)

**Technology Stack:**
- React 18.3 with TypeScript
- Vite 6.0 for blazing-fast development
- TailwindCSS 3.4 for styling
- React Router 6 for navigation
- Lucide React for icons

**Page Structure:**
- `/login` - Authentication page (demo mode)
- `/dashboard` - Patient dashboard with statistics
- `/patient/:id` - Patient detail with differential diagnoses
- `/calculator` - Bayesian probability calculator

## Database Schema

The application uses 16 tables for comprehensive medical data management:

### Core Tables
- **organizations** - Multi-tenant support
- **users** - Clinicians and staff with roles
- **patients** - Patient demographics and contact info
- **encounters** - Clinical visits and consultations

### Clinical Data Tables
- **problems** - Problem-oriented medical record
- **hypotheses** - Differential diagnoses with probabilities
- **facts** - Time-series clinical data and observations
- **timeline_events** - Key clinical events (step-changes, sentinel events)

### Diagnostic Tools
- **pivots** - Diagnostic test library with likelihood ratios
- **test_orders** - Ordered tests with Bayesian calculations
- **test_results** - Test results with probability updates

### Treatment Tracking
- **treatment_trials** - Treatment interventions with metrics
- **trial_metrics** - Treatment outcome tracking over time

### Quality & Safety
- **bias_guardrails** - Cognitive bias checkpoints
- **patient_diary** - Patient-reported outcomes
- **audit_logs** - Comprehensive audit trail

## Medical Workflows

### 1. Patient Intake
- Register new patients with demographics
- Record contact information and insurance
- Assign primary care provider

### 2. Problem-Oriented Diagnosis
- Document chief complaints and symptoms
- Create problem list with clinical context
- Track onset dates and priority

### 3. Differential Diagnosis
- Generate ranked list of hypotheses
- Document clinical reasoning for each
- Track evidence strength (definitive, strong, moderate, weak, against)
- Update probabilities as new data arrives

### 4. Bayesian Test Selection
- Calculate pretest probability from clinical assessment
- Select diagnostic tests with known sensitivity/specificity
- Calculate likelihood ratios (LR+ and LR-)
- Determine post-test probabilities for both positive and negative results
- Interpret clinical significance of probability changes

### 5. Timeline Visualization
- Track step-changes in patient condition
- Document sentinel events (key diagnostic moments)
- Record test orders and results
- Monitor treatment trials

### 6. Treatment Trials
- Design interventions with clear metrics
- Set success criteria and stop rules
- Track pretreatment baseline
- Monitor target metrics over time
- Make evidence-based decisions at decision points

## Bayesian Calculator Usage

The Bayesian calculator is the core diagnostic decision support tool.

### Inputs
1. **Pretest Probability** (0-100%)
   - Your clinical estimate before testing
   - Based on history, exam, epidemiology
   - Typically 10-50% for most diagnostic scenarios

2. **Test Sensitivity** (0-100%)
   - True positive rate
   - Percentage of diseased patients with positive test
   - Example: TSH for hypothyroidism = 95%

3. **Test Specificity** (0-100%)
   - True negative rate
   - Percentage of healthy patients with negative test
   - Example: TSH for hypothyroidism = 88%

### Calculations
The calculator automatically computes:
- **LR+** (Likelihood Ratio Positive): sensitivity / (1 - specificity)
- **LR-** (Likelihood Ratio Negative): (1 - sensitivity) / specificity
- **Post-test probability if positive**: Updated probability if test is positive
- **Post-test probability if negative**: Updated probability if test is negative

### Interpretation Guidelines
- **LR+ > 10**: Strong evidence FOR disease when positive
- **LR+ 5-10**: Moderate evidence FOR disease when positive
- **LR+ 2-5**: Weak evidence FOR disease when positive
- **LR+ 1-2**: Minimal change in probability

- **LR- < 0.1**: Strong evidence AGAINST disease when negative
- **LR- 0.1-0.2**: Moderate evidence AGAINST disease when negative
- **LR- 0.2-0.5**: Weak evidence AGAINST disease when negative
- **LR- 0.5-1.0**: Minimal change in probability

### Clinical Decision Making
- **Post-test probability > 80%**: Consider diagnosis confirmed, start treatment
- **Post-test probability 20-80%**: Consider additional testing
- **Post-test probability < 20%**: Consider diagnosis ruled out, explore alternatives

## Sample Data

The demo includes realistic medical scenarios:

### Patient 1: John Doe
- **MRN:** MRN001
- **Age:** 50 years (DOB: 1975-03-15)
- **Gender:** Male
- **Problem:** Chronic fatigue and weakness
- **Clinical Context:** Progressive fatigue over 3 months with 10 lb weight loss

**Differential Diagnoses:**
1. **Hypothyroidism** (35% probability)
   - ICD-10: E03.9
   - Evidence: Moderate
   - Reasoning: Common in middle-aged adults, TSH pending
   
2. **Anemia** (25% probability)
   - ICD-10: D50.9
   - Evidence: Moderate
   - Reasoning: Weight loss and fatigue suggest iron deficiency, CBC pending
   
3. **Depression** (15% probability)
   - ICD-10: F32.9
   - Evidence: Weak
   - Reasoning: Fatigue can be presenting symptom, PHQ-9 needed

### Pivot Library
Pre-loaded diagnostic tests with validated likelihood ratios:

1. **Elevated TSH** (Thyroid Function)
   - Sensitivity: 95%
   - Specificity: 88%
   - LR+: 7.92
   - LR-: 0.06
   - Category: Endocrine

2. **Low Hemoglobin** (Anemia Screening)
   - Sensitivity: 92%
   - Specificity: 85%
   - LR+: 6.13
   - LR-: 0.09
   - Category: Hematology

## Local Development

### Backend Setup
```bash
cd backend
pnpm install
pnpm migrate     # Run database migrations
pnpm seed        # Load sample data
pnpm dev         # Start on port 3000
```

### Frontend Setup
```bash
cd medical-diagnosis-frontend
pnpm install
pnpm dev         # Start on port 5173
pnpm build       # Build for production
```

### Environment Variables
Backend `.env` file:
```
PORT=3000
NODE_ENV=development
DB_TYPE=sqlite
SQLITE_DB_PATH=./data/medical_diagnosis.db
JWT_SECRET=medical-diagnosis-secret-key-2025
JWT_EXPIRES_IN=24h
ALLOWED_ORIGINS=http://localhost:5173
```

## Production Deployment

### Backend Deployment
1. Set environment variables for production
2. Configure PostgreSQL connection (optional)
3. Run migrations: `pnpm migrate`
4. Seed initial data: `pnpm seed`
5. Start server: `pnpm start`

### Frontend Deployment
1. Update API_BASE_URL in `src/services/api.ts`
2. Build: `pnpm build`
3. Deploy `dist/` directory to static hosting
4. Configure CORS on backend for production domain

## Security Considerations

### Current Implementation (Demo)
- Simple SHA-256 hashing for passwords (NOT for production)
- JWT tokens stored in localStorage
- CORS enabled for development origins

### Production Recommendations
- Use bcrypt or argon2 for password hashing
- Implement refresh token rotation
- Store tokens in httpOnly cookies
- Enable rate limiting on authentication endpoints
- Implement account lockout after failed attempts
- Use HTTPS for all connections
- Implement comprehensive audit logging
- Add HIPAA compliance measures for patient data

## Future Enhancements

### Phase 2 Features
- Treatment trial management with stop rules
- Patient diary integration (PWA)
- Timeline visualization with charts
- Bias guardrail checkpoints
- Excel/CSV import/export
- Collaborative diagnosis with team notes

### Phase 3 Features
- Real-time collaboration
- Integration with EHR systems (HL7 FHIR)
- Machine learning for probability estimation
- Clinical decision rules library
- Mobile applications (iOS/Android)
- Telemedicine integration

## Support & Documentation

### Technical Stack Documentation
- React: https://react.dev
- TypeScript: https://www.typescriptlang.org
- Express: https://expressjs.com
- TailwindCSS: https://tailwindcss.com

### Medical Informatics Resources
- Bayesian reasoning in medicine
- Evidence-based medicine principles
- Diagnostic test accuracy measures
- Clinical decision support systems

## License

MIT License - See LICENSE file for details

## Contact

For questions or support, please contact the development team.

---

**Built with MiniMax Agent** - A sophisticated AI-powered development system
