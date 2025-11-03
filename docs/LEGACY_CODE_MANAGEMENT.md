# 📦 Legacy Code Management Guide

**Purpose:** Guidelines for preserving old code while refactoring to MVC architecture

---

## 🎯 Why Preserve Legacy Code?

✅ **Rollback Safety:** Quick revert if new code has issues  
✅ **Reference:** Compare old vs new implementations  
✅ **Documentation:** Shows evolution of codebase  
✅ **Testing:** Verify new code produces same results  
✅ **Migration:** Gradual transition for clients

---

## 📁 Legacy Folder Structure

```
src/app/api/
├── _legacy/              # All legacy routes go here
│   ├── products/
│   │   ├── route.ts
│   │   └── [slug]/
│   ├── orders/
│   ├── admin/
│   ├── seller/
│   └── ...
├── products/             # New MVC routes
│   ├── route.ts
│   └── [slug]/
└── ...
```

---

## 🔄 Refactoring Workflow

### Step 1: Before Refactoring

**⚠️ ALWAYS move legacy code first!**

```bash
# Example: Moving product routes to legacy
# PowerShell commands:

# Create legacy directory structure
New-Item -ItemType Directory -Path "src/app/api/_legacy/products" -Force

# Copy current route to legacy (preserve original)
Copy-Item "src/app/api/products/route.ts" "src/app/api/_legacy/products/route.ts"
Copy-Item "src/app/api/products/[slug]/route.ts" "src/app/api/_legacy/products/[slug]/route.ts" -Recurse
```

### Step 2: Create MVC Components

1. Create model in `_lib/models/`
2. Create controller in `_lib/controllers/`
3. Refactor route to use MVC

### Step 3: Test New Implementation

1. Verify all endpoints work
2. Check TypeScript errors (should be zero)
3. Test edge cases
4. Compare responses with legacy

### Step 4: Document Changes

Add note in refactored route:

```typescript
/**
 * Product API Route - MVC Refactored
 * Legacy implementation: src/app/api/_legacy/products/route.ts
 * Refactored: [Date]
 */
```

---

## 📝 Daily Checklist

At the **start of each refactoring day**:

- [ ] **Identify routes** to refactor for the day
- [ ] **Check if legacy exists** - search for existing implementations
- [ ] **Create legacy directories** matching original structure
- [ ] **Copy files to \_legacy** before making any changes
- [ ] **Add timestamp** to legacy files (optional but helpful)
- [ ] **Document** what was moved and where

Example daily workflow:

```bash
# Day 11: Admin Product Routes
# 1. Check what exists
ls src/app/api/admin/products

# 2. Create legacy structure
New-Item -ItemType Directory -Path "src/app/api/_legacy/admin/products" -Force

# 3. Move files
Copy-Item "src/app/api/admin/products/*" "src/app/api/_legacy/admin/products/" -Recurse

# 4. Now safe to refactor!
```

---

## 🚫 What NOT to Move

Don't move these to legacy:

- ✅ **Keep in place:** `_lib/` folder (models, controllers, utils)
- ✅ **Keep in place:** Types and interfaces in `src/types/`
- ✅ **Keep in place:** Middleware and auth helpers
- ✅ **Keep in place:** Configuration files

**Only move:** Route handlers (route.ts files)

---

## 📊 Legacy Code Lifecycle

### Phase 1: Active Refactoring (Days 1-30)

- Legacy code preserved for reference
- Quick rollback available
- Both versions exist

### Phase 2: Testing Period (Days 31-60)

- New MVC code fully deployed
- Legacy code as backup
- Monitor for issues

### Phase 3: Deprecation (Days 61-90)

- New code proven stable
- Legacy code marked deprecated
- Plan removal date

### Phase 4: Cleanup (Day 90+)

- Remove legacy code
- Archive if needed
- Clean documentation

---

## 🔍 Finding Legacy Code

To check if legacy exists for a route:

```bash
# PowerShell: Search for legacy files
Get-ChildItem -Path "src/app/api/_legacy" -Recurse -Filter "*.ts" | Select-Object FullName

# Check specific route
Test-Path "src/app/api/_legacy/products/route.ts"
```

---

## 📋 Legacy Code Tracking

Keep a record of what's been moved:

### Sprint 1 (Days 1-5)

- [x] Products: `_legacy/products/` ✅
- [x] Orders: `_legacy/orders/` ✅
- [x] Users: `_legacy/user/` ✅
- [x] Categories: Not moved (will do before refactoring)
- [x] Reviews: `_legacy/reviews/` ✅

