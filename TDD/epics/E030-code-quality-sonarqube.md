# Epic E030: Code Quality & SonarQube Integration

## Overview

Integrate SonarQube for continuous code quality analysis to identify code duplication, complexity issues, security vulnerabilities, and code smells. Based on SonarQube reports, create actionable tasks to improve code quality and reduce technical debt.

## Scope

- Set up SonarQube locally and/or in CI/CD
- Configure rules for Next.js/TypeScript/React
- Identify and fix code duplications
- Reduce code complexity
- Fix security vulnerabilities
- Establish quality gates
- Create remediation plan for issues

## SonarQube Configuration

### Quality Profile Settings

```yaml
# sonar-project.properties
sonar.projectKey=justforview
sonar.projectName=JustForView.in
sonar.projectVersion=1.0

sonar.sources=src
sonar.tests=src
sonar.test.inclusions=**/*.test.ts,**/*.test.tsx
sonar.exclusions=**/node_modules/**,**/*.test.ts,**/*.test.tsx,**/coverage/**

sonar.typescript.lcov.reportPaths=coverage/lcov.info
sonar.javascript.lcov.reportPaths=coverage/lcov.info

sonar.typescript.tsconfigPath=tsconfig.json

# Duplication detection
sonar.cpd.exclusions=**/types/**,**/constants/**
sonar.cpd.typescript.minimumTokens=50
sonar.cpd.typescript.minimumLines=10
```

### Quality Gates

| Metric               | Threshold | Action if Failed |
| -------------------- | --------- | ---------------- |
| Bugs                 | 0         | Block deployment |
| Vulnerabilities      | 0         | Block deployment |
| Code Smells          | < 100     | Warning          |
| Coverage             | > 70%     | Warning          |
| Duplicated Lines     | < 5%      | Warning          |
| Technical Debt Ratio | < 5%      | Warning          |
| Blocker Issues       | 0         | Block deployment |
| Critical Issues      | 0         | Block deployment |

---

## Features

### F030.1: SonarQube Setup

**Priority**: P0 (Critical)

Set up SonarQube for the project.

#### Tasks

| Task                            | Description                        | Status  |
| ------------------------------- | ---------------------------------- | ------- |
| Install SonarQube locally       | Docker-based local instance        | 🔲 Todo |
| Create sonar-project.properties | Configuration file                 | 🔲 Todo |
| Configure TypeScript analysis   | Enable TS/TSX analysis             | 🔲 Todo |
| Set up quality profile          | Custom rules for React/Next.js     | 🔲 Todo |
| Configure exclusions            | Exclude test files, generated code | 🔲 Todo |
| Integrate with GitHub Actions   | Run on PR and main branch          | 🔲 Todo |
| Set up quality gates            | Define pass/fail criteria          | 🔲 Todo |

#### User Stories

**US030.1.1**: Local SonarQube Analysis

```
As a developer
I want to run SonarQube analysis locally
So that I can check code quality before committing

Acceptance Criteria:
- docker-compose for SonarQube
- npm script to run analysis
- Results viewable in browser
- Works on Windows/Mac/Linux
```

**US030.1.2**: CI/CD Integration

```
As a team
I want SonarQube in our CI/CD pipeline
So that PRs are checked automatically

Acceptance Criteria:
- Runs on every PR
- Reports results back to PR
- Blocks merge if quality gate fails
- Shows detailed report link
```

---

### F030.2: Code Duplication Detection

**Priority**: P0 (Critical)

Identify and reduce code duplication.

#### Common Duplication Patterns

| Area               | Expected Duplications                | Action                 |
| ------------------ | ------------------------------------ | ---------------------- |
| API Route Handlers | Similar CRUD patterns                | Create base handler    |
| Form Components    | Similar validation, state management | Create FormBuilder     |
| Filter Components  | Similar filter sections              | Already in E025        |
| Card Components    | Similar card layouts                 | Create CardBase        |
| Table Components   | Similar table/list patterns          | Create TableBase       |
| Modal Components   | Similar modal structures             | Create ModalBase       |
| Pagination Logic   | Repeated in many pages               | E026 addresses this    |
| Auth Checks        | Repeated session checks              | Create auth middleware |
| Error Handling     | Repeated try/catch patterns          | Create error wrapper   |
| Loading States     | Repeated loading logic               | Create loading hook    |

