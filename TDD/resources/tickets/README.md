# Tickets Resource

## Overview

Support ticket management.

## Related Epic

- [E010: Support Tickets](../../epics/E010-support-tickets.md)

## Database Collection

- `support_tickets` - Ticket documents
- `ticket_messages` - Message thread

## API Routes

```
/api/tickets           - GET/POST  - List/Create
/api/tickets/:id       - GET/PATCH - Get/Update
/api/tickets/:id/reply - POST      - Reply
/api/tickets/bulk      - POST      - Bulk operations
```

## Types

- `SupportTicketBE` - Backend ticket type
- `SupportTicketMessageBE` - Message type

## Service

- `supportService` - Ticket operations

## Components

- `src/app/user/tickets/` - User tickets
- `src/app/seller/support-tickets/` - Seller tickets
- `src/app/admin/tickets/` - Admin tickets

## Status: 📋 Documentation Pending

- [ ] Detailed user stories
- [ ] API specifications
- [ ] Test cases
