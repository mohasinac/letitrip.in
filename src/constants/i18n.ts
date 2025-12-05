/**
 * Internationalization Constants - English (India)
 *
 * Central location for all user-facing text in the application.
 * Language: English (India) - en-IN
 *
 * Usage:
 * import { LANG } from '@/constants/i18n';
 * <button>{LANG.COMMON.BUTTONS.SAVE}</button>
 *
 * Structure:
 * - COMMON: Shared UI elements
 * - AUTH: Authentication & user management
 * - NAV: Navigation & layout
 * - PRODUCT: Product & shopping
 * - AUCTION: Auction-specific
 * - ORDER: Orders & checkout
 * - SHOP: Shop management
 * - ADMIN: Admin interface
 * - FORM: Forms & validation
 * - STATUS: Status messages & states
 * - EMPTY: Empty states & errors
 * - LEGAL: Legal & policies
 * - SUPPORT: Help & support
 */

// =============================================================================
// COMMON UI ELEMENTS
// =============================================================================

export const COMMON = {
  // General actions
  ACTIONS: {
    LOADING: "Loading...",
    UPLOADING: "Uploading...",
    PLEASE_WAIT: "Please wait...",
    PROCESSING: "Processing...",
    SEARCH: "Search...",
    FILTER: "Filter",
    SORT_BY: "Sort by",
    APPLY: "Apply",
    RESET: "Reset",
    CLEAR: "Clear",
    CANCEL: "Cancel",
    CONFIRM: "Confirm",
    SAVE: "Save",
    SAVE_CHANGES: "Save Changes",
    DELETE: "Delete",
    EDIT: "Edit",
    VIEW: "View",
    BACK: "Back",
    NEXT: "Next",
    PREVIOUS: "Previous",
    CONTINUE: "Continue",
    SUBMIT: "Submit",
    CLOSE: "Close",
    DISMISS: "Dismiss",
    LEARN_MORE: "Learn More",
    READ_MORE: "Read More",
    SHOW_MORE: "Show More",
    SHOW_LESS: "Show Less",
    VIEW_ALL: "View All",
    SEE_ALL: "See All",
    REFRESH: "Refresh",
    RELOAD: "Reload",
    RETRY: "Retry",
  },

  // Pagination
  PAGINATION: {
    PAGE: "Page {number}",
    PREVIOUS: "Previous",
    NEXT: "Next",
    SHOWING: "Showing {start}-{end} of {total} results",
    ITEMS_PER_PAGE: "Items per page",
    GO_TO_PAGE: "Go to page",
    FIRST: "First",
    LAST: "Last",
  },

  // Time relative
  TIME: {
    JUST_NOW: "Just now",
    MINUTES_AGO: "{n} minutes ago",
    HOURS_AGO: "{n} hours ago",
    YESTERDAY: "Yesterday",
    DAYS_AGO: "{n} days ago",
    WEEKS_AGO: "{n} weeks ago",
    MONTHS_AGO: "{n} months ago",
    YEARS_AGO: "{n} years ago",
    TODAY_AT: "Today at {time}",
    YESTERDAY_AT: "Yesterday at {time}",
  },

  // Numbers & currency
  CURRENCY: {
    PRICE: "₹{amount}",
    FREE: "Free",
    DISCOUNT: "{percentage}% off",
  },

  // Stock status
  STOCK: {
    OUT_OF_STOCK: "Out of Stock",
    IN_STOCK: "In Stock",
    LOW_STOCK: "Low Stock",
    AVAILABLE: "{number} available",
    ONLY_LEFT: "Only {number} left",
  },

  // Counts
  COUNT: {
    ITEMS: "{number} items",
    RESULTS: "{number} results",
    REVIEWS: "{count} reviews",
  },
} as const;

// =============================================================================
// AUTHENTICATION & USER MANAGEMENT
// =============================================================================

export const AUTH = {
  // Login page
  LOGIN: {
    TITLE: "Welcome Back",
    SUBTITLE: "Sign in to your account to continue",
    EMAIL_LABEL: "Email Address",
    PASSWORD_LABEL: "Password",
    REMEMBER_ME: "Remember me",
    FORGOT_PASSWORD: "Forgot Password?",
    SIGN_IN_BUTTON: "Sign In",
    SIGN_IN_WITH_GOOGLE: "Sign in with Google",
    NO_ACCOUNT: "Don't have an account?",
    CREATE_ACCOUNT: "Create Account",
    LOGIN_FAILED: "Login failed. Please try again.",
    INVALID_CREDENTIALS: "Invalid credentials",
    EMAIL_REQUIRED: "Email is required",
    PASSWORD_REQUIRED: "Password is required",
    SHOW_PASSWORD: "Show password",
    HIDE_PASSWORD: "Hide password",
  },

  // Register page
  REGISTER: {
    TITLE: "Create Your Account",
    SUBTITLE: "Join us and start shopping today",
    FULL_NAME: "Full Name",
    EMAIL: "Email Address",
    PASSWORD: "Password",
    CONFIRM_PASSWORD: "Confirm Password",
    PASSWORD_HINT: "Must be at least 8 characters",
    REGISTRATION_FAILED: "Registration failed. Please try again.",
    PASSWORDS_MISMATCH: "Passwords do not match",
    PASSWORD_TOO_WEAK: "Password too weak",
    EMAIL_TAKEN: "Email already registered",
    ACCEPT_TERMS: "Please accept the Terms of Service and Privacy Policy",
    AGREE_TO_TERMS: "I agree to the {terms} and {privacy}",
    TERMS_LINK: "Terms of Service",
    PRIVACY_LINK: "Privacy Policy",
    ALREADY_HAVE_ACCOUNT: "Already have an account?",
    SIGN_IN: "Sign In",
    CREATE_ACCOUNT_BUTTON: "Create Account",
    SIGN_UP_WITH_GOOGLE: "Sign up with Google",
  },

  // Password reset
  PASSWORD_RESET: {
    TITLE: "Reset your password",
    SUBTITLE: "Enter your new password below",
    BACK_TO_LOGIN: "Back to login",
    NEW_PASSWORD: "New Password",
    CONFIRM_PASSWORD_PLACEHOLDER: "Confirm new password",
    REQUIREMENTS_TITLE: "Password requirements:",
    REQ_LENGTH: "At least 8 characters",
    REQ_UPPERCASE: "One uppercase letter",
    REQ_LOWERCASE: "One lowercase letter",
    REQ_NUMBER: "One number",
    REQ_SPECIAL: "One special character",
    RESET_BUTTON: "Reset Password",
    ERROR_MIN_LENGTH: "Password must be at least 8 characters long",
    ERROR_UPPERCASE: "Password must contain at least one uppercase letter",
    ERROR_LOWERCASE: "Password must contain at least one lowercase letter",
    ERROR_NUMBER: "Password must contain at least one number",
    ERROR_SPECIAL: "Password must contain at least one special character",
    FAILED: "Failed to reset password",
  },

  // Profile
  PROFILE: {
    TITLE: "My Profile",
    ACCOUNT_SETTINGS: "Account Settings",
    EDIT_PROFILE: "Edit Profile",
    CHANGE_PASSWORD: "Change Password",
    CURRENT_PASSWORD: "Current Password",
    NEW_PASSWORD: "New Password",
    VERIFY_EMAIL: "Verify Email",
    VERIFY_PHONE: "Verify Phone",
    UPDATE_SUCCESS: "Profile updated successfully",
    PASSWORD_CHANGED: "Password changed successfully",
    EMAIL_VERIFICATION_SENT: "Email verification sent",
    PHONE_VERIFICATION_SENT: "Phone verification code sent",
  },

  // Verification
  VERIFICATION: {
    VERIFY_EMAIL_TITLE: "Verify Your Email",
    VERIFY_PHONE_TITLE: "Verify Your Phone",
    ENTER_OTP: "Enter OTP",
    EMAIL_CODE_SENT: "Enter the 6-digit code sent to your email",
    PHONE_CODE_SENT: "Enter the 6-digit code sent to your phone",
    RESEND_CODE: "Resend Code",
    VERIFY_BUTTON: "Verify",
    INVALID_OTP: "Invalid OTP",
    OTP_EXPIRED: "OTP expired",
    VERIFICATION_SUCCESS: "Verification successful",
  },

  // Placeholders
  PLACEHOLDERS: {
    EMAIL: "you@example.com",
    NAME: "John Doe",
    PASSWORD: "••••••••",
  },
} as const;

