# Order Cancellation Policy Implementation

## Overview

Time-based cancellation policy implemented for different user roles with appropriate UI indicators and API enforcement.

## Cancellation Rules

### 👥 Customers

- **Time Limit**: 1 day (24 hours) from payment date
- **Applies to**: Only paid orders
- **After Deadline**: Must contact support for assistance
- **Endpoint**: `POST /api/orders/[id]/cancel`

### 🏪 Sellers

- **Time Limit**: 3 days (72 hours) from payment date
- **Applies to**: Only paid orders
- **After Deadline**: Must contact admin for assistance
- **Endpoint**: `POST /api/seller/orders/[id]/cancel`

### 👑 Admins

- **Time Limit**: No restrictions
- **Can Cancel**: Any order at any time
- **Endpoint**: `POST /api/seller/orders/[id]/cancel` (with admin role)

## Implementation Details

### Backend API Routes

#### Customer Cancel API

**File**: `src/app/api/orders/[id]/cancel/route.ts`

**Features**:

- Verifies user owns the order
- Checks 1-day time limit from `paidAt` timestamp
- Updates order status to "cancelled"
- Adds `cancelledBy: "customer"` flag
- Creates notifications for both seller and customer
- Returns clear error message if window expired

**Error Messages**:

```
"Cancellation window expired. You can only cancel orders within 1 day of payment. Please contact support for assistance."
```

#### Seller Cancel API

**File**: `src/app/api/seller/orders/[id]/cancel/route.ts`

**Features**:

- Verifies seller owns the order (or admin role)
- Checks 3-day time limit for sellers only
- Admin bypass: No time limit for admin users
- Updates order status with appropriate `cancelledBy` flag
- Creates role-specific notifications
- Returns clear error message if window expired

**Error Messages**:

```
"Cancellation window expired. Sellers can only cancel orders within 3 days of payment. Please contact admin for assistance."
```

### Frontend UI Components

#### Customer Order Detail Page

**File**: `src/app/orders/[id]/page.tsx`

**Features**:

- Shows countdown timer: "Cancel within: X hours/minutes"
- Displays warning: "Cancellation window expired (1 day limit)"
- Disables cancel button after deadline
- Tooltip explains policy on hover
- Visual indicators (yellow for active, red for expired)

**UI States**:

- ✅ Within 24 hours: Yellow badge + enabled button
- ❌ After 24 hours: Red badge + disabled button
- 🔄 Unpaid orders: Always cancellable

#### Seller Order Detail Page

**File**: `src/app/seller/orders/[id]/page.tsx`

**Features**:

- Shows countdown timer: "Cancel within: X days/hours"
- Displays warning: "Cancellation window expired (3-day limit)"
- Disables cancel button after deadline for sellers
- Admin bypass: No restrictions shown for admin users
- Dialog shows role-specific cancellation policy
- Visual indicators (yellow for active, red for expired)

**UI States for Sellers**:

- ✅ Within 72 hours: Yellow badge + enabled button
- ❌ After 72 hours: Red badge + disabled button
- 🔄 Unpaid orders: Always cancellable

**UI States for Admins**:

- ✅ Always enabled with "Admin Privilege" badge
- 💡 Info message: "As an admin, you can cancel this order at any time"

### Time Calculation Logic

```typescript
// Customer: 1-day check
const daysSincePayment = timeDiff / (1000 * 60 * 60 * 24);
if (daysSincePayment > 1) {
  // Cannot cancel
}

// Seller: 3-day check
const daysSincePayment = timeDiff / (1000 * 60 * 60 * 24);
if (daysSincePayment > 3) {
  // Cannot cancel (unless admin)
}
```

### Countdown Display Logic

```typescript
// Customer countdown (hours-based)
const hoursRemaining = 24 - timeSincePayment / (1000 * 60 * 60);
// Shows: "23 hours" or "45 minutes"

// Seller countdown (days/hours-based)
const hoursRemaining = 72 - timeSincePayment / (1000 * 60 * 60);
// Shows: "2 days" or "15 hours"
```

## User Experience Flow

### Customer Cancellation Flow

1. Customer views order detail page
2. Sees countdown timer if within 24 hours
3. Clicks "Cancel Order" button
4. Confirms cancellation in dialog
5. API validates time limit
6. Order cancelled + notifications sent
7. **OR** sees disabled button with expired message after 24h

