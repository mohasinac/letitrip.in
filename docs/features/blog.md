# Blog Feature

**Feature path:** `src/features/blog/`  
**Repository:** `blogRepository`  
**Service:** `blogService`  
**Actions:** `createBlogPostAction`, `updateBlogPostAction`, `deleteBlogPostAction`

---

## Overview

The blog supports long-form content articles with categories, rich text, SEO metadata, and related posts.

---

## Public Pages

### `BlogListView` (`/blog`)

Paginated blog article listing:

- `BlogCategoryTabs` — filter by category (All, News, Guides, Reviews, etc.)
- `BlogFeaturedCard` — highlighted featured post at the top
- Grid of `BlogCard` components
- URL-driven page navigation

**Data:** `useBlogPosts(params)` → `blogService.list(params)` → `GET /api/blog`

### `BlogPostView` (`/blog/[slug]`)

Full article page:

- SSR with `generateMetadata` for SEO (title, OG, JSON-LD `Article` schema)
- Cover image via `MediaImage`
- Author name + publish date
- Rich text body rendered via `proseMirrorToHtml` (in `string.formatter.ts`)
- Category tags
- Related posts strip
- Social share buttons

**SSR data:** `blogRepository.getBySlug(slug)` called directly in page RSC.  
**Client data:** `useBlogPost(slug)` for stale-while-revalidate.

---

## Blog Components

### `BlogCard` — `src/components/BlogCard.tsx`

Listing card showing:

- Cover image (cropped `16:9`)
- Category badge (`CATEGORY_BADGE` colour map)
- Title (truncated to 2 lines)
- Excerpt (truncated to 3 lines)
- Author + date
- Read time estimate

### `BlogFeaturedCard`

Larger hero-style variant with full-width cover image overlay.

### `BlogCategoryTabs`

Tab strip built with `SectionTabs`. Active tab updates URL `?category=` param which drives `BlogListView` filter.

### `BlogArticlesSection` (Homepage)

`src/features/homepage/components/BlogArticlesSection.tsx`  
Shows 3–4 recent blog posts on the homepage. Data: `useBlogArticles()`.

---

## Admin Management

### `AdminBlogView` (`/admin/blog`)

DataTable of all blog posts with `BlogFilters`.  
**Filters:** status (draft/published), category, date, search by title.

### `BlogForm` (in `features/admin`)

Drawer form for create/edit:

| Field                        | Type                             |
| ---------------------------- | -------------------------------- |
| Title                        | text                             |
| Slug                         | text (auto-generated from title) |
| Status                       | select (draft / published)       |
| Categories                   | multi-select                     |
| Cover Image                  | `MediaUploadField`               |
| Excerpt                      | textarea                         |
| Body                         | `RichTextEditor` (ProseMirror)   |
| Publish Date                 | date picker                      |
| SEO Title / Meta Description | text                             |

**Actions:** `createBlogPostAction`, `updateBlogPostAction`, `deleteBlogPostAction`

---

## `RichTextEditor`

`src/features/admin/components/RichTextEditor.tsx`

ProseMirror-based rich text editor. Features:

- Bold, italic, underline, strikethrough
- Headings (H2–H4)
- Bullet and numbered lists
- Blockquote
- Hyperlinks (allowlist-validated to prevent XSS)
- Image embed
- Code block

Stores content as ProseMirror JSON in Firestore. Rendered on the public blog post via `proseMirrorToHtml()` (XSS-safe via `escapeHtml`).

---

## Hooks

| Hook                        | Description               |
| --------------------------- | ------------------------- |
| `useBlogPosts(params)`      | Paginated blog listing    |
| `useBlogPost(slug)`         | Single blog post by slug  |
| `useBlogArticles()`         | Homepage recent articles  |
| `useAdminBlog(sieveParams)` | Admin paginated blog list |

---

## API Routes

| Method   | Route                  | Description         |
| -------- | ---------------------- | ------------------- |
| `GET`    | `/api/blog`            | Public blog listing |
| `GET`    | `/api/blog/[slug]`     | Single blog post    |
| `POST`   | `/api/admin/blog`      | Create post         |
| `GET`    | `/api/admin/blog/[id]` | Admin post detail   |
| `PATCH`  | `/api/admin/blog/[id]` | Update post         |
| `DELETE` | `/api/admin/blog/[id]` | Delete post         |

---

## SEO

Blog post pages use `generateBlogMetadata` from `src/constants/seo.ts`:

- `<title>` — post title + site name
- `og:title`, `og:description`, `og:image` (cover image)
- `article:published_time`, `article:author`
- JSON-LD `Article` schema
