import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/database/admin';
import { Timestamp } from 'firebase-admin/firestore';

interface SalesData {
  labels: string[];
  revenue: number[];
  orders: number[];
}

export async function GET(request: NextRequest) {
  try {
    const db = getAdminDb();
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d';

    const now = new Date();
    let startDate: Date;
    let dateFormat: Intl.DateTimeFormatOptions;
    let groupBy: string;

    // Determine date range and grouping based on period
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateFormat = { month: 'short', day: 'numeric' };
        groupBy = 'day';
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        dateFormat = { month: 'short', day: 'numeric' };
        groupBy = 'day';
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        dateFormat = { month: 'short', year: 'numeric' };
        groupBy = 'week';
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateFormat = { month: 'short', day: 'numeric' };
        groupBy = 'day';
    }

    // Get orders within the period
    const ordersSnapshot = await db.collection('orders')
      .where('createdAt', '>=', Timestamp.fromDate(startDate))
      .where('status', 'in', ['confirmed', 'processing', 'shipped', 'delivered'])
      .orderBy('createdAt', 'asc')
      .get();

    // Group data by date
    const dataMap = new Map<string, { revenue: number; orders: number }>();
    
    ordersSnapshot.forEach((doc: any) => {
      const order = doc.data();
      const orderDate = order.createdAt.toDate();
      let dateKey: string;

      if (groupBy === 'day') {
        dateKey = orderDate.toLocaleDateString('en-US', dateFormat);
      } else {
        // Group by week
        const weekStart = new Date(orderDate);
        weekStart.setDate(orderDate.getDate() - orderDate.getDay());
        dateKey = weekStart.toLocaleDateString('en-US', dateFormat);
      }

      if (!dataMap.has(dateKey)) {
        dataMap.set(dateKey, { revenue: 0, orders: 0 });
      }

      const existing = dataMap.get(dateKey)!;
      existing.revenue += order.total || 0;
      existing.orders += 1;
    });

    // Convert to arrays for chart
    const labels: string[] = [];
    const revenue: number[] = [];
    const orders: number[] = [];

    // Generate all date labels for the period
    const currentDate = new Date(startDate);
    while (currentDate <= now) {
      let dateKey: string;
      
      if (groupBy === 'day') {
        dateKey = currentDate.toLocaleDateString('en-US', dateFormat);
        currentDate.setDate(currentDate.getDate() + 1);
      } else {
        // Week grouping
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - currentDate.getDay());
        dateKey = weekStart.toLocaleDateString('en-US', dateFormat);
        currentDate.setDate(currentDate.getDate() + 7);
      }

      labels.push(dateKey);
      const data = dataMap.get(dateKey) || { revenue: 0, orders: 0 };
      revenue.push(data.revenue);
      orders.push(data.orders);
    }

    const salesData: SalesData = {
      labels,
      revenue,
      orders,
    };

    return NextResponse.json(salesData);
  } catch (error) {
    console.error('Error fetching sales analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sales analytics' },
      { status: 500 }
    );
  }
}
