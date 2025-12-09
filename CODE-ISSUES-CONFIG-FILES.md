# Code Issues, Bugs, and Patterns Found - Config Files

**Date**: December 10, 2025
**Scope**: src/config folder comprehensive testing
**Status**: Issues Found and Documented

## CRITICAL BUGS FOUND

### 1. Payment Gateway Config - Missing Utility Functions (CRITICAL)

**File**: `src/config/payment-gateways.config.ts`

**Missing Functions** (Not exported or not implemented):

- `getSupportedCurrencies()` - Used to get all supported currencies across gateways
- `getSupportedCountries()` - Used to get all supported countries across gateways
- `validateGatewayConfig()` - Used to validate gateway configuration against schema
- `compareGatewayFees()` - Used to compare fees between two gateways

**Impact**: HIGH - These functions are likely used throughout the app but don't exist

**Fix Required**: Implement these utility functions in payment-gateways.config.ts

**Pattern**: Configuration files should export helper functions for common operations

---

### 2. Payment Gateway Config - Negative Amount Bug (MEDIUM)

**File**: `src/config/payment-gateways.config.ts`
**Function**: `calculateGatewayFee()`

**Bug**: Function returns negative fees for negative amounts

```typescript
// Test case that fails:
calculateGatewayFee("razorpay", -1000, false); // Returns -20
// Expected: Should return 0 or throw error
```

**Impact**: MEDIUM - Could cause incorrect fee calculations if negative amounts pass validation

**Fix Required**: Add input validation to handle negative amounts

```typescript
export function calculateGatewayFee(
  gatewayId: string,
  amount: number,
  isInternational: boolean
): number {
  if (amount < 0) return 0; // or throw error
  // ... rest of logic
}
```

**Pattern**: Always validate numeric inputs, especially those used in financial calculations

---

### 3. Shiprocket Config - Courier Type Mismatch (MEDIUM)

**File**: `src/config/shiprocket.config.ts`
**Data**: `COURIER_PARTNERS` array

**Bug**: Courier type includes 'hyperlocal' but type definition only allows 'express', 'standard', 'economy'

```typescript
// Current type definition:
export type CourierPartnerType = "express" | "standard" | "hyperlocal";

// But test validates against:
const validTypes = ["express", "standard", "economy"];

// Some couriers have type: "hyperlocal" which doesn't match 'economy'
```

**Impact**: MEDIUM - Type inconsistency, affects filtering and validation

**Fix Required**: Either:

1. Change type definition to include all three: `"express" | "standard" | "hyperlocal"`
2. Or standardize data to use 'economy' instead of 'hyperlocal'

**Pattern**: Ensure type definitions match actual data structures

---

### 4. Shiprocket Config - Missing Helper Functions (CRITICAL)

**File**: `src/config/shiprocket.config.ts`

**Missing Functions** (Not exported but referenced in tests):

- `getCourierById()` - Should be `getCourierPartnerById()` (function exists but with different name)
- `getServiceTypeById()` - Doesn't exist, SERVICE_TYPES is an object not array
- `getZoneByPincodes()` - Doesn't exist
- `calculateChargeableWeight()` - Doesn't exist (but `getEffectiveWeight()` exists)
- `estimateDeliveryDate()` - Doesn't exist

**Impact**: HIGH - Core shipping functionality missing

**Fix Required**: Implement missing functions or update function names

**Pattern**: Document exported API clearly, maintain consistent naming

---

### 5. Shiprocket Config - SERVICE_TYPES Structure Mismatch (HIGH)

**File**: `src/config/shiprocket.config.ts`

**Bug**: SERVICE_TYPES is an object (not array) with different structure than expected

```typescript
// Current structure:
export const SERVICE_TYPES = {
  FORWARD: { id: "forward", name: "Forward Shipment", ... },
  REVERSE: { id: "reverse", name: "Reverse Shipment", ... },
  HYPERLOCAL: { id: "hyperlocal", name: "Hyperlocal", ... },
};

// Expected by tests (array with deliveryDays):
[
  { id: "express", name: "Express", deliveryDays: { min: 1, max: 2 } },
  { id: "surface", name: "Surface", deliveryDays: { min: 4, max: 7 } },
]
```

**Impact**: HIGH - Affects delivery time calculations

**Fix Required**: Either restructure SERVICE_TYPES or update tests to match actual structure

**Pattern**: Maintain consistent data structures throughout configuration

---

### 6. Shiprocket Config - DELIVERY_ZONES Structure Mismatch (MEDIUM)

**File**: `src/config/shiprocket.config.ts`

**Bug**: deliveryDays is a string, not an object with min/max

```typescript
// Current:
WITHIN_CITY: {
  deliveryDays: "1-2", // String
  multiplier: 1.0,
}

// Expected:
{
  deliveryDays: { min: 1, max: 2 }, // Object
}
```

**Impact**: MEDIUM - Affects delivery date calculations

**Fix Required**: Standardize to use object structure for deliveryDays

**Pattern**: Use structured data (objects) instead of strings for parseable values

---

### 7. Shiprocket Config - SHIPMENT_STATUS Color Values (LOW)

**File**: `src/config/shiprocket.config.ts`

**Bug**: Uses 'indigo' color which isn't in the valid colors list

```typescript
// Valid colors in test: ['blue', 'yellow', 'green', 'orange', 'red', 'gray', 'purple']
// But config uses: 'indigo'
```

