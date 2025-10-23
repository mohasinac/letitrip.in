import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, ApiResponse, validateBody } from "@/lib/auth/middleware";
import { addressSchema } from "@/lib/validations/schemas";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const user = await authenticateUser(request);
    if (!user) {
      return ApiResponse.unauthorized("Authentication required");
    }

    const addressId = params.id;
    const userId = user.userId;

    // Mock address data - replace with database query
    const address = {
      id: addressId,
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
    };

    // Check if address belongs to user
    if (address.userId !== userId) {
      return NextResponse.json(
        { error: "Address not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: address
    });

  } catch (error) {
    console.error("Get address error:", error);
    return NextResponse.json(
      { error: "Failed to get address" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const user = await authenticateUser(request);
    if (!user) {
      return ApiResponse.unauthorized("Authentication required");
    }

    // Validate request body
    const validation = await validateBody(request, addressSchema.partial());
    if (validation.error) {
      return validation.error;
    }

    const addressId = params.id;
    const userId = user.userId;
    const updateData = validation.data;

    // Mock address check - replace with database query
    const existingAddress = {
      id: addressId,
      userId,
      exists: true
    };

    if (!existingAddress.exists || existingAddress.userId !== userId) {
      return NextResponse.json(
        { error: "Address not found" },
        { status: 404 }
      );
    }

    // If this is set as default, unset other defaults - replace with database logic
    if (updateData.isDefault) {
      // Mock: Update other addresses to set isDefault = false
    }

    // Update address - replace with database update
    const updatedAddress = {
      id: addressId,
      userId,
      name: updateData.name || "John Doe",
      phone: updateData.phone || "+91 9876543210",
      addressLine1: updateData.addressLine1 || "123 Main Street",
      addressLine2: updateData.addressLine2 || "",
      city: updateData.city || "Noida",
      state: updateData.state || "Uttar Pradesh",
      pincode: updateData.pincode || "201301",
      country: updateData.country || "India",
      isDefault: updateData.isDefault || false,
      createdAt: "2023-01-15T00:00:00Z",
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      message: "Address updated successfully",
      data: updatedAddress
    });

  } catch (error) {
    console.error("Update address error:", error);
    return NextResponse.json(
      { error: "Failed to update address" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const user = await authenticateUser(request);
    if (!user) {
      return ApiResponse.unauthorized("Authentication required");
    }

    const addressId = params.id;
    const userId = user.userId;

    // Mock address check - replace with database query
    const existingAddress = {
      id: addressId,
      userId,
      exists: true,
      isDefault: false
    };

    if (!existingAddress.exists || existingAddress.userId !== userId) {
      return NextResponse.json(
        { error: "Address not found" },
        { status: 404 }
      );
    }

    // Prevent deletion of default address if it's the only one
    if (existingAddress.isDefault) {
      return NextResponse.json(
        { error: "Cannot delete default address. Please set another address as default first." },
        { status: 400 }
      );
    }

    // Delete address - replace with database delete
    // Mock deletion operation

    return NextResponse.json({
      success: true,
      message: "Address deleted successfully"
    });

  } catch (error) {
    console.error("Delete address error:", error);
    return NextResponse.json(
      { error: "Failed to delete address" },
      { status: 500 }
    );
  }
}
