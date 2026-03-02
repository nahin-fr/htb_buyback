import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Wallet, Home, TrendingUp, BarChart2, LineChart, Sparkles } from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function ResultsDashboard({ projection, params, staircasingResults }) {
    const [viewMode, setViewMode] = useState('line'); // 'line' or 'bar'
    const [activeTab, setActiveTab] = useState('asset'); // 'asset', 'outgoings', or 'staircase'

    if (!projection || projection.length === 0) return null;

    const currentMonth = projection[0];
    const endMonth = projection[projection.length - 1];

    // Find the first month where the active rate is the new rate
    // If the fix is already over (0 months remaining), that's month 1. Otherwise it's month fixedRateMonthsRemaining + 1.
    const remortgageIndex = projection.findIndex(p => p.activeMortgageRate !== currentMonth.activeMortgageRate);
    const startIndex = remortgageIndex === -1 ? 0 : remortgageIndex;

    // Average outgoings over the fixed term length (e.g., 5 years)
    const fixedTermMonths = (params?.remortgageTermLengthNum || 5) * 12;
    const remortgagePeriod = projection.slice(startIndex, startIndex + fixedTermMonths);

    const avgMortgage = remortgagePeriod.reduce((sum, p) => sum + p.mortgagePayment, 0) / remortgagePeriod.length;
    const avgHtb = remortgagePeriod.reduce((sum, p) => sum + p.htbInterestPayment, 0) / remortgagePeriod.length;
    const avgOutgoings = avgMortgage + avgHtb;

    // We'll show data in yearly intervals for clarity in the charts
    const yearlyData = projection.filter((_, i) => i % 12 === 0);

    const labels = yearlyData.map(p => {
        const d = new Date(2026, 2 + p.month, 1);
        return `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
    });

    const lineChartData = {
        labels,
        datasets: [
            {
                label: 'Total Debt (Mortgage + HTB)',
                data: yearlyData.map(p => p.totalDebt),
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                tension: 0.4,
                fill: true,
            },
            {
                label: 'Property Value',
                data: yearlyData.map(p => p.propertyValue),
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4,
                fill: true,
            },
            {
                label: 'User Equity',
                data: yearlyData.map(p => p.userEquity),
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true,
            }
        ]
    };

    const barChartData = {
        labels,
        datasets: [
            {
                label: 'HTB Equity Loan',
                data: yearlyData.map(p => p.htbEquityValue),
                backgroundColor: 'rgba(239, 68, 68, 0.8)', // red
            },
            {
                label: 'Mortgage Balance',
                data: yearlyData.map(p => p.mortgageBalance),
                backgroundColor: 'rgba(59, 130, 246, 0.8)', // blue
            },
            {
                label: 'User Equity',
                data: yearlyData.map(p => p.userEquity),
                backgroundColor: 'rgba(16, 185, 129, 0.8)', // green
            }
        ]
    };

    const shortTermData = projection.slice(0, 60); // 5 years
    const shortTermLabels = shortTermData.map(p => {
        const d = new Date(2026, 2 + p.month, 1);
        return `${d.toLocaleString('default', { month: 'short' })} '${d.getFullYear().toString().slice(-2)}`;
    });

    const outgoingsChartData = {
        labels: shortTermLabels,
        datasets: [
            {
                label: 'Mortgage Payment (Principal)',
                data: shortTermData.map(p => p.mortgagePrincipalMonth),
                backgroundColor: 'rgba(59, 130, 246, 0.8)', // blue
            },
            {
                label: 'Mortgage Payment (Interest)',
                data: shortTermData.map(p => p.mortgageInterestMonth),
                backgroundColor: 'rgba(59, 130, 246, 0.4)', // light blue
            },
            {
                label: 'HTB Interest',
                data: shortTermData.map(p => p.htbInterestPayment),
                backgroundColor: 'rgba(239, 68, 68, 0.8)', // red
            }
        ]
    };

    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        color: '#94a3b8',
        plugins: {
            legend: {
                position: 'top',
                labels: { color: '#f8fafc' }
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(context.parsed.y);
                        }

                        return label;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: '#94a3b8' },
                stacked: viewMode === 'bar',
            },
            y: {
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: {
                    color: '#94a3b8',
                    callback: (value) => '£' + (value / 1000) + 'k'
                },
                stacked: viewMode === 'bar' || activeTab === 'outgoings',
            }
        }
    };

    const outgoingsOptions = {
        ...commonOptions,
        scales: {
            x: {
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: '#94a3b8', maxRotation: 45, minRotation: 45 },
                stacked: true,
            },
            y: {
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: {
                    color: '#94a3b8',
                    callback: (value) => '£' + value.toLocaleString()
                },
                stacked: true,
            }
        }
    };

    const SummaryCard = ({ icon: Icon, label, value, subtext, highlight }) => (
        <div className="glass-panel" style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                <Icon size={18} color={highlight || 'var(--text-main)'} />
                <span style={{ fontSize: '14px', fontWeight: 500 }}>{label}</span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: highlight || 'var(--text-main)' }}>
                {value}
            </div>
            {subtext && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{subtext}</div>}
        </div>
    );

    return (
        <section className="fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px', animationDelay: '0.2s', overflow: 'hidden' }}>
            {/* Metric Cards */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <SummaryCard
                    icon={Wallet}
                    label="Current Total Outgoings"
                    value={`£${currentMonth.totalMonthlyOutgoings.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo`}
                    subtext={`Mortgage: £${currentMonth.mortgagePayment.toFixed(0)} | HTB: £${currentMonth.htbInterestPayment.toFixed(0)}`}
                    highlight="var(--accent-primary)"
                />
                <SummaryCard
                    icon={TrendingUp}
                    label={`Avg Remortgage Outgoings (per mo)`}
                    value={`£${avgOutgoings.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                    subtext={`Mortgage: £${avgMortgage.toFixed(0)} | HTB: £${avgHtb.toFixed(0)} | Assumed ${fixedTermMonths / 12}-yr fix`}
                    highlight="var(--warning)"
                />
                <SummaryCard
                    icon={Home}
                    label="End-of-Term Equity (if no HTB buyback)"
                    value={`£${endMonth.userEquity.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                    subtext={`Prop: £${endMonth.propertyValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} | HTB Debt: £${endMonth.htbEquityValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                    highlight="var(--success)"
                />
            </div>

            {/* Chart */}
            <div className="glass-panel" style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px' }}>
                    <div style={{ display: 'flex', gap: '24px' }}>
                        <button
                            onClick={() => setActiveTab('asset')}
                            style={{ background: 'none', border: 'none', color: activeTab === 'asset' ? '#fff' : 'var(--text-muted)', fontSize: '18px', fontWeight: 600, cursor: 'pointer', padding: '0 8px 8px', borderBottom: activeTab === 'asset' ? '2px solid var(--accent-primary)' : '2px solid transparent', marginBottom: '-17px' }}
                        >
                            Asset Wealth ({Math.floor(projection.length / 12)} Yrs)
                        </button>
                        <button
                            onClick={() => setActiveTab('outgoings')}
                            style={{ background: 'none', border: 'none', color: activeTab === 'outgoings' ? '#fff' : 'var(--text-muted)', fontSize: '18px', fontWeight: 600, cursor: 'pointer', padding: '0 8px 8px', borderBottom: activeTab === 'outgoings' ? '2px solid var(--accent-primary)' : '2px solid transparent', marginBottom: '-17px' }}
                        >
                            Monthly Outgoings (5 Yrs)
                        </button>
                        <button
                            onClick={() => setActiveTab('staircase')}
                            style={{ background: 'none', border: 'none', color: activeTab === 'staircase' ? '#fff' : 'var(--text-muted)', fontSize: '18px', fontWeight: 600, cursor: 'pointer', padding: '0 8px 8px', borderBottom: activeTab === 'staircase' ? '2px solid var(--success)' : '2px solid transparent', marginBottom: '-17px' }}
                        >
                            HTB Staircasing
                        </button>
                    </div>
                    {activeTab === 'asset' && (
                        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '4px' }}>
                            <button
                                onClick={() => setViewMode('line')}
                                style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: viewMode === 'line' ? 'var(--accent-primary)' : 'transparent', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}
                            >
                                <LineChart size={16} /> Trends
                            </button>
                            <button
                                onClick={() => setViewMode('bar')}
                                style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: viewMode === 'bar' ? 'var(--accent-primary)' : 'transparent', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}
                            >
                                <BarChart2 size={16} /> Breakdown
                            </button>
                        </div>
                    )}
                </div>

                <div style={{ flex: 1, position: 'relative' }}>
                    {activeTab === 'asset' ? (
                        viewMode === 'line' ? <Line options={commonOptions} data={lineChartData} /> : <Bar options={commonOptions} data={barChartData} />
                    ) : activeTab === 'outgoings' ? (
                        <Bar options={outgoingsOptions} data={outgoingsChartData} />
                    ) : (
                        <StaircasingView staircasingResults={staircasingResults} commonOptions={commonOptions} params={params} />
                    )}
                </div>
            </div>
        </section>
    );
}

function monthToDate(month) {
    const d = new Date(2026, 2 + month, 1);
    return `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
}

function StaircasingView({ staircasingResults, commonOptions, params }) {
    if (!staircasingResults || !staircasingResults.optimal) {
        return <div style={{ padding: '24px', color: 'var(--text-muted)' }}>Calculating optimal staircasing schedule...</div>;
    }

    const { optimal, baseline, costCurve, rateTimeline, crossoverPoint } = staircasingResults;
    const { newMortgageRate = 0.0375 } = params || {};
    const fmt = (v) => '£' + Math.round(Math.abs(v)).toLocaleString();
    const isSavings = optimal.savings > 0;
    const growthPct = ((params?.propertyAnnualGrowth || 0.02) * 100).toFixed(1);

    // Decision support chart — bars for savings + line for required income
    const currentCalendarYear = 2026;
    const savingsChartData = costCurve.length > 0 ? {
        labels: costCurve.map(o => `${currentCalendarYear + Math.round(o.months[0] / 12)}`),
        datasets: [
            {
                label: 'Net Savings',
                data: costCurve.map(o => o.savings),
                backgroundColor: costCurve.map(o => o.savings >= 0 ? 'rgba(16, 185, 129, 0.6)' : 'rgba(239, 68, 68, 0.5)'),
                borderColor: costCurve.map(o => o.savings >= 0 ? '#10b981' : '#ef4444'),
                borderWidth: 1,
                borderRadius: 4,
                yAxisID: 'y',
            },
            // Required income on right axis (line overlay)
            {
                label: 'Required Income',
                data: costCurve.map(o => o.requiredIncome),
                type: 'line',
                borderColor: '#8b5cf6',
                borderDash: [6, 3],
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 0,
                fill: false,
                yAxisID: 'y1',
            },
        ]
    } : null;

    // Build a lookup for rich tooltips
    const costCurveLookup = costCurve.reduce((acc, o, i) => { acc[i] = o; return acc; }, {});

    // Remove duplicate currentCalendarYear — already defined above
    const rateChartData = rateTimeline ? {
        labels: rateTimeline.map(r => `${currentCalendarYear + r.year}`),
        datasets: [
            { label: 'HTB Effective Rate', data: rateTimeline.map(r => r.effectiveHtbRate * 100), borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.08)', tension: 0.4, fill: true, pointRadius: 0 },
            { label: 'Mortgage Rate', data: rateTimeline.map(r => r.mortgageRate * 100), borderColor: '#3b82f6', borderDash: [5, 5], pointRadius: 0 },
            { label: 'HTB Nominal Rate', data: rateTimeline.map(r => r.htbNominalRate * 100), borderColor: '#a855f7', borderDash: [2, 4], pointRadius: 0 },
            // Crossover marker point
            ...(crossoverPoint ? [{
                label: '⬇ Crossover',
                data: rateTimeline.map(r => r.year === crossoverPoint.year ? r.effectiveHtbRate * 100 : null),
                borderColor: '#f59e0b',
                backgroundColor: '#f59e0b',
                pointRadius: rateTimeline.map(r => r.year === crossoverPoint.year ? 8 : 0),
                pointStyle: 'triangle',
                showLine: false,
            }] : []),
        ]
    } : null;

    // Chart options — shared for rate chart, custom for savings chart
    const savingsOpts = {
        ...commonOptions,
        maintainAspectRatio: false,
        plugins: {
            ...commonOptions.plugins,
            legend: { display: false },
            tooltip: {
                callbacks: {
                    title: (items) => {
                        const idx = items[0]?.dataIndex;
                        const year = costCurve[idx] ? currentCalendarYear + Math.round(costCurve[idx].months[0] / 12) : '';
                        return `If you staircase in ${year}`;
                    },
                    label: (ctx) => {
                        const idx = ctx.dataIndex;
                        const entry = costCurve[idx];
                        if (!entry) return '';
                        if (ctx.dataset.label === 'Required Income') {
                            return `Min. household income: £${Math.round(entry.requiredIncome).toLocaleString()}/yr`;
                        }
                        return [
                            `${entry.savings >= 0 ? 'You save' : 'Costs you'}: £${Math.round(Math.abs(entry.savings)).toLocaleString()}`,
                            `New monthly payment: £${Math.round(entry.newMonthlyPayment).toLocaleString()}/mo`,
                            `Buyback cost: £${Math.round(entry.buybackCost).toLocaleString()}`,
                        ];
                    },
                    afterBody: (items) => {
                        const idx = items[0]?.dataIndex;
                        const entry = costCurve[idx];
                        if (!entry) return '';
                        return `Min. income needed: £${Math.round(entry.requiredIncome).toLocaleString()}/yr`;
                    },
                }
            }
        },
        scales: {
            x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8', font: { size: 10 } } },
            y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8', font: { size: 10 }, callback: (v) => '£' + (v / 1000).toFixed(0) + 'k' }, title: { display: true, text: 'Net Savings', color: '#94a3b8', font: { size: 10 } } },
            y1: {
                position: 'right',
                grid: { drawOnChartArea: false },
                ticks: { color: '#8b5cf6', font: { size: 10 }, callback: (v) => '£' + (v / 1000).toFixed(0) + 'k' },
                title: { display: true, text: 'Required Income', color: '#8b5cf6', font: { size: 10 } },
            },
        }
    };

    const makeOpts = (isRate) => ({
        ...commonOptions,
        maintainAspectRatio: false,
        plugins: {
            ...commonOptions.plugins,
            legend: { display: true, labels: { boxWidth: 10, padding: 8, font: { size: 10 }, color: '#94a3b8', filter: (item) => item.text !== '⬇ Crossover' } },
            tooltip: {
                callbacks: {
                    label: (ctx) => {
                        if (ctx.dataset.label === '⬇ Crossover') {
                            return `Crossover at Year ${crossoverPoint?.year}: from this point, it's cheaper to borrow from the bank than keep the HTB loan`;
                        }
                        let l = ctx.dataset.label || '';
                        if (l) l += ': ';
                        l += ctx.parsed.y.toFixed(2) + '%';
                        return l;
                    }
                }
            }
        },
        scales: {
            x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8', maxRotation: 45, font: { size: 10 } } },
            y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8', font: { size: 10 }, callback: (v) => v.toFixed(1) + '%' } },
        }
    });

    const panel = { padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' };

    // Info tooltip component — uses portal + fixed positioning to escape overflow:hidden
    const InfoTip = ({ text }) => {
        const [show, setShow] = React.useState(false);
        const ref = React.useRef(null);
        const [pos, setPos] = React.useState({ top: 0, left: 0 });
        const handleEnter = () => {
            if (ref.current) {
                const rect = ref.current.getBoundingClientRect();
                setPos({ top: rect.bottom + 6, left: rect.left + rect.width / 2 });
            }
            setShow(true);
        };
        return (
            <span ref={ref} style={{ position: 'relative', display: 'inline-block', marginLeft: '5px', verticalAlign: 'middle' }}>
                <span
                    onMouseEnter={handleEnter}
                    onMouseLeave={() => setShow(false)}
                    style={{ cursor: 'help', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '15px', height: '15px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', fontSize: '10px', fontWeight: 700, color: '#94a3b8' }}
                >i</span>
                {show && ReactDOM.createPortal(
                    <div style={{ position: 'fixed', top: pos.top, left: pos.left, transform: 'translateX(-50%)', zIndex: 9999, background: 'rgba(15, 23, 42, 0.97)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px 12px', fontSize: '11px', color: '#e2e8f0', lineHeight: 1.5, width: '280px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)', pointerEvents: 'none', textTransform: 'none', letterSpacing: 'normal', fontWeight: 400 }}>
                        {text}
                    </div>,
                    document.body
                )}
            </span>
        );
    };

    const getCommentary = () => {
        if (!costCurve.length) return null;
        const currentYear = 2026;

        if (optimal.savings > 0) {
            const crossoverYear = crossoverPoint ? currentCalendarYear + crossoverPoint.year : null;
            const timeframeText = crossoverYear
                ? `between now and ${crossoverYear} (your Rate Crossover year)`
                : "as soon as possible";

            return (
                <div style={{ ...panel, background: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.2)', marginTop: '4px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#10b981', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        💡 Key Insight: Staircase {timeframeText}
                    </h4>
                    <p style={{ fontSize: '13px', color: '#e2e8f0', margin: 0, lineHeight: 1.5 }}>
                        Because the effective HTB rate (including {growthPct}% property growth) is higher than your {(newMortgageRate * 100).toFixed(2)}% remortgage rate, keeping the government loan is costing you more than borrowing from the bank to clear it.
                        <strong> Once you pass your Rate Crossover year, it becomes increasingly expensive to keep the HTB loan.</strong>
                    </p>
                </div>
            );
        } else {
            const firstPositive = costCurve.find(c => c.savings > 0);
            if (firstPositive) {
                const posYear = currentCalendarYear + Math.round(firstPositive.months[0] / 12);
                return (
                    <div style={{ ...panel, background: 'rgba(245, 158, 11, 0.05)', borderColor: 'rgba(245, 158, 11, 0.2)', marginTop: '4px' }}>
                        <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#f59e0b', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            💡 Key Insight: Hold off until {posYear} (your Rate Crossover approaches)
                        </h4>
                        <p style={{ fontSize: '13px', color: '#e2e8f0', margin: 0, lineHeight: 1.5 }}>
                            At your {(newMortgageRate * 100).toFixed(2)}% remortgage rate, taking on a larger mortgage right now to clear the HTB loan actually costs you more in interest than you save in HTB fees.
                            The math flips in <strong>{posYear}</strong>, when property growth drives the HTB cost higher than your mortgage rate. Until then, it is cheaper to keep the government loan.
                        </p>
                    </div>
                );
            } else {
                return (
                    <div style={{ ...panel, background: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.2)', marginTop: '4px' }}>
                        <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#ef4444', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            💡 Key Insight: Do Not Staircase Yet
                        </h4>
                        <p style={{ fontSize: '13px', color: '#e2e8f0', margin: 0, lineHeight: 1.5 }}>
                            At your assumed {(newMortgageRate * 100).toFixed(2)}% remortgage rate, buying out the government is consistently more expensive than keeping the HTB loan. The extra mortgage interest you would pay the bank far exceeds the HTB fees you avoid.
                            <strong> Action: </strong> Revisit this if property values surge (increasing the HTB cost) or if mortgage rates drop below the red Effective HTB Cost line on your Rate Comparison chart.
                        </p>
                    </div>
                );
            }
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%', overflow: 'hidden' }}>
            {/* Row 1: Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                {/* Optimal Timing */}
                <div style={{ padding: '14px', borderRadius: '10px', background: '#10b98110', border: '1px solid #10b98130', minWidth: '140px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '5px' }}>✦ Optimal Timing</div>
                    <div style={{ fontSize: '18px', fontWeight: 700 }}>{optimal.months.map(m => monthToDate(m)).join(' → ')}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '3px' }}>1 full buyback · 40% equity</div>
                </div>

                {/* Net Savings with ⓘ */}
                <div style={{ padding: '14px', borderRadius: '10px', background: isSavings ? '#10b98110' : '#ef444410', border: `1px solid ${isSavings ? '#10b98130' : '#ef444430'}`, minWidth: '140px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: isSavings ? '#10b981' : '#ef4444', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '5px' }}>
                        {isSavings ? '✓ Net Savings' : '⚠ Net Cost'}
                        <InfoTip text="Net Savings = (HTB Interest Avoided) + (Capital Appreciation Avoided) - (Extra Bank Mortgage Interest). A positive number means staircasing makes you wealthier over the life of your mortgage." />
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 700 }}>{fmt(optimal.savings)}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '3px' }}>
                        Fees saved: {fmt(optimal.htbInterestSaved)} | Capital saved: {fmt(optimal.capitalCostSaved)} | Extra bank int: {fmt(optimal.extraMortgageInterest)}
                    </div>
                </div>

                {/* Equity Ownership */}
                <div style={{ padding: '14px', borderRadius: '10px', background: '#3b82f610', border: '1px solid #3b82f630', minWidth: '140px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '5px' }}>Equity Ownership</div>
                    <div style={{ fontSize: '18px', fontWeight: 700 }}>60% → 100%</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '3px' }}>Buyback: {fmt(optimal.totalBuybackCost)} remortgaged</div>
                </div>

                {/* Rate Crossover — with hidden capital appreciation explanation */}
                <div style={{ padding: '14px', borderRadius: '10px', background: '#a855f710', border: '1px solid #a855f730', minWidth: '140px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#a855f7', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '5px' }}>
                        Rate Crossover
                        <InfoTip text={`HTB's true cost isn't just the interest fee — it also includes your ${growthPct}% annual property growth. The government's 40% share rises with your home value, so the longer you wait, the more equity you give away. This 'hidden cost' makes the effective HTB rate much higher than the nominal rate.`} />
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 700 }}>{crossoverPoint ? `Year ${crossoverPoint.year}` : 'Never*'}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '3px' }}>
                        {crossoverPoint
                            ? `After year ${crossoverPoint.year}, it's cheaper to borrow from the bank than keep the HTB loan`
                            : `HTB effective rate stays below mortgage rate for 25+ years (incl. ${growthPct}% growth)`
                        }
                    </div>
                </div>
            </div>

            {/* Row 2: Bento chart grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', flex: 1, minHeight: 0 }}>
                {/* Left: Decision Support — Savings + Affordability */}
                <div style={{ ...panel, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <div style={{ marginBottom: '8px' }}>
                        <h4 style={{ fontSize: '13px', fontWeight: 600, margin: 0 }}>
                            Savings If You Staircase at…
                            <InfoTip text="Each bar shows how much you'd save (green) or lose (red) by staircasing at that year vs never buying back. The purple line shows the minimum household income needed to afford the bigger mortgage (based on UK 4.5× income multiple or 35% monthly affordability, whichever is stricter). Hover over a bar for full details." />
                        </h4>
                        <p style={{ fontSize: '10px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                            <span style={{ color: '#10b981' }}>■</span> Saving · <span style={{ color: '#ef4444' }}>■</span> Costs more · <span style={{ color: '#8b5cf6' }}>─</span> Min. income needed (right axis)
                        </p>
                    </div>
                    <div style={{ flex: 1, position: 'relative', minHeight: 0, minWidth: 0, width: '100%' }}>
                        <Bar options={savingsOpts} data={savingsChartData} />
                    </div>
                </div>

                {/* Right: Rate Comparison */}
                <div style={{ ...panel, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <div style={{ marginBottom: '8px' }}>
                        <h4 style={{ fontSize: '13px', fontWeight: 600, margin: 0 }}>
                            Rate Comparison (25 Years)
                            <InfoTip text={`The red line is the TRUE cost of HTB — your nominal interest rate PLUS ${growthPct}% property growth (because the government's share grows with your home). When the red line crosses above the blue line, it becomes cheaper to borrow from the bank to pay off the government.`} />
                        </h4>
                        <p style={{ fontSize: '10px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                            <span title={`True cost of HTB = Nominal Interest + ${growthPct}% Property Growth`} style={{ cursor: 'help' }}><span style={{ color: '#ef4444' }}>■</span> Effective HTB cost</span> ·{' '}
                            <span title="Your assumed remortgage interest rate" style={{ cursor: 'help' }}><span style={{ color: '#3b82f6' }}>━</span> Mortgage rate</span> ·{' '}
                            <span title="The basic HTB interest fee (without the hidden capital appreciation cost)" style={{ cursor: 'help' }}><span style={{ color: '#a855f7' }}>┈</span> HTB nominal</span>
                            {crossoverPoint && <span style={{ color: '#f59e0b', marginLeft: '6px' }}>▲ = crossover point</span>}
                        </p>
                    </div>
                    <div style={{ flex: 1, position: 'relative', minHeight: 0, minWidth: 0, width: '100%' }}>
                        {rateChartData && <Line options={makeOpts(true)} data={rateChartData} />}
                        {crossoverPoint && (() => {
                            // Position the callout near the crossover point
                            const totalYears = rateTimeline.length;
                            const leftPct = Math.min(85, Math.max(5, (crossoverPoint.year / (totalYears - 1)) * 100));
                            return (
                                <div style={{ position: 'absolute', top: '35%', left: `${leftPct}%`, transform: 'translateX(-50%)', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.4)', borderRadius: '6px', padding: '6px 10px', fontSize: '10px', color: '#f59e0b', maxWidth: '180px', lineHeight: 1.4, zIndex: 10, pointerEvents: 'none', textAlign: 'center' }}>
                                    ▲ From {currentCalendarYear + crossoverPoint.year}, it's cheaper to borrow from the bank than keep the HTB loan
                                </div>
                            );
                        })()}
                    </div>
                </div>
            </div>

            {/* Row 3: Dynamic Insights Commentary */}
            {getCommentary()}
        </div>
    );
}

