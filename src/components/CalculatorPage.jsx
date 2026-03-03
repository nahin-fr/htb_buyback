import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileDown, Loader2 } from 'lucide-react';
import './../index.css';
import SidebarInputs from './SidebarInputs';
import ResultsDashboard from './ResultsDashboard';
import { generateProjection, calculateStaircasingOptions } from '../utils/finance';
import { fetchLatestCpi, fetchLatestBoEBaseRate } from '../utils/rates';


function CalculatorPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [params, setParams] = useState({
    simulationMonth: new Date().getMonth() + 1, // current month (1-12)
    simulationYear: new Date().getFullYear(),
    initialPropertyValue: 400000,
    htbPercentage: 0.20,
    htbCurrentInterestRate: 0.0175,
    htbAnnualInterestGrowth: 0.025,
    currentMortgageBalance: 200000,
    currentMortgageRate: 0.05,
    remortgageMonth: 6,
    remortgageYear: 2026,
    newMortgageRate: 0.045,
    remainingTermYears: 25,
    remainingTermExtraMonths: 0,
    propertyAnnualGrowth: 0.03,
  });

  useEffect(() => {
    async function loadRates() {
      const [cpi, boe] = await Promise.all([
        fetchLatestCpi(),
        fetchLatestBoEBaseRate()
      ]);

      setParams(prev => {
        const updates = {};
        if (cpi !== null) {
          // Standard HTB rise is CPI + 2% (0.02)
          // We set it as a decimal (e.g., 0.03 + 0.02 = 0.05)
          updates.htbAnnualInterestGrowth = cpi + 0.02;
        }
        if (boe !== null) {
          // Default remortgage rate to exactly the BoE base rate
          updates.newMortgageRate = boe;
        }

        if (Object.keys(updates).length > 0) {
          console.log('Autopopulating rates:', updates);
          return { ...prev, ...updates };
        }
        return prev;
      });
    }

    loadRates();
  }, []);

  const remainingTermMonths = (params.remainingTermYears * 12) + params.remainingTermExtraMonths;

  const projection = useMemo(() => {
    const currentYear = params.simulationYear;
    const currentMonth = params.simulationMonth;

    let monthsRemaining = ((params.remortgageYear - currentYear) * 12) + (params.remortgageMonth - currentMonth);
    if (monthsRemaining < 0) monthsRemaining = 0; // Prevent negative lookup if they pick a past date

    return generateProjection({
      ...params,
      originalHtbValue: params.initialPropertyValue * params.htbPercentage,
      remainingTermMonths,
      fixedRateMonthsRemaining: monthsRemaining
    });
  }, [params, remainingTermMonths]);

  const staircasingResults = useMemo(() => {
    const currentYear = params.simulationYear;
    const currentMonth = params.simulationMonth;
    let monthsRemaining = ((params.remortgageYear - currentYear) * 12) + (params.remortgageMonth - currentMonth);
    if (monthsRemaining < 0) monthsRemaining = 0;

    return calculateStaircasingOptions(
      { ...params, originalHtbValue: params.initialPropertyValue * params.htbPercentage, remainingTermMonths, fixedRateMonthsRemaining: monthsRemaining },
      1,  // always 1 full buyback
      0   // no valuation fee
    );
  }, [params, remainingTermMonths]);

  return (
    <div className="app-container" style={{ display: 'flex', height: '100vh', padding: '24px', gap: '24px', overflow: 'hidden' }}>
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px', height: '100%', overflow: 'hidden' }}>

        {/* Header */}
        <header className="glass-panel fade-in" style={{ padding: '24px', flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'inherit' }}>
            <img src="/logo_dark.webp" alt="BuyBack HTB Logo" width="36" height="36" style={{ height: '36px', width: '36px', borderRadius: '6px', objectFit: 'contain' }} />
            <div>
              <h1 className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                BuyBack HTB
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0 }}>
                Mortgage & Equity Simulator
              </p>
            </div>
          </Link>

          {/* Right-side actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            {/* Export PDF Button */}
            <button
              id="export-pdf-btn"
              disabled={isGenerating}
              onClick={async () => {
                if (isGenerating) return;
                setIsGenerating(true);
                try {
                  const generatedAt = new Date().toLocaleString('en-GB', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  // Dynamically import heavy PDF generation libraries
                  const { pdf } = await import('@react-pdf/renderer');
                  const { default: PDFReport } = await import('./PDFReport');

                  const doc = (
                    <PDFReport
                      params={params}
                      projection={projection}
                      staircasingResults={staircasingResults}
                      generatedAt={generatedAt}
                    />
                  );

                  const blob = await pdf(doc).toBlob();
                  const filename = `BuyBack-HTB-Report-${new Date().toISOString().slice(0, 10)}.pdf`;

                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = filename;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                } catch (error) {
                  console.error('PDF Generation failed:', error);
                  alert('Failed to generate PDF. Please check the console for errors.');
                } finally {
                  setIsGenerating(false);
                }
              }}
              title="Export full report as PDF"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: '10px',
                border: '1px solid rgba(99, 179, 237, 0.4)',
                background: isGenerating
                  ? 'rgba(99, 179, 237, 0.08)'
                  : 'rgba(99, 179, 237, 0.12)',
                color: '#63b3ed',
                fontSize: '14px',
                fontWeight: 600,
                cursor: isGenerating ? 'wait' : 'pointer',
                transition: 'background-color 0.2s ease, transform 0.2s ease, opacity 0.2s ease',
                backdropFilter: 'blur(8px)',
                opacity: isGenerating ? 0.7 : 1,
              }}
              onMouseOver={(e) => {
                if (!isGenerating) {
                  e.currentTarget.style.background = 'rgba(99, 179, 237, 0.2)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseOut={(e) => {
                if (!isGenerating) {
                  e.currentTarget.style.background = 'rgba(99, 179, 237, 0.12)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              {isGenerating ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <FileDown size={16} />
              )}
              {isGenerating ? 'Generating…' : 'Export PDF'}
            </button>

            {/* Ko-fi */}
            <a
              href="https://ko-fi.com/buybackhtb"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-block', transition: 'transform 0.2s ease' }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              aria-label="Support me on Ko-fi"
            >
              <img
                height="36"
                style={{ border: '0', height: '36px' }}
                src="https://storage.ko-fi.com/cdn/kofi2.png?v=3"
                alt="Buy Me a Coffee at ko-fi.com"
              />
            </a>
          </div>
        </header>

        {/* Main Workspace */}
        <div style={{ display: 'flex', gap: '24px', flex: 1, overflow: 'hidden' }}>

          <SidebarInputs params={params} setParams={setParams} />

          <ResultsDashboard projection={projection} params={params} staircasingResults={staircasingResults} />

        </div>

        {/* Footer Disclaimer */}
        <footer style={{ marginTop: 'auto', padding: '16px 24px', textAlign: 'center', borderTop: '1px solid var(--glass-border)', color: 'var(--text-muted)', fontSize: '11px', lineHeight: '1.6' }}>
          <p>
            <strong>Disclaimer:</strong> This tool is for illustrative purposes only and does not constitute financial advice.
            Projections are based on mathematical models and assumed growth rates which may not reflect actual future performance.
            Always consult with a qualified financial advisor before making decisions regarding your mortgage or Help to Buy equity loan.
            Latest CPI and Bank of England rates are fetched from official sources (ONS/BoE) where available.
            For feedback or inquiries, contact <a href="mailto:feedback@buybackhtb.com" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>feedback@buybackhtb.com</a>.
          </p>
        </footer>
      </main>
    </div>
  );
}

export default CalculatorPage;
