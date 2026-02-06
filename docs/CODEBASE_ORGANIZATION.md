# Codebase Organization

## 📁 Directory Structure

The codebase has been refactored into a highly organized structure with clear separation of concerns:

```
src/
├── components/          # React components
├── hooks/              # Custom React hooks
├── contexts/           # React contexts
├── constants/          # Application constants
├── utils/              # Pure utility functions (organized by category)
│   ├── validators/     # Input validation utilities
│   ├── formatters/     # Data formatting utilities
│   ├── converters/     # Type conversion utilities
│   └── events/         # Event management utilities
├── helpers/            # Business logic helpers
│   ├── auth/          # Authentication helpers
│   ├── data/          # Data manipulation helpers
│   └── ui/            # UI-specific helpers
├── classes/            # Class-based modules
├── snippets/           # Reusable code patterns
├── lib/               # External library integrations
├── repositories/      # Data access layer
├── db/                # Database schemas
└── types/             # TypeScript type definitions
```

---

## 🛠️ Utils (Pure Functions)

**Location**: `src/utils/`

Pure utility functions organized by category. These functions have no side effects and don't depend on application state.

### Validators (`src/utils/validators/`)

Input validation functions for various data types:

```typescript
import {
  isValidEmail,
  isValidPhone,
  meetsPasswordRequirements,
  isValidUrl,
} from "@/utils/validators";

// Email validation
if (isValidEmail("user@example.com")) {
  // Valid email
}

// Password validation
const { valid, missing } = meetsPasswordRequirements(password);

// Phone validation
if (isValidPhone("+1234567890")) {
  // Valid phone
}
```

**Files**:

- `email.validator.ts` - Email validation
- `password.validator.ts` - Password validation & strength
- `phone.validator.ts` - Phone number validation
- `url.validator.ts` - URL validation
- `input.validator.ts` - General input validation

### Formatters (`src/utils/formatters/`)

Data formatting utilities:

```typescript
import {
  formatDate,
  formatCurrency,
  capitalize,
  formatFileSize,
} from "@/utils/formatters";

// Date formatting
formatDate(new Date()); // "2/7/2026"
formatRelativeTime(yesterday); // "1 day ago"

// Number formatting
formatCurrency(1234.56); // "$1,234.56"
formatFileSize(1024 * 1024); // "1 MB"

// String formatting
capitalize("hello world"); // "Hello world"
slugify("Hello World!"); // "hello-world"
```

**Files**:

- `date.formatter.ts` - Date & time formatting
- `number.formatter.ts` - Number & currency formatting
- `string.formatter.ts` - String manipulation

### Converters (`src/utils/converters/`)

Type conversion utilities:

```typescript
import { arrayToObject, csvToArray, flattenObject } from "@/utils/converters";

// Array to object
const obj = arrayToObject(users, "id");

// CSV parsing
const data = csvToArray(csvString);

// Object flattening
const flat = flattenObject({ a: { b: { c: 1 } } });
// Result: { 'a.b.c': 1 }
```

### Events (`src/utils/events/`)

Event management utilities (moved from `eventHandlers.ts`):

```typescript
import {
  globalEventManager,
  throttle,
  debounce,
  addGlobalScrollHandler,
} from "@/utils/events";

// Throttle function
const throttledFn = throttle(expensiveFunction, 200);

// Debounce function
const debouncedFn = debounce(searchFunction, 300);

// Global scroll handler
const handlerId = addGlobalScrollHandler(handleScroll, { throttle: 100 });
```

---

## 🤝 Helpers (Business Logic)

**Location**: `src/helpers/`

Business logic helpers that may depend on application context but are reusable across components.

### Auth Helpers (`src/helpers/auth/`)

```typescript
import {
  hasRole,
  canChangeRole,
  generateInitials,
  isSessionExpired,
} from "@/helpers/auth";

// Role checking
if (hasRole(user.role, "admin")) {
  // User is admin or higher
}

// Permission checking
if (canChangeRole(currentUser.role, targetUser.role, "moderator")) {
  // Can promote user
}

// Generate initials
const initials = generateInitials("John Doe"); // "JD"
```

**Files**:

- `auth.helper.ts` - Role & permission helpers
- `token.helper.ts` - Token generation & validation

### Data Helpers (`src/helpers/data/`)

```typescript
import { groupBy, sortBy, paginate, deepMerge } from "@/helpers/data";

// Group array by key
const grouped = groupBy(users, "role");

// Sort array
const sorted = sortBy(products, "price", "desc");

// Paginate data
const page = paginate(items, 1, 10);

// Deep merge objects
const merged = deepMerge(obj1, obj2);
```

**Files**:

- `array.helper.ts` - Array manipulation
- `object.helper.ts` - Object manipulation
- `pagination.helper.ts` - Pagination utilities
- `sorting.helper.ts` - Sorting utilities

### UI Helpers (`src/helpers/ui/`)

```typescript
import { classNames, lightenColor, animate, fadeIn } from "@/helpers/ui";

// Conditional class names
const classes = classNames("base-class", isActive && "active", "another-class");

// Color manipulation
const lighter = lightenColor("#3b82f6", 20);

// Animation
animate(0, 100, 300, (value) => {
  element.style.opacity = String(value / 100);
});
```

**Files**:

- `color.helper.ts` - Color manipulation
- `style.helper.ts` - CSS class utilities
- `animation.helper.ts` - Animation helpers

---

## 🏗️ Classes (Stateful Modules)

**Location**: `src/classes/`

Singleton class-based modules for managing stateful operations:

### CacheManager

```typescript
import { cacheManager } from "@/classes";

// Set cache with TTL
cacheManager.set("user-123", userData, { ttl: 5 * 60 * 1000 });

// Get from cache
const user = cacheManager.get("user-123");

// Clear expired entries
cacheManager.cleanExpired();
```

