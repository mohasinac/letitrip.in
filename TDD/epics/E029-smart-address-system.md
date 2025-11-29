# Epic E029: Smart Address System

## ⚠️ MANDATORY: Follow Project Standards

Before implementing, read **[AI Agent Development Guide](/docs/ai/AI-AGENT-GUIDE.md)**

**Key Requirements:**

- Database logic in `src/app/api/lib/addresses/` (backend-only)
- Services call APIs via `apiService`, NEVER access database directly
- Use `COLLECTIONS` constant from `src/constants/database.ts`
- FE/BE type separation with transforms

---

## Overview

Implement a comprehensive address system with GPS-based location detection, autocomplete suggestions for area/city/state/country, auto-population from pincode (zip code), and mobile number support per address. This reusable address system will be used across all address forms in the application.

## Scope

- GPS-based location detection
- Address autocomplete using Google Places API
- Pincode-to-location auto-population
- Mobile number per address (like Amazon)
- Reusable address components
- Integration with all address forms in the app

## Address Data Structure

```typescript
interface SmartAddress {
  id: string;
  userId: string;

  // Contact
  fullName: string;
  mobileNumber: string; // Required, with country code
  alternateMobileNumber?: string;

  // Location
  addressLine1: string; // House/Flat/Building
  addressLine2?: string; // Street/Road
  landmark?: string;

  // Area (autocomplete)
  area: string; // Locality/Neighborhood
  city: string;
  district?: string;
  state: string;
  country: string;
  pincode: string;

  // Coordinates
  latitude?: number;
  longitude?: number;

  // Type & Preferences
  type: "home" | "work" | "other" | "custom";
  customLabel?: string; // User-defined label when type is "custom" (e.g., "Mom's House", "Office HQ")
  isDefault: boolean;

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface PincodeData {
  pincode: string;
  area: string;
  city: string;
  district: string;
  state: string;
  country: string;
}
```

---

## Features

### F029.1: GPS Location Detection

**Priority**: P1 (High)

Use device GPS to auto-fill location.

#### User Stories

**US029.1.1**: Use Current Location

```
As a user adding an address
I want to use my current GPS location
So that my address is filled automatically

Acceptance Criteria:
- "Use Current Location" button in form
- Requests location permission
- Shows loading indicator while detecting
- Reverse geocodes to get address components
- Auto-fills area, city, state, country, pincode
- Shows detected address on map
- User can adjust if incorrect
- Falls back to manual entry if GPS fails
- Works on mobile and desktop
```

**US029.1.2**: Pin Location on Map

```
As a user
I want to pin my exact location on a map
So that delivery is accurate

Acceptance Criteria:
- Interactive map in address form
- Draggable pin marker
- Updates address as pin moves
- Shows approximate address
- Zoom in/out controls
- Search box to jump to location
- Works on mobile with touch
```

---

### F029.2: Address Autocomplete

**Priority**: P0 (Critical)

Autocomplete suggestions for address components.

#### User Stories

**US029.2.1**: Area Autocomplete

```
As a user typing area/locality
I want autocomplete suggestions
So that I can quickly select my area

Acceptance Criteria:
- Suggestions appear after 2 characters
- Shows area name and parent location
- Filters by current city if selected
- Handles typos with fuzzy matching
- Touch-friendly dropdown on mobile
- Keyboard navigation support
- Max 5-7 suggestions shown
```

**US029.2.2**: City Autocomplete

```
As a user typing city
I want city suggestions
So that I select the correct city

Acceptance Criteria:
- Shows city and state
- Filters by current state if selected
- Shows popular cities first
- Handles common misspellings
```

**US029.2.3**: State/Country Autocomplete

```
As a user selecting state/country
I want searchable dropdowns
So that I can quickly find my location

Acceptance Criteria:
- Searchable select/dropdown
- Shows all Indian states
- Country defaults to India
- Other countries supported for future
```

---

### F029.3: Pincode Auto-Population

**Priority**: P0 (Critical)

Auto-fill location from pincode.

#### User Stories

