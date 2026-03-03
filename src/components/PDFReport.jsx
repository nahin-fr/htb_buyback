import React from 'react';
import {
    Document, Page, Text, View, StyleSheet,
    Svg, Rect, Line, Polyline, G
} from '@react-pdf/renderer';

// ─── Colour palette (light / print-friendly) ─────────────────────────────────
const C = {
    navy:      '#1e293b',
    blue:      '#3b82f6',
    blueLight: '#60a5fa',
    green:     '#10b981',
    red:       '#ef4444',
    purple:    '#a855f7',
    amber:     '#f59e0b',
    muted:     '#64748b',
    border:    '#e2e8f0',
    bg:        '#f8fafc',
    white:     '#ffffff',
    text:      '#334155',
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
    page:            { padding: 40, fontSize: 10, color: C.text, fontFamily: 'Helvetica', lineHeight: 1.5, backgroundColor: C.white },
    pageHeader:      { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: C.border, paddingBottom: 10, marginBottom: 18 },
    pageTitle:       { fontSize: 16, fontFamily: 'Helvetica-Bold', color: C.navy },
    pageMeta:        { fontSize: 8, color: C.muted, marginTop: 2 },
    brandName:       { fontSize: 13, fontFamily: 'Helvetica-Bold', color: C.blue, textAlign: 'right' },
    brandSub:        { fontSize: 8, color: C.muted, textAlign: 'right' },
    section:         { marginBottom: 16 },
    sectionTitle:    { fontSize: 11, fontFamily: 'Helvetica-Bold', color: C.navy, marginBottom: 8, borderBottomWidth: 1, borderBottomColor: C.border, paddingBottom: 3 },
    row:             { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3, borderBottomWidth: 0.5, borderBottomColor: C.border },
    label:           { color: C.muted, fontSize: 9 },
    value:           { fontFamily: 'Helvetica-Bold', fontSize: 9 },
    cards:           { flexDirection: 'row', gap: 8, marginBottom: 14 },
    card:            { flex: 1, padding: 10, borderRadius: 4, backgroundColor: C.bg, borderLeftWidth: 3, borderLeftColor: C.blue },
    cardLabel:       { fontSize: 8, color: C.muted, marginBottom: 3 },
    cardValue:       { fontSize: 13, fontFamily: 'Helvetica-Bold', color: C.blue },
    cardSub:         { fontSize: 7.5, color: C.muted, marginTop: 2 },
    tableHeader:     { flexDirection: 'row', backgroundColor: C.navy, paddingVertical: 4, paddingHorizontal: 4 },
    tableHeaderText: { color: C.white, fontSize: 8, fontFamily: 'Helvetica-Bold', flex: 1 },
    tableRow:        { flexDirection: 'row', paddingVertical: 3, paddingHorizontal: 4, borderBottomWidth: 0.5, borderBottomColor: C.border },
    tableCell:       { fontSize: 8, flex: 1, color: C.text },
    tableAlt:        { backgroundColor: '#f8fafc' },
    insightPanel:    { padding: 12, borderRadius: 4, marginTop: 6, marginBottom: 6 },
    insightTitle:    { fontSize: 10, fontFamily: 'Helvetica-Bold', marginBottom: 8 },
    insightGrid:     { flexDirection: 'row', gap: 16 },
    insightCol:      { flex: 1 },
    insightColHead:  { fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.muted, textTransform: 'uppercase', marginBottom: 4 },
    insightRow:      { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3, borderBottomWidth: 0.5, borderBottomColor: C.border },
    insightLabel:    { fontSize: 8, color: C.muted },
    insightVal:      { fontSize: 8, fontFamily: 'Helvetica-Bold' },
    chartWrap:       { marginBottom: 12 },
    chartTitle:      { fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.navy, marginBottom: 4 },
    chartLegend:     { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
    legendDot:       { width: 8, height: 8, borderRadius: 2, marginRight: 3 },
    legendItem:      { flexDirection: 'row', alignItems: 'center' },
    legendText:      { fontSize: 7.5, color: C.muted },
    footer:          { position: 'absolute', bottom: 24, left: 40, right: 40, fontSize: 7.5, color: C.muted, textAlign: 'center', borderTopWidth: 0.5, borderTopColor: C.border, paddingTop: 6 },
    assumGroup:      { marginBottom: 10, padding: 10, backgroundColor: C.bg, borderRadius: 4, borderLeftWidth: 2, borderLeftColor: C.blue },
    assumTitle:      { fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.navy, marginBottom: 5 },
    assumPoint:      { fontSize: 8, color: C.muted, marginBottom: 3, paddingLeft: 8 },
});

