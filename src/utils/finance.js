/**
 * Helper to calculate regular amortized mortgage payment
 */
export function calculateMonthlyPayment(principal, annualRate, months) {
    if (annualRate === 0) return principal / months;
    const monthlyRate = annualRate / 12;
    return principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
}

/**
 * Generate a month-by-month projection of property value, mortgage balance, HTB equity, and payments.
 * 
 * @param {Object} params
 * @returns {Array} Array of monthly data points
 */
export function generateProjection({
    initialPropertyValue,
    htbPercentage, // e.g., 0.40
    htbCurrentInterestRate, // e.g., 0.018147
    htbAnnualInterestGrowth, // The percentage the *rate* grows by each year (e.g., CPI+2%, maybe 4% total = 0.04)
    currentMortgageBalance,
    currentMortgageRate, // e.g., 0.0479
    fixedRateMonthsRemaining, // e.g., 1 (April 2026)
    newMortgageRate, // e.g., 0.045
    remainingTermMonths, // e.g., 400
    propertyAnnualGrowth, // e.g., 0.02
    originalHtbValue = 186000, // fallback
}) {
    const projection = [];

    let currentPropValue = initialPropertyValue;
    let mortgageBalance = currentMortgageBalance;
    let currentHtbRate = htbCurrentInterestRate;

    // Use originalHtbValue if provided in params, otherwise default to a calculated guess based on current HTB Interest Payment
    // To cleanly fix the hardcoding: If we know the current property value but not the original, 
    // a common fallback for this prototype until added to UI is ~186000, 
    // but better to add it to params as a default. For now, since it wasn't in UI, let's reverse engineer it from default:
    // We now just use the destructured `originalHtbValue` with a default of 186000.

    // Calculate current fixed payment
    const currentPayment = calculateMonthlyPayment(currentMortgageBalance, currentMortgageRate, remainingTermMonths);

    // We need a variable to scope the remortgage payment across the loop
    let calculatedRemortgagePayment = null;

    for (let month = 1; month <= remainingTermMonths; month++) {
        // 1. Property value update (assuming monthly compounding of annual growth)
        currentPropValue *= Math.pow(1 + propertyAnnualGrowth, 1 / 12);

        // 2. Determine HTB Equity Loan value
        // HTB always claims the percentage of the current property value
        const htbEquityValue = currentPropValue * htbPercentage;

        // 3. Determine HTB Interest Payment
        // HTB interest increases annually in April. For simplicity, we increase it every 12 months in this projection.
        if (month > 1 && month % 12 === 0) {
            currentHtbRate *= (1 + htbAnnualInterestGrowth);
        }
        // Monthly interest payment is based on original loan amount
        const htbInterestPayment = (originalHtbValue * currentHtbRate) / 12;

        // 4. Determine Mortgage Payment and Interest
        let activeMortgageRate = month <= fixedRateMonthsRemaining ? currentMortgageRate : newMortgageRate;

        // Only calculate the remortgage payment ONCE when the fix ends, and then use that static value
        let activePayment;
        if (month <= fixedRateMonthsRemaining) {
            activePayment = currentPayment;
        } else {
            // If we haven't already calculated and stored the new post-fix payment, do it now
            if (calculatedRemortgagePayment === null) {
                calculatedRemortgagePayment = calculateMonthlyPayment(mortgageBalance, newMortgageRate, remainingTermMonths - month + 1);
            }
            activePayment = calculatedRemortgagePayment;
        }

        // Interest for this month
        const mortgageInterest = mortgageBalance * (activeMortgageRate / 12);
        const principalPaid = activePayment - mortgageInterest;

        // Track required details for the frontend breakdowns
        mortgageBalance -= principalPaid;
        if (mortgageBalance < 0) mortgageBalance = 0;

        const totalDebt = mortgageBalance + htbEquityValue;
        const userEquity = currentPropValue - totalDebt;

        projection.push({
            month,
            year: Math.floor(month / 12),
            propertyValue: currentPropValue,
            mortgageBalance,
            htbEquityValue,
            totalDebt,
            userEquity,
            htbInterestPayment,
            mortgagePayment: activePayment,
            mortgageInterestMonth: mortgageInterest,
            mortgagePrincipalMonth: principalPaid,
            totalMonthlyOutgoings: activePayment + htbInterestPayment,
            activeMortgageRate,
            activeHtbRate: currentHtbRate
        });

        if (mortgageBalance === 0 && month >= remainingTermMonths) {
            break;
        }
    }

    // After the projection runs, do a single reverse pass to calculate the "Remaining Future Interest" 
    // to visualize how the interest burden shrinks to 0 over the life of the loan.
    let futureInterestAccumulator = 0;
    for (let i = projection.length - 1; i >= 0; i--) {
        futureInterestAccumulator += projection[i].mortgageInterestMonth;
        projection[i].remainingFutureMortgageInterest = futureInterestAccumulator;
    }

    return projection;
}

