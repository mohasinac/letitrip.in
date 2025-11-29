# Epic E030: Code Quality & SonarCloud Integration

## ⚠️ MANDATORY: Follow Project Standards

Before implementing, read **[AI Agent Development Guide](/docs/ai/AI-AGENT-GUIDE.md)**

**Key Requirements:**

- Services call APIs via `apiService`, NEVER access database directly
- Use `COLLECTIONS` constant from `src/constants/database.ts`
- No `any` types - explicit TypeScript everywhere

---

## Overview

Integrate SonarCloud for continuous code quality analysis to identify code duplication, complexity issues, security vulnerabilities, and code smells. Based on SonarCloud reports, create actionable tasks to improve code quality and reduce technical debt.

## Current Status (November 29, 2025)

### SonarCloud Dashboard Summary

| Metric                         | Current Value       | Target | Status                            |
| ------------------------------ | ------------------- | ------ | --------------------------------- |
| **Quality Gate**               | ❌ Failed           | Passed | 3 failed conditions               |
| **Lines of Code**              | 21k                 | -      | TypeScript, JavaScript, CSS, YAML |
| **Issues**                     | 2.5k (+126 new)     | < 100  | ❌ Needs reduction                |
| **Reliability Rating**         | B                   | A      | ❌ Bugs need fixing               |
| **Security Hotspots Reviewed** | 0%                  | 100%   | ❌ Review required                |
| **Duplicated Lines**           | 39.55%              | ≤ 3%   | ❌ Major duplication              |
| **Test Coverage**              | 0% (not configured) | > 80%  | ⚠️ Coverage report needed         |

### Quality Gate Failed Conditions

1. **Reliability Rating on New Code**: B (Required: A)
2. **Security Hotspots Reviewed on New Code**: 0% (Required: 100%)
3. **Duplicated Lines (%) on New Code**: 39.55% (Reduce to ≤ 3.0%)

---

## Scope

- ✅ Set up SonarCloud (completed)
- ✅ Configure rules for Next.js/TypeScript/React (completed)
- 🔲 Identify and fix code duplications (39.55% → ≤3%)
- 🔲 Fix reliability issues (Rating B → A)
- 🔲 Review security hotspots (0% → 100%)
- 🔲 Configure coverage reporting
- 🔲 Establish quality gates
- 🔲 Create remediation plan for 2.5k issues

## SonarCloud Configuration

### Current Configuration

