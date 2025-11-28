# Users Resource

## Overview

User management including authentication, profiles, and admin controls.

## Related Epic

- [E001: User Management](../../epics/E001-user-management.md)

## Database Collection

- `users` - Main user collection
- `user_profiles` - Extended profiles

## API Routes

```
/api/auth/register     - POST   - Register user
/api/auth/login        - POST   - Login
/api/auth/logout       - POST   - Logout
/api/auth/me           - GET    - Current user
/api/auth/sessions     - GET    - Active sessions
/api/user/profile      - GET    - Own profile
/api/user/profile      - PATCH  - Update profile
/api/user/addresses    - CRUD   - Address management
/api/users             - GET    - List all (admin)
/api/users/:id         - GET    - User details (admin)
/api/users/:id         - PATCH  - Update user (admin)
/api/users/:id/ban     - POST   - Ban user (admin)
/api/users/:id/role    - POST   - Change role (admin)
/api/users/bulk        - POST   - Bulk ops (admin)
```

## Types

- `UserBE` - Backend user type
- `UserFE` - Frontend user type
- `UserListItemBE` - List item type

## Service

- `authService` - Authentication
- `userService` - User management

## Components

- `src/components/auth/` - Auth components
- `src/app/login/` - Login page
- `src/app/register/` - Register page
- `src/app/user/` - User pages
- `src/app/admin/users/` - Admin user management

## Status: 📋 Documentation Pending

- [ ] Detailed user stories
- [ ] API specifications
- [ ] Test cases
