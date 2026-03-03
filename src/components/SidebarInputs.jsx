import React from 'react';
import { Settings, Home, Percent, PoundSterling, Calendar } from 'lucide-react';

const InputGroup = ({ icon, label, name, value, min, max, step, suffix, isPercent, integer, onChange }) => {
    const IconComponent = icon;
    // For percent fields: display in % (e.g. 4.79), store as decimal (0.0479)
    // For integer fields: round to whole number for display and storage
    const toDisplay = v => {
        if (isPercent) return parseFloat((parseFloat(v) * 100).toFixed(4));
        if (integer) return Math.round(parseFloat(v));
        return parseFloat(v);
    };
    const displayVal = toDisplay(value);
    const displayMin = toDisplay(min);
    const displayMax = toDisplay(max);
    const displayStep = toDisplay(step);

    const handleChange = (e) => {
        const raw = parseFloat(e.target.value);
        const stored = isPercent ? parseFloat((raw / 100).toFixed(6)) : integer ? Math.round(raw) : raw;
        onChange({ target: { name: e.target.name, value: isNaN(stored) ? 0 : stored } });
    };

    return (
        <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                <IconComponent size={16} className="text-gradient" /> {label}
            </label>
            <input
                type="range"
                name={name}
                min={displayMin}
                max={displayMax}
                step={displayStep}
                value={displayVal}
                onChange={handleChange}
                style={{ marginBottom: '8px' }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                    type="number"
                    name={name}
                    value={displayVal}
                    onChange={handleChange}
                    step={displayStep}
                />
                {suffix && <span style={{ color: 'var(--text-muted)' }}>{suffix}</span>}
            </div>
        </div>
    );
};

export default function SidebarInputs({ params, setParams }) {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setParams(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    };

    return (
        <aside className="glass-panel fade-in" style={{ width: '380px', flexShrink: 0, padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', animationDelay: '0.1s', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Settings size={24} className="text-gradient" />
                <h2>Parameters</h2>
            </div>

            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                <h3 style={{ marginBottom: '16px', fontSize: '16px', color: 'var(--text-muted)' }}>Property & Help to Buy</h3>
                <InputGroup
                    icon={Home} label="Current Property Value" name="initialPropertyValue"
                    value={params.initialPropertyValue} min="100000" max="2000000" step="1000" suffix="£"
                    onChange={handleChange}
                />
                <InputGroup
                    icon={Percent} label="HTB Equity Loan (%)" name="htbPercentage"
                    value={params.htbPercentage} min="0.05" max="0.40" step="0.01" suffix="%" isPercent
                    onChange={handleChange}
                />
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '-14px', marginBottom: '20px' }}>
                    = £{Math.round(params.initialPropertyValue * params.htbPercentage).toLocaleString()} HTB Equity Loan value at current property price
                </div>
                <InputGroup
                    icon={Percent} label="Current HTB Interest Rate" name="htbCurrentInterestRate"
                    value={params.htbCurrentInterestRate} min="0.000" max="0.05" step="0.0001" suffix="%" isPercent
                    onChange={handleChange}
                />
                <InputGroup
                    icon={Percent} label="Annual Property Price Growth" name="propertyAnnualGrowth"
                    value={params.propertyAnnualGrowth} min="-0.05" max="0.10" step="0.001" suffix="%" isPercent
                    onChange={handleChange}
                />
                <InputGroup
                    icon={Percent} label="HTB Interest Rate Rise Per Year" name="htbAnnualInterestGrowth"
                    value={params.htbAnnualInterestGrowth} min="0" max="0.10" step="0.001" suffix="%" isPercent
                    onChange={handleChange}
                />
            </div>

            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                <h3 style={{ marginBottom: '16px', fontSize: '16px', color: 'var(--text-muted)' }}>Your Mortgage</h3>
                <InputGroup
                    icon={PoundSterling} label="Current Mortgage Balance" name="currentMortgageBalance"
                    value={params.currentMortgageBalance} min="1000" max="1000000" step="100" suffix="£" integer
                    onChange={handleChange}
                />
                <InputGroup
                    icon={Percent} label="Current Fixed Interest Rate" name="currentMortgageRate"
                    value={params.currentMortgageRate} min="0.01" max="0.10" step="0.0001" suffix="%" isPercent
                    onChange={handleChange}
                />
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                        <Calendar size={16} className="text-gradient" /> Remaining Mortgage Term
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <div style={{ flex: 1 }}>
                            <input
                                type="number"
                                name="remainingTermYears"
                                value={params.remainingTermYears}
                                onChange={handleChange}
                                min="1" max="40" step="1"
                                style={{ width: '100%' }}
                            />
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>years</span>
                        </div>
                        <div style={{ flex: 1 }}>
                            <input
                                type="number"
                                name="remainingTermExtraMonths"
                                value={params.remainingTermExtraMonths}
                                onChange={handleChange}
                                min="0" max="11" step="1"
                                style={{ width: '100%' }}
                            />
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>months</span>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', borderColor: 'var(--accent-primary)', borderWidth: '1px', borderStyle: 'solid' }}>
                <h3 style={{ marginBottom: '16px', fontSize: '16px', color: 'var(--text-muted)' }}>Remortgage Details</h3>

                {/* Remortgage Start Date — when the projection starts from */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                        <Calendar size={16} className="text-gradient" /> Remortgage Start Date
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <select
                            name="simulationMonth"
                            value={params.simulationMonth}
                            onChange={handleChange}
                            style={{ flex: 1, background: 'rgba(0,0,0,0.2)', color: 'var(--text-main)', border: '1px solid var(--glass-border)', padding: '8px', borderRadius: '8px', outline: 'none' }}
                        >
                            <option value="1">Jan</option>
                            <option value="2">Feb</option>
                            <option value="3">Mar</option>
                            <option value="4">Apr</option>
                            <option value="5">May</option>
                            <option value="6">Jun</option>
                            <option value="7">Jul</option>
                            <option value="8">Aug</option>
                            <option value="9">Sep</option>
                            <option value="10">Oct</option>
                            <option value="11">Nov</option>
                            <option value="12">Dec</option>
                        </select>
                        <select
                            name="simulationYear"
                            value={params.simulationYear}
                            onChange={handleChange}
                            style={{ flex: 1, background: 'rgba(0,0,0,0.2)', color: 'var(--text-main)', border: '1px solid var(--glass-border)', padding: '8px', borderRadius: '8px', outline: 'none' }}
                        >
                            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <InputGroup
                    icon={Percent} label="Remortgage Interest Rate" name="newMortgageRate"
                    value={params.newMortgageRate} min="0.01" max="0.10" step="0.0001" suffix="%" isPercent
                    onChange={handleChange}
                />

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                        <Calendar size={16} className="text-gradient" /> When Your Fixed Rate Ends
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <select
                            name="remortgageMonth"
                            value={params.remortgageMonth}
                            onChange={handleChange}
                            style={{ flex: 1, background: 'rgba(0,0,0,0.2)', color: 'var(--text-main)', border: '1px solid var(--glass-border)', padding: '8px', borderRadius: '8px', outline: 'none' }}
                        >
                            <option value="1">Jan</option>
                            <option value="2">Feb</option>
                            <option value="3">Mar</option>
                            <option value="4">Apr</option>
                            <option value="5">May</option>
                            <option value="6">Jun</option>
                            <option value="7">Jul</option>
                            <option value="8">Aug</option>
                            <option value="9">Sep</option>
                            <option value="10">Oct</option>
                            <option value="11">Nov</option>
                            <option value="12">Dec</option>
                        </select>
                        <select
                            name="remortgageYear"
                            value={params.remortgageYear}
                            onChange={handleChange}
                            style={{ flex: 1, background: 'rgba(0,0,0,0.2)', color: 'var(--text-main)', border: '1px solid var(--glass-border)', padding: '8px', borderRadius: '8px', outline: 'none' }}
                        >
                            {Array.from({ length: 20 }, (_, i) => (params.simulationYear ?? new Date().getFullYear()) + i).map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <p style={{ marginTop: '4px', fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    * This projection assumes you remortgage at the above rate for the full remaining term, with no further rate changes.
                </p>
            </div>
        </aside>
    );
}
