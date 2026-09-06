import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), 'data', 'meteo_database.json');
const DATABASE_ID = '8c0f3a17-c78d-4dad-9301-90f7138d1e9c';

// Middlewares généraux
app.use(express.json({ limit: '10mb' }));

// -------------------------------------------------------------
// PROTECTION ANTI-BOTS, SCRAPERS & SÉCURITÉ DES EN-TÊTES
// -------------------------------------------------------------

// Signatures de robots malveillants, scrapers agressifs et bibliothèques automatisées
const MALICIOUS_BOT_PATTERNS = [
  /bot\b/i,
  /spider\b/i,
  /crawl(er)?\b/i,
  /scrape(r)?\b/i,
  /python-requests/i,
  /aiohttp/i,
  /scrapy/i,
  /curl\//i,
  /wget\//i,
  /httpclient/i,
  /bytespider/i,
  /petalbot/i,
  /ahrefsbot/i,
  /semrushbot/i,
  /dotbot/i,
  /mj12bot/i,
  /baiduspider/i,
  /sogou/i,
  /gptbot/i,
  /chatgpt-user/i,
  /claudebot/i,
  /anthropic-ai/i,
  /ccbot/i,
  /diffbot/i,
  /headlesschrome/i,
  /phantomjs/i,
  /selenium/i,
  /sqlmap/i,
  /nikto/i
];

// Rate limiting & liste noire en mémoire
const ipRequestCounts = new Map<string, { count: number; resetTime: number }>();
const blacklistedIps = new Set<string>();

// Middleware global anti-bot et renforcement des en-têtes
app.use((req, res, next) => {
  // En-têtes de sécurité renforcés contre l'indexation IA et le reniflage
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Robots-Tag', 'noai, noimageai, nofollow');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';

  // 1. Rejet immédiat si IP piégée par un honeypot
  if (blacklistedIps.has(clientIp)) {
    res.status(403).json({ error: 'Accès interdit - Protection anti-bot active', status: 403 });
    return;
  }

  // 2. Trappe Honeypot : attrape les scanners automatisés de fichiers sensibles
  const pathLower = req.path.toLowerCase();
  if (
    pathLower.includes('.env') ||
    pathLower.includes('wp-login') ||
    pathLower.includes('xmlrpc') ||
    pathLower.includes('.git') ||
    pathLower.includes('phpmyadmin') ||
    pathLower.includes('/admin/config') ||
    pathLower.includes('/autodiscover')
  ) {
    blacklistedIps.add(clientIp);
    res.status(403).json({ error: 'Scanner automatisé détecté et bloqué', status: 403 });
    return;
  }

  // 3. Filtrage anti-bot sur les endpoints d'API
  if (req.path.startsWith('/api/')) {
    const userAgent = req.headers['user-agent'] || '';

    // Bloquer les requêtes API sans User-Agent ou issues d'outils automatisés connus
    if (!userAgent && req.method !== 'OPTIONS') {
      res.status(403).json({ error: 'User-Agent requis pour interagir avec les APIs', status: 403 });
      return;
    }

    const isBadBot = MALICIOUS_BOT_PATTERNS.some((pattern) => pattern.test(userAgent));
    if (isBadBot) {
      res.status(403).json({ 
        error: 'Accès automatisé interdit - Protection anti-bot Instant Météo active',
        status: 403
      });
      return;
    }

    // 4. Protection contre les inondations (Rate Limiting : max 150 requêtes/minute par IP)
    const now = Date.now();
    const rateData = ipRequestCounts.get(clientIp);
    if (!rateData || now > rateData.resetTime) {
      ipRequestCounts.set(clientIp, { count: 1, resetTime: now + 60000 });
    } else {
      rateData.count++;
      if (rateData.count > 150) {
        res.status(429).json({
          error: 'Limite de requêtes atteinte. Protection anti-scraping active.',
          status: 429
        });
        return;
      }
    }
  }

  next();
});

// Entêtes CORS permissives pour tous les clients et domaines (ai.studio, workers.dev, localhost, etc.)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// Initialisation & Persistance de la Base de Données
interface DatabaseSchema {
  databaseId: string;
  databaseName: string;
  updatedAt: string;
  players: any[];
  communityReports: any[];
  discussionMessages: any[];
  adminAnnouncement: any | null;
  bannedUsers: any[];
}

