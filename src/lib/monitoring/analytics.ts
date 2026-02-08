/**
 * Google Analytics 4 Integration
 *
 * Tracks user events, conversions, and custom dimensions
 */

import {
  getAnalytics,
  logEvent,
  setUserId,
  setUserProperties,
  Analytics,
} from "firebase/analytics";
import { app } from "@/lib/firebase/config";

// Initialize Google Analytics
let analytics: Analytics | null = null;

if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

/**
 * Log a custom event to Google Analytics
 *
 * @example
 * trackEvent('product_view', {
 *   product_id: '123',
 *   product_name: 'T-Shirt',
 *   category: 'Clothing'
 * });
 */
export const trackEvent = (
  eventName: string,
  eventParams?: Record<string, any>,
): void => {
  if (!analytics) return;

  try {
    logEvent(analytics, eventName, eventParams);
  } catch (error) {
    console.error(`Failed to log event ${eventName}:`, error);
  }
};

/**
 * Set the user ID for analytics tracking
 *
 * @example
 * setAnalyticsUserId('user_12345');
 */
export const setAnalyticsUserId = (userId: string | null): void => {
  if (!analytics) return;

  try {
    setUserId(analytics, userId);
  } catch (error) {
    console.error("Failed to set user ID:", error);
  }
};

/**
 * Set custom user properties for analytics
 *
 * @example
 * setAnalyticsUserProperties({
 *   role: 'seller',
 *   plan: 'premium',
 *   signup_date: '2026-01-01'
 * });
 */
export const setAnalyticsUserProperties = (
  properties: Record<string, string | number | boolean>,
): void => {
  if (!analytics) return;

  try {
    setUserProperties(analytics, properties);
  } catch (error) {
    console.error("Failed to set user properties:", error);
  }
};

/**
 * Track page view
 *
 * @example
 * trackPageView('/products', 'Products Page');
 */
export const trackPageView = (page_path: string, page_title: string): void => {
  trackEvent("page_view", {
    page_path,
    page_title,
  });
};

/**
 * Track user authentication events
 */
export const trackAuth = {
  login: (method: "email" | "google" | "apple") => {
    trackEvent("login", { method });
  },

  register: (method: "email" | "google" | "apple") => {
    trackEvent("sign_up", { method });
  },

  logout: () => {
    trackEvent("logout");
  },
};

/**
 * Track e-commerce events
 */
export const trackEcommerce = {
  /**
   * Track product view
   */
  viewProduct: (product: {
    id: string;
    name: string;
    category: string;
    price: number;
  }) => {
    trackEvent("view_item", {
      currency: "USD",
      value: product.price,
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          item_category: product.category,
          price: product.price,
        },
      ] as any[],
    });
  },

  /**
   * Track add to cart
   */
  addToCart: (product: {
    id: string;
    name: string;
    category: string;
    price: number;
    quantity: number;
  }) => {
    trackEvent("add_to_cart", {
      currency: "USD",
      value: product.price * product.quantity,
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          item_category: product.category,
          price: product.price,
          quantity: product.quantity,
        },
      ] as any[],
    });
  },

  /**
   * Track purchase
   */
  purchase: (order: {
    id: string;
    total: number;
    tax?: number;
    shipping?: number;
    items: Array<{
      id: string;
      name: string;
      category: string;
      price: number;
      quantity: number;
    }>;
  }) => {
    trackEvent("purchase", {
      transaction_id: order.id,
      currency: "USD",
      value: order.total,
      tax: order.tax || 0,
      shipping: order.shipping || 0,
      items: order.items.map((item) => ({
        item_id: item.id,
        item_name: item.name,
        item_category: item.category,
        price: item.price,
        quantity: item.quantity,
      })) as any[],
    });
  },

  /**
   * Track auction bid
   */
  placeBid: (product: { id: string; name: string; bidAmount: number }) => {
    trackEvent("place_bid", {
      product_id: product.id,
      product_name: product.name,
      bid_amount: product.bidAmount,
    });
  },

  /**
   * Track auction win
   */
  winAuction: (product: { id: string; name: string; finalBid: number }) => {
    trackEvent("win_auction", {
      product_id: product.id,
      product_name: product.name,
      final_bid: product.finalBid,
    });
  },
};

/**
 * Track content engagement
 */
export const trackContent = {
  /**
   * Track search
   */
  search: (searchTerm: string, resultsCount: number) => {
    trackEvent("search", {
      search_term: searchTerm,
      results_count: resultsCount,
    });
  },

  /**
   * Track FAQ view
   */
  viewFaq: (faqId: string, question: string) => {
    trackEvent("view_faq", {
      faq_id: faqId,
      question,
    });
  },

  /**
   * Track review submission
   */
  submitReview: (productId: string, rating: number) => {
    trackEvent("submit_review", {
      product_id: productId,
      rating,
    });
  },

  /**
   * Track social share
   */
  share: (content_type: string, item_id: string, method: string) => {
    trackEvent("share", {
      content_type,
      item_id,
      method,
    });
  },
};

/**
 * Track form interactions
 */
export const trackForm = {
  /**
   * Track form submission
   */
  submit: (formName: string, success: boolean) => {
    trackEvent("form_submit", {
      form_name: formName,
      success,
    });
  },

  /**
   * Track form error
   */
  error: (formName: string, fieldName: string, errorType: string) => {
    trackEvent("form_error", {
      form_name: formName,
      field_name: fieldName,
      error_type: errorType,
    });
  },
};

/**
 * Track admin actions
 */
export const trackAdmin = {
  /**
   * Track user management action
   */
  manageUser: (
    action: "edit" | "disable" | "delete" | "promote",
    targetUserId: string,
  ) => {
    trackEvent("admin_manage_user", {
      action,
      target_user_id: targetUserId,
    });
  },

  /**
   * Track content management action
   */
  manageContent: (
    contentType: string,
    action: "create" | "edit" | "delete",
  ) => {
    trackEvent("admin_manage_content", {
      content_type: contentType,
      action,
    });
  },

  /**
   * Track settings change
   */
  updateSettings: (settingCategory: string) => {
    trackEvent("admin_update_settings", {
      setting_category: settingCategory,
    });
  },
};

/**
 * Common analytics events
 */
export const ANALYTICS_EVENTS = {
  // User Events
  LOGIN: "login",
  SIGN_UP: "sign_up",
  LOGOUT: "logout",

  // Product Events
  VIEW_ITEM: "view_item",
  VIEW_ITEM_LIST: "view_item_list",
  ADD_TO_CART: "add_to_cart",
  REMOVE_FROM_CART: "remove_from_cart",

  // Purchase Events
  BEGIN_CHECKOUT: "begin_checkout",
  PURCHASE: "purchase",
  REFUND: "refund",

  // Auction Events
  PLACE_BID: "place_bid",
  WIN_AUCTION: "win_auction",

  // Engagement Events
  SEARCH: "search",
  SHARE: "share",
  SELECT_CONTENT: "select_content",

  // Form Events
  FORM_START: "form_start",
  FORM_SUBMIT: "form_submit",
  FORM_ERROR: "form_error",
} as const;

export type AnalyticsEvent =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];
