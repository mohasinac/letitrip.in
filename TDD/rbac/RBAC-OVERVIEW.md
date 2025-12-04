# RBAC Overview - Role-Based Access Control

## ⚠️ MANDATORY: Follow Project Standards

Before implementing, read **[AI Agent Development Guide](/docs/ai/AI-AGENT-GUIDE.md)**

**Key Requirements:**

- Services call APIs via `apiService`, NEVER access database directly
- Only API routes can use `getFirestoreAdmin()`
- Use `COLLECTIONS` constant from `src/constants/database.ts`

---

## Role Hierarchy

```
Admin (Level 100)
    │
    ├── Full system access
    ├── Manage all users, shops, products, auctions
    ├── Process payments, payouts, refunds
    ├── Access analytics and reports
    └── Configure homepage, categories, hero slides

Seller (Level 50)
    │
    ├── Manage own shop
    ├── Create/manage products and auctions
    ├── View own orders and process shipments
    ├── Request payouts
    ├── Manage shop coupons
    └── Handle returns for own shop

User (Level 10)
    │
    ├── Browse products and auctions
    ├── Add to cart and checkout
    ├── Place bids on auctions
    ├── Manage addresses
    ├── Write reviews (verified purchase)
    ├── Create support tickets
    └── Request returns

Guest (Level 0)
    │
    ├── View public products
    ├── View public auctions
    ├── View categories
    ├── Search products
    └── View shop pages
```

## Permissions Matrix

### Resource: Users

| Action            | Admin | Seller   | User     | Guest    |
| ----------------- | ----- | -------- | -------- | -------- |
| List all users    | ✅    | ❌       | ❌       | ❌       |
| View user details | ✅    | Own only | Own only | ❌       |
| Create user       | ✅    | ❌       | ❌       | Register |
| Update user       | ✅    | Own only | Own only | ❌       |
| Delete user       | ✅    | ❌       | ❌       | ❌       |
| Ban/Unban user    | ✅    | ❌       | ❌       | ❌       |
| Change role       | ✅    | ❌       | ❌       | ❌       |
| Bulk operations   | ✅    | ❌       | ❌       | ❌       |

### Resource: Products

| Action          | Admin | Seller   | User      | Guest     |
| --------------- | ----- | -------- | --------- | --------- |
| List all        | ✅    | Own shop | Published | Published |
| View details    | ✅    | Own shop | Published | Published |
| Create          | ✅    | ✅       | ❌        | ❌        |
| Update          | ✅    | Own only | ❌        | ❌        |
| Delete          | ✅    | Own only | ❌        | ❌        |
| Bulk operations | ✅    | Own only | ❌        | ❌        |
| Change status   | ✅    | Own only | ❌        | ❌        |
| Feature product | ✅    | ❌       | ❌        | ❌        |

### Resource: Auctions

| Action          | Admin | Seller      | User     | Guest  |
| --------------- | ----- | ----------- | -------- | ------ |
| List all        | ✅    | Own shop    | Active   | Active |
| View details    | ✅    | Own shop    | Active   | Active |
| Create          | ✅    | ✅          | ❌       | ❌     |
| Update          | ✅    | Own only    | ❌       | ❌     |
| Delete          | ✅    | Own only    | ❌       | ❌     |
| Place bid       | ✅    | ❌          | ✅       | ❌     |
| View bids       | ✅    | Own auction | Own bids | ❌     |
| Cancel auction  | ✅    | Own only    | ❌       | ❌     |
| Feature auction | ✅    | ❌          | ❌       | ❌     |

### Resource: Orders

| Action           | Admin | Seller   | User          | Guest |
| ---------------- | ----- | -------- | ------------- | ----- |
| List all         | ✅    | Own shop | Own only      | ❌    |
| View details     | ✅    | Own shop | Own only      | ❌    |
| Create           | ✅    | ❌       | ✅            | ❌    |
| Update status    | ✅    | Own shop | ❌            | ❌    |
| Cancel           | ✅    | Own shop | Own (pending) | ❌    |
| Process shipment | ✅    | Own shop | ❌            | ❌    |
| Issue refund     | ✅    | ❌       | ❌            | ❌    |
| Bulk operations  | ✅    | Own shop | ❌            | ❌    |

