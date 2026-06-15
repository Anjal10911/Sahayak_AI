/**
 * SahayakAI Backend Server
 * ScriptedBy{Her} 2.0 - Meesho Hackathon
 *
 * Agentic flow:
 *  1. Seller uploads a product photo
 *  2. /api/analyze-image -> runs Python forensics script (ELA, EXIF, perceptual hash)
 *  3. Agent decides: CLEAN -> proceed to listing generation
 *                    REVIEW/HIGH_RISK -> flag for human review with plain-language reason
 *  4. /api/generate-listing -> calls Google Gemini API (free tier) to generate bilingual
 *     (English + Hindi) product title, description, and price suggestion
 */

import express from "express";
import cors from "cors";
import multer from "multer";
import { spawn, execSync } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const UPLOAD_DIR = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const upload = multer({ dest: UPLOAD_DIR });

const FORENSICS_SCRIPT = path.join(__dirname, "..", "..", "forensics", "image_forensics.py");

/**
 * Robustly find python executable on Windows to bypass Microsoft Store app execution aliases.
 */
function getPythonCmd() {
  if (process.platform !== "win32") {
    return "python3";
  }

  try {
    const paths = execSync("where python", { encoding: "utf8" })
      .split("\r\n")
      .map(p => p.trim())
      .filter(Boolean);
    for (const p of paths) {
      if (!p.toLowerCase().includes("windowsapps")) {
        return p;
      }
    }
  } catch (e) {
    // Ignore error from 'where' command
  }

  const userProfile = process.env.USERPROFILE || process.env.HOMEPATH;
  const commonPaths = [
    "C:\\Python312\\python.exe",
    "C:\\Python313\\python.exe",
    "C:\\Python311\\python.exe",
    "C:\\Python310\\python.exe",
    "C:\\Python39\\python.exe",
    "C:\\Python38\\python.exe",
  ];

  if (userProfile) {
    for (let v = 13; v >= 8; v--) {
      commonPaths.push(path.join(userProfile, "AppData", "Local", "Programs", "Python", `Python3${v}`, "python.exe"));
    }
  }

  for (const p of commonPaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }

  return "python";
}

/**
 * POST /api/analyze-image
 * Accepts a multipart form file under field "image"
 * Runs the Python forensics script and returns the risk report.
 */
app.post("/api/analyze-image", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image uploaded" });
  }

  const imagePath = req.file.path;
  const pythonCmd = getPythonCmd();
  const py = spawn(pythonCmd, [FORENSICS_SCRIPT, imagePath]);

  let output = "";
  let errorOutput = "";

  py.stdout.on("data", (data) => (output += data.toString()));
  py.stderr.on("data", (data) => (errorOutput += data.toString()));

  py.on("close", (code) => {
    // Clean up uploaded file after analysis
    fs.unlink(imagePath, () => { });

    if (code !== 0) {
      return res.status(500).json({ error: "Forensics analysis failed", details: errorOutput });
    }

    try {
      const result = JSON.parse(output);
      res.json(result);
    } catch (e) {
      res.status(500).json({ error: "Failed to parse forensics output", raw: output });
    }
  });
});

/**
 * Generate a high-quality mock listing as a fallback if the Gemini API is unavailable,
 * rate-limited, or has an invalid/expired key. This ensures the onboarding flow remains fully functional.
 */
