# Day 23 Complete: Game - Beyblade Routes ✅

**Date**: March 11, 2025  
**Sprint**: Sprint 5 - Game Features & System Utilities (Days 21-25)  
**Status**: ✅ COMPLETE - All 5 routes refactored successfully

---

## 📋 Overview

Successfully refactored all 5 beyblade-related API routes with:

- **MVC Pattern**: Direct Firestore operations, no service layer
- **Next.js 15**: Async params for dynamic routes
- **RBAC**: Public read access, admin-only write operations
- **Authentication**: Admin verification for write operations
- **Validation**: Comprehensive input validation
- **Error Handling**: Custom error classes with proper HTTP status codes
- **Legacy Backup**: All original routes preserved

### Routes Refactored

1. **`/api/beyblades`** - List/create beyblades (GET public, POST admin)
2. **`/api/beyblades/[id]`** - Beyblade CRUD (GET public, PUT/DELETE admin)
3. **`/api/beyblades/init`** - Initialize default beyblades (POST admin)
4. **`/api/beyblades/upload-image`** - Upload beyblade images (POST admin)
5. **`/api/beyblades/svg/[filename]`** - Serve SVG files (GET public)

**Total**: 5 routes (~550 lines of code)

---

## 🎯 Routes Breakdown

### 1. `/api/beyblades` - List & Create Beyblades

**File**: `src/app/api/beyblades/route.ts` (~210 lines)

#### GET - List All Beyblades (Public Access)

```typescript
GET /api/beyblades
GET /api/beyblades?type=attack
GET /api/beyblades?search=storm
```

**Features**:

- Public access (no authentication required)
- Filter by type: `attack`, `defense`, `stamina`, `balanced`
- Search by name (case-insensitive)
- Returns all beyblade stats

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": "storm_pegasus",
      "displayName": "Storm Pegasus",
      "fileName": "storm_pegasus.svg",
      "type": "attack",
      "spinDirection": "right",
      "mass": 50,
      "radius": 4,
      "actualSize": 40,
      "typeDistribution": {
        "attack": 150,
        "defense": 100,
        "stamina": 110,
        "total": 360
      },
      "pointsOfContact": [...],
      "imageUrl": "...",
      "imagePosition": {...}
    }
  ]
}
```

#### POST - Create Beyblade (Admin Only)

```typescript
POST /api/beyblades
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "displayName": "Storm Pegasus",
  "type": "attack",
  "spinDirection": "right",
  "mass": 50,
  "radius": 4,
  "typeDistribution": {
    "attack": 150,
    "defense": 100,
    "stamina": 110,
    "total": 360
  },
  "pointsOfContact": [
    { "angle": 0, "damageMultiplier": 1.5, "width": 45 },
    { "angle": 120, "damageMultiplier": 1.2, "width": 45 },
    { "angle": 240, "damageMultiplier": 1.5, "width": 45 }
  ],
  "imageUrl": "https://...",
  "imagePosition": {
    "x": 0,
    "y": 0,
    "scale": 1,
    "rotation": 0
  }
}
```

**Features**:

- Admin authentication required
- Auto-generates ID from display name (lowercase, underscores)
- Validates required fields: `displayName`, `type`
- Validates type enum: `attack`, `defense`, `stamina`, `balanced`
- Validates spin direction: `left`, `right`
- Prevents duplicate beyblades (by ID)
- Default values for optional fields
- Auto-generates fileName for backward compatibility

**Response**:

```json
{
  "success": true,
  "data": {
    /* beyblade object */
  },
  "message": "Beyblade created successfully"
}
```

**Error Cases**:

- 400: Missing required fields, invalid type/spin direction, duplicate beyblade
- 401: Missing or invalid authorization header
- 403: Admin access required
- 500: Server error

---

### 2. `/api/beyblades/[id]` - Beyblade CRUD

**File**: `src/app/api/beyblades/[id]/route.ts` (~220 lines)

#### GET - Get Beyblade Details (Public Access)

```typescript
GET / api / beyblades / storm_pegasus;
```

**Features**:

- Public access (no authentication required)
- Returns complete beyblade details
- 404 if beyblade not found

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "storm_pegasus",
    "displayName": "Storm Pegasus",
    "type": "attack"
    // ... full beyblade stats
  }
}
```

