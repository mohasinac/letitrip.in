# Comprehensive Refactoring Plan - Letitrip.in

**Version**: 1.0  
**Date**: 2025  
**Status**: Planning Phase

---

## Executive Summary

This refactoring plan prioritizes **reusing existing utilities, hooks, components, and services** over creating new ones, while addressing security, performance, and architectural improvements across the entire platform. The plan is divided into 3 phases with clear priorities and dependencies.

### Key Principles

1. **Reuse First**: Leverage 25+ hooks, 40+ services, 50+ utilities, 7+ contexts
2. **Security Focus**: Permission-based access, rate limiting, input validation
3. **Performance**: Lazy loading, memoization, caching, code splitting
4. **Type Safety**: Zod validation, strict TypeScript, branded types
5. **Modern Patterns**: React Query, Suspense, Server Components

---

## Current State Analysis

### Existing Infrastructure (What We Have)

#### Hooks (25+)

- ✅ **Form Management**: `useFormState`, `usePasswordFieldState`, `useWizardFormState`, `useCheckoutState`
- ✅ **UI State**: `useDialogState`, `useLoadingState`, `usePaginationState`, `useResourceListState`
- ✅ **Data**: `useCart`, `useDebounce`, `useLocalStorage`
- ✅ **Device**: `useMobile`, `useMediaQuery`
- ✅ **Auth**: Authentication hooks integrated with AuthContext
- ✅ **Upload**: `useMediaUpload`

#### Contexts (7+)

- ✅ **AuthContext**: Authentication, session, role checks
- ✅ **LoginRegisterContext**: Form state for auth flows
- ✅ **ThemeContext**: Dark/light theme management
- ✅ **ComparisonContext**: Product comparison
- ⚠️ **Missing**: NotificationContext, ModalContext, FeatureFlagContext

#### Services (40+)

- ✅ Auth, Products, Cart, Checkout, Orders, Payment, Shipping
- ✅ User, Shop, Category, Review, Notification, Support
- ⚠️ **Issues**: No base service class, inconsistent error handling, no caching layer

#### Utilities (50+)

- ✅ Formatters (price, date, number, phone, address)
- ✅ Validators (email, phone, URL, password)
- ✅ Firebase utils (auth, Firestore, storage, realtime)
- ✅ SEO, analytics, media, string, array utilities
- ⚠️ **Issues**: Need Zod validation, better organization, decimal.js for prices

#### Components

- ✅ **Auth**: GoogleSignInButton, AuthGuard, OTPInput
- ✅ **Forms**: FormField, FormInput, FormSelect, WizardForm
- ⚠️ **Missing**: Skeleton loaders, error boundaries, permission-based guards

---

## Phase 1: Foundation & Security (Weeks 1-4)

**Goal**: Establish secure, type-safe foundation without breaking existing functionality

### 1.1 Type Safety & Validation

#### Actions

- [ ] **Install & Configure Zod**

  ```bash
  npm install zod @t3-oss/env-nextjs
  ```

- [ ] **Create Type-Safe Environment Config**

  - **File**: `src/lib/env.ts`
  - **Use**: `@t3-oss/env-nextjs` for environment validation
  - **Validate**: All env vars at startup with Zod schemas
  - **Reuse**: Existing config patterns from `src/config/`

- [ ] **Add Runtime Validation to Existing Services**

  - **Enhance**: `src/services/auth-service.ts`, `src/services/product-service.ts`
  - **Pattern**:

    ```typescript
    import { z } from "zod";

    const LoginSchema = z.object({
      email: z.string().email(),
      password: z.string().min(8),
    });

    export const login = (data: unknown) => {
      const validated = LoginSchema.parse(data); // Runtime validation
      return authService.login(validated);
    };
    ```

  - **Reuse**: Existing validators from `src/lib/validators/`

- [ ] **Create Branded Types for IDs**
  - **File**: `src/types/shared/branded.ts`
  - **Pattern**:
    ```typescript
    type UserId = string & { readonly __brand: "UserId" };
    type ProductId = string & { readonly __brand: "ProductId" };
    type OrderId = string & { readonly __brand: "OrderId" };
    ```
  - **Refactor**: All ID fields across types

### 1.2 Security Enhancements

#### Actions

- [ ] **Implement Permission-Based Access Control**

  - **Replace**: Role-based checks with permission-based
  - **File**: `src/lib/permissions.ts`
  - **Pattern**:

    ```typescript
    type Permission =
      | "products:create"
      | "products:update"
      | "products:delete"
      | "orders:view"
      | "orders:manage"
      | "users:manage";

    type Role = "buyer" | "seller" | "admin";

    const rolePermissions: Record<Role, Permission[]> = {
      buyer: ["orders:view"],
      seller: ["products:create", "products:update", "orders:view"],
      admin: ["products:delete", "orders:manage", "users:manage"],
    };

    export const hasPermission = (
      user: User,
      permission: Permission
    ): boolean => {
      return rolePermissions[user.role]?.includes(permission) ?? false;
    };
    ```

  - **Reuse**: Existing AuthContext for user state

