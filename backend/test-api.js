async function test() {
  try {
    console.log("1. Testing POST /api/auth/register with WEAK password (expecting failure)...");
    const weakRes = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Test Weak",
        email: "weak@test.com",
        mobile: "9999999999",
        password: "weak"
      })
    });
    const weakData = await weakRes.json();
    console.log("   Status:", weakRes.status, "- Error Message:", weakData.message);

    console.log("\n2. Testing POST /api/auth/register with STRONG password (expecting success)...");
    const strongRes = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Prithvi Secure",
        email: "secure" + Date.now() + "@test.com",
        mobile: "9999999999",
        password: "Password@123"
      })
    });
    const strongData = await strongRes.json();
    console.log("   Status:", strongRes.status, "- Success Message:", strongData.message);

    console.log("\nPassword Criteria Test Completed Successfully!");
  } catch (err) {
    console.error("Test failed:", err);
  }
}

test();