// =============================================================================
// NAVIGATION & LAYOUT
// =============================================================================

export const NAV = {
  // Header/NavBar
  HEADER: {
    WELCOME: "Welcome to {companyName}",
    TAGLINE: "Your Gateway to Authentic Collectibles",
    SEARCH_PLACEHOLDER: "Search products, shops, auctions...",
    ALL_CATEGORIES: "All Categories",
    PRODUCTS: "Products",
    AUCTIONS: "Auctions",
    SHOPS: "Shops",
    CATEGORIES: "Categories",
    ABOUT: "About",
    CONTACT: "Contact",
    HELP: "Help",
    CART: "Cart",
    FAVORITES: "Favorites",
    MY_ACCOUNT: "My Account",
    SIGN_IN: "Sign In",
    SIGN_OUT: "Sign Out",
    ADMIN_PANEL: "Admin Panel",
    SELLER_DASHBOARD: "Seller Dashboard",
    CART_ITEMS: "{number} items in cart",
    CART_TOTAL: "₹{amount} total",
  },

  // Footer
  FOOTER: {
    ABOUT_SECTION: "About Let It Rip",
    ABOUT_LINK: "About Let It Rip",
    TERMS: "Terms of Service",
    PRIVACY: "Privacy Policy",
    REFUND: "Refund Policy",
    SHIPPING: "Shipping Policy",
    COOKIE: "Cookie Policy",
    SHOPPING_SECTION: "Shopping Notes",
    FAQ: "FAQ",
    NEW_USER_GUIDE: "New Users' Guide",
    RETURNS: "Returns & Refunds",
    PROHIBITED: "Prohibited Items",
    FEE_SECTION: "Fee Description",
    PAYMENT_METHODS: "Payment Methods",
    FEE_STRUCTURE: "Fee Structure",
    OPTIONAL_SERVICES: "Optional Services",
    INTERNATIONAL_SHIPPING: "International Shipping",
    COMPANY_SECTION: "Company Information",
    COMPANY_OVERVIEW: "Company Overview",
    CUSTOMER_TICKET: "Customer Ticket",
    HELP_TEXT: "Need help? Please use the Customer Ticket",
    PAYMENT_ACCEPTED: "Payment Methods Accepted",
    FOLLOW_US: "Follow Us",
    COPYRIGHT: "Copyright © 2015-2025 letitrip.com. All Rights Reserved",
  },

  // Breadcrumbs
  BREADCRUMBS: {
    HOME: "Home",
    PRODUCTS: "Products",
    AUCTIONS: "Auctions",
    CATEGORIES: "Categories",
    SHOPS: "Shops",
  },
} as const;

// =============================================================================
// PRODUCT & SHOPPING
// =============================================================================

export const PRODUCT = {
  // Product cards
  CARD: {
    ADD_TO_CART: "Add to Cart",
    QUICK_VIEW: "Quick View",
    ADD_TO_FAVORITES: "Add to Favorites",
    REMOVE_FROM_FAVORITES: "Remove from Favorites",
    COMPARE: "Compare",
    CONDITION_NEW: "New",
    CONDITION_USED: "Used",
    CONDITION_REFURBISHED: "Refurbished",
    FEATURED: "Featured",
    OUT_OF_STOCK: "Out of Stock",
    IN_STOCK: "In Stock",
    RATING: "{rating} stars",
    REVIEWS: "({reviewCount} reviews)",
    PRICE: "₹{price}",
    ORIGINAL_PRICE: "₹{originalPrice}",
    DISCOUNT: "{percentage}% off",
    FREE_SHIPPING: "Free Shipping",
  },

  // Product details
  DETAILS: {
    TITLE: "Product Details",
    DESCRIPTION: "Description",
    SPECIFICATIONS: "Specifications",
    REVIEWS: "Reviews",
    RELATED: "Related Products",
    YOU_MAY_LIKE: "You may also like",
    CONDITION: "Condition",
    SKU: "SKU",
    BRAND: "Brand",
    CATEGORY: "Category",
    TAGS: "Tags",
    SHARE: "Share",
    REPORT: "Report Product",
    ADD_TO_CART: "Add to Cart",
    BUY_NOW: "Buy Now",
    ADD_TO_WISHLIST: "Add to Wishlist",
    ADD_TO_COMPARE: "Add to Compare",
    SELECT_QUANTITY: "Select Quantity",
    QUANTITY: "Quantity",
    IN_STOCK_COUNT: "{number} in stock",
    ONLY_LEFT: "Only {number} left",
    NOTIFY_AVAILABLE: "Notify me when available",
    ADDED_TO_CART: "Product added to cart",
    REMOVED_FROM_CART: "Product removed from cart",
    ADDED_TO_FAVORITES: "Added to favorites",
    REMOVED_FROM_FAVORITES: "Removed from favorites",
    ADDED_TO_COMPARE: "Added to compare list",
    REMOVED_FROM_COMPARE: "Removed from compare list",
  },

  // Product listing
  LISTING: {
    ALL_PRODUCTS: "All Products",
    FEATURED: "Featured Products",
    LATEST: "Latest Products",
    BEST_SELLERS: "Best Sellers",
    NEW_ARRIVALS: "New Arrivals",
    ON_SALE: "On Sale",
    FILTER_BY: "Filter by",
    SORT_BY: "Sort by",
    SORT_PRICE_LOW: "Price: Low to High",
    SORT_PRICE_HIGH: "Price: High to Low",
    SORT_NEWEST: "Newest First",
    SORT_OLDEST: "Oldest First",
    SORT_POPULAR: "Most Popular",
    SORT_RATED: "Highest Rated",
    PRICE_RANGE: "Price Range",
    MIN_PRICE: "Min Price",
    MAX_PRICE: "Max Price",
    CATEGORY: "Category",
    BRAND: "Brand",
    CONDITION: "Condition",
    RATING: "Rating",
    AVAILABILITY: "Availability",
    CLEAR_FILTERS: "Clear Filters",
    APPLY_FILTERS: "Apply Filters",
    PRODUCTS_FOUND: "{count} products found",
    NO_PRODUCTS: "No products found",
    TRY_ADJUSTING: "Try adjusting your filters",
  },

  // Shopping cart
  CART: {
    TITLE: "Shopping Cart",
    YOUR_CART: "Your Cart",
    EMPTY: "Cart is empty",
    CONTINUE_SHOPPING: "Continue Shopping",
    PROCEED_CHECKOUT: "Proceed to Checkout",
    UPDATE_CART: "Update Cart",
    REMOVE: "Remove",
    QUANTITY: "Quantity",
    PRICE: "Price",
    SUBTOTAL: "Subtotal",
    TOTAL: "Total",
    ESTIMATED_TOTAL: "Estimated Total",
    SHIPPING: "Shipping",
    TAX: "Tax",
    DISCOUNT: "Discount",
    APPLY_COUPON: "Apply Coupon",
    COUPON_CODE: "Coupon Code",
    APPLY: "Apply",
    COUPON_APPLIED: "Coupon applied successfully",
    INVALID_COUPON: "Invalid coupon code",
    ITEMS_IN_CART: "{number} items in cart",
    CART_UPDATED: "Cart updated",
    ITEM_REMOVED: "Item removed from cart",
  },

  // Comparison
  COMPARE: {
    TITLE: "Compare Products",
    ADD_TO_COMPARE: "Add to Compare",
    REMOVE_FROM_COMPARE: "Remove from Compare",
    COMPARE_NOW: "Compare Now",
    CLEAR_ALL: "Clear All",
    SELECT_PRODUCTS: "Select products to compare",
    MAX_PRODUCTS: "You can compare up to {number} products",
    COMPARISON_TITLE: "Product Comparison",
    ADD_MORE: "Add more products",
    PRICE: "Price",
    RATING: "Rating",
    REVIEWS: "Reviews",
    CONDITION: "Condition",
    STOCK: "Stock",
    FEATURES: "Features",
  },

  // Recently viewed
  RECENTLY_VIEWED: {
    TITLE: "Recently Viewed Products",
    CONTINUE_BROWSING: "Continue Browsing",
    VIEW_HISTORY: "View History",
    CLEAR_HISTORY: "Clear History",
    NO_PRODUCTS: "You haven't viewed any products yet",
  },
} as const;

