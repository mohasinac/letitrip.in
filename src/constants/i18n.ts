/**
 * @fileoverview TypeScript Module
 * @module src/constants/i18n
 * @description This file contains functionality related to i18n
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

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

/**
 * Common
 * @constant
 */
export const COMMON = {
  // General actions
  /** A C T I O N S */
  ACTIONS: {
    /** L O A D I N G */
    LOADING: "Loading...",
    /** U P L O A D I N G */
    UPLOADING: "Uploading...",
    PLEASE_WAIT: "Please wait...",
    /** P R O C E S S I N G */
    PROCESSING: "Processing...",
    /** S E A R C H */
    SEARCH: "Search...",
    /** F I L T E R */
    FILTER: "Filter",
    SORT_BY: "Sort by",
    /** A P P L Y */
    APPLY: "Apply",
    /** R E S E T */
    RESET: "Reset",
    /** C L E A R */
    CLEAR: "Clear",
    /** C A N C E L */
    CANCEL: "Cancel",
    /** C O N F I R M */
    CONFIRM: "Confirm",
    /** S A V E */
    SAVE: "Save",
    SAVE_CHANGES: "Save Changes",
    /** D E L E T E */
    DELETE: "Delete",
    /** E D I T */
    EDIT: "Edit",
    /** V I E W */
    VIEW: "View",
    /** B A C K */
    BACK: "Back",
    /** N E X T */
    NEXT: "Next",
    /** P R E V I O U S */
    PREVIOUS: "Previous",
    /** C O N T I N U E */
    CONTINUE: "Continue",
    /** S U B M I T */
    SUBMIT: "Submit",
    /** C L O S E */
    CLOSE: "Close",
    /** D I S M I S S */
    DISMISS: "Dismiss",
    LEARN_MORE: "Learn More",
    READ_MORE: "Read More",
    SHOW_MORE: "Show More",
    SHOW_LESS: "Show Less",
    VIEW_ALL: "View All",
    SEE_ALL: "See All",
    /** R E F R E S H */
    REFRESH: "Refresh",
    /** R E L O A D */
    RELOAD: "Reload",
    /** R E T R Y */
    RETRY: "Retry",
  },

  // Pagination
  /** P A G I N A T I O N */
  PAGINATION: {
    /** P A G E */
    PAGE: "Page {number}",
    /** P R E V I O U S */
    PREVIOUS: "Previous",
    /** N E X T */
    NEXT: "Next",
    /** S H O W I N G */
    SHOWING: "Showing {start}-{end} of {total} results",
    ITEMS_PER_PAGE: "Items per page",
    GO_TO_PAGE: "Go to page",
    /** F I R S T */
    FIRST: "First",
    /** L A S T */
    LAST: "Last",
  },

  // Time relative
  /** T I M E */
  TIME: {
    JUST_NOW: "Just now",
    MINUTES_AGO: "{n} minutes ago",
    HOURS_AGO: "{n} hours ago",
    /** Y E S T E R D A Y */
    YESTERDAY: "Yesterday",
    DAYS_AGO: "{n} days ago",
    WEEKS_AGO: "{n} weeks ago",
    MONTHS_AGO: "{n} months ago",
    YEARS_AGO: "{n} years ago",
    TODAY_AT: "Today at {time}",
    YESTERDAY_AT: "Yesterday at {time}",
  },

  // Numbers & currency
  /** C U R R E N C Y */
  CURRENCY: {
    /** P R I C E */
    PRICE: "₹{amount}",
    /** F R E E */
    FREE: "Free",
    /** D I S C O U N T */
    DISCOUNT: "{percentage}% off",
  },

  // Stock status
  /** S T O C K */
  STOCK: {
    OUT_OF_STOCK: "Out of Stock",
    IN_STOCK: "In Stock",
    LOW_STOCK: "Low Stock",
    /** A V A I L A B L E */
    AVAILABLE: "{number} available",
    ONLY_LEFT: "Only {number} left",
  },

  // Counts
  /** C O U N T */
  COUNT: {
    /** I T E M S */
    ITEMS: "{number} items",
    /** R E S U L T S */
    RESULTS: "{number} results",
    /** R E V I E W S */
    REVIEWS: "{count} reviews",
  },
} as const;

// =============================================================================
// AUTHENTICATION & USER MANAGEMENT
// =============================================================================

/**
 * Auth
 * @constant
 */