#### PUT - Update Beyblade (Admin Only)

```typescript
PUT /api/beyblades/storm_pegasus
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "mass": 55,
  "typeDistribution": {
    "attack": 160,
    "defense": 95,
    "stamina": 105,
    "total": 360
  }
}
```

**Features**:

- Admin authentication required
- Partial updates supported (merge with existing data)
- ID cannot be changed (protected field)
- Validates type and spin direction if provided
- 404 if beyblade not found

**Response**:

```json
{
  "success": true,
  "data": {
    /* updated beyblade */
  },
  "message": "Beyblade updated successfully"
}
```

#### DELETE - Delete Beyblade (Admin Only)

```typescript
DELETE / api / beyblades / storm_pegasus;
Authorization: Bearer<admin_token>;
```

**Features**:

- Admin authentication required
- Checks if beyblade exists before deletion
- 404 if beyblade not found

**Response**:

```json
{
  "success": true,
  "data": { "id": "storm_pegasus" },
  "message": "Beyblade deleted successfully"
}
```

**Error Cases**:

- 400: Invalid type or spin direction
- 401: Missing or invalid authorization header
- 403: Admin access required
- 404: Beyblade not found
- 500: Server error

---

### 3. `/api/beyblades/init` - Initialize Default Beyblades

**File**: `src/app/api/beyblades/init/route.ts` (~75 lines)

#### POST - Initialize Defaults (Admin Only)

```typescript
POST / api / beyblades / init;
Authorization: Bearer<admin_token>;
```

**Features**:

- Admin authentication required
- Idempotent operation (safe to call multiple times)
- Checks if beyblades already exist
- Returns success if already initialized

**Response** (Already Initialized):

```json
{
  "success": true,
  "message": "Beyblades already initialized",
  "count": 1
}
```

**Response** (Newly Initialized):

```json
{
  "success": true,
  "message": "Default Beyblade stats initialized successfully"
}
```

**Error Cases**:

- 401: Missing or invalid authorization header
- 403: Admin access required
- 500: Server error

---

### 4. `/api/beyblades/upload-image` - Upload Beyblade Image

**File**: `src/app/api/beyblades/upload-image/route.ts` (~125 lines)

#### POST - Upload Image (Admin Only)

```typescript
POST /api/beyblades/upload-image
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

FormData:
- file: File (image)
- beybladeId: string (beyblade ID)
```

**Features**:

- Admin authentication required
- Supports: PNG, JPG, JPEG, SVG, WebP
- Max file size: 10MB
- Auto-generates unique filename with timestamp
- Uploads to Firebase Storage (`beyblades/` folder)
- Makes file publicly accessible
- Returns public URL

**Response**:

```json
{
  "success": true,
  "imageUrl": "https://storage.googleapis.com/.../beyblade-storm_pegasus-1709876543210.png",
  "message": "Image uploaded successfully"
}
```

**Error Cases**:

- 400: No file provided, no beyblade ID, invalid file type, file too large
- 401: Missing or invalid authorization header
- 403: Admin access required
- 500: Server error

**Validation**:

- File type: Must be one of the allowed image types
- File size: Must be ≤ 10MB
- Beyblade ID: Required

---

### 5. `/api/beyblades/svg/[filename]` - Serve SVG Files

**File**: `src/app/api/beyblades/svg/[filename]/route.ts` (~60 lines)

#### GET - Serve SVG (Public Access)

```typescript
GET / api / beyblades / svg / storm_pegasus.svg;
```

**Features**:

- Public access (no authentication required)
- Serves SVG files from local filesystem
- Security: Prevents directory traversal attacks
- Only allows `.svg` files
- Sets proper CORS headers
- Aggressive caching (1 year)

**Response**:

```
Content-Type: image/svg+xml
Cache-Control: public, max-age=31536000, immutable
Access-Control-Allow-Origin: *

<svg>...</svg>
```

