/**
 * Bulk Actions Configuration
 * Reusable bulk action definitions for different resource types
 */

import { BulkAction } from "@/components/common/inline-edit";

/**
 * Get bulk actions for products (admin/seller)
 */
export function getProductBulkActions(selectedCount: number): BulkAction[] {
  return [
    {
      id: "publish",
      label: "Publish",
      variant: "success",
      confirm: false,
    },
    {
      id: "draft",
      label: "Move to Draft",
      variant: "default",
      confirm: false,
    },
    {
      id: "archive",
      label: "Archive",
      variant: "default",
      confirm: false,
    },
    {
      id: "feature",
      label: "Set Featured",
      variant: "success",
      confirm: false,
    },
    {
      id: "unfeature",
      label: "Remove Featured",
      variant: "default",
      confirm: false,
    },
    {
      id: "delete",
      label: "Delete",
      variant: "danger",
      confirm: true,
      confirmTitle: "Delete Products",
      confirmMessage: `Are you sure you want to delete ${selectedCount} product${
        selectedCount === 1 ? "" : "s"
      }? This action cannot be undone.`,
    },
  ];
}

/**
 * Get bulk actions for shops (admin only)
 */
export function getShopBulkActions(selectedCount: number): BulkAction[] {
  return [
    {
      id: "verify",
      label: "Verify Shops",
      variant: "success",
      confirm: false,
    },
    {
      id: "unverify",
      label: "Remove Verification",
      variant: "default",
      confirm: false,
    },
    {
      id: "feature",
      label: "Set Featured",
      variant: "success",
      confirm: false,
    },
    {
      id: "unfeature",
      label: "Remove Featured",
      variant: "default",
      confirm: false,
    },
    {
      id: "ban",
      label: "Suspend/Ban",
      variant: "danger",
      confirm: true,
      confirmTitle: "Ban Shops",
      confirmMessage: `Are you sure you want to ban ${selectedCount} shop${
        selectedCount === 1 ? "" : "s"
      }? They will not be able to sell products.`,
    },
    {
      id: "delete",
      label: "Delete",
      variant: "danger",
      confirm: true,
      confirmTitle: "Delete Shops",
      confirmMessage: `Are you sure you want to delete ${selectedCount} shop${
        selectedCount === 1 ? "" : "s"
      }? This action cannot be undone and will remove all associated products.`,
    },
  ];
}

/**
 * Get bulk actions for auctions (admin/seller)
 */
export function getAuctionBulkActions(selectedCount: number): BulkAction[] {
  return [
    {
      id: "start",
      label: "Start Auctions",
      variant: "success",
      confirm: false,
    },
    {
      id: "end",
      label: "End Auctions",
      variant: "default",
      confirm: true,
      confirmTitle: "End Auctions",
      confirmMessage: `Are you sure you want to end ${selectedCount} auction${
        selectedCount === 1 ? "" : "s"
      }? This will close bidding immediately.`,
    },
    {
      id: "cancel",
      label: "Cancel Auctions",
      variant: "danger",
      confirm: true,
      confirmTitle: "Cancel Auctions",
      confirmMessage: `Are you sure you want to cancel ${selectedCount} auction${
        selectedCount === 1 ? "" : "s"
      }? All bids will be refunded.`,
    },
    {
      id: "feature",
      label: "Set Featured",
      variant: "success",
      confirm: false,
    },
    {
      id: "unfeature",
      label: "Remove Featured",
      variant: "default",
      confirm: false,
    },
    {
      id: "delete",
      label: "Delete",
      variant: "danger",
      confirm: true,
      confirmTitle: "Delete Auctions",
      confirmMessage: `Are you sure you want to delete ${selectedCount} auction${
        selectedCount === 1 ? "" : "s"
      }? This action cannot be undone.`,
    },
  ];
}

/**
 * Get bulk actions for categories (admin only)
 */
