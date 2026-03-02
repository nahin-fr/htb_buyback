# Mortgage & HTB Forecaster Implementation

## Overview
This application is a React-based interactive projection tool designed to analyze the long-term financial implications of a Halifax mortgage combined with a UK Help to Buy (HTB) Equity Loan. It simulates wealth accumulation, monthly outgoings, and the financial impact of different HTB staircasing (buyback) strategies.

## Directory Structure
- `src/App.jsx`: Main application container, manages global state, routing between tabs, and calculation execution.
- `src/components/SidebarInputs.jsx`: The left-hand control panel handling user inputs (property value, mortgage details, assumptions).
- `src/components/ResultsDashboard.jsx`: The main data visualization view containing the three tabs (Asset Wealth, Monthly Outgoings, HTB Staircasing).
- `src/utils/finance.js`: The core mathematical engine containing all financial simulation logic.

## Core Mathematical Engine (`src/utils/finance.js`)

The engine operates via a month-by-month simulation loop (`simulateMortgage`), projecting financials up to 33 years into the future.

### Key Functions:
1. **`calculateMonthlyPayment(principal, annualRate, months)`**
   Standard amortization formula to calculate the fixed monthly payment required to clear a loan over a given term.

2. **`simulateMortgage(params)`**
   The baseline simulator. Loops over the `remainingTermMonths`.
   - Applies `propertyAnnualGrowth` monthly to the property value.
   - Applies `htbAnnualInterestGrowth` yearly to the HTB interest rate.
   - Calculates mortgage interest, principal paydown, and HTB interest fees.
   - Handles the "Rate Crossover" calculation, finding the exact year where the effective cost of the HTB loan (nominal rate + property growth cost) exceeds the assumed remortgage rate.

3. **`simulateWithStaircase(params, staircaseMonths)`**
   Simulates the financial impact of executing a staircasing event at specific months.
   - When a staircasing month hits, the engine calculates the buyback cost (current value * % share) + valuation fee.
   - This sum is added to the total `mortgageBalance`.
   - **Crucial Logic**: The monthly mortgage payment is immediately recalculated (`currentPayment`) to afford the larger balance over the remaining term at the active rate.
   - Calculates the distinct total cost (HTB interest paid + extra mortgage interest + buyback cost).

4. **`calculateStaircasingOptions(params, baselineCost)`**
   Generates the "Net Savings" cost curve.
   - Iterates through the next 25 years in 12-month increments.
   - For each year, it runs `simulateWithStaircase` and compares the `totalCost` against the `baselineCost` (never staircasing).
   - Generates the data required for the "Savings If You Staircase at..." bar chart, including the `requiredIncome` affordability calculation.

## Understanding the HTB Staircasing Trade-off
The hardest concept to visualize, successfully implemented in the HTB tab, is the true cost of delaying an HTB buyback:
- **Delaying** saves you from immediately paying higher bank mortgage interest on the buyback amount.
- **But**, delaying means the government's 40% equity share grows in absolute £ value as the property appreciates.
- The charts prove mathematically that if `Remortgage Rate < (HTB Nominal Rate + Property Growth Rate)`, it is cheaper to borrow money from the bank to pay off the government ASAP.
