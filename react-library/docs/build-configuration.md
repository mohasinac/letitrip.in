# Build & Bundle Configuration

**Last Updated**: January 13, 2026  
**Status**: ✅ Optimized for Production

## Overview

The React Library uses Vite for building with advanced optimization techniques including tree-shaking, code splitting, minification, and source map generation.

## Build Configuration

### Vite Configuration

Located in `vite.config.ts`, the build configuration includes:

#### 1. **Tree-Shaking**

- Automatic dead code elimination
- External dependencies properly marked
- Preserved module structure for optimal tree-shaking
- Multiple entry points for granular imports

#### 2. **Code Splitting**

- Automatic chunk splitting by feature
- Organized chunk structure:
  - `vendor/` - Third-party dependencies
  - `chunks/components/` - Component chunks
  - `chunks/utils/` - Utility function chunks
  - `chunks/hooks/` - React hooks chunks
- Manual chunks disabled to let Rollup optimize

#### 3. **Minification**

- Terser minification with 2-pass compression
- Removes `console.debug` calls
- Removes debugger statements
- Removes comments
- Safari 10 compatibility
- Target: ES2020 for modern browsers

#### 4. **Source Maps**

- Generated for all bundles
- Enables debugging in production
- ~280% overhead (acceptable for debugging)

#### 5. **External Dependencies**

Properly externalized to avoid bundling:

- `react` and `react-dom` (peer dependencies)
- `date-fns` (date utilities)
- `clsx` and `tailwind-merge` (CSS utilities)
- `libphonenumber-js` (phone validation)

## Build Output

```
dist/
├── index.js                              # Main ESM entry (3.73 KB)
├── index.cjs                             # Main CJS entry (3.45 KB)
├── index.d.ts                            # TypeScript definitions
├── utils/
│   ├── index.js                          # Utils ESM (2.05 KB)
│   ├── index.cjs                         # Utils CJS (2.08 KB)
│   └── index.d.ts                        # Utils types
├── components/
│   ├── index.js                          # Components ESM (0.81 KB)
│   ├── index.cjs                         # Components CJS (0.91 KB)
│   └── index.d.ts                        # Component types
├── hooks/
│   ├── index.js                          # Hooks ESM (0.52 KB)
│   ├── index.cjs                         # Hooks CJS (0.61 KB)
│   └── index.d.ts                        # Hook types
├── types/
│   ├── index.js                          # Types ESM (0.03 KB)
│   ├── index.cjs                         # Types CJS (0.05 KB)
│   └── index.d.ts                        # Type definitions
├── styles/
│   ├── index.js                          # Styles ESM (0.38 KB)
│   ├── index.cjs                         # Styles CJS (0.39 KB)
│   ├── index.d.ts                        # Style types
│   └── tokens/                           # CSS design tokens (7 files)
└── chunks/                               # Code-split chunks
    ├── Card-*.js                         # Card component chunk (93.39 KB)
    ├── accessibility-*.js                # Accessibility helpers (67.09 KB)
    ├── useUtilities-*.js                 # Utility hooks (11.43 KB)
    └── validators-*.js                   # Validation functions (3.73 KB)
```

## Bundle Size Analysis

### Total Bundle Sizes

| Type                       | Size            | Files   | Percentage |
| -------------------------- | --------------- | ------- | ---------- |
| **ESM Bundles**            | 269.26 KB       | 14      | 23.4%      |
| **CommonJS Bundles**       | 7.49 KB         | 6       | 0.7%       |
| **TypeScript Definitions** | 62.63 KB        | 52      | 5.5%       |
| **CSS Files**              | 27.94 KB        | 7       | 2.4%       |
| **Source Maps**            | 780.70 KB       | 72      | 68.0%      |
| **Total**                  | **1,148.02 KB** | **151** | **100%**   |

### Bundle Distribution

- **ESM/CJS Ratio**: 97.3% ESM, 2.7% CJS
- **Source Map Overhead**: 282.1% (acceptable for debugging)
- **Deliverable Size**: ~297 KB (without source maps)
- **Gzipped Estimate**: ~75-90 KB (based on 25-30% compression)

### Largest Chunks

| Chunk                | Size     | Purpose                           |
| -------------------- | -------- | --------------------------------- |
| `Card-*.js`          | 93.39 KB | Card component with all features  |
| `accessibility-*.js` | 67.09 KB | WCAG 2.1 AA accessibility helpers |
| `useUtilities-*.js`  | 11.43 KB | Custom React hooks utilities      |
| `validators-*.js`    | 3.73 KB  | Input validation functions        |

