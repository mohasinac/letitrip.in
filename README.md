# JustForView E-commerce Platform

Modern, feature-rich e-commerce platform built with Next.js 15, TypeScript, Firebase, and Tailwind CSS.

## 🚀 Features

### Backend

- ✅ **Rate Limiting**: Supports 200 concurrent users with sliding window algorithm
- ✅ **Caching**: In-memory cache with ETag support for efficient API responses
- ✅ **Error Logging**: Winston-based logging system with multiple transports
- ✅ **Firebase Integration**: Admin SDK for backend, Client SDK for frontend
- ✅ **Authentication API**: Secure login/register endpoints with password hashing
- ✅ **Middleware Composition**: Easily compose rate limiting, caching, and logging

### Frontend

- ✅ **Error Boundaries**: Comprehensive error handling for 404, 500, and 401 errors
- ✅ **Authentication Pages**: Beautiful login and register pages
- ✅ **Auth Service**: Service layer for API communication
- ✅ **Auth Guard**: Protected route component with role-based access
- ✅ **Responsive Design**: Mobile-first Tailwind CSS design
- ✅ **Modern UI**: Gradient backgrounds, smooth transitions, loading states

## 📁 Project Structure

```
justforview.in/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── lib/
│   │   │   │   └── firebase/
│   │   │   │       ├── config.ts      # Firebase Admin SDK
│   │   │   │       └── app.ts         # Firebase Client SDK
│   │   │   ├── middleware/
│   │   │   │   ├── index.ts           # Middleware composer
│   │   │   │   ├── ratelimiter.ts     # Rate limiting
│   │   │   │   ├── cache.ts           # Caching
│   │   │   │   └── logger.ts          # Error logging
│   │   │   ├── auth/
│   │   │   │   ├── login/route.ts     # Login endpoint
│   │   │   │   └── register/route.ts  # Register endpoint
│   │   │   └── health/route.ts        # Health check endpoint
│   │   ├── login/page.tsx             # Login page
│   │   ├── register/page.tsx          # Register page
│   │   ├── unauthorized/page.tsx      # 401 error page
│   │   ├── not-found.tsx              # 404 error page
│   │   ├── error.tsx                  # Error boundary
│   │   ├── global-error.tsx           # Global error boundary
│   │   └── layout.tsx                 # Root layout
│   ├── components/
│   │   ├── auth/
│   │   │   └── AuthGuard.tsx          # Protected route component
│   │   └── layout/                    # Layout components
│   └── services/
│       ├── api.service.ts             # HTTP client
│       └── auth.service.ts            # Auth service
├── logs/                              # Application logs
├── docs/
│   └── API.md                         # API documentation
├── .env.example                       # Environment variables template
└── package.json
```

## 🛠️ Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your Firebase credentials:

```env
# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Key\n-----END PRIVATE KEY-----\n"

# Firebase Client SDK
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### 3. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing
3. Enable Authentication > Email/Password
4. Create Firestore Database
5. Generate service account key:
   - Go to Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Copy credentials to `.env.local`

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📚 API Documentation

See [docs/API.md](docs/API.md) for complete API documentation.

### Quick Start

#### Register a User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123",
    "name": "John Doe"
  }'
```

#### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123"
  }'
```

#### Health Check

```bash
curl http://localhost:3000/api/health
```

## 🔒 Authentication Flow

1. User submits credentials via `/login` or `/register` page
2. Request goes through middleware (rate limiting, logging)
3. Backend verifies credentials with Firebase
4. Custom token is generated and returned
5. Token and user data stored in localStorage
6. `AuthGuard` component protects authenticated routes
7. `apiService` adds token to all subsequent requests

## 🛡️ Error Handling

### UI Error Boundaries

- **`error.tsx`**: Catches errors in app routes
- **`global-error.tsx`**: Catches errors in root layout
- **`not-found.tsx`**: Custom 404 page
- **`unauthorized/page.tsx`**: Custom 401 page

### API Error Responses

All API errors follow this format:

```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

Common status codes:

- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid credentials)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `429`: Too Many Requests (rate limit exceeded)
- `500`: Internal Server Error

## 🧪 Testing

### Test API Endpoints

```bash
# Health check
curl http://localhost:3000/api/health

# Register (should work)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123","name":"Test User"}'

# Login (should work after registration)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'
```

### Test Rate Limiting

Run this script to test rate limiting (PowerShell):

```powershell
1..20 | ForEach-Object {
  Invoke-WebRequest -Uri "http://localhost:3000/api/health" -Method GET
  Write-Host "Request $_"
}
```

After 200 requests in 1 minute, you should get a 429 response.

## 📦 Production Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔧 Configuration

### Rate Limiting

Edit `src/app/api/middleware/ratelimiter.ts`:

```typescript
const config = {
  maxRequests: 200, // Change this
  windowMs: 60000, // Or this
};
```

### Caching

Edit `src/app/api/middleware/cache.ts`:

```typescript
const config = {
  ttl: 300000, // Change cache TTL (ms)
};
```

### Logging

Edit `src/app/api/middleware/logger.ts`:

```typescript
// Change log level
level: process.env.LOG_LEVEL || "debug",
  // Add custom transports
  logger.add(new winston.transports.Console());
```

## 🎨 Customization

### Styling

All pages use Tailwind CSS. Edit component classes to customize:

- **Colors**: Gradient colors in login/register pages
- **Layout**: Responsive breakpoints
- **Components**: Reusable UI components in `src/components/`

### Add Protected Route

```tsx
import AuthGuard from "@/components/auth/AuthGuard";

export default function ProtectedPage() {
  return (
    <AuthGuard requireAuth={true} allowedRoles={["user", "admin"]}>
      <div>Protected content</div>
    </AuthGuard>
  );
}
```

## 📊 Monitoring

### Log Files

- `logs/error.log`: Error-level logs
- `logs/api.log`: API request/response logs
- `logs/combined.log`: All logs

### Metrics

Check rate limit headers in responses:

- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🔗 Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Winston Logger](https://github.com/winstonjs/winston)

## 📧 Support

For support, email support@justforview.in or open an issue.
