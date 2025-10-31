# User Address Management Feature

## Overview

Users can now save up to 5 addresses in their profile. These addresses are stored in Firestore and can be used during checkout or delivery.

## Implementation Details

### Database Schema

Addresses are stored in the `users` collection in Firestore under the `addresses` array field:

```typescript
interface Address {
  id: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}
```

### API Endpoints

#### GET /api/user/profile

Retrieves the current user's profile including all saved addresses.

**Headers:**

- `Authorization: Bearer <token>`

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "phone": "9876543210",
    "role": "user",
    "addresses": [...]
  }
}
```

#### PUT /api/user/profile

Updates the user's profile including addresses.

**Headers:**

- `Authorization: Bearer <token>`

**Body:**

```json
{
  "name": "Updated Name",
  "phone": "9876543210",
  "addresses": [
    {
      "id": "addr_12345",
      "name": "John Doe",
      "phone": "9876543210",
      "addressLine1": "123 Main St",
      "addressLine2": "Apt 4B",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001",
      "country": "India",
      "isDefault": true
    }
  ]
}
```

### Components

#### AddressManager

Location: `src/components/profile/AddressManager.tsx`

A comprehensive component that handles:

- Displaying saved addresses
- Adding new addresses (up to 5)
- Editing existing addresses
- Deleting addresses
- Setting default address
- Form validation

**Usage:**

```tsx
import AddressManager from "@/components/profile/AddressManager";

<AddressManager
  addresses={user.addresses || []}
  onUpdate={handleUpdateAddresses}
  maxAddresses={5}
/>;
```

### Validation Rules

1. **Name**: Minimum 2 characters
2. **Phone**: Exactly 10 digits
3. **Address Line 1**: Minimum 5 characters (required)
4. **Address Line 2**: Optional
5. **City**: Minimum 2 characters (required)
6. **State**: Minimum 2 characters (required)
7. **Pincode**: Exactly 6 digits (required)
8. **Country**: Default "India"
9. **Maximum Addresses**: 5 per user
10. **Default Address**: Only one address can be set as default

### Features

1. **Add Address**: Users can add a new address with full validation
2. **Edit Address**: Users can modify existing addresses
3. **Delete Address**: Users can remove addresses with confirmation
4. **Set Default**: Users can mark one address as default for quick checkout
5. **Visual Indicators**: Default address is highlighted with a star badge
6. **Responsive Design**: Works on mobile, tablet, and desktop
7. **Real-time Updates**: Changes are immediately reflected in the UI

### User Flow

1. User navigates to Profile page (`/profile`)
2. Scrolls to "Saved Addresses" section
3. Can:
   - View all saved addresses (up to 5)
   - Click "Add Address" to add a new address
   - Click "Edit" on any address to modify it
   - Click "Delete" to remove an address
   - Click "Set as Default" to mark an address as default
4. Changes are saved to Firestore via API
5. Toast notifications confirm success/failure

### Integration Points

The address feature is integrated into:

- User Profile Page (`/profile`)
- Checkout Flow (can be extended)
- Order Management (shipping address)

### Future Enhancements

1. Address type (Home, Office, Other)
2. GPS coordinates for delivery
3. Address validation via postal service API
4. Address nicknames ("Home", "Office", etc.)
5. Recent addresses suggestion
6. Bulk address import
