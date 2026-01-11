# API v1

Version 1.0.0 of the Letitrip API.

## Structure

```
api/v1/
├── middleware.ts         # Version middleware and utilities
├── products/            # Product endpoints (to be migrated)
├── cart/                # Cart endpoints (to be migrated)
├── orders/              # Order endpoints (to be migrated)
└── ...                  # Other endpoints (to be migrated)
```

## Versioning Strategy

### Version Headers

All v1 API responses include:

- `X-API-Version: 1.0.0` - Current API version
- `Deprecation: date="YYYY-MM-DD"` - When API will be deprecated (if applicable)
- `Sunset: YYYY-MM-DD` - When API will be removed (if applicable)
- `Link: </api/v2>; rel="successor-version"` - Link to next version (if deprecated)

### Request Version Negotiation

Clients can specify their preferred API version using the `Accept-Version` header:

```http
GET /api/v1/products
Accept-Version: v1
```

If no version is specified, the latest stable version is used.

### Migration Plan

1. **Phase 1**: Create v1 structure (✅ Done)

   - Create `api/v1/` directory
   - Add version middleware
   - Document versioning strategy

2. **Phase 2**: Migrate existing routes (In Progress)

   - Move routes to v1 namespace
   - Apply version middleware
   - Keep legacy routes for backward compatibility

3. **Phase 3**: Deprecation period

   - Set deprecation date
   - Add deprecation warnings
   - Communicate to API consumers

4. **Phase 4**: Sunset
   - Remove legacy routes
   - Only serve versioned endpoints

## Using Version Middleware

### Basic Usage

```typescript
import { withApiVersion } from "@/app/api/v1/middleware";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  return withApiVersion(async () => {
    const data = await fetchData();
    return NextResponse.json({ data });
  });
}
```

### With Custom Configuration

```typescript
import { withApiVersion } from "@/app/api/v1/middleware";

export async function GET(request: Request) {
  return withApiVersion(
    async () => {
      // Your logic
      return NextResponse.json({ data });
    },
    {
      version: "1.0.0",
      deprecationDate: "2026-06-01",
      sunsetDate: "2026-12-01",
    }
  );
}
```

### Version Validation

```typescript
import {
  validateApiVersion,
  versionedErrorResponse,
} from "@/app/api/v1/middleware";

export async function GET(request: Request) {
  if (!validateApiVersion(request, ["v1"])) {
    return versionedErrorResponse("Unsupported API version", 400);
  }

  // Continue with request
}
```

## Breaking Changes Policy

- **Patch versions** (1.0.x): Bug fixes, no breaking changes
- **Minor versions** (1.x.0): New features, backward compatible
- **Major versions** (x.0.0): Breaking changes, new version namespace

## Migration Status

| Route         | Status     | Notes                              |
| ------------- | ---------- | ---------------------------------- |
| /api/products | 📋 Planned | To be migrated to /api/v1/products |
| /api/cart     | 📋 Planned | To be migrated to /api/v1/cart     |
| /api/orders   | 📋 Planned | To be migrated to /api/v1/orders   |
| /api/auth     | 📋 Planned | To be migrated to /api/v1/auth     |
| ...           | 📋 Planned | All routes to be migrated          |

## Changelog

### v1.0.0 (2026-01-11)

- Initial v1 structure created
- Version middleware implemented
- Deprecation/sunset header support added
- Version negotiation implemented
