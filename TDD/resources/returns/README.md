# Returns Resource

## Overview

Return request and refund processing.

## Related Epic

- [E009: Returns & Refunds](../../epics/E009-returns-refunds.md)

## Database Collection

- `returns` - Return documents
- `return_items` - Return items

## API Routes

```
/api/returns           - GET/POST  - List/Create
/api/returns/:id       - GET/PATCH - Get/Update
/api/returns/:id/approve - POST    - Approve
/api/returns/:id/reject - POST     - Reject
/api/returns/:id/media - POST      - Upload media
/api/returns/bulk      - POST      - Bulk operations
```

## Types

- `ReturnBE` - Backend return type

## Service

- `returnService` - Return operations

## Components

- `src/app/seller/returns/` - Seller return management
- `src/app/admin/returns/` - Admin return management

## Status: 📋 Documentation Pending

- [ ] Detailed user stories
- [ ] API specifications
- [ ] Test cases
