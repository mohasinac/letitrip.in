import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { getCurrentUser } from '@/lib/auth/jwt';

export async function GET(request: NextRequest) {
  try {
    // Get the current user from the token
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is a seller or admin
    if (currentUser.role !== 'seller' && currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied. Seller role required.' },
        { status: 403 }
      );
    }

    const db = getAdminDb();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const sellerId = currentUser.userId;

    // Get notifications for the seller
    const notificationsSnapshot = await db.collection('notifications')
      .where('userId', '==', sellerId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    const notifications = notificationsSnapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        id: doc.id,
        type: data.type || 'info',
        title: data.title || 'Notification',
        message: data.message || '',
        timestamp: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        read: data.read || false,
        actionRequired: data.actionRequired || false,
        action: data.action || null,
      };
    });

    // If no notifications found, return some default ones for new sellers
    if (notifications.length === 0) {
      const defaultNotifications = [
        {
          id: 'welcome',
          type: 'success',
          title: 'Welcome to Seller Dashboard!',
          message: 'Your seller account has been activated. Start adding products to your store.',
          timestamp: new Date().toISOString(),
          read: false,
          actionRequired: true,
          action: {
            label: 'Add Products',
            href: '/seller/products'
          }
        },
        {
          id: 'setup-store',
          type: 'info',
          title: 'Complete Your Store Setup',
          message: 'Add store information, payment details, and shipping settings to start selling.',
          timestamp: new Date(Date.now() - 60000).toISOString(), // 1 minute ago
          read: false,
          actionRequired: true,
          action: {
            label: 'Setup Store',
            href: '/seller/settings'
          }
        },
        {
          id: 'verification',
          type: 'warning',
          title: 'Account Verification Pending',
          message: 'Please verify your business documents to unlock all selling features.',
          timestamp: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
          read: false,
          actionRequired: true,
          action: {
            label: 'Verify Account',
            href: '/seller/verification'
          }
        }
      ];

      return NextResponse.json(defaultNotifications);
    }

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error fetching seller notifications:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch notifications',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

// Mark notification as read
export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (currentUser.role !== 'seller' && currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied. Seller role required.' },
        { status: 403 }
      );
    }

    const { notificationId, read } = await request.json();
    
    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    
    // Update notification read status
    await db.collection('notifications').doc(notificationId).update({
      read: read || true,
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    );
  }
}
