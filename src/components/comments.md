# Components - Implementation Notes

## ⚠️ MIGRATION NOTICE (January 16, 2026)

**82/84 components (98%) migrated to `@letitrip/react-library`**

Before creating new components, check if they already exist in the library:

**Migrated Components** (82 files):
- Tables & Data Display: DataTable, ResponsiveTable, TableCheckbox, BulkActionBar, InlineEditRow, QuickCreateRow, InlineEditor, ActionMenu, StatusBadge, Skeleton, EmptyState, ErrorState, PageState (13 files)
- Filters & Search: UnifiedFilterSidebar, FilterSidebar, MobileFilterSidebar, SearchBar, FilterBar, CollapsibleFilter, SearchInput, SearchableDropdown, ContentTypeFilter, MobileFilterDrawer + specialized filters (19 files)
- Pagination: AdvancedPagination, SimplePagination, CursorPagination (3 files)
- Form Components: FormField, FormInput, FormTextarea, FormSelect, FormCheckbox, FormRadio, FormFileUpload, FormNumberInput, FormRichText, FormKeyValueInput, FormListInput, RichTextEditor, DateTimePicker, SlugInput, TagInput, PincodeInput, LinkInput, etc. (28+ files)
- Selectors: CategorySelector, AddressSelectorWithCreate, ContactSelectorWithCreate, TagSelectorWithCreate, ProductVariantSelector, LanguageSelector, StateSelector, PeriodSelector, DocumentSelectorWithUpload (9 files)
- UI Components: Button, Card, Toast, Accessibility, ConfirmDialog, DynamicIcon, ErrorMessage, FavoriteButton, FieldError, GPSButton, HorizontalScrollContainer, InlineImageUpload, MobileInput, MobileStickyBar, OptimizedImage, PaymentLogo, PendingUploadsWarning, SmartLink, StatCard, ThemeToggle, UploadProgress (22 files)
- Wrappers: ResourceDetailWrapper, ResourceListWrapper, SettingsSection, SmartAddressForm (4 files)
- Media Upload: ImageUploadWithCrop, VideoUploadWithThumbnail (2 files)

**Remaining in Main App** (Next.js-specific components):
- Layout components (Header, Footer, Sidebar)
- Page-specific components
- Components using Next.js Image, Link, Router
- Components tightly coupled to Firebase/Context

**Guidelines**:
1. **Import from library**: `import { Button, DataTable } from '@letitrip/react-library'`
2. **New components**: If framework-agnostic → Add to library, else keep in main
3. **Avoid duplication**: Always check library first

---

## Code Splitting ✅

### Dynamic Imports Implemented

The following non-critical components are dynamically imported to reduce initial bundle size:

1. **Context Providers** (from `src/components/providers/DynamicProviders.tsx`):

   - `ComparisonProvider` - Product comparison functionality
   - `ViewingHistoryProvider` - User viewing history tracking
   - `LoginRegisterProvider` - Login/register modal state
   - **Impact**: These providers are loaded client-side only (`ssr: false`), reducing server bundle size
   - **Loading**: No loading state needed as these are providers without UI

2. **Build System**:
   - Bundle analyzer configured in `next.config.js`
   - Optimized package imports for: lucide-react, recharts, react-quill, date-fns, @dnd-kit/\*
   - Chunk splitting by vendor (React, Firebase, UI libraries, DnD kit)
   - Runtime chunk separation for better caching

### Benefits

- Reduced initial page load by splitting non-critical providers
- Better code splitting with vendor chunks
- Optimized tree-shaking for common libraries
- Client-side only loading for interactive features

### Future Opportunities

Additional components that could benefit from code splitting:

- Rich text editor components (react-quill) - already tree-shaken
- Chart/visualization components (recharts) - already tree-shaken
- Admin panel heavy components
- Modal dialogs with complex forms
