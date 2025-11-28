# Performance Test Specifications

## Overview

Performance testing specifications for load testing, stress testing, and benchmarking the JustForView auction platform.

---

## Performance Goals

### Response Time Targets

| Endpoint Category   | P50    | P95    | P99    |
| ------------------- | ------ | ------ | ------ |
| Public GET (list)   | 200ms  | 500ms  | 1000ms |
| Public GET (single) | 100ms  | 300ms  | 500ms  |
| Search              | 300ms  | 800ms  | 1500ms |
| Auth endpoints      | 150ms  | 400ms  | 800ms  |
| Protected CRUD      | 200ms  | 500ms  | 1000ms |
| File upload         | 1000ms | 3000ms | 5000ms |
| Analytics/Dashboard | 500ms  | 1500ms | 3000ms |

### Throughput Targets

| Scenario       | Target RPS | Max Latency |
| -------------- | ---------- | ----------- |
| Normal load    | 100        | 500ms       |
| Peak load      | 500        | 1000ms      |
| Auction ending | 200        | 800ms       |
| Sale event     | 300        | 1000ms      |

### Availability Targets

- **Uptime**: 99.9% (8.76 hours downtime/year max)
- **Error Rate**: < 0.1% under normal load
- **Error Rate**: < 1% under peak load

---

## Load Test Scenarios

### 1. Homepage & Discovery

```javascript
// k6 load test script
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "2m", target: 50 }, // Ramp up
    { duration: "5m", target: 50 }, // Steady state
    { duration: "2m", target: 100 }, // Peak
    { duration: "5m", target: 100 }, // Peak steady
    { duration: "2m", target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<500", "p(99)<1000"],
    http_req_failed: ["rate<0.01"],
  },
};

export default function () {
  // Homepage
  const homeRes = http.get(`${BASE_URL}/api/homepage`);
  check(homeRes, { "homepage status 200": (r) => r.status === 200 });

  // Category list
  const catRes = http.get(`${BASE_URL}/api/categories`);
  check(catRes, { "categories status 200": (r) => r.status === 200 });

  // Products list
  const prodRes = http.get(`${BASE_URL}/api/products?limit=20`);
  check(prodRes, { "products status 200": (r) => r.status === 200 });

  // Auctions list
  const aucRes = http.get(`${BASE_URL}/api/auctions?limit=20`);
  check(aucRes, { "auctions status 200": (r) => r.status === 200 });

  sleep(1);
}
```

### 2. Search Performance

```javascript
export const searchOptions = {
  stages: [
    { duration: "1m", target: 30 },
    { duration: "3m", target: 30 },
    { duration: "1m", target: 60 },
    { duration: "3m", target: 60 },
    { duration: "1m", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<800", "p(99)<1500"],
    http_req_failed: ["rate<0.01"],
  },
};

const searchQueries = [
  "iphone",
  "samsung galaxy",
  "laptop",
  "watch",
  "vintage",
  "antique",
  "electronics",
  "fashion",
];

export function searchTest() {
  const query = searchQueries[Math.floor(Math.random() * searchQueries.length)];

  // Product search
  const searchRes = http.get(`${BASE_URL}/api/search?type=products&q=${query}`);
  check(searchRes, {
    "search status 200": (r) => r.status === 200,
    "search has results": (r) => JSON.parse(r.body).data.length >= 0,
  });

  // Auction search
  const auctionRes = http.get(
    `${BASE_URL}/api/search?type=auctions&q=${query}`
  );
  check(auctionRes, { "auction search 200": (r) => r.status === 200 });

  // Filtered search
  const filteredRes = http.get(
    `${BASE_URL}/api/search?type=products&q=${query}&min_price=1000&max_price=50000`
  );
  check(filteredRes, { "filtered search 200": (r) => r.status === 200 });

  sleep(0.5);
}
```

### 3. Auction Bidding Stress Test