// ─── Formatters ───────────────────────────────────────────────────────────────
const fGBP = v => `£${Math.round(Math.abs(Number(v))).toLocaleString('en-GB')}`;
const fPct = v => `${(Number(v) * 100).toFixed(2)}%`;
const fK   = v => {
    const abs = Math.abs(v);
    return abs >= 1000 ? `£${(v / 1000).toFixed(0)}k` : `£${Math.round(v)}`;
};
const fDate = (year, month) =>
    new Date(year, month - 1, 1).toLocaleString('en-GB', { month: 'short', year: 'numeric' });
const fMonthToCalendar = (month, simYear, simMonth) => {
    const d = new Date(simYear, (simMonth - 1) + month, 1);
    return `${d.toLocaleString('en-GB', { month: 'short' })} ${d.getFullYear()}`;
};

// ─── SVG Chart Helpers ────────────────────────────────────────────────────────

const BarChart = ({ data, width = 515, height = 155 }) => {
    const PAD = { top: 10, right: 8, bottom: 22, left: 44 };
    const cW = width - PAD.left - PAD.right;
    const cH = height - PAD.top - PAD.bottom;

    const values = data.map(d => d.value);
    const minV = Math.min(0, ...values);
    const maxV = Math.max(0, ...values);
    const range = maxV - minV || 1;

    const toY   = v => PAD.top + cH - ((v - minV) / range) * cH;
    const zeroY = toY(0);
    const slotW = cW / data.length;
    const barW  = Math.max(slotW * 0.65, 1);
    const ticks = [0, 0.25, 0.5, 0.75, 1.0].map(t => minV + t * range);

    return (
        <Svg width={width} height={height}>
            {ticks.map((v, i) => {
                const y = toY(v);
                return (
                    <G key={i}>
                        <Line x1={PAD.left} y1={y} x2={width - PAD.right} y2={y} stroke={C.border} strokeWidth={0.5} />
                        <Text x={PAD.left - 3} y={y + 2.5} fill={C.muted} fontSize={6.5} textAnchor="end">{fK(v)}</Text>
                    </G>
                );
            })}
            <Line x1={PAD.left} y1={zeroY} x2={width - PAD.right} y2={zeroY} stroke={C.muted} strokeWidth={0.75} />
            {data.map((d, i) => {
                const x    = PAD.left + i * slotW + (slotW - barW) / 2;
                const barH = Math.max(Math.abs(toY(d.value) - zeroY), 0.5);
                const y    = d.value >= 0 ? toY(d.value) : zeroY;
                return <Rect key={i} x={x} y={y} width={barW} height={barH} fill={d.color} rx={1} />;
            })}
            {data.map((d, i) => {
                if (data.length > 14 && i % 2 !== 0) return null;
                const x = PAD.left + i * slotW + slotW / 2;
                return <Text key={i} x={x} y={height - 4} fill={C.muted} fontSize={6} textAnchor="middle">{d.label}</Text>;
            })}
        </Svg>
    );
};

const LineChart = ({ datasets, labels, width = 515, height = 140, yFmt = fK }) => {
    const PAD = { top: 10, right: 8, bottom: 22, left: 50 };
    const cW = width - PAD.left - PAD.right;
    const cH = height - PAD.top - PAD.bottom;

    const allV = datasets.flatMap(d => d.data.filter(v => v != null));
    const minV = Math.min(0, ...allV);
    const maxV = Math.max(...allV);
    const range = maxV - minV || 1;

    const toX = i => PAD.left + (i / Math.max(labels.length - 1, 1)) * cW;
    const toY = v => PAD.top + cH - ((v - minV) / range) * cH;
    const ticks = [0, 0.25, 0.5, 0.75, 1.0].map(t => minV + t * range);
    const labelStep = Math.ceil(labels.length / 7);

    return (
        <Svg width={width} height={height}>
            {ticks.map((v, i) => {
                const y = toY(v);
                return (
                    <G key={i}>
                        <Line x1={PAD.left} y1={y} x2={width - PAD.right} y2={y} stroke={C.border} strokeWidth={0.5} />
                        <Text x={PAD.left - 3} y={y + 2.5} fill={C.muted} fontSize={6.5} textAnchor="end">{yFmt(v)}</Text>
                    </G>
                );
            })}
            <Line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + cH} stroke={C.border} strokeWidth={0.75} />
            {datasets.map((ds, di) => {
                const pts = ds.data
                    .map((v, i) => v != null ? `${toX(i).toFixed(1)},${toY(v).toFixed(1)}` : null)
                    .filter(Boolean)
                    .join(' ');
                return (
                    <Polyline key={di} points={pts} fill="none"
                        stroke={ds.color} strokeWidth={1.5}
                        strokeDasharray={ds.dashed ? '4 2' : undefined} />
                );
            })}
            {labels.map((lbl, i) => {
                if (i % labelStep !== 0) return null;
                return <Text key={i} x={toX(i)} y={height - 4} fill={C.muted} fontSize={6.5} textAnchor="middle">{lbl}</Text>;
            })}
        </Svg>
    );
};

