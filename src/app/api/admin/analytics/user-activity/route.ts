import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/database/admin';
import { Timestamp } from 'firebase-admin/firestore';

interface UserActivityData {
  labels: string[];
  newUsers: number[];
  activeUsers: number[];
}

export async function GET(request: NextRequest) {
  try {
    const db = getAdminDb();
    const now = new Date();
    const startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Last 30 days

    // Get new users in the last 30 days
    const newUsersSnapshot = await db.collection('users')
      .where('createdAt', '>=', Timestamp.fromDate(startDate))
      .orderBy('createdAt', 'asc')
      .get();

    // Get orders (for active users) in the last 30 days
    const ordersSnapshot = await db.collection('orders')
      .where('createdAt', '>=', Timestamp.fromDate(startDate))
      .orderBy('createdAt', 'asc')
      .get();

    // Group data by date
    const newUsersMap = new Map<string, number>();
    const activeUsersMap = new Map<string, Set<string>>();

    // Process new users
    newUsersSnapshot.forEach((doc: any) => {
      const user = doc.data();
      const userDate = user.createdAt.toDate();
      const dateKey = userDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      newUsersMap.set(dateKey, (newUsersMap.get(dateKey) || 0) + 1);
    });

    // Process active users (users who placed orders)
    ordersSnapshot.forEach((doc: any) => {
      const order = doc.data();
      const orderDate = order.createdAt.toDate();
      const dateKey = orderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      if (!activeUsersMap.has(dateKey)) {
        activeUsersMap.set(dateKey, new Set());
      }
      activeUsersMap.get(dateKey)!.add(order.userId);
    });

    // Generate arrays for the last 30 days
    const labels: string[] = [];
    const newUsers: number[] = [];
    const activeUsers: number[] = [];

    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      labels.push(dateKey);
      newUsers.push(newUsersMap.get(dateKey) || 0);
      activeUsers.push(activeUsersMap.get(dateKey)?.size || 0);
    }

    const activityData: UserActivityData = {
      labels,
      newUsers,
      activeUsers,
    };

    return NextResponse.json(activityData);
  } catch (error) {
    console.error('Error fetching user activity analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user activity analytics' },
      { status: 500 }
    );
  }
}