export function getCategoryBulkActions(selectedCount: number): BulkAction[] {
  return [
    {
      id: "activate",
      label: "Activate",
      variant: "success",
      confirm: false,
    },
    {
      id: "deactivate",
      label: "Deactivate",
      variant: "default",
      confirm: false,
    },
    {
      id: "feature",
      label: "Set Featured",
      variant: "success",
      confirm: false,
    },
    {
      id: "unfeature",
      label: "Remove Featured",
      variant: "default",
      confirm: false,
    },
    {
      id: "delete",
      label: "Delete",
      variant: "danger",
      confirm: true,
      confirmTitle: "Delete Categories",
      confirmMessage: `Are you sure you want to delete ${selectedCount} categor${
        selectedCount === 1 ? "y" : "ies"
      }? This cannot be undone.`,
    },
  ];
}

/**
 * Get bulk actions for users (admin only)
 */
export function getUserBulkActions(selectedCount: number): BulkAction[] {
  return [
    {
      id: "verify",
      label: "Verify Users",
      variant: "success",
      confirm: false,
    },
    {
      id: "unverify",
      label: "Remove Verification",
      variant: "default",
      confirm: false,
    },
    {
      id: "suspend",
      label: "Suspend",
      variant: "danger",
      confirm: true,
      confirmTitle: "Suspend Users",
      confirmMessage: `Are you sure you want to suspend ${selectedCount} user${
        selectedCount === 1 ? "" : "s"
      }? They will not be able to access their accounts.`,
    },
    {
      id: "unsuspend",
      label: "Unsuspend",
      variant: "success",
      confirm: false,
    },
    {
      id: "delete",
      label: "Delete",
      variant: "danger",
      confirm: true,
      confirmTitle: "Delete Users",
      confirmMessage: `Are you sure you want to delete ${selectedCount} user${
        selectedCount === 1 ? "" : "s"
      }? This action cannot be undone and will remove all user data.`,
    },
  ];
}

/**
 * Get bulk actions for orders (admin/seller)
 */
export function getOrderBulkActions(selectedCount: number): BulkAction[] {
  return [
    {
      id: "confirm",
      label: "Confirm Orders",
      variant: "success",
      confirm: false,
    },
    {
      id: "ship",
      label: "Mark as Shipped",
      variant: "success",
      confirm: false,
    },
    {
      id: "deliver",
      label: "Mark as Delivered",
      variant: "success",
      confirm: false,
    },
    {
      id: "cancel",
      label: "Cancel Orders",
      variant: "danger",
      confirm: true,
      confirmTitle: "Cancel Orders",
      confirmMessage: `Are you sure you want to cancel ${selectedCount} order${
        selectedCount === 1 ? "" : "s"
      }? Customers will be notified and refunds processed if applicable.`,
    },
    {
      id: "export",
      label: "Export CSV",
      variant: "default",
      confirm: false,
    },
  ];
}

/**
 * Get bulk actions for reviews (admin only)
 */
export function getReviewBulkActions(selectedCount: number): BulkAction[] {
  return [
    {
      id: "approve",
      label: "Approve",
      variant: "success",
      confirm: false,
    },
    {
      id: "reject",
      label: "Reject",
      variant: "danger",
      confirm: false,
    },
    {
      id: "feature",
      label: "Set Featured",
      variant: "success",
      confirm: false,
    },
    {
      id: "unfeature",
      label: "Remove Featured",
      variant: "default",
      confirm: false,
    },
    {
      id: "delete",
      label: "Delete",
      variant: "danger",
      confirm: true,
      confirmTitle: "Delete Reviews",
      confirmMessage: `Are you sure you want to delete ${selectedCount} review${
        selectedCount === 1 ? "" : "s"
      }? This action cannot be undone.`,
    },
  ];
}

/**
 * Get bulk actions for coupons (admin/seller)
 */
export function getCouponBulkActions(selectedCount: number): BulkAction[] {
  return [
    {
      id: "activate",
      label: "Activate",
      variant: "success",
      confirm: false,
    },
    {
      id: "deactivate",
      label: "Deactivate",
      variant: "default",
      confirm: false,
    },
    {
      id: "delete",
      label: "Delete",
      variant: "danger",
      confirm: true,
      confirmTitle: "Delete Coupons",
      confirmMessage: `Are you sure you want to delete ${selectedCount} coupon${
        selectedCount === 1 ? "" : "s"
      }? This action cannot be undone.`,
    },
  ];
}

/**
 * Get bulk actions for hero slides (admin only)
 */
