/**
 * Page-specific text constants
 * Centralized location for all hardcoded text strings in pages
 */

// Categories Page
export const CATEGORIES_PAGE = {
  TITLE: "Browse Categories",
  DESCRIPTION_PREFIX: "Discover",
  DESCRIPTION_SUFFIX: "categories and thousands of products",
  SEARCH_PLACEHOLDER: "Search categories...",
  SORT_OPTIONS: {
    DEFAULT: "Default Order",
    ALPHABETICAL: "Alphabetically",
    PRODUCT_COUNT: "By Product Count",
    RECENTLY_ADDED: "Recently Added",
  },
  FILTER_FEATURED: "⭐ Featured Only",
  LEVEL_LABELS: {
    ROOT: "Root Categories",
    LEVEL: "Level", // Used as: "Level {number} Categories"
  },
  EMPTY_STATE: {
    TITLE: "No categories available",
    DESCRIPTION: "Categories will appear here once they are added.",
    ACTION_LABEL: "Go to Home",
  },
  SEARCH_EMPTY: {
    PREFIX: "No categories found matching",
    FALLBACK: "No categories found",
  },
  PAGINATION: {
    PREVIOUS: "Previous",
    NEXT: "Next",
    PAGE_PREFIX: "Page",
    SHOWING: "Showing",
    CATEGORY: "category",
    CATEGORIES: "categories",
  },
  SUBCATEGORY_LABEL: "Subcategory",
} as const;

// Shop Page
export const SHOP_PAGE = {
  TABS: {
    PRODUCTS: "Products",
    AUCTIONS: "Auctions",
    REVIEWS: "Reviews",
    ABOUT: "About",
  },
  SEARCH: {
    PRODUCTS_PLACEHOLDER: "Search products in this shop...",
    AUCTIONS_PLACEHOLDER: "Search auctions in this shop...",
    BUTTON: "Search",
  },
  SORT: {
    NEWEST: "Newest",
    PRICE: "Price",
    RATING: "Rating",
    POPULAR: "Popular",
  },
  SORT_ORDER: {
    HIGH_TO_LOW: "High to Low",
    LOW_TO_HIGH: "Low to High",
  },
  FILTERS: {
    BUTTON: "Filters",
    APPLY: "Apply Filters",
  },
  EMPTY_STATE: {
    NO_PRODUCTS: {
      TITLE: "No products found",
      DESCRIPTION_SEARCH: "Try adjusting your search",
      DESCRIPTION_DEFAULT: "This shop hasn't listed any products yet",
    },
    NO_AUCTIONS: {
      TITLE: "No auctions found",
      DESCRIPTION_SEARCH: "Try adjusting your search",
      DESCRIPTION_DEFAULT: "This shop hasn't created any auctions yet",
    },
  },
  SHOWING: {
    PREFIX: "Showing",
    PRODUCT: "product",
    PRODUCTS: "products",
    AUCTION: "auction",
    AUCTIONS: "auctions",
  },
  REVIEWS: {
    TITLE: "Customer Reviews",
    COMING_SOON: "Reviews coming soon",
    DESCRIPTION: "Shop reviews will be displayed here",
  },
  ABOUT: {
    TITLE_PREFIX: "About",
    NO_DESCRIPTION: "No description available.",
    SHIPPING_POLICY: "Shipping Policy",
    RETURN_POLICY: "Return Policy",
    CONTACT_INFO: "Contact Information",
    EMAIL: "Email:",
    PHONE: "Phone:",
    WEBSITE: "Website:",
  },
  ACTIONS: {
    ADD_TO_CART: "Add to Cart",
    PLACE_BID: "Place Bid",
    VIEW_DETAILS: "View Details",
  },
  STATUS: {
    IN_STOCK: "In Stock",
    OUT_OF_STOCK: "Out of Stock",
  },
  AUCTION: {
    CURRENT_BID: "Current Bid:",
    BIDS: "Bids:",
    TIME_LEFT: "Time Left",
  },
} as const;

// User Settings Page
export const USER_SETTINGS_PAGE = {
  TITLE: "Account Settings",
  SECTIONS: {
    PROFILE: "Profile Information",
    SECURITY: "Security",
    NOTIFICATIONS: "Notifications",
  },
  FIELDS: {
    FULL_NAME: "Full Name",
    EMAIL: "Email Address",
    PHONE: "Phone Number",
    ADDRESS: "Address",
    CITY: "City",
    STATE: "State",
    POSTAL_CODE: "Postal Code",
  },
  // TODO: Make phone placeholder dynamic based on country
  PLACEHOLDERS: {
    PHONE: "+91 9876543210", // Indian format
  },
  ACTIONS: {
    SAVE: "Save Changes",
    CANCEL: "Cancel",
    UPDATE: "Update",
  },
  MESSAGES: {
    SUCCESS: "Settings updated successfully",
    ERROR: "Failed to update settings",
  },
} as const;

// Support/Contact Page
export const SUPPORT_PAGE = {
  TITLE: "Support",
  SUBTITLE: "How can we help you?",
  CONTACT: {
    EMAIL: "Email:",
    PHONE: "Phone:",
    HOURS: "Working Hours:",
  },
  ACTIONS: {
    SUBMIT: "Submit Ticket",
    CANCEL: "Cancel",
  },
} as const;

// Common page texts
export const COMMON_PAGE_TEXTS = {
  LOADING: "Loading...",
  ERROR: "Something went wrong",
  RETRY: "Retry",
  GO_BACK: "Go Back",
  GO_HOME: "Go to Home",
} as const;

// Export all as a single object for easier imports
export const PAGE_TEXTS = {
  CATEGORIES: CATEGORIES_PAGE,
  SHOP: SHOP_PAGE,
  USER_SETTINGS: USER_SETTINGS_PAGE,
  SUPPORT: SUPPORT_PAGE,
  COMMON: COMMON_PAGE_TEXTS,
} as const;
