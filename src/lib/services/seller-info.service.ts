import { getAdminDb } from '@/lib/database/admin';

export interface SellerInfo {
  id: string;
  name: string;
  storeName?: string;
  storeStatus: 'live' | 'maintenance' | 'offline';
  businessName?: string;
  email?: string;
  isVerified?: boolean;
}

export class SellerInfoService {
  /**
   * Get seller information by ID
   */
  static async getSellerInfo(sellerId: string): Promise<SellerInfo | null> {
    try {
      const db = getAdminDb();
      
      // Get user info
      const userDoc = await db.collection('users').doc(sellerId).get();
      if (!userDoc.exists) {
        return null;
      }
      
      const userData = userDoc.data();
      
      // Get seller profile info (for store settings)
      const sellerDoc = await db.collection('sellers').doc(sellerId).get();
      const sellerData = sellerDoc.exists ? sellerDoc.data() : {};
      
      return {
        id: sellerId,
        name: userData?.name || userData?.displayName || 'Unknown Seller',
        storeName: sellerData?.storeName,
        storeStatus: sellerData?.storeStatus || 'live',
        businessName: sellerData?.businessName,
        email: userData?.email,
        isVerified: sellerData?.isVerified || false
      };
    } catch (error) {
      console.error('Error fetching seller info:', error);
      return null;
    }
  }

  /**
   * Get display name for seller (prioritizes storeName, then businessName, then name)
   */
  static getDisplayName(sellerInfo: SellerInfo): string {
    return sellerInfo.storeName || sellerInfo.businessName || sellerInfo.name;
  }
}
