# Auctions Resource - Test Cases

## Unit Tests

### Auction Listing Tests

```typescript
describe("AuctionsService - List", () => {
  describe("list", () => {
    it("should list active auctions", async () => {
      const result = await auctionsService.list({ status: "active" });

      result.data.forEach((auction) => {
        expect(auction.status).toBe("active");
      });
    });

    it("should filter by ending soon", async () => {
      const result = await auctionsService.list({ ending: "today" });

      result.data.forEach((auction) => {
        const endTime = new Date(auction.endTime);
        const today = new Date();
        expect(endTime.toDateString()).toBe(today.toDateString());
      });
    });

    it("should sort by ending time", async () => {
      const result = await auctionsService.list({
        sortBy: "endTime",
        order: "asc",
      });

      for (let i = 1; i < result.data.length; i++) {
        expect(
          new Date(result.data[i].endTime).getTime(),
        ).toBeGreaterThanOrEqual(
          new Date(result.data[i - 1].endTime).getTime(),
        );
      }
    });

    it("should filter by category", async () => {
      const result = await auctionsService.list({ category: "antiques" });

      result.data.forEach((auction) => {
        expect(auction.product.category.slug).toBe("antiques");
      });
    });

    it("should filter by price range", async () => {
      const result = await auctionsService.list({
        minPrice: 10000,
        maxPrice: 50000,
      });

      result.data.forEach((auction) => {
        expect(auction.currentPrice).toBeGreaterThanOrEqual(10000);
        expect(auction.currentPrice).toBeLessThanOrEqual(50000);
      });
    });
  });
});
```

---

### Auction Detail Tests

```typescript
describe("AuctionsService - Detail", () => {
  describe("getById", () => {
    it("should get auction with full details", async () => {
      const auction = await auctionsService.getById("test_auction_001");

      expect(auction.id).toBe("test_auction_001");
      expect(auction.product).toBeDefined();
      expect(auction.shop).toBeDefined();
      expect(auction.pricing).toBeDefined();
      expect(auction.bidding).toBeDefined();
      expect(auction.timing).toBeDefined();
    });

    it("should include user-specific data when authenticated", async () => {
      // With user auth context
      const auction = await auctionsService.getById("test_auction_001");

      expect(auction.bidding.myBid).toBeDefined();
      expect(auction.isWatching).toBeDefined();
    });

    it("should return 404 for non-existent auction", async () => {
      await expect(auctionsService.getById("non_existent")).rejects.toThrow(
        "Auction not found",
      );
    });

    it("should hide reserve price from non-owners", async () => {
      // As regular user
      const auction = await auctionsService.getById("test_auction_001");

      expect(auction.pricing.reservePrice).toBeUndefined();
      expect(auction.pricing.reserveMet).toBeDefined(); // Can see if met
    });
  });

  describe("getBids", () => {
    it("should get bid history", async () => {
      const bids = await auctionsService.getBids("test_auction_001");

      expect(Array.isArray(bids)).toBe(true);
      expect(bids[0].amount).toBeDefined();
      expect(bids[0].bidder).toBeDefined();
    });

    it("should order bids by amount descending", async () => {
      const bids = await auctionsService.getBids("test_auction_001");

      for (let i = 1; i < bids.length; i++) {
        expect(bids[i].amount).toBeLessThanOrEqual(bids[i - 1].amount);
      }
    });

    it("should mask bidder names", async () => {
      const bids = await auctionsService.getBids("test_auction_001");

      bids.forEach((bid) => {
        expect(bid.bidder.name).toMatch(/^.+\*\*\*.+$/);
      });
    });
  });
});
```

---

### Bidding Tests

