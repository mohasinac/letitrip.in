import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, ApiResponse } from "@/lib/auth/middleware";
import { db } from "@/lib/firebase/config";
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const user = await authenticateUser(request);
    if (!user) {
      return ApiResponse.unauthorized("Authentication required");
    }

    const { id: auctionId } = await params;
    const userId = user.userId;

    // Check if already in watchlist
    const watchlistQuery = query(
      collection(db, "watchlist"),
      where("userId", "==", userId),
      where("auctionId", "==", auctionId)
    );

    const existingWatchlist = await getDocs(watchlistQuery);

    if (!existingWatchlist.empty) {
      return NextResponse.json(
        { error: "Already in watchlist" },
        { status: 400 }
      );
    }

    // Add to watchlist in Firestore
    const watchlistData = {
      userId,
      auctionId,
      addedAt: new Date()
    };

    const docRef = await addDoc(collection(db, "watchlist"), watchlistData);

    const watchlistItem = {
      id: docRef.id,
      ...watchlistData,
      addedAt: watchlistData.addedAt.toISOString()
    };

    return NextResponse.json({
      success: true,
      message: "Added to watchlist",
      data: watchlistItem
    });

  } catch (error) {
    console.error("Add to watchlist error:", error);
    return NextResponse.json(
      { error: "Failed to add to watchlist" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const user = await authenticateUser(request);
    if (!user) {
      return ApiResponse.unauthorized("Authentication required");
    }

    const { id: auctionId } = await params;
    const userId = user.userId;

    // Find existing watchlist item
    const watchlistQuery = query(
      collection(db, "watchlist"),
      where("userId", "==", userId),
      where("auctionId", "==", auctionId)
    );

    const existingWatchlist = await getDocs(watchlistQuery);

    if (existingWatchlist.empty) {
      return NextResponse.json(
        { error: "Not in watchlist" },
        { status: 400 }
      );
    }

    // Remove from watchlist in Firestore
    const watchlistDoc = existingWatchlist.docs[0];
    await deleteDoc(watchlistDoc.ref);

    return NextResponse.json({
      success: true,
      message: "Removed from watchlist"
    });

  } catch (error) {
    console.error("Remove from watchlist error:", error);
    return NextResponse.json(
      { error: "Failed to remove from watchlist" },
      { status: 500 }
    );
  }
}
