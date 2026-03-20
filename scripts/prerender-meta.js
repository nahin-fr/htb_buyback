/**
 * prerender-meta.js
 *
 * Post-build script that takes the generated dist/index.html and creates
 * route-specific copies with correct SEO metadata injected into them.
 *
 * Also fixes LCP/FCP performance issues by:
 *  1. Moving the JS <script> bundle from <head> to end of <body> so it
 *     doesn't block HTML parsing / first paint.
 *  2. Adding <link rel="preload" as="image"> for the route's hero image
 *     so the browser starts fetching it before parsing the body.
 *  3. For blog post routes, injecting the article H1 + banner image
 *     directly into the static HTML body, so the LCP element paints
 *     immediately without waiting for React to hydrate.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { blogPosts } from '../src/content/blogData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://buybackhtb.com';
const DIST_DIR = path.resolve(__dirname, '../dist');

/**
 * Routes with static metadata
 */
const STATIC_ROUTES = [
    {
        path: '/',
        title: 'Help to Buy Remortgage Calculator | BuyBack HTB',
        description: 'Calculate when to remortgage or buy back your Help to Buy equity loan. See your interest after 5 years and compare repayment options with our free tool.',
        image: `${BASE_URL}/help_to_buy_banner.webp`,
    },
    {
        path: '/calculator',
        title: 'HTB Equity Loan Repayment Calculator | BuyBack HTB',
        description: 'Use our free calculator to model your Help to Buy equity loan costs, compare remortgage scenarios, and pinpoint your exact crossover point.',
        image: `${BASE_URL}/help_to_buy_banner.webp`,
    },
    {
        path: '/blog',
        title: 'Help to Buy Guides & Mortgage Insights | BuyBack HTB',
        description: 'Expert guides on Help to Buy staircasing, redemption, RICS valuations, and remortgage strategies for UK homeowners.',
        image: `${BASE_URL}/help_to_buy_banner.webp`,
    },
];

/**
 * Move the <script type="module"> tag from <head> to end of <body>.
 * Vite injects the entry script into <head> which blocks first paint.
 * Moving it to the end of <body> means HTML/CSS renders first.
 */
function moveScriptToBody(html) {
    const scriptMatch = html.match(/<script type="module" crossorigin src="[^"]+"><\/script>/);
    if (!scriptMatch) return html;
    const scriptTag = scriptMatch[0];
    html = html.replace(scriptTag, '');
    html = html.replace('</body>', `  ${scriptTag}\n</body>`);
    return html;
}

/**
 * Add a <link rel="preload" as="image"> for the route's hero image.
 */
function addImagePreload(html, imageUrl) {
    const imagePath = imageUrl.startsWith(BASE_URL)
        ? imageUrl.slice(BASE_URL.length)
        : imageUrl;
    const preloadTag = `<link rel="preload" href="${imagePath}" as="image" fetchpriority="high">`;
    html = html.replace(
        '<link rel="preload" href="/logo_dark.webp" as="image" fetchpriority="high">',
        `<link rel="preload" href="/logo_dark.webp" as="image" fetchpriority="high">\n  ${preloadTag}`
    );
    return html;
}

/**
 * Convert a human-readable date like "February 5, 2026" to ISO 8601 "2026-02-05".
 */
function toIsoDate(dateStr) {
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toISOString().split('T')[0];
}

/**
 * Inject a JSON-LD BlogPosting schema into the <head> of the page.
 * This helps Google understand the page type, author, and publish date,
 * which is a strong indexing signal for article content.
 */
function injectBlogSchema(html, post, canonicalUrl, imageUrl) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt,
        image: imageUrl,
        url: canonicalUrl,
        datePublished: toIsoDate(post.date),
        dateModified: toIsoDate(post.date),
        author: {
            '@type': 'Person',
            name: post.author,
        },
        publisher: {
            '@type': 'Organization',
            name: 'BuyBack HTB',
            url: BASE_URL,
            logo: {
                '@type': 'ImageObject',
                url: `${BASE_URL}/logo_dark.webp`,
            },
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': canonicalUrl,
        },
    };

    const schemaTag = `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`;
    return html.replace('</head>', `  ${schemaTag}\n</head>`);
}

/**
 * For blog post pages, replace the generic app shell content with the real
 * post content — H1, banner image, AND the full article body. This ensures
 * Googlebot sees all text in the initial HTML without needing to execute JS.
 */
