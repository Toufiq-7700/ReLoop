// ============================================================
// ReLoop — Gemini API Backend (Node.js serverless function)
// Compatible with: Vercel (api/gemini.js), Netlify Functions,
// or as a minimal Express endpoint.
// NEVER expose GEMINI_API_KEY in client-side code.
// ============================================================

const https = require("https");

// ─── CORS helper ──────────────────────────────────────────
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "http://localhost:8080",
  "http://localhost:8085",
  "http://127.0.0.1:8085"
];

function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin) || !origin) {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

// ─── Gemini API call ──────────────────────────────────────
function callGemini(prompt) {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      reject(new Error("GEMINI_API_KEY environment variable is not set."));
      return;
    }

    const body = JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1024
      }
    });

    const options = {
      hostname: "generativelanguage.googleapis.com",
      path: `/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body)
      }
    };

    const req = https.request(options, (res2) => {
      let data = "";
      res2.on("data", (chunk) => (data += chunk));
      res2.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          reject(new Error("Failed to parse Gemini response: " + data.slice(0, 200)));
        }
      });
    });

    req.on("error", reject);
    req.setTimeout(25000, () => {
      req.destroy();
      reject(new Error("Gemini API request timed out."));
    });
    req.write(body);
    req.end();
  });
}

// ─── Build Role-Aware Gemini Prompts ───────────────────────
function buildRolePrompt(role, task, input, hasImage) {
  const baseHeader = `You are the AI engine of ReLoop, a circular economy platform in Bangladesh. 
Your goal is to process role-specific user requests and respond ONLY with valid JSON (no markdown formatting, no text outside JSON).`;

  if (task === "classify-material" || role === "recycler") {
    return `${baseHeader}
Role: Recycler / Material Collector
Task: Classify waste request and match against accepted recyclable materials.
User Request: "${input}"

Respond ONLY with valid JSON in this exact schema:
{
  "likelyMaterial": "e.g. PET Plastic, Cardboard, Aluminum Scrap, Cotton Textile",
  "category": "e.g. Plastic, Paper, Metal, Textile, Glass, Electronics",
  "matchLevel": "High",
  "recommendedAction": "Accept",
  "reason": "1-2 sentence concise explanation of material match and sorting state.",
  "suggestedResponse": "Short 1-sentence friendly confirmation response to user."
}`;
  }

  if (task === "structure-material-request" || role === "industry") {
    return `${baseHeader}
Role: Industry Partner
Task: Convert a natural language raw material requirement into a structured procurement request.
User Input: "${input}"

Respond ONLY with valid JSON in this exact schema:
{
  "material": "Specific material name e.g. PET Plastic Flakes",
  "quantity": "Estimated quantity e.g. 500 kg/month",
  "frequency": "Monthly / One-time / Weekly",
  "priority": "High",
  "description": "2-sentence clear procurement description.",
  "targetPrice": "Estimated price range e.g. ৳ 40-50/kg",
  "keywords": ["tag1", "tag2", "tag3"]
}`;
  }

  if (task === "upcycle-ideas" || role === "maker") {
    return `${baseHeader}
Role: Maker / Upcycler
Task: Generate 3 creative, marketable upcycled product ideas from available raw waste material.
User Input Material: "${input}"

Respond ONLY with valid JSON in this exact schema:
{
  "rawMaterial": "${input}",
  "ideas": [
    {
      "name": "Creative Product Title 1",
      "description": "Short 2-sentence description of the upcycled product.",
      "category": "Handmade",
      "difficulty": "Easy",
      "estimatedPrice": "৳ 450",
      "materialsNeeded": ["Material 1", "Material 2"]
    },
    {
      "name": "Creative Product Title 2",
      "description": "Short 2-sentence description.",
      "category": "Handmade",
      "difficulty": "Medium",
      "estimatedPrice": "৳ 750",
      "materialsNeeded": ["Material 1"]
    },
    {
      "name": "Creative Product Title 3",
      "description": "Short 2-sentence description.",
      "category": "Handmade",
      "difficulty": "Advanced",
      "estimatedPrice": "৳ 1200",
      "materialsNeeded": ["Material 1"]
    }
  ]
}`;
  }

  if (task === "parse-shopping-request" || role === "buyer") {
    return `${baseHeader}
Role: Buyer / Sustainable Shopper
Task: Interpret buyer natural language query and extract structured shopping search preferences.
User Query: "${input}"

Respond ONLY with valid JSON in this exact schema:
{
  "interpretedNeed": "Summary of what the buyer wants",
  "category": "One of: Furniture, Clothing, Plastic, Metal, Glass, Paper, Electronics, Handmade, All",
  "material": "Primary material preferred or 'Any'",
  "pricePreference": "Low / Moderate / Premium",
  "keywords": ["tag1", "tag2", "tag3"]
}`;
  }

  // Default: Individual analyze-item
  return `You are the AI core of ReLoop, a circular economy marketplace in Bangladesh. 
A user has submitted an item description: "${input}".
${hasImage ? "Note: Image attached." : ""}

Respond ONLY with valid JSON in this exact schema:
{
  "itemName": "short name for the item",
  "category": "Furniture, Electronics, Clothing, Plastic, Metal, Glass, Paper, Mixed, Organic, Other",
  "material": "primary material(s)",
  "condition": "New, Good, Fair, Poor, Broken, Unknown",
  "reusability": "High, Medium, Low",
  "recommendedAction": "Sell, Donate, Reuse, Repair, Recycle, Upcycle, Collect",
  "alternativeActions": ["Action 1", "Action 2"],
  "reason": "1-2 sentence explanation",
  "upcyclingIdeas": ["Idea 1", "Idea 2"],
  "listingTitle": "Short marketplace title",
  "listingDescription": "2-sentence listing description",
  "tags": ["tag1", "tag2"],
  "hazardous": false,
  "hazardNote": ""
}`;
}

// ─── Fallback Generators for Offline / Demo Mode ──────────
function getFallbackData(role, task, input) {
  if (role === "recycler" || task === "classify-material") {
    return {
      likelyMaterial: "PET Plastic Bottles",
      category: "Plastic",
      matchLevel: "High",
      recommendedAction: "Accept",
      reason: "This material stream matches your active PET plastic recovery program (clear, sorted bottles).",
      suggestedResponse: "Thank you! We accept this collection request and can schedule pickup within 24 hours."
    };
  }

  if (role === "industry" || task === "structure-material-request") {
    return {
      material: "PET Plastic Bottles / Flakes",
      quantity: "500 kg/month",
      frequency: "Monthly",
      priority: "High",
      description: "Sourcing clean, baled or crushed PET plastic for industrial bottle recycling and fiber spinning.",
      targetPrice: "৳ 40 - ৳ 50 / kg",
      keywords: ["plastic", "PET", "recyclable", "bulk"]
    };
  }

  if (role === "maker" || task === "upcycle-ideas") {
    return {
      rawMaterial: input || "Old Denim & Textiles",
      ideas: [
        {
          name: "Upcycled Denim Tote Bag",
          description: "Sturdy, stylish everyday tote bag crafted from repurposed denim pockets and heavy fabric scraps.",
          category: "Handmade",
          difficulty: "Easy",
          estimatedPrice: "৳ 650",
          materialsNeeded: ["Old denim jeans", "Lining fabric", "Strap handles"]
        },
        {
          name: "Patchwork Desk Organizer",
          description: "Multi-pocket wall or desk organizer designed to store office accessories and craft tools.",
          category: "Handmade",
          difficulty: "Medium",
          estimatedPrice: "৳ 450",
          materialsNeeded: ["Denim scraps", "Cardboard backing"]
        },
        {
          name: "Eco-Friendly Cushion Cover",
          description: "Hand-stitched decorative cushion cover blending denim tones with cotton trim.",
          category: "Handmade",
          difficulty: "Easy",
          estimatedPrice: "৳ 550",
          materialsNeeded: ["Denim patches", "Zipper"]
        }
      ]
    };
  }

  if (role === "buyer" || task === "parse-shopping-request") {
    return {
      interpretedNeed: "Low-cost study table made from reclaimed wood",
      category: "Furniture",
      material: "Reclaimed Wood",
      pricePreference: "Low",
      keywords: ["wood", "furniture", "table", "reclaimed"]
    };
  }

  // Individual fallback
  return {
    itemName: input || "Unused Plastic Containers",
    category: "Plastic",
    material: "HDPE / PET Plastic",
    condition: "Good",
    reusability: "High",
    recommendedAction: "Recycle",
    alternativeActions: ["Reuse", "Upcycle"],
    reason: "Appears to be clean, recyclable plastic suitable for local collection or community maker reuse.",
    upcyclingIdeas: ["Use as planter pots", "Storage container", "Craft material"],
    listingTitle: "Reusable / Recyclable Plastic Items",
    listingDescription: "Clean plastic containers ready for recycling pickup or local maker upcycling.",
    tags: ["plastic", "recycle", "reuse"],
    hazardous: false,
    hazardNote: ""
  };
}

// ─── Parse & validate AI JSON ─────────────────────────────
function parseAIResponse(geminiResponse, role, task, input) {
  try {
    const text = geminiResponse?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const cleaned = text.replace(/```json\n?/gi, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return { success: true, data: parsed };
  } catch (e) {
    return {
      success: false,
      error: e.message,
      data: getFallbackData(role, task, input)
    };
  }
}

