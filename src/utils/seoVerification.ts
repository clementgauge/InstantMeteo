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
