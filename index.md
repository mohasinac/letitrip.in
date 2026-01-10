# Letitrip.in - Project Root Documentation

## Overview

Modern, scalable auction and e-commerce platform built for the Indian market. This is the root directory of the Next.js application with zero-cost infrastructure, production-ready setup, and 100% type-safe codebase.

## Project Information

- **Name**: letitrip-ecommerce
- **Version**: 1.0.0
- **Repository**: https://github.com/mohasinac/letitrip.in
- **Branch**: fix-ui
- **Framework**: Next.js 16.1+ with App Router
- **Build Status**: ✅ Passing (164/164 pages)

## Key Configuration Files

### Build & Development

#### `package.json`

- Main project configuration and dependency management
- Defines npm scripts for development, build, deployment, testing
- Dependencies: Next.js, React 19, Firebase, TypeScript, Tailwind CSS
- Dev dependencies: ESLint, Jest, Testing Library, TypeScript types

#### `next.config.js`

- Next.js framework configuration
- Build settings, environment variables, webpack customization
- Image optimization, redirects, and rewrites configuration
- Experimental features and performance optimization

#### `tsconfig.json`

- TypeScript compiler configuration
- Path aliases (@/ for src directory)
- Strict type checking enabled
- Compiler options for Next.js compatibility

#### `tailwind.config.js`

- Tailwind CSS configuration
- Custom theme, colors, and design tokens
- Plugin configurations (forms, typography)
- Content paths for class scanning

#### `postcss.config.js`

- PostCSS configuration for CSS processing
- Tailwind CSS integration
- Autoprefixer configuration

#### `eslint.config.mjs`

- ESLint configuration for code quality
- Next.js and React linting rules
- TypeScript ESLint integration
- Custom rules and overrides

### Firebase Configuration

#### `firebase.json`

- Firebase project configuration
- Hosting, Firestore, Functions, Storage settings
- Deployment configuration for Firebase services

#### `firestore.rules`

- Firestore security rules
- Access control for database collections
- Authentication and authorization logic

#### `firestore.indexes.json`

- Firestore composite indexes configuration
- Query optimization indexes
- Managed by Firebase CLI

#### `database.rules.json`

- Firebase Realtime Database security rules
- Used for real-time auction bidding system

#### `storage.rules`

- Firebase Storage security rules
- File upload and access control

### Testing Configuration

#### `jest.config.js`

- Jest testing framework configuration
- Test environment setup (jsdom)
- Module path mapping
- Coverage configuration

#### `jest.setup.js`

- Jest setup file for test environment
- Testing Library configuration
- Global test utilities and mocks

### Deployment Configuration

#### `vercel.json`

- Vercel deployment configuration
- Route rewrites and redirects
- Environment variable settings
- Build and runtime configuration

#### `server.js`

- Custom Node.js server (if needed)
- Express middleware for custom routes
- Rate limiting and security

### Code Quality

#### `sonar-project.properties`

- SonarQube/SonarCloud configuration
- Code quality analysis settings
- Coverage and test result paths

### Workspace

#### `letitrip-workspace.code-workspace`

- VS Code multi-root workspace configuration
- Settings and extensions for the workspace
- Folder configurations

## Directory Structure

### `/src` - Source Code

Main application source code directory containing all frontend and shared code.

**Subdirectories:**

- `app/` - Next.js App Router pages and layouts
- `components/` - Reusable React components
- `hooks/` - Custom React hooks
- `contexts/` - React Context providers for global state
- `services/` - API service classes and business logic
- `lib/` - Utility functions and helpers
- `types/` - TypeScript type definitions
- `config/` - Configuration files for services
- `constants/` - Application-wide constants
- `styles/` - Global CSS and design tokens
- `emails/` - Email templates (React Email)
- `templates/` - Other template files

**Documentation:** See `src/*/index.md` and `src/*/comments.md` for detailed documentation of each subdirectory.

### `/functions` - Firebase Cloud Functions

Backend serverless functions running on Firebase Cloud Functions.

**Key Files:**

- `src/index.ts` - Main entry point for all Cloud Functions
- `src/triggers/` - Firestore, Auth, and Realtime DB triggers
- `src/webhooks/` - External webhook handlers (Razorpay, Shiprocket)
- `src/notifications/` - Notification services (Email, WhatsApp)
- `src/services/` - Shared backend services
- `src/config/` - Backend configuration
- `package.json` - Functions dependencies (separate from main app)

**Purpose:**

- Handle database triggers (onCreate, onUpdate, onDelete)
- Process payment webhooks
- Send notifications (email, WhatsApp, push)
- Scheduled tasks (cron jobs)
- Admin operations

### `/scripts` - Utility Scripts

Development, deployment, and maintenance scripts.

