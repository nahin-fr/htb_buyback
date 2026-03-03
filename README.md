# BuyBack HTB

An interactive React-based projection tool for analysing the long-term financial implications of a UK mortgage combined with a Help to Buy (HTB) Equity Loan.

## Overview

Helps homeowners with a Help to Buy equity loan decide when — or whether — to buy out the government's share (staircase). Simulates up to 40 years into the future, updating in real time as you adjust inputs. Auto-fetches the latest CPI and Bank of England base rate on load to pre-populate key assumptions.

## Key Features

- **Home & Debt Forecast** — Property value growth vs. mortgage balance and HTB Equity Loan over the full term.
- **Monthly Payments** — 5-year breakdown of outgoings showing the exact point where the remortgage rate or HTB interest escalation kicks in.
- **Buy Out HTB Equity Loan** — The core decision engine:
  - Calculates net savings or cost of buying out at any year, compared to never buying out.
  - Interactive bar chart — click any year to see a full breakdown in the Key Insight panel.
  - Determines the **Breaking Point** — the year when keeping the HTB Equity Loan becomes more expensive than a bank mortgage.
  - Projects the minimum household income needed to qualify for the larger mortgage at each future buyout date.
- **Assumptions tab** — Documents all calculation assumptions for transparency.

## Tech Stack

- React 19 + Vite
- Chart.js (react-chartjs-2)
- Lucide React (icons)
- CSS custom properties + inline styles (dark theme)

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Documentation

- `implementation.md` — Mathematical engine, simulation functions, and key domain rules.
- `AGENTS.md` — Guidelines for AI assistants working in this codebase.

## Disclaimer

For illustrative purposes only. Does not constitute financial advice. Always consult a qualified financial adviser before making decisions about your mortgage or Help to Buy equity loan.
