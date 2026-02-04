# Testing Guide

Comprehensive guide to testing components in LetItRip.

## Overview

Testing Stack:
- **Jest** - Test runner
- **React Testing Library** - Component testing
- **@testing-library/user-event** - User interactions
- **@testing-library/jest-dom** - Custom matchers

## Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# Run specific test file
npm test -- Button.test.tsx

# Run tests matching pattern
npm test -- --testPathPattern="Alert|Modal"
```

## Test Structure

### File Organization

Tests are co-located with components:

```
src/components/ui/
├── Button.tsx
└── __tests__/
    └── Button.test.tsx
```

### Basic Test Template

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentName } from '../index';

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName>Content</ComponentName>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
  
  it('handles user interaction', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    
    render(<ComponentName onClick={handleClick} />);
    await user.click(screen.getByRole('button'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## Testing Patterns

### 1. Rendering Tests

Test that components render with correct content:

```tsx
it('renders with text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});

it('renders with icon', () => {
  render(<Button icon={<span>🎯</span>}>Action</Button>);
  expect(screen.getByText('🎯')).toBeInTheDocument();
});
```

### 2. Prop Variation Tests

Test different prop combinations:

```tsx
it('applies variant styles', () => {
  const { container } = render(<Button variant="primary">Click</Button>);
  const button = container.querySelector('button');
  expect(button).toHaveClass('bg-primary-600');
});

it('applies size classes', () => {
  render(<Button size="lg">Large</Button>);
  const button = screen.getByRole('button');
  expect(button).toHaveClass('text-lg');
});

it('renders as full width', () => {
  render(<Button fullWidth>Wide</Button>);
  const button = screen.getByRole('button');
  expect(button).toHaveClass('w-full');
});
```

### 3. Interaction Tests

Test user interactions:

```tsx
it('calls onClick when clicked', async () => {
  const user = userEvent.setup();
  const handleClick = jest.fn();
  
  render(<Button onClick={handleClick}>Click</Button>);
  await user.click(screen.getByRole('button'));
  
  expect(handleClick).toHaveBeenCalledTimes(1);
});

it('does not call onClick when disabled', async () => {
  const user = userEvent.setup();
  const handleClick = jest.fn();
  
  render(<Button onClick={handleClick} disabled>Click</Button>);
  await user.click(screen.getByRole('button'));
  
  expect(handleClick).not.toHaveBeenCalled();
});
```

### 4. State Tests

Test component state changes:

```tsx
it('toggles checkbox state', async () => {
  const user = userEvent.setup();
  
  render(<Checkbox label="Accept" />);
  const checkbox = screen.getByRole('checkbox');
  
  expect(checkbox).not.toBeChecked();
  
  await user.click(checkbox);
  expect(checkbox).toBeChecked();
  
  await user.click(checkbox);
  expect(checkbox).not.toBeChecked();
});
```

### 5. Controlled Component Tests

Test controlled inputs:

```tsx
it('updates controlled input', async () => {
  const user = userEvent.setup();
  const handleChange = jest.fn();
  
  render(
    <Input 
      value="initial" 
      onChange={e => handleChange(e.target.value)} 
    />
  );
  
  const input = screen.getByRole('textbox');
  await user.clear(input);
  await user.type(input, 'new value');
  
  expect(handleChange).toHaveBeenLastCalledWith('new value');
});
```

### 6. Async Tests

Test async behavior:

```tsx
it('shows loading state', async () => {
  render(<Button loading>Submit</Button>);
  expect(screen.getByRole('status')).toBeInTheDocument();
});

it('loads data asynchronously', async () => {
  render(<DataComponent />);
  
  expect(screen.getByText('Loading...')).toBeInTheDocument();
  
  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeInTheDocument();
  });
});
```

### 7. Accessibility Tests

Test ARIA attributes and keyboard navigation:

```tsx
it('has correct aria attributes', () => {
  render(<Button aria-label="Close modal">×</Button>);
  expect(screen.getByLabelText('Close modal')).toBeInTheDocument();
});

