# AI Agent Guidelines

This document outlines the rules and technical context for AI agents (like Cursor, Copilot, or Antigravity) working within this Mortgage & HTB Forecaster repository.

## 1. Application Context
*   **Purpose:** The tool is a deterministic financial simulator. It calculates the long-term wealth and cash flow implications of Help to Buy (HTB) staircasing decisions.
*   **Tech Stack:** React, Vite, Tailwind CSS (inline styles/utilities), Chart.js.
*   **No Back-end:** All calculations happen client-side in the browser. 

## 2. Core Mathematical Rules
*   Never alter `src/utils/finance.js` without explicit user permission and a rigorous mathematical dry-run. 
*   **Staircasing logic:** If a user staircases, their mortgage balance *must* increase by the buyback cost, and their monthly payment *must* be recalculated immediately, even if they are within a fixed-rate period.
*   **Negative Amortization Warning:** Always ensure that generated monthly payments map correctly to the simulated balance. Failing to recalculate the payment will cause negative amortization (interest debt exploding).
*   **Rate Crossover:** The true cost of HTB includes capital appreciation. The effective HTB rate = Nominal HTB Interest Rate + Property Growth Rate.

## 3. UI and Styling Rules
*   Do not introduce standard CSS files unless necessary. The project currently relies heavily on inline styles using standard CSS properties (e.g., `style={{ display: 'flex' }}`) and some standard React patterns.
*   Maintain the dark mode aesthetic (`#0f172a` backgrounds, standard vibrant colors for charts: green for savings, red for costs, purple for HTB).

## 4. Interaction Protocol
*   When debugging mathematical discrepancies, *always* start by logging the variables over time (e.g., month 1 vs month 13) within `simulateWithStaircase`.
*   When adding new features to the dashboard, ensure they are responsive and fit within the existing grid/flexbox layout. Use `InfoTip` components heavily to explain financial terminology to the user.
