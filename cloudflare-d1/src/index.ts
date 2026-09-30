/**
 * API Cloudflare Worker avec Base de Données Cloudflare D1 & Support Assets Frontend
 * Pour Instant Météo : Rend le site 100% identique (design, formulaires, cartes OpenStreetMap, Tailwind)
 * sur https://instantmeteo.instantmeteofr.workers.dev/ et https://instantmeteo-fr.ai.studio/
 */

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

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Gestion des requêtes préliminaires CORS (preflight)
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // =========================================================================
      // 0. SERVICE DU FRONTEND REACT (Design, CSS Tailwind, Cartes, Chunks JS, SPA)
      // =========================================================================
      if (!path.startsWith('/api/')) {
        if (env.ASSETS) {
          try {
            const assetRes = await env.ASSETS.fetch(request);
            if (assetRes.status !== 404) {
              return assetRes;
            }
            // Mode Single Page Application (SPA) :
            // Pour toute route de page (/radar, /vigilances, /direct, /nuages, etc.), servir index.html
            if (request.method === 'GET' && !path.includes('.')) {
              const spaRequest = new Request(new URL('/', request.url).toString(), request);
              const spaRes = await env.ASSETS.fetch(spaRequest);
              if (spaRes.status !== 404) {
                return spaRes;
              }
            }
            return assetRes;
          } catch (assetErr) {
            console.warn('Erreur résolution ASSETS:', assetErr);
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
      // 1b. CLÉ API & CONFIGURATION CARTE MÉTÉO DIRECT
      // =========================================================================
      if (path === '/api/carte-meteo/key' || path === '/api/carte-meteo/config' || path === '/api/map-key') {
        return jsonResponse({
          status: 'ok',
          success: true,
          key: 'instant-meteo-map-key-2026-direct',
          apiKey: 'instant-meteo-map-key-2026-direct',
          carteMeteoKey: 'instant-meteo-map-key-2026-direct',
          provider: 'instant-meteo-carte-direct',
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
