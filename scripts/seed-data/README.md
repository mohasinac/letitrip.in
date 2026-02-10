# Seed Data

This directory contains sample data for populating your database during development and testing.

## 📁 Structure

```
seed-data/
├── index.ts                          # Exports all seed data
├── users-seed-data.ts                # User accounts (admin, customers, sellers)
├── categories-seed-data.ts           # Hierarchical category tree
├── products-seed-data.ts             # Products across various categories
├── orders-seed-data.ts               # Orders with different statuses
├── reviews-seed-data.ts              # Product reviews and ratings
├── bids-seed-data.ts                 # Auction bids for vintage camera
├── coupons-seed-data.ts              # Discount coupons (percentage, fixed, BOGO)
├── carousel-slides-seed-data.ts      # Homepage carousel/hero slides
├── homepage-sections-seed-data.ts    # Configurable homepage sections
├── site-settings-seed-data.ts        # Global site configuration
└── faq-seed-data.ts                  # Frequently asked questions
```

## 🌱 Usage

### Seed All Data

```bash
npx ts-node scripts/seed-all-data.ts
```

### Seed Specific Collections

```bash
npx ts-node scripts/seed-all-data.ts --collections=users,products,categories
```

### Dry Run (Preview)

```bash
npx ts-node scripts/seed-all-data.ts --dry-run
```

### Verbose Output

```bash
npx ts-node scripts/seed-all-data.ts --verbose
```

## 📊 Sample Data Overview

### Users (8 users)

- **Admin User**: Full system access
- **Regular Users**: 3 customers with various activity levels
- **Sellers**: 3 verified sellers with products
- **Disabled User**: For testing account suspension

### Categories (13 categories)

- **Electronics** (root)
  - Mobiles & Accessories
    - Smartphones
    - Mobile Accessories
  - Laptops & Computers
  - Audio
  - Cameras & Photography
- **Fashion** (root)
  - Men's Fashion
  - Women's Fashion
- **Home & Kitchen** (root)
- **Sports & Outdoors** (root)

### Products (10 products)

- Premium smartphones (iPhone, Samsung, Google)
- Laptops (MacBook Pro, Dell XPS)
- Fashion items (shirts, kurtis)
- Home essentials (cookware, yoga mats)
- **1 auction item** (Vintage camera)
- **1 out-of-stock item** (for testing)

### Orders (12 orders)

- Delivered: 3 orders
- Shipped: 2 orders
- Confirmed: 2 orders
- Pending: 1 order
- Cancelled: 1 order
- Returned: 1 order
- Payment Failed: 1 order
- Multi-quantity: 1 order

### Reviews (15 reviews)

- **Approved**: 11 reviews (5-star to 2-star ratings)
- **Pending**: 2 reviews (awaiting moderation)
- **Rejected**: 1 review (spam content)
- Includes verified purchase badges
- Various helpful vote counts

### Bids (8 bids)

- All for the Vintage Camera auction item
- 3 bidders: John Doe, Jane Smith, Mike Johnson
- Bid amounts range from ₹8,500 to ₹22,000
- Jane Smith is currently winning at ₹22,000
- Statuses: active (winning), outbid, and previous bids
- Auto-max-bid support on some bids

### Coupons (10 coupons)

- **Percentage**: 10%, 15%, 20% off
- **Fixed Amount**: ₹500, ₹1000, ₹10000 off
- **Free Shipping**: All orders
- **BOGO**: Buy 2 Get 1 Free
- Product-specific, category-specific, seller-specific
- Active and expired coupons

### Carousel Slides (6 slides)

- Welcome/Hero slide
- Electronics sale
- Fashion collection
- Special offers (with video)
- Live auctions
- 1 inactive slide (for testing)
- Interactive grid cards with CTAs

### Homepage Sections (14 sections)

- Welcome section
- Trust indicators
- Featured categories
- Featured products
- Special collections
- New arrivals
- Promotional banner
- Live auctions
- Platform features
- Customer reviews
- WhatsApp community
- FAQ section
- Newsletter signup
- 1 disabled section (blog)

### Site Settings (1 singleton)

- Site branding (name, logo, motto)
- Contact information
- Social links
- Email settings
- SEO metadata
- Platform features
- Legal pages (Terms, Privacy, Refund, Shipping)
- Shipping & return policies
- FAQ variables

### FAQs (Existing)

- General questions
- Shipping & delivery
- Returns & refunds
- Payment methods
- Account management

## 🔄 Data Relationships

The seed data maintains proper relationships:

- Products reference sellers (users)
- Orders reference products and users
- Reviews reference products and users
- Categories maintain parent-child relationships
- Coupons reference categories/products/sellers

## ⚠️ Important Notes

1. **Development Only**: This seed data is for development and testing purposes only
2. **Overwrites Data**: Running the seed script will overwrite existing data
3. **Auth Users**: Creates Firebase Auth accounts with the specified UIDs
4. **Timestamps**: All dates are converted to Firestore Timestamps automatically
5. **Dry Run**: Always test with `--dry-run` first before seeding

## 🛠️ Customization

To add more seed data:

1. Edit the relevant seed data file (e.g., `products-seed-data.ts`)
2. Follow the existing schema structure
3. Ensure proper relationships (IDs reference existing documents)
4. Run the seed script to test

## 📝 Schema Compliance

All seed data files match the schemas defined in `src/db/schema/`:

- Type-safe with TypeScript interfaces
- Follows collection naming conventions
- Includes all required fields
- Uses proper enum values
- Maintains data integrity constraints
