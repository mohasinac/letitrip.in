import { NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";

export async function GET() {
  try {
    const db = getFirestoreAdmin();

    // Get all unique demo sessions
    const categoriesSnapshot = await db
      .collection("categories")
      .where("demoSession", "!=", null)
      .select("demoSession", "createdAt")
      .get();

    const sessionsMap = new Map<string, Date>();

    categoriesSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.demoSession && !sessionsMap.has(data.demoSession)) {
        sessionsMap.set(
          data.demoSession,
          data.createdAt?.toDate() || new Date()
        );
      }
    });

    const sessions = Array.from(sessionsMap.entries()).map(
      ([sessionId, createdAt]) => ({
        sessionId,
        createdAt: createdAt.toISOString(),
      })
    );

    // Sort by newest first
    sessions.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({ sessions });
  } catch (error: any) {
    console.error("Sessions fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