// =============================================================================
// AUCTIONS
// =============================================================================

export const AUCTION = {
  // Auction cards
  CARD: {
    CURRENT_BID: "Current Bid",
    STARTING_BID: "Starting Bid",
    RESERVE_PRICE: "Reserve Price",
    TIME_REMAINING: "Time Remaining",
    ENDS_IN: "Ends in {time}",
    ENDED: "Ended",
    PLACE_BID: "Place Bid",
    WATCH_AUCTION: "Watch Auction",
    BID_COUNT: "{bidCount} bids",
    NO_BIDS: "No bids yet",
    FIRST_BID: "Be the first to bid",
    HOT: "Hot Auction",
    FEATURED: "Featured Auction",
  },

  // Auction details
  DETAILS: {
    TITLE: "Auction Details",
    PLACE_YOUR_BID: "Place Your Bid",
    YOUR_MAX_BID: "Your Maximum Bid",
    CURRENT_BID: "Current Bid",
    STARTING_BID: "Starting Bid",
    RESERVE_PRICE: "Reserve Price",
    TIME_LEFT: "Time Left",
    ENDS_ON: "Ends on {date}",
    ENDED: "Auction has ended",
    BID_HISTORY: "Bid History",
    HIGHEST_BIDDER: "Highest Bidder",
    YOUR_BID: "Your Bid",
    BID_PLACED: "Bid Placed",
    YOU_HIGHEST: "You are the highest bidder",
    YOU_OUTBID: "You have been outbid",
    BID_AMOUNT: "Bid Amount",
    PLACE_BID_BUTTON: "Place Bid",
    CONFIRM_BID: "Confirm Bid",
    CANCEL_BID: "Cancel Bid",
    BID_TOO_LOW: "Bid must be higher than current bid",
    BID_SUCCESS: "Bid placed successfully",
    BID_FAILED: "Failed to place bid",
    AUCTION_WON: "Auction won",
    AUCTION_LOST: "Auction lost",
  },

  // Auction listing
  LISTING: {
    ALL: "All Auctions",
    LIVE: "Live Auctions",
    HOT: "Hot Auctions",
    FEATURED: "Featured Auctions",
    UPCOMING: "Upcoming Auctions",
    ENDED: "Ended Auctions",
    MY_BIDS: "My Bids",
    MY_WINS: "My Wins",
    WATCHING: "Watching",
    ENDING_SOON: "Ending Soon",
    RECENTLY_ADDED: "Recently Added",
    FILTER_BY: "Filter by",
    SORT_BY: "Sort by",
    SORT_ENDING_SOON: "Ending Soonest",
    SORT_NEWEST: "Newest First",
    SORT_LOW_BID: "Lowest Bid",
    SORT_HIGH_BID: "Highest Bid",
    AUCTIONS_FOUND: "{count} auctions found",
    NO_AUCTIONS: "No auctions found",
    NO_ACTIVE: "No active auctions at the moment",
  },
} as const;

// =============================================================================
// ORDERS & CHECKOUT
// =============================================================================

export const ORDER = {
  // Checkout
  CHECKOUT: {
    TITLE: "Checkout",
    SHIPPING_ADDRESS: "Shipping Address",
    BILLING_ADDRESS: "Billing Address",
    SAME_AS_SHIPPING: "Same as shipping address",
    PAYMENT_METHOD: "Payment Method",
    SELECT_PAYMENT: "Select Payment Method",
    CARD: "Credit/Debit Card",
    UPI: "UPI",
    NET_BANKING: "Net Banking",
    COD: "Cash on Delivery",
    ORDER_SUMMARY: "Order Summary",
    ITEMS: "Items",
    SUBTOTAL: "Subtotal",
    SHIPPING: "Shipping",
    TAX: "Tax",
    DISCOUNT: "Discount",
    TOTAL: "Total",
    PLACE_ORDER: "Place Order",
    REVIEW_ORDER: "Review Order",
    CONFIRM_PAY: "Confirm & Pay",
    ORDER_SUCCESS: "Order placed successfully",
    ORDER_FAILED: "Failed to place order",
    PAYMENT_SECURE: "Your payment information is encrypted and secure",
  },

  // Address form
  ADDRESS: {
    FULL_NAME: "Full Name",
    PHONE_NUMBER: "Phone Number",
    ADDRESS_LINE1: "Address Line 1",
    ADDRESS_LINE2: "Address Line 2",
    CITY: "City",
    STATE: "State",
    PINCODE: "PIN Code",
    LANDMARK: "Landmark",
    ADDRESS_TYPE: "Address Type",
    HOME: "Home",
    WORK: "Work",
    OTHER: "Other",
    SAVE_ADDRESS: "Save Address",
    SET_DEFAULT: "Set as default",
    ADD_NEW: "Add New Address",
    EDIT_ADDRESS: "Edit Address",
    DELETE_ADDRESS: "Delete Address",
  },

  // Payment
  PAYMENT: {
    CARD_NUMBER: "Card Number",
    CARDHOLDER_NAME: "Cardholder Name",
    EXPIRY_DATE: "Expiry Date",
    CVV: "CVV",
    UPI_ID: "UPI ID",
    SELECT_BANK: "Select Bank",
    ENTER_UPI: "Enter UPI ID",
    UPI_PLACEHOLDER: "yourname@upi",
    CVV_PLACEHOLDER: "123",
    PROCESSING: "Payment processing...",
    SUCCESS: "Payment successful",
    FAILED: "Payment failed",
    TRANSACTION_ID: "Transaction ID",
  },

  // Orders list
  ORDERS: {
    MY_ORDERS: "My Orders",
    ORDER_HISTORY: "Order History",
    ORDER_NUMBER: "Order #{orderNumber}",
    ORDER_DATE: "Order Date",
    ORDER_STATUS: "Order Status",
    ORDER_TOTAL: "Order Total",
    ORDER_DETAILS: "Order Details",
    TRACK_ORDER: "Track Order",
    CANCEL_ORDER: "Cancel Order",
    RETURN_ORDER: "Return Order",
    DOWNLOAD_INVOICE: "Download Invoice",
    VIEW_INVOICE: "View Invoice",
    REORDER: "Reorder",
    PENDING: "Pending",
    CONFIRMED: "Confirmed",
    PROCESSING: "Processing",
    SHIPPED: "Shipped",
    OUT_FOR_DELIVERY: "Out for Delivery",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
    RETURNED: "Returned",
    REFUNDED: "Refunded",
    EXPECTED_DELIVERY: "Expected Delivery",
    DELIVERED_ON: "Delivered on {date}",
    ESTIMATED_DELIVERY: "Estimated delivery: {date}",
    PLACED_ON: "Order placed on {date}",
    ITEM_COUNT: "{count} items",
    NO_ORDERS: "No orders yet",
    START_SHOPPING: "Start shopping to see your orders here",
  },

  // Returns & refunds
  RETURN: {
    TITLE: "Return Order",
    REQUEST_RETURN: "Request Return",
    RETURN_REASON: "Return Reason",
    RETURN_DETAILS: "Return Details",
    SELECT_ITEMS: "Select items to return",
    RETURN_METHOD: "Return Method",
    REFUND_AMOUNT: "Refund Amount",
    RETURN_STATUS: "Return Status",
    REQUESTED: "Return requested",
    APPROVED: "Return approved",
    REJECTED: "Return rejected",
    REFUND_PROCESSED: "Refund processed",
    REASON_NOT_WORKING: "Product not working",
    REASON_WRONG: "Received wrong product",
    REASON_DAMAGED: "Received damaged product",
    REASON_NOT_DESCRIBED: "Not as described",
    REASON_CHANGED_MIND: "Changed my mind",
    REASON_OTHER: "Other",
    DESCRIBE_ISSUE: "Please describe the issue",
    UPLOAD_IMAGES: "Upload images (optional)",
    SUBMIT_REQUEST: "Submit Return Request",
    REQUEST_SUBMITTED: "Return request submitted",
    APPROVED_MESSAGE: "Return approved",
    REFUND_TIME: "Refund will be processed within 5-7 business days",
  },
} as const;

