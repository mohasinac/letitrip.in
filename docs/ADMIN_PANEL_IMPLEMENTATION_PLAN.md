# 📋 Admin Panel Implementation Plan

**Project:** JustForView.in - Beyblade Ecommerce Platform  
**Plan Date:** November 1, 2025  
**Based On:** Admin Pages Audit Report  
**Target Completion:** 4 Weeks

---

## Table of Contents

1. [Overview](#overview)
2. [Phase 1: Critical Fixes (Week 1)](#phase-1-critical-fixes-week-1)
3. [Phase 2: Core Features (Week 2)](#phase-2-core-features-week-2)
4. [Phase 3: Code Quality (Week 3)](#phase-3-code-quality-week-3)
5. [Phase 4: Polish & Testing (Week 4)](#phase-4-polish--testing-week-4)
6. [Implementation Details](#implementation-details)
7. [Success Criteria](#success-criteria)

---

## Overview

### Current State

From the audit report:

- ✅ **50%** of admin features fully implemented
- ⚠️ **30%** are placeholder pages
- 🔄 **20%** need code quality improvements
- 🔴 **2 pages** missing security (RoleGuard)
- ⚠️ **7 pages** using raw `fetch()` instead of API helpers

### Target State

- ✅ **100%** core admin features implemented
- ✅ All pages properly secured
- ✅ Consistent API usage across all pages
- ✅ No placeholder pages
- ✅ Full Firebase integration
- ✅ Comprehensive testing completed

### Priorities

1. **🔴 CRITICAL:** Security fixes + Core functionality (Products, Orders)
2. **🟡 HIGH:** Code quality improvements + API migration
3. **🟢 MEDIUM:** Secondary features (Analytics, Support)
4. **🔵 LOW:** Polish, optimization, documentation

---

## Phase 1: Critical Fixes (Week 1)

**Duration:** 5 working days  
**Goal:** Fix security issues and implement highest priority features

### Day 1: Security & Quick Fixes (4 hours)

#### Task 1.1: Add RoleGuard Protection

**Files to Fix:**

- `src/app/admin/arenas/page.tsx`
- `src/app/admin/game/settings/page.tsx`

**Implementation:**

```tsx
// Before
export default function ArenasPage() {
  return <div>...</div>;
}

// After
import RoleGuard from "@/components/features/auth/RoleGuard";

export default function ArenasPage() {
  return (
    <RoleGuard requiredRole="admin">
      <div>...</div>
    </RoleGuard>
  );
}
```

**Estimated Time:** 30 minutes  
**Priority:** 🔴 CRITICAL

---

#### Task 1.2: Fix TypeScript Params Errors

**Affected Files:**

- `src/app/admin/game/beyblades/edit/[id]/page.tsx`
- `src/app/admin/game/stadiums/edit/[id]/page.tsx`
- All other `[id]` dynamic routes

**Implementation:**

```tsx
// Before
const params = useParams();
const id = params.id as string;

// After
const params = useParams();
const id = params?.id as string;
```

**Estimated Time:** 1 hour  
**Priority:** 🔴 HIGH

---

#### Task 1.3: Remove Duplicate Pages

**Action Items:**

- Decide: Keep `/admin/game/stadiums` or `/admin/arenas`
- Redirect one to the other
- Update navigation links
- Clean up unused files

**Recommendation:** Keep `/admin/game/stadiums` (more organized)

**Estimated Time:** 2 hours  
**Priority:** 🟡 MEDIUM

---

### Day 2-3: Implement Products Page (16 hours)

#### Task 1.4: Create Admin Products List Page

**File:** `src/app/admin/products/page.tsx`

**Features Required:**

- ✅ List all products from all sellers
- ✅ Search by name/SKU
- ✅ Filter by:
  - Category
  - Status (active/inactive/draft)
  - Seller
  - Stock status
- ✅ Sort by date, price, name
- ✅ Pagination (50 per page)
- ✅ Quick actions: Edit, Delete, View
- ✅ Bulk actions: Delete, Status change
- ✅ Product stats cards

**API Endpoints Needed:**

```typescript
GET /api/admin/products?page=1&limit=50&search=query&category=id&status=active
GET /api/admin/products/stats
```

**Components to Use:**

- `UnifiedCard`
- `UnifiedInput` (search)
- `UnifiedSelect` (filters)
- `UnifiedButton`
- `UnifiedBadge` (status)
- `UnifiedTable` (or custom table)

**Estimated Lines:** 800-1000  
**Estimated Time:** 12 hours  
**Priority:** 🔴 CRITICAL

---

#### Task 1.5: Create Product Detail/Edit Pages

**Files:**

- `src/app/admin/products/[id]/page.tsx` (view)
- `src/app/admin/products/[id]/edit/page.tsx` (edit)

**Features Required:**

- ✅ View all product details
- ✅ Edit any product field
- ✅ Override seller restrictions
- ✅ Change product status
- ✅ View seller information
- ✅ View sales history
- ✅ Manage inventory

**API Endpoints Needed:**

```typescript
GET /api/admin/products/:id
PUT /api/admin/products/:id
DELETE /api/admin/products/:id
GET /api/admin/products/:id/sales
```

**Estimated Lines:** 600-800 (combined)  
**Estimated Time:** 8 hours  
**Priority:** 🔴 CRITICAL

---

### Day 4-5: Implement Orders Page (16 hours)

#### Task 1.6: Create Admin Orders List Page

**File:** `src/app/admin/orders/page.tsx`

**Features Required:**

- ✅ List all orders from all sellers
- ✅ Search by order ID, customer email
- ✅ Filter by:
  - Status (pending/processing/shipped/delivered/cancelled)
  - Date range
  - Seller
  - Payment method (COD/prepaid)
- ✅ Sort by date, amount
- ✅ Pagination
- ✅ Quick actions: View, Update status
- ✅ Bulk actions: Export, Status update
- ✅ Order stats cards

**API Endpoints Needed:**

```typescript
GET /api/admin/orders?page=1&limit=50&status=pending&seller=id
GET /api/admin/orders/stats
PATCH /api/admin/orders/:id/status
```

**Components to Use:**

- `UnifiedCard`
- `UnifiedInput` (search)
- `UnifiedSelect` (filters)
- `UnifiedButton`
- `UnifiedBadge` (status, payment method)
- Custom OrdersTable component

**Estimated Lines:** 600-800  
**Estimated Time:** 10 hours  
**Priority:** 🔴 CRITICAL

---

#### Task 1.7: Create Order Detail Page

**File:** `src/app/admin/orders/[id]/page.tsx`

**Features Required:**

- ✅ Full order details
- ✅ Customer information
- ✅ Seller information
- ✅ Product items list
- ✅ Pricing breakdown
- ✅ Shipping information
- ✅ Payment details
- ✅ Order timeline/history
- ✅ Status update form
- ✅ Generate invoice button
- ✅ Tracking information

**API Endpoints Needed:**

```typescript
GET /api/admin/orders/:id
PATCH /api/admin/orders/:id/status
POST /api/admin/orders/:id/invoice
GET /api/admin/orders/:id/timeline
```

**Estimated Lines:** 500-600  
**Estimated Time:** 6 hours  
**Priority:** 🔴 CRITICAL

---

### Week 1 Summary

**Total Estimated Time:** 40 hours (5 days × 8 hours)

**Deliverables:**

- ✅ All security vulnerabilities fixed
- ✅ Products page fully implemented
- ✅ Orders page fully implemented
- ✅ TypeScript errors resolved
- ✅ Duplicate pages cleaned up

**Testing Checklist:**

- [ ] All pages require admin authentication
- [ ] Products CRUD works correctly
- [ ] Orders listing and filtering works
- [ ] Order status updates work
- [ ] No TypeScript compilation errors
- [ ] No console errors

---

## Phase 2: Core Features (Week 2)

**Duration:** 5 working days  
**Goal:** Complete secondary features and improve dashboard

### Day 6: Dashboard Dynamic Data (8 hours)

#### Task 2.1: Implement Real-Time Stats

**File:** `src/app/admin/page.tsx`

**Current Issues:**

- Stats are hardcoded
- No real Firebase data
- No refresh mechanism

**Features to Add:**

- ✅ Fetch real-time stats from Firebase
- ✅ Total orders count
- ✅ Total users count
- ✅ Total revenue calculation
- ✅ Pending orders count
- ✅ Recent activity feed (last 10 activities)
- ✅ Auto-refresh every 30 seconds
- ✅ Loading states
- ✅ Error handling

**API Endpoints Needed:**

```typescript
GET / api / admin / dashboard / stats;
GET / api / admin / dashboard / recent - activity;
```

**Changes:**

```tsx
// Add data fetching
const [stats, setStats] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetchDashboardStats();
  const interval = setInterval(fetchDashboardStats, 30000);
  return () => clearInterval(interval);
}, []);

const fetchDashboardStats = async () => {
  const data = await apiGet("/api/admin/dashboard/stats");
  setStats(data);
};
```

**Estimated Time:** 8 hours  
**Priority:** 🟡 HIGH

---

### Day 7-8: Analytics Page (16 hours)

#### Task 2.2: Create Analytics Dashboard

**File:** `src/app/admin/analytics/page.tsx`

**Features Required:**

- ✅ Sales over time chart (line chart)
- ✅ Revenue by category (pie chart)
- ✅ Top selling products (bar chart)
- ✅ User growth chart
- ✅ Conversion rate metrics
- ✅ Average order value
- ✅ Date range selector
- ✅ Export to CSV/PDF
- ✅ Filter by seller
- ✅ Comparison mode (compare periods)

**Charts Library:**
Use Recharts or Chart.js (already might be in dependencies)

**API Endpoints Needed:**

```typescript
GET /api/admin/analytics/sales?from=date&to=date
GET /api/admin/analytics/revenue-by-category
GET /api/admin/analytics/top-products?limit=10
GET /api/admin/analytics/user-growth
GET /api/admin/analytics/conversion-rate
```

**Components Structure:**

```tsx
<AnalyticsLayout>
  <StatsOverview />
  <SalesChart />
  <RevenueByCategory />
  <TopProducts />
  <UserGrowth />
</AnalyticsLayout>
```

**Estimated Lines:** 500-700  
**Estimated Time:** 16 hours  
**Priority:** 🟡 MEDIUM

---

### Day 9-10: Support Page (16 hours)

#### Task 2.3: Create Support Tickets List

**File:** `src/app/admin/support/page.tsx`

**Features Required:**

- ✅ List all support tickets
- ✅ Search by ticket ID, user email
- ✅ Filter by:
  - Status (open/in-progress/resolved/closed)
  - Priority (low/medium/high/urgent)
  - Category
  - Date range
- ✅ Sort by date, priority
- ✅ Pagination
- ✅ Quick actions: View, Reply, Change status
- ✅ Assign to admin
- ✅ Ticket stats cards

**API Endpoints Needed:**

```typescript
GET /api/admin/support?page=1&status=open&priority=high
GET /api/admin/support/stats
PATCH /api/admin/support/:id/status
PATCH /api/admin/support/:id/assign
```

**Estimated Lines:** 500-600  
**Estimated Time:** 10 hours  
**Priority:** 🟡 MEDIUM

---

#### Task 2.4: Create Support Ticket Detail Page

**File:** `src/app/admin/support/[id]/page.tsx`

**Features Required:**

- ✅ Ticket details
- ✅ User information
- ✅ Conversation thread
- ✅ Reply form
- ✅ Attach files
- ✅ Change status
- ✅ Change priority
- ✅ Assign to admin
- ✅ Internal notes
- ✅ Ticket history/timeline

**API Endpoints Needed:**

```typescript
GET /api/admin/support/:id
POST /api/admin/support/:id/reply
POST /api/admin/support/:id/note
GET /api/admin/support/:id/history
```

**Estimated Lines:** 400-500  
**Estimated Time:** 6 hours  
**Priority:** 🟡 MEDIUM

---

### Week 2 Summary

**Total Estimated Time:** 40 hours

**Deliverables:**

- ✅ Dashboard with real-time data
- ✅ Analytics page with charts
- ✅ Support ticket system
- ✅ All secondary features complete

**Testing Checklist:**

- [ ] Dashboard stats refresh correctly
- [ ] Analytics charts render properly
- [ ] Support ticket CRUD works
- [ ] Email notifications sent
- [ ] Data exports work

---

## Phase 3: Code Quality (Week 3)

**Duration:** 5 working days  
**Goal:** Migrate game pages to API helpers and improve code consistency

### Day 11-12: API Helper Migration (16 hours)

#### Task 3.1: Migrate Beyblades Pages

**Files to Update:**

- `src/app/admin/game/beyblades/page.tsx`
- `src/app/admin/game/beyblades/create/page.tsx`
- `src/app/admin/game/beyblades/edit/[id]/page.tsx`

**Changes Required:**

```tsx
// ❌ BEFORE
const response = await fetch("/api/beyblades");
const data = await response.json();

// ✅ AFTER
import { apiGet } from "@/lib/api/client";
const data = await apiGet("/api/beyblades");
```

**Additional Improvements:**

- Add loading states
- Add error handling
- Use UnifiedComponents
- Add breadcrumb tracking
- Add success/error alerts

**Estimated Time:** 8 hours  
**Priority:** 🟡 HIGH

---

#### Task 3.2: Migrate Stadiums Pages

**Files to Update:**

- `src/app/admin/game/stadiums/page.tsx`
- `src/app/admin/game/stadiums/create/page.tsx`
- `src/app/admin/game/stadiums/edit/[id]/page.tsx`

**Same changes as beyblades + naming fixes:**

- Standardize on "stadiums" terminology
- Update API endpoint calls
- Fix component names

**Estimated Time:** 8 hours  
**Priority:** 🟡 HIGH

---

### Day 13: Game Stats Page Update (8 hours)

#### Task 3.3: Update Game Stats

**File:** `src/app/admin/game/stats/page.tsx`

**Improvements:**

- Use `apiGet` instead of `fetch`
- Add error boundaries
- Add loading skeletons
- Add refresh button
- Add export functionality
- Better data visualization

**Estimated Time:** 8 hours  
**Priority:** 🟢 MEDIUM

---

### Day 14: Naming Consistency (8 hours)

#### Task 3.4: Standardize Terminology

**Action Items:**

1. **Stadium vs Arena Decision:** Use "Stadiums"

   - Update API routes (keep `/api/arenas` for backward compatibility, add alias)
   - Update component names
   - Update file paths
   - Update documentation

2. **Create Migration Guide:**

   - Document old vs new naming
   - Update all references in code
   - Update route constants

3. **Update Navigation:**
   - Admin sidebar
   - Breadcrumbs
   - Route constants

**Estimated Time:** 8 hours  
**Priority:** 🟢 MEDIUM

---

### Day 15: Code Review & Cleanup (8 hours)

#### Task 3.5: Code Quality Improvements

**Actions:**

- [ ] Run ESLint on all admin pages
- [ ] Fix all TypeScript warnings
- [ ] Remove unused imports
- [ ] Remove console.logs
- [ ] Add missing PropTypes/interfaces
- [ ] Improve error messages
- [ ] Add loading states where missing
- [ ] Standardize component structure
- [ ] Add JSDoc comments to complex functions

**Tools:**

```bash
npm run lint
npm run type-check
npm run format
```

**Estimated Time:** 8 hours  
**Priority:** 🟡 HIGH

---

### Week 3 Summary

**Total Estimated Time:** 40 hours

**Deliverables:**

- ✅ All game pages using API helpers
- ✅ Consistent naming across codebase
- ✅ No TypeScript errors
- ✅ No ESLint warnings
- ✅ Clean, maintainable code

**Code Quality Metrics:**

- [ ] 0 TypeScript errors
- [ ] 0 ESLint errors
- [ ] 100% use of API helpers
- [ ] 100% RoleGuard coverage
- [ ] All pages under 500 lines (or split)

---

## Phase 4: Polish & Testing (Week 4)

**Duration:** 5 working days  
**Goal:** Testing, bug fixes, documentation, and deployment prep

### Day 16-17: Testing (16 hours)

#### Task 4.1: Manual Testing

**Test Plan:**

**Authentication & Authorization (2 hours)**

- [ ] Non-admin cannot access admin routes
- [ ] Admin can access all routes
- [ ] Seller cannot access admin routes
- [ ] Session persistence works
- [ ] Logout clears session

**Products Management (3 hours)**

- [ ] List products from all sellers
- [ ] Create new product
- [ ] Edit any product
- [ ] Delete product (with confirmation)
- [ ] Search works
- [ ] Filters work
- [ ] Pagination works
- [ ] Bulk actions work

**Orders Management (3 hours)**

- [ ] List all orders
- [ ] View order details
- [ ] Update order status
- [ ] Filter by status/date/seller
- [ ] Search works
- [ ] Generate invoice
- [ ] Email notifications sent

**Users Management (2 hours)**

- [ ] List all users
- [ ] Search users
- [ ] Change roles
- [ ] Ban/unban users
- [ ] Cannot modify own role

**Analytics & Support (2 hours)**

- [ ] Analytics charts load
- [ ] Data exports work
- [ ] Support tickets display
- [ ] Reply to tickets works

**Game Features (2 hours)**

- [ ] Beyblades CRUD works
- [ ] Stadiums CRUD works
- [ ] API calls successful

**Settings (2 hours)**

- [ ] Theme changes save
- [ ] Hero settings save
- [ ] Featured categories save

---

#### Task 4.2: Bug Fixes

**Process:**

1. Document all bugs found in testing
2. Prioritize by severity
3. Fix critical bugs immediately
4. Schedule medium/low bugs
5. Re-test after fixes

**Estimated Time:** Variable (8-16 hours)

---

### Day 18: Performance Optimization (8 hours)

#### Task 4.3: Performance Improvements

**Actions:**

- [ ] Add loading skeletons to all pages
- [ ] Implement pagination everywhere
- [ ] Add debouncing to search inputs
- [ ] Optimize images
- [ ] Add caching where appropriate
- [ ] Lazy load heavy components
- [ ] Code splitting for large pages
- [ ] Optimize Firebase queries (use indexes)

**Tools:**

```bash
npm run build
npm run analyze
```

**Estimated Time:** 8 hours  
**Priority:** 🟡 MEDIUM

---

### Day 19: Documentation (8 hours)

#### Task 4.4: Update Documentation

**Files to Create/Update:**

1. **Admin Panel User Guide**

   - How to manage products
   - How to manage orders
   - How to manage users
   - How to use analytics
   - How to handle support

2. **API Documentation**

   - All admin endpoints
   - Request/response formats
   - Authentication requirements
   - Rate limiting

3. **Developer Guide**

   - How to add new admin pages
   - Component patterns to follow
   - API helper usage
   - Testing procedures

4. **Update ROUTES_AND_PAGES.md**

   - Add all new admin routes
   - Update page descriptions

5. **Update ADMIN_PAGES_AUDIT_REPORT.md**
   - Mark all pages as complete
   - Update statistics
   - Document changes made

**Estimated Time:** 8 hours  
**Priority:** 🟡 MEDIUM

---

### Day 20: Final Review & Deployment (8 hours)

#### Task 4.5: Pre-Deployment Checklist

**Code Quality:**

- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] No console errors in browser
- [ ] All pages load without errors
- [ ] All API calls work

**Security:**

- [ ] All admin routes protected
- [ ] XSS vulnerabilities checked
- [ ] SQL injection prevented
- [ ] CSRF tokens implemented
- [ ] Rate limiting enabled
- [ ] Sensitive data filtered

**Performance:**

- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 3s
- [ ] No memory leaks
- [ ] Images optimized

**Functionality:**

- [ ] All features work as expected
- [ ] Edge cases handled
- [ ] Error messages user-friendly
- [ ] Success messages shown
- [ ] Loading states everywhere

**Documentation:**

- [ ] All docs updated
- [ ] API docs complete
- [ ] User guide complete
- [ ] Code comments added

---

#### Task 4.6: Deployment

**Steps:**

1. Create production build
2. Run final tests
3. Deploy to staging
4. Smoke test on staging
5. Deploy to production
6. Monitor for errors
7. Rollback plan ready

**Estimated Time:** 4 hours  
**Priority:** 🔴 CRITICAL

---

### Week 4 Summary

**Total Estimated Time:** 40 hours

**Deliverables:**

- ✅ All features tested
- ✅ All bugs fixed
- ✅ Performance optimized
- ✅ Documentation complete
- ✅ Deployed to production

---

## Implementation Details

### API Endpoints to Create

#### Products

```typescript
// src/app/api/admin/products/route.ts
GET    /api/admin/products              // List all products
POST   /api/admin/products              // Create product (admin override)

// src/app/api/admin/products/[id]/route.ts
GET    /api/admin/products/:id          // Get product details
PUT    /api/admin/products/:id          // Update product
DELETE /api/admin/products/:id          // Delete product

// src/app/api/admin/products/stats/route.ts
GET    /api/admin/products/stats        // Get product stats
```

#### Orders

```typescript
// src/app/api/admin/orders/route.ts
GET    /api/admin/orders                // List all orders

// src/app/api/admin/orders/[id]/route.ts
GET    /api/admin/orders/:id            // Get order details
PATCH  /api/admin/orders/:id/status     // Update order status

// src/app/api/admin/orders/stats/route.ts
GET    /api/admin/orders/stats          // Get order stats

// src/app/api/admin/orders/[id]/invoice/route.ts
POST   /api/admin/orders/:id/invoice    // Generate invoice
```

#### Dashboard

```typescript
// src/app/api/admin/dashboard/stats/route.ts
GET / api / admin / dashboard / stats; // Get dashboard stats

// src/app/api/admin/dashboard/activity/route.ts
GET / api / admin / dashboard / activity; // Get recent activity
```

#### Analytics

```typescript
// src/app/api/admin/analytics/sales/route.ts
GET / api / admin / analytics / sales; // Sales data

// src/app/api/admin/analytics/revenue/route.ts
GET / api / admin / analytics / revenue; // Revenue by category

// src/app/api/admin/analytics/products/route.ts
GET / api / admin / analytics / products; // Top products

// src/app/api/admin/analytics/users/route.ts
GET / api / admin / analytics / users; // User growth
```

#### Support

```typescript
// src/app/api/admin/support/route.ts
GET    /api/admin/support                // List tickets
POST   /api/admin/support                // Create ticket

// src/app/api/admin/support/[id]/route.ts
GET    /api/admin/support/:id            // Get ticket details
PATCH  /api/admin/support/:id/status     // Update status

// src/app/api/admin/support/[id]/reply/route.ts
POST   /api/admin/support/:id/reply      // Reply to ticket

// src/app/api/admin/support/[id]/assign/route.ts
PATCH  /api/admin/support/:id/assign     // Assign to admin
```

---

### Component Structure

#### Reusable Components to Create

1. **AdminStatsCard** (`src/components/admin/AdminStatsCard.tsx`)

   - Used for dashboard and page stats
   - Props: title, value, change, icon, color

2. **AdminTable** (`src/components/admin/AdminTable.tsx`)

   - Reusable table with sorting, filtering, pagination
   - Props: columns, data, onSort, onFilter, onPageChange

3. **AdminFilters** (`src/components/admin/AdminFilters.tsx`)

   - Reusable filter panel
   - Props: filters, onFilterChange, onReset

4. **AdminSearch** (`src/components/admin/AdminSearch.tsx`)

   - Reusable search with debouncing
   - Props: onSearch, placeholder, value

5. **StatusBadge** (`src/components/admin/StatusBadge.tsx`)

   - Status indicator with colors
   - Props: status, variant

6. **BulkActions** (`src/components/admin/BulkActions.tsx`)
   - Bulk action toolbar
   - Props: selectedItems, actions, onAction

---

### Database Schema Updates

#### Collections to Add/Update

**orders (update)**

```typescript
{
  id: string;
  orderNumber: string;
  userId: string;
  sellerId: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: 'cod' | 'prepaid';
  shippingAddress: Address;
  trackingNumber?: string;
  invoiceUrl?: string;
  timeline: OrderEvent[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**support_tickets (new)**

```typescript
{
  id: string;
  ticketNumber: string;
  userId: string;
  subject: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  assignedTo?: string;
  messages: Message[];
  attachments: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**analytics (new - for caching)**

```typescript
{
  id: string;
  type: "sales" | "revenue" | "users";
  date: string; // YYYY-MM-DD
  data: any;
  createdAt: Timestamp;
}
```

---

### Firestore Indexes Required

```javascript
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "sellerId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "support_tickets",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "priority", "order": "DESCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "products",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "sellerId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

---

## Success Criteria

### Functional Requirements

- [ ] All 6 placeholder pages fully implemented
- [ ] All security vulnerabilities fixed
- [ ] All API calls using proper helpers
- [ ] All pages have proper error handling
- [ ] All pages have loading states
- [ ] All forms validated
- [ ] All CRUD operations work
- [ ] All filters and search work
- [ ] All pagination works

### Non-Functional Requirements

- [ ] Page load time < 2 seconds
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Lighthouse score > 90
- [ ] All pages responsive
- [ ] All pages accessible (WCAG AA)
- [ ] Browser support: Chrome, Firefox, Safari, Edge

### Code Quality

- [ ] All files under 500 lines (or properly split)
- [ ] All functions documented
- [ ] All components typed
- [ ] No code duplication
- [ ] Consistent naming
- [ ] Proper error handling

### Documentation

- [ ] User guide complete
- [ ] API docs complete
- [ ] Developer guide complete
- [ ] All routes documented
- [ ] Changelog updated

---

## Risk Management

### Potential Risks

1. **Timeline Risk**

   - **Risk:** Features take longer than estimated
   - **Mitigation:** Prioritize critical features first, defer nice-to-haves
   - **Contingency:** Extend timeline by 1 week if needed

2. **Technical Complexity**

   - **Risk:** Analytics charts or complex features harder than expected
   - **Mitigation:** Use established libraries, don't reinvent wheel
   - **Contingency:** Simplify initial version, add complexity later

3. **API Performance**

   - **Risk:** Large datasets cause slow API responses
   - **Mitigation:** Implement pagination, caching, indexes from start
   - **Contingency:** Add background jobs for heavy operations

4. **Data Migration**

   - **Risk:** Existing data structure doesn't support new features
   - **Mitigation:** Plan schema changes early, test on copy of data
   - **Contingency:** Create migration scripts, rollback plan

5. **Testing Coverage**
   - **Risk:** Not enough time for comprehensive testing
   - **Mitigation:** Test as you build, automated tests where possible
   - **Contingency:** Focus testing on critical paths, defer edge cases

---

## Daily Standup Template

**What did I complete yesterday?**

- Task X
- Task Y

**What will I work on today?**

- Task Z
- Task A

**Any blockers or concerns?**

- Issue 1
- Question about X

---

## Progress Tracking

### Week 1 Progress

- [ ] Day 1: Security & Quick Fixes
- [ ] Day 2-3: Products Page
- [ ] Day 4-5: Orders Page

### Week 2 Progress

- [ ] Day 6: Dashboard Dynamic Data
- [ ] Day 7-8: Analytics Page
- [ ] Day 9-10: Support Page

### Week 3 Progress

- [ ] Day 11-12: API Helper Migration
- [ ] Day 13: Game Stats Update
- [ ] Day 14: Naming Consistency
- [ ] Day 15: Code Review

### Week 4 Progress

- [ ] Day 16-17: Testing
- [ ] Day 18: Performance
- [ ] Day 19: Documentation
- [ ] Day 20: Deployment

---

## Appendix

### Useful Commands

```bash
# Development
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Formatting
npm run format

# Build
npm run build

# Analyze bundle
npm run analyze

# Deploy
npm run deploy
```

### Key Files Reference

**API Helpers:**

- `src/lib/api/client.ts` - apiClient (apiGet, apiPost, etc.)
- `src/lib/api/admin.ts` - Admin-specific API helpers
- `src/lib/api/seller.ts` - Seller-specific API helpers

**Components:**

- `src/components/ui/unified/` - All UnifiedComponents
- `src/components/admin/` - Admin-specific components
- `src/components/features/auth/RoleGuard.tsx` - Auth protection

**Hooks:**

- `src/hooks/useBreadcrumbTracker.ts` - Breadcrumb tracking
- `src/hooks/useAuth.ts` - Authentication hook

**Routes:**

- `src/constants/routes.ts` - All route constants

**Types:**

- `src/types/index.ts` - All TypeScript interfaces

---

_Plan Created: November 1, 2025_  
_Last Updated: November 1, 2025_  
_Estimated Completion: End of November 2025_
