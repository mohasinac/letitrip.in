# 📚 Documentation Index for AI Agents

**Welcome, AI Agent!** Use this guide to navigate the project documentation efficiently.

---

## 🚀 Start Here

### For First-Time AI Agents:

1. **Read:** [`AI_AGENT_PROJECT_GUIDE.md`](./AI_AGENT_PROJECT_GUIDE.md) ⭐ **MUST READ**

   - Complete architecture overview
   - Development patterns with examples
   - Component usage matrix
   - Quick reference guide
   - Common pitfalls to avoid

2. **Check:** [`PENDING_TASKS.md`](./PENDING_TASKS.md) ⭐ **YOUR WORK QUEUE**

   - Current pending tasks (priority sorted)
   - High/medium/low priority breakdown
   - Component completion status
   - Quick priority guide

3. **Reference:** [`FEATURE_IMPLEMENTATION_CHECKLIST.md`](./FEATURE_IMPLEMENTATION_CHECKLIST.md)
   - Detailed historical documentation
   - Complete API specifications
   - Granular task tracking
   - Phase-by-phase breakdown

---

## 📖 Specialized Guides

### Component & Feature Guides

- **[`MEDIA_COMPONENTS_GUIDE.md`](./MEDIA_COMPONENTS_GUIDE.md)**

  - Media upload, editing, gallery
  - Image editor, video recorder, camera capture
  - Complete integration examples

- **[`SERVICE_LAYER_ARCHITECTURE.md`](./SERVICE_LAYER_ARCHITECTURE.md)**

  - Service layer patterns
  - Client-side API wrappers
  - Error handling, type safety

- **[`SERVICE_LAYER_QUICK_REF.md`](./SERVICE_LAYER_QUICK_REF.md)**

  - Quick reference for all services
  - Usage examples
  - Common patterns

- **[`FILTER_AND_UPLOAD_GUIDE.md`](./FILTER_AND_UPLOAD_GUIDE.md)**

  - Filter sidebar usage
  - Upload queue management
  - State management patterns

- **[`PHASE_2.7_FILTER_COMPONENTS.md`](./PHASE_2.7_FILTER_COMPONENTS.md)**
  - All 9 filter components
  - Integration guide
  - Usage examples

### Phase Completion Summaries

- **[`PHASE_2.8_QUICK_REF.md`](./PHASE_2.8_QUICK_REF.md)** - Service layer quick reference
- **[`PHASE_3.2_QUICK_REF.md`](./PHASE_3.2_QUICK_REF.md)** - Database integration
- **[`PHASE_3.4_QUICK_REF.md`](./PHASE_3.4_QUICK_REF.md)** - Product management

---

## 🎯 Quick Navigation by Task Type

### I need to create a **Page**:

1. Read: [AI_AGENT_PROJECT_GUIDE.md](./AI_AGENT_PROJECT_GUIDE.md) → "Development Patterns" → "Page Component Pattern"
2. Check: [PENDING_TASKS.md](./PENDING_TASKS.md) for required components
3. Use: Phase 2 components (DataTable, FilterSidebar, etc.)
4. Follow: Service layer for data fetching

### I need to create a **Form**:

1. Read: [AI_AGENT_PROJECT_GUIDE.md](./AI_AGENT_PROJECT_GUIDE.md) → "Development Patterns" → "Form Component Pattern"
2. Use: SlugInput, RichTextEditor, MediaUploader, CategorySelector, TagInput, DateTimePicker
3. Reference: [MEDIA_COMPONENTS_GUIDE.md](./MEDIA_COMPONENTS_GUIDE.md) for media handling
4. Validate: React Hook Form + Zod schemas from `/src/lib/validation/`

### I need to create an **API Route**:

1. Read: [AI_AGENT_PROJECT_GUIDE.md](./AI_AGENT_PROJECT_GUIDE.md) → "Development Patterns" → "API Route Pattern"
2. Import: Firebase Admin from `/src/app/api/lib/firebase/admin.ts`
3. Use: Constants from `/src/constants/database.ts`
4. Follow: Role-based filtering (admin sees all, seller sees own)
5. Reference: [FEATURE_IMPLEMENTATION_CHECKLIST.md](./FEATURE_IMPLEMENTATION_CHECKLIST.md) → "Unified API Architecture"

### I need to implement **Filters**:

