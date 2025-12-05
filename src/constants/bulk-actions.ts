/**
 * @fileoverview TypeScript Module
 * @module src/constants/bulk-actions
 * @description This file contains functionality related to bulk-actions
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * Bulk Actions Configuration
 * Reusable bulk action definitions for different resource types
 */

import { BulkAction } from "@/components/common/inline-edit";

/**
 * Get bulk actions for products (admin/seller)
 */
/**
 * Retrieves product bulk actions
 *
 * @param {number} selectedCount - Number of selected
 *
 * @returns {number} The productbulkactions result
 *
 * @example
 * getProductBulkActions(123);
 */

/**
 * Retrieves product bulk actions
 *
 * @param {number} selectedCount - Number of selected
 *
 * @returns {number} The productbulkactions result
 *
 * @example
 * getProductBulkActions(123);
 */

export function getProductBulkActions(selectedCount: number): BulkAction[] {
  return [
    {
      /** Id */
      id: "publish",
      /** Label */
      label: "Publish",
      /** Variant */
      variant: "success",
      /** Confirm */
      confirm: false,
    },
    {
      /** Id */
      id: "draft",
      /** Label */
      label: "Move to Draft",
      /** Variant */
      variant: "default",
      /** Confirm */
      confirm: false,
    },
    {
      /** Id */
      id: "archive",
      /** Label */
      label: "Archive",
      /** Variant */
      variant: "default",
      /** Confirm */
      confirm: false,
    },
    {
      /** Id */
      id: "feature",
      /** Label */
      label: "Set Featured",
      /** Variant */
      variant: "success",
      /** Confirm */
      confirm: false,
    },
    {
      /** Id */
      id: "unfeature",
      /** Label */
      label: "Remove Featured",
      /** Variant */
      variant: "default",
      /** Confirm */
      confirm: false,
    },
    {
      /** Id */
      id: "delete",
      /** Label */
      label: "Delete",
      /** Variant */
      variant: "danger",
      /** Confirm */
      confirm: true,
      /** Confirm Title */
      confirmTitle: "Delete Products",
      /** Confirm Message */
      confirmMessage: `Are you sure you want to delete ${selectedCount} product${
        selectedCount === 1 ? "" : "s"
      }? This action cannot be undone.`,
    },
  ];
}

/**
 * Get bulk actions for shops (admin only)
 */
/**
 * Retrieves shop bulk actions
 *
 * @param {number} selectedCount - Number of selected
 *
 * @returns {number} The shopbulkactions result
 *
 * @example
 * getShopBulkActions(123);
 */

/**
 * Retrieves shop bulk actions
 *
 * @param {number} selectedCount - Number of selected
 *
 * @returns {number} The shopbulkactions result
 *
 * @example
 * getShopBulkActions(123);
 */

export function getShopBulkActions(selectedCount: number): BulkAction[] {
  return [
    {
      /** Id */
      id: "verify",
      /** Label */
      label: "Verify Shops",
      /** Variant */
      variant: "success",
      /** Confirm */
      confirm: false,
    },
    {
      /** Id */
      id: "unverify",
      /** Label */
      label: "Remove Verification",
      /** Variant */
      variant: "default",
      /** Confirm */
      confirm: false,
    },
    {
      /** Id */
      id: "feature",
      /** Label */
      label: "Set Featured",
      /** Variant */
      variant: "success",
      /** Confirm */
      confirm: false,
    },
    {
      /** Id */
      id: "unfeature",
      /** Label */
      label: "Remove Featured",
      /** Variant */
      variant: "default",
      /** Confirm */
      confirm: false,
    },
    {
      /** Id */
      id: "ban",
      /** Label */
      label: "Suspend/Ban",
      /** Variant */
      variant: "danger",
      /** Confirm */
      confirm: true,
      /** Confirm Title */
      confirmTitle: "Ban Shops",
      /** Confirm Message */
      confirmMessage: `Are you sure you want to ban ${selectedCount} shop${
        selectedCount === 1 ? "" : "s"
      }? They will not be able to sell products.`,
    },
    {
      /** Id */
      id: "delete",
      /** Label */
      label: "Delete",
      /** Variant */
      variant: "danger",
      /** Confirm */
      confirm: true,
      /** Confirm Title */
      confirmTitle: "Delete Shops",
      /** Confirm Message */
      confirmMessage: `Are you sure you want to delete ${selectedCount} shop${
        selectedCount === 1 ? "" : "s"
      }? This action cannot be undone and will remove all associated products.`,
    },
  ];
}

