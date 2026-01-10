# Constants

This folder contains application-wide constants, enums, and configuration values.

## Key Constants Files

### site.ts

**Purpose:** Site-wide settings

**Exports:**

- `SITE_NAME` - "LetItRip.in"
- `SITE_URL` - Base URL
- `COMPANY_INFO` - Company details
- `CONTACT_INFO` - Contact information
- `SOCIAL_LINKS` - Social media links
- `SEO_DEFAULTS` - Default SEO values

---

### navigation.ts

**Purpose:** Navigation menu structure

**Exports:**

- `MAIN_NAV` - Main navigation items
- `USER_NAV` - User menu items
- `ADMIN_NAV` - Admin panel navigation
- `SELLER_NAV` - Seller dashboard navigation
- `FOOTER_NAV` - Footer links

---

### routes.ts

**Purpose:** Application routes

**Exports:**

- `PUBLIC_ROUTES` - Public page paths
- `AUTH_ROUTES` - Authentication paths
- `PROTECTED_ROUTES` - Protected page paths
- `API_ROUTES` - API endpoint paths

---

### limits.ts

**Purpose:** Application limits and constraints

**Exports:**

- `MAX_FILE_SIZE` - Maximum upload size
- `MAX_IMAGES_PER_PRODUCT` - Image limit
- `MAX_CART_ITEMS` - Cart size limit
- `MAX_COMPARISON_PRODUCTS` - Comparison limit
- `PAGINATION_LIMITS` - Items per page
- `RATE_LIMITS` - API rate limits

---

### statuses.ts

**Purpose:** Status enums

**Exports:**

- `OrderStatus` - Order statuses
- `PaymentStatus` - Payment statuses
- `AuctionStatus` - Auction statuses
- `ProductStatus` - Product statuses
- `ShipmentStatus` - Shipping statuses

```typescript
export const OrderStatus = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
} as const;
```

---

### validation-constants.ts

**Purpose:** Validation rules

**Exports:**

- `PASSWORD_MIN_LENGTH` - Minimum password length
- `USERNAME_MIN_LENGTH` - Minimum username length
- `PHONE_PATTERN` - Phone number regex
- `EMAIL_PATTERN` - Email regex
- `PINCODE_PATTERN` - Pincode regex
- `GST_PATTERN` - GST number pattern

---

### validation-messages.ts

**Purpose:** Validation error messages

**Exports:**

- `REQUIRED_FIELD` - "This field is required"
- `INVALID_EMAIL` - "Invalid email address"
- `INVALID_PHONE` - "Invalid phone number"
- `PASSWORD_TOO_SHORT` - Password error messages

---

### error-messages.ts

**Purpose:** User-facing error messages

**Exports:**

- `GENERIC_ERROR` - "Something went wrong"
- `NETWORK_ERROR` - "Network error. Please try again"
- `AUTH_ERRORS` - Authentication error messages
- `VALIDATION_ERRORS` - Validation error messages

---

### media.ts

**Purpose:** Media/file constants

**Exports:**

- `ALLOWED_IMAGE_TYPES` - ['image/jpeg', 'image/png', 'image/webp']
- `ALLOWED_VIDEO_TYPES` - Allowed video types
- `MAX_IMAGE_SIZE` - Maximum image size
- `IMAGE_QUALITY` - Compression quality
- `THUMBNAIL_SIZE` - Thumbnail dimensions

---

### colors.ts

**Purpose:** Brand colors and theme colors

**Exports:**

