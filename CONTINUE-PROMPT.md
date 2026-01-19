# 🤖 Continue Implementation Prompt

Copy and paste this prompt to continue the e-commerce implementation:

---

## 📋 Context

We're building a production-ready e-commerce platform with auctions, multi-vendor shops, and complete user flows using Next.js 16 + React 19 + TypeScript + React Library (115+ components).

**Current State:**

- React library with 115+ components ready
- Minimal Next.js app (only homepage exists)
- No API routes implemented yet
- Clean slate for proper architecture

**Documentation:**

- **Master Plan:** `./IMPLEMENTATION-PLAN.md` (18-day roadmap)
- **Progress Tracker:** `./IMPLEMENTATION-PROGRESS.md` (real-time updates)
- **React Library:** `./react-library/README.md` & `./react-library/docs/`

---

## 🎯 Your Task

**Continue implementing the e-commerce platform following the plan.**

### Rules:

1. ✅ **Read Progress First:** Check `IMPLEMENTATION-PROGRESS.md` to see what's completed
2. ✅ **Follow the Plan:** Implement tasks in order from `IMPLEMENTATION-PLAN.md`
3. ✅ **Update Progress:** Mark tasks complete in `IMPLEMENTATION-PROGRESS.md` as you go
4. ✅ **Reuse Components:** Use react-library components first (MediaGallery, ResourceListing, HorizontalScroller, etc.)
5. ✅ **Mobile-First:** All pages must be mobile responsive
6. ✅ **Dark Mode:** All components must support dark mode
7. ✅ **No Mocks:** We have APIs ready, don't use mock data
8. ✅ **Code Only:** Focus on implementation, not documentation
9. ✅ **Real-Time Updates:** Update progress tracker after each file creation

---

## 📦 Current Phase Focus

Check `IMPLEMENTATION-PROGRESS.md` → "Current Focus" section to see what to work on next.

**If Phase 1 is not complete:**
Start with Phase 1 (Foundation) - Create providers, constants, utilities, UI atoms, and layout components.

**If Phase 1 is complete:**
Move to the next incomplete phase based on priority.

---

## 🔧 Implementation Guidelines

### When Creating Files:

1. **Constants First** (`src/constants/`)

   - routes.ts - All app routes
   - api-endpoints.ts - API paths
   - statuses.ts - Enums
   - categories.ts - Category data

2. **Utilities Second** (`src/lib/`)

   - firebase.ts - Config
   - api-client.ts - API wrapper
   - utils.ts - Helpers

3. **UI Atoms Third** (`src/components/ui/atoms/`)

   - Typography.tsx - H1-H6, P, Text
   - Container.tsx - Layouts
   - Link.tsx - Link wrapper

4. **Layout Fourth** (`src/components/layout/`)

   - Header.tsx
   - Footer.tsx
   - MobileNavigation.tsx

5. **Pages Last** (`src/app/`)
   - Follow route structure from plan
   - Import react-library components
   - Use UI atoms for markup

### Component Import Pattern:

```tsx
// From react-library (generic components)
import {
  MediaGallery,
  ResourceListing,
  SimilarItems,
} from "@letitrip/react-library";

// From UI atoms (custom styling)
import { H1, H2, P, Container, Section } from "@/components/ui/atoms";

// From layout
import { Header, Footer } from "@/components/layout";

// Next.js
import Image from "next/image";
import Link from "next/link";
```

### Mobile-First Responsive Pattern:

```tsx
// Always start with mobile, then add breakpoints
<div className="
  flex flex-col gap-4           /* Mobile: vertical stack */
  md:flex-row md:gap-6          /* Tablet: horizontal */
  lg:gap-8                      /* Desktop: larger gaps */
">
```

### Dark Mode Pattern:

```tsx
// Always include dark mode classes
<div className="
  bg-white text-gray-900        /* Light mode */
  dark:bg-gray-900 dark:text-white  /* Dark mode */
">
```

---

## ✅ Task Completion Checklist

After creating each file:

- [ ] File follows TypeScript strict mode
- [ ] Imports are correct
- [ ] Mobile responsive (test at 375px)
- [ ] Dark mode supported
- [ ] Uses react-library components where possible
- [ ] Uses UI atoms for typography/layout
- [ ] Mark task complete in `IMPLEMENTATION-PROGRESS.md`

---

## 📊 Progress Update Format

After each file creation, update `IMPLEMENTATION-PROGRESS.md`:

1. Change `- [ ]` to `- [x]` for completed task
2. Update phase completion count: `(X/Y)`
3. Update phase progress percentage
4. Update phase status emoji if phase completed
5. Update "Current Focus" section
6. Add any issues to "Known Issues"

---

## 🚀 Start Command

```
Read IMPLEMENTATION-PROGRESS.md, identify next incomplete task in current phase, and implement it. Update progress tracker when done.
```

---

## 💬 Example Interaction

**AI:**
"Reading IMPLEMENTATION-PROGRESS.md... Current phase is Phase 1.1 (Project Setup). Next task: Create src/app/providers.tsx"

[Creates the file with proper imports and providers]

"Created providers.tsx with QueryClientProvider, AuthProvider, CartProvider, and ThemeProvider. Updating progress tracker..."

[Updates IMPLEMENTATION-PROGRESS.md to mark task complete]

"Task complete. Next task: Create src/constants/routes.ts"

---

## 🎯 Success Criteria

Each phase is complete when:

- ✅ All files in phase are created
- ✅ No TypeScript errors
- ✅ Mobile responsive tested
- ✅ Dark mode works
- ✅ Progress tracker updated
- ✅ Can move to next phase

---

## 📝 Notes

- Don't create summary docs after each change
- Focus on working code, not explanations
- Keep responses concise
- Update progress tracker religiously
- Test as you build
- Ask if blocked or unclear

---

**Ready? Let's build! 🚀**
