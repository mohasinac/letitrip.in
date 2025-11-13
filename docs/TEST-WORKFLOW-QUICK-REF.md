# Test Workflow System - Quick Reference

## Quick Start

### 1. Generate Test Data

```bash
# Via UI: Go to /test-workflow → Test Data Tab → Generate Complete Dummy Data
# This is the recommended and only supported method

# Navigate to:
http://localhost:3000/test-workflow
```

### 2. Run Workflow

```bash
# Via UI: Go to /test-workflow → Workflows Tab → Click "Run" on any workflow
# All workflows are executed through the UI

# Navigate to:
http://localhost:3000/test-workflow
```

### 3. Cleanup

```bash
# Via UI: Go to /test-workflow → Danger Zone → Delete All Test Data

# Navigate to:
http://localhost:3000/test-workflow
```

## Access the Test System

```
URL: http://localhost:3000/test-workflow
Admin access required
```

## Common Tasks

### Check Test Data Status

```typescript
const response = await fetch("/api/test-data/status");
const { stats } = await response.json();
console.log(`Users: ${stats.users}, Products: ${stats.products}`);
```

### Get Test Data Context

```typescript
const response = await fetch("/api/test-data/context");
const { context } = await response.json();

// Use organized data
const firstCustomer = context.users.customers[0];
const inStockProduct = context.products.inStock[0];
const verifiedShop = context.shops.verified[0];
```

### Run Single Workflow

```typescript
// 1. Load context
const contextRes = await fetch("/api/test-data/context");
const { context } = await contextRes.json();

// 2. Execute workflow
const workflowRes = await fetch("/api/test-workflows/product-purchase", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ context, config: {} }),
});

const result = await workflowRes.json();
console.log(`Status: ${result.finalStatus}`);
console.log(`Passed: ${result.passed}/${result.totalSteps}`);
```

### Run All Workflows

```typescript
const workflows = [
  "product-purchase",
  "auction-bidding",
  "order-fulfillment",
  "support-tickets",
  "reviews-ratings",
];

for (const workflowId of workflows) {
  const response = await fetch(`/api/test-workflows/${workflowId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ context, config: {} }),
  });

  const result = await response.json();
  console.log(`${workflowId}: ${result.finalStatus}`);
}
```

### Generate and Run (One Command)

```typescript
const response = await fetch("/api/test-workflows/manager", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    action: "generateAndRun",
    workflowIds: ["product-purchase"],
    config: {
      users: 5,
      shopsPerUser: 1,
      productsPerShop: 10,
    },
    cleanupBefore: true,
    cleanupAfter: false,
  }),
});
```

## Test Data Organization

### Users

```typescript
context.users.admin; // Admin users
context.users.sellers; // Seller users
context.users.customers; // Customer users
context.users.all; // All users
```

### Shops

```typescript
context.shops.verified; // Verified shops
context.shops.featured; // Featured shops
context.shops.byOwnerId[id]; // Shops by owner
context.shops.all; // All shops
```

### Products

```typescript
context.products.published; // Published products
context.products.inStock; // In-stock products
context.products.featured; // Featured products
context.products.byShopId[id]; // Products by shop
context.products.all; // All products
```

### Auctions

```typescript
context.auctions.live; // Live auctions
context.auctions.scheduled; // Scheduled auctions
context.auctions.featured; // Featured auctions
context.auctions.byShopId[id]; // Auctions by shop
context.auctions.all; // All auctions
```

### Coupons

```typescript
context.coupons.active; // Active coupons
context.coupons.byShopId[id]; // Coupons by shop
context.coupons.all; // All coupons
```

### Orders

```typescript
context.orders.pending; // Pending orders
context.orders.confirmed; // Confirmed orders
context.orders.shipped; // Shipped orders
context.orders.byUserId[id]; // Orders by user
context.orders.byShopId[id]; // Orders by shop
context.orders.all; // All orders
```

## Available Workflows

| ID                  | Name                  | Description                | Steps |
| ------------------- | --------------------- | -------------------------- | ----- |
| `product-purchase`  | Product Purchase Flow | Complete customer purchase | 11    |
| `auction-bidding`   | Auction Bidding Flow  | Place bids and win         | 12    |
| `order-fulfillment` | Order Fulfillment     | Seller order processing    | 11    |
| `support-tickets`   | Support Ticket Flow   | Customer service           | 12    |
| `reviews-ratings`   | Reviews & Ratings     | Post-purchase review       | 12    |

## Configuration Options

### Data Generation Config

```typescript
{
  users: 5,                    // Number of test users
  shopsPerUser: 1,             // Shops per user
  productsPerShop: 10,         // Products per shop
  auctionsPerShop: 5,          // Auctions per shop
  reviewsPerProduct: 3,        // Reviews per product
  ordersPerUser: 2,            // Orders per user
  ticketsPerUser: 1,           // Support tickets per user
  couponsPerShop: 3,           // Coupons per shop
  featuredPercentage: 30,      // % featured items
  homepagePercentage: 20,      // % homepage items
  heroSlidesCount: 5           // Hero slides count
}
```

### Workflow Config

```typescript
{
  USERS: {
    CUSTOMER_ID: 'test-customer-001',
    SELLER_ID: 'test-seller-001',
    ADMIN_ID: 'test-admin-001'
  },
  SHOPS: {
    TEST_SHOP_ID: 'test-shop-001'
  },
  WORKFLOW_OPTIONS: {
    PAUSE_BETWEEN_STEPS: 500,
    CONTINUE_ON_ERROR: false
  }
}
```

## Workflow Result Structure

```typescript
{
  workflowName: "Product Purchase Flow",
  workflowId: "product-purchase",
  totalSteps: 11,
  passed: 11,
  failed: 0,
  skipped: 0,
  totalDuration: 2500,
  finalStatus: "success",
  results: [
    {
      step: "Browse Products",
      status: "success",
      message: "Step completed successfully",
      duration: 150,
      data: { totalProducts: 50 }
    },
    // ... more steps
  ]
}
```

## Common Patterns

### Check Before Use

```typescript
// Always check if data exists
if (context.products.inStock.length === 0) {
  throw new Error("No in-stock products available");
}