#### User Stories

**US030.2.1**: Duplication Report

```
As a developer
I want to see where code is duplicated
So that I can refactor it

Acceptance Criteria:
- Report shows duplicate blocks
- Shows percentage of duplication
- Links to both locations
- Grouped by file/module
- Sortable by size/severity
```

**US030.2.2**: Refactor Plan

```
As a team
I want a plan to reduce duplication
So that we can prioritize refactoring

Acceptance Criteria:
- List duplications > 20 lines
- Propose extraction strategies
- Estimate effort for each
- Priority based on impact
```

---

### F030.3: Code Complexity Analysis

**Priority**: P1 (High)

Identify overly complex code.

#### Complexity Metrics

| Metric                  | Threshold | Action               |
| ----------------------- | --------- | -------------------- |
| Cyclomatic Complexity   | < 10      | Refactor if exceeded |
| Cognitive Complexity    | < 15      | Refactor if exceeded |
| Function Lines          | < 50      | Split if exceeded    |
| File Lines              | < 400     | Split if exceeded    |
| Nesting Depth           | < 4       | Refactor if exceeded |
| Parameters per Function | < 5       | Use options object   |

#### User Stories

**US030.3.1**: Complexity Report

```
As a developer
I want to see complex functions
So that I can simplify them

Acceptance Criteria:
- Lists functions by complexity score
- Shows cyclomatic and cognitive complexity
- Highlights hotspots
- Suggests refactoring strategies
```

---

### F030.4: Security Vulnerability Detection

**Priority**: P0 (Critical)

Identify security issues in code.

#### Security Rules

| Category            | Examples                               |
| ------------------- | -------------------------------------- |
| SQL Injection       | N/A (Firestore, but check raw queries) |
| XSS                 | dangerouslySetInnerHTML usage          |
| Secrets             | Hardcoded API keys, passwords          |
| Insecure Randomness | Math.random() for security             |
| Path Traversal      | File path manipulation                 |
| CORS Issues         | Overly permissive CORS                 |
| Cookie Security     | Missing HttpOnly, Secure flags         |
| Auth Bypass         | Missing auth checks                    |

---

### F030.5: Code Smell Detection

**Priority**: P1 (High)

Identify and fix code smells.

#### Common Code Smells

| Smell           | Description                               | Fix                      |
| --------------- | ----------------------------------------- | ------------------------ |
| Long Functions  | Functions > 50 lines                      | Extract functions        |
| Large Classes   | Components > 300 lines                    | Split into smaller units |
| Dead Code       | Unused imports, variables, functions      | Remove or enable eslint  |
| Magic Numbers   | Hardcoded numbers without context         | Use named constants      |
| Magic Strings   | Hardcoded strings (colors, URLs)          | Use constants/config     |
| God Objects     | Objects that do too much                  | Single responsibility    |
| Feature Envy    | Accessing other object's data too much    | Move method              |
| Shotgun Surgery | Change requires many file edits           | Better encapsulation     |
| Comments        | Excessive comments (code should be clear) | Refactor for clarity     |

---

### F030.6: Test Coverage Analysis

**Priority**: P1 (High)

Analyze and improve test coverage.

#### Coverage Targets

| Category   | Current | Target |
| ---------- | ------- | ------ |
| Overall    | ~75%    | > 80%  |
| API Routes | ~85%    | > 90%  |
| Components | ~70%    | > 80%  |
| Hooks      | ~80%    | > 85%  |
| Services   | ~85%    | > 90%  |
| Utilities  | ~90%    | > 95%  |

---

## Implementation Checklist

### Phase 1: Setup (Week 1)

- [ ] Create docker-compose.yml for SonarQube
- [ ] Create sonar-project.properties
- [ ] Run first analysis
- [ ] Configure quality gates
- [ ] Set up GitHub Actions integration
- [ ] Create npm scripts

### Phase 2: Initial Analysis (Week 1)

- [ ] Run full analysis
- [ ] Export duplication report
- [ ] Export complexity report
- [ ] Export security report
- [ ] Export code smells report
- [ ] Document findings

### Phase 3: Prioritization (Week 2)

- [ ] Create issue tracking for findings
- [ ] Prioritize by severity
- [ ] Estimate effort
- [ ] Create sprint backlog
- [ ] Assign owners