- [ ] **Create Permission-Based AuthGuard**

  - **Enhance**: `src/components/auth/AuthGuard.tsx`
  - **Add**: `requiredPermissions` prop
  - **Pattern**:
    ```typescript
    <AuthGuard requiredPermissions={["products:create"]}>
      <CreateProductPage />
    </AuthGuard>
    ```

- [ ] **Add Rate Limiting to API Routes**

  - **File**: `src/app/api/_middleware/rate-limit.ts`
  - **Pattern**:

    ```typescript
    import { RateLimiter } from "@/lib/rate-limiter";

    const limiter = RateLimiter.create({
      points: 10, // requests
      duration: 60, // per minute
    });

    export const withRateLimit = (handler: NextApiHandler) => {
      return async (req, res) => {
        try {
          await limiter.consume(req.ip);
          return handler(req, res);
        } catch {
          return res.status(429).json({ error: "Too many requests" });
        }
      };
    };
    ```

  - **Apply**: To all `/api` routes

- [ ] **Implement Input Sanitization**

  - **File**: `src/lib/sanitize.ts`
  - **Use**: DOMPurify for HTML sanitization
  - **Pattern**:

    ```typescript
    import DOMPurify from "isomorphic-dompurify";

    export const sanitizeHtml = (html: string): string => {
      return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ["b", "i", "em", "strong", "a", "p"],
        ALLOWED_ATTR: ["href"],
      });
    };
    ```

  - **Reuse**: In form inputs, product descriptions

- [ ] **Firebase Security Rules Enhancement**
  - **Review**: All Firestore rules in `firestore.rules`
  - **Add**: Field-level validation, size limits
  - **Pattern**:
    ```javascript
    // Validate product creation
    match /products/{productId} {
      allow create: if request.auth != null
        && request.resource.data.keys().hasAll(['title', 'price', 'sellerId'])
        && request.resource.data.price > 0
        && request.resource.data.title.size() <= 200;
    }
    ```

### 1.3 Error Handling

#### Actions

- [ ] **Create Typed Error Classes**

  - **File**: `src/lib/errors.ts`
  - **Pattern**:

    ```typescript
    export class AppError extends Error {
      constructor(
        public code: string,
        message: string,
        public statusCode: number = 500
      ) {
        super(message);
        this.name = "AppError";
      }
    }

    export class ValidationError extends AppError {
      constructor(message: string, public fields?: Record<string, string>) {
        super("VALIDATION_ERROR", message, 400);
      }
    }

    export class AuthError extends AppError {
      constructor(message: string) {
        super("AUTH_ERROR", message, 401);
      }
    }

    export class NotFoundError extends AppError {
      constructor(resource: string) {
        super("NOT_FOUND", `${resource} not found`, 404);
      }
    }
    ```

- [ ] **Update All Services to Use Typed Errors**

  - **Refactor**: All 40+ services in `src/services/`
  - **Replace**: Generic throws with typed errors
  - **Reuse**: New error classes

- [ ] **Create Global Error Boundary**
  - **File**: `src/components/error-boundary.tsx`
  - **Use**: React 19 error boundaries
  - **Pattern**:

    ```typescript
    "use client";
    import { Component, ErrorInfo, ReactNode } from "react";

    interface Props {
      children: ReactNode;
      fallback?: (error: Error, reset: () => void) => ReactNode;
    }

    export class ErrorBoundary extends Component<
      Props,
      { error: Error | null }
    > {
      state = { error: null };

      static getDerivedStateFromError(error: Error) {
        return { error };
      }

      componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Error caught:", error, errorInfo);
        // TODO: Send to error tracking service (Sentry)
      }

      render() {
        if (this.state.error) {
          return (
            this.props.fallback?.(this.state.error, () =>
              this.setState({ error: null })
            ) ?? <DefaultErrorFallback error={this.state.error} />
          );
        }
        return this.props.children;
      }
    }
    ```

---

## Phase 2: Performance & Architecture (Weeks 5-8)

**Goal**: Optimize performance, improve code organization, reduce bundle size

### 2.1 Context Optimization

#### Actions

