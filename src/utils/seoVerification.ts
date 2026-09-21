import { getSeoDataForPath, getPathForTabId, generatePageJsonLd, PageSeoItem } from '../seo/pagesSeoData';

/**
 * Vérification SEO Google dynamique et sécurisée
 * Les codes de vérification ne sont pas visibles en clair dans le code source HTML classique
 * pour les visiteurs ordinaires, mais sont injectés dynamiquement pour les robots de Google.
 */

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
      // Clés chiffrées en Base64 pour ne pas apparaître en texte brut
      const tokens = [
        atob('a0tZa0ZjQXhVLXFVQzRIU0J2NUo0SnZvSUlSZUh1dFc1ZDBxdVoxMC1oWQ=='),
        atob('dzBNYk5iVVY3SGRJa29sZ0pxMjRnLUw4Q0Z5eUJ6WXRKWElXT0xZQWFNM=')
      ];

      tokens.forEach(token => {
        if (!document.querySelector(`meta[name="google-site-verification"][content="${token}"]`)) {
          const meta = document.createElement('meta');
          meta.name = 'google-site-verification';
          meta.content = token;
          document.head.appendChild(meta);
        }
      });
    }
  } catch (e) {
    // Silencieux
  }
}

/**
 * Met à jour dynamiquement toutes les balises SEO dans le DOM client :
 * - document.title (spécifique et descriptif par page)
 * - link rel="canonical" (auto-référentiel vers sa propre URL)
 * - meta description et keywords
 * - OpenGraph (og:title, og:description, og:url)
 * - Twitter Cards
 * - Script JSON-LD enrichi (FAQPage, WebPage, BreadcrumbList)
 * - Synchronisation pushState de l'URL du navigateur
 */
export function updateDocumentSeo(pathOrTabId: string, syncHistory = true): PageSeoItem {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return getSeoDataForPath('/');
  }

  // Déterminer le chemin cible
  let targetPath = pathOrTabId.startsWith('/') ? pathOrTabId : getPathForTabId(pathOrTabId);
  const pageSeo = getSeoDataForPath(targetPath);

  try {
    // 1. Title
    document.title = pageSeo.title;

    // 2. Balise canonique auto-référentielle
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = pageSeo.canonicalUrl;

    // 3. Meta Description
    let descMeta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!descMeta) {
      descMeta = document.createElement('meta');
      descMeta.name = 'description';
      document.head.appendChild(descMeta);
    }
    descMeta.content = pageSeo.description;

    // 4. Meta Keywords
    let keywordsMeta = document.querySelector<HTMLMetaElement>('meta[name="keywords"]');
    if (!keywordsMeta) {
      keywordsMeta = document.createElement('meta');
      keywordsMeta.name = 'keywords';
      document.head.appendChild(keywordsMeta);
    }
    keywordsMeta.content = pageSeo.keywords;

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
    setOgTag('og:url', pageSeo.canonicalUrl);

    // 6. Twitter Card Tags
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

    // 7. Schema.org JSON-LD dynamique
    let jsonLdScript = document.getElementById('seo-page-jsonld');
    if (!jsonLdScript) {
      jsonLdScript = document.createElement('script');
      jsonLdScript.id = 'seo-page-jsonld';
      jsonLdScript.setAttribute('type', 'application/ld+json');
      document.head.appendChild(jsonLdScript);
    }
    jsonLdScript.textContent = generatePageJsonLd(pageSeo);

    // 8. Synchronisation URL dans la barre d'adresse
    if (syncHistory && typeof window.history !== 'undefined') {
      const currentPath = window.location.pathname;
      if (currentPath !== pageSeo.path && !(pageSeo.path === '/direct' && currentPath === '/')) {
        window.history.pushState({ tabId: pageSeo.tabId, path: pageSeo.path }, '', pageSeo.path);
      }
    }
  } catch (err) {
    console.error('Erreur mise à jour SEO DOM:', err);
  }

  return pageSeo;
}

