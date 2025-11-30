# JustForView.in - Developer Documentation

> **Last Updated**: November 30, 2025

## Quick Links

- [AI Agent Guide](./getting-started/AI-AGENT-GUIDE.md) - Instructions for AI coding agents
- [Codebase Analysis](/docs/CODEBASE-ANALYSIS.md) - Full component/page analysis

## Project Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── admin/        # Admin dashboard routes
│   ├── seller/       # Seller dashboard routes
│   ├── user/         # User dashboard routes
│   ├── api/          # API routes
│   └── ...           # Public pages
├── components/       # React components
│   ├── common/       # Shared components
│   ├── forms/        # Reusable form components
│   ├── layout/       # Layout components
│   └── ...
├── services/         # API service layer
├── constants/        # Route & config constants
├── hooks/            # Custom React hooks
├── types/            # TypeScript types
└── lib/              # Utility functions
```

## Key Patterns

### Route Constants

- **Page routes**: `src/constants/routes.ts` (PUBLIC_ROUTES, USER_ROUTES, SELLER_ROUTES, ADMIN_ROUTES)
- **API routes**: `src/constants/api-routes.ts`

### URL Strategy

- **Public/Seller URLs**: Use slugs (`/products/[slug]`, `/seller/auctions/[slug]/edit`)
- **Order references**: Use IDs (`/user/orders/[id]`)
- **Admin internal**: Can use IDs

### Components

- **SearchBar**: Uses ContentTypeFilter for content type selection (all, products, auctions, shops, categories, blog)
- **Filters**: Use UnifiedFilterSidebar for consistent filtering
- **Forms**: Use components from `src/components/forms/`

### Services

All API calls go through service layer in `src/services/`:

- `productsService`, `auctionsService`, `shopsService` - support both `getById()` and `getBySlug()`
- Services use route constants from `src/constants/api-routes.ts`
