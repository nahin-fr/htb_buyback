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

const SummaryCard = ({ icon, label, value, subtext, highlight }) => {
    const IconComponent = icon;
    return (
        <div className="glass-panel" style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                <IconComponent size={18} color={highlight || 'var(--text-main)'} />
                <span style={{ fontSize: '14px', fontWeight: 500 }}>{label}</span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: highlight || 'var(--text-main)' }}>
                {value}
            </div>
            {subtext && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{subtext}</div>}
        </div>
    );
};

export default function ResultsDashboard({ projection, params, staircasingResults }) {
    const [viewMode, setViewMode] = useState('line'); // 'line' or 'bar'
    const [activeTab, setActiveTab] = useState('staircase'); // 'asset', 'outgoings', 'staircase', or 'assumptions'

    if (!projection || projection.length === 0) return null;

    const currentMonth = projection[0];

    // Find the first month where the active rate switches to the new (remortgage) rate
    const remortgageIndex = projection.findIndex(p => p.activeMortgageRate !== currentMonth.activeMortgageRate);
    const startIndex = remortgageIndex === -1 ? 0 : remortgageIndex;

    // Use 'when fix ends' from params to size the remortgage average window
    const simYear = params?.simulationYear ?? 2026;
    const simMonth = params?.simulationMonth ?? 3;
    const now = new Date(simYear, simMonth - 1, 1);
    const fixEndDate = params?.remortgageYear && params?.remortgageMonth
        ? new Date(params.remortgageYear, params.remortgageMonth - 1, 1)
        : new Date(2031, 2, 1); // fallback: 5 years
    const fixedTermMonths = Math.max(1, Math.round((fixEndDate - now) / (1000 * 60 * 60 * 24 * 30.44)));
    const fixEndLabel = fixEndDate.toLocaleString('default', { month: 'short', year: 'numeric' });

    const remortgagePeriod = projection.slice(startIndex, startIndex + fixedTermMonths);

    const avgMortgage = remortgagePeriod.reduce((sum, p) => sum + p.mortgagePayment, 0) / remortgagePeriod.length;
    const avgHtb = remortgagePeriod.reduce((sum, p) => sum + p.htbInterestPayment, 0) / remortgagePeriod.length;
    const avgOutgoings = avgMortgage + avgHtb;

    // We'll show data in yearly intervals for clarity in the charts
    const yearlyData = projection.filter((_, i) => i % 12 === 0);

    const labels = yearlyData.map(p => {
        const d = new Date(simYear, (simMonth - 1) + p.month, 1);
        return `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
    });

    const lineChartData = {
        labels,
        datasets: [
            {
                label: "Total Debt (Mortgage + HTB Equity Loan)",
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
                label: 'Your Equity',
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
                label: "HTB Equity Loan",
                data: yearlyData.map(p => p.htbEquityValue),
                backgroundColor: 'rgba(239, 68, 68, 0.8)',
            },
            {
                label: 'Mortgage Balance',
                data: yearlyData.map(p => p.mortgageBalance),
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
            },
            {
                label: 'Your Equity',
                data: yearlyData.map(p => p.userEquity),
                backgroundColor: 'rgba(16, 185, 129, 0.8)',
            }
        ]
    };

    const shortTermData = projection.slice(0, 60); // 5 years
    const shortTermLabels = shortTermData.map(p => {
        const d = new Date(simYear, (simMonth - 1) + p.month, 1);
        return `${d.toLocaleString('default', { month: 'short' })} '${d.getFullYear().toString().slice(-2)}`;
    });

    const outgoingsChartData = {
        labels: shortTermLabels,
        datasets: [
            {
                label: 'Mortgage — Building Equity',
                data: shortTermData.map(p => p.mortgagePrincipalMonth),
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
            },
            {
                label: 'Mortgage — Interest to Bank',
                data: shortTermData.map(p => p.mortgageInterestMonth),
                backgroundColor: 'rgba(59, 130, 246, 0.4)',
            },
            {
                label: "HTB Equity Loan Interest",
                data: shortTermData.map(p => p.htbInterestPayment),
                backgroundColor: 'rgba(239, 68, 68, 0.8)',
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
                        if (label) label += ': ';
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

    return (
        <section className="fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px', animationDelay: '0.2s', overflow: 'hidden' }}>
            {/* Chart */}
            <div className="glass-panel" style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px' }}>
                    <div style={{ display: 'flex', gap: '24px' }}>
                        <button
                            onClick={() => setActiveTab('staircase')}
                            style={{ background: 'none', border: 'none', color: activeTab === 'staircase' ? '#fff' : 'var(--text-muted)', fontSize: '18px', fontWeight: 600, cursor: 'pointer', padding: '0 8px 8px', borderBottom: activeTab === 'staircase' ? '2px solid var(--success)' : '2px solid transparent', marginBottom: '-17px' }}
                        >
                            Buy Out HTB Equity Loan
                        </button>
                        <button
                            onClick={() => setActiveTab('outgoings')}
                            style={{ background: 'none', border: 'none', color: activeTab === 'outgoings' ? '#fff' : 'var(--text-muted)', fontSize: '18px', fontWeight: 600, cursor: 'pointer', padding: '0 8px 8px', borderBottom: activeTab === 'outgoings' ? '2px solid var(--accent-primary)' : '2px solid transparent', marginBottom: '-17px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1px' }}
                        >
                            Monthly Payments
                            <span style={{ fontSize: '10px', fontWeight: 400, color: 'var(--text-muted)', opacity: 0.7, letterSpacing: '0.02em' }}>Remortgage Projections</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('asset')}
                            style={{ background: 'none', border: 'none', color: activeTab === 'asset' ? '#fff' : 'var(--text-muted)', fontSize: '18px', fontWeight: 600, cursor: 'pointer', padding: '0 8px 8px', borderBottom: activeTab === 'asset' ? '2px solid var(--accent-primary)' : '2px solid transparent', marginBottom: '-17px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1px' }}
                        >
                            Home & Debt
                            <span style={{ fontSize: '10px', fontWeight: 400, color: 'var(--text-muted)', opacity: 0.7, letterSpacing: '0.02em' }}>Remortgage Projections</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('assumptions')}
                            style={{ background: 'none', border: 'none', color: activeTab === 'assumptions' ? '#fff' : 'var(--text-muted)', fontSize: '18px', fontWeight: 600, cursor: 'pointer', padding: '0 8px 8px', borderBottom: activeTab === 'assumptions' ? '2px solid var(--accent-secondary)' : '2px solid transparent', marginBottom: '-17px' }}
                        >
                            Assumptions
                        </button>
                    </div>
                </div>

                <div style={{ flex: 1, position: 'relative', overflowY: activeTab === 'staircase' ? 'auto' : 'hidden' }}>
                    {activeTab === 'asset' ? (
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {/* Trends/Breakdown toggle — below the tab bar */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
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
                            </div>
                            <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
                                {viewMode === 'line' ? <Line options={commonOptions} data={lineChartData} /> : <Bar options={commonOptions} data={barChartData} />}
                            </div>
                        </div>
                    ) : activeTab === 'outgoings' ? (
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', gap: '12px', flexShrink: 0 }}>
                                <SummaryCard
                                    icon={Wallet}
                                    label="Monthly Payments Now"
                                    value={`£${currentMonth.totalMonthlyOutgoings.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo`}
                                    subtext={`Mortgage: £${currentMonth.mortgagePayment.toFixed(0)}/mo | HTB Equity Loan: £${currentMonth.htbInterestPayment.toFixed(0)}/mo`}
                                    highlight="var(--accent-primary)"
                                />
                                <SummaryCard
                                    icon={TrendingUp}
                                    label={`After Remortgage (avg to ${fixEndLabel})`}
                                    value={`£${avgOutgoings.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo`}
                                    subtext={`Mortgage: £${avgMortgage.toFixed(0)}/mo | HTB Equity Loan: £${avgHtb.toFixed(0)}/mo`}
                                    highlight="var(--warning)"
                                />
                            </div>
                            <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
                                <Bar options={outgoingsOptions} data={outgoingsChartData} />
                            </div>
                        </div>
                    ) : activeTab === 'staircase' ? (
                        <StaircasingView staircasingResults={staircasingResults} commonOptions={commonOptions} params={params} />
                    ) : (
                        <AssumptionsView params={params} />
                    )}
                </div>
            </div>
        </section>
    );
}

function monthToDate(month, simYear = 2026, simMonth = 3) {
    const d = new Date(simYear, (simMonth - 1) + month, 1);
    return `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
}

function StaircasingView({ staircasingResults, commonOptions, params }) {
    // Must be before any early return — React hooks rule
    const [selectedIdx, setSelectedIdx] = React.useState(null);

    if (!staircasingResults || !staircasingResults.optimal) {
        return <div style={{ padding: '24px', color: 'var(--text-muted)' }}>Calculating optimal staircasing schedule...</div>;
    }

    const { optimal, baseline, costCurve, rateTimeline, crossoverPoint } = staircasingResults;
    const { newMortgageRate = 0.0375 } = params || {};
    const fmt = (v) => '£' + Math.round(Math.abs(v)).toLocaleString();
    const isSavings = optimal.savings > 0;
    const growthPct = ((params?.propertyAnnualGrowth || 0.02) * 100).toFixed(1);
    const htbPct = params?.htbPercentage ?? 0.40;
    const userOwnsPct = Math.round((1 - htbPct) * 100);
    const govtPct = Math.round(htbPct * 100);

    const currentCalendarYear = params?.simulationYear ?? 2026;
    const simMonth = params?.simulationMonth ?? 3;
    const crossoverCalendarYear = crossoverPoint ? currentCalendarYear + crossoverPoint.year : null;

    // Derived from clicked bar — null means show the recommendation view
    const isCustomSelection = selectedIdx !== null && costCurve[selectedIdx] != null;
    const displayOption = isCustomSelection ? costCurve[selectedIdx] : optimal;
    const displayYear = isCustomSelection
        ? currentCalendarYear + Math.round(costCurve[selectedIdx].months[0] / 12)
        : null;

    const savingsChartData = costCurve.length > 0 ? {
        labels: costCurve.map(o => `${currentCalendarYear + Math.round(o.months[0] / 12)}`),
        datasets: [
            {
                label: 'Net Savings',
                data: costCurve.map(o => o.savings),
                backgroundColor: costCurve.map((o, i) => {
                    const isSelected = isCustomSelection && i === selectedIdx;
                    const hasSel = isCustomSelection;
                    if (o.savings >= 0) return isSelected ? 'rgba(16,185,129,0.95)' : hasSel ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.6)';
                    return isSelected ? 'rgba(239,68,68,0.9)' : hasSel ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.5)';
                }),
                borderColor: costCurve.map((o, i) => {
                    const isSelected = isCustomSelection && i === selectedIdx;
                    if (o.savings >= 0) return isSelected ? '#10b981' : 'transparent';
                    return isSelected ? '#ef4444' : 'transparent';
                }),
                borderWidth: costCurve.map((_, i) => isCustomSelection && i === selectedIdx ? 2 : 1),
                borderRadius: 4,
                yAxisID: 'y',
            },
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

    const rateChartData = rateTimeline ? {
        labels: rateTimeline.map(r => `${currentCalendarYear + r.year}`),
        datasets: [
            { label: 'HTB Effective Rate', data: rateTimeline.map(r => r.effectiveHtbRate * 100), borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.08)', tension: 0.4, fill: true, pointRadius: 0 },
            { label: 'Mortgage Rate', data: rateTimeline.map(r => r.mortgageRate * 100), borderColor: '#3b82f6', borderDash: [5, 5], pointRadius: 0 },
            { label: 'HTB Nominal Rate', data: rateTimeline.map(r => r.htbNominalRate * 100), borderColor: '#a855f7', borderDash: [2, 4], pointRadius: 0 },
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

    const savingsOpts = {
        ...commonOptions,
        maintainAspectRatio: false,
        onClick: (evt, elements) => {
            if (elements.length > 0) {
                const idx = elements[0].index;
                setSelectedIdx(prev => prev === idx ? null : idx); // toggle on re-click
            }
        },
        onHover: (evt) => {
            evt.native.target.style.cursor = 'pointer';
        },
        plugins: {
            ...commonOptions.plugins,
            legend: { display: false },
            tooltip: {
                callbacks: {
                    title: (items) => {
                        const idx = items[0]?.dataIndex;
                        const year = costCurve[idx] ? currentCalendarYear + Math.round(costCurve[idx].months[0] / 12) : '';
                        return `If you buy out in ${year}`;
                    },
                    label: (ctx) => {
                        const idx = ctx.dataIndex;
                        const entry = costCurve[idx];
                        if (!entry) return '';
                        if (ctx.dataset.label === 'Required Income') {
                            return `Min. household income: £${Math.round(entry.requiredIncome).toLocaleString()}/yr`;
                        }
                        return [
                            `${entry.savings >= 0 ? 'You save' : 'Costs you extra'}: £${Math.round(Math.abs(entry.savings)).toLocaleString()}`,
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

    const makeOpts = () => ({
        ...commonOptions,
        maintainAspectRatio: false,
        plugins: {
            ...commonOptions.plugins,
            legend: { display: true, labels: { boxWidth: 10, padding: 8, font: { size: 10 }, color: '#94a3b8', filter: (item) => item.text !== '⬇ Crossover' } },
            tooltip: {
                callbacks: {
                    label: (ctx) => {
                        if (ctx.dataset.label === '⬇ Crossover') {
                            return `Breaking point (${crossoverCalendarYear}): from here, a bank mortgage is cheaper than keeping the HTB Equity Loan`;
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

    const statRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' };
    const statLabel = { fontSize: '12px', color: '#94a3b8' };
    const statVal = (color = '#f8fafc') => ({ fontSize: '13px', fontWeight: 600, color });

    // Shared table renderer used by both the recommendation and the custom-year views
    const renderTable = (opt, leftTitle) => (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
            <div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{leftTitle}</div>
                <div style={statRow}>
                    <span style={statLabel}>HTB Equity Loan value at buyout</span>
                    <span style={statVal()}>{fmt(opt.buybackCost)}</span>
                </div>
                <div style={statRow}>
                    <span style={statLabel}>New mortgage balance</span>
                    <span style={statVal()}>{fmt(opt.newMortgageBalance)}</span>
                </div>
                <div style={statRow}>
                    <span style={statLabel}>New monthly payment</span>
                    <span style={statVal()}>{fmt(opt.newMonthlyPayment)}/mo</span>
                </div>
                <div style={{ ...statRow, borderBottom: 'none' }}>
                    <span style={statLabel}>Minimum income to qualify</span>
                    <span style={statVal('#a855f7')}>{fmt(opt.requiredIncome)}/yr</span>
                </div>
            </div>
            <div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Over the life of your mortgage</div>
                <div style={statRow}>
                    <span style={statLabel}>HTB Equity Loan fees you avoid</span>
                    <span style={statVal('#10b981')}>+ {fmt(opt.htbInterestSaved)}</span>
                </div>
                <div style={statRow}>
                    <span style={statLabel}>Home growth you keep</span>
                    <span style={statVal('#10b981')}>+ {fmt(opt.capitalCostSaved)}</span>
                </div>
                <div style={statRow}>
                    <span style={statLabel}>Extra bank interest you pay</span>
                    <span style={statVal('#ef4444')}>− {fmt(opt.extraMortgageInterest)}</span>
                </div>
                <div style={{ ...statRow, borderBottom: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '4px', paddingTop: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#f8fafc' }}>
                        {opt.savings >= 0 ? 'Net saving' : 'Net extra cost'}
                    </span>
                    <span style={statVal(opt.savings >= 0 ? '#10b981' : '#ef4444')}>
                        {fmt(opt.savings)} {opt.savings >= 0 ? 'better off' : 'worse off'}
                    </span>
                </div>
            </div>
        </div>
    );

    const getCommentary = () => {
        if (!costCurve.length) return null;

        // ── User clicked a specific bar ──────────────────────────────────────────
        if (isCustomSelection) {
            const isGain = displayOption.savings >= 0;
            return (
                <div style={{ ...panel, background: isGain ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.05)', borderColor: isGain ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', marginTop: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <h4 style={{ fontSize: '14px', fontWeight: 600, color: isGain ? '#10b981' : '#ef4444', margin: 0 }}>
                            What buying out in {displayYear} means
                        </h4>
                        <button
                            onClick={() => setSelectedIdx(null)}
                            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '12px', padding: 0, display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                            ← Back to recommendation
                        </button>
                    </div>
                    {renderTable(displayOption, `At time of buyout (${displayYear})`)}
                </div>
            );
        }

        // ── Default recommendation view ──────────────────────────────────────────
        if (optimal.savings > 0) {
            const timeframeText = crossoverCalendarYear
                ? `between now and ${crossoverCalendarYear}`
                : 'as soon as you can afford to';
            return (
                <div style={{ ...panel, background: 'rgba(16,185,129,0.05)', borderColor: 'rgba(16,185,129,0.2)', marginTop: '4px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#10b981', margin: '0 0 10px' }}>
                        💡 Key Insight: Buy out the HTB Equity Loan {timeframeText}
                    </h4>
                    {renderTable(optimal, `What buying out in ${monthToDate(optimal.months[0], currentCalendarYear, simMonth)} means`)}
                    {crossoverCalendarYear && (
                        <p style={{ fontSize: '12px', color: '#94a3b8', margin: '10px 0 0', lineHeight: 1.5 }}>
                            After {crossoverCalendarYear}, the HTB Equity Loan ({govtPct}%) grows faster in value than your mortgage rate — every year you delay beyond that costs you more. If you never buy out, the HTB Equity Loan will be worth <strong style={{ color: '#e2e8f0' }}>{fmt(baseline.finalHtbDebt)}</strong> at end of term.
                        </p>
                    )}
                </div>
            );
        }

        const firstPositive = costCurve.find(c => c.savings > 0);
        if (firstPositive) {
            const posYear = currentCalendarYear + Math.round(firstPositive.months[0] / 12);
            const nowOption = costCurve[0];
            return (
                <div style={{ ...panel, background: 'rgba(245,158,11,0.05)', borderColor: 'rgba(245,158,11,0.2)', marginTop: '4px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#f59e0b', margin: '0 0 10px' }}>
                        💡 Key Insight: Hold off — the numbers don't work yet, but they will in {posYear}
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
                        <div>
                            <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>If you buy out today</div>
                            {nowOption && <>
                                <div style={statRow}><span style={statLabel}>HTB Equity Loan value now</span><span style={statVal()}>{fmt(nowOption.buybackCost)}</span></div>
                                <div style={statRow}><span style={statLabel}>New monthly payment</span><span style={statVal()}>{fmt(nowOption.newMonthlyPayment)}/mo</span></div>
                                <div style={statRow}><span style={statLabel}>Net vs never buying out</span><span style={statVal('#ef4444')}>− {fmt(Math.abs(nowOption.savings))} worse off</span></div>
                                <div style={{ ...statRow, borderBottom: 'none' }}><span style={statLabel}>Min. income to qualify</span><span style={statVal('#a855f7')}>{fmt(nowOption.requiredIncome)}/yr</span></div>
                            </>}
                        </div>
                        <div>
                            <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>If you wait until {posYear}</div>
                            <div style={statRow}><span style={statLabel}>HTB Equity Loan value then</span><span style={statVal()}>{fmt(firstPositive.buybackCost)}</span></div>
                            <div style={statRow}><span style={statLabel}>New monthly payment</span><span style={statVal()}>{fmt(firstPositive.newMonthlyPayment)}/mo</span></div>
                            <div style={statRow}><span style={statLabel}>Net vs never buying out</span><span style={statVal('#10b981')}>+ {fmt(firstPositive.savings)} better off</span></div>
                            <div style={{ ...statRow, borderBottom: 'none' }}><span style={statLabel}>Min. income to qualify</span><span style={statVal('#a855f7')}>{fmt(firstPositive.requiredIncome)}/yr</span></div>
                        </div>
                    </div>
                    <p style={{ fontSize: '12px', color: '#94a3b8', margin: '10px 0 0', lineHeight: 1.5 }}>
                        Right now your {(newMortgageRate * 100).toFixed(2)}% mortgage rate is lower than the true cost of the HTB Equity Loan. That flips around {posYear} — from then, buy out when you can afford the higher payments.
                    </p>
                </div>
            );
        }

        return (
            <div style={{ ...panel, background: 'rgba(239,68,68,0.05)', borderColor: 'rgba(239,68,68,0.2)', marginTop: '4px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#ef4444', margin: '0 0 10px' }}>
                    💡 Key Insight: Keep the HTB Equity Loan — the bank would cost you more
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
                    <div>
                        <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>If you never buy out</div>
                        <div style={statRow}><span style={statLabel}>Total HTB Equity Loan fees paid</span><span style={statVal()}>{fmt(baseline.totalHtbInterestPaid)}</span></div>
                        <div style={{ ...statRow, borderBottom: 'none' }}><span style={statLabel}>HTB Equity Loan owed at end of term</span><span style={statVal('#ef4444')}>{fmt(baseline.finalHtbDebt)}</span></div>
                    </div>
                    <div>
                        <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Best case if you do buy out</div>
                        <div style={statRow}><span style={statLabel}>Cheapest buyout option</span><span style={statVal()}>{fmt(optimal.buybackCost)} ({monthToDate(optimal.months[0], currentCalendarYear, simMonth)})</span></div>
                        <div style={{ ...statRow, borderBottom: 'none' }}><span style={statLabel}>Still costs you extra vs keeping</span><span style={statVal('#ef4444')}>− {fmt(Math.abs(optimal.savings))}</span></div>
                    </div>
                </div>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: '10px 0 0', lineHeight: 1.5 }}>
                    At your {(newMortgageRate * 100).toFixed(2)}% mortgage rate, the bank charges you more than the HTB Equity Loan. Watch the True Cost Comparison chart for the lines to cross.
                </p>
            </div>
        );
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Row 1: Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                {/* Optimal Timing */}
                <div style={{ padding: '14px', borderRadius: '10px', background: '#10b98110', border: '1px solid #10b98130', minWidth: '140px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '5px' }}>✦ Best Time to Buy Out</div>
                    <div style={{ fontSize: '18px', fontWeight: 700 }}>{optimal.months.map(m => monthToDate(m, currentCalendarYear, simMonth)).join(' → ')}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '3px' }}>Full buyback · HTB Equity Loan: {govtPct}%</div>
                </div>

                {/* Net Savings */}
                <div style={{ padding: '14px', borderRadius: '10px', background: isSavings ? '#10b98110' : '#ef444410', border: `1px solid ${isSavings ? '#10b98130' : '#ef444430'}`, minWidth: '140px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: isSavings ? '#10b981' : '#ef4444', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '5px' }}>
                        {isSavings ? '✓ Total Savings' : '⚠ Extra Cost'}
                        <InfoTip text={`Buying out the HTB Equity Loan compares two costs over your full mortgage life: (1) what you save by no longer paying the HTB interest fee and no longer giving away your home's ${growthPct}% annual growth on the HTB share, versus (2) the extra interest you'd pay the bank on a bigger mortgage. A positive number means buying out leaves you better off overall.`} />
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 700 }}>{fmt(optimal.savings)}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '3px' }}>
                        Fees saved: {fmt(optimal.htbInterestSaved)} | Growth kept: {fmt(optimal.capitalCostSaved)} | Extra bank int: {fmt(optimal.extraMortgageInterest)}
                    </div>
                </div>

                {/* Equity Ownership — dynamic from htbPercentage */}
                <div style={{ padding: '14px', borderRadius: '10px', background: '#3b82f610', border: '1px solid #3b82f630', minWidth: '140px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '5px' }}>Your Home Ownership</div>
                    <div style={{ fontSize: '18px', fontWeight: 700 }}>{userOwnsPct}% → 100%</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '3px' }}>Cost: {fmt(optimal.totalBuybackCost)} added to mortgage</div>
                </div>

                {/* Breaking Point (formerly Rate Crossover) — shows calendar year */}
                <div style={{ padding: '14px', borderRadius: '10px', background: '#a855f710', border: '1px solid #a855f730', minWidth: '140px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#a855f7', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '5px' }}>
                        Breaking Point
                        <InfoTip text={`The HTB Equity Loan covers ${govtPct}% of your home. As your home grows in value at ${growthPct}% per year, the HTB share grows too — that's value going to the scheme, not you. This is why the true cost of the HTB Equity Loan is higher than the interest rate alone. The 'breaking point' is the year when the total HTB cost exceeds what a bank mortgage would charge.`} />
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 700 }}>
                        {crossoverCalendarYear ? `${crossoverCalendarYear}` : 'Never*'}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '3px' }}>
                        {crossoverCalendarYear
                            ? `From ${crossoverCalendarYear}, a bank mortgage is cheaper than keeping the HTB Equity Loan`
                            : `At ${growthPct}% growth, the HTB Equity Loan stays cheaper than a bank for 25+ years`
                        }
                    </div>
                </div>
            </div>

            {/* Row 2: Bento chart grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', height: 'calc(81vh - 502px)', minHeight: '180px' }}>
                {/* Left: Decision Support — Savings + Affordability */}
                <div style={{ ...panel, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <div style={{ marginBottom: '8px' }}>
                        <h4 style={{ fontSize: '13px', fontWeight: 600, margin: 0 }}>
                            Savings If You Buy Out In Year…
                            <InfoTip text={`Each bar shows how much you'd save (green) or pay extra (red) by buying out the HTB Equity Loan in that year, compared to never buying out. The purple line shows the minimum household income your bank would require to give you a bigger mortgage at that point — based on UK lending rules (4.5× annual income, or payments no more than 35% of monthly earnings, whichever needs more income). Hover a bar for full details.`} />
                        </h4>
                        <p style={{ fontSize: '10px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                            <span style={{ color: '#10b981' }}>■</span> You save · <span style={{ color: '#ef4444' }}>■</span> Costs more · <span style={{ color: '#8b5cf6' }}>─</span> Min. income needed (right axis) · <span style={{ color: '#64748b', fontStyle: 'italic' }}>click a bar to explore</span>
                        </p>
                    </div>
                    <div style={{ flex: 1, position: 'relative', minHeight: 0, minWidth: 0, width: '100%' }}>
                        <Bar options={savingsOpts} data={savingsChartData} />
                    </div>
                </div>

                {/* Right: True Cost Comparison */}
                <div style={{ ...panel, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <div style={{ marginBottom: '8px' }}>
                        <h4 style={{ fontSize: '13px', fontWeight: 600, margin: 0 }}>
                            True Cost Comparison (25 Years)
                            <InfoTip text={`The red line shows what the HTB Equity Loan truly costs you each year: the HTB interest rate PLUS the ${growthPct}% annual growth of the HTB share of your home. The blue line is your mortgage rate. When the red line rises above the blue, you'd be better off borrowing from the bank to buy out the HTB Equity Loan. The purple dotted line shows just the basic HTB interest fee, without the property growth element.`} />
                        </h4>
                        <p style={{ fontSize: '10px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                            <span title={`True HTB cost = Interest fee + ${growthPct}% property growth on HTB share`} style={{ cursor: 'help' }}><span style={{ color: '#ef4444' }}>■</span> True HTB cost</span> ·{' '}
                            <span title="Your assumed remortgage interest rate" style={{ cursor: 'help' }}><span style={{ color: '#3b82f6' }}>━</span> Your mortgage rate</span> ·{' '}
                            <span title="The basic HTB interest fee only (does not include the cost of the HTB share growing with your home)" style={{ cursor: 'help' }}><span style={{ color: '#a855f7' }}>┈</span> HTB interest only</span>
                            {crossoverCalendarYear && <span style={{ color: '#f59e0b', marginLeft: '6px' }}>▲ = breaking point</span>}
                        </p>
                    </div>
                    <div style={{ flex: 1, position: 'relative', minHeight: 0, minWidth: 0, width: '100%' }}>
                        {rateChartData && <Line options={makeOpts()} data={rateChartData} />}
                        {crossoverCalendarYear && (() => {
                            const totalYears = rateTimeline.length;
                            const leftPct = Math.min(85, Math.max(5, (crossoverPoint.year / (totalYears - 1)) * 100));
                            return (
                                <div style={{ position: 'absolute', top: '35%', left: `${leftPct}%`, transform: 'translateX(-50%)', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.4)', borderRadius: '6px', padding: '6px 10px', fontSize: '10px', color: '#f59e0b', maxWidth: '180px', lineHeight: 1.4, zIndex: 10, pointerEvents: 'none', textAlign: 'center' }}>
                                    ▲ From {crossoverCalendarYear}, borrowing from the bank is cheaper than keeping the HTB Equity Loan
                                </div>
                            );
                        })()}
                    </div>
                </div>
            </div>

            {/* Row 3: Key Insight — scroll to see, updates with every parameter change */}
            {getCommentary()}
        </div>
    );
}

function AssumptionsView({ params }) {
    const growthPct = ((params?.propertyAnnualGrowth || 0.02) * 100).toFixed(1);
    const htbRisePct = ((params?.htbAnnualInterestGrowth || 0.026) * 100).toFixed(1);

    const assumptions = [
        {
            title: "Property Value & Equity",
            points: [
                `Property value is projected using ${growthPct}% annual growth, compounded monthly.`,
                "Your equity is calculated as: Current Value - (Mortgage Balance + HTB Equity Loan Value).",
                "HTB Equity Loan value is always calculated as the given percentage of the current property value."
            ]
        },
        {
            title: "Help to Buy Interest Fees",
            points: [
                "HTB fees are interest-only payments and do not reduce the principal loan amount.",
                `The HTB interest rate is assumed to increase by ${htbRisePct}% annually (every 12 months in this projection).`,
                "Monthly interest is calculated based on the original loan amount, not the current property value."
            ]
        },
        {
            title: "Mortgage & Remortgaging",
            points: [
                "Payments are standard capital + interest amortized over the remaining term.",
                "The 'remortgage rate for fixed term' is assumed to be constant for the entire remaining term.",
                "Calculations assume no missed payments, no overpayments, and no changes to the term length."
            ]
        },
        {
            title: "Staircasing (Buy Out)",
            points: [
                "Buyout costs are based on the projected property value at the chosen date.",
                "Assumes a full (100%) buyback of the government's share in a single event.",
                "The buyout cost is assumed to be added to your mortgage balance, increasing your monthly payments."
            ]
        },
        {
            title: "Exclusions",
            points: [
                "Legal fees, stamp duty, and mortgage product fees are not included in the debt projections.",
                "RICS valuation fees (typically £250-£500 per valuation) are excluded from the default projection.",
                "No allowance is made for personal tax implications or inflation adjustments to cash flow."
            ]
        }
    ];

    return (
        <div className="fade-in" style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', maxHeight: '100%' }}>
            <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                <h4 style={{ margin: '0 0 8px', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={18} /> How these projections work
                </h4>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    These projections provide a mathematical model of your potential financial future based on the parameters you've provided.
                    Real-world results will vary based on market conditions, bank lending criteria, and individual circumstances.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                {assumptions.map((group, i) => (
                    <div key={i} style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--glass-border)' }}>
                        <h5 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>{group.title}</h5>
                        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {group.points.map((point, j) => (
                                <li key={j} style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '8px', lineHeight: 1.4 }}>
                                    <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>•</span>
                                    <span>{point}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
}
