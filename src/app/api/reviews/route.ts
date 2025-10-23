import { NextRequest, NextResponse } from "next/server";

const mockApprovedReviews = [
  {
    id: "1",
    productId: "beyblade-1",
    productName: "Dragon Storm Beyblade",
    productImage: "/images/beyblade-1.jpg",
    userId: "user-1",
    userName: "John Doe",
    rating: 5,
    title: "Amazing Beyblade!",
    comment: "This Beyblade is incredible. My son loves it and it performs great in battles. Highly recommended!",
    createdAt: "2024-01-25",
    verified: true,
    helpful: 12,
    images: [],
  },
  {
    id: "2",
    productId: "beyblade-2", 
    productName: "Lightning L-Drago",
    productImage: "/images/beyblade-2.jpg",
    userId: "user-2",
    userName: "Sarah Wilson",
    rating: 4,
    title: "Good quality Beyblade",
    comment: "Well made beyblade with good spinning power. The metal construction feels premium and durable.",
    createdAt: "2024-01-24",
    verified: true,
    helpful: 8,
    images: [],
  },
  {
    id: "3",
    productId: "stadium-1",
    productName: "Thunder Dome Stadium", 
    productImage: "/images/stadium-1.jpg",
    userId: "user-3",
    userName: "Mike Johnson",
    rating: 5,
    title: "Perfect stadium for battles",
    comment: "This stadium is exactly what we needed. Great size, high walls, and sturdy construction.",
    createdAt: "2024-01-23",
    verified: true,
    helpful: 15,
    images: [],
  },
  {
    id: "4",
    productId: "launcher-1",
    productName: "Power Grip Pro Launcher",
    productImage: "/images/launcher-1.jpg", 
    userId: "user-4",
    userName: "Emily Davis",
    rating: 3,
    title: "Decent launcher",
    comment: "The launcher works fine and gives good power. Could be more comfortable though.",
    createdAt: "2024-01-22",
    verified: true,
    helpful: 4,
    images: [],
  },
  {
    id: "5",
    productId: "beyblade-3",
    productName: "Xcalibur Sword Beyblade X",
    productImage: "/images/beyblade-3.jpg",
    userId: "user-5", 
    userName: "Ryan Martinez",
    rating: 5,
    title: "Next-level Beyblade!",
    comment: "The Beyblade X series is incredible! Amazing attack power and the X-Rail system is revolutionary.",
    createdAt: "2024-01-21",
    verified: true,
    helpful: 9,
    images: [],
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const sort = searchParams.get("sort") || "newest";
    
    let reviews = [...mockApprovedReviews];
    
    // Filter by status (only approved reviews for public API)
    if (status === "approved" || !status) {
      reviews = reviews; // All mock reviews are already approved
    }
    
    // Sort reviews
    switch (sort) {
      case "oldest":
        reviews.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case "highest":
        reviews.sort((a, b) => b.rating - a.rating);
        break;
      case "lowest":
        reviews.sort((a, b) => a.rating - b.rating);
        break;
      case "helpful":
        reviews.sort((a, b) => b.helpful - a.helpful);
        break;
      default: // newest
        reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }
    
    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
