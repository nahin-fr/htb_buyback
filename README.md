# Mortgage & HTB Forecaster

An interactive React-based projection tool designed to analyze the long-term financial implications of a traditional mortgage combined with a UK Help to Buy (HTB) Equity Loan.

## Overview
This application helps homeowners with a Help to Buy equity loan visualize their wealth accumulation, monthly outgoings, and decide when is the optimal time to staircase (buy back the government's share). 

It simulates up to 33 years into the future, dynamically responding to inputs like property growth, remortgage rates, and HTB interest escalation.

## Key Features
- **Asset Wealth Projection:** Visualizes property value growth versus the shrinking mortgage and growing HTB debt over 33 years.
- **Monthly Outgoings:** A detailed 5-year breakdown of monthly costs, showing the exact point remortgage rates or HTB interest fees kick in.
- **HTB Staircasing Decision Engine:**
  - Calculates the net savings or loss of staircasing at any point in the future.
  - Determines the "Rate Crossover" point—the exact year when keeping the HTB loan becomes mathematically more expensive than borrowing from the bank to clear it.
  - Projects the required household income needed to afford the larger remortgage at each future staircasing point.

## Tech Stack
- React (Vite)
- Tailwind CSS (via inline utilities and customized variables)
- Chart.js (react-chartjs-2)
- Recharts (for outgoings)
- Lucide React (Icons)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:5173` in your browser.

## Documentation
- `implementation.md`: Technical breakdown of the mathematical engine and simulation loops.
- `AGENTS.md`: Guidelines and logic structures for AI assistants interacting with this codebase.
