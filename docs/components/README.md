# Components Overview

Comprehensive guide to all 40+ components in the LetItRip component library.

## Component Categories

- **[UI Components](#ui-components)** - 15 components
- **[Form Components](#form-components)** - 8 components
- **[Feedback Components](#feedback-components)** - 3 components
- **[Layout Components](#layout-components)** - 6 components
- **[Typography Components](#typography-components)** - 4 components
- **[Utility Components](#utility-components)** - 2 components

## Quick Reference

### Import Pattern

```tsx
// Recommended: Barrel export
import { Button, Card, Input, Alert } from '@/index';

// Alternative: Category-specific
import { Button, Card } from '@/components/ui';
import { Input, Select } from '@/components/forms';
```

### Common Props

Most components share these common patterns:

```tsx
interface CommonProps {
  className?: string;        // Additional CSS classes
  children?: React.ReactNode; // Child elements
}
```

### Theme Integration

All components use `THEME_CONSTANTS` for consistent styling:

```tsx
import { THEME_CONSTANTS } from '@/constants/theme';

const { themed, colors, button } = THEME_CONSTANTS;
```

## UI Components

### Avatar
Display user profile images with fallback initials.

**Props:**
- `src?: string` - Image URL
- `alt?: string` - Alt text
- `size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'`
- `name?: string` - For initials fallback
- `shape?: 'circle' | 'square'`

**Example:**
```tsx
<Avatar 
  src="/user.jpg" 
  alt="John Doe" 
  size="lg" 
  name="John Doe"
/>
```

### Badge
Small status indicators and labels.

**Props:**
- `variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'`
- `size?: 'sm' | 'md' | 'lg'`
- `dot?: boolean` - Show status dot
- `outline?: boolean` - Outlined style

**Example:**
```tsx
<Badge variant="success" dot>Active</Badge>
```

### Button
Primary action buttons with multiple variants.

**Props:**
- `variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'`
- `size?: 'sm' | 'md' | 'lg' | 'xl'`
- `fullWidth?: boolean`
- `disabled?: boolean`
- `loading?: boolean`
- `icon?: ReactNode` - Leading icon
- `onClick?: () => void`

**Example:**
```tsx
<Button 
  variant="primary" 
  size="lg" 
  loading={isLoading}
  onClick={handleSubmit}
>
  Submit
</Button>
```

### Card
Container component with header, body, and footer sections.

**Props:**
- `variant?: 'elevated' | 'outlined' | 'filled'`
- `padding?: boolean`
- `hoverable?: boolean` - Hover effect

**Sub-components:**
- `CardHeader` - Card title area
- `CardBody` - Main content
- `CardFooter` - Actions area

**Example:**
```tsx
<Card variant="elevated" hoverable>
  <CardHeader>
    <h3>Card Title</h3>
  </CardHeader>
  <CardBody>
    Content here
  </CardBody>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Dropdown
Toggleable dropdown menu with context management.

**Props:**
- Component uses context pattern

**Sub-components:**
- `DropdownTrigger` - Button that opens menu
- `DropdownMenu` - Menu container
- `DropdownItem` - Menu item

**Example:**
```tsx
<Dropdown>
  <DropdownTrigger>
    <Button>Options</Button>
  </DropdownTrigger>
  <DropdownMenu>
    <DropdownItem onClick={handleEdit}>Edit</DropdownItem>
    <DropdownItem onClick={handleDelete}>Delete</DropdownItem>
  </DropdownMenu>
</Dropdown>
```

### Menu
Context menu with keyboard navigation.

**Props:**
- Uses context pattern
- Supports keyboard shortcuts

**Sub-components:**
- `MenuItem` - Individual menu item
- `MenuDivider` - Separator

**Example:**
```tsx
<Menu>
  <MenuItem shortcut="⌘N">New</MenuItem>
  <MenuItem shortcut="⌘S">Save</MenuItem>
  <MenuDivider />
  <MenuItem>Exit</MenuItem>
</Menu>
```

### Pagination
Navigate through paginated content.

**Props:**
- `currentPage: number`
- `totalPages: number`
- `onPageChange: (page: number) => void`
- `siblingCount?: number` - Pages shown around current
- `showFirstLast?: boolean`

**Example:**
```tsx
<Pagination
  currentPage={page}
  totalPages={10}
  onPageChange={setPage}
  showFirstLast
/>
```

### Progress
Visual progress indicators.

**Props:**
- `value: number` - 0-100
- `variant?: 'default' | 'success' | 'warning' | 'error'`
- `size?: 'sm' | 'md' | 'lg'`
- `showLabel?: boolean`
- `animated?: boolean`

**Example:**
```tsx
<Progress 
  value={75} 
  variant="success" 
  showLabel 
  animated 
/>
```

### Skeleton
Loading placeholder with animation.

**Props:**
- `variant?: 'text' | 'circular' | 'rectangular'`
- `width?: string | number`
- `height?: string | number`
- `count?: number` - Multiple skeletons
- `animation?: 'pulse' | 'wave' | 'none'`

**Example:**
```tsx
<Skeleton variant="rectangular" height={200} count={3} />
```

### Spinner
Loading indicator.

**Props:**
- `size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'`
- `color?: string`
- `label?: string` - Accessibility label

**Example:**
```tsx
<Spinner size="lg" label="Loading content..." />
```

### Tabs
Tabbed interface component.

**Props:**
- `defaultTab?: string` - Initial tab
- `variant?: 'line' | 'pills' | 'enclosed'`
- `fullWidth?: boolean`

**Sub-components:**
- `TabList` - Tab buttons container
- `Tab` - Individual tab button
- `TabPanels` - Content container
- `TabPanel` - Individual panel

**Example:**
```tsx
<Tabs defaultTab="profile">
  <TabList>
    <Tab id="profile">Profile</Tab>
    <Tab id="settings">Settings</Tab>
  </TabList>
  <TabPanels>
    <TabPanel id="profile">Profile content</TabPanel>
    <TabPanel id="settings">Settings content</TabPanel>
  </TabPanels>
</Tabs>
```

### Tooltip
Contextual information on hover.

**Props:**
- `content: ReactNode` - Tooltip text
- `placement?: 'top' | 'right' | 'bottom' | 'left'`
- `delay?: number` - Show delay in ms

**Example:**
```tsx
<Tooltip content="Click to edit" placement="top">
  <Button>Edit</Button>
</Tooltip>
```

### Accordion
Collapsible content sections.

**Props:**
- `defaultExpanded?: boolean`
- `multiple?: boolean` - Allow multiple open

**Sub-components:**
- `AccordionItem` - Single item
- `AccordionHeader` - Clickable header
- `AccordionPanel` - Collapsible content

**Example:**
```tsx
<Accordion>
  <AccordionItem>
    <AccordionHeader>Section 1</AccordionHeader>
    <AccordionPanel>Content 1</AccordionPanel>
  </AccordionItem>
</Accordion>
```

### Divider
Visual separator.

**Props:**
- `orientation?: 'horizontal' | 'vertical'`
- `variant?: 'solid' | 'dashed' | 'dotted'`
- `spacing?: 'sm' | 'md' | 'lg'`
- `label?: string` - Text in divider

**Example:**
```tsx
<Divider label="OR" spacing="lg" />
```

### ImageGallery
Mobile-optimized image viewer with gestures.

**Props:**
- `images: Array<{ src: string; alt: string }>`
- `initialIndex?: number`
- `onClose: () => void`
- `showThumbnails?: boolean`

**Features:**
- Swipe to navigate
- Pinch to zoom
- Double-tap to zoom
- Thumbnail preview

**Example:**
```tsx
<ImageGallery
  images={photos}
  initialIndex={0}
  onClose={() => setOpen(false)}
  showThumbnails
/>
```

## Form Components

See [Form Components Documentation](./form-components.md) for detailed guide.

**Components:**
- Input - Text input with variants
- Select - Dropdown selection
- Checkbox - Boolean input
- Radio - Single choice
- Textarea - Multi-line text
- Toggle - Switch control
- Slider - Range input
- Form - Form container with validation

## Feedback Components

See [Feedback Components Documentation](./feedback-components.md) for detailed guide.

**Components:**
- Alert - Notification banners
- Modal - Dialog overlay
- Toast - Temporary notifications

## Layout Components

See [Layout Components Documentation](./layout-components.md) for detailed guide.

**Components:**
- MainNavbar - Desktop navigation
- BottomNavbar - Mobile navigation
- Sidebar - Side drawer
- TitleBar - Page header
- Footer - Page footer
- Breadcrumbs - Navigation trail

## Typography Components

See [Typography Components Documentation](./typography-components.md) for detailed guide.

**Components:**
- Heading - Headings (h1-h6)
- Text - Paragraph text
- Label - Form labels
- Caption - Small text

## Utility Components

### Search
Search input with results.

**Props:**
- `placeholder?: string`
- `value: string`
- `onChange: (value: string) => void`
- `onSearch: (value: string) => void`
- `results?: Array<any>`
- `renderResult?: (item: any) => ReactNode`

### BackToTop
Scroll-to-top button.

**Props:**
- `showAfter?: number` - Scroll threshold
- `smooth?: boolean`
- `position?: 'left' | 'right'`

**Example:**
```tsx
<BackToTop showAfter={300} smooth position="right" />
```

## Best Practices

### 1. Import from Barrel Exports
```tsx
// Good
import { Button, Card } from '@/index';

// Avoid
import Button from '@/components/ui/Button';
```

### 2. Use Theme Constants
```tsx
// Good
import { THEME_CONSTANTS } from '@/constants/theme';

// Avoid
className="bg-blue-500 text-white"
```

### 3. Provide Accessibility Props
```tsx
<Button aria-label="Close modal" onClick={onClose}>
  <CloseIcon />
</Button>
```

### 4. Handle Loading States
```tsx
<Button loading={isSubmitting} disabled={isSubmitting}>
  Submit
</Button>
```

### 5. Use TypeScript Props
```tsx
interface MyComponentProps {
  title: string;
  onAction: () => void;
}

function MyComponent({ title, onAction }: MyComponentProps) {
  // ...
}
```

## Testing Components

All components have comprehensive test coverage:

```tsx
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui';

test('renders button', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});
```

## Next Steps

- Explore individual component docs
- Check [Mobile Gestures Guide](../guides/mobile-gestures.md)
- Review [Theme System](../guides/theming.md)
- Read [Testing Guide](../guides/testing.md)
