# Lib Utilities - Future Refactoring Notes

## Completed Improvements ✅

### Environment Validation (env.ts)

- ✅ **Runtime Validation**: Implemented with Zod schemas (January 10, 2026)
- ✅ **Type Safety**: Full type safety with @t3-oss/env-nextjs
- ✅ **Validation on Import**: Automatic validation at startup
- ✅ **Server/Client Separation**: Clear separation of server and client variables
- ✅ **Helper Functions**: Added utility functions for common configs

### Permission System (permissions.ts)

- ✅ **Granular Permissions**: 100+ fine-grained permissions implemented (January 10, 2026)
- ✅ **Role-Based Defaults**: Comprehensive role-to-permission mappings
  - Admin: Full system access (all permissions)
  - Seller: Shop and product management permissions
  - User: Customer permissions (orders, reviews, profile)
  - Guest: View-only permissions
- ✅ **Custom Permissions**: Support for per-user permission overrides
- ✅ **Permission Categories**: 11 categories (products, orders, shops, users, reviews, categories, auctions, payments, analytics, support, admin)
- ✅ **Type Safety**: Full TypeScript types and enums
- ✅ **Helper Functions**: hasPermission(), hasAllPermissions(), getUserPermissions(), hasRole(), isAdmin(), isSeller(), isAuthenticated()
- ✅ **Multiple Checks**: Support for checking single or multiple permissions (any or all)

### Rate Limiter (rate-limiter.ts)

- ✅ **Sliding Window Algorithm**: Accurate rate limiting with sliding window (January 10, 2026)
- ✅ **In-Memory Storage**: Map-based storage, no external dependencies required
- ✅ **Configurable Limits**: Flexible points and duration configuration
- ✅ **Auto-Cleanup**: Automatic periodic cleanup of expired entries (every 60 seconds)
- ✅ **Rich API**: consume(), penalty(), reward(), block(), delete(), get() methods
- ✅ **Pre-configured Limiters**: 5 common use cases ready to use
  - Auth: 5 requests per 15 minutes (strict)
  - API: 100 requests per minute (standard)
  - Public: 300 requests per minute (lenient)
  - Password Reset: 3 requests per hour (very strict)
  - Search: 60 requests per minute (moderate)
- ✅ **Error Handling**: RateLimitError with retry information
- ✅ **State Inspection**: Check rate limit state without consuming points
- ✅ **Type Safety**: Full TypeScript support with interfaces

### Input Sanitization (sanitize.ts)

- ✅ **XSS Prevention**: Comprehensive HTML sanitization with DOMPurify (January 10, 2026)
- ✅ **Multiple Sanitization Types**: HTML, plain text, email, phone, URL, filename, search queries
- ✅ **Configurable HTML Sanitization**: Whitelist-based approach with options
  - allowBasicFormatting: p, strong, em, headings, lists, code
  - allowLinks: anchor tags with href
  - allowImages: img tags with src, alt
  - stripAll: Remove all HTML (text only)
  - Custom whitelist: allowedTags and allowedAttributes arrays
- ✅ **Specialized Sanitizers**:
  - sanitizeEmail(): Normalize and clean email addresses
  - sanitizePhone(): Clean phone numbers
  - sanitizeUrl(): Validate protocols, block javascript:/data:/vbscript:
  - sanitizeFilename(): Remove path traversal (../) and dangerous characters
  - sanitizeSearchQuery(): Clean search input (max 200 chars)
- ✅ **Batch Processing**: sanitizeObject() recursively sanitizes object properties
  - Field-specific sanitization (htmlFields, emailFields, phoneFields, urlFields)
  - Configurable HTML options for HTML fields
  - Preserves non-string values and null/undefined
- ✅ **Pre-configured Sanitizers**: 5 common use cases
  - Sanitizers.userName: Plain text, max 100 chars
  - Sanitizers.title: Plain text, max 200 chars
  - Sanitizers.description: Basic formatting allowed
  - Sanitizers.richContent: Formatting + links + images
  - Sanitizers.comment: Plain text, max 5000 chars