it('supports keyboard navigation', async () => {
  const user = userEvent.setup();
  const handleClick = jest.fn();
  
  render(<Button onClick={handleClick}>Click</Button>);
  
  await user.tab();
  expect(screen.getByRole('button')).toHaveFocus();
  
  await user.keyboard('{Enter}');
  expect(handleClick).toHaveBeenCalled();
});
```

## Testing Context Providers

### Theme Context

```tsx
import { ThemeProvider } from '@/contexts';

it('renders with theme provider', () => {
  render(
    <ThemeProvider>
      <ComponentUsingTheme />
    </ThemeProvider>
  );
  // assertions
});
```

### Toast Context

```tsx
import { ToastProvider } from '@/components/feedback';

it('shows toast notification', async () => {
  const TestComponent = () => {
    const { showToast } = useToast();
    return <button onClick={() => showToast('Message')}>Show</button>;
  };
  
  render(
    <ToastProvider>
      <TestComponent />
    </ToastProvider>
  );
  
  await userEvent.click(screen.getByRole('button'));
  expect(screen.getByText('Message')).toBeInTheDocument();
});
```

## Testing Hooks

### Custom Hook Testing

```tsx
import { renderHook, act } from '@testing-library/react';
import { useSwipe } from '@/hooks';

it('detects swipe gesture', () => {
  const ref = { current: document.createElement('div') };
  const onSwipeLeft = jest.fn();
  
  renderHook(() => useSwipe(ref, { onSwipeLeft }));
  
  // Simulate touch events
  act(() => {
    const element = ref.current;
    element.dispatchEvent(new TouchEvent('touchstart', {
      touches: [{ clientX: 100, clientY: 0 }],
    }));
    element.dispatchEvent(new TouchEvent('touchend', {
      changedTouches: [{ clientX: 0, clientY: 0 }],
    }));
  });
  
  expect(onSwipeLeft).toHaveBeenCalled();
});
```

## Testing Forms

### Form Validation

```tsx
it('validates required fields', async () => {
  const user = userEvent.setup();
  const handleSubmit = jest.fn();
  
  render(
    <Form onSubmit={handleSubmit}>
      <Input required label="Email" />
      <Button type="submit">Submit</Button>
    </Form>
  );
  
  await user.click(screen.getByRole('button'));
  
  expect(handleSubmit).not.toHaveBeenCalled();
  expect(screen.getByText(/required/i)).toBeInTheDocument();
});
```

### Form Submission

```tsx
it('submits form with data', async () => {
  const user = userEvent.setup();
  const handleSubmit = jest.fn();
  
  render(
    <Form onSubmit={handleSubmit}>
      <Input name="username" label="Username" />
      <Input name="password" type="password" label="Password" />
      <Button type="submit">Login</Button>
    </Form>
  );
  
  await user.type(screen.getByLabelText('Username'), 'john');
  await user.type(screen.getByLabelText('Password'), 'secret');
  await user.click(screen.getByRole('button'));
  
  expect(handleSubmit).toHaveBeenCalledWith({
    username: 'john',
    password: 'secret',
  });
});
```

## Testing Modals & Portals

```tsx
it('renders modal when open', () => {
  render(
    <Modal isOpen onClose={() => {}}>
      <div>Modal content</div>
    </Modal>
  );
  
  expect(screen.getByText('Modal content')).toBeInTheDocument();
  expect(screen.getByRole('dialog')).toBeInTheDocument();
});

it('closes modal on backdrop click', async () => {
  const user = userEvent.setup();
  const handleClose = jest.fn();
  
  const { container } = render(
    <Modal isOpen onClose={handleClose}>
      <div>Content</div>
    </Modal>
  );
  
  const backdrop = container.querySelector('[aria-hidden="true"]');
  await user.click(backdrop);
  
  expect(handleClose).toHaveBeenCalled();
});
```

## Testing Dark Mode

```tsx
it('renders correctly in dark mode', () => {
  document.documentElement.classList.add('dark');
  
  render(<Button variant="primary">Click</Button>);
  
  const button = screen.getByRole('button');
  expect(button).toHaveClass('dark:bg-primary-800');
  
  document.documentElement.classList.remove('dark');
});
```

## Mocking

### Mock Functions

```tsx
const mockFn = jest.fn();

