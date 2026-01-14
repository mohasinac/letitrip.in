# Publishing @letitrip/react-library to GitHub

This guide explains how to publish the react-library as a separate GitHub repository.

## ✅ Completed Setup

The following has been completed:

- ✅ Git repository initialized
- ✅ Initial commit created (v1.0.0)
- ✅ CI/CD workflows configured
- ✅ Documentation created (README, CONTRIBUTING, CHANGELOG, SECURITY)
- ✅ GitHub issue templates and PR template added
- ✅ TypeScript errors fixed
- ✅ Build successful (dist/ folder generated)
- ✅ Package.json configured for npm publishing

## 📋 Next Steps

### 1. Create GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Create a new repository:
   - **Name**: `react-library`
   - **Description**: `Reusable React components, hooks, and utilities for Letitrip`
   - **Visibility**: Public (for open source) or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)

### 2. Push to GitHub

```bash
# Navigate to react-library directory
cd d:\proj\letitrip.in\react-library

# Add remote (replace YOUR_USERNAME with actual GitHub username/org)
git remote add origin https://github.com/YOUR_USERNAME/react-library.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

### 3. Configure GitHub Repository

#### Enable GitHub Pages (for Storybook)

1. Go to **Settings** → **Pages**
2. Source: **GitHub Actions**
3. Storybook will auto-deploy on push to main

#### Configure Branch Protection

1. Go to **Settings** → **Branches**
2. Add rule for `main` branch:
   - ☑ Require pull request before merging
   - ☑ Require status checks to pass before merging
     - Select: `test`, `build`
   - ☑ Require branches to be up to date before merging

#### Set up Secrets (for npm publishing)

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add repository secret:
   - **Name**: `NPM_TOKEN`
   - **Value**: Your npm access token (get from https://www.npmjs.com/settings/YOUR_USERNAME/tokens)

### 4. Create First Release

```bash
# Create and push a tag
git tag v1.0.0
git push origin v1.0.0

# GitHub Actions will automatically:
# - Run tests
# - Build library
# - Publish to npm
# - Create GitHub release
```

## 📦 npm Publishing

### One-Time Setup

```bash
# Login to npm (if not already)
npm login

# Verify you're logged in
npm whoami
```

### Manual Publishing (Alternative to GitHub Actions)

```bash
cd d:\proj\letitrip.in\react-library

# Run all checks
npm run lint
npm run type-check
npm test
npm run build

# Publish to npm
npm publish --access public
```

## 🔧 Configuration Files Created

### CI/CD Workflows

- `.github/workflows/ci.yml` - Test and build on every push/PR
- `.github/workflows/release.yml` - Auto-publish on version tags
- `.github/workflows/storybook.yml` - Deploy Storybook to GitHub Pages

### Documentation

- `README.md` - Main documentation
- `CONTRIBUTING.md` - Contribution guidelines
- `CHANGELOG.md` - Version history
- `SECURITY.md` - Security policy
- `LICENSE` - MIT License

### GitHub Templates

- `.github/ISSUE_TEMPLATE/bug_report.md`
- `.github/ISSUE_TEMPLATE/feature_request.md`
- `.github/PULL_REQUEST_TEMPLATE.md`

## 🔗 Integration with Main Project

### Option 1: Install from npm (Recommended)

After publishing to npm:

```bash
cd d:\proj\letitrip.in
npm install @letitrip/react-library
```

### Option 2: Install from GitHub

```bash
cd d:\proj\letitrip.in
npm install git+https://github.com/YOUR_USERNAME/react-library.git
```

### Option 3: Local Development Link

For local development:

```bash
# In react-library folder
cd d:\proj\letitrip.in\react-library
npm link

# In main project folder
cd d:\proj\letitrip.in
npm link @letitrip/react-library
```

### Update Imports

Replace all imports in main project:

```typescript
// Before (local imports)
import { formatPrice } from "@/lib/price.utils";
import { FormInput } from "@/components/forms/FormInput";
import { useDebounce } from "@/hooks/useDebounce";

// After (package imports)
import { formatPrice } from "@letitrip/react-library/utils";
import { FormInput } from "@letitrip/react-library/components";
import { useDebounce } from "@letitrip/react-library/hooks";
```

## 📊 Package Features

### Bundle Sizes

- Total: ~180 KB minified
- Gzipped: ~50 KB
- Tree-shakeable exports

### Supported Environments

- React 18.x and 19.x
- TypeScript 5.3+
- Node.js 18.x+
- Modern browsers (ES2020+)

### Export Paths

- `@letitrip/react-library` - All exports
- `@letitrip/react-library/utils` - Utilities only
- `@letitrip/react-library/components` - Components only
- `@letitrip/react-library/hooks` - Hooks only
- `@letitrip/react-library/styles` - Styles only
- `@letitrip/react-library/types` - Types only
- `@letitrip/react-library/styles/tokens` - CSS tokens

## 🚀 Release Process

1. **Update Version**:

   ```bash
   npm version patch  # 1.0.0 → 1.0.1
   npm version minor  # 1.0.0 → 1.1.0
   npm version major  # 1.0.0 → 2.0.0
   ```

2. **Update CHANGELOG.md**:

   - Document all changes
   - Follow Keep a Changelog format

3. **Push Tags**:

   ```bash
   git push && git push --tags
   ```

4. **GitHub Actions** will automatically:
   - Run all tests
   - Build the library
   - Publish to npm
   - Create GitHub release

## 🔒 Security

- Security policy: `SECURITY.md`
- Report vulnerabilities: security@letitrip.com
- Dependabot enabled for dependency updates
- npm audit runs in CI

## 📝 Maintenance

### Regular Tasks

- [ ] Review and merge dependabot PRs
- [ ] Respond to issues within 48 hours
- [ ] Review PRs within 5 business days
- [ ] Update documentation as needed
- [ ] Monitor bundle size
- [ ] Check Lighthouse scores

### Quarterly Reviews

- [ ] Audit dependencies
- [ ] Update peer dependencies
- [ ] Review and update documentation
- [ ] Performance optimization
- [ ] Accessibility audit

## 🌟 Success Metrics

Track these metrics:

- npm downloads
- GitHub stars
- Open issues/PRs
- Response times
- Bundle size
- Test coverage
- Build times

## 📞 Support

- **Issues**: https://github.com/letitrip/react-library/issues
- **Discussions**: https://github.com/letitrip/react-library/discussions
- **Email**: support@letitrip.com

## ✅ Final Checklist

Before going public:

- [ ] GitHub repository created
- [ ] Code pushed to main branch
- [ ] GitHub Pages enabled for Storybook
- [ ] Branch protection rules configured
- [ ] NPM_TOKEN secret added
- [ ] npm package published
- [ ] First release created
- [ ] README badges updated with actual links
- [ ] Documentation reviewed
- [ ] Main project updated to use package

---

**Status**: Ready for GitHub publishing 🎉

The library is fully configured and ready to be pushed to GitHub!
