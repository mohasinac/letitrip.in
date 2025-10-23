import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, ApiResponse, validateBody } from "@/lib/auth/middleware";
import { updateProfileSchema } from "@/lib/validations/schemas";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await authenticateUser(request);
    if (!user) {
      return ApiResponse.unauthorized("Authentication required");
    }

    const userId = user.userId;

    // Mock user profile - replace with database query
    const userProfile = {
      id: userId,
      email: user.email,
      name: "John Doe",
      phone: "+91 9876543210",
      dateOfBirth: "1990-05-15",
      gender: "male",
      avatar: "/images/avatar-placeholder.jpg",
      addresses: [
        {
          id: "addr_1",
          type: "home",
          name: "Home Address",
          street: "123 Main Street",
          area: "Sector 18",
          city: "Noida",
          state: "Uttar Pradesh",
          pincode: "201301",
          country: "India",
          isDefault: true
        },
        {
          id: "addr_2",
          type: "work",
          name: "Office Address",
          street: "456 Business Park",
          area: "Cyber City",
          city: "Gurgaon",
          state: "Haryana",
          pincode: "122002",
          country: "India",
          isDefault: false
        }
      ],
      preferences: {
        notifications: {
          email: true,
          sms: false,
          push: true,
          auction_updates: true,
          promotional: false
        },
        privacy: {
          profile_visibility: "public",
          show_bid_history: false,
          show_purchase_history: false
        }
      },
      stats: {
        totalOrders: 12,
        totalSpent: 15670,
        activeBids: 3,
        wonAuctions: 8,
        totalSaved: 2340,
        memberSince: "2023-01-15T00:00:00Z"
      },
      verificationStatus: {
        email: true,
        phone: true,
        identity: false
      },
      createdAt: "2023-01-15T00:00:00Z",
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: userProfile
    });

  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { error: "Failed to get profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const user = await authenticateUser(request);
    if (!user) {
      return ApiResponse.unauthorized("Authentication required");
    }

    // Validate request body
    const validation = await validateBody(request, updateProfileSchema);
    if (validation.error) {
      return validation.error;
    }

    const userId = user.userId;
    const updateData = validation.data;

    // Mock profile update - replace with database update
    const updatedProfile = {
      id: userId,
      name: updateData.name || "John Doe",
      phone: updateData.phone || "+91 9876543210",
      avatar: updateData.avatar || "/images/avatar-placeholder.jpg",
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      data: updatedProfile
    });

  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
