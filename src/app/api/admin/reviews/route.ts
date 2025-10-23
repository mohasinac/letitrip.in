import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/jwt";

// Mock reviews data
const mockReviews = [
  {
    id: "1",
    productId: "beyblade-1",
    productName: "Dragon Storm Beyblade",
    userId: "user-1",
    userName: "John Doe",
    userEmail: "john@example.com",
    rating: 5,
    title: "Amazing Beyblade!",
    comment: "This Beyblade is incredible. My son loves it and it performs great in battles.",
    status: "pending",
    createdAt: "2024-01-25T10:30:00Z",
    images: [],
  },
  {
    id: "2", 
    productId: "beyblade-2",
    productName: "Lightning L-Drago",
    userId: "user-2",
    userName: "Sarah Wilson",
    userEmail: "sarah@example.com",
    rating: 4,
    title: "Good quality",
    comment: "Well made beyblade with good spinning power. Would recommend.",
    status: "approved",
    createdAt: "2024-01-24T16:15:00Z",
    images: [],
  },
  {
    id: "3",
    productId: "stadium-1", 
    productName: "Thunder Dome Stadium",
    userId: "user-3",
    userName: "Mike Johnson",
    userEmail: "mike@example.com",
    rating: 2,
    title: "Disappointing quality",
    comment: "The stadium arrived damaged and the quality is not as expected.",
    status: "pending",
    createdAt: "2024-01-23T12:10:00Z",
    images: [],
  },
];

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // In production, fetch reviews from database
    return NextResponse.json(mockReviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