```properties
# sonar-project.properties
sonar.projectKey=mohasinac_letitrip.in
sonar.organization=mohasin-ac
sonar.projectName=letitrip.in
sonar.projectVersion=1.0.0

sonar.sources=src
sonar.tests=src
sonar.test.inclusions=**/*.test.ts,**/*.test.tsx,**/tests/**/*
sonar.exclusions=**/node_modules/**,**/*.test.ts,**/*.test.tsx,**/tests/**/*,**/__mocks__/**,**/coverage/**,.next/**,public/**,scripts/**

sonar.javascript.lcov.reportPaths=coverage/lcov.info
sonar.typescript.lcov.reportPaths=coverage/lcov.info
sonar.sourceEncoding=UTF-8
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

### F030.1: SonarCloud Setup

**Priority**: P0 (Critical)  
**Status**: ✅ Completed

Set up SonarCloud for the project.

#### Tasks

| Task                            | Description                        | Status  |
| ------------------------------- | ---------------------------------- | ------- |
| Install SonarQube scanner       | npm package sonarqube-scanner      | ✅ Done |
| Create sonar-project.properties | Configuration file                 | ✅ Done |
| Configure TypeScript analysis   | Enable TS/TSX analysis             | ✅ Done |
| Set up quality profile          | Using Sonar way profile            | ✅ Done |
| Configure exclusions            | Exclude test files, generated code | ✅ Done |
| Integrate with GitHub Actions   | .github/workflows/sonar.yml        | ✅ Done |
| Set up quality gates            | Define pass/fail criteria          | ✅ Done |
| Add npm script                  | `npm run sonar`                    | ✅ Done |

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

### F030.2: Code Duplication Reduction

**Priority**: P0 (Critical)  
**Status**: 🔴 Critical - 39.55% duplication (Target: ≤3%)

Identify and reduce code duplication - this is the biggest issue.

#### Current Duplication Analysis

| Area               | Expected Duplications                | Action                 | Priority |
| ------------------ | ------------------------------------ | ---------------------- | -------- |
| API Route Handlers | Similar CRUD patterns                | Create base handler    | P0       |
| Form Components    | Similar validation, state management | Create FormBuilder     | P1       |
| Filter Components  | Similar filter sections              | Already in E025        | ✅       |
| Card Components    | Similar card layouts                 | Create CardBase        | P1       |
| Table Components   | Similar table/list patterns          | Create TableBase       | P1       |
| Modal Components   | Similar modal structures             | Create ModalBase       | P1       |
| Pagination Logic   | Repeated in many pages               | E026 addresses this    | ✅       |
| Auth Checks        | Repeated session checks              | Create auth middleware | P0       |
| Error Handling     | Repeated try/catch patterns          | Create error wrapper   | P1       |
| Loading States     | Repeated loading logic               | Create loading hook    | P2       |

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

### Phase 1: Setup (Week 1) ✅ COMPLETED

- [x] Create sonar-project.properties
- [x] Run first analysis
- [x] Configure quality gates
- [x] Set up GitHub Actions integration
- [x] Create npm scripts (`npm run sonar`)

### Phase 2: Initial Analysis (Week 1) ✅ COMPLETED

- [x] Run full analysis (21k lines analyzed)
- [x] Identify duplication (39.55%)
- [x] Identify issues (2.5k)
- [x] Identify quality gate failures (3)
- [x] Document findings in this epic

### Phase 3: Prioritization (Week 2) 🔲 IN PROGRESS

- [ ] Review 2.5k issues in SonarCloud
- [ ] Review security hotspots
- [ ] Categorize issues by severity
- [ ] Create sprint backlog for top issues
- [ ] Assign owners

### Phase 4: Remediation - Duplication (Weeks 2-4) 🔲 TODO

- [ ] Create API handler factory to reduce route duplication
- [ ] Create base components (CardBase, TableBase, ModalBase)
- [ ] Consolidate auth middleware
- [ ] Extract common form patterns
- [ ] Target: Reduce from 39.55% to <10%

### Phase 5: Remediation - Reliability (Week 3) 🔲 TODO

- [ ] Fix bugs causing Reliability Rating B
- [ ] Target: Achieve Rating A

### Phase 6: Security Review (Week 3) 🔲 TODO

- [ ] Review all security hotspots
- [ ] Mark as safe or fix issues
- [ ] Target: 100% reviewed

### Phase 7: Coverage Integration (Week 2) 🔲 TODO

- [ ] Ensure coverage reports upload correctly
- [ ] Target: >80% coverage displayed

### Phase 8: Ongoing (Continuous)

- [ ] Run analysis on every PR (via GitHub Actions)
- [ ] Track metrics over time
- [ ] Regular quality reviews
- [ ] Block PRs that fail quality gate

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

- [x] SonarCloud configured and running
- [x] Analysis runs on every PR (GitHub Actions)
- [ ] Quality gate passes (currently failing)
- [ ] Duplication < 5% (currently 39.55%)
- [ ] No blocker or critical issues
- [ ] Test coverage > 80% (need to configure upload)
- [ ] All security hotspots reviewed (currently 0%)
- [ ] Reliability Rating A (currently B)
- [ ] Metrics tracked over time

---

## Quick Commands

```bash
# Run tests with coverage
npm test -- --ci --coverage --coverageReporters=lcov --forceExit

# Run SonarCloud analysis locally
$env:SONAR_TOKEN = 'your-token'
npm run sonar

# Or combined
npm test -- --ci --coverage --coverageReporters=lcov --forceExit; npm run sonar
```

---

## Dependencies

- ✅ sonarqube-scanner npm package
- ✅ GitHub Actions for CI
- ✅ Jest coverage setup

## Related Epics

- E019: Common Code Architecture (for reducing duplication)
- E025: Mobile Component Integration
- E026: Sieve Pagination

---

## SonarCloud Links

- **Dashboard**: https://sonarcloud.io/dashboard?id=mohasinac_letitrip.in
- **Issues**: https://sonarcloud.io/project/issues?id=mohasinac_letitrip.in
- **Security Hotspots**: https://sonarcloud.io/project/security_hotspots?id=mohasinac_letitrip.in
- **Duplications**: https://sonarcloud.io/component_measures?id=mohasinac_letitrip.in&metric=duplicated_lines_density
