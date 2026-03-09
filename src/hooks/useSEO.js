import { useEffect } from 'react';

const BASE_URL = 'https://buybackhtb.com';

/**
 * useSEO
 *
 * Lightweight hook to update document.title and the canonical link tag
 * during SPA navigation. This handles the client-side (hydration) case;
 * the static HTML files already have the correct tags pre-injected by
 * the prerender-meta.js build script.
 *
 * @param {Object} options
 * @param {string} options.title       - Full page title
 * @param {string} [options.description] - Meta description (optional, not injected by browsers but kept for consistency)
 * @param {string} [options.path]      - Route path for the canonical URL, e.g. '/blog/my-slug'
 */
export function useSEO({ title, description, path }) {
    useEffect(() => {
        // Update document title
        if (title) {
            document.title = title;
        }

        // Update canonical tag
        if (path) {
            const canonicalUrl = `${BASE_URL}${path}`;
            let canonicalEl = document.querySelector('link[rel="canonical"]');
            if (!canonicalEl) {
                canonicalEl = document.createElement('link');
                canonicalEl.setAttribute('rel', 'canonical');
                document.head.appendChild(canonicalEl);
            }
            canonicalEl.setAttribute('href', canonicalUrl);
        }

        // Update meta description
        if (description) {
            const descEl = document.querySelector('meta[name="description"]');
            if (descEl) {
                descEl.setAttribute('content', description);
            }
        }
    }, [title, description, path]);
}
