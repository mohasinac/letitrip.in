# Component Architecture Diagram

## Overview

This document shows the component hierarchy and relationships for the Beyblade and Arena management systems.

## 🏗️ Component Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                    Admin Management System                      │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┴─────────────────────┐
        │                                           │
        ▼                                           ▼
┌────────────────────┐                    ┌────────────────────┐
│  Beyblades Page    │                    │   Arenas Page      │
│  (184 lines)       │                    │   (211 lines)      │
└────────────────────┘                    └────────────────────┘
        │                                           │
        ├───────────────────┬─────────────┐        ├───────────────────┬─────────────┐
        │                   │             │        │                   │             │
        ▼                   ▼             ▼        ▼                   ▼             ▼
┌───────────────┐  ┌──────────────┐  ┌─────┐  ┌─────────────┐  ┌──────────────┐  ┌─────┐
│ BeybladeCard  │  │ BeybladePreview│  │Delete│  │ ArenaCard   │  │ ArenaPreview │  │Delete│
│               │  │ Modal         │  │Modal │  │             │  │ Modal        │  │Modal │
│ (280 lines)   │  │ (130 lines)   │  │(70  │  │ (280 lines) │  │ (330 lines)  │  │(70  │
└───────────────┘  └──────────────┘  │lines)│  └─────────────┘  └──────────────┘  │lines)│
        │                              └─────┘          │                            └─────┘
        ▼                                 ▲            ▼                               ▲
┌───────────────┐                         │    ┌─────────────┐                        │
│ BeybladeImage │                         │    │   (Shape    │                        │
│   Uploader    │                         │    │   Icons)    │                        │
│               │                         │    └─────────────┘                        │
└───────────────┘                         │                                           │
                                          │                                           │
                                    ┌─────┴───────────────────────────────────────────┘
                                    │
                              ┌─────────────────────┐
                              │ DeleteConfirmModal  │
                              │   (Reusable)        │
                              │   Works for both    │
                              │  Beyblade & Arena   │
                              └─────────────────────┘
```

## 📦 Component Dependencies

### BeybladeCard Component

```
BeybladeCard
├── Props:
│   ├── beyblade: BeybladeStats
│   ├── onImageUploaded: (id, url) => void
│   ├── onPointsOfContactUpdated: (id, points) => void
│   ├── onPreview: (beyblade) => void
│   └── onDelete: (beyblade) => void
├── Internal State:
│   └── editingImage: boolean
├── Dependencies:
│   ├── useRouter (next/navigation)
│   └── BeybladeImageUploader
└── Features:
    ├── Image display with upload overlay
    ├── Type and spin badges
    ├── Action buttons (Edit/Preview/Delete)
    ├── Stats: Physical, Type Distribution, Spin, Contact Points
    └── Internal image upload modal
```

### BeybladePreviewModal Component

```
BeybladePreviewModal
├── Props:
│   ├── beyblade: BeybladeStats | null
│   └── onClose: () => void
├── Dependencies:
│   ├── useRouter (next/navigation)
│   └── BeybladePreview (canvas component)
└── Features:
    ├── Dark theme (gray-900)
    ├── Animated beyblade preview
    ├── Stats grids (4 cols type, 3 cols physical)
    ├── Edit button (navigates to edit page)
    └── Close button
```

### ArenaCard Component

```
ArenaCard
├── Props:
│   ├── arena: ArenaConfig
│   ├── onPreview: (arena) => void
│   └── onDelete: (arena) => void
├── Helper Functions:
│   ├── getShapeIcon(shape) → Icon Component
│   ├── getThemeColor(theme) → Tailwind class
│   └── getDifficultyColor(difficulty) → Tailwind class
├── Dependencies:
│   ├── useRouter (next/navigation)
│   └── Lucide-react icons (Circle, Square, Pentagon, Hexagon, Octagon, Star)
└── Features:
    ├── Theme banner (colored stripe)
    ├── Shape icon display
    ├── Badges: Shape, Theme, Difficulty
    ├── Description (2-line clamp)
    ├── Action buttons (Edit/Preview/Delete)
    └── Stats sections:
        ├── Dimensions (width × height)
        ├── Features (loops/exits/obstacles/pits)
        ├── Hazards (lasers/vortex/water/portals)
        ├── Objectives (goal objects)
        └── Wall (spikes/springs/damage)
