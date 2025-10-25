import { getAdminDb } from '@/lib/database/admin';

interface CreateNotificationData {
  userId: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  actionRequired?: boolean;
  action?: {
    label: string;
    href: string;
  };
}

/**
 * Create a notification for a user
 */
export async function createNotification(data: CreateNotificationData) {
  try {
    const db = getAdminDb();
    
    const notification = {
      ...data,
      read: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await db.collection('notifications').add(notification);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { success: false, error };
  }
}

/**
 * Create bulk notifications for multiple users
 */
export async function createBulkNotifications(
  userIds: string[],
  notificationData: Omit<CreateNotificationData, 'userId'>
) {
  try {
    const db = getAdminDb();
    const batch = db.batch();

    userIds.forEach((userId) => {
      const notificationRef = db.collection('notifications').doc();
      const notification = {
        ...notificationData,
        userId,
        read: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      batch.set(notificationRef, notification);
    });

    await batch.commit();
    return { success: true, count: userIds.length };
  } catch (error) {
    console.error('Error creating bulk notifications:', error);
    return { success: false, error };
  }
}

/**
 * Create notification for store status changes
 */
export async function createStoreStatusNotification(
  sellerId: string,
  storeStatus: 'live' | 'maintenance' | 'offline',
  storeName?: string
) {
  const statusMessages = {
    live: {
      type: 'success' as const,
      title: 'Store is Now Live!',
      message: `Your store${storeName ? ` "${storeName}"` : ''} is now live and customers can place orders.`,
    },
    maintenance: {
      type: 'warning' as const,
      title: 'Store Under Maintenance',
      message: `Your store${storeName ? ` "${storeName}"` : ''} has been set to maintenance mode. Customers cannot place new orders.`,
      actionRequired: true,
      action: {
        label: 'Manage Store',
        href: '/seller/settings'
      }
    },
    offline: {
      type: 'error' as const,
      title: 'Store Taken Offline',
      message: `Your store${storeName ? ` "${storeName}"` : ''} has been taken offline. Contact support if this was not expected.`,
      actionRequired: true,
      action: {
        label: 'Contact Support',
        href: '/contact'
      }
    }
  };

  const notificationData = statusMessages[storeStatus];
  
  return createNotification({
    userId: sellerId,
    ...notificationData,
  });
}

/**
 * Create notification for order updates
 */
export async function createOrderNotification(
  sellerId: string,
  orderNumber: string,
  status: string,
  customerName?: string
) {
  const statusMessages = {
    confirmed: {
      type: 'info' as const,
      title: 'New Order Received',
      message: `New order ${orderNumber}${customerName ? ` from ${customerName}` : ''} needs to be processed.`,
      actionRequired: true,
      action: {
        label: 'View Order',
        href: `/seller/orders/${orderNumber}`
      }
    },
    cancelled: {
      type: 'warning' as const,
      title: 'Order Cancelled',
      message: `Order ${orderNumber} has been cancelled by the customer.`,
      action: {
        label: 'View Details',
        href: `/seller/orders/${orderNumber}`
      }
    }
  };

  const notificationData = statusMessages[status as keyof typeof statusMessages];
  
  if (notificationData) {
    return createNotification({
      userId: sellerId,
      ...notificationData,
    });
  }

  return { success: false, error: 'Unsupported order status' };
}
