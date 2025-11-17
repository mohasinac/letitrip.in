# Test Data Context Sharing - Implementation Guide

## Overview

The test workflow system now implements **shared context** between dummy data generation and workflow execution. This ensures that all workflows use the same test data, making tests consistent and reliable.

## How It Works

### 1. Data Generation Returns Context

When you generate test data, the API now returns the organized context immediately:

```typescript
// Generate data
POST /api/test-data/generate-complete
{
  users: 5,
  shopsPerUser: 1,
  productsPerShop: 10
}

// Response includes context
{
  success: true,
  stats: { users: 5, shops: 2, products: 20, ... },
  context: {
    users: {
      admin: [...],
      sellers: [...],
      customers: [...],
      all: [...]
    },
    shops: {
      verified: [...],
      featured: [...],
      byOwnerId: {...}
    },
    products: {
      published: [...],
      inStock: [...],
      byShopId: {...}
    },
    // ... more organized data
  }
}
```

### 2. Context is Stored in UI State

The UI stores the context in React state after generation:

```typescript
const [testDataContext, setTestDataContext] = useState<any>(null);

// After generation
if (data.context) {
  setTestDataContext(data.context);
  // Now available for all workflows
}
```

### 3. Workflows Use Shared Context

When running workflows, they use the stored context:

```typescript
const runWorkflow = async (workflowId: string) => {
  // Use stored context if available
  let context = testDataContext;

  if (!context) {
    // Fallback: fetch from database
    const contextRes = await fetch("/api/test-data/context");
    context = contextRes.context;
    setTestDataContext(context);
  }

  // Execute workflow with context
  await fetch(`/api/test-workflows/${workflowId}`, {
    method: "POST",
    body: JSON.stringify({ context, config }),
  });
};
```

### 4. Workflows Access Shared Data

Workflows access the same test data:

```typescript
// In workflow
const { context } = await request.json();

// All workflows use the same users
const customer = context.users.customers[0];

// Same products
const product = context.products.inStock[0];

// Same shops
const shop = context.shops.verified[0];
```

## Benefits

### ✅ Consistency

- All workflows use the **exact same test data**
- No race conditions or data mismatches
- Predictable test results

### ✅ Performance

- Context loaded **once** from database
- Shared across **multiple workflows**
- No redundant API calls

### ✅ Reliability

- Workflows see the **same data state**
- Related entities are **guaranteed to exist**
- No missing relationships

### ✅ Simplicity

- **No hardcoded IDs** needed
- Easy access to related data
- Clear data organization

## Usage Examples

### Example 1: Generate and Run Multiple Workflows

```typescript
// 1. Generate data (returns context)
const { context } = await generateData();

// 2. Run workflow 1 with context
await runWorkflow("product-purchase", context);

// 3. Run workflow 2 with SAME context
await runWorkflow("auction-bidding", context);

// 4. Run workflow 3 with SAME context
await runWorkflow("order-fulfillment", context);

// All three workflows use the same users, shops, and products!
```

### Example 2: Testing Related Workflows

```typescript
// Generate test data
const { context } = await generateData({
  users: 3,
  shopsPerUser: 1,
  productsPerShop: 5,
});

// Workflow 1: Customer buys product
const customer = context.users.customers[0];
const product = context.products.inStock[0];
const order = await createOrder(customer, product);

// Workflow 2: Seller fulfills order
const seller = context.users.sellers[0];
const shop = context.shops.byOwnerId[seller.id][0];
await fulfillOrder(order, seller, shop);

// Both workflows use the same test data!
```

### Example 3: Testing Shop-Specific Scenarios

```typescript
const { context } = await generateData();

// Get specific shop and its data
const shop = context.shops.verified[0];
const shopProducts = context.products.byShopId[shop.id];
const shopOrders = context.orders.byShopId[shop.id];
const shopCoupons = context.coupons.byShopId[shop.id];

// All related data for testing shop workflows
```

## Context Structure

```typescript
{
  users: {
    admin: TestUser[]          // Admin users
    sellers: TestUser[]        // Seller users
    customers: TestUser[]      // Customer users
    all: TestUser[]            // All users
  },

  shops: {
    verified: TestShop[]       // Verified shops
    unverified: TestShop[]     // Unverified shops
    featured: TestShop[]       // Featured shops
    all: TestShop[]            // All shops
    byOwnerId: Record<id, TestShop[]>  // Shops by owner
  },

  products: {
    published: TestProduct[]   // Published products
    draft: TestProduct[]       // Draft products
    featured: TestProduct[]    // Featured products
    inStock: TestProduct[]     // In-stock products
    all: TestProduct[]         // All products
    byShopId: Record<id, TestProduct[]>     // Products by shop
    byCategoryId: Record<id, TestProduct[]> // Products by category
  },

  auctions: {
    live: TestAuction[]        // Live auctions
    scheduled: TestAuction[]   // Scheduled auctions
    draft: TestAuction[]       // Draft auctions
    featured: TestAuction[]    // Featured auctions
    all: TestAuction[]         // All auctions
    byShopId: Record<id, TestAuction[]>  // Auctions by shop
  },

  coupons: {
    active: TestCoupon[]       // Active coupons
    inactive: TestCoupon[]     // Inactive coupons
    all: TestCoupon[]          // All coupons
    byShopId: Record<id, TestCoupon[]>  // Coupons by shop
  },

  orders: {
    pending: TestOrder[]       // Pending orders
    confirmed: TestOrder[]     // Confirmed orders
    shipped: TestOrder[]       // Shipped orders
    delivered: TestOrder[]     // Delivered orders
    all: TestOrder[]           // All orders
    byUserId: Record<id, TestOrder[]>  // Orders by user
    byShopId: Record<id, TestOrder[]>  // Orders by shop
  },

  metadata: {
    generatedAt: string        // Generation timestamp
    totalItems: number         // Total items count
    prefix: string             // Data prefix (TEST_)
  }
}
```