### Resource: Shops

| Action       | Admin | Seller       | User   | Guest  |
| ------------ | ----- | ------------ | ------ | ------ |
| List all     | ✅    | All          | Active | Active |
| View details | ✅    | All          | Active | Active |
| Create       | ✅    | ✅ (if none) | ❌     | ❌     |
| Update       | ✅    | Own only     | ❌     | ❌     |
| Delete       | ✅    | ❌           | ❌     | ❌     |
| Verify shop  | ✅    | ❌           | ❌     | ❌     |
| Suspend shop | ✅    | ❌           | ❌     | ❌     |
| Follow shop  | ✅    | ✅           | ✅     | ❌     |

### Resource: Reviews

| Action          | Admin | Seller   | User           | Guest    |
| --------------- | ----- | -------- | -------------- | -------- |
| List all        | ✅    | Own shop | Approved       | Approved |
| View details    | ✅    | Own shop | Approved       | Approved |
| Create          | ✅    | ❌       | ✅ (purchased) | ❌       |
| Update          | ✅    | ❌       | Own only       | ❌       |
| Delete          | ✅    | ❌       | Own only       | ❌       |
| Reply to review | ✅    | Own shop | ❌             | ❌       |
| Approve/Reject  | ✅    | ❌       | ❌             | ❌       |
| Vote helpful    | ✅    | ✅       | ✅             | ❌       |

### Resource: Coupons

| Action          | Admin | Seller   | User   | Guest  |
| --------------- | ----- | -------- | ------ | ------ |
| List all        | ✅    | Own shop | Public | Public |
| View details    | ✅    | Own shop | Public | Public |
| Create          | ✅    | ✅       | ❌     | ❌     |
| Update          | ✅    | Own only | ❌     | ❌     |
| Delete          | ✅    | Own only | ❌     | ❌     |
| Apply coupon    | ✅    | ✅       | ✅     | ❌     |
| Validate code   | ✅    | ✅       | ✅     | ❌     |
| Bulk operations | ✅    | Own only | ❌     | ❌     |

### Resource: Returns

| Action          | Admin | Seller   | User     | Guest |
| --------------- | ----- | -------- | -------- | ----- |
| List all        | ✅    | Own shop | Own only | ❌    |
| View details    | ✅    | Own shop | Own only | ❌    |
| Create          | ✅    | ❌       | ✅       | ❌    |
| Update          | ✅    | Own shop | ❌       | ❌    |
| Approve/Reject  | ✅    | Own shop | ❌       | ❌    |
| Process refund  | ✅    | ❌       | ❌       | ❌    |
| Escalate        | ✅    | ✅       | ✅       | ❌    |
| Bulk operations | ✅    | Own shop | ❌       | ❌    |

### Resource: Support Tickets

| Action         | Admin | Seller   | User     | Guest |
| -------------- | ----- | -------- | -------- | ----- |
| List all       | ✅    | Own shop | Own only | ❌    |
| View details   | ✅    | Own shop | Own only | ❌    |
| Create         | ✅    | ✅       | ✅       | ❌    |
| Reply          | ✅    | Own shop | Own only | ❌    |
| Close ticket   | ✅    | Own shop | Own only | ❌    |
| Assign agent   | ✅    | ❌       | ❌       | ❌    |
| Escalate       | ✅    | ✅       | ✅       | ❌    |
| Internal notes | ✅    | ❌       | ❌       | ❌    |

### Resource: Payments

| Action          | Admin | Seller   | User     | Guest |
| --------------- | ----- | -------- | -------- | ----- |
| List all        | ✅    | Own shop | Own only | ❌    |
| View details    | ✅    | Own shop | Own only | ❌    |
| Process payment | ✅    | ❌       | ✅       | ❌    |
| Refund          | ✅    | ❌       | ❌       | ❌    |
| View stats      | ✅    | Own shop | ❌       | ❌    |
| Bulk operations | ✅    | ❌       | ❌       | ❌    |

