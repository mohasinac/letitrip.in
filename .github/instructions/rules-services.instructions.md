---
applyTo: "src/**"
description: "No direct fetch in UI, UI→Hook→Service→apiClient chain. Rules 20, 21."
---

# Service Layer Rules

## RULE 20 & 21: UI → Hook → Service → apiClient — No Shortcuts

**The chain is fixed. No layer may be skipped.**

```
Component → Hook (useApiQuery/useApiMutation) → Service fn (@/services) → apiClient → fetch
```

```typescript
// ❌ WRONG — raw fetch in component/hook
const res = await fetch("/api/products");

// ❌ WRONG — apiClient directly in a hook's queryFn
useApiQuery({ queryFn: () => apiClient.get(API_ENDPOINTS.PRODUCTS.LIST) });

// ✅ RIGHT — named service in queryFn
import { productService } from "@/services";
useApiQuery({ queryKey: ["products"], queryFn: () => productService.list() });
```

`apiClient` is ONLY allowed in `src/services/*.service.ts` and `src/features/<name>/services/*.service.ts`.  
`fetch()` is ONLY allowed inside `apiClient` itself, or in API route handlers calling external APIs.

### Service File Pattern

```typescript
// src/services/product.service.ts
import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants";

export const productService = {
  list: (params?: string) =>
    apiClient.get(
      `${API_ENDPOINTS.PRODUCTS.LIST}${params ? `?${params}` : ""}`,
    ),
  getById: (id: string) => apiClient.get(API_ENDPOINTS.PRODUCTS.GET_BY_ID(id)),
  create: (data: unknown) =>
    apiClient.post(API_ENDPOINTS.PRODUCTS.CREATE, data),
  update: (id, data) =>
    apiClient.patch(API_ENDPOINTS.PRODUCTS.UPDATE(id), data),
  delete: (id: string) => apiClient.delete(API_ENDPOINTS.PRODUCTS.DELETE(id)),
};
```

Export via `src/services/index.ts`.

### Rules

- Services MUST NOT import React, hooks, or component code
- Services MUST use `API_ENDPOINTS` from `@/constants` — never hardcode paths
- Services MUST be exported through a barrel
- One service object per domain

### Violation Quick-Reference

| Location                       | `fetch()` | `apiClient.*` | Allowed?        |
| ------------------------------ | --------- | ------------- | --------------- |
| Component / page               | ❌        | ❌            | hook only       |
| Hook queryFn                   | ❌        | ❌            | service fn only |
| Service file                   | ❌        | ✅            | ✅              |
| API route (external APIs only) | ✅        | ❌            | ✅              |

### Available Services (`@/services`) — check before adding a new one

`addressService` · `adminService` · `authEventService` · `authService` · `bidService` · `blogService` · `carouselService` · `cartService` · `categoryService` · `chatService` · `checkoutService` · `contactService` · `couponService` · `demoService` · `eventService` · `faqService` · `homepageSectionsService` · `mediaService` · `newsletterService` · `notificationService` · `orderService` · `paymentEventService` · `productService` · `profileService` · `promotionsService` · `realtimeTokenService` · `reviewService` · `ripcoinService` · `searchService` · `sellerService` · `sessionService` · `siteSettingsService` · `storeService` · `wishlistService`
