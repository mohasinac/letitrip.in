# Blog Resource

## Overview

Blog posts, categories, and tags for content marketing and SEO.

## Database Collections

- `blog_posts` - Blog articles
- `blog_categories` - Blog categories
- `blog_tags` - Blog tags

## API Routes

```
# Public Routes
/api/blog                    - GET       - List published posts
/api/blog/:slug              - GET       - Get post by slug
/api/blog/categories         - GET       - List categories
/api/blog/tags               - GET       - List tags
/api/blog/category/:slug     - GET       - Posts by category
/api/blog/tag/:slug          - GET       - Posts by tag

# Admin Routes
/api/admin/blog              - GET       - List all posts (inc. drafts)
/api/admin/blog              - POST      - Create post
/api/admin/blog/:id          - GET       - Get post by ID
/api/admin/blog/:id          - PUT       - Update post
/api/admin/blog/:id          - DELETE    - Delete post
/api/admin/blog/categories   - POST      - Create category
/api/admin/blog/categories/:id - PUT     - Update category
/api/admin/blog/categories/:id - DELETE  - Delete category
/api/admin/blog/tags         - POST      - Create tag
/api/admin/blog/tags/:id     - DELETE    - Delete tag
```

## Components

- `src/app/blog/` - Public blog pages
- `src/app/blog/[slug]/` - Single post page
- `src/app/admin/blog/` - Admin blog management
- `src/components/blog/` - Blog components

## Data Models

### BlogPost

```typescript
interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  categoryId: string;
  tags: string[];
  authorId: string;
  authorName: string;
  status: "draft" | "published" | "scheduled";
  publishedAt: Date | null;
  scheduledAt: Date | null;
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### BlogCategory

```typescript
interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  parentId: string | null;
  displayOrder: number;
  postCount: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### BlogTag

```typescript
interface BlogTag {
  id: string;
  name: string;
  slug: string;
  postCount: number;
  createdAt: Date;
}
```

## Related Epic

- E020: Blog System

## Test Files

| Test File                                      | Coverage         | Status         |
| ---------------------------------------------- | ---------------- | -------------- |
| `src/app/blog/page.test.tsx`                   | Blog list page   | ✅ Complete    |
| `src/app/blog/BlogListClient.test.tsx`         | Blog list client | ✅ Complete    |
| `src/app/blog/[slug]/BlogPostClient.test.tsx`  | Single post      | ✅ Complete    |
| `src/app/api/blog/blog.test.ts`                | Blog API         | ✅ Complete    |
| `src/app/api/admin/blog/(tests)/route.test.ts` | Admin blog API   | 📋 Placeholder |

## Status: 🟡 Partially Tested

- [x] User stories (E020)
- [x] API specifications
- [x] Public blog page tests
- [x] Blog client tests
- [ ] Admin blog tests (placeholder)
