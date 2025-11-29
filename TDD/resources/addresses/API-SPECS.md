# Smart Address System API Specifications

## E029: Smart Address System

### Address Data Structure

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

  // Labels
  label?: string; // Custom label (e.g., "Mom's House")
  type: "home" | "work" | "other";
  isDefault: boolean;

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

## Endpoints

### List User Addresses

```
GET /api/addresses
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": [
    {
      "id": "addr_123",
      "fullName": "John Doe",
      "mobileNumber": "+919876543210",
      "addressLine1": "Flat 101, Green Tower",
      "addressLine2": "MG Road",
      "landmark": "Near City Mall",
      "area": "Koramangala",
      "city": "Bangalore",
      "district": "Bangalore Urban",
      "state": "Karnataka",
      "country": "India",
      "pincode": "560034",
      "latitude": 12.9352,
      "longitude": 77.6245,
      "label": null,
      "type": "home",
      "isDefault": true,
      "createdAt": "2025-01-15T10:00:00Z",
      "updatedAt": "2025-01-15T10:00:00Z"
    }
  ]
}
```

### Create Address

```
POST /api/addresses
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "fullName": "John Doe",
  "mobileNumber": "+919876543210",
  "addressLine1": "Flat 101, Green Tower",
  "addressLine2": "MG Road",
  "landmark": "Near City Mall",
  "area": "Koramangala",
  "city": "Bangalore",
  "state": "Karnataka",
  "country": "India",
  "pincode": "560034",
  "latitude": 12.9352,
  "longitude": 77.6245,
  "type": "home",
  "isDefault": false
}

Response:
{
  "success": true,
  "data": {
    "id": "addr_124",
    ...
  }
}
```

### Get Single Address

```
GET /api/addresses/:id
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": { ... }
}
```

### Update Address

```
PATCH /api/addresses/:id
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "addressLine1": "Flat 102, Green Tower",
  "landmark": "Opposite City Mall"
}

Response:
{
  "success": true,
  "data": { ... }
}
```

### Delete Address

```
DELETE /api/addresses/:id
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Address deleted successfully"
}
```

### Set Default Address

```
PATCH /api/addresses/:id/default
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": { ... }
}
```

---

## Location Services

### Pincode Lookup

```
GET /api/location/pincode/:pincode

Response (Success):
{
  "success": true,
  "data": {
    "pincode": "560034",
    "areas": [
      {
        "name": "Koramangala",
        "city": "Bangalore",
        "district": "Bangalore Urban",
        "state": "Karnataka",
        "country": "India"
      },
      {
        "name": "Koramangala 1st Block",
        "city": "Bangalore",
        "district": "Bangalore Urban",
        "state": "Karnataka",
        "country": "India"
      }
    ]
  }
}

Response (Invalid):
{
  "success": false,
  "error": "Invalid pincode",
  "code": "INVALID_PINCODE"
}
```

### Reverse Geocode

```
GET /api/location/geocode?lat=12.9352&lng=77.6245
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "addressLine1": "",
    "addressLine2": "100 Feet Road",
    "area": "Koramangala",
    "city": "Bangalore",
    "district": "Bangalore Urban",
    "state": "Karnataka",
    "country": "India",
    "pincode": "560034",
    "formattedAddress": "100 Feet Road, Koramangala, Bangalore, Karnataka 560034"
  }
}
```

### Autocomplete

```
GET /api/location/autocomplete?input=koraman&types=locality
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": [
    {
      "placeId": "place_123",
      "description": "Koramangala, Bangalore, Karnataka, India",
      "mainText": "Koramangala",
      "secondaryText": "Bangalore, Karnataka, India",
      "types": ["locality", "political"]
    },
    {
      "placeId": "place_124",
      "description": "Koramangala 1st Block, Bangalore, Karnataka, India",
      "mainText": "Koramangala 1st Block",
      "secondaryText": "Bangalore, Karnataka, India",
      "types": ["sublocality"]
    }
  ]
}
```

### Place Details

```
GET /api/location/place/:placeId
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "area": "Koramangala",
    "city": "Bangalore",
    "district": "Bangalore Urban",
    "state": "Karnataka",
    "country": "India",
    "pincode": "560034",
    "latitude": 12.9352,
    "longitude": 77.6245
  }
}
```

---

## Validation Rules

### Mobile Number

- Must include country code (e.g., +91)
- Indian numbers: +91 followed by 10 digits
- First digit after code must be 6-9
- Pattern: `^\+91[6-9]\d{9}$`

### Pincode

- Must be exactly 6 digits
- Pattern: `^\d{6}$`
- Valid range: 110001 - 855999 (India)

### Address Fields

| Field        | Required | Max Length |
| ------------ | -------- | ---------- |
| fullName     | Yes      | 100        |
| mobileNumber | Yes      | 15         |
| addressLine1 | Yes      | 200        |
| addressLine2 | No       | 200        |
| landmark     | No       | 100        |
| area         | Yes      | 100        |
| city         | Yes      | 100        |
| state        | Yes      | 50         |
| country      | Yes      | 50         |
| pincode      | Yes      | 6          |
| label        | No       | 50         |
| type         | Yes      | enum       |

### Indian States

```typescript
const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  // Union Territories
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];
```

---

## External Services

### India Post Pincode API

```
GET https://api.postalpincode.in/pincode/{pincode}

Response:
[
  {
    "Message": "Number of pincode(s) found:2",
    "Status": "Success",
    "PostOffice": [
      {
        "Name": "Koramangala",
        "Description": null,
        "BranchType": "Sub Post Office",
        "DeliveryStatus": "Delivery",
        "Circle": "Karnataka",
        "District": "Bangalore Urban",
        "Division": "Bangalore South",
        "Region": "Bangalore",
        "Block": "Bangalore South",
        "State": "Karnataka",
        "Country": "India",
        "Pincode": "560034"
      }
    ]
  }
]
```

### Google Places API (Proxied)

- Autocomplete: `/api/location/autocomplete`
- Place Details: `/api/location/place/:id`
- Geocode: `/api/location/geocode`
