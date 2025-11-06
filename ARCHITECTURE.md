# DiagnosticoX Architecture

## System Overview

DiagnosticoX is a modern, production-grade medical diagnosis platform built with React 18, TypeScript, and Vite. The architecture follows a modular, service-oriented design with intelligent caching and pre-emptive data fetching capabilities.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Browser                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐   │
│  │ React UI     │  │ Service      │  │ Cache System        │   │
│  │ Components   │──│ Layer        │──│ - Memory Cache      │   │
│  │ (Pages)      │  │ (API calls)  │  │ - IndexedDB         │   │
│  └──────────────┘  └──────────────┘  │ - Service Worker    │   │
│                                       └─────────────────────┘   │
│         │                  │                     │               │
│         │                  │                     │               │
│         ▼                  ▼                     ▼               │
│  ┌──────────────────────────────────────────────────────┐      │
│  │         Pre-emptive Crawler Service                   │      │
│  │  - Background data fetching                          │      │
│  │  - Pattern analysis                                  │      │
│  │  - Priority queue                                    │      │
│  └──────────────────────────────────────────────────────┘      │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS/TLS
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    External APIs                                 │
├─────────────────────────────────────────────────────────────────┤
│  WHO ICD-API │ PubMed │ ClinicalTrials.gov │ DrugBank │ AI APIs│
└─────────────────────────────────────────────────────────────────┘
```

## Layer Architecture

### 1. Presentation Layer (UI Components)

#### Pages (`src/pages/`)
- **Clinical Tools**: ICDLookupPage, DSM5AssessmentsPage, SymptomCheckerPage, VindicatemDiagnosisPage, FHIRInteroperabilityPage
- **Analytics**: AnalyticsDashboard, PatientOutcomesTracker, TreatmentEfficacyCenter, PopulationHealthMonitor
- **Security**: SecurityCenterHub, MultiFactorAuth, RolePermissionsManager, AdminPanel
- **Settings**: FeatureManagementPage, AIProviderSettings, AdaptiveManagementPage, CacheMetricsDashboard
- **PWA Features**: NotificationsCenter, RealtimeMonitoringPage, VoiceAssistantPage

#### Components (`src/components/`)
- **UI Library**: Shadcn/ui components (Badge, Card, Button, etc.)
- **Medical Components**: AIDiagnosisPanel, ClinicalDecisionSupport, TimelineVisualization
- **Feature Components**: UsageModeSwitcher, ErrorBoundary

### 2. Business Logic Layer (Services)

#### Core Medical Services
```typescript
src/services/
├── icdService.ts              # WHO ICD-API integration
├── dsm5Service.ts             # Psychiatric assessments
├── symptomService.ts          # Symptom database
├── vindicatemService.ts       # VINDICATE-M framework
├── fhirService.ts             # FHIR R4 resources
├── pubmedService.ts           # PubMed literature
├── clinicalTrialsService.ts   # Clinical trials data
├── drugBankService.ts         # Drug information
└── aiProviderService.ts       # Multi-provider AI
```

#### Caching Infrastructure
```typescript
src/services/
├── cacheService.ts           # Multi-layer cache manager
├── crawlerService.ts         # Pre-emptive crawler
├── cacheIntegration.ts       # Transparent caching wrapper
└── expandedSymptomDatabase.ts # 2000+ symptom taxonomy
```

#### Supporting Services
```typescript
src/services/
├── apiService.ts             # HTTP client
├── offlineStorage.ts         # IndexedDB operations
├── featureManager.ts         # Feature toggles
├── analyticsService.ts       # Analytics data
└── securityAPI.ts            # Security operations
```

### 3. Data Persistence Layer

#### Three-Tier Cache System

**Tier 1: Memory Cache**
- **Purpose**: Ultra-fast access for hot data
- **Technology**: JavaScript Map
- **Capacity**: 100 entries (LRU eviction)
- **Speed**: <1ms access time
- **Lifespan**: Session-based

**Tier 2: IndexedDB Cache**
- **Purpose**: Persistent storage for large datasets
- **Technology**: IndexedDB (idb wrapper)
- **Capacity**: ~50-100 MB (browser dependent)
- **Speed**: 5-20ms access time
- **Lifespan**: Persistent across sessions

**Tier 3: Service Worker Cache**
- **Purpose**: Offline capability and static assets
- **Technology**: Cache API
- **Capacity**: Browser managed
- **Speed**: Network-dependent
- **Lifespan**: Controlled by service worker

#### TTL Strategy

| Category | TTL | Rationale |
|----------|-----|-----------|
| ICD Codes | 30 days | Rarely change, large dataset |
| Symptoms | 7 days | Relatively stable |
| PubMed | 24 hours | Frequently updated |
| Drug Interactions | 48 hours | Moderate update frequency |
| Clinical Trials | 12 hours | Rapidly changing |
| DSM-5 | 7 days | Stable assessment tools |
| FHIR | 24 hours | Session-based data |

### 4. Background Processing

#### Pre-emptive Crawler

**Purpose**: Predictive data fetching to reduce perceived latency

**Components**:
```typescript
class CrawlerService {
  - taskQueue: CrawlTask[]      // Priority queue
  - maxConcurrent: 2             // Parallel tasks limit
  - searchHistory: SearchPattern[] // User pattern tracking
  - commonQueries: string[]      // Pre-defined common searches
}
```

**Priority Levels**:
- **HIGH**: ICD lookups, DSM assessments, common symptoms (18 queries)
- **MEDIUM**: PubMed articles, drug interactions (5-10 queries)
- **LOW**: Historical searches, rare conditions (user-driven)

**Workflow**:
1. Auto-start 2 seconds after app load
2. Schedule 20-30 common medical queries
3. Analyze user search patterns
4. Predict and queue related searches
5. Process queue with 2 concurrent workers
6. Retry failed tasks (3 attempts max)

### 5. State Management

#### Approach: React Hooks + Context

**No global state library** (Redux, MobX) for simplicity

**State Organization**:
```typescript
// Local component state
const [data, setData] = useState<Data[]>([]);