// =============================================================================
// SHOP MANAGEMENT
// =============================================================================

export const SHOP = {
  // Dashboard
  DASHBOARD: {
    TITLE: "Seller Dashboard",
    MY_SHOP: "My Shop",
    OVERVIEW: "Shop Overview",
    STATISTICS: "Shop Statistics",
    TOTAL_PRODUCTS: "Total Products",
    TOTAL_ORDERS: "Total Orders",
    TOTAL_REVENUE: "Total Revenue",
    ACTIVE_AUCTIONS: "Active Auctions",
    PENDING_ORDERS: "Pending Orders",
    RECENT_ORDERS: "Recent Orders",
    TOP_PRODUCTS: "Top Products",
    PERFORMANCE: "Shop Performance",
    RATING: "Shop Rating",
    STARS: "{rating} stars",
    REVIEWS: "({reviewCount} reviews)",
  },

  // Profile
  PROFILE: {
    SHOP_DETAILS: "Shop Details",
    SHOP_NAME: "Shop Name",
    SHOP_DESCRIPTION: "Shop Description",
    SHOP_LOGO: "Shop Logo",
    SHOP_BANNER: "Shop Banner",
    SHOP_POLICIES: "Shop Policies",
    RETURN_POLICY: "Return Policy",
    SHIPPING_POLICY: "Shipping Policy",
    CONTACT_INFO: "Contact Information",
    BUSINESS_ADDRESS: "Business Address",
    GST_NUMBER: "GST Number",
    SAVE_CHANGES: "Save Changes",
    UPDATE_SUCCESS: "Shop updated successfully",
  },

  // Product management
  PRODUCTS: {
    MY_PRODUCTS: "My Products",
    ADD_NEW: "Add New Product",
    EDIT_PRODUCT: "Edit Product",
    DELETE_PRODUCT: "Delete Product",
    PRODUCT_NAME: "Product Name",
    PRODUCT_DESCRIPTION: "Product Description",
    PRODUCT_IMAGES: "Product Images",
    PRODUCT_VIDEOS: "Product Videos",
    PRODUCT_CATEGORY: "Product Category",
    PRODUCT_PRICE: "Product Price",
    ORIGINAL_PRICE: "Original Price",
    SALE_PRICE: "Sale Price",
    STOCK_QUANTITY: "Stock Quantity",
    SKU: "SKU",
    PRODUCT_CONDITION: "Product Condition",
    PRODUCT_TAGS: "Product Tags",
    FEATURED: "Featured Product",
    PUBLISH: "Publish Product",
    SAVE_DRAFT: "Save as Draft",
    STATUS: "Product Status",
    STATUS_DRAFT: "Draft",
    STATUS_PENDING: "Pending",
    STATUS_PUBLISHED: "Published",
    STATUS_ARCHIVED: "Archived",
    STATUS_REJECTED: "Rejected",
    CREATED_SUCCESS: "Product created successfully",
    UPDATED_SUCCESS: "Product updated successfully",
    DELETED_SUCCESS: "Product deleted successfully",
  },

  // Auction management
  AUCTIONS: {
    MY_AUCTIONS: "My Auctions",
    CREATE: "Create Auction",
    EDIT: "Edit Auction",
    DELETE: "Delete Auction",
    TITLE: "Auction Title",
    DESCRIPTION: "Auction Description",
    STARTING_BID: "Starting Bid",
    RESERVE_PRICE: "Reserve Price",
    DURATION: "Auction Duration",
    START_DATE: "Start Date",
    END_DATE: "End Date",
    STATUS: "Auction Status",
    STATUS_DRAFT: "Draft",
    STATUS_SCHEDULED: "Scheduled",
    STATUS_ACTIVE: "Active",
    STATUS_ENDED: "Ended",
    STATUS_CANCELLED: "Cancelled",
    STATUS_SOLD: "Sold",
    STATUS_UNSOLD: "Unsold",
    CURRENT_BIDS: "Current Bids",
    WINNER: "Winner",
    CREATED_SUCCESS: "Auction created successfully",
    UPDATED_SUCCESS: "Auction updated successfully",
    CANCELLED: "Auction cancelled",
  },

  // Order management
  ORDER_MANAGEMENT: {
    SHOP_ORDERS: "Shop Orders",
    NEW_ORDERS: "New Orders",
    PROCESSING: "Processing Orders",
    SHIPPED: "Shipped Orders",
    COMPLETED: "Completed Orders",
    CANCELLED: "Cancelled Orders",
    ORDER_DETAILS: "Order Details",
    CUSTOMER_DETAILS: "Customer Details",
    SHIPPING_ADDRESS: "Shipping Address",
    ORDER_ITEMS: "Order Items",
    ORDER_TOTAL: "Order Total",
    UPDATE_STATUS: "Update Order Status",
    MARK_CONFIRMED: "Mark as Confirmed",
    MARK_PROCESSING: "Mark as Processing",
    MARK_SHIPPED: "Mark as Shipped",
    MARK_DELIVERED: "Mark as Delivered",
    ADD_TRACKING: "Add Tracking Number",
    TRACKING_NUMBER: "Tracking Number",
    COURIER_SERVICE: "Courier Service",
    UPDATE_SUCCESS: "Order updated successfully",
  },
} as const;