- [ ] **Split AuthContext (State vs Actions)**

  - **Current**: `src/contexts/AuthContext.tsx` (single context)
  - **Refactor**:

    ```typescript
    // src/contexts/auth/AuthStateContext.tsx
    const AuthStateContext = createContext<AuthState>(null);

    // src/contexts/auth/AuthActionsContext.tsx
    const AuthActionsContext = createContext<AuthActions>(null);

    // src/contexts/auth/AuthProvider.tsx
    export const AuthProvider = ({ children }) => {
      const [state, setState] = useState<AuthState>({ ... });
      const actions = useMemo(() => ({
        login: ...,
        logout: ...,
        register: ...
      }), [/* dependencies */]);

      return (
        <AuthStateContext.Provider value={state}>
          <AuthActionsContext.Provider value={actions}>
            {children}
          </AuthActionsContext.Provider>
        </AuthStateContext.Provider>
      );
    };

    // src/hooks/useAuthState.ts
    export const useAuthState = () => {
      const context = useContext(AuthStateContext);
      if (!context) throw new Error('useAuthState must be used within AuthProvider');
      return context;
    };

    // src/hooks/useAuthActions.ts
    export const useAuthActions = () => {
      const context = useContext(AuthActionsContext);
      if (!context) throw new Error('useAuthActions must be used within AuthProvider');
      return context;
    };
    ```

  - **Benefit**: Components that only need actions won't re-render on state changes

- [ ] **Create Missing Contexts**

  **NotificationContext**:

  - **File**: `src/contexts/NotificationContext.tsx`
  - **Features**: Toast notifications, persistent notifications, unread count
  - **Reuse**: Existing notification service `src/services/notification-service.ts`
  - **Pattern**:

    ```typescript
    interface Notification {
      id: string;
      type: "success" | "error" | "warning" | "info";
      message: string;
      duration?: number;
    }

    const NotificationContext = createContext<{
      notifications: Notification[];
      showNotification: (notification: Omit<Notification, "id">) => void;
      dismissNotification: (id: string) => void;
    }>(null);
    ```

  **ModalContext**:

  - **File**: `src/contexts/ModalContext.tsx`
  - **Features**: Stack-based modal management, promise-based API
  - **Pattern**:
    ```typescript
    const ModalContext = createContext<{
      openModal: <T>(component: ReactNode) => Promise<T>;
      closeModal: (result?: unknown) => void;
      closeAll: () => void;
    }>(null);
    ```

  **FeatureFlagContext**:

  - **File**: `src/contexts/FeatureFlagContext.tsx`
  - **Features**: Remote config, A/B testing, gradual rollout
  - **Use**: Firebase Remote Config
  - **Pattern**:
    ```typescript
    const FeatureFlagContext = createContext<{
      isFeatureEnabled: (feature: string) => boolean;
      getFeatureValue: <T>(feature: string, defaultValue: T) => T;
    }>(null);
    ```

- [ ] **Lazy Load Context Providers**
  - **File**: `src/app/layout.tsx`
  - **Pattern**:

    ```typescript
    const AuthProvider = dynamic(() => import("@/contexts/AuthProvider"), {
      ssr: false,
    });
    const ThemeProvider = dynamic(() => import("@/contexts/ThemeProvider"));

    export default function RootLayout({ children }) {
      return (
        <html>
          <body>
            <ThemeProvider>
              <AuthProvider>{children}</AuthProvider>
            </ThemeProvider>
          </body>
        </html>
      );
    }
    ```

### 2.2 Service Layer Refactoring

#### Actions

- [ ] **Create Base Service Class**

  - **File**: `src/services/base-service.ts`
  - **Pattern**:

    ```typescript
    import { db } from "@/lib/firebase/firestore";
    import {
      collection,
      doc,
      getDoc,
      getDocs,
      query,
      where,
      addDoc,
      updateDoc,
      deleteDoc,
    } from "firebase/firestore";

    export abstract class BaseService<T> {
      constructor(protected collectionName: string) {}

      async getById(id: string): Promise<T | null> {
        const docRef = doc(db, this.collectionName, id);
        const snapshot = await getDoc(docRef);
        return snapshot.exists() ? (snapshot.data() as T) : null;
      }

      async getAll(): Promise<T[]> {
        const collectionRef = collection(db, this.collectionName);
        const snapshot = await getDocs(collectionRef);
        return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as T));
      }

      async create(data: Omit<T, "id">): Promise<string> {
        const collectionRef = collection(db, this.collectionName);
        const docRef = await addDoc(collectionRef, data);
        return docRef.id;
      }

      async update(id: string, data: Partial<T>): Promise<void> {
        const docRef = doc(db, this.collectionName, id);
        await updateDoc(docRef, data);
      }

      async delete(id: string): Promise<void> {
        const docRef = doc(db, this.collectionName, id);
        await deleteDoc(docRef);
      }
    }
    ```

- [ ] **Migrate Existing Services to Extend BaseService**

  - **Refactor**: All 40+ services
  - **Example**: `src/services/product-service.ts`

    ```typescript
    import { BaseService } from './base-service';
    import { ProductDB } from '@/types/backend/product';

    class ProductService extends BaseService<ProductDB> {
      constructor() {
        super('products');
      }

      // Keep existing custom methods
      async searchProducts(query: string) { ... }
      async getProductsByCategory(categoryId: string) { ... }
      async getFeaturedProducts() { ... }
    }

    export const productService = new ProductService();
    ```

