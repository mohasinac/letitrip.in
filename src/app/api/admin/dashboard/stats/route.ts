import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  revenueChange: number;
  ordersChange: number;
  customersChange: number;
  aovChange: number;
}

export async function GET(request: NextRequest) {
  try {
    const db = getAdminDb();
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get current month stats
    const currentMonthOrdersSnapshot = await db.collection('orders')
      .where('createdAt', '>=', Timestamp.fromDate(thisMonth))
      .where('status', 'in', ['confirmed', 'processing', 'shipped', 'delivered'])
      .get();
    
    // Get last month stats for comparison
    const lastMonthOrdersSnapshot = await db.collection('orders')
      .where('createdAt', '>=', Timestamp.fromDate(lastMonth))
      .where('createdAt', '<=', Timestamp.fromDate(lastMonthEnd))
      .where('status', 'in', ['confirmed', 'processing', 'shipped', 'delivered'])
      .get();

    // Calculate current month metrics
    let currentRevenue = 0;
    let currentOrders = currentMonthOrdersSnapshot.size;
    
    currentMonthOrdersSnapshot.forEach((doc: any) => {
      const order = doc.data();
      currentRevenue += order.total || 0;
    });

    // Calculate last month metrics
    let lastRevenue = 0;
    let lastOrders = lastMonthOrdersSnapshot.size;
    
    lastMonthOrdersSnapshot.forEach((doc: any) => {
      const order = doc.data();
      lastRevenue += order.total || 0;
    });

    // Get total customers
    const usersSnapshot = await db.collection('users').get();
    const totalCustomers = usersSnapshot.size;

    // Get last month customers for comparison
    const lastMonthUsersSnapshot = await db.collection('users')
      .where('createdAt', '<=', Timestamp.fromDate(lastMonthEnd))
      .get();
    const lastMonthCustomers = lastMonthUsersSnapshot.size;

    // Calculate metrics
    const currentAOV = currentOrders > 0 ? currentRevenue / currentOrders : 0;
    const lastAOV = lastOrders > 0 ? lastRevenue / lastOrders : 0;

    // Calculate percentage changes
    const revenueChange = lastRevenue > 0 ? ((currentRevenue - lastRevenue) / lastRevenue) * 100 : 0;
    const ordersChange = lastOrders > 0 ? ((currentOrders - lastOrders) / lastOrders) * 100 : 0;
    const customersChange = lastMonthCustomers > 0 ? ((totalCustomers - lastMonthCustomers) / lastMonthCustomers) * 100 : 0;
    const aovChange = lastAOV > 0 ? ((currentAOV - lastAOV) / lastAOV) * 100 : 0;

    const stats: DashboardStats = {
      totalRevenue: currentRevenue,
      totalOrders: currentOrders,
      totalCustomers,
      averageOrderValue: currentAOV,
      revenueChange: Math.round(revenueChange * 10) / 10,
      ordersChange: Math.round(ordersChange * 10) / 10,
      customersChange: Math.round(customersChange * 10) / 10,
      aovChange: Math.round(aovChange * 10) / 10,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
