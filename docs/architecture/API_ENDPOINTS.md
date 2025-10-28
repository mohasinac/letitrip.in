# API Endpoints Documentation

> **Last Updated:** October 29, 2025  
> **Status:** ✅ Refactored - Service layer implemented  
> **Purpose:** Single source of truth for API architecture, endpoints, and service patterns

## 🌐 API Overview

### **Base URL**

- **Development:** `http://localhost:3000/api`
- **Production:** `https://justforview.in/api`

### **Authentication**

- JWT tokens stored in HTTP-only cookies
- Admin endpoints require `role: "admin"`
- Public endpoints require no authentication

### **Response Format**

All API responses follow a consistent format:

```typescript
interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

---

## 🏗️ Service Layer Architecture

### Overview

All API operations use centralized service layer for consistency, caching, and error handling.

### Service Structure

```
src/lib/api/
├── client.ts           (Axios instance with interceptors)
├── services/
│   ├── base.service.ts         (Abstract base with common functionality)
│   ├── category.service.ts     (Category CRUD + utilities)
│   ├── storage.service.ts      (File uploads & retrieval)
│   └── index.ts                (Export index)
└── auth-fetch.ts       (Token management)
```

### BaseService Features

- ✅ Response caching with expiration
- ✅ Automatic error handling & formatting
- ✅ Request validation
- ✅ Response transformation
- ✅ Retry logic (3 attempts, exponential backoff)

### Usage Examples

**CategoryService:**

```typescript
// Get all categories
const categories = await CategoryService.getCategories("list", 1, 10);

// Create category
const newCat = await CategoryService.createCategory(formData);

// Validate slug
const isValid = await CategoryService.validateSlug("buy-beyblades");
```

**StorageService:**

```typescript
// Upload image with progress
const result = await StorageService.uploadImage({
  file,
  folder: "categories",
  slug: "buy-beyblades",
  onProgress: (progress) => console.log(progress),
});

// Get cached image URL
const url = StorageService.getImageUrl("categories/buy-beyblades.jpg", 24);
```

---

## 📋 API Endpoints

### 🗨️ Contact API

**Endpoint:** `/api/contact`

#### **POST** - Submit Contact Form

**Purpose:** Handle contact form submissions from users

**Request Body:**

```typescript
interface ContactRequest {
  email: string; // Required - User's email
  subject: string; // Required - Message subject
  message: string; // Required - Message content
  name?: string; // Optional - User's name (defaults to "Anonymous")
  phone?: string; // Optional - User's phone number
}
```

**Response (201 Created):**

```typescript
interface ContactResponse {
  success: true;
  message: "Your message has been sent successfully. We'll get back to you within 24 hours.";
  data: {
    id: string; // Firestore document ID
    reference: string; // Reference number (e.g., "REF-A1B2C3D4")
    estimatedResponse: string; // "Within 24 hours"
  };
}
```

**Error Responses:**

- `400` - Invalid email format or missing required fields
- `500` - Server error

#### **GET** - Retrieve Contact Messages (Admin Only)

**Purpose:** Allow admins to view and manage contact form submissions

**Query Parameters:**

```typescript
interface ContactQuery {
  page?: string; // Default: "1"
  limit?: string; // Default: "20"
  status?: string; // "all" | "new" | "in-progress" | "resolved"
  priority?: string; // "all" | "low" | "normal" | "high"
  category?: string; // "all" | "general" | "technical" | "billing" | "feedback"
}
```

**Response (200 OK):**

```typescript
interface ContactListResponse {
  success: true;
  data: {
    messages: ContactMessage[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalMessages: number;
      hasMore: boolean;
    };
    summary: {
      totalMessages: number;
      newMessages: number;
      inProgressMessages: number;
      resolvedMessages: number;
      highPriorityMessages: number;
    };
  };
}

