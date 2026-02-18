# Components

> Reusable React components for building the LetItRip.in application

## Overview

This directory contains all React components organized by feature and purpose. All components use TypeScript, are fully typed, and follow consistent styling patterns using Tailwind CSS and THEME_CONSTANTS.

## Import

All components are exported through the barrel file:

```typescript
import { Button, Card, FormField, Modal, DataTable } from "@/components";
```

## Directory Structure

```
components/
├── ui/               # Base UI components (Button, Card, Input, etc.)
├── forms/            # Form components (Input, Select, Checkbox, etc.)
├── layout/           # Layout components (Header, Footer, Sidebar, etc.)
├── feedback/         # Feedback components (Alert, Modal, Toast, etc.)
├── auth/             # Authentication-related components
├── profile/          # User profile components
├── admin/            # Admin dashboard components
├── user/             # User dashboard components
├── homepage/         # Homepage sections
├── faq/              # FAQ-related components
├── modals/           # Modal dialogs
├── typography/       # Typography components
├── utility/          # Utility components (Search, BackToTop, etc.)
├── providers/        # Context providers
├── FormField.tsx     # Unified form field component
├── ErrorBoundary.tsx # Error boundary wrapper
├── AvatarDisplay.tsx # Avatar display component
├── AvatarUpload.tsx  # Avatar upload component
├── LayoutClient.tsx  # Client-side layout wrapper
├── PasswordStrengthIndicator.tsx # Password strength indicator
├── Text.tsx          # Text wrapper component
└── index.ts          # Barrel export
```

---

## 🎨 UI Components

**Location**: `src/components/ui/`

Base components for building interfaces:

| Component      | Purpose              | Key Props                                      |
| -------------- | -------------------- | ---------------------------------------------- |
| `Button`       | Action buttons       | `variant`, `size`, `disabled`, `loading`       |
| `Card`         | Content containers   | `variant`, `padding`, `hoverable`, `clickable` |
| `Badge`        | Status indicators    | `variant`, `size`, `rounded`                   |
| `Avatar`       | User avatars         | `src`, `alt`, `size`, `fallback`               |
| `Alert`        | Alert messages       | `type`, `title`, `message`, `closable`         |
| `Modal`        | Dialog overlays      | `isOpen`, `onClose`, `title`, `size`           |
| `Pagination`   | Page navigation      | `currentPage`, `totalPages`, `onPageChange`    |
| `Tabs`         | Tabbed interfaces    | `tabs`, `activeTab`, `onChange`                |
| `Accordion`    | Collapsible sections | `items`, `defaultOpen`, `allowMultiple`        |
| `Tooltip`      | Context help         | `content`, `position`, `trigger`               |
| `Dropdown`     | Dropdown menus       | `items`, `onSelect`, `trigger`                 |
| `Menu`         | Navigation menus     | `items`, `orientation`, `onSelect`             |
| `Progress`     | Progress bars        | `value`, `max`, `showLabel`, `color`           |
| `Spinner`      | Loading spinners     | `size`, `color`                                |
| `Skeleton`     | Loading placeholders | `width`, `height`, `variant`                   |
| `ImageGallery` | Image carousels      | `images`, `autoPlay`, `interval`               |
| `Divider`      | Visual separators    | `orientation`, `color`, `spacing`              |

**Example:**

```typescript
import { Button, Card, Badge, Modal } from '@/components';
import { UI_LABELS } from '@/constants';

function ProductCard({ product }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <Card hoverable>
      <Badge variant="success">{UI_LABELS.STATUS.ACTIVE}</Badge>
      <h3>{product.name}</h3>
      <p>₹{product.price}</p>
      <Button onClick={() => setIsModalOpen(true)}>
        {UI_LABELS.ACTIONS.VIEW_DETAILS}
      </Button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={product.name}
      >
        {/* Product details */}
      </Modal>
    </Card>
  );
}
```

---

## 📝 Form Components

**Location**: `src/components/forms/`

Components for building forms:

