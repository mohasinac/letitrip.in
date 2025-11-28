# Payouts Resource

## Overview

Seller payout management.

## Related Epic

- [E018: Payout System](../../epics/E018-payout-system.md)

## Database Collection

- `payouts` - Payout documents

## API Routes

```
/api/payouts           - GET/POST  - List/Request
/api/payouts/:id       - GET/PATCH - Get/Update
/api/payouts/bulk      - POST      - Bulk process
/api/payouts/pending   - GET       - Pending balance
```

## Components

- `src/app/seller/revenue/` - Seller revenue
- `src/app/admin/payouts/` - Admin payout processing

## Status: 📋 Documentation Pending

- [ ] Detailed user stories
- [ ] API specifications
- [ ] Test cases