/**
 * Get bulk actions for auctions (admin/seller)
 */
/**
 * Retrieves auction bulk actions
 *
 * @param {number} selectedCount - Number of selected
 *
 * @returns {number} The auctionbulkactions result
 *
 * @example
 * getAuctionBulkActions(123);
 */

/**
 * Retrieves auction bulk actions
 *
 * @param {number} selectedCount - Number of selected
 *
 * @returns {number} The auctionbulkactions result
 *
 * @example
 * getAuctionBulkActions(123);
 */

export function getAuctionBulkActions(selectedCount: number): BulkAction[] {
  return [
    {
      /** Id */
      id: "start",
      /** Label */
      label: "Start Auctions",
      /** Variant */
      variant: "success",
      /** Confirm */
      confirm: false,
    },
    {
      /** Id */
      id: "end",
      /** Label */
      label: "End Auctions",
      /** Variant */
      variant: "default",
      /** Confirm */
      confirm: true,
      /** Confirm Title */
      confirmTitle: "End Auctions",
      /** Confirm Message */
      confirmMessage: `Are you sure you want to end ${selectedCount} auction${
        selectedCount === 1 ? "" : "s"
      }? This will close bidding immediately.`,
    },
    {
      /** Id */
      id: "cancel",
      /** Label */
      label: "Cancel Auctions",
      /** Variant */
      variant: "danger",
      /** Confirm */
      confirm: true,
      /** Confirm Title */
      confirmTitle: "Cancel Auctions",
      /** Confirm Message */
      confirmMessage: `Are you sure you want to cancel ${selectedCount} auction${
        selectedCount === 1 ? "" : "s"
      }? All bids will be refunded.`,
    },
    {
      /** Id */
      id: "feature",
      /** Label */
      label: "Set Featured",
      /** Variant */
      variant: "success",
      /** Confirm */
      confirm: false,
    },
    {
      /** Id */
      id: "unfeature",
      /** Label */
      label: "Remove Featured",
      /** Variant */
      variant: "default",
      /** Confirm */
      confirm: false,
    },
    {
      /** Id */
      id: "delete",
      /** Label */
      label: "Delete",
      /** Variant */
      variant: "danger",
      /** Confirm */
      confirm: true,
      /** Confirm Title */
      confirmTitle: "Delete Auctions",
      /** Confirm Message */
      confirmMessage: `Are you sure you want to delete ${selectedCount} auction${
        selectedCount === 1 ? "" : "s"
      }? This action cannot be undone.`,
    },
  ];
}

/**
 * Get bulk actions for categories (admin only)
 */
/**
 * Retrieves category bulk actions
 *
 * @param {number} selectedCount - Number of selected
 *
 * @returns {number} The categorybulkactions result
 *
 * @example
 * getCategoryBulkActions(123);
 */

/**
 * Retrieves category bulk actions
 *
 * @param {number} selectedCount - Number of selected
 *
 * @returns {number} The categorybulkactions result
 *
 * @example
 * getCategoryBulkActions(123);
 */

