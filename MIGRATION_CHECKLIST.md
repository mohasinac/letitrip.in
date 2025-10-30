# Migration Checklist

Use this checklist to gradually migrate existing code to use the new refactored utilities.

## 📋 API Routes Migration

### Routes to Update:

- [ ] `/api/auth/send-otp`
- [ ] `/api/auth/verify-otp`
- [ ] `/api/admin/users`
- [ ] `/api/admin/categories`
- [ ] `/api/admin/products`
- [ ] `/api/admin/orders`
- [ ] `/api/admin/analytics`
- [ ] `/api/admin/theme-settings`
- [ ] `/api/admin/game/settings`
- [ ] `/api/beyblades`
- [ ] `/api/beyblades/[id]`
- [ ] `/api/beyblades/init`
- [ ] `/api/beyblades/upload-image`
- [ ] `/api/categories`
- [ ] `/api/categories/[id]`
- [ ] `/api/categories/featured`
- [ ] `/api/content`
- [ ] `/api/storage/upload`
- [ ] `/api/storage/get`
- [ ] `/api/contact`
- [ ] `/api/cookies`
- [ ] `/api/consent`
- [ ] `/api/sessions`
- [ ] `/api/hero-banner`
- [ ] `/api/health`
- [ ] `/api/errors`
- [ ] `/api/upload`

### Migration Steps per Route:

1. [ ] Import new utilities (`createApiHandler`, `successResponse`, etc.)
2. [ ] Add validation schemas using Zod
3. [ ] Wrap handler with `createApiHandler`
4. [ ] Replace `NextResponse.json` with `successResponse`/`errorResponse`
5. [ ] Test CORS functionality
6. [ ] Test error handling
7. [ ] Update any route-specific documentation

---

## 🎨 Components Migration

### Components with Hardcoded Colors:

- [ ] `src/components/layout/ModernLayout.tsx`
- [ ] `src/components/home/ModernHeroBanner.tsx`
- [ ] `src/components/home/ModernWhyChooseUs.tsx`
- [ ] `src/components/home/ModernFeaturedCategories.tsx`
- [ ] `src/components/home/InteractiveHeroBanner_NEW.tsx`
- [ ] `src/components/home/InteractiveHeroBanner.tsx`
- [ ] (Add more components as you find them)

### Migration Steps per Component:

1. [ ] Identify all hardcoded colors
2. [ ] Replace with theme variables:
   - `#0095f6` → `var(--theme-primary)` or `bg-theme-primary`
   - `#ffffff` → `var(--theme-text)` or `text-theme-text`
   - `rgba(...)` → Use theme utils or CSS variables
3. [ ] Test in light mode
4. [ ] Test in dark mode
5. [ ] Verify responsive design
6. [ ] Update component documentation

---

## 📱 Mobile Optimization

### Pages to Optimize:

- [ ] Home page
- [ ] Category pages
- [ ] Product pages
- [ ] Game pages
- [ ] Admin dashboard
- [ ] Profile pages
- [ ] Auth pages

### Optimization Checklist per Page:

1. [ ] Add responsive utilities (`useIsMobile`, etc.)
2. [ ] Test on mobile viewport (375px width)
3. [ ] Test on tablet viewport (768px width)
4. [ ] Verify touch interactions
5. [ ] Check font sizes (minimum 16px for inputs)
6. [ ] Verify button sizes (minimum 44x44px)
7. [ ] Test scroll behavior
8. [ ] Test orientation changes
9. [ ] Verify safe area insets (notch devices)

---

## ⚡ Performance Optimization

### Components to Optimize:

- [ ] Large lists (implement virtualization)
- [ ] Image galleries (lazy loading)
- [ ] Heavy calculations (memoization)
- [ ] Expensive renders (React.memo)
- [ ] Form inputs (debouncing)
- [ ] Scroll handlers (throttling)
- [ ] Animation-heavy components

### Optimization Checklist:

