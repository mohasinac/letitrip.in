# API Reference Guide

Complete API documentation for the JustForView e-commerce platform with enhanced payment, shipping, and coupon features.

## Base URL

- Development: `http://localhost:3000/api`
- Production: `https://justforview.in/api`

## Authentication

Most API endpoints require authentication. Include the Firebase ID token in the Authorization header:

```
Authorization: Bearer <firebase-id-token>
```

Admin endpoints require admin role verification.

## Response Format

All API responses follow this format:

```json
{
  "success": boolean,
  "data": any,
  "error": string | null,
  "message": string | null
}
```

## Error Codes

- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `405` - Method Not Allowed
- `429` - Too Many Requests
- `500` - Internal Server Error

---

## Coupon Management API

### List Coupons (Admin)

```http
GET /api/coupons
```

**Query Parameters:**

- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10)
- `status` (string, optional): Filter by status (active, inactive, expired)
- `type` (string, optional): Filter by type (percentage, fixed, free_shipping, bogo)

**Response:**

```json
{
  "success": true,
  "data": {
    "coupons": [
      {
        "id": "coupon-id",
        "code": "SAVE10",
        "name": "10% Off Sale",
        "description": "Get 10% off on all products",
        "type": "percentage",
        "value": 10,
        "minimumAmount": 100,
        "maximumAmount": 1000,
        "maxUses": 100,
        "maxUsesPerUser": 1,
        "usedCount": 25,
        "startDate": "2024-01-01T00:00:00Z",
        "endDate": "2024-12-31T23:59:59Z",
        "status": "active",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 50,
    "page": 1,
    "totalPages": 5
  }
}
```

### Create Coupon (Admin)

```http
POST /api/coupons
```

**Request Body:**

```json
{
  "code": "NEWCOUPON",
  "name": "New Customer Discount",
  "description": "Special discount for new customers",
  "type": "percentage",
  "value": 15,
  "minimumAmount": 50,
  "maximumAmount": 500,
  "maxUses": 50,
  "maxUsesPerUser": 1,
  "startDate": "2024-02-01T00:00:00Z",
  "endDate": "2024-03-01T23:59:59Z",
  "applicableProducts": [],
  "applicableCategories": ["electronics"],
  "restrictions": {
    "newCustomersOnly": true,
    "minQuantity": 1
  },
  "combinable": false,
  "priority": 1
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "new-coupon-id",
    "code": "NEWCOUPON"
    // ... other coupon fields
  },
  "message": "Coupon created successfully"
}
```

### Get Coupon Details

```http
GET /api/coupons/:id
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "coupon-id",
    "code": "SAVE10"
    // ... full coupon details
  }
}
```

### Update Coupon (Admin)

```http
PUT /api/coupons/:id
```

**Request Body:** Same as create coupon

### Delete Coupon (Admin)

```http
DELETE /api/coupons/:id
```

**Response:**

```json
{
  "success": true,
  "message": "Coupon deleted successfully"
}
```

### Validate Coupon

```http
POST /api/coupons/validate
```

**Request Body:**

```json
{
  "code": "SAVE10",
  "userId": "user-id",
  "cartItems": [
    {
      "id": "product-1",
      "quantity": 2,
      "price": 100,
      "categoryId": "electronics"
    }
  ],
  "subtotal": 200
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "valid": true,
    "coupon": {
      "id": "coupon-id",
      "code": "SAVE10",
      "type": "percentage",
      "value": 10
    },
    "discountAmount": 20,
    "finalAmount": 180,
    "message": "Coupon applied successfully"
  }
}
```

---

## Payment API (Razorpay)

### Create Payment Order

```http
POST /api/payment/razorpay/create-order
```

**Request Body:**

```json
{
  "amount": 1000,
  "currency": "INR",
  "orderId": "order-123",
  "customerInfo": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210"
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "orderId": "order_razorpay_123",
    "amount": 1000,
    "currency": "INR",
    "key": "rzp_test_xxxxxxxxxxxxx"
  }
}
```

### Verify Payment

```http
POST /api/payment/razorpay/verify
```

**Request Body:**

```json
{
  "razorpay_order_id": "order_razorpay_123",
  "razorpay_payment_id": "pay_razorpay_456",
  "razorpay_signature": "signature_string",
  "orderId": "order-123"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "verified": true,
    "paymentId": "pay_razorpay_456",
    "status": "captured"
  },
  "message": "Payment verified successfully"
}
```