function ensureDataDir(): void {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function getInitialDatabase(): DatabaseSchema {
  return {
    databaseId: DATABASE_ID,
    databaseName: 'meteo-competitive-db',
    updatedAt: new Date().toISOString(),
    players: [],
    communityReports: [],
    discussionMessages: [],
    adminAnnouncement: null,
    bannedUsers: []
  };
}

function loadDatabase(): DatabaseSchema {
  ensureDataDir();
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialDatabase();
      saveDatabase(initial);
      return initial;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const data = JSON.parse(raw);
    data.databaseId = DATABASE_ID; // Garantir la synchronisation avec l'ID utilisateur
    return data;
  } catch (err) {
    console.error('Erreur lecture DB:', err);
    return getInitialDatabase();
  }
}

function saveDatabase(data: DatabaseSchema): void {
  ensureDataDir();
  try {
    data.updatedAt = new Date().toISOString();
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Erreur sauvegarde DB:', err);
  }
}

// -------------------------------------------------------------
// ROUTES API BACKEND CENTRALISÉES (Accès multi-plateformes)
// -------------------------------------------------------------

// 1. Santé et état de la base de données (Multi-domaines : ai.studio & workers.dev synchronisés)
app.get(['/api/health', '/health'], (req, res) => {
  const db = loadDatabase();
  res.json({
    status: 'ok',
    database: 'Base Instant Météo Synchronisée (Cloudflare Workers & AI Studio)',
    databaseId: db.databaseId,
    alive: true,
    totalPlayers: db.players.length,
    timestamp: new Date().toISOString(),
    syncSupported: true,
    domains: [
      'https://instantmeteo-fr.ai.studio',
      'https://instantmeteo.instantmeteofr.workers.dev'
    ]
  });
});

// 1b. Statut de synchronisation multi-domaines
app.get('/api/sync/status', (req, res) => {
  const db = loadDatabase();
  res.json({
    status: 'synchronized',
    masterServer: 'https://instantmeteo-fr.ai.studio',
    workerClient: 'https://instantmeteo.instantmeteofr.workers.dev',
    databaseId: db.databaseId,
    totalPlayers: (db.players || []).length,
    totalReports: (db.communityReports || []).length,
    totalMessages: (db.discussionMessages || []).length,
    lastUpdate: db.updatedAt
  });
});

// 2. Classement TOP mondial des joueurs (Leaderboard)
app.get('/api/leaderboard', (req, res) => {
  const db = loadDatabase();
  const currentPseudo = (req.query.pseudo as string || '').toLowerCase().trim();

  // Filtrer les utilisateurs bannis
  const bannedPseudos = new Set(
    (db.bannedUsers || []).map((b: any) => (b.pseudo || '').toLowerCase())
  );

  const activePlayers = (db.players || []).filter(
    (p: any) => p && p.pseudo && !bannedPseudos.has(p.pseudo.toLowerCase())
  );

  // Tri par totalPoints décroissant
  activePlayers.sort((a: any, b: any) => (b.totalPoints || 0) - (a.totalPoints || 0));

  const ranked = activePlayers.map((player: any, idx: number) => {
    let badgeTitle = player.badgeTitle || 'Apprenti Météo';
    if (player.isAdmin) badgeTitle = 'Admin';
    else if (player.totalPoints >= 3000) badgeTitle = 'Grand Maître Cumulonimbus';
    else if (player.totalPoints >= 2000) badgeTitle = 'Sentinelle Météorologique';
    else if (player.totalPoints >= 1000) badgeTitle = 'Chasseur Émérite';
    else if (player.totalPoints >= 400) badgeTitle = 'Observateur Averti';

    return {
      rank: idx + 1,
      id: player.id,
      pseudo: player.pseudo,
      points: Number(player.totalPoints) || 0,
      streakDays: Number(player.streakDays) || 1,
      locationsCount: Number(player.locationsCount) || 0,
      badgesCount: Number(player.badgesCount) || 0,
      badgeTitle,
      isAdmin: !!player.isAdmin,
      isCurrentUser: currentPseudo ? player.pseudo.toLowerCase() === currentPseudo : false
    };
  });

  res.json({
    success: true,
    databaseId: db.databaseId,
    count: ranked.length,
    leaderboard: ranked
  });
});

