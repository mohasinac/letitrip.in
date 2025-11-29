# Sieve Pagination API Specifications

## E026: Sieve-Style Pagination & Filtering

### Query Parameters

#### Pagination

| Parameter  | Type   | Default | Max | Description             |
| ---------- | ------ | ------- | --- | ----------------------- |
| `page`     | number | 1       | -   | Page number (1-indexed) |
| `pageSize` | number | 20      | 100 | Items per page          |

#### Sorting

| Parameter | Type   | Default      | Description                                       |
| --------- | ------ | ------------ | ------------------------------------------------- |
| `sorts`   | string | `-createdAt` | Comma-separated fields, `-` prefix for descending |

#### Filtering

| Parameter | Type   | Description             |
| --------- | ------ | ----------------------- |
| `filters` | string | Sieve filter expression |

### Filter Operators

| Operator | Description                 | Example             |
| -------- | --------------------------- | ------------------- |
| `==`     | Equals                      | `status==published` |
| `!=`     | Not equals                  | `status!=draft`     |
| `>`      | Greater than                | `price>100`         |
| `<`      | Less than                   | `price<500`         |
| `>=`     | Greater than or equal       | `price>=100`        |
| `<=`     | Less than or equal          | `price<=500`        |
| `@=`     | Contains                    | `title@=awesome`    |
| `_=`     | Starts with                 | `title_=New`        |
| `_-=`    | Ends with                   | `title_-=Sale`      |
| `@=*`    | Contains (case-insensitive) | `title@=*AWESOME`   |
| `==null` | Is null                     | `deletedAt==null`   |
| `!=null` | Is not null                 | `shopId!=null`      |

### Response Format

```typescript
interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  meta?: {
    appliedFilters: FilterCondition[];
    appliedSorts: SortField[];
  };
}
```

### Example Requests

#### Basic Pagination

```
GET /api/products?page=2&pageSize=10
```

#### Sorting

```
GET /api/products?sorts=price,-createdAt
```

#### Filtering

```
GET /api/products?filters=status==published,price>=100,price<=500
```

#### Combined

```
GET /api/products?page=1&pageSize=20&sorts=-price&filters=status==published,categoryId==cat_123
```

### Resource Configurations

#### Products

- Sortable: createdAt, price, name, stock, rating
- Filterable: status, price, categoryId, shopId, name, createdAt

#### Auctions

- Sortable: createdAt, currentBid, endTime, name
- Filterable: status, currentBid, categoryId, shopId, endTime

#### Users

- Sortable: createdAt, name, email
- Filterable: role, status, email, name, createdAt

#### Orders

- Sortable: createdAt, total, status
- Filterable: status, paymentStatus, shopId, userId, createdAt

#### Shops

- Sortable: createdAt, name, rating, productsCount
- Filterable: status, verified, name, createdAt
