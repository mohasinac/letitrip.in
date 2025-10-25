import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { createSellerHandler } from "@/lib/auth/api-middleware";

export const GET = createSellerHandler(async (request: NextRequest, user) => {
  try {
    if (user.role !== 'seller' && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied. Seller role required.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
    const sellerId = user.userId;

    const db = getAdminDb();
    
    // Get seller notifications
    const notificationsSnapshot = await db.collection('notifications')
      .where('targetAudience', 'in', ['all', 'sellers'])
      .where('isActive', '==', true)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .offset((page - 1) * limit)
      .get();

    const notifications = notificationsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      };
    });

    // Get user's read status for these notifications
    const readStatusPromises = notifications.map(async (notification) => {
      const readDoc = await db.collection('notification_reads')
        .where('userId', '==', sellerId)
        .where('notificationId', '==', notification.id)
        .get();
      
      return {
        ...notification,
        read: !readDoc.empty
      };
    });

    const notificationsWithReadStatus = await Promise.all(readStatusPromises);

    // Get unread count
    const allNotificationsSnapshot = await db.collection('notifications')
      .where('targetAudience', 'in', ['all', 'sellers'])
      .where('isActive', '==', true)
      .get();

    let unreadCount = 0;
    for (const doc of allNotificationsSnapshot.docs) {
      const readDoc = await db.collection('notification_reads')
        .where('userId', '==', sellerId)
        .where('notificationId', '==', doc.id)
        .get();
      
      if (readDoc.empty) {
        unreadCount++;
      }
    }

    return NextResponse.json({
      notifications: notificationsWithReadStatus,
      pagination: {
        page,
        limit,
        total: allNotificationsSnapshot.size,
        totalPages: Math.ceil(allNotificationsSnapshot.size / limit)
      },
      unreadCount
    });

  } catch (error) {
    console.error('Error fetching seller notifications:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch notifications', details: errorMessage },
      { status: 500 }
    );
  }
});

// Mark notification as read
export const PATCH = createSellerHandler(async (request: NextRequest, user) => {
  try {
    const { notificationId, read } = await request.json();
    
    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    const userId = user.userId;

    if (read) {
      // Mark as read by creating a read record
      await db.collection('notification_reads').add({
        userId,
        notificationId,
        readAt: new Date()
      });
    } else {
      // Mark as unread by removing the read record
      const readDocsSnapshot = await db.collection('notification_reads')
        .where('userId', '==', userId)
        .where('notificationId', '==', notificationId)
        .get();

      const deletePromises = readDocsSnapshot.docs.map(doc => doc.ref.delete());
      await Promise.all(deletePromises);
    }

    return NextResponse.json({
      success: true,
      message: `Notification marked as ${read ? 'read' : 'unread'}`
    });

  } catch (error) {
    console.error('Error updating notification read status:', error);
    return NextResponse.json(
      { error: 'Failed to update notification status' },
      { status: 500 }
    );
  }
});