interface ContactMessage {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  subject: string;
  message: string;
  status: "new" | "in-progress" | "resolved";
  priority: "low" | "normal" | "high";
  category: "general" | "technical" | "billing" | "feedback";
  source: "website";
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}
```

**Error Responses:**

- `403` - Admin access required
- `500` - Server error

---

### 📄 Content API

**Endpoint:** `/api/content`

#### **GET** - Retrieve Markdown Content

**Purpose:** Serve parsed markdown content from the content directory

**Query Parameters:**

```typescript
interface ContentQuery {
  file: string; // Required - File path relative to content directory
}
```

**Example Request:**

```
GET /api/content?file=faq.md
GET /api/content?file=about/company.md
```

**Response (200 OK):**

```typescript
interface ContentResponse {
  content: string; // Parsed markdown content as HTML
  metadata?: {
    // Optional frontmatter from markdown
    title?: string;
    description?: string;
    lastUpdated?: string;
    [key: string]: any;
  };
}
```

**Error Responses:**

- `400` - File path is required
- `404` - File not found
- `500` - Server error

**Usage Example:**

```typescript
const response = await fetch("/api/content?file=faq.md");
const { content, metadata } = await response.json();
```

---

### 🎯 Beyblades Assets API

**Endpoint:** `/api/beyblades/[filename]`

#### **GET** - Serve Beyblade SVG Assets

**Purpose:** Serve SVG files from the beyblades assets directory with proper caching

**Path Parameters:**

```typescript
interface BeybladeAssetParams {
  filename: string; // SVG filename (must end with .svg)
}
```

**Example Requests:**

```
GET /api/beyblades/burst-valkyrie.svg
GET /api/beyblades/dragoon.svg
```

**Response (200 OK):**

- **Content-Type:** `image/svg+xml`
- **Cache-Control:** `public, max-age=31536000, immutable`
- **Body:** SVG file content

**Security Features:**

- Path traversal protection (blocks `..`, `/`, `\`)
- File extension validation (only `.svg` allowed)
- CORS headers for cross-origin requests

**Error Responses:**

- `400` - Invalid filename or non-SVG file
- `404` - File not found
- `500` - Server error

---

### 🍪 Cookies API

**Endpoint:** `/api/cookies`

#### **GET** - Cookie Information

**Purpose:** Provide public information about cookies used by the application

**Response (200 OK):**

```typescript
interface CookieInfoResponse {
  success: true;
  data: {
    consent: {
      required: boolean; // GDPR compliance required
      preferences: boolean; // User can manage preferences
      analytics: boolean; // Analytics cookies enabled
      marketing: boolean; // Marketing cookies enabled
    };
    security: {
      httpOnly: boolean; // HTTP-only cookie flag
      secure: boolean; // Secure flag (true in production)
      sameSite: string; // SameSite policy
    };
    expiration: {
      auth_token: string; // "30 days"
      user_data: string; // "30 days"
      cart_data: string; // "7 days"
      preferences: string; // "1 year"
    };
    cookies: {
      essential: string[]; // Essential cookie names
      functional: string[]; // Functional cookie names
      analytics: string[]; // Analytics cookie names
      marketing: string[]; // Marketing cookie names
    };
  };
}
```

#### **POST** - Cookie Operations

**Purpose:** Handle cookie-related operations and consent management

**Request Body:**

```typescript
interface CookieRequest {
  action: "set" | "consent";
  key?: string; // Required for "set" action
  value?: any; // Required for "set" action
  options?: {
    // Optional cookie options
    expires?: number;
    secure?: boolean;
    sameSite?: string;
  };
}
```

**Response (200 OK):**

```typescript
interface CookieResponse {
  success: true;
  message: string; // Confirmation message
}
```

**Error Responses:**

- `400` - Invalid action or missing parameters
- `500` - Server error

---

### 🐛 Error Logging API

**Endpoint:** `/api/errors`

#### **POST** - Log Client-Side Errors

**Purpose:** Collect and process client-side errors for monitoring

**Request Body:**

```typescript
interface ErrorLogEntry {
  error: {
    name: string; // Error name/type
    message: string; // Error message
    stack?: string; // Stack trace
  };
  timestamp: string; // ISO date string
  url?: string; // URL where error occurred
  userAgent?: string; // Browser user agent
  userId?: string; // User ID if authenticated
  metadata?: {
    // Additional context
    [key: string]: any;
  };
}
```

**Response (200 OK):**

```typescript
interface ErrorResponse {
  success: true;
}
```

**Features:**

- Critical error detection and alerting
- Error categorization and prioritization
- Integration with external monitoring services
- Automatic error aggregation and reporting

**Error Responses:**

- `400` - Invalid error log entry
- `500` - Failed to process error log

---

### 🏷️ Category Management API

**Endpoint:** `/api/admin/categories`

#### **GET** - Retrieve Categories

**Purpose:** Fetch categories with optional tree or list format

**Query Parameters:**

```typescript
interface CategoriesQuery {
  format?: "tree" | "list"; // Default: "list"
  page?: number; // Default: 1 (for list format)
  limit?: number; // Default: 10 (for list format)
}
```

**Response (200 OK):**

```typescript
// Tree format response
interface CategoryTreeResponse {
  success: true;
  data: CategoryNode[];
}

interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  active: boolean;
  featured: boolean;
  productCount: {
    inStock: number;
    outOfStock: number;
  };
  children?: CategoryNode[];
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    metaImage?: string;
  };
}

