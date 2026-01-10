# public/ - Public Assets Documentation

## Overview

Static files served directly by Next.js without processing. Accessible at root URL path.

## Contents

### manifest.json

**Purpose**: PWA (Progressive Web App) manifest

**Defines**:

- App name and short name
- Icons (various sizes)
- Theme colors
- Display mode
- Start URL
- Orientation

**Usage**: Enables "Add to Home Screen" on mobile devices

### payments/

**Purpose**: Payment-related static assets

**Contents**:

- Payment gateway logos
- Payment method icons
- SSL certificates (public)
- Payment policy documents

### Other Assets (Common)

- **Favicons**: favicon.ico, favicon-16x16.png, favicon-32x32.png
- **Apple Touch Icons**: apple-touch-icon.png
- **App Icons**: Various sizes for PWA
- **robots.txt**: Generated dynamically by `src/app/robots.ts`
- **sitemap.xml**: Generated dynamically by `src/app/sitemap.ts`

## Best Practices

1. **Optimize Images**: Compress all images
2. **Use next/image**: For dynamic images, use next/image instead
3. **CDN**: Consider CDN for static assets in production
4. **Versioning**: Version assets for cache busting
5. **Security**: Don't expose sensitive files

## Access URLs

Files in public/ are served from root:

- `/manifest.json`
- `/payments/logo.png`
- `/favicon.ico`

## PWA Features

The manifest.json enables:

- Install prompt on mobile
- App icon on home screen
- Standalone app experience
- Splash screen
- Theme color

## Future Improvements

See [comments.md](./comments.md)
