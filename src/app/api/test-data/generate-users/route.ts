import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";
import { logError } from "@/lib/firebase-error-logger";
import { faker } from "@faker-js/faker";
import { NextRequest, NextResponse } from "next/server";

const PREFIX = "TEST_";

export async function POST(req: NextRequest) {
  try {
    const { count = 10 } = await req.json();
    const db = getFirestoreAdmin();
    const users = [];

    for (let i = 0; i < count; i++) {
      const userData = {
        email: `${PREFIX}user${i + 1}_${Date.now()}@example.com`,
        name: `${PREFIX}${faker.person.fullName()}`,
        phone: `+91${faker.number.int({ min: 6000000000, max: 9999999999 })}`,
        role: (() => {
          if (i === 0) return "admin";
          if (i < count * 0.3) return "seller";
          return "user";
        })(),
        is_banned: false,
        email_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        profile: {
          avatar: `https://ui-avatars.com/api/?name=${PREFIX}User${
            i + 1
          }&background=random`,
          bio: faker.lorem.sentence(),
        },
      };

      const docRef = await db.collection(COLLECTIONS.USERS).add(userData);
      users.push({ id: docRef.id, ...userData });
    }

    return NextResponse.json({ success: true, users, count: users.length });
  } catch (error: any) {
    logError(error as Error, {
      component: "API.testData.generateUsers",
      count,
    });
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate users" },
      { status: 500 },
    );
  }
}
