# Special Event Banner - Admin Configuration Guide

## Overview

The Special Event Banner has been made fully configurable from the admin panel with rich text editing capabilities. Admins can now customize the banner content, styling, and behavior without touching code.

## Features Implemented

### 1. Rich Text Editor

- Full HTML formatting support (bold, italic, underline, headings, lists, links, etc.)
- Visual editing with toolbar
- Real-time preview

### 2. Banner Settings

- **Enable/Disable**: Toggle banner visibility site-wide
- **Content**: Rich text HTML content with formatting
- **Link URL**: Optional click-through URL
- **Background Color**: Customizable background with color picker
- **Text Color**: Customizable text color with color picker
- **Live Preview**: See changes before saving

## How to Use

### Accessing Banner Settings

1. Log in as admin
2. Navigate to **Admin Panel** → **Homepage Settings** (`/admin/homepage`)
3. Find the **Special Event Banner** section at the top

### Configuring the Banner

#### 1. Enable/Disable Banner

- Toggle the switch on the right to show/hide the banner site-wide

#### 2. Edit Content

- Use the rich text editor to format your message
- Available formatting:
  - **Bold**, _Italic_, <u>Underline</u>, ~~Strikethrough~~
  - Headings (H1, H2, H3)
  - Bullet lists and numbered lists
  - Links
  - Text colors and highlights

#### 3. Set Link URL (Optional)

- Enter a URL to make the entire banner clickable
- Examples: `/special-offers`, `/auctions`, `/products`
- Leave blank if no link needed

#### 4. Customize Colors

- **Background Color**: Choose from color picker or enter hex code
- **Text Color**: Choose from color picker or enter hex code
- Default: Blue background (#2563eb) with white text (#ffffff)

#### 5. Preview

- View real-time preview before saving
- Shows exactly how banner will appear on site

#### 6. Save Changes

- Click **"Save Changes"** button
- Changes take effect immediately across entire site

## Technical Details

### API Endpoints

#### Public Endpoint (No Auth Required)

```
GET /api/homepage/banner
```

Returns current banner settings for display

#### Admin Endpoints (Auth Required)

```
GET /api/admin/homepage
PATCH /api/admin/homepage
POST /api/admin/homepage/reset
```

Manage all homepage settings including banner

### Data Structure

```typescript
{
  specialEventBanner: {
    enabled: boolean;
    content: string; // Rich text HTML
    link?: string;
    backgroundColor?: string; // Hex color
    textColor?: string; // Hex color
  }
}
```

### Storage

- Settings stored in Firestore: `site_settings/homepage_config`
- Cached for performance
- Updates propagate immediately

## User Experience

### Frontend Display

- Banner appears at very top of site (above main navigation)
- Scrolls away with page (not sticky)
- Users can dismiss banner with X button (persists in session)
- Fully responsive on mobile and desktop
- Respects admin color choices

### Default Settings

If no settings configured:

- Enabled by default
- Content: "⭐ Featured Sites: International Fleemarket • Purchase Fees • Coupon week end!"
- Link: `/special-offers`
- Background: Blue (#2563eb)
- Text: White (#ffffff)

## Best Practices

### Content Guidelines

1. **Keep it short**: One line works best
2. **Use emojis**: Makes banner more eye-catching (⭐ 🎉 🔥 💥)
3. **Clear call-to-action**: Tell users what to do
4. **Update regularly**: Keep content fresh and relevant

### Design Tips

1. **High contrast**: Ensure text is readable on background
2. **Brand colors**: Use colors that match your theme
3. **Test on mobile**: Preview on different screen sizes
4. **Accessibility**: Avoid color combinations that are hard to read

### Example Content

**Flash Sale:**

```html
<p>
  🔥 <strong>Flash Sale!</strong> Up to 50% off all Pokemon cards - Ends
  midnight!
</p>
```

**New Arrivals:**

```html
<p>
  ⭐ <strong>New Arrivals:</strong> Exclusive Beyblade X series now in stock!
</p>
```

**Event Announcement:**

```html
<p>
  🎉 <strong>Special Event:</strong> Free shipping on all orders this weekend!
</p>
```

**Multiple Messages:**

```html
<p>
  ⭐ <strong>Featured:</strong> International Fleemarket • No Purchase Fees •
  Coupon Weekend!
</p>
```

## Troubleshooting

### Banner not showing

- Check if banner is enabled in settings
- Verify content is not empty
- User may have dismissed it (resets on new session)

### Colors not working

- Use valid hex color codes (#RRGGBB)
- Test in preview before saving
- Clear browser cache if needed

### Link not working

- Ensure URL starts with `/` for internal links
- Use full URL for external links (https://...)
- Test link after saving

### Changes not visible

- Hard refresh browser (Ctrl+F5 / Cmd+Shift+R)
- Check if you clicked "Save Changes"
- Verify you have admin permissions

## Files Modified

1. **Service Layer**

   - `src/services/homepage-settings.service.ts` - Added banner interface

2. **API Routes**

   - `src/app/api/admin/homepage/route.ts` - Updated settings structure
   - `src/app/api/homepage/banner/route.ts` - New public endpoint

3. **Components**

   - `src/components/layout/SpecialEventBanner.tsx` - Dynamic banner with API integration
   - `src/app/admin/homepage/page.tsx` - Admin configuration UI

4. **Dependencies**
   - Added `react-quill` and `quill` for rich text editing

## Future Enhancements

Potential features to add:

- Schedule banner start/end dates
- A/B testing different messages
- Click tracking and analytics
- Multiple banners with rotation
- Audience targeting (logged in vs guests)
- Animation effects
- Close button customization

---

**Last Updated**: November 9, 2025
**Version**: 1.0
