# Type System Migration Guide

## Quick Start

This guide helps you migrate to the new Frontend (FE) / Backend (BE) type system with zero `any` types.

## Core Concept

```typescript
Backend API (ProductBE)
  ↓ Transform
Frontend Components (ProductFE)
```

## Example: Product Service

### Before (Old Way - Don't Use)

```typescript
// ❌ BAD: Using 'any' or mixed types
async getProduct(id: string): Promise<any> {
  return apiService.get(`/products/${id}`);
}
```

### After (New Way - Use This)

```typescript
// ✅ GOOD: Strict types with transformation
import { ProductBE } from '@/types/backend/product.types';
import { ProductFE } from '@/types/frontend/product.types';
import { toFEProduct } from '@/types/transforms/product.transforms';

async getProduct(id: string): Promise<ProductFE> {
  const response = await apiService.get<ProductBE>(`/products/${id}`);
  return toFEProduct(response);
}
```

## Example: Component Props

### Before

```typescript
// ❌ BAD: any or loose types
interface Props {
  product: any;
}
```

### After

```typescript
// ✅ GOOD: Strict FE types
import { ProductFE } from "@/types/frontend/product.types";

interface ProductCardProps {
  product: ProductFE;
  onAddToCart?: (productId: string) => void;
  onFavorite?: (productId: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  // TypeScript knows all properties of product
  return (
    <div>
      <img src={product.primaryImage} alt={product.name} />
      <h3>{product.name}</h3>
      <p>{product.formattedPrice}</p>
      {product.discount && (
        <span className="badge">{product.discountPercentage}% OFF</span>
      )}
    </div>
  );
};
```

## Example: Form Handling

```typescript
import { ProductFormFE } from "@/types/frontend/product.types";
import { toBEProductCreate } from "@/types/transforms/product.transforms";
import { productService } from "@/services/products.service";

const ProductCreateForm: React.FC = () => {
  const [formData, setFormData] = useState<ProductFormFE>({
    name: "",
    slug: "",
    sku: "",
    categoryId: "",
    price: 0,
    stockCount: 0,
    // ... all required fields with proper types
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const productBE = toBEProductCreate(formData);
      const result = await productService.create(productBE);
      // result is ProductFE type
      router.push(`/products/${result.slug}`);
    } catch (error) {
      // Handle error
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      {errors.name && <span className="error">{errors.name}</span>}
      {/* More fields */}
    </form>
  );
};
```

## Example: Custom Hooks

```typescript
import { useState, useEffect } from "react";
import { ProductFE } from "@/types/frontend/product.types";
import { productService } from "@/services/products.service";

export function useProduct(slug: string) {
  const [product, setProduct] = useState<ProductFE | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await productService.getBySlug(slug);
        if (!cancelled) {
          setProduct(data); // data is ProductFE
          setError(null);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message);
          setProduct(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchProduct();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { product, loading, error };
}
```

## Type Checking Rules

### 1. No `any` Types

```typescript
// ❌ BAD
const handleClick = (data: any) => {};

// ✅ GOOD
const handleClick = (data: ProductFE) => {};
```

### 2. Always Type Component Props

```typescript
// ❌ BAD
const MyComponent = ({ data }) => {};

// ✅ GOOD
interface MyComponentProps {
  data: ProductFE;
  onAction?: () => void;
}

const MyComponent: React.FC<MyComponentProps> = ({ data, onAction }) => {};
```

### 3. Always Type Hook Returns

```typescript
// ❌ BAD
export function useData() {
  const [data, setData] = useState(null);
  return { data };
}

// ✅ GOOD
export function useData(): {
  data: ProductFE | null;
  loading: boolean;
  error: string | null;
} {
  const [data, setData] = useState<ProductFE | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  return { data, loading, error };
}
```

### 4. Always Type Context Values

```typescript
// ❌ BAD
const AuthContext = createContext(undefined);

// ✅ GOOD
interface AuthContextValue {
  user: UserFE | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
```

## Available Types

### Frontend Types (`/types/frontend/`)

