# Search Resource

## Overview

Search functionality for products, auctions, and shops with filtering, sorting, and relevance ranking.

## Related Epic

- E015: Search & Discovery

## API Endpoints

| Endpoint               | Method | Auth   | Description                   |
| ---------------------- | ------ | ------ | ----------------------------- |
| `/api/search`          | GET    | Public | Global search (type-agnostic) |
| `/api/search/products` | GET    | Public | Product search                |
| `/api/search/auctions` | GET    | Public | Auction search                |
| `/api/search/shops`    | GET    | Public | Shop search                   |

## Features

- Full-text search with relevance scoring
- Category filtering
- Price range filtering
- Stock status filtering
- Multiple sort options
- Pagination support
- Shop-scoped search

## Files

- `API-SPECS.md` - Detailed endpoint documentation
- `TEST-CASES.md` - Unit and integration test cases
