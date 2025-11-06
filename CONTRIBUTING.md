# DiagnosticoX Contributing Guide

Thank you for your interest in contributing to DiagnosticoX! This guide will help you get started.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before contributing.

## How to Contribute

### Reporting Bugs

1. **Check Existing Issues**: Search existing issues to avoid duplicates
2. **Use Bug Template**: Use the bug report template when creating a new issue
3. **Provide Details**: Include:
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Screenshots (if applicable)
   - Browser/environment details
   - Console errors

### Suggesting Features

1. **Check Roadmap**: Review our roadmap to see if the feature is planned
2. **Use Feature Template**: Use the feature request template
3. **Describe Use Case**: Explain the problem and proposed solution
4. **Consider Alternatives**: Discuss alternative approaches

### Pull Requests

1. **Fork the Repository**: Create your own fork
2. **Create a Branch**: Use descriptive branch names
   - `feature/cache-optimization`
   - `fix/symptom-search-bug`
   - `docs/api-reference-update`

3. **Follow Code Standards**:
   - TypeScript strict mode
   - ESLint + Prettier formatting
   - JSDoc comments for all functions
   - Test coverage ≥70%

4. **Commit Messages**: Use conventional commits
   ```
   feat: Add symptom correlation analysis
   fix: Resolve cache eviction bug
   docs: Update API integration guide
   perf: Optimize IndexedDB queries
   test: Add tests for VINDICATE-M service
   ```

5. **Write Tests**: All new features must include tests
6. **Update Documentation**: Update relevant docs
7. **Submit PR**: Fill out the PR template completely

## Development Setup

### Prerequisites

```bash
# Required
Node.js 18+
pnpm 8+

# Optional (for API integration)
WHO ICD-API credentials
DrugBank API key
OpenAI/Anthropic/Google API keys
```

### Installation

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/diagnosticox.git
cd diagnosticox

# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env

# Edit .env with your API keys (optional for development)

# Start development server
pnpm run dev
```

### Development Workflow

```bash
# Create a branch
git checkout -b feature/my-feature

# Make changes and test
pnpm run dev          # Development server
pnpm run test         # Run tests
pnpm run test:watch   # Watch mode
pnpm run lint         # Check linting
pnpm run format       # Format code

# Commit changes
git add .
git commit -m "feat: Add my feature"

# Push to your fork
git push origin feature/my-feature

# Open PR on GitHub
```

## Code Standards

### TypeScript

- Use strict mode
- Prefer interfaces over types for objects
- Use explicit return types for functions
- Avoid `any` type (use `unknown` if needed)

```typescript
// Good
interface User {
  id: string;
  name: string;
  email: string;
}

function getUser(id: string): Promise<User> {
  // implementation
}

// Bad
function getUser(id: any): any {
  // implementation
}
```

### React Components

- Functional components with hooks
- Props interface with JSDoc
- Memoization for expensive computations
- Error boundaries for error handling

```typescript
interface Props {
  /** User ID to display */
  userId: string;
  /** Callback when user is updated */
  onUpdate?: (user: User) => void;
}

const UserProfile: React.FC<Props> = ({ userId, onUpdate }) => {
  // implementation
};
```

### Services

- Default export for singleton services
- Named exports for interfaces/types
- Comprehensive JSDoc comments
- Error handling with try/catch

```typescript
/**
 * Symptom service for medical symptom management
 * 
 * @example
 * ```typescript
 * const symptoms = symptomService.searchSymptoms('chest pain');
 * ```
 */
class SymptomService {
  /**
   * Search symptoms by query
   * 
   * @param query - Search term
   * @returns Array of matching symptoms
   */
  searchSymptoms(query: string): Symptom[] {
    // implementation
  }
}

export default new SymptomService();
```

### Testing

- Test files next to source files: `component.test.tsx`
- Use React Testing Library for components
- Use Jest for unit tests
- Aim for 70%+ coverage

```typescript
import { render, screen } from '@testing-library/react';
import UserProfile from './UserProfile';

describe('UserProfile', () => {
  it('displays user name', () => {
    render(<UserProfile userId="123" />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
```

## Project Structure

```
src/
├── components/        # Reusable UI components
├── pages/            # Route pages
├── services/         # Business logic and API services
├── hooks/            # Custom React hooks
├── types/            # TypeScript type definitions
├── lib/              # Utility functions
└── styles/           # Global styles and themes
```

## Caching System Guidelines

When working with the caching system:

1. **Use Cache Integration**: Always use `cachedAPICall()` wrapper
2. **Choose Correct Category**: Use appropriate `CacheCategory`
3. **Set Proper TTL**: Follow existing TTL standards
4. **Record Patterns**: Enable pattern recording for crawling

```typescript
import { cachedAPICall, CacheCategory } from './cacheIntegration';

// Good
const results = await cachedAPICall(
  `search:${query}`,
  CacheCategory.SYMPTOMS,
  () => fetchSymptoms(query)
);

// Bad - bypasses cache
const results = await fetchSymptoms(query);
```

## Medical Data Standards

- Follow FHIR R4 standards for healthcare data
- Use SNOMED CT codes for clinical terms
- Use LOINC codes for laboratory observations
- Use RxNorm codes for medications
- Use ICD-10/ICD-11 codes for diagnoses

## Performance Guidelines

- Keep bundle chunks under 500KB
- Use code splitting for large components
- Lazy load routes
- Memoize expensive computations
- Use React.memo for pure components

## Accessibility Requirements

- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation support
- Color contrast ≥4.5:1
- Screen reader compatible

## Documentation

All new features must include:

1. **Code Comments**: JSDoc for all public functions
2. **README Updates**: If adding major features
3. **API Docs**: For new services or endpoints
4. **Examples**: Usage examples in comments

## Review Process

1. **Automated Checks**: CI/CD runs tests, linting, type checking
2. **Code Review**: Maintainers review code quality
3. **Testing**: Verify functionality in development environment
4. **Documentation**: Ensure docs are updated
5. **Approval**: Two approvals required for merge

## Release Process

1. maintainers cut releases from `main` branch
2. Semantic versioning (MAJOR.MINOR.PATCH)
3. Changelog generated from commit messages
4. GitHub releases with release notes

## Getting Help

- **Questions**: Open a discussion on GitHub
- **Bugs**: Create an issue with bug template
- **Features**: Create an issue with feature template
- **Security**: Email security concerns (do not open public issue)

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Credited in release notes
- Acknowledged in documentation

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to DiagnosticoX!
