import fs from 'fs';
import path from 'path';
import { SEO_PAGES_MAP, generatePageJsonLd, generateStaticHtmlContent, PageSeoItem } from '../src/seo/pagesSeoData';

function escapeHtmlAttr(str: string): string {
  return str.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeHtmlText(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderHtmlForPage(templateHtml: string, pageSeo: PageSeoItem): string {
  let html = templateHtml;

  // 1. Title
  if (/<title>[^<]*<\/title>/i.test(html)) {
    html = html.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtmlText(pageSeo.title)}</title>`);
  } else {
    html = html.replace('</head>', `    <title>${escapeHtmlText(pageSeo.title)}</title>\n  </head>`);
  }

  // 2. Canonical self-referential URL (avec slash pour l'accueil, sans slash pour les sous-pages)
  const canonicalUrl = pageSeo.path === '/' 
    ? 'https://instantmeteo.instantmeteofr.workers.dev/' 
    : (pageSeo.canonicalUrl.replace(/\/+$/, '') || 'https://instantmeteo.instantmeteofr.workers.dev');
  if (/<link[^>]*rel=["']canonical["'][^>]*>/i.test(html)) {
    html = html.replace(/<link[^>]*rel=["']canonical["'][^>]*\/?>/i, `<link rel="canonical" href="${canonicalUrl}" />`);
  } else {
    html = html.replace('</head>', `    <link rel="canonical" href="${canonicalUrl}" />\n  </head>`);
  }

  // 3. Meta Description
  if (/<meta[^>]*name=["']description["'][^>]*>/i.test(html)) {
    html = html.replace(/<meta[^>]*name=["']description["'][^>]*content=["'][^"']*["'][^>]*\/?>/i, `<meta name="description" content="${escapeHtmlAttr(pageSeo.description)}" />`);
  } else {
    html = html.replace('</head>', `    <meta name="description" content="${escapeHtmlAttr(pageSeo.description)}" />\n  </head>`);
  }

  // 4. OpenGraph Tags
  html = html.replace(/<meta[^>]*property=["']og:title["'][^>]*content=["'][^"']*["'][^>]*\/?>/i, `<meta property="og:title" content="${escapeHtmlAttr(pageSeo.title)}" />`);
  html = html.replace(/<meta[^>]*property=["']og:description["'][^>]*content=["'][^"']*["'][^>]*\/?>/i, `<meta property="og:description" content="${escapeHtmlAttr(pageSeo.description)}" />`);
  html = html.replace(/<meta[^>]*property=["']og:url["'][^>]*content=["'][^"']*["'][^>]*\/?>/i, `<meta property="og:url" content="${canonicalUrl}" />`);

  // 5. Règle commune meta robots : index, follow, sans noai, noimageai ni tdm-reservation
  html = html.replace(/<meta[^>]*name=["']googlebot["'][^>]*\/?>/gi, '');
  html = html.replace(/<meta[^>]*name=["']tdm-reservation["'][^>]*\/?>/gi, '');
  if (/<meta[^>]*name=["']robots["'][^>]*>/i.test(html)) {
    html = html.replace(/<meta[^>]*name=["']robots["'][^>]*\/?>/gi, `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />`);
  } else {
    html = html.replace('</head>', `    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />\n  </head>`);
  }

  // 5b. Suppression des meta keywords
  html = html.replace(/<meta[^>]*name=["']keywords["'][^>]*\/?>/gi, '');

  // 5c. Suppression des balises de clé
  html = html.replace(/<meta[^>]*name=["'](meta-)?carte-meteo-key["'][^>]*\/?>/gi, '');
  html = html.replace(/<meta[^>]*content=["'][^"']*instant-meteo-map-key[^"']*["'][^>]*\/?>/gi, '');

  // 6. Twitter Card Tags
  html = html.replace(/<meta[^>]*name=["']twitter:title["'][^>]*content=["'][^"']*["'][^>]*\/?>/gi, `<meta name="twitter:title" content="${escapeHtmlAttr(pageSeo.title)}" />`);
  html = html.replace(/<meta[^>]*name=["']twitter:description["'][^>]*content=["'][^"']*["'][^>]*\/?>/gi, `<meta name="twitter:description" content="${escapeHtmlAttr(pageSeo.description)}" />`);

  // 7. Schema.org JSON-LD
  const jsonLd = generatePageJsonLd(pageSeo);
  const jsonLdTag = `\n    <!-- Schema.org JSON-LD Pre-rendered (${pageSeo.slug}) -->\n    <script type="application/ld+json" id="seo-page-jsonld">\n${jsonLd}\n    </script>`;
  if (/<script[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/i.test(html)) {
    html = html.replace(/<script[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, jsonLdTag);
  } else {
    html = html.replace('</head>', `${jsonLdTag}\n  </head>`);
  }

  // 8. Static fallback content for search crawlers (greedy replacement of #root)
  const staticContent = generateStaticHtmlContent(pageSeo);
  const rootReplacement = `<div id="root">\n${staticContent}\n    </div>`;

  if (/<div id="root">[\s\S]*<\/div>(?=\s*(?:<script|<\/body>))/i.test(html)) {
    html = html.replace(/<div id="root">[\s\S]*<\/div>(?=\s*(?:<script|<\/body>))/i, rootReplacement);
  } else if (html.includes('<div id="root">')) {
    html = html.replace(/<div id="root">[\s\S]*?<\/div>/i, rootReplacement);
  }

  return html;
}

function prerenderSeoPages() {
  const distDir = path.join(process.cwd(), 'dist');
  const templatePath = path.join(distDir, 'index.html');

  if (!fs.existsSync(templatePath)) {
    console.error('[Prerender SEO] Error: dist/index.html not found. Run vite build first.');
    return;
  }

  const baseHtml = fs.readFileSync(templatePath, 'utf-8');
  console.log(`[Prerender SEO] Generating static HTML pages with unique canonical URLs for ${Object.keys(SEO_PAGES_MAP).length} routes...`);

  for (const [routePath, pageSeo] of Object.entries(SEO_PAGES_MAP)) {
    const rendered = renderHtmlForPage(baseHtml, pageSeo);

    if (routePath === '/') {
      // Root index.html
      fs.writeFileSync(templatePath, rendered, 'utf-8');
      console.log(`  ✓ Prerendered / -> dist/index.html (canonical: ${pageSeo.canonicalUrl})`);
    } else {
      const cleanPath = routePath.replace(/^\//, '');
      const targetDir = path.join(distDir, cleanPath);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      const targetFilePath = path.join(targetDir, 'index.html');
      fs.writeFileSync(targetFilePath, rendered, 'utf-8');
      fs.writeFileSync(path.join(distDir, `${cleanPath}.html`), rendered, 'utf-8');
      console.log(`  ✓ Prerendered ${routePath} -> dist/${cleanPath}/index.html & dist/${cleanPath}.html (canonical: ${pageSeo.canonicalUrl})`);
    }
  }

  // Generate clean sitemap.xml in dist/ without fixed lastmod
  const sitemapUrls = Object.values(SEO_PAGES_MAP)
    .map((p) => {
      const loc = p.path === '/'
        ? 'https://instantmeteo.instantmeteofr.workers.dev/'
        : p.canonicalUrl.replace(/\/+$/, '');
      return `  <url>\n    <loc>${loc}</loc>\n  </url>`;
    })
    .join('\n');
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls}\n</urlset>\n`;
  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapXml, 'utf-8');

  console.log('[Prerender SEO] All pages and sitemap.xml successfully prerendered with verified canonical URLs!');
}

prerenderSeoPages();