- [ ] **Implement React Query for Data Fetching**

  - **Install**: `npm install @tanstack/react-query`
  - **File**: `src/lib/react-query.ts`
  - **Pattern**:

    ```typescript
    import { QueryClient } from "@tanstack/react-query";

    export const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60 * 5, // 5 minutes
          gcTime: 1000 * 60 * 30, // 30 minutes
          retry: 2,
          refetchOnWindowFocus: false,
        },
      },
    });
    ```

- [ ] **Create Query Hooks for Services**

  - **Directory**: `src/hooks/queries/`
  - **Pattern**:

    ```typescript
    // src/hooks/queries/useProduct.ts
    import { useQuery } from "@tanstack/react-query";
    import { productService } from "@/services/product-service";

    export const useProduct = (productId: string) => {
      return useQuery({
        queryKey: ["product", productId],
        queryFn: () => productService.getById(productId),
        enabled: !!productId,
      });
    };

    export const useProducts = (filters?: ProductFilters) => {
      return useQuery({
        queryKey: ["products", filters],
        queryFn: () => productService.getAll(filters),
      });
    };
    ```

  - **Reuse**: Existing services, no need to rewrite data fetching logic

- [ ] **Add Caching Layer to Services**
  - **File**: `src/lib/cache.ts`
  - **Layers**: Memory (Map), localStorage, IndexedDB
  - **Pattern**:

    ```typescript
    class CacheService {
      private memoryCache = new Map<
        string,
        { data: unknown; expires: number }
      >();

      set(key: string, data: unknown, ttl: number = 60000) {
        this.memoryCache.set(key, {
          data,
          expires: Date.now() + ttl,
        });
        localStorage.setItem(
          key,
          JSON.stringify({ data, expires: Date.now() + ttl })
        );
      }

      get<T>(key: string): T | null {
        // Check memory first
        const memoryItem = this.memoryCache.get(key);
        if (memoryItem && memoryItem.expires > Date.now()) {
          return memoryItem.data as T;
        }

        // Check localStorage
        const localItem = localStorage.getItem(key);
        if (localItem) {
          const parsed = JSON.parse(localItem);
          if (parsed.expires > Date.now()) {
            this.memoryCache.set(key, parsed); // Warm up memory cache
            return parsed.data as T;
          }
        }

        return null;
      }
    }

    export const cache = new CacheService();
    ```

### 2.3 Component Performance

#### Actions

- [ ] **Create Skeleton Loader Components**

  - **Directory**: `src/components/skeletons/`
  - **Files**:
    - `ProductCardSkeleton.tsx`
    - `ProductListSkeleton.tsx`
    - `UserProfileSkeleton.tsx`
    - `OrderCardSkeleton.tsx`
  - **Pattern**:
    ```typescript
    export const ProductCardSkeleton = () => (
      <div className="animate-pulse">
        <div className="h-48 bg-gray-200 rounded-lg mb-4" />
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>
    );
    ```

- [ ] **Add Suspense Boundaries**

  - **Pattern**: Wrap async components with Suspense
  - **Example**: `src/app/products/[id]/page.tsx`

    ```typescript
    import { Suspense } from "react";
    import { ProductCardSkeleton } from "@/components/skeletons";

    export default function ProductPage({ params }) {
      return (
        <Suspense fallback={<ProductCardSkeleton />}>
          <ProductDetail productId={params.id} />
        </Suspense>
      );
    }
    ```

- [ ] **Implement Code Splitting**

  - **Use**: Dynamic imports for heavy components
  - **Pattern**:

    ```typescript
    const RichTextEditor = dynamic(
      () => import("@/components/RichTextEditor"),
      {
        ssr: false,
        loading: () => <div>Loading editor...</div>,
      }
    );

    const ProductReviews = dynamic(() => import("@/components/ProductReviews"));
    ```

- [ ] **Memoize Expensive Computations**

  - **Audit**: Components using `useMemo`, `useCallback`
  - **Pattern**:

    ```typescript
    const sortedProducts = useMemo(() => {
      return products.sort((a, b) => a.price - b.price);
    }, [products]);

    const handleAddToCart = useCallback((productId: string) => {
      cartService.addItem(productId);
    }, []);
    ```

  - **Reuse**: Existing `useDebounce` hook for expensive operations

- [ ] **Implement Virtual Scrolling**
  - **Enhance**: `useResourceListState` hook
  - **Use**: `react-window` or `react-virtual`
  - **Pattern**:

    ```typescript
    import { useVirtualizer } from "@tanstack/react-virtual";

    export const useVirtualList = <T>(items: T[]) => {
      const parentRef = useRef<HTMLDivElement>(null);

      const virtualizer = useVirtualizer({
        count: items.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 100, // item height
      });

      return { parentRef, virtualizer };
    };
    ```