// List format response
interface CategoryListResponse {
  success: true;
  data: {
    categories: Category[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      hasMore: boolean;
    };
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  level: number;
  active: boolean;
  featured: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string;
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    metaImage?: string;
    altText?: string;
  };
}
```

**Error Responses:**

- `403` - Admin access required
- `500` - Server error

#### **POST** - Create Category

**Purpose:** Create a new product category

**Request Body:**

```typescript
interface CreateCategoryRequest {
  name: string; // Required - Max 100 chars
  slug?: string; // Optional - Auto-generated from name
  description?: string; // Optional - Max 500 chars
  image?: string; // Optional - Image URL
  parentId?: string; // Optional - Parent category ID
  active?: boolean; // Default: true
  featured?: boolean; // Default: false
  seo: {
    metaTitle: string; // Required - Max 60 chars
    metaDescription: string; // Required - Max 160 chars
    keywords: string[]; // Optional - Array of keywords
    metaImage?: string; // Optional - SEO image URL
    altText?: string; // Optional - Max 125 chars
  };
}
```

**Response (201 Created):**

```typescript
interface CreateCategoryResponse {
  success: true;
  data: Category;
}
```

**Error Responses:**

- `400` - Validation failed (duplicate slug, invalid parent, etc.)
- `403` - Admin access required
- `500` - Server error

**Validations:**

- Name must be unique at same level
- Slug must be unique globally
- Max nesting depth: 5 levels
- No circular references (parent cannot be a descendant)

#### **PATCH** - Update Category

**Purpose:** Update existing category

**Request Body:**

```typescript
interface UpdateCategoryRequest {
  name?: string; // Optional - Max 100 chars
  slug?: string; // Optional - Max 100 chars
  description?: string; // Optional - Max 500 chars
  image?: string; // Optional - Image URL
  parentId?: string | null; // Optional - Move to new parent
  active?: boolean;
  featured?: boolean;
  seo?: {
    metaTitle?: string; // Max 60 chars
    metaDescription?: string; // Max 160 chars
    keywords?: string[];
    metaImage?: string;
    altText?: string; // Max 125 chars
  };
}
```

**Response (200 OK):**

```typescript
interface UpdateCategoryResponse {
  success: true;
  data: Category;
}
```

**Error Responses:**

- `400` - Validation failed
- `403` - Admin access required
- `404` - Category not found
- `500` - Server error

**Validations:**

- Cannot move to circular parent
- Cannot exceed max depth if moving
- Slug must remain unique

#### **DELETE** - Delete Category

**Purpose:** Delete a category

**Query Parameters:**

```typescript
interface DeleteCategoryQuery {
  id: string; // Required - Category ID
}
```

**Response (200 OK):**

```typescript
interface DeleteCategoryResponse {
  success: true;
  message: "Category deleted successfully";
}
```

**Error Responses:**

- `403` - Admin access required
- `404` - Category not found
- `409` - Cannot delete category with products/children
- `500` - Server error

**Validations:**

- Category must have no child categories
- Category must have no associated products

---

### � Storage API

**Endpoint:** `/api/storage`

#### **POST** `/api/storage/upload` - Upload Image

**Purpose:** Upload images to Firebase Storage with slug-based naming for categories

**Request Body:**

```typescript
interface ImageUploadRequest {
  file: File; // Required - Image file (image/* only)
  folder: string; // Required - Storage folder (e.g., "categories")
  slug?: string; // Optional - Slug for custom naming (image saved as "{slug}.{ext}")
}
```

**Response (200 OK):**

```typescript
interface ImageUploadResponse {
  success: true;
  data: {
    url: string; // Firebase Storage public URL or storage path
    filename: string; // Filename (with or without slug prefix)
    filepath: string; // Full filepath in storage
    size: number; // File size in bytes
    type: string; // MIME type
  };
}
```

**Features:**

- Slug-based naming: If slug provided, image saved as `{slug}.{extension}`
- UUID fallback: If no slug, generates UUID-based filename
- Size validation: Max 10MB server-side, 5MB client-side
- Type validation: Only image files accepted
- Auto-slug prefix: Category images auto-prefixed with 'buy-' in slug

**Error Responses:**

- `400` - Invalid file or missing required fields
- `401` - Authentication required
- `413` - File too large
- `500` - Server error

**Example Usage:**

```typescript
const formData = new FormData();
formData.append("file", imageFile);
formData.append("folder", "categories");
formData.append("slug", "buy-electronics"); // Optional - for custom naming

