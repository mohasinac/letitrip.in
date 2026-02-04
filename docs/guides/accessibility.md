# Accessibility Guide

Complete guide for building accessible components in LetItRip.

## Overview

LetItRip follows WCAG 2.1 Level AA standards for accessibility. All components are designed with keyboard navigation, screen reader support, and semantic HTML.

## Table of Contents

- [Core Principles](#core-principles)
- [Keyboard Navigation](#keyboard-navigation)
- [ARIA Attributes](#aria-attributes)
- [Focus Management](#focus-management)
- [Screen Reader Support](#screen-reader-support)
- [Color Contrast](#color-contrast)
- [Component Patterns](#component-patterns)
- [Testing Accessibility](#testing-accessibility)

---

## Core Principles

### POUR Principles

**Perceivable** - Information must be presentable to users
- ✅ Text alternatives for images
- ✅ Color contrast ratios
- ✅ Resizable text
- ✅ Visual focus indicators

**Operable** - Interface must be operable
- ✅ Keyboard accessible
- ✅ Sufficient time to interact
- ✅ Seizure-safe (no flashing)
- ✅ Navigable structure

**Understandable** - Information must be understandable
- ✅ Readable text
- ✅ Predictable behavior
- ✅ Input assistance
- ✅ Error identification

**Robust** - Content must be robust
- ✅ Compatible with assistive technologies
- ✅ Valid HTML
- ✅ Semantic structure
- ✅ Progressive enhancement

---

## Keyboard Navigation

### Standard Patterns

All interactive elements support keyboard:

```tsx
// Button
<button onClick={handleClick}>
  {/* Tab to focus, Enter/Space to activate */}
  Click Me
</button>

// Link
<a href="/page">
  {/* Tab to focus, Enter to navigate */}
  Go to page
</a>

// Input
<input type="text" />
{/* Tab to focus, type to input */}
```

### Custom Components

Make custom components keyboard accessible:

```tsx
function CustomButton({ onClick, children }: CustomButtonProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };
  
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className="custom-button"
    >
      {children}
    </div>
  );
}
```

### Focus Order

Maintain logical tab order:

```tsx
function Form() {
  return (
    <form>
      {/* Tab order: 1 -> 2 -> 3 -> 4 */}
      <input type="text" placeholder="Name" />      {/* 1 */}
      <input type="email" placeholder="Email" />    {/* 2 */}
      <textarea placeholder="Message" />            {/* 3 */}
      <button type="submit">Submit</button>         {/* 4 */}
    </form>
  );
}
```

### Skip Links

Provide skip navigation:

```tsx
function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <nav>{/* Navigation */}</nav>
      <main id="main-content">
        {children}
      </main>
    </>
  );
}
```

```css
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
```

---

## ARIA Attributes

### Common ARIA Patterns

**Buttons**
```tsx
<button aria-label="Close dialog">
  <CloseIcon />
</button>

<button aria-pressed={isPressed}>
  Toggle
</button>

<button aria-expanded={isOpen} aria-controls="menu-id">
  Menu
</button>
```

**Form Inputs**
```tsx
<label htmlFor="email">Email</label>
<input
  id="email"
  type="email"
  aria-required="true"
  aria-invalid={hasError}
  aria-describedby="email-error"
/>
{hasError && (
  <span id="email-error" role="alert">
    Invalid email address
  </span>
)}
```

**Landmarks**
```tsx
<header role="banner">
  <nav role="navigation" aria-label="Main">
    {/* Navigation */}
  </nav>
</header>

<main role="main">
  {/* Main content */}
</main>

<aside role="complementary" aria-label="Related">
  {/* Sidebar */}
</aside>

<footer role="contentinfo">
  {/* Footer */}
</footer>
```

**Live Regions**
```tsx
// Announce updates to screen readers
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>

// Urgent announcements
<div aria-live="assertive" role="alert">
  {errorMessage}
</div>
```

**Dialogs/Modals**
```tsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
>
  <h2 id="dialog-title">Dialog Title</h2>
  <p id="dialog-description">Dialog content</p>
  <button aria-label="Close dialog">Close</button>
</div>
```

---

## Focus Management

### Visual Focus Indicators

Ensure visible focus:

```css
/* Default focus ring */
*:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Custom focus styles */
.button:focus-visible {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
  outline: none;
}
```

### Focus Trapping

Trap focus in modals:

```tsx
import { useEffect, useRef } from 'react';

function Modal({ isOpen, onClose, children }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!isOpen) return;
    
    const modal = modalRef.current;
    if (!modal) return;
    
    // Get all focusable elements
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    // Focus first element
    firstElement?.focus();
    
    // Trap focus
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        // Shift+Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };
    
    modal.addEventListener('keydown', handleKeyDown);
    return () => modal.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
    >
      {children}
    </div>
  );
}
```

### Focus Restoration

Restore focus after closing modals:

```tsx
function useModalFocus(isOpen: boolean) {
  const previousFocusRef = useRef<HTMLElement | null>(null);
  
  useEffect(() => {
    if (isOpen) {
      // Save current focus
      previousFocusRef.current = document.activeElement as HTMLElement;
    } else if (previousFocusRef.current) {
      // Restore focus
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [isOpen]);
}
```

---

## Screen Reader Support

### Semantic HTML

Use appropriate HTML elements:

```tsx
// ✅ Good - Semantic
<nav>
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/about">About</a></li>
  </ul>
</nav>

// ❌ Bad - Non-semantic
<div>
  <div onClick={goHome}>Home</div>
  <div onClick={goAbout}>About</div>
</div>
```

### Hidden Content

Hide decorative content from screen readers:

```tsx
// Decorative icon
<span aria-hidden="true">
  <DecorativeIcon />
</span>

// Visually hidden but screen reader accessible
<span className="sr-only">
  Additional context for screen readers
</span>
```

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

### Announcements

Announce dynamic content:

```tsx
function useAnnouncement() {
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', priority === 'assertive' ? 'alert' : 'status');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };
  
  return announce;
}

// Usage
const announce = useAnnouncement();
announce('Item added to cart', 'polite');
announce('Error: Form submission failed', 'assertive');
```

---

## Color Contrast

### WCAG Standards

- **Normal text:** 4.5:1 contrast ratio
- **Large text (18pt+):** 3:1 contrast ratio
- **UI components:** 3:1 contrast ratio

### Theme Colors

All theme colors meet WCAG AA standards:

```typescript
// Light mode - sufficient contrast
colors: {
  text: '#1a1a1a',      // on white: 16.1:1 ✅
  background: '#ffffff',
}

// Dark mode - sufficient contrast
darkMode: {
  text: '#f8fafc',      // on dark: 15.8:1 ✅
  background: '#0f172a',
}
```

### Checking Contrast

Use browser DevTools or online tools:
- Chrome DevTools: Inspect element → Accessibility pane
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Contrast Ratio Tool](https://contrast-ratio.com/)

### Color-Blind Safe

Don't rely on color alone:

```tsx
// ✅ Good - Uses icon + color
<Alert variant="error">
  <ErrorIcon /> Error: Form submission failed
</Alert>

// ❌ Bad - Color only
<div style={{ color: 'red' }}>
  Form submission failed
</div>
```

---

## Component Patterns

### Button

```tsx
interface ButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  'aria-label'?: string;
  'aria-pressed'?: boolean;
  children: React.ReactNode;
}

function Button({
  onClick,
  disabled,
  'aria-label': ariaLabel,
  'aria-pressed': ariaPressed,
  children,
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
      className="button"
    >
      {children}
    </button>
  );
}

// Usage
<Button aria-label="Close dialog" onClick={handleClose}>
  <CloseIcon aria-hidden="true" />
</Button>
```

### Form Input

```tsx
interface InputProps {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  type?: string;
}

function Input({ id, label, error, required, type = 'text' }: InputProps) {
  return (
    <div className="input-group">
      <label htmlFor={id}>
        {label}
        {required && <span aria-label="required">*</span>}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <span id={`${id}-error`} role="alert" className="error">
          {error}
        </span>
      )}
    </div>
  );
}
```

### Dropdown

```tsx
function Dropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  return (
    <div ref={dropdownRef} className="dropdown">
      <button
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        Menu
      </button>
      {isOpen && (
        <ul role="menu">
          <li role="menuitem">
            <button onClick={() => {/* ... */}}>
              Option 1
            </button>
          </li>
          <li role="menuitem">
            <button onClick={() => {/* ... */}}>
              Option 2
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
```

### Tabs

```tsx
function Tabs() {
  const [activeTab, setActiveTab] = useState(0);
  
  return (
    <div className="tabs">
      <div role="tablist" aria-label="Content sections">
        <button
          role="tab"
          aria-selected={activeTab === 0}
          aria-controls="panel-0"
          onClick={() => setActiveTab(0)}
        >
          Tab 1
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 1}
          aria-controls="panel-1"
          onClick={() => setActiveTab(1)}
        >
          Tab 2
        </button>
      </div>
      
      <div id="panel-0" role="tabpanel" hidden={activeTab !== 0}>
        Content 1
      </div>
      <div id="panel-1" role="tabpanel" hidden={activeTab !== 1}>
        Content 2
      </div>
    </div>
  );
}
```

---

## Testing Accessibility

### Automated Testing

```bash
# Install testing library
npm install --save-dev @testing-library/jest-dom
```

```tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('has no accessibility violations', async () => {
  const { container } = render(<Component />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Manual Testing

**Keyboard Navigation**
1. Navigate with Tab/Shift+Tab
2. Activate with Enter/Space
3. Close with Escape
4. Navigate lists with Arrow keys

**Screen Reader Testing**
- **macOS:** VoiceOver (Cmd+F5)
- **Windows:** NVDA (free) or JAWS
- **Chrome:** ChromeVox extension

**Testing Checklist**
- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators visible
- [ ] Logical tab order
- [ ] ARIA labels present
- [ ] Screen reader announces content correctly
- [ ] Color contrast sufficient
- [ ] Text resizable to 200%
- [ ] Works without JavaScript (progressive enhancement)

### Browser Extensions

- **axe DevTools** - Automated accessibility testing
- **WAVE** - Visual accessibility evaluation
- **Lighthouse** - Accessibility audit
- **Color Contrast Analyzer** - Check contrast ratios

---

## Best Practices

### 1. Semantic HTML First

```tsx
// ✅ Good
<button onClick={handleClick}>Click</button>

// ❌ Bad
<div onClick={handleClick}>Click</div>
```

### 2. Always Label Inputs

```tsx
// ✅ Good
<label htmlFor="name">Name</label>
<input id="name" />

// ❌ Bad
<input placeholder="Name" />
```

### 3. Provide Text Alternatives

```tsx
// ✅ Good
<img src="photo.jpg" alt="Mountain landscape at sunset" />

// ❌ Bad
<img src="photo.jpg" />
```

### 4. Keyboard Accessible

```tsx
// ✅ Good
<div
  role="button"
  tabIndex={0}
  onKeyDown={handleKeyDown}
  onClick={handleClick}
>

// ❌ Bad
<div onClick={handleClick}>
```

### 5. Focus Management

```tsx
// ✅ Good - Restore focus
const previousFocus = document.activeElement;
// ... modal logic
previousFocus.focus();

// ❌ Bad - Lost focus
// No focus restoration
```

---

## Resources

### Guidelines
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

### Tools
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE Browser Extension](https://wave.webaim.org/extension/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Color Contrast Checker](https://webaim.org/resources/contrastchecker/)

### Testing
- [jest-axe](https://github.com/nickcolley/jest-axe)
- [Testing Library](https://testing-library.com/)
- [Pa11y](https://pa11y.org/)

---

## Next Steps

- Review [Component Documentation](../components/README.md)
- Check [Testing Guide](./testing.md)
- Explore [Development Guide](../development.md)