function getMockListing(productName, category) {
  const cat = category || "General";
  const nameClean = productName.trim();
  
  let price = "349-599";
  let title_en = `Stylish Premium ${nameClean}`;
  let title_hi = `स्टाइलिश प्रीमियम ${nameClean}`;
  let desc_en = `Elevate your wardrobe with this beautiful ${nameClean}. Perfect for casual outings and special occasions alike, crafted with care for maximum comfort and style.`;
  let desc_hi = `इस खूबसूरत ${nameClean} के साथ अपनी अलमारी को सजाएं। आकस्मिक सैर और विशेष अवसरों दोनों के लिए बिल्कुल सही, अधिकतम आराम और शैली के लिए सावधानी से तैयार किया गया।`;

  const lowerName = nameClean.toLowerCase();
  if (lowerName.includes("kurti") || lowerName.includes("ethnic") || lowerName.includes("suit")) {
    price = "299-499";
    title_en = `Elegant Dailywear ${nameClean}`;
    title_hi = `शानदार डेलीवियर ${nameClean}`;
    desc_en = `Beautify your everyday style with this elegant ${nameClean}. Made from breathable premium fabric, ideal for office wear, daily routines, and family gatherings.`;
    desc_hi = `इस शानदार ${nameClean} के साथ अपने रोजमर्रा के स्टाइल को निखारें। सांस लेने योग्य प्रीमियम कपड़े से निर्मित, ऑफिस वियर, दैनिक दिनचर्या और पारिवारिक समारोहों के लिए आदर्श।`;
  } else if (lowerName.includes("saree") || lowerName.includes("sari")) {
    price = "599-1299";
    title_en = `Gorgeous Traditional ${nameClean}`;
    title_hi = `भव्य पारंपरिक ${nameClean}`;
    desc_en = `Make a stunning impression with this gorgeous traditional ${nameClean}. Features intricate patterns and lightweight fabric for a graceful drape.`;
    desc_hi = `इस भव्य पारंपरिक ${nameClean} के साथ एक शानदार प्रभाव बनाएं। सुंदर पैटर्न और हल्के कपड़े के साथ शानदार ढंग से लपेटने के लिए अनुकूल।`;
  } else if (lowerName.includes("shirt") || lowerName.includes("t-shirt") || lowerName.includes("jeans") || lowerName.includes("pant")) {
    price = "399-799";
    title_en = `Classic Casual ${nameClean}`;
    title_hi = `क्लासिक कैजुअल ${nameClean}`;
    desc_en = `A wardrobe essential: this classic casual ${nameClean} offers a modern fit and durable quality. Perfect for daily wear and pairs easily with anything.`;
    desc_hi = `वार्डरोब की एक आवश्यक वस्तु: यह क्लासिक कैजुअल ${nameClean} आधुनिक फिट और टिकाऊ गुणवत्ता प्रदान करता है। दैनिक पहनने के लिए बिल्कुल सही और किसी भी चीज़ के साथ आसानी से जुड़ जाता है।`;
  }

  const tags = [
    nameClean.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    cat.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    "onboarding-agent",
    "verified-seller",
    "sahayak-assured"
  ].filter(Boolean);

  return {
    title_en,
    title_hi,
    description_en: desc_en,
    description_hi: desc_hi,
    suggested_price_range_inr: price,
    tags
  };
}

/**
 * POST /api/generate-listing
 * Body: { productName, category, riskVerdict }
 * Calls Google Gemini API (free tier) to generate bilingual listing content.
 * The "agent" reasoning step: only generates full listing if riskVerdict !== HIGH_RISK
 */
app.post("/api/generate-listing", async (req, res) => {
  const { productName, category, riskVerdict } = req.body;

  if (!productName) {
    return res.status(400).json({ error: "productName is required" });
  }

  // Agentic decision gate
  if (riskVerdict === "HIGH_RISK") {
    return res.json({
      action: "BLOCKED",
      message:
        "Listing generation blocked. This image was flagged as high risk and requires manual review before a listing can be created.",
    });
  }

  const prompt = `You are an assistant helping a small Indian seller create a product listing for an e-commerce platform.

Product name: ${productName}
Category: ${category || "General"}

Generate a JSON object with this exact structure (no markdown, no extra text):
{
  "title_en": "catchy English product title (max 60 chars)",
  "title_hi": "same title in Hindi (Devanagari script)",
  "description_en": "2-3 sentence English product description highlighting key benefits",
  "description_hi": "same description in Hindi (Devanagari script)",
  "suggested_price_range_inr": "e.g. 299-499",
  "tags": ["tag1", "tag2", "tag3"]
}`;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.warn("Gemini API error, falling back to mock generator:", data.error.message);
      const fallbackListing = getMockListing(productName, category);
      return res.json({ action: "GENERATED", listing: fallbackListing, riskVerdict: riskVerdict || "CLEAN", fallback: true });
    }

    const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
    const clean = text.replace(/```json|```/g, "").trim();
    const listing = JSON.parse(clean);

    res.json({ action: "GENERATED", listing, riskVerdict: riskVerdict || "CLEAN" });
  } catch (err) {
    console.warn("Gemini API request failed, falling back to mock generator:", err.message);
    try {
      const fallbackListing = getMockListing(productName, category);
      return res.json({ action: "GENERATED", listing: fallbackListing, riskVerdict: riskVerdict || "CLEAN", fallback: true });
    } catch (fallbackErr) {
      res.status(500).json({ error: "Listing generation failed", details: err.message });
    }
  }
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "SahayakAI Backend" });
});

app.listen(PORT, () => {
  console.log(`SahayakAI backend running on port ${PORT}`);
});
