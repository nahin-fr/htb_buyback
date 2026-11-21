# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install       # Install dependencies
npm run dev       # Start dev server at http://localhost:5173
npm run build     # Production build
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

There are no tests in this project.

## Architecture

**Pure client-side React app** (no backend). All financial calculations occur in the browser.

### Data Flow

`App.jsx` holds all state (`params`) and drives two `useMemo` computations:
1. `generateProjection(params)` → passed to `ResultsDashboard` for wealth/outgoings charts
2. `calculateStaircasingOptions(params, ...)` → passed to `ResultsDashboard` for the HTB tab

`SidebarInputs` renders input controls and calls `setParams` to update state. Both computations re-run reactively.

### Key Files

- **`src/utils/finance.js`** — The core mathematical engine. **Do not modify without a full mathematical dry-run.** Contains:
  - `calculateMonthlyPayment(principal, annualRate, months)` — standard amortization formula
  - `simulateMortgage(params)` — month-by-month baseline simulation (33-year horizon)
  - `simulateWithStaircase(params, staircaseMonths)` — simulates staircasing events; when triggered, adds buyback cost to mortgage balance and **immediately recalculates monthly payment** to prevent negative amortization
  - `generateProjection(params)` — wraps `simulateMortgage`
  - `calculateStaircasingOptions(params, baselineCost)` — iterates 25 years in 12-month steps, calling `simulateWithStaircase` each time to build the net savings curve

- **`src/App.jsx`** — Global state, `useMemo` calculations, hardcoded baseline date (March 2026 = month 0)

- **`src/components/SidebarInputs.jsx`** — Input panel (property value, mortgage details, rate assumptions)

- **`src/components/ResultsDashboard.jsx`** — Three-tab visualization (Asset Wealth, Monthly Outgoings, HTB Staircasing)

## Domain Rules

**HTB (Help to Buy) Staircasing:** The effective cost of the HTB loan = Nominal HTB Interest Rate + Property Growth Rate. The "Rate Crossover" is the year when keeping the HTB loan exceeds the remortgage rate — this is the key decision point.

**Critical staircasing invariant:** When a staircase event fires, `mortgageBalance += buybackCost`, then `currentPayment` must be recalculated immediately using `calculateMonthlyPayment`. Skipping the recalculation causes negative amortization.

**Debugging math issues:** Add logging inside `simulateWithStaircase` comparing variables at month 1 vs month 13.

## Styling

- Dark theme: `#0f172a` background. Chart colors: green = savings, red = costs, purple = HTB.
- Styling is inline (`style={{ ... }}`) plus CSS variables in `src/index.css`. No external CSS files.
- Use `InfoTip` components to explain financial terminology in new UI sections.
- ESLint rule: uppercase-starting variable names are exempt from `no-unused-vars`.

- Project skill: `.agents/skills/htb-mortgage-specialist` (linked at `.claude/skills/`) holds the HTB staircasing domain rules and debugging tips.
