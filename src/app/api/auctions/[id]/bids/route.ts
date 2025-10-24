import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, ApiResponse } from "@/lib/auth/middleware";
import { db } from "@/lib/firebase/config";
import { doc, getDoc, addDoc, collection, updateDoc, query, where, getDocs, orderBy } from "firebase/firestore";

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
    const { amount } = await request.json();

    // Validate bid amount
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid bid amount" },
        { status: 400 }
      );
    }

    const userId = user.userId;

    // Fetch auction from Firestore
    const auctionDoc = await getDoc(doc(db, "auctions", auctionId));
    
    if (!auctionDoc.exists()) {
      return NextResponse.json(
        { error: "Auction not found" },
        { status: 404 }
      );
    }

    const auction = auctionDoc.data();

    // Check if auction exists and is active
    if (auction.status !== "live") {
      return NextResponse.json(
        { error: "Auction is not active" },
        { status: 400 }
      );
    }

    // Check if auction has ended
    const endTime = auction.endTime?.toDate?.() || new Date(auction.endTime);
    if (endTime < new Date()) {
      return NextResponse.json(
        { error: "Auction has ended" },
        { status: 400 }
      );
    }

    // Check if user is not the seller
    if (auction.sellerId === userId) {
      return NextResponse.json(
        { error: "Cannot bid on your own auction" },
        { status: 400 }
      );
    }

    // Check if bid meets minimum requirement
    const minimumBid = auction.minimumBid || auction.currentBid + (auction.incrementAmount || 100);
    if (amount < minimumBid) {
      return NextResponse.json(
        { error: `Bid must be at least ₹${minimumBid}` },
        { status: 400 }
      );
    }

    // Mark previous winning bid as not winning
    const previousWinningBidsQuery = query(
      collection(db, "bids"),
      where("auctionId", "==", auctionId),
      where("isWinning", "==", true)
    );
    
    const previousWinningBids = await getDocs(previousWinningBidsQuery);
    const updatePromises = previousWinningBids.docs.map(bidDoc => 
      updateDoc(bidDoc.ref, { isWinning: false })
    );
    await Promise.all(updatePromises);

    // Create new bid in Firestore
    const newBidData = {
      auctionId,
      userId,
      userName: (user as any).name || "Anonymous User",
      amount,
      timestamp: new Date(),
      isWinning: true
    };

    const bidDocRef = await addDoc(collection(db, "bids"), newBidData);

    // Update auction current bid and bid count
    await updateDoc(doc(db, "auctions", auctionId), {
      currentBid: amount,
      bidCount: (auction.bidCount || 0) + 1,
      minimumBid: amount + (auction.incrementAmount || 100)
    });

    const newBid = {
      id: bidDocRef.id,
      ...newBidData,
      timestamp: newBidData.timestamp.toISOString()
    };

    // Mock notification to previous high bidder
    // In real implementation, send notification/email

    return NextResponse.json({
      success: true,
      message: "Bid placed successfully",
      data: {
        bid: newBid,
        currentBid: amount,
        minimumBid: amount + 100
      }
    });

  } catch (error) {
    console.error("Place bid error:", error);
    return NextResponse.json(
      { error: "Failed to place bid" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: auctionId } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    // Fetch bid history from Firestore
    const bidsQuery = query(
      collection(db, "bids"),
      where("auctionId", "==", auctionId),
      orderBy("timestamp", "desc")
    );

    const bidsSnapshot = await getDocs(bidsQuery);
    const allBids = bidsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate?.()?.toISOString() || doc.data().timestamp
    }));

    // Apply pagination
    const paginatedBids = allBids.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      data: {
        bids: paginatedBids,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(allBids.length / limit),
          totalBids: allBids.length,
          hasMore: offset + limit < allBids.length
        }
      }
    });

  } catch (error) {
    console.error("Get auction bids error:", error);
    return NextResponse.json(
      { error: "Failed to get auction bids" },
      { status: 500 }
    );
  }
}
