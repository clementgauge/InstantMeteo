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

  // 2. Canonical self-referential URL
  if (/<link[^>]*rel=["']canonical["'][^>]*>/i.test(html)) {
    html = html.replace(/<link[^>]*rel=["']canonical["'][^>]*\/?>/i, `<link rel="canonical" href="${pageSeo.canonicalUrl}" />`);
  } else {
    html = html.replace('</head>', `    <link rel="canonical" href="${pageSeo.canonicalUrl}" />\n  </head>`);
  }

  // 3. Meta Description
  if (/<meta[^>]*name=["']description["'][^>]*>/i.test(html)) {
    html = html.replace(/<meta[^>]*name=["']description["'][^>]*content=["'][^"']*["'][^>]*\/?>/i, `<meta name="description" content="${escapeHtmlAttr(pageSeo.description)}" />`);
  } else {
    html = html.replace('</head>', `    <meta name="description" content="${escapeHtmlAttr(pageSeo.description)}" />\n  </head>`);
  }

  // 4. Keywords
  if (/<meta[^>]*name=["']keywords["'][^>]*>/i.test(html)) {
    html = html.replace(/<meta[^>]*name=["']keywords["'][^>]*content=["'][^"']*["'][^>]*\/?>/i, `<meta name="keywords" content="${escapeHtmlAttr(pageSeo.keywords)}" />`);
  }

  // 5. OpenGraph Tags
  html = html.replace(/<meta[^>]*property=["']og:title["'][^>]*content=["'][^"']*["'][^>]*\/?>/i, `<meta property="og:title" content="${escapeHtmlAttr(pageSeo.title)}" />`);
  html = html.replace(/<meta[^>]*property=["']og:description["'][^>]*content=["'][^"']*["'][^>]*\/?>/i, `<meta property="og:description" content="${escapeHtmlAttr(pageSeo.description)}" />`);
  html = html.replace(/<meta[^>]*property=["']og:url["'][^>]*content=["'][^"']*["'][^>]*\/?>/i, `<meta property="og:url" content="${pageSeo.canonicalUrl}" />`);

  // 6. Twitter Card Tags
  html = html.replace(/<meta[^>]*name=["']twitter:title["'][^>]*content=["'][^"']*["'][^>]*\/?>/i, `<meta name="twitter:title" content="${escapeHtmlAttr(pageSeo.title)}" />`);
  html = html.replace(/<meta[^>]*name=["']twitter:description["'][^>]*content=["'][^"']*["'][^>]*\/?>/i, `<meta name="twitter:description" content="${escapeHtmlAttr(pageSeo.description)}" />`);

  // 7. Schema.org JSON-LD
  const jsonLd = generatePageJsonLd(pageSeo);
  const jsonLdTag = `\n    <!-- Schema.org JSON-LD Pre-rendered (${pageSeo.slug}) -->\n    <script type="application/ld+json" id="seo-page-jsonld">\n${jsonLd}\n    </script>`;
  if (/<script[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/i.test(html)) {
    html = html.replace(/<script[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/i, jsonLdTag);
  } else {
    html = html.replace('</head>', `${jsonLdTag}\n  </head>`);
  }

  // 8. Static fallback content for search crawlers
  const staticContent = generateStaticHtmlContent(pageSeo);
  const rootReplacement = `<div id="root">\n      <noscript>\n${staticContent}\n      </noscript>\n      <div id="seo-crawler-content" style="position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: normal; border: 0;">\n${staticContent}\n      </div>\n    </div>`;

  if (html.includes('<div id="root">')) {
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

  console.log('[Prerender SEO] All pages successfully prerendered with verified canonical URLs!');
}

prerenderSeoPages();
