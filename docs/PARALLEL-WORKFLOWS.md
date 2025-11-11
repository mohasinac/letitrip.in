# Parallel Workflow Executor

Execute multiple test workflows simultaneously with real-time progress tracking and aggregated statistics.

## Features

- ✅ **Parallel Execution**: Run multiple workflows at the same time
- ✅ **Individual Tracking**: Monitor progress for each workflow separately
- ✅ **Error Isolation**: One workflow failure doesn't stop others
- ✅ **Aggregate Stats**: Combined metrics across all workflows
- ✅ **Performance Metrics**: Identify fastest/slowest workflows
- ✅ **Export Support**: JSON and CSV export formats
- ✅ **Real-time Updates**: Status callback for UI updates

## Usage

### API Endpoint

**POST** `/api/test-workflows/parallel`

```json
{
  "workflowIds": ["product-purchase", "auction-bidding", "order-fulfillment"]
}
```

**Response:**

```json
{
  "totalWorkflows": 3,
  "completed": 2,
  "failed": 1,
  "totalDuration": 45000,
  "workflows": [
    {
      "workflowId": "product-purchase",
      "workflowName": "Product Purchase Flow",
      "status": "completed",
      "progress": 100,
      "duration": 15000,
      "result": {
        "totalSteps": 11,
        "passed": 11,
        "failed": 0
      }
    }
  ],
  "aggregateStats": {
    "totalSteps": 34,
    "passedSteps": 30,
    "failedSteps": 4,
    "successRate": 88.2,
    "averageDuration": 15000,
    "fastestWorkflow": "Product Purchase Flow",
    "slowestWorkflow": "Order Fulfillment Flow"
  }
}
```

### Programmatic Usage

```typescript
import { ParallelWorkflowExecutor } from "@/lib/test-workflows/parallel-executor";
import { ProductPurchaseWorkflow } from "@/lib/test-workflows/workflows/01-product-purchase";

const executor = new ParallelWorkflowExecutor();

// Add workflows
executor.addWorkflow("product-purchase", "Product Purchase", () => {
  return new ProductPurchaseWorkflow().run();
});

executor.addWorkflow("auction-bidding", "Auction Bidding", () => {
  return new AuctionBiddingWorkflow().run();
});

// Optional: Set status callback
executor.onStatusUpdate((statuses) => {
  console.log("Current status:", statuses);
});

// Execute all workflows
const result = await executor.executeAll();

// Export results
console.log("JSON:", executor.exportToJSON(result));
console.log("CSV:", executor.exportToCSV(result));
```

### Helper Functions

```typescript
import { executeWorkflowsInParallel } from "@/lib/test-workflows/parallel-executor";

// Simple parallel execution
const result = await executeWorkflowsInParallel([
  {
    id: "workflow-1",
    name: "Test 1",
    executor: async () => {
      /* ... */
    },
  },
  {
    id: "workflow-2",
    name: "Test 2",
    executor: async () => {
      /* ... */
    },
  },
]);
```

## Available Workflows

| ID                         | Name                         | Steps |
| -------------------------- | ---------------------------- | ----- |
| `product-purchase`         | Product Purchase Flow        | 11    |
| `auction-bidding`          | Auction Bidding Flow         | 12    |
| `order-fulfillment`        | Order Fulfillment Flow       | 11    |
| `support-tickets`          | Support Ticket Flow          | 12    |
| `reviews-ratings`          | Reviews & Ratings Flow       | 12    |
| `advanced-browsing`        | Advanced Browsing Flow       | 15    |
| `advanced-auction`         | Advanced Auction Flow        | 14    |
| `seller-product-creation`  | Seller Product Creation      | 10    |
| `admin-category-creation`  | Admin Category Creation      | 12    |
| `seller-inline-operations` | Seller Inline Operations     | 15    |
| `admin-inline-edits`       | Admin Inline Edits           | 14    |
| `user-profile`             | User Profile Management      | 12    |
| `wishlist-favorites`       | Wishlist & Favorites         | 10    |
| `bidding-history`          | Bidding History & Watchlist  | 12    |
| `seller-dashboard`         | Seller Dashboard & Analytics | 14    |
| `seller-returns`           | Seller Returns Management    | 11    |
| `seller-coupons`           | Seller Coupon Management     | 13    |
| `admin-blog`               | Admin Blog Management        | 14    |
| `admin-hero-slides`        | Admin Hero Slides Management | 12    |
| `admin-returns`            | Admin Returns & Refunds      | 13    |

## Testing

Run the test script:

```bash
node scripts/test-parallel-workflows.js
```

Or use curl:

```bash
# List available workflows
curl http://localhost:3000/api/test-workflows/parallel

# Execute 3 workflows in parallel
curl -X POST http://localhost:3000/api/test-workflows/parallel \
  -H "Content-Type: application/json" \
  -d '{"workflowIds": ["user-profile", "wishlist-favorites", "seller-coupons"]}'
```

## Performance

- **Concurrent Execution**: All workflows run simultaneously
- **Time Savings**: 3-5x faster than sequential execution
- **Resource Efficient**: Shared resources across workflows
- **Scalable**: Supports 1-20 workflows in parallel

## Error Handling

- Each workflow runs in isolation
- Failed workflows don't affect others
- Detailed error messages per workflow
- Aggregate success/failure statistics
- Timeout protection (if configured)

## Export Formats

### JSON Export

Full structured data with all details, results, and metrics.

### CSV Export

Tabular format with summary statistics:

- Workflow ID and Name
- Status and Duration
- Steps (Total, Passed, Failed)
- Success Rate
- Overall Summary

## Integration

### With Test Workflow UI

The parallel executor can be integrated into the test workflow dashboard for:

- Batch workflow execution
- Progress visualization
- Result comparison
- Performance tracking

### With CI/CD

Use in automated testing pipelines:

```yaml
# GitHub Actions example
- name: Run Test Workflows in Parallel
  run: |
    node scripts/test-parallel-workflows.js
```

## Best Practices

1. **Group Related Workflows**: Execute workflows that test similar features together
2. **Monitor Resource Usage**: Watch memory and CPU when running many workflows
3. **Use Status Callbacks**: Implement real-time UI updates for better UX
4. **Export Results**: Save execution results for historical comparison
5. **Handle Failures Gracefully**: Check individual workflow status, not just overall result

## Files

- `src/lib/test-workflows/parallel-executor.ts` - Core executor class (400+ lines)
- `src/app/api/test-workflows/parallel/route.ts` - API endpoint (117 lines)
- `scripts/test-parallel-workflows.js` - Test script

## Future Enhancements

- [ ] Workflow dependencies (run B after A completes)
- [ ] Priority queue (critical workflows first)
- [ ] Resource limiting (max concurrent workflows)
- [ ] Retry failed workflows automatically
- [ ] Workflow scheduling (cron-like execution)
- [ ] Database result persistence
- [ ] Real-time WebSocket updates
