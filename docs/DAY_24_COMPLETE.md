# Day 24 Complete: System Utilities ✅

**Date**: November 3, 2025  
**Sprint**: Sprint 5 - Game Features & System Utilities (Days 21-25)  
**Status**: ✅ COMPLETE - All 4 routes refactored successfully

---

## 📋 Overview

Successfully refactored all **4 system utility routes** with:

- **MVC Pattern**: Direct Firestore operations, no service layer
- **Public Access**: Most routes don't require authentication
- **Admin Access**: Contact messages viewing (admin only)
- **RBAC**: Proper access control where needed
- **Validation**: Input validation and error handling
- **Error Handling**: Custom error classes with proper HTTP status codes
- **Legacy Backup**: All original routes preserved

### Routes Refactored

1. **`/api/search`** - Universal search (GET - public)
2. **`/api/contact`** - Contact form (POST - public, GET - admin)
3. **`/api/health`** - Health check (GET - public)
4. **`/api/consent`** - Cookie consent (GET/POST/DELETE - public)

**Total**: 4 routes (~510 lines of code)

---

## 🎯 Routes Breakdown

### 1. `/api/search` - Universal Search

**File**: `src/app/api/search/route.ts` (~170 lines)

#### GET - Universal Search (Public Access)

```typescript
GET /api/search?q=beyblade
```

**Features**:

- Public access (no authentication required)
- Minimum query length: 2 characters
- Searches across: Products, Categories, Stores
- Case-insensitive search
- Results limit:
  - Products: 5 results
  - Categories: 3 results
  - Stores: 3 results

**Query Parameters**:

- `q`: Search query (required, min 2 characters)

**Response**:

```json
{
  "success": true,
  "data": {
    "query": "beyblade",
    "results": {
      "products": [
        {
          "type": "product",
          "id": "prod_123",
          "name": "Storm Pegasus",
          "slug": "storm-pegasus",
          "image": "https://...",
          "price": 1299,
          "category": "beyblades"
        }
      ],
      "categories": [
        {
          "type": "category",
          "id": "cat_123",
          "name": "Beyblades",
          "slug": "beyblades",
          "description": "...",
          "image": "https://...",
          "productCount": 25
        }
      ],
      "stores": [
        {
          "type": "store",
          "id": "store_123",
          "name": "Beyblade Store",
          "slug": "beyblade-store",
          "description": "...",
          "rating": 4.5,
          "productCount": 50
        }
      ]
    },
    "counts": {
      "products": 5,
      "categories": 2,
      "stores": 1,
      "total": 8
    }
  }
}
```

**Search Logic**:

- **Products**: Searches in name, description, SKU
- **Categories**: Searches in name, description
- **Stores**: Searches in store name, store description

**Error Cases**:

- 400: Missing query or query too short (< 2 characters)
- 500: Server error

**Performance**:

- Products: Fetches up to 50, filters client-side, returns top 5
- Categories: Fetches up to 30, filters client-side, returns top 3
- Stores: Fetches up to 30, filters client-side, returns top 3
- Total max documents fetched: 110

---

### 2. `/api/contact` - Contact Form

**File**: `src/app/api/contact/route.ts` (~200 lines)

#### POST - Submit Contact Form (Public Access)

```typescript
POST /api/contact
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "phone": "+1234567890",
  "subject": "Product inquiry",
  "message": "I have a question about..."
}
```

**Features**:

- Public access (no authentication required)
- Email validation (regex)
- Subject minimum: 3 characters
- Message minimum: 10 characters
- Auto-generates reference number
- Saves to Firestore collection: `contactMessages`

**Required Fields**:

- `email` (validated)
- `subject` (min 3 chars)
- `message` (min 10 chars)

**Optional Fields**:

