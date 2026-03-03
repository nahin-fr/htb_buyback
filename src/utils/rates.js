/**
 * UK Financial Rates Utility
 * Fetches latest CPI and Bank of England rates for autopopulating mortgage calculations.
 */

/**
 * Fetches the latest UK CPI annual inflation rate from DBnomics (ONS data).
 * Series D7G7: CPI ANNUAL RATE 00: ALL ITEMS 2015=100
 * @returns {Promise<number|null>} The CPI rate as a decimal (e.g., 0.03 for 3.0%), or null if it fails.
 */
export async function fetchLatestCpi() {
    try {
        // DBnomics provides a reliable CORS-friendly JSON API for ONS data
        const response = await fetch('https://api.db.nomics.world/v22/series/ONS/MM23/D7G7.M?observations=1');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();

        if (data?.series?.docs?.[0]?.observations) {
            const observations = data.series.docs[0].observations;
            if (observations.length > 0) {
                // Latest value is the last element
                const latestValue = observations[observations.length - 1];
                const rate = parseFloat(latestValue);
                if (!isNaN(rate)) return rate / 100;
            }
        }
        return null;
    } catch (error) {
        console.warn('CPI fetch failed, using fallback/null:', error.message);
        return null; // Let the caller handle the null fallback
    }
}

/**
 * Fetches the latest Bank of England base rate.
 * @returns {Promise<number|null>} The base rate as a decimal (e.g., 0.0375 for 3.75%), or null if it fails.
 */
export async function fetchLatestBoEBaseRate() {
    // Reliable fallback for early 2026
    const FALLBACK_RATE = 0.0375;

    try {
        // Optimized URL for direct CSV export of IUMABEDR series
        const url = `https://www.bankofengland.co.uk/boeapps/database/_iadb-fromshowcolumns.asp?csv.x=yes&Datefrom=01/Jan/2026&Dateto=now&SeriesCodes=IUMABEDR&CSVF=TN&UsingCodes=Y&VPD=Y`;

        // Note: Browsers may block this due to CORS. If it fails, we use the fallback.
        const response = await fetch(url);
        if (!response.ok) {
            console.warn(`BoE fetch returned status ${response.status}. Using fallback.`);
            return FALLBACK_RATE;
        }

        const text = await response.text();
        const lines = text.trim().split('\n');

        // CSV format: DATE,IUMABEDR \n 31 Jan 2026,3.75
        if (lines.length > 1) {
            const lastLine = lines[lines.length - 1];
            const parts = lastLine.split(',');
            if (parts.length >= 2) {
                const rate = parseFloat(parts[1].replace(/"/g, ''));
                if (!isNaN(rate)) return rate / 100;
            }
        }

        return FALLBACK_RATE;
    } catch {
        // Log as warning instead of error to keep console clean if it's just CORS
        console.warn('BoE Base Rate fetch unavailable (likely CORS or network). Using fallback 3.75%');
        return FALLBACK_RATE;
    }
}
