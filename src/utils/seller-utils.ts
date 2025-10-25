/**
 * Utility functions for seller information display
 */

export interface SellerDisplayInfo {
  id: string;
  name?: string;
  storeName?: string;
  businessName?: string;
  storeStatus?: 'live' | 'maintenance' | 'offline';
  isVerified?: boolean;
}

/**
 * Get the display name for a seller (prioritizes storeName, then businessName, then name)
 */
export function getSellerDisplayName(seller: SellerDisplayInfo): string {
  return seller.storeName || seller.businessName || seller.name || 'Unknown Seller';
}

/**
 * Get seller badge color based on store status
 */
export function getSellerStatusColor(status?: string): string {
  switch (status) {
    case 'live':
      return 'bg-green-100 text-green-800';
    case 'maintenance':
      return 'bg-yellow-100 text-yellow-800';
    case 'offline':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Check if seller store is operational
 */
export function isStoreOperational(status?: string): boolean {
  return status === 'live';
}

/**
 * Format seller information for product listings
 */
export function formatSellerForProduct(seller: SellerDisplayInfo): {
  displayName: string;
  statusColor: string;
  isOperational: boolean;
} {
  return {
    displayName: getSellerDisplayName(seller),
    statusColor: getSellerStatusColor(seller.storeStatus),
    isOperational: isStoreOperational(seller.storeStatus)
  };
}
