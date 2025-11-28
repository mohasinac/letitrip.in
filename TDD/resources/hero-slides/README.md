# Hero Slides Resource

## Overview

Homepage hero slide management.

## Related Epic

- [E014: Homepage CMS](../../epics/E014-homepage-cms.md)

## Database Collection

- `hero_slides` - Slide documents

## API Routes

```
/api/hero-slides       - GET/POST  - List/Create
/api/hero-slides/:id   - GET/PATCH - Get/Update
/api/hero-slides/:id   - DELETE    - Delete
/api/hero-slides/bulk  - POST      - Bulk operations
```

## Service

- `heroSlidesService` - Slide operations

## Components

- `src/app/admin/hero-slides/` - Admin slide management

## Status: 📋 Documentation Pending

- [ ] Detailed user stories
- [ ] API specifications
- [ ] Test cases
