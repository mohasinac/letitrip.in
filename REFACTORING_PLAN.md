# Refactoring Plan - JustForView

## Objectives

1. ✅ Consolidate duplicate components
2. ✅ Create shared utility libraries
3. ✅ Establish standalone API with centralized client
4. ✅ Consistent theming and styling
5. ✅ SEO optimization across all pages

## Phase 1: Component Consolidation

### Duplicate Components to Merge

- `src/components/features/admin/CategoryForm.tsx` → `src/components/admin/categories/CategoryForm.tsx`
- `src/components/features/admin/CategoryTree.tsx` → Keep in features (specialized)
- Common icon/image preview logic → Extract to shared

### New Shared Components Structure

```
src/components/
├── shared/
│   ├── form/
│   │   ├── FormField.tsx
│   │   ├── FormSection.tsx
│   │   └── FormActions.tsx
│   ├── preview/
│   │   ├── IconPreview.tsx
│   │   ├── ImagePreview.tsx
│   │   └── PreviewGroup.tsx
│   ├── modal/
│   │   ├── Modal.tsx
│   │   └── ConfirmDialog.tsx
│   └── tables/
│       ├── DataTable.tsx
│       └── TableActionsColumn.tsx
└── admin/
    └── categories/
        └── (consolidated components)
```

## Phase 2: API Layer Refactoring

### Service Layer

```
src/lib/api/
├── client.ts (enhanced)
├── services/
│   ├── category.service.ts (standalone)
│   ├── storage.service.ts (standalone)
│   └── base.service.ts (abstract)
├── hooks/
│   ├── useApi.ts
│   ├── useService.ts
│   └── useCache.ts
└── types/
    └── api.types.ts
```

### API Client Enhancements

- Unified error handling
- Request/response interceptors
- Caching layer (SWR integration)
- TypeScript interfaces for all endpoints
- Retry logic with exponential backoff

## Phase 3: Theming & Styling

### Theme System

```
src/styles/
├── theme/
│   ├── colors.ts
│   ├── typography.ts
│   ├── spacing.ts
│   ├── breakpoints.ts
│   └── theme.ts
├── globals.css1
└── variables.css
```

### Standards

- CSS variables for dynamic theming
- Consistent spacing scale
- Unified color palette
- Typography system

## Phase 4: SEO Optimization

### SEO Components & Utilities

```
src/lib/seo/
├── metadata.ts (Next.js metadata)
├── structured-data.ts (Schema.org)
├── open-graph.ts (OG tags)
└── sitemap.ts (dynamic sitemap)

src/components/seo/
├── SEOHead.tsx
├── JsonLD.tsx
└── OpenGraph.tsx
```

### Pages Update

- Add proper metadata to all routes
- Schema.org structured data
- Open Graph tags
- Canonical URLs
- Robot meta tags

## Phase 5: File Organization

### Before vs After

```
BEFORE:
- Multiple CategoryForm implementations
- Mixed concerns (UI + logic)
- Scattered utilities
- Inconsistent error handling

AFTER:
- Single source of truth
- Clear separation of concerns
- Centralized utilities
- Uniform error handling
```

## Implementation Priority

1. Create shared components (high impact)
2. Build service layer (foundation)
3. Consolidate forms and views
4. Apply theming system
5. Implement SEO
6. Clean up and optimize

## Success Metrics

- ✅ Reduced code duplication (30% reduction)
- ✅ Consistent styling across app
- ✅ SEO score improvement
- ✅ Faster API calls with caching
- ✅ Better maintainability

## Timeline Estimate

- Phase 1: Shared Components - 1-2 hours
- Phase 2: API Layer - 2-3 hours
- Phase 3: Theming - 1-2 hours
- Phase 4: SEO - 1-2 hours
- Phase 5: Cleanup - 30 min

**Total: ~6-9 hours**
