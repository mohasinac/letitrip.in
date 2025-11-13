# Test Workflow System - Developer Guide

## Overview

The Test Workflow System provides a comprehensive framework for testing the entire application with realistic, contextual dummy data. It manages test data generation, workflow execution, and cleanup in a coordinated manner.

**Access Method:** UI-Only at `/test-workflow` (Admin access required)

## Quick Access

```
URL: http://localhost:3000/test-workflow
Requirements: Admin role
```

All test workflows are executed through the web UI. No CLI commands needed.

## Architecture

### Components

1. **Test Data Generator** (`/api/test-data/generate-complete`)

   - Generates comprehensive dummy data
   - Creates users, shops, products, auctions, orders, etc.
   - All test data is prefixed with `TEST_` for easy identification

2. **Test Data Context** (`/api/test-data/context`)

   - Organizes test data into a structured context
   - Groups data by role, status, and relationships
   - Provides easy access to related entities

3. **Workflow Manager** (`/api/test-workflows/manager`)

   - Coordinates data generation and workflow execution
   - Manages cleanup before and after execution
   - Provides batch execution capabilities

4. **Individual Workflows** (`/api/test-workflows/[workflow-id]`)
   - Execute specific test scenarios
   - Use shared test data context
   - Report detailed step-by-step results

## Test Data Context Structure

```typescript
{
  users: {
    admin: TestUser[],
    sellers: TestUser[],
    customers: TestUser[],
    all: TestUser[]
  },
  shops: {
    verified: TestShop[],
    featured: TestShop[],
    all: TestShop[],
    byOwnerId: Record<string, TestShop[]>
  },
  products: {
    published: TestProduct[],
    inStock: TestProduct[],
    featured: TestProduct[],
    byShopId: Record<string, TestProduct[]>
  },
  // ... and more organized collections
}
```

## Usage

All operations are performed through the UI at `/test-workflow`.

### UI Navigation

1. **Login as Admin**

   ```
   Navigate to /login
   Login with admin credentials
   ```

2. **Access Test System**

   ```
   Navigate to /test-workflow
   ```

3. **Two Main Tabs**
   - **Test Data Generation**: Create and manage dummy data
   - **Workflow Execution**: Run test workflows

### Generate Test Data (UI)

1. Go to **Test Data Generation** tab
2. Configure parameters:
   - Number of users
   - Shops per user
   - Products per shop
   - Auctions per shop
   - Reviews, orders, tickets, coupons
   - Featured and homepage percentages
3. Click **"Generate Complete Dummy Data"**
4. Wait for completion (logs shown in real-time)
5. View statistics and context

### Execute Workflows (UI)

1. Go to **Workflow Execution** tab
2. Choose execution method:
   - **Run**: Use existing test data
   - **🔄 Generate & Run**: Fresh data for single workflow
   - **Run All Workflows**: Batch execution
3. View progress and results
4. Check detailed logs

### Cleanup Test Data (UI)

1. Scroll to **Danger Zone** section
2. Click **"Delete All Test Data"**
3. Confirm deletion
4. All TEST\_ prefixed data removed

### API Integration (For Custom Scripts)

While the UI is the primary interface, the APIs are still available for programmatic access:

#### Generate Test Data

```typescript
const response = await fetch("/api/test-data/generate-complete", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    users: 5,
    shopsPerUser: 1,
    productsPerShop: 10,
    auctionsPerShop: 5,
  }),
});
```

#### Load Test Data Context

```typescript
// Get organized test data
const response = await fetch("/api/test-data/context");
const { context } = await response.json();

// Access specific data
const customer = context.users.customers[0];
const product = context.products.inStock[0];
const shop = context.shops.verified[0];
```

### 3. Execute Workflows

#### Single Workflow

```typescript
const response = await fetch("/api/test-workflows/product-purchase", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    context: testDataContext,
    config: workflowConfig,
  }),
});
```

#### Managed Execution (Generate + Run + Cleanup)

```typescript
const response = await fetch("/api/test-workflows/manager", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    action: "generateAndRun",
    workflowIds: ["product-purchase", "auction-bidding"],
    config: dataConfig,
    cleanupBefore: true,
    cleanupAfter: false,
  }),
});
```

### 4. Cleanup Test Data

```typescript
const response = await fetch("/api/test-data/cleanup", {
  method: "POST",
});
```

## Creating New Workflows

### 1. Define Workflow Type

```typescript
// Add to src/types/test-workflow.ts
export interface YourWorkflowContext {
  // Specific data needed
}
```

### 2. Create Workflow API Route