### Resource: Payouts

| Action         | Admin | Seller   | User | Guest |
| -------------- | ----- | -------- | ---- | ----- |
| List all       | ✅    | Own only | ❌   | ❌    |
| View details   | ✅    | Own only | ❌   | ❌    |
| Request payout | ✅    | ✅       | ❌   | ❌    |
| Process payout | ✅    | ❌       | ❌   | ❌    |
| View history   | ✅    | Own only | ❌   | ❌    |
| Bulk process   | ✅    | ❌       | ❌   | ❌    |

### Resource: Categories

| Action           | Admin | Seller | User   | Guest  |
| ---------------- | ----- | ------ | ------ | ------ |
| List all         | ✅    | Active | Active | Active |
| View tree        | ✅    | Active | Active | Active |
| Create           | ✅    | ❌     | ❌     | ❌     |
| Update           | ✅    | ❌     | ❌     | ❌     |
| Delete           | ✅    | ❌     | ❌     | ❌     |
| Reorder          | ✅    | ❌     | ❌     | ❌     |
| Feature category | ✅    | ❌     | ❌     | ❌     |
| Bulk operations  | ✅    | ❌     | ❌     | ❌     |

### Resource: Hero Slides

| Action          | Admin | Seller | User   | Guest  |
| --------------- | ----- | ------ | ------ | ------ |
| List all        | ✅    | Active | Active | Active |
| View details    | ✅    | Active | Active | Active |
| Create          | ✅    | ❌     | ❌     | ❌     |
| Update          | ✅    | ❌     | ❌     | ❌     |
| Delete          | ✅    | ❌     | ❌     | ❌     |
| Reorder         | ✅    | ❌     | ❌     | ❌     |
| Bulk operations | ✅    | ❌     | ❌     | ❌     |

### Resource: Media

| Action     | Admin | Seller | User    | Guest |
| ---------- | ----- | ------ | ------- | ----- |
| Upload     | ✅    | ✅     | Limited | ❌    |
| List own   | ✅    | ✅     | ✅      | ❌    |
| Delete own | ✅    | ✅     | ✅      | ❌    |
| Delete any | ✅    | ❌     | ❌      | ❌    |

### Resource: Cart

| Action          | Admin | Seller | User | Guest |
| --------------- | ----- | ------ | ---- | ----- |
| View cart       | ✅    | ✅     | ✅   | ❌    |
| Add item        | ✅    | ✅     | ✅   | ❌    |
| Update quantity | ✅    | ✅     | ✅   | ❌    |
| Remove item     | ✅    | ✅     | ✅   | ❌    |
| Clear cart      | ✅    | ✅     | ✅   | ❌    |
| Apply coupon    | ✅    | ✅     | ✅   | ❌    |
| Merge carts     | ✅    | ✅     | ✅   | ❌    |

### Resource: Favorites

| Action               | Admin | Seller | User | Guest         |
| -------------------- | ----- | ------ | ---- | ------------- |
| List favorites       | ✅    | ✅     | ✅   | Local storage |
| Add favorite         | ✅    | ✅     | ✅   | Local storage |
| Remove favorite      | ✅    | ✅     | ✅   | Local storage |
| Enable notifications | ✅    | ✅     | ✅   | ❌            |
| Sync on login        | ✅    | ✅     | ✅   | N/A           |
| View analytics       | ✅    | Own    | ❌   | ❌            |

### Resource: Blog

| Action            | Admin | Seller    | User      | Guest     |
| ----------------- | ----- | --------- | --------- | --------- |
| List posts        | ✅    | Published | Published | Published |
| View post         | ✅    | Published | Published | Published |
| Create post       | ✅    | ❌        | ❌        | ❌        |
| Update post       | ✅    | ❌        | ❌        | ❌        |
| Delete post       | ✅    | ❌        | ❌        | ❌        |
| Manage categories | ✅    | ❌        | ❌        | ❌        |
| Manage tags       | ✅    | ❌        | ❌        | ❌        |

