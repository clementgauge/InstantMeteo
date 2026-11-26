import {
  getSeoDataForPath,
  getPathForTabId,
  generatePageJsonLd,
  getLocalitySeoData,
  getMajorCityPathForStationId,
  buildLocalizedPath,
  buildLocalizedUrl,
  getPageOgImageUrl,
  PageSeoMetadata,
  SUPPORTED_HREFLANG_LOCALES,
  UNIFIED_ROBOTS_DIRECTIVE,
} from '../seo/pagesSeoData';
import { getActiveSiteLocale, getSiteBrandForLocale } from '../i18n/siteTranslations';
import { LocationPoint } from '../types/weather';

function syncHeadTagsForPage(
  pageSeo: PageSeoMetadata,
  activeLocale: 'fr' | 'en',
  robotsDirective: string
): void {
  const brand = getSiteBrandForLocale(activeLocale);
  const localizedCanonical = buildLocalizedUrl(pageSeo.path, activeLocale);
  const ogImageUrl = getPageOgImageUrl(pageSeo);
  const alternateOgLocale = activeLocale === 'en' ? 'fr_FR' : 'en_US';

  // 1. Title & html lang
  document.title = pageSeo.title;
  if (document.documentElement) {
    document.documentElement.lang = activeLocale;
  }

  // 2. Canonical link
  let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    canonical.id = 'dynamic-canonical-link';
    document.head.appendChild(canonical);
  }
  canonical.href = localizedCanonical;

  // 3. Hreflang links (strictly fr, en, x-default)
  const expectedHreflangs = new Set(['fr', 'en', 'x-default']);
  document.querySelectorAll<HTMLLinkElement>('link[rel="alternate"][hreflang]').forEach((el) => {
    const hl = el.getAttribute('hreflang') || '';
    if (!expectedHreflangs.has(hl)) {
      el.remove();
    }
  });

  const setHreflangLink = (hreflang: string, href: string) => {
    let link = document.querySelector<HTMLLinkElement>(
      `link[rel="alternate"][hreflang="${hreflang}"]`
    );
    if (!link) {
      link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = hreflang;
      document.head.appendChild(link);
    }
    link.href = href;
  };

  SUPPORTED_HREFLANG_LOCALES.forEach(({ hreflang, locale }) => {
    setHreflangLink(hreflang, buildLocalizedUrl(pageSeo.path, locale));
  });
  setHreflangLink('x-default', buildLocalizedUrl(pageSeo.path, 'fr'));

  // 4. Meta Description, Title, Application Name
  const setMetaByName = (name: string, content: string) => {
    let meta = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = name;
      document.head.appendChild(meta);
    }
    meta.content = content;
  };

  setMetaByName('description', pageSeo.description);
  setMetaByName('title', pageSeo.title);
  setMetaByName('application-name', brand.brandName);
  setMetaByName('apple-mobile-web-app-title', brand.brandName);

  // 5. OpenGraph Tags
  const setOgTag = (property: string, content: string) => {
    let meta = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('property', property);
      document.head.appendChild(meta);
    }
    meta.content = content;
  };

  setOgTag('og:title', pageSeo.title);
  setOgTag('og:description', pageSeo.description);
  setOgTag('og:url', localizedCanonical);
  setOgTag('og:site_name', brand.brandName);
  setOgTag('og:locale', brand.ogLocale);
  setOgTag('og:locale:alternate', alternateOgLocale);
  setOgTag('og:image', ogImageUrl);
  setOgTag('og:image:alt', pageSeo.title);

  // 6. Twitter Cards
  setMetaByName('twitter:title', pageSeo.title);
  setMetaByName('twitter:description', pageSeo.description);
  setMetaByName('twitter:url', localizedCanonical);
  setMetaByName('twitter:image', ogImageUrl);

  // 7. Schema.org JSON-LD
  let jsonLdScript = document.getElementById('seo-page-jsonld');
  if (!jsonLdScript) {
    jsonLdScript = document.createElement('script');
    jsonLdScript.id = 'seo-page-jsonld';
    jsonLdScript.setAttribute('type', 'application/ld+json');
    document.head.appendChild(jsonLdScript);
  }
  jsonLdScript.textContent = generatePageJsonLd(pageSeo, activeLocale);

  // 8. Robots & cleanup deprecated meta tags
  document
    .querySelectorAll(
      'meta[name="googlebot"], meta[name="bingbot"], meta[name="publisher"], meta[name="language"], meta[name="geo.region"], meta[name="geo.placename"], meta[name="rating"], meta[name="tdm-reservation"], meta[name="keywords"], meta[name="meta-carte-meteo-key"], meta[name="carte-meteo-key"]'
    )
    .forEach((el) => el.remove());

  setMetaByName('robots', robotsDirective);
}