// =============================================================================
// ADMIN INTERFACE
// =============================================================================

export const ADMIN = {
  // Dashboard
  DASHBOARD: {
    TITLE: "Admin Dashboard",
    OVERVIEW: "Dashboard Overview",
    TOTAL_USERS: "Total Users",
    TOTAL_SHOPS: "Total Shops",
    TOTAL_PRODUCTS: "Total Products",
    TOTAL_AUCTIONS: "Total Auctions",
    TOTAL_ORDERS: "Total Orders",
    TOTAL_REVENUE: "Total Revenue",
    PENDING_APPROVALS: "Pending Approvals",
    RECENT_ACTIVITY: "Recent Activity",
    SYSTEM_STATS: "System Stats",
  },

  // User management
  USERS: {
    ALL_USERS: "All Users",
    ACTIVE_USERS: "Active Users",
    BANNED_USERS: "Banned Users",
    USER_DETAILS: "User Details",
    USER_ROLE: "User Role",
    ROLE_ADMIN: "Admin",
    ROLE_SELLER: "Seller",
    ROLE_USER: "User",
    ROLE_GUEST: "Guest",
    ACCOUNT_STATUS: "Account Status",
    STATUS_ACTIVE: "Active",
    STATUS_SUSPENDED: "Suspended",
    STATUS_BANNED: "Banned",
    EDIT_USER: "Edit User",
    BAN_USER: "Ban User",
    UNBAN_USER: "Unban User",
    DELETE_USER: "Delete User",
    USER_UPDATED: "User updated successfully",
    USER_BANNED: "User banned successfully",
    USER_UNBANNED: "User unbanned successfully",
  },

  // Shop management
  SHOPS: {
    ALL_SHOPS: "All Shops",
    PENDING_SHOPS: "Pending Shops",
    ACTIVE_SHOPS: "Active Shops",
    SUSPENDED_SHOPS: "Suspended Shops",
    CLOSED_SHOPS: "Closed Shops",
    SHOP_STATUS: "Shop Status",
    STATUS_PENDING: "Pending",
    STATUS_ACTIVE: "Active",
    STATUS_SUSPENDED: "Suspended",
    STATUS_CLOSED: "Closed",
    APPROVE_SHOP: "Approve Shop",
    REJECT_SHOP: "Reject Shop",
    SUSPEND_SHOP: "Suspend Shop",
    CLOSE_SHOP: "Close Shop",
    SHOP_APPROVED: "Shop approved",
    SHOP_REJECTED: "Shop rejected",
    SHOP_SUSPENDED: "Shop suspended",
  },

  // Content management
  CONTENT: {
    CATEGORIES: "Categories",
    ADD_CATEGORY: "Add Category",
    EDIT_CATEGORY: "Edit Category",
    DELETE_CATEGORY: "Delete Category",
    CATEGORY_NAME: "Category Name",
    CATEGORY_SLUG: "Category Slug",
    PARENT_CATEGORY: "Parent Category",
    CATEGORY_IMAGE: "Category Image",
    FEATURED: "Featured Category",
    CATEGORY_CREATED: "Category created successfully",
    CATEGORY_UPDATED: "Category updated successfully",
    CATEGORY_DELETED: "Category deleted successfully",
  },

  // Settings
  SETTINGS: {
    SITE_SETTINGS: "Site Settings",
    GENERAL: "General Settings",
    EMAIL: "Email Settings",
    PAYMENT: "Payment Settings",
    SHIPPING: "Shipping Settings",
    TAX: "Tax Settings",
    SITE_NAME: "Site Name",
    SITE_DESCRIPTION: "Site Description",
    SITE_LOGO: "Site Logo",
    SITE_FAVICON: "Site Favicon",
    CONTACT_EMAIL: "Contact Email",
    CONTACT_PHONE: "Contact Phone",
    CURRENCY: "Currency",
    TIMEZONE: "Timezone",
    LANGUAGE: "Language",
    SETTINGS_SAVED: "Settings saved successfully",
  },
} as const;

// =============================================================================
// FORMS & VALIDATION
// =============================================================================

export const FORM = {
  // Common labels
  LABELS: {
    REQUIRED: "Required field",
    OPTIONAL: "Optional",
    REQUIRED_ASTERISK: "* Required",
    REQUIRED_ERROR: "This field is required",
    FILL_REQUIRED: "Please fill in all required fields",
  },

  // Validation messages
  VALIDATION: {
    EMAIL_INVALID: "Please enter a valid email address",
    EMAIL_REQUIRED: "Email is required",
    EMAIL_TAKEN: "Email already registered",
    EMAIL_EXISTS: "This email is already taken",
    PASSWORD_REQUIRED: "Password is required",
    PASSWORD_WEAK: "Password too weak",
    PASSWORD_MIN_LENGTH: "Password must be at least 8 characters",
    PASSWORD_UPPERCASE: "Password must contain at least one uppercase letter",
    PASSWORD_LOWERCASE: "Password must contain at least one lowercase letter",
    PASSWORD_NUMBER: "Password must contain at least one number",
    PASSWORD_SPECIAL: "Password must contain at least one special character",
    PASSWORD_MISMATCH: "Passwords do not match",
    PHONE_INVALID: "Please enter a valid 10-digit Indian mobile number",
    PHONE_START_WITH: "Phone number must start with 6, 7, 8, or 9",
    PHONE_TOO_SHORT: "Phone number must be 10 digits",
    PHONE_TOO_LONG: "Phone number must be 10 digits",
    URL_INVALID: "Please enter a valid URL",
    URL_FORMAT: "Invalid URL format",
    PINCODE_INVALID: "Please enter a valid postal code",
    PINCODE_LENGTH: "Postal code must be 6 digits",
    USERNAME_TAKEN: "This username is already taken",
    USERNAME_MIN_LENGTH: "Username must be at least 3 characters",
    USERNAME_CHARS:
      "Username can only contain letters, numbers, underscores and hyphens",
    NAME_MIN_LENGTH: "Name must be at least 2 characters",
    NAME_CHARS:
      "Name can only contain letters, spaces, dots, apostrophes, and hyphens",
    PRICE_NEGATIVE: "Price cannot be negative",
    PRICE_REQUIRED: "Price is required",
    STOCK_NEGATIVE: "Stock cannot be negative",
    STOCK_REQUIRED: "Stock is required",
    QUANTITY_MIN: "Quantity must be at least 1",
    QUANTITY_INTEGER: "Quantity must be a whole number",
    SKU_REQUIRED: "SKU is required",
    SKU_MIN_LENGTH: "SKU must be at least 3 characters",
    SLUG_REQUIRED: "Slug is required",
    SLUG_FORMAT:
      "Slug can only contain lowercase letters, numbers, and hyphens",
    DATE_REQUIRED: "Date is required",
    DATE_FUTURE: "Date must be in the future",
    DATE_INVALID: "Invalid date",
    TERMS_REQUIRED: "You must agree to the terms and conditions",
  },

  // Input placeholders
  PLACEHOLDERS: {
    NAME: "Enter your name",
    EMAIL: "Enter your email",
    PASSWORD: "Enter your password",
    PHONE: "Enter your phone number",
    ADDRESS: "Enter your address",
    CITY: "Enter city name",
    PINCODE: "Enter PIN code",
    LANDMARK: "Enter landmark",
    SEARCH: "Search...",
    SEARCH_TYPE: "Type to search...",
    SELECT: "Select an option",
    CHOOSE_FILE: "Choose file",
    COMMENT: "Add a comment",
    REVIEW: "Write your review",
    DESCRIBE: "Describe the issue",
  },
} as const;

