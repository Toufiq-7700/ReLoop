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
  // Add your production domain here, e.g.:
  // "https://reloop.vercel.app"
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
        temperature: 0.4,
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

// ─── Build analysis prompt ────────────────────────────────
function buildPrompt(description, hasImage) {
  return `You are the AI core of ReLoop, a circular economy marketplace in Bangladesh. 
A user has submitted an item they want to give a second life to.

Item description: "${description}"
${hasImage ? "Note: An image was also uploaded (use description as primary input for this text endpoint)." : ""}

Analyze this item and respond ONLY with valid JSON in this exact schema (no markdown, no explanation outside JSON):

{
  "itemName": "short name for the item",
  "category": "one of: Furniture, Electronics, Clothing, Plastic, Metal, Glass, Paper, Mixed, Organic, Other",
  "material": "primary material(s)",
  "condition": "one of: New, Good, Fair, Poor, Broken, Unknown",
  "reusability": "one of: High, Medium, Low",
  "recommendedAction": "one of: Sell, Donate, Reuse, Repair, Recycle, Upcycle, Collect",
  "alternativeActions": ["up to 2 other actions"],
  "reason": "1-2 sentence explanation (use words like 'likely', 'appears to be', 'suggest checking with a local recycler' for uncertainty)",
  "upcyclingIdeas": ["2-3 creative reuse ideas"],
  "listingTitle": "short marketplace listing title (max 10 words)",
  "listingDescription": "2-sentence marketplace description",
  "tags": ["3-5 relevant tags"],
  "hazardous": false,
  "hazardNote": ""
}

Rules:
- If the item appears hazardous (chemicals, batteries, asbestos, medical waste), set hazardous: true and provide a safety note.
- Never claim exact prices or verified recycling rates.
- Use cautious language for uncertain classifications.
- Keep all text concise and practical.
- The response must be parseable JSON with no extra characters.`;
}

// ─── Parse & validate AI JSON ─────────────────────────────
function parseAIResponse(geminiResponse) {
  try {
    const text = geminiResponse?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    // Strip markdown code fences if present
    const cleaned = text.replace(/```json\n?/gi, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);

    // Validate required fields
    const required = ["itemName", "category", "material", "recommendedAction"];
    for (const field of required) {
      if (!parsed[field]) throw new Error(`Missing field: ${field}`);
    }

    return { success: true, data: parsed };
  } catch (e) {
    // Graceful fallback
    return {
      success: false,
      error: e.message,
      data: {
        itemName: "Unidentified Item",
        category: "Mixed",
        material: "Unknown",
        condition: "Unknown",
        reusability: "Medium",
        recommendedAction: "Recycle",
        alternativeActions: ["Donate", "Reuse"],
        reason: "Gemini could not fully analyze this item. We suggest checking with a local recycler or donation center.",
        upcyclingIdeas: ["Consider creative reuse", "Check with local makers", "Donate if usable"],
        listingTitle: "Item Available",
        listingDescription: "Item available for reuse, recycling, or donation. Contact for more details.",
        tags: ["reuse", "recycle", "community"],
        hazardous: false,
        hazardNote: ""
      }
    };
  }
}

// ─── Vercel / serverless export ───────────────────────────
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
    // Parse body — works with Vercel's auto-parsing
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch (e) {
    res.status(400).json({ error: "Invalid JSON body" });
    return;
  }

  const { description, hasImage } = body || {};

  if (!description || description.trim().length < 3) {
    res.status(400).json({ error: "Please provide an item description (at least 3 characters)." });
    return;
  }

  if (description.length > 1000) {
    res.status(400).json({ error: "Description is too long. Please keep it under 1000 characters." });
    return;
  }

  try {
    const prompt = buildPrompt(description.trim(), !!hasImage);
    const geminiRaw = await callGemini(prompt);
    const result = parseAIResponse(geminiRaw);

    res.status(200).json({
      success: result.success,
      analysis: result.data,
      warning: result.success ? null : "AI analysis was partially successful. Using fallback data.",
      demo: false
    });
  } catch (err) {
    console.error("Gemini API error:", err.message);
    res.status(502).json({
      success: false,
      error: "Could not reach Gemini API. Please try again later.",
      analysis: null
    });
  }
};

// ─── Express compatibility (for local dev server) ─────────
if (require.main === module) {
  const http = require("http");

  const server = http.createServer((req, res) => {
    if (req.url === "/api/analyze" && req.method === "POST") {
      let rawBody = "";
      req.on("data", (chunk) => (rawBody += chunk));
      req.on("end", () => {
        req.body = rawBody;
        module.exports(req, res);
      });
    } else if (req.url === "/api/analyze" && req.method === "OPTIONS") {
      setCorsHeaders(req, res);
      res.writeHead(200);
      res.end();
    } else if (req.url === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "ok", service: "ReLoop API" }));
    } else {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Not found" }));
    }
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`✅ ReLoop API server running on http://localhost:${PORT}`);
    console.log(`   POST http://localhost:${PORT}/api/analyze`);
    if (!process.env.GEMINI_API_KEY) {
      console.warn("⚠️  GEMINI_API_KEY not set — set it in your .env file");
    }
  });
}