export function getHeroSlideBulkActions(selectedCount: number): BulkAction[] {
  return [
    {
      id: "activate",
      label: "Activate",
      variant: "success",
      confirm: false,
    },
    {
      id: "deactivate",
      label: "Deactivate",
      variant: "default",
      confirm: false,
    },
    {
      id: "delete",
      label: "Delete",
      variant: "danger",
      confirm: true,
      confirmTitle: "Delete Slides",
      confirmMessage: `Are you sure you want to delete ${selectedCount} slide${
        selectedCount === 1 ? "" : "s"
      }? This action cannot be undone.`,
    },
  ];
}

/**
 * Get bulk actions for support tickets (admin/seller)
 */
export function getTicketBulkActions(selectedCount: number): BulkAction[] {
  return [
    {
      id: "assign",
      label: "Assign to Me",
      variant: "default",
      confirm: false,
    },
    {
      id: "resolve",
      label: "Mark as Resolved",
      variant: "success",
      confirm: false,
    },
    {
      id: "close",
      label: "Close Tickets",
      variant: "default",
      confirm: true,
      confirmTitle: "Close Tickets",
      confirmMessage: `Are you sure you want to close ${selectedCount} ticket${
        selectedCount === 1 ? "" : "s"
      }?`,
    },
    {
      id: "delete",
      label: "Delete",
      variant: "danger",
      confirm: true,
      confirmTitle: "Delete Tickets",
      confirmMessage: `Are you sure you want to delete ${selectedCount} ticket${
        selectedCount === 1 ? "" : "s"
      }? This action cannot be undone.`,
    },
  ];
}

/**
 * Get bulk actions for blog posts (admin)
 */
export function getBlogBulkActions(selectedCount: number): BulkAction[] {
  return [
    {
      id: "publish",
      label: "Publish",
      variant: "success",
      confirm: false,
    },
    {
      id: "draft",
      label: "Set as Draft",
      variant: "default",
      confirm: false,
    },
    {
      id: "archive",
      label: "Archive",
      variant: "default",
      confirm: false,
    },
    {
      id: "feature",
      label: "Feature",
      variant: "default",
      confirm: false,
    },
    {
      id: "unfeature",
      label: "Unfeature",
      variant: "default",
      confirm: false,
    },
    {
      id: "delete",
      label: "Delete",
      variant: "danger",
      confirm: true,
      confirmTitle: "Delete Blog Posts",
      confirmMessage: `Are you sure you want to delete ${selectedCount} blog post${
        selectedCount === 1 ? "" : "s"
      }? This action cannot be undone.`,
    },
  ];
}

/**
 * Common bulk action builder for generic resources
 */
export function getGenericBulkActions(
  resourceName: string,
  selectedCount: number,
  options?: {
    hasActivate?: boolean;
    hasFeature?: boolean;
    hasVerify?: boolean;
    hasArchive?: boolean;
  },
): BulkAction[] {
  const actions: BulkAction[] = [];

  if (options?.hasActivate) {
    actions.push(
      {
        id: "activate",
        label: "Activate",
        variant: "success",
        confirm: false,
      },
      {
        id: "deactivate",
        label: "Deactivate",
        variant: "default",
        confirm: false,
      },
    );
  }

  if (options?.hasFeature) {
    actions.push(
      {
        id: "feature",
        label: "Set Featured",
        variant: "success",
        confirm: false,
      },
      {
        id: "unfeature",
        label: "Remove Featured",
        variant: "default",
        confirm: false,
      },
    );
  }

  if (options?.hasVerify) {
    actions.push(
      {
        id: "verify",
        label: "Verify",
        variant: "success",
        confirm: false,
      },
      {
        id: "unverify",
        label: "Remove Verification",
        variant: "default",
        confirm: false,
      },
    );
  }

  if (options?.hasArchive) {
    actions.push({
      id: "archive",
      label: "Archive",
      variant: "default",
      confirm: false,
    });
  }

  actions.push({
    id: "delete",
    label: "Delete",
    variant: "danger",
    confirm: true,
    confirmTitle: `Delete ${resourceName}`,
    confirmMessage: `Are you sure you want to delete ${selectedCount} ${resourceName.toLowerCase()}${
      selectedCount === 1 ? "" : "s"
    }? This action cannot be undone.`,
  });

  return actions;
}