## Optimization Recommendations

### Current Status

✅ **Strengths:**

- Excellent tree-shaking support
- Small entry point files (< 4 KB)
- Good ESM/CJS ratio (97.3% modern)
- Proper code splitting
- Source maps for debugging

⚠️ **Areas for Improvement:**

- 2 chunks > 50KB (Card: 93KB, Accessibility: 67KB)
- Consider further splitting large chunks
- Possible lazy loading for heavy components

### Future Optimizations

1. **Code Splitting Enhancement**

   - Split Card component into smaller pieces
   - Separate accessibility utilities by feature
   - Lazy load heavy components

2. **Bundle Size Reduction**

   - Analyze and optimize large dependencies
   - Remove unused code paths
   - Consider alternative smaller libraries

3. **Performance Monitoring**
   - Set up bundle size budgets
   - Track bundle size in CI/CD
   - Alert on size increases

## Build Scripts

### Available Commands

```bash
# Development build with watch mode
npm run dev

# Production build
npm run build

# Full build with TypeScript compilation
npm run build:full

# Build with bundle analysis
npm run build:analyze

# Type checking only (no build)
npm run type-check

# Run tests with coverage
npm run test:coverage
```

### Build Process

1. **Type Checking**: TypeScript validates all types
2. **Bundling**: Vite bundles source code
3. **Minification**: Terser compresses code
4. **Source Maps**: Generate debugging maps
5. **CSS Processing**: Copy design tokens
6. **Type Definitions**: Generate .d.ts files

## Performance Metrics

### Build Performance

- **Build Time**: ~7 seconds
- **Type Generation**: ~3.7 seconds (52% of build time)
- **Bundling**: ~3.3 seconds (48% of build time)
- **Modules Transformed**: 1,700 modules

### Runtime Performance

- **Tree-Shaking**: ✅ Enabled (dead code elimination)
- **Code Splitting**: ✅ Enabled (automatic chunking)
- **Minification**: ✅ Enabled (Terser with 2 passes)
- **Target**: ES2020 (modern browsers)

## CI/CD Integration

### Recommended Pipeline

```yaml
# .github/workflows/build.yml
name: Build Library

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "20"
      - run: npm ci
      - run: npm run type-check
      - run: npm run build
      - run: npm run build:analyze
      - run: npm test
```

### Bundle Size Monitoring

```yaml
# Check bundle size on PRs
- name: Check bundle size
  run: |
    npm run build:analyze > bundle-report.txt
    # Compare with main branch
    # Fail if increase > 10%
```

## Troubleshooting

### Build Fails

**Issue**: TypeScript errors prevent build  
**Solution**: Run `npm run type-check` to see specific errors

**Issue**: Out of memory during build  
**Solution**: Increase Node.js memory: `NODE_OPTIONS=--max-old-space-size=4096 npm run build`

### Large Bundle Size

**Issue**: Bundle size increased unexpectedly  
**Solution**:

1. Run `npm run build:analyze` to identify large chunks
2. Check for accidentally bundled dependencies
3. Verify external dependencies configuration

### Source Map Issues

**Issue**: Source maps not generated  
**Solution**: Check `build.sourcemap` is set to `true` in vite.config.ts

## Best Practices

### For Library Maintainers

1. **Monitor Bundle Size**: Run analysis on every PR
2. **Externalize Dependencies**: Keep peer dependencies external
3. **Code Splitting**: Split large features into separate chunks
4. **Tree-Shaking**: Export only what's needed
5. **Type Safety**: Maintain 100% TypeScript coverage

### For Library Consumers

1. **Import Specifically**: Use specific imports for better tree-shaking

   ```typescript
   // ✅ Good - tree-shakeable
   import { FormInput } from "@letitrip/react-library/components";

   // ❌ Avoid - bundles everything
   import { FormInput } from "@letitrip/react-library";
   ```

2. **Use ESM**: Import ESM version for modern bundlers

   ```json
   {
     "module": "./dist/index.js", // ESM
     "main": "./dist/index.cjs" // CJS fallback
   }
   ```

3. **Enable Tree-Shaking**: Configure bundler properly
   ```javascript
   // webpack.config.js
   optimization: {
     usedExports: true,
     sideEffects: false,
   }
   ```

## Version History

- **v1.0.0** (2026-01-13): Initial release with optimized build
  - Tree-shaking enabled
  - Code splitting configured
  - Minification with Terser
  - Source maps generated
  - Bundle analysis script

---

**For questions or issues**: See [Contributing Guide](contributing.md)
