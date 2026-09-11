const fs = require('fs');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://auracommunityact.github.io/Auracommunityact/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://auracommunityact.github.io/Auracommunityact/#/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://auracommunityact.github.io/Auracommunityact/#/projects</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://auracommunityact.github.io/Auracommunityact/#/services</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://auracommunityact.github.io/Auracommunityact/#/community</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://auracommunityact.github.io/Auracommunityact/#/founder</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://auracommunityact.github.io/Auracommunityact/#/contact</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://auracommunityact.github.io/Auracommunityact/#/join-community</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://auracommunityact.github.io/Auracommunityact/#/guidelines</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://auracommunityact.github.io/Auracommunityact/#/privacy</loc>
    <changefreq>yearly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://auracommunityact.github.io/Auracommunityact/#/terms</loc>
    <changefreq>yearly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>`;

// Write as raw utf-8, no BOM
fs.writeFileSync('public/sitemap.xml', sitemap, { encoding: 'utf8' });
console.log('sitemap.xml generated successfully.');
