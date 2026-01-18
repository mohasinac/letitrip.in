# Next.js Wrappers for React Library

This directory contains Next.js-specific wrapper components that bridge the gap between pure React components in `@letitrip/react-library` and Next.js features.

## Purpose

The react-library is **pure React** with no Next.js dependencies. These wrappers allow library components to work seamlessly with Next.js features like:
- Client-side navigation (`next/link`)
- Image optimization (`next/image`)
- Router hooks (`next/navigation`)

## Available Wrappers

### LinkWrapper
Wraps Next.js `Link` component for navigation.

```tsx
import { LinkWrapper } from '@/components/wrappers';
import { Button } from '@letitrip/react-library';

// Pass as LinkComponent prop
<ProductCard 
  product={product}
  LinkComponent={LinkWrapper}
  href="/products/123"
/>

// Or wrap directly
<LinkWrapper href="/products/123">
  <Button>View Product</Button>
</LinkWrapper>
```

### ImageWrapper
Wraps Next.js `Image` component for optimization.

```tsx
import { ImageWrapper } from '@/components/wrappers';
import { ProductCard } from '@letitrip/react-library';

<ProductCard 
  product={product}
  ImageComponent={ImageWrapper}
/>
```

### RouterWrapper
Provides router functionality through callbacks.

```tsx
import { useRouterWrapper } from '@/components/wrappers';
import { LibraryComponent } from '@letitrip/react-library';

function MyPage() {
  const { push, back } = useRouterWrapper();
  
  return (
    <LibraryComponent 
      onNavigate={push}
      onGoBack={back}
    />
  );
}
```

## Usage Pattern

### In Library Components (react-library)
Library components accept wrappers as props:

```tsx
// react-library/src/components/ProductCard.tsx
interface ProductCardProps {
  LinkComponent?: React.ComponentType<any>;
  ImageComponent?: React.ComponentType<any>;
  onNavigate?: (href: string) => void;
}
```

### In Next.js App (main app)
Pages pass wrappers to library components:

```tsx
// src/app/products/page.tsx
import { LinkWrapper, ImageWrapper, useRouterWrapper } from '@/components/wrappers';
import { ProductList } from '@letitrip/react-library';

export default function ProductsPage() {
  const { push } = useRouterWrapper();
  
  return (
    <ProductList
      LinkComponent={LinkWrapper}
      ImageComponent={ImageWrapper}
      onNavigate={push}
    />
  );
}
```

## Best Practices

1. **Always use wrappers** when library components need Next.js features
2. **Pass as props** - Don't modify library components directly
3. **Use callbacks** for navigation instead of direct router access
4. **Keep library pure** - No Next.js imports in react-library
5. **Document usage** - Show examples of wrapper usage in component docs

## Testing

Library components can be tested without Next.js by providing mock wrappers:

```tsx
const MockLink = ({ children, href }: any) => <a href={href}>{children}</a>;
const MockImage = ({ src, alt }: any) => <img src={src} alt={alt} />;

<ProductCard 
  LinkComponent={MockLink}
  ImageComponent={MockImage}
/>
```

## Future Wrappers

Consider adding:
- `HeadWrapper` - For meta tags and SEO
- `ScriptWrapper` - For third-party scripts
- `MiddlewareWrapper` - For auth/redirects

---

*Last Updated: January 19, 2026*
