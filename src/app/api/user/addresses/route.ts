import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, ApiResponse, validateBody } from "@/lib/auth/middleware";
import { addressSchema } from "@/lib/validations/schemas";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await authenticateUser(request);
    if (!user) {
      return ApiResponse.unauthorized("Authentication required");
    }

    const userId = user.userId;

    // Mock user addresses - replace with database query
    const addresses = [
      {
        id: "addr_1",
        userId,
        type: "home",
        name: "John Doe",
        phone: "+91 9876543210",
        addressLine1: "123 Main Street, Apartment 4B",
        addressLine2: "Near City Mall",
        city: "Noida",
        state: "Uttar Pradesh",
        pincode: "201301",
        country: "India",
        isDefault: true,
        createdAt: "2023-01-15T00:00:00Z",
        updatedAt: "2023-01-15T00:00:00Z"
      },
      {
        id: "addr_2",
        userId,
        type: "work",
        name: "John Doe",
        phone: "+91 9876543210",
        addressLine1: "456 Business Park, Tower A, Floor 10",
        addressLine2: "Sector 125",
        city: "Noida",
        state: "Uttar Pradesh",
        pincode: "201303",
        country: "India",
        isDefault: false,
        createdAt: "2023-02-01T00:00:00Z",
        updatedAt: "2023-02-01T00:00:00Z"
      }
    ];

    return NextResponse.json({
      success: true,
      data: addresses
    });

  } catch (error) {
    console.error("Get addresses error:", error);
    return NextResponse.json(
      { error: "Failed to get addresses" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await authenticateUser(request);
    if (!user) {
      return ApiResponse.unauthorized("Authentication required");
    }

    // Validate request body
    const validation = await validateBody(request, addressSchema);
    if (validation.error) {
      return validation.error;
    }

    const userId = user.userId;
    const addressData = validation.data;

    // If this is set as default, unset other defaults - replace with database logic
    if (addressData.isDefault) {
      // Mock: Update other addresses to set isDefault = false
    }

    // Create new address - replace with database insert
    const newAddress = {
      id: `addr_${Date.now()}`,
      userId,
      ...addressData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      message: "Address added successfully",
      data: newAddress
    }, { status: 201 });

  } catch (error) {
    console.error("Add address error:", error);
    return NextResponse.json(
      { error: "Failed to add address" },
      { status: 500 }
    );
  }
}
