import { onCLS, onINP, onLCP } from 'web-vitals';

function logVitals({ name, delta, id }) {
    // In a real application, you might send this to GA4, Sentry, or a custom endpoint.
    // For now, we'll log it to the console in development.
    console.log(`[Web Vitals] ${name}: ${delta.toFixed(3)} (id: ${id})`);
}

export function reportWebVitals() {
    onCLS(logVitals);
    onINP(logVitals);
    onLCP(logVitals);
}
