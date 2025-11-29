import { NextRequest, NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";
import { faker } from "@faker-js/faker";

const PREFIX = "TEST_";

export async function POST(req: NextRequest) {
  try {
    const { addressesPerUser = 2 } = await req.json();
    const db = getFirestoreAdmin();

    // Get all test users
    const usersSnapshot = await db
      .collection(COLLECTIONS.USERS)
      .where("email", ">=", PREFIX)
      .where("email", "<=", PREFIX + "\uf8ff")
      .get();

    if (usersSnapshot.empty) {
      return NextResponse.json({
        success: false,
        error: "No test users found. Please generate users first.",
      });
    }

    const indianStates = [
      "Andhra Pradesh",
      "Karnataka",
      "Kerala",
      "Tamil Nadu",
      "Telangana",
      "Maharashtra",
      "Gujarat",
      "Rajasthan",
      "Delhi",
      "West Bengal",
      "Uttar Pradesh",
      "Punjab",
      "Haryana",
      "Madhya Pradesh",
    ];

    const addressTypes = [
      "home",
      "work",
      "billing",
      "shipping",
      "office",
      "other",
    ];

    const addresses = [];
    let addressCount = 0;

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const userName = userDoc.data().name || "User";

      // Generate 1-3 addresses per user
      const numAddresses = Math.min(
        addressesPerUser,
        faker.number.int({ min: 1, max: 3 }),
      );

      for (let i = 0; i < numAddresses; i++) {
        const state = faker.helpers.arrayElement(indianStates);
        const addressType = addressTypes[i] || "other";

        const addressData = {
          id: `${PREFIX}address_${Date.now()}_${addressCount + 1}`,
          userId: userId,
          type: addressType,
          isDefault: i === 0, // First address is default

          // Contact information
          fullName: userName.replace(PREFIX, ""),
          phone: `+91${faker.number.int({ min: 6000000000, max: 9999999999 })}`,
          alternatePhone:
            i > 0
              ? `+91${faker.number.int({ min: 6000000000, max: 9999999999 })}`
              : undefined,
          email: userDoc.data().email,

          // Address details
          addressLine1: faker.location.streetAddress(),
          addressLine2:
            Math.random() < 0.5 ? faker.location.secondaryAddress() : undefined,
          landmark: faker.helpers.arrayElement([
            "Near Metro Station",
            "Opposite Bank",
            "Behind Mall",
            "Near Hospital",
            "Main Road",
            "Market Area",
          ]),
          city: faker.location.city(),
          state: state,
          pincode: faker.number.int({ min: 110001, max: 999999 }).toString(),
          country: "India",

          // Additional flags
          isVerified: Math.random() < 0.7, // 70% verified
          isActive: true,

          // Timestamps
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await db.collection(COLLECTIONS.ADDRESSES).add(addressData);
        addresses.push({
          id: addressData.id,
          type: addressData.type,
          city: addressData.city,
          state: addressData.state,
          isDefault: addressData.isDefault,
        });
        addressCount++;
      }
    }

    return NextResponse.json({
      success: true,
      count: addressCount,
      usersProcessed: usersSnapshot.docs.length,
      addresses: addresses,
    });
  } catch (error: any) {
    console.error("Error generating addresses:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate addresses",
      },
      { status: 500 },
    );
  }
}
