# Automotive Marketing Simulator

An interactive, browser-based simulator that models how media budget, campaign strategy, and creative quality translate into vehicle sales outcomes — built for marketers and analysts who want to develop intuition for automotive funnel economics without running a live campaign.

---

## What It Does

The simulator models the full automotive marketing funnel in real time:

```
Media Budget + Strategy Mix + Creative Quality
        ↓
  Impressions  →  Website Visitors  →  Test Drive Leads  →  Vehicle Sales
```

Every change to an input parameter instantly recalculates the entire funnel, giving immediate feedback on how decisions ripple through to revenue and efficiency metrics.

### Simulation Model

| Stage | Key Variables | Output Metric |
|---|---|---|
| **Reach** | Budget, CPM (driven by strategy mix) | Impressions |
| **Interest** | CTR (driven by strategy mix + quality) | Website Visitors |
| **Consideration** | Click-to-lead rate (driven by quality) | Test Drive Leads |
| **Purchase** | Close rate (penalized by aggressive performance mix) | Vehicle Sales |

**Notable model behaviors:**
- Automotive CPM ranges from $15–$35, rising with performance-heavy strategies due to competitive bidding
- Brand-heavy strategies yield lower CTR but better lead quality and higher close rates
- Aggressive performance targeting (>80% mix) applies a close-rate penalty, reflecting lower lead intent
- A base average vehicle price of $45,000 is used for revenue and ROAS calculations

---

## Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| [React](https://react.dev) | 19 | UI & state management |
| [Vite](https://vite.dev) | 7 | Dev server & bundler |
| [Tailwind CSS](https://tailwindcss.com) | 3 | Styling |
| [lucide-react](https://lucide.dev) | 0.575 | Icons |

All simulation logic lives in a single `useEffect` in `src/App.jsx` — no backend, no external data dependencies.

---

## Setup

**Prerequisites:** Node.js ≥ 18

```bash
# 1. Navigate to the project directory
cd automotive_marketing_simulator

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173` with hot module replacement enabled.

### Other Commands

```bash
npm run build     # Production build → dist/
npm run preview   # Preview the production build locally
npm run lint      # Run ESLint
```

---

## Project Structure

```
src/
└── App.jsx       # All components and simulation logic (single-file)
└── main.jsx      # React root entry point
└── index.css     # Tailwind base imports
```

---

## Controls

| Control | Range | Effect |
|---|---|---|
| **Monthly Budget** | $5,000 – $100,000 | Scales reach; higher budget = more impressions at the same CPM |
| **Strategy Mix** | 0% (Brand) – 100% (Performance) | Shifts CPM, CTR, and close rate across the funnel |
| **Creative & Web Quality** | 1 – 10 | Improves CTR and click-to-lead conversion rate |

---

## Key Output Metrics

| Metric | Description |
|---|---|
| **ROAS** | Return on Ad Spend — revenue divided by media budget |
| **CPM** | Cost per 1,000 impressions |
| **CTR** | Click-through rate from impression to website visit |
| **CPL** | Cost per lead (test drive booked) |
| **CAC** | Customer Acquisition Cost — budget divided by vehicles sold |
| **Close Rate** | Percentage of test drive leads that result in a sale |