```typescript
describe("AuctionsService - Bidding", () => {
  beforeEach(() => {
    // Set user auth context
  });

  describe("placeBid", () => {
    it("should place valid bid", async () => {
      const result = await auctionsService.placeBid("test_auction_001", {
        amount: 15000,
      });

      expect(result.bidId).toBeDefined();
      expect(result.isHighestBid).toBe(true);
      expect(result.currentPrice).toBe(15000);
    });

    it("should return next minimum bid", async () => {
      const result = await auctionsService.placeBid("test_auction_001", {
        amount: 15000,
      });

      expect(result.nextMinBid).toBe(15500); // 15000 + 500 increment
    });

    it("should reject bid below minimum", async () => {
      // Current price is 12500, min increment 500
      await expect(
        auctionsService.placeBid("test_auction_001", { amount: 12600 }),
      ).rejects.toThrow("Bid must be at least");
    });

    it("should reject bid on ended auction", async () => {
      await expect(
        auctionsService.placeBid("test_auction_002", { amount: 50000 }),
      ).rejects.toThrow("Auction is not active");
    });

    it("should reject bid on own auction", async () => {
      // As seller owner
      await expect(
        auctionsService.placeBid("test_auction_001", { amount: 20000 }),
      ).rejects.toThrow("Cannot bid on your own auction");
    });

    it("should handle concurrent bid conflict", async () => {
      // Simulate race condition where price changed
      await expect(
        auctionsService.placeBid("test_auction_001", {
          amount: 13000, // Was valid but another bid came in
        }),
      ).rejects.toThrow("You were outbid");
    });
  });

  describe("setAutoBid", () => {
    it("should set auto-bid", async () => {
      const result = await auctionsService.setAutoBid("test_auction_001", {
        maxBid: 25000,
      });

      expect(result.autoBidId).toBeDefined();
      expect(result.maxBid).toBe(25000);
      expect(result.isActive).toBe(true);
    });

    it("should place immediate bid if not winning", async () => {
      // Current highest is by another user
      const result = await auctionsService.setAutoBid("test_auction_001", {
        maxBid: 25000,
      });

      expect(result.currentBid).toBeGreaterThan(12500); // Auto-bid kicked in
    });

    it("should reject max bid lower than current price", async () => {
      await expect(
        auctionsService.setAutoBid("test_auction_001", { maxBid: 10000 }),
      ).rejects.toThrow("Max bid must be higher than current price");
    });

    it("should update existing auto-bid", async () => {
      // User already has auto-bid
      const result = await auctionsService.setAutoBid("test_auction_001", {
        maxBid: 30000,
      });

      expect(result.maxBid).toBe(30000);
    });
  });

  describe("cancelAutoBid", () => {
    it("should cancel auto-bid", async () => {
      await auctionsService.cancelAutoBid("test_auction_001");
      // Verify cancelled
    });

    it("should return 404 if no auto-bid exists", async () => {
      await expect(
        auctionsService.cancelAutoBid("test_auction_003"),
      ).rejects.toThrow("No auto-bid found");
    });
  });
});
```

---

### Watchlist Tests

```typescript
describe("AuctionsService - Watchlist", () => {
  describe("watch", () => {
    it("should add auction to watchlist", async () => {
      await auctionsService.watch("test_auction_001");

      const watchlist = await auctionsService.getWatchlist();
      expect(watchlist.some((a) => a.id === "test_auction_001")).toBe(true);
    });

    it("should not duplicate watchlist entry", async () => {
      await auctionsService.watch("test_auction_001");
      await auctionsService.watch("test_auction_001");

      const watchlist = await auctionsService.getWatchlist();
      const count = watchlist.filter((a) => a.id === "test_auction_001").length;
      expect(count).toBe(1);
    });
  });

  describe("unwatch", () => {
    it("should remove from watchlist", async () => {
      await auctionsService.unwatch("test_auction_001");

      const watchlist = await auctionsService.getWatchlist();
      expect(watchlist.some((a) => a.id === "test_auction_001")).toBe(false);
    });
  });

  describe("getWatchlist", () => {
    it("should return user watchlist", async () => {
      const watchlist = await auctionsService.getWatchlist();

      expect(Array.isArray(watchlist)).toBe(true);
      watchlist.forEach((auction) => {
        expect(auction.id).toBeDefined();
        expect(auction.title).toBeDefined();
        expect(auction.addedAt).toBeDefined();
      });
    });
  });
});
```

