# Epic E015: Search & Discovery

## Overview

Search functionality for products, auctions, and shops with filters and suggestions.

## Scope

- Product search
- Auction search
- Shop search
- Global search
- Search filters
- Search suggestions

## User Roles Involved

- **Admin**: Full search access
- **Seller**: Search (same as users)
- **User**: Full search access
- **Guest**: Full search access

---

## Features

### F015.1: Product Search

**US015.1.1**: Search Products

```
Search by:
- Name
- Description
- Category
- Brand
- Tags

Filters:
- Category
- Price range
- Condition
- Rating
- In stock
```

### F015.2: Auction Search

**US015.2.1**: Search Auctions

```
Filters:
- Auction type
- Price range
- Ending soon
- Has bids
- Has buy now
```

### F015.3: Shop Search

**US015.3.1**: Search Shops

```
Search by:
- Shop name
- Location
```

### F015.4: Global Search

**US015.4.1**: Search All

```
Combined results from products, auctions, shops
```

### F015.5: Search Suggestions

**US015.5.1**: Autocomplete Suggestions

---

## API Endpoints

| Endpoint               | Method | Auth   | Description    |
| ---------------------- | ------ | ------ | -------------- |
| `/api/search`          | GET    | Public | Global search  |
| `/api/search/products` | GET    | Public | Product search |
| `/api/search/auctions` | GET    | Public | Auction search |
| `/api/search/shops`    | GET    | Public | Shop search    |

## Related Epics

- E002: Product Catalog
- E003: Auction System
- E006: Shop Management

---

## Test Documentation

- **API Specs**: `/TDD/resources/search/API-SPECS.md`
- **Test Cases**: `/TDD/resources/search/TEST-CASES.md`

### Test Coverage

- Unit tests for search relevance scoring
- Integration tests for all endpoints
- E2E tests for product and auction discovery flows
- Performance tests for search latency
