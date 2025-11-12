import { NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";

const PREFIX = "TEST_";

export async function GET() {
  try {
    const db = getFirestoreAdmin();
    const debug: any = {
      prefix: PREFIX,
      samples: {},
      counts: {},
      errors: [],
    };

    // Sample users
    try {
      const usersSnapshot = await db
        .collection(COLLECTIONS.USERS)
        .limit(5)
        .get();
      debug.samples.users = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        email: doc.data().email,
        displayName: doc.data().display_name,
      }));
      debug.counts.allUsers = usersSnapshot.size;

      // Count test users
      const testUsersSnapshot = await db
        .collection(COLLECTIONS.USERS)
        .where("email", ">=", PREFIX)
        .where("email", "<", PREFIX + "\uf8ff")
        .limit(5)
        .get();
      debug.samples.testUsers = testUsersSnapshot.docs.map((doc) => ({
        id: doc.id,
        email: doc.data().email,
        displayName: doc.data().display_name,
      }));
      debug.counts.testUsers = testUsersSnapshot.size;
    } catch (error: any) {
      debug.errors.push({ collection: "users", error: error.message });
    }

    // Sample shops
    try {
      const shopsSnapshot = await db
        .collection(COLLECTIONS.SHOPS)
        .limit(5)
        .get();
      debug.samples.shops = shopsSnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        slug: doc.data().slug,
      }));
      debug.counts.allShops = shopsSnapshot.size;

      // Count test shops
      const testShopsSnapshot = await db
        .collection(COLLECTIONS.SHOPS)
        .where("name", ">=", PREFIX)
        .where("name", "<", PREFIX + "\uf8ff")
        .limit(5)
        .get();
      debug.samples.testShops = testShopsSnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        slug: doc.data().slug,
      }));
      debug.counts.testShops = testShopsSnapshot.size;
    } catch (error: any) {
      debug.errors.push({ collection: "shops", error: error.message });
    }

    // Sample products
    try {
      const productsSnapshot = await db
        .collection(COLLECTIONS.PRODUCTS)
        .limit(5)
        .get();
      debug.samples.products = productsSnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        slug: doc.data().slug,
      }));
      debug.counts.allProducts = productsSnapshot.size;

      // Count test products
      const testProductsSnapshot = await db
        .collection(COLLECTIONS.PRODUCTS)
        .where("name", ">=", PREFIX)
        .where("name", "<", PREFIX + "\uf8ff")
        .limit(5)
        .get();
      debug.samples.testProducts = testProductsSnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        slug: doc.data().slug,
      }));
      debug.counts.testProducts = testProductsSnapshot.size;
    } catch (error: any) {
      debug.errors.push({ collection: "products", error: error.message });
    }

    // Sample auctions
    try {
      const auctionsSnapshot = await db
        .collection(COLLECTIONS.AUCTIONS)
        .limit(5)
        .get();
      debug.samples.auctions = auctionsSnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        slug: doc.data().slug,
      }));
      debug.counts.allAuctions = auctionsSnapshot.size;

      // Count test auctions
      const testAuctionsSnapshot = await db
        .collection(COLLECTIONS.AUCTIONS)
        .where("name", ">=", PREFIX)
        .where("name", "<", PREFIX + "\uf8ff")
        .limit(5)
        .get();
      debug.samples.testAuctions = testAuctionsSnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        slug: doc.data().slug,
      }));
      debug.counts.testAuctions = testAuctionsSnapshot.size;
    } catch (error: any) {
      debug.errors.push({ collection: "auctions", error: error.message });
    }

    return NextResponse.json({ success: true, debug });
  } catch (error: any) {
    console.error("Error in debug endpoint:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
