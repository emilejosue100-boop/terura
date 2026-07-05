# Terura

**Terura** is a bilingual (English / Kinyarwanda) cooperative savings and growth platform for informal savings groups in Rwanda. Members save and borrow within their group; committee admins review loan requests and investment opportunities surfaced via AI to help grow the collective fund.

Built as a **MERN stack** monorepo: React frontend + Express/MongoDB backend.

---

## Features

### Member
- Phone + PIN login with separate **Sign In**, **Join**, and **Committee** flows
- Savings dashboard with balance, contributions, and loan requests
- Savings history with trend visualization
- Personalized financial tips (Gemini AI)
- Bilingual UI toggle (EN / RW) on every screen
- Profile and language settings

### Admin / Committee
- Group overview: total savings, active loans, member count
- Members list with balances
- Loan approvals queue (approve / decline)
- Opportunity feed with Firecrawl + Gemini refresh and group-vote flagging
- Group savings reports and charts

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, Vite 6, Tailwind CSS v4, Lucide icons |
| **Backend** | Express, MongoDB (Mongoose), JWT auth, bcrypt |
| **AI** | Google Gemini (financial tips, opportunity curation) |
| **Web data** | Firecrawl (Rwanda finance source scraping) |

---

## Design System

| Token | Value | Usage |
|-------|-------|-------|
| Background | `#FAF9F6` | App surface |
| Primary | `#1F5C3F` | Buttons, active nav |
| Accent | `#C9A227` | Highlights, badges |
| Headings | DM Sans | Bold / Medium |
| Body | Poppins | Regular / Medium |
| Radius | `rounded-xl` (~16px) | Cards, buttons, inputs |

Layout: mobile-first with bottom navigation (member) and left sidebar (admin/desktop).

---

## Project Structure

```
terura/
├── frontend/          # React SPA (Vite)
│   ├── src/
│   │   ├── components/   # Screen components + EmptyState
│   │   ├── lib/api.ts    # API client with JWT
│   │   ├── App.tsx
│   │   └── types.ts
│   ├── vite.config.ts
│   └── package.json
├── backend/           # Express REST API
│   ├── src/
│   │   ├── models/       # Mongoose schemas
│   │   ├── routes/       # /api endpoints
│   │   ├── services/     # Gemini AI + Firecrawl scraping
│   │   ├── seed/         # Database seeder
│   │   └── index.ts
│   └── package.json
├── package.json       # Root workspace scripts
└── README.md
```

---

## Prerequisites

- **Node.js** 18 or later
- **MongoDB** — local instance or [MongoDB Atlas](https://www.mongodb.com/atlas) free tier
- **Gemini API key** (optional — AI features fall back gracefully without it)
- **Firecrawl API key** (optional — opportunity refresh falls back to Gemini-only without it)

---

## Setup & Run

1. **Install dependencies** (from project root):

   ```bash
   npm install
   ```

2. **Configure backend environment**:

   ```bash
   cp backend/.env.example backend/.env
   ```

   Edit `backend/.env`:

   ```
   PORT=5000
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=your-secret-key
   GEMINI_API_KEY=your-gemini-api-key
   FIRECRAWL_API_KEY=your-firecrawl-api-key
   FRONTEND_URL=http://localhost:5173
   ADMIN_PHONE=0788000000
   ```

   Set `ADMIN_PHONE` to the committee member's phone number for first-time bootstrap.

3. **Reset the database** (empty cooperative — ready for real data):

   ```bash
   npm run seed
   ```

4. **Start development servers** (frontend + backend):

   ```bash
   npm run dev
   ```

   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

---

## Getting Started (Real Data)

1. Run `npm run seed` to create an empty Terura cooperative in MongoDB.
2. Set `ADMIN_PHONE` in `backend/.env` to your committee phone.
3. **First committee admin:** Login → **Committee** tab → **First-time committee setup** → register with `ADMIN_PHONE`, your name, and a PIN.
4. **Register members:** Admin Dashboard → Register New Member (optionally set role to Committee Admin).
5. **Member self-register:** Login → **Join** tab with name, phone, and PIN.
6. **Member sign-in:** Login → **Sign In** tab with phone and PIN (no auto-registration).
7. **Savings & loans:** All contributions, requests, and approvals persist in MongoDB.
8. **Opportunities:** Feed starts empty — use **Scan Rwanda Sources** to scrape BNR/RSE/BK pages via Firecrawl and curate with Gemini.

---

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/state` | Full application state |
| GET | `/api/ai/status` | Check Gemini + Firecrawl key health |
| GET | `/api/auth/status` | Whether a committee admin exists |
| POST | `/api/login` | Sign in (`mode: login`) or register (`mode: register`) |
| POST | `/api/login/admin` | Committee admin sign-in |
| POST | `/api/logout` | End session |
| POST | `/api/language` | Set EN/RW preference |
| POST | `/api/add-member` | Admin register a member |
| POST | `/api/update-profile` | Update member name |
| POST | `/api/save` | Member savings deposit |
| POST | `/api/request-loan` | Submit loan request |
| POST | `/api/approve-loan` | Admin approve loan |
| POST | `/api/decline-loan` | Admin decline loan |
| POST | `/api/repay-loan` | Member repay loan |
| POST | `/api/generate-tip` | AI financial tip |
| POST | `/api/refresh-opportunities` | Firecrawl scrape + Gemini opportunity curation |
| POST | `/api/analyze-opportunity` | AI opportunity analysis |
| POST | `/api/flag-opportunity` | Flag for group vote |

Protected routes require `Authorization: Bearer <token>` header.

---

## PRD Alignment

| Requirement | Status |
|-------------|--------|
| Bilingual EN/RW toggle | Implemented |
| Member + Admin roles | Implemented |
| Savings, loans, approvals | Implemented |
| Opportunity feed | Implemented (Firecrawl + Gemini) |
| Design system (colors, fonts, layout) | Implemented |
| MERN with persistent MongoDB | Implemented |
| Empty states on key screens | Implemented |
| Dedicated Financial Tip Detail screen | Partial (inline on dashboard) |
| Reports / Group Overview screen | Partial (charts in admin dashboard) |
| Real Firecrawl scraping | Implemented |
| Dark mode | Present (not required by PRD MVP) |

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend + backend concurrently |
| `npm run seed` | Reset MongoDB to empty cooperative |
| `npm run build` | Build frontend for production |
| `npm run start` | Start production backend |
| `npm run lint` | Type-check frontend and backend |