export function getCategoryBulkActions(selectedCount: number): BulkAction[] {
  return [
    {
      /** Id */
      id: "activate",
      /** Label */
      label: "Activate",
      /** Variant */
      variant: "success",
      /** Confirm */
      confirm: false,
    },
    {
      /** Id */
      id: "deactivate",
      /** Label */
      label: "Deactivate",
      /** Variant */
      variant: "default",
      /** Confirm */
      confirm: false,
    },
    {
      /** Id */
      id: "feature",
      /** Label */
      label: "Set Featured",
      /** Variant */
      variant: "success",
      /** Confirm */
      confirm: false,
    },
    {
      /** Id */
      id: "unfeature",
      /** Label */
      label: "Remove Featured",
      /** Variant */
      variant: "default",
      /** Confirm */
      confirm: false,
    },
    {
      /** Id */
      id: "delete",
      /** Label */
      label: "Delete",
      /** Variant */
      variant: "danger",
      /** Confirm */
      confirm: true,
      /** Confirm Title */
      confirmTitle: "Delete Categories",
      /** Confirm Message */
      confirmMessage: `Are you sure you want to delete ${selectedCount} categor${
        selectedCount === 1 ? "y" : "ies"
      }? This cannot be undone.`,
    },
  ];
}

/**
 * Get bulk actions for users (admin only)
 */
/**
 * Retrieves user bulk actions
 *
 * @param {number} selectedCount - Number of selected
 *
 * @returns {number} The userbulkactions result
 *
 * @example
 * getUserBulkActions(123);
 */

/**
 * Retrieves user bulk actions
 *
 * @param {number} selectedCount - Number of selected
 *
 * @returns {number} The userbulkactions result
 *
 * @example
 * getUserBulkActions(123);
 */

export function getUserBulkActions(selectedCount: number): BulkAction[] {
  return [
    {
      /** Id */
      id: "verify",
      /** Label */
      label: "Verify Users",
      /** Variant */
      variant: "success",
      /** Confirm */
      confirm: false,
    },
    {
      /** Id */
      id: "unverify",
      /** Label */
      label: "Remove Verification",
      /** Variant */
      variant: "default",
      /** Confirm */
      confirm: false,
    },
    {
      /** Id */
      id: "suspend",
      /** Label */
      label: "Suspend",
      /** Variant */
      variant: "danger",
      /** Confirm */
      confirm: true,
      /** Confirm Title */
      confirmTitle: "Suspend Users",
      /** Confirm Message */
      confirmMessage: `Are you sure you want to suspend ${selectedCount} user${
        selectedCount === 1 ? "" : "s"
      }? They will not be able to access their accounts.`,
    },
    {
      /** Id */
      id: "unsuspend",
      /** Label */
      label: "Unsuspend",
      /** Variant */
      variant: "success",
      /** Confirm */
      confirm: false,
    },
    {
      /** Id */
      id: "delete",
      /** Label */
      label: "Delete",
      /** Variant */
      variant: "danger",
      /** Confirm */
      confirm: true,
      /** Confirm Title */
      confirmTitle: "Delete Users",
      /** Confirm Message */
      confirmMessage: `Are you sure you want to delete ${selectedCount} user${
        selectedCount === 1 ? "" : "s"
      }? This action cannot be undone and will remove all user data.`,
    },
  ];
}

/**
 * Get bulk actions for orders (admin/seller)
 */
/**
 * Retrieves order bulk actions
 *
 * @param {number} selectedCount - Number of selected
 *
 * @returns {number} The orderbulkactions result
 *
 * @example
 * getOrderBulkActions(123);
 */

/**
 * Retrieves order bulk actions
 *
 * @param {number} selectedCount - Number of selected
 *
 * @returns {number} The orderbulkactions result
 *
 * @example
 * getOrderBulkActions(123);
 */

