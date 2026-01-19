# @letitrip/react-library Documentation

Complete documentation for all components, hooks, and utilities.

## 📚 Documentation Index

### Quick Links

- **[Components Reference](./components/index.md)** - All 115+ components documented
- **[Hooks Reference](./HOOKS.md)** - All 19 custom React hooks
- **[Utilities Reference](./UTILITIES.md)** - All 60+ utility functions
- **[Getting Started](./getting-started.md)** - Setup and basic usage
- **[Migration Guide](./migration-guide.md)** - Migrating from old codebase
- **[Service Adapters](./SERVICE-ADAPTERS.md)** - Data fetching patterns
- **[Data Fetching](./DATA-FETCHING.md)** - Query and mutation patterns
- **[Testing Guide](./testing.md)** - Testing components and hooks
- **[Changelog](./changelog.md)** - Version history

---

## 📦 What's Included

### Components (115+)

- **Value Display (21)**: DateDisplay, Price, Rating, Status badges, etc.
- **Forms (30)**: Complete form controls with validation
- **UI (36)**: Buttons, Cards, Modals, Tables, etc.
- **Cards (11)**: Product, Auction, Shop, Category cards
- **Tables (14)**: DataTable with sorting, filtering, pagination
- **Upload (4)**: Image/video upload with crop and preview
- **Search & Filters (6)**: Advanced filtering components
- **Pagination (3)**: Multiple pagination patterns
- **Selectors (6)**: Specialized input selectors
- **Wizards (4)**: Multi-step form wizards
- **Plus**: Layout, Navigation, Dashboard, Admin, and more

### Hooks (19)

- **Debounce & Throttle**: `useDebounce`, `useThrottle`
- **Filters**: `useFilters`, `useUrlFilters`
- **Storage**: `useLocalStorage`
- **Responsive**: `useMediaQuery`, `useBreakpoint`, `useViewport`
- **Utilities**: `useSafeLoad`, `useToggle`, `useCounter`, `useClipboard`
- **State Management**: `useCheckoutState`, `useConversationState`
- **Auth**: `useAuthState`, `useAuthActions`
- **Cart**: `useCart`, `useHeaderStats`
- **Upload**: `useMediaUpload`
- **Tables**: `useBulkSelection`, `useLoadingState`, `usePaginationState`
- **Forms**: `useFormState`, `useDialogState`, `useWizardFormState`
- **Data Fetching**: `useQuery`, `useMutation`

### Utilities (60+)

- **Formatters**: Currency, dates, numbers, phone, file size
- **Date Utils**: Format, parse, relative time, date math
- **Validators**: Email, phone, pincode, GST, PAN, URL, password
- **Sanitization**: HTML sanitization, XSS prevention
- **Price Utils**: Discount calculation, tax, total
- **Accessibility**: ARIA labels, focus management
- **Error Handling**: Logging, retry logic, formatting

---

## 🚀 Quick Start

### Installation

```bash
# In main app, import from:
import { ... } from '@letitrip/react-library'
```

### Basic Usage

#### Components

```tsx
import {
  Button,
  Card,
  FormInput,
  DataTable,
  ProductCard,
} from "@letitrip/react-library";

function MyComponent() {
  return (
    <Card title="Example">
      <FormInput name="email" label="Email" placeholder="Enter email" />
      <Button variant="primary">Submit</Button>
    </Card>
  );
}
```

#### Hooks

```tsx
import {
  useDebounce,
  useFilters,
  useQuery,
  useCart,
} from "@letitrip/react-library";

function ProductList() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const { filters, setFilter } = useFilters();

  const { data, loading } = useQuery({
    queryKey: ["products", debouncedSearch, filters],
    queryFn: () => fetchProducts({ search: debouncedSearch, ...filters }),
  });

  return (
    <div>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search products..."
      />
      {/* Product list */}
    </div>
  );
}
```

#### Utilities

```tsx
import {
  formatCurrency,
  formatDate,
  validateEmail,
  sanitizeHTML,
} from "@letitrip/react-library";

// Format values
const price = formatCurrency(1999.99); // ₹1,999.99
const date = formatDate(new Date()); // Dec 25, 2023

// Validate input
const isValid = validateEmail("user@example.com"); // true

// Sanitize content
const safe = sanitizeHTML(userContent);
```

---

## 📖 Detailed Documentation

### [Components Reference](./components/index.md)

Comprehensive documentation for all components including:

- Props and types
- Usage examples
- Variants and options
- Accessibility features
- Integration patterns

**Categories:**

- Value Display Components
- Form Components
- UI Components
- Upload Components
- Card Components
- Table Components
- Search & Filter Components
- Pagination Components
- Selector Components
- Wizard Components
- And 15+ more categories

### [Hooks Reference](./HOOKS.md)

Complete guide to all custom hooks including:

- Parameters and return values
- Usage patterns
- Composition examples
- Best practices
- Integration with components

**Categories:**

- Debounce & Throttle
- Filters & Search
- Storage
- Media Queries & Responsive
- State Management
- Context-Based
- Forms & Validation
- Data Fetching

### [Utilities Reference](./UTILITIES.md)

Full documentation for utility functions including:

- Function signatures
- Parameters and returns
- Usage examples
- Common patterns
- Composition examples

**Categories:**

- Formatters
- Date Utilities
- Validators
- Sanitization
- Price Utilities
- Accessibility
- Error Handling
- Data Fetching Adapters

---

## 💡 Common Patterns