---

### User Bids Tests

```typescript
describe("AuctionsService - My Bids", () => {
  describe("getMyBids", () => {
    it("should return user bid history", async () => {
      const result = await auctionsService.getMyBids({});

      expect(Array.isArray(result.data)).toBe(true);
      result.data.forEach((item) => {
        expect(item.auction).toBeDefined();
        expect(item.myBid).toBeDefined();
      });
    });

    it("should filter winning bids", async () => {
      const result = await auctionsService.getMyBids({ status: "winning" });

      result.data.forEach((item) => {
        expect(item.myBid.isHighest).toBe(true);
      });
    });

    it("should filter outbid items", async () => {
      const result = await auctionsService.getMyBids({ status: "outbid" });

      result.data.forEach((item) => {
        expect(item.myBid.isHighest).toBe(false);
      });
    });
  });

  describe("getWonAuctions", () => {
    it("should return won auctions", async () => {
      const result = await auctionsService.getWonAuctions();

      result.forEach((item) => {
        expect(item.auction.status).toBe("ended");
        expect(item.winningBid).toBeDefined();
      });
    });
  });
});
```

---

### Seller Auction Tests

```typescript
describe("AuctionsService - Seller", () => {
  beforeEach(() => {
    // Set seller auth context
  });

  describe("listSeller", () => {
    it("should list seller auctions", async () => {
      const result = await auctionsService.listSeller({});

      result.data.forEach((auction) => {
        expect(auction.shopId).toBe("test_shop_001");
      });
    });
  });

  describe("create", () => {
    it("should create auction with valid data", async () => {
      const auctionData = {
        title: "New Auction",
        slug: "new-auction",
        description: "Test auction",
        productId: "test_product_001",
        startingPrice: 5000,
        minBidIncrement: 500,
        startTime: new Date(Date.now() + 86400000).toISOString(),
        endTime: new Date(Date.now() + 86400000 * 7).toISOString(),
      };

      const result = await auctionsService.create(auctionData);

      expect(result.id).toBeDefined();
      expect(result.status).toBe("scheduled");
    });

    it("should reject auction with past start time", async () => {
      const auctionData = {
        title: "Past Auction",
        slug: "past-auction",
        productId: "test_product_001",
        startingPrice: 5000,
        startTime: new Date(Date.now() - 86400000).toISOString(),
        endTime: new Date(Date.now() + 86400000).toISOString(),
      };

      await expect(auctionsService.create(auctionData)).rejects.toThrow(
        "Start time must be in the future",
      );
    });

    it("should reject auction for product already in auction", async () => {
      const auctionData = {
        title: "Duplicate Product",
        slug: "duplicate-product",
        productId: "test_auction_product_001", // Already in auction
        startingPrice: 5000,
        startTime: new Date(Date.now() + 86400000).toISOString(),
        endTime: new Date(Date.now() + 86400000 * 7).toISOString(),
      };

      await expect(auctionsService.create(auctionData)).rejects.toThrow(
        "Product already in active auction",
      );
    });

    it("should reject if reserve price < starting price", async () => {
      const auctionData = {
        title: "Invalid Reserve",
        slug: "invalid-reserve",
        productId: "test_product_002",
        startingPrice: 10000,
        reservePrice: 5000, // Less than starting
        startTime: new Date(Date.now() + 86400000).toISOString(),
        endTime: new Date(Date.now() + 86400000 * 7).toISOString(),
      };

      await expect(auctionsService.create(auctionData)).rejects.toThrow(
        "Reserve price must be >= starting price",
      );
    });
  });

  describe("update", () => {
    it("should update scheduled auction", async () => {
      const result = await auctionsService.update("test_auction_003", {
        reservePrice: 25000,
      });

      expect(result.reservePrice).toBe(25000);
    });

    it("should reject update of active auction critical fields", async () => {
      await expect(
        auctionsService.update("test_auction_001", {
          startingPrice: 10000, // Cannot change once active
        }),
      ).rejects.toThrow("Cannot update starting price");
    });

    it("should allow description update on active auction", async () => {
      const result = await auctionsService.update("test_auction_001", {
        description: "Updated description",
      });

      expect(result.description).toBe("Updated description");
    });
  });

  describe("cancel", () => {
    it("should cancel auction with no bids", async () => {
      await auctionsService.cancel("test_auction_003");
      // Verify cancelled
    });

    it("should reject cancel of auction with bids", async () => {
      await expect(auctionsService.cancel("test_auction_001")).rejects.toThrow(
        "Cannot cancel auction with bids",
      );
    });
  });
});
```