### 2.4 Route Organization

#### Actions

- [ ] **Implement Route Groups**

  - **Refactor**: `src/app/` directory structure
  - **Pattern**:
    ```
    src/app/
      (public)/
        page.tsx              # Homepage
        about/page.tsx
        products/[id]/page.tsx
        layout.tsx            # Public layout (no auth required)

      (auth)/
        login/page.tsx
        register/page.tsx
        forgot-password/page.tsx
        layout.tsx            # Auth layout (redirect if authenticated)

      (protected)/
        dashboard/page.tsx
        orders/page.tsx
        profile/page.tsx
        layout.tsx            # Protected layout (require authentication)

      (admin)/
        admin/
          users/page.tsx
          products/page.tsx
          orders/page.tsx
        layout.tsx            # Admin layout (require admin role)

      api/
        v1/                   # API versioning
          products/route.ts
          orders/route.ts
    ```

- [ ] **Split Layouts by Section**

  - **Create**: Section-specific layouts
  - **Example**: `src/app/(protected)/layout.tsx`

    ```typescript
    import { AuthGuard } from "@/components/auth/AuthGuard";
    import { DashboardSidebar } from "@/components/DashboardSidebar";

    export default function ProtectedLayout({ children }) {
      return (
        <AuthGuard>
          <div className="flex">
            <DashboardSidebar />
            <main className="flex-1">{children}</main>
          </div>
        </AuthGuard>
      );
    }
    ```

- [ ] **Implement API Versioning**
  - **Create**: `src/app/api/v1/` directory
  - **Middleware**: `src/app/api/v1/_middleware.ts`
  - **Pattern**:

    ```typescript
    // src/app/api/v1/products/route.ts
    import { withRateLimit } from "@/lib/middleware/rate-limit";
    import { withAuth } from "@/lib/middleware/auth";

    export const GET = withRateLimit(async (req) => {
      const products = await productService.getAll();
      return Response.json(products);
    });

    export const POST = withAuth(
      withRateLimit(async (req) => {
        const data = await req.json();
        const productId = await productService.create(data);
        return Response.json({ id: productId }, { status: 201 });
      })
    );
    ```

---

## Phase 3: Feature Enhancements (Weeks 9-12)

**Goal**: Add new features, improve UX, complete missing functionality

### 3.1 Hook Enhancements

#### Actions

- [ ] **Add Schema Validation to Form Hooks**

  - **Enhance**: `useFormState`, `usePasswordFieldState`, `useWizardFormState`
  - **Add**: Zod schema integration
  - **Pattern**:

    ```typescript
    import { z } from "zod";

    export const useFormState = <T extends z.ZodType>(
      initialValues: z.infer<T>,
      schema: T,
      onSubmit: (values: z.infer<T>) => Promise<void>
    ) => {
      const [values, setValues] = useState(initialValues);
      const [errors, setErrors] = useState<Record<string, string>>({});

      const validate = (data: unknown) => {
        try {
          schema.parse(data);
          setErrors({});
          return true;
        } catch (error) {
          if (error instanceof z.ZodError) {
            setErrors(error.flatten().fieldErrors);
          }
          return false;
        }
      };

      const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (validate(values)) {
          await onSubmit(values);
        }
      };

      return { values, setValues, errors, handleSubmit };
    };
    ```

- [ ] **Add Async Validation Support**

  - **Enhance**: `useFormState`
  - **Use Case**: Check email/username availability
  - **Pattern**:

    ```typescript
    const asyncValidators = {
      email: async (email: string) => {
        const exists = await userService.checkEmailExists(email);
        return exists ? "Email already taken" : null;
      },
    };

    const { values, errors, validateAsync } = useFormState(initial, schema, {
      asyncValidators,
    });
    ```

- [ ] **Add Optimistic Updates to useCart**

  - **Enhance**: `src/hooks/useCart.ts`
  - **Reuse**: Existing cart service
  - **Pattern**:
    ```typescript
    const addItem = async (productId: string) => {
      // Optimistic update
      setCart((prev) => [...prev, { productId, quantity: 1 }]);

      try {
        await cartService.addItem(productId);
      } catch (error) {
        // Rollback on error
        setCart((prev) => prev.filter((item) => item.productId !== productId));
        throw error;
      }
    };
    ```

- [ ] **Add Cursor Pagination to usePaginationState**
  - **Enhance**: `src/hooks/usePaginationState.ts`
  - **Pattern**:
    ```typescript
    export const useCursorPagination = <T>(
      fetchFn: (cursor?: string) => Promise<{ items: T[]; nextCursor?: string }>
    ) => {
      const [items, setItems] = useState<T[]>([]);
      const [cursor, setCursor] = useState<string>();
      const [hasMore, setHasMore] = useState(true);

      const loadMore = async () => {
        const { items: newItems, nextCursor } = await fetchFn(cursor);
        setItems((prev) => [...prev, ...newItems]);
        setCursor(nextCursor);
        setHasMore(!!nextCursor);
      };

      return { items, loadMore, hasMore };
    };
    ```