### Resource: Messages

| Action               | Admin | Seller   | User     | Guest |
| -------------------- | ----- | -------- | -------- | ----- |
| List conversations   | ✅    | Own only | Own only | ❌    |
| View conversation    | ✅    | Own only | Own only | ❌    |
| Send message         | ✅    | ✅       | ✅       | ❌    |
| Reply to message     | ✅    | Own only | Own only | ❌    |
| Archive conversation | ✅    | Own only | Own only | ❌    |
| Delete message       | ✅    | Own only | Own only | ❌    |
| View all messages    | ✅    | ❌       | ❌       | ❌    |

### Resource: Internationalization (E037 - Planned)

| Action                  | Admin | Seller | User | Guest |
| ----------------------- | ----- | ------ | ---- | ----- |
| Switch language         | ✅    | ✅     | ✅   | ✅    |
| Save language pref      | ✅    | ✅     | ✅   | ✅    |
| Configure languages     | ✅    | ❌     | ❌   | ❌    |
| Manage translations     | ✅    | ❌     | ❌   | ❌    |
| Set default language    | ✅    | ❌     | ❌   | ❌    |
| Enable/disable language | ✅    | ❌     | ❌   | ❌    |

### Resource: Settings

| Action             | Admin | Seller | User | Guest |
| ------------------ | ----- | ------ | ---- | ----- |
| View settings      | ✅    | ❌     | ❌   | ❌    |
| Update general     | ✅    | ❌     | ❌   | ❌    |
| Update payment     | ✅    | ❌     | ❌   | ❌    |
| Update shipping    | ✅    | ❌     | ❌   | ❌    |
| Update email       | ✅    | ❌     | ❌   | ❌    |
| Toggle features    | ✅    | ❌     | ❌   | ❌    |
| Enable maintenance | ✅    | ❌     | ❌   | ❌    |

### Resource: Product Comparison (E002)

| Action               | Admin | Seller | User | Guest         |
| -------------------- | ----- | ------ | ---- | ------------- |
| Add to comparison    | ✅    | ✅     | ✅   | Local storage |
| Remove from compare  | ✅    | ✅     | ✅   | Local storage |
| View comparison bar  | ✅    | ✅     | ✅   | Local storage |
| View full comparison | ✅    | ✅     | ✅   | Local storage |
| Sync on login        | ✅    | ✅     | ✅   | N/A           |
| Max 4 products       | ✅    | ✅     | ✅   | ✅            |

### Resource: Viewing History (E002)

| Action                 | Admin | Seller | User | Guest         |
| ---------------------- | ----- | ------ | ---- | ------------- |
| Auto-track views       | ✅    | ✅     | ✅   | Local storage |
| View history widget    | ✅    | ✅     | ✅   | Local storage |
| View full history page | ✅    | ✅     | ✅   | Local storage |
| Clear history          | ✅    | ✅     | ✅   | Local storage |
| Sync on login          | ✅    | ✅     | ✅   | N/A           |
| Max 50 items           | ✅    | ✅     | ✅   | ✅            |
| 30-day expiry          | ✅    | ✅     | ✅   | ✅            |

### Resource: Homepage Sections (E014)

| Action               | Admin | Seller | User   | Guest  |
| -------------------- | ----- | ------ | ------ | ------ |
| View sections        | ✅    | Active | Active | Active |
| Create section       | ✅    | ❌     | ❌     | ❌     |
| Update section       | ✅    | ❌     | ❌     | ❌     |
| Delete section       | ✅    | ❌     | ❌     | ❌     |
| Reorder sections     | ✅    | ❌     | ❌     | ❌     |
| Configure products   | ✅    | ❌     | ❌     | ❌     |
| Set display settings | ✅    | ❌     | ❌     | ❌     |

### Resource: Similar Categories (E013)

| Action              | Admin | Seller | User | Guest |
| ------------------- | ----- | ------ | ---- | ----- |
| View similar cats   | ✅    | ✅     | ✅   | ✅    |
| Configure relations | ✅    | ❌     | ❌   | ❌    |
| Set display count   | ✅    | ❌     | ❌   | ❌    |