**Subdirectories:**

- `cleanup/` - Code cleanup and migration scripts
- `database/` - Database migration and setup scripts
- `deployment/` - Deployment automation scripts
- `development/` - Development helper scripts
- `setup/` - Initial setup scripts

**Key Files:**

- `run-all-tests.ps1` - PowerShell script to run all tests
- `test-batches.ps1` - Run tests in batches
- `verify-tests.ps1` - Verify test suite integrity

### `/tests` - Test Suites

Comprehensive test suites for the application.

**Structure:**

- `src/` - Test files organized by feature/component
- `TDD/` - Test-Driven Development tests
- `package-ref.json` - Test configuration reference

**Types of Tests:**

- Unit tests for components, hooks, and utilities
- Integration tests for services and API routes
- End-to-end acceptance tests

### `/firestore-indexes` - Firestore Index Management

Firestore composite index definitions as JavaScript modules.

**Files:**

- Individual collection index files (users.js, products.js, etc.)
- `deploy-indexes.js` - Script to deploy indexes to Firestore
- `README.md` - Index management documentation

**Purpose:** Manage Firestore indexes as code for better version control and collaboration.

### `/public` - Static Assets

Public static files served directly by Next.js.

**Contents:**

- `manifest.json` - PWA manifest file
- `payments/` - Payment-related static assets
- Images, icons, favicons
- Robots.txt, sitemap.xml (generated)

### `/NDocs` - Technical Documentation

Comprehensive project documentation.

**Contents:**

- Architecture documentation
- State management guides
- API documentation
- Development guides
- Migration reports

### `/.next` - Next.js Build Output

Generated build files (gitignored, auto-generated on build).

### `/.vercel` - Vercel Deployment

Vercel deployment configuration and cache (gitignored).

### `/node_modules` - Dependencies

NPM dependencies (gitignored, generated on `npm install`).

### `/logs` - Application Logs

Runtime logs from Winston logger (gitignored).

## Environment Files

### `.env.local`

Local development environment variables (gitignored).

**Contains:**

- Firebase configuration
- API keys (Razorpay, Shiprocket, WhatsApp)
- Service credentials
- Feature flags

### `.env.development.local`

Development-specific environment variables.

### `.env.production`

Production environment variables (encrypted or managed in Vercel).

### `.env.example`

Template for required environment variables (committed to repo).

## Git Configuration

### `.gitignore`

Git ignore rules for the repository.

**Ignored:**

- `/node_modules`
- `/.next`
- `/logs`
- `.env.local`, `.env*.local`
- `.vercel`
- Build artifacts

### `.gitmodules`

Git submodules configuration (if any external modules are included).

## NPM Scripts

### Development

- `npm run dev` - Start development server with Turbopack
- `npm run type-check` - Run TypeScript type checking
- `npm run lint` - Run ESLint

### Build & Start

- `npm run build` - Build production bundle
- `npm start` - Start production server

### Testing

