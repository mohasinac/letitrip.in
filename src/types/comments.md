# TypeScript Types - Future Refactoring Notes

## Completed Improvements ✅

### Branded Types (shared/branded.ts)

- ✅ **Branded Types Implemented**: Complete branded type system (January 10, 2026)
- ✅ **Type Guards**: Runtime validation functions for all ID types
- ✅ **Helper Functions**: Creation functions with validation
- ✅ **Comprehensive Coverage**: 15+ branded types (User, Product, Order, Cart, Shop, etc.)
- ✅ **Type Safety**: Compile-time prevention of ID mixing
- ✅ **Zero Runtime Cost**: No performance overhead

## General Type System Improvements

### 1. Stricter Type Safety

- **Enable Strict Mode**: Use strictest TypeScript config
  ```json
  {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true
  }
  ```
- **Eliminate `any`**: Replace all `any` with proper types
- **Branded Types**: Use branded types for IDs and special strings
  ```typescript
  type UserId = string & { readonly __brand: unique symbol };
  ```
- **Template Literal Types**: Use for string patterns
  ```typescript
  type EmailAddress = `${string}@${string}.${string}`;
  ```

### 2. Type Organization

- **Domain-Driven Structure**: Organize by business domain
  - `/types/product/` - All product-related types
  - `/types/order/` - All order-related types
  - `/types/user/` - All user-related types
- **Shared Types**: Extract common patterns
  - `BaseEntity<T>` - Common entity fields
  - `Timestamped` - Created/updated timestamps
  - `Auditable` - User tracking fields

### 3. Generate Types from Schema

- **Database Schema**: Generate types from Firestore rules
- **API Schema**: Generate from OpenAPI/Swagger specs
- **GraphQL**: Generate from GraphQL schema
- **Form Schemas**: Generate from Zod/Yup schemas
  ```typescript
  const schema = z.object({ name: z.string() });
  type FormData = z.infer<typeof schema>;
  ```

### 4. Type Documentation

- **JSDoc**: Add comprehensive JSDoc
  ```typescript
  /**
   * Represents a product in the system
   * @property {string} id - Unique product identifier
   * @property {number} price - Price in INR (paise)
   * @example
   * const product: ProductFE = {
   *   id: '123',
   *   price: 199900 // ₹1,999
   * };
   */
  interface ProductFE {}
  ```
- **Example Objects**: Provide example values
- **Migration Guides**: Document breaking changes

## Specific Type Improvements

### Backend Types (DB)

- **Firestore Types**: Better Firestore integration

  ```typescript
  import { Timestamp, DocumentReference } from "firebase-admin/firestore";

  interface ProductDB {
    createdAt: Timestamp;
    seller: DocumentReference<UserDB>;
  }
  ```

- **Validation**: Runtime schema validation
- **Migrations**: Type-safe schema migrations
- **Indexes**: Type definitions for indexes

### Frontend Types (FE)

- **Computed Properties**: Clear separation
  ```typescript
  interface ProductFE extends ProductDB {
    // Computed properties (not in DB)
    readonly computed: {
      formattedPrice: string;
      inStock: boolean;
      discountPercent: number;
    };
  }
  ```
- **View Models**: Separate view-specific types
- **Form Types**: Dedicated form data types
- **Component Props**: Extract prop types

### Transform Functions

- **Bidirectional**: Support both directions
- **Validation**: Validate during transform
- **Error Handling**: Handle transform errors
- **Partial Transforms**: Transform subsets
- **Batch Transforms**: Optimize batch conversions
- **Caching**: Cache transformed objects

### API Types

- **Request/Response Pairs**: Co-locate related types
  ```typescript
  namespace ProductAPI {
    export interface CreateRequest {}
    export interface CreateResponse {}
  }
  ```
- **Error Responses**: Standardized error types
- **Pagination**: Generic pagination types
- **Filtering**: Generic filter types
- **Sorting**: Generic sort types

## Advanced Type Patterns

### Conditional Types

```typescript
type FrontendType<T> = T extends ProductDB
  ? ProductFE
  : T extends UserDB
  ? UserFE
  : never;
```

### Mapped Types

```typescript
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type Optional<T> = {
  [P in keyof T]?: T[P];
};
```

### Template Literal Types

```typescript
type EventName = `on${Capitalize<string>}`;
type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE";
type Endpoint = `/${string}`;
```

### Utility Type Library

Create custom utility types:

```typescript
// Pick only string properties
type StringKeys<T> = {
  [K in keyof T]: T[K] extends string ? K : never;
}[keyof T];

// Make specific properties optional
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Make specific properties required
type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

// Deep partial
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
```

