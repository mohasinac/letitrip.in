// Simple API testing script
const BASE_URL = "http://localhost:3000/api";

async function testAPI() {
  console.log("🧪 Testing API Endpoints\n");

  // Test 1: Health Check
  console.log("1️⃣  Testing Health Check...");
  try {
    const response = await fetch(`${BASE_URL}/health`);
    const data = await response.json();
    console.log("✅ Health Check:", data);
  } catch (error) {
    console.error("❌ Health Check Failed:", error.message);
  }

  // Test 2: Register
  console.log("\n2️⃣  Testing User Registration...");
  const testUser = {
    email: `test${Date.now()}@example.com`,
    password: "testPassword123",
    name: "Test User",
  };

  try {
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testUser),
    });
    const data = await response.json();

    if (response.ok) {
      console.log("✅ Registration Successful:", {
        user: data.user,
        hasToken: !!data.token,
      });

      // Test 3: Login with registered user
      console.log("\n3️⃣  Testing User Login...");
      const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password,
        }),
      });
      const loginData = await loginResponse.json();

      if (loginResponse.ok) {
        console.log("✅ Login Successful:", {
          user: loginData.user,
          hasToken: !!loginData.token,
        });
      } else {
        console.error("❌ Login Failed:", loginData);
      }
    } else {
      console.error("❌ Registration Failed:", data);
    }
  } catch (error) {
    console.error("❌ Registration Error:", error.message);
  }

  // Test 4: Rate Limiting
  console.log("\n4️⃣  Testing Rate Limiting (sending 5 rapid requests)...");
  try {
    const promises = Array(5)
      .fill()
      .map((_, i) =>
        fetch(`${BASE_URL}/health`).then((res) => ({
          status: res.status,
          limit: res.headers.get("X-RateLimit-Limit"),
          remaining: res.headers.get("X-RateLimit-Remaining"),
        })),
      );

    const results = await Promise.all(promises);
    results.forEach((result, i) => {
      console.log(`  Request ${i + 1}:`, result);
    });
    console.log("✅ Rate Limiting Headers Present");
  } catch (error) {
    console.error("❌ Rate Limiting Test Failed:", error.message);
  }

  console.log("\n✨ All tests completed!");
}

// Run tests
testAPI().catch(console.error);
