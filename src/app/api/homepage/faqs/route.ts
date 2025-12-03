import { NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";

export async function GET() {
  try {
    const db = getFirestoreAdmin();

    // Get all active FAQs
    const faqsSnapshot = await db
      .collection(COLLECTIONS.FAQS)
      .where("is_active", "==", true)
      .orderBy("order", "asc")
      .get();

    const faqs = faqsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        question: data.question,
        answer: data.answer,
        category: data.category,
        order: data.order || 0,
      };
    });

    return NextResponse.json({ data: faqs });
  } catch (error) {
    console.error("FAQs error:", error);
    return NextResponse.json(
      { data: [], error: "Failed to fetch FAQs" },
      { status: 500 },
    );
  }
}
