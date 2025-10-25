# JustForView.in - Complete Routes Documentation

This document provides a comprehensive overview of all routes in the JustForView.in e-commerce application, including both app routes (user-facing pages) and API routes (backend endpoints).

## Table of Contents

1. [App Routes (User-Facing Pages)](#app-routes-user-facing-pages)
2. [API Routes (Backend Endpoints)](#api-routes-backend-endpoints)

---

## App Routes (User-Facing Pages)

### 1. Public Routes

#### 1.1 Core Pages

1. **/** - Homepage

   - Main landing page with featured products and categories
   - Public access

2. **/about** - About Us Page

   - Company information and mission
   - Public access

3. **/contact** - Contact Page

   - Contact form and company contact details
   - Public access

4. **/faq** - Frequently Asked Questions

   - Common questions and answers
   - Public access

5. **/help** - Help Center

   - User guides and support documentation
   - Public access

6. **/privacy** - Privacy Policy

   - Privacy policy and data handling information
   - Public access

7. **/terms** - Terms of Service

   - Terms and conditions for using the platform
   - Public access

8. **/cookies** - Cookie Policy
   - Information about cookie usage
   - Public access

#### 1.2 Product & Category Pages

9. **/products** - Products Listing

   - Browse all products with filtering and sorting
   - Public access

10. **/products/[slug]** - Individual Product Page

    - Detailed product information, reviews, and purchase options
    - Dynamic route for specific products
    - Public access

11. **/product/[slug]** - Alternative Product Page Route

    - Alternative routing for product pages
    - Dynamic route for specific products
    - Public access

12. **/categories** - Categories Listing

    - Browse all product categories
    - Public access

13. **/categories/[slug]** - Category Page

    - Products within a specific category
    - Dynamic route for specific categories
    - Public access

14. **/search** - Search Results
    - Product search functionality with filters
    - Public access

#### 1.3 Store & Seller Pages

17. **/stores** - All Stores

    - Browse all seller stores
    - Public access

18. **/store/[sellerId]** - Individual Store

    - Seller's store homepage
    - Dynamic route for specific sellers
    - Public access

19. **/store/[sellerId]/products** - Store Products

    - Products from a specific seller
    - Dynamic route for specific sellers
    - Public access

20. **/store/[sellerId]/auctions** - Store Auctions
    - Auctions from a specific seller
    - Dynamic route for specific sellers
    - Public access

#### 1.4 Auction Pages

21. **/auctions** - All Auctions

    - Browse all active auctions
    - Public access

22. **/auctions/[id]** - Individual Auction
    - Detailed auction page with bidding functionality
    - Dynamic route for specific auctions
    - Public access

### 2. Authentication Routes

#### 2.1 Auth Pages (Group Route: (auth))

23. **/login** - User Login

    - User authentication page
    - Public access (redirects if already logged in)

24. **/register** - User Registration

    - New user account creation
    - Public access (redirects if already logged in)

25. **/forgot-password** - Password Reset
    - Password recovery functionality
    - Public access

### 3. Protected User Routes

#### 3.1 User Account Management

26. **/account** - User Account Overview

    - Account dashboard and settings
    - Requires authentication

27. **/profile** - User Profile

    - User profile information and editing
    - Requires authentication

28. **/addresses** - Address Management

    - Manage shipping and billing addresses
    - Requires authentication

29. **/settings** - User Settings
    - Account preferences and configuration
    - Requires authentication

#### 3.2 Shopping & Orders

30. **/cart** - Shopping Cart

    - View and manage cart items
    - Requires authentication

31. **/checkout** - Checkout Process

    - Order placement and payment
    - Requires authentication

32. **/orders** - Order History

    - View past and current orders
    - Requires authentication

33. **/track-order** - Order Tracking

    - Track order status and shipment
    - Requires authentication

34. **/wishlist** - User Wishlist

    - Saved products for later purchase
    - Requires authentication

35. **/compare** - Product Comparison

    - Compare multiple products
    - Requires authentication

36. **/returns** - Returns & Refunds

    - Manage product returns and refunds
    - Requires authentication

37. **/reviews** - User Reviews

    - Manage user-submitted reviews
    - Requires authentication

38. **/notifications** - User Notifications

    - View system notifications and messages
    - Requires authentication

39. **/shipping** - Shipping Information

    - Shipping options and tracking
    - Requires authentication

40. **/dashboard** - User Dashboard
    - Personal dashboard with account overview
    - Requires authentication

### 4. Seller Routes

#### 4.1 Seller Dashboard & Management

41. **/seller/dashboard** - Seller Dashboard

    - Seller control panel and overview
    - Requires seller authentication

42. **/seller/analytics** - Seller Analytics

    - Sales analytics and performance metrics
    - Requires seller authentication

43. **/seller/settings** - Seller Settings

    - Seller account and store configuration
    - Requires seller authentication

44. **/seller/settings/theme** - Seller Theme Settings
    - Store theme and appearance customization
    - Requires seller authentication

#### 4.2 Product Management

45. **/seller/products** - Seller Products

    - Manage seller's product inventory
    - Requires seller authentication

46. **/seller/products/new** - Add New Product

    - Create new product listings
    - Requires seller authentication

47. **/seller/inventory** - Inventory Management
    - Stock management and inventory tracking
    - Requires seller authentication

#### 4.3 Order & Sales Management

48. **/seller/orders** - Seller Orders

    - Manage incoming orders and fulfillment
    - Requires seller authentication

49. **/seller/auctions** - Seller Auctions

    - Manage auction listings
    - Requires seller authentication

50. **/seller/notifications** - Seller Notifications
    - View seller-specific notifications
    - Requires seller authentication

### 5. Admin Routes

#### 5.1 Admin Dashboard & Analytics

53. **/admin/dashboard** - Admin Dashboard

    - Administrative control panel
    - Requires admin authentication

54. **/admin/analytics** - Admin Analytics

    - Platform-wide analytics and reports
    - Requires admin authentication

55. **/admin/initialize** - System Initialization
    - System setup and configuration
    - Requires admin authentication

#### 5.2 Content Management

56. **/admin/products** - Product Management

    - Manage all products on the platform
    - Requires admin authentication

57. **/admin/categories** - Category Management

    - Manage product categories and hierarchy
    - Requires admin authentication

58. **/admin/auctions** - Auction Management

    - Oversee all auction activities
    - Requires admin authentication

59. **/admin/homepage** - Homepage Management
    - Configure homepage content and layout
    - Requires admin authentication

#### 5.3 User & Order Management

60. **/admin/customers** - Customer Management

    - Manage user accounts and customer data
    - Requires admin authentication

61. **/admin/orders** - Order Management

    - Oversee all platform orders
    - Requires admin authentication

62. **/admin/reviews** - Review Management

    - Moderate and manage product reviews
    - Requires admin authentication

63. **/admin/notifications** - Notification Management
    - Manage system-wide notifications
    - Requires admin authentication

#### 5.4 Platform Configuration

64. **/admin/settings** - Admin Settings

    - Platform configuration and settings
    - Requires admin authentication

65. **/admin/settings/theme** - Theme Management

    - Platform-wide theme and appearance settings
    - Requires admin authentication

66. **/admin/coupons** - Coupon Management

    - Manage platform-wide coupons and promotions
    - Requires admin authentication

67. **/admin/policies** - Policy Management

    - Manage terms, privacy, and other policies
    - Requires admin authentication

68. **/admin/data-management** - Data Management
    - Data import/export and maintenance tools
    - Requires admin authentication

### 6. Development & Testing Routes

#### 6.1 Authentication Testing

69. **/auth-debug** - Authentication Debug

    - Debug authentication flow
    - Development/testing only

70. **/auth-status** - Authentication Status

    - Check authentication status
    - Development/testing only

71. **/auto-login-test** - Auto Login Test

    - Test automatic login functionality
    - Development/testing only

72. **/test-auth** - Authentication Test
    - Test authentication scenarios
    - Development/testing only

#### 6.2 Feature Testing

73. **/test-navigation** - Navigation Test

    - Test navigation functionality
    - Development/testing only

74. **/test-roles** - Role Testing

    - Test user role permissions
    - Development/testing only

75. **/user-features** - User Features Test

    - Test user-specific features
    - Development/testing only

76. **/unauthorized** - Unauthorized Access
    - Handle unauthorized access attempts
    - Error handling page

---

## API Routes (Backend Endpoints)

### 1. Authentication API

#### 1.1 Core Authentication

1. **POST /api/auth/register** - User Registration

   - Create new user account
   - Body: email, password, name, role

2. **POST /api/auth/login** - User Login

   - Authenticate user credentials
   - Body: email, password

3. **POST /api/auth/logout** - User Logout

   - End user session
   - Requires authentication

4. **GET /api/auth/me** - Get Current User
   - Retrieve current user information
   - Requires authentication

### 2. User Management API

#### 2.1 User Profile

5. **GET /api/user/profile** - Get User Profile

   - Retrieve user profile data
   - Requires authentication

6. **PUT /api/user/profile** - Update User Profile

   - Update user information
   - Requires authentication

7. **GET /api/user/dashboard/stats** - User Dashboard Stats
   - Get user-specific statistics
   - Requires authentication

#### 2.2 User Addresses

8. **GET /api/user/addresses** - Get User Addresses

   - Retrieve all user addresses
   - Requires authentication

9. **POST /api/user/addresses** - Create User Address

   - Add new address
   - Requires authentication

10. **PUT /api/user/addresses/[id]** - Update Address

    - Update specific address
    - Requires authentication

11. **DELETE /api/user/addresses/[id]** - Delete Address
    - Remove specific address
    - Requires authentication

#### 2.3 User Orders

12. **GET /api/user/orders** - Get User Orders

    - Retrieve user's order history
    - Requires authentication

13. **POST /api/user/orders** - Create Order
    - Place new order
    - Requires authentication

#### 2.4 User Preferences

14. **GET /api/user/wishlist** - Get User Wishlist

    - Retrieve user's saved products
    - Requires authentication

15. **POST /api/user/wishlist** - Add to Wishlist

    - Add product to wishlist
    - Requires authentication

16. **DELETE /api/user/wishlist** - Remove from Wishlist

    - Remove product from wishlist
    - Requires authentication

17. **GET /api/user/watchlist** - Get User Watchlist

    - Retrieve user's watched auctions
    - Requires authentication

18. **POST /api/user/watchlist** - Add to Watchlist

    - Add auction to watchlist
    - Requires authentication

19. **GET /api/user/bids** - Get User Bids

    - Retrieve user's auction bids
    - Requires authentication

20. **GET /api/user/returns** - Get User Returns

    - Retrieve user's return requests
    - Requires authentication

21. **POST /api/user/returns** - Create Return Request

    - Submit return request
    - Requires authentication

22. **GET /api/user/theme-settings** - Get Theme Settings

    - Retrieve user theme preferences
    - Requires authentication

23. **PUT /api/user/theme-settings** - Update Theme Settings
    - Update user theme preferences
    - Requires authentication

### 3. Product Management API

#### 3.1 Product CRUD

24. **GET /api/products** - Get All Products

    - Retrieve products with filtering and pagination
    - Public access

25. **POST /api/products** - Create Product

    - Add new product
    - Requires seller/admin authentication

26. **GET /api/products/[slug]** - Get Product by Slug

    - Retrieve specific product details
    - Public access

27. **PUT /api/products/[slug]** - Update Product

    - Update product information
    - Requires seller/admin authentication

28. **DELETE /api/products/[slug]** - Delete Product

    - Remove product listing
    - Requires seller/admin authentication

29. **GET /api/products/featured** - Get Featured Products
    - Retrieve featured/promoted products
    - Public access

#### 3.2 Product Reviews

30. **GET /api/products/[slug]/reviews** - Get Product Reviews

    - Retrieve reviews for specific product
    - Public access

31. **POST /api/products/[slug]/reviews** - Create Product Review

    - Submit product review
    - Requires authentication

32. **GET /api/reviews** - Get All Reviews

    - Retrieve reviews with filtering
    - Public access

33. **POST /api/reviews** - Create Review

    - Submit new review
    - Requires authentication

34. **PUT /api/reviews/[id]/helpful** - Mark Review Helpful
    - Mark review as helpful
    - Requires authentication

### 4. Category Management API

#### 4.1 Category Operations

35. **GET /api/categories** - Get All Categories

    - Retrieve category hierarchy
    - Public access

36. **POST /api/categories** - Create Category

    - Add new category
    - Requires admin authentication

37. **PUT /api/categories** - Update Category

    - Update category information
    - Requires admin authentication

38. **DELETE /api/categories** - Delete Category

    - Remove category
    - Requires admin authentication

39. **GET /api/categories/root** - Get Root Categories

    - Retrieve top-level categories
    - Public access

40. **GET /api/categories/[slug]/products** - Get Category Products
    - Retrieve products in specific category
    - Public access

### 5. Shopping Cart API

#### 5.1 Cart Operations

41. **GET /api/cart** - Get Shopping Cart

    - Retrieve user's cart contents
    - Requires authentication

42. **POST /api/cart/add** - Add to Cart

    - Add product to shopping cart
    - Requires authentication

43. **DELETE /api/cart/remove** - Remove from Cart

    - Remove item from cart
    - Requires authentication

44. **POST /api/cart/bulk** - Bulk Cart Operations
    - Perform multiple cart operations
    - Requires authentication

### 6. Order Management API

#### 6.1 Order Operations

45. **GET /api/orders** - Get Orders

    - Retrieve orders (user/seller/admin based on role)
    - Requires authentication

46. **POST /api/orders** - Create Order

    - Place new order
    - Requires authentication

47. **GET /api/orders/[id]** - Get Order Details

    - Retrieve specific order information
    - Requires authentication

48. **PUT /api/orders/[id]** - Update Order

    - Update order status/details
    - Requires seller/admin authentication

49. **GET /api/orders/track** - Track Order
    - Get order tracking information
    - Requires authentication

### 7. Auction System API

#### 7.1 Auction Management

50. **GET /api/auctions** - Get All Auctions

    - Retrieve active auctions
    - Public access

51. **POST /api/auctions** - Create Auction

    - Create new auction listing
    - Requires seller authentication

52. **GET /api/auctions/[id]** - Get Auction Details

    - Retrieve specific auction information
    - Public access

53. **PUT /api/auctions/[id]** - Update Auction

    - Update auction details
    - Requires seller authentication

54. **DELETE /api/auctions/[id]** - Delete Auction

    - Remove auction listing
    - Requires seller authentication

55. **GET /api/auctions/featured** - Get Featured Auctions
    - Retrieve promoted auctions
    - Public access

#### 7.2 Bidding System

56. **GET /api/auctions/[id]/bids** - Get Auction Bids

    - Retrieve bids for specific auction
    - Public access

57. **POST /api/auctions/[id]/bids** - Place Bid

    - Submit bid on auction
    - Requires authentication

58. **GET /api/auctions/[id]/watchlist** - Get Auction Watchers

    - Retrieve auction watchlist
    - Requires seller authentication

59. **POST /api/auctions/[id]/watchlist** - Add to Watchlist
    - Add auction to user's watchlist
    - Requires authentication

### 8. Seller API

#### 8.1 Seller Dashboard

60. **GET /api/seller/dashboard/stats** - Seller Dashboard Stats

    - Get seller performance statistics
    - Requires seller authentication

61. **GET /api/seller/analytics** - Seller Analytics

    - Retrieve detailed seller analytics
    - Requires seller authentication

62. **GET /api/seller/info** - Get Seller Information

    - Retrieve seller profile and store info
    - Requires seller authentication

63. **PUT /api/seller/info** - Update Seller Information
    - Update seller profile
    - Requires seller authentication

#### 8.2 Seller Product Management

64. **GET /api/seller/products** - Get Seller Products

    - Retrieve seller's product listings
    - Requires seller authentication

65. **POST /api/seller/products** - Create Seller Product

    - Add new product as seller
    - Requires seller authentication

66. **GET /api/seller/products/[id]** - Get Seller Product

    - Retrieve specific seller product
    - Requires seller authentication

67. **PUT /api/seller/products/[id]** - Update Seller Product

    - Update seller's product
    - Requires seller authentication

68. **DELETE /api/seller/products/[id]** - Delete Seller Product
    - Remove seller's product
    - Requires seller authentication

#### 8.3 Seller Auction Management

69. **GET /api/seller/auctions** - Get Seller Auctions

    - Retrieve seller's auction listings
    - Requires seller authentication

70. **POST /api/seller/auctions** - Create Seller Auction

    - Create new auction as seller
    - Requires seller authentication

71. **GET /api/seller/auctions/[id]** - Get Seller Auction

    - Retrieve specific seller auction
    - Requires seller authentication

72. **PUT /api/seller/auctions/[id]** - Update Seller Auction

    - Update seller's auction
    - Requires seller authentication

73. **DELETE /api/seller/auctions/[id]** - Delete Seller Auction
    - Remove seller's auction
    - Requires seller authentication

#### 8.4 Seller Operations

74. **GET /api/seller/orders** - Get Seller Orders

    - Retrieve orders for seller's products
    - Requires seller authentication

75. **GET /api/seller/notifications** - Get Seller Notifications

    - Retrieve seller-specific notifications
    - Requires seller authentication

76. **GET /api/seller/store-settings** - Get Store Settings

    - Retrieve seller store configuration
    - Requires seller authentication

77. **PUT /api/seller/store-settings** - Update Store Settings
    - Update seller store settings
    - Requires seller authentication

### 9. Store/Seller Public API

#### 9.1 Public Store Access

78. **GET /api/sellers/[sellerId]** - Get Seller Store Info

    - Retrieve public seller information
    - Public access

79. **GET /api/sellers/[sellerId]/products** - Get Seller Products (Public)

    - Retrieve seller's products (public view)
    - Public access

80. **GET /api/sellers/[sellerId]/auctions** - Get Seller Auctions (Public)

    - Retrieve seller's auctions (public view)
    - Public access

81. **GET /api/stores** - Get All Stores
    - Retrieve list of all seller stores
    - Public access

### 10. Payment API

#### 10.1 Razorpay Integration

82. **POST /api/payment/razorpay/create-order** - Create Payment Order

    - Initialize payment with Razorpay
    - Requires authentication

83. **POST /api/payment/razorpay/verify** - Verify Payment

    - Verify payment completion
    - Requires authentication

84. **POST /api/payment/razorpay/webhook** - Payment Webhook
    - Handle Razorpay webhook events
    - Internal/webhook access

### 11. Shipping API

#### 11.1 General Shipping

85. **GET /api/shipping** - Get Shipping Options

    - Retrieve available shipping methods
    - Public access

86. **POST /api/shipping** - Calculate Shipping
    - Calculate shipping costs
    - Public access

#### 11.2 Shiprocket Integration

87. **POST /api/shipping/shiprocket/create-order** - Create Shipping Order

    - Create order with Shiprocket
    - Requires seller/admin authentication

88. **GET /api/shipping/shiprocket/rates** - Get Shipping Rates

    - Get shipping rates from Shiprocket
    - Requires authentication

89. **GET /api/shipping/shiprocket/serviceability** - Check Serviceability

    - Check delivery serviceability
    - Public access

90. **GET /api/shipping/shiprocket/track/[awb]** - Track Shipment
    - Track shipment by AWB number
    - Public access

### 12. Coupon API

#### 12.1 Coupon Management

91. **GET /api/coupons** - Get Available Coupons

    - Retrieve active coupons
    - Public access

92. **POST /api/coupons** - Create Coupon

    - Create new coupon
    - Requires seller/admin authentication

93. **GET /api/coupons/[id]** - Get Coupon Details

    - Retrieve specific coupon information
    - Public access

94. **PUT /api/coupons/[id]** - Update Coupon

    - Update coupon details
    - Requires seller/admin authentication

95. **DELETE /api/coupons/[id]** - Delete Coupon

    - Remove coupon
    - Requires seller/admin authentication

96. **POST /api/coupons/validate** - Validate Coupon

    - Check coupon validity and applicability
    - Requires authentication

### 13. Search API

#### 13.1 Search Operations

97. **GET /api/search** - Search Products

    - Search products, sellers, and categories
    - Public access

98. **POST /api/search** - Advanced Search
    - Perform advanced search with filters
    - Public access

### 14. Admin API

#### 14.1 Admin Dashboard

99. **GET /api/admin/dashboard/stats** - Admin Dashboard Stats

    - Retrieve platform-wide statistics
    - Requires admin authentication

100. **GET /api/admin/analytics** - Admin Analytics

     - Comprehensive platform analytics
     - Requires admin authentication

101. **GET /api/admin/analytics/sales** - Sales Analytics

     - Sales-specific analytics
     - Requires admin authentication

102. **GET /api/admin/analytics/top-products** - Top Products Analytics

     - Best-performing products analytics
     - Requires admin authentication

103. **GET /api/admin/analytics/user-activity** - User Activity Analytics
     - User engagement and activity analytics
     - Requires admin authentication

#### 14.2 Admin User Management

104. **GET /api/admin/users** - Get All Users

     - Retrieve all platform users
     - Requires admin authentication

105. **PUT /api/admin/users/[id]/role** - Update User Role

     - Change user role (customer/seller/admin)
     - Requires admin authentication

106. **PUT /api/admin/users/[id]/verify** - Verify User

     - Verify user account
     - Requires admin authentication

107. **PUT /api/admin/users/[id]/featured** - Feature User/Store

     - Mark seller as featured
     - Requires admin authentication

108. **PUT /api/admin/users/[id]/store-status** - Update Store Status
     - Enable/disable seller store
     - Requires admin authentication

#### 14.3 Admin Content Management

109. **GET /api/admin/products** - Admin Get All Products

     - Retrieve all products for admin management
     - Requires admin authentication

110. **PUT /api/admin/products** - Admin Update Product

     - Admin-level product updates
     - Requires admin authentication

111. **DELETE /api/admin/products** - Admin Delete Product

     - Admin-level product removal
     - Requires admin authentication

112. **GET /api/admin/auctions** - Admin Get All Auctions

     - Retrieve all auctions for admin management
     - Requires admin authentication

113. **PUT /api/admin/auctions** - Admin Update Auction

     - Admin-level auction updates
     - Requires admin authentication

114. **DELETE /api/admin/auctions** - Admin Delete Auction
     - Admin-level auction removal
     - Requires admin authentication

#### 14.4 Admin Order Management

115. **GET /api/admin/orders** - Admin Get All Orders

     - Retrieve all platform orders
     - Requires admin authentication

116. **PUT /api/admin/orders** - Admin Update Order
     - Admin-level order management
     - Requires admin authentication

#### 14.5 Admin Review Management

117. **GET /api/admin/reviews** - Admin Get All Reviews

     - Retrieve all platform reviews
     - Requires admin authentication

118. **PUT /api/admin/reviews/[id]** - Admin Update Review

     - Moderate/update review
     - Requires admin authentication

119. **DELETE /api/admin/reviews/[id]** - Admin Delete Review
     - Remove inappropriate review
     - Requires admin authentication

#### 14.6 Admin Notification Management

120. **GET /api/admin/notifications** - Admin Get Notifications

     - Retrieve admin notifications
     - Requires admin authentication

121. **POST /api/admin/notifications** - Admin Create Notification

     - Create system-wide notification
     - Requires admin authentication

122. **PUT /api/admin/notifications/[id]** - Admin Update Notification

     - Update notification details
     - Requires admin authentication

123. **DELETE /api/admin/notifications/[id]** - Admin Delete Notification

     - Remove notification
     - Requires admin authentication

124. **PUT /api/admin/notifications/[id]/toggle** - Toggle Notification
     - Enable/disable notification
     - Requires admin authentication

#### 14.7 Admin System Management

125. **GET /api/admin/settings** - Admin Get Settings

     - Retrieve platform settings
     - Requires admin authentication

126. **PUT /api/admin/settings** - Admin Update Settings

     - Update platform configuration
     - Requires admin authentication

127. **POST /api/admin/initialize** - Initialize System

     - System initialization and setup
     - Requires admin authentication

128. **POST /api/admin/cleanup** - System Cleanup

     - Perform system maintenance tasks
     - Requires admin authentication

129. **POST /api/admin/migrate-sellers** - Migrate Seller Data
     - Data migration for sellers
     - Requires admin authentication

### 15. Utility & System API

#### 15.1 General Utilities

130. **GET /api/settings** - Get Platform Settings

     - Retrieve public platform settings
     - Public access

131. **POST /api/contact** - Contact Form

     - Submit contact form
     - Public access

132. **GET /api/cookies** - Get Cookie Preferences

     - Retrieve cookie settings
     - Public access

133. **PUT /api/cookies** - Update Cookie Preferences
     - Update cookie preferences
     - Public access

#### 15.2 Testing & Development

134. **GET /api/test-rate-limit** - Test Rate Limiting
     - Test API rate limiting functionality
     - Development/testing only

---

## Route Categories Summary

### App Routes Summary:

- **Public Routes**: 20 routes (homepage, products, categories, etc.)
- **Authentication Routes**: 3 routes (login, register, forgot-password)
- **User Protected Routes**: 14 routes (account, cart, orders, etc.)
- **Seller Routes**: 11 routes (dashboard, products, analytics, etc.)
- **Admin Routes**: 16 routes (dashboard, management, analytics, etc.)
- **Development/Testing Routes**: 9 routes (debug and testing pages)

**Total App Routes**: 73 routes

### API Routes Summary:

- **Authentication API**: 4 endpoints
- **User Management API**: 19 endpoints
- **Product Management API**: 11 endpoints
- **Category Management API**: 6 endpoints
- **Shopping Cart API**: 4 endpoints
- **Order Management API**: 5 endpoints
- **Auction System API**: 10 endpoints
- **Seller API**: 18 endpoints
- **Store/Seller Public API**: 4 endpoints
- **Payment API**: 3 endpoints
- **Shipping API**: 6 endpoints
- **Coupon API**: 6 endpoints
- **Search API**: 2 endpoints
- **Admin API**: 30 endpoints
- **Utility & System API**: 6 endpoints

**Total API Routes**: 134 endpoints

---

## Authentication & Access Control

### Access Levels:

1. **Public**: No authentication required
2. **Authenticated**: Requires user login
3. **Seller**: Requires seller role
4. **Admin**: Requires admin role
5. **Development**: Development/testing environment only

### Route Groups:

- **(auth)**: Authentication-related pages with special routing
- **(shop)**: Shopping-related pages (if used)
- **Dynamic Routes**: Routes with parameters like [id], [slug], [sellerId]

This documentation provides a comprehensive overview of all routes in the JustForView.in platform, enabling developers and stakeholders to understand the complete application structure and functionality.