- `PRIMARY_COLOR` - Yellow (#FACC15)
- `SECONDARY_COLOR` - Gray
- `SUCCESS_COLOR` - Green
- `ERROR_COLOR` - Red
- `WARNING_COLOR` - Orange
- `INFO_COLOR` - Blue

---

### categories.ts

**Purpose:** Product category constants

**Exports:**

- `PRODUCT_CATEGORIES` - Category list
- `CATEGORY_ICONS` - Icons per category
- `CATEGORY_COLORS` - Colors per category

---

### filters.ts

**Purpose:** Filter constants

**Exports:**

- `PRICE_RANGES` - Predefined price ranges
- `SORT_OPTIONS` - Sorting options
- `FILTER_OPERATORS` - Filter operators

---

### time-constants.ts

**Purpose:** Time-related constants

**Exports:**

- `MILLISECONDS_PER_SECOND` - 1000
- `SECONDS_PER_MINUTE` - 60
- `MINUTES_PER_HOUR` - 60
- `HOURS_PER_DAY` - 24
- `DAYS_PER_WEEK` - 7
- `SESSION_TIMEOUT` - 30 minutes
- `TOKEN_EXPIRY` - 1 hour

---

### storage.ts

**Purpose:** Storage keys

**Exports:**

- `STORAGE_KEYS` - localStorage/sessionStorage keys

```typescript
export const STORAGE_KEYS = {
  AUTH_TOKEN: "auth_token",
  CART: "guest_cart",
  THEME: "theme_preference",
  RECENT_SEARCHES: "recent_searches",
} as const;
```

---

### api-routes.ts

**Purpose:** API endpoint paths

**Exports:**

- `API_ENDPOINTS` - All API routes

```typescript
export const API_ENDPOINTS = {
  products: "/api/products",
  orders: "/api/orders",
  auth: {
    login: "/api/auth/login",
    register: "/api/auth/register",
  },
} as const;
```

---

### ui-constants.ts

**Purpose:** UI-related constants

**Exports:**

- `BREAKPOINTS` - Responsive breakpoints
- `ANIMATION_DURATION` - Animation timings
- `Z_INDEX` - Z-index layers
- `TOAST_DURATION` - Toast display time

---

### location.ts

**Purpose:** Location constants

**Exports:**

- `INDIAN_STATES` - List of Indian states
- `DEFAULT_COUNTRY` - 'India'
- `CURRENCY` - 'INR'
- `CURRENCY_SYMBOL` - '₹'

---

### whatsapp-templates.ts

**Purpose:** WhatsApp message templates

**Exports:**

- `ORDER_CONFIRMATION` - Order confirmation template
- `SHIPPING_UPDATE` - Shipping update template
- `DELIVERY_NOTIFICATION` - Delivery template

---

### faq.ts

**Purpose:** FAQ content

**Exports:**

- `FAQ_ITEMS` - Frequently asked questions

---

### footer.ts

**Purpose:** Footer content and links

**Exports:**

- `FOOTER_COLUMNS` - Footer column structure
- `FOOTER_COPYRIGHT` - Copyright text
- `FOOTER_LINKS` - Footer navigation

---

### tabs.ts

**Purpose:** Tab configurations

**Exports:**

- `PRODUCT_TABS` - Product page tabs
- `SHOP_TABS` - Shop page tabs
- `USER_PROFILE_TABS` - Profile tabs

---

## Common Patterns

### Const Assertions

```typescript
export const ORDER_STATUSES = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
} as const;

// Type: 'pending' | 'confirmed'
type OrderStatus = (typeof ORDER_STATUSES)[keyof typeof ORDER_STATUSES];
```

### Readonly Arrays

```typescript
export const ALLOWED_ROLES = ["admin", "seller", "buyer"] as const;

// Type: readonly ["admin", "seller", "buyer"]
type Role = (typeof ALLOWED_ROLES)[number]; // "admin" | "seller" | "buyer"
```

### Enums vs Constants

```typescript
// ❌ Avoid enums
enum Status {
  PENDING,
  ACTIVE,
}

// ✅ Prefer const objects
export const Status = {
  PENDING: "pending",
  ACTIVE: "active",
} as const;
```

---

## Best Practices

### Naming

- Use SCREAMING_SNAKE_CASE for constants
- Use PascalCase for const objects
- Group related constants together

### Organization

- One file per domain/feature
- Export const objects, not individual values
- Use `as const` for immutability

### Type Safety

- Use `as const` for literal types
- Extract types from constants
- Use discriminated unions

### Documentation

- Document complex constants
- Explain magic numbers
- Provide usage examples
