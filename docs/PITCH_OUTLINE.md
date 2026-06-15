# SahayakAI — Pitch Deck Outline
## ScriptedBy{Her} 2.0 (Meesho Hackathon) — Theme: Building for Bharat with the Power of Agentic AI

Use this outline to build your PPT (10-12 slides). Each slide below = one slide.

---

### Slide 1 — Title
**SahayakAI**
Seller Trust & Onboarding Agent
Team Name | ScriptedBy{Her} 2.0 | Theme: Building for Bharat with the Power of Agentic AI

---

### Slide 2 — The Problem
- Small sellers in Tier 2/3 India face slow, manual onboarding
- Fraudulent/stolen product images and fake documents erode platform trust
- Sellers struggle to write effective listings — especially in their own language
- Manual review doesn't scale to millions of sellers

---

### Slide 3 — Our Solution
**SahayakAI** = an agent that protects AND helps sellers
- Step 1: Upload product photo
- Step 2: Agent runs trust checks (fraud detection)
- Step 3: Agent decides — generate listing (if clean) or flag for review (if risky)

This is *agentic*: the system doesn't just classify, it takes the next action.

---

### Slide 4 — Architecture Diagram
[Insert the architecture diagram - generated below]

---

### Slide 5 — How the Trust Check Works
Three forensic signals combine into a risk score:
1. **Error Level Analysis (ELA)** — detects re-compression artifacts from image editing
2. **EXIF metadata check** — flags images likely downloaded vs. taken by the seller
3. **Perceptual hashing** — flags duplicate/reused photos across listings

---

### Slide 6 — Agentic Decision Logic
| Verdict | Risk Score | Agent Action |
|---|---|---|
| CLEAN | < 20 | Auto-generate bilingual listing |
| REVIEW | 20-49 | Generate listing + flag concerns |
| HIGH_RISK | ≥ 50 | Block generation, route to manual review |

---

### Slide 7 — Listing Generation
- Powered by Claude API
- Generates: Title (English + Hindi), Description (English + Hindi), Suggested price range, Tags
- Helps sellers who aren't comfortable writing marketing copy

---

### Slide 8 — Live Demo
[Screen recording / screenshots of the working app]
1. Upload photo
2. See trust meter result
3. Generate bilingual listing

---

### Slide 9 — Tech Stack
- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Forensics: Python (Pillow, NumPy)
- AI: Google Gemini API (gemini-2.0-flash, free tier)

---

### Slide 10 — Why This Matters for Meesho
- Reduces manual review burden at scale
- Improves catalog quality and buyer trust
- Empowers first-time sellers with AI-assisted listing creation
- Supports regional language inclusion (Hindi, expandable to more languages)

---

### Slide 11 — Future Scope
- Vector-based duplicate detection across all live listings
- Voice-based onboarding for low-literacy sellers
- More Indian languages (Kannada, Tamil, Telugu, Bengali, Marathi)
- Seller education tips based on flagged issues

---

### Slide 12 — Thank You / Q&A
Team contact / GitHub repo link

---

## Demo Video Script (2-3 minutes)

1. **(0:00-0:20)** Intro: "Hi, we're presenting SahayakAI — built for ScriptedBy{Her} 2.0. It's an agentic AI that helps Meesho sellers get onboarded faster while catching fraudulent listings."
2. **(0:20-0:50)** Show the problem briefly (1 slide or verbal) — fraud + onboarding friction
3. **(0:50-1:30)** Live demo: upload a product photo → show trust meter animating → show risk score/verdict → explain what it checked
4. **(1:30-2:10)** Continue demo: enter product name → click Generate Listing → show bilingual output (title, description, price, tags)
5. **(2:10-2:30)** Wrap up: tech stack, future scope, thank you

---

## GitHub Repo Checklist
- [ ] README.md (already created)
- [ ] All source code (frontend/, backend/, forensics/)
- [ ] .env.example (don't commit real API keys!)
- [ ] .gitignore (already created)
- [ ] Declare open-source libraries used (listed in README)
- [ ] License file (MIT recommended)