- `npm test` - Run all tests
- `npm run test:single` - Run tests with single worker
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:fast` - Fast test run with bail

### Deployment

- `npm run deploy` - Build and push to main branch
- `npm run deploy:prod` - Deploy to Vercel production
- `npm run deploy:firebase` - Deploy to Firebase
- `npm run deploy:vercel` - Deploy to Vercel (with script)

### Firebase

- `npm run setup:firebase-rules` - Deploy Firebase rules and indexes
- `npm run setup:firebase-functions` - Install Functions dependencies
- `npm run functions:build` - Build Cloud Functions
- `npm run functions:deploy` - Deploy Cloud Functions
- `npm run functions:logs` - View Functions logs

### Firestore Indexes

- `npm run indexes:deploy` - Deploy Firestore indexes
- `npm run indexes:dry-run` - Preview index changes
- `npm run indexes:build` - Build index definitions

### Database

- `npm run db:migrate-categories` - Migrate category structure
- `npm run db:setup-test-users` - Setup test user accounts

### Environment

- `npm run sync:env` - Sync environment variables to Vercel
- `npm run sync:env:bulk` - Bulk update Vercel environment variables
- `npm run setup:vercel` - Setup Vercel environment
- `npm run setup:resend` - Setup Resend API

### Development Tools

- `npm run dev:check-warnings` - Check for warnings in code
- `npm run dev:fix-async-params` - Fix async params issues
- `npm run dev:fix-ts-errors` - Fix TypeScript errors
- `npm run dev:sonar` - Run SonarQube analysis
- `npm run prettier` - Format code with Prettier
- `npm run clean` - Clean build artifacts
- `npm run clean:logs` - Clean log files

## Technology Stack

### Core Framework

- **Next.js 16.1+** - React framework with App Router
- **React 19.2** - UI library
- **TypeScript 5.3+** - Type-safe development

### Backend & Database

- **Firebase** - Backend-as-a-Service
  - Firestore - NoSQL database
  - Authentication - User management
  - Storage - File storage
  - Realtime Database - Live bidding
  - Cloud Functions - Serverless backend

### Styling

- **Tailwind CSS 3.4+** - Utility-first CSS framework
- **PostCSS** - CSS processing
- **CSS Custom Properties** - Design tokens

### State Management

- **React Context API** - Global state
- **Custom Hooks** - Shared logic
- **React Hook Form** - Form state

### UI Components

- **Lucide React** - Icons
- **React Quill** - Rich text editor
- **React Easy Crop** - Image cropping
- **Recharts** - Data visualization
- **React D3 Tree** - Tree visualization
- **DnD Kit** - Drag and drop

### Form Management

- **React Hook Form** - Form state and validation
- **Zod** - Schema validation
- **Hookform Resolvers** - Validation integration

### Payments

- **Razorpay** - Payment gateway (primary)
- **PayPal** - International payments
- Cash on Delivery support

### Shipping

- **Shiprocket API** - Shipping aggregator
- Multi-courier support
- Rate calculation and tracking

### Communications

- **WhatsApp Business API** - Customer notifications
- **Resend** - Transactional emails
- **React Email** - Email templates

### Internationalization

- **i18next** - i18n framework
- **react-i18next** - React integration
- **next-i18next** - Next.js integration

### Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** - Testing framework
- **Testing Library** - Component testing
- **TypeScript ESLint** - TypeScript linting

### DevOps & Deployment

- **Vercel** - Frontend hosting (primary)
- **Firebase Hosting** - Alternative hosting
- **GitHub Actions** - CI/CD (in .github/)
- **SonarQube** - Code quality analysis

### Logging & Monitoring

- **Winston** - Logging library
- **Firebase Analytics** - User analytics
- **Firebase Performance** - Performance monitoring

### Security

- **Firebase Security Rules** - Database access control
- **Express Rate Limit** - API rate limiting
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT tokens

### Utilities

- **date-fns** - Date manipulation
- **clsx** - Class name utility
- **tailwind-merge** - Merge Tailwind classes
- **use-debounce** - Debounce hook
- **cookie** - Cookie parsing
- **Sonner** - Toast notifications

## Project Features

### E-commerce

- Multi-vendor marketplace
- Product catalog with categories
- Shopping cart
- Checkout process
- Order management
- Payment integration
- Shipping integration

### Auction System

- Live bidding (Realtime Database)
- Multiple auction types (Regular, Reverse, Silent)
- Auto-bidding
- Bid history
- Winner notification

### User Management

- Authentication (Email, Google, Phone)
- User profiles
- Seller accounts
- Admin dashboard
- Role-based access control

### Content Management

- Blog system
- FAQ management
- Support tickets
- Reviews and ratings
- Product reviews

### Notifications

- Email notifications
- WhatsApp notifications
- Push notifications
- In-app notifications

### Search & Discovery

- Product search
- Category browsing
- Filters and sorting
- Comparison feature
- Viewing history

### Analytics & Reporting

- User analytics
- Sales reports
- Auction analytics
- Performance monitoring

## Development Workflow

1. **Setup**: Clone repo, run `npm install`, configure `.env.local`
2. **Development**: Run `npm run dev` to start dev server
3. **Testing**: Run `npm test` to execute test suite
4. **Type Checking**: Run `npm run type-check` for TypeScript errors
5. **Linting**: Run `npm run lint` to check code quality
6. **Build**: Run `npm run build` to create production build
7. **Deploy**: Run appropriate deploy script for target environment

## Architecture Highlights

- **App Router**: Next.js 13+ App Router for modern routing
- **Server Components**: React Server Components for better performance
- **API Routes**: Next.js API routes for backend logic
- **Edge Functions**: Vercel Edge Functions for global performance
- **Static Generation**: ISR for product pages
- **Client-Side Rendering**: For dynamic auction pages

## Documentation Structure

- **Root**: `index.md` (this file), `comments.md`
- **Each Subdirectory**: Has its own `index.md` and `comments.md`
- **Main Documentation**: `/NDocs` folder for comprehensive guides
- **API Documentation**: In `/NDocs/api`
- **Component Documentation**: In respective `index.md` files

## Getting Started

1. Read `/NDocs/getting-started/AI-AGENT-GUIDE.md` for AI development
2. Review main `README.md` for project overview
3. Check `/NDocs` for detailed documentation
4. Explore `src/*/index.md` files for code documentation
5. Run `npm run dev` and start building!

## License

Proprietary - All rights reserved

## Support

For questions or issues, check `/NDocs` or contact the development team.
