# Hero Slides Rich Text Editor - Implementation Guide

## Overview

Hero slides now support **Rich Text Editing** for subtitle and description fields. Admins can format text with bold, italic, underline, links, and more directly from the admin panel.

## Features Implemented

### 1. Rich Text Editor Integration

**Subtitle Field:**

- Basic formatting: Bold, Italic, Underline
- Link insertion
- Clear formatting option
- Smaller toolbar for concise text

**Description Field:**

- Full formatting options: Bold, Italic, Underline, Strikethrough
- Headings (H1, H2, H3)
- Lists (Bullet and Numbered)
- Blockquotes
- Links
- Undo/Redo support

### 2. Admin Interface Updates

**Create Page** (`/admin/hero-slides/create`)

- Rich text editor for subtitle (120px height)
- Rich text editor for description (150px height)
- Real-time formatting preview
- Limited tools for subtitle to keep it concise

**Edit Page** (`/admin/hero-slides/[id]/edit`)

- Same rich text capabilities as create page
- Preserves existing HTML formatting
- Visual editing of existing content

### 3. Frontend Display

**HeroCarousel Component**

- Renders HTML content safely with `dangerouslySetInnerHTML`
- Styled with Tailwind prose classes
- Custom CSS for inverted (light on dark) theme
- Responsive typography

### 4. API Endpoints

**Admin Endpoints** (Auth Required)

```
GET    /api/admin/hero-slides          - List all slides
POST   /api/admin/hero-slides          - Create slide
GET    /api/admin/hero-slides/[id]     - Get single slide
PATCH  /api/admin/hero-slides/[id]     - Update slide
DELETE /api/admin/hero-slides/[id]     - Delete slide
POST   /api/admin/hero-slides/reorder  - Reorder slides
```

**Public Endpoint** (No Auth)

```
GET /api/homepage/hero-slides - Get active slides for display
```

## Data Structure

### Hero Slide Schema

```typescript
{
  id: string;
  title: string; // Plain text (required)
  subtitle: string; // Rich text HTML
  description: string; // Rich text HTML
  image_url: string; // Image URL (required)
  link_url: string; // Click destination
  cta_text: string; // Button text
  position: number; // Display order
  is_active: boolean; // Show/hide
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}
```

### Frontend Mapping

The public API transforms data for frontend consumption:

```typescript
{
  id: string;
  image: string; // image_url
  title: string; // title
  subtitle: string; // subtitle (HTML)
  description: string; // description (HTML)
  ctaText: string; // cta_text
  ctaLink: string; // link_url
  order: number; // position
  enabled: boolean; // is_active
}
```

## Usage Guide

### Creating a Hero Slide

1. Navigate to **Admin Panel** → **Hero Slides** → **Add Slide**
2. Enter plain text **Title** (displayed as main headline)
3. Use rich text editor for **Subtitle**:
   - Add emphasis with **bold** or _italic_
   - Insert links to specific pages
   - Keep concise (1-2 lines)
4. Use rich text editor for **Description**:
   - Format with headings, lists, blockquotes
   - Add detailed information
   - Use links for additional resources
5. Upload **Image** (required, 1920x1080 recommended)
6. Set **Link URL** (where users go on click)
7. Customize **CTA Button Text** (default: "Shop Now")
8. Toggle **Active** status
9. Click **Create Slide**

### Editing a Hero Slide

1. Navigate to **Admin Panel** → **Hero Slides**
2. Click **Edit** icon on any slide
3. Modify content using rich text editors
4. HTML formatting is preserved
5. Preview changes before saving
6. Click **Save Changes**

### Content Best Practices

#### Subtitle (Rich Text)

```html
<!-- Good Examples -->
<p><strong>Authentic Beyblades</strong> from Japan</p>
<p>Pokemon TCG • Yu-Gi-Oh • <em>Transformers</em></p>
<p>Zero Customs • <a href="/shipping">Fast Delivery</a></p>

<!-- Keep It Short -->
- 1-2 lines maximum - Use bold for emphasis - Links for important pages
```

#### Description (Rich Text)

