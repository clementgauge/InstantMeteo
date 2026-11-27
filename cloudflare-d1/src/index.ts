/**
 * API Cloudflare Worker avec Base de Données Cloudflare D1 & Support Assets Frontend
 * Pour Instant Météo : Rend le site 100% identique (design, formulaires, cartes OpenStreetMap, Tailwind)
 * sur https://instantmeteo.instantmeteofr.workers.dev/ et https://instantmeteo-fr.ai.studio/
 */

import {
  applyPageSeoToHtml,
  applyNotFoundSeoToHtml,
  generateRobotsTxt,
  generateSitemapIndexXml,
  generatePagesSitemapXml,
  generateDepartmentSitemapXml,
  getAliasRedirectTarget,
  isValidSeoPath,
  stripLocalePrefix,
  localizeSkyMapHtml,
  UNIFIED_ROBOTS_DIRECTIVE,
} from '../../src/seo/pagesSeoData';

export interface Env {
  DB: D1Database;
  ASSETS?: {
    fetch: (request: Request | string) => Promise<Response>;
  };
  ADMIN_TOKEN?: string;
  SESSION_SECRET?: string;
}

const ALLOWED_BADGE_IDS = new Set([
  'sun', 'rain', 'storm', 'snow', 'frost', 'fog', 'gale', 'heat', 'altitude', 'night_stars',
]);

let ephemeralWorkerSecret: string | null = null;
function getWorkerSigningSecret(env: Env): string {
  const configured = (env.SESSION_SECRET || env.ADMIN_TOKEN || '').trim();
  if (configured) return configured;
  if (!ephemeralWorkerSecret) {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    ephemeralWorkerSecret = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  }
  return ephemeralWorkerSecret;
}

function isAllowedCorsOrigin(origin: string | null): boolean {
  if (!origin) return false;
  if (
    origin === 'http://localhost:3000' ||
    origin === 'http://127.0.0.1:3000' ||
    origin === 'https://instantmeteo-fr.ai.studio' ||
    origin === 'https://instantmeteo.instantmeteofr.workers.dev'
  ) {
    return true;
  }
  try {
    const parsed = new URL(origin);
    if (parsed.protocol !== 'https:') return false;
    return (
      parsed.hostname.endsWith('.run.app') ||
      parsed.hostname.endsWith('.ai.studio') ||
      parsed.hostname.endsWith('.workers.dev')
    );
  } catch {
    return false;
  }
}

function buildCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('Origin');
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Player-Token, Accept, X-Requested-With',
  };
  if (origin && isAllowedCorsOrigin(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Vary'] = 'Origin';
  }
  return headers;
}

