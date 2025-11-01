# Cascade Delete Visual Flow

## Before Deletion

```
Category Tree:
┌─────────────────────────────────────────┐
│ Beyblades (parent)                      │
│ ├── Metal Series                        │
│ │   ├── Metal Fusion (10 products)     │
│ │   ├── Metal Masters (8 products)     │
│ │   └── Metal Fury (6 products)        │
│ └── Burst Series                        │
│     ├── Burst Evolution (12 products)  │
│     └── Burst Turbo (9 products)       │
└─────────────────────────────────────────┘

Product Example:
{
  "id": "product123",
  "name": "Storm Pegasus",
  "categoryId": "metal-fusion",
  "categoryName": "Metal Fusion"
}
```

## Admin Clicks Delete on "Metal Series"

```
┌─────────────────────────────────────────────────────────────┐
│ ⚠️ WARNING: This category has subcategories!                │
│                                                             │
│ Deleting this category will:                               │
│ • Delete ALL subcategories recursively                      │
│ • Remove category assignment from all affected products     │
│                                                             │
│ This action CANNOT be undone!                              │
│                                                             │
│ Are you absolutely sure you want to proceed?               │
│                                                             │
│         [Cancel]              [Delete]                      │
└─────────────────────────────────────────────────────────────┘
```

## Cascade Delete Process Flow

```
Step 1: Find All Subcategories (Recursive BFS)
┌────────────────────────────────────────┐
│ findAllSubcategories("metal-series")   │
│                                        │
│ Queue: ["metal-series"]                │
│ ↓                                      │
│ Find children of "metal-series"        │
│ → metal-fusion                         │
│ → metal-masters                        │
│ → metal-fury                           │
│                                        │
│ Queue: ["metal-fusion", ...]           │
│ ↓                                      │
│ Find children of each                  │
│ (None found - all are leaf)            │
│                                        │
│ Result: [                              │
│   "metal-fusion",                      │
│   "metal-masters",                     │
│   "metal-fury"                         │
│ ]                                      │
└────────────────────────────────────────┘

Step 2: Query & Update Products (Batched)
┌────────────────────────────────────────┐
│ Categories to process:                 │
│ ["metal-series", "metal-fusion",       │
│  "metal-masters", "metal-fury"]        │
│                                        │
│ Batch 1 (4 items):                     │
│   Query products WHERE                 │
│   categoryId IN [all 4 IDs]            │
│                                        │
│   Found 24 products                    │
│   ↓                                    │
│   Update each:                         │
│   - categoryId = ""                    │
│   - categoryName = ""                  │
│   - updatedAt = now                    │
└────────────────────────────────────────┘

Step 3: Delete All Categories (Parallel)
┌────────────────────────────────────────┐
│ Promise.all([                          │
│   delete("metal-series"),              │
│   delete("metal-fusion"),              │
│   delete("metal-masters"),             │
│   delete("metal-fury")                 │
│ ])                                     │
│                                        │
│ All deletions execute in parallel      │
│ for maximum performance                │
└────────────────────────────────────────┘

Step 4: Update Parent References
┌────────────────────────────────────────┐
│ Parent: "beyblades"                    │
│                                        │
│ Before:                                │
│ childIds: ["metal-series",             │
│            "burst-series"]             │
│                                        │
│ After:                                 │
│ childIds: ["burst-series"]             │
│ isLeaf: false                          │
│ updatedAt: now                         │
└────────────────────────────────────────┘
```

## After Deletion

```
Category Tree:
┌─────────────────────────────────────────┐
│ Beyblades (parent)                      │
│ └── Burst Series                        │
│     ├── Burst Evolution (12 products)  │
│     └── Burst Turbo (9 products)       │
└─────────────────────────────────────────┘

❌ DELETED:
- Metal Series
- Metal Fusion
- Metal Masters
- Metal Fury

Product Example (Updated):
{
  "id": "product123",
  "name": "Storm Pegasus",
  "categoryId": "",          ← Cleared
  "categoryName": "",        ← Cleared
  "updatedAt": "2025-11-01..." ← Updated
}

Success Message:
┌─────────────────────────────────────────┐
│ ✓ Successfully deleted 4 categories     │
│   and updated 24 products               │
└─────────────────────────────────────────┘
```

