---
name: htb-mortgage-specialist
description: Use when working on the UK Help to Buy (HTB) mortgage forecaster codebase — modifying finance.js, debugging simulation output, adding UI tabs, interpreting rate crossover logic, or answering questions about staircasing, amortization, or HTB equity calculations. Not for generic mortgage or finance questions unrelated to this repo.
---

# HTB Mortgage Specialist

## Overview

This codebase is a deterministic, client-side React financial simulator for UK Help to Buy equity loans. All math runs in `src/utils/finance.js`. No backend. No tests. The simulation is the source of truth.

## Critical Domain Concepts

### Effective HTB Loan Cost

> **Effective HTB Rate = Nominal HTB Interest Rate + Property Annual Growth Rate**

This is the most commonly misunderstood formula. Because the HTB loan tracks *property value* (not a fixed principal), the government's equity stake grows in absolute £ terms as the property appreciates. The true annual cost of holding the HTB loan is therefore the nominal fee *plus* the appreciation you're giving away.

**Rate Crossover** = the year when `(Nominal HTB Rate + Property Growth %) > Assumed Remortgage Rate`. Past this point, it is mathematically cheaper to borrow from the bank to clear the HTB loan.

### Staircasing Invariant (Most Critical Rule)

When a staircase event fires:
1. `mortgageBalance += buybackCost` (buyback cost = `currentPropertyValue × htbPercentage`)
2. **Immediately recalculate `currentPayment`** using `calculateMonthlyPayment(newBalance, activeRate, remainingMonths)`

**Never defer this recalculation.** Deferring causes **negative amortization** — the monthly payment becomes insufficient to cover interest, so the balance grows instead of shrinks. This compounds silently across months and corrupts all downstream figures (total interest paid, LTV, wealth projections).

### HTB Interest Rate Escalation

`rate(year N) = initialRate × (1 + htbAnnualInterestGrowth)^(N-1)`

The rate compounds annually. Year 1 = base rate. Year 3 at 2.6% growth: `rate × 1.026²`.

## Key Functions in `src/utils/finance.js`

| Function | Purpose |
|---|---|
| `calculateMonthlyPayment(principal, annualRate, months)` | Standard amortization formula. Call this whenever balance or term changes. |
| `simulateMortgage(params)` / `generateProjection(params)` | Baseline month-by-month loop. No staircase. |
| `simulateWithStaircase(params, staircaseMonths)` | Adds buyback to balance at trigger month; recalculates payment immediately. |
| `calculateStaircasingOptions(params, ...)` | Iterates 25 years × 12-month increments, runs `simulateWithStaircase` each time to build savings curve. |

**Do not modify `finance.js` without a full mathematical dry-run.** Trace month 1 vs month 13 values manually before committing.

## Debugging Math Discrepancies

Start inside `simulateWithStaircase` — log variables at the staircase month and adjacent months:

```js
// Add inside simulateWithStaircase at the staircase trigger:
console.log({ month, mortgageBalance, buybackCost, newBalance, newPayment, propertyValue });
```

Common root causes:
- Off-by-one on month index when checking `staircaseMonths.includes(month)`
- Payment not recalculated after balance update → negative amortization
- HPI applied as percentage (3.0) instead of decimal (0.03)
- HTB rate growth applied monthly instead of annually

## Styling Rules

- **Inline styles only**: `style={{ display: 'flex', color: '#22c55e' }}`. No new `.css` files.
- Dark theme base: `#0f172a` background. Chart palette: green = savings, red = costs, purple = HTB.
- Add `InfoTip` components to explain any new financial term shown in the UI.
- CSS variables are defined in `src/index.css`. Use `var(--text-muted)` etc. rather than raw hex where variables exist.

## Common Mistakes

| Mistake | Correct Approach |
|---|---|
| Comparing `HTB_rate > mortgage_rate` for crossover | Use `HTB_rate + propertyGrowth > mortgage_rate` |
| Adding a new `.css` file for chart styles | Use inline `style={{}}` prop |
| Logging in `simulateMortgage` for staircase bugs | Log inside `simulateWithStaircase` |
| Recalculating payment at next remortgage after staircase | Recalculate immediately in the same month |
| Treating HTB loan as fixed-principal debt | HTB balance = `currentPropertyValue × htbPercentage` — it grows with HPI |
