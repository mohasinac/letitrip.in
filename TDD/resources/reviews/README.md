# Reviews Resource

## Overview

Product and shop reviews with moderation.

## Related Epic

- [E007: Review System](../../epics/E007-review-system.md)

## Database Collection

- `reviews` - Review documents
- `review_votes` - Helpful votes

## API Routes

```
/api/reviews           - GET/POST  - List/Create
/api/reviews/:id       - GET/PATCH - Get/Update
/api/reviews/:id       - DELETE    - Delete
/api/reviews/:id/helpful - POST    - Vote helpful
/api/reviews/summary   - GET       - Rating summary
/api/reviews/bulk      - POST      - Bulk operations
```

## Types

- `ReviewBE` - Backend review type
- `ReviewListItemBE` - List item type

## Service

- `reviewService` - Review operations

## Components

- `src/app/reviews/` - Review pages
- `src/app/admin/reviews/` - Admin review moderation

## Status: 📋 Documentation Pending

- [ ] Detailed user stories
- [ ] API specifications
- [ ] Test cases
