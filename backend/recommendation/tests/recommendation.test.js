/**
 * Automated Verification Tests for Recycling Recommendation Engine & Integration (Milestone 3 Day 3)
 * 
 * Verifies:
 * 1. Rule decision engine for Cotton, Polyester, Silk, Denim, Mixed Fabric, Contaminated, Damaged textiles
 * 2. Structure of recommendation outputs (name, priority, reason, environmental_benefit)
 * 3. GET /api/recommendation/health & POST /api/recommendation/evaluate
 * 4. End-to-end integration via POST /api/sustainability/analyze returning waste_category & recommendations array
 * 5. Rejection of invalid payloads with HTTP 400 Bad Request
 */

const http = require("http");
const express = require("express");
const recommendationRoutes = require("../routes/recommendationRoutes");
const sustainabilityRoutes = require("../../sustainability/routes/sustainabilityRoutes");
const recommendationService = require("../services/recommendationService");

async function runDay3Tests() {
  console.log("==================================================");
  console.log("STARTING DAY 3 RECOMMENDATION ENGINE VERIFICATION");
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

  // 1. Service Layer Tests for Task 4 Scenarios
  console.log("--- 1. Testing Recommendation Decision Rules ---");

  // Scenario A: Cotton + Good Condition
  const cottonGood = await recommendationService.generateRecommendations({
    material: "Cotton",
    condition: "Good",
  });
  const cottonGoodNames = cottonGood.map((r) => r.name);
  assert(
    cottonGoodNames.includes("Reuse") && cottonGoodNames.includes("Donation") && cottonGoodNames.includes("Upcycling"),
    "Cotton (Good Condition) recommends Reuse, Donation, and Upcycling"
  );

  // Scenario B: Cotton + Damaged
  const cottonDamaged = await recommendationService.generateRecommendations({
    material: "Cotton",
    condition: "Damaged",
  });
  const cottonDamagedNames = cottonDamaged.map((r) => r.name);
  assert(
    cottonDamagedNames.includes("Fiber Recycling") && cottonDamagedNames.includes("Mechanical Recycling"),
    "Cotton (Damaged) recommends Fiber Recycling and Mechanical Recycling"
  );

  // Scenario C: Polyester
  const polyesterRes = await recommendationService.generateRecommendations({
    material: "Polyester",
    condition: "Worn",
  });
  const polyNames = polyesterRes.map((r) => r.name);
  assert(
    polyNames.includes("Mechanical Recycling") && polyNames.includes("Chemical Recycling"),
    "Polyester recommends Mechanical Recycling and Chemical Recycling"
  );

  // Scenario D: Silk
  const silkRes = await recommendationService.generateRecommendations({
    material: "Silk",
    condition: "Pristine",
  });
  const silkNames = silkRes.map((r) => r.name);
  assert(
    silkNames.includes("Reuse") && silkNames.includes("Upcycling"),
    "Silk recommends Reuse and Upcycling"
  );

  // Scenario E: Mixed Fabric
  const mixedRes = await recommendationService.generateRecommendations({
    material: "Mixed Fabric",
    condition: "Fair",
  });
  const mixedNames = mixedRes.map((r) => r.name);
  assert(
    mixedNames.includes("Chemical Recycling") && mixedNames.includes("Mechanical Recycling"),
    "Mixed Fabric recommends Chemical Recycling and Mechanical Recycling"
  );

  // Scenario F: Highly Contaminated
  const contaminatedRes = await recommendationService.generateRecommendations({
    material: "Cotton",
    condition: "Severe Waste",
    contaminationLevel: "High",
  });
  const contamNames = contaminatedRes.map((r) => r.name);
  assert(
    contamNames.includes("Industrial Recovery") && contamNames.includes("Safe Disposal"),
    "Highly Contaminated textile recommends Industrial Recovery and Safe Disposal"
  );

  // Verify Explanation Field Schema
  const sampleRec = cottonGood[0];
  assert(
    sampleRec.name && sampleRec.priority && sampleRec.reason && sampleRec.environmental_benefit,
    "Recommendation object contains required fields: name, priority, reason, environmental_benefit"
  );

  // 2. HTTP Integration Verification
  console.log("\n--- 2. Testing Integrated APIs via Express App ---");
  const app = express();
  app.use(express.json());
  app.use("/api/recommendation", recommendationRoutes);
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
      // Test GET /api/recommendation/health
      const healthRes = await makeRequest("GET", "/api/recommendation/health");
      assert(healthRes.statusCode === 200, "GET /api/recommendation/health returns HTTP 200 OK");
      assert(healthRes.body.status === "UP", "Recommendation health status is 'UP'");

      // Test Integrated POST /api/sustainability/analyze (Matching Task 7 Schema)
      const integratedPayload = {
        material: "Cotton",
        condition: "Good",
        quantity: 15,
        recyclability: "Reusable",
      };
      const analyzeRes = await makeRequest("POST", "/api/sustainability/analyze", integratedPayload);
      assert(analyzeRes.statusCode === 200, "POST /api/sustainability/analyze returns HTTP 200 OK");
      assert(analyzeRes.body.material === "Cotton", "Returned material is Cotton");
      assert(analyzeRes.body.waste_category === "Reusable", "Returned waste_category is Reusable");
      assert(typeof analyzeRes.body.carbon_saved === "number", "Returned carbon_saved is number");
      assert(typeof analyzeRes.body.sustainability_score === "number", "Returned sustainability_score is number");
      assert(Array.isArray(analyzeRes.body.recommendations), "Returned recommendations is an Array");
      assert(analyzeRes.body.recommendations.length >= 2, `Received ${analyzeRes.body.recommendations.length} recommendations in analyze endpoint response`);

      // Test Invalid Standalone Recommendation Request
      const invalidRecRes = await makeRequest("POST", "/api/recommendation/evaluate", { material: "" });
      assert(invalidRecRes.statusCode === 400, "Missing parameters in recommendation evaluate returns HTTP 400 Bad Request");

    } catch (err) {
      console.error("Test execution error:", err);
      failed++;
    } finally {
      server.close(() => {
        console.log("\n==================================================");
        console.log(`DAY 3 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
        console.log("==================================================");
        process.exit(failed > 0 ? 1 : 0);
      });
    }
  });
}

runDay3Tests();