/**
 * Simulate a full projection WITH a staircasing event at a given month.
 * Returns total cost = cumulative HTB interest + buyback cost + cumulative mortgage payments.
 */
function simulateWithStaircase(params, staircaseMonths, valuationFee = 300) {
    const {
        initialPropertyValue, htbPercentage, htbCurrentInterestRate,
        htbAnnualInterestGrowth, currentMortgageBalance, currentMortgageRate,
        fixedRateMonthsRemaining, newMortgageRate, remainingTermMonths, propertyAnnualGrowth,
        originalHtbValue = 186000 // default fallback
    } = params;
    const numStaircases = staircaseMonths.length;
    const portionPerStaircase = numStaircases > 0 ? htbPercentage / numStaircases : 0; // equal splits

    let currentPropValue = initialPropertyValue;
    let mortgageBalance = currentMortgageBalance;
    let currentHtbRate = htbCurrentInterestRate;
    let remainingHtbPct = htbPercentage;

    let currentPayment = calculateMonthlyPayment(currentMortgageBalance, currentMortgageRate, remainingTermMonths);

    let totalHtbInterestPaid = 0;
    let totalBuybackCost = 0;
    let totalMortgageInterestPaid = 0;

    // Sort staircase months ascending
    const sortedMonths = [...staircaseMonths].sort((a, b) => a - b);
    let nextStaircaseIdx = 0;

    for (let month = 1; month <= remainingTermMonths; month++) {
        currentPropValue *= Math.pow(1 + propertyAnnualGrowth, 1 / 12);

        if (month > 1 && month % 12 === 0) {
            currentHtbRate *= (1 + htbAnnualInterestGrowth);
        }

        let rateChangedThisMonth = (month === fixedRateMonthsRemaining + 1);
        let balanceChangedThisMonth = false;

        // Check if this is a staircase month
        if (nextStaircaseIdx < sortedMonths.length && month === sortedMonths[nextStaircaseIdx]) {
            const buybackCost = currentPropValue * portionPerStaircase + valuationFee;
            totalBuybackCost += buybackCost;
            remainingHtbPct -= portionPerStaircase;
            if (remainingHtbPct < 0.001) remainingHtbPct = 0;

            // Add buyback cost to mortgage (remortgage to fund it)
            mortgageBalance += buybackCost;
            balanceChangedThisMonth = true;
            nextStaircaseIdx++;
        }

        let activeMortgageRate = month <= fixedRateMonthsRemaining ? currentMortgageRate : newMortgageRate;

        // Recalculate monthly payment if balance jumped (staircased) OR rate changed (end of fix)
        if (balanceChangedThisMonth || rateChangedThisMonth) {
            currentPayment = calculateMonthlyPayment(mortgageBalance, activeMortgageRate, remainingTermMonths - month + 1);
        }

        // HTB interest (proportional to remaining percentage)
        const htbRatio = remainingHtbPct / htbPercentage; // e.g., 0.5 if half bought back
        const htbInterest = remainingHtbPct > 0 ? (originalHtbValue * currentHtbRate * htbRatio) / 12 : 0;
        totalHtbInterestPaid += htbInterest;

        // Mortgage payment
        const mortgageInterest = mortgageBalance * (activeMortgageRate / 12);
        totalMortgageInterestPaid += mortgageInterest;
        const principalPaid = currentPayment - mortgageInterest;
        mortgageBalance -= principalPaid;
        if (mortgageBalance < 0) mortgageBalance = 0;
    }

    // Crucial: The true cost of any scenario must include the remaining debt owed to the government at the end of the term.
    // Otherwise, the baseline (never staircase) incorrectly looks hundreds of thousands of pounds "cheaper" because it ignores the fact that you still owe 40% of the (now much higher) property value.
    const finalHtbDebt = currentPropValue * remainingHtbPct;

    return {
        totalHtbInterestPaid,
        totalBuybackCost,
        totalMortgageInterestPaid,
        finalHtbDebt,
        totalCost: totalHtbInterestPaid + totalBuybackCost + totalMortgageInterestPaid + finalHtbDebt,
    };
}

/**
 * Find the optimal staircasing schedule and generate rich analysis data.
 * @param {Object} params
 * @param {number} numStaircases
 * @param {number} valuationFee
 * @returns {Object}
 */
