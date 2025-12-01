# Constants Consolidation

> **Status**: ✅ Complete
> **Priority**: ✅ Complete
> **Last Updated**: January 2025

### Created Files

- `src/constants/limits.ts` - All numeric limits (pagination, products, uploads, etc.)
- `src/constants/statuses.ts` - All status enums with types, labels, and colors

### Existing Constants Files

```
src/constants/
├── api-routes.ts        # API endpoint paths
├── bulk-actions.ts      # Bulk action definitions
├── categories.ts        # Category-related constants
├── colors.ts            # Color definitions
├── comparison.ts        # Product comparison config
├── database.ts          # Firebase collection names
├── faq.ts               # FAQ content
├── filters.ts           # Filter configurations
├── footer.ts            # Footer links, languages
├── form-fields.ts       # Form field configs
├── inline-fields.ts     # Inline editing fields
├── limits.ts            # ✅ NEW - Numeric limits
├── location.ts          # India states, cities
├── media.ts             # Media upload config
├── navigation.ts        # Nav items, viewing history
├── page-texts.ts        # Static page content
├── routes.ts            # Frontend routes
├── searchable-routes.ts # Search routing
├── site.ts              # Site metadata
├── statuses.ts          # ✅ NEW - Status enums
├── storage.ts           # Storage paths
```

### Import Patterns

Due to historical naming conflicts, import from specific files:

```typescript
// Limits
import { PAGINATION, PRODUCT_LIMITS, UPLOAD_LIMITS } from "@/constants/limits";

// Statuses
import {
  ORDER_STATUS,
  PRODUCT_STATUS,
  STATUS_LABELS,
} from "@/constants/statuses";

// Routes
import { PUBLIC_ROUTES, ADMIN_ROUTES } from "@/constants/routes";
import { API_ROUTES } from "@/constants/api-routes";

// Site Info
import { SITE_NAME, CONTACT_EMAIL } from "@/constants/site";
```

---

## Implementation Checklist

### ✅ Phase 1: Create Missing Files

- [x] Create `limits.ts` with all numeric limits
- [x] Create `statuses.ts` with all status enums and types

### ✅ Phase 2: Update References

- [x] Update services to use LIMITS constants (products, auctions, blog services)
- [x] Update services to use STATUS constants (PRODUCT_STATUS, AUCTION_STATUS, BLOG_STATUS)
- [x] Replace hardcoded pagination values with PAGINATION.DEFAULT_PAGE_SIZE
- [x] Services now import from centralized constants files
