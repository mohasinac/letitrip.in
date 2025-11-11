# Test Workflows - Quick Start Guide

## 🚀 Getting Started (Post API-Fix)

The test workflows can now be executed in **3 different ways**:

---

## Method 1: Web UI Dashboard ✨ (NEW - NOW WORKING!)

### Access

```
http://localhost:3000/test-workflows
```

### Features

- ✅ Visual workflow cards with icons
- ✅ Real-time progress tracking
- ✅ Live configuration editing
- ✅ Results modal with JSON output
- ✅ Status indicators (⏳✅❌⚠️)
- ✅ Run individual or multiple workflows

### Usage

1. Start dev server: `npm run dev`
2. Open browser: `http://localhost:3000/test-workflows`
3. (Optional) Edit configuration values
4. Click "Run Workflow" on desired workflow card
5. Watch real-time progress
6. View detailed results in modal

### Configuration Options

```typescript
USERS:
  - CUSTOMER_ID: "test-customer-001"
  - SELLER_ID: "test-seller-001"
  - ADMIN_ID: "test-admin-001"
  - BIDDER_ID: "test-bidder-001"

SHOPS:
  - TEST_SHOP_ID: "test-shop-001"
  - FEATURED_SHOP_ID: "test-shop-002"

WORKFLOW_OPTIONS:
  - PAUSE_BETWEEN_STEPS: 500ms (default)
  - LOG_VERBOSE: true (default)
  - CONTINUE_ON_ERROR: false (default)
```

---

## Method 2: API Endpoint 🔌 (FIXED!)

### Endpoint

```
POST http://localhost:3000/api/test-workflows/[workflow]
```

### Available Workflows

- `product-purchase`
- `auction-bidding`
- `order-fulfillment`
- `support-tickets`
- `reviews-ratings`
- `advanced-browsing`
- `advanced-auction`

### Example Request (PowerShell)

```powershell
$body = @{
    config = @{
        USERS = @{
            CUSTOMER_ID = "test-customer-001"
        }
        WORKFLOW_OPTIONS = @{
            PAUSE_BETWEEN_STEPS = 1000
            CONTINUE_ON_ERROR = $true
        }
    }
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Uri "http://localhost:3000/api/test-workflows/product-purchase" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

### Example Request (curl)

```bash
curl -X POST http://localhost:3000/api/test-workflows/product-purchase \
  -H "Content-Type: application/json" \
  -d '{
    "config": {
      "USERS": {
        "CUSTOMER_ID": "test-customer-001"
      }
    }
  }'
```

### Response Format

```typescript
{
  finalStatus: "success" | "partial" | "failed",
  passed: number,
  failed: number,
  results: TestResult[],
  summary: {
    totalSteps: number,
    executedSteps: number,
    successfulSteps: number,
    duration: number
  }
}
```

---

## Method 3: Command Line 💻 (Classic)

### Individual Workflows

```powershell
# Product Purchase Flow (11 steps)
npm run test:workflow:product-purchase

# Auction Bidding Flow (12 steps)
npm run test:workflow:auction-bidding

# Order Fulfillment Flow (15 steps)
npm run test:workflow:order-fulfillment

# Support Ticket Flow (10 steps)
npm run test:workflow:support-tickets

# Reviews & Ratings Flow (10 steps)
npm run test:workflow:reviews-ratings

# Advanced Browsing Flow (15 steps)
npm run test:workflow:browsing

# Advanced Auction Flow (14 steps)
npm run test:workflow:advanced-auction
```

### All Workflows Sequentially

```powershell
npm run test:workflows
```

### Direct Execution

```powershell
# Using ts-node
ts-node src/lib/test-workflows/workflows/01-product-purchase.ts