**US029.3.1**: Pincode Lookup

```
As a user entering pincode
I want area/city/state auto-filled
So that I save typing time

Acceptance Criteria:
- After 6 digits entered, lookup triggers
- Shows loading indicator during lookup
- Populates area, city, state, country
- If multiple areas, shows dropdown to select
- Works for all Indian pincodes
- Fallback to API if local data missing
- Error handling for invalid pincodes
```

**US029.3.2**: Reverse Population

```
As a user selecting area/city/state
I want pincode auto-filled if known
So that I don't have to remember it

Acceptance Criteria:
- When area selected, suggest pincode
- If unique pincode for area, auto-fill
- If multiple pincodes, show options
```

---

### F029.4: Mobile Number Per Address

**Priority**: P0 (Critical)

Each address has its own contact number.

#### User Stories

**US029.4.1**: Mobile Number Field

```
As a user adding an address
I want to add a contact number
So that delivery can reach that person

Acceptance Criteria:
- Mobile number required field
- Country code selector (+91 default)
- Validates Indian mobile format
- Optional alternate number field
- Number shown in address display
- Different from account mobile allowed
```

**US029.4.2**: Call/WhatsApp Actions

```
As a seller/delivery person viewing address
I want to call/WhatsApp the contact
So that I can communicate about delivery

Acceptance Criteria:
- Click-to-call button on address
- WhatsApp button if applicable
- Shows mobile number clearly
- Works on mobile devices
```

---

### F029.5: Reusable Address Components

**Priority**: P0 (Critical)

Create modular, reusable address components.

#### Components to Create

| Component             | Description                           | Status  |
| --------------------- | ------------------------------------- | ------- |
| `AddressForm`         | Complete address form with all fields | 🔲 Todo |
| `AddressAutocomplete` | Generic autocomplete input            | 🔲 Todo |
| `PincodeInput`        | Pincode with auto-lookup              | 🔲 Todo |
| `MobileInput`         | Phone input with country code         | 🔲 Todo |
| `LocationPicker`      | Map with draggable pin                | 🔲 Todo |
| `GPSButton`           | Get current location button           | 🔲 Todo |
| `AddressCard`         | Display saved address                 | 🔲 Todo |
| `AddressList`         | List of saved addresses               | 🔲 Todo |
| `AddressSelector`     | Select from saved + add new           | 🔲 Todo |
| `StateSelector`       | Searchable state dropdown             | 🔲 Todo |
| `CountrySelector`     | Searchable country dropdown           | 🔲 Todo |
| `AddressTypeSelector` | Home/Work/Other/Custom toggle         | 🔲 Todo |
| `AddressLabelInput`   | Custom label input for "Other" type   | 🔲 Todo |

#### User Stories

**US029.5.1**: Unified Address Form

```
As a developer
I want a single AddressForm component
So that address input is consistent across the app

Acceptance Criteria:
- Works in user addresses
- Works in checkout
- Works in seller shop address
- Works in return pickup address
- Works in product origin address
- Supports all features (GPS, autocomplete, pincode)
- Mobile-optimized
- Accessible
```

**US029.5.2**: Custom Address Labels

```
As a user saving an address
I want to give it a custom label
So that I can easily identify it later

Acceptance Criteria:
- Default options: Home, Work, Other
- When "Other" selected, show text input for custom label
- Custom labels like "Mom's House", "Office HQ", "Warehouse"
- Label shown prominently on address card
- Labels are searchable in address selector
- Maximum 50 characters for custom labels
- Labels can be edited later
```

---

### F029.6: Integration Points

**Priority**: P1 (High)

Integrate smart address across the application.

#### Integration Locations

| Location                         | Current State   | Update Needed           |
| -------------------------------- | --------------- | ----------------------- |
| User Addresses `/user/addresses` | Basic form      | Full smart address      |
| Checkout Address                 | Basic form      | Smart address + GPS     |
| Seller Shop Address              | Basic form      | Smart address           |
| Product Origin (seller)          | Not implemented | New: Product ships from |
| Return Pickup Address            | Basic form      | Smart address           |
| Admin User Edit                  | Basic form      | Smart address           |
| Order Shipping Address           | Display only    | Show with mobile        |

