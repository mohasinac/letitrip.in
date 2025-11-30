# Dark Mode Issues & Fixes

> **Status**: 🟡 In Progress - Malformed CSS fixed, Tables now have dark mode
> **Priority**: High
> **Last Updated**: November 30, 2025

## Critical Dark Mode Issues

| Component/Module                             | Status          | Impact                                  |
| -------------------------------------------- | --------------- | --------------------------------------- |
| **Checkout Module** (4 components)           | ❌ No dark mode | High - Payment flow broken in dark mode |
| **DataTable**                                | ✅ Fixed        | Dark mode + malformed CSS fixed         |
| **MobileDataTable**                          | ✅ Fixed        | Dark mode added                         |
| **ActionMenu**                               | ✅ Fixed        | Dark mode + malformed CSS fixed         |
| **InlineEditor**                             | ✅ Fixed        | Dark mode + malformed CSS fixed         |
| **TagInput**                                 | ✅ Fixed        | Dark mode + malformed CSS fixed         |
| **Admin Tables** (returns, tickets, payouts) | ❌ No dark mode | High - Admin pages broken in dark mode  |
| **DateTimePicker**                           | ❌ No dark mode | Medium - Form inputs broken             |
| **RichTextEditor**                           | ❌ No dark mode | Medium - Blog/Product editing broken    |
| **ToggleSwitch**                             | ❌ No dark mode | Low - Settings toggles broken           |
| **AdminSidebar** highlight                   | ⚠️ Partial      | Low - Search highlight not visible      |

## Malformed CSS Classes (Bug) - ✅ FIXED (Session 16)

~~The following files had malformed CSS.~~ All fixed:

- ✅ `src/components/common/DataTable.tsx` - Fixed
- ✅ `src/components/common/ActionMenu.tsx` - Fixed
- ✅ `src/components/common/InlineEditor.tsx` - Fixed
- ✅ `src/components/common/TagInput.tsx` - Fixed

## Components with Full Dark Mode (Verified)

- ✅ All Card components (ProductCard, AuctionCard, ShopCard, CategoryCard, BlogCard, ReviewCard)
- ✅ Auth pages (Login, Register, Forgot Password, Reset Password)
- ✅ MobileFormInput, MobileFormSelect, MobileTextarea
- ✅ ConfirmDialog, SubNavbar
- ✅ SellerSidebar, AdminSidebar (except highlight)
- ✅ DataTable (Session 16)
- ✅ MobileDataTable (Session 16)
- ✅ ActionMenu (Session 16)
- ✅ InlineEditor (Session 16)
- ✅ TagInput (Session 16)

## Fix Checklist

### Priority 1 - Critical (Week 1) - ✅ COMPLETE

- [x] Fix malformed CSS in DataTable.tsx, ActionMenu.tsx, InlineEditor.tsx, TagInput.tsx
- [x] Add dark mode to DataTable component
- [x] Add dark mode to MobileDataTable component
- [ ] Add dark mode to checkout components (AddressForm, AddressSelector, PaymentMethod, ShopOrderSummary)

### Priority 2 - High (Week 2)

- [ ] Add dark mode to admin table views (returns, tickets, payouts)
- [ ] Add dark mode to DateTimePicker
- [ ] Add dark mode to RichTextEditor

### Priority 3 - Medium (Week 3)

- [ ] Add dark mode to ToggleSwitch
- [ ] Fix AdminSidebar search highlight visibility
- [ ] Audit all remaining components for dark mode

## Dark Mode CSS Pattern

Use this pattern for all components:

```tsx
// Background colors
className = "bg-white dark:bg-gray-800";

// Text colors
className = "text-gray-900 dark:text-white";
className = "text-gray-600 dark:text-gray-400";

// Border colors
className = "border-gray-200 dark:border-gray-700";

// Hover states
className = "hover:bg-gray-100 dark:hover:bg-gray-700";

// Focus states
className = "focus:ring-blue-500 dark:focus:ring-blue-400";
```

## Testing Instructions

1. Toggle dark mode using ThemeToggle in header
2. Navigate to each affected page
3. Verify all text is readable
4. Verify all interactive elements have proper hover/focus states
5. Verify form inputs have proper contrast