// Cross-component state
const UserContext = React.createContext<User | null>(null);

// Cached API state (handled by cacheIntegration)
const results = await cachedAPICall(key, category, fetcher);
```

### 6. Routing Architecture

**Client-Side Routing** with React Router v6

**Route Structure**:
```
/                          → Dashboard (authenticated)
/login                     → Login page
/clinical/*                → Clinical tools (ICD, DSM-5, Symptoms, etc.)
/analytics/*               → Analytics dashboards
/security/*                → Security management
/settings/*                → Settings and configuration
/research                  → Medical research hub
```

**Route Guards**:
```typescript
<Route
  path="/clinical/symptom-checker"
  element={
    user ? <SymptomCheckerPage /> : <Navigate to="/login" />
  }
/>
```

### 7. Build & Optimization

#### Code Splitting Strategy

**Vendor Chunks**:
- `react-vendor.js` (957 KB): React, React-DOM
- `router-vendor.js`: React Router
- `radix-vendor.js`: Radix UI components
- `charts-vendor.js` (12 KB): Charting libraries
- `icons-vendor.js`: Lucide icons

**Feature Chunks**:
- `clinical-services.js` (30 KB): ICD, DSM-5, Symptoms
- `research-services.js` (32 KB): PubMed, Trials, DrugBank
- `ai-services.js` (17 KB): AI provider integration
- `clinical-pages.js` (187 KB): Clinical UI pages
- `analytics-pages.js` (292 KB): Analytics dashboards
- `security-pages.js` (351 KB): Security features

**Total Bundle**: 4.5 MB (optimized)

#### Optimization Techniques

**Vite Configuration**:
```typescript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'react-vendor': ['react', 'react-dom'],
        'clinical-services': ['./src/services/icdService', ...],
        // ... 12 total chunks
      }
    }
  },
  minify: 'terser',
  terserOptions: {
    compress: { drop_console: true }
  }
}
```

**Tree Shaking**: Remove unused code
**Terser Minification**: Aggressive compression
**Gzip/Brotli**: Server-side compression ready
**Lazy Loading**: Route-based code splitting

### 8. Performance Monitoring

#### Cache Metrics Dashboard

**Real-Time Metrics**:
- Hit Rate: (Hits / Total Requests) × 100
- Memory Hit Rate: (Memory Hits / Memory Requests) × 100
- Storage Usage: Used / Quota
- Crawler Queue Size: Pending tasks
- Active Tasks: Concurrent operations

**Performance Targets**:
- Cache Hit Rate: >70%
- Memory Hit Rate: >85%
- Cached Response Time: <10ms
- API Reduction: 70%+

#### Browser APIs Used

**Storage Estimation**:
```typescript
const estimate = await navigator.storage.estimate();
const usage = estimate.usage || 0;
const quota = estimate.quota || 0;
```

**Service Worker Registration**:
```typescript
navigator.serviceWorker.register('/service-worker.js')
```

**IndexedDB**:
```typescript
const db = await openDB('diagnosticox-cache', 1, {
  upgrade(db) {
    const store = db.createObjectStore('cache', { keyPath: 'key' });
    store.createIndex('by-category', 'category');
  }
});
```

### 9. Security Architecture

#### Authentication Flow

```
1. User Login → API Auth
2. Store JWT Token → localStorage
3. Inject Token → All API Requests
4. Token Validation → Per Request
5. Token Expiry → Logout & Redirect
```

#### RBAC Implementation

**8 Roles**:
1. Super Admin (full access)
2. Organization Admin
3. Department Manager
4. Physician
5. Nurse Practitioner
6. Nurse
7. Medical Assistant
8. Billing Specialist

**25+ Permissions** across 5 categories:
- Patient Management (4)
- Clinical Operations (6)
- Administrative (5)
- Financial (4)
- Reporting & Analytics (3)

#### Data Protection

**In Transit**: HTTPS/TLS 1.3
**At Rest**: Browser storage (not encrypted by default)
**Sensitive Data**: Should use client-side encryption
**API Keys**: Environment variables (.env)

### 10. Medical Standards Compliance

#### HL7 FHIR R4

**Supported Resources**:
- Patient
- Observation
- Condition
- MedicationRequest
- DiagnosticReport
- Bundle

**Coding Systems**:
- **SNOMED CT**: Clinical terms
- **LOINC**: Lab observations
- **RxNorm**: Medications
- **ICD-10**: Diagnoses

#### WHO ICD Classification

**Integration**: OAuth 2.0 with WHO ICD-API
**Versions**: ICD-10, ICD-11
**Features**: Entity search, code lookup, post-coordination

#### DSM-5-TR

**Assessments**: PHQ-9, GAD-7, PC-PTSD-5
**Standards**: APA psychiatric diagnostic criteria
**Scoring**: Automated severity classification

### 11. Deployment Architecture

#### Production Environment

**Build Process**:
```bash
pnpm install --frozen-lockfile
pnpm run build:prod
# → dist/ folder (static files)
```

**Hosting Options**:
- Static hosting (Netlify, Vercel, GitHub Pages)
- CDN distribution (CloudFront, Cloudflare)
- Container deployment (Docker)
- Traditional web servers (Nginx, Apache)

**Environment Variables**:
```env
VITE_ICD_CLIENT_ID=...
VITE_ICD_CLIENT_SECRET=...
VITE_DRUGBANK_API_KEY=...
VITE_OPENAI_API_KEY=...
# ... 37 total environment variables
```

#### CI/CD Pipeline

**GitHub Actions Workflow**:
1. Code Quality (ESLint, Prettier, TypeScript)
2. Tests (Unit, Integration, Coverage)
3. Build (Production bundle)
4. Security (npm audit, Snyk)
5. Accessibility (WCAG 2.1 AA)
6. Deploy (Staging/Production)

### 12. Scalability Considerations

#### Frontend Scalability

**CDN Distribution**: Static assets served from edge locations
**Code Splitting**: Lazy load features on demand
**Cache Strategy**: Reduce API calls by 70%+
**Service Worker**: Offline capability

#### API Rate Limiting

**Crawler Concurrency**: Limited to 2 parallel tasks
**Request Delays**: 1 second between fetches
**Retry Logic**: Exponential backoff
**Respect API Limits**: PubMed (3-10 req/s), WHO ICD (OAuth token)

### 13. Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|----------|
| **UI** | React 18 | Component framework |
| **Language** | TypeScript | Type safety |
| **Build** | Vite | Fast build tool |
| **Routing** | React Router v6 | Client-side routing |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **State** | React Hooks | Local state management |
| **HTTP** | Axios | API client |
| **Cache** | IndexedDB (idb) | Persistent storage |
| **PWA** | Service Worker | Offline support |
| **Icons** | Lucide React | SVG icons |
| **Charts** | Recharts | Data visualization |
| **Forms** | React Hook Form | Form management |
| **Validation** | Zod | Schema validation |
| **Testing** | Jest + RTL | Unit/integration tests |
| **Linting** | ESLint | Code quality |
| **Formatting** | Prettier | Code formatting |

### 14. Future Architecture Enhancements

**Planned Improvements**:
- **SharedWorker**: Cross-tab cache sharing
- **Web Workers**: CPU-intensive computations
- **WebRTC**: Real-time collaboration
- **GraphQL**: Efficient data querying
- **Server-Side Rendering**: SEO optimization
- **Edge Functions**: Serverless API layer
- **Machine Learning**: On-device ML models
- **WebAssembly**: Performance-critical code

---

## Architecture Principles

1. **Modular Design**: Loosely coupled components
2. **Service-Oriented**: Independent service modules
3. **Separation of Concerns**: Clear layer boundaries
4. **Performance First**: Optimize for speed
5. **Offline Capability**: PWA standards
6. **Medical Standards**: FHIR, ICD, SNOMED compliance
7. **Security by Design**: Privacy and data protection
8. **Scalability**: Handle growing feature set
9. **Maintainability**: Clean, documented code
10. **Accessibility**: WCAG 2.1 AA compliance

---

For questions about architecture decisions, see [CONTRIBUTING.md](CONTRIBUTING.md)