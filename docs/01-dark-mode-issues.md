# Dark Mode Issues & Fixes

> **Status**: 🔴 Critical - Multiple components lack dark mode support
> **Priority**: High
> **Last Updated**: November 30, 2025

## Critical Dark Mode Issues

| Component/Module                             | Status                          | Impact                                  |
| -------------------------------------------- | ------------------------------- | --------------------------------------- |
| **Checkout Module** (4 components)           | ❌ No dark mode                 | High - Payment flow broken in dark mode |
| **DataTable**                                | ❌ No dark mode + malformed CSS | High - All table views broken           |
| **MobileDataTable**                          | ❌ No dark mode                 | High - Mobile tables broken             |
| **Admin Tables** (returns, tickets, payouts) | ❌ No dark mode                 | High - Admin pages broken in dark mode  |
| **DateTimePicker**                           | ❌ No dark mode                 | Medium - Form inputs broken             |
| **RichTextEditor**                           | ❌ No dark mode                 | Medium - Blog/Product editing broken    |
| **ToggleSwitch**                             | ❌ No dark mode                 | Low - Settings toggles broken           |
| **AdminSidebar** highlight                   | ⚠️ Partial                      | Low - Search highlight not visible      |

## Malformed CSS Classes (Bug)

The following files have malformed CSS: `hover:bg-gray-100:bg-gray-700` should be `hover:bg-gray-100 dark:hover:bg-gray-700`

| File                                     | Line |
| ---------------------------------------- | ---- |
| `src/components/common/DataTable.tsx`    | 125  |
| `src/components/common/ActionMenu.tsx`   | 63   |
| `src/components/common/InlineEditor.tsx` | 102  |
| `src/components/common/TagInput.tsx`     | 265  |

## Components with Full Dark Mode (Verified)

- ✅ All Card components (ProductCard, AuctionCard, ShopCard, CategoryCard, BlogCard, ReviewCard)
- ✅ Auth pages (Login, Register, Forgot Password, Reset Password)
- ✅ MobileFormInput, MobileFormSelect, MobileTextarea
- ✅ ConfirmDialog, SubNavbar
- ✅ SellerSidebar, AdminSidebar (except highlight)

## Fix Checklist

### Priority 1 - Critical (Week 1)

- [ ] Fix malformed CSS in DataTable.tsx, ActionMenu.tsx, InlineEditor.tsx, TagInput.tsx
- [ ] Add dark mode to DataTable component
- [ ] Add dark mode to MobileDataTable component
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