/**
 * Met à jour dynamiquement toutes les balises SEO dans le DOM client :
 * - document.title (naturel et propre à chaque page)
 * - link rel="canonical" (auto-référentiel vers l'URL FR ou /en/... de la page)
 * - link rel="alternate" hreflang (fr, en, x-default)
 * - meta description, OpenGraph, Twitter Cards & Schema.org JSON-LD
 */
export function updateDocumentSeo(pathOrTabId: string, syncHistory = true): PageSeoMetadata {
  const activeLocale = getActiveSiteLocale();
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return getSeoDataForPath('/', activeLocale);
  }

  const currentWindowPath = window.location.pathname || '/';
  const targetPath = pathOrTabId.startsWith('/')
    ? pathOrTabId
    : getPathForTabId(pathOrTabId, currentWindowPath);
  const pageSeo = getSeoDataForPath(targetPath, activeLocale);

  try {
    syncHeadTagsForPage(pageSeo, activeLocale, UNIFIED_ROBOTS_DIRECTIVE);

    if (syncHistory && typeof window.history !== 'undefined') {
      const currentPath = window.location.pathname;
      const localizedPath = buildLocalizedPath(pageSeo.path, activeLocale);
      if (
        currentPath !== localizedPath &&
        !(pageSeo.path === '/direct' && (currentPath === '/' || currentPath === '/en'))
      ) {
        window.history.pushState(
          { tabId: pageSeo.tabId, path: localizedPath },
          '',
          `${localizedPath}${window.location.search || ''}`
        );
      }
    }
  } catch (err) {
    console.error('Erreur mise à jour SEO DOM:', err);
  }

  return pageSeo;
}

/**
 * Met à jour dynamiquement toutes les balises SEO (title, description, OpenGraph, JSON-LD)
 * dès qu'une commune ou station est sélectionnée par l'utilisateur ou chargée depuis l'URL.
 */
export function updateDocumentSeoForStation(
  station: LocationPoint,
  syncHistory = false
): PageSeoMetadata {
  const activeLocale = getActiveSiteLocale();
  const pageSeo = getLocalitySeoData(station, activeLocale);

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return pageSeo;
  }

  try {
    syncHeadTagsForPage(pageSeo, activeLocale, UNIFIED_ROBOTS_DIRECTIVE);

    if (syncHistory && typeof window.history !== 'undefined') {
      const matchedCatalogPath = getMajorCityPathForStationId(station.id, station.name);
      if (matchedCatalogPath) {
        const localizedPath = buildLocalizedPath(matchedCatalogPath, activeLocale);
        if (window.location.pathname !== localizedPath) {
          window.history.replaceState(
            { stationId: station.id, path: localizedPath },
            '',
            `${localizedPath}${window.location.search || ''}`
          );
        }
      }
    }
  } catch (err) {
    console.error('Erreur mise à jour SEO station DOM:', err);
  }

  return pageSeo;
}

/**
 * Applique les métadonnées 404 (noindex, nofollow) côté client pour toute URL inexistante.
 */
export function setNotFoundSeo(rawPathname: string): void {
  const activeLocale = getActiveSiteLocale();
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  try {
    const isEn = activeLocale === 'en';
    const title = isEn
      ? '404 — Page Not Found | Instant Weather'
      : '404 — Page introuvable | Instant Météo';
    const description = isEn
      ? `The URL ${rawPathname} does not correspond to any page or municipality on Instant Weather.`
      : `L’adresse ${rawPathname} ne correspond à aucune rubrique ou commune sur Instant Météo.`;

    document.title = title;
    if (document.documentElement) {
      document.documentElement.lang = activeLocale;
    }

    let robotsTag = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!robotsTag) {
      robotsTag = document.createElement('meta');
      robotsTag.name = 'robots';
      document.head.appendChild(robotsTag);
    }
    robotsTag.content = 'noindex, nofollow';

    const descTag = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (descTag) {
      descTag.content = description;
    }
    const titleTag = document.querySelector<HTMLMetaElement>('meta[name="title"]');
    if (titleTag) {
      titleTag.content = title;
    }

    document.querySelectorAll('link[rel="canonical"]').forEach((el) => el.remove());
    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach((el) => el.remove());
    const jsonLd = document.getElementById('seo-page-jsonld');
    if (jsonLd) jsonLd.textContent = '';
  } catch {
    // ignore
  }
}
