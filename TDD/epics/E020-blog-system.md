# Epic E020: Blog System

## Overview

Content management system for blog posts, enabling admins to create, edit, and publish articles with categories and tags.

## Scope

- Blog post CRUD operations
- Blog categories management
- Blog tags management
- Featured blog posts
- Blog post scheduling
- Blog comments (optional)

## User Roles Involved

- **Admin**: Full blog management access
- **Seller**: No access (read-only on public blog)
- **User**: Read blog posts, leave comments
- **Guest**: Read public blog posts

---

## Features

### F020.1: Blog Post Management

**US020.1.1**: Create Blog Post (Admin)

```
Fields:
- Title
- Slug (auto-generated, editable)
- Content (rich text)
- Excerpt/Summary
- Featured image
- Category (single)
- Tags (multiple)
- Author
- Status (draft, published, scheduled)
- Published date
- SEO meta (title, description)
```

**US020.1.2**: Edit Blog Post (Admin)

- Update any field
- Preview before publishing
- Version history (optional)

**US020.1.3**: Delete Blog Post (Admin)

- Soft delete
- Permanent delete option

**US020.1.4**: Publish/Unpublish Blog Post (Admin)

- Toggle visibility
- Schedule for future publication

### F020.2: Blog Category Management

**US020.2.1**: Create Blog Category (Admin)

```
Fields:
- Name
- Slug
- Description
- Parent category (optional)
- Display order
```

**US020.2.2**: Edit Blog Category (Admin)
**US020.2.3**: Delete Blog Category (Admin)

- Only if no posts assigned
- Option to reassign posts

### F020.3: Blog Tag Management

**US020.3.1**: Create Blog Tag (Admin)

```
Fields:
- Name
- Slug
```

**US020.3.2**: Edit Blog Tag (Admin)
**US020.3.3**: Delete Blog Tag (Admin)
**US020.3.4**: Merge Tags (Admin)

### F020.4: Blog Display

**US020.4.1**: View Blog List (All Users)

- Paginated list
- Filter by category
- Filter by tag
- Sort by date

**US020.4.2**: View Blog Post (All Users)

- Full content
- Related posts
- Share buttons
- Author info

**US020.4.3**: Featured Blog Posts on Homepage

- Admin configurable
- Maximum 3-6 posts

### F020.5: Blog SEO

**US020.5.1**: Auto-generate SEO metadata
**US020.5.2**: Custom SEO fields per post
**US020.5.3**: Sitemap generation

---

## API Endpoints

| Method | Endpoint                         | Description          | Auth   |
| ------ | -------------------------------- | -------------------- | ------ |
| GET    | `/api/blog`                      | List published posts | Public |
| GET    | `/api/blog/:slug`                | Get post by slug     | Public |
| POST   | `/api/admin/blog`                | Create blog post     | Admin  |
| PUT    | `/api/admin/blog/:id`            | Update blog post     | Admin  |
| DELETE | `/api/admin/blog/:id`            | Delete blog post     | Admin  |
| GET    | `/api/blog/categories`           | List categories      | Public |
| POST   | `/api/admin/blog/categories`     | Create category      | Admin  |
| PUT    | `/api/admin/blog/categories/:id` | Update category      | Admin  |
| DELETE | `/api/admin/blog/categories/:id` | Delete category      | Admin  |
| GET    | `/api/blog/tags`                 | List tags            | Public |
| POST   | `/api/admin/blog/tags`           | Create tag           | Admin  |
| DELETE | `/api/admin/blog/tags/:id`       | Delete tag           | Admin  |

---

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

---

## UI Components

### Admin Pages

| Page            | Route                    | Description            |
| --------------- | ------------------------ | ---------------------- |
| Blog Posts List | `/admin/blog`            | All posts with filters |
| Create Post     | `/admin/blog/create`     | Blog post editor       |
| Edit Post       | `/admin/blog/:id/edit`   | Edit existing post     |
| Blog Categories | `/admin/blog/categories` | Category management    |
| Blog Tags       | `/admin/blog/tags`       | Tag management         |

### Public Pages

| Page           | Route                  | Description       |
| -------------- | ---------------------- | ----------------- |
| Blog Home      | `/blog`                | List of posts     |
| Blog Post      | `/blog/:slug`          | Single post view  |
| Category Posts | `/blog/category/:slug` | Posts by category |
| Tag Posts      | `/blog/tag/:slug`      | Posts by tag      |

---

## Acceptance Criteria

### AC020.1: Blog Post Creation

- [ ] Admin can create a new blog post with all required fields
- [ ] Slug is auto-generated from title
- [ ] Content supports rich text formatting
- [ ] Featured image can be uploaded
- [ ] Post can be saved as draft
- [ ] Post can be scheduled for future publication

### AC020.2: Blog Post Display

- [ ] Published posts appear on `/blog` page

### AC020.2: Blog Post Display

- [x] Published posts appear on `/blog` page
- [x] Posts are paginated (10 per page)
- [x] Posts can be filtered by category
- [ ] Posts can be filtered by tag
- [x] Single post displays full content
- [ ] Related posts are shown

### AC020.3: Category Management

- [x] Admin can create categories
- [x] Categories have unique slugs
- [x] Categories can be nested (parent-child)
- [x] Post count is displayed per category

### AC020.4: SEO

- [x] Each post has meta title and description
- [x] Blog posts are included in sitemap
- [x] Open Graph tags are generated

---

## Implementation Status

**Status**: ✅ COMPLETE (Core features tested)

**Implemented**:

- Blog post CRUD (create, read, update, delete)
- Category filtering
- Status management (draft, published)
- Featured image support
- View count tracking
- Admin blog management page

**Pending**:

- Tag filtering
- Related posts
- Blog post scheduling
- Comments system

---

## Test Documentation

### Unit Tests

| Test File                                      | Status | Coverage              |
| ---------------------------------------------- | ------ | --------------------- |
| `src/app/api/blog/blog.test.ts`                | ✅     | Blog API (CRUD)       |
| `src/app/blog/page.test.tsx`                   | ✅     | Blog list page        |
| `src/app/blog/BlogListClient.test.tsx`         | ✅     | Blog list component   |
| `src/app/blog/[slug]/BlogPostClient.test.tsx`  | ✅     | Single post component |
| `src/app/admin/blog/(tests)/page.test.tsx`     | ✅     | Admin blog page       |
| `src/app/api/admin/blog/(tests)/route.test.ts` | 📋     | Extended features     |

### Integration Tests

| Test File                                     | Coverage           |
| --------------------------------------------- | ------------------ |
| `TDD/acceptance/E020-blog-acceptance.test.ts` | Full blog workflow |

---

## Dependencies

- E012: Media Management (image uploads)
- E014: Homepage CMS (featured blogs section)
- E001: User Management (author info)

---

## Implementation Notes

1. Use markdown or rich text editor (e.g., TipTap, Slate)
2. Implement reading time calculation
3. Consider image optimization for blog images
4. Implement social sharing buttons
5. RSS feed generation (optional)