function jsonResponse(request: Request, data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...buildCorsHeaders(request),
      'Content-Type': 'application/json; charset=utf-8',
      'X-Robots-Tag': 'noindex, nofollow',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

async function safeReadJson(request: Request): Promise<{ ok: true; data: any } | { ok: false }> {
  try {
    const text = await request.text();
    if (!text || !text.trim()) {
      return { ok: true, data: {} };
    }
    const parsed = JSON.parse(text);
    if (parsed !== null && typeof parsed !== 'object') {
      return { ok: false };
    }
    return { ok: true, data: parsed };
  } catch {
    return { ok: false };
  }
}

// Per-isolate sliding-window rate limiter
const workerApiCounts = new Map<string, { count: number; resetTime: number }>();
const workerStrictCounts = new Map<string, { count: number; resetTime: number }>();

function checkWorkerRateLimit(request: Request, path: string): boolean {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const now = Date.now();

  const general = workerApiCounts.get(ip);
  if (!general || now > general.resetTime) {
    workerApiCounts.set(ip, { count: 1, resetTime: now + 60_000 });
  } else {
    general.count += 1;
    if (general.count > 180) return false;
  }

  const isStrict =
    path === '/api/admin/login' ||
    path.startsWith('/api/admin/') ||
    path.startsWith('/api/player/') ||
    (request.method !== 'GET' && path.startsWith('/api/reports'));
  if (isStrict && request.method !== 'OPTIONS') {
    const strict = workerStrictCounts.get(ip);
    if (!strict || now > strict.resetTime) {
      workerStrictCounts.set(ip, { count: 1, resetTime: now + 60_000 });
    } else {
      strict.count += 1;
      if (strict.count > 30) return false;
    }
  }

  if (workerApiCounts.size > 5000) workerApiCounts.clear();
  if (workerStrictCounts.size > 5000) workerStrictCounts.clear();
  return true;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(str: string): Uint8Array | null {
  try {
    const padded = str.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((str.length + 3) % 4);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  } catch {
    return null;
  }
}

async function timingSafeEqualStrings(a: string, b: string): Promise<boolean> {
  const enc = new TextEncoder();
  const [hashA, hashB] = await Promise.all([
    crypto.subtle.digest('SHA-256', enc.encode(a)),
    crypto.subtle.digest('SHA-256', enc.encode(b)),
  ]);
  const bytesA = new Uint8Array(hashA);
  const bytesB = new Uint8Array(hashB);
  let diff = 0;
  for (let i = 0; i < bytesA.length; i += 1) {
    diff |= bytesA[i] ^ bytesB[i];
  }
  return diff === 0;
}

interface SignedWorkerTokenPayload {
  role: 'admin' | 'player';
  sub: string;
  pseudo?: string;
  exp: number;
}

async function signWorkerToken(payload: SignedWorkerTokenPayload, env: Env): Promise<string> {
  const enc = new TextEncoder();
  const encodedPayload = toBase64Url(enc.encode(JSON.stringify(payload)));
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(getWorkerSigningSecret(env)),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sigBuf = await crypto.subtle.sign('HMAC', key, enc.encode(encodedPayload));
  const sig = toBase64Url(new Uint8Array(sigBuf));
  return `${encodedPayload}.${sig}`;
}

async function verifyWorkerToken(token: string, env: Env): Promise<SignedWorkerTokenPayload | null> {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encodedPayload, sig] = parts;
  if (!encodedPayload || !sig) return null;
  try {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(getWorkerSigningSecret(env)),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const expectedSigBuf = await crypto.subtle.sign('HMAC', key, enc.encode(encodedPayload));
    const expectedSig = toBase64Url(new Uint8Array(expectedSigBuf));
    if (!(await timingSafeEqualStrings(sig, expectedSig))) return null;

    const payloadBytes = fromBase64Url(encodedPayload);
    if (!payloadBytes) return null;
    const parsed = JSON.parse(new TextDecoder().decode(payloadBytes)) as SignedWorkerTokenPayload;
    if (!parsed || typeof parsed.exp !== 'number' || Date.now() > parsed.exp) return null;
    return parsed;
  } catch {
    return null;
  }
}

function extractBearerToken(request: Request): string {
  const authHeader = request.headers.get('Authorization') || '';
  if (!authHeader.startsWith('Bearer ')) return '';
  return authHeader.slice(7).trim();
}

async function isVerifiedWorkerAdmin(request: Request, env: Env): Promise<boolean> {
  const token = extractBearerToken(request);
  if (!token) return false;
  const configured = (env.ADMIN_TOKEN || '').trim();
  if (configured && (await timingSafeEqualStrings(token, configured))) {
    return true;
  }
  const signed = await verifyWorkerToken(token, env);
  return Boolean(signed && signed.role === 'admin');
}

async function getVerifiedWorkerPlayerToken(request: Request, env: Env): Promise<SignedWorkerTokenPayload | null> {
  const raw = request.headers.get('X-Player-Token') || '';
  const parsed = await verifyWorkerToken(raw.trim(), env);
  if (!parsed || parsed.role !== 'player') return null;
  return parsed;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      const origin = request.headers.get('Origin');
      if (origin && !isAllowedCorsOrigin(origin)) {
        return new Response(null, { status: 403 });
      }
      return new Response(null, { status: 204, headers: buildCorsHeaders(request) });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // 1. Redirections permanentes 301 (slash final, ?hl=en -> /en/..., tous les alias thématiques et villes)
    if (request.method === 'GET' || request.method === 'HEAD') {
      const redirectTarget = getAliasRedirectTarget(path, url.search);
      if (redirectTarget) {
        return Response.redirect(`${url.origin}${redirectTarget}`, 301);
      }
    }

    // 2. Robots.txt unifié
    if (path === '/robots.txt' && (request.method === 'GET' || request.method === 'HEAD')) {
      return new Response(request.method === 'HEAD' ? null : generateRobotsTxt(), {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'public, max-age=0, s-maxage=0, must-revalidate',
          'CDN-Cache-Control': 'no-store',
        },
      });
    }

    // 3. Sitemaps XML (Index + Pages + Départements)
    if ((request.method === 'GET' || request.method === 'HEAD') && /^\/sitemap.*\.xml$/i.test(path)) {
      let xmlContent: string | null = null;
      if (path === '/sitemap.xml') {
        xmlContent = generateSitemapIndexXml();
      } else if (path === '/sitemap-pages.xml') {
        xmlContent = generatePagesSitemapXml();
      } else {
        const deptMatch = path.match(/^\/sitemap-dept-([a-z0-9]+)\.xml$/i);
        if (deptMatch) {
          xmlContent = generateDepartmentSitemapXml(deptMatch[1]);
        }
      }

      if (!xmlContent) {
        return new Response('Sitemap not found', {
          status: 404,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'X-Robots-Tag': 'noindex, nofollow',
          },
        });
      }

      return new Response(request.method === 'HEAD' ? null : xmlContent, {
        status: 200,
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=0, s-maxage=0, must-revalidate',
          'CDN-Cache-Control': 'no-store',
          'X-Content-Type-Options': 'nosniff',
        },
      });
    }

    // 4. SkyMap 3D : servi UNIQUEMENT sur /skymap et /en/skymap (skymap-embed.html est géré en noindex ci-dessous)
    if (
      (request.method === 'GET' || request.method === 'HEAD') &&
      env.ASSETS &&
      (path === '/skymap' || path === '/en/skymap')
    ) {
      const locale = path === '/en/skymap' ? 'en' : 'fr';
      for (const assetPath of ['/skymap.html', '/skymap']) {
        try {
          const res = await env.ASSETS.fetch(
            new Request(new URL(assetPath, request.url).toString(), { method: 'GET' })
          );
          const html =
            res.status === 200 && (res.headers.get('content-type') || '').includes('text/html')
              ? await res.text()
              : null;
          if (html && html.includes('maplibregl') && !html.includes('SEO_ROOT_START')) {
            const localizedHtml = localizeSkyMapHtml(html, locale);
            return new Response(request.method === 'HEAD' ? null : localizedHtml, {
              status: 200,
              headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 'public, max-age=0, must-revalidate',
                'X-Robots-Tag': UNIFIED_ROBOTS_DIRECTIVE,
                'X-Content-Type-Options': 'nosniff',
              },
            });
          }
        } catch (_) {}
      }
    }

    if ((path.startsWith('/api/') || path === '/health') && !checkWorkerRateLimit(request, path)) {
      return jsonResponse(request, { error: 'Limite de requêtes atteinte, veuillez patienter.' }, 429);
    }

    try {
      // =========================================================================
      // 0. SERVICE DU FRONTEND REACT AVEC INJECTION SEO COMPLÈTE OU 404 RÉEL
      // =========================================================================
      if (!path.startsWith('/api/') && path !== '/health') {
        const isStaticAsset =
          path.startsWith('/assets/') ||
          path === '/skymap-embed.html' ||
          path === '/version.json' ||
          (path.includes('.') && !path.endsWith('.html')) ||
          (path.startsWith('/google') && path.endsWith('.html'));

        if ((request.method === 'GET' || request.method === 'HEAD') && isStaticAsset && env.ASSETS) {
          try {
            let assetRes = await env.ASSETS.fetch(request);
            if (assetRes.status >= 300 && assetRes.status < 400) {
              const location = assetRes.headers.get('location');
              if (location) {
                const redirectUrl = new URL(location, request.url);
                if (redirectUrl.origin === url.origin) {
                  assetRes = await env.ASSETS.fetch(
                    new Request(redirectUrl.toString(), {
                      method: request.method === 'HEAD' ? 'HEAD' : 'GET',
                      headers: request.headers,
                    })
                  );
                }
              }
            }
            if (assetRes.status !== 404) {
              const headers = new Headers(assetRes.headers);
              if (
                path === '/skymap-embed.html' ||
                path === '/version.json' ||
                path.startsWith('/assets/aistudio/')
              ) {
                headers.set('X-Robots-Tag', 'noindex, nofollow');
              }
              return new Response(request.method === 'HEAD' ? null : assetRes.body, {
                status: assetRes.status,
                headers,
              });
            }
          } catch (assetErr) {
            console.warn('Erreur résolution ASSETS:', assetErr);
          }
        }

        // Pages HTML : vérification stricte de validité (200 si canonique, 404 réel sinon)
        if ((request.method === 'GET' || request.method === 'HEAD') && env.ASSETS) {
          try {
            let baseRes: Response | null = null;
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

            if (baseRes) {
              const rawHtml = await baseRes.text();
              const { locale } = stripLocalePrefix(path);

              if (!isValidSeoPath(path)) {
                const notFoundHtml = applyNotFoundSeoToHtml(rawHtml, path, locale);
                return new Response(request.method === 'HEAD' ? null : notFoundHtml, {
                  status: 404,
                  headers: {
                    'Content-Type': 'text/html; charset=utf-8',
                    'Cache-Control': 'no-store, no-cache, must-revalidate',
                    'X-Robots-Tag': 'noindex, nofollow',
                    'X-Content-Type-Options': 'nosniff',
                  },
                });
              }

              const transformedHtml = applyPageSeoToHtml(rawHtml, path, locale, {
                queryParams: url.searchParams,
              });
              return new Response(request.method === 'HEAD' ? null : transformedHtml, {
                status: 200,
                headers: {
                  'Content-Type': 'text/html; charset=utf-8',
                  'Cache-Control': 'public, max-age=0, s-maxage=0, must-revalidate',
                  'CDN-Cache-Control': 'no-store',
                  'X-Robots-Tag': UNIFIED_ROBOTS_DIRECTIVE,
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
      // 1. HEALTH CHECK & AUTHENTIFICATION ADMIN
      // =========================================================================
      if (path === '/api/health' || path === '/health') {
        const check = await env.DB.prepare('SELECT 1 as alive').first();
        return jsonResponse(request, {
          status: 'ok',
          database: 'Cloudflare D1 connecté',
          alive: check?.alive === 1,
          timestamp: new Date().toISOString(),
        });
      }

      if (path === '/api/admin/auth-status' && request.method === 'GET') {
        const envConfigured = Boolean((env.ADMIN_TOKEN || '').trim());
        return jsonResponse(request, {
          success: true,
          envConfigured,
          hasClaimedCredential: false,
          needsSetup: false,
        });
      }

      if (path === '/api/admin/login' && request.method === 'POST') {
        const parsed = await safeReadJson(request);
        if (!parsed.ok) return jsonResponse(request, { error: 'Corps JSON invalide' }, 400);
        const rawInput = typeof parsed.data?.password === 'string'
          ? parsed.data.password
          : (typeof parsed.data?.token === 'string' ? parsed.data.token : '');
        const credential = rawInput.trim();
        const envToken = (env.ADMIN_TOKEN || '').trim();
        if (!credential || !envToken) {
          return jsonResponse(request, { error: 'Identifiant administrateur invalide ou non configuré' }, 401);
        }
        const ok = await timingSafeEqualStrings(credential, envToken);
        if (!ok) {
          return jsonResponse(request, { error: 'Identifiant administrateur invalide' }, 401);
        }
        const token = await signWorkerToken(
          { role: 'admin', sub: 'worker-admin', exp: Date.now() + 12 * 3600 * 1000 },
          env
        );
        return jsonResponse(request, { success: true, token, expiresIn: 43200 });
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

        return jsonResponse(request, {
          success: true,
          count: rankedResults.length,
          leaderboard: rankedResults,
        });
      }

      // =========================================================================
      // 3. SYNCHRONISATION DU PROFIL JOUEUR (VALIDATION & BORNAGE SERVEUR)
      // =========================================================================
      if (path === '/api/player/sync' && request.method === 'POST') {
        const parsed = await safeReadJson(request);
        if (!parsed.ok) return jsonResponse(request, { error: 'Corps JSON invalide' }, 400);
        const body = parsed.data || {};

        const rawPseudo = typeof body.pseudo === 'string' ? body.pseudo.trim() : '';
        if (rawPseudo.length < 1 || rawPseudo.length > 32) {
          return jsonResponse(request, { error: 'Pseudo invalide (1 à 32 caractères requis)' }, 400);
        }
        const cleanPseudo = rawPseudo.replace(/[\r\n\t]+/g, ' ').slice(0, 32);
        const normPseudo = cleanPseudo.toLowerCase();
        const rawId = typeof body.id === 'string' ? body.id.trim().slice(0, 64) : '';
        const stableId = rawId && /^[a-zA-Z0-9_-]{3,64}$/.test(rawId)
          ? rawId
          : `usr-${normPseudo.replace(/[^a-z0-9_-]/g, '_')}`;

        const callerIsAdmin = await isVerifiedWorkerAdmin(request, env);
        const verifiedPlayerToken = await getVerifiedWorkerPlayerToken(request, env);

        const requestedStreak = Math.min(3650, Math.max(1, Math.floor(Number(body.streakDays) || 1)));
        const requestedMultiplier = Math.min(10, Math.max(1, Number(body.multiplier) || 1));
        const requestedLocations = Math.min(10000, Math.max(0, Math.floor(Number(body.locationsCount) || 0)));
        const requestedMinutes = Math.min(500000, Math.max(0, Math.floor(Number(body.minutesSpent) || 0)));
        const requestedPoints = Math.min(1_000_000, Math.max(0, Math.floor(Number(body.totalPoints) || 0)));
        const sanitizedBadges = Array.isArray(body.unlockedBadges)
          ? Array.from(new Set(body.unlockedBadges.filter((b: unknown): b is string => typeof b === 'string' && ALLOWED_BADGE_IDS.has(b))))
          : [];
        const rawTitle = typeof body.badgeTitle === 'string' ? body.badgeTitle.trim().slice(0, 64) : 'Apprenti Météo';
        const safeBadgeTitle = !callerIsAdmin && rawTitle.toLowerCase() === 'admin' ? 'Apprenti Météo' : (rawTitle || 'Apprenti Météo');

        const existing = await env.DB.prepare(
          `SELECT id, pseudo, total_points as totalPoints, streak_days as streakDays,
            multiplier, locations_count as locationsCount, badges_count as badgesCount,
            badge_title as badgeTitle, minutes_spent as minutesSpent,
            unlocked_badges_json as unlockedBadgesJson
          FROM players WHERE id = ?1 OR LOWER(pseudo) = ?2 LIMIT 1`
        ).bind(stableId, normPseudo).first<any>();

        let finalPoints = 0;
        let finalStreak = 1;
        let finalMultiplier = 1;
        let finalLocations = 0;
        let finalMinutes = 0;
        let finalBadges: string[] = [];
        let finalBadgeTitle = safeBadgeTitle;
        let finalId = stableId;
        let issuedPlayerToken: string | undefined;

        if (existing) {
          finalId = existing.id;
          const prevPoints = Math.min(1_000_000, Math.max(0, Number(existing.totalPoints) || 0));
          const prevStreak = Math.max(1, Number(existing.streakDays) || 1);
          const prevMinutes = Math.max(0, Number(existing.minutesSpent) || 0);
          const prevLocations = Math.max(0, Number(existing.locationsCount) || 0);
          let prevBadges: string[] = [];
          try {
            const rawB = JSON.parse(existing.unlockedBadgesJson || '[]');
            if (Array.isArray(rawB)) prevBadges = rawB.filter((b: unknown): b is string => typeof b === 'string' && ALLOWED_BADGE_IDS.has(b));
          } catch {}

          finalMinutes = Math.min(prevMinutes + 120, Math.max(prevMinutes, requestedMinutes));
          finalLocations = Math.min(prevLocations + 25, Math.max(prevLocations, requestedLocations));
          finalStreak = Math.min(prevStreak + 1, Math.max(prevStreak, requestedStreak));
          finalMultiplier = Math.min(10, Math.max(1, Number(existing.multiplier) || requestedMultiplier));
          finalBadges = Array.from(new Set([...prevBadges, ...sanitizedBadges])).slice(0, ALLOWED_BADGE_IDS.size);

          if (callerIsAdmin) {
            finalPoints = Math.max(prevPoints, requestedPoints);
          } else {
            const addedMinutes = Math.max(0, finalMinutes - prevMinutes);
            const addedBadges = Math.max(0, finalBadges.length - prevBadges.length);
            const addedLocations = Math.max(0, finalLocations - prevLocations);
            const maxAllowedDelta = Math.min(
              500,
              Math.max(25, Math.round(addedMinutes * 2 * requestedMultiplier + addedBadges * 150 + addedLocations * 20))
            );
            const desiredGain = Math.max(0, requestedPoints - prevPoints);
            finalPoints = Math.min(1_000_000, prevPoints + Math.min(maxAllowedDelta, desiredGain));
          }

          await env.DB.prepare(
            `UPDATE players SET
              total_points = ?1,
              streak_days = ?2,
              multiplier = ?3,
              locations_count = ?4,
              badges_count = ?5,
              badge_title = ?6,
              minutes_spent = ?7,
              unlocked_badges_json = ?8,
              last_active = CURRENT_TIMESTAMP
            WHERE id = ?9`
          ).bind(
            finalPoints,
            finalStreak,
            finalMultiplier,
            finalLocations,
            finalBadges.length,
            finalBadgeTitle,
            finalMinutes,
            JSON.stringify(finalBadges),
            finalId
          ).run();

          const tokenMatches = Boolean(
            verifiedPlayerToken &&
            (verifiedPlayerToken.sub === finalId ||
              (verifiedPlayerToken.pseudo || '').toLowerCase() === String(existing.pseudo || '').toLowerCase())
          );
          if (tokenMatches || callerIsAdmin) {
            issuedPlayerToken = await signWorkerToken(
              { role: 'player', sub: finalId, pseudo: existing.pseudo, exp: Date.now() + 30 * 24 * 3600 * 1000 },
              env
            );
          }
        } else {
          finalPoints = callerIsAdmin ? requestedPoints : Math.min(100, requestedPoints);
          finalStreak = Math.min(7, requestedStreak);
          finalMultiplier = Math.min(3, requestedMultiplier);
          finalLocations = Math.min(25, requestedLocations);
          finalMinutes = Math.min(120, requestedMinutes);
          finalBadges = sanitizedBadges;

          await env.DB.prepare(
            `INSERT INTO players (
              id, pseudo, total_points, streak_days, multiplier,
              locations_count, badges_count, badge_title, minutes_spent,
              unlocked_badges_json, last_active
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, CURRENT_TIMESTAMP)`
          ).bind(
            finalId,
            cleanPseudo,
            finalPoints,
            finalStreak,
            finalMultiplier,
            finalLocations,
            finalBadges.length,
            finalBadgeTitle,
            finalMinutes,
            JSON.stringify(finalBadges)
          ).run();

          issuedPlayerToken = await signWorkerToken(
            { role: 'player', sub: finalId, pseudo: cleanPseudo, exp: Date.now() + 30 * 24 * 3600 * 1000 },
            env
          );
        }

        const rankRow = await env.DB.prepare(
          'SELECT COUNT(*) + 1 as rank FROM players WHERE total_points > ?1'
        ).bind(finalPoints).first<{ rank: number }>();

        const totalPlayersRow = await env.DB.prepare(
          'SELECT COUNT(*) as total FROM players'
        ).first<{ total: number }>();

        return jsonResponse(request, {
          success: true,
          message: 'Score joueur synchronisé sur Cloudflare D1',
          rank: rankRow?.rank ?? 1,
          totalPlayers: totalPlayersRow?.total ?? 1,
          ...(issuedPlayerToken ? { playerToken: issuedPlayerToken } : {}),
        });
      }

      // =========================================================================
      // 3b. OBTENIR UN PROFIL JOUEUR PAR PSEUDO OU ID
      // =========================================================================
      const playerMatch = path.match(/^\/api\/player\/([^/]+)$/);
      if (playerMatch && request.method === 'GET') {
        const cleanPseudo = decodeURIComponent(playerMatch[1]).trim().toLowerCase().slice(0, 64);
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
          return jsonResponse(request, { success: false, error: 'Joueur introuvable' }, 404);
        }

        let unlockedBadges: string[] = [];
        try {
          unlockedBadges = JSON.parse(player.unlockedBadgesJson || '[]');
        } catch {}

        return jsonResponse(request, {
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
            lastActive: player.lastActive,
          },
        });
      }

      // =========================================================================
      // 3c. RÉINITIALISER LES POINTS D'UN JOUEUR (AUTHENTIFIÉ)
      // =========================================================================
      if (path === '/api/player/reset' && request.method === 'POST') {
        const callerIsAdmin = await isVerifiedWorkerAdmin(request, env);
        const playerToken = await getVerifiedWorkerPlayerToken(request, env);
        if (!callerIsAdmin && !playerToken) {
          return jsonResponse(request, { error: 'Authentification requise pour réinitialiser ce profil' }, 401);
        }

        const parsed = await safeReadJson(request);
        if (!parsed.ok) return jsonResponse(request, { error: 'Corps JSON invalide' }, 400);
        const pseudo = typeof parsed.data?.pseudo === 'string' ? parsed.data.pseudo.trim() : '';
        const id = typeof parsed.data?.id === 'string' ? parsed.data.id.trim() : '';
        const targetId = id || (pseudo ? 'usr-' + pseudo.toLowerCase().replace(/[^a-z0-9_-]/g, '_') : '');
        if (!targetId) {
          return jsonResponse(request, { error: 'Identifiant ou pseudo manquant' }, 400);
        }

        if (!callerIsAdmin && playerToken) {
          const matchesOwner =
            playerToken.sub === targetId ||
            (pseudo && (playerToken.pseudo || '').toLowerCase() === pseudo.toLowerCase());
          if (!matchesOwner) {
            return jsonResponse(request, { error: 'Accès refusé pour ce profil joueur' }, 403);
          }
        }

        await env.DB.prepare(
          `UPDATE players SET 
            total_points = 0,
            locations_count = 0,
            badges_count = 0,
            unlocked_badges_json = '[]',
            last_active = CURRENT_TIMESTAMP
          WHERE id = ?1 OR LOWER(pseudo) = ?2`
        ).bind(targetId, pseudo.toLowerCase()).run();

        return jsonResponse(request, { success: true, message: 'Points réinitialisés sur Cloudflare D1' });
      }

      // =========================================================================
      // 3d. SUPPRIMER UN COMPTE JOUEUR (PROPRIÉTAIRE OU ADMIN)
      // =========================================================================
      if (
        (path === '/api/player/delete' || path === '/api/player/delete-account') &&
        (request.method === 'POST' || request.method === 'DELETE')
      ) {
        const callerIsAdmin = await isVerifiedWorkerAdmin(request, env);
        const playerToken = await getVerifiedWorkerPlayerToken(request, env);
        if (!callerIsAdmin && !playerToken) {
          return jsonResponse(request, { error: 'Authentification requise pour supprimer ce compte' }, 401);
        }

        const parsed = await safeReadJson(request);
        if (!parsed.ok) return jsonResponse(request, { error: 'Corps JSON invalide' }, 400);
        const cleanPseudo = typeof parsed.data?.pseudo === 'string' ? parsed.data.pseudo.trim().toLowerCase() : '';
        const cleanId = typeof parsed.data?.id === 'string' ? parsed.data.id.trim() : '';
        const targetId = cleanId || (cleanPseudo ? 'usr-' + cleanPseudo.replace(/[^a-z0-9_-]/g, '_') : '');
        if (!targetId && !cleanPseudo) {
          return jsonResponse(request, { error: 'Identifiant ou pseudo manquant' }, 400);
        }

        if (!callerIsAdmin && playerToken) {
          const matchesOwner =
            playerToken.sub === targetId ||
            (cleanPseudo && (playerToken.pseudo || '').toLowerCase() === cleanPseudo);
          if (!matchesOwner) {
            return jsonResponse(request, { error: 'Vous ne pouvez supprimer que votre propre compte' }, 403);
          }
        }

        await env.DB.prepare('DELETE FROM players WHERE id = ?1 OR LOWER(pseudo) = ?2')
          .bind(targetId, cleanPseudo)
          .run();
        return jsonResponse(request, { success: true, message: 'Compte joueur supprimé de Cloudflare D1 avec succès' });
      }

      // 3e. SUPPRESSION PAR ADMINISTRATEUR UNIQUEMENT
      if (
        (path === '/api/admin/delete-user' || path === '/api/admin/delete-player') &&
        (request.method === 'POST' || request.method === 'DELETE')
      ) {
        if (!(await isVerifiedWorkerAdmin(request, env))) {
          return jsonResponse(request, { error: 'Authentification administrateur requise' }, 401);
        }

        const parsed = await safeReadJson(request);
        if (!parsed.ok) return jsonResponse(request, { error: 'Corps JSON invalide' }, 400);
        const cleanPseudo = typeof parsed.data?.pseudo === 'string' ? parsed.data.pseudo.trim().toLowerCase() : '';
        const cleanId = typeof parsed.data?.id === 'string' ? parsed.data.id.trim() : '';
        const targetId = cleanId || (cleanPseudo ? 'usr-' + cleanPseudo.replace(/[^a-z0-9_-]/g, '_') : '');
        if (!targetId && !cleanPseudo) {
          return jsonResponse(request, { error: 'Identifiant ou pseudo manquant' }, 400);
        }

        await env.DB.prepare('DELETE FROM players WHERE id = ?1 OR LOWER(pseudo) = ?2')
          .bind(targetId, cleanPseudo)
          .run();
        return jsonResponse(request, { success: true, message: 'Compte joueur supprimé de Cloudflare D1 avec succès' });
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

        return jsonResponse(request, {
          success: true,
          reports: results || [],
        });
      }

      // =========================================================================
      // 5. PUBLIER UN SIGNALEMENT CITOYEN EN DIRECT (VALIDATION STRICTE)
      // =========================================================================
      if (path === '/api/reports' && request.method === 'POST') {
        const parsed = await safeReadJson(request);
        if (!parsed.ok) return jsonResponse(request, { error: 'Corps JSON invalide' }, 400);
        const body = parsed.data || {};

        const city = typeof body.city === 'string' ? body.city.trim().slice(0, 100) : '';
        const latitude = Number(body.latitude);
        const longitude = Number(body.longitude);
        if (!city || !Number.isFinite(latitude) || !Number.isFinite(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
          return jsonResponse(request, { error: 'Coordonnées ou ville invalides' }, 400);
        }

        const safeId = `rep-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const department = typeof body.department === 'string' ? body.department.trim().slice(0, 80) : '';
        const weatherCode = typeof body.weatherCode === 'string' ? body.weatherCode.trim().slice(0, 32) : 'sun';
        const weatherLabel = typeof body.weatherLabel === 'string' ? body.weatherLabel.trim().slice(0, 80) : 'Beau temps';
        const emoji = typeof body.emoji === 'string' ? body.emoji.trim().slice(0, 16) : '☀️';
        const rawTemp = Number(body.temperature);
        const temperature = Number.isFinite(rawTemp) ? Math.min(65, Math.max(-90, rawTemp)) : 20;
        const intensity = typeof body.intensity === 'string' ? body.intensity.trim().slice(0, 32) : 'MODÉRÉE';
        const comment = typeof body.comment === 'string' ? body.comment.trim().slice(0, 500) : '';
        const reporterPseudo = typeof body.reporterPseudo === 'string' && body.reporterPseudo.trim()
          ? body.reporterPseudo.trim().slice(0, 32)
          : 'Anonyme';

        await env.DB.prepare(
          `INSERT INTO community_reports (
            id, city, department, latitude, longitude,
            weather_code, weather_label, emoji, temperature,
            intensity, comment, reporter_pseudo, confirmations
          ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, 1)`
        ).bind(
          safeId,
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

        return jsonResponse(request, {
          success: true,
          reportId: safeId,
          message: 'Signalement enregistré sur Cloudflare D1 avec succès',
        });
      }

      // =========================================================================
      // 6. CONFIRMER UN SIGNALEMENT
      // =========================================================================
      const confirmMatch = path.match(/^\/api\/reports\/([^/]+)\/confirm$/);
      if (confirmMatch && request.method === 'POST') {
        const reportId = decodeURIComponent(confirmMatch[1]).slice(0, 80);
        await env.DB.prepare(
          'UPDATE community_reports SET confirmations = confirmations + 1 WHERE id = ?1'
        ).bind(reportId).run();

        return jsonResponse(request, { success: true, message: 'Confirmation enregistrée' });
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
          const proxyHeaders: Record<string, string> = {
            'Accept': request.headers.get('Accept') || 'application/json',
            'User-Agent': 'InstantMeteo-Cloudflare-Worker/1.0',
          };
          const contentType = request.headers.get('Content-Type');
          if (contentType) proxyHeaders['Content-Type'] = contentType;
          const backendRes = await fetch(targetUrl, {
            method: request.method,
            headers: proxyHeaders,
            body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
          });
          const headers = new Headers(backendRes.headers);
          headers.delete('Access-Control-Allow-Origin');
          const cors = buildCorsHeaders(request);
          Object.entries(cors).forEach(([k, v]) => headers.set(k, v));
          return new Response(backendRes.body, {
            status: backendRes.status,
            headers,
          });
        } catch {
          return jsonResponse(request, { error: 'Backend distant temporairement indisponible' }, 502);
        }
      }

      if (path === '/api/open-meteo/forecast' && request.method === 'GET') {
        const lat = Number(url.searchParams.get('latitude'));
        const lon = Number(url.searchParams.get('longitude'));
        if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
          return jsonResponse(request, { error: 'Invalid coordinates' }, 400);
        }
        const allowedKeys = new Set([
          'latitude',
          'longitude',
          'elevation',
          'current',
          'minutely_15',
          'hourly',
          'daily',
          'timezone',
          'forecast_days',
          'past_days',
          'models',
        ]);
        const forward = new URLSearchParams();
        url.searchParams.forEach((v, k) => {
          if (allowedKeys.has(k) && v.length <= 2000) forward.set(k, v);
        });
        try {
          const omRes = await fetch(`https://api.open-meteo.com/v1/forecast?${forward.toString()}`, {
            headers: { 'Accept': 'application/json', 'User-Agent': 'InstantMeteo-Worker/2.5' },
          });
          const body = await omRes.text();
          return new Response(body, {
            status: omRes.status,
            headers: {
              ...buildCorsHeaders(request),
              'Content-Type': 'application/json; charset=utf-8',
              'X-Robots-Tag': 'noindex, nofollow',
              'Cache-Control': 'public, max-age=120',
            },
          });
        } catch {
          return jsonResponse(request, { error: 'Open-Meteo upstream unreachable' }, 502);
        }
      }

      return jsonResponse(request, { error: 'Route non trouvée sur le Worker D1', path }, 404);
    } catch (err: any) {
      console.error('Erreur API Worker Cloudflare D1:', err);
      return jsonResponse(request, {
        error: 'Erreur interne D1',
      }, 500);
    }
  },
};
