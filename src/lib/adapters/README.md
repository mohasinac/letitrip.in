# Service Adapters

Service adapters bridge the gap between pure React components in `@letitrip/react-library` and the Next.js app's service layer.

## Why Adapters?

The react-library is **framework-agnostic** and doesn't make API calls directly. Instead:

1. Library components accept service interfaces as props
2. The Next.js app provides adapters that implement these interfaces
3. Adapters use the app's existing services (which make actual API calls)

## Benefits

- ✅ Library remains pure React (no API calls, no Next.js dependencies)
- ✅ Easy to test (mock the adapter interface)
- ✅ Type-safe contracts between library and app
- ✅ Flexible - swap implementations without changing library
- ✅ Separation of concerns

## Architecture

```
┌─────────────────────────────────────┐
│  @letitrip/react-library            │
│  (Pure React Components)            │
│                                     │
│  - ProductList                      │
│  - AuctionCard                      │
│  - ShopCard                         │
│                                     │
│  Accepts: IProductService interface │
└──────────────┬──────────────────────┘
               │
               │ Props
               ▼
┌─────────────────────────────────────┐
│  Service Adapters                   │
│  (src/lib/adapters/)                │
│                                     │
│  - ProductServiceAdapter            │
│  - AuctionServiceAdapter            │
│  - ShopServiceAdapter               │
│                                     │
│  Implements: IProductService        │
└──────────────┬──────────────────────┘
               │
               │ Uses
               ▼
┌─────────────────────────────────────┐
│  App Services                       │
│  (src/services/)                    │
│                                     │
│  - products.service.ts              │
│  - auctions.service.ts              │
│  - shops.service.ts                 │
│                                     │
│  Makes: Actual API calls            │
└─────────────────────────────────────┘
```

## Available Adapters

### ProductServiceAdapter

Adapts `products.service.ts` for library ProductList, ProductCard components.

```tsx
import { productServiceAdapter } from "@/lib/adapters";
import { ProductList } from "@letitrip/react-library";

<ProductList service={productServiceAdapter} />;
```

### More adapters coming...

- AuctionServiceAdapter
- ShopServiceAdapter
- CategoryServiceAdapter
- CartServiceAdapter
- UserServiceAdapter

## Creating a New Adapter

### 1. Define the Interface

Library components need a contract:

```typescript
// In library or adapters/types.ts
export interface IAuctionService {
  getAuctions(
    params?: ListQueryParams,
  ): Promise<PaginatedResponse<AuctionCard>>;
  getAuction(slug: string): Promise<Auction>;
  placeBid(auctionId: string, amount: number): Promise<Bid>;
}
```

### 2. Create the Adapter

Implement the interface using app services:

```typescript
// src/lib/adapters/auction-adapter.ts
import { auctionsService } from "@/services/auctions.service";
import { ServiceAdapter } from "./service-adapter";
import type { IAuctionService } from "./types";

export class AuctionServiceAdapter
  extends ServiceAdapter<AuctionCard>
  implements IAuctionService
{
  async getAuctions(params?: ListQueryParams) {
    return this.execute(
      () => auctionsService.getAuctions(params),
      "Failed to fetch auctions",
    );
  }

  async getAuction(slug: string) {
    return this.execute(
      () => auctionsService.getAuction(slug),
      `Failed to fetch auction: ${slug}`,
    );
  }

  async placeBid(auctionId: string, amount: number) {
    return this.execute(
      () => auctionsService.placeBid({ auctionId, amount }),
      "Failed to place bid",
    );
  }

  protected transformResponse(data: any): AuctionCard {
    return data; // Transform if needed
  }
}

export const auctionServiceAdapter = new AuctionServiceAdapter();
```

### 3. Export from Index

```typescript
// src/lib/adapters/index.ts
export {
  AuctionServiceAdapter,
  auctionServiceAdapter,
} from "./auction-adapter";
export type { IAuctionService } from "./auction-adapter";
```

### 4. Use in Pages

```tsx
// src/app/auctions/page.tsx
import { auctionServiceAdapter } from "@/lib/adapters";
import { AuctionList } from "@letitrip/react-library";

export default function AuctionsPage() {
  return <AuctionList service={auctionServiceAdapter} />;
}
```

## BaseServiceAdapter Features

All adapters extend `ServiceAdapter` which provides:

- ✅ Loading state management
- ✅ Error handling
- ✅ Retry logic
- ✅ Callbacks (onSuccess, onError, onLoadingChange)
- ✅ Type safety

### Options

```typescript
const adapter = new ProductServiceAdapter({
  throwOnError: true, // Throw errors or handle silently
  retryAttempts: 2, // Retry failed requests
  onError: (error) => console.error(error),
  onSuccess: (data) => console.log("Success!", data),
  onLoadingChange: (loading) => console.log("Loading:", loading),
});
```

## Testing

Mock adapters for testing library components:

```tsx
// Mock adapter for tests
const mockProductService: IProductService = {
  getProducts: jest.fn().mockResolvedValue({
    data: [
      /* mock products */
    ],
    pagination: {
      /* mock pagination */
    },
  }),
  getProduct: jest.fn(),
  // ...other methods
};

// Test library component
<ProductList service={mockProductService} />;
```

## Best Practices

1. **One adapter per service** - Keep it simple
2. **Type everything** - Use interfaces and types
3. **Handle errors** - Use try/catch and provide clear messages
4. **Keep it thin** - Adapters just adapt, don't add business logic
5. **Export singletons** - For convenience (but allow custom instances)
6. **Document methods** - Clear JSDoc comments

## Migration Strategy

When migrating pages to use library components:

1. **Create the adapter** if it doesn't exist yet
2. **Import in page** along with library component
3. **Pass as prop** to library component
4. **Remove old code** that made direct API calls

```tsx
// Before (old code)
const { data } = useQuery(["products"], () =>
  fetch("/api/products").then((r) => r.json()),
);

// After (using adapter)
import { productServiceAdapter } from "@/lib/adapters";
import { ProductList } from "@letitrip/react-library";

<ProductList service={productServiceAdapter} />;
```

---

_Last Updated: January 19, 2026_
