# Favorites Resource

## Overview

User favorites and watchlist.

## Database Collections

- `favorites` - Favorites
- `auction_watchlist` - Auction watchlist

## API Routes

```
/api/favorites         - GET       - List favorites
/api/favorites         - POST      - Add favorite
/api/favorites/:type/:id - DELETE  - Remove favorite
/api/favorites/list    - GET       - Favorites list
```

## Components

- `src/app/user/favorites/` - User favorites
- `src/app/user/watchlist/` - Auction watchlist

## Status: 📋 Documentation Pending

- [ ] Detailed user stories
- [ ] API specifications
- [ ] Test cases
