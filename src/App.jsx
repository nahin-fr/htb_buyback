import { useState, useMemo } from 'react';
import './index.css';
import SidebarInputs from './components/SidebarInputs';
import ResultsDashboard from './components/ResultsDashboard';
import { generateProjection, calculateStaircasingOptions } from './utils/finance';

function App() {
  const [params, setParams] = useState({
    initialPropertyValue: 520505,
    originalHtbValue: 186000,
    htbPercentage: 0.40,
    htbCurrentInterestRate: 0.018147,
    htbAnnualInterestGrowth: 0.026,
    currentMortgageBalance: 224825.19,
    currentMortgageRate: 0.0479,
    remortgageMonth: 4,
    remortgageYear: 2026,
    newMortgageRate: 0.045,
    remainingTermYears: 33,
    remainingTermExtraMonths: 4,
    propertyAnnualGrowth: 0.02,
  });

  const remainingTermMonths = (params.remainingTermYears * 12) + params.remainingTermExtraMonths;

  const projection = useMemo(() => {
    // Calculate how many months from "now" (Assume March 2026 is month 0 / start)
    // Month 1 in projection = April 2026.
    const currentYear = 2026;
    const currentMonth = 3; // March

    // (YearDiff * 12) + (TargetMonth - CurrentMonth)
    let monthsRemaining = ((params.remortgageYear - currentYear) * 12) + (params.remortgageMonth - currentMonth);
    if (monthsRemaining < 0) monthsRemaining = 0; // Prevent negative lookup if they pick a past date

    return generateProjection({
      ...params,
      remainingTermMonths,
      fixedRateMonthsRemaining: monthsRemaining
    });
  }, [params, remainingTermMonths]);

  const staircasingResults = useMemo(() => {
    const currentYear = 2026;
    const currentMonth = 3;
    let monthsRemaining = ((params.remortgageYear - currentYear) * 12) + (params.remortgageMonth - currentMonth);
    if (monthsRemaining < 0) monthsRemaining = 0;

    return calculateStaircasingOptions(
      { ...params, remainingTermMonths, fixedRateMonthsRemaining: monthsRemaining },
      1,  // always 1 full buyback
      0   // no valuation fee
    );
  }, [params, remainingTermMonths]);

  return (
    <div className="app-container" style={{ display: 'flex', height: '100vh', padding: '24px', gap: '24px', overflow: 'hidden' }}>
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px', height: '100%', overflow: 'hidden' }}>

        {/* Header */}
        <header className="glass-panel fade-in" style={{ padding: '24px', flexShrink: 0 }}>
          <h1 className="text-gradient" style={{ fontSize: '2rem', marginBottom: '8px' }}>
            Mortgage & HTB Forecaster
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Interactive projection tool to analyze your property growth, Halifax mortgage, and Help to Buy Equity Loan.
          </p>
        </header>

        {/* Main Workspace */}
        <div style={{ display: 'flex', gap: '24px', flex: 1, overflow: 'hidden' }}>

          <SidebarInputs params={params} setParams={setParams} />

          <ResultsDashboard projection={projection} params={params} staircasingResults={staircasingResults} />

        </div>
      </main>
    </div>
  );
}

export default App;