```

### ArenaPreviewModal Component

```
ArenaPreviewModal
├── Props:
│   ├── arena: ArenaConfig | null
│   └── onClose: () => void
├── Helper Functions:
│   ├── getShapeIcon(shape) → Icon Component
│   └── getThemeColor(theme) → Tailwind class
├── Dependencies:
│   ├── useRouter (next/navigation)
│   └── Lucide-react icons
└── Features:
    ├── Dark theme (gray-900)
    ├── Visual arena preview (colored shape)
    ├── Description section
    ├── Stats grid: Dimensions/Loops/Obstacles/Hazards
    ├── Feature breakdowns:
    │   ├── Loops (with speed boost details)
    │   ├── Obstacles (first 3 + count)
    │   ├── Hazards (lasers/vortex/water/pits)
    │   ├── Wall properties
    │   └── Goals/Objectives
    ├── Edit button (navigates to edit page)
    └── Close button
```

### DeleteConfirmModal Component (Reusable)

```
DeleteConfirmModal
├── Props:
│   ├── isOpen: boolean
│   ├── itemName: string
│   ├── itemType: string (default: "item")
│   ├── isDeleting: boolean
│   ├── onConfirm: () => void
│   └── onCancel: () => void
├── Dependencies:
│   └── Lucide-react icons (AlertTriangle, Loader2)
└── Features:
    ├── Warning icon (red circle)
    ├── Item name display (bold)
    ├── Loading state with spinner
    ├── Disabled buttons during deletion
    └── Generic design (works for any entity)
```

## 🔄 Data Flow

### Beyblade Management Flow

```
User Action → Beyblades Page (State) → BeybladeCard (Display)
                    ↓
            Callback Props
                    ↓
    ┌───────────────┼───────────────┐
    │               │               │
    ▼               ▼               ▼
Edit Action    Preview Action   Delete Action
    │               │               │
    ▼               ▼               ▼
Navigate to    Show Preview    Show Delete
Edit Page        Modal           Modal
                    ↓               ↓
            BeybladePreviewModal  DeleteConfirmModal
                    │               │
                    ▼               ▼
                Edit/Close      Confirm/Cancel
                    │               │
                    └───────┬───────┘
                            ▼
                    Update Page State
                            ▼
                    Refetch Data (if needed)
```

### Arena Management Flow

```
User Action → Arenas Page (State) → ArenaCard (Display)
                    ↓
            Callback Props
                    ↓
    ┌───────────────┼───────────────┐
    │               │               │
    ▼               ▼               ▼
Edit Action    Preview Action   Delete Action
    │               │               │
    ▼               ▼               ▼
Navigate to    Show Preview    Show Delete
Edit Page        Modal           Modal
                    ↓               ↓
            ArenaPreviewModal  DeleteConfirmModal
                    │               │
                    ▼               ▼
                Edit/Close      Confirm/Cancel
                    │               │
                    └───────┬───────┘
                            ▼
                    Update Page State
                            ▼
                    Refetch Data (if needed)
```

## 🎨 Styling Architecture

### Color Themes

#### Beyblade Types

```
Attack  → Red    (bg-red-50, text-red-600, bg-red-500)
Defense → Blue   (bg-blue-50, text-blue-600, bg-blue-500)
Stamina → Green  (bg-green-50, text-green-600, bg-green-500)
Balance → Purple (bg-purple-50, text-purple-600, bg-purple-500)
```

#### Arena Themes

```
Forest       → Green  (bg-green-600)
Mountains    → Gray   (bg-gray-600)
Grasslands   → Green  (bg-green-500)
Metro City   → Blue   (bg-blue-600)
Safari       → Yellow (bg-yellow-600)
Prehistoric  → Amber  (bg-amber-700)
Futuristic   → Purple (bg-purple-600)
Desert       → Orange (bg-orange-500)
Sea          → Cyan   (bg-cyan-600)
Riverbank    → Teal   (bg-teal-600)
```

#### Arena Difficulty

```
Easy     → Green  (bg-green-100, text-green-700)
Medium   → Yellow (bg-yellow-100, text-yellow-700)
Hard     → Orange (bg-orange-100, text-orange-700)
Extreme  → Red    (bg-red-100, text-red-700)
Custom   → Purple (bg-purple-100, text-purple-700)
```

### Modal Themes

```
Light Modals:
- Background: white (bg-white)
- Text: gray-900
- Borders: gray-200

