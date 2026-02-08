# LetItRip.in - Admin User Guide

**Version**: 1.0.0  
**Last Updated**: February 8, 2026  
**Audience**: Platform Administrators and Moderators

---

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Dashboard Overview](#dashboard-overview)
4. [User Management](#user-management)
5. [Product Management](#product-management)
6. [Order Management](#order-management)
7. [Review Management](#review-management)
8. [Content Management](#content-management)
9. [Session Management](#session-management)
10. [Site Settings](#site-settings)
11. [FAQ Management](#faq-management)
12. [Best Practices](#best-practices)
13. [Troubleshooting](#troubleshooting)

---

## 1. Introduction

### What is LetItRip.in?

LetItRip.in is a multi-seller e-commerce and auction platform that allows users to buy and sell products, participate in auctions, and engage with a vibrant marketplace community.

### Admin Roles

The platform has 4 user roles with different permission levels:

1. **User** (Level 0) - Basic account with buyer privileges
2. **Seller** (Level 1) - Can list products and manage their own inventory
3. **Moderator** (Level 2) - Can manage users, reviews, and content
4. **Admin** (Level 3) - Full platform access and control

### Admin Permissions

| Permission           | User | Seller   | Moderator | Admin |
| -------------------- | ---- | -------- | --------- | ----- |
| View Dashboard       | ❌   | ❌       | ✅        | ✅    |
| Manage Users         | ❌   | ❌       | ✅        | ✅    |
| Promote to Seller    | ❌   | ❌       | ✅        | ✅    |
| Promote to Moderator | ❌   | ❌       | ❌        | ✅    |
| Promote to Admin     | ❌   | ❌       | ❌        | ✅    |
| Manage All Products  | ❌   | Own Only | ✅        | ✅    |
| Manage Orders        | ❌   | Own Only | ✅        | ✅    |
| Manage Reviews       | ❌   | ❌       | ✅        | ✅    |
| Manage Content       | ❌   | ❌       | ✅        | ✅    |
| Edit Site Settings   | ❌   | ❌       | ❌        | ✅    |

---

## 2. Getting Started

### Accessing the Admin Panel

1. **Login**: Navigate to `https://letitrip.in/auth/login`
2. **Enter Credentials**: Use your admin email and password
3. **Access Dashboard**: After login, click your profile menu and select "Admin Dashboard"

**Direct URL**: `https://letitrip.in/admin`

### Admin Account Setup

**Default Admin Account**:

- Email: `admin@letitrip.in`
- Role: Automatically assigned "admin" on registration

**Creating Additional Admins**:

1. User must first register with a regular account
2. Admin can promote them via User Management
3. Only admins can create other admin accounts

---

## 3. Dashboard Overview

### Accessing the Dashboard

**Path**: Admin Panel → Dashboard  
**URL**: `/admin`

### Key Metrics

The admin dashboard displays real-time statistics:

#### User Statistics

- **Total Users**: All registered accounts
- **New This Month**: Users registered in current month
- **Active Today**: Users with activity in last 24 hours
- **Admins**: Total admin accounts
- **Verified Email**: Users with verified email addresses

#### Product Statistics

- **Total Products**: All product listings
- **Active Listings**: Products currently available
- **Auction Items**: Products with active auctions
- **Out of Stock**: Products with zero inventory
- **Average Price**: Mean price across all products

#### Order Statistics

- **Total Orders**: All orders ever placed
- **Pending**: Orders awaiting confirmation
- **This Month**: Orders placed in current month
- **Total Revenue**: Sum of all completed orders
- **Average Order Value**: Mean order amount

#### Review Statistics

- **Total Reviews**: All product reviews
- **Pending**: Reviews awaiting moderation
- **This Month**: Reviews submitted in current month
- **Average Rating**: Mean rating across all reviews
- **Reported**: Reviews flagged by users

### Quick Actions

Dashboard provides quick access buttons:

- **View All Users**
- **View All Products**
- **View All Orders**
- **View Pending Reviews**

---

## 4. User Management

### Accessing User Management

**Path**: Admin Panel → Users  
**URL**: `/admin/users`

### User List View

**Features**:

- Search by name or email
- Filter by role (User, Seller, Moderator, Admin)
- Filter by status (Active, Disabled)
- Filter by verification status (Verified, Unverified)
- Pagination (10, 25, 50, 100 per page)

### User Actions

#### View User Profile

1. Click on user's name in the list
2. View complete user profile including:
   - Basic info (name, email, phone)
   - Role and account status
   - Registration date
   - Last login
   - Statistics (orders, reviews, ratings)

#### Edit User Role

**Moderator Permissions**:

- Can promote User → Seller
- **Cannot** promote to Moderator or Admin

**Admin Permissions**:

- Can change any role to any other role
- Can create other admin accounts

**Steps**:

1. Click "Edit" on user row
2. Select new role from dropdown
3. Click "Save"
4. Confirm role change

**Warning**: Be careful when assigning admin role!

#### Disable/Enable User Account

**When to Disable**:

- Suspicious activity
- Terms of service violations
- User request
- Spam accounts

**Steps**:

1. Click "Disable" on user row
2. Confirm action
3. User will be logged out immediately
4. User cannot log in until re-enabled

**To Re-Enable**:

1. Filter by "Disabled" status
2. Click "Enable" on user row
3. User can now log in again

#### Delete User Account

**Warning**: This action is **irreversible**!

**What Gets Deleted**:

- User profile and all personal data
- User's orders (marked as "deleted user")
- User's reviews (content kept, author anonymized)
- User's sessions (all devices logged out)
- Email verification tokens
- Password reset tokens

**What Is Preserved**:

- Products (transferred to "Deleted User" ownership)
- Order history (for other users' purchases)
- Review content (for product ratings)

**Steps**:

1. Click "Delete" on user row
2. Type "DELETE" to confirm
3. Click "Confirm Delete"
4. User is permanently deleted

---

## 5. Product Management

### Accessing Product Management

**Path**: Admin Panel → Products  
**URL**: `/admin/products`

### Product List View

**Features**:

- Search by title or description
- Filter by category and subcategory
- Filter by status (Draft, Active, Sold Out, Archived)
- Filter by type (Standard, Auction, Promoted)
- Sort by price, date, views, sales
- Grid or table view

### Product Details

Click on any product to view:

- Title, description, and specifications
- Category and subcategory
- Price and inventory
- Seller information
- Images and gallery
- Auction details (if applicable)
- Promotion details (if applicable)
- View count and sales statistics

### Product Actions

#### Edit Product

**What You Can Edit**:

- Title, description, specifications
- Category and subcategory
- Price and available quantity
- Images and gallery
- Shipping info and return policy
- Status (draft, active, archived)

**What You Cannot Edit**:

- Product ID
- Seller (use transfer ownership instead)
- Order history
- Review count

**Steps**:

1. Click "Edit" on product
2. Modify fields as needed
3. Click "Save Changes"
4. Product is updated immediately

#### Change Product Status

**Statuses**:

- **Draft**: Not visible to buyers
- **Active**: Available for purchase
- **Sold Out**: Out of stock, not purchasable
- **Archived**: Hidden from listings

**Steps**:

1. Click status dropdown on product
2. Select new status
3. Confirm change

#### Feature/Unfeature Product

**Featured Products**:

- Appear on homepage
- Higher visibility in search
- Special badge in listings

**Steps**:

1. Click "Feature" on product
2. Product appears on homepage
3. Click "Unfeature" to remove

#### Delete Product

**Warning**: This action is **irreversible**!

**When to Delete**:

- Violates terms of service
- Duplicate listing
- Fraudulent product
- Seller request

**Steps**:

1. Click "Delete" on product
2. Type "DELETE" to confirm
3. Product is permanently removed

---

## 6. Order Management

### Accessing Order Management

**Path**: Admin Panel → Orders  
**URL**: `/admin/orders`

### Order List View

**Features**:

- Search by order ID or buyer name
- Filter by status (Pending, Confirmed, Shipped, Delivered, Cancelled, Returned)
- Filter by date range
- Sort by date, amount, status
- Export to CSV

### Order Details

Click on any order to view:

- Order ID and status
- Buyer and seller information
- Product details (name, price, quantity)
- Shipping address
- Payment information
- Order timeline
- Tracking number (if shipped)

### Order Actions

#### Update Order Status

**Order Lifecycle**:

1. **Pending**: Order placed, awaiting seller confirmation
2. **Confirmed**: Seller confirmed, preparing for shipment
3. **Shipped**: Package shipped, tracking number added
4. **Delivered**: Customer received package
5. **Cancelled**: Order cancelled by buyer/seller
6. **Returned**: Customer returned product

**Steps**:

1. Click "Update Status" on order
2. Select new status
3. Add note (optional but recommended)
4. Click "Save"
5. Buyer and seller notified by email

#### Add Tracking Number

**For Shipped Orders**:

1. Change status to "Shipped"
2. Enter tracking number in field
3. Select carrier (UPS, FedEx, USPS, etc.)
4. Click "Save"
5. Buyer receives email with tracking link

#### Process Refund

**When to Refund**:

- Order cancelled before shipment
- Item returned by customer
- Product never delivered
- Duplicate charge

**Steps**:

1. Click "Process Refund" on order
2. Enter refund amount (partial or full)
3. Select refund reason
4. Add admin note
5. Click "Confirm Refund"
6. Buyer receives refund notification

**Note**: Actual payment refund must be processed through payment provider.

#### View Order Messages

**Order Chat**:

- Buyer and seller can message each other
- Admins can view all messages
- Admins can intervene in disputes

**Steps**:

1. Click "View Messages" on order
2. Read conversation history
3. Add admin message if needed
4. Click "Send"

---

## 7. Review Management

### Accessing Review Management

**Path**: Admin Panel → Reviews  
**URL**: `/admin/reviews`

### Review List View

**Features**:

- Search by product or reviewer
- Filter by rating (1-5 stars)
- Filter by status (Pending, Approved, Rejected, Reported)
- Sort by date, rating, helpfulness
- Bulk approve/reject

### Review Details

Click on any review to view:

- Product reviewed
- Reviewer name and profile
- Rating (1-5 stars)
- Review title and text
- Images uploaded by reviewer
- Date submitted
- Helpfulness votes
- Report reason (if reported)

### Review Actions

#### Approve Review

**When to Approve**:

- Review is genuine and helpful
- No profanity or personal attacks
- Follows review guidelines

**Steps**:

1. Click "Approve" on review
2. Review appears on product page
3. Reviewer notified

#### Reject Review

**When to Reject**:

- Spam or fake review
- Contains profanity or hate speech
- Off-topic or irrelevant
- Violates review guidelines

**Steps**:

1. Click "Reject" on review
2. Select rejection reason
3. Add note for reviewer (optional)
4. Click "Confirm Reject"
5. Reviewer notified with reason

#### Edit Review

**What You Can Edit**:

- Review text (grammar/typos only)
- Remove profanity or offensive content
- Fix formatting issues

**What You Cannot Edit**:

- Rating (stars)
- Reviewer identity
- Date submitted

**Steps**:

1. Click "Edit" on review
2. Modify text carefully
3. Add admin note explaining changes
4. Click "Save"

**Best Practice**: Only edit to remove violations, not to change meaning.

#### Delete Review

**When to Delete**:

- Severe violations (hate speech, threats)
- Legal requirement
- Fraudulent review confirmed

**Steps**:

1. Click "Delete" on review
2. Select deletion reason
3. Type "DELETE" to confirm
4. Review permanently removed

---

## 8. Content Management

### Accessing Content Management

**Path**: Admin Panel → Content  
**URL**: `/admin/content`

### Available Content Types

1. **Carousel** - Homepage hero slider
2. **Homepage Sections** - Modular page sections
3. **FAQs** - Help center content
4. **Categories** - Product taxonomy

---

### 8.1 Carousel Management

**Purpose**: Manage homepage hero slider with promotional slides

#### View Carousel Items

**Features**:

- See all carousel slides in order
- Preview images and CTAs
- Enable/disable individual slides
- Reorder slides

#### Create Carousel Item

**Steps**:

1. Click "Add Slide" button
2. Fill in form:
   - **Image**: Upload 1920x1080 image (required)
   - **Title**: Main headline (required)
   - **Subtitle**: Supporting text (optional)
   - **CTA Text**: Button label (e.g., "Shop Now")
   - **CTA Link**: Button destination URL
   - **Position**: Display order (1 = first)
   - **Enabled**: Show/hide slide
   - **Start Date**: When to start showing (optional)
   - **End Date**: When to stop showing (optional)
3. Click "Create"
4. Slide appears on homepage immediately (if enabled)

**Image Requirements**:

- Dimensions: 1920x1080 (16:9 aspect ratio)
- Format: JPEG, PNG, WebP
- Max size: 5MB
- Optimized for web (compressed)

#### Edit Carousel Item

**Steps**:

1. Click "Edit" on slide
2. Modify fields
3. Click "Save Changes"
4. Changes appear immediately

#### Reorder Carousel Items

**Steps**:

1. Click "Reorder" button
2. Drag and drop slides to new positions
3. Click "Save Order"
4. Homepage updates immediately

#### Delete Carousel Item

**Steps**:

1. Click "Delete" on slide
2. Confirm deletion
3. Slide removed from homepage

**Best Practices**:

- Keep 3-5 active slides maximum
- Use high-quality images
- Test on mobile devices
- Schedule seasonal promotions
- Update regularly to keep content fresh

---

### 8.2 Homepage Sections Management

**Purpose**: Manage modular sections on homepage (Featured Products, Categories, etc.)

#### Available Section Types

1. **Hero Banner** - Large promotional banner
2. **Featured Products** - Curated product grid
3. **Categories Grid** - Category showcase
4. **Hot Deals** - Limited-time offers
5. **New Arrivals** - Recently added products
6. **Auctions Ending Soon** - Urgent auction items
7. **Testimonials** - Customer reviews
8. **Stats Counter** - Platform statistics
9. **Newsletter Signup** - Email capture form
10. **Trust Badges** - Security/trust indicators
11. **How It Works** - Process explanation
12. **Partners/Logos** - Brand partnerships
13. **Custom HTML** - Freeform content

#### Create Homepage Section

**Steps**:

1. Click "Add Section" button
2. Select section type
3. Fill in configuration:
   - **Title**: Section heading
   - **Enabled**: Show/hide section
   - **Order**: Display position (1 = top)
   - **Config**: Type-specific settings
4. Click "Create"
5. Section appears on homepage

**Example: Featured Products Section**

```json
{
  "title": "Featured Products",
  "count": 8,
  "filter": "featured",
  "layout": "grid"
}
```

#### Reorder Sections

**Steps**:

1. Click "Reorder" button
2. Drag sections to new positions
3. Click "Save Order"
4. Homepage updates immediately

#### Delete Section

**Steps**:

1. Click "Delete" on section
2. Confirm deletion
3. Section removed from homepage

**Best Practices**:

- Place most important content first
- Limit to 8-10 sections total
- Test mobile responsiveness
- Update seasonal content
- Monitor section engagement

---

### 8.3 FAQ Management

**Purpose**: Manage help center content and frequently asked questions

#### View FAQ List

**Features**:

- Search by question or answer
- Filter by category
- Filter by featured/pinned status
- Sort by priority, order, views

#### FAQ Categories

1. **Account & Security** - Login, password, verification
2. **Orders & Checkout** - Placing orders, payment methods
3. **Shipping & Delivery** - Shipping times, tracking, costs
4. **Returns & Refunds** - Return policy, refund process
5. **Products & Services** - Product info, specifications
6. **Auctions & Bidding** - Auction rules, bidding process
7. **Seller Information** - Becoming a seller, seller tools
8. **Technical Support** - Website issues, troubleshooting
9. **Privacy & Terms** - Privacy policy, terms of service
10. **Other** - Miscellaneous questions

#### Create FAQ

**Steps**:

1. Click "Add FAQ" button
2. Fill in form:
   - **Question**: The FAQ question (required)
   - **Answer**: Detailed answer (supports HTML)
   - **Category**: Select from dropdown (required)
   - **Tags**: Comma-separated keywords (optional)
   - **Priority**: 1-10 (1 = highest, affects sort order)
   - **Order**: Manual sort position
   - **Featured**: Show on homepage
   - **Pinned**: Always show at top
   - **SEO Title**: Meta title for FAQ page
   - **SEO Description**: Meta description
3. Click "Create"
4. FAQ appears in help center

**Answer Formatting**:

- Use HTML for formatting (bold, lists, links)
- Use variables for dynamic content:
  - `{{companyName}}` - Site name
  - `{{supportEmail}}` - Support email address
  - `{{supportPhone}}` - Support phone number
  - `{{websiteUrl}}` - Site URL
  - `{{companyAddress}}` - Business address

**Example**:

```html
<p>
  You can contact us at <strong>{{supportEmail}}</strong> or call
  {{supportPhone}}.
</p>
```

#### Edit FAQ

**Steps**:

1. Click "Edit" on FAQ
2. Modify fields
3. Click "Save Changes"
4. Updates appear immediately

#### Reorder FAQs

**By Priority**:

- Set priority 1-10 for automatic sorting
- Priority 1 appears first

**By Manual Order**:

1. Click "Reorder" button
2. Drag FAQs to new positions
3. Click "Save Order"

#### Delete FAQ

**Steps**:

1. Click "Delete" on FAQ
2. Confirm deletion
3. FAQ removed from help center

**Best Practices**:

- Keep answers concise and clear
- Use examples and screenshots
- Update based on user feedback
- Link related FAQs
- Review and update quarterly

---

### 8.4 Category Management

**Purpose**: Organize products into hierarchical categories

#### View Categories

**Features**:

- Tree view showing parent-child relationships
- Product count per category
- Active/inactive status

#### Create Category

**Steps**:

1. Click "Add Category" button
2. Fill in form:
   - **Name**: Category name (required)
   - **Slug**: URL-friendly name (auto-generated)
   - **Description**: Category description
   - **Parent Category**: Select parent (optional)
   - **Icon**: Category icon (optional)
   - **Image**: Category thumbnail (optional)
   - **SEO Title**: Meta title
   - **SEO Description**: Meta description
   - **Active**: Enable/disable category
3. Click "Create"
4. Category appears in navigation

**Category Hierarchy**:

```
Electronics (parent)
├── Computers (child)
│   ├── Laptops (grandchild)
│   └── Desktops (grandchild)
└── Mobile Phones (child)
```

#### Edit Category

**Steps**:

1. Click "Edit" on category
2. Modify fields
3. Click "Save Changes"

**Warning**: Changing parent category affects all products in that category!

#### Delete Category

**Deletion Rules**:

- Cannot delete if category has products (move or delete products first)
- Cannot delete if category has subcategories (delete children first)

**Steps**:

1. Click "Delete" on category
2. Confirm no products/subcategories exist
3. Type "DELETE" to confirm
4. Category removed

**Best Practices**:

- Keep hierarchy simple (max 3 levels)
- Use clear, descriptive names
- Add SEO-friendly descriptions
- Use consistent icon style

---

## 9. Session Management

### Accessing Session Management

**Path**: Admin Panel → Sessions  
**URL**: `/admin/sessions`

### Session List View

**Features**:

- View all active sessions across platform
- See user, device, location, and last activity
- Filter by user, device type, or status
- Revoke individual or all user sessions

### Session Details

Each session shows:

- Session ID
- User (name and email)
- Device info (browser, OS, device type)
- IP address and location (city, country)
- Created date
- Last activity timestamp
- Expires at date

### Session Actions

#### Revoke Session

**When to Revoke**:

- Suspicious activity detected
- User reports unauthorized access
- Device reported stolen
- Security concern

**Steps**:

1. Click "Revoke" on session row
2. Confirm action
3. User logged out immediately on that device

#### Revoke All User Sessions

**When to Use**:

- Account compromised
- Password reset required
- User requests security lockdown

**Steps**:

1. Click "Revoke All Sessions" on user
2. Confirm action
3. User logged out on all devices immediately

**Note**: User can log back in with valid credentials.

---

## 10. Site Settings

### Accessing Site Settings

**Path**: Admin Panel → Settings  
**URL**: `/admin/settings`

**Permission**: Admin only (moderators cannot access)

### Settings Categories

#### 10.1 General Settings

**Configurable Fields**:

- **Company Name**: Business name displayed throughout site
- **Tagline**: Brief description/slogan
- **Description**: Full company description
- **Logo URL**: Path to logo image
- **Favicon URL**: Browser tab icon

**Steps**:

1. Click "Edit" in General section
2. Modify fields
3. Click "Save"
4. Changes appear site-wide immediately

#### 10.2 Contact Settings

**Configurable Fields**:

- **Support Email**: Customer service email
- **Support Phone**: Customer service phone
- **Business Hours**: Operating hours text
- **Address**: Physical business address

**Usage**:

- Displayed in footer
- Used in FAQ variable interpolation ({{supportEmail}})
- Shown on contact page

#### 10.3 Social Media Settings

**Configurable Fields**:

- **Facebook URL**: Company Facebook page
- **Twitter URL**: Company Twitter/X handle
- **Instagram URL**: Company Instagram profile
- **LinkedIn URL**: Company LinkedIn page
- **YouTube URL**: Company YouTube channel

**Usage**:

- Social media icons in footer
- Share buttons on product pages

#### 10.4 Email Settings

**Configurable Fields**:

- **From Email**: Sender email for transactional emails
- **From Name**: Sender name (e.g., "LetItRip Team")
- **Reply-To Email**: Email for customer replies

**Email Types**:

- Welcome emails
- Email verification
- Password reset
- Order confirmations
- Shipping notifications

#### 10.5 Payment Settings

**Configurable Fields**:

- **Payment Provider**: Stripe, PayPal, etc.
- **Currency**: USD, EUR, GBP, etc.
- **Tax Rate**: Default tax percentage
- **Shipping Fee**: Default shipping cost

**Note**: Actual payment integration requires API keys in environment variables.

#### 10.6 Feature Flags

**Toggleable Features**:

- **Auctions Enabled**: Enable/disable auction functionality
- **Reviews Enabled**: Allow users to leave reviews
- **Wishlist Enabled**: Enable wishlist feature
- **Guest Checkout**: Allow purchases without account
- **Social Login**: Enable Google/Apple OAuth

**Steps**:

1. Toggle feature on/off
2. Click "Save"
3. Feature enabled/disabled immediately

#### 10.7 Maintenance Mode

**When to Use**:

- Performing database maintenance
- Deploying major updates
- Fixing critical bugs

**Maintenance Mode Effects**:

- Site shows maintenance page to all users
- Admin can still access admin panel
- No user-facing pages accessible

**Steps**:

1. Toggle "Maintenance Mode" ON
2. Set maintenance message
3. Click "Save"
4. Site enters maintenance mode immediately

**To Exit**:

1. Toggle "Maintenance Mode" OFF
2. Click "Save"
3. Site returns to normal

**Warning**: Only use during approved maintenance windows!

---

## 11. Best Practices

### User Management

✅ **Do**:

- Verify identity before promoting to admin/moderator
- Document reason for disabling accounts
- Respond to user inquiries within 24 hours
- Review suspicious activity reports regularly

❌ **Don't**:

- Delete users without backup/documentation
- Share admin credentials
- Promote users without vetting
- Disable accounts without clear reason

### Product Management

✅ **Do**:

- Review products for quality and accuracy
- Remove duplicate listings promptly
- Feature high-quality products
- Monitor for fraudulent listings

❌ **Don't**:

- Edit product details without seller approval
- Delete products with pending orders
- Feature products without seller consent
- Ignore reported listing violations

### Order Management

✅ **Do**:

- Update order status promptly
- Add tracking numbers for all shipments
- Communicate delays to buyers
- Process refunds within stated timeframe

❌ **Don't**:

- Change order status without verification
- Process refunds without approval
- Share buyer/seller contact info
- Interfere in buyer-seller disputes unnecessarily

### Review Management

✅ **Do**:

- Approve genuine reviews quickly
- Remove spam and fake reviews
- Respond to review reports within 24 hours
- Moderate consistently and fairly

❌ **Don't**:

- Delete negative reviews without cause
- Edit reviews to change meaning
- Show bias toward certain sellers
- Approve obviously fake reviews

### Content Management

✅ **Do**:

- Update homepage content regularly
- Test carousel slides on mobile devices
- Keep FAQ content current and accurate
- Use SEO best practices

❌ **Don't**:

- Use low-quality images in carousel
- Create duplicate FAQ entries
- Leave outdated information published
- Overload homepage with too many sections

---

## 12. Troubleshooting

### Common Issues

#### Can't Access Admin Panel

**Symptoms**: Login successful but admin menu not visible

**Solutions**:

1. Verify your role is "admin" or "moderator"
2. Clear browser cache and cookies
3. Try incognito/private browsing mode
4. Contact another admin to verify your role

#### User Promotion Fails

**Symptoms**: Error when trying to change user role

**Solutions**:

1. Verify you have permission (moderators can only promote to seller)
2. Check if user account is disabled
3. Ensure user has verified email
4. Try refreshing page and retry

#### Product Images Not Loading

**Symptoms**: Broken image icons on product pages

**Solutions**:

1. Check Firebase Storage rules
2. Verify image URL is correct
3. Confirm image file exists in storage
4. Check browser console for CORS errors
5. Re-upload image if necessary

#### FAQ Variables Not Interpolating

**Symptoms**: `{{companyName}}` appears as literal text

**Solutions**:

1. Verify Site Settings are saved correctly
2. Check FAQ answer format is "html" not "plain"
3. Clear API cache: restart server or wait for TTL
4. Check spelling of variable name (case-sensitive)

#### Session Revocation Not Working

**Symptoms**: User still logged in after revoking session

**Solutions**:

1. Wait 5 seconds for Firebase to propagate
2. User may need to refresh browser
3. Check if session is expired naturally
4. Revoke all user sessions as backup

#### Site Stuck in Maintenance Mode

**Symptoms**: Can't exit maintenance mode

**Solutions**:

1. Check Site Settings saved successfully
2. Clear browser cache
3. Verify environment variable not overriding
4. Contact development team if persists

---

## 13. Support & Resources

### Getting Help

**Documentation**:

- [API Documentation](./API_CLIENT.md)
- [Caching Strategy](./CACHING_STRATEGY.md)
- [Security Guide](./SECURITY.md)
- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)

**Developer Contact**:

- Email: dev@letitrip.in
- Slack: #admin-support channel

**Emergency Contact**:

- Critical issues only
- Email: emergency@letitrip.in
- Phone: [Add phone number]

### Keyboard Shortcuts

| Shortcut     | Action             |
| ------------ | ------------------ |
| `G` then `D` | Go to Dashboard    |
| `G` then `U` | Go to Users        |
| `G` then `P` | Go to Products     |
| `G` then `O` | Go to Orders       |
| `G` then `R` | Go to Reviews      |
| `G` then `S` | Go to Settings     |
| `/`          | Focus search bar   |
| `Esc`        | Close modal/dialog |

---

## Appendix

### Glossary

- **Session**: Active login on a device
- **Role**: Permission level (user, seller, moderator, admin)
- **Featured**: Highlighted on homepage or in search results
- **Pinned**: Always appears at top of list
- **Slug**: URL-friendly identifier
- **TTL**: Time To Live (cache expiration)
- **CORS**: Cross-Origin Resource Sharing

### Change Log

- **v1.0.0** (Feb 8, 2026) - Initial admin guide created

---

**Questions or Feedback?**

If you have suggestions for improving this guide, please contact the development team at dev@letitrip.in.

---

_This guide is maintained by the LetItRip.in development team and is updated regularly. Last review: February 8, 2026._
