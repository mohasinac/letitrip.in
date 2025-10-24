import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth/middleware";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const userId = user.userId;
    const { helpful } = await request.json();

    if (typeof helpful !== 'boolean') {
      return NextResponse.json({ error: 'helpful must be a boolean' }, { status: 400 });
    }

    // Get database
    const { getAdminDb } = await import('@/lib/firebase/admin');
    const db = getAdminDb();

    // Check if review exists
    const reviewDoc = await db.collection('reviews').doc(id).get();
    if (!reviewDoc.exists) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // Create or update helpful vote record
    const voteId = `${id}_${userId}`;
    await db.collection('review_votes').doc(voteId).set({
      reviewId: id,
      userId,
      helpful,
      votedAt: new Date()
    }, { merge: true });

    // Update review helpful count
    const reviewData = reviewDoc.data() as any;
    const currentHelpful = reviewData.helpfulCount || 0;
    
    await db.collection('reviews').doc(id).update({
      helpfulCount: helpful ? currentHelpful + 1 : Math.max(0, currentHelpful - 1)
    });

    return NextResponse.json({ 
      success: true, 
      message: helpful ? "Review marked as helpful" : "Helpful vote removed"
    });
  } catch (error) {
    console.error("Error marking review as helpful:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