export function getOrderBulkActions(selectedCount: number): BulkAction[] {
  return [
    {
      /** Id */
      id: "confirm",
      /** Label */
      label: "Confirm Orders",
      /** Variant */
      variant: "success",
      /** Confirm */
      confirm: false,
    },
    {
      /** Id */
      id: "ship",
      /** Label */
      label: "Mark as Shipped",
      /** Variant */
      variant: "success",
      /** Confirm */
      confirm: false,
    },
    {
      /** Id */
      id: "deliver",
      /** Label */
      label: "Mark as Delivered",
      /** Variant */
      variant: "success",
      /** Confirm */
      confirm: false,
    },
    {
      /** Id */
      id: "cancel",
      /** Label */
      label: "Cancel Orders",
      /** Variant */
      variant: "danger",
      /** Confirm */
      confirm: true,
      /** Confirm Title */
      confirmTitle: "Cancel Orders",
      /** Confirm Message */
      confirmMessage: `Are you sure you want to cancel ${selectedCount} order${
        selectedCount === 1 ? "" : "s"
      }? Customers will be notified and refunds processed if applicable.`,
    },
    {
      /** Id */
      id: "export",
      /** Label */
      label: "Export CSV",
      /** Variant */
      variant: "default",
      /** Confirm */
      confirm: false,
    },
  ];
}

/**
 * Get bulk actions for reviews (admin only)
 */
/**
 * Retrieves review bulk actions
 *
 * @param {number} selectedCount - Number of selected
 *
 * @returns {number} The reviewbulkactions result
 *
 * @example
 * getReviewBulkActions(123);
 */

/**
 * Retrieves review bulk actions
 *
 * @param {number} selectedCount - Number of selected
 *
 * @returns {number} The reviewbulkactions result
 *
 * @example
 * getReviewBulkActions(123);
 */

export function getReviewBulkActions(selectedCount: number): BulkAction[] {
  return [
    {
      /** Id */
      id: "approve",
      /** Label */
      label: "Approve",
      /** Variant */
      variant: "success",
      /** Confirm */
      confirm: false,
    },
    {
      /** Id */
      id: "reject",
      /** Label */
      label: "Reject",
      /** Variant */
      variant: "danger",
      /** Confirm */
      confirm: false,
    },
    {
      /** Id */
      id: "feature",
      /** Label */
      label: "Set Featured",
      /** Variant */
      variant: "success",
      /** Confirm */
      confirm: false,
    },
    {
      /** Id */
      id: "unfeature",
      /** Label */
      label: "Remove Featured",
      /** Variant */
      variant: "default",
      /** Confirm */
      confirm: false,
    },
    {
      /** Id */
      id: "delete",
      /** Label */
      label: "Delete",
      /** Variant */
      variant: "danger",
      /** Confirm */
      confirm: true,
      /** Confirm Title */
      confirmTitle: "Delete Reviews",
      /** Confirm Message */
      confirmMessage: `Are you sure you want to delete ${selectedCount} review${
        selectedCount === 1 ? "" : "s"
      }? This action cannot be undone.`,
    },
  ];
}

/**
 * Get bulk actions for coupons (admin/seller)
 */
/**
 * Retrieves coupon bulk actions
 *
 * @param {number} selectedCount - Number of selected
 *
 * @returns {number} The couponbulkactions result
 *
 * @example
 * getCouponBulkActions(123);
 */

/**
 * Retrieves coupon bulk actions
 *
 * @param {number} selectedCount - Number of selected
 *
 * @returns {number} The couponbulkactions result
 *
 * @example
 * getCouponBulkActions(123);
 */

export function getCouponBulkActions(selectedCount: number): BulkAction[] {
  return [
    {
      /** Id */
      id: "activate",
      /** Label */
      label: "Activate",
      /** Variant */
      variant: "success",
      /** Confirm */
      confirm: false,
    },
    {
      /** Id */
      id: "deactivate",
      /** Label */
      label: "Deactivate",
      /** Variant */
      variant: "default",
      /** Confirm */
      confirm: false,
    },
    {
      /** Id */
      id: "delete",
      /** Label */
      label: "Delete",
      /** Variant */
      variant: "danger",
      /** Confirm */
      confirm: true,
      /** Confirm Title */
      confirmTitle: "Delete Coupons",
      /** Confirm Message */
      confirmMessage: `Are you sure you want to delete ${selectedCount} coupon${
        selectedCount === 1 ? "" : "s"
      }? This action cannot be undone.`,
    },
  ];
}

/**
 * Get bulk actions for hero slides (admin only)
 */
