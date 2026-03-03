# BuyBack HTB Implementation

## Overview
React client-side tool for projecting the long-term financial impact of a UK mortgage combined with a Help to Buy (HTB) Equity Loan. All calculations run in the browser. No backend.

## Directory Structure
- `src/App.jsx` — Global state, derives `originalHtbValue` from `initialPropertyValue × htbPercentage`, passes computed params into both simulation functions via `useMemo`. Auto-fetches live CPI and BoE base rate on load.
- `src/components/SidebarInputs.jsx` — Input panel. Rate fields display in % (e.g. 4.79) and convert to/from decimal internally. `originalHtbValue` is not a user input — derived automatically.
- `src/components/ResultsDashboard.jsx` — Four tabs: Buy Out HTB Equity Loan, Monthly Payments, Home & Debt, Assumptions.
- `src/utils/finance.js` — Core math engine.

## Core Mathematical Engine (`src/utils/finance.js`)

### Key Functions

**`calculateMonthlyPayment(principal, annualRate, months)`**
Standard amortization formula. Called whenever balance or rate changes.

**`generateProjection(params)`**
Month-by-month baseline loop over `remainingTermMonths`:
- Monthly compound property appreciation
- Annual HTB interest rate escalation (at month % 12 === 0)
- Fixed-rate period → new rate switch at `fixedRateMonthsRemaining`
- HTB interest charged on `originalHtbValue` (the derived equity amount)

**`simulateWithStaircase(params, staircaseMonths)`**
Runs a full projection with a buyback event at the given month(s):
- Buyback cost = `currentPropertyValue × htbPercentage` (added to mortgage balance)
- Monthly payment **immediately recalculated** after balance changes — skipping this causes negative amortization
- HTB interest scales proportionally if partial buyback

**`calculateStaircasingOptions(params)`**
Iterates 25 years in 12-month steps, running `simulateWithStaircase` each time:
- Compares `totalCost` to baseline (never buying out)
- Derives `effectiveHtbRate = (annualHtbCost / buybackCostAtYear) + propertyAnnualGrowth`
- Finds "Breaking Point" year where effective HTB rate exceeds remortgage rate
- Calculates `requiredIncome` affordability using UK 4.5× income multiple / 35% monthly cap

## Key Domain Rule
**Effective HTB cost = Nominal HTB Rate + Property Growth Rate**

The HTB Equity Loan tracks the property value, so the government's share grows in absolute £ terms as the property appreciates. This "hidden cost" is why buying out can be cheaper than the nominal interest rate suggests.

**Breaking Point** = first year where `(HTB nominal rate + property growth %) > remortgage rate`. After this, a bank mortgage is cheaper than keeping the HTB Equity Loan.