function injectBlogShell(html, post) {
    const blogContentStyles = `
  <style>
    .blog-body { color: #cbd5e1; font-size: 1.0625rem; line-height: 1.8; }
    .blog-body h2 { font-size: 1.625rem; font-weight: 700; color: #f1f5f9; margin: 2.5rem 0 1rem; line-height: 1.3; }
    .blog-body h3 { font-size: 1.25rem; font-weight: 600; color: #e2e8f0; margin: 2rem 0 0.75rem; }
    .blog-body p { margin: 0 0 1.25rem; }
    .blog-body ul, .blog-body ol { margin: 0 0 1.25rem 1.5rem; }
    .blog-body li { margin-bottom: 0.5rem; }
    .blog-body strong { color: #f1f5f9; font-weight: 600; }
    .blog-body a { color: #60a5fa; text-decoration: underline; }
    .blog-body .info-box { background: rgba(96,165,250,0.08); border: 1px solid rgba(96,165,250,0.25); border-radius: 12px; padding: 1.25rem 1.5rem; margin: 1.75rem 0; }
    .blog-body .info-box h4 { color: #93c5fd; font-size: 0.875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 0.5rem; }
    .blog-body .info-box p { margin: 0; color: #bfdbfe; }
    .blog-body table { width: 100%; border-collapse: collapse; margin: 1.75rem 0; font-size: 0.9375rem; }
    .blog-body th { background: rgba(255,255,255,0.06); color: #e2e8f0; font-weight: 600; padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .blog-body td { padding: 0.75rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.06); }
  </style>`;

    const blogShell = `<div style="padding-top:100px;padding-bottom:64px;font-family:'Inter',sans-serif;max-width:900px;margin:0 auto;padding-left:24px;padding-right:24px;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:32px;">
          <img src="/logo_dark.webp" alt="BuyBack HTB" style="height:32px;width:32px;border-radius:4px;object-fit:contain;" />
          <span style="font-size:1.25rem;font-weight:700;color:white;">BuyBack HTB</span>
        </div>
        <h1 style="font-size:clamp(2rem,5vw,3.5rem);line-height:1.15;margin-bottom:24px;font-weight:800;color:white;letter-spacing:-0.02em;">${post.title}</h1>
        <img src="${post.image}" alt="${post.title}" width="900" height="500" fetchpriority="high"
          style="width:100%;height:auto;border-radius:16px;display:block;margin-bottom:40px;" />
        <div class="blog-body">${post.content}</div>
      </div>`;

    // Inject blog content CSS into <head>
    html = html.replace('</head>', `${blogContentStyles}\n</head>`);

    // Replace the inner app shell content (everything inside #root's wrapper div)
    html = html.replace(
        /(<div id="root">)\s*<!-- Rich App Shell -->[\s\S]*?(<\/div>\s*<\/div>)\s*(<\/div>)\s*(<script)/,
        `$1\n    ${blogShell}\n  $3\n  $4`
    );

    return html;
}

/**
 * Inject route-specific SEO tags into an HTML string.
 */
function injectMeta(html, { path: routePath, title, description, image }) {
    const canonicalUrl = `${BASE_URL}${routePath}`;

    html = html.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);
    html = html.replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${description}" />`);
    html = html.replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${canonicalUrl}" />`);

    html = html.replace(/<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${canonicalUrl}" />`);
    html = html.replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${title}" />`);
    html = html.replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${description}" />`);
    html = html.replace(/<meta property="og:image"[^>]*>/, `<meta property="og:image" content="${image}" />`);

    html = html.replace(/<meta name="twitter:url"[^>]*>/, `<meta name="twitter:url" content="${canonicalUrl}" />`);
    html = html.replace(/<meta name="twitter:title"[^>]*>/, `<meta name="twitter:title" content="${title}" />`);
    html = html.replace(/<meta name="twitter:description"[^>]*>/, `<meta name="twitter:description" content="${description}" />`);
    html = html.replace(/<meta name="twitter:image"[^>]*>/, `<meta name="twitter:image" content="${image}" />`);

    return html;
}

/**
 * Write an HTML file to a given output path, creating parent dirs as needed.
 */
function writeHtml(outputPath, html) {
    const dir = path.dirname(outputPath);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(outputPath, html, 'utf-8');
}

function run() {
    const templatePath = path.join(DIST_DIR, 'index.html');

    if (!fs.existsSync(templatePath)) {
        console.error('❌ dist/index.html not found. Run `vite build` first.');
        process.exit(1);
    }

    // Apply global performance fix (script to body) on the template once
    let template = fs.readFileSync(templatePath, 'utf-8');
    template = moveScriptToBody(template);

    let count = 0;

    // 1. Homepage
    const homeRoute = STATIC_ROUTES.find(r => r.path === '/');
    let homeHtml = injectMeta(template, homeRoute);
    homeHtml = addImagePreload(homeHtml, homeRoute.image);
    fs.writeFileSync(templatePath, homeHtml, 'utf-8');
    console.log(`✅  / → dist/index.html`);
    count++;

    // 2. Static routes (calculator, blog listing)
    for (const route of STATIC_ROUTES.filter(r => r.path !== '/')) {
        let html = injectMeta(template, route);
        html = addImagePreload(html, route.image);
        const outputPath = path.join(DIST_DIR, route.path, 'index.html');
        writeHtml(outputPath, html);
        console.log(`✅  ${route.path} → dist${route.path}/index.html`);
        count++;
    }

    // 3. Dynamic blog post routes
    for (const post of blogPosts) {
        const routePath = `/blog/${post.slug}`;
        const imageUrl = `${BASE_URL}${post.image}`;

        const route = {
            path: routePath,
            title: `${post.title} | BuyBack HTB`,
            description: post.excerpt,
            image: imageUrl,
        };

        let html = injectMeta(template, route);
        html = html.replace(/<meta property="og:type"[^>]*>/, `<meta property="og:type" content="article" />`);
        html = addImagePreload(html, imageUrl);
        html = injectBlogSchema(html, post, `${BASE_URL}${routePath}`, imageUrl);
        html = injectBlogShell(html, post);

        const outputPath = path.join(DIST_DIR, 'blog', post.slug, 'index.html');
        writeHtml(outputPath, html);
        console.log(`✅  ${routePath} → dist/blog/${post.slug}/index.html`);
        count++;
    }

    console.log(`\n🎉 Pre-rendering complete: ${count} pages generated with unique SEO tags and LCP optimisations.`);
}

run();
