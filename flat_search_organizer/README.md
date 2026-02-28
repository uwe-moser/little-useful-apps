# Apartment Checker

A React-based apartment comparison tool for scoring and ranking rental apartments against a configurable set of criteria. Built for apartment hunting in the Munich area.

## How It Works

Apartments are evaluated using a three-tier scoring system:

- **Knockout (KO) criteria** — hard requirements that must all be met (e.g. rent budget, minimum rooms, location, elevator access). If any KO criterion fails, the apartment is flagged and sorted to the bottom.
- **Priority 1 criteria** — important factors worth 10 points each (e.g. commute time, public transport, daycare proximity, parking).
- **Priority 3 criteria** — nice-to-have factors worth 3 points each (e.g. balcony, soundproofing, built-in kitchen, bicycle storage).

Apartments are ranked by total score, with KO-failed listings always appearing last. All data is persisted in `localStorage`.

## Tech Stack

- **React 19** with Vite 7
- **Tailwind CSS 3** for styling
- **Lucide React** for icons
- No backend — fully client-side with browser storage

## Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)

### Install & Run

```bash
cd flat_search_organizer/wohnungs-checker
npm install
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

### Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
flat_search_organizer/
├── Wohnungs-Checker.js          # Standalone V1 component (reference)
├── README.md
└── wohnungs-checker/            # Vite React app (V2)
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── main.jsx             # App entry point
        ├── App.jsx              # Main component (scoring logic + UI)
        ├── App.css
        └── index.css            # Tailwind directives
```

## Customization

Criteria are defined in the `CRITERIA` object at the top of [src/App.jsx](flat_search_organizer/wohnungs-checker/src/App.jsx). Each criterion has an `id`, `label`, and `icon`. Add, remove, or modify entries to match your requirements. Point weights are configured in the `POINTS` object.

Location options for the KO check are defined in the `LOCATIONS` array.