const StackedBarChart = ({ segments, colors, labels, width = 515, height = 140, yFmt = fK }) => {
    const PAD = { top: 10, right: 8, bottom: 22, left: 52 };
    const cW = width - PAD.left - PAD.right;
    const cH = height - PAD.top - PAD.bottom;
    const n  = labels.length;

    const totals = Array.from({ length: n }, (_, bi) =>
        segments.reduce((s, seg) => s + (seg[bi] || 0), 0));
    const maxV  = Math.max(...totals) || 1;
    const toH   = v => (v / maxV) * cH;
    const slotW = cW / n;
    const barW  = Math.max(slotW * 0.75, 1);
    const labelStep = Math.ceil(n / 8);
    const ticks = [0, 0.25, 0.5, 0.75, 1.0];

    return (
        <Svg width={width} height={height}>
            {ticks.map((t, i) => {
                const y = PAD.top + cH - t * cH;
                return (
                    <G key={i}>
                        <Line x1={PAD.left} y1={y} x2={width - PAD.right} y2={y} stroke={C.border} strokeWidth={0.5} />
                        <Text x={PAD.left - 3} y={y + 2.5} fill={C.muted} fontSize={6.5} textAnchor="end">{yFmt(t * maxV)}</Text>
                    </G>
                );
            })}
            {Array.from({ length: n }, (_, bi) => {
                const x = PAD.left + bi * slotW + (slotW - barW) / 2;
                let cumY = PAD.top + cH;
                return segments.map((seg, si) => {
                    const h = toH(seg[bi] || 0);
                    cumY -= h;
                    return <Rect key={`${bi}-${si}`} x={x} y={cumY} width={barW} height={Math.max(h, 0)} fill={colors[si]} />;
                });
            })}
            {labels.map((lbl, i) => {
                if (i % labelStep !== 0) return null;
                const x = PAD.left + i * slotW + slotW / 2;
                return <Text key={i} x={x} y={height - 4} fill={C.muted} fontSize={6} textAnchor="middle">{lbl}</Text>;
            })}
        </Svg>
    );
};

// ─── Shared sub-components ────────────────────────────────────────────────────

const PageHeader = ({ title, subtitle, date }) => (
    <View style={S.pageHeader}>
        <View>
            <Text style={S.pageTitle}>{title}</Text>
            {subtitle ? <Text style={S.pageMeta}>{subtitle}</Text> : null}
            <Text style={S.pageMeta}>Generated {date}</Text>
        </View>
        <View>
            <Text style={S.brandName}>BuyBack HTB</Text>
            <Text style={S.brandSub}>Mortgage & Equity Report</Text>
        </View>
    </View>
);

const PageFooter = ({ page }) => (
    <View style={S.footer} fixed>
        <Text>
            This report is for illustrative purposes only. Figures are estimates based on your inputs.
            Consult a qualified mortgage broker or financial adviser before making any decisions.
            {page ? `   •   ${page}` : ''}
        </Text>
    </View>
);

const KV = ({ label, value, valueColor }) => (
    <View style={S.row}>
        <Text style={S.label}>{label}</Text>
        <Text style={[S.value, valueColor ? { color: valueColor } : {}]}>{value}</Text>
    </View>
);

const Card = ({ label, value, sub, color }) => (
    <View style={[S.card, { borderLeftColor: color || C.blue }]}>
        <Text style={S.cardLabel}>{label}</Text>
        <Text style={[S.cardValue, { color: color || C.blue }]}>{value}</Text>
        {sub ? <Text style={S.cardSub}>{sub}</Text> : null}
    </View>
);

const LegendItem = ({ color, label }) => (
    <View style={S.legendItem}>
        <View style={[S.legendDot, { backgroundColor: color }]} />
        <Text style={S.legendText}>{label}</Text>
    </View>
);

// ─── Main export ─────────────────────────────────────────────────────────────

