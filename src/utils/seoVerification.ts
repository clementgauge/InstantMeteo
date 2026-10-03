import {
  getSeoDataForPath,
  getPathForTabId,
  generatePageJsonLd,
  PageSeoMetadata,
  SUPPORTED_HREFLANG_LOCALES,
  UNIFIED_ROBOTS_DIRECTIVE,
} from '../seo/pagesSeoData';

export function initDynamicGoogleVerification(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  try {
    const ua = (navigator.userAgent || '').toLowerCase();
    const url = window.location.href;
    const isGoogle =
      ua.includes('google') ||
      ua.includes('googlebot') ||
      ua.includes('google-site-verification') ||
      ua.includes('google-inspectiontool') ||
      ua.includes('mediapartners-google') ||
      url.includes('google-site-verification');

    if (isGoogle) {
      const tokens = [
        atob('a0tZa0ZjQXhVLXFVQzRIU0J2NUo0SnZvSUlSZUh1dFc1ZDBxdVoxMC1oWQ=='),
        atob('dzBNYk5iVVY3SGRJa29sZ0pxMjRnLUw4Q0Z5eUJ6WXRKWElXT0xZQWFNM='),
      ];

      tokens.forEach((token) => {
        if (!document.querySelector(`meta[name="google-site-verification"][content="${token}"]`)) {
          const meta = document.createElement('meta');
          meta.name = 'google-site-verification';
          meta.content = token;
          document.head.appendChild(meta);
        }
      });
    }
  } catch {
    // Silencieux
  }
}

/**
 * Met à jour dynamiquement toutes les balises SEO dans le DOM client :
 * - document.title (naturel et propre à chaque page)
 * - link rel="canonical" (auto-référentiel vers l'URL de la page)
 * - link rel="alternate" hreflang (fr, fr-FR, fr-BE, fr-CH, fr-CA, en, de, es, it, etc. + x-default)
 * - meta description
 * - OpenGraph & Twitter Cards
 * - Script JSON-LD enrichi (FAQPage, WebPage, BreadcrumbList)
 */
export function updateDocumentSeo(pathOrTabId: string, syncHistory = true): PageSeoMetadata {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return getSeoDataForPath('/');
  }

  const currentWindowPath = typeof window !== 'undefined' ? window.location.pathname : '/';
  const targetPath = pathOrTabId.startsWith('/')
    ? pathOrTabId
    : getPathForTabId(pathOrTabId, currentWindowPath);
  const pageSeo = getSeoDataForPath(targetPath);

  try {
    // 1. Title
    document.title = pageSeo.title;

    // 2. Balise canonique auto-référentielle propre à l'URL de la page
    const cleanCanonical =
      pageSeo.path === '/'
        ? 'https://instantmeteo.instantmeteofr.workers.dev/'
        : pageSeo.canonicalUrl.replace(/\/+$/, '');
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      canonical.id = 'dynamic-canonical-link';
      document.head.appendChild(canonical);
    }
    canonical.href = cleanCanonical;

    // 2b. Synchronisation des balises hreflang (versions linguistiques signalées à Google)
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

    SUPPORTED_HREFLANG_LOCALES.forEach(({ hreflang, param }) => {
      setHreflangLink(hreflang, `${cleanCanonical}${param}`);
    });
    setHreflangLink('x-default', cleanCanonical);

    // 3. Meta Description
    let descMeta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!descMeta) {
      descMeta = document.createElement('meta');
      descMeta.name = 'description';
      document.head.appendChild(descMeta);
    }
    descMeta.content = pageSeo.description;

    // 4. OpenGraph Tags
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
    setOgTag('og:url', cleanCanonical);

    // 5. Twitter Card Tags
    const setTwitterTag = (name: string, content: string) => {
      let meta = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = name;
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    setTwitterTag('twitter:title', pageSeo.title);
    setTwitterTag('twitter:description', pageSeo.description);

    // 6. Schema.org JSON-LD dynamique
    let jsonLdScript = document.getElementById('seo-page-jsonld');
    if (!jsonLdScript) {
      jsonLdScript = document.createElement('script');
      jsonLdScript.id = 'seo-page-jsonld';
      jsonLdScript.setAttribute('type', 'application/ld+json');
      document.head.appendChild(jsonLdScript);
    }
    jsonLdScript.textContent = generatePageJsonLd(pageSeo);

    // 7. Règle commune meta robots sur toutes les pages
    document
      .querySelectorAll('meta[name="googlebot"], meta[name="tdm-reservation"]')
      .forEach((el) => el.remove());
    let robotsTag = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!robotsTag) {
      robotsTag = document.createElement('meta');
      robotsTag.name = 'robots';
      document.head.appendChild(robotsTag);
    }
    robotsTag.content = UNIFIED_ROBOTS_DIRECTIVE;

    // 8. Nettoyage d'anciennes balises inutiles
    document.querySelectorAll('meta[name="keywords"]').forEach((el) => el.remove());
    document
      .querySelectorAll('meta[name="meta-carte-meteo-key"], meta[name="carte-meteo-key"]')
      .forEach((el) => el.remove());

    // 9. Synchronisation URL dans la barre d'adresse
    if (syncHistory && typeof window.history !== 'undefined') {
      const currentPath = window.location.pathname;
      const canonicalPath =
        pageSeo.path === '/'
          ? '/'
          : pageSeo.path.endsWith('/')
            ? pageSeo.path.slice(0, -1)
            : pageSeo.path;
      if (currentPath !== canonicalPath && !(canonicalPath === '/direct' && currentPath === '/')) {
        window.history.pushState(
          { tabId: pageSeo.tabId, path: canonicalPath },
          '',
          `${canonicalPath}${window.location.search || ''}`
        );
      }
    }
  } catch (err) {
    console.error('Erreur mise à jour SEO DOM:', err);
  }

  return pageSeo;
}