### Phase 4: Remediation Planning (Week 2)

- [ ] Group related issues
- [ ] Create refactoring tasks
- [ ] Define acceptance criteria
- [ ] Schedule implementation
- [ ] Create tracking dashboard

### Phase 5: Ongoing (Continuous)

- [ ] Run analysis on every PR
- [ ] Track metrics over time
- [ ] Regular quality reviews
- [ ] Update quality gates as needed

---

## Expected Findings & Solutions

### Duplication Remediation

| Finding                    | Solution                          | Epic |
| -------------------------- | --------------------------------- | ---- |
| Repeated CRUD API handlers | Create `createApiHandler` factory | E019 |
| Similar form validation    | Create `useFormValidation` hook   | E019 |
| Repeated filter sections   | MobileFilterSections (E025)       | E025 |
| Similar card layouts       | Create `CardBase` component       | E019 |
| Repeated pagination logic  | Sieve pagination (E026)           | E026 |
| Similar modal structures   | Create `ModalBase` component      | E019 |
| Repeated loading states    | Create `useLoadingState` hook     | E019 |
| Repeated auth checks       | Create auth middleware            | E019 |

### Complexity Remediation

| Finding                    | Solution                             |
| -------------------------- | ------------------------------------ |
| Complex form components    | Split into smaller sub-components    |
| Large page components      | Extract sections into components     |
| Complex utility functions  | Split and add unit tests             |
| Deeply nested conditionals | Use early returns, extract functions |

### Security Remediation

| Finding                       | Solution                             |
| ----------------------------- | ------------------------------------ |
| Environment variable exposure | Review .env handling                 |
| Missing input sanitization    | Add validation layers                |
| Insecure cookie settings      | Configure HttpOnly, Secure, SameSite |
| Missing rate limiting         | Add rate limiting middleware         |

---

## Scripts

### docker-compose.yml

```yaml
version: "3"
services:
  sonarqube:
    image: sonarqube:community
    depends_on:
      - db
    ports:
      - "9000:9000"
    environment:
      SONAR_JDBC_URL: jdbc:postgresql://db:5432/sonar
      SONAR_JDBC_USERNAME: sonar
      SONAR_JDBC_PASSWORD: sonar
    volumes:
      - sonarqube_data:/opt/sonarqube/data
      - sonarqube_extensions:/opt/sonarqube/extensions
      - sonarqube_logs:/opt/sonarqube/logs

  db:
    image: postgres:12
    environment:
      POSTGRES_USER: sonar
      POSTGRES_PASSWORD: sonar
    volumes:
      - postgresql:/var/lib/postgresql
      - postgresql_data:/var/lib/postgresql/data

volumes:
  sonarqube_data:
  sonarqube_extensions:
  sonarqube_logs:
  postgresql:
  postgresql_data:
```

### package.json scripts

```json
{
  "scripts": {
    "sonar:start": "docker-compose -f sonarqube/docker-compose.yml up -d",
    "sonar:stop": "docker-compose -f sonarqube/docker-compose.yml down",
    "sonar:analyze": "sonar-scanner",
    "sonar:check": "npm run test:coverage && npm run sonar:analyze"
  }
}
```

### GitHub Actions

```yaml
# .github/workflows/sonar.yml
name: SonarQube Analysis

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  sonarqube:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Install dependencies
        run: npm ci

      - name: Run tests with coverage
        run: npm run test:coverage

      - name: SonarQube Scan
        uses: SonarSource/sonarqube-scan-action@master
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
          SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
```

---

## Acceptance Criteria

- [ ] SonarQube runs locally via Docker
- [ ] Analysis runs on every PR
- [ ] Quality gate blocks failing PRs
- [ ] Duplication < 5%
- [ ] No blocker or critical issues
- [ ] Test coverage > 80%
- [ ] All security vulnerabilities addressed
- [ ] Metrics tracked over time

---

## Dependencies

- Docker for local SonarQube
- GitHub Actions for CI
- Test coverage setup (Jest)

## Related Epics

- E019: Common Code Architecture
- E025: Mobile Component Integration
- E026: Sieve Pagination

---

## Test Documentation

**Analysis Results**: `TDD/resources/quality/SONAR-REPORT.md`
