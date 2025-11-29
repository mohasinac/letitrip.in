# Epic E035: Theme & Mobile Homepage Integration

## ⚠️ MANDATORY: Follow Project Standards

Before implementing, read **[AI Agent Development Guide](/docs/ai/AI-AGENT-GUIDE.md)**

**Key Requirements:**

- Use existing mobile components from `src/components/mobile/`
- Use `useIsMobile` hook for responsive behavior
- Use `useTheme` from ThemeContext for theme-aware styling
- Follow touch-target guidelines (48px minimum)

---

## Overview

Integrate theme system and mobile components across the homepage and layout components. This epic ensures consistent dark/light mode support and optimal mobile experience across the platform.

## Goals

1. **Theme Integration**: Ensure all homepage components support dark/light mode
2. **Mobile Optimization**: Use mobile-specific components on smaller screens
3. **SubNavbar**: Hide SubNavbar on mobile (redundant with MobileSidebar navigation)
4. **Responsive Components**: Replace desktop components with mobile variants on small screens

## Scope

### F035.1: Hide SubNavbar on Mobile

**Priority**: P0 (Critical)

The SubNavbar shows navigation icons on mobile which duplicates MobileSidebar functionality.

#### Tasks

| Task                       | Description                                    | Status |
| -------------------------- | ---------------------------------------------- | ------ |
| Hide SubNavbar on mobile   | Add `hidden lg:block` to SubNavbar wrapper     | ⬜     |
| Verify MobileSidebar works | Ensure navigation still works via sidebar      | ⬜     |
| Update tests               | Update SubNavbar tests for hidden mobile state | ⬜     |

---

### F035.2: Homepage Mobile Component Integration

**Priority**: P0 (Critical)

Replace desktop-heavy components with mobile-optimized versions.

#### Tasks

| Task                        | Description                                   | Status |
| --------------------------- | --------------------------------------------- | ------ |
| Add useIsMobile to homepage | Detect mobile viewport                        | ⬜     |
| Mobile skeleton loaders     | Use MobileSkeleton for loading states         | ⬜     |
| Touch-optimized sections    | Add proper touch targets to all sections      | ⬜     |
| Mobile-friendly grid        | Adjust grid columns for mobile (2-col vs 4+)  | ⬜     |

---

### F035.3: Theme-Aware Homepage Sections

**Priority**: P1 (High)

Ensure all homepage sections properly support dark mode.

#### Theme Classes to Apply

| Element            | Light Mode          | Dark Mode                |
| ------------------ | ------------------- | ------------------------ |
| Background         | `bg-white`          | `dark:bg-gray-900`       |
| Text Primary       | `text-gray-900`     | `dark:text-white`        |
| Text Secondary     | `text-gray-600`     | `dark:text-gray-400`     |
| Cards              | `bg-white`          | `dark:bg-gray-800`       |
| Borders            | `border-gray-200`   | `dark:border-gray-700`   |
| Value Proposition  | Gradient backgrounds| Dark-friendly gradients  |

---

## Implementation Checklist

### Phase 1: SubNavbar Hide on Mobile

- [x] Update SubNavbar to hide on mobile (`hidden lg:block`)
- [x] Verify MobileSidebar provides navigation
- [x] Update tests if needed

### Phase 2: Homepage Mobile Optimization

- [x] Add responsive grids (grid-cols-1 sm:grid-cols-2 etc.)
- [x] Mobile-friendly touch targets (min-h-[48px] touch-manipulation)
- [x] Mobile loading skeletons with dark mode
- [x] Added useIsMobile hook for conditional rendering

### Phase 3: Theme Integration

- [x] Add dark mode classes to homepage sections
- [x] Update value proposition for dark mode
- [x] Ensure cards/skeletons support dark mode

---

## Components Affected

| Component                  | Changes                                    |
| -------------------------- | ------------------------------------------ |
| `SubNavbar.tsx`            | Hide on mobile screens, dark mode support  |
| `page.tsx` (homepage)      | Mobile grids, dark mode, touch targets     |
| Dynamic section components | Dark mode support in loading states        |

---

## Testing

### Manual Testing

1. View homepage on mobile (< 768px)
2. Verify SubNavbar is hidden
3. Toggle dark mode and verify all sections render correctly
4. Test touch interactions on mobile

### Automated Tests

- Update SubNavbar tests for responsive behavior
- Add visual regression tests for dark mode

---

## Acceptance Criteria

- [x] SubNavbar hidden on mobile (< 1024px)
- [x] Homepage uses mobile-friendly grids
- [x] All sections support dark mode
- [x] Touch targets meet 48px minimum
- [x] Loading states use dark mode compatible skeletons
- [x] No duplicate navigation (SubNavbar + MobileSidebar)

---

## Related Epics

- E024: Mobile PWA Experience
- E025: Mobile Component Integration
- E027: Design System & Theming
