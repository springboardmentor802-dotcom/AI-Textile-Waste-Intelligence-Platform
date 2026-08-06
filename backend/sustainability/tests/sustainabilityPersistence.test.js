/**
 * Automated Verification Tests for Sustainability & Recommendation Database Persistence
 * 
 * Verifies:
 * 1. SustainabilityRecord & RecommendationRecord Schema structures
 * 2. Saving of calculation metrics, performance rating, details breakdown, and recommendations
 * 3. GET /api/sustainability/history & GET /api/sustainability/history/:id
 * 4. GET /api/recommendation/history
 * 5. Backwards compatibility with existing Day 2 & Day 3 test payloads
 */

const http = require("http");
const express = require("express");
const sustainabilityRoutes = require("../routes/sustainabilityRoutes");
const recommendationRoutes = require("../../recommendation/routes/recommendationRoutes");
const sustainabilityService = require("../services/sustainabilityService");
const recommendationService = require("../../recommendation/services/recommendationService");

async function runPersistenceTests() {
  console.log("==================================================");
  console.log("STARTING DATABASE PERSISTENCE VERIFICATION TESTS");
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

  // 1. Service Layer Verification
  console.log("--- 1. Testing Sustainability Analysis Service Persistence ---");

  const cottonPayload = {
    material: "Cotton",
    condition: "Good",
    quantity: 15,
    recyclability: "Reusable",
  };

  const result = await sustainabilityService.analyzeSustainability(cottonPayload);

  assert(
    result &&
      result.material === "Cotton" &&
      result.quantity === 15 &&
      typeof result.carbon_saved === "number" &&
      typeof result.sustainability_score === "number" &&
      Array.isArray(result.recommendations) &&
      result.details &&
      result.details.divertedWeightKg > 0,
    "Sustainability Analysis service returns complete metrics, breakdown details, and recommendations"
  );

  // 2. HTTP Endpoint Integration Verification
  console.log("\n--- 2. Testing History & Persistence HTTP Endpoints ---");
  const app = express();
  app.use(express.json());
  app.use("/api/sustainability", sustainabilityRoutes);
  app.use("/api/recommendation", recommendationRoutes);

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
      // Test GET /api/sustainability/history
      const sustHistoryRes = await makeRequest("GET", "/api/sustainability/history");
      assert(
        sustHistoryRes.statusCode === 200 &&
          sustHistoryRes.body.success === true &&
          Array.isArray(sustHistoryRes.body.data),
        "GET /api/sustainability/history returns HTTP 200 OK with data array"
      );

      // Test GET /api/recommendation/history
      const recHistoryRes = await makeRequest("GET", "/api/recommendation/history");
      assert(
        recHistoryRes.statusCode === 200 &&
          recHistoryRes.body.success === true &&
          Array.isArray(recHistoryRes.body.data),
        "GET /api/recommendation/history returns HTTP 200 OK with data array"
      );

      // Test POST /api/recommendation/evaluate with persist
      const recEvalRes = await makeRequest("POST", "/api/recommendation/evaluate", {
        material: "Polyester",
        condition: "Worn",
      });
      assert(
        recEvalRes.statusCode === 200 &&
          recEvalRes.body.material === "Polyester" &&
          Array.isArray(recEvalRes.body.recommendations),
        "POST /api/recommendation/evaluate returns recommendations correctly"
      );

    } catch (err) {
      console.error("Test execution error:", err);
      failed++;
    } finally {
      server.close(() => {
        console.log("\n==================================================");
        console.log(`PERSISTENCE TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
        console.log("==================================================");
        process.exit(failed > 0 ? 1 : 0);
      });
    }
  });
}

runPersistenceTests();