const response = await fetch("/api/storage/upload", {
  method: "POST",
  body: formData,
});
```

#### **GET** `/api/storage/get` - Retrieve Image with Caching

**Purpose:** Retrieve images from Firebase Storage with intelligent browser and CDN caching

**Query Parameters:**

```typescript
interface ImageGetRequest {
  path: string; // Required - File path in storage (e.g., "categories/buy-electronics.jpg")
  cache?: number; // Optional - Cache duration in seconds (default: 86400)
}
```

**Response (200 OK):**

```
Content-Type: image/jpeg (or appropriate image type)
Cache-Control: public, max-age={cache_duration}, immutable
ETag: {firebase_etag}
Last-Modified: {date}
[Binary image data]
```

**Features:**

- Smart caching with configurable duration
- ETag support for 304 Not Modified responses
- CORS enabled for cross-origin requests
- Directory traversal protection
- Last-Modified header for cache validation

**Error Responses:**

- `400` - Invalid path parameter
- `404` - Image not found
- `500` - Server error

**Example Usage:**

```typescript
import { getImageUrl } from "@/lib/utils/storage";

// Use cached API endpoint (24-hour default cache)
const cachedUrl = getImageUrl("categories/buy-electronics.jpg");

// With custom cache duration (1 hour)
const cachedUrl = getImageUrl("categories/buy-electronics.jpg", true, 3600);
```

---

### **JWT Token Structure**

```typescript
interface JWTPayload {
  userId: string;
  email: string;
  role: "user" | "admin" | "seller";
  iat: number; // Issued at
  exp: number; // Expires at
}
```

### **Protected Endpoints**

| Endpoint           | Method | Required Role | Description           |
| ------------------ | ------ | ------------- | --------------------- |
| `GET /api/contact` | GET    | admin         | View contact messages |

### **Authentication Flow**

1. User logs in → JWT token stored in HTTP-only cookie
2. Client makes API request → Token automatically sent
3. Server validates token → Processes request or returns 401/403

---

## 📊 Error Handling Standards

### **HTTP Status Codes**

- `200` - OK (Successful GET, PUT, PATCH)
- `201` - Created (Successful POST)
- `400` - Bad Request (Invalid input data)
- `401` - Unauthorized (Authentication required)
- `403` - Forbidden (Insufficient permissions)
- `404` - Not Found (Resource doesn't exist)
- `422` - Unprocessable Entity (Validation errors)
- `500` - Internal Server Error (Server-side error)

### **Error Response Format**

```typescript
interface ErrorResponse {
  success: false;
  error: string; // Human-readable error message
  code?: string; // Error code for programmatic handling
  details?: any; // Additional error details
}
```

### **Validation Error Format**

```typescript
interface ValidationErrorResponse {
  success: false;
  error: "Validation failed";
  details: {
    field: string; // Field name
    message: string; // Validation error message
  }[];
}
```

---

## 🚀 Performance & Caching

### **Caching Strategy**

| Endpoint           | Cache Duration | Cache Type    |
| ------------------ | -------------- | ------------- |
| `/api/beyblades/*` | 1 year         | Browser + CDN |
| `/api/content`     | 1 hour         | Browser       |
| `/api/cookies`     | 24 hours       | Browser       |
| `/api/contact`     | No cache       | -             |
| `/api/errors`      | No cache       | -             |

### **Rate Limiting**

- Contact form: 5 submissions per hour per IP
- Error logging: 100 requests per minute per IP
- Asset serving: No limits (cached)

---

## 🔧 Integration Examples

### **Contact Form Integration**

```typescript
async function submitContactForm(formData: ContactRequest) {
  try {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const result = await response.json();

    if (result.success) {
      // Show success message with reference number
      alert(`Message sent! Reference: ${result.data.reference}`);
    } else {
      // Handle error
      alert(result.error);
    }
  } catch (error) {
    console.error("Contact form error:", error);
  }
}
```

### **Error Logging Integration**

```typescript
function logError(error: Error, context?: any) {
  fetch("/api/errors", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      metadata: context,
    }),
  }).catch(console.error);
}
```

### **Content Loading Integration**

```typescript
async function loadMarkdownContent(filePath: string) {
  try {
    const response = await fetch(
      `/api/content?file=${encodeURIComponent(filePath)}`
    );
    const { content, metadata } = await response.json();
    return { content, metadata };
  } catch (error) {
    console.error("Failed to load content:", error);
    return null;
  }
}
```

---

## 📝 Maintenance Guidelines

### **When Adding New Endpoints:**

1. Follow RESTful conventions
2. Implement proper error handling
3. Add TypeScript interfaces for request/response
4. Update this documentation
5. Add rate limiting if necessary
6. Consider caching strategy

### **Security Considerations:**

- Always validate input data
- Implement proper authentication/authorization
- Use parameterized queries to prevent injection
- Implement rate limiting for user-facing endpoints
- Log security-related events

### **Testing Requirements:**

- Unit tests for business logic
- Integration tests for database operations
- API endpoint tests for request/response validation
- Error handling tests for edge cases

---

_This documentation is automatically maintained and should be updated whenever API endpoints are added, modified, or removed._