1. [ ] Identify performance bottlenecks
2. [ ] Add React.memo where appropriate
3. [ ] Use useMemo for expensive calculations
4. [ ] Use useCallback for event handlers
5. [ ] Implement lazy loading for images
6. [ ] Add debouncing to inputs
7. [ ] Add throttling to scroll handlers
8. [ ] Optimize animations (use transforms)
9. [ ] Add loading states
10. [ ] Test with React DevTools Profiler

---

## 🔧 Environment Configuration

### Tasks:

- [ ] Create `.env.local` file
- [ ] Add all required variables:
  - [ ] `NEXT_PUBLIC_APP_URL`
  - [ ] `NEXT_PUBLIC_API_URL`
  - [ ] `NEXT_PUBLIC_FIREBASE_API_KEY`
  - [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
  - [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
  - [ ] `NEXT_PUBLIC_FIREBASE_APP_ID`
  - [ ] `NEXT_PUBLIC_RAZORPAY_KEY_ID`
  - [ ] `FIREBASE_PROJECT_ID`
  - [ ] `FIREBASE_CLIENT_EMAIL`
  - [ ] `FIREBASE_PRIVATE_KEY`
  - [ ] `RAZORPAY_KEY_SECRET`
  - [ ] `JWT_SECRET`
  - [ ] `ALLOWED_ORIGINS`
- [ ] Test environment variables
- [ ] Verify CORS configuration
- [ ] Test in development
- [ ] Test in production

---

## 🎯 Testing

### API Tests:

- [ ] Test all API routes return correct format
- [ ] Test CORS headers on all routes
- [ ] Test error handling
- [ ] Test validation
- [ ] Test rate limiting
- [ ] Test authentication

### Component Tests:

- [ ] Test theme switching
- [ ] Test responsive behavior
- [ ] Test mobile interactions
- [ ] Test accessibility (keyboard navigation)
- [ ] Test loading states
- [ ] Test error states

### Performance Tests:

- [ ] Run Lighthouse audit
- [ ] Check bundle size
- [ ] Test load times
- [ ] Test animation performance
- [ ] Check for memory leaks
- [ ] Test on slow network

---

## 📚 Documentation

### Tasks:

- [ ] Read `REFACTORING_GUIDE.md`
- [ ] Read `REFACTORING_COMPLETE.md`
- [ ] Read `QUICK_REFERENCE.md`
- [ ] Review example files
- [ ] Update project README if needed
- [ ] Document any custom patterns
- [ ] Create team training materials

---

## 🚀 Deployment

### Pre-deployment Checklist:

- [ ] All tests passing
- [ ] No console errors
- [ ] Environment variables set
- [ ] Build succeeds
- [ ] Bundle size acceptable
- [ ] Lighthouse score > 90
- [ ] CORS working
- [ ] Mobile tested
- [ ] Dark mode tested

### Deployment Steps:

- [ ] Deploy to staging
- [ ] Test on staging
- [ ] Review analytics
- [ ] Deploy to production
- [ ] Monitor for errors
- [ ] Check performance metrics

---

## 🎉 Post-Migration

### Cleanup:

- [ ] Remove old unused utilities
- [ ] Remove duplicate code
- [ ] Clean up comments
- [ ] Update dependencies
- [ ] Run linter
- [ ] Format code

### Documentation:

- [ ] Update API documentation
- [ ] Update component documentation
- [ ] Update README
- [ ] Create changelog
- [ ] Share with team

---

## 📊 Progress Tracking

### Overall Progress:

- API Routes: 0 / 27 (0%)
- Components: 0 / TBD (0%)
- Pages: 0 / TBD (0%)
- Tests: 0 / TBD (0%)

### Notes:

- Start with high-priority routes/components
- Test thoroughly after each migration
- Document any issues encountered
- Share learnings with team

---

**Status:** Ready to Begin
**Start Date:** October 30, 2025
**Target Completion:** [Set your date]
