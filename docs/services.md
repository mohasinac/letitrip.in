# Data-Fetching Architecture

> **The `src/services/` directory has been deleted (2026-03-14).** There is no service layer.
>
> The architecture is now **2-hop**:
>
> - **Reads:** `Component → useQuery hook → apiClient → API Route`
> - **Mutations:** `Component → useMutation hook → Server Action → Repository`

---

## Pattern

```ts
// ✅ Reads — apiClient directly in hook queryFn
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants";

export function useProducts(params?: string) {
  return useQuery({
    queryKey: ["products", params ?? ""],
    queryFn: () =>
      apiClient.get(API_ENDPOINTS.PRODUCTS.LIST + (params ? `?${params}` : "")),
    staleTime: 5 * 60 * 1000,
  });
}

// ✅ Mutations — Server Action in useMutation
import { useMutation } from "@tanstack/react-query";
import { createProductAction } from "@/actions";

export function useCreateProduct() {
  return useMutation({ mutationFn: createProductAction });
}
```

---

## Where apiClient is allowed

| Location                                              | Allowed? |
| ----------------------------------------------------- | -------- |
| `src/hooks/*.ts` — `queryFn` inside `useQuery`        | ✅       |
| `src/features/<name>/hooks/*.ts` — `queryFn` only     | ✅       |
| `src/contexts/*.tsx` — internal data-fetching helpers | ✅       |
| `src/lib/firebase/` — session helpers                 | ✅       |
| `src/app/api/**` — external HTTP only                 | ✅       |
| Components (`.tsx`)                                   | ❌       |
| Server Actions (`src/actions/`)                       | ❌       |
| Pages (`src/app/`)                                    | ❌       |

---

## Hooks reference

Read-query hooks live in `src/hooks/` (shared) or `src/features/<name>/hooks/` (feature-scoped).
See [`docs/hooks.md`](hooks.md) for the full hook inventory.