### 3.2 Form Component Enhancements

#### Actions

- [ ] **Create Specialized Form Components**

  - **Reuse**: Existing FormField, FormInput base components
  - **New Components**:

    **FormPhoneInput**:

    ```typescript
    // src/components/forms/FormPhoneInput.tsx
    import { FormField } from "./FormField";
    import { formatPhoneNumber } from "@/lib/formatters/phone";

    export const FormPhoneInput = ({ value, onChange, ...props }) => {
      const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhoneNumber(e.target.value);
        onChange(formatted);
      };

      return (
        <FormField {...props}>
          <input
            type="tel"
            value={value}
            onChange={handleChange}
            placeholder="+91 12345 67890"
          />
        </FormField>
      );
    };
    ```

    **FormCurrencyInput**:

    ```typescript
    // src/components/forms/FormCurrencyInput.tsx
    import { FormNumberInput } from "./FormNumberInput";
    import { formatCurrency } from "@/lib/formatters/currency";

    export const FormCurrencyInput = ({ value, onChange, ...props }) => {
      return (
        <FormNumberInput
          value={value}
          onChange={onChange}
          prefix="₹"
          thousandSeparator=","
          decimalScale={2}
          {...props}
        />
      );
    };
    ```

    **FormFileUpload**:

    ```typescript
    // src/components/forms/FormFileUpload.tsx
    import { useMediaUpload } from "@/hooks/useMediaUpload"; // Reuse existing hook

    export const FormFileUpload = ({ onUpload, accept, maxSize }) => {
      const { upload, progress, error } = useMediaUpload();

      // ... implementation using existing hook
    };
    ```

- [ ] **Add Auto-Save to WizardForm**
  - **Enhance**: `src/components/forms/WizardForm.tsx`
  - **Reuse**: `useLocalStorage` hook
  - **Pattern**:
    ```typescript
    const WizardForm = ({ steps, onComplete }) => {
      const [currentStep, setCurrentStep] = useLocalStorage("wizard-step", 0);
      const [formData, setFormData] = useLocalStorage("wizard-data", {});

      // Auto-save on data change
      useEffect(() => {
        setFormData(formData);
      }, [formData]);

      // ... rest of implementation
    };
    ```

### 3.3 Authentication Enhancements

#### Actions

- [ ] **Implement Multi-Factor Authentication (MFA)**

  - **File**: `src/services/auth-mfa-service.ts`
  - **Use**: Firebase MFA
  - **Pattern**:

    ```typescript
    import { multiFactor, PhoneAuthProvider } from "firebase/auth";

    export const enrollMFA = async (phoneNumber: string) => {
      const user = auth.currentUser;
      const session = await multiFactor(user).getSession();
      const phoneInfoOptions = {
        phoneNumber,
        session,
      };
      const phoneAuthProvider = new PhoneAuthProvider(auth);
      const verificationId = await phoneAuthProvider.verifyPhoneNumber(
        phoneInfoOptions,
        verifier
      );
      return verificationId;
    };
    ```

- [ ] **Add Device Management**

  - **File**: `src/services/device-service.ts`
  - **Store**: Active devices in Firestore
  - **Features**: View devices, revoke sessions
  - **Pattern**:

    ```typescript
    interface Device {
      id: string;
      userId: string;
      deviceName: string;
      ipAddress: string;
      userAgent: string;
      lastActive: Timestamp;
    }

    export const deviceService = {
      async addDevice(userId: string, device: Omit<Device, "id" | "userId">) {
        // ... implementation
      },
      async getDevices(userId: string): Promise<Device[]> {
        // ... implementation
      },
      async revokeDevice(deviceId: string) {
        // ... implementation
      },
    };
    ```

- [ ] **Improve Token Refresh Logic**

  - **Enhance**: AuthContext token refresh
  - **Add**: Retry logic, background refresh
  - **Pattern**:
    ```typescript
    const refreshToken = async (retries = 3): Promise<string> => {
      try {
        const user = auth.currentUser;
        if (!user) throw new AuthError("No user logged in");

        const token = await user.getIdToken(true); // Force refresh
        return token;
      } catch (error) {
        if (retries > 0) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return refreshToken(retries - 1);
        }
        throw error;
      }
    };
    ```

- [ ] **Auto-Submit OTP**
  - **Enhance**: `src/components/auth/OTPInput.tsx`
  - **Pattern**:
    ```typescript
    const OTPInput = ({ length, onComplete }) => {
      const [otp, setOtp] = useState(Array(length).fill(""));

      useEffect(() => {
        if (otp.every((digit) => digit !== "")) {
          onComplete(otp.join(""));
        }
      }, [otp]);

      // ... rest of implementation
    };
    ```