### Seller Cancellation Flow

1. Seller views order detail page
2. Sees countdown timer if within 72 hours
3. Clicks "Cancel Order" button
4. Dialog shows cancellation policy warning
5. Enters cancellation reason
6. API validates time limit and role
7. Order cancelled + notifications sent
8. **OR** sees disabled button with expired message after 72h

### Admin Cancellation Flow

1. Admin views order detail page
2. No time restrictions shown
3. Clicks "Cancel Order" button
4. Dialog shows "Admin Privilege" badge
5. Enters cancellation reason
6. Order cancelled immediately
7. Notifications sent to seller and customer

## Notification System

### When Order is Cancelled

**Seller Notification** (when customer cancels):

```
Title: "Order Cancelled by Customer"
Message: "Order #12345 has been cancelled by the customer"
Severity: warning
```

**Customer Notification** (when seller/admin cancels):

```
Title: "Order Cancelled"
Message: "Your order #12345 has been cancelled"
Severity: warning
```

**Seller Notification** (when admin cancels):

```
Title: "Order Cancelled by Admin"
Message: "Order #12345 has been cancelled by admin"
Severity: warning
```

## Database Updates

When order is cancelled, the following fields are updated:

```typescript
{
  status: "cancelled",
  cancelledAt: Timestamp,
  cancelledBy: "customer" | "seller" | "admin",
  cancellationReason: string,
  updatedAt: Timestamp
}
```

## Testing Checklist

### Customer Tests

- [ ] Cancel order within 1 day of payment ✅
- [ ] Try to cancel order after 1 day of payment ❌
- [ ] Cancel unpaid order ✅
- [ ] See countdown timer
- [ ] See expired message after deadline
- [ ] Receive cancellation confirmation

### Seller Tests

- [ ] Cancel order within 3 days of payment ✅
- [ ] Try to cancel order after 3 days of payment ❌
- [ ] Cancel unpaid order ✅
- [ ] See countdown timer
- [ ] See expired message after deadline
- [ ] See policy warning in dialog

### Admin Tests

- [ ] Cancel any order regardless of time ✅
- [ ] See "Admin Privilege" badge
- [ ] No time restrictions shown
- [ ] No countdown timer
- [ ] Can cancel expired orders

### Edge Cases

- [ ] Orders with no `paidAt` timestamp
- [ ] Orders already cancelled
- [ ] Orders already delivered
- [ ] Concurrent cancellation attempts
- [ ] Invalid order IDs
- [ ] Unauthorized access attempts

## Error Handling

### API Errors

- **401 Unauthorized**: Missing or invalid auth token
- **403 Access Denied**: User doesn't own the order
- **404 Not Found**: Order doesn't exist
- **400 Bad Request**:
  - Order already cancelled/delivered
  - Cancellation window expired
  - Invalid order status

### Frontend Error Display

- Toast notifications for API errors
- Inline validation messages
- Disabled buttons with tooltips
- Clear error messages in dialogs

## Future Enhancements

### Potential Improvements

1. **Email Notifications**: Send email when cancellation occurs
2. **Refund Automation**: Auto-initiate refund for paid orders
3. **Partial Cancellation**: Allow cancelling specific items
4. **Cancellation Fees**: Implement penalty for late cancellations
5. **Buyer Protection**: Extend window for specific cases
6. **Analytics Dashboard**: Track cancellation rates and reasons
7. **Custom Time Windows**: Allow sellers to set their own policies
8. **Grace Period**: Extra time for first-time customers

## Security Considerations

### Implemented Protections

- ✅ JWT token verification
- ✅ User ownership validation
- ✅ Role-based access control
- ✅ Server-side timestamp validation
- ✅ Immutable `cancelledAt` timestamps
- ✅ Audit trail with `cancelledBy` field

### Best Practices

- Always validate on server-side (never trust client)
- Use Firestore server timestamps
- Log all cancellation attempts
- Rate limit cancellation endpoints
- Validate cancellation reasons (prevent abuse)

## Related Documentation

- [API Routes Reference](./core/API_ROUTES_REFERENCE.md)
- [Order Status Flow](./core/README.md)
- [Notification System](./NOTIFICATIONS.md)
- [User Roles & Permissions](./ROLES_AND_PERMISSIONS.md)

## Last Updated

November 2, 2025

## Status

✅ **Fully Implemented** - All cancellation policies are live and functional