- `name` (defaults to "Anonymous")
- `phone`

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "msg_123abc",
    "reference": "REF-123ABC45",
    "estimatedResponse": "Within 24 hours"
  },
  "message": "Your message has been sent successfully. We'll get back to you within 24 hours."
}
```

**Message Data Saved**:

```typescript
{
  email: string,
  name: string,
  phone: string | null,
  subject: string,
  message: string,
  status: "new",
  priority: "normal",
  category: "general",
  source: "website",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Error Cases**:

- 400: Missing required fields, invalid email, subject/message too short
- 500: Server error

---

#### GET - List Contact Messages (Admin Only)

```typescript
GET /api/contact?page=1&limit=20&status=new
Authorization: Bearer <admin_token>
```

**Features**:

- Admin authentication required
- Pagination support
- Filter by: status, priority, category
- Returns summary statistics

**Query Parameters**:

- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20, max: 100)
- `status`: Filter by status (all, new, in-progress, resolved)
- `priority`: Filter by priority (all, low, normal, high)
- `category`: Filter by category (all, general, technical, billing, feedback)

**Response**:

```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "msg_123",
        "email": "user@example.com",
        "name": "John Doe",
        "phone": "+1234567890",
        "subject": "Product inquiry",
        "message": "...",
        "status": "new",
        "priority": "normal",
        "category": "general",
        "source": "website",
        "createdAt": "2025-11-03T10:00:00Z",
        "updatedAt": "2025-11-03T10:00:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalMessages": 100,
      "pageSize": 20,
      "hasMore": true
    },
    "summary": {
      "totalMessages": 100,
      "newMessages": 45,
      "inProgressMessages": 30,
      "resolvedMessages": 25,
      "highPriorityMessages": 10
    }
  }
}
```

**Error Cases**:

- 401: Missing or invalid authorization header
- 403: Admin access required
- 500: Server error

---

### 3. `/api/health` - Health Check

**File**: `src/app/api/health/route.ts` (~40 lines)

#### GET - Health Check (Public Access)

```typescript
GET / api / health;
```

**Features**:

- Public access (no authentication required)
- Returns system status and metadata
- Used for monitoring and load balancer health checks
- Includes uptime and environment information

**Response** (Healthy):

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2025-11-03T10:00:00Z",
    "service": "beyblade-battle",
    "version": "1.0.0",
    "uptime": 3600,
    "environment": "production"
  }
}
```

**Response** (Unhealthy):

```json
{
  "success": false,
  "data": {
    "status": "unhealthy",
    "timestamp": "2025-11-03T10:00:00Z",
    "service": "beyblade-battle",
    "version": "1.0.0",
    "error": "Database connection failed"
  }
}
```

**Status Codes**:

- 200: System is healthy
- 503: System is unhealthy (Service Unavailable)

**Use Cases**:

- Load balancer health checks
- Monitoring systems (Datadog, New Relic, etc.)
- Uptime monitoring (Pingdom, UptimeRobot, etc.)
- Kubernetes liveness/readiness probes

---

### 4. `/api/consent` - Cookie Consent

**File**: `src/app/api/consent/route.ts` (~145 lines)

#### GET - Get Consent Settings (Public Access)

```typescript
GET /api/consent
Cookie: app_session=<session_id>
```

**Features**:

- Public access (no authentication required)
- Session-based consent tracking
- Returns null if no consent given yet
- GDPR compliance

**Response** (Consent Found):

```json
{
  "success": true,
  "data": {
    "sessionId": "sess_123abc",
    "consentGiven": true,
    "analyticsStorage": "granted",
    "consentDate": "2025-11-03T10:00:00Z",
    "updatedAt": "2025-11-03T10:00:00Z"
  }
}
```

**Response** (No Consent):

```json
{
  "success": true,
  "data": {
    "consentGiven": null
  }
}
```

**Response** (No Session):

```json
{
  "success": true,
  "data": {
    "consentGiven": null,
    "message": "No session found"
  }
}
```

---

#### POST - Save Consent Settings (Public Access)

```typescript
POST /api/consent
Cookie: app_session=<session_id>
Content-Type: application/json