Dark Modals:
- Background: gray-900 (bg-gray-900)
- Secondary: gray-800 (bg-gray-800)
- Text: white
- Borders: gray-700
```

## 📏 Component Sizes

### Card Dimensions

```
BeybladeCard:
- Width: Full (responsive grid)
- Image: 20×20 (5rem)
- Padding: 1.5rem (p-6)

ArenaCard:
- Width: Full (responsive grid)
- Shape Icon: 16×16 (4rem)
- Theme Banner: h-0.5 (2px)
- Padding: 1rem (p-4)
```

### Modal Dimensions

```
BeybladePreviewModal:
- Max Width: 4xl (56rem)
- Max Height: 90vh
- Backdrop: bg-black bg-opacity-70

ArenaPreviewModal:
- Max Width: 5xl (64rem)
- Max Height: 90vh
- Backdrop: bg-black bg-opacity-70

DeleteConfirmModal:
- Max Width: md (28rem)
- Backdrop: bg-black bg-opacity-50
```

## 🔧 Props Interfaces

### BeybladeCard Props

```typescript
interface BeybladeCardProps {
  beyblade: BeybladeStats;
  onImageUploaded: (beybladeId: string, imageUrl: string) => void;
  onPointsOfContactUpdated: (
    beybladeId: string,
    points: BeybladeStats["pointsOfContact"]
  ) => void;
  onPreview: (beyblade: BeybladeStats) => void;
  onDelete: (beyblade: BeybladeStats) => void;
}
```

### BeybladePreviewModal Props

```typescript
interface BeybladePreviewModalProps {
  beyblade: BeybladeStats | null;
  onClose: () => void;
}
```

### ArenaCard Props

```typescript
interface ArenaCardProps {
  arena: ArenaConfig;
  onPreview: (arena: ArenaConfig) => void;
  onDelete: (arena: ArenaConfig) => void;
}
```

### ArenaPreviewModal Props

```typescript
interface ArenaPreviewModalProps {
  arena: ArenaConfig | null;
  onClose: () => void;
}
```

### DeleteConfirmModal Props

```typescript
interface DeleteConfirmModalProps {
  isOpen: boolean;
  itemName: string;
  itemType?: string; // default: "item"
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}
```

## 🚀 Performance Considerations

### Component Optimization

- **Controlled Rendering**: Modals only render when needed (null checks)
- **Callback Stability**: Use `useCallback` in parent for stable function references (recommended)
- **Memoization**: Consider `React.memo` for ArenaCard/BeybladeCard if performance issues arise
- **Lazy Loading**: Image loading optimized with object-contain

### State Management

- **Local State**: Each card manages its own image upload modal state
- **Parent State**: Preview/delete modals managed by page component
- **API Calls**: Fetch data on mount and filter changes only

## 📝 Usage Examples

### Adding a New Entity Type

To add a new entity type (e.g., "Player Card"):

1. **Create Card Component** (`PlayerCard.tsx`):

```typescript
interface PlayerCardProps {
  player: PlayerStats;
  onPreview: (player: PlayerStats) => void;
  onDelete: (player: PlayerStats) => void;
}
```

2. **Create Preview Modal** (`PlayerPreviewModal.tsx`):

```typescript
interface PlayerPreviewModalProps {
  player: PlayerStats | null;
  onClose: () => void;
}
```

3. **Reuse DeleteConfirmModal**:

```tsx
<DeleteConfirmModal
  isOpen={deleteConfirmPlayer !== null}
  itemName={deleteConfirmPlayer?.name || ""}
  itemType="Player"
  isDeleting={isDeleting}
  onConfirm={handleDeleteConfirm}
  onCancel={() => setDeleteConfirmPlayer(null)}
/>
```

4. **Create Management Page** (follow beyblades/arenas pattern)

No need to create a new delete modal - the existing one works for all types!
