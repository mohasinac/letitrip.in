# Layout Components Quick Reference

## 🧭 Navigation Links

### Main Navbar

```
Home (/) → Products (/products) → Categories (/categories) → Stores (/stores) → Game (/game) → Contact (/contact)
```

### Navbar Icons

- 🔍 Search (`/search`)
- 🛒 Cart (`/cart`)
- 🌙 Theme Toggle
- 👤 User Menu

---

## 📍 Footer Links Structure

### Shop Section

- All Products → `/products`
- Categories → `/categories`
- Stores → `/stores`
- New Arrivals → `/products?sort=newest`
- Best Sellers → `/products?sort=popular`
- On Sale → `/products?sale=true`

### Customer Service

- Contact Us → `/contact`
- Help Center → `/help`
- FAQ → `/faq`
- Track Order → `/account/orders`
- Returns → `/account/returns`
- Shipping Info → `/shipping`

### Company

- About Us → `/about`
- Careers → `/careers`
- Blog → `/blog`
- Beyblade Game → `/game`
- Terms of Service → `/terms`
- Privacy Policy → `/privacy`

### Bottom Links

- Sitemap → `/sitemap`
- Accessibility → `/accessibility`
- Cookie Policy → `/cookies`

---

## 🎛️ Admin Sidebar Menu

```
📊 Dashboard           /admin
📈 Analytics           /admin/analytics
────────────────────────────────────
🛍️  Products           /admin/products
📁 Categories         /admin/categories
📦 Orders             /admin/orders
👥 Users              /admin/users
────────────────────────────────────
🏷️  Coupons           /admin/coupons
📢 Sales              /admin/sales
⭐ Reviews            /admin/reviews
🎧 Support            /admin/support
🔔 Notifications      /admin/notifications
────────────────────────────────────
🎮 Game               /admin/game/beyblades
⚙️  Settings           /admin/settings
```

**Footer**: Version v1.2.0 + Progress Bar (75%)

---

## 🏪 Seller Sidebar Menu

```
📊 Dashboard           /seller/dashboard
🏪 Shop Setup         /seller/shop-setup
────────────────────────────────────
🛍️  Products           /seller/products
📦 Orders             /seller/orders
🚚 Shipments          /seller/shipments
────────────────────────────────────
🏷️  Coupons           /seller/coupons
📢 Sales              /seller/sales
────────────────────────────────────
📈 Analytics          /seller/analytics
💰 Revenue            /seller/analytics?tab=revenue
────────────────────────────────────
🔔 Alerts (📍)        /seller/alerts
⚙️  Settings           /seller/settings
```

**Footer**: Store Status (🟢 Active) + Version v1.2.0

---

## 🎨 Theme Colors

### Admin Sidebar

- **Gradient**: Blue (#2563eb) → Purple (#7c3aed)
- **Hover**: Light Blue (#eff6ff)
- **Active**: Blue Gradient + Shadow

### Seller Sidebar

- **Gradient**: Green (#16a34a) → Emerald (#059669)
- **Hover**: Light Green (#f0fdf4)
- **Active**: Green Gradient + Shadow

### Navbar

- **Primary**: Blue (#2563eb)
- **Active**: Blue Background + White Text
- **Hover**: Light Gray (#f3f4f6)

### Footer

- **Background**: Gray Gradient (#f9fafb → #f3f4f6)
- **Links**: Gray → Blue on Hover
- **Social Icons**: Original Colors on Hover

---

## 📱 Responsive Breakpoints

```
Mobile:   < 768px  (md)   → Hamburger menu, single column
Tablet:   768-1024px      → Partial nav, 2 columns
Desktop:  > 1024px (lg)   → Full nav, 5 columns
```

---

## 🔄 Sidebar States

### Expanded

- Width: 256px (16rem / w-64)
- Shows: Icons + Labels + Badges
- Toggle: ← Chevron Left

### Collapsed

- Width: 80px (5rem / w-20)
- Shows: Icons Only + Tooltip
- Toggle: → Chevron Right

---

## ⚡ Interactive Elements

### Navbar

- All links have hover effects
- Active page highlighted
- Search/Cart icons clickable
- Theme toggle animated
- User dropdown menu

### Footer

- All links have hover transitions
- Social icons scale on hover
- Organized into logical sections
- Bottom bar with extra links

### Sidebars

- Smooth collapse/expand animation
- Hover highlights each item
- Active item gradient background
- Badge animations (pulse, bounce)
- Scrollable content area
- Sticky positioning

---

## 🎯 Key Features

### ✨ Navbar

- [x] 6 main navigation links
- [x] Search functionality
- [x] Shopping cart access
- [x] User profile menu
- [x] Theme switcher
- [x] Mobile responsive

### 🎨 Footer

- [x] 5-column layout
- [x] 30+ organized links
- [x] Social media integration
- [x] Responsive grid
- [x] Modern gradient design
- [x] Copyright & policies

### 🎛️ Admin Sidebar

- [x] 13 menu items
- [x] 3 logical sections
- [x] Collapse/expand
- [x] Gradient design
- [x] Progress indicator
- [x] Version display

### 🏪 Seller Sidebar

- [x] 11 menu items
- [x] Badge system
- [x] Store status
- [x] Green theme
- [x] Smooth animations
- [x] Revenue quick link

---

## 💡 Pro Tips

### Navigation

1. Use keyboard shortcuts (coming soon)
2. Click logo to return home
3. Use search icon for quick product search
4. Cart badge shows item count

### Sidebars

1. Hover over collapsed items for tooltips
2. Sections divided by visual separators
3. Active page automatically highlighted
4. Click toggle button to expand/collapse

### Footer

1. Organized by categories
2. Quick access to help resources
3. Social media in brand section
4. Legal links at bottom

---

## 🔧 Common Tasks

### Finding Products

```
Navbar → Products → Browse all
or
Navbar → Search → Enter query
```

### Accessing Admin Panel

```
User Menu → Admin Panel
or
Direct: /admin
```

### Managing Store (Seller)

```
User Menu → Seller Panel → Dashboard
or
Sidebar → Shop Setup
```

### Getting Help

```
Footer → Customer Service → Help Center
or
Footer → Customer Service → FAQ
```

### Checking Orders

```
User Menu → Profile → Orders
or
Footer → Track Order
```

---

## 📞 Quick Links

### Most Used Pages

- Products: `/products`
- Categories: `/categories`
- Cart: `/cart`
- Profile: `/profile`
- Orders: `/account/orders`

### Help & Support

- Contact: `/contact`
- Help: `/help`
- FAQ: `/faq`

### Legal

- Terms: `/terms`
- Privacy: `/privacy`
- Cookies: `/cookies`

### Fun

- Beyblade Game: `/game`
- About Us: `/about`

---

**Last Updated**: 2025-01-01
**Version**: 1.2.0