- ✅ **String Utilities**: Trim, collapse whitespace, lowercase, max length
- ✅ **Type Safety**: Full TypeScript support with interfaces and generics

## General Improvements

### 1. Utility Organization

- **Group by Domain**: Organize utils by business domain instead of type
  - `utils/product/` - Product-related utilities
  - `utils/order/` - Order-related utilities
  - `utils/user/` - User-related utilities
- **Barrel Exports**: Create index files for clean imports
- **Tree Shaking**: Ensure all utilities are tree-shakeable
- **Bundle Analysis**: Analyze and optimize bundle size

### 2. Type Safety Enhancements

- **Strict Types**: Use strictest TypeScript configuration
- **Runtime Validation**: Add runtime validation with Zod
  ```typescript
  const priceSchema = z.number().positive();
  export const validatePrice = (price: unknown) => priceSchema.parse(price);
  ```
- **Type Guards**: More comprehensive type guards
- **Branded Types**: Use branded types for IDs, prices, etc.
- **Discriminated Unions**: Better error handling with discriminated unions

### 3. Testing Improvements

- **Unit Tests**: 100% coverage for utilities
- **Property-Based Testing**: Use fast-check for edge cases
- **Benchmark Tests**: Performance benchmarks
- **Integration Tests**: Test utility combinations
- **Documentation Tests**: Test code examples in docs

## Specific Utility Improvements

### formatters.ts

- **Locale Support**: Better internationalization
  ```typescript
  formatPrice(1000, { locale: "en-IN", currency: "INR" });
  ```
- **Custom Formats**: Allow custom format strings
- **Timezone Handling**: Better timezone support
- **Relative Time**: More granular relative time ("just now", "1 minute ago")
- **Number Abbreviation**: 1K, 1M, 1B formatting
- **Currency Conversion**: Built-in currency conversion

### price.utils.ts

- **Decimal Precision**: Use decimal.js for precise calculations
- **Multi-Currency**: Support multiple currencies
- **Tax Calculations**: More complex tax scenarios
  - Multiple tax rates
  - Compound taxes
  - Tax exemptions
- **Rounding Strategies**: Configurable rounding (up, down, nearest)
- **Price Tiers**: Volume-based pricing
- **Subscription Pricing**: Recurring payment calculations

### date-utils.ts

- **Replace with date-fns**: Use battle-tested library
- **Timezone Library**: Use luxon or day.js for timezones
- **Calendar Utilities**: Calendar generation
- **Business Days**: Calculate business days
- **Holiday Support**: Account for holidays
- **Duration Formatting**: "2h 30m" formatting
- **Date Range**: Date range utilities

### validation utils

- **Unified Validation**: Single validation framework
- **Async Validators**: Support async validation
- **Custom Rules**: Easy custom rule creation
- **Error Messages**: Better error message templating
- **Conditional Validation**: Validate based on other fields
- **Schema Composition**: Compose validation schemas
- **Integration**: Better form library integration

### Firebase utilities

- **Connection Management**: Better connection pooling
- **Retry Logic**: Automatic retry with backoff
- **Batch Operations**: Batch Firebase operations
- **Offline Support**: Better offline handling
- **Cache Layer**: Firebase result caching
- **Real-time Optimization**: Optimize real-time listeners
- **Query Builder**: Fluent query API

### API Error Handling

- **Error Codes**: Standardized error codes
- **Error Recovery**: Automatic recovery strategies
- **User Messages**: Context-aware user messages
- **Error Tracking**: Better error tracking integration
- **Error Boundaries**: React error boundary integration
- **Retry Policies**: Configurable retry policies

### SEO Utilities

- **Schema Generator**: More schema.org types
- **Sitemap Automation**: Auto-update sitemap
- **Robots.txt**: Generate robots.txt
- **Meta Tag Validation**: Validate meta tags
- **Social Media Cards**: Test social media previews
- **Structured Data Testing**: Validate structured data

### Media Utilities

- **WebP/AVIF**: Modern format support
- **Responsive Images**: Generate responsive image sets
- **Lazy Loading**: Lazy loading utilities
- **Image CDN**: CDN integration
- **Video Transcoding**: Video format conversion
- **Live Streaming**: Live stream support
- **AR/VR**: 3D model support

