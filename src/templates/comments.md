# src/templates - Future Improvements & Refactoring Notes

## Template Organization

### Current Issues

- Duplicate templates between src/emails and src/templates/email
- Unclear which to use when
- Potential for inconsistency

### Improvements

- **Consolidate Templates**: Choose one location
  - Option A: Use src/emails as single source, import from Functions
  - Option B: Use src/templates and deprecate src/emails
  - Option C: Keep separate but establish clear usage guidelines
- **Shared Template Library**: If keeping separate:
  - Extract common components to shared location
  - Ensure consistent styling across both
  - Synchronize template updates
- **Template Registry**: Central registry of all templates
  ```typescript
  export const EMAIL_TEMPLATES = {
    WELCOME: "WelcomeEmail",
    ORDER_CONFIRMATION: "OrderConfirmation",
    // ...
  } as const;
  ```

## Build & Deployment

### Current Issues

- Templates need to be built for Functions deployment
- Path resolution between src/ and functions/ can be problematic
- No build verification for templates

### Improvements

- **Build Process**: Optimize template building
  - Pre-compile templates during build
  - Bundle templates with Functions
  - Verify all templates render successfully
- **Path Aliases**: Consistent path resolution
  - Use same @/ alias in Functions as main app
  - Configure tsconfig for Functions to resolve src/
- **Template Validation**: Build-time checks
  - Ensure all required props are used
  - Validate HTML output
  - Check email client compatibility
- **CI/CD**: Add template checks to pipeline
  - Render all templates with test data
  - Visual regression tests
  - Link validation

## Template Types

### Missing Templates

Similar to src/emails, need additional templates:

- Return confirmation
- Refund notification
- Account suspension
- Seller approval/rejection
- Review request
- Product back in stock
- And more...

See src/emails/comments.md for full list.

## Type Safety

### Current Issues

- Props interfaces may not be shared
- Type checking between usage and definition
- Runtime errors possible with wrong props

### Improvements

- **Shared Type Definitions**:
  ```typescript
  // types/email-templates.ts
  export interface WelcomeEmailProps {
    userName: string;
    userEmail: string;
    verificationLink?: string;
  }
  ```
- **Template Type Registry**:
  ```typescript
  export type EmailTemplate =
    | { type: "WELCOME"; props: WelcomeEmailProps }
    | { type: "ORDER"; props: OrderConfirmationProps };
  // ...
  ```
- **Type-Safe Rendering**:
  ```typescript
  function renderEmail<T extends EmailTemplateType>(
    type: T,
    props: EmailTemplateProps[T]
  ): string { ... }
  ```

## Testing

### Current Issues

- No automated tests for templates
- Manual testing only
- Hard to catch regressions

### Improvements

- **Snapshot Tests**: Test template output
  ```typescript
  it("renders welcome email correctly", () => {
    const html = render(<WelcomeEmail {...mockProps} />);
    expect(html).toMatchSnapshot();
  });
  ```
- **Visual Tests**: Screenshot comparison
- **Props Validation Tests**: Test with various props
- **Link Tests**: Verify all links work
- **Email Client Tests**: Automated compatibility testing

## Performance

### Current Issues

- Template rendering could be slow
- No caching of rendered templates
- Repeated rendering for same data

### Improvements

- **Template Caching**: Cache rendered output
  ```typescript
  const cacheKey = `${templateId}-${hash(props)}`;
  const cached = await cache.get(cacheKey);
  if (cached) return cached;
  ```
- **Pre-rendered Templates**: For static parts
- **Lazy Loading**: Load templates on-demand
- **Optimize Rendering**: Profile and optimize slow renders

## Documentation

### Current Issues

- Limited template documentation
- No usage examples
- Prop interfaces not well documented

### Improvements

- **Template Catalog**: Visual catalog of all templates
  - Screenshots of each template
  - Description and use case
  - Props documentation
  - Usage examples
- **Storybook**: Use Storybook for template development
  - Interactive template preview
  - Props controls
  - Different states and variations
- **API Documentation**: Generate from TypeScript types
  - Auto-document props
  - Required vs optional props
  - Default values

## Template Variants

### Current Issues

- Single version of each template
- No A/B testing support
- No personalization beyond props

### Improvements

- **Template Variants**: Multiple versions
  ```typescript
  <WelcomeEmail variant="v1" {...props} />
  <WelcomeEmail variant="v2" {...props} />
  ```
- **A/B Testing**: Test different variants
  - Track performance metrics
  - Gradual rollout
  - Winner selection
- **Dynamic Templates**: Generate based on user data
  - Personalized sections
  - Conditional content
  - Recommended products

## Localization

### Current Issues

- English-only templates
- No translation support
- Hardcoded text

### Improvements

- **i18n Integration**: Support multiple languages
  ```typescript
  <WelcomeEmail locale="hi" translations={translations.hi} {...props} />
  ```
- **Translation Management**: Use translation service
- **RTL Support**: Right-to-left languages
- **Regional Customization**: Adapt to regions

## Components

### Current Issues

- No reusable component library for templates
- Duplicate code across templates
- Hard to maintain consistency

### Improvements

- **Component Library**: Build shared components
  ```
  templates/
  ├── email/
  │   ├── templates/
  │   │   ├── WelcomeEmail.tsx
  │   │   └── ...
  │   ├── components/
  │   │   ├── EmailButton.tsx
  │   │   ├── EmailHeader.tsx
  │   │   ├── EmailFooter.tsx
  │   │   └── ...
  │   └── styles/
  │       └── email-styles.ts
  ```
- **Component Documentation**: Document each component
- **Component Testing**: Test components independently

## Accessibility

### Current Issues

- Basic email accessibility
- Not optimized for screen readers
- May not meet WCAG standards

### Improvements

- Same improvements as src/emails/comments.md
- Screen reader testing
- Contrast checking
- Semantic HTML
- Alt text for images

## Next Steps Priority

### High Priority

1. Decide on template consolidation strategy
2. Fix build/deployment issues with Functions
3. Add shared type definitions
4. Implement basic testing

### Medium Priority

5. Create template catalog/documentation
6. Add missing template types
7. Implement template caching
8. Set up Storybook

### Low Priority

9. Add A/B testing support
10. Implement full i18n
11. Create component library
12. Add visual regression testing