### Resource: Media Upload (E003)

| Action              | Admin | Seller | User    | Guest |
| ------------------- | ----- | ------ | ------- | ----- |
| Upload image        | ✅    | ✅     | Limited | ❌    |
| Crop/zoom image     | ✅    | ✅     | Limited | ❌    |
| Rotate image        | ✅    | ✅     | Limited | ❌    |
| Set focus point     | ✅    | ✅     | Limited | ❌    |
| Upload video        | ✅    | ✅     | ❌      | ❌    |
| Generate thumbnail  | ✅    | ✅     | ❌      | ❌    |
| Select aspect ratio | ✅    | ✅     | Limited | ❌    |

### Resource: Search

| Action          | Admin | Seller | User | Guest |
| --------------- | ----- | ------ | ---- | ----- |
| Search products | ✅    | ✅     | ✅   | ✅    |
| Search auctions | ✅    | ✅     | ✅   | ✅    |
| Search shops    | ✅    | ✅     | ✅   | ✅    |
| Global search   | ✅    | ✅     | ✅   | ✅    |

### Resource: Mobile Features

| Action                 | Admin | Seller | User | Guest               |
| ---------------------- | ----- | ------ | ---- | ------------------- |
| PWA install            | ✅    | ✅     | ✅   | ✅                  |
| Offline browsing       | ✅    | ✅     | ✅   | ✅ (cached pages)   |
| Push notifications     | ✅    | ✅     | ✅   | ❌                  |
| Camera access          | ✅    | ✅     | ✅   | ❌                  |
| Pull-to-refresh        | ✅    | ✅     | ✅   | ✅                  |
| Swipe actions          | ✅    | ✅     | ✅   | ❌ (requires auth)  |
| Mobile sidebar (Admin) | ✅    | ❌     | ❌   | ❌                  |
| Mobile sidebar (Sell)  | ✅    | ✅     | ❌   | ❌                  |
| Quick actions FAB      | ✅    | ✅     | ❌   | ❌                  |
| Mobile data tables     | ✅    | ✅     | ✅   | ✅ (public data)    |
| Mobile filters         | ✅    | ✅     | ✅   | ✅                  |
| Mobile forms           | ✅    | ✅     | ✅   | ✅ (contact/search) |

## Ownership Rules

### Shop Ownership

- Seller owns their shop (shopId matches user.shopId)
- Products/Auctions owned by shop owner
- Orders for shop products belong to shop

### User Ownership

- Users own their orders (userId matches)
- Users own their reviews (userId matches)
- Users own their tickets (createdBy matches)
- Users own their returns (customerId matches)

### Admin Override

- Admins can access all resources regardless of ownership
- Admins can modify any resource status
- Admins can delete any resource

## Implementation Reference

```typescript
// Check permission
import { canReadResource, canWriteResource } from "@/lib/rbac-permissions";

// Usage
if (canWriteResource(user, "products", "update", productData)) {
  // Allow update
}

// Filter data by role
import { filterDataByRole } from "@/lib/rbac-permissions";
const filteredProducts = filterDataByRole(user, "products", products);
```

### Resource: RipLimit (E028)

| Action              | Admin | Seller | User     | Guest |
| ------------------- | ----- | ------ | -------- | ----- |
| View balance        | ✅    | ✅     | Own only | ❌    |
| Purchase RipLimit   | ✅    | ✅     | ✅       | ❌    |
| View transactions   | ✅    | ✅     | Own only | ❌    |
| Request refund      | ✅    | ❌     | ✅       | ❌    |
| Adjust user balance | ✅    | ❌     | ❌       | ❌    |
| View all balances   | ✅    | ❌     | ❌       | ❌    |
| Clear unpaid flag   | ✅    | ❌     | ❌       | ❌    |
| View RipLimit stats | ✅    | ❌     | ❌       | ❌    |

### Resource: Addresses (E029)