// ─── Vercel / Serverless Export ───────────────────────────
module.exports = async function handler(req, res) {
  setCorsHeaders(req, res);

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch (e) {
    res.status(400).json({ error: "Invalid JSON body" });
    return;
  }

  const { role = "individual", task = "analyze-item", input = "", description = "", hasImage = false } = body || {};
  const userText = (input || description).trim();

  if (!userText || userText.length < 2) {
    res.status(400).json({ error: "Please provide a valid input description (at least 2 characters)." });
    return;
  }

  try {
    if (!process.env.GEMINI_API_KEY) {
      // Return structured fallback response if key is missing
      const fallback = getFallbackData(role, task, userText);
      res.status(200).json({
        success: true,
        data: fallback,
        analysis: fallback,
        demo: true,
        warning: "GEMINI_API_KEY not configured on server. Using fallback AI response."
      });
      return;
    }

    const prompt = buildRolePrompt(role, task, userText, !!hasImage);
    const geminiRaw = await callGemini(prompt);
    const result = parseAIResponse(geminiRaw, role, task, userText);

    res.status(200).json({
      success: true,
      data: result.data,
      analysis: result.data,
      warning: result.success ? null : "AI response partially cleaned with standard defaults.",
      demo: false
    });
  } catch (err) {
    console.error("Gemini API server error:", err.message);
    const fallback = getFallbackData(role, task, userText);
    res.status(200).json({
      success: true,
      data: fallback,
      analysis: fallback,
      warning: "Could not reach Gemini API directly. Using structured intelligent fallback.",
      demo: true
    });
  }
};

// ─── Express compatibility (for local dev server) ─────────
if (require.main === module) {
  const http = require("http");

  const server = http.createServer((req, res) => {
    if ((req.url === "/api/analyze" || req.url === "/api/ai") && req.method === "POST") {
      let rawBody = "";
      req.on("data", (chunk) => (rawBody += chunk));
      req.on("end", () => {
        req.body = rawBody;
        module.exports(req, res);
      });
    } else if ((req.url === "/api/analyze" || req.url === "/api/ai") && req.method === "OPTIONS") {
      setCorsHeaders(req, res);
      res.writeHead(200);
      res.end();
    } else if (req.url === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "ok", service: "ReLoop Role-Aware AI API" }));
    } else {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Not found" }));
    }
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`✅ ReLoop Role-Aware AI API running on http://localhost:${PORT}`);
    console.log(`   POST http://localhost:${PORT}/api/ai`);
    console.log(`   POST http://localhost:${PORT}/api/analyze`);
    if (!process.env.GEMINI_API_KEY) {
      console.warn("⚠️  GEMINI_API_KEY not set — using structured fallback AI mode for demo.");
    }
  });
}