const PDFReport = ({ params, projection, staircasingResults, generatedAt }) => {
    const simYear  = params.simulationYear  ?? 2026;
    const simMonth = params.simulationMonth ?? 3;

    const htbLoanValue  = params.initialPropertyValue * params.htbPercentage;
    const userEquityNow = params.initialPropertyValue - params.currentMortgageBalance - htbLoanValue;
    const htbPctLabel   = (params.htbPercentage * 100).toFixed(0) + '%';

    return (
        <Document
            title={`BuyBack HTB Report — ${new Date().toISOString().slice(0, 10)}`}
            author="BuyBack HTB"
            subject="HTB Equity Loan & Mortgage Analysis"
            creator="BuyBack HTB Calculator"
        >

            {/* ═══════ PAGE 1 — Cover + Input Parameters ═══════ */}
            <Page size="A4" style={S.page}>
                <PageHeader title="Your BuyBack HTB Report" date={generatedAt} />

                <View style={S.section}>
                    <Text style={S.sectionTitle}>Current Position</Text>
                    <View style={S.cards}>
                        <Card label="Property Value"           value={fGBP(params.initialPropertyValue)} color={C.navy} />
                        <Card label={`HTB Equity Loan (${htbPctLabel})`} value={fGBP(htbLoanValue)}   sub="Government share" color={C.red} />
                        <Card label="Your Equity"              value={fGBP(userEquityNow)}             sub="Value − mortgage − HTB" color={C.green} />
                        <Card label="Mortgage Balance"         value={fGBP(params.currentMortgageBalance)} color={C.blue} />
                    </View>
                </View>

                <View style={S.section}>
                    <Text style={S.sectionTitle}>Input Parameters</Text>
                    <View style={{ flexDirection: 'row', gap: 24 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.muted, marginBottom: 6, textTransform: 'uppercase' }}>Property & HTB</Text>
                            <KV label="Current Property Value"     value={fGBP(params.initialPropertyValue)} />
                            <KV label="HTB Equity Loan %"          value={htbPctLabel} />
                            <KV label="HTB Equity Loan £"          value={fGBP(htbLoanValue)} />
                            <KV label="Annual Property Growth"     value={fPct(params.propertyAnnualGrowth)} />
                            <KV label="HTB Year 6 Interest Rate"   value={fPct(params.htbCurrentInterestRate)} />
                            <KV label="HTB Annual Rate Increase"   value={fPct(params.htbAnnualInterestGrowth) + ' (CPI + 2%)'} />
                            <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.muted, marginTop: 10, marginBottom: 6, textTransform: 'uppercase' }}>Simulation</Text>
                            <KV label="Projection Start"           value={fDate(simYear, simMonth)} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.muted, marginBottom: 6, textTransform: 'uppercase' }}>Mortgage</Text>
                            <KV label="Current Mortgage Balance"    value={fGBP(params.currentMortgageBalance)} />
                            <KV label="Current Mortgage Rate"       value={fPct(params.currentMortgageRate)} />
                            <KV label="Remaining Term"              value={`${params.remainingTermYears}y ${params.remainingTermExtraMonths ?? 0}m`} />
                            <KV label="Fix Ends"                    value={fDate(params.remortgageYear, params.remortgageMonth)} />
                            <KV label="New Mortgage Rate (assumed)" value={fPct(params.newMortgageRate)} />
                        </View>
                    </View>
                </View>

                <PageFooter page="Page 1 of 5" />
            </Page>

            {/* ═══════ PAGE 2 — HTB Buy Out Analysis ═══════ */}
            {(() => {
                if (!staircasingResults || !staircasingResults.optimal) return null;
                const { optimal, costCurve, rateTimeline, crossoverPoint } = staircasingResults;
                const isSavings    = optimal.savings >= 0;
                const crossoverYear = crossoverPoint ? simYear + crossoverPoint.year : null;
                const govtPct      = Math.round(params.htbPercentage * 100);
                const userPct      = 100 - govtPct;
                const growthPct    = (params.propertyAnnualGrowth * 100).toFixed(1);

                const barData = costCurve.map(o => ({
                    value: o.savings,
                    label: `${simYear + Math.round(o.months[0] / 12)}`,
                    color: o.savings >= 0 ? C.green : C.red,
                }));

                const rateLabels = rateTimeline.map(r => `${simYear + r.year}`);
                const rateDatasets = [
                    { data: rateTimeline.map(r => r.effectiveHtbRate * 100), color: C.red,    label: 'True HTB cost' },
                    { data: rateTimeline.map(r => r.mortgageRate * 100),     color: C.blue,   label: 'Your mortgage rate', dashed: true },
                    { data: rateTimeline.map(r => r.htbNominalRate * 100),   color: C.purple, label: 'HTB interest only',  dashed: true },
                ];

                const firstPositive = costCurve.find(c => c.savings > 0);
                const insightOpt    = isSavings ? optimal : (firstPositive || optimal);
                const insightYear   = simYear + Math.round(insightOpt.months[0] / 12);
                const insightLabel  = isSavings
                    ? `Buying out in ${insightYear} saves you ${fGBP(optimal.savings)}`
                    : firstPositive
                        ? `Hold off — buy out around ${insightYear} when the numbers work`
                        : `At your current mortgage rate, keeping the HTB loan is cheaper`;

                return (
                    <Page size="A4" style={S.page}>
                        <PageHeader title="HTB Equity Loan — Buy Out Analysis"
                            subtitle="When to buy out the government's share of your home"
                            date={generatedAt} />

                        <View style={S.cards}>
                            <Card label="Best Time to Buy Out"
                                value={fMonthToCalendar(insightOpt.months[0], simYear, simMonth)}
                                sub={`Full buyback · HTB: ${govtPct}%`}
                                color={C.green} />
                            <Card label={isSavings ? 'Total Net Saving' : 'Total Extra Cost'}
                                value={fGBP(optimal.savings)}
                                sub="vs never buying out"
                                color={isSavings ? C.green : C.red} />
                            <Card label="Ownership After Buyout"
                                value={`${userPct}% → 100%`}
                                sub={`Costs ${fGBP(insightOpt.buybackCost)} added to mortgage`}
                                color={C.blue} />
                            <Card label="Rate Breaking Point"
                                value={crossoverYear ? `${crossoverYear}` : 'Never'}
                                sub={crossoverYear
                                    ? `From ${crossoverYear} bank loan is cheaper`
                                    : `HTB stays cheaper for 25+ yrs at ${growthPct}% growth`}
                                color={C.purple} />
                        </View>

                        <View style={S.chartWrap}>
                            <Text style={S.chartTitle}>Net Savings by Buyout Year (vs never buying out)</Text>
                            <BarChart data={barData} width={515} height={148} />
                            <View style={S.chartLegend}>
                                <LegendItem color={C.green} label="Saves you money vs keeping HTB" />
                                <LegendItem color={C.red}   label="Costs you extra vs keeping HTB" />
                            </View>
                        </View>

                        <View style={S.chartWrap}>
                            <Text style={S.chartTitle}>True Cost Comparison — 25 Years (%)</Text>
                            <LineChart datasets={rateDatasets} labels={rateLabels} width={515} height={118}
                                yFmt={v => v.toFixed(1) + '%'} />
                            <View style={S.chartLegend}>
                                {rateDatasets.map((ds, i) => <LegendItem key={i} color={ds.color} label={ds.label} />)}
                                {crossoverYear && <LegendItem color={C.amber} label={`Breaking point: ${crossoverYear}`} />}
                            </View>
                        </View>

                        <View style={[S.insightPanel, {
                            backgroundColor: isSavings ? '#f0fdf4' : firstPositive ? '#fffbeb' : '#fef2f2',
                            borderLeftWidth: 3,
                            borderLeftColor: isSavings ? C.green : firstPositive ? C.amber : C.red,
                        }]}>
                            <Text style={[S.insightTitle, { color: isSavings ? C.green : firstPositive ? C.amber : C.red }]}>
                                Key Insight: {insightLabel}
                            </Text>
                            <View style={S.insightGrid}>
                                <View style={S.insightCol}>
                                    <Text style={S.insightColHead}>At time of buyout ({insightYear})</Text>
                                    <View style={S.insightRow}><Text style={S.insightLabel}>HTB loan value at buyout</Text><Text style={S.insightVal}>{fGBP(insightOpt.buybackCost)}</Text></View>
                                    <View style={S.insightRow}><Text style={S.insightLabel}>New mortgage balance</Text><Text style={S.insightVal}>{fGBP(insightOpt.newMortgageBalance)}</Text></View>
                                    <View style={S.insightRow}><Text style={S.insightLabel}>New monthly payment</Text><Text style={S.insightVal}>{fGBP(insightOpt.newMonthlyPayment)}/mo</Text></View>
                                    <View style={[S.insightRow, { borderBottomWidth: 0 }]}><Text style={S.insightLabel}>Min. household income needed</Text><Text style={[S.insightVal, { color: C.purple }]}>{fGBP(insightOpt.requiredIncome)}/yr</Text></View>
                                </View>
                                <View style={S.insightCol}>
                                    <Text style={S.insightColHead}>Over the life of your mortgage</Text>
                                    <View style={S.insightRow}><Text style={S.insightLabel}>HTB fees you avoid</Text><Text style={[S.insightVal, { color: C.green }]}>+ {fGBP(insightOpt.htbInterestSaved)}</Text></View>
                                    <View style={S.insightRow}><Text style={S.insightLabel}>Home growth you keep</Text><Text style={[S.insightVal, { color: C.green }]}>+ {fGBP(insightOpt.capitalCostSaved)}</Text></View>
                                    <View style={S.insightRow}><Text style={S.insightLabel}>Extra bank interest you pay</Text><Text style={[S.insightVal, { color: C.red }]}>- {fGBP(insightOpt.extraMortgageInterest)}</Text></View>
                                    <View style={[S.insightRow, { borderBottomWidth: 0, borderTopWidth: 0.5, borderTopColor: C.border, marginTop: 4, paddingTop: 4 }]}>
                                        <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold' }}>{isSavings ? 'Net saving' : 'Net extra cost'}</Text>
                                        <Text style={[S.insightVal, { color: isSavings ? C.green : C.red }]}>{fGBP(insightOpt.savings)} {isSavings ? 'better off' : 'worse off'}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        <PageFooter page="Page 2 of 5" />
                    </Page>
                );
            })()}

            {/* ═══════ PAGE 3 — Monthly Payments ═══════ */}
            {(() => {
                if (!projection || projection.length === 0) return null;
                const p0 = projection[0];

                const remortgageIdx = projection.findIndex(p => p.activeMortgageRate !== p0.activeMortgageRate);
                const startIdx = remortgageIdx === -1 ? 0 : remortgageIdx;
                const remortgagePeriod = projection.slice(startIdx, startIdx + 24);
                const avgMortgage = remortgagePeriod.reduce((s, p) => s + p.mortgagePayment, 0) / (remortgagePeriod.length || 1);
                const avgHtb      = remortgagePeriod.reduce((s, p) => s + p.htbInterestPayment, 0) / (remortgagePeriod.length || 1);
                const remortgageLabel = fDate(params.remortgageYear, params.remortgageMonth);

                const quarterly = projection.slice(0, 60).filter((_, i) => i % 3 === 0);
                const qLabels   = quarterly.map(p => {
                    const d = new Date(simYear, (simMonth - 1) + p.month, 1);
                    const q = Math.ceil((d.getMonth() + 1) / 3);
                    return `Q${q}'${d.getFullYear().toString().slice(-2)}`;
                });
                const stackedSegments = [
                    quarterly.map(p => p.mortgagePrincipalMonth),
                    quarterly.map(p => p.mortgageInterestMonth),
                    quarterly.map(p => p.htbInterestPayment),
                ];
                const stackedColors = [C.blue, '#93c5fd', C.red];

                const yearlyRows = projection.filter(p => p.month % 12 === 0).slice(0, 10);

                return (
                    <Page size="A4" style={S.page}>
                        <PageHeader title="Monthly Payments Projection"
                            subtitle="Payment breakdown before and after your remortgage"
                            date={generatedAt} />

                        <View style={S.cards}>
                            <Card label="Monthly Payments Now"
                                value={`${fGBP(p0.totalMonthlyOutgoings)}/mo`}
                                sub={`Mortgage: ${fGBP(p0.mortgagePayment)}/mo  |  HTB: ${fGBP(p0.htbInterestPayment)}/mo`}
                                color={C.blue} />
                            <Card label={`After Remortgage (avg to ${remortgageLabel})`}
                                value={`${fGBP(avgMortgage + avgHtb)}/mo`}
                                sub={`Mortgage: ${fGBP(avgMortgage)}/mo  |  HTB: ${fGBP(avgHtb)}/mo`}
                                color={C.amber} />
                        </View>

                        <View style={S.chartWrap}>
                            <Text style={S.chartTitle}>Monthly Outgoings Breakdown — 5 Years (Quarterly)</Text>
                            <StackedBarChart segments={stackedSegments} colors={stackedColors}
                                labels={qLabels} width={515} height={150}
                                yFmt={v => `£${Math.round(v).toLocaleString('en-GB')}`} />
                            <View style={S.chartLegend}>
                                <LegendItem color={C.blue}   label="Mortgage — building equity" />
                                <LegendItem color="#93c5fd"  label="Mortgage — interest to bank" />
                                <LegendItem color={C.red}    label="HTB equity loan interest" />
                            </View>
                        </View>

                        <View style={S.section}>
                            <Text style={S.sectionTitle}>Annual Payment Summary (first 10 years)</Text>
                            <View style={S.tableHeader}>
                                <Text style={S.tableHeaderText}>Year</Text>
                                <Text style={S.tableHeaderText}>Date</Text>
                                <Text style={S.tableHeaderText}>Mortgage/mo</Text>
                                <Text style={S.tableHeaderText}>HTB Int./mo</Text>
                                <Text style={S.tableHeaderText}>Total/mo</Text>
                                <Text style={S.tableHeaderText}>Rate</Text>
                            </View>
                            {yearlyRows.map((p, i) => (
                                <View key={i} style={[S.tableRow, i % 2 === 1 ? S.tableAlt : {}]}>
                                    <Text style={S.tableCell}>{p.year}</Text>
                                    <Text style={S.tableCell}>{fMonthToCalendar(p.month, simYear, simMonth)}</Text>
                                    <Text style={S.tableCell}>{fGBP(p.mortgagePayment)}</Text>
                                    <Text style={S.tableCell}>{fGBP(p.htbInterestPayment)}</Text>
                                    <Text style={[S.tableCell, { fontFamily: 'Helvetica-Bold' }]}>{fGBP(p.totalMonthlyOutgoings)}</Text>
                                    <Text style={S.tableCell}>{fPct(p.activeMortgageRate)}</Text>
                                </View>
                            ))}
                        </View>

                        <PageFooter page="Page 3 of 5" />
                    </Page>
                );
            })()}

            {/* ═══════ PAGE 4 — Home & Debt Projections ═══════ */}
            {(() => {
                if (!projection || projection.length === 0) return null;

                const yearlyData = projection.filter((_, i) => i % 12 === 0);
                const wLabels    = yearlyData.map(p => `${simYear + p.year}`);
                const wealthDatasets = [
                    { data: yearlyData.map(p => p.propertyValue), color: C.green, label: 'Property value' },
                    { data: yearlyData.map(p => p.totalDebt),     color: C.red,   label: 'Total debt (mortgage + HTB)', dashed: true },
                    { data: yearlyData.map(p => p.userEquity),    color: C.blue,  label: 'Your equity' },
                ];

                const biennial = projection.filter((_, i) => i % 24 === 0).slice(0, 18);

                return (
                    <Page size="A4" style={S.page}>
                        <PageHeader title="Home Equity & Debt Projections"
                            subtitle="How your property value, debt, and equity change over the mortgage term"
                            date={generatedAt} />

                        <View style={S.chartWrap}>
                            <Text style={S.chartTitle}>Property Value · Total Debt · Your Equity (full term)</Text>
                            <LineChart datasets={wealthDatasets} labels={wLabels} width={515} height={175} yFmt={fK} />
                            <View style={S.chartLegend}>
                                {wealthDatasets.map((ds, i) => <LegendItem key={i} color={ds.color} label={ds.label} />)}
                            </View>
                        </View>

                        <View style={S.section}>
                            <Text style={S.sectionTitle}>Equity Snapshot (every 2 years)</Text>
                            <View style={S.tableHeader}>
                                <Text style={S.tableHeaderText}>Yr</Text>
                                <Text style={S.tableHeaderText}>Date</Text>
                                <Text style={S.tableHeaderText}>Property Value</Text>
                                <Text style={S.tableHeaderText}>Mortgage Bal.</Text>
                                <Text style={S.tableHeaderText}>HTB Value</Text>
                                <Text style={S.tableHeaderText}>Your Equity</Text>
                                <Text style={S.tableHeaderText}>LTV</Text>
                            </View>
                            {biennial.map((p, i) => {
                                const ltv = p.propertyValue > 0
                                    ? ((p.mortgageBalance / p.propertyValue) * 100).toFixed(1) + '%'
                                    : '—';
                                return (
                                    <View key={i} style={[S.tableRow, i % 2 === 1 ? S.tableAlt : {}]}>
                                        <Text style={S.tableCell}>{p.year}</Text>
                                        <Text style={S.tableCell}>{fMonthToCalendar(p.month, simYear, simMonth)}</Text>
                                        <Text style={S.tableCell}>{fGBP(p.propertyValue)}</Text>
                                        <Text style={S.tableCell}>{fGBP(p.mortgageBalance)}</Text>
                                        <Text style={S.tableCell}>{fGBP(p.htbEquityValue)}</Text>
                                        <Text style={[S.tableCell, { color: C.blue, fontFamily: 'Helvetica-Bold' }]}>{fGBP(p.userEquity)}</Text>
                                        <Text style={S.tableCell}>{ltv}</Text>
                                    </View>
                                );
                            })}
                        </View>

                        <PageFooter page="Page 4 of 5" />
                    </Page>
                );
            })()}

            {/* ═══════ PAGE 5 — Assumptions & Disclaimer ═══════ */}
            <Page size="A4" style={S.page}>
                <PageHeader title="Assumptions & Model Notes" date={generatedAt} />

                <View style={S.section}>
                    <Text style={S.sectionTitle}>How These Projections Work</Text>
                    <Text style={{ fontSize: 9, color: C.muted, lineHeight: 1.5, marginBottom: 10 }}>
                        These projections provide a mathematical model of your financial future based on the parameters
                        you provided. All figures are derived from a month-by-month simulation running over your full
                        remaining mortgage term. Real-world results will vary based on market conditions, lender
                        criteria, and personal circumstances.
                    </Text>
                </View>

                {[
                    {
                        title: 'Property Value & Equity',
                        points: [
                            `Property value projected using ${(params.propertyAnnualGrowth * 100).toFixed(1)}% annual growth, compounded monthly.`,
                            'Your equity = Current Property Value − (Mortgage Balance + HTB Equity Loan Value).',
                            'HTB Equity Loan value = given percentage × current property value at each point in time.',
                        ]
                    },
                    {
                        title: 'Help to Buy Interest Fees',
                        points: [
                            'HTB fees are interest-only — they do not reduce the principal loan amount.',
                            `HTB interest rate increases by ${(params.htbAnnualInterestGrowth * 100).toFixed(1)}% annually (CPI + 2%) in this projection.`,
                            'Monthly HTB interest is calculated on the original HTB loan value, not the current property value.',
                        ]
                    },
                    {
                        title: 'Effective HTB Rate (True Cost)',
                        points: [
                            'True HTB cost = Nominal HTB interest rate + Property annual growth rate.',
                            'Because the HTB share tracks property value, every % of annual growth is equity flowing to the government — not to you.',
                            'The Rate Breaking Point is the year when the true HTB cost first exceeds your assumed remortgage rate.',
                        ]
                    },
                    {
                        title: 'Mortgage & Remortgaging',
                        points: [
                            'Payments are standard capital-and-interest amortisation over the remaining term.',
                            'Remortgage rate is assumed constant for the full remaining term after the fix ends.',
                            'No missed payments, overpayments, or changes to the term are modelled.',
                        ]
                    },
                    {
                        title: 'Staircasing (Buying Out the HTB Loan)',
                        points: [
                            'Buyout cost = projected property value at the buyout date × HTB percentage.',
                            'Assumes a single full (100%) buyback — the cost is added to the mortgage balance.',
                            'Monthly payment is immediately recalculated after the staircase event.',
                            'Net saving vs never buying out accounts for: HTB fees avoided + equity growth kept − extra bank interest paid.',
                        ]
                    },
                    {
                        title: 'Exclusions',
                        points: [
                            'Legal fees, stamp duty, and mortgage product fees are excluded from all projections.',
                            'RICS valuation fees (typically £250–£500) are excluded unless separately specified.',
                            'No personal tax implications or inflation adjustments are applied.',
                        ]
                    },
                ].map((group, i) => (
                    <View key={i} style={S.assumGroup}>
                        <Text style={S.assumTitle}>{group.title}</Text>
                        {group.points.map((pt, j) => (
                            <Text key={j} style={S.assumPoint}>• {pt}</Text>
                        ))}
                    </View>
                ))}

                <View style={{ marginTop: 10, padding: 12, backgroundColor: '#fefce8', borderRadius: 4, borderLeftWidth: 3, borderLeftColor: C.amber }}>
                    <Text style={{ fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: '#92400e', marginBottom: 5 }}>Important Disclaimer</Text>
                    <Text style={{ fontSize: 8, color: '#78350f', lineHeight: 1.6 }}>
                        This report is provided for general information and illustrative purposes only. It does not
                        constitute financial, mortgage, or investment advice. All calculations are estimates based on
                        the assumptions and inputs you have provided. Actual mortgage rates, property valuations,
                        Help to Buy terms, and lending criteria may differ materially from these projections.
                        The UK Help to Buy Equity Loan scheme is administered by Homes England; scheme rules may
                        change. We strongly recommend obtaining advice from a qualified and regulated mortgage
                        broker or independent financial adviser before making any financial decisions relating to
                        your equity loan or mortgage.
                    </Text>
                </View>

                <PageFooter page="Page 5 of 5" />
            </Page>

        </Document>
    );
};

export default PDFReport;