### 3.4 Payment & Checkout Enhancements

#### Actions

- [ ] **Add More Payment Gateways**

  - **Current**: Razorpay, Stripe, PayPal, Shiprocket
  - **Add**: PhonePe, Google Pay, UPI
  - **File**: `src/services/payment-service.ts`
  - **Pattern**:

    ```typescript
    type PaymentMethod =
      | "razorpay"
      | "stripe"
      | "paypal"
      | "phonepe"
      | "googlepay"
      | "upi";

    export const paymentService = {
      async initiatePayment(
        method: PaymentMethod,
        amount: number,
        orderId: string
      ) {
        switch (method) {
          case "phonepe":
            return this.initiatePhonePe(amount, orderId);
          case "googlepay":
            return this.initiateGooglePay(amount, orderId);
          case "upi":
            return this.initiateUPI(amount, orderId);
          default:
            return this.initiateRazorpay(amount, orderId);
        }
      },
    };
    ```

- [ ] **Implement Split Payments**
  - **Use Case**: Multi-vendor orders
  - **File**: `src/services/split-payment-service.ts`
  - **Pattern**:
    ```typescript
    export const createSplitPayment = async (
      orderId: string,
      splits: Array<{ sellerId: string; amount: number }>
    ) => {
      // Calculate platform fee
      const platformFee = splits.reduce((sum, s) => sum + s.amount * 0.02, 0);

      // Create split payment in Razorpay
      const payment = await razorpay.payments.create({
        amount: splits.reduce((sum, s) => sum + s.amount, 0) + platformFee,
        splits: splits.map((s) => ({
          account: s.sellerId,
          amount: s.amount,
        })),
      });

      return payment;
    };
    ```

### 3.5 Search & Discovery

#### Actions

- [ ] **Implement Advanced Search**

  - **Consider**: Algolia or Typesense for better search
  - **File**: `src/services/search-service.ts`
  - **Features**:
    - Fuzzy matching
    - Autocomplete
    - Search suggestions
    - Filters (price, category, rating)
  - **Pattern**:

    ```typescript
    import algoliasearch from "algoliasearch";

    const client = algoliasearch(APP_ID, API_KEY);
    const index = client.initIndex("products");

    export const searchProducts = async (
      query: string,
      filters?: SearchFilters
    ) => {
      const { hits } = await index.search(query, {
        filters: buildFilterString(filters),
        hitsPerPage: 20,
      });
      return hits;
    };
    ```

- [ ] **Add Product Recommendations**
  - **File**: `src/services/recommendation-service.ts`
  - **Strategies**:
    - Similar products (collaborative filtering)
    - Frequently bought together
    - Based on browsing history
  - **Pattern**:
    ```typescript
    export const getRecommendations = async (
      productId: string,
      userId?: string
    ): Promise<Product[]> => {
      // Get similar products by category and tags
      const product = await productService.getById(productId);
      const similar = await productService.search({
        category: product.category,
        tags: product.tags,
        exclude: [productId],
      });

      // If user is logged in, personalize
      if (userId) {
        const userHistory = await userActivityService.getHistory(userId);
        return personalizeRecommendations(similar, userHistory);
      }

      return similar.slice(0, 10);
    };
    ```

---

## Implementation Guidelines

### Code Quality Standards

- **TypeScript**: Strict mode enabled, no `any`, prefer `unknown`
- **Testing**: 80%+ coverage for new code, unit + integration tests
- **Documentation**: JSDoc for all public APIs, inline comments for complex logic
- **Performance**: Lighthouse score > 90, Core Web Vitals passing
- **Accessibility**: WCAG 2.1 AA compliance, keyboard navigation, screen reader support

### Testing Strategy

```typescript
// Unit Tests
describe("productService", () => {
  it("should fetch product by ID", async () => {
    const product = await productService.getById("123");
    expect(product).toBeDefined();
    expect(product.id).toBe("123");
  });
});

// Integration Tests
describe("Checkout Flow", () => {
  it("should complete checkout with Razorpay", async () => {
    const { user } = await setupTestUser();
    await cartService.addItem("product-1");
    const order = await checkoutService.createOrder(user.id);
    const payment = await paymentService.initiatePayment(
      "razorpay",
      order.total,
      order.id
    );
    expect(payment.status).toBe("pending");
  });
});

// E2E Tests (Playwright)
test("user can complete purchase", async ({ page }) => {
  await page.goto("/products/123");
  await page.click('button:has-text("Add to Cart")');
  await page.click('a:has-text("Cart")');
  await page.click('button:has-text("Checkout")');
  await page.fill('input[name="address"]', "123 Main St");
  await page.click('button:has-text("Pay with Razorpay")');
  await expect(page).toHaveURL(/\/order\/.*\/success/);
});
```