// 3. Synchronisation d'un profil joueur (Téléphone <-> Ordinateur)
app.post('/api/player/sync', (req, res) => {
  const body = req.body || {};
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
    isAdmin = false
  } = body;

  const cleanPseudo = (pseudo || '').trim();
  if (!cleanPseudo) {
    res.status(400).json({ error: 'Pseudo obligatoire manquant' });
    return;
  }

  const db = loadDatabase();
  const normPseudo = cleanPseudo.toLowerCase();

  // Recherche du joueur existant par pseudo ou id
  let existingIndex = db.players.findIndex(
    (p: any) => p.pseudo.toLowerCase() === normPseudo || (id && p.id === id)
  );

  const stableId = id || `usr-${normPseudo.replace(/[^a-z0-9_-]/g, '_')}`;

  if (existingIndex >= 0) {
    const prev = db.players[existingIndex];
    db.players[existingIndex] = {
      ...prev,
      id: stableId,
      pseudo: cleanPseudo,
      // Mettre à jour avec les points transmis par le client
      totalPoints: totalPoints !== undefined ? Number(totalPoints) : (Number(prev.totalPoints) || 0),
      streakDays: streakDays !== undefined ? Number(streakDays) : (Number(prev.streakDays) || 1),
      multiplier: multiplier !== undefined ? Number(multiplier) : (Number(prev.multiplier) || 1),
      locationsCount: locationsCount !== undefined ? Number(locationsCount) : (Number(prev.locationsCount) || 0),
      badgesCount: badgesCount !== undefined ? Number(badgesCount) : (Number(prev.badgesCount) || 0),
      badgeTitle: isAdmin ? 'Admin' : (badgeTitle || prev.badgeTitle || 'Apprenti Météo'),
      minutesSpent: minutesSpent !== undefined ? Number(minutesSpent) : (Number(prev.minutesSpent) || 0),
      unlockedBadges: Array.from(new Set([...(prev.unlockedBadges || []), ...(unlockedBadges || [])])),
      isAdmin: Boolean(isAdmin !== undefined ? isAdmin : prev.isAdmin),
      lastActive: new Date().toISOString()
    };
  } else {
    db.players.push({
      id: stableId,
      pseudo: cleanPseudo,
      totalPoints: Number(totalPoints) || 0,
      streakDays: Number(streakDays) || 1,
      multiplier: Number(multiplier) || 1,
      locationsCount: Number(locationsCount) || 0,
      badgesCount: Number(badgesCount) || 0,
      badgeTitle: isAdmin ? 'Admin' : badgeTitle,
      minutesSpent: Number(minutesSpent) || 0,
      unlockedBadges: unlockedBadges || [],
      isAdmin: Boolean(isAdmin),
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    });
  }

  saveDatabase(db);

  // Calcul du nouveau rang du joueur
  const sorted = [...db.players].sort((a: any, b: any) => (b.totalPoints || 0) - (a.totalPoints || 0));
  const rank = sorted.findIndex((p: any) => p.pseudo.toLowerCase() === normPseudo) + 1;

  res.json({
    success: true,
    message: `Joueur ${cleanPseudo} synchronisé avec succès sur la base de données`,
    databaseId: db.databaseId,
    rank: rank > 0 ? rank : 1,
    totalPlayers: sorted.length
  });
});

// 4. Réinitialisation des points d'un joueur
app.post('/api/player/reset', (req, res) => {
  const { pseudo, id } = req.body || {};
  const normPseudo = (pseudo || '').toLowerCase().trim();
  if (!normPseudo && !id) {
    res.status(400).json({ error: 'Pseudo ou ID manquant' });
    return;
  }

  const db = loadDatabase();
  const player = db.players.find((p: any) => (normPseudo && p.pseudo.toLowerCase() === normPseudo) || (id && p.id === id));
  if (player) {
    player.totalPoints = 0;
    player.locationsCount = 0;
    player.badgesCount = 0;
    player.unlockedBadges = [];
    player.lastActive = new Date().toISOString();
    saveDatabase(db);
  }

  res.json({ success: true, message: 'Points réinitialisés avec succès' });
});

