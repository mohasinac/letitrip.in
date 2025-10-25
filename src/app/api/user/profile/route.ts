import { NextRequest, NextResponse } from "next/server";
import { validateRequestBody } from "@/lib/api/middleware";
import { updateProfileSchema } from "@/lib/validations/schemas";
import { AuthService } from "@/lib/api/services/auth.service";
import { createUserHandler } from "@/lib/auth/api-middleware";

export const GET = createUserHandler(async (request: NextRequest, user) => {
  try {
    const userId = user.userId;

    // Get user profile from database
    const userProfile = await AuthService.getUserById(userId);
    if (!userProfile) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Add additional profile data (mock for now)
    const enhancedProfile = {
      ...userProfile,
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
      }
    };

    return NextResponse.json({
      success: true,
      data: enhancedProfile
    });

  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { error: "Failed to get profile" },
      { status: 500 }
    );
  }
});

export const PUT = createUserHandler(async (request: NextRequest, user) => {
  try {
    // Validate request body
    const updateData = await validateRequestBody(request, updateProfileSchema);
    const userId = user.userId;

    // Update profile in database
    const updatedProfile = await AuthService.updateProfile(userId, updateData);

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      data: updatedProfile
    });

  } catch (error: any) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
});
