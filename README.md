# Little Useful Apps

A collection of focused, single-purpose web applications that solve real-world problems. Each app is built with a modern React stack and runs entirely in the browser — no backend required.

## Projects

### Automotive Marketing Simulator

**Problem:** Automotive marketers need to understand how budget allocation, campaign strategy, and creative quality interact to drive vehicle sales — without burning real ad spend.

**Solution:** An interactive funnel simulator that models the full journey from media impressions to closed sales. Adjust budget ($5K–$100K), strategy mix (brand vs. performance), and creative quality to see real-time impact on key metrics like ROAS, CPM, CTR, cost per lead, and customer acquisition cost.

**Highlights:**
- Realistic funnel economics with strategy-dependent conversion rates
- Brand-heavy strategies improve lead quality; over-indexing on performance applies a close-rate penalty
- Dynamic analysis with contextual tips based on current metrics
- Single-component architecture — all simulation logic in one `useEffect` hook

**Stack:** React 19, Vite, Tailwind CSS

---

### Apartment Checker

**Problem:** Apartment hunting (especially in Munich) means comparing dozens of listings across many criteria — from hard requirements to nice-to-haves — without losing track.

**Solution:** A scoring and ranking tool with a three-tier evaluation system: knockout criteria (must-pass), priority criteria (10 pts each), and nice-to-have criteria (3 pts each). Apartments that fail any knockout criterion are automatically sorted to the bottom.

**Highlights:**
- 39 configurable criteria across 3 priority tiers
- Persistent storage via localStorage with versioned data format
- Color-coded score visualization and badge-based criteria display
- Smart sorting with KO-failed apartments always ranked last

**Stack:** React 19, Vite, Tailwind CSS

---

### Real Estate Financing Calculator

**Problem:** Understanding the true cost of a property purchase in Bavaria requires factoring in transfer tax, notary fees, broker commission, and the interplay between interest rates and repayment schedules.

**Solution:** An interactive mortgage calculator that computes monthly payments, loan-to-value ratios, payoff timelines, and remaining debt after 10 years. Includes Bavaria-specific acquisition costs (8.57%) and visual breakdowns of equity vs. loan.

**Highlights:**
- Logarithmic loan term calculation and amortization math
- Stacked bar visualization of equity vs. loan ratio
- Input validation with real-time error feedback
- Also available as a standalone Python CLI script for quick calculations

**Stack:** React 19, Vite, Tailwind CSS, Python (CLI version)

---

## Technical Approach

All three apps share a consistent philosophy:

- **No backend** — every calculation runs client-side for instant feedback
- **Interactive sliders** with real-time recalculation on every input change
- **Domain-specific math** — each app encodes meaningful models (funnel economics, scoring algorithms, amortization formulas) rather than trivial CRUD
- **Responsive design** — works on desktop and mobile
- **Minimal dependencies** — lean builds with only essential libraries

## Running Locally

Each project lives in its own directory with a standard Vite setup:

```bash
cd <project-directory>
npm install
npm run dev
```

## License

MIT