export const AUTH = {
  // Login page
  /** L O G I N */
  LOGIN: {
    /** T I T L E */
    TITLE: "Welcome Back",
    /** S U B T I T L E */
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
  /** R E G I S T E R */
  REGISTER: {
    /** T I T L E */
    TITLE: "Create Your Account",
    /** S U B T I T L E */
    SUBTITLE: "Join us and start shopping today",
    FULL_NAME: "Full Name",
    /** E M A I L */
    EMAIL: "Email Address",
    /** P A S S W O R D */
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
    /** T I T L E */
    TITLE: "Reset your password",
    /** S U B T I T L E */
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
    /** F A I L E D */
    FAILED: "Failed to reset password",
  },

  // Profile
  /** P R O F I L E */
  PROFILE: {
    /** T I T L E */
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
  /** V E R I F I C A T I O N */
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
  /** P L A C E H O L D E R S */
  PLACEHOLDERS: {
    /** E M A I L */
    EMAIL: "you@example.com",
    /** N A M E */
    NAME: "John Doe",
    /** P A S S W O R D */
    PASSWORD: "••••••••",
  },
} as const;

// =============================================================================
// NAVIGATION & LAYOUT
// =============================================================================

/**
 * Nav
 * @constant
 */
export const NAV = {
  // Header/NavBar
  /** H E A D E R */
  HEADER: {
    /** W E L C O M E */
    WELCOME: "Welcome to {companyName}",
    /** T A G L I N E */
    TAGLINE: "Your Gateway to Authentic Collectibles",
    SEARCH_PLACEHOLDER: "Search products, shops, auctions...",
    ALL_CATEGORIES: "All Categories",
    /** P R O D U C T S */
    PRODUCTS: "Products",
    /** A U C T I O N S */
    AUCTIONS: "Auctions",
    /** S H O P S */
    SHOPS: "Shops",
    /** C A T E G O R I E S */
    CATEGORIES: "Categories",
    /** A B O U T */
    ABOUT: "About",
    /** C O N T A C T */
    CONTACT: "Contact",
    /** H E L P */
    HELP: "Help",
    /** C A R T */
    CART: "Cart",
    /** F A V O R I T E S */
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
  /** F O O T E R */
  FOOTER: {
    ABOUT_SECTION: "About Let It Rip",
    ABOUT_LINK: "About Let It Rip",
    /** T E R M S */
    TERMS: "Terms of Service",
    /** P R I V A C Y */
    PRIVACY: "Privacy Policy",
    /** R E F U N D */
    REFUND: "Refund Policy",
    /** S H I P P I N G */
    SHIPPING: "Shipping Policy",
    /** C O O K I E */
    COOKIE: "Cookie Policy",
    SHOPPING_SECTION: "Shopping Notes",
    /** F A Q */
    FAQ: "FAQ",
    NEW_USER_GUIDE: "New Users' Guide",
    /** R E T U R N S */
    RETURNS: "Returns & Refunds",
    /** P R O H I B I T E D */
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
    /** C O P Y R I G H T */
    COPYRIGHT: "Copyright © 2015-2025 letitrip.com. All Rights Reserved",
  },

  // Breadcrumbs
  /** B R E A D C R U M B S */
  BREADCRUMBS: {
    /** H O M E */
    HOME: "Home",
    /** P R O D U C T S */
    PRODUCTS: "Products",
    /** A U C T I O N S */
    AUCTIONS: "Auctions",
    /** C A T E G O R I E S */
    CATEGORIES: "Categories",
    /** S H O P S */
    SHOPS: "Shops",
  },
} as const;

// =============================================================================
// PRODUCT & SHOPPING
// =============================================================================

/**
 * Product
 * @constant
 */
export const PRODUCT = {
  // Product cards
  /** C A R D */
  CARD: {
    ADD_TO_CART: "Add to Cart",
    QUICK_VIEW: "Quick View",
    ADD_TO_FAVORITES: "Add to Favorites",
    REMOVE_FROM_FAVORITES: "Remove from Favorites",
    /** C O M P A R E */
    COMPARE: "Compare",
    CONDITION_NEW: "New",
    CONDITION_USED: "Used",
    CONDITION_REFURBISHED: "Refurbished",
    /** F E A T U R E D */
    FEATURED: "Featured",
    OUT_OF_STOCK: "Out of Stock",
    IN_STOCK: "In Stock",
    /** R A T I N G */
    RATING: "{rating} stars",
    /** R E V I E W S */
    REVIEWS: "({reviewCount} reviews)",
    /** P R I C E */
    PRICE: "₹{price}",
    ORIGINAL_PRICE: "₹{originalPrice}",
    /** D I S C O U N T */
    DISCOUNT: "{percentage}% off",
    FREE_SHIPPING: "Free Shipping",
  },

  // Product details
  /** D E T A I L S */
  DETAILS: {
    /** T I T L E */
    TITLE: "Product Details",
    /** D E S C R I P T I O N */
    DESCRIPTION: "Description",
    /** S P E C I F I C A T I O N S */
    SPECIFICATIONS: "Specifications",
    /** R E V I E W S */
    REVIEWS: "Reviews",
    /** R E L A T E D */
    RELATED: "Related Products",
    YOU_MAY_LIKE: "You may also like",
    /** C O N D I T I O N */
    CONDITION: "Condition",
    /** S K U */
    SKU: "SKU",
    /** B R A N D */
    BRAND: "Brand",
    /** C A T E G O R Y */
    CATEGORY: "Category",
    /** T A G S */
    TAGS: "Tags",
    /** S H A R E */
    SHARE: "Share",
    /** R E P O R T */
    REPORT: "Report Product",
    ADD_TO_CART: "Add to Cart",
    BUY_NOW: "Buy Now",
    ADD_TO_WISHLIST: "Add to Wishlist",
    ADD_TO_COMPARE: "Add to Compare",
    SELECT_QUANTITY: "Select Quantity",
    /** Q U A N T I T Y */
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
  /** L I S T I N G */
  LISTING: {
    ALL_PRODUCTS: "All Products",
    /** F E A T U R E D */
    FEATURED: "Featured Products",
    /** L A T E S T */
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
    /** C A T E G O R Y */
    CATEGORY: "Category",
    /** B R A N D */
    BRAND: "Brand",
    /** C O N D I T I O N */
    CONDITION: "Condition",
    /** R A T I N G */
    RATING: "Rating",
    /** A V A I L A B I L I T Y */
    AVAILABILITY: "Availability",
    CLEAR_FILTERS: "Clear Filters",
    APPLY_FILTERS: "Apply Filters",
    PRODUCTS_FOUND: "{count} products found",
    NO_PRODUCTS: "No products found",
    TRY_ADJUSTING: "Try adjusting your filters",
  },

  // Shopping cart
  /** C A R T */
  CART: {
    /** T I T L E */
    TITLE: "Shopping Cart",
    YOUR_CART: "Your Cart",
    /** E M P T Y */
    EMPTY: "Cart is empty",
    CONTINUE_SHOPPING: "Continue Shopping",
    PROCEED_CHECKOUT: "Proceed to Checkout",
    UPDATE_CART: "Update Cart",
    /** R E M O V E */
    REMOVE: "Remove",
    /** Q U A N T I T Y */
    QUANTITY: "Quantity",
    /** P R I C E */
    PRICE: "Price",
    /** S U B T O T A L */
    SUBTOTAL: "Subtotal",
    /** T O T A L */
    TOTAL: "Total",
    ESTIMATED_TOTAL: "Estimated Total",
    /** S H I P P I N G */
    SHIPPING: "Shipping",
    /** T A X */
    TAX: "Tax",
    /** D I S C O U N T */
    DISCOUNT: "Discount",
    APPLY_COUPON: "Apply Coupon",
    COUPON_CODE: "Coupon Code",
    /** A P P L Y */
    APPLY: "Apply",
    COUPON_APPLIED: "Coupon applied successfully",
    INVALID_COUPON: "Invalid coupon code",
    ITEMS_IN_CART: "{number} items in cart",
    CART_UPDATED: "Cart updated",
    ITEM_REMOVED: "Item removed from cart",
  },

  // Comparison
  /** C O M P A R E */
  COMPARE: {
    /** T I T L E */
    TITLE: "Compare Products",
    ADD_TO_COMPARE: "Add to Compare",
    REMOVE_FROM_COMPARE: "Remove from Compare",
    COMPARE_NOW: "Compare Now",
    CLEAR_ALL: "Clear All",
    SELECT_PRODUCTS: "Select products to compare",
    MAX_PRODUCTS: "You can compare up to {number} products",
    COMPARISON_TITLE: "Product Comparison",
    ADD_MORE: "Add more products",
    /** P R I C E */
    PRICE: "Price",
    /** R A T I N G */
    RATING: "Rating",
    /** R E V I E W S */
    REVIEWS: "Reviews",
    /** C O N D I T I O N */
    CONDITION: "Condition",
    /** S T O C K */
    STOCK: "Stock",
    /** F E A T U R E S */
    FEATURES: "Features",
  },

  // Recently viewed
  RECENTLY_VIEWED: {
    /** T I T L E */
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

/**
 * Auction
 * @constant
 */
export const AUCTION = {
  // Auction cards
  /** C A R D */
  CARD: {
    CURRENT_BID: "Current Bid",
    STARTING_BID: "Starting Bid",
    RESERVE_PRICE: "Reserve Price",
    TIME_REMAINING: "Time Remaining",
    ENDS_IN: "Ends in {time}",
    /** E N D E D */
    ENDED: "Ended",
    PLACE_BID: "Place Bid",
    WATCH_AUCTION: "Watch Auction",
    BID_COUNT: "{bidCount} bids",
    NO_BIDS: "No bids yet",
    FIRST_BID: "Be the first to bid",
    /** H O T */
    HOT: "Hot Auction",
    /** F E A T U R E D */
    FEATURED: "Featured Auction",
  },

  // Auction details
  /** D E T A I L S */
  DETAILS: {
    /** T I T L E */
    TITLE: "Auction Details",
    PLACE_YOUR_BID: "Place Your Bid",
    YOUR_MAX_BID: "Your Maximum Bid",
    CURRENT_BID: "Current Bid",
    STARTING_BID: "Starting Bid",
    RESERVE_PRICE: "Reserve Price",
    TIME_LEFT: "Time Left",
    ENDS_ON: "Ends on {date}",
    /** E N D E D */
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
  /** L I S T I N G */
  LISTING: {
    /** A L L */
    ALL: "All Auctions",
    /** L I V E */
    LIVE: "Live Auctions",
    /** H O T */
    HOT: "Hot Auctions",
    /** F E A T U R E D */
    FEATURED: "Featured Auctions",
    /** U P C O M I N G */
    UPCOMING: "Upcoming Auctions",
    /** E N D E D */
    ENDED: "Ended Auctions",
    MY_BIDS: "My Bids",
    MY_WINS: "My Wins",
    /** W A T C H I N G */
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

/**
 * Order
 * @constant
 */
export const ORDER = {
  // Checkout
  /** C H E C K O U T */
  CHECKOUT: {
    /** T I T L E */
    TITLE: "Checkout",
    SHIPPING_ADDRESS: "Shipping Address",
    BILLING_ADDRESS: "Billing Address",
    SAME_AS_SHIPPING: "Same as shipping address",
    PAYMENT_METHOD: "Payment Method",
    SELECT_PAYMENT: "Select Payment Method",
    /** C A R D */
    CARD: "Credit/Debit Card",
    /** U P I */
    UPI: "UPI",
    NET_BANKING: "Net Banking",
    /** C O D */
    COD: "Cash on Delivery",
    ORDER_SUMMARY: "Order Summary",
    /** I T E M S */
    ITEMS: "Items",
    /** S U B T O T A L */
    SUBTOTAL: "Subtotal",
    /** S H I P P I N G */
    SHIPPING: "Shipping",
    /** T A X */
    TAX: "Tax",
    /** D I S C O U N T */
    DISCOUNT: "Discount",
    /** T O T A L */
    TOTAL: "Total",
    PLACE_ORDER: "Place Order",
    REVIEW_ORDER: "Review Order",
    CONFIRM_PAY: "Confirm & Pay",
    ORDER_SUCCESS: "Order placed successfully",
    ORDER_FAILED: "Failed to place order",
    PAYMENT_SECURE: "Your payment information is encrypted and secure",
  },

  // Address form
  /** A D D R E S S */
  ADDRESS: {
    FULL_NAME: "Full Name",
    PHONE_NUMBER: "Phone Number",
    ADDRESS_LINE1: "Address Line 1",
    ADDRESS_LINE2: "Address Line 2",
    /** C I T Y */
    CITY: "City",
    /** S T A T E */
    STATE: "State",
    /** P I N C O D E */
    PINCODE: "PIN Code",
    /** L A N D M A R K */
    LANDMARK: "Landmark",
    ADDRESS_TYPE: "Address Type",
    /** H O M E */
    HOME: "Home",
    /** W O R K */
    WORK: "Work",
    /** O T H E R */
    OTHER: "Other",
    SAVE_ADDRESS: "Save Address",
    SET_DEFAULT: "Set as default",
    ADD_NEW: "Add New Address",
    EDIT_ADDRESS: "Edit Address",
    DELETE_ADDRESS: "Delete Address",
  },

  // Payment
  /** P A Y M E N T */
  PAYMENT: {
    CARD_NUMBER: "Card Number",
    CARDHOLDER_NAME: "Cardholder Name",
    EXPIRY_DATE: "Expiry Date",
    /** C V V */
    CVV: "CVV",
    UPI_ID: "UPI ID",
    SELECT_BANK: "Select Bank",
    ENTER_UPI: "Enter UPI ID",
    UPI_PLACEHOLDER: "yourname@upi",
    CVV_PLACEHOLDER: "123",
    /** P R O C E S S I N G */
    PROCESSING: "Payment processing...",
    /** S U C C E S S */
    SUCCESS: "Payment successful",
    /** F A I L E D */
    FAILED: "Payment failed",
    TRANSACTION_ID: "Transaction ID",
  },

  // Orders list
  /** O R D E R S */
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
    /** R E O R D E R */
    REORDER: "Reorder",
    /** P E N D I N G */
    PENDING: "Pending",
    /** C O N F I R M E D */
    CONFIRMED: "Confirmed",
    /** P R O C E S S I N G */
    PROCESSING: "Processing",
    /** S H I P P E D */
    SHIPPED: "Shipped",
    OUT_FOR_DELIVERY: "Out for Delivery",
    /** D E L I V E R E D */
    DELIVERED: "Delivered",
    /** C A N C E L L E D */
    CANCELLED: "Cancelled",
    /** R E T U R N E D */
    RETURNED: "Returned",
    /** R E F U N D E D */
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
  /** R E T U R N */
  RETURN: {
    /** T I T L E */
    TITLE: "Return Order",
    REQUEST_RETURN: "Request Return",
    RETURN_REASON: "Return Reason",
    RETURN_DETAILS: "Return Details",
    SELECT_ITEMS: "Select items to return",
    RETURN_METHOD: "Return Method",
    REFUND_AMOUNT: "Refund Amount",
    RETURN_STATUS: "Return Status",
    /** R E Q U E S T E D */
    REQUESTED: "Return requested",
    /** A P P R O V E D */
    APPROVED: "Return approved",
    /** R E J E C T E D */
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

/**
 * Shop
 * @constant
 */
export const SHOP = {
  // Dashboard
  /** D A S H B O A R D */
  DASHBOARD: {
    /** T I T L E */
    TITLE: "Seller Dashboard",
    MY_SHOP: "My Shop",
    /** O V E R V I E W */
    OVERVIEW: "Shop Overview",
    /** S T A T I S T I C S */
    STATISTICS: "Shop Statistics",
    TOTAL_PRODUCTS: "Total Products",
    TOTAL_ORDERS: "Total Orders",
    TOTAL_REVENUE: "Total Revenue",
    ACTIVE_AUCTIONS: "Active Auctions",
    PENDING_ORDERS: "Pending Orders",
    RECENT_ORDERS: "Recent Orders",
    TOP_PRODUCTS: "Top Products",
    /** P E R F O R M A N C E */
    PERFORMANCE: "Shop Performance",
    /** R A T I N G */
    RATING: "Shop Rating",
    /** S T A R S */
    STARS: "{rating} stars",
    /** R E V I E W S */
    REVIEWS: "({reviewCount} reviews)",
  },

  // Profile
  /** P R O F I L E */
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
  /** P R O D U C T S */
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
    /** S K U */
    SKU: "SKU",
    PRODUCT_CONDITION: "Product Condition",
    PRODUCT_TAGS: "Product Tags",
    /** F E A T U R E D */
    FEATURED: "Featured Product",
    /** P U B L I S H */
    PUBLISH: "Publish Product",
    SAVE_DRAFT: "Save as Draft",
    /** S T A T U S */
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
  /** A U C T I O N S */
  AUCTIONS: {
    MY_AUCTIONS: "My Auctions",
    /** C R E A T E */
    CREATE: "Create Auction",
    /** E D I T */
    EDIT: "Edit Auction",
    /** D E L E T E */
    DELETE: "Delete Auction",
    /** T I T L E */
    TITLE: "Auction Title",
    /** D E S C R I P T I O N */
    DESCRIPTION: "Auction Description",
    STARTING_BID: "Starting Bid",
    RESERVE_PRICE: "Reserve Price",
    /** D U R A T I O N */
    DURATION: "Auction Duration",
    START_DATE: "Start Date",
    END_DATE: "End Date",
    /** S T A T U S */
    STATUS: "Auction Status",
    STATUS_DRAFT: "Draft",
    STATUS_SCHEDULED: "Scheduled",
    STATUS_ACTIVE: "Active",
    STATUS_ENDED: "Ended",
    STATUS_CANCELLED: "Cancelled",
    STATUS_SOLD: "Sold",
    STATUS_UNSOLD: "Unsold",
    CURRENT_BIDS: "Current Bids",
    /** W I N N E R */
    WINNER: "Winner",
    CREATED_SUCCESS: "Auction created successfully",
    UPDATED_SUCCESS: "Auction updated successfully",
    /** C A N C E L L E D */
    CANCELLED: "Auction cancelled",
  },

  // Order management
  ORDER_MANAGEMENT: {
    SHOP_ORDERS: "Shop Orders",
    NEW_ORDERS: "New Orders",
    /** P R O C E S S I N G */
    PROCESSING: "Processing Orders",
    /** S H I P P E D */
    SHIPPED: "Shipped Orders",
    /** C O M P L E T E D */
    COMPLETED: "Completed Orders",
    /** C A N C E L L E D */
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

/**
 * Admin
 * @constant
 */
export const ADMIN = {
  // Dashboard
  /** D A S H B O A R D */
  DASHBOARD: {
    /** T I T L E */
    TITLE: "Admin Dashboard",
    /** O V E R V I E W */
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
  /** U S E R S */
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
  /** S H O P S */
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
  /** C O N T E N T */
  CONTENT: {
    /** C A T E G O R I E S */
    CATEGORIES: "Categories",
    ADD_CATEGORY: "Add Category",
    EDIT_CATEGORY: "Edit Category",
    DELETE_CATEGORY: "Delete Category",
    CATEGORY_NAME: "Category Name",
    CATEGORY_SLUG: "Category Slug",
    PARENT_CATEGORY: "Parent Category",
    CATEGORY_IMAGE: "Category Image",
    /** F E A T U R E D */
    FEATURED: "Featured Category",
    CATEGORY_CREATED: "Category created successfully",
    CATEGORY_UPDATED: "Category updated successfully",
    CATEGORY_DELETED: "Category deleted successfully",
  },

  // Settings
  /** S E T T I N G S */
  SETTINGS: {
    SITE_SETTINGS: "Site Settings",
    /** G E N E R A L */
    GENERAL: "General Settings",
    /** E M A I L */
    EMAIL: "Email Settings",
    /** P A Y M E N T */
    PAYMENT: "Payment Settings",
    /** S H I P P I N G */
    SHIPPING: "Shipping Settings",
    /** T A X */
    TAX: "Tax Settings",
    SITE_NAME: "Site Name",
    SITE_DESCRIPTION: "Site Description",
    SITE_LOGO: "Site Logo",
    SITE_FAVICON: "Site Favicon",
    CONTACT_EMAIL: "Contact Email",
    CONTACT_PHONE: "Contact Phone",
    /** C U R R E N C Y */
    CURRENCY: "Currency",
    /** T I M E Z O N E */
    TIMEZONE: "Timezone",
    /** L A N G U A G E */
    LANGUAGE: "Language",
    SETTINGS_SAVED: "Settings saved successfully",
  },
} as const;

// =============================================================================
// FORMS & VALIDATION
// =============================================================================

/**
 * Form
 * @constant
 */
export const FORM = {
  // Common labels
  /** L A B E L S */
  LABELS: {
    /** R E Q U I R E D */
    REQUIRED: "Required field",
    /** O P T I O N A L */
    OPTIONAL: "Optional",
    REQUIRED_ASTERISK: "* Required",
    REQUIRED_ERROR: "This field is required",
    FILL_REQUIRED: "Please fill in all required fields",
  },

  // Validation messages
  /** V A L I D A T I O N */
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
  /** P L A C E H O L D E R S */
  PLACEHOLDERS: {
    /** N A M E */
    NAME: "Enter your name",
    /** E M A I L */
    EMAIL: "Enter your email",
    /** P A S S W O R D */
    PASSWORD: "Enter your password",
    /** P H O N E */
    PHONE: "Enter your phone number",
    /** A D D R E S S */
    ADDRESS: "Enter your address",
    /** C I T Y */
    CITY: "Enter city name",
    /** P I N C O D E */
    PINCODE: "Enter PIN code",
    /** L A N D M A R K */
    LANDMARK: "Enter landmark",
    /** S E A R C H */
    SEARCH: "Search...",
    SEARCH_TYPE: "Type to search...",
    /** S E L E C T */
    SELECT: "Select an option",
    CHOOSE_FILE: "Choose file",
    /** C O M M E N T */
    COMMENT: "Add a comment",
    /** R E V I E W */
    REVIEW: "Write your review",
    /** D E S C R I B E */
    DESCRIBE: "Describe the issue",
  },
} as const;

// =============================================================================
// STATUS & STATES
// =============================================================================

/**
 * Status
 * @constant
 */
export const STATUS = {
  // Loading states
  /** L O A D I N G */
  LOADING: {
    /** D E F A U L T */
    DEFAULT: "Loading...",
    PLEASE_WAIT: "Please wait...",
    /** P R O C E S S I N G */
    PROCESSING: "Processing...",
    /** U P L O A D I N G */
    UPLOADING: "Uploading...",
    /** S U B M I T T I N G */
    SUBMITTING: "Submitting...",
    /** S A V I N G */
    SAVING: "Saving...",
    /** D E L E T I N G */
    DELETING: "Deleting...",
    /** U P D A T I N G */
    UPDATING: "Updating...",
    /** P R O D U C T S */
    PRODUCTS: "Loading products...",
    /** C O L L E C T I O N S */
    COLLECTIONS: "Loading featured collections...",
    /** F E T C H I N G */
    FETCHING: "Fetching data...",
  },

  // Success messages
  /** S U C C E S S */
  SUCCESS: {
    /** D E F A U L T */
    DEFAULT: "Success!",
    /** D O N E */
    DONE: "Done!",
    /** S A V E D */
    SAVED: "Saved successfully",
    /** U P D A T E D */
    UPDATED: "Updated successfully",
    /** D E L E T E D */
    DELETED: "Deleted successfully",
    /** C R E A T E D */
    CREATED: "Created successfully",
    /** S U B M I T T E D */
    SUBMITTED: "Submitted successfully",
    /** U P L O A D E D */
    UPLOADED: "Uploaded successfully",
    CHANGES_SAVED: "Changes saved",
    OPERATION_COMPLETED: "Operation completed",
    ACTION_COMPLETED: "Action completed successfully",
  },

  // Error messages
  /** E R R O R */
  ERROR: {
    /** D E F A U L T */
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
    /** O C C U R R E D */
    OCCURRED: "An error occurred",
    /** N E T W O R K */
    NETWORK: "Network error",
    CONNECTION_FAILED: "Connection failed",
    /** T I M E O U T */
    TIMEOUT: "Timeout error",
    /** S E R V E R */
    SERVER: "Server error",
    INVALID_REQUEST: "Invalid request",
    ACCESS_DENIED: "Access denied",
    PERMISSION_DENIED: "Permission denied",
    /** U N A U T H O R I Z E D */
    UNAUTHORIZED: "Unauthorized",
    /** F O R B I D D E N */
    FORBIDDEN: "Forbidden",
    NOT_FOUND: "Not found",
    SESSION_EXPIRED: "Session expired",
    LOGIN_AGAIN: "Please login again",
  },

  // Warning messages
  /** W A R N I N G */
  WARNING: {
    /** D E F A U L T */
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
  /** I N F O */
  INFO: {
    /** D E F A U L T */
    DEFAULT: "Info",
    /** N O T E */
    NOTE: "Note",
    /** T I P */
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

/**
 * Empty
 * @constant
 */
export const EMPTY = {
  // Empty states
  /** S T A T E S */
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
  /** P A G E S */
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
    /** M A I N T E N A N C E */
    MAINTENANCE: "Under Maintenance",
    MAINTENANCE_MESSAGE: "Scheduled maintenance in progress",
  },
} as const;

// =============================================================================
// LEGAL & POLICIES
// =============================================================================

/**
 * Legal
 * @constant
 */
export const LEGAL = {
  // Policy pages
  /** P A G E S */
  PAGES: {
    /** T E R M S */
    TERMS: "Terms of Service",
    /** P R I V A C Y */
    PRIVACY: "Privacy Policy",
    /** R E F U N D */
    REFUND: "Refund Policy",
    /** S H I P P I N G */
    SHIPPING: "Shipping Policy",
    /** C O O K I E */
    COOKIE: "Cookie Policy",
    /** R E T U R N */
    RETURN: "Return Policy",
    /** C A N C E L L A T I O N */
    CANCELLATION: "Cancellation Policy",
    DATA_PROTECTION: "Data Protection",
    USER_AGREEMENT: "User Agreement",
    SELLER_AGREEMENT: "Seller Agreement",
    /** G U I D E L I N E S */
    GUIDELINES: "Community Guidelines",
    /** P R O H I B I T E D */
    PROHIBITED: "Prohibited Items",
    /** I P */
    IP: "Intellectual Property",
    /** D I S C L A I M E R */
    DISCLAIMER: "Disclaimer",
    /** A B O U T */
    ABOUT: "About Us",
    /** C O N T A C T */
    CONTACT: "Contact Us",
    LAST_UPDATED: "Last updated: {date}",
    EFFECTIVE_DATE: "Effective date: {date}",
  },

  // Cookie consent
  /** C O O K I E S */
  COOKIES: {
    /** T I T L E */
    TITLE: "We use cookies",
    /** M E S S A G E */
    MESSAGE: "This website uses cookies to enhance your experience",
    MESSAGE_LONG:
      "We use cookies to improve your experience and analyze site traffic",
    ACCEPT_ALL: "Accept All",
    ACCEPT_NECESSARY: "Accept Necessary",
    REJECT_ALL: "Reject All",
    /** P R E F E R E N C E S */
    PREFERENCES: "Cookie Preferences",
    /** M A N A G E */
    MANAGE: "Manage Cookies",
    LEARN_MORE: "Learn more",
    PRIVACY_SETTINGS: "Privacy Settings",
  },
} as const;

// =============================================================================
// SUPPORT & HELP
// =============================================================================

/**
 * Support
 * @constant
 */
export const SUPPORT = {
  // Help center
  /** H E L P */
  HELP: {
    /** T I T L E */
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
  /** C O N T A C T */
  CONTACT: {
    /** T I T L E */
    TITLE: "Contact Us",
    CUSTOMER_SUPPORT: "Customer Support",
    SEND_MESSAGE: "Send us a message",
    GET_BACK_SOON: "We'll get back to you soon",
    /** S U B J E C T */
    SUBJECT: "Subject",
    /** M E S S A G E */
    MESSAGE: "Message",
    YOUR_NAME: "Your Name",
    YOUR_EMAIL: "Your Email",
    ORDER_NUMBER: "Order Number (optional)",
    SEND_BUTTON: "Send Message",
    MESSAGE_SENT: "Message sent successfully",
    RESPONSE_TIME: "We'll respond within 24-48 hours",
  },

  // Support tickets
  /** T I C K E T */
  TICKET: {
    /** T I T L E */
    TITLE: "Customer Ticket",
    /** C R E A T E */
    CREATE: "Create Ticket",
    MY_TICKETS: "My Tickets",
    TICKET_NUMBER: "Ticket #{number}",
    TICKET_STATUS: "Ticket Status",
    STATUS_OPEN: "Open",
    STATUS_IN_PROGRESS: "In Progress",
    STATUS_RESOLVED: "Resolved",
    STATUS_CLOSED: "Closed",
    /** P R I O R I T Y */
    PRIORITY: "Ticket Priority",
    PRIORITY_LOW: "Low",
    PRIORITY_MEDIUM: "Medium",
    PRIORITY_HIGH: "High",
    PRIORITY_URGENT: "Urgent",
    /** C A T E G O R Y */
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
  /** F A Q */
  FAQ: {
    /** T I T L E */
    TITLE: "Frequently Asked Questions",
    SHORT_TITLE: "FAQ",
    COMMON_QUESTIONS: "Common Questions",
    /** G E N E R A L */
    GENERAL: "General Questions",
    /** A C C O U N T */
    ACCOUNT: "Account Questions",
    /** O R D E R */
    ORDER: "Order Questions",
    /** P A Y M E N T */
    PAYMENT: "Payment Questions",
    /** S H I P P I N G */
    SHIPPING: "Shipping Questions",
    /** R E T U R N */
    RETURN: "Return Questions",
    WAS_HELPFUL: "Was this helpful?",
    /** Y E S */
    YES: "Yes",
    /** N O */
    NO: "No",
    NEED_MORE_HELP: "Need more help?",
  },
} as const;

// =============================================================================
// NOTIFICATIONS & ALERTS
// =============================================================================

/**
 * Notification
 * @constant
 */
export const NOTIFICATION = {
  // Types
  /** T Y P E S */
  TYPES: {
    NEW_ORDER: "New Order",
    ORDER_SHIPPED: "Order Shipped",
    ORDER_DELIVERED: "Order Delivered",
    PAYMENT_RECEIVED: "Payment Received",
    PAYMENT_FAILED: "Payment Failed",
    NEW_MESSAGE: "New Message",
    NEW_REVIEW: "New Review",
    BID_PLACED: "Bid Placed",
    /** O U T B I D */
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
  /** T O A S T */
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

/**
 * Filter
 * @constant
 */
export const FILTER = {
  // Filter labels
  /** L A B E L S */
  LABELS: {
    FILTER_BY: "Filter by",
    ALL_FILTERS: "All Filters",
    /** C A T E G O R Y */
    CATEGORY: "Category",
    PRICE_RANGE: "Price Range",
    /** B R A N D */
    BRAND: "Brand",
    /** C O N D I T I O N */
    CONDITION: "Condition",
    /** R A T I N G */
    RATING: "Rating",
    /** A V A I L A B I L I T Y */
    AVAILABILITY: "Availability",
    /** S E L L E R */
    SELLER: "Seller",
    /** L O C A T I O N */
    LOCATION: "Location",
    /** S H I P P I N G */
    SHIPPING: "Shipping",
    /** D I S C O U N T */
    DISCOUNT: "Discount",
    /** C O L O R */
    COLOR: "Color",
    /** S I Z E */
    SIZE: "Size",
    /** M A T E R I A L */
    MATERIAL: "Material",
    FEATURED_ONLY: "Featured Only",
    ON_SALE_ONLY: "On Sale Only",
    FREE_SHIPPING_ONLY: "Free Shipping Only",
    IN_STOCK_ONLY: "In Stock Only",
  },

  // Sort options
  /** S O R T */
  SORT: {
    SORT_BY: "Sort by",
    /** R E L E V A N C E */
    RELEVANCE: "Relevance",
    /** N E W E S T */
    NEWEST: "Newest First",
    /** O L D E S T */
    OLDEST: "Oldest First",
    PRICE_LOW: "Price: Low to High",
    PRICE_HIGH: "Price: High to Low",
    NAME_AZ: "Name: A to Z",
    NAME_ZA: "Name: Z to A",
    /** P O P U L A R */
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

/**
 * Homepage
 * @constant
 */
export const HOMEPAGE = {
  // Hero & welcome
  /** H E R O */
  HERO: {
    /** W E L C O M E */
    WELCOME: "Welcome to {companyName}",
    /** T A G L I N E */
    TAGLINE: "Your Gateway to Authentic Collectibles",
    /** D E S C R I P T I O N */
    DESCRIPTION: "India's Premier Platform for Beyblades, TCG & Collectibles",
    /** D I S C O V E R */
    DISCOVER: "Discover amazing products and auctions",
    START_EXPLORING: "Start exploring",
    SHOP_NOW: "Shop Now",
    BROWSE_CATEGORIES: "Browse Categories",
    VIEW_AUCTIONS: "View Auctions",
  },

  // Featured sections
  /** S E C T I O N S */
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
    /** T I T L E */
    TITLE: "Why Choose Us",
    /** A U T H E N T I C */
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

/**
 * Search
 * @constant
 */
export const SEARCH = {
  // Search
  /** M A I N */
  MAIN: {
    /** S E A R C H */
    SEARCH: "Search",
    /** P L A C E H O L D E R */
    PLACEHOLDER: "Search products, shops, auctions...",
    LOOKING_FOR: "What are you looking for?",
    /** P O P U L A R */
    POPULAR: "Popular Searches",
    /** R E C E N T */
    RECENT: "Recent Searches",
    /** R E S U L T S */
    RESULTS: "Search Results",
    RESULTS_FOR: 'Search Results for "{query}"',
    COUNT_FOUND: "{count} results found",
    NO_RESULTS: "No results found",
    TRY_DIFFERENT: "Try different keywords",
    CLEAR_SEARCH: "Clear search",
  },

  // Autocomplete
  /** A U T O */
  AUTO: {
    /** S U G G E S T I O N S */
    SUGGESTIONS: "Suggestions",
    /** P R O D U C T S */
    PRODUCTS: "Products",
    /** S H O P S */
    SHOPS: "Shops",
    /** C A T E G O R I E S */
    CATEGORIES: "Categories",
    SEE_ALL: "See all results",
    VIEW_ALL: "View all {count} results",
  },
} as const;

// =============================================================================
// REVIEWS & RATINGS
// =============================================================================

/**
 * Review
 * @constant
 */
export const REVIEW = {
  // Review form
  /** F O R M */
  FORM: {
    /** T I T L E */
    TITLE: "Write a Review",
    RATE_PRODUCT: "Rate this product",
    HOW_RATE: "How would you rate this product?",
    YOUR_RATING: "Your Rating",
    REVIEW_TITLE: "Review Title",
    YOUR_REVIEW: "Your Review",
    /** R E C O M M E N D */
    RECOMMEND: "Would you recommend this product?",
    /** Y E S */
    YES: "Yes",
    /** N O */
    NO: "No",
    ADD_PHOTOS: "Add Photos (optional)",
    /** S U B M I T */
    SUBMIT: "Submit Review",
    REVIEW_SUBMITTED: "Review submitted successfully",
    THANK_YOU: "Thank you for your review",
  },

  // Review display
  /** D I S P L A Y */
  DISPLAY: {
    /** T I T L E */
    TITLE: "Customer Reviews",
    /** R E V I E W S */
    REVIEWS: "Reviews",
    /** R A T I N G */
    RATING: "Rating",
    OUT_OF_5: "{rating} out of 5 stars",
    BASED_ON: "Based on {count} reviews",
    /** C O U N T */
    COUNT: "{count} reviews",
    NO_REVIEWS: "No reviews yet",
    BE_FIRST: "Be the first to review",
    VERIFIED_PURCHASE: "Verified Purchase",
    /** H E L P F U L */
    HELPFUL: "Helpful",
    NOT_HELPFUL: "Not Helpful",
    WAS_HELPFUL: "Was this review helpful?",
    /** R E P O R T */
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

/**
 * Shop Page
 * @constant
 */
export const SHOP_PAGE = {
  // Shop header
  /** H E A D E R */
  HEADER: {
    /** V I S I T */
    VISIT: "Visit Shop",
    /** F O L L O W */
    FOLLOW: "Follow Shop",
    /** F O L L O W I N G */
    FOLLOWING: "Following",
    /** U N F O L L O W */
    UNFOLLOW: "Unfollow",
    PRODUCT_COUNT: "{count} products",
    FOLLOWER_COUNT: "{count} followers",
    /** R A T I N G */
    RATING: "Shop Rating: {rating}/5",
    CONTACT_SELLER: "Contact Seller",
    /** R E P O R T */
    REPORT: "Report Shop",
  },

  // Shop tabs
  /** T A B S */
  TABS: {
    /** P R O D U C T S */
    PRODUCTS: "Products",
    /** A U C T I O N S */
    AUCTIONS: "Auctions",
    /** R E V I E W S */
    REVIEWS: "Reviews",
    /** A B O U T */
    ABOUT: "About",
    /** P O L I C I E S */
    POLICIES: "Policies",
  },

  // Shop policies
  /** P O L I C I E S */
  POLICIES: {
    /** S H I P P I N G */
    SHIPPING: "Shipping Policy",
    /** R E T U R N */
    RETURN: "Return Policy",
    /** R E F U N D */
    REFUND: "Refund Policy",
    /** E X C H A N G E */
    EXCHANGE: "Exchange Policy",
    PROCESSING_TIME: "Processing Time",
    SHIPPING_TIME: "Shipping Time",
    RETURN_WINDOW: "Return Window",
  },
} as const;

// =============================================================================
// MOBILE SPECIFIC
// =============================================================================

/**
 * Mobile
 * @constant
 */
export const MOBILE = {
  // Navigation
  /** N A V */
  NAV: {
    /** M E N U */
    MENU: "Menu",
    OPEN_MENU: "Open menu",
    CLOSE_MENU: "Close menu",
    /** B A C K */
    BACK: "Back",
    /** H O M E */
    HOME: "Home",
    /** S E A R C H */
    SEARCH: "Search",
    /** C A R T */
    CART: "Cart",
    /** A C C O U N T */
    ACCOUNT: "Account",
  },

  // Actions
  /** A C T I O N S */
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

/**
 * Features
 * @constant
 */
export const FEATURES = {
  // Wishlist
  /** W I S H L I S T */
  WISHLIST: {
    MY_WISHLIST: "My Wishlist",
    /** W I S H L I S T */
    WISHLIST: "Wishlist",
    SAVE_LATER: "Save for Later",
    MOVE_TO_WISHLIST: "Move to Wishlist",
    MOVE_TO_CART: "Move to Cart",
    ITEMS_SAVED: "{count} items saved",
    /** S H A R E */
    SHARE: "Share Wishlist",
    MAKE_PUBLIC: "Make Public",
    MAKE_PRIVATE: "Make Private",
  },

  // Favorites
  /** F A V O R I T E S */
  FAVORITES: {
    MY_FAVORITES: "My Favorites",
    /** F A V O R I T E S */
    FAVORITES: "Favorites",
    SAVED_ITEMS: "Saved Items",
    /** A D D */
    ADD: "Add to Favorites",
    /** R E M O V E */
    REMOVE: "Remove from Favorites",
    /** C O U N T */
    COUNT: "{count} favorites",
  },

  // Notifications
  /** N O T I F I C A T I O N S */
  NOTIFICATIONS: {
    /** T I T L E */
    TITLE: "Notifications",
    /** A L L */
    ALL: "All Notifications",
    MARK_READ: "Mark as Read",
    MARK_ALL_READ: "Mark All as Read",
    /** D E L E T E */
    DELETE: "Delete Notification",
    CLEAR_ALL: "Clear All",
    NO_NEW: "No new notifications",
    UNREAD_COUNT: "{count} unread",
    /** S E T T I N G S */
    SETTINGS: "Notification Settings",
    EMAIL_NOTIFICATIONS: "Email Notifications",
    PUSH_NOTIFICATIONS: "Push Notifications",
    SMS_NOTIFICATIONS: "SMS Notifications",
  },
} as const;

// =============================================================================
// COMBINED EXPORT
// =============================================================================

/**
 * Lang
 * @constant
 */
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
/**
 * Language type
 * 
 * @typedef {Object} Language
 * @description Type definition for Language
 */
/**
 * Language type definition
 *
 * @typedef {typeof LANG} Language
 * @description Type definition for Language
 */
export type Language = typeof LANG;