### StorageManager

```typescript
import { storageManager } from "@/classes";

// Save to localStorage
storageManager.set("preferences", { theme: "dark" });

// Get from localStorage
const prefs = storageManager.get("preferences");

// Use sessionStorage
storageManager.set("tempData", data, { type: "session" });
```

### Logger

```typescript
import { logger } from "@/classes";

// Log messages
logger.info("User logged in", { userId: "123" });
logger.error("API request failed", { error });

// Get logs
const logs = logger.getLogs("error");

// Export logs
const json = logger.export();
```

### EventBus

```typescript
import { eventBus } from "@/classes";

// Subscribe to event
const sub = eventBus.on("user-updated", (user) => {
  console.log("User updated:", user);
});

// Emit event
eventBus.emit("user-updated", updatedUser);

// Unsubscribe
sub.unsubscribe();
```

### Queue

```typescript
import { Queue } from "@/classes";

const queue = new Queue({ concurrency: 3 });

// Add tasks
queue.add("task-1", async () => await fetchData(), 1);
queue.add("task-2", async () => await processData(), 0);

// Wait for completion
await queue.waitForCompletion();
```

**Files**:

- `CacheManager.ts` - In-memory caching
- `StorageManager.ts` - localStorage/sessionStorage wrapper
- `Logger.ts` - Application logging
- `EventBus.ts` - Event-driven communication
- `Queue.ts` - Task queue management

---

## 📝 Snippets (Reusable Patterns)

**Location**: `src/snippets/`

Common code patterns and custom hooks for rapid development:

### React Hooks

```typescript
import {
  useDebounce,
  useLocalStorage,
  useToggle,
  useMediaQuery,
} from "@/snippets";

// Debounce value
const debouncedSearch = useDebounce(searchTerm, 500);

// Persist in localStorage
const [theme, setTheme] = useLocalStorage("theme", "light");

// Toggle boolean
const [isOpen, toggle] = useToggle(false);

// Media query
const isMobile = useMediaQuery("(max-width: 768px)");
```

### API Requests

```typescript
import { apiRequest, retryRequest, batchRequests } from "@/snippets";

// Simple API request
const { data, error } = await apiRequest("/api/users");

// Retry on failure
const result = await retryRequest(() => fetchData(), 3, 1000);

// Batch requests
const results = await batchRequests(requests, 5);
```

### Form Validation

```typescript
import { validateForm, validationRules, createValidator } from "@/snippets";

// Create validator
const validate = createValidator({
  email: [validationRules.required(), validationRules.email()],
  password: [validationRules.required(), validationRules.minLength(8)],
});

// Validate form
const { isValid, errors } = validate(formData);
```

### Performance Optimization

```typescript
import { memoize, preloadImages, cachedFetch } from "@/snippets";

// Memoize expensive function
const memoizedFn = memoize(expensiveCalculation);

// Preload images
await preloadImages(["/img1.jpg", "/img2.jpg"]);

// Cached API requests
const data = await cachedFetch("/api/data", 5 * 60 * 1000);
```

**Files**:

- `react-hooks.snippet.ts` - Custom React hooks
- `api-requests.snippet.ts` - API request patterns
- `form-validation.snippet.ts` - Form validation patterns
- `performance.snippet.ts` - Performance optimization patterns

---

## 📦 Import Patterns

### Direct Imports (Recommended)

```typescript
// Import specific utilities
import { isValidEmail, formatDate } from "@/utils";
import { hasRole, generateInitials } from "@/helpers";
import { cacheManager, logger } from "@/classes";
import { useDebounce, apiRequest } from "@/snippets";
```

### Category Imports

```typescript
// Import from specific categories
import { isValidEmail } from "@/utils/validators";
import { formatDate } from "@/utils/formatters";
import { hasRole } from "@/helpers/auth";
import { groupBy } from "@/helpers/data";
```

### Barrel Exports

All modules are re-exported through barrel files:

```typescript
// From main index
import { Button, isValidEmail, hasRole } from "@/index";

// From category index
import * as validators from "@/utils/validators";
import * as helpers from "@/helpers";
```

---

## 🎯 Benefits

### 1. **Clear Organization**

- Functions grouped by purpose
- Easy to find what you need
- Consistent file structure

### 2. **Reusability**

- DRY principle applied
- No code duplication
- Modular design

### 3. **Type Safety**

- Full TypeScript support
- Type inference
- IDE autocomplete

### 4. **Performance**

- Tree-shaking friendly
- Lazy loading support
- Memoization patterns

### 5. **Maintainability**

- Single responsibility
- Easy to test
- Clear dependencies

### 6. **Scalability**

- Easy to add new utilities
- No breaking changes
- Backward compatible

---

## 🔄 Migration Guide

### Old Pattern (eventHandlers.ts)

```typescript
import { globalEventManager } from "@/utils/eventHandlers";
```

### New Pattern

```typescript
import { globalEventManager } from "@/utils/events";
// or
import { globalEventManager } from "@/utils";
// or
import { globalEventManager } from "@/index";
```

Both old and new patterns work due to backward compatibility exports!

---

## 📚 Next Steps

1. **Explore the code**: Browse each category to see available utilities
2. **Use in your components**: Import and use in your React components
3. **Add new utilities**: Follow the established patterns
4. **Update tests**: Ensure all utilities are tested
5. **Update documentation**: Keep this guide up-to-date

---

## 🤝 Contributing

When adding new utilities:

1. Choose the appropriate category
2. Follow naming conventions
3. Add JSDoc comments
4. Export from category index
5. Add usage examples
6. Write tests

---

**Happy Coding! 🚀**
