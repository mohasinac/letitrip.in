# Documentation

Organized documentation for JustForView.in platform.

## Quick Start

- **New Developers**: Start with [project/00-QUICK-START.md](project/00-QUICK-START.md)
- **Architecture**: Read [project/01-ARCHITECTURE-OVERVIEW.md](project/01-ARCHITECTURE-OVERVIEW.md)
- **AI Agent Guide**: See [ai/AI-AGENT-GUIDE.md](ai/AI-AGENT-GUIDE.md)

## Directory Structure

### `/type-system`

Type system migration and implementation documentation.

- [TYPE-MIGRATION-GUIDE.md](type-system/TYPE-MIGRATION-GUIDE.md) - Complete guide for type system migration
- [TYPE-REFACTOR-PLAN.md](type-system/TYPE-REFACTOR-PLAN.md) - Original refactor planning document
- [TYPE-SYSTEM-FINAL-CHECKLIST.md](type-system/TYPE-SYSTEM-FINAL-CHECKLIST.md) - Final completion checklist
- [TYPE-MISMATCH-ACTION-PLAN.md](type-system/TYPE-MISMATCH-ACTION-PLAN.md) - Action plan for type mismatches

### `/migration`

Infrastructure and feature migration guides.

- [MIGRATION-VERCEL-TO-FIREBASE-CRON.md](migration/MIGRATION-VERCEL-TO-FIREBASE-CRON.md) - Vercel to Firebase Functions cron migration
- [MIGRATION-GUIDE-MULTI-PARENT-CATEGORIES.md](migration/MIGRATION-GUIDE-MULTI-PARENT-CATEGORIES.md) - Multi-parent categories migration

### `/features`

Feature implementation documentation.

- [IMPLEMENTATION-SUMMARY-CATEGORY-CREATE.md](features/IMPLEMENTATION-SUMMARY-CATEGORY-CREATE.md) - Category creation feature
- [IMPLEMENTATION-SUMMARY-MULTI-PARENT-CATEGORIES.md](features/IMPLEMENTATION-SUMMARY-MULTI-PARENT-CATEGORIES.md) - Multi-parent categories
- [IMPLEMENTATION-SUMMARY-TEST-WORKFLOW.md](features/IMPLEMENTATION-SUMMARY-TEST-WORKFLOW.md) - Test workflow system (removed)

### `/project`

Core project documentation.

- [00-QUICK-START.md](project/00-QUICK-START.md) - Getting started guide
- [01-ARCHITECTURE-OVERVIEW.md](project/01-ARCHITECTURE-OVERVIEW.md) - System architecture
- [02-SERVICE-LAYER-GUIDE.md](project/02-SERVICE-LAYER-GUIDE.md) - Service layer patterns
- [03-COMPONENT-PATTERNS.md](project/03-COMPONENT-PATTERNS.md) - Component best practices

### `/ai`

AI agent and development guides.

- [AI-AGENT-GUIDE.md](ai/AI-AGENT-GUIDE.md) - Guide for AI agents working on this project

### `/archive`

Historical progress tracking and old documentation.

- Phase progress updates
- Session summaries
- Checklists
- Quick reference guides

## Key Features

### Type System

- **Frontend Types**: User-facing data structures
- **Backend Types**: Firebase document structures
- **Transform Functions**: Bidirectional conversion between FE/BE types
- **Entities**: Product, User, Order, Cart, Auction, Category, Shop, Review, Coupon, SupportTicket, Return

### Firebase Functions

- **Scheduled Functions**: Auction processing (every 1 minute)
- **Region**: asia-south1 (Mumbai) for low latency
- **Memory**: 1GB allocation
- **Timeout**: 9 minutes

### Service Layer

- 11 services with consistent patterns
- Type-safe transformations
- Error handling and validation
- Firestore integration

## Development Workflow

1. **Setup**: Follow [project/00-QUICK-START.md](project/00-QUICK-START.md)
2. **Architecture**: Understand [project/01-ARCHITECTURE-OVERVIEW.md](project/01-ARCHITECTURE-OVERVIEW.md)
3. **Services**: Read [project/02-SERVICE-LAYER-GUIDE.md](project/02-SERVICE-LAYER-GUIDE.md)
4. **Components**: Follow [project/03-COMPONENT-PATTERNS.md](project/03-COMPONENT-PATTERNS.md)

## Firebase Functions

### Setup

```bash
npm run setup:firebase-functions
```

### Build & Deploy

```bash
npm run functions:build
npm run functions:deploy
```

### Local Development

```bash
npm run functions:serve
```

### Monitoring

```bash
npm run functions:logs
```

## Build & Deploy

### Next.js Build

```bash
npm run build
```

### Firebase Deploy

```bash
npm run deploy:firebase
```

## Contact

For questions or issues, refer to the appropriate documentation section above.
