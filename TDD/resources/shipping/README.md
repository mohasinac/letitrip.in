# Shipping Resource

> **Last Updated**: December 7, 2025  
> **Status**: ✅ Fully Implemented (Phase 1 & 2)  
> **Related Epic**: E011 - Payment & Shipping System

---

## Overview

Automated shipping integration with Shiprocket for Indian logistics. Features include AWB generation, courier selection, pickup scheduling, and real-time tracking.

## Database Collections

- `shipments` - Shipment records
- `shipping_rates` - Calculated shipping rates cache
- `pickup_schedules` - Scheduled pickups

## Service Layer

**Location**: `src/services/shipping.service.ts`, `src/services/shiprocket.service.ts`

### Shipping Service Methods

```typescript
class ShippingService {
  // Rate Calculation
  async calculateShippingRates(
    params: ShippingRateParams
  ): Promise<ShippingRate[]>;
  async getAvailableCouriers(orderId: string): Promise<Courier[]>;

  // Shipment Management
  async createShipment(orderId: string): Promise<Shipment>;
  async trackShipment(awbCode: string): Promise<TrackingInfo>;
  async cancelShipment(shipmentId: string): Promise<void>;

  // Labels & Manifests
  async generateShippingLabel(shipmentId: string): Promise<string>;
  async downloadLabel(awbCode: string): Promise<Blob>;
}
```

### Shiprocket Service Methods

```typescript
class ShiprocketService {
  // AWB Management
  async generateAWB(orderId: string, courierId: number): Promise<AWBResponse>;
  async getAvailableCouriers(orderId: string): Promise<CourierOption[]>;

  // Pickup Scheduling
  async schedulePickup(
    shipmentId: string,
    pickupDate: string
  ): Promise<PickupResponse>;
  async cancelPickup(shipmentId: string): Promise<void>;

  // Tracking
  async trackShipment(awbCode: string): Promise<ShiprocketTrackingInfo>;
  async getTrackingURL(awbCode: string): Promise<string>;

  // Rate Calculation
  async calculateRates(params: RateCalculationParams): Promise<CourierRate[]>;
}
```

## API Routes

### Public Routes

```
GET  /api/shipping/calculate-rates      - Calculate shipping rates
POST /api/orders/:id/track              - Track shipment
```

### Seller Routes

```
GET  /api/shipping/shiprocket/calculate-rates - Get courier options
POST /api/shipping/shiprocket/create-order    - Create Shiprocket order
POST /api/shipping/shiprocket/generate-awb    - Generate AWB
POST /api/shipping/shiprocket/schedule-pickup - Schedule pickup
GET  /api/shipping/shiprocket/track           - Track shipment
GET  /api/shipping/shiprocket/print-label     - Download label
```

### Admin Routes

```
GET  /api/admin/settings/shipping             - Shipping settings
PUT  /api/admin/settings/shipping             - Update settings
POST /api/admin/settings/shipping/test-shiprocket - Test connection
GET  /api/admin/shipments                     - All shipments
POST /api/admin/shipments/:id/cancel          - Cancel shipment
```

### Firebase Functions (Automation)

```
generateLabelOnConfirmation  - Auto-generate labels
autoSchedulePickups          - Daily pickup scheduling (10 AM IST)
shiprocketWebhook            - Tracking updates
```

## Features Implemented

### Phase 1 (Backend)

- ✅ Shiprocket API integration
- ✅ Auto-generate shipping labels on order confirmation
- ✅ Daily pickup scheduling (Firebase Scheduler)
- ✅ Webhook handler for tracking updates
- ✅ Rate calculation engine

### Phase 2 (Integration)

- ✅ Seller order detail page with shipping controls
- ✅ Courier selection dropdown
- ✅ Generate AWB button with loading state
- ✅ Schedule pickup button
- ✅ Print label button
- ✅ Real-time tracking display
- ✅ Admin shipping settings page
- ✅ Test Shiprocket connection
- ✅ Free shipping threshold configuration

## Shiprocket Integration

### Configuration

**Admin Settings**: `/admin/settings`

- Shiprocket Email
- Shiprocket Password
- Enable/Disable toggle
- Free shipping threshold
- Shipping zones

### Automated Workflows

1. **Order Confirmed** → Auto-create Shiprocket order
2. **Label Generation** → Trigger on order status = 'processing'
3. **Daily Pickups** → Schedule at 10 AM IST for all pending shipments
4. **Tracking Updates** → Webhook updates order status

### Courier Selection

Available couriers based on:

- Pickup location (seller address)
- Delivery location (buyer address)
- Package dimensions and weight
- Delivery speed requirements
- Cost optimization

## Seller Workflow

### Order Detail Page

**Location**: `/seller/orders/[id]`

1. View order details
2. Click "Load Courier Options"
3. Select preferred courier from dropdown
4. Click "Generate AWB" → AWB code displayed
5. Click "Schedule Pickup" → Pickup scheduled
6. Click "Print Label" → Download PDF label
7. View tracking info in real-time

### Shipping Controls

- ✅ Load Courier Options button
- ✅ Courier dropdown with service details
- ✅ Generate AWB button (disabled until courier selected)
- ✅ Schedule Pickup button (enabled after AWB)
- ✅ Print Label button (enabled after AWB)
- ✅ Track Shipment section
- ✅ Error handling with user-friendly messages

## Admin Features

### Shipping Settings

- ✅ Shiprocket credentials (email/password)
- ✅ Connection testing
- ✅ Free shipping threshold (₹)
- ✅ Shipping zones configuration
- ✅ Default courier preferences

### Shipment Management

- ✅ View all shipments
- ✅ Filter by status (pending/scheduled/picked/delivered)
- ✅ Cancel shipments
- ✅ View shipping analytics

## Tracking Statuses

| Status           | Description                    |
| ---------------- | ------------------------------ |
| Pending          | Order confirmed, label pending |
| Label Generated  | AWB created, awaiting pickup   |
| Pickup Scheduled | Pickup scheduled with courier  |
| Picked           | Package picked up              |
| In Transit       | In delivery                    |
| Out for Delivery | Last mile delivery             |
| Delivered        | Successfully delivered         |
| RTO              | Return to origin               |
| Cancelled        | Shipment cancelled             |

## RBAC Permissions

| Action             | Admin | Seller | User | Guest |
| ------------------ | ----- | ------ | ---- | ----- |
| View Own Shipments | ✅    | ✅     | ✅   | ❌    |
| View All Shipments | ✅    | ❌     | ❌   | ❌    |
| Generate AWB       | ✅    | ✅     | ❌   | ❌    |
| Schedule Pickup    | ✅    | ✅     | ❌   | ❌    |
| Cancel Shipment    | ✅    | ❌     | ❌   | ❌    |
| Configure Settings | ✅    | ❌     | ❌   | ❌    |
| Track Shipment     | ✅    | ✅     | ✅   | ❌    |

## Error Handling

Common errors handled:

- Invalid credentials
- Insufficient balance
- Courier not available
- Invalid pickup date
- AWB generation failure
- Pickup scheduling failure
- Tracking not found

## Related Documentation

- [Phase 2 Summary](../../PHASE-2-INTEGRATION-SUMMARY-DEC-7-2025.md) - Integration details
- [RBAC](../../rbac/RBAC-CONSOLIDATED.md) - Role permissions
- [Seller Order Detail](../../PHASE-2-INTEGRATION-SUMMARY-DEC-7-2025.md#23-shipping-integration-) - Implementation details
