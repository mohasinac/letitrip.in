---
applyTo: "src/**/*.tsx"
description: "MediaImage, MediaVideo, MediaAvatar, MediaGallery — all media rendering. Rule 28."
---

# Media Display Rules

## RULE 28: All Media Through Primitives

NEVER use raw `<img>`, `<video>`, or `<picture>`. ALWAYS use the four media primitives from `@/components`. Each fills its **parent container** — parent must be `relative overflow-hidden` with an aspect ratio.

| Component          | Use for                        | Key props                                                         |
| ------------------ | ------------------------------ | ----------------------------------------------------------------- |
| `<MediaImage />`   | Any static image               | `src: string`, `alt: string`, `size?`, `priority?`                |
| `<MediaVideo />`   | Video playback on detail pages | `src`, `thumbnailUrl?`, `controls?`, `autoPlayMuted?`, `loop?`    |
| `<MediaAvatar />`  | User/seller/brand avatars      | `src`, `alt`, `size?: 'sm' \| 'md' \| 'lg' \| 'xl'`               |
| `<MediaGallery />` | Multi-image sets               | `items: MediaRecord[]`, `layout?: 'grid' \| 'masonry' \| 'strip'` |

### MediaImage `size` Presets

`thumbnail` · `card` (default) · `hero` (+ `priority`) · `banner` (+ `priority`) · `gallery` · `avatar`

### Parent Container Sizing (your responsibility)

```typescript
// Square card
<div className="relative aspect-square overflow-hidden rounded-xl">
  <MediaImage src={url} alt={text} size="card" />
</div>

// Video player
<div className="relative aspect-video overflow-hidden rounded-xl">
  <MediaVideo src={url} thumbnailUrl={thumb} controls />
</div>

// Hero banner
<div className="relative aspect-[21/9] overflow-hidden">
  <MediaImage src={url} alt={text} size="hero" priority />
</div>

// Avatar
<div className="relative w-8 h-8 rounded-full overflow-hidden">
  <MediaAvatar src={url} alt={name} size="sm" />
</div>
```

Use `aspect-*` classes — NEVER fixed `h-[px]` or `w-[px]` for containers.

### Video-First Card Pattern

**NEVER embed `<MediaVideo>` in a card.** Cards show thumbnail + play overlay; video plays on detail page.

```typescript
const hasVideo = Boolean(product.video?.url);
const mediaSrc = product.video?.thumbnailUrl || product.mainImage;

<div className="relative aspect-square overflow-hidden">
  <MediaImage src={mediaSrc} alt={product.title} size="card"
    className="group-hover:scale-110 transition-transform duration-300" />
  {hasVideo && (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <Span className="bg-black/50 text-white rounded-full w-10 h-10 flex items-center justify-center">▶</Span>
    </div>
  )}
</div>
```

Apply to: `ProductCard`, `AuctionCard`, `SellerProductCard`, `EventCard`.

### Rules

- `alt` on `MediaImage`/`MediaVideo` is **required** — never omit, never empty for content images
- Empty `alt=""` only for purely decorative images
- `priority` only for above-the-fold hero/banner images
- Props are `src` (string) and `alt` (string) — NOT a `media` object prop
- All uploads include `MediaDisplayMeta` with seoContext, crop, zoom, focal point