// =============================================================================
// STATUS & STATES
// =============================================================================

export const STATUS = {
  // Loading states
  LOADING: {
    DEFAULT: "Loading...",
    PLEASE_WAIT: "Please wait...",
    PROCESSING: "Processing...",
    UPLOADING: "Uploading...",
    SUBMITTING: "Submitting...",
    SAVING: "Saving...",
    DELETING: "Deleting...",
    UPDATING: "Updating...",
    PRODUCTS: "Loading products...",
    COLLECTIONS: "Loading featured collections...",
    FETCHING: "Fetching data...",
  },

  // Success messages
  SUCCESS: {
    DEFAULT: "Success!",
    DONE: "Done!",
    SAVED: "Saved successfully",
    UPDATED: "Updated successfully",
    DELETED: "Deleted successfully",
    CREATED: "Created successfully",
    SUBMITTED: "Submitted successfully",
    UPLOADED: "Uploaded successfully",
    CHANGES_SAVED: "Changes saved",
    OPERATION_COMPLETED: "Operation completed",
    ACTION_COMPLETED: "Action completed successfully",
  },

  // Error messages
  ERROR: {
    DEFAULT: "Error",
    SOMETHING_WRONG: "Something went wrong",
    FAILED_LOAD: "Failed to load",
    FAILED_SAVE: "Failed to save",
    FAILED_DELETE: "Failed to delete",
    FAILED_UPDATE: "Failed to update",
    FAILED_SUBMIT: "Failed to submit",
    FAILED_UPLOAD: "Failed to upload",
    OPERATION_FAILED: "Operation failed",
    TRY_AGAIN: "Please try again",
    OCCURRED: "An error occurred",
    NETWORK: "Network error",
    CONNECTION_FAILED: "Connection failed",
    TIMEOUT: "Timeout error",
    SERVER: "Server error",
    INVALID_REQUEST: "Invalid request",
    ACCESS_DENIED: "Access denied",
    PERMISSION_DENIED: "Permission denied",
    UNAUTHORIZED: "Unauthorized",
    FORBIDDEN: "Forbidden",
    NOT_FOUND: "Not found",
    SESSION_EXPIRED: "Session expired",
    LOGIN_AGAIN: "Please login again",
  },

  // Warning messages
  WARNING: {
    DEFAULT: "Warning",
    ARE_YOU_SURE: "Are you sure?",
    CANNOT_UNDO: "This action cannot be undone",
    UNSAVED_CHANGES: "Unsaved changes",
    HAVE_UNSAVED: "You have unsaved changes",
    DISCARD_CHANGES: "Do you want to discard changes?",
    PLEASE_CONFIRM: "Please confirm",
    LOW_STOCK: "Low stock",
    PAYMENT_PENDING: "Payment pending",
    INCOMPLETE_PROFILE: "Incomplete profile",
    VERIFICATION_REQUIRED: "Verification required",
  },

  // Info messages
  INFO: {
    DEFAULT: "Info",
    NOTE: "Note",
    TIP: "Tip",
    PRO_TIP: "Pro tip",
    DID_YOU_KNOW: "Did you know?",
    LEARN_MORE: "Learn more",
    READ_DOCS: "Read documentation",
    CONTACT_SUPPORT: "Contact support",
  },
} as const;

// =============================================================================
// EMPTY STATES & ERRORS
// =============================================================================

export const EMPTY = {
  // Empty states
  STATES: {
    NO_RESULTS: "No results found",
    NO_RESULTS_QUERY: 'No results found for "{query}"',
    NO_ITEMS: "No items found",
    NOTHING_HERE: "Nothing here yet",
    NO_DATA: "No data available",
    NO_PRODUCTS: "No products found",
    NO_AUCTIONS: "No auctions found",
    NO_ORDERS: "No orders yet",
    NO_NOTIFICATIONS: "No notifications",
    NO_MESSAGES: "No messages",
    CART_EMPTY: "Cart is empty",
    WISHLIST_EMPTY: "Wishlist is empty",
    NO_FAVORITES: "No favorites yet",
    NO_REVIEWS: "No reviews yet",
    NO_COMMENTS: "No comments yet",
    HISTORY_EMPTY: "History is empty",
    TRY_ADJUSTING: "Try adjusting your filters",
    TRY_DIFFERENT: "Try a different search term",
    START_SHOPPING: "Start shopping to see items here",
    BE_FIRST_REVIEW: "Be the first to review",
    BE_FIRST_COMMENT: "Be the first to comment",
  },

  // Error pages
  PAGES: {
    "404_TITLE": "404 - Page Not Found",
    "404_MESSAGE": "The page you're looking for doesn't exist",
    GO_HOME: "Go to Home",
    GO_BACK: "Go Back",
    "403_TITLE": "403 - Forbidden",
    "403_MESSAGE": "You don't have permission to access this page",
    "401_TITLE": "401 - Unauthorized",
    "401_MESSAGE": "Please log in to continue",
    "500_TITLE": "500 - Server Error",
    "500_MESSAGE": "Something went wrong on our end",
    "500_WORKING": "We're working to fix this",
    TRY_LATER: "Try again later",
    "503_TITLE": "503 - Service Unavailable",
    "503_MESSAGE": "We'll be back soon",
    MAINTENANCE: "Under Maintenance",
    MAINTENANCE_MESSAGE: "Scheduled maintenance in progress",
  },
} as const;

// =============================================================================
// LEGAL & POLICIES
// =============================================================================

export const LEGAL = {
  // Policy pages
  PAGES: {
    TERMS: "Terms of Service",
    PRIVACY: "Privacy Policy",
    REFUND: "Refund Policy",
    SHIPPING: "Shipping Policy",
    COOKIE: "Cookie Policy",
    RETURN: "Return Policy",
    CANCELLATION: "Cancellation Policy",
    DATA_PROTECTION: "Data Protection",
    USER_AGREEMENT: "User Agreement",
    SELLER_AGREEMENT: "Seller Agreement",
    GUIDELINES: "Community Guidelines",
    PROHIBITED: "Prohibited Items",
    IP: "Intellectual Property",
    DISCLAIMER: "Disclaimer",
    ABOUT: "About Us",
    CONTACT: "Contact Us",
    LAST_UPDATED: "Last updated: {date}",
    EFFECTIVE_DATE: "Effective date: {date}",
  },

  // Cookie consent
  COOKIES: {
    TITLE: "We use cookies",
    MESSAGE: "This website uses cookies to enhance your experience",
    MESSAGE_LONG:
      "We use cookies to improve your experience and analyze site traffic",
    ACCEPT_ALL: "Accept All",
    ACCEPT_NECESSARY: "Accept Necessary",
    REJECT_ALL: "Reject All",
    PREFERENCES: "Cookie Preferences",
    MANAGE: "Manage Cookies",
    LEARN_MORE: "Learn more",
    PRIVACY_SETTINGS: "Privacy Settings",
  },
} as const;

// =============================================================================
// SUPPORT & HELP
// =============================================================================

