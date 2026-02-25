/**
 * Addresses Seed Data
 * Sample user addresses for development and testing
 *
 * Addresses stored as subcollection: users/{userId}/addresses/{addressId}
 * All address documents mapped to users that exist in users-seed-data.ts.
 */

export interface AddressSeedData {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string; // Parent user reference
}

export const addressesSeedData: AddressSeedData[] = [
  // ============================================
  // John Doe's Addresses
  // ============================================
  {
    id: "addr-john-home-1707400001",
    userId: "user-john-doe-johndoe",
    label: "Home",
    fullName: "John Doe",
    phone: "+919876543211",
    addressLine1: "Flat 302, Crystal Towers",
    addressLine2: "MG Road, Andheri East",
    city: "Mumbai",
    state: "Maharashtra",
    postalCode: "400069",
    country: "India",
    isDefault: true,
    createdAt: new Date("2024-02-15T08:30:00Z"),
    updatedAt: new Date("2024-02-15T08:30:00Z"),
  },
  {
    id: "addr-john-office-1707400002",
    userId: "user-john-doe-johndoe",
    label: "Office",
    fullName: "John Doe",
    phone: "+919876543211",
    addressLine1: "Tech Park, 5th Floor",
    addressLine2: "Powai Link Road",
    city: "Mumbai",
    state: "Maharashtra",
    postalCode: "400076",
    country: "India",
    isDefault: false,
    createdAt: new Date("2024-03-01T10:00:00Z"),
    updatedAt: new Date("2024-03-01T10:00:00Z"),
  },
  {
    id: "addr-john-parents-1707400003",
    userId: "user-john-doe-johndoe",
    label: "Parents' Home",
    fullName: "Rakesh Doe",
    phone: "+912066554433",
    addressLine1: "House No. 45, Sector 12",
    addressLine2: "Near Central Park",
    landmark: "Opposite State Bank",
    city: "Pune",
    state: "Maharashtra",
    postalCode: "411038",
    country: "India",
    isDefault: false,
    createdAt: new Date("2024-04-10T14:00:00Z"),
    updatedAt: new Date("2024-04-10T14:00:00Z"),
  },

  // ============================================
  // Jane Smith's Addresses
  // ============================================
  {
    id: "addr-jane-home-1707400004",
    userId: "user-jane-smith-janes",
    label: "Home",
    fullName: "Jane Smith",
    phone: "+919876543212",
    addressLine1: "Villa 23, Whitefield Gardens",
    addressLine2: "Marathahalli",
    city: "Bangalore",
    state: "Karnataka",
    postalCode: "560037",
    country: "India",
    isDefault: true,
    createdAt: new Date("2024-03-10T10:00:00Z"),
    updatedAt: new Date("2024-03-10T10:00:00Z"),
  },
  {
    id: "addr-jane-work-1707400005",
    userId: "user-jane-smith-janes",
    label: "Work",
    fullName: "Jane Smith",
    phone: "+919876543212",
    addressLine1: "Block C, Tech Hub",
    addressLine2: "Outer Ring Road",
    city: "Bangalore",
    state: "Karnataka",
    postalCode: "560103",
    country: "India",
    isDefault: false,
    createdAt: new Date("2024-04-05T09:00:00Z"),
    updatedAt: new Date("2024-04-05T09:00:00Z"),
  },

  // ============================================
  // Mike Johnson's Addresses
  // ============================================
  {
    id: "addr-mike-home-1707400006",
    userId: "user-mike-johnson-mikejohn",
    label: "Home",
    fullName: "Mike Johnson",
    phone: "+919876543213",
    addressLine1: "78, MG Road",
    addressLine2: "Brigade Road Area",
    landmark: "Near Forum Mall",
    city: "Bangalore",
    state: "Karnataka",
    postalCode: "560001",
    country: "India",
    isDefault: true,
    createdAt: new Date("2024-04-20T14:15:00Z"),
    updatedAt: new Date("2024-04-20T14:15:00Z"),
  },
  {
    id: "addr-mike-shipping-1707400007",
    userId: "user-mike-johnson-mikejohn",
    label: "Alternative Shipping",
    fullName: "Mike Johnson",
    phone: "+919876543213",
    addressLine1: "56, Indiranagar 100ft Road",
    addressLine2: "Near CMH Hospital",
    city: "Bangalore",
    state: "Karnataka",
    postalCode: "560038",
    country: "India",
    isDefault: false,
    createdAt: new Date("2025-01-10T11:00:00Z"),
    updatedAt: new Date("2025-01-10T11:00:00Z"),
  },

  // ============================================
  // Priya Sharma's Addresses
  // ============================================
  {
    id: "addr-priya-home-1707400008",
    userId: "user-priya-sharma-priya",
    label: "Home",
    fullName: "Priya Sharma",
    phone: "+919876543260",
    addressLine1: "34, Banjara Hills",
    addressLine2: "Road No. 12",
    landmark: "Near Café Coffee Day",
    city: "Hyderabad",
    state: "Telangana",
    postalCode: "500034",
    country: "India",
    isDefault: true,
    createdAt: new Date("2025-03-15T00:00:00Z"),
    updatedAt: new Date("2025-03-15T00:00:00Z"),
  },
  {
    id: "addr-priya-work-1707400009",
    userId: "user-priya-sharma-priya",
    label: "Office",
    fullName: "Priya Sharma",
    phone: "+919876543260",
    addressLine1: "DLF Cyber City, Tower 11",
    addressLine2: "HITEC City",
    city: "Hyderabad",
    state: "Telangana",
    postalCode: "500081",
    country: "India",
    isDefault: false,
    createdAt: new Date("2025-04-01T09:00:00Z"),
    updatedAt: new Date("2025-04-01T09:00:00Z"),
  },

  // ============================================
  // Raj Patel's Addresses
  // ============================================
  {
    id: "addr-raj-home-1707400010",
    userId: "user-raj-patel-rajpatel",
    label: "Home",
    fullName: "Raj Patel",
    phone: "+919876543270",
    addressLine1: "12, MG Road",
    addressLine2: "Navrangpura",
    city: "Ahmedabad",
    state: "Gujarat",
    postalCode: "380009",
    country: "India",
    isDefault: true,
    createdAt: new Date("2025-05-20T00:00:00Z"),
    updatedAt: new Date("2025-05-20T00:00:00Z"),
  },
  {
    id: "addr-raj-business-1707400011",
    userId: "user-raj-patel-rajpatel",
    label: "Business",
    fullName: "Raj Patel Enterprises",
    phone: "+912712233445",
    addressLine1: "Shop 45, GIDC Industrial Estate",
    addressLine2: "Phase 2, Vatva",
    city: "Ahmedabad",
    state: "Gujarat",
    postalCode: "382445",
    country: "India",
    isDefault: false,
    createdAt: new Date("2025-06-15T10:00:00Z"),
    updatedAt: new Date("2025-06-15T10:00:00Z"),
  },

  // ============================================
  // Meera Nair's Addresses
  // ============================================
  {
    id: "addr-meera-home-1707400012",
    userId: "user-meera-nair-meera",
    label: "Home",
    fullName: "Meera Nair",
    phone: "+919876543280",
    addressLine1: "88/4, MG Road",
    addressLine2: "Near Broadway",
    landmark: "Opposite Ernakulam Junction",
    city: "Kochi",
    state: "Kerala",
    postalCode: "682001",
    country: "India",
    isDefault: true,
    createdAt: new Date("2025-08-01T00:00:00Z"),
    updatedAt: new Date("2025-08-01T00:00:00Z"),
  },
  {
    id: "addr-meera-parents-1707400013",
    userId: "user-meera-nair-meera",
    label: "Parents",
    fullName: "Suresh Nair",
    phone: "+914842334455",
    addressLine1: "TC 25/1104, Pulimoodu",
    addressLine2: "Near Padmatheertham",
    city: "Thiruvananthapuram",
    state: "Kerala",
    postalCode: "695001",
    country: "India",
    isDefault: false,
    createdAt: new Date("2025-09-10T08:00:00Z"),
    updatedAt: new Date("2025-09-10T08:00:00Z"),
  },

  // ============================================
  // Moderator's Address
  // ============================================
  {
    id: "addr-mod-primary-1707400014",
    userId: "user-moderator-mod-user",
    label: "Primary",
    fullName: "Content Moderator",
    phone: "+919876543220",
    addressLine1: "LetItRip Office, 9th Floor",
    addressLine2: "BKC, G Block",
    city: "Mumbai",
    state: "Maharashtra",
    postalCode: "400051",
    country: "India",
    isDefault: true,
    createdAt: new Date("2024-03-01T00:00:00Z"),
    updatedAt: new Date("2024-03-01T00:00:00Z"),
  },

  // ============================================
  // Admin User's Address
  // ============================================
  {
    id: "addr-admin-primary-1707400017",
    userId: "user-admin-user-admin",
    label: "Primary",
    fullName: "Admin User",
    phone: "+919876543210",
    addressLine1: "LetItRip HQ, 10th Floor",
    addressLine2: "BKC, G Block",
    city: "Mumbai",
    state: "Maharashtra",
    postalCode: "400051",
    country: "India",
    isDefault: true,
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z"),
  },
];