## Data Flow Diagram

```
┌─────────────┐
│   Admin     │
│   clicks    │
│   Delete    │
└──────┬──────┘
       │
       ↓
┌──────────────────────┐
│  Frontend            │
│  - Detects children  │
│  - Shows warning     │
│  - Confirms action   │
└──────┬───────────────┘
       │
       ↓
┌──────────────────────────────────────┐
│  Backend API (DELETE endpoint)       │
│  ┌────────────────────────────────┐  │
│  │ 1. Verify admin auth           │  │
│  │ 2. Load all categories         │  │
│  │ 3. Find subcategories (BFS)    │  │
│  │ 4. Update products (batched)   │  │
│  │ 5. Delete categories (parallel)│  │
│  │ 6. Update parent refs          │  │
│  └────────────────────────────────┘  │
└──────┬───────────────────────────────┘
       │
       ↓
┌──────────────────────┐
│   Firebase DB        │
│  ┌────────────────┐  │
│  │ Categories:    │  │
│  │ - 4 deleted    │  │
│  │                │  │
│  │ Products:      │  │
│  │ - 24 updated   │  │
│  │                │  │
│  │ Parent:        │  │
│  │ - 1 updated    │  │
│  └────────────────┘  │
└──────┬───────────────┘
       │
       ↓
┌──────────────────────┐
│  Frontend            │
│  - Refresh list      │
│  - Show success msg  │
│  - Display stats     │
└──────────────────────┘
```

## Error Scenarios

```
Scenario 1: User Cancels
┌─────────────┐
│ Show Dialog │
└──────┬──────┘
       │
       ↓ User clicks [Cancel]
┌─────────────┐
│ No Action   │
│ Categories  │
│ Unchanged   │
└─────────────┘

Scenario 2: Permission Denied
┌─────────────┐
│ API Call    │
└──────┬──────┘
       │
       ↓ verifyAdmin() fails
┌─────────────────────┐
│ Return 401 Error    │
│ "Authentication     │
│  required"          │
└─────────────────────┘

Scenario 3: Category Not Found
┌─────────────┐
│ API Call    │
└──────┬──────┘
       │
       ↓ Category doesn't exist
┌─────────────────────┐
│ Return 404 Error    │
│ "Category not       │
│  found"             │
└─────────────────────┘

Scenario 4: Database Error
┌─────────────┐
│ Delete      │
│ Operation   │
└──────┬──────┘
       │
       ↓ Firebase error
┌─────────────────────┐
│ Catch Error         │
│ Log to console      │
│ Return 500 Error    │
│ "Failed to delete   │
│  category"          │
└─────────────────────┘
```

## Performance Characteristics

```
Time Complexity Analysis:
┌────────────────────────────────────────┐
│ Operation              | Complexity    │
├────────────────────────────────────────┤
│ Find subcategories     | O(n)          │
│   where n = # categories               │
│                                        │
│ Query products         | O(p/10)       │
│   where p = # products                 │
│   (batches of 10)                      │
│                                        │
│ Delete categories      | O(c)          │
│   where c = # to delete                │
│   (parallel execution)                 │
│                                        │
│ Update parent refs     | O(r)          │
│   where r = # parent refs              │
└────────────────────────────────────────┘

Space Complexity: O(n + c)
  n = total categories in memory
  c = categories to delete in array

Network Calls:
- 1 call to load all categories
- ceil(c/10) calls to query products
- p calls to update products
- c calls to delete categories (parallel)
- r calls to update parents
```

## Database Operations Count

```
Example: Delete "Metal Series" with 3 children and 24 products

Firestore Operations:
┌────────────────────────────────────────┐
│ 1. Read all categories:      1 query   │
│ 2. Query products (batched): 1 query   │
│    (4 categories < 10 limit)           │
│ 3. Update products:          24 writes │
│ 4. Delete categories:        4 deletes │
│ 5. Update parent:            1 write   │
├────────────────────────────────────────┤
│ Total Reads:    2                      │
│ Total Writes:   29                     │
└────────────────────────────────────────┘

Cost Estimation (Firebase):
- Reads:  2 × $0.06/100K = negligible
- Writes: 29 × $0.18/100K = negligible
- Delete: 4 × $0.02/100K = negligible

Total: ~$0.00 per operation
```