/**
 * Retrieves hero slide bulk actions
 *
 * @param {number} selectedCount - Number of selected
 *
 * @returns {number} The heroslidebulkactions result
 *
 * @example
 * getHeroSlideBulkActions(123);
 */

/**
 * Retrieves hero slide bulk actions
 *
 * @param {number} selectedCount - Number of selected
 *
 * @returns {number} The heroslidebulkactions result
 *
 * @example
 * getHeroSlideBulkActions(123);
 */

export function getHeroSlideBulkActions(selectedCount: number): BulkAction[] {
  return [
    {
      /** Id */
      id: "activate",
      /** Label */
      label: "Activate",
      /** Variant */
      variant: "success",
      /** Confirm */
      confirm: false,
    },
    {
      /** Id */
      id: "deactivate",
      /** Label */
      label: "Deactivate",
      /** Variant */
      variant: "default",
      /** Confirm */
      confirm: false,
    },
    {
      /** Id */
      id: "delete",
      /** Label */
      label: "Delete",
      /** Variant */
      variant: "danger",
      /** Confirm */
      confirm: true,
      /** Confirm Title */
      confirmTitle: "Delete Slides",
      /** Confirm Message */
      confirmMessage: `Are you sure you want to delete ${selectedCount} slide${
        selectedCount === 1 ? "" : "s"
      }? This action cannot be undone.`,
    },
  ];
}

/**
 * Get bulk actions for support tickets (admin/seller)
 */
/**
 * Retrieves ticket bulk actions
 *
 * @param {number} selectedCount - Number of selected
 *
 * @returns {number} The ticketbulkactions result
 *
 * @example
 * getTicketBulkActions(123);
 */

/**
 * Retrieves ticket bulk actions
 *
 * @param {number} selectedCount - Number of selected
 *
 * @returns {number} The ticketbulkactions result
 *
 * @example
 * getTicketBulkActions(123);
 */

export function getTicketBulkActions(selectedCount: number): BulkAction[] {
  return [
    {
      /** Id */
      id: "assign",
      /** Label */
      label: "Assign to Me",
      /** Variant */
      variant: "default",
      /** Confirm */
      confirm: false,
    },
    {
      /** Id */
      id: "resolve",
      /** Label */
      label: "Mark as Resolved",
      /** Variant */
      variant: "success",
      /** Confirm */
      confirm: false,
    },
    {
      /** Id */
      id: "close",
      /** Label */
      label: "Close Tickets",
      /** Variant */
      variant: "default",
      /** Confirm */
      confirm: true,
      /** Confirm Title */
      confirmTitle: "Close Tickets",
      /** Confirm Message */
      confirmMessage: `Are you sure you want to close ${selectedCount} ticket${
        selectedCount === 1 ? "" : "s"
      }?`,
    },
    {
      /** Id */
      id: "delete",
      /** Label */
      label: "Delete",
      /** Variant */
      variant: "danger",
      /** Confirm */
      confirm: true,
      /** Confirm Title */
      confirmTitle: "Delete Tickets",
      /** Confirm Message */
      confirmMessage: `Are you sure you want to delete ${selectedCount} ticket${
        selectedCount === 1 ? "" : "s"
      }? This action cannot be undone.`,
    },
  ];
}

/**
 * Get bulk actions for blog posts (admin)
 */
/**
 * Retrieves blog bulk actions
 *
 * @param {number} selectedCount - Number of selected
 *
 * @returns {number} The blogbulkactions result
 *
 * @example
 * getBlogBulkActions(123);
 */

/**
 * Retrieves blog bulk actions
 *
 * @param {number} selectedCount - Number of selected
 *
 * @returns {number} The blogbulkactions result
 *
 * @example
 * getBlogBulkActions(123);
 */