### Analytics

- **Event Queue**: Queue events for batch sending
- **Privacy**: GDPR-compliant analytics
- **Custom Dimensions**: Support custom dimensions
- **Funnel Tracking**: Conversion funnel utilities
- **Heatmaps**: Heatmap integration
- **Session Recording**: Session replay utilities
- **A/B Testing**: A/B test utilities

## New Utility Categories

### String Utilities (string-utils.ts)

Create comprehensive string utilities:

- `slugify(text)` - Create URL slugs
- `capitalize(text)` - Capitalize text
- `truncate(text, length, ellipsis)` - Truncate strings
- `stripHTML(html)` - Remove HTML tags
- `escapeHTML(text)` - Escape HTML
- `unescapeHTML(text)` - Unescape HTML
- `camelCase(text)` - Convert to camelCase
- `kebabCase(text)` - Convert to kebab-case
- `snakeCase(text)` - Convert to snake_case

### Array Utilities (array-utils.ts)

Array manipulation utilities:

- `chunk(array, size)` - Split array into chunks
- `unique(array)` - Remove duplicates
- `groupBy(array, key)` - Group by property
- `sortBy(array, key)` - Sort by property
- `partition(array, predicate)` - Partition array
- `shuffle(array)` - Shuffle array
- `sample(array, n)` - Random sample

### Object Utilities (object-utils.ts)

Object manipulation utilities:

- `pick(object, keys)` - Pick properties
- `omit(object, keys)` - Omit properties
- `merge(obj1, obj2)` - Deep merge
- `clone(object)` - Deep clone
- `diff(obj1, obj2)` - Object difference
- `flatten(object)` - Flatten nested object
- `unflatten(object)` - Unflatten object

### Async Utilities (async-utils.ts)

Async operation utilities:

- `retry(fn, options)` - Retry with backoff
- `timeout(promise, ms)` - Promise timeout
- `delay(ms)` - Async delay
- `poll(fn, interval, condition)` - Polling
- `queue(fns)` - Sequential execution
- `parallel(fns, limit)` - Parallel with limit
- `race(promises)` - Promise race

### Cache Utilities (cache-utils.ts)

Caching utilities:

- `memoize(fn)` - Function memoization
- `cacheFn(fn, ttl)` - Cache with TTL
- `LRUCache` - LRU cache implementation
- `persistCache(cache, key)` - Persist to storage
- `invalidateCache(pattern)` - Cache invalidation

### Performance Utilities (performance-utils.ts)

Performance monitoring:

- `measure(fn, label)` - Measure function time
- `debounce(fn, wait)` - Debounce function
- `throttle(fn, wait)` - Throttle function
- `raf(fn)` - RequestAnimationFrame wrapper
- `idle(fn)` - RequestIdleCallback wrapper
- `lazy(importer)` - Lazy import utility

### DOM Utilities (dom-utils.ts)

DOM manipulation (client-only):

- `$<id)` - QuerySelector wrapper
- `addClass(el, className)` - Add class
- `removeClass(el, className)` - Remove class
- `toggleClass(el, className)` - Toggle class
- `getScrollPosition()` - Get scroll position
- `scrollTo(position)` - Smooth scroll
- `copyToClipboard(text)` - Copy to clipboard

### Security Utilities (security-utils.ts)

Security helpers:

- `sanitizeInput(input)` - Sanitize user input
- `escapeSQL(input)` - Escape SQL
- `generateCSRFToken()` - Generate CSRF token
- `validateCSRFToken(token)` - Validate CSRF
- `hashPassword(password)` - Hash password
- `comparePassword(plain, hash)` - Compare passwords
- `generateSecureToken()` - Generate secure token

### File Utilities (file-utils.ts)

File handling:

- `readFile(file)` - Read file as text
- `readFileAsDataURL(file)` - Read as data URL
- `downloadFile(url, filename)` - Download file
- `getFileExtension(filename)` - Get extension
- `getMimeType(file)` - Get MIME type
- `validateFileType(file, types)` - Validate type
- `validateFileSize(file, maxSize)` - Validate size

