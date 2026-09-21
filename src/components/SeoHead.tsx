import React, { useEffect } from 'react';
import { updateDocumentSeo } from '../utils/seoVerification';
import { getPathForTabId, getSeoDataForPath } from '../seo/pagesSeoData';

interface SeoHeadProps {
  activeTab?: string;
  currentPath?: string;
}

/**
 * Composant commun de gestion du Layout / Head / SEO
 * Met à jour dynamiquement et sans délai :
 * - Balise canonique <link rel="canonical"> vers l'URL propre de la page active (jamais l'accueil si on est ailleurs)
 * - Métadonnées OpenGraph (og:url, og:title, og:description)
 * - Balises Twitter Cards
 * - Title et meta description
 * - Balises robots (garantit l'indexation index, follow et l'absence totale de noindex)
 * - Données structurées JSON-LD Schema.org
 */
export const SeoHead: React.FC<SeoHeadProps> = ({ activeTab, currentPath }) => {
  useEffect(() => {
    const applySeo = () => {
      const pathname = currentPath || (typeof window !== 'undefined' ? window.location.pathname : '/');
      const targetIdentifier = activeTab ? getPathForTabId(activeTab, pathname) : pathname;
      updateDocumentSeo(targetIdentifier, false);
    };

    applySeo();

    const handleLocationChange = () => {
      applySeo();
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, [activeTab, currentPath]);

  return null;
};
