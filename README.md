# Medical Diagnosis Application

A sophisticated web application for operationalizing medical differential diagnosis workflows with Bayesian probability calculations.

## Features

### Backend (Node.js/TypeScript/Express)
- Multi-tenant PostgreSQL/SQLite database with 16 tables
- RESTful API for patient management, problems, hypotheses
- Bayesian probability calculator for diagnostic reasoning
- Treatment trial tracking with metrics
- Timeline visualization of clinical events
- Pivot library with discriminators and likelihood ratios
- Authentication with JWT tokens
- Comprehensive audit logging

### Frontend (React/TypeScript/TailwindCSS)
- Clinician dashboard with patient lists
- Problem-oriented diagnosis interface
- Bayesian calculator for test selection
- Timeline visualization with zoomable charts
- Treatment trial management
- Patient diary logging (PWA-ready)
- Offline capability with IndexedDB

## Getting Started

### Backend

```bash
cd backend
pnpm install
pnpm migrate    # Run database migrations
pnpm seed       # Seed sample data
pnpm dev        # Start development server on port 3000
```

Default credentials:
- Email: dr.smith@clinic.com
- Password: demo123

### Frontend

```bash
cd medical-diagnosis-frontend
pnpm install
pnpm dev        # Start development server on port 5173
```

## API Endpoints

- POST /api/auth/login - User authentication
- POST /api/auth/register - User registration
- GET /api/patients - List patients
- GET /api/patients/:id - Get patient details
- POST /api/patients - Create new patient
- GET /api/problems/patient/:patientId - List patient problems
- POST /api/problems - Create new problem
- POST /api/bayesian/calculate - Calculate post-test probability
- POST /api/bayesian/calculate-both - Calculate both positive/negative outcomes
- POST /api/bayesian/from-sens-spec - Calculate from sensitivity/specificity

## Architecture

- **Database**: In-memory SQLite (demo) / PostgreSQL (production)
- **Backend**: Express with TypeScript
- **Frontend**: React 18 with TypeScript and TailwindCSS
- **Authentication**: JWT tokens
- **State Management**: React Context API
- **Offline Storage**: IndexedDB for PWA support

## Medical Workflows

1. **Patient Intake**: Structured forms with demographics and medical history
2. **Problem-Oriented Diagnosis**: Ranked differential diagnoses with evidence
3. **Bayesian Test Planning**: Calculate pre/post-test probabilities
4. **Treatment Trials**: Track interventions with metrics and stop rules
5. **Timeline Visualization**: Step-changes, sentinel events, and test results
6. **Bias Guardrails**: Pre-commit predictions and disconfirming evidence

## Project Structure

```
workspace/
├── backend/
│   ├── src/
│   │   ├── config/          # Database and app configuration
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Auth and validation
│   │   ├── models/          # Data models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic (Bayesian calculator)
│   │   ├── types/           # TypeScript interfaces
│   │   ├── migrations/      # Database schema
│   │   └── seeds/           # Sample data
│   └── package.json
└── medical-diagnosis-frontend/
    ├── src/
    │   ├── components/      # React components
    │   ├── pages/           # Page components
    │   ├── services/        # API client
    │   ├── hooks/           # Custom React hooks
    │   └── lib/             # Utilities
    └── package.json
```

## Database Schema

- **organizations**: Multi-tenant support
- **users**: Clinicians and staff
- **patients**: Patient demographics
- **encounters**: Clinical visits
- **problems**: Problem list with diagnoses
- **hypotheses**: Differential diagnoses with probabilities
- **facts**: Time-series clinical data
- **timeline_events**: Key clinical events
- **pivots**: Diagnostic test library
- **test_orders**: Ordered tests with Bayesian calculations
- **test_results**: Test results with probability updates
- **treatment_trials**: Treatment interventions
- **trial_metrics**: Treatment outcome tracking
- **bias_guardrails**: Cognitive bias checkpoints
- **patient_diary**: Patient-reported data
- **audit_logs**: Comprehensive audit trail

## License

MIT
