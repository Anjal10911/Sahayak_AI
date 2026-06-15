# SahayakAI — Seller Trust & Onboarding Agent

**ScriptedBy{Her} 2.0 — Meesho Hackathon**
**Theme: Building for Bharat with the Power of Agentic AI**

## Problem

Small sellers across Tier 2/3 India face friction when listing products online:
- Manual review of product photos and documents slows onboarding
- Stolen/reused product images and fraudulent documents hurt platform trust
- Many sellers struggle to write effective listings, especially in their own language

## Solution

<img width="1440" height="960" alt="image" src="https://github.com/user-attachments/assets/56aa5b4d-e224-4f22-a8bf-780ca56112b6" />


SahayakAI is an agentic assistant that combines **fraud detection** with **listing generation**:

1. **Seller uploads a product photo**
2. **Trust Agent analyzes the image** using:
   - Error Level Analysis (ELA) — detects re-compression artifacts common in edited/spliced images
   - EXIF metadata check — flags images likely sourced from the web rather than the seller's own device
   - Perceptual hashing — flags photos that closely match existing listings (duplicate detection)
3. **Agent makes a decision:**
   - **CLEAN** → proceeds to generate a bilingual (English + Hindi) product listing with title, description, price suggestion, and tags
   - **REVIEW** → flags specific concerns but allows the seller to proceed
   - **HIGH_RISK** → blocks automatic listing generation and routes to manual review, explaining why in plain language

This is the "agentic" loop: the system doesn't just classify — it **takes the next action** (generate a listing, or block and explain) based on its own analysis.

## Tech Stack

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express
- **Forensics:** Python (Pillow, NumPy) — Error Level Analysis, EXIF parsing, perceptual hashing
- **AI Agent Layer:** Google Gemini API (gemini-2.0-flash, free tier) for bilingual listing generation

## Project Structure

```
sahayak-ai/
├── frontend/          # React + Vite + Tailwind UI
│   └── src/
│       ├── App.jsx       # Main application flow
│       ├── TrustMeter.jsx # Signature gauge visualization
│       └── index.css
├── backend/           # Express API server
│   └── src/
│       └── server.js     # /api/analyze-image, /api/generate-listing
├── forensics/          # Python image forensics module
│   └── image_forensics.py
└── docs/               # Submission documents (architecture, pitch, etc.)
```

## Running Locally

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env
# Add your GEMINI_API_KEY to .env (get a free key at aistudio.google.com)
npm start
```
Backend runs on `http://localhost:5000`

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173` and proxies `/api` requests to the backend.

### 3. Forensics module (standalone test)
```bash
cd forensics
python3 image_forensics.py path/to/image.jpg
```

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | GET | Health check |
| `/api/analyze-image` | POST | Upload image (`multipart/form-data`, field: `image`) → returns risk score, verdict, reasons |
| `/api/generate-listing` | POST | Body: `{ productName, category, riskVerdict }` → returns bilingual listing or BLOCKED action |

## Open Source Libraries Used

- React, Vite, Tailwind CSS (frontend)
- Express, Multer, CORS, dotenv (backend)
- Pillow, NumPy (Python forensics)
- Anthropic Claude API (claude-sonnet-4-6) was used to build this project — disclose if hackathon rules require declaring AI coding assistance
- Google Gemini API (gemini-2.0-flash, free tier) for listing generation

## Future Scope

- Train a proper duplicate-image index across all live listings (vector DB / image embeddings)
- Voice-based onboarding for sellers with low literacy
- Expand to more Indian languages (Kannada, Tamil, Telugu, Bengali)
- Seller education nudges based on flagged issues (e.g., "tips for taking better product photos")

---
*Built for ScriptedBy{Her} 2.0 by Meesho — Building for Bharat with the Power of Agentic AI*