// Check if called
expect(mockFn).toHaveBeenCalled();

// Check call count
expect(mockFn).toHaveBeenCalledTimes(2);

// Check arguments
expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');

// Check last call
expect(mockFn).toHaveBeenLastCalledWith('lastArg');
```

### Mock Modules

```tsx
jest.mock('@/utils/api', () => ({
  fetchData: jest.fn(() => Promise.resolve({ data: 'mocked' })),
}));
```

### Mock Timers

```tsx
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

it('shows tooltip after delay', () => {
  render(
    <Tooltip content="Info" delay={200}>
      <Button>Hover</Button>
    </Tooltip>
  );
  
  fireEvent.mouseEnter(screen.getByRole('button'));
  
  expect(screen.queryByText('Info')).not.toBeInTheDocument();
  
  jest.advanceTimersByTime(200);
  
  expect(screen.getByText('Info')).toBeInTheDocument();
});
```

## Custom Matchers

```tsx
// jest-dom provides:
expect(element).toBeInTheDocument();
expect(element).toBeVisible();
expect(element).toBeDisabled();
expect(element).toHaveClass('className');
expect(element).toHaveAttribute('attr', 'value');
expect(element).toHaveTextContent('text');
expect(element).toHaveValue('value');
expect(checkbox).toBeChecked();
expect(element).toHaveFocus();
```

## Coverage Reports

```bash
# Generate coverage
npm run test:coverage

# View in browser
open coverage/lcov-report/index.html
```

Coverage includes:
- **Statements** - % of code executed
- **Branches** - % of if/else paths
- **Functions** - % of functions called
- **Lines** - % of lines executed

## Best Practices

### 1. Test User Behavior

```tsx
// ✅ Good - Tests what user sees/does
it('shows error message on invalid input', async () => {
  render(<LoginForm />);
  await userEvent.click(screen.getByRole('button', { name: 'Login' }));
  expect(screen.getByText(/email required/i)).toBeInTheDocument();
});

// ❌ Avoid - Tests implementation details
it('sets error state to true', () => {
  const { result } = renderHook(() => useForm());
  act(() => result.current.submit());
  expect(result.current.error).toBe(true);
});
```

### 2. Use Semantic Queries

```tsx
// ✅ Preferred order
screen.getByRole('button', { name: 'Submit' })
screen.getByLabelText('Email')
screen.getByPlaceholderText('Enter email')
screen.getByText('Welcome')

// ❌ Avoid
container.querySelector('.submit-button')
screen.getByTestId('submit-btn')
```

### 3. Avoid Implementation Details

```tsx
// ✅ Good
expect(screen.getByRole('button')).toBeDisabled();

// ❌ Avoid
expect(button.props.disabled).toBe(true);
```

### 4. Clean Up

```tsx
afterEach(() => {
  jest.clearAllMocks();
  cleanup();
});
```

### 5. Descriptive Test Names

```tsx
// ✅ Good
it('disables submit button while loading')
it('shows validation error for invalid email')
it('calls onSubmit with form data')

// ❌ Avoid
it('works correctly')
it('test button')
```

## Current Test Status

**Total: 301 tests passing**

Coverage by category:
- UI Components: ✅ 100%
- Form Components: ✅ 100%
- Feedback Components: ✅ 100%
- Layout Components: ✅ 100%
- Typography: ✅ 100%
- Hooks: 🚧 In Progress

## Troubleshooting

### Tests Timeout

```tsx
// Increase timeout for slow tests
it('loads data', async () => {
  // test code
}, 10000); // 10 second timeout
```

### Act Warnings

```tsx
// Wrap state updates in act()
await act(async () => {
  await user.click(button);
});
```

### Portal Issues

```tsx
// Use baseElement for portals
const { baseElement } = render(<Modal />);
expect(baseElement).toHaveTextContent('Modal content');
```

## Next Steps

- Review [Component Documentation](../components/README.md)
- Check [Development Guide](../development.md)
- Explore [Accessibility Testing](./accessibility.md)
