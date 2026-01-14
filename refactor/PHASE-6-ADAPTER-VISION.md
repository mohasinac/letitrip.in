# Phase 6: Component Migration with Service Adapters

## Overview

Phase 6 will migrate all reusable components and hooks to the react-library using the new **service adapter pattern**. This ensures all library components are backend-agnostic and can work with any service (Firebase, Supabase, custom APIs, etc.).

## Adapter Pattern Benefits for Migration

### Before (Hardcoded Dependencies)

```typescript
// Component tightly coupled to Firebase
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

function ProductList() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const snapshot = await getDocs(collection(db, "products"));
      setProducts(snapshot.docs.map((doc) => doc.data()));
    };
    fetchProducts();
  }, []);

  return <div>{/* render products */}</div>;
}
```

### After (Adapter Pattern)

```typescript
// Component works with any database
import { useQuery } from "@letitrip/react-library";
import type { DatabaseAdapter } from "@letitrip/react-library";

interface ProductListProps {
  database: DatabaseAdapter; // Injected dependency
}

function ProductList({ database }: ProductListProps) {
  const { data: products } = useQuery({
    database,
    collection: "products",
    orderBy: "createdAt",
    limit: 20,
  });

  return <div>{/* render products */}</div>;
}

// Usage with Firebase
import { FirebaseFirestoreAdapter } from "@letitrip/react-library";
const db = new FirebaseFirestoreAdapter(firestore);
<ProductList database={db} />;

// Usage with Supabase
import { SupabaseAdapter } from "@letitrip/react-library";
const db = new SupabaseAdapter(supabase);
<ProductList database={db} />;

// Usage with mock for testing
import { MockDatabaseAdapter } from "@letitrip/react-library";
const db = new MockDatabaseAdapter({ products: mockData });
<ProductList database={db} />;
```

## Migration Strategy

### 1. Data Fetching Hooks

All hooks that fetch data will accept adapters as parameters:

```typescript
// useProducts.ts (after migration)
import type { DatabaseAdapter } from "@letitrip/react-library";

export function useProducts(
  database: DatabaseAdapter,
  filters?: ProductFilters
) {
  return useQuery({
    database,
    collection: "products",
    where: filters,
  });
}

// Usage
const { database } = useServices(); // From context or props
const { data: products } = useProducts(database, { category: "electronics" });
```

### 2. Service Context Pattern

Create a context to inject services throughout the app:

```typescript
// services/context.tsx (in main app)
import { createContext, useContext } from "react";
import type { ServiceConfig } from "@letitrip/react-library";
import {
  FirebaseFirestoreAdapter,
  FirebaseStorageAdapter,
  FirebaseAuthAdapter,
  ApiUploadService,
} from "@letitrip/react-library";

const ServicesContext = createContext<ServiceConfig | null>(null);

export function ServicesProvider({ children }: { children: React.ReactNode }) {
  const services: ServiceConfig = {
    database: new FirebaseFirestoreAdapter(firestore),
    storage: new FirebaseStorageAdapter(storage),
    auth: new FirebaseAuthAdapter(auth),
  };

  return (
    <ServicesContext.Provider value={services}>
      {children}
    </ServicesContext.Provider>
  );
}

export function useServices() {
  const context = useContext(ServicesContext);
  if (!context)
    throw new Error("useServices must be used within ServicesProvider");
  return context;
}

// In components
function MyComponent() {
  const { database, storage } = useServices();
  const { data } = useProducts(database);
  // ...
}
```

### 3. Component Props Pattern

For maximum flexibility, components can also accept services via props:

```typescript
// Library component
interface DataTableProps<T> {
  database?: DatabaseAdapter; // Optional - can come from context
  collection: string;
  columns: Column<T>[];
}

function DataTable<T>({
  database: propDatabase,
  collection,
  columns,
}: DataTableProps<T>) {
  const contextServices = useServices(); // Try context first
  const database = propDatabase || contextServices?.database;

  if (!database) {
    throw new Error("Database adapter required via props or ServicesContext");
  }

  // Use database to fetch data
  const { data } = useQuery({ database, collection });

  return <table>{/* render */}</table>;
}
```

## Components to Migrate with Adapters

### Table Components

- **DataTable**: Needs `database` for data fetching
- **ResponsiveTable**: Presentation only (no adapter)
- **BulkActionBar**: Needs `database` for bulk operations
- **InlineEditRow**: Needs `database` for updates

### Filter Components

- **UnifiedFilterSidebar**: Needs `database` for filter options (categories, tags, etc.)
- **SearchBar**: Needs search service or `database` for query
- **ProductFilters**: Needs `database` for dynamic filter values

### Form Components

- **FormFileUpload**: Needs `UploadService` for file uploads
- **CategorySelector**: Needs `database` to fetch categories
- **AddressSelectorWithCreate**: Needs `database` for CRUD operations

### Selector Components

All selectors need `database` to fetch options:

- CategorySelector
- ProductVariantSelector
- TagSelectorWithCreate
- etc.

## Adapter Types Needed for Migration

### Already Implemented ✅

- `DatabaseAdapter` - Firestore, custom DB
- `StorageAdapter` - Firebase Storage, S3, Cloudinary
- `AuthAdapter` - Firebase Auth, Auth0, custom
- `UploadService` - API-based, Storage-based
- `CacheAdapter` - localStorage, in-memory, Redis
- `HttpClient` - fetch, axios wrapper
- `AnalyticsAdapter` - Firebase Analytics, GA

### To Be Added

- `SearchAdapter` - For search functionality (Algolia, Meilisearch, built-in)
- `PaymentAdapter` - For payment processing (Stripe, Razorpay, custom)
- `NotificationAdapter` - For push notifications
- `EmailAdapter` - For sending emails

## Example Migration: UnifiedFilterSidebar

### Before

```typescript
// src/components/common/UnifiedFilterSidebar.tsx (main app)
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function UnifiedFilterSidebar() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const snapshot = await getDocs(collection(db, "categories"));
      setCategories(snapshot.docs.map((doc) => doc.data()));
    };
    fetchCategories();
  }, []);

  return <aside>{/* render filters */}</aside>;
}
```

### After

```typescript
// react-library/src/components/filters/UnifiedFilterSidebar.tsx
import type { DatabaseAdapter } from "../../types/adapters";

interface UnifiedFilterSidebarProps {
  database?: DatabaseAdapter; // Optional if using context
  filters: FilterConfig[];
  onFilterChange: (values: Record<string, any>) => void;
}

export function UnifiedFilterSidebar({
  database: propDatabase,
  filters,
  onFilterChange,
}: UnifiedFilterSidebarProps) {
  const contextServices = useServices();
  const database = propDatabase || contextServices?.database;

  // Fetch dynamic filter options if needed
  const { data: categories } = useQuery({
    database,
    collection: "categories",
    enabled: filters.some((f) => f.key === "category"),
  });

  return <aside>{/* render filters with dynamic options */}</aside>;
}
```

### Usage

```typescript
// In main app
import { UnifiedFilterSidebar } from "@letitrip/react-library";
import { useServices } from "@/services/context";

function ProductsPage() {
  const { database } = useServices();

  return (
    <UnifiedFilterSidebar
      database={database}
      filters={PRODUCT_FILTERS}
      onFilterChange={handleFilterChange}
    />
  );
}

// Or with context provider
function App() {
  return (
    <ServicesProvider>
      <ProductsPage />
    </ServicesProvider>
  );
}
```

## Testing Strategy

### Unit Tests (Library Components)

```typescript
import {
  MockDatabaseAdapter,
  MockUploadService,
} from "@letitrip/react-library";

describe("UnifiedFilterSidebar", () => {
  it("should render filters", () => {
    const mockDb = new MockDatabaseAdapter({
      categories: [{ id: "1", name: "Electronics" }],
    });

    render(
      <UnifiedFilterSidebar
        database={mockDb}
        filters={testFilters}
        onFilterChange={jest.fn()}
      />
    );

    expect(screen.getByText("Electronics")).toBeInTheDocument();
  });
});
```

### Integration Tests (Main App)

```typescript
import { FirebaseFirestoreAdapter } from "@letitrip/react-library";
import { useTestFirestore } from "@/test-utils";

describe("ProductsPage", () => {
  it("should load products", async () => {
    const testDb = useTestFirestore();
    const database = new FirebaseFirestoreAdapter(testDb);

    render(
      <ServicesProvider value={{ database }}>
        <ProductsPage />
      </ServicesProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Product 1")).toBeInTheDocument();
    });
  });
});
```

## Rollout Plan

1. **Phase 6.1**: Migrate table & data display components
2. **Phase 6.2**: Migrate filter & search components
3. **Phase 6.3**: Migrate form & selector components
4. **Phase 6.4**: Migrate utility hooks
5. **Phase 6.5**: Update main app to use adapters
6. **Phase 6.6**: Create adapter implementations for all services
7. **Phase 6.7**: Testing & documentation

## Success Metrics

- ✅ Zero hardcoded service dependencies in library
- ✅ All components work with mock adapters
- ✅ Easy to swap backends (Firebase → Supabase in < 1 hour)
- ✅ 100% test coverage with mocks
- ✅ Library works in Next.js, React Native, and plain React
- ✅ TypeScript types for all adapters
- ✅ Comprehensive documentation with examples

## See Also

- [SERVICE-ADAPTER-SUMMARY.md](./SERVICE-ADAPTER-SUMMARY.md) - Implementation details
- [IMPLEMENTATION-TRACKER.md](./IMPLEMENTATION-TRACKER.md) - Current progress
- [react-library/docs/SERVICE-ADAPTERS.md](../react-library/docs/SERVICE-ADAPTERS.md) - Usage guide