### Migration Strategy

**For Each Phase:**

1. **Plan**: Identify affected files, dependencies
2. **Branch**: Create feature branch from `main`
3. **Implement**: Make changes incrementally
4. **Test**: Write tests, run existing tests
5. **Review**: Code review, performance check
6. **Deploy**: Deploy to staging, then production
7. **Monitor**: Watch logs, metrics, user feedback

**Breaking Changes:**

- Maintain backward compatibility where possible
- Use deprecation warnings for 1-2 releases
- Document migration path in CHANGELOG.md
- Provide codemods for automated migration

### Rollback Plan

- **Git**: Each phase in separate branch, can revert
- **Feature Flags**: Toggle new features on/off
- **Database**: Migrations are reversible
- **Monitoring**: Alert on error rate spikes, automatic rollback

---

## Success Metrics

### Phase 1 (Foundation & Security)

- [ ] 100% environment variables validated with Zod
- [ ] All API routes have rate limiting
- [ ] All services use typed errors
- [ ] Security audit passes (no critical vulnerabilities)

### Phase 2 (Performance & Architecture)

- [ ] Lighthouse performance score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3.5s
- [ ] Bundle size reduced by 20%
- [ ] All services extend BaseService

### Phase 3 (Feature Enhancements)

- [ ] All form hooks support schema validation
- [ ] MFA enrollment > 10% of users
- [ ] Search response time < 200ms
- [ ] Payment success rate > 95%
- [ ] 5+ new payment methods supported

---

## Dependencies & Prerequisites

### Required NPM Packages

```json
{
  "dependencies": {
    "zod": "^3.22.4",
    "@t3-oss/env-nextjs": "^0.7.1",
    "@tanstack/react-query": "^5.17.0",
    "@tanstack/react-virtual": "^3.0.1",
    "isomorphic-dompurify": "^2.0.0",
    "decimal.js": "^10.4.3"
  },
  "devDependencies": {
    "@playwright/test": "^1.40.1",
    "@testing-library/react": "^14.1.2",
    "@testing-library/jest-dom": "^6.1.5"
  }
}
```

### Firebase Configuration

- Enable Multi-Factor Authentication
- Configure Remote Config for feature flags
- Set up Firestore security rules audit
- Enable Performance Monitoring

### Environment Setup

```bash
# Install dependencies
npm install

# Set up Firebase emulators
firebase init emulators

# Set up environment variables
cp .env.example .env.local

# Run tests
npm run test

# Start development server
npm run dev
```

---

## Timeline & Resources

### Phase 1: 4 weeks

- **Week 1**: Type safety & validation (Zod, env config)
- **Week 2**: Security (permissions, rate limiting, input sanitization)
- **Week 3**: Error handling (typed errors, error boundaries)
- **Week 4**: Testing & review

**Resources**: 2 developers, 1 QA engineer

### Phase 2: 4 weeks

- **Week 5**: Context optimization (split contexts, lazy loading)
- **Week 6**: Service layer (base service, React Query)
- **Week 7**: Performance (skeletons, Suspense, code splitting)
- **Week 8**: Route organization & testing

**Resources**: 2 developers, 1 QA engineer

### Phase 3: 4 weeks

- **Week 9**: Hook enhancements (schema validation, async validation)
- **Week 10**: Form components (specialized inputs, auto-save)
- **Week 11**: Auth & payment enhancements (MFA, new gateways)
- **Week 12**: Search & recommendations, final testing

**Resources**: 3 developers, 1 QA engineer, 1 PM

---

## Risk Assessment

### High Risk

- **Context splitting**: May cause unexpected re-renders
- **Mitigation**: Thorough testing, gradual rollout with feature flags

### Medium Risk

- **Service layer refactoring**: Large surface area, many dependencies
- **Mitigation**: Refactor one service at a time, maintain backward compatibility

### Low Risk

- **Adding new hooks/components**: Additive changes, minimal impact
- **Mitigation**: Standard testing process

---

## Next Steps

1. **Review & Approve**: Stakeholder review of this plan
2. **Assign Tasks**: Assign specific tasks to developers
3. **Set Up Tracking**: Create Jira/GitHub issues for each action item
4. **Kick Off Phase 1**: Start with environment validation and type safety
5. **Weekly Sync**: Review progress, adjust plan as needed

---

## Appendix

### Related Documentation

- [NDocs/README.md](../NDocs/README.md) - Full documentation index
- [NDocs/state-management/README.md](../NDocs/state-management/README.md) - State management guide
- [DOCUMENTATION-SUMMARY.md](../DOCUMENTATION-SUMMARY.md) - Documentation overview

### Code Examples Repository

- `/refactor/examples/` - Full code examples for each pattern

### Questions & Support

- Create GitHub issue with `refactoring` label
- Slack: #engineering-refactoring
- Weekly office hours: Fridays 2-3pm IST
