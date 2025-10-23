import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/jwt";

// Mock data - in production, this would come from your database
const mockUsers = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    role: "customer",
    verified: true,
    joinDate: "2024-01-15",
    lastActive: "2 hours ago",
    ordersCount: 5,
    totalSpent: 299.95,
  },
  {
    id: "2",
    name: "Sarah Wilson",
    email: "sarah@example.com",
    role: "seller",
    verified: true,
    joinDate: "2024-01-10",
    lastActive: "1 day ago",
    ordersCount: 12,
    totalSpent: 899.50,
  },
  {
    id: "3",
    name: "Mike Johnson",
    email: "mike@example.com",
    role: "customer",
    verified: false,
    joinDate: "2024-01-20",
    lastActive: "3 days ago",
    ordersCount: 2,
    totalSpent: 89.99,
  },
  {
    id: "4",
    name: "Emily Davis",
    email: "emily@example.com",
    role: "admin",
    verified: true,
    joinDate: "2024-01-01",
    lastActive: "30 minutes ago",
    ordersCount: 8,
    totalSpent: 459.75,
  },
];

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // In production, fetch users from database
    return NextResponse.json(mockUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