1. Read: [FILTER_AND_UPLOAD_GUIDE.md](./FILTER_AND_UPLOAD_GUIDE.md)
2. Reference: [PHASE_2.7_FILTER_COMPONENTS.md](./PHASE_2.7_FILTER_COMPONENTS.md)
3. Use: FilterSidebar + [Resource]Filters + useFilters hook
4. Pattern: URL sync, localStorage persistence, active filter count

### I need to implement **Media Upload**:

1. Read: [MEDIA_COMPONENTS_GUIDE.md](./MEDIA_COMPONENTS_GUIDE.md)
2. Use: MediaUploader, ImageEditor, VideoRecorder, CameraCapture
3. Context: UploadContext for queue management
4. Components: UploadProgress, PendingUploadsWarning (auto-included)

### I need to implement **RBAC**:

1. Read: [AI_AGENT_PROJECT_GUIDE.md](./AI_AGENT_PROJECT_GUIDE.md) → "Role-Based Access Control"
2. Use: `/src/lib/rbac.ts` utilities
3. Pattern: guest < user < seller < admin
4. Remember: Admin uses same `/seller/*` routes with elevated permissions

---

## 🔍 Finding Specific Information

### Architecture Questions:

- **"How does the database work?"** → [AI_AGENT_PROJECT_GUIDE.md](./AI_AGENT_PROJECT_GUIDE.md) → "Database Architecture"
- **"What's the URL routing convention?"** → [AI_AGENT_PROJECT_GUIDE.md](./AI_AGENT_PROJECT_GUIDE.md) → "URL Routing Conventions"
- **"How do I handle authentication?"** → [AI_AGENT_PROJECT_GUIDE.md](./AI_AGENT_PROJECT_GUIDE.md) → "Role-Based Access Control"

### Component Questions:

- **"Which components should I use?"** → [AI_AGENT_PROJECT_GUIDE.md](./AI_AGENT_PROJECT_GUIDE.md) → "Component Usage Matrix"
- **"How do I use DataTable?"** → [AI_AGENT_PROJECT_GUIDE.md](./AI_AGENT_PROJECT_GUIDE.md) → "Development Patterns"
- **"How do I implement filters?"** → [FILTER_AND_UPLOAD_GUIDE.md](./FILTER_AND_UPLOAD_GUIDE.md)
- **"How do I upload media?"** → [MEDIA_COMPONENTS_GUIDE.md](./MEDIA_COMPONENTS_GUIDE.md)

### Task Questions:

- **"What should I work on next?"** → [PENDING_TASKS.md](./PENDING_TASKS.md) → "Quick Priority Guide"
- **"What's the status of Phase X?"** → [PENDING_TASKS.md](./PENDING_TASKS.md) → Phase section
- **"What APIs exist?"** → [FEATURE_IMPLEMENTATION_CHECKLIST.md](./FEATURE_IMPLEMENTATION_CHECKLIST.md) → "Unified API Architecture"

### Service Layer Questions:

- **"How do I call APIs?"** → [SERVICE_LAYER_ARCHITECTURE.md](./SERVICE_LAYER_ARCHITECTURE.md)
- **"What services exist?"** → [SERVICE_LAYER_QUICK_REF.md](./SERVICE_LAYER_QUICK_REF.md)
- **"How do I handle errors?"** → [SERVICE_LAYER_ARCHITECTURE.md](./SERVICE_LAYER_ARCHITECTURE.md) → "Error Handling"

---

## ⚠️ Common Pitfalls (READ THIS!)

From [AI_AGENT_PROJECT_GUIDE.md](./AI_AGENT_PROJECT_GUIDE.md):

1. ❌ **Don't recreate Phase 2 components** - Always reuse existing components
2. ❌ **Don't use mocks** - Always fetch real data from APIs
3. ❌ **Don't hardcode collection names** - Use constants from database.ts
4. ❌ **Don't import Firebase Admin in client** - Only in API routes
5. ❌ **Don't use IDs in URLs** - Use slugs for shops/products/categories
6. ❌ **Don't create duplicate admin routes** - Use seller routes with role checks
7. ❌ **Don't forget loading states** - Show spinners/skeletons while loading
8. ❌ **Don't forget error handling** - Show user-friendly error messages
9. ❌ **Don't forget empty states** - Show EmptyState when no data
10. ❌ **Don't forget validation** - Use Zod schemas from lib/validation

---

## 📊 Project Status at a Glance