// 5. Suppression d'un joueur
app.post(['/api/player/delete', '/api/player/delete-account'], (req, res) => {
  const { pseudo, id } = req.body || {};
  const normPseudo = (pseudo || '').toLowerCase().trim();

  const db = loadDatabase();
  db.players = db.players.filter((p: any) => {
    if (normPseudo && p.pseudo && p.pseudo.toLowerCase() === normPseudo) return false;
    if (id && p.id === id) return false;
    return true;
  });
  saveDatabase(db);

  res.json({ success: true, message: 'Compte supprimé de la base de données' });
});

// 5b. Suppression de compte utilisateur par un Administrateur
app.post(['/api/admin/delete-user', '/api/admin/delete-player'], (req, res) => {
  const { pseudo, id } = req.body || {};
  const normPseudo = (pseudo || '').toLowerCase().trim();
  if (!normPseudo && !id) {
    res.status(400).json({ error: 'Pseudo ou identifiant obligatoire manquant' });
    return;
  }

  const db = loadDatabase();
  const initialCount = db.players.length;

  db.players = db.players.filter((p: any) => {
    if (normPseudo && p.pseudo && p.pseudo.toLowerCase() === normPseudo) return false;
    if (id && p.id === id) return false;
    return true;
  });

  // Nettoyer également de la liste des utilisateurs bannis s'il y figurait
  db.bannedUsers = (db.bannedUsers || []).filter((b: any) => {
    if (normPseudo && (b.pseudo || '').toLowerCase() === normPseudo) return false;
    return true;
  });

  saveDatabase(db);

  const isDeleted = initialCount !== db.players.length;
  res.json({
    success: true,
    deleted: isDeleted,
    message: isDeleted
      ? `Le compte de "${pseudo || id}" a été supprimé définitivement de la base de données.`
      : `Utilisateur "${pseudo || id}" non trouvé ou déjà supprimé.`,
    totalPlayers: db.players.length
  });
});

// 5c. Liste complète des utilisateurs enregistrés pour la gestion administrative
app.get('/api/admin/all-users', (req, res) => {
  const db = loadDatabase();
  const players = (db.players || []).map((p: any) => ({
    id: p.id,
    pseudo: p.pseudo,
    totalPoints: Number(p.totalPoints) || 0,
    streakDays: Number(p.streakDays) || 1,
    locationsCount: Number(p.locationsCount) || 0,
    badgesCount: Number(p.badgesCount) || 0,
    badgeTitle: p.badgeTitle || 'Apprenti Météo',
    isAdmin: !!p.isAdmin,
    createdAt: p.createdAt,
    lastActive: p.lastActive
  }));

  res.json({
    success: true,
    count: players.length,
    players,
    bannedCount: (db.bannedUsers || []).length
  });
});

// 5d. Routes Administrateur Centralisées
app.post('/api/admin/set-points', (req, res) => {
  const { pseudo, points } = req.body || {};
  if (!pseudo || points === undefined) {
    res.status(400).json({ error: 'Pseudo ou points manquants' });
    return;
  }
  const db = loadDatabase();
  const norm = pseudo.toLowerCase().trim();
  let player = db.players.find((p: any) => p.pseudo.toLowerCase() === norm);
  if (!player) {
    player = {
      id: `usr-${norm.replace(/[^a-z0-9_-]/g, '_')}`,
      pseudo: pseudo.trim(),
      totalPoints: Number(points),
      streakDays: 1,
      multiplier: 1,
      locationsCount: 0,
      badgesCount: 0,
      badgeTitle: 'Apprenti Météo',
      minutesSpent: 0,
      unlockedBadges: [],
      isAdmin: false,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    };
    db.players.push(player);
  } else {
    player.totalPoints = Number(points);
    player.lastActive = new Date().toISOString();
  }
  saveDatabase(db);
  res.json({ success: true, points: player.totalPoints, pseudo: player.pseudo });
});

app.post('/api/admin/set-streak', (req, res) => {
  const { pseudo, streakDays } = req.body || {};
  if (!pseudo || streakDays === undefined) {
    res.status(400).json({ error: 'Pseudo ou streakDays manquants' });
    return;
  }
  const db = loadDatabase();
  const norm = pseudo.toLowerCase().trim();
  const player = db.players.find((p: any) => p.pseudo.toLowerCase() === norm);
  if (player) {
    player.streakDays = Number(streakDays);
    player.lastActive = new Date().toISOString();
    saveDatabase(db);
  }
  res.json({ success: true, streakDays: Number(streakDays) });
});