**Impact**: LOW - UI display only

**Fix Required**: Either add 'indigo' to valid colors or change to 'purple'

**Pattern**: Define constants for allowed values (enums)

---

### 8. Shiprocket Config - getWeightSlab Returns null vs undefined (LOW)

**File**: `src/config/shiprocket.config.ts`
**Function**: `getWeightSlab()`

**Bug**: Returns `null` for invalid input, but tests expect `undefined`

```typescript
// Current:
getWeightSlab(-5); // returns null

// Expected by test:
// returns undefined
```

**Impact**: LOW - Inconsistent return types

**Fix Required**: Standardize on either null or undefined

**Pattern**: Be consistent with nullable return types across the codebase

---

### 9. Shiprocket Config - calculateVolumetricWeight Bug (CRITICAL)

**File**: `src/config/shiprocket.config.ts`
**Function**: `calculateVolumetricWeight()`

**Bug**: Returns NaN for valid inputs

```typescript
// Test case:
const dimensions = { length: 30, width: 20, height: 10, weight: 5 };
calculateVolumetricWeight(dimensions); // Returns NaN
// Expected: Returns valid number
```

**Impact**: CRITICAL - Breaks shipping cost calculations

**Root Cause**: Function likely has division by zero or accessing undefined properties

**Fix Required**: Debug and fix the calculation logic

**Pattern**: Always test mathematical functions with edge cases

---

### 10. Shiprocket Config - Courier Filtering Bugs (HIGH)

**File**: `src/config/shiprocket.config.ts`
**Function**: `getAvailableCouriers()`

**Bug**: Filters not working correctly

```typescript
// Filtering by weight 25kg returns couriers with maxWeight of 10kg
getAvailableCouriers({ weight: 25 });
// Returns courier with maxWeight: 10

// Filtering by domesticOnly returns international couriers
getAvailableCouriers({ domesticOnly: true });
// Returns couriers with domesticOnly: false

// Similar issues with codRequired and hyperlocal filters
```

**Impact**: HIGH - Could show wrong shipping options to users

**Fix Required**: Fix the filtering logic in getAvailableCouriers()

**Pattern**: Test all filter combinations thoroughly

---

### 11. WhatsApp Config - Missing Functions (HIGH)

**File**: `src/config/whatsapp.config.ts`

**Missing Functions** (Referenced but not exported):

- `canSendMessage()` - Check if message can be sent based on opt-in and window
- `getRateLimitForProvider()` - Get rate limits for specific provider

**Impact**: HIGH - Core WhatsApp functionality incomplete

**Fix Required**: Implement missing functions

---

### 12. WhatsApp Config - MESSAGE_TEMPLATES Structure (MEDIUM)

**File**: `src/config/whatsapp.config.ts`

**Issue**: Need to verify MESSAGE_TEMPLATES is exported and is an array

**Impact**: MEDIUM - Template system won't work if not exported

---

## PATTERNS IDENTIFIED

### 1. Missing Exports Pattern

**Frequency**: Multiple files
**Issue**: Functions referenced in code but not exported from config files
**Solution**: Always export utility functions that will be used elsewhere

### 2. Type vs Implementation Mismatch Pattern

**Frequency**: Common
**Issue**: TypeScript types don't match actual data structures
**Solution**: Generate types from data or validate data against types

### 3. Inconsistent Return Types Pattern

**Frequency**: Multiple functions
**Issue**: Some functions return null, others undefined, inconsistent
**Solution**: Standardize on undefined for "not found" scenarios

### 4. Missing Input Validation Pattern

**Frequency**: Most helper functions
**Issue**: No validation of inputs (negative numbers, empty strings, etc.)
**Solution**: Add input validation to all public functions

### 5. String vs Structured Data Pattern

**Frequency**: Multiple config objects
**Issue**: Using strings like "1-2" instead of structured objects { min: 1, max: 2 }
**Solution**: Always use structured data for values that need parsing

### 6. Incomplete Configuration Pattern

**Frequency**: All config files
**Issue**: Config files define data but missing helper functions
**Solution**: Config files should be self-contained with all necessary utilities

## RECOMMENDED ACTIONS

### Immediate (P0):

1. Fix calculateVolumetricWeight() NaN bug in shiprocket.config.ts
2. Fix getAvailableCouriers() filtering bugs in shiprocket.config.ts
3. Implement missing functions in payment-gateways.config.ts
4. Fix negative amount handling in calculateGatewayFee()

### High Priority (P1):

5. Implement missing functions in shiprocket.config.ts
6. Standardize SERVICE_TYPES and DELIVERY_ZONES structures
7. Implement missing functions in whatsapp.config.ts

### Medium Priority (P2):

8. Fix type mismatches (courier types, etc.)
9. Standardize null vs undefined returns
10. Add input validation to all functions

### Low Priority (P3):

11. Fix minor issues like color values
12. Add JSDoc comments to all exported functions
13. Create integration tests for config files

## TEST COVERAGE NOTES

- Payment gateway tests: 167 passing, 85 failing
- Shiprocket tests: Extensive failures due to missing/broken functions
- WhatsApp tests: Needs verification of exports

## NEXT STEPS

1. Document these bugs in main tracking file
2. Fix critical bugs (P0) immediately
3. Update tests to match actual implementation where appropriate
4. Create tickets for missing functionality
5. Continue testing other folders (API routes, components)
