"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

interface Bid {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  timestamp: Date;
  isWinning: boolean;
}

export default function AuctionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [bidAmount, setBidAmount] = useState("");
  const [timeLeft, setTimeLeft] = useState("");
  const [isWatching, setIsWatching] = useState(false);

  // Mock auction data
  const auction = {
    id: params.id,
    title: "Rare Vintage Beyblade Metal Series",
    description: `This is an extremely rare vintage Beyblade from the Metal Fusion series, manufactured in 2010. 
    
    Features:
    • Authentic Takara Tomy product
    • Metal Fusion technology
    • Complete with ripcord launcher
    • Original packaging included
    • Certificate of authenticity
    
    Condition: Mint condition, barely used. No scratches or damage.
    
    This is a collector's dream item and perfect for serious Beyblade enthusiasts. The metal series is known for its superior performance and durability.`,
    images: [
      "/images/auction-1.jpg",
      "/images/auction-2.jpg",
      "/images/auction-3.jpg",
    ],
    currentBid: 2500,
    startingBid: 1000,
    minimumBid: 2600, // currentBid + increment
    endTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    bidCount: 15,
    seller: {
      name: "CollectorPro",
      rating: 4.9,
      totalSales: 156,
    },
    category: "Beyblades",
    condition: "Mint",
    isAuthentic: true,
  };

  const bids: Bid[] = [
    {
      id: "1",
      userId: "user1",
      userName: "BeybladeExpert",
      amount: 2500,
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      isWinning: true,
    },
    {
      id: "2",
      userId: "user2",
      userName: "MetalFusionFan",
      amount: 2400,
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      isWinning: false,
    },
    {
      id: "3",
      userId: "user3",
      userName: "CollectorKing",
      amount: 2300,
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      isWinning: false,
    },
  ];

  // Update countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const diff = auction.endTime.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("Auction Ended");
        clearInterval(timer);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(timer);
  }, [auction.endTime]);

  const handlePlaceBid = () => {
    const amount = parseFloat(bidAmount);
    if (amount >= auction.minimumBid) {
      console.log(`Placing bid of ₹${amount}`);
      // API call to place bid
      setBidAmount("");
    }
  };

  const handleWatchAuction = () => {
    setIsWatching(!isWatching);
    // API call to add/remove from watchlist
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="bg-gray-50 border-b">
          <div className="container py-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-primary">
                Home
              </Link>
              <span>/</span>
              <Link href="/auctions" className="hover:text-primary">
                Auctions
              </Link>
              <span>/</span>
              <span className="text-foreground">{auction.title}</span>
            </div>
          </div>
        </div>

        <div className="container py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Images */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 relative">
                  <img
                    src={auction.images[selectedImage]}
                    alt={auction.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full animate-pulse">
                      🔴 LIVE AUCTION
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {auction.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 ${
                        selectedImage === index
                          ? "border-primary"
                          : "border-transparent"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${auction.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Description</h2>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-line text-muted-foreground">
                    {auction.description}
                  </p>
                </div>

                {/* Item Details */}
                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="card p-4">
                    <div className="text-sm text-muted-foreground mb-1">
                      Category
                    </div>
                    <div className="font-medium">{auction.category}</div>
                  </div>
                  <div className="card p-4">
                    <div className="text-sm text-muted-foreground mb-1">
                      Condition
                    </div>
                    <div className="font-medium">{auction.condition}</div>
                  </div>
                  <div className="card p-4">
                    <div className="text-sm text-muted-foreground mb-1">
                      Starting Bid
                    </div>
                    <div className="font-medium">
                      ₹{auction.startingBid.toLocaleString("en-IN")}
                    </div>
                  </div>
                  <div className="card p-4">
                    <div className="text-sm text-muted-foreground mb-1">
                      Authenticity
                    </div>
                    <div className="font-medium flex items-center">
                      {auction.isAuthentic ? (
                        <>
                          <svg
                            className="w-4 h-4 text-green-500 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Verified
                        </>
                      ) : (
                        "Not Verified"
                      )}
                    </div>
                  </div>
                </div>

                {/* Seller Info */}
                <div className="mt-8">
                  <h3 className="text-xl font-bold mb-4">Seller Information</h3>
                  <div className="card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{auction.seller.name}</h4>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <span className="mr-1">⭐</span>
                            {auction.seller.rating} rating
                          </div>
                          <div>{auction.seller.totalSales} sales</div>
                        </div>
                      </div>
                      <button className="btn btn-outline">View Profile</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bidding Panel */}
            <div className="lg:col-span-1">
              <div className="card p-6 sticky top-20">
                {/* Current Bid */}
                <div className="text-center mb-6">
                  <div className="text-sm text-muted-foreground mb-1">
                    Current Bid
                  </div>
                  <div className="text-4xl font-bold mb-2">
                    ₹{auction.currentBid.toLocaleString("en-IN")}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {auction.bidCount} bids
                  </div>
                </div>

                {/* Time Left */}
                <div className="text-center mb-6 p-4 bg-red-50 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">
                    Time Left
                  </div>
                  <div className="text-2xl font-bold text-red-600">
                    {timeLeft}
                  </div>
                </div>

                {/* Bid Form */}
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Your Bid (Minimum: ₹
                      {auction.minimumBid.toLocaleString("en-IN")})
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                        ₹
                      </span>
                      <input
                        type="number"
                        className="input w-full pl-8"
                        placeholder={auction.minimumBid.toString()}
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        min={auction.minimumBid}
                      />
                    </div>
                  </div>
                  <button
                    onClick={handlePlaceBid}
                    disabled={
                      !bidAmount || parseFloat(bidAmount) < auction.minimumBid
                    }
                    className="w-full btn btn-primary py-3 text-lg disabled:opacity-50"
                  >
                    Place Bid
                  </button>
                </div>

                {/* Quick Bid Buttons */}
                <div className="grid grid-cols-2 gap-2 mb-6">
                  {[100, 250, 500, 1000].map((increment) => (
                    <button
                      key={increment}
                      onClick={() =>
                        setBidAmount(
                          (auction.currentBid + increment).toString()
                        )
                      }
                      className="btn btn-outline text-sm"
                    >
                      +₹{increment}
                    </button>
                  ))}
                </div>

                {/* Watch Button */}
                <button
                  onClick={handleWatchAuction}
                  className={`w-full btn mb-6 ${
                    isWatching ? "btn-secondary" : "btn-outline"
                  }`}
                >
                  {isWatching ? "Watching" : "Watch Auction"}
                </button>

                {/* Bid History */}
                <div>
                  <h3 className="font-semibold mb-4">Bid History</h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {bids.map((bid) => (
                      <div
                        key={bid.id}
                        className={`p-3 rounded-lg border ${
                          bid.isWinning
                            ? "bg-green-50 border-green-200"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-sm">
                              {bid.userName}
                              {bid.isWinning && (
                                <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                  Winning
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {bid.timestamp.toLocaleString()}
                            </div>
                          </div>
                          <div className="font-semibold">
                            ₹{bid.amount.toLocaleString("en-IN")}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Terms */}
                <div className="mt-6 pt-6 border-t text-xs text-muted-foreground">
                  <p>
                    By bidding, you agree to our{" "}
                    <Link
                      href="/terms"
                      className="text-primary hover:underline"
                    >
                      Terms of Service
                    </Link>
                    . All sales are final.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