| Component   | Purpose                | Key Props                                        |
| ----------- | ---------------------- | ------------------------------------------------ |
| `Input`     | Text inputs            | `type`, `value`, `onChange`, `error`, `disabled` |
| `Textarea`  | Multi-line text inputs | `value`, `onChange`, `rows`, `maxLength`         |
| `Select`    | Dropdown selections    | `options`, `value`, `onChange`, `multiple`       |
| `Checkbox`  | Boolean selections     | `checked`, `onChange`, `label`, `disabled`       |
| `Radio`     | Single selections      | `options`, `value`, `onChange`, `name`           |
| `Toggle`    | Boolean switches       | `checked`, `onChange`, `label`, `size`           |
| `Slider`    | Range selections       | `min`, `max`, `value`, `onChange`, `step`        |
| `Form`      | Form wrapper           | `onSubmit`, `loading`, `error`                   |
| `FormField` | Unified field wrapper  | `type`, `label`, `error`, `helpText`             |

**Example:**

```typescript
import { FormField, Button } from '@/components';
import { UI_LABELS, UI_PLACEHOLDERS, UI_HELP_TEXT } from '@/constants';
import { useForm } from '@/hooks';

function RegisterForm() {
  const { values, errors, handleChange, handleSubmit } = useForm({
    email: '',
    password: ''
  });

  return (
    <form onSubmit={handleSubmit}>
      <FormField
        type="email"
        name="email"
        label={UI_LABELS.FORM.EMAIL}
        placeholder={UI_PLACEHOLDERS.EMAIL}
        value={values.email}
        onChange={handleChange}
        error={errors.email}
      />

      <FormField
        type="password"
        name="password"
        label={UI_LABELS.FORM.PASSWORD}
        placeholder={UI_PLACEHOLDERS.PASSWORD}
        value={values.password}
        onChange={handleChange}
        error={errors.password}
        helpText={UI_HELP_TEXT.PASSWORD_REQUIREMENTS}
      />

      <Button type="submit">
        {UI_LABELS.ACTIONS.SUBMIT}
      </Button>
    </form>
  );
}
```

---

## 🧭 Layout Components

**Location**: `src/components/layout/`

Components for page structure:

| Component      | Purpose                     |
| -------------- | --------------------------- |
| `Header`       | Site header with navigation |
| `Footer`       | Site footer with links      |
| `Sidebar`      | Side navigation panel       |
| `MainNavbar`   | Main navigation bar         |
| `BottomNavbar` | Mobile bottom navigation    |
| `Breadcrumbs`  | Navigation breadcrumbs      |
| `TitleBar`     | Page title bar              |
| `NavItem`      | Navigation item             |

**Example:**

```typescript
import { Header, Footer, Sidebar } from '@/components';

function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}
```

---

## 💬 Feedback Components

**Location**: `src/components/feedback/`

Components for user feedback:

| Component | Purpose             | Key Props                                 |
| --------- | ------------------- | ----------------------------------------- |
| `Alert`   | Alert messages      | `type`, `title`, `message`, `closable`    |
| `Modal`   | Dialog overlays     | `isOpen`, `onClose`, `title`, `size`      |
| `Toast`   | Toast notifications | `type`, `message`, `duration`, `position` |

---

## 🔐 Auth Components

**Location**: `src/components/auth/`

Authentication-related components:

| Component                 | Purpose                     |
| ------------------------- | --------------------------- |
| `LoginForm`               | User login form             |
| `RegisterForm`            | User registration form      |
| `ForgotPasswordForm`      | Password reset request form |
| `ResetPasswordForm`       | Password reset form         |
| `EmailVerificationBanner` | Email verification prompt   |

---

## 👤 Profile Components

**Location**: `src/components/profile/`

User profile management components:

| Component                | Purpose                           |
| ------------------------ | --------------------------------- |
| `ProfileGeneralSection`  | General profile information       |
| `ProfileAccountSection`  | Account settings                  |
| `ProfileSecuritySection` | Security settings (password, 2FA) |
| `ProfilePhoneSection`    | Phone number management           |

---

## 🎯 Admin Components

**Location**: `src/components/admin/`

Admin dashboard components:

| Component              | Purpose                                                                    |
| ---------------------- | -------------------------------------------------------------------------- |
| `AdminTabs`            | Admin navigation tabs                                                      |
| `AdminStatsCards`      | Statistics cards                                                           |
| `AdminSessionsManager` | Session management                                                         |
| `DataTable`            | Data table with sorting/filtering                                          |
| `RichTextEditor`       | WYSIWYG editor                                                             |
| `SideDrawer`           | Slide-in panel for CRUD operations (full-width mobile, half-width desktop) |
| `ImageUpload`          | Image upload component                                                     |
| `GridEditor`           | Grid layout editor                                                         |
| `CategoryTreeView`     | Hierarchical category tree                                                 |