**Error Cases**:

- 400: Invalid filename, non-SVG file, directory traversal attempt
- 404: File not found
- 500: Server error

**Security Features**:

- Validates filename (no `..`, `/`, `\`)
- Enforces `.svg` extension
- Reads from predefined directory only
- CORS enabled for public access

---

## 🔒 Access Control Summary

### Public Endpoints (No Authentication)

- ✅ `GET /api/beyblades` - List all beyblades
- ✅ `GET /api/beyblades/[id]` - Get beyblade details
- ✅ `GET /api/beyblades/svg/[filename]` - Serve SVG files

### Admin-Only Endpoints

- 🔐 `POST /api/beyblades` - Create beyblade
- 🔐 `PUT /api/beyblades/[id]` - Update beyblade
- 🔐 `DELETE /api/beyblades/[id]` - Delete beyblade
- 🔐 `POST /api/beyblades/init` - Initialize defaults
- 🔐 `POST /api/beyblades/upload-image` - Upload image

**Admin Verification**:

```typescript
async function verifyAdminAuth(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new AuthorizationError("Missing or invalid authorization header");
  }

  const token = authHeader.substring(7);
  const decodedToken = await auth.verifyIdToken(token);

  if (!decodedToken.admin && decodedToken.role !== "admin") {
    throw new AuthorizationError("Admin access required");
  }

  return decodedToken;
}
```

---

## 📊 Beyblade Data Structure

### BeybladeStats Interface

```typescript
interface BeybladeStats {
  // Identity
  id: string; // Generated from displayName
  displayName: string; // Human-readable name
  fileName: string; // SVG filename (auto-generated)

  // Basic Properties
  type: "attack" | "defense" | "stamina" | "balanced";
  spinDirection: "left" | "right";
  mass: number; // grams (default: 50)
  radius: number; // cm (default: 4)
  actualSize: number; // pixels = radius * 10

  // Stats Distribution
  typeDistribution: {
    attack: number; // Attack stat (0-360)
    defense: number; // Defense stat (0-360)
    stamina: number; // Stamina stat (0-360)
    total: number; // Should equal 360
  };

  // Contact Points (for damage calculation)
  pointsOfContact: Array<{
    angle: number; // Angle in degrees (0-360)
    damageMultiplier: number; // Damage multiplier (e.g., 1.2)
    width: number; // Width in degrees (e.g., 45)
  }>;

