# AI Agent Guide

> **Last Updated**: November 30, 2025

## Quick Reference for AI Coding Agents

### Before Making Changes

1. Read existing code patterns before editing
2. Check `src/constants/routes.ts` for route constants
3. Check `src/constants/api-routes.ts` for API endpoints
4. Use existing services from `src/services/`

### Code Style

#### URLs/Routes

- **Public URLs**: Use slugs for SEO (`/products/[slug]`, `/auctions/[slug]`)
- **Seller URLs**: Use slugs for resources (`/seller/auctions/[slug]/edit`)
- **API calls**: Use service methods (`auctionsService.getBySlug(slug)`)

#### Components

- Use `ContentTypeFilter` for content type selection (replaces category dropdown in SearchBar)
- Use `UnifiedFilterSidebar` for filtering
- Use components from `src/components/forms/` for forms

#### Services

```typescript
// ✅ Correct - use service with slug
const auction = await auctionsService.getBySlug(params.slug);

// ✅ Correct - use route constants for links
import { SELLER_ROUTES } from '@/constants/routes';
href={SELLER_ROUTES.AUCTION_EDIT(auction.slug)}
```

### Key Files

| Purpose         | Location                                    |
| --------------- | ------------------------------------------- |
| Page routes     | `src/constants/routes.ts`                   |
| API routes      | `src/constants/api-routes.ts`               |
| Form components | `src/components/forms/`                     |
| Services        | `src/services/`                             |
| Types           | `src/types/frontend/`, `src/types/backend/` |

### Recent Changes (November 2025)

1. **SearchBar refactored**: Now uses `ContentTypeFilter` instead of category dropdown
2. **Slug-based routing**: Seller auctions route changed from `[id]` to `[slug]`
3. **Review types**: Added `productSlug` field for slug-based product links

### Don't Do

- ❌ Don't use mocks - APIs are ready
- ❌ Don't create documentation files unless asked
- ❌ Don't use `getById()` for public/seller URLs - use `getBySlug()`
- ❌ Don't hardcode API paths - use constants from `api-routes.ts`