```html
<!-- Good Examples -->
<h2>Limited Time Offer</h2>
<ul>
  <li>50% off all Pokemon cards</li>
  <li>Free shipping over ₹1000</li>
  <li>Exclusive items available</li>
</ul>

<blockquote>
  "India's most trusted collectibles store" - Our Customers
</blockquote>

<p>Shop now and get <strong>instant rewards</strong>!</p>
```

## Styling & Display

### Desktop Display

- Large hero section (600px height)
- Full width with gradient overlay
- Text on left side with image background
- Subtitle displayed prominently below title
- CTA button at bottom

### Mobile Display

- Reduced height (400px)
- Text remains readable
- Smaller font sizes
- Responsive image scaling
- Touch-friendly controls

### Rich Text Styling

The carousel applies special CSS for rich text:

```css
/* Light text on dark background */
.prose-invert p {
  margin: 0;
  display: inline;
}
.prose-invert strong {
  font-weight: 700;
  color: #fff;
}
.prose-invert em {
  font-style: italic;
}
.prose-invert a {
  color: #fbbf24;
  text-decoration: underline;
}
```

## Examples

### Marketing Slide

```
Title: "India's #1 Collectibles Store"
Subtitle: <p>Authentic <strong>Beyblades</strong>, <strong>Pokemon TCG</strong>, <strong>Yu-Gi-Oh</strong> & More</p>
CTA: "Shop Now"
Link: /products
```

### Auction Promotion

```
Title: "Live Auctions Every Day"
Subtitle: <p>Bid on <em>Rare</em> & <strong>Limited Edition</strong> Items</p>
Description: <ul><li>Starting bids from ₹99</li><li>New auctions daily</li></ul>
CTA: "View Auctions"
Link: /auctions
```

### Trust Builder

```
Title: "100% Authentic Products"
Subtitle: <p><strong>Zero Customs Charges</strong> • Fast India Delivery</p>
Description: <blockquote>All products verified and authenticated</blockquote>
CTA: "Learn More"
Link: /about
```

### Seasonal Event

```
Title: "Diwali Mega Sale"
Subtitle: <p>Up to <strong>70% OFF</strong> on all categories</p>
Description: <p>Valid till <em>Nov 15, 2025</em> • <a href="/coupons">Use code: DIWALI2025</a></p>
CTA: "Shop Sale"
Link: /special-offers
```

## Technical Details

### Files Modified

1. **Admin Pages**

   - `src/app/admin/hero-slides/create/page.tsx`
   - `src/app/admin/hero-slides/[id]/edit/page.tsx`

2. **Frontend Components**

   - `src/components/layout/HeroCarousel.tsx`

3. **API Routes**

   - `src/app/api/homepage/hero-slides/route.ts` (new)

4. **Existing APIs** (unchanged)
   - `src/app/api/admin/hero-slides/route.ts`
   - `src/app/api/admin/hero-slides/[id]/route.ts`

### Storage

- Collection: `hero_slides` (Firestore)
- Fields: `subtitle` and `description` now store HTML strings
- Backward compatible: Plain text still works

### Security

- HTML is sanitized by React's `dangerouslySetInnerHTML`
- Admin-only endpoints require authentication
- Public endpoint only returns active slides
- No script tags or dangerous HTML allowed

## Troubleshooting

### Rich text not displaying

- Check if HTML is saved in database
- Verify `dangerouslySetInnerHTML` is used
- Ensure CSS classes are applied

### Formatting looks wrong

- Clear browser cache
- Check Tailwind prose classes
- Verify custom CSS is loaded

### Editor not loading

- Check RichTextEditor component import
- Verify component is client-side ('use client')
- Check browser console for errors

### Slide not appearing

- Verify `is_active` is set to `true`
- Check position/order is set
- Ensure image_url is valid
- Check API response in Network tab

## Future Enhancements

Potential additions:

- Video background support
- Animation effects configuration
- A/B testing different messages
- Click tracking analytics
- Scheduled start/end dates
- Multi-language support
- Template library for quick creation

---

**Last Updated**: November 9, 2025  
**Related**: Special Event Banner, Homepage Settings
