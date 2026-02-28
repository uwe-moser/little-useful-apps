# Real Estate Financing Calculator

A single-page React application that calculates mortgage financing scenarios for real estate purchases. It computes monthly payments, loan terms, and remaining debt based on configurable inputs like purchase price, equity, interest rate, and repayment rate.

Acquisition costs are preconfigured for Munich/Bavaria (8.57%: land transfer tax, notary fees, broker commission).

## Features

- **Interactive sliders and inputs** for purchase price, equity, interest rate, and repayment rate
- **Live recalculation** of monthly bank rate, interest/repayment split, and total monthly cost
- **Loan-to-Value (LTV)** bar visualization showing equity vs. loan ratio
- **Forecast section** with estimated full repayment term and remaining debt after 10 years
- **Error handling** when equity is insufficient to cover acquisition costs

## Tech Stack

- **React 19** — UI framework
- **Vite 7** — build tool and dev server
- **Tailwind CSS 3** — utility-first styling
- **Lucide React** — icon set

A standalone Python version (`real_estate_calculator.py`) with the same calculation logic is included for CLI usage.

## Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)

### Install & Run

```bash
cd immobilien-rechner
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
real_estate_calculator/
├── immobilien-rechner/       # React app (Vite)
│   ├── src/
│   │   ├── App.jsx           # Main calculator component
│   │   ├── main.jsx          # Entry point
│   │   └── index.css         # Tailwind imports
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── real_estate_calculator.py  # Standalone Python version
```