- `ProductFE` - Full product for detail pages
- `ProductCardFE` - Minimal product for cards/lists
- `ProductFormFE` - Product create/edit forms
- `ProductFiltersFE` - Search/filter UI
- More entities coming soon...

### Backend Types (`/types/backend/`)

- `ProductBE` - API response structure
- `CreateProductRequestBE` - Create request payload
- `UpdateProductRequestBE` - Update request payload
- `ProductFiltersBE` - API query params
- More entities coming soon...

### Shared Types (`/types/shared/`)

- `common.types.ts` - Enums, base interfaces
- `pagination.types.ts` - List responses
- `api.types.ts` - API contracts

### Transforms (`/types/transforms/`)

- `toFEProduct(productBE)` - BE → FE
- `toBEProductCreate(formFE)` - Form → BE create
- `toBEProductUpdate(formFE)` - Form → BE update

## Migration Checklist

- [ ] Update service methods to return FE types
- [ ] Add transformation in service layer
- [ ] Update component props to use FE types
- [ ] Update hook return types
- [ ] Update context types
- [ ] Remove all `any` types
- [ ] Add validation schemas
- [ ] Test all flows

## Validation

### Field-Level Validation

Always show validation errors below fields:

```typescript
<div className="form-field">
  <label>Product Name *</label>
  <input
    type="text"
    value={formData.name}
    onChange={(e) => {
      setFormData({ ...formData, name: e.target.value });
      // Clear error when user types
      setErrors({ ...errors, name: "" });
    }}
    className={errors.name ? "error" : ""}
  />
  {errors.name && <span className="error-message">{errors.name}</span>}
</div>
```

### Persistent Action Buttons

Always keep Save/Create/Finish buttons visible:

```typescript
// Sticky button at bottom of form
<div className="sticky bottom-0 bg-white border-t p-4 flex justify-end gap-3">
  <button type="button" onClick={onCancel}>
    Cancel
  </button>
  <button type="submit" disabled={loading || !isValid} className="btn-primary">
    {loading ? "Creating..." : "Create Product"}
  </button>
</div>
```

## Best Practices

1. **Always transform at service layer** - Never in components
2. **Use FE types in UI** - Components only see FE types
3. **Use BE types in API calls** - Services handle BE types
4. **Type all props** - No implicit any
5. **Type all hooks** - Explicit return types
6. **Type all contexts** - Define context value interface
7. **Validate everything** - Show errors below fields
8. **Keep buttons visible** - Sticky/fixed positioning

## Common Patterns

### Pattern: List with Loading

```typescript
const ProductList: React.FC = () => {
  const [products, setProducts] = useState<ProductCardFE[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productService
      .list()
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
```

### Pattern: Detail with Error

```typescript
const ProductDetail: React.FC<{ slug: string }> = ({ slug }) => {
  const { product, loading, error } = useProduct(slug);

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;
  if (!product) return <NotFound />;

  return <ProductView product={product} />;
};
```

### Pattern: Form with Validation

```typescript
const ProductForm: React.FC = () => {
  const [formData, setFormData] = useState<ProductFormFE>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) newErrors.name = "Name is required";
    if (formData.price <= 0) newErrors.price = "Price must be positive";
    // ... more validation

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await productService.create(toBEProductCreate(formData));
    } catch (error: any) {
      setErrors({ submit: error.message });
    }
  };

  return <form onSubmit={handleSubmit}>{/* fields */}</form>;
};
```

## Testing

```typescript
// Type-safe testing
import { ProductFE } from "@/types/frontend/product.types";

const mockProduct: ProductFE = {
  id: "1",
  name: "Test Product",
  slug: "test-product",
  price: 999,
  // ... all required fields
};

test("renders product card", () => {
  render(<ProductCard product={mockProduct} />);
  expect(screen.getByText("Test Product")).toBeInTheDocument();
});
```

## Next Steps

1. Complete Product types implementation (✅ Done)
2. Create Auction types
3. Create User types
4. Create Order types
5. Create Cart types
6. Update all services
7. Update all components
8. Remove all `any` types
9. Add validation schemas
10. Update all tests