```typescript
// src/app/api/test-workflows/your-workflow/route.ts
import { TestDataContext, WorkflowResult } from "@/types/test-workflow";

export async function POST(req: NextRequest) {
  const { context, config } = await req.json();
  const testContext = context as TestDataContext;

  const results: WorkflowStepResult[] = [];

  // Execute steps
  await executeStep("Step Name", async () => {
    // Use context data
    const user = testContext.users.customers[0];
    const product = testContext.products.inStock[0];

    // Perform workflow logic
    return { stepData };
  });

  // Return workflow result
  return NextResponse.json({
    success: true,
    workflowName: "Your Workflow",
    workflowId: "your-workflow",
    results,
    finalStatus: "success",
  });
}
```

### 3. Register Workflow in UI

```typescript
// Add to src/app/test-workflow/page.tsx WORKFLOWS array
{
  id: 'your-workflow',
  name: 'Your Workflow Name',
  description: 'What this workflow tests',
  steps: 10,
  icon: '🎯',
  role: 'User'
}
```

## Best Practices

### 1. Data Generation

- **Always use the `TEST_` prefix** for all generated data
- **Generate realistic data** using faker.js
- **Create relationships** between entities (users -> shops -> products)
- **Include edge cases** (out of stock, featured, etc.)

### 2. Workflow Design

- **Use test data context** instead of hardcoded IDs
- **Check data availability** before using
- **Handle missing data gracefully**
- **Report detailed results** for each step

### 3. Context Usage

```typescript
// ✅ Good - Use context
const customer = context.users.customers[0];
const product = context.products.inStock.find((p) => p.shopId === shop.id);

// ❌ Bad - Hardcoded IDs
const customerId = "test-customer-001";
const productId = "test-product-001";
```

### 4. Error Handling

```typescript
await executeStep("Step Name", async () => {
  if (context.products.inStock.length === 0) {
    throw new Error("No in-stock products available");
  }

  const product = context.products.inStock[0];
  return { productId: product.id };
});
```

## Workflow Execution Flow

### Complete Flow

```
1. Generate Test Data
   ↓
2. Load Test Data Context
   ↓
3. Execute Workflow(s)
   ├─ Step 1: Select customer
   ├─ Step 2: Browse products
   ├─ Step 3: Add to cart
   ├─ Step 4: Checkout
   └─ Step 5: Create order
   ↓
4. Generate Report
   ↓
5. Cleanup (optional)
```

### Manual Control

Users can:

- Generate data once, run multiple workflows
- Generate and run in one action
- Run workflows with existing data
- Cleanup manually or automatically

## UI Features

### Test Data Tab

- Configure generation parameters
- Generate complete or partial data
- View real-time statistics
- See activity logs
- Manual cleanup

### Workflows Tab

- View all available workflows
- Run individual workflows
- Run with existing data or generate fresh
- Batch execution
- View detailed results

## API Endpoints

| Endpoint                           | Method | Purpose                    |
| ---------------------------------- | ------ | -------------------------- |
| `/api/test-data/generate-complete` | POST   | Generate all test data     |
| `/api/test-data/context`           | GET    | Get organized test data    |
| `/api/test-data/status`            | GET    | Get test data counts       |
| `/api/test-data/cleanup`           | POST   | Delete all test data       |
| `/api/test-workflows/manager`      | POST   | Managed workflow execution |
| `/api/test-workflows/[id]`         | POST   | Execute specific workflow  |

## Troubleshooting

### No Data Available

```typescript
// Solution: Generate data first
await fetch("/api/test-data/generate-complete", {
  method: "POST",
  body: JSON.stringify(config),
});
```

### Workflow Fails

1. Check if test data exists
2. Verify context has required data
3. Check logs for specific errors
4. Ensure all services are working

### Cleanup Issues

- Run cleanup multiple times if large dataset
- Check Firebase batch limits (500 docs)
- Verify PREFIX matches generated data

## Performance Tips

1. **Batch Operations**: Generate data in batches
2. **Context Caching**: Load context once for multiple workflows
3. **Parallel Workflows**: Run independent workflows in parallel
4. **Cleanup Strategy**: Cleanup after batch execution, not after each workflow

## Future Enhancements

- [ ] Real-time workflow progress
- [ ] Workflow scheduling
- [ ] Context caching with Redis
- [ ] Parallel workflow execution
- [ ] Export test reports
- [ ] Integration with CI/CD

## Support

For issues or questions:

1. Check the activity logs in the UI
2. Review API responses
3. Check Firebase console for data
4. Review this documentation