```javascript
export const biddingOptions = {
  scenarios: {
    auction_ending: {
      executor: "ramping-arrival-rate",
      startRate: 10,
      timeUnit: "1s",
      preAllocatedVUs: 50,
      maxVUs: 200,
      stages: [
        { duration: "1m", target: 10 },
        { duration: "30s", target: 50 }, // Bidding intensifies
        { duration: "30s", target: 100 }, // Final seconds
        { duration: "1m", target: 5 }, // After auction ends
      ],
    },
  },
  thresholds: {
    http_req_duration: ["p(95)<800"],
    http_req_failed: ["rate<0.02"],
  },
};

export function biddingTest() {
  const auctionId = "auc_001";
  const bidAmount = 50000 + Math.floor(Math.random() * 10000);

  // Place bid
  const bidRes = http.post(
    `${BASE_URL}/api/auctions/${auctionId}/bids`,
    JSON.stringify({ amount: bidAmount }),
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TEST_TOKEN}`,
      },
    }
  );

  check(bidRes, {
    "bid accepted or outbid": (r) => r.status === 200 || r.status === 400,
  });

  // Fetch current auction state
  const stateRes = http.get(`${BASE_URL}/api/auctions/${auctionId}`);
  check(stateRes, { "auction state 200": (r) => r.status === 200 });
}
```

### 4. Checkout Flow

```javascript
export const checkoutOptions = {
  stages: [
    { duration: "2m", target: 20 },
    { duration: "5m", target: 20 },
    { duration: "2m", target: 50 }, // Flash sale
    { duration: "5m", target: 50 },
    { duration: "2m", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<1000", "p(99)<2000"],
    http_req_failed: ["rate<0.01"],
  },
};

export function checkoutTest() {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${TEST_TOKEN}`,
  };

  // Add to cart
  const addRes = http.post(
    `${BASE_URL}/api/cart`,
    JSON.stringify({ productId: "prod_001", quantity: 1 }),
    { headers }
  );
  check(addRes, { "add to cart 200": (r) => r.status === 200 });

  // Get cart
  const cartRes = http.get(`${BASE_URL}/api/cart`, { headers });
  check(cartRes, { "get cart 200": (r) => r.status === 200 });

  // Validate cart
  const validateRes = http.post(`${BASE_URL}/api/cart/validate`, null, {
    headers,
  });
  check(validateRes, { "validate cart 200": (r) => r.status === 200 });

  // Create order (mock payment)
  const orderRes = http.post(
    `${BASE_URL}/api/checkout/create-order`,
    JSON.stringify({
      addressId: "addr_001",
      paymentMethod: "cod",
    }),
    { headers }
  );
  check(orderRes, {
    "create order success": (r) => r.status === 200 || r.status === 201,
  });

  sleep(2);
}
```

### 5. Seller Dashboard Load

```javascript
export const sellerDashOptions = {
  stages: [
    { duration: "1m", target: 30 },
    { duration: "3m", target: 30 },
    { duration: "1m", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<1500", "p(99)<3000"],
    http_req_failed: ["rate<0.01"],
  },
};

export function sellerDashTest() {
  const headers = { Authorization: `Bearer ${SELLER_TOKEN}` };

  // Dashboard
  const dashRes = http.get(`${BASE_URL}/api/seller/dashboard`, { headers });
  check(dashRes, { "dashboard 200": (r) => r.status === 200 });

  // Orders
  const ordersRes = http.get(`${BASE_URL}/api/seller/orders`, { headers });
  check(ordersRes, { "orders 200": (r) => r.status === 200 });

  // Analytics
  const analyticsRes = http.get(`${BASE_URL}/api/analytics?shop_id=shop_001`, {
    headers,
  });
  check(analyticsRes, { "analytics 200": (r) => r.status === 200 });

  // Products
  const productsRes = http.get(`${BASE_URL}/api/seller/products`, { headers });
  check(productsRes, { "products 200": (r) => r.status === 200 });

  sleep(2);
}
```

---

## Stress Test Scenarios

### Database Connection Limits

```javascript
export const dbStressOptions = {
  executor: "constant-arrival-rate",
  rate: 200,
  timeUnit: "1s",
  duration: "2m",
  preAllocatedVUs: 100,
  maxVUs: 500,
};

export function dbStressTest() {
  // Multiple queries in parallel
  const responses = http.batch([
    ["GET", `${BASE_URL}/api/products?limit=50`],
    ["GET", `${BASE_URL}/api/auctions?limit=50`],
    ["GET", `${BASE_URL}/api/categories`],
    ["GET", `${BASE_URL}/api/shops?limit=20`],
  ]);

  responses.forEach((res, i) => {
    check(res, { [`request ${i} ok`]: (r) => r.status === 200 });
  });
}
```

### Memory Pressure Test

```javascript
export const memoryOptions = {
  stages: [
    { duration: "5m", target: 100 },
    { duration: "10m", target: 100 }, // Sustained load
    { duration: "2m", target: 0 },
  ],
};

export function memoryTest() {
  // Large payload requests
  const largeRes = http.get(`${BASE_URL}/api/products?limit=100`);
  check(largeRes, { "large response ok": (r) => r.status === 200 });

  // Image uploads (simulated)
  const formData = {
    file: http.file(randomBytes(1024 * 100), "test.jpg", "image/jpeg"),
  };
  const uploadRes = http.post(`${BASE_URL}/api/media/upload`, formData, {
    headers: { Authorization: `Bearer ${TEST_TOKEN}` },
  });
  check(uploadRes, {
    "upload ok": (r) => r.status === 200 || r.status === 201,
  });
}
```

---

## Benchmark Tests

### API Response Time Benchmarks

```typescript
describe("API Benchmarks", () => {
  const BENCHMARK_ITERATIONS = 100;

  it("should benchmark product list endpoint", async () => {
    const times: number[] = [];

    for (let i = 0; i < BENCHMARK_ITERATIONS; i++) {
      const start = performance.now();
      await fetch("/api/products?limit=20");
      times.push(performance.now() - start);
    }

    const p50 = percentile(times, 50);
    const p95 = percentile(times, 95);
    const p99 = percentile(times, 99);

    console.log(`Products: P50=${p50}ms, P95=${p95}ms, P99=${p99}ms`);

    expect(p95).toBeLessThan(500);
    expect(p99).toBeLessThan(1000);
  });

  it("should benchmark search endpoint", async () => {
    const times: number[] = [];

    for (let i = 0; i < BENCHMARK_ITERATIONS; i++) {
      const start = performance.now();
      await fetch("/api/search?type=products&q=iphone");
      times.push(performance.now() - start);
    }

    const p95 = percentile(times, 95);
    expect(p95).toBeLessThan(800);
  });

  it("should benchmark auction bid endpoint", async () => {
    const times: number[] = [];

    for (let i = 0; i < BENCHMARK_ITERATIONS; i++) {
      const start = performance.now();
      await fetch("/api/auctions/auc_001/bids", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${testToken}`,
        },
        body: JSON.stringify({ amount: 50000 + i }),
      });
      times.push(performance.now() - start);
    }

    const p95 = percentile(times, 95);
    expect(p95).toBeLessThan(500);
  });
});
```

---

## Monitoring & Alerts

### Key Metrics to Monitor

| Metric               | Warning | Critical |
| -------------------- | ------- | -------- |
| Response time P95    | > 500ms | > 1000ms |
| Error rate           | > 0.5%  | > 1%     |
| CPU usage            | > 70%   | > 90%    |
| Memory usage         | > 75%   | > 90%    |
| Database connections | > 80%   | > 95%    |
| Request queue length | > 100   | > 500    |

### Alert Definitions

```yaml
alerts:
  - name: HighResponseTime
    condition: http_request_duration_p95 > 1000
    severity: warning
    channels: [slack, email]

  - name: CriticalResponseTime
    condition: http_request_duration_p99 > 2000
    severity: critical
    channels: [slack, pagerduty]

  - name: HighErrorRate
    condition: http_error_rate > 0.01
    severity: warning
    channels: [slack]

  - name: CriticalErrorRate
    condition: http_error_rate > 0.05
    severity: critical
    channels: [slack, pagerduty]

  - name: AuctionBiddingLatency
    condition: auction_bid_latency_p95 > 500
    severity: warning
    channels: [slack]
```

---

## Test Execution Schedule

| Test Type   | Frequency | Duration | Environment |
| ----------- | --------- | -------- | ----------- |
| Load test   | Daily     | 15 min   | Staging     |
| Stress test | Weekly    | 30 min   | Staging     |
| Soak test   | Weekly    | 4 hours  | Staging     |
| Spike test  | Weekly    | 10 min   | Staging     |
| Benchmark   | Per PR    | 5 min    | CI          |

---

## Tools

- **k6**: Load testing
- **Artillery**: API testing
- **Lighthouse**: Frontend performance
- **Vercel Analytics**: Real user monitoring
- **Firebase Performance**: Backend monitoring