**Example:**

```typescript
import { DataTable, AdminTabs } from '@/components';

function UsersManagement() {
  const { data: users, loading } = useApiQuery(API_ENDPOINTS.PRODUCTS.LIST);

  return (
    <>
      <AdminTabs />
      <DataTable
        data={users}
        columns={[
          { key: 'name', label: 'Name', sortable: true },
          { key: 'email', label: 'Email', sortable: true },
          { key: 'role', label: 'Role', sortable: true },
          { key: 'createdAt', label: 'Joined', sortable: true }
        ]}
        loading={loading}
        pagination
        searchable
      />
    </>
  );
}
```

---

## 👥 User Components

**Location**: `src/components/user/`

User dashboard components:

| Component  | Purpose              |
| ---------- | -------------------- |
| `UserTabs` | User navigation tabs |

---

## 🏠 Homepage Components

**Location**: `src/components/homepage/`

Homepage sections:

| Component                  | Purpose                   |
| -------------------------- | ------------------------- |
| `HeroCarousel`             | Hero image carousel       |
| `WelcomeSection`           | Welcome banner            |
| `FeaturedProductsSection`  | Featured products display |
| `FeaturedAuctionsSection`  | Featured auctions display |
| `TopCategoriesSection`     | Popular categories        |
| `FAQSection`               | FAQ accordion             |
| `CustomerReviewsSection`   | Customer testimonials     |
| `WhatsAppCommunitySection` | WhatsApp community CTA    |
| `AdvertisementBanner`      | Advertisement banners     |
| `BlogArticlesSection`      | Blog articles display     |

---

## ❓ FAQ Components

**Location**: `src/components/faq/`

FAQ-related components:

| Component            | Purpose                   |
| -------------------- | ------------------------- |
| `FAQAccordion`       | FAQ accordion display     |
| `FAQSearchBar`       | FAQ search input          |
| `FAQCategorySidebar` | FAQ category filter       |
| `FAQHelpfulButtons`  | Helpful/Not helpful votes |
| `FAQSortDropdown`    | FAQ sorting options       |
| `RelatedFAQs`        | Related FAQs display      |
| `ContactCTA`         | Contact support CTA       |

---

## 🪟 Modal Components

**Location**: `src/components/modals/`

Specialized modal dialogs:

| Component            | Purpose                           | Key Props                                    |
| -------------------- | --------------------------------- | -------------------------------------------- |
| `ConfirmDeleteModal` | Confirmation dialog for deletions | `isOpen`, `onClose`, `onConfirm`, `itemName` |
| `ImageCropModal`     | Image cropping interface          | `isOpen`, `image`, `onCrop`, `aspectRatio`   |

**Example:**

```typescript
import { ConfirmDeleteModal } from '@/components';
import { UI_LABELS } from '@/constants';

function DeleteButton({ itemName, onDelete }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        variant="danger"
        onClick={() => setIsModalOpen(true)}
      >
        {UI_LABELS.ACTIONS.DELETE}
      </Button>

      <ConfirmDeleteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={async () => {
          await onDelete();
          setIsModalOpen(false);
        }}
        itemName={itemName}
      />
    </>
  );
}
```

---

## 📐 Typography Components

**Location**: `src/components/typography/`

Typography components:

| Component    | Purpose              | Key Props                             |
| ------------ | -------------------- | ------------------------------------- |
| `Typography` | Text styling wrapper | `variant`, `color`, `align`, `weight` |
| `Heading`    | Semantic heading     | `level`, `children`                   |
| `Text`       | Text wrapper         | `variant`, `children`                 |

---

## 🔧 Utility Components

**Location**: `src/components/utility/`

Utility components:

| Component        | Purpose                       |
| ---------------- | ----------------------------- |
| `Search`         | Search input with suggestions |
| `BackToTop`      | Scroll-to-top button          |
| `Breadcrumbs`    | Navigation breadcrumbs        |
| `ErrorBoundary`  | Error boundary wrapper        |
| `LoadingSpinner` | Full-page loading spinner     |

---

## 🎯 Specialized Components

### FormField

**Location**: `src/components/FormField.tsx`

Unified form field component that handles labels, errors, and help text:

```typescript
import { FormField } from '@/components';
import { UI_LABELS, UI_PLACEHOLDERS } from '@/constants';

<FormField
  type="email"
  name="email"
  label={UI_LABELS.FORM.EMAIL}
  placeholder={UI_PLACEHOLDERS.EMAIL}
  value={value}
  onChange={onChange}
  error={error}
  required
/>
```

### ErrorBoundary

**Location**: `src/components/ErrorBoundary.tsx`

Error boundary for catching and displaying errors:

```typescript
import { ErrorBoundary } from '@/components';

<ErrorBoundary>
  <App />
</ErrorBoundary>
```

### AvatarDisplay & AvatarUpload

**Location**: `src/components/AvatarDisplay.tsx`, `AvatarUpload.tsx`

Avatar display and upload components:

```typescript
import { AvatarDisplay, AvatarUpload } from '@/components';

// Display avatar
<AvatarDisplay
  src={user.photoURL}
  alt={user.displayName}
  size="lg"
/>

// Upload avatar
<AvatarUpload
  currentAvatar={user.photoURL}
  onUpload={handleAvatarUpload}
  maxSize={5 * 1024 * 1024}
/>
```

### PasswordStrengthIndicator

**Location**: `src/components/PasswordStrengthIndicator.tsx`

Visual indicator for password strength:

```typescript
import { PasswordStrengthIndicator } from '@/components';

<PasswordStrengthIndicator password={password} />
```

---

## Best Practices

### 1. Use Constants for All Text

```typescript
// ✅ GOOD
import { UI_LABELS, UI_PLACEHOLDERS } from '@/constants';

<Button>{UI_LABELS.ACTIONS.SAVE}</Button>
<Input placeholder={UI_PLACEHOLDERS.EMAIL} />

// ❌ BAD
<Button>Save</Button>
<Input placeholder="Enter your email" />
```

### 2. Use THEME_CONSTANTS for Styling

```typescript
// ✅ GOOD
import { THEME_CONSTANTS } from '@/constants';

<div className={THEME_CONSTANTS.spacing.stack}>
  <h1 className={THEME_CONSTANTS.typography.h1}>Title</h1>
</div>

// ❌ BAD
<div className="space-y-4">
  <h1 className="text-4xl md:text-5xl font-bold">Title</h1>
</div>
```

### 3. Use Barrel Imports

```typescript
// ✅ GOOD
import { Button, Card, Input } from "@/components";

// ❌ BAD
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/forms/Input";
```

### 4. Type All Props

```typescript
interface ButtonProps {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  onClick,
  children,
}: ButtonProps) {
  // implementation
}
```

### 5. Handle Loading and Error States

```typescript
import { Spinner, Alert } from '@/components';

function UsersList() {
  const { data, loading, error } = useApiQuery(API_ENDPOINTS.PRODUCTS.LIST);

  if (loading) return <Spinner />;
  if (error) return <Alert type="error" message={error.message} />;

  return <DataTable data={data} />;
}
```

### 6. Use Composition

```typescript
import { Card, Button, Badge } from '@/components';

function ProductCard({ product }) {
  return (
    <Card>
      <Card.Header>
        <Badge variant="success">{product.status}</Badge>
      </Card.Header>
      <Card.Body>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
      </Card.Body>
      <Card.Footer>
        <Button>View Details</Button>
      </Card.Footer>
    </Card>
  );
}
```

---

## Testing

All components have corresponding test files in `__tests__/` directories. Run tests with:

```bash
npm test src/components
```

---

## Adding New Components

When creating a new component:

1. **Choose the right directory**: ui, forms, layout, feedback, etc.
2. **Create the component file**: `src/components/category/ComponentName.tsx`
3. **Use TypeScript and prop types**: Define interface for props
4. **Add JSDoc comments**: Document props and usage
5. **Use constants**: UI_LABELS, THEME_CONSTANTS, etc.
6. **Export from barrel**: Add to category `index.ts` and main `src/components/index.ts`
7. **Write tests**: Create `__tests__/ComponentName.test.tsx`
8. **Update this README**: Document the new component

---

## Related Documentation

- [GUIDE.md](../../docs/GUIDE.md) - Complete codebase reference
- [Hooks](../hooks/README.md) - React hooks
- [Quick Reference](../../docs/QUICK_REFERENCE.md) - UI constants and theme usage patterns
- [Coding Standards](../../.github/copilot-instructions.md) - Component best practices

---

**Last Updated**: February 8, 2026