const product = context.products.inStock[0];
```

### Find Related Data

```typescript
// Find shop for a product
const product = context.products.inStock[0];
const shop = context.shops.all.find((s) => s.id === product.shopId);

// Find products for a shop
const shopProducts = context.products.byShopId[shop.id] || [];

// Find owner of a shop
const owner = context.users.all.find((u) => u.id === shop.ownerId);
```

### Error Handling

```typescript
try {
  const result = await executeWorkflow();
  console.log("Success:", result);
} catch (error) {
  console.error("Failed:", error.message);
  // Check logs for details
}
```

## Cleanup Strategies

### After Each Test

```typescript
await fetch("/api/test-data/cleanup", { method: "POST" });
```

### After Batch

```typescript
// Run all workflows first
for (const workflow of workflows) {
  await runWorkflow(workflow);
}
// Then cleanup once
await fetch("/api/test-data/cleanup", { method: "POST" });
```

### Selective Cleanup

```typescript
// Only cleanup specific collections
// (Custom implementation needed)
```

## Tips & Tricks

1. **Generate Once, Test Many**: Generate data once and run multiple workflows
2. **Use Context**: Always use context instead of hardcoded IDs
3. **Check Logs**: UI logs show real-time progress
4. **Debug Data**: Use the debug endpoint to inspect data
5. **Batch Operations**: Run related workflows together

## Keyboard Shortcuts (UI)

- Generate data: `Ctrl+G` (planned)
- Run workflow: `Ctrl+R` (planned)
- Clear logs: `Ctrl+L` (planned)

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
# Used for internal API calls in workflow manager
```

## Troubleshooting

| Issue              | Solution                        |
| ------------------ | ------------------------------- |
| No data available  | Generate test data first        |
| Workflow fails     | Check context has required data |
| Cleanup incomplete | Run cleanup multiple times      |
| Slow execution     | Reduce data generation config   |
| Context error      | Verify API responses            |

## Next Steps

1. Generate test data
2. Verify in UI statistics
3. Run individual workflows
4. Check results
5. Run batch execution
6. Review reports
7. Cleanup when done

## Support

- UI: `/test-workflow`
- Docs: `/docs/TEST-WORKFLOW-SYSTEM.md`
- API: All endpoints under `/api/test-*`