app.post('/api/admin/unlock-all-badges', (req, res) => {
  const { pseudo } = req.body || {};
  if (!pseudo) {
    res.status(400).json({ error: 'Pseudo manquant' });
    return;
  }
  const db = loadDatabase();
  const norm = pseudo.toLowerCase().trim();
  const player = db.players.find((p: any) => p.pseudo.toLowerCase() === norm);
  if (player) {
    const allBadgeIds = ['sun', 'rain', 'storm', 'snow', 'frost', 'fog', 'gale', 'heat', 'altitude', 'night_stars'];
    player.unlockedBadges = allBadgeIds;
    player.badgesCount = allBadgeIds.length;
    saveDatabase(db);
  }
  res.json({ success: true });
});

app.post('/api/admin/ban', (req, res) => {
  const { pseudo, reason, durationHours } = req.body || {};
  if (!pseudo) {
    res.status(400).json({ error: 'Pseudo manquant' });
    return;
  }
  const db = loadDatabase();
  const norm = pseudo.toLowerCase().trim();
  db.bannedUsers = (db.bannedUsers || []).filter((b: any) => (b.pseudo || '').toLowerCase() !== norm);
  
  let bannedUntil = 'permanent';
  let durationLabel = 'Définitif';
  if (durationHours && durationHours !== 'permanent') {
    const expire = new Date(Date.now() + Number(durationHours) * 3600 * 1000);
    bannedUntil = expire.toISOString();
    durationLabel = `${durationHours}h`;
  }

  db.bannedUsers.push({
    pseudo: pseudo.trim(),
    bannedAt: new Date().toISOString(),
    bannedUntil,
    durationLabel,
    reason: reason || 'Non respect des règles'
  });
  saveDatabase(db);
  res.json({ success: true, banned: pseudo });
});

app.post('/api/admin/unban', (req, res) => {
  const { pseudo } = req.body || {};
  if (!pseudo) {
    res.status(400).json({ error: 'Pseudo manquant' });
    return;
  }
  const db = loadDatabase();
  const norm = pseudo.toLowerCase().trim();
  db.bannedUsers = (db.bannedUsers || []).filter((b: any) => (b.pseudo || '').toLowerCase() !== norm);
  saveDatabase(db);
  res.json({ success: true, unbanned: pseudo });
});

app.get('/api/admin/banned', (req, res) => {
  const db = loadDatabase();
  res.json({ success: true, bannedUsers: db.bannedUsers || [] });
});

app.post('/api/admin/announcement', (req, res) => {
  const announcement = req.body;
  const db = loadDatabase();
  db.adminAnnouncement = announcement;
  saveDatabase(db);
  res.json({ success: true, announcement: db.adminAnnouncement });
});

app.get('/api/admin/announcement', (req, res) => {
  const db = loadDatabase();
  res.json({ success: true, announcement: db.adminAnnouncement || null });
});

// 6. Signalements météo collaboratifs du jour
app.get('/api/reports', (req, res) => {
  const db = loadDatabase();
  const today = new Date().toISOString().split('T')[0];

  // Garder uniquement les signalements postés aujourd'hui
  const activeReports = (db.communityReports || []).filter((r: any) => {
    try {
      return r.timestamp && r.timestamp.startsWith(today);
    } catch {
      return false;
    }
  });

  res.json({
    success: true,
    count: activeReports.length,
    reports: activeReports
  });
});

