# 🎯 Audit Compliance Checklist - Use Before Every Task

## Pre-Development (Check First)

### 1. ♻️ Code Reusability - DON'T REINVENT

- [ ] Searched `src/components/` for existing UI components
- [ ] Checked `src/hooks/` for existing React hooks
- [ ] Reviewed `src/constants/` for existing constants
- [ ] Looked at `src/repositories/` for data access patterns
- [ ] Checked `src/db/schema/` for type utilities & query helpers
- [ ] Verified `src/lib/` for existing utilities

**Rule**: Extend existing code, don't duplicate.

---

## During Development

### 2. 📋 Constants First - NEVER HARDCODE

- [ ] Using `UI_LABELS` for all UI text
- [ ] Using `UI_PLACEHOLDERS` for form inputs
- [ ] Using `THEME_CONSTANTS` for all styling (spacing, typography, colors)
- [ ] Using `ERROR_MESSAGES` for error text
- [ ] NO hardcoded strings anywhere

**Rule**: If you type a string in quotes, it should be in `src/constants/`.

### 3. 🎨 Styling - Use Theme System

- [ ] Using `themed.*` for basic colors (auto dark mode)
- [ ] Using `colors.*` for semantic colors (badges, alerts)
- [ ] Using `THEME_CONSTANTS.spacing.*` not inline values
- [ ] Extending existing components, not creating new ones
- [ ] NO inline styles except dynamic values

**Rule**: All styling through THEME_CONSTANTS, no magic values.

### 4. ✅ TypeScript - Zero Tolerance

- [ ] Running `npx tsc --noEmit` on changed files
- [ ] Fixed ALL type errors before proceeding
- [ ] Using type utilities from schemas (CreateInput, UpdateInput)
- [ ] No `any` types without justification

**Rule**: 0 errors always. Check types before committing.

### 5. 🗄️ Firebase Schema - Keep in Sync

- [ ] Updated `INDEXED_FIELDS` in schema file with purpose comments
- [ ] Updated `firestore.indexes.json` with composite indices
- [ ] Deployed indices: `firebase deploy --only firestore:indexes`
- [ ] Documented relationships with diagrams
- [ ] Created type utilities (CreateInput, UpdateInput)
- [ ] Created query helpers for common queries

**Rule**: Schema files and firestore.indexes.json must stay synchronized.

### 6. 🚨 Error Handling - Use Classes

- [ ] Using error classes from `src/lib/errors/`
- [ ] Using `ERROR_CODES` and `ERROR_MESSAGES` constants
- [ ] Using `handleApiError()` in API routes
- [ ] NO raw `throw new Error()` with hardcoded strings

**Rule**: Centralized error handling, typed error codes.

### 7. 🏗️ Design Patterns - Follow Standards

- [ ] Using Repository pattern for data access
- [ ] Using Singleton for services (API client, Firebase)
- [ ] Dependency injection where applicable
- [ ] Following SOLID principles
- [ ] Security: rate limiting + authorization on API routes

**Rule**: Clean architecture, proven patterns, secure by design.

---

## After Development

### 8. 📝 Documentation - Update Living Docs

- [ ] Updated relevant docs in `docs/` folder
- [ ] Added entry to `CHANGELOG.md` (Added/Changed/Fixed sections)
- [ ] NO session-specific docs created (REFACTORING_2026-02-06.md ❌)
- [ ] Extended existing docs, didn't duplicate

**Rule**: Update CHANGELOG.md for every change. No session docs.

### 9. 🧪 Code Quality - SOLID Check

- [ ] Each component has single responsibility
- [ ] Code is loosely coupled, easily testable
- [ ] No global state without justification
- [ ] Pure functions where possible
- [ ] Clear input/output contracts

**Rule**: If it's hard to test, it's poorly designed.

---

## Before Commit

### 10. ✔️ Pre-Commit Audit (Run ALL checks)

```bash
# 1. TypeScript validation
npx tsc --noEmit

# 2. Build check
npm run build

# 3. Run tests
npm test

# 4. Lint check
npm run lint
```

**Full Checklist**:

- [ ] 1. Code Reusability - Checked existing code first
- [ ] 2. Documentation - Updated docs/ and CHANGELOG.md
- [ ] 3. Design Patterns - Used appropriate patterns
- [ ] 4. TypeScript - 0 errors confirmed
- [ ] 5. Database Schema - Schema/index sync verified
- [ ] 6. Error Handling - Using error classes/constants
- [ ] 7. Styling - Using THEME_CONSTANTS
- [ ] 7.5. Constants - NO hardcoded strings
- [ ] 8. Proxy/Middleware - Used proxy where appropriate
- [ ] 9. Code Quality - SOLID principles followed
- [ ] 10. Documentation - CHANGELOG.md updated
- [ ] 11. This Checklist - Completed all items

**Rule**: ALL items checked ✅ before `git commit`. NO `--no-verify` flag.

---

## 🚫 NEVER DO

❌ Hardcode strings (use constants)  
❌ Duplicate Tailwind classes (use THEME_CONSTANTS)  
❌ Create components that already exist  
❌ Commit with TypeScript errors  
❌ Skip updating CHANGELOG.md  
❌ Create session-specific docs  
❌ Bypass pre-commit hooks with --no-verify  
❌ Use inline styles (except dynamic values)  
❌ Direct database access (use repositories)  
❌ Hardcode collection names (use exported constants)

---

## ✅ ALWAYS DO

✅ Check existing code before writing new  
✅ Use constants from `src/constants/`  
✅ Use THEME_CONSTANTS for all styling  
✅ Run TypeScript check on changed files  
✅ Update CHANGELOG.md with every change  
✅ Sync schema INDEXED_FIELDS with firestore.indexes.json  
✅ Use error classes and typed error codes  
✅ Follow SOLID principles  
✅ Write tests for new features  
✅ Complete pre-commit checklist

---

## 🎯 Quick Reference

**Coding Standards**: `.github/copilot-instructions.md`  
**Audit Report**: `docs/AUDIT_REPORT.md` (100% compliance)  
**Quick Lookups**: `docs/QUICK_REFERENCE.md`  
**Changes Log**: `docs/CHANGELOG.md`

**Current Compliance**: 110/110 (100%) ✅  
**Goal**: Maintain 100% compliance always 🎉

---

## 📋 Quick Command Reference

```bash
# Check TypeScript (changed files only)
npx tsc --noEmit src/app/page.tsx src/components/Button.tsx

# Full build
npm run build

# Run tests
npm test

# Lint
npm run lint

# Deploy Firebase indices
firebase deploy --only firestore:indexes

# Deploy all Firebase config
firebase deploy --only "firestore,storage,database"

# Pre-commit check (all)
npm run lint && npx tsc --noEmit && npm test
```

---

**Remember: Code quality > Speed. Take time to do it right.**

**Print this checklist or keep it open during development!**