export const SUPPORT = {
  // Help center
  HELP: {
    TITLE: "Help Center",
    HOW_CAN_HELP: "How can we help you?",
    SEARCH_ARTICLES: "Search help articles",
    FAQ_TITLE: "Frequently Asked Questions",
    FAQ_SUBTITLE: "Find answers to common questions about our platform",
    POPULAR_TOPICS: "Popular Topics",
    GETTING_STARTED: "Getting Started",
    ACCOUNT_PROFILE: "Account & Profile",
    ORDERS_SHIPPING: "Orders & Shipping",
    PAYMENTS_REFUNDS: "Payments & Refunds",
    PRODUCTS_AUCTIONS: "Product & Auctions",
    SELLER_HELP: "Seller Help",
    CONTACT_SUPPORT: "Contact Support",
    STILL_NEED_HELP: "Still need help?",
    GET_IN_TOUCH: "Get in touch with our support team",
  },

  // Contact support
  CONTACT: {
    TITLE: "Contact Us",
    CUSTOMER_SUPPORT: "Customer Support",
    SEND_MESSAGE: "Send us a message",
    GET_BACK_SOON: "We'll get back to you soon",
    SUBJECT: "Subject",
    MESSAGE: "Message",
    YOUR_NAME: "Your Name",
    YOUR_EMAIL: "Your Email",
    ORDER_NUMBER: "Order Number (optional)",
    SEND_BUTTON: "Send Message",
    MESSAGE_SENT: "Message sent successfully",
    RESPONSE_TIME: "We'll respond within 24-48 hours",
  },

  // Support tickets
  TICKET: {
    TITLE: "Customer Ticket",
    CREATE: "Create Ticket",
    MY_TICKETS: "My Tickets",
    TICKET_NUMBER: "Ticket #{number}",
    TICKET_STATUS: "Ticket Status",
    STATUS_OPEN: "Open",
    STATUS_IN_PROGRESS: "In Progress",
    STATUS_RESOLVED: "Resolved",
    STATUS_CLOSED: "Closed",
    PRIORITY: "Ticket Priority",
    PRIORITY_LOW: "Low",
    PRIORITY_MEDIUM: "Medium",
    PRIORITY_HIGH: "High",
    PRIORITY_URGENT: "Urgent",
    CATEGORY: "Ticket Category",
    CATEGORY_ORDER: "Order Issue",
    CATEGORY_PAYMENT: "Payment Issue",
    CATEGORY_PRODUCT: "Product Issue",
    CATEGORY_ACCOUNT: "Account Issue",
    CATEGORY_GENERAL: "General Inquiry",
    ADD_REPLY: "Add Reply",
    CLOSE_TICKET: "Close Ticket",
    REOPEN_TICKET: "Reopen Ticket",
  },

  // FAQ
  FAQ: {
    TITLE: "Frequently Asked Questions",
    SHORT_TITLE: "FAQ",
    COMMON_QUESTIONS: "Common Questions",
    GENERAL: "General Questions",
    ACCOUNT: "Account Questions",
    ORDER: "Order Questions",
    PAYMENT: "Payment Questions",
    SHIPPING: "Shipping Questions",
    RETURN: "Return Questions",
    WAS_HELPFUL: "Was this helpful?",
    YES: "Yes",
    NO: "No",
    NEED_MORE_HELP: "Need more help?",
  },
} as const;

// =============================================================================
// NOTIFICATIONS & ALERTS
// =============================================================================

export const NOTIFICATION = {
  // Types
  TYPES: {
    NEW_ORDER: "New Order",
    ORDER_SHIPPED: "Order Shipped",
    ORDER_DELIVERED: "Order Delivered",
    PAYMENT_RECEIVED: "Payment Received",
    PAYMENT_FAILED: "Payment Failed",
    NEW_MESSAGE: "New Message",
    NEW_REVIEW: "New Review",
    BID_PLACED: "Bid Placed",
    OUTBID: "Outbid",
    AUCTION_WON: "Auction Won",
    AUCTION_ENDING: "Auction Ending Soon",
    PRODUCT_BACK: "Product Back in Stock",
    PRICE_DROP: "Price Drop Alert",
    NEW_FOLLOWER: "New Follower",
    ACCOUNT_VERIFIED: "Account Verified",
    SECURITY_ALERT: "Security Alert",
  },

  // Toast messages
  TOAST: {
    ADDED_CART: "Added to cart",
    REMOVED_CART: "Removed from cart",
    ADDED_FAVORITES: "Added to favorites",
    REMOVED_FAVORITES: "Removed from favorites",
    COPIED_CLIPBOARD: "Copied to clipboard",
    LINK_COPIED: "Link copied",
    DOWNLOAD_STARTED: "Download started",
    UPLOAD_COMPLETE: "Upload complete",
    CHANGES_SAVED: "Changes saved",
    PROFILE_UPDATED: "Profile updated",
    SETTINGS_UPDATED: "Settings updated",
  },
} as const;

// =============================================================================
// FILTERS & SORTING
// =============================================================================

export const FILTER = {
  // Filter labels
  LABELS: {
    FILTER_BY: "Filter by",
    ALL_FILTERS: "All Filters",
    CATEGORY: "Category",
    PRICE_RANGE: "Price Range",
    BRAND: "Brand",
    CONDITION: "Condition",
    RATING: "Rating",
    AVAILABILITY: "Availability",
    SELLER: "Seller",
    LOCATION: "Location",
    SHIPPING: "Shipping",
    DISCOUNT: "Discount",
    COLOR: "Color",
    SIZE: "Size",
    MATERIAL: "Material",
    FEATURED_ONLY: "Featured Only",
    ON_SALE_ONLY: "On Sale Only",
    FREE_SHIPPING_ONLY: "Free Shipping Only",
    IN_STOCK_ONLY: "In Stock Only",
  },

  // Sort options
  SORT: {
    SORT_BY: "Sort by",
    RELEVANCE: "Relevance",
    NEWEST: "Newest First",
    OLDEST: "Oldest First",
    PRICE_LOW: "Price: Low to High",
    PRICE_HIGH: "Price: High to Low",
    NAME_AZ: "Name: A to Z",
    NAME_ZA: "Name: Z to A",
    POPULAR: "Most Popular",
    BEST_SELLING: "Best Selling",
    HIGHEST_RATED: "Highest Rated",
    MOST_REVIEWED: "Most Reviewed",
    ENDING_SOON: "Ending Soon",
    RECENTLY_ADDED: "Recently Added",
  },
} as const;

// =============================================================================
// HOMEPAGE
// =============================================================================

export const HOMEPAGE = {
  // Hero & welcome
  HERO: {
    WELCOME: "Welcome to {companyName}",
    TAGLINE: "Your Gateway to Authentic Collectibles",
    DESCRIPTION: "India's Premier Platform for Beyblades, TCG & Collectibles",
    DISCOVER: "Discover amazing products and auctions",
    START_EXPLORING: "Start exploring",
    SHOP_NOW: "Shop Now",
    BROWSE_CATEGORIES: "Browse Categories",
    VIEW_AUCTIONS: "View Auctions",
  },

  // Featured sections
  SECTIONS: {
    FEATURED_PRODUCTS: "Featured Products",
    LATEST_PRODUCTS: "Latest Products",
    BEST_SELLERS: "Best Sellers",
    NEW_ARRIVALS: "New Arrivals",
    HOT_AUCTIONS: "Hot Auctions",
    FEATURED_AUCTIONS: "Featured Auctions",
    LIVE_AUCTIONS: "Live Auctions",
    FEATURED_CATEGORIES: "Featured Categories",
    FEATURED_SHOPS: "Featured Shops",
    RECENT_REVIEWS: "Recent Reviews",
    FEATURED_BLOGS: "Featured Blogs",
    CONTINUE_BROWSING: "Continue Browsing",
    RECENTLY_VIEWED: "Recently Viewed Products",
  },

  // Value proposition
  VALUE_PROP: {
    TITLE: "Why Choose Us",
    AUTHENTIC: "Authentic Products",
    SECURE_PAYMENTS: "Secure Payments",
    FAST_SHIPPING: "Fast Shipping",
    EASY_RETURNS: "Easy Returns",
    SUPPORT_247: "24/7 Support",
    BEST_PRICES: "Best Prices",
    QUALITY_ASSURED: "Quality Assured",
    VERIFIED_SELLERS: "Verified Sellers",
  },
} as const;

