import { NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";

const DEMO_PREFIX = "DEMO_";

const INDIAN_FIRST_NAMES = [
  "Aarav", "Vivaan", "Aditya", "Arjun", "Sai", "Krishna", "Ishaan", "Rohan", "Rahul", "Ravi",
  "Ananya", "Aadhya", "Diya", "Priya", "Kavya", "Saanvi", "Anika", "Pari", "Myra", "Sara",
  "Amit", "Suresh", "Vikram", "Karan", "Akash", "Nikhil", "Sanjay", "Raj", "Dev", "Jay",
  "Pooja", "Neha", "Shreya", "Anjali", "Ritika", "Meera", "Nisha", "Sneha", "Divya", "Tanvi",
  "Om", "Ved", "Yash", "Aryan", "Dhruv", "Kabir", "Shaurya", "Rehan", "Zain", "Ali",
];

const INDIAN_LAST_NAMES = [
  "Sharma", "Verma", "Gupta", "Singh", "Kumar", "Patel", "Shah", "Joshi", "Iyer", "Nair",
  "Reddy", "Rao", "Menon", "Pillai", "Agarwal", "Banerjee", "Das", "Ghosh", "Sen", "Malhotra",
];

const INDIAN_CITIES = [
  { city: "Mumbai", state: "Maharashtra", pincode: "400001" },
  { city: "Delhi", state: "Delhi", pincode: "110001" },
  { city: "Bangalore", state: "Karnataka", pincode: "560001" },
  { city: "Chennai", state: "Tamil Nadu", pincode: "600001" },
  { city: "Kolkata", state: "West Bengal", pincode: "700001" },
  { city: "Pune", state: "Maharashtra", pincode: "411001" },
  { city: "Ahmedabad", state: "Gujarat", pincode: "380001" },
  { city: "Hyderabad", state: "Telangana", pincode: "500001" },
  { city: "Jaipur", state: "Rajasthan", pincode: "302001" },
  { city: "Lucknow", state: "Uttar Pradesh", pincode: "226001" },
];

const STREETS = ["Marine Drive", "MG Road", "Park Street", "Anna Salai", "FC Road", "Brigade Road", "Linking Road", "Gandhi Nagar", "Civil Lines", "Mall Road"];

// Role distribution for 100 users
const USER_ROLES = { admin: 2, moderator: 3, support: 5, seller: 50, user: 40 };

export async function POST() {
  try {
    const db = getFirestoreAdmin();
    const timestamp = new Date();
    const createdUsers: Array<{ id: string; role: string; name: string; email: string; password: string }> = [];

    let userIndex = 0;
    for (const [role, count] of Object.entries(USER_ROLES)) {
      for (let i = 0; i < count; i++) {
        const firstName = INDIAN_FIRST_NAMES[userIndex % INDIAN_FIRST_NAMES.length];
        const lastName = INDIAN_LAST_NAMES[userIndex % INDIAN_LAST_NAMES.length];
        const fullName = `${firstName} ${lastName}`;
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${userIndex}@demo.justforview.in`;
        const city = INDIAN_CITIES[userIndex % INDIAN_CITIES.length];

        const userRef = db.collection(COLLECTIONS.USERS).doc();
        await userRef.set({
          name: `${DEMO_PREFIX}${fullName}`,
          email,
          role,
          isActive: true,
          isVerified: true,
          phone: `+91-${9000000000 + userIndex}`,
          avatar: `https://i.pravatar.cc/150?u=${userRef.id}`,
          addresses: [{
            id: `addr-${userRef.id}-1`,
            street: `${100 + userIndex} ${STREETS[userIndex % STREETS.length]}`,
            city: city.city,
            state: city.state,
            pincode: city.pincode,
            country: "India",
            isDefault: true,
            label: "Home",
          }],
          createdAt: timestamp,
          updatedAt: timestamp,
          passwordHash: "$2a$10$demoHashForTestingOnlyDemo123",
        });

        createdUsers.push({ id: userRef.id, role, name: fullName, email, password: "Demo@123" });
        userIndex++;
      }
    }

    const sellers = createdUsers.filter(u => u.role === "seller");
    const buyers = createdUsers.filter(u => u.role === "user");
    const admins = createdUsers.filter(u => u.role === "admin");
    const moderators = createdUsers.filter(u => u.role === "moderator");
    const supportStaff = createdUsers.filter(u => u.role === "support");

    const credentials = {
      admins: admins.map(u => ({ email: u.email, password: u.password, name: u.name })),
      moderators: moderators.map(u => ({ email: u.email, password: u.password, name: u.name })),
      support: supportStaff.map(u => ({ email: u.email, password: u.password, name: u.name })),
      sellers: sellers.slice(0, 10).map(u => ({ email: u.email, password: u.password, name: u.name })),
      buyers: buyers.slice(0, 10).map(u => ({ email: u.email, password: u.password, name: u.name })),
    };

    return NextResponse.json({
      success: true,
      step: "users",
      data: {
        count: createdUsers.length,
        usersByRole: {
          admins: admins.length,
          moderators: moderators.length,
          support: supportStaff.length,
          sellers: sellers.length,
          buyers: buyers.length,
        },
        sellers: sellers.map(s => ({ id: s.id, name: s.name })),
        buyers: buyers.map(b => ({ id: b.id, name: b.name })),
        credentials,
      },
    });
  } catch (error: unknown) {
    console.error("Demo users error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate users";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