### Sprint 2 (Days 6-10)

- [x] Auth: Not needed (new routes)
- [x] Addresses: Not moved yet
- [x] Payments: Not moved yet
- [x] Cart: `_legacy/cart/` ✅

### Sprint 3 (Days 11-15)

- [ ] Admin Products: Move before Day 11
- [ ] Admin Orders: Move before Day 11
- [ ] Admin Users: Move before Day 12
- [ ] Admin Categories: Move before Day 13
- [ ] Admin Coupons: Move before Day 13
- [ ] Admin Settings: Move before Day 14

---

## 🛠️ Utility Scripts

### PowerShell Script: Move Route to Legacy

Save as `scripts/move-to-legacy.ps1`:

```powershell
param(
    [Parameter(Mandatory=$true)]
    [string]$RoutePath
)

# Example: .\scripts\move-to-legacy.ps1 "admin/products"

$sourcePath = "src/app/api/$RoutePath"
$legacyPath = "src/app/api/_legacy/$RoutePath"

if (Test-Path $sourcePath) {
    Write-Host "Moving $sourcePath to legacy..." -ForegroundColor Yellow

    # Create legacy directory
    New-Item -ItemType Directory -Path $legacyPath -Force | Out-Null

    # Copy files
    Copy-Item "$sourcePath/*" $legacyPath -Recurse -Force

    Write-Host "✓ Moved to $legacyPath" -ForegroundColor Green
    Write-Host "Original files preserved at $sourcePath" -ForegroundColor Cyan
} else {
    Write-Host "✗ Path not found: $sourcePath" -ForegroundColor Red
}
```

Usage:

```bash
# Move admin products to legacy
.\scripts\move-to-legacy.ps1 "admin/products"

# Move seller orders to legacy
.\scripts\move-to-legacy.ps1 "seller/orders"
```

---

## ⚠️ Important Reminders

### Before Every Refactoring Session:

1. **Check existing code** - What needs to be preserved?
2. **Create backup** - Copy to \_legacy folder
3. **Verify copy** - Ensure files copied correctly
4. **Then refactor** - Safe to modify original

### After Refactoring:

1. **Test thoroughly** - All endpoints working?
2. **Zero errors** - TypeScript compilation clean?
3. **Document** - Add legacy reference in comments
4. **Update checklist** - Mark as complete

---

## 📖 Best Practices

✅ **DO:**

- Copy files before any changes
- Preserve directory structure in \_legacy
- Add timestamps to legacy files (in comments)
- Keep legacy for at least 2 sprints
- Document what changed and why

❌ **DON'T:**

- Delete old code immediately
- Mix legacy and new code
- Forget to move before refactoring
- Move non-route files to \_legacy
- Remove \_legacy during active development

---

## 🎓 Example: Perfect Refactoring Flow

**Day 11: Admin Products**

```bash
# 1. Morning - Before any coding
Copy-Item "src/app/api/admin/products" "src/app/api/_legacy/admin/products" -Recurse

# 2. Add timestamp comment to legacy
# Edit _legacy/admin/products/route.ts:
# /**
#  * LEGACY CODE - Moved to _legacy on 2025-11-04
#  * Replaced with MVC architecture
#  * See: src/app/api/admin/products/route.ts (new)
#  */

# 3. Create MVC components
# - Create admin-product.model.ts
# - Create admin-product.controller.ts

# 4. Refactor route
# - Edit src/app/api/admin/products/route.ts
# - Use new model and controller
# - Add reference to legacy in comments

# 5. Test and verify
# - All endpoints work
# - Zero TypeScript errors
# - Update checklist

# 6. Document
# - Update 30_DAY_ACTION_PLAN.md
# - Mark Day 11 tasks complete
```

---

## 🔄 Rollback Procedure

If new code has issues:

```bash
# Quick rollback from legacy
Copy-Item "src/app/api/_legacy/products/*" "src/app/api/products/" -Recurse -Force

# Or compare files
code --diff "src/app/api/_legacy/products/route.ts" "src/app/api/products/route.ts"
```

---

## 📞 Need Help?

- Check `docs/NEW_ARCHITECTURE_COMPLETE.md` for MVC patterns
- Review `docs/CLEAN_API_SUMMARY.md` for refactoring examples
- See completed sprints for reference implementations

---

**Remember:** 🎯 **Legacy code is your safety net - always preserve before refactoring!**

_Last Updated: November 3, 2025_