export function calculateStaircasingOptions(params, numStaircases = 1, valuationFee = 300) {
    const { remainingTermMonths, initialPropertyValue, htbPercentage, htbCurrentInterestRate,
        htbAnnualInterestGrowth, propertyAnnualGrowth, newMortgageRate } = params;

    // Baseline: never staircase
    const baseline = simulateWithStaircase(params, [], valuationFee);

    const step = numStaircases === 1 ? 12 : 6;
    const maxMonth = Math.min(remainingTermMonths - 12, 240);

    let bestOption = null;
    const allOptions = [];

    const runSearch = (months) => {
        const result = simulateWithStaircase(params, months, valuationFee);
        const savings = baseline.totalCost - result.totalCost;
        const htbInterestSaved = baseline.totalHtbInterestPaid - result.totalHtbInterestPaid;
        const extraMortgageInterest = result.totalMortgageInterestPaid - baseline.totalMortgageInterestPaid;
        // Capital cost saved = The equity you kept by buying out early - What it actually cost to buy out
        const capitalCostSaved = baseline.finalHtbDebt - (result.finalHtbDebt + result.totalBuybackCost);

        // Affordability: what income is needed to take on the bigger mortgage?
        const buybackMonth = months[0];
        const propValueAtBuyback = initialPropertyValue * Math.pow(1 + propertyAnnualGrowth, buybackMonth / 12);
        const buybackCost = propValueAtBuyback * htbPercentage;
        const newMortgageBalance = params.currentMortgageBalance + buybackCost;
        const termRemaining = remainingTermMonths - buybackMonth;
        const newMonthlyPayment = termRemaining > 0
            ? calculateMonthlyPayment(newMortgageBalance, newMortgageRate, termRemaining)
            : 0;
        // UK lender rules: stricter of 4.5× income multiple or 35% monthly affordability
        const incomeByMultiple = newMortgageBalance / 4.5;
        const incomeByAffordability = (newMonthlyPayment * 12) / 0.35;
        const requiredIncome = Math.max(incomeByMultiple, incomeByAffordability);

        const option = {
            months, ...result, savings, htbInterestSaved, extraMortgageInterest, capitalCostSaved,
            newMortgageBalance, newMonthlyPayment, requiredIncome, buybackCost,
        };
        allOptions.push(option);
        if (!bestOption || result.totalCost < bestOption.totalCost) {
            bestOption = option;
        }
    };

    if (numStaircases === 1) {
        for (let m = 1; m <= maxMonth; m += step) runSearch([m]);
    } else if (numStaircases === 2) {
        for (let m1 = 1; m1 <= maxMonth; m1 += step)
            for (let m2 = m1 + 12; m2 <= maxMonth; m2 += step) runSearch([m1, m2]);
    } else if (numStaircases === 3) {
        for (let m1 = 1; m1 <= maxMonth; m1 += step)
            for (let m2 = m1 + 12; m2 <= maxMonth; m2 += step)
                for (let m3 = m2 + 12; m3 <= maxMonth; m3 += step) runSearch([m1, m2, m3]);
    }

    // Net savings curve (1 staircase only)
    const costCurve = numStaircases === 1
        ? allOptions.sort((a, b) => a.months[0] - b.months[0])
        : [];

    // Rate timeline: effective HTB rate vs mortgage rate over 25 years
    const originalHtbValue = params.originalHtbValue ?? 186000;
    const rateTimeline = [];
    for (let year = 0; year <= 25; year++) {
        const propValueAtYear = initialPropertyValue * Math.pow(1 + propertyAnnualGrowth, year);
        const htbRateAtYear = htbCurrentInterestRate * Math.pow(1 + htbAnnualInterestGrowth, year);
        const buybackCostAtYear = propValueAtYear * htbPercentage;
        const annualHtbCost = originalHtbValue * htbRateAtYear;
        // The TRUE effective HTB rate = (Cash Interest / Current Buyback Cost) + Property Growth Rate
        // Because keeping the HTB loan means paying the cash fee AND giving away the property equity growth.
        const effectiveHtbRate = (annualHtbCost / buybackCostAtYear) + propertyAnnualGrowth;
        rateTimeline.push({
            year,
            htbNominalRate: htbRateAtYear,
            effectiveHtbRate,
            mortgageRate: newMortgageRate,
            buybackCost: buybackCostAtYear,
            annualHtbCost,
        });
    }

    // Find rate crossover year
    const crossoverPoint = rateTimeline.find(r => r.effectiveHtbRate >= newMortgageRate);

    return {
        optimal: bestOption,
        baseline,
        costCurve,
        numStaircases,
        rateTimeline,
        crossoverPoint,
    };
}