### Payment Webhook

```http
POST /api/payment/razorpay/webhook
```

**Headers:**

- `x-razorpay-signature`: Webhook signature

**Request Body:** Razorpay webhook payload

### Capture Payment

```http
POST /api/payment/razorpay/capture
```

**Request Body:**

```json
{
  "paymentId": "pay_razorpay_456",
  "amount": 1000,
  "currency": "INR"
}
```

### Create Refund

```http
POST /api/payment/razorpay/refund
```

**Request Body:**

```json
{
  "paymentId": "pay_razorpay_456",
  "amount": 500,
  "reason": "Customer requested refund",
  "receipt": "refund_123"
}
```

---

## Shipping API (Shiprocket)

### Calculate Shipping Rates

```http
POST /api/shipping/shiprocket/rates
```

**Request Body:**

```json
{
  "pickupPostcode": "110001",
  "deliveryPostcode": "400001",
  "weight": 0.5,
  "length": 10,
  "breadth": 10,
  "height": 5,
  "cod": false
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "rates": [
      {
        "courierId": 1,
        "courierName": "Blue Dart",
        "rate": 150,
        "estimatedDays": "3-4",
        "cod": false
      },
      {
        "courierId": 2,
        "courierName": "DTDC",
        "rate": 120,
        "estimatedDays": "4-5",
        "cod": true
      }
    ]
  }
}
```

### Check Serviceability

```http
POST /api/shipping/shiprocket/serviceability
```

**Request Body:**

```json
{
  "pickupPostcode": "110001",
  "deliveryPostcode": "400001",
  "weight": 0.5,
  "cod": false
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "serviceable": true,
    "availableCouriers": [
      {
        "id": 1,
        "name": "Blue Dart",
        "codAvailable": false
      }
    ]
  }
}
```

### Create Shipping Order

```http
POST /api/shipping/shiprocket/create-order
```

**Request Body:**

```json
{
  "orderId": "order-123",
  "orderDate": "2024-01-15",
  "billingCustomerName": "John Doe",
  "billingPhone": "9876543210",
  "billingAddress": "123 Main St",
  "billingCity": "Delhi",
  "billingPostcode": "110001",
  "billingState": "Delhi",
  "billingCountry": "India",
  "shippingIsBilling": true,
  "orderItems": [
    {
      "name": "Product 1",
      "sku": "PROD-001",
      "units": 1,
      "sellingPrice": 100,
      "discount": 0
    }
  ],
  "paymentMethod": "Prepaid",
  "weight": 0.5,
  "length": 10,
  "breadth": 10,
  "height": 5
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "orderId": "shiprocket-order-456",
    "shipmentId": "shipment-789",
    "awbCode": "AWB123456789",
    "courierName": "Blue Dart",
    "status": "NEW"
  },
  "message": "Shipping order created successfully"
}
```

### Track Shipment

```http
GET /api/shipping/shiprocket/track/:awb
```

**Response:**

```json
{
  "success": true,
  "data": {
    "awbCode": "AWB123456789",
    "courierName": "Blue Dart",
    "currentStatus": "In Transit",
    "deliveredDate": null,
    "tracking": [
      {
        "date": "2024-01-15T10:00:00Z",
        "status": "Picked up",
        "location": "Delhi"
      },
      {
        "date": "2024-01-16T08:00:00Z",
        "status": "In Transit",
        "location": "Mumbai"
      }
    ]
  }
}
```

---

## Cart API

### Get Cart

```http
GET /api/cart
```

