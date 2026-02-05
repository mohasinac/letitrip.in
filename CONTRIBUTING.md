# Contributing Guide

Thank you for considering contributing to Letitrip.in! This guide will help you get started.

## 📖 Before You Start

1. Read the [Quick Reference](./docs/QUICK_REFERENCE.md)
2. Understand the [Engineering Principles](./docs/ENGINEERING_IMPROVEMENTS.md)
3. Review the [Project Structure](./README.md#-project-structure)

## 🚀 Development Setup

### Prerequisites
- Node.js 18+
- Git
- Firebase project
- Resend account

### Setup Steps

1. Fork and clone the repository
```bash
git clone <your-fork-url>
cd letitrip.in
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
# Edit .env.local with your credentials
```

4. Run development server
```bash
npm run dev
```

## 🎯 Contribution Guidelines

### Code Standards

#### Always Use Constants
```typescript
// ❌ Bad
return errorResponse('Invalid email', 400);

// ✅ Good
import { ERROR_MESSAGES } from '@/constants';
return ApiErrors.badRequest(ERROR_MESSAGES.VALIDATION.INVALID_EMAIL);
```

#### Use Type-Safe Schemas
```typescript
// ❌ Bad
await db.collection('users').doc(id).get();

// ✅ Good
import { USER_COLLECTION } from '@/db/schema';
await adminDb.collection(USER_COLLECTION).doc(id).get();
```

#### Use Reusable Components
```tsx
// ❌ Bad
<input type="email" value={email} onChange={e => setEmail(e.target.value)} />
{error && <span>{error}</span>}

// ✅ Good
<FormField
  label="Email"
  name="email"
  type="email"
  value={email}
  onChange={setEmail}
  error={error}
  touched={touched}
/>
```

### File Organization

#### New API Route
```typescript
// src/app/api/your-feature/route.ts
import { withAuth } from '@/lib/api-middleware';
import { successResponse, ApiErrors } from '@/lib/api-response';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '@/constants';

export const GET = withAuth(async (request, session) => {
  // Implementation
});
```

#### New Component
```tsx
// src/components/YourComponent.tsx
'use client';

import React from 'react';
// ... other imports

export const YourComponent: React.FC<Props> = (props) => {
  // Implementation
};
```

#### New Constant
```typescript
// Add to existing src/constants/messages.ts or create new file
export const YOUR_MESSAGES = {
  SUCCESS: 'Operation successful',
  ERROR: 'Operation failed',
} as const;
```

### Git Workflow

1. Create a feature branch
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes following our conventions

3. Test thoroughly
```bash
npm run build
npm run lint
npm run type-check
```

4. Commit with clear messages
```bash
git commit -m "feat: add user profile export feature"
```

We follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Test additions/changes
- `chore:` Build process or tooling changes

5. Push and create a pull request
```bash
git push origin feature/your-feature-name
```

## 🧪 Testing

### Before Submitting PR

- [ ] Code builds successfully (`npm run build`)
- [ ] No linting errors (`npm run lint`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] All constants used (no hardcoded strings)
- [ ] Proper error handling implemented
- [ ] Documentation updated if needed

### Writing Tests (Future)
```typescript
// tests/your-feature.test.ts
describe('YourFeature', () => {
  it('should work correctly', () => {
    // Test implementation
  });
});
```

## 📝 Documentation

### When to Update Docs

- **Adding new pattern**: Update [Quick Reference](./docs/QUICK_REFERENCE.md)
- **Architecture change**: Update [Engineering Improvements](./docs/ENGINEERING_IMPROVEMENTS.md)
- **New constant category**: Update constant files and reference docs
- **API changes**: Update inline comments and API docs

### Documentation Style

- Use clear, concise language
- Include code examples
- Show both ❌ bad and ✅ good examples
- Keep examples up-to-date

## 🔍 Code Review Process

Your PR will be reviewed for:

1. **Code Quality**
   - Follows established patterns
   - Uses constants and shared utilities
   - Proper TypeScript types
   - No code duplication

2. **Functionality**
   - Works as expected
   - Handles edge cases
   - Proper error handling

3. **Documentation**
   - Code is well-commented
   - Documentation updated if needed
   - Examples provided if needed

4. **Testing**
   - Builds successfully
   - No regressions
   - New features tested

## 🚫 Common Mistakes to Avoid

### ❌ Don't Do This

```typescript
// Hardcoded strings
throw new Error('User not found');

// Magic numbers
const token = generateToken(32);
const expiresIn = 24 * 60 * 60 * 1000;

// Inline collection names
db.collection('users').doc(id);

// Repeated validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) { ... }
```

### ✅ Do This Instead

```typescript
// Use constants
import { ERROR_MESSAGES } from '@/constants';
return ApiErrors.notFound(ERROR_MESSAGES.USER.NOT_FOUND);

// Use config
import { TOKEN_CONFIG } from '@/constants';
const token = generateToken(TOKEN_CONFIG.TOKEN_LENGTH);
const expiresIn = TOKEN_CONFIG.EMAIL_VERIFICATION.EXPIRY_MS;

// Use schema constants
import { USER_COLLECTION } from '@/db/schema';
db.collection(USER_COLLECTION).doc(id);

// Use validation schemas
import { emailSchema } from '@/lib/validation';
emailSchema.parse(email);
```

## 💡 Need Help?

- Check [Quick Reference](./docs/QUICK_REFERENCE.md) for common patterns
- Read [Engineering Improvements](./docs/ENGINEERING_IMPROVEMENTS.md) for architecture
- Look at existing code for examples
- Ask questions in PR comments

## 🎉 Recognition

Contributors will be added to our contributors list. Thank you for making Letitrip.in better!

---

**Remember**: Quality over quantity. A small, well-crafted PR is better than a large, messy one.