  // Visual
  imageUrl?: string; // URL to beyblade image
  imagePosition?: {
    x: number; // X position offset
    y: number; // Y position offset
    scale: number; // Scale factor (default: 1)
    rotation: number; // Rotation in degrees
  };
}
```

### Default Values

When creating a beyblade, the following defaults are applied:

```typescript
{
  spinDirection: "right",
  mass: 50,                      // grams
  radius: 4,                     // cm
  actualSize: 40,                // pixels (radius * 10)
  typeDistribution: {
    attack: 120,
    defense: 120,
    stamina: 120,
    total: 360
  },
  pointsOfContact: [
    { angle: 0, damageMultiplier: 1.2, width: 45 },
    { angle: 90, damageMultiplier: 1.0, width: 45 },
    { angle: 180, damageMultiplier: 1.2, width: 45 },
    { angle: 270, damageMultiplier: 1.0, width: 45 }
  ],
  imagePosition: {
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0
  }
}
```

---

## 🎮 Game Mechanics Integration

### Beyblade Types

**Attack Type** (High damage, low stamina):

```typescript
{
  type: "attack",
  typeDistribution: {
    attack: 180,    // High attack
    defense: 90,    // Low defense
    stamina: 90,    // Low stamina
    total: 360
  }
}
```

**Defense Type** (High defense, moderate stamina):

```typescript
{
  type: "defense",
  typeDistribution: {
    attack: 80,     // Low attack
    defense: 180,   // High defense
    stamina: 100,   // Moderate stamina
    total: 360
  }
}
```

**Stamina Type** (High stamina, moderate defense):

```typescript
{
  type: "stamina",
  typeDistribution: {
    attack: 80,     // Low attack
    defense: 100,   // Moderate defense
    stamina: 180,   // High stamina
    total: 360
  }
}
```

**Balanced Type** (Equal distribution):

```typescript
{
  type: "balanced",
  typeDistribution: {
    attack: 120,    // Balanced
    defense: 120,   // Balanced
    stamina: 120,   // Balanced
    total: 360
  }
}
```

### Points of Contact

Used for damage calculation in battles:

- **Angle**: Position on beyblade (0° = front, 180° = back)
- **Damage Multiplier**: Damage factor (e.g., 1.5 = 50% more damage)
- **Width**: Contact area in degrees

**Example** (Attack type with sharp points):

```typescript
pointsOfContact: [
  { angle: 0, damageMultiplier: 1.8, width: 30 }, // Front spike
  { angle: 120, damageMultiplier: 1.8, width: 30 }, // Side spike
  { angle: 240, damageMultiplier: 1.8, width: 30 }, // Side spike
];
```

### Physics Properties

- **Mass**: Affects momentum and knock-back resistance
- **Radius**: Affects collision detection and spin area
- **Spin Direction**: Left or right (affects interactions)

---

## 🧪 Testing Recommendations

### Test Coverage

1. **Public Read Access**:

   ```bash
   # List all beyblades
   curl http://localhost:3000/api/beyblades

   # Filter by type
   curl http://localhost:3000/api/beyblades?type=attack

   # Search by name
   curl http://localhost:3000/api/beyblades?search=storm

   # Get specific beyblade
   curl http://localhost:3000/api/beyblades/storm_pegasus

   # Get SVG file
   curl http://localhost:3000/api/beyblades/svg/storm_pegasus.svg
   ```

2. **Admin Create**:

   ```bash
   curl -X POST http://localhost:3000/api/beyblades \
     -H "Authorization: Bearer $ADMIN_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "displayName": "Storm Pegasus",
       "type": "attack",
       "spinDirection": "right",
       "mass": 50
     }'
   ```

3. **Admin Update**:

   ```bash
   curl -X PUT http://localhost:3000/api/beyblades/storm_pegasus \
     -H "Authorization: Bearer $ADMIN_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "mass": 55,
       "typeDistribution": {
         "attack": 160,
         "defense": 95,
         "stamina": 105,
         "total": 360
       }
     }'
   ```

4. **Admin Delete**:

   ```bash
   curl -X DELETE http://localhost:3000/api/beyblades/storm_pegasus \
     -H "Authorization: Bearer $ADMIN_TOKEN"
   ```

5. **Image Upload**:

   ```bash
   curl -X POST http://localhost:3000/api/beyblades/upload-image \
     -H "Authorization: Bearer $ADMIN_TOKEN" \
     -F "file=@storm_pegasus.png" \
     -F "beybladeId=storm_pegasus"
   ```

6. **Initialize Defaults**:
   ```bash
   curl -X POST http://localhost:3000/api/beyblades/init \
     -H "Authorization: Bearer $ADMIN_TOKEN"
   ```

### Edge Cases

- ✅ Empty beyblade list
- ✅ Invalid beyblade ID (404)
- ✅ Duplicate beyblade creation
- ✅ Invalid type values
- ✅ Invalid spin direction
- ✅ Missing required fields
- ✅ Partial updates (PUT)
- ✅ File upload validation (type, size)
- ✅ SVG file security (directory traversal)
- ✅ Admin authentication (missing, invalid)
- ✅ Public access (no auth)

---

## 📝 Technical Achievements

### MVC Architecture

- ✅ Direct Firestore operations (no service layer)
- ✅ Controller logic in route handlers
- ✅ Model types from `@/types/beybladeStats`
- ✅ Custom error classes for validation

### Next.js 15 Compatibility

- ✅ Async params: `context: { params: Promise<{ id: string }> }`
- ✅ Await params before use: `const { id } = await context.params`
- ✅ No breaking changes from Next.js 14 patterns

### Authentication & Authorization

- ✅ Admin verification helper: `verifyAdminAuth(request)`
- ✅ Public endpoints: No authentication required
- ✅ Admin endpoints: Bearer token + role check
- ✅ Custom error handling (401 vs 403)

### Data Validation

- ✅ Required fields: `displayName`, `type`
- ✅ Enum validation: `type`, `spinDirection`
- ✅ Duplicate prevention (by ID)
- ✅ File type validation (image uploads)
- ✅ File size validation (10MB max)
- ✅ Security validation (SVG serving)

### Error Handling

- ✅ Custom error classes: `AuthorizationError`, `ValidationError`
- ✅ Proper HTTP status codes (400, 401, 403, 404, 500)
- ✅ Descriptive error messages
- ✅ Error logging for debugging

### Firebase Integration

- ✅ Firestore queries with filters
- ✅ Client-side search (name filtering)
- ✅ Storage uploads (images)
- ✅ Public file serving
- ✅ Admin SDK authentication

---

## 🔄 Legacy Code Preservation

All original routes backed up to `_legacy/beyblades/`:

```
_legacy/
  beyblades/
    route.ts                    # Main list/create
    [id]/
      route.ts                  # CRUD operations
    init/
      route.ts                  # Initialize defaults
    upload-image/
      route.ts                  # Image uploads
    svg/
      [filename]/
        route.ts                # SVG serving
