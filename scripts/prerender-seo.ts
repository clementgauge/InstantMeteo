import fs from 'fs';
import path from 'path';
import {
  SEO_PAGES_MAP,
  MAJOR_FRENCH_CITY_SEO_LIST,
  applyPageSeoToHtml,
  generateSitemapIndexXml,
  generatePagesSitemapXml,
  generateDepartmentSitemapXml,
  getAvailableSitemapDepartmentCodes,
  buildLocalizedPath,
  localizeSkyMapHtml,
} from '../src/seo/pagesSeoData';
import { SupportedLocaleCode } from '../src/i18n/siteTranslations';

const distDir = path.resolve(process.cwd(), 'dist');
const publicDir = path.resolve(process.cwd(), 'public');
const indexHtmlPath = path.join(distDir, 'index.html');

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
      const routeHtml = applyPageSeoToHtml(cleanTemplateHtml, localizedRoute, locale);

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