---

## External Services

### Google Places API

```typescript
// For autocomplete and reverse geocoding
const autocompleteService = new google.maps.places.AutocompleteService();
const geocoder = new google.maps.Geocoder();

// Autocomplete
autocompleteService.getPlacePredictions({
  input: searchText,
  types: ["geocode"],
  componentRestrictions: { country: "in" },
});

// Reverse geocoding
geocoder.geocode({ location: { lat, lng } });
```

### India Pincode API

```typescript
// Free API for pincode lookup
// Option 1: India Post API (official)
// Option 2: Third-party API (postal.in, etc.)

interface PincodeResponse {
  status: 'Success' | 'Error';
  postOffice: {
    name: string;      // Area
    district: string;
    state: string;
    country: 'India';
  }[];
}

// Example endpoint
GET https://api.postalpincode.in/pincode/{pincode}
```

---

## Implementation Checklist

### Phase 1: Core Components (Week 1)

- [ ] Create AddressAutocomplete component
- [ ] Create PincodeInput with lookup
- [ ] Create MobileInput with country code
- [ ] Create StateSelector component
- [ ] Create CountrySelector component
- [ ] Set up Google Places API
- [ ] Set up pincode lookup service

### Phase 2: Location Features (Week 1-2)

- [ ] Create GPSButton component
- [ ] Implement reverse geocoding
- [ ] Create LocationPicker with map
- [ ] Handle location permissions
- [ ] Error handling for GPS failures

### Phase 3: Address Form (Week 2)

- [ ] Create unified AddressForm
- [ ] Wire up all autocomplete fields
- [ ] Implement pincode auto-population
- [ ] Mobile number validation
- [ ] Address type selector
- [ ] Form validation

### Phase 4: Display Components (Week 2-3)

- [ ] Create AddressCard component
- [ ] Create AddressList component
- [ ] Create AddressSelector component
- [ ] Call/WhatsApp buttons

### Phase 5: Integrations (Week 3-4)

- [ ] Integrate in User Addresses
- [ ] Integrate in Checkout
- [ ] Integrate in Seller Shop
- [ ] Integrate in Returns
- [ ] Integrate in Admin
- [ ] Mobile optimization

### Phase 6: Testing (Week 4)

- [ ] Unit tests for components
- [ ] Integration tests
- [ ] E2E tests
- [ ] Performance testing
- [ ] Accessibility testing

---

## API Endpoints

### Address Management

```
GET    /api/addresses                  # List user addresses
POST   /api/addresses                  # Create address
GET    /api/addresses/:id              # Get address
PATCH  /api/addresses/:id              # Update address
DELETE /api/addresses/:id              # Delete address
PATCH  /api/addresses/:id/default      # Set as default
```

### Location Services

```
GET    /api/location/pincode/:pincode  # Lookup pincode
GET    /api/location/geocode           # Reverse geocode (lat/lng)
GET    /api/location/autocomplete      # Proxy to Google Places
```

---

## Acceptance Criteria

- [ ] GPS location detection works on mobile
- [ ] Address autocomplete provides relevant suggestions
- [ ] Pincode auto-fills area/city/state
- [ ] Mobile number is required and validated
- [ ] Address form is reusable across all contexts
- [ ] Map pin location works
- [ ] All address forms use the new components
- [ ] Works offline with cached pincode data
- [ ] Accessible with keyboard navigation

---

## Dependencies

- Google Places API Key
- Pincode data source/API
- E001: User Management
- E005: Order Management

## Related Epics

- E004: Shopping Cart (checkout address)
- E009: Returns (pickup address)
- E006: Shop Management (shop address)
- E025: Mobile Component Integration

---

## Test Documentation

**Test Cases**: `TDD/resources/addresses/TEST-CASES.md`
**API Specs**: `TDD/resources/addresses/API-SPECS.md`