```

---

## 📈 Code Metrics

### Lines of Code

- `beyblades/route.ts`: ~210 lines
- `beyblades/[id]/route.ts`: ~220 lines
- `beyblades/init/route.ts`: ~75 lines
- `beyblades/upload-image/route.ts`: ~125 lines
- `beyblades/svg/[filename]/route.ts`: ~60 lines
- **Total**: ~690 lines

### Import Paths

```typescript
// Level 1 (beyblades/route.ts)
import { ... } from "../_lib/database/admin";
import { ... } from "../_lib/middleware/error-handler";

// Level 2 (beyblades/[id]/route.ts, init/, upload-image/)
import { ... } from "../../_lib/database/admin";
import { ... } from "../../_lib/middleware/error-handler";

// Level 3 (beyblades/svg/[filename]/route.ts)
// No _lib imports (file system only)
```

### TypeScript Errors

- ✅ **0 errors** on all routes
- ✅ **0 warnings** on all routes
- ✅ All routes compile successfully

---

## 🚀 What's Next

### Day 24: System Utilities (Estimated 6 routes)

- Search route (universal search)
- Contact route (contact form submissions)
- Health check route (system status)
- Cookie consent route (GDPR compliance)
- Error tracking route (client error logging)
- Other system utilities

### Day 25: Sprint 5 Review

- Integration testing
- Documentation review
- Performance analysis
- Sprint summary

---

## ✅ Completion Checklist

- [x] Read and understand existing beyblade routes
- [x] Create legacy backup directories
- [x] Backup all 5 beyblade routes
- [x] Refactor `beyblades/route.ts` (GET/POST)
- [x] Refactor `beyblades/[id]/route.ts` (GET/PUT/DELETE)
- [x] Refactor `beyblades/init/route.ts` (POST)
- [x] Refactor `beyblades/upload-image/route.ts` (POST)
- [x] Refactor `beyblades/svg/[filename]/route.ts` (GET)
- [x] Verify all routes (0 TypeScript errors)
- [x] Create Day 23 documentation
- [ ] Update 30_DAY_ACTION_PLAN.md (mark Day 23 complete) - Next step

---

## 🎉 Summary

**Day 23 Complete!** Successfully refactored all 5 beyblade routes with:

- **Public read access** for beyblade data and SVG files
- **Admin-only write access** for data management and uploads
- **Comprehensive validation** for all inputs
- **Security features** for file serving
- **Game mechanics support** with type distributions and contact points
- **0 TypeScript errors** - All routes compile successfully

**Sprint 5 Progress**: 3/5 days complete, 16/~18 routes (~89%)

Ready to continue with Day 24 System Utilities! 🚀