## Best Practices

### ✅ DO: Use Stored Context

```typescript
// Good - Uses shared context
const customer = context.users.customers[0];
const product = context.products.inStock[0];
```

### ❌ DON'T: Hardcode IDs

```typescript
// Bad - Hardcoded IDs
const customerId = "test-customer-001";
const productId = "test-product-123";
```

### ✅ DO: Check Data Availability

```typescript
// Good - Verify data exists
if (context.products.inStock.length === 0) {
  throw new Error("No in-stock products available");
}

const product = context.products.inStock[0];
```

### ❌ DON'T: Assume Data Exists

```typescript
// Bad - No validation
const product = context.products.inStock[0]; // Might be undefined!
```

### ✅ DO: Use Relationship Maps

```typescript
// Good - Use relationship maps
const shop = context.shops.all[0];
const shopProducts = context.products.byShopId[shop.id] || [];
const shopOrders = context.orders.byShopId[shop.id] || [];
```

### ❌ DON'T: Filter Manually

```typescript
// Bad - Slow manual filtering
const shopProducts = context.products.all.filter((p) => p.shopId === shop.id);
```

## Flow Diagram

```
┌─────────────────────┐
│  Generate Test Data │
│                     │
│  POST /generate     │
└──────────┬──────────┘
           │
           │ Returns context
           ▼
┌─────────────────────┐
│  Store Context      │
│  in UI State        │
│                     │
│  setTestDataContext │
└──────────┬──────────┘
           │
           │ Shared context
           │
     ┌─────┴─────┬─────────┬─────────┐
     │           │         │         │
     ▼           ▼         ▼         ▼
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│Workflow1│ │Workflow2│ │Workflow3│ │Workflow4│
│         │ │         │ │         │ │         │
│ Uses    │ │ Uses    │ │ Uses    │ │ Uses    │
│ context │ │ context │ │ context │ │ context │
└─────────┘ └─────────┘ └─────────┘ └─────────┘
     │           │         │         │
     └───────────┴────┬────┴─────────┘
                      │
                      ▼
              All use same data!
```

## UI Features

### Context Status Banner

When context is loaded, a banner shows:

```
✓ Test Data Context Ready
5 items organized • 5 users • 2 shops • 10 published products
[Clear Context]
```

### Activity Logs

Generation logs show context details:

```
✓ Generated 5 users
✓ Generated 2 shops
✓ Context created: 27 items organized
  - 5 users (1 admin, 1 sellers, 3 customers)
  - 2 shops (2 verified, 1 featured)
  - 10 published products (10 in stock)
  - 5 live auctions
```

### Workflow Execution Logs

```
Starting workflow: product-purchase
✓ Using stored context: 27 items
✓ Workflow product-purchase completed: success
```

## API Endpoints

### Generate with Context

```typescript
POST / api / test - data / generate - complete;
Response: {
  success, stats, context;
}
```

### Fetch Context

```typescript
GET / api / test - data / context;
Response: {
  success, context;
}
```

### Execute Workflow with Context

```typescript
POST / api / test - workflows / { workflowId };
Body: {
  context, config;
}
Response: {
  success, workflowName, results;
}
```

## Troubleshooting

### Issue: Context Not Available

**Solution:** Generate test data first or clear and regenerate:

```typescript
// Clear old context
setTestDataContext(null);

// Generate fresh data
await generateData();
```

### Issue: Workflows Using Different Data

**Problem:** Context was not shared properly

**Solution:** Ensure context is passed to all workflows:

```typescript
// All workflows must receive context
await runWorkflow("workflow1", context);
await runWorkflow("workflow2", context); // Same context!
```

### Issue: Old Data in Context

**Problem:** Context cached from previous generation

**Solution:** Clear context before regenerating:

```typescript
// Clear context
setTestDataContext(null);

// Regenerate
await generateData();
```

## Summary

✅ **Context Sharing Enabled**

- Generation returns organized context
- UI stores context in state
- Workflows use shared context
- All tests use same data

✅ **Benefits**

- Consistent test results
- Better performance
- Reliable relationships
- Simpler workflow code

✅ **Visual Feedback**

- Context status banner
- Detailed activity logs
- Clear button to reset

This implementation ensures that dummy data creation and workflows truly share context, making your tests more reliable and easier to maintain!