| Phase                         | Status  | Key Components                                  |
| ----------------------------- | ------- | ----------------------------------------------- |
| **Phase 1: Static Pages**     | ✅ 100% | FAQ, Legal, SEO                                 |
| **Phase 2: Components**       | ✅ 100% | DataTable, Filters, Media, Cards                |
| **Phase 3: Seller Dashboard** | 🔄 60%  | Shops ✅, Products 🔄, Coupons 🔄, Analytics ❌ |
| **Phase 4: Auctions**         | ⏳ 20%  | APIs ✅, Live Bidding ❌, Automation ❌         |
| **Phase 5: Admin**            | ⏳ 10%  | Layout ❌, Users ❌, Categories API ✅          |
| **Phase 6: Shopping**         | ⏳ 15%  | Cart ❌, Checkout ❌, Product Pages ❌          |

**Next Priority:** Complete Phase 3.3 (My Shops Management) - See [PENDING_TASKS.md](./PENDING_TASKS.md)

---

## 🚀 Workflow for AI Agents

### Step-by-Step Implementation Process:

1. **Pick a Task**

   - Go to [`PENDING_TASKS.md`](./PENDING_TASKS.md)
   - Start from "HIGH PRIORITY" section
   - Check if dependencies are complete

2. **Understand Context**

   - Read [`AI_AGENT_PROJECT_GUIDE.md`](./AI_AGENT_PROJECT_GUIDE.md) section related to task
   - Check if components/APIs exist (most Phase 2 components are done ✅)
   - Review patterns and examples

3. **Implement**

   - Follow established patterns (see examples in guide)
   - Reuse Phase 2 components (NEVER recreate)
   - Use service layer for API calls
   - Handle loading/error/empty states

4. **Test**

   - Verify functionality
   - Check all user roles (guest, user, seller, admin)
   - Test edge cases
   - Ensure responsive design

5. **Update Documentation**
   - Mark task as complete in [`PENDING_TASKS.md`](./PENDING_TASKS.md)
   - Update status in [`FEATURE_IMPLEMENTATION_CHECKLIST.md`](./FEATURE_IMPLEMENTATION_CHECKLIST.md)
   - Add any new insights to [`AI_AGENT_PROJECT_GUIDE.md`](./AI_AGENT_PROJECT_GUIDE.md)

---

## 📞 Key Files Quick Reference

```
CHECKLIST/
├── 📖 README.md (this file) - Navigation guide
├── 🎯 PENDING_TASKS.md - Work queue (start here!)
├── 🏗️ AI_AGENT_PROJECT_GUIDE.md - Architecture & patterns (MUST READ!)
├── 📋 FEATURE_IMPLEMENTATION_CHECKLIST.md - Detailed specs
├── 📸 MEDIA_COMPONENTS_GUIDE.md - Media handling guide
├── 🔌 SERVICE_LAYER_ARCHITECTURE.md - API wrapper patterns
├── ⚡ SERVICE_LAYER_QUICK_REF.md - Service quick reference
├── 🔍 FILTER_AND_UPLOAD_GUIDE.md - Filters & uploads
└── 📦 PHASE_*.md - Phase completion summaries
```

---

## 💡 Pro Tips

1. **Always Start with Phase 2 Components** - They're production-ready and tested
2. **Follow the Patterns** - Consistency > creativity in this project
3. **No Mocks Ever** - Real APIs exist, use them
4. **Slug-First URLs** - SEO-friendly routes (shops, products, categories)
5. **Role-Based Everything** - Always consider guest/user/seller/admin perspectives
6. **Test All Roles** - Same route, different permissions for each role

---

## 🎓 Learning Resources

### New to the Project?

1. Read [`AI_AGENT_PROJECT_GUIDE.md`](./AI_AGENT_PROJECT_GUIDE.md) (30-45 min read)
2. Explore Phase 2 components in `/src/components/common/`
3. Check existing pages in `/src/app/seller/` for patterns
4. Review API routes in `/src/app/api/` for backend patterns

### Ready to Code?

1. Pick HIGH PRIORITY task from [`PENDING_TASKS.md`](./PENDING_TASKS.md)
2. Follow patterns from [`AI_AGENT_PROJECT_GUIDE.md`](./AI_AGENT_PROJECT_GUIDE.md)
3. Implement using Phase 2 components
4. Test and update documentation

---

**Last Updated:** November 8, 2025  
**Maintained By:** AI Agents + Human Developers

**Questions?** Check the guide sections above or dive into specific documentation files!