| Action           | Admin | Seller   | User     | Guest |
| ---------------- | ----- | -------- | -------- | ----- |
| List addresses   | ✅    | Own only | Own only | ❌    |
| Create address   | ✅    | ✅       | ✅       | ❌    |
| Update address   | ✅    | Own only | Own only | ❌    |
| Delete address   | ✅    | Own only | Own only | ❌    |
| Set default      | ✅    | Own only | Own only | ❌    |
| Use GPS location | ✅    | ✅       | ✅       | ❌    |
| Lookup pincode   | ✅    | ✅       | ✅       | ✅    |

### Resource: Theme & Design (E027)

| Action                | Admin | Seller | User | Guest |
| --------------------- | ----- | ------ | ---- | ----- |
| Toggle dark mode      | ✅    | ✅     | ✅   | ✅    |
| Save theme preference | ✅    | ✅     | ✅   | ✅    |
| Update theme colors   | ✅    | ❌     | ❌   | ❌    |
| View design tokens    | ✅    | ❌     | ❌   | ❌    |

### Resource: User Verification (E038 - Tasks 107-116)

| Action                   | Admin | Seller   | User     | Guest |
| ------------------------ | ----- | -------- | -------- | ----- |
| Send email OTP           | ✅    | Own only | Own only | ❌    |
| Verify email OTP         | ✅    | Own only | Own only | ❌    |
| Send phone OTP           | ✅    | Own only | Own only | ❌    |
| Verify phone OTP         | ✅    | Own only | Own only | ❌    |
| View verification status | ✅    | Own only | Own only | ❌    |
| Bypass verification gate | ✅    | ❌       | ❌       | ❌    |
| Reset verification       | ✅    | ❌       | ❌       | ❌    |

**Enforcement**:

- Checkout requires email + phone verification
- Bidding requires email + phone verification
- VerificationGate blocks unverified users

### Resource: IP Tracking & Security (E038 - Tasks 117-122)

| Action                      | Admin | Seller | User | Guest |
| --------------------------- | ----- | ------ | ---- | ----- |
| View IP activity logs       | ✅    | ❌     | ❌   | ❌    |
| View login history          | ✅    | ❌     | ❌   | ❌    |
| View registration history   | ✅    | ❌     | ❌   | ❌    |
| Track suspicious activity   | ✅    | ❌     | ❌   | ❌    |
| View rate limit status      | ✅    | ❌     | ❌   | ❌    |
| Block IP address            | ✅    | ❌     | ❌   | ❌    |
| View user activity timeline | ✅    | ❌     | ❌   | ❌    |

**Features**:

- Automatic IP logging on login/registration
- Rate limiting per IP
- Suspicious activity detection
- Activity timeline in USER_ACTIVITIES collection

### Resource: Events & Ticketing (E038 - Tasks 123-128)

| Action               | Admin | Seller | User      | Guest     |
| -------------------- | ----- | ------ | --------- | --------- |
| List all events      | ✅    | ❌     | Published | Published |
| View event details   | ✅    | ❌     | Published | Published |
| Create event         | ✅    | ❌     | ❌        | ❌        |
| Update event         | ✅    | ❌     | ❌        | ❌        |
| Delete event         | ✅    | ❌     | ❌        | ❌        |
| Register for event   | ✅    | ✅     | ✅        | ❌        |
| View registrations   | ✅    | ❌     | Own only  | ❌        |
| Cancel registration  | ✅    | Own    | Own only  | ❌        |
| Purchase tickets     | ✅    | ✅     | ✅        | ❌        |
| Check registration   | ✅    | ✅     | ✅        | ❌        |
| View event analytics | ✅    | ❌     | ❌        | ❌        |

**Features**:

- Event creation/management (admin only)
- Ticketing & booking integration
- Registration tracking
- Capacity management

## API Middleware Pattern

```typescript
// Example API route with RBAC
export async function PATCH(req: Request, { params }) {
  const session = await getAuthSession(req);

  // Check authentication
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check permission
  if (!canWriteResource(session.user, "products", "update", existingProduct)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Proceed with update
}
```
