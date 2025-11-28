# Search Resource - API Specifications

## Overview

Search APIs for discovering products, auctions, and shops across the platform.

---

## Endpoints

### GET /api/search

Global search endpoint supporting products and auctions.

**Query Parameters**:

| Param         | Type    | Default   | Description                               |
| ------------- | ------- | --------- | ----------------------------------------- |
| type          | string  | products  | Search type: `products` or `auctions`     |
| q             | string  | -         | Search query (searches name, description) |
| page          | number  | 1         | Page number                               |
| limit         | number  | 20        | Items per page (max 100)                  |
| shop_slug     | string  | -         | Filter by shop slug                       |
| category_slug | string  | -         | Filter by category slug                   |
| min_price     | number  | -         | Minimum price in paise                    |
| max_price     | number  | -         | Maximum price in paise                    |
| in_stock      | boolean | false     | Only show in-stock items (products only)  |
| sort          | string  | see below | Sort order (varies by type)               |

**Sort Options - Products**:

- `latest` (default) - Newest first
- `price-asc` - Price low to high
- `price-desc` - Price high to low
- `relevance` - Relevance score (when query provided)

**Sort Options - Auctions**:

- `endingSoon` (default) - Ending soonest first
- `price-asc` - Current bid low to high
- `price-desc` - Current bid high to low
- `relevance` - Relevance score (when query provided)

**Response (200)**:

```json
{
  "success": true,
  "type": "products",
  "data": [
    {
      "id": "prod_001",
      "name": "iPhone 15 Pro",
      "slug": "iphone-15-pro",
      "description": "Latest iPhone with A17 Pro chip...",
      "price": 129900,
      "images": [
        {
          "url": "https://storage.example.com/products/iphone.jpg",
          "alt": "iPhone 15 Pro"
        }
      ],
      "category_id": "cat_mobiles",
      "shop_id": "shop_001",
      "stock": 50,
      "status": "published",
      "is_featured": true,
      "created_at": "2025-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "hasMore": true
  }
}
```

**Response - Auctions (200)**:

```json
{
  "success": true,
  "type": "auctions",
  "data": [
    {
      "id": "auc_001",
      "title": "Vintage Watch Collection",
      "slug": "vintage-watch-collection",
      "description": "Rare collection of vintage watches...",
      "starting_price": 50000,
      "current_bid": 75000,
      "reserve_price": 100000,
      "bid_count": 12,
      "images": [
        {
          "url": "https://storage.example.com/auctions/watch.jpg",
          "alt": "Vintage Watch"
        }
      ],
      "category_id": "cat_watches",
      "shop_id": "shop_002",
      "start_time": "2025-01-10T00:00:00Z",
      "end_time": "2025-01-20T23:59:59Z",
      "status": "active",
      "created_at": "2025-01-09T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "hasMore": true
  }
}
```

**Error Responses**:

**404 - Shop Not Found**:

```json
{
  "success": false,
  "error": "Shop not found"
}
```

**404 - Category Not Found**:

```json
{
  "success": false,
  "error": "Category not found"
}
```

**429 - Rate Limited**:

```json
{
  "success": false,
  "error": "Too many requests. Please try again later."
}
```

**500 - Server Error**:

```json
{
  "success": false,
  "error": "Search failed"
}
```

---

### GET /api/search/products

Dedicated product search endpoint (redirects to `/api/search?type=products`).

**Query Parameters**: Same as `/api/search` excluding `type`.

---

### GET /api/search/auctions

Dedicated auction search endpoint (redirects to `/api/search?type=auctions`).

**Query Parameters**: Same as `/api/search` excluding `type`.

---

### GET /api/search/shops

Shop search endpoint.

**Query Parameters**:

| Param    | Type    | Default | Description                |
| -------- | ------- | ------- | -------------------------- |
| q        | string  | -       | Search query (name, city)  |
| page     | number  | 1       | Page number                |
| limit    | number  | 20      | Items per page (max 100)   |
| city     | string  | -       | Filter by city             |
| state    | string  | -       | Filter by state            |
| verified | boolean | -       | Only verified shops        |
| sort     | string  | latest  | Sort: latest, rating, name |

**Response (200)**:

```json
{
  "success": true,
  "data": [
    {
      "id": "shop_001",
      "name": "Tech Store",
      "slug": "tech-store",
      "description": "Premium electronics retailer",
      "logo": "https://storage.example.com/shops/logo.jpg",
      "banner": "https://storage.example.com/shops/banner.jpg",
      "rating": 4.8,
      "reviewCount": 156,
      "productCount": 234,
      "isVerified": true,
      "address": {
        "city": "Mumbai",
        "state": "Maharashtra"
      },
      "created_at": "2024-06-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "hasMore": true
  }
}
```

---

## Relevance Scoring

When `sort=relevance` and a query (`q`) is provided, results are ranked using:

| Match Type           | Score |
| -------------------- | ----- |
| Name starts with     | +50   |
| Name contains        | +30   |
| Tags contain         | +20   |
| Description contains | +10   |
| Is featured          | +5    |

Results with score 0 are filtered out. Ties are broken by creation date (newest first).

---

## Rate Limiting

- **Limit**: 100 requests per minute per IP
- **Headers**: `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- **Response**: 429 Too Many Requests when exceeded

---

## Implementation Notes

1. **Firestore Limitations**: Full-text search is performed client-side after initial filtering
2. **Price Fields**: Products use `price`, auctions use `current_bid` for price filters
3. **Status Filters**: Products require `is_deleted=false` and `status=published`; Auctions require `status in ['active', 'live']`
4. **Pagination**: Uses offset-based pagination for simplicity
5. **Slug Resolution**: Shop and category slugs are resolved before filtering
