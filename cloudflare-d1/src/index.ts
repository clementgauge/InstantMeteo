/**
 * API Cloudflare Worker avec Base de Données Cloudflare D1 & Support Assets Frontend
 * Pour Instant Météo : Rend le site 100% identique (design, formulaires, cartes OpenStreetMap, Tailwind)
 * sur https://instantmeteo.instantmeteofr.workers.dev/ et https://instantmeteo-fr.ai.studio/
 */

import {
  SEO_PAGES_MAP,
  getSeoDataForPath,
  generatePageJsonLd,
  generateStaticHtmlContent,
  generateHreflangLinksHtml,
  generateSitemapXml,
  UNIFIED_ROBOTS_DIRECTIVE,
} from '../../src/seo/pagesSeoData';
import {
  getSiteBrandForLocale,
  normalizeSupportedLocale,
} from '../../src/i18n/siteTranslations';

export interface Env {
  DB: D1Database;
  ASSETS?: {
    fetch: (request: Request | string) => Promise<Response>;
  };
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, X-Requested-With',
};

function jsonResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
}

function escapeHtmlAttr(str: string): string {
  return str.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeHtmlText(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function transformHtmlForWorker(rawHtml: string, reqPath: string, lang: string = 'fr'): string {
  const locale = normalizeSupportedLocale(lang);
  const brand = getSiteBrandForLocale(locale);
  const pageSeo = getSeoDataForPath(reqPath, locale);
  let html = rawHtml;

  // 0. Attribut lang et dir sur <html>
  html = html.replace(/<html[^>]*>/i, `<html lang="${locale}" dir="${brand.dir}">`);

  // 1. Title naturel et propre à chaque page (avec le nom du site traduit selon la langue)
  if (/<title>[\s\S]*?<\/title>/i.test(html)) {
    html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtmlText(pageSeo.title)}</title>`);
  } else {
    html = html.replace('</head>', `    <title>${escapeHtmlText(pageSeo.title)}</title>\n  </head>`);
  }

  // 2. Balise canonique propre à la page et à la langue active
  const baseCanonicalUrl =
    pageSeo.path === '/'
      ? 'https://instantmeteo.instantmeteofr.workers.dev/'
      : pageSeo.canonicalUrl.replace(/\/+$/, '') || 'https://instantmeteo.instantmeteofr.workers.dev';
  const canonicalUrl = locale === 'fr' ? baseCanonicalUrl : `${baseCanonicalUrl}?hl=${locale}`;
  if (/<link[^>]*rel=["']canonical["'][^>]*>/i.test(html)) {
    html = html.replace(
      /<link[^>]*rel=["']canonical["'][^>]*\/?>/gi,
      `<link rel="canonical" id="dynamic-canonical-link" href="${canonicalUrl}" />`
    );
  } else {
    html = html.replace(
      '</head>',
      `    <link rel="canonical" id="dynamic-canonical-link" href="${canonicalUrl}" />\n  </head>`
    );
  }

  // 2b. Balises hreflang (signalement des différentes versions linguistiques à Google)
  html = html.replace(/<link[^>]*rel=["']alternate["'][^>]*hreflang=["'][^"']+["'][^>]*\/?>\s*/gi, '');
  const hreflangBlock = `<!--SEO_HREFLANG_START-->\n${generateHreflangLinksHtml(baseCanonicalUrl)}\n    <!--SEO_HREFLANG_END-->`;
  if (html.includes('<!--SEO_HREFLANG_START-->') && html.includes('<!--SEO_HREFLANG_END-->')) {
    html = html.replace(
      /<!--SEO_HREFLANG_START-->[\s\S]*?<!--SEO_HREFLANG_END-->/,
      hreflangBlock
    );
  } else {
    html = html.replace('</head>', `    ${hreflangBlock}\n  </head>`);
  }

  // 3. Meta Description, Meta Title & Nom du site traduit (application-name, apple-mobile-web-app-title)
  html = html.replace(
    /<meta[^>]*name=["']title["'][^>]*\/?>/gi,
    `<meta name="title" content="${escapeHtmlAttr(pageSeo.title)}" />`
  );
  html = html.replace(
    /<meta[^>]*name=["']application-name["'][^>]*\/?>/gi,
    `<meta name="application-name" content="${escapeHtmlAttr(brand.brandName)}" />`
  );
  html = html.replace(
    /<meta[^>]*name=["']apple-mobile-web-app-title["'][^>]*\/?>/gi,
    `<meta name="apple-mobile-web-app-title" content="${escapeHtmlAttr(brand.brandName)}" />`
  );
  if (/<meta[^>]*name=["']description["'][^>]*>/i.test(html)) {
    html = html.replace(
      /<meta[^>]*name=["']description["'][^>]*\/?>/gi,
      `<meta name="description" content="${escapeHtmlAttr(pageSeo.description)}" />`
    );
  } else {
    html = html.replace(
      '</head>',
      `    <meta name="description" content="${escapeHtmlAttr(pageSeo.description)}" />\n  </head>`
    );
  }

  // 4. OpenGraph tags (avec og:site_name et og:locale traduits selon la langue)
  html = html.replace(
    /<meta[^>]*property=["']og:title["'][^>]*\/?>/gi,
    `<meta property="og:title" content="${escapeHtmlAttr(pageSeo.title)}" />`
  );
  html = html.replace(
    /<meta[^>]*property=["']og:description["'][^>]*\/?>/gi,
    `<meta property="og:description" content="${escapeHtmlAttr(pageSeo.description)}" />`
  );
  html = html.replace(
    /<meta[^>]*property=["']og:url["'][^>]*\/?>/gi,
    `<meta property="og:url" content="${canonicalUrl}" />`
  );
  html = html.replace(
    /<meta[^>]*property=["']og:site_name["'][^>]*\/?>/gi,
    `<meta property="og:site_name" content="${escapeHtmlAttr(brand.brandName)}" />`
  );
  html = html.replace(
    /<meta[^>]*property=["']og:locale["'][^>]*\/?>/gi,
    `<meta property="og:locale" content="${brand.ogLocale}" />`
  );

  // 5. Suppression totale de keywords, googlebot, tdm-reservation, noai, noimageai et règle commune meta robots
  html = html.replace(/<meta\b[^>]*(?:keywords|googlebot|tdm-reservation|noai|noimageai|carte-meteo-key)[^>]*\/?>\s*/gi, '');
  html = html.replace(/<meta\b[^>]*name=["']robots["'][^>]*\/?>\s*/gi, '');
  html = html.replace(
    '</head>',
    `    <meta name="robots" content="${UNIFIED_ROBOTS_DIRECTIVE}" />\n  </head>`
  );

  // 7. Twitter Card tags
  html = html.replace(
    /<meta[^>]*name=["']twitter:title["'][^>]*\/?>/gi,
    `<meta name="twitter:title" content="${escapeHtmlAttr(pageSeo.title)}" />`
  );
  html = html.replace(
    /<meta[^>]*name=["']twitter:description["'][^>]*\/?>/gi,
    `<meta name="twitter:description" content="${escapeHtmlAttr(pageSeo.description)}" />`
  );
  html = html.replace(
    /<meta[^>]*name=["']twitter:url["'][^>]*\/?>/gi,
    `<meta name="twitter:url" content="${canonicalUrl}" />`
  );

  // 8. Schema.org JSON-LD avec WebSite.name traduit
  const jsonLd = generatePageJsonLd(pageSeo, locale);
  const jsonLdTag = `\n    <!-- Schema.org JSON-LD Dynamique (${pageSeo.slug}) -->\n    <script type="application/ld+json" id="seo-page-jsonld">\n${jsonLd}\n    </script>`;
  if (/<script[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/i.test(html)) {
    html = html.replace(
      /<script[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi,
      jsonLdTag
    );
  } else {
    html = html.replace('</head>', `${jsonLdTag}\n  </head>`);
  }

  // 9. Injection déterministe du contenu HTML initial propre à la page dans le <body>
  const staticContent = generateStaticHtmlContent(pageSeo, locale);
  const rootReplacement = `<!--SEO_ROOT_START--><div id="root">\n${staticContent}\n    </div><!--SEO_ROOT_END-->`;
  if (html.includes('<!--SEO_ROOT_START-->') && html.includes('<!--SEO_ROOT_END-->')) {
    html = html.replace(/<!--SEO_ROOT_START-->[\s\S]*?<!--SEO_ROOT_END-->/, rootReplacement);
  } else {
    // Remplacement complet du corps <body> en préservant uniquement d'éventuels scripts externes
    html = html.replace(/<body([^>]*)>([\s\S]*?)<\/body>/i, (_match, bodyAttrs, bodyInner) => {
      const scripts = (bodyInner.match(/<script\b[^>]*>[\s\S]*?<\/script>/gi) || []).join('\n    ');
      return `<body${bodyAttrs}>\n    ${rootReplacement}${scripts ? `\n    ${scripts}` : ''}\n  </body>`;
    });
  }

  return html;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // Normalisation 301 stricte : redirection des URL avec slash final vers leur forme sans slash
    if (request.method === 'GET' && path !== '/' && path.endsWith('/') && !path.includes('.')) {
      const cleanPath = path.replace(/\/+$/, '');
      return Response.redirect(`${url.origin}${cleanPath}${url.search}`, 301);
    }

    // Redirections 301 d'anciennes URL
    if (path === '/webcams' || path === '/webcam' || path === '/webcams/' || path === '/webcam/') {
      return Response.redirect(`${url.origin}/direct`, 301);
    }
    if (
      path === '/modeles' ||
      path === '/modele' ||
      path === '/modeles-meteo' ||
      path === '/modeles/' ||
      path === '/modele/' ||
      path === '/modeles-meteo/'
    ) {
      return Response.redirect(`${url.origin}/nuages`, 301);
    }

    // Robots.txt : autorise l'exploration complète de toutes les ressources (CSS, JS, images, API) et pages
    if (path === '/robots.txt' && (request.method === 'GET' || request.method === 'HEAD')) {
      const robotsTxt = [
        '# ROBOTS.TXT OFFICIEL - INSTANT MÉTÉO FRANCE',
        'User-agent: *',
        'Allow: /',
        'Allow: /assets/',
        'Allow: /api/',
        '',
        'User-agent: Googlebot',
        'Allow: /',
        'Allow: /assets/',
        'Allow: /api/',
        '',
        'User-agent: Googlebot-Image',
        'Allow: /',
        '',
        'Sitemap: https://instantmeteo.instantmeteofr.workers.dev/sitemap.xml',
        '',
      ].join('\n');
      return new Response(robotsTxt, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'public, max-age=0, s-maxage=0, must-revalidate',
          'CDN-Cache-Control': 'no-store',
        },
      });
    }

    // Sitemap XML dynamique avec hreflang et sans balise <lastmod> fixe périmée
    if (path === '/sitemap.xml' && (request.method === 'GET' || request.method === 'HEAD')) {
      return new Response(generateSitemapXml(), {
        status: 200,
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=0, s-maxage=0, must-revalidate',
          'CDN-Cache-Control': 'no-store',
          'X-Content-Type-Options': 'nosniff',
        },
      });
    }

    try {
      // =========================================================================
      // 0. SERVICE DU FRONTEND REACT AVEC INJECTION SEO COMPLÈTE
      // =========================================================================
      if (!path.startsWith('/api/')) {
        // Fichiers d'assets statiques (js, css, images, favicons, fonts, manifest) et jeu standalone
        const isStaticAsset = (path.includes('.') && !path.endsWith('.html')) || path === '/paratonnerre.html' || path === '/paratonnerre';
        if (isStaticAsset && env.ASSETS) {
          try {
            const assetRes = await env.ASSETS.fetch(request);
            if (assetRes.status !== 404) {
              return assetRes;
            }
          } catch (assetErr) {
            console.warn('Erreur résolution ASSETS:', assetErr);
          }
        }

        // Pages HTML : /radar, /direct, /vigilances, /nuages, /, etc.
        if (request.method === 'GET' && env.ASSETS) {
          try {
            let baseRes: Response | null = null;

            // Tenter de charger le fichier pré-rendu
            try {
              const directRes = await env.ASSETS.fetch(request);
              if (directRes.status !== 404 && directRes.headers.get('content-type')?.includes('text/html')) {
                baseRes = directRes;
              }
            } catch (_) {}

            // Fallback SPA sur _spa_template.html, /direct ou /
            if (!baseRes) {
              for (const fallbackPath of ['/_spa_template.html', '/direct', '/']) {
                try {
                  const spaRequest = new Request(new URL(fallbackPath, request.url).toString(), request);
                  const spaRes = await env.ASSETS.fetch(spaRequest);
                  if (spaRes.status !== 404 && spaRes.headers.get('content-type')?.includes('text/html')) {
                    baseRes = spaRes;
                    break;
                  }
                } catch (_) {}
              }
            }

            if (baseRes) {
              const rawHtml = await baseRes.text();
              const reqLang = normalizeSupportedLocale(
                url.searchParams.get('hl') || url.searchParams.get('lang')
              );
              const transformedHtml = transformHtmlForWorker(rawHtml, path, reqLang);
              return new Response(transformedHtml, {
                status: 200,
                headers: {
                  'Content-Type': 'text/html; charset=utf-8',
                  'Cache-Control': 'public, max-age=0, s-maxage=0, must-revalidate',
                  'CDN-Cache-Control': 'no-store',
                  'X-Robots-Tag': 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
                  'X-Content-Type-Options': 'nosniff',
                  'Referrer-Policy': 'strict-origin-when-cross-origin',
                },
              });
            }
          } catch (renderErr) {
            console.error('Erreur transformation HTML SEO Worker:', renderErr);
          }
        }
      }

      // =========================================================================
      // 1. HEALTH CHECK & STATUT BASE DE DONNÉES
      // =========================================================================
      if (path === '/api/health' || path === '/health') {
        const check = await env.DB.prepare('SELECT 1 as alive').first();
        return jsonResponse({
          status: 'ok',
          database: 'Cloudflare D1 connecté',
          alive: check?.alive === 1,
          timestamp: new Date().toISOString(),
        });
      }

      // =========================================================================
      // 2. CLASSEMENT MONDIAL TOP 100 DES JOUEURS
      // =========================================================================
      if (path === '/api/leaderboard' && request.method === 'GET') {
        const { results } = await env.DB.prepare(
          `SELECT 
            id,
            pseudo, 
            total_points as points, 
            streak_days as streakDays, 
            multiplier, 
            locations_count as locationsCount, 
            badges_count as badgesCount, 
            badge_title as badgeTitle,
            last_active as lastActive
          FROM players 
          ORDER BY total_points DESC 
          LIMIT 100`
        ).all();

        const rankedResults = (results || []).map((row: any, idx: number) => ({
          ...row,
          rank: idx + 1,
          isCurrentUser: false,
        }));

        return jsonResponse({
          success: true,
          count: rankedResults.length,
          leaderboard: rankedResults,
        });
      }

      // =========================================================================
      // 3. SYNCHRONISATION DU PROFIL JOUEUR (UPSERT D1)
      // =========================================================================
      if (path === '/api/player/sync' && request.method === 'POST') {
        const body: any = await request.json();
        const {
          id,
          pseudo,
          totalPoints = 0,
          streakDays = 1,
          multiplier = 1,
          locationsCount = 0,
          badgesCount = 0,
          badgeTitle = 'Apprenti Météo',
          minutesSpent = 0,
          unlockedBadges = [],
        } = body;

        if (!pseudo || !id) {
          return jsonResponse({ error: 'Champs obligatoires manquants (id, pseudo)' }, 400);
        }

        await env.DB.prepare(
          `INSERT INTO players (
            id, pseudo, total_points, streak_days, multiplier, 
            locations_count, badges_count, badge_title, minutes_spent, 
            unlocked_badges_json, last_active
          ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, CURRENT_TIMESTAMP)
          ON CONFLICT(id) DO UPDATE SET
            pseudo = excluded.pseudo,
            total_points = MAX(players.total_points, excluded.total_points),
            streak_days = excluded.streak_days,
            multiplier = excluded.multiplier,
            locations_count = MAX(players.locations_count, excluded.locations_count),
            badges_count = MAX(players.badges_count, excluded.badges_count),
            badge_title = excluded.badge_title,
            minutes_spent = MAX(players.minutes_spent, excluded.minutes_spent),
            unlocked_badges_json = excluded.unlocked_badges_json,
            last_active = CURRENT_TIMESTAMP`
        ).bind(
          id,
          pseudo,
          totalPoints,
          streakDays,
          multiplier,
          locationsCount,
          badgesCount,
          badgeTitle,
          minutesSpent,
          JSON.stringify(unlockedBadges)
        ).run();

        const rankRow = await env.DB.prepare(
          'SELECT COUNT(*) + 1 as rank FROM players WHERE total_points > ?1'
        ).bind(totalPoints).first<{ rank: number }>();

        const totalPlayersRow = await env.DB.prepare(
          'SELECT COUNT(*) as total FROM players'
        ).first<{ total: number }>();

        return jsonResponse({
          success: true,
          message: 'Score joueur synchronisé sur Cloudflare D1',
          rank: rankRow?.rank ?? 1,
          totalPlayers: totalPlayersRow?.total ?? 1,
        });
      }

      // =========================================================================
      // 3b. OBTENIR UN PROFIL JOUEUR PAR PSEUDO OU ID
      // =========================================================================
      const playerMatch = path.match(/^\/api\/player\/([^/]+)$/);
      if (playerMatch && request.method === 'GET') {
        const cleanPseudo = decodeURIComponent(playerMatch[1]).trim().toLowerCase();
        const player = await env.DB.prepare(
          `SELECT 
            id, pseudo, total_points as totalPoints, streak_days as streakDays, 
            multiplier, locations_count as locationsCount, badges_count as badgesCount, 
            badge_title as badgeTitle, minutes_spent as minutesSpent, 
            unlocked_badges_json as unlockedBadgesJson, last_active as lastActive
          FROM players 
          WHERE LOWER(pseudo) = ?1 OR id = ?2
          LIMIT 1`
        ).bind(cleanPseudo, 'usr-' + cleanPseudo.replace(/[^a-z0-9_-]/g, '_')).first<any>();

        if (!player) {
          return jsonResponse({ success: false, error: 'Joueur introuvable' }, 404);
        }

        let unlockedBadges: string[] = [];
        try {
          unlockedBadges = JSON.parse(player.unlockedBadgesJson || '[]');
        } catch {}

        return jsonResponse({
          success: true,
          player: {
            id: player.id,
            pseudo: player.pseudo,
            totalPoints: player.totalPoints,
            streakDays: player.streakDays,
            multiplier: player.multiplier,
            locationsCount: player.locationsCount,
            badgesCount: player.badgesCount,
            badgeTitle: player.badgeTitle,
            minutesSpent: player.minutesSpent,
            unlockedBadges,
            lastActive: player.lastActive
          }
        });
      }

      // =========================================================================
      // 3c. RÉINITIALISER LES POINTS D'UN JOUEUR
      // =========================================================================
      if (path === '/api/player/reset' && request.method === 'POST') {
        const body: any = await request.json();
        const { pseudo, id } = body;
        const targetId = id || (pseudo ? 'usr-' + pseudo.toLowerCase().replace(/[^a-z0-9_-]/g, '_') : null);
        if (!targetId) {
          return jsonResponse({ error: 'Identifiant ou pseudo manquant' }, 400);
        }

        await env.DB.prepare(
          `UPDATE players SET 
            total_points = 0,
            locations_count = 0,
            badges_count = 0,
            unlocked_badges_json = '[]',
            last_active = CURRENT_TIMESTAMP
          WHERE id = ?1`
        ).bind(targetId).run();

        return jsonResponse({ success: true, message: 'Points réinitialisés sur Cloudflare D1' });
      }

      // =========================================================================
      // 3d. SUPPRIMER UN COMPTE JOUEUR
      // =========================================================================
      if ((path === '/api/player/delete' || path === '/api/admin/delete-user' || path === '/api/admin/delete-player') && (request.method === 'POST' || request.method === 'DELETE')) {
        const body: any = await request.json();
        const { pseudo, id } = body || {};
        const cleanPseudo = (pseudo || '').trim().toLowerCase();
        const targetId = id || (cleanPseudo ? 'usr-' + cleanPseudo.replace(/[^a-z0-9_-]/g, '_') : '');
        if (!targetId && !cleanPseudo) {
          return jsonResponse({ error: 'Identifiant ou pseudo manquant' }, 400);
        }

        await env.DB.prepare('DELETE FROM players WHERE id = ?1 OR LOWER(pseudo) = ?2').bind(targetId, cleanPseudo).run();
        return jsonResponse({ success: true, message: 'Compte joueur supprimé de Cloudflare D1 avec succès' });
      }

      // =========================================================================
      // 4. LISTE DES SIGNALEMENTS MÉTÉO DU JOUR
      // =========================================================================
      if (path === '/api/reports' && request.method === 'GET') {
        const { results } = await env.DB.prepare(
          `SELECT 
            id,
            city,
            department,
            latitude,
            longitude,
            weather_code as weatherCode,
            weather_label as weatherLabel,
            emoji,
            temperature,
            intensity,
            comment,
            reporter_pseudo as reporterPseudo,
            confirmations,
            created_at as timestamp
          FROM community_reports 
          WHERE date(created_at) = date('now')
          ORDER BY created_at DESC 
          LIMIT 150`
        ).all();

        return jsonResponse({
          success: true,
          reports: results || [],
        });
      }

      // =========================================================================
      // 5. PUBLIER UN SIGNALEMENT CITOYEN EN DIRECT
      // =========================================================================
      if (path === '/api/reports' && request.method === 'POST') {
        const body: any = await request.json();
        const {
          id = 'rep-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
          city,
          department = '',
          latitude,
          longitude,
          weatherCode = 'sun',
          weatherLabel = 'Beau temps',
          emoji = '☀️',
          temperature = 20,
          intensity = 'MODÉRÉE',
          comment = '',
          reporterPseudo = 'Anonyme',
        } = body;

        if (!city || latitude === undefined || longitude === undefined) {
          return jsonResponse({ error: 'Coordonnées ou ville manquantes' }, 400);
        }

        await env.DB.prepare(
          `INSERT INTO community_reports (
            id, city, department, latitude, longitude,
            weather_code, weather_label, emoji, temperature,
            intensity, comment, reporter_pseudo, confirmations
          ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, 1)`
        ).bind(
          id,
          city,
          department,
          latitude,
          longitude,
          weatherCode,
          weatherLabel,
          emoji,
          temperature,
          intensity,
          comment,
          reporterPseudo
        ).run();

        return jsonResponse({
          success: true,
          reportId: id,
          message: 'Signalement enregistré sur Cloudflare D1 avec succès',
        });
      }

      // =========================================================================
      // 6. CONFIRMER UN SIGNALEMENT
      // =========================================================================
      const confirmMatch = path.match(/^\/api\/reports\/([^/]+)\/confirm$/);
      if (confirmMatch && request.method === 'POST') {
        const reportId = confirmMatch[1];
        await env.DB.prepare(
          'UPDATE community_reports SET confirmations = confirmations + 1 WHERE id = ?1'
        ).bind(reportId).run();

        return jsonResponse({ success: true, message: 'Confirmation enregistrée' });
      }

      // =========================================================================
      // 7. PROXY TRANSLUCIDE VERS BACKEND AI STUDIO (Photos de ville, Webcams, etc.)
      // =========================================================================
      if (
        path === '/api/city-photo' ||
        path === '/api/webcams' ||
        path === '/api/vigilance-meteofrance' ||
        path.startsWith('/api/weather-contradiction')
      ) {
        const targetUrl = `https://instantmeteo-fr.ai.studio${path}${url.search}`;
        try {
          const backendRes = await fetch(targetUrl, {
            method: request.method,
            headers: {
              'Accept': request.headers.get('Accept') || 'application/json',
              'User-Agent': 'InstantMeteo-Cloudflare-Worker/1.0',
            }
          });
          const headers = new Headers(backendRes.headers);
          headers.set('Access-Control-Allow-Origin', '*');
          return new Response(backendRes.body, {
            status: backendRes.status,
            headers
          });
        } catch (e: any) {
          return jsonResponse({ error: 'Backend distant temporairement indisponible' }, 502);
        }
      }

      return jsonResponse({ error: 'Route non trouvée sur le Worker D1', path }, 404);
    } catch (err: any) {
      console.error('Erreur API Worker Cloudflare D1:', err);
      return jsonResponse({
        error: 'Erreur interne D1',
        details: err?.message || String(err),
      }, 500);
    }
  },
};
