---
applyTo: "src/**"
description: "No direct fetch in UI, 2-hop: reads use Hook→apiClient, mutations use Hook→Action. Rules 20, 21."
---

# Data-Fetching Rules

## RULE 20 & 21: 2-Hop Architecture — Hook → apiClient (reads) · Hook → Action (mutations)

Use package clients directly. Do not add or revive app-local service layers for reusable logic.

### Reads (useQuery)

```
Component → TanStack Query hook (useQuery) → apiClient → API Route
```

`apiClient` is called **directly inside `queryFn`** in hooks (`src/hooks/` or `src/features/<name>/hooks/`).

```typescript
// ✅ RIGHT — apiClient directly in hook queryFn
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@mohasinac/http";
import { API_ENDPOINTS } from "@/constants";

export function useProducts(params?: string) {
  return useQuery({
    queryKey: ["products", params ?? ""],
    queryFn: () =>
      apiClient.get(API_ENDPOINTS.PRODUCTS.LIST + (params ? `?${params}` : "")),
    staleTime: 5 * 60 * 1000,
  });
}

// ❌ WRONG — raw fetch in component or hook
const res = await fetch("/api/products");

// ❌ WRONG — apiClient in a component (not a hook)
function ProductList() {
  const data = apiClient.get(API_ENDPOINTS.PRODUCTS.LIST); // NO
}
```

### Mutations (useMutation)

```
Component → useMutation → Server Action (@/actions)
```

Mutations **never** call `apiClient` — only Server Actions.

```typescript
// ✅ RIGHT — mutation calls a Server Action
import { useMutation } from "@tanstack/react-query";
import { createProductAction } from "@/actions";

export function useCreateProduct() {
  return useMutation({ mutationFn: createProductAction });
}

// ❌ WRONG — mutation calling apiClient directly
return useMutation({
  mutationFn: (data) => apiClient.post(API_ENDPOINTS.PRODUCTS.CREATE, data),
});
```

### Where apiClient is allowed

| Location                                                            | Allowed? |
| ------------------------------------------------------------------- | -------- |
| `src/hooks/*.ts` — `queryFn` inside `useQuery` only                 | ✅       |
| `src/features/<name>/hooks/*.ts` — `queryFn` only                   | ✅       |
| `src/contexts/*.tsx` — internal data-fetching helpers               | ✅       |
| package internals (`@mohasinac/http`)                               | ✅       |
| `src/app/api/**` — external HTTP only, never calling own API routes | ✅       |
| Components (`.tsx`)                                                 | ❌       |
| Server Actions (`src/actions/`)                                     | ❌       |
| Pages (`src/app/`)                                                  | ❌       |

`fetch()` is ONLY allowed inside `apiClient` itself, or in API route handlers calling external third-party APIs.

**Server Components (RSC):** async RSC pages call repositories directly — skip hooks/apiClient entirely and pass `initialData` to the client view.

### Rules

- `apiClient` calls in hooks MUST use `API_ENDPOINTS` from `@/constants` — never hardcode paths
- Mutations MUST use Server Actions — never call `apiClient` from `useMutation`
- Components MUST NOT import or call `apiClient` directly
- No new `src/lib/**` reusable data-access wrappers for generic concerns — put shared logic in LIR packages
- Reusable hooks/helpers must be moved to `@mohasinac/react` or relevant `@mohasinac/feat-*` package

### Violation Quick-Reference

| Location                       | `fetch()` | `apiClient.*` | Allowed?                     |
| ------------------------------ | --------- | ------------- | ---------------------------- |
| Component / page               | ❌        | ❌            | Use hook only                |
| Hook queryFn                   | ❌        | ✅            | ✅                           |
| Server Action                  | ❌        | ❌            | Call repository or providers |
| API route (external APIs only) | ✅        | ❌            | ✅                           |
