/**
 * API Cloudflare Worker avec Base de Données Cloudflare D1
 * Pour Instant Météo : Classement Compétitif & Carte Collaborative en Temps Réel
 */

export interface Env {
  DB: D1Database;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json; charset=utf-8',
};

function jsonResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: corsHeaders,
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
      // 1. Health check & Ping
      if (path === '/api/health' || path === '/health') {
        const check = await env.DB.prepare('SELECT 1 as alive').first();
        return jsonResponse({
          status: 'ok',
          database: 'Cloudflare D1 connecté',
          alive: check?.alive === 1,
          timestamp: new Date().toISOString(),
        });
      }

      // 2. Classement Mondial TOP 100 des Joueurs
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

      // 3. Synchronisation du Profil Joueur (Upsert dans D1)
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

        // Upsert dans SQLite Cloudflare D1
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

        // Calcul du rang mondial
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

      // 4. Liste des Signalements Météo Citoyens Récents (< 48h)
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
          ORDER BY created_at DESC 
          LIMIT 120`
        ).all();

        return jsonResponse({
          success: true,
          reports: results || [],
        });
      }

      // 5. Publier un Signalement Citoyen en Direct
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

      // 6. Confirmer / Valider un Signalement
      const confirmMatch = path.match(/^\/api\/reports\/([^/]+)\/confirm$/);
      if (confirmMatch && request.method === 'POST') {
        const reportId = confirmMatch[1];
        await env.DB.prepare(
          'UPDATE community_reports SET confirmations = confirmations + 1 WHERE id = ?1'
        ).bind(reportId).run();

        return jsonResponse({ success: true, message: 'Confirmation enregistrée' });
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