## Architecture Improvements

### Functional Programming

- **Pure Functions**: All utilities should be pure
- **Composition**: Function composition utilities
- **Piping**: Pipe operator support
- **Currying**: Curry utilities for partial application
- **Monads**: Maybe, Either monads for error handling

### Module System

- **ES Modules**: Use ES modules throughout
- **Tree Shaking**: Ensure tree-shakeable
- **Side Effects**: Mark side-effect-free modules
- **Conditional Exports**: Node vs Browser exports

### Build Optimization

- **Code Splitting**: Split utilities into chunks
- **Bundle Analysis**: Regular bundle analysis
- **Minification**: Aggressive minification
- **Compression**: Enable compression

## Developer Experience

### Documentation

- **JSDoc**: Complete JSDoc for all functions
- **Examples**: Usage examples in comments
- **TypeScript**: Type documentation
- **Storybook**: Interactive docs
- **Playground**: Online playground

### IDE Support

- **IntelliSense**: Better autocomplete
- **Type Hints**: Inline type hints
- **Quick Fixes**: ESLint quick fixes
- **Snippets**: Code snippets

### Error Messages

- **Helpful Errors**: Descriptive error messages
- **Suggestions**: Suggest fixes
- **Links**: Link to documentation
- **Context**: Provide context in errors

## Performance Considerations

### Optimization

- **Memoization**: Memoize expensive operations
- **Lazy Evaluation**: Lazy evaluation where possible
- **Avoid Loops**: Use efficient algorithms
- **Batch Operations**: Batch where possible

### Memory Management

- **Weak References**: Use WeakMap/WeakSet
- **Cleanup**: Clean up resources
- **Avoid Leaks**: Prevent memory leaks

### Bundle Size

- **Tree Shaking**: Ensure tree-shakeable
- **Code Splitting**: Split large utilities
- **Lazy Loading**: Load on demand
- **Bundle Analysis**: Monitor size

## Testing Strategy

### Unit Tests

- **Coverage**: 100% test coverage
- **Edge Cases**: Test all edge cases
- **Error Cases**: Test error conditions
- **Performance**: Performance tests

### Integration Tests

- **Combinations**: Test utility combinations
- **Real Scenarios**: Real-world scenarios
- **Cross-browser**: Test in all browsers

### Property-Based Testing

- **fast-check**: Use property-based testing
- **Invariants**: Test invariants
- **Random Inputs**: Test with random data

## Migration Strategy

### Deprecation Process

- **Mark Deprecated**: Use @deprecated JSDoc
- **Warnings**: Console warnings
- **Migration Guide**: Provide migration guide
- **Codemods**: Automated migration scripts

### Breaking Changes

- **Versioning**: Semantic versioning
- **Changelog**: Detailed changelog
- **Migration Path**: Clear migration path
- **Backward Compatibility**: Maintain when possible

## Future Enhancements

### AI-Powered

- **Smart Suggestions**: AI code suggestions
- **Error Prediction**: Predict errors
- **Performance Tips**: AI performance tips

### Real-time

- **Collaborative Editing**: CRDT utilities
- **WebSocket**: WebSocket helpers
- **Live Updates**: Real-time update utilities

### Web3

- **Blockchain**: Blockchain utilities
- **Crypto**: Cryptocurrency utilities
- **NFT**: NFT utilities
- **Smart Contracts**: Contract interaction

## Best Practices

### Do's

- ✅ Keep utilities pure
- ✅ One utility per file
- ✅ Export named functions
- ✅ Document with JSDoc
- ✅ Unit test everything
- ✅ Use TypeScript
- ✅ Handle edge cases
- ✅ Validate inputs

### Don'ts

- ❌ Don't create god utilities
- ❌ Don't have side effects
- ❌ Don't use global state
- ❌ Don't couple to framework
- ❌ Don't skip validation
- ❌ Don't ignore errors
- ❌ Don't forget cleanup
- ❌ Don't optimize prematurely