export function getBlogBulkActions(selectedCount: number): BulkAction[] {
  return [
    {
      /** Id */
      id: "publish",
      /** Label */
      label: "Publish",
      /** Variant */
      variant: "success",
      /** Confirm */
      confirm: false,
    },
    {
      /** Id */
      id: "draft",
      /** Label */
      label: "Set as Draft",
      /** Variant */
      variant: "default",
      /** Confirm */
      confirm: false,
    },
    {
      /** Id */
      id: "archive",
      /** Label */
      label: "Archive",
      /** Variant */
      variant: "default",
      /** Confirm */
      confirm: false,
    },
    {
      /** Id */
      id: "feature",
      /** Label */
      label: "Feature",
      /** Variant */
      variant: "default",
      /** Confirm */
      confirm: false,
    },
    {
      /** Id */
      id: "unfeature",
      /** Label */
      label: "Unfeature",
      /** Variant */
      variant: "default",
      /** Confirm */
      confirm: false,
    },
    {
      /** Id */
      id: "delete",
      /** Label */
      label: "Delete",
      /** Variant */
      variant: "danger",
      /** Confirm */
      confirm: true,
      /** Confirm Title */
      confirmTitle: "Delete Blog Posts",
      /** Confirm Message */
      confirmMessage: `Are you sure you want to delete ${selectedCount} blog post${
        selectedCount === 1 ? "" : "s"
      }? This action cannot be undone.`,
    },
  ];
}

/**
 * Common bulk action builder for generic resources
 */
/**
 * Retrieves generic bulk actions
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * getGenericBulkActions();
 */

/**
 * Retrieves generic bulk actions
 *
 * @returns {string} The genericbulkactions result
 *
 * @example
 * getGenericBulkActions();
 */

export function getGenericBulkActions(
  /** Resource Name */
  resourceName: string,
  /** Selected Count */
  selectedCount: number,
  /** Options */
  options?: {
    /** Has Activate */
    hasActivate?: boolean;
    /** Has Feature */
    hasFeature?: boolean;
    /** Has Verify */
    hasVerify?: boolean;
    /** Has Archive */
    hasArchive?: boolean;
  },
): BulkAction[] {
  const actions: BulkAction[] = [];

  if (options?.hasActivate) {
    actions.push(
      {
        /** Id */
        id: "activate",
        /** Label */
        label: "Activate",
        /** Variant */
        variant: "success",
        /** Confirm */
        confirm: false,
      },
      {
        /** Id */
        id: "deactivate",
        /** Label */
        label: "Deactivate",
        /** Variant */
        variant: "default",
        /** Confirm */
        confirm: false,
      },
    );
  }

  if (options?.hasFeature) {
    actions.push(
      {
        /** Id */
        id: "feature",
        /** Label */
        label: "Set Featured",
        /** Variant */
        variant: "success",
        /** Confirm */
        confirm: false,
      },
      {
        /** Id */
        id: "unfeature",
        /** Label */
        label: "Remove Featured",
        /** Variant */
        variant: "default",
        /** Confirm */
        confirm: false,
      },
    );
  }

  if (options?.hasVerify) {
    actions.push(
      {
        /** Id */
        id: "verify",
        /** Label */
        label: "Verify",
        /** Variant */
        variant: "success",
        /** Confirm */
        confirm: false,
      },
      {
        /** Id */
        id: "unverify",
        /** Label */
        label: "Remove Verification",
        /** Variant */
        variant: "default",
        /** Confirm */
        confirm: false,
      },
    );
  }

  if (options?.hasArchive) {
    actions.push({
      /** Id */
      id: "archive",
      /** Label */
      label: "Archive",
      /** Variant */
      variant: "default",
      /** Confirm */
      confirm: false,
    });
  }

  actions.push({
    /** Id */
    id: "delete",
    /** Label */
    label: "Delete",
    /** Variant */
    variant: "danger",
    /** Confirm */
    confirm: true,
    /** Confirm Title */
    confirmTitle: `Delete ${resourceName}`,
    /** Confirm Message */
    confirmMessage: `Are you sure you want to delete ${selectedCount} ${resourceName.toLowerCase()}${
      selectedCount === 1 ? "" : "s"
    }? This action cannot be undone.`,
  });

  return actions;
}
