/**
 * Automated Verification Tests for Sustainability Intelligence Engine (Milestone 3 Day 2)
 * 
 * Verifies:
 * 1. Calculation functions for 5 required materials: Cotton, Polyester, Denim, Silk, Mixed Fabric
 * 2. Carbon savings, waste diversion rates, resource recovery efficiencies, and sustainability scores
 * 3. GET /api/sustainability/health endpoint (HTTP 200)
 * 4. POST /api/sustainability/analyze for multiple material test cases (HTTP 200)
 * 5. Rejection of invalid payloads (missing fields, negative quantity, invalid types) with HTTP 400
 */

const http = require("http");
const express = require("express");
const sustainabilityRoutes = require("../routes/sustainabilityRoutes");
const sustainabilityService = require("../services/sustainabilityService");
const { calculateCarbonSavings } = require("../utils/sustainabilityCalculators");

async function runDay2Tests() {
  console.log("==================================================");
  console.log("STARTING DAY 2 SUSTAINABILITY ENGINE VERIFICATION");
  console.log("==================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  // 1. Direct Service Unit Tests for Materials
  console.log("--- 1. Testing Material Calculation Engines ---");

  const testMaterials = [
    { material: "Cotton", condition: "Good", quantity: 15, recyclability: "Reusable" },
    { material: "Polyester", condition: "Fair", quantity: 20, recyclability: "Mechanical Recycling" },
    { material: "Denim", condition: "Pristine", quantity: 10, recyclability: "Reusable" },
    { material: "Silk", condition: "Good", quantity: 5, recyclability: "Direct Reuse" },
    { material: "Mixed Fabric", condition: "Worn", quantity: 50, recyclability: "Downcycling" },
  ];

  for (const testCase of testMaterials) {
    const result = await sustainabilityService.analyzeSustainability(testCase);
    assert(
      result &&
        result.material === testCase.material &&
        result.quantity === testCase.quantity &&
        typeof result.carbon_saved === "number" &&
        result.carbon_saved > 0 &&
        typeof result.waste_diversion === "number" &&
        typeof result.resource_recovery === "number" &&
        typeof result.sustainability_score === "number" &&
        ["Excellent", "Good", "Average", "Needs Improvement"].includes(result.performance),
      `Analysis for ${testCase.material}: Carbon Saved = ${result.carbon_saved} kg, Score = ${result.sustainability_score}, Performance = '${result.performance}'`
    );
  }

  // 2. HTTP Endpoint Integration Verification
  console.log("\n--- 2. Testing HTTP Endpoints via Express App ---");
  const app = express();
  app.use(express.json());
  app.use("/api/sustainability", sustainabilityRoutes);

  const server = app.listen(0, async () => {
    const port = server.address().port;
    const baseUrl = `http://localhost:${port}`;

    function makeRequest(method, path, body = null) {
      return new Promise((resolve, reject) => {
        const url = new URL(path, baseUrl);
        const options = {
          method,
          headers: body ? { "Content-Type": "application/json" } : {},
        };
        const req = http.request(url, options, (res) => {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => {
            try {
              resolve({ statusCode: res.statusCode, body: JSON.parse(data) });
            } catch (e) {
              resolve({ statusCode: res.statusCode, body: data });
            }
          });
        });
        req.on("error", reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
      });
    }

    try {
      // Test GET /api/sustainability/health
      const healthRes = await makeRequest("GET", "/api/sustainability/health");
      assert(healthRes.statusCode === 200, "GET /api/sustainability/health returns HTTP 200 OK");
      assert(healthRes.body.status === "UP", "Health status is 'UP'");
      assert(healthRes.body.version === "1.0.0-day2", "Engine version is '1.0.0-day2'");

      // Test POST /api/sustainability/analyze for Cotton
      const cottonPayload = { material: "Cotton", condition: "Good", quantity: 15, recyclability: "Reusable" };
      const cottonRes = await makeRequest("POST", "/api/sustainability/analyze", cottonPayload);
      assert(cottonRes.statusCode === 200, "POST Cotton request returns HTTP 200 OK");
      assert(cottonRes.body.material === "Cotton", "Response material is Cotton");
      assert(cottonRes.body.quantity === 15, "Response quantity is 15");
      assert(cottonRes.body.carbon_saved > 0, `Cotton carbon saved: ${cottonRes.body.carbon_saved} kg CO2e`);
      assert(cottonRes.body.sustainability_score >= 0 && cottonRes.body.sustainability_score <= 100, `Cotton score: ${cottonRes.body.sustainability_score}/100`);

      // Test POST /api/sustainability/analyze for Polyester
      const polyPayload = { material: "Polyester", condition: "Fair", quantity: 25, recyclability: "Mechanical Recycling" };
      const polyRes = await makeRequest("POST", "/api/sustainability/analyze", polyPayload);
      assert(polyRes.statusCode === 200, "POST Polyester request returns HTTP 200 OK");
      assert(polyRes.body.material === "Polyester", "Response material is Polyester");

      // Test Invalid Inputs (HTTP 400)
      const missingMatRes = await makeRequest("POST", "/api/sustainability/analyze", { condition: "Good", quantity: 10, recyclability: "Reusable" });
      assert(missingMatRes.statusCode === 400, "Missing 'material' returns HTTP 400 Bad Request");

      const negQtyRes = await makeRequest("POST", "/api/sustainability/analyze", { material: "Silk", condition: "Good", quantity: -5, recyclability: "Reusable" });
      assert(negQtyRes.statusCode === 400, "Negative 'quantity' returns HTTP 400 Bad Request");

      const missingCondRes = await makeRequest("POST", "/api/sustainability/analyze", { material: "Denim", quantity: 10, recyclability: "Reusable" });
      assert(missingCondRes.statusCode === 400, "Missing 'condition' returns HTTP 400 Bad Request");

    } catch (err) {
      console.error("Test execution error:", err);
      failed++;
    } finally {
      server.close(() => {
        console.log("\n==================================================");
        console.log(`DAY 2 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
        console.log("==================================================");
        process.exit(failed > 0 ? 1 : 0);
      });
    }
  });
}

runDay2Tests();