## Type Testing

### Type Tests

Add tests for type correctness:

```typescript
import { expectType, expectError } from "tsd";

expectType<ProductFE>({ id: "123", name: "Product" });
expectError<ProductFE>({ id: 123 }); // id must be string
```

### Type Coverage

- **Use type-coverage**: Check type coverage percentage
- **Aim for 100%**: No implicit any
- **CI Integration**: Fail build on type errors

## Performance Considerations

### Type Compilation Speed

- **Avoid Complex Types**: Keep types simple
- **Use Type Aliases**: Instead of interfaces for unions
- **Lazy Types**: Use conditional imports
- **Type Caching**: Enable incremental compilation

### Bundle Size

- **Type Stripping**: Types removed in production
- **No Runtime Cost**: Types are compile-time only
- **Tree Shaking**: Dead code elimination

## Migration Strategies

### Gradual Typing

- **Start with `any`**: Allow `any` initially
- **Incremental Strictness**: Enable strict features gradually
- **Type Annotations**: Add explicit types
- **Remove `any`**: Replace with proper types

### Breaking Changes

- **Version Types**: Version type definitions
- **Deprecation**: Mark deprecated types
- **Migration Scripts**: Automated migrations
- **Compatibility Layer**: Maintain old types temporarily

## Integration with Libraries

### React

```typescript
// Component props
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

// Component with generics
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}
```

### Form Libraries

```typescript
// React Hook Form
import { UseFormReturn } from "react-hook-form";

interface FormProps {
  form: UseFormReturn<ProductFormData>;
}
```

### State Management

```typescript
// Redux
interface RootState {
  products: ProductState;
  cart: CartState;
}

type AppDispatch = ThunkDispatch<RootState, unknown, AnyAction>;
```

## Code Generation

### Generate from Database

```bash
# Generate types from Firestore schema
npm run generate:types:firestore

# Generate types from Prisma schema
npx prisma generate
```

### Generate from API

```bash
# Generate types from OpenAPI spec
npx openapi-typescript schema.yaml --output types/api.ts
```

### Generate from GraphQL

```bash
# Generate types from GraphQL schema
npx graphql-codegen
```

## Tooling Recommendations

### Type Checking

- **tsc --noEmit**: Type check without emitting
- **ts-node**: Run TypeScript directly
- **tsx**: Modern ts-node alternative

### Type Generation

- **quicktype**: Generate types from JSON
- **json-schema-to-typescript**: From JSON Schema
- **graphql-code-generator**: From GraphQL

### Type Testing

- **tsd**: Test TypeScript definitions
- **dtslint**: Lint definition files
- **type-coverage**: Check type coverage

## Documentation Standards

### Type Documentation Template

````typescript
/**
 * Product entity type for frontend UI
 *
 * @remarks
 * This type extends the database product type with computed properties
 * for display in the UI. Use `toProductFE()` to convert from database.
 *
 * @example Basic usage
 * ```typescript
 * const product: ProductFE = {
 *   id: '123',
 *   name: 'T-Shirt',
 *   price: 99900,
 *   formattedPrice: '₹999'
 * };
 * ```
 *
 * @example From database
 * ```typescript
 * const productDB = await getProduct(id);
 * const productFE = toProductFE(productDB);
 * ```
 *
 * @see {@link ProductDB} for database schema
 * @see {@link toProductFE} for transformation
 */
export interface ProductFE extends ProductDB {
  /** Formatted price for display (e.g., "₹999") */
  formattedPrice: string;

  /** Whether product is currently in stock */
  inStock: boolean;
}
````

## Best Practices

### Do's

- ✅ Use strict TypeScript config
- ✅ Prefer interfaces over type aliases for objects
- ✅ Use type aliases for unions and primitives
- ✅ Document complex types
- ✅ Use branded types for IDs
- ✅ Use discriminated unions
- ✅ Export types from same file as implementation
- ✅ Use generic types for reusability
- ✅ Validate at runtime (Zod, Yup)
- ✅ Test your types

### Don'ts

- ❌ Don't use `any` (use `unknown`)
- ❌ Don't use `object` (use specific type)
- ❌ Don't use `Function` (use specific signature)
- ❌ Don't create overly complex types
- ❌ Don't duplicate types
- ❌ Don't export internal types
- ❌ Don't use enums (use union types)
- ❌ Don't use `namespace` (use ES modules)
- ❌ Don't use type assertions unnecessarily
- ❌ Don't forget to document public types