---

## Integration Tests

### Auction Lifecycle

```typescript
describe("Auction Lifecycle", () => {
  it("should complete auction lifecycle", async () => {
    // 1. Create auction (as seller)
    const auction = await auctionsService.create({
      title: "Lifecycle Test",
      slug: "lifecycle-test",
      productId: "test_product_lifecycle",
      startingPrice: 5000,
      minBidIncrement: 500,
      startTime: new Date(Date.now() + 1000).toISOString(), // Starts in 1 second
      endTime: new Date(Date.now() + 60000).toISOString(), // Ends in 1 minute
    });

    expect(auction.status).toBe("scheduled");

    // 2. Wait for auction to start
    await new Promise((r) => setTimeout(r, 2000));

    // 3. Place bid (as user)
    const bid1 = await auctionsService.placeBid(auction.id, { amount: 5500 });
    expect(bid1.isHighestBid).toBe(true);

    // 4. Place competing bid (as another user)
    const bid2 = await auctionsService.placeBid(auction.id, { amount: 6000 });
    expect(bid2.isHighestBid).toBe(true);

    // 5. Set auto-bid (as first user)
    await auctionsService.setAutoBid(auction.id, { maxBid: 10000 });

    // 6. Wait for auction to end
    await new Promise((r) => setTimeout(r, 60000));

    // 7. Verify winner
    const endedAuction = await auctionsService.getById(auction.id);
    expect(endedAuction.status).toBe("ended");
    expect(endedAuction.bidding.highestBidder).toBeDefined();
  });
});
```

---

### Real-time Bidding Test

```typescript
describe("Real-time Bidding", () => {
  it("should receive real-time updates", async () => {
    const updates: any[] = [];

    const unsubscribe = subscribeToAuction("test_auction_001", (data) => {
      updates.push(data);
    });

    // Place a bid
    await auctionsService.placeBid("test_auction_001", { amount: 20000 });

    // Wait for update
    await new Promise((r) => setTimeout(r, 1000));

    expect(updates.length).toBeGreaterThan(0);
    expect(updates[updates.length - 1].currentPrice).toBe(20000);

    unsubscribe();
  });
});
```

---

## Test Coverage Targets

| Area              | Target | Priority |
| ----------------- | ------ | -------- |
| Auction Listing   | 85%    | High     |
| Bidding           | 95%    | Critical |
| Auto-bidding      | 95%    | Critical |
| Watchlist         | 80%    | Medium   |
| Seller CRUD       | 90%    | High     |
| Real-time Updates | 85%    | High     |
| Edge Cases        | 90%    | Critical |

---

## Test Data Dependencies

- Requires test auctions from `TEST-DATA-REQUIREMENTS.md`
- Need active, ended, and scheduled auctions
- Multiple test users for bidding scenarios
- Real Firebase Realtime Database connection for real-time tests