**Response:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "item-1",
        "productId": "product-123",
        "name": "Product Name",
        "price": 100,
        "quantity": 2,
        "image": "image-url",
        "category": "electronics"
      }
    ],
    "subtotal": 200,
    "tax": 36,
    "total": 236,
    "itemCount": 2
  }
}
```

### Add to Cart

```http
POST /api/cart/add
```

**Request Body:**

```json
{
  "productId": "product-123",
  "quantity": 1,
  "selectedAttributes": {
    "size": "M",
    "color": "Red"
  }
}
```

### Update Cart Item

```http
PUT /api/cart/update
```

**Request Body:**

```json
{
  "itemId": "item-1",
  "quantity": 3
}
```

### Remove from Cart

```http
DELETE /api/cart/remove/:itemId
```

### Clear Cart

```http
DELETE /api/cart/clear
```

---

## Order API

### Create Order

```http
POST /api/orders
```

**Request Body:**

```json
{
  "items": [
    {
      "productId": "product-123",
      "quantity": 2,
      "price": 100
    }
  ],
  "shippingAddress": {
    "name": "John Doe",
    "phone": "9876543210",
    "address": "123 Main St",
    "city": "Delhi",
    "state": "Delhi",
    "postcode": "110001",
    "country": "India"
  },
  "billingAddress": {
    // Same as shipping or different
  },
  "paymentMethod": "razorpay",
  "couponCode": "SAVE10",
  "shippingMethod": "standard"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "orderId": "order-123",
    "status": "pending",
    "total": 236,
    "paymentRequired": true,
    "razorpayOrderId": "order_razorpay_456"
  },
  "message": "Order created successfully"
}
```

### Get Orders

```http
GET /api/orders
```

**Query Parameters:**

- `page` (number): Page number
- `limit` (number): Items per page
- `status` (string): Filter by status

### Get Order Details

```http
GET /api/orders/:id
```

### Update Order Status (Admin)

```http
PUT /api/orders/:id/status
```

**Request Body:**

```json
{
  "status": "processing",
  "note": "Order is being processed"
}
```

---

## Product API

### Search Products

```http
GET /api/search
```

**Query Parameters:**

- `q` (string): Search query
- `category` (string): Category filter
- `minPrice` (number): Minimum price
- `maxPrice` (number): Maximum price
- `sort` (string): Sort by (price_asc, price_desc, name, rating)
- `page` (number): Page number
- `limit` (number): Items per page

### Get Product Details

```http
GET /api/products/:id
```

### Get Products by Category

```http
GET /api/products/category/:categoryId
```

---

## User API

### Get User Profile

```http
GET /api/user/profile
```

### Update User Profile

```http
PUT /api/user/profile
```

### Get User Addresses

```http
GET /api/user/addresses
```

### Add User Address

```http
POST /api/user/addresses
```

### Update User Address

```http
PUT /api/user/addresses/:id
```

### Delete User Address

```http
DELETE /api/user/addresses/:id
```

---

## Admin API

### Dashboard Stats

```http
GET /api/admin/dashboard
```

### Manage Users

```http
GET /api/admin/users
PUT /api/admin/users/:id/role
DELETE /api/admin/users/:id
```

### Manage Products

```http
GET /api/admin/products
POST /api/admin/products
PUT /api/admin/products/:id
DELETE /api/admin/products/:id
```

### Manage Categories

```http
GET /api/admin/categories
POST /api/admin/categories
PUT /api/admin/categories/:id
DELETE /api/admin/categories/:id
```

---

## Rate Limiting

API endpoints are rate limited:

- General endpoints: 100 requests per minute
- Authentication endpoints: 10 requests per minute
- Payment endpoints: 20 requests per minute
- Admin endpoints: 200 requests per minute

Rate limit headers are included in responses:

- `X-RateLimit-Limit`: Request limit per window
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Window reset time

---

## Webhook Events

### Payment Webhooks (Razorpay)

- `payment.authorized`: Payment authorized
- `payment.captured`: Payment captured
- `payment.failed`: Payment failed
- `order.paid`: Order fully paid
- `refund.created`: Refund initiated
- `refund.processed`: Refund completed

### Shipping Webhooks (Shiprocket)

- `order.pickup`: Order picked up
- `order.intransit`: Order in transit
- `order.delivered`: Order delivered
- `order.returned`: Order returned
- `order.cancelled`: Order cancelled

---

## SDK Usage Examples

### JavaScript/TypeScript

```javascript
// Create payment order
const response = await fetch("/api/payment/razorpay/create-order", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    amount: 1000,
    currency: "INR",
    orderId: "order-123",
  }),
});

const data = await response.json();
```

### cURL

```bash
# Validate coupon
curl -X POST https://justforview.in/api/coupons/validate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{
    "code": "SAVE10",
    "userId": "user-123",
    "subtotal": 200
  }'
```

This completes the comprehensive API reference for the enhanced JustForView e-commerce platform.
