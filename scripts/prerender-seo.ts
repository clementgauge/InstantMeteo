import fs from 'fs';
import path from 'path';
import {
  SEO_PAGES_MAP,
  getSeoDataForPath,
  generatePageJsonLd,
  generateStaticHtmlContent,
  generateHreflangLinksHtml,
  generateSitemapXml,
  UNIFIED_ROBOTS_DIRECTIVE,
} from '../src/seo/pagesSeoData';

const distDir = path.resolve(process.cwd(), 'dist');
const publicDir = path.resolve(process.cwd(), 'public');
const indexHtmlPath = path.join(distDir, 'index.html');

function escapeHtmlAttr(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function transformHtmlForRoute(baseHtml: string, routePath: string): string {
  const seoData = getSeoDataForPath(routePath);
  const safeTitle = escapeHtmlAttr(seoData.title);
  const safeDesc = escapeHtmlAttr(seoData.description);
  const canonicalUrl = seoData.canonicalUrl;

  let html = baseHtml;

  // 1. Replace <title>
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${seoData.title}</title>`);

  // 2. Replace meta title & description
  html = html.replace(
    /<meta\s+name="title"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="title" content="${safeTitle}" />`
  );
  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="description" content="${safeDesc}" />`
  );

  // 3. Enforce unified meta robots & remove deprecated tags
  html = html.replace(/<meta\s+name="keywords"[^>]*>\s*/gi, '');
  html = html.replace(/<meta\s+name="googlebot"[^>]*>\s*/gi, '');
  html = html.replace(/<meta\s+name="tdm-reservation"[^>]*>\s*/gi, '');
  html = html.replace(
    /<meta\s+name="robots"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="robots" content="${UNIFIED_ROBOTS_DIRECTIVE}" />`
  );

  // 4. Replace <link rel="canonical">
  html = html.replace(
    /<link\s+rel="canonical"[^>]*>/i,
    `<link rel="canonical" id="dynamic-canonical-link" href="${canonicalUrl}" />`
  );

  // 5. Replace hreflang links block
  const hreflangBlock = `<!--SEO_HREFLANG_START-->\n${generateHreflangLinksHtml(canonicalUrl)}\n    <!--SEO_HREFLANG_END-->`;
  if (html.includes('<!--SEO_HREFLANG_START-->') && html.includes('<!--SEO_HREFLANG_END-->')) {
    html = html.replace(
      /<!--SEO_HREFLANG_START-->[\s\S]*?<!--SEO_HREFLANG_END-->/,
      hreflangBlock
    );
  }

  // 6. Replace OpenGraph tags
  html = html.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:url" content="${canonicalUrl}" />`
  );
  html = html.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:title" content="${safeTitle}" />`
  );
  html = html.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:description" content="${safeDesc}" />`
  );

  // 7. Replace Twitter tags
  html = html.replace(
    /<meta\s+name="twitter:url"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:url" content="${canonicalUrl}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:title" content="${safeTitle}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:description" content="${safeDesc}" />`
  );

  // 8. Replace JSON-LD Structured Data
  const jsonLdString = generatePageJsonLd(seoData);
  html = html.replace(
    /<script\s+id="seo-page-jsonld"\s+type="application\/ld\+json">[\s\S]*?<\/script>/i,
    `<script id="seo-page-jsonld" type="application/ld+json">\n${jsonLdString}\n    </script>`
  );

  // 9. Inject unique semantic HTML content inside <!--SEO_ROOT_START-->...<!--SEO_ROOT_END-->
  const staticBodyHtml = generateStaticHtmlContent(seoData);
  const rootReplacement = `<!--SEO_ROOT_START--><div id="root">\n${staticBodyHtml}\n    </div><!--SEO_ROOT_END-->`;
  if (html.includes('<!--SEO_ROOT_START-->') && html.includes('<!--SEO_ROOT_END-->')) {
    html = html.replace(
      /<!--SEO_ROOT_START-->[\s\S]*?<!--SEO_ROOT_END-->/,
      rootReplacement
    );
  } else {
    html = html.replace(
      /<div id="root">[\s\S]*?<\/div>/i,
      rootReplacement
    );
  }

  return html;
}

function prerenderAllRoutes() {
  if (!fs.existsSync(indexHtmlPath)) {
    console.error('[Prerender SEO] dist/index.html not found. Run vite build first.');
    process.exit(1);
  }

  // Keep a pristine copy of the template before modifying dist/index.html
  const cleanTemplateHtml = fs.readFileSync(indexHtmlPath, 'utf-8');
  // Save a copy as _spa_template.html so the Cloudflare Worker can always access the clean shell
  fs.writeFileSync(path.join(distDir, '_spa_template.html'), cleanTemplateHtml, 'utf-8');

  const allRoutes = Object.keys(SEO_PAGES_MAP);

  for (const route of allRoutes) {
    const routeHtml = transformHtmlForRoute(cleanTemplateHtml, route);

    if (route === '/') {
      fs.writeFileSync(indexHtmlPath, routeHtml, 'utf-8');
      console.log(`[Prerender SEO] Generated / -> dist/index.html`);
    } else {
      const cleanRoute = route.replace(/^\/+|\/+$/g, '');
      const routeDir = path.join(distDir, cleanRoute);
      fs.mkdirSync(routeDir, { recursive: true });
      fs.writeFileSync(path.join(routeDir, 'index.html'), routeHtml, 'utf-8');
      fs.writeFileSync(path.join(distDir, `${cleanRoute}.html`), routeHtml, 'utf-8');
      console.log(
        `[Prerender SEO] Generated ${route} -> dist/${cleanRoute}/index.html & dist/${cleanRoute}.html`
      );
    }
  }

  // Generate clean sitemap.xml with hreflang annotations and without fixed lastmod
  const sitemapXml = generateSitemapXml();
  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapXml, 'utf-8');
  if (fs.existsSync(publicDir)) {
    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapXml, 'utf-8');
  }

  console.log(
    '[Prerender SEO] All 18 canonical routes and sitemap.xml (with hreflang) successfully prerendered!'
  );
}

prerenderAllRoutes();