### Data Table with Filters

```tsx
import {
  DataTable,
  FilterSidebar,
  AdvancedPagination,
  useFilters,
  usePaginationState,
  useQuery
} from '@letitrip/react-library';

function UserManagement() {
  const { filters, setFilter, clearFilters } = useFilters({
    initialFilters: { status: 'active' }
  });
  const { page, setPage } = usePaginationState();

  const { data, loading } = useQuery({
    queryKey: ['users', filters, page],
    queryFn: () => fetchUsers({ ...filters, page })
  });

  return (
    <div className="grid grid-cols-4 gap-4">
      <FilterSidebar
        filters={[
          { key: 'status', label: 'Status', type: 'select', options: [...] },
          { key: 'role', label: 'Role', type: 'select', options: [...] }
        ]}
        values={filters}
        onChange={(key, value) => setFilter(key, value)}
        onClear={clearFilters}
      />

      <div className="col-span-3">
        <DataTable
          columns={[
            { key: 'name', label: 'Name', sortable: true },
            { key: 'email', label: 'Email' },
            { key: 'status', label: 'Status' }
          ]}
          data={data?.users}
          loading={loading}
        />

        <AdvancedPagination
          page={page}
          total={data?.total}
          pageSize={10}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
```

### Multi-Step Form Wizard

```tsx
import {
  WizardForm,
  WizardSteps,
  WizardActionBar,
  FormInput,
  useWizardFormState,
  useFormState,
  useMutation,
} from "@letitrip/react-library";

function CreateShopWizard() {
  const wizard = useWizardFormState({
    steps: ["basic", "details", "verification"],
  });

  const form = useFormState({
    initialValues: {},
    validate: validateShopData,
    onSubmit: async (values) => {
      await createShop(values);
    },
  });

  const { mutate, loading } = useMutation({
    mutationFn: (data) => createShop(data),
    onSuccess: () => router.push("/shops"),
  });

  return (
    <WizardForm>
      <WizardSteps
        steps={[
          { id: "basic", label: "Basic Info" },
          { id: "details", label: "Shop Details" },
          { id: "verification", label: "Verification" },
        ]}
        currentStep={wizard.currentStep}
      />

      {wizard.currentStepId === "basic" && (
        <div>
          <FormInput
            name="name"
            label="Shop Name"
            value={form.values.name}
            onChange={(e) => form.handleChange("name", e.target.value)}
            error={form.errors.name}
          />
        </div>
      )}

      <WizardActionBar
        currentStep={wizard.currentStep}
        totalSteps={3}
        onPrevious={wizard.previousStep}
        onNext={wizard.nextStep}
        onSubmit={form.handleSubmit}
        isValid={form.isValid}
      />
    </WizardForm>
  );
}
```

### Product Grid with Search

```tsx
import {
  SearchBar,
  ProductCard,
  LoadingSpinner,
  useDebounce,
  useQuery,
} from "@letitrip/react-library";

function ProductGrid() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const { data, loading } = useQuery({
    queryKey: ["products", debouncedSearch],
    queryFn: () => searchProducts(debouncedSearch),
  });

  return (
    <div>
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search products..."
      />

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {data?.products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => navigate(`/products/${product.id}`)}
              showActions
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 🎨 Design System

### CSS Tokens

200+ design tokens for consistent styling:

- Colors (primary, secondary, semantic)
- Typography (font sizes, weights, line heights)
- Spacing (margins, paddings)
- Borders & Radii
- Shadows & Effects
- Breakpoints

### Tailwind Integration

Pre-configured Tailwind with:

- Custom color palette
- Extended spacing scale
- Custom breakpoints
- Animation utilities
- Dark mode support

### Dark Mode

All components support dark mode:

```tsx
<ThemeToggle theme={theme} onToggle={() => setTheme(...)} />
```

---

## ♿ Accessibility

All components follow accessibility best practices:

- Semantic HTML
- ARIA labels and roles
- Keyboard navigation
- Focus management
- Screen reader support
- Color contrast compliance

---

## 📱 Responsive Design

Mobile-first approach with:

- Breakpoint utilities
- Responsive components
- Touch-friendly interactions
- Mobile-specific components
- Adaptive layouts

---

## 🧪 Testing

Comprehensive test coverage:

- Component unit tests
- Hook tests
- Utility function tests
- Integration tests
- Accessibility tests

See [Testing Guide](./testing.md) for details.

---

## 🔧 Advanced Topics

### Custom Service Adapters

Learn how to create custom service adapters for different backends.
See [Service Adapters](./SERVICE-ADAPTERS.md).

### Data Fetching Patterns

Advanced patterns for data fetching with caching and optimistic updates.
See [Data Fetching](./DATA-FETCHING.md).

### Migration Guide

Step-by-step guide for migrating from old codebase.
See [Migration Guide](./migration-guide.md).

---

## 📝 Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for contribution guidelines.

---

## 📄 License

MIT License - see [LICENSE](../LICENSE) for details.

---

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/letitrip/react-library/issues)
- **Discussions**: [GitHub Discussions](https://github.com/letitrip/react-library/discussions)
- **Email**: support@letitrip.com

---

## 🎯 What's Next?

- [ ] More specialized components
- [ ] Additional hooks for common patterns
- [ ] Performance optimizations
- [ ] More comprehensive examples
- [ ] Video tutorials
- [ ] Interactive playground

---

**Last Updated**: January 19, 2026  
**Version**: 1.0.1