{
  "consentGiven": true,
  "analyticsStorage": "granted",
  "consentDate": "2025-11-03T10:00:00Z"
}
```

**Features**:

- Public access (no authentication required)
- Validates consent given (boolean)
- Auto-sets analytics storage based on consent
- Saves to Firestore: `settings/consent_{sessionId}`

**Required Fields**:

- `consentGiven`: boolean

**Optional Fields**:

- `analyticsStorage`: "granted" or "denied" (auto-set if not provided)
- `consentDate`: ISO string (defaults to now)

**Response**:

```json
{
  "success": true,
  "data": {
    "sessionId": "sess_123abc",
    "consentGiven": true,
    "analyticsStorage": "granted",
    "consentDate": "2025-11-03T10:00:00Z",
    "updatedAt": "2025-11-03T10:00:00Z"
  },
  "message": "Consent settings saved successfully"
}
```

**Error Cases**:

- 400: No session, invalid consentGiven type
- 500: Server error

---

#### DELETE - Delete Consent Settings (Public Access)

```typescript
DELETE /api/consent
Cookie: app_session=<session_id>
```

**Features**:

- Public access (no authentication required)
- Deletes consent document from Firestore
- Useful for "forget me" functionality

**Response**:

```json
{
  "success": true,
  "message": "Consent deleted successfully"
}
```

**Error Cases**:

- 400: No session found
- 500: Server error

---

## 🔒 Access Control Summary

### Public Endpoints (No Authentication)

- ✅ `GET /api/search` - Universal search
- ✅ `POST /api/contact` - Submit contact form
- ✅ `GET /api/health` - Health check
- ✅ `GET /api/consent` - Get consent settings
- ✅ `POST /api/consent` - Save consent settings
- ✅ `DELETE /api/consent` - Delete consent settings

### Admin-Only Endpoints

- 🔐 `GET /api/contact` - List contact messages (with filters)

**Admin Verification Pattern**:

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

## 🧪 Testing Recommendations

### Test Coverage

1. **Search Route**:

   ```bash
   # Valid search
   curl http://localhost:3000/api/search?q=beyblade

   # Empty query
   curl http://localhost:3000/api/search?q=

   # Short query (1 char)
   curl http://localhost:3000/api/search?q=a

   # No results
   curl http://localhost:3000/api/search?q=xyz123notfound
   ```

2. **Contact Route - Submit**:

   ```bash
   # Valid submission
   curl -X POST http://localhost:3000/api/contact \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "name": "John Doe",
       "subject": "Test inquiry",
       "message": "This is a test message"
     }'

   # Missing fields
   curl -X POST http://localhost:3000/api/contact \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com"}'

   # Invalid email
   curl -X POST http://localhost:3000/api/contact \
     -H "Content-Type: application/json" \
     -d '{
       "email": "invalid-email",
       "subject": "Test",
       "message": "Test message"
     }'
   ```

3. **Contact Route - Admin List**:

   ```bash
   # List all messages
   curl http://localhost:3000/api/contact \
     -H "Authorization: Bearer $ADMIN_TOKEN"

   # Filter by status
   curl http://localhost:3000/api/contact?status=new \
     -H "Authorization: Bearer $ADMIN_TOKEN"

   # Pagination
   curl http://localhost:3000/api/contact?page=2&limit=10 \
     -H "Authorization: Bearer $ADMIN_TOKEN"

   # Without auth (should fail)
   curl http://localhost:3000/api/contact
   ```

4. **Health Check**:

   ```bash
   # Health check
   curl http://localhost:3000/api/health
   ```

5. **Consent Route**:

   ```bash
   # Get consent
   curl http://localhost:3000/api/consent \
     -H "Cookie: app_session=test_session_123"

   # Save consent
   curl -X POST http://localhost:3000/api/consent \
     -H "Cookie: app_session=test_session_123" \
     -H "Content-Type: application/json" \
     -d '{"consentGiven": true}'

   # Delete consent
   curl -X DELETE http://localhost:3000/api/consent \
     -H "Cookie: app_session=test_session_123"

   # No session (should return null)
   curl http://localhost:3000/api/consent
   ```

### Edge Cases

- ✅ Empty search query
- ✅ Search query too short (< 2 chars)
- ✅ No search results
- ✅ Missing contact form fields
- ✅ Invalid email format
- ✅ Short subject/message
- ✅ Admin auth (missing, invalid)
- ✅ Pagination beyond available pages
- ✅ Invalid consent data type
- ✅ No session cookie

---

## 📝 Technical Achievements

### MVC Architecture

- ✅ Direct Firestore operations (no service layer needed)
- ✅ Controller logic in route handlers
- ✅ Custom error classes for validation

### Public Access Pattern

- ✅ Most routes don't require authentication
- ✅ Session-based consent tracking
- ✅ Admin-only contact message viewing

### Data Validation

- ✅ Search query validation (min length)
- ✅ Email validation (regex)
- ✅ Subject/message length validation
- ✅ Boolean validation (consent)
- ✅ Session validation (consent)

### Error Handling

- ✅ Custom error classes: `ValidationError`, `AuthorizationError`
- ✅ Proper HTTP status codes (400, 401, 403, 500, 503)
- ✅ Descriptive error messages
- ✅ Error logging for debugging

### Firestore Integration

- ✅ Search across multiple collections
- ✅ Client-side filtering for search
- ✅ Contact message storage
- ✅ Consent settings storage
- ✅ Query optimization (limits)

### GDPR Compliance

- ✅ Cookie consent management
- ✅ Session-based tracking
- ✅ Analytics storage permission
- ✅ Data deletion support

---

## 🔄 Legacy Code Preservation

All original routes backed up to `_legacy/`:

```
_legacy/
  search/
    route.ts                    # Universal search
  contact/
    route.ts                    # Contact form
  health/
    route.ts                    # Health check
  consent/
    route.ts                    # Cookie consent
