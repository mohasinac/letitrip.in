import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/jwt";

// Mock analytics data
const mockAnalytics = {
  totalUsers: 1250,
  totalOrders: 890,
  totalRevenue: 45890.50,
  totalReviews: 432,
  totalPageViews: 15678,
  conversionRate: 3.2,
  userGrowth: {
    period: "last 30 days",
    growth: 15.2,
  },
  revenueGrowth: {
    period: "last 30 days", 
    growth: 22.5,
  },
  topProducts: [
    {
      id: "1",
      name: "Dragon Storm Beyblade Burst Pro",
      sales: 145,
      revenue: 4350.55,
    },
    {
      id: "2", 
      name: "Lightning L-Drago Metal Fight",
      sales: 98,
      revenue: 2450.02,
    },
    {
      id: "3",
      name: "Thunder Dome Stadium",
      sales: 67,
      revenue: 3349.33,
    },
  ],
  trafficSources: [
    {
      source: "Direct",
      visitors: 4500,
      percentage: 45,
    },
    {
      source: "Google Search",
      visitors: 3200,
      percentage: 32,
    },
    {
      source: "Social Media",
      visitors: 1800,
      percentage: 18,
    },
    {
      source: "Email",
      visitors: 500,
      percentage: 5,
    },
  ],
  monthlyData: [
    { month: "Jan", orders: 120, revenue: 6500, users: 180 },
    { month: "Feb", orders: 135, revenue: 7200, users: 195 },
    { month: "Mar", orders: 158, revenue: 8900, users: 210 },
    { month: "Apr", orders: 142, revenue: 7800, users: 203 },
    { month: "May", orders: 167, revenue: 9100, users: 225 },
    { month: "Jun", orders: 189, revenue: 10200, users: 248 },
  ],
};

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "30d";

    // In production, fetch analytics data based on range from database
    return NextResponse.json(mockAnalytics);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
