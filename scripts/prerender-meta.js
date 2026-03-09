/**
 * prerender-meta.js
 *
 * Post-build script that takes the generated dist/index.html and creates
 * route-specific copies with correct SEO metadata injected into them.
 *
 * This works because nginx.conf uses `try_files $uri $uri/ /index.html`,
 * so a file at dist/blog/crossover-point/index.html will be served directly
 * by nginx when Googlebot requests /blog/crossover-point.
 *
 * Usage: run automatically via `npm run build` (see package.json postbuild script)
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
 * Inject route-specific SEO tags into an HTML string by replacing
 * the placeholder tags that exist in the root index.html.
 */
function injectMeta(html, { path: routePath, title, description, image }) {
    const canonicalUrl = `${BASE_URL}${routePath}`;

    // Replace <title>
    html = html.replace(
        /<title>[^<]*<\/title>/,
        `<title>${title}</title>`
    );

    // Replace <meta name="description">
    html = html.replace(
        /<meta name="description"[^>]*>/,
        `<meta name="description" content="${description}" />`
    );

    // Replace canonical
    html = html.replace(
        /<link rel="canonical"[^>]*>/,
        `<link rel="canonical" href="${canonicalUrl}" />`
    );

    // Replace OG tags
    html = html.replace(/<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${canonicalUrl}" />`);
    html = html.replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${title}" />`);
    html = html.replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${description}" />`);
    html = html.replace(/<meta property="og:image"[^>]*>/, `<meta property="og:image" content="${image}" />`);

    // Replace Twitter tags
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

    const template = fs.readFileSync(templatePath, 'utf-8');
    let count = 0;

    // 1. Inject into root index.html (homepage)
    const homeRoute = STATIC_ROUTES.find(r => r.path === '/');
    const homeHtml = injectMeta(template, homeRoute);
    fs.writeFileSync(templatePath, homeHtml, 'utf-8');
    console.log(`✅  / → dist/index.html`);
    count++;

    // 2. Static routes (calculator, blog listing)
    for (const route of STATIC_ROUTES.filter(r => r.path !== '/')) {
        const html = injectMeta(template, route);
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

        const html = injectMeta(template, route);
        const outputPath = path.join(DIST_DIR, 'blog', post.slug, 'index.html');
        writeHtml(outputPath, html);
        console.log(`✅  ${routePath} → dist/blog/${post.slug}/index.html`);
        count++;
    }

    console.log(`\n🎉 Pre-rendering complete: ${count} pages generated with unique SEO tags.`);
}

run();
