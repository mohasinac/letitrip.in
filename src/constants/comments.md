# Constants - Future Refactoring Notes

## Improvements

### 1. Type Safety

- Generate types from constants
- Use branded types for special values
- Discriminated unions for status

### 2. Internationalization

- Extract user-facing strings to i18n
- Language-specific constants
- Locale-based formatting

### 3. Environment-Based

- Different constants per environment
- Feature flag integration
- Remote configuration

### 4. Validation

- Runtime validation with Zod
- Type guards for constants
- Exhaustiveness checking

## Best Practices

- ✅ Use `as const` for immutability
- ✅ Extract types from constants
- ✅ Group related constants
- ✅ Document magic numbers
- ❌ Don't use enums
- ❌ Don't hardcode user-facing strings