// 7. Publier un signalement météo citoyen
app.post('/api/reports', (req, res) => {
  const db = loadDatabase();
  const report = req.body || {};

  const newReport = {
    id: report.id || `rep-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    city: report.city || 'Commune',
    department: report.department || '',
    latitude: Number(report.latitude) || 48.8,
    longitude: Number(report.longitude) || 2.3,
    weatherCode: report.weatherCode || 'sun',
    weatherLabel: report.weatherLabel || 'Beau temps',
    emoji: report.emoji || '☀️',
    temperature: Number(report.temperature) || 20,
    intensity: report.intensity || 'MODÉRÉE',
    comment: report.comment || '',
    reporterPseudo: report.reporterPseudo || 'Anonyme',
    timestamp: report.timestamp || new Date().toISOString(),
    confirmations: Number(report.confirmations) || 1
  };

  db.communityReports = [newReport, ...(db.communityReports || [])].slice(0, 300);
  saveDatabase(db);

  res.json({
    success: true,
    message: 'Signalement enregistré dans la base de données',
    report: newReport
  });
});

// 8. Confirmer un signalement
app.post('/api/reports/:id/confirm', (req, res) => {
  const { id } = req.params;
  const db = loadDatabase();
  const target = (db.communityReports || []).find((r: any) => r.id === id);
  if (target) {
    target.confirmations = (Number(target.confirmations) || 1) + 1;
    saveDatabase(db);
    res.json({ success: true, confirmations: target.confirmations });
  } else {
    res.status(404).json({ error: 'Signalement non trouvé' });
  }
});

// 9. Messages du salon de discussion citoyen
app.get('/api/discussion/messages', (req, res) => {
  const db = loadDatabase();
  const channel = req.query.channel as string;
  let messages = db.discussionMessages || [];
  if (channel) {
    messages = messages.filter((m: any) => m.channelId === channel);
  }
  res.json({ success: true, messages });
});

// 10. Poster un message dans le salon de discussion
app.post('/api/discussion/messages', (req, res) => {
  const db = loadDatabase();
  const msg = req.body || {};
  if (!msg.content || !msg.author) {
    res.status(400).json({ error: 'Contenu ou auteur manquant' });
    return;
  }

  const newMsg = {
    id: msg.id || `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    channelId: msg.channelId || 'general',
    author: msg.author,
    authorBadge: msg.authorBadge || 'Observateur Citoyen',
    isAdmin: Boolean(msg.isAdmin),
    timestamp: msg.timestamp || "Aujourd'hui à " + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    content: msg.content,
    locationTag: msg.locationTag || '',
    weatherTag: msg.weatherTag || '',
    reactions: msg.reactions || { thumbsUp: 0, storm: 0, fire: 0, rain: 0, snow: 0 }
  };

  db.discussionMessages = [...(db.discussionMessages || []), newMsg].slice(-200);
  saveDatabase(db);

  res.json({ success: true, message: newMsg });
});

// 11. Réagir à un message de discussion
app.post('/api/discussion/messages/:id/reaction', (req, res) => {
  const { id } = req.params;
  const { reaction } = req.body || {};
  const db = loadDatabase();
  const msg = (db.discussionMessages || []).find((m: any) => m.id === id);
  if (msg && reaction && msg.reactions && msg.reactions[reaction] !== undefined) {
    msg.reactions[reaction] = (msg.reactions[reaction] || 0) + 1;
    saveDatabase(db);
    res.json({ success: true, reactions: msg.reactions });
  } else {
    res.status(404).json({ error: 'Message ou réaction non trouvée' });
  }
});

// 12. Supprimer un message de discussion (Admin & Auteur)
app.post(['/api/discussion/messages/:id/delete', '/api/discussion/messages/:id/remove'], (req, res) => {
  const { id } = req.params;
  const db = loadDatabase();
  const initialLength = (db.discussionMessages || []).length;
  db.discussionMessages = (db.discussionMessages || []).filter((m: any) => m.id !== id);
  saveDatabase(db);
  res.json({ success: true, deleted: initialLength !== db.discussionMessages.length });
});

// 13. Statut détaillé et auto-réparation de la base de données
app.get('/api/database/status', (req, res) => {
  const db = loadDatabase();
  res.json({
    status: 'online',
    healthy: true,
    totalPlayers: (db.players || []).length,
    totalReports: (db.communityReports || []).length,
    totalMessages: (db.discussionMessages || []).length,
    totalBanned: (db.bannedUsers || []).length,
    announcementActive: !!db.adminAnnouncement,
    updatedAt: db.updatedAt
  });
});

app.post('/api/database/repair', (req, res) => {
  const db = loadDatabase();
  if (!Array.isArray(db.players)) db.players = [];
  if (!Array.isArray(db.communityReports)) db.communityReports = [];
  if (!Array.isArray(db.discussionMessages)) db.discussionMessages = [];
  if (!Array.isArray(db.bannedUsers)) db.bannedUsers = [];
  saveDatabase(db);
  res.json({ success: true, message: 'Base de données vérifiée et réparée avec succès.' });
});

// -------------------------------------------------------------
// DÉMARRAGE DU SERVEUR EXPRESS & MIDDLEWARE VITE
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Serveur Instant Météo] En écoute sur le port ${PORT} (Database ID: ${DATABASE_ID})`);
  });
}

startServer();
