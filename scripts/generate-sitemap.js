import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { blogPosts } from '../src/content/blogData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://buybackhtb.com';

const generateSitemap = () => {
    const sitemapPath = path.resolve(__dirname, '../public/sitemap.xml');

    const urls = [
        `  <url>\n    <loc>${BASE_URL}/</loc>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>`,
        `  <url>\n    <loc>${BASE_URL}/calculator</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>`,
        `  <url>\n    <loc>${BASE_URL}/blog</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`
    ];

    blogPosts.forEach(post => {
        urls.push(
            `  <url>\n    <loc>${BASE_URL}/blog/${post.slug}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>`
        );
    });

    const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`;

    fs.writeFileSync(sitemapPath, sitemapContent);
    console.log('✅ Sitemap successfully generated with all blog posts.');
};

generateSitemap();