// =============================================================================
// SEARCH & DISCOVERY
// =============================================================================

export const SEARCH = {
  // Search
  MAIN: {
    SEARCH: "Search",
    PLACEHOLDER: "Search products, shops, auctions...",
    LOOKING_FOR: "What are you looking for?",
    POPULAR: "Popular Searches",
    RECENT: "Recent Searches",
    RESULTS: "Search Results",
    RESULTS_FOR: 'Search Results for "{query}"',
    COUNT_FOUND: "{count} results found",
    NO_RESULTS: "No results found",
    TRY_DIFFERENT: "Try different keywords",
    CLEAR_SEARCH: "Clear search",
  },

  // Autocomplete
  AUTO: {
    SUGGESTIONS: "Suggestions",
    PRODUCTS: "Products",
    SHOPS: "Shops",
    CATEGORIES: "Categories",
    SEE_ALL: "See all results",
    VIEW_ALL: "View all {count} results",
  },
} as const;

// =============================================================================
// REVIEWS & RATINGS
// =============================================================================

export const REVIEW = {
  // Review form
  FORM: {
    TITLE: "Write a Review",
    RATE_PRODUCT: "Rate this product",
    HOW_RATE: "How would you rate this product?",
    YOUR_RATING: "Your Rating",
    REVIEW_TITLE: "Review Title",
    YOUR_REVIEW: "Your Review",
    RECOMMEND: "Would you recommend this product?",
    YES: "Yes",
    NO: "No",
    ADD_PHOTOS: "Add Photos (optional)",
    SUBMIT: "Submit Review",
    REVIEW_SUBMITTED: "Review submitted successfully",
    THANK_YOU: "Thank you for your review",
  },

  // Review display
  DISPLAY: {
    TITLE: "Customer Reviews",
    REVIEWS: "Reviews",
    RATING: "Rating",
    OUT_OF_5: "{rating} out of 5 stars",
    BASED_ON: "Based on {count} reviews",
    COUNT: "{count} reviews",
    NO_REVIEWS: "No reviews yet",
    BE_FIRST: "Be the first to review",
    VERIFIED_PURCHASE: "Verified Purchase",
    HELPFUL: "Helpful",
    NOT_HELPFUL: "Not Helpful",
    WAS_HELPFUL: "Was this review helpful?",
    REPORT: "Report Review",
    SORT_REVIEWS: "Sort reviews",
    MOST_RECENT: "Most Recent",
    MOST_HELPFUL: "Most Helpful",
    HIGHEST_RATING: "Highest Rating",
    LOWEST_RATING: "Lowest Rating",
  },
} as const;

// =============================================================================
// SHOP PAGES
// =============================================================================

export const SHOP_PAGE = {
  // Shop header
  HEADER: {
    VISIT: "Visit Shop",
    FOLLOW: "Follow Shop",
    FOLLOWING: "Following",
    UNFOLLOW: "Unfollow",
    PRODUCT_COUNT: "{count} products",
    FOLLOWER_COUNT: "{count} followers",
    RATING: "Shop Rating: {rating}/5",
    CONTACT_SELLER: "Contact Seller",
    REPORT: "Report Shop",
  },

  // Shop tabs
  TABS: {
    PRODUCTS: "Products",
    AUCTIONS: "Auctions",
    REVIEWS: "Reviews",
    ABOUT: "About",
    POLICIES: "Policies",
  },

  // Shop policies
  POLICIES: {
    SHIPPING: "Shipping Policy",
    RETURN: "Return Policy",
    REFUND: "Refund Policy",
    EXCHANGE: "Exchange Policy",
    PROCESSING_TIME: "Processing Time",
    SHIPPING_TIME: "Shipping Time",
    RETURN_WINDOW: "Return Window",
  },
} as const;

// =============================================================================
// MOBILE SPECIFIC
// =============================================================================

export const MOBILE = {
  // Navigation
  NAV: {
    MENU: "Menu",
    OPEN_MENU: "Open menu",
    CLOSE_MENU: "Close menu",
    BACK: "Back",
    HOME: "Home",
    SEARCH: "Search",
    CART: "Cart",
    ACCOUNT: "Account",
  },

  // Actions
  ACTIONS: {
    TAP_VIEW: "Tap to view",
    TAP_EDIT: "Tap to edit",
    SWIPE_DELETE: "Swipe to delete",
    PULL_REFRESH: "Pull to refresh",
    SCROLL_MORE: "Scroll for more",
  },
} as const;

// =============================================================================
// SPECIAL FEATURES
// =============================================================================

export const FEATURES = {
  // Wishlist
  WISHLIST: {
    MY_WISHLIST: "My Wishlist",
    WISHLIST: "Wishlist",
    SAVE_LATER: "Save for Later",
    MOVE_TO_WISHLIST: "Move to Wishlist",
    MOVE_TO_CART: "Move to Cart",
    ITEMS_SAVED: "{count} items saved",
    SHARE: "Share Wishlist",
    MAKE_PUBLIC: "Make Public",
    MAKE_PRIVATE: "Make Private",
  },

  // Favorites
  FAVORITES: {
    MY_FAVORITES: "My Favorites",
    FAVORITES: "Favorites",
    SAVED_ITEMS: "Saved Items",
    ADD: "Add to Favorites",
    REMOVE: "Remove from Favorites",
    COUNT: "{count} favorites",
  },

  // Notifications
  NOTIFICATIONS: {
    TITLE: "Notifications",
    ALL: "All Notifications",
    MARK_READ: "Mark as Read",
    MARK_ALL_READ: "Mark All as Read",
    DELETE: "Delete Notification",
    CLEAR_ALL: "Clear All",
    NO_NEW: "No new notifications",
    UNREAD_COUNT: "{count} unread",
    SETTINGS: "Notification Settings",
    EMAIL_NOTIFICATIONS: "Email Notifications",
    PUSH_NOTIFICATIONS: "Push Notifications",
    SMS_NOTIFICATIONS: "SMS Notifications",
  },
} as const;

// =============================================================================
// COMBINED EXPORT
// =============================================================================

export const LANG = {
  COMMON,
  AUTH,
  NAV,
  PRODUCT,
  AUCTION,
  ORDER,
  SHOP,
  ADMIN,
  FORM,
  STATUS,
  EMPTY,
  LEGAL,
  SUPPORT,
  NOTIFICATION,
  FILTER,
  HOMEPAGE,
  SEARCH,
  REVIEW,
  SHOP_PAGE,
  MOBILE,
  FEATURES,
} as const;

// Type export for TypeScript
export type Language = typeof LANG;
