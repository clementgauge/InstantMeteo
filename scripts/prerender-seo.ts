import fs from 'fs';
import path from 'path';
import {
  SEO_PAGES_MAP,
  MAJOR_FRENCH_CITY_SEO_LIST,
  getSeoDataForPath,
  generatePageJsonLd,
  generateStaticHtmlContent,
  generateHreflangLinksHtml,
  generateSitemapIndexXml,
  generatePagesSitemapXml,
  generateDepartmentSitemapXml,
  getAvailableSitemapDepartmentCodes,
  buildLocalizedPath,
  buildLocalizedUrl,
  getPageOgImageUrl,
  localizeSkyMapHtml,
  UNIFIED_ROBOTS_DIRECTIVE,
} from '../src/seo/pagesSeoData';
import { getSiteBrandForLocale, SupportedLocaleCode } from '../src/i18n/siteTranslations';

const distDir = path.resolve(process.cwd(), 'dist');
const publicDir = path.resolve(process.cwd(), 'public');
const indexHtmlPath = path.join(distDir, 'index.html');

function escapeHtmlAttr(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function escapeHtmlText(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function transformHtmlForRoute(
  baseHtml: string,
  routePath: string,
  locale: SupportedLocaleCode
): string {
  const brand = getSiteBrandForLocale(locale);
  const seoData = getSeoDataForPath(routePath, locale);
  const safeTitle = escapeHtmlAttr(seoData.title);
  const safeDesc = escapeHtmlAttr(seoData.description);
  const canonicalUrl = buildLocalizedUrl(seoData.path, locale);
  const ogImageUrl = getPageOgImageUrl(seoData);
  const alternateOgLocale = locale === 'en' ? 'fr_FR' : 'en_US';

  let html = baseHtml;

  // 0. Attribut lang et dir sur <html>
  html = html.replace(/<html[^>]*>/i, `<html lang="${locale}" dir="${brand.dir}">`);

  // 1. Replace <title>
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtmlText(seoData.title)}</title>`);

  // 2. Replace meta title, description & application name
  html = html.replace(
    /<meta\s+name="title"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="title" content="${safeTitle}" />`
  );
  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="description" content="${safeDesc}" />`
  );
  html = html.replace(
    /<meta\s+name="application-name"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="application-name" content="${escapeHtmlAttr(brand.brandName)}" />`
  );
  html = html.replace(
    /<meta\s+name="apple-mobile-web-app-title"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="apple-mobile-web-app-title" content="${escapeHtmlAttr(brand.brandName)}" />`
  );

  // 3. Enforce unified meta robots & remove deprecated tags
  html = html.replace(
    /<meta\b[^>]*(?:keywords|googlebot|bingbot|publisher|language|geo\.region|geo\.placename|rating|tdm-reservation|carte-meteo-key)[^>]*\/?>\s*/gi,
    ''
  );
  html = html.replace(
    /<meta\s+name="robots"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="robots" content="${UNIFIED_ROBOTS_DIRECTIVE}" />`
  );

  // 4. Replace <link rel="canonical">
  html = html.replace(
    /<link\s+rel="canonical"[^>]*>/i,
    `<link rel="canonical" id="dynamic-canonical-link" href="${canonicalUrl}" />`
  );

  // 5. Replace hreflang links block (fr, en, x-default)
  const hreflangBlock = `<!--SEO_HREFLANG_START-->\n${generateHreflangLinksHtml(seoData.path)}\n    <!--SEO_HREFLANG_END-->`;
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
  html = html.replace(
    /<meta\s+property="og:site_name"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:site_name" content="${escapeHtmlAttr(brand.brandName)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:locale"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:locale" content="${brand.ogLocale}" />`
  );
  html = html.replace(
    /<meta\s+property="og:locale:alternate"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:locale:alternate" content="${alternateOgLocale}" />`
  );
  html = html.replace(
    /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:image" content="${ogImageUrl}" />`
  );
  html = html.replace(
    /<meta\s+property="og:image:alt"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:image:alt" content="${safeTitle}" />`
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
  html = html.replace(
    /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:image" content="${ogImageUrl}" />`
  );

  // 8. Replace JSON-LD Structured Data
  const jsonLdString = generatePageJsonLd(seoData, locale);
  html = html.replace(
    /<script\s+id="seo-page-jsonld"\s+type="application\/ld\+json">[\s\S]*?<\/script>/i,
    `<script id="seo-page-jsonld" type="application/ld+json">\n${jsonLdString}\n    </script>`
  );

  // 9. Inject unique semantic HTML content inside <!--SEO_ROOT_START-->...<!--SEO_ROOT_END-->
  const staticBodyHtml = generateStaticHtmlContent(seoData, locale);
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

  const baseRoutes = Array.from(
    new Set([
      ...Object.keys(SEO_PAGES_MAP),
      ...MAJOR_FRENCH_CITY_SEO_LIST.map((c) => c.path),
    ])
  );

  const locales: SupportedLocaleCode[] = ['fr', 'en'];
  let renderedCount = 0;

  for (const baseRoute of baseRoutes) {
    if (baseRoute === '/skymap') {
      const staleDir = path.join(distDir, 'skymap');
      if (fs.existsSync(staleDir)) fs.rmSync(staleDir, { recursive: true, force: true });
      const standalonePath = path.join(publicDir, 'skymap.html');
      if (fs.existsSync(standalonePath)) {
        const skymapRaw = fs.readFileSync(standalonePath, 'utf-8');
        fs.writeFileSync(path.join(distDir, 'skymap.html'), skymapRaw, 'utf-8');
        const enDir = path.join(distDir, 'en');
        fs.mkdirSync(enDir, { recursive: true });
        fs.writeFileSync(
          path.join(enDir, 'skymap.html'),
          localizeSkyMapHtml(skymapRaw, 'en'),
          'utf-8'
        );
      }
      console.log('[Prerender SEO] SkyMap autonome généré -> dist/skymap.html & dist/en/skymap.html');
      renderedCount += 2;
      continue;
    }

    for (const locale of locales) {
      const localizedRoute = buildLocalizedPath(baseRoute, locale);
      const routeHtml = transformHtmlForRoute(cleanTemplateHtml, localizedRoute, locale);

      if (localizedRoute === '/') {
        fs.writeFileSync(indexHtmlPath, routeHtml, 'utf-8');
      } else {
        const cleanRoute = localizedRoute.replace(/^\/+|\/+$/g, '');
        const routeDir = path.join(distDir, cleanRoute);
        fs.mkdirSync(routeDir, { recursive: true });
        fs.writeFileSync(path.join(routeDir, 'index.html'), routeHtml, 'utf-8');
        fs.writeFileSync(path.join(distDir, `${cleanRoute}.html`), routeHtml, 'utf-8');
      }
      renderedCount += 1;
    }
  }

  // Generate sitemap index & child sitemaps strictly inside dist/ (never mutate public/ during build!)
  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), generateSitemapIndexXml(), 'utf-8');
  fs.writeFileSync(path.join(distDir, 'sitemap-pages.xml'), generatePagesSitemapXml(), 'utf-8');

  const deptCodes = getAvailableSitemapDepartmentCodes();
  for (const code of deptCodes) {
    const deptXml = generateDepartmentSitemapXml(code);
    if (deptXml) {
      fs.writeFileSync(path.join(distDir, `sitemap-dept-${code}.xml`), deptXml, 'utf-8');
    }
  }

  console.log(
    `[Prerender SEO] ${renderedCount} FR/EN pages + sitemap index + ${deptCodes.length} department sitemaps written to dist/!`
  );
}

prerenderAllRoutes();
