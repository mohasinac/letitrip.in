# UI Components Quick Reference

## Import

```tsx
import {
  Button,
  Input,
  Textarea,
  Select,
  Checkbox,
  Card,
  FormActions,
  BaseCard,
  BaseTable,
} from "@/components/ui";
```

## Button

### Basic Usage

```tsx
<Button>Click Me</Button>
```

### Variants

```tsx
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="danger">Danger</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="outline">Outline</Button>
```

### With Icons

```tsx
import { Save, Trash } from "lucide-react";

<Button leftIcon={<Save />}>Save</Button>
<Button rightIcon={<Trash />}>Delete</Button>
```

### Loading State

```tsx
<Button isLoading={isSubmitting}>Submit</Button>
```

### Full Width

```tsx
<Button fullWidth>Full Width Button</Button>
```

## Input

### Basic

```tsx
<Input label="Email" type="email" placeholder="you@example.com" />
```

### With Error

```tsx
<Input
  label="Username"
  required
  error={errors.username}
  helperText="3-20 characters"
/>
```

### With Icons

```tsx
import { Mail, Search } from "lucide-react";

<Input
  label="Email"
  leftIcon={<Mail />}
/>

<Input
  placeholder="Search..."
  rightIcon={<Search />}
/>
```

## Textarea

```tsx
<Textarea
  label="Description"
  required
  rows={5}
  maxLength={500}
  showCharCount
  placeholder="Describe your item..."
/>
```

## Select

```tsx
const options = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
];

<Select
  label="Status"
  options={options}
  placeholder="Select status..."
  helperText="Choose item status"
/>;
```

## Checkbox

### With Label

```tsx
<Checkbox
  label="Active"
  description="Make this item visible to users"
  checked={isActive}
  onChange={(e) => setIsActive(e.target.checked)}
/>
```

### Standalone

```tsx
<Checkbox checked={selected} onChange={handleChange} />
```

## Card

### Basic Card

```tsx
<Card title="User Information">
  <Input label="Name" />
  <Input label="Email" />
</Card>
```

### With Description and Action

```tsx
<Card
  title="Settings"
  description="Configure your preferences"
  headerAction={<Button size="sm">Reset</Button>}
>
  <Checkbox label="Email notifications" />
  <Checkbox label="SMS alerts" />
</Card>
```

### Card Sections

```tsx
import { Card, CardSection } from "@/components/ui";

<Card>
  <CardSection title="Basic Info">
    <Input label="Name" />
  </CardSection>

  <CardSection title="Contact">
    <Input label="Email" />
  </CardSection>
</Card>;
```

## FormActions

### Basic

```tsx
<FormActions
  onCancel={() => router.back()}
  submitLabel="Create Product"
  isSubmitting={loading}
/>
```

### Custom Positions

```tsx
// Left aligned
<FormActions position="left" />

// Right aligned (default)
<FormActions position="right" />

// Space between
<FormActions
  position="space-between"
  additionalActions={<Button variant="ghost">Save Draft</Button>}
/>
```

### No Cancel Button

```tsx
<FormActions showCancel={false} submitLabel="Next" />
```

## BaseCard (For Lists)

```tsx
import { Heart, Eye } from "lucide-react";

<BaseCard
  href="/products/123"
  image="https://..."
  imageAlt="Product name"
  badges={[
    { text: "Featured", color: "yellow" },
    { text: "Sale", color: "green" },
  ]}
  actionButtons={[
    {
      icon: <Heart />,
      onClick: handleFavorite,
      label: "Add to favorites",
      active: isFavorite,
      activeColor: "text-red-500",
    },
    {
      icon: <Eye />,
      onClick: handleQuickView,
      label: "Quick view",
    },
  ]}
  imageOverlay={<Button fullWidth>Add to Cart</Button>}
>
  <h3>Product Name</h3>
  <p>$99.99</p>
</BaseCard>;
```

## BaseTable

```tsx
const columns = [
  {
    key: "name",
    label: "Name",
    sortable: true,
  },
  {
    key: "status",
    label: "Status",
    render: (value) => <StatusBadge status={value} />,
  },
  {
    key: "actions",
    label: "",
    align: "right" as const,
    render: (_, row) => (
      <Button size="sm" onClick={() => handleEdit(row)}>
        Edit
      </Button>
    ),
  },
];

<BaseTable
  data={items}
  columns={columns}
  keyExtractor={(row) => row.id}
  isLoading={loading}
  emptyMessage="No items found"
  onRowClick={handleRowClick}
  stickyHeader
/>;
```

## Form Layout Pattern

```tsx
export function MyForm() {
  const [formData, setFormData] = useState({...});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // ... validation and submit logic
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card title="Basic Information">
        <div className="space-y-4">
          <Input
            label="Name"
            required
            value={formData.name}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              name: e.target.value
            }))}
            error={errors.name}
            disabled={isSubmitting}
          />

          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              description: e.target.value
            }))}
            rows={4}
          />
        </div>
      </Card>

      <Card title="Options">
        <Checkbox
          label="Active"
          description="Make this visible"
          checked={formData.isActive}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            isActive: e.target.checked
          }))}
        />
      </Card>

      <FormActions
        onCancel={() => router.back()}
        submitLabel="Create"
        isSubmitting={isSubmitting}
      />
    </form>
  );
}
```

## Styling Tips

### Custom Classes

All components accept a `className` prop for custom styling:

```tsx
<Button className="mt-4 shadow-lg">Custom Button</Button>
<Card className="bg-blue-50">Custom Card</Card>
```

### Grid Layouts

```tsx
<Card title="Contact Information">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <Input label="First Name" />
    <Input label="Last Name" />
    <Input label="Email" />
    <Input label="Phone" />
  </div>
</Card>
```

### Space-y Pattern

Use `space-y-4` or `space-y-6` for consistent vertical spacing:

```tsx
<div className="space-y-4">
  <Input label="Field 1" />
  <Input label="Field 2" />
  <Input label="Field 3" />
</div>
```

## Accessibility

All components include:

- Proper ARIA attributes
- Keyboard navigation support
- Focus management
- Screen reader labels
- Error announcements

## TypeScript Support

All components are fully typed:

```tsx
import type { ButtonProps, InputProps } from "@/components/ui";

const MyButton: React.FC<ButtonProps> = (props) => {
  return <Button {...props} />;
};
```