# Or from tests directory (backward compatible)
ts-node tests/workflows/01-product-purchase.ts
```

---

## 📋 Workflow Reference

### 1. Product Purchase Flow (11 steps)

**Journey**: Browse → Add to Cart → Apply Coupon → Checkout → Payment → Order Tracking

```
✅ Browse products
✅ View product details
✅ Add to cart
✅ Browse available coupons
✅ Apply coupon code
✅ Proceed to checkout
✅ Complete payment
✅ Order confirmation
✅ Track order
✅ View order details
✅ Summary report
```

### 2. Auction Bidding Flow (12 steps)

**Journey**: Browse Auctions → Place Bid → Win → Payment → Review

```
✅ Browse active auctions
✅ View auction details
✅ Check seller's other auctions
✅ Place bid
✅ Verify bid placement
✅ Monitor auction status
✅ Win auction
✅ Complete payment
✅ Receive invoice
✅ Request delivery
✅ Rate seller
✅ Summary report
```

### 3. Order Fulfillment Flow (15 steps)

**Journey**: Create Order → Process → Ship → Deliver → Support

```
✅ Browse products
✅ Add to cart
✅ Checkout
✅ Create order
✅ Seller accepts
✅ Create shipment
✅ Update tracking
✅ Mark shipped
✅ Track delivery
✅ Confirm delivery
✅ Request invoice
✅ Support inquiry
✅ Rate experience
✅ Request return
✅ Summary report
```

### 4. Support Ticket Flow (10 steps)

**Journey**: Create Ticket → Communicate → Resolve → Follow-up

```
✅ Browse orders
✅ Create support ticket
✅ View ticket details
✅ Admin responds
✅ Customer replies
✅ Admin escalates
✅ Resolution provided
✅ Customer confirms
✅ Close ticket
✅ Summary report
```

### 5. Reviews & Ratings Flow (10 steps)

**Journey**: Browse → Purchase → Review → Moderate → Respond

```
✅ Browse products
✅ View product with reviews
✅ Customer writes review
✅ Customer rates seller
✅ Admin reviews submissions
✅ Admin moderates review
✅ Seller responds
✅ Mark review helpful
✅ View review summary
✅ Summary report
```

### 6. Advanced Browsing Flow (15 steps)

**Journey**: Product Discovery → Variants → Categories → Shop → Cart

```
✅ Browse products with pagination
✅ View product variants
✅ Browse similar products
✅ View seller's shop
✅ View seller's products
✅ Browse all shops
✅ Browse by category
✅ Navigate breadcrumbs
✅ Apply filters
✅ Sort results
✅ Search products
✅ Select from category
✅ Add to cart
✅ View cart
✅ Browse featured
```

### 7. Advanced Auction Flow (14 steps)

**Journey**: Browse → Bid → Auto-Bid → Win → Payment

```
✅ Browse live auctions
✅ Browse ending soon
✅ Browse featured
✅ View auction details
✅ View seller's auctions
✅ Review bidding rules
✅ Place manual bid
✅ Verify bid success
✅ View bid history
✅ Set auto-bid
✅ Monitor auction
✅ Win auction
✅ Complete payment
✅ Receive invoice
```

---

## 🔧 Configuration Tips

### Using Constants (Recommended)

```typescript
// Update test-config.ts
export const TEST_CONFIG = {
  USERS: {
    CUSTOMER_ID: "your-real-customer-id",
    SELLER_ID: "your-real-seller-id",
    // ...
  },
};
```

### Runtime Updates (UI Only)

1. Open test workflows UI
2. Edit configuration fields
3. Run workflow
4. Configuration applies to that execution

### Environment Variables (Future)

```bash
# .env.local
TEST_CUSTOMER_ID=customer-123
TEST_SELLER_ID=seller-456
```

---

## 📊 Interpreting Results

### Success Status

```
✅ success  - All steps passed
⚠️  partial - Some steps failed but workflow continued
❌ failed   - Critical failure, workflow stopped
⭕ idle     - Not started
⏳ running  - Currently executing
```

### Result Structure

```typescript
interface TestResult {
  step: string; // Step name
  status: "success" | "failed" | "skipped";
  message: string; // Outcome description
  duration: number; // Execution time (ms)
  data?: any; // Step-specific data
}
```

### Common Issues

**"User not found"**

- Update `CUSTOMER_ID` in configuration
- Ensure user exists in database

**"Shop not found"**

- Update `TEST_SHOP_ID` in configuration
- Create test shop if needed

**"Product not found"**

- Run product-purchase workflow first
- Or create products manually

**"Insufficient stock"**

- Check product inventory
- Increase stock levels

**"Payment failed"**

- Verify payment service is running
- Check test payment credentials

---

## 🎯 Best Practices

### 1. Run in Order

For first-time setup, run workflows in sequence:

1. Product Purchase (creates orders)
2. Order Fulfillment (processes orders)
3. Support Tickets (uses existing orders)
4. Reviews & Ratings (requires completed orders)
5. Auction Bidding (independent)
6. Advanced Browsing (uses existing data)
7. Advanced Auction (independent)

### 2. Check Configuration

Before running:

- ✅ Verify user IDs exist
- ✅ Verify shop IDs exist
- ✅ Check database connection
- ✅ Ensure services are running

### 3. Monitor Execution

During run:

- 📊 Watch real-time progress (UI)
- 📝 Check console logs (CLI)
- 🔍 Review step results
- ⚠️ Note any warnings

### 4. Review Results

After completion:

- ✅ Check pass/fail counts
- 📈 Analyze execution time
- 🐛 Debug failed steps
- 📝 Document issues

---

## 🚨 Troubleshooting

### API Route Not Working

```powershell
# Check server is running
curl http://localhost:3000/api/health