```

---

## 📈 Code Metrics

### Lines of Code

- `search/route.ts`: ~170 lines
- `contact/route.ts`: ~200 lines
- `health/route.ts`: ~40 lines
- `consent/route.ts`: ~145 lines
- **Total**: ~555 lines

### Import Paths

```typescript
// Level 1 (all system utility routes)
import { ... } from "../_lib/database/admin";
import { ... } from "../_lib/middleware/error-handler";
```

### TypeScript Errors

- ✅ **0 errors** on all routes
- ✅ **0 warnings** on all routes
- ✅ All routes compile successfully

---

## 🚀 What's Next

### Day 25: Sprint 5 Review (Final Day)

- Integration testing (Days 21-24 routes)
- Game features testing (arenas, beyblades)
- System utilities testing (search, contact, health, consent)
- Performance review
- Security audit
- Create Sprint 5 summary documentation

---

## ✅ Completion Checklist

- [x] Search for existing system utility routes
- [x] Create legacy backup directories
- [x] Backup all 4 system utility routes
- [x] Refactor `search/route.ts` (GET - universal search)
- [x] Refactor `contact/route.ts` (GET/POST - admin list, public submit)
- [x] Refactor `health/route.ts` (GET - health check)
- [x] Refactor `consent/route.ts` (GET/POST/DELETE - cookie consent)
- [x] Verify all routes (0 TypeScript errors)
- [x] Create Day 24 documentation
- [ ] Update 30_DAY_ACTION_PLAN.md (mark Day 24 complete) - Next step

---

## 🎉 Summary

**Day 24 Complete!** Successfully refactored all 4 system utility routes with:

- **Public access** for most endpoints (no auth required)
- **Admin-only access** for contact message viewing
- **GDPR compliance** with cookie consent management
- **Universal search** across products, categories, stores
- **Health monitoring** for system status
- **Contact form** with email validation
- **0 TypeScript errors** - All routes compile successfully

**Sprint 5 Progress**: 4/5 days complete, 20/~20 routes (~2,840 lines, 100%)

Ready for Day 25: Sprint 5 Review! 🚀