# Verify route exists
curl http://localhost:3000/api/test-workflows/product-purchase
```

### UI Not Loading

1. Clear browser cache
2. Check browser console for errors
3. Verify dev server is running
4. Try incognito mode

### Workflow Hangs

1. Check `PAUSE_BETWEEN_STEPS` is not too high
2. Verify database connection
3. Check external service availability
4. Review console for errors

### Import Errors (Should be fixed!)

If you see import errors:

1. Verify workflows are in `src/lib/test-workflows/`
2. Check API route uses `@/lib/test-workflows`
3. Clear `.next/` cache
4. Restart dev server

---

## 📚 Additional Resources

### Documentation

- `tests/README.md` - Full test documentation
- `CHECKLIST/SESSION-ADVANCED-WORKFLOWS-COMPLETE.md` - Detailed implementation
- `CHECKLIST/SESSION-API-ROUTE-FIX.md` - API fix documentation

### Code Locations

- **Workflows**: `src/lib/test-workflows/workflows/`
- **Configuration**: `src/lib/test-workflows/test-config.ts`
- **API Route**: `src/app/api/test-workflows/[workflow]/route.ts`
- **UI Dashboard**: `src/app/test-workflows/page.tsx`
- **Legacy (CLI)**: `tests/workflows/` (for backward compatibility)

### NPM Scripts

```json
"test:workflows": "Run all workflows",
"test:workflow:product-purchase": "Single workflow",
"test:workflow:auction-bidding": "Single workflow",
"test:workflow:order-fulfillment": "Single workflow",
"test:workflow:support-tickets": "Single workflow",
"test:workflow:reviews-ratings": "Single workflow",
"test:workflow:browsing": "Single workflow",
"test:workflow:advanced-auction": "Single workflow"
```

---

## ✨ What's New (Post-Fix)

### ✅ Fixed Issues

- Import errors resolved (moved to src/lib/)
- API route now functional
- UI can execute workflows
- Routing conflicts fixed

### ✅ New Features

- Dual execution paths (CLI + API)
- Barrel exports for clean imports
- Enhanced error handling
- Real-time progress updates

### ✅ Improvements

- Better code organization
- Cleaner import statements
- Production-ready architecture
- Comprehensive documentation

---

**Last Updated**: November 11, 2025  
**Status**: ✅ Fully Operational  
**Version**: 2.0 (Post API-Fix)
